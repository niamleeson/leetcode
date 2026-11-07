"""Learning-mode execution; loaded after the canonical fixture adapter module.

The adapters supply LeetCode's nodes and input/output conversions, never a
solution body. User code runs in fresh globals for each practice case. Trace
display limits do not disable execution limits or the worker's outer timeout.
"""
import contextlib
import io
import time
import traceback

LOGIC_FILENAME = '<leetcode-python-solution>'


class LogicExecutionLimit(Exception):
    pass


def short_value(value, depth=0, seen=None):
    """Bounded snapshots without calling a user object's __repr__."""
    if value is None or isinstance(value, (bool, int, float)):
        return str(value)[:160]
    if isinstance(value, str):
        return repr(value[:120]) + ('…' if len(value) > 120 else '')
    if depth >= 3:
        return '<' + type(value).__name__ + '>'
    seen = set() if seen is None else seen
    if id(value) in seen:
        return '<circular ' + type(value).__name__ + '>'
    seen = seen | {id(value)}
    describe = lambda item: short_value(item, depth + 1, seen)
    if isinstance(value, (list, tuple, collections.deque)):
        values = list(itertools.islice(value, 8))
        text = ', '.join(describe(item) for item in values)
        if len(value) > 8:
            text += ', …'
        if isinstance(value, tuple):
            return '(' + text + (',' if len(value) == 1 else '') + ')'
        if isinstance(value, collections.deque):
            limit = ', maxlen=' + str(value.maxlen) if value.maxlen is not None else ''
            return 'deque([' + text + ']' + limit + ')'
        return '[' + text + ']'
    if isinstance(value, (set, frozenset)):
        values = list(itertools.islice(value, 8))
        text = '{' + ', '.join(describe(item) for item in values) + (', …' if len(value) > 8 else '') + '}'
        if isinstance(value, frozenset):
            return 'frozenset(' + (text if value else '') + ')'
        return text if value else 'set()'
    if isinstance(value, dict):
        items = list(itertools.islice(value.items(), 8))
        return '{' + ', '.join(describe(key) + ': ' + describe(item) for key, item in items) + (', …' if len(value) > 8 else '') + '}'
    try:
        fields = object.__getattribute__(value, '__dict__')
    except (AttributeError, TypeError):
        return '<' + type(value).__name__ + '>'
    return type(value).__name__ + '(' + ', '.join(str(key) + '=' + describe(item) for key, item in list(fields.items())[:6]) + ')'


class LogicRecorder(Recorder):
    def __init__(self, source, max_frames=160, max_events=500000, time_limit=2.0):
        super().__init__(source, LOGIC_FILENAME)
        self.max_frames, self.max_events = max_frames, max_events
        self.events = 0
        self.truncated = False
        self.deadline = time.monotonic() + time_limit
        self.exception_object, self.exception_frame = None, None

    def frame_snapshot(self, frame, line, kind='statement', value=None):
        item = {
            'line': line, 'kind': kind, 'functionName': frame.f_code.co_name,
            'locals': {name: short_value(item) for name, item in list(frame.f_locals.items())[:32]
                       if not name.startswith('__') and not isinstance(item, (types.ModuleType, type)) and not callable(item)},
            'stack': [item.f_code.co_name for item in self.frames],
        }
        if kind == 'return':
            item['value'] = short_value(value)
        return item

    def append(self, frame, line, kind='statement', value=None):
        item = self.frame_snapshot(frame, line, kind, value)
        if len(self.steps) < self.max_frames:
            self.steps.append(item)
        else:
            # Preserve the first frames and the most recent actual frame.
            self.truncated = True
            self.steps[-1] = item

    def trace(self, frame, event, arg):
        if frame.f_code.co_filename != self.filename:
            return None
        self.events += 1
        if self.events > self.max_events:
            error = LogicExecutionLimit('Execution stopped after too many Python steps. Check whether your loop makes progress.')
            self.exception_object = error
            self.exception_frame = self.frame_snapshot(frame, frame.f_lineno, 'error')
            raise error
        if self.events % 64 == 0 and time.monotonic() > self.deadline:
            error = LogicExecutionLimit('This practice case took too long. Check your loops or try a more efficient approach.')
            self.exception_object = error
            self.exception_frame = self.frame_snapshot(frame, frame.f_lineno, 'error')
            raise error
        if event == 'exception' and self.exception_object is not arg[1]:
            self.exception_object = arg[1]
            self.exception_frame = self.frame_snapshot(frame, frame.f_lineno, 'error')
        # Class/module definitions and comprehensions still consume the event
        # budget, although their internal scaffolding is not shown as frames.
        function_key = (frame.f_code.co_name, frame.f_code.co_firstlineno)
        if not frame.f_code.co_flags & inspect.CO_OPTIMIZED or function_key not in self.function_lines:
            return self.trace
        return super().trace(frame, event, arg)


class LogicOutput(io.StringIO):
    def __init__(self):
        super().__init__()
        self.remaining = 4000

    def write(self, value):
        length = len(value)
        if self.remaining > 0:
            super().write(value[:self.remaining])
            self.remaining -= min(length, self.remaining)
        return length


def same_output(actual, expected):
    if isinstance(expected, bool) or isinstance(actual, bool):
        return type(actual) is type(expected) and actual == expected
    if isinstance(expected, list):
        return isinstance(actual, list) and len(actual) == len(expected) and all(same_output(a, b) for a, b in zip(actual, expected))
    if isinstance(expected, dict):
        return isinstance(actual, dict) and actual.keys() == expected.keys() and all(same_output(actual[key], value) for key, value in expected.items())
    return actual == expected


def validate_logic_result(actual, fixture, problem_id):
    expected, args = fixture['expected'], fixture.get('args', [])
    compare = fixture.get('compare')
    ordered = lambda values: sorted(values, key=lambda value: json.dumps(value, sort_keys=True))
    integer = lambda value: isinstance(value, int) and not isinstance(value, bool)
    if problem_id in (1, 167):
        if not isinstance(actual, list) or len(actual) != 2 or not all(integer(value) for value in actual):
            return False
        first, second = [value - (1 if problem_id == 167 else 0) for value in actual]
        nums, target = args
        return first != second and 0 <= first < len(nums) and 0 <= second < len(nums) and nums[first] + nums[second] == target
    if problem_id == 347:
        if not isinstance(actual, list) or len(actual) != args[1] or not all(integer(value) for value in actual):
            return False
        counts = collections.Counter(args[0])
        threshold = sorted(counts.values(), reverse=True)[args[1] - 1]
        return len(set(actual)) == len(actual) and all(counts[value] >= threshold for value in actual) and all(value in actual for value, count in counts.items() if count > threshold)
    if problem_id == 973:
        if not isinstance(actual, list) or len(actual) != args[1]:
            return False
        if any(not isinstance(point, list) or len(point) != 2 or not all(integer(value) for value in point) for point in actual):
            return False
        available = collections.Counter(tuple(point) for point in args[0])
        try:
            chosen = collections.Counter(tuple(point) for point in actual)
            distances = sorted(x*x + y*y for x, y in actual)
        except (TypeError, ValueError):
            return False
        return not (chosen - available) and distances == sorted(x*x + y*y for x, y in args[0])[:args[1]]
    if problem_id == 269:
        if not isinstance(actual, str):
            return False
        if expected == '':
            return actual == ''
        letters = set(''.join(args[0]))
        if set(actual) != letters or len(actual) != len(letters):
            return False
        order = {letter: index for index, letter in enumerate(actual)}
        for first, second in zip(args[0], args[0][1:]):
            if first.startswith(second) and len(first) > len(second):
                return False
            for a, b in zip(first, second):
                if a != b:
                    if order[a] >= order[b]:
                        return False
                    break
        return True
    if problem_id == 1489:
        return isinstance(actual, list) and len(actual) == 2 and all(same_output(ordered(a), ordered(b)) for a, b in zip(actual, expected))
    if compare == 'unordered':
        return isinstance(actual, list) and same_output(ordered(actual), ordered(expected))
    if compare == 'groups':
        return isinstance(actual, list) and all(isinstance(group, list) for group in actual) and same_output(ordered([ordered(group) for group in actual]), ordered([ordered(group) for group in expected]))
    if compare == 'accounts':
        group = lambda items: ordered([[row[0], *sorted(row[1:])] for row in items])
        return isinstance(actual, list) and all(isinstance(row, list) and row for row in actual) and same_output(group(actual), group(expected))
    if compare == 'topological':
        if not expected:
            return actual == []
        count, edges = args
        if not isinstance(actual, list) or len(actual) != count or not all(integer(value) for value in actual) or set(actual) != set(range(count)):
            return False
        positions = {value: index for index, value in enumerate(actual)}
        return all(positions[before] < positions[after] for after, before in edges)
    if compare == 'matrixConditions':
        if not expected:
            return actual == []
        count, rows, columns = args
        if not isinstance(actual, list) or len(actual) != count or any(not isinstance(row, list) or len(row) != count for row in actual):
            return False
        positions = {}
        for r, row in enumerate(actual):
            for c, value in enumerate(row):
                if not integer(value) or value < 0 or value > count or value != 0 and value in positions:
                    return False
                if value != 0:
                    positions[value] = (r, c)
        return set(positions) == set(range(1, count+1)) and all(positions[a][0] < positions[b][0] for a, b in rows) and all(positions[a][1] < positions[b][1] for a, b in columns)
    if compare == 'longestPalindrome':
        return isinstance(actual, str) and len(actual) == len(expected) and actual in args[0] and actual == actual[::-1]
    if compare == 'reorganized':
        return isinstance(actual, str) and (actual == '' if expected == '' else collections.Counter(actual) == collections.Counter(args[0]) and all(a != b for a, b in zip(actual, actual[1:])))
    if compare == 'happyString':
        if not isinstance(actual, str):
            return False
        maximum, rest = max(args), sum(args) - max(args)
        return len(actual) == rest + min(maximum, 2*(rest+1)) and set(actual) <= set('abc') and all(actual.count(letter) <= count for letter, count in zip('abc', args)) and all(letter*3 not in actual for letter in 'abc')
    return same_output(actual, expected)


def logic_execute(source, fixture, problem_id, recorder):
    random.seed(fixture.get('seed', 250))
    Node = node_class(problem_id)
    namespace = {'__name__': '__logic_submission__', 'ListNode': ListNode, 'TreeNode': TreeNode,
                 'Node': Node, '_Node': Node, 'MountainArray': MountainArray,
                 'guess': lambda n: 0 if n == fixture['pick'] else 1 if n < fixture['pick'] else -1}
    for module in (typing, collections, functools, heapq, math, itertools):
        namespace.update({key: value for key, value in vars(module).items() if not key.startswith('_')})
    code = compile(source, LOGIC_FILENAME, 'exec', flags=__future__.annotations.compiler_flag)
    exec(code, namespace)
    args = [convert(value, Node) for value in fixture.get('args', [])]
    for index in fixture.get('nodeArgs', []):
        queue = [args[0]]
        for node in queue:
            if node is None:
                continue
            if node.val == args[index]:
                args[index] = node
                break
            queue.extend((node.left, node.right))
        else:
            args[index] = None

    def invoke(function, values, instance=None):
        recorder.roots = dict(inspect.signature(function).bind(*values).arguments)
        if instance is not None:
            recorder.roots = {'instance': instance, **recorder.roots}
        return function(*values)

    entry = fixture['entry']
    if fixture.get('operations') is not None:
        instance = invoke(namespace[entry], args)
        result = [None]
        for method, values in fixture['operations']:
            result.append(normalize(invoke(getattr(instance, method), [convert(value, Node) for value in values], instance)))
        return result
    definitions = ast.parse(source).body
    functions = {node.name for node in definitions if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
    classes = [namespace[node.name] for node in definitions if isinstance(node, ast.ClassDef)]
    if entry in functions:
        function, instance = namespace[entry], None
    else:
        candidates = [value for value in classes if hasattr(value, entry)]
        if not candidates:
            raise ValueError('Keep the ' + entry + ' function or method so the practice tests can call it.')
        instance = candidates[0]()
        function = getattr(instance, entry)
    returned = invoke(function, args)
    if fixture.get('roundtrip'):
        other = fixture['roundtrip']
        returned = invoke(getattr(instance, other) if instance is not None else namespace[other], [returned])
    if 'prefix' in fixture:
        if not isinstance(returned, int) or isinstance(returned, bool) or not 0 <= returned <= len(args[0]):
            raise AssertionError('Return the number of elements in the updated prefix.')
        actual_prefix = args[0][:returned]
        if problem_id == 27:
            correct = collections.Counter(actual_prefix) == collections.Counter(value for value in fixture['args'][0] if value != fixture['args'][1])
        else:
            correct = actual_prefix == fixture['prefix']
        if not correct:
            raise AssertionError('The returned length does not describe the correct in-place array prefix.')

    def collect(root):
        queue, seen = [root], set()
        for node in queue:
            if node is None or id(node) in seen:
                continue
            seen.add(id(node))
            queue.extend((getattr(node, 'next', None), getattr(node, 'random', None)))
            queue.extend(getattr(node, 'neighbors', []))
        return seen
    if fixture.get('distinctClone') and collect(args[0]) & collect(returned):
        raise AssertionError('The result reuses input nodes. Build a separate clone.')
    value = args[fixture['resultArg']] if 'resultArg' in fixture else returned
    if fixture.get('output') in ('list', 'randomList'):
        node, seen = value, set()
        while node is not None:
            if id(node) in seen:
                raise AssertionError('The returned linked list contains a cycle.')
            seen.add(id(node))
            node = node.next
    if fixture.get('output') == 'tree':
        queue, seen = [value], set()
        for node in queue:
            if node is None:
                continue
            if id(node) in seen:
                raise AssertionError('The returned tree contains a cycle or a shared child.')
            seen.add(id(node))
            queue.extend((node.left, node.right))
    return normalize(value, fixture.get('output'), len(fixture['args'][0]) if fixture.get('output') == 'quad' else None)


def run_logic(request):
    source, problem_id = request['code'], request['problemId']
    results = []
    limits = request.get('_testLimits', {})
    for fixture in request['fixtures']:
        output, recorder = LogicOutput(), None
        result = {'name': fixture['name'], 'input': fixture.get('args', []), 'expected': fixture['expected'], 'passed': False}
        try:
            recorder = LogicRecorder(source, max_frames=limits.get('maxFrames', 160), max_events=limits.get('maxEvents', 500000), time_limit=limits.get('timeLimit', 2.0))
            previous_trace = sys.gettrace()
            try:
                with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
                    sys.settrace(recorder.trace)
                    actual = logic_execute(source, fixture, problem_id, recorder)
            finally:
                sys.settrace(previous_trace)
            # Round-trip through JSON before comparison to guarantee that the
            # worker can return this value and to reject nonfinite numbers.
            actual = json.loads(json.dumps(actual, allow_nan=False))
            result['actual'] = actual
            result['passed'] = validate_logic_result(actual, fixture, problem_id)
        except BaseException as error:
            line = getattr(error, 'lineno', None)
            frames = traceback.extract_tb(error.__traceback__)
            for frame in frames:
                if frame.filename == LOGIC_FILENAME:
                    line = frame.lineno
            result['error'] = {'type': type(error).__name__, 'message': str(error)[:500], **({'line': line} if line else {})}
            if recorder and line:
                last = recorder.exception_frame if recorder.exception_object is error else None
                if last is None:
                    last = {'line': line, 'kind': 'error', 'functionName': '<module>', 'locals': {}, 'stack': []}
                if len(recorder.steps) < recorder.max_frames:
                    recorder.steps.append(last)
                else:
                    recorder.steps[-1] = last
        result.update(trace=recorder.steps if recorder else [], traceTruncated=recorder.truncated if recorder else False,
                      executionEvents=recorder.events if recorder else 0, stdout=output.getvalue())
        results.append(result)
    return {'tests': results, 'passed': sum(result['passed'] for result in results), 'total': len(results)}


def run_logic_json(request_json):
    return json.dumps(run_logic(json.loads(request_json)), allow_nan=False, separators=(',', ':'))

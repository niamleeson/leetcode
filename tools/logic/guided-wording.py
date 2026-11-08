"""Clear, source-grounded wording for implementation cards.

Only prompts and feedback change. Executable alternatives and recorded proofs
are left untouched. JavaScript source facts are prepared in one Babel pass.
"""
import ast
import copy
import json
import io
import tokenize
from pathlib import Path
import re
import subprocess

_JS_FACTS = {}
_PY_FACTS = {}
QUOTES = ('“', '”')

def quoted(value):
    return '“' + str(value) + '”'


def prepare_wording(rows):
    global _JS_FACTS
    result = subprocess.run(['node', str(Path(__file__).with_name('guided-wording-javascript.cjs'))],
                            input=json.dumps([{'id': row['id'], 'javascript': row['javascript'], 'fixtures': row.get('fixtures', [])} for row in rows]),
                            capture_output=True, text=True, check=True)
    _JS_FACTS = json.loads(result.stdout)
    _PY_FACTS.clear()


def python_facts(source):
    if source in _PY_FACTS:
        return _PY_FACTS[source]
    tree = ast.parse(source)
    parents = {child: node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
    raw = lambda node: ast.get_source_segment(source, node).strip() if node is not None else ''
    types, ambiguous = {}, set()
    def scope_key(node):
        text = raw(node)
        parent = node
        cls = None
        scope = tree
        while parent in parents:
            parent = parents[parent]
            if isinstance(parent, (ast.FunctionDef, ast.AsyncFunctionDef)) and scope is tree:
                scope = parent
            if isinstance(parent, ast.ClassDef): cls = parent
        return (id(cls) if text.startswith('self.') and cls else id(scope), text)
    def lookup(node):
        key = scope_key(node)
        return '' if key in ambiguous else types.get(key, '')
    def record(node, value):
        key = scope_key(node)
        if not value or key in types and types[key] != value:
            ambiguous.add(key); types.pop(key, None)
        elif key not in ambiguous: types[key] = value
    def kind(node):
        if isinstance(node, (ast.List, ast.ListComp)): return 'list'
        if isinstance(node, (ast.Set, ast.SetComp)): return 'set'
        if isinstance(node, (ast.Dict, ast.DictComp)): return 'dict'
        if isinstance(node, ast.Tuple): return 'tuple'
        if isinstance(node, ast.Constant):
            if isinstance(node.value, bool): return 'boolean'
            if isinstance(node.value, (int, float)): return 'number'
            if isinstance(node.value, str): return 'string'
        if isinstance(node, ast.Compare) or isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not): return 'boolean'
        if isinstance(node, ast.BinOp):
            left, right = kind(node.left), kind(node.right)
            if left == right and left == 'number': return 'number'
            if isinstance(node.op, ast.Add) and left == right and left in ('string','list','tuple'): return left
        if isinstance(node, ast.Call):
            called = raw(node.func)
            if called in ('list', 'set', 'dict', 'tuple', 'deque', 'defaultdict', 'Counter'): return called
            if called in ('len', 'sum', 'abs', 'int', 'float'): return 'number'
            if called in ('TreeNode', 'ListNode', 'Node'): return 'node'
        if isinstance(node, (ast.Name, ast.Attribute)):
            if isinstance(node, ast.Attribute) and node.attr in ('left','right','next','prev') and kind(node.value) == 'node': return 'node'
            return lookup(node)
        return ''
    # Function-local names never borrow types from another helper. An annotation
    # or unambiguous constructor can justify a noun; otherwise keep the exact
    # condition instead of guessing whether a value is a node or a container.
    for function in (node for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))):
        for argument in function.args.args:
            annotation = raw(argument.annotation)
            value = 'node' if re.search(r'\b(?:TreeNode|ListNode|Node)\b',annotation) else 'list' if re.search(r'\b(?:List|list)\b',annotation) else 'dict' if re.search(r'\b(?:Dict|dict)\b',annotation) else 'string' if annotation == 'str' else 'number' if annotation in ('int','float') else 'boolean' if annotation == 'bool' else ''
            if value: types[(id(function),argument.arg)] = value
    for node in sorted((node for node in ast.walk(tree) if isinstance(node, (ast.Assign, ast.AnnAssign, ast.AugAssign))), key=lambda node:node.lineno):
        if isinstance(node, ast.AugAssign):
            left, right = kind(node.target), kind(node.value)
            record(node.target, left if left == right and left in ('number','list','string') else '')
        else:
            for target in node.targets if isinstance(node, ast.Assign) else [node.target]:
                record(target, kind(node.value))
    def expression(node):
        if node is None: return 'no value'
        if isinstance(node, ast.Name): return quoted(node.id)
        if isinstance(node, ast.Constant):
            if node.value is None: return 'None'
            if isinstance(node.value, bool): return str(node.value)
            if node.value == '': return 'an empty string'
            return repr(node.value)
        if isinstance(node, ast.List) and not node.elts: return 'an empty list'
        if isinstance(node, ast.Dict) and not node.keys: return 'an empty dictionary'
        if isinstance(node, ast.Set) and not node.elts: return 'an empty set'
        if isinstance(node, ast.Call):
            called = raw(node.func)
            arguments = ['(' + expression(value) + ')' if isinstance(value, (ast.BinOp, ast.IfExp)) else expression(value) for value in node.args]
            if called == 'len' and arguments: return 'the length of ' + arguments[0]
            if called in ('max', 'min') and arguments: return ('the maximum' if called == 'max' else 'the minimum') + ' of ' + ', '.join(arguments)
            if called == 'abs' and arguments: return 'the absolute value of ' + arguments[0]
            if called in ('set', 'list', 'dict', 'deque') and not node.args: return 'an empty ' + {'dict':'dictionary', 'deque':'queue'}.get(called, called)
            if called == 'sum' and arguments: return 'the sum of ' + arguments[0]
            if isinstance(node.func, ast.Attribute):
                method, target = node.func.attr, expression(node.func.value)
                if method == 'join' and arguments: return arguments[0] + ' joined with ' + target
                if method == 'split': return target + ' split at ' + (arguments[0] if arguments else 'whitespace')
                if method == 'get' and arguments: return 'the value for ' + arguments[0] + ' in ' + target + (' (or ' + arguments[1] + ' if absent)' if len(arguments) > 1 else '')
                if method == 'pop' and not arguments and lookup(node.func.value) in ('list', 'deque'):
                    return 'the last item removed from ' + target
                if method == 'popleft': return 'the first item removed from ' + target
        if isinstance(node, ast.BinOp) and isinstance(node.op, (ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv, ast.Mod)):
            if isinstance(node.op, ast.Mult) and isinstance(node.left, ast.List) and len(node.left.elts) == 1:
                return 'a list of ' + ('(' + expression(node.right) + ')' if isinstance(node.right, ast.BinOp) else expression(node.right)) + ' copies of ' + expression(node.left.elts[0])
            operator = {ast.Add:' plus ', ast.Sub:' minus ', ast.Mult:' times ', ast.Div:' divided by ', ast.FloorDiv:' divided by ', ast.Mod:' modulo '}[type(node.op)]
            left = '(' + expression(node.left) + ')' if isinstance(node.left, ast.BinOp) else expression(node.left)
            right = '(' + expression(node.right) + ')' if isinstance(node.right, ast.BinOp) else expression(node.right)
            value = left + operator + right
            return value + (' rounded down' if isinstance(node.op, ast.FloorDiv) else '')
        if isinstance(node, ast.IfExp): return expression(node.body) + ' when ' + condition(node.test) + '; otherwise ' + expression(node.orelse)
        return quoted(re.sub(r'\s+', ' ', raw(node)))
    def truth(node, negative=False):
        node_type = lookup(node)
        if node_type in ('list','set','dict','tuple','deque','defaultdict','Counter','string'):
            return expression(node) + (' is empty' if negative else ' is not empty')
        if node_type == 'number': return expression(node) + (' is zero' if negative else ' is not zero')
        if node_type == 'boolean': return expression(node) + (' is False' if negative else ' is True')
        if node_type == 'node': return expression(node) + (' is missing' if negative else ' exists')
        return 'the condition ' + quoted(('not ' if negative else '') + raw(node)) + ' is true'
    def condition(node):
        if isinstance(node, ast.BoolOp):
            return (' and ' if isinstance(node.op, ast.And) else ' or ').join('(' + condition(value) + ')' if isinstance(value, ast.BoolOp) else condition(value) for value in node.values)
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not):
            if isinstance(node.operand, (ast.Name, ast.Attribute)): return truth(node.operand, True)
            return 'not (' + condition(node.operand) + ')'
        if isinstance(node, ast.Compare):
            operators = {ast.Eq:'equals',ast.NotEq:'differs from',ast.Lt:'is less than',ast.LtE:'is at most',ast.Gt:'is greater than',ast.GtE:'is at least',ast.In:'is present in',ast.NotIn:'is absent from',ast.Is:'is',ast.IsNot:'is not'}
            pieces = []
            left = node.left
            for operator, right in zip(node.ops, node.comparators):
                pieces.append(expression(left) + ' ' + operators[type(operator)] + ' ' + expression(right))
                left = right
            return ' and '.join(pieces)
        if isinstance(node, (ast.Name, ast.Attribute)): return truth(node)
        return expression(node) + ' is true'
    def references(node):
        values = []
        for child in ast.walk(node):
            if isinstance(child, ast.Name) and child.id not in {'len','range','enumerate','zip','min','max','sum','abs','True','False','None'} and child.id not in values:
                values.append(child.id)
        return values[:4]
    def call_action(node):
        if not isinstance(node, ast.Call): return 'Evaluate ' + expression(node) + '.'
        args = [expression(arg) for arg in node.args]
        name = raw(node.func)
        if name in ('heapq.heappush', 'heappush') and len(args) == 2:
            return 'Add ' + args[1] + ' to the min-heap ' + args[0] + '.'
        if name in ('heapq.heappop', 'heappop') and args:
            return 'Remove the smallest item from the min-heap ' + args[0] + '.'
        if name in ('heapq.heapify', 'heapify') and args:
            return 'Arrange ' + args[0] + ' as a min-heap, with its smallest item at the top.'
        if isinstance(node.func, ast.Attribute):
            target, method = expression(node.func.value), node.func.attr
            if method in ('append', 'add', 'appendleft') and args:
                return ('Append ' if method == 'append' else 'Add ') + args[0] + (' to the front of ' if method == 'appendleft' else ' to ') + target + '.'
            if method == 'extend' and args: return 'Append every item from ' + args[0] + ' to ' + target + '.'
            if method == 'popleft': return 'Remove the first item from ' + target + '.'
            if method == 'pop':
                container = lookup(node.func.value)
                item = 'the entry for ' + args[0] if args and container in ('dict','defaultdict') else 'the item at ' + args[0] if args else 'the last item' if container in ('list','deque') else 'an item'
                return 'Remove ' + item + ' from ' + target + '.'
            if method in ('remove','discard') and args: return 'Remove ' + args[0] + ' from ' + target + (', if it is present.' if method == 'discard' else '.')
            if method == 'reverse': return 'Reverse the order of ' + target + '.'
            if method == 'sort': return 'Sort ' + target + (' with ' + ', '.join(raw(keyword) for keyword in node.keywords) if node.keywords else ' in ascending order') + '.'
            if method == 'clear': return 'Remove every entry from ' + target + '.'
        return 'Call ' + quoted(name) + ' with ' + (', '.join(args) if args else 'no arguments') + '.'
    facts = []
    for node in ast.walk(tree):
        category, subject, inputs, description = '', '', [], ''
        if isinstance(node, (ast.Assign, ast.AnnAssign)):
            category = 'assign'
            targets = node.targets if isinstance(node, ast.Assign) else [node.target]
            subject = ', '.join(raw(target) for target in targets)
            if len(targets) == 1 and isinstance(targets[0], ast.Tuple) and isinstance(node.value, ast.Tuple) and len(targets[0].elts) == 2 and [raw(value) for value in targets[0].elts] == [raw(value) for value in reversed(node.value.elts)]:
                description = 'Swap ' + expression(targets[0].elts[0]) + ' and ' + expression(targets[0].elts[1]) + '.'
            elif len(targets) == 1 and isinstance(targets[0], (ast.Tuple, ast.List)) and isinstance(node.value, (ast.Tuple, ast.List)) and len(targets[0].elts) == len(node.value.elts):
                description = ' '.join('Set ' + expression(target) + ' to ' + expression(value) + '.' for target, value in zip(targets[0].elts, node.value.elts)) + ' Calculate these values before writing any of the targets.'
            else: description = 'Set ' + quoted(subject) + ' to ' + expression(node.value) + '.'
        elif isinstance(node, ast.AugAssign):
            category, subject = 'assign', raw(node.target)
            description = ('Add ' + expression(node.value) + ' to ' + expression(node.target) + '.' if isinstance(node.op, ast.Add) else 'Subtract ' + expression(node.value) + ' from ' + expression(node.target) + '.' if isinstance(node.op, ast.Sub) else 'Multiply ' + expression(node.target) + ' by ' + expression(node.value) + '.' if isinstance(node.op, ast.Mult) else 'Divide ' + expression(node.target) + ' by ' + expression(node.value) + '.' if isinstance(node.op, ast.Div) else 'Replace ' + expression(node.target) + ' using ' + quoted(raw(node)) + '.')
            if isinstance(node.op, ast.Add) and isinstance(node.value, ast.IfExp):
                def addition(value):
                    if isinstance(value, ast.UnaryOp) and isinstance(value.op, ast.USub):
                        return 'subtract ' + expression(value.operand) + ' from ' + expression(node.target)
                    return 'add ' + expression(value) + ' to ' + expression(node.target)
                description = 'If ' + condition(node.value.test) + ', ' + addition(node.value.body) + '; otherwise ' + addition(node.value.orelse) + '.'
        elif isinstance(node, (ast.If, ast.While)):
            category = 'if' if isinstance(node, ast.If) else 'while'
            inputs = references(node.test); subject = ', '.join(inputs)
            description = ('Take this branch' if category == 'if' else 'Keep repeating the loop') + ' when ' + condition(node.test) + '.'
        elif isinstance(node, (ast.For, ast.AsyncFor)):
            category, subject, inputs = 'for', raw(node.target), references(node.iter)
            if isinstance(node.iter, ast.Call) and raw(node.iter.func) == 'range':
                arguments = node.iter.args
                start = expression(arguments[0]) if len(arguments) > 1 else '0'
                stop = expression(arguments[1]) if len(arguments) > 1 else expression(arguments[0])
                step = expression(arguments[2]) if len(arguments) > 2 else '1'
                description = 'Start ' + quoted(subject) + ' at ' + start + ', change it by ' + step + ' each time, and stop before ' + stop + '.'
            elif isinstance(node.iter, ast.Call) and raw(node.iter.func) == 'enumerate' and node.iter.args:
                description = 'Visit each index-and-value pair from ' + expression(node.iter.args[0]) + ', storing it as ' + quoted(subject) + '.'
            else: description = 'Visit each item from ' + expression(node.iter) + ', storing it as ' + quoted(subject) + '.'
        elif isinstance(node, ast.Return):
            category, subject = 'return', raw(node.value)
            description = 'Return ' + expression(node.value) + ' and stop this call.' if node.value else 'Stop this call without returning a value.'
        elif isinstance(node, ast.Expr):
            if isinstance(node.value, ast.Constant) and isinstance(node.value.value, str): continue
            category, subject, description = 'call', raw(node.value.func) if isinstance(node.value, ast.Call) else raw(node.value), call_action(node.value)
        elif isinstance(node, ast.Delete):
            category, subject = 'delete', ', '.join(raw(target) for target in node.targets)
            description = 'Delete ' + quoted(subject) + '.'
        elif isinstance(node, ast.Break): category, description = 'break', 'Leave the current loop immediately.'
        elif isinstance(node, ast.Continue): category, description = 'continue', 'Skip the rest of this iteration and continue with the next iteration.'
        elif isinstance(node, ast.Raise): category, subject, description = 'throw', raw(node.exc), 'Raise ' + expression(node.exc) + ' and stop normal execution of this call.'
        if not category: continue
        parent = parents.get(node)
        while parent is not None and not isinstance(parent, (ast.FunctionDef, ast.AsyncFunctionDef)):
            parent = parents.get(parent)
        action = ''
        first = node.body[0] if isinstance(node, (ast.If, ast.While)) and node.body else None
        if isinstance(first, ast.Return):
            action = 'return ' + expression(first.value) if isinstance(first.value, (ast.Constant, ast.Name)) else 'return its answer' if first.value else 'stop this call'
        elif isinstance(first, ast.Expr) and isinstance(first.value, ast.Call):
            called = first.value.func
            action = 'add an item to ' + expression(called.value) if isinstance(called, ast.Attribute) and called.attr in ('append','appendleft','add') else 'call ' + quoted(raw(called))
        elif isinstance(first, ast.Assign) and isinstance(first.value, ast.Call) and isinstance(first.value.func, ast.Attribute) and first.value.func.attr in ('pop','popleft'):
            action = 'remove an item from ' + expression(first.value.func.value)
        facts.append({'line': node.lineno, 'endLine': node.end_lineno, 'kind': category, 'subject': subject,
                      'inputs': inputs, 'description': description, 'functionName': parent.name if parent else '', 'action':action, 'source':raw(node)})
    facts.sort(key=lambda fact:(fact['line'], fact['endLine']))
    _PY_FACTS[source] = facts
    return facts


def relevant_facts(question, facts):
    start, end = question['line'], question['endLine']
    decisions = set(question.get('decisionLines', []))
    inside = [fact for fact in facts if start <= fact['line'] <= end]
    # A multiline allocation has its expression on later rows. Keep its owning
    # statement as the operation, rather than inventing an isolated callback.
    selected = [fact for fact in inside if fact['line'] in decisions or any(fact['line'] <= line <= min(end, fact['endLine']) for line in decisions) and fact['kind'] in ('assign','return','call')]
    if not selected: selected = inside
    if not selected:
        raise ValueError('No source operation for implementation question ' + question['id'])
    return selected


def prompt_for(facts):
    current = facts[0]
    kind, subject = current['kind'], current['subject']
    if kind in ('if','while'):
        if current.get('action'):
            return ('When should we keep trying to ' if kind == 'while' else 'When should ' + quoted(current['functionName'] or 'this function') + ' ') + current['action'] + '?'
        names = ', '.join(quoted(name) for name in current['inputs'])
        if names:
            return ('Which test should keep this loop running' if kind == 'while' else 'Which test should choose this branch') + ' using ' + names + '?'
        return 'Which condition should ' + ('keep the loop running' if kind == 'while' else 'choose this branch') + ' in ' + quoted(current['functionName'] or 'this function') + '?'
    if kind == 'for':
        return 'Which values should ' + quoted(subject) + ' visit, and in what order?'
    if kind == 'return':
        return 'What should ' + quoted(current['functionName'] or 'this function') + ' return here?' if subject else 'How should ' + quoted(current['functionName'] or 'this function') + ' stop at this point?'
    if kind == 'assign': return 'What should ' + quoted(subject) + ' store after this step?'
    if kind == 'delete': return 'Which entry should be deleted here?'
    if kind == 'call':
        target, _, method = subject.rpartition('.')
        if target and method in ('append','appendleft','push','unshift','add','extend'): return 'How should the next item be added to ' + quoted(target) + '?'
        if target and method in ('pop','popleft','shift','remove','discard','delete'): return 'What should be removed from ' + quoted(target) + '?'
        if target and method == 'sort': return 'In what order should ' + quoted(target) + ' be sorted?'
        if target and method == 'reverse': return 'How should the order of ' + quoted(target) + ' change?'
        return 'Which arguments should we pass to ' + quoted(subject) + '?'
    if kind == 'break': return 'How should this loop stop when it reaches this branch?'
    if kind == 'continue': return 'How should this iteration end before the next one begins?'
    return 'Which error should ' + quoted(current['functionName'] or 'this function') + ' report here?'


def short_value(value):
    rendered = json.dumps(value, ensure_ascii=False, separators=(',', ':'))
    if len(rendered) <= 130: return rendered
    if isinstance(value, list): return 'an array with ' + str(len(value)) + ' items'
    if isinstance(value, dict): return 'an object with ' + str(len(value)) + ' entries'
    if isinstance(value, str): return 'a string with ' + str(len(value)) + ' characters'
    return rendered[:127] + '...'


def outcome(witness):
    expected = short_value(witness['expected'])
    if witness.get('error'):
        failure = witness['error']
        return 'On this test, it raises ' + failure['type'] + ': ' + failure['message'] + '; the expected result is ' + expected + '.'
    return 'On this test, it returns ' + short_value(witness.get('actual')) + '; the expected result is ' + expected + '.'


def without_comment(line, language):
    if language == 'python':
        try:
            for token in tokenize.generate_tokens(io.StringIO(line).readline):
                if token.type == tokenize.COMMENT: return line[:token.start[1]].rstrip()
        except (tokenize.TokenError, IndentationError):
            pass
        return line
    quote = None
    escaped = False
    for index, character in enumerate(line):
        if escaped:
            escaped = False; continue
        if quote:
            if character == '\\': escaped = True
            elif character == quote: quote = None
        elif character in ("'", '"', '`'): quote = character
        elif character == '/' and line[index:index + 2] == '//': return line[:index].rstrip()
    return line


def changed_operation(question, choice, language):
    correct = next(item['code'] for item in question['choices'] if item['correct']).split('\n')
    wrong = choice['code'].split('\n')
    changes = [(first.strip(), second.strip()) for first, second in zip(correct, wrong) if first.strip() != second.strip()]
    if not changes: return 'This changes which statements are executed.'
    original, selected = changes[0]
    original = without_comment(original, language).strip()
    selected = without_comment(selected, language).strip()
    if len(original) > 150 or len(selected) > 150:
        return 'This changes ' + quoted(selected[:145] + '...') + '.'
    condition = re.match(r'^(?:if|elif|while|else if)\s*(.*?)(?:[:{])?$', selected)
    if condition and selected.endswith((':', '{')) and original.endswith((':', '{')):
        return 'This tests ' + quoted(condition.group(1).rstrip(':{').strip()) + ' instead of the required ' + quoted(re.sub(r'^(?:if|elif|while|else if)\s*', '', original).rstrip(':{').strip()) + '.'
    assignment = re.match(r'^(?:(?:const|let|var)\s+)?(.+?)\s*=(?!=)\s*(.+?);?$', selected)
    if assignment and not condition and not selected.startswith(('for ', 'for(', 'for await', 'def ', 'function ')) and not assignment.group(1).rstrip().endswith(tuple('+-*/%&|^<>!=')) and not assignment.group(1).startswith(('return ', 'throw ')):
        return 'This stores ' + quoted(assignment.group(2).rstrip(';')) + ' in ' + quoted(assignment.group(1)) + '.'
    return 'This uses ' + quoted(selected) + ' instead of ' + quoted(original) + '.'


_DAILY_PROMPTS = {
    'python': {
        2:'How many days should the algorithm process?',
        3:'What answer should every day start with before a warmer day is found?',
        4:'What should the stack contain before we visit the first day?',
        5:'In what order should we visit the days?',
        6:'When should we keep taking earlier days off the stack?',
        7:'Which earlier day should we take off the stack next?',
        8:'How many days did the earlier day wait for today?',
        9:'What should we store so a later day can answer today’s question?',
        10:'What should we return after visiting every day?',
    },
    'javascript': {
        2:'How many days should the algorithm process?',
        3:'What answer should every day start with before a warmer day is found?',
        7:'What should the stack contain before we visit the first day?',
        9:'In what order should we visit the days?',
        10:'Which temperature should we compare with earlier days?',
        13:'When should we keep taking earlier days off the stack?',
        14:'Which earlier day should we take off the stack next?',
        15:'How many days did the earlier day wait for today?',
        16:'Which day’s answer should receive that waiting time?',
        20:'What should we store so a later day can answer today’s question?',
        24:'What should we return after visiting every day?',
    },
}


def improve_implementation_wording(row, document):
    reviewed = copy.deepcopy(document)
    language = reviewed['language']
    facts = python_facts(reviewed['source']) if language == 'python' else _JS_FACTS.get(str(row['id']))
    if facts is None: raise ValueError('Call prepare_wording(rows) before rewriting JavaScript wording')
    for question in reviewed['questions']:
        if question['stage'] != 'implementation': continue
        selected = relevant_facts(question, facts)
        question['prompt'] = _DAILY_PROMPTS[language].get(question['line']) if row['id'] == 739 else prompt_for(selected)
        description = ' '.join(dict.fromkeys(fact['description'] for fact in selected))
        for choice in question['choices']:
            if choice['correct']:
                choice['feedback'] = description
            elif choice.get('witness'):
                choice['feedback'] = changed_operation(question, choice, language) + ' ' + outcome(choice['witness'])
    return reviewed

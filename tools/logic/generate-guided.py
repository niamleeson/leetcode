"""Build guided Python decisions from actual source and executable counterexamples."""
import argparse
import ast
import copy
import difflib
from concurrent.futures import ProcessPoolExecutor, as_completed
import hashlib
import importlib.util
import json
from pathlib import Path
import random
import re
import shutil
import sys
import textwrap

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
CACHE = Path('/tmp/leetcode-guided-cache/python')
GENERATOR_VERSION = 'python-complete-5'
RUNTIME = None
DISALLOWED_ERRORS = {'NameError', 'UnboundLocalError', 'ReferenceError', 'SyntaxError', 'IndentationError', 'LogicExecutionLimit', 'RecursionError', 'MemoryError', 'TimeoutError'}
WORDING_SPEC = importlib.util.spec_from_file_location('guided_wording', Path(__file__).with_name('guided-wording.py'))
WORDING = importlib.util.module_from_spec(WORDING_SPEC)
WORDING_SPEC.loader.exec_module(WORDING)


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False)


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


def runner():
    global RUNTIME
    if RUNTIME is None:
        RUNTIME = {'__name__': 'guided_runtime'}
        exec(compile((ROOT / 'tools/walkthroughs/python-runtime.py').read_text(), 'python-runtime.py', 'exec'), RUNTIME)
        exec(compile((ROOT / 'src/components/logic/runtime/pythonRunner.py').read_text(), 'pythonRunner.py', 'exec'), RUNTIME)
    return RUNTIME['run_logic']


def execute(row, source, fixtures=None, baseline=False):
    return runner()({'problemId': row['id'], 'code': source, 'fixtures': fixtures or row['fixtures'],
                     '_testLimits': {'maxFrames': 1, 'maxEvents': 500000 if baseline else 15000,
                                     'timeLimit': 2.0 if baseline else 0.12}})


def patch_lines(source, line, end_line, replacement):
    lines = source.splitlines()
    return '\n'.join(lines[:line - 1] + replacement.splitlines() + lines[end_line:]) + '\n'


def expression_text(node):
    return ast.unparse(node)


def expression_variants(node):
    """Small, syntactically valid changes; acceptance still requires a witness."""
    if isinstance(node, ast.Compare):
        for index, operator in enumerate(node.ops):
            family = [ast.In, ast.NotIn] if isinstance(operator, (ast.In, ast.NotIn)) else [ast.Is, ast.IsNot] if isinstance(operator, (ast.Is, ast.IsNot)) else [ast.Eq, ast.NotEq, ast.Lt, ast.LtE, ast.Gt, ast.GtE]
            nearest = {ast.Lt: ast.LtE, ast.LtE: ast.Lt, ast.Gt: ast.GtE, ast.GtE: ast.Gt, ast.Eq: ast.NotEq, ast.NotEq: ast.Eq}.get(type(operator))
            if nearest in family:
                family = [nearest] + [kind for kind in family if kind is not nearest]
            for kind in family:
                if isinstance(operator, kind):
                    continue
                changed = copy.deepcopy(node)
                changed.ops[index] = kind()
                yield expression_text(changed), 'Changing this comparison changes which values take this branch.'
    elif isinstance(node, ast.BinOp):
        family = [ast.BitAnd, ast.BitOr, ast.BitXor, ast.LShift, ast.RShift] if isinstance(node.op, (ast.BitAnd, ast.BitOr, ast.BitXor, ast.LShift, ast.RShift)) else [ast.Add, ast.Sub, ast.Mult, ast.FloorDiv, ast.Mod]
        for kind in family:
            if isinstance(node.op, kind):
                continue
            changed = copy.deepcopy(node)
            changed.op = kind()
            yield expression_text(changed), 'This arithmetic operation computes a different state value.'
    elif isinstance(node, ast.BoolOp):
        changed = copy.deepcopy(node)
        changed.op = ast.Or() if isinstance(node.op, ast.And) else ast.And()
        yield expression_text(changed), 'Using a different boolean operator changes when the combined condition holds.'
        for value in node.values:
            yield expression_text(value), 'Dropping a condition allows cases that the combined check distinguishes.'
    elif isinstance(node, ast.UnaryOp):
        yield expression_text(node.operand), 'Removing this unary operation changes the value or condition.'
        if not isinstance(node.op, ast.Not):
            yield '-(' + expression_text(node.operand) + ')', 'Changing the sign changes the state represented by this expression.'
    elif isinstance(node, ast.Constant):
        if isinstance(node.value, bool):
            yield repr(not node.value), 'This switches the boolean result for this path.'
        elif isinstance(node.value, (int, float)):
            for value in dict.fromkeys([0, 1, -1, node.value + 1, node.value - 1, 2]):
                if value != node.value:
                    yield repr(value), 'This constant changes the initial value, boundary, or update amount.'
        elif isinstance(node.value, str):
            for value in dict.fromkeys(['', '0', '1', node.value[::-1], node.value[:1]]):
                if value != node.value:
                    yield repr(value), 'This string value changes the representation used by this step.'
        elif node.value is None:
            for value in ['0', '[]', 'False']:
                yield value, 'This substitutes a different empty or sentinel value.'
    elif isinstance(node, ast.Call):
        function = expression_text(node.func)
        if function in ('min', 'max'):
            changed = copy.deepcopy(node)
            changed.func = ast.Name(id='min' if function == 'max' else 'max', ctx=ast.Load())
            yield expression_text(changed), 'This keeps the opposite extreme instead of the one required by the approach.'
        if function == 'len':
            for delta in [-1, 1]:
                yield '(' + expression_text(node) + ') ' + ('- 1' if delta < 0 else '+ 1'), 'Moving this length boundary by one changes which positions are included.'
        if function == 'range':
            yield 'list(' + expression_text(node) + ')[1:]', 'This skips the first position in this iteration.'
            yield 'list(' + expression_text(node) + ')[:-1]', 'This skips the last position in this iteration.'
            yield 'reversed(' + expression_text(node) + ')', 'This reverses the update order.'
        if function == 'enumerate' and node.args:
            changed = copy.deepcopy(node)
            changed.args = [node.args[0], ast.Constant(value=1)]
            changed.keywords = []
            yield expression_text(changed), 'Starting indices at one changes the positions recorded by this loop.'
            yield 'enumerate(reversed(' + expression_text(node.args[0]) + '))', 'Reversing values changes their relationship to the recorded indices.'
        if function == 'sorted' and node.args:
            yield 'list(' + expression_text(node.args[0]) + ')', 'This keeps the original order instead of sorting.'
            yield 'sorted(' + expression_text(node.args[0]) + ', reverse=True)', 'This orders values in the opposite direction.'
        if function in ('heapq.heappop', 'heappop') and len(node.args) == 1:
            yield expression_text(node.args[0]) + '.pop()', 'Removing an arbitrary heap-array entry changes which extreme value is discarded.'
        if function in ('heapq.heappush', 'heappush') and len(node.args) == 2:
            yield expression_text(node.args[0]) + '.append(' + expression_text(node.args[1]) + ')', 'Appending without restoring heap order changes later priority removals.'
        if function in ('Counter', 'set', 'list', 'tuple') and node.args:
            for alternative in ('set', 'list', 'tuple'):
                if alternative != function:
                    yield alternative + '(' + expression_text(node.args[0]) + ')', 'Changing the collection representation changes the information this step retains.'
        if isinstance(node.func, ast.Attribute):
            replacements = {'append': ['appendleft'], 'appendleft': ['append'], 'popleft': ['pop'], 'pop': ['popleft'],
                            'add': ['discard'], 'discard': ['add'], 'remove': ['add']}
            for name in replacements.get(node.func.attr, []):
                changed = copy.deepcopy(node)
                changed.func.attr = name
                yield expression_text(changed), 'Updating the opposite end changes the processing order.'
            if node.func.attr == 'append' and len(node.args) == 1:
                yield expression_text(node.func.value) + '.insert(0, ' + expression_text(node.args[0]) + ')', 'Prepending instead of appending changes the order of accumulated values.'
            if node.func.attr == 'pop' and not node.args:
                yield expression_text(node.func.value) + '.pop(0)', 'Removing the first item instead of the last changes the processing order.'
            if node.func.attr == 'sort':
                changed = copy.deepcopy(node)
                changed.keywords = [keyword for keyword in changed.keywords if keyword.arg != 'reverse']
                changed.keywords.append(ast.keyword(arg='reverse', value=ast.Constant(value=True)))
                yield expression_text(changed), 'Sorting in descending order changes the order used by the later traversal.'
    elif isinstance(node, ast.Subscript) and not isinstance(node.slice, ast.Slice):
        for index in ['0', '-1', '(' + expression_text(node.slice) + ') + 1', '(' + expression_text(node.slice) + ') - 1']:
            yield expression_text(node.value) + '[' + index + ']', 'This reads or writes a different position in the state.'
    elif isinstance(node, (ast.List, ast.Tuple)):
        elements = node.elts
        if not elements and isinstance(node, ast.List):
            for value in ['[0]', '[-1]', '[1]']:
                yield value, 'Starting with an extra entry changes the initial stack, queue, or result state.'
        elif elements:
            for items in [[], elements[1:], elements[:-1], list(reversed(elements))]:
                changed = copy.deepcopy(node)
                changed.elts = items
                yield expression_text(changed), 'This changes the elements or their order in the constructed value.'
    elif isinstance(node, ast.Attribute):
        replacement = {'next': 'prev', 'prev': 'next', 'left': 'right', 'right': 'left', 'head': 'tail', 'tail': 'head'}.get(node.attr)
        if replacement:
            yield expression_text(node.value) + '.' + replacement, 'This follows or stores the opposite link in the maintained structure.'


def statement_root(statement):
    if isinstance(statement, (ast.Assign, ast.AnnAssign, ast.AugAssign, ast.Return, ast.Expr)):
        return statement.value
    if isinstance(statement, (ast.If, ast.While)):
        return statement.test
    if isinstance(statement, (ast.For, ast.AsyncFor)):
        return statement.iter
    if isinstance(statement, ast.Assert):
        return statement.test
    if isinstance(statement, ast.Raise):
        return statement.exc
    return None


def statement_category(statement, parents):
    if isinstance(statement, ast.Return):
        return 'result'
    if isinstance(statement, (ast.If, ast.While)):
        return 'condition'
    if isinstance(statement, ast.For):
        return 'iteration'
    if isinstance(statement, ast.AugAssign):
        return 'update'
    ancestor = parents.get(statement)
    while ancestor is not None and not isinstance(ancestor, (ast.FunctionDef, ast.AsyncFunctionDef)):
        if isinstance(ancestor, (ast.For, ast.While, ast.If)):
            return 'update'
        ancestor = parents.get(ancestor)
    return 'state'


def statement_prompt(statement, category):
    target = None
    if isinstance(statement, ast.Assign):
        target = ', '.join(expression_text(value) for value in statement.targets)
    elif isinstance(statement, (ast.AnnAssign, ast.AugAssign)):
        target = expression_text(statement.target)
    if isinstance(statement, ast.While):
        return 'Which condition should keep this loop running?'
    if category == 'condition':
        return 'Which condition should select this branch?'
    if category == 'iteration':
        return 'Which values or positions should this loop visit, and in what order?'
    if category == 'result':
        return 'Which value should this path return?'
    if category == 'state' and target:
        return 'How should ' + target + ' be initialized for this approach?'
    if target:
        return 'How should ' + target + ' change at this step?'
    return 'Which operation should update the state at this step?'


def statement_candidates(source, statement, row=None):
    root = statement_root(statement)
    line, end_line = statement.lineno, root.end_lineno if root is not None else statement.end_lineno
    lines = source.splitlines(keepends=True)
    offsets = [0]
    for value in lines:
        offsets.append(offsets[-1] + len(value))
    start, stop = offsets[line - 1], offsets[end_line]
    original = source[start:stop].rstrip('\r\n')
    seen, candidates = {original}, []

    def add(node, replacement, reason):
        node_start = offsets[node.lineno - 1] + node.col_offset - start
        node_stop = offsets[node.end_lineno - 1] + node.end_col_offset - start
        if node_start < 0 or node_stop > len(original):
            return
        code = original[:node_start] + replacement + original[node_stop:]
        if code not in seen:
            seen.add(code)
            candidate = patch_lines(source, line, end_line, code)
            try:
                compile(candidate, '<guided-candidate>', 'exec')
            except (SyntaxError, ValueError):
                return
            candidates.append({'code': code, 'source': candidate, 'reason': reason})

    def whole(replacement, reason):
        indent = original[:len(original) - len(original.lstrip())]
        code = indent + replacement
        if code in seen:
            return
        candidate = patch_lines(source, line, end_line, code)
        try:
            compile(candidate, '<guided-candidate>', 'exec')
        except (SyntaxError, ValueError):
            return
        seen.add(code)
        candidates.append({'code': code, 'source': candidate, 'reason': reason})

    # Return decisions use values of the same broad shape before generic
    # sentinels. This makes the final output a real decision through completion.
    if isinstance(statement, ast.Return) and root is not None:
        value = expression_text(root)
        expected = [fixture.get('expected') for fixture in (row or {}).get('fixtures', [])]
        annotation = (row or {}).get('_questionReturnType', '')
        if isinstance(root, ast.Constant) and root.value is None:
            known_names = {node.id for node in ast.walk(ast.parse(source)) if isinstance(node, ast.Name)}
            for constructor in ['TreeNode', 'ListNode', 'Node']:
                if constructor in known_names or re.search(r'\b' + constructor + r'\b', source) or constructor == 'TreeNode' and any(f.get('output') == 'tree' for f in (row or {}).get('fixtures', [])):
                    add(root, constructor + '(0)', 'Creating a node for an absent subtree or list changes the returned structure.')
        elif re.search(r'\bbool\b', annotation) or isinstance(root, ast.Constant) and isinstance(root.value, bool) or expected and all(isinstance(item, bool) for item in expected):
            add(root, 'not (' + value + ')', 'This reverses the boolean answer for this completed path.')
        elif re.search(r'^(?:int|float)\b', annotation) or isinstance(root, ast.Constant) and isinstance(root.value, (int, float)) or expected and all(isinstance(item, (int, float)) and not isinstance(item, bool) for item in expected):
            for replacement in ['(' + value + ') + 1', '(' + value + ') - 1', '-(' + value + ')']:
                add(root, replacement, 'This changes the count, distance, index, or numerical result returned to the caller.')
        else:
            for replacement in ['(' + value + ')[1:]', '(' + value + ')[:-1]', '(' + value + ')[::-1]']:
                add(root, replacement, 'This returns a different portion or order of the completed result.')
            for attribute in ['next', 'left', 'right']:
                if '.' + attribute in source:
                    add(root, '(' + value + ').' + attribute, 'This returns a neighboring node instead of the completed structure.')
    # Seed a collection with a value of the structure actually stored by this
    # implementation. These alternatives remain ordinary valid Python state,
    # and are retained only if a real operation exposes the incorrect contents.
    if isinstance(statement, (ast.Assign, ast.AnnAssign)) and root is not None:
        if isinstance(root, ast.Call) and expression_text(root.func) == 'deque' and not root.args:
            for seed in ['0', '1']:
                add(root, 'deque([' + seed + '])', 'Starting with an existing queue entry introduces a value before any push.')
        if isinstance(root, ast.List) and not root.elts:
            targets = statement.targets if isinstance(statement, ast.Assign) else [statement.target]
            target_names = {expression_text(target) for target in targets}
            for call in ast.walk(ast.parse(source)):
                if isinstance(call, ast.Call) and isinstance(call.func, ast.Attribute) and call.func.attr == 'append' and expression_text(call.func.value) in target_names and call.args and isinstance(call.args[0], ast.Tuple):
                    width = len(call.args[0].elts)
                    for first in [0, 1, -1]:
                        seed = [first] + [1] * (width - 1)
                        add(root, repr([tuple(seed)]), 'Starting with a stored record counts an item that has not been processed.')
        if isinstance(root, ast.Dict) and not root.keys:
            operations = [operation for fixture in (row or {}).get('fixtures', []) for operation in fixture.get('operations', [])]
            if "node['#']" in source or 'node["#"]' in source:
                for method, arguments in operations:
                    if method in ('search', 'startsWith') and arguments and isinstance(arguments[0], str) and '.' not in arguments[0]:
                        seed = {'#': True}
                        for character in reversed(arguments[0]):
                            seed = {character: seed}
                        add(root, repr(seed), 'Prepopulating this trie accepts a word or prefix before it has been inserted.')
            elif 'timestamp' in source:
                for method, arguments in operations:
                    if method == 'get' and len(arguments) == 2 and isinstance(arguments[0], str):
                        add(root, repr({arguments[0]: [(arguments[1], 'seed')]}), 'Prepopulating this history returns a value that was never stored.')
    if isinstance(statement, ast.Return) and isinstance(root, ast.Call) and isinstance(root.func, ast.Attribute) and root.func.attr == 'join' and root.args:
        add(root.func.value, repr('|'), 'Changing the serialization separator changes the representation expected by the decoder.')
        add(root.args[0], '(' + expression_text(root.args[0]) + ')[1:]', 'Skipping the first serialized token changes the representation of the root and its descendants.')
    expressions = [node for node in ast.walk(root) if isinstance(node, ast.expr) and hasattr(node, 'end_lineno')] if root is not None else []
    if isinstance(statement, (ast.Assign, ast.AnnAssign, ast.AugAssign)):
        targets = statement.targets if isinstance(statement, ast.Assign) else [statement.target]
        expressions += [node for target in targets for node in ast.walk(target) if isinstance(node, (ast.Subscript, ast.Attribute))]
    # Comparison/update operators are usually more instructive than arbitrary
    # constant changes buried in a larger expression.
    priority = {ast.Compare: 0, ast.BoolOp: 1, ast.BinOp: 2, ast.Call: 3, ast.Subscript: 4, ast.Constant: 5}
    expressions.sort(key=lambda node: (priority.get(type(node), 6), node.lineno, node.col_offset))
    for expression in expressions:
        for replacement, reason in expression_variants(expression):
            parsed = ast.parse(replacement, mode='eval').body
            atomic = isinstance(parsed, (ast.Name, ast.Constant, ast.Call, ast.Attribute, ast.Subscript, ast.List, ast.Tuple, ast.Dict, ast.Set))
            add(expression, replacement if expression is root or atomic else '(' + replacement + ')', reason)
    if isinstance(statement, (ast.If, ast.While)) and root is not None:
        for replacement in ['not (' + expression_text(root) + ')', 'True', 'False']:
            add(root, replacement, 'Changing this condition changes which inputs enter this branch or loop.')
    elif isinstance(statement, ast.For):
        # A "first/last element" mutation of a set depends on PYTHONHASHSEED.
        # Such a choice can pass the same witness in another interpreter, so it
        # cannot support stable grading. Keep only order-independent mutations.
        set_names = set()
        for assignment in ast.walk(ast.parse(source)):
            if isinstance(assignment, (ast.Assign, ast.AnnAssign)):
                value = assignment.value
                if isinstance(value, ast.Set) or isinstance(value, ast.Call) and isinstance(value.func, ast.Name) and value.func.id == 'set':
                    targets = assignment.targets if isinstance(assignment, ast.Assign) else [assignment.target]
                    set_names.update(target.id for target in targets if isinstance(target, ast.Name))
        unordered = isinstance(root, ast.Set) or isinstance(root, ast.Name) and root.id in set_names or isinstance(root, ast.Call) and isinstance(root.func, ast.Name) and root.func.id == 'set'
        variants = ['[]', 'reversed(' + expression_text(root) + ')']
        if not unordered:
            variants += ['list(' + expression_text(root) + ')[1:]', 'list(' + expression_text(root) + ')[:-1]']
        for replacement in variants:
            add(root, replacement, 'Changing this iteration changes which values are processed or their order.')
    elif isinstance(statement, (ast.Assign, ast.AnnAssign, ast.Return)) and root is not None:
        for replacement in ['0', '1', '-1', 'False', 'True', '[]', '{}', 'None', '""']:
            add(root, replacement, 'Substituting this value changes the state or result for this path.')
    elif isinstance(statement, ast.AugAssign) and root is not None:
        for replacement in ['0', '1', '-1', '(' + expression_text(root) + ') + 1']:
            add(root, replacement, 'Changing the update amount changes the state accumulated by this step.')
        for operator in ['+=', '-=', '*=']:
            whole(expression_text(statement.target) + ' ' + operator + ' ' + expression_text(root), 'Using a different update operation changes the maintained state.')
    if isinstance(statement, (ast.Expr, ast.Delete)):
        whole('pass', 'Skipping this operation leaves the state unchanged when the algorithm needs to update it.')
        if isinstance(statement, ast.Expr) and isinstance(root, ast.Call):
            whole(expression_text(root) + '; ' + expression_text(root), 'Repeating this update changes the state twice in a single step.')
    if isinstance(statement, ast.Break):
        whole('continue', 'Continuing the loop changes when this path finishes processing.')
        whole('pass', 'Removing the exit allows the loop to process additional states.')
    if isinstance(statement, ast.Continue):
        whole('break', 'Stopping the loop prevents later entries from being processed.')
        whole('pass', 'Removing this skip allows the rest of this iteration to run.')
    if isinstance(statement, ast.Return) and root is None:
        whole('return False', 'This returns a boolean result from a path that has no result value.')
        whole('pass', 'Removing this control-flow exit lets the following statements run on this case.')
        for prior in ast.walk(ast.parse(source)):
            if isinstance(prior, ast.Expr) and isinstance(prior.value, ast.Call) and prior.end_lineno == statement.lineno - 1:
                whole('return ' + expression_text(prior.value), 'Repeating the preceding update while returning changes the completed state a second time.')
        for call in ast.walk(ast.parse(source)):
            if isinstance(call, ast.Call) and isinstance(call.func, ast.Attribute) and call.func.attr == 'pop' and not call.args:
                whole('return ' + expression_text(call), 'Removing another saved choice while returning changes the state before the caller resumes.')
    return line, end_line, original, candidates


def concise(value, limit=160):
    text = compact(value)
    return text if len(text) <= limit else text[:limit - 1] + '…'


def semantic_failure(witness):
    # In-place/prefix, clone, and round-trip oracles raise AssertionError when a
    # program returns a structurally wrong result; these are logic witnesses.
    return 'error' not in witness or witness['error']['type'] in ('AssertionError', 'IndexError', 'KeyError')


def meaningful_failure(candidate):
    witness = candidate['witness']
    if semantic_failure(witness):
        return True
    error = witness.get('error', {})
    reason = candidate.get('reason', '').lower()
    structural_change = any(value in reason for value in ('condition', 'comparison', 'boolean', 'opposite link', 'skipping this operation', 'control-flow exit'))
    if structural_change and error.get('type') in ('AttributeError', 'TypeError') and 'NoneType' in error.get('message', ''):
        return True
    return error.get('type') == 'ValueError' and (('representation' in reason or 'serialization' in reason) or structural_change and bool(re.search(r'cycle|clone|linked|node|structure', error.get('message', ''), re.I)))


def counterexample(row, source):
    fallback = None
    indexed_fixtures = list(enumerate(row['fixtures']))
    if row['id'] == 127 and re.search(r'(?m)^\s*neighbors = \{\}\s*$', source):
        # A plain dict fails on the first wildcard key visited by a set. Prefer
        # a valid case whose words share that first key, so both the failure and
        # its displayed KeyError are stable across Python hash seeds.
        def fixed_first_key(item):
            fixture = item[1]
            begin, end, words = fixture.get('args', [None, None, []])
            return bool(begin and end in words and len({word[1:] for word in [begin, *words]}) == 1)
        indexed_fixtures.sort(key=lambda item: (not fixed_first_key(item), len(item[1].get('args', [None, None, []])[2])))
    for index, fixture in indexed_fixtures:
        result = execute(row, source, [fixture])['tests'][0]
        if result['passed']:
            continue
        error = result.get('error')
        if error and error['type'] in DISALLOWED_ERRORS:
            continue
        witness = {'fixtureIndex': index, 'name': fixture['name'], 'input': fixture.get('args', []),
                   'expected': fixture['expected']}
        if 'operations' in fixture:
            witness['operations'] = fixture['operations']
        if error:
            witness['error'] = {key: error[key] for key in ('type', 'message')}
        else:
            witness['actual'] = result.get('actual')
        if semantic_failure(witness):
            return witness
        if fallback is None:
            fallback = witness
    return fallback


def explanatory_sentence(row, original):
    identifiers = set(re.findall(r'\b[a-zA-Z_]\w*\b', original)) - {'if', 'while', 'return', 'for', 'in', 'self', 'True', 'False', 'None', 'int'}
    parts = [re.sub(r'^[\s\d.*-]+', '', value).strip() for value in re.split(r'\n|(?<=[.!?])\s+', row.get('explanation', ''))]
    parts = [value for value in parts if 20 <= len(value) <= 420]
    if not parts:
        return 'This preserves the state and boundary used by the guided approach.'
    scores = [(len(identifiers & set(re.findall(r'\b[a-zA-Z_]\w*\b', value))), -index, value) for index, value in enumerate(parts)]
    return max(scores)[2]


def question_for(row, source, statement, parents):
    ancestor = parents.get(statement)
    while ancestor is not None and not isinstance(ancestor, (ast.FunctionDef, ast.AsyncFunctionDef)):
        ancestor = parents.get(ancestor)
    annotation = expression_text(ancestor.returns) if ancestor is not None and ancestor.returns is not None else ''
    proposed = statement_candidates(source, statement, {**row, '_questionReturnType': annotation})
    if not proposed:
        return None
    line, end_line, original, candidates = proposed
    wrong = []
    # Prefer result counterexamples, retaining ordinary runtime errors only when
    # the mutation really prevents the supplied input from being solved.
    for candidate in candidates[:48]:
        witness = counterexample(row, candidate['source'])
        if witness is None:
            continue
        candidate['witness'] = witness
        wrong.append(candidate)
        if sum(meaningful_failure(item) for item in wrong) >= 3:
            break
    wrong = [item for item in wrong if meaningful_failure(item)]
    wrong.sort(key=lambda item: ('error' in item['witness'], len(item['code'])))
    if not wrong:
        return None
    wrong = wrong[:3]
    category = statement_category(statement, parents)
    choices = [{'id': 'correct', 'label': '', 'code': original, 'correct': True,
                'feedback': 'For this guided approach: ' + explanatory_sentence(row, original)}]
    for index, item in enumerate(wrong):
        witness = item['witness']
        outcome = ('raises ' + witness['error']['type'] + ': ' + witness['error']['message']) if 'error' in witness else ('returns ' + concise(witness.get('actual'), 100))
        feedback = item['reason'] + ' On the shown test, this ' + outcome + '; the expected result is ' + concise(witness['expected'], 100) + '.'
        choices.append({'id': 'alternative-' + str(index + 1), 'label': '', 'code': item['code'], 'correct': False,
                        'feedback': feedback, 'witness': witness})
    seed = int(digest(str(row['id']) + ':python:' + str(line))[:16], 16)
    random.Random(seed).shuffle(choices)
    for index, choice in enumerate(choices):
        choice['label'] = 'Option ' + chr(65 + index)
    prior = [value for value in source.splitlines()[max(0, line - 4):line - 1] if not value.lstrip().startswith('#')]
    indent = len(original) - len(original.lstrip())
    context = '\n'.join(prior + [' ' * indent + '# Choose the missing statement'])
    return {'id': 'python-line-' + str(line), 'stage': 'implementation', 'prompt': statement_prompt(statement, category),
            'context': context, 'line': line, 'endLine': end_line, 'choices': choices, '_category': category}


def decision_lines(question):
    original = next(choice['code'] for choice in question['choices'] if choice['correct']).splitlines()
    changed = set()
    for choice in question['choices']:
        if choice['correct']:
            continue
        for tag, start, end, _other_start, _other_end in difflib.SequenceMatcher(a=original, b=choice['code'].splitlines(), autojunk=False).get_opcodes():
            if tag in ('replace', 'delete'):
                changed.update(range(question['line'] + start, question['line'] + end))
    return sorted(changed)


def guarded_returns(source, question):
    """Credit a bare exit only when its direct guard is the sole AST change."""
    original = ast.parse(source)
    parents = {child: node for node in ast.walk(original) for child in ast.iter_child_nodes(node)}
    records = []
    for node in ast.walk(original):
        guard = parents.get(node)
        if not isinstance(node, ast.Return) or node.value is not None or not isinstance(guard, ast.If):
            continue
        if not question['line'] <= guard.lineno <= node.lineno <= question['endLine']:
            continue
        for choice in question['choices']:
            if choice['correct'] or not choice.get('witness'):
                continue
            candidate = ast.parse(patch_lines(source, question['line'], question['endLine'], choice['code']))
            changed_guard = next((item for item in ast.walk(candidate) if isinstance(item, ast.If) and item.lineno == guard.lineno), None)
            if changed_guard is None or ast.dump(changed_guard.test) == ast.dump(guard.test):
                continue
            changed_guard.test = copy.deepcopy(guard.test)
            if ast.dump(candidate) == ast.dump(original):
                records.append({'line': node.lineno, 'guardLine': guard.lineno, 'choiceId': choice['id']})
                break
    return records


def graded_lines(questions):
    return {line for question in questions for line in question['decisionLines']} | {item['line'] for question in questions for item in question.get('guardedReturns', [])}


def code_context(source, line, language="python"):
    result = []
    for text in source.splitlines()[max(0, line - 5):line - 1]:
        if language == 'javascript' and text.lstrip().startswith(('//', '/*', '*')):
            continue
        quote = None
        escaped = False
        for index, character in enumerate(text):
            if escaped:
                escaped = False
            elif character == '\\' and quote:
                escaped = True
            elif quote and character == quote:
                quote = None
            elif not quote and character in ('"', "'"):
                quote = character
            elif not quote and (character == '#' if language == 'python' else text[index:index + 2] == '//'):
                text = text[:index].rstrip()
                break
        if text.strip():
            result.append(text)
    indent = len(source.splitlines()[line - 1]) - len(source.splitlines()[line - 1].lstrip())
    return '\n'.join(result[-3:] + [' ' * indent + ('// Choose the missing code' if language == 'javascript' else '# Choose the missing code')])


def expand_question(source, question, line, end_line, required, language="python"):
    result = copy.deepcopy(question)
    lines = source.splitlines()
    prefix = lines[line - 1:question['line'] - 1]
    suffix = lines[question['endLine']:end_line]
    for choice in result['choices']:
        choice['code'] = '\n'.join(prefix + choice['code'].splitlines() + suffix)
    result['line'], result['endLine'] = line, end_line
    result['coveredLines'] = [value for value in required if line <= value <= end_line]
    result['decisionLines'] = decision_lines(result)
    result['context'] = code_context(source, line, language)
    result.pop('_category', None)
    return result


def python_inventory(row):
    tree = ast.parse(row['source'])
    parents = {child: node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
    public_classes = {interface['className'] for interface in row.get('interfaces', []) if 'className' in interface}
    def relevant(statement):
        ancestor = parents.get(statement)
        while ancestor is not None:
            if isinstance(ancestor, ast.ClassDef):
                return ancestor.name in public_classes
            ancestor = parents.get(ancestor)
        return True
    def scope(statement):
        ancestor = parents.get(statement)
        while ancestor is not None:
            if isinstance(ancestor, (ast.FunctionDef, ast.AsyncFunctionDef)):
                return ancestor.lineno
            ancestor = parents.get(ancestor)
        return None
    kinds = (ast.Assign, ast.AnnAssign, ast.AugAssign, ast.Return, ast.If, ast.While, ast.For,
             ast.Expr, ast.Delete, ast.Break, ast.Continue, ast.Assert, ast.Raise)
    statements = [node for node in ast.walk(tree) if isinstance(node, kinds) and relevant(node)]
    statements = [node for node in statements if not isinstance(node, ast.Expr) or not isinstance(node.value, ast.Constant)]
    statements.sort(key=lambda node: (node.lineno, node.col_offset))
    context_only = []
    # These tails are outside the stated input guarantees, not merely absent
    # from a small fixture set. They still appear in the finishing code block.
    defensive = {
        1: ('[]', 'The problem guarantees one valid pair, so valid inputs return from inside the scan. This final empty-list return is a defensive fallback.'),
        4: ('0.0', 'Sorted inputs with a nonempty combined array always have a valid partition. This zero return after exhausting the partition search is defensive.'),
        167: ('[]', 'The sorted input guarantees exactly one valid pair; the two-pointer search returns it before this defensive empty-list fallback.'),
        230: ('-1', 'The problem guarantees 1 <= k <= the number of tree nodes, so the inorder traversal returns the kth node before this defensive fallback.'),
        235: ('None', 'Both requested nodes exist in the BST, so their lowest common ancestor is found before this defensive null fallback.'),
        347: ('result', 'The requested k does not exceed the number of distinct values. The bucket traversal reaches k results and returns inside the loop, before this fallback.'),
        374: ('lo', 'The picked number is guaranteed to lie in 1..n. Consistent guesses locate it inside the binary-search loop, so this final bound return is defensive.'),
        684: ('[]', 'A connected graph with n vertices and n edges contains a cycle. A cycle edge has an alternate path, so the reverse scan finds an edge before this empty-list fallback.'),
        1631: ('0', 'Every valid nonempty rectangular grid has a four-direction path to its destination. The priority search reaches it before the frontier can be exhausted.'),
        778: ('-1', 'The nonempty square grid has no blocked cells; at a sufficiently high elevation a path always exists. The priority search reaches the destination before this fallback.'),
    }
    excluded = set()
    if row['id'] in defensive and statements:
        expression, reason = defensive[row['id']]
        last = statements[-1]
        if isinstance(last, ast.Return) and last.value is not None and expression_text(last.value) == expression:
            excluded.add(last.lineno)
            context_only.append({'line': last.lineno, 'endLine': last.end_lineno, 'reason': reason})
    if row['id'] == 146:
        for statement in statements:
            if isinstance(statement, ast.Assign) and ast.unparse(statement) == 'self.tail.prev = self.head':
                excluded.add(statement.lineno)
                context_only.append({'line': statement.lineno, 'endLine': statement.end_lineno,
                                     'reason': 'With the required positive capacity, the first valid put calls _add_to_front, which overwrites tail.prev before any operation reads it. This redundant sentinel initialization remains visible in the setup block.'})
    if row['id'] == 460:
        for statement in statements:
            if isinstance(statement, ast.Assign) and ast.unparse(statement) == 'self.min_freq = 0':
                excluded.add(statement.lineno)
                context_only.append({'line': statement.lineno, 'endLine': statement.end_lineno, 'reason': 'With zero capacity, put returns without reading min_freq. With positive capacity, the first insertion writes min_freq = 1 before eviction or frequency updates read it. The initial zero is redundant setup retained in context.'})
    if row['id'] == 1140:
        for statement in statements:
            if isinstance(statement, ast.If) and expression_text(statement.test) == 'i >= n':
                excluded.update(range(statement.lineno, statement.end_lineno + 1))
                context_only.append({'line': statement.lineno, 'endLine': statement.end_lineno, 'reason': 'The initial pile index is zero and piles are nonempty. Recursion occurs only when i + 2*m < n, with each chosen x <= 2*m, so every child i+x remains below n. This empty-suffix base case is defensive.'})
    if row['id'] == 212:
        for statement in statements:
            if isinstance(statement, ast.Delete) and ast.unparse(statement) == 'del node[c]':
                excluded.add(statement.lineno)
                context_only.append({'line': statement.lineno, 'endLine': statement.end_lineno, 'reason': 'This optional pruning removes an already-empty trie branch after all words under it have been reported. Terminal word markers were already popped, so keeping this empty branch only adds unsuccessful future traversal and does not alter the output.'})
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef) and node.name not in public_classes:
            context_only.append({'line': node.lineno, 'endLine': node.end_lineno, 'reason': 'This supplied node container defines the fixed value and link fields used by the public algorithm. Its infrastructure remains part of the completed source; the public operations and their mutations are taught in the decision blocks.'})
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            for decorator in node.decorator_list:
                context_only.append({'line': decorator.lineno, 'endLine': decorator.end_lineno, 'reason': 'This supplied memoization decorator avoids recomputing identical argument states and is part of the stated time complexity. The decisions cover recursive states, transitions, and returned results; the wrapper stays in the completed source.'})
    nonempty = {14: 'strs', 26: 'nums', 42: 'height', 76: 't', 200: 'grid', 130: 'board',
                309: 'prices', 286: 'rooms', 253: 'intervals'}
    if row['id'] in nonempty:
        variable = nonempty[row['id']]
        for statement in statements:
            if not isinstance(statement, ast.If) or not isinstance(parents.get(statement), (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            condition = expression_text(statement.test)
            if condition == 'not ' + variable or condition.startswith('not ' + variable + ' or '):
                if statement.body and all(isinstance(child, ast.Return) for child in statement.body):
                    excluded.update(range(statement.lineno, statement.end_lineno + 1))
                    context_only.append({'line': statement.lineno, 'endLine': statement.end_lineno,
                                         'reason': 'The problem constraints require ' + variable + ' to be nonempty. This outer empty-input guard is defensive and remains visible with the following setup.'})
    units = []
    for statement in statements:
        root = statement_root(statement)
        line, end_line = statement.lineno, root.end_lineno if root is not None else statement.end_lineno
        item = {'line': line, 'endLine': end_line, 'statements': [statement], 'scope': scope(statement)}
        if units and line <= units[-1]['endLine']:
            units[-1]['endLine'] = max(units[-1]['endLine'], end_line)
            units[-1]['statements'].append(statement)
        else:
            units.append(item)
    required = sorted({statement.lineno for statement in statements if statement.lineno not in excluded})
    last_by_scope = {}
    for unit in units:
        eligible = [value for value in required if unit['line'] <= value <= unit['endLine']]
        if unit['scope'] is not None and eligible:
            last_by_scope[unit['scope']] = max(eligible)
    return_lines = {statement.lineno for statement in statements if isinstance(statement, ast.Return) and statement.lineno not in excluded}
    return units, required, sorted(set(last_by_scope.values()) | return_lines), context_only, parents


def generate_python(row):
    source = row['source']
    cache_key = digest(GENERATOR_VERSION + (':stable-first-wildcard-v1' if row['id'] == 127 else '') + source + compact(row['fixtures']) + row.get('explanation', ''))[:20]
    cache_file = CACHE / (str(row['id']) + '-' + cache_key + '.json')
    if cache_file.exists():
        cached = json.loads(cache_file.read_text())
        context_only = python_inventory(row)[3]
        old_ranges = [(item['line'], item['endLine']) for item in cached['coverage'].get('contextOnly', [])]
        new_ranges = [(item['line'], item['endLine']) for item in context_only]
        if old_ranges == new_ranges:
            cached['coverage']['contextOnly'] = context_only
            return cached
    baseline = execute(row, source, baseline=True)
    if baseline['passed'] != baseline['total']:
        failures = [{key: test.get(key) for key in ('name', 'actual', 'expected', 'error')} for test in baseline['tests'] if not test['passed']]
        raise AssertionError(str(row['id']) + ': reference failed ' + compact(failures))
    units, required, terminal, context_only, parents = python_inventory(row)
    anchors = []
    for index, unit in enumerate(units):
        if not any(unit['line'] <= value <= unit['endLine'] for value in required):
            continue
        for statement in unit['statements']:
            question = question_for(row, source, statement, parents)
            if question:
                anchors.append((index, expand_question(source, question, unit['line'], unit['endLine'], required)))
                break
    if not anchors:
        raise AssertionError(str(row['id']) + ': no meaningful implementation question has a tested wrong alternative')
    questions = []
    for index, (unit_index, question) in enumerate(anchors):
        start = units[0]['line'] if index == 0 else units[unit_index]['line']
        last_unit = anchors[index + 1][0] - 1 if index + 1 < len(anchors) else len(units) - 1
        questions.append(expand_question(source, question, start, units[last_unit]['endLine'], required))
    # Absorb a bare return into its direct guard's decision block when the
    # exit's returned value is intentionally ignored by the judge.
    for statement, guard in parents.items():
        if not isinstance(statement, ast.Return) or statement.value is not None or not isinstance(guard, ast.If):
            continue
        if statement.lineno in graded_lines(questions):
            continue
        start_index = next((i for i, q in enumerate(questions) if q['line'] <= guard.lineno <= q['endLine']), None)
        end_index = next((i for i, q in enumerate(questions) if q['line'] <= statement.lineno <= q['endLine']), None)
        if start_index is not None and end_index is not None and start_index <= end_index:
            merged = expand_question(source, questions[start_index], questions[start_index]['line'], questions[end_index]['endLine'], required)
            records = guarded_returns(source, merged)
            if any(item['line'] == statement.lineno for item in records):
                merged['guardedReturns'] = records
                questions[start_index:end_index + 1] = [merged]
    for question in questions:
        records = guarded_returns(source, question)
        if records:
            question['guardedReturns'] = records
    covered = sorted({line for question in questions for line in question['coveredLines']})
    missing_terminal = [line for line in terminal if line not in graded_lines(questions)]
    wrong_count = sum(not choice['correct'] for question in questions for choice in question['choices'])
    document = {'id': row['id'], 'language': 'python', 'source': source, 'sourceHash': digest(source),
                'questions': questions, 'coverage': {'requiredLines': required, 'coveredLines': covered, 'terminalLines': terminal,
                                                    'contextOnly': context_only},
                'validation': {'correctCases': baseline['total'], 'wrongChoices': wrong_count,
                                                      'testedWitnesses': wrong_count}}
    if missing_terminal:
        document['_generationIssues'] = {'ungradedTerminalLines': missing_terminal}
    CACHE.mkdir(parents=True, exist_ok=True)
    cache_file.write_text(compact(document) + '\n')
    return document


def prepare(rows, workers=4):
    documents = {}
    with ProcessPoolExecutor(max_workers=workers) as pool:
        pending = {pool.submit(generate_python, row): row['id'] for row in rows}
        for index, future in enumerate(as_completed(pending), 1):
            problem_id = pending[future]
            try:
                documents[str(problem_id)] = future.result()
            except Exception as error:
                print('FAILED ' + str(problem_id) + ': ' + str(error), file=sys.stderr, flush=True)
                raise
            if index % 25 == 0 or index == len(rows):
                print('Python guided decisions: ' + str(index) + '/' + str(len(rows)), file=sys.stderr, flush=True)
    Path('/tmp/leetcode-guided-python.json').write_text(compact(documents) + '\n')
    return documents


def implementation_start(questions):
    """Require the whole plan before the first implementation decision."""
    assert questions and questions[0]['stage'] == 'pattern', 'A lesson must begin with its approach question'
    index = 1
    while index < len(questions) and questions[index]['stage'] == 'structure':
        index += 1
    assert index > 1, 'A lesson needs at least one structure decision'
    assert index < len(questions), 'A lesson must continue into implementation decisions'
    assert all(question['stage'] == 'implementation' for question in questions[index:]), 'Structure decisions must remain together before implementation'
    assert len({question['id'] for question in questions}) == len(questions), 'Question IDs must be unique'
    return index


def curriculum_questions(row, language, curriculum):
    base = curriculum['lessons'][str(row['id'])]
    expected_hash = base['sourceHashes'][language]
    source = row['source'] if language == 'python' else row['javascript']
    assert digest(source) == expected_hash, str(row['id']) + ': curriculum audit does not match ' + language + ' source'
    metadata = {**base, **base.get('languages', {}).get(language, {})}
    structures = metadata['structureQuestions']
    assert isinstance(structures, list) and 1 <= len(structures) <= 4, str(row['id']) + ': use one to four focused structure decisions'
    specifications = [('pattern', 'pattern', metadata['patternQuestion'])]
    for index, specification in enumerate(structures, 1):
        step_id = specification.get('id', str(index))
        assert isinstance(step_id, str) and step_id.strip(), str(row['id']) + ': missing structure step ID'
        specifications.append(('structure', 'structure-' + step_id, specification))
    questions = []
    for stage, question_id, specification in specifications:
        options = specification['options']
        assert (len(options) == 8) if stage == 'pattern' else (3 <= len(options) <= 4)
        assert len({option['id'] for option in options}) == len(options)
        assert len({option['label'].strip() for option in options}) == len(options)
        assert sum(option['id'] == specification['correctId'] for option in options) == 1
        assert specification['prompt'].strip()
        if stage == 'structure':
            # The learner decides one plan step at a time. Neither an option
            # nor its immediate feedback may reveal a full code outline.
            assert not specification.get('context'), str(row['id']) + ': structure context exposes an outline'
            assert all(not option.get('code') and not option.get('feedbackCode') for option in options), str(row['id']) + ': structure choices must be focused plain-language decisions'
            assert all('\n' not in option['label'] and '\n' not in option['feedback'] for option in options)
        choices = [{'id': option['id'], 'label': option['label'], 'correct': option['id'] == specification['correctId'],
                    'feedback': option['feedback']} for option in options]
        random.Random(int(digest(str(row['id']) + ':' + language + ':' + question_id)[:16], 16)).shuffle(choices)
        questions.append({'id': question_id, 'stage': stage, 'prompt': specification['prompt'], 'choices': choices})
    assert len({question['id'] for question in questions}) == len(questions), str(row['id']) + ': duplicate structure step IDs'
    return metadata, questions


def normalize_runtime_message(message):
    # Object identity addresses and the recorder module name are incidental to
    # a missing-key proof. Keep the class and error type, not process addresses.
    return re.sub(r'<(?:[\w.]+\.)?([A-Za-z_]\w*) object at 0x[0-9a-fA-F]+>', r'<\1 object>', message)


def review_implementation(row, document, overrides, feedback_reviews=None):
    reviewed = copy.deepcopy(document)
    for override in overrides.get('overrides', []):
        if override['id'] != row['id'] or override['language'] != document['language']:
            continue
        assert override['sourceHash'] == document['sourceHash'], str(row['id']) + ': quality override source is stale'
        replacement = override['question']
        indexes = [index for index, question in enumerate(reviewed['questions']) if question['id'] in {override['replaceQuestionId'], replacement['id']}]
        if not indexes:
            indexes = [index for index, question in enumerate(reviewed['questions']) if question['line'] <= replacement['line'] and question['endLine'] >= replacement['endLine']]
        assert len(indexes) == 1, str(row['id']) + ': quality override does not identify exactly one question'
        existing = reviewed['questions'][indexes[0]]
        replacement = expand_question(reviewed['source'], replacement, existing['line'], existing['endLine'], reviewed['coverage']['requiredLines'], reviewed['language'])
        replacement['id'] = existing['id']
        reviewed['questions'][indexes[0]] = replacement
    reviewed = WORDING.improve_implementation_wording(row, reviewed)
    for item in (feedback_reviews or {}).get('feedback', []):
        if item['id'] != row['id'] or item['language'] != reviewed['language']:
            continue
        assert item['sourceHash'] == reviewed['sourceHash'], str(row['id']) + ': correct-feedback source is stale'
        targets = [question for question in reviewed['questions'] if question['id'] == item['questionId']]
        assert len(targets) == 1 and item['feedback'].strip(), str(row['id']) + ': feedback targets a missing or ambiguous question'
        next(choice for choice in targets[0]['choices'] if choice['correct'])['feedback'] = item['feedback']
    reviewed['questions'].sort(key=lambda question: question['line'])
    for question in reviewed['questions']:
        question['decisionLines'] = decision_lines(question)
        if reviewed['language'] == 'python':
            question.pop('guardedReturns', None)
            records = guarded_returns(reviewed['source'], question)
            if records:
                question['guardedReturns'] = records
        for choice in question['choices']:
            choice['feedback'] = normalize_runtime_message(choice['feedback'])
            if 'witness' in choice:
                witness = choice['witness']
                witness['name'] = row['fixtures'][witness['fixtureIndex']]['name']
                if 'error' in witness:
                    witness['error']['message'] = normalize_runtime_message(witness['error']['message'])
    reviewed['coverage']['coveredLines'] = sorted({line for question in reviewed['questions'] for line in question['coveredLines']})
    missing = sorted(set(reviewed['coverage']['terminalLines']) - graded_lines(reviewed['questions']))
    reviewed.pop('_generationIssues', None)
    if missing:
        reviewed['_generationIssues'] = {'ungradedTerminalLines': missing}
    wrong_count = sum(not choice['correct'] for question in reviewed['questions'] for choice in question['choices'])
    reviewed['validation'] = {'correctCases': len(row['fixtures']), 'wrongChoices': wrong_count, 'testedWitnesses': wrong_count}
    return reviewed


def validate_implementation(row, document, execute_witnesses=False):
    assert document['language'] in ('python', 'javascript')
    source = row['source'] if document['language'] == 'python' else row['javascript']
    assert document['source'] == source and document['sourceHash'] == digest(source)
    questions = document['questions']
    assert len(questions) >= 1, str(row['id']) + ': missing implementation decisions'
    assert not document.get('_generationIssues'), str(row['id']) + ': unresolved complete-coverage issues: ' + compact(document.get('_generationIssues'))
    coverage = document['coverage']
    for key in ('requiredLines', 'coveredLines', 'terminalLines'):
        assert isinstance(coverage[key], list) and coverage[key] == sorted(set(coverage[key]))
        assert all(isinstance(line, int) and 1 <= line <= len(source.splitlines()) for line in coverage[key])
    assert coverage['requiredLines'] and coverage['requiredLines'] == coverage['coveredLines']
    assert set(coverage['terminalLines']) <= set(coverage['requiredLines'])
    if document['language'] == 'python':
        units, required, terminal, context_only, _parents = python_inventory(row)
        assert coverage['requiredLines'] == required and coverage['terminalLines'] == terminal and coverage.get('contextOnly', []) == context_only, str(row['id']) + ': Python coverage inventory is stale'
        assert questions[-1]['endLine'] >= units[-1]['endLine'], str(row['id']) + ': lesson stops before its physical ending'
    for exemption in coverage.get('contextOnly', []):
        assert isinstance(exemption['reason'], str) and len(exemption['reason']) >= 20
        assert 1 <= exemption['line'] <= exemption['endLine'] <= len(source.splitlines())
        assert not set(range(exemption['line'], exemption['endLine'] + 1)) & set(coverage['requiredLines'])
    wrong_count = 0
    previous_end = 0
    for question in questions:
        assert question['stage'] == 'implementation' and question['prompt']
        assert 1 <= question['line'] <= question['endLine'] <= len(source.splitlines())
        assert question['line'] > previous_end, str(row['id']) + ': overlapping or unordered decision lines'
        previous_end = question['endLine']
        assert 2 <= len(question['choices']) <= 4
        assert question['coveredLines'] == [line for line in coverage['requiredLines'] if question['line'] <= line <= question['endLine']]
        assert question['decisionLines'] == decision_lines(question), str(row['id']) + ': decisionLines are not backed by tested code differences'
        if document['language'] == 'python':
            assert question.get('guardedReturns', []) == guarded_returns(source, question), str(row['id']) + ': invalid direct-guard return dependency'
        for dependency in question.get('guardedReturns', []):
            assert question['line'] <= dependency['guardLine'] <= dependency['line'] <= question['endLine']
            assert dependency['guardLine'] in question['decisionLines']
            assert any(choice['id'] == dependency['choiceId'] and not choice['correct'] and choice.get('witness') for choice in question['choices'])
        assert len({choice['id'] for choice in question['choices']}) == len(question['choices'])
        assert sum(choice['correct'] is True for choice in question['choices']) == 1
        for choice in question['choices']:
            assert isinstance(choice['code'], str) and choice['feedback']
            candidate = patch_lines(source, question['line'], question['endLine'], choice['code'])
            if document['language'] == 'python':
                compile(candidate, '<guided-lesson-choice>', 'exec')
            if choice['correct']:
                # Correct choices retain the authored statement exactly.
                actual = '\n'.join(source.splitlines()[question['line'] - 1:question['endLine']])
                assert choice['code'].rstrip() == actual.rstrip(), str(row['id']) + ': correct choice is not the actual source statement'
                continue
            wrong_count += 1
            witness = choice['witness']
            assert 0 <= witness['fixtureIndex'] < len(row['fixtures'])
            fixture = row['fixtures'][witness['fixtureIndex']]
            assert witness['input'] == fixture.get('args', []) and witness['expected'] == fixture['expected']
            assert witness.get('operations') == fixture.get('operations')
            assert 'error' not in witness or witness['error']['type'] not in DISALLOWED_ERRORS
            if 'error' in witness:
                assert not re.search(r'maximum call stack|too much recursion|timed out|loops finish|wall.clock limit|execution limit', witness['error']['message'], re.I), str(row['id']) + ': resource limits cannot prove an incorrect choice'
            if execute_witnesses and document['language'] == 'python':
                result = execute(row, candidate, [fixture])['tests'][0]
                assert not result['passed'], str(row['id']) + ': an incorrect choice passes its claimed witness'
                if 'error' in witness:
                    assert result.get('error', {}).get('type') == witness['error']['type']
                else:
                    assert 'error' not in result and result.get('actual') == witness.get('actual')
    assert document['validation']['wrongChoices'] == wrong_count
    assert document['validation']['testedWitnesses'] == wrong_count
    assert document['validation']['correctCases'] == len(row['fixtures'])
    assert sorted({line for question in questions for line in question['coveredLines']}) == coverage['requiredLines']
    assert set(coverage['terminalLines']) <= graded_lines(questions), str(row['id']) + ': a terminal operation has no tested finishing alternative'


def implementation_proof(document):
    """Fingerprint executable choices and coverage independently of lesson prose."""
    question_keys = ('id', 'stage', 'line', 'endLine', 'coveredLines', 'decisionLines', 'guardedReturns')
    choice_keys = ('id', 'code', 'correct', 'witness')
    proof = {key: document[key] for key in ('source', 'sourceHash', 'coverage', 'validation')}
    if 'execution' in document:
        proof['execution'] = document['execution']
    proof['questions'] = [
        {**{key: question[key] for key in question_keys if key in question},
         'choices': [{key: choice[key] for key in choice_keys if key in choice} for choice in question['choices']]}
        for question in document['questions'] if question['stage'] == 'implementation'
    ]
    return digest(json.dumps(proof, sort_keys=True, separators=(',', ':')))


def publish(rows, python_documents, javascript_documents, curriculum, overrides, feedback_reviews, preserve_implementation=False):
    WORDING.prepare_wording(rows)
    assert len(rows) == 250
    expected_ids = {str(row['id']) for row in rows}
    assert set(python_documents) == expected_ids, 'Python lesson coverage is incomplete'
    assert set(javascript_documents) == expected_ids, 'JavaScript lesson coverage is incomplete'
    assert set(curriculum['lessons']) == expected_ids, 'Curriculum coverage is incomplete'
    documents = []
    for row in sorted(rows, key=lambda item: item['id']):
        for language, implementations in [('python', python_documents), ('javascript', javascript_documents)]:
            original = implementations[str(row['id'])]
            implementation = review_implementation(row, original, overrides, feedback_reviews)
            if preserve_implementation:
                assert implementation_proof(implementation) == implementation_proof(original), str(row['id']) + ': wording refresh changed verified implementation choices or coverage'
            validate_implementation(row, implementation)
            metadata, opening = curriculum_questions(row, language, curriculum)
            document = {**implementation, 'title': row['title'], 'patternId': metadata['patternId'],
                        'questions': opening + implementation['questions']}
            assert implementation_start(document['questions']) == len(opening)
            documents.append(document)
    revision = digest(''.join(compact(document) for document in documents))[:16]
    folder = ROOT / 'public/logic/lessons' / revision
    folder.mkdir(parents=True, exist_ok=True)
    for document in documents:
        document['revision'] = revision
        (folder / (str(document['id']) + '-' + document['language'] + '.json')).write_text(compact(document) + '\n')
    manifest = '// Generated by tools/logic/generate-guided.cjs. Lesson bodies load only when opened.\n'
    manifest += 'export const guidedRevision = ' + json.dumps(revision) + ';\n'
    (ROOT / 'src/data/logic/guided-manifest.ts').write_text(manifest)
    for previous in folder.parent.iterdir():
        if previous.is_dir() and re.fullmatch(r'[a-f0-9]{16}', previous.name) and previous.name != revision:
            shutil.rmtree(previous)
    report = {'problems': 250, 'languages': 2, 'lessons': len(documents), 'revision': revision,
              'questions': sum(len(document['questions']) for document in documents),
              'structureQuestions': sum(question['stage'] == 'structure' for document in documents for question in document['questions']),
              'implementationQuestions': sum(question['stage'] == 'implementation' for document in documents for question in document['questions']),
              'referenceCases': sum(document['validation']['correctCases'] for document in documents),
              'testedWrongChoices': sum(document['validation']['testedWitnesses'] for document in documents),
              'bytes': sum(len(compact(document).encode()) for document in documents)}
    (ROOT / 'tools/logic/guided-validation-summary.json').write_text(json.dumps(report, indent=2) + '\n')
    return report


def check_published(rows, curriculum, overrides, feedback_reviews, execute_witnesses=True):
    WORDING.prepare_wording(rows)
    manifest = (ROOT / 'src/data/logic/guided-manifest.ts').read_text()
    revision = re.search(r'guidedRevision = "([a-f0-9]{16})"', manifest).group(1)
    folder = ROOT / 'public/logic/lessons' / revision
    expected_files = {str(row['id']) + '-' + language + '.json' for row in rows for language in ['python', 'javascript']}
    assert {path.name for path in folder.glob('*.json')} == expected_files
    checked_documents = []
    for row in rows:
        for language in ['python', 'javascript']:
            document = json.loads((folder / (str(row['id']) + '-' + language + '.json')).read_text())
            assert document['revision'] == revision and document['id'] == row['id'] and document['language'] == language
            metadata, opening = curriculum_questions(row, language, curriculum)
            boundary = implementation_start(document['questions'])
            assert boundary == len(opening) and document['questions'][:boundary] == opening and document['patternId'] == metadata['patternId']
            implementation = {**document, 'questions': document['questions'][boundary:]}
            reviewed = review_implementation(row, implementation, overrides, feedback_reviews)
            assert reviewed['questions'] == implementation['questions'] and reviewed['validation'] == implementation['validation'], str(row['id']) + ': stale quality review or feedback'
            validate_implementation(row, implementation, execute_witnesses=execute_witnesses)
            checked_documents.append({key: value for key, value in document.items() if key != 'revision'})
        if execute_witnesses:
            result = execute(row, row['source'], baseline=True)
            assert result['passed'] == result['total'], str(row['id']) + ': canonical Python no longer passes'
    checked_documents.sort(key=lambda document: (document['id'], 0 if document['language'] == 'python' else 1))
    assert digest(''.join(compact(document) for document in checked_documents))[:16] == revision, 'Lesson content does not match its published revision'
    return {'checkedLessons': len(expected_files), 'revision': revision, 'pythonWitnessesExecuted': execute_witnesses}


def published_implementations(rows):
    """Reuse verified choices when only lesson wording or plan questions change."""
    manifest = (ROOT / 'src/data/logic/guided-manifest.ts').read_text()
    revision = re.search(r'guidedRevision = "([a-f0-9]{16})"', manifest).group(1)
    directory = ROOT / 'public/logic/lessons' / revision
    documents = {language: {} for language in ('python', 'javascript')}
    for row in rows:
        for language in documents:
            document = json.loads((directory / (str(row['id']) + '-' + language + '.json')).read_text())
            document.pop('revision', None)
            document['questions'] = [question for question in document['questions'] if question['stage'] == 'implementation']
            validate_implementation(row, document)
            documents[language][str(row['id'])] = document
    return documents['python'], documents['javascript']


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prepare', action='store_true')
    parser.add_argument('--reuse-published', action='store_true', help='Republish wording/opening changes without regenerating verified implementation choices')
    parser.add_argument('--only')
    parser.add_argument('--workers', type=int, default=4)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--check-artifacts', action='store_true')
    parser.add_argument('--javascript', default='/tmp/leetcode-guided-js.json')
    args = parser.parse_args()
    rows = json.load(sys.stdin)
    if args.only:
        wanted = set(map(int, args.only.split(',')))
        rows = [row for row in rows if row['id'] in wanted]
    if args.check or args.check_artifacts:
        curriculum = json.loads((ROOT / 'tools/logic/guided-curriculum.json').read_text())
        overrides = json.loads((ROOT / 'tools/logic/guided-quality-overrides.json').read_text())
        feedback_reviews = json.loads((ROOT / 'tools/logic/guided-feedback.json').read_text())
        print(compact(check_published(rows, curriculum, overrides, feedback_reviews, execute_witnesses=args.check)))
        return
    if args.reuse_published:
        assert not args.prepare and not args.only, '--reuse-published requires the complete curriculum'
        documents, javascript = published_implementations(rows)
    else:
        documents = prepare(rows, args.workers)
    if args.prepare:
        print(compact({'pythonProblems': len(documents), 'questions': sum(len(document['questions']) for document in documents.values()),
                       'wrongChoices': sum(document['validation']['wrongChoices'] for document in documents.values())}))
    else:
        curriculum = json.loads((ROOT / 'tools/logic/guided-curriculum.json').read_text())
        if not args.reuse_published:
            javascript = json.loads(Path(args.javascript).read_text())
        overrides = json.loads((ROOT / 'tools/logic/guided-quality-overrides.json').read_text())
        feedback_reviews = json.loads((ROOT / 'tools/logic/guided-feedback.json').read_text())
        print(compact(publish(rows, documents, javascript, curriculum, overrides, feedback_reviews, preserve_implementation=args.reuse_published)))


if __name__ == '__main__':
    main()

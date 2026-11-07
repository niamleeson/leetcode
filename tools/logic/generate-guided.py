"""Build guided Python decisions from actual source and executable counterexamples."""
import argparse
import ast
import copy
from concurrent.futures import ProcessPoolExecutor, as_completed
import hashlib
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
GENERATOR_VERSION = 'python-decisions-5'
RUNTIME = None
DISALLOWED_ERRORS = {'NameError', 'UnboundLocalError', 'ReferenceError', 'SyntaxError', 'IndentationError', 'LogicExecutionLimit', 'RecursionError', 'MemoryError', 'TimeoutError'}


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
        if function in ('Counter', 'set', 'list', 'tuple') and node.args:
            for alternative in ('set', 'list', 'tuple'):
                if alternative != function:
                    yield alternative + '(' + expression_text(node.args[0]) + ')', 'Changing the collection representation changes the information this step retains.'
        if isinstance(node.func, ast.Attribute):
            replacements = {'append': ['appendleft'], 'appendleft': ['append'], 'popleft': ['pop'], 'pop': ['popleft']}
            for name in replacements.get(node.func.attr, []):
                changed = copy.deepcopy(node)
                changed.func.attr = name
                yield expression_text(changed), 'Updating the opposite end changes the processing order.'
            if node.func.attr == 'append' and len(node.args) == 1:
                yield expression_text(node.func.value) + '.insert(0, ' + expression_text(node.args[0]) + ')', 'Prepending instead of appending changes the order of accumulated values.'
            if node.func.attr == 'pop' and not node.args:
                yield expression_text(node.func.value) + '.pop(0)', 'Removing the first item instead of the last changes the processing order.'
    elif isinstance(node, ast.Subscript) and not isinstance(node.slice, ast.Slice):
        for index in ['0', '-1', '(' + expression_text(node.slice) + ') + 1', '(' + expression_text(node.slice) + ') - 1']:
            yield expression_text(node.value) + '[' + index + ']', 'This reads or writes a different position in the state.'
    elif isinstance(node, (ast.List, ast.Tuple)):
        elements = node.elts
        if elements:
            for items in [[], elements[1:], elements[:-1], list(reversed(elements))]:
                changed = copy.deepcopy(node)
                changed.elts = items
                yield expression_text(changed), 'This changes the elements or their order in the constructed value.'


def statement_root(statement):
    if isinstance(statement, (ast.Assign, ast.AnnAssign, ast.AugAssign, ast.Return, ast.Expr)):
        return statement.value
    if isinstance(statement, (ast.If, ast.While)):
        return statement.test
    if isinstance(statement, (ast.For, ast.AsyncFor)):
        return statement.iter
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


def statement_candidates(source, statement):
    root = statement_root(statement)
    if root is None:
        return []
    line, end_line = statement.lineno, root.end_lineno
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

    expressions = [node for node in ast.walk(root) if isinstance(node, ast.expr) and hasattr(node, 'end_lineno')]
    # Comparison/update operators are usually more instructive than arbitrary
    # constant changes buried in a larger expression.
    priority = {ast.Compare: 0, ast.BoolOp: 1, ast.BinOp: 2, ast.Call: 3, ast.Subscript: 4, ast.Constant: 5}
    expressions.sort(key=lambda node: (priority.get(type(node), 6), node.lineno, node.col_offset))
    for expression in expressions:
        for replacement, reason in expression_variants(expression):
            parsed = ast.parse(replacement, mode='eval').body
            atomic = isinstance(parsed, (ast.Name, ast.Constant, ast.Call, ast.Attribute, ast.Subscript, ast.List, ast.Tuple, ast.Dict, ast.Set))
            add(expression, replacement if expression is root or atomic else '(' + replacement + ')', reason)
    if isinstance(statement, (ast.If, ast.While)):
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
    elif isinstance(statement, (ast.Assign, ast.AnnAssign, ast.Return)):
        for replacement in ['0', '1', '-1', 'False', 'True', '[]', '{}', 'None', '""']:
            add(root, replacement, 'Substituting this value changes the state or result for this path.')
    elif isinstance(statement, ast.AugAssign):
        for replacement in ['0', '1', '-1', '(' + expression_text(root) + ') + 1']:
            add(root, replacement, 'Changing the update amount changes the state accumulated by this step.')
    return line, end_line, original, candidates


def concise(value, limit=160):
    text = compact(value)
    return text if len(text) <= limit else text[:limit - 1] + '…'


def semantic_failure(witness):
    # In-place/prefix, clone, and round-trip oracles raise AssertionError when a
    # program returns a structurally wrong result; these are logic witnesses.
    return 'error' not in witness or witness['error']['type'] == 'AssertionError'


def counterexample(row, source):
    fallback = None
    for index, fixture in enumerate(row['fixtures']):
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
    proposed = statement_candidates(source, statement)
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
        if sum(semantic_failure(item['witness']) for item in wrong) >= 3:
            break
    wrong.sort(key=lambda item: (not semantic_failure(item['witness']), len(item['code'])))
    if len(wrong) < 2 or not any(semantic_failure(item['witness']) for item in wrong):
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
    prior = source.splitlines()[max(0, line - 4):line - 1]
    indent = len(original) - len(original.lstrip())
    context = '\n'.join(prior + [' ' * indent + '# Choose the missing statement'])
    return {'id': 'python-line-' + str(line), 'stage': 'implementation', 'prompt': statement_prompt(statement, category),
            'context': context, 'line': line, 'endLine': end_line, 'choices': choices, '_category': category}


def generate_python(row):
    source = row['source']
    cache_key = digest(GENERATOR_VERSION + source + compact(row['fixtures']) + row.get('explanation', ''))[:20]
    cache_file = CACHE / (str(row['id']) + '-' + cache_key + '.json')
    if cache_file.exists():
        return json.loads(cache_file.read_text())
    baseline = execute(row, source, baseline=True)
    if baseline['passed'] != baseline['total']:
        failures = [{key: test.get(key) for key in ('name', 'actual', 'expected', 'error')} for test in baseline['tests'] if not test['passed']]
        raise AssertionError(str(row['id']) + ': reference failed ' + compact(failures))
    tree = ast.parse(source)
    parents = {child: node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
    statements = [node for node in ast.walk(tree) if isinstance(node, (ast.Assign, ast.AnnAssign, ast.AugAssign, ast.Return, ast.If, ast.While, ast.For, ast.Expr)) and statement_root(node) is not None]
    statements = [node for node in statements if not isinstance(node, ast.Expr) or isinstance(node.value, ast.Call)]
    public_classes = {interface['className'] for interface in row.get('interfaces', []) if 'className' in interface}
    def relevant(statement):
        ancestor = parents.get(statement)
        while ancestor is not None:
            if isinstance(ancestor, ast.ClassDef):
                return ancestor.name in public_classes
            ancestor = parents.get(ancestor)
        return True
    statements = [node for node in statements if relevant(node)]
    statements.sort(key=lambda node: (node.lineno, node.col_offset))
    # One decision for a one-line algorithm; otherwise cover distinct roles
    # before adding extra boundaries or updates.
    desired = min(5, 1 if len(statements) <= 2 else 3 if len(statements) < 12 else 4 if len(statements) < 24 else 5)
    categories = ['state', 'iteration', 'condition', 'update', 'result']
    ordered = []
    for category in categories:
        match = next((node for node in statements if statement_category(node, parents) == category), None)
        if match:
            ordered.append(match)
    ordered += [node for node in statements if node not in ordered]
    questions, lines = [], set()
    for statement in ordered:
        if any(statement.lineno <= end and statement_root(statement).end_lineno >= start for start, end in lines):
            continue
        question = question_for(row, source, statement, parents)
        if question:
            questions.append(question)
            lines.add((question['line'], question['endLine']))
        if len(questions) >= desired:
            break
    if not questions:
        raise AssertionError(str(row['id']) + ': no implementation decisions with two tested distractors')
    questions.sort(key=lambda value: value['line'])
    for question in questions:
        question.pop('_category', None)
        # Context must not expose a line belonging to a later decision.
        assert all(other['line'] >= question['line'] or other['endLine'] < question['line'] for other in questions)
    wrong_count = sum(not choice['correct'] for question in questions for choice in question['choices'])
    document = {'id': row['id'], 'language': 'python', 'source': source, 'sourceHash': digest(source),
                'questions': questions, 'validation': {'correctCases': baseline['total'], 'wrongChoices': wrong_count,
                                                      'testedWitnesses': wrong_count}}
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


def curriculum_questions(row, language, curriculum):
    base = curriculum['lessons'][str(row['id'])]
    expected_hash = base['sourceHashes'][language]
    source = row['source'] if language == 'python' else row['javascript']
    assert digest(source) == expected_hash, str(row['id']) + ': curriculum audit does not match ' + language + ' source'
    metadata = {**base, **base.get('languages', {}).get(language, {})}
    questions = []
    for stage in ['pattern', 'structure']:
        specification = metadata[stage + 'Question']
        expected_count = 8 if stage == 'pattern' else 4
        assert len(specification['options']) == expected_count
        assert sum(option['id'] == specification['correctId'] for option in specification['options']) == 1
        choices = [{'id': option['id'], 'label': option['label'], 'correct': option['id'] == specification['correctId'],
                    'feedback': option['feedback']} for option in specification['options']]
        random.Random(int(digest(str(row['id']) + ':' + language + ':' + stage)[:16], 16)).shuffle(choices)
        questions.append({'id': stage, 'stage': stage, 'prompt': specification['prompt'], 'choices': choices})
    return metadata, questions


SENTINEL_RETURN = re.compile(r'^\s*return\s+(?:null|None|false|true|False|True|[012-]+|\[\]|\{\})\s*;?\s*$')


def weak_return_question(question):
    correct = next((choice for choice in question['choices'] if choice['correct']), None)
    wrong = [choice for choice in question['choices'] if not choice['correct']]
    return bool(correct and re.match(r'^\s*return\b', correct.get('code', '')) and
                not SENTINEL_RETURN.fullmatch(correct['code']) and wrong and
                all(SENTINEL_RETURN.fullmatch(choice.get('code', '')) for choice in wrong))


def current_operation_feedback(question, language):
    """Explain only this decision; never copy a later algorithm step as feedback."""
    code = next(choice['code'] for choice in question['choices'] if choice['correct']).strip()
    prompt = question['prompt'].lower()
    if code.startswith('return ') or 'return' in prompt:
        explanation = 'The caller receives the computed value for this path, and the current function stops immediately.'
    elif re.match(r'^(?:for|for await)\b', code) or 'loop' in prompt and code.startswith('for'):
        explanation = 'This header specifies the values, bounds, and order of the loop. Those choices determine which inputs the body processes.'
    elif re.match(r'^(?:if|elif|else if|while)\b', code):
        if '<=' in code or '>=' in code:
            explanation = 'The non-strict comparison includes equality. Using a strict comparison would change the boundary case.'
        elif ' not in ' in code:
            explanation = 'This membership test distinguishes values absent from the collection from values already recorded there.'
        elif ' in ' in code or '.has(' in code:
            explanation = 'This membership test checks the collection as it exists at this step, before the branch changes the state.'
        elif code.startswith('while'):
            explanation = 'The condition is checked before each iteration. The loop continues while it holds and stops when it becomes false.'
        else:
            explanation = 'This condition selects the next branch. Its comparisons and boolean operators determine which path the current input takes.'
    elif code.startswith('break'):
        explanation = 'This exits the innermost loop or switch at this point.' if language == 'javascript' else 'This exits the innermost loop at this point.'
    elif code.startswith('continue'):
        explanation = 'This skips the rest of the current iteration and advances to the next iteration check.'
    elif 'initializ' in prompt:
        if any(token in code for token in ['Map(', 'Set(', 'set(', '{}', '[]', 'dict(', 'deque(']):
            explanation = 'This creates the state used by later steps. The container determines which lookup and update operations are available.'
        else:
            explanation = 'This sets the starting state. Later calculations and boundary checks depend on that initial value.'
    elif re.search(r'\.(?:append|appendleft|add|push|unshift|set|pop|popleft|shift)\s*\(', code):
        explanation = 'This operation updates the collection. The selected value, key, and end of the collection determine what state is available afterward.'
    elif code.startswith('del ') or '.delete(' in code:
        explanation = 'This removes the selected entry from the maintained state, so subsequent lookups reflect that change.'
    else:
        explanation = 'This updates the state using its current values. The operands and target position determine which stored result changes.'
    return 'For this guided approach: ' + explanation


def review_implementation(row, document, overrides, feedback_reviews=None):
    reviewed = copy.deepcopy(document)
    authored_ids = set()
    for override in overrides.get('overrides', []):
        if override['id'] != row['id'] or override['language'] != document['language']:
            continue
        assert override['sourceHash'] == document['sourceHash'], str(row['id']) + ': quality override source is stale'
        replacement = override['question']
        indexes = [index for index, question in enumerate(reviewed['questions']) if question['id'] in {override['replaceQuestionId'], replacement['id']}]
        assert len(indexes) == 1, str(row['id']) + ': quality override does not identify exactly one question'
        reviewed['questions'][indexes[0]] = copy.deepcopy(replacement)
        authored_ids.add(replacement['id'])
    substantive = [question for question in reviewed['questions'] if not weak_return_question(question)]
    if len(substantive) >= 2:
        reviewed['questions'] = substantive
    for question in reviewed['questions']:
        if question['id'] not in authored_ids:
            for choice in question['choices']:
                if choice['correct']:
                    choice['feedback'] = current_operation_feedback(question, reviewed['language'])
    for item in (feedback_reviews or {}).get('feedback', []):
        if item['id'] != row['id'] or item['language'] != reviewed['language']:
            continue
        assert item['sourceHash'] == reviewed['sourceHash'], str(row['id']) + ': correct-feedback source is stale'
        targets = [question for question in reviewed['questions'] if question['id'] == item['questionId']]
        assert len(targets) == 1 and item['feedback'].strip(), str(row['id']) + ': feedback targets a missing or ambiguous question'
        next(choice for choice in targets[0]['choices'] if choice['correct'])['feedback'] = item['feedback']
    reviewed['questions'].sort(key=lambda question: question['line'])
    wrong_count = sum(not choice['correct'] for question in reviewed['questions'] for choice in question['choices'])
    reviewed['validation'] = {'correctCases': len(row['fixtures']), 'wrongChoices': wrong_count, 'testedWitnesses': wrong_count}
    return reviewed


def validate_implementation(row, document, execute_witnesses=False):
    assert document['language'] in ('python', 'javascript')
    source = row['source'] if document['language'] == 'python' else row['javascript']
    assert document['source'] == source and document['sourceHash'] == digest(source)
    questions = document['questions']
    assert 1 <= len(questions) <= 5, str(row['id']) + ': expected 1–5 implementation decisions'
    wrong_count = 0
    previous_end = 0
    for question in questions:
        assert question['stage'] == 'implementation' and question['prompt']
        assert 1 <= question['line'] <= question['endLine'] <= len(source.splitlines())
        assert question['line'] > previous_end, str(row['id']) + ': overlapping or unordered decision lines'
        previous_end = question['endLine']
        assert 3 <= len(question['choices']) <= 4
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


def publish(rows, python_documents, javascript_documents, curriculum, overrides, feedback_reviews):
    assert len(rows) == 250
    expected_ids = {str(row['id']) for row in rows}
    assert set(python_documents) == expected_ids, 'Python lesson coverage is incomplete'
    assert set(javascript_documents) == expected_ids, 'JavaScript lesson coverage is incomplete'
    assert set(curriculum['lessons']) == expected_ids, 'Curriculum coverage is incomplete'
    documents = []
    for row in sorted(rows, key=lambda item: item['id']):
        for language, implementations in [('python', python_documents), ('javascript', javascript_documents)]:
            implementation = review_implementation(row, implementations[str(row['id'])], overrides, feedback_reviews)
            validate_implementation(row, implementation)
            metadata, opening = curriculum_questions(row, language, curriculum)
            document = {**implementation, 'title': row['title'], 'patternId': metadata['patternId'],
                        'questions': opening + implementation['questions']}
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
              'referenceCases': sum(document['validation']['correctCases'] for document in documents),
              'testedWrongChoices': sum(document['validation']['testedWitnesses'] for document in documents),
              'bytes': sum(len(compact(document).encode()) for document in documents)}
    (ROOT / 'tools/logic/guided-validation-summary.json').write_text(json.dumps(report, indent=2) + '\n')
    return report


def check_published(rows, curriculum, overrides, feedback_reviews, execute_witnesses=True):
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
            assert document['questions'][:2] == opening and document['patternId'] == metadata['patternId']
            implementation = {**document, 'questions': document['questions'][2:]}
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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prepare', action='store_true')
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
    documents = prepare(rows, args.workers)
    if args.prepare:
        print(compact({'pythonProblems': len(documents), 'questions': sum(len(document['questions']) for document in documents.values()),
                       'wrongChoices': sum(document['validation']['wrongChoices'] for document in documents.values())}))
    else:
        curriculum = json.loads((ROOT / 'tools/logic/guided-curriculum.json').read_text())
        javascript = json.loads(Path(args.javascript).read_text())
        overrides = json.loads((ROOT / 'tools/logic/guided-quality-overrides.json').read_text())
        feedback_reviews = json.loads((ROOT / 'tools/logic/guided-feedback.json').read_text())
        print(compact(publish(rows, documents, javascript, curriculum, overrides, feedback_reviews)))


if __name__ == '__main__':
    main()

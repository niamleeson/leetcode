"""Independent source-token and choice-AST inventory; does not import generators."""
import ast
import hashlib
import io
import json
import token
import tokenize
import sys


def analyze(document):
    source = document['source']
    lines = source.splitlines(keepends=True)
    offsets = [0]
    for line in lines:
        offsets.append(offsets[-1] + len(line))

    def position(row, column):
        return offsets[row - 1] + column

    def bounds(node):
        return position(node.lineno, node.col_offset), position(node.end_lineno, node.end_col_offset)

    tree = ast.parse(source)
    memo_names = {alias.asname or alias.name for node in ast.walk(tree)
                  if isinstance(node, ast.ImportFrom) and node.module == 'functools'
                  for alias in node.names if alias.name == 'lru_cache'}
    supplied_definitions = []
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            for decorator in node.decorator_list:
                target = decorator.func if isinstance(decorator, ast.Call) else decorator
                if isinstance(target, ast.Name) and target.id in memo_names:
                    supplied_definitions.append({'line': decorator.lineno, 'endLine': decorator.end_lineno,
                                                 'kind': 'standard-memoization-decorator', 'name': 'functools.lru_cache'})
    parents = {child: parent for parent in ast.walk(tree) for child in ast.iter_child_nodes(parent)}
    direct_guards = []
    for node in ast.walk(tree):
        guard = parents.get(node)
        if isinstance(node, ast.Return) and node.value is None and isinstance(guard, ast.If):
            direct_guards.append({'line': node.lineno, 'guardLine': guard.lineno, 'node': guard})
    public_ranges = [(node.lineno, node.end_lineno) for node in ast.walk(tree)
                     if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) and node.name == document.get('entry')]
    excluded = []
    functions = []
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            excluded.append((bounds(node)[0], bounds(node.body[0])[0]))
            if not isinstance(node, ast.ClassDef):
                functions.append(node)
        elif isinstance(node, (ast.Import, ast.ImportFrom, ast.Global, ast.Nonlocal, ast.Pass)):
            excluded.append(bounds(node))
        elif isinstance(node, ast.Expr) and isinstance(node.value, ast.Constant) and isinstance(node.value.value, str):
            excluded.append(bounds(node))

    required = set()
    ignored_types = {tokenize.ENCODING, token.ENDMARKER, token.NEWLINE, tokenize.NL, token.INDENT, token.DEDENT, tokenize.COMMENT}
    for item in tokenize.generate_tokens(io.StringIO(source).readline):
        if item.type in ignored_types or not item.string.strip():
            continue
        if item.type == token.OP and item.string in '()[]{}.,:;':
            continue
        if item.string in {'else', 'try', 'finally'} and lines[item.start[0] - 1].split('#', 1)[0].strip() == item.string + ':':
            continue
        start = position(*item.start)
        if any(a <= start < b for a, b in excluded):
            continue
        required.update(range(item.start[0], item.end[0] + 1))

    terminal_nodes = [node for node in ast.walk(tree) if isinstance(node, ast.Return)]
    for function in functions:
        meaningful = [node for node in function.body if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Pass))]
        if meaningful:
            last = meaningful[-1]
            candidates = [line for line in required if last.lineno <= line <= last.end_lineno]
            if candidates:
                terminal_nodes.append(last)
    terminal_operations = {}
    for node in terminal_nodes:
        operation_lines = sorted(line for line in required if node.lineno <= line <= node.end_lineno)
        if operation_lines:
            terminal_operations[(node.lineno, node.end_lineno)] = {'line': node.lineno, 'endLine': node.end_lineno, 'kind': type(node).__name__, 'lines': operation_lines}

    choices = {}
    for question in document['questions']:
        if question.get('stage') != 'implementation':
            continue
        values = []
        for choice in question['choices']:
            changed = ''.join(lines[:question['line'] - 1]) + choice.get('code', '').rstrip('\n') + '\n' + ''.join(lines[question['endLine']:])
            try:
                shape = ast.dump(ast.parse(changed), include_attributes=False)
                altered_tree = ast.parse(changed)
                guard_changes = []
                for relation in direct_guards:
                    candidates = [node for node in ast.walk(altered_tree) if isinstance(node, ast.If) and node.lineno == relation['guardLine']]
                    for candidate in candidates:
                        if ast.dump(candidate.test, include_attributes=False) == ast.dump(relation['node'].test, include_attributes=False):
                            continue
                        original_test = candidate.test
                        candidate.test = relation['node'].test
                        guard_only = ast.dump(altered_tree, include_attributes=False) == ast.dump(tree, include_attributes=False)
                        candidate.test = original_test
                        if guard_only:
                            guard_changes.append({key: relation[key] for key in ['line', 'guardLine']})
                values.append({'id': choice['id'], 'ast': hashlib.sha256(shape.encode()).hexdigest(), 'guardChanges': guard_changes})
            except SyntaxError as error:
                values.append({'id': choice['id'], 'error': str(error)})
        choices[question['id']] = values
    public_lines = [line for line in required if any(start <= line <= end for start, end in public_ranges)]
    return {'requiredLines': sorted(required), 'publicLines': sorted(public_lines), 'suppliedDefinitions': supplied_definitions,
            'terminalLines': sorted({operation['lines'][-1] for operation in terminal_operations.values()}),
            'terminalOperations': list(terminal_operations.values()), 'choices': choices}


if __name__ == '__main__':
    documents = json.load(sys.stdin)
    json.dump({str(document['id']): analyze(document) for document in documents}, sys.stdout)

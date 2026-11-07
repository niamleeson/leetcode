"""Build expression-free control-flow outlines from the audited Python source."""
import ast
import json
import sys


def summary(nodes):
    kinds = set()
    for node in nodes:
        kinds.update(type(child).__name__ for child in ast.walk(node))
    roles = []
    if kinds & {'If', 'IfExp', 'Match'}:
        roles.append('check cases')
    if kinds & {'For', 'While', 'comprehension'}:
        roles.append('traverse the required work')
    if 'Call' in kinds:
        roles.append('apply operations or helper calls')
    if kinds & {'Assign', 'AnnAssign', 'AugAssign'}:
        roles.append('update working state')
    if 'Return' in kinds:
        roles.append('return the computed result')
    return '; '.join(roles) or 'perform this operation'


def outline(source, entry=None, roundtrip=None, limit=12):
    tree = ast.parse(source)
    roots = tree.body
    if entry:
        public_class = next((node for node in tree.body if isinstance(node, ast.ClassDef) and node.name == entry), None)
        if public_class:
            roots = [public_class]
        else:
            names = {entry, roundtrip} - {None}
            roots = [node for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name in names]
        assert roots, 'Missing public Python entry: ' + entry

    def block(nodes, indent, depth, maximum):
        result = []
        pending = []

        def line(text):
            result.append('  ' * indent + text)

        def flush():
            if pending:
                line('prepare or update working state')
                pending.clear()

        def body(nodes):
            if depth >= maximum:
                if nodes:
                    result.append('  ' * (indent + 1) + summary(nodes))
            else:
                result.extend(block(nodes, indent + 1, depth + 1, maximum))

        for node in nodes:
            if isinstance(node, (ast.Import, ast.ImportFrom, ast.Global, ast.Nonlocal, ast.Pass)):
                continue
            if isinstance(node, ast.Expr) and isinstance(node.value, ast.Constant) and isinstance(node.value.value, str):
                continue
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                flush()
                line(('class ' if isinstance(node, ast.ClassDef) else 'operation ') + node.name + ':')
                body(node.body)
            elif isinstance(node, (ast.For, ast.AsyncFor, ast.While)):
                flush()
                line('for each item in the traversal:' if isinstance(node, (ast.For, ast.AsyncFor)) else 'while the continuation test holds:')
                body(node.body)
                if node.orelse:
                    line('after normal loop completion:')
                    body(node.orelse)
            elif isinstance(node, ast.If):
                flush()
                line('if this case applies:')
                body(node.body)
                if node.orelse:
                    line('otherwise:')
                    body(node.orelse)
            elif isinstance(node, ast.Return):
                flush()
                line('return the computed result')
            elif isinstance(node, (ast.Break, ast.Continue, ast.Raise)):
                flush()
                line({ast.Break: 'leave this loop', ast.Continue: 'continue with the next item', ast.Raise: 'reject this case'}[type(node)])
            elif isinstance(node, ast.Try):
                flush()
                line('try this operation:')
                body(node.body)
                for handler in node.handlers:
                    line('handle a failure:')
                    body(handler.body)
                if node.finalbody:
                    line('always finish with:')
                    body(node.finalbody)
            elif isinstance(node, (ast.With, ast.AsyncWith)):
                flush()
                line('within the operation context:')
                body(node.body)
            else:
                pending.append(node)
        flush()
        return result

    for maximum in (4, 3, 2, 1):
        lines = block(roots, 0, 0, maximum)
        if len(lines) <= limit:
            break
    if len(lines) > limit:
        compact = []
        index = 0
        while index < len(lines):
            if lines[index].lstrip().startswith('operation ') and index + 1 < len(lines) and not lines[index + 1].rstrip().endswith(':'):
                compact.append(lines[index] + ' ' + lines[index + 1].strip())
                index += 2
            else:
                compact.append(lines[index])
                index += 1
        lines = compact
    assert lines, 'No structural outline for Python source'
    return '\n'.join(lines)


if __name__ == '__main__':
    sources = json.load(sys.stdin)
    json.dump({key: outline(**specification) for key, specification in sources.items()}, sys.stdout)

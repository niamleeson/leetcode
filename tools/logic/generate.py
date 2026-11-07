"""Publish interface-only NeetCode practice data, never reference algorithms."""
import argparse
import ast
import copy
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys

sys.dont_write_bytecode = True
from adversarial import cases

ROOT = Path(__file__).resolve().parents[2]


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def parameters_for(node, exclude_self=True):
    positional = node.args.posonlyargs + node.args.args
    defaults = [None] * (len(positional) - len(node.args.defaults)) + node.args.defaults
    parameters = []
    for argument, default in zip(positional, defaults):
        if exclude_self and argument.arg in ('self', 'cls'):
            continue
        value = {'name': argument.arg}
        if argument.annotation:
            value['type'] = ast.unparse(argument.annotation)
        if default is not None:
            value['default'] = ast.unparse(default)
        parameters.append(value)
    for argument, default in zip(node.args.kwonlyargs, node.args.kw_defaults):
        value = {'name': argument.arg}
        if argument.annotation:
            value['type'] = ast.unparse(argument.annotation)
        if default is not None:
            value['default'] = ast.unparse(default)
        parameters.append(value)
    return parameters


def interface_for(node, class_name=None):
    # Construct headers from arguments and annotations, excluding decorators,
    # docstrings, imports, local variables, helper methods, and body statements.
    header = f'def {node.name}({ast.unparse(node.args)})'
    if node.returns:
        header += ' -> ' + ast.unparse(node.returns)
    header += ':'
    item = {'kind': 'method' if class_name else 'function', 'name': node.name,
            'parameters': parameters_for(node, bool(class_name)), 'signature': header}
    if class_name:
        item['className'] = class_name
    if node.returns:
        item['returnType'] = ast.unparse(node.returns)
    return item


def extract_interfaces(source, fixtures):
    tree = ast.parse(source)
    entries = {fixture['entry'] for fixture in fixtures}
    roundtrips = {fixture['roundtrip'] for fixture in fixtures if 'roundtrip' in fixture}
    operation_names = {operation[0] for fixture in fixtures for operation in fixture.get('operations', [])}
    targets = entries | roundtrips
    interfaces, lines = [], []
    for node in tree.body:
        if isinstance(node, ast.FunctionDef) and node.name in targets:
            interface = interface_for(node)
            interfaces.append(interface)
            lines.extend([interface['signature'], '    pass', ''])
        elif isinstance(node, ast.ClassDef):
            methods = [child for child in node.body if isinstance(child, ast.FunctionDef)]
            if node.name in entries and operation_names:
                wanted = {'__init__'} | operation_names
            elif any(method.name in targets for method in methods):
                wanted = targets
            else:
                continue
            selected = [method for method in methods if method.name in wanted]
            if not selected:
                continue
            lines.append(f'class {node.name}:')
            for method in selected:
                interface = interface_for(method, node.name)
                interfaces.append(interface)
                lines.extend(['    ' + interface['signature'], '        pass', ''])
    if not interfaces:
        raise ValueError('No public interface was extracted')
    exposed = {interface['name'] for interface in interfaces} | {interface.get('className') for interface in interfaces}
    if not targets <= exposed or not operation_names <= exposed:
        raise ValueError(f'Incomplete judge interface: {targets | operation_names - exposed}')
    starter = '\n'.join(lines).strip() + '\n'
    assert_skeleton(starter)
    primary = next((interface for interface in interfaces if interface['name'] in entries), None)
    if primary is None:
        primary = next((interface for interface in interfaces if interface['name'] == '__init__'), interfaces[0])
    return starter, interfaces, primary['parameters']


def assert_skeleton(source):
    tree = ast.parse(source)
    for node in tree.body:
        assert isinstance(node, (ast.ClassDef, ast.FunctionDef)), 'Starter exposed executable top-level content'
        functions = node.body if isinstance(node, ast.ClassDef) else [node]
        for function in functions:
            assert isinstance(function, ast.FunctionDef), 'Starter exposed a non-interface class member'
            assert len(function.body) == 1 and isinstance(function.body[0], ast.Pass), 'Starter exposed a solution body'
            assert not function.decorator_list, 'Starter exposed executable decorators'


def generate(rows, check=False):
    assert len(rows) == 250 and len({row['id'] for row in rows}) == 250, 'Expected exactly the NeetCode 250'
    added = cases()
    assert set(added) <= {row['id'] for row in rows}, 'Adversarial suite targets an unknown problem'
    documents, manifest = [], []
    total_extra = 0
    for row in rows:
        fixtures = copy.deepcopy(row['fixtures'])
        initial = len(fixtures)
        keys = {compact([fixture['entry'], fixture['args'], fixture.get('operations')]) for fixture in fixtures}
        for extra in added.get(row['id'], []):
            fixture = {**copy.deepcopy(fixtures[0]), **extra}
            fixture['name'] = 'Practice check: ' + extra['name']
            key = compact([fixture['entry'], fixture['args'], fixture.get('operations')])
            if key not in keys:
                keys.add(key)
                fixtures.append(fixture)
        extra_count = len(fixtures) - initial
        total_extra += extra_count
        starter, interfaces, parameters = extract_interfaces(row['source'], fixtures)
        examples = [{'name': fixture['name'], 'input': fixture['args'], 'expected': fixture['expected'],
                     **({'operations': fixture['operations']} if 'operations' in fixture else {})}
                    for fixture in row['fixtures'][:2]]
        document = {'id': row['id'], 'title': row['title'], 'topic': row['topic'], 'difficulty': row['difficulty'],
                    'description': row['description'], 'examples': examples, 'starter': starter,
                    'parameters': parameters, 'interfaces': interfaces, 'fixtures': fixtures,
                    'validation': {'kind': 'practice-cases', 'count': len(fixtures), 'adversarialCount': extra_count}}
        assert set(document) == {'id', 'title', 'topic', 'difficulty', 'description', 'examples', 'starter',
                                 'parameters', 'interfaces', 'fixtures', 'validation'}, 'Unexpected public field'
        # A strict field allowlist and AST-only starter prevent code/trace/answer
        # guides from silently entering client payloads during future changes.
        documents.append(document)
        manifest.append({key: row[key] for key in ('id', 'title', 'topic', 'difficulty')})
    revision = hashlib.sha256(''.join(compact(document) for document in documents).encode()).hexdigest()[:16]
    folder = ROOT / 'public/logic/problems' / revision
    source = '// Generated by tools/logic/generate.cjs. No reference algorithms.\n'
    source += "import type { LogicProblemSummary } from './types';\n\n"
    source += 'export const logicManifest: LogicProblemSummary[] = ' + compact(manifest) + ';\n'
    source += 'export const logicRevision = ' + json.dumps(revision) + ';\n'
    metadata_path = ROOT / 'src/data/logic/manifest.ts'
    if check:
        assert metadata_path.read_text() == source, 'Practice manifest is stale; regenerate it'
        assert sorted(path.name for path in folder.glob('*.json')) == sorted(f"{row['id']}.json" for row in rows)
        for document in documents:
            assert (folder / f"{document['id']}.json").read_text() == compact(document) + '\n', f"{document['id']}: stale or leaked practice content"
    else:
        folder.mkdir(parents=True, exist_ok=True)
        for document in documents:
            (folder / f"{document['id']}.json").write_text(compact(document) + '\n')
        metadata_path.parent.mkdir(parents=True, exist_ok=True)
        metadata_path.write_text(source)
        for previous in folder.parent.iterdir():
            if previous.is_dir() and re.fullmatch(r'[a-f0-9]{16}', previous.name) and previous.name != revision:
                shutil.rmtree(previous)
    report = {'problems': len(documents), 'fixtures': sum(len(document['fixtures']) for document in documents),
              'addedAdversarialCases': total_extra, 'problemsWithAdditionalCases': sum(bool(document['validation']['adversarialCount']) for document in documents),
              'revision': revision, 'bytes': sum(len(compact(document).encode()) for document in documents),
              'referenceBodiesPublished': 0, 'scope': 'practice-cases'}
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    generate(json.load(sys.stdin), parser.parse_args().check)

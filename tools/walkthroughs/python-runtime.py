"""Record the displayed Python source using CPython's real execution events.

A line event occurs before execution, so its snapshot is delayed until the next
event in that same frame. Calls retain the suspended caller; returns include the
actual return value. Library functions and comprehensions are atomic operations.
"""
import __future__
import ast
import collections
import functools
import heapq
import inspect
import itertools
import json
import math
import random
import sys
import types
import typing


class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right


class MountainArray:
    def __init__(self, values):
        self.values = values

    def get(self, index):
        return self.values[index]

    def length(self):
        return len(self.values)


def node_class(problem_id):
    class Node:
        def __init__(self, val=0, second=None, topLeft=None, topRight=None,
                     bottomLeft=None, bottomRight=None):
            self.val = val
            if problem_id == 427:
                self.isLeaf = second
                self.topLeft, self.topRight = topLeft, topRight
                self.bottomLeft, self.bottomRight = bottomLeft, bottomRight
            elif problem_id == 133:
                self.neighbors = second or []
            else:
                self.next, self.random = second, None
    return Node


def convert(value, Node):
    if isinstance(value, list):
        return [convert(item, Node) for item in value]
    if not isinstance(value, dict):
        return value
    if '$tree' in value:
        values = value['$tree']
        if not values or values[0] is None:
            return None
        root = TreeNode(values[0])
        queue, index = [root], 1
        for parent in queue:
            for side in ('left', 'right'):
                if index >= len(values):
                    return root
                item = values[index]
                index += 1
                if item is not None:
                    child = TreeNode(item)
                    setattr(parent, side, child)
                    queue.append(child)
        return root
    if '$list' in value:
        nodes = [ListNode(item) for item in value['$list']]
        for index in range(len(nodes) - 1):
            nodes[index].next = nodes[index + 1]
        if nodes and value.get('cycle', -1) >= 0:
            nodes[-1].next = nodes[value['cycle']]
        return nodes[0] if nodes else None
    if '$randomList' in value:
        nodes = [Node(item[0]) for item in value['$randomList']]
        for index, node in enumerate(nodes):
            node.next = nodes[index + 1] if index + 1 < len(nodes) else None
            other = value['$randomList'][index][1]
            node.random = nodes[other] if other is not None else None
        return nodes[0] if nodes else None
    if '$graph' in value:
        nodes = [Node(index + 1, []) for index in range(len(value['$graph']))]
        for node, neighbors in zip(nodes, value['$graph']):
            node.neighbors = [nodes[index - 1] for index in neighbors]
        return nodes[0] if nodes else None
    if '$mountain' in value:
        return MountainArray(value['$mountain'])
    return {key: convert(item, Node) for key, item in value.items()}


def normalize(value, output=None, size=None):
    if output == 'tree':
        values, queue = [], [value] if value is not None else []
        for node in queue:
            values.append(node.val if node else None)
            if node:
                queue.extend((node.left, node.right))
        while values and values[-1] is None:
            values.pop()
        return values
    if output == 'node':
        return value.val if value is not None else None
    if output in ('list', 'randomList'):
        nodes, seen = [], set()
        while value is not None and id(value) not in seen:
            nodes.append(value)
            seen.add(id(value))
            value = value.next
        return [node.val if output == 'list' else
                [node.val, nodes.index(node.random) if node.random else None]
                for node in nodes]
    if output == 'graph':
        nodes, seen = ([value], {id(value)}) if value else ([], set())
        for node in nodes:
            for child in node.neighbors:
                if id(child) not in seen:
                    seen.add(id(child))
                    nodes.append(child)
        return [sorted(child.val for child in node.neighbors)
                for node in sorted(nodes, key=lambda item: item.val)]
    if output == 'quad':
        def expand(node, n):
            if node.isLeaf:
                return [[int(node.val)] * n for _ in range(n)]
            a, b, c, d = [expand(child, n // 2) for child in
                          (node.topLeft, node.topRight, node.bottomLeft, node.bottomRight)]
            return [left + right for left, right in zip(a, b)] + [left + right for left, right in zip(c, d)]
        return expand(value, size)
    if isinstance(value, (tuple, list, set, frozenset, collections.deque)):
        return [normalize(item) for item in value]
    if isinstance(value, dict):
        return {key: normalize(item) for key, item in value.items()}
    return value


class Recorder:
    def __init__(self, source, filename):
        self.source, self.filename = source, filename
        self.lines = source.splitlines()
        self.steps, self.frames = [], []
        self.pending, self.roots, self.identities, self.previous = {}, {}, {}, {}
        self.retained = []  # Prevent object-id reuse within one recording.
        self.sites, self.site_keys = [], {}
        self.function_lines = {}
        for node in ast.walk(ast.parse(source)):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                first = min([node.lineno] + [decorator.lineno for decorator in node.decorator_list])
                self.function_lines[(node.name, first)] = node.lineno

    def snapshot(self, frame, returned=None):
        heap = {}

        def encode(value):
            if value is None or isinstance(value, (str, bool)):
                return value
            if isinstance(value, int):
                return value if abs(value) <= 9007199254740991 else {'$scalar': str(value)}
            if isinstance(value, float):
                return value if math.isfinite(value) else {'$scalar': str(value)}
            if isinstance(value, (types.FunctionType, types.MethodType, types.BuiltinFunctionType, type)):
                return {'$scalar': 'function'}
            if isinstance(value, types.ModuleType):
                return {'$scalar': 'module ' + value.__name__}
            if not isinstance(value, (list, tuple, dict, set, frozenset, collections.deque, range)) and not hasattr(value, '__dict__'):
                return {'$scalar': '<' + type(value).__name__ + '>'}
            identity = id(value)
            if identity not in self.identities:
                self.identities[identity] = 'o' + str(len(self.identities) + 1)
                self.retained.append(value)
            key = self.identities[identity]
            if key in heap:
                return {'$ref': key}
            entry = heap[key] = {'kind': 'object', 'typeName': type(value).__name__}
            if isinstance(value, (list, tuple, collections.deque, range)):
                entry.update(kind='array', items=[encode(item) for item in value])
            elif isinstance(value, (set, frozenset)):
                # Sort only the display snapshot; do not change execution order.
                entry.update(kind='set', items=[encode(item) for item in sorted(value, key=lambda item: (type(item).__name__, repr(item)))])
            elif isinstance(value, dict):
                entry.update(kind='map', entries=[[encode(k), encode(v)] for k, v in value.items()])
            else:
                fields = vars(value)
                entry['fields'] = {name: encode(item) for name, item in fields.items()
                                   if not callable(item)}
                if {'isLeaf', 'topLeft'} <= fields.keys():
                    entry['kind'] = 'quad'
                elif {'left', 'right', 'val'} <= fields.keys():
                    entry['kind'] = 'tree'
                elif {'neighbors', 'val'} <= fields.keys():
                    entry['kind'] = 'graph'
                elif {'next', 'val'} <= fields.keys():
                    entry['kind'] = 'list'
            return {'$ref': key}

        inputs = {name: encode(value) for name, value in self.roots.items()}
        state = {name: encode(value) for name, value in frame.f_locals.items()
                 if not name.startswith('__') and not isinstance(value, (types.ModuleType, type)) and not callable(value)}
        result = encode(returned)
        changed = {}
        for key, item in heap.items():
            serialized = json.dumps(item, separators=(',', ':'))
            if self.previous.get(key) != serialized:
                changed[key] = item
                self.previous[key] = serialized
        return state, inputs, changed, result

    def append(self, frame, line, kind='statement', value=None):
        if len(self.steps) >= 50000:
            raise RuntimeError('Trace exceeded 50,000 steps; use a smaller teaching example.')
        label = self.lines[line - 1].strip()
        if kind == 'call':
            label = frame.f_code.co_name + '(' + ', '.join(frame.f_code.co_varnames[:frame.f_code.co_argcount]) + ')'
        site_key = (line, kind, label)
        if site_key not in self.site_keys:
            self.site_keys[site_key] = len(self.sites)
            self.sites.append({'line': line, 'kind': kind, 'label': label})
        state, inputs, heap, returned = self.snapshot(frame, value)
        self.steps.append({'site': self.site_keys[site_key], 'line': line, 'lines': [line],
                           'kind': kind, 'label': label, 'state': state, 'input': inputs,
                           'heap': heap, 'value': returned,
                           'stack': [item.f_code.co_name + '(' + ', '.join(item.f_code.co_varnames[:item.f_code.co_argcount]) + ')' for item in self.frames]})

    def trace(self, frame, event, arg):
        if frame.f_code.co_filename != self.filename or frame.f_code.co_name.startswith('<'):
            return None
        if event == 'call':
            self.frames.append(frame)
            line = self.function_lines.get((frame.f_code.co_name, frame.f_code.co_firstlineno), frame.f_code.co_firstlineno)
            self.append(frame, line, 'call')
        elif event == 'line':
            previous = self.pending.pop(id(frame), None)
            if previous is not None:
                self.append(frame, previous)
            self.pending[id(frame)] = frame.f_lineno
        elif event == 'return':
            previous = self.pending.pop(id(frame), None)
            line = previous or frame.f_lineno
            self.append(frame, line, 'return', arg)
            if self.frames and self.frames[-1] is frame:
                self.frames.pop()
        elif event == 'exception':
            # A failed line is not a successfully completed statement. The next
            # handled line or propagated exception determines what follows.
            self.pending.pop(id(frame), None)
        return self.trace


def indexing_for(source):
    result = {}

    def name(node):
        if isinstance(node, ast.Name):
            return node.id
        if isinstance(node, ast.Attribute):
            parent = name(node.value)
            return parent + '.' + node.attr if parent else None

    def index(node):
        # Python 3.8 wraps the index in ast.Index; 3.9+ does not.
        return node.value if isinstance(node, ast.Index) else node

    for node in ast.walk(ast.parse(source)):
        if not isinstance(node, ast.Subscript):
            continue
        key, position = name(node.value), index(node.slice)
        if key and isinstance(position, ast.Name):
            entry = result.setdefault(key, {'indices': [], 'cells': []})
            if position.id not in entry['indices']:
                entry['indices'].append(position.id)
        if isinstance(node.value, ast.Subscript):
            key, row = name(node.value.value), index(node.value.slice)
            if key and isinstance(row, ast.Name) and isinstance(position, ast.Name):
                entry = result.setdefault(key, {'indices': [], 'cells': []})
                cell = [row.id, position.id]
                if cell not in entry['cells']:
                    entry['cells'].append(cell)
    return result


def execute(source, fixture, problem_id, traced=True):
    random.seed(fixture.get('seed', 250))
    Node = node_class(problem_id)
    namespace = {'ListNode': ListNode, 'TreeNode': TreeNode, 'Node': Node, '_Node': Node,
                 'MountainArray': MountainArray, 'guess': lambda n: 0 if n == fixture['pick'] else 1 if n < fixture['pick'] else -1}
    # LeetCode supplies typing and standard helpers to submitted snippets.
    for module in (typing, collections, functools, heapq, math, itertools):
        namespace.update({key: value for key, value in vars(module).items() if not key.startswith('_')})
    filename = '<leetcode-python-solution>'
    compiled = compile(source, filename, 'exec', flags=__future__.annotations.compiler_flag)
    exec(compiled, namespace)
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
    recorder = Recorder(source, filename)

    def invoke(function, values, instance=None):
        bound = inspect.signature(function).bind(*values)
        recorder.roots = dict(bound.arguments)
        if instance is not None:
            recorder.roots = {'instance': instance, **recorder.roots}
        old_trace = sys.gettrace()
        try:
            if traced:
                sys.settrace(recorder.trace)
            return function(*values)
        finally:
            if traced:
                sys.settrace(old_trace)

    entry = fixture['entry']
    if fixture.get('operations') is not None:
        instance = invoke(namespace[entry], args)
        result = [None]
        for method, values in fixture['operations']:
            returned = invoke(getattr(instance, method), [convert(value, Node) for value in values], instance)
            result.append(normalize(returned))
    else:
        definitions = ast.parse(source).body
        functions = {node.name for node in definitions if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
        classes = [namespace[node.name] for node in definitions if isinstance(node, ast.ClassDef)]
        if entry in functions:
            function = namespace[entry]
            instance = None
        else:
            candidates = [value for value in classes if hasattr(value, entry)]
            if not candidates:
                raise ValueError('No Python entry point for ' + entry)
            instance = candidates[0]()
            function = getattr(instance, entry)
        returned = invoke(function, args)
        if fixture.get('roundtrip'):
            other = fixture['roundtrip']
            function = getattr(instance, other) if instance is not None else namespace[other]
            returned = invoke(function, [returned])
        if 'prefix' in fixture and args[0][:returned] != fixture['prefix']:
            raise AssertionError('Incorrect in-place output prefix')
        if fixture.get('distinctClone'):
            def collect(root):
                queue, seen = [root], set()
                for node in queue:
                    if node is None or id(node) in seen:
                        continue
                    seen.add(id(node))
                    queue.extend((getattr(node, 'next', None), getattr(node, 'random', None)))
                    queue.extend(getattr(node, 'neighbors', []))
                return seen
            if collect(args[0]) & collect(returned):
                raise AssertionError('Clone shares input nodes')
        value = args[fixture['resultArg']] if 'resultArg' in fixture else returned
        result = normalize(value, fixture.get('output'), len(fixture['args'][0]) if fixture.get('output') == 'quad' else None)
    return {'result': result, 'steps': recorder.steps, 'sites': recorder.sites,
            'indexing': indexing_for(source)}


if __name__ == '__main__':
    # JSON lines keep per-example errors isolated while one interpreter handles
    # the complete catalog. No example is silently omitted by the verifier.
    for line in sys.stdin:
        try:
            request = json.loads(line)
            result = execute(request['source'], request['fixture'], request['id'], request.get('traced', True))
            print(json.dumps(result, separators=(',', ':'), allow_nan=False), flush=True)
        except Exception as error:
            print(json.dumps({'error': type(error).__name__ + ': ' + str(error)}), flush=True)

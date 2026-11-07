"""Independent checks for Python event timing and fixture adapters."""
import importlib.util
import json
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('python_runtime', Path(__file__).with_name('python-runtime.py'))
runtime = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runtime)


def materialized_steps(execution):
    heap = {}
    for step in execution['steps']:
        heap.update(step['heap'])
        yield step, dict(heap)


def value(step, heap, name):
    encoded = step['state'][name]
    return heap[encoded['$ref']] if isinstance(encoded, dict) and '$ref' in encoded else encoded


class PythonRecorderTests(unittest.TestCase):
    def test_completed_line_contains_its_new_values(self):
        source = ('class Solution:\n'
                  '    def calculate(self, nums):\n'
                  '        total = 0\n'
                  '        for item in nums:\n'
                  '            total += item\n'
                  '        return total')
        run = runtime.execute(source, {'entry': 'calculate', 'args': [[2, 5]]}, 1)
        self.assertEqual(run['result'], 7)
        additions = [step for step in run['steps'] if step['line'] == 5]
        self.assertEqual([step['state']['total'] for step in additions], [2, 7])
        self.assertEqual([step['state']['item'] for step in additions], [2, 5])
        self.assertEqual(run['steps'][-1]['value'], 7)
        self.assertEqual(run['steps'][-1]['kind'], 'return')

    def test_calling_statement_waits_for_the_callee_to_return(self):
        source = ('class Solution:\n'
                  '    def calculate(self, number):\n'
                  '        def double(value):\n'
                  '            answer = value * 2\n'
                  '            return answer\n'
                  '        result = double(number)\n'
                  '        return result')
        run = runtime.execute(source, {'entry': 'calculate', 'args': [4]}, 1)
        call_index = next(i for i, step in enumerate(run['steps']) if step['kind'] == 'call' and step['line'] == 3)
        return_index = next(i for i, step in enumerate(run['steps']) if step['kind'] == 'return' and step['line'] == 5)
        assignment_index = next(i for i, step in enumerate(run['steps']) if step['line'] == 6)
        self.assertLess(call_index, return_index)
        self.assertLess(return_index, assignment_index)
        self.assertEqual(run['steps'][assignment_index]['state']['result'], 8)
        self.assertEqual(run['steps'][return_index]['stack'], ['calculate(self, number)', 'double(value)'])

    def test_recursion_retains_root_inputs_and_real_stack_depth(self):
        source = ('class Solution:\n'
                  '    def factorial(self, n):\n'
                  '        if n < 2:\n'
                  '            return 1\n'
                  '        result = n * self.factorial(n - 1)\n'
                  '        return result')
        run = runtime.execute(source, {'entry': 'factorial', 'args': [4]}, 1)
        self.assertEqual(run['result'], 24)
        self.assertEqual(max(len(step['stack']) for step in run['steps']), 4)
        self.assertTrue(all(step['input']['n'] == 4 for step in run['steps']))
        self.assertEqual([step['value'] for step in run['steps'] if step['kind'] == 'return'], [1, 2, 6, 24])

    def test_heap_aliases_mutations_and_old_snapshots(self):
        source = ('class Solution:\n'
                  '    def mutate(self, nums):\n'
                  '        alias = nums\n'
                  '        alias.append(9)\n'
                  '        nums[0] = 8\n'
                  '        return nums')
        run = runtime.execute(source, {'entry': 'mutate', 'args': [[1]]}, 1)
        snapshots = {step['line']: (step, heap) for step, heap in materialized_steps(run) if step['kind'] == 'statement'}
        initial, heap = snapshots[3]
        self.assertEqual(initial['state']['alias'], initial['state']['nums'])
        self.assertEqual(value(initial, heap, 'nums')['items'], [1])
        appended, heap = snapshots[4]
        self.assertEqual(value(appended, heap, 'nums')['items'], [1, 9])
        changed, heap = snapshots[5]
        self.assertEqual(value(changed, heap, 'nums')['items'], [8, 9])
        self.assertEqual(run['result'], [8, 9])

    def test_design_operations_keep_instance_state(self):
        source = ('class Counter:\n'
                  '    def __init__(self, start):\n'
                  '        self.count = start\n'
                  '    def add(self, amount):\n'
                  '        self.count += amount\n'
                  '        return self.count')
        fixture = {'entry': 'Counter', 'args': [2], 'operations': [['add', [3]], ['add', [-1]]]}
        run = runtime.execute(source, fixture, 1)
        self.assertEqual(run['result'], [None, 5, 4])
        returns = [(step, heap) for step, heap in materialized_steps(run) if step['kind'] == 'return' and step['line'] == 6]
        self.assertEqual([heap[step['input']['instance']['$ref']]['fields']['count'] for step, heap in returns], [5, 4])
        self.assertEqual(returns[0][0]['input']['instance'], returns[1][0]['input']['instance'])

    def test_python_containers_keep_types_and_dict_keys(self):
        source = ('from collections import deque\n'
                  'class Solution:\n'
                  '    def build(self, number):\n'
                  '        values = (number, None)\n'
                  '        mapping = {number: values}\n'
                  '        queue = deque([number])\n'
                  '        return True')
        run = runtime.execute(source, {'entry': 'build', 'args': [3]}, 1)
        final, heap = list(materialized_steps(run))[-1]
        self.assertEqual(value(final, heap, 'values')['typeName'], 'tuple')
        self.assertEqual(value(final, heap, 'mapping')['typeName'], 'dict')
        self.assertEqual(value(final, heap, 'mapping')['entries'][0][0], 3)
        self.assertEqual(value(final, heap, 'queue')['typeName'], 'deque')
        self.assertIs(final['value'], True)

    def test_node_adapters_preserve_cycles_without_recursing_forever(self):
        source = ('class Solution:\n'
                  '    def same(self, head):\n'
                  '        cursor = head.next\n'
                  '        return cursor.next == head')
        fixture = {'entry': 'same', 'args': [{'$list': [2, 3], 'cycle': 0}]}
        run = runtime.execute(source, fixture, 141)
        self.assertIs(run['result'], True)
        final, heap = list(materialized_steps(run))[-1]
        head = final['input']['head']
        next_node = heap[head['$ref']]['fields']['next']
        self.assertEqual(heap[next_node['$ref']]['fields']['next'], head)

    def test_plain_and_traced_are_identical_for_in_place_output(self):
        source = ('class Solution:\n'
                  '    def reverse(self, nums):\n'
                  '        nums.reverse()')
        fixture = {'entry': 'reverse', 'args': [[1, 2, 3]], 'resultArg': 0}
        plain = runtime.execute(source, fixture, 344, False)
        traced = runtime.execute(source, fixture, 344, True)
        self.assertEqual(plain['result'], [3, 2, 1])
        self.assertEqual(plain['result'], traced['result'])
        self.assertEqual(plain['steps'], [])

    def test_shared_standard_library_names_do_not_override_solution_methods(self):
        source = ('class Solution:\n'
                  '    def merge(self, first, second):\n'
                  '        return first + second')
        run = runtime.execute(source, {'entry': 'merge', 'args': [[1], [2]]}, 1)
        self.assertEqual(run['result'], [1, 2])

    def test_index_metadata_uses_python_variable_names(self):
        source = ('class Solution:\n'
                  '    def read(self, grid, r, c):\n'
                  '        return grid[r][c]')
        indexing = runtime.indexing_for(source)
        self.assertEqual(indexing['grid']['indices'], ['r'])
        self.assertEqual(indexing['grid']['cells'], [['r', 'c']])

    def test_retained_heap_entries_are_json_serializable(self):
        source = ('class Solution:\n'
                  '    def calculate(self, n):\n'
                  '        result = float("inf")\n'
                  '        bits = 1 << 70\n'
                  '        return n')
        run = runtime.execute(source, {'entry': 'calculate', 'args': [2]}, 1)
        json.dumps(run, allow_nan=False)
        final = run['steps'][-1]
        self.assertEqual(final['state']['result'], {'$scalar': 'inf'})
        self.assertEqual(final['state']['bits'], {'$scalar': str(1 << 70)})

    def test_decorated_helpers_highlight_the_function_header(self):
        source = ('from functools import cache\n'
                  'class Solution:\n'
                  '    def calculate(self, n):\n'
                  '        @cache\n'
                  '        def square(value):\n'
                  '            return value * value\n'
                  '        return square(n) + square(n)')
        run = runtime.execute(source, {'entry': 'calculate', 'args': [3]}, 1)
        self.assertEqual(run['result'], 18)
        calls = [step for step in run['steps'] if step['kind'] == 'call' and step['label'].startswith('square(')]
        self.assertEqual(len(calls), 1)
        self.assertEqual(calls[0]['line'], 5)


if __name__ == '__main__':
    unittest.main()

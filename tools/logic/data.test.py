import ast
from itertools import product
import json
from pathlib import Path
import re
import sys
import unittest

sys.dont_write_bytecode = True
from adversarial import anagram, cases, daily_temperatures, duplicate, max_subarray, parentheses, product_except_self, robber, search, stairs, stock, two_sum
from generate import assert_skeleton, extract_interfaces

ROOT = Path(__file__).resolve().parents[2]


class InterfaceExtractionTests(unittest.TestCase):
    def test_only_the_public_interface_survives(self):
        source = '''import heapq
SECRET_ALGORITHM = 42
class Helper:
    def work(self):
        return SECRET_ALGORITHM
class Solution:
    def solve(self, nums: list[int], target: int = 3) -> int:
        """Use a heap and keep the largest value."""
        heapq.heapify(nums)
        return Helper().work()
    def helper(self):
        return 1
'''
        starter, interfaces, parameters = extract_interfaces(source, [{'entry': 'solve'}])
        self.assertEqual(starter, 'class Solution:\n    def solve(self, nums: list[int], target: int=3) -> int:\n        pass\n')
        self.assertEqual([item['name'] for item in parameters], ['nums', 'target'])
        for forbidden in ['heapq', 'SECRET', 'Helper', 'helper', 'return', 'largest']:
            self.assertNotIn(forbidden, starter)
        self.assertEqual(len(interfaces), 1)

    def test_design_and_roundtrip_methods_are_complete_without_helpers(self):
        design = '''class Cache:
    def __init__(self, capacity: int):
        self.internal_order = []
    def get(self, key: int) -> int:
        return 1
    def put(self, key: int, value: int):
        self.internal_order.append(key)
    def _move_to_front(self, key):
        pass
'''
        starter, interfaces, parameters = extract_interfaces(design, [{'entry': 'Cache', 'operations': [['get', [1]], ['put', [1, 2]]]}])
        self.assertEqual([item['name'] for item in interfaces], ['__init__', 'get', 'put'])
        self.assertEqual(parameters, [{'name': 'capacity', 'type': 'int'}])
        self.assertNotIn('internal_order', starter)
        self.assertNotIn('_move_to_front', starter)
        codec = 'class Codec:\n def encode(self, value):\n  return value\n def decode(self, text):\n  return text\n'
        starter, interfaces, _ = extract_interfaces(codec, [{'entry': 'encode', 'roundtrip': 'decode'}])
        self.assertEqual([item['name'] for item in interfaces], ['encode', 'decode'])
        assert_skeleton(starter)

    def test_all_250_published_documents_are_interface_only(self):
        text = (ROOT / 'src/data/logic/manifest.ts').read_text()
        revision = re.search(r'logicRevision = "([a-f0-9]+)"', text).group(1)
        paths = list((ROOT / 'public/logic/problems' / revision).glob('*.json'))
        self.assertEqual(len(paths), 250)
        total = 0
        for path in paths:
            document = json.loads(path.read_text())
            self.assertEqual(set(document), {'id', 'title', 'topic', 'difficulty', 'description', 'examples',
                                           'starter', 'parameters', 'interfaces', 'fixtures', 'validation'})
            self.assertEqual(document['id'], int(path.stem))
            assert_skeleton(document['starter'])
            self.assertEqual(document['validation']['kind'], 'practice-cases')
            self.assertEqual(document['validation']['count'], len(document['fixtures']))
            total += len(document['fixtures'])
            self.assertGreaterEqual(len(document['fixtures']), 2)
            for interface in document['interfaces']:
                self.assertEqual(set(interface) - {'kind', 'className', 'name', 'parameters', 'returnType', 'signature'}, set())
                ast.parse(interface['signature'] + '\n    pass')
        self.assertEqual(total, 730)


class AdversarialOracleTests(unittest.TestCase):
    def test_daily_temperatures_cases_distinguish_strictness_distance_and_all_pending_days(self):
        self.assertEqual(daily_temperatures([70, 70, 71]), [2, 1, 0])
        self.assertEqual(daily_temperatures([75, 74, 73]), [0, 0, 0])
        self.assertEqual(daily_temperatures([70]), [0])
        self.assertEqual(daily_temperatures([75, 70, 65, 80]), [3, 2, 1, 0])
        def candidate(temperatures, equal=False, pop_all=True, reverse_distance=False):
            result = [0] * len(temperatures)
            stack = []
            for i, temperature in enumerate(temperatures):
                while stack and (temperature >= temperatures[stack[-1]] if equal else temperature > temperatures[stack[-1]]):
                    j = stack.pop()
                    result[j] = j - i if reverse_distance else i - j
                    if not pop_all:
                        break
                stack.append(i)
            return result
        for options in ({'equal': True}, {'pop_all': False}, {'reverse_distance': True}):
            self.assertTrue(any(candidate(*case['args'], **options) != case['expected'] for case in cases()[739]), options)

    def test_independent_oracles_on_small_known_cases(self):
        self.assertEqual(two_sum([0, 4, 3, 0], 0), [0, 3])
        self.assertTrue(duplicate([-2, 1, -2]))
        self.assertFalse(anagram('aacc', 'ccac'))
        self.assertEqual(search([1, 3], 3), 1)
        self.assertEqual(stock([3, 2, 6, 5, 0, 3]), 4)
        self.assertEqual(product_except_self([-1, 1, 0, -3, 3]), [0, 0, 9, 0, 0])
        self.assertEqual(max_subarray([-3, -2, -5]), -2)
        self.assertEqual([stairs(n) for n in range(1, 9)], [1, 2, 3, 5, 8, 13, 21, 34])
        self.assertEqual(robber([2, 1, 1, 2]), 4)

    def test_pair_deletion_matches_an_independent_stack_oracle(self):
        def stack_oracle(value):
            stack = []
            closers = {')': '(', ']': '[', '}': '{'}
            for character in value:
                if character in closers:
                    if not stack or stack.pop() != closers[character]:
                        return False
                else:
                    stack.append(character)
            return not stack
        for length in range(1, 6):
            for symbols in product('()[]{}', repeat=length):
                value = ''.join(symbols)
                self.assertEqual(parentheses(value), stack_oracle(value), value)

    def test_cases_expose_eight_real_logic_mistakes(self):
        suite = cases()

        def self_reusing_two_sum(nums, target):
            seen = {}
            for i, value in enumerate(nums):
                seen[value] = i
                if target - value in seen:
                    return [seen[target - value], i]

        def missing_final_binary_check(nums, target):
            left, right = 0, len(nums) - 1
            while left < right:
                middle = (left + right) // 2
                if nums[middle] == target:
                    return middle
                if nums[middle] < target:
                    left = middle + 1
                else:
                    right = middle - 1
            return -1

        def divide_with_zeros(nums):
            total = 1
            for number in nums:
                total *= number
            return [total // number for number in nums]

        mutants = [
            (1, self_reusing_two_sum),
            (217, lambda nums: any(a == b for a, b in zip(nums, nums[1:]))),
            (242, lambda left, right: set(left) == set(right)),
            (704, missing_final_binary_check),
            (121, lambda prices: max(prices) - min(prices)),
            (121, lambda prices: sum(max(0, b - a) for a, b in zip(prices, prices[1:]))),
            (53, lambda nums: max(0, max_subarray(nums))),
            (238, divide_with_zeros),
        ]
        for problem_id, candidate in mutants:
            failed = False
            for case in suite[problem_id]:
                try:
                    actual = candidate(*case['args'])
                    failed |= actual != case['expected']
                except Exception:
                    failed = True
            self.assertTrue(failed, f'Cases did not distinguish incorrect {problem_id} candidate')


if __name__ == '__main__':
    unittest.main()

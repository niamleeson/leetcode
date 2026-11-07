import ast
import importlib.util
from pathlib import Path
import sys
import unittest

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location('guided_generator', Path(__file__).with_name('generate-guided.py'))
guided = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guided)


def row(source='def solve(value):\n    return value + 1\n'):
    return {'id': 999999, 'source': source, 'explanation': 'Add one to the input value before returning it.',
            'fixtures': [{'name': 'Zero', 'entry': 'solve', 'args': [0], 'expected': 1},
                         {'name': 'Negative input', 'entry': 'solve', 'args': [-2], 'expected': -1}]}


class ExecutableDistractorTests(unittest.TestCase):
    def test_records_a_real_counterexample_and_never_marks_equivalent_code_wrong(self):
        data = row()
        self.assertIsNone(guided.counterexample(data, 'def solve(value):\n    return 1 + value\n'))
        witness = guided.counterexample(data, 'def solve(value):\n    return value - 1\n')
        self.assertEqual(witness['input'], [0])
        self.assertEqual(witness['expected'], 1)
        self.assertEqual(witness['actual'], -1)

    def test_missing_names_and_execution_limits_are_not_accepted_as_proof(self):
        data = row()
        self.assertIsNone(guided.counterexample(data, 'def solve(value):\n    return missing_name\n'))
        self.assertIsNone(guided.counterexample(data, 'def solve(value):\n    while True:\n        pass\n'))

    def test_questions_include_distinct_tested_options_without_revealing_the_line(self):
        data = row()
        tree = ast.parse(data['source'])
        parents = {child: node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
        question = guided.question_for(data, data['source'], tree.body[0].body[0], parents)
        self.assertEqual(question['line'], 2)
        self.assertEqual(sum(choice['correct'] for choice in question['choices']), 1)
        self.assertNotIn('return value + 1', question['context'])
        self.assertGreaterEqual(len(question['choices']), 3)
        for choice in question['choices']:
            candidate = guided.patch_lines(data['source'], question['line'], question['endLine'], choice['code'])
            result = guided.execute(data, candidate)
            if choice['correct']:
                self.assertEqual(result['passed'], result['total'])
            else:
                self.assertLess(result['passed'], result['total'])
                self.assertIn('witness', choice)

    def test_skips_a_question_whose_only_failures_are_type_errors(self):
        data = {'id': 999999, 'source': 'def solve(value):\n    seen = set()\n    return len(seen)\n',
                'explanation': 'Start with an empty set.',
                'fixtures': [{'name': 'Input', 'entry': 'solve', 'args': [3], 'expected': 0}]}
        tree = ast.parse(data['source'])
        parents = {child: node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
        self.assertIsNone(guided.question_for(data, data['source'], tree.body[0].body[0], parents))

    def test_in_place_oracle_assertions_are_meaningful_logic_witnesses(self):
        self.assertTrue(guided.semantic_failure({'error': {'type': 'AssertionError', 'message': 'Wrong array prefix'}}))
        self.assertFalse(guided.semantic_failure({'error': {'type': 'TypeError', 'message': 'Not iterable'}}))

    def test_source_hash_prevents_stale_curriculum_grading(self):
        data = row()
        curriculum = {'lessons': {str(data['id']): {'sourceHashes': {'python': 'stale'}}}}
        with self.assertRaisesRegex(AssertionError, 'curriculum audit'):
            guided.curriculum_questions(data, 'python', curriculum)

    def test_unordered_set_iteration_never_uses_hash_dependent_first_or_last_slices(self):
        source = 'def solve(values):\n    items = set(values)\n    count = 0\n    for item in items:\n        count += 1\n    return count\n'
        statement = ast.parse(source).body[0].body[2]
        _line, _end, _original, candidates = guided.statement_candidates(source, statement)
        codes = [candidate['code'] for candidate in candidates]
        self.assertNotIn('    for item in list(items)[1:]:', codes)
        self.assertNotIn('    for item in list(items)[:-1]:', codes)
        self.assertIn('    for item in []:', codes)

    def test_quality_filter_preserves_two_substantive_decisions_and_recounts_witnesses(self):
        def question(question_id, code, wrong, line):
            return {'id': question_id, 'stage': 'implementation', 'prompt': 'Which value should this path return?',
                    'line': line, 'endLine': line,
                    'choices': [{'id': 'correct', 'correct': True, 'code': code, 'feedback': 'Old feedback'}] +
                               [{'id': str(index), 'correct': False, 'code': value, 'feedback': 'Wrong', 'witness': {}}
                                for index, value in enumerate(wrong)]}
        weak = question('default-options', 'return result', ['return 0', 'return []', 'return None'], 3)
        substantive = question('calculation', 'return value + 1', ['return value - 1', 'return value * 2'], 1)
        other = question('comparison', 'return value == 0', ['return value != 0', 'return value < 0'], 2)
        document = {'language': 'python', 'sourceHash': 'hash', 'questions': [substantive, other, weak],
                    'validation': {'correctCases': 2, 'wrongChoices': 7, 'testedWitnesses': 7}}
        self.assertTrue(guided.weak_return_question(weak))
        reviewed = guided.review_implementation(row(), document, {'overrides': []})
        self.assertEqual([item['id'] for item in reviewed['questions']], ['calculation', 'comparison'])
        self.assertEqual(reviewed['validation']['wrongChoices'], 4)
        self.assertEqual(len(document['questions']), 3)
        scarce = {**document, 'questions': [substantive, weak]}
        self.assertEqual(len(guided.review_implementation(row(), scarce, {'overrides': []})['questions']), 2)

    def test_correct_feedback_explains_current_loop_without_copying_later_answers(self):
        question = {'prompt': 'Which values should this loop visit?', 'choices': [
            {'correct': True, 'code': 'for i, num in enumerate(nums):'}]}
        feedback = guided.current_operation_feedback(question, 'python')
        self.assertIn('bounds', feedback)
        self.assertNotIn('target', feedback)
        self.assertNotIn('complement', feedback)


if __name__ == '__main__':
    unittest.main()

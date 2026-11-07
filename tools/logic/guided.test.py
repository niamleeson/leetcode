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

    def test_set_order_key_error_uses_a_fixture_with_a_stable_first_key(self):
        source = 'def solve(begin, end, words):\n    word_set = set(words)\n    word_set.add(begin)\n    neighbors = {}\n    for word in word_set:\n        neighbors["*" + word[1:]].append(word)\n    return 2\n'
        data = {'id': 127, 'fixtures': [
            {'name': 'Different initial keys', 'entry': 'solve', 'args': ['hit', 'cog', ['cog']], 'expected': 0},
            {'name': 'Same initial key', 'entry': 'solve', 'args': ['hit', 'cit', ['cit']], 'expected': 2}]}
        witness = guided.counterexample(data, source)
        self.assertEqual(witness['fixtureIndex'], 1)
        self.assertEqual(witness['error'], {'type': 'KeyError', 'message': "'*it'"})

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

    def test_review_keeps_finishing_return_and_recounts_all_witnesses(self):
        data = row('def solve(value):\n    first = value\n    result = first + 1\n    return result\n')
        def question(question_id, code, wrong, line):
            return {'id': question_id, 'stage': 'implementation', 'prompt': 'Which operation belongs here?',
                    'line': line, 'endLine': line, 'coveredLines': [line],
                    'choices': [{'id': 'correct', 'correct': True, 'code': code, 'feedback': 'Old feedback'}] +
                               [{'id': str(index), 'correct': False, 'code': value, 'feedback': 'Wrong',
                                 'witness': {'fixtureIndex': 0, 'name': 'Old display name'}}
                                for index, value in enumerate(wrong)]}
        setup = question('setup', '    first = value', ['    first = -value'], 2)
        update = question('update', '    result = first + 1', ['    result = first - 1'], 3)
        finish = question('finish', '    return result', ['    return 0', '    return []'], 4)
        document = {'language': 'python', 'source': data['source'], 'sourceHash': guided.digest(data['source']),
                    'questions': [setup, update, finish],
                    'coverage': {'requiredLines': [2, 3, 4], 'coveredLines': [2, 3, 4], 'terminalLines': [4]},
                    'validation': {'correctCases': 2, 'wrongChoices': 4, 'testedWitnesses': 4}}
        reviewed = guided.review_implementation(data, document, {'overrides': []})
        self.assertEqual([item['id'] for item in reviewed['questions']], ['setup', 'update', 'finish'])
        self.assertEqual(reviewed['validation']['wrongChoices'], 4)
        self.assertEqual(reviewed['coverage']['coveredLines'], [2, 3, 4])
        self.assertEqual(reviewed['questions'][0]['choices'][1]['witness']['name'], 'Zero')

    def test_bare_return_credit_requires_its_direct_guard_as_the_only_ast_change(self):
        source = 'def solve(value):\n    if value < 0:\n        return\n    value += 1\n'
        question = {'line': 2, 'endLine': 4, 'choices': [
            {'id': 'correct', 'correct': True, 'code': '    if value < 0:\n        return\n    value += 1'},
            {'id': 'guard', 'correct': False, 'code': '    if value > 0:\n        return\n    value += 1', 'witness': {'fixtureIndex': 0}},
            {'id': 'unrelated', 'correct': False, 'code': '    if value < 0:\n        return\n    value -= 1', 'witness': {'fixtureIndex': 0}}]}
        self.assertEqual(guided.guarded_returns(source, question), [{'line': 3, 'guardLine': 2, 'choiceId': 'guard'}])
        question['choices'] = [question['choices'][0], question['choices'][2]]
        self.assertEqual(guided.guarded_returns(source, question), [])
        question['choices'][1]['code'] = '    if value > 0:\n        return\n    value -= 1'
        self.assertEqual(guided.guarded_returns(source, question), [])

    def test_object_error_messages_keep_class_but_not_process_identity(self):
        self.assertEqual(guided.normalize_runtime_message('<guided_runtime.Node object at 0x123AbC>'), '<Node object>')

    def test_inventory_keeps_all_late_updates_and_final_return(self):
        source = 'def solve(values):\n    result = [0] * len(values)\n    stack = []\n    for i, value in enumerate(values):\n        while stack and values[stack[-1]] < value:\n            previous = stack.pop()\n            result[previous] = i - previous\n        stack.append(i)\n    return result\n'
        data = row(source)
        _units, required, terminal, _context, _parents = guided.python_inventory(data)
        self.assertEqual(required, list(range(2, 10)))
        self.assertIn(9, terminal)

    def test_correct_feedback_explains_current_loop_without_copying_later_answers(self):
        question = {'prompt': 'Which values should this loop visit?', 'choices': [
            {'correct': True, 'code': 'for i, num in enumerate(nums):'}]}
        feedback = guided.current_operation_feedback(question, 'python')
        self.assertIn('bounds', feedback)
        self.assertNotIn('target', feedback)
        self.assertNotIn('complement', feedback)


if __name__ == '__main__':
    unittest.main()

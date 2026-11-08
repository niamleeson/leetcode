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

    def test_structure_is_published_as_multiple_focused_decisions(self):
        data = row()
        def specification(name, count):
            return {'id': name, 'prompt': 'Choose ' + name + '.', 'correctId': 'right',
                    'options': [{'id': 'right' if index == 0 else str(index), 'label': name + str(index),
                                 'feedback': 'This explains only ' + name + '.'} for index in range(count)]}
        metadata = {'sourceHashes': {'python': guided.digest(data['source'])}, 'patternId': 'scan',
                    'patternQuestion': specification('pattern', 8),
                    'structureQuestions': [specification(name, 3) for name in ['state', 'loop', 'finish']]}
        curriculum = {'lessons': {str(data['id']): metadata}}
        _metadata, questions = guided.curriculum_questions(data, 'python', curriculum)
        self.assertEqual([question['id'] for question in questions], ['pattern', 'structure-state', 'structure-loop', 'structure-finish'])
        self.assertTrue(all('context' not in question for question in questions))
        self.assertTrue(all('code' not in choice and 'feedbackCode' not in choice for question in questions for choice in question['choices']))
        self.assertEqual(guided.implementation_start(questions + [{'id': 'code', 'stage': 'implementation'}]), 4)
        metadata['structureQuestions'][0]['options'][0]['feedbackCode'] = 'the whole plan'
        with self.assertRaisesRegex(AssertionError, 'focused plain-language'):
            guided.curriculum_questions(data, 'python', curriculum)

    def test_opening_decisions_must_all_precede_implementation(self):
        questions = [{'id': name + str(index), 'stage': name} for index, name in enumerate(
            ['pattern', 'structure', 'structure', 'implementation', 'implementation'])]
        self.assertEqual(guided.implementation_start(questions), 3)
        for stages in [
            ['pattern', 'implementation'], ['pattern', 'structure'],
            ['pattern', 'structure', 'implementation', 'structure'],
            ['pattern', 'structure', 'pattern', 'implementation'],
        ]:
            with self.assertRaises(AssertionError):
                guided.implementation_start([{'id': str(index), 'stage': stage} for index, stage in enumerate(stages)])

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
                                 'witness': {'fixtureIndex': 0, 'name': 'Old display name', 'expected': 1, 'actual': 0}}
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

    def test_implementation_proof_ignores_prose_but_keeps_code_witnesses_and_finishing_coverage(self):
        document = {'source': 'source', 'sourceHash': 'hash', 'coverage': {'terminalLines': [4]},
                    'validation': {'testedWitnesses': 1}, 'questions': [
                        {'id': 'finish', 'stage': 'implementation', 'line': 4, 'endLine': 4,
                         'prompt': 'Old prompt', 'choices': [{'id': 'wrong', 'code': 'return 0', 'correct': False,
                             'feedback': 'Old feedback', 'witness': {'expected': 1, 'actual': 0}}]}]}
        original = guided.implementation_proof(document)
        document['questions'][0]['prompt'] = 'Clear prompt'
        document['questions'][0]['choices'][0]['feedback'] = 'Clear feedback'
        document['questions'].insert(0, {'stage': 'structure', 'choices': []})
        self.assertEqual(guided.implementation_proof(document), original)
        document['questions'][1]['choices'][0]['witness']['actual'] = 2
        self.assertNotEqual(guided.implementation_proof(document), original)
        document['questions'][1]['choices'][0]['witness']['actual'] = 0
        document['coverage']['terminalLines'] = []
        self.assertNotEqual(guided.implementation_proof(document), original)

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

    def test_correct_feedback_explains_current_operation_without_copying_later_answers(self):
        source = 'def solve(nums):\n    total = 0\n    for value in nums:\n        total += value\n    return total\n'
        document = {'language': 'python', 'source': source, 'questions': [
            {'id': 'loop', 'stage': 'implementation', 'line': 3, 'endLine': 3, 'decisionLines': [3],
             'prompt': 'Old vague prompt', 'choices': [{'correct': True, 'code': '    for value in nums:', 'feedback': 'Old vague feedback'}]}]}
        reviewed = guided.WORDING.improve_implementation_wording(row(source), document)
        question = reviewed['questions'][0]
        self.assertIn('value', question['prompt'])
        self.assertIn('nums', question['choices'][0]['feedback'])
        self.assertNotIn('total', question['choices'][0]['feedback'])
        self.assertEqual(question['choices'][0]['code'], document['questions'][0]['choices'][0]['code'])
        self.assertEqual(guided.WORDING.improve_implementation_wording(row(source), reviewed), reviewed)


if __name__ == '__main__':
    unittest.main()

"""Guard the wording layer without changing the executable learning decisions."""
import copy
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import unittest

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
spec = importlib.util.spec_from_file_location('wording', HERE / 'guided-wording.py')
wording = importlib.util.module_from_spec(spec)
spec.loader.exec_module(wording)


def behavior(document):
    value = copy.deepcopy(document)
    for question in value['questions']:
        if question['stage'] != 'implementation': continue
        question.pop('prompt', None)
        for choice in question['choices']: choice.pop('feedback', None)
    return value


def js_facts(source):
    result = subprocess.run(['node', str(HERE / 'guided-wording-javascript.cjs')],
                            input=json.dumps([{'id': 1, 'javascript': source}]),
                            text=True, capture_output=True, check=True)
    return json.loads(result.stdout)['1']


class ClearImplementationWordingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run(['node', str(HERE / 'generate-guided.cjs'), '--input-only'], cwd=ROOT, capture_output=True, check=True)
        cls.rows = {row['id']: row for row in json.loads(Path('/tmp/leetcode-guided-input.json').read_text())}
        wording.prepare_wording(list(cls.rows.values()))
        revision = re.search(r'"([a-f0-9]{16})"', (ROOT / 'src/data/logic/guided-manifest.ts').read_text())[1]
        cls.documents = [json.loads(file.read_text()) for file in (ROOT / 'public/logic/lessons' / revision).glob('*.json')]

    def test_all_500_lessons_keep_every_code_choice_and_proof_exactly(self):
        self.assertEqual(len(self.documents), 500)
        count = 0
        for document in self.documents:
            updated = wording.improve_implementation_wording(self.rows[document['id']], document)
            self.assertEqual(behavior(document), behavior(updated), (document['id'], document['language']))
            self.assertEqual(updated, wording.improve_implementation_wording(self.rows[document['id']], updated))
            for question in updated['questions']:
                if question['stage'] != 'implementation': continue
                count += 1
                self.assertTrue(question['prompt'])
                self.assertLessEqual(len(question['prompt']), 180)
                correct = next(choice for choice in question['choices'] if choice['correct'])
                self.assertLessEqual(len(correct['feedback']), 500, (document['id'], question['id']))
                self.assertNotRegex(question['prompt'] + ' ' + correct['feedback'], r'(?i)working state|continuation test|for this guided approach|matches the requirements|this case applies')
        self.assertGreater(count, 5800)

    def test_python_floor_division_and_literal_slashes_remain_in_feedback(self):
        question = {'choices': [{'correct': True, 'code': 'mid = (left + right) // 2'}]}
        choice = {'code': 'mid = (left + right) // 3'}
        text = wording.changed_operation(question, choice, 'python')
        self.assertIn('// 3', text)
        self.assertEqual(wording.without_comment('value = "//"  # keep literal', 'python'), 'value = "//"')
        self.assertEqual(wording.without_comment('const url = "https://example.test"; // explanation', 'javascript'), 'const url = "https://example.test";')

    def test_compound_updates_are_not_described_as_plain_assignments(self):
        for language, old, new in [('python','slow += 1','slow += 2'),('javascript','right -= 1;','right -= 2;')]:
            text = wording.changed_operation({'choices':[{'correct':True,'code':old}]}, {'code':new}, language)
            self.assertIn(new, text)
            self.assertNotIn('This stores', text)

    def test_python_types_do_not_cross_helper_scopes(self):
        source = 'def first():\n    value = []\n    if not value:\n        return 0\ndef second(value):\n    if not value:\n        return 1\n'
        tests = [fact['description'] for fact in wording.python_facts(source) if fact['kind'] == 'if']
        self.assertIn('is empty', tests[0])
        self.assertNotIn('is empty', tests[1])
        self.assertIn('not value', tests[1])

    def test_python_node_and_collection_guards_use_different_meanings(self):
        source = 'def visit(root: Optional[TreeNode]):\n    if not root:\n        return 0\n    stack = []\n    if not stack:\n        return 1\n'
        tests = [fact['description'] for fact in wording.python_facts(source) if fact['kind'] == 'if']
        self.assertIn('root” is missing', tests[0])
        self.assertIn('stack” is empty', tests[1])

    def test_python_arithmetic_keeps_grouping_and_parallel_assignments(self):
        source = 'def solve(a,b,c):\n    one, two = one + two, one\n    return (a + b) * c\n'
        facts = wording.python_facts(source)
        self.assertIn('before writing any of the targets', facts[0]['description'])
        self.assertIn('(“a” plus “b”) times “c”', facts[1]['description'])

    def test_javascript_empty_arrays_do_not_become_false_empty_checks(self):
        facts = js_facts('function solve(){const values=[];if(values){return 1;}return 0;}')
        guard = next(fact for fact in facts if fact['kind']=='if')['description']
        self.assertIn('empty object or array also passes', guard)
        self.assertNotIn('is not empty', guard)

    def test_javascript_comparisons_are_booleans_and_plus_can_build_strings(self):
        facts = js_facts('function solve(){const ready=1<2;if(ready){return 1;}const text="a"+"b";if(text){return 2;}return 0;}')
        guards = [fact['description'] for fact in facts if fact['kind']=='if']
        self.assertIn('ready” is true', guards[0])
        self.assertIn('text” is not empty', guards[1])
        self.assertNotIn('zero', guards[1])

    def test_javascript_numeric_sort_names_order_and_skips_helper_bodies(self):
        facts = js_facts('function solve(values){values.sort((a,b)=>a-b);const helper=(value)=>{if(value){return 2;}return 1;};return helper(values.length);}')
        self.assertIn('ascending numeric order', facts[0]['description'])
        self.assertFalse(any(fact['kind']=='assign' and fact['subject']=='helper' for fact in facts))
        self.assertFalse(any('=> {' in fact['description'] for fact in facts))

    def test_for_header_feedback_keeps_the_entire_header(self):
        old='for (let j = 1; j <= n; j++) {'
        new='for (let j = 1; j <= (n) - 1; j++) {'
        text=wording.changed_operation({'choices':[{'correct':True,'code':old}]},{'code':new},'javascript')
        self.assertIn(new,text)
        self.assertNotIn('This stores',text)

    def test_inline_branches_do_not_describe_the_body_as_part_of_the_condition(self):
        for language, old, new in [
            ('javascript', 'if (!cache.has(key)) return -1;', 'if (!cache.has(key)) return 0;'),
            ('python', 'if ready: result = 1', 'if ready: result = 2'),
        ]:
            text = wording.changed_operation({'choices':[{'correct':True,'code':old}]}, {'code':new}, language)
            self.assertIn(new, text)
            self.assertTrue(text.startswith('This uses'))

    def test_abs_and_conditional_updates_keep_their_operand_grouping(self):
        source='def solve(px,qx,count,num,candidate):\n    side=abs(px-qx)\n    count += 1 if num == candidate else -1\n'
        facts=wording.python_facts(source)
        self.assertIn('absolute value of (“px” minus “qx”)',facts[0]['description'])
        self.assertEqual(facts[1]['description'],'If “num” equals “candidate”, add 1 to “count”; otherwise subtract 1 from “count”.')

    def test_numeric_lengths_are_nonzero_and_unknown_guards_preserve_grouping(self):
        facts=js_facts('function solve(p,q,stack){while(p || stack.length){break;}if(!p && !q){return 0;}return 1;}')
        loop=next(fact for fact in facts if fact['kind']=='while')['description']
        guard=next(fact for fact in facts if fact['kind']=='if')['description']
        self.assertIn('the length of “stack” is not zero',loop)
        self.assertIn('the condition “!p” is true and the condition “!q” is true',guard)

    def test_prototype_function_assignments_never_dump_the_helper_body(self):
        facts=js_facts('Thing.prototype.get = function(key){if(key){return 7;}return 0;};')
        self.assertFalse(any(fact['kind']=='assign' for fact in facts))
        self.assertFalse(any('function(key)' in fact['description'] for fact in facts))

    def test_daily_questions_name_the_day_temperature_and_wait(self):
        for document in self.documents:
            if document['id'] != 739: continue
            updated = wording.improve_implementation_wording(self.rows[739], document)
            text = ' '.join(question['prompt'] for question in updated['questions'] if question['stage']=='implementation')
            self.assertNotRegex(text, r'(?i)resolv')
            self.assertIn('earlier days off the stack', text)
        reviewed = json.loads((HERE / 'guided-feedback.json').read_text())['feedback']
        daily = ' '.join(item['feedback'] for item in reviewed if item['id']==739)
        self.assertNotRegex(daily, r'(?i)resolv')
        self.assertIn('temperature is higher than the temperature of the day at the top', daily)


if __name__ == '__main__':
    unittest.main()

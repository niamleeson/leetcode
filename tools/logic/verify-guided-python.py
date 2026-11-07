"""Independently replay every generated Python implementation choice."""
import hashlib
import json
from pathlib import Path
import signal
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
NAMESPACE = {'__name__': 'guided_audit_runtime'}
exec((ROOT / 'tools/walkthroughs/python-runtime.py').read_text(), NAMESPACE)
exec((ROOT / 'src/components/logic/runtime/pythonRunner.py').read_text(), NAMESPACE)


def stable_error_message(message):
    # Object identity addresses and the harness module name are incidental to
    # the same missing-node key; preserve the class and every other message.
    return re.sub(r'<[^\n]*?\.([A-Za-z_][A-Za-z_0-9]*) object at 0x[0-9a-fA-F]+>',
                  r'<\1 object>', message)


def replace_lines(source, question, replacement):
    lines = source.split('\n')
    first, last = question.get('line'), question.get('endLine')
    if not isinstance(first, int) or not isinstance(last, int) or not 1 <= first <= last <= len(lines):
        raise ValueError('Invalid physical source-line range')
    if not isinstance(replacement, str):
        raise ValueError('Missing replacement source')
    lines[first - 1:last] = replacement.split('\n')
    return '\n'.join(lines)


def run(source, row, fixtures, witness=False):
    request = {'problemId': row['id'], 'code': source, 'fixtures': fixtures,
               '_testLimits': {'maxFrames': 3, 'maxEvents': 50000 if witness else 500000,
                               'timeLimit': 0.2 if witness else 2.0}}
    def expired(_signum, _frame):
        raise TimeoutError('Independent audit wall-clock limit exceeded')
    previous = signal.signal(signal.SIGALRM, expired)
    signal.setitimer(signal.ITIMER_REAL, 0.75 if witness else 5)
    try:
        return NAMESPACE['run_logic'](request)
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        signal.signal(signal.SIGALRM, previous)


def audit_lessons(lessons, references):
    report = dict(lessons=0, correctCases=0, correctCasesPassed=0, implementationQuestions=0,
                  correctReplacements=0, wrongChoices=0, witnessedFailures=0, outputFailures=0,
                  runtimeErrors={}, onlyErrorQuestions=[], errors=[])
    for row in references:
        problem_id = row['id']
        lesson = lessons.get(str(problem_id))
        def error(kind, **detail):
            report['errors'].append(dict(id=problem_id, kind=kind, **detail))
        if lesson is None:
            error('missing_lesson')
            continue
        report['lessons'] += 1
        source = lesson['source']
        if source != row['source']:
            error('source_differs_from_canonical')
        if lesson['sourceHash'] != hashlib.sha256(source.encode()).hexdigest():
            error('source_hash_mismatch')
        result = run(source, row, row['fixtures'])
        report['correctCases'] += result['total']
        report['correctCasesPassed'] += result['passed']
        for test in result['tests']:
            if not test['passed']:
                error('correct_source_failed', name=test['name'], actual=test.get('actual'), error=test.get('error'))
        questions = [question for question in lesson['questions'] if question['stage'] == 'implementation']
        if not questions:
            error('missing_implementation_question')
        wrong_count = witness_count = 0
        for question in questions:
            report['implementationQuestions'] += 1
            correct = [choice for choice in question['choices'] if choice['correct']]
            wrong = [choice for choice in question['choices'] if not choice['correct']]
            if len(correct) != 1 or len(wrong) < 1:
                error('invalid_choice_count', question=question['id'])
            if len({choice.get('code', '').strip() for choice in question['choices']}) != len(question['choices']):
                error('duplicate_choices', question=question['id'])
            try:
                if len(correct) == 1 and replace_lines(source, question, correct[0]['code']) == source:
                    report['correctReplacements'] += 1
                else:
                    error('correct_replacement_changed_source', question=question['id'])
            except Exception as cause:
                error('invalid_source_range', question=question['id'], message=str(cause))
                continue
            only_errors = True
            for choice in wrong:
                wrong_count += 1
                report['wrongChoices'] += 1
                detail = dict(question=question['id'], choice=choice['id'])
                witness = choice.get('witness')
                if not witness:
                    error('missing_witness', **detail)
                    continue
                witness_count += 1
                index = witness.get('fixtureIndex')
                if not isinstance(index, int) or not 0 <= index < len(row['fixtures']):
                    error('invalid_witness_index', **detail)
                    continue
                fixture = row['fixtures'][index]
                if witness['name'] != fixture['name'] or witness['input'] != fixture['args'] or witness['expected'] != fixture['expected'] or witness.get('operations') != fixture.get('operations'):
                    error('witness_fixture_drift', **detail)
                try:
                    mutated = replace_lines(source, question, choice['code'])
                    test = run(mutated, row, [fixture], witness=True)['tests'][0]
                except BaseException as cause:
                    error('invalid_or_unbounded_mutation', type=type(cause).__name__, message=str(cause), **detail)
                    continue
                if test['passed']:
                    error('wrong_choice_passed', actual=test.get('actual'), **detail)
                    continue
                failure = test.get('error')
                if failure and failure['type'] in ('SyntaxError', 'IndentationError', 'NameError', 'UnboundLocalError', 'LogicExecutionLimit', 'RecursionError', 'MemoryError', 'TimeoutError'):
                    error('invalid_failure_proof', error=failure, **detail)
                    continue
                report['witnessedFailures'] += 1
                if failure:
                    report['runtimeErrors'][failure['type']] = report['runtimeErrors'].get(failure['type'], 0) + 1
                    recorded = witness.get('error')
                    if not recorded or recorded['type'] != failure['type'] or stable_error_message(recorded['message']) != stable_error_message(failure['message']):
                        error('witness_error_drift', recorded=recorded, actual=failure, **detail)
                else:
                    only_errors = False
                    report['outputFailures'] += 1
                    if witness.get('error') or witness.get('actual') != test.get('actual'):
                        error('witness_output_drift', recorded=witness.get('actual'), actual=test.get('actual'), **detail)
            if only_errors and wrong:
                report['onlyErrorQuestions'].append(dict(id=problem_id, question=question['id'], choices=len(wrong)))
        if lesson['validation']['correctCases'] != len(row['fixtures']) or lesson['validation']['wrongChoices'] != wrong_count or lesson['validation']['testedWitnesses'] != witness_count:
            error('validation_count_drift')
    return report


if __name__ == '__main__':
    if len(sys.argv) > 1:
        source = Path(sys.argv[1])
    else:
        manifest = (ROOT / 'src/data/logic/guided-manifest.ts').read_text()
        revision = re.search(r'guidedRevision\s*=\s*[\'"]([a-f0-9]+)[\'"]', manifest)
        if not revision:
            raise ValueError('No published guided lesson revision is available')
        source = ROOT / 'public/logic/lessons' / revision.group(1)
    if source.is_dir():
        lessons = {str(value['id']): value for file in source.glob('*-python.json') for value in [json.loads(file.read_text())]}
    else:
        lessons = json.loads(source.read_text())
    # Rebuild references from checked-in solutions and current practice fixtures;
    # a previous author's /tmp cache must never be the verification authority.
    subprocess.run(['node', str(ROOT / 'tools/logic/generate-guided.cjs'), '--input-only'],
                   cwd=ROOT, check=True, capture_output=True, text=True, timeout=60)
    references = json.loads(Path('/tmp/leetcode-guided-input.json').read_text())
    report = audit_lessons(lessons, references)
    Path('/tmp/leetcode-guided-python-audit.json').write_text(json.dumps(dict(input=str(source), **report), indent=2))
    print(json.dumps(report, indent=2))
    sys.exit(bool(report['errors']))

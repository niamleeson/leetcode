import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { logicManifest, logicRevision } from '../../data/logic/manifest';
import type { LogicProblem } from '../../data/logic/types';
import {
  activeUnit, addFunction, assembleSource, assembleSourceWithMap, blockRange,
  createBuilder, deleteLine, endBlock, getActionGroups, getLineVariants,
  indentLine, insertLine, moveLine, parseInterfaces, replaceToken, restoreBuilder, selectAction,
  selectUnit, setCursor, tokenChoices, updateLine, visibleBindings,
  type BuilderProgram,
} from './builder';

const problem = (id: number): LogicProblem => JSON.parse(readFileSync(resolve('public/logic/problems/' + logicRevision + '/' + id + '.json'), 'utf8'));
const builder = (id: number) => {
  const data = problem(id);
  return createBuilder(data.starter, data.interfaces);
};

/** Tests tap an offered card or variant; they never sneak in raw solution lines. */
function tap(program: BuilderProgram, text: string): BuilderProgram {
  const actions = getActionGroups(program).flatMap(group => group.actions);
  const action = actions.find(action => action.variants.includes(text));
  expect(action, 'No offered action for ' + JSON.stringify(text) + '.\n' + assembleSource(program)).toBeDefined();
  return selectAction(program, action!, text);
}

function tapEnd(program: BuilderProgram): BuilderProgram {
  const action = getActionGroups(program).flatMap(group => group.actions).find(action => action.command === 'end-block')!;
  return selectAction(program, action);
}

function execute(program: BuilderProgram, args: unknown[][]): unknown[] {
  const unit = activeUnit(program);
  return JSON.parse(execFileSync('python3', ['-c', [
    'import json, sys',
    'request = json.load(sys.stdin)',
    'scope = {}',
    'exec(request["code"], scope)',
    'values = []',
    'for args in request["args"]:',
    '    target = getattr(scope[request["className"]](), request["name"]) if request.get("className") else scope[request["name"]]',
    '    values.append(target(*args))',
    'print(json.dumps(values))',
  ].join('\n')], { input: JSON.stringify({ code: assembleSource(program), name: unit.name, className: unit.className, args }), encoding: 'utf8' }));
}

describe('tap-only Python programs', () => {
  it('builds Two Sum through complete statements, including duplicate and negative values', () => {
    let program = builder(1);
    for (const line of [
      'seen = {}',
      'for i, value in enumerate(nums):',
      'if target - value in seen:',
      'return [seen[target - value], i]',
      'seen[value] = i',
    ]) program = tap(program, line);
    program = tapEnd(program);
    program = tap(program, 'return []');
    expect(activeUnit(program).lines.map(line => line.indent)).toEqual([0, 0, 1, 2, 1, 0]);
    expect(execute(program, [
      [[2, 7, 11, 15], 9], [[3, 2, 4], 6], [[0, 4, 3, 0], 0],
      [[-3, 4, 3, 90], 0], [[2, 5, 5, 11], 10],
    ])).toEqual([[0, 1], [1, 2], [0, 3], [0, 2], [1, 2]]);
  });

  it('builds Contains Duplicate with a set and independent true/false exits', () => {
    let program = builder(217);
    for (const line of ['seen = set()', 'for value in nums:', 'if value in seen:', 'return True', 'seen.add(value)']) program = tap(program, line);
    program = tap(tapEnd(program), 'return False');
    expect(execute(program, [[[1, 2, 3, 1]], [[1, 2, 3, 4]], [[-1, -1]], [[0]]])).toEqual([true, false, true, false]);
  });

  it('also permits a different tap-only Two Sum algorithm using nested loops', () => {
    let program = builder(1);
    for (const line of [
      'for i in range(len(nums)):',
      'for j in range(i + 1, len(nums)):',
      'if nums[i] + nums[j] == target:',
      'return [i, j]',
    ]) program = tap(program, line);
    program = tap(tapEnd(tapEnd(program)), 'return []');
    expect(execute(program, [[[2, 7, 11, 15], 9], [[3, 3], 6], [[4, -2, 0], -2]])).toEqual([[0, 1], [0, 1], [1, 2]]);
  });

  it('builds Valid Anagram with an offered comparison and handles unequal counts', () => {
    const program = tap(builder(242), 'return sorted(s) == sorted(t)');
    expect(execute(program, [['anagram', 'nagaram'], ['rat', 'car'], ['aacc', 'ccac'], ['a', 'aa'], ['', '']])).toEqual([true, false, false, false, true]);
  });

  it('builds Binary Search with distinct branch exits and editable bound variants', () => {
    let program = builder(704);
    for (const line of [
      'left, right = 0, len(nums) - 1',
      'while left <= right:',
      'mid = (left + right) // 2',
      'if nums[mid] == target:',
      'return mid',
      'if nums[mid] < target:',
      'left = mid + 1',
    ]) program = tap(program, line);
    program = tapEnd(program);
    program = tap(program, 'else:');
    program = tap(program, 'right = mid - 1');
    program = tapEnd(tapEnd(program));
    program = tap(program, 'return -1');
    expect(execute(program, [
      [[-1, 0, 3, 5, 9, 12], 9], [[-1, 0, 3, 5, 9, 12], 2],
      [[5], 5], [[5], 2], [[1, 3], 1], [[1, 3], 3], [[], 2],
    ])).toEqual([4, -1, 0, -1, 0, 1, -1]);
  });

  it('builds Best Time to Buy and Sell Stock with independently chosen min/max updates', () => {
    let program = builder(121);
    for (const line of [
      'result = 0', 'minimum = prices[0]', 'for value in prices:',
      'result = max(result, value - minimum)', 'minimum = min(minimum, value)',
    ]) program = tap(program, line);
    program = tap(tapEnd(program), 'return result');
    expect(execute(program, [
      [[7, 1, 5, 3, 6, 4]], [[7, 6, 4, 3, 1]], [[2, 4, 1]], [[1]], [[3, 3, 3]], [[3, 2, 6, 1, 4]],
    ])).toEqual([5, 0, 2, 0, 0, 4]);
  });

  it('permits an incorrect but runnable decision instead of correcting it from expected output', () => {
    const program = tap(builder(217), 'return False');
    expect(execute(program, [[[1, 1]], [[1, 2]]])).toEqual([false, false]);
    expect(assembleSource(program)).toContain('return False');
    const alternatives = getActionGroups(program).find(group => group.label === 'Return')!.actions;
    expect(alternatives.some(action => action.text === 'return True')).toBe(true);
  });
});

describe('public interfaces and unbiased suggestions', () => {
  it('assembles valid Python for every one of the 250 interface-only stubs', () => {
    expect(logicManifest).toHaveLength(250);
    const sources = logicManifest.map(({ id }) => {
      const data = problem(id);
      const parsed = parseInterfaces(data.starter);
      expect(parsed.map(item => [item.className, item.name]), 'Interface ' + id).toEqual(data.interfaces.map(item => [item.className, item.name]));
      const program = createBuilder(data.starter, data.interfaces);
      expect(program.units).toHaveLength(data.interfaces.length);
      for (const unit of program.units) {
        const groups = getActionGroups(selectUnit(program, unit.id));
        expect(groups.map(group => group.label)).toEqual(['Store', 'Loop', 'Check', 'Update', 'Return', 'More']);
        for (const group of groups) {
          expect(group.actions.length).toBeGreaterThanOrEqual(3);
          expect(group.actions.length).toBeLessThanOrEqual(6);
          expect(new Set(group.actions.map(action => action.text)).size).toBe(group.actions.length);
        }
      }
      return { id, code: assembleSource(program) };
    });
    const result = execFileSync('python3', ['-c', [
      'import ast, json, sys',
      'for item in json.load(sys.stdin):',
      '    ast.parse(item["code"], filename=str(item["id"]))',
      'print("250 valid interfaces")',
    ].join('\n')], { input: JSON.stringify(sources), encoding: 'utf8' });
    expect(result.trim()).toBe('250 valid interfaces');
  });

  it('ignores method identity when parameter types and authored code are the same', () => {
    let first = createBuilder('def twoSum(nums: list[int], target: int) -> list[int]:\n    pass');
    let second = createBuilder('def arbitraryName(nums: list[int], target: int) -> list[int]:\n    pass');
    for (const line of ['seen = {}', 'for i, value in enumerate(nums):']) {
      first = insertLine(first, line);
      second = insertLine(second, line);
    }
    expect(getActionGroups(first)).toEqual(getActionGroups(second));
  });

  it('uses only parameters and previously authored locals at the insertion cursor', () => {
    let program = createBuilder('def solve(nums: list[int], target: int):\n    pass');
    program = insertLine(program, 'later = {}');
    program = setCursor(program, { index: 0, indent: 0 });
    expect(visibleBindings(program).map(binding => binding.name)).toEqual(['nums', 'target']);
    expect(getActionGroups(program).flatMap(group => group.actions).some(action => action.text.includes('later'))).toBe(false);
    program = setCursor(program, { index: 1 });
    expect(visibleBindings(program).find(binding => binding.name === 'later')?.kind).toBe('dict');
  });

  it('offers a type-appropriate first Return card without hiding other alternatives', () => {
    const returns = (starter: string) => getActionGroups(createBuilder(starter)).find(group => group.label === 'Return')!.actions;
    expect(returns('def f(nums: list[int]) -> list[int]:\n    pass')[0].id).toBe('return-pair');
    expect(returns('def f(nums: list[int]) -> bool:\n    pass')[0].id).toBe('return-false');
    expect(returns('def f(nums: list[int]) -> int:\n    pass')[0].id).toBe('return-value');
    expect(returns('def f(nums: list[int]) -> list[int]:\n    pass').map(action => action.id).sort()).toEqual(returns('def f(nums: list[int]) -> bool:\n    pass').map(action => action.id).sort());
    for (const group of getActionGroups(builder(1))) for (const action of group.actions) {
      expect(action.label).not.toMatch(/^(?:return |for |if |while |seen =|result =)/);
      expect(action.code).toBe(action.text);
      expect(action.variants).toContain(action.text);
    }
  });

  it('merges identical actions without losing their alternative statements', () => {
    let program = builder(217);
    program = tap(program, 'seen = set()');
    program = tap(program, 'for value in nums:');
    const updates = getActionGroups(program).find(group => group.label === 'Update')!.actions;
    const add = updates.filter(action => action.text === 'seen.add(value)');
    expect(add).toHaveLength(1);
    expect(add[0].id).toBe('update-container');
    expect(add[0].variants).toContain('seen.discard(value)');
    expect(updates.length).toBeGreaterThanOrEqual(3);
  });

  it('finds learner-created class attributes across design methods and isolates method parameters', () => {
    let program = createBuilder('class Box:\n    def __init__(self, capacity: int):\n        pass\n    def get(self, key: int) -> int:\n        pass');
    program = insertLine(program, 'self.items = {}');
    program = selectUnit(program, program.units[1].id);
    expect(visibleBindings(program).map(binding => binding.name)).toEqual(['key', 'self.items']);
    expect(getActionGroups(program).find(group => group.label === 'Update')!.actions[0].text).toContain('self.items[');
    expect(assembleSource(program).match(/class Box:/g)).toHaveLength(1);
    expect(assembleSource(program)).toContain('    def get(self, key: int) -> int:\n        pass');
  });

  it('keeps nested helper locals in their scope and supports added standalone or class helpers', () => {
    let program = createBuilder('def solve(nums: list[int]):\n    pass');
    program = insertLine(program, 'def helper(value: int):');
    program = insertLine(program, 'inside = 1');
    expect(visibleBindings(program).map(binding => binding.name)).toContain('inside');
    program = endBlock(program);
    expect(visibleBindings(program).map(binding => binding.name)).toEqual(['nums', 'helper']);
    program = addFunction(program);
    expect(activeUnit(program).signature).toBe('def helper(value):');
    const classProgram = addFunction(createBuilder('class Solution:\n    def solve(self, nums):\n        pass'));
    expect(activeUnit(classProgram).signature).toBe('def helper(self, value):');
    expect(activeUnit(classProgram).className).toBe('Solution');
  });
});

describe('restoring drafts', () => {
  const fallback = createBuilder('class Solution:\n    def solve(self, nums: list[int]) -> int:\n        pass');
  const draft = insertLine(fallback, 'return len(nums)');

  it('round-trips authored lines and helpers while preserving canonical headers/imports', () => {
    let authored = addFunction(draft);
    authored = insertLine(authored, 'return value');
    const saved = JSON.parse(JSON.stringify(authored));
    saved.preamble = ['import something_from_an_old_draft'];
    saved.units[0].signature = 'def old_name(self, old_argument):';
    saved.units[0].name = 'old_name';
    saved.units[0].parameters = [{ name: 'old_argument', type: 'str' }];
    const restored = restoreBuilder(saved, fallback);
    expect(restored).not.toBe(fallback);
    expect(restored.preamble).toEqual(fallback.preamble);
    expect(restored.units[0].signature).toBe(fallback.units[0].signature);
    expect(restored.units[0].parameters).toEqual(fallback.units[0].parameters);
    expect(restored.units[0].lines).toEqual(draft.units[0].lines);
    expect(restored.units[1].signature).toBe('def helper(self, value):');
    expect(restored.activeUnitId).toBe(authored.activeUnitId);
    expect(assembleSource(restored)).toBe(assembleSource(authored));
    saved.units[0].lines[0].text = 'changed later';
    expect(restored.units[0].lines[0].text).toBe('return len(nums)');
  });

  it('raises the id counter above existing line and helper ids', () => {
    const saved = JSON.parse(JSON.stringify(draft));
    saved.units[0].lines[0].id = 'line-40';
    saved.nextId = 1;
    const restored = restoreBuilder(saved, fallback);
    expect(restored.nextId).toBeGreaterThan(40);
    const appended = insertLine(restored, 'return 0');
    expect(new Set(appended.units[0].lines.map(line => line.id)).size).toBe(2);
    const helper = addFunction(appended);
    expect(new Set(helper.units.map(unit => unit.id)).size).toBe(2);
  });

  it('rejects malformed cursors, indentation, identifiers, and interface shapes without rendering crashes', () => {
    const corruptions: ((saved: ReturnType<typeof JSON.parse>) => void)[] = [
      saved => { saved.version = 2; },
      saved => { saved.preamble = 'not an array'; },
      saved => { saved.preamble = [null]; },
      saved => { saved.cursor = null; },
      saved => { saved.cursor.indent = -1; },
      saved => { saved.cursor.indent = 31; },
      saved => { saved.cursor.index = 10; },
      saved => { saved.cursor.index = 0.5; },
      saved => { saved.cursor.unitId = 'unit-99'; },
      saved => { saved.activeUnitId = 'unit-99'; },
      saved => { saved.nextId = 0; },
      saved => { saved.nextId = Number.MAX_SAFE_INTEGER; },
      saved => { saved.units[0].kind = 'unknown'; },
      saved => { saved.units[0].className = undefined; },
      saved => { saved.units[0].name = 'bad name'; },
      saved => { saved.units[0].signature = 'def f():\n    return 1'; },
      saved => { saved.units[0].parameters = null; },
      saved => { saved.units[0].parameters = [{ name: 'bad parameter' }]; },
      saved => { saved.units[0].parameters = [{ name: 'valid', type: {} }]; },
      saved => { saved.units[0].lines[0].indent = -1; },
      saved => { saved.units[0].lines[0].indent = 31; },
      saved => { saved.units[0].lines[0].text = 'x'.repeat(20_001); },
      saved => { saved.units[0].lines[0].text = 'return 0\nreturn 1'; },
      saved => { saved.units[0].lines[0].id = 'not-a-line-id'; },
      saved => { saved.units[0].lines.push({ ...saved.units[0].lines[0] }); },
      saved => { saved.units.push({ ...saved.units[0] }); },
      saved => { saved.units = []; },
      saved => { saved.units[0].lines = Array.from({ length: 5001 }, (_, i) => ({ id: 'line-' + (i + 1), text: 'pass', indent: 0 })); },
    ];
    for (const corrupt of corruptions) {
      const saved = JSON.parse(JSON.stringify(draft));
      corrupt(saved);
      const restored = restoreBuilder(saved, fallback);
      expect(restored).toBe(fallback);
      expect(() => assembleSource(restored)).not.toThrow();
    }
    for (const invalid of [null, undefined, false, [], {}, 'draft']) expect(restoreBuilder(invalid, fallback)).toBe(fallback);
  });

  it('does not restore a draft missing a required design-method interface', () => {
    const design = createBuilder('class Box:\n    def __init__(self):\n        pass\n    def get(self, key):\n        pass');
    const saved = JSON.parse(JSON.stringify(design));
    saved.units.pop();
    expect(restoreBuilder(saved, design)).toBe(design);
  });
});

describe('editing blocks and mapping real Python lines', () => {
  it('autoindents blocks and exits one level after return; End block never inserts text', () => {
    let program = createBuilder('def f(nums):\n    pass');
    program = insertLine(program, 'for value in nums:');
    expect(program.cursor.indent).toBe(1);
    program = insertLine(program, 'if value:');
    expect(program.cursor.indent).toBe(2);
    program = insertLine(program, 'return value');
    expect(program.cursor.indent).toBe(1);
    program = tapEnd(program);
    expect(program.cursor.indent).toBe(0);
    expect(activeUnit(program).lines).toHaveLength(3);
  });

  it('preserves stable ids and old snapshots when inserting and replacing between rows', () => {
    let program = createBuilder('def f():\n    pass');
    program = insertLine(program, 'first = 1');
    program = insertLine(program, 'last = 3');
    const snapshot = program;
    program = insertLine(setCursor(program, { index: 1, indent: 0 }), 'middle = 2');
    expect(activeUnit(program).lines.map(line => line.text)).toEqual(['first = 1', 'middle = 2', 'last = 3']);
    expect(activeUnit(program).lines.map(line => line.id)).toEqual(['line-1', 'line-3', 'line-2']);
    program = updateLine(program, 'line-3', 'middle = 4');
    expect(activeUnit(program).lines[1]).toEqual({ id: 'line-3', text: 'middle = 4', indent: 0 });
    expect(activeUnit(snapshot).lines.map(line => line.text)).toEqual(['first = 1', 'last = 3']);
    expect(updateLine(program, 'line-3', 'bad\nline')).toBe(program);
  });

  it('moves/deletes a whole if/else compound while preserving its child ids and nesting', () => {
    let program = createBuilder('def f(value):\n    pass');
    program = insertLine(program, 'first = 0\nif value:\n    a = 1\nelse:\n    a = 2\nlast = 3');
    const lines = activeUnit(program).lines;
    expect(blockRange(lines, 1)).toEqual([1, 5]);
    const moved = moveLine(program, lines[1].id, 'down');
    expect(activeUnit(moved).lines.map(line => line.text)).toEqual(['first = 0', 'last = 3', 'if value:', 'a = 1', 'else:', 'a = 2']);
    expect(activeUnit(moveLine(moved, lines[1].id, 'up')).lines).toEqual(lines);
    const deleted = deleteLine(program, lines[1].id);
    expect(activeUnit(deleted).lines).toEqual([lines[0], lines[5]]);
    expect(activeUnit(program).lines).toHaveLength(6);
    expect(activeUnit(moveLine(program, lines[5].id, 'up')).lines.map(line => line.text)).toEqual(['first = 0', 'last = 3', 'if value:', 'a = 1', 'else:', 'a = 2']);
  });

  it('indents/outdents whole blocks relative to their parent and clamps at zero', () => {
    let program = createBuilder('def f(value):\n    pass');
    program = insertLine(program, 'for item in value:\n    if item:\n        result = item');
    const ifId = activeUnit(program).lines[1].id;
    const outdented = indentLine(program, ifId, -1);
    expect(activeUnit(outdented).lines.map(line => line.indent)).toEqual([0, 0, 1]);
    expect(indentLine(outdented, ifId, -1)).toBe(outdented);
    expect(activeUnit(indentLine(outdented, ifId, 1)).lines).toEqual(activeUnit(program).lines);
  });

  it('maps only authored source rows, including nested empty blocks and comments', () => {
    let program = createBuilder('class Solution:\n    def f(self, value: int):\n        pass\n    def g(self):\n        pass');
    program = insertLine(program, 'if value:\n    # add a decision here');
    const assembly = assembleSourceWithMap(program);
    expect(assembly.lines).toHaveLength(assembly.code.split('\n').length);
    for (const line of activeUnit(program).lines) {
      const sourceIndex = assembly.lines.findIndex(location => location?.lineId === line.id);
      expect(assembly.code.split('\n')[sourceIndex].trim()).toBe(line.text);
      expect(assembly.lines[sourceIndex]?.unitId).toBe(activeUnit(program).id);
    }
    for (const [index, text] of assembly.code.split('\n').entries()) {
      if (text.trim() === 'pass' || text.trim().startsWith('def ') || text.trim().startsWith('class ')) expect(assembly.lines[index]).toBeNull();
    }
    expect(execFileSync('python3', ['-c', 'import ast,sys; ast.parse(sys.stdin.read()); print("valid")'], { input: assembly.code, encoding: 'utf8' }).trim()).toBe('valid');
  });

  it('edits individual expression tokens while preserving ids and exposing complete alternatives', () => {
    let program = builder(704);
    program = insertLine(program, 'left, right = 0, len(nums) - 1');
    program = insertLine(program, 'while left <= right:');
    const line = activeUnit(program).lines[1];
    const comparison = tokenChoices(program, line.id).find(token => token.text === '<=')!;
    expect(comparison.choices).toContain('>');
    program = replaceToken(program, line.id, comparison.start, comparison.end, '>');
    expect(activeUnit(program).lines[1]).toEqual({ ...line, text: 'while left > right:' });
    expect(getLineVariants(program, line.id)).toContain('while left < right:');
    expect(replaceToken(program, line.id, -1, 4, 'no')).toBe(program);
  });
});

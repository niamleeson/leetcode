import { graphMinHeapJavascript, sharedGraphHeapProblemIds } from '../../../data/shared-graph-heap';
import { setup, invocation } from './javascriptAdapter.generated';
import { validateJavaScriptResult } from './javascriptValidation';
import type { LogicFixture, LogicRunRequest, LogicRunResult, LogicTestResult, LogicTraceFrame } from './types';

export interface JavaScriptExecutionSite {
  line: number;
  lines: number[];
  kind: string;
  label: string;
  start: number;
  end: number;
}
export interface JavaScriptExecution { code: string; sites: JavaScriptExecutionSite[] }
export interface JavaScriptRunRequest extends LogicRunRequest { execution: JavaScriptExecution }

function describe(value: unknown, depth = 0, seen = new Set<object>()): string {
  if (typeof value === 'string') return JSON.stringify(value.slice(0, 120)) + (value.length > 120 ? '…' : '');
  if (typeof value === 'bigint') return `${value}n`;
  if (value === null || typeof value !== 'object') return String(value);
  if (seen.has(value)) return '<circular reference>';
  if (depth >= 3) return `<${Array.isArray(value) ? 'Array' : value.constructor?.name || 'Object'}>`;
  const visited = new Set(seen).add(value);
  const nested = (item: unknown) => describe(item, depth + 1, visited);
  if (Array.isArray(value)) return `[${value.slice(0, 8).map(nested).join(', ')}${value.length > 8 ? ', …' : ''}]`;
  if (value instanceof Map) return `Map {${[...value].slice(0, 8).map(([key, item]) => `${nested(key)} => ${nested(item)}`).join(', ')}${value.size > 8 ? ', …' : ''}}`;
  if (value instanceof Set) return `Set {${[...value].slice(0, 8).map(nested).join(', ')}${value.size > 8 ? ', …' : ''}}`;
  const fields = Object.entries(value).filter(([, item]) => typeof item !== 'function');
  return `{${fields.slice(0, 8).map(([key, item]) => `${key}: ${nested(item)}`).join(', ')}${fields.length > 8 ? ', …' : ''}}`;
}

function returnInvocation(fixture: LogicFixture) {
  const prefixCheck = "if (__case.prefix && JSON.stringify(__args[0].slice(0,__returned)) !== JSON.stringify(__case.prefix)) throw new Error('Incorrect in-place output prefix');";
  let source = invocation(fixture);
  if (!fixture.operations) {
    if (!source.includes(prefixCheck)) throw new Error('The JavaScript fixture validation adapter needs regeneration.');
    source = source.replace(prefixCheck, '__validateResultShape(__returned, __args, __case, __problemId);');
  }
  const index = source.lastIndexOf(fixture.operations ? '__results;' : '__normalize(');
  if (index < 0) throw new Error('Missing JavaScript fixture return adapter.');
  return source.slice(0, index) + 'return ' + source.slice(index);
}

function validateResultShape(returned: any, args: any[], fixture: LogicFixture, problemId: number) {
  if (fixture.prefix) {
    if (!Number.isInteger(returned) || returned < 0 || returned > args[0].length) throw new Error('Return the number of elements in the updated prefix.');
    const actual = args[0].slice(0, returned);
    const expected = fixture.prefix;
    const sorted = (values: unknown[]) => [...values].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if (JSON.stringify(problemId === 27 ? sorted(actual) : actual) !== JSON.stringify(problemId === 27 ? sorted(expected) : expected)) throw new Error('The returned length does not describe the correct in-place array prefix.');
  }
  const value = fixture.resultArg !== undefined ? args[fixture.resultArg] : returned;
  if (fixture.output === 'list' || fixture.output === 'randomList') {
    const seen = new Set();
    for (let node = value; node; node = node.next) {
      if (seen.has(node)) throw new Error('The returned linked list contains a cycle.');
      seen.add(node);
    }
  }
  if (fixture.output === 'tree') {
    const queue = [value], seen = new Set();
    for (let index = 0; index < queue.length; index++) {
      const node = queue[index];
      if (!node) continue;
      if (seen.has(node)) throw new Error('The returned tree contains a cycle or a shared child.');
      seen.add(node); queue.push(node.left, node.right);
    }
  }
}

/** Executes prepared source in the worker; preparation changes tracing only. */
export function runJavaScript(request: JavaScriptRunRequest, limits = { frames: 160, events: 500000, milliseconds: 2000 }): LogicRunResult {
  const tests = request.fixtures.map(fixture => {
    const test: LogicTestResult = { name: fixture.name, input: fixture.args, expected: fixture.expected, passed: false, trace: [], traceTruncated: false, executionEvents: 0, stdout: '' };
    const stack: string[] = [];
    let active = false;
    const deadline = performance.now() + limits.milliseconds;
    const trace = {
      start() { active = true; },
      stop() { active = false; },
      leave() { if (active) stack.pop(); },
      record(siteId: number, getters: () => Record<string, () => unknown>, value: unknown) {
        test.executionEvents++;
        if (test.executionEvents > limits.events || test.executionEvents % 64 === 0 && performance.now() > deadline) throw new Error('Execution stopped. Check whether your loops finish.');
        if (!active) return value;
        const site = request.execution.sites[siteId];
        if (!site) throw new Error('The prepared JavaScript trace does not match the source.');
        if (site.kind === 'call') stack.push(site.label);
        const locals: Record<string, string> = {};
        for (const [name, getter] of Object.entries(getters()).slice(0, 32)) {
          try {
            const item = getter();
            if (typeof item !== 'function' && !(name === 'this' && (item === undefined || item === globalThis))) locals[name] = describe(item);
          } catch { /* A declared binding may not have been initialized yet. */ }
        }
        const frame: LogicTraceFrame = { line: site.line, kind: site.kind === 'call' || site.kind === 'return' ? site.kind : 'statement', functionName: stack[stack.length - 1] || '<module>', locals, stack: [...stack] };
        // Expressions may occupy part of a line, so show the precise source
        // slice that was instrumented rather than a neighboring statement.
        frame.statement = site.kind === 'call' ? request.code.split('\n')[site.line - 1]?.trim() : request.code.slice(site.start, site.end).trim();
        if (site.kind === 'check') { frame.detail = 'condition evaluated'; frame.value = describe(value); frame.valueLabel = 'condition'; }
        if (site.kind === 'iterate') frame.detail = 'next iteration';
        if (site.kind === 'loop-end') frame.detail = 'iteration finished';
        if (site.kind === 'return') frame.value = describe(value);
        if (test.trace.length < limits.frames) test.trace.push(frame);
        else { test.trace[test.trace.length - 1] = frame; test.traceTruncated = true; }
        return value;
      },
    };
    const originalRandom = Math.random;
    try {
      const dependencies = sharedGraphHeapProblemIds.includes(request.problemId) ? graphMinHeapJavascript : '';
      const execute = new Function('__case', '__problemId', '__trace', 'console', '__validateResultShape', `${setup}\n${dependencies}\n${request.execution.code}\n${returnInvocation(fixture)}`);
      const log = (...values: unknown[]) => { test.stdout = (test.stdout + values.map(value => typeof value === 'string' ? value : describe(value)).join(' ') + '\n').slice(0, 4000); };
      const actual = execute(JSON.parse(JSON.stringify(fixture)), request.problemId, trace, { log, warn: log, error: log }, validateResultShape);
      test.actual = JSON.parse(JSON.stringify(actual));
      test.passed = validateJavaScriptResult(test.actual, fixture, request.problemId);
    } catch (error) {
      test.error = { type: error instanceof Error ? error.name : 'Error', message: (error instanceof Error ? error.message : String(error)).slice(0, 500) };
    } finally { Math.random = originalRandom; }
    return test;
  });
  return { tests, passed: tests.filter(test => test.passed).length, total: tests.length };
}

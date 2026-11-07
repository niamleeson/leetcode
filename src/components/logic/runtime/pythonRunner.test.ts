import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPythonRunner, type PythonWorker } from './pythonRunner';
import type { LogicRunRequest, WorkerRequest, WorkerResponse } from './types';

class FakeWorker implements PythonWorker {
  onmessage: PythonWorker['onmessage'] = null;
  onerror: PythonWorker['onerror'] = null;
  messages: WorkerRequest[] = [];
  terminate = vi.fn();
  postMessage(message: WorkerRequest) { this.messages.push(message); }
  send(message: WorkerResponse) { this.onmessage?.({ data: message } as MessageEvent<WorkerResponse>); }
}

const request: LogicRunRequest = {
  problemId: 1,
  code: 'class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]',
  fixtures: [{ name: 'Two different indices', entry: 'twoSum', args: [[3, 3], 6], expected: [0, 1] }],
};
const result = { tests: [], passed: 1, total: 1 };
function setup() {
  const workers: FakeWorker[] = [];
  const factory = vi.fn(() => { const worker = new FakeWorker(); workers.push(worker); return worker; });
  const runner = createPythonRunner({ createWorker: factory, assetBaseUrl: 'https://example.test/leetcode/vendor/pyodide/314.0.7/', loadingTimeoutMs: 100, executionTimeoutMs: 20 });
  return { runner, workers, factory };
}
afterEach(() => vi.useRealTimers());

describe('Python worker lifecycle', () => {
  it('loads nothing before Run and reuses an initialized worker for the next attempt', async () => {
    const { runner, workers, factory } = setup();
    expect(factory).not.toHaveBeenCalled();
    const status = vi.fn();
    const first = runner.run(request, status);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenLastCalledWith('loading');
    const message = workers[0].messages[0];
    expect(message.code).toBe(request.code);
    workers[0].send({ type: 'status', runId: message.runId, status: 'running' });
    workers[0].send({ type: 'result', runId: message.runId, result });
    await expect(first).resolves.toEqual(result);
    const second = runner.run(request, status);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenLastCalledWith('running');
    workers[0].send({ type: 'result', runId: workers[0].messages[1].runId, result });
    await expect(second).resolves.toEqual(result);
    runner.dispose();
  });

  it('Stop immediately terminates running Python, settles the promise, and permits a fresh run', async () => {
    const { runner, workers, factory } = setup();
    const pending = runner.run(request);
    const rejection = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    workers[0].send({ type: 'status', runId: 1, status: 'running' });
    runner.stop();
    await rejection;
    expect(workers[0].terminate).toHaveBeenCalledOnce();
    const retry = runner.run(request);
    expect(factory).toHaveBeenCalledTimes(2);
    workers[1].send({ type: 'result', runId: 2, result });
    await expect(retry).resolves.toEqual(result);
    runner.dispose();
  });

  it('a loading timeout terminates the worker and explains how to retry', async () => {
    vi.useFakeTimers();
    const { runner, workers } = setup();
    const pending = runner.run(request);
    const rejection = expect(pending).rejects.toThrow('Python took too long to load');
    await vi.advanceTimersByTimeAsync(101);
    await rejection;
    expect(workers[0].terminate).toHaveBeenCalledOnce();
    runner.dispose();
  });

  it('the outer execution timeout works even if Python disables its own tracing', async () => {
    vi.useFakeTimers();
    const { runner, workers } = setup();
    const pending = runner.run({ ...request, code: 'import sys\nsys.settrace(None)\nwhile True: pass' });
    const rejection = expect(pending).rejects.toThrow('Execution timed out');
    workers[0].send({ type: 'status', runId: 1, status: 'running' });
    await vi.advanceTimersByTimeAsync(21);
    await rejection;
    expect(workers[0].terminate).toHaveBeenCalledOnce();
    runner.dispose();
  });

  it('ignores stale responses after cancellation', async () => {
    const { runner, workers } = setup();
    const first = runner.run(request);
    const rejection = expect(first).rejects.toMatchObject({ name: 'AbortError' });
    const obsoleteHandler = workers[0].onmessage!;
    const second = runner.run(request);
    await rejection;
    let settled = false;
    second.then(() => { settled = true; });
    obsoleteHandler({ data: { type: 'result', runId: 1, result } } as unknown as MessageEvent<WorkerResponse>);
    await Promise.resolve();
    expect(settled).toBe(false);
    workers[1].send({ type: 'result', runId: 2, result });
    await second;
    runner.dispose();
  });

  it('discards a failed worker so retry can reload Python', async () => {
    const { runner, workers, factory } = setup();
    const pending = runner.run(request);
    const rejection = expect(pending).rejects.toThrow('download failed');
    workers[0].send({ type: 'error', runId: 1, message: 'download failed' });
    await rejection;
    expect(workers[0].terminate).toHaveBeenCalledOnce();
    const retry = runner.run(request);
    expect(factory).toHaveBeenCalledTimes(2);
    workers[1].send({ type: 'result', runId: 2, result });
    await retry;
    runner.dispose();
  });

  it('disposing settles an in-flight run and prevents use of a closed runner', async () => {
    const { runner } = setup();
    const pending = runner.run(request);
    const rejection = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    runner.dispose();
    await rejection;
    await expect(runner.run(request)).rejects.toThrow('closed');
  });
});

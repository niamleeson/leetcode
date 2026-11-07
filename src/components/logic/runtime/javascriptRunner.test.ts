import { afterEach, describe, expect, it, vi } from 'vitest';
import { createJavaScriptRunner } from './javascriptRunner';
import type { JavaScriptRunRequest } from './javascriptRunner';
const request: JavaScriptRunRequest = { problemId: 1, code: 'function twoSum() {}', execution: { code: '', sites: [] }, fixtures: [] };
function fakeWorker() {
  return { onmessage: null, onerror: null, postMessage: vi.fn(), terminate: vi.fn() } as unknown as Worker;
}
afterEach(() => vi.useRealTimers());

describe('JavaScript worker lifecycle', () => {
  it('loads only on Run and reuses a successful worker', async () => {
    const worker = fakeWorker(), createWorker = vi.fn(() => worker), status = vi.fn();
    const runner = createJavaScriptRunner({ createWorker });
    expect(createWorker).not.toHaveBeenCalled();
    const first = runner.run(request, status);
    worker.onmessage?.({ data: { runId: 1, type: 'status', status: 'running' } } as MessageEvent);
    worker.onmessage?.({ data: { runId: 1, type: 'result', result: { tests: [], passed: 0, total: 0 } } } as MessageEvent);
    await first;
    const second = runner.run(request);
    worker.onmessage?.({ data: { runId: 2, type: 'result', result: { tests: [], passed: 0, total: 0 } } } as MessageEvent);
    await second;
    expect(createWorker).toHaveBeenCalledOnce(); expect(status.mock.calls.flat()).toEqual(['loading', 'running']);
    runner.dispose();
  });

  it('stops pending execution and creates a clean worker on retry', async () => {
    const first = fakeWorker(), second = fakeWorker(), createWorker = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second);
    const runner = createJavaScriptRunner({ createWorker });
    const stopped = runner.run(request); const check = expect(stopped).rejects.toMatchObject({ name: 'AbortError' });
    runner.stop(); await check;
    expect(first.terminate).toHaveBeenCalledOnce();
    const retry = runner.run(request);
    second.onmessage?.({ data: { runId: 2, type: 'result', result: { tests: [], passed: 0, total: 0 } } } as MessageEvent);
    await retry; expect(createWorker).toHaveBeenCalledTimes(2); runner.dispose();
  });

  it('terminates native loops through the supervisor timeout', async () => {
    vi.useFakeTimers();
    const worker = fakeWorker(), runner = createJavaScriptRunner({ createWorker: () => worker, timeoutMs: 100 });
    const result = runner.run(request); const check = expect(result).rejects.toThrow('timed out');
    await vi.advanceTimersByTimeAsync(100); await check;
    expect(worker.terminate).toHaveBeenCalledOnce(); runner.dispose();
  });

  it('rejects failures and prevents reuse after disposal', async () => {
    const worker = fakeWorker(), runner = createJavaScriptRunner({ createWorker: () => worker });
    const result = runner.run(request); const check = expect(result).rejects.toThrow('worker failed');
    worker.onerror?.({ message: 'worker failed' } as ErrorEvent); await check;
    runner.dispose(); await expect(runner.run(request)).rejects.toThrow('closed');
  });
});

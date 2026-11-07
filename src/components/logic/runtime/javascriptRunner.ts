import type { LogicRunResult, LogicRunStatus } from './types';
import type { JavaScriptRunRequest } from './javascriptExecution';
export type { JavaScriptExecution, JavaScriptExecutionSite, JavaScriptRunRequest } from './javascriptExecution';

/** Created and loaded on Run only. A terminated worker is replaced on retry. */
export function createJavaScriptRunner(options: { createWorker?: () => Worker; timeoutMs?: number } = {}) {
  let worker: Worker | undefined;
  let active: { reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> } | undefined;
  let sequence = 0;
  let disposed = false;
  function fail(error: Error) {
    const pending = active; active = undefined;
    if (pending) clearTimeout(pending.timer);
    if (worker) { worker.onmessage = null; worker.onerror = null; worker.terminate(); worker = undefined; }
    pending?.reject(error);
  }
  function stop() { const error = new Error('Run stopped. You can run again.'); error.name = 'AbortError'; fail(error); }
  return {
    run(request: JavaScriptRunRequest, onStatus?: (status: LogicRunStatus) => void): Promise<LogicRunResult> {
      if (disposed) return Promise.reject(new Error('This JavaScript runner has been closed.'));
      if (active) stop();
      const runId = ++sequence;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => fail(new Error('JavaScript execution timed out. Please try again.')), options.timeoutMs ?? 8000);
        active = { reject, timer };
        try {
          onStatus?.('loading');
          worker ??= options.createWorker?.() ?? new Worker(new URL('./javascript.worker.ts', import.meta.url), { type: 'module', name: 'leetcode-javascript' });
          worker.onmessage = ({ data }) => {
            if (!active || data.runId !== runId) return;
            if (data.type === 'status') onStatus?.('running');
            else if (data.type === 'error') fail(new Error(data.message));
            else if (data.type === 'result') { clearTimeout(active.timer); active = undefined; resolve(data.result); }
          };
          worker.onerror = event => fail(new Error(event.message || 'JavaScript could not run. Please retry.'));
          worker.postMessage({ ...request, runId });
        } catch (error) { fail(error instanceof Error ? error : new Error(String(error))); }
      });
    },
    stop,
    dispose() { disposed = true; stop(); },
  };
}

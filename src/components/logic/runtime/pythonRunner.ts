import type { LogicRunRequest, LogicRunResult, LogicRunStatus, WorkerRequest, WorkerResponse } from './types';
export type { LogicFixture, LogicRunRequest, LogicRunResult, LogicTestResult, LogicTraceFrame, LogicRunStatus } from './types';

export interface PythonWorker {
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage(message: WorkerRequest): void;
  terminate(): void;
}

export interface PythonRunnerOptions {
  createWorker?: () => PythonWorker;
  assetBaseUrl?: string;
  loadingTimeoutMs?: number;
  executionTimeoutMs?: number;
}

export function createPythonRunner(options: PythonRunnerOptions = {}) {
  let worker: PythonWorker | undefined;
  let ready = false;
  let disposed = false;
  let sequence = 0;
  let active: { id: number; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> } | undefined;
  const createWorker = options.createWorker ?? (() => new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module', name: 'leetcode-python' }));

  function stopWorker() {
    if (worker) {
      worker.onmessage = null;
      worker.onerror = null;
      worker.terminate();
      worker = undefined;
    }
    ready = false;
  }

  function fail(error: Error) {
    const pending = active;
    active = undefined;
    if (pending) clearTimeout(pending.timer);
    stopWorker();
    pending?.reject(error);
  }

  function stop() {
    const error = new Error('Run stopped. You can edit your code and run again.');
    error.name = 'AbortError';
    fail(error);
  }

  return {
    run(request: LogicRunRequest, onStatus?: (status: LogicRunStatus) => void): Promise<LogicRunResult> {
      if (disposed) return Promise.reject(new Error('This Python runner has been closed.'));
      if (active) stop();
      const id = ++sequence;
      return new Promise((resolve, reject) => {
        try {
          worker ??= createWorker();
          const scheduleTimeout = (status: LogicRunStatus) => {
            if (active) clearTimeout(active.timer);
            const duration = status === 'loading' ? (options.loadingTimeoutMs ?? 45000) : (options.executionTimeoutMs ?? 8000);
            const timer = setTimeout(() => {
              if (active?.id !== id) return;
              const message = status === 'loading'
                ? 'Python took too long to load. Check your connection and run again.'
                : 'Execution timed out. Check whether your loops finish, then run again.';
              fail(new Error(message));
            }, duration);
            active = { id, reject, timer };
            onStatus?.(status);
          };
          scheduleTimeout(ready ? 'running' : 'loading');
          worker.onmessage = ({ data }) => {
            if (active?.id !== id || data.runId !== id) return;
            if (data.type === 'status') {
              if (data.status === 'running') ready = true;
              scheduleTimeout(data.status);
            } else if (data.type === 'error') {
              fail(new Error(`Python could not run: ${data.message}`));
            } else {
              clearTimeout(active.timer);
              active = undefined;
              ready = true;
              resolve(data.result);
            }
          };
          worker.onerror = event => {
            if (active?.id === id) fail(new Error(event.message || 'Python could not load. Run again to retry.'));
            else if (!active) stopWorker();
          };
          const assetBaseUrl = options.assetBaseUrl ?? new URL(`${import.meta.env.BASE_URL}vendor/pyodide/314.0.7/`, window.location.href).href;
          worker.postMessage({ ...request, runId: id, assetBaseUrl });
        } catch (error) {
          if (active?.id === id) fail(error instanceof Error ? error : new Error(String(error)));
          else { stopWorker(); reject(error); }
        }
      });
    },
    stop,
    dispose() { disposed = true; stop(); },
  };
}

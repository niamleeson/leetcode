import canonicalAdapters from '../../../../tools/walkthroughs/python-runtime.py?raw';
import learningRuntime from './pythonRunner.py?raw';
import type { LogicRunResult, WorkerRequest, WorkerResponse } from './types';

interface PyProxy {
  destroy(): void;
  get(key: string): PyProxy & ((argument: string) => string);
}
interface PythonEngine {
  runPython(code: string, options?: { globals: PyProxy }): unknown;
}

let enginePromise: Promise<PythonEngine> | undefined;
let busy = false;
const worker = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

worker.onmessage = async ({ data }) => {
  if (busy) return;
  busy = true;
  const { runId, assetBaseUrl, ...request } = data;
  let namespace: PyProxy | undefined;
  let run: (PyProxy & ((argument: string) => string)) | undefined;
  try {
    if (!enginePromise) {
      worker.postMessage({ runId, type: 'status', status: 'loading' });
      enginePromise = (async () => {
        const moduleUrl = new URL('pyodide.mjs', assetBaseUrl).href;
        const { loadPyodide } = await import(/* @vite-ignore */ moduleUrl);
        return loadPyodide({ indexURL: assetBaseUrl, jsglobals: Object.create(null), stdout: () => {}, stderr: () => {} });
      })();
    }
    const engine = await enginePromise;
    worker.postMessage({ runId, type: 'status', status: 'running' });
    namespace = engine.runPython('dict(__name__="logic_runtime")') as PyProxy;
    engine.runPython(`${canonicalAdapters}\n${learningRuntime}`, { globals: namespace });
    run = namespace.get('run_logic_json');
    const result = JSON.parse(run(JSON.stringify(request))) as LogicRunResult;
    worker.postMessage({ runId, type: 'result', result });
  } catch (error) {
    worker.postMessage({ runId, type: 'error', message: error instanceof Error ? error.message : String(error) });
  } finally {
    run?.destroy();
    namespace?.destroy();
    busy = false;
  }
};

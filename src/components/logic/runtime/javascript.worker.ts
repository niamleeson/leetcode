import { runJavaScript } from './javascriptExecution';
import type { JavaScriptRunRequest } from './javascriptExecution';

const scope = self as unknown as { onmessage: ((event: MessageEvent<JavaScriptRunRequest & { runId: number }>) => void) | null; postMessage(value: unknown): void };
scope.onmessage = ({ data }) => {
  scope.postMessage({ runId: data.runId, type: 'status', status: 'running' });
  try { scope.postMessage({ runId: data.runId, type: 'result', result: runJavaScript(data) }); }
  catch (error) { scope.postMessage({ runId: data.runId, type: 'error', message: error instanceof Error ? error.message : String(error) }); }
};

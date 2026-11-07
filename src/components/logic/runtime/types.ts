export interface LogicFixture {
  name: string;
  entry: string;
  params?: string[];
  args: unknown[];
  expected: unknown;
  compare?: string;
  output?: string;
  operations?: [string, unknown[]][];
  nodeArgs?: number[];
  roundtrip?: string;
  resultArg?: number;
  prefix?: unknown[];
  distinctClone?: boolean;
  pick?: number;
  seed?: number;
}

export interface LogicTraceFrame {
  line: number;
  kind: 'call' | 'return' | 'statement' | 'error';
  functionName: string;
  locals: Record<string, string>;
  stack: string[];
  value?: string;
  /** Precise source expression, used by JavaScript's build-time instrumentation. */
  statement?: string;
  detail?: string;
  valueLabel?: string;
}

export interface LogicTestResult {
  name: string;
  input: unknown[];
  expected: unknown;
  actual?: unknown;
  passed: boolean;
  error?: { type: string; message: string; line?: number };
  trace: LogicTraceFrame[];
  traceTruncated: boolean;
  executionEvents: number;
  stdout: string;
}

export interface LogicRunResult {
  tests: LogicTestResult[];
  passed: number;
  total: number;
}

export interface LogicRunRequest {
  problemId: number;
  code: string;
  fixtures: LogicFixture[];
}

export type LogicRunStatus = 'loading' | 'running';

export type WorkerRequest = LogicRunRequest & { runId: number; assetBaseUrl: string };
export type WorkerResponse =
  | { runId: number; type: 'status'; status: LogicRunStatus }
  | { runId: number; type: 'result'; result: LogicRunResult }
  | { runId: number; type: 'error'; message: string };

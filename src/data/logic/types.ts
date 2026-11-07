export interface LogicParameter {
  name: string;
  type?: string;
  default?: string;
}

export interface LogicInterface {
  kind: 'function' | 'method';
  className?: string;
  name: string;
  parameters: LogicParameter[];
  returnType?: string;
  /** Python def header, without a body or any solution-derived statements. */
  signature: string;
}

export interface LogicFixture {
  name: string;
  entry: string;
  params?: string[];
  args: unknown[];
  expected: unknown;
  operations?: [string, unknown[]][];
  output?: string;
  compare?: string;
  prefix?: unknown[];
  resultArg?: number;
  distinctClone?: boolean;
  nodeArgs?: number[];
  roundtrip?: string;
  pick?: number;
}

export interface LogicExample {
  name: string;
  input: unknown[];
  expected: unknown;
  operations?: [string, unknown[]][];
}

export interface LogicProblemSummary {
  id: number;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface LogicProblem extends LogicProblemSummary {
  description: string;
  examples: LogicExample[];
  starter: string;
  parameters: LogicParameter[];
  interfaces: LogicInterface[];
  fixtures: LogicFixture[];
  validation: {
    kind: 'practice-cases';
    count: number;
    adversarialCount: number;
  };
}

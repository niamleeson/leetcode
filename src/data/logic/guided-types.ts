export type GuidedLanguage = 'python' | 'javascript';
export type GuidedStage = 'pattern' | 'structure' | 'implementation';

export interface GuidedWitness {
  fixtureIndex: number;
  name: string;
  input: unknown[];
  operations?: [string, unknown[]][];
  expected: unknown;
  actual?: unknown;
  error?: { type: string; message: string };
}

export interface GuidedChoice {
  id: string;
  label: string;
  code?: string;
  correct: boolean;
  feedback: string;
  /** Optional code feedback for a single implementation decision. */
  feedbackCode?: string;
  witness?: GuidedWitness;
}

export interface GuidedQuestion {
  id: string;
  stage: GuidedStage;
  prompt: string;
  /** A deliberately limited excerpt, without future decision answers. */
  context?: string;
  /** Inclusive, one-based source rows replaced by an implementation choice. */
  line?: number;
  endLine?: number;
  coveredLines?: number[];
  /** Source lines genuinely changed by a tested wrong alternative. */
  decisionLines?: number[];
  /** A witnessed change to the direct if guard of a bare return. */
  guardedReturns?: { line: number; guardLine: number; choiceId: string }[];
  choices: GuidedChoice[];
}

export interface GuidedCoverage {
  requiredLines: number[];
  coveredLines: number[];
  terminalLines: number[];
  contextOnly?: { line: number; endLine: number; reason: string }[];
}

export interface GuidedJavaScriptExecution {
  code: string;
  sites: {
    line: number;
    lines: number[];
    kind: string;
    label: string;
    start: number;
    end: number;
  }[];
}

export interface GuidedLesson {
  id: number;
  language: GuidedLanguage;
  revision: string;
  title: string;
  source: string;
  sourceHash: string;
  patternId: string;
  questions: GuidedQuestion[];
  coverage: GuidedCoverage;
  execution?: GuidedJavaScriptExecution;
  validation: {
    correctCases: number;
    wrongChoices: number;
    testedWitnesses: number;
  };
}

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
  choices: GuidedChoice[];
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
  execution?: GuidedJavaScriptExecution;
  validation: {
    correctCases: number;
    wrongChoices: number;
    testedWitnesses: number;
  };
}

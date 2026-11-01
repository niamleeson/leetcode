export interface ReactPromptImage {
  src: string;
  alt: string;
  sourceUrl: string;
  width: number;
  height: number;
}

export interface ReactChallenge {
  slug: string;
  title: string;
  difficulty: 'Medium' | 'Hard';
  topics: string[];
  summary: string;
  prompt: string;
  images?: ReactPromptImage[];
  requirements: string[];
  example: { actions: string; result: string };
  steps: string[];
  pitfalls: string[];
  code: string;
  testCases: { action: string; expected: string }[];
  complexity: string;
  integrationNotes?: string[];
  sourceUrl: string;
}

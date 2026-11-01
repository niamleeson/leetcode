export interface ReactChallenge {
  slug: string;
  title: string;
  difficulty: 'Medium' | 'Hard';
  topics: string[];
  summary: string;
  requirements: string[];
  steps: string[];
  pitfalls: string[];
  code: string;
  testCases: { action: string; expected: string }[];
  complexity: string;
  integrationNotes?: string[];
  sourceUrl: string;
}

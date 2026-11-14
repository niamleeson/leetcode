export interface ReactPromptImage {
  src: string;
  alt: string;
  sourceUrl: string;
  width: number;
  height: number;
}

export interface ReactChallenge {
  collection?: 'Games' | 'HackerRank' | 'Suno' | 'Anduril' | 'GreatFrontEnd' | 'Practice' | 'Reference';
  kind?: 'coding' | 'design' | 'discussion';
  report?: string;
  assumptions?: string[];
  sourceLabel?: string;
  additionalSources?: { label: string; url: string }[];
  solutionTitle?: string;
  solutionSections?: { title: string; body: string; code?: string }[];
  codeLanguage?: 'jsx' | 'javascript';
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  summary: string;
  prompt: string;
  images?: ReactPromptImage[];
  requirements: string[];
  example: { actions: string; result: string };
  sampleData?: { title: string; description: string; code: string };
  steps: string[];
  pitfalls: string[];
  code: string;
  testCases: { action: string; expected: string }[];
  complexity: string;
  integrationNotes?: string[];
  sourceUrl?: string;
}

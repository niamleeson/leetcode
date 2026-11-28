import type { TimeComplexityBreakdown } from '../solutions/types';

export interface DailySavedSolution {
  title: string;
  code: string;
  pythonCode?: string;
  intuition: string;
  approach: string;
  hints: string[];
  pseudocode: { concept: string; steps: string[] };
  explanation: string;
  timeComplexity: string;
  timeComplexityBreakdown: TimeComplexityBreakdown;
  spaceComplexity: string;
  variables: Record<string, string>;
  example: string;
  notes?: string[];
  walkthroughMarkdown?: string;
  pythonWalkthroughMarkdown?: string;
}

export interface DailyQuestionDocument {
  id: number;
  date: string;
  comparison: {
    kind: 'same-approach' | 'different-approach';
    summary: string;
    details: string[];
  };
  solutions: DailySavedSolution[];
}

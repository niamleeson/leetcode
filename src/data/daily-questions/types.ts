export interface DailySavedSolution {
  title: string;
  code: string;
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  variables: Record<string, string>;
  example: string;
  notes?: string[];
  walkthroughMarkdown?: string;
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

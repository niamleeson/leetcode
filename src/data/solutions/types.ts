export interface TimeComplexityBreakdown {
  variables: string;
  phases: { label: string; cost: string }[];
  simplifications: string[];
  note: string;
}

export interface SolutionFollowUp {
  title: string;
  label?: 'Alternative' | 'Follow-up' | 'Optimized';
  walkthroughVariant?: string;
  approach: string;
  code: string;
  jsCode?: string;
  jsWalkthrough?: string;
  explanation: string;
  timeComplexity: string;
  timeComplexityBreakdown?: TimeComplexityBreakdown;
  spaceComplexity: string;
}

export interface ProblemSolution {
  id: number;
  description: string;
  examples: string;
  intuition: string;
  approach: string;
  solutionTitle?: string;
  followUp?: SolutionFollowUp;
  code: string;
  jsCode?: string;
  jsWalkthrough?: string;
  explanation: string;
  timeComplexity: string;
  timeComplexityBreakdown?: TimeComplexityBreakdown;
  spaceComplexity: string;
  hints: string[];
}

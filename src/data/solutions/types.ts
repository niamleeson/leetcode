export interface SolutionFollowUp {
  title: string;
  label?: 'Alternative' | 'Follow-up';
  walkthroughVariant?: string;
  approach: string;
  code: string;
  jsCode?: string;
  jsWalkthrough?: string;
  explanation: string;
  timeComplexity: string;
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
  spaceComplexity: string;
  hints: string[];
}

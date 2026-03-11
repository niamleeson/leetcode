export interface ProblemSolution {
  id: number;
  description: string;
  examples: string;
  intuition: string;
  approach: string;
  code: string;
  jsCode?: string;
  jsWalkthrough?: string;
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  hints: string[];
}

export interface ProblemSolution {
  id: number;
  description: string;
  examples: string;
  approach: string;
  code: string;
  jsCode?: string;
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  hints: string[];
}

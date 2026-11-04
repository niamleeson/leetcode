import type { ReactChallenge } from '../types';

type ChallengeInput = Omit<ReactChallenge,
  'collection' | 'kind' | 'difficulty' | 'sourceLabel' | 'sourceUrl' | 'solutionTitle'
> & Partial<Pick<ReactChallenge, 'difficulty' | 'sourceUrl' | 'solutionTitle'>>;

export function defineChallenge(input: ChallengeInput): ReactChallenge {
  return {
    difficulty: 'Medium',
    codeLanguage: 'jsx',
    solutionTitle: 'React solution',
    ...input,
    collection: 'GreatFrontEnd',
    kind: 'coding',
    sourceLabel: input.sourceUrl ? 'GreatFrontEnd problem' : 'GreatFrontEnd React catalog',
    sourceUrl: input.sourceUrl ?? 'https://www.greatfrontend.com/questions/react-coding-interview-questions',
    integrationNotes: [
      'Original study solution for the requirements and assumptions above. Adapt the component or hook exports to your exercise starter.',
      ...(input.integrationNotes ?? []),
    ],
  };
}

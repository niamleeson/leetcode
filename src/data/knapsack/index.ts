import type { DailySavedSolution } from '../daily-questions/types';

export interface KnapsackDocument {
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  descriptionMarkdown: string;
  solutions: DailySavedSolution[];
}

export const knapsackProblems = [
  { slug: 'zero-one-knapsack', title: '0/1 Knapsack', summary: 'Choose each item at most once.' },
  { slug: 'unbounded-knapsack', title: 'Unbounded Knapsack', summary: 'Choose any number of copies of each item.' },
  { slug: 'mixed-knapsack', title: 'Mixed Knapsack', summary: 'Combine items you can use once with items you can reuse.' },
];

const loaders = import.meta.glob<{ default: KnapsackDocument }>('./entries/*.json');

export async function loadKnapsackProblem(slug: string): Promise<KnapsackDocument> {
  const entry = knapsackProblems.find(problem => problem.slug === slug);
  const load = loaders[`./entries/${slug}.json`];
  if (!entry || !load) throw new Error('This knapsack problem is not available.');
  const { default: document } = await load();
  if (document.slug !== slug || !document.descriptionMarkdown || !document.solutions?.length) {
    throw new Error('This knapsack problem could not be loaded.');
  }
  return document;
}

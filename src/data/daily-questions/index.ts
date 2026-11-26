import type { DailyQuestionDocument } from './types';

export const dailyQuestions = [
  { date: '2026-11-25', problemId: 3934 },
  { date: '2026-11-24', problemId: 3411 },
  { date: '2026-11-23', problemId: 1352 },
  { date: '2026-11-22', problemId: 2124 },
  { date: '2026-11-21', problemId: 3331 },
  { date: '2026-11-20', problemId: 3041 },
  { date: '2026-11-19', problemId: 2567 },
  { date: '2026-11-18', problemId: 2914 },
];

const loaders = import.meta.glob<{ default: DailyQuestionDocument }>('./entries/*.json');

export function formatDailyDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}

export function findDailyQuestion(problemId: number, date: string | null) {
  return dailyQuestions.find(question => question.problemId === problemId && question.date === date);
}

export async function loadDailyQuestion(date: string): Promise<DailyQuestionDocument> {
  const entry = dailyQuestions.find(question => question.date === date);
  const load = loaders[`./entries/${date}.json`];
  if (!entry || !load) throw new Error('These daily notes are not available.');
  const { default: document } = await load();
  if (document.date !== date || document.id !== entry.problemId || !document.solutions?.length) {
    throw new Error('These daily notes could not be loaded.');
  }
  return document;
}

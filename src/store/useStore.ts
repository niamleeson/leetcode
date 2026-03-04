import { useState, useCallback, useMemo } from 'react';
import { ProblemProgress, Topic } from '../types';
import { uniqueProblems } from '../data/problems';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  calculateNextReview,
  createDefaultProgress,
  getDueProblems,
} from '../utils/spaced-repetition';

const today = () => new Date().toISOString().split('T')[0];

export function useAppStore() {
  const [progress, setProgress] = useLocalStorage<Record<number, ProblemProgress>>(
    'lc-progress',
    {}
  );
  const [dailyGoal, setDailyGoal] = useLocalStorage<number>('lc-daily-goal', 10);
  const [solvedToday, setSolvedToday] = useLocalStorage<number>('lc-solved-today', 0);
  const [lastStudyDate, setLastStudyDate] = useLocalStorage<string | null>('lc-last-date', null);
  // Reset daily counter if new day
  if (lastStudyDate !== today()) {
    if (lastStudyDate !== null) {
      setSolvedToday(0);
    }
    setLastStudyDate(today());
  }

  const getProgress = useCallback(
    (problemId: number): ProblemProgress => {
      return progress[problemId] || createDefaultProgress(problemId);
    },
    [progress]
  );

  const updateProgress = useCallback(
    (problemId: number, quality: number) => {
      const current = progress[problemId] || createDefaultProgress(problemId);
      const updated = calculateNextReview(current, quality);
      setProgress(prev => ({ ...prev, [problemId]: updated }));
      if (quality >= 3) {
        setSolvedToday(prev => prev + 1);
      }
    },
    [progress, setProgress, setSolvedToday]
  );

  const updateNotes = useCallback(
    (problemId: number, notes: string) => {
      const current = progress[problemId] || createDefaultProgress(problemId);
      setProgress(prev => ({ ...prev, [problemId]: { ...current, notes } }));
    },
    [progress, setProgress]
  );

  const markAttempted = useCallback(
    (problemId: number) => {
      const current = progress[problemId] || createDefaultProgress(problemId);
      if (current.status === 'unseen') {
        setProgress(prev => ({
          ...prev,
          [problemId]: { ...current, status: 'attempted', lastReviewed: today() },
        }));
      }
    },
    [progress, setProgress]
  );

  const resetProgress = useCallback(
    (problemId: number) => {
      setProgress(prev => {
        const next = { ...prev };
        delete next[problemId];
        return next;
      });
    },
    [setProgress]
  );

  const resetAllProgress = useCallback(() => {
    setProgress({});
    setSolvedToday(0);
  }, [setProgress, setSolvedToday]);

  const dueProblems = useMemo(() => getDueProblems(progress), [progress]);

  const stats = useMemo(() => {
    const total = uniqueProblems.length;
    const progressValues = Object.values(progress);
    const solved = progressValues.filter(p => p.status === 'solved').length;
    const attempted = progressValues.filter(p => p.status === 'attempted').length;
    const unseen = total - solved - attempted;

    const byDifficulty = {
      Easy: { total: 0, solved: 0, attempted: 0 },
      Medium: { total: 0, solved: 0, attempted: 0 },
      Hard: { total: 0, solved: 0, attempted: 0 },
    };

    for (const p of uniqueProblems) {
      byDifficulty[p.difficulty].total++;
      const prog = progress[p.id];
      if (prog?.status === 'solved') byDifficulty[p.difficulty].solved++;
      else if (prog?.status === 'attempted') byDifficulty[p.difficulty].attempted++;
    }

    return { total, solved, attempted, unseen, byDifficulty };
  }, [progress]);

  const getTopicStats = useCallback(
    (topic: Topic) => {
      const topicProblems = uniqueProblems.filter(p => p.topics.includes(topic));
      const total = topicProblems.length;
      let solved = 0;
      let attempted = 0;
      for (const p of topicProblems) {
        const prog = progress[p.id];
        if (prog?.status === 'solved') solved++;
        else if (prog?.status === 'attempted') attempted++;
      }
      return { total, solved, attempted, unseen: total - solved - attempted };
    },
    [progress]
  );

  const getStudyQueue = useCallback(
    (topic: Topic | null, count: number = 10): number[] => {
      let pool = topic
        ? uniqueProblems.filter(p => p.topics.includes(topic))
        : uniqueProblems;

      // Priority: due for review > unseen easy > unseen medium > unseen hard
      const due: number[] = [];
      const unseenEasy: number[] = [];
      const unseenMedium: number[] = [];
      const unseenHard: number[] = [];

      for (const p of pool) {
        const prog = progress[p.id];
        if (prog && dueProblems.includes(p.id)) {
          due.push(p.id);
        } else if (!prog || prog.status === 'unseen') {
          if (p.difficulty === 'Easy') unseenEasy.push(p.id);
          else if (p.difficulty === 'Medium') unseenMedium.push(p.id);
          else unseenHard.push(p.id);
        }
      }

      return [...due, ...unseenEasy, ...unseenMedium, ...unseenHard].slice(0, count);
    },
    [progress, dueProblems]
  );

  return {
    progress,
    dailyGoal,
    setDailyGoal,
    solvedToday,
    getProgress,
    updateProgress,
    updateNotes,
    markAttempted,
    resetProgress,
    resetAllProgress,
    dueProblems,
    stats,
    getTopicStats,
    getStudyQueue,
  };
}

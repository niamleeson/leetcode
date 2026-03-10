export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Topic =
  | 'Arrays & Hashing'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Stack'
  | 'Binary Search'
  | 'Linked List'
  | 'Trees'
  | 'Tries'
  | 'Heap / Priority Queue'
  | 'Backtracking'
  | 'Graphs'
  | 'Dynamic Programming'
  | 'Greedy'
  | 'Intervals'
  | 'Math & Geometry'
  | 'Bit Manipulation'
  | 'String'
  | 'Union Find'
  | 'Monotonic Stack'
  | 'Sorting'
  | 'Design'
  | 'Simulation'
  | 'Recursion'
  | 'Matrix'
  | 'Divide & Conquer'
  | 'Ordered Set'
  | 'Segment Tree'
  | 'Binary Indexed Tree'
  | 'Concurrency';

export interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  topics: Topic[];
  url: string;
  isPremium?: boolean;
}

export interface ProblemProgress {
  problemId: number;
  status: 'unseen' | 'attempted' | 'solved';
  confidence: number; // 0-5 (0 = not rated)
  lastReviewed: string | null;
  nextReview: string | null;
  easeFactor: number;
  interval: number;
  repetitions: number;
  notes: string;
}

export type ViewMode = 'dashboard' | 'topics' | 'study' | 'all-problems' | 'search';

export interface AppState {
  progress: Record<number, ProblemProgress>;
  currentView: ViewMode;
  selectedTopic: Topic | null;
  studyQueue: number[];
  dailyGoal: number;
  solvedToday: number;
  lastStudyDate: string | null;
}

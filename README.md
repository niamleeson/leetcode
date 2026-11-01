# LeetCode Trainer

A self-contained React app for mastering LeetCode problems with spaced repetition, topic-based lessons, and full Python solutions — no need to visit LeetCode.

## Features

- **848 problems** with descriptions, examples, Python solutions, pseudocode, and step-by-step explanations
- **16 topic lessons** with pattern guides, code templates, common mistakes, and tips
- **Spaced repetition** (SM-2 algorithm) to resurface problems you struggle with
- **Difficulty progression** — study queues prioritize: due reviews > unseen easy > medium > hard
- **Syntax-highlighted Python code** with Prism.js
- **Pseudocode for memorization** — terse natural-language steps for each problem
- **Bookmarkable URLs** — every topic, problem, and filter state has its own route
- **Progress tracking** saved to localStorage
- **HackerRank React** — all 10 public practice questions with problem prompts, example interactions, JavaScript/JSX solutions, explanations, complexity notes, and edge cases; open it from the sidebar

## Topics Covered

Arrays & Hashing, Two Pointers, Sliding Window, Stack, Binary Search, Linked List, Trees, Tries, Heap / Priority Queue, Backtracking, Graphs, Dynamic Programming, Greedy, Intervals, Math & Geometry, Bit Manipulation

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Routes

| Path | Page |
|---|---|
| `/` | Dashboard |
| `/study` | Study session |
| `/problems` | All problems (filterable) |
| `/search` | Search |
| `/hackerrank-react` | HackerRank React question catalog |
| `/hackerrank-react/:slug` | React solution, explanation, and checks |
| `/topic/:slug` | Topic lesson + problems |
| `/problem/:id` | Individual problem page |

Filters sync to query params: `/problems?status=solved&difficulty=Hard`

The app uses hash routing: for example, `http://localhost:5173/leetcode/#/hackerrank-react`.
Run `npm run hackerrank:test` with Node 22.22 or newer to exercise the displayed React solution code and its study pages.

## Tech Stack

React 18, TypeScript, Tailwind CSS, Vite, React Router, Prism.js

## How It Works

1. Pick a topic or start a study session
2. Read the problem description and try to solve it
3. Check the solution, pseudocode, and explanation
4. Rate your confidence (0-5) — the SM-2 algorithm schedules your next review
5. Problems you struggle with come back sooner; ones you nail get spaced out further

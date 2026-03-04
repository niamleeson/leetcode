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
| `/topic/:slug` | Topic lesson + problems |
| `/problem/:id` | Individual problem page |

Filters sync to query params: `/problems?status=solved&difficulty=Hard`

## Tech Stack

React 18, TypeScript, Tailwind CSS, Vite, React Router, Prism.js

## How It Works

1. Pick a topic or start a study session
2. Read the problem description and try to solve it
3. Check the solution, pseudocode, and explanation
4. Rate your confidence (0-5) — the SM-2 algorithm schedules your next review
5. Problems you struggle with come back sooner; ones you nail get spaced out further

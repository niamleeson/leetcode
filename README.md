# LeetCode Trainer

A self-contained React app for mastering LeetCode problems with spaced repetition, topic-based lessons, and full Python solutions — no need to visit LeetCode.

## Features

- **4,101 LeetCode problems** with local statements, explanations, and implementations across available languages, plus 30 system-design study problems (catalog snapshot: November 7, 2026)
- **16 topic lessons** with pattern guides, code templates, common mistakes, and tips
- **Spaced repetition** (SM-2 algorithm) to resurface problems you struggle with
- **Difficulty progression** — study queues prioritize: due reviews > unseen easy > medium > hard
- **Syntax-highlighted Python code** with Prism.js
- **Pseudocode for memorization** — terse natural-language steps for each problem
- **Bookmarkable URLs** — every topic, problem, and filter state has its own route
- **Progress tracking** saved to localStorage
- **React interview practice** — five game exercises first, followed by GreatFrontEnd questions, additional practice, and references; complete JSX solutions, explanations, complexity notes, and edge cases

- **Python and JavaScript execution walkthroughs** for all NeetCode 250 problems and 13 alternatives, including line highlighting, Next/Back/Reset, examples, variables, objects, and recursive call stacks
- **Load on demand**: routes, individual curated solutions, catalog documents, and execution recordings load when opened; catalog text and code are served directly by GitHub Pages

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
| `/system-design` | 49 Hello Interview articles, grouped and searchable |
| `/system-design/:slug` | Condensed notes with diagrams; switch to the full saved article |
| `/system-design?view=practice` | Existing 30-problem system design reference |
| `/hackerrank-react` | React interview questions and references |
| `/hackerrank-react/:slug` | React solution, explanation, and checks |
| `/topic/:slug` | Topic lesson + problems |
| `/problem/:id` | Individual problem page |

Filters sync to query params: `/problems?status=solved&difficulty=Hard`

The app uses hash routing: for example, `http://localhost:5173/leetcode/#/hackerrank-react`.
Run `npm run hackerrank:test` with Node 22.22 or newer to exercise the displayed React solution code and its study pages.

## Tech Stack

The System Design library keeps the expanded articles and their embedded images in
`public/system-design/hello-interview/`, loaded only when an article is opened.
All 49 articles have compact hyphen notes, topic-specific sections, downloadable text,
and diagrams that open at full size. Notes load individually on demand. The 496
original images are retained; PostgreSQL adds an original study diagram.
Reviewed note text is in `src/data/system-design-notes-source.txt`; Bitly retains
its existing `src/data/bitly-condensed.txt` source.
To refresh the verified exports, run
`node tools/system-design/import-articles.cjs <export-directory>`, then
`python tools/system-design/condense-articles.py` (requires Beautiful Soup 4), and rebuild.
The importer checks that every original image is assigned once to the condensed notes.
The removed React collections remain accessible through existing direct links, but
are absent from the catalog, search, and normal question navigation.

React 18, TypeScript, Tailwind CSS, Vite, React Router, Prism.js

## How It Works

1. Pick a topic or start a study session
2. Read the problem description and try to solve it
3. Check the solution, pseudocode, and explanation
4. Rate your confidence (0-5) — the SM-2 algorithm schedules your next review
5. Problems you struggle with come back sooner; ones you nail get spaced out further

## Catalog and static deployment

The complete official numbered catalog (1–4101) is included, covering premium,
database, shell, concurrency, and JavaScript questions. Existing curated solutions
and saved progress keep their original problem IDs. Search and the problem list
are paginated; matching entries are never silently truncated.

`npm run build` verifies both walkthrough languages, every curated solution asset,
and exact catalog coverage before writing the GitHub Pages site to `docs/`.
`public/.nojekyll` preserves static assets on Pages. The production branch serves
`main/docs`; commit the source and rebuilt `docs/` together to publish.

After editing curated solutions, run `npm run solutions:generate`. After editing
NeetCode source or fixtures, also run `npm run walkthroughs:generate`.
`npm run catalog:check` verifies all imported content; `npm run catalog:test`
checks document loading, rendering, retries, and complete search navigation.
See [the catalog importer](tools/catalog/README.md) for pinned source revisions,
regeneration, attribution, licenses, and verification limits.

Catalog documents use a versioned directory and curated solutions use content
hashes, so new deployments do not reuse stale content. Sources and licenses are
shown on each imported problem. The HTML renderer pins `hast-util-raw` 9.0.4 to
its compatible Parse5 dependency; the newer parser integration failed the
HTML rendering regression tests in this environment.

# NeetCode execution walkthroughs

Every NeetCode 250 JavaScript solution has at least two reviewed examples in
`fixtures.json`. Expected answers are explicit data. Non-unique answers use
problem-specific validators (topological ordering, grouping, matrix constraints,
palindrome validity and length, and string reorganization).

Run these commands with Node 22 or newer:

```sh
npm run walkthroughs:generate
npm run walkthroughs:verify
npm run walkthroughs:test
npm run build
```

The generator runs each displayed solution twice in isolated Node VM contexts:
once normally and once with recording inserted at original JavaScript AST
locations. Both executions must match the expected answer; the recorded execution
must also match the ordinary execution. In-place prefixes and clone identity are
checked where applicable. The examples include empty structures where allowed,
failed searches, duplicate values, cycles, unreachable targets, and stateful
operation sequences.
Random choices use a fixed per-example seed, so quickselect pivots and recordings
remain reproducible without changing the displayed algorithm.

Recorded steps include initialization, each loop iteration and termination check,
short-circuit conditions, failed guards, mutation operations, function calls,
returns, break, and continue. A pop/shift is recorded before its result is assigned
to a variable. Native operations such as sorting and allocation are atomic;
concise callbacks passed directly to them are part of that operation. Algorithm
helper functions, including recursive helpers and heap methods, are stepped into.

Snapshots preserve object identity, cycles, Maps, Sets, undefined, non-finite
numbers, and BigInt. Heap changes are stored as immutable deltas. Playback shows
the state **after** the highlighted action. Returning through a `finally` hook
keeps recursive call stacks accurate.

The generated JSON files are loaded individually when a problem is expanded.
No solution code is evaluated in the browser. The source displayed by the player
is checked against the current solution; the production build also checks source,
fixture, and recorder hashes. `walkthroughs:verify` compares every committed step
with fresh execution, so a stale or manually edited recording fails verification.

The runtime tests exercise intermediate states independently of the example
outputs. Component tests render every player at its first, middle, and final step,
and cover highlight persistence, source lines, no-op checks, reset, and examples.
These checks verify the supplied cases and recording semantics, not every possible
input to all 250 algorithms. Add a regression fixture whenever a new edge case is
found; never change an expected answer merely to match the implementation.

The eleven newly filled solution entries were checked against the corresponding
official problem statements: [1929](https://leetcode.com/problems/concatenation-of-array/),
[1325](https://leetcode.com/problems/delete-leaves-with-a-given-value/),
[502](https://leetcode.com/problems/ipo/),
[1863](https://leetcode.com/problems/sum-of-all-subset-xor-totals/),
[473](https://leetcode.com/problems/matchsticks-to-square/),
[2707](https://leetcode.com/problems/extra-characters-in-a-string/),
[2392](https://leetcode.com/problems/build-a-matrix-with-conditions/),
[877](https://leetcode.com/problems/stone-game/),
[649](https://leetcode.com/problems/dota2-senate/),
[2807](https://leetcode.com/problems/insert-greatest-common-divisors-in-linked-list/),
and [3133](https://leetcode.com/problems/minimum-array-end/).

# NeetCode execution walkthroughs

Every NeetCode 250 JavaScript solution has at least two reviewed examples in
`fixtures.json`. Expected answers are explicit data. Non-unique answers use
problem-specific validators (topological ordering, grouping, matrix constraints,
palindrome validity and length, and string reorganization).

Number of Islands includes recursive DFS and iterative DFS with an explicit
stack. Both versions share fixtures and each has a separately verified recording.
Alternative solutions opt in with `followUp.walkthroughVariant`; artifacts use
`<problem ID>-<variant>.json`. Generation, verification, source checks, and the
recording audit cover these alternatives as well as the 250 primary solutions.
Use `node tools/walkthroughs/verify.cjs --write --ids=200` to regenerate both
Number of Islands recordings without rewriting unrelated problems.

Run these commands with Node 22 or newer:

```sh
npm run walkthroughs:generate
npm run walkthroughs:verify
npm run walkthroughs:audit
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
compound conditions, failed guards, mutation operations, function calls,
returns, break, and continue. A pop/shift is recorded before its result is assigned
to a variable. Native operations such as sorting and allocation are atomic;
concise callbacks passed directly to them are part of that operation. Algorithm
helper functions, including recursive helpers and heap methods, are stepped into.
Standalone mutations are recorded once; their enclosing expression statement
does not create a duplicate frame. Compound conditions produce one decision, and
boolean initializers produce one statement, while preserving JavaScript's actual
short-circuit behavior. Statements that happen to leave values unchanged still
execute and remain available as code steps, without artificial NOOP labels.

Snapshots preserve object identity, cycles, Maps, Sets, undefined, non-finite
numbers, and BigInt. Heap changes are stored as immutable deltas. Playback shows
the state **after** the highlighted action. The data view keeps its last change
markers while code advances through an unchanged check, and updates on the next
data change. New variables display `name = value`; existing values display
`name old → new`. Real `undefined` values stay explicit. Returning through a `finally` hook
keeps recursive call stacks accurate.

All live variables stay visible, including unchanged accumulators, counters,
pointer indices, and condition values. Compact variable rows keep a stable order
and disappear only when the binding leaves scope. Collections are displayed by
their runtime type rather than a whitelist of names; aliases share one data
panel with all their names and source index markers. This keeps values such as
`maxArea`, `maxProfit`, `freshCount`, `charSet`, and `inDegree` available throughout
the relevant code steps, without repeating them in a collapsed variables list.

NeetCode pages use one outer gutter, without padded cards around each topic,
template, solution, and walkthrough. Code keeps its original line breaks and
full height, with horizontal scrolling inside the code block on narrow screens.
Wide layouts give additional width to the code alongside the walkthrough.

Tree layouts reserve left and right child slots, including a missing sibling,
and check node separation and edge direction against every recorded tree state.
Suspended recursive calls retain their partially constructed nodes; returned
trees use the actual return value, including an empty result. Temporary shared
child references appear in both slots with the same object ID. Node change
markers compare that node's own fields, not its entire descendant subtree.
Wide diagrams scroll horizontally to preserve readable spacing.

Graph diagrams include directed reciprocal equation weights, both matrix
constraint graphs, isolated vertices, and visible self-loops. Stable node
positions stay fixed as pointers and queue membership change. The lock view
changes neighborhoods when the current lock state changes. Point
graphs preserve Cartesian coordinates; implicit graph problems use word
transformations, current lock neighbors, character constraints, email parent
links, or common-factor connections as appropriate. Queued and visited markers
come from recorded state. Very long numeric edge labels are marked approximate,
with the full recorded value available in the edge tooltip.

The generated JSON files are loaded individually when a problem is expanded.
No solution code is evaluated in the browser. The source displayed by the player
is checked against the current solution; the production build also checks source,
fixture, and recorder hashes. `walkthroughs:verify` compares every committed step
with fresh execution, so a stale or manually edited recording fails verification.

The runtime tests exercise intermediate states independently of the example
outputs. Component tests render every player at its first, middle, and final step,
and cover highlight persistence, source lines, unchanged checks, reset, and examples.
These checks verify the supplied cases and recording semantics, not every possible
input to all 250 algorithms. Add a regression fixture whenever a new edge case is
found; never change an expected answer merely to match the implementation.

`walkthroughs:audit` adds two independent checks. It parses the original sources
again to check every highlighted range, reconstructs recorded values, and
recalculates side-effect-free conditions, initializers, and native mutations.
It also runs representative original solutions under V8's debugger, with
breakpoints handled on a separate worker thread, and compares intermediate
snapshots against the recordings. The debugger check covers stack pops, sliding
windows, tree levels, graph cloning/BFS, grid mutation, dynamic programming, and
quickselect; it does not insert recording calls into those executions.

Array markers come from actual indexing expressions in the source. A variable
named `k` is therefore only shown at an array position if that array is indexed
by `k`. Matrix cell markers follow both source indices, and coordinate queues
remain lists. Multiline expressions highlight all their source lines; function
entry and iteration steps highlight only their headers. Special numeric states,
including JavaScript's negative zero, are preserved in the recordings.

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

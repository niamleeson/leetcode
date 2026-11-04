# NeetCode 250 master problem pattern audit

All **180 included problems** and their **13 displayed alternatives** are mapped below. The original 13-chapter outline is insufficient by itself: it needs the specialized rules in this audit before a master solution can claim coverage. The catalog contains **96 study units**, including specialized variants; this is an organizational choice, not a canonical count or a minimum number of algorithms.

Audit date: 2026-11-04. Source revision: `bb9cce9652ab753fbb3dd7923fab85d026f60d0b`. Machine-readable inventory: [neetcode250-pattern-coverage.json](neetcode250-pattern-coverage.json).

## Scope

Exclude named page sections, not every occurrence of those concepts elsewhere. This preserves the previously agreed 180 problems.

Excluded sections: 1-D Dynamic Programming, 2-D Dynamic Programming, Greedy, Math & Geometry, and Bit Manipulation. Grid problems and rectangle prefix sums remain included. Arithmetic used for indices, carries, or distances is not automatically a separate excluded technique.

JavaScript is the master-reference target. All included primary and currently displayed alternative JavaScript algorithms were inspected; selected Python versions were checked to identify differences noted below. Descriptions and approach text were cross-checked against the code where they could misclassify a method. Source hashes pin each version. This audit does not re-run all algorithms, prove every solution, or enumerate every possible valid alternative.

**Mapped is not implemented.** No master-problem lesson or walkthrough has been created by this audit. Every row is a requirement for that future solution.

| Included chapter | Problems | Displayed alternatives | Study units owned by chapter |
| --- | ---: | ---: | ---: |
| Arrays & Hashing | 22 | 0 | 15 |
| Two Pointers | 13 | 0 | 5 |
| Sliding Window | 9 | 0 | 5 |
| Stack | 14 | 1 | 8 |
| Binary Search | 14 | 0 | 5 |
| Linked List | 14 | 0 | 6 |
| Trees | 23 | 0 | 10 |
| Heap / Priority Queue | 12 | 0 | 7 |
| Backtracking | 17 | 0 | 8 |
| Tries | 4 | 0 | 4 |
| Graphs | 21 | 8 | 13 |
| Advanced Graphs | 10 | 4 | 6 |
| Intervals | 7 | 0 | 4 |

## Excluded concepts still present in included sections

The agreed scope excludes sections. It cannot also promise an absence of every greedy, DP, numeric, or bitwise idea. These substantive overlaps are retained and flagged; they are not silently removed from the 180. The flags are semantic judgments, not a claim that all other algorithms have no possible DP or greedy interpretation.

| Problem | Concept overlap |
| --- | --- |
| #122 Best Time to Buy And Sell Stock II | Greedy: collecting every positive adjacent gain. |
| #11 Container With Most Water | Greedy reasoning: discard the limiting endpoint using a dominance argument. |
| #881 Boats to Save People | Greedy: pairing the heaviest remaining item with a feasible lightest item. |
| #121 Best Time to Buy And Sell Stock | Greedy reasoning: retain the cheapest earlier purchase. |
| #853 Car Fleet | Greedy: descending-position fleet aggregation. |
| #1011 Capacity to Ship Packages Within D Days | Greedy feasibility: pack each ordered day maximally under a candidate capacity. |
| #410 Split Array Largest Sum | Greedy feasibility: make maximal contiguous groups under a candidate sum. |
| #337 House Robber III | Dynamic programming: take/skip states on a tree, despite placement in Trees. |
| #124 Binary Tree Maximum Path Sum | Dynamic programming viewpoint: reuse optimal downward subtree gains; taught here as postorder aggregation. |
| #973 K Closest Points to Origin | Geometry: squared Euclidean distance provides the heap priority. |
| #621 Task Scheduler | Greedy and counting formula: maximum-frequency cooldown frames; no heap in the displayed solution. |
| #767 Reorganize String | Greedy: select the most frequent currently eligible character. |
| #1405 Longest Happy String | Greedy: select the largest feasible remaining character count. |
| #502 IPO | Greedy: choose the largest affordable nonnegative profit to maximize later eligibility. |
| #1863 Sum of All Subsets XOR Total | Bit manipulation: XOR aggregation is part of the problem, not merely an implementation detail. |
| #140 Word Break II | Dynamic programming: memoized suffix enumeration. |
| #2707 Extra Characters in a String | Dynamic programming: prefix segmentation table; the displayed solution contains no trie. |
| #1462 Course Schedule IV | Dynamic programming: the displayed Floyd-Warshall follow-up uses intermediate-vertex states; BFS primary does not require it. |
| #1631 Path with Minimum Effort | Greedy graph algorithm: finalize the minimum bottleneck path cost. |
| #743 Network Delay Time | Greedy graph algorithm: finalize the minimum unsettled distance with nonnegative weights. |
| #1584 Min Cost to Connect All Points | Greedy graph algorithm: Kruskal minimum spanning tree. Geometry: Manhattan distance builds the edge weights. |
| #778 Swim In Rising Water | Greedy graph algorithm: finalize the minimum required water level. |
| #787 Cheapest Flights Within K Stops | Dynamic programming viewpoint: bounded Bellman-Ford carries costs by permitted edge count. |
| #1489 Find Critical and Pseudo Critical Edges in Minimum Spanning Tree | Greedy graph algorithm: repeated Kruskal minimum spanning trees. |
| #2709 Greatest Common Divisor Traversal | Number theory: prime factorization is required to build the shared-factor connectivity graph efficiently. |
| #435 Non Overlapping Intervals | Greedy: keep the earlier end when discarding an overlapping interval. |

## What the original outline must add

| Chapter | Required additions | Examples |
| --- | --- | --- |
| Arrays & Hashing | Add custom hash tables, cancellation voting, heapsort, three-way selection, frequency buckets, framing codecs, rectangle prefix sums, prefix/suffix products, and in-place index placement. | #705, #706, #169, #229, #912, #75, #215, #347, #271, #304, #238, #41 |
| Two Pointers | Separate symmetric reversal, one permitted deletion, merging backward, k-sum duplicate control, area bounds, trapped-volume bounds, and pairing extremes. | #680, #88, #15, #18, #189, #11, #42, #881 |
| Sliding Window | Add exact count matching, historical-max replacement windows, binary-searched windows, and the one-transaction running minimum. | #567, #424, #658, #121 |
| Stack | Add adapters with restricted operations, augmented minima, collision cancellation, frequency/recency buckets, fleet aggregation, and histogram boundary accounting. | #225, #232, #155, #735, #895, #853, #84 |
| Binary Search | Add predecessor queries, rotated duplicates, coupled median partitions, and mountain-array oracle limits. | #981, #81, #4, #1095 |
| Linked List | Separate cycle entrance from detection, group reconnection, random-pointer identity cloning, carry streams, circular queues, and LFU from ordinary LRU. | #287, #25, #138, #2, #622, #460 |
| Trees | Add pairwise equality/subtree search, ancestor bounds, BST successor deletion, traversal reconstruction, quad-tree compression, and take/skip tree DP. | #100, #572, #98, #450, #105, #427, #337 |
| Heap / Priority Queue | Distinguish bounded selection, stream merging, two ordered halves, eligibility scheduling, temporary withholding, difference sweeps, and formula-only scheduling. | #703, #355, #295, #1834, #767, #1094, #621 |
| Backtracking | Separate index reuse, per-level duplicate skipping, permutation duplicate order, cut choices, bucket symmetry, attacked diagonals, and suffix memoization. | #39, #40, #47, #131, #698, #51, #140 |
| Tries | Add the dictionary DP exception and explicitly combine terminal deduplication, path restoration, and branch pruning in multiword search. | #2707, #212 |
| Graphs | Add local edge accounting, reverse boundary searches, all-source closure, weighted products, leaf peeling, feature graphs, and the displayed union-find alternatives. | #463, #997, #417, #1462, #399, #310, #721, #2709, #323 |
| Advanced Graphs | Separate additive versus bottleneck relaxation, edge-budget rounds, spanning-tree edge sensitivity, and edge-consuming Eulerian traversal. | #743, #1631, #778, #787, #1489, #332 |
| Intervals | Add presorted insertion, strict versus touching endpoint semantics, delayed room assignment with ties, and offline query reordering. | #57, #435, #2402, #1851 |

## Labels and source details that would mislead the master lesson

| Problem | Finding |
| --- | --- |
| #705 Design HashSet | The approach text mentions a direct-address option, but both displayed implementations use collision buckets. |
| #304 Range Sum Query 2D Immutable | Keep this rectangle prefix-sum lesson in the section-based scope; two-dimensional input is not equivalent to the excluded 2-D DP category. |
| #424 Longest Repeating Character Replacement | Historical maxFreq can overestimate the actual current frequency. The length-only invariant does not promise that every retained window itself is valid. |
| #658 Find K Closest Elements | Placed under Sliding Window, but the current solution binary-searches a window boundary. |
| #84 Largest Rectangle In Histogram | JavaScript stores [leftEdge,height]; Python stores bar indices. Teach both boundary calculations if displaying both languages. |
| #543 Diameter of Binary Tree | Existing comment and explanation call the returned height an edge count, but null returns 0 and a leaf returns 1, so returned heights count nodes. Adding the child heights correctly gives the through-node diameter in edges. |
| #105 Construct Binary Tree From Preorder And Inorder Traversal | Existing explanation incorrectly says preorder is left-root-right; code correctly consumes root-left-right. Flagged here, not edited during this audit. |
| #215 Kth Largest Element In An Array | Placed under Heap / Priority Queue, but the current solution is three-way randomized quickselect. |
| #621 Task Scheduler | Placed under Heap / Priority Queue, but the current solution counts frequencies and applies a formula. |
| #355 Design Twitter | The prose calls this a heap merge. JavaScript actually re-sorts the active stream candidates; Python uses heapq. Same stream invariant, different selection cost. |
| #767 Reorganize String | JavaScript uses repeated sorting while Python uses a heap. Do not teach the JavaScript snippet as heap push/pop execution. |
| #1094 Car Pooling | Placed under Heap / Priority Queue, but the current solution is a difference array and prefix scan. |
| #2707 Extra Characters in a String | Placed under Tries, but the current JavaScript and Python are dictionary-set DP. |
| #127 Word Ladder | The displayed code does not clear wildcard buckets after expansion; bucket clearing is an optional optimization, not an audited existing step. |
| #778 Swim In Rising Water | Marking on insertion is specific to this vertex-elevation bottleneck model; do not copy it into the general additive or edge-effort Dijkstra lesson. |
| #2392 Build a Matrix With Conditions | Two topological orders plus matrix placement; the two-dimensional output does not make the method 2-D DP. |

## Study unit catalog

Each unit has a concrete operation in the shared delivery-system story. Several problems may share a unit, but their separate invariants in the next section remain mandatory. Cross-category reuse is intentional; for example, quickselect lives beside partitioning, even though its problem is listed under Heap.

| Unit | Technique | Master operation | Problems and alternatives using it |
| --- | --- | --- | --- |
| A01 | Sequential scanning and compaction | Copy package records, compare shared prefixes, and compact retained records. | #1929, #14, #27, #26 |
| A02 | Set membership and structural constraints | Detect duplicates, validate row/column/box constraints, and start runs only at their first value. | #217, #36, #128, #219, #3 |
| A03 | Counts and grouped records | Count inventory, group records by key, and derive canonical signatures when equality needs normalization. | #242, #49, #347, #424, #567, #76, #981, #621, #355, #767 |
| A04 | Complement lookup | Find an earlier package whose weight completes a target. | #1, #560 |
| A05 | Hash table implementation | Implement buckets and collision handling without a built-in set or map. | #705, #706 |
| A06 | Boyer Moore candidate cancellation | Find majority labels, with candidate verification when existence is not guaranteed. | #169, #229 |
| A07 | Heap construction and heapsort | Sort records in place with a shrinking heap boundary. | #912 |
| A08 | Three way partition and quickselect | Partition package classes and select a rank without fully sorting. | #75, #215 |
| A09 | Frequency bucket ranking | Select frequent destinations by scanning count-indexed buckets. | #347 |
| A10 | Length prefixed encoding | Transmit arbitrary string fields without delimiter ambiguity. | #271 |
| A11 | Rectangle prefix sums | Answer warehouse rectangle totals using inclusion-exclusion. | #304 |
| A12 | Prefix and suffix products | Compute a product excluding each package without division. | #238 |
| A13 | Prefix sum frequency lookup | Count contiguous weight totals, including negative values. | #560 |
| A14 | Value to index placement | Find the first missing positive package slot in place. | #41 |
| A15 | Positive adjacent gain aggregation | Aggregate independently realizable price gains; explicit greedy overlap. | #122 |
| P01 | Symmetric comparison and reversal | Reverse or validate a route string, including one permitted deletion. | #344, #125, #680, #189, #131 |
| P02 | Merging and interleaving sequences | Combine sorted or alternating records without losing unread input. | #1768, #88, #21, #143, #23 |
| P03 | Sorted target elimination and k sum | Find pairs, triples, and quadruples with duplicate suppression. | #167, #15, #18 |
| P04 | Limiting boundary reasoning | Move the limiting boundary when computing capacity or trapped volume. | #11, #42 |
| P05 | Pairing extremes under a limit | Pair the heaviest load with the lightest feasible partner. | #881 |
| W01 | Fixed windows and bounded history | Expire old events and maintain exact character counts. | #219, #567 |
| W02 | Longest window with a validity bound | Expand and repair duplicate or replacement-budget violations. | #3, #424 |
| W03 | Shortest window satisfying requirements | Record a valid window before shrinking it to seek a smaller one. | #209, #76 |
| W04 | Monotonic deque | Keep only unexpired, undominated candidates for recent maxima. | #239 |
| W05 | Running minimum and best gain | Evaluate a sale against the cheapest earlier purchase. | #121 |
| S01 | Operand and history stacks | Evaluate postfix costs or undo and derive recent score entries. | #682, #150 |
| S02 | Nested syntax and saved contexts | Validate brackets and decode repeated nested commands. | #20, #394 |
| S03 | Local cancellation and normalization | Resolve collisions or normalize parent-directory navigation. | #735, #71 |
| S04 | Queue and stack adapters | Implement LIFO using FIFO and FIFO using LIFO, respecting allowed operations. | #225, #232 |
| S05 | Augmented stack state | Store a minimum for each stack depth. | #155 |
| S06 | Monotonic unresolved items | Resolve next-greater distances, aggregate spans, and close rectangle widths. | #739, #901, #84 |
| S07 | Frequency buckets with ordering | Manage most-frequent pops and least-frequent cache eviction with tie rules. | #895, #460 |
| S08 | Arrival time fleet aggregation | Scan vehicles from nearest to farthest and merge catching-up arrivals. | #853 |
| B01 | Ordered search and boundaries | Find exact values, insertion points, predecessors, and optimal window boundaries. | #658, #704, #35, #374, #69, #74, #981, #1095 |
| B02 | Binary search on a feasible answer | Find the first capacity or speed satisfying a monotone feasibility check. | #875, #1011, #410 |
| B03 | Rotated order search | Identify the sorted half, handling duplicate ambiguity separately. | #153, #33, #81 |
| B04 | Coupled partitions of two sorted arrays | Choose two balanced partitions and verify the cross-boundary ordering. | #4 |
| B05 | Peak search and opposite directions | Find a mountain peak, then search its increasing and decreasing sides. | #1095 |
| L01 | Pointer rewiring and reconnection | Reverse whole routes, subranges, or complete groups without losing the suffix. | #206, #143, #92, #25 |
| L02 | Fast slow and fixed gap pointers | Find middles, remove from the end, detect cycles, and locate cycle entry. | #141, #143, #19, #287 |
| L03 | Identity preserving cloning | Register each original-to-copy mapping before connecting arbitrary references. | #138, #133 |
| L04 | Digit streams and carry | Add numbers represented as lists with unequal lengths and a final carry. | #2 |
| L05 | Circular storage | Wrap queue/deque positions while distinguishing empty and full states. | #239, #622 |
| L06 | Recency ordering for caches | Combine key lookup with usage order, using a doubly linked list or ordered frequency buckets. | #146, #460 |
| T01 | Depth first traversal order | Visit before, between, or after children and reproduce that order iteratively. | #94, #144, #145, #226, #572, #230 |
| T02 | Bottom up aggregation and pruning | Return a child summary, update a separate global answer, or remove newly exposed leaves. | #104, #543, #110, #427, #1325, #124 |
| T03 | Paired structure comparison | Compare matching nodes and search for an equal subtree. | #100, #572 |
| T04 | Ancestor state and valid ranges | Pass path maxima or strict value bounds down the tree. | #1448, #98 |
| T05 | Binary search tree navigation and mutation | Use sorted structure for LCA, insertion, deletion, and rank traversal. | #235, #701, #450, #98, #230 |
| T06 | Level traversal | Process a fixed level size and choose all or the last item in that level. | #102, #199 |
| T07 | Reconstruction from traversals | Consume preorder roots and split inorder ranges without copying them. | #105 |
| T08 | Tree encoding with null markers | Serialize shape and values, then consume the same token grammar to rebuild it. | #297 |
| T09 | Tree dynamic programming | Return take/skip choices for each subtree; explicit DP overlap. | #337 |
| T10 | Spatial subdivision and compression | Build four quadrants and collapse equal leaf children. | #427 |
| H01 | Bounded heap selection | Retain only the best k items and inspect the worst retained candidate. | #703, #973 |
| H02 | Repeated priority choice with constraints | Reinsert changed priorities and temporarily hold ineligible choices aside. | #1046, #767, #1405 |
| H03 | Merging multiple sorted streams | Keep one candidate per nonempty stream and advance only the selected stream. | #23, #355 |
| H04 | Eligibility sweep and priority scheduling | Move newly eligible work into a priority queue and handle idle periods and ties. | #1834, #502, #2402 |
| H05 | Two heaps for an ordered split | Maintain lower and upper halves with both order and size invariants. | #295 |
| H06 | Difference arrays and event sweeps | Apply endpoint changes and reconstruct simultaneous resource use. | #1094 |
| H07 | Cooldown frame counting | Derive idle slots from maximum frequency; explicit formula/greedy overlap. | #621 |
| R01 | Subset and combination enumeration | Control reuse and duplicates with the next start index and copy completed paths. | #1863, #78, #39, #40, #77, #90 |
| R02 | Permutation enumeration | Choose unused positions and undo both the path and usage state. | #46, #47 |
| R03 | Constrained sequence construction | Expand legal next symbols using counters or position-specific choices. | #22, #17 |
| R04 | Path scoped grid visits | Mark a cell for one candidate path and restore it when returning. | #79, #212 |
| R05 | Partitioning by valid cuts | Choose a valid prefix and recurse on the remaining suffix. | #131, #140 |
| R06 | Bucket assignment and symmetry pruning | Assign each item once, respect capacity, and skip equivalent bucket states. | #473, #698 |
| R07 | Constraint occupancy sets | Track occupied columns and both diagonal directions while placing choices. | #51, #52 |
| R08 | Memoized suffix enumeration | Cache all completions of a suffix, preserving output construction costs. | #140 |
| TR01 | Trie insertion and prefix lookup | Distinguish an existing path from a complete stored address. | #208, #211, #212 |
| TR02 | Wildcard branching in a trie | Follow one child for a literal or all children for a wildcard. | #211 |
| TR03 | Trie guided grid search | Combine dictionary prefix pruning, path restoration, and result deduplication. | #212 |
| TR04 | Dictionary segmentation dynamic programming | Choose skipping a character or completing a dictionary word; explicit DP overlap. | #2707 |
| G01 | Local edge accounting and degrees | Count boundary contributions or inbound/outbound balance without traversal. | #463, #997 |
| G02 | Custom alphabet comparisons | Use the first differing character and reject longer-before-shorter prefixes. | #953, #269 |
| G03 | Reachability and connected components | Visit each reachable state once and restart from unvisited components. | #200, #695, #133, #130, #261, #1462, #323, #684, #721, #2709 |
| G04 | Multisource breadth first search | Seed every source before expanding shortest-distance layers. | #286, #994 |
| G05 | Implicit state graphs | Generate valid next states or use feature buckets to find neighbors. | #752, #127 |
| G06 | Border reachability and reverse traversal | Search from exits or safe boundaries, then intersect or complement the visited sets. | #417, #130 |
| G07 | Topological ordering | Release a node only when its remaining prerequisite count reaches zero. | #207, #210, #269, #2392 |
| G08 | Undirected cycle checks and edge removal | Distinguish a parent edge from a cycle, or test connectivity with a candidate excluded. | #261, #684, #1584, #1489 |
| G09 | Repeated searches and transitive closure | Precompute all-source reachability or expand allowed intermediate vertices. | #1462 |
| G10 | Multiplicative path queries | Store reciprocal edges and accumulate products along a path. | #399 |
| G11 | Leaf layer removal | Peel current leaves together until the tree centers remain. | #310 |
| G12 | Disjoint sets | Find representatives, merge components, and compress parent paths. | #323, #684, #721, #1584, #1489, #2709 |
| G13 | Shared feature graph construction | Connect items through emails or prime-factor representatives instead of every pair. | #721, #2709 |
| D01 | Additive Dijkstra | Finalize the smallest reachable nonnegative path distance and skip outdated entries. | #743 |
| D02 | Bottleneck path search | Replace path addition with a maximum while minimizing the resulting bottleneck. | #1631, #778 |
| D03 | Bounded edge relaxation | Use the previous round to limit a path to a fixed number of edges. | #787 |
| D04 | Kruskal minimum spanning tree | Accept edges in cost order only when they join separate components. | #1584, #1489 |
| D05 | Spanning tree edge sensitivity | Recompute cost with an edge excluded or forced and retain original edge indices. | #1489 |
| D06 | Eulerian traversal | Consume every edge once and append vertices when their outgoing edges are exhausted. | #332 |
| I01 | Merging and inserting intervals | Extend an overlapping interval or preserve the completed prefix and suffix. | #57, #56 |
| I02 | Overlap detection and conflict removal | Treat touching endpoints correctly and keep the earlier end when removing conflicts. | #435, #252 |
| I03 | Resource reuse and delayed allocation | Track earliest release, available resource IDs, and tie-breaking rules. | #253, #2402 |
| I04 | Offline interval queries | Sort queries, add eligible intervals, discard expired candidates, and restore query order. | #1851 |

## Complete problem and variation map

The first row for a problem is its current primary solution. An indented-name alternative row records a separately displayed version. All rows are **specified, not implemented as master lessons**. A future implementation must satisfy the full variation text, not just reference a unit ID.

### Arrays & Hashing

| Problem or displayed alternative | Units | Rule or variation the master solution must teach |
| --- | --- | --- |
| #1929 Concatenation of Array | A01 | Write each item to i and i+n; preserve input order and return a separate output array. |
| #217 Contains Duplicate | A02 | Check membership before insertion; return on the first repeated value. |
| #242 Valid Anagram | A03 | Compare character multiplicities, not just the set of characters; reject unequal lengths. |
| #1 Two Sum | A04 | Look up target-current before storing the current index so an item cannot pair with itself. |
| #14 Longest Common Prefix | A01 | Compare the same character position across strings; stop at mismatch or the shortest string's end. |
| #49 Group Anagrams | A03 | Sort each word to form a canonical grouping key; preserve all original words in each bucket. |
| #27 Remove Element | A01 | The prefix before the write pointer contains only retained values; return its logical length. |
| #169 Majority Element | A06 | Cancel unequal votes; the guaranteed more-than-half majority makes a final verification unnecessary. |
| #705 Design HashSet | A05 | Separate chaining must check duplicates and delete within a collision bucket; current code is not direct addressing. |
| #706 Design HashMap | A05 | Store key/value pairs in collision buckets; updating a key must not create another entry. |
| #912 Sort an Array | A07 | Build the heap bottom-up, then move maxima into a sorted suffix; no built-in sort or copied subarrays. |
| #75 Sort Colors | A08 | Maintain low/mid/high regions; do not advance mid after swapping in an unclassified value from high. |
| #347 Top K Frequent Elements | A03, A09 | Bucket by frequency and scan downward; this displayed solution is not a top-k heap. |
| #271 Encode and Decode Strings | A10 | Read a decimal length and then exactly that many characters; empty strings and embedded delimiters must round-trip. |
| #304 Range Sum Query 2D Immutable | A11 | Use a padded prefix matrix and subtract top/left overlap once; a 2D array alone does not make this excluded DP. |
| #238 Product of Array Except Self | A12 | Combine products strictly before and after each index; handle zeros without division and use output as workspace. |
| #36 Valid Sudoku | A02 | Maintain separate row, column, and box sets; ignore empty cells and check all three constraints before insertion. |
| #128 Longest Consecutive Sequence | A02 | Only start a consecutive run if its predecessor is absent; iterate distinct values to avoid repeated starts. |
| #122 Best Time to Buy And Sell Stock II | A15 | Add every positive adjacent price difference; unlimited transactions justify realizing every rising segment. |
| #229 Majority Element II | A06 | At most two values exceed n/3; candidate cancellation must be followed by actual-frequency verification. |
| #560 Subarray Sum Equals K | A13, A04 | Seed prefix frequency zero with one, query currentSum-k before incrementing, and count repeated prefixes; negatives prevent a generic sum window. |
| #41 First Missing Positive | A14 | Put v at v-1 only when 1<=v<=n; stop on duplicate occupants to prevent an infinite swap loop. |

### Two Pointers

| Problem or displayed alternative | Units | Rule or variation the master solution must teach |
| --- | --- | --- |
| #344 Reverse String | P01 | Swap endpoints in place until pointers meet; no returned copy is required. |
| #125 Valid Palindrome | P01 | Skip non-alphanumeric characters and compare normalized case before moving both pointers. |
| #680 Valid Palindrome II | P01 | At the first mismatch, test either one-character deletion; do not allow another deletion inside the helper. |
| #1768 Merge Strings Alternately | P02 | Alternate elements from independent sequences and then append any remainder; sorted order is not required. |
| #88 Merge Sorted Array | P02 | Merge backward into spare capacity so unread values in the first array are not overwritten. |
| #26 Remove Duplicates From Sorted Array | A01 | Sorted duplicates are adjacent; compare against the last retained value and return the compacted prefix length. |
| #167 Two Sum II Input Array Is Sorted | P03 | Sorted order proves which endpoint can be discarded; return one-based indices. |
| #15 3Sum | P03 | Fix one value, solve the remaining pair, and skip duplicate fixed values and duplicate endpoint values. |
| #18 4Sum | P03 | Fix two values before the pair search; suppress duplicates at both outer levels and both endpoints. |
| #189 Rotate Array | P01 | Reduce k modulo n, reverse the whole array, then reverse the first k and remaining elements. |
| #11 Container With Most Water | P04 | Area uses the shorter endpoint times width; only moving a limiting endpoint can improve the answer. |
| #881 Boats to Save People | P05 | The heaviest person always leaves this iteration; pair with the lightest only if the limit permits. |
| #42 Trapping Rain Water | P04 | Track maxima from both ends and process the side with the smaller known boundary; this is not the container-area formula. |

### Sliding Window

| Problem or displayed alternative | Units | Rule or variation the master solution must teach |
| --- | --- | --- |
| #219 Contains Duplicate II | W01, A02 | Compare against at most the preceding k items; expire the item at i-k after inserting the current item. |
| #121 Best Time to Buy And Sell Stock | W05 | Track the minimum price seen before or at today and the best sale gain; only one buy/sell transaction is allowed. |
| #3 Longest Substring Without Repeating Characters | W02, A02 | While the incoming character is already present, remove from the left; record the longest repaired window. |
| #424 Longest Repeating Character Replacement | W02, A03 | Use window length minus historical maximum frequency; the nondecreasing max and single shrink seek maximum length, not an always-valid materialized window. |
| #567 Permutation In String | W01, A03 | Keep exact counts for a fixed-length window and update equality matches on both entry and exit, including the final window. |
| #209 Minimum Size Subarray Sum | W03 | Positive numbers make shrinking a sum-valid window monotone; update minimum length before removing from the left. |
| #658 Find K Closest Elements | B01 | Binary-search the start of a length-k sorted window using boundary distances; equal distances favor the left window. |
| #76 Minimum Window Substring | W03, A03 | Track satisfied distinct requirements while respecting duplicate character counts; shrink while all requirements remain satisfied. |
| #239 Sliding Window Maximum | W04, L05 | Expire indices at the front, remove dominated values from the back, then emit the front after k arrivals; JS uses a circular deque. |

### Stack

| Problem or displayed alternative | Units | Rule or variation the master solution must teach |
| --- | --- | --- |
| #682 Baseball Game | S01 | C removes the latest score; D and + derive a new score from existing history without consuming those operands. |
| #20 Valid Parentheses | S02 | A closing bracket must match the latest opener; reject premature closers and unmatched openers at the end. |
| #225 Implement Stack Using Queues | S04 | Primary uses active/helper queues and transfers on push; all operations must stay FIFO, including top from the front. |
| #225 alternative: One queue | S04 | Rotate the previous size elements after enqueueing; only queue-front removal and queue-back insertion are used. |
| #232 Implement Queue using Stacks | S04 | Transfer the input stack only when the output stack is empty; each item transfers at most once, giving amortized constant operations. |
| #155 Min Stack | S05 | Store a minimum at each depth, including duplicate minima, and pop values and minima together. |
| #150 Evaluate Reverse Polish Notation | S01 | Pop the right operand before the left; subtraction/division preserve that order and division truncates toward zero. |
| #735 Asteroid Collision | S03 | Only a right-moving stack top and left-moving incoming item collide; distinguish smaller, equal, and larger sizes and repeat while alive. |
| #739 Daily Temperatures | S06 | Store unresolved indices; pop only on a strictly warmer temperature and record the index difference. |
| #901 Online Stock Span | S06 | Store price/span pairs; absorb spans while previous price<=current price, including equal prices. |
| #853 Car Fleet | S08 | Sort positions nearest-to-target first; a following arrival time no greater than the fleet ahead joins it, including equality. |
| #71 Simplify Path | S03 | Ignore empty components and '.', pop for '..' only when possible, and treat other dot strings as ordinary names. |
| #394 Decode String | S02 | Save repeat count and outer text at '['; support multi-digit counts and restore the outer context at ']'. |
| #895 Maximum Frequency Stack | S07 | Keep a stack for each attained frequency; pop the highest-frequency most-recent item and lower maxFreq only when its bucket empties. |
| #84 Largest Rectangle In Histogram | S06 | Increasing stack closes rectangles at a smaller height; JS carries the earliest left edge, Python uses indices; a temporary zero flushes remaining bars. |

### Binary Search

| Problem or displayed alternative | Units | Rule or variation the master solution must teach |
| --- | --- | --- |
| #704 Binary Search | B01 | Use an exact-match closed interval; discarding mid requires lo=mid+1 or hi=mid-1. |
| #35 Search Insert Position | B01 | Find the first value>=target in a half-open range; n is a valid insertion result. |
| #374 Guess Number Higher Or Lower | B01 | The comparison comes from guess(mid), not array access; map the oracle's sign to the correct half. |
| #69 Sqrt(x) | B01 | Find the first integer with square>x and subtract one; zero and one require correct exclusive bounds. |
| #74 Search a 2D Matrix | B01 | The whole matrix must be globally ordered across row boundaries; current code maps a flat index to row/column. |
| #875 Koko Eating Bananas | B02 | Search speed from 1 to max pile; feasibility sums ceil(pile/speed), with each pile costing separate hours. |
| #1011 Capacity to Ship Packages Within D Days | B02 | Search max weight through total weight; preserve package order and start a new day only when the next weight would overflow. |
| #153 Find Minimum In Rotated Sorted Array | B03 | Compare mid with the right endpoint; retain mid when it may be the minimum. |
| #33 Search In Rotated Sorted Array | B03 | Identify a sorted half and test whether the target lies in its bounds before discarding a half. |
| #81 Search In Rotated Sorted Array II | B03 | Equal left and middle values can hide the sorted half; skip an ambiguous endpoint, accepting worst-case linear work. |
| #981 Time Based Key Value Store | B01, A03 | Append timestamped values per key; get finds the latest timestamp<=query, not an exact match, and may return no value. |
| #410 Split Array Largest Sum | B02 | For nonnegative values, feasibility counts contiguous groups under a bound; at most k groups can be subdivided to exactly k. |
| #4 Median of Two Sorted Arrays | B04 | Search the shorter array; complementary cuts must balance sizes and satisfy both cross-boundary inequalities, including empty partitions. |
| #1095 Find in Mountain Array | B05, B01 | Find peak using neighboring values, search ascending side first for the smallest index, then reverse comparisons on the descending side; preserve API-call efficiency. |

### Linked List

| Problem or displayed alternative | Units | Rule or variation the master solution must teach |
| --- | --- | --- |
| #206 Reverse Linked List | L01 | Save the next node before reversing a pointer; return the final previous node as the new head. |
| #21 Merge Two Sorted Lists | P02 | Use a dummy/tail and attach the smaller list head; connect the remaining suffix once one list ends. |
| #141 Linked List Cycle | L02 | Fast moves twice and slow once; compare node identities, and check fast and fast.next before advancing. |
| #143 Reorder List | L02, L01, P02 | Find the midpoint, disconnect halves, reverse the second, then interleave without leaving a cycle. |
| #19 Remove Nth Node From End of List | L02 | Use a dummy and an n+1-node gap to stop before the removed node, including when it is the head. |
| #138 Copy List With Random Pointer | L03 | Create all identity-mapped nodes first, then connect next/random references; equal values are not shared identities. |
| #2 Add Two Numbers | L04 | Continue while either list or carry remains; zero-pad exhausted lists and allocate one node per output digit. |
| #287 Find The Duplicate Number | L02 | Treat values as successor indices without mutating the array; after a meeting, reset one pointer and locate the cycle entrance. |
| #92 Reverse Linked List II | L01 | Keep the node before the segment and its original first node; repeatedly insert the next node at the segment front. |
| #622 Design Circular Queue | L05 | Use head and count to distinguish empty/full; wrap insertion and rear indices within fixed capacity. |
| #146 LRU Cache | L06 | Hash lookup plus doubly linked sentinels; reads and writes update recency, and eviction removes both map and list entries. |
| #460 LFU Cache | S07, L06 | Track key frequency, ordered keys per frequency, and minimum frequency; evict the oldest key in the minimum bucket and update frequency even on reads. |
| #23 Merge K Sorted Lists | H03, P02 | Keep one node per list in the heap; after appending the smallest node, enqueue only its successor. |
| #25 Reverse Nodes In K Group | L01 | Verify k nodes exist before rewiring; reverse exactly k and reconnect the untouched or recursively processed suffix. |

### Trees

| Problem or displayed alternative | Units | Rule or variation the master solution must teach |
| --- | --- | --- |
| #94 Binary Tree Inorder Traversal | T01 | Push the full left path, visit the popped node, then enter its right subtree. |
| #144 Binary Tree Preorder Traversal | T01 | Visit before children; push right before left so the stack visits left first. |
| #145 Binary Tree Postorder Traversal | T01 | Current implementation records root/right/left then reverses output; postorder consumers need child results before processing the parent. |
| #226 Invert Binary Tree | T01 | Swap both child references at every node and visit the swapped subtrees. |
| #104 Maximum Depth of Binary Tree | T02 | Return zero for null and one plus the greater child depth; height is the returned summary. |
| #543 Diameter of Binary Tree | T02 | Return a one-branch height but update the best path with both child heights; measure diameter in edges. |
| #110 Balanced Binary Tree | T02 | Use -1 to propagate an unbalanced subtree instead of repeatedly recomputing heights. |
| #100 Same Tree | T03 | Compare null structure as well as values, then both corresponding child pairs. |
| #572 Subtree of Another Tree | T03, T01 | Try structural equality at every candidate root; equality of just the root value is insufficient. |
| #235 Lowest Common Ancestor of a Binary Search Tree | T05 | Move toward both targets while they lie on one side; the first split or matching ancestor is the answer. |
| #701 Insert into a Binary Search Tree | T05 | Navigate by key comparisons and reconnect the recursive subtree result at the insertion point. |
| #450 Delete Node in a BST | T05 | Handle zero/one child replacement and two-child successor substitution followed by deletion of that successor. |
| #102 Binary Tree Level Order Traversal | T06 | Capture queue length before a level so children belong to the next level. |
| #199 Binary Tree Right Side View | T06 | With left-to-right queue order, keep the last item of each fixed-size level. |
| #427 Construct Quad Tree | T10, T02 | Split a square into four quadrants; collapse only when all four children are leaves with the same value. |
| #1448 Count Good Nodes In Binary Tree | T04 | Carry the maximum from the current root-to-node path, not a global maximum from unrelated branches. |
| #98 Validate Binary Search Tree | T04, T05 | Pass strict ancestor bounds; checking each node only against its immediate children is insufficient. |
| #230 Kth Smallest Element In a Bst | T01, T05 | Inorder traversal of a BST produces sorted values; stop at the kth visited node. |
| #105 Construct Binary Tree From Preorder And Inorder Traversal | T07 | Consume preorder root/left/right while a value-to-inorder-index map identifies subtree bounds; unique values are assumed. |
| #337 House Robber III | T09 | Return take/skip states: taking a parent forces skipping children; skipping permits each child's better state. |
| #1325 Delete Leaves With a Given Value | T02 | Process and reconnect children before deciding whether the current node has become a removable leaf. |
| #124 Binary Tree Maximum Path Sum | T02 | Clamp negative child gains to zero; update a through-node best but return only one branch, and handle all-negative trees. |
| #297 Serialize And Deserialize Binary Tree | T08 | Include null tokens to preserve shape; decoding must consume tokens in the same preorder grammar. |

### Heap / Priority Queue

| Problem or displayed alternative | Units | Rule or variation the master solution must teach |
| --- | --- | --- |
| #703 Kth Largest Element In a Stream | H01 | Keep at most k largest arrivals in a min-heap; repeated add calls maintain the invariant across time. |
| #1046 Last Stone Weight | H02 | Extract the two maximum weights, reinsert a positive difference, and handle zero or one survivor. |
| #973 K Closest Points to Origin | H01 | Rank by squared distance; a max-heap of k retained points evicts the farthest without computing square roots. |
| #215 Kth Largest Element In An Array | A08 | Randomized three-way quickselect narrows around sorted index n-k; the equal band prevents duplicate-heavy degeneration. |
| #621 Task Scheduler | H07, A03 | Maximum frequency, number tied for it, and cooldown determine a frame lower bound; take max with total task count. |
| #355 Design Twitter | H03, A03 | Merge each followed user's newest-first stream, include self, and cap output at ten; JS repeatedly sorts candidates, Python uses a heap. |
| #1834 Single Threaded CPU | H04 | Sort arrivals, enqueue all tasks available at current time, select by duration then original index, and jump time when idle. |
| #767 Reorganize String | H02, A03 | Hold the last character out for one choice, reinsert its remaining count afterward; JS sorts candidates, Python uses a heap. |
| #1405 Longest Happy String | H02 | If the highest-count character would make three equal characters, use the next candidate or stop; reinsert unconsumed counts. |
| #1094 Car Pooling | H06 | Add at pickup and subtract at dropoff, then prefix-scan load; dropoff frees capacity at that same coordinate. |
| #295 Find Median From Data Stream | H05 | Enforce both ordering between halves and size difference<=1; median comes from one root or the two roots. |
| #502 IPO | H04 | Move newly affordable projects into a profit max-heap and choose at most k; increased capital changes later eligibility. |

### Backtracking

| Problem or displayed alternative | Units | Rule or variation the master solution must teach |
| --- | --- | --- |
| #1863 Sum of All Subsets XOR Total | R01 | Include/exclude each value while carrying a running XOR and sum leaf results; the aggregation itself requires XOR. |
| #78 Subsets | R01 | Record every recursion node as a subset; advance start past a chosen position and copy the path. |
| #39 Combination Sum | R01 | Candidates are reusable, so recurse with the same index; positive sorted values permit remaining-target pruning. |
| #40 Combination Sum II | R01 | Use each position once, recurse at i+1, and skip equal values only at the same recursion depth. |
| #77 Combinations | R01 | Record only paths of length k; stop choices early when too few remaining values can complete the path. |
| #46 Permutations | R02 | Choose any unused index; undo both the chosen value and its used marker. |
| #90 Subsets II | R01 | Sort and skip duplicates only when i>start; duplicates may still appear together deeper in a subset. |
| #47 Permutations II | R02 | For equal values, require the previous equal index to have been used on this path before using the next one. |
| #22 Generate Parentheses | R03 | Open count cannot exceed n; close count cannot exceed open count, so invalid prefixes are never generated. |
| #79 Word Search | R04 | Marks belong to one candidate word path and must be restored even after finding a matching continuation. |
| #131 Palindrome Partitioning | R05, P01 | Try each next cut, validate the chosen substring as a palindrome, then recurse on the remaining suffix. |
| #17 Letter Combinations of a Phone Number | R03 | Each input position has its own allowed character set; this is a Cartesian product, with empty input returning no combinations. |
| #473 Matchsticks to Square | R06 | Require a divisible total, place large sticks first, and skip sides with equal current sums; undo unsuccessful placements. |
| #698 Partition to K Equal Sum Subsets | R06 | Generalize to k target-sum buckets; reject oversized items and try each distinct current bucket sum only once per level. |
| #51 N Queens | R07 | Place one queen per row; track column, row+column, and row-column attacks and restore all three after recursion. |
| #52 N Queens II | R07 | Use the same attack-state search but count completions instead of materializing boards. |
| #140 Word Break II | R08, R05 | Memoize all valid sentences for each suffix; combine each valid word with every completion and retain the empty completion base case. |

### Tries

| Problem or displayed alternative | Units | Rule or variation the master solution must teach |
| --- | --- | --- |
| #208 Implement Trie Prefix Tree | TR01 | Distinguish end-of-word from an existing prefix; insertion creates missing children without overwriting existing branches. |
| #211 Design Add And Search Words Data Structure | TR02, TR01 | A dot branches over real character children; an exhausted query succeeds only at an end marker. |
| #2707 Extra Characters in a String | TR04 | Current solution is prefix DP with a dictionary set, not a trie; compare skipping one character with completing every matching word. |
| #212 Word Search II | TR03, TR01, R04 | Follow trie prefixes while marking the current board path; remove a found terminal to avoid duplicates and delete exhausted branches. |

### Graphs

| Problem or displayed alternative | Units | Rule or variation the master solution must teach |
| --- | --- | --- |
| #463 Island Perimeter | G01 | Count four edges per land cell and subtract two per already-counted shared boundary; traversal is unnecessary. |
| #953 Verifying An Alien Dictionary | G02 | Use supplied character ranks, stop at the first mismatch, and reject a longer word before its own prefix. |
| #997 Find the Town Judge | G01 | Increment inbound and decrement outbound trust balance; the judge must reach n-1 under the distinct-edge constraints. |
| #200 Number of Islands | G03 | Restart traversal on each unvisited land cell; recursive and iterative versions mark land permanently for component discovery. |
| #200 alternative: Iterative DFS (explicit stack) | G03 | Use an explicit stack and mark before pushing; each land cell is scheduled once. |
| #695 Max Area of Island | G03 | Count cells within each component and track the largest area; iterative version counts on pop and marks on push. |
| #695 alternative: Iterative DFS (explicit stack) | G03 | Use an explicit stack, mark before pushing, and maintain a component area counter. |
| #133 Clone Graph | L03, G03 | Register a clone before exploring neighbors to preserve cycles and shared identities; recursive and iterative versions differ only in traversal control. |
| #133 alternative: Iterative DFS (explicit stack) | L03, G03 | Create/map clones when discovered and wire all neighbor references while processing an explicit stack. |
| #286 Walls And Gates | G04 | Seed all gates, write distance at discovery, and expand only unfilled rooms so walls and previous discoveries are preserved. |
| #994 Rotting Oranges | G04 | Seed all rotten cells, count fresh cells, and advance in fixed layers; distinguish no fresh cells from unreachable fresh cells. |
| #417 Pacific Atlantic Water Flow | G06 | Reverse water edges: climb from each ocean's border to equal/higher cells, maintain two visited grids, and intersect them. |
| #130 Surrounded Regions | G06, G03 | Mark border-connected O cells safe, capture the remaining O cells, then restore the safe marker. |
| #130 alternative: Iterative DFS (explicit stack) | G06, G03 | Use an explicit stack for border safety marking, then capture and restore in a second pass. |
| #752 Open The Lock | G05 | Generate digit-wheel neighbors, reject dead ends before enqueueing, mark discovered states, and count shortest moves. |
| #207 Course Schedule | G07 | Edges run prerequisite to dependent course; process zero-indegree nodes and require every course to be processed. |
| #210 Course Schedule II | G07 | Collect the same topological processing order; return no order if a cycle prevents processing all courses. |
| #261 Graph Valid Tree | G08, G03 | Skip the parent edge in undirected DFS, reject any other discovered neighbor, and require full connectivity. |
| #1462 Course Schedule IV | G09, G03 | Run BFS separately from every start and retain each reachability row; prerequisite/course edge orientation differs from Course Schedule input pairs. |
| #1462 alternative: Floyd-Warshall (reachability table) | G09 | Floyd-Warshall transitive closure: allow intermediate vertices in the outermost loop and combine reach[i][k] with reach[k][j]. |
| #323 Number of Connected Components In An Undirected Graph | G03 | Count one BFS start per unvisited component, including isolated vertices. |
| #323 alternative: Union-find with path compression | G12 | Decrement component count only when different representatives merge; compress parent paths. |
| #684 Redundant Connection | G08, G03 | Build the full graph, try edges in reverse input order, skip the candidate direct move, and test whether another route still connects its endpoints. |
| #684 alternative: Union-find with path compression | G12 | Process edges in input order; the first failed union identifies the redundant edge for the given tree-plus-one-edge input. |
| #721 Accounts Merge | G13, G03 | Connect emails within each account through one representative, merge transitively by email identity, then sort each component's emails. |
| #721 alternative: Union-find with path compression | G12, G13 | Union each account email with its representative; group by root and sort emails after all unions. |
| #399 Evaluate Division | G10 | Add reciprocal weighted edges; path values multiply rather than add, and unknown variables remain invalid even for x/x. |
| #310 Minimum Height Trees | G11 | Remove all leaves in a layer together; a valid tree has one or two final centers, with a separate single-node case. |
| #127 Word Ladder | G05 | Index wildcard patterns to find one-letter neighbors; BFS distance counts words, and endWord must be in the dictionary. |

### Advanced Graphs

| Problem or displayed alternative | Units | Rule or variation the master solution must teach |
| --- | --- | --- |
| #1631 Path with Minimum Effort | D02 | Relax with max(path effort, absolute edge difference); compare best-known efforts and finalize the target on minimum extraction. |
| #743 Network Delay Time | D01 | Nonnegative edges allow first minimum extraction to finalize a node; skip equal/worse duplicate entries and return the maximum reached distance or -1. |
| #332 Reconstruct Itinerary | D06 | Consume ticket edges rather than marking airports visited; use lexical destination order and reverse the postorder route, retaining duplicate tickets. |
| #332 alternative: Iterative Hierholzer's algorithm (explicit stack) | D06 | Explicit path stack consumes tickets; append an airport only when its outgoing tickets are exhausted, then reverse. |
| #1584 Min Cost to Connect All Points | D04, G08 | Generate Manhattan-weighted edges and apply Kruskal's cost order; primary uses BFS for cycle checks, not BFS as a minimum-cost algorithm. |
| #1584 alternative: Kruskal with union-find and path compression | D04, G12 | Keep Kruskal ordering and replace repeated BFS connectivity checks with disjoint sets. |
| #778 Swim In Rising Water | D02 | Cost is the maximum cell elevation on the path; this specialized vertex-cost model marks on insertion, unlike a general Dijkstra relaxation template. |
| #269 Alien Dictionary | G02, G07 | Infer only the first differing-character edge, deduplicate edges, include isolated characters, reject invalid prefixes, and detect cycles. |
| #787 Cheapest Flights Within K Stops | D03 | k stops allow k+1 edges; relax from the previous prices array into a copy so one round cannot chain multiple new edges. |
| #1489 Find Critical and Pseudo Critical Edges in Minimum Spanning Tree | D05, D04, G08 | Compare baseline MST cost with edge exclusion and forced inclusion; disconnection means infinite cost and answers use original indices. |
| #1489 alternative: Kruskal with union-find and path compression | D05, D04, G12 | Retain exclusion/forced-inclusion MST recomputation while using union-find to test each candidate connection. |
| #2392 Build a Matrix With Conditions | G07 | Topologically order row and column constraints independently; either cycle fails the result, otherwise combine both positions for every value. |
| #2709 Greatest Common Divisor Traversal | G13, G03 | Factor values and connect each prime's indices through one representative; duplicate values remain distinct indices and 1 connects to nothing. |
| #2709 alternative: Union-find with path compression | G13, G12 | Union indices sharing prime factors; handle a single item and any isolated value 1 before checking representatives. |

### Intervals

| Problem or displayed alternative | Units | Rule or variation the master solution must teach |
| --- | --- | --- |
| #57 Insert Interval | I01 | Input is already sorted and disjoint; preserve the before region, merge overlaps, then append the after region without sorting. |
| #56 Merge Intervals | I01 | Sort by start and extend the last end by max on overlap; shared endpoints are merged. |
| #435 Non Overlapping Intervals | I02 | Sort by start; on strict overlap increment removals and keep the smaller end; touching endpoints are allowed. |
| #252 Meeting Rooms | I02 | After sorting by start, only consecutive meetings need comparison; equality at an endpoint is allowed. |
| #253 Meeting Rooms II | I03 | Store one end time per allocated room; reuse the earliest room if it has ended, otherwise grow the allocation count. |
| #2402 Meeting Rooms III | I03, H04 | Separate available room IDs from busy end times; release all finished rooms, preserve duration when delayed, and tie-break by smallest room ID. |
| #1851 Minimum Interval to Include Each Query | I04 | Sort queries with original indices, insert intervals with left<=query, discard right<query, and minimize inclusive length right-left+1. |

## Acceptance criteria for the future master solution

- Every included problem and displayed alternative maps to at least one implemented study unit and its required variation.
- A category label, shared data structure, or common loop shape alone never counts as coverage.
- Each lesson supplies explicit input constraints, expected output, state, invariant, full JavaScript code, and a reason each update is valid.
- Each mapped variation has an example that exercises it, including adversarial cases where a superficially similar template fails.
- Walkthrough events come from executing the displayed code; highlight ranges and data changes match that version. No artificial noop steps or premature structures.
- Show expanded complexity costs and their simplification; preserve the agreed O(1) FIFO convention and distinguish heap costs and output construction.
- Keep all excluded-section overlaps visible; excluding those concepts everywhere would change the 180-problem scope.
- Recheck source hashes and the page inventory before claiming the audit is current.

## Validation

Inventory reconciliation checked the page IDs against the audit: 180 unique included IDs, 70 excluded IDs, no missing or extra included rows, all 13 displayed follow-ups mapped, every referenced study-unit ID defined, and every catalog unit used. Each version stores SHA-256 hashes of its JavaScript and Python source; those hashes identify the audited snapshot, not correctness proofs.

No source fixes or UI changes are part of this audit. The preorder-order and height-unit wording issues flagged above remain separate content issues. The existing older `neetcode250-review.md` describes a previous review and is not used as the current coverage inventory.

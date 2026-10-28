# NeetCode 250 solution review

## Scope and results

- Inventoried all 250 unique problems in the NeetCode 250 page.
- 239 have Python and JavaScript solution records; 11 have no solution record.
- Retrieved current official problem content for 243 problems through LeetCode’s public question API. Seven premium problem bodies were unavailable; these were checked against the project’s local descriptions.
- Ran 1072 Python/JavaScript published-example checks across 224 problems: 0 remaining failures. Inputs and expected outputs were paired from the same example in the statement; the API’s exampleTestcases field was not assumed to match that text.
- Ran dedicated checks in both languages for the other 15 existing solutions: custom node types, interactive interfaces, serialization, and premium-problem fixtures. All passed.
- Added durable regression tests for corrected algorithms and synchronized template preferences. Targeted larger inputs include 100,000 duplicate values for quickselect, a 100,000-element sliding window input, and a 200 × 200 flat ocean grid.
- Manually reviewed queue/stack-only operations, hash-library restrictions, no-division/no-sort restrictions, in-place mutation, 32-bit arithmetic, constant-space requirements, heap semantics, and the MountainArray access budget. Required operations are distinguished from optional follow-ups.

These are example, invariant, and targeted boundary checks, not exhaustive LeetCode judge submissions or a proof of every complexity claim. The Python harness invokes either a Solution method or an existing standalone function. This review does not add every optional follow-up variant.

## Corrections

| Problem | Finding | Correction |
| --- | --- | --- |
| [#7 Reverse Integer](https://leetcode.com/problems/reverse-integer/) | Both versions took the absolute value of INT_MIN, outside the stated signed 32-bit storage restriction. | Keep digits signed and check both bounds before each arithmetic update. |
| [#23 Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) | JavaScript depended on an external priority-queue API and wrapper-style dequeue results. | Include a complete binary heap and consistently return the queued node. |
| [#215 Kth Largest Element In An Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) | Two-way recursive quickselect could make one-element progress on large duplicate arrays, causing quadratic work and stack overflow. | Use iterative three-way partitioning; state the expected and worst-case costs accurately. |
| [#239 Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/) | JavaScript Array.shift() contradicted the advertised linear-time monotonic deque. | Use a circular buffer with O(1) operations at both ends and O(k) storage. |
| [#253 Meeting Rooms II](https://leetcode.com/problems/meeting-rooms-ii/) | JavaScript repeatedly sorted the room array while the explanation claimed a heap and O(n log n) runtime. | Sort the schedule once, then maintain end times with the included binary heap. |
| [#371 Sum of Two Integers](https://leetcode.com/problems/sum-of-two-integers/) | Python could return an incorrect negative value when a carry propagated beyond bit 31, including -1 + 1. | Mask both intermediate values every iteration and decode the signed result with bitwise complement. |
| [#417 Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/) | JavaScript read heights[row][col] before ruling out an invalid row, failing the published examples. | Check bounds first; use explicit traversal stacks in both languages to handle long grid paths. |
| [#703 Kth Largest Element In a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/) | JavaScript sorted the entire retained array on each add while claiming O(log k) heap operations. | Use an actual min-heap with at most k retained values. |
| [#912 Sort an Array](https://leetcode.com/problems/sort-an-array/) | Merge sort allocated copied subarrays despite the request to minimize extra space. | Use iterative in-place heapsort: worst-case O(n log n), O(1) auxiliary space, no built-in sort. |
| [#1046 Last Stone Weight](https://leetcode.com/problems/last-stone-weight/) | JavaScript repeatedly sorted all stones while the shared complexity field claimed heap-based O(n log n). | Use a max-heap through the included comparator-based heap implementation. |
| [#1834 Single Threaded CPU](https://leetcode.com/problems/single-threaded-cpu/) | JavaScript relied on an external priority-queue constructor shape. | Include a heap with an explicit duration/index comparator and a single return convention. |
| [#1851 Minimum Interval to Include Each Query](https://leetcode.com/problems/minimum-interval-to-include-each-query/) | JavaScript relied on an external priority-queue constructor shape. | Include a heap with an explicit size/end comparator and a single return convention. |
| [#2402 Meeting Rooms III](https://leetcode.com/problems/meeting-rooms-iii/) | JavaScript mixed raw heap values with .element wrappers in one solution. | Use the included heap consistently, preserving earliest-end and lowest-room tie-breaking. |

Heap helper source lives in `src/data/solutions/heap-code.ts`. Its full source is included in each displayed solution that uses it, so those answers do not require an unspecified external heap package.

## Missing solution records

These entries appear in NeetCode 250 but have neither a Python nor a JavaScript answer in the solution map. They remain content gaps; they are not counted as passing solutions.

- [#1929 Concatenation of Array](https://leetcode.com/problems/concatenation-of-array/)
- [#1325 Delete Leaves With a Given Value](https://leetcode.com/problems/delete-leaves-with-a-given-value/)
- [#502 IPO](https://leetcode.com/problems/ipo/)
- [#1863 Sum of All Subsets XOR Total](https://leetcode.com/problems/sum-of-all-subset-xor-totals/)
- [#473 Matchsticks to Square](https://leetcode.com/problems/matchsticks-to-square/)
- [#2707 Extra Characters in a String](https://leetcode.com/problems/extra-characters-in-a-string/)
- [#2392 Build a Matrix With Conditions](https://leetcode.com/problems/build-a-matrix-with-conditions/)
- [#877 Stone Game](https://leetcode.com/problems/stone-game/)
- [#649 Dota2 Senate](https://leetcode.com/problems/dota2-senate/)
- [#2807 Insert Greatest Common Divisors in Linked List](https://leetcode.com/problems/insert-greatest-common-divisors-in-linked-list/)
- [#3133 Minimum Array End](https://leetcode.com/problems/minimum-array-end/)

## Remembered template preference

Selecting Pseudocode (memorize) or the code tab now updates every template in the current page, including topics opened afterward. The selection survives reloads and is stored separately from the Python/JavaScript language preference.

- NeetCode 250: `nc250-template-tab`
- NeetCode 150: `nc150-template-tab`
- Blind 75: `nc75-template-tab`

Values are `pseudocode` or `code`. Each page keeps its own preference. The code tab uses the selected language. React interaction tests cover synchronization, remounting, language changes, and page isolation; the running page was also checked across a reload.

## Validation notes

Regression tests are in `src/data/solutions/neetcode250-regressions.test.ts` and `src/components/NeetCodeView.test.tsx`. Python regression checks run when `python3` is installed and passed on this machine. Validation uses Node 22 for the installed jsdom version. The existing Vite test configuration refers to a missing `src/test/setup.ts`, so this review used a temporary Vitest configuration with jsdom and globals enabled rather than altering that unrelated configuration.

## Per-problem coverage

“Examples” means both languages matched the published examples (or an equivalent valid output where order is unspecified). “Dedicated” means both languages passed purpose-built fixtures. Rows are not claims of exhaustive edge-case coverage.

| Problem | Coverage |
| --- | --- |
| [#1929 Concatenation of Array](https://leetcode.com/problems/concatenation-of-array/) | Missing solution |
| [#217 Contains Duplicate](https://leetcode.com/problems/contains-duplicate/) | 6 example checks passed |
| [#242 Valid Anagram](https://leetcode.com/problems/valid-anagram/) | 4 example checks passed |
| [#1 Two Sum](https://leetcode.com/problems/two-sum/) | 6 example checks passed |
| [#14 Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/) | 4 example checks passed |
| [#49 Group Anagrams](https://leetcode.com/problems/group-anagrams/) | 6 example checks passed |
| [#27 Remove Element](https://leetcode.com/problems/remove-element/) | 4 example checks passed |
| [#169 Majority Element](https://leetcode.com/problems/majority-element/) | 4 example checks passed |
| [#705 Design HashSet](https://leetcode.com/problems/design-hashset/) | 2 example checks passed |
| [#706 Design HashMap](https://leetcode.com/problems/design-hashmap/) | 2 example checks passed |
| [#912 Sort an Array](https://leetcode.com/problems/sort-an-array/) | 4 example checks passed |
| [#75 Sort Colors](https://leetcode.com/problems/sort-colors/) | 4 example checks passed |
| [#347 Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) | 6 example checks passed |
| [#271 Encode and Decode Strings](https://leetcode.com/problems/encode-and-decode-strings/) | Dedicated checks passed; official body unavailable |
| [#304 Range Sum Query 2D Immutable](https://leetcode.com/problems/range-sum-query-2d-immutable/) | 2 example checks passed |
| [#238 Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/) | 4 example checks passed |
| [#36 Valid Sudoku](https://leetcode.com/problems/valid-sudoku/) | 4 example checks passed |
| [#128 Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/) | 6 example checks passed |
| [#122 Best Time to Buy And Sell Stock II](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/) | 6 example checks passed |
| [#229 Majority Element II](https://leetcode.com/problems/majority-element-ii/) | 6 example checks passed |
| [#560 Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/) | 4 example checks passed |
| [#41 First Missing Positive](https://leetcode.com/problems/first-missing-positive/) | 6 example checks passed |
| [#344 Reverse String](https://leetcode.com/problems/reverse-string/) | 4 example checks passed |
| [#125 Valid Palindrome](https://leetcode.com/problems/valid-palindrome/) | 6 example checks passed |
| [#680 Valid Palindrome II](https://leetcode.com/problems/valid-palindrome-ii/) | 6 example checks passed |
| [#1768 Merge Strings Alternately](https://leetcode.com/problems/merge-strings-alternately/) | 6 example checks passed |
| [#88 Merge Sorted Array](https://leetcode.com/problems/merge-sorted-array/) | 6 example checks passed |
| [#26 Remove Duplicates From Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) | 4 example checks passed |
| [#167 Two Sum II Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) | 6 example checks passed |
| [#15 3Sum](https://leetcode.com/problems/3sum/) | 6 example checks passed |
| [#18 4Sum](https://leetcode.com/problems/4sum/) | 4 example checks passed |
| [#189 Rotate Array](https://leetcode.com/problems/rotate-array/) | 4 example checks passed |
| [#11 Container With Most Water](https://leetcode.com/problems/container-with-most-water/) | 4 example checks passed |
| [#881 Boats to Save People](https://leetcode.com/problems/boats-to-save-people/) | 6 example checks passed |
| [#42 Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/) | 4 example checks passed |
| [#219 Contains Duplicate II](https://leetcode.com/problems/contains-duplicate-ii/) | 6 example checks passed |
| [#121 Best Time to Buy And Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) | 4 example checks passed |
| [#3 Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/) | 6 example checks passed |
| [#424 Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/) | 4 example checks passed |
| [#567 Permutation In String](https://leetcode.com/problems/permutation-in-string/) | 4 example checks passed |
| [#209 Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/) | 6 example checks passed |
| [#658 Find K Closest Elements](https://leetcode.com/problems/find-k-closest-elements/) | 4 example checks passed |
| [#76 Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/) | 6 example checks passed |
| [#239 Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/) | 4 example checks passed |
| [#682 Baseball Game](https://leetcode.com/problems/baseball-game/) | 6 example checks passed |
| [#20 Valid Parentheses](https://leetcode.com/problems/valid-parentheses/) | 10 example checks passed |
| [#225 Implement Stack Using Queues](https://leetcode.com/problems/implement-stack-using-queues/) | 2 example checks passed |
| [#232 Implement Queue using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/) | 2 example checks passed |
| [#155 Min Stack](https://leetcode.com/problems/min-stack/) | 2 example checks passed |
| [#150 Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/) | 6 example checks passed |
| [#735 Asteroid Collision](https://leetcode.com/problems/asteroid-collision/) | 8 example checks passed |
| [#739 Daily Temperatures](https://leetcode.com/problems/daily-temperatures/) | 6 example checks passed |
| [#901 Online Stock Span](https://leetcode.com/problems/online-stock-span/) | 2 example checks passed |
| [#853 Car Fleet](https://leetcode.com/problems/car-fleet/) | 6 example checks passed |
| [#71 Simplify Path](https://leetcode.com/problems/simplify-path/) | 10 example checks passed |
| [#394 Decode String](https://leetcode.com/problems/decode-string/) | 6 example checks passed |
| [#895 Maximum Frequency Stack](https://leetcode.com/problems/maximum-frequency-stack/) | 2 example checks passed |
| [#84 Largest Rectangle In Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/) | 4 example checks passed |
| [#704 Binary Search](https://leetcode.com/problems/binary-search/) | 4 example checks passed |
| [#35 Search Insert Position](https://leetcode.com/problems/search-insert-position/) | 6 example checks passed |
| [#374 Guess Number Higher Or Lower](https://leetcode.com/problems/guess-number-higher-or-lower/) | Dedicated checks passed |
| [#69 Sqrt(x)](https://leetcode.com/problems/sqrtx/) | 4 example checks passed |
| [#74 Search a 2D Matrix](https://leetcode.com/problems/search-a-2d-matrix/) | 4 example checks passed |
| [#875 Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/) | 6 example checks passed |
| [#1011 Capacity to Ship Packages Within D Days](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/) | 6 example checks passed |
| [#153 Find Minimum In Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) | 6 example checks passed |
| [#33 Search In Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) | 6 example checks passed |
| [#81 Search In Rotated Sorted Array II](https://leetcode.com/problems/search-in-rotated-sorted-array-ii/) | 4 example checks passed |
| [#981 Time Based Key Value Store](https://leetcode.com/problems/time-based-key-value-store/) | 2 example checks passed |
| [#410 Split Array Largest Sum](https://leetcode.com/problems/split-array-largest-sum/) | 4 example checks passed |
| [#4 Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/) | 4 example checks passed |
| [#1095 Find in Mountain Array](https://leetcode.com/problems/find-in-mountain-array/) | Dedicated checks passed |
| [#206 Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/) | 6 example checks passed |
| [#21 Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/) | 6 example checks passed |
| [#141 Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/) | Dedicated checks passed |
| [#143 Reorder List](https://leetcode.com/problems/reorder-list/) | 4 example checks passed |
| [#19 Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) | 6 example checks passed |
| [#138 Copy List With Random Pointer](https://leetcode.com/problems/copy-list-with-random-pointer/) | Dedicated checks passed |
| [#2 Add Two Numbers](https://leetcode.com/problems/add-two-numbers/) | 6 example checks passed |
| [#287 Find The Duplicate Number](https://leetcode.com/problems/find-the-duplicate-number/) | 6 example checks passed |
| [#92 Reverse Linked List II](https://leetcode.com/problems/reverse-linked-list-ii/) | 4 example checks passed |
| [#622 Design Circular Queue](https://leetcode.com/problems/design-circular-queue/) | 2 example checks passed |
| [#146 LRU Cache](https://leetcode.com/problems/lru-cache/) | 2 example checks passed |
| [#460 LFU Cache](https://leetcode.com/problems/lfu-cache/) | 2 example checks passed |
| [#23 Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) | 6 example checks passed |
| [#25 Reverse Nodes In K Group](https://leetcode.com/problems/reverse-nodes-in-k-group/) | 4 example checks passed |
| [#94 Binary Tree Inorder Traversal](https://leetcode.com/problems/binary-tree-inorder-traversal/) | 8 example checks passed |
| [#144 Binary Tree Preorder Traversal](https://leetcode.com/problems/binary-tree-preorder-traversal/) | 8 example checks passed |
| [#145 Binary Tree Postorder Traversal](https://leetcode.com/problems/binary-tree-postorder-traversal/) | 8 example checks passed |
| [#226 Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/) | 6 example checks passed |
| [#104 Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/) | 4 example checks passed |
| [#543 Diameter of Binary Tree](https://leetcode.com/problems/diameter-of-binary-tree/) | 4 example checks passed |
| [#110 Balanced Binary Tree](https://leetcode.com/problems/balanced-binary-tree/) | 6 example checks passed |
| [#100 Same Tree](https://leetcode.com/problems/same-tree/) | 6 example checks passed |
| [#572 Subtree of Another Tree](https://leetcode.com/problems/subtree-of-another-tree/) | 4 example checks passed |
| [#235 Lowest Common Ancestor of a Binary Search Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/) | Dedicated checks passed |
| [#701 Insert into a Binary Search Tree](https://leetcode.com/problems/insert-into-a-binary-search-tree/) | 6 example checks passed |
| [#450 Delete Node in a BST](https://leetcode.com/problems/delete-node-in-a-bst/) | 6 example checks passed |
| [#102 Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/) | 6 example checks passed |
| [#199 Binary Tree Right Side View](https://leetcode.com/problems/binary-tree-right-side-view/) | 8 example checks passed |
| [#427 Construct Quad Tree](https://leetcode.com/problems/construct-quad-tree/) | Dedicated checks passed |
| [#1448 Count Good Nodes In Binary Tree](https://leetcode.com/problems/count-good-nodes-in-binary-tree/) | 6 example checks passed |
| [#98 Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/) | 4 example checks passed |
| [#230 Kth Smallest Element In a Bst](https://leetcode.com/problems/kth-smallest-element-in-a-bst/) | 4 example checks passed |
| [#105 Construct Binary Tree From Preorder And Inorder Traversal](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) | 4 example checks passed |
| [#337 House Robber III](https://leetcode.com/problems/house-robber-iii/) | 4 example checks passed |
| [#1325 Delete Leaves With a Given Value](https://leetcode.com/problems/delete-leaves-with-a-given-value/) | Missing solution |
| [#124 Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/) | 4 example checks passed |
| [#297 Serialize And Deserialize Binary Tree](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/) | Dedicated checks passed |
| [#703 Kth Largest Element In a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/) | 4 example checks passed |
| [#1046 Last Stone Weight](https://leetcode.com/problems/last-stone-weight/) | 4 example checks passed |
| [#973 K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/) | 4 example checks passed |
| [#215 Kth Largest Element In An Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) | 4 example checks passed |
| [#621 Task Scheduler](https://leetcode.com/problems/task-scheduler/) | 6 example checks passed |
| [#355 Design Twitter](https://leetcode.com/problems/design-twitter/) | 2 example checks passed |
| [#1834 Single Threaded CPU](https://leetcode.com/problems/single-threaded-cpu/) | 4 example checks passed |
| [#767 Reorganize String](https://leetcode.com/problems/reorganize-string/) | 4 example checks passed |
| [#1405 Longest Happy String](https://leetcode.com/problems/longest-happy-string/) | 4 example checks passed |
| [#1094 Car Pooling](https://leetcode.com/problems/car-pooling/) | 4 example checks passed |
| [#295 Find Median From Data Stream](https://leetcode.com/problems/find-median-from-data-stream/) | 2 example checks passed |
| [#502 IPO](https://leetcode.com/problems/ipo/) | Missing solution |
| [#1863 Sum of All Subsets XOR Total](https://leetcode.com/problems/sum-of-all-subset-xor-totals/) | Missing solution |
| [#78 Subsets](https://leetcode.com/problems/subsets/) | 4 example checks passed |
| [#39 Combination Sum](https://leetcode.com/problems/combination-sum/) | 6 example checks passed |
| [#40 Combination Sum II](https://leetcode.com/problems/combination-sum-ii/) | 4 example checks passed |
| [#77 Combinations](https://leetcode.com/problems/combinations/) | 4 example checks passed |
| [#46 Permutations](https://leetcode.com/problems/permutations/) | 6 example checks passed |
| [#90 Subsets II](https://leetcode.com/problems/subsets-ii/) | 4 example checks passed |
| [#47 Permutations II](https://leetcode.com/problems/permutations-ii/) | 4 example checks passed |
| [#22 Generate Parentheses](https://leetcode.com/problems/generate-parentheses/) | 4 example checks passed |
| [#79 Word Search](https://leetcode.com/problems/word-search/) | 6 example checks passed |
| [#131 Palindrome Partitioning](https://leetcode.com/problems/palindrome-partitioning/) | 4 example checks passed |
| [#17 Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/) | 4 example checks passed |
| [#473 Matchsticks to Square](https://leetcode.com/problems/matchsticks-to-square/) | Missing solution |
| [#698 Partition to K Equal Sum Subsets](https://leetcode.com/problems/partition-to-k-equal-sum-subsets/) | 4 example checks passed |
| [#51 N Queens](https://leetcode.com/problems/n-queens/) | 4 example checks passed |
| [#52 N Queens II](https://leetcode.com/problems/n-queens-ii/) | 4 example checks passed |
| [#140 Word Break II](https://leetcode.com/problems/word-break-ii/) | 6 example checks passed |
| [#208 Implement Trie Prefix Tree](https://leetcode.com/problems/implement-trie-prefix-tree/) | 2 example checks passed |
| [#211 Design Add And Search Words Data Structure](https://leetcode.com/problems/design-add-and-search-words-data-structure/) | 2 example checks passed |
| [#2707 Extra Characters in a String](https://leetcode.com/problems/extra-characters-in-a-string/) | Missing solution |
| [#212 Word Search II](https://leetcode.com/problems/word-search-ii/) | 4 example checks passed |
| [#463 Island Perimeter](https://leetcode.com/problems/island-perimeter/) | 6 example checks passed |
| [#953 Verifying An Alien Dictionary](https://leetcode.com/problems/verifying-an-alien-dictionary/) | 6 example checks passed |
| [#997 Find the Town Judge](https://leetcode.com/problems/find-the-town-judge/) | 6 example checks passed |
| [#200 Number of Islands](https://leetcode.com/problems/number-of-islands/) | 4 example checks passed |
| [#695 Max Area of Island](https://leetcode.com/problems/max-area-of-island/) | 4 example checks passed |
| [#133 Clone Graph](https://leetcode.com/problems/clone-graph/) | Dedicated checks passed |
| [#286 Walls And Gates](https://leetcode.com/problems/walls-and-gates/) | Dedicated checks passed; official body unavailable |
| [#994 Rotting Oranges](https://leetcode.com/problems/rotting-oranges/) | 6 example checks passed |
| [#417 Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/) | 4 example checks passed |
| [#130 Surrounded Regions](https://leetcode.com/problems/surrounded-regions/) | 4 example checks passed |
| [#752 Open The Lock](https://leetcode.com/problems/open-the-lock/) | 6 example checks passed |
| [#207 Course Schedule](https://leetcode.com/problems/course-schedule/) | 4 example checks passed |
| [#210 Course Schedule II](https://leetcode.com/problems/course-schedule-ii/) | 6 example checks passed |
| [#261 Graph Valid Tree](https://leetcode.com/problems/graph-valid-tree/) | Dedicated checks passed; official body unavailable |
| [#1462 Course Schedule IV](https://leetcode.com/problems/course-schedule-iv/) | 6 example checks passed |
| [#323 Number of Connected Components In An Undirected Graph](https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/) | Dedicated checks passed; official body unavailable |
| [#684 Redundant Connection](https://leetcode.com/problems/redundant-connection/) | 4 example checks passed |
| [#721 Accounts Merge](https://leetcode.com/problems/accounts-merge/) | 4 example checks passed |
| [#399 Evaluate Division](https://leetcode.com/problems/evaluate-division/) | 6 example checks passed |
| [#310 Minimum Height Trees](https://leetcode.com/problems/minimum-height-trees/) | 4 example checks passed |
| [#127 Word Ladder](https://leetcode.com/problems/word-ladder/) | 4 example checks passed |
| [#1631 Path with Minimum Effort](https://leetcode.com/problems/path-with-minimum-effort/) | 6 example checks passed |
| [#743 Network Delay Time](https://leetcode.com/problems/network-delay-time/) | 6 example checks passed |
| [#332 Reconstruct Itinerary](https://leetcode.com/problems/reconstruct-itinerary/) | 4 example checks passed |
| [#1584 Min Cost to Connect All Points](https://leetcode.com/problems/min-cost-to-connect-all-points/) | 4 example checks passed |
| [#778 Swim In Rising Water](https://leetcode.com/problems/swim-in-rising-water/) | 4 example checks passed |
| [#269 Alien Dictionary](https://leetcode.com/problems/alien-dictionary/) | Dedicated checks passed; official body unavailable |
| [#787 Cheapest Flights Within K Stops](https://leetcode.com/problems/cheapest-flights-within-k-stops/) | 6 example checks passed |
| [#1489 Find Critical and Pseudo Critical Edges in Minimum Spanning Tree](https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/) | 4 example checks passed |
| [#2392 Build a Matrix With Conditions](https://leetcode.com/problems/build-a-matrix-with-conditions/) | Missing solution |
| [#2709 Greatest Common Divisor Traversal](https://leetcode.com/problems/greatest-common-divisor-traversal/) | 6 example checks passed |
| [#70 Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) | 4 example checks passed |
| [#746 Min Cost Climbing Stairs](https://leetcode.com/problems/min-cost-climbing-stairs/) | 4 example checks passed |
| [#1137 N-th Tribonacci Number](https://leetcode.com/problems/n-th-tribonacci-number/) | 4 example checks passed |
| [#198 House Robber](https://leetcode.com/problems/house-robber/) | 4 example checks passed |
| [#213 House Robber II](https://leetcode.com/problems/house-robber-ii/) | 6 example checks passed |
| [#5 Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring/) | 4 example checks passed |
| [#647 Palindromic Substrings](https://leetcode.com/problems/palindromic-substrings/) | 4 example checks passed |
| [#91 Decode Ways](https://leetcode.com/problems/decode-ways/) | 6 example checks passed |
| [#322 Coin Change](https://leetcode.com/problems/coin-change/) | 6 example checks passed |
| [#152 Maximum Product Subarray](https://leetcode.com/problems/maximum-product-subarray/) | 4 example checks passed |
| [#139 Word Break](https://leetcode.com/problems/word-break/) | 6 example checks passed |
| [#300 Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/) | 6 example checks passed |
| [#416 Partition Equal Subset Sum](https://leetcode.com/problems/partition-equal-subset-sum/) | 4 example checks passed |
| [#377 Combination Sum IV](https://leetcode.com/problems/combination-sum-iv/) | 4 example checks passed |
| [#279 Perfect Squares](https://leetcode.com/problems/perfect-squares/) | 4 example checks passed |
| [#343 Integer Break](https://leetcode.com/problems/integer-break/) | 4 example checks passed |
| [#1406 Stone Game III](https://leetcode.com/problems/stone-game-iii/) | 6 example checks passed |
| [#62 Unique Paths](https://leetcode.com/problems/unique-paths/) | 4 example checks passed |
| [#63 Unique Paths II](https://leetcode.com/problems/unique-paths-ii/) | 4 example checks passed |
| [#64 Minimum Path Sum](https://leetcode.com/problems/minimum-path-sum/) | 4 example checks passed |
| [#1143 Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/) | 6 example checks passed |
| [#1049 Last Stone Weight II](https://leetcode.com/problems/last-stone-weight-ii/) | 4 example checks passed |
| [#309 Best Time to Buy And Sell Stock With Cooldown](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/) | 4 example checks passed |
| [#518 Coin Change II](https://leetcode.com/problems/coin-change-ii/) | 6 example checks passed |
| [#494 Target Sum](https://leetcode.com/problems/target-sum/) | 4 example checks passed |
| [#97 Interleaving String](https://leetcode.com/problems/interleaving-string/) | 6 example checks passed |
| [#877 Stone Game](https://leetcode.com/problems/stone-game/) | Missing solution |
| [#1140 Stone Game II](https://leetcode.com/problems/stone-game-ii/) | 4 example checks passed |
| [#329 Longest Increasing Path In a Matrix](https://leetcode.com/problems/longest-increasing-path-in-a-matrix/) | 6 example checks passed |
| [#115 Distinct Subsequences](https://leetcode.com/problems/distinct-subsequences/) | 4 example checks passed |
| [#72 Edit Distance](https://leetcode.com/problems/edit-distance/) | 4 example checks passed |
| [#312 Burst Balloons](https://leetcode.com/problems/burst-balloons/) | 4 example checks passed |
| [#10 Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching/) | 6 example checks passed |
| [#860 Lemonade Change](https://leetcode.com/problems/lemonade-change/) | 4 example checks passed |
| [#53 Maximum Subarray](https://leetcode.com/problems/maximum-subarray/) | 6 example checks passed |
| [#918 Maximum Sum Circular Subarray](https://leetcode.com/problems/maximum-sum-circular-subarray/) | 6 example checks passed |
| [#978 Longest Turbulent Subarray](https://leetcode.com/problems/longest-turbulent-subarray/) | 6 example checks passed |
| [#55 Jump Game](https://leetcode.com/problems/jump-game/) | 4 example checks passed |
| [#45 Jump Game II](https://leetcode.com/problems/jump-game-ii/) | 4 example checks passed |
| [#1871 Jump Game VII](https://leetcode.com/problems/jump-game-vii/) | 4 example checks passed |
| [#134 Gas Station](https://leetcode.com/problems/gas-station/) | 4 example checks passed |
| [#846 Hand of Straights](https://leetcode.com/problems/hand-of-straights/) | 4 example checks passed |
| [#649 Dota2 Senate](https://leetcode.com/problems/dota2-senate/) | Missing solution |
| [#1899 Merge Triplets to Form Target Triplet](https://leetcode.com/problems/merge-triplets-to-form-target-triplet/) | 6 example checks passed |
| [#763 Partition Labels](https://leetcode.com/problems/partition-labels/) | 4 example checks passed |
| [#678 Valid Parenthesis String](https://leetcode.com/problems/valid-parenthesis-string/) | 8 example checks passed |
| [#135 Candy](https://leetcode.com/problems/candy/) | 4 example checks passed |
| [#57 Insert Interval](https://leetcode.com/problems/insert-interval/) | 4 example checks passed |
| [#56 Merge Intervals](https://leetcode.com/problems/merge-intervals/) | 6 example checks passed |
| [#435 Non Overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/) | 6 example checks passed |
| [#252 Meeting Rooms](https://leetcode.com/problems/meeting-rooms/) | Dedicated checks passed; official body unavailable |
| [#253 Meeting Rooms II](https://leetcode.com/problems/meeting-rooms-ii/) | Dedicated checks passed; official body unavailable |
| [#2402 Meeting Rooms III](https://leetcode.com/problems/meeting-rooms-iii/) | 4 example checks passed |
| [#1851 Minimum Interval to Include Each Query](https://leetcode.com/problems/minimum-interval-to-include-each-query/) | 4 example checks passed |
| [#168 Excel Sheet Column Title](https://leetcode.com/problems/excel-sheet-column-title/) | 6 example checks passed |
| [#1071 Greatest Common Divisor of Strings](https://leetcode.com/problems/greatest-common-divisor-of-strings/) | 8 example checks passed |
| [#2807 Insert Greatest Common Divisors in Linked List](https://leetcode.com/problems/insert-greatest-common-divisors-in-linked-list/) | Missing solution |
| [#867 Transpose Matrix](https://leetcode.com/problems/transpose-matrix/) | 4 example checks passed |
| [#48 Rotate Image](https://leetcode.com/problems/rotate-image/) | 4 example checks passed |
| [#54 Spiral Matrix](https://leetcode.com/problems/spiral-matrix/) | 4 example checks passed |
| [#73 Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes/) | 4 example checks passed |
| [#202 Happy Number](https://leetcode.com/problems/happy-number/) | 4 example checks passed |
| [#66 Plus One](https://leetcode.com/problems/plus-one/) | 6 example checks passed |
| [#13 Roman to Integer](https://leetcode.com/problems/roman-to-integer/) | 6 example checks passed |
| [#50 Pow(x, n)](https://leetcode.com/problems/powx-n/) | 6 example checks passed |
| [#43 Multiply Strings](https://leetcode.com/problems/multiply-strings/) | 4 example checks passed |
| [#2013 Detect Squares](https://leetcode.com/problems/detect-squares/) | 2 example checks passed |
| [#136 Single Number](https://leetcode.com/problems/single-number/) | 6 example checks passed |
| [#191 Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/) | 6 example checks passed |
| [#338 Counting Bits](https://leetcode.com/problems/counting-bits/) | 4 example checks passed |
| [#67 Add Binary](https://leetcode.com/problems/add-binary/) | 4 example checks passed |
| [#190 Reverse Bits](https://leetcode.com/problems/reverse-bits/) | 4 example checks passed |
| [#268 Missing Number](https://leetcode.com/problems/missing-number/) | 6 example checks passed |
| [#371 Sum of Two Integers](https://leetcode.com/problems/sum-of-two-integers/) | 4 example checks passed |
| [#7 Reverse Integer](https://leetcode.com/problems/reverse-integer/) | 6 example checks passed |
| [#201 Bitwise AND of Numbers Range](https://leetcode.com/problems/bitwise-and-of-numbers-range/) | 6 example checks passed |
| [#3133 Minimum Array End](https://leetcode.com/problems/minimum-array-end/) | Missing solution |

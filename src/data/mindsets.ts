// Five core mindsets for each DSA topic.
// Imported by lessons.ts and attached to each TopicLesson's `mindset` field.

export const mindsets: Record<string, string> = {

'Arrays & Hashing': `CONSTRAINT-FIRST THINKING
• n ≤ 10^5 with "find pair" or "count subarrays" → brute-force O(n²) is too slow → need O(n) hash map
• If values are bounded (e.g., 1 ≤ nums[i] ≤ n), you can use the array itself as a hash map (index-as-hash trick)
• "Subarray sum = k" with negative values → sliding window won't work (no monotonic sum) → prefix sum + hash map

PATTERN RECOGNITION
Structural signatures that map here:
• "Find pair with property X" → complement lookup (Two Sum family)
• "Count / group elements by property" → frequency map / Counter
• "Subarray sum equals / divisible by K" → prefix sum + hash map
• "Product of all except self" → prefix-suffix product arrays
• "Find duplicates / missing in [1, n]" → index-as-hash or XOR

REDUCTION THINKING
Many problems are Two Sum in disguise:
• "Subarray sum = k" reduces to finding two prefix sums whose difference is k — that's Two Sum on prefix sums
• "Group anagrams" reduces to hashing a canonical form (sorted string or char-count tuple) as the map key
• "Longest consecutive sequence" reduces to set lookup — for each potential start (num-1 not in set), count forward

INVARIANT AWARENESS
Two Sum: at iteration i, \`seen\` contains every value from index 0 to i-1 — we check before inserting to avoid self-pairing
Prefix Sum: \`prefix\` map holds every prefix_sum from index 0 to j-1 with its count — lookup happens before insert
  • The seed {0: 1} represents the empty prefix — without it, subarrays starting at index 0 are missed
  • curr_sum at step j is exactly sum(nums[0..j])

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────┬────────┬──────────────────┐
│ Approach                │ Time     │ Space  │ Notes            │
├─────────────────────────┼──────────┼────────┼──────────────────┤
│ Brute force (all pairs) │ O(n²)    │ O(1)   │ Simple, too slow │
│ Sorting + two pointers  │ O(n lgn) │ O(1)   │ Loses indices    │
│ Hash map lookup         │ O(n)     │ O(n)   │ Best general     │
│ Index-as-hash           │ O(n)     │ O(1)   │ Only if vals∈[1,n]│
└─────────────────────────┴──────────┴────────┴──────────────────┘
Hash map trades O(n) space for O(1) lookups. When values are bounded, index-as-hash eliminates even that space cost.`,

'Two Pointers': `CONSTRAINT-FIRST THINKING
• "Sorted array" in the constraints → two pointers from opposite ends, O(n) time O(1) space
• n ≤ 10^5 with "find triplets" → O(n²) two-pointer (fix one + scan rest) is acceptable; O(n³) brute force is not
• "In-place, O(1) extra space" → slow/fast pointer technique (no auxiliary arrays)

PATTERN RECOGNITION
Structural signatures that map here:
• "Sorted + find pair summing to target" → opposite-end pointers (move left if sum too small, right if too large)
• "Remove/deduplicate in-place" → slow/fast pointers (slow = write position, fast = read position)
• "Container / trapping water" → opposite-end pointers (move the shorter side — can only improve by moving the bottleneck)
• "Three sum" → fix one element, two-pointer on the sorted remainder
• "Palindrome check" → opposite-end pointers moving inward

REDUCTION THINKING
• 3Sum reduces to: for each num, solve Two Sum on the remaining sorted array with two pointers
• "Trapping water" reduces to: at each position, water = min(maxLeft, maxRight) - height. Two pointers track running maxLeft/maxRight without precomputing arrays
• "Move zeroes" reduces to: partition problem — slow pointer marks boundary of non-zero region

INVARIANT AWARENESS
Opposite-end pattern: everything outside [left, right] has been processed and excluded
  • If sum < target: left must advance (all pairs with current left and smaller right are even smaller)
  • If sum > target: right must advance (same logic, reversed)
Slow/fast pattern: everything before slow is "finalized" output; fast scans ahead for the next valid element
  • Invariant: arr[0..slow-1] contains the correct result so far

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────┬────────┬─────────────────────────┐
│ Approach                │ Time     │ Space  │ Notes                   │
├─────────────────────────┼──────────┼────────┼─────────────────────────┤
│ Brute force (all pairs) │ O(n²)    │ O(1)   │ Works unsorted          │
│ Hash map (Two Sum)      │ O(n)     │ O(n)   │ Works unsorted          │
│ Two pointers            │ O(n)     │ O(1)   │ Requires sorted input   │
└─────────────────────────┴──────────┴────────┴─────────────────────────┘
Two pointers beat hash map on space when input is sorted. If unsorted and you need indices, hash map wins. If you can afford sorting (don't need original indices), sort + two pointers gives O(1) space.`,

'Sliding Window': `CONSTRAINT-FIRST THINKING
• "Longest/shortest subarray/substring with condition X" + n ≤ 10^5 → need O(n), sliding window is the tool
• Critical prerequisite: the window condition must be MONOTONIC — if expanding breaks it, all further expansions also break it. This is what lets you shrink from the left without missing valid windows
• If values can be negative (e.g., subarray sum), sliding window FAILS — use prefix sum + hash map instead

PATTERN RECOGNITION
Structural signatures that map here:
• "Longest substring without repeating characters" → variable window + shrink when duplicate enters
• "Minimum window containing all of T" → variable window + shrink while valid (track with frequency map)
• "Max sum of subarray size k" → fixed window (add right, subtract left)
• "Anagram / permutation in string" → fixed window + frequency comparison
• "At most K distinct characters" → variable window + shrink when distinct count exceeds K

REDUCTION THINKING
• "Minimum window substring" reduces to: expand right until all chars covered, then shrink left to minimize — same template as every "shortest valid window" problem
• "Longest repeating character replacement" (with K flips) reduces to: window is valid if (window_size - max_freq_char ≤ k) — the non-obvious insight is that max_freq only needs to increase, never decrease, for correctness
• Fixed-window problems reduce to: maintain a running aggregate, add the new right element, subtract the exiting left element

INVARIANT AWARENESS
Variable window: after the inner while/shrink loop, the window [left, right] is always VALID (satisfies the condition)
  • For "longest" problems: record the answer AFTER ensuring validity, result = max(result, right - left + 1)
  • For "shortest" problems: record the answer INSIDE the shrink loop BEFORE shrinking, result = min(result, right - left + 1)
Fixed window: window always has exactly k elements; the aggregate (sum, freq map) reflects exactly those k elements
  • When right ≥ k-1, we have a full window and can record answers

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────┬────────┬───────────────────────────┐
│ Approach                │ Time     │ Space  │ Notes                     │
├─────────────────────────┼──────────┼────────┼───────────────────────────┤
│ Brute force (all subs)  │ O(n²)    │ O(1)   │ Check every subarray      │
│ Sliding window          │ O(n)     │ O(k)   │ Needs monotonic condition │
│ Prefix sum + hash map   │ O(n)     │ O(n)   │ Handles negatives         │
│ Deque-based window      │ O(n)     │ O(k)   │ For window max/min        │
└─────────────────────────┴──────────┴────────┴───────────────────────────┘
Sliding window gives O(n) with minimal space — but ONLY when the condition is monotonic. The moment negatives appear or the condition isn't monotonic, you need a different tool.`,

'Stack': `CONSTRAINT-FIRST THINKING
• "Matching / nesting" (brackets, tags, nested structures) → stack is almost always the answer
• "Next greater/smaller element" for each position + n ≤ 10^5 → monotonic stack gives O(n); brute force O(n²) is too slow
• "Evaluate expression" or "decode nested string" → stack naturally models recursion depth / context layers

PATTERN RECOGNITION
Structural signatures that map here:
• "Valid parentheses / matching pairs" → push open, pop on close, check match
• "Next greater element" → monotonic DECREASING stack (pop when current > top)
• "Next smaller element" → monotonic INCREASING stack (pop when current < top)
• "Largest rectangle in histogram" → monotonic stack to find left/right boundaries
• "Evaluate RPN / infix expression" → operand stack + operator precedence
• "Daily temperatures / stock span" → monotonic stack (how far back/forward to find greater/smaller)

REDUCTION THINKING
• "Largest rectangle in histogram" reduces to: for each bar, find the nearest shorter bar on left and right → width × height. Monotonic stack finds both boundaries in O(n)
• "Maximal rectangle in binary matrix" reduces to: treat each row as a histogram (accumulate heights), then apply histogram solution per row
• "Decode string like 3[a2[c]]" reduces to: stack of (current_string, repeat_count) contexts — same as how a call stack tracks function frames
• "Min stack" reduces to: pair each value with the running minimum — every push/pop maintains the min invariant

INVARIANT AWARENESS
Monotonic decreasing stack: every element in the stack is ≥ the one above it
  • When we pop element X because current > X: current IS the next greater element for X
  • After processing all elements, anything remaining in the stack has no next greater element (-1)
Parentheses stack: at any point, the stack contains all unmatched opening brackets in order
  • A close bracket is valid iff the top of the stack is its matching open bracket

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────┬────────┬────────────────────────┐
│ Approach                │ Time     │ Space  │ Notes                  │
├─────────────────────────┼──────────┼────────┼────────────────────────┤
│ Brute force (scan each) │ O(n²)    │ O(1)   │ For each i, scan right │
│ Monotonic stack         │ O(n)     │ O(n)   │ Each element push/pop  │
│ DP (for some variants)  │ O(n)     │ O(n)   │ E.g., longest valid () │
└─────────────────────────┴──────────┴────────┴────────────────────────┘
Monotonic stack is optimal for "next greater/smaller" — each element enters and leaves the stack exactly once, giving amortized O(1) per element.`,

'Binary Search': `CONSTRAINT-FIRST THINKING
• "Sorted array + find target" → classic binary search, O(log n)
• "Minimum X such that condition(X) is true" → binary search on answer — the key constraint is that condition must be monotonic (once true, stays true for all larger X)
• n ≤ 10^9 but answer is in a bounded range → binary search on answer is the only way (can't iterate all values)
• "Search in rotated sorted array" → binary search still works because at least one half is always sorted

PATTERN RECOGNITION
Structural signatures that map here:
• "Find exact target in sorted array" → classic binary search (lo ≤ hi, return mid)
• "Find first/last position of X" → boundary binary search (lo < hi, converge to boundary)
• "Minimum speed / capacity / days such that feasible" → binary search on answer + greedy feasibility check
• "Koko eating bananas / ship packages / split array" → all binary search on answer problems
• "Find peak element" → binary search (compare mid with mid+1, move toward the ascending side)

REDUCTION THINKING
• "Koko eating bananas" reduces to: binary search on speed [1, max(piles)], feasibility check = can she finish in H hours at this speed? — transform optimization into yes/no decisions
• "Search in rotated sorted array" reduces to: determine which half is sorted (compare nums[lo] with nums[mid]), then check if target is in the sorted half
• "Median of two sorted arrays" reduces to: binary search on the partition position in the shorter array — find the cut where left_max ≤ right_min

INVARIANT AWARENESS
Classic (lo ≤ hi): answer is at index mid when found; lo/hi narrow the search space, and each iteration eliminates at least half
Boundary (lo < hi): the answer is always in [lo, hi] inclusive
  • lo = mid + 1 means: mid is definitely NOT the answer (exclude it)
  • hi = mid means: mid MIGHT be the answer (keep it)
  • Loop ends when lo == hi — that's the answer
CRITICAL BUG SOURCE: if you use lo = mid (not mid+1) with mid = Math.floor((lo+hi)/2), and lo+1==hi, then mid==lo and the loop never terminates. Fix: use mid = Math.ceil((lo+hi)/2) when lo = mid.

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────┬────────┬──────────────────────────┐
│ Approach                │ Time     │ Space  │ Notes                    │
├─────────────────────────┼──────────┼────────┼──────────────────────────┤
│ Linear scan             │ O(n)     │ O(1)   │ Works unsorted           │
│ Binary search           │ O(log n) │ O(1)   │ Requires sorted / monotonic│
│ Binary search on answer │ O(log R · f(n))│ O(1)│ R = answer range, f = check│
│ Interpolation search    │ O(log log n)│ O(1)│ Uniform distribution only│
└─────────────────────────┴──────────┴────────┴──────────────────────────┘
Binary search on answer is incredibly versatile — any time you can frame a problem as "what's the minimum X such that f(X) is true?" and f is monotonic, you can binary search.`,

'Linked List': `CONSTRAINT-FIRST THINKING
• "O(1) extra space" + list manipulation → must modify pointers in-place (reverse, reorder)
• "Find cycle" or "find middle" → Floyd's fast/slow pointers, O(n) time O(1) space
• "Merge K sorted lists" → use a min-heap of size K for O(n log K); merging pairs repeatedly is O(n log K) too but harder to implement
• "LRU Cache with O(1) get/put" → must combine hash map + doubly linked list

PATTERN RECOGNITION
Structural signatures that map here:
• "Reverse a list" → iterative prev/curr/next pointer dance (or recursive: reverse rest, fix pointers)
• "Detect cycle / find cycle start" → fast/slow pointers (Floyd's tortoise and hare)
• "Find middle node" → fast/slow (when fast reaches end, slow is at middle)
• "Merge two sorted lists" → dummy head + compare-and-advance pattern
• "Remove nth from end" → two pointers with n-gap (leader starts n ahead of follower)
• "Reorder list (L0→Ln→L1→Ln-1...)" → find middle + reverse second half + interleave merge

REDUCTION THINKING
• "Reorder list" reduces to three known subproblems chained together: (1) find middle, (2) reverse second half, (3) merge alternating — each is a standard linked list pattern
• "Copy list with random pointer" reduces to: hash map {old_node → new_node}, then wire up .next and .random using the map
• "LRU Cache" reduces to: hash map for O(1) lookup + doubly linked list for O(1) recency reordering — neither alone is sufficient
• "Add two numbers" reduces to: elementary addition with carry, digit by digit — the list structure just replaces array indexing

INVARIANT AWARENESS
Reverse: at every step, \`prev\` points to the already-reversed portion, \`curr\` points to the next node to reverse
  • When curr becomes null, prev is the new head
Fast/slow cycle detection: if there's a cycle, fast and slow MUST meet (fast gains 1 step per iteration)
  • To find cycle start: reset one pointer to head, advance both by 1 — they meet at the cycle entrance
Dummy head pattern: dummy.next always points to the true head — avoids special-casing "insert at head"

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────┬────────┬──────────────────────────┐
│ Approach                │ Time     │ Space  │ Notes                    │
├─────────────────────────┼──────────┼────────┼──────────────────────────┤
│ Copy to array, process  │ O(n)     │ O(n)   │ Simple but wastes space  │
│ In-place pointer manip  │ O(n)     │ O(1)   │ Tricky but optimal       │
│ Recursive               │ O(n)     │ O(n) stack│ Clean code, stack risk │
│ Hash map (copy/LRU)     │ O(n)     │ O(n)   │ Required for random ptrs │
└─────────────────────────┴──────────┴────────┴──────────────────────────┘
For interviews: in-place pointer manipulation shows mastery. For production: copying to an array and processing is less error-prone. Know both and choose deliberately.`,

'Trees': `CONSTRAINT-FIRST THINKING
• "Height / depth / balanced / diameter" → DFS (recursive), O(n) time
• "Level-order / zigzag / right-side view" → BFS with queue, process level by level
• "Validate BST" → DFS with bounds (min, max), O(n) time
• n ≤ 10^4 nodes → even O(n²) might pass, but O(n) DFS is always preferred
• "Serialize / deserialize" → preorder with null markers, O(n)

PATTERN RECOGNITION
Structural signatures that map here:
• "Compute property from leaves up" → post-order DFS (process children first, combine results)
• "Propagate property from root down" → pre-order DFS (pass accumulated value to children)
• "Level-by-level anything" → BFS (queue + level-size loop)
• "Path sum / path between nodes" → DFS with global variable tracking best-so-far
• "Lowest common ancestor" → DFS returning found-left/found-right, answer is where both are found
• "BST operations (search, insert, validate)" → DFS with min/max bounds or in-order property

REDUCTION THINKING
• "Diameter of binary tree" reduces to: for each node, longest_path_through = left_height + right_height. Track global max. The answer is NOT the same as height — it's height-left + height-right at the best node
• "Flatten binary tree to linked list" reduces to: reverse post-order (right, left, root) — each node's right pointer points to the previously visited node
• "Construct tree from preorder + inorder" reduces to: preorder[0] is root, find it in inorder to split left/right subtrees, recurse

INVARIANT AWARENESS
Recursive DFS: at each call, you're solving the subproblem for the subtree rooted at the current node
  • Base case: null node returns the identity value (0 for height, true for isValid, null for LCA)
  • Post-order: left_result and right_result are CORRECT for their subtrees before you combine them
BST validation: every node carries invisible (min, max) bounds inherited from ancestors
  • Left child inherits (min, parent.val), right child inherits (parent.val, max)
  • A node is valid iff min < node.val < max AND both subtrees are valid

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────┬──────────┬──────────────────────────┐
│ Approach                │ Time     │ Space    │ Notes                    │
├─────────────────────────┼──────────┼──────────┼──────────────────────────┤
│ Recursive DFS           │ O(n)     │ O(h) stack│ Clean, natural for trees│
│ Iterative DFS (stack)   │ O(n)     │ O(h)     │ Avoids stack overflow   │
│ BFS (queue)             │ O(n)     │ O(w)     │ w = max width of tree   │
│ Morris traversal        │ O(n)     │ O(1)     │ Modifies tree temporarily│
└─────────────────────────┴──────────┴──────────┴──────────────────────────┘
Recursive DFS is the default — clean and easy to reason about. Switch to iterative when the tree could be very deep (avoid stack overflow). BFS for level-order. Morris for O(1) space in-order traversal (rare in interviews).`,

'Tries': `CONSTRAINT-FIRST THINKING
• "Prefix search / autocomplete / startsWith" → trie is the canonical structure
• Total characters across all words ≤ 10^5 → trie fits in memory and builds in O(total_chars)
• "Find words matching a pattern with wildcards" → trie + DFS (branch at wildcard positions)
• "Word search in a grid using a dictionary" → trie for the dictionary + DFS backtracking on the grid

PATTERN RECOGNITION
Structural signatures that map here:
• "Insert / search / startsWith on a word set" → basic trie with isEnd markers
• "Word search II (find all dictionary words in grid)" → trie prunes the DFS — instead of searching for each word separately, walk the trie and grid simultaneously
• "Longest common prefix" → insert all words, walk trie until a node has >1 child or isEnd
• "Palindrome pairs" → trie of reversed words + check suffixes/prefixes for palindromes

REDUCTION THINKING
• "Word search II" reduces to: build trie of target words, then DFS the grid — at each cell, advance in the trie. If the trie node has no child for the current letter, prune. This reduces O(words × cells × 4^L) to much less by sharing prefix work
• "Replace words (shortest root)" reduces to: build trie of roots, for each word in sentence walk the trie char by char — first isEnd match is the shortest root
• "Design search with wildcards" reduces to: trie + recursive DFS — on '.', branch to all children

INVARIANT AWARENESS
Insert: after inserting word, every prefix of that word has a corresponding path from root
  • The last node has isEnd = true; intermediate nodes have isEnd = false (unless they're also complete words)
Search: at each step, current trie node represents "all words that start with the prefix we've consumed so far"
  • If we reach a null child, the word/prefix doesn't exist
  • If we reach isEnd, the exact word exists

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬───────────┬─────────────────────────┐
│ Approach                │ Time (search)│ Space     │ Notes                   │
├─────────────────────────┼──────────────┼───────────┼─────────────────────────┤
│ Hash set of words       │ O(L)         │ O(total)  │ Exact match only        │
│ Hash set of all prefixes│ O(L)         │ O(total·L)│ Prefix search, wasteful │
│ Trie                    │ O(L)         │ O(total)  │ Prefix + exact + wildcard│
│ Sorted array + binary   │ O(L log n)   │ O(total)  │ Prefix via lower_bound  │
└─────────────────────────┴──────────────┴───────────┴─────────────────────────┘
Trie wins when you need prefix operations, wildcard matching, or shared-prefix efficiency. For simple membership tests, a hash set is simpler and faster.`,

'Heap / Priority Queue': `CONSTRAINT-FIRST THINKING
• "Top K" or "Kth largest/smallest" + n ≤ 10^5 → min-heap of size K gives O(n log K)
• "Merge K sorted lists/arrays" → min-heap of K elements, O(total · log K)
• "Continuously find min/max as data streams in" → heap maintains order dynamically
• "Running median" → two heaps (max-heap for left half, min-heap for right half)

PATTERN RECOGNITION
Structural signatures that map here:
• "Top K / Kth element" → min-heap of size K (for largest) or max-heap of size K (for smallest)
• "Merge K sorted streams" → min-heap holding one element from each stream, pop smallest, push next from that stream
• "Running median" → two-heap approach (balance sizes so median is at the tops)
• "Task scheduler / reorganize string" → max-heap (always pick highest-frequency item) + cooldown queue
• "Shortest path weighted graph" → min-heap as the priority queue in Dijkstra's

REDUCTION THINKING
• "Find Kth largest" reduces to: maintain a min-heap of size K — anything smaller than the heap top can't be top-K, so skip it. The heap top IS the Kth largest. Alternative: QuickSelect for O(n) average but O(n²) worst
• "Task scheduler" reduces to: greedily pick the most frequent task available (max-heap), put it on cooldown, re-add when cooldown expires — the heap always gives you the optimal next choice
• "Merge K sorted lists" reduces to: generalized merge of 2 sorted lists — instead of comparing 2 heads, compare K heads using a heap

INVARIANT AWARENESS
Min-heap of size K (for top-K largest): the heap contains the K largest elements seen so far
  • Heap top is the smallest of the K largest = the Kth largest overall
  • If new element > heap top, replace top (pop + push) — otherwise discard
Two-heap median: maxHeap holds the smaller half, minHeap holds the larger half
  • maxHeap.size == minHeap.size OR maxHeap.size == minHeap.size + 1
  • Median = maxHeap.top (odd count) or average of both tops (even count)
  • After every insert, rebalance to maintain the size invariant

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Sort then take K        │ O(n log n)   │ O(n)   │ Simple, but sorts all    │
│ Min-heap of size K      │ O(n log K)   │ O(K)   │ Best for streaming       │
│ QuickSelect             │ O(n) avg     │ O(1)   │ O(n²) worst, not stable  │
│ Bucket sort             │ O(n)         │ O(n)   │ Only for bounded values  │
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
Heap is the default for Top-K — good worst case, works with streaming data. QuickSelect is theoretically faster but risky in interviews due to worst case.`,

'Backtracking': `CONSTRAINT-FIRST THINKING
• n ≤ 20 → 2^n ≈ 10^6, bitmask or backtracking is fine
• n ≤ 10-12 → n! is manageable for permutation problems
• "Generate ALL valid configurations" → backtracking is the only option (must enumerate)
• "Find ANY valid configuration" → backtracking with early return
• Pruning is critical: without it, backtracking degenerates to brute-force exponential search

PATTERN RECOGNITION
Structural signatures that map here:
• "All subsets / power set" → backtrack with include/exclude choice at each element, record at every node
• "All permutations" → backtrack with used-set, try each unused element at each position
• "Combinations that sum to target" → backtrack with start-index + remaining target, prune when remaining < 0
• "With duplicates" → sort + skip if nums[i] === nums[i-1] at the same recursion level
• "N-Queens / Sudoku" → backtrack + constraint sets (columns, diagonals)
• "Word search on grid" → DFS backtrack (mark visited, explore 4 directions, unmark)

REDUCTION THINKING
• All backtracking problems reduce to: build a decision tree, DFS it, prune invalid branches
• "Subsets" = binary tree (include/exclude each element)
• "Permutations" = n-ary tree (pick any unused element at each level)
• "Combination sum" = n-ary tree with pruning (skip elements that exceed remaining target)
• The ONLY difference between subsets, permutations, and combinations is the branching rule and when you record results

INVARIANT AWARENESS
At each recursive call:
  • \`path\` (current partial solution) is a valid prefix of a complete solution
  • The "remaining choices" are constrained to avoid revisiting (start index for combinations, used-set for permutations)
  • UNDO after recursion: path.pop() / unmark visited — this is what makes it "backtracking" not just DFS
For duplicate handling: sorting ensures duplicates are adjacent → skip nums[i] === nums[i-1] when i > start
  • This ensures each unique element is chosen at most once per tree level

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Backtracking            │ O(2^n) or O(n!)│ O(n) │ Flexible, prunable       │
│ Bitmask enumeration     │ O(2^n · n)   │ O(n)   │ Simpler for subsets      │
│ Iterative generation    │ O(2^n)       │ O(2^n) │ Build all subsets layer-by-layer│
│ DP (count only)         │ varies       │ varies │ If you only need count, not list│
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
Backtracking is optimal when you need to LIST all solutions. If you only need to COUNT solutions, DP is usually faster. The key skill is knowing when to prune — good pruning can turn exponential into practical.`,

'Graphs': `CONSTRAINT-FIRST THINKING
• "Shortest path unweighted" → BFS, O(V + E)
• "Shortest path weighted (non-negative)" → Dijkstra, O(E log V)
• "Shortest path with negative weights" → Bellman-Ford, O(V · E)
• "Connected components" → BFS/DFS or Union-Find, O(V + E)
• "Grid problems (islands, rotting oranges)" → treat grid as implicit graph, BFS/DFS
• V, E ≤ 10^5 → O(V + E) or O(E log V) algorithms needed

PATTERN RECOGNITION
Structural signatures that map here:
• "Connected components / islands" → BFS/DFS from each unvisited node, or Union-Find
• "Shortest path" → BFS (unweighted) or Dijkstra (weighted)
• "Spread from multiple sources" → multi-source BFS (enqueue all sources at once as "level 0")
• "Dependency ordering" → topological sort (Kahn's BFS or DFS with post-order)
• "Cycle detection in directed graph" → topo sort (incomplete = cycle) or 3-state DFS (white/gray/black)
• "Clone graph" → BFS/DFS + hash map {old → new}

REDUCTION THINKING
• "Rotting oranges" reduces to multi-source BFS — all rotten oranges are sources at time 0, BFS gives the time each cell rots
• "Word ladder" reduces to: BFS on an implicit graph where nodes are words and edges connect words differing by one letter
• "Pacific Atlantic water flow" reduces to: reverse the problem — BFS/DFS inward from each ocean, find cells reachable from both
• "Alien dictionary" reduces to: build a directed graph of char precedences from word order, then topological sort

INVARIANT AWARENESS
BFS: when a node is dequeued, its distance is FINAL and minimal (for unweighted graphs)
  • Visited set ensures each node is processed exactly once
Dijkstra: when a node is popped from the min-heap, its distance is FINAL
  • Key difference from BFS: we might see a node multiple times in the heap, but only process the first (smallest) pop
DFS visited states (for cycle detection):
  • White (unvisited) → Gray (in current DFS path) → Black (fully processed)
  • Finding a gray node means a back edge = cycle

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ BFS                     │ O(V + E)     │ O(V)   │ Shortest path unweighted │
│ DFS                     │ O(V + E)     │ O(V)   │ Components, cycle detect │
│ Dijkstra                │ O(E log V)   │ O(V)   │ Weighted, non-negative   │
│ Bellman-Ford            │ O(V · E)     │ O(V)   │ Handles negative weights │
│ Union-Find              │ O(α(n))      │ O(V)   │ Dynamic connectivity     │
│ Floyd-Warshall          │ O(V³)        │ O(V²)  │ All-pairs shortest path  │
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
BFS/DFS for traversal, Dijkstra for weighted shortest path, Union-Find for dynamic connectivity. Choose based on the question: what KIND of graph query is being asked?`,

'Dynamic Programming': `CONSTRAINT-FIRST THINKING
• "Optimal value (min cost, max profit, number of ways)" + overlapping subproblems → DP
• n ≤ 10^3 → O(n²) 2D DP is fine; n ≤ 10^4 → need O(n) or O(n log n)
• "Can you break this into smaller subproblems where the answer depends only on STATE, not on HOW you got there?" → DP applies
• Two strings of length m, n ≤ 10^3 → O(m·n) 2D DP is fine
• If the problem asks to LIST all solutions (not count/optimize), DP alone isn't enough — need backtracking

PATTERN RECOGNITION
Structural signatures that map here:
• "Climbing stairs / Fibonacci" → 1D DP: dp[i] depends on dp[i-1], dp[i-2]
• "House robber (no adjacent)" → 1D DP: dp[i] = max(dp[i-1], dp[i-2] + nums[i])
• "Coin change / unbounded knapsack" → 1D DP with forward inner loop (items reusable)
• "Subset sum / 0-1 knapsack" → 1D DP with BACKWARD inner loop (each item used once)
• "LCS / edit distance" → 2D DP on two strings: dp[i][j] from dp[i-1][j-1], dp[i-1][j], dp[i][j-1]
• "Longest increasing subsequence" → O(n²) DP or O(n log n) with patience sorting (binary search on tails)
• "Buy/sell stock with cooldown" → state machine DP (hold / sold / rest)

REDUCTION THINKING
• "Can't figure out the recurrence?" → write brute-force recursion first, then memoize — the recursion IS the recurrence
• "Edit distance" reduces to: at each position (i, j), three choices — insert (i, j-1), delete (i-1, j), replace (i-1, j-1) — take min + cost
• "Coin change" reduces to: for each amount a, try every coin c — dp[a] = min(dp[a], dp[a-c] + 1)
• "Longest increasing subsequence" reduces to patience sorting — maintain an array of smallest tail elements, binary search for insertion point

INVARIANT AWARENESS
Bottom-up 1D: dp[i] = optimal answer for the first i elements / amount i / etc.
  • Base case: dp[0] = identity (0 for min-cost, 1 for counting ways, etc.)
  • Transition: dp[i] depends only on previously computed dp values — no future dependency
Bottom-up 2D: dp[i][j] = optimal answer for s1[0..i-1] and s2[0..j-1]
  • Fill order: row by row, left to right — guarantees dependencies are computed first
Space optimization: if dp[i] depends only on dp[i-1], use two variables (prev, curr) instead of an array
  • For 2D, if dp[i][j] depends only on row i and i-1, use two 1D arrays

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Brute-force recursion   │ exponential  │ O(n)   │ Easy to write, too slow  │
│ Top-down memoization    │ O(states)    │ O(states)│ Only visits reachable states│
│ Bottom-up DP            │ O(states)    │ O(states)│ No recursion overhead    │
│ Bottom-up space-optimized│ O(states)   │ O(n) or O(1)│ Rolling array / vars │
│ Greedy (when applicable)│ O(n) or O(n lgn)│ O(1) │ Only if greedy choice is provably optimal│
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
Start with top-down memo (easiest to derive from recursion). Convert to bottom-up for constant-factor speed. Optimize space last. If greedy works, it's always simpler — but you must PROVE the greedy choice property.`,

'Greedy': `CONSTRAINT-FIRST THINKING
• "Can you make a locally optimal choice that leads to globally optimal?" → greedy applies
• Greedy requires the GREEDY CHOICE PROPERTY: making the best local choice never prevents reaching the global optimum
• n ≤ 10^5 and need O(n) or O(n log n) → greedy often gives O(n) after sorting
• If you can't prove greedy works → use DP instead (greedy fails on many problems that look greedy)

PATTERN RECOGNITION
Structural signatures that map here:
• "Jump game (can you reach the end?)" → greedy: track farthest reachable position
• "Gas station / circular route" → greedy: track cumulative deficit, reset at minimum
• "Assign tasks / intervals / resources" → sort by some criterion, greedily assign
• "Maximum events / activities" → sort by END time, pick greedily (earliest deadline first)
• "Partition labels" → greedy: track last occurrence of each char, extend current partition

REDUCTION THINKING
• "Jump game" reduces to: at each position, extend the farthest-reachable. If current index > farthest, stuck. This is a simplification of BFS on an implicit graph
• "Gas station" reduces to: if total gas ≥ total cost, a valid start exists. The start point is right after the position with the deepest cumulative deficit
• "Task assignment" problems often reduce to: sort by deadline/duration/penalty, then sweep — the sorting criterion IS the greedy strategy

INVARIANT AWARENESS
Jump game: at each step, \`farthest\` is the rightmost index reachable from any index ≤ current
  • If i > farthest at any point, we can't proceed → return false
  • If farthest ≥ n-1 at any point → return true
Interval scheduling: after sorting by end time, the current \`end\` marks the latest time committed
  • A new event is taken iff its start ≥ current end — greedy always picks the one that frees the timeline earliest

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Greedy                  │ O(n) or O(n lgn)│ O(1) │ Fastest, but must prove  │
│ DP                      │ O(n²) or more│ O(n)   │ Always correct           │
│ Brute force             │ exponential  │ varies │ Enumerate all choices    │
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
The danger with greedy: it's easy to THINK it works when it doesn't. Classic trap: "coin change with arbitrary denominations" — greedy fails (use DP). Always verify the greedy choice property before committing.`,

'Intervals': `CONSTRAINT-FIRST THINKING
• "Merge / intersect intervals" → sort by start, O(n log n)
• "Minimum rooms / maximum overlap at any point" → sweep line with sorted starts and ends, O(n log n)
• "Non-overlapping intervals (max events)" → sort by END time, greedy pick
• n ≤ 10^5 intervals → O(n log n) after sorting; O(n²) pairwise comparison is too slow

PATTERN RECOGNITION
Structural signatures that map here:
• "Merge overlapping intervals" → sort by start, extend end while overlap exists
• "Insert interval" → find insertion point, merge with neighbors
• "Remove minimum to make non-overlapping" → sort by end, count overlaps (= total - max non-overlapping)
• "Minimum meeting rooms" → sweep line: +1 at each start, -1 at each end, track max
• "Employee free time" → merge all busy intervals, gaps are free time

REDUCTION THINKING
• "Minimum meeting rooms" reduces to: what's the maximum number of intervals overlapping at any point? Sort all start/end times, sweep with a counter — this is the sweep line technique
• "Non-overlapping intervals to remove" reduces to: find maximum non-overlapping set (sort by end time, greedy), removals = total - max_kept
• "Insert interval" reduces to: three phases — copy intervals that end before new starts, merge overlapping ones, copy intervals that start after new ends

INVARIANT AWARENESS
Merge intervals: after sorting by start, for each interval:
  • If it overlaps with the last merged interval (start ≤ last.end), extend: last.end = max(last.end, curr.end)
  • Otherwise, it's a new non-overlapping interval — push it
  • Invariant: the merged list is always sorted and non-overlapping
Sweep line: events sorted by time, counter = currently active intervals
  • At each timestamp, all starts at this time are processed before ends (tie-breaking matters for some problems)

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Sort + merge            │ O(n log n)   │ O(n)   │ Standard merge intervals │
│ Sweep line              │ O(n log n)   │ O(n)   │ For overlap/room count   │
│ Min-heap (for rooms)    │ O(n log n)   │ O(n)   │ Track earliest end time  │
│ Brute-force pairwise    │ O(n²)        │ O(1)   │ Too slow for n > 10^4   │
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
Sort-based solutions dominate interval problems. The key decision is what to sort by: start time (for merging) vs end time (for scheduling/greedy).`,

'Math & Geometry': `CONSTRAINT-FIRST THINKING
• "Rotate matrix 90°" → transpose + reverse rows (in-place O(n²), no extra matrix)
• "Spiral traversal" → 4 boundaries (top, bottom, left, right), shrink after each pass
• "GCD / LCM / modular arithmetic" → Euclidean algorithm, O(log(min(a,b)))
• "Is prime?" → check up to √n, O(√n)
• Large numbers (10^9) → watch for overflow; use modular arithmetic (mod 10^9 + 7)

PATTERN RECOGNITION
Structural signatures that map here:
• "Rotate matrix" → transpose + reverse (90° CW) or reverse + transpose (90° CCW)
• "Spiral order" → simulate with 4 shrinking boundaries
• "Set matrix zeroes" → use first row/column as markers to avoid O(mn) space
• "Power of 2 / power of 3" → bit tricks (n & (n-1) === 0) or logarithmic check
• "Happy number" → cycle detection (Floyd's on the digit-sum sequence)
• "Pow(x, n)" → fast exponentiation (square and multiply), O(log n)

REDUCTION THINKING
• "Happy number" reduces to cycle detection — the digit-sum sequence either reaches 1 or enters a cycle. Use Floyd's fast/slow pointer (same technique as linked list cycle detection)
• "Count primes (Sieve of Eratosthenes)" reduces to: mark all multiples of each prime — the sieve IS a form of DP (precomputing results for all values)
• "Rotate image" reduces to: two simple operations composed — transpose swaps (i,j)↔(j,i), then reverse gives the 90° rotation

INVARIANT AWARENESS
Spiral traversal: four boundaries define the unvisited rectangle
  • After going right: top++. After going down: right--. After going left: bottom--. After going up: left++
  • Stop when top > bottom or left > right
Matrix rotation (transpose + reverse): after transpose, element at (i,j) moved to (j,i). After reversing each row, it's at (j, n-1-i) — which is the 90° CW position
Fast exponentiation: x^n = (x^(n/2))² if n even, x · (x^((n-1)/2))² if n odd
  • Invariant: result · base^exp = x^n at every step

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ New matrix (rotate)     │ O(n²)        │ O(n²)  │ Simple but wastes space  │
│ Transpose + reverse     │ O(n²)        │ O(1)   │ In-place rotation        │
│ Layer-by-layer rotation │ O(n²)        │ O(1)   │ Direct but tricky indices│
│ Trial division (prime)  │ O(√n)        │ O(1)   │ Single number            │
│ Sieve of Eratosthenes   │ O(n log log n)│ O(n)  │ All primes up to n      │
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
Math problems reward knowing the trick. Unlike other categories where you can derive the approach, math often requires specific knowledge (Euclidean algorithm, modular inverse, sieve).`,

'Bit Manipulation': `CONSTRAINT-FIRST THINKING
• "Find unique element in array of pairs" → XOR all elements (pairs cancel to 0)
• "Count set bits / power of 2" → n & (n-1) trick
• n ≤ 20-25 → bitmask enumeration of all subsets (2^n states) is viable
• "O(1) space, no extra data structures" + integer manipulation → bit tricks likely

PATTERN RECOGNITION
Structural signatures that map here:
• "Single number (all others appear twice)" → XOR all elements — a ⊕ a = 0, a ⊕ 0 = a
• "Single number III (two unique)" → XOR all to get a ⊕ b, split by any differing bit, XOR each group
• "Count set bits (Hamming weight)" → while (n) { count++; n &= n-1; } — removes lowest set bit each iteration
• "Power of 2" → n > 0 && (n & (n-1)) === 0
• "Subset enumeration via bitmask" → for mask 0 to 2^n-1, bit i set means element i is included
• "Reverse bits / swap bits" → shift and mask operations

REDUCTION THINKING
• "Missing number in [0, n]" reduces to: XOR all indices AND all values — pairs cancel, leaving the missing one. Alternative: sum formula n(n+1)/2 - sum(nums)
• "Subsets via bitmask" reduces to: each integer from 0 to 2^n-1 IS a subset — bit i represents include/exclude. This is equivalent to the backtracking approach but iterative
• "Counting bits for all numbers 0 to n" reduces to: dp[i] = dp[i >> 1] + (i & 1) — number of bits in i equals bits in i/2 plus the last bit

INVARIANT AWARENESS
XOR properties (these are the invariants that make XOR problems work):
  • a ⊕ a = 0 (self-cancellation)
  • a ⊕ 0 = a (identity)
  • Commutative and associative — order doesn't matter
n & (n-1): removes the lowest set bit of n
  • Invariant: after k iterations, the k lowest set bits have been removed
  • Loop terminates when n = 0 (no bits left), count = number of set bits
Bitmask DP: state is a bitmask representing "which elements have been used/visited"
  • dp[mask] = optimal answer when the elements in mask have been processed

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Hash set (find unique)  │ O(n)         │ O(n)   │ General but uses space   │
│ XOR (find unique)       │ O(n)         │ O(1)   │ Only for pair-cancellation│
│ Brute-force subsets     │ O(2^n · n)   │ O(n)   │ Backtracking             │
│ Bitmask subsets         │ O(2^n · n)   │ O(n)   │ Iterative, easier to code│
│ Bitmask DP              │ O(2^n · n)   │ O(2^n) │ For optimization over subsets│
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
Bit manipulation gives O(1) space for specific problems (XOR, counting bits). Bitmask DP is powerful for small n (≤ 20) optimization problems. These are specialized tools — use them when the problem structure fits exactly.`,

'Union Find': `CONSTRAINT-FIRST THINKING
• "Dynamic connectivity" — edges added over time, need to query "are X and Y connected?" → Union-Find
• "Group / cluster elements by equivalence" → Union-Find with path compression + union by rank gives near O(1) per operation
• n ≤ 10^5 with up to 10^5 union/find operations → amortized O(α(n)) per operation with optimizations
• "Redundant connection (find the edge that creates a cycle)" → Union-Find: the edge whose endpoints are already connected

PATTERN RECOGNITION
Structural signatures that map here:
• "Number of connected components" → initialize n components, union on each edge, count remaining roots
• "Redundant connection" → process edges one by one; the first edge where find(u) === find(v) is the answer
• "Accounts merge" → emails are nodes, union emails belonging to the same account
• "Longest consecutive sequence" → union adjacent numbers (i with i+1 if both exist)
• "Minimum cost to connect all points" → Kruskal's MST uses Union-Find to check if edge creates cycle

REDUCTION THINKING
• "Number of islands" reduces to Union-Find: union adjacent land cells. But BFS/DFS is simpler for static grids — Union-Find shines when the grid is built incrementally
• "Accounts merge" reduces to: build equivalence classes of emails (union all emails in the same account), then group by root
• Kruskal's MST reduces to: sort edges by weight, greedily add edge if it connects two different components (check with find)

INVARIANT AWARENESS
After any sequence of union/find operations:
  • find(x) returns the root of x's component — all nodes in the same component have the same root
  • Path compression: after find(x), all nodes on the path point directly to the root — future finds are O(1)
  • Union by rank: the shorter tree is attached under the taller one — keeps tree height O(log n) worst case
  • Combined: amortized O(α(n)) per operation, where α is the inverse Ackermann function (practically constant)

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time (per op)│ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ BFS/DFS per query       │ O(V + E)     │ O(V)   │ Recomputes each time     │
│ Union-Find (basic)      │ O(log n)     │ O(n)   │ Without optimizations    │
│ Union-Find (optimized)  │ O(α(n)) ≈ O(1)│ O(n) │ Path compression + rank  │
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
Use BFS/DFS for one-time component discovery on static graphs. Use Union-Find when connectivity is queried repeatedly or the graph is built incrementally.`,

'Monotonic Queue': `CONSTRAINT-FIRST THINKING
• "Sliding window maximum/minimum" + n ≤ 10^5 → need O(n) total, not O(nk) brute force → monotonic deque
• "Maximum in every window of size k" → deque maintains candidates in decreasing order, O(n) amortized
• Each element enters and leaves the deque at most once → amortized O(1) per element

PATTERN RECOGNITION
Structural signatures that map here:
• "Sliding window maximum" → monotonic DECREASING deque (front = max of current window)
• "Sliding window minimum" → monotonic INCREASING deque (front = min of current window)
• "Shortest subarray with sum ≥ K (with negatives)" → monotonic deque on prefix sums
• "Jump game VI" → DP + sliding window max = monotonic deque optimization

REDUCTION THINKING
• "Sliding window max" reduces to: maintain a deque of INDICES in decreasing order of their values. For each new element, pop smaller elements from the back (they're useless now), then push. Front of deque = max
• "Jump game VI" reduces to: dp[i] = nums[i] + max(dp[i-k..i-1]). The "max of last k dp values" is a sliding window max → use monotonic deque to optimize from O(nk) to O(n)
• Many DP optimizations reduce to: "dp transition involves max/min over a sliding range" → monotonic deque

INVARIANT AWARENESS
Decreasing deque (for window max): elements in the deque are in strictly decreasing order of value
  • Front = index of the maximum value in the current window
  • When adding index i: pop all indices from the back whose values ≤ nums[i] (they'll never be the max while i is in the window)
  • When the window slides past index j: if deque front === j, pop from front
  • At every step, deque.front is the max of the current window

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Brute force per window  │ O(nk)        │ O(1)   │ Too slow for large n, k  │
│ Heap (max per window)   │ O(n log n)   │ O(n)   │ Lazy deletion needed     │
│ Monotonic deque         │ O(n)         │ O(k)   │ Optimal                  │
│ Segment tree / sparse   │ O(n log n)   │ O(n)   │ Overkill for this problem│
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
Monotonic deque is the gold standard for sliding window min/max. A heap works but is O(n log n) due to lazy deletion. Segment tree is more general but overkill.`,

'Divide & Conquer': `CONSTRAINT-FIRST THINKING
• "Merge sort, quick sort" → classic divide & conquer, O(n log n)
• "Count inversions / count smaller after self" → modified merge sort, O(n log n)
• "Closest pair of points" → divide & conquer on sorted points, O(n log n)
• When a problem has self-similar substructure at different scales → think divide & conquer

PATTERN RECOGNITION
Structural signatures that map here:
• "Sort an array" → merge sort (stable, guaranteed O(n log n)) or quick sort (in-place, O(n log n) average)
• "Count inversions" → merge sort but count cross-inversions during the merge step
• "Majority element" → divide into halves, majority of whole must be majority of at least one half
• "Maximum subarray" → divide at center, solve left/right/crossing (Kadane's is simpler though)
• "Kth largest element" → quickselect (partition-based), O(n) average

REDUCTION THINKING
• "Count inversions" reduces to merge sort — an inversion (i < j, nums[i] > nums[j]) is counted exactly when we merge and pick from the right subarray before the left
• "Kth largest" reduces to quickselect — partition around a pivot, if pivot position = k you're done, otherwise recurse into one half
• Many tree problems are naturally divide & conquer — solve for left subtree, solve for right subtree, combine at root

INVARIANT AWARENESS
Merge sort: after merging, the subarray is sorted and all inversions crossing the midpoint have been counted
Quickselect: after partitioning around pivot at position p:
  • Everything at indices < p is ≤ pivot
  • Everything at indices > p is ≥ pivot
  • If p === k, pivot is the answer. If k < p, recurse left. If k > p, recurse right.
Master theorem governs the time: T(n) = aT(n/b) + O(n^d)
  • Merge sort: a=2, b=2, d=1 → O(n log n)

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Merge sort              │ O(n log n)   │ O(n)   │ Stable, predictable      │
│ Quick sort              │ O(n log n) avg│ O(log n)│ In-place, O(n²) worst  │
│ Quickselect (Kth)       │ O(n) average │ O(1)   │ O(n²) worst case        │
│ Heap (Kth)              │ O(n log k)   │ O(k)   │ Predictable, streaming   │
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
Divide & conquer gives O(n log n) for problems where the "combine" step is linear. If you can solve the combine step in O(1) and only recurse on ONE half (like quickselect), you get O(n).`,

'Segment Tree': `CONSTRAINT-FIRST THINKING
• "Range query (sum/min/max) + point updates" → segment tree, O(log n) per operation
• "Range query + RANGE updates" → segment tree with lazy propagation
• n ≤ 10^5 with up to 10^5 queries → O(n log n) total is fine
• Static range queries (no updates) → prefix sum or sparse table is simpler
• Segment tree covers ALL use cases of Binary Indexed Tree, plus more (range min/max, lazy propagation)

PATTERN RECOGNITION
Structural signatures that map here:
• "Range sum + update value at index" → basic segment tree (or BIT for simpler code)
• "Range min/max query + point update" → segment tree (BIT can't do this)
• "Range sum + range add/set" → segment tree with lazy propagation
• "Count of elements in range satisfying condition" → segment tree with custom merge
• "Interval scheduling with dynamic insert/remove" → segment tree on timeline

REDUCTION THINKING
• A segment tree reduces the problem of "aggregate over any range" to: precompute aggregates for O(n) intervals of power-of-2 lengths, then answer any query by combining O(log n) of these
• "Range sum + range add" reduces to: lazy propagation — store pending additions at internal nodes, push them down only when children are accessed
• Many "count inversions" / "count smaller" problems reduce to: BIT or segment tree over a value coordinate

INVARIANT AWARENESS
Each node covers a contiguous range [l, r] and stores the aggregate (sum/min/max) for that range
  • Leaf nodes cover single elements
  • Internal node = merge(left_child, right_child)
  • After update(i, val): all O(log n) ancestor nodes of leaf i are recalculated
  • Query(l, r): decompose [l, r] into O(log n) node ranges, merge their values
Lazy propagation: each node may have a "pending" value that hasn't been pushed to children
  • Before accessing children, push the pending value down (pushDown)
  • This ensures reads always reflect all accumulated updates

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Query / Update│ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Prefix sum (static)     │ O(1) / O(n)  │ O(n)   │ No updates, or rebuild   │
│ BIT (Fenwick tree)      │ O(log n)     │ O(n)   │ Sum only, simpler code   │
│ Segment tree            │ O(log n)     │ O(n)   │ Sum, min, max, any merge │
│ Seg tree + lazy prop    │ O(log n)     │ O(n)   │ Range updates too        │
│ Sparse table (static)   │ O(1) query   │ O(n lgn)│ Min/max only, no updates│
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
Use prefix sum for static range sums. BIT for point updates + range sums (simpler to code). Segment tree for everything else (min/max queries, range updates, custom aggregates).`,

'String Algorithms': `CONSTRAINT-FIRST THINKING
• "Find pattern in text" → KMP or Rabin-Karp, O(n + m)
• "Longest palindromic substring" → Manacher's O(n), or expand-around-center O(n²)
• "All suffixes" or "longest repeated substring" → suffix array or trie-based approach
• String length ≤ 10^5 → O(n²) might be tight; O(n log n) or O(n) preferred

PATTERN RECOGNITION
Structural signatures that map here:
• "Pattern matching / find substring" → KMP (failure function) or Rabin-Karp (rolling hash)
• "Longest palindromic substring" → expand around each center (O(n²)) or Manacher's (O(n))
• "Repeated substring pattern" → KMP failure function: if len % (len - fail[len-1]) === 0, it repeats
• "Longest common substring" → suffix array + LCP array, or DP
• "String hashing for comparison" → Rabin-Karp rolling hash for O(1) substring comparison

REDUCTION THINKING
• KMP reduces to: precompute a failure function (longest proper prefix that is also a suffix), then use it to avoid re-scanning matched characters
• "Longest palindromic substring" reduces to: for each center (2n-1 centers including between-character positions), expand outward while characters match
• "Repeated substring" reduces to: check if the string is a rotation of itself — s + s contains s as a substring at a non-trivial position (KMP on s within s+s)

INVARIANT AWARENESS
KMP failure function: fail[i] = length of longest proper prefix of pattern[0..i] that is also a suffix
  • During search: when a mismatch occurs at pattern[j], jump to pattern[fail[j-1]] — no text characters are re-examined
  • This gives O(n + m) guaranteed — no backtracking in the text
Expand-around-center: at each expansion step, all characters within the current radius form a palindrome
  • Expand while s[left] === s[right], tracking the longest found

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Brute force matching    │ O(n · m)     │ O(1)   │ Simple, often sufficient │
│ KMP                     │ O(n + m)     │ O(m)   │ Guaranteed linear        │
│ Rabin-Karp              │ O(n + m) avg │ O(1)   │ Hash collisions possible │
│ Expand-around-center    │ O(n²)        │ O(1)   │ Palindromes, simple      │
│ Manacher's              │ O(n)         │ O(n)   │ All palindromes, complex │
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
For interviews: expand-around-center is usually sufficient for palindrome problems. KMP is worth knowing for pattern matching. Rabin-Karp is useful when you need to compare many substrings (rolling hash).`,

'Minimum Spanning Tree': `CONSTRAINT-FIRST THINKING
• "Minimum cost to connect all nodes" → MST (Kruskal's or Prim's)
• E edges → Kruskal's O(E log E) with sorting + Union-Find; Prim's O(E log V) with min-heap
• Dense graph (E ≈ V²) → Prim's with adjacency matrix O(V²) can be better
• Sparse graph → Kruskal's is simpler and efficient

PATTERN RECOGNITION
Structural signatures that map here:
• "Connect all cities with minimum total cost" → MST
• "Min cost to connect all points" → complete graph, MST on all pairwise distances
• "Critical/pseudo-critical edges in MST" → try removing each edge / forcing each edge, compare MST costs
• "Minimum cost to make graph connected" → MST on components (need at least n-1 edges)

REDUCTION THINKING
• Kruskal's reduces to: sort all edges by weight, greedily add the cheapest edge that doesn't create a cycle (Union-Find checks this)
• Prim's reduces to: start from any node, always extend the tree by the cheapest edge to an unvisited node (min-heap of frontier edges)
• "Min cost to connect points" reduces to: generate all O(n²) edges, then apply Kruskal's

INVARIANT AWARENESS
Kruskal's: edges are processed in weight order; the Union-Find maintains forest components
  • Adding edge (u,v): if find(u) ≠ find(v), edge connects two components (safe to add). Otherwise, skip (would create cycle)
  • After n-1 edges added, the MST is complete
Prim's: the "tree so far" is always a valid subtree of the MST (cut property guarantee)
  • The cheapest edge crossing the cut between tree and non-tree nodes is always safe to add

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Kruskal's (sort + UF)   │ O(E log E)   │ O(V)   │ Sparse graphs, simple   │
│ Prim's (heap)           │ O(E log V)   │ O(V)   │ Dense graphs             │
│ Prim's (matrix)         │ O(V²)        │ O(V)   │ Dense, no heap needed    │
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
Kruskal's is the go-to for most interview problems — easier to implement with Union-Find and works well for sparse graphs.`,

'Monotonic Stack': `CONSTRAINT-FIRST THINKING
• "Next greater / next smaller element for each position" + n ≤ 10^5 → monotonic stack, O(n)
• "Largest rectangle in histogram" → monotonic stack to find left/right boundaries, O(n)
• Brute force for "next greater" is O(n²) — monotonic stack is the standard O(n) optimization
• Each element is pushed and popped at most once → O(n) amortized

PATTERN RECOGNITION
Structural signatures that map here:
• "Next greater element" → decreasing stack (pop when current > top)
• "Next smaller element" → increasing stack (pop when current < top)
• "Previous greater / previous smaller" → same but scan from left to right (or right to left)
• "Largest rectangle in histogram" → increasing stack to find boundaries
• "Stock span / daily temperatures" → decreasing stack (count days since last greater)
• "Maximal rectangle in matrix" → histogram per row + monotonic stack

REDUCTION THINKING
• "Daily temperatures" reduces to: for each day, find the next warmer day → next greater element problem → decreasing monotonic stack
• "Largest rectangle in histogram" reduces to: for each bar, find width by locating the nearest shorter bar on each side. Increasing stack gives both boundaries as you push/pop
• "Maximal rectangle in binary matrix" reduces to: treat each row as ground level, compute histogram heights per row, then apply histogram rectangle solution to each row
• "Trapping rain water" can be solved with monotonic stack (alternative to two-pointer): decreasing stack, when we pop, the trapped water is bounded by the new top and current element

INVARIANT AWARENESS
Decreasing stack (next greater element): stack holds indices whose "next greater" hasn't been found yet, in decreasing order of value
  • When current element > stack top: current IS the next greater for top → pop and record answer
  • After iterating all elements: remaining stack elements have no next greater (answer = -1)
  • Each element enters the stack once and leaves once → O(n) total
Increasing stack (histogram rectangles): stack holds indices in increasing order of height
  • When current height < stack top: the popped bar's rectangle extends from the new stack top to current position
  • Width = current_index - stack_top_after_pop - 1

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Brute force (per elem)  │ O(n²)        │ O(1)   │ Scan right for each      │
│ Monotonic stack         │ O(n)         │ O(n)   │ Optimal amortized        │
│ DP (some variants)      │ O(n)         │ O(n)   │ E.g., stock span via DP  │
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
Monotonic stack is THE pattern for "next greater/smaller." The key insight: elements are processed in the order they appear, but answers are recorded when they're popped — which can be much later.`,

'Binary Indexed Tree': `CONSTRAINT-FIRST THINKING
• "Prefix sum query + point update" → BIT gives O(log n) for both operations
• n ≤ 10^5 with up to 10^5 updates and queries → O(n log n) total with BIT
• If you only need static prefix sums (no updates) → plain prefix sum array is O(1) query and simpler
• BIT can only do prefix operations (sum, count) — for range min/max, use segment tree

PATTERN RECOGNITION
Structural signatures that map here:
• "Range sum query + point update" → BIT (Fenwick tree)
• "Count of elements less than X" → BIT on value space (coordinate compression if needed)
• "Count inversions" → BIT: process array right to left, query how many seen values are less than current
• "Range sum + range update" → BIT with difference array trick

REDUCTION THINKING
• "Count inversions" reduces to: for each element (from right to left), "how many already-processed elements are smaller?" → BIT query on [1, val-1], then update val
• "Range update + point query" reduces to: BIT on a difference array — range add [l, r] by v becomes point update at l (+v) and r+1 (-v), query = prefix sum
• BIT itself reduces to: a clever binary decomposition — each index i covers a range of length (i & -i), giving O(log n) coverage with O(n) space

INVARIANT AWARENESS
BIT stores partial sums such that any prefix sum can be computed by summing O(log n) entries
  • Index i in the BIT covers the range [i - (i & -i) + 1, i]
  • \`i & -i\` (lowest set bit) determines the coverage length
  • Query(prefix sum up to i): accumulate BIT[i], then i -= (i & -i), repeat until i = 0
  • Update(increment position i): add to BIT[i], then i += (i & -i), repeat until i > n
  • Invariant: after any update, all prefix sum queries return correct values

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Query/Update │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Prefix sum array        │ O(1) / O(n)  │ O(n)   │ No updates, or rebuild   │
│ BIT (Fenwick tree)      │ O(log n)     │ O(n)   │ Prefix sum + point update│
│ Segment tree            │ O(log n)     │ O(n)   │ More general (min/max)   │
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
BIT is simpler to code than segment tree (10 lines vs 40+) and has smaller constants. Use BIT when prefix sums suffice; use segment tree when you need range min/max or lazy propagation.`,

'Topological Sort': `CONSTRAINT-FIRST THINKING
• "Dependency ordering / prerequisite ordering" → topological sort on a DAG
• "Detect cycle in directed graph" → if topo sort doesn't include all nodes, there's a cycle
• V, E ≤ 10^5 → O(V + E) for both Kahn's BFS and DFS approaches
• Only works on DIRECTED ACYCLIC graphs — undirected or cyclic graphs have no topological order

PATTERN RECOGNITION
Structural signatures that map here:
• "Course schedule (can you finish all courses?)" → check if topo sort includes all nodes (no cycle)
• "Course schedule II (find valid order)" → return the topo sort order
• "Alien dictionary" → build directed graph from word comparisons, topo sort for letter order
• "Parallel job scheduling (minimum time)" → topo sort + longest path (critical path)
• "Build order / compilation order" → topological sort

REDUCTION THINKING
• "Alien dictionary" reduces to: compare adjacent words to extract character ordering constraints (directed edges), then topological sort the character graph
• "Parallel job scheduling" reduces to: topo sort gives valid order; longest path from source to each node gives earliest start time; total time = max of all (start + duration)
• "Find all possible orderings" reduces to: backtracking over valid topo sort orders (pick any node with in-degree 0 at each step)

INVARIANT AWARENESS
Kahn's BFS: maintain in-degree count for each node; queue starts with all nodes having in-degree 0
  • When a node is dequeued: it has no remaining dependencies → safe to process
  • Decrement in-degree of all neighbors; if any reaches 0, enqueue
  • Invariant: queue always contains nodes with in-degree 0 (all prerequisites satisfied)
  • If processed_count < total_nodes at the end → cycle exists
DFS approach: run DFS, add to result in POST-ORDER (after all descendants visited), then reverse
  • Invariant: when a node is added to the result, all nodes it depends on are already in the result

TRADE-OFF FLUENCY
┌─────────────────────────┬──────────────┬────────┬──────────────────────────┐
│ Approach                │ Time         │ Space  │ Notes                    │
├─────────────────────────┼──────────────┼────────┼──────────────────────────┤
│ Kahn's BFS              │ O(V + E)     │ O(V)   │ Iterative, detects cycle │
│ DFS + post-order reverse│ O(V + E)     │ O(V)   │ Recursive, less intuitive│
│ DFS with 3-state color  │ O(V + E)     │ O(V)   │ Explicit cycle detection │
└─────────────────────────┴──────────────┴────────┴──────────────────────────┘
Kahn's BFS is preferred for interviews — it's iterative, naturally detects cycles (incomplete sort = cycle), and the in-degree concept is easy to explain. DFS approach is fine too but requires care with the post-order reversal.`,

'Concurrency': `CONSTRAINT-FIRST THINKING
• "Enforce execution order (A before B)" → promise/event gates (A signals, B waits)
• "Alternate between two threads" → two semaphores or locks (ping-pong pattern)
• "Bounded buffer / producer-consumer" → semaphore(capacity) + mutex for shared state
• "Group threads in ratio (2H + 1O)" → counting semaphores for each role + barrier for group sync
• Key concern: avoid DEADLOCK (circular wait) and STARVATION (some thread never gets resources)

PATTERN RECOGNITION
Structural signatures that map here:
• "Print in order / Foo Bar alternately" → event/promise gates between threads
• "Print zero-even-odd" → three semaphores coordinating turn order
• "Bounded blocking queue" → semaphore(capacity) for producer, semaphore(0) for consumer, mutex for queue ops
• "H2O molecule building" → semaphore(2) for H, semaphore(1) for O, barrier(3) to sync group
• "Dining philosophers" → semaphore(n-1) to prevent circular wait, or ordered lock acquisition

REDUCTION THINKING
• "FooBar alternately" reduces to ping-pong: semaphore_foo starts at 1, semaphore_bar starts at 0. Foo acquires foo-sem, prints, releases bar-sem. Bar does the reverse
• "Dining philosophers deadlock prevention" reduces to: allow at most n-1 philosophers to attempt eating simultaneously (semaphore(n-1)) — breaks the circular wait condition
• "Building H2O" reduces to: semaphores enforce the 2:1 ratio, barrier waits until a complete group of 3 is formed before any proceed

INVARIANT AWARENESS
Semaphore: count represents available permits; acquire blocks if count = 0, release increments count
  • Invariant: count ≥ 0 always; threads blocked on acquire are released FIFO (usually)
Mutex/Lock: at most one thread holds the lock at any time
  • Invariant: critical section code runs atomically with respect to other threads using the same lock
Barrier(n): blocks until n threads have arrived, then releases all simultaneously
  • Invariant: no thread passes the barrier until all n have reached it
Event/Promise: a one-shot signal — once set, all waiters (current and future) proceed immediately

TRADE-OFF FLUENCY
┌─────────────────────────┬───────────────────┬──────────────────────────────┐
│ Primitive               │ Use Case          │ Notes                        │
├─────────────────────────┼───────────────────┼──────────────────────────────┤
│ Mutex / Lock            │ Mutual exclusion  │ Simplest, one thread at time │
│ Semaphore(n)            │ Bounded access    │ Allow up to n concurrent     │
│ Event / Promise         │ One-time signal   │ Order enforcement            │
│ Condition variable      │ Wait-for-condition│ More flexible than event     │
│ Barrier(n)              │ Group sync        │ Wait for n threads           │
│ Read-write lock         │ Many readers / 1 writer│ Optimizes read-heavy     │
└─────────────────────────┴───────────────────┴──────────────────────────────┘
Default to the simplest primitive that works: mutex for mutual exclusion, semaphore for bounded concurrency, event for ordering. Only reach for condition variables or barriers when simpler tools can't express the synchronization pattern.`,

};

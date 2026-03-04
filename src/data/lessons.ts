export interface TopicLesson {
  topic: string;
  overview: string;
  keyPatterns: string[];
  template: string;       // Python code template
  complexity: string;
  commonMistakes: string[];
  tips: string[];
}

export const lessons: Record<string, TopicLesson> = {
  'Arrays & Hashing': {
    topic: 'Arrays & Hashing',
    overview: `Arrays and hash maps are the most fundamental data structures. The core idea is using a hash map (dictionary) to achieve O(1) lookups, turning brute-force O(n²) solutions into O(n).

Key techniques:
• Hash map for frequency counting
• Hash map for complement/target lookups (Two Sum pattern)
• Hash set for O(1) existence checks
• Prefix sums for subarray sum queries
• In-place array manipulation using indices as hash keys`,
    keyPatterns: [
      'Frequency count: Use Counter or defaultdict to count occurrences',
      'Complement lookup: For each element, check if target - element exists in map',
      'Prefix sum: presum[i] = sum(nums[0..i]), subarray sum = presum[j] - presum[i]',
      'Index as hash: For arrays with values in [1, n], use nums[i]-1 as index',
      'Grouping: Use tuple/frozenset as hash key to group anagrams, etc.',
    ],
    template: `# Two Sum pattern - complement lookup
def two_sum(nums, target):
    seen = {}  # value -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i

# Frequency count pattern
from collections import Counter
def top_k_frequent(nums, k):
    count = Counter(nums)
    return [x for x, _ in count.most_common(k)]

# Prefix sum pattern
def subarray_sum(nums, k):
    prefix = {0: 1}  # prefix_sum -> count
    curr_sum = count = 0
    for num in nums:
        curr_sum += num
        count += prefix.get(curr_sum - k, 0)
        prefix[curr_sum] = prefix.get(curr_sum, 0) + 1
    return count`,
    complexity: 'Most hash map solutions: O(n) time, O(n) space. Prefix sum: O(n) time, O(n) space.',
    commonMistakes: [
      'Forgetting to handle duplicate keys in hash map',
      'Not considering negative numbers in prefix sum problems',
      'Using list as dict key (use tuple instead)',
      'Off-by-one in prefix sum indexing',
    ],
    tips: [
      'When you see "find pair/subarray with sum = target", think hash map',
      'Counter().most_common(k) is your friend for top-k problems',
      'For "group by" problems, define a canonical key (sorted tuple, char count tuple)',
      'Prefix sum + hash map solves most subarray sum problems in O(n)',
    ],
  },

  'Two Pointers': {
    topic: 'Two Pointers',
    overview: `Two pointers technique uses two indices that move through the array to solve problems in O(n) time without extra space. Works best on sorted arrays or when searching for pairs/triplets.

Three main patterns:
• Opposite direction: left=0, right=n-1, move inward
• Same direction: slow/fast pointers
• Partition: separate elements by condition`,
    keyPatterns: [
      'Opposite ends: Start from both ends, shrink based on comparison (sorted arrays)',
      'Fast & slow: Fast moves 2x, slow moves 1x (cycle detection, middle finding)',
      'Partition: One pointer tracks position, other scans (Dutch flag, remove duplicates)',
      'Three pointers: Extension for 3Sum - fix one, two-pointer on rest',
    ],
    template: `# Opposite direction - pair with target sum (sorted)
def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        curr = nums[left] + nums[right]
        if curr == target:
            return [left, right]
        elif curr < target:
            left += 1
        else:
            right -= 1

# 3Sum pattern - fix one, two-pointer on rest
def three_sum(nums):
    nums.sort()
    result = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i-1]:
            continue  # skip duplicates
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left+1]:
                    left += 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    return result

# Partition - remove duplicates in-place
def remove_duplicates(nums):
    if not nums:
        return 0
    slow = 0
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    return slow + 1`,
    complexity: 'O(n) for two pointers on sorted array. O(n²) for 3Sum. O(1) extra space.',
    commonMistakes: [
      'Forgetting to sort the array first',
      'Not handling duplicate skipping in 3Sum',
      'Moving wrong pointer (move the one that gets you closer to target)',
      'Off-by-one when initializing pointers',
    ],
    tips: [
      'If array is sorted and you need pairs → opposite-direction two pointers',
      'For "container" problems, always move the shorter side',
      'To skip duplicates: while left < right and nums[left] == nums[left+1]: left += 1',
      'Trapping rain water: track left_max and right_max with two pointers',
    ],
  },

  'Sliding Window': {
    topic: 'Sliding Window',
    overview: `Sliding window maintains a "window" (subarray/substring) that expands and contracts to find optimal subarrays. Converts brute-force O(n²) or O(n³) into O(n).

Two types:
• Fixed size: Window size is given, slide it across
• Variable size: Expand right, shrink left when condition breaks`,
    keyPatterns: [
      'Fixed window: Add right element, remove left element as window slides',
      'Variable window (shrinkable): Expand right, shrink left while invalid',
      'Variable window (non-shrinkable): Expand right, shift left by 1 if invalid (window never shrinks)',
      'Frequency map window: Track char counts, compare with target counts',
    ],
    template: `# Variable window - longest substring without repeating chars
def length_of_longest_substring(s):
    seen = {}  # char -> last index
    left = result = 0
    for right in range(len(s)):
        if s[right] in seen and seen[s[right]] >= left:
            left = seen[s[right]] + 1
        seen[s[right]] = right
        result = max(result, right - left + 1)
    return result

# Variable window - minimum window substring
def min_window(s, t):
    from collections import Counter
    need = Counter(t)
    missing = len(t)
    left = start = 0
    min_len = float('inf')

    for right, char in enumerate(s):
        if need[char] > 0:
            missing -= 1
        need[char] -= 1

        while missing == 0:  # valid window, try to shrink
            if right - left + 1 < min_len:
                min_len = right - left + 1
                start = left
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1
            left += 1

    return s[start:start + min_len] if min_len != float('inf') else ""

# Fixed window - max sum of subarray of size k
def max_sum_subarray(nums, k):
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum`,
    complexity: 'O(n) time (each element enters and leaves window once). O(k) space for frequency maps.',
    commonMistakes: [
      'Not correctly shrinking the window (infinite loop)',
      'Confusing "longest valid" vs "shortest valid" window logic',
      'Off-by-one in window size calculation (right - left + 1)',
      'Not handling empty string edge cases',
    ],
    tips: [
      'Longest/largest → expand right, shrink left only when invalid',
      'Shortest/smallest → expand right, shrink left while still valid',
      'Use Counter for character frequency matching problems',
      'The "missing" counter pattern avoids comparing entire frequency maps',
    ],
  },

  'Stack': {
    topic: 'Stack',
    overview: `Stacks follow LIFO (Last In, First Out). They excel at problems involving nested structures, matching pairs, and maintaining a history of elements.

Core use cases:
• Parentheses matching and validation
• Expression evaluation (postfix, calculator)
• Monotonic stack for next greater/smaller element
• Undo/history tracking`,
    keyPatterns: [
      'Matching pairs: Push opening, pop on closing, validate match',
      'Monotonic stack: Maintain increasing/decreasing stack for next greater/smaller',
      'Calculator: Two stacks (numbers + operators) or single stack with sign tracking',
      'Decode/flatten: Stack to track nested context (decode string, nested lists)',
    ],
    template: `# Valid parentheses
def is_valid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in pairs:
            if not stack or stack[-1] != pairs[c]:
                return False
            stack.pop()
        else:
            stack.append(c)
    return not stack

# Monotonic stack - daily temperatures (next warmer day)
def daily_temperatures(temps):
    n = len(temps)
    result = [0] * n
    stack = []  # indices of temps waiting for warmer day
    for i in range(n):
        while stack and temps[i] > temps[stack[-1]]:
            j = stack.pop()
            result[j] = i - j
        stack.append(i)
    return result

# Evaluate reverse polish notation
def eval_rpn(tokens):
    stack = []
    ops = {'+': lambda a,b: a+b, '-': lambda a,b: a-b,
           '*': lambda a,b: a*b, '/': lambda a,b: int(a/b)}
    for t in tokens:
        if t in ops:
            b, a = stack.pop(), stack.pop()
            stack.append(ops[t](a, b))
        else:
            stack.append(int(t))
    return stack[0]`,
    complexity: 'O(n) time and O(n) space for most stack problems.',
    commonMistakes: [
      'Not checking if stack is empty before popping',
      'Monotonic stack: confusing when to use increasing vs decreasing',
      'Integer division in Python: use int(a/b) not a//b for negative numbers',
      'Forgetting to check stack is empty at the end (unmatched parentheses)',
    ],
    tips: [
      'If you need "next greater element" → decreasing monotonic stack',
      'If you need "next smaller element" → increasing monotonic stack',
      'For calculator problems: process digits into numbers, handle signs with stack',
      'Largest rectangle in histogram is the classic monotonic stack problem',
    ],
  },

  'Binary Search': {
    topic: 'Binary Search',
    overview: `Binary search halves the search space each step, achieving O(log n). Beyond sorted arrays, it applies to any problem where you can define a monotonic condition to binary search on.

Key insight: Binary search works whenever you can answer "is this value feasible?" and the answer changes from False to True (or vice versa) at some threshold.`,
    keyPatterns: [
      'Classic: Find target in sorted array',
      'Boundary: Find first/last position where condition is true',
      'Search on answer: Binary search on the answer value itself (min/max optimization)',
      'Rotated array: Modified binary search with pivot detection',
    ],
    template: `# Classic binary search
def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Find first position where condition is true (left boundary)
def first_true(lo, hi, condition):
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if condition(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

# Search on answer - Koko eating bananas
def min_eating_speed(piles, h):
    import math
    def can_finish(speed):
        return sum(math.ceil(p / speed) for p in piles) <= h

    left, right = 1, max(piles)
    while left < right:
        mid = left + (right - left) // 2
        if can_finish(mid):
            right = mid
        else:
            left = mid + 1
    return left

# Search in rotated sorted array
def search_rotated(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[left] <= nums[mid]:  # left half sorted
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:  # right half sorted
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1`,
    complexity: 'O(log n) time, O(1) space.',
    commonMistakes: [
      'Off-by-one: left <= right vs left < right (depends on variant)',
      'Integer overflow: use left + (right - left) // 2',
      'Wrong half elimination in rotated array search',
      'Not identifying when binary search on answer applies',
    ],
    tips: [
      'Use left < right (exclusive) for boundary-finding; left <= right for exact match',
      '"Minimum value that satisfies X" → binary search on answer',
      'Koko bananas, ship packages, split array → all "search on answer" pattern',
      'For rotated arrays: determine which half is sorted, then check if target is in that half',
    ],
  },

  'Linked List': {
    topic: 'Linked List',
    overview: `Linked lists test pointer manipulation skills. Most problems use these core techniques:
• Dummy head node to simplify edge cases
• Fast & slow pointers for cycle detection and middle finding
• Reverse a linked list (iterative and recursive)
• Merge sorted lists`,
    keyPatterns: [
      'Dummy head: Create a dummy node to avoid null checks for head changes',
      'Fast/slow pointers: Fast moves 2 steps, slow moves 1 step',
      'Reversal: Track prev, curr, next; reverse one node at a time',
      'Merge: Compare heads of two lists, link smaller one',
    ],
    template: `# Reverse a linked list (iterative)
def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev

# Detect cycle (Floyd's algorithm)
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False

# Find middle of linked list
def find_middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow

# Merge two sorted lists
def merge_two_lists(l1, l2):
    dummy = curr = ListNode(0)
    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next
    curr.next = l1 or l2
    return dummy.next

# Remove nth node from end (two-pointer gap)
def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next`,
    complexity: 'O(n) time, O(1) space for most linked list operations.',
    commonMistakes: [
      'Losing reference to next node during reversal',
      'Not using dummy head (leads to complex null checks)',
      'Not handling single-node or empty list edge cases',
      'Cycle detection: forgetting to check fast.next before fast.next.next',
    ],
    tips: [
      'Always consider using a dummy head node',
      'Draw the pointer changes on paper before coding',
      'For "reorder/rearrange" problems: find middle → reverse second half → merge',
      'Merge K sorted lists: use heap or divide-and-conquer',
    ],
  },

  'Trees': {
    topic: 'Trees',
    overview: `Trees are recursive structures. Most tree problems follow one of these traversal patterns:
• DFS (preorder, inorder, postorder) - usually recursive
• BFS (level-order) - usually iterative with queue
• BST properties: left < root < right

The key insight: at each node, combine results from left and right subtrees.`,
    keyPatterns: [
      'DFS recursive: Base case (null node) + recursive calls on children',
      'BFS level-order: Queue-based, process level by level',
      'BST search: Go left if target < node, right if target > node',
      'Path problems: Track running sum/path from root, use DFS',
      'Build tree: Use preorder/inorder arrays to reconstruct',
    ],
    template: `# DFS - maximum depth
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

# BFS - level order traversal
from collections import deque
def level_order(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result

# Validate BST
def is_valid_bst(root, lo=float('-inf'), hi=float('inf')):
    if not root:
        return True
    if root.val <= lo or root.val >= hi:
        return False
    return (is_valid_bst(root.left, lo, root.val) and
            is_valid_bst(root.right, root.val, hi))

# Lowest common ancestor
def lca(root, p, q):
    if not root or root == p or root == q:
        return root
    left = lca(root.left, p, q)
    right = lca(root.right, p, q)
    if left and right:
        return root
    return left or right

# Diameter of binary tree
def diameter(root):
    result = [0]
    def height(node):
        if not node:
            return 0
        left = height(node.left)
        right = height(node.right)
        result[0] = max(result[0], left + right)
        return 1 + max(left, right)
    height(root)
    return result[0]`,
    complexity: 'O(n) time for traversals (visit each node once). O(h) space for recursion stack where h = tree height.',
    commonMistakes: [
      'Forgetting base case: if not root: return ...',
      'BST validation: using local min/max instead of passing bounds down',
      'Confusing preorder/inorder/postorder for tree construction',
      'Not considering skewed trees (O(n) height)',
    ],
    tips: [
      'Most tree problems: think recursively from a single node\'s perspective',
      'For "path" problems: track global max with nonlocal or list trick',
      'BST inorder traversal gives sorted order',
      'Serialize/deserialize: use preorder + null markers',
    ],
  },

  'Tries': {
    topic: 'Tries',
    overview: `A Trie (prefix tree) stores strings character by character. Each node represents a character, paths represent prefixes. Efficient for prefix-based lookups, autocomplete, and word search.`,
    keyPatterns: [
      'Insert: Walk down creating nodes for each character',
      'Search: Walk down checking each character exists',
      'StartsWith: Same as search but don\'t require end-of-word marker',
      'Word search: Combine trie with DFS/backtracking on grid',
    ],
    template: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.is_end = True

    def search(self, word):
        node = self._find(word)
        return node is not None and node.is_end

    def starts_with(self, prefix):
        return self._find(prefix) is not None

    def _find(self, prefix):
        node = self.root
        for c in prefix:
            if c not in node.children:
                return None
            node = node.children[c]
        return node`,
    complexity: 'Insert/Search/Prefix: O(m) where m = word length. Space: O(n * m) for n words.',
    commonMistakes: [
      'Forgetting is_end flag (prefix exists != word exists)',
      'Not handling the root node separately',
      'Memory: tries can use lots of memory for large alphabets',
    ],
    tips: [
      'Use dict for children (flexible) or list of size 26 (faster for lowercase)',
      'Word Search II: build trie from words, DFS from each grid cell',
      'Can store additional data at nodes (count, word reference, etc.)',
    ],
  },

  'Heap / Priority Queue': {
    topic: 'Heap / Priority Queue',
    overview: `A heap provides O(log n) insert and O(1) access to min (or max) element. Python's heapq is a min-heap. Use it when you repeatedly need the smallest/largest element.

Key use cases: top-K problems, merge K sorted things, scheduling, median finding.`,
    keyPatterns: [
      'Top K: Use min-heap of size K (or max-heap for smallest K)',
      'Merge K sorted: Push first element of each list, pop smallest, push next',
      'Two heaps: Max-heap for lower half + min-heap for upper half (median)',
      'Lazy deletion: Mark elements as deleted, skip them when popping',
    ],
    template: `import heapq

# Top K frequent elements
def top_k_frequent(nums, k):
    from collections import Counter
    count = Counter(nums)
    return heapq.nlargest(k, count.keys(), key=count.get)

# Merge K sorted lists
def merge_k_lists(lists):
    heap = []
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst.val, i, lst))

    dummy = curr = ListNode(0)
    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next

# Find median from data stream (two heaps)
class MedianFinder:
    def __init__(self):
        self.lo = []   # max-heap (negate values)
        self.hi = []   # min-heap

    def add_num(self, num):
        heapq.heappush(self.lo, -num)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def find_median(self):
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2`,
    complexity: 'Push/pop: O(log n). Peek: O(1). Building heap from array: O(n). Top-K: O(n log k).',
    commonMistakes: [
      'Python heapq is min-heap only — negate values for max-heap',
      'Comparing tuples: if first elements are equal, Python compares second element (must be comparable)',
      'Not handling empty heap edge cases',
    ],
    tips: [
      'For max-heap in Python: push -value, pop gives -value (negate back)',
      'Use (priority, tie_breaker, item) tuples to avoid comparison issues',
      'heapq.nlargest(k, ...) and heapq.nsmallest(k, ...) are convenient',
      'Task scheduler: greedily pick the most frequent task',
    ],
  },

  'Backtracking': {
    topic: 'Backtracking',
    overview: `Backtracking explores all possible solutions by building candidates incrementally and abandoning ("backtracking") as soon as a candidate cannot lead to a valid solution.

Template: choose → explore → unchoose. Think of it as DFS on a decision tree.`,
    keyPatterns: [
      'Subsets: Include or exclude each element',
      'Permutations: Choose from remaining elements for each position',
      'Combinations: Choose k elements from n (maintain start index to avoid duplicates)',
      'Constraint satisfaction: Prune branches that violate constraints early (N-Queens, Sudoku)',
    ],
    template: `# Subsets
def subsets(nums):
    result = []
    def backtrack(start, path):
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()
    backtrack(0, [])
    return result

# Permutations
def permutations(nums):
    result = []
    def backtrack(path, remaining):
        if not remaining:
            result.append(path[:])
            return
        for i in range(len(remaining)):
            path.append(remaining[i])
            backtrack(path, remaining[:i] + remaining[i+1:])
            path.pop()
    backtrack([], nums)
    return result

# Combination Sum (can reuse elements)
def combination_sum(candidates, target):
    result = []
    def backtrack(start, path, remaining):
        if remaining == 0:
            result.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                break
            path.append(candidates[i])
            backtrack(i, path, remaining - candidates[i])  # i, not i+1 (reuse)
            path.pop()
    candidates.sort()
    backtrack(0, [], target)
    return result

# N-Queens
def solve_n_queens(n):
    result = []
    cols = set()
    diag1 = set()  # row - col
    diag2 = set()  # row + col

    def backtrack(row, board):
        if row == n:
            result.append(["".join(r) for r in board])
            return
        for col in range(n):
            if col in cols or row-col in diag1 or row+col in diag2:
                continue
            cols.add(col); diag1.add(row-col); diag2.add(row+col)
            board[row][col] = 'Q'
            backtrack(row + 1, board)
            board[row][col] = '.'
            cols.remove(col); diag1.remove(row-col); diag2.remove(row+col)

    board = [['.' for _ in range(n)] for _ in range(n)]
    backtrack(0, board)
    return result`,
    complexity: 'Subsets: O(2^n). Permutations: O(n!). Pruning helps in practice.',
    commonMistakes: [
      'Forgetting to undo the choice (path.pop(), set.remove())',
      'Not handling duplicate elements (sort + skip if nums[i] == nums[i-1])',
      'Subsets II: must sort and skip duplicates at same recursion level',
      'Passing mutable objects: append path[:] (copy), not path itself',
    ],
    tips: [
      'Always think: What are my choices at each step? When do I stop?',
      'Sort input to enable duplicate skipping and early termination',
      'For "can reuse elements": recurse with same index. For "use once": index + 1',
      'Draw the decision tree to visualize the recursion',
    ],
  },

  'Graphs': {
    topic: 'Graphs',
    overview: `Graphs model relationships between entities. Core algorithms:
• BFS: Shortest path in unweighted graphs, level-by-level exploration
• DFS: Explore as deep as possible, backtrack (cycle detection, connected components)
• Topological sort: Order nodes in DAG (course schedule)
• Union-Find: Efficiently track connected components
• Dijkstra: Shortest path in weighted graphs`,
    keyPatterns: [
      'BFS (shortest path): Queue-based, visit level by level',
      'DFS (connectivity): Stack/recursion, mark visited',
      'Grid as graph: 4-directional neighbors, BFS/DFS from each cell',
      'Topological sort: Kahn\'s (BFS with in-degree) or DFS post-order',
      'Dijkstra: Min-heap of (distance, node), relax edges',
    ],
    template: `from collections import deque, defaultdict

# BFS - number of islands (grid)
def num_islands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0

    def bfs(r, c):
        queue = deque([(r, c)])
        grid[r][c] = '0'
        while queue:
            r, c = queue.popleft()
            for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                nr, nc = r+dr, c+dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1':
                    grid[nr][nc] = '0'
                    queue.append((nr, nc))

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                bfs(r, c)
                count += 1
    return count

# Topological sort (Kahn's algorithm)
def course_order(n, prerequisites):
    graph = defaultdict(list)
    in_degree = [0] * n
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1

    queue = deque(i for i in range(n) if in_degree[i] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    return order if len(order) == n else []

# Dijkstra's shortest path
import heapq
def network_delay(times, n, k):
    graph = defaultdict(list)
    for u, v, w in times:
        graph[u].append((v, w))

    dist = {k: 0}
    heap = [(0, k)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist.get(node, float('inf')):
            continue
        for neighbor, weight in graph[node]:
            new_dist = d + weight
            if new_dist < dist.get(neighbor, float('inf')):
                dist[neighbor] = new_dist
                heapq.heappush(heap, (new_dist, neighbor))

    return max(dist.values()) if len(dist) == n else -1`,
    complexity: 'BFS/DFS: O(V + E). Dijkstra: O((V + E) log V) with heap. Topological sort: O(V + E).',
    commonMistakes: [
      'Forgetting visited set (infinite loops in cycles)',
      'BFS on weighted graph (use Dijkstra instead)',
      'Not building adjacency list correctly (directed vs undirected)',
      'Topological sort: not detecting cycles (check if all nodes are in result)',
    ],
    tips: [
      'Grid BFS/DFS: directions = [(0,1),(0,-1),(1,0),(-1,0)]',
      'Shortest path unweighted → BFS. Weighted → Dijkstra. Negative weights → Bellman-Ford',
      'Cycle detection: DFS with 3 states (unvisited, in-progress, done)',
      'Multi-source BFS: add all sources to queue initially (rotting oranges)',
    ],
  },

  'Dynamic Programming': {
    topic: 'Dynamic Programming',
    overview: `DP solves problems by breaking them into overlapping subproblems and storing results. Two approaches:
• Top-down (memoization): Recursive with cache
• Bottom-up (tabulation): Iterative, fill table from base cases

Key: define the state (what info you need to solve a subproblem) and the recurrence (how subproblems relate).`,
    keyPatterns: [
      '1D DP: dp[i] depends on previous elements (climbing stairs, house robber)',
      '2D DP: dp[i][j] for two sequences/dimensions (LCS, edit distance, grid paths)',
      'Knapsack: Include or exclude items, track capacity (subset sum, coin change)',
      'Interval DP: dp[i][j] for subarray/substring i..j (burst balloons, palindrome)',
      'State machine DP: States represent conditions (buy/sell stock with cooldown)',
    ],
    template: `# 1D DP - House Robber
def rob(nums):
    if len(nums) <= 2:
        return max(nums) if nums else 0
    dp = [0] * len(nums)
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])
    for i in range(2, len(nums)):
        dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    return dp[-1]

# 2D DP - Longest Common Subsequence
def lcs(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]

# Knapsack - Coin Change (unbounded)
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

# Top-down with memoization
from functools import lru_cache
def longest_increasing_subsequence(nums):
    @lru_cache(maxsize=None)
    def dp(i):
        result = 1
        for j in range(i):
            if nums[j] < nums[i]:
                result = max(result, dp(j) + 1)
        return result
    return max(dp(i) for i in range(len(nums))) if nums else 0

# 0/1 Knapsack - Partition Equal Subset Sum
def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for num in nums:
        for j in range(target, num - 1, -1):  # reverse to avoid reuse
            dp[j] = dp[j] or dp[j - num]
    return dp[target]`,
    complexity: 'Depends on state space. 1D: O(n). 2D: O(n*m). Knapsack: O(n*W).',
    commonMistakes: [
      'Wrong recurrence: missing base cases or wrong state transitions',
      '0/1 knapsack: iterating forward instead of backward (causes item reuse)',
      'Unbounded knapsack: iterating backward instead of forward',
      'Not considering all possible previous states in transition',
      'Space optimization: be careful about order of filling',
    ],
    tips: [
      'Start with brute-force recursion, add memoization, then convert to bottom-up',
      'Draw the DP table on paper to understand transitions',
      'Common states: index, remaining capacity, previous choice, boolean flags',
      'Space optimization: if dp[i] only depends on dp[i-1], use two rows or rolling array',
      'LIS has O(n log n) solution using patience sorting (binary search)',
    ],
  },

  'Greedy': {
    topic: 'Greedy',
    overview: `Greedy algorithms make locally optimal choices at each step, hoping to reach a globally optimal solution. They work when the problem has "greedy choice property" — a local optimum leads to global optimum.

Key insight: If you can prove that choosing the best option at each step never hurts the final answer, use greedy.`,
    keyPatterns: [
      'Interval scheduling: Sort by end time, pick non-overlapping',
      'Activity selection: Sort and greedily pick compatible activities',
      'Jump game: Track farthest reachable position',
      'Partition: Track last occurrence, extend partition boundary',
    ],
    template: `# Jump Game - can reach end?
def can_jump(nums):
    farthest = 0
    for i in range(len(nums)):
        if i > farthest:
            return False
        farthest = max(farthest, i + nums[i])
    return True

# Non-overlapping intervals (min removals)
def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda x: x[1])  # sort by end
    count = 0
    end = float('-inf')
    for s, e in intervals:
        if s >= end:
            end = e
        else:
            count += 1
    return count

# Partition Labels
def partition_labels(s):
    last = {c: i for i, c in enumerate(s)}
    start = end = 0
    result = []
    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            result.append(end - start + 1)
            start = end + 1
    return result

# Gas Station
def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    start = tank = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1
            tank = 0
    return start`,
    complexity: 'Usually O(n log n) due to sorting, or O(n) if no sorting needed.',
    commonMistakes: [
      'Applying greedy when it doesn\'t work (need to prove greedy choice property)',
      'Sorting by wrong criterion (start vs end time matters!)',
      'Not considering edge cases (empty input, single element)',
    ],
    tips: [
      'Interval problems: almost always sort by end time',
      'If greedy doesn\'t work, try DP',
      'Prove correctness by contradiction: "if greedy choice is wrong, we can swap for better"',
      'Jump Game: just track the farthest you can reach',
    ],
  },

  'Intervals': {
    topic: 'Intervals',
    overview: `Interval problems involve ranges [start, end]. Core operations: merge overlapping, find intersections, insert, and schedule.

Almost all interval problems start with sorting (usually by start time).`,
    keyPatterns: [
      'Merge: Sort by start, extend end if overlapping',
      'Insert: Find position, merge with overlapping intervals',
      'Intersection: Two pointers on sorted interval lists',
      'Meeting rooms: Sort by start, check for overlaps / count concurrent',
    ],
    template: `# Merge Intervals
def merge(intervals):
    intervals.sort()
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged

# Insert Interval
def insert(intervals, new):
    result = []
    i = 0
    # Add all before
    while i < len(intervals) and intervals[i][1] < new[0]:
        result.append(intervals[i])
        i += 1
    # Merge overlapping
    while i < len(intervals) and intervals[i][0] <= new[1]:
        new = [min(new[0], intervals[i][0]),
               max(new[1], intervals[i][1])]
        i += 1
    result.append(new)
    # Add all after
    result.extend(intervals[i:])
    return result

# Meeting Rooms II (min rooms needed)
def min_meeting_rooms(intervals):
    import heapq
    intervals.sort()
    heap = []  # end times of ongoing meetings
    for start, end in intervals:
        if heap and heap[0] <= start:
            heapq.heappop(heap)
        heapq.heappush(heap, end)
    return len(heap)`,
    complexity: 'O(n log n) due to sorting. O(n) for the merge/scan pass.',
    commonMistakes: [
      'Not sorting intervals first',
      'Off-by-one with inclusive/exclusive endpoints',
      'Meeting rooms: using start times to pop from heap instead of comparing with end times',
    ],
    tips: [
      'Always sort first. By start for merge/insert. By end for scheduling.',
      'Meeting rooms II: think of it as "how many meetings overlap at peak?"',
      'Alternative for meeting rooms: sweep line with +1 at start, -1 at end',
    ],
  },

  'Math & Geometry': {
    topic: 'Math & Geometry',
    overview: `Math problems test number theory, modular arithmetic, and geometric reasoning. Common patterns: digit manipulation, matrix rotation/spiral, GCD/LCM, and modular exponentiation.`,
    keyPatterns: [
      'Digit manipulation: mod 10 for last digit, divide by 10 to remove last digit',
      'Matrix rotation: transpose + reverse rows (90° clockwise)',
      'Spiral order: Use boundaries (top, bottom, left, right) and shrink',
      'Power/GCD: Fast exponentiation, Euclidean algorithm',
    ],
    template: `# Rotate image 90° clockwise (in-place)
def rotate(matrix):
    n = len(matrix)
    # Transpose
    for i in range(n):
        for j in range(i, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # Reverse each row
    for row in matrix:
        row.reverse()

# Spiral order
def spiral_order(matrix):
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for col in range(left, right + 1):
            result.append(matrix[top][col])
        top += 1
        for row in range(top, bottom + 1):
            result.append(matrix[row][right])
        right -= 1
        if top <= bottom:
            for col in range(right, left - 1, -1):
                result.append(matrix[bottom][col])
            bottom -= 1
        if left <= right:
            for row in range(bottom, top - 1, -1):
                result.append(matrix[row][left])
            left += 1
    return result

# Fast power
def my_pow(x, n):
    if n < 0:
        x, n = 1/x, -n
    result = 1
    while n:
        if n % 2:
            result *= x
        x *= x
        n //= 2
    return result`,
    complexity: 'Varies. Matrix operations: O(n²). Power: O(log n). GCD: O(log(min(a,b))).',
    commonMistakes: [
      'Integer overflow (less of an issue in Python, but watch for other languages)',
      'Spiral matrix: not checking bounds after each direction change',
      'Negative exponents in pow',
      'Division: Python int division truncates toward negative infinity (use int(a/b) for truncation toward zero)',
    ],
    tips: [
      'Rotate 90° CW = transpose + reverse rows. CCW = transpose + reverse columns.',
      'For digit problems: while n > 0: digit = n % 10; n //= 10',
      'Sieve of Eratosthenes for counting primes',
      'Happy number: use cycle detection (set or fast/slow pointer)',
    ],
  },

  'Bit Manipulation': {
    topic: 'Bit Manipulation',
    overview: `Bit manipulation uses bitwise operators (&, |, ^, ~, <<, >>) to solve problems efficiently. Key property: XOR (^) cancels out duplicates — a ^ a = 0, a ^ 0 = a.`,
    keyPatterns: [
      'XOR for finding unique: XOR all elements, duplicates cancel out',
      'Bit masking: Use bits as boolean flags for subsets',
      'Count bits: n & (n-1) removes lowest set bit',
      'Check power of 2: n & (n-1) == 0',
    ],
    template: `# Single Number (find unique in array of pairs)
def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result

# Number of 1 bits
def hamming_weight(n):
    count = 0
    while n:
        count += 1
        n &= n - 1  # remove lowest set bit
    return count

# Counting bits for 0..n
def count_bits(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)
    return dp

# Reverse bits
def reverse_bits(n):
    result = 0
    for _ in range(32):
        result = (result << 1) | (n & 1)
        n >>= 1
    return result`,
    complexity: 'O(1) or O(log n) for bit operations. O(n) for array-based bit problems.',
    commonMistakes: [
      'Confusing & (AND) with && (logical AND)',
      'Not handling negative numbers with bit operations',
      'Operator precedence: & has lower precedence than ==',
    ],
    tips: [
      'XOR is your best friend for "find the unique element" problems',
      'n & (n-1) clears the lowest set bit — useful for counting bits',
      'Use bit mask as set: if (mask >> i) & 1 checks if bit i is set',
      'For "single number" variants with 3 occurrences, count bits modulo 3',
    ],
  },
};

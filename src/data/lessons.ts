export interface TopicLesson {
  topic: string;
  overview: string;
  keyPatterns: string[];
  template: string;       // Python code template
  complexity: string;
  commonMistakes: string[];
  tips: string[];
  memorization?: string;  // Mnemonics and techniques for memorizing templates
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
    memorization: `HOW TO MEMORIZE THE HASH MAP TEMPLATE:
The "Two Sum" pattern is the mother of all hash map problems. Memorize it as 3 steps:
  1. CREATE the map (seen = {})
  2. COMPUTE what you need (complement = target - num)
  3. CHECK if it exists, else STORE current

Mnemonic: "CCC" - Create, Compute, Check

For Prefix Sum, remember the equation:
  subarray_sum(i, j) = prefix[j] - prefix[i]
Initialize with {0: 1} because an empty prefix sums to 0.

VISUAL ANCHOR: Picture a dictionary/phonebook. Instead of scanning every entry (O(n^2)), you flip directly to the right page (O(1) lookup). That's what hash maps do.`,
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
    memorization: `HOW TO MEMORIZE TWO POINTERS:
Three shapes to visualize:
  1. PINCH (opposite ends): left=0, right=n-1, squeeze inward like a vise
  2. RACE (same direction): fast runs ahead, slow follows - like a tortoise and hare
  3. ANCHOR + SCAN: fix one pointer, scan with another (3Sum)

Mnemonic for sorted pair problems: "Too small? Move left. Too big? Move right."
This one sentence IS the algorithm. If sum < target, you need bigger (left++). If sum > target, you need smaller (right--).

For 3Sum: "Fix one, two-pointer the rest, skip duplicates."
  - Outer loop: fix nums[i]
  - Inner: two-pointer on [i+1 ... n-1]
  - Skip: if nums[i] == nums[i-1], continue`,
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
    memorization: `HOW TO MEMORIZE SLIDING WINDOW:
Think of it as an inchworm crawling across the array:
  - RIGHT side expands (the worm stretches forward)
  - LEFT side contracts (the tail catches up)

The template is always the same skeleton:
  left = 0
  for right in range(n):
      ADD nums[right] to window
      while WINDOW IS INVALID:
          REMOVE nums[left] from window
          left += 1
      UPDATE answer

Mnemonic: "ARRU" - Add Right, Remove Until valid, Update answer

LONGEST vs SHORTEST:
  - Longest valid window: shrink only when INVALID, update answer AFTER shrinking
  - Shortest valid window: shrink while VALID, update answer BEFORE shrinking`,
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
    memorization: `HOW TO MEMORIZE STACK PATTERNS:
Mnemonic: "LIFO = Last In First Out" - like a stack of plates.

PARENTHESES (the easiest stack problem - memorize this first):
  for char in s:
      if OPENING: push
      if CLOSING: pop and check match
  return stack is empty

MONOTONIC STACK (the most important pattern):
  Visualize a mountain range. You scan left to right. When you see a taller peak, all shorter peaks to its left now know their "next greater element."

  for i in range(n):
      while stack and nums[i] > nums[stack[-1]]:
          j = stack.pop()        # j found its next greater: i
          result[j] = i - j      # or nums[i], depending on problem
      stack.append(i)

Memory trick: "Pop the losers, push the current."
  - Next GREATER element = DECREASING stack (pop when current is bigger)
  - Next SMALLER element = INCREASING stack (pop when current is smaller)`,
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
    memorization: `HOW TO MEMORIZE BINARY SEARCH:
There are only 2 templates you need. Memorize the DIFFERENCE:

TEMPLATE 1 - Exact match (find target):
  while left <= right:        # NOTE: <=
      mid = left + (right - left) // 2
      if nums[mid] == target: return mid
      elif nums[mid] < target: left = mid + 1
      else: right = mid - 1

TEMPLATE 2 - Boundary/minimum feasible (find first true):
  while left < right:         # NOTE: <
      mid = left + (right - left) // 2
      if condition(mid): right = mid
      else: left = mid + 1
  return left

Mnemonic: "Exact = <=, Boundary = <"

SEARCH ON ANSWER pattern recognition:
When a problem says "find the MINIMUM X such that..." or "find the MAXIMUM X such that..." and you can write a function can_do(x) -> bool, it's binary search on answer.

Memory trick: "Can I do it with X? Yes/No → Binary search the boundary."`,
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
    memorization: `HOW TO MEMORIZE LINKED LIST:
There are really only 4 operations to memorize. Use the mnemonic "RDMF":
  R - Reverse: prev/curr/nxt dance
  D - Dummy head: always create one for edge cases
  M - Middle: fast/slow pointers
  F - Fast/slow: cycle detection

REVERSAL (the hardest to memorize - practice this one most):
  prev = None; curr = head
  while curr:
      nxt = curr.next     # Save next
      curr.next = prev    # Reverse link
      prev = curr         # Advance prev
      curr = nxt          # Advance curr
  return prev

Memory trick: "Save, Reverse, Advance, Advance" (SRAA)
Or think of it as: "Look ahead, point back, step forward (x2)"

FAST/SLOW for cycle detection:
  Tortoise and Hare - hare moves 2x. If there's a cycle, they MUST meet.
  If hare reaches null, no cycle.`,
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
    memorization: `HOW TO MEMORIZE TREE PATTERNS:
Every tree problem is one of 3 things:
  1. TRAVERSAL (DFS or BFS) - just visit nodes in order
  2. RECURSIVE PROPERTY - "is this tree X?" (balanced, symmetric, BST)
  3. PATH/AGGREGATION - combine info from subtrees

THE UNIVERSAL DFS SKELETON (memorize this one thing):
  def dfs(node):
      if not node: return BASE_CASE
      left = dfs(node.left)
      right = dfs(node.right)
      return COMBINE(left, right)

Examples of COMBINE:
  - Max depth: return 1 + max(left, right)
  - Is balanced: return -1 if abs(left-right) > 1 else 1 + max(left, right)
  - Diameter: update global with left+right, return 1 + max(left, right)

BFS SKELETON:
  queue = deque([root])
  while queue:
      for _ in range(len(queue)):  # process one LEVEL
          node = queue.popleft()
          # process node
          if node.left: queue.append(node.left)
          if node.right: queue.append(node.right)

Memory trick: "BFS = Queue + Level loop. DFS = Recursion + Base case."`,
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
    memorization: `HOW TO MEMORIZE TRIE:
A Trie is just a tree where each edge is a character. Memorize the node:
  class TrieNode:
      children = {}    # char -> TrieNode
      is_end = False   # marks end of a complete word

All three operations (insert, search, startsWith) share the SAME walk:
  node = root
  for char in word:
      if char not in node.children: [create or return False]
      node = node.children[char]

The only difference:
  - insert: create missing nodes, set is_end = True at the end
  - search: return False if missing, check is_end at the end
  - startsWith: return False if missing, return True at the end (no is_end check)

Mnemonic: "Trie = Tree of Characters. Walk char by char."`,
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
    memorization: `HOW TO MEMORIZE HEAP:
Python heapq cheat sheet (memorize these 4 operations):
  heapq.heappush(heap, item)    # add item
  heapq.heappop(heap)           # remove & return smallest
  heap[0]                        # peek at smallest (don't pop)
  heapq.heapify(list)           # convert list to heap in O(n)

MAX-HEAP TRICK: Python only has min-heap. Negate values!
  heapq.heappush(heap, -val)    # push negated
  -heapq.heappop(heap)          # pop and negate back

TWO HEAPS FOR MEDIAN (the trickiest pattern):
  Picture a see-saw: left side (max-heap) and right side (min-heap).
  Keep them balanced (left can have 1 extra).
  Median = top of left (if odd) or average of both tops (if even).

  Steps: push to left → balance by moving left-top to right → rebalance sizes

Mnemonic: "Heap = always know the extreme. Min-heap = smallest on top. Negate for max."`,
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
    memorization: `HOW TO MEMORIZE BACKTRACKING:
The template is ALWAYS this skeleton - memorize it as "Choose, Explore, Unchoose":

  def backtrack(start, path):
      if GOAL_REACHED:
          result.append(path[:])   # NOTE: copy!
          return
      for i in range(start, len(nums)):
          if SKIP_CONDITION: continue    # pruning
          path.append(nums[i])           # CHOOSE
          backtrack(i + 1, path)          # EXPLORE (i+1 for no reuse, i for reuse)
          path.pop()                      # UNCHOOSE

THREE VARIATIONS (only the loop changes):
  Subsets/Combinations: for i in range(start, n) → no duplicates via start index
  Permutations: for i in range(n) if not used[i] → try all positions
  Reuse allowed: backtrack(i, path) instead of backtrack(i+1, path)

DUPLICATE HANDLING: Sort first, then:
  if i > start and nums[i] == nums[i-1]: continue

Mnemonic: "CEO" - Choose, Explore, unchoOse`,
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
    memorization: `HOW TO MEMORIZE GRAPH ALGORITHMS:
Mnemonic: "BFS = Queue = Shortest. DFS = Stack/Recursion = Explore all."

BFS SKELETON (memorize for shortest path / level-order):
  queue = deque([start])
  visited = {start}
  while queue:
      node = queue.popleft()
      for neighbor in graph[node]:
          if neighbor not in visited:
              visited.add(neighbor)
              queue.append(neighbor)

DFS SKELETON:
  def dfs(node):
      visited.add(node)
      for neighbor in graph[node]:
          if neighbor not in visited:
              dfs(neighbor)

TOPOLOGICAL SORT (Kahn's - memorize as "peel the onion"):
  1. Count in-degrees
  2. Start with all 0-in-degree nodes
  3. Pop node, reduce neighbors' in-degrees
  4. Add new 0-in-degree nodes to queue
  Mnemonic: "Remove nodes with no dependencies, ripple through"

DIJKSTRA (memorize as "greedy BFS with a heap"):
  heap = [(0, start)]
  while heap: pop smallest, relax neighbors
  Key: skip if already found shorter (lazy deletion)

GRID PROBLEMS: "It's just a graph where neighbors are up/down/left/right"
  dirs = [(0,1),(0,-1),(1,0),(-1,0)]`,
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
    memorization: `HOW TO MEMORIZE DP:
DP is intimidating, but every problem follows the same 4 steps:
  1. DEFINE STATE: What does dp[i] (or dp[i][j]) represent?
  2. RECURRENCE: How does dp[i] relate to previous states?
  3. BASE CASE: What is dp[0] (or dp[0][0])?
  4. ANSWER: Where is the final answer? (dp[n], dp[n][m], max(dp))

Mnemonic: "DRBA" - Define, Recurrence, Base, Answer

THE 5 DP PATTERNS (covers 90% of problems):
  1. Linear: dp[i] = f(dp[i-1], dp[i-2]) → House Robber, Climbing Stairs
  2. Knapsack: dp[i] = min/max over dp[i-coin] → Coin Change, Partition
  3. Two-string: dp[i][j] = f(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) → LCS, Edit Distance
  4. Interval: dp[i][j] = f(dp[i][k], dp[k][j]) for k in range → Matrix Chain, Burst Balloons
  5. State machine: states = {hold, not_hold, cooldown} → Buy/Sell Stock

STARTING STRATEGY: Can't figure out the DP? Write brute-force recursion first, then add @lru_cache. That IS top-down DP.

0/1 vs UNBOUNDED KNAPSACK:
  0/1 (each item once): inner loop goes BACKWARD
  Unbounded (reuse items): inner loop goes FORWARD`,
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
    memorization: `HOW TO MEMORIZE GREEDY:
Greedy is the simplest concept but hardest to prove correct. The trick: memorize the PATTERNS, not the proofs.

PATTERN 1 - "Farthest reach" (Jump Game):
  farthest = 0
  for each i: farthest = max(farthest, i + nums[i])
  if i > farthest: stuck!

PATTERN 2 - "Sort by end, pick non-overlapping" (Interval Scheduling):
  Sort by end time. If current start >= last end, take it.

PATTERN 3 - "Deficit reset" (Gas Station):
  Track running tank. If tank < 0, restart from next station.

HOW TO KNOW IF GREEDY WORKS:
Ask yourself: "If I make the locally best choice, can it ever hurt me later?"
  - Yes → Use DP instead
  - No → Greedy works!

Mnemonic: "Greedy = sort + scan + local best choice"`,
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
    memorization: `HOW TO MEMORIZE INTERVAL PROBLEMS:
Rule #1: ALWAYS SORT FIRST. The only question is: by start or by end?
  - Merge intervals → sort by start
  - Scheduling / non-overlapping → sort by end

MERGE TEMPLATE (memorize this, it covers most interval problems):
  intervals.sort()
  merged = [intervals[0]]
  for s, e in intervals[1:]:
      if s <= merged[-1][1]:          # overlaps!
          merged[-1][1] = max(merged[-1][1], e)   # extend
      else:
          merged.append([s, e])       # new interval

MEETING ROOMS II (how many concurrent?):
Two approaches, memorize whichever clicks:
  1. Heap: sort by start, use min-heap of end times. If earliest end <= current start, pop it. Heap size = rooms needed.
  2. Sweep line: events = [(start, +1), (end, -1)], sort, running sum, track max.

Mnemonic: "Overlap = start of next <= end of current"`,
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
    memorization: `HOW TO MEMORIZE MATH & GEOMETRY:
MATRIX ROTATION 90° CW (most common):
  Step 1: Transpose (swap matrix[i][j] with matrix[j][i])
  Step 2: Reverse each row
  Mnemonic: "Transpose then Reverse = Rotate Right"

SPIRAL ORDER (memorize the 4-wall shrink):
  top, bottom, left, right = boundaries
  Go: right → down → left → up
  After each direction: shrink that boundary
  Mnemonic: "Clockwise = RDLU (Right Down Left Up), shrink after each"

DIGIT EXTRACTION:
  while n > 0:
      last_digit = n % 10
      n = n // 10
  Mnemonic: "Mod 10 peels, Div 10 shifts"

FAST POWER (x^n in O(log n)):
  result = 1
  while n > 0:
      if n is odd: result *= x
      x *= x; n //= 2
  Mnemonic: "Square x each time, multiply into result when bit is set"`,
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
    memorization: `HOW TO MEMORIZE BIT MANIPULATION:
THE 6 OPERATORS (memorize what each does to bits):
  &  AND:  1 & 1 = 1, else 0  → "Both must be 1"
  |  OR:   0 | 0 = 0, else 1  → "Either can be 1"
  ^  XOR:  same = 0, diff = 1 → "Toggle / cancel duplicates"
  ~  NOT:  flip all bits
  << LEFT SHIFT:  multiply by 2
  >> RIGHT SHIFT: divide by 2

THE 3 TRICKS YOU NEED (covers 90% of bit problems):
  1. XOR all elements: duplicates cancel → find the unique one
     result = 0; for num: result ^= num

  2. n & (n-1): removes the LOWEST set bit
     Use for: counting bits, checking power of 2
     Power of 2 check: n > 0 and n & (n-1) == 0

  3. n & 1: checks if last bit is set (odd/even)
     Extract bit i: (n >> i) & 1
     Set bit i: n | (1 << i)

Mnemonic: "XOR cancels twins. AND(n, n-1) kills the lowest bit."`,
  },

  'Concurrency': {
    topic: 'Concurrency',
    overview: `Concurrency problems test your understanding of thread synchronization - making multiple threads cooperate safely. The core challenge: threads run in unpredictable order (the OS schedules them), so you need primitives to enforce ordering, mutual exclusion, and coordination.

CORE PRIMITIVES (memorize these 5):
1. Lock (Mutex) - Only one thread can hold it. Use for protecting shared data.
2. Semaphore(n) - Allows up to n threads to pass. Like a bouncer allowing n people in.
3. Event/Condition - One thread signals, others wait. Like a starting gun.
4. Barrier(n) - Blocks until n threads arrive, then releases all. Like "ready, set, go!"
5. Queue - Thread-safe FIFO. The backbone of producer-consumer patterns.

THE 4 KEY PATTERNS:
1. Sequential ordering: Use Events to chain thread execution (A -> B -> C)
2. Alternating/turn-taking: Use paired Semaphores as ping-pong signals
3. Producer-Consumer: Use Semaphores for capacity + Lock for data protection
4. Resource allocation: Use Semaphores to limit concurrency + Locks for resources

DEADLOCK - THE ENEMY:
Deadlock requires ALL 4 conditions (break any one to prevent it):
1. Mutual exclusion - resource held exclusively
2. Hold and wait - hold one resource while waiting for another
3. No preemption - can't forcibly take a resource
4. Circular wait - A waits for B, B waits for A

MEMORIZATION TECHNIQUE - "The Semaphore Mental Model":
Think of a Semaphore(n) as a jar with n tokens:
- acquire() = take a token out (blocks if jar is empty)
- release() = put a token back in
- Semaphore(0) = starts empty = "wait for a signal"
- Semaphore(1) = acts like a Lock/Mutex
- Semaphore(n) = allows n concurrent threads`,
    keyPatterns: [
      'Sequential ordering: Event chain - each step sets the next Event (Print in Order)',
      'Alternating execution: Two Semaphores as ping-pong - release the other after your turn (FooBar)',
      'Producer-Consumer: Semaphore(capacity) for empty slots + Semaphore(0) for full slots + Lock (Blocking Queue)',
      'Resource grouping: Semaphore for ratio + Barrier for grouping (H2O)',
      'Deadlock prevention: Limit concurrency with Semaphore(n-1) to break circular wait (Dining Philosophers)',
      'Dispatcher pattern: One master thread decides who acts next via targeted semaphore release (FizzBuzz)',
    ],
    template: `# ============================================================
# TEMPLATE 1: Sequential Ordering (Print in Order pattern)
# Mnemonic: "Chain of Events" - each step lights the next fuse
# ============================================================
import threading

class Sequential:
    def __init__(self):
        self.event1 = threading.Event()  # gate between step 1 and 2
        self.event2 = threading.Event()  # gate between step 2 and 3

    def step1(self, action):
        action()              # do work
        self.event1.set()     # open gate for step 2

    def step2(self, action):
        self.event1.wait()    # wait for step 1
        action()              # do work
        self.event2.set()     # open gate for step 3

    def step3(self, action):
        self.event2.wait()    # wait for step 2
        action()

# ============================================================
# TEMPLATE 2: Alternating / Turn-taking (FooBar pattern)
# Mnemonic: "Ping-Pong Semaphores" - pass the ball back and forth
# ============================================================
class Alternating:
    def __init__(self, n):
        self.n = n
        self.sem_a = threading.Semaphore(1)  # A goes first
        self.sem_b = threading.Semaphore(0)  # B waits

    def thread_a(self, action):
        for _ in range(self.n):
            self.sem_a.acquire()   # wait for my turn
            action()               # do work
            self.sem_b.release()   # signal B's turn

    def thread_b(self, action):
        for _ in range(self.n):
            self.sem_b.acquire()   # wait for my turn
            action()               # do work
            self.sem_a.release()   # signal A's turn

# ============================================================
# TEMPLATE 3: Producer-Consumer (Bounded Blocking Queue)
# Mnemonic: "Two Jars" - empty_slots jar + full_slots jar
# ============================================================
from collections import deque

class ProducerConsumer:
    def __init__(self, capacity):
        self.queue = deque()
        self.lock = threading.Lock()
        self.empty = threading.Semaphore(capacity)  # counts empty slots
        self.full = threading.Semaphore(0)           # counts items

    def produce(self, item):
        self.empty.acquire()     # wait for empty slot
        with self.lock:
            self.queue.append(item)
        self.full.release()      # signal: item available

    def consume(self):
        self.full.acquire()      # wait for item
        with self.lock:
            item = self.queue.popleft()
        self.empty.release()     # signal: slot freed
        return item

# ============================================================
# TEMPLATE 4: Deadlock Prevention (Dining Philosophers)
# Mnemonic: "One Less Chair" - limit diners to n-1
# ============================================================
class DeadlockFree:
    def __init__(self, n_resources):
        self.resources = [threading.Lock() for _ in range(n_resources)]
        self.limit = threading.Semaphore(n_resources - 1)  # one less!

    def use_resources(self, left, right, action):
        self.limit.acquire()
        self.resources[left].acquire()
        self.resources[right].acquire()
        action()
        self.resources[right].release()
        self.resources[left].release()
        self.limit.release()

# ============================================================
# TEMPLATE 5: Barrier Grouping (H2O pattern)
# Mnemonic: "Bouncer + Barrier" - control ratio then group
# ============================================================
class GroupBarrier:
    def __init__(self):
        self.sem_type_a = threading.Semaphore(2)  # allow 2 of type A
        self.sem_type_b = threading.Semaphore(1)  # allow 1 of type B
        self.barrier = threading.Barrier(3)        # group of 3

    def type_a(self, action):
        self.sem_type_a.acquire()
        self.barrier.wait()      # wait for full group
        action()
        self.sem_type_a.release()

    def type_b(self, action):
        self.sem_type_b.acquire()
        self.barrier.wait()      # wait for full group
        action()
        self.sem_type_b.release()`,
    complexity: 'Concurrency primitives are O(1) for acquire/release. Total work is O(n) where n is the number of operations. The key cost is blocking/waiting time, not CPU time.',
    commonMistakes: [
      'Deadlock: acquiring locks in inconsistent order across threads',
      'Forgetting to release a lock/semaphore in error paths (use "with" statement)',
      'Using Semaphore(1) when you actually need a Lock (Lock is re-entrant aware)',
      'Race condition: reading shared state without holding a lock',
      'Starvation: one thread always wins the lock while others wait forever',
      'Not signaling termination: worker threads loop forever after main is done',
    ],
    tips: [
      'MEMORIZE THIS: Semaphore(0) = "wait for signal", Semaphore(1) = "mutex", Semaphore(n) = "allow n threads"',
      'For ordering problems, draw the dependency graph first, then add one Event per edge',
      'For alternating patterns, always use TWO semaphores with initial values (1, 0)',
      'For deadlock prevention, the simplest fix is Semaphore(n-1) to break circular wait',
      'Producer-Consumer = two semaphores counting opposite things (empty + full = capacity)',
      'When in doubt, use a Lock to protect shared data and Semaphores to coordinate timing',
      'Python tip: "with lock:" is safer than lock.acquire()/release() because it handles exceptions',
    ],
    memorization: `HOW TO MEMORIZE CONCURRENCY:
Think of concurrency primitives as PHYSICAL OBJECTS:

  Lock/Mutex = A bathroom door lock. Only one person at a time.
  Semaphore(n) = A parking lot with n spots. Full? Wait in line.
  Event = A starting pistol. Everyone waits, one person fires.
  Barrier(n) = A restaurant that only seats groups of n.
  Condition = A waiting room with an announcement speaker.

THE 5 TEMPLATES MAP TO 5 REAL-WORLD SCENARIOS:
  1. Sequential (Events): Relay race - pass the baton
  2. Alternating (2 Semaphores): Tennis - your turn, my turn
  3. Producer-Consumer (2 Semaphores + Lock): Assembly line with limited conveyor belt
  4. Deadlock prevention (Semaphore(n-1)): Musical chairs - fewer chairs than people guarantees someone always sits
  5. Grouping (Semaphore + Barrier): Elevator - waits for exact capacity

SEMAPHORE CHEAT SHEET:
  Semaphore(0)  →  gate starts CLOSED  →  "wait for a signal"
  Semaphore(1)  →  gate starts OPEN    →  acts like a Lock/Mutex
  Semaphore(n)  →  allows n through    →  rate limiter

DEADLOCK PREVENTION (memorize the 4 conditions, break ANY one):
  1. Mutual exclusion    → can't usually avoid
  2. Hold and wait       → request all resources at once
  3. No preemption       → allow timeouts / try-lock
  4. Circular wait       → order resources OR limit concurrency (Semaphore(n-1))

Mnemonic: "MHNC" - Mutual exclusion, Hold-and-wait, No preemption, Circular wait`,
  },
};

import { ProblemSolution } from './types';

export const solutions: ProblemSolution[] = [
  // ===========================================================================
  // UNION FIND
  // ===========================================================================

  // 547. Number of Provinces
  {
    id: 547,
    description:
      'There are n cities. Some of them are connected while some are not. If city a is connected to city b and city b is connected to city c, then a is connected to c. A province is a group of connected cities. Given the adjacency matrix isConnected, return the number of provinces.',
    examples:
      'Input: isConnected = [[1,1,0],[1,1,0],[0,0,1]]\nOutput: 2\nExplanation: Cities 0 and 1 form one province, city 2 forms another.',
    intuition:
      'Each city starts as its own province. When two cities are connected, their provinces merge into one. This is exactly what Union-Find does: start with n separate sets, union connected cities, then count remaining distinct sets. Every time you merge two provinces, the total count drops by 1.',
    approach:
      'Initialize Union-Find with n elements. For each edge (i,j) where isConnected[i][j] == 1, union(i, j). The answer is the number of distinct roots (elements where find(x) == x).',
    code: `def findCircleNum(isConnected):
    n = len(isConnected)
    parent = list(range(n))
    rank = [0] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # path compression
            x = parent[x]
        return x

    def union(x, y):
        px, py = find(x), find(y)
        if px == py: return False
        if rank[px] < rank[py]: px, py = py, px
        parent[py] = px
        if rank[px] == rank[py]: rank[px] += 1
        return True

    provinces = n
    for i in range(n):
        for j in range(i + 1, n):
            if isConnected[i][j] == 1:
                if union(i, j):
                    provinces -= 1
    return provinces`,
    jsCode: `var findCircleNum = function(isConnected) {
    const n = isConnected.length;
    const parent = Array.from({length: n}, (_, i) => i);
    const rank = new Array(n).fill(0);

    function find(x) {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    function union(x, y) {
        let px = find(x), py = find(y);
        if (px === py) return false;
        if (rank[px] < rank[py]) [px, py] = [py, px];
        parent[py] = px;
        if (rank[px] === rank[py]) rank[px]++;
        return true;
    }

    let provinces = n;
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
            if (isConnected[i][j] === 1 && union(i, j)) provinces--;
    return provinces;
};`,
    explanation:
      '1. Each city starts as its own parent (self-loop).\n' +
      '2. find(x) follows parent pointers to the root, with path compression.\n' +
      '3. union(x, y) merges two sets by rank (attach shorter tree under taller).\n' +
      '4. For each connection, try to union. If union succeeds (they were in different sets), decrement province count.\n' +
      '5. Path compression + union by rank gives nearly O(1) amortized per operation.',
    timeComplexity: 'O(n^2 * alpha(n)) where alpha is inverse Ackermann (practically O(n^2))',
    spaceComplexity: 'O(n)',
    hints: [
      'Union-Find is perfect when you need to track connected components dynamically.',
      'Path compression: parent[x] = parent[parent[x]] halves the path each time.',
      'Union by rank keeps trees balanced.',
    ],
  },

  // 684. Redundant Connection
  {
    id: 684,
    description:
      'A tree is a connected graph with no cycles. Given a graph that started as a tree with n nodes and had one extra edge added, find the edge that can be removed to make it a tree again. If multiple answers, return the one that occurs last in the input.',
    examples:
      'Input: edges = [[1,2],[1,3],[2,3]]\nOutput: [2,3]\nExplanation: Removing [2,3] makes the graph a tree.',
    intuition:
      'Process edges one by one. Each edge either connects two separate components (safe) or connects two nodes already in the same component (creates a cycle). The first edge that creates a cycle is the redundant one. Since we want the last such edge in input order, we just process sequentially and the last failed union is our answer.',
    approach:
      'Use Union-Find. For each edge, try to union the two nodes. If they already share the same root, this edge creates a cycle - return it.',
    code: `def findRedundantConnection(edges):
    n = len(edges)
    parent = list(range(n + 1))
    rank = [0] * (n + 1)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x, y):
        px, py = find(x), find(y)
        if px == py: return False
        if rank[px] < rank[py]: px, py = py, px
        parent[py] = px
        if rank[px] == rank[py]: rank[px] += 1
        return True

    for u, v in edges:
        if not union(u, v):
            return [u, v]`,
    jsCode: `var findRedundantConnection = function(edges) {
    const n = edges.length;
    const parent = Array.from({length: n + 1}, (_, i) => i);
    const rank = new Array(n + 1).fill(0);
    function find(x) {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    function union(x, y) {
        let px = find(x), py = find(y);
        if (px === py) return false;
        if (rank[px] < rank[py]) [px, py] = [py, px];
        parent[py] = px;
        if (rank[px] === rank[py]) rank[px]++;
        return true;
    }
    for (const [u, v] of edges) {
        if (!union(u, v)) return [u, v];
    }
};`,
    explanation:
      '1. Initialize UF with n+1 nodes (1-indexed).\n' +
      '2. Process edges in order. For each (u, v), try union.\n' +
      '3. If find(u) === find(v), they are already connected → this edge creates a cycle.\n' +
      '4. Return the first cycle-creating edge we find (which is the last one in input since a tree with one extra edge has exactly one cycle).',
    timeComplexity: 'O(n * alpha(n))',
    spaceComplexity: 'O(n)',
    hints: [
      'An edge is redundant if it connects two nodes that are already in the same component.',
      'Union-Find detects this naturally: if find(u) == find(v) before union, it\'s a cycle.',
    ],
  },

  // ===========================================================================
  // MONOTONIC QUEUE
  // ===========================================================================

  // 239. Sliding Window Maximum
  {
    id: 239,
    description:
      'Given an array nums and a sliding window of size k moving from left to right, return the max value in each window position.',
    examples:
      'Input: nums = [1,3,-1,-3,5,3,6,7], k = 3\nOutput: [3,3,5,5,6,7]\nExplanation: Window [1,3,-1] max=3, [3,-1,-3] max=3, [-1,-3,5] max=5, ...',
    intuition:
      'A brute force approach checks all k elements per window: O(nk). The key insight: if a newer element is larger than an older one, the older one can NEVER be the max for any future window. So we maintain a deque of "candidates" in decreasing order. The front is always the current max. When we slide right, we remove elements that fell out of the window (too old) and elements smaller than the new one (they lost).',
    approach:
      'Use a monotonic decreasing deque storing indices. For each new element: (1) remove front if it\'s outside the window, (2) remove all back elements smaller than current (they\'re useless), (3) add current to back. The front of the deque is the window max.',
    code: `from collections import deque

def maxSlidingWindow(nums, k):
    dq = deque()  # stores indices, values are decreasing
    result = []
    for i in range(len(nums)):
        # Remove elements outside window
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        # Remove smaller elements (they can never be max)
        while dq and nums[dq[-1]] <= nums[i]:
            dq.pop()
        dq.append(i)
        # Window is full, record result
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result`,
    jsCode: `var maxSlidingWindow = function(nums, k) {
    const dq = []; // indices, values decreasing
    const result = [];
    for (let i = 0; i < nums.length; i++) {
        while (dq.length && dq[0] < i - k + 1) dq.shift();
        while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
        dq.push(i);
        if (i >= k - 1) result.push(nums[dq[0]]);
    }
    return result;
};`,
    explanation:
      '1. The deque stores indices in decreasing order of their values.\n' +
      '2. Front removal: if dq[0] < i - k + 1, that element left the window.\n' +
      '3. Back removal: if nums[back] <= nums[i], the back element can never be a future max (current is newer AND larger).\n' +
      '4. After cleanup, append i. The front is always the max of the current window.\n' +
      '5. Each element enters and leaves the deque at most once → O(n) total.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k)',
    hints: [
      'The deque maintains a "hall of fame" - only elements that could potentially be a future window max.',
      'Values in the deque are always decreasing. The front is the current king.',
      'This is the canonical monotonic deque problem.',
    ],
  },

  // 1438. Longest Continuous Subarray With Absolute Diff <= Limit
  {
    id: 1438,
    description:
      'Given an array nums and an integer limit, return the size of the longest subarray such that the absolute difference between any two elements is less than or equal to limit.',
    examples:
      'Input: nums = [8,2,4,7], limit = 4\nOutput: 2\nExplanation: [2,4] has max diff |4-2| = 2 <= 4.',
    intuition:
      'The absolute difference between any two elements equals max - min. So we need the longest window where max - min <= limit. Use TWO monotonic deques: one tracks the window max (decreasing deque), one tracks the window min (increasing deque). Expand right, and shrink left when max - min > limit.',
    approach:
      'Sliding window with two deques. maxDq stores indices in decreasing value order (front = max). minDq stores indices in increasing value order (front = min). When max - min > limit, shrink by moving left pointer and removing expired front elements.',
    code: `from collections import deque

def longestSubarray(nums, limit):
    max_dq = deque()  # decreasing - front is max
    min_dq = deque()  # increasing - front is min
    left = result = 0
    for right in range(len(nums)):
        while max_dq and nums[max_dq[-1]] <= nums[right]:
            max_dq.pop()
        while min_dq and nums[min_dq[-1]] >= nums[right]:
            min_dq.pop()
        max_dq.append(right)
        min_dq.append(right)
        while nums[max_dq[0]] - nums[min_dq[0]] > limit:
            left += 1
            if max_dq[0] < left: max_dq.popleft()
            if min_dq[0] < left: min_dq.popleft()
        result = max(result, right - left + 1)
    return result`,
    jsCode: `var longestSubarray = function(nums, limit) {
    const maxDq = [], minDq = [];
    let left = 0, result = 0;
    for (let right = 0; right < nums.length; right++) {
        while (maxDq.length && nums[maxDq[maxDq.length-1]] <= nums[right]) maxDq.pop();
        while (minDq.length && nums[minDq[minDq.length-1]] >= nums[right]) minDq.pop();
        maxDq.push(right);
        minDq.push(right);
        while (nums[maxDq[0]] - nums[minDq[0]] > limit) {
            left++;
            if (maxDq[0] < left) maxDq.shift();
            if (minDq[0] < left) minDq.shift();
        }
        result = Math.max(result, right - left + 1);
    }
    return result;
};`,
    explanation:
      '1. Two deques track window max and min simultaneously.\n' +
      '2. For each right, maintain both deques (remove dominated elements from back).\n' +
      '3. If max - min > limit, shrink window from left.\n' +
      '4. Remove deque fronts if they fell out of the window.\n' +
      '5. Track the longest valid window.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'max - min of a subarray is the key constraint, not individual differences.',
      'Two deques: one for max (decreasing), one for min (increasing).',
      'This is sliding window + monotonic deque combined.',
    ],
  },

  // ===========================================================================
  // DIVIDE & CONQUER
  // ===========================================================================

  // 215. Kth Largest Element in an Array
  {
    id: 215,
    description:
      'Given an integer array nums and an integer k, return the kth largest element. Note that it is the kth largest element in sorted order, not the kth distinct element.',
    examples:
      'Input: nums = [3,2,1,5,6,4], k = 2\nOutput: 5\n\nInput: nums = [3,2,3,1,2,4,5,5,6], k = 4\nOutput: 4',
    intuition:
      'Sorting gives O(n log n) but we only need ONE element, not all of them sorted. Quickselect is like quicksort but only recurses into the side containing the target index. On average, this is O(n) because each step halves the search space: n + n/2 + n/4 + ... = 2n.',
    approach:
      'Use Quickselect (Hoare\'s algorithm). Partition around a pivot. If the pivot lands at the target index, done. If target is left of pivot, recurse left. Otherwise, recurse right. The kth largest is the (n-k)th smallest.',
    code: `import random

def findKthLargest(nums, k):
    target = len(nums) - k  # convert to 0-indexed kth smallest

    def quickselect(left, right):
        pivot_idx = random.randint(left, right)
        nums[pivot_idx], nums[right] = nums[right], nums[pivot_idx]
        pivot = nums[right]
        store = left
        for i in range(left, right):
            if nums[i] <= pivot:
                nums[store], nums[i] = nums[i], nums[store]
                store += 1
        nums[store], nums[right] = nums[right], nums[store]

        if store == target:
            return nums[store]
        elif store < target:
            return quickselect(store + 1, right)
        else:
            return quickselect(left, store - 1)

    return quickselect(0, len(nums) - 1)`,
    jsCode: `var findKthLargest = function(nums, k) {
    const target = nums.length - k;
    function quickselect(left, right) {
        const pivotIdx = left + Math.floor(Math.random() * (right - left + 1));
        [nums[pivotIdx], nums[right]] = [nums[right], nums[pivotIdx]];
        const pivot = nums[right];
        let store = left;
        for (let i = left; i < right; i++) {
            if (nums[i] <= pivot) {
                [nums[store], nums[i]] = [nums[i], nums[store]];
                store++;
            }
        }
        [nums[store], nums[right]] = [nums[right], nums[store]];
        if (store === target) return nums[store];
        else if (store < target) return quickselect(store + 1, right);
        else return quickselect(left, store - 1);
    }
    return quickselect(0, nums.length - 1);
};`,
    explanation:
      '1. Convert "kth largest" to "target = n-k" (0-indexed position in sorted order).\n' +
      '2. Pick a random pivot, partition array: smaller elements left, larger right.\n' +
      '3. If pivot lands at target index, return it.\n' +
      '4. Otherwise recurse into the side containing target.\n' +
      '5. Random pivot avoids worst-case O(n^2) in practice.',
    timeComplexity: 'O(n) average, O(n^2) worst case',
    spaceComplexity: 'O(1) iterative, O(log n) recursive',
    hints: [
      'Quickselect = quicksort that only recurses into one side.',
      'Random pivot selection prevents worst-case behavior.',
      'kth largest = (n-k)th smallest in 0-indexed.',
    ],
  },

  // 912. Sort an Array (Merge Sort)
  {
    id: 912,
    description:
      'Given an array of integers nums, sort the array in ascending order and return it. You must solve it in O(n log n) time and with the smallest space possible.',
    examples:
      'Input: nums = [5,2,3,1]\nOutput: [1,2,3,5]',
    intuition:
      'Merge sort is the canonical divide-and-conquer sort. Split the array in half, recursively sort each half, then merge the two sorted halves. The key insight: merging two sorted arrays is O(n) and we do O(log n) levels of splitting, giving O(n log n) total.',
    approach:
      'Recursively split array at midpoint. Base case: array of length 0 or 1 is sorted. Merge step: use two pointers to merge two sorted arrays into one.',
    code: `def sortArray(nums):
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = sortArray(nums[:mid])
    right = sortArray(nums[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
    jsCode: `var sortArray = function(nums) {
    if (nums.length <= 1) return nums;
    const mid = Math.floor(nums.length / 2);
    const left = sortArray(nums.slice(0, mid));
    const right = sortArray(nums.slice(mid));
    return merge(left, right);
};

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) result.push(left[i++]);
        else result.push(right[j++]);
    }
    while (i < left.length) result.push(left[i++]);
    while (j < right.length) result.push(right[j++]);
    return result;
}`,
    explanation:
      '1. Split: Divide array at midpoint into two halves.\n' +
      '2. Conquer: Recursively sort each half (base case: length <= 1).\n' +
      '3. Combine: Merge two sorted halves with two pointers.\n' +
      '4. The merge step is O(n) per level, and there are O(log n) levels.\n' +
      '5. Merge sort is stable (preserves relative order of equal elements).',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Split in half, sort each half, merge. That\'s the entire algorithm.',
      'The merge step uses two pointers on two sorted arrays.',
      'Merge sort is preferred when stability matters or for linked lists.',
    ],
  },

  // ===========================================================================
  // SEGMENT TREE
  // ===========================================================================

  // 307. Range Sum Query - Mutable
  {
    id: 307,
    description:
      'Given an integer array nums, handle two types of queries: (1) update(index, val) - set nums[index] = val, (2) sumRange(left, right) - return sum of nums[left..right].',
    examples:
      'Input: nums = [1, 3, 5]\nsumRange(0, 2) -> 9\nupdate(1, 2)\nsumRange(0, 2) -> 8',
    intuition:
      'A prefix sum gives O(1) query but O(n) update. A naive approach gives O(1) update but O(n) query. A segment tree gives O(log n) for BOTH by storing partial sums in a binary tree. Each leaf is one element, each internal node stores the sum of its children\'s range. Updates propagate up, queries combine relevant segments.',
    approach:
      'Build a segment tree as an array of size 4n. Each node covers a range. To update: walk down to the leaf, update, propagate up. To query: if current node\'s range is fully inside query range, return its value; otherwise split and recurse on children.',
    code: `class NumArray:
    def __init__(self, nums):
        self.n = len(nums)
        self.tree = [0] * (4 * self.n)
        self._build(nums, 1, 0, self.n - 1)

    def _build(self, nums, node, start, end):
        if start == end:
            self.tree[node] = nums[start]
            return
        mid = (start + end) // 2
        self._build(nums, 2*node, start, mid)
        self._build(nums, 2*node+1, mid+1, end)
        self.tree[node] = self.tree[2*node] + self.tree[2*node+1]

    def update(self, index, val):
        self._update(1, 0, self.n - 1, index, val)

    def _update(self, node, start, end, idx, val):
        if start == end:
            self.tree[node] = val
            return
        mid = (start + end) // 2
        if idx <= mid:
            self._update(2*node, start, mid, idx, val)
        else:
            self._update(2*node+1, mid+1, end, idx, val)
        self.tree[node] = self.tree[2*node] + self.tree[2*node+1]

    def sumRange(self, left, right):
        return self._query(1, 0, self.n - 1, left, right)

    def _query(self, node, start, end, l, r):
        if r < start or end < l: return 0
        if l <= start and end <= r: return self.tree[node]
        mid = (start + end) // 2
        return (self._query(2*node, start, mid, l, r) +
                self._query(2*node+1, mid+1, end, l, r))`,
    jsCode: `class NumArray {
    constructor(nums) {
        this.n = nums.length;
        this.tree = new Array(4 * this.n).fill(0);
        this._build(nums, 1, 0, this.n - 1);
    }
    _build(nums, node, start, end) {
        if (start === end) { this.tree[node] = nums[start]; return; }
        const mid = Math.floor((start + end) / 2);
        this._build(nums, 2*node, start, mid);
        this._build(nums, 2*node+1, mid+1, end);
        this.tree[node] = this.tree[2*node] + this.tree[2*node+1];
    }
    update(index, val) { this._update(1, 0, this.n-1, index, val); }
    _update(node, start, end, idx, val) {
        if (start === end) { this.tree[node] = val; return; }
        const mid = Math.floor((start + end) / 2);
        if (idx <= mid) this._update(2*node, start, mid, idx, val);
        else this._update(2*node+1, mid+1, end, idx, val);
        this.tree[node] = this.tree[2*node] + this.tree[2*node+1];
    }
    sumRange(left, right) { return this._query(1, 0, this.n-1, left, right); }
    _query(node, start, end, l, r) {
        if (r < start || end < l) return 0;
        if (l <= start && end <= r) return this.tree[node];
        const mid = Math.floor((start + end) / 2);
        return this._query(2*node, start, mid, l, r) +
               this._query(2*node+1, mid+1, end, l, r);
    }
}`,
    explanation:
      '1. Build: Recursively split array into halves. Leaves store individual elements. Parents store sum of children.\n' +
      '2. Update: Walk from root to leaf, update the leaf, then recalculate sums going back up.\n' +
      '3. Query: If node\'s range is fully contained in query, return it. If no overlap, return 0. Otherwise split.\n' +
      '4. Tree is stored as flat array: node i has children at 2i and 2i+1.\n' +
      '5. Both operations traverse O(log n) levels of the tree.',
    timeComplexity: 'O(n) build, O(log n) update, O(log n) query',
    spaceComplexity: 'O(n)',
    hints: [
      'Segment tree = binary tree where each node covers a range of the array.',
      'Node i\'s children are 2i and 2i+1. Allocate 4n space to be safe.',
      'Three cases in query: full overlap (return), no overlap (return 0), partial (split).',
    ],
  },

  // ===========================================================================
  // STRING ALGORITHMS
  // ===========================================================================

  // 28. Find the Index of the First Occurrence in a String
  {
    id: 28,
    description:
      'Given two strings haystack and needle, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.',
    examples:
      'Input: haystack = "sadbutsad", needle = "sad"\nOutput: 0\n\nInput: haystack = "leetcode", needle = "leeto"\nOutput: -1',
    intuition:
      'Brute force checks every starting position in O(n*m). KMP preprocesses the pattern to build a "failure function" (also called LPS - Longest Proper Prefix which is also Suffix). When a mismatch occurs, instead of restarting from scratch, KMP uses the failure function to skip ahead, knowing that some prefix of the pattern already matches. This gives O(n+m).',
    approach:
      'Build the KMP failure table (lps array) for the needle. Then scan haystack with two pointers: one for haystack, one for needle. On mismatch, use lps to skip ahead in needle instead of resetting.',
    code: `def strStr(haystack, needle):
    if not needle: return 0

    # Build LPS (failure function)
    lps = [0] * len(needle)
    length = 0
    i = 1
    while i < len(needle):
        if needle[i] == needle[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length > 0:
            length = lps[length - 1]
        else:
            lps[i] = 0
            i += 1

    # KMP search
    i = j = 0  # i for haystack, j for needle
    while i < len(haystack):
        if haystack[i] == needle[j]:
            i += 1
            j += 1
            if j == len(needle):
                return i - j
        elif j > 0:
            j = lps[j - 1]
        else:
            i += 1
    return -1`,
    jsCode: `var strStr = function(haystack, needle) {
    if (!needle.length) return 0;
    // Build LPS
    const lps = new Array(needle.length).fill(0);
    let len = 0, i = 1;
    while (i < needle.length) {
        if (needle[i] === needle[len]) { len++; lps[i] = len; i++; }
        else if (len > 0) { len = lps[len - 1]; }
        else { lps[i] = 0; i++; }
    }
    // KMP search
    i = 0; let j = 0;
    while (i < haystack.length) {
        if (haystack[i] === needle[j]) {
            i++; j++;
            if (j === needle.length) return i - j;
        } else if (j > 0) { j = lps[j - 1]; }
        else { i++; }
    }
    return -1;
};`,
    explanation:
      '1. LPS array: lps[i] = length of longest proper prefix of needle[0..i] that is also a suffix.\n' +
      '2. Build LPS by comparing needle against itself, tracking matched prefix length.\n' +
      '3. Search: advance both pointers on match. On mismatch, jump j back to lps[j-1] (skip the part that already matches).\n' +
      '4. When j reaches needle length, we found a match at position i - j.\n' +
      '5. Both LPS build and search are O(n) — no character is compared more than twice.',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(m) for LPS array',
    hints: [
      'LPS array is the heart of KMP. It tells you "how far back to jump" on mismatch.',
      'lps[j-1] means: this many characters of the pattern still match, so don\'t re-check them.',
      'Alternative: Rabin-Karp uses rolling hash for O(n+m) average with simpler code.',
    ],
  },

  // 459. Repeated Substring Pattern
  {
    id: 459,
    description:
      'Given a string s, check if it can be constructed by taking a substring and repeating it multiple times.',
    examples:
      'Input: s = "abab"\nOutput: true (s = "ab" + "ab")\n\nInput: s = "abcabcabc"\nOutput: true (s = "abc" repeated 3 times)',
    intuition:
      'There\'s an elegant trick: concatenate s with itself to get s+s. Remove the first and last character (so you don\'t find the original trivially). If s appears in this modified string, then s is a repeated pattern. Why? Because if s = p*k, then s+s = p*2k, and removing endpoints still leaves enough copies. Alternatively, use KMP: if lps[n-1] > 0 and n % (n - lps[n-1]) == 0, then s is a repeated pattern.',
    approach:
      'Method 1: Check if s is in (s+s)[1:-1]. Method 2: Build KMP lps array, check if n % (n - lps[n-1]) == 0.',
    code: `def repeatedSubstringPattern(s):
    # Elegant O(n) method using KMP
    n = len(s)
    lps = [0] * n
    length = 0
    i = 1
    while i < n:
        if s[i] == s[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length > 0:
            length = lps[length - 1]
        else:
            i += 1
    # If lps[n-1] > 0 and the remaining part divides n evenly
    return lps[n-1] > 0 and n % (n - lps[n-1]) == 0`,
    jsCode: `var repeatedSubstringPattern = function(s) {
    // Simple string method
    return (s + s).slice(1, -1).includes(s);

    // Or KMP method:
    // const n = s.length, lps = new Array(n).fill(0);
    // let len = 0, i = 1;
    // while (i < n) {
    //     if (s[i] === s[len]) { len++; lps[i] = len; i++; }
    //     else if (len > 0) len = lps[len - 1];
    //     else i++;
    // }
    // return lps[n-1] > 0 && n % (n - lps[n-1]) === 0;
};`,
    explanation:
      '1. KMP approach: Build the LPS array for string s.\n' +
      '2. lps[n-1] tells us the longest proper prefix that is also a suffix.\n' +
      '3. The "repeating unit" length is n - lps[n-1].\n' +
      '4. If this unit length divides n evenly, the whole string is built from repeating that unit.\n' +
      '5. String trick: (s+s)[1:-1] removes trivial matches, so finding s means it repeats.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The (s+s)[1:-1] trick is easy to remember for interviews.',
      'KMP LPS gives deeper understanding: lps[n-1] reveals the repeating structure.',
      'Repeating unit length = n - lps[n-1]. Check if it divides n.',
    ],
  },

  // ===========================================================================
  // MINIMUM SPANNING TREE
  // ===========================================================================

  // 1584. Min Cost to Connect All Points
  {
    id: 1584,
    description:
      'Given an array of points where points[i] = [xi, yi], return the minimum cost to connect all points. The cost of connecting two points is their Manhattan distance |xi - xj| + |yi - yj|. All points must be connected with exactly n-1 edges (a spanning tree).',
    examples:
      'Input: points = [[0,0],[2,2],[3,10],[5,2],[7,0]]\nOutput: 20',
    intuition:
      'This is the textbook Minimum Spanning Tree problem. Kruskal\'s algorithm: sort all edges by weight, greedily add the cheapest edge that doesn\'t create a cycle (use Union-Find to check). After n-1 edges, all nodes are connected with minimum total cost. Prim\'s is the alternative: start from any node, always add the cheapest edge to an unvisited node.',
    approach:
      'Generate all edges with Manhattan distances. Sort by distance. Use Kruskal\'s with Union-Find: add edges greedily, skip if it would create a cycle. Stop after n-1 edges.',
    code: `def minCostConnectPoints(points):
    n = len(points)
    parent = list(range(n))
    rank = [0] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x, y):
        px, py = find(x), find(y)
        if px == py: return False
        if rank[px] < rank[py]: px, py = py, px
        parent[py] = px
        if rank[px] == rank[py]: rank[px] += 1
        return True

    # Generate all edges
    edges = []
    for i in range(n):
        for j in range(i + 1, n):
            dist = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
            edges.append((dist, i, j))
    edges.sort()

    # Kruskal's
    total = edges_used = 0
    for dist, u, v in edges:
        if union(u, v):
            total += dist
            edges_used += 1
            if edges_used == n - 1:
                break
    return total`,
    jsCode: `var minCostConnectPoints = function(points) {
    const n = points.length;
    const parent = Array.from({length: n}, (_, i) => i);
    const rank = new Array(n).fill(0);
    function find(x) {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    function union(x, y) {
        let px = find(x), py = find(y);
        if (px === py) return false;
        if (rank[px] < rank[py]) [px, py] = [py, px];
        parent[py] = px;
        if (rank[px] === rank[py]) rank[px]++;
        return true;
    }
    const edges = [];
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
            const dist = Math.abs(points[i][0]-points[j][0]) + Math.abs(points[i][1]-points[j][1]);
            edges.push([dist, i, j]);
        }
    edges.sort((a, b) => a[0] - b[0]);
    let total = 0, used = 0;
    for (const [dist, u, v] of edges) {
        if (union(u, v)) { total += dist; used++; if (used === n-1) break; }
    }
    return total;
};`,
    explanation:
      '1. Generate all n*(n-1)/2 edges with Manhattan distances.\n' +
      '2. Sort edges by distance (cheapest first).\n' +
      '3. Greedily add edges: if union(u,v) succeeds (no cycle), add the edge cost.\n' +
      '4. Stop when we have n-1 edges (tree connecting all n nodes).\n' +
      '5. Kruskal\'s guarantees minimum total cost because we always pick the cheapest safe edge.',
    timeComplexity: 'O(n^2 log n) for sorting all edges',
    spaceComplexity: 'O(n^2) for edge list',
    hints: [
      'Kruskal\'s = sort edges + Union-Find. Prim\'s = heap + visited set.',
      'MST has exactly n-1 edges for n nodes.',
      'For dense graphs (many edges), Prim\'s with heap can be faster.',
    ],
  },
];

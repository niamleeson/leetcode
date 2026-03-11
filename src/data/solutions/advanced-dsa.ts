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

    // Each city starts as its own parent (its own province)
    const parent = Array.from({ length: n }, (_, i) => i);
    const rank = new Array(n).fill(0);

    // Find root of x with path compression (halve path each time)
    function find(x) {
        while (parent[x] !== x) {
            // Path compression: skip one level up
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }

    // Merge two sets by rank; return false if already in same set
    function union(x, y) {
        const rootX = find(x);
        const rootY = find(y);

        if (rootX === rootY) {
            // Already in the same province
            return false;
        }

        // Attach smaller-rank tree under larger-rank tree
        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            // Equal rank: pick rootX as new root, bump its rank
            parent[rootY] = rootX;
            rank[rootX]++;
        }

        return true;
    }

    // Start with n provinces (one per city)
    let provinces = n;

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (isConnected[i][j] === 1) {
                // If union merges two separate provinces, total drops by 1
                if (union(i, j)) {
                    provinces--;
                }
            }
        }
    }

    return provinces;
};`,
    jsWalkthrough:
      'isConnected = [[1,1,0],[1,1,0],[0,0,1]]  (3 cities)\n\n' +
      'Initial state:\n' +
      '  parent = [0, 1, 2]   rank = [0, 0, 0]   provinces = 3\n\n' +
      'i=0, j=1: isConnected[0][1]=1 → union(0,1)\n' +
      '  find(0)=0, find(1)=1  (different roots)\n' +
      '  Equal rank → parent[1]=0, rank[0]=1\n' +
      '  parent = [0, 0, 2]   rank = [1, 0, 0]   provinces = 2\n\n' +
      'i=0, j=2: isConnected[0][2]=0 → skip\n\n' +
      'i=1, j=2: isConnected[1][2]=0 → skip\n\n' +
      'Return provinces = 2  ✓',
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

    // 1-indexed nodes: parent[i] = i means i is its own root
    const parent = Array.from({ length: n + 1 }, (_, i) => i);
    const rank = new Array(n + 1).fill(0);

    // Follow parent pointers up to the root, compressing the path
    function find(x) {
        while (parent[x] !== x) {
            // Skip one level to flatten the tree over time
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }

    // Attempt to merge x and y's components
    // Returns false if they are already in the same component (cycle detected)
    function union(x, y) {
        const rootX = find(x);
        const rootY = find(y);

        if (rootX === rootY) {
            // Same root means adding this edge would create a cycle
            return false;
        }

        // Attach the shallower tree under the deeper tree
        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }

        return true;
    }

    // Process edges in order; the first one that fails union is the redundant edge
    for (const [u, v] of edges) {
        const mergeSucceeded = union(u, v);
        if (!mergeSucceeded) {
            return [u, v];
        }
    }
};`,
    jsWalkthrough:
      'edges = [[1,2],[1,3],[2,3]]\n\n' +
      'Initial: parent = [0,1,2,3]  rank = [0,0,0,0]\n\n' +
      'Edge [1,2]: find(1)=1, find(2)=2 → different → union\n' +
      '  parent[2]=1, rank[1]=1\n' +
      '  parent = [0,1,1,3]\n\n' +
      'Edge [1,3]: find(1)=1, find(3)=3 → different → union\n' +
      '  rank[1]=1 > rank[3]=0 → parent[3]=1\n' +
      '  parent = [0,1,1,1]\n\n' +
      'Edge [2,3]: find(2)→parent[2]=1→root=1, find(3)→parent[3]=1→root=1\n' +
      '  Same root! → cycle detected → return [2,3]  ✓',
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
    // Deque stores indices; the corresponding values are always decreasing
    // so dq[0] is always the index of the current window's maximum
    const dq = [];
    const result = [];

    for (let i = 0; i < nums.length; i++) {
        // Step 1: Remove the front index if it has slid out of the window
        const leftBoundary = i - k + 1;
        if (dq.length > 0 && dq[0] < leftBoundary) {
            dq.shift();
        }

        // Step 2: Remove indices from the back whose values are <= nums[i]
        // Those elements can never be the window max (current is newer AND larger)
        while (dq.length > 0 && nums[dq[dq.length - 1]] <= nums[i]) {
            dq.pop();
        }

        // Step 3: Add current index to the back
        dq.push(i);

        // Step 4: Once the first full window is formed, record the max (front of dq)
        if (i >= k - 1) {
            result.push(nums[dq[0]]);
        }
    }

    return result;
};`,
    jsWalkthrough:
      'nums = [1,3,-1,-3,5,3,6,7], k = 3\n\n' +
      'i=0 (val=1): dq=[] → push 0 → dq=[0]       window not full yet\n' +
      'i=1 (val=3): back val nums[0]=1 <= 3 → pop; push 1 → dq=[1]  not full\n' +
      'i=2 (val=-1): back val nums[1]=3 > -1 → keep; push 2 → dq=[1,2]\n' +
      '  i>=k-1: result=[nums[1]]=[3]\n\n' +
      'i=3 (val=-3): front dq[0]=1 >= leftBoundary=1 → keep\n' +
      '  back val nums[2]=-1 > -3 → keep; push 3 → dq=[1,2,3]\n' +
      '  result=[3, nums[1]]=[3,3]\n\n' +
      'i=4 (val=5): front dq[0]=1 < leftBoundary=2 → shift; dq=[2,3]\n' +
      '  nums[3]=-3<=5 → pop; nums[2]=-1<=5 → pop; push 4 → dq=[4]\n' +
      '  result=[3,3,5]\n\n' +
      'i=5 (val=3): front 4>=3 → keep; nums[4]=5>3 → keep; push 5 → dq=[4,5]\n' +
      '  result=[3,3,5,5]\n\n' +
      'i=6 (val=6): front 4<4? No (4>=4); nums[5]=3<=6→pop; nums[4]=5<=6→pop; push 6 → dq=[6]\n' +
      '  result=[3,3,5,5,6]\n\n' +
      'i=7 (val=7): front 6>=5→keep; nums[6]=6<=7→pop; push 7 → dq=[7]\n' +
      '  result=[3,3,5,5,6,7]  ✓',
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
    // maxDq: indices in decreasing value order — front is the window maximum
    // minDq: indices in increasing value order — front is the window minimum
    const maxDq = [];
    const minDq = [];
    let left = 0;
    let result = 0;

    for (let right = 0; right < nums.length; right++) {
        const currentVal = nums[right];

        // Maintain decreasing order for maxDq: remove back elements smaller than current
        while (maxDq.length > 0 && nums[maxDq[maxDq.length - 1]] <= currentVal) {
            maxDq.pop();
        }

        // Maintain increasing order for minDq: remove back elements larger than current
        while (minDq.length > 0 && nums[minDq[minDq.length - 1]] >= currentVal) {
            minDq.pop();
        }

        maxDq.push(right);
        minDq.push(right);

        // Shrink window from the left while the constraint is violated
        while (nums[maxDq[0]] - nums[minDq[0]] > limit) {
            left++;

            // Remove deque fronts that have fallen outside the window
            if (maxDq[0] < left) {
                maxDq.shift();
            }
            if (minDq[0] < left) {
                minDq.shift();
            }
        }

        // Record the length of the current valid window
        const windowSize = right - left + 1;
        result = Math.max(result, windowSize);
    }

    return result;
};`,
    jsWalkthrough:
      'nums = [8,2,4,7], limit = 4\n\n' +
      'right=0 (val=8): maxDq=[0], minDq=[0]  max=8 min=8  diff=0<=4\n' +
      '  window [8]  size=1  result=1\n\n' +
      'right=1 (val=2): maxDq back 8>2→keep → maxDq=[0,1]\n' +
      '  minDq back 8>=2→pop → minDq=[1]\n' +
      '  max=nums[0]=8, min=nums[1]=2  diff=6>4 → shrink\n' +
      '    left=1; maxDq[0]=0<1→shift → maxDq=[1]; minDq[0]=1>=1→keep\n' +
      '  diff=nums[1]-nums[1]=0<=4  window [2]  size=1  result=1\n\n' +
      'right=2 (val=4): maxDq back nums[1]=2<=4→pop → maxDq=[2]\n' +
      '  minDq back nums[1]=2<4→keep → minDq=[1,2]\n' +
      '  max=nums[2]=4, min=nums[1]=2  diff=2<=4\n' +
      '  window [2,4]  size=2  result=2\n\n' +
      'right=3 (val=7): maxDq back nums[2]=4<=7→pop → maxDq=[3]\n' +
      '  minDq back nums[2]=4<7→keep → minDq=[1,2,3]\n' +
      '  max=nums[3]=7, min=nums[1]=2  diff=5>4 → shrink\n' +
      '    left=2; maxDq[0]=3>=2→keep; minDq[0]=1<2→shift → minDq=[2,3]\n' +
      '  max=nums[3]=7, min=nums[2]=4  diff=3<=4\n' +
      '  window [4,7]  size=2  result=2\n\n' +
      'Return 2  ✓',
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
    // We want the kth largest, which is the (n-k)th smallest (0-indexed)
    const targetIndex = nums.length - k;

    function quickselect(left, right) {
        // Pick a random pivot index to avoid worst-case O(n^2)
        const randomOffset = Math.floor(Math.random() * (right - left + 1));
        const pivotIdx = left + randomOffset;

        // Move pivot to the end so it's out of the way during partitioning
        [nums[pivotIdx], nums[right]] = [nums[right], nums[pivotIdx]];
        const pivotValue = nums[right];

        // Partition: move all elements <= pivot to the left of store pointer
        let storeIdx = left;
        for (let i = left; i < right; i++) {
            if (nums[i] <= pivotValue) {
                [nums[storeIdx], nums[i]] = [nums[i], nums[storeIdx]];
                storeIdx++;
            }
        }

        // Place the pivot in its final sorted position
        [nums[storeIdx], nums[right]] = [nums[right], nums[storeIdx]];

        // Decide which side to recurse into
        if (storeIdx === targetIndex) {
            // Pivot landed exactly at the target position
            return nums[storeIdx];
        } else if (storeIdx < targetIndex) {
            // Target is to the right of the pivot
            return quickselect(storeIdx + 1, right);
        } else {
            // Target is to the left of the pivot
            return quickselect(left, storeIdx - 1);
        }
    }

    return quickselect(0, nums.length - 1);
};`,
    jsWalkthrough:
      'nums = [3,2,1,5,6,4], k = 2\n' +
      'targetIndex = 6 - 2 = 4  (4th smallest = 2nd largest)\n\n' +
      'quickselect(0, 5): say pivot lands on index 3 (val=5)\n' +
      '  Move 5 to end: [3,2,1,4,6,5]\n' +
      '  Partition around 5: elements <=5 → [3,2,1,4,5,6], storeIdx=4\n' +
      '  storeIdx=4 === targetIndex=4 → return nums[4] = 5  ✓\n\n' +
      '(If pivot had been 6 at storeIdx=5: 5<4? No. 5>4? Yes → recurse left)\n' +
      '(If pivot had been 1 at storeIdx=0: 0<4? Yes → recurse right)',
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
    // Base case: a single element or empty array is already sorted
    if (nums.length <= 1) {
        return nums;
    }

    // Split at midpoint into two halves
    const mid = Math.floor(nums.length / 2);
    const leftHalf = sortArray(nums.slice(0, mid));
    const rightHalf = sortArray(nums.slice(mid));

    // Merge the two sorted halves and return the result
    return merge(leftHalf, rightHalf);
};

function merge(left, right) {
    const result = [];
    let leftPtr = 0;
    let rightPtr = 0;

    // Compare front elements of each half; take the smaller one
    while (leftPtr < left.length && rightPtr < right.length) {
        if (left[leftPtr] <= right[rightPtr]) {
            result.push(left[leftPtr]);
            leftPtr++;
        } else {
            result.push(right[rightPtr]);
            rightPtr++;
        }
    }

    // Drain any remaining elements from left half
    while (leftPtr < left.length) {
        result.push(left[leftPtr]);
        leftPtr++;
    }

    // Drain any remaining elements from right half
    while (rightPtr < right.length) {
        result.push(right[rightPtr]);
        rightPtr++;
    }

    return result;
}`,
    jsWalkthrough:
      'nums = [5,2,3,1]\n\n' +
      'sortArray([5,2,3,1]):\n' +
      '  mid=2 → left=[5,2], right=[3,1]\n\n' +
      '  sortArray([5,2]):\n' +
      '    mid=1 → left=[5], right=[2]\n' +
      '    sortArray([5]) → [5]  (base case)\n' +
      '    sortArray([2]) → [2]  (base case)\n' +
      '    merge([5],[2]): 2<5 → [2,5]\n\n' +
      '  sortArray([3,1]):\n' +
      '    mid=1 → left=[3], right=[1]\n' +
      '    merge([3],[1]): 1<3 → [1,3]\n\n' +
      '  merge([2,5],[1,3]):\n' +
      '    1<2 → [1]; 2<3 → [1,2]; 3<5 → [1,2,3]; drain [5] → [1,2,3,5]\n\n' +
      'Return [1,2,3,5]  ✓',
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
        // Allocate 4x the array size to safely store all tree nodes
        this.tree = new Array(4 * this.n).fill(0);
        this._build(nums, 1, 0, this.n - 1);
    }

    // Recursively build the tree bottom-up
    _build(nums, node, start, end) {
        if (start === end) {
            // Leaf node: store the actual array value
            this.tree[node] = nums[start];
            return;
        }

        const mid = Math.floor((start + end) / 2);
        const leftChild = 2 * node;
        const rightChild = 2 * node + 1;

        this._build(nums, leftChild, start, mid);
        this._build(nums, rightChild, mid + 1, end);

        // Internal node stores sum of its two children
        this.tree[node] = this.tree[leftChild] + this.tree[rightChild];
    }

    update(index, val) {
        this._update(1, 0, this.n - 1, index, val);
    }

    _update(node, start, end, idx, val) {
        if (start === end) {
            // Found the leaf — update it directly
            this.tree[node] = val;
            return;
        }

        const mid = Math.floor((start + end) / 2);
        const leftChild = 2 * node;
        const rightChild = 2 * node + 1;

        if (idx <= mid) {
            this._update(leftChild, start, mid, idx, val);
        } else {
            this._update(rightChild, mid + 1, end, idx, val);
        }

        // Recalculate this node's sum after the child was updated
        this.tree[node] = this.tree[leftChild] + this.tree[rightChild];
    }

    sumRange(left, right) {
        return this._query(1, 0, this.n - 1, left, right);
    }

    _query(node, start, end, l, r) {
        // No overlap: this segment is completely outside the query range
        if (r < start || end < l) {
            return 0;
        }

        // Full overlap: this segment is completely inside the query range
        if (l <= start && end <= r) {
            return this.tree[node];
        }

        // Partial overlap: split into left and right children
        const mid = Math.floor((start + end) / 2);
        const leftSum = this._query(2 * node, start, mid, l, r);
        const rightSum = this._query(2 * node + 1, mid + 1, end, l, r);

        return leftSum + rightSum;
    }
}`,
    jsWalkthrough:
      'nums = [1, 3, 5], n = 3\n\n' +
      'Build tree (node 1 covers [0,2]):\n' +
      '  node 1 [0,2]: split → node2 [0,1] + node3 [2,2]\n' +
      '  node 2 [0,1]: split → node4 [0,0]=1 + node5 [1,1]=3 → node2=4\n' +
      '  node 3 [2,2]: leaf → node3=5\n' +
      '  node 1 = 4+5 = 9\n' +
      '  tree: [_, 9, 4, 5, 1, 3, ...]  (1-indexed)\n\n' +
      'sumRange(0, 2): _query(node1, [0,2], query=[0,2])\n' +
      '  [0,2] fully inside [0,2] → return tree[1] = 9  ✓\n\n' +
      'update(1, 2): _update to index 1\n' +
      '  node1→node2→node5 (leaf, [1,1]) → set tree[5]=2\n' +
      '  back up: tree[2]=tree[4]+tree[5]=1+2=3\n' +
      '           tree[1]=tree[2]+tree[3]=3+5=8\n\n' +
      'sumRange(0, 2) → tree[1] = 8  ✓',
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
    if (needle.length === 0) {
        return 0;
    }

    // --- Phase 1: Build the LPS (Longest Proper Prefix that is also Suffix) table ---
    // lps[i] = length of longest prefix of needle[0..i] that equals a suffix of needle[0..i]
    const lps = new Array(needle.length).fill(0);
    let prefixLen = 0;  // length of the previous longest prefix-suffix
    let i = 1;

    while (i < needle.length) {
        if (needle[i] === needle[prefixLen]) {
            // Characters match: extend the current prefix-suffix
            prefixLen++;
            lps[i] = prefixLen;
            i++;
        } else if (prefixLen > 0) {
            // Mismatch but we have a fallback: try the next shorter prefix
            prefixLen = lps[prefixLen - 1];
            // Do NOT increment i — retry with shorter prefix
        } else {
            // No prefix matches at all
            lps[i] = 0;
            i++;
        }
    }

    // --- Phase 2: KMP search using the LPS table ---
    let haystackPtr = 0;  // current position in haystack
    let needlePtr = 0;    // how many needle characters matched so far

    while (haystackPtr < haystack.length) {
        if (haystack[haystackPtr] === needle[needlePtr]) {
            // Characters match: advance both pointers
            haystackPtr++;
            needlePtr++;

            if (needlePtr === needle.length) {
                // Full match found; start index = haystackPtr - needlePtr
                return haystackPtr - needlePtr;
            }
        } else if (needlePtr > 0) {
            // Mismatch after some matches: use LPS to skip re-checking
            needlePtr = lps[needlePtr - 1];
            // haystackPtr stays — we already know the prefix still matches
        } else {
            // Mismatch at position 0 of needle: just advance haystack
            haystackPtr++;
        }
    }

    return -1;
};`,
    jsWalkthrough:
      'haystack = "sadbutsad", needle = "sad"\n\n' +
      'Build LPS for "sad":\n' +
      '  i=1 (a): needle[1]=a vs needle[0]=s → mismatch, prefixLen=0 → lps[1]=0, i=2\n' +
      '  i=2 (d): needle[2]=d vs needle[0]=s → mismatch, prefixLen=0 → lps[2]=0, i=3\n' +
      '  lps = [0, 0, 0]\n\n' +
      'KMP search:\n' +
      'hPtr=0,nPtr=0: s==s → hPtr=1,nPtr=1\n' +
      'hPtr=1,nPtr=1: a==a → hPtr=2,nPtr=2\n' +
      'hPtr=2,nPtr=2: d==d → hPtr=3,nPtr=3 → nPtr==3 → return 3-3=0  ✓',
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
    // Trick: if s is a repeated pattern, it will appear in (s+s) after removing
    // the first and last character (which would only match trivially).
    //
    // Example: s = "abab"
    //   s+s = "abababab"
    //   slice(1,-1) = "bababab"   → "abab" found at index 1 → true
    //
    // Example: s = "abc"
    //   s+s = "abcabc"
    //   slice(1,-1) = "bcab"      → "abc" not found → false

    const doubled = s + s;
    const middle = doubled.slice(1, doubled.length - 1);

    return middle.includes(s);

    // Alternative KMP method (more insight, same O(n) complexity):
    // const n = s.length;
    // const lps = new Array(n).fill(0);
    // let prefixLen = 0, i = 1;
    // while (i < n) {
    //     if (s[i] === s[prefixLen]) { prefixLen++; lps[i] = prefixLen; i++; }
    //     else if (prefixLen > 0) { prefixLen = lps[prefixLen - 1]; }
    //     else { i++; }
    // }
    // // The repeating unit length is n - lps[n-1]
    // // If it divides n evenly, the whole string is that unit repeated
    // return lps[n - 1] > 0 && n % (n - lps[n - 1]) === 0;
};`,
    jsWalkthrough:
      's = "abab"\n\n' +
      'doubled = "abababab"\n' +
      'middle  = "bababab"  (remove first and last char)\n\n' +
      'Does "bababab" include "abab"?\n' +
      '  Check index 0: "baba" vs "abab" → no\n' +
      '  Check index 1: "abab" vs "abab" → yes!\n' +
      'Return true  ✓\n\n' +
      's = "abc"\n' +
      'doubled = "abcabc"\n' +
      'middle  = "bcab"\n' +
      'Does "bcab" include "abc"? → no → Return false  ✓',
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

    // Union-Find setup: each point starts as its own component
    const parent = Array.from({ length: n }, (_, i) => i);
    const rank = new Array(n).fill(0);

    function find(x) {
        while (parent[x] !== x) {
            // Path compression: skip one generation up
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }

    function union(x, y) {
        const rootX = find(x);
        const rootY = find(y);

        if (rootX === rootY) {
            // Already connected — adding this edge would create a cycle
            return false;
        }

        // Attach smaller tree under larger tree by rank
        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }

        return true;
    }

    // Generate all pairs and compute their Manhattan distances
    const edges = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const xDiff = Math.abs(points[i][0] - points[j][0]);
            const yDiff = Math.abs(points[i][1] - points[j][1]);
            const distance = xDiff + yDiff;
            edges.push([distance, i, j]);
        }
    }

    // Sort edges by distance ascending (Kruskal's greedy order)
    edges.sort((a, b) => a[0] - b[0]);

    // Greedily add the cheapest edges that don't form cycles
    let totalCost = 0;
    let edgesUsed = 0;

    for (const [distance, u, v] of edges) {
        const merged = union(u, v);

        if (merged) {
            totalCost += distance;
            edgesUsed++;

            // A spanning tree for n nodes needs exactly n-1 edges
            if (edgesUsed === n - 1) {
                break;
            }
        }
    }

    return totalCost;
};`,
    jsWalkthrough:
      'points = [[0,0],[2,2],[3,10],[5,2],[7,0]]  (n=5, need 4 edges)\n\n' +
      'All edges sorted by distance (showing key ones):\n' +
      '  [4, 0,1] (0,0)↔(2,2)\n' +
      '  [4, 1,3] (2,2)↔(5,2)\n' +
      '  [5, 2,3] (3,10)↔(5,2)? No: |3-5|+|10-2|=10. Actually [7,0,3],[5,1,3]...\n' +
      '  (sorted list varies — illustrating the merge steps)\n\n' +
      'Edge [4, 0,1]: find(0)=0, find(1)=1 → different → union → cost=4, used=1\n' +
      'Edge [4, 1,3]: find(1)→0, find(3)=3 → different → union → cost=8, used=2\n' +
      'Edge [7, 0,4]: find(0)=0, find(4)=4 → different → union → cost=15, used=3\n' +
      'Edge [5, 2,3]: find(2)=2, find(3)→0 → different → union → cost=20, used=4\n' +
      'used=4 === n-1=4 → break\n\n' +
      'Return 20  ✓',
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

  // ===========================================================================
  // MONOTONIC STACK
  // ===========================================================================

  // 739. Daily Temperatures
  {
    id: 739,
    description:
      'Given an array of integers temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day with a warmer temperature, answer[i] = 0.',
    examples:
      'Input: temperatures = [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]',
    intuition:
      'For each day, we need the NEXT warmer day. This is the classic "next greater element" problem. Use a decreasing monotonic stack of indices. When we see a temperature warmer than the stack top, the top just found its answer: the distance from its index to the current index.',
    approach:
      'Maintain a stack of indices in decreasing temperature order. For each new day: while the stack top is cooler, pop it and record the distance. Push the current day.',
    code: `def dailyTemperatures(temperatures):
    n = len(temperatures)
    result = [0] * n
    stack = []  # indices, temps are decreasing
    for i in range(n):
        while stack and temperatures[i] > temperatures[stack[-1]]:
            j = stack.pop()
            result[j] = i - j
        stack.append(i)
    return result`,
    jsCode: `var dailyTemperatures = function(temperatures) {
    const n = temperatures.length;
    const result = new Array(n).fill(0);

    // Stack stores indices; temperatures at those indices are in decreasing order
    // (front to back). Whenever a warmer day arrives, it resolves all cooler days.
    const stack = [];

    for (let i = 0; i < n; i++) {
        const currentTemp = temperatures[i];

        // Pop all days that are cooler than today — today is their next warmer day
        while (stack.length > 0 && currentTemp > temperatures[stack[stack.length - 1]]) {
            const prevDayIndex = stack.pop();
            const daysWaited = i - prevDayIndex;
            result[prevDayIndex] = daysWaited;
        }

        // Push today's index; we haven't found its next warmer day yet
        stack.push(i);
    }

    // Any indices still on the stack have no future warmer day → result stays 0
    return result;
};`,
    jsWalkthrough:
      'temperatures = [73,74,75,71,69,72,76,73]\n\n' +
      'i=0 (73): stack=[] → push 0     stack=[0]\n' +
      'i=1 (74): 74>temps[0]=73 → pop 0, result[0]=1-0=1; push 1  stack=[1]\n' +
      'i=2 (75): 75>temps[1]=74 → pop 1, result[1]=2-1=1; push 2  stack=[2]\n' +
      'i=3 (71): 71<75 → push 3    stack=[2,3]\n' +
      'i=4 (69): 69<71 → push 4    stack=[2,3,4]\n' +
      'i=5 (72): 72>temps[4]=69 → pop 4, result[4]=5-4=1\n' +
      '           72>temps[3]=71 → pop 3, result[3]=5-3=2\n' +
      '           72<temps[2]=75 → stop; push 5  stack=[2,5]\n' +
      'i=6 (76): 76>temps[5]=72 → pop 5, result[5]=6-5=1\n' +
      '           76>temps[2]=75 → pop 2, result[2]=6-2=4\n' +
      '           push 6   stack=[6]\n' +
      'i=7 (73): 73<76 → push 7    stack=[6,7]\n\n' +
      'Remaining stack [6,7] → result[6]=result[7]=0 (already 0)\n' +
      'result = [1,1,4,2,1,1,0,0]  ✓',
    explanation:
      '1. Stack holds indices in decreasing order of their temperatures.\n' +
      '2. When temperatures[i] > temperatures[stack top], the top found its next warmer day.\n' +
      '3. Pop and record distance (i - j). Repeat for all cooler stack elements.\n' +
      '4. Push i. Elements remaining on the stack have no warmer day (answer stays 0).\n' +
      '5. Each index is pushed and popped at most once → O(n).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'This is "next greater element" but you return the INDEX DISTANCE, not the value.',
      'Store indices on the stack, not temperatures.',
      'Decreasing stack: pop when current is GREATER than top.',
    ],
  },

  // 84. Largest Rectangle in Histogram
  {
    id: 84,
    description:
      'Given an array of integers heights representing the histogram\'s bar heights where the width of each bar is 1, return the area of the largest rectangle in the histogram.',
    examples:
      'Input: heights = [2,1,5,6,2,3]\nOutput: 10\nExplanation: The rectangle of height 5 and width 2 (indices 2-3) has area 10.',
    intuition:
      'For each bar, the largest rectangle using that bar\'s height extends left and right until hitting a shorter bar. We need the "previous smaller" and "next smaller" for each bar. A monotonic increasing stack finds both: when we pop a bar (because the current bar is shorter), the popped bar\'s right boundary is the current index, and its left boundary is the new stack top.',
    approach:
      'Use increasing monotonic stack. When popping, the popped height\'s rectangle extends from the new stack top + 1 to current index - 1. Add a sentinel 0 at the end to flush remaining bars.',
    code: `def largestRectangleArea(heights):
    stack = []
    max_area = 0
    heights.append(0)  # sentinel
    for i, h in enumerate(heights):
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            width = i if not stack else i - stack[-1] - 1
            max_area = max(max_area, height * width)
        stack.append(i)
    heights.pop()
    return max_area`,
    jsCode: `var largestRectangleArea = function(heights) {
    // Stack stores indices in increasing order of their heights
    const stack = [];
    let maxArea = 0;

    // Append a sentinel height of 0 to flush all remaining bars at the end
    heights.push(0);

    for (let i = 0; i < heights.length; i++) {
        const currentHeight = heights[i];

        // While the current bar is shorter than the stack top,
        // the top bar can no longer extend rightward — compute its area now
        while (stack.length > 0 && heights[stack[stack.length - 1]] > currentHeight) {
            const poppedIndex = stack.pop();
            const rectangleHeight = heights[poppedIndex];

            // Width: from the new stack top (exclusive) to current index (exclusive)
            // If stack is now empty, the popped bar was the shortest seen — extends to index 0
            const leftBoundary = stack.length > 0 ? stack[stack.length - 1] : -1;
            const rectangleWidth = i - leftBoundary - 1;

            const area = rectangleHeight * rectangleWidth;
            maxArea = Math.max(maxArea, area);
        }

        stack.push(i);
    }

    // Remove the sentinel we added
    heights.pop();

    return maxArea;
};`,
    jsWalkthrough:
      'heights = [2,1,5,6,2,3]  → append 0 → [2,1,5,6,2,3,0]\n\n' +
      'i=0 (h=2): stack=[] → push 0   stack=[0]\n' +
      'i=1 (h=1): 1<heights[0]=2 → pop 0, rectH=2\n' +
      '  stack empty → leftBoundary=-1, width=1-(-1)-1=1, area=2*1=2\n' +
      '  push 1   stack=[1]   maxArea=2\n' +
      'i=2 (h=5): 5>1 → push 2   stack=[1,2]\n' +
      'i=3 (h=6): 6>5 → push 3   stack=[1,2,3]\n' +
      'i=4 (h=2): 2<heights[3]=6 → pop 3, rectH=6, leftBoundary=2, width=4-2-1=1, area=6\n' +
      '           2<heights[2]=5 → pop 2, rectH=5, leftBoundary=1, width=4-1-1=2, area=10\n' +
      '           2>heights[1]=1 → stop; push 4   stack=[1,4]   maxArea=10\n' +
      'i=5 (h=3): 3>2 → push 5   stack=[1,4,5]\n' +
      'i=6 (sentinel 0): 0<heights[5]=3 → pop 5, rectH=3, leftBoundary=4, width=6-4-1=1, area=3\n' +
      '           0<heights[4]=2 → pop 4, rectH=2, leftBoundary=1, width=6-1-1=4, area=8\n' +
      '           0<heights[1]=1 → pop 1, rectH=1, leftBoundary=-1, width=6-(-1)-1=6, area=6\n' +
      '           stack empty → stop\n\n' +
      'maxArea = 10  ✓',
    explanation:
      '1. Maintain increasing stack of indices.\n' +
      '2. When heights[i] < stack top, pop. The popped bar\'s height is the rectangle height.\n' +
      '3. Width = distance from new stack top to current index (exclusive on both sides).\n' +
      '4. If stack is empty after pop, width = i (rectangle extends to the beginning).\n' +
      '5. Sentinel 0 at the end ensures all bars get popped.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The sentinel heights.append(0) is crucial — it forces all remaining bars to be processed.',
      'Width calculation: if stack is empty, the popped bar was the smallest seen so far (width = i).',
      'This is the hardest monotonic stack problem. Master it and the rest are easy.',
    ],
  },

  // ===========================================================================
  // TOPOLOGICAL SORT
  // ===========================================================================

  // 207. Course Schedule
  {
    id: 207,
    description:
      'There are numCourses courses labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi before course ai. Return true if you can finish all courses.',
    examples:
      'Input: numCourses = 2, prerequisites = [[1,0]]\nOutput: true\nExplanation: Take course 0, then course 1.\n\nInput: numCourses = 2, prerequisites = [[1,0],[0,1]]\nOutput: false\nExplanation: Circular dependency.',
    intuition:
      'This is asking: "does the dependency graph have a cycle?" If yes, impossible to finish all courses. If no (it\'s a DAG), a valid ordering exists. Topological sort answers this: if it processes all nodes, no cycle exists.',
    approach:
      'Build a directed graph from prerequisites. Run Kahn\'s algorithm (BFS topological sort). If the result includes all courses, return true. If not, there\'s a cycle.',
    code: `from collections import deque, defaultdict

def canFinish(numCourses, prerequisites):
    graph = defaultdict(list)
    in_degree = [0] * numCourses
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1

    queue = deque(i for i in range(numCourses) if in_degree[i] == 0)
    count = 0
    while queue:
        node = queue.popleft()
        count += 1
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    return count == numCourses`,
    jsCode: `var canFinish = function(numCourses, prerequisites) {
    // Build adjacency list: graph[prereq] = list of courses that depend on prereq
    const graph = Array.from({ length: numCourses }, () => []);
    const inDegree = new Array(numCourses).fill(0);

    for (const [course, prereq] of prerequisites) {
        graph[prereq].push(course);
        inDegree[course]++;
    }

    // Start BFS from all courses that have no prerequisites
    const queue = [];
    for (let i = 0; i < numCourses; i++) {
        if (inDegree[i] === 0) {
            queue.push(i);
        }
    }

    // Process courses layer by layer (Kahn's algorithm)
    let processedCount = 0;

    while (queue.length > 0) {
        const course = queue.shift();
        processedCount++;

        // "Taking" this course reduces the prerequisite count for dependent courses
        for (const dependentCourse of graph[course]) {
            inDegree[dependentCourse]--;

            // If all prerequisites are now satisfied, add to queue
            if (inDegree[dependentCourse] === 0) {
                queue.push(dependentCourse);
            }
        }
    }

    // If we processed every course, there was no cycle → can finish
    return processedCount === numCourses;
};`,
    jsWalkthrough:
      'numCourses=4, prerequisites=[[1,0],[2,0],[3,1],[3,2]]\n\n' +
      'Build graph:\n' +
      '  graph[0]=[1,2], graph[1]=[3], graph[2]=[3]\n' +
      '  inDegree = [0, 1, 1, 2]\n\n' +
      'Initial queue (inDegree=0): [0]\n\n' +
      'Process 0: processedCount=1\n' +
      '  neighbor 1: inDegree[1]=0 → queue=[1]\n' +
      '  neighbor 2: inDegree[2]=0 → queue=[1,2]\n\n' +
      'Process 1: processedCount=2\n' +
      '  neighbor 3: inDegree[3]=1 → not zero yet\n\n' +
      'Process 2: processedCount=3\n' +
      '  neighbor 3: inDegree[3]=0 → queue=[3]\n\n' +
      'Process 3: processedCount=4\n\n' +
      'processedCount=4 === numCourses=4 → return true  ✓',
    explanation:
      '1. Build adjacency list and count in-degrees.\n' +
      '2. Start with all courses that have no prerequisites (in-degree 0).\n' +
      '3. Process each, decrementing neighbors\' in-degrees.\n' +
      '4. When a neighbor reaches in-degree 0, it\'s ready to take.\n' +
      '5. If we process all courses, no cycle → can finish. Otherwise, a cycle prevents completion.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    hints: [
      '"Can finish all courses?" = "Is the prerequisite graph a DAG?" = "Does topological sort succeed?"',
      'Kahn\'s: start with 0 in-degree nodes, peel layers.',
      'Edge direction: prerequisite[i] = [a, b] means b → a (take b before a).',
    ],
  },

  // 210. Course Schedule II
  {
    id: 210,
    description:
      'Return the ordering of courses you should take to finish all courses. If there are many valid answers, return any. If impossible, return an empty array.',
    examples:
      'Input: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]\nOutput: [0,2,1,3] or [0,1,2,3]',
    intuition:
      'Same as Course Schedule but instead of just checking if it\'s possible, we need to return the actual order. Kahn\'s algorithm naturally produces the topological order as it peels layers.',
    approach:
      'Run Kahn\'s algorithm and collect the order. If all nodes are processed, return the order. Otherwise return empty array.',
    code: `from collections import deque, defaultdict

def findOrder(numCourses, prerequisites):
    graph = defaultdict(list)
    in_degree = [0] * numCourses
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1

    queue = deque(i for i in range(numCourses) if in_degree[i] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    return order if len(order) == numCourses else []`,
    jsCode: `var findOrder = function(numCourses, prerequisites) {
    // Build adjacency list: graph[prereq] = list of courses unlocked by taking prereq
    const graph = Array.from({ length: numCourses }, () => []);
    const inDegree = new Array(numCourses).fill(0);

    for (const [course, prereq] of prerequisites) {
        graph[prereq].push(course);
        inDegree[course]++;
    }

    // Seed the queue with all courses that have no prerequisites
    const queue = [];
    for (let i = 0; i < numCourses; i++) {
        if (inDegree[i] === 0) {
            queue.push(i);
        }
    }

    // Process courses in topological order, recording each one taken
    const order = [];

    while (queue.length > 0) {
        const course = queue.shift();
        order.push(course);

        for (const dependentCourse of graph[course]) {
            inDegree[dependentCourse]--;

            // Unlock this course once all its prerequisites have been taken
            if (inDegree[dependentCourse] === 0) {
                queue.push(dependentCourse);
            }
        }
    }

    // If order contains all courses, we found a valid schedule; otherwise there's a cycle
    if (order.length === numCourses) {
        return order;
    } else {
        return [];
    }
};`,
    jsWalkthrough:
      'numCourses=4, prerequisites=[[1,0],[2,0],[3,1],[3,2]]\n\n' +
      'graph[0]=[1,2], graph[1]=[3], graph[2]=[3]\n' +
      'inDegree = [0, 1, 1, 2]\n\n' +
      'Initial queue: [0]\n\n' +
      'Process 0 → order=[0]\n' +
      '  inDegree[1]→0, inDegree[2]→0  queue=[1,2]\n\n' +
      'Process 1 → order=[0,1]\n' +
      '  inDegree[3]→1  queue=[2]\n\n' +
      'Process 2 → order=[0,1,2]\n' +
      '  inDegree[3]→0  queue=[3]\n\n' +
      'Process 3 → order=[0,1,2,3]\n\n' +
      'order.length=4 === numCourses=4 → return [0,1,2,3]  ✓',
    explanation:
      '1. Identical to Course Schedule but we return the order array instead of a boolean.\n' +
      '2. Kahn\'s algorithm naturally produces a valid topological order.\n' +
      '3. If multiple valid orders exist, the one we get depends on queue processing order.\n' +
      '4. Empty result = cycle detected (impossible to complete all courses).',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    hints: [
      'This is Course Schedule + "return the order". Same algorithm, just collect results.',
      'If the result length < numCourses, there\'s a cycle.',
    ],
  },
];

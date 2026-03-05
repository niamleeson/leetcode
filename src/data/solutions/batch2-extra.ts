import { ProblemSolution } from './types';

export const solutions: ProblemSolution[] = [
  // ---------------------------------------------------------------------------
  // 241. Different Ways to Add Parentheses
  // ---------------------------------------------------------------------------
  {
    id: 241,
    description:
      'Given a string expression of numbers and operators (+, -, *), return all possible results from computing all the different possible ways to group numbers and operators. You may return the answer in any order.',
    examples:
      'Input: expression = "2*3-4*5"\nOutput: [-34,-14,-10,-10,10]',
    approach:
      'Use divide and conquer. For each operator in the expression, split into left and right subexpressions, recursively compute all results for each side, then combine every left result with every right result using that operator.',
    code: `class Solution:
    def diffWaysToCompute(self, expression: str) -> list[int]:
        if expression.isdigit():
            return [int(expression)]
        results = []
        for i, ch in enumerate(expression):
            if ch in '+-*':
                left = self.diffWaysToCompute(expression[:i])
                right = self.diffWaysToCompute(expression[i+1:])
                for l in left:
                    for r in right:
                        if ch == '+': results.append(l + r)
                        elif ch == '-': results.append(l - r)
                        else: results.append(l * r)
        return results`,
    jsCode: `var diffWaysToCompute = function(expression) {
    if (/^\\d+$/.test(expression)) {
        return [parseInt(expression)];
    }
    const results = [];
    for (let i = 0; i < expression.length; i++) {
        const ch = expression[i];
        if (ch === '+' || ch === '-' || ch === '*') {
            const left = diffWaysToCompute(expression.substring(0, i));
            const right = diffWaysToCompute(expression.substring(i + 1));
            for (const l of left) {
                for (const r of right) {
                    if (ch === '+') results.push(l + r);
                    else if (ch === '-') results.push(l - r);
                    else results.push(l * r);
                }
            }
        }
    }
    return results;
};`,
    explanation:
      '1. Base case: if the expression is purely a number, return it as the only result.\n' +
      '2. Iterate through the expression looking for operators.\n' +
      '3. For each operator found, split into left and right subexpressions.\n' +
      '4. Recursively compute all possible results for both halves.\n' +
      '5. Combine every pair of left/right results using the current operator.',
    timeComplexity: 'O(2^n) — Catalan number of possible groupings',
    spaceComplexity: 'O(2^n)',
    hints: [
      'Think about which operator you evaluate last — that splits the expression into two independent parts.',
      'Recursively solve the left and right parts, then combine results.',
      'Memoization with the substring as key can avoid recomputation.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 247. Strobogrammatic Number II
  // ---------------------------------------------------------------------------
  {
    id: 247,
    description:
      'Given an integer n, return all strobogrammatic numbers of length n. A strobogrammatic number looks the same when rotated 180 degrees. The numbers should be returned as strings.',
    examples:
      'Input: n = 2\nOutput: ["11","69","88","96"]',
    approach:
      'Build numbers from the inside out. Start with base cases for length 0 (empty) and length 1 ("0","1","8"). For each step, wrap existing numbers with strobogrammatic pairs (0/0, 1/1, 6/9, 8/8, 9/6), avoiding leading zeros for the outermost layer.',
    code: `class Solution:
    def findStrobogrammatic(self, n: int) -> list[str]:
        def helper(cur_len, total_len):
            if cur_len == 0:
                return ['']
            if cur_len == 1:
                return ['0', '1', '8']
            middles = helper(cur_len - 2, total_len)
            result = []
            for m in middles:
                for pair in [('0','0'),('1','1'),('6','9'),('8','8'),('9','6')]:
                    if pair[0] == '0' and cur_len == total_len:
                        continue
                    result.append(pair[0] + m + pair[1])
            return result
        return helper(n, n)`,
    jsCode: `var findStrobogrammatic = function(n) {
    const helper = (curLen, totalLen) => {
        if (curLen === 0) return [''];
        if (curLen === 1) return ['0', '1', '8'];
        const middles = helper(curLen - 2, totalLen);
        const result = [];
        const pairs = [['0','0'],['1','1'],['6','9'],['8','8'],['9','6']];
        for (const m of middles) {
            for (const [a, b] of pairs) {
                if (a === '0' && curLen === totalLen) continue;
                result.push(a + m + b);
            }
        }
        return result;
    };
    return helper(n, n);
};`,
    explanation:
      '1. Use a recursive helper that builds strings of cur_len centered inside total_len.\n' +
      '2. Base: length 0 returns [""], length 1 returns ["0","1","8"].\n' +
      '3. Recursively get all strobogrammatic strings of length cur_len-2.\n' +
      '4. Wrap each middle string with valid strobogrammatic digit pairs.\n' +
      '5. Skip leading zeros when cur_len equals total_len to avoid numbers like "010".',
    timeComplexity: 'O(5^(n/2))',
    spaceComplexity: 'O(5^(n/2))',
    hints: [
      'Only certain digit pairs look the same when rotated 180 degrees: (0,0),(1,1),(6,9),(8,8),(9,6).',
      'Build from the center outward, handling odd vs even length differently.',
      'Be careful not to place 0 as the leading digit of the final number.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 249. Group Shifted Strings
  // ---------------------------------------------------------------------------
  {
    id: 249,
    description:
      'Given an array of strings, group all strings that belong to the same shifting sequence. A shifting sequence is one where each letter is shifted by the same amount (wrapping from z to a). For example, "abc" -> "bcd" -> ... -> "xyz".',
    examples:
      'Input: strings = ["abc","bcd","acef","xyz","az","ba","a","z"]\nOutput: [["acef"],["a","z"],["abc","bcd","xyz"],["az","ba"]]',
    approach:
      'Compute a canonical key for each string by calculating the difference between consecutive characters modulo 26. Strings with the same difference tuple belong to the same shifting group.',
    code: `class Solution:
    def groupStrings(self, strings: list[str]) -> list[list[str]]:
        from collections import defaultdict
        groups = defaultdict(list)
        for s in strings:
            key = tuple((ord(s[i]) - ord(s[i-1])) % 26 for i in range(1, len(s)))
            groups[key].append(s)
        return list(groups.values())`,
    jsCode: `var groupStrings = function(strings) {
    const groups = new Map();
    for (const s of strings) {
        const key = [];
        for (let i = 1; i < s.length; i++) {
            key.push(((s.charCodeAt(i) - s.charCodeAt(i - 1)) % 26 + 26) % 26);
        }
        const k = key.join(',');
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(s);
    }
    return Array.from(groups.values());
};`,
    explanation:
      '1. For each string, compute the tuple of differences between consecutive characters mod 26.\n' +
      '2. This tuple is shift-invariant: "abc" and "bcd" both yield (1,1).\n' +
      '3. Use this tuple as the dictionary key to group strings.\n' +
      '4. Return all groups as a list of lists.',
    timeComplexity: 'O(n * k) where n is number of strings and k is max string length',
    spaceComplexity: 'O(n * k)',
    hints: [
      'Two strings are in the same shift sequence if consecutive character differences are the same.',
      'Use modulo 26 to handle wrapping from z to a.',
      'Single-character strings all belong to the same group.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 252. Meeting Rooms
  // ---------------------------------------------------------------------------
  {
    id: 252,
    description:
      'Given an array of meeting time intervals where intervals[i] = [start_i, end_i], determine if a person could attend all meetings. A person cannot attend two meetings that overlap.',
    examples:
      'Input: intervals = [[0,30],[5,10],[15,20]]\nOutput: false',
    approach:
      'Sort the intervals by start time. Then check if any meeting starts before the previous one ends. If so, there is an overlap and the person cannot attend all meetings.',
    code: `class Solution:
    def canAttendMeetings(self, intervals: list[list[int]]) -> bool:
        intervals.sort(key=lambda x: x[0])
        for i in range(1, len(intervals)):
            if intervals[i][0] < intervals[i-1][1]:
                return False
        return True`,
    jsCode: `var canAttendMeetings = function(intervals) {
    intervals.sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < intervals[i - 1][1]) {
            return false;
        }
    }
    return true;
};`,
    explanation:
      '1. Sort intervals by their start time.\n' +
      '2. Iterate through the sorted intervals starting from the second one.\n' +
      '3. If the current meeting starts before the previous meeting ends, return False.\n' +
      '4. If no overlaps are found, return True.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'If the meetings were sorted by start time, what would an overlap look like?',
      'After sorting, you only need to compare adjacent meetings.',
      'A meeting overlaps with the previous one if its start is less than the previous end.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 253. Meeting Rooms II
  // ---------------------------------------------------------------------------
  {
    id: 253,
    description:
      'Given an array of meeting time intervals where intervals[i] = [start_i, end_i], return the minimum number of conference rooms required to hold all meetings.',
    examples:
      'Input: intervals = [[0,30],[5,10],[15,20]]\nOutput: 2',
    approach:
      'Use a min-heap to track end times of ongoing meetings. For each meeting (sorted by start), if the earliest ending meeting has already ended, reuse that room. Otherwise allocate a new room. The heap size is the answer.',
    code: `import heapq

class Solution:
    def minMeetingRooms(self, intervals: list[list[int]]) -> int:
        if not intervals:
            return 0
        intervals.sort(key=lambda x: x[0])
        heap = []
        for start, end in intervals:
            if heap and heap[0] <= start:
                heapq.heapreplace(heap, end)
            else:
                heapq.heappush(heap, end)
        return len(heap)`,
    jsCode: `var minMeetingRooms = function(intervals) {
    if (!intervals.length) return 0;
    intervals.sort((a, b) => a[0] - b[0]);
    // Use a simple sorted array as a min-heap substitute
    const ends = [];
    for (const [start, end] of intervals) {
        if (ends.length > 0 && ends[0] <= start) {
            ends.shift();
        }
        ends.push(end);
        ends.sort((a, b) => a - b);
    }
    return ends.length;
};`,
    explanation:
      '1. Sort meetings by start time.\n' +
      '2. Use a min-heap to track the end time of each room in use.\n' +
      '3. For each meeting, if the earliest-ending room is free (end <= start), reuse it by replacing its end time.\n' +
      '4. Otherwise, push a new end time (allocate a new room).\n' +
      '5. The heap size at the end equals the minimum rooms needed.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Think about events on a timeline: when does a room become free?',
      'A min-heap of end times lets you quickly find the earliest available room.',
      'Alternatively, use a sweep line: +1 at each start, -1 at each end, and find the max overlap.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 256. Paint House
  // ---------------------------------------------------------------------------
  {
    id: 256,
    description:
      'There are n houses in a row, each to be painted one of three colors: red, blue, or green. The cost of painting each house a certain color is given. No two adjacent houses can have the same color. Find the minimum total cost to paint all houses.',
    examples:
      'Input: costs = [[17,2,17],[16,16,5],[14,3,19]]\nOutput: 10\nExplanation: Paint house 0 blue, house 1 green, house 2 blue. Cost = 2 + 5 + 3 = 10.',
    approach:
      'Use dynamic programming. For each house, the cost of painting it a certain color is its own cost plus the minimum cost of painting the previous house one of the other two colors. Update in place to save space.',
    code: `class Solution:
    def minCost(self, costs: list[list[int]]) -> int:
        if not costs:
            return 0
        prev = costs[0][:]
        for i in range(1, len(costs)):
            curr = [0, 0, 0]
            curr[0] = costs[i][0] + min(prev[1], prev[2])
            curr[1] = costs[i][1] + min(prev[0], prev[2])
            curr[2] = costs[i][2] + min(prev[0], prev[1])
            prev = curr
        return min(prev)`,
    jsCode: `var minCost = function(costs) {
    if (!costs.length) return 0;
    let prev = [...costs[0]];
    for (let i = 1; i < costs.length; i++) {
        const curr = [
            costs[i][0] + Math.min(prev[1], prev[2]),
            costs[i][1] + Math.min(prev[0], prev[2]),
            costs[i][2] + Math.min(prev[0], prev[1])
        ];
        prev = curr;
    }
    return Math.min(...prev);
};`,
    explanation:
      '1. Initialize prev as the costs for painting the first house.\n' +
      '2. For each subsequent house, compute the cost of each color as its cost + min of the other two colors from the previous house.\n' +
      '3. Update prev to curr for the next iteration.\n' +
      '4. Return the minimum value in prev after processing all houses.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'If you paint house i red, the previous house must be blue or green.',
      'Use DP where dp[i][c] = min cost to paint houses 0..i with house i colored c.',
      'You only need the previous row, so O(1) extra space suffices.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 257. Binary Tree Paths
  // ---------------------------------------------------------------------------
  {
    id: 257,
    description:
      'Given the root of a binary tree, return all root-to-leaf paths in any order. A leaf is a node with no children. Each path should be represented as a string with nodes separated by "->".',
    examples:
      'Input: root = [1,2,3,null,5]\nOutput: ["1->2->5","1->3"]',
    approach:
      'Use DFS traversal. At each node, append its value to the current path. When a leaf is reached, add the complete path string to the results. Backtrack by removing the node after exploring its subtrees.',
    code: `class Solution:
    def binaryTreePaths(self, root) -> list[str]:
        result = []
        def dfs(node, path):
            if not node:
                return
            path.append(str(node.val))
            if not node.left and not node.right:
                result.append('->'.join(path))
            else:
                dfs(node.left, path)
                dfs(node.right, path)
            path.pop()
        dfs(root, [])
        return result`,
    jsCode: `var binaryTreePaths = function(root) {
    const result = [];
    const dfs = (node, path) => {
        if (!node) return;
        path.push(String(node.val));
        if (!node.left && !node.right) {
            result.push(path.join('->'));
        } else {
            dfs(node.left, path);
            dfs(node.right, path);
        }
        path.pop();
    };
    dfs(root, []);
    return result;
};`,
    explanation:
      '1. Start DFS from the root with an empty path list.\n' +
      '2. At each node, append its value as a string to the path.\n' +
      '3. If the node is a leaf (no children), join the path with "->" and add to results.\n' +
      '4. Otherwise, recurse on left and right children.\n' +
      '5. Pop the current node from the path when backtracking.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'A leaf node has no left or right child.',
      'Use DFS and build the path string as you go deeper.',
      'Remember to backtrack (remove the current node) after exploring subtrees.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 258. Add Digits
  // ---------------------------------------------------------------------------
  {
    id: 258,
    description:
      'Given an integer num, repeatedly add all its digits until the result has only one digit, and return it. For example, 38 -> 3+8 = 11 -> 1+1 = 2.',
    examples:
      'Input: num = 38\nOutput: 2\nExplanation: 3 + 8 = 11, 1 + 1 = 2.',
    approach:
      'Use the digital root formula. For any positive number, the digital root is 1 + (num - 1) % 9. This gives the result in O(1) without looping.',
    code: `class Solution:
    def addDigits(self, num: int) -> int:
        if num == 0:
            return 0
        return 1 + (num - 1) % 9`,
    jsCode: `var addDigits = function(num) {
    if (num === 0) return 0;
    return 1 + (num - 1) % 9;
};`,
    explanation:
      '1. If num is 0, the digital root is 0.\n' +
      '2. Otherwise, use the formula: digital_root = 1 + (num - 1) % 9.\n' +
      '3. This works because repeatedly summing digits is equivalent to computing num mod 9, except we map 0 to 9 for multiples of 9.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    hints: [
      'The naive approach repeatedly sums digits in a loop. Can you find a pattern?',
      'Look at the digital root for numbers 1-20. Notice a repeating pattern related to mod 9.',
      'The digital root formula is 1 + (num - 1) % 9 for num > 0.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 259. 3Sum Smaller
  // ---------------------------------------------------------------------------
  {
    id: 259,
    description:
      'Given an array of n integers nums and an integer target, find the number of index triplets (i, j, k) with i < j < k such that nums[i] + nums[j] + nums[k] < target.',
    examples:
      'Input: nums = [-2,0,1,3], target = 2\nOutput: 2\nExplanation: [-2,0,1] and [-2,0,3] have sums less than 2.',
    approach:
      'Sort the array and use a two-pointer technique. For each element, use left and right pointers on the remaining subarray. If the sum < target, all pairs between left and right are valid, so add (right - left) and move left forward.',
    code: `class Solution:
    def threeSumSmaller(self, nums: list[int], target: int) -> int:
        nums.sort()
        count = 0
        for i in range(len(nums) - 2):
            left, right = i + 1, len(nums) - 1
            while left < right:
                if nums[i] + nums[left] + nums[right] < target:
                    count += right - left
                    left += 1
                else:
                    right -= 1
        return count`,
    jsCode: `var threeSumSmaller = function(nums, target) {
    nums.sort((a, b) => a - b);
    let count = 0;
    for (let i = 0; i < nums.length - 2; i++) {
        let left = i + 1, right = nums.length - 1;
        while (left < right) {
            if (nums[i] + nums[left] + nums[right] < target) {
                count += right - left;
                left++;
            } else {
                right--;
            }
        }
    }
    return count;
};`,
    explanation:
      '1. Sort the array to enable two-pointer technique.\n' +
      '2. Fix the first element at index i, then use left and right pointers.\n' +
      '3. If sum < target, every index between left and right gives a valid triplet, so add (right - left).\n' +
      '4. Move left forward to try the next combination. If sum >= target, decrement right.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sorting enables a two-pointer approach similar to 3Sum.',
      'When nums[i] + nums[left] + nums[right] < target, how many valid triplets include nums[left]?',
      'All elements from left+1 to right can pair with left, giving (right - left) valid triplets.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 260. Single Number III
  // ---------------------------------------------------------------------------
  {
    id: 260,
    description:
      'Given an integer array nums where exactly two elements appear once and all other elements appear twice, find the two elements that appear only once. Return them in any order. You must use O(1) extra space.',
    examples:
      'Input: nums = [1,2,1,3,2,5]\nOutput: [3,5]',
    approach:
      'XOR all numbers to get xor of the two unique numbers. Find any set bit in this XOR (a differing bit). Partition all numbers by this bit and XOR each group separately to isolate the two unique numbers.',
    code: `class Solution:
    def singleNumber(self, nums: list[int]) -> list[int]:
        xor_all = 0
        for n in nums:
            xor_all ^= n
        diff_bit = xor_all & (-xor_all)
        a, b = 0, 0
        for n in nums:
            if n & diff_bit:
                a ^= n
            else:
                b ^= n
        return [a, b]`,
    jsCode: `var singleNumber = function(nums) {
    let xorAll = 0;
    for (const n of nums) xorAll ^= n;
    const diffBit = xorAll & (-xorAll);
    let a = 0, b = 0;
    for (const n of nums) {
        if (n & diffBit) a ^= n;
        else b ^= n;
    }
    return [a, b];
};`,
    explanation:
      '1. XOR all numbers; duplicates cancel out, leaving xor of the two unique numbers.\n' +
      '2. Find the lowest set bit using xor_all & (-xor_all). This bit differs between the two unique numbers.\n' +
      '3. Partition all numbers into two groups based on whether that bit is set.\n' +
      '4. XOR within each group: duplicates cancel, leaving one unique number per group.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'XOR of all elements gives you xor of the two unique numbers.',
      'The two unique numbers differ in at least one bit. Use that bit to split numbers into two groups.',
      'Each group contains exactly one unique number, which you can isolate with XOR.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 261. Graph Valid Tree
  // ---------------------------------------------------------------------------
  {
    id: 261,
    description:
      'Given n nodes labeled from 0 to n-1 and a list of undirected edges, determine if these edges form a valid tree. A valid tree is a connected acyclic undirected graph.',
    examples:
      'Input: n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]\nOutput: true',
    approach:
      'A valid tree with n nodes must have exactly n-1 edges and be fully connected. Use Union-Find to check both conditions: if any edge connects two already-connected nodes, there is a cycle.',
    code: `class Solution:
    def validTree(self, n: int, edges: list[list[int]]) -> bool:
        if len(edges) != n - 1:
            return False
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for u, v in edges:
            pu, pv = find(u), find(v)
            if pu == pv:
                return False
            parent[pu] = pv
        return True`,
    jsCode: `var validTree = function(n, edges) {
    if (edges.length !== n - 1) return false;
    const parent = Array.from({length: n}, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    for (const [u, v] of edges) {
        const pu = find(u), pv = find(v);
        if (pu === pv) return false;
        parent[pu] = pv;
    }
    return true;
};`,
    explanation:
      '1. Check if the number of edges is exactly n-1 (necessary for a tree).\n' +
      '2. Initialize Union-Find with each node as its own parent.\n' +
      '3. For each edge, find the roots of both nodes.\n' +
      '4. If they share the same root, adding this edge would create a cycle — return False.\n' +
      '5. Otherwise, union them. If all edges pass, it is a valid tree.',
    timeComplexity: 'O(n * alpha(n)) — nearly O(n) with path compression',
    spaceComplexity: 'O(n)',
    hints: [
      'A tree with n nodes has exactly n-1 edges.',
      'Use Union-Find to detect cycles: if both endpoints are already connected, there is a cycle.',
      'Check both: n-1 edges AND no cycles.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 263. Ugly Number
  // ---------------------------------------------------------------------------
  {
    id: 263,
    description:
      'An ugly number is a positive integer whose prime factors are limited to 2, 3, and 5. Given an integer n, return true if n is an ugly number.',
    examples:
      'Input: n = 6\nOutput: true\nExplanation: 6 = 2 * 3',
    approach:
      'Repeatedly divide n by 2, 3, and 5 while divisible. If the result is 1, n is ugly. If n <= 0, return false immediately.',
    code: `class Solution:
    def isUgly(self, n: int) -> bool:
        if n <= 0:
            return False
        for p in [2, 3, 5]:
            while n % p == 0:
                n //= p
        return n == 1`,
    jsCode: `var isUgly = function(n) {
    if (n <= 0) return false;
    for (const p of [2, 3, 5]) {
        while (n % p === 0) {
            n = Math.floor(n / p);
        }
    }
    return n === 1;
};`,
    explanation:
      '1. If n is non-positive, return False (ugly numbers are positive).\n' +
      '2. Divide n by 2 as many times as possible.\n' +
      '3. Then divide by 3, then by 5.\n' +
      '4. If the remaining value is 1, all prime factors were 2, 3, or 5 — it is ugly.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Keep dividing by 2, 3, and 5 until you cannot anymore.',
      'If the final result is 1, the number is ugly.',
      'Handle edge cases: 0 and negative numbers are not ugly.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 264. Ugly Number II
  // ---------------------------------------------------------------------------
  {
    id: 264,
    description:
      'An ugly number is a positive integer whose prime factors are limited to 2, 3, and 5. Given an integer n, return the nth ugly number. The sequence starts with 1.',
    examples:
      'Input: n = 10\nOutput: 12\nExplanation: [1, 2, 3, 4, 5, 6, 8, 9, 10, 12] is the sequence of the first 10 ugly numbers.',
    approach:
      'Use three pointers for factors 2, 3, and 5. Maintain a DP array where each new ugly number is the minimum of ugly[i2]*2, ugly[i3]*3, ugly[i5]*5. Advance the pointer(s) whose product was chosen.',
    code: `class Solution:
    def nthUglyNumber(self, n: int) -> int:
        ugly = [0] * n
        ugly[0] = 1
        i2 = i3 = i5 = 0
        for i in range(1, n):
            next2, next3, next5 = ugly[i2]*2, ugly[i3]*3, ugly[i5]*5
            ugly[i] = min(next2, next3, next5)
            if ugly[i] == next2: i2 += 1
            if ugly[i] == next3: i3 += 1
            if ugly[i] == next5: i5 += 1
        return ugly[-1]`,
    jsCode: `var nthUglyNumber = function(n) {
    const ugly = new Array(n);
    ugly[0] = 1;
    let i2 = 0, i3 = 0, i5 = 0;
    for (let i = 1; i < n; i++) {
        const next2 = ugly[i2] * 2, next3 = ugly[i3] * 3, next5 = ugly[i5] * 5;
        ugly[i] = Math.min(next2, next3, next5);
        if (ugly[i] === next2) i2++;
        if (ugly[i] === next3) i3++;
        if (ugly[i] === next5) i5++;
    }
    return ugly[n - 1];
};`,
    explanation:
      '1. Start with ugly[0] = 1.\n' +
      '2. Maintain three pointers i2, i3, i5, each tracking which ugly number to multiply next.\n' +
      '3. The next ugly number is min(ugly[i2]*2, ugly[i3]*3, ugly[i5]*5).\n' +
      '4. Advance all pointers whose product equals the chosen minimum (handles duplicates).\n' +
      '5. Return the nth value.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Every ugly number is generated by multiplying a smaller ugly number by 2, 3, or 5.',
      'Use three pointers to track which ugly number to multiply by each factor next.',
      'Be careful to advance all pointers that match to avoid duplicates.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 265. Paint House II
  // ---------------------------------------------------------------------------
  {
    id: 265,
    description:
      'There are n houses in a row, each to be painted one of k colors. The cost of painting each house is given as an n x k matrix. No two adjacent houses can have the same color. Find the minimum total cost.',
    examples:
      'Input: costs = [[1,5,3],[2,9,4]]\nOutput: 5\nExplanation: Paint house 0 color 0 (cost 1), house 1 color 2 (cost 4). Total = 5.',
    approach:
      'Track only the two minimum costs from the previous row and their color indices. For each house, if the current color differs from the previous minimum color, add the first minimum; otherwise add the second minimum. This runs in O(nk) time.',
    code: `class Solution:
    def minCostII(self, costs: list[list[int]]) -> int:
        if not costs:
            return 0
        n, k = len(costs), len(costs[0])
        min1, min2, idx1 = 0, 0, -1
        for i in range(n):
            new_min1, new_min2, new_idx1 = float('inf'), float('inf'), -1
            for j in range(k):
                cost = costs[i][j] + (min1 if j != idx1 else min2)
                if cost < new_min1:
                    new_min2, new_min1, new_idx1 = new_min1, cost, j
                elif cost < new_min2:
                    new_min2 = cost
            min1, min2, idx1 = new_min1, new_min2, new_idx1
        return min1`,
    jsCode: `var minCostII = function(costs) {
    if (!costs.length) return 0;
    const n = costs.length, k = costs[0].length;
    let min1 = 0, min2 = 0, idx1 = -1;
    for (let i = 0; i < n; i++) {
        let newMin1 = Infinity, newMin2 = Infinity, newIdx1 = -1;
        for (let j = 0; j < k; j++) {
            const cost = costs[i][j] + (j !== idx1 ? min1 : min2);
            if (cost < newMin1) {
                newMin2 = newMin1;
                newMin1 = cost;
                newIdx1 = j;
            } else if (cost < newMin2) {
                newMin2 = cost;
            }
        }
        min1 = newMin1;
        min2 = newMin2;
        idx1 = newIdx1;
    }
    return min1;
};`,
    explanation:
      '1. Track min1 (smallest cost), min2 (second smallest), and idx1 (color of min1) from the previous house.\n' +
      '2. For each house and color, add min1 if the color differs from idx1, otherwise add min2.\n' +
      '3. Update the new minimums and their index.\n' +
      '4. Return min1 after processing all houses.',
    timeComplexity: 'O(n * k)',
    spaceComplexity: 'O(1)',
    hints: [
      'Extend the 3-color Paint House solution to k colors.',
      'Naive DP is O(nk^2). Can you optimize by tracking only the two smallest values from the previous row?',
      'You only need the minimum and second minimum from the previous row.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 266. Palindrome Permutation
  // ---------------------------------------------------------------------------
  {
    id: 266,
    description:
      'Given a string s, return true if a permutation of the string could form a palindrome. A palindrome reads the same forward and backward.',
    examples:
      'Input: s = "code"\nOutput: false\nInput: s = "aab"\nOutput: true',
    approach:
      'Count character frequencies. A string can form a palindrome if at most one character has an odd frequency (it would be the center character in an odd-length palindrome).',
    code: `class Solution:
    def canPermutePalindrome(self, s: str) -> bool:
        from collections import Counter
        counts = Counter(s)
        odd_count = sum(1 for c in counts.values() if c % 2 == 1)
        return odd_count <= 1`,
    jsCode: `var canPermutePalindrome = function(s) {
    const counts = new Map();
    for (const c of s) {
        counts.set(c, (counts.get(c) || 0) + 1);
    }
    let oddCount = 0;
    for (const c of counts.values()) {
        if (c % 2 === 1) oddCount++;
    }
    return oddCount <= 1;
};`,
    explanation:
      '1. Count the frequency of each character using Counter.\n' +
      '2. Count how many characters have an odd frequency.\n' +
      '3. If at most one character has an odd count, a palindrome permutation is possible.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) — at most 26 lowercase letters',
    hints: [
      'What property must character frequencies have for a palindrome?',
      'In a palindrome, each character appears an even number of times, except possibly one in the center.',
      'Count odd-frequency characters. If more than one, no palindrome is possible.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 269. Alien Dictionary
  // ---------------------------------------------------------------------------
  {
    id: 269,
    description:
      'There is a new alien language that uses the English alphabet, but the order among the letters is unknown. You are given a list of strings words from the alien dictionary sorted lexicographically. Derive the order of letters. If no valid ordering exists, return "".',
    examples:
      'Input: words = ["wrt","wrf","er","ett","rftt"]\nOutput: "wertf"',
    approach:
      'Build a directed graph from adjacent word comparisons: the first differing character gives an edge. Then perform topological sort using BFS (Kahn\'s algorithm). If a cycle is detected, return empty string.',
    code: `class Solution:
    def alienOrder(self, words: list[str]) -> str:
        from collections import defaultdict, deque
        adj = defaultdict(set)
        in_deg = {c: 0 for w in words for c in w}
        for i in range(len(words) - 1):
            w1, w2 = words[i], words[i+1]
            min_len = min(len(w1), len(w2))
            if len(w1) > len(w2) and w1[:min_len] == w2[:min_len]:
                return ""
            for j in range(min_len):
                if w1[j] != w2[j]:
                    if w2[j] not in adj[w1[j]]:
                        adj[w1[j]].add(w2[j])
                        in_deg[w2[j]] += 1
                    break
        queue = deque([c for c in in_deg if in_deg[c] == 0])
        result = []
        while queue:
            c = queue.popleft()
            result.append(c)
            for nei in adj[c]:
                in_deg[nei] -= 1
                if in_deg[nei] == 0:
                    queue.append(nei)
        return "".join(result) if len(result) == len(in_deg) else ""`,
    jsCode: `var alienOrder = function(words) {
    const adj = new Map();
    const inDeg = new Map();
    for (const w of words) {
        for (const c of w) {
            if (!inDeg.has(c)) inDeg.set(c, 0);
            if (!adj.has(c)) adj.set(c, new Set());
        }
    }
    for (let i = 0; i < words.length - 1; i++) {
        const w1 = words[i], w2 = words[i + 1];
        const minLen = Math.min(w1.length, w2.length);
        if (w1.length > w2.length && w1.substring(0, minLen) === w2.substring(0, minLen)) {
            return "";
        }
        for (let j = 0; j < minLen; j++) {
            if (w1[j] !== w2[j]) {
                if (!adj.get(w1[j]).has(w2[j])) {
                    adj.get(w1[j]).add(w2[j]);
                    inDeg.set(w2[j], inDeg.get(w2[j]) + 1);
                }
                break;
            }
        }
    }
    const queue = [];
    for (const [c, deg] of inDeg) {
        if (deg === 0) queue.push(c);
    }
    const result = [];
    while (queue.length) {
        const c = queue.shift();
        result.push(c);
        for (const nei of adj.get(c)) {
            inDeg.set(nei, inDeg.get(nei) - 1);
            if (inDeg.get(nei) === 0) queue.push(nei);
        }
    }
    return result.length === inDeg.size ? result.join('') : '';
};`,
    explanation:
      '1. Initialize in-degree for every character that appears in any word.\n' +
      '2. Compare adjacent words to find ordering constraints (first differing char gives a->b edge).\n' +
      '3. Detect invalid input: if a longer word is a prefix of a shorter word that comes after it.\n' +
      '4. Use BFS topological sort starting from zero in-degree characters.\n' +
      '5. If result length equals total characters, return it; otherwise a cycle exists.',
    timeComplexity: 'O(C) where C is total characters across all words',
    spaceComplexity: 'O(1) — at most 26 letters',
    hints: [
      'Compare adjacent words to extract ordering rules between characters.',
      'Build a directed graph and perform topological sort.',
      'If topological sort does not include all characters, there is a cycle.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 270. Closest Binary Search Tree Value
  // ---------------------------------------------------------------------------
  {
    id: 270,
    description:
      'Given the root of a binary search tree and a target value, return the value in the BST that is closest to the target. If there are multiple answers, return the smallest.',
    examples:
      'Input: root = [4,2,5,1,3], target = 3.714286\nOutput: 4',
    approach:
      'Traverse the BST. At each node, update the closest value. Go left if target < node.val, right otherwise. The BST property ensures we always move toward the target.',
    code: `class Solution:
    def closestValue(self, root, target: float) -> int:
        closest = root.val
        while root:
            if abs(root.val - target) < abs(closest - target) or \\
               (abs(root.val - target) == abs(closest - target) and root.val < closest):
                closest = root.val
            root = root.left if target < root.val else root.right
        return closest`,
    jsCode: `var closestValue = function(root, target) {
    let closest = root.val;
    while (root) {
        if (Math.abs(root.val - target) < Math.abs(closest - target) ||
            (Math.abs(root.val - target) === Math.abs(closest - target) && root.val < closest)) {
            closest = root.val;
        }
        root = target < root.val ? root.left : root.right;
    }
    return closest;
};`,
    explanation:
      '1. Initialize closest with the root value.\n' +
      '2. Traverse the BST iteratively.\n' +
      '3. At each node, update closest if this node is nearer to target (or equal distance but smaller).\n' +
      '4. Move left if target is smaller, right otherwise.',
    timeComplexity: 'O(h) where h is the height of the tree',
    spaceComplexity: 'O(1)',
    hints: [
      'Use BST property to decide which subtree to explore.',
      'Track the closest value seen so far.',
      'You only need to traverse one path from root to a leaf.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 271. Encode and Decode Strings
  // ---------------------------------------------------------------------------
  {
    id: 271,
    description:
      'Design an algorithm to encode a list of strings to a single string and decode it back. The encoded string is transmitted over the network and decoded back to the original list.',
    examples:
      'Input: ["Hello","World"]\nOutput: ["Hello","World"]\nExplanation: encode then decode returns the original list.',
    approach:
      'Use length-prefixed encoding: for each string, prepend its length followed by a delimiter character (e.g., "#"). When decoding, read the length, then extract exactly that many characters.',
    code: `class Codec:
    def encode(self, strs: list[str]) -> str:
        return ''.join(f'{len(s)}#{s}' for s in strs)

    def decode(self, s: str) -> list[str]:
        result = []
        i = 0
        while i < len(s):
            j = s.index('#', i)
            length = int(s[i:j])
            result.append(s[j+1:j+1+length])
            i = j + 1 + length
        return result`,
    jsCode: `var encode = function(strs) {
    return strs.map(s => s.length + '#' + s).join('');
};

var decode = function(s) {
    const result = [];
    let i = 0;
    while (i < s.length) {
        const j = s.indexOf('#', i);
        const length = parseInt(s.substring(i, j));
        result.push(s.substring(j + 1, j + 1 + length));
        i = j + 1 + length;
    }
    return result;
};`,
    explanation:
      '1. Encode: for each string, write its length, a "#" delimiter, then the string itself.\n' +
      '2. Decode: read characters until "#" to get the length.\n' +
      '3. Extract exactly "length" characters after the "#".\n' +
      '4. Move the pointer forward and repeat until the end of the encoded string.',
    timeComplexity: 'O(n) where n is total characters across all strings',
    spaceComplexity: 'O(n)',
    hints: [
      'You cannot just use a simple delimiter because the strings may contain any character.',
      'Prefix each string with its length so you know exactly how many characters to read.',
      'Use a separator between the length and the string content.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 273. Integer to English Words
  // ---------------------------------------------------------------------------
  {
    id: 273,
    description:
      'Convert a non-negative integer num to its English words representation. The input is guaranteed to be less than 2^31 - 1.',
    examples:
      'Input: num = 1234567\nOutput: "One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven"',
    approach:
      'Break the number into groups of three digits (ones, thousands, millions, billions). Convert each group to words using helper arrays for ones, teens, and tens. Append the appropriate scale word.',
    code: `class Solution:
    def numberToWords(self, num: int) -> str:
        if num == 0:
            return "Zero"
        ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
                "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
                "Seventeen","Eighteen","Nineteen"]
        tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"]
        thousands = ["","Thousand","Million","Billion"]
        def helper(n):
            if n == 0: return ""
            elif n < 20: return ones[n] + " "
            elif n < 100: return tens[n//10] + " " + helper(n%10)
            else: return ones[n//100] + " Hundred " + helper(n%100)
        result = ""
        for i, scale in enumerate(thousands):
            if num % 1000 != 0:
                result = helper(num % 1000) + scale + " " + result
            num //= 1000
        return result.strip()`,
    jsCode: `var numberToWords = function(num) {
    if (num === 0) return "Zero";
    const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
                   "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
                   "Seventeen","Eighteen","Nineteen"];
    const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
    const thousands = ["","Thousand","Million","Billion"];
    const helper = (n) => {
        if (n === 0) return "";
        if (n < 20) return ones[n] + " ";
        if (n < 100) return tens[Math.floor(n / 10)] + " " + helper(n % 10);
        return ones[Math.floor(n / 100)] + " Hundred " + helper(n % 100);
    };
    let result = "";
    for (let i = 0; i < thousands.length; i++) {
        if (num % 1000 !== 0) {
            result = helper(num % 1000) + thousands[i] + " " + result;
        }
        num = Math.floor(num / 1000);
    }
    return result.trim();
};`,
    explanation:
      '1. Handle zero as a special case.\n' +
      '2. Define lookup arrays for ones (0-19), tens (20-90), and scale words.\n' +
      '3. Helper function converts a number less than 1000 to words recursively.\n' +
      '4. Process the number in groups of three digits, prepending the scale word.\n' +
      '5. Strip trailing spaces and return.',
    timeComplexity: 'O(1) — bounded by the number of digits (at most 10)',
    spaceComplexity: 'O(1)',
    hints: [
      'Break the number into chunks of three digits.',
      'Handle special cases: numbers 0-19 (teens), 20-99 (tens), 100-999 (hundreds).',
      'Append scale words (Thousand, Million, Billion) for each group.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 274. H-Index
  // ---------------------------------------------------------------------------
  {
    id: 274,
    description:
      'Given an array of integers citations where citations[i] is the number of citations a researcher received for their ith paper, return the researcher\'s h-index. The h-index is the maximum value h such that the researcher has at least h papers with at least h citations.',
    examples:
      'Input: citations = [3,0,6,1,5]\nOutput: 3',
    approach:
      'Use counting sort. Create a bucket array of size n+1 where bucket[i] counts papers with i citations (bucket[n] counts papers with n or more). Traverse from the highest bucket down, accumulating the count until it reaches h.',
    code: `class Solution:
    def hIndex(self, citations: list[int]) -> int:
        n = len(citations)
        buckets = [0] * (n + 1)
        for c in citations:
            buckets[min(c, n)] += 1
        total = 0
        for h in range(n, -1, -1):
            total += buckets[h]
            if total >= h:
                return h
        return 0`,
    jsCode: `var hIndex = function(citations) {
    const n = citations.length;
    const buckets = new Array(n + 1).fill(0);
    for (const c of citations) {
        buckets[Math.min(c, n)]++;
    }
    let total = 0;
    for (let h = n; h >= 0; h--) {
        total += buckets[h];
        if (total >= h) return h;
    }
    return 0;
};`,
    explanation:
      '1. Create n+1 buckets; papers with >= n citations go into bucket n.\n' +
      '2. Traverse from the highest bucket downward, accumulating total papers.\n' +
      '3. The first h where total >= h is the h-index.\n' +
      '4. This avoids sorting and runs in O(n).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Sorting works in O(n log n). Can you do better with counting sort?',
      'Create buckets counting how many papers have each citation count.',
      'Traverse from the top: the first h where at least h papers have >= h citations is the answer.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 275. H-Index II
  // ---------------------------------------------------------------------------
  {
    id: 275,
    description:
      'Given an array of integers citations sorted in ascending order, return the researcher\'s h-index. The h-index is the maximum h such that the researcher has at least h papers with at least h citations each. Solve in O(log n) time.',
    examples:
      'Input: citations = [0,1,3,5,6]\nOutput: 3',
    approach:
      'Use binary search. For a sorted array of length n, if citations[mid] >= n - mid, then there are at least n - mid papers with at least citations[mid] citations. Search left for a larger h-index.',
    code: `class Solution:
    def hIndex(self, citations: list[int]) -> int:
        n = len(citations)
        lo, hi = 0, n - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if citations[mid] >= n - mid:
                hi = mid - 1
            else:
                lo = mid + 1
        return n - lo`,
    jsCode: `var hIndex = function(citations) {
    const n = citations.length;
    let lo = 0, hi = n - 1;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (citations[mid] >= n - mid) {
            hi = mid - 1;
        } else {
            lo = mid + 1;
        }
    }
    return n - lo;
};`,
    explanation:
      '1. Binary search for the leftmost index where citations[mid] >= n - mid.\n' +
      '2. n - mid represents the number of papers from index mid to the end.\n' +
      '3. If citations[mid] >= n - mid, move left to find a larger h.\n' +
      '4. The h-index is n - lo.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The array is sorted, so binary search is applicable.',
      'At index mid in a sorted array, there are n - mid papers with >= citations[mid] citations.',
      'Find the first index where citations[mid] >= n - mid.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 276. Paint Fence
  // ---------------------------------------------------------------------------
  {
    id: 276,
    description:
      'You are painting a fence of n posts with k different colors. Each post must be painted exactly one color, and no more than two adjacent fence posts can have the same color. Return the number of ways to paint the fence.',
    examples:
      'Input: n = 3, k = 2\nOutput: 6',
    approach:
      'Use DP tracking "same" (last two posts same color) and "diff" (different). same[i] = diff[i-1], diff[i] = (same[i-1] + diff[i-1]) * (k-1). The answer is same[n] + diff[n].',
    code: `class Solution:
    def numWays(self, n: int, k: int) -> int:
        if n == 0: return 0
        if n == 1: return k
        same = k
        diff = k * (k - 1)
        for i in range(3, n + 1):
            same, diff = diff, (same + diff) * (k - 1)
        return same + diff`,
    jsCode: `var numWays = function(n, k) {
    if (n === 0) return 0;
    if (n === 1) return k;
    let same = k;
    let diff = k * (k - 1);
    for (let i = 3; i <= n; i++) {
        const newSame = diff;
        const newDiff = (same + diff) * (k - 1);
        same = newSame;
        diff = newDiff;
    }
    return same + diff;
};`,
    explanation:
      '1. For n=1: k ways. For n=2: same=k (both same color), diff=k*(k-1) (different colors).\n' +
      '2. For each subsequent post, same = previous diff (can only match if previous two were different).\n' +
      '3. diff = (prev_same + prev_diff) * (k-1) (choose any of k-1 other colors).\n' +
      '4. Return same + diff.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Think about whether the last two posts are the same or different color.',
      'If the last two are the same, the one before them must be different.',
      'Track two states: same (last two match) and diff (last two differ).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 277. Find the Celebrity
  // ---------------------------------------------------------------------------
  {
    id: 277,
    description:
      'Among n people, a celebrity is someone known by everyone but knows nobody. Given a helper function knows(a, b) that returns whether a knows b, find the celebrity or return -1. Minimize calls to knows().',
    examples:
      'Input: graph = [[1,1,0],[0,1,0],[1,1,1]]\nOutput: 1',
    approach:
      'First pass: use elimination to find a candidate. If knows(a, b), a cannot be the celebrity, so move to b. Second pass: verify the candidate is known by everyone and knows nobody.',
    code: `class Solution:
    def findCelebrity(self, n: int) -> int:
        candidate = 0
        for i in range(1, n):
            if knows(candidate, i):
                candidate = i
        for i in range(n):
            if i != candidate:
                if knows(candidate, i) or not knows(i, candidate):
                    return -1
        return candidate`,
    jsCode: `var findCelebrity = function(n) {
    let candidate = 0;
    for (let i = 1; i < n; i++) {
        if (knows(candidate, i)) {
            candidate = i;
        }
    }
    for (let i = 0; i < n; i++) {
        if (i !== candidate) {
            if (knows(candidate, i) || !knows(i, candidate)) {
                return -1;
            }
        }
    }
    return candidate;
};`,
    explanation:
      '1. Start with candidate 0. For each person i, if candidate knows i, candidate cannot be the celebrity — switch to i.\n' +
      '2. After one pass, the candidate is the only possible celebrity.\n' +
      '3. Verify: check that candidate knows nobody and everyone knows candidate.\n' +
      '4. If verification passes, return candidate; otherwise return -1.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'If A knows B, then A is not the celebrity. If A does not know B, then B is not the celebrity.',
      'Each call to knows() eliminates one person.',
      'One pass finds a candidate; a second pass verifies.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 282. Expression Add Operators
  // ---------------------------------------------------------------------------
  {
    id: 282,
    description:
      'Given a string num of digits and an integer target, return all possible ways to insert the binary operators +, -, and * between the digits so that the resultant expression evaluates to the target value. Operands cannot have leading zeros.',
    examples:
      'Input: num = "123", target = 6\nOutput: ["1+2+3","1*2*3"]',
    approach:
      'Use backtracking. At each position, try all possible substrings as the next operand. Track the running total and the last operand (needed for multiplication precedence). For multiplication, undo the last addition and apply multiply first.',
    code: `class Solution:
    def addOperators(self, num: str, target: int) -> list[str]:
        result = []
        def backtrack(idx, path, total, last):
            if idx == len(num):
                if total == target:
                    result.append(path)
                return
            for i in range(idx, len(num)):
                if i > idx and num[idx] == '0':
                    break
                cur = int(num[idx:i+1])
                if idx == 0:
                    backtrack(i+1, str(cur), cur, cur)
                else:
                    backtrack(i+1, path+'+'+str(cur), total+cur, cur)
                    backtrack(i+1, path+'-'+str(cur), total-cur, -cur)
                    backtrack(i+1, path+'*'+str(cur), total-last+last*cur, last*cur)
        backtrack(0, '', 0, 0)
        return result`,
    jsCode: `var addOperators = function(num, target) {
    const result = [];
    const backtrack = (idx, path, total, last) => {
        if (idx === num.length) {
            if (total === target) result.push(path);
            return;
        }
        for (let i = idx; i < num.length; i++) {
            if (i > idx && num[idx] === '0') break;
            const cur = parseInt(num.substring(idx, i + 1));
            if (idx === 0) {
                backtrack(i + 1, String(cur), cur, cur);
            } else {
                backtrack(i + 1, path + '+' + cur, total + cur, cur);
                backtrack(i + 1, path + '-' + cur, total - cur, -cur);
                backtrack(i + 1, path + '*' + cur, total - last + last * cur, last * cur);
            }
        }
    };
    backtrack(0, '', 0, 0);
    return result;
};`,
    explanation:
      '1. Use backtracking starting from index 0.\n' +
      '2. At each step, try substrings of increasing length as the next number.\n' +
      '3. Skip substrings with leading zeros (except "0" itself).\n' +
      '4. For +/-, update total normally. For *, undo the last operand and apply multiplication.\n' +
      '5. When the entire string is consumed, check if total equals target.',
    timeComplexity: 'O(4^n) where n is the length of the string',
    spaceComplexity: 'O(n)',
    hints: [
      'Try all possible split points and operators using backtracking.',
      'To handle * correctly, track the last operand to undo and reapply.',
      'Watch for leading zeros in multi-digit numbers.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 285. Inorder Successor in BST
  // ---------------------------------------------------------------------------
  {
    id: 285,
    description:
      'Given the root of a binary search tree and a node p in it, return the in-order successor of that node. The successor is the node with the smallest key greater than p.val. If no successor exists, return null.',
    examples:
      'Input: root = [2,1,3], p = 1\nOutput: 2',
    approach:
      'Traverse the BST from root. When going left (current > p), the current node is a potential successor. When going right (current <= p), the successor must be further right. Track the last left-turn node.',
    code: `class Solution:
    def inorderSuccessor(self, root, p):
        successor = None
        while root:
            if p.val < root.val:
                successor = root
                root = root.left
            else:
                root = root.right
        return successor`,
    jsCode: `var inorderSuccessor = function(root, p) {
    let successor = null;
    while (root) {
        if (p.val < root.val) {
            successor = root;
            root = root.left;
        } else {
            root = root.right;
        }
    }
    return successor;
};`,
    explanation:
      '1. Start from the root with successor = None.\n' +
      '2. If p.val < root.val, root could be the successor, so save it and go left for a closer one.\n' +
      '3. If p.val >= root.val, the successor must be in the right subtree.\n' +
      '4. Return the last saved successor.',
    timeComplexity: 'O(h) where h is the height of the tree',
    spaceComplexity: 'O(1)',
    hints: [
      'The successor is the smallest node larger than p.',
      'Use BST property: go left when current is greater, go right otherwise.',
      'Track the last node where you went left — that is your candidate.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 286. Walls and Gates
  // ---------------------------------------------------------------------------
  {
    id: 286,
    description:
      'You are given an m x n grid rooms where -1 represents a wall, 0 represents a gate, and INF (2^31 - 1) represents an empty room. Fill each empty room with the distance to its nearest gate. If impossible to reach a gate, leave it as INF.',
    examples:
      'Input: rooms = [[INF,-1,0,INF],[INF,INF,INF,-1],[INF,-1,INF,-1],[0,-1,INF,INF]]\nOutput: [[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]',
    approach:
      'Use multi-source BFS starting from all gates simultaneously. Add all gate positions to the queue first, then expand level by level. Each empty room gets the distance of the level at which it is first reached.',
    code: `class Solution:
    def wallsAndGates(self, rooms: list[list[int]]) -> None:
        from collections import deque
        if not rooms:
            return
        m, n = len(rooms), len(rooms[0])
        INF = 2147483647
        queue = deque()
        for i in range(m):
            for j in range(n):
                if rooms[i][j] == 0:
                    queue.append((i, j))
        while queue:
            r, c = queue.popleft()
            for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                nr, nc = r+dr, c+dc
                if 0 <= nr < m and 0 <= nc < n and rooms[nr][nc] == INF:
                    rooms[nr][nc] = rooms[r][c] + 1
                    queue.append((nr, nc))`,
    jsCode: `var wallsAndGates = function(rooms) {
    if (!rooms.length) return;
    const m = rooms.length, n = rooms[0].length;
    const INF = 2147483647;
    const queue = [];
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (rooms[i][j] === 0) queue.push([i, j]);
        }
    }
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    let idx = 0;
    while (idx < queue.length) {
        const [r, c] = queue[idx++];
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && rooms[nr][nc] === INF) {
                rooms[nr][nc] = rooms[r][c] + 1;
                queue.push([nr, nc]);
            }
        }
    }
};`,
    explanation:
      '1. Find all gates (cells with value 0) and add them to the BFS queue.\n' +
      '2. Perform BFS: for each cell, check all 4 neighbors.\n' +
      '3. If a neighbor is an empty room (INF), set its distance to current + 1 and enqueue it.\n' +
      '4. Multi-source BFS guarantees each room gets the shortest distance to any gate.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Instead of BFS from each empty room, start BFS from all gates simultaneously.',
      'Multi-source BFS visits each cell at most once.',
      'A cell is updated only when first reached, ensuring the shortest distance.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 289. Game of Life
  // ---------------------------------------------------------------------------
  {
    id: 289,
    description:
      'Given an m x n board of cells (0 = dead, 1 = alive), compute the next state using the rules of Conway\'s Game of Life. Apply all rules simultaneously. A live cell with 2-3 live neighbors survives; a dead cell with exactly 3 live neighbors becomes alive; all other live cells die.',
    examples:
      'Input: board = [[0,1,0],[0,0,1],[1,1,1],[0,0,0]]\nOutput: [[0,0,0],[1,0,1],[0,1,1],[0,1,0]]',
    approach:
      'Use in-place encoding with extra states: 2 means was alive but now dead, 3 means was dead but now alive. Count neighbors using original state (value % 2). After processing, convert: 0,2 -> 0; 1,3 -> 1.',
    code: `class Solution:
    def gameOfLife(self, board: list[list[int]]) -> None:
        m, n = len(board), len(board[0])
        for i in range(m):
            for j in range(n):
                live = 0
                for di in range(-1, 2):
                    for dj in range(-1, 2):
                        if di == 0 and dj == 0: continue
                        ni, nj = i+di, j+dj
                        if 0 <= ni < m and 0 <= nj < n and board[ni][nj] % 2 == 1:
                            live += 1
                if board[i][j] == 1 and (live < 2 or live > 3):
                    board[i][j] = 2
                elif board[i][j] == 0 and live == 3:
                    board[i][j] = 3
        for i in range(m):
            for j in range(n):
                board[i][j] = 1 if board[i][j] % 2 == 1 else 0`,
    jsCode: `var gameOfLife = function(board) {
    const m = board.length, n = board[0].length;
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            let live = 0;
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue;
                    const ni = i + di, nj = j + dj;
                    if (ni >= 0 && ni < m && nj >= 0 && nj < n && board[ni][nj] % 2 === 1) {
                        live++;
                    }
                }
            }
            if (board[i][j] === 1 && (live < 2 || live > 3)) {
                board[i][j] = 2;
            } else if (board[i][j] === 0 && live === 3) {
                board[i][j] = 3;
            }
        }
    }
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            board[i][j] = board[i][j] % 2 === 1 ? 1 : 0;
        }
    }
};`,
    explanation:
      '1. Use state encoding: 2 = was alive, now dead; 3 = was dead, now alive.\n' +
      '2. Original state is recovered via value % 2 (works for 0,1,2,3).\n' +
      '3. Count live neighbors for each cell using the original state.\n' +
      '4. Apply rules to set new states.\n' +
      '5. Final pass converts encoded values back to 0 or 1.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The challenge is applying all rules simultaneously without extra space.',
      'Encode transitions in the cell values so you can recover the original state.',
      'Use modulo to read the original state from an encoded value.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 290. Word Pattern
  // ---------------------------------------------------------------------------
  {
    id: 290,
    description:
      'Given a pattern string and a string s, determine if s follows the same pattern. Each letter in pattern maps to a non-empty word in s, forming a bijection (one-to-one and onto).',
    examples:
      'Input: pattern = "abba", s = "dog cat cat dog"\nOutput: true',
    approach:
      'Split s into words. Use two hash maps: one mapping pattern characters to words and another mapping words to pattern characters. Ensure the mapping is consistent and bijective.',
    code: `class Solution:
    def wordPattern(self, pattern: str, s: str) -> bool:
        words = s.split()
        if len(pattern) != len(words):
            return False
        char_to_word = {}
        word_to_char = {}
        for c, w in zip(pattern, words):
            if c in char_to_word and char_to_word[c] != w:
                return False
            if w in word_to_char and word_to_char[w] != c:
                return False
            char_to_word[c] = w
            word_to_char[w] = c
        return True`,
    jsCode: `var wordPattern = function(pattern, s) {
    const words = s.split(' ');
    if (pattern.length !== words.length) return false;
    const charToWord = new Map();
    const wordToChar = new Map();
    for (let i = 0; i < pattern.length; i++) {
        const c = pattern[i], w = words[i];
        if (charToWord.has(c) && charToWord.get(c) !== w) return false;
        if (wordToChar.has(w) && wordToChar.get(w) !== c) return false;
        charToWord.set(c, w);
        wordToChar.set(w, c);
    }
    return true;
};`,
    explanation:
      '1. Split s into words and check if count matches pattern length.\n' +
      '2. Maintain two maps: char->word and word->char.\n' +
      '3. For each pair, verify consistency in both directions.\n' +
      '4. If any conflict is found, return False.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'This is like checking if two sequences are isomorphic.',
      'Use two maps to ensure the mapping is bijective (one-to-one in both directions).',
      'Do not forget to check that the number of pattern characters matches the number of words.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 296. Best Meeting Point
  // ---------------------------------------------------------------------------
  {
    id: 296,
    description:
      'Given an m x n binary grid where 1 represents a friend\'s home, find a meeting point that minimizes the total Manhattan distance from all homes. Return the minimum total distance.',
    examples:
      'Input: grid = [[1,0,0,0,1],[0,0,0,0,0],[0,0,1,0,0]]\nOutput: 6',
    approach:
      'The optimal meeting point is at the median of all row coordinates and the median of all column coordinates. Collect all rows and columns separately, sort them, and compute the sum of distances to the median.',
    code: `class Solution:
    def minTotalDistance(self, grid: list[list[int]]) -> int:
        rows, cols = [], []
        for i in range(len(grid)):
            for j in range(len(grid[0])):
                if grid[i][j] == 1:
                    rows.append(i)
                    cols.append(j)
        cols.sort()
        def min_dist(points):
            mid = points[len(points)//2]
            return sum(abs(p - mid) for p in points)
        return min_dist(rows) + min_dist(cols)`,
    jsCode: `var minTotalDistance = function(grid) {
    const rows = [], cols = [];
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === 1) {
                rows.push(i);
                cols.push(j);
            }
        }
    }
    cols.sort((a, b) => a - b);
    const minDist = (points) => {
        const mid = points[Math.floor(points.length / 2)];
        return points.reduce((sum, p) => sum + Math.abs(p - mid), 0);
    };
    return minDist(rows) + minDist(cols);
};`,
    explanation:
      '1. Collect all row and column indices of homes.\n' +
      '2. Rows are already sorted by the traversal order; sort columns.\n' +
      '3. The 1D optimal meeting point is the median.\n' +
      '4. Sum the distances to the median for rows and columns independently.\n' +
      '5. Manhattan distance is separable: total = row_dist + col_dist.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(k) where k is the number of friends',
    hints: [
      'Manhattan distance can be decomposed into independent x and y components.',
      'In 1D, the point minimizing total distance is the median.',
      'Collect all row indices and column indices separately.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 298. Binary Tree Longest Consecutive Sequence
  // ---------------------------------------------------------------------------
  {
    id: 298,
    description:
      'Given the root of a binary tree, return the length of the longest consecutive sequence path. The path must go from parent to child (top-down), and consecutive means values increase by 1.',
    examples:
      'Input: root = [1,null,3,2,4,null,null,null,5]\nOutput: 3\nExplanation: Longest consecutive sequence is 3->4->5.',
    approach:
      'Use DFS passing the current length and the expected next value. If the current node matches the expected value, increment the length. Otherwise, reset to 1. Track the global maximum.',
    code: `class Solution:
    def longestConsecutive(self, root) -> int:
        self.max_len = 0
        def dfs(node, parent_val, length):
            if not node:
                return
            if node.val == parent_val + 1:
                length += 1
            else:
                length = 1
            self.max_len = max(self.max_len, length)
            dfs(node.left, node.val, length)
            dfs(node.right, node.val, length)
        dfs(root, float('-inf'), 0)
        return self.max_len`,
    jsCode: `var longestConsecutive = function(root) {
    let maxLen = 0;
    const dfs = (node, parentVal, length) => {
        if (!node) return;
        if (node.val === parentVal + 1) {
            length++;
        } else {
            length = 1;
        }
        maxLen = Math.max(maxLen, length);
        dfs(node.left, node.val, length);
        dfs(node.right, node.val, length);
    };
    dfs(root, -Infinity, 0);
    return maxLen;
};`,
    explanation:
      '1. DFS with parent value and current consecutive length.\n' +
      '2. If current node value = parent + 1, extend the sequence.\n' +
      '3. Otherwise, reset length to 1.\n' +
      '4. Update the global maximum at each node.\n' +
      '5. Recurse on both children.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) — recursion stack depth',
    hints: [
      'DFS and pass down the expected value and current length.',
      'Reset the sequence when the current value does not equal parent + 1.',
      'Track the global maximum across all DFS calls.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 299. Bulls and Cows
  // ---------------------------------------------------------------------------
  {
    id: 299,
    description:
      'You are playing Bulls and Cows. You write a secret number and ask your friend to guess. For each guess, you provide a hint: the number of bulls (correct digit in correct position) and cows (correct digit in wrong position). Return the hint as "xAyB".',
    examples:
      'Input: secret = "1807", guess = "7810"\nOutput: "1A3B"',
    approach:
      'First pass: count bulls (matching positions). Second pass (or same pass): use a frequency array for unmatched digits. Increment for secret digits, decrement for guess digits. A cow is detected when the counter crosses zero.',
    code: `class Solution:
    def getHint(self, secret: str, guess: str) -> str:
        bulls = 0
        cows = 0
        count = [0] * 10
        for s, g in zip(secret, guess):
            if s == g:
                bulls += 1
            else:
                if count[int(s)] < 0: cows += 1
                if count[int(g)] > 0: cows += 1
                count[int(s)] += 1
                count[int(g)] -= 1
        return f"{bulls}A{cows}B"`,
    jsCode: `var getHint = function(secret, guess) {
    let bulls = 0, cows = 0;
    const count = new Array(10).fill(0);
    for (let i = 0; i < secret.length; i++) {
        const s = parseInt(secret[i]), g = parseInt(guess[i]);
        if (s === g) {
            bulls++;
        } else {
            if (count[s] < 0) cows++;
            if (count[g] > 0) cows++;
            count[s]++;
            count[g]--;
        }
    }
    return bulls + "A" + cows + "B";
};`,
    explanation:
      '1. For each position, if secret[i] == guess[i], it is a bull.\n' +
      '2. Otherwise, check the count array: if count[secret_digit] < 0, a previous guess used this digit (cow). If count[guess_digit] > 0, a previous secret had this digit (cow).\n' +
      '3. Update counts: +1 for secret digit, -1 for guess digit.\n' +
      '4. Return formatted string "xAyB".',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Bulls are easy: just compare positions directly.',
      'For cows, you need to count unmatched digits from both secret and guess.',
      'A single count array with +1 for secret and -1 for guess can detect cows in one pass.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 301. Remove Invalid Parentheses
  // ---------------------------------------------------------------------------
  {
    id: 301,
    description:
      'Given a string s containing parentheses and letters, remove the minimum number of invalid parentheses to make the string valid. Return all unique results.',
    examples:
      'Input: s = "()())()"\nOutput: ["(())()","()()()"]',
    approach:
      'First count the minimum number of open and close parentheses to remove. Then use backtracking: at each position, decide to keep or remove the character. Prune branches that exceed the removal counts.',
    code: `class Solution:
    def removeInvalidParentheses(self, s: str) -> list[str]:
        left_rem = right_rem = 0
        for c in s:
            if c == '(':
                left_rem += 1
            elif c == ')':
                if left_rem > 0:
                    left_rem -= 1
                else:
                    right_rem += 1
        result = set()
        def backtrack(idx, open_count, left_rem, right_rem, path):
            if idx == len(s):
                if left_rem == 0 and right_rem == 0 and open_count == 0:
                    result.add(path)
                return
            c = s[idx]
            if c == '(':
                if left_rem > 0:
                    backtrack(idx+1, open_count, left_rem-1, right_rem, path)
                backtrack(idx+1, open_count+1, left_rem, right_rem, path+c)
            elif c == ')':
                if right_rem > 0:
                    backtrack(idx+1, open_count, left_rem, right_rem-1, path)
                if open_count > 0:
                    backtrack(idx+1, open_count-1, left_rem, right_rem, path+c)
            else:
                backtrack(idx+1, open_count, left_rem, right_rem, path+c)
        backtrack(0, 0, left_rem, right_rem, '')
        return list(result)`,
    jsCode: `var removeInvalidParentheses = function(s) {
    let leftRem = 0, rightRem = 0;
    for (const c of s) {
        if (c === '(') leftRem++;
        else if (c === ')') {
            if (leftRem > 0) leftRem--;
            else rightRem++;
        }
    }
    const result = new Set();
    const backtrack = (idx, openCount, leftRem, rightRem, path) => {
        if (idx === s.length) {
            if (leftRem === 0 && rightRem === 0 && openCount === 0) {
                result.add(path);
            }
            return;
        }
        const c = s[idx];
        if (c === '(') {
            if (leftRem > 0) backtrack(idx + 1, openCount, leftRem - 1, rightRem, path);
            backtrack(idx + 1, openCount + 1, leftRem, rightRem, path + c);
        } else if (c === ')') {
            if (rightRem > 0) backtrack(idx + 1, openCount, leftRem, rightRem - 1, path);
            if (openCount > 0) backtrack(idx + 1, openCount - 1, leftRem, rightRem, path + c);
        } else {
            backtrack(idx + 1, openCount, leftRem, rightRem, path + c);
        }
    };
    backtrack(0, 0, leftRem, rightRem, '');
    return [...result];
};`,
    explanation:
      '1. Count minimum removals needed: left_rem (extra open) and right_rem (extra close).\n' +
      '2. Backtrack through the string, choosing to keep or remove each parenthesis.\n' +
      '3. Removing decrements the appropriate removal counter.\n' +
      '4. Keeping a ")" requires open_count > 0 (a matching open parenthesis).\n' +
      '5. At the end, if all counters are zero, the path is valid.',
    timeComplexity: 'O(2^n) in the worst case',
    spaceComplexity: 'O(n)',
    hints: [
      'First determine the minimum number of ( and ) to remove.',
      'Use backtracking with pruning: do not remove more than the computed minimums.',
      'Use a set to avoid duplicate results.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 303. Range Sum Query - Immutable
  // ---------------------------------------------------------------------------
  {
    id: 303,
    description:
      'Given an integer array nums, handle multiple queries of the type: calculate the sum of elements between indices left and right inclusive.',
    examples:
      'Input: nums = [-2,0,3,-5,2,-1], sumRange(0,2)\nOutput: 1\nExplanation: (-2) + 0 + 3 = 1',
    approach:
      'Precompute a prefix sum array where prefix[i] = sum of nums[0..i-1]. Then sumRange(left, right) = prefix[right+1] - prefix[left]. Each query is answered in O(1).',
    code: `class NumArray:
    def __init__(self, nums: list[int]):
        self.prefix = [0] * (len(nums) + 1)
        for i in range(len(nums)):
            self.prefix[i+1] = self.prefix[i] + nums[i]

    def sumRange(self, left: int, right: int) -> int:
        return self.prefix[right+1] - self.prefix[left]`,
    jsCode: `var NumArray = function(nums) {
    this.prefix = new Array(nums.length + 1).fill(0);
    for (let i = 0; i < nums.length; i++) {
        this.prefix[i + 1] = this.prefix[i] + nums[i];
    }
};

NumArray.prototype.sumRange = function(left, right) {
    return this.prefix[right + 1] - this.prefix[left];
};`,
    explanation:
      '1. Build prefix sum array where prefix[i] = sum of nums[0..i-1].\n' +
      '2. prefix[0] = 0 as a sentinel.\n' +
      '3. sumRange(left, right) = prefix[right+1] - prefix[left].\n' +
      '4. This gives O(1) per query after O(n) preprocessing.',
    timeComplexity: 'O(n) init, O(1) per query',
    spaceComplexity: 'O(n)',
    hints: [
      'Precompute prefix sums so each range query is O(1).',
      'prefix[i] stores the sum of the first i elements.',
      'The sum from left to right is prefix[right+1] - prefix[left].',
    ],
  },

  // ---------------------------------------------------------------------------
  // 304. Range Sum Query 2D - Immutable
  // ---------------------------------------------------------------------------
  {
    id: 304,
    description:
      'Given a 2D matrix, handle queries to calculate the sum of elements inside the rectangle defined by its upper left corner (row1, col1) and lower right corner (row2, col2).',
    examples:
      'Input: matrix = [[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]], sumRegion(2,1,4,3)\nOutput: 8',
    approach:
      'Precompute a 2D prefix sum matrix. The sum of a rectangle can be computed using inclusion-exclusion in O(1) per query.',
    code: `class NumMatrix:
    def __init__(self, matrix: list[list[int]]):
        m, n = len(matrix), len(matrix[0])
        self.prefix = [[0]*(n+1) for _ in range(m+1)]
        for i in range(1, m+1):
            for j in range(1, n+1):
                self.prefix[i][j] = (matrix[i-1][j-1] + self.prefix[i-1][j]
                    + self.prefix[i][j-1] - self.prefix[i-1][j-1])

    def sumRegion(self, row1: int, col1: int, row2: int, col2: int) -> int:
        return (self.prefix[row2+1][col2+1] - self.prefix[row1][col2+1]
                - self.prefix[row2+1][col1] + self.prefix[row1][col1])`,
    jsCode: `var NumMatrix = function(matrix) {
    const m = matrix.length, n = matrix[0].length;
    this.prefix = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            this.prefix[i][j] = matrix[i-1][j-1] + this.prefix[i-1][j]
                + this.prefix[i][j-1] - this.prefix[i-1][j-1];
        }
    }
};

NumMatrix.prototype.sumRegion = function(row1, col1, row2, col2) {
    return this.prefix[row2+1][col2+1] - this.prefix[row1][col2+1]
        - this.prefix[row2+1][col1] + this.prefix[row1][col1];
};`,
    explanation:
      '1. Build 2D prefix sum where prefix[i][j] = sum of matrix[0..i-1][0..j-1].\n' +
      '2. Use inclusion-exclusion: sum of rectangle = prefix[r2+1][c2+1] - prefix[r1][c2+1] - prefix[r2+1][c1] + prefix[r1][c1].\n' +
      '3. Each query is O(1) after O(m*n) preprocessing.',
    timeComplexity: 'O(m*n) init, O(1) per query',
    spaceComplexity: 'O(m*n)',
    hints: [
      'Extend 1D prefix sums to 2D.',
      'prefix[i][j] = sum of all elements in the submatrix from (0,0) to (i-1,j-1).',
      'Use inclusion-exclusion to compute any rectangular sum.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 305. Number of Islands II
  // ---------------------------------------------------------------------------
  {
    id: 305,
    description:
      'Given a grid of size m x n initially filled with water, you perform addLand operations at given positions. After each operation, return the number of islands. An island is a group of connected 1s (4-directionally).',
    examples:
      'Input: m = 3, n = 3, positions = [[0,0],[0,1],[1,2],[2,1]]\nOutput: [1,1,2,3]',
    approach:
      'Use Union-Find. For each addLand operation, create a new island and try to union it with any adjacent land cells. Track the count of distinct islands: increment on add, decrement on each successful union.',
    code: `class Solution:
    def numIslands2(self, m: int, n: int, positions: list[list[int]]) -> list[int]:
        parent = {}
        rank = {}
        count = 0
        result = []
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        def union(a, b):
            nonlocal count
            ra, rb = find(a), find(b)
            if ra == rb: return
            if rank.get(ra,0) < rank.get(rb,0): ra, rb = rb, ra
            parent[rb] = ra
            if rank.get(ra,0) == rank.get(rb,0):
                rank[ra] = rank.get(ra,0) + 1
            count -= 1
        for r, c in positions:
            if (r, c) in parent:
                result.append(count)
                continue
            parent[(r,c)] = (r,c)
            count += 1
            for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                nr, nc = r+dr, c+dc
                if (nr, nc) in parent:
                    union((r,c),(nr,nc))
            result.append(count)
        return result`,
    jsCode: `var numIslands2 = function(m, n, positions) {
    const parent = new Map();
    const rank = new Map();
    let count = 0;
    const result = [];
    const find = (x) => {
        while (parent.get(x) !== x) {
            parent.set(x, parent.get(parent.get(x)));
            x = parent.get(x);
        }
        return x;
    };
    const union = (a, b) => {
        let ra = find(a), rb = find(b);
        if (ra === rb) return;
        const rankA = rank.get(ra) || 0, rankB = rank.get(rb) || 0;
        if (rankA < rankB) [ra, rb] = [rb, ra];
        parent.set(rb, ra);
        if (rankA === rankB) rank.set(ra, rankA + 1);
        count--;
    };
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    for (const [r, c] of positions) {
        const key = r * n + c;
        if (parent.has(key)) {
            result.push(count);
            continue;
        }
        parent.set(key, key);
        count++;
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            const nKey = nr * n + nc;
            if (parent.has(nKey)) {
                union(key, nKey);
            }
        }
        result.push(count);
    }
    return result;
};`,
    explanation:
      '1. Use Union-Find with path compression and union by rank.\n' +
      '2. For each addLand, create a new component (count++).\n' +
      '3. Check all 4 neighbors; if any is land, union them (count-- per successful union).\n' +
      '4. Skip duplicate positions.\n' +
      '5. Append current count to results after each operation.',
    timeComplexity: 'O(k * alpha(m*n)) where k is number of operations',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Union-Find is ideal for dynamic connectivity problems.',
      'Each addLand creates a new component; unions with neighbors reduce the count.',
      'Handle duplicate positions by checking if a cell is already land.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 307. Range Sum Query - Mutable
  // ---------------------------------------------------------------------------
  {
    id: 307,
    description:
      'Given an integer array nums, implement a data structure that supports updating elements and querying the sum of a range of elements efficiently.',
    examples:
      'Input: nums = [1,3,5], update(1,2), sumRange(0,2)\nOutput: 8\nExplanation: After update, nums = [1,2,5], sum(0,2) = 8.',
    approach:
      'Use a Binary Indexed Tree (Fenwick Tree) for O(log n) update and O(log n) range sum queries. The BIT stores partial sums in a compact array structure.',
    code: `class NumArray:
    def __init__(self, nums: list[int]):
        self.n = len(nums)
        self.nums = [0] * self.n
        self.tree = [0] * (self.n + 1)
        for i, v in enumerate(nums):
            self.update(i, v)

    def update(self, index: int, val: int) -> None:
        delta = val - self.nums[index]
        self.nums[index] = val
        i = index + 1
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)

    def _prefix(self, i):
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= i & (-i)
        return s

    def sumRange(self, left: int, right: int) -> int:
        return self._prefix(right + 1) - self._prefix(left)`,
    jsCode: `var NumArray = function(nums) {
    this.n = nums.length;
    this.nums = new Array(this.n).fill(0);
    this.tree = new Array(this.n + 1).fill(0);
    for (let i = 0; i < nums.length; i++) {
        this.update(i, nums[i]);
    }
};

NumArray.prototype.update = function(index, val) {
    const delta = val - this.nums[index];
    this.nums[index] = val;
    let i = index + 1;
    while (i <= this.n) {
        this.tree[i] += delta;
        i += i & (-i);
    }
};

NumArray.prototype._prefix = function(i) {
    let s = 0;
    while (i > 0) {
        s += this.tree[i];
        i -= i & (-i);
    }
    return s;
};

NumArray.prototype.sumRange = function(left, right) {
    return this._prefix(right + 1) - this._prefix(left);
};`,
    explanation:
      '1. Build a Fenwick tree (BIT) supporting point updates and prefix sum queries.\n' +
      '2. update: compute delta, then propagate up the tree using i += i & (-i).\n' +
      '3. _prefix: sum from index 1 to i by traversing down using i -= i & (-i).\n' +
      '4. sumRange(l, r) = prefix(r+1) - prefix(l).',
    timeComplexity: 'O(log n) per update and query',
    spaceComplexity: 'O(n)',
    hints: [
      'A simple prefix sum array does not support efficient updates.',
      'A Fenwick tree (BIT) gives O(log n) for both update and query.',
      'Alternatively, use a segment tree.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 308. Range Sum Query 2D - Mutable
  // ---------------------------------------------------------------------------
  {
    id: 308,
    description:
      'Given a 2D matrix, implement a data structure that supports updating individual elements and querying the sum of elements in a rectangular region.',
    examples:
      'Input: matrix = [[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]], update(3,2,2), sumRegion(2,1,4,3)\nOutput: 10',
    approach:
      'Use a 2D Binary Indexed Tree (Fenwick Tree). Extend the 1D BIT to two dimensions for O(log m * log n) updates and queries.',
    code: `class NumMatrix:
    def __init__(self, matrix: list[list[int]]):
        self.m, self.n = len(matrix), len(matrix[0])
        self.matrix = [[0]*self.n for _ in range(self.m)]
        self.tree = [[0]*(self.n+1) for _ in range(self.m+1)]
        for i in range(self.m):
            for j in range(self.n):
                self.update(i, j, matrix[i][j])

    def update(self, row: int, col: int, val: int) -> None:
        delta = val - self.matrix[row][col]
        self.matrix[row][col] = val
        i = row + 1
        while i <= self.m:
            j = col + 1
            while j <= self.n:
                self.tree[i][j] += delta
                j += j & (-j)
            i += i & (-i)

    def _prefix(self, row, col):
        s = 0
        i = row
        while i > 0:
            j = col
            while j > 0:
                s += self.tree[i][j]
                j -= j & (-j)
            i -= i & (-i)
        return s

    def sumRegion(self, row1: int, col1: int, row2: int, col2: int) -> int:
        return (self._prefix(row2+1,col2+1) - self._prefix(row1,col2+1)
                - self._prefix(row2+1,col1) + self._prefix(row1,col1))`,
    jsCode: `var NumMatrix = function(matrix) {
    this.m = matrix.length;
    this.n = matrix[0].length;
    this.matrix = Array.from({length: this.m}, () => new Array(this.n).fill(0));
    this.tree = Array.from({length: this.m + 1}, () => new Array(this.n + 1).fill(0));
    for (let i = 0; i < this.m; i++) {
        for (let j = 0; j < this.n; j++) {
            this.update(i, j, matrix[i][j]);
        }
    }
};

NumMatrix.prototype.update = function(row, col, val) {
    const delta = val - this.matrix[row][col];
    this.matrix[row][col] = val;
    let i = row + 1;
    while (i <= this.m) {
        let j = col + 1;
        while (j <= this.n) {
            this.tree[i][j] += delta;
            j += j & (-j);
        }
        i += i & (-i);
    }
};

NumMatrix.prototype._prefix = function(row, col) {
    let s = 0;
    let i = row;
    while (i > 0) {
        let j = col;
        while (j > 0) {
            s += this.tree[i][j];
            j -= j & (-j);
        }
        i -= i & (-i);
    }
    return s;
};

NumMatrix.prototype.sumRegion = function(row1, col1, row2, col2) {
    return this._prefix(row2+1, col2+1) - this._prefix(row1, col2+1)
        - this._prefix(row2+1, col1) + this._prefix(row1, col1);
};`,
    explanation:
      '1. Extend 1D Fenwick tree to 2D with nested loops.\n' +
      '2. update: propagate delta in both row and column dimensions.\n' +
      '3. _prefix(r,c): sum of all elements in [0..r-1][0..c-1].\n' +
      '4. sumRegion uses inclusion-exclusion on four prefix sums.',
    timeComplexity: 'O(log m * log n) per update and query',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Extend the 1D BIT to 2D.',
      'Each dimension independently uses BIT indexing.',
      'Use inclusion-exclusion for rectangular region sums.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 310. Minimum Height Trees
  // ---------------------------------------------------------------------------
  {
    id: 310,
    description:
      'Given a tree of n nodes labeled 0 to n-1 and n-1 edges, find all root nodes that produce minimum height trees. Return a list of their labels.',
    examples:
      'Input: n = 4, edges = [[1,0],[1,2],[1,3]]\nOutput: [1]',
    approach:
      'Repeatedly remove leaf nodes (degree 1) from the outside in, like peeling an onion. The last remaining 1 or 2 nodes are the roots of minimum height trees (the centroids of the tree).',
    code: `class Solution:
    def findMinHeightTrees(self, n: int, edges: list[list[int]]) -> list[int]:
        if n == 1:
            return [0]
        from collections import defaultdict, deque
        adj = defaultdict(set)
        for u, v in edges:
            adj[u].add(v)
            adj[v].add(u)
        leaves = deque(i for i in range(n) if len(adj[i]) == 1)
        remaining = n
        while remaining > 2:
            remaining -= len(leaves)
            new_leaves = deque()
            for leaf in leaves:
                neighbor = adj[leaf].pop()
                adj[neighbor].remove(leaf)
                if len(adj[neighbor]) == 1:
                    new_leaves.append(neighbor)
            leaves = new_leaves
        return list(leaves)`,
    jsCode: `var findMinHeightTrees = function(n, edges) {
    if (n === 1) return [0];
    const adj = Array.from({length: n}, () => new Set());
    for (const [u, v] of edges) {
        adj[u].add(v);
        adj[v].add(u);
    }
    let leaves = [];
    for (let i = 0; i < n; i++) {
        if (adj[i].size === 1) leaves.push(i);
    }
    let remaining = n;
    while (remaining > 2) {
        remaining -= leaves.length;
        const newLeaves = [];
        for (const leaf of leaves) {
            const neighbor = [...adj[leaf]][0];
            adj[neighbor].delete(leaf);
            if (adj[neighbor].size === 1) newLeaves.push(neighbor);
        }
        leaves = newLeaves;
    }
    return leaves;
};`,
    explanation:
      '1. Find all initial leaf nodes (degree 1).\n' +
      '2. Remove leaves layer by layer, updating neighbor degrees.\n' +
      '3. When a neighbor becomes a leaf (degree 1), add it to the next layer.\n' +
      '4. Stop when 1 or 2 nodes remain — they are the centroids.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The root of a minimum height tree is the centroid of the tree.',
      'A tree has at most 2 centroids.',
      'Repeatedly trim leaves until 1-2 nodes remain.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 311. Sparse Matrix Multiplication
  // ---------------------------------------------------------------------------
  {
    id: 311,
    description:
      'Given two sparse matrices mat1 (m x k) and mat2 (k x n), return their product. A sparse matrix has mostly zero elements.',
    examples:
      'Input: mat1 = [[1,0,0],[-1,0,3]], mat2 = [[7,0,0],[0,0,0],[0,0,1]]\nOutput: [[7,0,0],[-7,0,3]]',
    approach:
      'Skip zero elements during multiplication. For each non-zero element mat1[i][j], multiply it with each non-zero mat2[j][k] and accumulate into the result.',
    code: `class Solution:
    def multiply(self, mat1: list[list[int]], mat2: list[list[int]]) -> list[list[int]]:
        m, k, n = len(mat1), len(mat1[0]), len(mat2[0])
        result = [[0]*n for _ in range(m)]
        for i in range(m):
            for j in range(k):
                if mat1[i][j] == 0:
                    continue
                for l in range(n):
                    if mat2[j][l] == 0:
                        continue
                    result[i][l] += mat1[i][j] * mat2[j][l]
        return result`,
    jsCode: `var multiply = function(mat1, mat2) {
    const m = mat1.length, k = mat1[0].length, n = mat2[0].length;
    const result = Array.from({length: m}, () => new Array(n).fill(0));
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < k; j++) {
            if (mat1[i][j] === 0) continue;
            for (let l = 0; l < n; l++) {
                if (mat2[j][l] === 0) continue;
                result[i][l] += mat1[i][j] * mat2[j][l];
            }
        }
    }
    return result;
};`,
    explanation:
      '1. Initialize result matrix of size m x n with zeros.\n' +
      '2. For each element mat1[i][j], skip if zero.\n' +
      '3. For each element mat2[j][l], skip if zero.\n' +
      '4. Accumulate mat1[i][j] * mat2[j][l] into result[i][l].\n' +
      '5. Skipping zeros makes this efficient for sparse matrices.',
    timeComplexity: 'O(m * k * n) worst case, much better for sparse matrices',
    spaceComplexity: 'O(m * n)',
    hints: [
      'The key optimization for sparse matrices is skipping zero elements.',
      'If mat1[i][j] is 0, skip the entire inner loop for that element.',
      'Pre-process sparse representation if needed for very sparse matrices.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 312. Burst Balloons
  // ---------------------------------------------------------------------------
  {
    id: 312,
    description:
      'You are given n balloons indexed 0 to n-1, each with a number. When you burst balloon i, you gain nums[i-1]*nums[i]*nums[i+1] coins. Find the maximum coins you can collect by bursting all balloons. Boundary balloons have value 1.',
    examples:
      'Input: nums = [3,1,5,8]\nOutput: 167',
    approach:
      'Use interval DP. Think of the last balloon to burst in each interval. dp[i][j] = max coins from bursting all balloons between i and j (exclusive). For each possible last balloon k in (i,j), dp[i][j] = max(dp[i][k] + dp[k][j] + nums[i]*nums[k]*nums[j]).',
    code: `class Solution:
    def maxCoins(self, nums: list[int]) -> int:
        nums = [1] + nums + [1]
        n = len(nums)
        dp = [[0]*n for _ in range(n)]
        for length in range(2, n):
            for i in range(n - length):
                j = i + length
                for k in range(i+1, j):
                    dp[i][j] = max(dp[i][j],
                        dp[i][k] + dp[k][j] + nums[i]*nums[k]*nums[j])
        return dp[0][n-1]`,
    jsCode: `var maxCoins = function(nums) {
    nums = [1, ...nums, 1];
    const n = nums.length;
    const dp = Array.from({length: n}, () => new Array(n).fill(0));
    for (let length = 2; length < n; length++) {
        for (let i = 0; i < n - length; i++) {
            const j = i + length;
            for (let k = i + 1; k < j; k++) {
                dp[i][j] = Math.max(dp[i][j],
                    dp[i][k] + dp[k][j] + nums[i] * nums[k] * nums[j]);
            }
        }
    }
    return dp[0][n - 1];
};`,
    explanation:
      '1. Pad nums with 1 on both sides to handle boundary conditions.\n' +
      '2. dp[i][j] = max coins from bursting all balloons strictly between i and j.\n' +
      '3. For each interval length, try each balloon k as the LAST to burst in that interval.\n' +
      '4. Cost of bursting k last = nums[i]*nums[k]*nums[j] (boundaries remain).\n' +
      '5. Total = dp[i][k] + dp[k][j] + that cost.',
    timeComplexity: 'O(n^3)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Think about which balloon you burst LAST in a subarray.',
      'The key insight is that the last balloon in an interval sees the interval boundaries as neighbors.',
      'Pad the array with 1s at both ends to simplify boundary handling.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 314. Binary Tree Vertical Order Traversal
  // ---------------------------------------------------------------------------
  {
    id: 314,
    description:
      'Given the root of a binary tree, return the vertical order traversal. For each column, return nodes from top to bottom. If two nodes are in the same row and column, order them from left to right.',
    examples:
      'Input: root = [3,9,20,null,null,15,7]\nOutput: [[9],[3,15],[20],[7]]',
    approach:
      'Use BFS with column tracking. Start root at column 0; left child is col-1, right child is col+1. Use a dictionary mapping columns to lists of values. BFS ensures top-to-bottom, left-to-right order.',
    code: `class Solution:
    def verticalOrder(self, root) -> list[list[int]]:
        if not root:
            return []
        from collections import defaultdict, deque
        col_map = defaultdict(list)
        queue = deque([(root, 0)])
        min_col = max_col = 0
        while queue:
            node, col = queue.popleft()
            col_map[col].append(node.val)
            min_col = min(min_col, col)
            max_col = max(max_col, col)
            if node.left:
                queue.append((node.left, col-1))
            if node.right:
                queue.append((node.right, col+1))
        return [col_map[c] for c in range(min_col, max_col+1)]`,
    jsCode: `var verticalOrder = function(root) {
    if (!root) return [];
    const colMap = new Map();
    const queue = [[root, 0]];
    let minCol = 0, maxCol = 0;
    let idx = 0;
    while (idx < queue.length) {
        const [node, col] = queue[idx++];
        if (!colMap.has(col)) colMap.set(col, []);
        colMap.get(col).push(node.val);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
        if (node.left) queue.push([node.left, col - 1]);
        if (node.right) queue.push([node.right, col + 1]);
    }
    const result = [];
    for (let c = minCol; c <= maxCol; c++) {
        result.push(colMap.get(c));
    }
    return result;
};`,
    explanation:
      '1. BFS from root at column 0. Left child is col-1, right child is col+1.\n' +
      '2. Collect values in a dictionary keyed by column.\n' +
      '3. Track min and max columns.\n' +
      '4. Return columns in order from min_col to max_col.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Assign a column index to each node: root=0, left=col-1, right=col+1.',
      'Use BFS to ensure top-to-bottom, left-to-right ordering.',
      'Collect nodes by column and output columns from leftmost to rightmost.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 315. Count of Smaller Numbers After Self
  // ---------------------------------------------------------------------------
  {
    id: 315,
    description:
      'Given an integer array nums, return an integer array counts where counts[i] is the number of smaller elements to the right of nums[i].',
    examples:
      'Input: nums = [5,2,6,1]\nOutput: [2,1,1,0]',
    approach:
      'Use merge sort with index tracking. During the merge step, when an element from the right half is placed before elements from the left half, it contributes to the count of those left-half elements.',
    code: `class Solution:
    def countSmaller(self, nums: list[int]) -> list[int]:
        counts = [0] * len(nums)
        indices = list(range(len(nums)))
        def merge_sort(lo, hi):
            if hi - lo <= 1:
                return
            mid = (lo + hi) // 2
            merge_sort(lo, mid)
            merge_sort(mid, hi)
            temp = []
            i, j = lo, mid
            while i < mid and j < hi:
                if nums[indices[j]] < nums[indices[i]]:
                    temp.append(indices[j])
                    j += 1
                else:
                    counts[indices[i]] += j - mid
                    temp.append(indices[i])
                    i += 1
            while i < mid:
                counts[indices[i]] += j - mid
                temp.append(indices[i])
                i += 1
            while j < hi:
                temp.append(indices[j])
                j += 1
            indices[lo:hi] = temp
        merge_sort(0, len(nums))
        return counts`,
    jsCode: `var countSmaller = function(nums) {
    const counts = new Array(nums.length).fill(0);
    const indices = Array.from({length: nums.length}, (_, i) => i);
    const mergeSort = (lo, hi) => {
        if (hi - lo <= 1) return;
        const mid = Math.floor((lo + hi) / 2);
        mergeSort(lo, mid);
        mergeSort(mid, hi);
        const temp = [];
        let i = lo, j = mid;
        while (i < mid && j < hi) {
            if (nums[indices[j]] < nums[indices[i]]) {
                temp.push(indices[j++]);
            } else {
                counts[indices[i]] += j - mid;
                temp.push(indices[i++]);
            }
        }
        while (i < mid) {
            counts[indices[i]] += j - mid;
            temp.push(indices[i++]);
        }
        while (j < hi) {
            temp.push(indices[j++]);
        }
        for (let k = lo; k < hi; k++) {
            indices[k] = temp[k - lo];
        }
    };
    mergeSort(0, nums.length);
    return counts;
};`,
    explanation:
      '1. Track original indices through the merge sort.\n' +
      '2. During merge, when placing a left element, all right elements already placed (j - mid) are smaller.\n' +
      '3. Add j - mid to the count for that left element.\n' +
      '4. After merge sort, counts[i] holds the number of smaller elements to the right of index i.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Merge sort naturally counts inversions.',
      'Track original indices so you can update the correct count.',
      'When merging, the number of right-side elements already placed tells you how many are smaller.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 316. Remove Duplicate Letters
  // ---------------------------------------------------------------------------
  {
    id: 316,
    description:
      'Given a string s, remove duplicate letters so that every letter appears once and only once. You must make sure the result is the smallest in lexicographical order among all possible results.',
    examples:
      'Input: s = "bcabc"\nOutput: "abc"',
    approach:
      'Use a monotonic stack. Iterate through characters; if the current character is smaller than the stack top and the stack top appears later in the string, pop it. Skip characters already in the stack.',
    code: `class Solution:
    def removeDuplicateLetters(self, s: str) -> str:
        last_index = {c: i for i, c in enumerate(s)}
        stack = []
        in_stack = set()
        for i, c in enumerate(s):
            if c in in_stack:
                continue
            while stack and c < stack[-1] and last_index[stack[-1]] > i:
                in_stack.remove(stack.pop())
            stack.append(c)
            in_stack.add(c)
        return ''.join(stack)`,
    jsCode: `var removeDuplicateLetters = function(s) {
    const lastIndex = {};
    for (let i = 0; i < s.length; i++) {
        lastIndex[s[i]] = i;
    }
    const stack = [];
    const inStack = new Set();
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inStack.has(c)) continue;
        while (stack.length && c < stack[stack.length - 1] && lastIndex[stack[stack.length - 1]] > i) {
            inStack.delete(stack.pop());
        }
        stack.push(c);
        inStack.add(c);
    }
    return stack.join('');
};`,
    explanation:
      '1. Record the last index of each character.\n' +
      '2. Use a stack and a set to track characters in the current result.\n' +
      '3. For each character, skip if already in the stack.\n' +
      '4. Pop from the stack while the top is greater than current and appears later.\n' +
      '5. This ensures the lexicographically smallest result.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) — at most 26 characters',
    hints: [
      'A greedy approach with a stack can maintain lexicographic order.',
      'Pop a character from the stack only if it appears again later.',
      'Use a set to skip characters already included.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 317. Shortest Distance from All Buildings
  // ---------------------------------------------------------------------------
  {
    id: 317,
    description:
      'Given a grid where 0 is empty land, 1 is a building, and 2 is an obstacle, find the empty land position with the smallest total distance to all buildings. Return -1 if impossible.',
    examples:
      'Input: grid = [[1,0,2,0,1],[0,0,0,0,0],[0,0,1,0,0]]\nOutput: 7',
    approach:
      'BFS from each building to all reachable empty lands. Sum the distances and track how many buildings can reach each empty land. The answer is the minimum total distance among cells reachable by all buildings.',
    code: `class Solution:
    def shortestDistance(self, grid: list[list[int]]) -> int:
        from collections import deque
        m, n = len(grid), len(grid[0])
        total_dist = [[0]*n for _ in range(m)]
        reach_count = [[0]*n for _ in range(m)]
        buildings = 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 1:
                    buildings += 1
                    visited = [[False]*n for _ in range(m)]
                    queue = deque([(i, j, 0)])
                    visited[i][j] = True
                    while queue:
                        r, c, d = queue.popleft()
                        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                            nr, nc = r+dr, c+dc
                            if 0<=nr<m and 0<=nc<n and not visited[nr][nc] and grid[nr][nc]==0:
                                visited[nr][nc] = True
                                total_dist[nr][nc] += d+1
                                reach_count[nr][nc] += 1
                                queue.append((nr, nc, d+1))
        result = float('inf')
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 0 and reach_count[i][j] == buildings:
                    result = min(result, total_dist[i][j])
        return result if result != float('inf') else -1`,
    jsCode: `var shortestDistance = function(grid) {
    const m = grid.length, n = grid[0].length;
    const totalDist = Array.from({length: m}, () => new Array(n).fill(0));
    const reachCount = Array.from({length: m}, () => new Array(n).fill(0));
    let buildings = 0;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (grid[i][j] === 1) {
                buildings++;
                const visited = Array.from({length: m}, () => new Array(n).fill(false));
                const queue = [[i, j, 0]];
                visited[i][j] = true;
                let idx = 0;
                while (idx < queue.length) {
                    const [r, c, d] = queue[idx++];
                    for (const [dr, dc] of dirs) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited[nr][nc] && grid[nr][nc] === 0) {
                            visited[nr][nc] = true;
                            totalDist[nr][nc] += d + 1;
                            reachCount[nr][nc]++;
                            queue.push([nr, nc, d + 1]);
                        }
                    }
                }
            }
        }
    }
    let result = Infinity;
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (grid[i][j] === 0 && reachCount[i][j] === buildings) {
                result = Math.min(result, totalDist[i][j]);
            }
        }
    }
    return result === Infinity ? -1 : result;
};`,
    explanation:
      '1. BFS from each building, recording distance to each empty cell.\n' +
      '2. Accumulate total distances and count how many buildings can reach each cell.\n' +
      '3. After all BFS runs, find the cell with minimum total distance that is reachable by ALL buildings.\n' +
      '4. Return -1 if no such cell exists.',
    timeComplexity: 'O(B * m * n) where B is number of buildings',
    spaceComplexity: 'O(m * n)',
    hints: [
      'BFS from each building to find distances to all empty cells.',
      'Track how many buildings can reach each empty cell.',
      'Only consider cells reachable by all buildings.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 318. Maximum Product of Word Lengths
  // ---------------------------------------------------------------------------
  {
    id: 318,
    description:
      'Given an array of strings words, return the maximum product of lengths of two words that do not share any common letters. If no such pair exists, return 0.',
    examples:
      'Input: words = ["abcw","baz","foo","bar","xtfn","abcdef"]\nOutput: 16\nExplanation: "abcw" and "xtfn" have no common letters. 4 * 4 = 16.',
    approach:
      'Represent each word as a bitmask of 26 bits (one per letter). Two words share no letters if their bitmasks AND to 0. Check all pairs and track the maximum product.',
    code: `class Solution:
    def maxProduct(self, words: list[str]) -> int:
        masks = []
        for w in words:
            mask = 0
            for c in w:
                mask |= 1 << (ord(c) - ord('a'))
            masks.append(mask)
        result = 0
        for i in range(len(words)):
            for j in range(i+1, len(words)):
                if masks[i] & masks[j] == 0:
                    result = max(result, len(words[i]) * len(words[j]))
        return result`,
    jsCode: `var maxProduct = function(words) {
    const masks = words.map(w => {
        let mask = 0;
        for (const c of w) mask |= 1 << (c.charCodeAt(0) - 97);
        return mask;
    });
    let result = 0;
    for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
            if ((masks[i] & masks[j]) === 0) {
                result = Math.max(result, words[i].length * words[j].length);
            }
        }
    }
    return result;
};`,
    explanation:
      '1. Compute a bitmask for each word: bit i is set if letter i is present.\n' +
      '2. Two words share no letters if their bitmasks AND to 0.\n' +
      '3. Check all pairs and track the maximum length product.\n' +
      '4. Bitmask comparison is O(1), making this efficient.',
    timeComplexity: 'O(n^2 + L) where L is total characters',
    spaceComplexity: 'O(n)',
    hints: [
      'How can you quickly check if two words share letters?',
      'Represent each word as a bitmask of letters present.',
      'Two words have no common letters if their bitmasks AND to 0.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 323. Number of Connected Components in an Undirected Graph
  // ---------------------------------------------------------------------------
  {
    id: 323,
    description:
      'You have a graph of n nodes and a list of undirected edges. Return the number of connected components in the graph.',
    examples:
      'Input: n = 5, edges = [[0,1],[1,2],[3,4]]\nOutput: 2',
    approach:
      'Use Union-Find. Initialize each node as its own component. For each edge, union the two nodes. The number of distinct roots at the end is the number of connected components.',
    code: `class Solution:
    def countComponents(self, n: int, edges: list[list[int]]) -> int:
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        components = n
        for u, v in edges:
            pu, pv = find(u), find(v)
            if pu != pv:
                parent[pu] = pv
                components -= 1
        return components`,
    jsCode: `var countComponents = function(n, edges) {
    const parent = Array.from({length: n}, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    let components = n;
    for (const [u, v] of edges) {
        const pu = find(u), pv = find(v);
        if (pu !== pv) {
            parent[pu] = pv;
            components--;
        }
    }
    return components;
};`,
    explanation:
      '1. Initialize each node as its own parent (n components).\n' +
      '2. For each edge, find roots of both endpoints.\n' +
      '3. If they differ, union them and decrement the component count.\n' +
      '4. Return the final component count.',
    timeComplexity: 'O(n + E * alpha(n))',
    spaceComplexity: 'O(n)',
    hints: [
      'Union-Find is a natural fit for counting connected components.',
      'Start with n components and merge on each edge.',
      'Alternatively, use DFS/BFS to count connected components.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 324. Wiggle Sort II
  // ---------------------------------------------------------------------------
  {
    id: 324,
    description:
      'Given an integer array nums, reorder it such that nums[0] < nums[1] > nums[2] < nums[3] > nums[4] .... The array is guaranteed to have a valid answer.',
    examples:
      'Input: nums = [1,5,1,1,6,4]\nOutput: [1,6,1,5,1,4]',
    approach:
      'Sort the array. Place the smaller half at even indices (in reverse) and the larger half at odd indices (in reverse). Reversing avoids equal elements being adjacent.',
    code: `class Solution:
    def wiggleSort(self, nums: list[int]) -> None:
        sorted_nums = sorted(nums)
        n = len(nums)
        mid = (n - 1) // 2
        # Fill even indices with smaller half (reverse), odd with larger half (reverse)
        nums[0::2] = sorted_nums[mid::-1]
        nums[1::2] = sorted_nums[n-1:mid:-1]`,
    jsCode: `var wiggleSort = function(nums) {
    const sorted = [...nums].sort((a, b) => a - b);
    const n = nums.length;
    const mid = Math.floor((n - 1) / 2);
    // Fill even indices with smaller half (reverse), odd with larger half (reverse)
    let s = mid, l = n - 1;
    for (let i = 0; i < n; i++) {
        if (i % 2 === 0) {
            nums[i] = sorted[s--];
        } else {
            nums[i] = sorted[l--];
        }
    }
};`,
    explanation:
      '1. Sort the array to separate smaller and larger halves.\n' +
      '2. Place the smaller half (reversed) at even indices: 0, 2, 4, ...\n' +
      '3. Place the larger half (reversed) at odd indices: 1, 3, 5, ...\n' +
      '4. Reversing ensures that equal elements at the boundary do not become adjacent.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'After sorting, split into a smaller half and a larger half.',
      'Interleave them: smaller at even positions, larger at odd positions.',
      'Reverse both halves to prevent equal boundary elements from being adjacent.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 325. Maximum Size Subarray Sum Equals k
  // ---------------------------------------------------------------------------
  {
    id: 325,
    description:
      'Given an integer array nums and an integer k, return the maximum length of a subarray that sums to k. If no such subarray exists, return 0.',
    examples:
      'Input: nums = [1,-1,5,-2,3], k = 3\nOutput: 4\nExplanation: [1,-1,5,-2] sums to 3.',
    approach:
      'Use prefix sums with a hash map. Store the first occurrence of each prefix sum. For each prefix sum, check if (prefix_sum - k) exists in the map. The difference in indices gives the subarray length.',
    code: `class Solution:
    def maxSubArrayLen(self, nums: list[int], k: int) -> int:
        prefix_map = {0: -1}
        prefix_sum = 0
        max_len = 0
        for i, num in enumerate(nums):
            prefix_sum += num
            if prefix_sum - k in prefix_map:
                max_len = max(max_len, i - prefix_map[prefix_sum - k])
            if prefix_sum not in prefix_map:
                prefix_map[prefix_sum] = i
        return max_len`,
    jsCode: `var maxSubArrayLen = function(nums, k) {
    const prefixMap = new Map([[0, -1]]);
    let prefixSum = 0;
    let maxLen = 0;
    for (let i = 0; i < nums.length; i++) {
        prefixSum += nums[i];
        if (prefixMap.has(prefixSum - k)) {
            maxLen = Math.max(maxLen, i - prefixMap.get(prefixSum - k));
        }
        if (!prefixMap.has(prefixSum)) {
            prefixMap.set(prefixSum, i);
        }
    }
    return maxLen;
};`,
    explanation:
      '1. Maintain a running prefix sum and a map of first occurrences.\n' +
      '2. If prefix_sum - k is in the map, there is a subarray summing to k.\n' +
      '3. Its length is i - map[prefix_sum - k]. Track the maximum.\n' +
      '4. Only store the first occurrence of each prefix sum to maximize subarray length.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Prefix sums convert subarray sum problems into difference problems.',
      'Use a hash map to find if (current_prefix - k) was seen before.',
      'Store the earliest index of each prefix sum to maximize the subarray length.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 326. Power of Three
  // ---------------------------------------------------------------------------
  {
    id: 326,
    description:
      'Given an integer n, return true if it is a power of three. An integer n is a power of three if there exists x such that n == 3^x.',
    examples:
      'Input: n = 27\nOutput: true',
    approach:
      'The largest power of 3 that fits in a 32-bit integer is 3^19 = 1162261467. If n > 0 and 1162261467 % n == 0, then n is a power of 3.',
    code: `class Solution:
    def isPowerOfThree(self, n: int) -> bool:
        return n > 0 and 1162261467 % n == 0`,
    jsCode: `var isPowerOfThree = function(n) {
    return n > 0 && 1162261467 % n === 0;
};`,
    explanation:
      '1. 3^19 = 1162261467 is the largest power of 3 within 32-bit int range.\n' +
      '2. Since 3 is prime, any divisor of 3^19 that is positive must be a power of 3.\n' +
      '3. Check n > 0 and 3^19 % n == 0.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    hints: [
      'The simplest approach is repeated division by 3.',
      'A math trick: 3^19 is the max power of 3 in int range. Any power of 3 divides it.',
      'Since 3 is prime, divisors of 3^19 are exactly the powers of 3.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 327. Count of Range Sum
  // ---------------------------------------------------------------------------
  {
    id: 327,
    description:
      'Given an integer array nums and two integers lower and upper, return the count of range sums that lie in [lower, upper] inclusive. A range sum S(i,j) is the sum of elements from index i to j.',
    examples:
      'Input: nums = [-2,5,-1], lower = -2, upper = 2\nOutput: 3\nExplanation: Range sums [0,0]=-2, [2,2]=-1, [0,2]=2.',
    approach:
      'Compute prefix sums, then use merge sort. During merge, count pairs (i, j) where lower <= prefix[j] - prefix[i] <= upper. This is done by maintaining two pointers in the right half for each left element.',
    code: `class Solution:
    def countRangeSum(self, nums: list[int], lower: int, upper: int) -> int:
        prefix = [0]
        for n in nums:
            prefix.append(prefix[-1] + n)
        def merge_count(lo, hi):
            if hi - lo <= 1:
                return 0
            mid = (lo + hi) // 2
            count = merge_count(lo, mid) + merge_count(mid, hi)
            j = k = mid
            for i in range(lo, mid):
                while j < hi and prefix[j] - prefix[i] < lower:
                    j += 1
                while k < hi and prefix[k] - prefix[i] <= upper:
                    k += 1
                count += k - j
            prefix[lo:hi] = sorted(prefix[lo:hi])
            return count
        return merge_count(0, len(prefix))`,
    jsCode: `var countRangeSum = function(nums, lower, upper) {
    const prefix = [0];
    for (const n of nums) prefix.push(prefix[prefix.length - 1] + n);
    const mergeCount = (lo, hi) => {
        if (hi - lo <= 1) return 0;
        const mid = Math.floor((lo + hi) / 2);
        let count = mergeCount(lo, mid) + mergeCount(mid, hi);
        let j = mid, k = mid;
        for (let i = lo; i < mid; i++) {
            while (j < hi && prefix[j] - prefix[i] < lower) j++;
            while (k < hi && prefix[k] - prefix[i] <= upper) k++;
            count += k - j;
        }
        const sorted = prefix.slice(lo, hi).sort((a, b) => a - b);
        for (let i = lo; i < hi; i++) prefix[i] = sorted[i - lo];
        return count;
    };
    return mergeCount(0, prefix.length);
};`,
    explanation:
      '1. Compute prefix sums. Range sum S(i,j) = prefix[j+1] - prefix[i].\n' +
      '2. Use merge sort on prefix array.\n' +
      '3. During merge, for each left element, find the range [j,k) in the right half where the difference is in [lower, upper].\n' +
      '4. Count += k - j for each left element.\n' +
      '5. Sort the subarrays after counting.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Convert to prefix sums: range sum = prefix[j] - prefix[i].',
      'Counting pairs with a specific range of differences is a modified merge sort problem.',
      'During merge, use two pointers to find the valid range efficiently.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 328. Odd Even Linked List
  // ---------------------------------------------------------------------------
  {
    id: 328,
    description:
      'Given the head of a singly linked list, group all the nodes with odd indices together followed by the nodes with even indices. The first node is considered odd. Maintain relative order within each group.',
    examples:
      'Input: head = [1,2,3,4,5]\nOutput: [1,3,5,2,4]',
    approach:
      'Use two pointers: odd and even. Alternate linking: odd.next = odd.next.next and even.next = even.next.next. After traversal, connect the odd list to the even list head.',
    code: `class Solution:
    def oddEvenList(self, head):
        if not head:
            return head
        odd = head
        even = head.next
        even_head = even
        while even and even.next:
            odd.next = even.next
            odd = odd.next
            even.next = odd.next
            even = even.next
        odd.next = even_head
        return head`,
    jsCode: `var oddEvenList = function(head) {
    if (!head) return head;
    let odd = head;
    let even = head.next;
    const evenHead = even;
    while (even && even.next) {
        odd.next = even.next;
        odd = odd.next;
        even.next = odd.next;
        even = even.next;
    }
    odd.next = evenHead;
    return head;
};`,
    explanation:
      '1. Initialize odd pointer at head and even pointer at head.next.\n' +
      '2. Save even_head to reconnect later.\n' +
      '3. Alternate: link odd to the next odd, then even to the next even.\n' +
      '4. After the loop, connect the end of the odd list to even_head.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Separate the list into odd-indexed and even-indexed sublists.',
      'Track the head of the even sublist to reconnect at the end.',
      'Be careful with the termination condition of the while loop.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 329. Longest Increasing Path in a Matrix
  // ---------------------------------------------------------------------------
  {
    id: 329,
    description:
      'Given an m x n integers matrix, return the length of the longest increasing path. From each cell, you can move in four directions. You may not move diagonally or outside the boundary.',
    examples:
      'Input: matrix = [[9,9,4],[6,6,8],[2,1,1]]\nOutput: 4\nExplanation: The longest path is [1,2,6,9].',
    approach:
      'Use DFS with memoization. For each cell, the longest increasing path is 1 + max of all valid neighbors with larger values. Cache results to avoid recomputation.',
    code: `class Solution:
    def longestIncreasingPath(self, matrix: list[list[int]]) -> int:
        m, n = len(matrix), len(matrix[0])
        memo = {}
        def dfs(i, j):
            if (i, j) in memo:
                return memo[(i, j)]
            best = 1
            for di, dj in [(0,1),(0,-1),(1,0),(-1,0)]:
                ni, nj = i+di, j+dj
                if 0 <= ni < m and 0 <= nj < n and matrix[ni][nj] > matrix[i][j]:
                    best = max(best, 1 + dfs(ni, nj))
            memo[(i, j)] = best
            return best
        return max(dfs(i, j) for i in range(m) for j in range(n))`,
    jsCode: `var longestIncreasingPath = function(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const memo = Array.from({length: m}, () => new Array(n).fill(0));
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    const dfs = (i, j) => {
        if (memo[i][j]) return memo[i][j];
        let best = 1;
        for (const [di, dj] of dirs) {
            const ni = i + di, nj = j + dj;
            if (ni >= 0 && ni < m && nj >= 0 && nj < n && matrix[ni][nj] > matrix[i][j]) {
                best = Math.max(best, 1 + dfs(ni, nj));
            }
        }
        memo[i][j] = best;
        return best;
    };
    let result = 0;
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            result = Math.max(result, dfs(i, j));
        }
    }
    return result;
};`,
    explanation:
      '1. DFS from each cell, exploring neighbors with strictly larger values.\n' +
      '2. Memoize the longest path from each cell to avoid recomputation.\n' +
      '3. Return the maximum across all cells.\n' +
      '4. The strictly increasing constraint prevents cycles, so no visited set is needed.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'DFS from each cell exploring only cells with larger values.',
      'Memoize results to achieve O(m*n) total time.',
      'No need for a visited set since we only move to strictly larger values.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 330. Patching Array
  // ---------------------------------------------------------------------------
  {
    id: 330,
    description:
      'Given a sorted integer array nums and an integer n, add the minimum number of patches (numbers) so that any number in the range [1, n] can be represented as a sum of some elements in the array.',
    examples:
      'Input: nums = [1,3], n = 6\nOutput: 1\nExplanation: Adding 2 lets us cover [1,6].',
    approach:
      'Use a greedy approach. Track the smallest number miss that cannot be formed. If nums[i] <= miss, extend coverage to miss + nums[i]. Otherwise, patch with miss itself (doubling coverage). Count patches added.',
    code: `class Solution:
    def minPatches(self, nums: list[int], n: int) -> int:
        patches = 0
        miss = 1
        i = 0
        while miss <= n:
            if i < len(nums) and nums[i] <= miss:
                miss += nums[i]
                i += 1
            else:
                miss += miss
                patches += 1
        return patches`,
    jsCode: `var minPatches = function(nums, n) {
    let patches = 0;
    let miss = 1;
    let i = 0;
    while (miss <= n) {
        if (i < nums.length && nums[i] <= miss) {
            miss += nums[i];
            i++;
        } else {
            miss += miss;
            patches++;
        }
    }
    return patches;
};`,
    explanation:
      '1. miss = smallest value we cannot yet form. Initially miss = 1.\n' +
      '2. If the next array element <= miss, we can extend coverage: miss += nums[i].\n' +
      '3. Otherwise, patch with miss itself, doubling our coverage range.\n' +
      '4. Continue until miss > n (all values in [1, n] are covered).',
    timeComplexity: 'O(m + log n) where m is the length of nums',
    spaceComplexity: 'O(1)',
    hints: [
      'Think greedily: what is the smallest number you cannot currently form?',
      'If you can form [1, miss-1], adding miss itself doubles your range to [1, 2*miss-1].',
      'Use existing array elements when they fit within the current range.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 333. Largest BST Subtree
  // ---------------------------------------------------------------------------
  {
    id: 333,
    description:
      'Given the root of a binary tree, find the largest subtree that is also a Binary Search Tree (BST). Return the size (number of nodes) of that subtree.',
    examples:
      'Input: root = [10,5,15,1,8,null,7]\nOutput: 3\nExplanation: The subtree [5,1,8] is the largest BST.',
    approach:
      'Use a bottom-up DFS that returns (is_bst, size, min_val, max_val) for each subtree. A node is a valid BST if both subtrees are BSTs and the node value is within the valid range.',
    code: `class Solution:
    def largestBSTSubtree(self, root) -> int:
        self.max_size = 0
        def dfs(node):
            if not node:
                return True, 0, float('inf'), float('-inf')
            l_bst, l_size, l_min, l_max = dfs(node.left)
            r_bst, r_size, r_min, r_max = dfs(node.right)
            if l_bst and r_bst and l_max < node.val < r_min:
                size = l_size + r_size + 1
                self.max_size = max(self.max_size, size)
                return True, size, min(l_min, node.val), max(r_max, node.val)
            return False, 0, 0, 0
        dfs(root)
        return self.max_size`,
    jsCode: `var largestBSTSubtree = function(root) {
    let maxSize = 0;
    const dfs = (node) => {
        if (!node) return [true, 0, Infinity, -Infinity];
        const [lBst, lSize, lMin, lMax] = dfs(node.left);
        const [rBst, rSize, rMin, rMax] = dfs(node.right);
        if (lBst && rBst && lMax < node.val && node.val < rMin) {
            const size = lSize + rSize + 1;
            maxSize = Math.max(maxSize, size);
            return [true, size, Math.min(lMin, node.val), Math.max(rMax, node.val)];
        }
        return [false, 0, 0, 0];
    };
    dfs(root);
    return maxSize;
};`,
    explanation:
      '1. Post-order DFS: process children before the parent.\n' +
      '2. Each call returns (is_bst, size, min_value, max_value) for the subtree.\n' +
      '3. A subtree rooted at node is a BST if both children are BSTs and l_max < node.val < r_min.\n' +
      '4. Track the maximum BST size globally.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'Use bottom-up approach to check BST property and compute size simultaneously.',
      'Return (is_bst, size, min, max) from each subtree.',
      'A null node is a valid BST of size 0.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 334. Increasing Triplet Subsequence
  // ---------------------------------------------------------------------------
  {
    id: 334,
    description:
      'Given an integer array nums, return true if there exists a triple of indices (i, j, k) such that i < j < k and nums[i] < nums[j] < nums[k]. The algorithm should run in O(n) time and O(1) space.',
    examples:
      'Input: nums = [1,2,3,4,5]\nOutput: true',
    approach:
      'Track two variables: first (smallest seen) and second (smallest number greater than first). If we find a number greater than second, we have an increasing triplet.',
    code: `class Solution:
    def increasingTriplet(self, nums: list[int]) -> bool:
        first = second = float('inf')
        for n in nums:
            if n <= first:
                first = n
            elif n <= second:
                second = n
            else:
                return True
        return False`,
    jsCode: `var increasingTriplet = function(nums) {
    let first = Infinity, second = Infinity;
    for (const n of nums) {
        if (n <= first) first = n;
        else if (n <= second) second = n;
        else return true;
    }
    return false;
};`,
    explanation:
      '1. first = smallest value seen so far.\n' +
      '2. second = smallest value greater than some previous first.\n' +
      '3. If we find n > second, there must be a first < second < n triplet.\n' +
      '4. Even if first gets updated after second, the old first still exists before second.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Track the two smallest values in increasing order.',
      'If you find a value greater than both, you have a triplet.',
      'Updating first does not invalidate second: second still has a smaller predecessor.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 336. Palindrome Pairs
  // ---------------------------------------------------------------------------
  {
    id: 336,
    description:
      'Given a list of unique words, return all pairs of distinct indices (i, j) such that the concatenation of words[i] + words[j] is a palindrome.',
    examples:
      'Input: words = ["abcd","dcba","lls","s","sssll"]\nOutput: [[0,1],[1,0],[3,2],[2,4]]',
    approach:
      'Use a hash map of reversed words. For each word, check all possible split points: if the left part is a palindrome and the reversed right part exists in the map, it forms a valid pair (and vice versa).',
    code: `class Solution:
    def palindromePairs(self, words: list[str]) -> list[list[int]]:
        word_map = {w[::-1]: i for i, w in enumerate(words)}
        result = []
        for i, w in enumerate(words):
            for j in range(len(w) + 1):
                left, right = w[:j], w[j:]
                if left in word_map and word_map[left] != i and right == right[::-1]:
                    result.append([i, word_map[left]])
                if j > 0 and right in word_map and word_map[right] != i and left == left[::-1]:
                    result.append([word_map[right], i])
        return result`,
    jsCode: `var palindromePairs = function(words) {
    const wordMap = new Map();
    for (let i = 0; i < words.length; i++) {
        wordMap.set(words[i].split('').reverse().join(''), i);
    }
    const result = [];
    const isPalin = (s) => {
        let l = 0, r = s.length - 1;
        while (l < r) {
            if (s[l] !== s[r]) return false;
            l++; r--;
        }
        return true;
    };
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        for (let j = 0; j <= w.length; j++) {
            const left = w.substring(0, j), right = w.substring(j);
            if (wordMap.has(left) && wordMap.get(left) !== i && isPalin(right)) {
                result.push([i, wordMap.get(left)]);
            }
            if (j > 0 && wordMap.has(right) && wordMap.get(right) !== i && isPalin(left)) {
                result.push([wordMap.get(right), i]);
            }
        }
    }
    return result;
};`,
    explanation:
      '1. Build a map of reversed words to their indices.\n' +
      '2. For each word, split at every position into left and right parts.\n' +
      '3. Case 1: If right is a palindrome and reversed(left) exists, words[i] + reversed_left is a palindrome.\n' +
      '4. Case 2: If left is a palindrome and reversed(right) exists, reversed_right + words[i] is a palindrome.\n' +
      '5. Use j > 0 check to avoid duplicates.',
    timeComplexity: 'O(n * k^2) where k is max word length',
    spaceComplexity: 'O(n * k)',
    hints: [
      'If word A + word B is a palindrome, then B is related to the reverse of A.',
      'Split each word at every position and check if one part is a palindrome.',
      'Use a hash map of reversed words for O(1) lookup.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 337. House Robber III
  // ---------------------------------------------------------------------------
  {
    id: 337,
    description:
      'The thief has found a binary tree neighborhood. Adjacent houses (directly connected nodes) cannot be robbed on the same night. Determine the maximum amount the thief can rob.',
    examples:
      'Input: root = [3,2,3,null,3,null,1]\nOutput: 7\nExplanation: Rob 3 + 3 + 1 = 7.',
    approach:
      'Use DFS returning a pair (rob, not_rob) for each node. If we rob the current node, we cannot rob its children. If we skip it, we take the max of robbing or not robbing each child.',
    code: `class Solution:
    def rob(self, root) -> int:
        def dfs(node):
            if not node:
                return 0, 0
            left = dfs(node.left)
            right = dfs(node.right)
            rob = node.val + left[1] + right[1]
            not_rob = max(left) + max(right)
            return rob, not_rob
        return max(dfs(root))`,
    jsCode: `var rob = function(root) {
    const dfs = (node) => {
        if (!node) return [0, 0];
        const left = dfs(node.left);
        const right = dfs(node.right);
        const robThis = node.val + left[1] + right[1];
        const notRob = Math.max(...left) + Math.max(...right);
        return [robThis, notRob];
    };
    return Math.max(...dfs(root));
};`,
    explanation:
      '1. DFS returns (rob_this, skip_this) for each node.\n' +
      '2. rob_this = node.val + skip(left) + skip(right) (cannot rob children).\n' +
      '3. skip_this = max(rob, skip) of left + max(rob, skip) of right.\n' +
      '4. Return max of the two values at the root.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'For each node, you either rob it or skip it.',
      'If you rob it, you must skip both children.',
      'Return a pair (rob, skip) from each DFS call to avoid recomputation.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 339. Nested List Weight Sum
  // ---------------------------------------------------------------------------
  {
    id: 339,
    description:
      'Given a nested list of integers, return the sum of all integers weighted by their depth. Each element is either an integer or a list of elements. The depth of the root level is 1.',
    examples:
      'Input: [[1,1],2,[1,1]]\nOutput: 10\nExplanation: Four 1s at depth 2 and one 2 at depth 1: 4*2 + 2*1 = 10.',
    approach:
      'Use DFS. For each element, if it is an integer, add value * depth to the sum. If it is a list, recurse with depth + 1.',
    code: `class Solution:
    def depthSum(self, nestedList) -> int:
        def dfs(nested, depth):
            total = 0
            for item in nested:
                if item.isInteger():
                    total += item.getInteger() * depth
                else:
                    total += dfs(item.getList(), depth + 1)
            return total
        return dfs(nestedList, 1)`,
    jsCode: `var depthSum = function(nestedList) {
    const dfs = (nested, depth) => {
        let total = 0;
        for (const item of nested) {
            if (item.isInteger()) {
                total += item.getInteger() * depth;
            } else {
                total += dfs(item.getList(), depth + 1);
            }
        }
        return total;
    };
    return dfs(nestedList, 1);
};`,
    explanation:
      '1. Start DFS at depth 1 with the root list.\n' +
      '2. For each element, check if it is an integer or a nested list.\n' +
      '3. If integer, add value * depth.\n' +
      '4. If list, recurse with depth + 1.\n' +
      '5. Return the accumulated total.',
    timeComplexity: 'O(n) where n is total elements',
    spaceComplexity: 'O(d) where d is max nesting depth',
    hints: [
      'DFS with depth tracking is the natural approach.',
      'Multiply each integer by its depth.',
      'Increment depth when entering a nested list.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 340. Longest Substring with At Most K Distinct Characters
  // ---------------------------------------------------------------------------
  {
    id: 340,
    description:
      'Given a string s and an integer k, return the length of the longest substring that contains at most k distinct characters.',
    examples:
      'Input: s = "eceba", k = 2\nOutput: 3\nExplanation: "ece" has 2 distinct characters.',
    approach:
      'Use a sliding window with a hash map counting character frequencies. Expand the right pointer. When distinct characters exceed k, shrink from the left until we have at most k distinct characters.',
    code: `class Solution:
    def lengthOfLongestSubstringKDistinct(self, s: str, k: int) -> int:
        from collections import defaultdict
        count = defaultdict(int)
        left = 0
        max_len = 0
        for right in range(len(s)):
            count[s[right]] += 1
            while len(count) > k:
                count[s[left]] -= 1
                if count[s[left]] == 0:
                    del count[s[left]]
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len`,
    jsCode: `var lengthOfLongestSubstringKDistinct = function(s, k) {
    const count = new Map();
    let left = 0, maxLen = 0;
    for (let right = 0; right < s.length; right++) {
        count.set(s[right], (count.get(s[right]) || 0) + 1);
        while (count.size > k) {
            count.set(s[left], count.get(s[left]) - 1);
            if (count.get(s[left]) === 0) count.delete(s[left]);
            left++;
        }
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
};`,
    explanation:
      '1. Expand the window by moving right pointer and adding to count map.\n' +
      '2. If distinct characters exceed k, shrink from the left.\n' +
      '3. Remove characters whose count drops to 0 from the map.\n' +
      '4. Track the maximum window size.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k)',
    hints: [
      'Sliding window with a character frequency map.',
      'When the map has more than k keys, shrink the window from the left.',
      'Delete map entries when their count reaches zero.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 341. Flatten Nested List Iterator
  // ---------------------------------------------------------------------------
  {
    id: 341,
    description:
      'Implement an iterator to flatten a nested list of integers. Each element is either an integer or a list of elements. Implement the NestedIterator class with hasNext() and next() methods.',
    examples:
      'Input: [[1,1],2,[1,1]]\nOutput: [1,1,2,1,1]',
    approach:
      'Use a stack initialized with the nested list in reverse order. In hasNext(), keep flattening the top element until it is an integer. In next(), pop and return the integer.',
    code: `class NestedIterator:
    def __init__(self, nestedList):
        self.stack = nestedList[::-1]

    def next(self) -> int:
        return self.stack.pop().getInteger()

    def hasNext(self) -> bool:
        while self.stack:
            top = self.stack[-1]
            if top.isInteger():
                return True
            self.stack.pop()
            self.stack.extend(top.getList()[::-1])
        return False`,
    jsCode: `var NestedIterator = function(nestedList) {
    this.stack = [...nestedList].reverse();
};

NestedIterator.prototype.next = function() {
    return this.stack.pop().getInteger();
};

NestedIterator.prototype.hasNext = function() {
    while (this.stack.length) {
        const top = this.stack[this.stack.length - 1];
        if (top.isInteger()) return true;
        this.stack.pop();
        const list = top.getList();
        for (let i = list.length - 1; i >= 0; i--) {
            this.stack.push(list[i]);
        }
    }
    return false;
};`,
    explanation:
      '1. Initialize stack with elements in reverse order (so first element is on top).\n' +
      '2. hasNext(): while top is a list, pop it and push its elements in reverse.\n' +
      '3. When top is an integer, return True.\n' +
      '4. next(): simply pop and return the integer (hasNext ensures it is ready).',
    timeComplexity: 'O(1) amortized per call',
    spaceComplexity: 'O(n)',
    hints: [
      'A stack naturally handles nested structures.',
      'Push elements in reverse so the first element is on top.',
      'Flatten lazily in hasNext() rather than eagerly in the constructor.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 343. Integer Break
  // ---------------------------------------------------------------------------
  {
    id: 343,
    description:
      'Given an integer n (n >= 2), break it into the sum of at least two positive integers and maximize the product of those integers. Return the maximum product.',
    examples:
      'Input: n = 10\nOutput: 36\nExplanation: 10 = 3 + 3 + 4, 3 * 3 * 4 = 36.',
    approach:
      'Mathematical insight: the optimal strategy is to break n into as many 3s as possible. If the remainder is 1, use one fewer 3 and one 4. If the remainder is 2, multiply by 2.',
    code: `class Solution:
    def integerBreak(self, n: int) -> int:
        if n == 2: return 1
        if n == 3: return 2
        product = 1
        while n > 4:
            product *= 3
            n -= 3
        return product * n`,
    jsCode: `var integerBreak = function(n) {
    if (n === 2) return 1;
    if (n === 3) return 2;
    let product = 1;
    while (n > 4) {
        product *= 3;
        n -= 3;
    }
    return product * n;
};`,
    explanation:
      '1. Special cases: n=2 returns 1, n=3 returns 2.\n' +
      '2. For n >= 4, break off 3s as much as possible.\n' +
      '3. Stop when n <= 4 (remaining n is multiplied as-is).\n' +
      '4. This avoids leaving a remainder of 1 (since 3+1=4 and 2*2 > 3*1).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Try breaking n into all 2s, all 3s, or a mix. Which gives the largest product?',
      '3 is optimal because 3 > e and is the nearest integer to e.',
      'Avoid remainders of 1: replace 3+1 with 2+2.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 345. Reverse Vowels of a String
  // ---------------------------------------------------------------------------
  {
    id: 345,
    description:
      'Given a string s, reverse only the vowels in the string and return it. The vowels are a, e, i, o, u (both uppercase and lowercase).',
    examples:
      'Input: s = "hello"\nOutput: "holle"',
    approach:
      'Use two pointers from both ends. Move them inward, skipping non-vowels. When both point to vowels, swap them.',
    code: `class Solution:
    def reverseVowels(self, s: str) -> str:
        vowels = set('aeiouAEIOU')
        s = list(s)
        left, right = 0, len(s) - 1
        while left < right:
            while left < right and s[left] not in vowels:
                left += 1
            while left < right and s[right] not in vowels:
                right -= 1
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1
        return ''.join(s)`,
    jsCode: `var reverseVowels = function(s) {
    const vowels = new Set('aeiouAEIOU');
    const arr = s.split('');
    let left = 0, right = arr.length - 1;
    while (left < right) {
        while (left < right && !vowels.has(arr[left])) left++;
        while (left < right && !vowels.has(arr[right])) right--;
        [arr[left], arr[right]] = [arr[right], arr[left]];
        left++;
        right--;
    }
    return arr.join('');
};`,
    explanation:
      '1. Convert string to list for in-place swapping.\n' +
      '2. Use two pointers from both ends.\n' +
      '3. Skip non-vowel characters on both sides.\n' +
      '4. Swap the vowels and move both pointers inward.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the character list',
    hints: [
      'Two-pointer approach from both ends.',
      'Skip non-vowels and swap vowels.',
      'Remember to handle both uppercase and lowercase vowels.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 346. Moving Average from Data Stream
  // ---------------------------------------------------------------------------
  {
    id: 346,
    description:
      'Given a stream of integers and a window size, calculate the moving average of all integers in the sliding window.',
    examples:
      'Input: size = 3, next(1) = 1.0, next(10) = 5.5, next(3) = 4.667, next(5) = 6.0',
    approach:
      'Use a queue (deque) to maintain the window. When the queue exceeds the size, remove the oldest element. Maintain a running sum for O(1) average computation.',
    code: `from collections import deque

class MovingAverage:
    def __init__(self, size: int):
        self.size = size
        self.queue = deque()
        self.total = 0

    def next(self, val: int) -> float:
        self.queue.append(val)
        self.total += val
        if len(self.queue) > self.size:
            self.total -= self.queue.popleft()
        return self.total / len(self.queue)`,
    jsCode: `var MovingAverage = function(size) {
    this.size = size;
    this.queue = [];
    this.total = 0;
};

MovingAverage.prototype.next = function(val) {
    this.queue.push(val);
    this.total += val;
    if (this.queue.length > this.size) {
        this.total -= this.queue.shift();
    }
    return this.total / this.queue.length;
};`,
    explanation:
      '1. Maintain a deque as the sliding window and a running total.\n' +
      '2. On each next(), add the value to queue and total.\n' +
      '3. If queue exceeds size, remove the oldest element and subtract from total.\n' +
      '4. Return total / queue length.',
    timeComplexity: 'O(1) per next() call',
    spaceComplexity: 'O(size)',
    hints: [
      'A queue naturally represents a sliding window.',
      'Maintain a running sum so you do not recalculate it each time.',
      'When the window is full, remove the oldest element before adding the new one.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 348. Design Tic-Tac-Toe
  // ---------------------------------------------------------------------------
  {
    id: 348,
    description:
      'Design a Tic-Tac-Toe game on an n x n board for two players. A player wins when they complete an entire row, column, or diagonal. Implement the move() method that returns the winner (1 or 2) or 0 if no winner yet.',
    examples:
      'Input: n = 3, moves: [0,0,1], [0,2,2], [2,2,1], [1,1,2], [2,0,1], [1,0,2], [2,1,1]\nOutput: Player 1 wins on the last move.',
    approach:
      'Track row sums, column sums, and two diagonal sums. Player 1 adds +1, player 2 adds -1. A player wins when any sum reaches +n or -n.',
    code: `class TicTacToe:
    def __init__(self, n: int):
        self.n = n
        self.rows = [0] * n
        self.cols = [0] * n
        self.diag = 0
        self.anti_diag = 0

    def move(self, row: int, col: int, player: int) -> int:
        val = 1 if player == 1 else -1
        self.rows[row] += val
        self.cols[col] += val
        if row == col:
            self.diag += val
        if row + col == self.n - 1:
            self.anti_diag += val
        if abs(self.rows[row]) == self.n or abs(self.cols[col]) == self.n or \\
           abs(self.diag) == self.n or abs(self.anti_diag) == self.n:
            return player
        return 0`,
    jsCode: `var TicTacToe = function(n) {
    this.n = n;
    this.rows = new Array(n).fill(0);
    this.cols = new Array(n).fill(0);
    this.diag = 0;
    this.antiDiag = 0;
};

TicTacToe.prototype.move = function(row, col, player) {
    const val = player === 1 ? 1 : -1;
    this.rows[row] += val;
    this.cols[col] += val;
    if (row === col) this.diag += val;
    if (row + col === this.n - 1) this.antiDiag += val;
    if (Math.abs(this.rows[row]) === this.n || Math.abs(this.cols[col]) === this.n ||
        Math.abs(this.diag) === this.n || Math.abs(this.antiDiag) === this.n) {
        return player;
    }
    return 0;
};`,
    explanation:
      '1. Use arrays for row/column sums and variables for diagonal sums.\n' +
      '2. Player 1 contributes +1, player 2 contributes -1.\n' +
      '3. On each move, update the relevant row, column, and diagonal(s).\n' +
      '4. If any sum reaches n or -n, the current player wins.',
    timeComplexity: 'O(1) per move',
    spaceComplexity: 'O(n)',
    hints: [
      'Instead of checking the entire board, track sums per row, column, and diagonal.',
      'Use +1 for player 1 and -1 for player 2.',
      'A player wins when any line sum reaches n or -n.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 349. Intersection of Two Arrays
  // ---------------------------------------------------------------------------
  {
    id: 349,
    description:
      'Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must be unique, and the result can be in any order.',
    examples:
      'Input: nums1 = [1,2,2,1], nums2 = [2,2]\nOutput: [2]',
    approach:
      'Convert both arrays to sets and compute the set intersection.',
    code: `class Solution:
    def intersection(self, nums1: list[int], nums2: list[int]) -> list[int]:
        return list(set(nums1) & set(nums2))`,
    jsCode: `var intersection = function(nums1, nums2) {
    const set1 = new Set(nums1);
    const set2 = new Set(nums2);
    return [...set1].filter(x => set2.has(x));
};`,
    explanation:
      '1. Convert nums1 and nums2 to sets to remove duplicates.\n' +
      '2. Use set intersection (&) to find common elements.\n' +
      '3. Convert back to a list.',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(n + m)',
    hints: [
      'Sets automatically handle duplicates.',
      'Python set intersection is efficient.',
      'Alternatively, sort both and use two pointers.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 350. Intersection of Two Arrays II
  // ---------------------------------------------------------------------------
  {
    id: 350,
    description:
      'Given two integer arrays nums1 and nums2, return an array of their intersection. Each element should appear as many times as it appears in both arrays. The result can be in any order.',
    examples:
      'Input: nums1 = [1,2,2,1], nums2 = [2,2]\nOutput: [2,2]',
    approach:
      'Use a Counter (frequency map) for the smaller array. Iterate through the larger array; for each element found in the counter, add it to the result and decrement the count.',
    code: `class Solution:
    def intersect(self, nums1: list[int], nums2: list[int]) -> list[int]:
        from collections import Counter
        counts = Counter(nums1)
        result = []
        for n in nums2:
            if counts[n] > 0:
                result.append(n)
                counts[n] -= 1
        return result`,
    jsCode: `var intersect = function(nums1, nums2) {
    const counts = new Map();
    for (const n of nums1) {
        counts.set(n, (counts.get(n) || 0) + 1);
    }
    const result = [];
    for (const n of nums2) {
        if (counts.get(n) > 0) {
            result.push(n);
            counts.set(n, counts.get(n) - 1);
        }
    }
    return result;
};`,
    explanation:
      '1. Count frequencies of elements in nums1.\n' +
      '2. Iterate through nums2; if an element has a positive count, include it and decrement.\n' +
      '3. This respects multiplicity: each element appears min(count1, count2) times.',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(min(n, m))',
    hints: [
      'Use a frequency map for one array and iterate through the other.',
      'Decrement the count when using an element to avoid overuse.',
      'If both arrays are sorted, you can use two pointers instead.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 352. Data Stream as Disjoint Intervals
  // ---------------------------------------------------------------------------
  {
    id: 352,
    description:
      'Given a data stream of non-negative integers, summarize the numbers seen so far as a list of disjoint intervals. Implement addNum() and getIntervals().',
    examples:
      'Input: addNum(1), addNum(3), addNum(7), addNum(2), addNum(6)\ngetIntervals() = [[1,3],[6,7]]',
    approach:
      'Use a sorted set or sorted list of intervals. On addNum, find the position to insert and merge with adjacent intervals as needed.',
    code: `from sortedcontainers import SortedDict

class SummaryRanges:
    def __init__(self):
        self.intervals = SortedDict()

    def addNum(self, value: int) -> None:
        s = e = value
        keys = self.intervals.keys()
        idx = self.intervals.bisect_right(value)
        if idx > 0:
            prev_s = keys[idx - 1]
            prev_e = self.intervals[prev_s]
            if prev_e >= value:
                return
            if prev_e + 1 == value:
                s = prev_s
                del self.intervals[prev_s]
        if idx < len(keys):
            next_s = keys[idx]
            next_e = self.intervals[next_s]
            if next_s == value:
                return
            if next_s - 1 == value:
                e = next_e
                del self.intervals[next_s]
        self.intervals[s] = e

    def getIntervals(self) -> list[list[int]]:
        return [[s, e] for s, e in self.intervals.items()]`,
    jsCode: `var SummaryRanges = function() {
    this.intervals = []; // sorted by start
};

SummaryRanges.prototype.addNum = function(value) {
    let s = value, e = value;
    const newIntervals = [];
    let inserted = false;
    for (const [start, end] of this.intervals) {
        if (end + 1 < s) {
            newIntervals.push([start, end]);
        } else if (e + 1 < start) {
            if (!inserted) {
                newIntervals.push([s, e]);
                inserted = true;
            }
            newIntervals.push([start, end]);
        } else {
            s = Math.min(s, start);
            e = Math.max(e, end);
        }
    }
    if (!inserted) newIntervals.push([s, e]);
    this.intervals = newIntervals;
};

SummaryRanges.prototype.getIntervals = function() {
    return this.intervals;
};`,
    explanation:
      '1. Maintain a SortedDict mapping interval starts to ends.\n' +
      '2. On addNum, find the insertion position using bisect.\n' +
      '3. Check if the new number extends the previous interval or merges with the next.\n' +
      '4. Merge intervals as needed.\n' +
      '5. getIntervals() returns all intervals in sorted order.',
    timeComplexity: 'O(log n) per addNum, O(n) for getIntervals',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a sorted data structure to maintain intervals.',
      'When adding a number, check if it merges with adjacent intervals.',
      'Handle three cases: extend left, extend right, or create new interval.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 354. Russian Doll Envelopes
  // ---------------------------------------------------------------------------
  {
    id: 354,
    description:
      'You have a set of envelopes, each with width and height. One envelope can fit inside another if both its width and height are strictly smaller. Find the maximum number of envelopes you can Russian doll.',
    examples:
      'Input: envelopes = [[5,4],[6,4],[6,7],[2,3]]\nOutput: 3\nExplanation: [2,3] => [5,4] => [6,7]',
    approach:
      'Sort by width ascending, then by height descending (for same width). Then find the Longest Increasing Subsequence (LIS) on heights. The descending height for same width prevents using two envelopes with the same width.',
    code: `import bisect

class Solution:
    def maxEnvelopes(self, envelopes: list[list[int]]) -> int:
        envelopes.sort(key=lambda x: (x[0], -x[1]))
        dp = []
        for _, h in envelopes:
            idx = bisect.bisect_left(dp, h)
            if idx == len(dp):
                dp.append(h)
            else:
                dp[idx] = h
        return len(dp)`,
    jsCode: `var maxEnvelopes = function(envelopes) {
    envelopes.sort((a, b) => a[0] === b[0] ? b[1] - a[1] : a[0] - b[0]);
    const dp = [];
    for (const [, h] of envelopes) {
        let lo = 0, hi = dp.length;
        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            if (dp[mid] < h) lo = mid + 1;
            else hi = mid;
        }
        dp[lo] = h;
    }
    return dp.length;
};`,
    explanation:
      '1. Sort by width ascending, height descending for ties.\n' +
      '2. Find LIS on the height values using binary search.\n' +
      '3. The descending height for same width ensures we cannot pick two same-width envelopes.\n' +
      '4. The LIS length equals the maximum number of nested envelopes.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Reduce to 1D LIS by clever sorting.',
      'Sort by width ascending, height descending for same width.',
      'Then find LIS on heights using binary search for O(n log n).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 358. Rearrange String k Distance Apart
  // ---------------------------------------------------------------------------
  {
    id: 358,
    description:
      'Given a string s and an integer k, rearrange the string such that the same characters are at least distance k from each other. Return any valid rearrangement or "" if impossible.',
    examples:
      'Input: s = "aabbcc", k = 3\nOutput: "abcabc"',
    approach:
      'Use a max heap (by frequency) and a cooldown queue. Greedily pick the most frequent character. After placing it, put it in a queue with a cooldown counter. Release characters back to the heap when their cooldown expires.',
    code: `class Solution:
    def rearrangeString(self, s: str, k: int) -> str:
        if k <= 1:
            return s
        from collections import Counter
        import heapq
        from collections import deque
        counts = Counter(s)
        heap = [(-cnt, ch) for ch, cnt in counts.items()]
        heapq.heapify(heap)
        queue = deque()
        result = []
        while heap or queue:
            if queue and queue[0][2] <= len(result) - k + 1:
                cnt, ch, _ = queue.popleft()
                if cnt < 0:
                    heapq.heappush(heap, (cnt, ch))
            if not heap:
                if queue:
                    return ""
                break
            cnt, ch = heapq.heappop(heap)
            result.append(ch)
            queue.append((cnt + 1, ch, len(result)))
        return ''.join(result)`,
    jsCode: `var rearrangeString = function(s, k) {
    if (k <= 1) return s;
    const counts = new Map();
    for (const c of s) counts.set(c, (counts.get(c) || 0) + 1);
    // Use sorted array as priority queue
    let heap = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const result = [];
    const cooldown = [];
    while (heap.length || cooldown.length) {
        // Release from cooldown
        const newCooldown = [];
        for (const [ch, cnt, releaseAt] of cooldown) {
            if (releaseAt <= result.length) {
                heap.push([ch, cnt]);
            } else {
                newCooldown.push([ch, cnt, releaseAt]);
            }
        }
        heap.sort((a, b) => b[1] - a[1]);
        if (!heap.length) {
            if (newCooldown.length) return "";
            break;
        }
        const [ch, cnt] = heap.shift();
        result.push(ch);
        if (cnt - 1 > 0) {
            newCooldown.push([ch, cnt - 1, result.length + k - 1]);
        }
        cooldown.length = 0;
        cooldown.push(...newCooldown);
    }
    return result.join('');
};`,
    explanation:
      '1. Count character frequencies and build a max heap.\n' +
      '2. Greedily pick the most frequent character available.\n' +
      '3. After placing a character, add it to a cooldown queue.\n' +
      '4. Release from queue when the position difference reaches k.\n' +
      '5. If no character is available and queue is non-empty, return "".',
    timeComplexity: 'O(n log 26) = O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Greedy with a max heap: always place the most frequent character.',
      'Use a cooldown queue to enforce the k-distance constraint.',
      'If the heap is empty but the queue is not, rearrangement is impossible.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 359. Logger Rate Limiter
  // ---------------------------------------------------------------------------
  {
    id: 359,
    description:
      'Design a logger system that receives a stream of messages with timestamps. Each unique message should only be printed at most once every 10 seconds. Return true if the message should be printed, false otherwise.',
    examples:
      'Input: [[1,"foo"],[2,"bar"],[3,"foo"],[8,"bar"],[10,"foo"],[11,"foo"]]\nOutput: [true,true,false,false,false,true]',
    approach:
      'Use a hash map storing the next allowed timestamp for each message. If the current timestamp is >= the stored value, print the message and update the timestamp to current + 10.',
    code: `class Logger:
    def __init__(self):
        self.msg_time = {}

    def shouldPrintMessage(self, timestamp: int, message: str) -> bool:
        if message not in self.msg_time or timestamp >= self.msg_time[message]:
            self.msg_time[message] = timestamp + 10
            return True
        return False`,
    jsCode: `var Logger = function() {
    this.msgTime = new Map();
};

Logger.prototype.shouldPrintMessage = function(timestamp, message) {
    if (!this.msgTime.has(message) || timestamp >= this.msgTime.get(message)) {
        this.msgTime.set(message, timestamp + 10);
        return true;
    }
    return false;
};`,
    explanation:
      '1. Maintain a dictionary mapping messages to their next allowed print time.\n' +
      '2. If the message is new or the current timestamp >= next allowed time, allow it.\n' +
      '3. Update the next allowed time to timestamp + 10.\n' +
      '4. Otherwise, reject the message.',
    timeComplexity: 'O(1) per call',
    spaceComplexity: 'O(n) for stored messages',
    hints: [
      'Use a hash map to store the last allowed print time for each message.',
      'Compare the current timestamp against the stored time.',
      'Update the stored time when the message is printed.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 362. Design Hit Counter
  // ---------------------------------------------------------------------------
  {
    id: 362,
    description:
      'Design a hit counter that counts the number of hits received in the past 5 minutes (300 seconds). Each function accepts a timestamp parameter (in seconds) and calls are made in chronological order.',
    examples:
      'Input: hit(1), hit(2), hit(3), getHits(4) = 3, hit(300), getHits(300) = 4, getHits(301) = 3',
    approach:
      'Use a deque to store hit timestamps. On getHits(), remove timestamps older than 300 seconds from the front. The deque size is the answer.',
    code: `from collections import deque

class HitCounter:
    def __init__(self):
        self.hits = deque()

    def hit(self, timestamp: int) -> None:
        self.hits.append(timestamp)

    def getHits(self, timestamp: int) -> int:
        while self.hits and self.hits[0] <= timestamp - 300:
            self.hits.popleft()
        return len(self.hits)`,
    jsCode: `var HitCounter = function() {
    this.hits = [];
};

HitCounter.prototype.hit = function(timestamp) {
    this.hits.push(timestamp);
};

HitCounter.prototype.getHits = function(timestamp) {
    while (this.hits.length && this.hits[0] <= timestamp - 300) {
        this.hits.shift();
    }
    return this.hits.length;
};`,
    explanation:
      '1. Append each hit timestamp to a deque.\n' +
      '2. On getHits, remove expired timestamps (> 300 seconds old) from the front.\n' +
      '3. Return the remaining deque size as the hit count.',
    timeComplexity: 'O(1) amortized per operation',
    spaceComplexity: 'O(n) where n is hits in the last 300 seconds',
    hints: [
      'A queue naturally supports the sliding window of 300 seconds.',
      'Remove expired entries from the front on each query.',
      'For high throughput, consider bucketing by timestamp.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 366. Find Leaves of Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 366,
    description:
      'Given the root of a binary tree, collect all leaf nodes, remove them, and repeat until the tree is empty. Return the groups of leaves in order.',
    examples:
      'Input: root = [1,2,3,4,5]\nOutput: [[4,5,3],[2],[1]]',
    approach:
      'Compute the "height" of each node (distance from the farthest leaf). Leaves have height 0, their parents height 1, etc. Group nodes by their height.',
    code: `class Solution:
    def findLeaves(self, root) -> list[list[int]]:
        result = []
        def dfs(node):
            if not node:
                return -1
            h = max(dfs(node.left), dfs(node.right)) + 1
            if h == len(result):
                result.append([])
            result[h].append(node.val)
            return h
        dfs(root)
        return result`,
    jsCode: `var findLeaves = function(root) {
    const result = [];
    const dfs = (node) => {
        if (!node) return -1;
        const h = Math.max(dfs(node.left), dfs(node.right)) + 1;
        if (h === result.length) result.push([]);
        result[h].push(node.val);
        return h;
    };
    dfs(root);
    return result;
};`,
    explanation:
      '1. DFS returns the height of each node (0 for leaves).\n' +
      '2. Height = max(left_height, right_height) + 1.\n' +
      '3. Append the node value to result[height].\n' +
      '4. result[0] contains leaves, result[1] their parents, etc.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Think of each node by its distance from the farthest leaf.',
      'Leaves have height 0, their parents height 1, etc.',
      'Group nodes by height to get the removal order.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 367. Valid Perfect Square
  // ---------------------------------------------------------------------------
  {
    id: 367,
    description:
      'Given a positive integer num, return true if num is a perfect square. Do not use any built-in library function such as sqrt.',
    examples:
      'Input: num = 16\nOutput: true',
    approach:
      'Use binary search. Search for a value mid in [1, num] where mid * mid == num.',
    code: `class Solution:
    def isPerfectSquare(self, num: int) -> bool:
        lo, hi = 1, num
        while lo <= hi:
            mid = (lo + hi) // 2
            sq = mid * mid
            if sq == num:
                return True
            elif sq < num:
                lo = mid + 1
            else:
                hi = mid - 1
        return False`,
    jsCode: `var isPerfectSquare = function(num) {
    let lo = 1, hi = num;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const sq = mid * mid;
        if (sq === num) return true;
        else if (sq < num) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
};`,
    explanation:
      '1. Binary search in range [1, num].\n' +
      '2. Compute mid * mid and compare with num.\n' +
      '3. If equal, num is a perfect square.\n' +
      '4. Adjust search range based on comparison.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Binary search for the square root.',
      'Check if mid * mid equals num.',
      'Be careful with integer overflow for large numbers.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 368. Largest Divisible Subset
  // ---------------------------------------------------------------------------
  {
    id: 368,
    description:
      'Given a set of distinct positive integers nums, return the largest subset such that every pair (nums[i], nums[j]) in the subset satisfies nums[i] % nums[j] == 0 or nums[j] % nums[i] == 0.',
    examples:
      'Input: nums = [1,2,3]\nOutput: [1,2] (or [1,3])',
    approach:
      'Sort the array. Use DP where dp[i] = size of largest divisible subset ending at nums[i]. For each i, check all j < i where nums[i] % nums[j] == 0. Reconstruct the subset by backtracking.',
    code: `class Solution:
    def largestDivisibleSubset(self, nums: list[int]) -> list[int]:
        nums.sort()
        n = len(nums)
        dp = [1] * n
        parent = [-1] * n
        max_idx = 0
        for i in range(1, n):
            for j in range(i):
                if nums[i] % nums[j] == 0 and dp[j] + 1 > dp[i]:
                    dp[i] = dp[j] + 1
                    parent[i] = j
            if dp[i] > dp[max_idx]:
                max_idx = i
        result = []
        while max_idx != -1:
            result.append(nums[max_idx])
            max_idx = parent[max_idx]
        return result[::-1]`,
    jsCode: `var largestDivisibleSubset = function(nums) {
    nums.sort((a, b) => a - b);
    const n = nums.length;
    const dp = new Array(n).fill(1);
    const parent = new Array(n).fill(-1);
    let maxIdx = 0;
    for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[i] % nums[j] === 0 && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                parent[i] = j;
            }
        }
        if (dp[i] > dp[maxIdx]) maxIdx = i;
    }
    const result = [];
    while (maxIdx !== -1) {
        result.push(nums[maxIdx]);
        maxIdx = parent[maxIdx];
    }
    return result.reverse();
};`,
    explanation:
      '1. Sort nums so we only need to check divisibility in one direction.\n' +
      '2. dp[i] = size of largest subset ending at nums[i].\n' +
      '3. For each i, extend the best j where nums[i] % nums[j] == 0.\n' +
      '4. Track parent pointers for reconstruction.\n' +
      '5. Backtrack from the max dp index to build the result.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    hints: [
      'Sort the array so divisibility only needs to be checked one way.',
      'This is similar to LIS but with divisibility instead of ordering.',
      'Use parent pointers to reconstruct the subset.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 373. Find K Pairs with Smallest Sums
  // ---------------------------------------------------------------------------
  {
    id: 373,
    description:
      'Given two sorted arrays nums1 and nums2, and an integer k, find the k pairs (u, v) with the smallest sums where u is from nums1 and v is from nums2.',
    examples:
      'Input: nums1 = [1,7,11], nums2 = [2,4,6], k = 3\nOutput: [[1,2],[1,4],[1,6]]',
    approach:
      'Use a min-heap. Start with pairs (nums1[i], nums2[0]) for all i. Pop the smallest, and push (nums1[i], nums2[j+1]) as the next candidate. This explores pairs in sorted order.',
    code: `import heapq

class Solution:
    def kSmallestPairs(self, nums1: list[int], nums2: list[int], k: int) -> list[list[int]]:
        if not nums1 or not nums2:
            return []
        heap = [(nums1[i] + nums2[0], i, 0) for i in range(min(k, len(nums1)))]
        heapq.heapify(heap)
        result = []
        while heap and len(result) < k:
            total, i, j = heapq.heappop(heap)
            result.append([nums1[i], nums2[j]])
            if j + 1 < len(nums2):
                heapq.heappush(heap, (nums1[i] + nums2[j+1], i, j+1))
        return result`,
    jsCode: `var kSmallestPairs = function(nums1, nums2, k) {
    if (!nums1.length || !nums2.length) return [];
    // Simple approach using sorted candidates
    const heap = [];
    for (let i = 0; i < Math.min(k, nums1.length); i++) {
        heap.push([nums1[i] + nums2[0], i, 0]);
    }
    heap.sort((a, b) => a[0] - b[0]);
    const result = [];
    while (heap.length && result.length < k) {
        const [, i, j] = heap.shift();
        result.push([nums1[i], nums2[j]]);
        if (j + 1 < nums2.length) {
            heap.push([nums1[i] + nums2[j + 1], i, j + 1]);
            heap.sort((a, b) => a[0] - b[0]);
        }
    }
    return result;
};`,
    explanation:
      '1. Initialize heap with (nums1[i] + nums2[0], i, 0) for each i.\n' +
      '2. Pop the smallest sum pair.\n' +
      '3. Push the next pair (same i, j+1) to explore.\n' +
      '4. Repeat until we have k pairs.',
    timeComplexity: 'O(k log k)',
    spaceComplexity: 'O(k)',
    hints: [
      'Think of this as merging k sorted lists, one for each index in nums1.',
      'Use a min-heap to always get the next smallest pair.',
      'Only push the "next" pair for each popped pair to limit heap size.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 374. Guess Number Higher or Lower
  // ---------------------------------------------------------------------------
  {
    id: 374,
    description:
      'We are playing a guessing game. I pick a number from 1 to n. You guess a number and I tell you if it is higher, lower, or correct. The API guess(num) returns -1 (my number is lower), 1 (higher), or 0 (correct). Find the number I picked.',
    examples:
      'Input: n = 10, pick = 6\nOutput: 6',
    approach:
      'Use binary search on the range [1, n]. Call guess(mid) and adjust the range based on the result.',
    code: `class Solution:
    def guessNumber(self, n: int) -> int:
        lo, hi = 1, n
        while lo <= hi:
            mid = (lo + hi) // 2
            result = guess(mid)
            if result == 0:
                return mid
            elif result == -1:
                hi = mid - 1
            else:
                lo = mid + 1
        return lo`,
    jsCode: `var guessNumber = function(n) {
    let lo = 1, hi = n;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const result = guess(mid);
        if (result === 0) return mid;
        else if (result === -1) hi = mid - 1;
        else lo = mid + 1;
    }
    return lo;
};`,
    explanation:
      '1. Binary search between 1 and n.\n' +
      '2. Call guess(mid) to get feedback.\n' +
      '3. If 0, mid is the answer.\n' +
      '4. If -1, the number is smaller (search left). If 1, search right.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Classic binary search problem.',
      'Use the guess API to determine which half to search.',
      'Be careful with the meaning of return values (-1 vs 1).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 376. Wiggle Subsequence
  // ---------------------------------------------------------------------------
  {
    id: 376,
    description:
      'A wiggle sequence alternates between increasing and decreasing consecutive differences. Given an integer array nums, return the length of the longest wiggle subsequence.',
    examples:
      'Input: nums = [1,7,4,9,2,5]\nOutput: 6\nExplanation: The entire array is a wiggle sequence.',
    approach:
      'Use two variables: up (length of longest wiggle ending with an up) and down (ending with a down). When nums[i] > nums[i-1], up = down + 1. When nums[i] < nums[i-1], down = up + 1.',
    code: `class Solution:
    def wiggleMaxLength(self, nums: list[int]) -> int:
        if len(nums) < 2:
            return len(nums)
        up = down = 1
        for i in range(1, len(nums)):
            if nums[i] > nums[i-1]:
                up = down + 1
            elif nums[i] < nums[i-1]:
                down = up + 1
        return max(up, down)`,
    jsCode: `var wiggleMaxLength = function(nums) {
    if (nums.length < 2) return nums.length;
    let up = 1, down = 1;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] > nums[i - 1]) up = down + 1;
        else if (nums[i] < nums[i - 1]) down = up + 1;
    }
    return Math.max(up, down);
};`,
    explanation:
      '1. Initialize up = down = 1.\n' +
      '2. If current > previous, a new up follows a down: up = down + 1.\n' +
      '3. If current < previous, a new down follows an up: down = up + 1.\n' +
      '4. Return max(up, down).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Track two states: longest subsequence ending with an up move and with a down move.',
      'An up move extends the longest down sequence, and vice versa.',
      'Greedy: consecutive same-direction moves can be compressed.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 377. Combination Sum IV
  // ---------------------------------------------------------------------------
  {
    id: 377,
    description:
      'Given an array of distinct integers nums and a target integer target, return the number of possible combinations that add up to target. Different orderings count as different combinations.',
    examples:
      'Input: nums = [1,2,3], target = 4\nOutput: 7',
    approach:
      'Use dynamic programming. dp[i] = number of combinations that sum to i. For each amount from 1 to target, try all numbers in nums: dp[i] += dp[i - num] if i >= num.',
    code: `class Solution:
    def combinationSum4(self, nums: list[int], target: int) -> int:
        dp = [0] * (target + 1)
        dp[0] = 1
        for i in range(1, target + 1):
            for num in nums:
                if i >= num:
                    dp[i] += dp[i - num]
        return dp[target]`,
    jsCode: `var combinationSum4 = function(nums, target) {
    const dp = new Array(target + 1).fill(0);
    dp[0] = 1;
    for (let i = 1; i <= target; i++) {
        for (const num of nums) {
            if (i >= num) dp[i] += dp[i - num];
        }
    }
    return dp[target];
};`,
    explanation:
      '1. dp[0] = 1 (one way to make sum 0: use nothing).\n' +
      '2. For each target value i, try subtracting each number.\n' +
      '3. dp[i] accumulates all ways to reach i.\n' +
      '4. The outer loop over amounts (not nums) counts permutations, not combinations.',
    timeComplexity: 'O(target * n)',
    spaceComplexity: 'O(target)',
    hints: [
      'This is like unbounded knapsack but order matters.',
      'Loop over amounts first (outer), then over nums (inner) to count permutations.',
      'dp[i] = sum of dp[i - num] for all valid nums.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 378. Kth Smallest Element in a Sorted Matrix
  // ---------------------------------------------------------------------------
  {
    id: 378,
    description:
      'Given an n x n matrix where each row and each column is sorted in ascending order, return the kth smallest element in the matrix.',
    examples:
      'Input: matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8\nOutput: 13',
    approach:
      'Use binary search on the value range [matrix[0][0], matrix[n-1][n-1]]. For a candidate value mid, count how many elements are <= mid by stepping through the matrix from the bottom-left corner.',
    code: `class Solution:
    def kthSmallest(self, matrix: list[list[int]], k: int) -> int:
        n = len(matrix)
        lo, hi = matrix[0][0], matrix[n-1][n-1]
        while lo < hi:
            mid = (lo + hi) // 2
            count = 0
            j = n - 1
            for i in range(n):
                while j >= 0 and matrix[i][j] > mid:
                    j -= 1
                count += j + 1
            if count < k:
                lo = mid + 1
            else:
                hi = mid
        return lo`,
    jsCode: `var kthSmallest = function(matrix, k) {
    const n = matrix.length;
    let lo = matrix[0][0], hi = matrix[n - 1][n - 1];
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        let count = 0, j = n - 1;
        for (let i = 0; i < n; i++) {
            while (j >= 0 && matrix[i][j] > mid) j--;
            count += j + 1;
        }
        if (count < k) lo = mid + 1;
        else hi = mid;
    }
    return lo;
};`,
    explanation:
      '1. Binary search on the value range.\n' +
      '2. For each candidate mid, count elements <= mid.\n' +
      '3. Start from bottom-left: move up if too large, count columns if small enough.\n' +
      '4. If count < k, search higher; otherwise search lower.\n' +
      '5. lo converges to the kth smallest value.',
    timeComplexity: 'O(n * log(max - min))',
    spaceComplexity: 'O(1)',
    hints: [
      'Binary search on the value range, not on indices.',
      'Count elements <= mid using the sorted row/column property.',
      'Step through the matrix from bottom-left for an O(n) count.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 381. Insert Delete GetRandom O(1) - Duplicates Allowed
  // ---------------------------------------------------------------------------
  {
    id: 381,
    description:
      'Implement the RandomizedCollection class that supports insert, remove, and getRandom in average O(1) time. Duplicates are allowed. getRandom should return each element with probability proportional to its count.',
    examples:
      'Input: insert(1), insert(1), insert(2), getRandom(), remove(1), getRandom()\nOutput: getRandom returns 1 or 2 with correct probability.',
    approach:
      'Use a list for elements and a dictionary mapping values to sets of their indices. On remove, swap the target with the last element and pop. Track all indices for duplicates.',
    code: `import random

class RandomizedCollection:
    def __init__(self):
        self.vals = []
        self.idx_map = {}

    def insert(self, val: int) -> bool:
        not_present = val not in self.idx_map or len(self.idx_map[val]) == 0
        if val not in self.idx_map:
            self.idx_map[val] = set()
        self.idx_map[val].add(len(self.vals))
        self.vals.append(val)
        return not_present

    def remove(self, val: int) -> bool:
        if val not in self.idx_map or len(self.idx_map[val]) == 0:
            return False
        idx = self.idx_map[val].pop()
        last = self.vals[-1]
        self.vals[idx] = last
        self.idx_map[last].add(idx)
        self.idx_map[last].discard(len(self.vals) - 1)
        self.vals.pop()
        return True

    def getRandom(self) -> int:
        return random.choice(self.vals)`,
    jsCode: `var RandomizedCollection = function() {
    this.vals = [];
    this.idxMap = new Map();
};

RandomizedCollection.prototype.insert = function(val) {
    const notPresent = !this.idxMap.has(val) || this.idxMap.get(val).size === 0;
    if (!this.idxMap.has(val)) this.idxMap.set(val, new Set());
    this.idxMap.get(val).add(this.vals.length);
    this.vals.push(val);
    return notPresent;
};

RandomizedCollection.prototype.remove = function(val) {
    if (!this.idxMap.has(val) || this.idxMap.get(val).size === 0) return false;
    const idx = this.idxMap.get(val).values().next().value;
    this.idxMap.get(val).delete(idx);
    const last = this.vals[this.vals.length - 1];
    this.vals[idx] = last;
    this.idxMap.get(last).add(idx);
    this.idxMap.get(last).delete(this.vals.length - 1);
    this.vals.pop();
    return true;
};

RandomizedCollection.prototype.getRandom = function() {
    return this.vals[Math.floor(Math.random() * this.vals.length)];
};`,
    explanation:
      '1. vals list stores all elements. idx_map maps values to sets of their indices.\n' +
      '2. insert: add index to the set and append to list.\n' +
      '3. remove: swap target with last element, update indices, pop from list.\n' +
      '4. getRandom: random.choice on the list gives correct probability.',
    timeComplexity: 'O(1) average for all operations',
    spaceComplexity: 'O(n)',
    hints: [
      'Extend the RandomizedSet approach to handle duplicates with index sets.',
      'Swap-and-pop for O(1) removal.',
      'Use sets of indices to track multiple occurrences.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 382. Linked List Random Node
  // ---------------------------------------------------------------------------
  {
    id: 382,
    description:
      'Given the head of a singly linked list, implement getRandom() to return a random node\'s value with equal probability. Each node must be equally likely to be chosen.',
    examples:
      'Input: head = [1,2,3]\nOutput: getRandom() returns 1, 2, or 3 with equal probability.',
    approach:
      'Use Reservoir Sampling. Traverse the list, and for the ith node, replace the result with probability 1/i. This ensures uniform distribution.',
    code: `import random

class Solution:
    def __init__(self, head):
        self.head = head

    def getRandom(self) -> int:
        result = 0
        node = self.head
        i = 1
        while node:
            if random.randint(1, i) == 1:
                result = node.val
            node = node.next
            i += 1
        return result`,
    jsCode: `var Solution = function(head) {
    this.head = head;
};

Solution.prototype.getRandom = function() {
    let result = 0;
    let node = this.head;
    let i = 1;
    while (node) {
        if (Math.floor(Math.random() * i) === 0) {
            result = node.val;
        }
        node = node.next;
        i++;
    }
    return result;
};`,
    explanation:
      '1. Traverse the list, keeping a counter i.\n' +
      '2. For the ith node, replace the result with probability 1/i.\n' +
      '3. This is Reservoir Sampling with k=1.\n' +
      '4. Each node ends up with equal probability 1/n of being selected.',
    timeComplexity: 'O(n) per getRandom call',
    spaceComplexity: 'O(1)',
    hints: [
      'Reservoir Sampling selects a random element from a stream.',
      'For the ith element, keep it with probability 1/i.',
      'This works even when the list length is unknown.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 383. Ransom Note
  // ---------------------------------------------------------------------------
  {
    id: 383,
    description:
      'Given two strings ransomNote and magazine, return true if ransomNote can be constructed from the characters in magazine. Each character in magazine can only be used once.',
    examples:
      'Input: ransomNote = "aa", magazine = "aab"\nOutput: true',
    approach:
      'Count character frequencies in magazine. Then check if every character in ransomNote has a sufficient count.',
    code: `class Solution:
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        from collections import Counter
        mag_count = Counter(magazine)
        for c in ransomNote:
            if mag_count[c] <= 0:
                return False
            mag_count[c] -= 1
        return True`,
    jsCode: `var canConstruct = function(ransomNote, magazine) {
    const magCount = new Map();
    for (const c of magazine) {
        magCount.set(c, (magCount.get(c) || 0) + 1);
    }
    for (const c of ransomNote) {
        if (!magCount.get(c) || magCount.get(c) <= 0) return false;
        magCount.set(c, magCount.get(c) - 1);
    }
    return true;
};`,
    explanation:
      '1. Count all characters in magazine.\n' +
      '2. For each character in ransomNote, check if it is available.\n' +
      '3. Decrement the count on use. If insufficient, return False.',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(1) — at most 26 characters',
    hints: [
      'This is a frequency counting problem.',
      'Count characters in magazine, then verify ransomNote requirements.',
      'Alternatively, use Counter subtraction and check for negatives.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 384. Shuffle an Array
  // ---------------------------------------------------------------------------
  {
    id: 384,
    description:
      'Given an integer array nums, design an algorithm to randomly shuffle the array. All permutations must be equally likely. Implement reset() to return the original array and shuffle() to return a random permutation.',
    examples:
      'Input: nums = [1,2,3]\nOutput: shuffle() returns a random permutation like [3,1,2].',
    approach:
      'Use the Fisher-Yates (Knuth) shuffle. For each index from the end, swap with a random index from [0, i]. This produces a uniform random permutation.',
    code: `import random

class Solution:
    def __init__(self, nums: list[int]):
        self.original = nums[:]
        self.array = nums

    def reset(self) -> list[int]:
        self.array = self.original[:]
        return self.array

    def shuffle(self) -> list[int]:
        for i in range(len(self.array) - 1, 0, -1):
            j = random.randint(0, i)
            self.array[i], self.array[j] = self.array[j], self.array[i]
        return self.array`,
    jsCode: `var Solution = function(nums) {
    this.original = [...nums];
    this.array = nums;
};

Solution.prototype.reset = function() {
    this.array = [...this.original];
    return this.array;
};

Solution.prototype.shuffle = function() {
    for (let i = this.array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
    }
    return this.array;
};`,
    explanation:
      '1. Store a copy of the original array for reset.\n' +
      '2. Fisher-Yates shuffle: for i from n-1 to 1, swap array[i] with array[random(0..i)].\n' +
      '3. Each permutation has equal probability 1/n!.\n' +
      '4. reset() restores from the saved copy.',
    timeComplexity: 'O(n) for shuffle, O(n) for reset',
    spaceComplexity: 'O(n)',
    hints: [
      'Fisher-Yates shuffle produces uniformly random permutations.',
      'For each position from the end, swap with a random earlier position.',
      'Keep a copy of the original for reset.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 387. First Unique Character in a String
  // ---------------------------------------------------------------------------
  {
    id: 387,
    description:
      'Given a string s, find the first non-repeating character and return its index. If it does not exist, return -1.',
    examples:
      'Input: s = "leetcode"\nOutput: 0',
    approach:
      'Count character frequencies in one pass. In a second pass, return the index of the first character with count 1.',
    code: `class Solution:
    def firstUniqChar(self, s: str) -> int:
        from collections import Counter
        counts = Counter(s)
        for i, c in enumerate(s):
            if counts[c] == 1:
                return i
        return -1`,
    jsCode: `var firstUniqChar = function(s) {
    const counts = new Map();
    for (const c of s) {
        counts.set(c, (counts.get(c) || 0) + 1);
    }
    for (let i = 0; i < s.length; i++) {
        if (counts.get(s[i]) === 1) return i;
    }
    return -1;
};`,
    explanation:
      '1. Count all character frequencies.\n' +
      '2. Iterate through the string again.\n' +
      '3. Return the index of the first character with count 1.\n' +
      '4. If none found, return -1.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) — at most 26 characters',
    hints: [
      'Two-pass approach: count first, then find the first unique.',
      'Characters with count 1 are unique.',
      'The first pass is O(n); the second pass is also O(n).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 389. Find the Difference
  // ---------------------------------------------------------------------------
  {
    id: 389,
    description:
      'String t is generated by randomly shuffling string s and then adding one more letter at a random position. Return the letter that was added.',
    examples:
      'Input: s = "abcd", t = "abcde"\nOutput: "e"',
    approach:
      'XOR all characters in s and t. Since each original character appears in both, they cancel out, leaving only the added character.',
    code: `class Solution:
    def findTheDifference(self, s: str, t: str) -> str:
        result = 0
        for c in s + t:
            result ^= ord(c)
        return chr(result)`,
    jsCode: `var findTheDifference = function(s, t) {
    let result = 0;
    for (const c of s + t) {
        result ^= c.charCodeAt(0);
    }
    return String.fromCharCode(result);
};`,
    explanation:
      '1. XOR all characters in both strings.\n' +
      '2. Characters from s appear in both s and t, canceling out.\n' +
      '3. The remaining value is the added character.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'XOR cancels out duplicate characters.',
      'Alternatively, compare character frequency counts.',
      'Sum of ASCII values also works: sum(t) - sum(s) gives the added character.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 395. Longest Substring with At Least K Repeating Characters
  // ---------------------------------------------------------------------------
  {
    id: 395,
    description:
      'Given a string s and an integer k, return the length of the longest substring where every character appears at least k times.',
    examples:
      'Input: s = "aaabb", k = 3\nOutput: 3\nExplanation: "aaa" is the longest valid substring.',
    approach:
      'Use divide and conquer. Find any character with frequency < k; it cannot be in the answer. Split the string at those characters and recursively solve each segment. Take the maximum.',
    code: `class Solution:
    def longestSubstring(self, s: str, k: int) -> int:
        if len(s) < k:
            return 0
        from collections import Counter
        counts = Counter(s)
        for c in counts:
            if counts[c] < k:
                return max(self.longestSubstring(sub, k) for sub in s.split(c))
        return len(s)`,
    jsCode: `var longestSubstring = function(s, k) {
    if (s.length < k) return 0;
    const counts = new Map();
    for (const c of s) counts.set(c, (counts.get(c) || 0) + 1);
    for (const [c, cnt] of counts) {
        if (cnt < k) {
            return Math.max(...s.split(c).map(sub => longestSubstring(sub, k)));
        }
    }
    return s.length;
};`,
    explanation:
      '1. Base case: if string length < k, no valid substring exists.\n' +
      '2. Count character frequencies.\n' +
      '3. If all characters appear >= k times, the whole string is valid.\n' +
      '4. Otherwise, split at any character with count < k and recurse on each part.\n' +
      '5. Return the maximum across all parts.',
    timeComplexity: 'O(n * 26) — at most 26 levels of recursion',
    spaceComplexity: 'O(n)',
    hints: [
      'A character with count < k cannot be part of any valid substring.',
      'Split the string at such characters and solve each part independently.',
      'Recursive depth is bounded by the alphabet size (26).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 402. Remove K Digits
  // ---------------------------------------------------------------------------
  {
    id: 402,
    description:
      'Given a non-negative integer num represented as a string and an integer k, remove k digits from the number so that the result is the smallest possible. Return the result as a string with no leading zeros.',
    examples:
      'Input: num = "1432219", k = 3\nOutput: "1219"',
    approach:
      'Use a monotonic stack. Iterate through digits; while the stack top is greater than the current digit and k > 0, pop (remove a digit). After processing, remove remaining from the end. Strip leading zeros.',
    code: `class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        stack = []
        for d in num:
            while k > 0 and stack and stack[-1] > d:
                stack.pop()
                k -= 1
            stack.append(d)
        stack = stack[:len(stack) - k]
        return ''.join(stack).lstrip('0') or '0'`,
    jsCode: `var removeKdigits = function(num, k) {
    const stack = [];
    for (const d of num) {
        while (k > 0 && stack.length && stack[stack.length - 1] > d) {
            stack.pop();
            k--;
        }
        stack.push(d);
    }
    while (k > 0) { stack.pop(); k--; }
    const result = stack.join('').replace(/^0+/, '');
    return result || '0';
};`,
    explanation:
      '1. Use a stack to build the smallest number greedily.\n' +
      '2. For each digit, pop larger digits from the stack (using up k removals).\n' +
      '3. If k > 0 after iteration, remove from the end (rightmost digits).\n' +
      '4. Strip leading zeros and handle the empty string case.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Greedily remove digits that are larger than the next digit.',
      'A monotonic increasing stack helps maintain the smallest prefix.',
      'If removals remain after one pass, remove from the end.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 403. Frog Jump
  // ---------------------------------------------------------------------------
  {
    id: 403,
    description:
      'A frog is crossing a river by jumping on stones. The stones are at given positions. The frog starts at stone 0 with a jump of size 1. If the last jump was k units, the next jump must be k-1, k, or k+1 units. Determine if the frog can reach the last stone.',
    examples:
      'Input: stones = [0,1,3,5,6,8,12,17]\nOutput: true',
    approach:
      'Use a dictionary mapping each stone position to the set of jump sizes that can reach it. For each stone, try all valid next jumps (k-1, k, k+1) and update the target stone\'s set.',
    code: `class Solution:
    def canCross(self, stones: list[int]) -> bool:
        stone_set = {s: set() for s in stones}
        stone_set[0].add(0)
        for s in stones:
            for k in stone_set[s]:
                for jump in (k-1, k, k+1):
                    if jump > 0 and s + jump in stone_set:
                        stone_set[s + jump].add(jump)
        return len(stone_set[stones[-1]]) > 0`,
    jsCode: `var canCross = function(stones) {
    const stoneSet = new Map();
    for (const s of stones) stoneSet.set(s, new Set());
    stoneSet.get(0).add(0);
    for (const s of stones) {
        for (const k of stoneSet.get(s)) {
            for (const jump of [k - 1, k, k + 1]) {
                if (jump > 0 && stoneSet.has(s + jump)) {
                    stoneSet.get(s + jump).add(jump);
                }
            }
        }
    }
    return stoneSet.get(stones[stones.length - 1]).size > 0;
};`,
    explanation:
      '1. Map each stone position to a set of jump sizes that can reach it.\n' +
      '2. Start: stone 0 is reachable with jump size 0.\n' +
      '3. For each stone, try jumps of k-1, k, k+1 for each k in its set.\n' +
      '4. If the target position is a valid stone, add the jump size.\n' +
      '5. The last stone is reachable if its set is non-empty.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Track possible jump sizes at each stone position.',
      'For each stone and each possible jump, check if the target is a valid stone.',
      'Use a set for O(1) lookup of stone positions.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 404. Sum of Left Leaves
  // ---------------------------------------------------------------------------
  {
    id: 404,
    description:
      'Given the root of a binary tree, return the sum of all left leaves. A left leaf is a leaf node that is the left child of its parent.',
    examples:
      'Input: root = [3,9,20,null,null,15,7]\nOutput: 24\nExplanation: 9 and 15 are left leaves. 9 + 15 = 24.',
    approach:
      'Use DFS. When visiting a node, check if its left child is a leaf (no children). If so, add its value. Recurse on both children.',
    code: `class Solution:
    def sumOfLeftLeaves(self, root) -> int:
        if not root:
            return 0
        total = 0
        if root.left and not root.left.left and not root.left.right:
            total += root.left.val
        else:
            total += self.sumOfLeftLeaves(root.left)
        total += self.sumOfLeftLeaves(root.right)
        return total`,
    jsCode: `var sumOfLeftLeaves = function(root) {
    if (!root) return 0;
    let total = 0;
    if (root.left && !root.left.left && !root.left.right) {
        total += root.left.val;
    } else {
        total += sumOfLeftLeaves(root.left);
    }
    total += sumOfLeftLeaves(root.right);
    return total;
};`,
    explanation:
      '1. If root is null, return 0.\n' +
      '2. Check if root.left is a leaf (both children null).\n' +
      '3. If yes, add its value. If no, recurse on left subtree.\n' +
      '4. Always recurse on right subtree.\n' +
      '5. Sum up all left leaf values.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'A left leaf is a left child with no children.',
      'Check the leaf condition from the parent node.',
      'Recurse on both subtrees, summing left leaf values.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 406. Queue Reconstruction by Height
  // ---------------------------------------------------------------------------
  {
    id: 406,
    description:
      'You have a queue of people described by (h, k) where h is height and k is the number of people in front who have height >= h. Reconstruct the queue from the shuffled input.',
    examples:
      'Input: people = [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]\nOutput: [[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]',
    approach:
      'Sort by height descending, then by k ascending. Insert each person at index k in the result list. Taller people are placed first, so shorter people inserted later do not affect their k values.',
    code: `class Solution:
    def reconstructQueue(self, people: list[list[int]]) -> list[list[int]]:
        people.sort(key=lambda x: (-x[0], x[1]))
        result = []
        for p in people:
            result.insert(p[1], p)
        return result`,
    jsCode: `var reconstructQueue = function(people) {
    people.sort((a, b) => a[0] === b[0] ? a[1] - b[1] : b[0] - a[0]);
    const result = [];
    for (const p of people) {
        result.splice(p[1], 0, p);
    }
    return result;
};`,
    explanation:
      '1. Sort people by height descending, k ascending.\n' +
      '2. Insert each person at position k in the result list.\n' +
      '3. Taller people are already in place; shorter people do not affect their counts.\n' +
      '4. The insert operation places each person correctly.',
    timeComplexity: 'O(n^2) due to list insertions',
    spaceComplexity: 'O(n)',
    hints: [
      'Process taller people first so they are placed before shorter ones.',
      'Sort by height descending; for ties, sort by k ascending.',
      'Insert at index k: shorter people inserted later shift without affecting taller ones.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 407. Trapping Rain Water II
  // ---------------------------------------------------------------------------
  {
    id: 407,
    description:
      'Given an m x n integer matrix heightMap representing the height of each cell, compute how much water can be trapped after raining in 3D.',
    examples:
      'Input: heightMap = [[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]]\nOutput: 4',
    approach:
      'Use a min-heap with all boundary cells. Process cells from lowest to highest. For each neighbor, water trapped = max(0, current_water_level - neighbor_height). Push the neighbor with max(water_level, neighbor_height).',
    code: `import heapq

class Solution:
    def trapRainWater(self, heightMap: list[list[int]]) -> int:
        if not heightMap or len(heightMap) < 3 or len(heightMap[0]) < 3:
            return 0
        m, n = len(heightMap), len(heightMap[0])
        visited = [[False]*n for _ in range(m)]
        heap = []
        for i in range(m):
            for j in range(n):
                if i == 0 or i == m-1 or j == 0 or j == n-1:
                    heapq.heappush(heap, (heightMap[i][j], i, j))
                    visited[i][j] = True
        water = 0
        while heap:
            h, r, c = heapq.heappop(heap)
            for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                nr, nc = r+dr, c+dc
                if 0 <= nr < m and 0 <= nc < n and not visited[nr][nc]:
                    visited[nr][nc] = True
                    water += max(0, h - heightMap[nr][nc])
                    heapq.heappush(heap, (max(h, heightMap[nr][nc]), nr, nc))
        return water`,
    jsCode: `var trapRainWater = function(heightMap) {
    if (!heightMap.length || heightMap.length < 3 || heightMap[0].length < 3) return 0;
    const m = heightMap.length, n = heightMap[0].length;
    const visited = Array.from({length: m}, () => new Array(n).fill(false));
    // Simple min-heap using sorted array
    const heap = [];
    const push = (item) => { heap.push(item); heap.sort((a, b) => a[0] - b[0]); };
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (i === 0 || i === m - 1 || j === 0 || j === n - 1) {
                push([heightMap[i][j], i, j]);
                visited[i][j] = true;
            }
        }
    }
    let water = 0;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    while (heap.length) {
        const [h, r, c] = heap.shift();
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited[nr][nc]) {
                visited[nr][nc] = true;
                water += Math.max(0, h - heightMap[nr][nc]);
                push([Math.max(h, heightMap[nr][nc]), nr, nc]);
            }
        }
    }
    return water;
};`,
    explanation:
      '1. Add all boundary cells to a min-heap and mark visited.\n' +
      '2. Process cells from lowest height first.\n' +
      '3. For each unvisited neighbor, water above it = max(0, current_level - neighbor_height).\n' +
      '4. Push the neighbor with effective height = max(current_level, neighbor_height).\n' +
      '5. The heap ensures we always expand from the lowest boundary.',
    timeComplexity: 'O(m * n * log(m * n))',
    spaceComplexity: 'O(m * n)',
    hints: [
      'This extends 1D trapping water to 2D using a min-heap.',
      'Start from the boundary (lowest walls) and work inward.',
      'Water level at any cell is determined by the lowest path from the boundary.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 408. Valid Word Abbreviation
  // ---------------------------------------------------------------------------
  {
    id: 408,
    description:
      'Given a non-empty string word and an abbreviation abbr, return whether the abbreviation matches the given word. A number in the abbreviation represents that many characters being skipped. Numbers cannot have leading zeros.',
    examples:
      'Input: word = "internationalization", abbr = "i12iz4n"\nOutput: true',
    approach:
      'Use two pointers, one for word and one for abbr. When a digit is found in abbr, parse the full number and advance the word pointer by that amount. Check for leading zeros.',
    code: `class Solution:
    def validWordAbbreviation(self, word: str, abbr: str) -> bool:
        i, j = 0, 0
        while i < len(word) and j < len(abbr):
            if abbr[j].isdigit():
                if abbr[j] == '0':
                    return False
                num = 0
                while j < len(abbr) and abbr[j].isdigit():
                    num = num * 10 + int(abbr[j])
                    j += 1
                i += num
            else:
                if word[i] != abbr[j]:
                    return False
                i += 1
                j += 1
        return i == len(word) and j == len(abbr)`,
    jsCode: `var validWordAbbreviation = function(word, abbr) {
    let i = 0, j = 0;
    while (i < word.length && j < abbr.length) {
        if (abbr[j] >= '0' && abbr[j] <= '9') {
            if (abbr[j] === '0') return false;
            let num = 0;
            while (j < abbr.length && abbr[j] >= '0' && abbr[j] <= '9') {
                num = num * 10 + parseInt(abbr[j]);
                j++;
            }
            i += num;
        } else {
            if (word[i] !== abbr[j]) return false;
            i++;
            j++;
        }
    }
    return i === word.length && j === abbr.length;
};`,
    explanation:
      '1. Two pointers i (word) and j (abbr).\n' +
      '2. If abbr[j] is a digit, parse the full number (no leading zeros).\n' +
      '3. Skip that many characters in word.\n' +
      '4. If abbr[j] is a letter, it must match word[i].\n' +
      '5. Both pointers must reach the end simultaneously.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Use two pointers to walk through word and abbr simultaneously.',
      'Parse multi-digit numbers carefully.',
      'Reject numbers with leading zeros.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 409. Longest Palindrome
  // ---------------------------------------------------------------------------
  {
    id: 409,
    description:
      'Given a string s of lowercase and uppercase English letters, return the length of the longest palindrome that can be built with those letters. Letters are case-sensitive.',
    examples:
      'Input: s = "abccccdd"\nOutput: 7\nExplanation: "dccaccd" is one possible palindrome.',
    approach:
      'Count character frequencies. Each character contributes its count rounded down to the nearest even number. If any character has an odd count, add 1 for the center.',
    code: `class Solution:
    def longestPalindrome(self, s: str) -> int:
        from collections import Counter
        counts = Counter(s)
        length = 0
        odd_found = False
        for c in counts.values():
            length += c // 2 * 2
            if c % 2 == 1:
                odd_found = True
        return length + (1 if odd_found else 0)`,
    jsCode: `var longestPalindrome = function(s) {
    const counts = new Map();
    for (const c of s) counts.set(c, (counts.get(c) || 0) + 1);
    let length = 0;
    let oddFound = false;
    for (const c of counts.values()) {
        length += Math.floor(c / 2) * 2;
        if (c % 2 === 1) oddFound = true;
    }
    return length + (oddFound ? 1 : 0);
};`,
    explanation:
      '1. Count character frequencies.\n' +
      '2. For each character, add its even part (c // 2 * 2) to the length.\n' +
      '3. If any character has an odd count, we can place one in the center.\n' +
      '4. Add 1 if there is at least one odd-count character.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'In a palindrome, all characters except possibly one must appear an even number of times.',
      'Use each character pair to contribute 2 to the length.',
      'One odd character can go in the center.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 412. Fizz Buzz
  // ---------------------------------------------------------------------------
  {
    id: 412,
    description:
      'Given an integer n, return a string array answer where: answer[i] = "FizzBuzz" if i is divisible by 3 and 5, "Fizz" if divisible by 3, "Buzz" if divisible by 5, or the string of i otherwise. Indices are 1-based.',
    examples:
      'Input: n = 5\nOutput: ["1","2","Fizz","4","Buzz"]',
    approach:
      'Iterate from 1 to n. Check divisibility by 15, 3, and 5 in that order. Append the appropriate string.',
    code: `class Solution:
    def fizzBuzz(self, n: int) -> list[str]:
        result = []
        for i in range(1, n + 1):
            if i % 15 == 0:
                result.append("FizzBuzz")
            elif i % 3 == 0:
                result.append("Fizz")
            elif i % 5 == 0:
                result.append("Buzz")
            else:
                result.append(str(i))
        return result`,
    jsCode: `var fizzBuzz = function(n) {
    const result = [];
    for (let i = 1; i <= n; i++) {
        if (i % 15 === 0) result.push("FizzBuzz");
        else if (i % 3 === 0) result.push("Fizz");
        else if (i % 5 === 0) result.push("Buzz");
        else result.push(String(i));
    }
    return result;
};`,
    explanation:
      '1. Iterate from 1 to n.\n' +
      '2. Check divisibility by 15 first (both 3 and 5).\n' +
      '3. Then check 3, then 5.\n' +
      '4. Default: convert the number to a string.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Check divisibility by 15 before checking 3 and 5 separately.',
      'Order of checks matters to handle the combined case first.',
      'A string concatenation approach can handle more complex rules.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 413. Arithmetic Slices
  // ---------------------------------------------------------------------------
  {
    id: 413,
    description:
      'Given an integer array nums, return the number of arithmetic subarrays. An arithmetic subarray has at least 3 elements and a constant difference between consecutive elements.',
    examples:
      'Input: nums = [1,2,3,4]\nOutput: 3\nExplanation: [1,2,3], [2,3,4], [1,2,3,4].',
    approach:
      'Track the current length of the arithmetic sequence. When the difference matches, increment the count. Each extension of length adds (length - 2) new subarrays.',
    code: `class Solution:
    def numberOfArithmeticSlices(self, nums: list[int]) -> int:
        total = 0
        curr = 0
        for i in range(2, len(nums)):
            if nums[i] - nums[i-1] == nums[i-1] - nums[i-2]:
                curr += 1
                total += curr
            else:
                curr = 0
        return total`,
    jsCode: `var numberOfArithmeticSlices = function(nums) {
    let total = 0, curr = 0;
    for (let i = 2; i < nums.length; i++) {
        if (nums[i] - nums[i - 1] === nums[i - 1] - nums[i - 2]) {
            curr++;
            total += curr;
        } else {
            curr = 0;
        }
    }
    return total;
};`,
    explanation:
      '1. curr tracks how many new arithmetic subarrays end at the current position.\n' +
      '2. If the difference is consistent, increment curr (one more subarray of each length).\n' +
      '3. Add curr to total.\n' +
      '4. Reset curr when the difference breaks.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Each extension of an arithmetic sequence adds new subarrays.',
      'If the last 3 elements form an arithmetic sequence, one new subarray is added.',
      'Track a running count of new subarrays created at each position.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 415. Add Strings
  // ---------------------------------------------------------------------------
  {
    id: 415,
    description:
      'Given two non-negative integers num1 and num2 represented as strings, return their sum as a string. You must not use any built-in library for handling large integers or convert inputs to integers directly.',
    examples:
      'Input: num1 = "11", num2 = "123"\nOutput: "134"',
    approach:
      'Simulate grade-school addition from right to left. Use a carry variable. Process digits from both strings simultaneously, handling different lengths.',
    code: `class Solution:
    def addStrings(self, num1: str, num2: str) -> str:
        i, j = len(num1) - 1, len(num2) - 1
        carry = 0
        result = []
        while i >= 0 or j >= 0 or carry:
            d1 = int(num1[i]) if i >= 0 else 0
            d2 = int(num2[j]) if j >= 0 else 0
            total = d1 + d2 + carry
            result.append(str(total % 10))
            carry = total // 10
            i -= 1
            j -= 1
        return ''.join(reversed(result))`,
    jsCode: `var addStrings = function(num1, num2) {
    let i = num1.length - 1, j = num2.length - 1;
    let carry = 0;
    const result = [];
    while (i >= 0 || j >= 0 || carry) {
        const d1 = i >= 0 ? parseInt(num1[i]) : 0;
        const d2 = j >= 0 ? parseInt(num2[j]) : 0;
        const total = d1 + d2 + carry;
        result.push(String(total % 10));
        carry = Math.floor(total / 10);
        i--;
        j--;
    }
    return result.reverse().join('');
};`,
    explanation:
      '1. Start from the rightmost digits of both strings.\n' +
      '2. Add corresponding digits plus carry.\n' +
      '3. Append the last digit (total % 10) and update carry (total // 10).\n' +
      '4. Continue until both strings are exhausted and carry is 0.\n' +
      '5. Reverse the result list to get the final answer.',
    timeComplexity: 'O(max(m, n))',
    spaceComplexity: 'O(max(m, n))',
    hints: [
      'Simulate addition digit by digit from right to left.',
      'Handle different string lengths by treating missing digits as 0.',
      'Do not forget the final carry.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 421. Maximum XOR of Two Numbers in an Array
  // ---------------------------------------------------------------------------
  {
    id: 421,
    description:
      'Given an integer array nums, return the maximum result of nums[i] XOR nums[j] where 0 <= i <= j < n.',
    examples:
      'Input: nums = [3,10,5,25,2,8]\nOutput: 28\nExplanation: 5 XOR 25 = 28.',
    approach:
      'Build a binary trie of all numbers. For each number, traverse the trie greedily choosing the opposite bit at each level to maximize XOR.',
    code: `class Solution:
    def findMaximumXOR(self, nums: list[int]) -> int:
        root = {}
        max_xor = 0
        for num in nums:
            node = root
            for i in range(31, -1, -1):
                bit = (num >> i) & 1
                if bit not in node:
                    node[bit] = {}
                node = node[bit]
        for num in nums:
            node = root
            curr_xor = 0
            for i in range(31, -1, -1):
                bit = (num >> i) & 1
                toggled = 1 - bit
                if toggled in node:
                    curr_xor |= (1 << i)
                    node = node[toggled]
                else:
                    node = node[bit]
            max_xor = max(max_xor, curr_xor)
        return max_xor`,
    jsCode: `var findMaximumXOR = function(nums) {
    const root = {};
    for (const num of nums) {
        let node = root;
        for (let i = 31; i >= 0; i--) {
            const bit = (num >> i) & 1;
            if (!node[bit]) node[bit] = {};
            node = node[bit];
        }
    }
    let maxXor = 0;
    for (const num of nums) {
        let node = root;
        let currXor = 0;
        for (let i = 31; i >= 0; i--) {
            const bit = (num >> i) & 1;
            const toggled = 1 - bit;
            if (node[toggled]) {
                currXor |= (1 << i);
                node = node[toggled];
            } else {
                node = node[bit];
            }
        }
        maxXor = Math.max(maxXor, currXor);
    }
    return maxXor;
};`,
    explanation:
      '1. Build a trie where each level represents a bit (from MSB to LSB).\n' +
      '2. For each number, traverse the trie choosing the opposite bit when possible.\n' +
      '3. Choosing the opposite bit sets that XOR bit to 1, maximizing the result.\n' +
      '4. Track the maximum XOR across all numbers.',
    timeComplexity: 'O(n * 32) = O(n)',
    spaceComplexity: 'O(n * 32)',
    hints: [
      'A trie on bits lets you greedily maximize XOR.',
      'For each bit, prefer the opposite bit to set XOR bit to 1.',
      'Process from the most significant bit to least significant.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 425. Word Squares
  // ---------------------------------------------------------------------------
  {
    id: 425,
    description:
      'Given an array of unique strings words, return all word squares you can build. A word square is a sequence of words where the kth row and kth column read the same string.',
    examples:
      'Input: words = ["area","lead","wall","lady","ball"]\nOutput: [["wall","area","lead","lady"],["ball","area","lead","lady"]]',
    approach:
      'Use backtracking with a prefix map (trie). After placing k words, the prefix for the next word is determined by the kth column of all placed words. Look up all words with that prefix.',
    code: `class Solution:
    def wordSquares(self, words: list[str]) -> list[list[str]]:
        from collections import defaultdict
        n = len(words[0])
        prefix_map = defaultdict(list)
        for w in words:
            for i in range(n):
                prefix_map[w[:i]].append(w)
        result = []
        def backtrack(square):
            if len(square) == n:
                result.append(square[:])
                return
            idx = len(square)
            prefix = ''.join(w[idx] for w in square)
            for w in prefix_map.get(prefix, []):
                square.append(w)
                backtrack(square)
                square.pop()
        for w in words:
            backtrack([w])
        return result`,
    jsCode: `var wordSquares = function(words) {
    const n = words[0].length;
    const prefixMap = new Map();
    for (const w of words) {
        for (let i = 0; i <= n; i++) {
            const prefix = w.substring(0, i);
            if (!prefixMap.has(prefix)) prefixMap.set(prefix, []);
            prefixMap.get(prefix).push(w);
        }
    }
    const result = [];
    const backtrack = (square) => {
        if (square.length === n) {
            result.push([...square]);
            return;
        }
        const idx = square.length;
        const prefix = square.map(w => w[idx]).join('');
        for (const w of (prefixMap.get(prefix) || [])) {
            square.push(w);
            backtrack(square);
            square.pop();
        }
    };
    for (const w of words) {
        backtrack([w]);
    }
    return result;
};`,
    explanation:
      '1. Build a prefix map: prefix -> list of words with that prefix.\n' +
      '2. Start backtracking with each word as the first row.\n' +
      '3. For the kth row, the required prefix is the kth character of all placed words.\n' +
      '4. Try all words matching that prefix.\n' +
      '5. If n words are placed, we have a valid word square.',
    timeComplexity: 'O(n * 26^n) worst case, much better with pruning',
    spaceComplexity: 'O(n * L) where L is total word characters',
    hints: [
      'In a word square, row k = column k, which constrains subsequent words.',
      'After placing k words, the prefix for word k+1 is determined.',
      'Use a prefix map for efficient lookup of candidate words.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 426. Convert Binary Search Tree to Sorted Doubly Linked List
  // ---------------------------------------------------------------------------
  {
    id: 426,
    description:
      'Convert a BST to a sorted circular doubly linked list in-place. The left and right pointers of tree nodes become prev and next pointers. The list should be circular with the head connected to the tail.',
    examples:
      'Input: root = [4,2,5,1,3]\nOutput: circular doubly linked list [1,2,3,4,5]',
    approach:
      'Perform in-order traversal. Track the previous node and the head. Link previous.right = current and current.left = previous. After traversal, connect head and tail to make it circular.',
    code: `class Solution:
    def treeToDoublyList(self, root):
        if not root:
            return None
        self.first = None
        self.last = None
        def inorder(node):
            if not node:
                return
            inorder(node.left)
            if self.last:
                self.last.right = node
                node.left = self.last
            else:
                self.first = node
            self.last = node
            inorder(node.right)
        inorder(root)
        self.first.left = self.last
        self.last.right = self.first
        return self.first`,
    jsCode: `var treeToDoublyList = function(root) {
    if (!root) return null;
    let first = null, last = null;
    const inorder = (node) => {
        if (!node) return;
        inorder(node.left);
        if (last) {
            last.right = node;
            node.left = last;
        } else {
            first = node;
        }
        last = node;
        inorder(node.right);
    };
    inorder(root);
    first.left = last;
    last.right = first;
    return first;
};`,
    explanation:
      '1. In-order traversal visits nodes in sorted order.\n' +
      '2. Track first (head) and last (tail) pointers.\n' +
      '3. Link last.right = current and current.left = last.\n' +
      '4. After traversal, connect first.left = last and last.right = first for circularity.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) for recursion stack',
    hints: [
      'In-order traversal of a BST gives sorted order.',
      'Track the previously visited node to create links.',
      'After traversal, connect the head and tail for the circular structure.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 427. Construct Quad-Tree
  // ---------------------------------------------------------------------------
  {
    id: 427,
    description:
      'Given an n x n grid of 0s and 1s, construct a Quad-Tree representation. If all values in a region are the same, it is a leaf. Otherwise, divide into four quadrants and recurse.',
    examples:
      'Input: grid = [[0,1],[1,0]]\nOutput: a Quad-Tree with four leaf children',
    approach:
      'Recursively check if all values in the current region are the same. If yes, create a leaf node. Otherwise, divide into four quadrants and recurse.',
    code: `class Solution:
    def construct(self, grid: list[list[int]]):
        def build(r, c, size):
            if size == 1:
                return Node(grid[r][c] == 1, True)
            half = size // 2
            tl = build(r, c, half)
            tr = build(r, c + half, half)
            bl = build(r + half, c, half)
            br = build(r + half, c + half, half)
            if tl.isLeaf and tr.isLeaf and bl.isLeaf and br.isLeaf and \\
               tl.val == tr.val == bl.val == br.val:
                return Node(tl.val, True)
            return Node(True, False, tl, tr, bl, br)
        return build(0, 0, len(grid))`,
    jsCode: `var construct = function(grid) {
    const build = (r, c, size) => {
        if (size === 1) {
            return new Node(grid[r][c] === 1, true);
        }
        const half = Math.floor(size / 2);
        const tl = build(r, c, half);
        const tr = build(r, c + half, half);
        const bl = build(r + half, c, half);
        const br = build(r + half, c + half, half);
        if (tl.isLeaf && tr.isLeaf && bl.isLeaf && br.isLeaf &&
            tl.val === tr.val && tr.val === bl.val && bl.val === br.val) {
            return new Node(tl.val, true);
        }
        return new Node(true, false, tl, tr, bl, br);
    };
    return build(0, 0, grid.length);
};`,
    explanation:
      '1. Base case: size 1, create a leaf with the cell value.\n' +
      '2. Recursively build four quadrant nodes.\n' +
      '3. If all four are leaves with the same value, merge into a single leaf.\n' +
      '4. Otherwise, create an internal node with four children.',
    timeComplexity: 'O(n^2 log n)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Divide the grid into four equal quadrants recursively.',
      'If all cells in a quadrant have the same value, it is a leaf.',
      'Merge four identical leaves into one.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 429. N-ary Tree Level Order Traversal
  // ---------------------------------------------------------------------------
  {
    id: 429,
    description:
      'Given an n-ary tree, return the level order traversal of its nodes\' values (i.e., from left to right, level by level).',
    examples:
      'Input: root = [1,null,3,2,4,null,5,6]\nOutput: [[1],[3,2,4],[5,6]]',
    approach:
      'Use BFS with a queue. Process nodes level by level, adding all children to the next level.',
    code: `class Solution:
    def levelOrder(self, root) -> list[list[int]]:
        if not root:
            return []
        from collections import deque
        result = []
        queue = deque([root])
        while queue:
            level = []
            for _ in range(len(queue)):
                node = queue.popleft()
                level.append(node.val)
                for child in node.children:
                    queue.append(child)
            result.append(level)
        return result`,
    jsCode: `var levelOrder = function(root) {
    if (!root) return [];
    const result = [];
    const queue = [root];
    while (queue.length) {
        const level = [];
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            level.push(node.val);
            for (const child of node.children) {
                queue.push(child);
            }
        }
        result.push(level);
    }
    return result;
};`,
    explanation:
      '1. BFS with a queue, starting from the root.\n' +
      '2. Process all nodes at the current level.\n' +
      '3. Add all children of each node to the queue.\n' +
      '4. Collect values level by level.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Standard BFS level-order traversal.',
      'Process all nodes at the current level before moving to the next.',
      'N-ary trees have multiple children per node.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 430. Flatten a Multilevel Doubly Linked List
  // ---------------------------------------------------------------------------
  {
    id: 430,
    description:
      'Given the head of a multilevel doubly linked list where nodes may have a child pointer to a separate doubly linked list, flatten all levels into a single-level doubly linked list. Child lists are inserted between the node and its next node.',
    examples:
      'Input: head = [1,2,3,4,5,6,null,null,null,7,8,9,10,null,null,11,12]\nOutput: [1,2,3,7,8,11,12,9,10,4,5,6]',
    approach:
      'Iterate through the list. When a node has a child, save the next pointer, connect the child list in place, traverse to the end of the child list, and reconnect to the saved next. Set child to null.',
    code: `class Solution:
    def flatten(self, head):
        curr = head
        while curr:
            if curr.child:
                child = curr.child
                next_node = curr.next
                curr.next = child
                child.prev = curr
                curr.child = None
                tail = child
                while tail.next:
                    tail = tail.next
                tail.next = next_node
                if next_node:
                    next_node.prev = tail
            curr = curr.next
        return head`,
    jsCode: `var flatten = function(head) {
    let curr = head;
    while (curr) {
        if (curr.child) {
            const child = curr.child;
            const nextNode = curr.next;
            curr.next = child;
            child.prev = curr;
            curr.child = null;
            let tail = child;
            while (tail.next) tail = tail.next;
            tail.next = nextNode;
            if (nextNode) nextNode.prev = tail;
        }
        curr = curr.next;
    }
    return head;
};`,
    explanation:
      '1. Traverse the main list.\n' +
      '2. When a child is found, splice the child list after the current node.\n' +
      '3. Find the tail of the child list.\n' +
      '4. Connect the tail to the saved next node.\n' +
      '5. Set child to None and continue.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'When encountering a child, insert the child list between current and next.',
      'Find the tail of the child list to reconnect to the original next.',
      'Clear the child pointer after flattening.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 432. All O`one Data Structure
  // ---------------------------------------------------------------------------
  {
    id: 432,
    description:
      'Design a data structure to store counts of strings, with O(1) operations for: inc(key), dec(key), getMaxKey(), and getMinKey().',
    examples:
      'Input: inc("hello"), inc("hello"), getMaxKey() = "hello", getMinKey() = "hello"',
    approach:
      'Use a doubly linked list of buckets (each bucket holds all keys with the same count) and a hash map from key to its bucket. Inc/dec moves keys between adjacent buckets. Min/max are the head/tail of the list.',
    code: `class Node:
    def __init__(self, count=0):
        self.count = count
        self.keys = set()
        self.prev = None
        self.next = None

class AllOne:
    def __init__(self):
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head
        self.key_node = {}

    def _insert_after(self, prev_node, count):
        node = Node(count)
        node.prev = prev_node
        node.next = prev_node.next
        prev_node.next.prev = node
        prev_node.next = node
        return node

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def inc(self, key: str) -> None:
        if key in self.key_node:
            node = self.key_node[key]
            new_count = node.count + 1
            if node.next.count != new_count:
                new_node = self._insert_after(node, new_count)
            else:
                new_node = node.next
            new_node.keys.add(key)
            self.key_node[key] = new_node
            node.keys.remove(key)
            if not node.keys:
                self._remove(node)
        else:
            if self.head.next.count != 1:
                new_node = self._insert_after(self.head, 1)
            else:
                new_node = self.head.next
            new_node.keys.add(key)
            self.key_node[key] = new_node

    def dec(self, key: str) -> None:
        node = self.key_node[key]
        new_count = node.count - 1
        if new_count == 0:
            del self.key_node[key]
        else:
            if node.prev.count != new_count:
                new_node = self._insert_after(node.prev, new_count)
            else:
                new_node = node.prev
            new_node.keys.add(key)
            self.key_node[key] = new_node
        node.keys.remove(key)
        if not node.keys:
            self._remove(node)

    def getMaxKey(self) -> str:
        if self.tail.prev == self.head:
            return ""
        return next(iter(self.tail.prev.keys))

    def getMinKey(self) -> str:
        if self.head.next == self.tail:
            return ""
        return next(iter(self.head.next.keys))`,
    jsCode: `var AllOne = function() {
    this.head = { count: 0, keys: new Set(), prev: null, next: null };
    this.tail = { count: 0, keys: new Set(), prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.keyNode = new Map();
};

AllOne.prototype._insertAfter = function(prevNode, count) {
    const node = { count, keys: new Set(), prev: prevNode, next: prevNode.next };
    prevNode.next.prev = node;
    prevNode.next = node;
    return node;
};

AllOne.prototype._remove = function(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
};

AllOne.prototype.inc = function(key) {
    if (this.keyNode.has(key)) {
        const node = this.keyNode.get(key);
        const newCount = node.count + 1;
        const newNode = node.next.count === newCount ? node.next : this._insertAfter(node, newCount);
        newNode.keys.add(key);
        this.keyNode.set(key, newNode);
        node.keys.delete(key);
        if (node.keys.size === 0) this._remove(node);
    } else {
        const newNode = this.head.next.count === 1 ? this.head.next : this._insertAfter(this.head, 1);
        newNode.keys.add(key);
        this.keyNode.set(key, newNode);
    }
};

AllOne.prototype.dec = function(key) {
    const node = this.keyNode.get(key);
    const newCount = node.count - 1;
    if (newCount === 0) {
        this.keyNode.delete(key);
    } else {
        const newNode = node.prev.count === newCount ? node.prev : this._insertAfter(node.prev, newCount);
        newNode.keys.add(key);
        this.keyNode.set(key, newNode);
    }
    node.keys.delete(key);
    if (node.keys.size === 0) this._remove(node);
};

AllOne.prototype.getMaxKey = function() {
    if (this.tail.prev === this.head) return "";
    return this.tail.prev.keys.values().next().value;
};

AllOne.prototype.getMinKey = function() {
    if (this.head.next === this.tail) return "";
    return this.head.next.keys.values().next().value;
};`,
    explanation:
      '1. Doubly linked list of count buckets, ordered by count.\n' +
      '2. Each bucket holds a set of keys with that count.\n' +
      '3. inc: move key to the next bucket (count+1), creating it if needed.\n' +
      '4. dec: move key to the previous bucket (count-1) or remove if count becomes 0.\n' +
      '5. getMin/getMax: return any key from the first/last non-sentinel bucket.',
    timeComplexity: 'O(1) for all operations',
    spaceComplexity: 'O(n)',
    hints: [
      'A doubly linked list of buckets ordered by count enables O(1) min/max.',
      'Keys move between adjacent buckets on inc/dec.',
      'Remove empty buckets to keep the list compact.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 433. Minimum Genetic Mutation
  // ---------------------------------------------------------------------------
  {
    id: 433,
    description:
      'A gene string is an 8-character string of A, C, G, T. Given a startGene, endGene, and a bank of valid gene strings, return the minimum number of mutations to go from start to end. Each mutation changes one character. Every intermediate gene must be in the bank.',
    examples:
      'Input: startGene = "AACCGGTT", endGene = "AAACGGTA", bank = ["AACCGGTA","AACCGCTA","AAACGGTA"]\nOutput: 2',
    approach:
      'Use BFS. From each gene, try all single-character mutations (to A, C, G, T). If the resulting gene is in the bank and not visited, add it to the queue.',
    code: `class Solution:
    def minMutation(self, startGene: str, endGene: str, bank: list[str]) -> int:
        from collections import deque
        bank_set = set(bank)
        if endGene not in bank_set:
            return -1
        queue = deque([(startGene, 0)])
        visited = {startGene}
        while queue:
            gene, steps = queue.popleft()
            if gene == endGene:
                return steps
            for i in range(8):
                for c in 'ACGT':
                    if c != gene[i]:
                        mutated = gene[:i] + c + gene[i+1:]
                        if mutated in bank_set and mutated not in visited:
                            visited.add(mutated)
                            queue.append((mutated, steps + 1))
        return -1`,
    jsCode: `var minMutation = function(startGene, endGene, bank) {
    const bankSet = new Set(bank);
    if (!bankSet.has(endGene)) return -1;
    const queue = [[startGene, 0]];
    const visited = new Set([startGene]);
    while (queue.length) {
        const [gene, steps] = queue.shift();
        if (gene === endGene) return steps;
        for (let i = 0; i < 8; i++) {
            for (const c of 'ACGT') {
                if (c !== gene[i]) {
                    const mutated = gene.substring(0, i) + c + gene.substring(i + 1);
                    if (bankSet.has(mutated) && !visited.has(mutated)) {
                        visited.add(mutated);
                        queue.push([mutated, steps + 1]);
                    }
                }
            }
        }
    }
    return -1;
};`,
    explanation:
      '1. BFS from startGene.\n' +
      '2. Try all 8 * 3 = 24 possible single-character mutations.\n' +
      '3. If the mutated gene is in the bank and not visited, enqueue it.\n' +
      '4. Return the step count when endGene is reached.\n' +
      '5. Return -1 if the queue is exhausted.',
    timeComplexity: 'O(B * 8 * 4) where B is bank size',
    spaceComplexity: 'O(B)',
    hints: [
      'This is like Word Ladder but with gene strings.',
      'BFS finds the shortest path (minimum mutations).',
      'Try all possible single-character changes at each step.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 436. Find Right Interval
  // ---------------------------------------------------------------------------
  {
    id: 436,
    description:
      'Given a set of intervals, for each interval find the interval whose start point is the smallest value >= the current interval\'s end point. Return an array of indices. If no such interval exists, put -1.',
    examples:
      'Input: intervals = [[1,2],[2,3],[0,1],[3,4]]\nOutput: [1,3,0,-1]',
    approach:
      'Sort the intervals by start point while keeping track of original indices. For each interval, binary search for the smallest start >= its end.',
    code: `import bisect

class Solution:
    def findRightInterval(self, intervals: list[list[int]]) -> list[int]:
        sorted_starts = sorted((iv[0], i) for i, iv in enumerate(intervals))
        starts = [s for s, _ in sorted_starts]
        result = []
        for _, end in intervals:
            idx = bisect.bisect_left(starts, end)
            if idx < len(starts):
                result.append(sorted_starts[idx][1])
            else:
                result.append(-1)
        return result`,
    jsCode: `var findRightInterval = function(intervals) {
    const sortedStarts = intervals.map((iv, i) => [iv[0], i]).sort((a, b) => a[0] - b[0]);
    const starts = sortedStarts.map(s => s[0]);
    const result = [];
    for (const [, end] of intervals) {
        let lo = 0, hi = starts.length;
        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            if (starts[mid] < end) lo = mid + 1;
            else hi = mid;
        }
        result.push(lo < starts.length ? sortedStarts[lo][1] : -1);
    }
    return result;
};`,
    explanation:
      '1. Create a sorted list of (start, original_index) pairs.\n' +
      '2. For each interval, binary search for the smallest start >= end.\n' +
      '3. If found, return the original index. Otherwise, return -1.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Sort intervals by start and use binary search.',
      'For each interval, find the first start >= its end.',
      'Track original indices through the sorting.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 440. Kth Smallest in Lexicographical Order
  // ---------------------------------------------------------------------------
  {
    id: 440,
    description:
      'Given two integers n and k, return the kth lexicographically smallest integer in the range [1, n].',
    examples:
      'Input: n = 13, k = 2\nOutput: 10\nExplanation: Lexicographic order: [1,10,11,12,13,2,3,...]. 10 is the 2nd.',
    approach:
      'Think of numbers as a trie (prefix tree). Count the number of nodes in the subtree between two prefixes. If k falls within a subtree, go deeper. Otherwise, skip to the next sibling.',
    code: `class Solution:
    def findKthNumber(self, n: int, k: int) -> int:
        def count_steps(n, curr, next_val):
            steps = 0
            while curr <= n:
                steps += min(n + 1, next_val) - curr
                curr *= 10
                next_val *= 10
            return steps
        curr = 1
        k -= 1
        while k > 0:
            steps = count_steps(n, curr, curr + 1)
            if steps <= k:
                k -= steps
                curr += 1
            else:
                k -= 1
                curr *= 10
        return curr`,
    jsCode: `var findKthNumber = function(n, k) {
    const countSteps = (n, curr, next) => {
        let steps = 0;
        while (curr <= n) {
            steps += Math.min(n + 1, next) - curr;
            curr *= 10;
            next *= 10;
        }
        return steps;
    };
    let curr = 1;
    k--;
    while (k > 0) {
        const steps = countSteps(n, curr, curr + 1);
        if (steps <= k) {
            k -= steps;
            curr++;
        } else {
            k--;
            curr *= 10;
        }
    }
    return curr;
};`,
    explanation:
      '1. Start at curr=1, decrement k by 1 (we are at the 1st number).\n' +
      '2. Count how many numbers are in the subtree rooted at curr.\n' +
      '3. If k >= steps, skip the entire subtree (move to next sibling).\n' +
      '4. Otherwise, go deeper into the subtree (curr *= 10).\n' +
      '5. Continue until k reaches 0.',
    timeComplexity: 'O(log^2 n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Think of numbers arranged in a trie (prefix tree).',
      'Count the size of each subtree to decide whether to go deeper or skip.',
      'The counting function processes level by level in the trie.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 441. Arranging Coins
  // ---------------------------------------------------------------------------
  {
    id: 441,
    description:
      'You have n coins and want to build a staircase with k rows, where the ith row has i coins. Return the number of complete rows.',
    examples:
      'Input: n = 5\nOutput: 2\nExplanation: Row 1: 1 coin, Row 2: 2 coins, Row 3: incomplete (2 coins left).',
    approach:
      'Use binary search or the quadratic formula. k complete rows need k*(k+1)/2 coins. Find the largest k where k*(k+1)/2 <= n.',
    code: `class Solution:
    def arrangeCoins(self, n: int) -> int:
        lo, hi = 0, n
        while lo <= hi:
            mid = (lo + hi) // 2
            total = mid * (mid + 1) // 2
            if total == n:
                return mid
            elif total < n:
                lo = mid + 1
            else:
                hi = mid - 1
        return hi`,
    jsCode: `var arrangeCoins = function(n) {
    let lo = 0, hi = n;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const total = mid * (mid + 1) / 2;
        if (total === n) return mid;
        else if (total < n) lo = mid + 1;
        else hi = mid - 1;
    }
    return hi;
};`,
    explanation:
      '1. Binary search for k in [0, n].\n' +
      '2. Compute total coins needed for k rows: k*(k+1)/2.\n' +
      '3. If total == n, return k.\n' +
      '4. If total < n, search higher. If total > n, search lower.\n' +
      '5. Return hi (the largest valid k).',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'k rows need k*(k+1)/2 coins.',
      'Use binary search to find the largest k satisfying the constraint.',
      'Alternatively, solve the quadratic equation directly.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 442. Find All Duplicates in an Array
  // ---------------------------------------------------------------------------
  {
    id: 442,
    description:
      'Given an integer array nums of length n where all integers are in [1, n] and each integer appears once or twice, return an array of all integers that appear twice. Use O(1) extra space and O(n) time.',
    examples:
      'Input: nums = [4,3,2,7,8,2,3,1]\nOutput: [2,3]',
    approach:
      'Use the array itself as a hash map. For each number, negate the value at index |num|-1. If the value at that index is already negative, the number is a duplicate.',
    code: `class Solution:
    def findDuplicates(self, nums: list[int]) -> list[int]:
        result = []
        for num in nums:
            idx = abs(num) - 1
            if nums[idx] < 0:
                result.append(abs(num))
            else:
                nums[idx] = -nums[idx]
        return result`,
    jsCode: `var findDuplicates = function(nums) {
    const result = [];
    for (const num of nums) {
        const idx = Math.abs(num) - 1;
        if (nums[idx] < 0) {
            result.push(Math.abs(num));
        } else {
            nums[idx] = -nums[idx];
        }
    }
    return result;
};`,
    explanation:
      '1. For each number, use its absolute value - 1 as an index.\n' +
      '2. If the value at that index is already negative, the number was seen before.\n' +
      '3. Otherwise, negate the value at that index to mark it as seen.\n' +
      '4. This uses the sign of array values as visited flags.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Since values are in [1, n], each value maps to a unique index.',
      'Use the sign of the value at each index as a visited flag.',
      'If already negative when visited again, the number is a duplicate.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 443. String Compression
  // ---------------------------------------------------------------------------
  {
    id: 443,
    description:
      'Given an array of characters chars, compress it in-place. Groups of consecutive repeating characters should be replaced by the character followed by the count (if count > 1). Return the new length.',
    examples:
      'Input: chars = ["a","a","b","b","c","c","c"]\nOutput: 6 (chars = ["a","2","b","2","c","3"])',
    approach:
      'Use two pointers: a read pointer to traverse and a write pointer to overwrite. Count consecutive characters. Write the character and its count (if > 1) at the write position.',
    code: `class Solution:
    def compress(self, chars: list[str]) -> int:
        write = 0
        read = 0
        while read < len(chars):
            char = chars[read]
            count = 0
            while read < len(chars) and chars[read] == char:
                read += 1
                count += 1
            chars[write] = char
            write += 1
            if count > 1:
                for d in str(count):
                    chars[write] = d
                    write += 1
        return write`,
    jsCode: `var compress = function(chars) {
    let write = 0, read = 0;
    while (read < chars.length) {
        const char = chars[read];
        let count = 0;
        while (read < chars.length && chars[read] === char) {
            read++;
            count++;
        }
        chars[write++] = char;
        if (count > 1) {
            for (const d of String(count)) {
                chars[write++] = d;
            }
        }
    }
    return write;
};`,
    explanation:
      '1. Use read pointer to count consecutive identical characters.\n' +
      '2. Write the character at the write position.\n' +
      '3. If count > 1, write the count digits.\n' +
      '4. The write pointer gives the new length.\n' +
      '5. Everything is done in-place.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Two pointers: read to scan, write to overwrite.',
      'Count consecutive repeating characters.',
      'Write the count as individual digit characters if count > 1.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 445. Add Two Numbers II
  // ---------------------------------------------------------------------------
  {
    id: 445,
    description:
      'Given two non-empty linked lists representing two non-negative integers (most significant digit first), return the sum as a linked list. You may not modify the input lists.',
    examples:
      'Input: l1 = [7,2,4,3], l2 = [5,6,4]\nOutput: [7,8,0,7]',
    approach:
      'Use stacks to reverse the digit order. Pop from both stacks, add with carry, and build the result list from the least significant digit by prepending nodes.',
    code: `class Solution:
    def addTwoNumbers(self, l1, l2):
        s1, s2 = [], []
        while l1:
            s1.append(l1.val)
            l1 = l1.next
        while l2:
            s2.append(l2.val)
            l2 = l2.next
        carry = 0
        head = None
        while s1 or s2 or carry:
            total = carry
            if s1: total += s1.pop()
            if s2: total += s2.pop()
            carry = total // 10
            node = ListNode(total % 10)
            node.next = head
            head = node
        return head`,
    jsCode: `var addTwoNumbers = function(l1, l2) {
    const s1 = [], s2 = [];
    while (l1) { s1.push(l1.val); l1 = l1.next; }
    while (l2) { s2.push(l2.val); l2 = l2.next; }
    let carry = 0, head = null;
    while (s1.length || s2.length || carry) {
        let total = carry;
        if (s1.length) total += s1.pop();
        if (s2.length) total += s2.pop();
        carry = Math.floor(total / 10);
        const node = new ListNode(total % 10);
        node.next = head;
        head = node;
    }
    return head;
};`,
    explanation:
      '1. Push all digits onto two stacks.\n' +
      '2. Pop from both stacks to add from least significant digit.\n' +
      '3. Create new nodes and prepend them to build the result.\n' +
      '4. Handle carry until both stacks are empty and carry is 0.',
    timeComplexity: 'O(m + n)',
    spaceComplexity: 'O(m + n)',
    hints: [
      'Stacks reverse the digit order for addition.',
      'Build the result by prepending nodes (no reversal needed).',
      'Handle the carry even after both stacks are empty.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 449. Serialize and Deserialize BST
  // ---------------------------------------------------------------------------
  {
    id: 449,
    description:
      'Design an algorithm to serialize and deserialize a binary search tree. The encoded string should be as compact as possible. Serialization must preserve the BST structure.',
    examples:
      'Input: root = [2,1,3]\nOutput: "2,1,3" (preorder)',
    approach:
      'Use preorder traversal for serialization. For deserialization, use the BST property with bounds: recursively build the tree by checking if the next value falls within the valid range.',
    code: `class Codec:
    def serialize(self, root) -> str:
        vals = []
        def preorder(node):
            if node:
                vals.append(str(node.val))
                preorder(node.left)
                preorder(node.right)
        preorder(root)
        return ','.join(vals)

    def deserialize(self, data: str):
        if not data:
            return None
        vals = iter(data.split(','))
        def build(lo, hi):
            val = next(vals, None)
            if val is None:
                return None
            val = int(val)
            if val < lo or val > hi:
                return None
            node = TreeNode(val)
            node.left = build(lo, val)
            node.right = build(val, hi)
            return node
        # Use a list to allow "peeking"
        queue = list(map(int, data.split(',')))
        self.idx = 0
        def build2(lo, hi):
            if self.idx >= len(queue) or queue[self.idx] < lo or queue[self.idx] > hi:
                return None
            val = queue[self.idx]
            self.idx += 1
            node = TreeNode(val)
            node.left = build2(lo, val)
            node.right = build2(val, hi)
            return node
        return build2(float('-inf'), float('inf'))`,
    jsCode: `var serialize = function(root) {
    const vals = [];
    const preorder = (node) => {
        if (node) {
            vals.push(String(node.val));
            preorder(node.left);
            preorder(node.right);
        }
    };
    preorder(root);
    return vals.join(',');
};

var deserialize = function(data) {
    if (!data) return null;
    const queue = data.split(',').map(Number);
    let idx = 0;
    const build = (lo, hi) => {
        if (idx >= queue.length || queue[idx] < lo || queue[idx] > hi) return null;
        const val = queue[idx++];
        const node = new TreeNode(val);
        node.left = build(lo, val);
        node.right = build(val, hi);
        return node;
    };
    return build(-Infinity, Infinity);
};`,
    explanation:
      '1. Serialize: preorder traversal produces a compact representation.\n' +
      '2. Deserialize: use BST bounds to reconstruct.\n' +
      '3. Maintain an index pointer; if the next value is out of bounds, return None.\n' +
      '4. Recurse with updated bounds: left subtree < val, right subtree > val.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Preorder traversal of a BST uniquely defines the tree.',
      'Use bounds (min, max) during deserialization to place nodes correctly.',
      'No need for null markers since BST property provides the structure.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 451. Sort Characters By Frequency
  // ---------------------------------------------------------------------------
  {
    id: 451,
    description:
      'Given a string s, sort it in decreasing order based on the frequency of the characters. If multiple characters have the same frequency, their order does not matter.',
    examples:
      'Input: s = "tree"\nOutput: "eert"',
    approach:
      'Count character frequencies, sort by frequency descending, then build the result string by repeating each character by its count.',
    code: `class Solution:
    def frequencySort(self, s: str) -> str:
        from collections import Counter
        counts = Counter(s)
        sorted_chars = sorted(counts.keys(), key=lambda c: -counts[c])
        return ''.join(c * counts[c] for c in sorted_chars)`,
    jsCode: `var frequencySort = function(s) {
    const counts = new Map();
    for (const c of s) counts.set(c, (counts.get(c) || 0) + 1);
    const sortedChars = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a));
    return sortedChars.map(c => c.repeat(counts.get(c))).join('');
};`,
    explanation:
      '1. Count character frequencies.\n' +
      '2. Sort characters by frequency in descending order.\n' +
      '3. Build the result by repeating each character by its frequency.',
    timeComplexity: 'O(n + k log k) where k is distinct characters',
    spaceComplexity: 'O(n)',
    hints: [
      'Count frequencies, then sort by frequency.',
      'Use bucket sort for O(n) if needed.',
      'Build the output by repeating characters by their count.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 454. 4Sum II
  // ---------------------------------------------------------------------------
  {
    id: 454,
    description:
      'Given four integer arrays nums1, nums2, nums3, and nums4 of length n, return the number of tuples (i, j, k, l) such that nums1[i] + nums2[j] + nums3[k] + nums4[l] == 0.',
    examples:
      'Input: nums1 = [1,2], nums2 = [-2,-1], nums3 = [-1,2], nums4 = [0,2]\nOutput: 2',
    approach:
      'Compute all pairwise sums of nums1 and nums2, store in a hash map. Then for each pair from nums3 and nums4, check if the negation exists in the map.',
    code: `class Solution:
    def fourSumCount(self, nums1: list[int], nums2: list[int], nums3: list[int], nums4: list[int]) -> int:
        from collections import Counter
        ab_sums = Counter(a + b for a in nums1 for b in nums2)
        count = 0
        for c in nums3:
            for d in nums4:
                count += ab_sums.get(-(c + d), 0)
        return count`,
    jsCode: `var fourSumCount = function(nums1, nums2, nums3, nums4) {
    const abSums = new Map();
    for (const a of nums1) {
        for (const b of nums2) {
            const sum = a + b;
            abSums.set(sum, (abSums.get(sum) || 0) + 1);
        }
    }
    let count = 0;
    for (const c of nums3) {
        for (const d of nums4) {
            count += abSums.get(-(c + d)) || 0;
        }
    }
    return count;
};`,
    explanation:
      '1. Compute all sums of pairs from nums1 and nums2, store counts in a hash map.\n' +
      '2. For each pair (c, d) from nums3 and nums4, look up -(c+d) in the map.\n' +
      '3. Add the count to the result.\n' +
      '4. This reduces O(n^4) to O(n^2).',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Split into two groups of two arrays each.',
      'Hash all pairwise sums from the first two arrays.',
      'For each pair from the last two arrays, look up the complement.',
    ],
  },

];

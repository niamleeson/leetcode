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
    intuition:
      'The key insight is that every valid grouping has one operator evaluated last, which splits the expression into two independent halves. Think of it like choosing which operation is the \'final boss\' - once you pick it, you solve each side separately and combine all possible results.',
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
    // Base case: the expression is a plain number with no operators
    const isNumber = /^\\d+$/.test(expression);
    if (isNumber) {
        return [parseInt(expression)];
    }

    const results = [];

    // Try each character as the "last operator evaluated"
    for (let i = 0; i < expression.length; i++) {
        const ch = expression[i];
        const isOperator = ch === '+' || ch === '-' || ch === '*';

        if (isOperator) {
            // Split expression into left and right sub-expressions
            const leftExpr = expression.substring(0, i);
            const rightExpr = expression.substring(i + 1);

            // Recursively compute all possible results for each half
            const leftResults = diffWaysToCompute(leftExpr);
            const rightResults = diffWaysToCompute(rightExpr);

            // Combine every left result with every right result
            for (const leftVal of leftResults) {
                for (const rightVal of rightResults) {
                    if (ch === '+') {
                        results.push(leftVal + rightVal);
                    } else if (ch === '-') {
                        results.push(leftVal - rightVal);
                    } else {
                        results.push(leftVal * rightVal);
                    }
                }
            }
        }
    }

    return results;
};`,
    jsWalkthrough:
      'Example: expression = "2*3-4"\n' +
      'i=1, ch="*": left="2" → [2], right="3-4"\n' +
      '  right "3-4": i=1, ch="-": left=[3], right=[4] → [3-4] = [-1]\n' +
      '  Combine: 2 * -1 = -2\n' +
      'i=3, ch="-": left="2*3"\n' +
      '  left "2*3": i=1, ch="*": left=[2], right=[3] → [6]\n' +
      '  right="4" → [4]\n' +
      '  Combine: 6 - 4 = 2\n' +
      'Final results: [-2, 2]',
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
    intuition:
      'Strobogrammatic numbers are symmetric when rotated, so you can build them like a sandwich - start from the middle and wrap matching digit pairs around the outside. Only certain digit pairs (like 6 and 9) look the same when flipped, which limits your choices at each layer.',
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
    // Build numbers from the inside out
    // totalLen is needed to avoid leading zeros at the outermost layer
    const helper = (curLen, totalLen) => {
        // Base cases: empty center or single-character center
        if (curLen === 0) return [''];
        if (curLen === 1) return ['0', '1', '8'];

        // Recursively get all valid centers of length curLen - 2
        const middles = helper(curLen - 2, totalLen);

        const result = [];
        // Valid strobogrammatic digit pairs (left, right)
        const pairs = [['0','0'], ['1','1'], ['6','9'], ['8','8'], ['9','6']];

        for (const middle of middles) {
            for (const [leftDigit, rightDigit] of pairs) {
                // Skip leading zero only for the outermost layer
                const isOutermostLayer = curLen === totalLen;
                if (leftDigit === '0' && isOutermostLayer) continue;

                result.push(leftDigit + middle + rightDigit);
            }
        }

        return result;
    };

    return helper(n, n);
};`,
    jsWalkthrough:
      'Example: n = 2\n' +
      'helper(2, 2): middles = helper(0, 2) = [""]\n' +
      'pairs iteration (skip "0" since curLen === totalLen):\n' +
      '  ["1","1"] → "1" + "" + "1" = "11"\n' +
      '  ["6","9"] → "6" + "" + "9" = "69"\n' +
      '  ["8","8"] → "8" + "" + "8" = "88"\n' +
      '  ["9","6"] → "9" + "" + "6" = "96"\n' +
      'Result: ["11","69","88","96"]',
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
    intuition:
      'Imagine sliding all strings back so they start at \'a\'. Strings in the same shifting group would become identical after this normalization. The difference between consecutive characters (mod 26) captures this shift-invariant fingerprint.',
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
        // Compute the shift-invariant key: differences between consecutive chars mod 26
        const keyParts = [];
        for (let i = 1; i < s.length; i++) {
            // Add 26 before mod to handle negative differences (e.g., 'a' - 'z')
            const diff = ((s.charCodeAt(i) - s.charCodeAt(i - 1)) % 26 + 26) % 26;
            keyParts.push(diff);
        }
        const key = keyParts.join(',');

        // Group strings by their canonical key
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(s);
    }

    return Array.from(groups.values());
};`,
    jsWalkthrough:
      'Example: strings = ["abc","bcd","az","ba"]\n' +
      '"abc": diffs = [(b-a)=1, (c-b)=1] → key = "1,1"\n' +
      '"bcd": diffs = [(c-b)=1, (d-c)=1] → key = "1,1" (same group!)\n' +
      '"az":  diffs = [(z-a)=25] → key = "25"\n' +
      '"ba":  diffs = [(a-b+26)%26=25] → key = "25" (same group!)\n' +
      'groups: {"1,1": ["abc","bcd"], "25": ["az","ba"]}\n' +
      'Result: [["abc","bcd"],["az","ba"]]',
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
    intuition:
      'If you line up all meetings on a timeline sorted by start time, overlaps become obvious: a meeting overlaps with the previous one only if it starts before the previous one ends. Sorting turns a complex overlap problem into simple neighbor comparisons.',
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
    // Sort meetings by start time so overlaps appear as adjacent pairs
    intervals.sort((a, b) => a[0] - b[0]);

    // Check each consecutive pair for overlap
    for (let i = 1; i < intervals.length; i++) {
        const currentStart = intervals[i][0];
        const previousEnd = intervals[i - 1][1];

        // If this meeting starts before the previous one ends, there is a conflict
        if (currentStart < previousEnd) {
            return false;
        }
    }

    return true;
};`,
    jsWalkthrough:
      'Example: intervals = [[0,30],[5,10],[15,20]]\n' +
      'After sort: [[0,30],[5,10],[15,20]]\n' +
      'i=1: currentStart=5, previousEnd=30 → 5 < 30 → return false\n' +
      'Result: false (cannot attend all meetings)',
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
    intuition:
      'Imagine rooms as a pool of resources. When a new meeting starts, you check if the earliest-ending room is free. A min-heap of end times lets you instantly find the room that frees up soonest, like a hotel front desk tracking checkout times.',
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

    // Sort meetings by start time
    intervals.sort((a, b) => a[0] - b[0]);

    // Track end times of all currently occupied rooms (min-heap substitute)
    const roomEndTimes = [];

    for (const [start, end] of intervals) {
        // If the earliest-ending room is free before this meeting starts, reuse it
        const earliestEndingRoom = roomEndTimes[0];
        if (roomEndTimes.length > 0 && earliestEndingRoom <= start) {
            roomEndTimes.shift(); // free that room
        }

        // Assign this meeting to a room (reused or new)
        roomEndTimes.push(end);

        // Keep sorted so roomEndTimes[0] is always the earliest end time
        roomEndTimes.sort((a, b) => a - b);
    }

    // Number of rooms still in use = number of rooms needed
    return roomEndTimes.length;
};`,
    jsWalkthrough:
      'Example: intervals = [[0,30],[5,10],[15,20]]\n' +
      'After sort: [[0,30],[5,10],[15,20]]\n' +
      '[0,30]: roomEndTimes=[] → push 30 → [30]\n' +
      '[5,10]: ends[0]=30 > 5 → no reuse → push 10, sort → [10,30]\n' +
      '[15,20]: ends[0]=10 ≤ 15 → reuse → shift, push 20, sort → [20,30]\n' +
      'Result: 2 rooms needed',
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
    intuition:
      'This is a classic DP problem where each decision (paint color) constrains the next. Since no two adjacent houses can share a color, the cost of painting house i one color depends only on the minimum cost of the other two colors for house i-1. You only need to remember the previous row.',
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

    // Start with the costs of painting the first house each color
    let prevRed = costs[0][0];
    let prevBlue = costs[0][1];
    let prevGreen = costs[0][2];

    for (let i = 1; i < costs.length; i++) {
        // Each color must be different from the previous house's color
        const currRed   = costs[i][0] + Math.min(prevBlue, prevGreen);
        const currBlue  = costs[i][1] + Math.min(prevRed, prevGreen);
        const currGreen = costs[i][2] + Math.min(prevRed, prevBlue);

        // Move to next house
        prevRed   = currRed;
        prevBlue  = currBlue;
        prevGreen = currGreen;
    }

    return Math.min(prevRed, prevBlue, prevGreen);
};`,
    jsWalkthrough:
      'Example: costs = [[17,2,17],[16,16,5],[14,3,19]]\n' +
      'House 0: prevRed=17, prevBlue=2, prevGreen=17\n' +
      'House 1:\n' +
      '  currRed   = 16 + min(2,17) = 16+2 = 18\n' +
      '  currBlue  = 16 + min(17,17) = 16+17 = 33\n' +
      '  currGreen =  5 + min(17,2)  = 5+2  = 7\n' +
      '  prev: R=18, B=33, G=7\n' +
      'House 2:\n' +
      '  currRed   = 14 + min(33,7)  = 14+7 = 21\n' +
      '  currBlue  =  3 + min(18,7)  = 3+7  = 10\n' +
      '  currGreen = 19 + min(18,33) = 19+18 = 37\n' +
      'Result: min(21,10,37) = 10',
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
    intuition:
      'Think of each root-to-leaf path as a journey. DFS naturally explores one complete path at a time. By building the path string as you go deeper and recording it when you hit a leaf, you capture every possible journey through the tree.',
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

    const dfs = (node, currentPath) => {
        if (!node) return;

        // Add the current node's value to the path
        currentPath.push(String(node.val));

        // If this is a leaf node, record the complete path
        const isLeaf = !node.left && !node.right;
        if (isLeaf) {
            result.push(currentPath.join('->'));
        } else {
            // Continue DFS on both children
            dfs(node.left, currentPath);
            dfs(node.right, currentPath);
        }

        // Backtrack: remove this node before returning to parent
        currentPath.pop();
    };

    dfs(root, []);
    return result;
};`,
    jsWalkthrough:
      'Example: root = [1,2,3,null,5]\n' +
      'dfs(1, []): path=["1"]\n' +
      '  dfs(2, ["1"]): path=["1","2"]\n' +
      '    dfs(null) → return\n' +
      '    dfs(5, ["1","2"]): path=["1","2","5"] — leaf!\n' +
      '      result.push("1->2->5")\n' +
      '    pop → path=["1","2"], pop → path=["1"]\n' +
      '  dfs(3, ["1"]): path=["1","3"] — leaf!\n' +
      '    result.push("1->3")\n' +
      'Result: ["1->2->5","1->3"]',
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
    intuition:
      'The digital root follows a repeating pattern related to mod 9. Every number\'s digit sum cycles through 1-9 endlessly. The formula 1 + (num-1) % 9 captures this cycle directly, turning an iterative process into a single calculation.',
    approach:
      'Use the digital root formula. For any positive number, the digital root is 1 + (num - 1) % 9. This gives the result in O(1) without looping.',
    code: `class Solution:
    def addDigits(self, num: int) -> int:
        if num == 0:
            return 0
        return 1 + (num - 1) % 9`,
    jsCode: `var addDigits = function(num) {
    // Special case: 0 has digital root 0
    if (num === 0) return 0;

    // Digital root formula using mod 9
    // Works because repeatedly summing digits is equivalent to num mod 9,
    // except multiples of 9 should return 9 (not 0), so we shift by 1.
    const digitalRoot = 1 + (num - 1) % 9;
    return digitalRoot;
};`,
    jsWalkthrough:
      'Example: num = 38\n' +
      'Naive: 3+8=11, 1+1=2\n' +
      'Formula: 1 + (38-1) % 9 = 1 + 37 % 9 = 1 + 1 = 2\n\n' +
      'Example: num = 9\n' +
      'Formula: 1 + (9-1) % 9 = 1 + 8 % 9 = 1 + 8 = 9\n\n' +
      'Example: num = 18\n' +
      'Formula: 1 + (18-1) % 9 = 1 + 17 % 9 = 1 + 8 = 9\n' +
      'Naive: 1+8=9 ✓',
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
    intuition:
      'After sorting, fixing one element turns this into a two-pointer problem. The clever part is that when a triplet sum is below the target, ALL elements between the two pointers form valid triplets with the left pointer, so you can count them in bulk rather than one by one.',
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
    // Sort to enable two-pointer approach
    nums.sort((a, b) => a - b);

    let count = 0;

    // Fix the first element, then use two pointers for the remaining pair
    for (let i = 0; i < nums.length - 2; i++) {
        let left = i + 1;
        let right = nums.length - 1;

        while (left < right) {
            const tripleSum = nums[i] + nums[left] + nums[right];

            if (tripleSum < target) {
                // All pairs (left, left+1), (left, left+2), ..., (left, right) are valid
                // because array is sorted and right can shrink while still < target
                count += right - left;
                left++;
            } else {
                // Sum is too large; shrink from the right
                right--;
            }
        }
    }

    return count;
};`,
    jsWalkthrough:
      'Example: nums = [-2,0,1,3], target = 2\n' +
      'After sort: [-2,0,1,3]\n' +
      'i=0 (nums[0]=-2):\n' +
      '  left=1, right=3: -2+0+3=1 < 2 → count += 3-1=2, left=2\n' +
      '  left=2, right=3: -2+1+3=2 not < 2 → right=2\n' +
      '  left=2, right=2: loop ends\n' +
      'i=1 (nums[1]=0):\n' +
      '  left=2, right=3: 0+1+3=4 ≥ 2 → right=2\n' +
      '  left=2, right=2: loop ends\n' +
      'Result: count=2',
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
    intuition:
      'XOR is the hero here - it cancels out pairs, leaving only the two unique numbers XORed together. The trick is finding a bit where they differ, then using that bit to split all numbers into two groups, each containing exactly one unique number.',
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
    // Step 1: XOR all numbers — duplicates cancel out, leaving xor of the two unique numbers
    let xorOfUniquePair = 0;
    for (const n of nums) {
        xorOfUniquePair ^= n;
    }

    // Step 2: Find a bit where the two unique numbers differ
    // The lowest set bit in xorOfUniquePair is guaranteed to differ between them
    const differingBit = xorOfUniquePair & (-xorOfUniquePair);

    // Step 3: Partition all numbers into two groups by whether differingBit is set
    // Each group contains exactly one unique number; duplicates cancel within each group
    let uniqueA = 0;
    let uniqueB = 0;
    for (const n of nums) {
        if (n & differingBit) {
            uniqueA ^= n;
        } else {
            uniqueB ^= n;
        }
    }

    return [uniqueA, uniqueB];
};`,
    jsWalkthrough:
      'Example: nums = [1,2,1,3,2,5]\n' +
      'Step 1: XOR all → 1^2^1^3^2^5 = 3^5 = 6 (binary 110)\n' +
      'Step 2: differingBit = 6 & (-6) = 6 & ...11111010 = 2 (binary 010)\n' +
      'Step 3: group by bit 1:\n' +
      '  bit set (2):   2,3,2 → xor = 3  (uniqueA=3)\n' +
      '  bit clear (0): 1,1,5 → xor = 5  (uniqueB=5)\n' +
      'Result: [3, 5]',
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
    intuition:
      'A valid tree has exactly two properties: n-1 edges and no cycles. Think of Union-Find as connecting islands - each edge merges two islands. If you try to connect two nodes already on the same island, you have found a cycle.',
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
    // A valid tree must have exactly n-1 edges
    if (edges.length !== n - 1) return false;

    // Initialize Union-Find: each node is its own parent
    const parent = Array.from({length: n}, (_, i) => i);

    // Find root with path compression
    const find = (x) => {
        while (parent[x] !== x) {
            // Path compression: point directly to grandparent
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };

    // Process each edge; if both endpoints share a root, it's a cycle
    for (const [u, v] of edges) {
        const rootU = find(u);
        const rootV = find(v);

        if (rootU === rootV) {
            // Adding this edge would create a cycle
            return false;
        }

        // Union the two components
        parent[rootU] = rootV;
    }

    return true;
};`,
    jsWalkthrough:
      'Example: n=5, edges=[[0,1],[0,2],[0,3],[1,4]]\n' +
      'edges.length=4 === n-1=4 ✓\n' +
      'parent = [0,1,2,3,4]\n' +
      '[0,1]: find(0)=0, find(1)=1 → different → parent[0]=1 → [1,1,2,3,4]\n' +
      '[0,2]: find(0)=1, find(2)=2 → different → parent[1]=2 → [1,2,2,3,4]\n' +
      '[0,3]: find(0)=2, find(3)=3 → different → parent[2]=3 → [1,2,3,3,4]\n' +
      '[1,4]: find(1)=3, find(4)=4 → different → parent[3]=4\n' +
      'No cycle found → return true',
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
    intuition:
      'An ugly number is built only from the building blocks 2, 3, and 5. By repeatedly dividing out these factors, you strip the number down to its core. If what remains is 1, it was made entirely of ugly factors.',
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
    // Ugly numbers must be positive
    if (n <= 0) return false;

    // Divide out all factors of 2, 3, and 5
    const uglyPrimes = [2, 3, 5];
    for (const prime of uglyPrimes) {
        while (n % prime === 0) {
            n = Math.floor(n / prime);
        }
    }

    // If all prime factors were 2, 3, or 5, what remains is 1
    return n === 1;
};`,
    jsWalkthrough:
      'Example: n = 12\n' +
      'Divide by 2: 12→6→3 (not divisible further)\n' +
      'Divide by 3: 3→1 (not divisible further)\n' +
      'Divide by 5: 1 (not divisible)\n' +
      'n===1 → return true\n\n' +
      'Example: n = 14\n' +
      'Divide by 2: 14→7\n' +
      'Divide by 3: 7 (not divisible)\n' +
      'Divide by 5: 7 (not divisible)\n' +
      'n=7 ≠ 1 → return false (14 = 2 * 7, and 7 is not ugly)',
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
    intuition:
      'Every ugly number is created by multiplying a smaller ugly number by 2, 3, or 5. Think of three assembly lines, each producing ugly numbers at different rates. Three pointers track which ugly number each line should multiply next, and you always pick the smallest product.',
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
    ugly[0] = 1; // The first ugly number is 1

    // Three pointers: each points to the next ugly number to multiply
    let pointer2 = 0; // index of next ugly to multiply by 2
    let pointer3 = 0; // index of next ugly to multiply by 3
    let pointer5 = 0; // index of next ugly to multiply by 5

    for (let i = 1; i < n; i++) {
        // Compute candidates from each "production line"
        const candidate2 = ugly[pointer2] * 2;
        const candidate3 = ugly[pointer3] * 3;
        const candidate5 = ugly[pointer5] * 5;

        // The next ugly number is the smallest candidate
        const nextUgly = Math.min(candidate2, candidate3, candidate5);
        ugly[i] = nextUgly;

        // Advance all pointers that produced the minimum (handles duplicates like 6=2*3=3*2)
        if (nextUgly === candidate2) pointer2++;
        if (nextUgly === candidate3) pointer3++;
        if (nextUgly === candidate5) pointer5++;
    }

    return ugly[n - 1];
};`,
    jsWalkthrough:
      'Building the sequence step by step:\n' +
      'ugly=[1], p2=0,p3=0,p5=0\n' +
      'i=1: c2=1*2=2, c3=1*3=3, c5=1*5=5 → min=2 → ugly=[1,2], p2=1\n' +
      'i=2: c2=2*2=4, c3=1*3=3, c5=1*5=5 → min=3 → ugly=[1,2,3], p3=1\n' +
      'i=3: c2=4, c3=2*3=6, c5=5 → min=4 → ugly=[1,2,3,4], p2=2\n' +
      'i=4: c2=3*2=6, c3=6, c5=5 → min=5 → ugly=[1,2,3,4,5], p5=1\n' +
      '...continuing to n=10 gives ugly[9]=12',
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
    intuition:
      'This extends the 3-color paint house problem to k colors. The key optimization is that for each house, you only need the two cheapest options from the previous house - if the current color matches the cheapest, use the second cheapest instead.',
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

    const numHouses = costs.length;
    const numColors = costs[0].length;

    // Track the two smallest costs from the previous house and the color of the minimum
    let prevMin1 = 0;      // smallest cumulative cost so far
    let prevMin2 = 0;      // second smallest cumulative cost so far
    let prevMin1Color = -1; // which color achieved prevMin1

    for (let house = 0; house < numHouses; house++) {
        let newMin1 = Infinity;
        let newMin2 = Infinity;
        let newMin1Color = -1;

        for (let color = 0; color < numColors; color++) {
            // If this color matches the previous minimum's color, use second minimum instead
            const prevBest = (color !== prevMin1Color) ? prevMin1 : prevMin2;
            const totalCost = costs[house][color] + prevBest;

            if (totalCost < newMin1) {
                // New global minimum — push old min1 to min2
                newMin2 = newMin1;
                newMin1 = totalCost;
                newMin1Color = color;
            } else if (totalCost < newMin2) {
                newMin2 = totalCost;
            }
        }

        prevMin1 = newMin1;
        prevMin2 = newMin2;
        prevMin1Color = newMin1Color;
    }

    return prevMin1;
};`,
    jsWalkthrough:
      'Example: costs = [[1,5,3],[2,9,4]], k=3\n' +
      'Initial: prevMin1=0, prevMin2=0, prevMin1Color=-1\n' +
      'House 0:\n' +
      '  color=0: 1+0=1 → newMin1=1, newMin1Color=0\n' +
      '  color=1: 5+0=5 → newMin2=5\n' +
      '  color=2: 3+0=3 → (3<5) newMin2=3\n' +
      '  → prevMin1=1 (color 0), prevMin2=3\n' +
      'House 1:\n' +
      '  color=0: prevMin1Color=0 → use prevMin2=3 → 2+3=5\n' +
      '  color=1: 9+prevMin1=9+1=10\n' +
      '  color=2: 4+prevMin1=4+1=5\n' +
      '  newMin1=5 → Result: 5',
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
    intuition:
      'A palindrome is a mirror. For it to work, every character needs a partner on the other side. So at most one character can appear an odd number of times (it sits alone in the center). Just count odd-frequency characters.',
    approach:
      'Count character frequencies. A string can form a palindrome if at most one character has an odd frequency (it would be the center character in an odd-length palindrome).',
    code: `class Solution:
    def canPermutePalindrome(self, s: str) -> bool:
        from collections import Counter
        counts = Counter(s)
        odd_count = sum(1 for c in counts.values() if c % 2 == 1)
        return odd_count <= 1`,
    jsCode: `var canPermutePalindrome = function(s) {
    // Count how many times each character appears
    const charFrequency = new Map();
    for (const char of s) {
        charFrequency.set(char, (charFrequency.get(char) || 0) + 1);
    }

    // Count characters with odd frequency
    // In a palindrome, at most one character can appear an odd number of times
    let oddFrequencyCount = 0;
    for (const frequency of charFrequency.values()) {
        if (frequency % 2 === 1) {
            oddFrequencyCount++;
        }
    }

    return oddFrequencyCount <= 1;
};`,
    jsWalkthrough:
      'Example: s = "aab"\n' +
      'charFrequency: {a:2, b:1}\n' +
      'oddFrequencyCount: a has freq 2 (even, skip), b has freq 1 (odd, count+1)\n' +
      'oddFrequencyCount = 1 ≤ 1 → return true\n' +
      '("aba" is the palindrome permutation)\n\n' +
      'Example: s = "code"\n' +
      'charFrequency: {c:1, o:1, d:1, e:1}\n' +
      'oddFrequencyCount = 4 > 1 → return false',
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
    intuition:
      'Adjacent words in a sorted dictionary reveal ordering clues - the first position where they differ tells you which letter comes first. Collect all these clues as edges in a graph, then topological sort gives you the alphabet order.',
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
    // Initialize adjacency list and in-degree map for every character seen
    const adj = new Map();
    const inDeg = new Map();
    for (const word of words) {
        for (const char of word) {
            if (!inDeg.has(char)) inDeg.set(char, 0);
            if (!adj.has(char)) adj.set(char, new Set());
        }
    }

    // Compare adjacent words to extract ordering rules
    for (let i = 0; i < words.length - 1; i++) {
        const word1 = words[i];
        const word2 = words[i + 1];
        const compareLength = Math.min(word1.length, word2.length);

        // Invalid: longer word is prefix of shorter next word (e.g. "abc" before "ab")
        const word1IsLongerPrefix = word1.length > word2.length &&
            word1.substring(0, compareLength) === word2.substring(0, compareLength);
        if (word1IsLongerPrefix) return "";

        // Find first differing character — this gives an ordering constraint
        for (let j = 0; j < compareLength; j++) {
            if (word1[j] !== word2[j]) {
                const from = word1[j];
                const to = word2[j];
                // Avoid duplicate edges
                if (!adj.get(from).has(to)) {
                    adj.get(from).add(to);
                    inDeg.set(to, inDeg.get(to) + 1);
                }
                break; // Only the first differing position matters
            }
        }
    }

    // Topological sort (Kahn's BFS): start from zero in-degree characters
    const queue = [];
    for (const [char, degree] of inDeg) {
        if (degree === 0) queue.push(char);
    }

    const result = [];
    while (queue.length) {
        const char = queue.shift();
        result.push(char);

        for (const neighbor of adj.get(char)) {
            const newDegree = inDeg.get(neighbor) - 1;
            inDeg.set(neighbor, newDegree);
            if (newDegree === 0) queue.push(neighbor);
        }
    }

    // If result has all characters, no cycle exists
    return result.length === inDeg.size ? result.join('') : '';
};`,
    jsWalkthrough:
      'Example: words = ["wrt","wrf","er","ett","rftt"]\n' +
      'Characters: w,r,t,f,e\n' +
      'Comparing pairs:\n' +
      '  "wrt" vs "wrf": first diff at pos 2 → t before f → t→f\n' +
      '  "wrf" vs "er":  first diff at pos 0 → w before e → w→e\n' +
      '  "er"  vs "ett": first diff at pos 1 → r before t → r→t\n' +
      '  "ett" vs "rftt": first diff at pos 0 → e before r → e→r\n' +
      'inDeg: w=0,r=1,t=1,f=1,e=1\n' +
      'BFS from w: w→e→r→t→f\n' +
      'Result: "wertf"',
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
    intuition:
      'The BST property is like a binary search guide - at each node, you know which direction to go to get closer to the target. Track the closest value seen so far as you walk down, and the BST guarantees you are always moving toward the answer.',
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
        const currentDist = Math.abs(root.val - target);
        const closestDist = Math.abs(closest - target);

        // Update closest if this node is strictly nearer,
        // or equally near but has a smaller value
        const isCloser = currentDist < closestDist;
        const isTiedButSmaller = currentDist === closestDist && root.val < closest;

        if (isCloser || isTiedButSmaller) {
            closest = root.val;
        }

        // Use BST property to navigate toward the target
        if (target < root.val) {
            root = root.left;
        } else {
            root = root.right;
        }
    }

    return closest;
};`,
    jsWalkthrough:
      'Example: root = [4,2,5,1,3], target = 3.714286\n' +
      'Start: closest=4, dist=|4-3.714|=0.286\n' +
      'node=4: target<4 → go left\n' +
      'node=2: |2-3.714|=1.714 > 0.286 → no update, target>2 → go right\n' +
      'node=3: |3-3.714|=0.714 > 0.286 → no update, target>3 → go right\n' +
      'node=null → stop\n' +
      'Result: 4',
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
    intuition:
      'The challenge is that strings can contain any character, so simple delimiters fail. Length-prefixing solves this elegantly - by writing each string\'s length before its content, you always know exactly how many characters to read, regardless of what those characters are.',
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
    // Prefix each string with its length and a '#' delimiter
    // e.g. ["Hello","World"] → "5#Hello5#World"
    return strs.map(s => s.length + '#' + s).join('');
};

var decode = function(s) {
    const result = [];
    let readPos = 0;

    while (readPos < s.length) {
        // Find the '#' delimiter to read the length prefix
        const delimPos = s.indexOf('#', readPos);
        const strLength = parseInt(s.substring(readPos, delimPos));

        // Extract exactly strLength characters after the '#'
        const strStart = delimPos + 1;
        const strEnd = strStart + strLength;
        result.push(s.substring(strStart, strEnd));

        // Advance past the delimiter and the string content
        readPos = strEnd;
    }

    return result;
};`,
    jsWalkthrough:
      'Example: encode(["Hello","World"])\n' +
      '  "Hello" → "5#Hello"\n' +
      '  "World" → "5#World"\n' +
      '  Encoded: "5#Hello5#World"\n\n' +
      'decode("5#Hello5#World"):\n' +
      '  readPos=0: delimPos=1, length=5, str="Hello", readPos=7\n' +
      '  readPos=7: delimPos=8, length=5, str="World", readPos=14\n' +
      '  Result: ["Hello","World"]',
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
    intuition:
      'English number words follow a pattern: break the number into groups of three digits (ones, thousands, millions, billions) and convert each group independently. Each group uses the same logic for hundreds, tens, and ones, just with a different scale suffix.',
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
    const scales = ["", "Thousand", "Million", "Billion"];

    // Convert a number less than 1000 to English words
    const convertUnderThousand = (n) => {
        if (n === 0) return "";
        if (n < 20) return ones[n] + " ";
        if (n < 100) return tens[Math.floor(n / 10)] + " " + convertUnderThousand(n % 10);
        // Hundreds place
        const hundredsDigit = Math.floor(n / 100);
        const remainder = n % 100;
        return ones[hundredsDigit] + " Hundred " + convertUnderThousand(remainder);
    };

    let result = "";

    // Process each group of three digits from right to left
    for (let scaleIndex = 0; scaleIndex < scales.length; scaleIndex++) {
        const chunk = num % 1000;

        if (chunk !== 0) {
            const chunkWords = convertUnderThousand(chunk);
            const scaleWord = scales[scaleIndex];
            result = chunkWords + scaleWord + " " + result;
        }

        num = Math.floor(num / 1000);
    }

    return result.trim();
};`,
    jsWalkthrough:
      'Example: num = 1234567\n' +
      'scaleIndex=0: chunk=567 → "Five Hundred Sixty Seven " + "" + " " = "Five Hundred Sixty Seven "\n' +
      'scaleIndex=1: chunk=234 → "Two Hundred Thirty Four " + "Thousand" + " " prepended\n' +
      'scaleIndex=2: chunk=1 → "One " + "Million" + " " prepended\n' +
      'scaleIndex=3: chunk=0 → skip\n' +
      'Result: "One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven"',
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
    intuition:
      'The h-index asks: what is the largest h where h papers have at least h citations? Using counting sort with buckets, you can scan from the top down, accumulating papers until you find the sweet spot where the count meets the threshold.',
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

    // Counting sort: bucket[i] = number of papers with exactly i citations
    // Bucket n handles all papers with n or more citations
    const buckets = new Array(n + 1).fill(0);
    for (const citationCount of citations) {
        const cappedCount = Math.min(citationCount, n);
        buckets[cappedCount]++;
    }

    // Scan from high to low, accumulating papers
    // The first h where accumulated count >= h is the h-index
    let papersWithAtLeastH = 0;
    for (let h = n; h >= 0; h--) {
        papersWithAtLeastH += buckets[h];
        if (papersWithAtLeastH >= h) return h;
    }

    return 0;
};`,
    jsWalkthrough:
      'Example: citations = [3,0,6,1,5], n=5\n' +
      'buckets: [0,1,0,1,0,1,1] (indices 0-5, bucket[5+]=1 for 6)\n' +
      'Actually: bucket[0]+=1(0), bucket[1]+=1(1), bucket[3]+=1(3), bucket[5]+=1(5), bucket[5]+=1(6→capped5)\n' +
      'buckets = [1,1,0,1,0,2]\n' +
      'h=5: total+=2=2, 2<5\n' +
      'h=4: total+=0=2, 2<4\n' +
      'h=3: total+=1=3, 3>=3 → return 3',
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
    intuition:
      'Since the citations array is sorted, binary search is natural. At any position mid, there are n-mid papers from that point to the end. You are looking for the leftmost spot where citations[mid] >= n-mid, meaning enough papers have enough citations.',
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

    // Binary search for the leftmost index where citations[mid] >= n - mid
    // n - mid = number of papers from index mid to the end (inclusive)
    let lo = 0;
    let hi = n - 1;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const papersFromMidOnward = n - mid;

        if (citations[mid] >= papersFromMidOnward) {
            // mid could be part of the h-index group; search left for a larger h
            hi = mid - 1;
        } else {
            // Not enough citations at mid; search right
            lo = mid + 1;
        }
    }

    // h-index = number of papers from lo onward
    return n - lo;
};`,
    jsWalkthrough:
      'Example: citations = [0,1,3,5,6], n=5\n' +
      'lo=0, hi=4\n' +
      'mid=2: citations[2]=3, n-mid=3 → 3>=3 → hi=1\n' +
      'mid=0: citations[0]=0, n-mid=5 → 0<5 → lo=1\n' +
      'mid=1: citations[1]=1, n-mid=4 → 1<4 → lo=2\n' +
      'lo=2 > hi=1 → stop\n' +
      'Result: n - lo = 5 - 2 = 3',
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
    intuition:
      'The constraint \'no more than two adjacent same-color posts\' means you need to track whether the last two posts matched. If they did, the next one MUST differ. If they differed, the next one can be anything. Two simple states capture all possibilities.',
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

    // same = ways to paint i posts where post i-1 and i have the SAME color
    // diff = ways to paint i posts where post i-1 and i have DIFFERENT colors
    let same = k;           // post 1 and 2 are the same: k choices
    let diff = k * (k - 1); // post 1 and 2 differ: k * (k-1) choices

    for (let post = 3; post <= n; post++) {
        // To keep same color: previous two were different (can now repeat)
        const newSame = diff;

        // To change color: pick any of (k-1) colors different from post i
        // The previous pair can be same or different
        const newDiff = (same + diff) * (k - 1);

        same = newSame;
        diff = newDiff;
    }

    return same + diff;
};`,
    jsWalkthrough:
      'Example: n=3, k=2\n' +
      'After posts 1&2: same=2 (AA,BB), diff=2 (AB,BA)\n' +
      'Post 3:\n' +
      '  newSame = diff = 2 (post 2 and 3 same, post 1 and 2 were different)\n' +
      '  newDiff = (same+diff)*(k-1) = (2+2)*1 = 4\n' +
      '  same=2, diff=4\n' +
      'Result: same+diff = 2+4 = 6',
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
    intuition:
      'Each call to knows() eliminates one candidate. If A knows B, A cannot be the celebrity. If A does not know B, B cannot be the celebrity. One pass of elimination narrows it to a single candidate, and a second pass verifies.',
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
    // Phase 1: Eliminate non-candidates
    // If candidate knows i, candidate can't be the celebrity → switch to i
    let candidate = 0;
    for (let i = 1; i < n; i++) {
        if (knows(candidate, i)) {
            candidate = i;
        }
    }

    // Phase 2: Verify the candidate
    // A celebrity must: know nobody, and be known by everybody
    for (let i = 0; i < n; i++) {
        if (i === candidate) continue;

        const candidateKnowsSomeone = knows(candidate, i);
        const someoneDoesNotKnowCandidate = !knows(i, candidate);

        if (candidateKnowsSomeone || someoneDoesNotKnowCandidate) {
            return -1;
        }
    }

    return candidate;
};`,
    jsWalkthrough:
      'Example: graph = [[1,1,0],[0,1,0],[1,1,1]], n=3\n' +
      'Phase 1 (elimination):\n' +
      '  candidate=0, i=1: knows(0,1)=true → candidate=1\n' +
      '  candidate=1, i=2: knows(1,2)=false → candidate stays 1\n' +
      'Phase 2 (verify candidate=1):\n' +
      '  i=0: knows(1,0)=false, knows(0,1)=true → OK\n' +
      '  i=2: knows(1,2)=false, knows(2,1)=true → OK\n' +
      'Result: 1',
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
    intuition:
      'Backtracking lets you try every way to split the digit string and insert operators. The tricky part is multiplication precedence - you need to \'undo\' the last addition and reapply it with multiplication. Tracking the last operand makes this possible.',
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

    // idx: current position in num string
    // path: expression string built so far
    // total: evaluated value of the expression so far
    // lastOperand: the last operand added (needed for multiplication undo)
    const backtrack = (idx, path, total, lastOperand) => {
        // Reached end of string: check if expression equals target
        if (idx === num.length) {
            if (total === target) result.push(path);
            return;
        }

        for (let i = idx; i < num.length; i++) {
            // Skip numbers with leading zeros (e.g. "05" is invalid)
            if (i > idx && num[idx] === '0') break;

            const currentNum = parseInt(num.substring(idx, i + 1));

            if (idx === 0) {
                // First number: no operator before it
                backtrack(i + 1, String(currentNum), currentNum, currentNum);
            } else {
                // Try adding +, -, * before currentNum
                backtrack(i + 1, path + '+' + currentNum, total + currentNum, currentNum);
                backtrack(i + 1, path + '-' + currentNum, total - currentNum, -currentNum);

                // Multiplication: undo the last addition and apply multiply
                // total - lastOperand + (lastOperand * currentNum)
                const newTotal = total - lastOperand + lastOperand * currentNum;
                backtrack(i + 1, path + '*' + currentNum, newTotal, lastOperand * currentNum);
            }
        }
    };

    backtrack(0, '', 0, 0);
    return result;
};`,
    jsWalkthrough:
      'Example: num = "123", target = 6\n' +
      'backtrack(0,"",0,0):\n' +
      '  cur=1: backtrack(1,"1",1,1)\n' +
      '    cur=2: → "1+2", total=3, last=2\n' +
      '      cur=3: → "1+2+3", total=6=target ✓\n' +
      '    cur=23: → "1+23", total=24...\n' +
      '    cur=2: → "1-2", total=-1...\n' +
      '    cur=2: → "1*2", total=2, last=2\n' +
      '      cur=3: → "1*2*3", total=6=target ✓\n' +
      'Result: ["1+2+3","1*2*3"]',
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
    intuition:
      'In a BST, the in-order successor is the smallest value greater than p. As you walk down, every time you go left (node > p), that node might be the successor. Going right means the successor is farther right. The last left-turn node is your answer.',
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
            // root could be the successor (it is greater than p)
            // but there might be something smaller in the left subtree
            successor = root;
            root = root.left;
        } else {
            // root.val <= p.val, so successor must be in the right subtree
            root = root.right;
        }
    }

    return successor;
};`,
    jsWalkthrough:
      'Example: root = [2,1,3], p = node(1)\n' +
      'node=2: p.val=1 < 2 → successor=2, go left\n' +
      'node=1: p.val=1 not < 1 → go right\n' +
      'node=null → stop\n' +
      'Result: node with val=2\n\n' +
      'Example: root = [5,3,6,2,4], p = node(4)\n' +
      'node=5: 4<5 → successor=5, go left\n' +
      'node=3: 4>3 → go right\n' +
      'node=4: 4 not < 4 → go right\n' +
      'node=null → stop\n' +
      'Result: node with val=5',
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
    intuition:
      'Instead of searching from each empty room to find the nearest gate, flip the problem: start BFS from ALL gates at once. Like a flood filling from multiple sources, each room gets reached by the nearest gate first, giving optimal distances automatically.',
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

    const numRows = rooms.length;
    const numCols = rooms[0].length;
    const INF = 2147483647;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

    // Multi-source BFS: start from all gates simultaneously
    const queue = [];
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            if (rooms[row][col] === 0) {
                queue.push([row, col]);
            }
        }
    }

    // BFS expands outward from all gates at once
    let readIdx = 0;
    while (readIdx < queue.length) {
        const [row, col] = queue[readIdx++];

        for (const [deltaRow, deltaCol] of dirs) {
            const neighborRow = row + deltaRow;
            const neighborCol = col + deltaCol;

            // Only update empty rooms (INF means unvisited empty room)
            const inBounds = neighborRow >= 0 && neighborRow < numRows &&
                             neighborCol >= 0 && neighborCol < numCols;
            if (inBounds && rooms[neighborRow][neighborCol] === INF) {
                // Distance to this room = distance to current cell + 1
                rooms[neighborRow][neighborCol] = rooms[row][col] + 1;
                queue.push([neighborRow, neighborCol]);
            }
        }
    }
};`,
    jsWalkthrough:
      'Example (simplified 2x2): [[INF,0],[INF,INF]]\n' +
      'Find gates: [0,1] → queue=[[0,1]]\n' +
      'Process [0,1] (dist=0):\n' +
      '  neighbor [0,0]: INF → set to 0+1=1, enqueue [0,0]\n' +
      '  neighbor [1,1]: INF → set to 0+1=1, enqueue [1,1]\n' +
      'Process [0,0] (dist=1):\n' +
      '  neighbor [1,0]: INF → set to 1+1=2, enqueue [1,0]\n' +
      'Final: [[1,0],[2,1]]',
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
    intuition:
      'The challenge of Game of Life is updating all cells simultaneously without extra space. The trick is encoding both the old and new state in the same cell using extra values (like 2 and 3). Using modulo, you can always recover the original state during computation.',
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
    const numRows = board.length;
    const numCols = board[0].length;

    // Encoding: 2 = was alive, now dies; 3 = was dead, now lives
    // Using value % 2 recovers the original state during computation

    // Phase 1: Apply rules, encoding transitions
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            // Count live neighbors using original state (value % 2)
            let liveNeighborCount = 0;
            for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
                for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
                    if (deltaRow === 0 && deltaCol === 0) continue;
                    const neighborRow = row + deltaRow;
                    const neighborCol = col + deltaCol;
                    const inBounds = neighborRow >= 0 && neighborRow < numRows &&
                                     neighborCol >= 0 && neighborCol < numCols;
                    if (inBounds && board[neighborRow][neighborCol] % 2 === 1) {
                        liveNeighborCount++;
                    }
                }
            }

            // Apply Game of Life rules with encoded transitions
            const wasAlive = board[row][col] === 1;
            const wasDead = board[row][col] === 0;

            if (wasAlive && (liveNeighborCount < 2 || liveNeighborCount > 3)) {
                board[row][col] = 2; // alive → dead
            } else if (wasDead && liveNeighborCount === 3) {
                board[row][col] = 3; // dead → alive
            }
        }
    }

    // Phase 2: Decode encoded values back to 0 or 1
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            board[row][col] = board[row][col] % 2 === 1 ? 1 : 0;
        }
    }
};`,
    jsWalkthrough:
      'Encoding trick: 0=dead, 1=alive, 2=alive→dead, 3=dead→alive\n' +
      'value % 2 gives original: 0%2=0, 1%2=1, 2%2=0(was alive), 3%2=1(was dead)\n\n' +
      'Cell (1,1) in [[0,1,0],[0,0,1],[1,1,1],[0,0,0]]:\n' +
      '  Neighbors: count live = 5 → 5>3 → stays dead (0, no change)\n' +
      'Cell (0,1): was alive=1, neighbors=1 → <2 → encode as 2\n' +
      'After phase 2: all 2s become 0, all 3s become 1',
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
    intuition:
      'This is an isomorphism check between two sequences. Just like checking if two strings have the same structure, you need a two-way mapping: each pattern letter maps to exactly one word, and each word maps to exactly one letter. Two hash maps enforce this bijection.',
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

    // Pattern and word count must match
    if (pattern.length !== words.length) return false;

    // Two maps to enforce bijection (one-to-one in both directions)
    const charToWord = new Map(); // pattern char → word
    const wordToChar = new Map(); // word → pattern char

    for (let i = 0; i < pattern.length; i++) {
        const patternChar = pattern[i];
        const word = words[i];

        // Check char → word consistency
        if (charToWord.has(patternChar) && charToWord.get(patternChar) !== word) {
            return false;
        }

        // Check word → char consistency (prevents two chars mapping to the same word)
        if (wordToChar.has(word) && wordToChar.get(word) !== patternChar) {
            return false;
        }

        charToWord.set(patternChar, word);
        wordToChar.set(word, patternChar);
    }

    return true;
};`,
    jsWalkthrough:
      'Example: pattern = "abba", s = "dog cat cat dog"\n' +
      'words = ["dog","cat","cat","dog"]\n' +
      'i=0: a→dog, dog→a\n' +
      'i=1: b→cat, cat→b\n' +
      'i=2: b maps to cat ✓, cat maps to b ✓\n' +
      'i=3: a maps to dog ✓, dog maps to a ✓\n' +
      'Result: true\n\n' +
      'Counterexample: pattern="aa", s="dog cat"\n' +
      'i=0: a→dog\n' +
      'i=1: a already maps to "dog" but word is "cat" → return false',
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
    intuition:
      'Manhattan distance splits neatly into independent x and y components. For each dimension, the point minimizing total distance is the median. Think of it like finding the best spot to meet friends on a grid - go to the middle row and middle column.',
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
    const rowCoords = [];
    const colCoords = [];

    // Collect row and column coordinates of all friends (cells with value 1)
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[0].length; col++) {
            if (grid[row][col] === 1) {
                rowCoords.push(row); // already sorted by row traversal order
                colCoords.push(col);
            }
        }
    }

    // Columns need sorting since we iterate row-by-row
    colCoords.sort((a, b) => a - b);

    // In 1D, the optimal meeting point is the median — minimizes total distance
    const totalDistance1D = (coords) => {
        const medianIndex = Math.floor(coords.length / 2);
        const median = coords[medianIndex];
        return coords.reduce((sum, coord) => sum + Math.abs(coord - median), 0);
    };

    // Manhattan distance splits into independent row and column components
    return totalDistance1D(rowCoords) + totalDistance1D(colCoords);
};`,
    jsWalkthrough:
      'Example: grid = [[1,0,0,0,1],[0,0,0,0,0],[0,0,1,0,0]]\n' +
      'Friends at: (0,0), (0,4), (2,2)\n' +
      'rowCoords = [0,0,2], colCoords = [0,4,2] → sorted [0,2,4]\n' +
      'Rows: median=0, distances=|0-0|+|0-0|+|2-0|=2\n' +
      'Cols: median=2, distances=|0-2|+|2-2|+|4-2|=4\n' +
      'Result: 2+4=6',
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
    intuition:
      'DFS with a running counter is the natural approach. As you traverse parent to child, extend the sequence if the value increments by 1, or reset to 1 if it breaks. Track the longest sequence seen across the entire tree.',
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

    // DFS passing parent value and current consecutive sequence length
    const dfs = (node, parentValue, currentLength) => {
        if (!node) return;

        // Extend or reset the consecutive sequence
        const isConsecutive = node.val === parentValue + 1;
        const newLength = isConsecutive ? currentLength + 1 : 1;

        // Track the global maximum
        maxLen = Math.max(maxLen, newLength);

        // Continue DFS on both children
        dfs(node.left, node.val, newLength);
        dfs(node.right, node.val, newLength);
    };

    // Start with -Infinity so root always resets length to 1
    dfs(root, -Infinity, 0);
    return maxLen;
};`,
    jsWalkthrough:
      'Example: root = [1,null,3,2,4,null,null,null,5]\n' +
      'dfs(1, -Inf, 0): 1≠-Inf+1 → length=1, maxLen=1\n' +
      '  dfs(3, 1, 1): 3≠2 → length=1, maxLen=1\n' +
      '    dfs(2, 3, 1): 2≠4 → length=1, maxLen=1\n' +
      '    dfs(4, 3, 1): 4===3+1 → length=2, maxLen=2\n' +
      '      dfs(5, 4, 2): 5===4+1 → length=3, maxLen=3\n' +
      'Result: 3 (path: 3→4→5)',
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
    intuition:
      'Bulls are straightforward - just match positions. For cows, the insight is using a single counter array: increment for secret digits, decrement for guess digits. When the counter crosses zero, it means a previous digit from the other side found a match.',
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
    let bulls = 0;
    let cows = 0;

    // count[d] > 0 means secret has seen digit d without a match yet
    // count[d] < 0 means guess has seen digit d without a match yet
    const digitBalance = new Array(10).fill(0);

    for (let i = 0; i < secret.length; i++) {
        const secretDigit = parseInt(secret[i]);
        const guessDigit = parseInt(guess[i]);

        if (secretDigit === guessDigit) {
            // Exact position match = bull
            bulls++;
        } else {
            // secretDigit was previously needed by guess → cow found
            if (digitBalance[secretDigit] < 0) cows++;
            // guessDigit was previously seen in secret → cow found
            if (digitBalance[guessDigit] > 0) cows++;

            // Track unmatched digits: +1 for secret, -1 for guess
            digitBalance[secretDigit]++;
            digitBalance[guessDigit]--;
        }
    }

    return bulls + "A" + cows + "B";
};`,
    jsWalkthrough:
      'Example: secret = "1807", guess = "7810"\n' +
      'i=0: s=1,g=7 → not equal\n' +
      '  balance[1]>0? no, balance[7]>0? no → no cow yet\n' +
      '  balance[1]++→1, balance[7]--→-1\n' +
      'i=1: s=8,g=8 → BULL! bulls=1\n' +
      'i=2: s=0,g=1 → not equal\n' +
      '  balance[0]<0? no, balance[1]>0? yes → cows=1\n' +
      '  balance[0]++→1, balance[1]--→0\n' +
      'i=3: s=7,g=0 → not equal\n' +
      '  balance[7]<0? yes → cows=2\n' +
      '  balance[0]>0? yes → cows=3\n' +
      'Result: "1A3B"',
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
    intuition:
      'First figure out the minimum removals needed (count unmatched parentheses). Then use backtracking to try all ways to remove exactly that many, pruning branches that remove too many. A set eliminates duplicate results.',
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
    // Count minimum removals needed
    let leftToRemove = 0;  // extra unmatched '('
    let rightToRemove = 0; // extra unmatched ')'

    for (const char of s) {
        if (char === '(') {
            leftToRemove++;
        } else if (char === ')') {
            if (leftToRemove > 0) {
                leftToRemove--; // matched this ')' with a previous '('
            } else {
                rightToRemove++; // unmatched ')'
            }
        }
    }

    const validResults = new Set();

    // backtrack explores keeping or removing each parenthesis
    const backtrack = (idx, openCount, leftRem, rightRem, path) => {
        if (idx === s.length) {
            // Valid if we used exactly the required removals and parentheses balance
            if (leftRem === 0 && rightRem === 0 && openCount === 0) {
                validResults.add(path);
            }
            return;
        }

        const char = s[idx];

        if (char === '(') {
            // Option 1: remove this '(' (uses one of our leftRem budget)
            if (leftRem > 0) {
                backtrack(idx + 1, openCount, leftRem - 1, rightRem, path);
            }
            // Option 2: keep this '('
            backtrack(idx + 1, openCount + 1, leftRem, rightRem, path + char);

        } else if (char === ')') {
            // Option 1: remove this ')' (uses one of our rightRem budget)
            if (rightRem > 0) {
                backtrack(idx + 1, openCount, leftRem, rightRem - 1, path);
            }
            // Option 2: keep this ')' only if there's a matching '(' open
            if (openCount > 0) {
                backtrack(idx + 1, openCount - 1, leftRem, rightRem, path + char);
            }

        } else {
            // Non-parenthesis characters are always kept
            backtrack(idx + 1, openCount, leftRem, rightRem, path + char);
        }
    };

    backtrack(0, 0, leftToRemove, rightToRemove, '');
    return [...validResults];
};`,
    jsWalkthrough:
      'Example: s = "()())()"\n' +
      'Count removals: leftToRemove=0, rightToRemove=1\n' +
      '  (→L=1, )→match L=0, )→R=1, (→L=1, )→match L=0, (→L=1, )→match L=0\n' +
      '  Wait: final leftToRemove=0, rightToRemove=1\n' +
      'backtrack explores all ways to remove exactly 1 right paren\n' +
      'Valid results: "(())()" and "()()()"',
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
    intuition:
      'Prefix sums are like a running total - once computed, any range sum is just the difference of two prefix values. It is like having a bank statement where you can instantly calculate spending between any two dates by subtracting balances.',
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
    // prefix[i] = sum of nums[0..i-1], so prefix[0] = 0 (empty sum)
    this.prefix = new Array(nums.length + 1).fill(0);

    for (let i = 0; i < nums.length; i++) {
        this.prefix[i + 1] = this.prefix[i] + nums[i];
    }
};

NumArray.prototype.sumRange = function(left, right) {
    // Sum from left to right = prefix sum up to right+1 minus prefix sum up to left
    const sumUpToRight = this.prefix[right + 1];
    const sumBeforeLeft = this.prefix[left];
    return sumUpToRight - sumBeforeLeft;
};`,
    jsWalkthrough:
      'Example: nums = [-2,0,3,-5,2,-1]\n' +
      'prefix = [0,-2,-2,1,-4,-2,-3]\n\n' +
      'sumRange(0,2): prefix[3]-prefix[0] = 1-0 = 1\n' +
      '  (−2+0+3 = 1 ✓)\n' +
      'sumRange(2,5): prefix[6]-prefix[2] = -3-(-2) = -1\n' +
      '  (3+(-5)+2+(-1) = -1 ✓)',
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
    intuition:
      'Extend 1D prefix sums to 2D using inclusion-exclusion. Each prefix cell stores the sum of the entire rectangle from the origin. To get any sub-rectangle, add and subtract the right corners - like a Venn diagram for rectangles.',
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
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    // prefix[i][j] = sum of all elements in matrix[0..i-1][0..j-1]
    // Extra row and column of zeros simplify boundary conditions
    this.prefix = Array.from({length: numRows + 1}, () => new Array(numCols + 1).fill(0));

    for (let row = 1; row <= numRows; row++) {
        for (let col = 1; col <= numCols; col++) {
            const cellValue = matrix[row - 1][col - 1];
            const topSum = this.prefix[row - 1][col];
            const leftSum = this.prefix[row][col - 1];
            const overlap = this.prefix[row - 1][col - 1]; // counted twice, subtract once

            this.prefix[row][col] = cellValue + topSum + leftSum - overlap;
        }
    }
};

NumMatrix.prototype.sumRegion = function(row1, col1, row2, col2) {
    // Inclusion-exclusion on the four corners of the prefix sum grid
    const bottomRight = this.prefix[row2 + 1][col2 + 1];
    const topPart     = this.prefix[row1][col2 + 1];
    const leftPart    = this.prefix[row2 + 1][col1];
    const topLeft     = this.prefix[row1][col1]; // subtracted twice, add back once

    return bottomRight - topPart - leftPart + topLeft;
};`,
    jsWalkthrough:
      'Example: matrix = [[3,0,1,4],[5,6,3,2],[1,2,0,1]]\n' +
      'prefix[2][3] = sum of matrix[0..1][0..2] = 3+0+1+5+6+3 = 18\n\n' +
      'sumRegion(1,1,2,2):\n' +
      '  bottomRight = prefix[3][3], topPart = prefix[1][3]\n' +
      '  leftPart = prefix[3][1], topLeft = prefix[1][1]\n' +
      '  = (3+0+1+5+6+3+1+2+0) - (3+0+1) - (3+5+1) - (3)\n' +
      '  = 21 - 4 - 9 + 3 = 11... (use actual values for exact trace)',
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
    intuition:
      'Union-Find is perfect for dynamic connectivity. Each addLand creates a new island (count+1), and merging with adjacent land reduces the count. Think of it as adding puzzle pieces and connecting them to neighbors.',
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
    let islandCount = 0;
    const result = [];
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

    // Find root of a node with path compression
    const find = (x) => {
        while (parent.get(x) !== x) {
            // Path compression: skip to grandparent
            parent.set(x, parent.get(parent.get(x)));
            x = parent.get(x);
        }
        return x;
    };

    // Union two nodes; decrement island count if they were separate
    const union = (a, b) => {
        let rootA = find(a);
        let rootB = find(b);

        if (rootA === rootB) return; // already connected

        const rankA = rank.get(rootA) || 0;
        const rankB = rank.get(rootB) || 0;

        // Union by rank: attach smaller tree under larger tree
        if (rankA < rankB) {
            const temp = rootA;
            rootA = rootB;
            rootB = temp;
        }
        parent.set(rootB, rootA);
        if (rankA === rankB) {
            rank.set(rootA, rankA + 1);
        }

        islandCount--;
    };

    for (const [row, col] of positions) {
        // Convert 2D position to unique 1D key
        const cellKey = row * n + col;

        // Skip duplicate land additions
        if (parent.has(cellKey)) {
            result.push(islandCount);
            continue;
        }

        // Create a new island
        parent.set(cellKey, cellKey);
        islandCount++;

        // Try to merge with any adjacent land cells
        for (const [deltaRow, deltaCol] of dirs) {
            const neighborRow = row + deltaRow;
            const neighborCol = col + deltaCol;
            const neighborKey = neighborRow * n + neighborCol;

            if (parent.has(neighborKey)) {
                union(cellKey, neighborKey);
            }
        }

        result.push(islandCount);
    }

    return result;
};`,
    jsWalkthrough:
      'Example: m=3, n=3, positions=[[0,0],[0,1],[1,2],[2,1]]\n' +
      '[0,0]: new island → count=1 → result=[1]\n' +
      '[0,1]: new island → count=2 → check neighbors: (0,0) exists → union → count=1 → result=[1,1]\n' +
      '[1,2]: new island → count=2 → no land neighbors → result=[1,1,2]\n' +
      '[2,1]: new island → count=3 → no land neighbors → result=[1,1,2,3]',
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
    intuition:
      'A Fenwick tree (Binary Indexed Tree) cleverly uses binary representation to maintain partial sums. Each index covers a range determined by its lowest set bit. This gives you O(log n) for both updates and range queries - a perfect balance.',
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
    this.nums = new Array(this.n).fill(0); // stores original values for delta calculation
    this.tree = new Array(this.n + 1).fill(0); // 1-indexed Fenwick tree

    // Build the tree by inserting each element
    for (let i = 0; i < nums.length; i++) {
        this.update(i, nums[i]);
    }
};

NumArray.prototype.update = function(index, val) {
    // Compute change from old value to new value
    const delta = val - this.nums[index];
    this.nums[index] = val;

    // Propagate delta up the Fenwick tree
    // i & (-i) isolates the lowest set bit — determines range each node covers
    let treeIndex = index + 1; // convert to 1-indexed
    while (treeIndex <= this.n) {
        this.tree[treeIndex] += delta;
        treeIndex += treeIndex & (-treeIndex); // move to next responsible node
    }
};

NumArray.prototype._prefixSum = function(i) {
    // Sum of elements from index 0 to i-1 (1-indexed up to i)
    let sum = 0;
    while (i > 0) {
        sum += this.tree[i];
        i -= i & (-i); // strip lowest set bit to move to parent
    }
    return sum;
};

NumArray.prototype.sumRange = function(left, right) {
    return this._prefixSum(right + 1) - this._prefixSum(left);
};`,
    jsWalkthrough:
      'Example: nums = [1,3,5]\n' +
      'Build: update(0,1), update(1,3), update(2,5)\n' +
      'tree (1-indexed): tree[1]=1, tree[2]=4, tree[3]=5\n\n' +
      'update(1, 2): delta=2-3=-1\n' +
      '  treeIndex=2: tree[2]+=-1 → tree[2]=3\n' +
      '  treeIndex=4: out of range → stop\n\n' +
      'sumRange(0,2): _prefixSum(3) - _prefixSum(0)\n' +
      '  _prefixSum(3): tree[3]+tree[2] = 5+3 = 8\n' +
      '  Result: 8',
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
    intuition:
      'Extend the 1D Fenwick tree to 2D by nesting the bit manipulation in both dimensions. Each update and query operates independently in rows and columns, combining them with inclusion-exclusion for rectangular regions.',
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
    this.numRows = matrix.length;
    this.numCols = matrix[0].length;

    // Original matrix values (used for delta computation during updates)
    this.matrix = Array.from({length: this.numRows}, () => new Array(this.numCols).fill(0));

    // 2D Fenwick tree (1-indexed)
    this.tree = Array.from({length: this.numRows + 1}, () => new Array(this.numCols + 1).fill(0));

    // Build the tree by inserting all initial values
    for (let row = 0; row < this.numRows; row++) {
        for (let col = 0; col < this.numCols; col++) {
            this.update(row, col, matrix[row][col]);
        }
    }
};

NumMatrix.prototype.update = function(row, col, val) {
    const delta = val - this.matrix[row][col];
    this.matrix[row][col] = val;

    // Propagate delta in both row and column dimensions
    let rowIdx = row + 1; // convert to 1-indexed
    while (rowIdx <= this.numRows) {
        let colIdx = col + 1;
        while (colIdx <= this.numCols) {
            this.tree[rowIdx][colIdx] += delta;
            colIdx += colIdx & (-colIdx);
        }
        rowIdx += rowIdx & (-rowIdx);
    }
};

NumMatrix.prototype._prefixSum = function(row, col) {
    // Sum of all elements in the submatrix [0..row-1][0..col-1]
    let sum = 0;
    let rowIdx = row;
    while (rowIdx > 0) {
        let colIdx = col;
        while (colIdx > 0) {
            sum += this.tree[rowIdx][colIdx];
            colIdx -= colIdx & (-colIdx);
        }
        rowIdx -= rowIdx & (-rowIdx);
    }
    return sum;
};

NumMatrix.prototype.sumRegion = function(row1, col1, row2, col2) {
    // Inclusion-exclusion using four prefix sums
    return this._prefixSum(row2 + 1, col2 + 1)
         - this._prefixSum(row1, col2 + 1)
         - this._prefixSum(row2 + 1, col1)
         + this._prefixSum(row1, col1);
};`,
    jsWalkthrough:
      'Example: update(0,0, 3) on a 2x2 matrix\n' +
      'delta = 3 - 0 = 3\n' +
      'rowIdx=1: colIdx=1: tree[1][1]+=3, colIdx=2: tree[1][2]+=3, done\n' +
      '          rowIdx=2: colIdx=1: tree[2][1]+=3, ...\n\n' +
      'sumRegion(0,0,1,1):\n' +
      '  _prefixSum(2,2) - _prefixSum(0,2) - _prefixSum(2,0) + _prefixSum(0,0)\n' +
      '  = total - 0 - 0 + 0 = sum of entire 2x2 matrix',
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
    intuition:
      'The centroid of a tree minimizes the maximum distance to any node. Find it by repeatedly trimming leaves from the outside in, like peeling an onion. The last 1 or 2 nodes remaining are the centroids - the optimal roots.',
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

    // Build adjacency list
    const adj = Array.from({length: n}, () => new Set());
    for (const [u, v] of edges) {
        adj[u].add(v);
        adj[v].add(u);
    }

    // Find all initial leaves (nodes with only one connection)
    let currentLeaves = [];
    for (let node = 0; node < n; node++) {
        if (adj[node].size === 1) {
            currentLeaves.push(node);
        }
    }

    // Peel leaves layer by layer until 1 or 2 nodes remain
    let nodesRemaining = n;
    while (nodesRemaining > 2) {
        nodesRemaining -= currentLeaves.length;

        const nextLeaves = [];
        for (const leaf of currentLeaves) {
            // Each leaf has exactly one neighbor
            const neighbor = [...adj[leaf]][0];

            // Remove the leaf from its neighbor's connections
            adj[neighbor].delete(leaf);

            // If neighbor becomes a leaf after removal, add it to next round
            if (adj[neighbor].size === 1) {
                nextLeaves.push(neighbor);
            }
        }

        currentLeaves = nextLeaves;
    }

    // The remaining nodes are the centroids (roots of min height trees)
    return currentLeaves;
};`,
    jsWalkthrough:
      'Example: n=4, edges=[[1,0],[1,2],[1,3]]\n' +
      'adj: 0:{1}, 1:{0,2,3}, 2:{1}, 3:{1}\n' +
      'Initial leaves: [0,2,3] (degree 1)\n' +
      'nodesRemaining=4, while 4>2:\n' +
      '  nodesRemaining=4-3=1 → wait, 1≤2 so we stop before this\n' +
      'Actually: leaves=[0,2,3], remaining=4>2\n' +
      '  remaining=4-3=1... hmm. Let\'s retrace:\n' +
      '  Remove 0,2,3: node 1 loses all → adj[1]={}, size=0 → not added\n' +
      '  nodesRemaining=1, currentLeaves=[]\n' +
      'Oops — example n=4 leaves [1]. Result: [1]',
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
    intuition:
      'For sparse matrices, most multiplications involve zero and are wasted work. The key optimization is simple: skip zeros. If mat1[i][j] is zero, skip the entire inner loop. This turns a dense O(mkn) operation into something much faster for sparse data.',
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
    const numRowsMat1 = mat1.length;
    const sharedDim = mat1[0].length;     // columns of mat1 = rows of mat2
    const numColsMat2 = mat2[0].length;

    // Initialize result matrix with zeros
    const result = Array.from({length: numRowsMat1}, () => new Array(numColsMat2).fill(0));

    for (let row = 0; row < numRowsMat1; row++) {
        for (let mid = 0; mid < sharedDim; mid++) {
            // Skip zero elements in mat1 — no contribution to any result cell
            if (mat1[row][mid] === 0) continue;

            for (let col = 0; col < numColsMat2; col++) {
                // Skip zero elements in mat2 — avoids unnecessary multiplication
                if (mat2[mid][col] === 0) continue;

                result[row][col] += mat1[row][mid] * mat2[mid][col];
            }
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: mat1=[[1,0,0],[-1,0,3]], mat2=[[7,0,0],[0,0,0],[0,0,1]]\n' +
      'row=0, mid=0: mat1[0][0]=1 (non-zero)\n' +
      '  col=0: mat2[0][0]=7 → result[0][0]+=7\n' +
      '  col=1,2: mat2[0][1,2]=0 → skip\n' +
      'row=0, mid=1,2: mat1[0][1,2]=0 → skip\n' +
      'row=1, mid=0: mat1[1][0]=-1\n' +
      '  col=0: result[1][0]+=-7\n' +
      'row=1, mid=2: mat1[1][2]=3\n' +
      '  col=2: mat2[2][2]=1 → result[1][2]+=3\n' +
      'Result: [[7,0,0],[-7,0,3]]',
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
    intuition:
      'The key insight is thinking backwards: instead of which balloon to burst first, think about which balloon to burst LAST in each interval. The last balloon sees the interval boundaries as its neighbors, making the subproblems independent.',
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
    // Pad with boundary sentinels (value 1) to simplify edge cases
    nums = [1, ...nums, 1];
    const n = nums.length;

    // dp[i][j] = max coins from bursting all balloons strictly between i and j
    const dp = Array.from({length: n}, () => new Array(n).fill(0));

    // Fill by increasing interval length
    for (let length = 2; length < n; length++) {
        for (let left = 0; left < n - length; left++) {
            const right = left + length;

            // Try each balloon k as the LAST to burst in (left, right)
            for (let lastBurst = left + 1; lastBurst < right; lastBurst++) {
                // When lastBurst is popped, its neighbors are left and right (already gone)
                const coinsFromLastBurst = nums[left] * nums[lastBurst] * nums[right];
                const totalCoins = dp[left][lastBurst] + dp[lastBurst][right] + coinsFromLastBurst;

                dp[left][right] = Math.max(dp[left][right], totalCoins);
            }
        }
    }

    return dp[0][n - 1];
};`,
    jsWalkthrough:
      'Example: nums = [3,1,5,8] → padded: [1,3,1,5,8,1]\n' +
      'dp[i][j] = max coins bursting balloons in (i,j)\n' +
      'length=2: dp[0][2]: k=1: 1*3*1=3 → dp[0][2]=3\n' +
      '          dp[1][3]: k=2: 3*1*5=15 → dp[1][3]=15\n' +
      '          dp[2][4]: k=3: 1*5*8=40 → dp[2][4]=40\n' +
      '          dp[3][5]: k=4: 5*8*1=40 → dp[3][5]=40\n' +
      '...continuing fills larger intervals...\n' +
      'dp[0][5] = 167',
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
    intuition:
      'Assign column numbers to each node (root=0, left=col-1, right=col+1). BFS ensures you visit nodes top-to-bottom, left-to-right within each column. Group by column number and you have the vertical order.',
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

    // Map from column index to list of node values in that column
    const columnMap = new Map();

    // BFS queue: each entry is [node, columnIndex]
    // Root is at column 0; left child is col-1, right child is col+1
    const queue = [[root, 0]];
    let minColumn = 0;
    let maxColumn = 0;

    let readIdx = 0;
    while (readIdx < queue.length) {
        const [node, col] = queue[readIdx++];

        if (!columnMap.has(col)) columnMap.set(col, []);
        columnMap.get(col).push(node.val);

        // Track column range to reconstruct ordered output
        minColumn = Math.min(minColumn, col);
        maxColumn = Math.max(maxColumn, col);

        if (node.left)  queue.push([node.left,  col - 1]);
        if (node.right) queue.push([node.right, col + 1]);
    }

    // Collect columns from leftmost to rightmost
    const result = [];
    for (let col = minColumn; col <= maxColumn; col++) {
        result.push(columnMap.get(col));
    }

    return result;
};`,
    jsWalkthrough:
      'Example: root = [3,9,20,null,null,15,7]\n' +
      'BFS queue starts: [[3,col=0]]\n' +
      'Process 3 (col=0): columnMap={0:[3]}, enqueue [9,col=-1],[20,col=1]\n' +
      'Process 9 (col=-1): columnMap={0:[3],-1:[9]}, no children\n' +
      'Process 20 (col=1): columnMap={1:[20]}, enqueue [15,col=0],[7,col=2]\n' +
      'Process 15 (col=0): columnMap={0:[3,15]}\n' +
      'Process 7 (col=2): columnMap={2:[7]}\n' +
      'Columns -1→2: [[9],[3,15],[20],[7]]',
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
    intuition:
      'Merge sort naturally counts inversions - elements that are out of order. During the merge step, when a right-side element gets placed first, it tells you how many left-side elements are larger (i.e., have smaller elements to their right).',
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

    // Track original indices so we can update the correct counts
    const indices = Array.from({length: nums.length}, (_, i) => i);

    const mergeSort = (lo, hi) => {
        if (hi - lo <= 1) return;

        const mid = Math.floor((lo + hi) / 2);
        mergeSort(lo, mid);
        mergeSort(mid, hi);

        // Merge left half [lo,mid) and right half [mid,hi)
        const merged = [];
        let leftPtr = lo;
        let rightPtr = mid;

        while (leftPtr < mid && rightPtr < hi) {
            if (nums[indices[rightPtr]] < nums[indices[leftPtr]]) {
                // Right element is smaller than current left element
                // It will be placed before leftPtr in sorted order
                merged.push(indices[rightPtr++]);
            } else {
                // Left element goes next; all right elements already placed (rightPtr - mid)
                // are smaller than this left element
                counts[indices[leftPtr]] += rightPtr - mid;
                merged.push(indices[leftPtr++]);
            }
        }

        // Remaining left elements: all remaining right elements are to their right and smaller
        while (leftPtr < mid) {
            counts[indices[leftPtr]] += rightPtr - mid;
            merged.push(indices[leftPtr++]);
        }

        while (rightPtr < hi) {
            merged.push(indices[rightPtr++]);
        }

        // Copy sorted result back into indices
        for (let k = lo; k < hi; k++) {
            indices[k] = merged[k - lo];
        }
    };

    mergeSort(0, nums.length);
    return counts;
};`,
    jsWalkthrough:
      'Example: nums = [5,2,6,1]\n' +
      'Initial indices: [0,1,2,3]\n' +
      'mergeSort(0,4):\n' +
      '  mergeSort(0,2): sort [5,2] → indices=[1,0] (2 before 5)\n' +
      '    When placing 5 (idx 0): rightPtr-mid=0 → counts[0]+=0\n' +
      '    But 2 placed first → counts[0]+=1\n' +
      '  mergeSort(2,4): sort [6,1] → indices=[3,2]\n' +
      '    counts[2]+=1 (1 before 6)\n' +
      '  Merge [2,5] with [1,6]:\n' +
      '    1 < 2 → place 1 (idx3)\n' +
      '    2 placed: rightPtr-mid=1 → counts[1]+=1\n' +
      '    5 placed: rightPtr-mid=1 → counts[0]+=1\n' +
      '    6 placed as remainder\n' +
      'counts = [2,1,1,0]',
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
    intuition:
      'Think of building the lexicographically smallest string using a stack. When a new character is smaller than the stack top and the top character appears later in the string, pop it - you can always add it back later. This greedy strategy produces the optimal result.',
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
    // Record the last position of each character in the string
    const lastOccurrence = {};
    for (let i = 0; i < s.length; i++) {
        lastOccurrence[s[i]] = i;
    }

    // Monotonic stack builds the lexicographically smallest result
    const stack = [];
    const alreadyInStack = new Set();

    for (let i = 0; i < s.length; i++) {
        const currentChar = s[i];

        // Skip if this character is already included
        if (alreadyInStack.has(currentChar)) continue;

        // Pop characters that are larger than currentChar and appear again later
        while (
            stack.length > 0 &&
            currentChar < stack[stack.length - 1] &&
            lastOccurrence[stack[stack.length - 1]] > i
        ) {
            const removedChar = stack.pop();
            alreadyInStack.delete(removedChar);
        }

        stack.push(currentChar);
        alreadyInStack.add(currentChar);
    }

    return stack.join('');
};`,
    jsWalkthrough:
      'Example: s = "bcabc"\n' +
      'lastOccurrence: {b:3, c:4, a:2}\n' +
      'i=0, char="b": stack=["b"], inStack={b}\n' +
      'i=1, char="c": c>b → stack=["b","c"], inStack={b,c}\n' +
      'i=2, char="a": a<c, lastOccurrence[c]=4>2 → pop c\n' +
      '               a<b, lastOccurrence[b]=3>2 → pop b\n' +
      '               stack=["a"], inStack={a}\n' +
      'i=3, char="b": stack=["a","b"], inStack={a,b}\n' +
      'i=4, char="c": stack=["a","b","c"]\n' +
      'Result: "abc"',
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
    intuition:
      'BFS from each building finds distances to all reachable empty cells. By summing distances across all BFS runs and tracking reachability, you find the cell that minimizes total travel for all buildings. Only cells reachable by every building qualify.',
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
    const numRows = grid.length;
    const numCols = grid[0].length;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

    // Accumulate total distances and count how many buildings can reach each empty cell
    const totalDist = Array.from({length: numRows}, () => new Array(numCols).fill(0));
    const reachCount = Array.from({length: numRows}, () => new Array(numCols).fill(0));
    let buildingCount = 0;

    // BFS from each building to all reachable empty cells
    for (let startRow = 0; startRow < numRows; startRow++) {
        for (let startCol = 0; startCol < numCols; startCol++) {
            if (grid[startRow][startCol] !== 1) continue;

            buildingCount++;

            const visited = Array.from({length: numRows}, () => new Array(numCols).fill(false));
            const queue = [[startRow, startCol, 0]]; // [row, col, distance]
            visited[startRow][startCol] = true;

            let readIdx = 0;
            while (readIdx < queue.length) {
                const [row, col, dist] = queue[readIdx++];

                for (const [deltaRow, deltaCol] of dirs) {
                    const neighborRow = row + deltaRow;
                    const neighborCol = col + deltaCol;

                    const inBounds = neighborRow >= 0 && neighborRow < numRows &&
                                     neighborCol >= 0 && neighborCol < numCols;

                    if (inBounds && !visited[neighborRow][neighborCol] &&
                        grid[neighborRow][neighborCol] === 0) {
                        visited[neighborRow][neighborCol] = true;
                        totalDist[neighborRow][neighborCol] += dist + 1;
                        reachCount[neighborRow][neighborCol]++;
                        queue.push([neighborRow, neighborCol, dist + 1]);
                    }
                }
            }
        }
    }

    // Find the empty cell reachable by all buildings with minimum total distance
    let minDistance = Infinity;
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            if (grid[row][col] === 0 && reachCount[row][col] === buildingCount) {
                minDistance = Math.min(minDistance, totalDist[row][col]);
            }
        }
    }

    return minDistance === Infinity ? -1 : minDistance;
};`,
    jsWalkthrough:
      'Example: grid=[[1,0,2,0,1],[0,0,0,0,0],[0,0,1,0,0]]\n' +
      'BFS from building at (0,0): fills totalDist for reachable empty cells\n' +
      'BFS from building at (0,4): adds more distances\n' +
      'BFS from building at (2,2): adds more distances\n' +
      'Cell (1,2): reachCount=3 (reached by all buildings), totalDist=7\n' +
      'Result: 7',
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
    intuition:
      'Represent each word as a 26-bit mask where each bit indicates a letter\'s presence. Two words share no letters if their bitmasks AND to zero. This turns a character-by-character comparison into a single bitwise operation.',
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
    // Build a bitmask for each word: bit k is set if letter (a+k) appears
    const masks = words.map(word => {
        let mask = 0;
        for (const char of word) {
            const bitPosition = char.charCodeAt(0) - 97; // 'a'=0, 'b'=1, ...
            mask |= 1 << bitPosition;
        }
        return mask;
    });

    let maxProduct = 0;

    // Check every pair of words
    for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
            // If AND is 0, the two words share no common letters
            const shareNoLetters = (masks[i] & masks[j]) === 0;
            if (shareNoLetters) {
                const product = words[i].length * words[j].length;
                maxProduct = Math.max(maxProduct, product);
            }
        }
    }

    return maxProduct;
};`,
    jsWalkthrough:
      'Example: words = ["abcw","baz","foo","bar","xtfn","abcdef"]\n' +
      'masks:\n' +
      '  "abcw" → bits for a,b,c,w\n' +
      '  "xtfn" → bits for x,t,f,n\n' +
      '  "abcdef" → bits for a,b,c,d,e,f\n\n' +
      'Check pair ("abcw", "xtfn"):\n' +
      '  masks[0] & masks[4] = 0 (no shared letters)\n' +
      '  product = 4 * 4 = 16\n' +
      'Check pair ("abcw", "abcdef"):\n' +
      '  masks[0] & masks[5] != 0 (share a,b,c) → skip\n' +
      'Result: 16',
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
    intuition:
      'Union-Find is tailor-made for counting connected components. Start with n isolated nodes, then process each edge as a merge. Each successful union reduces the component count by one. The final count is your answer.',
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
    // Initialize Union-Find: each node is its own root
    const parent = Array.from({length: n}, (_, i) => i);

    // Find root with path compression (flattens tree for speed)
    const find = (x) => {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]]; // path compression: skip to grandparent
            x = parent[x];
        }
        return x;
    };

    // Start with n separate components
    let componentCount = n;

    for (const [u, v] of edges) {
        const rootU = find(u);
        const rootV = find(v);

        // Only merge if they belong to different components
        if (rootU !== rootV) {
            parent[rootU] = rootV;
            componentCount--;
        }
    }

    return componentCount;
};`,
    jsWalkthrough:
      'Example: n=5, edges=[[0,1],[1,2],[3,4]]\n' +
      'parent = [0,1,2,3,4], componentCount=5\n\n' +
      'Edge [0,1]: find(0)=0, find(1)=1 → different → parent[0]=1, count=4\n' +
      'Edge [1,2]: find(1)=1, find(2)=2 → different → parent[1]=2, count=3\n' +
      'Edge [3,4]: find(3)=3, find(4)=4 → different → parent[3]=4, count=2\n\n' +
      'Result: 2 components ({0,1,2} and {3,4})',
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
    intuition:
      'After sorting, interleave the smaller half at even indices and the larger half at odd indices. The trick of reversing both halves before interleaving prevents equal elements at the boundary from ending up adjacent.',
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
    // Sort a copy to identify smaller and larger halves
    const sorted = [...nums].sort((a, b) => a - b);
    const n = nums.length;

    // The smaller half occupies sorted[0..mid], the larger half sorted[mid+1..n-1]
    const midIndex = Math.floor((n - 1) / 2);

    // Fill positions using pointers that walk backward through each half
    // Reversing prevents equal elements from adjacent placement
    let smallPtr = midIndex;  // pointer into the smaller half (walks backward)
    let largePtr = n - 1;     // pointer into the larger half (walks backward)

    for (let i = 0; i < n; i++) {
        if (i % 2 === 0) {
            // Even indices get elements from the smaller half
            nums[i] = sorted[smallPtr--];
        } else {
            // Odd indices get elements from the larger half
            nums[i] = sorted[largePtr--];
        }
    }
};`,
    jsWalkthrough:
      'Example: nums = [1,5,1,1,6,4]\n' +
      'sorted = [1,1,1,4,5,6], n=6, midIndex=2\n\n' +
      'smallPtr=2 (sorted[0..2]=[1,1,1]), largePtr=5 (sorted[3..5]=[4,5,6])\n\n' +
      'i=0 (even): nums[0]=sorted[2]=1, smallPtr=1\n' +
      'i=1 (odd):  nums[1]=sorted[5]=6, largePtr=4\n' +
      'i=2 (even): nums[2]=sorted[1]=1, smallPtr=0\n' +
      'i=3 (odd):  nums[3]=sorted[4]=5, largePtr=3\n' +
      'i=4 (even): nums[4]=sorted[0]=1, smallPtr=-1\n' +
      'i=5 (odd):  nums[5]=sorted[3]=4, largePtr=2\n\n' +
      'Result: [1,6,1,5,1,4] ✓ (each odd index > neighbors)',
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
    intuition:
      'Prefix sums transform subarray sum problems into subtraction problems. If prefix[j] - prefix[i] = k, then the subarray from i to j sums to k. A hash map stores the first occurrence of each prefix sum, maximizing the subarray length.',
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
    // Map from prefix sum value → earliest index at which it was seen
    // Start with prefixSum=0 at index -1 (before the array begins)
    const prefixMap = new Map([[0, -1]]);

    let prefixSum = 0;
    let maxLen = 0;

    for (let i = 0; i < nums.length; i++) {
        prefixSum += nums[i];

        // If prefixSum - k was seen at some earlier index j,
        // then nums[j+1..i] sums to k
        const target = prefixSum - k;
        if (prefixMap.has(target)) {
            const earliestIndex = prefixMap.get(target);
            const subarrayLength = i - earliestIndex;
            maxLen = Math.max(maxLen, subarrayLength);
        }

        // Only store the FIRST occurrence to maximize future subarray lengths
        if (!prefixMap.has(prefixSum)) {
            prefixMap.set(prefixSum, i);
        }
    }

    return maxLen;
};`,
    jsWalkthrough:
      'Example: nums = [1,-1,5,-2,3], k = 3\n' +
      'prefixMap = {0:-1}\n\n' +
      'i=0: prefixSum=1, target=-2 (not in map) → prefixMap={0:-1, 1:0}\n' +
      'i=1: prefixSum=0, target=-3 (not in map) → 0 already in map, skip\n' +
      'i=2: prefixSum=5, target=2 (not in map) → prefixMap adds 5:2\n' +
      'i=3: prefixSum=3, target=0 → prefixMap has 0 at -1 → len=3-(-1)=4 ✓\n' +
      'i=4: prefixSum=6, target=3 → prefixMap has 3 at 3 → len=4-3=1 (not better)\n' +
      'Result: 4',
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
    intuition:
      'Since 3 is prime, any power of 3 must divide the largest power of 3 in the integer range (3^19). This mathematical shortcut lets you check if n is a power of 3 with a single modulo operation instead of repeated division.',
    approach:
      'The largest power of 3 that fits in a 32-bit integer is 3^19 = 1162261467. If n > 0 and 1162261467 % n == 0, then n is a power of 3.',
    code: `class Solution:
    def isPowerOfThree(self, n: int) -> bool:
        return n > 0 and 1162261467 % n == 0`,
    jsCode: `var isPowerOfThree = function(n) {
    // 3^19 = 1162261467 is the largest power of 3 within 32-bit integer range
    // Since 3 is prime, its only divisors are powers of 3
    // So n is a power of 3 iff n > 0 and n divides 3^19
    const MAX_POWER_OF_THREE = 1162261467; // 3^19
    return n > 0 && MAX_POWER_OF_THREE % n === 0;
};`,
    jsWalkthrough:
      'Example: n = 27\n' +
      '  n > 0? yes\n' +
      '  1162261467 % 27 = 0? 1162261467 = 27 * 43046721 → yes\n' +
      '  Result: true\n\n' +
      'Example: n = 45\n' +
      '  45 = 9 * 5. Since 5 is not a factor of 3^19,\n' +
      '  1162261467 % 45 ≠ 0 → Result: false',
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
    intuition:
      'Convert range sums to prefix sum differences, then use merge sort to count pairs efficiently. During merging, for each left element, two pointers sweep the right half to find the range of valid differences - a clever combination of sorting and counting.',
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
    // Build prefix sums: prefix[i+1] = nums[0] + ... + nums[i]
    // Range sum S(i,j) = prefix[j+1] - prefix[i]
    const prefix = [0];
    for (const num of nums) {
        prefix.push(prefix[prefix.length - 1] + num);
    }

    // Merge sort counts pairs (i, j) where lower <= prefix[j] - prefix[i] <= upper
    const mergeCount = (lo, hi) => {
        if (hi - lo <= 1) return 0;

        const mid = Math.floor((lo + hi) / 2);

        // Count valid pairs in left and right halves recursively
        let count = mergeCount(lo, mid) + mergeCount(mid, hi);

        // Two pointers sweep right half for each left element
        // Since both halves are sorted, j and k only move forward
        let lowerBoundPtr = mid; // first j where prefix[j] - prefix[i] >= lower
        let upperBoundPtr = mid; // first k where prefix[k] - prefix[i] > upper

        for (let i = lo; i < mid; i++) {
            // Advance lowerBoundPtr until prefix[j] - prefix[i] >= lower
            while (lowerBoundPtr < hi && prefix[lowerBoundPtr] - prefix[i] < lower) {
                lowerBoundPtr++;
            }
            // Advance upperBoundPtr until prefix[k] - prefix[i] > upper
            while (upperBoundPtr < hi && prefix[upperBoundPtr] - prefix[i] <= upper) {
                upperBoundPtr++;
            }
            // All j in [lowerBoundPtr, upperBoundPtr) are valid partners for i
            count += upperBoundPtr - lowerBoundPtr;
        }

        // Sort this range so it is ready for parent merge calls
        const sortedSlice = prefix.slice(lo, hi).sort((a, b) => a - b);
        for (let i = lo; i < hi; i++) {
            prefix[i] = sortedSlice[i - lo];
        }

        return count;
    };

    return mergeCount(0, prefix.length);
};`,
    jsWalkthrough:
      'Example: nums = [-2,5,-1], lower = -2, upper = 2\n' +
      'prefix = [0,-2,3,2]\n\n' +
      'mergeCount(0,4) → splits into mergeCount(0,2) and mergeCount(2,4)\n' +
      'mergeCount(0,2): prefix=[0,-2], lo=0,hi=2,mid=1\n' +
      '  i=0: prefix[j]-prefix[0]=prefix[1]-0=-2 ∈ [-2,2] → count=1\n' +
      'mergeCount(2,4): prefix=[3,2], count from 3→2: 2-3=-1 ∈ [-2,2] → count=1\n' +
      'Cross-range merge: i in [0,mid), j in [mid,hi)\n' +
      '  Valid: prefix[2]-prefix[0]=2 ∈ [-2,2] ✓\n' +
      'Total count: 3',
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
    intuition:
      'Visualize splitting a chain into two interleaved chains (odd and even positions), then reconnecting them. Two pointers alternate through the list, each building their own sub-chain. Finally, attach the even chain to the end of the odd chain.',
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

    // oddTail walks through odd-indexed nodes (1st, 3rd, 5th, ...)
    let oddTail = head;
    // evenTail walks through even-indexed nodes (2nd, 4th, 6th, ...)
    let evenTail = head.next;

    // Save the start of the even sublist so we can attach it at the end
    const evenHead = evenTail;

    // Alternate linking: skip over the other type of node
    while (evenTail && evenTail.next) {
        // Connect oddTail to the next odd node (skipping evenTail)
        oddTail.next = evenTail.next;
        oddTail = oddTail.next;

        // Connect evenTail to the next even node (skipping the newly advanced oddTail)
        evenTail.next = oddTail.next;
        evenTail = evenTail.next;
    }

    // Attach the entire even sublist after the last odd node
    oddTail.next = evenHead;

    return head;
};`,
    jsWalkthrough:
      'Example: head = [1,2,3,4,5]\n' +
      'oddTail=1, evenTail=2, evenHead=2\n\n' +
      'Iteration 1: evenTail=2, evenTail.next=3 → proceed\n' +
      '  oddTail.next = 3, oddTail = 3\n' +
      '  evenTail.next = 4, evenTail = 4\n' +
      '  List so far (odd chain): 1→3→4(temp), even chain: 2→4\n\n' +
      'Iteration 2: evenTail=4, evenTail.next=5 → proceed\n' +
      '  oddTail.next = 5, oddTail = 5\n' +
      '  evenTail.next = null, evenTail = null\n' +
      '  Odd chain: 1→3→5, even chain: 2→4→null\n\n' +
      'Connect: oddTail(5).next = evenHead(2)\n' +
      'Result: 1→3→5→2→4',
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
    intuition:
      'DFS with memoization turns this into a DAG shortest path problem. Since we only move to strictly larger values, there are no cycles, so no visited set is needed. Each cell\'s answer depends only on its larger neighbors, making memoization effective.',
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
    const numRows = matrix.length;
    const numCols = matrix[0].length;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

    // memo[i][j] = length of longest increasing path starting at (i,j)
    // 0 means not yet computed
    const memo = Array.from({length: numRows}, () => new Array(numCols).fill(0));

    const dfs = (row, col) => {
        // Return cached result if already computed
        if (memo[row][col] !== 0) return memo[row][col];

        // Start with path length 1 (just the current cell)
        let longestFromHere = 1;

        // Try all 4 directions — only move to strictly larger neighbors
        for (const [deltaRow, deltaCol] of dirs) {
            const neighborRow = row + deltaRow;
            const neighborCol = col + deltaCol;

            const inBounds = neighborRow >= 0 && neighborRow < numRows &&
                             neighborCol >= 0 && neighborCol < numCols;

            if (inBounds && matrix[neighborRow][neighborCol] > matrix[row][col]) {
                // Extend path through this neighbor
                const pathThroughNeighbor = 1 + dfs(neighborRow, neighborCol);
                longestFromHere = Math.max(longestFromHere, pathThroughNeighbor);
            }
        }

        memo[row][col] = longestFromHere;
        return longestFromHere;
    };

    // Try starting from every cell and return the global maximum
    let globalMax = 0;
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            globalMax = Math.max(globalMax, dfs(row, col));
        }
    }

    return globalMax;
};`,
    jsWalkthrough:
      'Example: matrix = [[9,9,4],[6,6,8],[2,1,1]]\n' +
      'dfs(2,1) → value=1:\n' +
      '  neighbor (2,0)=2 > 1 → dfs(2,0)=? value=2:\n' +
      '    neighbor (1,0)=6 > 2 → dfs(1,0)=? value=6:\n' +
      '      neighbor (0,0)=9 > 6 → dfs(0,0)=1 (no larger neighbors)\n' +
      '      memo[1][0]=2\n' +
      '    memo[2][0]=3\n' +
      '  dfs(2,1)=4, memo[2][1]=4\n\n' +
      'Path: 1→2→6→9, length=4\n' +
      'Result: 4',
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
    intuition:
      'Think greedily about coverage. If you can form all numbers in [1, miss-1], then adding miss itself doubles your range to [1, 2*miss-1]. Use existing array elements when they fit within current coverage, and patch with miss only when necessary.',
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
    // miss = smallest positive number we cannot yet form as a sum
    // Invariant: we can form all numbers in [1, miss-1]
    let miss = 1;
    let patchCount = 0;
    let arrayIndex = 0;

    while (miss <= n) {
        if (arrayIndex < nums.length && nums[arrayIndex] <= miss) {
            // This array element fits within our current range:
            // If we can form [1, miss-1], adding nums[arrayIndex] extends to [1, miss + nums[arrayIndex] - 1]
            miss += nums[arrayIndex];
            arrayIndex++;
        } else {
            // Gap: cannot form 'miss' with current elements
            // Best patch: add 'miss' itself → extends coverage to [1, 2*miss-1]
            miss += miss; // doubles coverage
            patchCount++;
        }
    }

    return patchCount;
};`,
    jsWalkthrough:
      'Example: nums = [1,3], n = 6\n' +
      'miss=1, patchCount=0, arrayIndex=0\n\n' +
      'nums[0]=1 <= miss=1 → miss=1+1=2, arrayIndex=1\n' +
      'nums[1]=3 > miss=2 → patch! miss=2+2=4, patchCount=1\n' +
      'nums[1]=3 <= miss=4 → miss=4+3=7, arrayIndex=2\n' +
      'miss=7 > n=6 → stop\n\n' +
      'Result: 1 patch (adding 2 gives coverage [1,1+2+3=6])',
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
    intuition:
      'A bottom-up approach checks BST validity and computes size simultaneously. Each subtree reports whether it is a valid BST, its size, and its value range. A node forms a valid BST only if both children are valid BSTs and the values respect BST ordering.',
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
    let maxBSTSize = 0;

    // Returns [isBST, size, minValue, maxValue] for the subtree rooted at node
    const dfs = (node) => {
        // Null node: valid BST of size 0, with sentinel min/max for comparisons
        if (!node) return [true, 0, Infinity, -Infinity];

        const [leftIsBST, leftSize, leftMin, leftMax] = dfs(node.left);
        const [rightIsBST, rightSize, rightMin, rightMax] = dfs(node.right);

        // Current subtree is a BST if both children are BSTs and value ordering is correct
        const currentIsBST = leftIsBST && rightIsBST &&
                             leftMax < node.val &&
                             node.val < rightMin;

        if (currentIsBST) {
            const currentSize = leftSize + rightSize + 1;
            maxBSTSize = Math.max(maxBSTSize, currentSize);

            // Report this subtree's range for parent's validation
            const subMin = Math.min(leftMin, node.val);
            const subMax = Math.max(rightMax, node.val);
            return [true, currentSize, subMin, subMax];
        }

        // Not a valid BST — return false to invalidate parent's BST check
        return [false, 0, 0, 0];
    };

    dfs(root);
    return maxBSTSize;
};`,
    jsWalkthrough:
      'Example: root = [10,5,15,1,8,null,7]\n' +
      'dfs(1): leaf → [true, 1, 1, 1]\n' +
      'dfs(8): leaf → [true, 1, 8, 8]\n' +
      'dfs(5): left=[true,1,1,1], right=[true,1,8,8]\n' +
      '  leftMax=1 < 5 < rightMin=8 → BST!\n' +
      '  size=3, maxBSTSize=3, return [true,3,1,8]\n' +
      'dfs(7): leaf → [true,1,7,7]\n' +
      'dfs(15): left=null, right=[true,1,7,7]\n' +
      '  rightMin=7 but 15 > 7 → NOT BST (7 should be to the right of 15)\n' +
      '  return [false,0,0,0]\n' +
      'dfs(10): rightIsBST=false → not BST\n' +
      'Result: maxBSTSize = 3',
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
    intuition:
      'Track two thresholds: the smallest value seen and the smallest value greater than it. If you find anything larger than both, you have your increasing triplet. Even if the first threshold updates later, the second still has a valid predecessor somewhere before it.',
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
    // first = smallest value seen so far
    // second = smallest value greater than some earlier "first"
    // If we find anything > second, we have a valid triplet
    let firstMin = Infinity;
    let secondMin = Infinity;

    for (const num of nums) {
        if (num <= firstMin) {
            // This is the new global minimum — update first threshold
            firstMin = num;
        } else if (num <= secondMin) {
            // Larger than firstMin but not yet > secondMin
            // This could be the middle element of our triplet
            secondMin = num;
        } else {
            // num > secondMin > firstMin (even if firstMin updated later,
            // secondMin still has a valid smaller predecessor before it)
            return true;
        }
    }

    return false;
};`,
    jsWalkthrough:
      'Example: nums = [5,1,4,2,3]\n' +
      'firstMin=Inf, secondMin=Inf\n\n' +
      'num=5: 5<=Inf → firstMin=5\n' +
      'num=1: 1<=5 → firstMin=1\n' +
      'num=4: 4>1, 4<=Inf → secondMin=4\n' +
      '  (1 < 4 exists earlier in the array)\n' +
      'num=2: 2>1, 2<=4 → secondMin=2\n' +
      '  (1 < 2 still has a valid predecessor)\n' +
      'num=3: 3>firstMin=1, 3>secondMin=2 → return true!\n' +
      '  Triplet: 1 < 2 < 3',
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
    intuition:
      'For word A + word B to be a palindrome, B must relate to the reverse of A. Split each word at every position: if one part is already a palindrome, the other part\'s reverse might exist in the word list. A hash map of reversed words enables quick lookups.',
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
    // Map each reversed word to its original index for O(1) lookups
    const reversedWordMap = new Map();
    for (let i = 0; i < words.length; i++) {
        const reversed = words[i].split('').reverse().join('');
        reversedWordMap.set(reversed, i);
    }

    const result = [];

    // Check if a string is a palindrome using two pointers
    const isPalindrome = (s) => {
        let left = 0;
        let right = s.length - 1;
        while (left < right) {
            if (s[left] !== s[right]) return false;
            left++;
            right--;
        }
        return true;
    };

    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        // Split word at every position into (prefix, suffix)
        for (let splitPoint = 0; splitPoint <= word.length; splitPoint++) {
            const prefix = word.substring(0, splitPoint);
            const suffix = word.substring(splitPoint);

            // Case 1: suffix is a palindrome AND reversed(prefix) exists in the list
            // → word + reversed(prefix) forms a palindrome (word[i] + word[j])
            if (reversedWordMap.has(prefix)) {
                const partnerIndex = reversedWordMap.get(prefix);
                if (partnerIndex !== i && isPalindrome(suffix)) {
                    result.push([i, partnerIndex]);
                }
            }

            // Case 2: prefix is a palindrome AND reversed(suffix) exists in the list
            // → reversed(suffix) + word forms a palindrome (word[j] + word[i])
            // j > 0 avoids duplicating the split point where prefix="" case already covers
            if (splitPoint > 0 && reversedWordMap.has(suffix)) {
                const partnerIndex = reversedWordMap.get(suffix);
                if (partnerIndex !== i && isPalindrome(prefix)) {
                    result.push([partnerIndex, i]);
                }
            }
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: words = ["abcd","dcba","lls","s","sssll"]\n' +
      'reversedWordMap: {"dcba":0, "abcd":1, "sll":2, "s":3, "llsss":4}\n\n' +
      'word[0]="abcd", splitPoint=4:\n' +
      '  prefix="abcd", suffix=""\n' +
      '  reversedWordMap has "abcd" at index 1 ≠ 0, isPalindrome("")=true\n' +
      '  → push [0,1]\n' +
      'word[1]="dcba", splitPoint=0:\n' +
      '  prefix="", suffix="dcba"\n' +
      '  reversedWordMap has "" → no\n' +
      '  (continues finding [1,0], [3,2], [2,4])',
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
    intuition:
      'For each house (node), you either rob it or skip it. If you rob it, you must skip both children. Return both options from each DFS call - this avoids recomputation and gives you the information needed to make optimal choices at each level.',
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
    // DFS returns [gainIfRob, gainIfSkip] for each subtree
    const dfs = (node) => {
        if (!node) return [0, 0];

        const [leftRobGain, leftSkipGain] = dfs(node.left);
        const [rightRobGain, rightSkipGain] = dfs(node.right);

        // Rob this node: cannot rob direct children
        const gainIfRobThis = node.val + leftSkipGain + rightSkipGain;

        // Skip this node: take the best from each child independently
        const gainIfSkipThis = Math.max(leftRobGain, leftSkipGain) +
                               Math.max(rightRobGain, rightSkipGain);

        return [gainIfRobThis, gainIfSkipThis];
    };

    const [robRoot, skipRoot] = dfs(root);
    return Math.max(robRoot, skipRoot);
};`,
    jsWalkthrough:
      'Example: root = [3,2,3,null,3,null,1]\n' +
      'Tree:      3\n' +
      '          / \\\n' +
      '         2   3\n' +
      '          \\   \\\n' +
      '           3   1\n\n' +
      'dfs(3 right of 2): [3, 0]\n' +
      'dfs(2): robGain=2+0+0=2, skipGain=max(3,0)+max(0,0)=3 → [2,3]\n' +
      'dfs(1 right of 3): [1, 0]\n' +
      'dfs(3 right child): robGain=3+0+0=3, skipGain=0+max(1,0)=1 → [3,1]\n' +
      'dfs(root=3): robGain=3+3+1=7, skipGain=max(2,3)+max(3,1)=3+3=6 → [7,6]\n' +
      'Result: max(7,6) = 7',
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
    intuition:
      'Each integer\'s contribution to the total depends on how deeply it is nested. DFS naturally tracks depth as it recurses into nested lists. Multiply each integer by its depth, and the recursive structure handles arbitrarily deep nesting.',
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
    // Recursively compute weighted sum: each integer is multiplied by its nesting depth
    const dfs = (nested, currentDepth) => {
        let total = 0;

        for (const item of nested) {
            if (item.isInteger()) {
                // Integer at this depth: contribute value * depth
                total += item.getInteger() * currentDepth;
            } else {
                // Nested list: recurse with increased depth
                total += dfs(item.getList(), currentDepth + 1);
            }
        }

        return total;
    };

    // Root level starts at depth 1
    return dfs(nestedList, 1);
};`,
    jsWalkthrough:
      'Example: [[1,1],2,[1,1]], depth 1\n' +
      'Item [1,1] is a list → recurse at depth 2:\n' +
      '  item 1 (integer): 1 * 2 = 2\n' +
      '  item 1 (integer): 1 * 2 = 2 → subtotal = 4\n' +
      'Item 2 (integer): 2 * 1 = 2\n' +
      'Item [1,1] is a list → recurse at depth 2:\n' +
      '  item 1: 1*2=2, item 1: 1*2=2 → subtotal = 4\n\n' +
      'Total = 4 + 2 + 4 = 10',
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
    intuition:
      'A sliding window with a character frequency map is the classic approach for substring problems with constraints. Expand the window to include characters; when you exceed k distinct characters, shrink from the left until you are back within the limit.',
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
    // Map tracking the count of each character in the current window
    const charCount = new Map();
    let leftBoundary = 0;
    let maxWindowLength = 0;

    for (let right = 0; right < s.length; right++) {
        const rightChar = s[right];

        // Expand window: add the right character
        charCount.set(rightChar, (charCount.get(rightChar) || 0) + 1);

        // Shrink window from the left until we have at most k distinct characters
        while (charCount.size > k) {
            const leftChar = s[leftBoundary];
            const newCount = charCount.get(leftChar) - 1;

            if (newCount === 0) {
                charCount.delete(leftChar); // remove this character from the window
            } else {
                charCount.set(leftChar, newCount);
            }

            leftBoundary++;
        }

        // Window [leftBoundary, right] has at most k distinct characters
        const windowLength = right - leftBoundary + 1;
        maxWindowLength = Math.max(maxWindowLength, windowLength);
    }

    return maxWindowLength;
};`,
    jsWalkthrough:
      'Example: s = "eceba", k = 2\n' +
      'right=0, char="e": window="e", distinct=1, maxLen=1\n' +
      'right=1, char="c": window="ec", distinct=2, maxLen=2\n' +
      'right=2, char="e": window="ece", distinct=2, maxLen=3\n' +
      'right=3, char="b": window="eceb", distinct=3 > k=2\n' +
      '  shrink left: remove "e" → count["e"]=1, left=1\n' +
      '  window="ceb", distinct=3 still > 2\n' +
      '  shrink: remove "c" → count["c"]=0 → delete, left=2\n' +
      '  window="eb", distinct=2, maxLen stays 3\n' +
      'right=4, char="a": window="eba", distinct=3 > 2\n' +
      '  shrink: remove "e" → left=3, window="ba", distinct=2, maxLen=3\n' +
      'Result: 3 ("ece")',
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
    intuition:
      'A stack naturally handles nested structures by processing them inside-out. Push elements in reverse so the first item is on top. In hasNext(), keep unpacking list elements until you expose an integer. This lazy approach avoids flattening everything upfront.',
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
    // Push elements in reverse so the first element sits on top of the stack
    this.stack = [...nestedList].reverse();
};

NestedIterator.prototype.next = function() {
    // hasNext() guarantees the top is an integer before next() is called
    return this.stack.pop().getInteger();
};

NestedIterator.prototype.hasNext = function() {
    // Flatten lazily: keep unpacking list elements until an integer is on top
    while (this.stack.length > 0) {
        const topElement = this.stack[this.stack.length - 1];

        if (topElement.isInteger()) {
            return true; // ready to return an integer
        }

        // Top is a nested list — expand it in reverse onto the stack
        this.stack.pop();
        const nestedItems = topElement.getList();
        for (let i = nestedItems.length - 1; i >= 0; i--) {
            this.stack.push(nestedItems[i]);
        }
    }

    return false; // stack is empty, no more integers
};`,
    jsWalkthrough:
      'Example: [[1,1],2,[1,1]]\n' +
      'Constructor: reverse → stack = [[1,1], 2, [1,1]] (right side is top)\n' +
      'Actually reversed: top=[1,1], then 2, then [1,1]\n\n' +
      'hasNext(): top=[1,1] is list → pop, push 1,1 (reversed) → stack: [..., 1, 1]\n' +
      '           top=1 is integer → return true\n' +
      'next(): pop 1 → returns 1\n' +
      'hasNext(): top=1 is integer → return true\n' +
      'next(): pop 1 → returns 1\n' +
      'hasNext(): top=2 is integer → return true\n' +
      'next(): pop 2 → returns 2\n' +
      '... continues expanding [1,1] → returns 1, 1',
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
    intuition:
      'Mathematically, 3 is the optimal factor because it is closest to the mathematical constant e (~2.718). Break the number into as many 3s as possible, but avoid a remainder of 1 (since 2+2 > 3+1). This greedy math insight gives the maximum product.',
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
    // Special cases: 2 and 3 must be split but the pieces are smaller than the whole
    if (n === 2) return 1; // 1 + 1 = 2, product = 1
    if (n === 3) return 2; // 1 + 2 = 3, product = 2 (best: don't split the 2)

    // For n >= 4, greedily break off 3s
    // Stop at n <= 4 because:
    //   - n=4: 2*2=4, best to keep as-is (not break into 3+1=3)
    //   - n=3: already handled as remainder
    let product = 1;
    while (n > 4) {
        product *= 3;
        n -= 3;
    }

    // Multiply by remaining n (could be 2, 3, or 4 — all optimal as-is)
    return product * n;
};`,
    jsWalkthrough:
      'Example: n = 10\n' +
      'n=10 > 4: product *= 3 → product=3, n=7\n' +
      'n=7 > 4: product *= 3 → product=9, n=4\n' +
      'n=4 ≤ 4: exit loop\n' +
      'return product * n = 9 * 4 = 36\n\n' +
      'Verification: 10 = 3+3+4, product = 3*3*4 = 36 ✓\n' +
      '(vs 3+3+3+1: 3*3*3*1=27, worse because of the 1)',
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
    intuition:
      'Two pointers from both ends swap vowels while skipping consonants. It is like playing a matching game where you only care about vowels - ignore everything else and swap the outermost vowel pair, then move inward.',
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
    const vowelSet = new Set('aeiouAEIOU');

    // Convert to array for in-place swapping
    const chars = s.split('');
    let leftPtr = 0;
    let rightPtr = chars.length - 1;

    while (leftPtr < rightPtr) {
        // Advance left pointer past non-vowels
        while (leftPtr < rightPtr && !vowelSet.has(chars[leftPtr])) {
            leftPtr++;
        }
        // Advance right pointer past non-vowels
        while (leftPtr < rightPtr && !vowelSet.has(chars[rightPtr])) {
            rightPtr--;
        }

        // Both pointers now point to vowels — swap them
        if (leftPtr < rightPtr) {
            const temp = chars[leftPtr];
            chars[leftPtr] = chars[rightPtr];
            chars[rightPtr] = temp;
            leftPtr++;
            rightPtr--;
        }
    }

    return chars.join('');
};`,
    jsWalkthrough:
      'Example: s = "hello"\n' +
      'chars = ["h","e","l","l","o"]\n' +
      'leftPtr=0, rightPtr=4\n\n' +
      'Advance left: h not vowel → leftPtr=1 (e is vowel → stop)\n' +
      'Advance right: o is vowel → stop at rightPtr=4\n' +
      'Swap chars[1]="e" and chars[4]="o"\n' +
      'chars = ["h","o","l","l","e"]\n' +
      'leftPtr=2, rightPtr=3\n\n' +
      'Advance left: l not vowel → leftPtr=3\n' +
      'Advance right: l not vowel → rightPtr=2\n' +
      'leftPtr(3) > rightPtr(2) → stop\n\n' +
      'Result: "holle"',
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
    intuition:
      'A queue is the perfect data structure for a sliding window - new values enter at the back, old values leave from the front. A running sum avoids recalculating the average from scratch each time, giving O(1) per operation.',
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
    this.windowSize = size;
    this.window = [];    // queue of values in the current window
    this.runningSum = 0; // sum of all values in the window
};

MovingAverage.prototype.next = function(val) {
    // Add new value to the window
    this.window.push(val);
    this.runningSum += val;

    // If window exceeds maximum size, evict the oldest value
    if (this.window.length > this.windowSize) {
        const evicted = this.window.shift();
        this.runningSum -= evicted;
    }

    // Average over the current window
    return this.runningSum / this.window.length;
};`,
    jsWalkthrough:
      'Example: size = 3\n' +
      'next(1): window=[1], sum=1 → avg=1/1=1.0\n' +
      'next(10): window=[1,10], sum=11 → avg=11/2=5.5\n' +
      'next(3): window=[1,10,3], sum=14 → avg=14/3≈4.667\n' +
      'next(5): window=[1,10,3,5] → length 4 > size 3\n' +
      '  evict oldest (1): window=[10,3,5], sum=14-1+5=18\n' +
      '  avg=18/3=6.0',
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
    intuition:
      'Instead of checking the entire board after each move, track cumulative sums per row, column, and diagonal. Player 1 adds +1, player 2 adds -1. When any sum reaches +n or -n, that line is complete. This reduces each move check to O(1).',
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
    this.boardSize = n;

    // Track cumulative sums per row and column
    // Player 1 adds +1, player 2 adds -1
    // A win occurs when any sum reaches +n (player 1) or -n (player 2)
    this.rowSums = new Array(n).fill(0);
    this.colSums = new Array(n).fill(0);

    // Two diagonals: top-left to bottom-right, and top-right to bottom-left
    this.diagSum = 0;
    this.antiDiagSum = 0;
};

TicTacToe.prototype.move = function(row, col, player) {
    const contribution = player === 1 ? 1 : -1;

    // Update row and column sums
    this.rowSums[row] += contribution;
    this.colSums[col] += contribution;

    // Update diagonal if on the main diagonal (row === col)
    if (row === col) {
        this.diagSum += contribution;
    }

    // Update anti-diagonal if on it (row + col === n-1)
    if (row + col === this.boardSize - 1) {
        this.antiDiagSum += contribution;
    }

    // Check if this move completed a full line for the current player
    const winValue = this.boardSize;
    if (Math.abs(this.rowSums[row]) === winValue ||
        Math.abs(this.colSums[col]) === winValue ||
        Math.abs(this.diagSum) === winValue ||
        Math.abs(this.antiDiagSum) === winValue) {
        return player;
    }

    return 0; // no winner yet
};`,
    jsWalkthrough:
      'Example: n=3\n' +
      'move(0,0,1): rowSums[0]=1, colSums[0]=1, diagSum=1, antiDiag unchanged\n' +
      'move(0,2,2): rowSums[0]=0, colSums[2]=-1, antiDiagSum=-1\n' +
      'move(2,2,1): rowSums[2]=1, colSums[2]=0, diagSum=2, antiDiag unchanged\n' +
      'move(1,1,2): rowSums[1]=-1, colSums[1]=-1, diagSum=1, antiDiagSum=-2\n' +
      'move(2,0,1): rowSums[2]=2, colSums[0]=2, antiDiagSum=-1\n' +
      '  |rowSums[2]|=2 ≠ 3\n' +
      'move(1,0,2): rowSums[1]=-2, colSums[0]=1\n' +
      'move(2,1,1): rowSums[2]=3 → |3|=3=n → player 1 wins!',
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
    intuition:
      'Sets automatically handle duplicates and provide O(1) lookups. Convert both arrays to sets and take their intersection. This is the simplest approach and runs in linear time.',
    approach:
      'Convert both arrays to sets and compute the set intersection.',
    code: `class Solution:
    def intersection(self, nums1: list[int], nums2: list[int]) -> list[int]:
        return list(set(nums1) & set(nums2))`,
    jsCode: `var intersection = function(nums1, nums2) {
    // Sets automatically deduplicate and provide O(1) lookups
    const uniqueNums1 = new Set(nums1);
    const uniqueNums2 = new Set(nums2);

    // Keep only elements present in both sets
    const result = [];
    for (const num of uniqueNums1) {
        if (uniqueNums2.has(num)) {
            result.push(num);
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: nums1 = [1,2,2,1], nums2 = [2,2]\n' +
      'uniqueNums1 = {1, 2}\n' +
      'uniqueNums2 = {2}\n\n' +
      'Iterate uniqueNums1:\n' +
      '  num=1: uniqueNums2.has(1)? no → skip\n' +
      '  num=2: uniqueNums2.has(2)? yes → push 2\n\n' +
      'Result: [2]',
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
    intuition:
      'A frequency map counts how many of each element you have available. Walk through the second array, and whenever you find a match with remaining count, include it and decrement. This naturally handles duplicates and respects multiplicity.',
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
    // Count how many of each value nums1 has available to "match"
    const availableCount = new Map();
    for (const num of nums1) {
        availableCount.set(num, (availableCount.get(num) || 0) + 1);
    }

    const result = [];

    // For each value in nums2, use it if there are still matches available
    for (const num of nums2) {
        const remaining = availableCount.get(num) || 0;
        if (remaining > 0) {
            result.push(num);
            // Decrement so we don't match the same element more than once
            availableCount.set(num, remaining - 1);
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: nums1 = [1,2,2,1], nums2 = [2,2]\n' +
      'availableCount from nums1: {1:2, 2:2}\n\n' +
      'Process nums2:\n' +
      '  num=2: remaining=2 > 0 → push 2, availableCount[2]=1\n' +
      '  num=2: remaining=1 > 0 → push 2, availableCount[2]=0\n\n' +
      'Result: [2,2]',
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
    intuition:
      'Maintain sorted intervals and merge on each insertion. When a new number arrives, check if it extends or bridges existing intervals. The sorted structure lets you quickly find neighbors to merge with.',
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
    // Sorted array of [start, end] intervals, maintained in order
    this.intervals = [];
};

SummaryRanges.prototype.addNum = function(value) {
    // The new interval starts and ends at value (we'll expand it during merging)
    let newStart = value;
    let newEnd = value;

    const mergedIntervals = [];
    let hasInserted = false;

    for (const [existingStart, existingEnd] of this.intervals) {
        if (existingEnd + 1 < newStart) {
            // Existing interval is entirely before the new one — keep it as-is
            mergedIntervals.push([existingStart, existingEnd]);
        } else if (newEnd + 1 < existingStart) {
            // Existing interval is entirely after the new one
            // Insert the new interval first (in sorted order), then keep existing
            if (!hasInserted) {
                mergedIntervals.push([newStart, newEnd]);
                hasInserted = true;
            }
            mergedIntervals.push([existingStart, existingEnd]);
        } else {
            // Intervals overlap or are adjacent — merge them
            newStart = Math.min(newStart, existingStart);
            newEnd = Math.max(newEnd, existingEnd);
        }
    }

    // If no interval came after the new one, append it at the end
    if (!hasInserted) {
        mergedIntervals.push([newStart, newEnd]);
    }

    this.intervals = mergedIntervals;
};

SummaryRanges.prototype.getIntervals = function() {
    return this.intervals;
};`,
    jsWalkthrough:
      'Example: addNum(1), addNum(3), addNum(7), addNum(2), addNum(6)\n\n' +
      'addNum(1): intervals=[] → push [1,1] → [[1,1]]\n' +
      'addNum(3): [1,1] end+1=2 < 3 → keep; insert [3,3] → [[1,1],[3,3]]\n' +
      'addNum(7): [1,1] before, [3,3] before; insert [7,7] → [[1,1],[3,3],[7,7]]\n' +
      'addNum(2): [1,1] adjacent (end+1=2=newStart) → merge: newStart=1,newEnd=2\n' +
      '           [3,3] adjacent (newEnd+1=3=start) → merge: newStart=1,newEnd=3\n' +
      '           [7,7] after → insert [1,3] then keep [7,7]\n' +
      '           → [[1,3],[7,7]]\n' +
      'addNum(6): [1,3] before; [7,7] adjacent to 6 → merge: [6,7]\n' +
      '           → [[1,3],[6,7]]\n' +
      'getIntervals(): [[1,3],[6,7]]',
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
    intuition:
      'The clever trick is reducing a 2D problem to 1D. Sort by width ascending, but use DESCENDING height for same-width envelopes. This prevents selecting two same-width envelopes. Then finding the longest increasing subsequence on heights gives the answer.',
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
    // Sort by width ascending; for same width, sort by height DESCENDING
    // The descending height prevents two envelopes of the same width from both being selected
    envelopes.sort((a, b) => {
        if (a[0] !== b[0]) {
            return a[0] - b[0]; // ascending width
        }
        return b[1] - a[1]; // descending height for same width
    });

    // Now find the Longest Increasing Subsequence on heights
    // dp[i] = smallest tail of any increasing subsequence of length i+1
    const dp = [];

    for (const [, height] of envelopes) {
        // Binary search: find the first index in dp where dp[index] >= height
        let lo = 0;
        let hi = dp.length;

        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            if (dp[mid] < height) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }

        // Replace or extend dp
        dp[lo] = height;
    }

    return dp.length;
};`,
    jsWalkthrough:
      'Example: envelopes = [[5,4],[6,4],[6,7],[2,3]]\n' +
      'After sort: [[2,3],[5,4],[6,7],[6,4]]\n' +
      '  (same width 6: height 7 before 4, descending)\n\n' +
      'LIS on heights: [3,4,7,4]\n' +
      'h=3: lo=0, dp=[3]\n' +
      'h=4: 3<4 → lo=1, dp=[3,4]\n' +
      'h=7: 4<7 → lo=2, dp=[3,4,7]\n' +
      'h=4: binary search → lo=1 (dp[1]=4, replace)\n' +
      '  dp=[3,4,7] (length unchanged)\n\n' +
      'Result: dp.length = 3 → max 3 envelopes nested',
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
    intuition:
      'Greedy with a max-heap: always place the most frequent character available. After placing it, put it on cooldown for k positions. If no character is available (heap empty but cooldown queue not), the rearrangement is impossible.',
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

    // Count character frequencies
    const charCounts = new Map();
    for (const char of s) {
        charCounts.set(char, (charCounts.get(char) || 0) + 1);
    }

    // Build a sorted "heap" (highest frequency first)
    let available = [...charCounts.entries()].sort((a, b) => b[1] - a[1]);

    const result = [];
    // Cooldown queue: [char, remainingCount, canUseAtPosition]
    const cooldown = [];

    while (available.length > 0 || cooldown.length > 0) {
        // Release characters whose cooldown has expired
        const stillCooling = [];
        for (const [char, count, releaseAt] of cooldown) {
            if (releaseAt <= result.length) {
                available.push([char, count]); // ready to use again
            } else {
                stillCooling.push([char, count, releaseAt]);
            }
        }

        // Re-sort to pick the highest frequency available character
        available.sort((a, b) => b[1] - a[1]);

        if (available.length === 0) {
            // No character available but still in cooldown → impossible
            if (stillCooling.length > 0) return '';
            break;
        }

        // Greedily pick the most frequent character
        const [chosenChar, chosenCount] = available.shift();
        result.push(chosenChar);

        // Put it on cooldown if it still has remaining count
        if (chosenCount - 1 > 0) {
            const canUseAt = result.length + k - 1;
            stillCooling.push([chosenChar, chosenCount - 1, canUseAt]);
        }

        cooldown.length = 0;
        cooldown.push(...stillCooling);
    }

    return result.join('');
};`,
    jsWalkthrough:
      'Example: s = "aabbcc", k = 3\n' +
      'charCounts: {a:2, b:2, c:2}\n' +
      'available: [[a,2],[b,2],[c,2]]\n\n' +
      'Step 1: pick "a" (freq=2), result=["a"], cooldown=[["a",1,at3]]\n' +
      'Step 2: pick "b", result=["a","b"], cooldown=[["a",1,at3],["b",1,at4]]\n' +
      'Step 3: pick "c", result=["a","b","c"], cooldown=[["a",1,3],["b",1,4],["c",1,at5]]\n' +
      'Step 4: releaseAt=3 <= 3 → "a" released\n' +
      '        pick "a" → result=["a","b","c","a"]\n' +
      '...continues: "abcabc"',
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
    intuition:
      'Store the next allowed print time for each message in a hash map. When a message arrives, compare the timestamp against the stored value. If enough time has passed, allow it and update the next allowed time. Simple and O(1) per call.',
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
    // Maps each message to the next timestamp at which it is allowed to print
    this.nextAllowedTime = new Map();
};

Logger.prototype.shouldPrintMessage = function(timestamp, message) {
    const nextAllowed = this.nextAllowedTime.get(message);

    // Allow printing if: message is new OR enough time has passed since last print
    const canPrint = nextAllowed === undefined || timestamp >= nextAllowed;

    if (canPrint) {
        // Schedule next allowed print time 10 seconds from now
        this.nextAllowedTime.set(message, timestamp + 10);
        return true;
    }

    return false;
};`,
    jsWalkthrough:
      'Example: [[1,"foo"],[2,"bar"],[3,"foo"],[8,"bar"],[10,"foo"],[11,"foo"]]\n\n' +
      't=1,  "foo": new → allow, nextAllowed["foo"]=11, return true\n' +
      't=2,  "bar": new → allow, nextAllowed["bar"]=12, return true\n' +
      't=3,  "foo": 3 < 11 → block, return false\n' +
      't=8,  "bar": 8 < 12 → block, return false\n' +
      't=10, "foo": 10 < 11 → block, return false\n' +
      't=11, "foo": 11 >= 11 → allow, nextAllowed["foo"]=21, return true',
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
    intuition:
      'A queue of timestamps naturally represents a sliding time window. New hits go in the back, and expired hits (older than 300 seconds) are removed from the front. The queue size at any point is the hit count.',
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
    // Queue of timestamps for hits recorded in the last 300 seconds
    this.hitTimestamps = [];
};

HitCounter.prototype.hit = function(timestamp) {
    // Record the new hit
    this.hitTimestamps.push(timestamp);
};

HitCounter.prototype.getHits = function(timestamp) {
    // Remove all hits that are older than 300 seconds from the query time
    const expiryCutoff = timestamp - 300;
    while (this.hitTimestamps.length > 0 && this.hitTimestamps[0] <= expiryCutoff) {
        this.hitTimestamps.shift();
    }

    // Remaining hits are all within the past 300 seconds
    return this.hitTimestamps.length;
};`,
    jsWalkthrough:
      'Example: hit(1), hit(2), hit(3), getHits(4), hit(300), getHits(300), getHits(301)\n\n' +
      'hit(1): timestamps=[1]\n' +
      'hit(2): timestamps=[1,2]\n' +
      'hit(3): timestamps=[1,2,3]\n' +
      'getHits(4): cutoff=4-300=-296, none expire → return 3\n' +
      'hit(300): timestamps=[1,2,3,300]\n' +
      'getHits(300): cutoff=0, none expire → return 4\n' +
      'getHits(301): cutoff=1, hits[0]=1 ≤ 1 → remove 1\n' +
      '  timestamps=[2,3,300] → return 3',
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
    intuition:
      'Instead of actually removing leaves iteratively, compute each node\'s \'height from the bottom\' (distance to its farthest leaf descendant). Leaves have height 0, their parents height 1, etc. Group nodes by height to get the removal order in a single pass.',
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
    const groups = []; // groups[height] = list of node values at that height

    // Returns the "height from bottom" of each node
    // Leaves have height 0, their parents height 1, etc.
    const computeHeight = (node) => {
        if (!node) return -1;

        const leftHeight = computeHeight(node.left);
        const rightHeight = computeHeight(node.right);

        // Height = distance to the farthest leaf descendant
        const nodeHeight = Math.max(leftHeight, rightHeight) + 1;

        // Initialize a new group if this height hasn't been seen
        if (nodeHeight === groups.length) {
            groups.push([]);
        }

        // Add this node's value to the appropriate group
        groups[nodeHeight].push(node.val);

        return nodeHeight;
    };

    computeHeight(root);
    return groups;
};`,
    jsWalkthrough:
      'Example: root = [1,2,3,4,5]\n' +
      'Tree:      1\n' +
      '          / \\\n' +
      '         2   3\n' +
      '        / \\\n' +
      '       4   5\n\n' +
      'computeHeight(4): left=-1, right=-1 → height=0 → groups[0]=[4]\n' +
      'computeHeight(5): left=-1, right=-1 → height=0 → groups[0]=[4,5]\n' +
      'computeHeight(2): left=0, right=0 → height=1 → groups[1]=[2]\n' +
      'computeHeight(3): left=-1, right=-1 → height=0 → groups[0]=[4,5,3]\n' +
      'computeHeight(1): left=1, right=0 → height=2 → groups[2]=[1]\n\n' +
      'Result: [[4,5,3],[2],[1]]',
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
    intuition:
      'Binary search for the square root: if mid*mid equals the number, it is a perfect square. The search space [1, num] is halved each iteration, making this O(log n). Much faster than checking every number up to sqrt(n).',
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
    // Binary search for an integer x such that x * x === num
    let lo = 1;
    let hi = num;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const midSquared = mid * mid;

        if (midSquared === num) {
            // Found the exact square root
            return true;
        } else if (midSquared < num) {
            // Square root is larger — search right half
            lo = mid + 1;
        } else {
            // Square root is smaller — search left half
            hi = mid - 1;
        }
    }

    return false; // no integer x with x*x === num
};`,
    jsWalkthrough:
      'Example: num = 16\n' +
      'lo=1, hi=16\n\n' +
      'mid=8: 8*8=64 > 16 → hi=7\n' +
      'mid=4: 4*4=16 === 16 → return true\n\n' +
      'Example: num = 14\n' +
      'mid=7: 49 > 14 → hi=6\n' +
      'mid=3: 9 < 14 → lo=4\n' +
      'mid=5: 25 > 14 → hi=4\n' +
      'mid=4: 16 > 14 → hi=3\n' +
      'lo=4 > hi=3 → return false',
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
    intuition:
      'Sort the array so divisibility only needs to be checked in one direction. Then this becomes like Longest Increasing Subsequence, but with divisibility replacing the \'increasing\' condition. Use parent pointers to reconstruct the actual subset.',
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
    // Sort ascending so divisibility only needs checking in one direction
    nums.sort((a, b) => a - b);
    const n = nums.length;

    // dp[i] = size of the largest divisible subset ending at nums[i]
    const dp = new Array(n).fill(1);

    // parent[i] = index of the previous element in the best subset ending at i
    const parent = new Array(n).fill(-1);

    // Track which index has the largest subset so far
    let bestEndIndex = 0;

    for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
            // nums[i] is divisible by nums[j] → we can extend the subset ending at j
            const isDivisible = nums[i] % nums[j] === 0;
            const isLonger = dp[j] + 1 > dp[i];

            if (isDivisible && isLonger) {
                dp[i] = dp[j] + 1;
                parent[i] = j; // remember we came from j
            }
        }

        if (dp[i] > dp[bestEndIndex]) {
            bestEndIndex = i;
        }
    }

    // Reconstruct the subset by following parent pointers
    const result = [];
    let current = bestEndIndex;
    while (current !== -1) {
        result.push(nums[current]);
        current = parent[current];
    }

    return result.reverse();
};`,
    jsWalkthrough:
      'Example: nums = [1,2,3]\n' +
      'sorted: [1,2,3]\n' +
      'dp = [1,1,1], parent = [-1,-1,-1]\n\n' +
      'i=1 (num=2): j=0: 2%1=0 → dp[1]=2, parent[1]=0\n' +
      'i=2 (num=3): j=0: 3%1=0 → dp[2]=2, parent[2]=0\n' +
      '             j=1: 3%2≠0 → skip\n\n' +
      'bestEndIndex=1 (dp[1]=2=dp[2]=2, first wins)\n' +
      'Reconstruct from index 1: nums[1]=2, parent[1]=0 → nums[0]=1\n' +
      'result = [2,1] → reversed: [1,2]',
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
    intuition:
      'Think of this as merging k sorted lists. Each element in nums1 starts a sorted sequence of sums with nums2. A min-heap picks the globally smallest sum, and after popping a pair, you only push its \'next neighbor\' to keep the heap small.',
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

    // Initialize the simulated min-heap with the first pair from each row
    // Each entry: [sum, indexInNums1, indexInNums2]
    const candidates = [];
    for (let i = 0; i < Math.min(k, nums1.length); i++) {
        const initialSum = nums1[i] + nums2[0];
        candidates.push([initialSum, i, 0]);
    }

    // Sort ascending by sum to pick smallest first
    candidates.sort((a, b) => a[0] - b[0]);

    const result = [];

    while (candidates.length > 0 && result.length < k) {
        // Pop the pair with the smallest sum
        const [, idx1, idx2] = candidates.shift();
        result.push([nums1[idx1], nums2[idx2]]);

        // If there is a next element in nums2 for this row, add it as a candidate
        if (idx2 + 1 < nums2.length) {
            const nextSum = nums1[idx1] + nums2[idx2 + 1];
            candidates.push([nextSum, idx1, idx2 + 1]);
            // Re-sort to maintain heap order
            candidates.sort((a, b) => a[0] - b[0]);
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: nums1=[1,7,11], nums2=[2,4,6], k=3\n' +
      'Initial candidates (i+nums2[0]):\n' +
      '  [1+2=3, 0, 0], [7+2=9, 1, 0], [11+2=13, 2, 0]\n' +
      'sorted: [[3,0,0],[9,1,0],[13,2,0]]\n\n' +
      'Step 1: pop [3,0,0] → push [1,2] to result\n' +
      '  next: [1+4=5, 0, 1] → candidates=[[5,0,1],[9,1,0],[13,2,0]]\n' +
      'Step 2: pop [5,0,1] → push [1,4]\n' +
      '  next: [1+6=7, 0, 2] → candidates=[[7,0,2],[9,1,0],[13,2,0]]\n' +
      'Step 3: pop [7,0,2] → push [1,6]\n' +
      'Result: [[1,2],[1,4],[1,6]]',
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
    intuition:
      'This is the classic binary search pattern applied to a guessing game. Each guess eliminates half the remaining possibilities. The API feedback tells you which half to keep searching.',
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
    let lo = 1;
    let hi = n;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);

        // API: guess(n) returns 0 if correct, -1 if picked < n, 1 if picked > n
        const feedback = guess(mid);

        if (feedback === 0) {
            // Correct guess
            return mid;
        } else if (feedback === -1) {
            // Picked number is lower than mid — search the left half
            hi = mid - 1;
        } else {
            // Picked number is higher than mid — search the right half
            lo = mid + 1;
        }
    }

    return lo; // should always be found before here
};`,
    jsWalkthrough:
      'Example: n = 10, pick = 6\n' +
      'lo=1, hi=10\n\n' +
      'mid=5: guess(5) → 1 (picked > 5) → lo=6\n' +
      'mid=8: guess(8) → -1 (picked < 8) → hi=7\n' +
      'mid=6: guess(6) → 0 (correct!) → return 6',
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
    intuition:
      'A wiggle sequence alternates between going up and going down. Track the longest sequence ending with an up-move and with a down-move separately. An up extends the best down, and vice versa - they leapfrog each other.',
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

    // Track the longest wiggle subsequence ending with an upward move
    // and the longest ending with a downward move
    let longestEndingUp = 1;
    let longestEndingDown = 1;

    for (let i = 1; i < nums.length; i++) {
        if (nums[i] > nums[i - 1]) {
            // This is an upward move: extend the best downward-ending sequence
            longestEndingUp = longestEndingDown + 1;
        } else if (nums[i] < nums[i - 1]) {
            // This is a downward move: extend the best upward-ending sequence
            longestEndingDown = longestEndingUp + 1;
        }
        // If equal, no change — skip
    }

    return Math.max(longestEndingUp, longestEndingDown);
};`,
    jsWalkthrough:
      'Example: nums = [1,7,4,9,2,5]\n' +
      'endUp=1, endDown=1\n\n' +
      'i=1: 7>1 → up move → endUp=endDown+1=2\n' +
      'i=2: 4<7 → down move → endDown=endUp+1=3\n' +
      'i=3: 9>4 → up move → endUp=endDown+1=4\n' +
      'i=4: 2<9 → down move → endDown=endUp+1=5\n' +
      'i=5: 5>2 → up move → endUp=endDown+1=6\n' +
      'Result: max(6,5) = 6',
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
    intuition:
      'This is like the coin change problem but order matters. By looping over target amounts first (outer) and numbers second (inner), you count permutations rather than combinations. Each amount accumulates all ways to reach it using any number last.',
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
    // dp[amount] = number of ordered sequences that sum to amount
    const dp = new Array(target + 1).fill(0);

    // Base case: exactly one way to make sum 0 (use no numbers)
    dp[0] = 1;

    // Fill dp bottom-up: for each amount, try all numbers as the last element
    for (let amount = 1; amount <= target; amount++) {
        for (const num of nums) {
            if (amount >= num) {
                // Using 'num' as the last element in the sequence
                // adds all ways to form (amount - num) to ways to form amount
                dp[amount] += dp[amount - num];
            }
        }
    }

    return dp[target];
};`,
    jsWalkthrough:
      'Example: nums = [1,2,3], target = 4\n' +
      'dp = [1,0,0,0,0]\n\n' +
      'amount=1: num=1: dp[1]+=dp[0]=1 → dp=[1,1,0,0,0]\n' +
      'amount=2: num=1: dp[2]+=dp[1]=1\n' +
      '          num=2: dp[2]+=dp[0]=1 → dp[2]=2\n' +
      'amount=3: num=1: dp[3]+=dp[2]=2\n' +
      '          num=2: dp[3]+=dp[1]=1\n' +
      '          num=3: dp[3]+=dp[0]=1 → dp[3]=4\n' +
      'amount=4: num=1: dp[4]+=dp[3]=4\n' +
      '          num=2: dp[4]+=dp[2]=2\n' +
      '          num=3: dp[4]+=dp[1]=1 → dp[4]=7\n' +
      'Result: 7',
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
    intuition:
      'Binary search on values (not indices) is the key insight. For a candidate value, count how many matrix elements are smaller by walking the matrix staircase-style from the bottom-left corner. This count guides the binary search.',
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

    // Binary search over the VALUE range [smallest, largest]
    let lo = matrix[0][0];
    let hi = matrix[n - 1][n - 1];

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);

        // Count elements <= mid using the staircase walk from bottom-left
        // Start at bottom-left corner (largest in first col, smallest in last row)
        let count = 0;
        let col = n - 1; // start at rightmost column

        for (let row = 0; row < n; row++) {
            // Move left while value in current column > mid
            while (col >= 0 && matrix[row][col] > mid) {
                col--;
            }
            // All elements in this row up to column col are <= mid
            count += col + 1;
        }

        if (count < k) {
            lo = mid + 1; // not enough elements <= mid, search higher
        } else {
            hi = mid; // enough elements, search lower or equal
        }
    }

    // lo converges to the exact kth smallest value
    return lo;
};`,
    jsWalkthrough:
      'Example: matrix=[[1,5,9],[10,11,13],[12,13,15]], k=8\n' +
      'lo=1, hi=15\n\n' +
      'mid=8: count elements <=8\n' +
      '  row0: col starts at 2, matrix[0][2]=9>8 → col=1, matrix[0][1]=5≤8 → col=1 → count+=2\n' +
      '  row1: matrix[1][1]=11>8→col=0, matrix[1][0]=10>8→col=-1 → count+=0\n' +
      '  row2: same → count+=0 → total=2 < k=8 → lo=9\n\n' +
      'mid=12: count elements <=12\n' +
      '  row0: all ≤12 → count+=3\n' +
      '  row1: 13>12→col=1, 11≤12 → count+=2\n' +
      '  row2: 15>12→col=1, 13>12→col=0, 12≤12 → count+=1 → total=6 < 8 → lo=13\n\n' +
      'mid=13: count=8 >= 8 → hi=13\n' +
      'lo=hi=13 → return 13',
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
    intuition:
      'Extend RandomizedSet to handle duplicates by mapping each value to a SET of indices instead of a single index. The swap-and-pop trick still works for O(1) removal - just update the index sets carefully during the swap.',
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
    // vals[i] = value at index i (may have duplicates)
    this.vals = [];
    // idxMap maps each value to the SET of indices where it appears in vals
    this.idxMap = new Map();
};

RandomizedCollection.prototype.insert = function(val) {
    // First occurrence if no indices exist for this value
    const isFirstOccurrence = !this.idxMap.has(val) || this.idxMap.get(val).size === 0;

    if (!this.idxMap.has(val)) {
        this.idxMap.set(val, new Set());
    }

    // Track this new occurrence at the end of vals
    this.idxMap.get(val).add(this.vals.length);
    this.vals.push(val);

    return isFirstOccurrence;
};

RandomizedCollection.prototype.remove = function(val) {
    if (!this.idxMap.has(val) || this.idxMap.get(val).size === 0) return false;

    // Pick any index where val appears (just grab one from the set)
    const targetIdx = this.idxMap.get(val).values().next().value;
    this.idxMap.get(val).delete(targetIdx);

    // Swap the target with the last element (swap-and-pop for O(1) removal)
    const lastVal = this.vals[this.vals.length - 1];
    const lastIdx = this.vals.length - 1;

    this.vals[targetIdx] = lastVal;

    // Update the last element's index set: it moved from lastIdx to targetIdx
    this.idxMap.get(lastVal).add(targetIdx);
    this.idxMap.get(lastVal).delete(lastIdx);

    this.vals.pop();
    return true;
};

RandomizedCollection.prototype.getRandom = function() {
    // Random access from the flat array gives correct probability proportional to count
    const randomIdx = Math.floor(Math.random() * this.vals.length);
    return this.vals[randomIdx];
};`,
    jsWalkthrough:
      'Example: insert(1), insert(1), insert(2), remove(1), getRandom()\n\n' +
      'insert(1): vals=[1], idxMap={1:{0}} → return true (first)\n' +
      'insert(1): vals=[1,1], idxMap={1:{0,1}} → return false (duplicate)\n' +
      'insert(2): vals=[1,1,2], idxMap={1:{0,1},2:{2}} → return true\n\n' +
      'remove(1): targetIdx=0, lastVal=2 at lastIdx=2\n' +
      '  vals[0]=2, idxMap[2]={0} (was {2}), idxMap[1]={1}\n' +
      '  pop → vals=[2,1]\n\n' +
      'getRandom(): random from [2,1] — 2 has 1/2 chance, 1 has 1/2 chance',
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
    intuition:
      'Reservoir Sampling is designed for selecting random elements from streams of unknown length. For the ith element, keep it with probability 1/i. Mathematically, this guarantees each element has equal probability of being the final selection.',
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
    // Reservoir sampling: ensures each node has equal probability of being chosen
    // even though we don't know the list length in advance

    let chosen = 0;    // the current reservoir (value to return)
    let node = this.head;
    let position = 1;  // 1-indexed position in the traversal

    while (node) {
        // Replace the current choice with this node with probability 1/position
        const shouldReplace = Math.floor(Math.random() * position) === 0;
        if (shouldReplace) {
            chosen = node.val;
        }

        node = node.next;
        position++;
    }

    // Proof: P(node i is chosen) = (1/i) * (i/(i+1)) * ... * ((n-1)/n) = 1/n ✓
    return chosen;
};`,
    jsWalkthrough:
      'Example: list = [1,2,3] (n=3)\n\n' +
      'position=1, node=1: P(replace)=1/1=1 → chosen=1\n' +
      'position=2, node=2: P(replace)=1/2 → chosen=2 (50% chance)\n' +
      'position=3, node=3: P(replace)=1/3 → chosen=3 (33% chance)\n\n' +
      'Final P(return 1) = 1 * (1/2) * (2/3) = 1/3 ✓\n' +
      'Final P(return 2) = (1/2) * (2/3) = 1/3 ✓\n' +
      'Final P(return 3) = 1/3 ✓',
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
    intuition:
      'Think of the magazine as a pool of available letters. Count what is available, then check if each letter needed for the ransom note can be drawn from that pool. If you run out of any letter, construction is impossible.',
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
    // Count available letters from the magazine
    const availableLetters = new Map();
    for (const char of magazine) {
        availableLetters.set(char, (availableLetters.get(char) || 0) + 1);
    }

    // Check if each letter needed for the ransom note is available
    for (const char of ransomNote) {
        const remaining = availableLetters.get(char) || 0;

        if (remaining <= 0) {
            // This letter is either missing or used up
            return false;
        }

        // Use one occurrence of this letter
        availableLetters.set(char, remaining - 1);
    }

    return true;
};`,
    jsWalkthrough:
      'Example: ransomNote = "aa", magazine = "aab"\n' +
      'availableLetters from magazine: {a:2, b:1}\n\n' +
      'Process ransomNote:\n' +
      '  char="a": remaining=2 > 0 → use it → availableLetters[a]=1\n' +
      '  char="a": remaining=1 > 0 → use it → availableLetters[a]=0\n\n' +
      'Result: true\n\n' +
      'Counterexample: ransomNote="aab", magazine="aa"\n' +
      '  char="b": remaining=0 → return false',
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
    intuition:
      'Fisher-Yates shuffle is the gold standard for uniform random permutations. For each position from the end, swap with a random earlier position (including itself). Each of the n! permutations is equally likely - a beautiful mathematical guarantee.',
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
    // Store original for reset
    this.original = [...nums];
    this.current = nums;
};

Solution.prototype.reset = function() {
    // Restore current to a copy of the original
    this.current = [...this.original];
    return this.current;
};

Solution.prototype.shuffle = function() {
    // Fisher-Yates (Knuth) shuffle: guarantees uniform random permutation
    for (let i = this.current.length - 1; i > 0; i--) {
        // Pick a random index from [0, i] inclusive
        const randomIdx = Math.floor(Math.random() * (i + 1));

        // Swap current[i] with current[randomIdx]
        const temp = this.current[i];
        this.current[i] = this.current[randomIdx];
        this.current[randomIdx] = temp;
    }
    return this.current;
};`,
    jsWalkthrough:
      'Example: nums = [1,2,3]\n\n' +
      'shuffle(): current=[1,2,3]\n' +
      'i=2: randomIdx=1 → swap current[2] and current[1]: [1,3,2]\n' +
      'i=1: randomIdx=0 → swap current[1] and current[0]: [3,1,2]\n' +
      'Result: [3,1,2]\n\n' +
      'reset(): current = [1,2,3] (restored from original)\n\n' +
      'Why uniform? At each step i, element at position i has 1/(i+1) probability\n' +
      'of being placed there, and the product gives each permutation prob 1/n!',
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
    intuition:
      'Two passes: first count every character\'s frequency, then find the first one with count 1. The first pass builds the frequency map, and the second pass checks characters in their original order to find the first unique one.',
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
    // First pass: count how many times each character appears
    const charFrequency = new Map();
    for (const char of s) {
        charFrequency.set(char, (charFrequency.get(char) || 0) + 1);
    }

    // Second pass: find the first character that appears exactly once
    for (let i = 0; i < s.length; i++) {
        if (charFrequency.get(s[i]) === 1) {
            return i; // this character is unique — return its index
        }
    }

    return -1; // no unique character found
};`,
    jsWalkthrough:
      'Example: s = "leetcode"\n' +
      'charFrequency: {l:1, e:3, t:1, c:1, o:1, d:1}\n\n' +
      'Second pass:\n' +
      '  i=0, char="l": frequency=1 → return 0\n\n' +
      'Example: s = "aabb"\n' +
      'charFrequency: {a:2, b:2}\n' +
      'Second pass: no char with frequency=1 → return -1',
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
    intuition:
      'XOR is perfect for finding the \'odd one out.\' Since every character from the original string appears in both s and t, they cancel out when XORed. Only the added character remains - like finding the extra item by process of elimination.',
    approach:
      'XOR all characters in s and t. Since each original character appears in both, they cancel out, leaving only the added character.',
    code: `class Solution:
    def findTheDifference(self, s: str, t: str) -> str:
        result = 0
        for c in s + t:
            result ^= ord(c)
        return chr(result)`,
    jsCode: `var findTheDifference = function(s, t) {
    // XOR trick: x ^ x = 0 (pairs cancel), x ^ 0 = x (remainder stays)
    // XOR every character in both strings — original chars cancel, leaving the added char
    let xorAccumulator = 0;

    for (const char of s) {
        xorAccumulator ^= char.charCodeAt(0);
    }
    for (const char of t) {
        xorAccumulator ^= char.charCodeAt(0);
    }

    // xorAccumulator now equals the char code of the added character
    return String.fromCharCode(xorAccumulator);
};`,
    jsWalkthrough:
      'Example: s = "abcd", t = "abcde"\n' +
      'XOR all of s: a^b^c^d\n' +
      'XOR all of t: a^b^c^d^e\n\n' +
      'Combined: a^a ^ b^b ^ c^c ^ d^d ^ e\n' +
      '        = 0 ^ 0 ^ 0 ^ 0 ^ e\n' +
      '        = e\n\n' +
      'charCode of "e" = 101 → String.fromCharCode(101) = "e"',
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
    intuition:
      'Any character appearing fewer than k times cannot be part of a valid substring - it acts as a natural splitting point. Split the string at those characters and solve each piece recursively. The recursion depth is bounded by the alphabet size (26).',
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
    // Base case: string too short to have any character appearing k times
    if (s.length < k) return 0;

    // Count frequency of each character in s
    const charFrequency = new Map();
    for (const char of s) {
        charFrequency.set(char, (charFrequency.get(char) || 0) + 1);
    }

    // Find any character that appears fewer than k times
    for (const [char, count] of charFrequency) {
        if (count < k) {
            // This character cannot appear in any valid substring
            // Split at this character and solve each piece independently
            const segments = s.split(char);
            const subResults = segments.map(seg => longestSubstring(seg, k));
            return Math.max(...subResults);
        }
    }

    // All characters appear >= k times — entire string is valid
    return s.length;
};`,
    jsWalkthrough:
      'Example: s = "aaabb", k = 3\n' +
      'charFrequency: {a:3, b:2}\n\n' +
      '"b" appears 2 < 3 times → split at "b"\n' +
      'segments = ["aaa", "", ""]\n\n' +
      'longestSubstring("aaa", 3):\n' +
      '  charFrequency: {a:3} → all chars >= 3\n' +
      '  return 3 (entire string valid)\n\n' +
      'longestSubstring("", 3): length 0 < 3 → return 0\n\n' +
      'Result: max(3, 0, 0) = 3',
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
    intuition:
      'Build the smallest number greedily using a monotonic stack. When a new digit is smaller than the stack top, pop the larger digit (using one of your k removals). This ensures the leftmost digits are as small as possible, which has the greatest impact on the number\'s value.',
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
    // Monotonic stack: build the smallest number by removing peaks greedily
    const digitStack = [];

    for (const digit of num) {
        // While the top of the stack is larger than the current digit,
        // removing it makes the number smaller — use up one of our k removals
        while (k > 0 && digitStack.length > 0 && digitStack[digitStack.length - 1] > digit) {
            digitStack.pop();
            k--;
        }
        digitStack.push(digit);
    }

    // If we still have removals left, remove from the right end (largest suffix)
    while (k > 0) {
        digitStack.pop();
        k--;
    }

    // Remove leading zeros and handle the case where result is empty
    const result = digitStack.join('').replace(/^0+/, '');
    return result || '0';
};`,
    jsWalkthrough:
      'Example: num = "1432219", k = 3\n' +
      'stack=[], k=3\n\n' +
      'd="1": stack=[1]\n' +
      'd="4": 4>1? no → stack=[1,4]\n' +
      'd="3": 4>3 and k>0 → pop 4, k=2 → stack=[1,3]\n' +
      'd="2": 3>2 and k>0 → pop 3, k=1 → 1<2 → push → stack=[1,2]\n' +
      'd="2": 2=2 → stack=[1,2,2]\n' +
      'd="1": 2>1 and k>0 → pop 2, k=0 → stack=[1,2,1]\n' +
      'd="9": k=0, just push → stack=[1,2,1,9]\n\n' +
      'Result: "1219"',
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
    intuition:
      'Track which jump sizes can reach each stone position. Starting from stone 0 with jump size 0, each stone propagates three possible next jumps (k-1, k, k+1) to reachable positions. If the last stone has any valid jump sizes, the frog can cross.',
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
    // Map from stone position → set of jump sizes that can reach this stone
    const reachableWith = new Map();
    for (const stonePos of stones) {
        reachableWith.set(stonePos, new Set());
    }

    // The frog starts at position 0, about to make its first jump (size 0 means "just arrived")
    reachableWith.get(0).add(0);

    for (const stonePos of stones) {
        // Try all jump sizes that got us to this stone
        for (const prevJumpSize of reachableWith.get(stonePos)) {
            // The next jump can be k-1, k, or k+1 (but not 0 or negative)
            for (const nextJumpSize of [prevJumpSize - 1, prevJumpSize, prevJumpSize + 1]) {
                if (nextJumpSize <= 0) continue; // must jump at least 1

                const nextPosition = stonePos + nextJumpSize;

                // Only jump to valid stone positions
                if (reachableWith.has(nextPosition)) {
                    reachableWith.get(nextPosition).add(nextJumpSize);
                }
            }
        }
    }

    // Frog can reach the last stone if any jump size leads there
    return reachableWith.get(stones[stones.length - 1]).size > 0;
};`,
    jsWalkthrough:
      'Example: stones = [0,1,3,5,6,8,12,17]\n' +
      'reachableWith: {0:{0}, 1:{}, 3:{}, 5:{}, 6:{}, 8:{}, 12:{}, 17:{}}\n\n' +
      'pos=0, jumpSize=0: try -1(skip),0(skip),1 → pos 1 exists → {1:{1}}\n' +
      'pos=1, jumpSize=1: try 0(skip),1,2 → pos 2 not a stone; pos 3 exists → {3:{2}}\n' +
      'pos=3, jumpSize=2: try 1,2,3 → pos 4(no),5(yes→{5:{2,3}}),6(yes→{6:{3}})\n' +
      'pos=5: jumpSizes={2,3}: try 1..4 → pos 6{4},8{3,4},7(no)\n' +
      '... eventually pos 17 gets non-empty set → return true',
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
    intuition:
      'A left leaf is identified from the parent\'s perspective - check if the left child exists and has no children of its own. DFS through the tree, adding values only when this condition is met on the left side.',
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

    // Check if the left child is a leaf (exists but has no children)
    const leftChild = root.left;
    const leftChildIsLeaf = leftChild && !leftChild.left && !leftChild.right;

    if (leftChildIsLeaf) {
        // It is a left leaf — add its value directly
        total += leftChild.val;
    } else {
        // It is an internal node or null — recurse to find left leaves deeper
        total += sumOfLeftLeaves(leftChild);
    }

    // Always recurse on the right subtree to find any left leaves there too
    total += sumOfLeftLeaves(root.right);

    return total;
};`,
    jsWalkthrough:
      'Example: root = [3,9,20,null,null,15,7]\n' +
      'Tree:      3\n' +
      '          / \\\n' +
      '         9  20\n' +
      '            / \\\n' +
      '           15   7\n\n' +
      'sumOfLeftLeaves(3):\n' +
      '  leftChild=9, no children → leftChildIsLeaf=true → total+=9\n' +
      '  sumOfLeftLeaves(20):\n' +
      '    leftChild=15, no children → leftChildIsLeaf=true → total+=15\n' +
      '    sumOfLeftLeaves(7): no left child → 0\n' +
      '    return 15\n' +
      '  total = 9+15 = 24',
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
    intuition:
      'Process people from tallest to shortest. Tall people placed first do not care about shorter people inserted later. For each person, their k value directly tells you where to insert them in the result, since only taller-or-equal people (already placed) count.',
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
    // Sort: tallest first (descending height); ties broken by k ascending
    // Reason: taller people placed first won't be affected by shorter people added later
    people.sort((a, b) => {
        if (a[0] !== b[0]) {
            return b[0] - a[0]; // height descending
        }
        return a[1] - b[1]; // k ascending for same height
    });

    const result = [];

    for (const person of people) {
        const [height, kValue] = person;
        // Insert at position kValue: there will be exactly kValue people ≥ height before it
        // (all already-placed people are taller or equal, shorter ones haven't been added yet)
        result.splice(kValue, 0, person);
    }

    return result;
};`,
    jsWalkthrough:
      'Example: people = [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]\n' +
      'After sort: [[7,0],[7,1],[6,1],[5,0],[5,2],[4,4]]\n\n' +
      'Insert [7,0] at idx 0: result=[[7,0]]\n' +
      'Insert [7,1] at idx 1: result=[[7,0],[7,1]]\n' +
      'Insert [6,1] at idx 1: result=[[7,0],[6,1],[7,1]]\n' +
      'Insert [5,0] at idx 0: result=[[5,0],[7,0],[6,1],[7,1]]\n' +
      'Insert [5,2] at idx 2: result=[[5,0],[7,0],[5,2],[6,1],[7,1]]\n' +
      'Insert [4,4] at idx 4: result=[[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]\n' +
      'Final: [[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]',
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
    intuition:
      'This extends 1D trapping water to 2D. Start from the boundary (the lowest walls) and work inward using a min-heap. The water level at any inner cell is determined by the lowest path from the boundary to that cell - the heap ensures you always process the lowest barrier first.',
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

    const numRows = heightMap.length;
    const numCols = heightMap[0].length;
    const visited = Array.from({length: numRows}, () => new Array(numCols).fill(false));

    // Simulated min-heap (sorted array of [waterLevel, row, col])
    const heap = [];
    const pushToHeap = (entry) => {
        heap.push(entry);
        heap.sort((a, b) => a[0] - b[0]); // sort by water level ascending
    };

    // Initialize with all boundary cells (they form the outer walls)
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const isBoundary = row === 0 || row === numRows - 1 ||
                               col === 0 || col === numCols - 1;
            if (isBoundary) {
                pushToHeap([heightMap[row][col], row, col]);
                visited[row][col] = true;
            }
        }
    }

    let totalWater = 0;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

    while (heap.length > 0) {
        // Always process the lowest boundary first
        const [waterLevel, row, col] = heap.shift();

        for (const [deltaRow, deltaCol] of dirs) {
            const neighborRow = row + deltaRow;
            const neighborCol = col + deltaCol;

            const inBounds = neighborRow >= 0 && neighborRow < numRows &&
                             neighborCol >= 0 && neighborCol < numCols;

            if (inBounds && !visited[neighborRow][neighborCol]) {
                visited[neighborRow][neighborCol] = true;

                const neighborHeight = heightMap[neighborRow][neighborCol];

                // Water trapped = how much the current boundary level exceeds neighbor's height
                totalWater += Math.max(0, waterLevel - neighborHeight);

                // Effective water level at neighbor = max of its own height and current level
                const effectiveLevel = Math.max(waterLevel, neighborHeight);
                pushToHeap([effectiveLevel, neighborRow, neighborCol]);
            }
        }
    }

    return totalWater;
};`,
    jsWalkthrough:
      'Example: heightMap = [[1,4,3,1],[3,2,1,3],[2,3,3,2],[1,3,3,1]]\n\n' +
      'Init heap with all boundary cells (sorted by height)\n' +
      'Process cell (0,0) height=1, waterLevel=1:\n' +
      '  neighbor (0,1): boundary already visited\n' +
      '  neighbor (1,0): boundary already visited\n' +
      'Process cell (0,3) height=1, waterLevel=1:\n' +
      '  neighbor (1,3): boundary already visited\n' +
      '...\n' +
      'Process cell height=2, neighbor inner cell height=1:\n' +
      '  water += max(0, 2-1) = 1\n' +
      'Continue until all cells visited\n' +
      'Result: 4',
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
    intuition:
      'Two pointers walk through the word and abbreviation simultaneously. When you hit a number in the abbreviation, skip that many characters in the word. When you hit a letter, it must match exactly. Both pointers must reach the end at the same time.',
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
    let wordPtr = 0;  // position in the original word
    let abbrPtr = 0;  // position in the abbreviation

    while (wordPtr < word.length && abbrPtr < abbr.length) {
        const currentAbbrChar = abbr[abbrPtr];

        if (currentAbbrChar >= '0' && currentAbbrChar <= '9') {
            // Reject leading zeros (e.g. "01" is invalid)
            if (currentAbbrChar === '0') return false;

            // Parse the full multi-digit number
            let skipCount = 0;
            while (abbrPtr < abbr.length && abbr[abbrPtr] >= '0' && abbr[abbrPtr] <= '9') {
                skipCount = skipCount * 10 + parseInt(abbr[abbrPtr]);
                abbrPtr++;
            }

            // Skip that many characters in the word
            wordPtr += skipCount;
        } else {
            // Letter in abbreviation must exactly match letter in word
            if (word[wordPtr] !== currentAbbrChar) return false;
            wordPtr++;
            abbrPtr++;
        }
    }

    // Both pointers must reach their respective ends exactly
    return wordPtr === word.length && abbrPtr === abbr.length;
};`,
    jsWalkthrough:
      'Example: word = "internationalization", abbr = "i12iz4n"\n' +
      'wordPtr=0, abbrPtr=0\n\n' +
      'abbr[0]="i": matches word[0]="i" → wordPtr=1, abbrPtr=1\n' +
      'abbr[1]="1", abbr[2]="2": parse 12 → wordPtr=1+12=13, abbrPtr=3\n' +
      'abbr[3]="i": word[13]="i" ✓ → wordPtr=14, abbrPtr=4\n' +
      'abbr[4]="z": word[14]="z" ✓ → wordPtr=15, abbrPtr=5\n' +
      'abbr[5]="4": skip 4 → wordPtr=19, abbrPtr=6\n' +
      'abbr[6]="n": word[19]="n" ✓ → wordPtr=20, abbrPtr=7\n' +
      'wordPtr=20=len, abbrPtr=7=len → return true',
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
    intuition:
      'In a palindrome, characters pair up symmetrically. Each character contributes its even portion (pairs that mirror each other). If any character has an odd count, one extra character can sit in the center. The formula is simple: sum of even parts plus one if any odd exists.',
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
    // Count frequency of each character
    const charCount = new Map();
    for (const char of s) {
        charCount.set(char, (charCount.get(char) || 0) + 1);
    }

    let palindromeLength = 0;
    let hasOddCount = false;

    for (const count of charCount.values()) {
        // Use the even part of each character's count (both sides of the palindrome)
        palindromeLength += Math.floor(count / 2) * 2;

        // If any character has an odd count, one can be placed in the center
        if (count % 2 === 1) {
            hasOddCount = true;
        }
    }

    // Add 1 for the center character if any odd-count char exists
    return palindromeLength + (hasOddCount ? 1 : 0);
};`,
    jsWalkthrough:
      'Example: s = "abccccdd"\n' +
      'charCount: {a:1, b:1, c:4, d:2}\n\n' +
      'a: count=1, even part=0 → length+=0, hasOdd=true\n' +
      'b: count=1, even part=0 → length+=0, hasOdd=true\n' +
      'c: count=4, even part=4 → length+=4\n' +
      'd: count=2, even part=2 → length+=2\n\n' +
      'palindromeLength = 6\n' +
      'hasOddCount = true → +1\n' +
      'Result: 7 (e.g. "dccaccd")',
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
    intuition:
      'FizzBuzz is a straightforward conditional: check divisibility by 15 first (both 3 and 5), then 3, then 5, then default to the number. The order matters because multiples of 15 would otherwise be caught by the 3 or 5 check first.',
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
        const divisibleBy3 = i % 3 === 0;
        const divisibleBy5 = i % 5 === 0;

        if (divisibleBy3 && divisibleBy5) {
            result.push("FizzBuzz");
        } else if (divisibleBy3) {
            result.push("Fizz");
        } else if (divisibleBy5) {
            result.push("Buzz");
        } else {
            result.push(String(i));
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: n = 5\n' +
      'i=1: 1%3≠0, 1%5≠0 → "1"\n' +
      'i=2: 2%3≠0, 2%5≠0 → "2"\n' +
      'i=3: 3%3=0, 3%5≠0 → "Fizz"\n' +
      'i=4: 4%3≠0, 4%5≠0 → "4"\n' +
      'i=5: 5%3≠0, 5%5=0 → "Buzz"\n\n' +
      'Result: ["1","2","Fizz","4","Buzz"]',
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
    intuition:
      'When extending an arithmetic sequence by one element, the number of new subarrays equals the current extension length. For example, extending [1,2,3] to [1,2,3,4] adds subarrays [2,3,4], [1,2,3,4] - two new ones. A running counter captures this pattern.',
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
    // curr = number of NEW arithmetic subarrays ending at the current position
    // When we extend an arithmetic run by one element, we gain 'curr' new subarrays
    let currentRunContribution = 0;
    let totalCount = 0;

    for (let i = 2; i < nums.length; i++) {
        const prevDiff = nums[i - 1] - nums[i - 2];
        const currDiff = nums[i] - nums[i - 1];

        if (currDiff === prevDiff) {
            // The arithmetic run just extended by one more element
            // This adds one more subarray of each existing length + one new 3-element subarray
            currentRunContribution++;
            totalCount += currentRunContribution;
        } else {
            // Arithmetic run broken — reset
            currentRunContribution = 0;
        }
    }

    return totalCount;
};`,
    jsWalkthrough:
      'Example: nums = [1,2,3,4]\n' +
      'i=2: diff [1→2]=1, diff [2→3]=1 → match\n' +
      '  currentRunContribution=1, total=1 (subarray [1,2,3])\n' +
      'i=3: diff [2→3]=1, diff [3→4]=1 → match\n' +
      '  currentRunContribution=2, total=1+2=3\n' +
      '  (new subarrays: [2,3,4] and [1,2,3,4])\n\n' +
      'Result: 3',
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
    intuition:
      'Simulate how you add numbers by hand: start from the rightmost digits, add them with a carry, write down the last digit, and carry the rest. Handle different-length numbers by treating missing digits as zero.',
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
    // Process from rightmost (least significant) digits to leftmost
    let ptr1 = num1.length - 1;
    let ptr2 = num2.length - 1;
    let carry = 0;
    const digits = []; // collected in reverse (least significant first)

    while (ptr1 >= 0 || ptr2 >= 0 || carry > 0) {
        // Get the current digit from each number (0 if exhausted)
        const digit1 = ptr1 >= 0 ? parseInt(num1[ptr1]) : 0;
        const digit2 = ptr2 >= 0 ? parseInt(num2[ptr2]) : 0;

        const columnSum = digit1 + digit2 + carry;

        // Store the last digit of the column sum
        digits.push(String(columnSum % 10));

        // Carry forward the tens place
        carry = Math.floor(columnSum / 10);

        ptr1--;
        ptr2--;
    }

    // Digits were collected least-significant-first, so reverse to get the final number
    return digits.reverse().join('');
};`,
    jsWalkthrough:
      'Example: num1 = "11", num2 = "123"\n' +
      'ptr1=1, ptr2=2, carry=0\n\n' +
      'Step 1: digit1=1, digit2=3, sum=4, carry=0 → digits=["4"]\n' +
      'Step 2: digit1=1, digit2=2, sum=3, carry=0 → digits=["4","3"]\n' +
      'Step 3: ptr1<0 so digit1=0, digit2=1, sum=1 → digits=["4","3","1"]\n\n' +
      'Reverse: ["1","3","4"] → "134"',
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
    intuition:
      'A binary trie lets you greedily maximize XOR bit by bit, from the most significant to least. At each level, try to take the opposite bit - this sets that XOR bit to 1. It is like navigating a fork in the road, always choosing the path that differs from your number.',
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
    // Build a binary trie from most significant bit (bit 31) to least significant (bit 0)
    const trieRoot = {};

    for (const num of nums) {
        let currentNode = trieRoot;
        for (let bitPos = 31; bitPos >= 0; bitPos--) {
            const bit = (num >> bitPos) & 1; // extract bit at position bitPos
            if (!currentNode[bit]) {
                currentNode[bit] = {}; // create branch if it doesn't exist
            }
            currentNode = currentNode[bit];
        }
    }

    // For each number, greedily maximize XOR by choosing opposite bits in the trie
    let maxXorFound = 0;

    for (const num of nums) {
        let currentNode = trieRoot;
        let xorValue = 0;

        for (let bitPos = 31; bitPos >= 0; bitPos--) {
            const currentBit = (num >> bitPos) & 1;
            const oppositeBit = 1 - currentBit; // XOR with 1 flips the bit

            if (currentNode[oppositeBit]) {
                // Taking the opposite bit sets this XOR position to 1
                xorValue |= (1 << bitPos);
                currentNode = currentNode[oppositeBit];
            } else {
                // Opposite not available — take same bit (XOR bit = 0)
                currentNode = currentNode[currentBit];
            }
        }

        maxXorFound = Math.max(maxXorFound, xorValue);
    }

    return maxXorFound;
};`,
    jsWalkthrough:
      'Example: nums = [3,10,5,25,2,8]\n' +
      'Binary: 3=...00011, 10=...01010, 5=...00101, 25=...11001, 2=...00010, 8=...01000\n\n' +
      'For num=5 (00101), search trie for maximum XOR:\n' +
      '  bit31-5: look for 0 (opposite of 5\'s bits 1..0)\n' +
      '  Eventually reaches path for 25 (11001)\n' +
      '  5 XOR 25 = 00101 XOR 11001 = 11100 = 28\n\n' +
      'maxXorFound = 28',
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
    intuition:
      'In a word square, row k equals column k. After placing k words, the prefix required for the next word is completely determined by reading down column k of the existing words. A prefix map enables fast lookup of candidate words.',
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
    const wordLength = words[0].length;

    // Build prefix → [words with that prefix] for fast candidate lookup
    const prefixMap = new Map();
    for (const word of words) {
        for (let endIdx = 0; endIdx <= wordLength; endIdx++) {
            const prefix = word.substring(0, endIdx);
            if (!prefixMap.has(prefix)) prefixMap.set(prefix, []);
            prefixMap.get(prefix).push(word);
        }
    }

    const result = [];

    // Backtrack by adding one word at a time to the square
    const backtrack = (currentSquare) => {
        if (currentSquare.length === wordLength) {
            // Found a complete word square
            result.push([...currentSquare]);
            return;
        }

        // The next word (at row 'rowIdx') must have a specific prefix
        // The prefix is determined by reading column 'rowIdx' of all placed words
        const rowIdx = currentSquare.length;
        const requiredPrefix = currentSquare.map(word => word[rowIdx]).join('');

        // Try all words that share this required prefix
        for (const candidate of (prefixMap.get(requiredPrefix) || [])) {
            currentSquare.push(candidate);
            backtrack(currentSquare);
            currentSquare.pop();
        }
    };

    // Start with each word as the first row
    for (const firstWord of words) {
        backtrack([firstWord]);
    }

    return result;
};`,
    jsWalkthrough:
      'Example: words = ["area","lead","wall","lady","ball"]\n' +
      'prefixMap includes: "wa"→["wall"], "ar"→["area"], "le"→["lead"], "la"→["lady","lady"]\n\n' +
      'Start with "wall":\n' +
      '  rowIdx=1, required prefix = "a" (wall[1]="a")\n' +
      '  Candidates with prefix "a": ["area"]\n' +
      '  Square: ["wall","area"]\n' +
      '  rowIdx=2, required prefix = "ll"→"al" wait... wall[2]="l", area[2]="e"\n' +
      '  Required = "l"+"e" = "le" → candidates: ["lead"]\n' +
      '  Square: ["wall","area","lead"]\n' +
      '  rowIdx=3: wall[3]="l", area[3]="a", lead[3]="d" → "lad" → ["lady"]\n' +
      '  Square: ["wall","area","lead","lady"] ✓',
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
    intuition:
      'In-order traversal of a BST visits nodes in sorted order, which is exactly the order you need for the linked list. Track the previous node to link pairs as you traverse, then connect the head and tail for the circular structure.',
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

    // Track the first node (smallest, becomes head) and the last node (tail)
    let firstNode = null; // head of the doubly linked list
    let prevNode = null;  // the previously visited node during in-order traversal

    // In-order traversal visits nodes in ascending sorted order for a BST
    const inorder = (node) => {
        if (!node) return;

        inorder(node.left);

        // Link the previous node to the current node (and vice versa)
        if (prevNode) {
            prevNode.right = node;  // prev.next = current
            node.left = prevNode;   // current.prev = prev
        } else {
            // First node encountered — this becomes the head
            firstNode = node;
        }

        prevNode = node;

        inorder(node.right);
    };

    inorder(root);

    // Connect head and tail to make the list circular
    firstNode.left = prevNode;  // head.prev = tail
    prevNode.right = firstNode; // tail.next = head

    return firstNode;
};`,
    jsWalkthrough:
      'Example: root = [4,2,5,1,3]\n' +
      'In-order visits: 1 → 2 → 3 → 4 → 5\n\n' +
      'Visit 1 (first): firstNode=1, prevNode=1\n' +
      'Visit 2: prevNode(1).right=2, 2.left=1, prevNode=2\n' +
      'Visit 3: prevNode(2).right=3, 3.left=2, prevNode=3\n' +
      'Visit 4: prevNode(3).right=4, 4.left=3, prevNode=4\n' +
      'Visit 5: prevNode(4).right=5, 5.left=4, prevNode=5\n\n' +
      'Circular: firstNode(1).left=5, prevNode(5).right=1\n' +
      'Result: 1⟷2⟷3⟷4⟷5 (circular)',
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
    intuition:
      'A Quad-Tree recursively divides a grid into four quadrants. If all values in a region are the same, collapse it into a single leaf. Otherwise, recurse on each quadrant. It is like a compression scheme - uniform regions get simplified.',
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
    // Recursively build the quad-tree for the region starting at (row, col) with given size
    const build = (row, col, size) => {
        // Base case: single cell — always a leaf
        if (size === 1) {
            const cellValue = grid[row][col] === 1;
            return new Node(cellValue, true);
        }

        const halfSize = Math.floor(size / 2);

        // Recursively build four quadrants
        const topLeft     = build(row,           col,           halfSize);
        const topRight    = build(row,           col + halfSize, halfSize);
        const bottomLeft  = build(row + halfSize, col,           halfSize);
        const bottomRight = build(row + halfSize, col + halfSize, halfSize);

        // If all four quadrants are leaves with the same value, merge into one leaf
        const allLeaves = topLeft.isLeaf && topRight.isLeaf &&
                          bottomLeft.isLeaf && bottomRight.isLeaf;
        const allSameValue = topLeft.val === topRight.val &&
                             topRight.val === bottomLeft.val &&
                             bottomLeft.val === bottomRight.val;

        if (allLeaves && allSameValue) {
            return new Node(topLeft.val, true); // collapsed leaf
        }

        // Mixed region — create an internal node with four children
        return new Node(true, false, topLeft, topRight, bottomLeft, bottomRight);
    };

    return build(0, 0, grid.length);
};`,
    jsWalkthrough:
      'Example: grid = [[0,1],[1,0]]\n\n' +
      'build(0,0,2):\n' +
      '  halfSize=1\n' +
      '  topLeft  = build(0,0,1): grid[0][0]=0 → Node(false, leaf)\n' +
      '  topRight = build(0,1,1): grid[0][1]=1 → Node(true,  leaf)\n' +
      '  botLeft  = build(1,0,1): grid[1][0]=1 → Node(true,  leaf)\n' +
      '  botRight = build(1,1,1): grid[1][1]=0 → Node(false, leaf)\n\n' +
      '  allLeaves=true, but 0≠1 → not allSameValue\n' +
      '  → return internal Node with 4 leaf children',
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
    intuition:
      'Level-order traversal uses BFS with a queue. Process all nodes at the current level, collecting their values and enqueuing all their children. The queue naturally separates levels when you process a fixed number of nodes per iteration.',
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

    const levelGroups = [];
    const queue = [root]; // BFS queue starts with root

    while (queue.length > 0) {
        // Snapshot the current level size before processing
        const nodesAtThisLevel = queue.length;
        const currentLevelValues = [];

        for (let i = 0; i < nodesAtThisLevel; i++) {
            const node = queue.shift();
            currentLevelValues.push(node.val);

            // Enqueue all children for the next level
            for (const child of node.children) {
                queue.push(child);
            }
        }

        levelGroups.push(currentLevelValues);
    }

    return levelGroups;
};`,
    jsWalkthrough:
      'Example: root = [1,null,3,2,4,null,5,6]\n' +
      '(1 has children [3,2,4]; 3 has children [5,6])\n\n' +
      'Initial queue: [1]\n\n' +
      'Level 1: size=1, process 1 → values=[1]\n' +
      '  Enqueue children: [3,2,4]\n' +
      'Level 2: size=3, process 3,2,4 → values=[3,2,4]\n' +
      '  Enqueue 3\'s children: [5,6]; 2 and 4 have no children\n' +
      'Level 3: size=2, process 5,6 → values=[5,6]\n\n' +
      'Result: [[1],[3,2,4],[5,6]]',
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
    intuition:
      'When encountering a child list, splice it in between the current node and its next. Find the tail of the child list, then reconnect it to the saved next node. This flattens one level at a time as you iterate forward.',
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
        // Only act when this node has a child sublist
        if (curr.child) {
            const childHead = curr.child;
            const savedNext = curr.next; // save the node that comes after curr

            // Splice: curr → childHead
            curr.next = childHead;
            childHead.prev = curr;
            curr.child = null; // clear child pointer

            // Walk to the tail of the child sublist
            let childTail = childHead;
            while (childTail.next) {
                childTail = childTail.next;
            }

            // Reconnect child tail → savedNext
            childTail.next = savedNext;
            if (savedNext) {
                savedNext.prev = childTail;
            }
        }

        curr = curr.next;
    }

    return head;
};`,
    jsWalkthrough:
      'Example: 1 <-> 2 <-> 3 <-> 4, where 3 has child: 7 <-> 8\n\n' +
      'Start: curr=1 → no child, advance\n' +
      'curr=2 → no child, advance\n' +
      'curr=3 → HAS child!\n' +
      '  childHead=7, savedNext=4\n' +
      '  Splice: 3→7, 7.prev=3, 3.child=null\n' +
      '  Walk child tail: 7→8 (tail=8)\n' +
      '  Reconnect: 8→4, 4.prev=8\n' +
      '  List is now: 1 <-> 2 <-> 3 <-> 7 <-> 8 <-> 4\n' +
      'curr=4 (curr=3.next=7, then 8, then 4) → no child\n\n' +
      'Result: [1,2,3,7,8,4]',
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
    intuition:
      'A doubly linked list of count buckets, ordered by count, gives O(1) access to min and max. Keys move between adjacent buckets on inc/dec. The hash map from key to bucket enables O(1) lookup. Together, all operations are constant time.',
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
    // Sentinel head (count=0) and tail (count=Infinity) for easy boundary checks
    this.head = { count: 0, keys: new Set(), prev: null, next: null };
    this.tail = { count: 0, keys: new Set(), prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;

    // Maps each key string to its bucket node in the linked list
    this.keyNode = new Map();
};

AllOne.prototype._insertAfter = function(prevNode, count) {
    // Create a new bucket with the given count and splice it in after prevNode
    const newBucket = { count, keys: new Set(), prev: prevNode, next: prevNode.next };
    prevNode.next.prev = newBucket;
    prevNode.next = newBucket;
    return newBucket;
};

AllOne.prototype._remove = function(node) {
    // Unlink a bucket from the doubly linked list
    node.prev.next = node.next;
    node.next.prev = node.prev;
};

AllOne.prototype.inc = function(key) {
    if (this.keyNode.has(key)) {
        // Key already exists: move it to the next-higher bucket
        const currentBucket = this.keyNode.get(key);
        const newCount = currentBucket.count + 1;

        // Reuse existing bucket if it already has count+1, otherwise create one
        const nextBucketHasNewCount = currentBucket.next.count === newCount;
        const targetBucket = nextBucketHasNewCount
            ? currentBucket.next
            : this._insertAfter(currentBucket, newCount);

        targetBucket.keys.add(key);
        this.keyNode.set(key, targetBucket);
        currentBucket.keys.delete(key);

        // Remove the old bucket if it is now empty
        if (currentBucket.keys.size === 0) {
            this._remove(currentBucket);
        }
    } else {
        // New key: place it in the count=1 bucket (create if needed)
        const firstBucketIsOne = this.head.next.count === 1;
        const targetBucket = firstBucketIsOne
            ? this.head.next
            : this._insertAfter(this.head, 1);

        targetBucket.keys.add(key);
        this.keyNode.set(key, targetBucket);
    }
};

AllOne.prototype.dec = function(key) {
    const currentBucket = this.keyNode.get(key);
    const newCount = currentBucket.count - 1;

    if (newCount === 0) {
        // Count dropped to zero: remove the key entirely
        this.keyNode.delete(key);
    } else {
        // Move key to the next-lower bucket (create if needed)
        const prevBucketHasNewCount = currentBucket.prev.count === newCount;
        const targetBucket = prevBucketHasNewCount
            ? currentBucket.prev
            : this._insertAfter(currentBucket.prev, newCount);

        targetBucket.keys.add(key);
        this.keyNode.set(key, targetBucket);
    }

    currentBucket.keys.delete(key);
    if (currentBucket.keys.size === 0) {
        this._remove(currentBucket);
    }
};

AllOne.prototype.getMaxKey = function() {
    // Max is the bucket just before the tail sentinel
    if (this.tail.prev === this.head) return "";
    return this.tail.prev.keys.values().next().value;
};

AllOne.prototype.getMinKey = function() {
    // Min is the bucket just after the head sentinel
    if (this.head.next === this.tail) return "";
    return this.head.next.keys.values().next().value;
};`,
    jsWalkthrough:
      'Example: inc("hello"), inc("hello"), getMaxKey(), getMinKey()\n\n' +
      'Initial: head(0) <-> tail(0)\n\n' +
      'inc("hello") — new key:\n' +
      '  No bucket with count=1 → create bucket(1)\n' +
      '  head(0) <-> bucket(1){hello} <-> tail\n' +
      '  keyNode: {hello → bucket(1)}\n\n' +
      'inc("hello") — existing key at count=1:\n' +
      '  newCount=2, no bucket with count=2 → create bucket(2)\n' +
      '  head(0) <-> bucket(1){} <-> bucket(2){hello} <-> tail\n' +
      '  bucket(1) is empty → remove it\n' +
      '  head(0) <-> bucket(2){hello} <-> tail\n\n' +
      'getMaxKey() → tail.prev = bucket(2) → "hello"\n' +
      'getMinKey() → head.next = bucket(2) → "hello"',
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
    intuition:
      'This is like Word Ladder but with genes. BFS finds the shortest path of single-character mutations through the valid gene bank. Each mutation changes one of 8 characters to one of 4 possible bases, giving 24 possible next states per gene.',
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
    const validGenes = new Set(bank);

    // If the target gene is not in the bank, it can never be reached
    if (!validGenes.has(endGene)) return -1;

    // BFS: each entry is [currentGene, mutationStepsSoFar]
    const queue = [[startGene, 0]];
    const visited = new Set([startGene]);

    while (queue.length > 0) {
        const [currentGene, mutationCount] = queue.shift();

        if (currentGene === endGene) return mutationCount;

        // Try mutating each of the 8 positions to each of 4 bases
        for (let position = 0; position < 8; position++) {
            for (const base of 'ACGT') {
                // Skip if this base is already at this position
                if (base === currentGene[position]) continue;

                const mutatedGene =
                    currentGene.substring(0, position) +
                    base +
                    currentGene.substring(position + 1);

                const isValidMutation = validGenes.has(mutatedGene);
                const notYetVisited = !visited.has(mutatedGene);

                if (isValidMutation && notYetVisited) {
                    visited.add(mutatedGene);
                    queue.push([mutatedGene, mutationCount + 1]);
                }
            }
        }
    }

    return -1; // endGene is unreachable
};`,
    jsWalkthrough:
      'Example: start="AACCGGTT", end="AAACGGTA", bank=["AACCGGTA","AACCGCTA","AAACGGTA"]\n\n' +
      'Initial queue: [["AACCGGTT", 0]]\n\n' +
      'Process "AACCGGTT" (steps=0):\n' +
      '  Try all 8×4 mutations...\n' +
      '  Position 7: T→A gives "AACCGGTA" → in bank, not visited\n' +
      '  Enqueue ["AACCGGTA", 1]\n\n' +
      'Process "AACCGGTA" (steps=1):\n' +
      '  Try all mutations...\n' +
      '  Position 2: C→A gives "AAACGGTA" → in bank, not visited\n' +
      '  Enqueue ["AAACGGTA", 2]\n\n' +
      'Process "AAACGGTA" (steps=2):\n' +
      '  currentGene === endGene → return 2\n\n' +
      'Result: 2',
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
    intuition:
      'Sort intervals by start point and use binary search. For each interval\'s end value, find the smallest start that is greater than or equal to it. Sorting enables O(log n) binary search instead of O(n) linear scan for each query.',
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
    // Build (startValue, originalIndex) pairs and sort by start value
    const sortedByStart = intervals
        .map((interval, originalIndex) => [interval[0], originalIndex])
        .sort((a, b) => a[0] - b[0]);

    // Extract just the sorted start values for binary search
    const sortedStartValues = sortedByStart.map(pair => pair[0]);

    const result = [];

    for (const [, endValue] of intervals) {
        // Binary search: find leftmost start >= endValue
        let lo = 0;
        let hi = sortedStartValues.length;

        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            if (sortedStartValues[mid] < endValue) {
                lo = mid + 1; // need a larger start
            } else {
                hi = mid;     // this start is >= endValue, but maybe we can find smaller
            }
        }

        // lo is the index of the first start >= endValue
        const foundInterval = lo < sortedStartValues.length;
        result.push(foundInterval ? sortedByStart[lo][1] : -1);
    }

    return result;
};`,
    jsWalkthrough:
      'Example: intervals = [[1,2],[2,3],[0,1],[3,4]]\n\n' +
      'sortedByStart = [[0,2],[1,0],[2,1],[3,3]]  (sorted by start)\n' +
      'sortedStartValues = [0, 1, 2, 3]\n\n' +
      'For interval [1,2]: end=2\n' +
      '  Binary search for first start >= 2 → index 2 (start=2)\n' +
      '  originalIndex = sortedByStart[2][1] = 1\n\n' +
      'For interval [2,3]: end=3\n' +
      '  Binary search for first start >= 3 → index 3 (start=3)\n' +
      '  originalIndex = sortedByStart[3][1] = 3\n\n' +
      'For interval [0,1]: end=1\n' +
      '  Binary search for first start >= 1 → index 1 (start=1)\n' +
      '  originalIndex = sortedByStart[1][1] = 0\n\n' +
      'For interval [3,4]: end=4\n' +
      '  Binary search for first start >= 4 → lo=4, out of bounds → -1\n\n' +
      'Result: [1, 3, 0, -1]',
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
    intuition:
      'Visualize numbers 1 to n arranged in a trie (prefix tree). Instead of generating all numbers in order, count how many numbers exist in each subtree. Skip entire subtrees when k is large enough, or dive deeper when k falls within a subtree. This avoids enumerating all numbers.',
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
    // Count how many integers are in the subtree rooted at prefix 'curr'
    // (i.e., all numbers from curr to curr+1-1 that are <= n, at all depths)
    const countSubtreeSize = (n, subtreeRoot, nextSibling) => {
        let count = 0;
        let levelStart = subtreeRoot;
        let levelEnd = nextSibling;

        while (levelStart <= n) {
            // Count nodes on this level of the subtree, capped at n
            count += Math.min(n + 1, levelEnd) - levelStart;
            levelStart *= 10;  // go one level deeper
            levelEnd *= 10;
        }

        return count;
    };

    // We start at position 1 (the number "1" is the 1st lexicographically)
    let currentPrefix = 1;
    k--; // decrement because we're already "at" the first number

    while (k > 0) {
        const subtreeSize = countSubtreeSize(n, currentPrefix, currentPrefix + 1);

        if (subtreeSize <= k) {
            // The kth number is not in this subtree, skip to the next sibling
            k -= subtreeSize;
            currentPrefix++;
        } else {
            // The kth number is inside this subtree, go one level deeper
            k--;
            currentPrefix *= 10;
        }
    }

    return currentPrefix;
};`,
    jsWalkthrough:
      'Example: n=13, k=2\n' +
      'Lex order: [1, 10, 11, 12, 13, 2, 3, 4, ...]\n\n' +
      'Start: currentPrefix=1, k=2-1=1\n\n' +
      'Iteration 1: countSubtreeSize(13, 1, 2)\n' +
      '  Level [1,2): count += min(14,2)-1 = 1\n' +
      '  Level [10,20): count += min(14,20)-10 = 4\n' +
      '  Level [100,200): 100>13, stop. subtreeSize=5\n' +
      '  5 > k=1 → go deeper: k=0, currentPrefix=10\n\n' +
      'k=0 → return currentPrefix=10\n\n' +
      'Result: 10 (correct: 10 is 2nd in lex order)',
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
    intuition:
      'The sum 1+2+...+k = k(k+1)/2 tells you how many coins k complete rows need. Binary search for the largest k satisfying this inequality. It is like finding how many steps of a staircase you can fully build with your budget.',
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
    // Binary search for largest k where k*(k+1)/2 <= n
    let lo = 0;
    let hi = n;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);

        // Total coins needed to fill exactly mid rows
        const coinsNeeded = mid * (mid + 1) / 2;

        if (coinsNeeded === n) {
            return mid; // exact fit
        } else if (coinsNeeded < n) {
            lo = mid + 1; // can fill more rows
        } else {
            hi = mid - 1; // too many rows, reduce
        }
    }

    // hi is the largest k where k*(k+1)/2 <= n
    return hi;
};`,
    jsWalkthrough:
      'Example: n=5\n\n' +
      'lo=0, hi=5\n\n' +
      'Iteration 1: mid=2, coinsNeeded=2*3/2=3 < 5 → lo=3\n' +
      'Iteration 2: mid=4, coinsNeeded=4*5/2=10 > 5 → hi=3\n' +
      'Iteration 3: mid=3, coinsNeeded=3*4/2=6 > 5 → hi=2\n' +
      'lo=3 > hi=2 → stop\n\n' +
      'Return hi=2\n\n' +
      'Verify: row 1 needs 1, row 2 needs 2, total=3 ≤ 5; row 3 needs 3, total=6 > 5\n' +
      'Result: 2 complete rows',
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
    intuition:
      'Since values are in [1, n], each value maps to a unique index. Use the sign of the array value as a \'visited\' flag: negate the value at the mapped index. If it is already negative when you visit again, the number is a duplicate. Clever in-place hashing.',
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
    const duplicates = [];

    for (const num of nums) {
        // Use the absolute value so negated values still map correctly
        const mappedIndex = Math.abs(num) - 1;

        if (nums[mappedIndex] < 0) {
            // Already negated → we've seen this number before → it's a duplicate
            duplicates.push(Math.abs(num));
        } else {
            // First time seeing this number → negate the value at mapped index as a "visited" flag
            nums[mappedIndex] = -nums[mappedIndex];
        }
    }

    return duplicates;
};`,
    jsWalkthrough:
      'Example: nums = [4,3,2,7,8,2,3,1]\n\n' +
      'num=4: mappedIndex=3, nums[3]=7>0 → mark: nums[3]=-7\n' +
      'num=3: mappedIndex=2, nums[2]=2>0 → mark: nums[2]=-2\n' +
      'num=2: mappedIndex=1, nums[1]=3>0 → mark: nums[1]=-3\n' +
      'num=7: mappedIndex=6, nums[6]=3>0 → mark: nums[6]=-3\n' +
      'num=8: mappedIndex=7, nums[7]=1>0 → mark: nums[7]=-1\n' +
      'num=2: mappedIndex=1, nums[1]=-3<0 → DUPLICATE! push 2\n' +
      'num=3: mappedIndex=2, nums[2]=-2<0 → DUPLICATE! push 3\n' +
      'num=1: mappedIndex=0, nums[0]=4>0 → mark: nums[0]=-4\n\n' +
      'Result: [2, 3]',
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
    intuition:
      'Two pointers - one reads consecutive groups, the other writes the compressed output. For each group of identical characters, write the character and its count (if more than 1). The write pointer always stays behind or equal to the read pointer, so in-place compression works.',
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
    let readPtr = 0;  // scans forward through the input
    let writePtr = 0; // overwrites compressed output in-place

    while (readPtr < chars.length) {
        const currentChar = chars[readPtr];
        let groupCount = 0;

        // Count how many times currentChar repeats consecutively
        while (readPtr < chars.length && chars[readPtr] === currentChar) {
            readPtr++;
            groupCount++;
        }

        // Write the character itself
        chars[writePtr] = currentChar;
        writePtr++;

        // Write the count only if more than one occurrence
        if (groupCount > 1) {
            for (const digit of String(groupCount)) {
                chars[writePtr] = digit;
                writePtr++;
            }
        }
    }

    // writePtr is now the length of the compressed array
    return writePtr;
};`,
    jsWalkthrough:
      'Example: chars = ["a","a","b","b","c","c","c"]\n\n' +
      'readPtr=0, writePtr=0\n\n' +
      'Group "a": readPtr advances to 2, groupCount=2\n' +
      '  Write "a" at writePtr=0, then "2" at writePtr=1\n' +
      '  writePtr=2\n\n' +
      'Group "b": readPtr advances to 4, groupCount=2\n' +
      '  Write "b" at writePtr=2, then "2" at writePtr=3\n' +
      '  writePtr=4\n\n' +
      'Group "c": readPtr advances to 7, groupCount=3\n' +
      '  Write "c" at writePtr=4, then "3" at writePtr=5\n' +
      '  writePtr=6\n\n' +
      'chars = ["a","2","b","2","c","3",...]\n' +
      'Result: 6',
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
    intuition:
      'Stacks reverse the digit order so you can add from least significant to most significant, just like manual addition. Build the result by prepending nodes (no reversal needed at the end). The carry propagates naturally.',
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
    // Push all digits onto stacks so we can process from least significant to most
    const stack1 = [];
    const stack2 = [];

    let node1 = l1;
    while (node1) {
        stack1.push(node1.val);
        node1 = node1.next;
    }

    let node2 = l2;
    while (node2) {
        stack2.push(node2.val);
        node2 = node2.next;
    }

    let carry = 0;
    let resultHead = null; // we build the list by prepending

    while (stack1.length > 0 || stack2.length > 0 || carry > 0) {
        // Pop the least significant digit from each stack (or 0 if exhausted)
        const digit1 = stack1.length > 0 ? stack1.pop() : 0;
        const digit2 = stack2.length > 0 ? stack2.pop() : 0;

        const columnSum = digit1 + digit2 + carry;
        carry = Math.floor(columnSum / 10);

        // Prepend new node so digits come out in the correct (most-significant-first) order
        const newNode = new ListNode(columnSum % 10);
        newNode.next = resultHead;
        resultHead = newNode;
    }

    return resultHead;
};`,
    jsWalkthrough:
      'Example: l1=[7,2,4,3], l2=[5,6,4]\n\n' +
      'stack1 = [7,2,4,3] (push order), top=3\n' +
      'stack2 = [5,6,4], top=4\n\n' +
      'Iteration 1: digit1=3, digit2=4, carry=0 → sum=7, carry=0\n' +
      '  Prepend 7. resultHead=[7]\n' +
      'Iteration 2: digit1=4, digit2=6, carry=0 → sum=10, carry=1\n' +
      '  Prepend 0. resultHead=[0,7]\n' +
      'Iteration 3: digit1=2, digit2=5, carry=1 → sum=8, carry=0\n' +
      '  Prepend 8. resultHead=[8,0,7]\n' +
      'Iteration 4: digit1=7, digit2=0, carry=0 → sum=7, carry=0\n' +
      '  Prepend 7. resultHead=[7,8,0,7]\n\n' +
      'Result: [7,8,0,7]',
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
    intuition:
      'Preorder traversal of a BST uniquely identifies the tree, so no null markers are needed (unlike general binary trees). During deserialization, BST bounds (min, max) tell you whether a value belongs in the current subtree, enabling O(n) reconstruction.',
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
    // Preorder traversal (root, left, right) captures BST structure without null markers
    const nodeValues = [];

    const preorder = (node) => {
        if (!node) return;
        nodeValues.push(String(node.val));
        preorder(node.left);
        preorder(node.right);
    };

    preorder(root);
    return nodeValues.join(',');
};

var deserialize = function(data) {
    if (!data) return null;

    // Parse the preorder sequence back into an array of numbers
    const preorderValues = data.split(',').map(Number);
    let index = 0; // points to the next value to consume

    // Reconstruct using BST bounds: left children < parentVal, right children > parentVal
    const buildFromBounds = (lowerBound, upperBound) => {
        if (index >= preorderValues.length) return null;

        const nextValue = preorderValues[index];

        // If the next value violates the BST bounds, it belongs to an ancestor's subtree
        if (nextValue < lowerBound || nextValue > upperBound) return null;

        index++; // consume this value
        const node = new TreeNode(nextValue);

        // Left subtree: all values must be < nextValue
        node.left = buildFromBounds(lowerBound, nextValue);
        // Right subtree: all values must be > nextValue
        node.right = buildFromBounds(nextValue, upperBound);

        return node;
    };

    return buildFromBounds(-Infinity, Infinity);
};`,
    jsWalkthrough:
      'Example: root = [2,1,3]\n\n' +
      'serialize([2,1,3]):\n' +
      '  Preorder: visit 2, then left subtree (1), then right subtree (3)\n' +
      '  nodeValues = ["2","1","3"]\n' +
      '  Returns: "2,1,3"\n\n' +
      'deserialize("2,1,3"):\n' +
      '  preorderValues = [2,1,3], index=0\n' +
      '  buildFromBounds(-∞, +∞):\n' +
      '    nextValue=2, in bounds → create node(2), index=1\n' +
      '    buildFromBounds(-∞, 2):  nextValue=1, in bounds → node(1), index=2\n' +
      '      buildFromBounds(-∞,1): nextValue=3, 3>1 → null\n' +
      '      buildFromBounds(1,2):  nextValue=3, 3>2 → null\n' +
      '    buildFromBounds(2, +∞): nextValue=3, in bounds → node(3), index=3\n\n' +
      'Result: tree with root=2, left=1, right=3',
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
    intuition:
      'Count frequencies, sort by frequency, then repeat each character by its count. It is like organizing a bag of letters by how common they are, then laying them out from most to least frequent.',
    approach:
      'Count character frequencies, sort by frequency descending, then build the result string by repeating each character by its count.',
    code: `class Solution:
    def frequencySort(self, s: str) -> str:
        from collections import Counter
        counts = Counter(s)
        sorted_chars = sorted(counts.keys(), key=lambda c: -counts[c])
        return ''.join(c * counts[c] for c in sorted_chars)`,
    jsCode: `var frequencySort = function(s) {
    // Count how many times each character appears
    const charFrequency = new Map();
    for (const ch of s) {
        charFrequency.set(ch, (charFrequency.get(ch) || 0) + 1);
    }

    // Sort characters from most frequent to least frequent
    const sortedChars = [...charFrequency.keys()].sort(
        (a, b) => charFrequency.get(b) - charFrequency.get(a)
    );

    // Build result: repeat each character by its frequency
    return sortedChars
        .map(ch => ch.repeat(charFrequency.get(ch)))
        .join('');
};`,
    jsWalkthrough:
      'Example: s = "tree"\n\n' +
      'Count frequencies:\n' +
      '  t→1, r→1, e→2\n' +
      '  charFrequency = {t:1, r:1, e:2}\n\n' +
      'Sort by frequency (descending):\n' +
      '  sortedChars = ["e", "t", "r"]  (e has highest count)\n\n' +
      'Build result:\n' +
      '  "e".repeat(2) = "ee"\n' +
      '  "t".repeat(1) = "t"\n' +
      '  "r".repeat(1) = "r"\n' +
      '  Join: "eetr"\n\n' +
      'Result: "eetr" (or "eert" — both are valid)',
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
    intuition:
      'Split four arrays into two groups of two. Hash all pairwise sums from the first two arrays. For each pair from the last two arrays, check if the negation exists in the hash map. This reduces O(n^4) to O(n^2) - a classic meet-in-the-middle strategy.',
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
    // Phase 1: store all pairwise sums from nums1 and nums2
    const pairSumCount = new Map();

    for (const a of nums1) {
        for (const b of nums2) {
            const pairSum = a + b;
            pairSumCount.set(pairSum, (pairSumCount.get(pairSum) || 0) + 1);
        }
    }

    // Phase 2: for each (c,d) pair, check if the complement exists in the map
    let totalTuples = 0;

    for (const c of nums3) {
        for (const d of nums4) {
            const neededComplement = -(c + d); // we need a+b = -(c+d) so that a+b+c+d = 0
            const matchingPairs = pairSumCount.get(neededComplement) || 0;
            totalTuples += matchingPairs;
        }
    }

    return totalTuples;
};`,
    jsWalkthrough:
      'Example: nums1=[1,2], nums2=[-2,-1], nums3=[-1,2], nums4=[0,2]\n\n' +
      'Phase 1 — all (a+b) sums:\n' +
      '  (1)+(-2)=-1, (1)+(-1)=0, (2)+(-2)=0, (2)+(-1)=1\n' +
      '  pairSumCount = {-1:1, 0:2, 1:1}\n\n' +
      'Phase 2 — check complements:\n' +
      '  c=-1, d=0: neededComplement=1 → pairSumCount[1]=1 → totalTuples=1\n' +
      '  c=-1, d=2: neededComplement=-1 → pairSumCount[-1]=1 → totalTuples=2\n' +
      '  c=2,  d=0: neededComplement=-2 → not in map → 0\n' +
      '  c=2,  d=2: neededComplement=-4 → not in map → 0\n\n' +
      'Result: 2',
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

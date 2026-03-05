import { ProblemSolution } from './types';

export const solutions: ProblemSolution[] = [
  // ---------------------------------------------------------------------------
  // 1272. Remove Interval
  // ---------------------------------------------------------------------------
  {
    id: 1272,
    description:
      'A set of real numbers can be represented as the union of several disjoint intervals. You are given a sorted list of disjoint intervals and a single interval toBeRemoved. Return the set of real numbers with the interval toBeRemoved removed from each of the intervals.',
    examples:
      'Input: intervals = [[0,2],[3,4],[5,7]], toBeRemoved = [1,6]\nOutput: [[0,1],[6,7]]',
    approach:
      'Iterate through each interval. If it does not overlap with toBeRemoved, keep it. If it partially overlaps, keep the non-overlapping portions. If fully contained, skip it.',
    code: `class Solution:
    def removeInterval(self, intervals: list[list[int]], toBeRemoved: list[int]) -> list[list[int]]:
        res = []
        lo, hi = toBeRemoved
        for a, b in intervals:
            if b <= lo or a >= hi:
                res.append([a, b])
            else:
                if a < lo:
                    res.append([a, lo])
                if b > hi:
                    res.append([hi, b])
        return res`,
    jsCode: `var removeInterval = function(intervals, toBeRemoved) {
    const res = [];
    const [lo, hi] = toBeRemoved;
    for (const [a, b] of intervals) {
        if (b <= lo || a >= hi) {
            res.push([a, b]);
        } else {
            if (a < lo) res.push([a, lo]);
            if (b > hi) res.push([hi, b]);
        }
    }
    return res;
};`,
    explanation:
      '1. Extract lo and hi from toBeRemoved.\n' +
      '2. For each interval [a, b], if it is entirely before or after the removal range, keep it as-is.\n' +
      '3. Otherwise, if the interval starts before lo, keep [a, lo].\n' +
      '4. If the interval ends after hi, keep [hi, b].\n' +
      '5. This handles partial overlaps from both sides.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Consider three cases: no overlap, partial overlap, and full containment.',
      'When there is partial overlap, the interval may be split into at most two pieces.',
      'Check if the start of the interval is before the removal start, and if the end is after the removal end.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1274. Number of Ships in a Rectangle
  // ---------------------------------------------------------------------------
  {
    id: 1274,
    description:
      'On the sea represented by a cartesian plane, each ship is located at an integer point. You have a function Sea.hasShips(topRight, bottomLeft) that returns true if there is at least one ship in the rectangle. Given a rectangle defined by its topRight and bottomLeft corners, count the number of ships in it. There are at most 10 ships.',
    examples:
      'Input: ships = [[1,1],[2,2],[3,3],[5,5]], topRight = [4,4], bottomLeft = [0,0]\nOutput: 3',
    approach:
      'Use divide and conquer. Split the rectangle into four quadrants. Recursively count ships in each quadrant. If hasShips returns false for a region, prune it. Base case is when topRight equals bottomLeft (single point).',
    code: `# """
# This is Sea's API interface.
# You should not implement it, or speculate about its implementation
# """
# class Sea:
#     def hasShips(self, topRight: 'Point', bottomLeft: 'Point') -> bool:

class Solution:
    def countShips(self, sea: 'Sea', topRight: 'Point', bottomLeft: 'Point') -> int:
        if topRight.x < bottomLeft.x or topRight.y < bottomLeft.y:
            return 0
        if not sea.hasShips(topRight, bottomLeft):
            return 0
        if topRight.x == bottomLeft.x and topRight.y == bottomLeft.y:
            return 1
        mx = (topRight.x + bottomLeft.x) // 2
        my = (topRight.y + bottomLeft.y) // 2
        return (
            self.countShips(sea, Point(mx, my), bottomLeft) +
            self.countShips(sea, topRight, Point(mx + 1, my + 1)) +
            self.countShips(sea, Point(mx, topRight.y), Point(bottomLeft.x, my + 1)) +
            self.countShips(sea, Point(topRight.x, my), Point(mx + 1, bottomLeft.y))
        )`,
    jsCode: `var countShips = function(sea, topRight, bottomLeft) {
    if (topRight.x < bottomLeft.x || topRight.y < bottomLeft.y) return 0;
    if (!sea.hasShips(topRight, bottomLeft)) return 0;
    if (topRight.x === bottomLeft.x && topRight.y === bottomLeft.y) return 1;
    const mx = Math.floor((topRight.x + bottomLeft.x) / 2);
    const my = Math.floor((topRight.y + bottomLeft.y) / 2);
    return (
        countShips(sea, new Point(mx, my), bottomLeft) +
        countShips(sea, topRight, new Point(mx + 1, my + 1)) +
        countShips(sea, new Point(mx, topRight.y), new Point(bottomLeft.x, my + 1)) +
        countShips(sea, new Point(topRight.x, my), new Point(mx + 1, bottomLeft.y))
    );
};`,
    explanation:
      '1. If the rectangle is invalid (topRight < bottomLeft), return 0.\n' +
      '2. If hasShips returns false, no ships exist in this region so return 0.\n' +
      '3. If topRight == bottomLeft, we have a single point that contains a ship, return 1.\n' +
      '4. Split the rectangle into 4 quadrants using midpoints mx and my.\n' +
      '5. Recursively sum ships in all four quadrants.',
    timeComplexity: 'O(S * log(max(m,n))) where S is the number of ships',
    spaceComplexity: 'O(log(max(m,n))) recursion depth',
    hints: [
      'Think of a divide and conquer strategy on the 2D plane.',
      'Split the rectangle into 4 quadrants and prune those with no ships.',
      'The base case is a single point; if hasShips is true for it, count it as 1.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1277. Count Square Submatrices with All Ones
  // ---------------------------------------------------------------------------
  {
    id: 1277,
    description:
      'Given a m x n matrix of ones and zeros, return how many square submatrices have all ones. A square submatrix of size k means a k x k submatrix where every element is 1.',
    examples:
      'Input: matrix = [[0,1,1,1],[1,1,1,1],[0,1,1,1]]\nOutput: 15',
    approach:
      'Use dynamic programming. For each cell (i, j) with value 1, dp[i][j] represents the side length of the largest square submatrix with all ones ending at (i, j). It equals min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1. The answer is the sum of all dp values.',
    code: `class Solution:
    def countSquares(self, matrix: list[list[int]]) -> int:
        m, n = len(matrix), len(matrix[0])
        dp = [[0] * n for _ in range(m)]
        total = 0
        for i in range(m):
            for j in range(n):
                if matrix[i][j] == 1:
                    if i == 0 or j == 0:
                        dp[i][j] = 1
                    else:
                        dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1
                    total += dp[i][j]
        return total`,
    jsCode: `var countSquares = function(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const dp = Array.from({length: m}, () => new Array(n).fill(0));
    let total = 0;
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] === 1) {
                if (i === 0 || j === 0) {
                    dp[i][j] = 1;
                } else {
                    dp[i][j] = Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1;
                }
                total += dp[i][j];
            }
        }
    }
    return total;
};`,
    explanation:
      '1. Create a dp table same size as the matrix.\n' +
      '2. For each cell with value 1, dp[i][j] is the largest square ending at that cell.\n' +
      '3. For border cells, dp[i][j] = 1. For interior cells, dp[i][j] = min of top, left, top-left neighbors plus 1.\n' +
      '4. dp[i][j] also equals the count of squares ending at (i,j), so we sum all dp values.\n' +
      '5. A cell with dp value 3 contributes squares of size 1x1, 2x2, and 3x3.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Think about what determines the largest square ending at each cell.',
      'For cell (i,j), the largest square is limited by the squares at (i-1,j), (i,j-1), and (i-1,j-1).',
      'The dp value at each cell also represents the number of squares ending there.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1281. Subtract the Product and Sum of Digits of an Integer
  // ---------------------------------------------------------------------------
  {
    id: 1281,
    description:
      'Given an integer number n, return the difference between the product of its digits and the sum of its digits.',
    examples:
      'Input: n = 234\nOutput: 15\nExplanation: Product of digits = 2 * 3 * 4 = 24, Sum of digits = 2 + 3 + 4 = 9, Result = 24 - 9 = 15',
    approach:
      'Extract each digit using modulo and integer division. Maintain running product and sum. Return product minus sum.',
    code: `class Solution:
    def subtractProductAndSum(self, n: int) -> int:
        product = 1
        total = 0
        while n > 0:
            d = n % 10
            product *= d
            total += d
            n //= 10
        return product - total`,
    jsCode: `var subtractProductAndSum = function(n) {
    let product = 1, total = 0;
    while (n > 0) {
        const d = n % 10;
        product *= d;
        total += d;
        n = Math.floor(n / 10);
    }
    return product - total;
};`,
    explanation:
      '1. Initialize product to 1 and total (sum) to 0.\n' +
      '2. While n > 0, extract the last digit with n % 10.\n' +
      '3. Multiply it into product and add it to total.\n' +
      '4. Remove the last digit with n //= 10.\n' +
      '5. Return product - total.',
    timeComplexity: 'O(d) where d is the number of digits',
    spaceComplexity: 'O(1)',
    hints: [
      'How do you extract each digit from a number?',
      'Use modulo 10 to get the last digit and integer division by 10 to remove it.',
      'Keep a running product and running sum, then return the difference.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1283. Find the Smallest Divisor Given a Threshold
  // ---------------------------------------------------------------------------
  {
    id: 1283,
    description:
      'Given an array of integers nums and an integer threshold, choose a positive integer divisor. Divide all elements by it and sum the ceiling of all division results. Find the smallest divisor such that the result is less than or equal to threshold.',
    examples:
      'Input: nums = [1,2,5,9], threshold = 6\nOutput: 5\nExplanation: Using divisor 5, we get ceil(1/5)+ceil(2/5)+ceil(5/5)+ceil(9/5) = 1+1+1+2 = 5 <= 6',
    approach:
      'Binary search on the divisor value from 1 to max(nums). For each candidate divisor, compute the sum of ceilings. If the sum is within threshold, try a smaller divisor; otherwise try larger.',
    code: `import math

class Solution:
    def smallestDivisor(self, nums: list[int], threshold: int) -> int:
        lo, hi = 1, max(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if sum(math.ceil(x / mid) for x in nums) <= threshold:
                hi = mid
            else:
                lo = mid + 1
        return lo`,
    jsCode: `var smallestDivisor = function(nums, threshold) {
    let lo = 1, hi = Math.max(...nums);
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        const sum = nums.reduce((acc, x) => acc + Math.ceil(x / mid), 0);
        if (sum <= threshold) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }
    return lo;
};`,
    explanation:
      '1. Binary search on divisor d in range [1, max(nums)].\n' +
      '2. For each midpoint, compute sum of ceil(x / mid) for all x in nums.\n' +
      '3. If the sum is <= threshold, the divisor might work; try smaller by setting hi = mid.\n' +
      '4. If the sum exceeds threshold, divisor is too small; set lo = mid + 1.\n' +
      '5. When lo == hi, we have found the smallest valid divisor.',
    timeComplexity: 'O(n * log(max(nums)))',
    spaceComplexity: 'O(1)',
    hints: [
      'Larger divisors produce smaller sums. This monotonic relationship suggests binary search.',
      'Binary search on the divisor value, checking if the resulting sum meets the threshold.',
      'Use math.ceil or (x + d - 1) // d to compute ceiling division.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1286. Iterator for Combination
  // ---------------------------------------------------------------------------
  {
    id: 1286,
    description:
      'Design the CombinationIterator class. The constructor takes a string of sorted distinct lowercase characters and a combination length. Implement next() to return the next combination in lexicographic order, and hasNext() to check if a next combination exists.',
    examples:
      'Input: characters = "abc", combinationLength = 2\nCombinationIterator.next() -> "ab"\nCombinationIterator.next() -> "ac"\nCombinationIterator.next() -> "bc"\nCombinationIterator.hasNext() -> false',
    approach:
      'Pre-generate all combinations of the given length from the characters in lexicographic order using itertools.combinations, store them in a list, and use a pointer to track the current position.',
    code: `from itertools import combinations

class CombinationIterator:
    def __init__(self, characters: str, combinationLength: int):
        self.combos = [''.join(c) for c in combinations(characters, combinationLength)]
        self.idx = 0

    def next(self) -> str:
        result = self.combos[self.idx]
        self.idx += 1
        return result

    def hasNext(self) -> bool:
        return self.idx < len(self.combos)`,
    jsCode: `var CombinationIterator = function(characters, combinationLength) {
    this.combos = [];
    this.idx = 0;
    const generate = (start, current) => {
        if (current.length === combinationLength) {
            this.combos.push(current);
            return;
        }
        for (let i = start; i < characters.length; i++) {
            generate(i + 1, current + characters[i]);
        }
    };
    generate(0, '');
};

CombinationIterator.prototype.next = function() {
    return this.combos[this.idx++];
};

CombinationIterator.prototype.hasNext = function() {
    return this.idx < this.combos.length;
};`,
    explanation:
      '1. In the constructor, generate all combinations of the given length using itertools.combinations.\n' +
      '2. Since the input characters are sorted, combinations are naturally in lexicographic order.\n' +
      '3. Store all combinations in a list and maintain a pointer idx starting at 0.\n' +
      '4. next() returns the current combination and advances the pointer.\n' +
      '5. hasNext() checks if the pointer is within bounds.',
    timeComplexity: 'O(C(n,k)) for initialization, O(1) for next and hasNext',
    spaceComplexity: 'O(C(n,k) * k)',
    hints: [
      'You can pre-generate all valid combinations upfront.',
      'itertools.combinations on a sorted string yields results in lexicographic order.',
      'Maintain a pointer to track which combination to return next.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1288. Remove Covered Intervals
  // ---------------------------------------------------------------------------
  {
    id: 1288,
    description:
      'Given an array of intervals where intervals[i] = [li, ri], remove all intervals that are covered by another interval. Interval [a,b] is covered by [c,d] if c <= a and b <= d. Return the number of remaining intervals.',
    examples:
      'Input: intervals = [[1,4],[3,6],[2,8]]\nOutput: 2\nExplanation: Interval [3,6] is covered by [2,8], so it is removed.',
    approach:
      'Sort intervals by start ascending, then by end descending (so longer intervals come first among those with same start). Iterate and track the maximum right endpoint seen; if current right is within the tracked maximum, it is covered.',
    code: `class Solution:
    def removeCoveredIntervals(self, intervals: list[list[int]]) -> int:
        intervals.sort(key=lambda x: (x[0], -x[1]))
        count = 0
        max_right = 0
        for _, right in intervals:
            if right > max_right:
                count += 1
                max_right = right
        return count`,
    jsCode: `var removeCoveredIntervals = function(intervals) {
    intervals.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    let count = 0, maxRight = 0;
    for (const [, right] of intervals) {
        if (right > maxRight) {
            count++;
            maxRight = right;
        }
    }
    return count;
};`,
    explanation:
      '1. Sort by start ascending, then by end descending.\n' +
      '2. This ensures that for intervals with the same start, the longest comes first.\n' +
      '3. Track max_right as the farthest right endpoint seen so far.\n' +
      '4. If a current interval\'s right is not greater than max_right, it is covered.\n' +
      '5. Count only the non-covered intervals.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sort intervals by start point. What secondary sort order helps detect covered intervals?',
      'If you sort by start ascending and end descending, a covered interval will have a right endpoint <= the current maximum.',
      'Track the maximum right endpoint as you iterate.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1290. Convert Binary Number in a Linked List to Integer
  // ---------------------------------------------------------------------------
  {
    id: 1290,
    description:
      'Given head which is a reference node to a singly-linked list. The value of each node is either 0 or 1. The linked list holds the binary representation of a number. Return the decimal value of the number.',
    examples:
      'Input: head = [1,0,1]\nOutput: 5\nExplanation: (101) in binary = 5 in decimal',
    approach:
      'Traverse the linked list from head to tail. Maintain a running result by shifting left (multiply by 2) and adding the current node value. This builds the binary number bit by bit.',
    code: `# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def getDecimalValue(self, head: 'ListNode') -> int:
        result = 0
        while head:
            result = result * 2 + head.val
            head = head.next
        return result`,
    jsCode: `var getDecimalValue = function(head) {
    let result = 0;
    while (head) {
        result = result * 2 + head.val;
        head = head.next;
    }
    return result;
};`,
    explanation:
      '1. Initialize result = 0.\n' +
      '2. For each node, shift result left by 1 bit (multiply by 2) and add the node\'s value.\n' +
      '3. This processes the most significant bit first, building the number correctly.\n' +
      '4. Continue until we reach the end of the linked list.\n' +
      '5. Return the accumulated decimal result.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'How do you build a decimal number from binary digits left to right?',
      'For each new bit, multiply the current value by 2 and add the bit.',
      'Traverse the list once, accumulating the result.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1291. Sequential Digits
  // ---------------------------------------------------------------------------
  {
    id: 1291,
    description:
      'An integer has sequential digits if each digit in the number is one more than the previous digit. Return a sorted list of all integers in the range [low, high] that have sequential digits.',
    examples:
      'Input: low = 100, high = 300\nOutput: [123, 234]',
    approach:
      'Generate all possible sequential digit numbers. Starting digits range from 1 to 9, and for each starting digit, extend the sequence by appending the next digit. Collect those within [low, high] and sort.',
    code: `class Solution:
    def sequentialDigits(self, low: int, high: int) -> list[int]:
        result = []
        for start in range(1, 10):
            num = start
            nxt = start
            while num <= high and nxt < 10:
                if num >= low:
                    result.append(num)
                nxt += 1
                if nxt < 10:
                    num = num * 10 + nxt
        result.sort()
        return result`,
    jsCode: `var sequentialDigits = function(low, high) {
    const result = [];
    for (let start = 1; start <= 9; start++) {
        let num = start;
        let nxt = start;
        while (num <= high && nxt < 10) {
            if (num >= low) result.push(num);
            nxt++;
            if (nxt < 10) num = num * 10 + nxt;
        }
    }
    result.sort((a, b) => a - b);
    return result;
};`,
    explanation:
      '1. Try each starting digit from 1 to 9.\n' +
      '2. Build numbers by appending the next sequential digit (start+1, start+2, ...).\n' +
      '3. Stop when the number exceeds high or the next digit would exceed 9.\n' +
      '4. Collect numbers that fall within [low, high].\n' +
      '5. Sort the result since numbers from different starting digits may interleave.',
    timeComplexity: 'O(1) since there are at most 36 sequential digit numbers',
    spaceComplexity: 'O(1)',
    hints: [
      'There are very few sequential digit numbers (at most 36). Can you enumerate all of them?',
      'Start from each digit 1-9 and keep appending the next consecutive digit.',
      'Filter the generated numbers by the [low, high] range.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1297. Maximum Number of Occurrences of a Substring
  // ---------------------------------------------------------------------------
  {
    id: 1297,
    description:
      'Given a string s, return the maximum number of occurrences of any substring under the rules: the number of unique characters in the substring must be at most maxLetters, and the substring size must be between minSize and maxSize inclusive.',
    examples:
      'Input: s = "aababcaab", maxLetters = 2, minSize = 3, maxSize = 4\nOutput: 2\nExplanation: Substring "aab" has 2 unique characters and occurs 2 times.',
    approach:
      'Only check substrings of length minSize, since any valid substring of length minSize that appears k times also means some longer substring appears at most k times. Use a sliding window of size minSize, count unique characters, and track frequency of valid substrings.',
    code: `from collections import Counter

class Solution:
    def maxFreq(self, s: str, maxLetters: int, minSize: int, maxSize: int) -> int:
        count = Counter()
        for i in range(len(s) - minSize + 1):
            sub = s[i:i + minSize]
            if len(set(sub)) <= maxLetters:
                count[sub] += 1
        return max(count.values()) if count else 0`,
    jsCode: `var maxFreq = function(s, maxLetters, minSize, maxSize) {
    const count = new Map();
    for (let i = 0; i <= s.length - minSize; i++) {
        const sub = s.substring(i, i + minSize);
        if (new Set(sub).size <= maxLetters) {
            count.set(sub, (count.get(sub) || 0) + 1);
        }
    }
    let max = 0;
    for (const v of count.values()) max = Math.max(max, v);
    return max;
};`,
    explanation:
      '1. We only need to consider substrings of length minSize.\n' +
      '2. A longer valid substring would appear at most as many times as its shorter sub-parts.\n' +
      '3. Slide a window of size minSize over the string.\n' +
      '4. Check if the unique character count is within maxLetters.\n' +
      '5. Track the frequency of each valid substring and return the maximum.',
    timeComplexity: 'O(n * minSize)',
    spaceComplexity: 'O(n)',
    hints: [
      'Do you really need to check all sizes from minSize to maxSize?',
      'A substring of minSize that occurs k times is always at least as frequent as any longer substring containing it.',
      'Use a frequency counter on all valid substrings of length minSize.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1300. Sum of Mutated Array Closest to Target
  // ---------------------------------------------------------------------------
  {
    id: 1300,
    description:
      'Given an integer array arr and a target value, find a value such that when you change all integers larger than that value to equal that value, the sum of the array gets as close to target as possible. If there is a tie, return the smaller value.',
    examples:
      'Input: arr = [4,9,3], target = 10\nOutput: 3\nExplanation: When using value 3, the array becomes [3,3,3] summing to 9 which is closest to 10.',
    approach:
      'Binary search on the answer value from 0 to max(arr). For each candidate value, compute the clamped sum. Find the value that minimizes abs(sum - target), preferring smaller values on ties.',
    code: `class Solution:
    def findBestValue(self, arr: list[int], target: int) -> int:
        arr.sort()
        n = len(arr)
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + arr[i]

        lo, hi = 0, max(arr)
        best_val, best_diff = 0, float('inf')
        while lo <= hi:
            mid = (lo + hi) // 2
            # find how many elements are <= mid
            import bisect
            idx = bisect.bisect_right(arr, mid)
            s = prefix[idx] + mid * (n - idx)
            diff = abs(s - target)
            if diff < best_diff or (diff == best_diff and mid < best_val):
                best_diff = diff
                best_val = mid
            if s < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return best_val`,
    jsCode: `var findBestValue = function(arr, target) {
    arr.sort((a, b) => a - b);
    const n = arr.length;
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + arr[i];

    let lo = 0, hi = Math.max(...arr);
    let bestVal = 0, bestDiff = Infinity;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        let idx = 0;
        let left2 = 0, right2 = n;
        while (left2 < right2) {
            const m = Math.floor((left2 + right2) / 2);
            if (arr[m] <= mid) left2 = m + 1;
            else right2 = m;
        }
        idx = left2;
        const s = prefix[idx] + mid * (n - idx);
        const diff = Math.abs(s - target);
        if (diff < bestDiff || (diff === bestDiff && mid < bestVal)) {
            bestDiff = diff;
            bestVal = mid;
        }
        if (s < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return bestVal;
};`,
    explanation:
      '1. Sort the array and build a prefix sum for efficient range sum queries.\n' +
      '2. Binary search on value v in [0, max(arr)].\n' +
      '3. For each v, use bisect to find how many elements are <= v.\n' +
      '4. Compute clamped sum: prefix[idx] + v * (n - idx).\n' +
      '5. Track the value with smallest absolute difference to target, preferring smaller values on ties.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The clamped sum is monotonically non-decreasing as the value increases.',
      'Binary search on the value and compute the clamped sum efficiently.',
      'Use prefix sums and binary search (bisect) to compute the sum in O(log n).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1302. Deepest Leaves Sum
  // ---------------------------------------------------------------------------
  {
    id: 1302,
    description:
      'Given the root of a binary tree, return the sum of values of its deepest leaves. The deepest leaves are the leaf nodes at the maximum depth of the tree.',
    examples:
      'Input: root = [1,2,3,4,5,null,6,7,null,null,null,null,8]\nOutput: 15\nExplanation: The deepest leaves are nodes 7 and 8 with sum 15.',
    approach:
      'Use BFS (level-order traversal). Process the tree level by level. The sum of the last level processed is the answer.',
    code: `from collections import deque

class Solution:
    def deepestLeavesSum(self, root) -> int:
        if not root:
            return 0
        q = deque([root])
        while q:
            level_sum = 0
            for _ in range(len(q)):
                node = q.popleft()
                level_sum += node.val
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
        return level_sum`,
    jsCode: `var deepestLeavesSum = function(root) {
    if (!root) return 0;
    let q = [root];
    let levelSum = 0;
    while (q.length) {
        levelSum = 0;
        const nextQ = [];
        for (const node of q) {
            levelSum += node.val;
            if (node.left) nextQ.push(node.left);
            if (node.right) nextQ.push(node.right);
        }
        q = nextQ;
    }
    return levelSum;
};`,
    explanation:
      '1. Start BFS with the root in the queue.\n' +
      '2. For each level, compute the sum of all node values in that level.\n' +
      '3. After processing all children, if the queue is empty, this was the deepest level.\n' +
      '4. Return the last level_sum computed.\n' +
      '5. This naturally gives us the sum of the deepest leaves.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'BFS processes the tree level by level. The last level contains the deepest leaves.',
      'Sum each level as you go. The final level sum is your answer.',
      'Alternatively, use DFS to find the max depth first, then sum nodes at that depth.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1310. XOR Queries of a Subarray
  // ---------------------------------------------------------------------------
  {
    id: 1310,
    description:
      'You are given an array arr of positive integers and an array queries where queries[i] = [Li, Ri]. For each query, compute the XOR of elements from index Li to Ri (inclusive). Return an array containing the result for each query.',
    examples:
      'Input: arr = [1,3,4,8], queries = [[0,1],[1,2],[0,3],[3,3]]\nOutput: [2,7,14,8]',
    approach:
      'Build a prefix XOR array where prefix[i] = arr[0] XOR arr[1] XOR ... XOR arr[i-1]. Then XOR from index L to R is prefix[R+1] XOR prefix[L], because XOR is its own inverse.',
    code: `class Solution:
    def xorQueries(self, arr: list[int], queries: list[list[int]]) -> list[int]:
        n = len(arr)
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] ^ arr[i]
        return [prefix[r + 1] ^ prefix[l] for l, r in queries]`,
    jsCode: `var xorQueries = function(arr, queries) {
    const n = arr.length;
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] ^ arr[i];
    return queries.map(([l, r]) => prefix[r + 1] ^ prefix[l]);
};`,
    explanation:
      '1. Build prefix XOR array where prefix[0] = 0 and prefix[i+1] = prefix[i] ^ arr[i].\n' +
      '2. XOR of range [L, R] = prefix[R+1] ^ prefix[L].\n' +
      '3. This works because a ^ a = 0, so prefix[R+1] ^ prefix[L] cancels out elements before L.\n' +
      '4. Process each query in O(1) using the prefix array.\n' +
      '5. Return the list of results.',
    timeComplexity: 'O(n + q) where q is the number of queries',
    spaceComplexity: 'O(n)',
    hints: [
      'XOR has the property that a ^ a = 0 and a ^ 0 = a.',
      'Similar to prefix sums, you can build a prefix XOR array.',
      'XOR of range [L, R] = prefixXOR[R+1] ^ prefixXOR[L].',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1312. Minimum Insertion Steps to Make a String Palindrome
  // ---------------------------------------------------------------------------
  {
    id: 1312,
    description:
      'Given a string s. In one step you can insert any character at any position of the string. Return the minimum number of steps to make s a palindrome.',
    examples:
      'Input: s = "zzazz"\nOutput: 0\nExplanation: The string is already a palindrome.',
    approach:
      'The minimum insertions equals len(s) - LPS (Longest Palindromic Subsequence). LPS can be found by computing the LCS (Longest Common Subsequence) of s and its reverse.',
    code: `class Solution:
    def minInsertions(self, s: str) -> int:
        n = len(s)
        rev = s[::-1]
        dp = [0] * (n + 1)
        for i in range(1, n + 1):
            prev = [0] * (n + 1)
            for j in range(1, n + 1):
                if s[i - 1] == rev[j - 1]:
                    prev[j] = dp[j - 1] + 1
                else:
                    prev[j] = max(dp[j], prev[j - 1])
            dp = prev
        return n - dp[n]`,
    jsCode: `var minInsertions = function(s) {
    const n = s.length;
    const rev = s.split('').reverse().join('');
    let dp = new Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) {
        const prev = new Array(n + 1).fill(0);
        for (let j = 1; j <= n; j++) {
            if (s[i - 1] === rev[j - 1]) {
                prev[j] = dp[j - 1] + 1;
            } else {
                prev[j] = Math.max(dp[j], prev[j - 1]);
            }
        }
        dp = prev;
    }
    return n - dp[n];
};`,
    explanation:
      '1. The minimum insertions to make s a palindrome equals n - LPS(s).\n' +
      '2. LPS(s) = LCS(s, reverse(s)).\n' +
      '3. Use standard DP for LCS with space optimization (two rows).\n' +
      '4. dp[j] holds LCS values from the previous row.\n' +
      '5. The answer is n minus the LCS length.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    hints: [
      'How is making a string a palindrome related to finding its longest palindromic subsequence?',
      'Minimum insertions = length - longest palindromic subsequence.',
      'LPS can be found using LCS of the string and its reverse.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1318. Minimum Flips to Make a OR b Equal to c
  // ---------------------------------------------------------------------------
  {
    id: 1318,
    description:
      'Given three positive numbers a, b, and c, return the minimum number of flips required in some bits of a and b to make (a OR b) == c. A flip operation changes a single bit from 0 to 1 or from 1 to 0.',
    examples:
      'Input: a = 2, b = 6, c = 5\nOutput: 3',
    approach:
      'Check each bit position. If the bit in c is 1, at least one of a or b must have a 1 (flip one if neither does). If the bit in c is 0, both a and b must be 0 (flip each one that is 1).',
    code: `class Solution:
    def minFlips(self, a: int, b: int, c: int) -> int:
        flips = 0
        for i in range(30):
            ba = (a >> i) & 1
            bb = (b >> i) & 1
            bc = (c >> i) & 1
            if bc == 1:
                if ba == 0 and bb == 0:
                    flips += 1
            else:
                flips += ba + bb
        return flips`,
    jsCode: `var minFlips = function(a, b, c) {
    let flips = 0;
    for (let i = 0; i < 30; i++) {
        const ba = (a >> i) & 1;
        const bb = (b >> i) & 1;
        const bc = (c >> i) & 1;
        if (bc === 1) {
            if (ba === 0 && bb === 0) flips++;
        } else {
            flips += ba + bb;
        }
    }
    return flips;
};`,
    explanation:
      '1. Iterate through each bit position (up to 30 bits).\n' +
      '2. Extract the bit from a, b, and c at position i.\n' +
      '3. If c\'s bit is 1: we need at least one 1 in a or b. If both are 0, flip one (cost 1).\n' +
      '4. If c\'s bit is 0: both a and b must be 0. Each 1 bit needs a flip.\n' +
      '5. Sum up all required flips.',
    timeComplexity: 'O(1) (at most 30 iterations)',
    spaceComplexity: 'O(1)',
    hints: [
      'Analyze bit by bit what (a OR b) should produce versus what c requires.',
      'If c has a 0 bit, both a and b must be 0 at that position.',
      'If c has a 1 bit, at least one of a or b must be 1.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1319. Number of Operations to Make Network Connected
  // ---------------------------------------------------------------------------
  {
    id: 1319,
    description:
      'There are n computers numbered from 0 to n-1 connected by ethernet cables forming a network. You are given connections where connections[i] = [ai, bi] represents a connection between computers ai and bi. You can remove a cable between two directly connected computers and place it between any pair. Return the minimum number of operations to connect all computers, or -1 if impossible.',
    examples:
      'Input: n = 4, connections = [[0,1],[0,2],[1,2]]\nOutput: 1',
    approach:
      'We need at least n-1 cables to connect n computers. If we have fewer cables, return -1. Otherwise, count the number of connected components using Union-Find or DFS. We need (components - 1) operations to merge them.',
    code: `class Solution:
    def makeConnected(self, n: int, connections: list[list[int]]) -> int:
        if len(connections) < n - 1:
            return -1
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        components = n
        for a, b in connections:
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
                components -= 1
        return components - 1`,
    jsCode: `var makeConnected = function(n, connections) {
    if (connections.length < n - 1) return -1;
    const parent = Array.from({length: n}, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    let components = n;
    for (const [a, b] of connections) {
        const ra = find(a), rb = find(b);
        if (ra !== rb) {
            parent[ra] = rb;
            components--;
        }
    }
    return components - 1;
};`,
    explanation:
      '1. If total cables < n-1, it is impossible to connect all computers; return -1.\n' +
      '2. Use Union-Find to count connected components.\n' +
      '3. Start with n components (each computer is its own component).\n' +
      '4. For each connection, union the two computers; if they were in different components, decrease count.\n' +
      '5. The answer is components - 1 (number of merge operations needed).',
    timeComplexity: 'O(n + E * alpha(n)) where E is the number of connections',
    spaceComplexity: 'O(n)',
    hints: [
      'You need at least n-1 edges to connect n nodes. If you have fewer, return -1.',
      'Extra edges (redundant connections) can be repurposed to connect separate components.',
      'Count connected components; the answer is components - 1.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1323. Maximum 69 Number
  // ---------------------------------------------------------------------------
  {
    id: 1323,
    description:
      'You are given a positive integer num consisting only of digits 6 and 9. Return the maximum number you can get by changing at most one digit (6 becomes 9 or 9 becomes 6).',
    examples:
      'Input: num = 9669\nOutput: 9969\nExplanation: Changing the first 6 to 9 gives 9969, the largest number.',
    approach:
      'Convert to string, find the first occurrence of 6, and replace it with 9. Changing the leftmost 6 to 9 gives the maximum increase.',
    code: `class Solution:
    def maximum69Number(self, num: int) -> int:
        s = str(num)
        s = s.replace('6', '9', 1)
        return int(s)`,
    jsCode: `var maximum69Number = function(num) {
    const s = String(num).replace('6', '9');
    return parseInt(s);
};`,
    explanation:
      '1. Convert the number to a string.\n' +
      '2. Find and replace the first occurrence of \'6\' with \'9\'.\n' +
      '3. The leftmost \'6\' contributes the most to the number\'s value, so changing it gives the maximum.\n' +
      '4. If there is no \'6\', the number is already all 9s and is already maximum.\n' +
      '5. Convert back to integer and return.',
    timeComplexity: 'O(d) where d is the number of digits',
    spaceComplexity: 'O(d)',
    hints: [
      'To maximize the number, you want to increase the most significant digit possible.',
      'Find the first 6 (leftmost) and change it to 9.',
      'If all digits are already 9, the number is already maximized.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1326. Minimum Number of Taps to Open to Water a Garden
  // ---------------------------------------------------------------------------
  {
    id: 1326,
    description:
      'There is a one-dimensional garden on the x-axis from 0 to n. At each point i there is a tap that can water the area [i - ranges[i], i + ranges[i]]. Return the minimum number of taps to open to water the whole garden, or -1 if the garden cannot be watered.',
    examples:
      'Input: n = 5, ranges = [3,4,1,1,0,0]\nOutput: 1\nExplanation: The tap at point 1 can cover [-3,5], which covers the entire garden.',
    approach:
      'Convert each tap to an interval [max(0, i-ranges[i]), min(n, i+ranges[i])]. Then solve the interval covering problem greedily: always extend as far right as possible from the current position.',
    code: `class Solution:
    def minTaps(self, n: int, ranges: list[int]) -> int:
        max_reach = [0] * (n + 1)
        for i, r in enumerate(ranges):
            left = max(0, i - r)
            right = min(n, i + r)
            max_reach[left] = max(max_reach[left], right)

        taps = 0
        cur_end = 0
        far = 0
        for i in range(n + 1):
            if i > far:
                return -1
            far = max(far, max_reach[i])
            if i == cur_end and i < n:
                taps += 1
                cur_end = far
        return taps`,
    jsCode: `var minTaps = function(n, ranges) {
    const maxReach = new Array(n + 1).fill(0);
    for (let i = 0; i <= n; i++) {
        const left = Math.max(0, i - ranges[i]);
        const right = Math.min(n, i + ranges[i]);
        maxReach[left] = Math.max(maxReach[left], right);
    }
    let taps = 0, curEnd = 0, far = 0;
    for (let i = 0; i <= n; i++) {
        if (i > far) return -1;
        far = Math.max(far, maxReach[i]);
        if (i === curEnd && i < n) {
            taps++;
            curEnd = far;
        }
    }
    return taps;
};`,
    explanation:
      '1. For each tap, compute its interval and record the farthest reach from each left endpoint.\n' +
      '2. Use a greedy jump game approach: track cur_end (current coverage) and far (farthest reachable).\n' +
      '3. When we reach cur_end, we must open another tap to extend to far.\n' +
      '4. If at any point i > far, the garden cannot be fully watered; return -1.\n' +
      '5. Count the number of taps opened.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'This is equivalent to the minimum interval covering problem.',
      'Transform taps into intervals and use a greedy approach similar to Jump Game II.',
      'Track the farthest you can reach from each position.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1329. Sort the Matrix Diagonally
  // ---------------------------------------------------------------------------
  {
    id: 1329,
    description:
      'A matrix diagonal is a diagonal line of cells starting from some cell in either the topmost row or leftmost column and going in the bottom-right direction. Sort each matrix diagonal in ascending order and return the resulting matrix.',
    examples:
      'Input: mat = [[3,3,1,1],[2,2,1,2],[1,1,1,2]]\nOutput: [[1,1,1,1],[1,2,2,2],[1,2,3,3]]',
    approach:
      'Group cells by their diagonal (cells on the same diagonal have the same i-j value). Sort each group, then place them back into the matrix.',
    code: `from collections import defaultdict

class Solution:
    def diagonalSort(self, mat: list[list[int]]) -> list[list[int]]:
        m, n = len(mat), len(mat[0])
        diags = defaultdict(list)
        for i in range(m):
            for j in range(n):
                diags[i - j].append(mat[i][j])
        for key in diags:
            diags[key].sort()
        idx = defaultdict(int)
        for i in range(m):
            for j in range(n):
                mat[i][j] = diags[i - j][idx[i - j]]
                idx[i - j] += 1
        return mat`,
    jsCode: `var diagonalSort = function(mat) {
    const m = mat.length, n = mat[0].length;
    const diags = new Map();
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const key = i - j;
            if (!diags.has(key)) diags.set(key, []);
            diags.get(key).push(mat[i][j]);
        }
    }
    for (const [key, arr] of diags) arr.sort((a, b) => a - b);
    const idx = new Map();
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const key = i - j;
            const pos = idx.get(key) || 0;
            mat[i][j] = diags.get(key)[pos];
            idx.set(key, pos + 1);
        }
    }
    return mat;
};`,
    explanation:
      '1. All cells (i, j) on the same diagonal have the same value of i - j.\n' +
      '2. Group all values by their diagonal key i - j.\n' +
      '3. Sort each diagonal group independently.\n' +
      '4. Place the sorted values back into the matrix by iterating in the same order.\n' +
      '5. Use an index tracker for each diagonal to assign values sequentially.',
    timeComplexity: 'O(m * n * log(min(m,n)))',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Cells on the same diagonal share the same i-j value.',
      'Group cells by diagonal, sort each group, and place them back.',
      'Iterate the matrix in row-major order both for collecting and placing back values.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1334. Find the City With the Smallest Number of Neighbors at a Threshold Distance
  // ---------------------------------------------------------------------------
  {
    id: 1334,
    description:
      'There are n cities numbered from 0 to n-1. Given edges representing weighted undirected roads between cities and a distanceThreshold, find the city with the smallest number of cities reachable within the threshold. If there is a tie, return the city with the greatest number.',
    examples:
      'Input: n = 4, edges = [[0,1,3],[1,2,1],[1,3,4],[2,3,1]], distanceThreshold = 4\nOutput: 3',
    approach:
      'Use Floyd-Warshall to compute shortest paths between all pairs of cities. For each city, count how many other cities are reachable within the threshold. Return the city with the smallest count, breaking ties by largest city number.',
    code: `class Solution:
    def findTheCity(self, n: int, edges: list[list[int]], distanceThreshold: int) -> int:
        dist = [[float('inf')] * n for _ in range(n)]
        for i in range(n):
            dist[i][i] = 0
        for u, v, w in edges:
            dist[u][v] = w
            dist[v][u] = w
        for k in range(n):
            for i in range(n):
                for j in range(n):
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
        best_city = -1
        best_count = float('inf')
        for i in range(n):
            count = sum(1 for j in range(n) if j != i and dist[i][j] <= distanceThreshold)
            if count <= best_count:
                best_count = count
                best_city = i
        return best_city`,
    jsCode: `var findTheCity = function(n, edges, distanceThreshold) {
    const dist = Array.from({length: n}, () => new Array(n).fill(Infinity));
    for (let i = 0; i < n; i++) dist[i][i] = 0;
    for (const [u, v, w] of edges) {
        dist[u][v] = w;
        dist[v][u] = w;
    }
    for (let k = 0; k < n; k++)
        for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++)
                dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
    let bestCity = -1, bestCount = Infinity;
    for (let i = 0; i < n; i++) {
        let count = 0;
        for (let j = 0; j < n; j++) if (j !== i && dist[i][j] <= distanceThreshold) count++;
        if (count <= bestCount) {
            bestCount = count;
            bestCity = i;
        }
    }
    return bestCity;
};`,
    explanation:
      '1. Initialize distance matrix with infinity, 0 for self-loops, and edge weights.\n' +
      '2. Run Floyd-Warshall to compute all-pairs shortest paths.\n' +
      '3. For each city, count how many other cities are within distanceThreshold.\n' +
      '4. Track the city with the smallest count; on ties, prefer the larger city number.\n' +
      '5. Using <= in the comparison naturally picks the largest-numbered city on ties.',
    timeComplexity: 'O(n^3)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'You need shortest paths between all pairs of cities.',
      'Floyd-Warshall gives all-pairs shortest paths in O(n^3).',
      'Count reachable cities for each city and pick the one with the fewest, preferring larger city numbers.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1335. Minimum Difficulty of a Job Schedule
  // ---------------------------------------------------------------------------
  {
    id: 1335,
    description:
      'You want to schedule a list of jobs in d days. Jobs are dependent so you must finish jobs in order. The difficulty of a day is the maximum difficulty of a job done that day. The difficulty of the schedule is the sum of difficulties of each day. Return the minimum difficulty, or -1 if impossible.',
    examples:
      'Input: jobDifficulty = [6,5,4,3,2,1], d = 2\nOutput: 7\nExplanation: Day 1: [6,5,4,3,2], difficulty 6. Day 2: [1], difficulty 1. Total = 7.',
    approach:
      'Use DP where dp[i][k] = minimum difficulty to schedule the first i jobs in k days. For each day k, try all possible splits: the last day covers jobs j+1 to i, with difficulty being the max in that range.',
    code: `class Solution:
    def minDifficulty(self, jobDifficulty: list[int], d: int) -> int:
        n = len(jobDifficulty)
        if n < d:
            return -1
        dp = [[float('inf')] * (d + 1) for _ in range(n + 1)]
        dp[0][0] = 0
        for i in range(1, n + 1):
            for k in range(1, min(i, d) + 1):
                max_d = 0
                for j in range(i, k - 1, -1):
                    max_d = max(max_d, jobDifficulty[j - 1])
                    dp[i][k] = min(dp[i][k], dp[j - 1][k - 1] + max_d)
        return dp[n][d]`,
    jsCode: `var minDifficulty = function(jobDifficulty, d) {
    const n = jobDifficulty.length;
    if (n < d) return -1;
    const dp = Array.from({length: n + 1}, () => new Array(d + 1).fill(Infinity));
    dp[0][0] = 0;
    for (let i = 1; i <= n; i++) {
        for (let k = 1; k <= Math.min(i, d); k++) {
            let maxD = 0;
            for (let j = i; j >= k; j--) {
                maxD = Math.max(maxD, jobDifficulty[j - 1]);
                dp[i][k] = Math.min(dp[i][k], dp[j - 1][k - 1] + maxD);
            }
        }
    }
    return dp[n][d];
};`,
    explanation:
      '1. dp[i][k] = min difficulty to finish first i jobs in k days.\n' +
      '2. Base case: dp[0][0] = 0 (no jobs, no days).\n' +
      '3. For each (i, k), try placing the last day\'s jobs as j..i for all valid j.\n' +
      '4. The difficulty of the last day is the max job difficulty in range [j, i].\n' +
      '5. dp[i][k] = min over all j of (dp[j-1][k-1] + max difficulty of jobs j..i).',
    timeComplexity: 'O(n^2 * d)',
    spaceComplexity: 'O(n * d)',
    hints: [
      'If n < d, it is impossible since each day needs at least one job.',
      'Use DP with states (number of jobs completed, number of days used).',
      'For each day, iterate backwards to track the running maximum difficulty.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1337. The K Weakest Rows in a Matrix
  // ---------------------------------------------------------------------------
  {
    id: 1337,
    description:
      'You are given an m x n binary matrix mat of 1s (soldiers) and 0s (civilians). Soldiers are always positioned to the left of civilians in each row. Return the indices of the k weakest rows in the matrix ordered from weakest to strongest. A row is weaker if it has fewer soldiers, or the same number but a smaller row index.',
    examples:
      'Input: mat = [[1,1,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,0,0,0],[1,1,1,1,1]], k = 3\nOutput: [2,0,3]',
    approach:
      'Count soldiers in each row (sum of 1s or binary search for the first 0). Sort rows by (soldier_count, row_index) and return the first k indices.',
    code: `class Solution:
    def kWeakestRows(self, mat: list[list[int]], k: int) -> list[int]:
        strength = [(sum(row), i) for i, row in enumerate(mat)]
        strength.sort()
        return [i for _, i in strength[:k]]`,
    jsCode: `var kWeakestRows = function(mat, k) {
    const strength = mat.map((row, i) => [row.reduce((a, b) => a + b, 0), i]);
    strength.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return strength.slice(0, k).map(([, i]) => i);
};`,
    explanation:
      '1. For each row, compute its strength as the sum of 1s (number of soldiers).\n' +
      '2. Pair each strength with the row index.\n' +
      '3. Sort by (strength, index). Python tuples sort lexicographically, so ties break by index.\n' +
      '4. Return the first k row indices from the sorted list.\n' +
      '5. This gives the k weakest rows ordered from weakest to strongest.',
    timeComplexity: 'O(m * n + m log m)',
    spaceComplexity: 'O(m)',
    hints: [
      'Count the soldiers in each row. Since soldiers are left-aligned, you can use binary search or sum.',
      'Sort rows by (soldier count, row index).',
      'Return the first k indices after sorting.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1338. Reduce Array Size to The Half
  // ---------------------------------------------------------------------------
  {
    id: 1338,
    description:
      'You are given an integer array arr. You can choose a set of integers and remove all occurrences of those integers from the array. Return the minimum size of the set so that at least half of the integers of the array are removed.',
    examples:
      'Input: arr = [3,3,3,3,5,5,5,2,2,7]\nOutput: 2\nExplanation: Choosing {3,7} removes 5 elements. Choosing {3,5} removes 7 elements which is >= 5.',
    approach:
      'Count frequencies, sort in descending order, and greedily pick the most frequent values until removed elements reach half the array size.',
    code: `from collections import Counter

class Solution:
    def minSetSize(self, arr: list[int]) -> int:
        counts = sorted(Counter(arr).values(), reverse=True)
        removed = 0
        half = len(arr) // 2
        for i, c in enumerate(counts):
            removed += c
            if removed >= half:
                return i + 1
        return len(counts)`,
    jsCode: `var minSetSize = function(arr) {
    const freq = new Map();
    for (const x of arr) freq.set(x, (freq.get(x) || 0) + 1);
    const counts = [...freq.values()].sort((a, b) => b - a);
    let removed = 0;
    const half = Math.floor(arr.length / 2);
    for (let i = 0; i < counts.length; i++) {
        removed += counts[i];
        if (removed >= half) return i + 1;
    }
    return counts.length;
};`,
    explanation:
      '1. Count the frequency of each element.\n' +
      '2. Sort frequencies in descending order.\n' +
      '3. Greedily remove the most frequent elements first.\n' +
      '4. Once the total removed count reaches at least half the array size, return the set size.\n' +
      '5. This greedy approach minimizes the number of distinct values needed.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'To minimize the set size, always remove the most frequent elements first.',
      'Count frequencies, sort them in descending order, and greedily accumulate.',
      'Stop when the accumulated removed count reaches half the array length.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1339. Maximum Product of Splitted Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 1339,
    description:
      'Given the root of a binary tree, split the tree into two subtrees by removing one edge. Return the maximum product of the sums of the two subtrees, modulo 10^9 + 7.',
    examples:
      'Input: root = [1,2,3,4,5,6]\nOutput: 110\nExplanation: Remove edge between 1 and 3. Sums are 11 and 10. Product = 110.',
    approach:
      'First compute the total sum. Then use DFS to compute the subtree sum at each node. For each subtree with sum s, the product of splitting there is s * (total - s). Track the maximum.',
    code: `class Solution:
    def maxProduct(self, root) -> int:
        MOD = 10**9 + 7
        subtree_sums = []

        def dfs(node):
            if not node:
                return 0
            s = node.val + dfs(node.left) + dfs(node.right)
            subtree_sums.append(s)
            return s

        total = dfs(root)
        max_prod = 0
        for s in subtree_sums:
            max_prod = max(max_prod, s * (total - s))
        return max_prod % MOD`,
    jsCode: `var maxProduct = function(root) {
    const MOD = 1000000007n;
    const subtreeSums = [];
    const dfs = (node) => {
        if (!node) return 0;
        const s = node.val + dfs(node.left) + dfs(node.right);
        subtreeSums.push(s);
        return s;
    };
    const total = dfs(root);
    let maxProd = 0n;
    for (const s of subtreeSums) {
        const prod = BigInt(s) * BigInt(total - s);
        if (prod > maxProd) maxProd = prod;
    }
    return Number(maxProd % MOD);
};`,
    explanation:
      '1. DFS computes the subtree sum rooted at each node and stores all sums.\n' +
      '2. The total tree sum is the subtree sum of the root.\n' +
      '3. Removing an edge above a node with subtree sum s produces two parts: s and (total - s).\n' +
      '4. The product is s * (total - s). We maximize this over all nodes.\n' +
      '5. Return the maximum product modulo 10^9 + 7.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Compute the total sum of the tree first.',
      'For each subtree with sum s, removing its edge gives product s * (total - s).',
      'Use DFS to compute all subtree sums in one pass.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1340. Jump Game V
  // ---------------------------------------------------------------------------
  {
    id: 1340,
    description:
      'Given an array of integers arr and an integer d. In one step you can jump from index i to index j if: i - d <= j < i or i < j <= i + d, and arr[i] > arr[k] for all k between i and j. Return the maximum number of indices you can visit.',
    examples:
      'Input: arr = [6,4,14,6,8,13,9,7,10,6,12], d = 2\nOutput: 4',
    approach:
      'Use DFS with memoization. Sort indices by height so that we process shorter bars first. For each index, try jumping left and right within distance d, ensuring all intermediate values are strictly lower.',
    code: `from functools import lru_cache

class Solution:
    def maxJumps(self, arr: list[int], d: int) -> int:
        n = len(arr)

        @lru_cache(maxsize=None)
        def dp(i):
            best = 1
            for direction in (-1, 1):
                for j in range(1, d + 1):
                    nxt = i + direction * j
                    if nxt < 0 or nxt >= n or arr[nxt] >= arr[i]:
                        break
                    best = max(best, 1 + dp(nxt))
            return best

        return max(dp(i) for i in range(n))`,
    jsCode: `var maxJumps = function(arr, d) {
    const n = arr.length;
    const memo = new Array(n).fill(-1);
    const dp = (i) => {
        if (memo[i] !== -1) return memo[i];
        let best = 1;
        for (const dir of [-1, 1]) {
            for (let j = 1; j <= d; j++) {
                const nxt = i + dir * j;
                if (nxt < 0 || nxt >= n || arr[nxt] >= arr[i]) break;
                best = Math.max(best, 1 + dp(nxt));
            }
        }
        memo[i] = best;
        return best;
    };
    let result = 0;
    for (let i = 0; i < n; i++) result = Math.max(result, dp(i));
    return result;
};`,
    explanation:
      '1. dp(i) returns the maximum number of indices visitable starting from index i.\n' +
      '2. From index i, try jumping left (direction=-1) and right (direction=1) up to d steps.\n' +
      '3. For each direction, iterate step by step. If any intermediate bar is >= arr[i], stop.\n' +
      '4. Recursively compute dp for each valid landing index and take the best.\n' +
      '5. The answer is the maximum dp(i) across all starting indices.',
    timeComplexity: 'O(n * d)',
    spaceComplexity: 'O(n)',
    hints: [
      'Think of DP where dp[i] = max indices visitable starting from i.',
      'From each index, try both directions up to d steps, stopping at any bar >= current.',
      'Use memoization to avoid recomputation.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1342. Number of Steps to Reduce a Number to Zero
  // ---------------------------------------------------------------------------
  {
    id: 1342,
    description:
      'Given an integer num, return the number of steps to reduce it to zero. In each step, if the current number is even, divide it by 2, otherwise subtract 1 from it.',
    examples:
      'Input: num = 14\nOutput: 6\nExplanation: 14 -> 7 -> 6 -> 3 -> 2 -> 1 -> 0',
    approach:
      'Simulate the process. While num is not zero, if it is even divide by 2, if odd subtract 1. Count each step.',
    code: `class Solution:
    def numberOfSteps(self, num: int) -> int:
        steps = 0
        while num > 0:
            if num % 2 == 0:
                num //= 2
            else:
                num -= 1
            steps += 1
        return steps`,
    jsCode: `var numberOfSteps = function(num) {
    let steps = 0;
    while (num > 0) {
        if (num % 2 === 0) {
            num = Math.floor(num / 2);
        } else {
            num--;
        }
        steps++;
    }
    return steps;
};`,
    explanation:
      '1. Initialize steps counter to 0.\n' +
      '2. While num > 0, check if num is even or odd.\n' +
      '3. If even, divide by 2. If odd, subtract 1.\n' +
      '4. Increment steps after each operation.\n' +
      '5. Return steps when num reaches 0.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Simply simulate the process described.',
      'Even numbers get halved, odd numbers get decremented.',
      'Each division roughly halves the number, so at most O(log n) steps.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1345. Jump Game IV
  // ---------------------------------------------------------------------------
  {
    id: 1345,
    description:
      'Given an array of integers arr, you are initially at index 0. In one step, you can jump from index i to i+1, i-1, or any index j where arr[i] == arr[j]. Return the minimum number of steps to reach the last index.',
    examples:
      'Input: arr = [100,-23,-23,404,100,23,23,23,3,404]\nOutput: 3\nExplanation: 0 -> 4 -> 3 -> 9',
    approach:
      'Use BFS. Build a map from value to list of indices. From each index, neighbors are i-1, i+1, and all indices with the same value. After visiting all same-value indices, clear that group to avoid revisiting.',
    code: `from collections import defaultdict, deque

class Solution:
    def minJumps(self, arr: list[int]) -> int:
        n = len(arr)
        if n <= 1:
            return 0
        graph = defaultdict(list)
        for i, val in enumerate(arr):
            graph[val].append(i)
        visited = [False] * n
        visited[0] = True
        q = deque([0])
        steps = 0
        while q:
            steps += 1
            for _ in range(len(q)):
                i = q.popleft()
                for nxt in [i - 1, i + 1] + graph[arr[i]]:
                    if 0 <= nxt < n and not visited[nxt]:
                        if nxt == n - 1:
                            return steps
                        visited[nxt] = True
                        q.append(nxt)
                graph[arr[i]] = []  # clear to avoid revisiting
        return -1`,
    jsCode: `var minJumps = function(arr) {
    const n = arr.length;
    if (n <= 1) return 0;
    const graph = new Map();
    for (let i = 0; i < n; i++) {
        if (!graph.has(arr[i])) graph.set(arr[i], []);
        graph.get(arr[i]).push(i);
    }
    const visited = new Array(n).fill(false);
    visited[0] = true;
    let q = [0];
    let steps = 0;
    while (q.length) {
        steps++;
        const nextQ = [];
        for (const i of q) {
            const neighbors = [i - 1, i + 1, ...(graph.get(arr[i]) || [])];
            for (const nxt of neighbors) {
                if (nxt >= 0 && nxt < n && !visited[nxt]) {
                    if (nxt === n - 1) return steps;
                    visited[nxt] = true;
                    nextQ.push(nxt);
                }
            }
            graph.set(arr[i], []);
        }
        q = nextQ;
    }
    return -1;
};`,
    explanation:
      '1. Build a map from each value to its list of indices.\n' +
      '2. BFS from index 0. Each level represents one step.\n' +
      '3. From index i, explore i-1, i+1, and all indices with the same value.\n' +
      '4. After exploring all same-value neighbors, clear that group to prevent O(n^2) behavior.\n' +
      '5. Return steps when the last index is first reached.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'BFS finds the shortest path in an unweighted graph.',
      'Group indices by their value for efficient same-value jumps.',
      'Clear the value group after visiting to avoid processing the same group repeatedly.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1347. Minimum Number of Steps to Make Two Strings Anagram
  // ---------------------------------------------------------------------------
  {
    id: 1347,
    description:
      'You are given two strings s and t of the same length. In one step, you can choose any character of t and replace it with another character. Return the minimum number of steps to make t an anagram of s.',
    examples:
      'Input: s = "bab", t = "aba"\nOutput: 1\nExplanation: Replace the first \'a\' in t with \'b\'. t = "bba" which is an anagram of s.',
    approach:
      'Count character frequencies in both strings. The answer is the sum of excess characters in t that s does not need, which equals the sum of max(0, count_s[c] - count_t[c]) for all characters c.',
    code: `from collections import Counter

class Solution:
    def minSteps(self, s: str, t: str) -> int:
        cs = Counter(s)
        ct = Counter(t)
        return sum(max(0, cs[c] - ct[c]) for c in cs)`,
    jsCode: `var minSteps = function(s, t) {
    const cs = new Array(26).fill(0);
    const ct = new Array(26).fill(0);
    for (let i = 0; i < s.length; i++) {
        cs[s.charCodeAt(i) - 97]++;
        ct[t.charCodeAt(i) - 97]++;
    }
    let result = 0;
    for (let i = 0; i < 26; i++) result += Math.max(0, cs[i] - ct[i]);
    return result;
};`,
    explanation:
      '1. Count frequencies of each character in s and t.\n' +
      '2. For each character in s, compute how many more of it s needs compared to t.\n' +
      '3. Sum these deficits. Each deficit requires one replacement in t.\n' +
      '4. The total is the minimum number of replacements.\n' +
      '5. By symmetry, excess characters in t that s doesn\'t need equals the deficit.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) (26 letters)',
    hints: [
      'Count frequencies of each character in both strings.',
      'The difference in counts tells you how many replacements are needed.',
      'Sum the positive differences (where s has more than t).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1348. Tweet Counts Per Frequency
  // ---------------------------------------------------------------------------
  {
    id: 1348,
    description:
      'A social media company wants to know the number of tweets during certain time periods. Implement the TweetCounts class with recordTweet(tweetName, time) and getTweetCountsPerFrequency(freq, tweetName, startTime, endTime) methods. freq is "minute", "hour", or "day".',
    examples:
      'Input: ["TweetCounts","recordTweet","recordTweet","recordTweet","getTweetCountsPerFrequency"]\n[[],["tweet3",0],["tweet3",60],["tweet3",10],["minute","tweet3",0,59]]\nOutput: [null,null,null,null,[2]]',
    approach:
      'Store tweets in a dictionary mapping tweetName to a sorted list of times. For queries, determine the chunk size based on frequency, and for each chunk, count tweets using binary search.',
    code: `from collections import defaultdict
import bisect

class TweetCounts:
    def __init__(self):
        self.tweets = defaultdict(list)

    def recordTweet(self, tweetName: str, time: int) -> None:
        bisect.insort(self.tweets[tweetName], time)

    def getTweetCountsPerFrequency(self, freq: str, tweetName: str, startTime: int, endTime: int) -> list[int]:
        chunk = {"minute": 60, "hour": 3600, "day": 86400}[freq]
        times = self.tweets[tweetName]
        result = []
        t = startTime
        while t <= endTime:
            end = min(t + chunk, endTime + 1)
            lo = bisect.bisect_left(times, t)
            hi = bisect.bisect_left(times, end)
            result.append(hi - lo)
            t += chunk
        return result`,
    jsCode: `var TweetCounts = function() {
    this.tweets = new Map();
};

TweetCounts.prototype.recordTweet = function(tweetName, time) {
    if (!this.tweets.has(tweetName)) this.tweets.set(tweetName, []);
    const arr = this.tweets.get(tweetName);
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] <= time) lo = mid + 1;
        else hi = mid;
    }
    arr.splice(lo, 0, time);
};

TweetCounts.prototype.getTweetCountsPerFrequency = function(freq, tweetName, startTime, endTime) {
    const chunk = {minute: 60, hour: 3600, day: 86400}[freq];
    const times = this.tweets.get(tweetName) || [];
    const result = [];
    let t = startTime;
    while (t <= endTime) {
        const end = Math.min(t + chunk, endTime + 1);
        let lo = 0, hi = times.length;
        while (lo < hi) { const m = Math.floor((lo + hi) / 2); if (times[m] < t) lo = m + 1; else hi = m; }
        const loIdx = lo;
        lo = 0; hi = times.length;
        while (lo < hi) { const m = Math.floor((lo + hi) / 2); if (times[m] < end) lo = m + 1; else hi = m; }
        result.push(lo - loIdx);
        t += chunk;
    }
    return result;
};`,
    explanation:
      '1. Store tweet times in sorted lists keyed by tweetName.\n' +
      '2. Use bisect.insort to maintain sorted order on insertion.\n' +
      '3. For queries, determine chunk size: 60 for minute, 3600 for hour, 86400 for day.\n' +
      '4. For each time chunk from startTime to endTime, use binary search to count tweets.\n' +
      '5. Return the list of counts per chunk.',
    timeComplexity: 'O(log n) per recordTweet, O((endTime-startTime)/chunk * log n) per query',
    spaceComplexity: 'O(n)',
    hints: [
      'Store tweets per name in a sorted list for efficient range queries.',
      'Use binary search to count tweets in each time interval.',
      'Determine chunk size based on the frequency string.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1351. Count Negative Numbers in a Sorted Matrix
  // ---------------------------------------------------------------------------
  {
    id: 1351,
    description:
      'Given a m x n matrix grid which is sorted in non-increasing order both row-wise and column-wise, return the number of negative numbers in grid.',
    examples:
      'Input: grid = [[4,3,2,-1],[3,2,1,-1],[1,1,-1,-2],[-1,-1,-2,-3]]\nOutput: 8',
    approach:
      'Start from the top-right corner. If the current element is negative, all elements below it in that column are also negative; add them and move left. If non-negative, move down.',
    code: `class Solution:
    def countNegatives(self, grid: list[list[int]]) -> int:
        m, n = len(grid), len(grid[0])
        count = 0
        row, col = 0, n - 1
        while row < m and col >= 0:
            if grid[row][col] < 0:
                count += m - row
                col -= 1
            else:
                row += 1
        return count`,
    jsCode: `var countNegatives = function(grid) {
    const m = grid.length, n = grid[0].length;
    let count = 0, row = 0, col = n - 1;
    while (row < m && col >= 0) {
        if (grid[row][col] < 0) {
            count += m - row;
            col--;
        } else {
            row++;
        }
    }
    return count;
};`,
    explanation:
      '1. Start from top-right corner (row=0, col=n-1).\n' +
      '2. If grid[row][col] < 0, then all elements below in this column are also negative.\n' +
      '3. Add (m - row) to count and move left (col -= 1).\n' +
      '4. If grid[row][col] >= 0, move down (row += 1) to find negatives.\n' +
      '5. This staircase approach runs in O(m + n).',
    timeComplexity: 'O(m + n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The matrix is sorted in non-increasing order both row-wise and column-wise.',
      'Start from a corner where you can make decisions based on the value.',
      'From the top-right, move left on negatives and down on non-negatives.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1352. Product of the Last K Numbers
  // ---------------------------------------------------------------------------
  {
    id: 1352,
    description:
      'Implement the ProductOfNumbers class that supports add(num) to add a number to the back of the list and getProduct(k) to return the product of the last k numbers. You can assume the current list always has at least k numbers when getProduct is called.',
    examples:
      'Input: ["ProductOfNumbers","add","add","add","getProduct","add","getProduct"]\n[[],[3],[0],[2],[2],[5],[3]]\nOutput: [null,null,null,null,0,null,20]',
    approach:
      'Maintain a prefix product list. When a 0 is added, reset the prefix products since any product including 0 is 0. For getProduct(k), if k exceeds the prefix length, the product includes a 0.',
    code: `class ProductOfNumbers:
    def __init__(self):
        self.prefix = [1]

    def add(self, num: int) -> None:
        if num == 0:
            self.prefix = [1]
        else:
            self.prefix.append(self.prefix[-1] * num)

    def getProduct(self, k: int) -> int:
        if k >= len(self.prefix):
            return 0
        return self.prefix[-1] // self.prefix[-1 - k]`,
    jsCode: `var ProductOfNumbers = function() {
    this.prefix = [1];
};

ProductOfNumbers.prototype.add = function(num) {
    if (num === 0) {
        this.prefix = [1];
    } else {
        this.prefix.push(this.prefix[this.prefix.length - 1] * num);
    }
};

ProductOfNumbers.prototype.getProduct = function(k) {
    if (k >= this.prefix.length) return 0;
    return Math.floor(this.prefix[this.prefix.length - 1] / this.prefix[this.prefix.length - 1 - k]);
};`,
    explanation:
      '1. Maintain a prefix product list starting with [1].\n' +
      '2. When adding a non-zero number, append prefix[-1] * num.\n' +
      '3. When adding 0, reset prefix to [1] since any product including 0 is 0.\n' +
      '4. getProduct(k): if k >= len(prefix), the range includes a zero; return 0.\n' +
      '5. Otherwise, return prefix[-1] / prefix[-1-k] (the product of last k numbers).',
    timeComplexity: 'O(1) per operation',
    spaceComplexity: 'O(n)',
    hints: [
      'Prefix products allow O(1) range product queries.',
      'Zeros complicate prefix products. How can you handle them?',
      'When a 0 is added, reset the prefix array since all products including it are 0.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1356. Sort Integers by The Number of 1 Bits
  // ---------------------------------------------------------------------------
  {
    id: 1356,
    description:
      'You are given an integer array arr. Sort the integers in the array in ascending order by the number of 1s in their binary representation. In case of a tie, sort by the integer value.',
    examples:
      'Input: arr = [0,1,2,3,4,5,6,7,8]\nOutput: [0,1,2,4,8,3,5,6,7]',
    approach:
      'Sort the array using a custom key that returns (popcount, value). Python\'s bin(x).count("1") gives the number of 1 bits.',
    code: `class Solution:
    def sortByBits(self, arr: list[int]) -> list[int]:
        return sorted(arr, key=lambda x: (bin(x).count('1'), x))`,
    jsCode: `var sortByBits = function(arr) {
    const bitCount = (n) => {
        let count = 0;
        while (n) { count += n & 1; n >>= 1; }
        return count;
    };
    return arr.sort((a, b) => bitCount(a) - bitCount(b) || a - b);
};`,
    explanation:
      '1. Use Python\'s sorted with a custom key function.\n' +
      '2. The key is a tuple (number of 1 bits, the value itself).\n' +
      '3. bin(x).count("1") counts the 1 bits in the binary representation.\n' +
      '4. Tuples compare lexicographically: first by bit count, then by value.\n' +
      '5. Return the sorted array.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Sort by a custom key involving the bit count.',
      'Use bin(x).count("1") to get the popcount.',
      'Break ties by the integer value itself.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1358. Number of Substrings Containing All Three Characters
  // ---------------------------------------------------------------------------
  {
    id: 1358,
    description:
      'Given a string s consisting only of characters a, b, and c, return the number of substrings containing at least one occurrence of all three characters.',
    examples:
      'Input: s = "abcabc"\nOutput: 10',
    approach:
      'Use a sliding window. Track the last occurrence of each character. For each right endpoint, all substrings starting from index 0 to min(last_a, last_b, last_c) are valid.',
    code: `class Solution:
    def numberOfSubstrings(self, s: str) -> int:
        last = {c: -1 for c in 'abc'}
        count = 0
        for i, c in enumerate(s):
            last[c] = i
            count += 1 + min(last.values())
        return count`,
    jsCode: `var numberOfSubstrings = function(s) {
    const last = {a: -1, b: -1, c: -1};
    let count = 0;
    for (let i = 0; i < s.length; i++) {
        last[s[i]] = i;
        count += 1 + Math.min(last.a, last.b, last.c);
    }
    return count;
};`,
    explanation:
      '1. Track the last seen index of each character a, b, c (initialized to -1).\n' +
      '2. For each index i, update the last seen position of s[i].\n' +
      '3. The earliest start of a valid substring ending at i is 0 to min(last[a], last[b], last[c]).\n' +
      '4. So there are 1 + min(last values) valid substrings ending at i.\n' +
      '5. Sum these up for all positions.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'For each right endpoint, determine the farthest left the window can start while still containing all three characters.',
      'Track the last occurrence of each character.',
      'All start positions from 0 to min(last occurrences) give valid substrings.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1361. Validate Binary Tree Nodes
  // ---------------------------------------------------------------------------
  {
    id: 1361,
    description:
      'You have n binary tree nodes numbered from 0 to n-1 where node i has two children leftChild[i] and rightChild[i]. Return true if and only if all the given nodes form exactly one valid binary tree.',
    examples:
      'Input: n = 4, leftChild = [1,-1,3,-1], rightChild = [2,-1,-1,-1]\nOutput: true',
    approach:
      'Find the root (the node with no parent). Then BFS/DFS from the root and verify that all nodes are visited exactly once. A valid binary tree has exactly one root and n reachable nodes.',
    code: `from collections import deque

class Solution:
    def validateBinaryTreeNodes(self, n: int, leftChild: list[int], rightChild: list[int]) -> bool:
        children = set()
        for i in range(n):
            if leftChild[i] != -1:
                children.add(leftChild[i])
            if rightChild[i] != -1:
                children.add(rightChild[i])
        roots = [i for i in range(n) if i not in children]
        if len(roots) != 1:
            return False
        root = roots[0]
        visited = set()
        q = deque([root])
        while q:
            node = q.popleft()
            if node in visited:
                return False
            visited.add(node)
            if leftChild[node] != -1:
                q.append(leftChild[node])
            if rightChild[node] != -1:
                q.append(rightChild[node])
        return len(visited) == n`,
    jsCode: `var validateBinaryTreeNodes = function(n, leftChild, rightChild) {
    const children = new Set();
    for (let i = 0; i < n; i++) {
        if (leftChild[i] !== -1) children.add(leftChild[i]);
        if (rightChild[i] !== -1) children.add(rightChild[i]);
    }
    const roots = [];
    for (let i = 0; i < n; i++) if (!children.has(i)) roots.push(i);
    if (roots.length !== 1) return false;
    const visited = new Set();
    const q = [roots[0]];
    while (q.length) {
        const node = q.shift();
        if (visited.has(node)) return false;
        visited.add(node);
        if (leftChild[node] !== -1) q.push(leftChild[node]);
        if (rightChild[node] !== -1) q.push(rightChild[node]);
    }
    return visited.size === n;
};`,
    explanation:
      '1. Identify all nodes that are children. The root is the node that is not any node\'s child.\n' +
      '2. There must be exactly one root for a valid binary tree.\n' +
      '3. BFS from the root, tracking visited nodes.\n' +
      '4. If any node is visited twice (cycle), return false.\n' +
      '5. If all n nodes are visited exactly once, the tree is valid.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'A valid binary tree has exactly one root (node with no parent).',
      'Every node must be reachable from the root.',
      'No cycles should exist, and all n nodes must be visited.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1365. How Many Numbers Are Smaller Than the Current Number
  // ---------------------------------------------------------------------------
  {
    id: 1365,
    description:
      'Given the array nums, for each nums[i] find out how many numbers in the array are smaller than it. Return the result as an array.',
    examples:
      'Input: nums = [8,1,2,2,3]\nOutput: [4,0,1,1,3]',
    approach:
      'Sort a copy of nums and use the first occurrence index of each value as the count of smaller elements. Use a dictionary to map each value to its rank.',
    code: `class Solution:
    def smallerNumbersThanCurrent(self, nums: list[int]) -> list[int]:
        sorted_nums = sorted(nums)
        rank = {}
        for i, num in enumerate(sorted_nums):
            if num not in rank:
                rank[num] = i
        return [rank[num] for num in nums]`,
    jsCode: `var smallerNumbersThanCurrent = function(nums) {
    const sorted = [...nums].sort((a, b) => a - b);
    const rank = new Map();
    for (let i = 0; i < sorted.length; i++) {
        if (!rank.has(sorted[i])) rank.set(sorted[i], i);
    }
    return nums.map(num => rank.get(num));
};`,
    explanation:
      '1. Sort a copy of nums.\n' +
      '2. In the sorted array, the first occurrence index of a value equals the count of smaller values.\n' +
      '3. Build a rank dictionary mapping each value to its first occurrence index.\n' +
      '4. For each element in the original array, look up its rank.\n' +
      '5. Return the list of ranks.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Sorting the array helps determine relative order.',
      'In a sorted array, the index of the first occurrence of a value equals how many values are smaller.',
      'Use a dictionary to avoid recomputing for duplicate values.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1367. Linked List in Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 1367,
    description:
      'Given a binary tree root and a linked list head, return true if all elements of the linked list correspond to some downward path in the binary tree, starting from any node.',
    examples:
      'Input: head = [4,2,8], root = [1,4,4,null,2,2,null,1,null,6,8]\nOutput: true',
    approach:
      'For each node in the tree, try to match the linked list starting from that node going downward. Use a helper function that checks if the list matches starting from a given tree node.',
    code: `class Solution:
    def isSubPath(self, head, root) -> bool:
        def match(lst, tree):
            if not lst:
                return True
            if not tree:
                return False
            if lst.val != tree.val:
                return False
            return match(lst.next, tree.left) or match(lst.next, tree.right)

        if not root:
            return False
        return match(head, root) or self.isSubPath(head, root.left) or self.isSubPath(head, root.right)`,
    jsCode: `var isSubPath = function(head, root) {
    const match = (lst, tree) => {
        if (!lst) return true;
        if (!tree) return false;
        if (lst.val !== tree.val) return false;
        return match(lst.next, tree.left) || match(lst.next, tree.right);
    };
    if (!root) return false;
    return match(head, root) || isSubPath(head, root.left) || isSubPath(head, root.right);
};`,
    explanation:
      '1. For each tree node, call match() to see if the linked list starts there.\n' +
      '2. match(lst, tree) checks if the list matches going downward from tree.\n' +
      '3. If lst is None, we matched the entire list; return True.\n' +
      '4. If tree is None or values differ, return False.\n' +
      '5. Recursively check both children of the tree node.',
    timeComplexity: 'O(n * m) where n is tree size and m is list length',
    spaceComplexity: 'O(n + m) for recursion stack',
    hints: [
      'Try starting the match from every node in the tree.',
      'Use a helper that checks if the list matches starting from a given tree node downward.',
      'The path must go downward (parent to child), not sideways.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1373. Maximum Sum BST in Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 1373,
    description:
      'Given a binary tree root, return the maximum sum of all keys of any sub-tree which is also a Binary Search Tree (BST). A BST is a tree where each node\'s left subtree contains only values less than the node, and right subtree only values greater.',
    examples:
      'Input: root = [1,4,3,2,4,2,5,null,null,null,null,null,null,4,6]\nOutput: 20\nExplanation: The subtree rooted at node 3 is a BST with sum 20.',
    approach:
      'Post-order DFS. For each node, return whether the subtree is a BST, its min/max values, and its sum. If both children are BSTs and the current node satisfies BST property, update the global max sum.',
    code: `class Solution:
    def maxSumBST(self, root) -> int:
        self.ans = 0

        def dfs(node):
            if not node:
                return True, float('inf'), float('-inf'), 0
            l_bst, l_min, l_max, l_sum = dfs(node.left)
            r_bst, r_min, r_max, r_sum = dfs(node.right)
            if l_bst and r_bst and l_max < node.val < r_min:
                s = l_sum + r_sum + node.val
                self.ans = max(self.ans, s)
                return True, min(l_min, node.val), max(r_max, node.val), s
            return False, 0, 0, 0

        dfs(root)
        return self.ans`,
    jsCode: `var maxSumBST = function(root) {
    let ans = 0;
    const dfs = (node) => {
        if (!node) return [true, Infinity, -Infinity, 0];
        const [lBst, lMin, lMax, lSum] = dfs(node.left);
        const [rBst, rMin, rMax, rSum] = dfs(node.right);
        if (lBst && rBst && lMax < node.val && node.val < rMin) {
            const s = lSum + rSum + node.val;
            ans = Math.max(ans, s);
            return [true, Math.min(lMin, node.val), Math.max(rMax, node.val), s];
        }
        return [false, 0, 0, 0];
    };
    dfs(root);
    return ans;
};`,
    explanation:
      '1. Post-order DFS returns (is_bst, min_val, max_val, sum) for each subtree.\n' +
      '2. A null node is a BST with min=inf, max=-inf, sum=0.\n' +
      '3. A node forms a BST if both children are BSTs and l_max < node.val < r_min.\n' +
      '4. If it is a BST, compute the sum and update the global maximum.\n' +
      '5. Return False for non-BST subtrees to propagate upward.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for recursion stack',
    hints: [
      'Use post-order traversal to validate BST property bottom-up.',
      'Each node needs to know if its subtrees are BSTs and their min/max/sum.',
      'Only update the answer when a valid BST subtree is found.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1381. Design a Stack With Increment Operation
  // ---------------------------------------------------------------------------
  {
    id: 1381,
    description:
      'Design a stack that supports push, pop, and an increment operation. increment(k, val) increments the bottom k elements by val. Implement CustomStack with a maximum size.',
    examples:
      'Input: ["CustomStack","push","push","pop","push","push","push","increment","increment","pop","pop","pop","pop"]\n[[3],[1],[2],[],[2],[3],[4],[5,100],[2,100],[],[],[],[]]\nOutput: [null,null,null,2,null,null,null,null,null,103,202,201,-1]',
    approach:
      'Use a lazy increment array. Instead of incrementing all k elements immediately, store the increment at index k-1. When popping, pass the increment down to the element below. This makes all operations O(1).',
    code: `class CustomStack:
    def __init__(self, maxSize: int):
        self.stack = []
        self.inc = []
        self.maxSize = maxSize

    def push(self, x: int) -> None:
        if len(self.stack) < self.maxSize:
            self.stack.append(x)
            self.inc.append(0)

    def pop(self) -> int:
        if not self.stack:
            return -1
        idx = len(self.stack) - 1
        val = self.stack.pop() + self.inc[idx]
        if idx > 0:
            self.inc[idx - 1] += self.inc[idx]
        self.inc.pop()
        return val

    def increment(self, k: int, val: int) -> None:
        idx = min(k, len(self.stack)) - 1
        if idx >= 0:
            self.inc[idx] += val`,
    jsCode: `var CustomStack = function(maxSize) {
    this.stack = [];
    this.inc = [];
    this.maxSize = maxSize;
};

CustomStack.prototype.push = function(x) {
    if (this.stack.length < this.maxSize) {
        this.stack.push(x);
        this.inc.push(0);
    }
};

CustomStack.prototype.pop = function() {
    if (!this.stack.length) return -1;
    const idx = this.stack.length - 1;
    const val = this.stack.pop() + this.inc[idx];
    if (idx > 0) this.inc[idx - 1] += this.inc[idx];
    this.inc.pop();
    return val;
};

CustomStack.prototype.increment = function(k, val) {
    const idx = Math.min(k, this.stack.length) - 1;
    if (idx >= 0) this.inc[idx] += val;
};`,
    explanation:
      '1. Maintain a stack and a parallel inc array for lazy increments.\n' +
      '2. push: add element and a 0 increment if not at max size.\n' +
      '3. increment(k, val): add val to inc[min(k, size) - 1]. This lazily marks the increment.\n' +
      '4. pop: return stack top + its increment. Pass the increment down to the element below.\n' +
      '5. All three operations run in O(1) time.',
    timeComplexity: 'O(1) per operation',
    spaceComplexity: 'O(n)',
    hints: [
      'Naive increment is O(k). Can you make it O(1)?',
      'Use a lazy increment array that stores pending increments.',
      'When popping, propagate the increment to the element below.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1382. Balance a Binary Search Tree
  // ---------------------------------------------------------------------------
  {
    id: 1382,
    description:
      'Given the root of a binary search tree, return a balanced binary search tree with the same node values. A balanced BST is one where the depth of the two subtrees of every node never differs by more than 1.',
    examples:
      'Input: root = [1,null,2,null,3,null,4]\nOutput: [2,1,3,null,null,null,4]',
    approach:
      'Perform an in-order traversal to get sorted values. Then recursively build a balanced BST from the sorted array by always choosing the middle element as root.',
    code: `class Solution:
    def balanceBST(self, root) -> 'TreeNode':
        vals = []
        def inorder(node):
            if not node:
                return
            inorder(node.left)
            vals.append(node.val)
            inorder(node.right)
        inorder(root)

        def build(lo, hi):
            if lo > hi:
                return None
            mid = (lo + hi) // 2
            node = TreeNode(vals[mid])
            node.left = build(lo, mid - 1)
            node.right = build(mid + 1, hi)
            return node

        return build(0, len(vals) - 1)`,
    jsCode: `var balanceBST = function(root) {
    const vals = [];
    const inorder = (node) => {
        if (!node) return;
        inorder(node.left);
        vals.push(node.val);
        inorder(node.right);
    };
    inorder(root);
    const build = (lo, hi) => {
        if (lo > hi) return null;
        const mid = Math.floor((lo + hi) / 2);
        const node = new TreeNode(vals[mid]);
        node.left = build(lo, mid - 1);
        node.right = build(mid + 1, hi);
        return node;
    };
    return build(0, vals.length - 1);
};`,
    explanation:
      '1. In-order traversal of a BST gives sorted values.\n' +
      '2. Build a balanced BST from the sorted array.\n' +
      '3. Choose the middle element as root to ensure balance.\n' +
      '4. Recursively build left subtree from left half and right subtree from right half.\n' +
      '5. This produces a height-balanced BST.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'In-order traversal of a BST gives sorted values.',
      'From a sorted array, always picking the middle element as root gives a balanced tree.',
      'Recursively apply this to left and right halves.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1383. Maximum Performance of a Team
  // ---------------------------------------------------------------------------
  {
    id: 1383,
    description:
      'You have n engineers. Engineer i has speed[i] and efficiency[i]. The performance of a team is the sum of speeds multiplied by the minimum efficiency. Choose at most k engineers to maximize performance. Return the result modulo 10^9 + 7.',
    examples:
      'Input: n = 6, speed = [2,10,3,1,5,8], efficiency = [5,4,3,9,7,2], k = 2\nOutput: 60',
    approach:
      'Sort engineers by efficiency in decreasing order. Iterate and maintain a min-heap of speeds of size at most k. For each engineer, they set the minimum efficiency. The sum of the top k speeds times this efficiency gives the performance.',
    code: `import heapq

class Solution:
    def maxPerformance(self, n: int, speed: list[int], efficiency: list[int], k: int) -> int:
        MOD = 10**9 + 7
        engineers = sorted(zip(efficiency, speed), reverse=True)
        heap = []
        speed_sum = 0
        best = 0
        for eff, spd in engineers:
            heapq.heappush(heap, spd)
            speed_sum += spd
            if len(heap) > k:
                speed_sum -= heapq.heappop(heap)
            best = max(best, speed_sum * eff)
        return best % MOD`,
    jsCode: `var maxPerformance = function(n, speed, efficiency, k) {
    const MOD = 1000000007n;
    const engineers = efficiency.map((e, i) => [e, speed[i]]).sort((a, b) => b[0] - a[0]);
    const heap = []; // min-heap
    const push = (val) => { heap.push(val); let i = heap.length - 1; while (i > 0) { const p = Math.floor((i - 1) / 2); if (heap[p] <= heap[i]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { if (heap.length <= 1) return heap.pop(); const val = heap[0]; heap[0] = heap.pop(); let i = 0; while (true) { let s = i; const l = 2*i+1, r = 2*i+2; if (l < heap.length && heap[l] < heap[s]) s = l; if (r < heap.length && heap[r] < heap[s]) s = r; if (s === i) break; [heap[s], heap[i]] = [heap[i], heap[s]]; i = s; } return val; };
    let speedSum = 0n, best = 0n;
    for (const [eff, spd] of engineers) {
        push(spd);
        speedSum += BigInt(spd);
        if (heap.length > k) speedSum -= BigInt(pop());
        const perf = speedSum * BigInt(eff);
        if (perf > best) best = perf;
    }
    return Number(best % MOD);
};`,
    explanation:
      '1. Sort engineers by efficiency descending.\n' +
      '2. As we iterate, the current engineer has the lowest efficiency in the team.\n' +
      '3. Maintain a min-heap of at most k speeds. If over k, remove the smallest speed.\n' +
      '4. Performance = speed_sum * current_efficiency. Track the maximum.\n' +
      '5. Return the best performance modulo 10^9 + 7.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Sort by efficiency descending so each new engineer sets a new minimum efficiency.',
      'Maintain the top k speeds using a min-heap.',
      'At each step, compute performance = sum_of_speeds * current_min_efficiency.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1387. Sort Integers by The Power Value
  // ---------------------------------------------------------------------------
  {
    id: 1387,
    description:
      'The power of an integer x is defined as the number of steps needed to transform x into 1 using the Collatz sequence: if x is even, x = x / 2; if x is odd, x = 3 * x + 1. Given lo, hi, and k, sort all integers in [lo, hi] by their power value and return the k-th integer (1-indexed). Ties are broken by smaller value first.',
    examples:
      'Input: lo = 12, hi = 15, k = 2\nOutput: 13\nExplanation: Powers: 12->9, 13->9, 14->17, 15->17. Sorted by power then value: [12,13,14,15]. The 2nd is 13.',
    approach:
      'Compute the power of each integer in [lo, hi] using memoization. Sort by (power, value) and return the k-th element.',
    code: `from functools import lru_cache

class Solution:
    def getKth(self, lo: int, hi: int, k: int) -> int:
        @lru_cache(maxsize=None)
        def power(x):
            if x == 1:
                return 0
            if x % 2 == 0:
                return 1 + power(x // 2)
            return 1 + power(3 * x + 1)

        nums = list(range(lo, hi + 1))
        nums.sort(key=lambda x: (power(x), x))
        return nums[k - 1]`,
    jsCode: `var getKth = function(lo, hi, k) {
    const memo = new Map();
    const power = (x) => {
        if (x === 1) return 0;
        if (memo.has(x)) return memo.get(x);
        const res = 1 + (x % 2 === 0 ? power(Math.floor(x / 2)) : power(3 * x + 1));
        memo.set(x, res);
        return res;
    };
    const nums = [];
    for (let i = lo; i <= hi; i++) nums.push(i);
    nums.sort((a, b) => power(a) - power(b) || a - b);
    return nums[k - 1];
};`,
    explanation:
      '1. Define a recursive function power(x) that counts Collatz steps to reach 1.\n' +
      '2. Use memoization to avoid recomputing powers for shared intermediate values.\n' +
      '3. Create the list of integers from lo to hi.\n' +
      '4. Sort by (power value, integer value).\n' +
      '5. Return the k-th element (1-indexed).',
    timeComplexity: 'O(n log n) where n = hi - lo + 1',
    spaceComplexity: 'O(n)',
    hints: [
      'Compute the Collatz power of each number using recursion with memoization.',
      'Sort the range [lo, hi] by (power, value).',
      'Return the k-th element from the sorted list.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1394. Find Lucky Integer in an Array
  // ---------------------------------------------------------------------------
  {
    id: 1394,
    description:
      'Given an array of integers arr, a lucky integer is an integer that has a frequency in the array equal to its value. Return the largest lucky integer in the array. If there is no lucky integer, return -1.',
    examples:
      'Input: arr = [2,2,3,4]\nOutput: 2\nExplanation: 2 has frequency 2, which equals its value.',
    approach:
      'Count the frequency of each element. Check which elements have frequency equal to their value. Return the largest such element.',
    code: `from collections import Counter

class Solution:
    def findLucky(self, arr: list[int]) -> int:
        count = Counter(arr)
        result = -1
        for num, freq in count.items():
            if num == freq:
                result = max(result, num)
        return result`,
    jsCode: `var findLucky = function(arr) {
    const count = new Map();
    for (const num of arr) count.set(num, (count.get(num) || 0) + 1);
    let result = -1;
    for (const [num, freq] of count) {
        if (num === freq) result = Math.max(result, num);
    }
    return result;
};`,
    explanation:
      '1. Count the frequency of each element using Counter.\n' +
      '2. Iterate through all (num, freq) pairs.\n' +
      '3. If num equals freq, it is a lucky integer.\n' +
      '4. Track the maximum lucky integer found.\n' +
      '5. Return the maximum, or -1 if none found.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Count frequencies of all elements.',
      'A lucky integer has its value equal to its frequency.',
      'Track the largest such integer.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1395. Count Number of Teams
  // ---------------------------------------------------------------------------
  {
    id: 1395,
    description:
      'There are n soldiers in a line with unique ratings. Choose 3 soldiers forming a team such that their ratings are in strictly increasing or strictly decreasing order (by position). Return the number of valid teams.',
    examples:
      'Input: rating = [2,5,3,4,1]\nOutput: 3\nExplanation: Valid teams: (2,3,4), (5,3,1), (5,4,1)',
    approach:
      'For each middle soldier j, count how many soldiers on the left are smaller (ls) and how many on the right are greater (rg). Increasing teams through j = ls * rg. Similarly count decreasing teams. Sum over all j.',
    code: `class Solution:
    def numTeams(self, rating: list[int]) -> int:
        n = len(rating)
        count = 0
        for j in range(n):
            left_smaller = sum(1 for i in range(j) if rating[i] < rating[j])
            right_larger = sum(1 for k in range(j + 1, n) if rating[k] > rating[j])
            left_larger = j - left_smaller
            right_smaller = (n - 1 - j) - right_larger
            count += left_smaller * right_larger + left_larger * right_smaller
        return count`,
    jsCode: `var numTeams = function(rating) {
    const n = rating.length;
    let count = 0;
    for (let j = 0; j < n; j++) {
        let leftSmaller = 0;
        for (let i = 0; i < j; i++) if (rating[i] < rating[j]) leftSmaller++;
        let rightLarger = 0;
        for (let k = j + 1; k < n; k++) if (rating[k] > rating[j]) rightLarger++;
        const leftLarger = j - leftSmaller;
        const rightSmaller = (n - 1 - j) - rightLarger;
        count += leftSmaller * rightLarger + leftLarger * rightSmaller;
    }
    return count;
};`,
    explanation:
      '1. For each middle element j, count left_smaller and right_larger for increasing triples.\n' +
      '2. Increasing teams through j = left_smaller * right_larger.\n' +
      '3. left_larger = j - left_smaller (elements to the left that are larger).\n' +
      '4. right_smaller = (n-1-j) - right_larger.\n' +
      '5. Decreasing teams through j = left_larger * right_smaller. Sum both for all j.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
    hints: [
      'Fix the middle element and count valid pairs on each side.',
      'For increasing triples, count smaller elements to the left and larger to the right.',
      'For decreasing triples, count larger elements to the left and smaller to the right.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1396. Design Underground System
  // ---------------------------------------------------------------------------
  {
    id: 1396,
    description:
      'An underground railway system tracks customer travel times between stations. Implement checkIn(id, stationName, t), checkOut(id, stationName, t), and getAverageTime(startStation, endStation) that returns the average travel time between two stations.',
    examples:
      'Input: ["UndergroundSystem","checkIn","checkOut","getAverageTime"]\n[[],[45,"Leyton",3],[45,"Waterloo",15],["Leyton","Waterloo"]]\nOutput: [null,null,null,12.0]',
    approach:
      'Use two dictionaries: one to track checked-in customers (id -> (station, time)), and another to accumulate (total_time, count) for each (start, end) station pair.',
    code: `class UndergroundSystem:
    def __init__(self):
        self.checkins = {}
        self.travel = {}

    def checkIn(self, id: int, stationName: str, t: int) -> None:
        self.checkins[id] = (stationName, t)

    def checkOut(self, id: int, stationName: str, t: int) -> None:
        start_station, start_time = self.checkins.pop(id)
        key = (start_station, stationName)
        if key not in self.travel:
            self.travel[key] = [0, 0]
        self.travel[key][0] += t - start_time
        self.travel[key][1] += 1

    def getAverageTime(self, startStation: str, endStation: str) -> float:
        total, count = self.travel[(startStation, endStation)]
        return total / count`,
    jsCode: `var UndergroundSystem = function() {
    this.checkins = new Map();
    this.travel = new Map();
};

UndergroundSystem.prototype.checkIn = function(id, stationName, t) {
    this.checkins.set(id, [stationName, t]);
};

UndergroundSystem.prototype.checkOut = function(id, stationName, t) {
    const [startStation, startTime] = this.checkins.get(id);
    this.checkins.delete(id);
    const key = startStation + ',' + stationName;
    if (!this.travel.has(key)) this.travel.set(key, [0, 0]);
    const data = this.travel.get(key);
    data[0] += t - startTime;
    data[1] += 1;
};

UndergroundSystem.prototype.getAverageTime = function(startStation, endStation) {
    const [total, count] = this.travel.get(startStation + ',' + endStation);
    return total / count;
};`,
    explanation:
      '1. checkins dict maps customer id to (start station, check-in time).\n' +
      '2. On checkOut, retrieve and remove the check-in info.\n' +
      '3. Compute travel time and accumulate it in the travel dict keyed by (start, end).\n' +
      '4. travel stores [total_time, count] for each station pair.\n' +
      '5. getAverageTime returns total_time / count for the given station pair.',
    timeComplexity: 'O(1) per operation',
    spaceComplexity: 'O(n + s^2) where n is customers and s is stations',
    hints: [
      'Store check-in info by customer id.',
      'On checkout, compute travel time and aggregate by station pair.',
      'Average is simply total accumulated time divided by count.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1402. Reducing Dishes
  // ---------------------------------------------------------------------------
  {
    id: 1402,
    description:
      'A chef has collected satisfaction data for n dishes. The like-time coefficient of a dish is satisfaction[i] * time where time is the order in which the dish is prepared (1-indexed). Return the maximum sum of like-time coefficients after choosing and ordering some dishes.',
    examples:
      'Input: satisfaction = [-1,-8,0,5,-7]\nOutput: 14\nExplanation: After sorting, remove first two. Cook [0,5] at times 1,2: 0*1 + 5*2 = 10. Actually cook [-1,0,5] at times 1,2,3: -1+0+15 = 14.',
    approach:
      'Sort satisfaction in descending order. Greedily add dishes as long as the running sum stays positive. Each dish added increases all previously chosen dishes\' coefficients by their satisfaction value (via suffix sum).',
    code: `class Solution:
    def maxSatisfaction(self, satisfaction: list[int]) -> int:
        satisfaction.sort(reverse=True)
        total = 0
        suffix_sum = 0
        for s in satisfaction:
            suffix_sum += s
            if suffix_sum > 0:
                total += suffix_sum
            else:
                break
        return total`,
    jsCode: `var maxSatisfaction = function(satisfaction) {
    satisfaction.sort((a, b) => b - a);
    let total = 0, suffixSum = 0;
    for (const s of satisfaction) {
        suffixSum += s;
        if (suffixSum > 0) {
            total += suffixSum;
        } else {
            break;
        }
    }
    return total;
};`,
    explanation:
      '1. Sort satisfaction in descending order.\n' +
      '2. Adding a dish with value s at the beginning shifts all existing dishes one position later.\n' +
      '3. This increases the total by suffix_sum (sum of all chosen dishes so far plus s).\n' +
      '4. Keep adding dishes while suffix_sum > 0.\n' +
      '5. When suffix_sum <= 0, adding more dishes would decrease the total.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sort and consider adding dishes from highest to lowest satisfaction.',
      'Each new dish shifts all existing dishes, increasing the total by the running suffix sum.',
      'Stop when adding another dish would decrease the total.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1405. Longest Happy String
  // ---------------------------------------------------------------------------
  {
    id: 1405,
    description:
      'A string s is happy if it does not contain "aaa", "bbb", or "ccc" as a substring. Given three integers a, b, and c representing the maximum number of a, b, and c characters, return the longest possible happy string. If multiple answers exist, return any.',
    examples:
      'Input: a = 1, b = 1, c = 7\nOutput: "ccaccbcc"',
    approach:
      'Use a greedy approach with a max-heap. Always try to use the character with the highest remaining count, unless it would create three consecutive same characters. In that case, use the second most frequent character.',
    code: `import heapq

class Solution:
    def longestDiverseString(self, a: int, b: int, c: int) -> str:
        heap = []
        if a > 0: heapq.heappush(heap, (-a, 'a'))
        if b > 0: heapq.heappush(heap, (-b, 'b'))
        if c > 0: heapq.heappush(heap, (-c, 'c'))
        result = []
        while heap:
            cnt1, ch1 = heapq.heappop(heap)
            if len(result) >= 2 and result[-1] == result[-2] == ch1:
                if not heap:
                    break
                cnt2, ch2 = heapq.heappop(heap)
                result.append(ch2)
                cnt2 += 1
                if cnt2 < 0:
                    heapq.heappush(heap, (cnt2, ch2))
                heapq.heappush(heap, (cnt1, ch1))
            else:
                result.append(ch1)
                cnt1 += 1
                if cnt1 < 0:
                    heapq.heappush(heap, (cnt1, ch1))
        return ''.join(result)`,
    jsCode: `var longestDiverseString = function(a, b, c) {
    const heap = [];
    const push = (item) => { heap.push(item); let i = heap.length - 1; while (i > 0) { const p = Math.floor((i-1)/2); if (heap[p][0] >= heap[i][0]) break; [heap[p],heap[i]] = [heap[i],heap[p]]; i = p; } };
    const pop = () => { if (heap.length <= 1) return heap.pop(); const val = heap[0]; heap[0] = heap.pop(); let i = 0; while (true) { let s = i; const l = 2*i+1, r = 2*i+2; if (l < heap.length && heap[l][0] > heap[s][0]) s = l; if (r < heap.length && heap[r][0] > heap[s][0]) s = r; if (s === i) break; [heap[s],heap[i]] = [heap[i],heap[s]]; i = s; } return val; };
    if (a > 0) push([a, 'a']);
    if (b > 0) push([b, 'b']);
    if (c > 0) push([c, 'c']);
    const result = [];
    while (heap.length) {
        let [cnt1, ch1] = pop();
        if (result.length >= 2 && result[result.length-1] === ch1 && result[result.length-2] === ch1) {
            if (!heap.length) break;
            let [cnt2, ch2] = pop();
            result.push(ch2);
            cnt2--;
            if (cnt2 > 0) push([cnt2, ch2]);
            push([cnt1, ch1]);
        } else {
            result.push(ch1);
            cnt1--;
            if (cnt1 > 0) push([cnt1, ch1]);
        }
    }
    return result.join('');
};`,
    explanation:
      '1. Use a max-heap (negate counts for Python\'s min-heap).\n' +
      '2. Pop the character with the highest remaining count.\n' +
      '3. If appending it would create three in a row, use the second most frequent instead.\n' +
      '4. Push characters back with updated counts if they still have remaining uses.\n' +
      '5. Stop when no valid character can be appended.',
    timeComplexity: 'O((a+b+c) * log 3) = O(a+b+c)',
    spaceComplexity: 'O(a+b+c)',
    hints: [
      'Greedily use the most frequent character to maximize length.',
      'If the most frequent would create three in a row, use the second most frequent.',
      'A max-heap efficiently tracks the most frequent character.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1406. Stone Game III
  // ---------------------------------------------------------------------------
  {
    id: 1406,
    description:
      'Alice and Bob play a game with a row of stones with values. Players alternate taking 1, 2, or 3 stones from the front. Both play optimally. Return "Alice" if Alice gets more points, "Bob" if Bob gets more, or "Tie".',
    examples:
      'Input: stoneValue = [1,2,3,7]\nOutput: "Bob"',
    approach:
      'Use DP from the end. dp[i] = maximum score difference (current player - opponent) achievable from index i. At each step, the current player can take 1, 2, or 3 stones.',
    code: `class Solution:
    def stoneGameIII(self, stoneValue: list[int]) -> str:
        n = len(stoneValue)
        dp = [0] * (n + 1)
        for i in range(n - 1, -1, -1):
            dp[i] = float('-inf')
            total = 0
            for k in range(1, 4):
                if i + k > n:
                    break
                total += stoneValue[i + k - 1]
                dp[i] = max(dp[i], total - dp[i + k])
        if dp[0] > 0:
            return "Alice"
        elif dp[0] < 0:
            return "Bob"
        return "Tie"`,
    jsCode: `var stoneGameIII = function(stoneValue) {
    const n = stoneValue.length;
    const dp = new Array(n + 1).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        dp[i] = -Infinity;
        let total = 0;
        for (let k = 1; k <= 3; k++) {
            if (i + k > n) break;
            total += stoneValue[i + k - 1];
            dp[i] = Math.max(dp[i], total - dp[i + k]);
        }
    }
    if (dp[0] > 0) return "Alice";
    if (dp[0] < 0) return "Bob";
    return "Tie";
};`,
    explanation:
      '1. dp[i] = maximum score difference for the current player from index i onward.\n' +
      '2. The current player takes k stones (k=1,2,3), gaining their sum.\n' +
      '3. The opponent then plays optimally from index i+k, so their advantage is dp[i+k].\n' +
      '4. dp[i] = max over k of (sum of stones taken - dp[i+k]).\n' +
      '5. If dp[0] > 0, Alice wins; if < 0, Bob wins; if 0, it is a tie.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'This is a minimax problem. Use DP where dp[i] is the score advantage from position i.',
      'The current player takes 1-3 stones and the opponent gets dp[i+k] advantage.',
      'dp[i] = max(sum of taken stones - dp[i+k]) for k in {1,2,3}.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1416. Restore The Array
  // ---------------------------------------------------------------------------
  {
    id: 1416,
    description:
      'A program was supposed to print an array of integers. The array does not contain leading zeros or values greater than k. Given the string s and integer k, return the number of possible arrays that could have been printed, modulo 10^9 + 7.',
    examples:
      'Input: s = "1317", k = 2000\nOutput: 8',
    approach:
      'Use DP where dp[i] = number of ways to decode s[i:]. For each position i, try all substrings s[i:j] that form a valid number (no leading zeros, value <= k).',
    code: `class Solution:
    def numberOfArrays(self, s: str, k: int) -> int:
        MOD = 10**9 + 7
        n = len(s)
        dp = [0] * (n + 1)
        dp[n] = 1
        for i in range(n - 1, -1, -1):
            if s[i] == '0':
                continue
            num = 0
            for j in range(i, n):
                num = num * 10 + int(s[j])
                if num > k:
                    break
                dp[i] = (dp[i] + dp[j + 1]) % MOD
        return dp[0]`,
    jsCode: `var numberOfArrays = function(s, k) {
    const MOD = 1000000007;
    const n = s.length;
    const dp = new Array(n + 1).fill(0);
    dp[n] = 1;
    for (let i = n - 1; i >= 0; i--) {
        if (s[i] === '0') continue;
        let num = 0;
        for (let j = i; j < n; j++) {
            num = num * 10 + Number(s[j]);
            if (num > k) break;
            dp[i] = (dp[i] + dp[j + 1]) % MOD;
        }
    }
    return dp[0];
};`,
    explanation:
      '1. dp[i] = number of ways to split s[i:] into valid numbers.\n' +
      '2. Base case: dp[n] = 1 (empty string has one way).\n' +
      '3. If s[i] is "0", dp[i] = 0 (no leading zeros allowed).\n' +
      '4. Otherwise, try all substrings s[i:j+1] that form a number <= k.\n' +
      '5. Add dp[j+1] to dp[i] for each valid split point j.',
    timeComplexity: 'O(n * log k)',
    spaceComplexity: 'O(n)',
    hints: [
      'DP where dp[i] counts valid splits of the suffix s[i:].',
      'Numbers cannot have leading zeros and must be <= k.',
      'For each position, try extending the current number digit by digit until it exceeds k.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1423. Maximum Points You Can Obtain from Cards
  // ---------------------------------------------------------------------------
  {
    id: 1423,
    description:
      'There are several cards arranged in a row. Each card has a point value. In each step, you can take one card from the beginning or end of the row. Take exactly k cards to maximize total points.',
    examples:
      'Input: cardPoints = [1,2,3,4,5,6,1], k = 3\nOutput: 12\nExplanation: Take the last three cards: 1+6+5 = 12.',
    approach:
      'Taking k cards from the ends is equivalent to leaving a contiguous subarray of size n-k. Minimize the sum of the remaining subarray to maximize the points taken. Use a sliding window of size n-k.',
    code: `class Solution:
    def maxScore(self, cardPoints: list[int], k: int) -> int:
        n = len(cardPoints)
        window_size = n - k
        window_sum = sum(cardPoints[:window_size])
        min_sum = window_sum
        for i in range(window_size, n):
            window_sum += cardPoints[i] - cardPoints[i - window_size]
            min_sum = min(min_sum, window_sum)
        return sum(cardPoints) - min_sum`,
    jsCode: `var maxScore = function(cardPoints, k) {
    const n = cardPoints.length;
    const windowSize = n - k;
    let windowSum = 0;
    for (let i = 0; i < windowSize; i++) windowSum += cardPoints[i];
    let minSum = windowSum;
    for (let i = windowSize; i < n; i++) {
        windowSum += cardPoints[i] - cardPoints[i - windowSize];
        minSum = Math.min(minSum, windowSum);
    }
    return cardPoints.reduce((a, b) => a + b, 0) - minSum;
};`,
    explanation:
      '1. We must leave n-k consecutive cards. Minimize their sum to maximize our score.\n' +
      '2. Compute the sum of the first window of size n-k.\n' +
      '3. Slide the window across the array, updating the sum.\n' +
      '4. Track the minimum window sum.\n' +
      '5. Answer = total sum - minimum window sum.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Taking k cards from the ends leaves a window of n-k consecutive cards.',
      'Minimize the sum of the remaining window to maximize your score.',
      'Use a sliding window of size n-k.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1428. Leftmost Column with at Least a One
  // ---------------------------------------------------------------------------
  {
    id: 1428,
    description:
      'A row-sorted binary matrix means each row is sorted in non-decreasing order. Given such a matrix, return the index of the leftmost column with at least a one. If no such column exists, return -1. You can only access the matrix through a BinaryMatrix interface with get(row, col) and dimensions().',
    examples:
      'Input: mat = [[0,0],[1,1]]\nOutput: 0',
    approach:
      'Start from the top-right corner. If the current cell is 1, move left (there might be a 1 in an earlier column). If it is 0, move down (this row has no 1s in this or earlier columns).',
    code: `class Solution:
    def leftMostColumnWithOne(self, binaryMatrix) -> int:
        rows, cols = binaryMatrix.dimensions()
        row, col = 0, cols - 1
        result = -1
        while row < rows and col >= 0:
            if binaryMatrix.get(row, col) == 1:
                result = col
                col -= 1
            else:
                row += 1
        return result`,
    jsCode: `var leftMostColumnWithOne = function(binaryMatrix) {
    const [rows, cols] = binaryMatrix.dimensions();
    let row = 0, col = cols - 1, result = -1;
    while (row < rows && col >= 0) {
        if (binaryMatrix.get(row, col) === 1) {
            result = col;
            col--;
        } else {
            row++;
        }
    }
    return result;
};`,
    explanation:
      '1. Start from the top-right corner (row=0, col=cols-1).\n' +
      '2. If we see a 1, record this column as a candidate and move left.\n' +
      '3. If we see a 0, move down to check the next row.\n' +
      '4. This explores at most rows + cols cells.\n' +
      '5. Return the leftmost column found, or -1 if none.',
    timeComplexity: 'O(m + n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Start from the top-right corner of the matrix.',
      'Move left on 1s (looking for earlier columns) and down on 0s (this row has no earlier 1s).',
      'Track the leftmost column where a 1 was found.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1429. First Unique Number
  // ---------------------------------------------------------------------------
  {
    id: 1429,
    description:
      'Design a data structure that has a queue of integers and supports: FirstUnique(nums) initializes the queue with the given integers, showFirstUnique() returns the value of the first unique integer (appears only once) or -1, and add(value) inserts a value to the queue.',
    examples:
      'Input: ["FirstUnique","showFirstUnique","add","showFirstUnique"]\n[[[2,3,5]],[],[5],[]]\nOutput: [null,2,null,2]',
    approach:
      'Use an OrderedDict to maintain insertion order and quickly remove duplicates. Track counts for each value. showFirstUnique returns the first key in the OrderedDict.',
    code: `from collections import OrderedDict

class FirstUnique:
    def __init__(self, nums: list[int]):
        self.unique = OrderedDict()
        self.seen = set()
        for num in nums:
            self.add(num)

    def showFirstUnique(self) -> int:
        if self.unique:
            return next(iter(self.unique))
        return -1

    def add(self, value: int) -> None:
        if value not in self.seen:
            self.seen.add(value)
            self.unique[value] = True
        elif value in self.unique:
            del self.unique[value]`,
    jsCode: `var FirstUnique = function(nums) {
    this.unique = new Map();
    this.seen = new Set();
    for (const num of nums) this.add(num);
};

FirstUnique.prototype.showFirstUnique = function() {
    for (const [key] of this.unique) return key;
    return -1;
};

FirstUnique.prototype.add = function(value) {
    if (!this.seen.has(value)) {
        this.seen.add(value);
        this.unique.set(value, true);
    } else if (this.unique.has(value)) {
        this.unique.delete(value);
    }
};`,
    explanation:
      '1. Use an OrderedDict to maintain unique values in insertion order.\n' +
      '2. Use a seen set to track all values ever added.\n' +
      '3. On add: if never seen, add to both seen and unique. If seen before, remove from unique.\n' +
      '4. showFirstUnique returns the first key in the OrderedDict (O(1)).\n' +
      '5. This efficiently maintains the first unique element.',
    timeComplexity: 'O(1) for showFirstUnique and add',
    spaceComplexity: 'O(n)',
    hints: [
      'You need to efficiently track which values are unique and their insertion order.',
      'An OrderedDict allows O(1) access to the first element and O(1) deletion.',
      'Remove values from the OrderedDict when they become duplicates.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1431. Kids With the Greatest Number of Candies
  // ---------------------------------------------------------------------------
  {
    id: 1431,
    description:
      'There are n kids with candies. You are given an array candies where candies[i] is the number of candies the i-th kid has, and an integer extraCandies. Return a boolean array where result[i] is true if giving all extraCandies to kid i makes them have the greatest number of candies among all kids.',
    examples:
      'Input: candies = [2,3,5,1,3], extraCandies = 3\nOutput: [true,true,true,false,true]',
    approach:
      'Find the current maximum. For each kid, check if candies[i] + extraCandies >= max.',
    code: `class Solution:
    def kidsWithCandies(self, candies: list[int], extraCandies: int) -> list[bool]:
        max_candies = max(candies)
        return [c + extraCandies >= max_candies for c in candies]`,
    jsCode: `var kidsWithCandies = function(candies, extraCandies) {
    const maxCandies = Math.max(...candies);
    return candies.map(c => c + extraCandies >= maxCandies);
};`,
    explanation:
      '1. Find the maximum number of candies any kid currently has.\n' +
      '2. For each kid, check if their candies plus extraCandies reaches the maximum.\n' +
      '3. Return the boolean list.\n' +
      '4. A kid needs candies[i] + extraCandies >= max_candies to potentially be the greatest.\n' +
      '5. This is a simple one-pass comparison after finding the max.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Find the maximum number of candies any kid has.',
      'A kid with candies[i] + extraCandies >= max is a valid answer.',
      'Simple comparison for each kid.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1438. Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit
  // ---------------------------------------------------------------------------
  {
    id: 1438,
    description:
      'Given an array of integers nums and an integer limit, return the size of the longest non-empty subarray such that the absolute difference between any two elements is less than or equal to limit.',
    examples:
      'Input: nums = [8,2,4,7], limit = 4\nOutput: 2\nExplanation: [2,4] has max absolute diff 2 <= 4.',
    approach:
      'Use a sliding window with two monotonic deques: one for tracking the max and one for the min. Expand the right pointer and shrink the left when the difference between max and min exceeds the limit.',
    code: `from collections import deque

class Solution:
    def longestSubarray(self, nums: list[int], limit: int) -> int:
        max_dq = deque()
        min_dq = deque()
        left = 0
        result = 0
        for right in range(len(nums)):
            while max_dq and nums[right] >= nums[max_dq[-1]]:
                max_dq.pop()
            while min_dq and nums[right] <= nums[min_dq[-1]]:
                min_dq.pop()
            max_dq.append(right)
            min_dq.append(right)
            while nums[max_dq[0]] - nums[min_dq[0]] > limit:
                left += 1
                if max_dq[0] < left:
                    max_dq.popleft()
                if min_dq[0] < left:
                    min_dq.popleft()
            result = max(result, right - left + 1)
        return result`,
    jsCode: `var longestSubarray = function(nums, limit) {
    const maxDq = [], minDq = [];
    let left = 0, result = 0;
    for (let right = 0; right < nums.length; right++) {
        while (maxDq.length && nums[right] >= nums[maxDq[maxDq.length - 1]]) maxDq.pop();
        while (minDq.length && nums[right] <= nums[minDq[minDq.length - 1]]) minDq.pop();
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
      '1. Maintain two monotonic deques: max_dq (decreasing) and min_dq (increasing).\n' +
      '2. max_dq[0] gives the index of the current window maximum; min_dq[0] gives the minimum.\n' +
      '3. For each right pointer, add it to both deques (maintaining monotonicity).\n' +
      '4. While max - min > limit, shrink the window from the left.\n' +
      '5. Track the maximum window size.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The max absolute diff in a window equals max(window) - min(window).',
      'Use two monotonic deques to track the sliding window max and min efficiently.',
      'Shrink the window from the left when the constraint is violated.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1442. Count Triplets That Can Form Two Arrays of Equal XOR
  // ---------------------------------------------------------------------------
  {
    id: 1442,
    description:
      'Given an array of integers arr, count the number of triplets (i, j, k) such that 0 <= i < j <= k < n and the XOR of arr[i..j-1] equals the XOR of arr[j..k].',
    examples:
      'Input: arr = [2,3,1,6,7]\nOutput: 4',
    approach:
      'If XOR of arr[i..j-1] == XOR of arr[j..k], then XOR of arr[i..k] == 0. So find all pairs (i, k) where prefix[i] == prefix[k+1]. For each such pair, any j in (i, k] works, giving k - i valid triplets.',
    code: `class Solution:
    def countTriplets(self, arr: list[int]) -> int:
        n = len(arr)
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] ^ arr[i]
        count = 0
        for i in range(n):
            for k in range(i + 1, n):
                if prefix[i] == prefix[k + 1]:
                    count += k - i
        return count`,
    jsCode: `var countTriplets = function(arr) {
    const n = arr.length;
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] ^ arr[i];
    let count = 0;
    for (let i = 0; i < n; i++) {
        for (let k = i + 1; k < n; k++) {
            if (prefix[i] === prefix[k + 1]) count += k - i;
        }
    }
    return count;
};`,
    explanation:
      '1. Build prefix XOR array where prefix[i] = arr[0] ^ arr[1] ^ ... ^ arr[i-1].\n' +
      '2. XOR of arr[i..k] = prefix[k+1] ^ prefix[i].\n' +
      '3. If prefix[i] == prefix[k+1], then XOR of arr[i..k] is 0.\n' +
      '4. This means any j in (i, k] gives equal XOR splits, contributing k - i triplets.\n' +
      '5. Sum k - i for all valid (i, k) pairs.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    hints: [
      'a XOR b = 0 means a = b. So XOR(i..j-1) = XOR(j..k) iff XOR(i..k) = 0.',
      'Use prefix XOR to find ranges where XOR is 0.',
      'For a range [i, k] with XOR 0, any split point j gives k - i valid triplets.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1443. Minimum Time to Collect All Apples in a Tree
  // ---------------------------------------------------------------------------
  {
    id: 1443,
    description:
      'Given an undirected tree with n nodes rooted at node 0. Some nodes have apples. Walking each edge costs 1 second. Return the minimum time to collect all apples and come back to node 0.',
    examples:
      'Input: n = 7, edges = [[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]], hasApple = [false,false,true,false,true,true,false]\nOutput: 8',
    approach:
      'DFS from root. For each child subtree, if it contains apples, we must traverse the edge (2 seconds round trip). The total time is the sum of round-trip costs for all edges on paths to apples.',
    code: `from collections import defaultdict

class Solution:
    def minTime(self, n: int, edges: list[list[int]], hasApple: list[bool]) -> int:
        graph = defaultdict(list)
        for u, v in edges:
            graph[u].append(v)
            graph[v].append(u)

        def dfs(node, parent):
            total = 0
            for child in graph[node]:
                if child == parent:
                    continue
                child_cost = dfs(child, node)
                if child_cost > 0 or hasApple[child]:
                    total += child_cost + 2
            return total

        return dfs(0, -1)`,
    jsCode: `var minTime = function(n, edges, hasApple) {
    const graph = new Map();
    for (let i = 0; i < n; i++) graph.set(i, []);
    for (const [u, v] of edges) {
        graph.get(u).push(v);
        graph.get(v).push(u);
    }
    const dfs = (node, parent) => {
        let total = 0;
        for (const child of graph.get(node)) {
            if (child === parent) continue;
            const childCost = dfs(child, node);
            if (childCost > 0 || hasApple[child]) total += childCost + 2;
        }
        return total;
    };
    return dfs(0, -1);
};`,
    explanation:
      '1. Build an adjacency list from the edges.\n' +
      '2. DFS from node 0. For each child, recursively compute its collection cost.\n' +
      '3. If the child subtree has apples (child_cost > 0 or hasApple[child]), add 2 for the round trip.\n' +
      '4. Otherwise, skip that subtree entirely.\n' +
      '5. Return the total cost accumulated at the root.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use DFS from the root. Only traverse edges leading to apples.',
      'Each required edge costs 2 (go and come back).',
      'A subtree is worth visiting if it contains any apple.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1456. Maximum Number of Vowels in a Substring of Given Length
  // ---------------------------------------------------------------------------
  {
    id: 1456,
    description:
      'Given a string s and an integer k, return the maximum number of vowel letters in any substring of s with length k. Vowel letters are a, e, i, o, u.',
    examples:
      'Input: s = "abciiidef", k = 3\nOutput: 3\nExplanation: "iii" contains 3 vowels.',
    approach:
      'Use a sliding window of size k. Count vowels in the initial window, then slide right, adding the new character and removing the old one. Track the maximum count.',
    code: `class Solution:
    def maxVowels(self, s: str, k: int) -> int:
        vowels = set('aeiou')
        count = sum(1 for c in s[:k] if c in vowels)
        best = count
        for i in range(k, len(s)):
            count += (s[i] in vowels) - (s[i - k] in vowels)
            best = max(best, count)
        return best`,
    jsCode: `var maxVowels = function(s, k) {
    const vowels = new Set('aeiou');
    let count = 0;
    for (let i = 0; i < k; i++) if (vowels.has(s[i])) count++;
    let best = count;
    for (let i = k; i < s.length; i++) {
        count += (vowels.has(s[i]) ? 1 : 0) - (vowels.has(s[i - k]) ? 1 : 0);
        best = Math.max(best, count);
    }
    return best;
};`,
    explanation:
      '1. Define the set of vowels.\n' +
      '2. Count vowels in the first window of size k.\n' +
      '3. Slide the window: add 1 if the new character is a vowel, subtract 1 if the removed character is.\n' +
      '4. Track the maximum vowel count across all windows.\n' +
      '5. Return the maximum.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Use a sliding window of fixed size k.',
      'Maintain a count of vowels in the current window.',
      'Update the count incrementally as the window slides.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1457. Pseudo-Palindromic Paths in a Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 1457,
    description:
      'Given a binary tree where node values are digits from 1 to 9, a path from root to leaf is pseudo-palindromic if at most one digit has an odd count. Return the number of pseudo-palindromic paths.',
    examples:
      'Input: root = [2,3,1,3,1,null,1]\nOutput: 2\nExplanation: Paths [2,3,3] and [2,1,1] can be rearranged to palindromes.',
    approach:
      'Use DFS with a bitmask to track digit parity. Toggle the bit for each digit along the path. At a leaf, the path is pseudo-palindromic if at most one bit is set (bitmask & (bitmask - 1) == 0).',
    code: `class Solution:
    def pseudoPalindromicPaths(self, root) -> int:
        def dfs(node, mask):
            if not node:
                return 0
            mask ^= (1 << node.val)
            if not node.left and not node.right:
                return 1 if mask & (mask - 1) == 0 else 0
            return dfs(node.left, mask) + dfs(node.right, mask)
        return dfs(root, 0)`,
    jsCode: `var pseudoPalindromicPaths = function(root) {
    const dfs = (node, mask) => {
        if (!node) return 0;
        mask ^= (1 << node.val);
        if (!node.left && !node.right) {
            return (mask & (mask - 1)) === 0 ? 1 : 0;
        }
        return dfs(node.left, mask) + dfs(node.right, mask);
    };
    return dfs(root, 0);
};`,
    explanation:
      '1. Use a bitmask where bit i represents the parity of digit i.\n' +
      '2. Toggle the bit for the current node\'s value: mask ^= (1 << val).\n' +
      '3. At a leaf node, check if at most one bit is set.\n' +
      '4. mask & (mask - 1) == 0 checks if mask has at most one set bit.\n' +
      '5. Sum the counts from left and right subtrees.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is the tree height',
    hints: [
      'A palindromic permutation exists if at most one character has an odd frequency.',
      'Use a bitmask to track parity of each digit along the path.',
      'At leaf nodes, check if the bitmask has at most one set bit.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1460. Make Two Arrays Equal by Reversing Subarrays
  // ---------------------------------------------------------------------------
  {
    id: 1460,
    description:
      'You are given two integer arrays target and arr of the same length. In one step, you can select any non-empty subarray of arr and reverse it. Return true if you can make arr equal to target, or false otherwise.',
    examples:
      'Input: target = [1,2,3,4], arr = [2,4,1,3]\nOutput: true',
    approach:
      'If two arrays are permutations of each other (same elements with same frequencies), you can always sort arr into target using reversals. Just check if they have the same sorted form.',
    code: `class Solution:
    def canBeEqual(self, target: list[int], arr: list[int]) -> bool:
        return sorted(target) == sorted(arr)`,
    jsCode: `var canBeEqual = function(target, arr) {
    return target.slice().sort((a, b) => a - b).join() === arr.slice().sort((a, b) => a - b).join();
};`,
    explanation:
      '1. Any permutation can be achieved through a sequence of subarray reversals.\n' +
      '2. Specifically, selection sort can be simulated using reversals.\n' +
      '3. Therefore, arr can become target if and only if they are permutations of each other.\n' +
      '4. Check this by comparing their sorted versions.\n' +
      '5. If sorted arrays are equal, return True.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Can you transform any permutation into any other using reversals?',
      'Yes, bubble sort can be simulated by reversing pairs. So just check if they are permutations.',
      'Compare sorted versions of both arrays.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1462. Course Schedule IV
  // ---------------------------------------------------------------------------
  {
    id: 1462,
    description:
      'There are numCourses courses labeled from 0 to numCourses-1. You are given prerequisites pairs and a list of queries. For each query [u, v], answer whether course u is a prerequisite of course v (directly or indirectly).',
    examples:
      'Input: numCourses = 2, prerequisites = [[1,0]], queries = [[0,1],[1,0]]\nOutput: [false,true]',
    approach:
      'Use Floyd-Warshall or BFS from each node to compute transitive closure: reachable[i][j] is True if there is a path from i to j. Then answer each query in O(1).',
    code: `class Solution:
    def checkIfPrerequisite(self, numCourses: int, prerequisites: list[list[int]], queries: list[list[int]]) -> list[bool]:
        reach = [[False] * numCourses for _ in range(numCourses)]
        for u, v in prerequisites:
            reach[u][v] = True
        for k in range(numCourses):
            for i in range(numCourses):
                for j in range(numCourses):
                    if reach[i][k] and reach[k][j]:
                        reach[i][j] = True
        return [reach[u][v] for u, v in queries]`,
    jsCode: `var checkIfPrerequisite = function(numCourses, prerequisites, queries) {
    const reach = Array.from({length: numCourses}, () => new Array(numCourses).fill(false));
    for (const [u, v] of prerequisites) reach[u][v] = true;
    for (let k = 0; k < numCourses; k++)
        for (let i = 0; i < numCourses; i++)
            for (let j = 0; j < numCourses; j++)
                if (reach[i][k] && reach[k][j]) reach[i][j] = true;
    return queries.map(([u, v]) => reach[u][v]);
};`,
    explanation:
      '1. Initialize reach[u][v] = True for direct prerequisites.\n' +
      '2. Floyd-Warshall computes transitive closure: if i can reach k and k can reach j, then i can reach j.\n' +
      '3. After the algorithm, reach[i][j] indicates if course i is a prerequisite of course j.\n' +
      '4. Answer each query in O(1) by looking up reach[u][v].\n' +
      '5. Return the list of boolean answers.',
    timeComplexity: 'O(n^3 + q)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'You need to compute the transitive closure of the prerequisite graph.',
      'Floyd-Warshall can compute all-pairs reachability in O(n^3).',
      'After precomputation, each query is answered in O(1).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1464. Maximum Product of Two Elements in an Array
  // ---------------------------------------------------------------------------
  {
    id: 1464,
    description:
      'Given the array of integers nums, choose two different indices i and j such that (nums[i]-1) * (nums[j]-1) is maximized. Return the maximum product.',
    examples:
      'Input: nums = [3,4,5,2]\nOutput: 12\nExplanation: (5-1)*(4-1) = 4*3 = 12',
    approach:
      'Find the two largest elements. The maximum product is (max1 - 1) * (max2 - 1).',
    code: `class Solution:
    def maxProduct(self, nums: list[int]) -> int:
        first = second = 0
        for num in nums:
            if num >= first:
                second = first
                first = num
            elif num > second:
                second = num
        return (first - 1) * (second - 1)`,
    jsCode: `var maxProduct = function(nums) {
    let first = 0, second = 0;
    for (const num of nums) {
        if (num >= first) {
            second = first;
            first = num;
        } else if (num > second) {
            second = num;
        }
    }
    return (first - 1) * (second - 1);
};`,
    explanation:
      '1. Track the two largest elements in one pass.\n' +
      '2. If the current number >= first, second becomes first and first becomes current.\n' +
      '3. Otherwise, if current > second, update second.\n' +
      '4. The answer is (first - 1) * (second - 1).\n' +
      '5. Since all values are positive, the two largest always give the maximum product.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'To maximize (a-1)*(b-1), choose the two largest elements.',
      'Track the top two values in a single pass.',
      'No need to sort; just maintain the two maximums.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1466. Reorder Routes to Make All Paths Lead to the City Zero
  // ---------------------------------------------------------------------------
  {
    id: 1466,
    description:
      'There are n cities numbered 0 to n-1 and n-1 roads forming a tree. Roads are directed. Reorder the minimum number of roads so that every city can reach city 0.',
    examples:
      'Input: n = 6, connections = [[0,1],[1,3],[2,3],[4,0],[4,5]]\nOutput: 3',
    approach:
      'BFS/DFS from city 0. Build an undirected graph but mark edge directions. When traversing, if an edge points away from 0 (in the original direction), it needs to be reversed.',
    code: `from collections import defaultdict, deque

class Solution:
    def minReorder(self, n: int, connections: list[list[int]]) -> int:
        graph = defaultdict(list)
        roads = set()
        for u, v in connections:
            graph[u].append(v)
            graph[v].append(u)
            roads.add((u, v))
        visited = [False] * n
        visited[0] = True
        q = deque([0])
        count = 0
        while q:
            node = q.popleft()
            for neighbor in graph[node]:
                if not visited[neighbor]:
                    visited[neighbor] = True
                    if (node, neighbor) in roads:
                        count += 1
                    q.append(neighbor)
        return count`,
    jsCode: `var minReorder = function(n, connections) {
    const graph = new Map();
    const roads = new Set();
    for (let i = 0; i < n; i++) graph.set(i, []);
    for (const [u, v] of connections) {
        graph.get(u).push(v);
        graph.get(v).push(u);
        roads.add(u + ',' + v);
    }
    const visited = new Array(n).fill(false);
    visited[0] = true;
    const q = [0];
    let count = 0;
    while (q.length) {
        const node = q.shift();
        for (const neighbor of graph.get(node)) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                if (roads.has(node + ',' + neighbor)) count++;
                q.push(neighbor);
            }
        }
    }
    return count;
};`,
    explanation:
      '1. Build an undirected graph and store original directed edges in a set.\n' +
      '2. BFS from city 0, which is the target destination.\n' +
      '3. When moving from node to neighbor, check if (node, neighbor) is an original edge.\n' +
      '4. If so, the road goes away from 0 and must be reversed; increment count.\n' +
      '5. If (neighbor, node) is the original edge, it already points toward 0; no reversal needed.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Think of the problem as BFS from city 0 outward.',
      'Edges pointing away from city 0 need to be reversed.',
      'Store original edge directions and check during traversal.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1470. Shuffle the Array
  // ---------------------------------------------------------------------------
  {
    id: 1470,
    description:
      'Given the array nums consisting of 2n elements in the form [x1,x2,...,xn,y1,y2,...,yn], return the array in the form [x1,y1,x2,y2,...,xn,yn].',
    examples:
      'Input: nums = [2,5,1,3,4,7], n = 3\nOutput: [2,3,5,4,1,7]',
    approach:
      'Interleave elements from the first half and second half. Take one from position i and one from position i+n alternately.',
    code: `class Solution:
    def shuffle(self, nums: list[int], n: int) -> list[int]:
        result = []
        for i in range(n):
            result.append(nums[i])
            result.append(nums[i + n])
        return result`,
    jsCode: `var shuffle = function(nums, n) {
    const result = [];
    for (let i = 0; i < n; i++) {
        result.push(nums[i]);
        result.push(nums[i + n]);
    }
    return result;
};`,
    explanation:
      '1. The first half is nums[0..n-1] and the second half is nums[n..2n-1].\n' +
      '2. For each index i from 0 to n-1, append nums[i] then nums[i+n].\n' +
      '3. This interleaves the two halves as required.\n' +
      '4. The result has the same length as the input.\n' +
      '5. Return the interleaved array.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The first half contains x values and the second half contains y values.',
      'Pair up x_i with y_i by taking nums[i] and nums[i+n].',
      'Build the result by appending pairs.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1472. Design Browser History
  // ---------------------------------------------------------------------------
  {
    id: 1472,
    description:
      'Design a browser history system. Implement BrowserHistory with visit(url), back(steps), and forward(steps). Visit clears forward history. Back and forward move by at most the available steps.',
    examples:
      'Input: ["BrowserHistory","visit","visit","visit","back","back","forward","visit","forward","back"]\n[["leetcode.com"],["google.com"],["facebook.com"],["youtube.com"],[1],[1],[1],["linkedin.com"],[2],[2]]\nOutput: [null,null,null,null,"facebook.com","google.com","facebook.com",null,"linkedin.com","google.com"]',
    approach:
      'Use a list to store history and a pointer for the current position. Visit appends after the current position and clears forward history. Back and forward adjust the pointer within bounds.',
    code: `class BrowserHistory:
    def __init__(self, homepage: str):
        self.history = [homepage]
        self.cur = 0

    def visit(self, url: str) -> None:
        self.history = self.history[:self.cur + 1]
        self.history.append(url)
        self.cur += 1

    def back(self, steps: int) -> str:
        self.cur = max(0, self.cur - steps)
        return self.history[self.cur]

    def forward(self, steps: int) -> str:
        self.cur = min(len(self.history) - 1, self.cur + steps)
        return self.history[self.cur]`,
    jsCode: `var BrowserHistory = function(homepage) {
    this.history = [homepage];
    this.cur = 0;
};

BrowserHistory.prototype.visit = function(url) {
    this.history = this.history.slice(0, this.cur + 1);
    this.history.push(url);
    this.cur++;
};

BrowserHistory.prototype.back = function(steps) {
    this.cur = Math.max(0, this.cur - steps);
    return this.history[this.cur];
};

BrowserHistory.prototype.forward = function(steps) {
    this.cur = Math.min(this.history.length - 1, this.cur + steps);
    return this.history[this.cur];
};`,
    explanation:
      '1. Store visited URLs in a list and track the current index.\n' +
      '2. visit: truncate history after current position and append the new URL.\n' +
      '3. back: move current pointer left by steps, clamped to 0.\n' +
      '4. forward: move current pointer right by steps, clamped to the end.\n' +
      '5. Return the URL at the current position for back/forward.',
    timeComplexity: 'O(1) for back/forward, O(n) for visit (truncation)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a list and a pointer to track position in history.',
      'Visit clears everything after the current position.',
      'Back and forward clamp the pointer within valid bounds.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1475. Final Prices With a Special Discount in a Shop
  // ---------------------------------------------------------------------------
  {
    id: 1475,
    description:
      'You are given an array prices. For each item i, find the first item j > i where prices[j] <= prices[i] and subtract prices[j] from prices[i]. If no such j exists, the price stays the same. Return the final prices.',
    examples:
      'Input: prices = [8,4,6,2,3]\nOutput: [4,2,4,2,3]',
    approach:
      'Use a monotonic stack. Iterate through prices; for each price, pop stack elements that are >= the current price and apply the discount to them.',
    code: `class Solution:
    def finalPrices(self, prices: list[int]) -> list[int]:
        result = prices[:]
        stack = []
        for i, p in enumerate(prices):
            while stack and prices[stack[-1]] >= p:
                result[stack.pop()] -= p
            stack.append(i)
        return result`,
    jsCode: `var finalPrices = function(prices) {
    const result = [...prices];
    const stack = [];
    for (let i = 0; i < prices.length; i++) {
        while (stack.length && prices[stack[stack.length - 1]] >= prices[i]) {
            result[stack.pop()] -= prices[i];
        }
        stack.push(i);
    }
    return result;
};`,
    explanation:
      '1. Copy prices to result array.\n' +
      '2. Maintain a monotonic stack of indices.\n' +
      '3. For each price p, pop indices where prices[idx] >= p (found the discount).\n' +
      '4. Subtract p from result[idx] for each popped index.\n' +
      '5. Push the current index onto the stack.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'This is a "next smaller or equal element" problem.',
      'Use a monotonic stack to find the first j > i with prices[j] <= prices[i].',
      'Pop from the stack when a suitable discount is found.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1480. Running Sum of 1d Array
  // ---------------------------------------------------------------------------
  {
    id: 1480,
    description:
      'Given an array nums, return the running sum of nums. The running sum is defined as runningSum[i] = sum(nums[0]...nums[i]).',
    examples:
      'Input: nums = [1,2,3,4]\nOutput: [1,3,6,10]',
    approach:
      'Iterate through the array and accumulate the sum. Each element becomes the sum of itself and all previous elements.',
    code: `class Solution:
    def runningSum(self, nums: list[int]) -> list[int]:
        for i in range(1, len(nums)):
            nums[i] += nums[i - 1]
        return nums`,
    jsCode: `var runningSum = function(nums) {
    for (let i = 1; i < nums.length; i++) nums[i] += nums[i - 1];
    return nums;
};`,
    explanation:
      '1. Start from index 1 (index 0 is already its own running sum).\n' +
      '2. Add the previous element to the current element in-place.\n' +
      '3. After processing, nums[i] contains the sum of nums[0..i].\n' +
      '4. This is a prefix sum computation.\n' +
      '5. Return the modified array.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'This is a prefix sum problem.',
      'Each element = previous running sum + current value.',
      'You can modify the array in-place.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1482. Minimum Number of Days to Make m Bouquets
  // ---------------------------------------------------------------------------
  {
    id: 1482,
    description:
      'You have n flowers in a garden, each blooming on day bloomDay[i]. To make a bouquet, you need k adjacent flowers. Find the minimum number of days to make m bouquets. Return -1 if impossible.',
    examples:
      'Input: bloomDay = [1,10,3,10,2], m = 3, k = 1\nOutput: 3',
    approach:
      'Binary search on the answer (the day). For each candidate day, count how many bouquets of k adjacent bloomed flowers can be made. Check if it is >= m.',
    code: `class Solution:
    def minDays(self, bloomDay: list[int], m: int, k: int) -> int:
        if m * k > len(bloomDay):
            return -1
        def canMake(day):
            bouquets = flowers = 0
            for b in bloomDay:
                if b <= day:
                    flowers += 1
                    if flowers == k:
                        bouquets += 1
                        flowers = 0
                else:
                    flowers = 0
            return bouquets >= m
        lo, hi = min(bloomDay), max(bloomDay)
        while lo < hi:
            mid = (lo + hi) // 2
            if canMake(mid):
                hi = mid
            else:
                lo = mid + 1
        return lo`,
    jsCode: `var minDays = function(bloomDay, m, k) {
    if (m * k > bloomDay.length) return -1;
    const canMake = (day) => {
        let bouquets = 0, flowers = 0;
        for (const b of bloomDay) {
            if (b <= day) {
                flowers++;
                if (flowers === k) { bouquets++; flowers = 0; }
            } else {
                flowers = 0;
            }
        }
        return bouquets >= m;
    };
    let lo = Math.min(...bloomDay), hi = Math.max(...bloomDay);
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (canMake(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
};`,
    explanation:
      '1. If m * k > n, it is impossible; return -1.\n' +
      '2. Binary search on the day from min(bloomDay) to max(bloomDay).\n' +
      '3. For a given day, count consecutive bloomed flowers to form bouquets.\n' +
      '4. If bouquets >= m, try an earlier day; otherwise try a later day.\n' +
      '5. Return the minimum day when m bouquets can be made.',
    timeComplexity: 'O(n * log(max(bloomDay)))',
    spaceComplexity: 'O(1)',
    hints: [
      'More days means more flowers bloom; the feasibility is monotonic.',
      'Binary search on the day and check if enough bouquets can be formed.',
      'Count consecutive bloomed flowers to determine the number of bouquets.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1489. Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree
  // ---------------------------------------------------------------------------
  {
    id: 1489,
    description:
      'Given a weighted undirected graph, find all critical and pseudo-critical edges in its MST. A critical edge is one whose removal increases the MST weight. A pseudo-critical edge is one that can appear in some MST but is not critical.',
    examples:
      'Input: n = 5, edges = [[0,1,1],[1,2,1],[2,3,2],[0,3,2],[0,4,3],[3,4,3],[1,4,6]]\nOutput: [[0,1],[2,3,4,5]]',
    approach:
      'Compute the MST weight. For each edge, check: (1) if excluding it increases MST weight (critical), (2) if including it first still produces the same MST weight (pseudo-critical).',
    code: `class Solution:
    def findCriticalAndPseudoCriticalEdges(self, n: int, edges: list[list[int]]) -> list[list[int]]:
        indexed_edges = [(w, u, v, i) for i, (u, v, w) in enumerate(edges)]
        indexed_edges.sort()

        def find(parent, x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        def mst_weight(n, edges, include=None, exclude=None):
            parent = list(range(n))
            weight = 0
            count = 0
            if include is not None:
                w, u, v, _ = include
                pu, pv = find(parent, u), find(parent, v)
                parent[pu] = pv
                weight += w
                count += 1
            for w, u, v, i in edges:
                if exclude is not None and i == exclude:
                    continue
                pu, pv = find(parent, u), find(parent, v)
                if pu != pv:
                    parent[pu] = pv
                    weight += w
                    count += 1
            if count < n - 1:
                return float('inf')
            return weight

        base = mst_weight(n, indexed_edges)
        critical, pseudo = [], []
        for w, u, v, i in indexed_edges:
            if mst_weight(n, indexed_edges, exclude=i) > base:
                critical.append(i)
            elif mst_weight(n, indexed_edges, include=(w, u, v, i)) == base:
                pseudo.append(i)
        return [critical, pseudo]`,
    jsCode: `var findCriticalAndPseudoCriticalEdges = function(n, edges) {
    const indexedEdges = edges.map(([u, v, w], i) => [w, u, v, i]).sort((a, b) => a[0] - b[0]);
    const find = (parent, x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    const mstWeight = (n, edges, include, exclude) => {
        const parent = Array.from({length: n}, (_, i) => i);
        let weight = 0, count = 0;
        if (include !== null) {
            const [w, u, v] = include;
            const pu = find(parent, u), pv = find(parent, v);
            parent[pu] = pv;
            weight += w;
            count++;
        }
        for (const [w, u, v, i] of edges) {
            if (exclude !== null && i === exclude) continue;
            const pu = find(parent, u), pv = find(parent, v);
            if (pu !== pv) { parent[pu] = pv; weight += w; count++; }
        }
        return count < n - 1 ? Infinity : weight;
    };
    const base = mstWeight(n, indexedEdges, null, null);
    const critical = [], pseudo = [];
    for (const [w, u, v, i] of indexedEdges) {
        if (mstWeight(n, indexedEdges, null, i) > base) critical.push(i);
        else if (mstWeight(n, indexedEdges, [w, u, v], null) === base) pseudo.push(i);
    }
    return [critical, pseudo];
};`,
    explanation:
      '1. Compute the base MST weight using Kruskal\'s algorithm.\n' +
      '2. For each edge, test exclusion: if MST weight increases, the edge is critical.\n' +
      '3. For non-critical edges, test inclusion: force it into the MST first.\n' +
      '4. If the total weight with the forced edge equals the base MST, it is pseudo-critical.\n' +
      '5. Return the two lists of edge indices.',
    timeComplexity: 'O(E^2 * alpha(V))',
    spaceComplexity: 'O(V + E)',
    hints: [
      'A critical edge increases MST weight when removed.',
      'A pseudo-critical edge can be in some MST but removing it does not increase weight.',
      'Test each edge by excluding and including it in MST construction.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1491. Average Salary Excluding the Minimum and Maximum Salary
  // ---------------------------------------------------------------------------
  {
    id: 1491,
    description:
      'Given an array of unique integers salary, return the average salary excluding the minimum and maximum salary. Answers within 10^-5 of the actual answer are accepted.',
    examples:
      'Input: salary = [4000,3000,1000,2000]\nOutput: 2500.00000\nExplanation: Min=1000, Max=4000. Average of [3000,2000] = 2500.',
    approach:
      'Find the sum of all salaries, subtract the minimum and maximum, then divide by (n - 2).',
    code: `class Solution:
    def average(self, salary: list[int]) -> float:
        return (sum(salary) - min(salary) - max(salary)) / (len(salary) - 2)`,
    jsCode: `var average = function(salary) {
    return (salary.reduce((a, b) => a + b, 0) - Math.min(...salary) - Math.max(...salary)) / (salary.length - 2);
};`,
    explanation:
      '1. Compute the total sum of all salaries.\n' +
      '2. Subtract the minimum and maximum values.\n' +
      '3. Divide by (n - 2) to get the average of the remaining salaries.\n' +
      '4. Since all salaries are unique, the min and max are distinct.\n' +
      '5. Return the result as a float.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Find the sum, min, and max in one pass.',
      'Subtract min and max from the sum.',
      'Divide by n - 2.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1492. The kth Factor of n
  // ---------------------------------------------------------------------------
  {
    id: 1492,
    description:
      'You are given two positive integers n and k. A factor of n is an integer i where n % i == 0. Return the kth factor of n in ascending order, or -1 if n has fewer than k factors.',
    examples:
      'Input: n = 12, k = 3\nOutput: 3\nExplanation: Factors of 12 are [1,2,3,4,6,12]. The 3rd factor is 3.',
    approach:
      'Iterate from 1 to n, check if each number is a factor, and count. Return the k-th one found.',
    code: `class Solution:
    def kthFactor(self, n: int, k: int) -> int:
        count = 0
        for i in range(1, n + 1):
            if n % i == 0:
                count += 1
                if count == k:
                    return i
        return -1`,
    jsCode: `var kthFactor = function(n, k) {
    let count = 0;
    for (let i = 1; i <= n; i++) {
        if (n % i === 0) {
            count++;
            if (count === k) return i;
        }
    }
    return -1;
};`,
    explanation:
      '1. Iterate i from 1 to n.\n' +
      '2. If n % i == 0, i is a factor; increment count.\n' +
      '3. If count reaches k, return i immediately.\n' +
      '4. If we finish the loop without finding k factors, return -1.\n' +
      '5. Factors are naturally found in ascending order.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Iterate from 1 to n and check divisibility.',
      'Count factors until you reach the k-th one.',
      'For optimization, you could iterate up to sqrt(n) and handle both factors.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1493. Longest Subarray of 1s After Deleting One Element
  // ---------------------------------------------------------------------------
  {
    id: 1493,
    description:
      'Given a binary array nums, you should delete one element from it. Return the size of the longest non-empty subarray containing only 1s in the resulting array. Return 0 if there is no such subarray.',
    examples:
      'Input: nums = [1,1,0,1,1,1,0,1,1,1,1,0,0]\nOutput: 7',
    approach:
      'Use a sliding window that allows at most one 0. Track the window boundaries and count of zeros. The answer is the maximum window size minus 1 (since we must delete one element).',
    code: `class Solution:
    def longestSubarray(self, nums: list[int]) -> int:
        left = 0
        zeros = 0
        best = 0
        for right in range(len(nums)):
            if nums[right] == 0:
                zeros += 1
            while zeros > 1:
                if nums[left] == 0:
                    zeros -= 1
                left += 1
            best = max(best, right - left)
        return best`,
    jsCode: `var longestSubarray = function(nums) {
    let left = 0, zeros = 0, best = 0;
    for (let right = 0; right < nums.length; right++) {
        if (nums[right] === 0) zeros++;
        while (zeros > 1) {
            if (nums[left] === 0) zeros--;
            left++;
        }
        best = Math.max(best, right - left);
    }
    return best;
};`,
    explanation:
      '1. Sliding window with at most one 0 inside.\n' +
      '2. Expand right; if we encounter a 0, increment zeros count.\n' +
      '3. If zeros > 1, shrink from the left until zeros <= 1.\n' +
      '4. The window size is right - left + 1, but we must delete one element, so count right - left.\n' +
      '5. Return the maximum right - left across all valid windows.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'This is like the "longest substring with at most one 0" problem.',
      'Use a sliding window allowing at most one zero inside.',
      'The answer is window size minus 1 (we must delete one element).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1498. Number of Subsequences That Satisfy the Given Sum Condition
  // ---------------------------------------------------------------------------
  {
    id: 1498,
    description:
      'Given an array of integers nums and an integer target, return the number of non-empty subsequences of nums such that the sum of the minimum and maximum element is less than or equal to target. Return the answer modulo 10^9 + 7.',
    examples:
      'Input: nums = [3,5,6,7], target = 9\nOutput: 4',
    approach:
      'Sort nums. Use two pointers: for each left pointer (min element), find the farthest right pointer where nums[left] + nums[right] <= target. All 2^(right-left) subsequences using nums[left] as min are valid.',
    code: `class Solution:
    def numSubseq(self, nums: list[int], target: int) -> int:
        MOD = 10**9 + 7
        nums.sort()
        n = len(nums)
        result = 0
        left, right = 0, n - 1
        while left <= right:
            if nums[left] + nums[right] <= target:
                result = (result + pow(2, right - left, MOD)) % MOD
                left += 1
            else:
                right -= 1
        return result`,
    jsCode: `var numSubseq = function(nums, target) {
    const MOD = 1000000007;
    nums.sort((a, b) => a - b);
    const n = nums.length;
    const pow2 = new Array(n).fill(1);
    for (let i = 1; i < n; i++) pow2[i] = (pow2[i - 1] * 2) % MOD;
    let result = 0, left = 0, right = n - 1;
    while (left <= right) {
        if (nums[left] + nums[right] <= target) {
            result = (result + pow2[right - left]) % MOD;
            left++;
        } else {
            right--;
        }
    }
    return result;
};`,
    explanation:
      '1. Sort the array so we can use two pointers.\n' +
      '2. For each left (minimum element), find the farthest right where min + max <= target.\n' +
      '3. With left fixed as minimum, we can choose any subset of elements in [left+1, right].\n' +
      '4. There are 2^(right-left) such subsequences (each middle element is included or not).\n' +
      '5. Sum all valid counts modulo 10^9 + 7.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sort the array. The order of elements in a subsequence does not matter for min/max.',
      'Use two pointers to pair the smallest with the largest elements.',
      'For a fixed minimum, count all valid subsequences using powers of 2.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1504. Count Submatrices With All Ones
  // ---------------------------------------------------------------------------
  {
    id: 1504,
    description:
      'Given an m x n binary matrix, return the number of submatrices that have all ones.',
    examples:
      'Input: mat = [[1,0,1],[1,1,0],[1,1,0]]\nOutput: 13',
    approach:
      'For each row, compute the height of consecutive 1s ending at each cell (histogram approach). Then for each cell, count submatrices using a stack-based method or by iterating upward to count rectangles.',
    code: `class Solution:
    def numSubmat(self, mat: list[list[int]]) -> int:
        m, n = len(mat), len(mat[0])
        height = [0] * n
        total = 0
        for i in range(m):
            for j in range(n):
                height[j] = height[j] + 1 if mat[i][j] == 1 else 0
            # For this row, count submatrices
            for j in range(n):
                min_h = height[j]
                for k in range(j, -1, -1):
                    if height[k] == 0:
                        break
                    min_h = min(min_h, height[k])
                    total += min_h
        return total`,
    jsCode: `var numSubmat = function(mat) {
    const m = mat.length, n = mat[0].length;
    const height = new Array(n).fill(0);
    let total = 0;
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            height[j] = mat[i][j] === 1 ? height[j] + 1 : 0;
        }
        for (let j = 0; j < n; j++) {
            let minH = height[j];
            for (let k = j; k >= 0; k--) {
                if (height[k] === 0) break;
                minH = Math.min(minH, height[k]);
                total += minH;
            }
        }
    }
    return total;
};`,
    explanation:
      '1. Compute histogram heights: height[j] = consecutive 1s above (including row i) at column j.\n' +
      '2. For each cell (i, j), iterate left to count all-ones submatrices ending at row i.\n' +
      '3. Track min_h as the minimum height from column k to j.\n' +
      '4. min_h gives the number of submatrices with bottom-right at (i, j) and width from k to j.\n' +
      '5. Sum all contributions for the total count.',
    timeComplexity: 'O(m * n^2)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use histogram heights like in the maximal rectangle problem.',
      'For each row, compute heights of consecutive 1s above each cell.',
      'For each cell, scan left with the minimum height to count valid submatrices.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1505. Minimum Possible Integer After at Most K Adjacent Swaps On Digits
  // ---------------------------------------------------------------------------
  {
    id: 1505,
    description:
      'Given a string num representing a large integer and an integer k, you can swap two adjacent digits at most k times. Return the minimum integer you can obtain as a string.',
    examples:
      'Input: num = "4321", k = 4\nOutput: "1342"',
    approach:
      'Greedily pick the smallest digit within the first k+1 positions, move it to the front (using k swaps), and repeat for the remaining string with updated k.',
    code: `class Solution:
    def minInteger(self, num: str, k: int) -> str:
        from collections import deque
        if k <= 0 or not num:
            return num
        queues = [deque() for _ in range(10)]
        for i, c in enumerate(num):
            queues[int(c)].append(i)
        n = len(num)
        bit = [0] * (n + 1)
        def update(i, val):
            i += 1
            while i <= n:
                bit[i] += val
                i += i & (-i)
        def query(i):
            s = 0
            i += 1
            while i > 0:
                s += bit[i]
                i -= i & (-i)
            return s
        result = []
        used = [False] * n
        for _ in range(n):
            for d in range(10):
                if not queues[d]:
                    continue
                idx = queues[d][0]
                swaps = idx - query(idx)
                if swaps <= k:
                    k -= swaps
                    queues[d].popleft()
                    result.append(str(d))
                    used[idx] = True
                    update(idx, 1)
                    break
        return ''.join(result)`,
    jsCode: `var minInteger = function(num, k) {
    if (k <= 0 || !num) return num;
    const queues = Array.from({length: 10}, () => []);
    for (let i = 0; i < num.length; i++) queues[Number(num[i])].push(i);
    const n = num.length;
    const bit = new Array(n + 1).fill(0);
    const update = (i, val) => { i++; while (i <= n) { bit[i] += val; i += i & (-i); } };
    const query = (i) => { let s = 0; i++; while (i > 0) { s += bit[i]; i -= i & (-i); } return s; };
    const result = [];
    for (let pos = 0; pos < n; pos++) {
        for (let d = 0; d <= 9; d++) {
            if (!queues[d].length) continue;
            const idx = queues[d][0];
            const swaps = idx - query(idx);
            if (swaps <= k) {
                k -= swaps;
                queues[d].shift();
                result.push(String(d));
                update(idx, 1);
                break;
            }
        }
    }
    return result.join('');
};`,
    explanation:
      '1. Use digit queues to store positions of each digit 0-9.\n' +
      '2. Use a BIT (Fenwick tree) to track how many positions before idx have been used.\n' +
      '3. For each position in the result, try digits 0-9 in order.\n' +
      '4. The number of swaps to move digit at idx to the front is idx - (used positions before idx).\n' +
      '5. If swaps <= k, use this digit; otherwise try the next larger digit.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Greedily choose the smallest digit that can be moved to the front within k swaps.',
      'Use a BIT to efficiently count how many earlier positions have been used.',
      'Maintain queues for each digit to quickly find the leftmost occurrence.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1508. Range Sum of Sorted Subarray Sums
  // ---------------------------------------------------------------------------
  {
    id: 1508,
    description:
      'Given an array of n positive integers, compute all n*(n+1)/2 non-empty subarray sums, sort them, and return the sum of elements from index left to right (1-indexed) modulo 10^9 + 7.',
    examples:
      'Input: nums = [1,2,3,4], n = 4, left = 1, right = 5\nOutput: 13',
    approach:
      'Generate all subarray sums, sort them, and sum the elements from index left-1 to right-1. For small n this is efficient enough.',
    code: `class Solution:
    def rangeSum(self, nums: list[int], n: int, left: int, right: int) -> int:
        MOD = 10**9 + 7
        sums = []
        for i in range(n):
            s = 0
            for j in range(i, n):
                s += nums[j]
                sums.append(s)
        sums.sort()
        return sum(sums[left - 1:right]) % MOD`,
    jsCode: `var rangeSum = function(nums, n, left, right) {
    const MOD = 1000000007;
    const sums = [];
    for (let i = 0; i < n; i++) {
        let s = 0;
        for (let j = i; j < n; j++) {
            s += nums[j];
            sums.push(s);
        }
    }
    sums.sort((a, b) => a - b);
    let result = 0;
    for (let i = left - 1; i < right; i++) result = (result + sums[i]) % MOD;
    return result;
};`,
    explanation:
      '1. Generate all subarray sums by iterating start index i and extending to each end j.\n' +
      '2. Collect all n*(n+1)/2 sums in a list.\n' +
      '3. Sort the sums list.\n' +
      '4. Sum elements from index left-1 to right-1 (converting to 0-indexed).\n' +
      '5. Return the result modulo 10^9 + 7.',
    timeComplexity: 'O(n^2 log n)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Generate all subarray sums by nested iteration.',
      'Sort all the sums.',
      'Sum the elements in the given range.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1509. Minimum Difference Between Largest and Smallest Value in Three Moves
  // ---------------------------------------------------------------------------
  {
    id: 1509,
    description:
      'Given an integer array nums, in one move you can choose any element and change it to any value. Return the minimum difference between the largest and smallest value after performing at most three moves.',
    examples:
      'Input: nums = [5,3,2,4]\nOutput: 0\nExplanation: With 3 moves you can change 3 of the 4 elements.',
    approach:
      'Sort the array. With 3 moves, we can remove the 3 largest, 3 smallest, or a combination. Check all 4 options: remove i from the left and 3-i from the right for i in 0..3.',
    code: `class Solution:
    def minDifference(self, nums: list[int]) -> int:
        if len(nums) <= 4:
            return 0
        nums.sort()
        return min(nums[-(4 - i)] - nums[i] for i in range(4))`,
    jsCode: `var minDifference = function(nums) {
    if (nums.length <= 4) return 0;
    nums.sort((a, b) => a - b);
    let result = Infinity;
    for (let i = 0; i < 4; i++) {
        result = Math.min(result, nums[nums.length - (4 - i)] - nums[i]);
    }
    return result;
};`,
    explanation:
      '1. If the array has 4 or fewer elements, we can make all equal; return 0.\n' +
      '2. Sort the array.\n' +
      '3. Try removing i smallest and (3-i) largest elements for i in 0,1,2,3.\n' +
      '4. The remaining range is nums[-(4-i)] - nums[i].\n' +
      '5. Return the minimum of these 4 options.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'After sorting, the answer involves removing some combination of the smallest and largest elements.',
      'With 3 moves, you effectively remove 3 elements from the ends.',
      'Try all 4 combinations: 0+3, 1+2, 2+1, 3+0 removals from left+right.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1512. Number of Good Pairs
  // ---------------------------------------------------------------------------
  {
    id: 1512,
    description:
      'Given an array of integers nums, return the number of good pairs. A pair (i, j) is good if nums[i] == nums[j] and i < j.',
    examples:
      'Input: nums = [1,2,3,1,1,3]\nOutput: 4',
    approach:
      'Count frequencies. For each value with count c, the number of pairs is c * (c-1) / 2. Alternatively, iterate and count how many previous elements equal the current one.',
    code: `from collections import Counter

class Solution:
    def numIdenticalPairs(self, nums: list[int]) -> int:
        count = Counter()
        result = 0
        for num in nums:
            result += count[num]
            count[num] += 1
        return result`,
    jsCode: `var numIdenticalPairs = function(nums) {
    const count = new Map();
    let result = 0;
    for (const num of nums) {
        result += count.get(num) || 0;
        count.set(num, (count.get(num) || 0) + 1);
    }
    return result;
};`,
    explanation:
      '1. Iterate through the array, maintaining a count of each seen value.\n' +
      '2. For each element, the number of good pairs it forms equals the count of that value so far.\n' +
      '3. Add this count to the result.\n' +
      '4. Increment the count of the current value.\n' +
      '5. Return the total number of good pairs.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'For each element, count how many previous elements have the same value.',
      'Use a frequency counter as you iterate.',
      'Each matching previous element forms one good pair.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1514. Path with Maximum Probability
  // ---------------------------------------------------------------------------
  {
    id: 1514,
    description:
      'You are given an undirected weighted graph where edge weights represent success probabilities (0 to 1). Find the path with the maximum probability from start to end node. Return 0 if no path exists.',
    examples:
      'Input: n = 3, edges = [[0,1],[1,2],[0,2]], succProb = [0.5,0.5,0.2], start = 0, end = 2\nOutput: 0.25',
    approach:
      'Use a modified Dijkstra algorithm with a max-heap. Instead of minimizing distance, maximize probability. Start with probability 1.0 at the start node.',
    code: `import heapq
from collections import defaultdict

class Solution:
    def maxProbability(self, n: int, edges: list[list[int]], succProb: list[float], start_node: int, end_node: int) -> float:
        graph = defaultdict(list)
        for (u, v), p in zip(edges, succProb):
            graph[u].append((v, p))
            graph[v].append((u, p))
        prob = [0.0] * n
        prob[start_node] = 1.0
        heap = [(-1.0, start_node)]
        while heap:
            neg_p, node = heapq.heappop(heap)
            p = -neg_p
            if node == end_node:
                return p
            if p < prob[node]:
                continue
            for nei, edge_p in graph[node]:
                new_p = p * edge_p
                if new_p > prob[nei]:
                    prob[nei] = new_p
                    heapq.heappush(heap, (-new_p, nei))
        return 0.0`,
    jsCode: `var maxProbability = function(n, edges, succProb, startNode, endNode) {
    const graph = new Map();
    for (let i = 0; i < n; i++) graph.set(i, []);
    for (let i = 0; i < edges.length; i++) {
        const [u, v] = edges[i];
        graph.get(u).push([v, succProb[i]]);
        graph.get(v).push([u, succProb[i]]);
    }
    const prob = new Array(n).fill(0);
    prob[startNode] = 1.0;
    // Simple BFS-based relaxation (Bellman-Ford style with queue)
    const q = [startNode];
    while (q.length) {
        const node = q.shift();
        for (const [nei, edgeP] of graph.get(node)) {
            const newP = prob[node] * edgeP;
            if (newP > prob[nei]) {
                prob[nei] = newP;
                q.push(nei);
            }
        }
    }
    return prob[endNode];
};`,
    explanation:
      '1. Build an adjacency list with probabilities.\n' +
      '2. Use a max-heap (negate probabilities for Python\'s min-heap).\n' +
      '3. Start with probability 1.0 at start_node.\n' +
      '4. For each neighbor, compute new probability = current * edge probability.\n' +
      '5. If it improves the best known probability, push to heap. Return when end_node is popped.',
    timeComplexity: 'O(E log V)',
    spaceComplexity: 'O(V + E)',
    hints: [
      'This is a shortest path problem but maximizing probability instead of minimizing distance.',
      'Use Dijkstra with a max-heap (negate probabilities).',
      'Multiply probabilities along the path instead of adding.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1518. Water Bottles
  // ---------------------------------------------------------------------------
  {
    id: 1518,
    description:
      'Given numBottles full water bottles and numExchange empty bottles that can be exchanged for one full bottle. Return the maximum number of water bottles you can drink.',
    examples:
      'Input: numBottles = 9, numExchange = 3\nOutput: 13',
    approach:
      'Simulate the process. Drink all full bottles (getting empty bottles), then exchange empty bottles for full ones. Repeat until you cannot exchange anymore.',
    code: `class Solution:
    def numWaterBottles(self, numBottles: int, numExchange: int) -> int:
        total = numBottles
        empty = numBottles
        while empty >= numExchange:
            new_full = empty // numExchange
            total += new_full
            empty = empty % numExchange + new_full
        return total`,
    jsCode: `var numWaterBottles = function(numBottles, numExchange) {
    let total = numBottles;
    let empty = numBottles;
    while (empty >= numExchange) {
        const newFull = Math.floor(empty / numExchange);
        total += newFull;
        empty = empty % numExchange + newFull;
    }
    return total;
};`,
    explanation:
      '1. Start by drinking all numBottles, getting that many empty bottles.\n' +
      '2. Exchange empty bottles: new_full = empty // numExchange.\n' +
      '3. Remaining empties = empty % numExchange + new_full (from drinking the new ones).\n' +
      '4. Add new_full to total and repeat.\n' +
      '5. Stop when empty < numExchange.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Simulate the exchange process.',
      'After drinking, empty bottles become exchangeable.',
      'Keep exchanging until you do not have enough empty bottles.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1523. Count Odd Numbers in an Interval Range
  // ---------------------------------------------------------------------------
  {
    id: 1523,
    description:
      'Given two non-negative integers low and high, return the count of odd numbers between low and high (inclusive).',
    examples:
      'Input: low = 3, high = 7\nOutput: 3\nExplanation: The odd numbers are 3, 5, 7.',
    approach:
      'The count of odd numbers from 0 to n is (n + 1) // 2. Use inclusion-exclusion: count from 0 to high minus count from 0 to low - 1.',
    code: `class Solution:
    def countOdds(self, low: int, high: int) -> int:
        return (high + 1) // 2 - low // 2`,
    jsCode: `var countOdds = function(low, high) {
    return Math.floor((high + 1) / 2) - Math.floor(low / 2);
};`,
    explanation:
      '1. Count of odd numbers from 0 to n (inclusive) is (n + 1) // 2.\n' +
      '2. Count of odd numbers from 0 to low-1 is low // 2.\n' +
      '3. Odd numbers in [low, high] = (high + 1) // 2 - low // 2.\n' +
      '4. This is a simple mathematical formula.\n' +
      '5. Works for all non-negative ranges.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    hints: [
      'Think about counting odd numbers from 0 to n.',
      'Use the formula: (n + 1) // 2 gives odd count from 0 to n.',
      'Apply inclusion-exclusion for the range [low, high].',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1526. Minimum Number of Increments on Subarrays to Form a Target Array
  // ---------------------------------------------------------------------------
  {
    id: 1526,
    description:
      'You are given an integer array target. You start with an array of zeros. In each operation, you choose a subarray and increment each element by 1. Return the minimum number of operations to form the target array.',
    examples:
      'Input: target = [1,2,3,2,1]\nOutput: 3',
    approach:
      'The answer is the sum of positive differences between consecutive elements (treating target[-1] as 0 on the left). Each increase from the previous element requires new operations.',
    code: `class Solution:
    def minNumberOperations(self, target: list[int]) -> int:
        result = target[0]
        for i in range(1, len(target)):
            if target[i] > target[i - 1]:
                result += target[i] - target[i - 1]
        return result`,
    jsCode: `var minNumberOperations = function(target) {
    let result = target[0];
    for (let i = 1; i < target.length; i++) {
        if (target[i] > target[i - 1]) result += target[i] - target[i - 1];
    }
    return result;
};`,
    explanation:
      '1. Start with result = target[0] (operations needed for the first element).\n' +
      '2. For each subsequent element, if it is higher than the previous, we need additional operations.\n' +
      '3. The number of additional operations is target[i] - target[i-1].\n' +
      '4. Decreases do not require new operations (existing operations just stop at the previous position).\n' +
      '5. Sum all positive increases.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Think of the target as a histogram. Each operation paints a horizontal line.',
      'Increases from the previous element require new operations.',
      'Decreases are free because existing operations simply end earlier.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1528. Shuffle String
  // ---------------------------------------------------------------------------
  {
    id: 1528,
    description:
      'You are given a string s and an integer array indices of the same length. The string s will be shuffled such that the character at position i moves to indices[i]. Return the shuffled string.',
    examples:
      'Input: s = "codeleet", indices = [4,5,6,7,0,2,1,3]\nOutput: "leetcode"',
    approach:
      'Create a result array. Place each character s[i] at position indices[i]. Join and return.',
    code: `class Solution:
    def restoreString(self, s: str, indices: list[int]) -> str:
        result = [''] * len(s)
        for i, idx in enumerate(indices):
            result[idx] = s[i]
        return ''.join(result)`,
    jsCode: `var restoreString = function(s, indices) {
    const result = new Array(s.length);
    for (let i = 0; i < s.length; i++) result[indices[i]] = s[i];
    return result.join('');
};`,
    explanation:
      '1. Create a result list of the same length as s.\n' +
      '2. For each index i, place s[i] at position indices[i] in result.\n' +
      '3. Join the result list into a string.\n' +
      '4. Each character is placed exactly once.\n' +
      '5. Return the shuffled string.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The character at position i in the original string goes to position indices[i].',
      'Create a new array and place each character at its target index.',
      'Join the array into a string.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1530. Number of Good Leaf Nodes Pairs
  // ---------------------------------------------------------------------------
  {
    id: 1530,
    description:
      'Given the root of a binary tree and an integer distance, return the number of good leaf node pairs. A pair of leaf nodes is good if the shortest path between them is less than or equal to distance.',
    examples:
      'Input: root = [1,2,3,null,4], distance = 3\nOutput: 1',
    approach:
      'Post-order DFS. For each node, return a list of distances from that node to all leaf descendants. At each internal node, check all pairs of leaves from the left and right subtrees.',
    code: `class Solution:
    def countPairs(self, root, distance: int) -> int:
        self.count = 0

        def dfs(node):
            if not node:
                return []
            if not node.left and not node.right:
                return [1]
            left = dfs(node.left)
            right = dfs(node.right)
            for l in left:
                for r in right:
                    if l + r <= distance:
                        self.count += 1
            return [d + 1 for d in left + right if d + 1 < distance]

        dfs(root)
        return self.count`,
    jsCode: `var countPairs = function(root, distance) {
    let count = 0;
    const dfs = (node) => {
        if (!node) return [];
        if (!node.left && !node.right) return [1];
        const left = dfs(node.left);
        const right = dfs(node.right);
        for (const l of left) {
            for (const r of right) {
                if (l + r <= distance) count++;
            }
        }
        return [...left, ...right].filter(d => d + 1 < distance).map(d => d + 1);
    };
    dfs(root);
    return count;
};`,
    explanation:
      '1. DFS returns a list of distances from the current node to its leaf descendants.\n' +
      '2. A leaf returns [1] (distance 1 from its parent).\n' +
      '3. At each node, check all (left_leaf, right_leaf) pairs. If sum <= distance, it is a good pair.\n' +
      '4. Return updated distances (each incremented by 1) for the parent to use.\n' +
      '5. Prune distances >= distance to keep lists small.',
    timeComplexity: 'O(n * d^2) where d is the distance',
    spaceComplexity: 'O(n)',
    hints: [
      'Post-order DFS can collect distances from each node to all its leaf descendants.',
      'At each internal node, pair up leaves from left and right subtrees.',
      'Prune distances that already exceed the distance limit.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1535. Find the Winner of an Array Game
  // ---------------------------------------------------------------------------
  {
    id: 1535,
    description:
      'Given an integer array arr and an integer k. Two players play: compare arr[0] and arr[1], the larger stays at index 0 and the smaller goes to the end. The first element to win k consecutive rounds wins. Return the winning integer.',
    examples:
      'Input: arr = [2,1,3,5,4,6,7], k = 2\nOutput: 5',
    approach:
      'Simulate the game. Track the current winner and consecutive wins. If k >= n-1, the maximum element wins. Otherwise, simulate until someone wins k consecutive rounds.',
    code: `class Solution:
    def getWinner(self, arr: list[int], k: int) -> int:
        current = arr[0]
        wins = 0
        for i in range(1, len(arr)):
            if arr[i] > current:
                current = arr[i]
                wins = 1
            else:
                wins += 1
            if wins == k:
                return current
        return current`,
    jsCode: `var getWinner = function(arr, k) {
    let current = arr[0];
    let wins = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > current) {
            current = arr[i];
            wins = 1;
        } else {
            wins++;
        }
        if (wins === k) return current;
    }
    return current;
};`,
    explanation:
      '1. Start with the first element as the current winner.\n' +
      '2. Compare with each subsequent element.\n' +
      '3. If the new element is larger, it becomes the winner with 1 win.\n' +
      '4. Otherwise, the current winner gains another consecutive win.\n' +
      '5. If wins reach k, return the winner. After one pass, the max element wins all remaining rounds.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'After one complete pass, the maximum element will be at position 0.',
      'If k >= n-1, the maximum element always wins.',
      'Simulate comparisons; the winner is determined in at most n-1 steps.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1539. Kth Missing Positive Number
  // ---------------------------------------------------------------------------
  {
    id: 1539,
    description:
      'Given an array arr of positive integers sorted in strictly increasing order, and an integer k. Return the k-th positive integer that is missing from this array.',
    examples:
      'Input: arr = [2,3,4,7,11], k = 5\nOutput: 9\nExplanation: Missing numbers are [1,5,6,8,9,10,...]. The 5th is 9.',
    approach:
      'Binary search. At index i, the number of missing positives before arr[i] is arr[i] - (i + 1). Find the first index where this count >= k.',
    code: `class Solution:
    def findKthPositive(self, arr: list[int], k: int) -> int:
        lo, hi = 0, len(arr)
        while lo < hi:
            mid = (lo + hi) // 2
            if arr[mid] - (mid + 1) >= k:
                hi = mid
            else:
                lo = mid + 1
        return lo + k`,
    jsCode: `var findKthPositive = function(arr, k) {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] - (mid + 1) >= k) hi = mid;
        else lo = mid + 1;
    }
    return lo + k;
};`,
    explanation:
      '1. At index i, missing count = arr[i] - (i + 1) (expected value minus actual).\n' +
      '2. Binary search for the first index where missing count >= k.\n' +
      '3. If lo is the insertion point, the answer is lo + k.\n' +
      '4. This works because the k-th missing number is at position lo + k in the positive integers.\n' +
      '5. Binary search runs in O(log n).',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'At index i, arr[i] - (i+1) missing numbers exist before arr[i].',
      'Binary search for the point where missing count first reaches k.',
      'The answer is lo + k.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1541. Minimum Insertions to Balance a Parentheses String
  // ---------------------------------------------------------------------------
  {
    id: 1541,
    description:
      'Given a parentheses string s containing only "(" and ")". A balanced string requires every "(" to be followed by "))". Return the minimum number of insertions to make s balanced.',
    examples:
      'Input: s = "(()))"\nOutput: 1\nExplanation: Insert one "(" before the last "))" to get "(())()"... actually the rule is each ( needs )).',
    approach:
      'Track open count. For each "(", increment open. For each ")" check if the next char is also ")" (consume both) or insert one. Then match with an open paren or insert one.',
    code: `class Solution:
    def minInsertions(self, s: str) -> int:
        opens = 0
        insertions = 0
        i = 0
        while i < len(s):
            if s[i] == '(':
                opens += 1
                i += 1
            else:
                if i + 1 < len(s) and s[i + 1] == ')':
                    i += 2
                else:
                    insertions += 1
                    i += 1
                if opens > 0:
                    opens -= 1
                else:
                    insertions += 1
        insertions += opens * 2
        return insertions`,
    jsCode: `var minInsertions = function(s) {
    let opens = 0, insertions = 0, i = 0;
    while (i < s.length) {
        if (s[i] === '(') {
            opens++;
            i++;
        } else {
            if (i + 1 < s.length && s[i + 1] === ')') {
                i += 2;
            } else {
                insertions++;
                i++;
            }
            if (opens > 0) opens--;
            else insertions++;
        }
    }
    insertions += opens * 2;
    return insertions;
};`,
    explanation:
      '1. Track open parentheses count and needed insertions.\n' +
      '2. For "(", increment opens.\n' +
      '3. For ")", check if the next char is also ")". If not, insert one (increment insertions).\n' +
      '4. Then match the ")) " with an open "(". If no open, insert one.\n' +
      '5. At the end, each remaining open needs 2 closing parens inserted.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Each "(" needs exactly "))" to match.',
      'When you see ")", check if the next character is also ")" to form a pair.',
      'Track unmatched opens; at the end, each needs 2 insertions.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1544. Make The String Great
  // ---------------------------------------------------------------------------
  {
    id: 1544,
    description:
      'Given a string s of lower and upper case English letters. Make the string great by removing adjacent characters that are the same letter but different cases (e.g., "aA" or "Aa"). Return the string after making it great. An empty string is also great.',
    examples:
      'Input: s = "leEeetcode"\nOutput: "leetcode"',
    approach:
      'Use a stack. For each character, if it forms a bad pair with the stack top (same letter, different case), pop the stack. Otherwise push the character.',
    code: `class Solution:
    def makeGood(self, s: str) -> str:
        stack = []
        for c in s:
            if stack and stack[-1] != c and stack[-1].lower() == c.lower():
                stack.pop()
            else:
                stack.append(c)
        return ''.join(stack)`,
    jsCode: `var makeGood = function(s) {
    const stack = [];
    for (const c of s) {
        if (stack.length && stack[stack.length - 1] !== c && stack[stack.length - 1].toLowerCase() === c.toLowerCase()) {
            stack.pop();
        } else {
            stack.push(c);
        }
    }
    return stack.join('');
};`,
    explanation:
      '1. Iterate through each character in the string.\n' +
      '2. Check if the current character and stack top are the same letter but different case.\n' +
      '3. Same letter, different case means: stack[-1].lower() == c.lower() and stack[-1] != c.\n' +
      '4. If so, pop the stack (remove the bad pair). Otherwise, push the character.\n' +
      '5. Join the stack and return.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a stack to process characters left to right.',
      'A bad pair is two adjacent characters that are the same letter but different cases.',
      'Pop on a bad pair, push otherwise.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1545. Find Kth Bit in Nth Binary String
  // ---------------------------------------------------------------------------
  {
    id: 1545,
    description:
      'Given two positive integers n and k. The binary string Sn is formed as follows: S1 = "0", Si = Si-1 + "1" + reverse(invert(Si-1)). Return the k-th bit (1-indexed) in Sn.',
    examples:
      'Input: n = 3, k = 1\nOutput: "0"\nExplanation: S3 = "0111001".',
    approach:
      'Use recursion. The length of Sn is 2^n - 1. The middle bit is always "1". If k is in the first half, recurse on Sn-1. If k is in the second half, find the mirrored position and invert.',
    code: `class Solution:
    def findKthBit(self, n: int, k: int) -> str:
        if n == 1:
            return '0'
        length = (1 << n) - 1
        mid = length // 2 + 1
        if k == mid:
            return '1'
        elif k < mid:
            return self.findKthBit(n - 1, k)
        else:
            mirrored = length - k + 1
            bit = self.findKthBit(n - 1, mirrored)
            return '1' if bit == '0' else '0'`,
    jsCode: `var findKthBit = function(n, k) {
    if (n === 1) return '0';
    const length = (1 << n) - 1;
    const mid = Math.floor(length / 2) + 1;
    if (k === mid) return '1';
    if (k < mid) return findKthBit(n - 1, k);
    const mirrored = length - k + 1;
    const bit = findKthBit(n - 1, mirrored);
    return bit === '0' ? '1' : '0';
};`,
    explanation:
      '1. Sn has length 2^n - 1. The middle position is at index (length // 2 + 1).\n' +
      '2. The middle bit is always "1".\n' +
      '3. If k < mid, the k-th bit is the same as in Sn-1.\n' +
      '4. If k > mid, the k-th bit corresponds to the mirrored position in Sn-1, inverted.\n' +
      '5. Recurse until reaching the base case S1 = "0".',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) recursion stack',
    hints: [
      'The string has a recursive structure: first half, middle "1", reversed inverted first half.',
      'Use the middle position to determine which half k falls in.',
      'For the second half, find the mirrored position and invert the result.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1547. Minimum Cost to Cut a Stick
  // ---------------------------------------------------------------------------
  {
    id: 1547,
    description:
      'Given a wooden stick of length n and an array of cuts positions. The cost of a cut is the length of the stick being cut. Return the minimum total cost of all cuts. You can change the order of cuts.',
    examples:
      'Input: n = 7, cuts = [1,3,4,5]\nOutput: 16',
    approach:
      'Add 0 and n to the cuts array and sort. Use interval DP where dp[i][j] = minimum cost to make all cuts between cuts[i] and cuts[j]. The cost of a cut is cuts[j] - cuts[i] plus the cost of the two resulting segments.',
    code: `class Solution:
    def minCost(self, n: int, cuts: list[int]) -> int:
        cuts = sorted([0] + cuts + [n])
        m = len(cuts)
        dp = [[0] * m for _ in range(m)]
        for length in range(2, m):
            for i in range(m - length):
                j = i + length
                dp[i][j] = float('inf')
                for k in range(i + 1, j):
                    dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j] + cuts[j] - cuts[i])
        return dp[0][m - 1]`,
    jsCode: `var minCost = function(n, cuts) {
    cuts = [0, ...cuts, n].sort((a, b) => a - b);
    const m = cuts.length;
    const dp = Array.from({length: m}, () => new Array(m).fill(0));
    for (let length = 2; length < m; length++) {
        for (let i = 0; i + length < m; i++) {
            const j = i + length;
            dp[i][j] = Infinity;
            for (let k = i + 1; k < j; k++) {
                dp[i][j] = Math.min(dp[i][j], dp[i][k] + dp[k][j] + cuts[j] - cuts[i]);
            }
        }
    }
    return dp[0][m - 1];
};`,
    explanation:
      '1. Add endpoints 0 and n to cuts and sort them.\n' +
      '2. dp[i][j] = min cost to perform all cuts between cuts[i] and cuts[j].\n' +
      '3. For each interval [i, j], try each cut position k between i and j.\n' +
      '4. Cost of cutting at k = (cuts[j] - cuts[i]) + dp[i][k] + dp[k][j].\n' +
      '5. Take the minimum over all k.',
    timeComplexity: 'O(m^3) where m is the number of cuts',
    spaceComplexity: 'O(m^2)',
    hints: [
      'Add 0 and n as boundaries. Sort the cuts.',
      'Use interval DP: dp[i][j] is the minimum cost for the segment from cuts[i] to cuts[j].',
      'Try each intermediate cut point and take the minimum.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1552. Magnetic Force Between Two Balls
  // ---------------------------------------------------------------------------
  {
    id: 1552,
    description:
      'In the universe, n positions are available. You want to place m balls such that the minimum distance between any two balls is maximized. Return the maximum possible minimum distance.',
    examples:
      'Input: position = [1,2,3,4,7], m = 3\nOutput: 3\nExplanation: Place balls at positions 1, 4, 7. Minimum distance is 3.',
    approach:
      'Binary search on the answer (minimum distance). For each candidate distance, check if m balls can be placed greedily with at least that distance apart.',
    code: `class Solution:
    def maxDistance(self, position: list[int], m: int) -> int:
        position.sort()
        def canPlace(min_dist):
            count = 1
            last = position[0]
            for i in range(1, len(position)):
                if position[i] - last >= min_dist:
                    count += 1
                    last = position[i]
                    if count == m:
                        return True
            return False
        lo, hi = 1, (position[-1] - position[0]) // (m - 1)
        while lo <= hi:
            mid = (lo + hi) // 2
            if canPlace(mid):
                lo = mid + 1
            else:
                hi = mid - 1
        return hi`,
    jsCode: `var maxDistance = function(position, m) {
    position.sort((a, b) => a - b);
    const canPlace = (minDist) => {
        let count = 1, last = position[0];
        for (let i = 1; i < position.length; i++) {
            if (position[i] - last >= minDist) {
                count++;
                last = position[i];
                if (count === m) return true;
            }
        }
        return false;
    };
    let lo = 1, hi = Math.floor((position[position.length - 1] - position[0]) / (m - 1));
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (canPlace(mid)) lo = mid + 1;
        else hi = mid - 1;
    }
    return hi;
};`,
    explanation:
      '1. Sort positions.\n' +
      '2. Binary search on the minimum distance d from 1 to max possible.\n' +
      '3. For each d, greedily place balls: start at position[0], place next ball at the first position >= last + d.\n' +
      '4. If we can place m balls, try a larger d.\n' +
      '5. If not, try a smaller d. Return the largest valid d.',
    timeComplexity: 'O(n log(max_pos / m))',
    spaceComplexity: 'O(1)',
    hints: [
      'Binary search on the answer: the minimum distance between balls.',
      'For a given minimum distance, greedily check if m balls can be placed.',
      'Always place the first ball at the smallest position.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1557. Minimum Number of Vertices to Reach All Nodes
  // ---------------------------------------------------------------------------
  {
    id: 1557,
    description:
      'Given a directed acyclic graph with n vertices and a list of edges, find the smallest set of vertices from which all nodes in the graph are reachable. It is guaranteed that a unique solution exists.',
    examples:
      'Input: n = 6, edges = [[0,1],[0,2],[2,5],[3,4],[4,2]]\nOutput: [0,3]',
    approach:
      'A node that has no incoming edges must be in the result set, because no other node can reach it. Nodes with incoming edges can be reached from some other node. Return all nodes with in-degree 0.',
    code: `class Solution:
    def findSmallestSetOfVertices(self, n: int, edges: list[list[int]]) -> list[int]:
        has_incoming = set()
        for _, v in edges:
            has_incoming.add(v)
        return [i for i in range(n) if i not in has_incoming]`,
    jsCode: `var findSmallestSetOfVertices = function(n, edges) {
    const hasIncoming = new Set();
    for (const [, v] of edges) hasIncoming.add(v);
    const result = [];
    for (let i = 0; i < n; i++) if (!hasIncoming.has(i)) result.push(i);
    return result;
};`,
    explanation:
      '1. Collect all nodes that have at least one incoming edge.\n' +
      '2. Nodes not in this set have in-degree 0.\n' +
      '3. These nodes cannot be reached from any other node, so they must be starting points.\n' +
      '4. All other nodes can be reached from these starting nodes (since the graph is a DAG).\n' +
      '5. Return the list of nodes with in-degree 0.',
    timeComplexity: 'O(n + E)',
    spaceComplexity: 'O(n)',
    hints: [
      'Which nodes can never be reached from another node?',
      'Nodes with no incoming edges must be included.',
      'In a DAG, all other nodes are reachable from nodes with in-degree 0.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1559. Detect Cycles in 2D Grid
  // ---------------------------------------------------------------------------
  {
    id: 1559,
    description:
      'Given a 2D array of characters grid, return true if there exists a cycle consisting of the same value in grid. A cycle is a path of length 4 or more that starts and ends at the same cell, moving only to adjacent cells with the same value.',
    examples:
      'Input: grid = [["a","a","a","a"],["a","b","b","a"],["a","b","b","a"],["a","a","a","a"]]\nOutput: true',
    approach:
      'Use DFS or Union-Find. With Union-Find, iterate through each cell and its right/down neighbor. If they have the same value and are already in the same component, a cycle exists.',
    code: `class Solution:
    def containsCycle(self, grid: list[list[str]]) -> bool:
        m, n = len(grid), len(grid[0])
        parent = list(range(m * n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for i in range(m):
            for j in range(n):
                if i + 1 < m and grid[i][j] == grid[i + 1][j]:
                    a, b = find(i * n + j), find((i + 1) * n + j)
                    if a == b:
                        return True
                    parent[a] = b
                if j + 1 < n and grid[i][j] == grid[i][j + 1]:
                    a, b = find(i * n + j), find(i * n + j + 1)
                    if a == b:
                        return True
                    parent[a] = b
        return False`,
    jsCode: `var containsCycle = function(grid) {
    const m = grid.length, n = grid[0].length;
    const parent = Array.from({length: m * n}, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (i + 1 < m && grid[i][j] === grid[i + 1][j]) {
                const a = find(i * n + j), b = find((i + 1) * n + j);
                if (a === b) return true;
                parent[a] = b;
            }
            if (j + 1 < n && grid[i][j] === grid[i][j + 1]) {
                const a = find(i * n + j), b = find(i * n + j + 1);
                if (a === b) return true;
                parent[a] = b;
            }
        }
    }
    return false;
};`,
    explanation:
      '1. Use Union-Find with each cell as a node.\n' +
      '2. Iterate through each cell, checking right and down neighbors.\n' +
      '3. If the neighbor has the same character, try to union them.\n' +
      '4. If they are already in the same component before union, a cycle exists.\n' +
      '5. Return True immediately if a cycle is detected.',
    timeComplexity: 'O(m * n * alpha(m * n))',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Union-Find can detect cycles: if two connected cells are already in the same component, there is a cycle.',
      'Only check right and down neighbors to avoid double-counting edges.',
      'Only union cells with the same character value.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1561. Maximum Number of Coins You Can Get
  // ---------------------------------------------------------------------------
  {
    id: 1561,
    description:
      'There are 3n piles of coins. In each round, you pick any 3 piles. Alice gets the max pile, you get the second largest, and Bob gets the smallest. Return the maximum number of coins you can get.',
    examples:
      'Input: piles = [2,4,1,2,7,8]\nOutput: 9\nExplanation: Pick (2,7,8) -> you get 7. Pick (1,2,4) -> you get 2. Total = 9.',
    approach:
      'Sort the piles. To maximize your coins, pair each of the largest piles with the smallest piles for Bob. You always get the second-largest in each triple. Take every other pile from the top, skipping Alice\'s.',
    code: `class Solution:
    def maxCoins(self, piles: list[int]) -> int:
        piles.sort()
        n = len(piles) // 3
        result = 0
        for i in range(n):
            result += piles[len(piles) - 2 - 2 * i]
        return result`,
    jsCode: `var maxCoins = function(piles) {
    piles.sort((a, b) => a - b);
    const n = Math.floor(piles.length / 3);
    let result = 0;
    for (let i = 0; i < n; i++) result += piles[piles.length - 2 - 2 * i];
    return result;
};`,
    explanation:
      '1. Sort piles in ascending order.\n' +
      '2. There are n = len(piles)//3 rounds.\n' +
      '3. Alice takes the largest, you take the second largest, Bob takes from the smallest.\n' +
      '4. After sorting, pick every second pile from the top: indices [-2, -4, -6, ...].\n' +
      '5. This gives you the maximum possible second-largest values.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sort the piles. You want to maximize your second-place picks.',
      'Give Bob the smallest piles. Pair each of your picks with the largest pile for Alice.',
      'Pick every other pile from the sorted end.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1564. Put Boxes Into the Warehouse I
  // ---------------------------------------------------------------------------
  {
    id: 1564,
    description:
      'You have n boxes with given heights and a warehouse with rooms of given heights from left to right. Boxes enter from the left. A box can only pass through rooms with height >= the box height. You cannot rearrange rooms, but you can choose the order of boxes. Return the maximum number of boxes you can put into the warehouse.',
    examples:
      'Input: boxes = [4,3,4,1], warehouse = [5,3,3,4,1]\nOutput: 3',
    approach:
      'Preprocess warehouse heights: each room\'s effective height is the minimum of all heights from the entrance to that room. Sort boxes in ascending order. Greedily place the smallest available box in the farthest room it can fit.',
    code: `class Solution:
    def maxBoxesInWarehouse(self, boxes: list[int], warehouse: list[int]) -> int:
        # Preprocess: effective height at each position
        for i in range(1, len(warehouse)):
            warehouse[i] = min(warehouse[i], warehouse[i - 1])
        boxes.sort()
        count = 0
        j = len(warehouse) - 1
        for box in boxes:
            while j >= 0 and warehouse[j] < box:
                j -= 1
            if j >= 0:
                count += 1
                j -= 1
        return count`,
    jsCode: `var maxBoxesInWarehouse = function(boxes, warehouse) {
    for (let i = 1; i < warehouse.length; i++) {
        warehouse[i] = Math.min(warehouse[i], warehouse[i - 1]);
    }
    boxes.sort((a, b) => a - b);
    let count = 0, j = warehouse.length - 1;
    for (const box of boxes) {
        while (j >= 0 && warehouse[j] < box) j--;
        if (j >= 0) { count++; j--; }
    }
    return count;
};`,
    explanation:
      '1. Preprocess warehouse: effective height at room i = min(warehouse[0..i]).\n' +
      '2. Sort boxes in ascending order (smallest first).\n' +
      '3. Try to place each box starting from the farthest room.\n' +
      '4. If the room is too short, move to the next room closer to the entrance.\n' +
      '5. Count how many boxes are successfully placed.',
    timeComplexity: 'O(n log n + m) where n = boxes, m = warehouse rooms',
    spaceComplexity: 'O(1)',
    hints: [
      'Preprocess warehouse heights to account for the bottleneck from the entrance.',
      'Sort boxes smallest first to maximize placements.',
      'Greedily place small boxes in the deepest available rooms.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1568. Minimum Number of Days to Disconnect Island
  // ---------------------------------------------------------------------------
  {
    id: 1568,
    description:
      'Given a 2D grid of 0s and 1s, an island is a maximal group of connected 1s (4-directional). The grid is connected if there is exactly one island. Return the minimum number of days to disconnect the grid (make it have 0 or more than 1 island). You can change any 1 to a 0.',
    examples:
      'Input: grid = [[0,1,1,0],[0,1,1,0],[0,0,0,0]]\nOutput: 2',
    approach:
      'The answer is always 0, 1, or 2. Check if already disconnected (0). Try removing each land cell and check if it disconnects (1). Otherwise the answer is 2 (you can always disconnect by removing two corner cells of the island).',
    code: `class Solution:
    def minDays(self, grid: list[list[int]]) -> int:
        def count_islands(g):
            m, n = len(g), len(g[0])
            visited = [[False] * n for _ in range(m)]
            count = 0
            def dfs(r, c):
                if r < 0 or r >= m or c < 0 or c >= n or visited[r][c] or g[r][c] == 0:
                    return
                visited[r][c] = True
                for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                    dfs(r+dr, c+dc)
            for i in range(m):
                for j in range(n):
                    if g[i][j] == 1 and not visited[i][j]:
                        dfs(i, j)
                        count += 1
            return count

        import sys
        sys.setrecursionlimit(10000)

        if count_islands(grid) != 1:
            return 0

        m, n = len(grid), len(grid[0])
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 1:
                    grid[i][j] = 0
                    if count_islands(grid) != 1:
                        return 1
                    grid[i][j] = 1
        return 2`,
    jsCode: `var minDays = function(grid) {
    const m = grid.length, n = grid[0].length;
    const countIslands = (g) => {
        const visited = Array.from({length: m}, () => new Array(n).fill(false));
        let count = 0;
        const dfs = (r, c) => {
            if (r < 0 || r >= m || c < 0 || c >= n || visited[r][c] || g[r][c] === 0) return;
            visited[r][c] = true;
            dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);
        };
        for (let i = 0; i < m; i++)
            for (let j = 0; j < n; j++)
                if (g[i][j] === 1 && !visited[i][j]) { dfs(i, j); count++; }
        return count;
    };
    if (countIslands(grid) !== 1) return 0;
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (grid[i][j] === 1) {
                grid[i][j] = 0;
                if (countIslands(grid) !== 1) return 1;
                grid[i][j] = 1;
            }
        }
    }
    return 2;
};`,
    explanation:
      '1. Count islands. If already != 1, return 0.\n' +
      '2. Try removing each land cell one at a time.\n' +
      '3. If removing any single cell disconnects the grid, return 1.\n' +
      '4. Otherwise, the answer is always 2.\n' +
      '5. Any island can be disconnected by removing 2 cells from a corner.',
    timeComplexity: 'O((m*n)^2)',
    spaceComplexity: 'O(m*n)',
    hints: [
      'The answer is always 0, 1, or 2.',
      'Check if already disconnected, then check if removing one cell works.',
      'Any connected island can always be disconnected by removing at most 2 cells.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1569. Number of Ways to Reorder Array to Get Same BST
  // ---------------------------------------------------------------------------
  {
    id: 1569,
    description:
      'Given an array nums representing a permutation of integers from 1 to n. A BST is built by inserting elements in the given order. Return the number of different permutations of nums that produce the same BST, modulo 10^9 + 7.',
    examples:
      'Input: nums = [2,1,3]\nOutput: 1\nExplanation: [2,3,1] also gives the same BST. There is 1 other way.',
    approach:
      'The root is fixed as nums[0]. Elements smaller go to the left subtree, larger to the right. The number of ways to interleave left and right subsequences (preserving internal order) is C(left+right, left). Multiply by recursive counts for left and right subtrees.',
    code: `from math import comb

class Solution:
    def numOfWays(self, nums: list[int]) -> int:
        MOD = 10**9 + 7

        def solve(arr):
            if len(arr) <= 2:
                return 1
            root = arr[0]
            left = [x for x in arr if x < root]
            right = [x for x in arr if x > root]
            return comb(len(left) + len(right), len(left)) * solve(left) % MOD * solve(right) % MOD

        return (solve(nums) - 1) % MOD`,
    jsCode: `var numOfWays = function(nums) {
    const MOD = 1000000007n;
    const maxN = nums.length;
    const C = Array.from({length: maxN}, () => new Array(maxN).fill(0n));
    for (let i = 0; i < maxN; i++) {
        C[i][0] = 1n;
        for (let j = 1; j <= i; j++) C[i][j] = (C[i-1][j-1] + C[i-1][j]) % MOD;
    }
    const solve = (arr) => {
        if (arr.length <= 2) return 1n;
        const root = arr[0];
        const left = arr.filter(x => x < root);
        const right = arr.filter(x => x > root);
        return C[left.length + right.length][left.length] * solve(left) % MOD * solve(right) % MOD;
    };
    return Number((solve(nums) - 1n + MOD) % MOD);
};`,
    explanation:
      '1. The first element is always the root and is fixed.\n' +
      '2. Separate remaining elements into left (< root) and right (> root) subtrees.\n' +
      '3. We can interleave left and right elements in C(|left|+|right|, |left|) ways.\n' +
      '4. Recursively compute the count for left and right subtrees.\n' +
      '5. Subtract 1 from the final result (exclude the original permutation).',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'The root is always the first element. It splits the rest into left and right subtrees.',
      'Count ways to interleave two sequences while preserving their internal order.',
      'The interleaving count is the binomial coefficient C(|left|+|right|, |left|).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1575. Count All Possible Routes
  // ---------------------------------------------------------------------------
  {
    id: 1575,
    description:
      'You are given an array of distinct integers locations and integers start, finish, and fuel. Count all possible routes from locations[start] to locations[finish] using at most fuel. Moving from i to j costs |locations[i] - locations[j]| fuel. You can visit any city multiple times.',
    examples:
      'Input: locations = [2,3,6,8,4], start = 1, finish = 3, fuel = 5\nOutput: 4',
    approach:
      'Use DP with memoization. dp(city, remaining_fuel) = number of routes from city to finish with remaining_fuel. From each city, try moving to every other city if fuel permits.',
    code: `from functools import lru_cache

class Solution:
    def countRoutes(self, locations: list[int], start: int, finish: int, fuel: int) -> int:
        MOD = 10**9 + 7
        n = len(locations)

        @lru_cache(maxsize=None)
        def dp(city, fuel_left):
            if fuel_left < 0:
                return 0
            count = 1 if city == finish else 0
            for nxt in range(n):
                if nxt != city:
                    cost = abs(locations[city] - locations[nxt])
                    if cost <= fuel_left:
                        count = (count + dp(nxt, fuel_left - cost)) % MOD
            return count

        return dp(start, fuel)`,
    jsCode: `var countRoutes = function(locations, start, finish, fuel) {
    const MOD = 1000000007;
    const n = locations.length;
    const memo = new Map();
    const dp = (city, fuelLeft) => {
        if (fuelLeft < 0) return 0;
        const key = city * (fuel + 1) + fuelLeft;
        if (memo.has(key)) return memo.get(key);
        let count = city === finish ? 1 : 0;
        for (let nxt = 0; nxt < n; nxt++) {
            if (nxt !== city) {
                const cost = Math.abs(locations[city] - locations[nxt]);
                if (cost <= fuelLeft) count = (count + dp(nxt, fuelLeft - cost)) % MOD;
            }
        }
        memo.set(key, count);
        return count;
    };
    return dp(start, fuel);
};`,
    explanation:
      '1. dp(city, fuel_left) = number of routes from city to finish with fuel_left remaining.\n' +
      '2. If city == finish, count this as one valid route (but continue exploring).\n' +
      '3. For each other city, if fuel permits the move, add dp(next_city, fuel_left - cost).\n' +
      '4. Memoize to avoid recomputation.\n' +
      '5. Return dp(start, fuel).',
    timeComplexity: 'O(n^2 * fuel)',
    spaceComplexity: 'O(n * fuel)',
    hints: [
      'Use memoized DFS with state (current city, remaining fuel).',
      'Each city reached that is the finish adds to the count (even if fuel remains).',
      'Try all possible next cities from each state.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1578. Minimum Time to Make Rope Colorful
  // ---------------------------------------------------------------------------
  {
    id: 1578,
    description:
      'Alice has n balloons arranged on a rope in order. Each balloon has a color and a time cost to remove it. She wants no two consecutive balloons to have the same color. Return the minimum total time to remove balloons to achieve this.',
    examples:
      'Input: colors = "abaac", neededTime = [1,2,3,4,5]\nOutput: 3\nExplanation: Remove balloon 0 (time 1) and balloon 2 (time 3) - wait, we remove minimum cost from consecutive same-colored groups.',
    approach:
      'For each group of consecutive same-colored balloons, keep the one with the highest removal time and remove all others. The cost is the sum of the group minus the maximum.',
    code: `class Solution:
    def minCost(self, colors: str, neededTime: list[int]) -> int:
        total = 0
        i = 0
        while i < len(colors):
            j = i
            group_sum = 0
            group_max = 0
            while j < len(colors) and colors[j] == colors[i]:
                group_sum += neededTime[j]
                group_max = max(group_max, neededTime[j])
                j += 1
            total += group_sum - group_max
            i = j
        return total`,
    jsCode: `var minCost = function(colors, neededTime) {
    let total = 0, i = 0;
    while (i < colors.length) {
        let j = i, groupSum = 0, groupMax = 0;
        while (j < colors.length && colors[j] === colors[i]) {
            groupSum += neededTime[j];
            groupMax = Math.max(groupMax, neededTime[j]);
            j++;
        }
        total += groupSum - groupMax;
        i = j;
    }
    return total;
};`,
    explanation:
      '1. Iterate through the string, grouping consecutive same-colored balloons.\n' +
      '2. For each group, compute the sum and max of removal times.\n' +
      '3. Keep the balloon with the highest time (to minimize removal cost).\n' +
      '4. Remove all others: cost = group_sum - group_max.\n' +
      '5. Sum costs across all groups.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Group consecutive same-colored balloons together.',
      'In each group, keep the most expensive balloon and remove the rest.',
      'Cost for each group = total time - maximum time.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1588. Sum of All Odd Length Subarrays
  // ---------------------------------------------------------------------------
  {
    id: 1588,
    description:
      'Given an array of positive integers arr, return the sum of all possible odd-length subarrays. A subarray is a contiguous subsequence of the array.',
    examples:
      'Input: arr = [1,4,2,5,3]\nOutput: 58',
    approach:
      'For each element arr[i], count how many odd-length subarrays include it. An element at index i appears in subarrays starting at index l (0..i) and ending at index r (i..n-1). Count those with odd length and multiply by arr[i].',
    code: `class Solution:
    def sumOddLengthSubarrays(self, arr: list[int]) -> int:
        n = len(arr)
        total = 0
        for i in range(n):
            left = i + 1
            right = n - i
            total_sub = left * right
            odd_count = (total_sub + 1) // 2
            total += odd_count * arr[i]
        return total`,
    jsCode: `var sumOddLengthSubarrays = function(arr) {
    const n = arr.length;
    let total = 0;
    for (let i = 0; i < n; i++) {
        const left = i + 1, right = n - i;
        const totalSub = left * right;
        const oddCount = Math.floor((totalSub + 1) / 2);
        total += oddCount * arr[i];
    }
    return total;
};`,
    explanation:
      '1. For index i, there are (i+1) choices for the start and (n-i) choices for the end.\n' +
      '2. Total subarrays containing arr[i] = left * right.\n' +
      '3. Of these, roughly half have odd length: odd_count = (total_sub + 1) // 2.\n' +
      '4. arr[i] contributes odd_count * arr[i] to the total sum.\n' +
      '5. Sum contributions across all indices.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Count how many odd-length subarrays each element belongs to.',
      'Element at index i is in (i+1) * (n-i) total subarrays.',
      'About half of those subarrays have odd length.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1593. Split a String Into the Max Number of Unique Substrings
  // ---------------------------------------------------------------------------
  {
    id: 1593,
    description:
      'Given a string s, return the maximum number of unique substrings that the given string can be split into. Every character must belong to exactly one substring.',
    examples:
      'Input: s = "ababccc"\nOutput: 5\nExplanation: One way: ["a","b","ab","c","cc"].',
    approach:
      'Use backtracking. Try all possible prefixes at each position. If the prefix is not in the used set, add it and recurse. Track the maximum number of splits.',
    code: `class Solution:
    def maxUniqueSplit(self, s: str) -> int:
        self.best = 0
        def backtrack(start, used):
            if start == len(s):
                self.best = max(self.best, len(used))
                return
            if len(used) + (len(s) - start) <= self.best:
                return
            for end in range(start + 1, len(s) + 1):
                sub = s[start:end]
                if sub not in used:
                    used.add(sub)
                    backtrack(end, used)
                    used.remove(sub)
        backtrack(0, set())
        return self.best`,
    jsCode: `var maxUniqueSplit = function(s) {
    let best = 0;
    const backtrack = (start, used) => {
        if (start === s.length) {
            best = Math.max(best, used.size);
            return;
        }
        if (used.size + (s.length - start) <= best) return;
        for (let end = start + 1; end <= s.length; end++) {
            const sub = s.substring(start, end);
            if (!used.has(sub)) {
                used.add(sub);
                backtrack(end, used);
                used.delete(sub);
            }
        }
    };
    backtrack(0, new Set());
    return best;
};`,
    explanation:
      '1. Backtrack from position start with a set of used substrings.\n' +
      '2. Try each prefix s[start:end] as the next substring.\n' +
      '3. If not already used, add it and recurse from position end.\n' +
      '4. Prune: if remaining characters + current count cannot beat best, stop.\n' +
      '5. Update best when reaching the end of the string.',
    timeComplexity: 'O(2^n) in the worst case',
    spaceComplexity: 'O(n)',
    hints: [
      'Use backtracking to try all possible splits.',
      'Track used substrings in a set.',
      'Prune branches where the maximum possible result cannot exceed the current best.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1598. Crawler Log Folder
  // ---------------------------------------------------------------------------
  {
    id: 1598,
    description:
      'The Leetcode file system starts at the main folder. You are given a list of operations: "../" moves to the parent folder, "./" stays, and "x/" moves to child folder x. Return the minimum number of operations to go back to the main folder after performing all operations.',
    examples:
      'Input: logs = ["d1/","d2/","../","d21/","./"]  \nOutput: 2',
    approach:
      'Track the current depth. "../" decreases depth (minimum 0), "./" keeps it the same, and anything else increases it. The final depth is the answer.',
    code: `class Solution:
    def minOperations(self, logs: list[str]) -> int:
        depth = 0
        for log in logs:
            if log == '../':
                depth = max(0, depth - 1)
            elif log == './':
                pass
            else:
                depth += 1
        return depth`,
    jsCode: `var minOperations = function(logs) {
    let depth = 0;
    for (const log of logs) {
        if (log === '../') depth = Math.max(0, depth - 1);
        else if (log === './') {}
        else depth++;
    }
    return depth;
};`,
    explanation:
      '1. Start at depth 0 (main folder).\n' +
      '2. For "../", go up one level (depth - 1), but not below 0.\n' +
      '3. For "./", stay at the current level.\n' +
      '4. For any other operation, go one level deeper.\n' +
      '5. The final depth is the number of operations needed to return to main.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Track the current folder depth.',
      '"../" goes up, "./" stays, anything else goes down.',
      'The final depth is the minimum number of operations to return to main.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1605. Find Valid Matrix Given Row and Column Sums
  // ---------------------------------------------------------------------------
  {
    id: 1605,
    description:
      'You are given two arrays rowSum and colSum. Find any matrix of non-negative integers of size rowSum.length x colSum.length such that each row sums to rowSum[i] and each column sums to colSum[j].',
    examples:
      'Input: rowSum = [3,8], colSum = [4,7]\nOutput: [[3,0],[1,7]]',
    approach:
      'Greedy approach. For each cell (i, j), place the minimum of the remaining row sum and column sum. Subtract from both. This guarantees non-negative values and correct sums.',
    code: `class Solution:
    def restoreMatrix(self, rowSum: list[int], colSum: list[int]) -> list[list[int]]:
        m, n = len(rowSum), len(colSum)
        matrix = [[0] * n for _ in range(m)]
        for i in range(m):
            for j in range(n):
                val = min(rowSum[i], colSum[j])
                matrix[i][j] = val
                rowSum[i] -= val
                colSum[j] -= val
        return matrix`,
    jsCode: `var restoreMatrix = function(rowSum, colSum) {
    const m = rowSum.length, n = colSum.length;
    const matrix = Array.from({length: m}, () => new Array(n).fill(0));
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const val = Math.min(rowSum[i], colSum[j]);
            matrix[i][j] = val;
            rowSum[i] -= val;
            colSum[j] -= val;
        }
    }
    return matrix;
};`,
    explanation:
      '1. For each cell (i, j), assign the minimum of the remaining rowSum[i] and colSum[j].\n' +
      '2. Subtract this value from both rowSum[i] and colSum[j].\n' +
      '3. This ensures we never exceed the required sums.\n' +
      '4. After processing all cells, all row and column sums are satisfied.\n' +
      '5. The greedy choice always works because total rowSum equals total colSum.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Greedily assign the minimum of remaining row and column sums to each cell.',
      'This works because the total of row sums equals the total of column sums.',
      'After each assignment, reduce the corresponding row and column sums.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1606. Find Servers That Handled Most Requests
  // ---------------------------------------------------------------------------
  {
    id: 1606,
    description:
      'You have k servers numbered 0 to k-1. Requests arrive at times arrival[i] and take load[i] time. Request i is assigned to server i%k if available, otherwise the next available server in circular order. Return the servers that handled the most requests.',
    examples:
      'Input: k = 3, arrival = [1,2,3,4,5], load = [5,2,3,3,3]\nOutput: [1]',
    approach:
      'Use a sorted set of available servers and a min-heap of busy servers (sorted by end time). For each request, free up servers that have finished, find the next available server >= i%k using a sorted container.',
    code: `from sortedcontainers import SortedList
import heapq

class Solution:
    def busiestServers(self, k: int, arrival: list[int], load: list[int]) -> list[int]:
        available = SortedList(range(k))
        busy = []  # (end_time, server_id)
        count = [0] * k

        for i in range(len(arrival)):
            t = arrival[i]
            while busy and busy[0][0] <= t:
                _, server = heapq.heappop(busy)
                available.add(server)

            if not available:
                continue

            target = i % k
            idx = available.bisect_left(target)
            if idx == len(available):
                idx = 0
            server = available[idx]
            available.remove(server)
            heapq.heappush(busy, (t + load[i], server))
            count[server] += 1

        max_count = max(count)
        return [i for i in range(k) if count[i] == max_count]`,
    jsCode: `var busiestServers = function(k, arrival, load) {
    // Use arrays and sorting to simulate the SortedList
    const available = Array.from({length: k}, (_, i) => i);
    const busy = []; // min-heap by end time
    const count = new Array(k).fill(0);
    const heapPush = (arr, val) => { arr.push(val); let i = arr.length-1; while (i > 0) { const p = Math.floor((i-1)/2); if (arr[p][0] <= arr[i][0]) break; [arr[p],arr[i]] = [arr[i],arr[p]]; i = p; } };
    const heapPop = (arr) => { if (arr.length <= 1) return arr.pop(); const v = arr[0]; arr[0] = arr.pop(); let i = 0; while (true) { let s = i; const l = 2*i+1, r = 2*i+2; if (l < arr.length && arr[l][0] < arr[s][0]) s = l; if (r < arr.length && arr[r][0] < arr[s][0]) s = r; if (s === i) break; [arr[s],arr[i]] = [arr[i],arr[s]]; i = s; } return v; };
    for (let i = 0; i < arrival.length; i++) {
        const t = arrival[i];
        while (busy.length && busy[0][0] <= t) {
            const [, server] = heapPop(busy);
            const idx = lowerBound(available, server);
            available.splice(idx, 0, server);
        }
        if (!available.length) continue;
        const target = i % k;
        let idx = lowerBound(available, target);
        if (idx === available.length) idx = 0;
        const server = available[idx];
        available.splice(idx, 1);
        heapPush(busy, [t + load[i], server]);
        count[server]++;
    }
    const maxCount = Math.max(...count);
    return count.map((c, i) => c === maxCount ? i : -1).filter(i => i !== -1);
};

function lowerBound(arr, target) {
    let lo = 0, hi = arr.length;
    while (lo < hi) { const m = Math.floor((lo + hi) / 2); if (arr[m] < target) lo = m + 1; else hi = m; }
    return lo;
}`,
    explanation:
      '1. Maintain a SortedList of available servers and a heap of busy servers.\n' +
      '2. For each request, free servers whose end time <= arrival time.\n' +
      '3. Find the next available server >= i%k using binary search.\n' +
      '4. If none found at or after i%k, wrap around to the first available.\n' +
      '5. Track counts and return servers with the maximum count.',
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(k)',
    hints: [
      'Use a sorted set for available servers and a min-heap for busy servers.',
      'For each request, find the next available server >= i%k in circular order.',
      'Free servers when their tasks are done before processing new requests.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1609. Even Odd Tree
  // ---------------------------------------------------------------------------
  {
    id: 1609,
    description:
      'A binary tree is Even-Odd if: at even-indexed levels, all values are odd and strictly increasing left to right; at odd-indexed levels, all values are even and strictly decreasing. Return true if the tree is Even-Odd.',
    examples:
      'Input: root = [1,10,4,3,null,7,9,12,8,6,null,null,2]\nOutput: true',
    approach:
      'BFS level by level. At each level, check if values satisfy the parity and ordering constraints based on the level index.',
    code: `from collections import deque

class Solution:
    def isEvenOddTree(self, root) -> bool:
        q = deque([root])
        level = 0
        while q:
            prev = None
            for _ in range(len(q)):
                node = q.popleft()
                if level % 2 == 0:
                    if node.val % 2 == 0:
                        return False
                    if prev is not None and node.val <= prev:
                        return False
                else:
                    if node.val % 2 == 1:
                        return False
                    if prev is not None and node.val >= prev:
                        return False
                prev = node.val
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            level += 1
        return True`,
    jsCode: `var isEvenOddTree = function(root) {
    let q = [root];
    let level = 0;
    while (q.length) {
        let prev = null;
        const nextQ = [];
        for (const node of q) {
            if (level % 2 === 0) {
                if (node.val % 2 === 0) return false;
                if (prev !== null && node.val <= prev) return false;
            } else {
                if (node.val % 2 === 1) return false;
                if (prev !== null && node.val >= prev) return false;
            }
            prev = node.val;
            if (node.left) nextQ.push(node.left);
            if (node.right) nextQ.push(node.right);
        }
        q = nextQ;
        level++;
    }
    return true;
};`,
    explanation:
      '1. BFS processes the tree level by level.\n' +
      '2. Even levels: values must be odd and strictly increasing.\n' +
      '3. Odd levels: values must be even and strictly decreasing.\n' +
      '4. Track the previous value in each level to verify ordering.\n' +
      '5. Return False immediately if any constraint is violated.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'BFS processes the tree level by level, which is what we need.',
      'At each level, check both the parity of values and the ordering.',
      'Even levels need odd values (increasing); odd levels need even values (decreasing).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1614. Maximum Nesting Depth of the Parentheses
  // ---------------------------------------------------------------------------
  {
    id: 1614,
    description:
      'A string is a valid parentheses string (VPS) if it meets certain rules. The nesting depth is the maximum number of nested parentheses. Given a VPS s, return the nesting depth.',
    examples:
      'Input: s = "(1+(2*3)+((8)/4))+1"\nOutput: 3',
    approach:
      'Track the current depth. Increment on "(" and decrement on ")". The maximum depth encountered is the answer.',
    code: `class Solution:
    def maxDepth(self, s: str) -> int:
        depth = 0
        max_depth = 0
        for c in s:
            if c == '(':
                depth += 1
                max_depth = max(max_depth, depth)
            elif c == ')':
                depth -= 1
        return max_depth`,
    jsCode: `var maxDepth = function(s) {
    let depth = 0, maxD = 0;
    for (const c of s) {
        if (c === '(') { depth++; maxD = Math.max(maxD, depth); }
        else if (c === ')') depth--;
    }
    return maxD;
};`,
    explanation:
      '1. Initialize depth and max_depth to 0.\n' +
      '2. For each "(", increment depth.\n' +
      '3. For each ")", decrement depth.\n' +
      '4. Track the maximum depth reached.\n' +
      '5. Return max_depth.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Track the current nesting depth as you scan the string.',
      'Increment on "(" and decrement on ")".',
      'The maximum depth encountered is the answer.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1615. Maximal Network Rank
  // ---------------------------------------------------------------------------
  {
    id: 1615,
    description:
      'There are n cities and some roads between them. The network rank of two cities is the total number of roads connected to either city. If the two cities are directly connected, count that road only once. Return the maximal network rank of any pair of cities.',
    examples:
      'Input: n = 4, roads = [[0,1],[0,3],[1,2],[1,3]]\nOutput: 4',
    approach:
      'Compute the degree of each city. For each pair (i, j), their network rank is degree[i] + degree[j] - (1 if they are directly connected). Check all pairs and return the maximum.',
    code: `class Solution:
    def maximalNetworkRank(self, n: int, roads: list[list[int]]) -> int:
        degree = [0] * n
        connected = set()
        for u, v in roads:
            degree[u] += 1
            degree[v] += 1
            connected.add((min(u, v), max(u, v)))
        best = 0
        for i in range(n):
            for j in range(i + 1, n):
                rank = degree[i] + degree[j]
                if (i, j) in connected:
                    rank -= 1
                best = max(best, rank)
        return best`,
    jsCode: `var maximalNetworkRank = function(n, roads) {
    const degree = new Array(n).fill(0);
    const connected = new Set();
    for (const [u, v] of roads) {
        degree[u]++;
        degree[v]++;
        connected.add(Math.min(u, v) + ',' + Math.max(u, v));
    }
    let best = 0;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            let rank = degree[i] + degree[j];
            if (connected.has(i + ',' + j)) rank--;
            best = Math.max(best, rank);
        }
    }
    return best;
};`,
    explanation:
      '1. Compute the degree of each city (number of roads connected to it).\n' +
      '2. Store all edges in a set for O(1) lookup.\n' +
      '3. For each pair (i, j), rank = degree[i] + degree[j] - (1 if directly connected).\n' +
      '4. Subtract 1 when directly connected to avoid double-counting that road.\n' +
      '5. Return the maximum rank across all pairs.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n + E)',
    hints: [
      'Network rank = degree[i] + degree[j] minus 1 if they share a road.',
      'Precompute degrees and store edges for quick lookup.',
      'Check all pairs of cities.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1627. Graph Connectivity With Threshold
  // ---------------------------------------------------------------------------
  {
    id: 1627,
    description:
      'We have n cities numbered from 1 to n. Two cities a and b share a common divisor greater than threshold. For each query [a, b], determine if they are connected (directly or through other cities sharing common divisors > threshold).',
    examples:
      'Input: n = 6, threshold = 2, queries = [[1,4],[2,5],[3,6]]\nOutput: [false,false,true]',
    approach:
      'Use Union-Find. For each divisor d > threshold, union all multiples of d (2d, 3d, ...). Then answer queries by checking if two cities are in the same component.',
    code: `class Solution:
    def areConnected(self, n: int, threshold: int, queries: list[list[int]]) -> list[bool]:
        parent = list(range(n + 1))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        def union(a, b):
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
        for d in range(threshold + 1, n + 1):
            for multiple in range(2 * d, n + 1, d):
                union(d, multiple)
        return [find(a) == find(b) for a, b in queries]`,
    jsCode: `var areConnected = function(n, threshold, queries) {
    const parent = Array.from({length: n + 1}, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    const union = (a, b) => {
        const ra = find(a), rb = find(b);
        if (ra !== rb) parent[ra] = rb;
    };
    for (let d = threshold + 1; d <= n; d++) {
        for (let multiple = 2 * d; multiple <= n; multiple += d) {
            union(d, multiple);
        }
    }
    return queries.map(([a, b]) => find(a) === find(b));
};`,
    explanation:
      '1. For each divisor d from threshold+1 to n, union d with all its multiples.\n' +
      '2. If cities a and b share a common divisor d > threshold, they will be in the same component.\n' +
      '3. The sieve-like loop ensures all pairs sharing a common divisor are connected.\n' +
      '4. For each query, check if the two cities have the same root.\n' +
      '5. Total union operations is O(n log n) from the harmonic series.',
    timeComplexity: 'O(n log n + q * alpha(n))',
    spaceComplexity: 'O(n)',
    hints: [
      'Union-Find can efficiently group cities with shared divisors.',
      'For each d > threshold, union all multiples of d together.',
      'This is similar to sieve of Eratosthenes in structure.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1631. Path With Minimum Effort
  // ---------------------------------------------------------------------------
  {
    id: 1631,
    description:
      'You are given a 2D heights matrix. A route\'s effort is the maximum absolute difference in heights between consecutive cells. Find a path from top-left to bottom-right that minimizes the effort.',
    examples:
      'Input: heights = [[1,2,2],[3,8,2],[5,3,5]]\nOutput: 2',
    approach:
      'Use Dijkstra-like algorithm where the "distance" is the maximum effort along the path. Use a min-heap prioritizing by effort. Update cell efforts when a lower-effort path is found.',
    code: `import heapq

class Solution:
    def minimumEffortPath(self, heights: list[list[int]]) -> int:
        m, n = len(heights), len(heights[0])
        effort = [[float('inf')] * n for _ in range(m)]
        effort[0][0] = 0
        heap = [(0, 0, 0)]
        while heap:
            e, r, c = heapq.heappop(heap)
            if r == m - 1 and c == n - 1:
                return e
            if e > effort[r][c]:
                continue
            for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n:
                    new_effort = max(e, abs(heights[nr][nc] - heights[r][c]))
                    if new_effort < effort[nr][nc]:
                        effort[nr][nc] = new_effort
                        heapq.heappush(heap, (new_effort, nr, nc))
        return 0`,
    jsCode: `var minimumEffortPath = function(heights) {
    const m = heights.length, n = heights[0].length;
    const effort = Array.from({length: m}, () => new Array(n).fill(Infinity));
    effort[0][0] = 0;
    const heap = [[0, 0, 0]];
    const push = (val) => { heap.push(val); let i = heap.length-1; while (i > 0) { const p = Math.floor((i-1)/2); if (heap[p][0] <= heap[i][0]) break; [heap[p],heap[i]] = [heap[i],heap[p]]; i = p; } };
    const pop = () => { if (heap.length <= 1) return heap.pop(); const v = heap[0]; heap[0] = heap.pop(); let i = 0; while (true) { let s = i; const l = 2*i+1, r = 2*i+2; if (l < heap.length && heap[l][0] < heap[s][0]) s = l; if (r < heap.length && heap[r][0] < heap[s][0]) s = r; if (s === i) break; [heap[s],heap[i]] = [heap[i],heap[s]]; i = s; } return v; };
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    while (heap.length) {
        const [e, r, c] = pop();
        if (r === m - 1 && c === n - 1) return e;
        if (e > effort[r][c]) continue;
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
                const newEffort = Math.max(e, Math.abs(heights[nr][nc] - heights[r][c]));
                if (newEffort < effort[nr][nc]) {
                    effort[nr][nc] = newEffort;
                    push([newEffort, nr, nc]);
                }
            }
        }
    }
    return 0;
};`,
    explanation:
      '1. Modified Dijkstra: "distance" = maximum height difference along the path.\n' +
      '2. Start at (0,0) with effort 0.\n' +
      '3. For each neighbor, new effort = max(current effort, absolute height difference).\n' +
      '4. If new effort < known effort for that cell, update and push to heap.\n' +
      '5. Return the effort when bottom-right is reached.',
    timeComplexity: 'O(m * n * log(m * n))',
    spaceComplexity: 'O(m * n)',
    hints: [
      'This is a shortest path problem where "distance" is the maximum edge weight.',
      'Use Dijkstra with effort = max height difference along the path.',
      'Binary search on effort with BFS/DFS also works.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1639. Number of Ways to Form a Target String Given a Dictionary
  // ---------------------------------------------------------------------------
  {
    id: 1639,
    description:
      'You are given a list of strings words (all same length) and a target string. Form target by choosing one character from the k-th column of any word for each step. Each column can be used at most once, and columns must be used in increasing order. Return the number of ways modulo 10^9 + 7.',
    examples:
      'Input: words = ["acca","bbbb","caca"], target = "aba"\nOutput: 6',
    approach:
      'Count character frequencies per column. Use DP: dp[j] = number of ways to form target[0..j-1]. For each column, update dp from right to left, adding ways to match target[j] using this column.',
    code: `class Solution:
    def numWays(self, words: list[str], target: str) -> int:
        MOD = 10**9 + 7
        m = len(words[0])
        n = len(target)
        freq = [[0] * 26 for _ in range(m)]
        for word in words:
            for i, c in enumerate(word):
                freq[i][ord(c) - ord('a')] += 1
        dp = [0] * (n + 1)
        dp[0] = 1
        for col in range(m):
            for j in range(min(n, col + 1), 0, -1):
                dp[j] = (dp[j] + dp[j - 1] * freq[col][ord(target[j - 1]) - ord('a')]) % MOD
        return dp[n]`,
    jsCode: `var numWays = function(words, target) {
    const MOD = 1000000007;
    const m = words[0].length;
    const n = target.length;
    const freq = Array.from({length: m}, () => new Array(26).fill(0));
    for (const word of words) {
        for (let i = 0; i < m; i++) freq[i][word.charCodeAt(i) - 97]++;
    }
    const dp = new Array(n + 1).fill(0);
    dp[0] = 1;
    for (let col = 0; col < m; col++) {
        for (let j = Math.min(n, col + 1); j > 0; j--) {
            dp[j] = (dp[j] + dp[j - 1] * freq[col][target.charCodeAt(j - 1) - 97]) % MOD;
        }
    }
    return dp[n];
};`,
    explanation:
      '1. Count character frequencies at each column position across all words.\n' +
      '2. dp[j] = number of ways to form the first j characters of target.\n' +
      '3. For each column, iterate j from right to left (like 0/1 knapsack).\n' +
      '4. dp[j] += dp[j-1] * freq[col][target[j-1]], meaning we use this column for target[j-1].\n' +
      '5. Return dp[n], the number of ways to form the entire target.',
    timeComplexity: 'O(m * n + m * W) where W = number of words',
    spaceComplexity: 'O(m * 26 + n)',
    hints: [
      'Precompute character frequencies per column.',
      'Use DP where dp[j] = ways to form first j chars of target.',
      'Process columns left to right, updating dp right to left (knapsack style).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1641. Count Sorted Vowel Strings
  // ---------------------------------------------------------------------------
  {
    id: 1641,
    description:
      'Given an integer n, return the number of strings of length n that consist only of vowels (a, e, i, o, u) and are lexicographically sorted.',
    examples:
      'Input: n = 2\nOutput: 15',
    approach:
      'This is equivalent to choosing n items from 5 with repetition, which is C(n+4, 4). Alternatively, use DP where dp[i][j] = number of sorted strings of length i ending with the j-th vowel.',
    code: `class Solution:
    def countVowelStrings(self, n: int) -> int:
        dp = [1] * 5
        for i in range(1, n):
            for j in range(1, 5):
                dp[j] += dp[j - 1]
        return sum(dp)`,
    jsCode: `var countVowelStrings = function(n) {
    const dp = [1, 1, 1, 1, 1];
    for (let i = 1; i < n; i++) {
        for (let j = 1; j < 5; j++) dp[j] += dp[j - 1];
    }
    return dp.reduce((a, b) => a + b, 0);
};`,
    explanation:
      '1. dp[j] represents the number of sorted strings of the current length ending with vowel j.\n' +
      '2. Initialize dp = [1, 1, 1, 1, 1] for length 1.\n' +
      '3. For each additional length, dp[j] += dp[j-1] (can extend from any vowel <= j).\n' +
      '4. After n-1 iterations, sum(dp) gives the total count.\n' +
      '5. This is equivalent to stars and bars: C(n+4, 4).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'A sorted vowel string means each character is >= the previous one.',
      'This is a "stars and bars" combinatorics problem.',
      'DP: dp[j] accumulates from smaller vowels to larger ones.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1642. Furthest Building You Can Reach
  // ---------------------------------------------------------------------------
  {
    id: 1642,
    description:
      'You have bricks and ladders. Moving from building i to i+1: if heights[i+1] <= heights[i], no cost. Otherwise, use bricks (cost = height diff) or a ladder. Return the furthest building you can reach.',
    examples:
      'Input: heights = [4,2,7,6,9,14,12], bricks = 5, ladders = 1\nOutput: 4',
    approach:
      'Use a min-heap to track the largest climbs where ladders should be used. For each climb, add the height diff to the heap. If the heap size exceeds ladders, remove the smallest diff and use bricks for it. If bricks run out, stop.',
    code: `import heapq

class Solution:
    def furthestBuilding(self, heights: list[int], bricks: int, ladders: int) -> int:
        heap = []
        for i in range(len(heights) - 1):
            diff = heights[i + 1] - heights[i]
            if diff <= 0:
                continue
            heapq.heappush(heap, diff)
            if len(heap) > ladders:
                bricks -= heapq.heappop(heap)
            if bricks < 0:
                return i
        return len(heights) - 1`,
    jsCode: `var furthestBuilding = function(heights, bricks, ladders) {
    const heap = [];
    const push = (val) => { heap.push(val); let i = heap.length-1; while (i > 0) { const p = Math.floor((i-1)/2); if (heap[p] <= heap[i]) break; [heap[p],heap[i]] = [heap[i],heap[p]]; i = p; } };
    const pop = () => { if (heap.length <= 1) return heap.pop(); const v = heap[0]; heap[0] = heap.pop(); let i = 0; while (true) { let s = i; const l = 2*i+1, r = 2*i+2; if (l < heap.length && heap[l] < heap[s]) s = l; if (r < heap.length && heap[r] < heap[s]) s = r; if (s === i) break; [heap[s],heap[i]] = [heap[i],heap[s]]; i = s; } return v; };
    for (let i = 0; i < heights.length - 1; i++) {
        const diff = heights[i + 1] - heights[i];
        if (diff <= 0) continue;
        push(diff);
        if (heap.length > ladders) bricks -= pop();
        if (bricks < 0) return i;
    }
    return heights.length - 1;
};`,
    explanation:
      '1. For each upward climb, push the height difference to a min-heap.\n' +
      '2. The heap holds the largest climbs (candidates for ladders).\n' +
      '3. If heap size exceeds available ladders, pop the smallest and use bricks.\n' +
      '4. If bricks go negative, we cannot proceed; return the current index.\n' +
      '5. If we finish all buildings, return the last index.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use ladders for the largest climbs and bricks for smaller ones.',
      'A min-heap tracks the climbs assigned to ladders.',
      'When the heap exceeds the ladder count, the smallest climb uses bricks instead.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1647. Minimum Deletions to Make Character Frequencies Unique
  // ---------------------------------------------------------------------------
  {
    id: 1647,
    description:
      'A string s is good if no two different characters have the same frequency. Return the minimum number of character deletions to make s good.',
    examples:
      'Input: s = "aaabbbcc"\nOutput: 2\nExplanation: Delete two "b"s or two "c"s to make frequencies unique.',
    approach:
      'Count frequencies, sort in descending order. Greedily reduce each frequency to be less than the previous one. Count total reductions.',
    code: `from collections import Counter

class Solution:
    def minDeletions(self, s: str) -> int:
        freqs = sorted(Counter(s).values(), reverse=True)
        deletions = 0
        for i in range(1, len(freqs)):
            if freqs[i] >= freqs[i - 1]:
                target = max(0, freqs[i - 1] - 1)
                deletions += freqs[i] - target
                freqs[i] = target
        return deletions`,
    jsCode: `var minDeletions = function(s) {
    const freq = new Map();
    for (const c of s) freq.set(c, (freq.get(c) || 0) + 1);
    const freqs = [...freq.values()].sort((a, b) => b - a);
    let deletions = 0;
    for (let i = 1; i < freqs.length; i++) {
        if (freqs[i] >= freqs[i - 1]) {
            const target = Math.max(0, freqs[i - 1] - 1);
            deletions += freqs[i] - target;
            freqs[i] = target;
        }
    }
    return deletions;
};`,
    explanation:
      '1. Count character frequencies and sort in descending order.\n' +
      '2. Each frequency must be strictly less than the previous one.\n' +
      '3. If freqs[i] >= freqs[i-1], reduce it to freqs[i-1] - 1 (minimum 0).\n' +
      '4. Count the total reductions as deletions.\n' +
      '5. Return the total deletions needed.',
    timeComplexity: 'O(n + k log k) where k is the number of unique characters',
    spaceComplexity: 'O(k)',
    hints: [
      'Count frequencies and sort them.',
      'Greedily ensure each frequency is unique by reducing from top to bottom.',
      'A frequency can be reduced to one less than the previous, or to 0.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1657. Determine if Two Strings Are Close
  // ---------------------------------------------------------------------------
  {
    id: 1657,
    description:
      'Two strings are considered close if you can attain one from the other using: (1) swap any two existing characters, or (2) transform every occurrence of one character to another and vice versa. Return true if the two strings are close.',
    examples:
      'Input: word1 = "abc", word2 = "bca"\nOutput: true',
    approach:
      'Two strings are close if they have the same set of characters and the same multiset of frequencies (sorted frequency lists are equal). Operation 1 allows any permutation, operation 2 allows swapping frequency counts between characters.',
    code: `from collections import Counter

class Solution:
    def closeStrings(self, word1: str, word2: str) -> bool:
        c1, c2 = Counter(word1), Counter(word2)
        return set(c1.keys()) == set(c2.keys()) and sorted(c1.values()) == sorted(c2.values())`,
    jsCode: `var closeStrings = function(word1, word2) {
    const c1 = new Array(26).fill(0), c2 = new Array(26).fill(0);
    for (const c of word1) c1[c.charCodeAt(0) - 97]++;
    for (const c of word2) c2[c.charCodeAt(0) - 97]++;
    for (let i = 0; i < 26; i++) {
        if ((c1[i] > 0) !== (c2[i] > 0)) return false;
    }
    return c1.sort((a, b) => a - b).join() === c2.sort((a, b) => a - b).join();
};`,
    explanation:
      '1. Count character frequencies in both strings.\n' +
      '2. Check that both strings use the same set of characters.\n' +
      '3. Check that the sorted frequency lists are identical.\n' +
      '4. Same character set ensures operation 2 can map between them.\n' +
      '5. Same sorted frequencies ensures the counts can be redistributed.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) (26 characters)',
    hints: [
      'Operation 1 allows any rearrangement. Operation 2 swaps frequency counts.',
      'Two strings are close if they have the same characters and same frequency multiset.',
      'Check both the character set and sorted frequencies match.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1658. Minimum Operations to Reduce X to Zero
  // ---------------------------------------------------------------------------
  {
    id: 1658,
    description:
      'You are given an integer array nums and an integer x. In one operation, remove the leftmost or rightmost element and subtract its value from x. Return the minimum number of operations to reduce x to exactly zero, or -1 if impossible.',
    examples:
      'Input: nums = [1,1,4,2,3], x = 5\nOutput: 2\nExplanation: Remove 3 and 2 from the right.',
    approach:
      'Removing elements from both ends is equivalent to keeping a contiguous subarray whose sum is total - x. Find the longest such subarray. The answer is n - max_length.',
    code: `class Solution:
    def minOperations(self, nums: list[int], x: int) -> int:
        target = sum(nums) - x
        if target < 0:
            return -1
        if target == 0:
            return len(nums)
        n = len(nums)
        max_len = -1
        left = 0
        curr_sum = 0
        for right in range(n):
            curr_sum += nums[right]
            while curr_sum > target:
                curr_sum -= nums[left]
                left += 1
            if curr_sum == target:
                max_len = max(max_len, right - left + 1)
        return n - max_len if max_len != -1 else -1`,
    jsCode: `var minOperations = function(nums, x) {
    const target = nums.reduce((a, b) => a + b, 0) - x;
    if (target < 0) return -1;
    if (target === 0) return nums.length;
    const n = nums.length;
    let maxLen = -1, left = 0, currSum = 0;
    for (let right = 0; right < n; right++) {
        currSum += nums[right];
        while (currSum > target) { currSum -= nums[left]; left++; }
        if (currSum === target) maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen !== -1 ? n - maxLen : -1;
};`,
    explanation:
      '1. Compute target = total sum - x (the sum of the subarray we want to keep).\n' +
      '2. If target < 0, impossible. If target == 0, remove everything.\n' +
      '3. Use sliding window to find the longest subarray with sum == target.\n' +
      '4. The answer is n - max_length (elements removed from both ends).\n' +
      '5. If no such subarray exists, return -1.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Think in reverse: removing from ends is keeping a middle subarray.',
      'Find the longest subarray with sum = total - x.',
      'Use a sliding window since all values are positive.',
    ],
  },
];

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
    intuition:
      'Think of each interval as a segment on a number line. When you cut a piece out, whatever sticks out on either side remains. You just need to check three scenarios for each interval: completely outside the cut, partially overlapping, or fully swallowed.',
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

    // Destructure the removal range boundaries
    const [lo, hi] = toBeRemoved;

    for (const [a, b] of intervals) {
        // Check if this interval is completely outside the removal range
        const isCompletelyBefore = b <= lo;
        const isCompletelyAfter = a >= hi;

        if (isCompletelyBefore || isCompletelyAfter) {
            // No overlap at all — keep the interval as-is
            res.push([a, b]);
        } else {
            // Partial or full overlap — keep only the non-overlapping parts

            // Left portion: interval starts before the removal range
            if (a < lo) {
                res.push([a, lo]);
            }

            // Right portion: interval ends after the removal range
            if (b > hi) {
                res.push([hi, b]);
            }
        }
    }

    return res;
};`,
    jsWalkthrough:
      'Input: intervals = [[0,2],[3,4],[5,7]], toBeRemoved = [1,6]\n\n' +
      'lo = 1, hi = 6\n\n' +
      'Interval [0,2]: b=2 > lo=1, a=0 < hi=6 -> overlap\n' +
      '  a=0 < lo=1 -> push [0,1]\n' +
      '  b=2 > hi=6? No -> skip right portion\n' +
      '  res = [[0,1]]\n\n' +
      'Interval [3,4]: b=4 > lo=1, a=3 < hi=6 -> overlap\n' +
      '  a=3 < lo=1? No -> skip left portion\n' +
      '  b=4 > hi=6? No -> skip right portion\n' +
      '  res = [[0,1]] (interval fully removed)\n\n' +
      'Interval [5,7]: b=7 > lo=1, a=5 < hi=6 -> overlap\n' +
      '  a=5 < lo=1? No -> skip left portion\n' +
      '  b=7 > hi=6 -> push [6,7]\n' +
      '  res = [[0,1],[6,7]]\n\n' +
      'Return [[0,1],[6,7]]',
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
    intuition:
      'Imagine searching for needles in a haystack by splitting the haystack into four smaller piles. If a pile has no needles (hasShips returns false), you skip it entirely. This divide-and-conquer pruning is efficient because ships are sparse.',
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
    // Invalid region (shouldn't normally happen but guards recursion)
    if (topRight.x < bottomLeft.x || topRight.y < bottomLeft.y) {
        return 0;
    }

    // Prune: no ships in this region
    if (!sea.hasShips(topRight, bottomLeft)) {
        return 0;
    }

    // Base case: single point that contains a ship
    const isSinglePoint = topRight.x === bottomLeft.x && topRight.y === bottomLeft.y;
    if (isSinglePoint) {
        return 1;
    }

    // Compute midpoints to split into four quadrants
    const mx = Math.floor((topRight.x + bottomLeft.x) / 2);
    const my = Math.floor((topRight.y + bottomLeft.y) / 2);

    // Recursively count ships in each quadrant
    const bottomLeft_quad = countShips(sea, new Point(mx, my), bottomLeft);
    const topRight_quad  = countShips(sea, topRight, new Point(mx + 1, my + 1));
    const topLeft_quad   = countShips(sea, new Point(mx, topRight.y), new Point(bottomLeft.x, my + 1));
    const bottomRight_quad = countShips(sea, new Point(topRight.x, my), new Point(mx + 1, bottomLeft.y));

    return bottomLeft_quad + topRight_quad + topLeft_quad + bottomRight_quad;
};`,
    jsWalkthrough:
      'Input: topRight=[4,4], bottomLeft=[0,0], ships at [1,1],[2,2],[3,3]\n\n' +
      'hasShips([4,4],[0,0]) = true, not single point\n' +
      'mx=2, my=2 -> split into 4 quadrants\n\n' +
      'Q1 bottomLeft: topRight=[2,2], bottomLeft=[0,0]\n' +
      '  hasShips=true, mx=1, my=1\n' +
      '  Sub-Q: [1,1]-[0,0] -> hasShips=true, single point -> 1\n' +
      '  Sub-Q: [2,2]-[2,2] -> hasShips=true, single point -> 1\n' +
      '  ... -> returns 2\n\n' +
      'Q2 topRight: topRight=[4,4], bottomLeft=[3,3]\n' +
      '  hasShips=true, [3,3] single point -> 1\n\n' +
      'Q3 topLeft: topRight=[2,4], bottomLeft=[0,3]\n' +
      '  hasShips=false -> 0\n\n' +
      'Q4 bottomRight: topRight=[4,2], bottomLeft=[3,0]\n' +
      '  hasShips=false -> 0\n\n' +
      'Total: 2+1+0+0 = 3',
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
    intuition:
      'If you can form a 3x3 square of all ones ending at a cell, that means you could also form 2x2 and 1x1 squares there. The dp value at each cell tells you the largest square ending there, and that same number counts all square sizes ending at that cell.',
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
    const m = matrix.length;
    const n = matrix[0].length;

    // dp[i][j] = side length of largest square with bottom-right corner at (i, j)
    const dp = Array.from({length: m}, () => new Array(n).fill(0));

    let total = 0;

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            // Only process cells that are 1
            if (matrix[i][j] === 1) {

                if (i === 0 || j === 0) {
                    // Border cells can only form a 1x1 square
                    dp[i][j] = 1;
                } else {
                    // The largest square is limited by neighbors above, left, and diagonal
                    const fromAbove    = dp[i - 1][j];
                    const fromLeft     = dp[i][j - 1];
                    const fromDiagonal = dp[i - 1][j - 1];

                    dp[i][j] = Math.min(fromAbove, fromLeft, fromDiagonal) + 1;
                }

                // dp[i][j] also counts the number of squares ending at this cell
                // (a cell with value 3 contributes 1x1, 2x2, and 3x3 squares)
                total += dp[i][j];
            }
        }
    }

    return total;
};`,
    jsWalkthrough:
      'Input: matrix = [[0,1,1,1],[1,1,1,1],[0,1,1,1]]\n\n' +
      'Processing row 0:\n' +
      '  (0,0)=0 skip; (0,1)=1 border -> dp=1, total=1\n' +
      '  (0,2)=1 border -> dp=1, total=2\n' +
      '  (0,3)=1 border -> dp=1, total=3\n\n' +
      'Processing row 1:\n' +
      '  (1,0)=1 border -> dp=1, total=4\n' +
      '  (1,1)=1: min(dp[0][1]=1, dp[1][0]=1, dp[0][0]=0)+1 = 1, total=5\n' +
      '  (1,2)=1: min(dp[0][2]=1, dp[1][1]=1, dp[0][1]=1)+1 = 2, total=7\n' +
      '  (1,3)=1: min(dp[0][3]=1, dp[1][2]=2, dp[0][2]=1)+1 = 2, total=9\n\n' +
      'Processing row 2:\n' +
      '  (2,0)=0 skip\n' +
      '  (2,1)=1: min(dp[1][1]=1, dp[2][0]=0, dp[1][0]=1)+1 = 1, total=10\n' +
      '  (2,2)=1: min(dp[1][2]=2, dp[2][1]=1, dp[1][1]=1)+1 = 2, total=12\n' +
      '  (2,3)=1: min(dp[1][3]=2, dp[2][2]=2, dp[1][2]=2)+1 = 3, total=15\n\n' +
      'Return 15',
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
    intuition:
      'This is a straightforward digit extraction problem. Just peel off digits one at a time using modulo 10, keeping a running product and sum as you go. It is like counting coins from a piggy bank one by one.',
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
    let product = 1;
    let total = 0;

    // Extract digits one at a time from least significant to most significant
    while (n > 0) {
        // Get the last digit
        const digit = n % 10;

        // Accumulate product and sum
        product *= digit;
        total += digit;

        // Remove the last digit
        n = Math.floor(n / 10);
    }

    return product - total;
};`,
    jsWalkthrough:
      'Input: n = 234\n\n' +
      'product = 1, total = 0\n\n' +
      'Iteration 1: digit = 234 % 10 = 4, product = 1*4 = 4, total = 0+4 = 4, n = 23\n' +
      'Iteration 2: digit = 23 % 10 = 3, product = 4*3 = 12, total = 4+3 = 7, n = 2\n' +
      'Iteration 3: digit = 2 % 10 = 2, product = 12*2 = 24, total = 7+2 = 9, n = 0\n\n' +
      'Loop ends (n = 0)\n' +
      'Return product - total = 24 - 9 = 15',
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
    intuition:
      'Generalized form: Minimize k (divisor) s.t. ceilingSum(k) ≤ threshold. Larger divisors produce smaller ceiling-divided sums, creating a monotonic relationship perfect for the generalized binary search template.',
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
    // Binary search on the divisor value
    let lo = 1;
    let hi = Math.max(...nums);

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);

        // Compute the ceiling-divided sum for this candidate divisor
        const ceilingSum = nums.reduce((acc, x) => acc + Math.ceil(x / mid), 0);

        if (ceilingSum <= threshold) {
            // This divisor works; try a smaller one
            hi = mid;
        } else {
            // Sum too large; need a bigger divisor
            lo = mid + 1;
        }
    }

    return lo;
};`,
    jsWalkthrough:
      'Input: nums = [1,2,5,9], threshold = 6\n\n' +
      'lo = 1, hi = 9\n\n' +
      'Round 1: mid = 5\n' +
      '  sum = ceil(1/5)+ceil(2/5)+ceil(5/5)+ceil(9/5) = 1+1+1+2 = 5 <= 6\n' +
      '  hi = 5\n\n' +
      'Round 2: mid = 3\n' +
      '  sum = ceil(1/3)+ceil(2/3)+ceil(5/3)+ceil(9/3) = 1+1+2+3 = 7 > 6\n' +
      '  lo = 4\n\n' +
      'Round 3: mid = 4\n' +
      '  sum = ceil(1/4)+ceil(2/4)+ceil(5/4)+ceil(9/4) = 1+1+2+3 = 7 > 6\n' +
      '  lo = 5\n\n' +
      'lo == hi == 5, return 5',
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
    intuition:
      'Since the input characters are already sorted, generating combinations in order is natural. Pre-compute all valid combinations upfront and serve them one by one with a pointer, like dealing from a pre-shuffled deck of cards.',
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

    // Recursively generate all combinations of the given length
    const generate = (startIndex, currentCombo) => {
        // Base case: combination is complete
        if (currentCombo.length === combinationLength) {
            this.combos.push(currentCombo);
            return;
        }

        // Try each remaining character as the next in the combination
        for (let i = startIndex; i < characters.length; i++) {
            generate(i + 1, currentCombo + characters[i]);
        }
    };

    // Start generating from index 0 with an empty string
    generate(0, '');
};

CombinationIterator.prototype.next = function() {
    // Return the current combination and advance the pointer
    const combo = this.combos[this.idx];
    this.idx++;
    return combo;
};

CombinationIterator.prototype.hasNext = function() {
    // Check if there are more combinations remaining
    return this.idx < this.combos.length;
};`,
    jsWalkthrough:
      'Input: characters = "abc", combinationLength = 2\n\n' +
      'generate(0, ""):\n' +
      '  i=0 -> generate(1, "a"):\n' +
      '    i=1 -> generate(2, "ab"): length==2 -> push "ab"\n' +
      '    i=2 -> generate(3, "ac"): length==2 -> push "ac"\n' +
      '  i=1 -> generate(2, "b"):\n' +
      '    i=2 -> generate(3, "bc"): length==2 -> push "bc"\n' +
      '  i=2 -> generate(3, "c"): no more chars to add\n\n' +
      'combos = ["ab", "ac", "bc"], idx = 0\n\n' +
      'next() -> "ab" (idx becomes 1)\n' +
      'next() -> "ac" (idx becomes 2)\n' +
      'next() -> "bc" (idx becomes 3)\n' +
      'hasNext() -> 3 < 3 = false',
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
    intuition:
      'Imagine stacking intervals by their start point, with longer ones on top. As you scan left to right, any interval whose right end does not extend beyond what you have already seen is completely covered and can be removed.',
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
    // Sort by start ascending; on tie, sort by end descending (longer first)
    intervals.sort((a, b) => a[0] - b[0] || b[1] - a[1]);

    let count = 0;
    let maxRight = 0;

    for (const [left, right] of intervals) {
        if (right > maxRight) {
            // This interval extends beyond all previously seen intervals — not covered
            count++;
            maxRight = right;
        }
        // If right <= maxRight, this interval is covered by a previous one; skip it
    }

    return count;
};`,
    jsWalkthrough:
      'Input: intervals = [[1,4],[3,6],[2,8]]\n\n' +
      'After sort (by start asc, end desc): [[1,4],[2,8],[3,6]]\n\n' +
      'maxRight = 0, count = 0\n\n' +
      '[1,4]: right=4 > maxRight=0 -> count=1, maxRight=4\n' +
      '[2,8]: right=8 > maxRight=4 -> count=2, maxRight=8\n' +
      '[3,6]: right=6 > maxRight=8? No -> covered by [2,8], skip\n\n' +
      'Return 2',
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
    intuition:
      'Reading binary digits left to right is like reading a decimal number left to right: shift what you have so far by the base (multiply by 2 for binary) and add the new digit. The linked list naturally gives you digits in order.',
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

    // Traverse the linked list from head to tail
    while (head) {
        // Shift current result left by 1 bit (multiply by 2),
        // then append the current binary digit
        result = result * 2 + head.val;

        head = head.next;
    }

    return result;
};`,
    jsWalkthrough:
      'Input: head = [1,0,1] (binary 101 = 5)\n\n' +
      'result = 0\n\n' +
      'Node val=1: result = 0*2 + 1 = 1\n' +
      'Node val=0: result = 1*2 + 0 = 2\n' +
      'Node val=1: result = 2*2 + 1 = 5\n\n' +
      'head = null, loop ends\n' +
      'Return 5',
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
    intuition:
      'There are very few sequential digit numbers (at most 36 total, like 12, 123, 1234, etc.). You can simply generate all of them by starting from each digit 1-9 and extending, then filter by the given range.',
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

    // Try each starting digit from 1 to 9
    for (let start = 1; start <= 9; start++) {
        let num = start;
        let nextDigit = start;

        // Keep appending the next sequential digit
        while (num <= high && nextDigit < 10) {
            // Collect number if it falls within [low, high]
            if (num >= low) {
                result.push(num);
            }

            // Append the next digit
            nextDigit++;
            if (nextDigit < 10) {
                num = num * 10 + nextDigit;
            }
        }
    }

    // Sort because numbers from different starting digits may interleave
    result.sort((a, b) => a - b);
    return result;
};`,
    jsWalkthrough:
      'Input: low = 100, high = 300\n\n' +
      'start=1: 1 -> 12 -> 123 (>= 100, push) -> 1234 (> 300, stop)\n' +
      'start=2: 2 -> 23 -> 234 (>= 100, push) -> 2345 (> 300, stop)\n' +
      'start=3: 3 -> 34 -> 345 (> 300, stop)\n' +
      'start=4..9: first 3-digit numbers all > 300, nothing added\n\n' +
      'result before sort = [123, 234]\n' +
      'After sort = [123, 234]\n' +
      'Return [123, 234]',
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
    intuition:
      'The key insight is that you only need to check substrings of the minimum size. If a short substring appears k times, any longer substring containing it appears at most k times. So checking only minSize gives the optimal answer.',
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
    // Only check substrings of length minSize (key insight)
    const count = new Map();

    for (let i = 0; i <= s.length - minSize; i++) {
        const sub = s.substring(i, i + minSize);

        // Check if this substring has at most maxLetters unique characters
        const uniqueCharCount = new Set(sub).size;
        if (uniqueCharCount <= maxLetters) {
            const prevCount = count.get(sub) || 0;
            count.set(sub, prevCount + 1);
        }
    }

    // Find the maximum frequency across all valid substrings
    let maxOccurrences = 0;
    for (const freq of count.values()) {
        maxOccurrences = Math.max(maxOccurrences, freq);
    }

    return maxOccurrences;
};`,
    jsWalkthrough:
      'Input: s = "aababcaab", maxLetters = 2, minSize = 3, maxSize = 4\n\n' +
      'Only checking substrings of length 3:\n\n' +
      'i=0: sub="aab", unique chars={a,b}=2 <= 2 -> count["aab"]=1\n' +
      'i=1: sub="aba", unique chars={a,b}=2 <= 2 -> count["aba"]=1\n' +
      'i=2: sub="bab", unique chars={a,b}=2 <= 2 -> count["bab"]=1\n' +
      'i=3: sub="abc", unique chars={a,b,c}=3 > 2 -> skip\n' +
      'i=4: sub="bca", unique chars={a,b,c}=3 > 2 -> skip\n' +
      'i=5: sub="caa", unique chars={a,c}=2 <= 2 -> count["caa"]=1\n' +
      'i=6: sub="aab", unique chars={a,b}=2 <= 2 -> count["aab"]=2\n\n' +
      'max frequency = 2 (for "aab")\n' +
      'Return 2',
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
    intuition:
      'Think of it as a dial: turning the value up makes the clamped sum go down, and vice versa. This monotonic relationship means binary search finds the sweet spot where the sum best approximates the target.',
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

    // Build prefix sums for O(log n) clamped-sum computation
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + arr[i];
    }

    let lo = 0;
    let hi = Math.max(...arr);
    let bestVal = 0;
    let bestDiff = Infinity;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);

        // Binary search: find how many elements are <= mid
        let left2 = 0;
        let right2 = n;
        while (left2 < right2) {
            const m = Math.floor((left2 + right2) / 2);
            if (arr[m] <= mid) {
                left2 = m + 1;
            } else {
                right2 = m;
            }
        }
        const idx = left2; // number of elements <= mid

        // Clamped sum: sum of elements <= mid (unchanged) + mid * (count of elements > mid)
        const clampedSum = prefix[idx] + mid * (n - idx);
        const diff = Math.abs(clampedSum - target);

        // Track best: prefer smaller value on tie
        if (diff < bestDiff || (diff === bestDiff && mid < bestVal)) {
            bestDiff = diff;
            bestVal = mid;
        }

        // Adjust search range
        if (clampedSum < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }

    return bestVal;
};`,
    jsWalkthrough:
      'Input: arr = [4,9,3], target = 10\n\n' +
      'After sort: [3,4,9], prefix = [0,3,7,16]\n\n' +
      'lo=0, hi=9, bestVal=0, bestDiff=Infinity\n\n' +
      'mid=4: idx=2 (elements 3,4 <= 4)\n' +
      '  clampedSum = prefix[2] + 4*(3-2) = 7+4 = 11, diff=|11-10|=1\n' +
      '  bestVal=4, bestDiff=1, sum>target so hi=3\n\n' +
      'mid=1: idx=0 (no elements <= 1)\n' +
      '  clampedSum = 0 + 1*3 = 3, diff=7 > 1 -> not best\n' +
      '  sum<target so lo=2\n\n' +
      'mid=2: idx=0\n' +
      '  clampedSum = 0+2*3=6, diff=4 > 1 -> not best\n' +
      '  sum<target so lo=3\n\n' +
      'mid=3: idx=1 (element 3 <= 3)\n' +
      '  clampedSum = prefix[1]+3*(3-1) = 3+6=9, diff=1\n' +
      '  diff==bestDiff and 3<4 -> bestVal=3, bestDiff=1, sum<target so lo=4\n\n' +
      'lo=4 > hi=3, stop\n' +
      'Return bestVal=3',
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
    intuition:
      'BFS processes a tree level by level like peeling an onion. The last layer you peel is the deepest, so just keep track of each level\'s sum and the final one is your answer.',
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

    let queue = [root];
    let levelSum = 0;

    // BFS: process level by level
    while (queue.length > 0) {
        // Reset sum for this level
        levelSum = 0;
        const nextQueue = [];

        for (const node of queue) {
            // Add this node's value to the current level sum
            levelSum += node.val;

            // Enqueue children for the next level
            if (node.left) {
                nextQueue.push(node.left);
            }
            if (node.right) {
                nextQueue.push(node.right);
            }
        }

        // Move to the next level
        queue = nextQueue;
    }

    // levelSum now holds the sum of the last (deepest) level
    return levelSum;
};`,
    jsWalkthrough:
      'Input: root = [1,2,3,4,5,null,6,7,null,null,null,null,8]\n\n' +
      'Level 0 (root): queue=[1], levelSum=1, nextQueue=[2,3]\n' +
      'Level 1: queue=[2,3], levelSum=2+3=5, nextQueue=[4,5,6]\n' +
      'Level 2: queue=[4,5,6], levelSum=4+5+6=15, nextQueue=[7,8]\n' +
      'Level 3: queue=[7,8], levelSum=7+8=15, nextQueue=[]\n\n' +
      'queue is empty, loop ends\n' +
      'Return levelSum = 15',
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
    intuition:
      'Just like prefix sums let you compute range sums in O(1), prefix XORs let you compute range XORs in O(1). Since XOR is its own inverse (a XOR a = 0), the range XOR from L to R is simply prefix[R+1] XOR prefix[L].',
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

    // Build prefix XOR array: prefix[i] = XOR of arr[0..i-1]
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] ^ arr[i];
    }

    // For each query [l, r], XOR of range = prefix[r+1] ^ prefix[l]
    // This works because: prefix[r+1] ^ prefix[l] cancels out elements before index l
    return queries.map(([l, r]) => prefix[r + 1] ^ prefix[l]);
};`,
    jsWalkthrough:
      'Input: arr = [1,3,4,8], queries = [[0,1],[1,2],[0,3],[3,3]]\n\n' +
      'Building prefix XOR:\n' +
      '  prefix[0] = 0\n' +
      '  prefix[1] = 0^1 = 1\n' +
      '  prefix[2] = 1^3 = 2\n' +
      '  prefix[3] = 2^4 = 6\n' +
      '  prefix[4] = 6^8 = 14\n\n' +
      'Query [0,1]: prefix[2]^prefix[0] = 2^0 = 2\n' +
      'Query [1,2]: prefix[3]^prefix[1] = 6^1 = 7\n' +
      'Query [0,3]: prefix[4]^prefix[0] = 14^0 = 14\n' +
      'Query [3,3]: prefix[4]^prefix[3] = 14^6 = 8\n\n' +
      'Return [2,7,14,8]',
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
    intuition:
      'The characters already in palindromic positions do not need insertions. The minimum insertions equal the characters NOT part of the longest palindromic subsequence. Find LPS by computing LCS of the string with its reverse.',
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

    // Reverse the string to compute LCS (= LPS)
    const rev = s.split('').reverse().join('');

    // Space-optimized LCS DP using two rows
    let dp = new Array(n + 1).fill(0);

    for (let i = 1; i <= n; i++) {
        const prev = new Array(n + 1).fill(0);

        for (let j = 1; j <= n; j++) {
            if (s[i - 1] === rev[j - 1]) {
                // Characters match: extend the LCS
                prev[j] = dp[j - 1] + 1;
            } else {
                // Characters don't match: take the best of the two sub-problems
                prev[j] = Math.max(dp[j], prev[j - 1]);
            }
        }

        // Roll the rows forward
        dp = prev;
    }

    // Minimum insertions = n - LPS length
    const longestPalindromicSubsequence = dp[n];
    return n - longestPalindromicSubsequence;
};`,
    jsWalkthrough:
      'Input: s = "mbadm"\n\n' +
      'rev = "mdabm"\n' +
      'n = 5\n\n' +
      'LCS of "mbadm" and "mdabm":\n' +
      '  Characters in common (in order): "m", "a", "m" -> LPS length = 3\n\n' +
      'Actually for "mbadm":\n' +
      '  LPS = "mam" or "mdm" (length 3)\n' +
      '  LCS("mbadm", "mdabm") = 3\n\n' +
      'Minimum insertions = 5 - 3 = 2\n' +
      '(Insert "d" to get "mbdadm" ... or insert to make "mbadabm")\n\n' +
      'Simpler example: s = "zzazz" (already palindrome)\n' +
      '  LPS = 5, insertions = 5-5 = 0',
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
    intuition:
      'Think bit by bit independently. If the target bit is 1, you need at least one source bit to be 1 (one flip at most). If the target bit is 0, every source bit that is 1 must be flipped. Each bit position is a tiny independent problem.',
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

    // Check each bit position independently (up to 30 bits)
    for (let i = 0; i < 30; i++) {
        // Extract the i-th bit from each number
        const bitA = (a >> i) & 1;
        const bitB = (b >> i) & 1;
        const bitC = (c >> i) & 1;

        if (bitC === 1) {
            // Target is 1: need at least one of a or b to be 1
            // If both are 0, flip one of them (cost = 1)
            if (bitA === 0 && bitB === 0) {
                flips++;
            }
        } else {
            // Target is 0: both a and b must be 0
            // Each 1-bit in a or b needs its own flip
            flips += bitA + bitB;
        }
    }

    return flips;
};`,
    jsWalkthrough:
      'Input: a = 2 (010), b = 6 (110), c = 5 (101)\n\n' +
      'Bit 0: bitA=0, bitB=0, bitC=1 -> both are 0, need a 1 -> flips=1\n' +
      'Bit 1: bitA=1, bitB=1, bitC=0 -> both must be 0 -> flips=1+1+1=3\n' +
      'Bit 2: bitA=0, bitB=1, bitC=1 -> b is already 1 -> no flip needed\n' +
      'Bits 3-29: all zeros, bitC=0, bitA=bitB=0 -> no flips\n\n' +
      'Total flips = 3',
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
    intuition:
      'Think of it like connecting islands with bridges. You need at least n-1 cables for n computers. Any extra cables in a group can be repurposed. The answer is simply the number of disconnected groups minus one.',
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
    // Need at least n-1 cables to connect n computers
    if (connections.length < n - 1) {
        return -1;
    }

    // Union-Find: each computer starts as its own component
    const parent = Array.from({length: n}, (_, i) => i);

    const find = (x) => {
        // Path compression: flatten tree while finding root
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]]; // path halving
            x = parent[x];
        }
        return x;
    };

    let components = n;

    for (const [a, b] of connections) {
        const rootA = find(a);
        const rootB = find(b);

        if (rootA !== rootB) {
            // Merge two separate components
            parent[rootA] = rootB;
            components--;
        }
        // If rootA === rootB, this is a redundant connection (cable we can repurpose)
    }

    // We need (components - 1) operations to merge all remaining components
    return components - 1;
};`,
    jsWalkthrough:
      'Input: n = 4, connections = [[0,1],[0,2],[1,2]]\n\n' +
      'connections.length=3 >= n-1=3, so possible\n\n' +
      'parent = [0,1,2,3], components = 4\n\n' +
      '[0,1]: root0=0, root1=1 -> merge, parent[0]=1, components=3\n' +
      '[0,2]: root0=find(0)=1, root2=2 -> merge, parent[1]=2, components=2\n' +
      '[1,2]: root1=find(1)=2, root2=2 -> same root (redundant cable!)\n\n' +
      'components = 2 (computers {0,1,2} and {3})\n' +
      'We have 1 redundant cable to repurpose\n' +
      'Return components - 1 = 2 - 1 = 1',
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
    intuition:
      'Since the number only contains 6s and 9s, and 9 > 6, you want to change the leftmost 6 to a 9. The most significant digit change gives the biggest increase, just like changing the hundreds digit matters more than the ones digit.',
    approach:
      'Convert to string, find the first occurrence of 6, and replace it with 9. Changing the leftmost 6 to 9 gives the maximum increase.',
    code: `class Solution:
    def maximum69Number(self, num: int) -> int:
        s = str(num)
        s = s.replace('6', '9', 1)
        return int(s)`,
    jsCode: `var maximum69Number = function(num) {
    // Convert to string to find and replace the first '6'
    const numStr = String(num);

    // Replace only the first occurrence of '6' with '9'
    // The leftmost '6' has the highest positional value, so changing it maximizes the number
    const maximizedStr = numStr.replace('6', '9');

    return parseInt(maximizedStr);
};`,
    jsWalkthrough:
      'Input: num = 9669\n\n' +
      'numStr = "9669"\n\n' +
      'replace first "6" -> "9969"\n\n' +
      'parseInt("9969") = 9969\n\n' +
      'Return 9969\n\n' +
      '(Changing position 1 from 6->9 adds 300 to the number,\n' +
      ' vs changing position 2 from 6->9 which would only add 30)',
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
    intuition:
      'This is the classic jump game / interval covering problem in disguise. Convert taps to intervals, then greedily extend your reach as far as possible at each step, like hopping across stepping stones to cover a stream.',
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
    // Convert each tap to an interval and record the farthest right reach from each left endpoint
    const maxReach = new Array(n + 1).fill(0);

    for (let i = 0; i <= n; i++) {
        const left  = Math.max(0, i - ranges[i]);
        const right = Math.min(n, i + ranges[i]);

        // From position 'left', this tap can reach as far as 'right'
        maxReach[left] = Math.max(maxReach[left], right);
    }

    // Greedy jump game: extend coverage as far as possible at each step
    let taps = 0;
    let curEnd = 0; // current coverage boundary
    let far = 0;    // farthest point reachable from within [0, curEnd]

    for (let i = 0; i <= n; i++) {
        if (i > far) {
            // Gap in coverage — garden cannot be fully watered
            return -1;
        }

        // Update farthest reachable from this position
        far = Math.max(far, maxReach[i]);

        // When we reach the end of current coverage, open another tap
        if (i === curEnd && i < n) {
            taps++;
            curEnd = far;
        }
    }

    return taps;
};`,
    jsWalkthrough:
      'Input: n = 5, ranges = [3,4,1,1,0,0]\n\n' +
      'Build maxReach:\n' +
      '  i=0: left=0, right=3 -> maxReach[0]=3\n' +
      '  i=1: left=0, right=5 -> maxReach[0]=max(3,5)=5\n' +
      '  i=2: left=1, right=3 -> maxReach[1]=3\n' +
      '  i=3: left=2, right=4 -> maxReach[2]=4\n' +
      '  i=4: left=4, right=4 -> maxReach[4]=4\n' +
      '  i=5: left=5, right=5 -> maxReach[5]=5\n\n' +
      'maxReach = [5,3,4,0,4,5]\n\n' +
      'taps=0, curEnd=0, far=0\n' +
      'i=0: far=max(0,5)=5; i==curEnd and i<5 -> taps=1, curEnd=5\n' +
      'i=1..5: i<=far=5, garden covered\n\n' +
      'Return taps = 1',
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
    intuition:
      'All cells on the same diagonal share the same row-minus-column value. Group them by this key, sort each group independently, and put them back. It is like organizing books on diagonal shelves.',
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
    const m = mat.length;
    const n = mat[0].length;

    // Collect values for each diagonal (cells on same diagonal share i-j value)
    const diags = new Map();
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const diagonalKey = i - j;
            if (!diags.has(diagonalKey)) {
                diags.set(diagonalKey, []);
            }
            diags.get(diagonalKey).push(mat[i][j]);
        }
    }

    // Sort each diagonal independently in ascending order
    for (const [key, arr] of diags) {
        arr.sort((a, b) => a - b);
    }

    // Write sorted values back to the matrix in row-major order
    const readIdx = new Map(); // tracks how far we've read into each diagonal
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const diagonalKey = i - j;
            const pos = readIdx.get(diagonalKey) || 0;
            mat[i][j] = diags.get(diagonalKey)[pos];
            readIdx.set(diagonalKey, pos + 1);
        }
    }

    return mat;
};`,
    jsWalkthrough:
      'Input: mat = [[3,3,1,1],[2,2,1,2],[1,1,1,2]]\n\n' +
      'Collect diagonals by key (i-j):\n' +
      '  key=0 (main diag): [3,2,1]\n' +
      '  key=1: [2,1,1]\n' +
      '  key=2: [1,1]\n' +
      '  key=3: [1]\n' +
      '  key=-1: [3,1]\n' +
      '  key=-2: [1,2]\n' +
      '  key=-3: [2]\n\n' +
      'After sorting each diagonal:\n' +
      '  key=0: [1,2,3]; key=1: [1,1,2]; key=2: [1,1]; etc.\n\n' +
      'Write back in row-major order:\n' +
      '  (0,0) key=0 pos=0 -> 1\n' +
      '  (0,1) key=-1 pos=0 -> 1 (from sorted [-1] diag)\n' +
      '  ... etc.\n\n' +
      'Result: [[1,1,1,1],[1,2,2,2],[1,2,3,3]]',
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
    intuition:
      'Floyd-Warshall finds shortest paths between all pairs of cities, like building a complete distance chart. Then for each city, just count how many others are within the threshold and pick the city with the fewest neighbors.',
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
    // Initialize distance matrix: Infinity everywhere except self-loops = 0
    const dist = Array.from({length: n}, () => new Array(n).fill(Infinity));
    for (let i = 0; i < n; i++) {
        dist[i][i] = 0;
    }

    // Seed direct edge weights
    for (const [u, v, w] of edges) {
        dist[u][v] = w;
        dist[v][u] = w;
    }

    // Floyd-Warshall: compute all-pairs shortest paths
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const throughK = dist[i][k] + dist[k][j];
                if (throughK < dist[i][j]) {
                    dist[i][j] = throughK;
                }
            }
        }
    }

    // For each city, count reachable cities within distanceThreshold
    let bestCity = -1;
    let bestCount = Infinity;

    for (let i = 0; i < n; i++) {
        let reachableCount = 0;
        for (let j = 0; j < n; j++) {
            if (j !== i && dist[i][j] <= distanceThreshold) {
                reachableCount++;
            }
        }

        // Prefer smaller count; on tie prefer larger city number (use <=)
        if (reachableCount <= bestCount) {
            bestCount = reachableCount;
            bestCity = i;
        }
    }

    return bestCity;
};`,
    jsWalkthrough:
      'Input: n=4, edges=[[0,1,3],[1,2,1],[1,3,4],[2,3,1]], distanceThreshold=4\n\n' +
      'After seeding edges:\n' +
      '  dist[0][1]=3, dist[1][2]=1, dist[1][3]=4, dist[2][3]=1\n\n' +
      'After Floyd-Warshall:\n' +
      '  dist[0][2] = min(Inf, dist[0][1]+dist[1][2]) = 3+1 = 4\n' +
      '  dist[0][3] = min(Inf, 3+4=7, 4+1=5) = 5\n' +
      '  dist[1][3] = min(4, 1+1=2) = 2\n\n' +
      'Count reachable within threshold=4:\n' +
      '  City 0: dist to 1=3<=4, dist to 2=4<=4, dist to 3=5>4 -> count=2\n' +
      '  City 1: dist to 0=3, 2=1, 3=2, all <=4 -> count=3\n' +
      '  City 2: dist to 0=4, 1=1, 3=1, all <=4 -> count=3\n' +
      '  City 3: dist to 1=2<=4, dist to 2=1<=4, dist to 0=5>4 -> count=2\n\n' +
      'bestCount=2, cities 0 and 3 tie -> last one wins (<=), return 3',
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
    intuition:
      'Think of it as partitioning an array into exactly d segments, where each segment costs its maximum value. DP tries all possible places to split, and for each split tracks the running maximum to find the optimal assignment of jobs to days.',
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

    // Need at least one job per day
    if (n < d) {
        return -1;
    }

    // dp[i][k] = min difficulty to schedule first i jobs in k days
    const dp = Array.from({length: n + 1}, () => new Array(d + 1).fill(Infinity));
    dp[0][0] = 0; // base case: 0 jobs in 0 days

    for (let i = 1; i <= n; i++) {
        for (let k = 1; k <= Math.min(i, d); k++) {
            // Try all split points: last day covers jobs j..i
            let maxDiffLastDay = 0;

            for (let j = i; j >= k; j--) {
                // Expand the last day's job range by including job j
                maxDiffLastDay = Math.max(maxDiffLastDay, jobDifficulty[j - 1]);

                // Cost = difficulty of last day + optimal cost of previous days
                const totalCost = dp[j - 1][k - 1] + maxDiffLastDay;
                dp[i][k] = Math.min(dp[i][k], totalCost);
            }
        }
    }

    return dp[n][d];
};`,
    jsWalkthrough:
      'Input: jobDifficulty = [6,5,4,3,2,1], d = 2\n\n' +
      'n=6, dp[0][0]=0\n\n' +
      'Fill dp[i][2] (2 days):\n' +
      '  dp[6][2]: try j=6..2\n' +
      '    j=6: maxD=1, dp[5][1]+1\n' +
      '    j=5: maxD=max(1,2)=2, dp[4][1]+2\n' +
      '    j=4: maxD=max(2,3)=3, dp[3][1]+3\n' +
      '    j=3: maxD=max(3,4)=4, dp[2][1]+4\n' +
      '    j=2: maxD=max(4,5)=5, dp[1][1]+5\n\n' +
      'dp[1][1] = max(job[0])=6, dp[2][1]=max(6,5)=6 ... dp[5][1]=6 (day 1 always starts with job[0]=6)\n\n' +
      'Best split: dp[5][1]=6, last day=[1], diff=1 -> dp[6][2]=6+1=7\n\n' +
      'Return dp[6][2] = 7',
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
    intuition:
      'Counting soldiers per row (sum of 1s) gives each row a strength score. Sort by this score, breaking ties by row index, and the first k entries are the weakest rows. It is like ranking teams by their win count.',
    approach:
      'Count soldiers in each row (sum of 1s or binary search for the first 0). Sort rows by (soldier_count, row_index) and return the first k indices.',
    code: `class Solution:
    def kWeakestRows(self, mat: list[list[int]], k: int) -> list[int]:
        strength = [(sum(row), i) for i, row in enumerate(mat)]
        strength.sort()
        return [i for _, i in strength[:k]]`,
    jsCode: `var kWeakestRows = function(mat, k) {
    // Compute strength (soldier count) for each row, paired with the row index
    const strength = mat.map((row, rowIndex) => {
        const soldierCount = row.reduce((sum, cell) => sum + cell, 0);
        return [soldierCount, rowIndex];
    });

    // Sort by soldier count ascending; on tie, sort by row index ascending
    strength.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    // Return the indices of the k weakest rows
    return strength.slice(0, k).map(([soldierCount, rowIndex]) => rowIndex);
};`,
    jsWalkthrough:
      'Input: mat = [[1,1,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,0,0,0],[1,1,1,1,1]], k = 3\n\n' +
      'Compute strengths:\n' +
      '  Row 0: sum=2, index=0 -> [2,0]\n' +
      '  Row 1: sum=4, index=1 -> [4,1]\n' +
      '  Row 2: sum=1, index=2 -> [1,2]\n' +
      '  Row 3: sum=2, index=3 -> [2,3]\n' +
      '  Row 4: sum=5, index=4 -> [5,4]\n\n' +
      'After sort: [[1,2],[2,0],[2,3],[4,1],[5,4]]\n\n' +
      'Take k=3: [[1,2],[2,0],[2,3]]\n' +
      'Extract indices: [2, 0, 3]\n\n' +
      'Return [2, 0, 3]',
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
    intuition:
      'To minimize the number of distinct values removed, always remove the most common values first. It is like clearing clutter: removing the biggest pile first gets you to your goal fastest.',
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
    // Count frequency of each element
    const freq = new Map();
    for (const x of arr) {
        freq.set(x, (freq.get(x) || 0) + 1);
    }

    // Sort frequencies descending: remove most common values first
    const counts = [...freq.values()].sort((a, b) => b - a);

    let removed = 0;
    const half = Math.floor(arr.length / 2);

    // Greedily remove the most frequent elements until we've removed at least half
    for (let i = 0; i < counts.length; i++) {
        removed += counts[i];

        if (removed >= half) {
            // i+1 elements in the set is sufficient
            return i + 1;
        }
    }

    return counts.length;
};`,
    jsWalkthrough:
      'Input: arr = [3,3,3,3,5,5,5,2,2,7]\n\n' +
      'Frequencies: {3:4, 5:3, 2:2, 7:1}\n' +
      'Sorted descending: [4, 3, 2, 1]\n' +
      'half = floor(10/2) = 5\n\n' +
      'i=0: removed = 4 (removed all 3s), 4 < 5 -> continue\n' +
      'i=1: removed = 4+3 = 7, 7 >= 5 -> return i+1 = 2\n\n' +
      'Return 2',
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
    intuition:
      'Cutting any edge splits the tree into two parts. The product of their sums is maximized when the two parts are as close to equal as possible. DFS computes all subtree sums, and each one represents a possible split.',
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

    // Collect all subtree sums via DFS
    const subtreeSums = [];

    const dfs = (node) => {
        if (!node) return 0;

        const leftSum  = dfs(node.left);
        const rightSum = dfs(node.right);
        const subtreeSum = node.val + leftSum + rightSum;

        subtreeSums.push(subtreeSum);
        return subtreeSum;
    };

    // Total tree sum = subtree sum at root
    const total = dfs(root);

    // For each possible split (cutting the edge above each subtree),
    // compute the product of the two resulting sums
    let maxProd = 0n;

    for (const subtreeSum of subtreeSums) {
        const otherPartSum = total - subtreeSum;
        const product = BigInt(subtreeSum) * BigInt(otherPartSum);

        if (product > maxProd) {
            maxProd = product;
        }
    }

    return Number(maxProd % MOD);
};`,
    jsWalkthrough:
      'Input: root = [1,2,3,4,5,6]\n\n' +
      'DFS computes subtree sums bottom-up:\n' +
      '  Node 4: sum=4\n' +
      '  Node 5: sum=5\n' +
      '  Node 2: sum=2+4+5=11\n' +
      '  Node 6: sum=6\n' +
      '  Node 3: sum=3+6=9\n' +
      '  Node 1 (root): sum=1+11+9=21\n\n' +
      'subtreeSums = [4, 5, 11, 6, 9, 21]\n' +
      'total = 21\n\n' +
      'Products (subtree * other):\n' +
      '  4 * 17 = 68\n' +
      '  5 * 16 = 80\n' +
      '  11 * 10 = 110  <- maximum!\n' +
      '  6 * 15 = 90\n' +
      '  9 * 12 = 108\n\n' +
      'Return 110 % MOD = 110',
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
    intuition:
      'Think of it as standing on a tall building and looking for shorter buildings you can jump to. From each position, you can only jump to strictly shorter bars within distance d. Memoized DFS avoids recomputing paths from positions you have visited.',
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

    // dp(i) = max indices visitable starting from index i
    const dp = (i) => {
        // Return cached result if already computed
        if (memo[i] !== -1) return memo[i];

        let best = 1; // can always visit at least index i itself

        // Try jumping left (dir=-1) and right (dir=1)
        for (const dir of [-1, 1]) {
            for (let step = 1; step <= d; step++) {
                const nxt = i + dir * step;

                // Stop if out of bounds or next bar is not strictly shorter
                if (nxt < 0 || nxt >= n || arr[nxt] >= arr[i]) {
                    break;
                }

                // Jump to nxt and explore from there
                best = Math.max(best, 1 + dp(nxt));
            }
        }

        memo[i] = best;
        return best;
    };

    // Try starting from every index, return the maximum
    let result = 0;
    for (let i = 0; i < n; i++) {
        result = Math.max(result, dp(i));
    }
    return result;
};`,
    jsWalkthrough:
      'Input: arr = [6,4,14,6,8,13,9,7,10,6,12], d = 2\n\n' +
      'dp(0): arr[0]=6\n' +
      '  right step=1: arr[1]=4 < 6 -> dp(1)\n' +
      '    dp(1): arr[1]=4\n' +
      '      right step=1: arr[2]=14 >= 4 -> stop\n' +
      '      left step=1: arr[0]=6 >= 4 -> stop\n' +
      '      dp(1) = 1\n' +
      '  right step=2: arr[2]=14 >= 6 -> stop\n' +
      '  left: out of bounds\n' +
      '  dp(0) = max(1, 1+dp(1)) = max(1,2) = 2\n\n' +
      'dp(5): arr[5]=13 (the tallest in range)\n' +
      '  right step=1: arr[6]=9 < 13 -> dp(6)=...\n' +
      '  right step=2: arr[7]=7 < 13 -> dp(7)=...\n' +
      '  left step=1: arr[4]=8 < 13 -> dp(4)=...\n' +
      '  left step=2: arr[3]=6 < 13 -> dp(3)=...\n' +
      '  dp(5) = 4 (maximum chain)\n\n' +
      'Return 4',
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
    intuition:
      'This is pure simulation: even numbers get halved and odd numbers get decremented. Halving is the fast operation that drives the number down exponentially, while decrementing just makes an odd number even so it can be halved next.',
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
            // Even: divide by 2
            num = Math.floor(num / 2);
        } else {
            // Odd: subtract 1
            num--;
        }

        steps++;
    }

    return steps;
};`,
    jsWalkthrough:
      'Input: num = 14\n\n' +
      'steps=0\n\n' +
      'num=14 (even): num=7, steps=1\n' +
      'num=7 (odd):  num=6, steps=2\n' +
      'num=6 (even): num=3, steps=3\n' +
      'num=3 (odd):  num=2, steps=4\n' +
      'num=2 (even): num=1, steps=5\n' +
      'num=1 (odd):  num=0, steps=6\n\n' +
      'num=0, loop ends\n' +
      'Return 6',
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
    intuition:
      'This is a shortest path problem on a graph where nodes connect to their neighbors AND all positions with the same value. BFS finds the shortest path, and clearing same-value groups after visiting them prevents the algorithm from revisiting thousands of nodes.',
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

    // Build value -> list of indices mapping for same-value jumps
    const graph = new Map();
    for (let i = 0; i < n; i++) {
        if (!graph.has(arr[i])) {
            graph.set(arr[i], []);
        }
        graph.get(arr[i]).push(i);
    }

    const visited = new Array(n).fill(false);
    visited[0] = true;

    let queue = [0];
    let steps = 0;

    while (queue.length > 0) {
        steps++;
        const nextQueue = [];

        for (const i of queue) {
            // Neighbors: adjacent indices + all indices with the same value
            const sameValueIndices = graph.get(arr[i]) || [];
            const allNeighbors = [i - 1, i + 1, ...sameValueIndices];

            for (const nxt of allNeighbors) {
                if (nxt >= 0 && nxt < n && !visited[nxt]) {
                    if (nxt === n - 1) {
                        return steps;
                    }
                    visited[nxt] = true;
                    nextQueue.push(nxt);
                }
            }

            // Clear this value group to avoid O(n^2) re-processing
            graph.set(arr[i], []);
        }

        queue = nextQueue;
    }

    return -1;
};`,
    jsWalkthrough:
      'Input: arr = [100,-23,-23,404,100,23,23,23,3,404], n=10\n\n' +
      'graph: {100:[0,4], -23:[1,2], 404:[3,9], 23:[5,6,7], 3:[8]}\n\n' +
      'Step 0: queue=[0], visited[0]=true\n\n' +
      'Step 1: from index 0\n' +
      '  neighbors: [-1(invalid), 1, 0(visited), 4] -> visit 1 and 4\n' +
      '  graph[100]=[] (cleared)\n' +
      '  nxt=4=n-1? No (n-1=9). queue=[1,4]\n\n' +
      'Step 2: from index 1\n' +
      '  neighbors: [0(visited), 2, 1(visited), 2] -> visit 2\n' +
      '  from index 4:\n' +
      '  neighbors: [3, 5, already cleared 100-group] -> visit 3 and 5\n' +
      '  nxt=3: arr[3]=404, same as arr[9] -> also visit 9\n' +
      '  nxt=9=n-1 -> return steps=3',
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
    intuition:
      'Count how many of each letter s needs that t does not have enough of. Each deficit means one character in t must be replaced. It is like comparing two recipes and counting the missing ingredients.',
    approach:
      'Count character frequencies in both strings. The answer is the sum of excess characters in t that s does not need, which equals the sum of max(0, count_s[c] - count_t[c]) for all characters c.',
    code: `from collections import Counter

class Solution:
    def minSteps(self, s: str, t: str) -> int:
        cs = Counter(s)
        ct = Counter(t)
        return sum(max(0, cs[c] - ct[c]) for c in cs)`,
    jsCode: `var minSteps = function(s, t) {
    // Count character frequencies using arrays indexed by char code
    const countS = new Array(26).fill(0);
    const countT = new Array(26).fill(0);

    for (let i = 0; i < s.length; i++) {
        countS[s.charCodeAt(i) - 97]++;
        countT[t.charCodeAt(i) - 97]++;
    }

    // Sum up the deficit: how many more of each char s needs vs what t has
    let result = 0;
    for (let i = 0; i < 26; i++) {
        const deficit = countS[i] - countT[i];
        if (deficit > 0) {
            result += deficit;
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Input: s = "bab", t = "aba"\n\n' +
      'countS: {a:1, b:2}\n' +
      'countT: {a:2, b:1}\n\n' +
      'For each letter:\n' +
      '  a: deficit = countS[a]-countT[a] = 1-2 = -1 -> max(0,-1)=0\n' +
      '  b: deficit = countS[b]-countT[b] = 2-1 = 1 -> max(0,1)=1\n' +
      '  all other letters: 0\n\n' +
      'result = 0 + 1 = 1\n\n' +
      'Return 1 (replace one "a" in t with "b" -> "bba" is anagram of "bab")',
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
    intuition:
      'Keep tweets in sorted lists by name. For queries, divide the time range into chunks based on frequency and use binary search to count tweets per chunk. It is like counting events in time buckets.',
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
    // Determine the chunk size in seconds based on frequency
    const chunkSize = {minute: 60, hour: 3600, day: 86400}[freq];
    const times = this.tweets.get(tweetName) || [];
    const result = [];

    let t = startTime;
    while (t <= endTime) {
        // Each chunk covers [t, min(t+chunkSize, endTime+1))
        const chunkEnd = Math.min(t + chunkSize, endTime + 1);

        // Binary search for first index >= t
        let lo = 0;
        let hi = times.length;
        while (lo < hi) {
            const m = Math.floor((lo + hi) / 2);
            if (times[m] < t) {
                lo = m + 1;
            } else {
                hi = m;
            }
        }
        const startIdx = lo;

        // Binary search for first index >= chunkEnd
        lo = 0;
        hi = times.length;
        while (lo < hi) {
            const m = Math.floor((lo + hi) / 2);
            if (times[m] < chunkEnd) {
                lo = m + 1;
            } else {
                hi = m;
            }
        }
        const endIdx = lo;

        // Count of tweets in this chunk
        result.push(endIdx - startIdx);
        t += chunkSize;
    }

    return result;
};`,
    jsWalkthrough:
      'Input: recordTweet("tweet3",0), recordTweet("tweet3",60), recordTweet("tweet3",10)\n' +
      'tweets["tweet3"] = [0, 10, 60] (sorted via binary-search insertion)\n\n' +
      'getTweetCountsPerFrequency("minute","tweet3",0,59):\n' +
      '  chunkSize=60, t=0, chunkEnd=min(0+60,60)=60\n' +
      '  Binary search for first idx >= 0: startIdx=0\n' +
      '  Binary search for first idx >= 60: endIdx=2 (times[2]=60 not < 60)\n' +
      '  Count in chunk: 2-0 = 2\n' +
      '  t=0+60=60 > endTime=59, stop\n\n' +
      'Return [2]',
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
    intuition:
      'The matrix is sorted in both directions, creating a staircase boundary between non-negatives and negatives. Starting from the top-right corner, you can walk this staircase in O(m+n) time, counting all negatives below each step.',
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
    const m = grid.length;
    const n = grid[0].length;

    let count = 0;
    let row = 0;
    let col = n - 1; // start at top-right corner

    while (row < m && col >= 0) {
        if (grid[row][col] < 0) {
            // This cell and all cells below it in this column are negative
            count += m - row;
            col--; // move left to check earlier column
        } else {
            // This cell is non-negative; move down to find negatives
            row++;
        }
    }

    return count;
};`,
    jsWalkthrough:
      'Input: grid = [[4,3,2,-1],[3,2,1,-1],[1,1,-1,-2],[-1,-1,-2,-3]]\n\n' +
      'Start: row=0, col=3\n\n' +
      'grid[0][3]=-1 < 0: count+=m-0=4, col=2\n' +
      'grid[0][2]=2 >= 0: row=1\n' +
      'grid[1][2]=1 >= 0: row=2\n' +
      'grid[2][2]=-1 < 0: count+=m-2=2, col=1 (count=6)\n' +
      'grid[2][1]=1 >= 0: row=3\n' +
      'grid[3][1]=-1 < 0: count+=m-3=1, col=0 (count=7)\n' +
      'grid[3][0]=-1 < 0: count+=m-3=1, col=-1 (count=8)\n\n' +
      'col < 0, loop ends\n' +
      'Return 8',
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
    intuition:
      'Prefix products give O(1) range product queries, just like prefix sums give O(1) range sum queries. The twist is zeros: when a zero appears, it wipes out all previous products, so we reset the prefix array.',
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
        // Zero wipes all prior products; reset prefix to start fresh
        this.prefix = [1];
    } else {
        // Extend prefix: new value = last prefix * num
        const lastProduct = this.prefix[this.prefix.length - 1];
        this.prefix.push(lastProduct * num);
    }
};

ProductOfNumbers.prototype.getProduct = function(k) {
    if (k >= this.prefix.length) {
        // The range includes a zero that was added earlier
        return 0;
    }

    // Product of last k elements = prefix[end] / prefix[end - k]
    const end = this.prefix.length - 1;
    return Math.floor(this.prefix[end] / this.prefix[end - k]);
};`,
    jsWalkthrough:
      'Input: add(3), add(0), add(2), getProduct(2), add(5), getProduct(3)\n\n' +
      'add(3): prefix=[1,3]\n' +
      'add(0): reset! prefix=[1]\n' +
      'add(2): prefix=[1,2]\n\n' +
      'getProduct(2): k=2 >= prefix.length=2 -> return 0\n' +
      '  (because a 0 was added within the last 2 elements)\n\n' +
      'add(5): prefix=[1,2,10]\n\n' +
      'getProduct(3): k=3 >= prefix.length=3 -> return 0\n' +
      '  (0 still falls within the last 3 elements)\n\n' +
      'getProduct(2): k=2 < prefix.length=3\n' +
      '  end=2, prefix[2]/prefix[0] = 10/1 = 10 -> return 10\n' +
      '  (product of last 2 numbers: 2*5=10)',
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
    intuition:
      'Sort by a custom key that pairs the bit count with the value itself. Python tuples compare lexicographically, so ties in bit count are broken by the value, exactly as required.',
    approach:
      'Sort the array using a custom key that returns (popcount, value). Python\'s bin(x).count("1") gives the number of 1 bits.',
    code: `class Solution:
    def sortByBits(self, arr: list[int]) -> list[int]:
        return sorted(arr, key=lambda x: (bin(x).count('1'), x))`,
    jsCode: `var sortByBits = function(arr) {
    // Count the number of 1-bits in a number
    const bitCount = (n) => {
        let count = 0;
        while (n > 0) {
            count += n & 1; // add 1 if least significant bit is set
            n >>= 1;         // shift right to check next bit
        }
        return count;
    };

    // Sort: primary key = bit count, secondary key = value itself (tie-breaking)
    return arr.sort((a, b) => bitCount(a) - bitCount(b) || a - b);
};`,
    jsWalkthrough:
      'Input: arr = [0,1,2,3,4,5,6,7,8]\n\n' +
      'Bit counts:\n' +
      '  0 -> 0 bits\n' +
      '  1 -> 1 bit (001)\n' +
      '  2 -> 1 bit (010)\n' +
      '  3 -> 2 bits (011)\n' +
      '  4 -> 1 bit (100)\n' +
      '  5 -> 2 bits (101)\n' +
      '  6 -> 2 bits (110)\n' +
      '  7 -> 3 bits (111)\n' +
      '  8 -> 1 bit (1000)\n\n' +
      'Sort by (bitCount, value):\n' +
      '  0 bits: [0]\n' +
      '  1 bit:  [1,2,4,8]\n' +
      '  2 bits: [3,5,6]\n' +
      '  3 bits: [7]\n\n' +
      'Return [0,1,2,4,8,3,5,6,7]',
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
    intuition:
      'For each position, track the last occurrence of a, b, and c. The number of valid substrings ending here equals one plus the minimum of these three positions, since any start from 0 to that minimum includes all three characters.',
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
    // Track last seen index of each character (initialized to -1 = not seen)
    const last = {a: -1, b: -1, c: -1};
    let count = 0;

    for (let i = 0; i < s.length; i++) {
        // Update last seen position of current character
        last[s[i]] = i;

        // The earliest valid start for a substring ending at i is:
        //   min(last.a, last.b, last.c) — all three must have been seen
        // Any start from index 0 to that minimum gives a valid substring
        const earliestValidStart = Math.min(last.a, last.b, last.c);
        count += 1 + earliestValidStart;
    }

    return count;
};`,
    jsWalkthrough:
      'Input: s = "abcabc"\n\n' +
      'last = {a:-1, b:-1, c:-1}, count=0\n\n' +
      'i=0, s[0]="a": last.a=0, min(-1→now 0, -1, -1)=-1, count+=1+(-1)=0\n' +
      'i=1, s[1]="b": last.b=1, min(0,1,-1)=-1, count+=0\n' +
      'i=2, s[2]="c": last.c=2, min(0,1,2)=0, count+=1+0=1 (count=1)\n' +
      'i=3, s[3]="a": last.a=3, min(3,1,2)=1, count+=1+1=2 (count=3)\n' +
      'i=4, s[4]="b": last.b=4, min(3,4,2)=2, count+=1+2=3 (count=6)\n' +
      'i=5, s[5]="c": last.c=5, min(3,4,5)=3, count+=1+3=4 (count=10)\n\n' +
      'Return 10',
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
    intuition:
      'A valid binary tree has exactly one root (a node nobody points to) and every node reachable from it. Find the root by elimination, then BFS to verify all n nodes are visited exactly once with no cycles.',
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
    // Find all nodes that appear as children (they have a parent)
    const children = new Set();
    for (let i = 0; i < n; i++) {
        if (leftChild[i] !== -1) children.add(leftChild[i]);
        if (rightChild[i] !== -1) children.add(rightChild[i]);
    }

    // Root = the node with no parent
    const roots = [];
    for (let i = 0; i < n; i++) {
        if (!children.has(i)) {
            roots.push(i);
        }
    }

    // Must have exactly one root
    if (roots.length !== 1) {
        return false;
    }

    // BFS from the root, checking for cycles and that all n nodes are reachable
    const visited = new Set();
    const queue = [roots[0]];

    while (queue.length > 0) {
        const node = queue.shift();

        // Cycle detected: already visited this node
        if (visited.has(node)) {
            return false;
        }

        visited.add(node);

        if (leftChild[node] !== -1) queue.push(leftChild[node]);
        if (rightChild[node] !== -1) queue.push(rightChild[node]);
    }

    // All n nodes must be reachable from the root
    return visited.size === n;
};`,
    jsWalkthrough:
      'Input: n=4, leftChild=[1,-1,3,-1], rightChild=[2,-1,-1,-1]\n\n' +
      'Children set: {1,2,3} (node 1 is left of 0, node 2 is right of 0, node 3 is left of 2)\n\n' +
      'Roots (nodes not in children): node 0 only -> roots=[0] -> valid\n\n' +
      'BFS from 0:\n' +
      '  Dequeue 0: visited={0}, enqueue left=1, right=2\n' +
      '  Dequeue 1: visited={0,1}, leftChild[1]=-1, rightChild[1]=-1\n' +
      '  Dequeue 2: visited={0,1,2}, enqueue left=3\n' +
      '  Dequeue 3: visited={0,1,2,3}, no children\n\n' +
      'visited.size=4 === n=4 -> return true',
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
    intuition:
      'In a sorted copy of the array, each value\'s first-occurrence index tells you exactly how many elements are smaller. Build a rank lookup table and map each original element to its rank.',
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
    // Sort a copy of the array
    const sorted = [...nums].sort((a, b) => a - b);

    // In the sorted array, the first occurrence index of a value = count of smaller values
    const rank = new Map();
    for (let i = 0; i < sorted.length; i++) {
        // Only record the first occurrence (earlier indices = fewer smaller elements)
        if (!rank.has(sorted[i])) {
            rank.set(sorted[i], i);
        }
    }

    // Map each original element to its rank (count of smaller elements)
    return nums.map(num => rank.get(num));
};`,
    jsWalkthrough:
      'Input: nums = [8,1,2,2,3]\n\n' +
      'sorted = [1,2,2,3,8]\n\n' +
      'Build rank map (first occurrence index only):\n' +
      '  sorted[0]=1 -> rank[1]=0\n' +
      '  sorted[1]=2 -> rank[2]=1\n' +
      '  sorted[2]=2 -> already in map, skip\n' +
      '  sorted[3]=3 -> rank[3]=3\n' +
      '  sorted[4]=8 -> rank[8]=4\n\n' +
      'Map original nums:\n' +
      '  nums[0]=8 -> rank[8]=4\n' +
      '  nums[1]=1 -> rank[1]=0\n' +
      '  nums[2]=2 -> rank[2]=1\n' +
      '  nums[3]=2 -> rank[2]=1\n' +
      '  nums[4]=3 -> rank[3]=3\n\n' +
      'Return [4,0,1,1,3]',
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
    intuition:
      'Try starting the pattern match from every tree node. For each starting point, walk down the tree following the linked list. If you reach the end of the list, you found a match. It is like searching for a word in multiple paragraphs.',
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
    // match: check if linked list starting at lst matches a downward path from tree node
    const match = (lst, tree) => {
        // Reached end of list — all characters matched successfully
        if (!lst) return true;

        // Tree ran out before list — no match
        if (!tree) return false;

        // Values must match to continue
        if (lst.val !== tree.val) return false;

        // Try continuing down left or right child
        return match(lst.next, tree.left) || match(lst.next, tree.right);
    };

    if (!root) return false;

    // Try starting the match from the current root node,
    // or recursively try the left and right subtrees
    return match(head, root) || isSubPath(head, root.left) || isSubPath(head, root.right);
};`,
    jsWalkthrough:
      'Input: head = [4,2,8], root = [1,4,4,null,2,2,null,1,null,6,8]\n\n' +
      'isSubPath(head=[4,2,8], root=1):\n' +
      '  match([4,2,8], node=1): 4 != 1 -> false\n' +
      '  isSubPath(head, root.left=4):\n' +
      '    match([4,2,8], node=4): 4==4\n' +
      '      match([2,8], node.left=null): false\n' +
      '      match([2,8], node.right=2): 2==2\n' +
      '        match([8], node.left=1): 8!=1 -> false\n' +
      '        match([8], node.right=null): false\n' +
      '      -> false\n' +
      '    isSubPath(head, 4.left=2):\n' +
      '      match([4,2,8], node=2): 4!=2 -> false\n' +
      '      isSubPath(head, 2.children)...\n' +
      '  isSubPath(head, root.right=4):\n' +
      '    match([4,2,8], node=4): 4==4\n' +
      '      match([2,8], node.left=2): 2==2\n' +
      '        match([8], node.left=null): false\n' +
      '        match([8], node.right=8): 8==8\n' +
      '          match(null, ...): true!\n' +
      '    -> true\n\n' +
      'Return true',
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
    intuition:
      'Post-order traversal lets you validate BST properties bottom-up. Each node reports its min, max, sum, and whether its subtree is a valid BST. Only when all conditions are met do you update the global maximum sum.',
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

    // Returns [isBST, minValue, maxValue, subtreeSum]
    const dfs = (node) => {
        // Null node is a valid BST with neutral min/max and sum 0
        if (!node) {
            return [true, Infinity, -Infinity, 0];
        }

        const [leftIsBst,  leftMin,  leftMax,  leftSum]  = dfs(node.left);
        const [rightIsBst, rightMin, rightMax, rightSum] = dfs(node.right);

        // Check BST property: left subtree must be valid BST with max < node.val,
        // right subtree must be valid BST with min > node.val
        const isCurrentBst = leftIsBst && rightIsBst &&
                              leftMax < node.val && node.val < rightMin;

        if (isCurrentBst) {
            const subtreeSum = leftSum + rightSum + node.val;

            // Update global max if this BST has a larger sum
            ans = Math.max(ans, subtreeSum);

            return [
                true,
                Math.min(leftMin, node.val),  // smallest value in this subtree
                Math.max(rightMax, node.val), // largest value in this subtree
                subtreeSum
            ];
        }

        // Not a BST — propagate failure upward
        return [false, 0, 0, 0];
    };

    dfs(root);
    return ans;
};`,
    jsWalkthrough:
      'Input: root = [1,4,3,2,4,2,5,null,null,null,null,null,null,4,6]\n\n' +
      'Focus on subtree rooted at 3 (right child of root):\n' +
      '  Left child 2: leaf -> [true, 2, 2, 2]\n' +
      '  Right child 5:\n' +
      '    Left child 4: leaf -> [true, 4, 4, 4]\n' +
      '    Right child 6: leaf -> [true, 6, 6, 6]\n' +
      '    Node 5: leftMax=4 < 5 < rightMin=6 -> BST!\n' +
      '      sum=4+6+5=15, return [true, 4, 6, 15]\n' +
      '  Node 3: leftMax=2 < 3 < rightMin=4 -> BST!\n' +
      '    sum=2+15+3=20, ans=20, return [true, 2, 6, 20]\n\n' +
      'Root node 1: rightMin=2 > 1 but leftMax=4 (left subtree of 1)?\n' +
      '  Left subtree of 1 has max >= 4 > 1 -> not BST at root\n\n' +
      'Return ans = 20',
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
    intuition:
      'Instead of incrementing k elements every time (O(k)), store the increment lazily at position k-1. When popping, cascade the lazy increment down to the next element. This makes all three operations O(1).',
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

    // Include any lazy increment accumulated at this index
    const val = this.stack.pop() + this.inc[idx];

    // Cascade the lazy increment down to the element below
    if (idx > 0) {
        this.inc[idx - 1] += this.inc[idx];
    }

    this.inc.pop();
    return val;
};

CustomStack.prototype.increment = function(k, val) {
    // Store increment lazily at the top of the affected range
    const idx = Math.min(k, this.stack.length) - 1;

    if (idx >= 0) {
        this.inc[idx] += val;
    }
};`,
    jsWalkthrough:
      'Input: CustomStack(3), push(1), push(2), pop(), push(2), push(3), push(4), increment(5,100), increment(2,100), pop(), pop(), pop(), pop()\n\n' +
      'push(1): stack=[1], inc=[0]\n' +
      'push(2): stack=[1,2], inc=[0,0]\n' +
      'pop(): idx=1, val=2+inc[1]=2, cascade inc[0]+=inc[1]=0, stack=[1], inc=[0] -> return 2\n' +
      'push(2): stack=[1,2], inc=[0,0]\n' +
      'push(3): stack=[1,2,3], inc=[0,0,0]\n' +
      'push(4): stack full (maxSize=3), ignore\n' +
      'increment(5,100): idx=min(5,3)-1=2, inc[2]+=100 -> inc=[0,0,100]\n' +
      'increment(2,100): idx=min(2,3)-1=1, inc[1]+=100 -> inc=[0,100,100]\n' +
      'pop(): idx=2, val=3+100=103, cascade inc[1]+=100 -> inc=[0,200,100], stack=[1,2] -> return 103\n' +
      'pop(): idx=1, val=2+200=202, cascade inc[0]+=200 -> inc=[200,200,100], stack=[1] -> return 202\n' +
      'pop(): idx=0, val=1+200=201, stack=[] -> return 201\n' +
      'pop(): stack empty -> return -1',
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
    intuition:
      'In-order traversal of a BST gives sorted values. Building a balanced BST from a sorted array is easy: pick the middle element as root and recurse on each half. It is like creating a balanced tournament bracket.',
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
    // Step 1: collect sorted values via in-order traversal
    const vals = [];
    const inorder = (node) => {
        if (!node) return;
        inorder(node.left);
        vals.push(node.val);
        inorder(node.right);
    };
    inorder(root);

    // Step 2: build a balanced BST from the sorted array
    const build = (lo, hi) => {
        if (lo > hi) return null;

        // Choose the middle element as the root for balance
        const mid = Math.floor((lo + hi) / 2);
        const node = new TreeNode(vals[mid]);

        // Recursively build left and right subtrees
        node.left  = build(lo, mid - 1);
        node.right = build(mid + 1, hi);

        return node;
    };

    return build(0, vals.length - 1);
};`,
    jsWalkthrough:
      'Input: root = [1,null,2,null,3,null,4] (right-skewed tree)\n\n' +
      'In-order traversal: vals = [1, 2, 3, 4]\n\n' +
      'build(0, 3):\n' +
      '  mid=1, root=vals[1]=2\n' +
      '  left = build(0, 0):\n' +
      '    mid=0, root=vals[0]=1, left=null, right=null -> node(1)\n' +
      '  right = build(2, 3):\n' +
      '    mid=2, root=vals[2]=3\n' +
      '    left = build(2,1) -> null\n' +
      '    right = build(3,3):\n' +
      '      mid=3, root=vals[3]=4 -> node(4)\n' +
      '    -> node(3, null, 4)\n' +
      '  -> node(2, node(1), node(3,null,4))\n\n' +
      'Result: [2,1,3,null,null,null,4] (balanced)',
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
    intuition:
      'Sort engineers by efficiency descending so each new engineer sets the team\'s minimum efficiency. Maintain a min-heap of at most k speeds to maximize the speed sum. At each step, the product is speed_sum times current efficiency.',
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

    // Pair efficiency with speed, then sort by efficiency descending
    const engineers = efficiency.map((eff, i) => [eff, speed[i]]);
    engineers.sort((a, b) => b[0] - a[0]);

    // Min-heap to keep track of the top-k speeds
    const heap = [];

    const heapPush = (val) => {
        heap.push(val);
        let i = heap.length - 1;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (heap[parent] <= heap[i]) break;
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        }
    };

    const heapPop = () => {
        if (heap.length <= 1) return heap.pop();
        const top = heap[0];
        heap[0] = heap.pop();
        let i = 0;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
            if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
            if (smallest === i) break;
            [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
            i = smallest;
        }
        return top;
    };

    let speedSum = 0n;
    let best = 0n;

    for (const [eff, spd] of engineers) {
        // Add this engineer to the team
        heapPush(spd);
        speedSum += BigInt(spd);

        // If over k engineers, drop the slowest one
        if (heap.length > k) {
            speedSum -= BigInt(heapPop());
        }

        // Current engineer has the lowest efficiency in the team (sorted desc)
        const performance = speedSum * BigInt(eff);
        if (performance > best) {
            best = performance;
        }
    }

    return Number(best % MOD);
};`,
    jsWalkthrough:
      'Input: n=6, speed=[2,10,3,1,5,8], efficiency=[5,4,3,9,7,2], k=2\n\n' +
      'Paired and sorted by efficiency desc:\n' +
      '  [(9,1),(7,5),(5,2),(4,10),(3,3),(2,8)]\n\n' +
      'Process each engineer (they set the min efficiency):\n' +
      '  (9,1): heap=[1], speedSum=1, perf=1*9=9, best=9\n' +
      '  (7,5): heap=[1,5], speedSum=6, perf=6*7=42, best=42\n' +
      '  (5,2): heap=[1,2,5] too many->pop 1, heap=[2,5], speedSum=7, perf=7*5=35\n' +
      '  (4,10): heap=[2,5,10]->pop 2, heap=[5,10], speedSum=15, perf=15*4=60, best=60\n' +
      '  (3,3): heap=[3,5,10]->pop 3, heap=[5,10], speedSum=15, perf=15*3=45\n' +
      '  (2,8): heap=[5,8,10]->pop 5, heap=[8,10], speedSum=18, perf=18*2=36\n\n' +
      'Return 60 % MOD = 60',
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
    intuition:
      'The Collatz sequence (if even halve, if odd triple-plus-one) defines a power value for each number. Memoize the recursive computation since many numbers share intermediate values, then sort by power and pick the k-th.',
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
    // Memoize Collatz power values to avoid recomputation
    const memo = new Map();

    const power = (x) => {
        if (x === 1) return 0; // base case: 1 needs 0 steps

        if (memo.has(x)) return memo.get(x);

        let steps;
        if (x % 2 === 0) {
            steps = 1 + power(Math.floor(x / 2));
        } else {
            steps = 1 + power(3 * x + 1);
        }

        memo.set(x, steps);
        return steps;
    };

    // Collect all integers in [lo, hi]
    const nums = [];
    for (let i = lo; i <= hi; i++) {
        nums.push(i);
    }

    // Sort by (power value, integer value)
    nums.sort((a, b) => power(a) - power(b) || a - b);

    return nums[k - 1]; // k is 1-indexed
};`,
    jsWalkthrough:
      'Input: lo=12, hi=15, k=2\n\n' +
      'Compute powers (Collatz steps to reach 1):\n' +
      '  power(12): 12->6->3->10->5->16->8->4->2->1 = 9 steps\n' +
      '  power(13): 13->40->20->10->5->16->8->4->2->1 = 9 steps\n' +
      '  power(14): 14->7->22->11->34->17->52->26->13->... = 17 steps\n' +
      '  power(15): 15->46->23->70->35->... = 17 steps\n\n' +
      'Sort by (power, value):\n' +
      '  (9,12), (9,13), (17,14), (17,15)\n' +
      '  -> [12, 13, 14, 15]\n\n' +
      'k=2 (1-indexed) -> nums[1] = 13\n' +
      'Return 13',
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
    intuition:
      'A lucky integer is one whose value equals its frequency. Count frequencies and check each one. It is like finding someone whose age equals their jersey number.',
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
    // Build a frequency map: how many times does each number appear?
    const count = new Map();
    for (const num of arr) {
        const currentCount = count.get(num) || 0;
        count.set(num, currentCount + 1);
    }

    // A lucky integer has frequency equal to its value
    let result = -1;
    for (const [num, freq] of count) {
        if (num === freq) {
            result = Math.max(result, num);
        }
    }
    return result;
};`,
    jsWalkthrough:
      'Input: arr = [2,2,3,4]\n\n' +
      'Build frequency map:\n' +
      '  Process 2: count = {2:1}\n' +
      '  Process 2: count = {2:2}\n' +
      '  Process 3: count = {2:2, 3:1}\n' +
      '  Process 4: count = {2:2, 3:1, 4:1}\n\n' +
      'Check lucky integers (num === freq):\n' +
      '  num=2, freq=2 -> 2===2 YES, result = max(-1, 2) = 2\n' +
      '  num=3, freq=1 -> 3===1 NO\n' +
      '  num=4, freq=1 -> 4===1 NO\n\n' +
      'Return 2',
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
    intuition:
      'Fix the middle soldier and count how many valid pairs exist on each side. For increasing triples, multiply left-smaller by right-larger. For decreasing triples, multiply left-larger by right-smaller. It is a counting trick, not a search.',
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

    // Fix the middle soldier j and count valid pairs on each side
    for (let j = 0; j < n; j++) {
        // Count soldiers to the left with smaller rating (for increasing triples)
        let leftSmaller = 0;
        for (let i = 0; i < j; i++) {
            if (rating[i] < rating[j]) {
                leftSmaller++;
            }
        }

        // Count soldiers to the right with larger rating (for increasing triples)
        let rightLarger = 0;
        for (let k = j + 1; k < n; k++) {
            if (rating[k] > rating[j]) {
                rightLarger++;
            }
        }

        // Derive the complementary counts
        const leftLarger   = j - leftSmaller;           // soldiers left with rating > rating[j]
        const rightSmaller = (n - 1 - j) - rightLarger; // soldiers right with rating < rating[j]

        // Increasing teams: pick one from leftSmaller and one from rightLarger
        // Decreasing teams: pick one from leftLarger and one from rightSmaller
        count += leftSmaller * rightLarger + leftLarger * rightSmaller;
    }
    return count;
};`,
    jsWalkthrough:
      'Input: rating = [2,5,3,4,1]\n\n' +
      'Fix middle j=0 (rating=2):\n' +
      '  leftSmaller=0, rightLarger=3 (5,3,4), leftLarger=0, rightSmaller=1 (1)\n' +
      '  count += 0*3 + 0*1 = 0\n\n' +
      'Fix middle j=1 (rating=5):\n' +
      '  leftSmaller=1 (2), rightLarger=0, leftLarger=0, rightSmaller=3 (3,4,1)\n' +
      '  count += 1*0 + 0*3 = 0\n\n' +
      'Fix middle j=2 (rating=3):\n' +
      '  leftSmaller=1 (2), rightLarger=1 (4), leftLarger=1 (5), rightSmaller=1 (1)\n' +
      '  count += 1*1 + 1*1 = 2  -> total=2\n\n' +
      'Fix middle j=3 (rating=4):\n' +
      '  leftSmaller=2 (2,3), rightLarger=0, leftLarger=1 (5), rightSmaller=1 (1)\n' +
      '  count += 2*0 + 1*1 = 1  -> total=3\n\n' +
      'Fix middle j=4 (rating=1):\n' +
      '  leftSmaller=0, rightLarger=0, leftLarger=4, rightSmaller=0\n' +
      '  count += 0 + 0 = 0\n\n' +
      'Return 3',
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
    intuition:
      'Use two maps: one tracking where each customer checked in, and another accumulating total travel times between station pairs. Average time is just total divided by count, like a running average calculator.',
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
    // Maps customer id -> [stationName, checkInTime]
    this.checkins = new Map();
    // Maps "startStation,endStation" -> [totalTime, tripCount]
    this.travel = new Map();
};

UndergroundSystem.prototype.checkIn = function(id, stationName, t) {
    // Record where and when this customer checked in
    this.checkins.set(id, [stationName, t]);
};

UndergroundSystem.prototype.checkOut = function(id, stationName, t) {
    // Retrieve and remove the check-in record for this customer
    const [startStation, startTime] = this.checkins.get(id);
    this.checkins.delete(id);

    // Compute travel time and accumulate for this station pair
    const key = startStation + ',' + stationName;
    if (!this.travel.has(key)) {
        this.travel.set(key, [0, 0]);
    }
    const data = this.travel.get(key);
    const travelTime = t - startTime;
    data[0] += travelTime; // add to total time
    data[1] += 1;          // increment trip count
};

UndergroundSystem.prototype.getAverageTime = function(startStation, endStation) {
    const key = startStation + ',' + endStation;
    const [total, count] = this.travel.get(key);
    return total / count;
};`,
    jsWalkthrough:
      'Input: checkIn(45,"Leyton",3), checkOut(45,"Waterloo",15), getAverageTime("Leyton","Waterloo")\n\n' +
      'checkIn(45, "Leyton", 3):\n' +
      '  checkins = {45: ["Leyton", 3]}\n\n' +
      'checkOut(45, "Waterloo", 15):\n' +
      '  startStation="Leyton", startTime=3\n' +
      '  travelTime = 15 - 3 = 12\n' +
      '  key = "Leyton,Waterloo"\n' +
      '  travel = {"Leyton,Waterloo": [12, 1]}\n\n' +
      'getAverageTime("Leyton", "Waterloo"):\n' +
      '  total=12, count=1\n' +
      '  return 12 / 1 = 12.0',
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
    intuition:
      'Sort dishes by satisfaction descending and greedily add dishes as long as their cumulative sum stays positive. Each dish added pushes all previous dishes one position later, increasing their contribution by their satisfaction value.',
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
    // Sort highest satisfaction first so we greedily add the best dishes
    satisfaction.sort((a, b) => b - a);

    let total     = 0; // accumulated like-time coefficient sum
    let suffixSum = 0; // running sum of chosen dish satisfactions

    for (const s of satisfaction) {
        // Adding dish with value s at the front shifts all previous dishes one slot later
        // The net gain is suffixSum + s (the new suffix sum after including this dish)
        suffixSum += s;

        if (suffixSum > 0) {
            // Adding this dish increases our total — keep it
            total += suffixSum;
        } else {
            // Adding this dish would decrease or not increase total — stop here
            break;
        }
    }
    return total;
};`,
    jsWalkthrough:
      'Input: satisfaction = [-1,-8,0,5,-7]\n\n' +
      'After sort descending: [5, 0, -1, -7, -8]\n\n' +
      'Process s=5:\n' +
      '  suffixSum = 0+5 = 5 > 0\n' +
      '  total = 0+5 = 5\n\n' +
      'Process s=0:\n' +
      '  suffixSum = 5+0 = 5 > 0\n' +
      '  total = 5+5 = 10\n\n' +
      'Process s=-1:\n' +
      '  suffixSum = 5+(-1) = 4 > 0\n' +
      '  total = 10+4 = 14\n\n' +
      'Process s=-7:\n' +
      '  suffixSum = 4+(-7) = -3 <= 0 -> break\n\n' +
      'Return 14\n\n' +
      'Verification: chose [0,5,-1] cooked at times 1,2,3\n' +
      '  0*1 + 5*2 + (-1)*3 = 0+10-3... wait: sort them as [-1,0,5] at times 1,2,3\n' +
      '  -1*1 + 0*2 + 5*3 = -1+0+15 = 14 ✓',
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
    intuition:
      'Always pick the character with the most remaining uses, unless it would create three in a row. In that case, insert one of the second-most frequent character as a separator. A max-heap efficiently tracks which character to use next.',
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

    // Max-heap push: sift up after appending
    const push = (item) => {
        heap.push(item);
        let i = heap.length - 1;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (heap[parent][0] >= heap[i][0]) break;
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        }
    };

    // Max-heap pop: swap root with last, then sift down
    const pop = () => {
        if (heap.length <= 1) return heap.pop();
        const val = heap[0];
        heap[0] = heap.pop();
        let i = 0;
        while (true) {
            let largest = i;
            const left  = 2 * i + 1;
            const right = 2 * i + 2;
            if (left  < heap.length && heap[left][0]  > heap[largest][0]) largest = left;
            if (right < heap.length && heap[right][0] > heap[largest][0]) largest = right;
            if (largest === i) break;
            [heap[largest], heap[i]] = [heap[i], heap[largest]];
            i = largest;
        }
        return val;
    };

    // Seed the heap with each available character
    if (a > 0) push([a, 'a']);
    if (b > 0) push([b, 'b']);
    if (c > 0) push([c, 'c']);

    const result = [];
    while (heap.length) {
        let [cnt1, ch1] = pop();
        const lastTwo = result.length >= 2 &&
                        result[result.length - 1] === ch1 &&
                        result[result.length - 2] === ch1;

        if (lastTwo) {
            // Can't use ch1 again — it would make three in a row
            if (!heap.length) break;
            let [cnt2, ch2] = pop();
            result.push(ch2);
            cnt2--;
            if (cnt2 > 0) push([cnt2, ch2]);
            push([cnt1, ch1]); // push ch1 back to try next iteration
        } else {
            result.push(ch1);
            cnt1--;
            if (cnt1 > 0) push([cnt1, ch1]);
        }
    }
    return result.join('');
};`,
    jsWalkthrough:
      'Input: a=1, b=1, c=7\n\n' +
      'Initial heap: [[7,"c"],[1,"a"],[1,"b"]] (max-heap by count)\n\n' +
      'Iter 1: pop [7,"c"], result=[], no lastTwo -> append "c", push [6,"c"]\n' +
      '  result=["c"]\n\n' +
      'Iter 2: pop [6,"c"], result has only 1 item -> append "c", push [5,"c"]\n' +
      '  result=["c","c"]\n\n' +
      'Iter 3: pop [5,"c"], lastTwo=true (cc) -> pop [1,"a"], append "a", push [5,"c"] back\n' +
      '  result=["c","c","a"]\n\n' +
      'Iter 4: pop [5,"c"], no lastTwo (ca) -> append "c", push [4,"c"]\n' +
      '  result=["c","c","a","c"]\n\n' +
      'Iter 5: pop [4,"c"], no lastTwo (ac) -> append "c", push [3,"c"]\n' +
      '  result=["c","c","a","c","c"]\n\n' +
      'Iter 6: pop [3,"c"], lastTwo=true (cc) -> pop [1,"b"], append "b", push [3,"c"]\n' +
      '  result=["c","c","a","c","c","b"]\n\n' +
      'Iter 7: pop [3,"c"], no lastTwo (cb) -> append "c", push [2,"c"]\n' +
      '  result=["c","c","a","c","c","b","c"]\n\n' +
      'Iter 8: pop [2,"c"], no lastTwo (bc) -> append "c", push [1,"c"]\n' +
      '  result=["c","c","a","c","c","b","c","c"]\n\n' +
      'Return "ccaccbcc"',
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
    intuition:
      'This is a game theory problem where dp[i] represents how much better the current player does from position i onward. Taking k stones gains their sum but hands the opponent dp[i+k] advantage. The net advantage determines the winner.',
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
    // dp[i] = max score advantage (current player - opponent) from index i onward
    const dp = new Array(n + 1).fill(0);

    // Fill from the end backward
    for (let i = n - 1; i >= 0; i--) {
        dp[i] = -Infinity;
        let stonesSum = 0; // sum of stones taken in this turn

        // Try taking 1, 2, or 3 stones
        for (let k = 1; k <= 3; k++) {
            if (i + k > n) break;

            // Take stoneValue[i], stoneValue[i+1], ..., stoneValue[i+k-1]
            stonesSum += stoneValue[i + k - 1];

            // After taking k stones, opponent plays from i+k with advantage dp[i+k]
            const advantage = stonesSum - dp[i + k];
            dp[i] = Math.max(dp[i], advantage);
        }
    }

    // dp[0] > 0 means Alice (first player) ends up ahead
    if (dp[0] > 0) return "Alice";
    if (dp[0] < 0) return "Bob";
    return "Tie";
};`,
    jsWalkthrough:
      'Input: stoneValue = [1,2,3,7]\n\n' +
      'dp = [0,0,0,0,0]  (size n+1=5)\n\n' +
      'i=3: take k=1: stonesSum=7, advantage=7-dp[4]=7-0=7 -> dp[3]=7\n\n' +
      'i=2: take k=1: stonesSum=3, advantage=3-dp[3]=3-7=-4\n' +
      '      take k=2: stonesSum=3+7=10, advantage=10-dp[4]=10-0=10 -> dp[2]=10\n\n' +
      'i=1: take k=1: stonesSum=2, advantage=2-dp[2]=2-10=-8\n' +
      '      take k=2: stonesSum=2+3=5, advantage=5-dp[3]=5-7=-2\n' +
      '      take k=3: stonesSum=5+7=12, advantage=12-dp[4]=12-0=12 -> dp[1]=12\n\n' +
      'i=0: take k=1: stonesSum=1, advantage=1-dp[1]=1-12=-11\n' +
      '      take k=2: stonesSum=1+2=3, advantage=3-dp[2]=3-10=-7\n' +
      '      take k=3: stonesSum=3+3=6, advantage=6-dp[3]=6-7=-1 -> dp[0]=-1\n\n' +
      'dp[0]=-1 < 0 -> return "Bob"',
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
    intuition:
      'Think of it as decoding a string into numbers. At each position, try extending the current number digit by digit until it exceeds k or has a leading zero. Each valid split adds the ways from the remaining suffix.',
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
    const n   = s.length;

    // dp[i] = number of ways to decode the suffix s[i..n-1] into valid integers
    const dp = new Array(n + 1).fill(0);
    dp[n] = 1; // empty suffix has exactly one decoding (the empty array)

    for (let i = n - 1; i >= 0; i--) {
        // Numbers cannot start with '0' (no leading zeros)
        if (s[i] === '0') continue;

        let num = 0; // current number being formed starting at position i
        for (let j = i; j < n; j++) {
            // Extend the number by one digit
            num = num * 10 + Number(s[j]);

            // Stop if this number exceeds the allowed maximum
            if (num > k) break;

            // s[i..j] forms a valid number — add the ways for the remaining suffix
            dp[i] = (dp[i] + dp[j + 1]) % MOD;
        }
    }
    return dp[0];
};`,
    jsWalkthrough:
      'Input: s = "1317", k = 2000\n\n' +
      'dp = [0,0,0,0,1]  (dp[4]=1 base case)\n\n' +
      'i=3 (s[3]="7"): num=7 <=2000, dp[3]+=dp[4]=1 -> dp[3]=1\n\n' +
      'i=2 (s[2]="1"):\n' +
      '  j=2: num=1 <=2000, dp[2]+=dp[3]=1\n' +
      '  j=3: num=17 <=2000, dp[2]+=dp[4]=1 -> dp[2]=2\n\n' +
      'i=1 (s[1]="3"):\n' +
      '  j=1: num=3 <=2000, dp[1]+=dp[2]=2\n' +
      '  j=2: num=31 <=2000, dp[1]+=dp[3]=1\n' +
      '  j=3: num=317 <=2000, dp[1]+=dp[4]=1 -> dp[1]=4\n\n' +
      'i=0 (s[0]="1"):\n' +
      '  j=0: num=1 <=2000, dp[0]+=dp[1]=4\n' +
      '  j=1: num=13 <=2000, dp[0]+=dp[2]=2\n' +
      '  j=2: num=131 <=2000, dp[0]+=dp[3]=1\n' +
      '  j=3: num=1317 <=2000, dp[0]+=dp[4]=1 -> dp[0]=8\n\n' +
      'Return 8',
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
    intuition:
      'Taking k cards from the ends is the same as leaving a window of n-k cards in the middle. Minimize that window\'s sum to maximize the cards you take. A sliding window finds the minimum-sum window efficiently.',
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
    const n          = cardPoints.length;
    const windowSize = n - k; // number of cards we leave in the middle

    // Compute the total sum of all cards
    const totalSum = cardPoints.reduce((a, b) => a + b, 0);

    // Initialize the sum of the first window (the leftmost n-k cards)
    let windowSum = 0;
    for (let i = 0; i < windowSize; i++) {
        windowSum += cardPoints[i];
    }
    let minWindowSum = windowSum;

    // Slide the window rightward, looking for the minimum sum subarray of size n-k
    for (let i = windowSize; i < n; i++) {
        windowSum += cardPoints[i];                // add new right element
        windowSum -= cardPoints[i - windowSize];   // remove old left element
        minWindowSum = Math.min(minWindowSum, windowSum);
    }

    // Maximum score = total - minimum middle window
    return totalSum - minWindowSum;
};`,
    jsWalkthrough:
      'Input: cardPoints = [1,2,3,4,5,6,1], k = 3\n\n' +
      'n=7, windowSize = 7-3 = 4 (leave 4 middle cards)\n' +
      'totalSum = 1+2+3+4+5+6+1 = 22\n\n' +
      'Initial window [0..3]: windowSum = 1+2+3+4 = 10\n' +
      'minWindowSum = 10\n\n' +
      'Slide i=4: add cardPoints[4]=5, remove cardPoints[0]=1 -> windowSum=14, min=10\n' +
      'Slide i=5: add cardPoints[5]=6, remove cardPoints[1]=2 -> windowSum=18, min=10\n' +
      'Slide i=6: add cardPoints[6]=1, remove cardPoints[2]=3 -> windowSum=16, min=10\n\n' +
      'Return totalSum - minWindowSum = 22 - 10 = 12',
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
    intuition:
      'Start from the top-right corner of this row-sorted binary matrix. If you see a 1, there might be an earlier column with a 1, so move left. If you see a 0, this row has no 1s this far left, so move down. It is a staircase walk.',
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

    // Start from the top-right corner
    let row    = 0;
    let col    = cols - 1;
    let result = -1; // -1 if no column with a 1 is found

    while (row < rows && col >= 0) {
        if (binaryMatrix.get(row, col) === 1) {
            // Found a 1 — record this column and look further left
            result = col;
            col--;
        } else {
            // Current cell is 0 — no earlier 1 exists in this row; move down
            row++;
        }
    }
    return result;
};`,
    jsWalkthrough:
      'Input: mat = [[0,0,0,1],[0,0,1,1],[0,1,1,1]]\n\n' +
      'rows=3, cols=4, start at row=0, col=3\n\n' +
      'Step 1: get(0,3)=1 -> result=3, col=2\n' +
      'Step 2: get(0,2)=0 -> row=1\n' +
      'Step 3: get(1,2)=1 -> result=2, col=1\n' +
      'Step 4: get(1,1)=0 -> row=2\n' +
      'Step 5: get(2,1)=1 -> result=1, col=0\n' +
      'Step 6: get(2,0)=0 -> row=3\n' +
      'row=3 >= rows=3 -> exit loop\n\n' +
      'Return 1',
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
    intuition:
      'An OrderedDict (or Map in JS) maintains insertion order and allows O(1) deletion. When a value becomes a duplicate, remove it from the OrderedDict. The first key is always the first unique value.',
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
    // unique: Map preserves insertion order, stores only values seen exactly once
    this.unique = new Map();
    // seen: Set of all values ever added (including duplicates)
    this.seen = new Set();

    for (const num of nums) {
        this.add(num);
    }
};

FirstUnique.prototype.showFirstUnique = function() {
    // The first key in the Map is the first-inserted unique value
    for (const [key] of this.unique) {
        return key;
    }
    return -1; // no unique values remain
};

FirstUnique.prototype.add = function(value) {
    if (!this.seen.has(value)) {
        // First time seeing this value — it is currently unique
        this.seen.add(value);
        this.unique.set(value, true);
    } else if (this.unique.has(value)) {
        // Seen it before and it was unique — now it is a duplicate, remove it
        this.unique.delete(value);
    }
    // If seen before and already removed from unique, nothing to do
};`,
    jsWalkthrough:
      'Input: nums=[2,3,5], then add(5), then showFirstUnique()\n\n' +
      'Constructor processing [2,3,5]:\n' +
      '  add(2): not seen -> seen={2}, unique={2}\n' +
      '  add(3): not seen -> seen={2,3}, unique={2,3}\n' +
      '  add(5): not seen -> seen={2,3,5}, unique={2,3,5}\n\n' +
      'showFirstUnique(): first key = 2 -> return 2\n\n' +
      'add(5): 5 in seen AND 5 in unique -> delete from unique\n' +
      '  seen={2,3,5}, unique={2,3}\n\n' +
      'showFirstUnique(): first key = 2 -> return 2',
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
    intuition:
      'Find the maximum candy count and check if each kid, after receiving the extra candies, would reach or exceed that maximum. It is a simple comparison after finding the global max.',
    approach:
      'Find the current maximum. For each kid, check if candies[i] + extraCandies >= max.',
    code: `class Solution:
    def kidsWithCandies(self, candies: list[int], extraCandies: int) -> list[bool]:
        max_candies = max(candies)
        return [c + extraCandies >= max_candies for c in candies]`,
    jsCode: `var kidsWithCandies = function(candies, extraCandies) {
    // Find the highest candy count among all kids right now
    const maxCandies = Math.max(...candies);

    // Each kid can potentially be greatest if their count + extra >= current max
    return candies.map(c => c + extraCandies >= maxCandies);
};`,
    jsWalkthrough:
      'Input: candies = [2,3,5,1,3], extraCandies = 3\n\n' +
      'maxCandies = max(2,3,5,1,3) = 5\n\n' +
      'Check each kid:\n' +
      '  kid 0: 2+3=5 >= 5 -> true\n' +
      '  kid 1: 3+3=6 >= 5 -> true\n' +
      '  kid 2: 5+3=8 >= 5 -> true\n' +
      '  kid 3: 1+3=4 >= 5 -> false\n' +
      '  kid 4: 3+3=6 >= 5 -> true\n\n' +
      'Return [true,true,true,false,true]',
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
    intuition:
      'The constraint is that max minus min in the window must stay within the limit. Two monotonic deques efficiently track the sliding window\'s max and min, letting you expand and shrink the window in amortized O(1) per element.',
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
    // maxDq: indices in decreasing order of value (front = current window max)
    const maxDq = [];
    // minDq: indices in increasing order of value (front = current window min)
    const minDq = [];
    let left   = 0;
    let result = 0;

    for (let right = 0; right < nums.length; right++) {
        // Maintain decreasing deque: pop indices with smaller or equal values
        while (maxDq.length && nums[right] >= nums[maxDq[maxDq.length - 1]]) {
            maxDq.pop();
        }
        // Maintain increasing deque: pop indices with larger or equal values
        while (minDq.length && nums[right] <= nums[minDq[minDq.length - 1]]) {
            minDq.pop();
        }
        maxDq.push(right);
        minDq.push(right);

        // Shrink window from the left if constraint is violated
        while (nums[maxDq[0]] - nums[minDq[0]] > limit) {
            left++;
            if (maxDq[0] < left) maxDq.shift(); // remove stale front of max deque
            if (minDq[0] < left) minDq.shift(); // remove stale front of min deque
        }

        result = Math.max(result, right - left + 1);
    }
    return result;
};`,
    jsWalkthrough:
      'Input: nums = [8,2,4,7], limit = 4\n\n' +
      'right=0 (val=8): maxDq=[0], minDq=[0], diff=8-8=0<=4, result=1\n\n' +
      'right=1 (val=2):\n' +
      '  maxDq: 2<8 -> push -> [0,1]\n' +
      '  minDq: 2<8 -> pop 0, push -> [1]\n' +
      '  diff = nums[0]-nums[1] = 8-2 = 6 > 4 -> left=1\n' +
      '    maxDq[0]=0 < left=1 -> shift -> maxDq=[1]\n' +
      '    minDq[0]=1 >= left=1 -> keep\n' +
      '  diff = nums[1]-nums[1] = 2-2 = 0 <= 4\n' +
      '  result = max(1, 1-1+1) = 1\n\n' +
      'right=2 (val=4):\n' +
      '  maxDq: 4>2 -> pop 1, push -> [2]\n' +
      '  minDq: 4>2 -> push -> [1,2]\n' +
      '  diff = nums[2]-nums[1] = 4-2 = 2 <= 4\n' +
      '  result = max(1, 2-1+1) = 2\n\n' +
      'right=3 (val=7):\n' +
      '  maxDq: 7>4 -> pop 2, push -> [3]\n' +
      '  minDq: 7>4 -> push -> [1,2,3]\n' +
      '  diff = nums[3]-nums[1] = 7-2 = 5 > 4 -> left=2\n' +
      '    maxDq[0]=3 >= left=2 -> keep\n' +
      '    minDq[0]=1 < left=2 -> shift -> minDq=[2,3]\n' +
      '  diff = nums[3]-nums[2] = 7-4 = 3 <= 4\n' +
      '  result = max(2, 3-2+1) = 2\n\n' +
      'Return 2',
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
    intuition:
      'If XOR of a range is zero, any split point within that range produces two equal-XOR halves. Use prefix XOR to find all ranges with XOR zero, and for each such range of length L, there are L-1 valid split points.',
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

    // Build prefix XOR: prefix[i] = arr[0] XOR arr[1] XOR ... XOR arr[i-1]
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] ^ arr[i];
    }

    let count = 0;
    // Find all pairs (i, k) where XOR of arr[i..k] = 0
    // If prefix[i] === prefix[k+1], then arr[i..k] XORs to 0
    // Any split point j in (i, k] gives a valid triplet -> contributes k-i triplets
    for (let i = 0; i < n; i++) {
        for (let k = i + 1; k < n; k++) {
            if (prefix[i] === prefix[k + 1]) {
                count += k - i;
            }
        }
    }
    return count;
};`,
    jsWalkthrough:
      'Input: arr = [2,3,1,6,7]\n\n' +
      'Build prefix XOR:\n' +
      '  prefix[0]=0\n' +
      '  prefix[1]=0^2=2\n' +
      '  prefix[2]=2^3=1\n' +
      '  prefix[3]=1^1=0\n' +
      '  prefix[4]=0^6=6\n' +
      '  prefix[5]=6^7=1\n' +
      'prefix = [0,2,1,0,6,1]\n\n' +
      'Check pairs (i,k) where prefix[i] === prefix[k+1]:\n' +
      '  (i=0,k=2): prefix[0]=0 === prefix[3]=0 -> count += 2-0 = 2\n' +
      '  (i=1,k=4): prefix[1]=2 vs prefix[5]=1 -> no\n' +
      '  (i=2,k=4): prefix[2]=1 === prefix[5]=1 -> count += 4-2 = 2\n' +
      '  (all other pairs): prefix values differ\n\n' +
      'Total count = 2+2 = 4\n\n' +
      'Return 4',
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
    intuition:
      'Think of it as trimming a tree: you only need to travel edges that lead to apples. DFS from the root, and each edge you must traverse costs 2 (go and come back). Skip entire subtrees with no apples.',
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
    // Build adjacency list for the tree
    const graph = new Map();
    for (let i = 0; i < n; i++) {
        graph.set(i, []);
    }
    for (const [u, v] of edges) {
        graph.get(u).push(v);
        graph.get(v).push(u);
    }

    // DFS returns the total seconds needed to collect all apples in this subtree
    const dfs = (node, parent) => {
        let total = 0;
        for (const child of graph.get(node)) {
            if (child === parent) continue; // avoid going back up the tree

            const childCost = dfs(child, node);

            // Only traverse this edge if the child subtree contains apples
            const subtreeHasApple = childCost > 0 || hasApple[child];
            if (subtreeHasApple) {
                total += childCost + 2; // +2 for round trip on this edge
            }
        }
        return total;
    };
    return dfs(0, -1);
};`,
    jsWalkthrough:
      'Input: n=7, edges=[[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]]\n' +
      'hasApple = [false,false,true,false,true,true,false]\n\n' +
      'Adjacency list:\n' +
      '  0: [1,2], 1: [0,4,5], 2: [0,3,6], 3:[2], 4:[1], 5:[1], 6:[2]\n\n' +
      'dfs(3, 2): no children -> return 0 (no apple at node 3)\n' +
      'dfs(6, 2): no children -> return 0 (no apple at node 6)\n' +
      'dfs(2, 0):\n' +
      '  child=3: childCost=0, hasApple[3]=false -> skip\n' +
      '  child=6: childCost=0, hasApple[6]=false -> skip\n' +
      '  return 0  (but hasApple[2]=true, caller will add 2)\n\n' +
      'dfs(4, 1): no children -> return 0, hasApple[4]=true (caller adds 2)\n' +
      'dfs(5, 1): no children -> return 0, hasApple[5]=true (caller adds 2)\n' +
      'dfs(1, 0):\n' +
      '  child=4: childCost=0, hasApple[4]=true -> total += 0+2=2\n' +
      '  child=5: childCost=0, hasApple[5]=true -> total += 0+2=2\n' +
      '  return 4\n\n' +
      'dfs(0, -1):\n' +
      '  child=1: childCost=4 > 0 -> total += 4+2=6\n' +
      '  child=2: childCost=0, hasApple[2]=true -> total += 0+2=2\n' +
      '  return 8\n\n' +
      'Return 8',
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
    intuition:
      'Slide a window of size k across the string, maintaining a count of vowels. When the window moves one position right, add the new character and remove the old one, updating the vowel count in O(1).',
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
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);

    // Count vowels in the initial window of size k
    let count = 0;
    for (let i = 0; i < k; i++) {
        if (vowels.has(s[i])) {
            count++;
        }
    }
    let best = count;

    // Slide the window: add the new right character, remove the old left character
    for (let i = k; i < s.length; i++) {
        const addedVowel   = vowels.has(s[i])     ? 1 : 0;
        const removedVowel = vowels.has(s[i - k]) ? 1 : 0;
        count += addedVowel - removedVowel;
        best = Math.max(best, count);
    }
    return best;
};`,
    jsWalkthrough:
      'Input: s = "abciiidef", k = 3\n\n' +
      'Initial window "abc" [0..2]:\n' +
      '  s[0]="a" is vowel, s[1]="b" not, s[2]="c" not -> count=1, best=1\n\n' +
      'Slide i=3: add s[3]="i" (vowel +1), remove s[0]="a" (vowel -1)\n' +
      '  count=1+1-1=1, best=1\n\n' +
      'Slide i=4: add s[4]="i" (+1), remove s[1]="b" (-0)\n' +
      '  count=1+1=2, best=2\n\n' +
      'Slide i=5: add s[5]="i" (+1), remove s[2]="c" (-0)\n' +
      '  count=2+1=3, best=3\n\n' +
      'Slide i=6: add s[6]="d" (+0), remove s[3]="i" (-1)\n' +
      '  count=3-1=2, best=3\n\n' +
      'Slide i=7: add "e" (+1), remove "i" (-1) -> count=2, best=3\n' +
      'Slide i=8: add "f" (+0), remove "i" (-1) -> count=1, best=3\n\n' +
      'Return 3',
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
    intuition:
      'A palindrome rearrangement exists if at most one character has an odd count. Track digit parity along root-to-leaf paths using a bitmask where each bit flip represents toggling a digit\'s parity. At leaves, check if at most one bit is set.',
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

        // Toggle the bit for this node's digit value (tracks odd/even parity)
        const newMask = mask ^ (1 << node.val);

        if (!node.left && !node.right) {
            // At a leaf: check if at most one digit has odd parity
            // A number with at most one set bit satisfies: n & (n-1) === 0
            const atMostOneOddDigit = (newMask & (newMask - 1)) === 0;
            return atMostOneOddDigit ? 1 : 0;
        }

        // Recurse into both children, accumulating count
        const leftCount  = dfs(node.left,  newMask);
        const rightCount = dfs(node.right, newMask);
        return leftCount + rightCount;
    };
    return dfs(root, 0);
};`,
    jsWalkthrough:
      'Input: root = [2,3,1,3,1,null,1]\n' +
      'Tree structure:\n' +
      '       2\n' +
      '      / \\\n' +
      '     3   1\n' +
      '    / \\   \\\n' +
      '   3   1   1\n\n' +
      'Path 2->3->3 (leaf): mask=0^(1<<2)^(1<<3)^(1<<3)=0b100=4\n' +
      '  4 & 3 = 0 -> pseudo-palindromic (count=1)\n\n' +
      'Path 2->3->1 (leaf): mask=0^(1<<2)^(1<<3)^(1<<1)=0b1110=14\n' +
      '  14 & 13 = 12 != 0 -> NOT pseudo-palindromic\n\n' +
      'Path 2->1->1 (leaf): mask=0^(1<<2)^(1<<1)^(1<<1)=0b100=4\n' +
      '  4 & 3 = 0 -> pseudo-palindromic (count=1)\n\n' +
      'Total = 1+0+1 = 2\n\n' +
      'Return 2',
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
    intuition:
      'If two arrays contain the same elements with the same frequencies (are permutations of each other), you can always transform one into the other using subarray reversals. Just check if their sorted forms match.',
    approach:
      'If two arrays are permutations of each other (same elements with same frequencies), you can always sort arr into target using reversals. Just check if they have the same sorted form.',
    code: `class Solution:
    def canBeEqual(self, target: list[int], arr: list[int]) -> bool:
        return sorted(target) == sorted(arr)`,
    jsCode: `var canBeEqual = function(target, arr) {
    // Two arrays can be made equal by reversals if and only if they are permutations of each other.
    // Sort copies of both and compare as comma-joined strings.
    const sortedTarget = target.slice().sort((a, b) => a - b);
    const sortedArr    = arr.slice().sort((a, b) => a - b);
    return sortedTarget.join() === sortedArr.join();
};`,
    jsWalkthrough:
      'Input: target = [1,2,3,4], arr = [2,4,1,3]\n\n' +
      'sortedTarget = [1,2,3,4]\n' +
      'sortedArr    = [1,2,3,4]\n\n' +
      '"1,2,3,4" === "1,2,3,4" -> true\n\n' +
      'Return true',
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
    intuition:
      'Floyd-Warshall computes transitive closure: after processing, you know exactly which courses are prerequisites of which. Each query then becomes a simple O(1) table lookup.',
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
    // reach[i][j] = true means course i is a prerequisite (direct or indirect) of course j
    const reach = Array.from({length: numCourses}, () => new Array(numCourses).fill(false));

    // Seed direct prerequisites
    for (const [u, v] of prerequisites) {
        reach[u][v] = true;
    }

    // Floyd-Warshall transitive closure:
    // If course i can reach k, and k can reach j, then i can reach j
    for (let k = 0; k < numCourses; k++) {
        for (let i = 0; i < numCourses; i++) {
            for (let j = 0; j < numCourses; j++) {
                if (reach[i][k] && reach[k][j]) {
                    reach[i][j] = true;
                }
            }
        }
    }

    // Answer each query in O(1) by looking up the precomputed table
    return queries.map(([u, v]) => reach[u][v]);
};`,
    jsWalkthrough:
      'Input: numCourses=2, prerequisites=[[1,0]], queries=[[0,1],[1,0]]\n\n' +
      'Initial reach:\n' +
      '  reach[1][0] = true  (course 1 requires course 0)\n\n' +
      'Floyd-Warshall (k=0):\n' +
      '  i=1,j=any: reach[1][0]=true, check reach[0][j]\n' +
      '    reach[0][0]=false -> no update\n' +
      '    reach[0][1]=false -> no update\n\n' +
      'Floyd-Warshall (k=1):\n' +
      '  i=any,j=0: reach[i][1] && reach[1][0]\n' +
      '    i=0: reach[0][1]=false -> no update\n\n' +
      'Final reach: reach[1][0]=true, all others false\n\n' +
      'queries:\n' +
      '  [0,1]: reach[0][1]=false\n' +
      '  [1,0]: reach[1][0]=true\n\n' +
      'Return [false, true]',
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
    intuition:
      'To maximize (a-1)*(b-1), pick the two largest elements. Track the top two values in a single pass, like finding the gold and silver medalists in a race.',
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
    // Track the two largest values seen so far
    let first  = 0; // largest
    let second = 0; // second largest

    for (const num of nums) {
        if (num >= first) {
            // num is the new largest; push old largest to second
            second = first;
            first  = num;
        } else if (num > second) {
            // num is better than second but not first
            second = num;
        }
    }
    return (first - 1) * (second - 1);
};`,
    jsWalkthrough:
      'Input: nums = [3,4,5,2]\n\n' +
      'Process 3: 3>=0 -> second=0, first=3\n' +
      'Process 4: 4>=3 -> second=3, first=4\n' +
      'Process 5: 5>=4 -> second=4, first=5\n' +
      'Process 2: 2<5, 2<4 -> no change\n\n' +
      'first=5, second=4\n' +
      'Return (5-1)*(4-1) = 4*3 = 12',
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
    intuition:
      'BFS outward from city 0 through the tree. Any edge pointing away from city 0 is going the wrong direction and needs to be flipped. Edges pointing toward city 0 are already correct. Count the wrongly-directed edges.',
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
    // Build an undirected graph to traverse in any direction
    const graph = new Map();
    // Record original directed edges so we know which direction needs reversing
    const roads = new Set();

    for (let i = 0; i < n; i++) {
        graph.set(i, []);
    }
    for (const [u, v] of connections) {
        graph.get(u).push(v);
        graph.get(v).push(u);
        roads.add(u + ',' + v); // original direction: u -> v
    }

    const visited = new Array(n).fill(false);
    visited[0] = true;
    const queue = [0];
    let count = 0; // number of roads to reverse

    while (queue.length) {
        const node = queue.shift();
        for (const neighbor of graph.get(node)) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                // If original road goes node->neighbor (away from city 0), it needs reversal
                if (roads.has(node + ',' + neighbor)) {
                    count++;
                }
                queue.push(neighbor);
            }
        }
    }
    return count;
};`,
    jsWalkthrough:
      'Input: n=6, connections=[[0,1],[1,3],[2,3],[4,0],[4,5]]\n\n' +
      'roads = {"0,1","1,3","2,3","4,0","4,5"}\n\n' +
      'BFS from 0: visited=[T,F,F,F,F,F], queue=[0]\n\n' +
      'Process 0: neighbors=1,4\n' +
      '  neighbor=1: not visited, roads has "0,1" -> count=1, queue=[1]\n' +
      '  neighbor=4: not visited, roads does NOT have "0,4" (has "4,0") -> count stays 1, queue=[1,4]\n\n' +
      'Process 1: neighbors=0,3\n' +
      '  neighbor=0: visited, skip\n' +
      '  neighbor=3: not visited, roads has "1,3" -> count=2, queue=[4,3]\n\n' +
      'Process 4: neighbors=0,5\n' +
      '  neighbor=0: visited, skip\n' +
      '  neighbor=5: not visited, roads has "4,5" -> count=3, queue=[3,5]\n\n' +
      'Process 3: neighbors=1,2\n' +
      '  neighbor=1: visited, skip\n' +
      '  neighbor=2: not visited, roads does NOT have "3,2" (has "2,3") -> count=3, queue=[5,2]\n\n' +
      'Process 5,2: no new unvisited neighbors\n\n' +
      'Return 3',
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
    intuition:
      'The array has two halves that need to be interleaved like shuffling a deck of cards. Pair up elements: first from the left half, then from the right half, alternating.',
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
    // Interleave: take nums[i] from first half and nums[i+n] from second half
    for (let i = 0; i < n; i++) {
        result.push(nums[i]);      // x_i from first half
        result.push(nums[i + n]);  // y_i from second half
    }
    return result;
};`,
    jsWalkthrough:
      'Input: nums = [2,5,1,3,4,7], n = 3\n\n' +
      'i=0: push nums[0]=2, push nums[3]=3 -> result=[2,3]\n' +
      'i=1: push nums[1]=5, push nums[4]=4 -> result=[2,3,5,4]\n' +
      'i=2: push nums[2]=1, push nums[5]=7 -> result=[2,3,5,4,1,7]\n\n' +
      'Return [2,3,5,4,1,7]',
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
    intuition:
      'A browser history is just a list with a cursor. Visiting a new page truncates everything after the cursor (like clearing forward history), while back and forward move the cursor within bounds.',
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
    this.history = [homepage]; // URL stack
    this.cur = 0;              // index of current page
};

BrowserHistory.prototype.visit = function(url) {
    // Truncate any forward history (visiting a new page clears forward stack)
    this.history = this.history.slice(0, this.cur + 1);
    this.history.push(url);
    this.cur++;
};

BrowserHistory.prototype.back = function(steps) {
    // Move back by steps, but not before the beginning
    this.cur = Math.max(0, this.cur - steps);
    return this.history[this.cur];
};

BrowserHistory.prototype.forward = function(steps) {
    // Move forward by steps, but not past the end
    this.cur = Math.min(this.history.length - 1, this.cur + steps);
    return this.history[this.cur];
};`,
    jsWalkthrough:
      'Input: homepage="leetcode.com"\n' +
      'visit("google.com"), visit("facebook.com"), visit("youtube.com")\n' +
      'back(1), back(1), forward(1), visit("linkedin.com"), forward(2), back(2)\n\n' +
      'Init: history=["leetcode.com"], cur=0\n\n' +
      'visit("google.com"): truncate after 0, push -> history=["leetcode","google"], cur=1\n' +
      'visit("facebook.com"): history=["l","g","facebook"], cur=2\n' +
      'visit("youtube.com"): history=["l","g","f","youtube"], cur=3\n\n' +
      'back(1): cur=max(0,3-1)=2 -> return "facebook.com"\n' +
      'back(1): cur=max(0,2-1)=1 -> return "google.com"\n' +
      'forward(1): cur=min(3,1+1)=2 -> return "facebook.com"\n\n' +
      'visit("linkedin.com"): truncate after 2, push -> history=["l","g","f","linkedin"], cur=3\n' +
      'forward(2): cur=min(3,3+2)=3 -> return "linkedin.com"\n' +
      'back(2): cur=max(0,3-2)=1 -> return "google.com"',
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
    intuition:
      'This is the \'next smaller or equal element\' problem. A monotonic stack efficiently finds, for each price, the first future price that qualifies as a discount. When a smaller price appears, it resolves all pending prices on the stack.',
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
    const result = [...prices]; // copy; we will subtract discounts in place
    const stack  = [];          // monotonic stack of indices (prices are non-decreasing bottom->top)

    for (let i = 0; i < prices.length; i++) {
        // prices[i] is a valid discount for all stack entries with price >= prices[i]
        while (stack.length && prices[stack[stack.length - 1]] >= prices[i]) {
            const idx = stack.pop();
            result[idx] -= prices[i]; // apply discount
        }
        stack.push(i);
    }
    return result;
};`,
    jsWalkthrough:
      'Input: prices = [8,4,6,2,3]\n\n' +
      'i=0 (p=8): stack=[], push 0 -> stack=[0]\n\n' +
      'i=1 (p=4): prices[0]=8 >= 4 -> pop 0, result[0]=8-4=4; stack=[]; push 1 -> stack=[1]\n\n' +
      'i=2 (p=6): prices[1]=4 < 6 -> stop; push 2 -> stack=[1,2]\n\n' +
      'i=3 (p=2): prices[2]=6 >= 2 -> pop 2, result[2]=6-2=4\n' +
      '           prices[1]=4 >= 2 -> pop 1, result[1]=4-2=2\n' +
      '           stack=[]; push 3 -> stack=[3]\n\n' +
      'i=4 (p=3): prices[3]=2 < 3 -> stop; push 4 -> stack=[3,4]\n\n' +
      'Remaining stack [3,4]: no discount (no future smaller price)\n' +
      'result[3]=2, result[4]=3 unchanged\n\n' +
      'Return [4,2,4,2,3]',
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
    intuition:
      'Running sum is just prefix sum. Each element becomes the sum of all elements up to and including itself. Process left to right, accumulating as you go.',
    approach:
      'Iterate through the array and accumulate the sum. Each element becomes the sum of itself and all previous elements.',
    code: `class Solution:
    def runningSum(self, nums: list[int]) -> list[int]:
        for i in range(1, len(nums)):
            nums[i] += nums[i - 1]
        return nums`,
    jsCode: `var runningSum = function(nums) {
    // Build prefix sum in-place: each element becomes cumulative sum up to that index
    for (let i = 1; i < nums.length; i++) {
        nums[i] += nums[i - 1];
    }
    return nums;
};`,
    jsWalkthrough:
      'Input: nums = [1,2,3,4]\n\n' +
      'i=1: nums[1] = 2 + nums[0] = 2+1 = 3  -> [1,3,3,4]\n' +
      'i=2: nums[2] = 3 + nums[1] = 3+3 = 6  -> [1,3,6,4]\n' +
      'i=3: nums[3] = 4 + nums[2] = 4+6 = 10 -> [1,3,6,10]\n\n' +
      'Return [1,3,6,10]',
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
    intuition:
      'Generalized form: Minimize k (days) s.t. canMake(k) is True. More days mean more flowers bloom, so feasibility is monotonic — perfect for the generalized binary search template. For each candidate day, greedily count how many bouquets of k adjacent bloomed flowers you can form.',
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
    // Need at least m*k flowers total
    if (m * k > bloomDay.length) return -1;

    // Check if we can form m bouquets of k adjacent flowers by a given day
    const canMake = (day) => {
        let bouquets = 0;
        let consecutive = 0; // current run of bloomed flowers

        for (const b of bloomDay) {
            if (b <= day) {
                // This flower has bloomed by the given day
                consecutive++;
                if (consecutive === k) {
                    bouquets++;     // completed a bouquet
                    consecutive = 0; // reset run
                }
            } else {
                // Gap — reset the consecutive run
                consecutive = 0;
            }
        }
        return bouquets >= m;
    };

    // Binary search on the answer: smallest day where canMake returns true
    let lo = Math.min(...bloomDay);
    let hi = Math.max(...bloomDay);
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (canMake(mid)) {
            hi = mid; // might be achievable earlier
        } else {
            lo = mid + 1; // need more days
        }
    }
    return lo;
};`,
    jsWalkthrough:
      'Input: bloomDay = [1,10,3,10,2], m = 3, k = 1\n\n' +
      'm*k=3 <= 5 -> possible\n\n' +
      'lo=1, hi=10\n\n' +
      'mid=5: canMake(5)?\n' +
      '  b=1<=5: consecutive=1, bouquets=1, reset\n' +
      '  b=10>5: consecutive=0\n' +
      '  b=3<=5: consecutive=1, bouquets=2, reset\n' +
      '  b=10>5: consecutive=0\n' +
      '  b=2<=5: consecutive=1, bouquets=3, reset\n' +
      '  bouquets=3 >= m=3 -> true -> hi=5\n\n' +
      'mid=3: canMake(3)?\n' +
      '  b=1<=3: bouquet 1; b=10>3: reset; b=3<=3: bouquet 2; b=10>3: reset; b=2<=3: bouquet 3\n' +
      '  bouquets=3 >= 3 -> true -> hi=3\n\n' +
      'mid=2: canMake(2)?\n' +
      '  b=1<=2: bouquet 1; b=10>2: reset; b=3>2: reset; b=10>2: reset; b=2<=2: bouquet 2\n' +
      '  bouquets=2 < 3 -> false -> lo=3\n\n' +
      'lo=hi=3 -> Return 3',
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
    intuition:
      'A critical MST edge increases the total weight when removed. A pseudo-critical edge can appear in some MST but is not essential. Test each edge by excluding it (does weight increase?) and including it (does optimal weight remain?).',
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
    // Attach original index to each edge, then sort by weight for Kruskal's
    const indexedEdges = edges.map(([u, v, w], i) => [w, u, v, i]);
    indexedEdges.sort((a, b) => a[0] - b[0]);

    // Union-Find with path compression (no union by rank for simplicity)
    const find = (parent, x) => {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]]; // path halving
            x = parent[x];
        }
        return x;
    };

    // Compute MST weight using Kruskal's; optionally force-include or exclude one edge
    const mstWeight = (n, edges, include, exclude) => {
        const parent = Array.from({length: n}, (_, i) => i);
        let weight = 0;
        let count  = 0; // edges added to MST

        // Force-include this edge first (for pseudo-critical testing)
        if (include !== null) {
            const [w, u, v] = include;
            const pu = find(parent, u);
            const pv = find(parent, v);
            parent[pu] = pv;
            weight += w;
            count++;
        }

        for (const [w, u, v, i] of edges) {
            if (exclude !== null && i === exclude) continue; // skip excluded edge

            const pu = find(parent, u);
            const pv = find(parent, v);
            if (pu !== pv) {
                parent[pu] = pv;
                weight += w;
                count++;
            }
        }

        // If graph is not connected (not n-1 edges added), return infinity
        return count < n - 1 ? Infinity : weight;
    };

    const base = mstWeight(n, indexedEdges, null, null);
    const critical = [];
    const pseudo   = [];

    for (const [w, u, v, i] of indexedEdges) {
        // Critical: removing this edge increases MST weight (or disconnects)
        if (mstWeight(n, indexedEdges, null, i) > base) {
            critical.push(i);
        }
        // Pseudo-critical: forcing it in still produces an optimal MST
        else if (mstWeight(n, indexedEdges, [w, u, v], null) === base) {
            pseudo.push(i);
        }
    }
    return [critical, pseudo];
};`,
    jsWalkthrough:
      'Input: n=5, edges=[[0,1,1],[1,2,1],[2,3,2],[0,3,2],[0,4,3],[3,4,3],[1,4,6]]\n\n' +
      'indexedEdges sorted by weight:\n' +
      '  [1,0,1,0],[1,1,2,1],[2,2,3,2],[2,0,3,3],[3,0,4,4],[3,3,4,5],[6,1,4,6]\n\n' +
      'base MST: edges 0,1 (w=1+1=2) + edge 2 (w=2) + edge 4 (w=3) = weight=7 (n-1=4 edges)\n\n' +
      'Test edge 0 (exclusion): MST without edge 0\n' +
      '  Must use edge 3 (weight 2) instead -> total=8 > 7 -> CRITICAL\n\n' +
      'Test edge 1 (exclusion): similar reasoning -> CRITICAL\n\n' +
      'Test edge 2 (exclusion):\n' +
      '  Can use edge 3 with same weight 2 -> total=7 -> not critical\n' +
      '  Inclusion test: force edge 2, build MST -> weight=7 -> PSEUDO-CRITICAL\n\n' +
      'Return [[0,1],[2,3,4,5]]',
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
    intuition:
      'Just sum everything, subtract the min and max, and divide by (n-2). It is like dropping the highest and lowest scores in a judging competition.',
    approach:
      'Find the sum of all salaries, subtract the minimum and maximum, then divide by (n - 2).',
    code: `class Solution:
    def average(self, salary: list[int]) -> float:
        return (sum(salary) - min(salary) - max(salary)) / (len(salary) - 2)`,
    jsCode: `var average = function(salary) {
    const total     = salary.reduce((a, b) => a + b, 0);
    const minSalary = Math.min(...salary);
    const maxSalary = Math.max(...salary);
    // Exclude the minimum and maximum, then divide by the remaining count
    return (total - minSalary - maxSalary) / (salary.length - 2);
};`,
    jsWalkthrough:
      'Input: salary = [4000,3000,1000,2000]\n\n' +
      'total     = 4000+3000+1000+2000 = 10000\n' +
      'minSalary = 1000\n' +
      'maxSalary = 4000\n\n' +
      '(10000 - 1000 - 4000) / (4 - 2) = 5000 / 2 = 2500.0\n\n' +
      'Return 2500.0',
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
    intuition:
      'Simply iterate from 1 to n, checking divisibility. Each divisor found is one step closer to the k-th factor. Factors naturally appear in ascending order when iterating upward.',
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
    let count = 0; // how many factors we have found so far
    for (let i = 1; i <= n; i++) {
        if (n % i === 0) {
            // i divides n evenly — it is a factor
            count++;
            if (count === k) {
                return i; // found the k-th factor
            }
        }
    }
    return -1; // fewer than k factors exist
};`,
    jsWalkthrough:
      'Input: n=12, k=3\n\n' +
      'i=1: 12%1=0 -> count=1\n' +
      'i=2: 12%2=0 -> count=2\n' +
      'i=3: 12%3=0 -> count=3 === k=3 -> return 3\n\n' +
      'Return 3',
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
    intuition:
      'This is a sliding window problem: find the longest window with at most one zero. Since we must delete exactly one element, the answer is the window size minus 1. The window allows one zero to represent the deleted element.',
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
    let left  = 0; // left boundary of the sliding window
    let zeros = 0; // count of zeros in the current window
    let best  = 0; // length of the best window (excluding the deleted element)

    for (let right = 0; right < nums.length; right++) {
        // Expand window to include nums[right]
        if (nums[right] === 0) {
            zeros++;
        }

        // Shrink from left if more than one zero (we can delete at most one element)
        while (zeros > 1) {
            if (nums[left] === 0) {
                zeros--;
            }
            left++;
        }

        // Window [left..right] has at most one zero.
        // We must delete exactly one element, so the usable length is right - left
        // (window length is right-left+1, minus 1 for the deleted element)
        best = Math.max(best, right - left);
    }
    return best;
};`,
    jsWalkthrough:
      'Input: nums = [1,1,0,1]\n\n' +
      'right=0 (1): zeros=0, window=[0..0], best=max(0,0-0)=0\n' +
      'right=1 (1): zeros=0, window=[0..1], best=max(0,1-0)=1\n' +
      'right=2 (0): zeros=1, window=[0..2], best=max(1,2-0)=2\n' +
      'right=3 (1): zeros=1, window=[0..3], best=max(2,3-0)=3\n\n' +
      'Return 3\n\n' +
      'Explanation: delete the zero at index 2 -> subarray [1,1,1] of length 3',
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
    intuition:
      'After sorting, use two pointers to pair smallest with largest elements. For each left pointer (the subsequence minimum), find how far right you can go while keeping min+max within target. All 2^(right-left) subsets are valid.',
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

    // Precompute powers of 2 up to n so we can look up 2^(right-left) in O(1)
    const pow2 = new Array(n).fill(1);
    for (let i = 1; i < n; i++) {
        pow2[i] = (pow2[i - 1] * 2) % MOD;
    }

    let result = 0;
    let left   = 0;
    let right  = n - 1;

    while (left <= right) {
        if (nums[left] + nums[right] <= target) {
            // nums[left] is the minimum of any valid subsequence with this left pointer.
            // We can include any subset of elements in [left+1, right] as the other members.
            // There are 2^(right-left) such subsets.
            result = (result + pow2[right - left]) % MOD;
            left++;
        } else {
            // Maximum too large; shrink from the right
            right--;
        }
    }
    return result;
};`,
    jsWalkthrough:
      'Input: nums = [3,5,6,7], target = 9\n\n' +
      'After sort: [3,5,6,7], n=4\n' +
      'pow2 = [1,2,4,8]\n\n' +
      'left=0, right=3:\n' +
      '  nums[0]+nums[3] = 3+7=10 > 9 -> right=2\n\n' +
      'left=0, right=2:\n' +
      '  nums[0]+nums[2] = 3+6=9 <= 9\n' +
      '  Add pow2[2-0]=pow2[2]=4 -> result=4, left=1\n\n' +
      'left=1, right=2:\n' +
      '  nums[1]+nums[2] = 5+6=11 > 9 -> right=1\n\n' +
      'left=1, right=1:\n' +
      '  nums[1]+nums[1] = 5+5=10 > 9 -> right=0\n\n' +
      'right=0 < left=1 -> exit\n\n' +
      'Return 4',
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
    intuition:
      'Build a histogram of consecutive 1-heights for each row. Then for each cell, scan left while tracking the minimum height, counting all-ones submatrices. Each minimum height at width w contributes w rectangles of varying heights.',
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
    const m = mat.length;
    const n = mat[0].length;
    // height[j] = number of consecutive 1s ending at current row in column j
    const height = new Array(n).fill(0);
    let total = 0;

    for (let i = 0; i < m; i++) {
        // Update histogram heights for row i
        for (let j = 0; j < n; j++) {
            height[j] = mat[i][j] === 1 ? height[j] + 1 : 0;
        }

        // For each cell (i, j), count all-ones submatrices ending at column j, row i
        for (let j = 0; j < n; j++) {
            let minH = height[j]; // minimum bar height from column k to j
            for (let k = j; k >= 0; k--) {
                if (height[k] === 0) break; // column k has no 1s in this row -> stop
                minH = Math.min(minH, height[k]);
                // minH all-ones submatrices of varying heights with right column = j, left column = k
                total += minH;
            }
        }
    }
    return total;
};`,
    jsWalkthrough:
      'Input: mat = [[1,0,1],[1,1,0],[1,1,0]]\n\n' +
      'Row 0: mat=[1,0,1]\n' +
      '  height=[1,0,1]\n' +
      '  j=0: minH=1, k=0: minH=min(1,1)=1, total+=1 -> total=1\n' +
      '  j=1: height[1]=0 -> minH=0, immediately break -> total=1\n' +
      '  j=2: minH=1, k=2: total+=1=2; k=1: height[1]=0, break -> total=2\n\n' +
      'Row 1: mat=[1,1,0]\n' +
      '  height=[2,1,0]\n' +
      '  j=0: k=0: minH=2, total+=2 -> total=4\n' +
      '  j=1: k=1: minH=1, total+=1=5; k=0: minH=min(1,2)=1, total+=1=6 -> total=6\n' +
      '  j=2: height[2]=0 -> skip\n\n' +
      'Row 2: same as row 1 for cols 0,1 (heights=[3,2,0])\n' +
      '  j=0: k=0: minH=3, total+=3=9\n' +
      '  j=1: k=1: minH=2, total+=2=11; k=0: minH=min(2,3)=2, total+=2=13\n\n' +
      'Return 13',
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
    intuition:
      'Greedily pick the smallest digit that can be moved to the front within the remaining swaps. A Fenwick tree efficiently tracks how many positions before each digit have already been used, giving the true swap cost.',
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

    // queues[d] = sorted list of original positions where digit d appears
    const queues = Array.from({length: 10}, () => []);
    for (let i = 0; i < num.length; i++) {
        queues[Number(num[i])].push(i);
    }

    const n = num.length;
    // Fenwick tree (BIT) to count how many positions before idx have been "used"
    const bit = new Array(n + 1).fill(0);

    const update = (i, val) => {
        i++;
        while (i <= n) {
            bit[i] += val;
            i += i & (-i);
        }
    };

    const query = (i) => {
        let s = 0;
        i++;
        while (i > 0) {
            s += bit[i];
            i -= i & (-i);
        }
        return s;
    };

    const result = [];
    for (let pos = 0; pos < n; pos++) {
        // Try each digit 0-9 in order (prefer smaller digits)
        for (let d = 0; d <= 9; d++) {
            if (!queues[d].length) continue;

            const idx = queues[d][0]; // original position of this digit
            // Actual number of adjacent swaps needed to bring this digit to the front
            // = original index - number of elements before it that have already been placed
            const swaps = idx - query(idx);

            if (swaps <= k) {
                k -= swaps;
                queues[d].shift();
                result.push(String(d));
                update(idx, 1); // mark this position as used
                break;
            }
        }
    }
    return result.join('');
};`,
    jsWalkthrough:
      'Input: num = "4321", k = 4\n\n' +
      'queues: 1->[3], 2->[2], 3->[1], 4->[0]\n' +
      'bit = [0,0,0,0,0]\n\n' +
      'pos=0: try d=1, idx=3, query(3)=0, swaps=3-0=3 <= k=4\n' +
      '  k=4-3=1, result=["1"], update(3,1), bit marks pos 3 used\n\n' +
      'pos=1: try d=2, idx=2, query(2)=0 (bit[3] doesnt cover idx=2), swaps=2-0=2 > k=1\n' +
      '  try d=3, idx=1, query(1)=0, swaps=1-0=1 <= k=1\n' +
      '  k=1-1=0, result=["1","3"], update(1,1)\n\n' +
      'pos=2: k=0, no swaps allowed\n' +
      '  try d=2, idx=2, swaps=2-0=2 > 0\n' +
      '  try d=4, idx=0, swaps=0-0=0 <= 0\n' +
      '  result=["1","3","4"], update(0,1)\n\n' +
      'pos=3: d=2, idx=2, swaps=2-2=0 <= 0 (2 positions before idx 2 are used: 0 and 1)\n' +
      '  Actually query(2) counts used positions up to idx 2: positions 0,1 used -> 2\n' +
      '  swaps=2-2=0 -> result=["1","3","4","2"]\n\n' +
      'Return "1342"',
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
    intuition:
      'Generate all n*(n+1)/2 subarray sums, sort them, and sum the requested range. For small arrays, brute force generation is efficient enough.',
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

    // Generate all n*(n+1)/2 subarray sums
    for (let i = 0; i < n; i++) {
        let runningSum = 0;
        for (let j = i; j < n; j++) {
            runningSum += nums[j];
            sums.push(runningSum);
        }
    }

    // Sort all subarray sums
    sums.sort((a, b) => a - b);

    // Sum elements from index left-1 to right-1 (convert from 1-indexed to 0-indexed)
    let result = 0;
    for (let i = left - 1; i < right; i++) {
        result = (result + sums[i]) % MOD;
    }
    return result;
};`,
    jsWalkthrough:
      'Input: nums = [1,2,3,4], n=4, left=1, right=5\n\n' +
      'Generate all subarray sums:\n' +
      '  i=0: [1],[1+2=3],[1+2+3=6],[1+2+3+4=10]\n' +
      '  i=1: [2],[2+3=5],[2+3+4=9]\n' +
      '  i=2: [3],[3+4=7]\n' +
      '  i=3: [4]\n' +
      'sums = [1,3,6,10,2,5,9,3,7,4]\n\n' +
      'After sort: [1,2,3,3,4,5,6,7,9,10]\n\n' +
      'Sum indices 0..4 (left=1 to right=5):\n' +
      '  1+2+3+3+4 = 13\n\n' +
      'Return 13',
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
    intuition:
      'With 3 moves, you can neutralize 3 extreme values. Sort the array and try all 4 combinations: remove 0-3 from the left and 3-0 from the right. The answer is the minimum remaining range.',
    approach:
      'Sort the array. With 3 moves, we can remove the 3 largest, 3 smallest, or a combination. Check all 4 options: remove i from the left and 3-i from the right for i in 0..3.',
    code: `class Solution:
    def minDifference(self, nums: list[int]) -> int:
        if len(nums) <= 4:
            return 0
        nums.sort()
        return min(nums[-(4 - i)] - nums[i] for i in range(4))`,
    jsCode: `var minDifference = function(nums) {
    // With 3 moves we can eliminate 3 extremes; if 4 or fewer elements, make all equal
    if (nums.length <= 4) return 0;

    nums.sort((a, b) => a - b);

    let result = Infinity;
    // Try all 4 combinations: remove i from the left and (3-i) from the right
    for (let i = 0; i < 4; i++) {
        const leftPtr  = i;                           // skip i smallest elements
        const rightPtr = nums.length - (4 - i) - 1;  // skip (3-i) largest elements
        const rangeAfterRemovals = nums[rightPtr + (4 - i)] - nums[i];
        // Simplified: range of remaining extremes
        result = Math.min(result, nums[nums.length - (4 - i)] - nums[i]);
    }
    return result;
};`,
    jsWalkthrough:
      'Input: nums = [5,3,2,4]\n\n' +
      'Length=4 <= 4 -> return 0\n\n' +
      '---\n' +
      'Input: nums = [1,5,0,10,14]\n\n' +
      'After sort: [0,1,5,10,14], n=5\n\n' +
      'i=0: nums[5-4]-nums[0] = nums[1]-nums[0] = 1-0 = 1\n' +
      'i=1: nums[5-3]-nums[1] = nums[2]-nums[1] = 5-1 = 4\n' +
      'i=2: nums[5-2]-nums[2] = nums[3]-nums[2] = 10-5 = 5\n' +
      'i=3: nums[5-1]-nums[3] = nums[4]-nums[3] = 14-10 = 4\n\n' +
      'result = min(1,4,5,4) = 1\n\n' +
      'Return 1',
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
    intuition:
      'As you scan the array, each element forms a good pair with every previous occurrence of the same value. Maintain a frequency counter and for each element, add its current count to the result before incrementing.',
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
    const count = new Map(); // frequency of each value seen so far
    let result = 0;

    for (const num of nums) {
        // Each previous occurrence of num forms a good pair with the current element
        result += count.get(num) || 0;
        // Update frequency for future elements
        count.set(num, (count.get(num) || 0) + 1);
    }
    return result;
};`,
    jsWalkthrough:
      'Input: nums = [1,2,3,1,1,3]\n\n' +
      'Process 1: result+=0, count={1:1}\n' +
      'Process 2: result+=0, count={1:1,2:1}\n' +
      'Process 3: result+=0, count={1:1,2:1,3:1}\n' +
      'Process 1: result+=1 (pair with index 0), count={1:2,2:1,3:1}\n' +
      'Process 1: result+=2 (pairs with indices 0,3), count={1:3,2:1,3:1}\n' +
      'Process 3: result+=1 (pair with index 2), count={1:3,2:1,3:2}\n\n' +
      'Total = 0+0+0+1+2+1 = 4\n\n' +
      'Return 4',
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
    intuition:
      'This is Dijkstra\'s algorithm but maximizing probability instead of minimizing distance. Multiply probabilities along edges instead of adding distances, and use a max-heap to always expand the most promising path first.',
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
    // Build adjacency list: graph[u] = [[v, prob], ...]
    const graph = new Map();
    for (let i = 0; i < n; i++) {
        graph.set(i, []);
    }
    for (let i = 0; i < edges.length; i++) {
        const [u, v] = edges[i];
        const p = succProb[i];
        graph.get(u).push([v, p]);
        graph.get(v).push([u, p]);
    }

    // prob[i] = best known probability to reach node i from startNode
    const prob = new Array(n).fill(0);
    prob[startNode] = 1.0;

    // BFS-based relaxation: like Dijkstra but for maximum probability
    const queue = [startNode];
    while (queue.length) {
        const node = queue.shift();
        for (const [neighbor, edgeProb] of graph.get(node)) {
            const newProb = prob[node] * edgeProb;
            if (newProb > prob[neighbor]) {
                // Found a better path to neighbor — update and enqueue
                prob[neighbor] = newProb;
                queue.push(neighbor);
            }
        }
    }
    return prob[endNode];
};`,
    jsWalkthrough:
      'Input: n=3, edges=[[0,1],[1,2],[0,2]], succProb=[0.5,0.5,0.2], start=0, end=2\n\n' +
      'graph: 0->[[1,0.5],[2,0.2]], 1->[[0,0.5],[2,0.5]], 2->[[1,0.5],[0,0.2]]\n' +
      'prob = [1.0, 0.0, 0.0], queue=[0]\n\n' +
      'Process 0:\n' +
      '  neighbor=1: newProb=1.0*0.5=0.5 > 0.0 -> prob[1]=0.5, enqueue 1\n' +
      '  neighbor=2: newProb=1.0*0.2=0.2 > 0.0 -> prob[2]=0.2, enqueue 2\n' +
      'queue=[1,2]\n\n' +
      'Process 1:\n' +
      '  neighbor=0: newProb=0.5*0.5=0.25 < prob[0]=1.0 -> skip\n' +
      '  neighbor=2: newProb=0.5*0.5=0.25 > prob[2]=0.2 -> prob[2]=0.25, enqueue 2\n' +
      'queue=[2,2]\n\n' +
      'Process 2 (first): prob[2]=0.25\n' +
      '  neighbor=1: 0.25*0.5=0.125 < 0.5 -> skip\n' +
      '  neighbor=0: 0.25*0.2=0.05 < 1.0 -> skip\n\n' +
      'Process 2 (second): same result\n\n' +
      'Return prob[2] = 0.25',
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
    intuition:
      'Simulate the exchange cycle: drink all bottles, trade empties for new full ones, drink those, repeat. Each round, you get floor(empties / exchange_rate) new bottles and keep the leftover empties.',
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
    let total = numBottles; // we drink the initial bottles right away
    let empty = numBottles; // empty bottles available for exchange

    while (empty >= numExchange) {
        // Exchange empties for new full bottles
        const newFull = Math.floor(empty / numExchange);
        total += newFull;                             // drink the new bottles
        empty = (empty % numExchange) + newFull;      // remaining empties + newly emptied
    }
    return total;
};`,
    jsWalkthrough:
      'Input: numBottles=9, numExchange=3\n\n' +
      'total=9, empty=9\n\n' +
      'Round 1: newFull=floor(9/3)=3, total=9+3=12, empty=9%3+3=0+3=3\n' +
      'Round 2: newFull=floor(3/3)=1, total=12+1=13, empty=3%3+1=0+1=1\n' +
      'empty=1 < numExchange=3 -> stop\n\n' +
      'Return 13',
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
    intuition:
      'Counting odd numbers in a range is a math formula. The count of odds from 0 to n is (n+1)//2. Apply inclusion-exclusion for the range [low, high] to get (high+1)//2 - low//2.',
    approach:
      'The count of odd numbers from 0 to n is (n + 1) // 2. Use inclusion-exclusion: count from 0 to high minus count from 0 to low - 1.',
    code: `class Solution:
    def countOdds(self, low: int, high: int) -> int:
        return (high + 1) // 2 - low // 2`,
    jsCode: `var countOdds = function(low, high) {
    // Count of odds from 0 to n is floor((n+1)/2)
    // Count of odds in [low, high] = count(0..high) - count(0..low-1)
    const oddsUpToHigh = Math.floor((high + 1) / 2);
    const oddsBeforeLow = Math.floor(low / 2);
    return oddsUpToHigh - oddsBeforeLow;
};`,
    jsWalkthrough:
      'Input: low=3, high=7\n\n' +
      'oddsUpToHigh = floor((7+1)/2) = floor(8/2) = 4  (1,3,5,7)\n' +
      'oddsBeforeLow = floor(3/2) = floor(1.5) = 1      (1)\n\n' +
      'Result = 4 - 1 = 3  (3,5,7)\n\n' +
      'Return 3',
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
    intuition:
      'Visualize the target array as a histogram painted by horizontal brush strokes. Every time the height increases from one bar to the next, you need new brush strokes. Decreases are free because existing strokes just end earlier.',
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
    // The first element requires that many horizontal brush strokes from zero
    let result = target[0];

    for (let i = 1; i < target.length; i++) {
        if (target[i] > target[i - 1]) {
            // Going higher requires additional strokes equal to the increase
            result += target[i] - target[i - 1];
        }
        // Decreases are free: existing strokes simply stop at the previous bar
    }
    return result;
};`,
    jsWalkthrough:
      'Input: target = [1,2,3,2,1]\n\n' +
      'result = target[0] = 1  (1 stroke needed for height 1)\n\n' +
      'i=1: target[1]=2 > target[0]=1 -> result += 2-1=1, result=2\n' +
      'i=2: target[2]=3 > target[1]=2 -> result += 3-2=1, result=3\n' +
      'i=3: target[3]=2 < target[2]=3 -> no addition\n' +
      'i=4: target[4]=1 < target[3]=2 -> no addition\n\n' +
      'Return 3\n\n' +
      'Verification: visualize as histogram [1,2,3,2,1]\n' +
      '  Stroke 1: covers all 5 bars at height 1\n' +
      '  Stroke 2: covers bars 1-4 at height 2  (4 bars)\n' +
      '  Stroke 3: covers bar 2 at height 3      (1 bar)\n' +
      '  Total = 3 strokes',
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
    intuition:
      'The shuffle mapping is direct: character at position i goes to position indices[i]. Create a result array, place each character at its target position, and join.',
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
    // Place each character at its target position
    for (let i = 0; i < s.length; i++) {
        result[indices[i]] = s[i];
    }
    return result.join('');
};`,
    jsWalkthrough:
      'Input: s = "codeleet", indices = [4,5,6,7,0,2,1,3]\n\n' +
      'result = [_,_,_,_,_,_,_,_]\n\n' +
      'i=0: result[indices[0]]=result[4] = s[0]="c"\n' +
      'i=1: result[indices[1]]=result[5] = s[1]="o"\n' +
      'i=2: result[indices[2]]=result[6] = s[2]="d"\n' +
      'i=3: result[indices[3]]=result[7] = s[3]="e"\n' +
      'i=4: result[indices[4]]=result[0] = s[4]="l"\n' +
      'i=5: result[indices[5]]=result[2] = s[5]="e"\n' +
      'i=6: result[indices[6]]=result[1] = s[6]="e"\n' +
      'i=7: result[indices[7]]=result[3] = s[7]="t"\n\n' +
      'result = ["l","e","e","t","c","o","d","e"]\n\n' +
      'Return "leetcode"',
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
    intuition:
      'Post-order DFS returns the distances from each node to its leaf descendants. At each internal node, pair up leaves from the left and right subtrees and check if their combined distance is within the limit.',
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

    // Returns array of distances from this node to all its leaf descendants
    const dfs = (node) => {
        if (!node) return [];
        if (!node.left && !node.right) {
            // Leaf node: distance 1 from parent
            return [1];
        }

        const leftDistances  = dfs(node.left);
        const rightDistances = dfs(node.right);

        // Check all pairs (left leaf, right leaf) through this node
        for (const l of leftDistances) {
            for (const r of rightDistances) {
                if (l + r <= distance) {
                    count++;
                }
            }
        }

        // Return distances incremented by 1 (one more step to parent)
        // Prune: skip distances that already can't form a valid pair
        const allDistances = [...leftDistances, ...rightDistances];
        return allDistances
            .filter(d => d + 1 < distance)
            .map(d => d + 1);
    };

    dfs(root);
    return count;
};`,
    jsWalkthrough:
      'Input: root = [1,2,3,null,4], distance = 3\n' +
      'Tree: 1 has children 2 and 3; 2 has right child 4\n\n' +
      'dfs(4): leaf -> return [1]\n' +
      'dfs(2): no left, right=[1]\n' +
      '  no left-right pairs -> return [1+1=2] (filter: 2<3 ok)\n\n' +
      'dfs(3): leaf -> return [1]\n\n' +
      'dfs(1): left=[2], right=[1]\n' +
      '  pair (2, 1): 2+1=3 <= 3 -> count=1\n' +
      '  return distances incremented: [3,2] -> filter d+1<3: only d=1 (2<3 ok) -> [2]... wait\n' +
      '  Actually: left=[2] from node 2, right=[1] from node 3\n' +
      '  After increment: [3, 2] -> filter d+1 < distance=3: d=1 gives 2<3 ok, d=2 gives 3 not <3\n' +
      '  Pruned to [2]\n\n' +
      'Return count = 1',
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
    intuition:
      'Once you have seen all elements, the maximum element will win every future comparison. So you only need to simulate at most n-1 comparisons, tracking consecutive wins. If k is large, the answer is simply the array maximum.',
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
    let current = arr[0]; // current reigning winner
    let wins    = 0;       // consecutive wins

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > current) {
            // A stronger challenger takes over
            current = arr[i];
            wins    = 1;
        } else {
            // Current winner beats the challenger
            wins++;
        }

        if (wins === k) {
            return current; // reached k consecutive wins
        }
    }

    // After one full pass, the max element wins all remaining rounds
    return current;
};`,
    jsWalkthrough:
      'Input: arr = [2,1,3,5,4,6,7], k = 2\n\n' +
      'current=2, wins=0\n\n' +
      'i=1: arr[1]=1 < 2 -> wins=1. wins!=2, continue\n' +
      'i=2: arr[2]=3 > 2 -> current=3, wins=1. wins!=2, continue\n' +
      'i=3: arr[3]=5 > 3 -> current=5, wins=1. wins!=2, continue\n' +
      'i=4: arr[4]=4 < 5 -> wins=2. wins===k=2 -> return 5\n\n' +
      'Return 5',
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
    intuition:
      'At each index i in the sorted array, the number of missing positive integers before arr[i] is arr[i] - (i+1). Binary search for where this count reaches k, and the answer is lo + k.',
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
    // At index i, arr[i] - (i+1) = number of missing positives before arr[i]
    // Binary search for the first index where missing count >= k
    let lo = 0;
    let hi = arr.length;

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        const missingBeforeMid = arr[mid] - (mid + 1);

        if (missingBeforeMid >= k) {
            hi = mid; // the k-th missing might be before arr[mid]
        } else {
            lo = mid + 1; // not enough missing yet, search right
        }
    }

    // lo is the insertion point: k-th missing = lo + k
    return lo + k;
};`,
    jsWalkthrough:
      'Input: arr = [2,3,4,7,11], k = 5\n\n' +
      'Missing counts at each index:\n' +
      '  i=0: arr[0]-1=2-1=1 (missing: 1)\n' +
      '  i=1: arr[1]-2=3-2=1 (missing: 1)\n' +
      '  i=2: arr[2]-3=4-3=1 (missing: 1)\n' +
      '  i=3: arr[3]-4=7-4=3 (missing: 1,5,6)\n' +
      '  i=4: arr[4]-5=11-5=6 (missing: 1,5,6,8,9,10)\n\n' +
      'lo=0, hi=5\n\n' +
      'mid=2: missing=arr[2]-3=1 < k=5 -> lo=3\n' +
      'mid=4: missing=arr[4]-5=6 >= 5 -> hi=4\n' +
      'mid=3: missing=arr[3]-4=3 < 5 -> lo=4\n\n' +
      'lo=hi=4\n' +
      'Return lo+k = 4+5 = 9',
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
    intuition:
      'Each opening parenthesis needs exactly two closing parentheses. When you encounter a single closing paren without a pair, insert one. Track unmatched opens and at the end, each needs two insertions.',
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
    let opens      = 0; // unmatched '(' count
    let insertions = 0; // insertions needed
    let i          = 0;

    while (i < s.length) {
        if (s[i] === '(') {
            opens++;
            i++;
        } else {
            // We have a ')'; check if the next character is also ')'
            if (i + 1 < s.length && s[i + 1] === ')') {
                // Consume '))'  — a valid pair for one '('
                i += 2;
            } else {
                // Only one ')' — insert a second ')' to complete the pair
                insertions++;
                i++;
            }

            // Now try to match this '))' with an unmatched '('
            if (opens > 0) {
                opens--; // matched!
            } else {
                // No unmatched '(' — need to insert a '('
                insertions++;
            }
        }
    }

    // Each remaining unmatched '(' needs 2 closing parens
    insertions += opens * 2;
    return insertions;
};`,
    jsWalkthrough:
      'Input: s = "(()))"\n' +
      'Rule: each "(" must be followed by "))"\n\n' +
      'i=0: "(" -> opens=1\n' +
      'i=1: "(" -> opens=2\n' +
      'i=2: ")" -> next s[3]=")" -> i+=2, consume "))", opens-- -> opens=1\n' +
      'i=4: ")" -> next out of bounds -> insert one ")", insertions=1, i++\n' +
      '         opens>0 -> opens-- -> opens=0\n\n' +
      'End: opens=0 -> insertions += 0*2 = 0\n\n' +
      'Return insertions=1',
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
    intuition:
      'Use a stack like matching parentheses. If the top of the stack and the current character are the same letter but different case (like \'a\' and \'A\'), they cancel out. Otherwise, push the character.',
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
        const top = stack[stack.length - 1];
        // A bad pair: same letter but different case (e.g., 'a' and 'A')
        const isBadPair = stack.length > 0 &&
                          top !== c &&
                          top.toLowerCase() === c.toLowerCase();

        if (isBadPair) {
            stack.pop(); // cancel out the bad pair
        } else {
            stack.push(c);
        }
    }
    return stack.join('');
};`,
    jsWalkthrough:
      'Input: s = "leEeetcode"\n\n' +
      'Process "l": stack=["l"]\n' +
      'Process "e": stack=["l","e"]\n' +
      'Process "E": top="e", "e"!="E" and toLowerCase match -> bad pair! pop\n' +
      '  stack=["l"]\n' +
      'Process "e": stack=["l","e"]\n' +
      'Process "e": stack=["l","e","e"]\n' +
      'Process "t": stack=["l","e","e","t"]\n' +
      'Process "c": stack=["l","e","e","t","c"]\n' +
      'Process "o": stack=["l","e","e","t","c","o"]\n' +
      'Process "d": stack=["l","e","e","t","c","o","d"]\n' +
      'Process "e": stack=["l","e","e","t","c","o","d","e"]\n\n' +
      'Return "leetcode"',
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
    intuition:
      'The string has a recursive mirror structure. The middle is always \'1\'. If the position is in the first half, recurse normally. If in the second half, find the mirrored position and flip the bit.',
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
    // Base case: S1 = "0"
    if (n === 1) return '0';

    const length = (1 << n) - 1;   // length of Sn = 2^n - 1
    const mid    = Math.floor(length / 2) + 1; // middle position (1-indexed)

    if (k === mid) {
        return '1'; // middle bit is always '1'
    } else if (k < mid) {
        // First half: same as Sn-1
        return findKthBit(n - 1, k);
    } else {
        // Second half: mirror position in the first half, then invert
        const mirrored = length - k + 1;
        const bit = findKthBit(n - 1, mirrored);
        return bit === '0' ? '1' : '0';
    }
};`,
    jsWalkthrough:
      'Input: n=3, k=1\n\n' +
      'S1="0", S2="011", S3="0111001"\n\n' +
      'findKthBit(3, 1):\n' +
      '  length=(1<<3)-1=7, mid=4\n' +
      '  k=1 < mid=4 -> recurse findKthBit(2, 1)\n\n' +
      'findKthBit(2, 1):\n' +
      '  length=(1<<2)-1=3, mid=2\n' +
      '  k=1 < mid=2 -> recurse findKthBit(1, 1)\n\n' +
      'findKthBit(1, 1):\n' +
      '  n=1 -> return "0"\n\n' +
      'Back up: findKthBit(2,1) -> "0"\n' +
      'Back up: findKthBit(3,1) -> "0"\n\n' +
      'Return "0"',
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
    intuition:
      'This is interval DP where you try every possible order of cuts. The cost of each cut is the length of the current stick segment. Add endpoints 0 and n, sort, and dp[i][j] represents the minimum cost to make all cuts between positions i and j.',
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
    // Add boundary points 0 and n, then sort
    cuts = [0, ...cuts, n].sort((a, b) => a - b);
    const m = cuts.length;

    // dp[i][j] = minimum cost to make all cuts between cuts[i] and cuts[j]
    const dp = Array.from({length: m}, () => new Array(m).fill(0));

    // Process by interval length (bottom-up)
    for (let length = 2; length < m; length++) {
        for (let i = 0; i + length < m; i++) {
            const j = i + length;
            dp[i][j] = Infinity;

            // Try each possible first cut point k in (i, j)
            for (let k = i + 1; k < j; k++) {
                // Cost of cutting at k: length of current stick + sub-problem costs
                const cost = dp[i][k] + dp[k][j] + (cuts[j] - cuts[i]);
                dp[i][j] = Math.min(dp[i][j], cost);
            }
        }
    }
    return dp[0][m - 1];
};`,
    jsWalkthrough:
      'Input: n=7, cuts=[1,3,4,5]\n\n' +
      'After adding endpoints and sorting: cuts=[0,1,3,4,5,7], m=6\n\n' +
      'length=2 (adjacent cuts, no middle): all pairs (i,i+2)\n' +
      '  dp[0][2]: k=1: dp[0][1]+dp[1][2]+(3-0)=0+0+3=3\n' +
      '  dp[1][3]: k=2: 0+0+(4-1)=3\n' +
      '  dp[2][4]: k=3: 0+0+(5-3)=2\n' +
      '  dp[3][5]: k=4: 0+0+(7-4)=3\n\n' +
      'length=3:\n' +
      '  dp[0][3]: k=1: dp[0][1]+dp[1][3]+(4-0)=0+3+4=7\n' +
      '            k=2: dp[0][2]+dp[2][3]+(4-0)=3+0+4=7 -> dp[0][3]=7\n' +
      '  ...(similar for others)\n\n' +
      'dp[0][5] (full range 0..7) = 16\n\n' +
      'Return 16',
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
    intuition:
      'Binary search on the minimum distance between balls. For each candidate distance, greedily place balls left to right, skipping positions too close to the last placement. If you can place all m balls, try a larger distance.',
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

    // Check if we can place m balls with at least minDist between each
    const canPlace = (minDist) => {
        let count = 1;            // always place first ball at position[0]
        let last  = position[0]; // position of the last placed ball

        for (let i = 1; i < position.length; i++) {
            if (position[i] - last >= minDist) {
                count++;
                last = position[i];
                if (count === m) return true; // placed all balls
            }
        }
        return false;
    };

    // Binary search: largest valid minimum distance
    let lo = 1;
    let hi = Math.floor((position[position.length - 1] - position[0]) / (m - 1));

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (canPlace(mid)) {
            lo = mid + 1; // can do better
        } else {
            hi = mid - 1; // too spread out
        }
    }
    return hi; // hi is the largest valid minimum distance
};`,
    jsWalkthrough:
      'Input: position = [1,2,3,4,7], m = 3\n\n' +
      'After sort: [1,2,3,4,7]\n' +
      'lo=1, hi=floor((7-1)/(3-1))=3\n\n' +
      'mid=2: canPlace(2)?\n' +
      '  Start at 1, count=1, last=1\n' +
      '  i=1: 2-1=1 < 2 -> skip\n' +
      '  i=2: 3-1=2 >= 2 -> count=2, last=3\n' +
      '  i=3: 4-3=1 < 2 -> skip\n' +
      '  i=4: 7-3=4 >= 2 -> count=3 = m -> return true\n' +
      '  canPlace(2)=true -> lo=3\n\n' +
      'mid=3: canPlace(3)?\n' +
      '  Start at 1, count=1, last=1\n' +
      '  i=1: 2-1=1 < 3 -> skip\n' +
      '  i=2: 3-1=2 < 3 -> skip\n' +
      '  i=3: 4-1=3 >= 3 -> count=2, last=4\n' +
      '  i=4: 7-4=3 >= 3 -> count=3 = m -> return true\n' +
      '  canPlace(3)=true -> lo=4\n\n' +
      'lo=4 > hi=3 -> exit\n\n' +
      'Return hi=3',
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
    intuition:
      'Nodes with no incoming edges are like sources in a river: nothing flows into them, so they must be starting points. Every other node can be reached from some source. Just find all nodes with in-degree zero.',
    approach:
      'A node that has no incoming edges must be in the result set, because no other node can reach it. Nodes with incoming edges can be reached from some other node. Return all nodes with in-degree 0.',
    code: `class Solution:
    def findSmallestSetOfVertices(self, n: int, edges: list[list[int]]) -> list[int]:
        has_incoming = set()
        for _, v in edges:
            has_incoming.add(v)
        return [i for i in range(n) if i not in has_incoming]`,
    jsCode: `var findSmallestSetOfVertices = function(n, edges) {
    // Collect all nodes that have at least one incoming edge
    const hasIncoming = new Set();
    for (const [, v] of edges) {
        hasIncoming.add(v);
    }

    // Nodes with no incoming edges must be starting points
    const result = [];
    for (let i = 0; i < n; i++) {
        if (!hasIncoming.has(i)) {
            result.push(i);
        }
    }
    return result;
};`,
    jsWalkthrough:
      'Input: n=6, edges=[[0,1],[0,2],[2,5],[3,4],[4,2]]\n\n' +
      'Build hasIncoming from edge destinations:\n' +
      '  edge [0,1]: v=1 -> hasIncoming={1}\n' +
      '  edge [0,2]: v=2 -> hasIncoming={1,2}\n' +
      '  edge [2,5]: v=5 -> hasIncoming={1,2,5}\n' +
      '  edge [3,4]: v=4 -> hasIncoming={1,2,4,5}\n' +
      '  edge [4,2]: v=2 -> already there\n\n' +
      'hasIncoming = {1,2,4,5}\n\n' +
      'Check each node 0..5:\n' +
      '  0: not in hasIncoming -> result.push(0)\n' +
      '  1: in hasIncoming -> skip\n' +
      '  2: in hasIncoming -> skip\n' +
      '  3: not in hasIncoming -> result.push(3)\n' +
      '  4: in hasIncoming -> skip\n' +
      '  5: in hasIncoming -> skip\n\n' +
      'Return [0, 3]',
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
    intuition:
      'Union-Find detects cycles elegantly: when you try to connect two cells that are already in the same component, you have found a cycle. Only check right and down neighbors to avoid processing each edge twice.',
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
    const m = grid.length;
    const n = grid[0].length;

    // Flatten 2D grid to 1D for Union-Find
    const parent = Array.from({length: m * n}, (_, i) => i);

    const find = (x) => {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]]; // path halving
            x = parent[x];
        }
        return x;
    };

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            // Check neighbor below (i+1, j)
            if (i + 1 < m && grid[i][j] === grid[i + 1][j]) {
                const a = find(i * n + j);
                const b = find((i + 1) * n + j);
                if (a === b) return true; // already connected -> cycle!
                parent[a] = b;
            }
            // Check neighbor to the right (i, j+1)
            if (j + 1 < n && grid[i][j] === grid[i][j + 1]) {
                const a = find(i * n + j);
                const b = find(i * n + j + 1);
                if (a === b) return true; // already connected -> cycle!
                parent[a] = b;
            }
        }
    }
    return false;
};`,
    jsWalkthrough:
      'Input: grid = [["a","a","a"],["a","b","a"],["a","a","a"]]\n\n' +
      'All "a"s form a cycle around the "b".\n\n' +
      'Processing cells left-right, top-bottom, checking right and down neighbors:\n\n' +
      '(0,0)-(0,1) same "a": union(0,1)\n' +
      '(0,0)-(1,0) same "a": union(0,3)\n' +
      '(0,1)-(0,2) same "a": union(1,2)\n' +
      '(0,1)-(1,1): different "a" vs "b" -> skip\n' +
      '(0,2)-(1,2) same "a": union(2,5)\n' +
      '(1,0)-(1,1): different -> skip\n' +
      '(1,0)-(2,0) same "a": union(3,6)\n' +
      '(1,2)-(2,2) same "a": union(5,8)\n' +
      '(2,0)-(2,1) same "a": union(6,7)\n' +
      '(2,1)-(2,2) same "a":\n' +
      '  find(7) and find(8) - are they same root?\n' +
      '  root of 7: 6->3->0, root of 8: 5->2->1->0 -> same root=0 -> CYCLE!\n\n' +
      'Return true',
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
    intuition:
      'Sort the piles and give Bob the smallest ones. In each triple, Alice takes the biggest and you take the second biggest. After sorting, your picks are every other pile from the large end: indices -2, -4, -6, and so on.',
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
    const n = Math.floor(piles.length / 3); // number of rounds

    let result = 0;
    // In each round, we pick the 2nd largest from a triple of piles.
    // Optimal: pairs are (Bob's smallest, our pick, Alice's biggest).
    // After sorting, our picks are at indices: length-2, length-4, length-6, ...
    for (let i = 0; i < n; i++) {
        result += piles[piles.length - 2 - 2 * i];
    }
    return result;
};`,
    jsWalkthrough:
      'Input: piles = [2,4,1,2,7,8], n_rounds = 6//3 = 2\n\n' +
      'After sort: [1,2,2,4,7,8]\n\n' +
      'n=2 rounds\n\n' +
      'i=0: piles[6-2-0] = piles[4] = 7\n' +
      'i=1: piles[6-2-2] = piles[2] = 2\n\n' +
      'result = 7+2 = 9\n\n' +
      'Verification:\n' +
      '  Round 1: pick piles[5]=8 for Alice, piles[4]=7 for us, piles[0]=1 for Bob\n' +
      '  Round 2: pick piles[3]=4 for Alice, piles[2]=2 for us, piles[1]=2 for Bob\n' +
      '  Our total = 7+2 = 9\n\n' +
      'Return 9',
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
    intuition:
      'Preprocess warehouse heights to account for bottlenecks: each room\'s effective height is the minimum from the entrance to that room. Then sort boxes smallest-first and greedily place them from the back of the warehouse forward.',
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
    // Preprocess: effective height = min from entrance (left) to current room
    // (A box must pass through all rooms from the entrance to reach deeper rooms)
    for (let i = 1; i < warehouse.length; i++) {
        warehouse[i] = Math.min(warehouse[i], warehouse[i - 1]);
    }

    // Sort boxes smallest first to maximize the number of boxes placed
    boxes.sort((a, b) => a - b);

    let count = 0;
    let j = warehouse.length - 1; // start from the back of warehouse

    for (const box of boxes) {
        // Skip rooms too short for this box
        while (j >= 0 && warehouse[j] < box) {
            j--;
        }
        if (j >= 0) {
            count++; // place this box in room j
            j--;     // move to the next room closer to entrance
        }
    }
    return count;
};`,
    jsWalkthrough:
      'Input: boxes = [4,3,4,1], warehouse = [5,3,3,4,1]\n\n' +
      'Preprocess warehouse heights:\n' +
      '  i=0: 5\n' +
      '  i=1: min(3,5)=3\n' +
      '  i=2: min(3,3)=3\n' +
      '  i=3: min(4,3)=3\n' +
      '  i=4: min(1,3)=1\n' +
      'effective = [5,3,3,3,1]\n\n' +
      'After sorting boxes: [1,3,4,4]\n' +
      'j=4 (start from back)\n\n' +
      'box=1: warehouse[4]=1 >= 1 -> count=1, j=3\n' +
      'box=3: warehouse[3]=3 >= 3 -> count=2, j=2\n' +
      'box=4: warehouse[2]=3 < 4 -> j=1\n' +
      '       warehouse[1]=3 < 4 -> j=0\n' +
      '       warehouse[0]=5 >= 4 -> count=3, j=-1\n' +
      'box=4: j=-1 < 0 -> skip\n\n' +
      'Return 3',
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
    intuition:
      'The answer is always 0, 1, or 2. Any island shape can be disconnected by removing at most 2 corner cells. Check the easy cases first (already disconnected, or removing one cell works), then default to 2.',
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
    const m = grid.length;
    const n = grid[0].length;

    // Count islands using DFS
    const countIslands = (g) => {
        const visited = Array.from({length: m}, () => new Array(n).fill(false));
        let count = 0;
        const dfs = (r, c) => {
            if (r < 0 || r >= m || c < 0 || c >= n || visited[r][c] || g[r][c] === 0) return;
            visited[r][c] = true;
            dfs(r + 1, c);
            dfs(r - 1, c);
            dfs(r, c + 1);
            dfs(r, c - 1);
        };
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                if (g[i][j] === 1 && !visited[i][j]) {
                    dfs(i, j);
                    count++;
                }
            }
        }
        return count;
    };

    // Already disconnected (0 or 2+ islands)?
    if (countIslands(grid) !== 1) return 0;

    // Try removing each land cell
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (grid[i][j] === 1) {
                grid[i][j] = 0;
                if (countIslands(grid) !== 1) return 1;
                grid[i][j] = 1; // restore
            }
        }
    }

    // Any connected island can always be disconnected in 2 moves
    return 2;
};`,
    jsWalkthrough:
      'Input: grid = [[0,1,1,0],[0,1,1,0],[0,0,0,0]]\n\n' +
      'countIslands(grid) = 1 -> continue\n\n' +
      'Try removing (0,1): grid[0][1]=0\n' +
      '  countIslands = 1 -> not disconnected, restore\n\n' +
      'Try removing (0,2): grid[0][2]=0\n' +
      '  countIslands: remaining 1s are (1,1),(1,2) still connected -> 1, restore\n\n' +
      'Try removing (1,1): grid[1][1]=0\n' +
      '  Remaining: (0,1),(0,2),(1,2) still connected -> 1, restore\n\n' +
      '...all single removals keep 1 island...\n\n' +
      'No single removal disconnects -> return 2',
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
    intuition:
      'The root is fixed. Elements smaller go left, larger go right. The key insight is counting how many ways to interleave left and right subsequences while preserving their internal order, which is a binomial coefficient.',
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

    // Precompute Pascal's triangle for binomial coefficients
    const C = Array.from({length: maxN}, () => new Array(maxN).fill(0n));
    for (let i = 0; i < maxN; i++) {
        C[i][0] = 1n;
        for (let j = 1; j <= i; j++) {
            C[i][j] = (C[i - 1][j - 1] + C[i - 1][j]) % MOD;
        }
    }

    // Count permutations that produce the same BST
    const solve = (arr) => {
        if (arr.length <= 2) return 1n; // 0 or 1 element: trivially 1 way

        const root  = arr[0];
        const left  = arr.filter(x => x < root); // left subtree values
        const right = arr.filter(x => x > root); // right subtree values

        // Ways to interleave left and right subsequences while preserving order
        const interleavings = C[left.length + right.length][left.length];
        // Multiply by recursive counts for each subtree
        return interleavings * solve(left) % MOD * solve(right) % MOD;
    };

    // Subtract 1 to exclude the original permutation
    return Number((solve(nums) - 1n + MOD) % MOD);
};`,
    jsWalkthrough:
      'Input: nums = [2,1,3]\n\n' +
      'solve([2,1,3]):\n' +
      '  root=2, left=[1], right=[3]\n' +
      '  C[1+1][1] = C[2][1] = 2\n' +
      '  solve([1]) = 1n (single element)\n' +
      '  solve([3]) = 1n (single element)\n' +
      '  return 2n * 1n * 1n = 2n\n\n' +
      'Answer = Number((2n - 1n + MOD) % MOD) = 1\n\n' +
      'Return 1\n\n' +
      'The 2 permutations giving the same BST are [2,1,3] and [2,3,1].\n' +
      'We return 2-1=1 (excluding the original).',
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
    intuition:
      'This is a memoized DFS where the state is (current city, remaining fuel). From each city, try every other city you can afford to visit. If you are at the finish, count it as a route but keep exploring since you might return and arrive again.',
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
    const n   = locations.length;
    const memo = new Map();

    // dp(city, fuelLeft) = number of ways to reach finish from city with fuelLeft fuel
    const dp = (city, fuelLeft) => {
        if (fuelLeft < 0) return 0;

        // Memoization key: encode state as city * (fuel+1) + fuelLeft
        const key = city * (fuel + 1) + fuelLeft;
        if (memo.has(key)) return memo.get(key);

        // If we are at the finish city, count this as 1 route (but keep exploring)
        let count = city === finish ? 1 : 0;

        // Try moving to every other city
        for (let nxt = 0; nxt < n; nxt++) {
            if (nxt !== city) {
                const cost = Math.abs(locations[city] - locations[nxt]);
                if (cost <= fuelLeft) {
                    count = (count + dp(nxt, fuelLeft - cost)) % MOD;
                }
            }
        }

        memo.set(key, count);
        return count;
    };

    return dp(start, fuel);
};`,
    jsWalkthrough:
      'Input: locations=[2,3,6,8,4], start=1, finish=3, fuel=5\n\n' +
      'dp(1, 5): city=1 (loc=3), not finish\n' +
      '  nxt=0: cost=|3-2|=1, dp(0,4)\n' +
      '  nxt=2: cost=|3-6|=3, dp(2,2)\n' +
      '  nxt=3: cost=|3-8|=5, dp(3,0)\n' +
      '  nxt=4: cost=|3-4|=1, dp(4,4)\n\n' +
      'dp(3, 0): city=3 (loc=8) === finish -> count=1\n' +
      '  No moves possible with fuel=0\n' +
      '  return 1\n\n' +
      'dp(0, 4): city=0, not finish\n' +
      '  nxt=3: cost=|2-8|=6 > 4 -> skip\n' +
      '  nxt=1: cost=|2-3|=1, dp(1,3)\n' +
      '  nxt=2: cost=|2-6|=4, dp(2,0)\n' +
      '  nxt=4: cost=|2-4|=2, dp(4,2)\n' +
      '  ... (continues recursively)\n\n' +
      'Total routes = 4\n\n' +
      'Return 4',
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
    intuition:
      'For each group of consecutive same-colored balloons, keep the most expensive one (hardest to remove) and remove all the cheaper ones. The cost per group is the total time minus the maximum time.',
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
    let total = 0;
    let i     = 0;

    while (i < colors.length) {
        // Start of a new group of same-colored balloons
        let j        = i;
        let groupSum = 0;
        let groupMax = 0;

        // Collect all balloons of the same color
        while (j < colors.length && colors[j] === colors[i]) {
            groupSum += neededTime[j];
            groupMax  = Math.max(groupMax, neededTime[j]);
            j++;
        }

        // Remove all but the most expensive balloon in this group
        total += groupSum - groupMax;
        i = j; // move to next group
    }
    return total;
};`,
    jsWalkthrough:
      'Input: colors = "abaac", neededTime = [1,2,3,4,5]\n\n' +
      'i=0: group "a" at index 0 only\n' +
      '  groupSum=1, groupMax=1, total += 1-1=0\n\n' +
      'i=1: group "b" at index 1 only\n' +
      '  groupSum=2, groupMax=2, total += 2-2=0\n\n' +
      'i=2: group "aa" at indices 2,3\n' +
      '  j=2: groupSum=3, groupMax=3\n' +
      '  j=3: groupSum=3+4=7, groupMax=max(3,4)=4\n' +
      '  total += 7-4=3  -> total=3\n\n' +
      'i=4: group "c" at index 4 only\n' +
      '  groupSum=5, groupMax=5, total += 5-5=0\n\n' +
      'Return 3',
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
    intuition:
      'Instead of enumerating all odd-length subarrays, count how many odd-length subarrays each element belongs to. For index i, there are (i+1)*(n-i) total subarrays, and about half have odd length.',
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
        // Number of subarrays starting at 0..i: (i+1) choices
        const left  = i + 1;
        // Number of subarrays ending at i..n-1: (n-i) choices
        const right = n - i;
        // Total subarrays containing arr[i]
        const totalSub = left * right;
        // About half of them have odd length: ceil(totalSub / 2)
        const oddCount = Math.floor((totalSub + 1) / 2);
        total += oddCount * arr[i];
    }
    return total;
};`,
    jsWalkthrough:
      'Input: arr = [1,4,2,5,3]\n\n' +
      'n=5\n\n' +
      'i=0 (val=1): left=1, right=5, totalSub=5, oddCount=ceil(5/2)=3, total+=3*1=3\n' +
      'i=1 (val=4): left=2, right=4, totalSub=8, oddCount=ceil(8/2)=4, total+=4*4=16, total=19\n' +
      'i=2 (val=2): left=3, right=3, totalSub=9, oddCount=ceil(9/2)=5, total+=5*2=10, total=29\n' +
      'i=3 (val=5): left=4, right=2, totalSub=8, oddCount=4, total+=4*5=20, total=49\n' +
      'i=4 (val=3): left=5, right=1, totalSub=5, oddCount=3, total+=3*3=9, total=58\n\n' +
      'Return 58',
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
    intuition:
      'Backtracking tries all possible ways to split the string into unique substrings. At each position, try every possible prefix as the next substring. Pruning (if remaining characters cannot improve the best) keeps it efficient.',
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
            // Reached the end — update best with current number of unique substrings
            best = Math.max(best, used.size);
            return;
        }

        // Pruning: even if each remaining character is its own substring, can we beat best?
        if (used.size + (s.length - start) <= best) return;

        // Try each possible prefix of the remaining string
        for (let end = start + 1; end <= s.length; end++) {
            const sub = s.substring(start, end);
            if (!used.has(sub)) {
                used.add(sub);
                backtrack(end, used);
                used.delete(sub); // backtrack
            }
        }
    };

    backtrack(0, new Set());
    return best;
};`,
    jsWalkthrough:
      'Input: s = "ababccc"\n\n' +
      'backtrack(0, {}):\n' +
      '  try sub="a": used={"a"}, backtrack(1,...)\n' +
      '    try sub="b": used={"a","b"}, backtrack(2,...)\n' +
      '      try sub="a": already in used -> skip\n' +
      '      try sub="ab": used={"a","b","ab"}, backtrack(4,...)\n' +
      '        try sub="c": used={"a","b","ab","c"}, backtrack(5,...)\n' +
      '          try sub="c": already in used -> skip\n' +
      '          try sub="cc": used={"a","b","ab","c","cc"}, backtrack(7)\n' +
      '            start=7=end -> best=max(0,5)=5 ✓\n' +
      '  ... (other branches explored)\n\n' +
      'Return 5',
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
    intuition:
      'Think of folder navigation as tracking depth. Going into a folder increases depth by 1, going up decreases by 1 (minimum 0), and staying does nothing. The final depth is how many \'cd ..\' operations you need.',
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
    let depth = 0; // current folder depth from main

    for (const log of logs) {
        if (log === '../') {
            // Move to parent folder (never go below main)
            depth = Math.max(0, depth - 1);
        } else if (log === './') {
            // Stay in current folder — no change
        } else {
            // Move into a child folder
            depth++;
        }
    }
    // depth = number of "../" needed to return to main
    return depth;
};`,
    jsWalkthrough:
      'Input: logs = ["d1/","d2/","../","d21/","./"]  \n\n' +
      '"d1/": depth=1\n' +
      '"d2/": depth=2\n' +
      '"../": depth=max(0,2-1)=1\n' +
      '"d21/": depth=2\n' +
      '"./": depth=2 (unchanged)\n\n' +
      'Return 2',
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
    intuition:
      'Greedily fill each cell with the minimum of the remaining row sum and column sum. This ensures you never overshoot, and since total row sums equal total column sums, everything balances out perfectly.',
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
    const m = rowSum.length;
    const n = colSum.length;
    const matrix = Array.from({length: m}, () => new Array(n).fill(0));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            // Assign as much as possible: limited by remaining row budget and column budget
            const val = Math.min(rowSum[i], colSum[j]);
            matrix[i][j] = val;
            rowSum[i] -= val; // reduce remaining row budget
            colSum[j] -= val; // reduce remaining column budget
        }
    }
    return matrix;
};`,
    jsWalkthrough:
      'Input: rowSum = [3,8], colSum = [4,7]\n\n' +
      '(0,0): val=min(3,4)=3, matrix[0][0]=3, rowSum=[0,8], colSum=[1,7]\n' +
      '(0,1): val=min(0,7)=0, matrix[0][1]=0, rowSum=[0,8], colSum=[1,7]\n' +
      '(1,0): val=min(8,1)=1, matrix[1][0]=1, rowSum=[0,7], colSum=[0,7]\n' +
      '(1,1): val=min(7,7)=7, matrix[1][1]=7, rowSum=[0,0], colSum=[0,0]\n\n' +
      'Result: [[3,0],[1,7]]\n\n' +
      'Verify: row 0 sum=3+0=3✓, row 1 sum=1+7=8✓\n' +
      '        col 0 sum=3+1=4✓, col 1 sum=0+7=7✓\n\n' +
      'Return [[3,0],[1,7]]',
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
    intuition:
      'Use a sorted set of available servers and a min-heap of busy servers. For each request, free finished servers, then find the next available server in circular order using binary search. Track request counts per server.',
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
    // Sorted array of available server IDs (maintained in order for binary search)
    const available = Array.from({length: k}, (_, i) => i);
    const busy  = []; // min-heap of [endTime, serverId]
    const count = new Array(k).fill(0);

    // Min-heap push
    const heapPush = (arr, val) => {
        arr.push(val);
        let i = arr.length - 1;
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);
            if (arr[p][0] <= arr[i][0]) break;
            [arr[p], arr[i]] = [arr[i], arr[p]];
            i = p;
        }
    };

    // Min-heap pop
    const heapPop = (arr) => {
        if (arr.length <= 1) return arr.pop();
        const v = arr[0];
        arr[0] = arr.pop();
        let i = 0;
        while (true) {
            let s = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < arr.length && arr[l][0] < arr[s][0]) s = l;
            if (r < arr.length && arr[r][0] < arr[s][0]) s = r;
            if (s === i) break;
            [arr[s], arr[i]] = [arr[i], arr[s]];
            i = s;
        }
        return v;
    };

    for (let i = 0; i < arrival.length; i++) {
        const t = arrival[i];

        // Free servers whose tasks have completed by time t
        while (busy.length && busy[0][0] <= t) {
            const [, server] = heapPop(busy);
            // Insert back into available in sorted position
            const insertIdx = lowerBound(available, server);
            available.splice(insertIdx, 0, server);
        }

        if (!available.length) continue; // all servers busy

        // Find the first available server >= i%k (circular preference)
        const target = i % k;
        let idx = lowerBound(available, target);
        if (idx === available.length) idx = 0; // wrap around

        const server = available[idx];
        available.splice(idx, 1); // remove from available
        heapPush(busy, [t + load[i], server]);
        count[server]++;
    }

    const maxCount = Math.max(...count);
    return count.map((c, i) => c === maxCount ? i : -1).filter(i => i !== -1);
};

function lowerBound(arr, target) {
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
        const m = Math.floor((lo + hi) / 2);
        if (arr[m] < target) lo = m + 1;
        else hi = m;
    }
    return lo;
}`,
    jsWalkthrough:
      'Input: k=3, arrival=[1,2,3,4,5], load=[5,2,3,3,3]\n\n' +
      'available=[0,1,2], busy=[], count=[0,0,0]\n\n' +
      't=1 (req 0): target=0%3=0, idx=lowerBound([0,1,2],0)=0, server=0\n' +
      '  available=[1,2], busy=[[6,0]], count=[1,0,0]\n\n' +
      't=2 (req 1): target=1%3=1, idx=lowerBound([1,2],1)=0, server=1\n' +
      '  available=[2], busy=[[4,1],[6,0]], count=[1,1,0]\n\n' +
      't=3 (req 2): target=2%3=2, idx=lowerBound([2],2)=0, server=2\n' +
      '  available=[], busy=[[4,1],[6,2],[6,0]], count=[1,1,1]\n\n' +
      't=4 (req 3): free: busy[0]=[4,1] <= 4 -> free server 1\n' +
      '  available=[1], target=3%3=0, idx=lowerBound([1],0)=0, server=1\n' +
      '  available=[], busy=[[6,2],[6,0],[7,1]], count=[1,2,1]\n\n' +
      't=5 (req 4): no busy servers free (min end=6 > 5)\n' +
      '  available=[] -> skip\n\n' +
      'count=[1,2,1], maxCount=2, return [1]',
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
    intuition:
      'BFS processes the tree level by level, which is exactly what we need. At each level, verify the parity rule (even levels need odd values, odd levels need even values) and the ordering rule (increasing or decreasing).',
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
    let queue = [root];
    let level = 0;

    while (queue.length) {
        let prev    = null;  // previous value in the current level
        const nextQ = [];

        for (const node of queue) {
            if (level % 2 === 0) {
                // Even level: values must be odd and strictly increasing
                if (node.val % 2 === 0) return false;          // not odd
                if (prev !== null && node.val <= prev) return false; // not increasing
            } else {
                // Odd level: values must be even and strictly decreasing
                if (node.val % 2 === 1) return false;          // not even
                if (prev !== null && node.val >= prev) return false; // not decreasing
            }

            prev = node.val;
            if (node.left)  nextQ.push(node.left);
            if (node.right) nextQ.push(node.right);
        }

        queue = nextQ;
        level++;
    }
    return true;
};`,
    jsWalkthrough:
      'Input: root = [1,10,4,3,null,7,9,12,8,6,null,null,2]\n\n' +
      'Level 0 (even): [1]\n' +
      '  val=1: odd ✓, no prev\n' +
      '  prev=1\n\n' +
      'Level 1 (odd): [10, 4]\n' +
      '  val=10: even ✓, no prev\n' +
      '  val=4: even ✓, 4 < 10 (decreasing) ✓\n' +
      '  prev=4\n\n' +
      'Level 2 (even): [3, 7, 9]\n' +
      '  val=3: odd ✓, no prev\n' +
      '  val=7: odd ✓, 7 > 3 (increasing) ✓\n' +
      '  val=9: odd ✓, 9 > 7 ✓\n\n' +
      'Level 3 (odd): [12, 8, 6, 2]\n' +
      '  val=12: even ✓, no prev\n' +
      '  val=8: even ✓, 8 < 12 ✓\n' +
      '  val=6: even ✓, 6 < 8 ✓\n' +
      '  val=2: even ✓, 2 < 6 ✓\n\n' +
      'All levels pass -> return true',
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
    intuition:
      'Track how deep you are in nested parentheses, like counting how many boxes-within-boxes you have opened. Each \'(\' opens a new box, each \')\' closes one. The deepest you get is the answer.',
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
    let depth = 0; // current nesting level
    let maxD  = 0; // maximum depth seen

    for (const c of s) {
        if (c === '(') {
            depth++;
            maxD = Math.max(maxD, depth); // update max after opening
        } else if (c === ')') {
            depth--;
        }
        // Ignore non-parenthesis characters
    }
    return maxD;
};`,
    jsWalkthrough:
      'Input: s = "(1+(2*3)+((8)/4))+1"\n\n' +
      '"(": depth=1, maxD=1\n' +
      '"1": skip\n' +
      '"+": skip\n' +
      '"(": depth=2, maxD=2\n' +
      '"2": skip, "*": skip, "3": skip\n' +
      '")": depth=1\n' +
      '"+": skip\n' +
      '"(": depth=2\n' +
      '"(": depth=3, maxD=3\n' +
      '"8": skip\n' +
      '")": depth=2\n' +
      '"/": skip, "4": skip\n' +
      '")": depth=1\n' +
      '")": depth=0\n' +
      '"+": skip, "1": skip\n\n' +
      'Return 3',
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
    intuition:
      'Network rank of two cities is the total unique roads touching either city. Compute degrees, and for each pair subtract 1 if they share a direct road to avoid double-counting. Check all pairs for the maximum.',
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
    // degree[i] = number of roads connected to city i
    const degree    = new Array(n).fill(0);
    // Store edges as "min,max" strings for O(1) lookup
    const connected = new Set();

    for (const [u, v] of roads) {
        degree[u]++;
        degree[v]++;
        connected.add(Math.min(u, v) + ',' + Math.max(u, v));
    }

    let best = 0;
    // Check all pairs of cities
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            let rank = degree[i] + degree[j];
            // If directly connected, the shared road is counted once, not twice
            if (connected.has(i + ',' + j)) {
                rank--;
            }
            best = Math.max(best, rank);
        }
    }
    return best;
};`,
    jsWalkthrough:
      'Input: n=4, roads=[[0,1],[0,3],[1,2],[1,3]]\n\n' +
      'degree: [2,3,1,2] (city 1 connects to 0,2,3)\n' +
      'connected = {"0,1","0,3","1,2","1,3"}\n\n' +
      'Check all pairs:\n' +
      '  (0,1): 2+3=5, connected "0,1" -> 5-1=4\n' +
      '  (0,2): 2+1=3, not connected -> 3\n' +
      '  (0,3): 2+2=4, connected "0,3" -> 4-1=3\n' +
      '  (1,2): 3+1=4, connected "1,2" -> 4-1=3\n' +
      '  (1,3): 3+2=5, connected "1,3" -> 5-1=4\n' +
      '  (2,3): 1+2=3, not connected -> 3\n\n' +
      'best = 4\n\n' +
      'Return 4',
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
    intuition:
      'Use a sieve-like approach with Union-Find: for each divisor d above the threshold, connect all its multiples together. Cities sharing any common divisor above the threshold end up in the same connected component.',
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
    // Union-Find for cities 1..n
    const parent = Array.from({length: n + 1}, (_, i) => i);

    const find = (x) => {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]]; // path halving
            x = parent[x];
        }
        return x;
    };

    const union = (a, b) => {
        const ra = find(a);
        const rb = find(b);
        if (ra !== rb) parent[ra] = rb;
    };

    // Sieve: for each divisor d above threshold, connect all its multiples
    for (let d = threshold + 1; d <= n; d++) {
        for (let multiple = 2 * d; multiple <= n; multiple += d) {
            union(d, multiple);
        }
    }

    // Answer queries: are a and b in the same component?
    return queries.map(([a, b]) => find(a) === find(b));
};`,
    jsWalkthrough:
      'Input: n=6, threshold=2, queries=[[1,4],[2,5],[3,6]]\n\n' +
      'Process divisors > 2:\n' +
      '  d=3: multiples in range: 6 -> union(3,6)\n' +
      '  d=4: multiples: 8>6 -> none\n' +
      '  d=5: multiples: 10>6 -> none\n' +
      '  d=6: multiples: 12>6 -> none\n\n' +
      'After unions: {3,6} are connected; 1,2,4,5 are isolated\n\n' +
      'Queries:\n' +
      '  [1,4]: find(1)=1, find(4)=4, 1!=4 -> false\n' +
      '  [2,5]: find(2)=2, find(5)=5, 2!=5 -> false\n' +
      '  [3,6]: find(3)=find(6)=same root -> true\n\n' +
      'Return [false,false,true]',
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
    intuition:
      'This is Dijkstra where \'distance\' is the maximum height difference along the path rather than the sum. The min-heap always expands the path with the smallest bottleneck, guaranteeing the optimal path is found first.',
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
    const m = heights.length;
    const n = heights[0].length;

    // effort[r][c] = minimum max-height-diff effort to reach (r,c) from (0,0)
    const effort = Array.from({length: m}, () => new Array(n).fill(Infinity));
    effort[0][0] = 0;

    // Min-heap: [effort, row, col]
    const heap = [[0, 0, 0]];

    const push = (val) => {
        heap.push(val);
        let i = heap.length - 1;
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);
            if (heap[p][0] <= heap[i][0]) break;
            [heap[p], heap[i]] = [heap[i], heap[p]];
            i = p;
        }
    };

    const pop = () => {
        if (heap.length <= 1) return heap.pop();
        const v = heap[0];
        heap[0] = heap.pop();
        let i = 0;
        while (true) {
            let s = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < heap.length && heap[l][0] < heap[s][0]) s = l;
            if (r < heap.length && heap[r][0] < heap[s][0]) s = r;
            if (s === i) break;
            [heap[s], heap[i]] = [heap[i], heap[s]];
            i = s;
        }
        return v;
    };

    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

    while (heap.length) {
        const [e, r, c] = pop();

        // Reached destination
        if (r === m - 1 && c === n - 1) return e;

        // Skip stale entries
        if (e > effort[r][c]) continue;

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
                // New effort = max of current path effort and this edge's diff
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
    jsWalkthrough:
      'Input: heights = [[1,2,2],[3,8,2],[5,3,5]]\n\n' +
      'effort initialized to all Infinity, effort[0][0]=0\n' +
      'heap=[[0,0,0]]\n\n' +
      'Pop [0,0,0]:\n' +
      '  right (0,1): |2-1|=1, newEffort=max(0,1)=1 < Inf -> effort[0][1]=1, push [1,0,1]\n' +
      '  down  (1,0): |3-1|=2, newEffort=2 -> effort[1][0]=2, push [2,1,0]\n\n' +
      'Pop [1,0,1]:\n' +
      '  right (0,2): |2-2|=0, newEffort=max(1,0)=1 -> effort[0][2]=1, push [1,0,2]\n' +
      '  down  (1,1): |8-2|=6, newEffort=max(1,6)=6 -> effort[1][1]=6\n' +
      '  ...\n\n' +
      'Eventually, path (0,0)->(0,1)->(0,2)->(1,2)->(2,2) has effort=max(1,0,0,3)=3\n' +
      'Pop [2,2,2]: return 2\n\n' +
      'Return 2',
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
    intuition:
      'Count character frequencies per column across all words. Then use knapsack-style DP: for each column, decide whether to use it for the next unmatched target character. Process columns left to right and target characters right to left.',
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
    const m = words[0].length; // word length (number of columns)
    const n = target.length;

    // freq[col][charCode] = how many words have this character at this column
    const freq = Array.from({length: m}, () => new Array(26).fill(0));
    for (const word of words) {
        for (let i = 0; i < m; i++) {
            freq[i][word.charCodeAt(i) - 97]++;
        }
    }

    // dp[j] = number of ways to form the first j characters of target
    const dp = new Array(n + 1).fill(0);
    dp[0] = 1; // empty prefix: 1 way

    // Process columns left to right; update dp right to left (0/1 knapsack)
    for (let col = 0; col < m; col++) {
        // j goes from min(n, col+1) down to 1 to avoid using same column twice
        for (let j = Math.min(n, col + 1); j > 0; j--) {
            const charIdx = target.charCodeAt(j - 1) - 97;
            const waysToMatchHere = freq[col][charIdx];
            // Use this column to match target[j-1]
            dp[j] = (dp[j] + dp[j - 1] * waysToMatchHere) % MOD;
        }
    }
    return dp[n];
};`,
    jsWalkthrough:
      'Input: words=["acca","bbbb","caca"], target="aba"\n\n' +
      'word length m=4, target length n=3\n\n' +
      'Frequency table (0-indexed columns):\n' +
      '  col 0: a=2 (acca,caca), b=1 (bbbb), c=0\n' +
      '  col 1: c=2 (acca,caca), b=1 (bbbb), a=0\n' +
      '  col 2: c=2 (acca,caca), b=1 (bbbb), a=0\n' +
      '  col 3: a=2 (acca,caca), b=1 (bbbb), c=0\n\n' +
      'dp = [1,0,0,0]\n\n' +
      'col=0: target chars: a(j=1)\n' +
      '  j=1: dp[1]+=dp[0]*freq[0][\'a\'-97]=1*2=2 -> dp=[1,2,0,0]\n\n' +
      'col=1: target chars: b(j=2),a(j=1)\n' +
      '  j=2: target[1]="b", freq[1][\'b\']=1, dp[2]+=dp[1]*1=2 -> dp=[1,2,2,0]\n' +
      '  j=1: target[0]="a", freq[1][\'a\']=0, dp[1]+=0 -> unchanged\n\n' +
      'col=2: target chars: b(j=3),a(j=2),(a(j=1))\n' +
      '  j=3: target[2]="a", freq[2][\'a\']=0 -> no change\n' +
      '  j=2: target[1]="b", freq[2][\'b\']=1, dp[2]+=dp[1]*1=2 -> dp[2]=4\n' +
      '  j=1: target[0]="a", freq[2][\'a\']=0 -> no change\n\n' +
      'col=3: j=3: target[2]="a", freq[3][\'a\']=2, dp[3]+=dp[2]*2=4*2=8\n' +
      '       j=2: target[1]="b", freq[3][\'b\']=1, dp[2]+=dp[1]*1=2 -> dp[2]=6\n' +
      '       ...\n\n' +
      'dp[3] = 6\n\n' +
      'Return 6',
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
    intuition:
      'A sorted vowel string means each character is >= the previous one, so this is a combinations-with-repetition problem. DP builds up from length 1: each vowel position accumulates counts from all vowels at or before it.',
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
    // dp[j] = number of sorted vowel strings of current length ending with vowel j
    // Vowels: 0=a, 1=e, 2=i, 3=o, 4=u
    const dp = [1, 1, 1, 1, 1]; // base case: 1 string of length 1 for each vowel

    for (let i = 1; i < n; i++) {
        // For each length increase, dp[j] += dp[j-1]
        // (we can extend a string ending at j with any vowel <= j)
        for (let j = 1; j < 5; j++) {
            dp[j] += dp[j - 1];
        }
    }
    return dp.reduce((a, b) => a + b, 0);
};`,
    jsWalkthrough:
      'Input: n = 2\n\n' +
      'Initial dp = [1,1,1,1,1]  (5 strings of length 1)\n\n' +
      'i=1 (building length 2):\n' +
      '  j=1: dp[1] += dp[0] = 1+1 = 2  (strings: aa, ae)\n' +
      '  j=2: dp[2] += dp[1] = 1+2 = 3  (strings: ii, ie, ia... wait: sorted so ai,ei,ii)\n' +
      '  j=3: dp[3] += dp[2] = 1+3 = 4\n' +
      '  j=4: dp[4] += dp[3] = 1+4 = 5\n' +
      'dp = [1,2,3,4,5]\n\n' +
      'Sum = 1+2+3+4+5 = 15\n\n' +
      'Return 15',
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
    intuition:
      'Use ladders for the biggest climbs and bricks for smaller ones. A min-heap tracks the largest climbs assigned to ladders. When you run out of ladder slots, the smallest climb gets reassigned to bricks.',
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
    // Min-heap to track which climbs have been assigned ladders
    const heap = [];

    const push = (val) => {
        heap.push(val);
        let i = heap.length - 1;
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);
            if (heap[p] <= heap[i]) break;
            [heap[p], heap[i]] = [heap[i], heap[p]];
            i = p;
        }
    };

    const pop = () => {
        if (heap.length <= 1) return heap.pop();
        const v = heap[0];
        heap[0] = heap.pop();
        let i = 0;
        while (true) {
            let s = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < heap.length && heap[l] < heap[s]) s = l;
            if (r < heap.length && heap[r] < heap[s]) s = r;
            if (s === i) break;
            [heap[s], heap[i]] = [heap[i], heap[s]];
            i = s;
        }
        return v;
    };

    for (let i = 0; i < heights.length - 1; i++) {
        const diff = heights[i + 1] - heights[i];
        if (diff <= 0) continue; // going down or same height, no cost

        // Tentatively assign a ladder to this climb
        push(diff);

        // If we've used more ladders than available, re-assign the smallest climb to bricks
        if (heap.length > ladders) {
            bricks -= pop(); // smallest climb now uses bricks
        }

        // If bricks go negative, we can't make this climb
        if (bricks < 0) return i;
    }
    return heights.length - 1; // reached the last building
};`,
    jsWalkthrough:
      'Input: heights=[4,2,7,6,9,14,12], bricks=5, ladders=1\n\n' +
      'i=0: diff=2-4=-2 <= 0 -> skip\n' +
      'i=1: diff=7-2=5 > 0 -> push 5, heap=[5]\n' +
      '  heap.length=1 <= ladders=1 -> ok\n' +
      '  bricks=5 >= 0 -> ok\n' +
      'i=2: diff=6-7=-1 <= 0 -> skip\n' +
      'i=3: diff=9-6=3 > 0 -> push 3, heap=[3,5]\n' +
      '  heap.length=2 > ladders=1 -> pop min=3, bricks=5-3=2\n' +
      '  heap=[5], bricks=2 >= 0 -> ok\n' +
      'i=4: diff=14-9=5 > 0 -> push 5, heap=[5,5]\n' +
      '  heap.length=2 > 1 -> pop min=5, bricks=2-5=-3 < 0\n' +
      '  return i=4\n\n' +
      'Return 4',
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
    intuition:
      'Sort character frequencies in descending order and ensure each is strictly less than the previous. If two frequencies collide, reduce the later one until it is unique. Each reduction costs one deletion.',
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
    // Step 1: Count how many times each character appears
    const freq = new Map();
    for (const c of s) {
        const currentCount = freq.get(c) || 0;
        freq.set(c, currentCount + 1);
    }

    // Step 2: Extract all frequency values and sort descending
    // We want to assign the largest unique frequencies first
    const freqs = [...freq.values()].sort((a, b) => b - a);

    let deletions = 0;

    // Step 3: Walk through frequencies; each must be strictly less than the previous
    for (let i = 1; i < freqs.length; i++) {
        if (freqs[i] >= freqs[i - 1]) {
            // Reduce freqs[i] to just below freqs[i-1], but no lower than 0
            const target = Math.max(0, freqs[i - 1] - 1);
            const reductionNeeded = freqs[i] - target;
            deletions += reductionNeeded;
            freqs[i] = target;
        }
    }

    return deletions;
};`,
    jsWalkthrough:
      'Input: s = "aab"\n\n' +
      'Step 1: Count character frequencies:\n' +
      '  Process "a": freq = {a:1}\n' +
      '  Process "a": freq = {a:2}\n' +
      '  Process "b": freq = {a:2, b:1}\n\n' +
      'Step 2: Extract values and sort descending:\n' +
      '  freqs = [2, 1]  (a:2, b:1)\n\n' +
      'Step 3: Walk through indices 1..1:\n' +
      '  i=1: freqs[1]=1, freqs[0]=2\n' +
      '    Is 1 >= 2? No — no deletion needed\n\n' +
      'Result: 0 deletions\n\n' +
      '---\n\n' +
      'Input: s = "aaabbbcc"\n\n' +
      'Step 1: Count frequencies:\n' +
      '  freq = {a:3, b:3, c:2}\n\n' +
      'Step 2: Sort descending:\n' +
      '  freqs = [3, 3, 2]\n\n' +
      'Step 3: Check uniqueness:\n' +
      '  i=1: freqs[1]=3, freqs[0]=3\n' +
      '    Is 3 >= 3? Yes!\n' +
      '    target = max(0, 3-1) = 2\n' +
      '    deletions += 3 - 2 = 1  →  deletions = 1\n' +
      '    freqs[1] = 2  →  freqs = [3, 2, 2]\n' +
      '  i=2: freqs[2]=2, freqs[1]=2\n' +
      '    Is 2 >= 2? Yes!\n' +
      '    target = max(0, 2-1) = 1\n' +
      '    deletions += 2 - 1 = 1  →  deletions = 2\n' +
      '    freqs[2] = 1  →  freqs = [3, 2, 1]\n\n' +
      'Return 2',
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
    intuition:
      'Two strings are close if they use the same character set and have the same multiset of frequencies. Swaps handle rearrangement, and the transform operation lets you redistribute frequency counts between any pair of characters.',
    approach:
      'Two strings are close if they have the same set of characters and the same multiset of frequencies (sorted frequency lists are equal). Operation 1 allows any permutation, operation 2 allows swapping frequency counts between characters.',
    code: `from collections import Counter

class Solution:
    def closeStrings(self, word1: str, word2: str) -> bool:
        c1, c2 = Counter(word1), Counter(word2)
        return set(c1.keys()) == set(c2.keys()) and sorted(c1.values()) == sorted(c2.values())`,
    jsCode: `var closeStrings = function(word1, word2) {
    // Step 1: Count character frequencies using index 0-25 for a-z
    const c1 = new Array(26).fill(0);
    const c2 = new Array(26).fill(0);

    for (const c of word1) {
        const idx = c.charCodeAt(0) - 97;
        c1[idx]++;
    }
    for (const c of word2) {
        const idx = c.charCodeAt(0) - 97;
        c2[idx]++;
    }

    // Step 2: Check that both strings use exactly the same set of characters
    // Operation 2 can only swap frequencies between characters that already exist
    // in both strings — it cannot create new characters
    for (let i = 0; i < 26; i++) {
        const inWord1 = c1[i] > 0;
        const inWord2 = c2[i] > 0;
        if (inWord1 !== inWord2) {
            return false;
        }
    }

    // Step 3: Check that the multiset of frequencies is the same
    // Operation 2 lets us swap frequency values between any two characters,
    // so the sorted frequency arrays must match
    const sorted1 = c1.slice().sort((a, b) => a - b).join(',');
    const sorted2 = c2.slice().sort((a, b) => a - b).join(',');
    return sorted1 === sorted2;
};`,
    jsWalkthrough:
      'Input: word1 = "abc", word2 = "bca"\n\n' +
      'Step 1: Count frequencies:\n' +
      '  c1: a=1, b=1, c=1  (all others 0)\n' +
      '  c2: b=1, c=1, a=1  (all others 0)\n\n' +
      'Step 2: Check same character set:\n' +
      '  i=0 (a): c1[0]=1>0, c2[0]=1>0 → both present, OK\n' +
      '  i=1 (b): c1[1]=1>0, c2[1]=1>0 → both present, OK\n' +
      '  i=2 (c): c1[2]=1>0, c2[2]=1>0 → both present, OK\n' +
      '  i=3..25: both 0, OK\n\n' +
      'Step 3: Compare sorted frequencies:\n' +
      '  sorted1 = [0,0,...,1,1,1] → "0,0,...,1,1,1"\n' +
      '  sorted2 = [0,0,...,1,1,1] → "0,0,...,1,1,1"\n' +
      '  sorted1 === sorted2 → true\n\n' +
      'Return true\n\n' +
      '---\n\n' +
      'Input: word1 = "a", word2 = "aa"\n\n' +
      'Step 1: Count frequencies:\n' +
      '  c1: a=1\n' +
      '  c2: a=2\n\n' +
      'Step 2: Check same character set:\n' +
      '  All characters present in the same set → OK\n\n' +
      'Step 3: Compare sorted frequencies:\n' +
      '  sorted1 ends with "...0,1"\n' +
      '  sorted2 ends with "...0,2"\n' +
      '  sorted1 !== sorted2 → false\n\n' +
      'Return false',
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
    intuition:
      'Removing elements from both ends is equivalent to keeping a contiguous middle subarray. Find the longest subarray whose sum equals total minus x using a sliding window. The answer is n minus that window length.',
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
    // Key insight: removing elements from both ends is equivalent to
    // keeping a contiguous middle subarray. We want the longest subarray
    // with sum = (total - x), then the answer is n - that length.
    const totalSum = nums.reduce((a, b) => a + b, 0);
    const target = totalSum - x;

    // Edge cases
    if (target < 0) {
        return -1; // Even removing everything is not enough
    }
    if (target === 0) {
        return nums.length; // Remove everything
    }

    const n = nums.length;
    let maxLen = -1;
    let left = 0;
    let currSum = 0;

    // Sliding window: find longest subarray with sum exactly equal to target
    for (let right = 0; right < n; right++) {
        // Expand window to include nums[right]
        currSum += nums[right];

        // Shrink from left if window sum exceeds target
        while (currSum > target) {
            currSum -= nums[left];
            left++;
        }

        // If current window exactly hits target, track its length
        if (currSum === target) {
            const windowLength = right - left + 1;
            maxLen = Math.max(maxLen, windowLength);
        }
    }

    // If we found a valid middle subarray, operations = n - its length
    if (maxLen !== -1) {
        return n - maxLen;
    }
    return -1;
};`,
    jsWalkthrough:
      'Input: nums = [1,1,4,2,3], x = 5\n\n' +
      'Step 1: Compute target:\n' +
      '  totalSum = 1+1+4+2+3 = 11\n' +
      '  target = 11 - 5 = 6\n' +
      '  target > 0, so proceed\n\n' +
      'Step 2: Sliding window to find longest subarray with sum = 6:\n' +
      '  left=0, currSum=0, maxLen=-1\n\n' +
      '  right=0: currSum = 0+1 = 1\n' +
      '    currSum(1) < target(6) → no shrink\n' +
      '    currSum != 6\n\n' +
      '  right=1: currSum = 1+1 = 2\n' +
      '    currSum(2) < target(6) → no shrink\n' +
      '    currSum != 6\n\n' +
      '  right=2: currSum = 2+4 = 6\n' +
      '    currSum(6) == target(6)!\n' +
      '    windowLength = 2-0+1 = 3\n' +
      '    maxLen = max(-1, 3) = 3\n\n' +
      '  right=3: currSum = 6+2 = 8\n' +
      '    currSum(8) > target(6) → shrink:\n' +
      '      currSum -= nums[0]=1 → currSum=7, left=1\n' +
      '      currSum(7) > target(6) → shrink:\n' +
      '        currSum -= nums[1]=1 → currSum=6, left=2\n' +
      '    currSum == 6!\n' +
      '    windowLength = 3-2+1 = 2\n' +
      '    maxLen = max(3, 2) = 3\n\n' +
      '  right=4: currSum = 6+3 = 9\n' +
      '    currSum(9) > target(6) → shrink:\n' +
      '      currSum -= nums[2]=4 → currSum=5, left=3\n' +
      '    currSum(5) < 6 → no match\n\n' +
      'Step 3: maxLen = 3\n' +
      '  Answer = n - maxLen = 5 - 3 = 2\n\n' +
      'Return 2',
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

import { ProblemSolution } from './types';

export const solutions: ProblemSolution[] = [
  // ===========================================
  // DYNAMIC PROGRAMMING
  // ===========================================
  {
    id: 5,
    description:
      'Given a string s, return the longest palindromic substring in s.',
    examples:
      'Input: s = "babad"\nOutput: "bab" (or "aba")\n\nInput: s = "cbbd"\nOutput: "bb"',
    intuition:
      'Every palindrome has a center, and you can discover the full palindrome by expanding outward from that center. Instead of checking every possible substring, treat each character (and each pair of adjacent characters) as a potential center and grow outward while the letters match. This turns a brute-force substring problem into a simple expansion problem.',
    approach:
      'Expand Around Center: For each character (and each pair of adjacent characters), expand outward while the characters on both sides match. Track the longest palindrome found. This avoids the O(n^2) space of a full DP table.',
    code: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        res = ""
        res_len = 0

        for i in range(len(s)):
            # Odd length palindromes
            l, r = i, i
            while l >= 0 and r < len(s) and s[l] == s[r]:
                if r - l + 1 > res_len:
                    res = s[l:r + 1]
                    res_len = r - l + 1
                l -= 1
                r += 1

            # Even length palindromes
            l, r = i, i + 1
            while l >= 0 and r < len(s) and s[l] == s[r]:
                if r - l + 1 > res_len:
                    res = s[l:r + 1]
                    res_len = r - l + 1
                l -= 1
                r += 1

        return res`,
    jsCode: `var longestPalindrome = function(s) {
    // Track the best palindrome found so far
    let res = "";
    let resLen = 0;

    for (let i = 0; i < s.length; i++) {

        // --- Odd-length palindromes: single character center ---
        let l = i;
        let r = i;
        while (l >= 0 && r < s.length && s[l] === s[r]) {
            const currentLen = r - l + 1;
            if (currentLen > resLen) {
                res = s.slice(l, r + 1);
                resLen = currentLen;
            }
            l--;
            r++;
        }

        // --- Even-length palindromes: gap between i and i+1 as center ---
        l = i;
        r = i + 1;
        while (l >= 0 && r < s.length && s[l] === s[r]) {
            const currentLen = r - l + 1;
            if (currentLen > resLen) {
                res = s.slice(l, r + 1);
                resLen = currentLen;
            }
            l--;
            r++;
        }
    }

    return res;
};`,
    jsWalkthrough:
      's = "babad"\n\n' +
      'step 1: i=0, center at "b" (odd). Expand: l=0,r=0 → "b" (len 1), new best. l=-1 stops.\n' +
      'step 2: i=0, even center between "b" and "a". s[0]="b" ≠ s[1]="a", skip.\n' +
      'step 3: i=1, center at "a" (odd). Expand: l=1,r=1 → "a". Then l=0,r=2: s[0]="b"===s[2]="b" → "bab" (len 3), new best. Then l=-1 stops.\n' +
      'step 4: i=1, even center between "a" and "b". s[1]="a" ≠ s[2]="b", skip.\n' +
      'step 5: i=2, center at "b" (odd). Expand: l=2,r=2 → "b". Then l=1,r=3: s[1]="a"===s[3]="a" → "aba" (len 3, ties best, no update). Then l=0,r=4: s[0]="b" ≠ s[4]="d", stop.\n' +
      'step 6: i=2, even center. s[2]="b" ≠ s[3]="a", skip.\n' +
      'step 7: i=3,4 — no longer palindromes found.\n' +
      'result: "bab"',
    explanation:
      '1. Iterate through each index i as a potential center of a palindrome.\n2. For odd-length palindromes, start with l = r = i and expand outward.\n3. For even-length palindromes, start with l = i, r = i + 1 and expand outward.\n4. In each expansion, check that s[l] == s[r]; if so, update the result if this palindrome is the longest found.\n5. Decrement l and increment r to continue expanding.\n6. Return the longest palindrome substring found.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
    hints: [
      'A palindrome mirrors around its center.',
      'There are 2n - 1 possible centers (each character and each gap between characters).',
      'Expand from each center and track the longest palindrome.',
    ],
  },
  {
    id: 53,
    description:
      'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    examples:
      'Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.\n\nInput: nums = [1]\nOutput: 1',
    intuition:
      'Think of it like accumulating money as you walk forward. If your running total goes negative, you are better off dropping everything and starting fresh from the next element. A negative running sum can only drag down whatever comes next, so resetting to zero is always the right move.',
    approach:
      "Kadane's Algorithm: Maintain a running sum of the current subarray. If the running sum becomes negative, reset it to 0 (start a new subarray). Track the maximum sum seen at each step.",
    code: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        max_sum = nums[0]
        cur_sum = 0

        for n in nums:
            if cur_sum < 0:
                cur_sum = 0
            cur_sum += n
            max_sum = max(max_sum, cur_sum)

        return max_sum`,
    jsCode: `var maxSubArray = function(nums) {
    // Initialize maxSum to the first element to handle all-negative arrays
    let maxSum = nums[0];

    // curSum tracks the running sum of the current subarray
    let curSum = 0;

    for (const n of nums) {
        // If the running sum is negative, it can only hurt future sums
        // — drop it and start fresh
        if (curSum < 0) {
            curSum = 0;
        }

        // Extend the current subarray by adding n
        curSum += n;

        // Update the global maximum
        maxSum = Math.max(maxSum, curSum);
    }

    return maxSum;
};`,
    jsWalkthrough:
      'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\n\n' +
      'step 1: maxSum = -2, curSum = 0.\n' +
      'step 2: n=-2. curSum=0 (not <0). curSum += -2 → -2. maxSum = max(-2,-2) = -2.\n' +
      'step 3: n=1. curSum=-2 < 0, reset to 0. curSum += 1 → 1. maxSum = max(-2,1) = 1.\n' +
      'step 4: n=-3. curSum=1 ≥ 0. curSum += -3 → -2. maxSum = max(1,-2) = 1.\n' +
      'step 5: n=4. curSum=-2 < 0, reset to 0. curSum += 4 → 4. maxSum = max(1,4) = 4.\n' +
      'step 6: n=-1. curSum=4 ≥ 0. curSum += -1 → 3. maxSum = max(4,3) = 4.\n' +
      'step 7: n=2. curSum=3 ≥ 0. curSum += 2 → 5. maxSum = max(4,5) = 5.\n' +
      'step 8: n=1. curSum=5 ≥ 0. curSum += 1 → 6. maxSum = max(5,6) = 6.\n' +
      'step 9: n=-5. curSum=6 ≥ 0. curSum += -5 → 1. maxSum = max(6,1) = 6.\n' +
      'step 10: n=4. curSum=1 ≥ 0. curSum += 4 → 5. maxSum = max(6,5) = 6.\n' +
      'result: 6 (subarray [4,-1,2,1])',
    explanation:
      "1. Initialize max_sum to the first element (handles all-negative arrays) and cur_sum to 0.\n2. For each number n in nums:\n   - If cur_sum is negative, reset it to 0. A negative prefix can only hurt future sums.\n   - Add n to cur_sum.\n   - Update max_sum if cur_sum is larger.\n3. Return max_sum, which holds the maximum subarray sum found.\nThis is Kadane's algorithm, which solves the problem in a single pass.",
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'If the current running sum is negative, starting fresh is always better.',
      'Track the maximum sum seen so far as you iterate.',
      "This is known as Kadane's algorithm.",
    ],
  },
  {
    id: 55,
    description:
      'You are initially positioned at the first index of the array. Each element represents your maximum jump length at that position. Return true if you can reach the last index.',
    examples:
      'Input: nums = [2,3,1,1,4]\nOutput: true\nExplanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.\n\nInput: nums = [3,2,1,0,4]\nOutput: false',
    intuition:
      'You do not need to figure out the exact jumps -- just whether reaching the end is possible. As you walk through the array, keep track of the farthest position you could possibly reach. If you ever land on a position beyond that farthest reach, you are stuck. Otherwise, you will make it.',
    approach:
      'Greedy: Track the farthest index you can reach. Iterate through the array; if the current index exceeds the farthest reachable, return false. Otherwise, update the farthest reachable position.',
    code: `class Solution:
    def canJump(self, nums: List[int]) -> bool:
        max_reach = 0

        for i in range(len(nums)):
            if i > max_reach:
                return False
            max_reach = max(max_reach, i + nums[i])

        return True`,
    jsCode: `var canJump = function(nums) {
    // maxReach tracks the farthest index we can reach so far
    let maxReach = 0;

    for (let i = 0; i < nums.length; i++) {
        // If the current index is beyond what we can reach, we're stuck
        if (i > maxReach) {
            return false;
        }

        // From index i we can jump up to nums[i] steps forward
        const farthestFromHere = i + nums[i];
        maxReach = Math.max(maxReach, farthestFromHere);
    }

    return true;
};`,
    jsWalkthrough:
      'nums = [3, 2, 1, 0, 4]\n\n' +
      'step 1: maxReach = 0.\n' +
      'step 2: i=0. 0 ≤ maxReach(0). farthestFromHere = 0+3 = 3. maxReach = 3.\n' +
      'step 3: i=1. 1 ≤ maxReach(3). farthestFromHere = 1+2 = 3. maxReach = 3.\n' +
      'step 4: i=2. 2 ≤ maxReach(3). farthestFromHere = 2+1 = 3. maxReach = 3.\n' +
      'step 5: i=3. 3 ≤ maxReach(3). farthestFromHere = 3+0 = 3. maxReach = 3.\n' +
      'step 6: i=4. 4 > maxReach(3) → return false.\n' +
      'result: false (index 4 is unreachable because index 3 has jump length 0)',
    explanation:
      '1. Initialize max_reach = 0, representing the farthest index reachable so far.\n2. Iterate through each index i:\n   - If i > max_reach, we cannot reach this index, so return False.\n   - Otherwise, update max_reach = max(max_reach, i + nums[i]) since from index i we can jump up to nums[i] steps.\n3. If we finish the loop, we can reach the last index, so return True.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'You do not need to find the exact path -- just whether it is possible.',
      'Greedily track the farthest position you can reach.',
      'If at any point your current index exceeds the farthest reachable, you are stuck.',
    ],
  },
  {
    id: 62,
    description:
      'A robot is located at the top-left corner of an m x n grid. It can only move either down or right at any point. How many unique paths are there to reach the bottom-right corner?',
    examples:
      'Input: m = 3, n = 7\nOutput: 28\n\nInput: m = 3, n = 2\nOutput: 3',
    intuition:
      'Since the robot can only move right or down, the number of ways to reach any cell is simply the sum of ways to reach the cell above it and the cell to its left. This is because those are the only two cells from which the robot could have arrived. The first row and first column each have exactly one path (all right or all down).',
    approach:
      'Dynamic Programming: Build a 1D DP array of size n. Each cell represents the number of ways to reach that column in the current row. The recurrence is dp[j] += dp[j-1] since paths come from above (dp[j] unchanged from previous row) or from the left (dp[j-1]).',
    code: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        row = [1] * n

        for i in range(1, m):
            for j in range(1, n):
                row[j] += row[j - 1]

        return row[n - 1]`,
    jsCode: `var uniquePaths = function(m, n) {
    // Start with a row of 1s — there's exactly one way to reach any
    // cell in the first row (keep moving right)
    const row = new Array(n).fill(1);

    // Process each additional row
    for (let i = 1; i < m; i++) {
        // j=0 stays 1 (only one way to reach the leftmost cell in any row)
        for (let j = 1; j < n; j++) {
            // Paths from above (row[j] already holds previous row's value)
            // plus paths from the left (row[j - 1])
            row[j] = row[j] + row[j - 1];
        }
    }

    // The bottom-right cell holds the total number of unique paths
    return row[n - 1];
};`,
    jsWalkthrough:
      'm = 3, n = 3\n\n' +
      'step 1: Initialize row = [1, 1, 1] (first row, one path each).\n' +
      'step 2: i=1 (second row).\n' +
      '  j=1: row[1] = row[1] + row[0] = 1 + 1 = 2. row = [1, 2, 1].\n' +
      '  j=2: row[2] = row[2] + row[1] = 1 + 2 = 3. row = [1, 2, 3].\n' +
      'step 3: i=2 (third row).\n' +
      '  j=1: row[1] = row[1] + row[0] = 2 + 1 = 3. row = [1, 3, 3].\n' +
      '  j=2: row[2] = row[2] + row[1] = 3 + 3 = 6. row = [1, 3, 6].\n' +
      'result: row[2] = 6 unique paths for a 3×3 grid',
    explanation:
      '1. Initialize a row of n ones, since there is exactly one way to reach any cell in the first row (move right).\n2. For each subsequent row (i from 1 to m-1):\n   - For each column j from 1 to n-1, update row[j] += row[j-1].\n   - row[j] already holds the value from the row above. Adding row[j-1] accounts for paths coming from the left.\n3. Return row[n-1], the number of unique paths to the bottom-right cell.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The number of paths to any cell is the sum of paths from the cell above and the cell to the left.',
      'The first row and first column each have only 1 path.',
      'You can optimize space from O(m*n) to O(n) by using a single row.',
    ],
  },
  {
    id: 70,
    description:
      'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples:
      'Input: n = 2\nOutput: 2\nExplanation: 1+1 or 2.\n\nInput: n = 3\nOutput: 3\nExplanation: 1+1+1, 1+2, or 2+1.',
    intuition:
      'To reach step n, you must have come from either step n-1 (taking 1 step) or step n-2 (taking 2 steps). So the total ways to reach step n is the sum of ways to reach those two previous steps. This is exactly the Fibonacci sequence in disguise, and you only need to remember the last two values.',
    approach:
      'Dynamic Programming (Fibonacci-like): The number of ways to reach step n is the sum of ways to reach step n-1 (take 1 step) and step n-2 (take 2 steps). Use two variables to track the previous two values.',
    code: `class Solution:
    def climbStairs(self, n: int) -> int:
        one, two = 1, 1

        for i in range(n - 1):
            one, two = one + two, one

        return one`,
    jsCode: `var climbStairs = function(n) {
    // one = ways to reach the "current" step
    // two = ways to reach the "previous" step
    // Both start at 1 (base cases: 1 way to reach step 1 or step 0)
    let one = 1;
    let two = 1;

    // We iterate n-1 times to build up from step 1 to step n
    for (let i = 0; i < n - 1; i++) {
        // Save current value before overwriting
        const temp = one;

        // Ways to reach the next step = ways from one step below + two steps below
        one = one + two;

        // Shift: previous "one" becomes the new "two"
        two = temp;
    }

    // "one" now holds the number of ways to reach step n
    return one;
};`,
    jsWalkthrough:
      'n = 5\n\n' +
      'step 1: one=1, two=1 (base: 1 way to be at step 1 or step 0).\n' +
      'step 2: i=0. temp=1. one = 1+1 = 2. two = 1. → one=2, two=1. (ways to step 2)\n' +
      'step 3: i=1. temp=2. one = 2+1 = 3. two = 2. → one=3, two=2. (ways to step 3)\n' +
      'step 4: i=2. temp=3. one = 3+2 = 5. two = 3. → one=5, two=3. (ways to step 4)\n' +
      'step 5: i=3. temp=5. one = 5+3 = 8. two = 5. → one=8, two=5. (ways to step 5)\n' +
      'result: 8 distinct ways to climb 5 stairs',
    explanation:
      '1. Initialize one = 1 and two = 1. These represent the number of ways to reach the current and previous step.\n2. Iterate n - 1 times:\n   - The new value of one is one + two (ways from step n-1 plus ways from step n-2).\n   - Shift two to the old value of one.\n3. Return one, which now holds the number of distinct ways to climb n steps.\nThis is equivalent to computing the (n+1)th Fibonacci number.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Think about how you arrive at step n: from step n-1 or step n-2.',
      'This is essentially the Fibonacci sequence.',
      'You only need the last two values, not the entire array.',
    ],
  },
  {
    id: 72,
    description:
      'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have three operations: insert a character, delete a character, replace a character.',
    examples:
      'Input: word1 = "horse", word2 = "ros"\nOutput: 3\nExplanation: horse -> rorse (replace h with r) -> rose (remove r) -> ros (remove e)\n\nInput: word1 = "intention", word2 = "execution"\nOutput: 5',
    intuition:
      'Imagine building one word into the other, one character at a time. At each step, if the current characters match, no edit is needed and you move diagonally in the DP table. If they differ, you pick the cheapest of three options: insert, delete, or replace. The DP table lets you build up the answer from smaller substrings to the full strings.',
    approach:
      'Dynamic Programming: Build a 2D DP table where dp[i][j] represents the minimum edit distance between word1[0..i-1] and word2[0..j-1]. If characters match, dp[i][j] = dp[i-1][j-1]. Otherwise, take the minimum of insert, delete, or replace, each costing 1 operation.',
    code: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]

        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j

        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(
                        dp[i - 1][j],      # delete
                        dp[i][j - 1],      # insert
                        dp[i - 1][j - 1]   # replace
                    )

        return dp[m][n]`,
    jsCode: `var minDistance = function(word1, word2) {
    const m = word1.length;
    const n = word2.length;

    // dp[i][j] = min edits to convert word1[0..i-1] into word2[0..j-1]
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    // Base case: converting to/from an empty string costs i or j deletions/insertions
    for (let i = 0; i <= m; i++) {
        dp[i][0] = i;
    }
    for (let j = 0; j <= n; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const char1 = word1[i - 1];
            const char2 = word2[j - 1];

            if (char1 === char2) {
                // Characters match — no edit needed, carry the diagonal value
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                const deleteCost  = dp[i - 1][j];      // delete char from word1
                const insertCost  = dp[i][j - 1];      // insert char into word1
                const replaceCost = dp[i - 1][j - 1];  // replace char in word1

                dp[i][j] = 1 + Math.min(deleteCost, insertCost, replaceCost);
            }
        }
    }

    return dp[m][n];
};`,
    jsWalkthrough:
      'word1 = "horse", word2 = "ros"\n\n' +
      'step 1: m=5, n=3. Build 6×4 dp table.\n' +
      'step 2: Fill base cases: dp[i][0]=i for i=0..5 (delete all of word1). dp[0][j]=j for j=0..3 (insert all of word2).\n' +
      'step 3: i=1 ("h"), j=1 ("r"): h≠r. delete=dp[0][1]=1, insert=dp[1][0]=1, replace=dp[0][0]=0. dp[1][1]=1+min(1,1,0)=1.\n' +
      'step 4: i=1 ("h"), j=2 ("o"): h≠o. dp[1][2]=1+min(dp[0][2]=2, dp[1][1]=1, dp[0][1]=1)=2.\n' +
      'step 5: i=1 ("h"), j=3 ("s"): h≠s. dp[1][3]=1+min(dp[0][3]=3, dp[1][2]=2, dp[0][2]=2)=3.\n' +
      'step 6: Continue filling... i=2("o"),j=2("o"): o===o → dp[2][2]=dp[1][1]=1.\n' +
      'step 7: ... after all rows, dp[5][3] = 3.\n' +
      'result: 3 operations (horse → rorse → rose → ros)',
    explanation:
      '1. Create a (m+1) x (n+1) DP table. dp[i][j] = min edits to convert word1[0..i-1] to word2[0..j-1].\n2. Base cases: dp[i][0] = i (delete all i characters), dp[0][j] = j (insert all j characters).\n3. For each cell dp[i][j]:\n   - If word1[i-1] == word2[j-1], no operation needed: dp[i][j] = dp[i-1][j-1].\n   - Otherwise, take the minimum of:\n     - dp[i-1][j] + 1 (delete from word1),\n     - dp[i][j-1] + 1 (insert into word1),\n     - dp[i-1][j-1] + 1 (replace in word1).\n4. Return dp[m][n].',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Think about what happens when the last characters match vs. do not match.',
      'Each cell depends on three neighbors: top, left, and top-left diagonal.',
      'The base cases represent converting to/from an empty string.',
    ],
  },
  {
    id: 91,
    description:
      'A message containing letters from A-Z can be encoded to numbers using A=1, B=2, ..., Z=26. Given a string s containing only digits, return the number of ways to decode it.',
    examples:
      'Input: s = "12"\nOutput: 2\nExplanation: "12" could be decoded as "AB" (1 2) or "L" (12).\n\nInput: s = "226"\nOutput: 3\nExplanation: "BZ" (2 26), "VF" (22 6), or "BBF" (2 2 6).\n\nInput: s = "06"\nOutput: 0',
    intuition:
      'At each position, you have at most two choices: decode one digit or decode two digits together. Working backwards from the end of the string, the number of decodings from position i depends on the decodings from position i+1 (one digit) and i+2 (two digits). The tricky part is handling zeros, which cannot be decoded alone.',
    approach:
      'Dynamic Programming: Process the string from right to left. At each position, check if the current single digit and the current two-digit number form valid decodings (1-9 for single, 10-26 for double). Accumulate the number of ways.',
    code: `class Solution:
    def numDecodings(self, s: str) -> int:
        dp = {len(s): 1}

        for i in range(len(s) - 1, -1, -1):
            if s[i] == '0':
                dp[i] = 0
            else:
                dp[i] = dp[i + 1]

                if i + 1 < len(s) and (
                    s[i] == '1' or
                    (s[i] == '2' and s[i + 1] in '0123456')
                ):
                    dp[i] += dp[i + 2]

        return dp[0]`,
    jsCode: `var numDecodings = function(s) {
    // dp.get(i) = number of ways to decode s[i..]
    const dp = new Map();

    // Base case: empty suffix has exactly one valid decoding (the empty string)
    dp.set(s.length, 1);

    // Process the string right to left
    for (let i = s.length - 1; i >= 0; i--) {
        const currentChar = s[i];

        if (currentChar === '0') {
            // A leading zero cannot be decoded on its own
            dp.set(i, 0);
        } else {
            // Option 1: decode s[i] as a single digit (always valid if not '0')
            const waysUsingSingleDigit = dp.get(i + 1);
            dp.set(i, waysUsingSingleDigit);

            // Option 2: decode s[i..i+1] as a two-digit number (10–26)
            if (i + 1 < s.length) {
                const nextChar = s[i + 1];
                const twoDigitIsValid =
                    currentChar === '1' ||
                    (currentChar === '2' && '0123456'.includes(nextChar));

                if (twoDigitIsValid) {
                    const waysUsingTwoDigits = dp.get(i + 2) ?? 0;
                    dp.set(i, dp.get(i) + waysUsingTwoDigits);
                }
            }
        }
    }

    return dp.get(0);
};`,
    jsWalkthrough:
      's = "226"\n\n' +
      'step 1: dp = {3: 1} (empty suffix → 1 way).\n' +
      'step 2: i=2, char="6". Not "0". Single-digit: dp.get(3)=1. i+1=3 out of range, skip two-digit. dp={3:1, 2:1}.\n' +
      'step 3: i=1, char="2". Not "0". Single-digit: dp.get(2)=1. nextChar=s[2]="6". "2" with "6" → 26, valid (≤26). Two-digit: dp.get(3)=1. dp={3:1, 2:1, 1:2}.\n' +
      'step 4: i=0, char="2". Not "0". Single-digit: dp.get(1)=2. nextChar=s[1]="2". "22" → 22, valid. Two-digit: dp.get(2)=1. dp={3:1, 2:1, 1:2, 0:3}.\n' +
      'result: dp.get(0) = 3 (BZ=2,26; VF=22,6; BBF=2,2,6)',
    explanation:
      "1. Use a dictionary dp where dp[i] = number of ways to decode s[i:].\n2. Base case: dp[len(s)] = 1 (empty suffix has one decoding).\n3. Iterate from right to left:\n   - If s[i] == '0', dp[i] = 0 (leading zero is invalid).\n   - Otherwise, dp[i] = dp[i+1] (decode single digit).\n   - If the two-digit number s[i:i+2] is between 10 and 26, add dp[i+2] (decode two digits together).\n4. Return dp[0], the total decodings for the entire string.",
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      "'0' cannot be decoded on its own -- it must pair with a preceding 1 or 2.",
      'At each position, consider decoding one digit or two digits.',
      'Work backwards from the end of the string.',
    ],
  },
  {
    id: 139,
    description:
      'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.',
    examples:
      'Input: s = "leetcode", wordDict = ["leet","code"]\nOutput: true\nExplanation: "leetcode" can be segmented as "leet code".\n\nInput: s = "applepenapple", wordDict = ["apple","pen"]\nOutput: true\n\nInput: s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]\nOutput: false',
    intuition:
      'Think of it as building the string left to right. At each position, ask: "Does any dictionary word end right here?" If so, and if the string up to where that word started was also valid, then the string up to here is valid too. You are essentially chaining dictionary words together to cover the entire string.',
    approach:
      'Dynamic Programming: dp[i] represents whether s[0:i] can be segmented. For each position i, check all words in the dictionary. If dp[i - len(word)] is true and s[i-len(word):i] matches the word, set dp[i] = true.',
    code: `class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        dp = [False] * (len(s) + 1)
        dp[0] = True

        for i in range(1, len(s) + 1):
            for w in wordDict:
                if i >= len(w) and dp[i - len(w)] and s[i - len(w):i] == w:
                    dp[i] = True
                    break

        return dp[len(s)]`,
    jsCode: `var wordBreak = function(s, wordDict) {
    // dp[i] = true if s[0..i-1] can be formed by concatenating dictionary words
    const dp = new Array(s.length + 1).fill(false);

    // Base case: empty string is always valid
    dp[0] = true;

    for (let i = 1; i <= s.length; i++) {
        // Try every word as the last segment ending at position i
        for (const word of wordDict) {
            const wordLen = word.length;
            const startIndex = i - wordLen;

            // The word must fit and the prefix before it must also be valid
            const wordFits = i >= wordLen;
            const prefixIsValid = dp[startIndex];
            const substringMatches = s.slice(startIndex, i) === word;

            if (wordFits && prefixIsValid && substringMatches) {
                dp[i] = true;
                break; // No need to check more words for this position
            }
        }
    }

    return dp[s.length];
};`,
    jsWalkthrough:
      's = "leetcode", wordDict = ["leet", "code"]\n\n' +
      'step 1: dp = [T,F,F,F,F,F,F,F,F] (length 9, dp[0]=true).\n' +
      'step 2: i=1..3: no word of length 1-3 matches any prefix of "leet". dp stays false.\n' +
      'step 3: i=4. Try "leet" (len=4): start=0, dp[0]=true, s.slice(0,4)="leet"==="leet" ✓. dp[4]=true.\n' +
      '        Try "code" (len=4): start=0, s.slice(0,4)="leet"≠"code". No match.\n' +
      'step 4: i=5..7: no valid word ends here with a true prefix. dp stays false.\n' +
      'step 5: i=8. Try "leet" (len=4): start=4, dp[4]=true, s.slice(4,8)="code"≠"leet". No match.\n' +
      '        Try "code" (len=4): start=4, dp[4]=true, s.slice(4,8)="code"==="code" ✓. dp[8]=true.\n' +
      'result: dp[8] = true',
    explanation:
      '1. Create dp array of size len(s)+1, with dp[0] = True (empty string is valid).\n2. For each position i from 1 to len(s):\n   - For each word w in wordDict:\n     - If i >= len(w), dp[i-len(w)] is True, and s[i-len(w):i] == w, then dp[i] = True.\n     - Break early once dp[i] is set to True.\n3. Return dp[len(s)], whether the entire string can be segmented.',
    timeComplexity: 'O(n * m * k) where n = len(s), m = number of words, k = average word length',
    spaceComplexity: 'O(n)',
    hints: [
      'dp[i] is true if s[0:i] can be formed by concatenating dictionary words.',
      'For each position, try every word in the dictionary as a potential ending word.',
      'If dp[j] is true and s[j:i] is a dictionary word, then dp[i] is true.',
    ],
  },
  {
    id: 152,
    description:
      'Given an integer array nums, find a subarray that has the largest product, and return the product.',
    examples:
      'Input: nums = [2,3,-2,4]\nOutput: 6\nExplanation: [2,3] has the largest product 6.\n\nInput: nums = [-2,0,-1]\nOutput: 0',
    intuition:
      'Unlike maximum subarray sum, a negative number can flip a very small product into a very large one (and vice versa). So you need to track both the running maximum AND minimum product at each step. When you hit a negative number, the minimum becomes useful because negative times negative equals positive.',
    approach:
      'Dynamic Programming: Track both the current maximum and current minimum product at each position. The minimum is important because a negative number can turn a minimum product into a maximum. At each step, the new max/min is the best of: num alone, num * prev_max, num * prev_min.',
    code: `class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        res = max(nums)
        cur_max, cur_min = 1, 1

        for n in nums:
            if n == 0:
                cur_max, cur_min = 1, 1
                continue
            tmp = cur_max * n
            cur_max = max(n * cur_max, n * cur_min, n)
            cur_min = min(tmp, n * cur_min, n)
            res = max(res, cur_max)

        return res`,
    jsCode: `var maxProduct = function(nums) {
    // Initialize result to the largest single element
    // (handles all-negative or single-element arrays)
    let res = Math.max(...nums);

    // curMax = largest product of a subarray ending here
    // curMin = smallest product of a subarray ending here
    // (we track min because negative × negative = positive)
    let curMax = 1;
    let curMin = 1;

    for (const n of nums) {
        // Zero breaks any product chain — reset both trackers
        if (n === 0) {
            curMax = 1;
            curMin = 1;
            continue;
        }

        // Save curMax * n before overwriting curMax
        const productWithMax = curMax * n;
        const productWithMin = curMin * n;

        // New max is the best of: extend the max subarray, extend the min subarray
        // (min * negative could become the new max), or start fresh at n
        curMax = Math.max(productWithMax, productWithMin, n);

        // New min is the worst of the same three choices
        curMin = Math.min(productWithMax, productWithMin, n);

        res = Math.max(res, curMax);
    }

    return res;
};`,
    jsWalkthrough:
      'nums = [2, 3, -2, 4]\n\n' +
      'step 1: res = max(2,3,-2,4) = 4. curMax=1, curMin=1.\n' +
      'step 2: n=2. productWithMax=2, productWithMin=2. curMax=max(2,2,2)=2. curMin=min(2,2,2)=2. res=max(4,2)=4.\n' +
      'step 3: n=3. productWithMax=6, productWithMin=6. curMax=max(6,6,3)=6. curMin=min(6,6,3)=3. res=max(4,6)=6.\n' +
      'step 4: n=-2. productWithMax=6*-2=-12, productWithMin=3*-2=-6. curMax=max(-12,-6,-2)=-2. curMin=min(-12,-6,-2)=-12. res=max(6,-2)=6.\n' +
      'step 5: n=4. productWithMax=-2*4=-8, productWithMin=-12*4=-48. curMax=max(-8,-48,4)=4. curMin=min(-8,-48,4)=-48. res=max(6,4)=6.\n' +
      'result: 6 (subarray [2, 3])',
    explanation:
      '1. Initialize res to the maximum element (handles single-element cases and all-negative arrays).\n2. Track cur_max and cur_min, both starting at 1 (neutral for multiplication).\n3. For each number n:\n   - If n == 0, reset cur_max and cur_min to 1 (zero breaks the product chain).\n   - Save cur_max * n in tmp before updating cur_max.\n   - cur_max = max(n * cur_max, n * cur_min, n): the best product ending here.\n   - cur_min = min(tmp, n * cur_min, n): the worst product ending here (useful if next number is negative).\n   - Update res with cur_max.\n4. Return res.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'A negative times a negative is positive, so track the minimum product too.',
      'Zero resets both the running max and min products.',
      'At each step, the current element alone might be the best starting point.',
    ],
  },
  {
    id: 198,
    description:
      'You are a professional robber. Each house has a certain amount of money. Adjacent houses have security systems connected -- if two adjacent houses are broken into on the same night, the police are alerted. Return the maximum amount you can rob without alerting the police.',
    examples:
      'Input: nums = [1,2,3,1]\nOutput: 4\nExplanation: Rob house 1 (money = 1) and house 3 (money = 3) = 1 + 3 = 4.\n\nInput: nums = [2,7,9,3,1]\nOutput: 12\nExplanation: Rob house 1 (2) + house 3 (9) + house 5 (1) = 12.',
    intuition:
      'At each house, you face a simple choice: rob it or skip it. If you rob it, you add its value to the best you could do two houses back (since you cannot rob adjacent houses). If you skip it, you carry forward the best from the previous house. You only ever need the last two results to make this decision.',
    approach:
      'Dynamic Programming: At each house, decide to rob it (add its value to the max from two houses back) or skip it (carry forward the max from the previous house). Use two variables to track these values.',
    code: `class Solution:
    def rob(self, nums: List[int]) -> int:
        rob1, rob2 = 0, 0

        for n in nums:
            new_rob = max(rob1 + n, rob2)
            rob1 = rob2
            rob2 = new_rob

        return rob2`,
    jsCode: `var rob = function(nums) {
    // rob1 = max money robbed up to two houses ago
    // rob2 = max money robbed up to the previous house
    let rob1 = 0;
    let rob2 = 0;

    for (const n of nums) {
        // Option A: rob this house → add its value to the best from two houses back
        const robThisHouse = rob1 + n;

        // Option B: skip this house → carry forward the best from the previous house
        const skipThisHouse = rob2;

        const newRob = Math.max(robThisHouse, skipThisHouse);

        // Shift the window forward
        rob1 = rob2;
        rob2 = newRob;
    }

    return rob2;
};`,
    jsWalkthrough:
      'nums = [2, 7, 9, 3, 1]\n\n' +
      'step 1: rob1=0, rob2=0.\n' +
      'step 2: n=2. robThisHouse=0+2=2, skipThisHouse=0. newRob=2. rob1=0, rob2=2.\n' +
      'step 3: n=7. robThisHouse=0+7=7, skipThisHouse=2. newRob=7. rob1=2, rob2=7.\n' +
      'step 4: n=9. robThisHouse=2+9=11, skipThisHouse=7. newRob=11. rob1=7, rob2=11.\n' +
      'step 5: n=3. robThisHouse=7+3=10, skipThisHouse=11. newRob=11. rob1=11, rob2=11.\n' +
      'step 6: n=1. robThisHouse=11+1=12, skipThisHouse=11. newRob=12. rob1=11, rob2=12.\n' +
      'result: 12 (rob houses at indices 0,2,4 → 2+9+1=12)',
    explanation:
      '1. rob1 and rob2 represent the maximum money robbed up to two houses back and one house back, respectively.\n2. For each house with value n:\n   - new_rob = max(rob1 + n, rob2): either rob this house (rob1 + n) or skip it (rob2).\n   - Shift: rob1 = rob2, rob2 = new_rob.\n3. Return rob2, the maximum amount that can be robbed.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'At each house, you have two choices: rob it or skip it.',
      'If you rob house i, you add nums[i] to the best total from house i-2.',
      'You only need the last two computed values, not the entire DP array.',
    ],
  },
  {
    id: 213,
    description:
      'All houses are arranged in a circle. Adjacent houses cannot both be robbed. Given an integer array nums representing the amount of money at each house, return the maximum amount you can rob.',
    examples:
      'Input: nums = [2,3,2]\nOutput: 3\nExplanation: You cannot rob house 1 (2) and house 3 (2) since they are adjacent in the circle.\n\nInput: nums = [1,2,3,1]\nOutput: 4\nExplanation: Rob house 1 (1) and house 3 (3) = 4.',
    intuition:
      'The circular arrangement means the first and last houses are neighbors, so you cannot rob both. The key insight is to break the circle: solve the linear House Robber problem twice -- once ignoring the last house and once ignoring the first. The answer is the better of the two results.',
    approach:
      'Since houses form a circle, house 0 and house n-1 are adjacent. Solve House Robber I twice: once excluding the last house (nums[0:n-1]) and once excluding the first house (nums[1:n]). Return the maximum of the two results.',
    code: `class Solution:
    def rob(self, nums: List[int]) -> int:
        if len(nums) == 1:
            return nums[0]

        def rob_linear(houses):
            rob1, rob2 = 0, 0
            for n in houses:
                rob1, rob2 = rob2, max(rob1 + n, rob2)
            return rob2

        return max(rob_linear(nums[:-1]), rob_linear(nums[1:]))`,
    jsCode: `var rob = function(nums) {
    // Edge case: only one house, just take it
    if (nums.length === 1) {
        return nums[0];
    }

    // Helper: standard linear House Robber on a slice of houses
    const robLinear = (houses) => {
        let rob1 = 0; // best from two houses ago
        let rob2 = 0; // best from one house ago

        for (const n of houses) {
            const robThisHouse = rob1 + n;
            const skipThisHouse = rob2;
            const best = Math.max(robThisHouse, skipThisHouse);

            // Shift window forward
            rob1 = rob2;
            rob2 = best;
        }

        return rob2;
    };

    // Run once excluding the last house (so house 0 and n-1 are never both robbed)
    const skipLast  = robLinear(nums.slice(0, nums.length - 1));

    // Run once excluding the first house
    const skipFirst = robLinear(nums.slice(1));

    return Math.max(skipLast, skipFirst);
};`,
    jsWalkthrough:
      'nums = [2, 3, 2]\n\n' +
      'step 1: length=3, not 1 so proceed.\n' +
      'step 2: skipLast = robLinear([2, 3]) (exclude last house at index 2).\n' +
      '  n=2: rob1=0, rob2=max(0+2,0)=2.\n' +
      '  n=3: rob1=2, rob2=max(0+3,2)=3.\n' +
      '  skipLast = 3.\n' +
      'step 3: skipFirst = robLinear([3, 2]) (exclude first house at index 0).\n' +
      '  n=3: rob1=0, rob2=max(0+3,0)=3.\n' +
      '  n=2: rob1=3, rob2=max(0+2,3)=3.\n' +
      '  skipFirst = 3.\n' +
      'result: max(3, 3) = 3',
    explanation:
      '1. Handle edge case: if only one house, return nums[0].\n2. Define rob_linear, which solves the standard (non-circular) House Robber problem.\n3. Run rob_linear on nums[:-1] (exclude last house) and nums[1:] (exclude first house).\n4. Return the maximum of both results. This ensures that house 0 and house n-1 are never both included.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The circular constraint means house 0 and house n-1 are neighbors.',
      'Break the circle by solving two linear subproblems.',
      'The answer is the max of robbing houses [0..n-2] and [1..n-1].',
    ],
  },
  {
    id: 221,
    description:
      'Given an m x n binary matrix filled with 0s and 1s, find the largest square containing only 1s and return its area.',
    examples:
      'Input: matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]\nOutput: 4',
    intuition:
      'A square of 1s with its bottom-right corner at (i,j) can only be as large as the smallest square formed by its three neighbors: top, left, and top-left diagonal. If any of those neighbors has a smaller square, that becomes the bottleneck. This min-of-three-neighbors pattern is the key insight that makes the DP work.',
    approach:
      'Dynamic Programming: dp[i][j] represents the side length of the largest square with its bottom-right corner at (i, j). If matrix[i][j] == "1", then dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1. The area is the square of the maximum dp value.',
    code: `class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        if not matrix:
            return 0

        m, n = len(matrix), len(matrix[0])
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        max_side = 0

        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if matrix[i - 1][j - 1] == '1':
                    dp[i][j] = min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1
                    max_side = max(max_side, dp[i][j])

        return max_side * max_side`,
    jsCode: `var maximalSquare = function(matrix) {
    if (!matrix.length) return 0;

    const m = matrix.length;
    const n = matrix[0].length;

    // dp[i][j] = side length of the largest square with bottom-right corner at (i-1, j-1)
    // The extra row/column of zeros acts as padding to simplify boundary handling
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    let maxSide = 0;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cellValue = matrix[i - 1][j - 1];

            if (cellValue === '1') {
                // A square here is limited by the smallest square among the
                // three neighboring positions (top, left, top-left diagonal)
                const fromTop      = dp[i - 1][j];
                const fromLeft     = dp[i][j - 1];
                const fromDiagonal = dp[i - 1][j - 1];

                dp[i][j] = Math.min(fromTop, fromLeft, fromDiagonal) + 1;
                maxSide = Math.max(maxSide, dp[i][j]);
            }
            // If cellValue === '0', dp[i][j] stays 0 (no square can end here)
        }
    }

    // Return the area of the largest square found
    return maxSide * maxSide;
};`,
    jsWalkthrough:
      'matrix = [["1","0","1"],["1","1","1"],["1","1","1"]]\n\n' +
      'step 1: m=3, n=3. dp is 4×4, all zeros.\n' +
      'step 2: i=1 (row 0 of matrix):\n' +
      '  j=1: matrix[0][0]="1". top=0,left=0,diag=0. dp[1][1]=min(0,0,0)+1=1. maxSide=1.\n' +
      '  j=2: matrix[0][1]="0". dp[1][2]=0.\n' +
      '  j=3: matrix[0][2]="1". top=0,left=0,diag=0. dp[1][3]=1. maxSide=1.\n' +
      'step 3: i=2 (row 1 of matrix):\n' +
      '  j=1: matrix[1][0]="1". top=1,left=0,diag=0. dp[2][1]=min(1,0,0)+1=1. maxSide=1.\n' +
      '  j=2: matrix[1][1]="1". top=0,left=1,diag=0. dp[2][2]=min(0,1,0)+1=1. maxSide=1.\n' +
      '  j=3: matrix[1][2]="1". top=1,left=1,diag=0. dp[2][3]=min(1,1,0)+1=1. maxSide=1.\n' +
      'step 4: i=3 (row 2 of matrix):\n' +
      '  j=1: matrix[2][0]="1". top=1,left=0,diag=0. dp[3][1]=1. maxSide=1.\n' +
      '  j=2: matrix[2][1]="1". top=1,left=1,diag=1. dp[3][2]=min(1,1,1)+1=2. maxSide=2.\n' +
      '  j=3: matrix[2][2]="1". top=1,left=2,diag=1. dp[3][3]=min(1,2,1)+1=2. maxSide=2.\n' +
      'result: maxSide * maxSide = 2 * 2 = 4',
    explanation:
      '1. Create a DP table of size (m+1) x (n+1), initialized to 0 (padding handles boundary conditions).\n2. For each cell (i, j) in the matrix (1-indexed in dp):\n   - If matrix[i-1][j-1] == "1", dp[i][j] = min(top, left, top-left diagonal) + 1.\n   - This works because a square of side k requires squares of side k-1 at all three neighboring positions.\n   - Update max_side.\n3. Return max_side^2 as the area.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'The largest square ending at (i,j) depends on the squares ending at (i-1,j), (i,j-1), and (i-1,j-1).',
      'Use a DP table where each cell stores the side length of the largest square.',
      'The bottleneck is the minimum of the three neighbors.',
    ],
  },
  {
    id: 279,
    description:
      'Given an integer n, return the least number of perfect square numbers that sum to n.',
    examples:
      'Input: n = 12\nOutput: 3\nExplanation: 12 = 4 + 4 + 4.\n\nInput: n = 13\nOutput: 2\nExplanation: 13 = 4 + 9.',
    intuition:
      'This is just like the Coin Change problem, but your "coins" are perfect squares (1, 4, 9, 16, ...). For each number, try subtracting every perfect square that fits, and take the option that uses the fewest squares. Building up from 0 to n, each answer depends on previously solved smaller values.',
    approach:
      'Dynamic Programming: Build a DP array where dp[i] = minimum number of perfect squares summing to i. For each value i, try subtracting every perfect square j*j that does not exceed i, and take the minimum.',
    code: `class Solution:
    def numSquares(self, n: int) -> int:
        dp = [float('inf')] * (n + 1)
        dp[0] = 0

        for i in range(1, n + 1):
            j = 1
            while j * j <= i:
                dp[i] = min(dp[i], dp[i - j * j] + 1)
                j += 1

        return dp[n]`,
    jsCode: `var numSquares = function(n) {
    // dp[i] = minimum number of perfect squares that sum to i
    const dp = new Array(n + 1).fill(Infinity);

    // Base case: zero requires zero squares
    dp[0] = 0;

    for (let i = 1; i <= n; i++) {
        // Try every perfect square j² that is ≤ i
        let j = 1;
        while (j * j <= i) {
            const square = j * j;
            const remainder = i - square;

            // Use one copy of this square plus the optimal decomposition of the remainder
            const candidate = dp[remainder] + 1;
            dp[i] = Math.min(dp[i], candidate);

            j++;
        }
    }

    return dp[n];
};`,
    jsWalkthrough:
      'n = 12\n\n' +
      'step 1: dp = [0, ∞, ∞, ∞, ∞, ∞, ∞, ∞, ∞, ∞, ∞, ∞, ∞].\n' +
      'step 2: i=1. j=1: 1²=1≤1. dp[1]=min(∞, dp[0]+1)=1. j=2: 4>1, stop.\n' +
      'step 3: i=2. j=1: dp[2]=min(∞, dp[1]+1)=2. j=2: 4>2, stop.\n' +
      'step 4: i=3. j=1: dp[3]=min(∞, dp[2]+1)=3. j=2: 4>3, stop.\n' +
      'step 5: i=4. j=1: dp[4]=min(∞, dp[3]+1)=4. j=2: 4≤4, dp[4]=min(4, dp[0]+1)=1. j=3: 9>4, stop.\n' +
      'step 6: i=5..8 follow similarly.\n' +
      'step 7: i=9. j=1: dp[9]=dp[8]+1. j=2: dp[9]=min(dp[9], dp[5]+1). j=3: 9≤9, dp[9]=min(dp[9], dp[0]+1)=1.\n' +
      'step 8: i=12. j=1: dp[12]=dp[11]+1=4. j=2: dp[12]=min(4, dp[8]+1)=min(4,3)=3. j=3: dp[12]=min(3, dp[3]+1)=min(3,4)=3. j=4: 16>12, stop.\n' +
      'result: dp[12] = 3 (4+4+4)',
    explanation:
      '1. Initialize dp[0] = 0 and all other values to infinity.\n2. For each value i from 1 to n:\n   - Try every perfect square j*j <= i.\n   - dp[i] = min(dp[i], dp[i - j*j] + 1): use one square j*j plus the optimal decomposition of the remainder.\n3. Return dp[n].',
    timeComplexity: 'O(n * sqrt(n))',
    spaceComplexity: 'O(n)',
    hints: [
      'This is similar to the Coin Change problem with coins being perfect squares.',
      'dp[i] = min(dp[i - j*j] + 1) for all j where j*j <= i.',
      'By Lagrange\'s four-square theorem, the answer is at most 4.',
    ],
  },
  {
    id: 300,
    description:
      'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
    examples:
      'Input: nums = [10,9,2,5,3,7,101,18]\nOutput: 4\nExplanation: The longest increasing subsequence is [2,3,7,101].\n\nInput: nums = [0,1,0,3,2,3]\nOutput: 4',
    intuition:
      'Imagine sorting cards into piles (patience sorting). Each pile\'s top card is increasing left to right. When you get a new card, place it on the leftmost pile whose top is >= your card, or start a new pile. The number of piles equals the LIS length. Binary search makes finding the right pile fast.',
    approach:
      'Binary Search with Patience Sorting: Maintain a list (tails) where tails[i] is the smallest tail element for an increasing subsequence of length i+1. For each number, use binary search to find where it should be placed. The length of tails is the LIS length.',
    code: `class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        from bisect import bisect_left

        tails = []

        for n in nums:
            pos = bisect_left(tails, n)
            if pos == len(tails):
                tails.append(n)
            else:
                tails[pos] = n

        return len(tails)`,
    jsCode: `var lengthOfLIS = function(nums) {
    // tails[i] = the smallest tail element of any increasing subsequence of length i+1
    // This array is always kept sorted, enabling binary search
    const tails = [];

    // Binary search: find the leftmost position where arr[pos] >= target
    const bisectLeft = (arr, target) => {
        let lo = 0;
        let hi = arr.length;

        while (lo < hi) {
            const mid = (lo + hi) >> 1; // same as Math.floor((lo + hi) / 2)

            if (arr[mid] < target) {
                lo = mid + 1; // target is in the right half
            } else {
                hi = mid;     // target is in the left half (or at mid)
            }
        }

        return lo;
    };

    for (const n of nums) {
        // Find where n fits in the sorted tails array
        const pos = bisectLeft(tails, n);

        if (pos === tails.length) {
            // n is larger than all current tails — extend the longest subsequence
            tails.push(n);
        } else {
            // Replace the tail at pos with n to keep the smallest possible tail
            // for a subsequence of length pos+1
            tails[pos] = n;
        }
    }

    // The number of piles (tails) equals the LIS length
    return tails.length;
};`,
    jsWalkthrough:
      'nums = [10, 9, 2, 5, 3, 7, 101, 18]\n\n' +
      'step 1: tails = [].\n' +
      'step 2: n=10. bisectLeft([],10)=0. pos=0=tails.length → push. tails=[10].\n' +
      'step 3: n=9. bisectLeft([10],9)=0. pos=0<length → replace tails[0]=9. tails=[9].\n' +
      'step 4: n=2. bisectLeft([9],2)=0. replace tails[0]=2. tails=[2].\n' +
      'step 5: n=5. bisectLeft([2],5)=1. pos=1=tails.length → push. tails=[2,5].\n' +
      'step 6: n=3. bisectLeft([2,5],3)=1. replace tails[1]=3. tails=[2,3].\n' +
      'step 7: n=7. bisectLeft([2,3],7)=2. pos=2=tails.length → push. tails=[2,3,7].\n' +
      'step 8: n=101. bisectLeft([2,3,7],101)=3. push. tails=[2,3,7,101].\n' +
      'step 9: n=18. bisectLeft([2,3,7,101],18)=3. replace tails[3]=18. tails=[2,3,7,18].\n' +
      'result: tails.length = 4 (LIS is e.g. [2,3,7,18])',
    explanation:
      '1. Maintain a list tails where tails[i] holds the smallest possible tail of an increasing subsequence of length i+1.\n2. For each number n:\n   - Use bisect_left to find the position pos where n should be inserted to keep tails sorted.\n   - If pos == len(tails), n extends the longest subsequence found; append it.\n   - Otherwise, replace tails[pos] with n to keep the tail as small as possible for future extensions.\n3. The length of tails is the length of the LIS.\nNote: tails itself may not be an actual subsequence, but its length is correct.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The O(n^2) DP approach checks all pairs. Can you do better?',
      'Maintain an array of smallest tail elements for subsequences of each length.',
      'Use binary search to find where each element fits in the tails array.',
    ],
  },
  {
    id: 309,
    description:
      'You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit with the constraint that after you sell, you must wait one day before buying again (cooldown of 1 day).',
    examples:
      'Input: prices = [1,2,3,0,2]\nOutput: 3\nExplanation: Buy on day 0 (price=1), sell on day 2 (price=3), profit=2. Cooldown on day 3. Buy on day 3 (price=0), sell on day 4 (price=2), profit=2. Total=3.',
    intuition:
      'On any given day, you are in one of three states: holding a stock, just sold (in cooldown), or resting (free to buy). The cooldown constraint means you cannot go directly from "sold" to "holding" -- you must rest for a day first. Modeling these three states and their transitions each day makes the problem straightforward.',
    approach:
      'State Machine DP: At each day, track three states: (1) holding a stock, (2) sold today (cooldown next day), (3) resting (not holding, free to buy). Transition between states based on buy/sell/rest actions.',
    code: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        if not prices:
            return 0

        hold = -prices[0]  # holding stock
        sold = 0           # just sold, in cooldown
        rest = 0           # not holding, free to buy

        for i in range(1, len(prices)):
            prev_hold = hold
            prev_sold = sold
            prev_rest = rest

            hold = max(prev_hold, prev_rest - prices[i])
            sold = prev_hold + prices[i]
            rest = max(prev_rest, prev_sold)

        return max(sold, rest)`,
    jsCode: `var maxProfit = function(prices) {
    if (!prices.length) return 0;

    // Three states:
    //   hold = max profit while currently holding a stock
    //   sold = max profit on the day we just sold (cooldown applies tomorrow)
    //   rest = max profit while not holding and free to buy
    let hold = -prices[0]; // bought on day 0
    let sold = 0;
    let rest = 0;

    for (let i = 1; i < prices.length; i++) {
        const price = prices[i];

        // Snapshot previous state before updating (all transitions happen simultaneously)
        const prevHold = hold;
        const prevSold = sold;
        const prevRest = rest;

        // Keep holding, OR buy today (can only buy from rest state, not sold/cooldown)
        hold = Math.max(prevHold, prevRest - price);

        // Sell the stock we were holding at today's price
        sold = prevHold + price;

        // Keep resting, OR transition out of cooldown (yesterday we sold)
        rest = Math.max(prevRest, prevSold);
    }

    // We never want to end holding — take the best of sold or rest
    return Math.max(sold, rest);
};`,
    jsWalkthrough:
      'prices = [1, 2, 3, 0, 2]\n\n' +
      'step 1: hold=-1, sold=0, rest=0 (bought on day 0 at price 1).\n' +
      'step 2: i=1, price=2. prevHold=-1,prevSold=0,prevRest=0.\n' +
      '  hold=max(-1, 0-2)=-1. sold=-1+2=1. rest=max(0,0)=0.\n' +
      'step 3: i=2, price=3. prevHold=-1,prevSold=1,prevRest=0.\n' +
      '  hold=max(-1, 0-3)=-1. sold=-1+3=2. rest=max(0,1)=1.\n' +
      'step 4: i=3, price=0. prevHold=-1,prevSold=2,prevRest=1.\n' +
      '  hold=max(-1, 1-0)=1. sold=-1+0=-1. rest=max(1,2)=2.\n' +
      'step 5: i=4, price=2. prevHold=1,prevSold=-1,prevRest=2.\n' +
      '  hold=max(1, 2-2)=1. sold=1+2=3. rest=max(2,-1)=2.\n' +
      'result: max(sold=3, rest=2) = 3',
    explanation:
      '1. Define three states:\n   - hold: max profit when holding a stock.\n   - sold: max profit when we just sold (must cooldown next day).\n   - rest: max profit when not holding and free to buy.\n2. Initialize: hold = -prices[0] (bought on day 0), sold = 0, rest = 0.\n3. For each day i:\n   - hold = max(keep holding, buy today from rest state).\n   - sold = hold + prices[i] (sell the stock we are holding).\n   - rest = max(keep resting, transition from sold/cooldown).\n4. Return max(sold, rest). We never want to end in the hold state.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Model the problem as a state machine with states: hold, sold, rest.',
      'After selling, you must enter the cooldown (rest) state before buying again.',
      'Each state transitions based on the action taken each day.',
    ],
  },
  {
    id: 322,
    description:
      'You are given an integer array coins representing coin denominations and an integer amount. Return the fewest number of coins needed to make up that amount. If not possible, return -1.',
    examples:
      'Input: coins = [1,5,10,25], amount = 30\nOutput: 2\nExplanation: 5 + 25 = 30.\n\nInput: coins = [2], amount = 3\nOutput: -1',
    intuition:
      'Think of making change as a shortest-path problem: you start at amount 0 and want to reach the target amount, where each coin is a "step" you can take. For every amount, the fewest coins needed is one more than the fewest coins for the amount minus that coin. Build up from 0 to the target.',
    approach:
      'Dynamic Programming: Build a DP array where dp[a] = minimum coins needed to make amount a. For each amount from 1 to target, try each coin denomination and take the minimum.',
    code: `class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [float('inf')] * (amount + 1)
        dp[0] = 0

        for a in range(1, amount + 1):
            for c in coins:
                if c <= a:
                    dp[a] = min(dp[a], dp[a - c] + 1)

        return dp[amount] if dp[amount] != float('inf') else -1`,
    jsCode: `var coinChange = function(coins, amount) {
    // dp[a] = minimum number of coins needed to make amount a
    // Initialize to Infinity meaning "not yet reachable"
    const dp = new Array(amount + 1).fill(Infinity);

    // Base case: zero coins needed to make amount 0
    dp[0] = 0;

    for (let a = 1; a <= amount; a++) {
        for (const coin of coins) {
            // Only use this coin if it doesn't exceed the current amount
            const coinFits = coin <= a;

            if (coinFits) {
                const remainder = a - coin;
                const candidate = dp[remainder] + 1;
                dp[a] = Math.min(dp[a], candidate);
            }
        }
    }

    // If still Infinity, this amount is impossible to form
    const isReachable = dp[amount] !== Infinity;
    return isReachable ? dp[amount] : -1;
};`,
    jsWalkthrough:
      'coins = [1, 5, 10, 25], amount = 11\n\n' +
      'step 1: dp = [0,∞,∞,∞,∞,∞,∞,∞,∞,∞,∞,∞].\n' +
      'step 2: a=1. coin=1: dp[1]=min(∞, dp[0]+1)=1. coin=5,10,25: 5>1,skip. dp[1]=1.\n' +
      'step 3: a=2..4: each takes dp[a]=dp[a-1]+1. dp=[0,1,2,3,4,∞,...].\n' +
      'step 4: a=5. coin=1: dp[5]=dp[4]+1=5. coin=5: dp[5]=min(5, dp[0]+1)=1. dp[5]=1.\n' +
      'step 5: a=6..9: each is dp[a-5]+1 (using one 5-coin + optimal remainder).\n' +
      '  dp=[0,1,2,3,4,1,2,3,4,5,...].\n' +
      'step 6: a=10. coin=1: dp[10]=dp[9]+1=6. coin=5: dp[10]=min(6,dp[5]+1)=2. coin=10: dp[10]=min(2,dp[0]+1)=1. dp[10]=1.\n' +
      'step 7: a=11. coin=1: dp[11]=dp[10]+1=2. coin=5: dp[11]=min(2,dp[6]+1)=min(2,3)=2. coin=10: dp[11]=min(2,dp[1]+1)=min(2,2)=2. dp[11]=2.\n' +
      'result: dp[11] = 2 (coins: 10+1)',
    explanation:
      '1. Initialize dp[0] = 0 (zero coins needed for amount 0) and all other values to infinity.\n2. For each amount a from 1 to amount:\n   - For each coin c: if c <= a, then dp[a] = min(dp[a], dp[a - c] + 1).\n   - This says: use one coin of value c plus the optimal solution for the remaining amount a - c.\n3. If dp[amount] is still infinity, return -1 (impossible). Otherwise, return dp[amount].',
    timeComplexity: 'O(amount * len(coins))',
    spaceComplexity: 'O(amount)',
    hints: [
      'Think of this as a shortest path problem: fewest coins to reach the target amount.',
      'dp[a] = min(dp[a - c] + 1) for each coin c.',
      'If dp[amount] remains infinity, the amount cannot be formed.',
    ],
  },
  {
    id: 416,
    description:
      'Given an integer array nums, return true if you can partition the array into two subsets such that the sum of elements in both subsets is equal.',
    examples:
      'Input: nums = [1,5,11,5]\nOutput: true\nExplanation: [1,5,5] and [11].\n\nInput: nums = [1,2,3,5]\nOutput: false',
    intuition:
      'If the total sum is odd, equal partition is impossible. If it is even, the problem becomes: can you pick a subset that sums to exactly half the total? This is the classic subset sum problem. Use a set to track all achievable sums as you process each number, and check if the target half-sum becomes reachable.',
    approach:
      'Dynamic Programming (Subset Sum): The problem reduces to finding a subset with sum = total_sum / 2. If the total sum is odd, return false immediately. Use a set to track all achievable sums.',
    code: `class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2 != 0:
            return False

        target = total // 2
        dp = set([0])

        for n in nums:
            new_dp = set()
            for s in dp:
                if s + n == target:
                    return True
                new_dp.add(s + n)
            dp = dp | new_dp

        return target in dp`,
    jsCode: `var canPartition = function(nums) {
    const total = nums.reduce((a, b) => a + b, 0);

    // If total is odd, we can never split it into two equal halves
    if (total % 2 !== 0) {
        return false;
    }

    const target = total / 2;

    // dp holds all subset sums reachable so far
    // Start with {0}: the empty subset has sum 0
    let dp = new Set([0]);

    for (const n of nums) {
        // Compute new sums by adding n to each existing sum
        const newSums = new Set();
        for (const currentSum of dp) {
            const nextSum = currentSum + n;

            // Early exit: found a subset that equals the target
            if (nextSum === target) {
                return true;
            }

            newSums.add(nextSum);
        }

        // Merge new sums into dp (keep old sums too — n might not be used)
        dp = new Set([...dp, ...newSums]);
    }

    return dp.has(target);
};`,
    jsWalkthrough:
      'nums = [1, 5, 11, 5], total=22, target=11\n\n' +
      'step 1: total=22, even. target=11. dp={0}.\n' +
      'step 2: n=1. newSums: 0+1=1 (not 11). newSums={1}. dp={0,1}.\n' +
      'step 3: n=5. newSums: 0+5=5, 1+5=6. dp={0,1,5,6}.\n' +
      'step 4: n=11. newSums: 0+11=11 → equal to target! return true.\n' +
      'result: true (subset [11] sums to 11, and [1,5,5] also sums to 11)',
    explanation:
      '1. If total sum is odd, two equal subsets are impossible; return False.\n2. Set target = total // 2. We need to find a subset summing to target.\n3. Use a set dp to track all achievable subset sums, starting with {0}.\n4. For each number n, create new sums by adding n to each existing sum in dp.\n5. If we ever reach target, return True immediately.\n6. After processing all numbers, check if target is in dp.',
    timeComplexity: 'O(n * sum)',
    spaceComplexity: 'O(sum)',
    hints: [
      'If the total sum is odd, equal partition is impossible.',
      'This reduces to: can we find a subset with sum = total / 2?',
      'Use a boolean DP or set to track achievable sums.',
    ],
  },
  {
    id: 494,
    description:
      'You are given an integer array nums and an integer target. You want to assign a + or - sign to each number. Return the number of different expressions that evaluate to target.',
    examples:
      'Input: nums = [1,1,1,1,1], target = 3\nOutput: 5\nExplanation: Five ways: -1+1+1+1+1, +1-1+1+1+1, +1+1-1+1+1, +1+1+1-1+1, +1+1+1+1-1.\n\nInput: nums = [1], target = 1\nOutput: 1',
    intuition:
      'Each number gets a + or - sign, so at every step you branch into two paths: add or subtract. Instead of exploring all 2^n branches, use a hash map to count how many ways lead to each possible running sum. This collapses identical sums from different paths into a single count, making it efficient.',
    approach:
      'Dynamic Programming with hash map: Use a dictionary to count the number of ways to reach each possible sum. For each number, update all reachable sums by adding or subtracting the current number.',
    code: `class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        dp = {0: 1}

        for n in nums:
            new_dp = {}
            for s, count in dp.items():
                new_dp[s + n] = new_dp.get(s + n, 0) + count
                new_dp[s - n] = new_dp.get(s - n, 0) + count
            dp = new_dp

        return dp.get(target, 0)`,
    jsCode: `var findTargetSumWays = function(nums, target) {
    // dp maps each reachable running sum to the number of ways to achieve it
    // Start: 1 way to reach sum 0 with no numbers processed yet
    let dp = new Map();
    dp.set(0, 1);

    for (const n of nums) {
        // Build a fresh map for this step — we replace dp entirely
        const newDp = new Map();

        for (const [currentSum, waysToReachSum] of dp) {
            // Branch 1: add n (assign '+' to this number)
            const sumIfAdd = currentSum + n;
            const prevCountAdd = newDp.get(sumIfAdd) || 0;
            newDp.set(sumIfAdd, prevCountAdd + waysToReachSum);

            // Branch 2: subtract n (assign '-' to this number)
            const sumIfSubtract = currentSum - n;
            const prevCountSub = newDp.get(sumIfSubtract) || 0;
            newDp.set(sumIfSubtract, prevCountSub + waysToReachSum);
        }

        // Replace dp with the new state
        dp = newDp;
    }

    // Return how many ways lead to the target sum (0 if unreachable)
    return dp.get(target) || 0;
};`,
    jsWalkthrough:
      'nums = [1, 1, 1, 1, 1], target = 3\n\n' +
      'step 1: dp = {0:1}.\n' +
      'step 2: n=1. newDp: 0+1=1 (1 way), 0-1=-1 (1 way). dp={1:1, -1:1}.\n' +
      'step 3: n=1. From sum=1(×1): +1→2, -1→0. From sum=-1(×1): +1→0, -1→-2.\n' +
      '  newDp={2:1, 0:2, -2:1}. dp={2:1, 0:2, -2:1}.\n' +
      'step 4: n=1. From 2(×1): 3,1. From 0(×2): 1,−1(each×2). From −2(×1): −1,−3.\n' +
      '  newDp={3:1, 1:3, -1:3, -3:1}. dp={3:1, 1:3, -1:3, -3:1}.\n' +
      'step 5: n=1. From 3(×1): 4,2. From 1(×3): 2,0(each×3). From -1(×3): 0,-2(each×3). From -3(×1): -2,-4.\n' +
      '  newDp={4:1, 2:4, 0:6, -2:4, -4:1}. dp={4:1, 2:4, 0:6, -2:4, -4:1}.\n' +
      'step 6: n=1. From 2(×4): 3,1(each×4). From 0(×6): 1,-1(each×6). ... etc.\n' +
      '  dp.get(3) = 5.\n' +
      'result: 5 ways to reach target=3',
    explanation:
      '1. Initialize dp = {0: 1}, meaning there is one way to achieve sum 0 with zero numbers.\n2. For each number n in nums:\n   - Create a new dictionary new_dp.\n   - For each (sum, count) in dp, propagate to sum + n and sum - n with the same count.\n3. After processing all numbers, return dp[target] (or 0 if target is not in dp).',
    timeComplexity: 'O(n * sum) where sum is the range of possible sums',
    spaceComplexity: 'O(sum)',
    hints: [
      'At each number, you branch into two choices: + or -.',
      'Use a hash map to track the number of ways to reach each sum.',
      'This can also be reduced to a subset sum problem.',
    ],
  },
  {
    id: 518,
    description:
      'Given an integer array coins representing coin denominations and an integer amount, return the number of combinations that make up that amount. If not possible, return 0.',
    examples:
      'Input: amount = 5, coins = [1,2,5]\nOutput: 4\nExplanation: 5=5, 5=2+2+1, 5=2+1+1+1, 5=1+1+1+1+1.\n\nInput: amount = 3, coins = [2]\nOutput: 0',
    intuition:
      'The key to counting combinations (not permutations) is iterating coins in the outer loop. By processing one coin denomination at a time, you ensure each combination is counted exactly once, since you never "go back" to use an earlier coin. For each coin, you ask: "How many new amounts can I reach by using one more of this coin?"',
    approach:
      'Dynamic Programming (Unbounded Knapsack): dp[a] = number of combinations to make amount a. Iterate over coins in the outer loop (to avoid counting permutations as different combinations) and amounts in the inner loop.',
    code: `class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        dp = [0] * (amount + 1)
        dp[0] = 1

        for c in coins:
            for a in range(c, amount + 1):
                dp[a] += dp[a - c]

        return dp[amount]`,
    jsCode: `var change = function(amount, coins) {
    // dp[a] = number of combinations that sum to amount a
    const dp = new Array(amount + 1).fill(0);

    // Base case: there is exactly one way to make amount 0 (use no coins)
    dp[0] = 1;

    // Outer loop over coins ensures each combination is counted once,
    // not as different permutations (e.g., [1,2] and [2,1] count as the same)
    for (const coin of coins) {
        // For each amount at least as large as this coin, add the ways
        // to make (amount - coin) — effectively "use one more of this coin"
        for (let a = coin; a <= amount; a++) {
            const waysWithoutThisCoin = dp[a];
            const waysUsingOneCoin    = dp[a - coin];

            dp[a] = waysWithoutThisCoin + waysUsingOneCoin;
        }
    }

    return dp[amount];
};`,
    jsWalkthrough:
      'amount = 5, coins = [1, 2, 5]\n\n' +
      'step 1: dp = [1,0,0,0,0,0].\n' +
      'step 2: coin=1. For a=1..5: dp[a] += dp[a-1].\n' +
      '  dp=[1,1,1,1,1,1] (only 1-coin combos: {1+1+...}).\n' +
      'step 3: coin=2. For a=2..5: dp[a] += dp[a-2].\n' +
      '  a=2: dp[2]+=dp[0]=1 → dp[2]=2.\n' +
      '  a=3: dp[3]+=dp[1]=1 → dp[3]=2.\n' +
      '  a=4: dp[4]+=dp[2]=2 → dp[4]=3.\n' +
      '  a=5: dp[5]+=dp[3]=2 → dp[5]=3. dp=[1,1,2,2,3,3].\n' +
      'step 4: coin=5. For a=5: dp[5]+=dp[0]=1 → dp[5]=4.\n' +
      'result: dp[5] = 4 ({5}, {2+2+1}, {2+1+1+1}, {1+1+1+1+1})',
    explanation:
      '1. Initialize dp[0] = 1 (one way to make amount 0: use no coins) and all other dp values to 0.\n2. For each coin c (outer loop):\n   - For each amount a from c to amount (inner loop):\n     - dp[a] += dp[a - c]: add the number of ways to form amount a - c (using coin c one more time).\n3. The outer loop over coins ensures each combination is counted once (not permutations).\n4. Return dp[amount].',
    timeComplexity: 'O(amount * len(coins))',
    spaceComplexity: 'O(amount)',
    hints: [
      'This is the unbounded knapsack / combination sum variant.',
      'Iterating coins in the outer loop avoids counting permutations.',
      'dp[a] += dp[a - c] adds all ways that include at least one more coin c.',
    ],
  },
  {
    id: 647,
    description: 'Given a string s, return the number of palindromic substrings in s.',
    examples:
      'Input: s = "abc"\nOutput: 3\nExplanation: "a", "b", "c".\n\nInput: s = "aaa"\nOutput: 6\nExplanation: "a", "a", "a", "aa", "aa", "aaa".',
    intuition:
      'This uses the same expand-around-center technique as Longest Palindromic Substring. Every single character is trivially a palindrome, and longer palindromes grow outward from a center. Instead of tracking the longest, simply count every valid expansion as a new palindromic substring.',
    approach:
      'Expand Around Center: For each possible center (single character or pair of adjacent characters), expand outward while characters match and count each palindrome found.',
    code: `class Solution:
    def countSubstrings(self, s: str) -> int:
        count = 0

        for i in range(len(s)):
            # Odd length
            l, r = i, i
            while l >= 0 and r < len(s) and s[l] == s[r]:
                count += 1
                l -= 1
                r += 1

            # Even length
            l, r = i, i + 1
            while l >= 0 and r < len(s) and s[l] == s[r]:
                count += 1
                l -= 1
                r += 1

        return count`,
    jsCode: `var countSubstrings = function(s) {
    let count = 0;

    for (let i = 0; i < s.length; i++) {

        // --- Odd-length palindromes: single character center at i ---
        let l = i;
        let r = i;
        while (l >= 0 && r < s.length && s[l] === s[r]) {
            // Every valid expansion is a distinct palindromic substring
            count++;
            l--;
            r++;
        }

        // --- Even-length palindromes: gap between i and i+1 as center ---
        l = i;
        r = i + 1;
        while (l >= 0 && r < s.length && s[l] === s[r]) {
            count++;
            l--;
            r++;
        }
    }

    return count;
};`,
    jsWalkthrough:
      's = "aaa"\n\n' +
      'step 1: count=0.\n' +
      'step 2: i=0. Odd center at index 0:\n' +
      '  l=0,r=0: s[0]="a"===s[0]="a" → count=1. l=-1 stops.\n' +
      '  Even center between 0 and 1:\n' +
      '  l=0,r=1: s[0]="a"===s[1]="a" → count=2. l=-1 stops.\n' +
      'step 3: i=1. Odd center at index 1:\n' +
      '  l=1,r=1: "a"==="a" → count=3. l=0,r=2: s[0]="a"===s[2]="a" → count=4. l=-1 stops.\n' +
      '  Even center between 1 and 2:\n' +
      '  l=1,r=2: "a"==="a" → count=5. l=0 stops (l=-1).\n' +
      'step 4: i=2. Odd center at index 2:\n' +
      '  l=2,r=2: "a"==="a" → count=6. l=1 stops since r=3 is out of bounds.\n' +
      '  Even center between 2 and 3: r=3 out of bounds, skip.\n' +
      'result: 6',
    explanation:
      '1. For each index i, treat it as the center of potential palindromes.\n2. For odd-length palindromes: start with l = r = i and expand while s[l] == s[r]. Each valid expansion is a palindrome; increment count.\n3. For even-length palindromes: start with l = i, r = i + 1 and expand similarly.\n4. Return the total count of palindromic substrings found.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
    hints: [
      'Every single character is a palindrome.',
      'Expand around each center to find all palindromes.',
      'There are 2n - 1 centers to consider (characters and gaps).',
    ],
  },
  {
    id: 746,
    description:
      'You are given an integer array cost where cost[i] is the cost of the ith step. You can start from step 0 or step 1. Return the minimum cost to reach the top of the floor (past the last step).',
    examples:
      'Input: cost = [10,15,20]\nOutput: 15\nExplanation: Start at step 1 (cost 15), pay 15, jump to the top.\n\nInput: cost = [1,100,1,1,1,100,1,1,100,1]\nOutput: 6',
    intuition:
      'Starting from the bottom, each step has a cost and you can jump 1 or 2 steps ahead. Working backwards, the cheapest way from each step to the top depends on the two steps above it. By the time you reach the bottom, you just pick the cheaper of the first two starting positions.',
    approach:
      'Dynamic Programming: Work backwards. At each step, the minimum cost to reach the top is cost[i] + min(cost to reach top from i+1, cost to reach top from i+2). Use two variables for O(1) space.',
    code: `class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        for i in range(len(cost) - 3, -1, -1):
            cost[i] += min(cost[i + 1], cost[i + 2])

        return min(cost[0], cost[1])`,
    jsCode: `var minCostClimbingStairs = function(cost) {
    // Work backwards, starting from the third-to-last step.
    // The last two steps don't need updating because they lead directly
    // to the top with no additional choices.
    for (let i = cost.length - 3; i >= 0; i--) {
        // From step i, we can jump 1 step (to i+1) or 2 steps (to i+2).
        // Add the cheaper of those two future costs to cost[i] in place.
        const jumpOne  = cost[i + 1];
        const jumpTwo  = cost[i + 2];
        cost[i] += Math.min(jumpOne, jumpTwo);
    }

    // We can start at either step 0 or step 1 — take the cheaper option
    return Math.min(cost[0], cost[1]);
};`,
    jsWalkthrough:
      'cost = [10, 15, 20]\n\n' +
      'step 1: length=3. Start at i = 3-3 = 0.\n' +
      'step 2: i=0. jumpOne=cost[1]=15, jumpTwo=cost[2]=20. cost[0] += min(15,20) = 15. cost=[25,15,20].\n' +
      'step 3: Loop ends (i goes to -1).\n' +
      'step 4: return min(cost[0], cost[1]) = min(25, 15) = 15.\n' +
      'result: 15 (start at step 1, pay 15, jump directly to the top)',
    explanation:
      '1. Starting from the third-to-last step, work backwards.\n2. At each step i, update cost[i] += min(cost[i+1], cost[i+2]). This converts cost[i] to the total minimum cost from step i to the top.\n3. Return min(cost[0], cost[1]) since we can start at either step 0 or step 1.\nThis modifies the array in place for O(1) extra space.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'From each step, you can jump 1 or 2 steps forward.',
      'Work backwards to build up the minimum cost from each step.',
      'The answer is the minimum of starting from step 0 or step 1.',
    ],
  },
  {
    id: 1143,
    description:
      'Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.',
    examples:
      'Input: text1 = "abcde", text2 = "ace"\nOutput: 3\nExplanation: The longest common subsequence is "ace".\n\nInput: text1 = "abc", text2 = "def"\nOutput: 0',
    intuition:
      'Compare the two strings character by character. When characters match, they extend the common subsequence by 1 from the diagonal. When they do not match, the best you can do is the better result from skipping one character in either string. The DP table systematically tries all pairings to find the longest match.',
    approach:
      'Dynamic Programming: Build a 2D DP table where dp[i][j] = LCS length of text1[0..i-1] and text2[0..j-1]. If characters match, dp[i][j] = dp[i-1][j-1] + 1. Otherwise, dp[i][j] = max(dp[i-1][j], dp[i][j-1]).',
    code: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]

        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

        return dp[m][n]`,
    jsCode: `var longestCommonSubsequence = function(text1, text2) {
    const m = text1.length;
    const n = text2.length;

    // dp[i][j] = length of LCS of text1[0..i-1] and text2[0..j-1]
    // Extra row/column of zeros handles the empty-string base case
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const char1 = text1[i - 1];
            const char2 = text2[j - 1];

            if (char1 === char2) {
                // Characters match — extend the LCS from the diagonal
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                // Characters don't match — take the best result from skipping
                // one character in either string
                const skipChar1 = dp[i - 1][j]; // advance in text1, stay in text2
                const skipChar2 = dp[i][j - 1]; // stay in text1, advance in text2
                dp[i][j] = Math.max(skipChar1, skipChar2);
            }
        }
    }

    return dp[m][n];
};`,
    jsWalkthrough:
      'text1 = "abcde", text2 = "ace"\n\n' +
      'step 1: m=5, n=3. Build 6×4 dp table, all zeros.\n' +
      'step 2: i=1 ("a"):\n' +
      '  j=1 ("a"): match → dp[1][1] = dp[0][0]+1 = 1.\n' +
      '  j=2 ("c"): no match → max(dp[0][2]=0, dp[1][1]=1) = 1.\n' +
      '  j=3 ("e"): no match → max(dp[0][3]=0, dp[1][2]=1) = 1.\n' +
      'step 3: i=2 ("b"):\n' +
      '  j=1 ("a"): no match → max(dp[1][1]=1, dp[2][0]=0) = 1.\n' +
      '  j=2 ("c"): no match → max(dp[1][2]=1, dp[2][1]=1) = 1.\n' +
      '  j=3 ("e"): no match → max(dp[1][3]=1, dp[2][2]=1) = 1.\n' +
      'step 4: i=3 ("c"):\n' +
      '  j=1 ("a"): no match → max(dp[2][1]=1, dp[3][0]=0) = 1.\n' +
      '  j=2 ("c"): match → dp[3][2] = dp[2][1]+1 = 2.\n' +
      '  j=3 ("e"): no match → max(dp[2][3]=1, dp[3][2]=2) = 2.\n' +
      'step 5: i=4 ("d"), i=5 ("e") follow similarly, eventually dp[5][3]=3.\n' +
      'result: dp[5][3] = 3 (LCS is "ace")',
    explanation:
      '1. Create a (m+1) x (n+1) DP table initialized to 0.\n2. For each pair (i, j):\n   - If text1[i-1] == text2[j-1], the characters match: dp[i][j] = dp[i-1][j-1] + 1.\n   - Otherwise, take the max of skipping one character from either string: dp[i][j] = max(dp[i-1][j], dp[i][j-1]).\n3. Return dp[m][n], the LCS length of the full strings.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'If the current characters match, extend the LCS by 1.',
      'If they do not match, take the best result from skipping either character.',
      'Space can be optimized to O(min(m, n)) using a rolling array.',
    ],
  },

  // ===========================================
  // GREEDY
  // ===========================================
  {
    id: 134,
    description:
      'There are n gas stations along a circular route, where gas[i] is the amount of gas at station i, and cost[i] is the gas needed to travel from station i to station i+1. Return the starting station index if you can travel around the circuit once, otherwise return -1. It is guaranteed that there is at most one solution.',
    examples:
      'Input: gas = [1,2,3,4,5], cost = [3,4,5,1,2]\nOutput: 3\nExplanation: Start at station 3 (gas=4). Travel 3->4->0->1->2->3 with enough gas at each step.\n\nInput: gas = [2,3,4], cost = [3,4,3]\nOutput: -1',
    intuition:
      'If the total gas is at least the total cost, a valid starting point must exist. The key insight is: if starting from station s you run out of gas at station i, then no station between s and i can work either (they would have even less gas). So you can skip ahead and try starting from i+1, finding the answer in one pass.',
    approach:
      'Greedy: If total gas >= total cost, a solution exists. Track the running surplus (gas[i] - cost[i]). Whenever the tank goes negative, reset the starting station to i+1 and reset the tank. The final starting station is the answer.',
    code: `class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        if sum(gas) < sum(cost):
            return -1

        total = 0
        start = 0

        for i in range(len(gas)):
            total += gas[i] - cost[i]
            if total < 0:
                total = 0
                start = i + 1

        return start`,
    jsCode: `var canCompleteCircuit = function(gas, cost) {
    // If we don't have enough total gas, no solution exists
    const totalGas  = gas.reduce((sum, g) => sum + g, 0);
    const totalCost = cost.reduce((sum, c) => sum + c, 0);

    if (totalGas < totalCost) {
        return -1;
    }

    // Since a solution is guaranteed to exist, greedily find the start station.
    // "tank" tracks our running fuel surplus from the current candidate start
    let tank  = 0;
    let start = 0;

    for (let i = 0; i < gas.length; i++) {
        const netGain = gas[i] - cost[i]; // fuel gained minus fuel spent at station i
        tank += netGain;

        if (tank < 0) {
            // Cannot reach station i+1 starting from "start".
            // Any station between "start" and i would also fail (they'd start with
            // even less surplus), so jump ahead to i+1 as the new candidate.
            tank  = 0;
            start = i + 1;
        }
    }

    return start;
};`,
    jsWalkthrough:
      'gas = [1,2,3,4,5], cost = [3,4,5,1,2]\n\n' +
      'step 1: totalGas=15, totalCost=15. 15 >= 15 → solution exists.\n' +
      'step 2: tank=0, start=0.\n' +
      'step 3: i=0. netGain=1-3=-2. tank=-2 < 0 → reset. tank=0, start=1.\n' +
      'step 4: i=1. netGain=2-4=-2. tank=-2 < 0 → reset. tank=0, start=2.\n' +
      'step 5: i=2. netGain=3-5=-2. tank=-2 < 0 → reset. tank=0, start=3.\n' +
      'step 6: i=3. netGain=4-1=3. tank=3 ≥ 0 → keep. tank=3, start=3.\n' +
      'step 7: i=4. netGain=5-2=3. tank=6 ≥ 0 → keep. tank=6, start=3.\n' +
      'result: start=3 (verified: 4-1=3 → 5-2=3→ 1-3=-2+6=1→ 2-4=-2+1→ 3-5=-2+... net is balanced)',
    explanation:
      '1. If sum(gas) < sum(cost), it is impossible to complete the circuit; return -1.\n2. Otherwise, a valid starting station exists. Track total (running tank balance) and start.\n3. For each station i:\n   - Add gas[i] - cost[i] to total.\n   - If total < 0, we cannot reach station i+1 from the current start. Reset start = i + 1 and total = 0.\n4. Return start. Since we know a solution exists, the final start value is correct.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'If total gas >= total cost, a solution is guaranteed to exist.',
      'If you run out of gas at station i starting from station s, no station between s and i can be the starting point.',
      'Reset the starting point whenever the running tank balance goes negative.',
    ],
  },
  {
    id: 435,
    description:
      'Given an array of intervals where intervals[i] = [start_i, end_i], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.',
    examples:
      'Input: intervals = [[1,2],[2,3],[3,4],[1,3]]\nOutput: 1\nExplanation: [1,3] can be removed.\n\nInput: intervals = [[1,2],[1,2],[1,2]]\nOutput: 2',
    intuition:
      'This is the classic activity selection problem. Sorting by end time and always keeping the interval that finishes earliest leaves the most room for future intervals. Any interval that overlaps with the one you kept must be removed, and greedy guarantees you remove the minimum number.',
    approach:
      'Greedy: Sort intervals by end time. Greedily keep intervals that do not overlap with the last kept interval. The number of removed intervals = total - number of kept intervals.',
    code: `class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        intervals.sort(key=lambda x: x[1])
        count = 0
        prev_end = float('-inf')

        for start, end in intervals:
            if start >= prev_end:
                prev_end = end
            else:
                count += 1

        return count`,
    jsCode: `var eraseOverlapIntervals = function(intervals) {
    // Sort by end time — the interval that ends earliest leaves
    // the most room for future intervals (greedy choice)
    intervals.sort((a, b) => a[1] - b[1]);

    // count = number of intervals we must remove
    let count = 0;

    // prevEnd = end time of the last interval we decided to keep
    let prevEnd = -Infinity;

    for (const [start, end] of intervals) {
        if (start >= prevEnd) {
            // No overlap with the last kept interval — keep this one
            prevEnd = end;
        } else {
            // Overlap detected — remove this interval
            // The sorted order ensures we already kept the earlier-ending one
            count++;
        }
    }

    return count;
};`,
    jsWalkthrough:
      'intervals = [[1,2],[2,3],[3,4],[1,3]]\n\n' +
      'step 1: sort by end time → [[1,2],[2,3],[1,3],[3,4]]\n' +
      'step 2: prevEnd = -Infinity, count = 0\n' +
      'step 3: [1,2] — start(1) >= prevEnd(-Inf) → keep, prevEnd = 2\n' +
      'step 4: [2,3] — start(2) >= prevEnd(2) → keep, prevEnd = 3\n' +
      'step 5: [1,3] — start(1) < prevEnd(3) → overlap, remove, count = 1\n' +
      'step 6: [3,4] — start(3) >= prevEnd(3) → keep, prevEnd = 4\n' +
      'result: 1 interval removed',
    explanation:
      '1. Sort intervals by their end time (greedy choice: keep the interval that finishes earliest).\n2. Initialize prev_end to negative infinity and count (removals) to 0.\n3. For each interval [start, end]:\n   - If start >= prev_end, this interval does not overlap; keep it and update prev_end = end.\n   - Otherwise, it overlaps with the previous kept interval; increment count (remove it).\n4. Return count, the number of intervals removed.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sort by end time, not start time.',
      'Keeping the interval that ends earliest leaves the most room for future intervals.',
      'This is equivalent to finding the maximum number of non-overlapping intervals.',
    ],
  },
  {
    id: 452,
    description:
      'There are some spherical balloons taped on a flat wall. Given a 2D array points where points[i] = [x_start, x_end], representing the horizontal diameter of the ith balloon. Find the minimum number of arrows that must be shot vertically to burst all balloons.',
    examples:
      'Input: points = [[10,16],[2,8],[1,6],[7,12]]\nOutput: 2\nExplanation: Shoot at x=6 (bursts [2,8] and [1,6]) and x=11 (bursts [10,16] and [7,12]).\n\nInput: points = [[1,2],[3,4],[5,6],[7,8]]\nOutput: 4',
    intuition:
      'This is essentially the same as the non-overlapping intervals problem. Sort balloons by their right edge and shoot an arrow there. Any balloon that starts before or at the arrow position gets burst for free. You only need a new arrow when the next balloon starts after the current arrow.',
    approach:
      'Greedy: Sort balloons by end position. Shoot an arrow at the end of the first balloon. Skip all balloons that this arrow also bursts. Repeat for the next unbursted balloon.',
    code: `class Solution:
    def findMinArrowShots(self, points: List[List[int]]) -> int:
        points.sort(key=lambda x: x[1])
        arrows = 1
        arrow_pos = points[0][1]

        for start, end in points[1:]:
            if start > arrow_pos:
                arrows += 1
                arrow_pos = end

        return arrows`,
    jsCode: `var findMinArrowShots = function(points) {
    // Sort by right edge (end position) — shoot at the earliest end
    // to burst the current balloon and potentially others at once
    points.sort((a, b) => a[1] - b[1]);

    // Start with one arrow at the end of the first balloon
    let arrows = 1;
    let arrowPos = points[0][1];

    for (let i = 1; i < points.length; i++) {
        const balloonStart = points[i][0];
        const balloonEnd   = points[i][1];

        if (balloonStart > arrowPos) {
            // This balloon starts after the current arrow — the arrow misses it
            // Shoot a new arrow at this balloon's end
            arrows++;
            arrowPos = balloonEnd;
        }
        // Otherwise the current arrow already bursts this balloon — no action needed
    }

    return arrows;
};`,
    jsWalkthrough:
      'points = [[10,16],[2,8],[1,6],[7,12]]\n\n' +
      'step 1: sort by end → [[1,6],[2,8],[7,12],[10,16]]\n' +
      'step 2: arrows = 1, arrowPos = 6 (shoot at end of [1,6])\n' +
      'step 3: [2,8] — balloonStart(2) <= arrowPos(6) → current arrow bursts it\n' +
      'step 4: [7,12] — balloonStart(7) > arrowPos(6) → need new arrow, arrows=2, arrowPos=12\n' +
      'step 5: [10,16] — balloonStart(10) <= arrowPos(12) → current arrow bursts it\n' +
      'result: 2 arrows',
    explanation:
      "1. Sort balloons by their end position (x_end).\n2. Shoot the first arrow at the end of the first balloon. Initialize arrows = 1, arrow_pos = points[0][1].\n3. For each subsequent balloon [start, end]:\n   - If start > arrow_pos, this balloon is not burst by the current arrow. Shoot a new arrow at this balloon's end: arrows += 1, arrow_pos = end.\n   - Otherwise, the current arrow already bursts this balloon.\n4. Return arrows.",
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sort by end position and greedily shoot at the rightmost point that hits the current balloon.',
      'If the next balloon starts after the current arrow position, you need a new arrow.',
      'This is similar to the interval scheduling / non-overlapping intervals problem.',
    ],
  },
  {
    id: 763,
    description:
      'You are given a string s. Partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of the sizes of these parts.',
    examples:
      'Input: s = "ababcbacadefegdehijhklij"\nOutput: [9,7,8]\nExplanation: The partition is "ababcbaca", "defegde", "hijhklij".',
    intuition:
      'If a character appears at both position 2 and position 8, then the partition must include at least positions 2 through 8. As you scan, every character you encounter might push the partition boundary further right. When your current position reaches the boundary, no character inside needs to appear outside, so you can safely cut.',
    approach:
      'Greedy: First, record the last occurrence of each character. Then iterate through the string, expanding the current partition to include the farthest last occurrence of any character seen so far. When the current index reaches the partition end, close the partition.',
    code: `class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        last = {}
        for i, c in enumerate(s):
            last[c] = i

        result = []
        start = 0
        end = 0

        for i, c in enumerate(s):
            end = max(end, last[c])
            if i == end:
                result.append(end - start + 1)
                start = i + 1

        return result`,
    jsCode: `var partitionLabels = function(s) {
    // Pass 1: record the last index where each character appears
    const last = {};
    for (let i = 0; i < s.length; i++) {
        last[s[i]] = i;
    }

    const result = [];

    // start = beginning of the current partition
    // end = farthest index any character in the current partition can reach
    let start = 0;
    let end = 0;

    for (let i = 0; i < s.length; i++) {
        const currentChar = s[i];
        const lastOccurrence = last[currentChar];

        // Expand the partition boundary if this character appears later
        end = Math.max(end, lastOccurrence);

        if (i === end) {
            // We've reached the end of the current partition
            // All characters inside appear only in this segment
            const partitionSize = end - start + 1;
            result.push(partitionSize);

            // Start a new partition from the next index
            start = i + 1;
        }
    }

    return result;
};`,
    jsWalkthrough:
      's = "ababcbacadefegde"\n\n' +
      'step 1: build last = {a:8, b:5, c:7, d:14, e:15, f:11, g:13}\n' +
      'step 2: start=0, end=0\n' +
      'step 3: i=0, char="a", last["a"]=8. end=max(0,8)=8\n' +
      'step 4: i=1, char="b", last["b"]=5. end=max(8,5)=8\n' +
      'step 5: i=2..8 — end stays 8 or grows. i=8: end=8 === i → partition size=8-0+1=9, start=9\n' +
      'step 6: i=9, char="d", last["d"]=14. end=max(0,14)=14\n' +
      'step 7: continue... i=14: end=15, not equal. i=15: end=15 === i → size=15-9+1=7, start=16\n' +
      'result: [9, 7, ...]',
    explanation:
      '1. Build a dictionary last mapping each character to its last index in s.\n2. Iterate through s, tracking start and end of the current partition.\n3. For each character at index i, update end = max(end, last[c]) to ensure all occurrences of c are in this partition.\n4. When i == end, we have reached the end of the current partition. Record its size (end - start + 1) and start a new partition.\n5. Return the list of partition sizes.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) (at most 26 characters)',
    hints: [
      'First find the last occurrence of each character.',
      'The current partition must extend to at least the farthest last occurrence of any character in it.',
      'Close the partition when the current index equals the partition end.',
    ],
  },
  {
    id: 678,
    description:
      'Given a string s containing only three types of characters: "(", ")" and "*", return true if s is valid. "*" can be treated as "(", ")" or an empty string.',
    examples:
      'Input: s = "()"\nOutput: true\n\nInput: s = "(*)"\nOutput: true\n\nInput: s = "(*))"\nOutput: true',
    intuition:
      'Since "*" can be anything, the number of unmatched open parentheses is not a fixed number -- it is a range. Track the minimum and maximum possible open count. The string is valid as long as the max never goes negative (too many closes) and the min reaches zero at the end (everything can be matched).',
    approach:
      'Greedy with two counters: Track the minimum and maximum possible number of open parentheses. min_open treats "*" as ")" or empty, max_open treats "*" as "(". The string is valid if min_open is ever 0 at the end and max_open never goes negative.',
    code: `class Solution:
    def checkValidString(self, s: str) -> bool:
        min_open = 0
        max_open = 0

        for c in s:
            if c == '(':
                min_open += 1
                max_open += 1
            elif c == ')':
                min_open -= 1
                max_open -= 1
            else:  # '*'
                min_open -= 1  # treat as ')'
                max_open += 1  # treat as '('

            if max_open < 0:
                return False
            if min_open < 0:
                min_open = 0

        return min_open == 0`,
    jsCode: `var checkValidString = function(s) {
    // minOpen = minimum possible number of unmatched open parens
    //   (treat '*' as ')' or empty string — pessimistic for opens)
    // maxOpen = maximum possible number of unmatched open parens
    //   (treat '*' as '(' — optimistic for opens)
    let minOpen = 0;
    let maxOpen = 0;

    for (const c of s) {
        if (c === '(') {
            // Both min and max increase — definite open paren
            minOpen++;
            maxOpen++;
        } else if (c === ')') {
            // Both min and max decrease — definite close paren
            minOpen--;
            maxOpen--;
        } else {
            // '*' can be '(' (max increases), ')' (min decreases), or '' (neither)
            minOpen--;  // most pessimistic: treat as ')'
            maxOpen++;  // most optimistic: treat as '('
        }

        // If even in the best case we have too many closes, it is impossible
        if (maxOpen < 0) {
            return false;
        }

        // minOpen cannot be negative — we can always choose '*' as '' to prevent it
        if (minOpen < 0) {
            minOpen = 0;
        }
    }

    // Valid if it is possible for all opens to be matched (min can reach 0)
    return minOpen === 0;
};`,
    jsWalkthrough:
      's = "(*))"\n\n' +
      'step 1: minOpen=0, maxOpen=0\n' +
      'step 2: c="(". minOpen=1, maxOpen=1\n' +
      'step 3: c="*". minOpen=0 (treated as ")"), maxOpen=2 (treated as "(")\n' +
      'step 4: c=")". minOpen=-1→clamped to 0, maxOpen=1\n' +
      'step 5: c=")". minOpen=-1→clamped to 0, maxOpen=0\n' +
      'step 6: maxOpen=0 (never went negative), minOpen=0 → return true\n' +
      'result: true ("(*" can be "((" or "(" or "(", matching the two ")"s)',
    explanation:
      '1. min_open tracks the minimum possible open parentheses count (stars treated as ")" or empty).\n2. max_open tracks the maximum possible open parentheses count (stars treated as "(").\n3. For each character:\n   - "(" increments both counters.\n   - ")" decrements both counters.\n   - "*" decrements min_open and increments max_open (covers all three cases).\n4. If max_open < 0, too many closing parens; return False.\n5. If min_open < 0, clamp it to 0 (we can choose not to use the star as ")").\n6. At the end, return whether min_open == 0 (all opens can be matched).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      '"*" can be "(", ")", or empty -- track the range of possible open counts.',
      'min_open should never stay negative; clamp it to 0.',
      'If max_open goes negative, return false immediately.',
    ],
  },

  // ===========================================
  // INTERVALS
  // ===========================================
  {
    id: 56,
    description:
      'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals and return an array of the non-overlapping intervals.',
    examples:
      'Input: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\nExplanation: [1,3] and [2,6] overlap, merged to [1,6].\n\nInput: intervals = [[1,4],[4,5]]\nOutput: [[1,5]]',
    intuition:
      'Once intervals are sorted by start time, overlapping intervals must be adjacent in the list. You can merge them in one pass: if the next interval starts before the current one ends, they overlap, so extend the current interval. Otherwise, start a new group. Sorting is what makes this single-pass merge possible.',
    approach:
      'Sort intervals by start time. Iterate through and merge overlapping intervals by extending the end of the last merged interval when overlap is detected.',
    code: `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda x: x[0])
        merged = [intervals[0]]

        for start, end in intervals[1:]:
            if start <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], end)
            else:
                merged.append([start, end])

        return merged`,
    jsCode: `var merge = function(intervals) {
    // Sort by start time so overlapping intervals are adjacent
    intervals.sort((a, b) => a[0] - b[0]);

    // Start with the first interval in the output list
    const merged = [intervals[0]];

    for (let i = 1; i < intervals.length; i++) {
        const [start, end] = intervals[i];

        // The last interval in merged is the one we may extend
        const lastMerged = merged[merged.length - 1];
        const lastEnd = lastMerged[1];

        if (start <= lastEnd) {
            // Overlap: extend the end of the last merged interval if needed
            lastMerged[1] = Math.max(lastEnd, end);
        } else {
            // No overlap: add this interval as a new entry
            merged.push([start, end]);
        }
    }

    return merged;
};`,
    jsWalkthrough:
      'intervals = [[1,3],[2,6],[8,10],[15,18]]\n\n' +
      'step 1: sort by start → [[1,3],[2,6],[8,10],[15,18]] (already sorted)\n' +
      'step 2: merged = [[1,3]]\n' +
      'step 3: [2,6] — start(2) <= lastEnd(3) → overlap, extend to max(3,6)=6. merged=[[1,6]]\n' +
      'step 4: [8,10] — start(8) > lastEnd(6) → no overlap, add. merged=[[1,6],[8,10]]\n' +
      'step 5: [15,18] — start(15) > lastEnd(10) → no overlap, add. merged=[[1,6],[8,10],[15,18]]\n' +
      'result: [[1,6],[8,10],[15,18]]',
    explanation:
      '1. Sort intervals by their start time.\n2. Initialize merged with the first interval.\n3. For each subsequent interval [start, end]:\n   - If start <= merged[-1][1], there is overlap. Extend the last merged interval: merged[-1][1] = max(merged[-1][1], end).\n   - Otherwise, no overlap; append the interval to merged.\n4. Return merged.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Sort by start time first.',
      'Two intervals overlap if the start of the second is <= the end of the first.',
      'When merging, take the maximum of the two end values.',
    ],
  },
  {
    id: 57,
    description:
      'You are given an array of non-overlapping intervals sorted by start time, and a new interval. Insert the new interval and merge if necessary. Return the result as a sorted, non-overlapping array.',
    examples:
      'Input: intervals = [[1,3],[6,9]], newInterval = [2,5]\nOutput: [[1,5],[6,9]]\n\nInput: intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]\nOutput: [[1,2],[3,10],[12,16]]',
    intuition:
      'Since the intervals are already sorted and non-overlapping, you can process them in one pass. Every interval falls into one of three categories relative to the new interval: entirely before it, overlapping with it, or entirely after it. Intervals before and after are kept as-is; overlapping ones get merged by expanding the new interval.',
    approach:
      'Linear scan: Iterate through intervals. Add all intervals that end before the new interval starts. Merge all overlapping intervals with the new interval. Add all intervals that start after the new interval ends.',
    code: `class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        result = []

        for i, (start, end) in enumerate(intervals):
            if end < newInterval[0]:
                result.append([start, end])
            elif start > newInterval[1]:
                result.append(newInterval)
                return result + intervals[i:]
            else:
                newInterval[0] = min(newInterval[0], start)
                newInterval[1] = max(newInterval[1], end)

        result.append(newInterval)
        return result`,
    jsCode: `var insert = function(intervals, newInterval) {
    const result = [];

    for (let i = 0; i < intervals.length; i++) {
        const [start, end] = intervals[i];

        if (end < newInterval[0]) {
            // This interval ends before the new interval starts — no overlap, keep it
            result.push([start, end]);

        } else if (start > newInterval[1]) {
            // This interval starts after the new interval ends — no overlap
            // The new interval is now fully placed; add it, then append all remaining intervals
            result.push(newInterval);
            return result.concat(intervals.slice(i));

        } else {
            // Overlap: merge by expanding the new interval to cover both
            newInterval[0] = Math.min(newInterval[0], start);
            newInterval[1] = Math.max(newInterval[1], end);
        }
    }

    // The new interval extends to or past the last interval
    result.push(newInterval);
    return result;
};`,
    jsWalkthrough:
      'intervals = [[1,3],[6,9]], newInterval = [2,5]\n\n' +
      'step 1: result = []\n' +
      'step 2: i=0, [1,3]. end(3) >= newInterval[0](2) and start(1) <= newInterval[1](5) → overlap\n' +
      '        merge: newInterval = [min(2,1), max(5,3)] = [1,5]\n' +
      'step 3: i=1, [6,9]. start(6) > newInterval[1](5) → no overlap, comes after\n' +
      '        push newInterval [1,5], return [[1,5]] + [[6,9]] = [[1,5],[6,9]]\n' +
      'result: [[1,5],[6,9]]',
    explanation:
      '1. Iterate through each interval:\n   - If the interval ends before the new interval starts (end < newInterval[0]), add it to result (no overlap).\n   - If the interval starts after the new interval ends (start > newInterval[1]), add newInterval to result and append all remaining intervals.\n   - Otherwise, the interval overlaps with newInterval. Merge by expanding newInterval to cover both.\n2. If we exit the loop without returning, append newInterval (it extends to the end).\n3. Return result.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Since intervals are already sorted, you only need one pass.',
      'Handle three cases: before the new interval, overlapping, and after.',
      'Merge by taking the min of starts and max of ends.',
    ],
  },
  {
    id: 228,
    description:
      'You are given a sorted unique integer array nums. Return the smallest sorted list of ranges that cover all the numbers exactly. Each range [a,b] should be formatted as "a->b" if a != b, or "a" if a == b.',
    examples:
      'Input: nums = [0,1,2,4,5,7]\nOutput: ["0->2","4->5","7"]\n\nInput: nums = [0,2,3,4,8,10,11]\nOutput: ["0","2->4","8","10->11"]',
    intuition:
      'Since the array is sorted, consecutive numbers will be adjacent. Start a range, then keep advancing while each next number is exactly one more than the previous. When you hit a gap, close the current range and start a new one. The sorted order guarantees you will not miss any consecutive sequences.',
    approach:
      'Linear scan: Iterate through the array, identifying consecutive sequences. When a gap is found, close the current range and start a new one.',
    code: `class Solution:
    def summaryRanges(self, nums: List[int]) -> List[str]:
        result = []
        i = 0

        while i < len(nums):
            start = nums[i]
            while i + 1 < len(nums) and nums[i + 1] == nums[i] + 1:
                i += 1

            if nums[i] != start:
                result.append(f"{start}->{nums[i]}")
            else:
                result.append(str(start))
            i += 1

        return result`,
    jsCode: `var summaryRanges = function(nums) {
    const result = [];
    let i = 0;

    while (i < nums.length) {
        // Mark the beginning of a new consecutive range
        const rangeStart = nums[i];

        // Advance i while the sequence is consecutive (each next element is exactly +1)
        while (i + 1 < nums.length && nums[i + 1] === nums[i] + 1) {
            i++;
        }

        // nums[i] is now the last element of the consecutive range
        const rangeEnd = nums[i];

        if (rangeEnd !== rangeStart) {
            // Multi-element range: format as "start->end"
            result.push(rangeStart + "->" + rangeEnd);
        } else {
            // Single element: just the number as a string
            result.push("" + rangeStart);
        }

        // Move past the end of this range
        i++;
    }

    return result;
};`,
    jsWalkthrough:
      'nums = [0,1,2,4,5,7]\n\n' +
      'step 1: i=0, rangeStart=0. nums[1]=1===0+1 → i=1. nums[2]=2===1+1 → i=2. nums[3]=4≠2+1 → stop.\n' +
      '        rangeEnd=2, rangeEnd≠rangeStart → push "0->2". i=3.\n' +
      'step 2: i=3, rangeStart=4. nums[4]=5===4+1 → i=4. nums[5]=7≠5+1 → stop.\n' +
      '        rangeEnd=5, rangeEnd≠rangeStart → push "4->5". i=5.\n' +
      'step 3: i=5, rangeStart=7. i+1=6 out of bounds → stop immediately.\n' +
      '        rangeEnd=7, rangeEnd===rangeStart → push "7". i=6.\n' +
      'result: ["0->2","4->5","7"]',
    explanation:
      '1. Use a pointer i to iterate through nums.\n2. For each starting position, record start = nums[i].\n3. Advance i while the next element is consecutive (nums[i+1] == nums[i] + 1).\n4. If the range has more than one element (nums[i] != start), format as "start->end".\n5. Otherwise, format as just the single number.\n6. Move i forward and continue.\n7. Return the list of formatted ranges.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) excluding output',
    hints: [
      'Track the start of each consecutive range.',
      'Advance while elements are consecutive.',
      'Format differently for single elements vs. ranges.',
    ],
  },

  // ===========================================
  // MATH / BIT MANIPULATION
  // ===========================================
  {
    id: 48,
    description:
      'You are given an n x n 2D matrix representing an image. Rotate the image by 90 degrees clockwise. You must rotate the image in-place.',
    examples:
      'Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [[7,4,1],[8,5,2],[9,6,3]]',
    intuition:
      'A 90-degree clockwise rotation can be decomposed into two simple operations: first transpose (flip along the main diagonal, swapping rows and columns), then reverse each row. Each operation is easy to implement in-place, and together they produce the desired rotation.',
    approach:
      'Transpose and Reverse: First transpose the matrix (swap matrix[i][j] with matrix[j][i]), then reverse each row. This achieves a 90-degree clockwise rotation in-place.',
    code: `class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)

        # Transpose
        for i in range(n):
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

        # Reverse each row
        for row in matrix:
            row.reverse()`,
    jsCode: `var rotate = function(matrix) {
    const n = matrix.length;

    // Step 1: Transpose the matrix
    // Swap matrix[i][j] with matrix[j][i] for all cells above the diagonal
    // This flips the matrix along its main diagonal
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        }
    }

    // Step 2: Reverse each row
    // Combined with the transpose above, this produces a 90-degree clockwise rotation
    for (const row of matrix) {
        row.reverse();
    }
};`,
    jsWalkthrough:
      'matrix = [[1,2,3],[4,5,6],[7,8,9]]\n\n' +
      'step 1: transpose (swap above-diagonal elements)\n' +
      '  swap (0,1)↔(1,0): 2↔4\n' +
      '  swap (0,2)↔(2,0): 3↔7\n' +
      '  swap (1,2)↔(2,1): 6↔8\n' +
      '  after transpose: [[1,4,7],[2,5,8],[3,6,9]]\n' +
      'step 2: reverse each row\n' +
      '  row 0: [1,4,7] → [7,4,1]\n' +
      '  row 1: [2,5,8] → [8,5,2]\n' +
      '  row 2: [3,6,9] → [9,6,3]\n' +
      'result: [[7,4,1],[8,5,2],[9,6,3]]',
    explanation:
      '1. Transpose the matrix: swap matrix[i][j] with matrix[j][i] for all i < j.\n   - This flips the matrix along its main diagonal.\n2. Reverse each row.\n   - Combined with the transpose, this produces a 90-degree clockwise rotation.\n3. The operation is done in-place with no extra matrix allocation.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
    hints: [
      'A 90-degree clockwise rotation = transpose + reverse each row.',
      'A 90-degree counter-clockwise rotation = transpose + reverse each column.',
      'You only need to swap elements above the diagonal during transpose.',
    ],
  },
  {
    id: 54,
    description:
      'Given an m x n matrix, return all elements of the matrix in spiral order.',
    examples:
      'Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [1,2,3,6,9,8,7,4,5]\n\nInput: matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]\nOutput: [1,2,3,4,8,12,11,10,9,5,6,7]',
    intuition:
      'Think of peeling the matrix layer by layer, like an onion. Traverse the outermost border in a clockwise direction (right, down, left, up), then shrink the boundaries inward and repeat. Four boundary variables (top, bottom, left, right) tell you which layer you are currently on.',
    approach:
      'Layer-by-layer traversal: Maintain four boundaries (top, bottom, left, right) and traverse the outermost layer in four directions. After each full layer, shrink the boundaries inward.',
    code: `class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        result = []
        top, bottom = 0, len(matrix) - 1
        left, right = 0, len(matrix[0]) - 1

        while top <= bottom and left <= right:
            # Traverse right
            for col in range(left, right + 1):
                result.append(matrix[top][col])
            top += 1

            # Traverse down
            for row in range(top, bottom + 1):
                result.append(matrix[row][right])
            right -= 1

            # Traverse left
            if top <= bottom:
                for col in range(right, left - 1, -1):
                    result.append(matrix[bottom][col])
                bottom -= 1

            # Traverse up
            if left <= right:
                for row in range(bottom, top - 1, -1):
                    result.append(matrix[row][left])
                left += 1

        return result`,
    jsCode: `var spiralOrder = function(matrix) {
    const result = [];

    // Four boundaries define the current "layer" of the spiral
    let top    = 0;
    let bottom = matrix.length - 1;
    let left   = 0;
    let right  = matrix[0].length - 1;

    while (top <= bottom && left <= right) {
        // 1. Traverse right along the top row
        for (let col = left; col <= right; col++) {
            result.push(matrix[top][col]);
        }
        top++; // shrink top boundary inward

        // 2. Traverse down along the right column
        for (let row = top; row <= bottom; row++) {
            result.push(matrix[row][right]);
        }
        right--; // shrink right boundary inward

        // 3. Traverse left along the bottom row (only if rows remain)
        if (top <= bottom) {
            for (let col = right; col >= left; col--) {
                result.push(matrix[bottom][col]);
            }
            bottom--; // shrink bottom boundary inward
        }

        // 4. Traverse up along the left column (only if columns remain)
        if (left <= right) {
            for (let row = bottom; row >= top; row--) {
                result.push(matrix[row][left]);
            }
            left++; // shrink left boundary inward
        }
    }

    return result;
};`,
    jsWalkthrough:
      'matrix = [[1,2,3],[4,5,6],[7,8,9]]\n\n' +
      'step 1: top=0,bottom=2,left=0,right=2\n' +
      'step 2: traverse right row 0: push 1,2,3. top=1\n' +
      'step 3: traverse down col 2: push 6,9. right=1\n' +
      'step 4: top(1)<=bottom(2), traverse left row 2: push 8,7. bottom=1\n' +
      'step 5: left(0)<=right(1), traverse up col 0: push 4. left=1\n' +
      'step 6: top=1,bottom=1,left=1,right=1 — one cell left\n' +
      'step 7: traverse right row 1: push 5. top=2\n' +
      'step 8: top(2)>bottom(1) → loop ends\n' +
      'result: [1,2,3,6,9,8,7,4,5]',
    explanation:
      '1. Define four boundaries: top, bottom, left, right.\n2. While boundaries are valid (top <= bottom and left <= right):\n   - Traverse right along the top row, then increment top.\n   - Traverse down along the right column, then decrement right.\n   - If top <= bottom, traverse left along the bottom row, then decrement bottom.\n   - If left <= right, traverse up along the left column, then increment left.\n3. The boundary checks before left and up traversals prevent duplicates when the remaining area is a single row or column.\n4. Return result.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(1) excluding output',
    hints: [
      'Use four boundaries to define the current layer.',
      'Traverse in order: right, down, left, up.',
      'Check boundaries before the left and up traversals to avoid double-counting.',
    ],
  },
  {
    id: 73,
    description:
      'Given an m x n integer matrix, if an element is 0, set its entire row and column to 0. You must do it in-place.',
    examples:
      'Input: matrix = [[1,1,1],[1,0,1],[1,1,1]]\nOutput: [[1,0,1],[0,0,0],[1,0,1]]\n\nInput: matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]\nOutput: [[0,0,0,0],[0,4,5,0],[0,3,1,0]]',
    intuition:
      'The challenge is marking which rows and columns to zero without using extra space. The trick is to use the first row and first column of the matrix itself as markers. When you find a zero at (i,j), mark matrix[i][0] and matrix[0][j] as zero. Then do a second pass to zero out marked rows and columns. Just handle the first row and column separately since they serve double duty.',
    approach:
      'Use the first row and first column as markers. First, check if the first row or first column themselves contain zeros. Then use them to mark which rows and columns should be zeroed. Finally, zero out the marked rows/columns and handle the first row/column.',
    code: `class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        first_row_zero = any(matrix[0][j] == 0 for j in range(n))
        first_col_zero = any(matrix[i][0] == 0 for i in range(m))

        # Mark zeros in first row/col
        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][j] == 0:
                    matrix[i][0] = 0
                    matrix[0][j] = 0

        # Zero out cells based on marks
        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][0] == 0 or matrix[0][j] == 0:
                    matrix[i][j] = 0

        # Handle first row
        if first_row_zero:
            for j in range(n):
                matrix[0][j] = 0

        # Handle first column
        if first_col_zero:
            for i in range(m):
                matrix[i][0] = 0`,
    jsCode: `var setZeroes = function(matrix) {
    const m = matrix.length;
    const n = matrix[0].length;

    // Phase 1: Remember whether the first row and first column already contain zeros
    // (we are about to use them as markers, so we need to preserve this info)
    let firstRowZero = false;
    let firstColZero = false;

    for (let j = 0; j < n; j++) {
        if (matrix[0][j] === 0) {
            firstRowZero = true;
        }
    }
    for (let i = 0; i < m; i++) {
        if (matrix[i][0] === 0) {
            firstColZero = true;
        }
    }

    // Phase 2: Use the first row and first column as markers
    // If matrix[i][j] == 0, mark its row (matrix[i][0]) and column (matrix[0][j])
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            if (matrix[i][j] === 0) {
                matrix[i][0] = 0; // mark row i
                matrix[0][j] = 0; // mark column j
            }
        }
    }

    // Phase 3: Zero out inner cells based on the markers
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            if (matrix[i][0] === 0 || matrix[0][j] === 0) {
                matrix[i][j] = 0;
            }
        }
    }

    // Phase 4: Handle the first row and column using the flags from Phase 1
    if (firstRowZero) {
        for (let j = 0; j < n; j++) {
            matrix[0][j] = 0;
        }
    }
    if (firstColZero) {
        for (let i = 0; i < m; i++) {
            matrix[i][0] = 0;
        }
    }
};`,
    jsWalkthrough:
      'matrix = [[1,1,1],[1,0,1],[1,1,1]]\n\n' +
      'step 1: check first row [1,1,1] — no zeros, firstRowZero=false\n' +
      'step 2: check first col [1,1,1] — no zeros, firstColZero=false\n' +
      'step 3: scan inner cells. i=1,j=1: matrix[1][1]=0 → mark matrix[1][0]=0, matrix[0][1]=0\n' +
      'step 4: matrix is now [[1,0,1],[0,0,1],[1,1,1]] (just the markers)\n' +
      'step 5: zero out inner cells: i=1,j=1: row marker matrix[1][0]=0 → zero. i=1,j=2: row marker → zero.\n' +
      '        i=2,j=1: col marker matrix[0][1]=0 → zero.\n' +
      'step 6: firstRowZero=false and firstColZero=false → no changes to first row/col\n' +
      'result: [[1,0,1],[0,0,0],[1,0,1]]',
    explanation:
      '1. Record whether the first row or first column originally contains any zeros.\n2. Use the first row and first column as markers: for each zero at (i, j), set matrix[i][0] = 0 and matrix[0][j] = 0.\n3. Iterate through the inner matrix (i >= 1, j >= 1): if matrix[i][0] == 0 or matrix[0][j] == 0, set matrix[i][j] = 0.\n4. Finally, if first_row_zero, zero out the entire first row. If first_col_zero, zero out the entire first column.\n5. This achieves O(1) extra space.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Use the matrix itself to store which rows and columns need to be zeroed.',
      'Be careful with the first row and first column -- handle them separately.',
      'Process the inner matrix before the first row/column to avoid corrupting markers.',
    ],
  },
  {
    id: 136,
    description:
      'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. You must use O(1) extra space.',
    examples:
      'Input: nums = [2,2,1]\nOutput: 1\n\nInput: nums = [4,1,2,1,2]\nOutput: 4',
    intuition:
      'XOR has a magical property: any number XORed with itself gives 0, and any number XORed with 0 gives itself. So if you XOR all numbers together, every pair cancels out to 0, and only the unique number survives. No sorting or hash maps needed.',
    approach:
      'Bit Manipulation (XOR): XOR all numbers together. Since a ^ a = 0 and a ^ 0 = a, all pairs cancel out, leaving only the single number.',
    code: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0
        for n in nums:
            result ^= n
        return result`,
    jsCode: `var singleNumber = function(nums) {
    // XOR accumulates bits; a ^ a = 0, so every duplicate cancels out
    // Only the unique number, which has no pair, will remain in result
    let result = 0;

    for (const n of nums) {
        result = result ^ n;
    }

    return result;
};`,
    jsWalkthrough:
      'nums = [4,1,2,1,2]\n\n' +
      'step 1: result = 0\n' +
      'step 2: n=4. result = 0 ^ 4 = 4\n' +
      'step 3: n=1. result = 4 ^ 1 = 5\n' +
      'step 4: n=2. result = 5 ^ 2 = 7\n' +
      'step 5: n=1. result = 7 ^ 1 = 6  (the two 1s cancel: 1^1=0, so effectively 4^2=6)\n' +
      'step 6: n=2. result = 6 ^ 2 = 4  (the two 2s cancel: 2^2=0, so only 4 remains)\n' +
      'result: 4',
    explanation:
      '1. Initialize result = 0.\n2. XOR every number into result.\n3. Properties of XOR:\n   - a ^ a = 0 (identical numbers cancel out).\n   - a ^ 0 = a (XOR with zero is identity).\n   - XOR is commutative and associative.\n4. After XORing all numbers, only the single number remains.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'XOR of a number with itself is 0.',
      'XOR of a number with 0 is the number itself.',
      'XOR all elements together.',
    ],
  },
  {
    id: 191,
    description:
      'Write a function that takes the binary representation of a positive integer and returns the number of set bits (1 bits), also known as the Hamming weight.',
    examples:
      'Input: n = 11 (binary: 1011)\nOutput: 3\n\nInput: n = 128 (binary: 10000000)\nOutput: 1',
    intuition:
      'The trick n & (n-1) clears the lowest set bit of n. Subtracting 1 flips the lowest 1-bit and all the zeros below it, so ANDing with the original number removes exactly that one bit. Count how many times you can do this before n becomes 0, and that is your answer.',
    approach:
      'Bit Manipulation: Use n & (n - 1) to clear the lowest set bit in each iteration. Count the number of iterations until n becomes 0.',
    code: `class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1
            count += 1
        return count`,
    jsCode: `var hammingWeight = function(n) {
    let count = 0;

    while (n !== 0) {
        // n & (n - 1) clears the lowest set bit of n
        // Subtracting 1 turns the lowest 1-bit into 0 and flips all lower bits
        // ANDing with n restores everything above that bit and zeros everything at or below
        n = n & (n - 1);

        // We just eliminated one set bit, so increment the count
        count++;
    }

    return count;
};`,
    jsWalkthrough:
      'n = 11 (binary: 1011)\n\n' +
      'step 1: count = 0\n' +
      'step 2: n=1011. n&(n-1) = 1011 & 1010 = 1010 (cleared lowest bit). count=1\n' +
      'step 3: n=1010. n&(n-1) = 1010 & 1001 = 1000 (cleared lowest bit). count=2\n' +
      'step 4: n=1000. n&(n-1) = 1000 & 0111 = 0000 (cleared lowest bit). count=3\n' +
      'step 5: n=0 → loop ends\n' +
      'result: 3 set bits',
    explanation:
      '1. Initialize count = 0.\n2. While n is not 0:\n   - n &= n - 1: this clears the lowest set bit of n.\n   - Increment count.\n3. Return count, the total number of 1 bits.\n\nWhy n & (n-1) works: subtracting 1 flips the lowest set bit and all bits below it. ANDing with the original number clears exactly the lowest set bit.',
    timeComplexity: 'O(k) where k is the number of set bits',
    spaceComplexity: 'O(1)',
    hints: [
      'n & (n - 1) drops the lowest set bit.',
      'Count how many times you can do this until n becomes 0.',
      'This is more efficient than checking all 32 bits.',
    ],
  },
  {
    id: 202,
    description:
      'Write an algorithm to determine if a number n is a "happy number". A happy number is defined by: starting with any positive integer, replace the number by the sum of the squares of its digits, and repeat until the number equals 1 (it is happy) or loops endlessly in a cycle (it is not happy).',
    examples:
      'Input: n = 19\nOutput: true\nExplanation: 1^2 + 9^2 = 82, 8^2 + 2^2 = 68, 6^2 + 8^2 = 100, 1^2 + 0^2 + 0^2 = 1.\n\nInput: n = 2\nOutput: false',
    intuition:
      'The digit-square-sum sequence will either reach 1 (happy) or get stuck in an endless cycle (not happy). This is a cycle detection problem, just like detecting a cycle in a linked list. Use the tortoise-and-hare method: if the fast pointer reaches 1, the number is happy. If fast meets slow elsewhere, there is a cycle.',
    approach:
      'Floyd\'s Cycle Detection (fast and slow pointers): Use a slow pointer that computes the sum once and a fast pointer that computes it twice per step. If they meet at 1, it is happy. If they meet elsewhere, there is a cycle.',
    code: `class Solution:
    def isHappy(self, n: int) -> bool:
        def get_next(num):
            total = 0
            while num > 0:
                num, digit = divmod(num, 10)
                total += digit ** 2
            return total

        slow = n
        fast = get_next(n)

        while fast != 1 and slow != fast:
            slow = get_next(slow)
            fast = get_next(get_next(fast))

        return fast == 1`,
    jsCode: `var isHappy = function(n) {
    // Compute the sum of the squares of each digit of num
    const getNext = (num) => {
        let sumOfSquares = 0;
        while (num > 0) {
            const lastDigit = num % 10;      // extract the rightmost digit
            sumOfSquares += lastDigit * lastDigit;
            num = Math.floor(num / 10);      // remove the rightmost digit
        }
        return sumOfSquares;
    };

    // Floyd's cycle detection: slow advances one step, fast advances two steps
    let slow = n;
    let fast = getNext(n);

    while (fast !== 1 && slow !== fast) {
        slow = getNext(slow);           // one step
        fast = getNext(getNext(fast));  // two steps
    }

    // If fast reached 1, the sequence converges — the number is happy
    // If fast met slow (cycle detected), the number is not happy
    return fast === 1;
};`,
    jsWalkthrough:
      'n = 19\n\n' +
      'step 1: getNext(19) = 1^2 + 9^2 = 1 + 81 = 82\n' +
      'step 2: slow=19, fast=82\n' +
      'step 3: slow=getNext(19)=82. fast=getNext(getNext(82))=getNext(68)=100\n' +
      'step 4: slow=getNext(82)=68. fast=getNext(getNext(100))=getNext(1)=1\n' +
      'step 5: fast===1 → loop ends\n' +
      'result: true (fast reached 1)',
    explanation:
      "1. Define get_next(num) that computes the sum of squares of digits.\n2. Use Floyd's cycle detection:\n   - slow moves one step at a time.\n   - fast moves two steps at a time.\n3. If fast reaches 1, the number is happy.\n4. If slow == fast (they meet in a cycle), the number is not happy.\n5. Return whether fast == 1.",
    timeComplexity: 'O(log n) per step, O(log n) steps for convergence',
    spaceComplexity: 'O(1)',
    hints: [
      'The sequence either reaches 1 or enters a cycle.',
      'Use a set to detect cycles, or use Floyd\'s tortoise-and-hare algorithm for O(1) space.',
      'The sum of digit squares for any number below 1000 is at most 243 (9^2 * 3), so the range is bounded.',
    ],
  },
  {
    id: 268,
    description:
      'Given an array nums containing n distinct numbers in the range [0, n], return the one number in the range that is missing from the array.',
    examples:
      'Input: nums = [3,0,1]\nOutput: 2\n\nInput: nums = [0,1]\nOutput: 2\n\nInput: nums = [9,6,4,2,3,5,7,0,1]\nOutput: 8',
    intuition:
      'The array contains numbers 0 to n, but one is missing. If you XOR all the indices (0 to n) together with all the values in the array, every number that appears in both sets cancels out, leaving only the missing number. Alternatively, you can use the sum formula n*(n+1)/2 minus the array sum.',
    approach:
      'Bit Manipulation (XOR): XOR all indices 0 to n with all values in nums. Since each number except the missing one appears in both sets, they cancel out, leaving only the missing number.',
    code: `class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        result = len(nums)

        for i, n in enumerate(nums):
            result ^= i ^ n

        return result`,
    jsCode: `var missingNumber = function(nums) {
    // Start with n (the largest expected index, not present in nums as an index)
    // We will XOR in every index 0..n-1 and every value in nums
    // Each number that appears in both sets cancels out; only the missing one remains
    let result = nums.length;

    for (let i = 0; i < nums.length; i++) {
        // XOR the current index (part of the full range 0..n)
        result = result ^ i;

        // XOR the current value (the numbers actually present)
        result = result ^ nums[i];
    }

    // All present numbers cancelled; only the missing number remains
    return result;
};`,
    jsWalkthrough:
      'nums = [3,0,1] (n=3, missing=2)\n\n' +
      'step 1: result = 3 (start with n)\n' +
      'step 2: i=0, nums[0]=3. result = 3 ^ 0 ^ 3 = 0\n' +
      'step 3: i=1, nums[1]=0. result = 0 ^ 1 ^ 0 = 1\n' +
      'step 4: i=2, nums[2]=1. result = 1 ^ 2 ^ 1 = 2\n' +
      'step 5: indices XORed: 0,1,2,3. values XORed: 3,0,1.\n' +
      '        every number except 2 appears twice and cancels → 2 remains\n' +
      'result: 2',
    explanation:
      '1. Initialize result = len(nums) (the last index in range [0, n]).\n2. For each index i and value nums[i], XOR both with result.\n3. After the loop, every number from 0 to n has been XORed in via the indices, and every number in nums has been XORed in via the values. All numbers except the missing one appear twice and cancel out.\n4. Return result, which is the missing number.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'You could also use the formula n*(n+1)/2 - sum(nums).',
      'XOR approach: XOR all indices with all values; the missing number remains.',
      'Both approaches run in O(n) time and O(1) space.',
    ],
  },
  {
    id: 338,
    description:
      'Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1 bits in the binary representation of i.',
    examples:
      'Input: n = 2\nOutput: [0,1,1]\n\nInput: n = 5\nOutput: [0,1,1,2,1,2]',
    intuition:
      'The number of 1-bits in i is related to i/2 (right shift by 1). Right-shifting removes the last bit, which you already computed. So the count for i is just the count for i/2, plus 1 if i is odd (the last bit you removed was a 1). This lets you build the entire answer array in order, reusing previous results.',
    approach:
      'Dynamic Programming with bit manipulation: Use the recurrence ans[i] = ans[i >> 1] + (i & 1). The number of set bits in i is the same as in i//2, plus 1 if i is odd.',
    code: `class Solution:
    def countBits(self, n: int) -> List[int]:
        dp = [0] * (n + 1)

        for i in range(1, n + 1):
            dp[i] = dp[i >> 1] + (i & 1)

        return dp`,
    jsCode: `var countBits = function(n) {
    // dp[i] = number of 1-bits in i
    const dp = new Array(n + 1).fill(0);
    // dp[0] = 0 by default (zero has no set bits)

    for (let i = 1; i <= n; i++) {
        // i >> 1 is i with its last bit removed (i.e., i // 2)
        // We already know dp[i >> 1] from a previous iteration
        const bitsWithoutLastBit = dp[i >> 1];

        // i & 1 is 1 if i is odd (last bit is set), 0 if i is even
        const lastBit = i & 1;

        dp[i] = bitsWithoutLastBit + lastBit;
    }

    return dp;
};`,
    jsWalkthrough:
      'n = 5\n\n' +
      'step 1: dp = [0,0,0,0,0,0]\n' +
      'step 2: i=1. dp[1>>1]=dp[0]=0. lastBit=1&1=1. dp[1]=0+1=1\n' +
      'step 3: i=2. dp[2>>1]=dp[1]=1. lastBit=2&1=0. dp[2]=1+0=1\n' +
      'step 4: i=3. dp[3>>1]=dp[1]=1. lastBit=3&1=1. dp[3]=1+1=2\n' +
      'step 5: i=4. dp[4>>1]=dp[2]=1. lastBit=4&1=0. dp[4]=1+0=1\n' +
      'step 6: i=5. dp[5>>1]=dp[2]=1. lastBit=5&1=1. dp[5]=1+1=2\n' +
      'result: [0,1,1,2,1,2]',
    explanation:
      '1. Initialize dp[0] = 0.\n2. For each i from 1 to n:\n   - dp[i] = dp[i >> 1] + (i & 1).\n   - i >> 1 is i divided by 2 (right shift). It has the same bits as i except the last bit.\n   - (i & 1) is 1 if i is odd (last bit is set), 0 otherwise.\n3. This builds on previously computed values for O(1) per number.\n4. Return dp.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The number of 1 bits in i relates to the number of 1 bits in i/2.',
      'i >> 1 removes the last bit; i & 1 checks if the last bit is 1.',
      'dp[i] = dp[i >> 1] + (i & 1).',
    ],
  },
  {
    id: 371,
    description:
      'Given two integers a and b, return the sum of the two integers without using the operators + and -.',
    examples:
      'Input: a = 1, b = 2\nOutput: 3\n\nInput: a = 2, b = 3\nOutput: 5',
    intuition:
      'Addition at the bit level has two parts: the sum without carrying (XOR) and the carry (AND shifted left). Repeatedly compute the sum-without-carry and the carry until there is no carry left. This mirrors how you do addition by hand, digit by digit, propagating carries.',
    approach:
      'Bit Manipulation: Use XOR for sum without carry, AND + left shift for carry. Repeat until carry is zero. Handle negative numbers with a 32-bit mask for Python.',
    code: `class Solution:
    def getSum(self, a: int, b: int) -> int:
        MASK = 0xFFFFFFFF
        MAX_INT = 0x7FFFFFFF

        while b & MASK:
            carry = (a & b) << 1
            a = a ^ b
            b = carry

        # If b is 0 (within 32-bit), return a masked or as-is
        return (a & MASK) if a > MAX_INT else a`,
    jsCode: `var getSum = function(a, b) {
    while (b !== 0) {
        // carry: bits where BOTH a and b are 1 — these generate a carry to the next position
        const carry = (a & b) << 1;

        // XOR gives the sum of bits WITHOUT the carry (each bit added independently)
        a = a ^ b;

        // The carry becomes the new "b" to be added in the next round
        b = carry;

        // Use bitwise OR with 0 to keep values as signed 32-bit integers
        // This handles negative numbers correctly in JavaScript
        a = a | 0;
        b = b | 0;
    }

    // When b is 0, there is no more carry — a holds the final sum
    return a;
};`,
    jsWalkthrough:
      'a = 3 (011), b = 5 (101)\n\n' +
      'step 1: carry = (011 & 101) << 1 = 001 << 1 = 010. a = 011 ^ 101 = 110 (6). b = 010 (2)\n' +
      'step 2: carry = (110 & 010) << 1 = 010 << 1 = 100. a = 110 ^ 010 = 100 (4). b = 100 (4)\n' +
      'step 3: carry = (100 & 100) << 1 = 100 << 1 = 1000. a = 100 ^ 100 = 000. b = 1000 (8)\n' +
      'step 4: carry = (000 & 1000) << 1 = 0. a = 000 ^ 1000 = 1000 (8). b = 0\n' +
      'step 5: b === 0 → loop ends\n' +
      'result: 8 (3 + 5 = 8)',
    explanation:
      "1. Python integers have arbitrary precision, so we use a 32-bit mask (0xFFFFFFFF) to simulate 32-bit overflow.\n2. While there is a carry (b & MASK != 0):\n   - carry = (a & b) << 1: bits where both a and b are 1 produce a carry to the next position.\n   - a = a ^ b: XOR gives the sum ignoring carries.\n   - b = carry: the new b is the carry to be added in the next iteration.\n3. After the loop, check if a exceeds MAX_INT (0x7FFFFFFF). If so, mask it to get the correct negative 32-bit representation.\n4. Return a.",
    timeComplexity: 'O(1) (at most 32 iterations)',
    spaceComplexity: 'O(1)',
    hints: [
      'XOR gives the bit-wise sum without carry.',
      'AND followed by left shift gives the carry.',
      'Repeat until carry is zero.',
    ],
  },

  // ===========================================
  // DESIGN
  // ===========================================
  {
    id: 208,
    description:
      'Implement a trie (prefix tree) with insert, search, and startsWith methods.',
    examples:
      'Input: ["Trie","insert","search","search","startsWith","insert","search"]\n[[],["apple"],["apple"],["app"],["app"],["app"],["app"]]\nOutput: [null,null,true,false,true,null,true]',
    intuition:
      'A trie is like an autocomplete tree: each node represents a character, and paths from root to a marked node spell out words. Inserting builds a path character by character, search follows the path and checks the end marker, and startsWith just follows the path without needing the end marker. Nested dictionaries make this simple to implement.',
    approach:
      'Use a nested dictionary (or TrieNode class) where each node has a dictionary of children and a boolean flag indicating end of word. Insert builds the path, search checks the full path and end flag, startsWith checks only the path.',
    code: `class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word: str) -> None:
        node = self.root
        for c in word:
            if c not in node:
                node[c] = {}
            node = node[c]
        node['#'] = True

    def search(self, word: str) -> bool:
        node = self.root
        for c in word:
            if c not in node:
                return False
            node = node[c]
        return '#' in node

    def startsWith(self, prefix: str) -> bool:
        node = self.root
        for c in prefix:
            if c not in node:
                return False
            node = node[c]
        return True`,
    jsCode: `var Trie = function() {
    // The root is an empty node; each key is a character, each value is a child node
    this.root = {};
};

Trie.prototype.insert = function(word) {
    // Walk down the trie, creating nodes as needed for each character
    let node = this.root;

    for (const c of word) {
        if (!node[c]) {
            // This character does not exist at this level — create a new child node
            node[c] = {};
        }
        // Move to the child node for this character
        node = node[c];
    }

    // Mark the end of a complete word with a special sentinel key
    node['#'] = true;
};

Trie.prototype.search = function(word) {
    // Walk down the trie following each character of the word
    let node = this.root;

    for (const c of word) {
        if (!node[c]) {
            // Character not found — the word is not in the trie
            return false;
        }
        node = node[c];
    }

    // Check that we landed on a node that marks a complete word
    return '#' in node;
};

Trie.prototype.startsWith = function(prefix) {
    // Same as search, but we do NOT require the end-of-word marker
    let node = this.root;

    for (const c of prefix) {
        if (!node[c]) {
            return false;
        }
        node = node[c];
    }

    // If we traversed the full prefix without missing any node, it exists
    return true;
};`,
    jsWalkthrough:
      'operations: insert("apple"), search("apple"), search("app"), startsWith("app"), insert("app"), search("app")\n\n' +
      'step 1: insert("apple") — creates path: root→a→p→p→l→e, marks e["#"]=true\n' +
      'step 2: search("apple") — follows a→p→p→l→e, "#" in node → true\n' +
      'step 3: search("app") — follows a→p→p, "#" NOT in node → false\n' +
      'step 4: startsWith("app") — follows a→p→p, node exists → true\n' +
      'step 5: insert("app") — walks a→p→p (all exist), marks p["#"]=true\n' +
      'step 6: search("app") — follows a→p→p, "#" in node → true',
    explanation:
      '1. The trie is represented as nested dictionaries. Each key is a character, and "#" marks end of a word.\n2. insert: traverse/create nodes for each character, then set "#" = True at the end.\n3. search: traverse nodes for each character. If any character is missing, return False. At the end, check if "#" exists.\n4. startsWith: same as search but without checking for "#" at the end.',
    timeComplexity: 'O(m) per operation where m is the word/prefix length',
    spaceComplexity: 'O(total characters inserted)',
    hints: [
      'Each node stores children as a dictionary mapping characters to child nodes.',
      'Use a special marker (like "#") to indicate end of word.',
      'startsWith is like search but does not require the end-of-word marker.',
    ],
  },
  {
    id: 211,
    description:
      'Design a data structure that supports adding new words and finding if a string matches any previously added string. The search word may contain dots "." which can match any letter.',
    examples:
      'Input: ["WordDictionary","addWord","addWord","addWord","search","search","search","search"]\n[[],["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]\nOutput: [null,null,null,null,false,true,true,true]',
    intuition:
      'This builds on a standard trie, but the "." wildcard adds a twist. When you hit a ".", you cannot follow just one path -- you must try all children, since "." matches any letter. This makes search a DFS/backtracking problem where "." branches into all possible paths at that level.',
    approach:
      'Trie with DFS: Use a trie for storage. For search, when a "." is encountered, recursively search all children. For regular characters, follow the specific child.',
    code: `class WordDictionary:
    def __init__(self):
        self.root = {}

    def addWord(self, word: str) -> None:
        node = self.root
        for c in word:
            if c not in node:
                node[c] = {}
            node = node[c]
        node['#'] = True

    def search(self, word: str) -> bool:
        def dfs(node, i):
            if i == len(word):
                return '#' in node

            if word[i] == '.':
                for child in node:
                    if child != '#' and dfs(node[child], i + 1):
                        return True
                return False
            else:
                if word[i] not in node:
                    return False
                return dfs(node[word[i]], i + 1)

        return dfs(self.root, 0)`,
    jsCode: `var WordDictionary = function() {
    // Standard trie root node
    this.root = {};
};

WordDictionary.prototype.addWord = function(word) {
    // Standard trie insertion: create nodes for each character, mark end of word
    let node = this.root;

    for (const c of word) {
        if (!node[c]) {
            node[c] = {};
        }
        node = node[c];
    }

    node['#'] = true; // end-of-word sentinel
};

WordDictionary.prototype.search = function(word) {
    // DFS helper: node = current trie node, i = current index in word
    const dfs = (node, i) => {
        // Base case: we have processed all characters
        if (i === word.length) {
            return '#' in node; // valid only if this is a complete word
        }

        const currentChar = word[i];

        if (currentChar === '.') {
            // Wildcard: try every child node (except the end-of-word marker)
            for (const key in node) {
                if (key !== '#') {
                    const matched = dfs(node[key], i + 1);
                    if (matched) {
                        return true; // found a match through this branch
                    }
                }
            }
            return false; // no child matched the wildcard
        } else {
            // Specific character: follow only that child if it exists
            if (!node[currentChar]) {
                return false; // character not in trie
            }
            return dfs(node[currentChar], i + 1);
        }
    };

    return dfs(this.root, 0);
};`,
    jsWalkthrough:
      'addWord("bad"), addWord("dad"), addWord("mad"), then search(".ad"), search("b..")\n\n' +
      'step 1: after inserts, trie has paths: b→a→d#, d→a→d#, m→a→d#\n' +
      'step 2: search(".ad") — dfs(root, 0). char="." → try all root children: b, d, m\n' +
      '  branch b: dfs(b→node, 1). char="a" → follow "a". dfs(a→node, 2). char="d" → follow "d". dfs(d→node, 3). i=3=len → "#" in node → true!\n' +
      '  returns true immediately\n' +
      'step 3: search("b..") — dfs(root, 0). char="b" → follow "b".\n' +
      '  dfs(b→node, 1). char="." → try child "a". dfs(a→node, 2). char="." → try child "d".\n' +
      '  dfs(d→node, 3). i=3=len, "#" in node → true!\n' +
      'result: .ad → true, b.. → true',
    explanation:
      '1. addWord: standard trie insertion, same as problem 208.\n2. search: use DFS with index i into the search word.\n   - Base case: if i == len(word), check for end-of-word marker "#".\n   - If word[i] == ".", try all children (except "#") recursively. Return True if any branch matches.\n   - Otherwise, follow the specific character child if it exists.\n3. Return the result of dfs(root, 0).',
    timeComplexity: 'O(m) for addWord, O(26^m) worst case for search with all dots, O(m) typical',
    spaceComplexity: 'O(total characters inserted)',
    hints: [
      'Build a standard trie for addWord.',
      'For search, handle "." by branching to all children.',
      'Use DFS/backtracking for the wildcard matching.',
    ],
  },
  {
    id: 295,
    description:
      'Design a data structure that supports adding integers and finding the median of all elements added so far. Implement addNum(num) and findMedian().',
    examples:
      'Input: ["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]\n[[],[1],[2],[],[3],[]]\nOutput: [null,null,null,1.5,null,2.0]\nExplanation: After adding 1 and 2, median is (1+2)/2 = 1.5. After adding 3, median is 2.',
    intuition:
      'The median splits a sorted list into two halves. Maintain the lower half in a max-heap and the upper half in a min-heap. The tops of both heaps are always the middle elements. When sizes are equal, average both tops. When one is bigger, its top is the median. Balancing the heap sizes on each insert keeps this invariant.',
    approach:
      'Two Heaps: Maintain a max-heap (for the lower half) and a min-heap (for the upper half). Balance them so their sizes differ by at most 1. The median is either the top of the larger heap or the average of both tops.',
    code: `import heapq

class MedianFinder:
    def __init__(self):
        self.small = []  # max-heap (negate values)
        self.large = []  # min-heap

    def addNum(self, num: int) -> None:
        heapq.heappush(self.small, -num)

        # Ensure max of small <= min of large
        if self.small and self.large and -self.small[0] > self.large[0]:
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)

        # Balance sizes
        if len(self.small) > len(self.large) + 1:
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        elif len(self.large) > len(self.small) + 1:
            val = heapq.heappop(self.large)
            heapq.heappush(self.small, -val)

    def findMedian(self) -> float:
        if len(self.small) > len(self.large):
            return -self.small[0]
        elif len(self.large) > len(self.small):
            return self.large[0]
        else:
            return (-self.small[0] + self.large[0]) / 2.0`,
    jsCode: `// JavaScript has no built-in heap, so we implement a min-heap with helper functions.
// We use the min-heap to simulate a max-heap by storing negated values.

var MedianFinder = function() {
    // small = max-heap of the lower half (stored as negated values in a min-heap)
    this.small = [];
    // large = min-heap of the upper half
    this.large = [];
};

MedianFinder.prototype.addNum = function(num) {
    // Step 1: Push num into the lower half (negate to use min-heap as max-heap)
    heapPush(this.small, -num);

    // Step 2: Enforce the ordering invariant: max(small) <= min(large)
    // If the top of small is greater than the top of large, move it over
    if (this.small.length && this.large.length && -this.small[0] > this.large[0]) {
        const topOfSmall = -heapPop(this.small);
        heapPush(this.large, topOfSmall);
    }

    // Step 3: Balance sizes so they differ by at most 1
    if (this.small.length > this.large.length + 1) {
        // small is too big — move its max to large
        const topOfSmall = -heapPop(this.small);
        heapPush(this.large, topOfSmall);
    } else if (this.large.length > this.small.length + 1) {
        // large is too big — move its min to small
        const topOfLarge = heapPop(this.large);
        heapPush(this.small, -topOfLarge);
    }
};

MedianFinder.prototype.findMedian = function() {
    if (this.small.length > this.large.length) {
        // Lower half has one more element — its max is the median
        return -this.small[0];
    } else if (this.large.length > this.small.length) {
        // Upper half has one more element — its min is the median
        return this.large[0];
    } else {
        // Both halves are equal size — median is the average of both tops
        return (-this.small[0] + this.large[0]) / 2;
    }
};

// Min-heap push: bubble up the newly added element
function heapPush(heap, val) {
    heap.push(val);
    let i = heap.length - 1;
    while (i > 0) {
        const parent = (i - 1) >> 1;
        if (heap[parent] <= heap[i]) break;
        [heap[parent], heap[i]] = [heap[i], heap[parent]];
        i = parent;
    }
}

// Min-heap pop: remove and return the minimum, then restore heap order
function heapPop(heap) {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
        heap[0] = last;
        let i = 0;
        while (true) {
            let smallest = i;
            const left  = 2 * i + 1;
            const right = 2 * i + 2;
            if (left  < heap.length && heap[left]  < heap[smallest]) smallest = left;
            if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
            if (smallest === i) break;
            [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
            i = smallest;
        }
    }
    return top;
}`,
    jsWalkthrough:
      'addNum(1), addNum(2), findMedian(), addNum(3), findMedian()\n\n' +
      'step 1: addNum(1). push -1 to small=[−1]. sizes ok. small=[−1], large=[]\n' +
      'step 2: addNum(2). push -2 to small=[−2,−1]. max(small)=2 > no large → skip. small bigger by 2 → move 2 to large. small=[−1], large=[2]\n' +
      'step 3: findMedian(). sizes equal → (-(-1) + 2) / 2 = 1.5\n' +
      'step 4: addNum(3). push -3 to small=[−3,−1]. max(small)=3 > min(large)=2 → move 3 to large. small=[−1], large=[2,3]. sizes equal.\n' +
      'step 5: findMedian(). sizes equal → (-(-1) + 2) / 2... wait: small=[−1], large=[2,3] — large is bigger → return large[0] = 2',
    explanation:
      '1. small is a max-heap (using negated values since Python has min-heaps) holding the smaller half.\n2. large is a min-heap holding the larger half.\n3. addNum: push to small first, then rebalance:\n   - If the max of small > min of large, move the max of small to large.\n   - If sizes differ by more than 1, move from the larger heap to the smaller.\n4. findMedian: if one heap is larger, its top is the median. If equal size, average both tops.',
    timeComplexity: 'O(log n) for addNum, O(1) for findMedian',
    spaceComplexity: 'O(n)',
    hints: [
      'Use two heaps: a max-heap for the lower half and a min-heap for the upper half.',
      'Python only has min-heaps, so negate values for the max-heap.',
      'Keep the heaps balanced (sizes differ by at most 1).',
    ],
  },
  {
    id: 355,
    description:
      'Design a simplified version of Twitter. Users can post tweets, follow/unfollow other users, and see the 10 most recent tweets in their news feed (from themselves and people they follow).',
    examples:
      'Input: ["Twitter","postTweet","getNewsFeed","follow","postTweet","getNewsFeed","unfollow","getNewsFeed"]\n[[],[1,5],[1],[1,2],[2,6],[1],[1,2],[1]]\nOutput: [null,null,[5],null,null,[6,5],null,[5]]',
    intuition:
      'The news feed requires merging the most recent tweets from multiple users, which is exactly the "merge k sorted lists" problem. Each user\'s tweets are sorted by time. Use a heap to efficiently pick the most recent tweet across all followed users, pulling the next tweet from that user as needed, stopping after 10.',
    approach:
      'Use a dictionary for user tweets (with timestamps), a dictionary for follow sets, and a min-heap merge of the k most recent tweets from each followed user to get the top 10.',
    code: `import heapq
from collections import defaultdict

class Twitter:
    def __init__(self):
        self.count = 0
        self.tweet_map = defaultdict(list)   # userId -> [(count, tweetId)]
        self.follow_map = defaultdict(set)   # userId -> set of followeeIds

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.tweet_map[userId].append((self.count, tweetId))
        self.count -= 1  # decrement so most recent has smallest value (for min-heap)

    def getNewsFeed(self, userId: int) -> List[int]:
        result = []
        min_heap = []

        self.follow_map[userId].add(userId)  # include own tweets

        for followeeId in self.follow_map[userId]:
            if self.tweet_map[followeeId]:
                tweets = self.tweet_map[followeeId]
                idx = len(tweets) - 1
                count, tweetId = tweets[idx]
                heapq.heappush(min_heap, (count, tweetId, followeeId, idx))

        while min_heap and len(result) < 10:
            count, tweetId, followeeId, idx = heapq.heappop(min_heap)
            result.append(tweetId)
            if idx > 0:
                idx -= 1
                count, tweetId = self.tweet_map[followeeId][idx]
                heapq.heappush(min_heap, (count, tweetId, followeeId, idx))

        return result

    def follow(self, followerId: int, followeeId: int) -> None:
        self.follow_map[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.follow_map[followerId].discard(followeeId)`,
    jsCode: `var Twitter = function() {
    // Global decreasing timestamp: each new tweet gets a lower value
    // so the most recent tweet always has the smallest (most negative) count
    this.count = 0;

    // tweetMap: userId → array of [timestamp, tweetId] (oldest first, newest last)
    this.tweetMap = new Map();

    // followMap: userId → Set of followeeIds they follow
    this.followMap = new Map();
};

Twitter.prototype.postTweet = function(userId, tweetId) {
    // Ensure the user has a tweet list
    if (!this.tweetMap.has(userId)) {
        this.tweetMap.set(userId, []);
    }

    // Append [timestamp, tweetId] and decrement timestamp for next tweet
    this.tweetMap.get(userId).push([this.count, tweetId]);
    this.count--;
};

Twitter.prototype.getNewsFeed = function(userId) {
    const result = [];

    // A user always sees their own tweets
    if (!this.followMap.has(userId)) {
        this.followMap.set(userId, new Set());
    }
    this.followMap.get(userId).add(userId);

    // Build a list of "candidates" — one entry per followee's most recent tweet
    // Each candidate: { count (timestamp), tweetId, followeeId, idx (position in tweet list) }
    const candidates = [];
    for (const followeeId of this.followMap.get(userId)) {
        const tweets = this.tweetMap.get(followeeId);
        if (tweets && tweets.length > 0) {
            const idx = tweets.length - 1; // index of the most recent tweet
            candidates.push({
                count:      tweets[idx][0],
                tweetId:    tweets[idx][1],
                followeeId: followeeId,
                idx:        idx
            });
        }
    }

    // Merge-sort the streams: repeatedly pick the most recent tweet across all candidates
    while (candidates.length > 0 && result.length < 10) {
        // Sort to find the candidate with the smallest (most recent) timestamp
        candidates.sort((a, b) => a.count - b.count);
        const best = candidates.shift();

        result.push(best.tweetId);

        // If this followee has more tweets, add the next one to candidates
        if (best.idx > 0) {
            const tweets  = this.tweetMap.get(best.followeeId);
            const newIdx  = best.idx - 1;
            candidates.push({
                count:      tweets[newIdx][0],
                tweetId:    tweets[newIdx][1],
                followeeId: best.followeeId,
                idx:        newIdx
            });
        }
    }

    return result;
};

Twitter.prototype.follow = function(followerId, followeeId) {
    if (!this.followMap.has(followerId)) {
        this.followMap.set(followerId, new Set());
    }
    this.followMap.get(followerId).add(followeeId);
};

Twitter.prototype.unfollow = function(followerId, followeeId) {
    if (this.followMap.has(followerId)) {
        this.followMap.get(followerId).delete(followeeId);
    }
};`,
    jsWalkthrough:
      'postTweet(1,5), getNewsFeed(1), follow(1,2), postTweet(2,6), getNewsFeed(1)\n\n' +
      'step 1: postTweet(1,5). tweetMap={1:[[0,5]]}. count=-1\n' +
      'step 2: getNewsFeed(1). followMap adds user 1 to own feed. candidates=[{count:0,tweetId:5,followeeId:1,idx:0}]\n' +
      '        pick tweetId=5. result=[5]. idx=0 no more tweets.\n' +
      '        result: [5]\n' +
      'step 3: follow(1,2). followMap={1:{1,2}}\n' +
      'step 4: postTweet(2,6). tweetMap={1:[[0,5]], 2:[[-1,6]]}. count=-2\n' +
      'step 5: getNewsFeed(1). candidates=[{count:0,tweetId:5,...},{count:-1,tweetId:6,...}]\n' +
      '        pick smallest count: tweetId=6 (count=-1). result=[6].\n' +
      '        pick next: tweetId=5 (count=0). result=[6,5].\n' +
      '        result: [6,5]',
    explanation:
      "1. postTweet: append (count, tweetId) to the user's tweet list. Decrement count so the most recent tweet has the smallest count value (for the min-heap).\n2. getNewsFeed: merge the latest tweets from the user and all followed users.\n   - For each followee, push their most recent tweet onto a min-heap.\n   - Pop the most recent (smallest count) tweet, add to result, and push that followee's next tweet.\n   - Stop after 10 tweets.\n3. follow/unfollow: add/remove from the follow set.",
    timeComplexity: 'O(k log k) for getNewsFeed where k = number of followees, O(1) for other operations',
    spaceComplexity: 'O(total tweets + total follow relationships)',
    hints: [
      'Use a decreasing counter so the most recent tweet has the smallest value for the min-heap.',
      'Merge the k most recent tweet streams using a heap (similar to merge k sorted lists).',
      'Remember that a user sees their own tweets too.',
    ],
  },
  {
    id: 621,
    description:
      'Given an array of tasks represented by characters and a non-negative cooling interval n, return the least number of units of time the CPU will take to finish all tasks. The same task must be separated by at least n intervals.',
    examples:
      'Input: tasks = ["A","A","A","B","B","B"], n = 2\nOutput: 8\nExplanation: A -> B -> idle -> A -> B -> idle -> A -> B.',
    intuition:
      'The most frequent task dictates the schedule. Imagine arranging the most common task with n-slot gaps between each occurrence. Less frequent tasks fill those gaps, reducing idle time. The formula (maxFreq - 1) * (n + 1) + count_of_max_freq_tasks captures the minimum frame size, but if there are many tasks, they might fill all gaps with no idle time.',
    approach:
      'Greedy/Math: The task with the maximum frequency determines the minimum time. Calculate (max_freq - 1) * (n + 1) + count_of_tasks_with_max_freq. The answer is the max of this and the total number of tasks.',
    code: `class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        from collections import Counter

        freq = Counter(tasks)
        max_freq = max(freq.values())
        max_count = sum(1 for v in freq.values() if v == max_freq)

        return max(len(tasks), (max_freq - 1) * (n + 1) + max_count)`,
    jsCode: `var leastInterval = function(tasks, n) {
    // Step 1: Count how many times each task type appears
    const freq = {};
    for (const t of tasks) {
        freq[t] = (freq[t] || 0) + 1;
    }

    // Step 2: Find the highest frequency among all task types
    const values = Object.values(freq);
    const maxFreq = Math.max(...values);

    // Step 3: Count how many task types share that maximum frequency
    // (they all appear in the last "frame" together)
    const maxCount = values.filter(v => v === maxFreq).length;

    // Step 4: The formula for minimum time:
    // (maxFreq - 1) frames of size (n+1), plus a final frame with maxCount tasks
    const formulaResult = (maxFreq - 1) * (n + 1) + maxCount;

    // If there are enough distinct tasks to fill all idle slots, no idle time is needed
    return Math.max(tasks.length, formulaResult);
};`,
    jsWalkthrough:
      'tasks = ["A","A","A","B","B","B"], n = 2\n\n' +
      'step 1: freq = {A:3, B:3}\n' +
      'step 2: values = [3,3]. maxFreq = 3\n' +
      'step 3: maxCount = 2 (both A and B have freq 3)\n' +
      'step 4: formulaResult = (3-1)*(2+1) + 2 = 2*3 + 2 = 8\n' +
      'step 5: max(tasks.length=6, 8) = 8\n' +
      'result: 8 (schedule: A→B→idle→A→B→idle→A→B)',
    explanation:
      '1. Count the frequency of each task.\n2. Find max_freq (the highest frequency) and max_count (how many tasks have this frequency).\n3. The minimum time is:\n   - (max_freq - 1) * (n + 1) + max_count: this accounts for max_freq - 1 full "cycles" of length n + 1, plus one final partial cycle with max_count tasks.\n   - max(len(tasks), ...): if there are many distinct tasks, we may not need any idle time.\n4. Return the maximum of the two.',
    timeComplexity: 'O(n) where n is the number of tasks',
    spaceComplexity: 'O(1) (at most 26 task types)',
    hints: [
      'The most frequent task dictates the minimum schedule length.',
      'Idle slots are filled by less frequent tasks.',
      'Formula: (max_freq - 1) * (n + 1) + count_of_max_freq_tasks.',
    ],
  },
  {
    id: 215,
    description:
      'Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest element in sorted order, not the kth distinct element.',
    examples:
      'Input: nums = [3,2,1,5,6,4], k = 2\nOutput: 5\n\nInput: nums = [3,2,3,1,2,4,5,5,6], k = 4\nOutput: 4',
    intuition:
      'A min-heap of size k acts as a "top k filter." As you process each number, add it to the heap. If the heap grows beyond k, remove the smallest. The smallest element remaining in the heap is always the kth largest overall, because k-1 larger elements sit above it in the heap.',
    approach:
      'Min-Heap of size k: Maintain a min-heap of the k largest elements seen so far. For each element, push it onto the heap, and if the heap exceeds size k, pop the smallest. The top of the heap is the kth largest.',
    code: `import heapq

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []

        for n in nums:
            heapq.heappush(heap, n)
            if len(heap) > k:
                heapq.heappop(heap)

        return heap[0]`,
    jsCode: `var findKthLargest = function(nums, k) {
    // We use a min-heap of size k.
    // Invariant: the heap always holds the k largest elements seen so far.
    // The smallest of those k elements (the heap root) is the kth largest.
    const heap = [];

    // Min-heap push: add val and bubble it up to its correct position
    const push = (val) => {
        heap.push(val);
        let i = heap.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (heap[parent] <= heap[i]) break; // parent is already smaller — heap property satisfied
            // Swap with parent to restore min-heap order
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        }
    };

    // Min-heap pop: remove and return the minimum, then sift down to restore order
    const pop = () => {
        const top = heap[0];
        const last = heap.pop();
        if (heap.length > 0) {
            heap[0] = last;
            let i = 0;
            while (true) {
                let smallest = i;
                const left  = 2 * i + 1;
                const right = 2 * i + 2;
                if (left  < heap.length && heap[left]  < heap[smallest]) smallest = left;
                if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
                if (smallest === i) break;
                [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
                i = smallest;
            }
        }
        return top;
    };

    for (const n of nums) {
        push(n);

        // Keep the heap at most size k — evict the smallest if we overflow
        if (heap.length > k) {
            pop();
        }
    }

    // The heap root is the smallest of the k largest elements = kth largest overall
    return heap[0];
};`,
    jsWalkthrough:
      'nums = [3,2,1,5,6,4], k = 2\n\n' +
      'step 1: push 3. heap=[3]\n' +
      'step 2: push 2. heap=[2,3]\n' +
      'step 3: push 1. heap=[1,3,2]. size=3>k=2 → pop min(1). heap=[2,3]\n' +
      'step 4: push 5. heap=[2,3,5]. size=3>k=2 → pop min(2). heap=[3,5]\n' +
      'step 5: push 6. heap=[3,5,6]. size=3>k=2 → pop min(3). heap=[5,6]\n' +
      'step 6: push 4. heap=[4,6,5]. size=3>k=2 → pop min(4). heap=[5,6]\n' +
      'result: heap[0] = 5 (the 2nd largest)',
    explanation:
      '1. Maintain a min-heap of size k.\n2. For each number n in nums:\n   - Push n onto the heap.\n   - If heap size exceeds k, pop the smallest element.\n3. After processing all numbers, the heap contains the k largest elements.\n4. The root (smallest in the heap) is the kth largest overall.\n5. Return heap[0].',
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(k)',
    hints: [
      'A min-heap of size k naturally maintains the k largest elements.',
      'The root of this min-heap is the kth largest.',
      'Alternatively, use Quickselect for O(n) average time.',
    ],
  },
  {
    id: 973,
    description:
      'Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer k, return the k closest points to the origin (0, 0).',
    examples:
      'Input: points = [[1,3],[-2,2]], k = 1\nOutput: [[-2,2]]\nExplanation: Distance of (1,3) is sqrt(10), distance of (-2,2) is sqrt(8). (-2,2) is closer.\n\nInput: points = [[3,3],[5,-1],[-2,4]], k = 2\nOutput: [[3,3],[-2,4]]',
    intuition:
      'This is the same pattern as Kth Largest Element, but inverted. Use a max-heap of size k (simulated by negating distances). As you process each point, if the heap is full and the new point is closer than the farthest in the heap, swap them. After processing all points, the heap holds the k closest. No need for square roots since squared distance preserves ordering.',
    approach:
      'Max-Heap of size k: Use a max-heap (negate distances) to maintain the k closest points. For each point, push it onto the heap. If the heap exceeds size k, pop the farthest point. No need to compute actual sqrt since we compare squared distances.',
    code: `import heapq

class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        heap = []

        for x, y in points:
            dist = -(x * x + y * y)
            heapq.heappush(heap, (dist, x, y))
            if len(heap) > k:
                heapq.heappop(heap)

        return [[x, y] for _, x, y in heap]`,
    jsCode: `var kClosest = function(points, k) {
    // We simulate a max-heap by storing NEGATED squared distances.
    // This way, the "smallest" item in our min-heap structure is actually
    // the FARTHEST point — so popping it keeps only the k closest.
    const heap = [];

    // --- Heap helper: push a new item and bubble it up ---
    const push = (val) => {
        heap.push(val);
        let i = heap.length - 1;

        while (i > 0) {
            const parent = (i - 1) >> 1; // integer division by 2

            // heap[*][0] is the negated distance; smaller value = farther point
            if (heap[parent][0] <= heap[i][0]) break; // parent is already "smaller" (farther), stop

            // Swap child and parent to restore heap order
            const temp = heap[parent];
            heap[parent] = heap[i];
            heap[i] = temp;

            i = parent; // move up
        }
    };

    // --- Heap helper: remove and return the top item (farthest point), then sift down ---
    const pop = () => {
        const top = heap[0]; // save the farthest point to return

        const last = heap.pop(); // remove the last element

        if (heap.length > 0) {
            heap[0] = last; // place last element at root

            let i = 0;
            while (true) {
                let smallest = i;
                const leftChild = 2 * i + 1;
                const rightChild = 2 * i + 2;

                // Check if left child is "smaller" (farther) than current smallest
                if (leftChild < heap.length && heap[leftChild][0] < heap[smallest][0]) {
                    smallest = leftChild;
                }

                // Check if right child is "smaller" (farther) than current smallest
                if (rightChild < heap.length && heap[rightChild][0] < heap[smallest][0]) {
                    smallest = rightChild;
                }

                if (smallest === i) break; // heap property restored, stop

                // Swap to move the smaller (farther) child up
                const temp = heap[smallest];
                heap[smallest] = heap[i];
                heap[i] = temp;

                i = smallest; // continue sifting down
            }
        }

        return top;
    };

    // Process each point: push it, then evict the farthest if heap exceeds size k
    for (const [x, y] of points) {
        const negatedDist = -(x * x + y * y); // negate so farthest point sits at heap root
        push([negatedDist, x, y]);

        if (heap.length > k) {
            pop(); // remove the farthest point, keeping only k closest
        }
    }

    // Extract just the [x, y] coordinates (discard the negated distance)
    return heap.map(([_negDist, x, y]) => [x, y]);
};`,
    jsWalkthrough:
      'points = [[1,3],[-2,2]], k = 1\n\n' +
      'step 1: process [1,3] → negatedDist = -(1+9) = -10\n' +
      '        push [-10, 1, 3]. heap = [[-10,1,3]]\n' +
      '        heap.length(1) <= k(1), no pop\n\n' +
      'step 2: process [-2,2] → negatedDist = -(4+4) = -8\n' +
      '        push [-8,-2,2]. heap = [[-10,1,3],[-8,-2,2]]\n' +
      '        bubble up: parent[-10] <= child[-8] → stop\n' +
      '        heap.length(2) > k(1) → pop\n' +
      '        pop returns [-10,1,3] (the "smallest" = most negative = farthest)\n' +
      '        heap = [[-8,-2,2]]\n\n' +
      'result: heap = [[-8,-2,2]] → extract coords → [[-2,2]]\n' +
      'correct: sqrt(8) < sqrt(10), so [-2,2] is the closest point',
    explanation:
      '1. Use a max-heap (negate squared distances since Python uses min-heaps) of size k.\n2. For each point (x, y):\n   - Compute dist = -(x^2 + y^2) (negated for max-heap behavior).\n   - Push (dist, x, y) onto the heap.\n   - If heap size exceeds k, pop the largest distance (which is the farthest point).\n3. After processing all points, the heap contains the k closest points.\n4. Return the coordinates from the heap.',
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(k)',
    hints: [
      'You do not need to compute the actual square root -- squared distance suffices for comparison.',
      'Use a max-heap of size k to maintain the k closest points.',
      'Negate distances for a max-heap using Python\'s min-heap.',
    ],
  },
];

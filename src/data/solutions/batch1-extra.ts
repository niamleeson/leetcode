import { ProblemSolution } from './types';

export const solutions: ProblemSolution[] = [
  // ---------------------------------------------------------------------------
  // 6. Zigzag Conversion
  // ---------------------------------------------------------------------------
  {
    id: 6,
    description:
      'The string "PAYPALISHIRING" is written in a zigzag pattern on a given number of rows. Write code that takes a string and number of rows and returns the string read line by line. For example, with 3 rows the zigzag looks like: P A H N / A P L S I I G / Y I R.',
    examples:
      'Input: s = "PAYPALISHIRING", numRows = 3\nOutput: "PAHNAPLSIIGYIR"',
    intuition:
      'Imagine writing a message on a zigzag fence - characters bounce between rows as you move along. The key insight is that you don\'t need to simulate the 2D grid; just track which row each character belongs to using a direction flag that flips at the top and bottom.',
    approach:
      'Simulate the zigzag by maintaining an array of strings for each row. Iterate through the string, appending each character to the current row, and change direction when you hit the top or bottom row. Concatenate all rows at the end.',
    code: `class Solution:
    def convert(self, s: str, numRows: int) -> str:
        if numRows == 1 or numRows >= len(s):
            return s
        rows = [''] * numRows
        cur_row = 0
        going_down = False
        for c in s:
            rows[cur_row] += c
            if cur_row == 0 or cur_row == numRows - 1:
                going_down = not going_down
            cur_row += 1 if going_down else -1
        return ''.join(rows)`,
    jsCode: `var convert = function(s, numRows) {
    if (numRows === 1 || numRows >= s.length) return s;
    const rows = Array(numRows).fill('');
    let curRow = 0;
    let goingDown = false;
    for (const c of s) {
        rows[curRow] += c;
        if (curRow === 0 || curRow === numRows - 1) goingDown = !goingDown;
        curRow += goingDown ? 1 : -1;
    }
    return rows.join('');
};`,
    explanation:
      '1. Handle edge cases where numRows is 1 or >= len(s).\n' +
      '2. Create an array of empty strings, one per row.\n' +
      '3. Track current row and direction (going_down).\n' +
      '4. Reverse direction when hitting row 0 or the last row.\n' +
      '5. Append each character to its corresponding row string.\n' +
      '6. Join all row strings to produce the final result.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Think about which row each character belongs to as you move up and down.',
      'You can simulate the zigzag by tracking a current row index and a direction flag.',
      'Reverse the direction whenever you reach the first or last row.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 7. Reverse Integer
  // ---------------------------------------------------------------------------
  {
    id: 7,
    description:
      'Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0. Assume the environment does not allow you to store 64-bit integers.',
    examples:
      'Input: x = 123\nOutput: 321',
    intuition:
      'Think of pulling digits off the end of a number like popping beads off a string and stacking them in reverse order. The tricky part is not the reversal itself but checking for overflow before it happens - you must verify before multiplying, not after.',
    approach:
      'Extract digits one by one from the end using modulo and division. Build the reversed number by multiplying by 10 and adding the extracted digit. Check for overflow before each multiplication.',
    code: `class Solution:
    def reverse(self, x: int) -> int:
        INT_MAX, INT_MIN = 2**31 - 1, -(2**31)
        res = 0
        sign = 1 if x >= 0 else -1
        x = abs(x)
        while x:
            digit = x % 10
            x //= 10
            if res > (INT_MAX - digit) // 10:
                return 0
            res = res * 10 + digit
        return res * sign`,
    jsCode: `var reverse = function(x) {
    const INT_MAX = 2147483647;
    const INT_MIN = -2147483648;
    let res = 0;
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    while (x > 0) {
        const digit = x % 10;
        x = Math.floor(x / 10);
        if (res > Math.floor((INT_MAX - digit) / 10)) return 0;
        res = res * 10 + digit;
    }
    return res * sign;
};`,
    explanation:
      '1. Record the sign and work with the absolute value.\n' +
      '2. Extract the last digit with x % 10, remove it with x //= 10.\n' +
      '3. Before updating res, check if res * 10 + digit would overflow 32-bit range.\n' +
      '4. Build the reversed number digit by digit.\n' +
      '5. Restore the original sign and return.',
    timeComplexity: 'O(log x)',
    spaceComplexity: 'O(1)',
    hints: [
      'How do you extract the last digit of a number?',
      'Build the result by multiplying by 10 each time you add a digit.',
      'Check for overflow before the multiplication step, not after.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 8. String to Integer (atoi)
  // ---------------------------------------------------------------------------
  {
    id: 8,
    description:
      'Implement the myAtoi(string s) function, which converts a string to a 32-bit signed integer. The algorithm strips leading whitespace, reads an optional sign, then reads digits until a non-digit character or end of string. Clamp the result to the 32-bit signed integer range [-2^31, 2^31 - 1].',
    examples:
      'Input: s = "   -42"\nOutput: -42',
    intuition:
      'This is a state machine problem in disguise. You\'re walking through a string handling whitespace, an optional sign, and digits in order. The key insight is to process one phase at a time and clamp the result to 32-bit bounds as you go.',
    approach:
      'Process the string character by character: skip whitespace, handle the optional sign, then accumulate digits. Clamp the result to the 32-bit signed integer range if it overflows.',
    code: `class Solution:
    def myAtoi(self, s: str) -> int:
        INT_MAX, INT_MIN = 2**31 - 1, -(2**31)
        i, n = 0, len(s)
        while i < n and s[i] == ' ':
            i += 1
        sign = 1
        if i < n and s[i] in ('+', '-'):
            sign = -1 if s[i] == '-' else 1
            i += 1
        res = 0
        while i < n and s[i].isdigit():
            res = res * 10 + int(s[i])
            i += 1
        res *= sign
        return max(INT_MIN, min(INT_MAX, res))`,
    jsCode: `var myAtoi = function(s) {
    const INT_MAX = 2147483647;
    const INT_MIN = -2147483648;
    let i = 0;
    const n = s.length;
    while (i < n && s[i] === ' ') i++;
    let sign = 1;
    if (i < n && (s[i] === '+' || s[i] === '-')) {
        sign = s[i] === '-' ? -1 : 1;
        i++;
    }
    let res = 0;
    while (i < n && s[i] >= '0' && s[i] <= '9') {
        res = res * 10 + Number(s[i]);
        i++;
    }
    res *= sign;
    return Math.max(INT_MIN, Math.min(INT_MAX, res));
};`,
    explanation:
      '1. Skip leading whitespace by advancing the index.\n' +
      '2. Check for an optional + or - sign and record it.\n' +
      '3. Read consecutive digit characters and build the integer.\n' +
      '4. Stop at the first non-digit character.\n' +
      '5. Clamp the result to [INT_MIN, INT_MAX] before returning.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Handle the three phases in order: whitespace, sign, digits.',
      'Stop reading digits at the first non-digit character.',
      'Remember to clamp the result to the 32-bit signed integer range.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 9. Palindrome Number
  // ---------------------------------------------------------------------------
  {
    id: 9,
    description:
      'Given an integer x, return true if x is a palindrome, and false otherwise. A palindrome reads the same forward and backward. Negative numbers are not palindromes.',
    examples:
      'Input: x = 121\nOutput: true',
    intuition:
      'Instead of converting to a string (which uses extra space), you can reverse just the second half of the number and compare it to the first half. If the number reads the same forwards and backwards, the reversed second half will equal the first half.',
    approach:
      'Reverse the second half of the number and compare it with the first half. This avoids converting to a string and handles overflow naturally by only reversing half the digits.',
    code: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0 or (x % 10 == 0 and x != 0):
            return False
        reversed_half = 0
        while x > reversed_half:
            reversed_half = reversed_half * 10 + x % 10
            x //= 10
        return x == reversed_half or x == reversed_half // 10`,
    jsCode: `var isPalindrome = function(x) {
    if (x < 0 || (x % 10 === 0 && x !== 0)) return false;
    let reversedHalf = 0;
    while (x > reversedHalf) {
        reversedHalf = reversedHalf * 10 + x % 10;
        x = Math.floor(x / 10);
    }
    return x === reversedHalf || x === Math.floor(reversedHalf / 10);
};`,
    explanation:
      '1. Negative numbers and numbers ending in 0 (except 0 itself) are not palindromes.\n' +
      '2. Reverse the second half of the digits by extracting from x and building reversed_half.\n' +
      '3. Stop when reversed_half >= x (we have processed half or more digits).\n' +
      '4. For even-length numbers, x == reversed_half.\n' +
      '5. For odd-length numbers, x == reversed_half // 10 (the middle digit is in reversed_half).',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Can you solve this without converting the integer to a string?',
      'What if you only reversed half of the number?',
      'Compare the first half of the number with the reversed second half.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 10. Regular Expression Matching
  // ---------------------------------------------------------------------------
  {
    id: 10,
    description:
      "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'. '.' matches any single character, and '*' matches zero or more of the preceding element. The matching should cover the entire input string.",
    examples:
      'Input: s = "aa", p = "a*"\nOutput: true',
    intuition:
      'The wildcard \'*\' doesn\'t stand alone - it modifies the character before it to mean \'zero or more.\' Build a DP table where each cell asks: does this prefix of the string match this prefix of the pattern? The star gives you two choices: skip the pattern pair entirely (zero occurrences) or consume one matching character and stay on the same pattern.',
    approach:
      "Use dynamic programming where dp[i][j] represents whether s[0..i-1] matches p[0..j-1]. Handle '*' by considering zero occurrences (dp[i][j-2]) or one+ occurrences if the current character matches.",
    code: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                dp[0][j] = dp[0][j - 2]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if p[j - 1] == '*':
                    dp[i][j] = dp[i][j - 2]
                    if p[j - 2] == '.' or p[j - 2] == s[i - 1]:
                        dp[i][j] = dp[i][j] or dp[i - 1][j]
                elif p[j - 1] == '.' or p[j - 1] == s[i - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
        return dp[m][n]`,
    jsCode: `var isMatch = function(s, p) {
    const m = s.length, n = p.length;
    const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(false));
    dp[0][0] = true;
    for (let j = 1; j <= n; j++) {
        if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2];
    }
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (p[j - 1] === '*') {
                dp[i][j] = dp[i][j - 2];
                if (p[j - 2] === '.' || p[j - 2] === s[i - 1]) {
                    dp[i][j] = dp[i][j] || dp[i - 1][j];
                }
            } else if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }
    return dp[m][n];
};`,
    explanation:
      '1. dp[i][j] = whether s[:i] matches p[:j].\n' +
      '2. Base case: dp[0][0] = True; patterns like "a*b*" can match empty string.\n' +
      '3. For \'*\': zero occurrences uses dp[i][j-2]; one or more uses dp[i-1][j] if chars match.\n' +
      '4. For \'.\' or exact character match: dp[i][j] = dp[i-1][j-1].\n' +
      '5. Answer is dp[m][n].',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      "Think about how '*' can represent zero or more of the preceding element.",
      'Use a 2D DP table where dp[i][j] means s[:i] matches p[:j].',
      "For '*', consider two cases: skip the pattern pair (zero matches) or consume one character from s.",
    ],
  },

  // ---------------------------------------------------------------------------
  // 12. Integer to Roman
  // ---------------------------------------------------------------------------
  {
    id: 12,
    description:
      'Given an integer, convert it to a Roman numeral. Roman numerals use symbols I, V, X, L, C, D, M with special subtractive forms like IV (4), IX (9), XL (40), XC (90), CD (400), CM (900).',
    examples:
      'Input: num = 1994\nOutput: "MCMXCIV"',
    intuition:
      'Think of making change with Roman numeral \'coins.\' Start with the largest denomination and greedily use as many as possible before moving to the next smaller one. The six subtractive forms (like IV, IX) are just additional denominations in your lookup table.',
    approach:
      'Use a greedy approach with a lookup table of values and their Roman representations in descending order. Repeatedly subtract the largest possible value and append the corresponding symbol.',
    code: `class Solution:
    def intToRoman(self, num: int) -> str:
        val_sym = [
            (1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'),
            (100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'),
            (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')
        ]
        res = []
        for val, sym in val_sym:
            while num >= val:
                res.append(sym)
                num -= val
        return ''.join(res)`,
    jsCode: `var intToRoman = function(num) {
    const valSym = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    const res = [];
    for (const [val, sym] of valSym) {
        while (num >= val) {
            res.push(sym);
            num -= val;
        }
    }
    return res.join('');
};`,
    explanation:
      '1. Define a table of (value, symbol) pairs in descending order, including subtractive forms.\n' +
      '2. For each pair, while num >= value, append the symbol and subtract the value.\n' +
      '3. The greedy approach works because Roman numeral values are structured for it.\n' +
      '4. Concatenate all collected symbols to form the result.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    hints: [
      'Roman numerals have a greedy structure: always use the largest symbol that fits.',
      'Include subtractive forms like IV, IX, XL, XC, CD, CM in your lookup table.',
      'Iterate through the table from largest to smallest, subtracting and appending.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 13. Roman to Integer
  // ---------------------------------------------------------------------------
  {
    id: 13,
    description:
      'Given a Roman numeral string, convert it to an integer. Roman numerals use I=1, V=5, X=10, L=50, C=100, D=500, M=1000. When a smaller value appears before a larger value, it is subtracted (e.g., IV = 4).',
    examples:
      'Input: s = "MCMXCIV"\nOutput: 1994',
    intuition:
      'The trick is that Roman numerals are additive except when a smaller value precedes a larger one (like IV = 4). Scan left to right: if the current symbol is smaller than the next one, subtract it; otherwise add it. This single rule handles all cases.',
    approach:
      'Traverse the string from left to right. If the current value is less than the next value, subtract it; otherwise add it. This handles all subtractive cases naturally.',
    code: `class Solution:
    def romanToInt(self, s: str) -> int:
        roman = {'I': 1, 'V': 5, 'X': 10, 'L': 50,
                 'C': 100, 'D': 500, 'M': 1000}
        res = 0
        for i in range(len(s)):
            if i + 1 < len(s) and roman[s[i]] < roman[s[i + 1]]:
                res -= roman[s[i]]
            else:
                res += roman[s[i]]
        return res`,
    jsCode: `var romanToInt = function(s) {
    const roman = {'I': 1, 'V': 5, 'X': 10, 'L': 50,
                   'C': 100, 'D': 500, 'M': 1000};
    let res = 0;
    for (let i = 0; i < s.length; i++) {
        if (i + 1 < s.length && roman[s[i]] < roman[s[i + 1]]) {
            res -= roman[s[i]];
        } else {
            res += roman[s[i]];
        }
    }
    return res;
};`,
    explanation:
      '1. Map each Roman character to its integer value.\n' +
      '2. Iterate through the string, comparing each character with the next.\n' +
      '3. If current < next, subtract current (subtractive case like IV).\n' +
      '4. Otherwise, add current.\n' +
      '5. The last character is always added.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'When is a Roman numeral subtracted instead of added?',
      'A smaller value before a larger value means subtraction.',
      'Process left to right: subtract if current < next, else add.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 14. Longest Common Prefix
  // ---------------------------------------------------------------------------
  {
    id: 14,
    description:
      'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string.',
    examples:
      'Input: strs = ["flower","flow","flight"]\nOutput: "fl"',
    intuition:
      'Imagine stacking all the strings on top of each other and reading down each column. The common prefix is the longest column where every string has the same character. Stop as soon as you find a mismatch or reach the end of any string.',
    approach:
      'Compare characters column by column across all strings. Start with the first character position and check if all strings share the same character at that position. Stop when a mismatch is found or a string ends.',
    code: `class Solution:
    def longestCommonPrefix(self, strs: list[str]) -> str:
        if not strs:
            return ""
        for i in range(len(strs[0])):
            c = strs[0][i]
            for s in strs[1:]:
                if i >= len(s) or s[i] != c:
                    return strs[0][:i]
        return strs[0]`,
    jsCode: `var longestCommonPrefix = function(strs) {
    if (!strs.length) return "";
    for (let i = 0; i < strs[0].length; i++) {
        const c = strs[0][i];
        for (let j = 1; j < strs.length; j++) {
            if (i >= strs[j].length || strs[j][i] !== c) {
                return strs[0].substring(0, i);
            }
        }
    }
    return strs[0];
};`,
    explanation:
      '1. Use the first string as a reference.\n' +
      '2. For each character position i, check if all other strings have the same character.\n' +
      '3. If any string is too short or has a different character, return the prefix so far.\n' +
      '4. If the loop completes, the entire first string is the common prefix.',
    timeComplexity: 'O(S) where S is the sum of all characters',
    spaceComplexity: 'O(1)',
    hints: [
      'Compare character by character across all strings simultaneously.',
      'Stop as soon as you find a mismatch at any position.',
      'The common prefix cannot be longer than the shortest string.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 16. 3Sum Closest
  // ---------------------------------------------------------------------------
  {
    id: 16,
    description:
      'Given an integer array nums of length n and an integer target, find three integers in nums such that the sum is closest to target. Return the sum of the three integers. You may assume that each input would have exactly one solution.',
    examples:
      'Input: nums = [-1,2,1,-4], target = 1\nOutput: 2\nExplanation: The sum that is closest to the target is 2 (-1 + 2 + 1 = 2).',
    intuition:
      'This extends the two-pointer technique from 3Sum. After sorting, fix one number and use two pointers to find the pair that gets closest to the remaining target. Sorting enables the pointers to intelligently move toward the target rather than checking every combination.',
    approach:
      'Sort the array, then for each element use two pointers on the remaining elements. Track the closest sum seen so far. Move pointers based on whether the current sum is less than or greater than the target.',
    code: `class Solution:
    def threeSumClosest(self, nums: list[int], target: int) -> int:
        nums.sort()
        closest = float('inf')
        for i in range(len(nums) - 2):
            lo, hi = i + 1, len(nums) - 1
            while lo < hi:
                s = nums[i] + nums[lo] + nums[hi]
                if abs(s - target) < abs(closest - target):
                    closest = s
                if s < target:
                    lo += 1
                elif s > target:
                    hi -= 1
                else:
                    return s
        return closest`,
    jsCode: `var threeSumClosest = function(nums, target) {
    nums.sort((a, b) => a - b);
    let closest = Infinity;
    for (let i = 0; i < nums.length - 2; i++) {
        let lo = i + 1, hi = nums.length - 1;
        while (lo < hi) {
            const s = nums[i] + nums[lo] + nums[hi];
            if (Math.abs(s - target) < Math.abs(closest - target)) closest = s;
            if (s < target) lo++;
            else if (s > target) hi--;
            else return s;
        }
    }
    return closest;
};`,
    explanation:
      '1. Sort the array to enable the two-pointer technique.\n' +
      '2. Fix one element and use two pointers for the other two.\n' +
      '3. Track the sum closest to target by comparing absolute differences.\n' +
      '4. Move left pointer right if sum < target, right pointer left if sum > target.\n' +
      '5. If sum == target exactly, return immediately.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sorting the array enables a two-pointer approach.',
      'For each fixed element, use two pointers to find the best pair.',
      'Track the closest sum and update whenever you find a closer one.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 18. 4Sum
  // ---------------------------------------------------------------------------
  {
    id: 18,
    description:
      'Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that a, b, c, d are distinct indices and nums[a] + nums[b] + nums[c] + nums[d] == target.',
    examples:
      'Input: nums = [1,0,-1,0,-2,2], target = 0\nOutput: [[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]',
    intuition:
      'This is 3Sum with an extra layer. Fix two numbers with nested loops, then use two pointers for the remaining pair. Sorting the array first lets you skip duplicates at every level and use the two-pointer trick to avoid brute force.',
    approach:
      'Sort the array, then use two nested loops to fix the first two elements and a two-pointer approach for the remaining two. Skip duplicates at each level to avoid duplicate quadruplets.',
    code: `class Solution:
    def fourSum(self, nums: list[int], target: int) -> list[list[int]]:
        nums.sort()
        res = []
        n = len(nums)
        for i in range(n - 3):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            for j in range(i + 1, n - 2):
                if j > i + 1 and nums[j] == nums[j - 1]:
                    continue
                lo, hi = j + 1, n - 1
                while lo < hi:
                    s = nums[i] + nums[j] + nums[lo] + nums[hi]
                    if s < target:
                        lo += 1
                    elif s > target:
                        hi -= 1
                    else:
                        res.append([nums[i], nums[j], nums[lo], nums[hi]])
                        while lo < hi and nums[lo] == nums[lo + 1]:
                            lo += 1
                        while lo < hi and nums[hi] == nums[hi - 1]:
                            hi -= 1
                        lo += 1
                        hi -= 1
        return res`,
    jsCode: `var fourSum = function(nums, target) {
    nums.sort((a, b) => a - b);
    const res = [];
    const n = nums.length;
    for (let i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        for (let j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] === nums[j - 1]) continue;
            let lo = j + 1, hi = n - 1;
            while (lo < hi) {
                const s = nums[i] + nums[j] + nums[lo] + nums[hi];
                if (s < target) lo++;
                else if (s > target) hi--;
                else {
                    res.push([nums[i], nums[j], nums[lo], nums[hi]]);
                    while (lo < hi && nums[lo] === nums[lo + 1]) lo++;
                    while (lo < hi && nums[hi] === nums[hi - 1]) hi--;
                    lo++;
                    hi--;
                }
            }
        }
    }
    return res;
};`,
    explanation:
      '1. Sort the array to enable two-pointer technique and duplicate skipping.\n' +
      '2. Fix the first element with index i, skip duplicates.\n' +
      '3. Fix the second element with index j, skip duplicates.\n' +
      '4. Use two pointers lo and hi for the remaining two elements.\n' +
      '5. When a quadruplet is found, skip duplicate values for lo and hi.',
    timeComplexity: 'O(n^3)',
    spaceComplexity: 'O(1) excluding output',
    hints: [
      'This extends the 3Sum pattern by adding one more outer loop.',
      'Sort first, then use two nested loops plus two pointers.',
      'Skip duplicates at every level to avoid repeated quadruplets.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 24. Swap Nodes in Pairs
  // ---------------------------------------------------------------------------
  {
    id: 24,
    description:
      'Given a linked list, swap every two adjacent nodes and return its head. You must solve the problem without modifying the values in the nodes (i.e., only nodes themselves may be changed).',
    examples:
      'Input: head = [1,2,3,4]\nOutput: [2,1,4,3]',
    intuition:
      'Think of swapping pairs like switching dance partners. For each pair, you rewire three pointers: the previous node points to the second, the first points to whatever comes after the pair, and the second points back to the first. A dummy node before the head simplifies the first swap.',
    approach:
      'Use a dummy node before the head. For each pair, rewire the pointers: prev.next points to second, first.next points to second.next, and second.next points to first. Advance by two nodes.',
    code: `class Solution:
    def swapPairs(self, head):
        dummy = ListNode(0)
        dummy.next = head
        prev = dummy
        while prev.next and prev.next.next:
            first = prev.next
            second = prev.next.next
            prev.next = second
            first.next = second.next
            second.next = first
            prev = first
        return dummy.next`,
    jsCode: `var swapPairs = function(head) {
    const dummy = new ListNode(0);
    dummy.next = head;
    let prev = dummy;
    while (prev.next && prev.next.next) {
        const first = prev.next;
        const second = prev.next.next;
        prev.next = second;
        first.next = second.next;
        second.next = first;
        prev = first;
    }
    return dummy.next;
};`,
    explanation:
      '1. Create a dummy node pointing to head to simplify edge cases.\n' +
      '2. For each pair (first, second): rewire prev -> second -> first -> rest.\n' +
      '3. prev.next = second, first.next = second.next, second.next = first.\n' +
      '4. Move prev to first (which is now the second node in the swapped pair).\n' +
      '5. Return dummy.next as the new head.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'A dummy node before the head simplifies pointer manipulation.',
      'For each pair, you need to adjust three pointers.',
      'After swapping, the first node becomes the tail of the pair - advance prev there.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 27. Remove Element
  // ---------------------------------------------------------------------------
  {
    id: 27,
    description:
      'Given an integer array nums and an integer val, remove all occurrences of val in-place. The order of the elements may be changed. Return k, the number of elements in nums which are not equal to val. The first k elements of nums should contain the elements which are not equal to val.',
    examples:
      'Input: nums = [3,2,2,3], val = 3\nOutput: 2, nums = [2,2,_,_]',
    intuition:
      'Use a \'write pointer\' that only advances when you find a keeper. As you scan through the array, every element that isn\'t the target value gets written to the write position. The write pointer naturally ends up at the new length.',
    approach:
      'Use a write pointer k that tracks the position for the next non-val element. Iterate through the array, and whenever the current element is not val, write it at position k and increment k.',
    code: `class Solution:
    def removeElement(self, nums: list[int], val: int) -> int:
        k = 0
        for num in nums:
            if num != val:
                nums[k] = num
                k += 1
        return k`,
    jsCode: `var removeElement = function(nums, val) {
    let k = 0;
    for (const num of nums) {
        if (num !== val) {
            nums[k] = num;
            k++;
        }
    }
    return k;
};`,
    explanation:
      '1. Initialize write pointer k = 0.\n' +
      '2. Iterate through each element in nums.\n' +
      '3. If element != val, copy it to nums[k] and increment k.\n' +
      '4. After the loop, nums[0..k-1] contains all non-val elements.\n' +
      '5. Return k as the count of remaining elements.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Use two pointers: one for reading and one for writing.',
      'Only write elements that are not equal to val.',
      'The write pointer tells you how many valid elements remain.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 28. Find the Index of the First Occurrence in a String
  // ---------------------------------------------------------------------------
  {
    id: 28,
    description:
      'Given two strings haystack and needle, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.',
    examples:
      'Input: haystack = "sadbutsad", needle = "sad"\nOutput: 0',
    intuition:
      'This is the classic substring search problem. The simplest approach slides a window of the needle\'s length across the haystack and checks for a match at each position. For interviews, this O(n*m) approach is usually sufficient.',
    approach:
      'Slide a window of size len(needle) across haystack and compare substrings. Return the starting index of the first match. For a more optimal approach, use the KMP algorithm.',
    code: `class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        m, n = len(haystack), len(needle)
        for i in range(m - n + 1):
            if haystack[i:i + n] == needle:
                return i
        return -1`,
    jsCode: `var strStr = function(haystack, needle) {
    const m = haystack.length, n = needle.length;
    for (let i = 0; i <= m - n; i++) {
        if (haystack.substring(i, i + n) === needle) return i;
    }
    return -1;
};`,
    explanation:
      '1. If needle is empty, return 0.\n' +
      '2. Iterate i from 0 to len(haystack) - len(needle).\n' +
      '3. At each position, compare the substring of length len(needle) with needle.\n' +
      '4. Return i at the first match.\n' +
      '5. If no match is found, return -1.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Try checking every possible starting position in haystack.',
      'The last valid starting position is len(haystack) - len(needle).',
      'For each position, compare the substring of appropriate length.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 29. Divide Two Integers
  // ---------------------------------------------------------------------------
  {
    id: 29,
    description:
      'Given two integers dividend and divisor, divide two integers without using multiplication, division, and mod operator. Return the quotient after dividing dividend by divisor, truncated toward zero. If the quotient overflows 32-bit signed integer, return 2^31 - 1.',
    examples:
      'Input: dividend = 10, divisor = 3\nOutput: 3',
    intuition:
      'You can\'t use multiplication or division, but you can use bit shifting (which doubles/halves). The key insight is exponential search: keep doubling the divisor until it\'s too big, subtract the largest fit, and repeat. This is like making change with powers-of-two denominations.',
    approach:
      'Use bit shifting to perform exponential search. Repeatedly double the divisor (shift left) to find the largest multiple that fits, subtract it, and accumulate the quotient. Handle sign and overflow edge cases.',
    code: `class Solution:
    def divide(self, dividend: int, divisor: int) -> int:
        INT_MAX, INT_MIN = 2**31 - 1, -(2**31)
        if dividend == INT_MIN and divisor == -1:
            return INT_MAX
        sign = -1 if (dividend < 0) ^ (divisor < 0) else 1
        a, b = abs(dividend), abs(divisor)
        res = 0
        while a >= b:
            temp, multiple = b, 1
            while a >= (temp << 1):
                temp <<= 1
                multiple <<= 1
            a -= temp
            res += multiple
        return res * sign`,
    jsCode: `var divide = function(dividend, divisor) {
    const INT_MAX = 2147483647, INT_MIN = -2147483648;
    if (dividend === INT_MIN && divisor === -1) return INT_MAX;
    const sign = (dividend < 0) ^ (divisor < 0) ? -1 : 1;
    let a = Math.abs(dividend), b = Math.abs(divisor);
    let res = 0;
    while (a >= b) {
        let temp = b, multiple = 1;
        while (a >= temp * 2) {
            temp *= 2;
            multiple *= 2;
        }
        a -= temp;
        res += multiple;
    }
    return res * sign;
};`,
    explanation:
      '1. Handle the overflow edge case: INT_MIN / -1 would exceed INT_MAX.\n' +
      '2. Determine the sign of the result using XOR of signs.\n' +
      '3. Work with absolute values.\n' +
      '4. Double the divisor using left shift until it exceeds the remaining dividend.\n' +
      '5. Subtract the largest fitting multiple and accumulate the quotient.',
    timeComplexity: 'O(log^2 n)',
    spaceComplexity: 'O(1)',
    hints: [
      'You cannot use *, /, or %. What operations are left? Addition, subtraction, and bit shifts.',
      'Repeatedly subtracting the divisor is too slow. Can you subtract larger chunks?',
      'Double the divisor using bit shifts to find the largest power-of-2 multiple that fits.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 30. Substring with Concatenation of All Words
  // ---------------------------------------------------------------------------
  {
    id: 30,
    description:
      'You are given a string s and an array of strings words of the same length. Return all starting indices of substrings in s that are a concatenation of each word in words exactly once, in any order, without any intervening characters.',
    examples:
      'Input: s = "barfoothefoobarman", words = ["foo","bar"]\nOutput: [0,9]',
    intuition:
      'Think of the string as a grid of word-sized slots. For each possible starting offset (0 to word_length-1), use a sliding window that tracks how many of each word you\'ve seen. When your window contains exactly the right word counts, record the position.',
    approach:
      'Use a sliding window of size len(words) * len(words[0]). For each possible starting offset (0 to word_len-1), slide a window that tracks word counts. Compare with the required word frequency map.',
    code: `class Solution:
    def findSubstring(self, s: str, words: list[str]) -> list[int]:
        from collections import Counter
        if not s or not words:
            return []
        word_len = len(words[0])
        num_words = len(words)
        total_len = word_len * num_words
        word_count = Counter(words)
        res = []
        for i in range(word_len):
            left = i
            cur_count = Counter()
            count = 0
            for j in range(i, len(s) - word_len + 1, word_len):
                word = s[j:j + word_len]
                if word in word_count:
                    cur_count[word] += 1
                    count += 1
                    while cur_count[word] > word_count[word]:
                        left_word = s[left:left + word_len]
                        cur_count[left_word] -= 1
                        count -= 1
                        left += word_len
                    if count == num_words:
                        res.append(left)
                else:
                    cur_count.clear()
                    count = 0
                    left = j + word_len
        return res`,
    jsCode: `var findSubstring = function(s, words) {
    if (!s || !words.length) return [];
    const wordLen = words[0].length;
    const numWords = words.length;
    const wordCount = {};
    for (const w of words) wordCount[w] = (wordCount[w] || 0) + 1;
    const res = [];
    for (let i = 0; i < wordLen; i++) {
        let left = i;
        const curCount = {};
        let count = 0;
        for (let j = i; j <= s.length - wordLen; j += wordLen) {
            const word = s.substring(j, j + wordLen);
            if (word in wordCount) {
                curCount[word] = (curCount[word] || 0) + 1;
                count++;
                while (curCount[word] > wordCount[word]) {
                    const leftWord = s.substring(left, left + wordLen);
                    curCount[leftWord]--;
                    count--;
                    left += wordLen;
                }
                if (count === numWords) res.push(left);
            } else {
                for (const key in curCount) delete curCount[key];
                count = 0;
                left = j + wordLen;
            }
        }
    }
    return res;
};`,
    explanation:
      '1. All words have the same length, so the concatenation has a fixed total length.\n' +
      '2. For each starting offset (0 to word_len-1), process words in steps of word_len.\n' +
      '3. Maintain a sliding window with a counter of words seen.\n' +
      '4. Shrink the window from the left when a word count exceeds required.\n' +
      '5. When window contains exactly num_words valid words, record the starting index.',
    timeComplexity: 'O(n * word_len)',
    spaceComplexity: 'O(num_words)',
    hints: [
      'All words have the same length, which simplifies the problem.',
      'Use a sliding window that moves in steps of word_len.',
      'Track word frequencies in the current window and compare with the target.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 31. Next Permutation
  // ---------------------------------------------------------------------------
  {
    id: 31,
    description:
      'A permutation of an array of integers is an arrangement of its members into a sequence. The next permutation is the next lexicographically greater permutation. If no such arrangement exists, rearrange to the lowest possible order (ascending). Modify the array in-place.',
    examples:
      'Input: nums = [1,2,3]\nOutput: [1,3,2]',
    intuition:
      'The next permutation is found by making the smallest possible increase. Find the rightmost place where digits are still ascending (the \'pivot\'), swap it with the smallest larger digit to its right, then sort the remaining suffix to be as small as possible (reverse it, since it was descending).',
    approach:
      'Find the largest index i such that nums[i] < nums[i+1] (the pivot). Find the largest index j > i such that nums[j] > nums[i]. Swap nums[i] and nums[j], then reverse the suffix after i.',
    code: `class Solution:
    def nextPermutation(self, nums: list[int]) -> None:
        n = len(nums)
        i = n - 2
        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1
        if i >= 0:
            j = n - 1
            while nums[j] <= nums[i]:
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]
        left, right = i + 1, n - 1
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1`,
    jsCode: `var nextPermutation = function(nums) {
    const n = nums.length;
    let i = n - 2;
    while (i >= 0 && nums[i] >= nums[i + 1]) i--;
    if (i >= 0) {
        let j = n - 1;
        while (nums[j] <= nums[i]) j--;
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    let left = i + 1, right = n - 1;
    while (left < right) {
        [nums[left], nums[right]] = [nums[right], nums[left]];
        left++;
        right--;
    }
};`,
    explanation:
      '1. Scan from right to find the first decreasing element (pivot) at index i.\n' +
      '2. If no pivot exists (fully descending), the entire array is reversed.\n' +
      '3. Find the smallest element larger than the pivot from the right side.\n' +
      '4. Swap the pivot with that element.\n' +
      '5. Reverse the suffix after the pivot position to get the smallest next permutation.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The suffix after the pivot is in descending order.',
      'Find the rightmost element that is smaller than its neighbor to the right.',
      'After swapping the pivot, reverse the suffix to make it ascending.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 35. Search Insert Position
  // ---------------------------------------------------------------------------
  {
    id: 35,
    description:
      'Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be inserted in order. You must write an algorithm with O(log n) runtime complexity.',
    examples:
      'Input: nums = [1,3,5,6], target = 5\nOutput: 2',
    intuition:
      'Binary search naturally finds the insertion point. When the search ends without finding the target, the left pointer sits exactly where the target should be inserted to maintain sorted order. This is the foundation of many binary search applications.',
    approach:
      'Use binary search to find the target or the insertion point. The left pointer after binary search gives the correct insertion index.',
    code: `class Solution:
    def searchInsert(self, nums: list[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return lo`,
    jsCode: `var searchInsert = function(nums, target) {
    let lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (nums[mid] === target) return mid;
        else if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return lo;
};`,
    explanation:
      '1. Standard binary search on the sorted array.\n' +
      '2. If nums[mid] == target, return mid.\n' +
      '3. If nums[mid] < target, search right half (lo = mid + 1).\n' +
      '4. If nums[mid] > target, search left half (hi = mid - 1).\n' +
      '5. When loop ends, lo is the correct insertion position.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'This is a standard binary search problem.',
      'When the target is not found, where does the left pointer end up?',
      'The left pointer points to the first element >= target after the search.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 37. Sudoku Solver
  // ---------------------------------------------------------------------------
  {
    id: 37,
    description:
      "Write a program to solve a Sudoku puzzle by filling the empty cells. A sudoku solution must satisfy all of the following rules: each of the digits 1-9 must occur exactly once in each row, each column, and each of the 9 3x3 sub-boxes. The character '.' indicates empty cells.",
    examples:
      'Input: board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]\nOutput: (the solved board)',
    intuition:
      'Sudoku solving is a classic constraint satisfaction problem. Try each valid digit in each empty cell and backtrack when you hit a dead end. The key optimization is tracking constraints with sets for rows, columns, and boxes, giving O(1) validity checks.',
    approach:
      'Use backtracking with constraint propagation. Track used digits in rows, columns, and boxes using sets. Try each digit 1-9 for empty cells, backtrack if no valid digit exists.',
    code: `class Solution:
    def solveSudoku(self, board: list[list[str]]) -> None:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]
        empty = []
        for i in range(9):
            for j in range(9):
                if board[i][j] == '.':
                    empty.append((i, j))
                else:
                    d = board[i][j]
                    rows[i].add(d)
                    cols[j].add(d)
                    boxes[(i // 3) * 3 + j // 3].add(d)

        def backtrack(idx):
            if idx == len(empty):
                return True
            r, c = empty[idx]
            box_id = (r // 3) * 3 + c // 3
            for d in '123456789':
                if d not in rows[r] and d not in cols[c] and d not in boxes[box_id]:
                    board[r][c] = d
                    rows[r].add(d)
                    cols[c].add(d)
                    boxes[box_id].add(d)
                    if backtrack(idx + 1):
                        return True
                    board[r][c] = '.'
                    rows[r].remove(d)
                    cols[c].remove(d)
                    boxes[box_id].remove(d)
            return False

        backtrack(0)`,
    jsCode: `var solveSudoku = function(board) {
    const rows = Array.from({length: 9}, () => new Set());
    const cols = Array.from({length: 9}, () => new Set());
    const boxes = Array.from({length: 9}, () => new Set());
    const empty = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === '.') {
                empty.push([i, j]);
            } else {
                const d = board[i][j];
                rows[i].add(d);
                cols[j].add(d);
                boxes[Math.floor(i / 3) * 3 + Math.floor(j / 3)].add(d);
            }
        }
    }
    function backtrack(idx) {
        if (idx === empty.length) return true;
        const [r, c] = empty[idx];
        const boxId = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        for (let d = 1; d <= 9; d++) {
            const ds = String(d);
            if (!rows[r].has(ds) && !cols[c].has(ds) && !boxes[boxId].has(ds)) {
                board[r][c] = ds;
                rows[r].add(ds);
                cols[c].add(ds);
                boxes[boxId].add(ds);
                if (backtrack(idx + 1)) return true;
                board[r][c] = '.';
                rows[r].delete(ds);
                cols[c].delete(ds);
                boxes[boxId].delete(ds);
            }
        }
        return false;
    }
    backtrack(0);
};`,
    explanation:
      '1. Pre-process the board: record all filled digits in row, column, and box sets.\n' +
      '2. Collect all empty cell positions.\n' +
      '3. For each empty cell, try digits 1-9 that are valid (not in row/col/box).\n' +
      '4. Place the digit, recurse to the next empty cell.\n' +
      '5. If recursion fails, backtrack by removing the digit and trying the next one.',
    timeComplexity: 'O(9^m) where m is the number of empty cells',
    spaceComplexity: 'O(m)',
    hints: [
      'Use sets to track which digits are used in each row, column, and 3x3 box.',
      'Try each valid digit for the first empty cell and recurse.',
      'Backtrack when no valid digit can be placed in a cell.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 38. Count and Say
  // ---------------------------------------------------------------------------
  {
    id: 38,
    description:
      'The count-and-say sequence is a sequence of digit strings defined by the recursive formula: countAndSay(1) = "1", and countAndSay(n) is the run-length encoding of countAndSay(n-1). For example, "1" -> "11" -> "21" -> "1211" -> "111221".',
    examples:
      'Input: n = 4\nOutput: "1211"',
    intuition:
      'Each term describes the previous one by counting consecutive identical digits. Read \'1211\' aloud: \'one 1, one 2, two 1s\' gives \'111221.\' The problem is purely about simulation - iterate n-1 times, each time scanning groups of consecutive digits.',
    approach:
      'Iteratively build each term from the previous one. For each term, scan consecutive groups of the same digit and encode each group as (count)(digit).',
    code: `class Solution:
    def countAndSay(self, n: int) -> str:
        s = "1"
        for _ in range(n - 1):
            result = []
            i = 0
            while i < len(s):
                j = i
                while j < len(s) and s[j] == s[i]:
                    j += 1
                result.append(str(j - i))
                result.append(s[i])
                i = j
            s = ''.join(result)
        return s`,
    jsCode: `var countAndSay = function(n) {
    let s = "1";
    for (let k = 0; k < n - 1; k++) {
        const result = [];
        let i = 0;
        while (i < s.length) {
            let j = i;
            while (j < s.length && s[j] === s[i]) j++;
            result.push(String(j - i));
            result.push(s[i]);
            i = j;
        }
        s = result.join('');
    }
    return s;
};`,
    explanation:
      '1. Start with s = "1".\n' +
      '2. For each iteration (n-1 times), generate the next term.\n' +
      '3. Scan consecutive identical digits: count how many and what digit.\n' +
      '4. Append count followed by the digit to build the new string.\n' +
      '5. After n-1 iterations, return the result.',
    timeComplexity: 'O(n * m) where m is the length of the string at step n',
    spaceComplexity: 'O(m)',
    hints: [
      'Build each term iteratively from the previous one.',
      'For each group of consecutive identical digits, say the count then the digit.',
      'Use two pointers to find groups of the same character.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 43. Multiply Strings
  // ---------------------------------------------------------------------------
  {
    id: 43,
    description:
      'Given two non-negative integers num1 and num2 represented as strings, return the product of num1 and num2 also represented as a string. You must not use any built-in BigInteger library or convert the inputs to integer directly.',
    examples:
      'Input: num1 = "123", num2 = "456"\nOutput: "56088"',
    intuition:
      'This simulates the long multiplication you learned in school. Each digit pair multiplies into a specific position in the result array (positions i+j and i+j+1). Process all digit pairs first, then handle carries in a separate pass.',
    approach:
      'Simulate grade-school multiplication. Use an array of length m+n to store intermediate results. For each pair of digits, multiply and add to the correct position. Handle carries at the end.',
    code: `class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        m, n = len(num1), len(num2)
        pos = [0] * (m + n)
        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                mul = (ord(num1[i]) - ord('0')) * (ord(num2[j]) - ord('0'))
                p1, p2 = i + j, i + j + 1
                total = mul + pos[p2]
                pos[p2] = total % 10
                pos[p1] += total // 10
        result = ''.join(str(d) for d in pos)
        result = result.lstrip('0')
        return result if result else '0'`,
    jsCode: `var multiply = function(num1, num2) {
    const m = num1.length, n = num2.length;
    const pos = Array(m + n).fill(0);
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            const mul = (num1.charCodeAt(i) - 48) * (num2.charCodeAt(j) - 48);
            const p1 = i + j, p2 = i + j + 1;
            const total = mul + pos[p2];
            pos[p2] = total % 10;
            pos[p1] += Math.floor(total / 10);
        }
    }
    let result = pos.join('').replace(/^0+/, '');
    return result || '0';
};`,
    explanation:
      '1. Create an array pos of size m+n to hold digit results.\n' +
      '2. Multiply each digit of num1 with each digit of num2.\n' +
      '3. Position i * j contributes to pos[i+j] and pos[i+j+1].\n' +
      '4. Accumulate products and propagate carries.\n' +
      '5. Convert to string and strip leading zeros.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m + n)',
    hints: [
      'Think about how you multiply numbers by hand on paper.',
      'Digit at index i of num1 and index j of num2 contributes to position i+j+1.',
      'Use an array to accumulate intermediate results before converting to string.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 44. Wildcard Matching
  // ---------------------------------------------------------------------------
  {
    id: 44,
    description:
      "Given an input string s and a pattern p, implement wildcard pattern matching. '?' matches any single character. '*' matches any sequence of characters (including empty). The matching should cover the entire input string.",
    examples:
      'Input: s = "adceb", p = "*a*b"\nOutput: true',
    intuition:
      'Like regex matching but simpler: \'?\' matches exactly one character and \'*\' matches any sequence. The DP insight is that \'*\' gives two choices at each step - match zero characters (look left in the table) or consume one character and keep the star active (look up).',
    approach:
      "Use dynamic programming where dp[i][j] means s[:i] matches p[:j]. For '*', it can match empty (dp[i][j-1]) or any sequence (dp[i-1][j]). For '?' or exact match, use dp[i-1][j-1].",
    code: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                dp[0][j] = dp[0][j - 1]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if p[j - 1] == '*':
                    dp[i][j] = dp[i - 1][j] or dp[i][j - 1]
                elif p[j - 1] == '?' or p[j - 1] == s[i - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
        return dp[m][n]`,
    jsCode: `var isMatch = function(s, p) {
    const m = s.length, n = p.length;
    const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(false));
    dp[0][0] = true;
    for (let j = 1; j <= n; j++) {
        if (p[j - 1] === '*') dp[0][j] = dp[0][j - 1];
    }
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (p[j - 1] === '*') {
                dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
            } else if (p[j - 1] === '?' || p[j - 1] === s[i - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }
    return dp[m][n];
};`,
    explanation:
      '1. dp[i][j] = whether s[:i] matches p[:j].\n' +
      '2. Base: dp[0][0] = True. Leading *s can match empty string.\n' +
      "3. For '*': match empty (dp[i][j-1]) or consume one char (dp[i-1][j]).\n" +
      "4. For '?' or exact match: dp[i][j] = dp[i-1][j-1].\n" +
      '5. Answer is dp[m][n].',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      "Consider what '*' can match: empty string, one character, or many characters.",
      'Use a 2D DP table similar to regular expression matching.',
      "For '*', either skip it (match empty) or consume one character from s.",
    ],
  },

  // ---------------------------------------------------------------------------
  // 45. Jump Game II
  // ---------------------------------------------------------------------------
  {
    id: 45,
    description:
      'You are given a 0-indexed array of integers nums of length n, where nums[i] is the maximum jump length from position i. Return the minimum number of jumps to reach nums[n - 1]. You can always reach the last index.',
    examples:
      'Input: nums = [2,3,1,1,4]\nOutput: 2',
    intuition:
      'Think of it like a frog jumping across lily pads. At each \'level\' of jumps, you know the farthest pad you can reach. When you\'ve exhausted the current level, you must take another jump, and the next level extends to the farthest reachable pad. This BFS-like thinking gives the minimum jumps.',
    approach:
      'Use a greedy BFS-like approach. Track the farthest position reachable from the current jump level. When you reach the end of the current level, increment jumps and extend the boundary to the farthest reachable position.',
    code: `class Solution:
    def jump(self, nums: list[int]) -> int:
        jumps = 0
        cur_end = 0
        farthest = 0
        for i in range(len(nums) - 1):
            farthest = max(farthest, i + nums[i])
            if i == cur_end:
                jumps += 1
                cur_end = farthest
        return jumps`,
    jsCode: `var jump = function(nums) {
    let jumps = 0, curEnd = 0, farthest = 0;
    for (let i = 0; i < nums.length - 1; i++) {
        farthest = Math.max(farthest, i + nums[i]);
        if (i === curEnd) {
            jumps++;
            curEnd = farthest;
        }
    }
    return jumps;
};`,
    explanation:
      '1. Track the farthest index reachable and the current jump boundary.\n' +
      '2. For each position, update the farthest reachable index.\n' +
      '3. When reaching the current boundary, a new jump is needed.\n' +
      '4. Set the new boundary to the farthest reachable position.\n' +
      '5. This greedy approach mimics BFS level-by-level expansion.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Think of this as a BFS where each level represents one jump.',
      'Track the farthest position reachable within the current jump.',
      'When you reach the boundary of the current jump, increment and extend.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 50. Pow(x, n)
  // ---------------------------------------------------------------------------
  {
    id: 50,
    description:
      'Implement pow(x, n), which calculates x raised to the power n (i.e., x^n). n is an integer which can be negative.',
    examples:
      'Input: x = 2.00000, n = 10\nOutput: 1024.00000',
    intuition:
      'Naive repeated multiplication is too slow for large exponents. The key insight is that x^10 = (x^5)^2, and x^5 = x * (x^2)^2. By squaring and halving the exponent, you reduce O(n) multiplications to O(log n). This is called binary exponentiation.',
    approach:
      'Use binary exponentiation (fast power). If n is even, x^n = (x^2)^(n/2). If n is odd, x^n = x * x^(n-1). Handle negative exponents by computing 1/x^|n|.',
    code: `class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x = 1 / x
            n = -n
        result = 1.0
        while n:
            if n % 2 == 1:
                result *= x
            x *= x
            n //= 2
        return result`,
    jsCode: `var myPow = function(x, n) {
    if (n < 0) {
        x = 1 / x;
        n = -n;
    }
    let result = 1.0;
    while (n > 0) {
        if (n % 2 === 1) result *= x;
        x *= x;
        n = Math.floor(n / 2);
    }
    return result;
};`,
    explanation:
      '1. If n is negative, invert x and negate n.\n' +
      '2. Use iterative binary exponentiation.\n' +
      '3. If the current bit of n is 1, multiply result by x.\n' +
      '4. Square x and halve n each iteration.\n' +
      '5. This reduces O(n) multiplications to O(log n).',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Computing x * x * ... * x is O(n). Can you use squaring to speed it up?',
      'x^n = (x^2)^(n/2) when n is even.',
      'Handle negative exponents by inverting x and using positive n.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 52. N-Queens II
  // ---------------------------------------------------------------------------
  {
    id: 52,
    description:
      'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return the number of distinct solutions to the n-queens puzzle.',
    examples:
      'Input: n = 4\nOutput: 2',
    intuition:
      'Place queens one row at a time, using sets to track which columns and diagonals are under attack. The key insight is that cells on the same diagonal share the same (row-col) value, and cells on the same anti-diagonal share the same (row+col) value.',
    approach:
      'Use backtracking with sets to track occupied columns and diagonals. Place queens row by row, and for each row try each column. Use sets for O(1) conflict checking.',
    code: `class Solution:
    def totalNQueens(self, n: int) -> int:
        def backtrack(row, cols, diag1, diag2):
            if row == n:
                return 1
            count = 0
            for col in range(n):
                if col in cols or (row - col) in diag1 or (row + col) in diag2:
                    continue
                cols.add(col)
                diag1.add(row - col)
                diag2.add(row + col)
                count += backtrack(row + 1, cols, diag1, diag2)
                cols.remove(col)
                diag1.remove(row - col)
                diag2.remove(row + col)
            return count

        return backtrack(0, set(), set(), set())`,
    jsCode: `var totalNQueens = function(n) {
    function backtrack(row, cols, diag1, diag2) {
        if (row === n) return 1;
        let count = 0;
        for (let col = 0; col < n; col++) {
            if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;
            cols.add(col);
            diag1.add(row - col);
            diag2.add(row + col);
            count += backtrack(row + 1, cols, diag1, diag2);
            cols.delete(col);
            diag1.delete(row - col);
            diag2.delete(row + col);
        }
        return count;
    }
    return backtrack(0, new Set(), new Set(), new Set());
};`,
    explanation:
      '1. Place queens row by row using backtracking.\n' +
      '2. Track occupied columns, main diagonals (row-col), and anti-diagonals (row+col).\n' +
      '3. For each row, try each column and check if placement is valid.\n' +
      '4. If valid, place queen, recurse, then remove (backtrack).\n' +
      '5. Count solutions when all n queens are placed (row == n).',
    timeComplexity: 'O(n!)',
    spaceComplexity: 'O(n)',
    hints: [
      'Place one queen per row and try each column.',
      'Two queens are on the same diagonal if |row1-row2| == |col1-col2|.',
      'Use sets for columns and both diagonals for O(1) conflict checking.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 58. Length of Last Word
  // ---------------------------------------------------------------------------
  {
    id: 58,
    description:
      'Given a string s consisting of words and spaces, return the length of the last word in the string. A word is a maximal substring consisting of non-space characters only.',
    examples:
      'Input: s = "Hello World"\nOutput: 5',
    intuition:
      'The simplest approach is to split by spaces and return the length of the last word. If doing it manually, start from the end of the string, skip trailing spaces, then count characters until you hit a space or the beginning.',
    approach:
      'Strip trailing spaces, then count characters from the end until a space is encountered. Alternatively, use split and return the length of the last element.',
    code: `class Solution:
    def lengthOfLastWord(self, s: str) -> int:
        i = len(s) - 1
        while i >= 0 and s[i] == ' ':
            i -= 1
        length = 0
        while i >= 0 and s[i] != ' ':
            length += 1
            i -= 1
        return length`,
    jsCode: `var lengthOfLastWord = function(s) {
    let i = s.length - 1;
    while (i >= 0 && s[i] === ' ') i--;
    let length = 0;
    while (i >= 0 && s[i] !== ' ') {
        length++;
        i--;
    }
    return length;
};`,
    explanation:
      '1. Start from the end of the string.\n' +
      '2. Skip any trailing spaces.\n' +
      '3. Count characters until a space or the beginning of the string.\n' +
      '4. Return the count as the length of the last word.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Start scanning from the end of the string.',
      'First skip trailing spaces, then count non-space characters.',
      'Alternatively, s.split()[-1] gives the last word directly.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 59. Spiral Matrix II
  // ---------------------------------------------------------------------------
  {
    id: 59,
    description:
      'Given a positive integer n, generate an n x n matrix filled with elements from 1 to n^2 in spiral order.',
    examples:
      'Input: n = 3\nOutput: [[1,2,3],[8,9,4],[7,6,5]]',
    intuition:
      'Imagine walking a spiral path and dropping numbered tiles as you go. Maintain four boundaries (top, bottom, left, right) that shrink inward after each pass. Fill numbers 1 through n^2 by repeatedly going right, down, left, up.',
    approach:
      'Simulate the spiral traversal using four boundaries (top, bottom, left, right). Fill numbers 1 to n^2 by going right, down, left, up and shrinking boundaries after each direction.',
    code: `class Solution:
    def generateMatrix(self, n: int) -> list[list[int]]:
        matrix = [[0] * n for _ in range(n)]
        top, bottom, left, right = 0, n - 1, 0, n - 1
        num = 1
        while top <= bottom and left <= right:
            for j in range(left, right + 1):
                matrix[top][j] = num
                num += 1
            top += 1
            for i in range(top, bottom + 1):
                matrix[i][right] = num
                num += 1
            right -= 1
            for j in range(right, left - 1, -1):
                matrix[bottom][j] = num
                num += 1
            bottom -= 1
            for i in range(bottom, top - 1, -1):
                matrix[i][left] = num
                num += 1
            left += 1
        return matrix`,
    jsCode: `var generateMatrix = function(n) {
    const matrix = Array.from({length: n}, () => Array(n).fill(0));
    let top = 0, bottom = n - 1, left = 0, right = n - 1;
    let num = 1;
    while (top <= bottom && left <= right) {
        for (let j = left; j <= right; j++) matrix[top][j] = num++;
        top++;
        for (let i = top; i <= bottom; i++) matrix[i][right] = num++;
        right--;
        for (let j = right; j >= left; j--) matrix[bottom][j] = num++;
        bottom--;
        for (let i = bottom; i >= top; i--) matrix[i][left] = num++;
        left++;
    }
    return matrix;
};`,
    explanation:
      '1. Initialize an n x n matrix with zeros.\n' +
      '2. Use four boundaries: top, bottom, left, right.\n' +
      '3. Fill right across the top row, then move top down.\n' +
      '4. Fill down the right column, then move right left.\n' +
      '5. Fill left across the bottom row, then move bottom up. Fill up the left column, then move left right.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Simulate the spiral by maintaining four boundary pointers.',
      'After filling each direction, shrink the corresponding boundary.',
      'Continue until the boundaries cross.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 60. Permutation Sequence
  // ---------------------------------------------------------------------------
  {
    id: 60,
    description:
      'The set [1, 2, 3, ..., n] contains a total of n! unique permutations. Given n and k, return the kth permutation sequence. k is 1-indexed.',
    examples:
      'Input: n = 3, k = 3\nOutput: "213"',
    intuition:
      'The factorial number system maps directly to permutations. At each position, dividing k by (n-1)! tells you which of the remaining elements goes there. It\'s like a multi-digit number where each \'digit\' selects from a shrinking pool of options.',
    approach:
      'Use the factorial number system. At each position, determine which element goes there by dividing k-1 by (n-1)!. The quotient gives the index into the remaining available digits.',
    code: `class Solution:
    def getPermutation(self, n: int, k: int) -> str:
        import math
        digits = list(range(1, n + 1))
        k -= 1
        result = []
        for i in range(n, 0, -1):
            fact = math.factorial(i - 1)
            idx = k // fact
            k %= fact
            result.append(str(digits[idx]))
            digits.pop(idx)
        return ''.join(result)`,
    jsCode: `var getPermutation = function(n, k) {
    const digits = [];
    for (let i = 1; i <= n; i++) digits.push(i);
    k--;
    const result = [];
    for (let i = n; i > 0; i--) {
        let fact = 1;
        for (let j = 1; j < i; j++) fact *= j;
        const idx = Math.floor(k / fact);
        k %= fact;
        result.push(String(digits[idx]));
        digits.splice(idx, 1);
    }
    return result.join('');
};`,
    explanation:
      '1. Convert to 0-indexed by decrementing k.\n' +
      '2. For each position, compute (i-1)! = number of permutations per group.\n' +
      '3. k // fact gives the index of the digit to pick from remaining digits.\n' +
      '4. k %= fact adjusts k for the next position.\n' +
      '5. Remove the chosen digit from the available list and continue.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    hints: [
      'There are (n-1)! permutations starting with each digit.',
      'Use k to determine which digit goes at each position.',
      'This is essentially converting k to the factorial number system.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 61. Rotate List
  // ---------------------------------------------------------------------------
  {
    id: 61,
    description:
      'Given the head of a linked list, rotate the list to the right by k places. For example, rotating [1,2,3,4,5] by 2 gives [4,5,1,2,3].',
    examples:
      'Input: head = [1,2,3,4,5], k = 2\nOutput: [4,5,1,2,3]',
    intuition:
      'First, find the actual rotation amount (k mod length, since rotating by the length is a no-op). Then make the list circular, walk to the new tail position (length - k from the start), and break the circle there. The next node becomes the new head.',
    approach:
      'Find the length of the list and compute k % length to handle large k values. Make the list circular by connecting the tail to the head, then break the circle at the new tail position (length - k nodes from the start).',
    code: `class Solution:
    def rotateRight(self, head, k: int):
        if not head or not head.next or k == 0:
            return head
        length = 1
        tail = head
        while tail.next:
            tail = tail.next
            length += 1
        k %= length
        if k == 0:
            return head
        tail.next = head
        steps = length - k
        new_tail = head
        for _ in range(steps - 1):
            new_tail = new_tail.next
        new_head = new_tail.next
        new_tail.next = None
        return new_head`,
    jsCode: `var rotateRight = function(head, k) {
    if (!head || !head.next || k === 0) return head;
    let length = 1;
    let tail = head;
    while (tail.next) {
        tail = tail.next;
        length++;
    }
    k %= length;
    if (k === 0) return head;
    tail.next = head;
    let steps = length - k;
    let newTail = head;
    for (let i = 0; i < steps - 1; i++) newTail = newTail.next;
    const newHead = newTail.next;
    newTail.next = null;
    return newHead;
};`,
    explanation:
      '1. Find the length of the list and the tail node.\n' +
      '2. Compute effective rotation: k %= length.\n' +
      '3. Connect tail to head to form a circular list.\n' +
      '4. Move (length - k - 1) steps from head to find the new tail.\n' +
      '5. Break the circle: new_head = new_tail.next, new_tail.next = None.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'First find the length of the list and take k % length.',
      'Make the list circular, then find where to break it.',
      'The break point is (length - k) nodes from the beginning.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 63. Unique Paths II
  // ---------------------------------------------------------------------------
  {
    id: 63,
    description:
      'You are given an m x n integer array grid. There is a robot initially located at the top-left corner. The robot tries to move to the bottom-right corner, moving only right or down. An obstacle is marked as 1, empty space as 0. Return the number of possible unique paths.',
    examples:
      'Input: obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]\nOutput: 2',
    intuition:
      'This is a grid pathfinding problem with blocked cells. The key insight is that an obstacle means zero paths through that cell, while every other cell\'s path count is the sum of paths from above and from the left. This is standard 2D dynamic programming.',
    approach:
      'Use dynamic programming. dp[i][j] = number of paths to reach (i,j). If a cell has an obstacle, dp[i][j] = 0. Otherwise, dp[i][j] = dp[i-1][j] + dp[i][j-1]. Can optimize to 1D DP.',
    code: `class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: list[list[int]]) -> int:
        m, n = len(obstacleGrid), len(obstacleGrid[0])
        if obstacleGrid[0][0] == 1:
            return 0
        dp = [0] * n
        dp[0] = 1
        for i in range(m):
            for j in range(n):
                if obstacleGrid[i][j] == 1:
                    dp[j] = 0
                elif j > 0:
                    dp[j] += dp[j - 1]
        return dp[n - 1]`,
    jsCode: `var uniquePathsWithObstacles = function(obstacleGrid) {
    const m = obstacleGrid.length, n = obstacleGrid[0].length;
    if (obstacleGrid[0][0] === 1) return 0;
    const dp = Array(n).fill(0);
    dp[0] = 1;
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (obstacleGrid[i][j] === 1) {
                dp[j] = 0;
            } else if (j > 0) {
                dp[j] += dp[j - 1];
            }
        }
    }
    return dp[n - 1];
};`,
    explanation:
      '1. If the start cell has an obstacle, return 0.\n' +
      '2. Use a 1D DP array representing the current row.\n' +
      '3. For each cell, if it has an obstacle, set dp[j] = 0.\n' +
      '4. Otherwise, add paths from the left (dp[j-1]) to paths from above (dp[j]).\n' +
      '5. dp[n-1] gives the number of paths to the bottom-right corner.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(n)',
    hints: [
      'This is a modification of the basic unique paths problem.',
      'Set dp to 0 for any cell with an obstacle.',
      'Use 1D DP to optimize space.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 64. Minimum Path Sum
  // ---------------------------------------------------------------------------
  {
    id: 64,
    description:
      'Given an m x n grid filled with non-negative numbers, find a path from top left to bottom right which minimizes the sum of all numbers along its path. You can only move either down or right at any step.',
    examples:
      'Input: grid = [[1,3,1],[1,5,1],[4,2,1]]\nOutput: 7\nExplanation: path 1->3->1->1->1 = 7',
    intuition:
      'Each cell can only be reached from above or from the left, so the minimum cost to reach it is its own value plus the cheaper of those two options. Fill the DP table row by row, and the bottom-right cell gives the answer.',
    approach:
      'Use dynamic programming. dp[i][j] = minimum path sum to reach (i,j). dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]). Can modify the grid in-place or use 1D DP.',
    code: `class Solution:
    def minPathSum(self, grid: list[list[int]]) -> int:
        m, n = len(grid), len(grid[0])
        for i in range(m):
            for j in range(n):
                if i == 0 and j == 0:
                    continue
                elif i == 0:
                    grid[i][j] += grid[i][j - 1]
                elif j == 0:
                    grid[i][j] += grid[i - 1][j]
                else:
                    grid[i][j] += min(grid[i - 1][j], grid[i][j - 1])
        return grid[m - 1][n - 1]`,
    jsCode: `var minPathSum = function(grid) {
    const m = grid.length, n = grid[0].length;
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (i === 0 && j === 0) continue;
            else if (i === 0) grid[i][j] += grid[i][j - 1];
            else if (j === 0) grid[i][j] += grid[i - 1][j];
            else grid[i][j] += Math.min(grid[i - 1][j], grid[i][j - 1]);
        }
    }
    return grid[m - 1][n - 1];
};`,
    explanation:
      '1. Modify the grid in-place to store cumulative minimum path sums.\n' +
      '2. First row: can only come from the left.\n' +
      '3. First column: can only come from above.\n' +
      '4. Other cells: take the minimum of coming from above or from the left.\n' +
      '5. The bottom-right cell contains the answer.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Each cell can only be reached from the left or from above.',
      'The minimum path sum to a cell is the cell value plus the minimum of its two possible predecessors.',
      'You can modify the grid in-place to avoid extra space.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 65. Valid Number
  // ---------------------------------------------------------------------------
  {
    id: 65,
    description:
      'Given a string s, return whether s is a valid number. A valid number can be an integer or a decimal, optionally followed by an exponent part (e or E followed by an integer). It may start with an optional sign.',
    examples:
      'Input: s = "2e10"\nOutput: true',
    intuition:
      'This is a parsing problem best solved with a state machine. Track what you\'ve seen so far (digits, dot, exponent, sign) and validate transitions. The key insight is breaking the number into components: optional sign, integer/decimal part, optional exponent with its own optional sign and digits.',
    approach:
      'Use a state machine or flag-based approach. Track whether we have seen a digit, a dot, an exponent, and a sign. Validate transitions between these states as we process each character.',
    code: `class Solution:
    def isNumber(self, s: str) -> bool:
        seen_digit = seen_dot = seen_exp = False
        for i, c in enumerate(s):
            if c.isdigit():
                seen_digit = True
            elif c in ('+', '-'):
                if i > 0 and s[i - 1] not in ('e', 'E'):
                    return False
            elif c == '.':
                if seen_dot or seen_exp:
                    return False
                seen_dot = True
            elif c in ('e', 'E'):
                if seen_exp or not seen_digit:
                    return False
                seen_exp = True
                seen_digit = False
            else:
                return False
        return seen_digit`,
    jsCode: `var isNumber = function(s) {
    let seenDigit = false, seenDot = false, seenExp = false;
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c >= '0' && c <= '9') {
            seenDigit = true;
        } else if (c === '+' || c === '-') {
            if (i > 0 && s[i - 1] !== 'e' && s[i - 1] !== 'E') return false;
        } else if (c === '.') {
            if (seenDot || seenExp) return false;
            seenDot = true;
        } else if (c === 'e' || c === 'E') {
            if (seenExp || !seenDigit) return false;
            seenExp = true;
            seenDigit = false;
        } else {
            return false;
        }
    }
    return seenDigit;
};`,
    explanation:
      '1. Track flags: seen_digit, seen_dot, seen_exp.\n' +
      '2. Digits: set seen_digit = True.\n' +
      '3. Sign: only valid at start or right after e/E.\n' +
      '4. Dot: invalid if already seen or after exponent.\n' +
      '5. e/E: invalid if already seen or no digits before it. Reset seen_digit for exponent part.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Break the number into parts: integer/decimal part and optional exponent part.',
      'Track what you have seen so far with boolean flags.',
      'After an exponent, digits must follow (optionally with a sign).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 66. Plus One
  // ---------------------------------------------------------------------------
  {
    id: 66,
    description:
      'You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit. The digits are ordered from most significant to least significant. Increment the large integer by one and return the resulting array of digits.',
    examples:
      'Input: digits = [1,2,3]\nOutput: [1,2,4]',
    intuition:
      'Think of it like adding 1 by hand: start from the rightmost digit, add one, and carry over if it becomes 10. The only special case is when every digit carries over (like 999 + 1 = 1000), which requires prepending a 1.',
    approach:
      'Start from the last digit and add one. If it becomes 10, set it to 0 and carry to the next digit. If carry propagates past the first digit, prepend 1.',
    code: `class Solution:
    def plusOne(self, digits: list[int]) -> list[int]:
        for i in range(len(digits) - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1
                return digits
            digits[i] = 0
        return [1] + digits`,
    jsCode: `var plusOne = function(digits) {
    for (let i = digits.length - 1; i >= 0; i--) {
        if (digits[i] < 9) {
            digits[i]++;
            return digits;
        }
        digits[i] = 0;
    }
    return [1, ...digits];
};`,
    explanation:
      '1. Iterate from the last digit to the first.\n' +
      '2. If the digit is less than 9, increment it and return immediately (no carry).\n' +
      '3. If the digit is 9, set it to 0 (carry propagates).\n' +
      '4. If all digits were 9, the loop ends and we prepend 1 (e.g., 999 -> 1000).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Start from the rightmost digit and propagate the carry.',
      'Most of the time, only the last digit changes.',
      'The only case where the array grows is when all digits are 9.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 67. Add Binary
  // ---------------------------------------------------------------------------
  {
    id: 67,
    description:
      'Given two binary strings a and b, return their sum as a binary string.',
    examples:
      'Input: a = "11", b = "1"\nOutput: "100"',
    intuition:
      'This is elementary binary addition done right-to-left, just like decimal addition but with base 2. At each position, add the two bits and the carry. The sum bit is (total % 2) and the new carry is (total / 2).',
    approach:
      'Add the binary strings from right to left, keeping track of the carry. At each position, add the corresponding bits and the carry. Build the result string in reverse.',
    code: `class Solution:
    def addBinary(self, a: str, b: str) -> str:
        result = []
        carry = 0
        i, j = len(a) - 1, len(b) - 1
        while i >= 0 or j >= 0 or carry:
            total = carry
            if i >= 0:
                total += int(a[i])
                i -= 1
            if j >= 0:
                total += int(b[j])
                j -= 1
            result.append(str(total % 2))
            carry = total // 2
        return ''.join(reversed(result))`,
    jsCode: `var addBinary = function(a, b) {
    const result = [];
    let carry = 0;
    let i = a.length - 1, j = b.length - 1;
    while (i >= 0 || j >= 0 || carry) {
        let total = carry;
        if (i >= 0) { total += Number(a[i]); i--; }
        if (j >= 0) { total += Number(b[j]); j--; }
        result.push(String(total % 2));
        carry = Math.floor(total / 2);
    }
    return result.reverse().join('');
};`,
    explanation:
      '1. Use two pointers starting from the end of both strings.\n' +
      '2. Add corresponding bits plus carry.\n' +
      '3. Current bit = total % 2, new carry = total // 2.\n' +
      '4. Continue until both strings are exhausted and carry is 0.\n' +
      '5. Reverse the result since we built it backwards.',
    timeComplexity: 'O(max(m, n))',
    spaceComplexity: 'O(max(m, n))',
    hints: [
      'Process both strings from right to left, like manual addition.',
      'Handle different string lengths by treating missing digits as 0.',
      'Do not forget to handle the final carry.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 68. Text Justification
  // ---------------------------------------------------------------------------
  {
    id: 68,
    description:
      'Given an array of strings words and a width maxWidth, format the text such that each line has exactly maxWidth characters and is fully (left and right) justified. Pack as many words as you can in each line. Extra spaces between words should be distributed as evenly as possible. The last line should be left-justified.',
    examples:
      'Input: words = ["This","is","an","example","of","text","justification."], maxWidth = 16\nOutput: ["This    is    an","example  of text","justification.  "]',
    intuition:
      'The challenge is distributing spaces evenly. For each line, calculate total spaces needed, then divide them between word gaps. Extra spaces that don\'t divide evenly go to the leftmost gaps. The last line is left-justified with single spaces, which is a special case.',
    approach:
      'Greedily pack words into each line. For each line, calculate total spaces needed, distribute them evenly between words (with extra spaces going to the left slots). Left-justify the last line.',
    code: `class Solution:
    def fullJustify(self, words: list[str], maxWidth: int) -> list[str]:
        res, line, line_len = [], [], 0
        for word in words:
            if line_len + len(word) + len(line) > maxWidth:
                for i in range(maxWidth - line_len):
                    line[i % (len(line) - 1 or 1)] += ' '
                res.append(''.join(line))
                line, line_len = [], 0
            line.append(word)
            line_len += len(word)
        res.append(' '.join(line).ljust(maxWidth))
        return res`,
    jsCode: `var fullJustify = function(words, maxWidth) {
    const res = [];
    let line = [], lineLen = 0;
    for (const word of words) {
        if (lineLen + word.length + line.length > maxWidth) {
            for (let i = 0; i < maxWidth - lineLen; i++) {
                line[i % (line.length - 1 || 1)] += ' ';
            }
            res.push(line.join(''));
            line = [];
            lineLen = 0;
        }
        line.push(word);
        lineLen += word.length;
    }
    res.push(line.join(' ').padEnd(maxWidth));
    return res;
};`,
    explanation:
      '1. Greedily pack words into lines until adding the next word exceeds maxWidth.\n' +
      '2. For each full line, distribute extra spaces round-robin among gaps.\n' +
      '3. i % (len(line) - 1 or 1) distributes spaces evenly, left-biased.\n' +
      '4. For the last line, left-justify with spaces on the right.\n' +
      '5. Handle single-word lines by padding with spaces on the right.',
    timeComplexity: 'O(n) where n is total characters',
    spaceComplexity: 'O(n)',
    hints: [
      'First determine which words go on each line using a greedy approach.',
      'Distribute extra spaces as evenly as possible, giving extras to the left gaps.',
      'The last line is a special case: left-justify with trailing spaces.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 69. Sqrt(x)
  // ---------------------------------------------------------------------------
  {
    id: 69,
    description:
      'Given a non-negative integer x, return the square root of x rounded down to the nearest integer. The returned integer should be non-negative as well. You must not use any built-in exponent function or operator.',
    examples:
      'Input: x = 8\nOutput: 2\nExplanation: The square root of 8 is 2.828..., rounded down to 2.',
    intuition:
      'Binary search works perfectly here: you\'re looking for the largest integer whose square is at most x. The search space is [0, x], and at each step you check if mid*mid is too big or too small. This converges in O(log x) steps.',
    approach:
      'Use binary search on the range [0, x]. For each midpoint, check if mid * mid <= x. Find the largest mid such that mid * mid <= x.',
    code: `class Solution:
    def mySqrt(self, x: int) -> int:
        lo, hi = 0, x
        while lo <= hi:
            mid = (lo + hi) // 2
            if mid * mid <= x:
                lo = mid + 1
            else:
                hi = mid - 1
        return hi`,
    jsCode: `var mySqrt = function(x) {
    let lo = 0, hi = x;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (mid * mid <= x) lo = mid + 1;
        else hi = mid - 1;
    }
    return hi;
};`,
    explanation:
      '1. Binary search in the range [0, x].\n' +
      '2. If mid^2 <= x, the answer might be mid or larger, so move lo up.\n' +
      '3. If mid^2 > x, mid is too large, so move hi down.\n' +
      '4. When the loop ends, hi is the largest integer where hi^2 <= x.\n' +
      '5. Return hi as the floor of the square root.',
    timeComplexity: 'O(log x)',
    spaceComplexity: 'O(1)',
    hints: [
      'Binary search works well for finding integer square roots.',
      'Search for the largest integer whose square does not exceed x.',
      'The search range is [0, x].',
    ],
  },

  // ---------------------------------------------------------------------------
  // 71. Simplify Path
  // ---------------------------------------------------------------------------
  {
    id: 71,
    description:
      'Given an absolute Unix-style file path, simplify it to its canonical form. The canonical path starts with a single slash, directories are separated by single slashes, does not end with a trailing slash, and ".." means go up one directory.',
    examples:
      'Input: path = "/home//foo/"\nOutput: "/home/foo"',
    intuition:
      'Think of navigating a file system. A stack naturally models directory traversal: regular names push onto the stack, \'..\' pops from it, and \'.\' does nothing. At the end, join the stack contents with \'/\' to get the simplified path.',
    approach:
      'Split the path by "/", use a stack to process each component. Skip empty strings and ".". For "..", pop from the stack if non-empty. Join the stack with "/" and prepend "/".',
    code: `class Solution:
    def simplifyPath(self, path: str) -> str:
        stack = []
        for part in path.split('/'):
            if part == '..':
                if stack:
                    stack.pop()
            elif part and part != '.':
                stack.append(part)
        return '/' + '/'.join(stack)`,
    jsCode: `var simplifyPath = function(path) {
    const stack = [];
    for (const part of path.split('/')) {
        if (part === '..') {
            if (stack.length) stack.pop();
        } else if (part && part !== '.') {
            stack.push(part);
        }
    }
    return '/' + stack.join('/');
};`,
    explanation:
      '1. Split the path by "/" to get individual components.\n' +
      '2. Skip empty strings (from consecutive slashes) and "." (current directory).\n' +
      '3. For "..", pop the last directory from the stack if it exists.\n' +
      '4. For valid directory names, push onto the stack.\n' +
      '5. Join with "/" and prepend "/" for the canonical path.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Split by "/" and process each component individually.',
      'Use a stack to handle ".." (go up one directory).',
      'Skip empty components and "." (current directory).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 80. Remove Duplicates from Sorted Array II
  // ---------------------------------------------------------------------------
  {
    id: 80,
    description:
      'Given an integer array nums sorted in non-decreasing order, remove some duplicates in-place such that each unique element appears at most twice. The relative order of the elements should be kept the same. Return k, the number of valid elements.',
    examples:
      'Input: nums = [1,1,1,2,2,3]\nOutput: 5, nums = [1,1,2,2,3,_]',
    intuition:
      'The key insight is comparing each element to the one two positions back in the output. If they\'re different, this element is safe to include (it can\'t be a third duplicate). This single comparison replaces complex counting logic.',
    approach:
      'Use a write pointer. For each element, write it if it differs from the element two positions back in the output. This allows at most two copies of each value.',
    code: `class Solution:
    def removeDuplicates(self, nums: list[int]) -> int:
        if len(nums) <= 2:
            return len(nums)
        k = 2
        for i in range(2, len(nums)):
            if nums[i] != nums[k - 2]:
                nums[k] = nums[i]
                k += 1
        return k`,
    jsCode: `var removeDuplicates = function(nums) {
    if (nums.length <= 2) return nums.length;
    let k = 2;
    for (let i = 2; i < nums.length; i++) {
        if (nums[i] !== nums[k - 2]) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k;
};`,
    explanation:
      '1. First two elements are always kept.\n' +
      '2. For each subsequent element, compare with nums[k-2] (two positions back in output).\n' +
      '3. If different, it means we have fewer than 2 copies, so write it.\n' +
      '4. This ensures each element appears at most twice.\n' +
      '5. k tracks the write position and final count.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Generalize the remove-duplicates approach to allow up to 2 copies.',
      'Compare each element with the one 2 positions back in the output.',
      'If they are different, the current element is safe to keep.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 81. Search in Rotated Sorted Array II
  // ---------------------------------------------------------------------------
  {
    id: 81,
    description:
      'There is an integer array nums sorted in non-decreasing order (with possible duplicates). nums is rotated at some pivot. Given the array after rotation and a target, return true if target is in nums, or false otherwise.',
    examples:
      'Input: nums = [2,5,6,0,0,1,2], target = 0\nOutput: true',
    intuition:
      'This is binary search in a rotated sorted array with duplicates. The main complication is when nums[lo] == nums[mid] - you can\'t tell which half is sorted. The fix is simple: just increment lo to skip the duplicate. This degrades worst-case to O(n) but average case remains O(log n).',
    approach:
      'Modified binary search. When duplicates make it impossible to determine which half is sorted (nums[lo] == nums[mid]), increment lo to skip the duplicate. Otherwise, determine which half is sorted and search accordingly.',
    code: `class Solution:
    def search(self, nums: list[int], target: int) -> bool:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return True
            if nums[lo] == nums[mid]:
                lo += 1
                continue
            if nums[lo] <= nums[mid]:
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return False`,
    jsCode: `var search = function(nums, target) {
    let lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (nums[mid] === target) return true;
        if (nums[lo] === nums[mid]) {
            lo++;
            continue;
        }
        if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return false;
};`,
    explanation:
      '1. Standard binary search with modifications for rotation and duplicates.\n' +
      '2. If nums[lo] == nums[mid], we cannot determine which side is sorted; skip lo.\n' +
      '3. If left half is sorted (nums[lo] <= nums[mid]), check if target is in that range.\n' +
      '4. If right half is sorted, check if target is in that range.\n' +
      '5. Worst case degrades to O(n) due to duplicates.',
    timeComplexity: 'O(n) worst case, O(log n) average',
    spaceComplexity: 'O(1)',
    hints: [
      'This is similar to Search in Rotated Sorted Array but with duplicates.',
      'When nums[lo] == nums[mid], you cannot determine which half is sorted.',
      'In that case, just increment lo to skip the duplicate.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 82. Remove Duplicates from Sorted List II
  // ---------------------------------------------------------------------------
  {
    id: 82,
    description:
      'Given the head of a sorted linked list, delete all nodes that have duplicate numbers, leaving only distinct numbers from the original list. Return the linked list sorted as well.',
    examples:
      'Input: head = [1,2,3,3,4,4,5]\nOutput: [1,2,5]',
    intuition:
      'Use a pointer that looks ahead to detect runs of duplicate values. When you find a value that repeats, skip the entire run. A dummy node before the head handles the case where the head itself has duplicates.',
    approach:
      'Use a dummy node before head. For each node, check if it has duplicates (next node has same value). If so, skip all nodes with that value. If not, advance the pointer.',
    code: `class Solution:
    def deleteDuplicates(self, head):
        dummy = ListNode(0, head)
        prev = dummy
        while head:
            if head.next and head.val == head.next.val:
                while head.next and head.val == head.next.val:
                    head = head.next
                prev.next = head.next
            else:
                prev = prev.next
            head = head.next
        return dummy.next`,
    jsCode: `var deleteDuplicates = function(head) {
    const dummy = new ListNode(0, head);
    let prev = dummy;
    while (head) {
        if (head.next && head.val === head.next.val) {
            while (head.next && head.val === head.next.val) {
                head = head.next;
            }
            prev.next = head.next;
        } else {
            prev = prev.next;
        }
        head = head.next;
    }
    return dummy.next;
};`,
    explanation:
      '1. Create a dummy node pointing to head.\n' +
      '2. prev tracks the last confirmed unique node.\n' +
      '3. If head has duplicates (head.val == head.next.val), skip all nodes with that value.\n' +
      '4. Set prev.next to skip over all duplicates.\n' +
      '5. If no duplicate, advance prev normally.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'A dummy node simplifies handling duplicates at the head of the list.',
      'When you find a duplicate value, skip all nodes with that value.',
      'Keep a prev pointer to rewire around duplicate groups.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 83. Remove Duplicates from Sorted List
  // ---------------------------------------------------------------------------
  {
    id: 83,
    description:
      'Given the head of a sorted linked list, delete all duplicates such that each element appears only once. Return the linked list sorted as well.',
    examples:
      'Input: head = [1,1,2]\nOutput: [1,2]',
    intuition:
      'Walk through the sorted list and whenever the current node\'s value equals the next node\'s value, skip the next node by updating the pointer. Since the list is sorted, all duplicates are adjacent, making one pass sufficient.',
    approach:
      'Iterate through the list. When the current node has the same value as the next, skip the next node by updating the pointer. Otherwise, advance to the next node.',
    code: `class Solution:
    def deleteDuplicates(self, head):
        curr = head
        while curr and curr.next:
            if curr.val == curr.next.val:
                curr.next = curr.next.next
            else:
                curr = curr.next
        return head`,
    jsCode: `var deleteDuplicates = function(head) {
    let curr = head;
    while (curr && curr.next) {
        if (curr.val === curr.next.val) {
            curr.next = curr.next.next;
        } else {
            curr = curr.next;
        }
    }
    return head;
};`,
    explanation:
      '1. Start at the head of the list.\n' +
      '2. If current value equals next value, skip the next node.\n' +
      '3. Otherwise, move to the next node.\n' +
      '4. Since the list is sorted, all duplicates are adjacent.\n' +
      '5. Return the original head (it is never removed).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Since the list is sorted, duplicates are always adjacent.',
      'When you find a duplicate, skip over it by adjusting the next pointer.',
      'Be careful not to advance the current pointer when you remove a duplicate.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 85. Maximal Rectangle
  // ---------------------------------------------------------------------------
  {
    id: 85,
    description:
      'Given a rows x cols binary matrix filled with 0s and 1s, find the largest rectangle containing only 1s and return its area.',
    examples:
      'Input: matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]\nOutput: 6',
    intuition:
      'The key insight is reducing this 2D problem to a 1D one. For each row, build a histogram of consecutive 1s above (including the current row). Then apply the \'largest rectangle in histogram\' algorithm using a stack. This transforms an intimidating matrix problem into a familiar one.',
    approach:
      'Build a histogram of heights for each row (consecutive 1s above including current row). Then apply the largest rectangle in histogram algorithm using a stack for each row.',
    code: `class Solution:
    def maximalRectangle(self, matrix: list[list[str]]) -> int:
        if not matrix:
            return 0
        cols = len(matrix[0])
        heights = [0] * (cols + 1)
        max_area = 0
        for row in matrix:
            for j in range(cols):
                heights[j] = heights[j] + 1 if row[j] == '1' else 0
            stack = [-1]
            for j in range(cols + 1):
                while stack[-1] != -1 and heights[stack[-1]] >= heights[j]:
                    h = heights[stack.pop()]
                    w = j - stack[-1] - 1
                    max_area = max(max_area, h * w)
                stack.append(j)
        return max_area`,
    jsCode: `var maximalRectangle = function(matrix) {
    if (!matrix.length) return 0;
    const cols = matrix[0].length;
    const heights = Array(cols + 1).fill(0);
    let maxArea = 0;
    for (const row of matrix) {
        for (let j = 0; j < cols; j++) {
            heights[j] = row[j] === '1' ? heights[j] + 1 : 0;
        }
        const stack = [-1];
        for (let j = 0; j <= cols; j++) {
            while (stack[stack.length - 1] !== -1 && heights[stack[stack.length - 1]] >= heights[j]) {
                const h = heights[stack.pop()];
                const w = j - stack[stack.length - 1] - 1;
                maxArea = Math.max(maxArea, h * w);
            }
            stack.push(j);
        }
    }
    return maxArea;
};`,
    explanation:
      '1. For each row, compute histogram heights (consecutive 1s above).\n' +
      '2. For each histogram, use the monotonic stack approach for largest rectangle.\n' +
      '3. Append a sentinel 0 to flush remaining elements from the stack.\n' +
      '4. For each popped bar, calculate width = j - stack[-1] - 1.\n' +
      '5. Track the maximum area across all rows.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Reduce this to the largest rectangle in histogram problem for each row.',
      'Build heights row by row: reset to 0 on "0", increment on "1".',
      'Use a monotonic stack to find the largest rectangle in each histogram.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 86. Partition List
  // ---------------------------------------------------------------------------
  {
    id: 86,
    description:
      'Given the head of a linked list and a value x, partition it such that all nodes less than x come before nodes greater than or equal to x. You should preserve the original relative order of the nodes in each of the two partitions.',
    examples:
      'Input: head = [1,4,3,2,5,2], x = 3\nOutput: [1,2,2,4,3,5]',
    intuition:
      'Build two separate chains: one for nodes less than x, one for nodes greater than or equal to x. Walk through the original list, appending each node to the appropriate chain. Finally, connect the two chains together. A dummy head for each chain simplifies the logic.',
    approach:
      'Create two separate linked lists: one for nodes with values < x and one for nodes >= x. Iterate through the original list, appending each node to the appropriate list. Connect the two lists at the end.',
    code: `class Solution:
    def partition(self, head, x: int):
        before = before_head = ListNode(0)
        after = after_head = ListNode(0)
        while head:
            if head.val < x:
                before.next = head
                before = before.next
            else:
                after.next = head
                after = after.next
            head = head.next
        after.next = None
        before.next = after_head.next
        return before_head.next`,
    jsCode: `var partition = function(head, x) {
    const beforeHead = new ListNode(0);
    const afterHead = new ListNode(0);
    let before = beforeHead, after = afterHead;
    while (head) {
        if (head.val < x) {
            before.next = head;
            before = before.next;
        } else {
            after.next = head;
            after = after.next;
        }
        head = head.next;
    }
    after.next = null;
    before.next = afterHead.next;
    return beforeHead.next;
};`,
    explanation:
      '1. Create two dummy-headed lists: before (< x) and after (>= x).\n' +
      '2. Iterate through the original list, appending to the correct partition.\n' +
      '3. Terminate the after list with None to avoid cycles.\n' +
      '4. Connect before list tail to after list head.\n' +
      '5. Return the head of the before list (dummy.next).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Build two separate lists and merge them at the end.',
      'One list holds nodes < x, the other holds nodes >= x.',
      'Do not forget to set the tail of the second list to None.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 87. Scramble String
  // ---------------------------------------------------------------------------
  {
    id: 87,
    description:
      'We can scramble a string s to get string t using a recursive algorithm: pick a random index and split the string into two non-empty substrings, then optionally swap the two substrings and recursively scramble each. Given two strings s1 and s2 of the same length, return true if s2 is a scrambled string of s1.',
    examples:
      'Input: s1 = "great", s2 = "rgeat"\nOutput: true',
    intuition:
      'Think of cutting a string in two and optionally swapping the pieces, then recursively doing the same to each piece. Two strings are scrambles if you can find a split point where either the straight or swapped halves match recursively. Character frequency comparison prunes impossible cases early.',
    approach:
      'Use memoized recursion. For each possible split point, check two cases: no swap (left matches left, right matches right) and swap (left matches right suffix, right matches left prefix). Prune with character frequency check.',
    code: `class Solution:
    def isScramble(self, s1: str, s2: str) -> bool:
        from functools import lru_cache
        @lru_cache(maxsize=None)
        def dp(a, b):
            if a == b:
                return True
            if sorted(a) != sorted(b):
                return False
            n = len(a)
            for i in range(1, n):
                if dp(a[:i], b[:i]) and dp(a[i:], b[i:]):
                    return True
                if dp(a[:i], b[n-i:]) and dp(a[i:], b[:n-i]):
                    return True
            return False
        return dp(s1, s2)`,
    jsCode: `var isScramble = function(s1, s2) {
    const memo = new Map();
    function dp(a, b) {
        const key = a + '#' + b;
        if (memo.has(key)) return memo.get(key);
        if (a === b) { memo.set(key, true); return true; }
        if ([...a].sort().join('') !== [...b].sort().join('')) {
            memo.set(key, false);
            return false;
        }
        const n = a.length;
        for (let i = 1; i < n; i++) {
            if ((dp(a.slice(0, i), b.slice(0, i)) && dp(a.slice(i), b.slice(i))) ||
                (dp(a.slice(0, i), b.slice(n - i)) && dp(a.slice(i), b.slice(0, n - i)))) {
                memo.set(key, true);
                return true;
            }
        }
        memo.set(key, false);
        return false;
    }
    return dp(s1, s2);
};`,
    explanation:
      '1. Base case: if strings are equal, return True.\n' +
      '2. Prune: if sorted characters differ, return False.\n' +
      '3. Try every split point i from 1 to n-1.\n' +
      '4. No-swap case: a[:i] matches b[:i] and a[i:] matches b[i:].\n' +
      '5. Swap case: a[:i] matches b[n-i:] and a[i:] matches b[:n-i]. Memoize results.',
    timeComplexity: 'O(n^4)',
    spaceComplexity: 'O(n^3)',
    hints: [
      'Try every possible split point and check both swap and no-swap cases.',
      'Use memoization to avoid recomputing the same subproblems.',
      'Prune early by checking if the two strings have the same character frequencies.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 89. Gray Code
  // ---------------------------------------------------------------------------
  {
    id: 89,
    description:
      'An n-bit gray code sequence is a sequence of 2^n integers where every two successive values differ in exactly one bit, the first and last values also differ in exactly one bit, and every value is in [0, 2^n - 1]. Return any valid n-bit gray code sequence starting with 0.',
    examples:
      'Input: n = 2\nOutput: [0,1,3,2]',
    intuition:
      'Each Gray code differs from the previous by exactly one bit. The elegant formula i XOR (i >> 1) generates this sequence directly. Alternatively, you can build it iteratively: reflect the current sequence and add a leading 1-bit to the reflected half.',
    approach:
      'Use the formula: the ith gray code is i XOR (i >> 1). Generate all 2^n values using this formula. Alternatively, build iteratively by reflecting the previous sequence and adding 2^(k-1).',
    code: `class Solution:
    def grayCode(self, n: int) -> list[int]:
        return [i ^ (i >> 1) for i in range(1 << n)]`,
    jsCode: `var grayCode = function(n) {
    const result = [];
    for (let i = 0; i < (1 << n); i++) {
        result.push(i ^ (i >> 1));
    }
    return result;
};`,
    explanation:
      '1. The ith Gray code value is i XOR (i >> 1).\n' +
      '2. This formula ensures consecutive values differ by exactly one bit.\n' +
      '3. Generate all values from 0 to 2^n - 1.\n' +
      '4. The XOR with right-shifted value flips exactly the right bits.\n' +
      '5. This produces a valid Gray code sequence starting with 0.',
    timeComplexity: 'O(2^n)',
    spaceComplexity: 'O(2^n)',
    hints: [
      'There is a direct formula: gray(i) = i XOR (i >> 1).',
      'Alternatively, build the sequence by reflecting the previous level.',
      'Each Gray code differs from the previous by exactly one bit.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 92. Reverse Linked List II
  // ---------------------------------------------------------------------------
  {
    id: 92,
    description:
      'Given the head of a singly linked list and two integers left and right where left <= right, reverse the nodes of the list from position left to position right, and return the reversed list. Positions are 1-indexed.',
    examples:
      'Input: head = [1,2,3,4,5], left = 2, right = 4\nOutput: [1,4,3,2,5]',
    intuition:
      'Instead of actually removing and reinserting nodes, keep a pointer just before the reversal zone and repeatedly move the next node to the front of the reversed section. This \'thread-through\' technique reverses the sublist in one pass without extra space.',
    approach:
      'Navigate to the node just before position left. Then reverse the sublist from left to right by repeatedly moving the next node to the front of the reversed section.',
    code: `class Solution:
    def reverseBetween(self, head, left: int, right: int):
        dummy = ListNode(0, head)
        prev = dummy
        for _ in range(left - 1):
            prev = prev.next
        curr = prev.next
        for _ in range(right - left):
            nxt = curr.next
            curr.next = nxt.next
            nxt.next = prev.next
            prev.next = nxt
        return dummy.next`,
    jsCode: `var reverseBetween = function(head, left, right) {
    const dummy = new ListNode(0, head);
    let prev = dummy;
    for (let i = 0; i < left - 1; i++) prev = prev.next;
    let curr = prev.next;
    for (let i = 0; i < right - left; i++) {
        const nxt = curr.next;
        curr.next = nxt.next;
        nxt.next = prev.next;
        prev.next = nxt;
    }
    return dummy.next;
};`,
    explanation:
      '1. Use a dummy node and advance prev to the node before position left.\n' +
      '2. curr starts at position left.\n' +
      '3. For each step, take the node after curr and move it to right after prev.\n' +
      '4. This effectively reverses the sublist one node at a time.\n' +
      '5. After (right - left) iterations, the sublist is fully reversed.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Use a dummy node to handle the case where left = 1.',
      'Find the node just before position left.',
      'Reverse by repeatedly moving the next node to the front of the reversed section.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 93. Restore IP Addresses
  // ---------------------------------------------------------------------------
  {
    id: 93,
    description:
      'A valid IP address consists of exactly four integers separated by dots. Each integer is between 0 and 255 and cannot have leading zeros. Given a string s containing only digits, return all possible valid IP addresses that can be formed by inserting dots into s.',
    examples:
      'Input: s = "25525511135"\nOutput: ["255.255.11.135","255.255.111.35"]',
    intuition:
      'This is a constrained backtracking problem. At each step, try taking 1, 2, or 3 digits for the current IP segment. The constraints (0-255, no leading zeros, exactly 4 segments) prune most branches, making the search space small and fast.',
    approach:
      'Use backtracking to try placing dots at every valid position. At each step, try taking 1, 2, or 3 digits for the current segment, validating each segment is between 0-255 with no leading zeros.',
    code: `class Solution:
    def restoreIpAddresses(self, s: str) -> list[str]:
        res = []
        def backtrack(start, parts):
            if len(parts) == 4:
                if start == len(s):
                    res.append('.'.join(parts))
                return
            for length in range(1, 4):
                if start + length > len(s):
                    break
                segment = s[start:start + length]
                if (segment[0] == '0' and length > 1) or int(segment) > 255:
                    continue
                backtrack(start + length, parts + [segment])
        backtrack(0, [])
        return res`,
    jsCode: `var restoreIpAddresses = function(s) {
    const res = [];
    function backtrack(start, parts) {
        if (parts.length === 4) {
            if (start === s.length) res.push(parts.join('.'));
            return;
        }
        for (let len = 1; len <= 3; len++) {
            if (start + len > s.length) break;
            const segment = s.substring(start, start + len);
            if ((segment[0] === '0' && len > 1) || Number(segment) > 255) continue;
            backtrack(start + len, [...parts, segment]);
        }
    }
    backtrack(0, []);
    return res;
};`,
    explanation:
      '1. Backtrack by choosing 1, 2, or 3 digits for each of the 4 segments.\n' +
      '2. Validate each segment: no leading zeros and value <= 255.\n' +
      '3. When we have 4 segments and consumed all digits, record the IP.\n' +
      '4. Prune early if remaining digits cannot form valid segments.\n' +
      '5. Join segments with dots for the final result.',
    timeComplexity: 'O(1) - at most 27 combinations',
    spaceComplexity: 'O(1)',
    hints: [
      'An IP address has exactly 4 parts, each 1-3 digits.',
      'Each part must be 0-255 with no leading zeros (except "0" itself).',
      'Use backtracking to try all valid splits.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 95. Unique Binary Search Trees II
  // ---------------------------------------------------------------------------
  {
    id: 95,
    description:
      'Given an integer n, return all the structurally unique BSTs which have exactly n nodes of unique values from 1 to n. Return the root nodes of all possible trees.',
    examples:
      'Input: n = 3\nOutput: [[1,null,2,null,3],[1,null,3,2],[2,1,3],[3,1,null,null,2],[3,2,null,1]]',
    intuition:
      'For a range of values [1..n], each value i can be the root. Its left subtree uses values [1..i-1] and its right subtree uses [i+1..n]. Generate all left and right subtrees recursively, then combine every left-right pair with root i. This Cartesian product approach naturally produces all valid BSTs.',
    approach:
      'Use recursive divide-and-conquer. For each possible root value i, recursively generate all left subtrees from [start, i-1] and all right subtrees from [i+1, end]. Combine each left-right pair with root i.',
    code: `class Solution:
    def generateTrees(self, n: int):
        def build(lo, hi):
            if lo > hi:
                return [None]
            trees = []
            for i in range(lo, hi + 1):
                for left in build(lo, i - 1):
                    for right in build(i + 1, hi):
                        root = TreeNode(i, left, right)
                        trees.append(root)
            return trees
        return build(1, n) if n else []`,
    jsCode: `var generateTrees = function(n) {
    if (!n) return [];
    function build(lo, hi) {
        if (lo > hi) return [null];
        const trees = [];
        for (let i = lo; i <= hi; i++) {
            for (const left of build(lo, i - 1)) {
                for (const right of build(i + 1, hi)) {
                    const root = new TreeNode(i, left, right);
                    trees.push(root);
                }
            }
        }
        return trees;
    }
    return build(1, n);
};`,
    explanation:
      '1. For range [lo, hi], try each value i as the root.\n' +
      '2. Recursively build all left subtrees from [lo, i-1].\n' +
      '3. Recursively build all right subtrees from [i+1, hi].\n' +
      '4. Combine each (left, right) pair with root i.\n' +
      '5. Base case: empty range returns [None] (null subtree).',
    timeComplexity: 'O(4^n / n^(3/2)) - Catalan number',
    spaceComplexity: 'O(4^n / n^(3/2))',
    hints: [
      'For each possible root, the left subtree uses smaller values and right uses larger.',
      'Recursively generate all possible left and right subtrees.',
      'Combine every pair of left and right subtrees with the chosen root.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 96. Unique Binary Search Trees
  // ---------------------------------------------------------------------------
  {
    id: 96,
    description:
      'Given an integer n, return the number of structurally unique BSTs which have exactly n nodes of unique values from 1 to n.',
    examples:
      'Input: n = 3\nOutput: 5',
    intuition:
      'The number of unique BSTs with n nodes follows the Catalan number pattern. If node i is the root, there are dp[i-1] left subtrees and dp[n-i] right subtrees, giving dp[i-1] * dp[n-i] combinations. Sum over all possible roots to get dp[n].',
    approach:
      'Use dynamic programming based on the Catalan number formula. dp[i] = sum of dp[j-1] * dp[i-j] for j from 1 to i, where dp[j-1] counts left subtrees and dp[i-j] counts right subtrees.',
    code: `class Solution:
    def numTrees(self, n: int) -> int:
        dp = [0] * (n + 1)
        dp[0] = dp[1] = 1
        for i in range(2, n + 1):
            for j in range(1, i + 1):
                dp[i] += dp[j - 1] * dp[i - j]
        return dp[n]`,
    jsCode: `var numTrees = function(n) {
    const dp = Array(n + 1).fill(0);
    dp[0] = dp[1] = 1;
    for (let i = 2; i <= n; i++) {
        for (let j = 1; j <= i; j++) {
            dp[i] += dp[j - 1] * dp[i - j];
        }
    }
    return dp[n];
};`,
    explanation:
      '1. dp[i] = number of unique BSTs with i nodes.\n' +
      '2. Base cases: dp[0] = dp[1] = 1.\n' +
      '3. For i nodes, try each value j as root (1 to i).\n' +
      '4. Left subtree has j-1 nodes, right subtree has i-j nodes.\n' +
      '5. dp[i] = sum of dp[j-1] * dp[i-j] for all j. This is the Catalan number.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    hints: [
      'The answer is the nth Catalan number.',
      'For each root choice, left and right subtree counts multiply.',
      'dp[n] = sum of dp[i] * dp[n-1-i] for i from 0 to n-1.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 97. Interleaving String
  // ---------------------------------------------------------------------------
  {
    id: 97,
    description:
      'Given strings s1, s2, and s3, find whether s3 is formed by an interleaving of s1 and s2. An interleaving is a configuration where s3 contains all characters of s1 and s2 while preserving the order of characters from each string.',
    examples:
      'Input: s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"\nOutput: true',
    intuition:
      'Think of two people taking turns spelling out a word, each contributing characters from their own string in order. Use a 2D DP table where dp[i][j] asks: can the first i characters of s1 and first j characters of s2 interleave to form the first i+j characters of s3?',
    approach:
      'Use 2D dynamic programming. dp[i][j] = whether s3[:i+j] can be formed by interleaving s1[:i] and s2[:j]. Check if the next character in s3 matches the next character from s1 or s2.',
    code: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        m, n = len(s1), len(s2)
        if m + n != len(s3):
            return False
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for i in range(m + 1):
            for j in range(n + 1):
                if i > 0 and s1[i - 1] == s3[i + j - 1]:
                    dp[i][j] = dp[i][j] or dp[i - 1][j]
                if j > 0 and s2[j - 1] == s3[i + j - 1]:
                    dp[i][j] = dp[i][j] or dp[i][j - 1]
        return dp[m][n]`,
    jsCode: `var isInterleave = function(s1, s2, s3) {
    const m = s1.length, n = s2.length;
    if (m + n !== s3.length) return false;
    const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(false));
    dp[0][0] = true;
    for (let i = 0; i <= m; i++) {
        for (let j = 0; j <= n; j++) {
            if (i > 0 && s1[i - 1] === s3[i + j - 1]) {
                dp[i][j] = dp[i][j] || dp[i - 1][j];
            }
            if (j > 0 && s2[j - 1] === s3[i + j - 1]) {
                dp[i][j] = dp[i][j] || dp[i][j - 1];
            }
        }
    }
    return dp[m][n];
};`,
    explanation:
      '1. If len(s1) + len(s2) != len(s3), return False immediately.\n' +
      '2. dp[i][j] = can s3[:i+j] be formed from s1[:i] and s2[:j].\n' +
      '3. If s1[i-1] == s3[i+j-1], we can extend from dp[i-1][j].\n' +
      '4. If s2[j-1] == s3[i+j-1], we can extend from dp[i][j-1].\n' +
      '5. Answer is dp[m][n].',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'The length check is an important early termination.',
      'Think of it as choosing the next character from s1 or s2 to match s3.',
      'dp[i][j] depends on dp[i-1][j] and dp[i][j-1].',
    ],
  },

  // ---------------------------------------------------------------------------
  // 99. Recover Binary Search Tree
  // ---------------------------------------------------------------------------
  {
    id: 99,
    description:
      'You are given the root of a binary search tree (BST), where the values of exactly two nodes of the tree were swapped by mistake. Recover the tree without changing its structure.',
    examples:
      'Input: root = [1,3,null,null,2]\nOutput: [3,1,null,null,2]\nExplanation: 3 and 1 are swapped.',
    intuition:
      'In a valid BST, an in-order traversal produces sorted values. If two nodes are swapped, you\'ll find one or two places where the order is violated. Track these violations during traversal to identify the two swapped nodes, then swap their values back.',
    approach:
      'Perform an in-order traversal of the BST. In a valid BST, in-order gives sorted values. Find the two places where the order is violated. The first violation gives the first swapped node, the second violation gives the second. Swap their values.',
    code: `class Solution:
    def recoverTree(self, root) -> None:
        self.first = self.second = None
        self.prev = TreeNode(float('-inf'))

        def inorder(node):
            if not node:
                return
            inorder(node.left)
            if self.prev.val > node.val:
                if not self.first:
                    self.first = self.prev
                self.second = node
            self.prev = node
            inorder(node.right)

        inorder(root)
        self.first.val, self.second.val = self.second.val, self.first.val`,
    jsCode: `var recoverTree = function(root) {
    let first = null, second = null;
    let prev = new TreeNode(-Infinity);
    function inorder(node) {
        if (!node) return;
        inorder(node.left);
        if (prev.val > node.val) {
            if (!first) first = prev;
            second = node;
        }
        prev = node;
        inorder(node.right);
    }
    inorder(root);
    [first.val, second.val] = [second.val, first.val];
};`,
    explanation:
      '1. In-order traversal of a valid BST produces sorted values.\n' +
      '2. Two swapped nodes create one or two inversions in the in-order sequence.\n' +
      '3. First inversion: first = prev (the larger misplaced node).\n' +
      '4. Second inversion: second = current (the smaller misplaced node).\n' +
      '5. Swap the values of first and second to fix the BST.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) for recursion stack',
    hints: [
      'In-order traversal of a BST should give sorted values.',
      'Find where the sorted order is violated.',
      'There will be one or two inversions - the first node of the first inversion and the second node of the last inversion are swapped.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 101. Symmetric Tree
  // ---------------------------------------------------------------------------
  {
    id: 101,
    description:
      'Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).',
    examples:
      'Input: root = [1,2,2,3,4,4,3]\nOutput: true',
    intuition:
      'A tree is symmetric if its left subtree is a mirror image of its right subtree. Two subtrees are mirrors when their roots are equal, the left child of one mirrors the right child of the other, and vice versa. This naturally leads to a recursive comparison.',
    approach:
      'Use recursion or iteration to compare the left and right subtrees. Two subtrees are mirrors if their roots are equal, the left subtree of one mirrors the right subtree of the other, and vice versa.',
    code: `class Solution:
    def isSymmetric(self, root) -> bool:
        def isMirror(t1, t2):
            if not t1 and not t2:
                return True
            if not t1 or not t2:
                return False
            return (t1.val == t2.val and
                    isMirror(t1.left, t2.right) and
                    isMirror(t1.right, t2.left))
        return isMirror(root, root)`,
    jsCode: `var isSymmetric = function(root) {
    function isMirror(t1, t2) {
        if (!t1 && !t2) return true;
        if (!t1 || !t2) return false;
        return t1.val === t2.val &&
            isMirror(t1.left, t2.right) &&
            isMirror(t1.right, t2.left);
    }
    return isMirror(root, root);
};`,
    explanation:
      '1. Two trees are mirrors if both are None, or both exist with equal values.\n' +
      '2. Additionally, left subtree of t1 must mirror right subtree of t2.\n' +
      '3. And right subtree of t1 must mirror left subtree of t2.\n' +
      '4. Start by comparing root with itself.\n' +
      '5. Recursion naturally handles all levels of the tree.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'A tree is symmetric if the left and right subtrees are mirror images.',
      'Compare left.left with right.right and left.right with right.left.',
      'Both null nodes are considered symmetric.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 103. Binary Tree Zigzag Level Order Traversal
  // ---------------------------------------------------------------------------
  {
    id: 103,
    description:
      'Given the root of a binary tree, return the zigzag level order traversal of its nodes values (i.e., from left to right, then right to left for the next level and alternate between).',
    examples:
      'Input: root = [3,9,20,null,null,15,7]\nOutput: [[3],[20,9],[15,7]]',
    intuition:
      'This is level-order traversal with a twist: alternate levels are read in opposite directions. Use standard BFS, but reverse the values for odd-numbered levels. A deque can also handle this by alternating the end from which you read values.',
    approach:
      'Use BFS with a queue. Process level by level. For even levels, append values left-to-right; for odd levels, reverse the order (or use a deque to prepend).',
    code: `class Solution:
    def zigzagLevelOrder(self, root) -> list[list[int]]:
        if not root:
            return []
        from collections import deque
        queue = deque([root])
        res = []
        left_to_right = True
        while queue:
            level = deque()
            for _ in range(len(queue)):
                node = queue.popleft()
                if left_to_right:
                    level.append(node.val)
                else:
                    level.appendleft(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            res.append(list(level))
            left_to_right = not left_to_right
        return res`,
    jsCode: `var zigzagLevelOrder = function(root) {
    if (!root) return [];
    const queue = [root];
    const res = [];
    let leftToRight = true;
    while (queue.length) {
        const level = [];
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            if (leftToRight) level.push(node.val);
            else level.unshift(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        res.push(level);
        leftToRight = !leftToRight;
    }
    return res;
};`,
    explanation:
      '1. Standard BFS level-order traversal.\n' +
      '2. Use a flag left_to_right that alternates each level.\n' +
      '3. When left_to_right, append to level normally.\n' +
      '4. When right_to_left, prepend to level using deque.appendleft.\n' +
      '5. Toggle the flag after each level.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Start with standard level-order BFS traversal.',
      'Alternate the order of insertion for each level.',
      'A deque makes it easy to prepend for right-to-left levels.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 106. Construct Binary Tree from Inorder and Postorder Traversal
  // ---------------------------------------------------------------------------
  {
    id: 106,
    description:
      'Given two integer arrays inorder and postorder where inorder is the inorder traversal and postorder is the postorder traversal of a binary tree, construct and return the binary tree.',
    examples:
      'Input: inorder = [9,3,15,20,7], postorder = [9,15,7,20,3]\nOutput: [3,9,20,null,null,15,7]',
    intuition:
      'The last element of postorder is always the root. Find that root in the inorder array to determine which elements belong to the left vs. right subtree. Process postorder from right to left, building the right subtree before the left, since postorder visits right subtrees later.',
    approach:
      'The last element of postorder is the root. Find it in inorder to split into left and right subtrees. Recursively build right subtree first (since postorder processes right before left when going backwards), then left subtree.',
    code: `class Solution:
    def buildTree(self, inorder: list[int], postorder: list[int]):
        inorder_map = {v: i for i, v in enumerate(inorder)}
        self.post_idx = len(postorder) - 1

        def build(lo, hi):
            if lo > hi:
                return None
            val = postorder[self.post_idx]
            self.post_idx -= 1
            root = TreeNode(val)
            mid = inorder_map[val]
            root.right = build(mid + 1, hi)
            root.left = build(lo, mid - 1)
            return root

        return build(0, len(inorder) - 1)`,
    jsCode: `var buildTree = function(inorder, postorder) {
    const inorderMap = new Map();
    inorder.forEach((v, i) => inorderMap.set(v, i));
    let postIdx = postorder.length - 1;
    function build(lo, hi) {
        if (lo > hi) return null;
        const val = postorder[postIdx--];
        const root = new TreeNode(val);
        const mid = inorderMap.get(val);
        root.right = build(mid + 1, hi);
        root.left = build(lo, mid - 1);
        return root;
    }
    return build(0, inorder.length - 1);
};`,
    explanation:
      '1. Build a map from value to index in inorder for O(1) lookup.\n' +
      '2. Start from the last element of postorder (the root).\n' +
      '3. Find root in inorder to determine left and right subtree ranges.\n' +
      '4. Build right subtree first (postorder: left, right, root - so right is before root).\n' +
      '5. Then build left subtree. Decrement post_idx each time we create a node.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The last element of postorder is always the root.',
      'Use inorder to determine which elements go in the left vs right subtree.',
      'Build right subtree before left when consuming postorder from the end.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 107. Binary Tree Level Order Traversal II
  // ---------------------------------------------------------------------------
  {
    id: 107,
    description:
      'Given the root of a binary tree, return the bottom-up level order traversal of its nodes values (i.e., from left to right, level by level from leaf to root).',
    examples:
      'Input: root = [3,9,20,null,null,15,7]\nOutput: [[15,7],[9,20],[3]]',
    intuition:
      'This is standard level-order BFS with the result reversed at the end. Alternatively, insert each level\'s values at the beginning of the result list. Either way, you get bottom-up level order from a top-down traversal.',
    approach:
      'Perform standard BFS level-order traversal and then reverse the result. Or, insert each level at the beginning of the result list.',
    code: `class Solution:
    def levelOrderBottom(self, root) -> list[list[int]]:
        if not root:
            return []
        from collections import deque
        queue = deque([root])
        res = []
        while queue:
            level = []
            for _ in range(len(queue)):
                node = queue.popleft()
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            res.append(level)
        return res[::-1]`,
    jsCode: `var levelOrderBottom = function(root) {
    if (!root) return [];
    const queue = [root];
    const res = [];
    while (queue.length) {
        const level = [];
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        res.push(level);
    }
    return res.reverse();
};`,
    explanation:
      '1. Perform standard BFS level-order traversal.\n' +
      '2. Collect each level as a list of values.\n' +
      '3. Append each level to the result.\n' +
      '4. Reverse the result at the end for bottom-up order.\n' +
      '5. Alternatively, use res.insert(0, level) but reversing at end is more efficient.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Start with standard level-order BFS traversal.',
      'The simplest approach is to reverse the result at the end.',
      'Alternatively, insert each level at the front of the result list.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 109. Convert Sorted List to Binary Search Tree
  // ---------------------------------------------------------------------------
  {
    id: 109,
    description:
      'Given the head of a singly linked list where elements are sorted in ascending order, convert it to a height-balanced binary search tree.',
    examples:
      'Input: head = [-10,-3,0,5,9]\nOutput: [0,-3,9,-10,null,5]',
    intuition:
      'A sorted list maps directly to a balanced BST: the middle element becomes the root, the left half becomes the left subtree, and the right half becomes the right subtree. Use the slow/fast pointer technique to find the middle without converting to an array.',
    approach:
      'Use the slow/fast pointer technique to find the middle of the list as the root. Recursively build the left subtree from the first half and the right subtree from the second half.',
    code: `class Solution:
    def sortedListToBST(self, head):
        if not head:
            return None
        if not head.next:
            return TreeNode(head.val)
        prev, slow, fast = None, head, head
        while fast and fast.next:
            prev = slow
            slow = slow.next
            fast = fast.next.next
        prev.next = None
        root = TreeNode(slow.val)
        root.left = self.sortedListToBST(head)
        root.right = self.sortedListToBST(slow.next)
        return root`,
    jsCode: `var sortedListToBST = function(head) {
    if (!head) return null;
    if (!head.next) return new TreeNode(head.val);
    let prev = null, slow = head, fast = head;
    while (fast && fast.next) {
        prev = slow;
        slow = slow.next;
        fast = fast.next.next;
    }
    prev.next = null;
    const root = new TreeNode(slow.val);
    root.left = sortedListToBST(head);
    root.right = sortedListToBST(slow.next);
    return root;
};`,
    explanation:
      '1. Find the middle node using slow/fast pointers.\n' +
      '2. The middle node becomes the root (ensures balance).\n' +
      '3. Cut the list before the middle to separate the left half.\n' +
      '4. Recursively build left subtree from the left half.\n' +
      '5. Recursively build right subtree from the right half (after middle).',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    hints: [
      'The middle element of a sorted list should be the root for balance.',
      'Use slow/fast pointers to find the middle.',
      'Split the list into two halves and recurse.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 111. Minimum Depth of Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 111,
    description:
      'Given a binary tree, find its minimum depth. The minimum depth is the number of nodes along the shortest path from the root node down to the nearest leaf node. A leaf is a node with no children.',
    examples:
      'Input: root = [3,9,20,null,null,15,7]\nOutput: 2',
    intuition:
      'Unlike maximum depth, minimum depth requires finding the shallowest leaf. BFS is ideal here because it processes nodes level by level and returns immediately upon finding the first leaf. DFS would need to traverse the entire tree to be sure.',
    approach:
      'Use BFS for optimal performance. Process level by level and return the depth of the first leaf node encountered. This avoids traversing the entire tree.',
    code: `class Solution:
    def minDepth(self, root) -> int:
        if not root:
            return 0
        from collections import deque
        queue = deque([(root, 1)])
        while queue:
            node, depth = queue.popleft()
            if not node.left and not node.right:
                return depth
            if node.left:
                queue.append((node.left, depth + 1))
            if node.right:
                queue.append((node.right, depth + 1))
        return 0`,
    jsCode: `var minDepth = function(root) {
    if (!root) return 0;
    const queue = [[root, 1]];
    while (queue.length) {
        const [node, depth] = queue.shift();
        if (!node.left && !node.right) return depth;
        if (node.left) queue.push([node.left, depth + 1]);
        if (node.right) queue.push([node.right, depth + 1]);
    }
    return 0;
};`,
    explanation:
      '1. BFS processes nodes level by level.\n' +
      '2. Track depth alongside each node in the queue.\n' +
      '3. The first leaf node (no children) found is at the minimum depth.\n' +
      '4. Return immediately when the first leaf is found.\n' +
      '5. BFS guarantees we find the shallowest leaf first.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'BFS finds the shallowest leaf first.',
      'A leaf node has no left or right children.',
      'Be careful: a node with only one child is not a leaf.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 112. Path Sum
  // ---------------------------------------------------------------------------
  {
    id: 112,
    description:
      'Given the root of a binary tree and an integer targetSum, return true if the tree has a root-to-leaf path such that adding up all the values along the path equals targetSum. A leaf is a node with no children.',
    examples:
      'Input: root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22\nOutput: true',
    intuition:
      'Subtract the current node\'s value from the target as you go down. At each leaf, check if the remaining target is zero. This transforms the problem from \'find a path summing to target\' into \'find a leaf where the running subtraction reaches zero.\'',
    approach:
      'Use DFS recursion. At each node, subtract the node value from targetSum. At a leaf, check if the remaining sum is 0. Recurse on left and right children.',
    code: `class Solution:
    def hasPathSum(self, root, targetSum: int) -> bool:
        if not root:
            return False
        targetSum -= root.val
        if not root.left and not root.right:
            return targetSum == 0
        return (self.hasPathSum(root.left, targetSum) or
                self.hasPathSum(root.right, targetSum))`,
    jsCode: `var hasPathSum = function(root, targetSum) {
    if (!root) return false;
    targetSum -= root.val;
    if (!root.left && !root.right) return targetSum === 0;
    return hasPathSum(root.left, targetSum) || hasPathSum(root.right, targetSum);
};`,
    explanation:
      '1. If root is None, return False.\n' +
      '2. Subtract current node value from targetSum.\n' +
      '3. If current node is a leaf, check if targetSum is exactly 0.\n' +
      '4. Otherwise, recursively check left and right subtrees.\n' +
      '5. Return True if either subtree has a valid path.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'Subtract the current node value as you go deeper.',
      'Only check the sum at leaf nodes.',
      'A node with no children is a leaf.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 113. Path Sum II
  // ---------------------------------------------------------------------------
  {
    id: 113,
    description:
      'Given the root of a binary tree and an integer targetSum, return all root-to-leaf paths where the sum of the node values in the path equals targetSum. Each path should be returned as a list of node values.',
    examples:
      'Input: root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22\nOutput: [[5,4,11,2],[5,8,4,5]]',
    intuition:
      'This extends Path Sum by collecting all valid paths, not just checking existence. Use backtracking: maintain a current path list, add nodes as you go down, and when you reach a valid leaf, save a copy of the path. Remove the last node when backtracking up.',
    approach:
      'Use DFS backtracking. Maintain a current path list. At each leaf, if the remaining sum equals the leaf value, add a copy of the path to results. Backtrack by removing the last element after recursion.',
    code: `class Solution:
    def pathSum(self, root, targetSum: int) -> list[list[int]]:
        res = []
        def dfs(node, remain, path):
            if not node:
                return
            path.append(node.val)
            if not node.left and not node.right and remain == node.val:
                res.append(list(path))
            dfs(node.left, remain - node.val, path)
            dfs(node.right, remain - node.val, path)
            path.pop()
        dfs(root, targetSum, [])
        return res`,
    jsCode: `var pathSum = function(root, targetSum) {
    const res = [];
    function dfs(node, remain, path) {
        if (!node) return;
        path.push(node.val);
        if (!node.left && !node.right && remain === node.val) {
            res.push([...path]);
        }
        dfs(node.left, remain - node.val, path);
        dfs(node.right, remain - node.val, path);
        path.pop();
    }
    dfs(root, targetSum, []);
    return res;
};`,
    explanation:
      '1. DFS with a running path list and remaining target sum.\n' +
      '2. Add the current node to the path.\n' +
      '3. At a leaf, if remain equals the leaf value, save a copy of the path.\n' +
      '4. Recurse on children with updated remaining sum.\n' +
      '5. Backtrack by popping the current node from the path.',
    timeComplexity: 'O(n^2) worst case for copying paths',
    spaceComplexity: 'O(n)',
    hints: [
      'Extend Path Sum I to collect all valid paths.',
      'Use backtracking: add the node, recurse, then remove it.',
      'Remember to copy the path when adding to results.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 114. Flatten Binary Tree to Linked List
  // ---------------------------------------------------------------------------
  {
    id: 114,
    description:
      'Given the root of a binary tree, flatten the tree into a "linked list" using the right pointers, in the same order as a pre-order traversal. Every node\'s left pointer should be null.',
    examples:
      'Input: root = [1,2,5,3,4,null,6]\nOutput: [1,null,2,null,3,null,4,null,5,null,6]',
    intuition:
      'Process the tree in reverse pre-order (right, left, root). Keep a pointer to the previously processed node. For each node, set its right child to the previous node and its left child to null. This threads the tree into a linked list without extra space.',
    approach:
      'Process the tree using a reverse pre-order traversal (right, left, root). Keep a prev pointer to the previously processed node. Set each node\'s right to prev and left to null.',
    code: `class Solution:
    def flatten(self, root) -> None:
        self.prev = None
        def dfs(node):
            if not node:
                return
            dfs(node.right)
            dfs(node.left)
            node.right = self.prev
            node.left = None
            self.prev = node
        dfs(root)`,
    jsCode: `var flatten = function(root) {
    let prev = null;
    function dfs(node) {
        if (!node) return;
        dfs(node.right);
        dfs(node.left);
        node.right = prev;
        node.left = null;
        prev = node;
    }
    dfs(root);
};`,
    explanation:
      '1. Process in reverse pre-order: right subtree, left subtree, then root.\n' +
      '2. prev tracks the previously processed node (which becomes the next in the list).\n' +
      '3. Set node.right = prev and node.left = None.\n' +
      '4. Update prev to the current node.\n' +
      '5. This builds the flattened list from the tail backwards.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'Think about what order you need to process nodes.',
      'If you process right, left, root (reverse pre-order), you can build the list backwards.',
      'Keep a pointer to the previously processed node.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 115. Distinct Subsequences
  // ---------------------------------------------------------------------------
  {
    id: 115,
    description:
      'Given two strings s and t, return the number of distinct subsequences of s which equals t. A subsequence is a string that can be derived from another string by deleting some or no characters without changing the order.',
    examples:
      'Input: s = "rabbbit", t = "rabbit"\nOutput: 3',
    intuition:
      'Think of it as choosing which characters in s to \'highlight\' to spell out t. For each character in s, you either use it (if it matches the current character in t) or skip it. The DP counts all ways to make these choices, building up from smaller subproblems.',
    approach:
      'Use 2D DP where dp[i][j] = number of ways to form t[:j] from s[:i]. If s[i-1] == t[j-1], dp[i][j] = dp[i-1][j-1] + dp[i-1][j]. Otherwise, dp[i][j] = dp[i-1][j].',
    code: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        m, n = len(s), len(t)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = 1
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                dp[i][j] = dp[i - 1][j]
                if s[i - 1] == t[j - 1]:
                    dp[i][j] += dp[i - 1][j - 1]
        return dp[m][n]`,
    jsCode: `var numDistinct = function(s, t) {
    const m = s.length, n = t.length;
    const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = 1;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = dp[i - 1][j];
            if (s[i - 1] === t[j - 1]) {
                dp[i][j] += dp[i - 1][j - 1];
            }
        }
    }
    return dp[m][n];
};`,
    explanation:
      '1. dp[i][j] = number of ways to form t[:j] as a subsequence of s[:i].\n' +
      '2. Base case: dp[i][0] = 1 (empty t can be formed from any prefix of s).\n' +
      '3. If characters match, either use s[i-1] (dp[i-1][j-1]) or skip it (dp[i-1][j]).\n' +
      '4. If characters do not match, must skip s[i-1]: dp[i][j] = dp[i-1][j].\n' +
      '5. Answer is dp[m][n].',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'For each character in s, you can either include it or skip it.',
      'dp[i][j] depends on whether s[i-1] matches t[j-1].',
      'The base case is that an empty t has exactly one subsequence match.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 116. Populating Next Right Pointers in Each Node
  // ---------------------------------------------------------------------------
  {
    id: 116,
    description:
      'You are given a perfect binary tree where all leaves are on the same level. Populate each next pointer to point to its next right node. If there is no next right node, the next pointer should be set to NULL. Initially, all next pointers are set to NULL.',
    examples:
      'Input: root = [1,2,3,4,5,6,7]\nOutput: [1,#,2,3,#,4,5,6,7,#]',
    intuition:
      'In a perfect binary tree, each node\'s left child connects to its right child, and each node\'s right child connects to the left child of the node\'s next sibling. The already-established next pointers at the current level let you traverse siblings to make these connections for the level below.',
    approach:
      'Use the already-established next pointers to traverse each level. For each node, connect left.next = right, and right.next = node.next.left (if node.next exists). Process level by level from top.',
    code: `class Solution:
    def connect(self, root):
        if not root:
            return root
        leftmost = root
        while leftmost.left:
            head = leftmost
            while head:
                head.left.next = head.right
                if head.next:
                    head.right.next = head.next.left
                head = head.next
            leftmost = leftmost.left
        return root`,
    jsCode: `var connect = function(root) {
    if (!root) return root;
    let leftmost = root;
    while (leftmost.left) {
        let head = leftmost;
        while (head) {
            head.left.next = head.right;
            if (head.next) head.right.next = head.next.left;
            head = head.next;
        }
        leftmost = leftmost.left;
    }
    return root;
};`,
    explanation:
      '1. Start from root (leftmost node at current level).\n' +
      '2. For each node at the current level, connect its children.\n' +
      '3. left.next = right (same parent connection).\n' +
      '4. right.next = node.next.left (cross-parent connection).\n' +
      '5. Move to the next level using leftmost = leftmost.left.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Use the next pointers you have already set to traverse each level.',
      'There are two types of connections: same parent and cross parent.',
      'Process level by level, going left to right.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 117. Populating Next Right Pointers in Each Node II
  // ---------------------------------------------------------------------------
  {
    id: 117,
    description:
      'Given a binary tree (not necessarily perfect), populate each next pointer to point to its next right node. If there is no next right node, the next pointer should be set to NULL.',
    examples:
      'Input: root = [1,2,3,4,5,null,7]\nOutput: [1,#,2,3,#,4,5,7,#]',
    intuition:
      'Unlike the perfect binary tree version, children may be missing. Use a dummy node to build a linked list of the next level while traversing the current level via its next pointers. The dummy\'s next becomes the head of the next level\'s chain.',
    approach:
      'Use a dummy node to build the next level while traversing the current level using next pointers. The dummy node acts as the head of the linked list for the next level.',
    code: `class Solution:
    def connect(self, root):
        node = root
        while node:
            dummy = ListNode = type('Node', (), {'next': None})()
            curr = dummy
            while node:
                if node.left:
                    curr.next = node.left
                    curr = curr.next
                if node.right:
                    curr.next = node.right
                    curr = curr.next
                node = node.next
            node = dummy.next
        return root`,
    jsCode: `var connect = function(root) {
    let node = root;
    while (node) {
        const dummy = { next: null };
        let curr = dummy;
        while (node) {
            if (node.left) { curr.next = node.left; curr = curr.next; }
            if (node.right) { curr.next = node.right; curr = curr.next; }
            node = node.next;
        }
        node = dummy.next;
    }
    return root;
};`,
    explanation:
      '1. Process one level at a time using next pointers.\n' +
      '2. Use a dummy node as the head of the next level linked list.\n' +
      '3. For each node at the current level, connect its children to the next level list.\n' +
      '4. After processing the current level, move to dummy.next (start of next level).\n' +
      '5. Works for any binary tree, not just perfect trees.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Unlike problem 116, the tree may not be perfect, so some children may be missing.',
      'Use a dummy node to simplify building the next level list.',
      'Traverse the current level using next pointers set in the previous iteration.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 118. Pascal's Triangle
  // ---------------------------------------------------------------------------
  {
    id: 118,
    description:
      'Given an integer numRows, return the first numRows of Pascal\'s triangle. In Pascal\'s triangle, each number is the sum of the two numbers directly above it.',
    examples:
      'Input: numRows = 5\nOutput: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]',
    intuition:
      'Each row of Pascal\'s Triangle starts and ends with 1, and every interior element is the sum of the two elements directly above it. Build it row by row, using the previous row to compute the current one.',
    approach:
      'Build the triangle row by row. Each row starts and ends with 1. Interior elements are the sum of the two elements above from the previous row.',
    code: `class Solution:
    def generate(self, numRows: int) -> list[list[int]]:
        triangle = []
        for i in range(numRows):
            row = [1] * (i + 1)
            for j in range(1, i):
                row[j] = triangle[i - 1][j - 1] + triangle[i - 1][j]
            triangle.append(row)
        return triangle`,
    jsCode: `var generate = function(numRows) {
    const triangle = [];
    for (let i = 0; i < numRows; i++) {
        const row = Array(i + 1).fill(1);
        for (let j = 1; j < i; j++) {
            row[j] = triangle[i - 1][j - 1] + triangle[i - 1][j];
        }
        triangle.push(row);
    }
    return triangle;
};`,
    explanation:
      '1. Create each row with (i+1) elements, all initialized to 1.\n' +
      '2. For interior positions (j from 1 to i-1), compute sum of two elements above.\n' +
      '3. row[j] = previous_row[j-1] + previous_row[j].\n' +
      '4. First and last elements remain 1.\n' +
      '5. Append each row to the triangle.',
    timeComplexity: 'O(numRows^2)',
    spaceComplexity: 'O(numRows^2)',
    hints: [
      'Each row has one more element than the previous row.',
      'First and last elements of each row are always 1.',
      'Each interior element is the sum of two elements from the previous row.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 119. Pascal's Triangle II
  // ---------------------------------------------------------------------------
  {
    id: 119,
    description:
      'Given an integer rowIndex, return the rowIndexth (0-indexed) row of Pascal\'s triangle. Can you optimize your algorithm to use only O(rowIndex) extra space?',
    examples:
      'Input: rowIndex = 3\nOutput: [1,3,3,1]',
    intuition:
      'You only need one row at a time. Update a single array from right to left so that each element becomes the sum of itself and its left neighbor. Right-to-left updating prevents overwriting values you still need for the current computation.',
    approach:
      'Use a single array and update it in place from right to left. This avoids needing the full triangle. Update each element by adding the element to its left from the previous iteration.',
    code: `class Solution:
    def getRow(self, rowIndex: int) -> list[int]:
        row = [1] * (rowIndex + 1)
        for i in range(2, rowIndex + 1):
            for j in range(i - 1, 0, -1):
                row[j] += row[j - 1]
        return row`,
    jsCode: `var getRow = function(rowIndex) {
    const row = Array(rowIndex + 1).fill(1);
    for (let i = 2; i <= rowIndex; i++) {
        for (let j = i - 1; j > 0; j--) {
            row[j] += row[j - 1];
        }
    }
    return row;
};`,
    explanation:
      '1. Initialize row with all 1s of length rowIndex + 1.\n' +
      '2. For each row i from 2 to rowIndex, update from right to left.\n' +
      '3. row[j] += row[j-1] computes the sum of the two elements above.\n' +
      '4. Right-to-left traversal ensures we use previous values before overwriting.\n' +
      '5. This uses O(rowIndex) space.',
    timeComplexity: 'O(rowIndex^2)',
    spaceComplexity: 'O(rowIndex)',
    hints: [
      'You only need the previous row to compute the current row.',
      'Update the row in-place from right to left to avoid overwriting values.',
      'Start with all 1s and add adjacent pairs.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 120. Triangle
  // ---------------------------------------------------------------------------
  {
    id: 120,
    description:
      'Given a triangle array, return the minimum path sum from top to bottom. For each step, you may move to an adjacent number of the row below. Adjacent means index i or i+1 in the next row.',
    examples:
      'Input: triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]\nOutput: 11\nExplanation: 2 + 3 + 5 + 1 = 11',
    intuition:
      'Start from the bottom of the triangle and work upward. For each cell, replace it with its value plus the minimum of its two children below. When you reach the top, the apex contains the minimum path sum. Bottom-up avoids the need for backtracking.',
    approach:
      'Use bottom-up DP. Start from the bottom row and work upward. For each cell, the minimum path sum is the cell value plus the minimum of its two children below. Modify the triangle in place or use a 1D array.',
    code: `class Solution:
    def minimumTotal(self, triangle: list[list[int]]) -> int:
        dp = triangle[-1][:]
        for i in range(len(triangle) - 2, -1, -1):
            for j in range(i + 1):
                dp[j] = triangle[i][j] + min(dp[j], dp[j + 1])
        return dp[0]`,
    jsCode: `var minimumTotal = function(triangle) {
    const dp = [...triangle[triangle.length - 1]];
    for (let i = triangle.length - 2; i >= 0; i--) {
        for (let j = 0; j <= i; j++) {
            dp[j] = triangle[i][j] + Math.min(dp[j], dp[j + 1]);
        }
    }
    return dp[0];
};`,
    explanation:
      '1. Start with the bottom row as the initial DP array.\n' +
      '2. Work upward: for each cell, add the minimum of its two children.\n' +
      '3. dp[j] = triangle[i][j] + min(dp[j], dp[j+1]).\n' +
      '4. After processing all rows, dp[0] contains the minimum path sum.\n' +
      '5. Bottom-up approach avoids complex indexing of top-down.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    hints: [
      'Bottom-up DP is simpler than top-down for this problem.',
      'Start from the last row and propagate minimums upward.',
      'Each cell depends on two cells in the row below.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 122. Best Time to Buy and Sell Stock II
  // ---------------------------------------------------------------------------
  {
    id: 122,
    description:
      'You are given an integer array prices where prices[i] is the price of a given stock on the ith day. On each day, you may decide to buy and/or sell the stock. You can hold at most one share at a time. Find the maximum profit you can achieve.',
    examples:
      'Input: prices = [7,1,5,3,6,4]\nOutput: 7\nExplanation: Buy on day 2 (price=1), sell on day 3 (price=5), profit=4. Then buy on day 4 (price=3), sell on day 5 (price=6), profit=3. Total=7.',
    intuition:
      'The key insight is that you can capture every upswing. Whenever tomorrow\'s price is higher than today\'s, buy today and sell tomorrow. This greedy approach is equivalent to finding the optimal set of non-overlapping transactions because consecutive gains can be combined.',
    approach:
      'Greedily collect all positive price differences. Whenever the price goes up from one day to the next, add the difference to the profit. This is equivalent to buying and selling on consecutive days.',
    code: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        profit = 0
        for i in range(1, len(prices)):
            if prices[i] > prices[i - 1]:
                profit += prices[i] - prices[i - 1]
        return profit`,
    jsCode: `var maxProfit = function(prices) {
    let profit = 0;
    for (let i = 1; i < prices.length; i++) {
        if (prices[i] > prices[i - 1]) {
            profit += prices[i] - prices[i - 1];
        }
    }
    return profit;
};`,
    explanation:
      '1. Iterate through prices starting from day 2.\n' +
      '2. If today\'s price > yesterday\'s price, we can profit from this increase.\n' +
      '3. Add the positive difference to total profit.\n' +
      '4. This greedy approach captures every upward movement.\n' +
      '5. It is equivalent to buying at every valley and selling at every peak.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'You want to capture every price increase.',
      'If price goes up from day i to day i+1, you should have been holding the stock.',
      'Sum all positive consecutive differences.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 123. Best Time to Buy and Sell Stock III
  // ---------------------------------------------------------------------------
  {
    id: 123,
    description:
      'You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve. You may complete at most two transactions (buy-sell pairs). You may not engage in multiple transactions simultaneously.',
    examples:
      'Input: prices = [3,3,5,0,0,3,1,4]\nOutput: 6\nExplanation: Buy on day 4, sell on day 6 (profit=3), buy on day 7, sell on day 8 (profit=3). Total=6.',
    intuition:
      'Think of the price array as having a \'wall\' at each position that divides it into a left half and right half. Track four states as you scan: the best you can do after your first buy, first sell, second buy, and second sell. Each state builds on the previous one.',
    approach:
      'Track four states: after first buy, after first sell, after second buy, after second sell. Update each state optimally as you scan through prices.',
    code: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        buy1 = buy2 = float('inf')
        sell1 = sell2 = 0
        for price in prices:
            buy1 = min(buy1, price)
            sell1 = max(sell1, price - buy1)
            buy2 = min(buy2, price - sell1)
            sell2 = max(sell2, price - buy2)
        return sell2`,
    jsCode: `var maxProfit = function(prices) {
    let buy1 = Infinity, buy2 = Infinity;
    let sell1 = 0, sell2 = 0;
    for (const price of prices) {
        buy1 = Math.min(buy1, price);
        sell1 = Math.max(sell1, price - buy1);
        buy2 = Math.min(buy2, price - sell1);
        sell2 = Math.max(sell2, price - buy2);
    }
    return sell2;
};`,
    explanation:
      '1. buy1: minimum price for the first buy.\n' +
      '2. sell1: maximum profit after the first sell.\n' +
      '3. buy2: effective cost of the second buy (price - first profit).\n' +
      '4. sell2: maximum total profit after the second sell.\n' +
      '5. Process each price and update all four states.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'With at most 2 transactions, you have 4 states to track.',
      'The second buy benefits from the profit of the first transaction.',
      'Think of buy2 as the effective cost reduced by the first profit.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 126. Word Ladder II
  // ---------------------------------------------------------------------------
  {
    id: 126,
    description:
      'A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words where every adjacent pair differs by a single letter and every word is in wordList. Return all the shortest transformation sequences from beginWord to endWord.',
    examples:
      'Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]\nOutput: [["hit","hot","dot","dog","cog"],["hit","hot","lot","log","cog"]]',
    intuition:
      'First use BFS to find the shortest path length and record which words can reach which (building a predecessor map). Then use DFS/backtracking from the end word to reconstruct all shortest paths. The BFS guarantees you only explore shortest-path edges.',
    approach:
      'Use BFS to find shortest path length and build a parent/predecessor map. Then use DFS/backtracking from endWord to beginWord using the predecessor map to reconstruct all shortest paths.',
    code: `class Solution:
    def findLadders(self, beginWord: str, endWord: str, wordList: list[str]) -> list[list[str]]:
        from collections import defaultdict, deque
        word_set = set(wordList)
        if endWord not in word_set:
            return []
        layer = defaultdict(set)
        queue = deque([beginWord])
        visited = {beginWord}
        found = False
        while queue and not found:
            next_visited = set()
            for _ in range(len(queue)):
                word = queue.popleft()
                for i in range(len(word)):
                    for c in 'abcdefghijklmnopqrstuvwxyz':
                        nw = word[:i] + c + word[i+1:]
                        if nw in word_set and nw not in visited:
                            next_visited.add(nw)
                            layer[nw].add(word)
                            if nw == endWord:
                                found = True
            visited |= next_visited
            for w in next_visited:
                queue.append(w)
        res = []
        def backtrack(word, path):
            if word == beginWord:
                res.append(list(reversed(path)))
                return
            for prev in layer[word]:
                path.append(prev)
                backtrack(prev, path)
                path.pop()
        if found:
            backtrack(endWord, [endWord])
        return res`,
    jsCode: `var findLadders = function(beginWord, endWord, wordList) {
    const wordSet = new Set(wordList);
    if (!wordSet.has(endWord)) return [];
    const layer = new Map();
    const queue = [beginWord];
    const visited = new Set([beginWord]);
    let found = false;
    while (queue.length && !found) {
        const nextVisited = new Set();
        const size = queue.length;
        for (let q = 0; q < size; q++) {
            const word = queue.shift();
            for (let i = 0; i < word.length; i++) {
                for (let c = 97; c <= 122; c++) {
                    const nw = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
                    if (wordSet.has(nw) && !visited.has(nw)) {
                        nextVisited.add(nw);
                        if (!layer.has(nw)) layer.set(nw, new Set());
                        layer.get(nw).add(word);
                        if (nw === endWord) found = true;
                    }
                }
            }
        }
        for (const w of nextVisited) { visited.add(w); queue.push(w); }
    }
    const res = [];
    function backtrack(word, path) {
        if (word === beginWord) { res.push([...path].reverse()); return; }
        if (!layer.has(word)) return;
        for (const prev of layer.get(word)) {
            path.push(prev);
            backtrack(prev, path);
            path.pop();
        }
    }
    if (found) backtrack(endWord, [endWord]);
    return res;
};`,
    explanation:
      '1. BFS layer by layer to find shortest transformation paths.\n' +
      '2. Build a predecessor map: for each word, track which words lead to it.\n' +
      '3. Only add words to visited after processing the entire level (allows multiple paths).\n' +
      '4. Stop BFS when endWord is found at the current level.\n' +
      '5. Backtrack from endWord using the predecessor map to reconstruct all paths.',
    timeComplexity: 'O(n * m * 26) where n = words, m = word length',
    spaceComplexity: 'O(n * m)',
    hints: [
      'BFS finds the shortest path length; build a DAG of predecessors.',
      'Process entire BFS levels before marking words as visited.',
      'Backtrack from endWord to beginWord using the predecessor map.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 129. Sum Root to Leaf Numbers
  // ---------------------------------------------------------------------------
  {
    id: 129,
    description:
      'You are given the root of a binary tree containing digits from 0 to 9 only. Each root-to-leaf path represents a number (e.g., path 1->2->3 represents 123). Return the total sum of all root-to-leaf numbers.',
    examples:
      'Input: root = [1,2,3]\nOutput: 25\nExplanation: 12 + 13 = 25',
    intuition:
      'Each root-to-leaf path forms a number where each level adds a digit. As you DFS down the tree, multiply the accumulated number by 10 and add the current node\'s value. At each leaf, the accumulated value is one complete number to add to the total.',
    approach:
      'Use DFS, passing the current number formed so far. At each node, multiply the current number by 10 and add the node value. At leaf nodes, add the number to the total sum.',
    code: `class Solution:
    def sumNumbers(self, root) -> int:
        def dfs(node, num):
            if not node:
                return 0
            num = num * 10 + node.val
            if not node.left and not node.right:
                return num
            return dfs(node.left, num) + dfs(node.right, num)
        return dfs(root, 0)`,
    jsCode: `var sumNumbers = function(root) {
    function dfs(node, num) {
        if (!node) return 0;
        num = num * 10 + node.val;
        if (!node.left && !node.right) return num;
        return dfs(node.left, num) + dfs(node.right, num);
    }
    return dfs(root, 0);
};`,
    explanation:
      '1. DFS with running number: num = num * 10 + node.val.\n' +
      '2. At a leaf, return the accumulated number.\n' +
      '3. At an internal node, sum results from left and right subtrees.\n' +
      '4. If a child is None, it contributes 0.\n' +
      '5. The total sum is the sum of all leaf path numbers.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'Track the number formed so far as you traverse from root to leaf.',
      'Multiply by 10 and add the current digit at each node.',
      'Only return the number at leaf nodes.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 132. Palindrome Partitioning II
  // ---------------------------------------------------------------------------
  {
    id: 132,
    description:
      'Given a string s, return the minimum number of cuts needed so that every substring of the partition is a palindrome.',
    examples:
      'Input: s = "aab"\nOutput: 1\nExplanation: ["aa","b"]',
    intuition:
      'First, precompute which substrings are palindromes using a 2D table. Then use DP where dp[i] is the minimum cuts for the first i characters. For each position, check all palindromic substrings ending there and take the minimum cuts needed.',
    approach:
      'Use two DP arrays. First, precompute a 2D palindrome table. Then, dp[i] = minimum cuts for s[:i+1]. For each position, if s[j..i] is a palindrome, dp[i] = min(dp[i], dp[j-1] + 1).',
    code: `class Solution:
    def minCut(self, s: str) -> int:
        n = len(s)
        is_pal = [[False] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):
            for j in range(i, n):
                if s[i] == s[j] and (j - i <= 2 or is_pal[i + 1][j - 1]):
                    is_pal[i][j] = True
        dp = list(range(n))
        for i in range(1, n):
            if is_pal[0][i]:
                dp[i] = 0
                continue
            for j in range(1, i + 1):
                if is_pal[j][i]:
                    dp[i] = min(dp[i], dp[j - 1] + 1)
        return dp[n - 1]`,
    jsCode: `var minCut = function(s) {
    const n = s.length;
    const isPal = Array.from({length: n}, () => Array(n).fill(false));
    for (let i = n - 1; i >= 0; i--) {
        for (let j = i; j < n; j++) {
            if (s[i] === s[j] && (j - i <= 2 || isPal[i + 1][j - 1])) {
                isPal[i][j] = true;
            }
        }
    }
    const dp = Array.from({length: n}, (_, i) => i);
    for (let i = 1; i < n; i++) {
        if (isPal[0][i]) { dp[i] = 0; continue; }
        for (let j = 1; j <= i; j++) {
            if (isPal[j][i]) dp[i] = Math.min(dp[i], dp[j - 1] + 1);
        }
    }
    return dp[n - 1];
};`,
    explanation:
      '1. Precompute palindrome table: is_pal[i][j] = True if s[i..j] is a palindrome.\n' +
      '2. dp[i] = minimum cuts for s[:i+1], initialized to i (worst case: all single chars).\n' +
      '3. If s[0..i] is a palindrome, dp[i] = 0 (no cuts needed).\n' +
      '4. Otherwise, for each j, if s[j..i] is palindrome, dp[i] = min(dp[i], dp[j-1]+1).\n' +
      '5. Return dp[n-1].',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Precompute which substrings are palindromes.',
      'dp[i] = min cuts needed for s[0..i].',
      'For each palindrome ending at i, consider cutting right before it.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 135. Candy
  // ---------------------------------------------------------------------------
  {
    id: 135,
    description:
      'There are n children standing in a line. Each child is assigned a rating value. You are giving candies to these children with the rules: each child must have at least one candy, and children with a higher rating than their neighbors must get more candies. Return the minimum total number of candies.',
    examples:
      'Input: ratings = [1,0,2]\nOutput: 5\nExplanation: [2,1,2]',
    intuition:
      'Two separate scans capture the two constraints independently. Left-to-right ensures higher-rated children get more than their left neighbor; right-to-left ensures the same for the right neighbor. Taking the maximum of both scans at each position satisfies both constraints simultaneously.',
    approach:
      'Two-pass greedy. First pass left-to-right: if rating increases, give one more candy than the left neighbor. Second pass right-to-left: if rating increases going right, ensure more candies than the right neighbor. Take the max at each position.',
    code: `class Solution:
    def candy(self, ratings: list[int]) -> int:
        n = len(ratings)
        candies = [1] * n
        for i in range(1, n):
            if ratings[i] > ratings[i - 1]:
                candies[i] = candies[i - 1] + 1
        for i in range(n - 2, -1, -1):
            if ratings[i] > ratings[i + 1]:
                candies[i] = max(candies[i], candies[i + 1] + 1)
        return sum(candies)`,
    jsCode: `var candy = function(ratings) {
    const n = ratings.length;
    const candies = Array(n).fill(1);
    for (let i = 1; i < n; i++) {
        if (ratings[i] > ratings[i - 1]) candies[i] = candies[i - 1] + 1;
    }
    for (let i = n - 2; i >= 0; i--) {
        if (ratings[i] > ratings[i + 1]) candies[i] = Math.max(candies[i], candies[i + 1] + 1);
    }
    return candies.reduce((a, b) => a + b, 0);
};`,
    explanation:
      '1. Initialize all children with 1 candy.\n' +
      '2. Left pass: if rating[i] > rating[i-1], give more than left neighbor.\n' +
      '3. Right pass: if rating[i] > rating[i+1], ensure more than right neighbor.\n' +
      '4. Use max to satisfy both directions simultaneously.\n' +
      '5. Sum all candies for the minimum total.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Each child must have more candies than neighbors with lower ratings.',
      'One pass handles left neighbors, another handles right neighbors.',
      'Take the maximum from both passes at each position.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 137. Single Number II
  // ---------------------------------------------------------------------------
  {
    id: 137,
    description:
      'Given an integer array nums where every element appears exactly three times except for one element which appears exactly once. Find the single element and return it. Your algorithm should have linear runtime complexity and use only constant extra space.',
    examples:
      'Input: nums = [2,2,3,2]\nOutput: 3',
    intuition:
      'When a number appears three times, its bits appear in multiples of three at each position. Track bit counts modulo 3 using two variables (ones and twos). After processing all numbers, \'ones\' holds the bits of the number that appeared only once.',
    approach:
      'Use two variables (ones, twos) to track bits that have appeared once and twice. When a bit appears three times, clear it from both. After processing all numbers, ones holds the single number.',
    code: `class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        ones = twos = 0
        for num in nums:
            ones = (ones ^ num) & ~twos
            twos = (twos ^ num) & ~ones
        return ones`,
    jsCode: `var singleNumber = function(nums) {
    let ones = 0, twos = 0;
    for (const num of nums) {
        ones = (ones ^ num) & ~twos;
        twos = (twos ^ num) & ~ones;
    }
    return ones;
};`,
    explanation:
      '1. ones tracks bits that have appeared 1 (mod 3) times.\n' +
      '2. twos tracks bits that have appeared 2 (mod 3) times.\n' +
      '3. When a bit appears for the 3rd time, it is cleared from both.\n' +
      '4. XOR adds/removes bits; AND with complement prevents bits in the other variable.\n' +
      '5. After all numbers, ones contains the single number.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Think about counting bits modulo 3.',
      'Use two variables to represent a 2-bit counter for each bit position.',
      'When a bit count reaches 3, reset it to 0.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 140. Word Break II
  // ---------------------------------------------------------------------------
  {
    id: 140,
    description:
      'Given a string s and a dictionary of strings wordDict, add spaces in s to construct a sentence where each word is a valid dictionary word. Return all possible sentences in any order.',
    examples:
      'Input: s = "catsanddog", wordDict = ["cat","cats","and","sand","dog"]\nOutput: ["cats and dog","cat sand dog"]',
    intuition:
      'This is Word Break with path reconstruction. At each position, try every dictionary word that matches the current prefix, then recursively solve the remaining suffix. Memoization avoids recomputing the same suffixes, turning exponential worst-case into polynomial.',
    approach:
      'Use memoized DFS/backtracking. For each position, try every word in the dictionary that matches the current prefix. Recursively solve the remaining substring and combine results.',
    code: `class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> list[str]:
        from functools import lru_cache
        word_set = set(wordDict)
        @lru_cache(maxsize=None)
        def dp(start):
            if start == len(s):
                return ['']
            sentences = []
            for end in range(start + 1, len(s) + 1):
                word = s[start:end]
                if word in word_set:
                    for rest in dp(end):
                        if rest:
                            sentences.append(word + ' ' + rest)
                        else:
                            sentences.append(word)
            return sentences
        return dp(0)`,
    jsCode: `var wordBreak = function(s, wordDict) {
    const wordSet = new Set(wordDict);
    const memo = new Map();
    function dp(start) {
        if (start === s.length) return [''];
        if (memo.has(start)) return memo.get(start);
        const sentences = [];
        for (let end = start + 1; end <= s.length; end++) {
            const word = s.substring(start, end);
            if (wordSet.has(word)) {
                for (const rest of dp(end)) {
                    sentences.push(rest ? word + ' ' + rest : word);
                }
            }
        }
        memo.set(start, sentences);
        return sentences;
    }
    return dp(0);
};`,
    explanation:
      '1. Use memoized recursion starting from index 0.\n' +
      '2. For each starting position, try every possible end position.\n' +
      '3. If the substring is in the dictionary, recursively solve the rest.\n' +
      '4. Combine the current word with each sentence from the recursive result.\n' +
      '5. Memoization avoids recomputing overlapping subproblems.',
    timeComplexity: 'O(n^2 * 2^n) worst case',
    spaceComplexity: 'O(n * 2^n)',
    hints: [
      'Try each dictionary word as a prefix at each position.',
      'Recursively solve the remaining substring.',
      'Use memoization to cache results for each starting index.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 144. Binary Tree Preorder Traversal
  // ---------------------------------------------------------------------------
  {
    id: 144,
    description:
      'Given the root of a binary tree, return the preorder traversal of its nodes values. Preorder visits root, then left subtree, then right subtree.',
    examples:
      'Input: root = [1,null,2,3]\nOutput: [1,2,3]',
    intuition:
      'Pre-order traversal visits root, then left, then right. Iteratively, use a stack: pop a node, record its value, push right child first, then left child. Since stacks are LIFO, left gets processed before right, maintaining the correct order.',
    approach:
      'Use an iterative approach with a stack. Push root, then repeatedly pop, visit, push right child, then push left child (so left is processed first).',
    code: `class Solution:
    def preorderTraversal(self, root) -> list[int]:
        if not root:
            return []
        stack, res = [root], []
        while stack:
            node = stack.pop()
            res.append(node.val)
            if node.right:
                stack.append(node.right)
            if node.left:
                stack.append(node.left)
        return res`,
    jsCode: `var preorderTraversal = function(root) {
    if (!root) return [];
    const stack = [root], res = [];
    while (stack.length) {
        const node = stack.pop();
        res.push(node.val);
        if (node.right) stack.push(node.right);
        if (node.left) stack.push(node.left);
    }
    return res;
};`,
    explanation:
      '1. Push root onto the stack.\n' +
      '2. Pop a node, add its value to result.\n' +
      '3. Push right child first, then left child.\n' +
      '4. Since a stack is LIFO, left child is processed before right.\n' +
      '5. This produces preorder: root, left subtree, right subtree.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'Preorder: visit root first, then left, then right.',
      'Use a stack; push right before left so left is processed first.',
      'Alternatively, use simple recursion.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 145. Binary Tree Postorder Traversal
  // ---------------------------------------------------------------------------
  {
    id: 145,
    description:
      'Given the root of a binary tree, return the postorder traversal of its nodes values. Postorder visits left subtree, right subtree, then root.',
    examples:
      'Input: root = [1,null,2,3]\nOutput: [3,2,1]',
    intuition:
      'Post-order (left, right, root) is tricky iteratively. The clever trick: do a modified pre-order (root, right, left) by pushing left before right, then reverse the result. The reversed modified pre-order gives exactly post-order.',
    approach:
      'Use a modified preorder traversal (root, right, left) and reverse the result. Or use two stacks. The reversed modified preorder gives left, right, root (postorder).',
    code: `class Solution:
    def postorderTraversal(self, root) -> list[int]:
        if not root:
            return []
        stack, res = [root], []
        while stack:
            node = stack.pop()
            res.append(node.val)
            if node.left:
                stack.append(node.left)
            if node.right:
                stack.append(node.right)
        return res[::-1]`,
    jsCode: `var postorderTraversal = function(root) {
    if (!root) return [];
    const stack = [root], res = [];
    while (stack.length) {
        const node = stack.pop();
        res.push(node.val);
        if (node.left) stack.push(node.left);
        if (node.right) stack.push(node.right);
    }
    return res.reverse();
};`,
    explanation:
      '1. Modified preorder: visit root, push left first then right (so right processes first).\n' +
      '2. This gives root, right, left order.\n' +
      '3. Reversing gives left, right, root = postorder.\n' +
      '4. Push left before right so right is popped first.\n' +
      '5. Reverse the result at the end.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'Postorder is the reverse of a modified preorder (root, right, left).',
      'Push left child before right child on the stack.',
      'Reverse the result to get postorder.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 147. Insertion Sort List
  // ---------------------------------------------------------------------------
  {
    id: 147,
    description:
      'Given the head of a singly linked list, sort the list using insertion sort, and return the sorted list head.',
    examples:
      'Input: head = [4,2,1,3]\nOutput: [1,2,3,4]',
    intuition:
      'Build the sorted portion of the list from left to right. For each unsorted node, walk through the sorted portion to find where it belongs (like inserting a card into a sorted hand). A dummy head simplifies insertion at the beginning.',
    approach:
      'Build a sorted list from left to right. For each node, find the correct position in the sorted portion and insert it there. Use a dummy head to simplify insertion at the beginning.',
    code: `class Solution:
    def insertionSortList(self, head):
        dummy = ListNode(0)
        curr = head
        while curr:
            nxt = curr.next
            prev = dummy
            while prev.next and prev.next.val < curr.val:
                prev = prev.next
            curr.next = prev.next
            prev.next = curr
            curr = nxt
        return dummy.next`,
    jsCode: `var insertionSortList = function(head) {
    const dummy = new ListNode(0);
    let curr = head;
    while (curr) {
        const nxt = curr.next;
        let prev = dummy;
        while (prev.next && prev.next.val < curr.val) prev = prev.next;
        curr.next = prev.next;
        prev.next = curr;
        curr = nxt;
    }
    return dummy.next;
};`,
    explanation:
      '1. Create a dummy node as the head of the sorted list.\n' +
      '2. For each node in the original list, save its next pointer.\n' +
      '3. Find the correct insertion position in the sorted list.\n' +
      '4. Insert the node by rewiring pointers.\n' +
      '5. Move to the next node in the original list.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
    hints: [
      'Build a new sorted list one node at a time.',
      'For each node, traverse the sorted list to find the insertion point.',
      'A dummy node simplifies insertion at the beginning.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 149. Max Points on a Line
  // ---------------------------------------------------------------------------
  {
    id: 149,
    description:
      'Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane, return the maximum number of points that lie on the same straight line.',
    examples:
      'Input: points = [[1,1],[2,2],[3,3]]\nOutput: 3',
    intuition:
      'For each anchor point, compute the slope to every other point and count how many share the same slope. Use a hash map keyed by slope. The key insight is representing slopes as reduced fractions (or using a tuple of delta_x, delta_y divided by their GCD) to avoid floating-point imprecision.',
    approach:
      'For each point, compute the slope to every other point and use a hash map to count points with the same slope. The maximum count for any slope plus one (the anchor point) is a candidate answer.',
    code: `class Solution:
    def maxPoints(self, points: list[list[int]]) -> int:
        from math import gcd
        from collections import defaultdict
        n = len(points)
        if n <= 2:
            return n
        res = 2
        for i in range(n):
            slopes = defaultdict(int)
            for j in range(i + 1, n):
                dx = points[j][0] - points[i][0]
                dy = points[j][1] - points[i][1]
                g = gcd(abs(dx), abs(dy))
                dx, dy = dx // g, dy // g
                if dx < 0:
                    dx, dy = -dx, -dy
                elif dx == 0:
                    dy = abs(dy)
                slopes[(dx, dy)] += 1
            if slopes:
                res = max(res, max(slopes.values()) + 1)
        return res`,
    jsCode: `var maxPoints = function(points) {
    const n = points.length;
    if (n <= 2) return n;
    function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
    let res = 2;
    for (let i = 0; i < n; i++) {
        const slopes = new Map();
        for (let j = i + 1; j < n; j++) {
            let dx = points[j][0] - points[i][0];
            let dy = points[j][1] - points[i][1];
            const g = gcd(Math.abs(dx), Math.abs(dy));
            dx /= g; dy /= g;
            if (dx < 0) { dx = -dx; dy = -dy; }
            else if (dx === 0) dy = Math.abs(dy);
            const key = dx + ',' + dy;
            slopes.set(key, (slopes.get(key) || 0) + 1);
        }
        for (const count of slopes.values()) {
            res = Math.max(res, count + 1);
        }
    }
    return res;
};`,
    explanation:
      '1. For each point i, compute slopes to all other points j.\n' +
      '2. Normalize slopes using GCD to handle equivalent fractions.\n' +
      '3. Ensure consistent sign (normalize negative denominators).\n' +
      '4. Count points with each slope; max_count + 1 includes point i itself.\n' +
      '5. Track the global maximum across all anchor points.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    hints: [
      'Fix one point and check slopes to all other points.',
      'Represent slopes as reduced fractions to avoid floating-point issues.',
      'Normalize the slope representation for consistent hashing.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 151. Reverse Words in a String
  // ---------------------------------------------------------------------------
  {
    id: 151,
    description:
      'Given an input string s, reverse the order of the words. A word is defined as a sequence of non-space characters. The words in s will be separated by at least one space. Return a string of the words in reverse order concatenated by a single space.',
    examples:
      'Input: s = "the sky is blue"\nOutput: "blue is sky the"',
    intuition:
      'Split the string by whitespace to get individual words, filter out empty strings, reverse the list, and join with single spaces. This handles multiple spaces, leading spaces, and trailing spaces all at once.',
    approach:
      'Split the string by whitespace to get individual words, reverse the list of words, and join them with single spaces. This handles multiple spaces and leading/trailing spaces.',
    code: `class Solution:
    def reverseWords(self, s: str) -> str:
        return ' '.join(s.split()[::-1])`,
    jsCode: `var reverseWords = function(s) {
    return s.trim().split(/\\s+/).reverse().join(' ');
};`,
    explanation:
      '1. s.split() splits by any whitespace and removes empty strings.\n' +
      '2. [::-1] reverses the list of words.\n' +
      '3. Join with a single space.\n' +
      '4. This handles leading, trailing, and multiple spaces between words.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Split the string into words, reverse the list, and rejoin.',
      'Python split() without arguments handles multiple spaces.',
      'For O(1) space in other languages, reverse entire string then reverse each word.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 154. Find Minimum in Rotated Sorted Array II
  // ---------------------------------------------------------------------------
  {
    id: 154,
    description:
      'Suppose an array of length n sorted in ascending order is rotated between 1 and n times. The array may contain duplicates. Find the minimum element.',
    examples:
      'Input: nums = [2,2,2,0,1]\nOutput: 0',
    intuition:
      'Binary search in a rotated array with duplicates. When nums[mid] equals nums[hi], you can\'t determine which half contains the minimum, so shrink the search space by decrementing hi. This handles the ambiguity that duplicates create.',
    approach:
      'Use binary search. Compare mid with hi. If nums[mid] < nums[hi], the minimum is in the left half. If nums[mid] > nums[hi], the minimum is in the right half. If equal, decrement hi to skip the duplicate.',
    code: `class Solution:
    def findMin(self, nums: list[int]) -> int:
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] > nums[hi]:
                lo = mid + 1
            elif nums[mid] < nums[hi]:
                hi = mid
            else:
                hi -= 1
        return nums[lo]`,
    jsCode: `var findMin = function(nums) {
    let lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else if (nums[mid] < nums[hi]) hi = mid;
        else hi--;
    }
    return nums[lo];
};`,
    explanation:
      '1. Binary search comparing nums[mid] with nums[hi].\n' +
      '2. If mid > hi: minimum is in the right half (lo = mid + 1).\n' +
      '3. If mid < hi: minimum is in the left half including mid (hi = mid).\n' +
      '4. If mid == hi: cannot determine, but can safely skip hi (hi -= 1).\n' +
      '5. Worst case O(n) due to duplicates, average O(log n).',
    timeComplexity: 'O(n) worst, O(log n) average',
    spaceComplexity: 'O(1)',
    hints: [
      'This extends Find Minimum in Rotated Sorted Array with duplicates.',
      'When nums[mid] == nums[hi], you cannot determine the sorted half.',
      'Decrement hi by 1 to skip the duplicate safely.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 159. Longest Substring with At Most Two Distinct Characters
  // ---------------------------------------------------------------------------
  {
    id: 159,
    description:
      'Given a string s, return the length of the longest substring that contains at most two distinct characters.',
    examples:
      'Input: s = "eceba"\nOutput: 3\nExplanation: "ece" has 2 distinct characters.',
    intuition:
      'Use a sliding window with a character frequency map. Expand the window to the right, adding characters. When the window contains more than two distinct characters, shrink from the left until you\'re back to two. Track the maximum window size throughout.',
    approach:
      'Use a sliding window with a hash map tracking character counts. Expand the right pointer and add characters. When distinct characters exceed 2, shrink from the left until we have at most 2 distinct characters.',
    code: `class Solution:
    def lengthOfLongestSubstringTwoDistinct(self, s: str) -> int:
        from collections import defaultdict
        count = defaultdict(int)
        left = res = 0
        for right in range(len(s)):
            count[s[right]] += 1
            while len(count) > 2:
                count[s[left]] -= 1
                if count[s[left]] == 0:
                    del count[s[left]]
                left += 1
            res = max(res, right - left + 1)
        return res`,
    jsCode: `var lengthOfLongestSubstringTwoDistinct = function(s) {
    const count = new Map();
    let left = 0, res = 0;
    for (let right = 0; right < s.length; right++) {
        count.set(s[right], (count.get(s[right]) || 0) + 1);
        while (count.size > 2) {
            count.set(s[left], count.get(s[left]) - 1);
            if (count.get(s[left]) === 0) count.delete(s[left]);
            left++;
        }
        res = Math.max(res, right - left + 1);
    }
    return res;
};`,
    explanation:
      '1. Sliding window with a character frequency map.\n' +
      '2. Expand right pointer, adding each character to the map.\n' +
      '3. When more than 2 distinct characters, shrink from the left.\n' +
      '4. Remove characters from the map when their count reaches 0.\n' +
      '5. Track the maximum window size.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Use a sliding window approach with a character count map.',
      'Shrink the window when you have more than 2 distinct characters.',
      'This is a template for "at most K distinct characters" problems.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 161. One Edit Distance
  // ---------------------------------------------------------------------------
  {
    id: 161,
    description:
      'Given two strings s and t, return true if they are both one edit distance apart, otherwise return false. An edit is: insert a character, delete a character, or replace a character.',
    examples:
      'Input: s = "ab", t = "acb"\nOutput: true',
    intuition:
      'Compare the two strings based on their length difference. If same length, find the first mismatch - everything after must be identical (one replace). If lengths differ by one, find the first mismatch and skip one character in the longer string - the rest must match (one insert/delete).',
    approach:
      'If lengths differ by more than 1, return false. Find the first differing character. If same length, the rest after that position must be equal (replace). If different lengths, skip one character in the longer string and the rest must match (insert/delete).',
    code: `class Solution:
    def isOneEditDistance(self, s: str, t: str) -> bool:
        m, n = len(s), len(t)
        if abs(m - n) > 1:
            return False
        if m > n:
            return self.isOneEditDistance(t, s)
        for i in range(m):
            if s[i] != t[i]:
                if m == n:
                    return s[i+1:] == t[i+1:]
                else:
                    return s[i:] == t[i+1:]
        return m + 1 == n`,
    jsCode: `var isOneEditDistance = function(s, t) {
    let m = s.length, n = t.length;
    if (Math.abs(m - n) > 1) return false;
    if (m > n) return isOneEditDistance(t, s);
    for (let i = 0; i < m; i++) {
        if (s[i] !== t[i]) {
            if (m === n) return s.substring(i + 1) === t.substring(i + 1);
            else return s.substring(i) === t.substring(i + 1);
        }
    }
    return m + 1 === n;
};`,
    explanation:
      '1. Ensure s is the shorter string (or equal length).\n' +
      '2. If length difference > 1, return False.\n' +
      '3. Find the first position where characters differ.\n' +
      '4. Same length: rest after that position must match (replace edit).\n' +
      '5. Different length: skip one char in longer string, rest must match (insert/delete).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'There are three types of edit: insert, delete, replace.',
      'If lengths differ by more than 1, it cannot be one edit.',
      'Find the first mismatch and check if the remaining parts match.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 163. Missing Ranges
  // ---------------------------------------------------------------------------
  {
    id: 163,
    description:
      'You are given an inclusive range [lower, upper] and a sorted unique integer array nums. A number x is considered missing if x is in the range [lower, upper] and x is not in nums. Return the smallest sorted list of ranges that cover every missing number exactly.',
    examples:
      'Input: nums = [0,1,3,50,75], lower = 0, upper = 99\nOutput: [[2,2],[4,49],[51,74],[76,99]]',
    intuition:
      'Walk through the array while tracking the next expected number. Whenever there\'s a gap between what you expect and what you see, that gap is a missing range. The key is handling the boundaries (lower and upper) as implicit elements of the sequence.',
    approach:
      'Iterate through nums while tracking the expected next number (starting from lower). Whenever there is a gap between the expected number and the current number, record the missing range. Handle the final range after the loop.',
    code: `class Solution:
    def findMissingRanges(self, nums: list[int], lower: int, upper: int) -> list[list[int]]:
        res = []
        prev = lower - 1
        for num in nums + [upper + 1]:
            if num - prev >= 2:
                res.append([prev + 1, num - 1])
            prev = num
        return res`,
    jsCode: `var findMissingRanges = function(nums, lower, upper) {
    const res = [];
    let prev = lower - 1;
    for (const num of [...nums, upper + 1]) {
        if (num - prev >= 2) res.push([prev + 1, num - 1]);
        prev = num;
    }
    return res;
};`,
    explanation:
      '1. Set prev = lower - 1 as the sentinel before the range.\n' +
      '2. Append upper + 1 as the sentinel after the range.\n' +
      '3. For each number, if the gap from prev is >= 2, there are missing numbers.\n' +
      '4. The missing range is [prev + 1, num - 1].\n' +
      '5. Update prev to the current number after each step.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) excluding output',
    hints: [
      'Track the previous number and check for gaps.',
      'Use sentinels (lower-1 and upper+1) to simplify boundary handling.',
      'A gap of >= 2 between consecutive numbers means missing values exist.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 164. Maximum Gap
  // ---------------------------------------------------------------------------
  {
    id: 164,
    description:
      'Given an integer array nums, return the maximum difference between two successive elements in its sorted form. If the array contains less than two elements, return 0. You must write an algorithm that runs in linear time.',
    examples:
      'Input: nums = [3,6,9,1]\nOutput: 3',
    intuition:
      'The pigeonhole principle guarantees the maximum gap is at least ceil((max-min)/(n-1)). Create buckets of this size so the max gap must occur between consecutive non-empty buckets, not within a bucket. This clever bucketing avoids comparison-based sorting to achieve O(n) time.',
    approach:
      'Use bucket sort / pigeonhole principle. The maximum gap is at least ceil((max-min)/(n-1)). Create buckets of this size. The maximum gap must be between consecutive non-empty buckets (not within a bucket).',
    code: `class Solution:
    def maximumGap(self, nums: list[int]) -> int:
        if len(nums) < 2:
            return 0
        lo, hi = min(nums), max(nums)
        if lo == hi:
            return 0
        n = len(nums)
        bucket_size = max(1, (hi - lo) // (n - 1))
        bucket_count = (hi - lo) // bucket_size + 1
        buckets = [[float('inf'), float('-inf')] for _ in range(bucket_count)]
        for num in nums:
            idx = (num - lo) // bucket_size
            buckets[idx][0] = min(buckets[idx][0], num)
            buckets[idx][1] = max(buckets[idx][1], num)
        max_gap = 0
        prev_max = lo
        for mn, mx in buckets:
            if mn == float('inf'):
                continue
            max_gap = max(max_gap, mn - prev_max)
            prev_max = mx
        return max_gap`,
    jsCode: `var maximumGap = function(nums) {
    if (nums.length < 2) return 0;
    const lo = Math.min(...nums), hi = Math.max(...nums);
    if (lo === hi) return 0;
    const n = nums.length;
    const bucketSize = Math.max(1, Math.floor((hi - lo) / (n - 1)));
    const bucketCount = Math.floor((hi - lo) / bucketSize) + 1;
    const buckets = Array.from({length: bucketCount}, () => [Infinity, -Infinity]);
    for (const num of nums) {
        const idx = Math.floor((num - lo) / bucketSize);
        buckets[idx][0] = Math.min(buckets[idx][0], num);
        buckets[idx][1] = Math.max(buckets[idx][1], num);
    }
    let maxGap = 0, prevMax = lo;
    for (const [mn, mx] of buckets) {
        if (mn === Infinity) continue;
        maxGap = Math.max(maxGap, mn - prevMax);
        prevMax = mx;
    }
    return maxGap;
};`,
    explanation:
      '1. Compute bucket size = max(1, (max-min)/(n-1)).\n' +
      '2. Place each number into a bucket, tracking min and max per bucket.\n' +
      '3. The maximum gap cannot be within a bucket (bucket size guarantees this).\n' +
      '4. The maximum gap is between the max of one bucket and the min of the next non-empty bucket.\n' +
      '5. Iterate through buckets tracking the previous maximum.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The pigeonhole principle guarantees the max gap is at least (max-min)/(n-1).',
      'Use buckets smaller than this size so the max gap spans buckets.',
      'Only compare across non-empty buckets.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 165. Compare Version Numbers
  // ---------------------------------------------------------------------------
  {
    id: 165,
    description:
      'Given two version strings version1 and version2, compare them. Version strings consist of revisions separated by dots. Each revision is a non-negative integer. Compare revision by revision from left to right. Missing revisions are treated as 0.',
    examples:
      'Input: version1 = "1.01", version2 = "1.001"\nOutput: 0',
    intuition:
      'Split both version strings by dots and compare segment by segment as integers. If one version has fewer segments, treat the missing ones as zero. This handles cases like \'1.0\' equaling \'1\' and leading zeros within segments.',
    approach:
      'Split both versions by dots and compare integer values of corresponding revisions. If one version has fewer revisions, treat the missing ones as 0.',
    code: `class Solution:
    def compareVersion(self, version1: str, version2: str) -> int:
        v1 = list(map(int, version1.split('.')))
        v2 = list(map(int, version2.split('.')))
        n = max(len(v1), len(v2))
        for i in range(n):
            a = v1[i] if i < len(v1) else 0
            b = v2[i] if i < len(v2) else 0
            if a < b:
                return -1
            elif a > b:
                return 1
        return 0`,
    jsCode: `var compareVersion = function(version1, version2) {
    const v1 = version1.split('.').map(Number);
    const v2 = version2.split('.').map(Number);
    const n = Math.max(v1.length, v2.length);
    for (let i = 0; i < n; i++) {
        const a = i < v1.length ? v1[i] : 0;
        const b = i < v2.length ? v2[i] : 0;
        if (a < b) return -1;
        if (a > b) return 1;
    }
    return 0;
};`,
    explanation:
      '1. Split each version string by dots and convert to integers.\n' +
      '2. Compare revisions one by one from left to right.\n' +
      '3. Use 0 for missing revisions in the shorter version.\n' +
      '4. Return -1, 1, or 0 based on the first differing revision.\n' +
      '5. If all revisions match, return 0.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Split by dots and compare integer values, not strings.',
      'Handle different numbers of revisions by padding with 0.',
      'Leading zeros in revisions do not matter when converting to int.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 166. Fraction to Recurring Decimal
  // ---------------------------------------------------------------------------
  {
    id: 166,
    description:
      'Given two integers representing the numerator and denominator of a fraction, return the fraction in string format. If the fractional part is repeating, enclose the repeating part in parentheses.',
    examples:
      'Input: numerator = 1, denominator = 3\nOutput: "0.(3)"',
    intuition:
      'This is long division by hand. The key insight for detecting repeating decimals is that if a remainder repeats during division, the digits between the two occurrences of that remainder will repeat forever. Track remainder positions with a hash map.',
    approach:
      'Perform long division. Track remainders and their positions. When a remainder repeats, the digits between the two occurrences form the repeating part. Insert parentheses around it.',
    code: `class Solution:
    def fractionToDecimal(self, numerator: int, denominator: int) -> str:
        if numerator == 0:
            return "0"
        res = []
        if (numerator < 0) ^ (denominator < 0):
            res.append('-')
        numerator, denominator = abs(numerator), abs(denominator)
        res.append(str(numerator // denominator))
        remainder = numerator % denominator
        if remainder == 0:
            return ''.join(res)
        res.append('.')
        remainder_map = {}
        while remainder:
            if remainder in remainder_map:
                res.insert(remainder_map[remainder], '(')
                res.append(')')
                break
            remainder_map[remainder] = len(res)
            remainder *= 10
            res.append(str(remainder // denominator))
            remainder %= denominator
        return ''.join(res)`,
    jsCode: `var fractionToDecimal = function(numerator, denominator) {
    if (numerator === 0) return "0";
    const res = [];
    if ((numerator < 0) ^ (denominator < 0)) res.push('-');
    let num = Math.abs(numerator), den = Math.abs(denominator);
    res.push(String(Math.floor(num / den)));
    let remainder = num % den;
    if (remainder === 0) return res.join('');
    res.push('.');
    const remainderMap = new Map();
    while (remainder) {
        if (remainderMap.has(remainder)) {
            res.splice(remainderMap.get(remainder), 0, '(');
            res.push(')');
            break;
        }
        remainderMap.set(remainder, res.length);
        remainder *= 10;
        res.push(String(Math.floor(remainder / den)));
        remainder %= den;
    }
    return res.join('');
};`,
    explanation:
      '1. Handle the sign separately.\n' +
      '2. Compute the integer part with division.\n' +
      '3. Perform long division for the fractional part.\n' +
      '4. Track each remainder and its position in the result.\n' +
      '5. When a remainder repeats, insert parentheses around the repeating cycle.',
    timeComplexity: 'O(d) where d is the denominator',
    spaceComplexity: 'O(d)',
    hints: [
      'Simulate long division to find the decimal representation.',
      'A repeating cycle starts when a remainder appears again.',
      'Use a map to record where each remainder first appeared.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 168. Excel Sheet Column Title
  // ---------------------------------------------------------------------------
  {
    id: 168,
    description:
      'Given an integer columnNumber, return its corresponding column title as it appears in an Excel sheet. For example, A = 1, B = 2, ..., Z = 26, AA = 27, AB = 28, ...',
    examples:
      'Input: columnNumber = 701\nOutput: "ZY"',
    intuition:
      'This is base-26 conversion, but 1-indexed (A=1, not A=0). The fix is to subtract 1 before taking modulo 26 at each step. This accounts for the fact that there\'s no \'zero\' character in the Excel column system.',
    approach:
      'This is essentially converting to base-26, but 1-indexed instead of 0-indexed. Repeatedly subtract 1, then take modulo 26 to get the current character, and divide by 26 for the next digit.',
    code: `class Solution:
    def convertToTitle(self, columnNumber: int) -> str:
        res = []
        while columnNumber:
            columnNumber -= 1
            res.append(chr(columnNumber % 26 + ord('A')))
            columnNumber //= 26
        return ''.join(reversed(res))`,
    jsCode: `var convertToTitle = function(columnNumber) {
    const res = [];
    while (columnNumber) {
        columnNumber--;
        res.push(String.fromCharCode(columnNumber % 26 + 65));
        columnNumber = Math.floor(columnNumber / 26);
    }
    return res.reverse().join('');
};`,
    explanation:
      '1. Subtract 1 to convert from 1-indexed to 0-indexed.\n' +
      '2. Take modulo 26 to get the current digit (0=A, 25=Z).\n' +
      '3. Divide by 26 to process the next digit.\n' +
      '4. Build the result in reverse order.\n' +
      '5. Reverse at the end to get the correct order.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(log n)',
    hints: [
      'This is a base-26 conversion, but 1-indexed (A=1, not A=0).',
      'Subtract 1 before each modulo operation to handle the 1-indexing.',
      'Build characters from least significant to most significant, then reverse.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 171. Excel Sheet Column Number
  // ---------------------------------------------------------------------------
  {
    id: 171,
    description:
      'Given a string columnTitle that represents the column title as appears in an Excel sheet, return its corresponding column number. A = 1, B = 2, ..., Z = 26, AA = 27, AB = 28, ...',
    examples:
      'Input: columnTitle = "AB"\nOutput: 28',
    intuition:
      'This is simply base-26 to decimal conversion. Process each character left to right, multiplying the running total by 26 and adding the character\'s value (A=1, B=2, ..., Z=26). It works just like converting binary or hexadecimal to decimal.',
    approach:
      'Process the string from left to right. For each character, multiply the running total by 26 and add the character value (A=1, B=2, ..., Z=26). This is base-26 conversion.',
    code: `class Solution:
    def titleToNumber(self, columnTitle: str) -> int:
        result = 0
        for c in columnTitle:
            result = result * 26 + (ord(c) - ord('A') + 1)
        return result`,
    jsCode: `var titleToNumber = function(columnTitle) {
    let result = 0;
    for (const c of columnTitle) {
        result = result * 26 + (c.charCodeAt(0) - 64);
    }
    return result;
};`,
    explanation:
      '1. Process each character from left to right.\n' +
      '2. Multiply current result by 26 (shift left in base-26).\n' +
      '3. Add the value of the current character (A=1, Z=26).\n' +
      '4. This is standard base conversion from most significant to least significant.\n' +
      '5. The final result is the column number.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'This is the inverse of problem 168.',
      'Think of it as base-26 number conversion.',
      'Process left to right: result = result * 26 + char_value.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 172. Factorial Trailing Zeroes
  // ---------------------------------------------------------------------------
  {
    id: 172,
    description:
      'Given an integer n, return the number of trailing zeroes in n!. Trailing zeroes are produced by factors of 10 = 2 * 5. Since there are always more factors of 2 than 5, count the factors of 5.',
    examples:
      'Input: n = 5\nOutput: 1',
    intuition:
      'Trailing zeros come from factors of 10, and 10 = 2 x 5. Since there are always more factors of 2 than 5, just count factors of 5. Every multiple of 5 contributes one factor, every multiple of 25 contributes an extra, and so on.',
    approach:
      'Count the number of factors of 5 in n!. Each multiple of 5 contributes one factor, each multiple of 25 contributes an extra, each multiple of 125 contributes yet another, and so on.',
    code: `class Solution:
    def trailingZeroes(self, n: int) -> int:
        count = 0
        while n >= 5:
            n //= 5
            count += n
        return count`,
    jsCode: `var trailingZeroes = function(n) {
    let count = 0;
    while (n >= 5) {
        n = Math.floor(n / 5);
        count += n;
    }
    return count;
};`,
    explanation:
      '1. Trailing zeros come from factors of 10 = 2 * 5.\n' +
      '2. Factors of 2 are more abundant, so just count factors of 5.\n' +
      '3. n // 5 counts multiples of 5, n // 25 counts multiples of 25, etc.\n' +
      '4. Sum n//5 + n//25 + n//125 + ... until n < 5.\n' +
      '5. This is equivalent to repeatedly dividing n by 5 and summing.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Trailing zeros come from pairs of factors 2 and 5.',
      'There are always more 2s than 5s in n!, so just count the 5s.',
      'Multiples of 25 contribute two 5s, multiples of 125 contribute three, etc.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 173. Binary Search Tree Iterator
  // ---------------------------------------------------------------------------
  {
    id: 173,
    description:
      'Implement the BSTIterator class that represents an iterator over the in-order traversal of a binary search tree (BST). next() returns the next smallest number, hasNext() returns whether a next number exists. Both operations should run in average O(1) time and use O(h) memory.',
    examples:
      'Input: ["BSTIterator","next","next","hasNext","next","hasNext",...]\nOutput: [null,3,7,true,9,true,...]',
    intuition:
      'The stack stores the path to the next smallest element. Initialize by pushing all left children of the root. When next() is called, pop the top (the smallest), then push all left children of its right child. This lazily unfolds the in-order traversal on demand.',
    approach:
      'Use a stack to simulate in-order traversal. Push all left children onto the stack. When next() is called, pop the top, push all left children of its right child. The stack always contains the path to the next smallest element.',
    code: `class BSTIterator:
    def __init__(self, root):
        self.stack = []
        self._push_left(root)

    def _push_left(self, node):
        while node:
            self.stack.append(node)
            node = node.left

    def next(self) -> int:
        node = self.stack.pop()
        self._push_left(node.right)
        return node.val

    def hasNext(self) -> bool:
        return len(self.stack) > 0`,
    jsCode: `var BSTIterator = function(root) {
    this.stack = [];
    this._pushLeft(root);
};

BSTIterator.prototype._pushLeft = function(node) {
    while (node) {
        this.stack.push(node);
        node = node.left;
    }
};

BSTIterator.prototype.next = function() {
    const node = this.stack.pop();
    this._pushLeft(node.right);
    return node.val;
};

BSTIterator.prototype.hasNext = function() {
    return this.stack.length > 0;
};`,
    explanation:
      '1. Initialize by pushing all left children from root onto the stack.\n' +
      '2. next(): pop the top node (smallest), push left children of its right child.\n' +
      '3. hasNext(): check if the stack is non-empty.\n' +
      '4. The stack always maintains the path to the next smallest unvisited node.\n' +
      '5. Average O(1) per operation since each node is pushed/popped exactly once.',
    timeComplexity: 'O(1) average per operation',
    spaceComplexity: 'O(h)',
    hints: [
      'Use a stack to simulate in-order traversal incrementally.',
      'Push all left nodes to find the smallest element.',
      'After popping, process the right subtree.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 174. Dungeon Game
  // ---------------------------------------------------------------------------
  {
    id: 174,
    description:
      'The demons have captured the princess and imprisoned her in the bottom-right corner of a dungeon. The knight starts at the top-left corner and can only move right or down. Each room has an integer representing health gained or lost. Determine the minimum initial health needed so the knight can rescue the princess (health must stay >= 1 at all times).',
    examples:
      'Input: dungeon = [[-2,-3,3],[-5,-10,1],[10,30,-5]]\nOutput: 7',
    intuition:
      'Work backwards from the princess to the start. At each cell, the knight needs enough health to survive the current cell and still have enough for the best path forward. The minimum health is max(1, future_need - current_cell), ensuring health never drops below 1.',
    approach:
      'Use bottom-up DP starting from the princess cell. dp[i][j] = minimum health needed when entering cell (i,j). dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) - dungeon[i][j]).',
    code: `class Solution:
    def calculateMinimumHP(self, dungeon: list[list[int]]) -> int:
        m, n = len(dungeon), len(dungeon[0])
        dp = [[float('inf')] * (n + 1) for _ in range(m + 1)]
        dp[m][n - 1] = dp[m - 1][n] = 1
        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                need = min(dp[i + 1][j], dp[i][j + 1]) - dungeon[i][j]
                dp[i][j] = max(need, 1)
        return dp[0][0]`,
    jsCode: `var calculateMinimumHP = function(dungeon) {
    const m = dungeon.length, n = dungeon[0].length;
    const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(Infinity));
    dp[m][n - 1] = dp[m - 1][n] = 1;
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            const need = Math.min(dp[i + 1][j], dp[i][j + 1]) - dungeon[i][j];
            dp[i][j] = Math.max(need, 1);
        }
    }
    return dp[0][0];
};`,
    explanation:
      '1. Work backwards from the bottom-right corner.\n' +
      '2. dp[i][j] = minimum health needed entering cell (i,j).\n' +
      '3. To survive cell (i,j), need at least min(right, down) - dungeon[i][j] health.\n' +
      '4. Health must be at least 1 at all times, so take max with 1.\n' +
      '5. dp[0][0] is the answer.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Forward DP is tricky because health and path sum both matter.',
      'Work backwards: determine minimum health needed at each cell.',
      'Health must always be >= 1, so clamp with max(_, 1).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 179. Largest Number
  // ---------------------------------------------------------------------------
  {
    id: 179,
    description:
      'Given a list of non-negative integers nums, arrange them such that they form the largest number and return it as a string. The result may be very large, so return a string instead of an integer.',
    examples:
      'Input: nums = [10,2]\nOutput: "210"',
    intuition:
      'The key comparison is: for two numbers a and b, which ordering (ab or ba) produces the larger result? Sort the numbers using this custom comparator, then concatenate them. This greedy choice at each position provably produces the globally largest number.',
    approach:
      'Sort the numbers using a custom comparator: for two numbers a and b, compare the concatenations ab vs ba. If ab > ba, a should come first. This greedy approach produces the largest number.',
    code: `class Solution:
    def largestNumber(self, nums: list[int]) -> str:
        from functools import cmp_to_key
        def compare(a, b):
            if a + b > b + a:
                return -1
            elif a + b < b + a:
                return 1
            return 0
        strs = [str(n) for n in nums]
        strs.sort(key=cmp_to_key(compare))
        result = ''.join(strs)
        return '0' if result[0] == '0' else result`,
    jsCode: `var largestNumber = function(nums) {
    const strs = nums.map(String);
    strs.sort((a, b) => (b + a).localeCompare(a + b));
    const result = strs.join('');
    return result[0] === '0' ? '0' : result;
};`,
    explanation:
      '1. Convert all numbers to strings.\n' +
      '2. Sort with custom comparator: compare a+b vs b+a as strings.\n' +
      '3. If a+b > b+a, a should come before b.\n' +
      '4. Concatenate sorted strings.\n' +
      '5. Handle edge case: if result starts with "0", the answer is "0".',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'You need a custom sort order, not just numerical or lexicographic.',
      'Compare two numbers by checking which concatenation is larger.',
      'Handle the all-zeros case (e.g., [0, 0] should return "0").',
    ],
  },

  // ---------------------------------------------------------------------------
  // 187. Repeated DNA Sequences
  // ---------------------------------------------------------------------------
  {
    id: 187,
    description:
      'The DNA sequence is composed of a series of nucleotides abbreviated as A, C, G, and T. Given a string s that represents a DNA sequence, return all the 10-letter-long sequences (substrings) that occur more than once in the DNA molecule.',
    examples:
      'Input: s = "AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT"\nOutput: ["AAAAACCCCC","CCCCCAAAAA"]',
    intuition:
      'Use a sliding window of exactly 10 characters. Hash each window and track which sequences you\'ve seen. If a sequence appears more than once, it\'s repeated. The fixed window size makes this a straightforward sliding window + hash set problem.',
    approach:
      'Use a sliding window of size 10 and a hash set. For each window, check if the substring has been seen before. If yes, add it to the result set. If no, add it to the seen set.',
    code: `class Solution:
    def findRepeatedDnaSequences(self, s: str) -> list[str]:
        seen, repeated = set(), set()
        for i in range(len(s) - 9):
            seq = s[i:i + 10]
            if seq in seen:
                repeated.add(seq)
            else:
                seen.add(seq)
        return list(repeated)`,
    jsCode: `var findRepeatedDnaSequences = function(s) {
    const seen = new Set(), repeated = new Set();
    for (let i = 0; i <= s.length - 10; i++) {
        const seq = s.substring(i, i + 10);
        if (seen.has(seq)) repeated.add(seq);
        else seen.add(seq);
    }
    return [...repeated];
};`,
    explanation:
      '1. Slide a window of size 10 across the string.\n' +
      '2. For each 10-character substring, check if it was seen before.\n' +
      '3. If seen before, add to the repeated set.\n' +
      '4. If not seen, add to the seen set.\n' +
      '5. Return all repeated sequences.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a set to track all 10-letter sequences you have seen.',
      'Use another set for sequences that appear more than once.',
      'The window slides from position 0 to len(s) - 10.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 188. Best Time to Buy and Sell Stock IV
  // ---------------------------------------------------------------------------
  {
    id: 188,
    description:
      'You are given an integer array prices where prices[i] is the price of a given stock on the ith day, and an integer k. Find the maximum profit you can achieve with at most k transactions.',
    examples:
      'Input: k = 2, prices = [2,4,1]\nOutput: 2',
    intuition:
      'This generalizes the stock trading problem to k transactions. Use DP with states tracking the number of completed transactions and whether you\'re holding stock. When k is large enough (>= n/2), it reduces to the unlimited transactions case (simple greedy).',
    approach:
      'Use DP with states: dp[j][0] = max profit with j transactions completed, not holding; dp[j][1] = holding. If k >= n/2, it reduces to unlimited transactions (greedy). Otherwise, use O(k) space DP.',
    code: `class Solution:
    def maxProfit(self, k: int, prices: list[int]) -> int:
        n = len(prices)
        if n <= 1:
            return 0
        if k >= n // 2:
            return sum(max(0, prices[i] - prices[i-1]) for i in range(1, n))
        buy = [float('inf')] * (k + 1)
        sell = [0] * (k + 1)
        for price in prices:
            for j in range(1, k + 1):
                buy[j] = min(buy[j], price - sell[j - 1])
                sell[j] = max(sell[j], price - buy[j])
        return sell[k]`,
    jsCode: `var maxProfit = function(k, prices) {
    const n = prices.length;
    if (n <= 1) return 0;
    if (k >= Math.floor(n / 2)) {
        let profit = 0;
        for (let i = 1; i < n; i++) profit += Math.max(0, prices[i] - prices[i - 1]);
        return profit;
    }
    const buy = Array(k + 1).fill(Infinity);
    const sell = Array(k + 1).fill(0);
    for (const price of prices) {
        for (let j = 1; j <= k; j++) {
            buy[j] = Math.min(buy[j], price - sell[j - 1]);
            sell[j] = Math.max(sell[j], price - buy[j]);
        }
    }
    return sell[k];
};`,
    explanation:
      '1. If k >= n/2, unlimited transactions: sum all positive gains.\n' +
      '2. buy[j] = min cost to buy for the jth transaction.\n' +
      '3. sell[j] = max profit after the jth sell.\n' +
      '4. For each price, update all k transaction states.\n' +
      '5. sell[k] is the maximum profit with at most k transactions.',
    timeComplexity: 'O(n * k)',
    spaceComplexity: 'O(k)',
    hints: [
      'This generalizes Stock III (k=2) to arbitrary k.',
      'When k is large enough, reduce to unlimited transactions.',
      'Track buy and sell states for each transaction level.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 189. Rotate Array
  // ---------------------------------------------------------------------------
  {
    id: 189,
    description:
      'Given an integer array nums, rotate the array to the right by k steps, where k is non-negative. Do it in-place with O(1) extra memory.',
    examples:
      'Input: nums = [1,2,3,4,5,6,7], k = 3\nOutput: [5,6,7,1,2,3,4]',
    intuition:
      'The three-reverse trick is elegant: reverse the whole array, reverse the first k elements, then reverse the rest. Each reversal is O(n) and in-place. To see why it works, think of the array as two blocks that need to swap positions.',
    approach:
      'Use the three-reverse trick: reverse the entire array, then reverse the first k elements, then reverse the remaining elements. This achieves the rotation in-place.',
    code: `class Solution:
    def rotate(self, nums: list[int], k: int) -> None:
        n = len(nums)
        k %= n
        def reverse(l, r):
            while l < r:
                nums[l], nums[r] = nums[r], nums[l]
                l += 1
                r -= 1
        reverse(0, n - 1)
        reverse(0, k - 1)
        reverse(k, n - 1)`,
    jsCode: `var rotate = function(nums, k) {
    const n = nums.length;
    k %= n;
    function reverse(l, r) {
        while (l < r) {
            [nums[l], nums[r]] = [nums[r], nums[l]];
            l++;
            r--;
        }
    }
    reverse(0, n - 1);
    reverse(0, k - 1);
    reverse(k, n - 1);
};`,
    explanation:
      '1. Compute effective rotation: k %= n.\n' +
      '2. Reverse the entire array: [7,6,5,4,3,2,1].\n' +
      '3. Reverse the first k elements: [5,6,7,4,3,2,1].\n' +
      '4. Reverse the remaining elements: [5,6,7,1,2,3,4].\n' +
      '5. Three reversals achieve the rotation in O(1) extra space.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The three-reverse approach works in-place.',
      'Reverse the whole array, then reverse the two parts.',
      'Remember to take k % n to handle k larger than array length.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 190. Reverse Bits
  // ---------------------------------------------------------------------------
  {
    id: 190,
    description:
      'Reverse bits of a given 32 bits unsigned integer. Return the unsigned integer with its bits reversed.',
    examples:
      'Input: n = 43261596 (00000010100101000001111010011100)\nOutput: 964176192 (00111001011110000010100101000000)',
    intuition:
      'Build the reversed number bit by bit. Extract the last bit of n, shift it into position in the result, then shift n right. After 32 iterations, every bit has been placed in its mirror position.',
    approach:
      'Iterate 32 times. Each time, shift result left by 1 and add the last bit of n. Then shift n right by 1. This builds the reversed bit pattern.',
    code: `class Solution:
    def reverseBits(self, n: int) -> int:
        result = 0
        for _ in range(32):
            result = (result << 1) | (n & 1)
            n >>= 1
        return result`,
    jsCode: `var reverseBits = function(n) {
    let result = 0;
    for (let i = 0; i < 32; i++) {
        result = (result << 1) | (n & 1);
        n >>>= 1;
    }
    return result >>> 0;
};`,
    explanation:
      '1. Process all 32 bits one by one.\n' +
      '2. Shift result left by 1 to make room for the next bit.\n' +
      '3. Extract the last bit of n with n & 1.\n' +
      '4. Add it to result with OR.\n' +
      '5. Shift n right by 1 to process the next bit.',
    timeComplexity: 'O(1) - always 32 iterations',
    spaceComplexity: 'O(1)',
    hints: [
      'Process one bit at a time from right to left.',
      'Shift result left and add the current bit of n.',
      'Always process exactly 32 bits.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 197. Rising Temperature (SQL)
  // ---------------------------------------------------------------------------
  {
    id: 197,
    description:
      'Write a solution to find all dates id where the temperature is higher than the previous day temperature. The Weather table has columns: id, recordDate, temperature. Return the result table with the id column.',
    examples:
      'Input: Weather table = [(1,"2015-01-01",10),(2,"2015-01-02",25),(3,"2015-01-03",20),(4,"2015-01-04",30)]\nOutput: [(2,),(4,)]',
    intuition:
      'Join the table with itself where one row is exactly one day before the other. Use date arithmetic (DATEDIFF or date subtraction) to pair consecutive days, then filter for rows where today\'s temperature exceeds yesterday\'s.',
    approach:
      'Join the table with itself on consecutive dates using DATEDIFF or date arithmetic. Select rows where the current temperature exceeds the previous day temperature.',
    code: `# SQL Solution:
# SELECT w1.id
# FROM Weather w1
# JOIN Weather w2
# ON DATEDIFF(w1.recordDate, w2.recordDate) = 1
# WHERE w1.temperature > w2.temperature

# Python (Pandas) solution:
import pandas as pd

def rising_temperature(weather: pd.DataFrame) -> pd.DataFrame:
    weather.sort_values('recordDate', inplace=True)
    weather['prev_temp'] = weather['temperature'].shift(1)
    weather['prev_date'] = weather['recordDate'].shift(1)
    result = weather[
        (weather['temperature'] > weather['prev_temp']) &
        (weather['recordDate'] - weather['prev_date'] == pd.Timedelta(days=1))
    ]
    return result[['id']]`,
    jsCode: `// SQL Solution:
// SELECT w1.id
// FROM Weather w1
// JOIN Weather w2
// ON DATEDIFF(w1.recordDate, w2.recordDate) = 1
// WHERE w1.temperature > w2.temperature
//
// This is a SQL problem; no direct JavaScript equivalent.
// The approach: self-join on consecutive dates and filter by temperature.`,
    explanation:
      '1. Sort by recordDate to align consecutive days.\n' +
      '2. Compare each day temperature with the previous day.\n' +
      '3. Ensure the dates are exactly 1 day apart (handles gaps).\n' +
      '4. Select rows where temperature increased.\n' +
      '5. Return just the id column.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Join the table with itself on consecutive dates.',
      'Use DATEDIFF to find rows exactly 1 day apart.',
      'Compare temperatures between the two joined rows.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 201. Bitwise AND of Numbers Range
  // ---------------------------------------------------------------------------
  {
    id: 201,
    description:
      'Given two integers left and right that represent the range [left, right], return the bitwise AND of all numbers in this range, inclusive.',
    examples:
      'Input: left = 5, right = 7\nOutput: 4',
    intuition:
      'The bitwise AND of all numbers in a range zeros out any bit position where at least one number has a 0. As you count from left to right, lower bits flip frequently. The result is just the common binary prefix of left and right, with the rest zeroed out.',
    approach:
      'The bitwise AND of a range equals the common prefix of left and right in binary. Right-shift both until they are equal, then left-shift back by the number of shifts.',
    code: `class Solution:
    def rangeBitwiseAnd(self, left: int, right: int) -> int:
        shift = 0
        while left != right:
            left >>= 1
            right >>= 1
            shift += 1
        return left << shift`,
    jsCode: `var rangeBitwiseAnd = function(left, right) {
    let shift = 0;
    while (left !== right) {
        left >>= 1;
        right >>= 1;
        shift++;
    }
    return left << shift;
};`,
    explanation:
      '1. Bitwise AND of a range zeros out all bits that differ between left and right.\n' +
      '2. Right-shift both numbers until they are equal (finding common prefix).\n' +
      '3. Count the number of shifts performed.\n' +
      '4. Left-shift the common prefix back by the shift count.\n' +
      '5. The shifted-out bits are all zeros in the AND result.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Between left and right, some lower bits will inevitably become 0.',
      'Find the common prefix of left and right in binary.',
      'Shift both right until they match, then shift back.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 203. Remove Linked List Elements
  // ---------------------------------------------------------------------------
  {
    id: 203,
    description:
      'Given the head of a linked list and an integer val, remove all the nodes of the linked list that have Node.val == val, and return the new head.',
    examples:
      'Input: head = [1,2,6,3,4,5,6], val = 6\nOutput: [1,2,3,4,5]',
    intuition:
      'Use a dummy node before the head to handle removal of the head uniformly. Walk through the list: if the next node\'s value matches the target, skip it by updating the pointer; otherwise, advance to the next node.',
    approach:
      'Use a dummy node before the head. Iterate through the list, skipping nodes with the target value by adjusting the previous node\'s next pointer.',
    code: `class Solution:
    def removeElements(self, head, val: int):
        dummy = ListNode(0, head)
        prev = dummy
        while prev.next:
            if prev.next.val == val:
                prev.next = prev.next.next
            else:
                prev = prev.next
        return dummy.next`,
    jsCode: `var removeElements = function(head, val) {
    const dummy = new ListNode(0, head);
    let prev = dummy;
    while (prev.next) {
        if (prev.next.val === val) prev.next = prev.next.next;
        else prev = prev.next;
    }
    return dummy.next;
};`,
    explanation:
      '1. Create a dummy node pointing to head.\n' +
      '2. Iterate with prev pointer.\n' +
      '3. If prev.next has the target value, skip it.\n' +
      '4. Otherwise, advance prev.\n' +
      '5. Return dummy.next as the new head.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'A dummy node handles the case where head itself needs removal.',
      'Check the next node, not the current node, so you can skip it.',
      'Only advance prev when you do not remove a node.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 204. Count Primes
  // ---------------------------------------------------------------------------
  {
    id: 204,
    description:
      'Given an integer n, return the number of prime numbers that are strictly less than n.',
    examples:
      'Input: n = 10\nOutput: 4\nExplanation: Primes less than 10: 2, 3, 5, 7.',
    intuition:
      'The Sieve of Eratosthenes is the classic algorithm: start with all numbers marked as prime, then for each prime p, mark all its multiples as not prime. The key optimization is starting from p^2 (smaller multiples were already marked by smaller primes).',
    approach:
      'Use the Sieve of Eratosthenes. Create a boolean array of size n, initially all True. For each prime p starting from 2, mark all multiples of p as not prime. Count remaining True values.',
    code: `class Solution:
    def countPrimes(self, n: int) -> int:
        if n <= 2:
            return 0
        is_prime = [True] * n
        is_prime[0] = is_prime[1] = False
        for i in range(2, int(n**0.5) + 1):
            if is_prime[i]:
                for j in range(i * i, n, i):
                    is_prime[j] = False
        return sum(is_prime)`,
    jsCode: `var countPrimes = function(n) {
    if (n <= 2) return 0;
    const isPrime = Array(n).fill(true);
    isPrime[0] = isPrime[1] = false;
    for (let i = 2; i * i < n; i++) {
        if (isPrime[i]) {
            for (let j = i * i; j < n; j += i) isPrime[j] = false;
        }
    }
    return isPrime.filter(Boolean).length;
};`,
    explanation:
      '1. Initialize a boolean array: all True except indices 0 and 1.\n' +
      '2. For each number i from 2 to sqrt(n), if it is prime:\n' +
      '3. Mark all multiples of i starting from i*i as not prime.\n' +
      '4. Starting from i*i is an optimization (smaller multiples already marked).\n' +
      '5. Count and return all True values in the array.',
    timeComplexity: 'O(n log log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The Sieve of Eratosthenes is the classic algorithm for this.',
      'Only need to sieve up to sqrt(n).',
      'Start marking multiples from i*i since smaller multiples are already marked.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 205. Isomorphic Strings
  // ---------------------------------------------------------------------------
  {
    id: 205,
    description:
      'Given two strings s and t, determine if they are isomorphic. Two strings are isomorphic if the characters in s can be replaced to get t, with a one-to-one mapping. No two characters may map to the same character, but a character may map to itself.',
    examples:
      'Input: s = "egg", t = "add"\nOutput: true',
    intuition:
      'Two strings are isomorphic if there\'s a consistent one-to-one mapping between their characters. Use two maps to track the bidirectional mapping. If a character in s maps to a different character in t than expected (or vice versa), the mapping is broken.',
    approach:
      'Use two hash maps: one mapping s chars to t chars, and one mapping t chars to s chars. For each character pair, verify the mappings are consistent in both directions.',
    code: `class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        s_to_t = {}
        t_to_s = {}
        for cs, ct in zip(s, t):
            if cs in s_to_t:
                if s_to_t[cs] != ct:
                    return False
            else:
                if ct in t_to_s:
                    return False
                s_to_t[cs] = ct
                t_to_s[ct] = cs
        return True`,
    jsCode: `var isIsomorphic = function(s, t) {
    const sToT = {}, tToS = {};
    for (let i = 0; i < s.length; i++) {
        const cs = s[i], ct = t[i];
        if (cs in sToT) {
            if (sToT[cs] !== ct) return false;
        } else {
            if (ct in tToS) return false;
            sToT[cs] = ct;
            tToS[ct] = cs;
        }
    }
    return true;
};`,
    explanation:
      '1. Maintain two maps for bidirectional character mapping.\n' +
      '2. For each pair (cs, ct), check if cs already maps to something.\n' +
      '3. If cs maps to a different character than ct, return False.\n' +
      '4. If cs is new but ct is already mapped to a different character, return False.\n' +
      '5. If all pairs are consistent, the strings are isomorphic.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) - at most 256 character mappings',
    hints: [
      'Use two maps to ensure the mapping is bijective.',
      'Check both directions: s -> t and t -> s.',
      'Two different characters in s cannot map to the same character in t.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 212. Word Search II
  // ---------------------------------------------------------------------------
  {
    id: 212,
    description:
      'Given an m x n board of characters and a list of strings words, return all words on the board. Each word must be constructed from letters of sequentially adjacent cells (horizontal or vertical). A cell may not be used more than once in a word.',
    examples:
      'Input: board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]\nOutput: ["eat","oath"]',
    intuition:
      'Build a Trie from the word list, then DFS from each board cell following Trie paths. The Trie lets you search for all words simultaneously rather than one at a time. Pruning Trie branches after finding words prevents redundant exploration.',
    approach:
      'Build a Trie from the word list. DFS from each cell on the board, following Trie paths. When a complete word is found, add it to results. Prune Trie branches after finding words for efficiency.',
    code: `class Solution:
    def findWords(self, board: list[list[str]], words: list[str]) -> list[str]:
        trie = {}
        for word in words:
            node = trie
            for c in word:
                node = node.setdefault(c, {})
            node['#'] = word

        m, n = len(board), len(board[0])
        res = []

        def dfs(i, j, node):
            c = board[i][j]
            if c not in node:
                return
            nxt = node[c]
            if '#' in nxt:
                res.append(nxt.pop('#'))
            board[i][j] = '.'
            for di, dj in ((0,1),(0,-1),(1,0),(-1,0)):
                ni, nj = i + di, j + dj
                if 0 <= ni < m and 0 <= nj < n and board[ni][nj] != '.':
                    dfs(ni, nj, nxt)
            board[i][j] = c
            if not nxt:
                del node[c]

        for i in range(m):
            for j in range(n):
                dfs(i, j, trie)
        return res`,
    jsCode: `var findWords = function(board, words) {
    const trie = {};
    for (const word of words) {
        let node = trie;
        for (const c of word) {
            if (!node[c]) node[c] = {};
            node = node[c];
        }
        node['#'] = word;
    }
    const m = board.length, n = board[0].length;
    const res = [];
    function dfs(i, j, node) {
        const c = board[i][j];
        if (!node[c]) return;
        const nxt = node[c];
        if (nxt['#']) { res.push(nxt['#']); delete nxt['#']; }
        board[i][j] = '.';
        const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
        for (const [di, dj] of dirs) {
            const ni = i + di, nj = j + dj;
            if (ni >= 0 && ni < m && nj >= 0 && nj < n && board[ni][nj] !== '.') {
                dfs(ni, nj, nxt);
            }
        }
        board[i][j] = c;
        if (Object.keys(nxt).length === 0) delete node[c];
    }
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) dfs(i, j, trie);
    }
    return res;
};`,
    explanation:
      '1. Build a Trie from all words for efficient prefix matching.\n' +
      '2. DFS from each cell, following Trie paths.\n' +
      '3. Mark visited cells by replacing with "." and restore after.\n' +
      '4. When "#" is found in Trie node, a complete word is found.\n' +
      '5. Prune empty Trie branches to avoid redundant searches.',
    timeComplexity: 'O(m * n * 4^L) where L is max word length',
    spaceComplexity: 'O(total characters in words)',
    hints: [
      'A Trie allows searching multiple words simultaneously.',
      'DFS from each cell, following Trie paths.',
      'Prune Trie branches after finding words for efficiency.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 214. Shortest Palindrome
  // ---------------------------------------------------------------------------
  {
    id: 214,
    description:
      'You are given a string s. You can convert s to a palindrome by adding characters in front of it. Return the shortest palindrome you can find by performing this transformation.',
    examples:
      'Input: s = "aacecaaa"\nOutput: "aaacecaaa"',
    intuition:
      'You need to find the longest palindromic prefix of the string, then prepend the reverse of the remaining suffix. The KMP failure function on s + \'#\' + reverse(s) efficiently finds this longest palindromic prefix without brute-force checking.',
    approach:
      'Find the longest palindromic prefix of s. The remaining suffix, reversed, needs to be prepended. Use KMP failure function on s + "#" + reverse(s) to find the longest palindromic prefix efficiently.',
    code: `class Solution:
    def shortestPalindrome(self, s: str) -> str:
        rev = s[::-1]
        combined = s + '#' + rev
        n = len(combined)
        lps = [0] * n
        for i in range(1, n):
            j = lps[i - 1]
            while j > 0 and combined[i] != combined[j]:
                j = lps[j - 1]
            if combined[i] == combined[j]:
                j += 1
            lps[i] = j
        return rev[:len(s) - lps[-1]] + s`,
    jsCode: `var shortestPalindrome = function(s) {
    const rev = s.split('').reverse().join('');
    const combined = s + '#' + rev;
    const n = combined.length;
    const lps = Array(n).fill(0);
    for (let i = 1; i < n; i++) {
        let j = lps[i - 1];
        while (j > 0 && combined[i] !== combined[j]) j = lps[j - 1];
        if (combined[i] === combined[j]) j++;
        lps[i] = j;
    }
    return rev.substring(0, s.length - lps[n - 1]) + s;
};`,
    explanation:
      '1. Reverse s to get rev.\n' +
      '2. Combine as s + "#" + rev (# prevents overlap).\n' +
      '3. Compute the KMP failure function (lps array).\n' +
      '4. lps[-1] gives the length of the longest palindromic prefix of s.\n' +
      '5. Prepend the reverse of the non-palindromic suffix to s.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Find the longest palindromic prefix of s.',
      'The KMP failure function can find this efficiently.',
      'Concatenate s + "#" + reverse(s) and find the LPS value at the end.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 218. The Skyline Problem
  // ---------------------------------------------------------------------------
  {
    id: 218,
    description:
      'A city skyline is formed by a group of buildings. Given the locations and heights of all the buildings, return the skyline formed by these buildings as a list of key points [x, y] sorted by x-coordinate.',
    examples:
      'Input: buildings = [[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]\nOutput: [[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]]',
    intuition:
      'Think of buildings as creating \'events\' at their edges. At each left edge a height enters, at each right edge it leaves. Use a max-heap to track active heights. A skyline key point occurs whenever the maximum height changes between consecutive events.',
    approach:
      'Process building edges as events. At each x-coordinate, add heights for building starts and remove for ends. Use a max-heap to track the current maximum height. Record a key point when the max height changes.',
    code: `class Solution:
    def getSkyline(self, buildings: list[list[int]]) -> list[list[int]]:
        import heapq
        events = []
        for l, r, h in buildings:
            events.append((l, -h, r))
            events.append((r, 0, 0))
        events.sort()
        res = [[0, 0]]
        heap = [(0, float('inf'))]
        for x, neg_h, r in events:
            while heap[0][1] <= x:
                heapq.heappop(heap)
            if neg_h:
                heapq.heappush(heap, (neg_h, r))
            if res[-1][1] != -heap[0][0]:
                res.append([x, -heap[0][0]])
        return res[1:]`,
    jsCode: `var getSkyline = function(buildings) {
    const events = [];
    for (const [l, r, h] of buildings) {
        events.push([l, -h, r]);
        events.push([r, 0, 0]);
    }
    events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const res = [[0, 0]];
    // Use a simple sorted structure (array-based max heap simulation)
    const heap = [[0, Infinity]]; // [negHeight, rightEdge]
    for (const [x, negH, r] of events) {
        while (heap[0][1] <= x) {
            heap.splice(0, 1);
        }
        if (negH) {
            heap.push([negH, r]);
            heap.sort((a, b) => a[0] - b[0]);
        }
        if (res[res.length - 1][1] !== -heap[0][0]) {
            res.push([x, -heap[0][0]]);
        }
    }
    return res.slice(1);
};`,
    explanation:
      '1. Create events: (x, -height, right) for starts, (right, 0, 0) for ends.\n' +
      '2. Sort events by x (starts before ends at same x, taller before shorter).\n' +
      '3. Use a max-heap (negate heights) to track active building heights.\n' +
      '4. Remove expired buildings (right edge <= current x).\n' +
      '5. When the max height changes, record a key point.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Process events at building starts and ends.',
      'Use a max-heap to track the current tallest building.',
      'A key point occurs when the maximum height changes.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 219. Contains Duplicate II
  // ---------------------------------------------------------------------------
  {
    id: 219,
    description:
      'Given an integer array nums and an integer k, return true if there are two distinct indices i and j in the array such that nums[i] == nums[j] and abs(i - j) <= k.',
    examples:
      'Input: nums = [1,2,3,1], k = 3\nOutput: true',
    intuition:
      'Maintain a sliding window of the last k indices using a hash set. As you scan, check if the current element is already in the set (meaning a duplicate within distance k exists). If the set exceeds size k, remove the oldest element.',
    approach:
      'Use a sliding window with a hash set of size at most k. As you iterate, add the current element. If the set already contains it, return true. If the set size exceeds k, remove the oldest element.',
    code: `class Solution:
    def containsNearbyDuplicate(self, nums: list[int], k: int) -> bool:
        window = set()
        for i, num in enumerate(nums):
            if num in window:
                return True
            window.add(num)
            if len(window) > k:
                window.remove(nums[i - k])
        return False`,
    jsCode: `var containsNearbyDuplicate = function(nums, k) {
    const window = new Set();
    for (let i = 0; i < nums.length; i++) {
        if (window.has(nums[i])) return true;
        window.add(nums[i]);
        if (window.size > k) window.delete(nums[i - k]);
    }
    return false;
};`,
    explanation:
      '1. Maintain a set of elements in the current window of size k.\n' +
      '2. For each element, check if it already exists in the window.\n' +
      '3. If yes, found a duplicate within distance k.\n' +
      '4. Add the element to the window.\n' +
      '5. If window exceeds size k, remove the element that exited the window.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k)',
    hints: [
      'Use a sliding window of size k with a hash set.',
      'Check if the current element is in the set before adding.',
      'Remove elements that fall out of the window.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 220. Contains Duplicate III
  // ---------------------------------------------------------------------------
  {
    id: 220,
    description:
      'Given an integer array nums and two integers indexDiff and valueDiff, find a pair of indices (i, j) such that i != j, abs(i - j) <= indexDiff, and abs(nums[i] - nums[j]) <= valueDiff. Return true if such a pair exists.',
    examples:
      'Input: nums = [1,2,3,1], indexDiff = 3, valueDiff = 0\nOutput: true',
    intuition:
      'Bucket sort makes this elegant. Create buckets of size (valueDiff + 1) so any two elements in the same bucket are guaranteed to be within valueDiff. Also check adjacent buckets. Maintain a sliding window of indexDiff buckets to satisfy the index constraint.',
    approach:
      'Use bucket sort. Create buckets of size valueDiff + 1. For each element, check the same bucket and adjacent buckets. If any bucket contains an element within the value range, return true. Maintain a sliding window of indexDiff buckets.',
    code: `class Solution:
    def containsNearbyAlmostDuplicate(self, nums: list[int], indexDiff: int, valueDiff: int) -> bool:
        if valueDiff < 0:
            return False
        buckets = {}
        w = valueDiff + 1
        for i, num in enumerate(nums):
            bucket_id = num // w
            if bucket_id in buckets:
                return True
            if bucket_id - 1 in buckets and abs(num - buckets[bucket_id - 1]) < w:
                return True
            if bucket_id + 1 in buckets and abs(num - buckets[bucket_id + 1]) < w:
                return True
            buckets[bucket_id] = num
            if i >= indexDiff:
                del buckets[nums[i - indexDiff] // w]
        return False`,
    jsCode: `var containsNearbyAlmostDuplicate = function(nums, indexDiff, valueDiff) {
    if (valueDiff < 0) return false;
    const buckets = new Map();
    const w = valueDiff + 1;
    for (let i = 0; i < nums.length; i++) {
        const bucketId = Math.floor(nums[i] / w);
        if (buckets.has(bucketId)) return true;
        if (buckets.has(bucketId - 1) && Math.abs(nums[i] - buckets.get(bucketId - 1)) < w) return true;
        if (buckets.has(bucketId + 1) && Math.abs(nums[i] - buckets.get(bucketId + 1)) < w) return true;
        buckets.set(bucketId, nums[i]);
        if (i >= indexDiff) buckets.delete(Math.floor(nums[i - indexDiff] / w));
    }
    return false;
};`,
    explanation:
      '1. Create buckets of width valueDiff + 1.\n' +
      '2. Elements in the same bucket are within valueDiff of each other.\n' +
      '3. Also check adjacent buckets for elements within valueDiff.\n' +
      '4. Maintain at most indexDiff buckets by removing old elements.\n' +
      '5. If any check succeeds, return True.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(indexDiff)',
    hints: [
      'Bucket sort with bucket size valueDiff + 1.',
      'Two elements in the same bucket are guaranteed to be within valueDiff.',
      'Check adjacent buckets for elements that might also be within valueDiff.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 222. Count Complete Tree Nodes
  // ---------------------------------------------------------------------------
  {
    id: 222,
    description:
      'Given the root of a complete binary tree, return the number of nodes. A complete binary tree has every level fully filled except possibly the last, which is filled from left to right. Design an algorithm that runs in less than O(n) time complexity.',
    examples:
      'Input: root = [1,2,3,4,5,6]\nOutput: 6',
    intuition:
      'In a complete binary tree, either the left or right subtree is a perfect binary tree. Compare subtree heights: if equal, the left is perfect (count its nodes with 2^h - 1 + 1 and recurse right). If unequal, the right is perfect at one level shorter. This gives O(log^2 n) time.',
    approach:
      'Compare the left and right subtree heights. If equal, the left subtree is a perfect binary tree with 2^h - 1 nodes plus the root. Recurse on the right. If unequal, the right subtree is perfect, recurse on the left.',
    code: `class Solution:
    def countNodes(self, root) -> int:
        if not root:
            return 0
        left_h = right_h = 0
        l, r = root, root
        while l:
            left_h += 1
            l = l.left
        while r:
            right_h += 1
            r = r.right
        if left_h == right_h:
            return (1 << left_h) - 1
        return 1 + self.countNodes(root.left) + self.countNodes(root.right)`,
    jsCode: `var countNodes = function(root) {
    if (!root) return 0;
    let leftH = 0, rightH = 0;
    let l = root, r = root;
    while (l) { leftH++; l = l.left; }
    while (r) { rightH++; r = r.right; }
    if (leftH === rightH) return (1 << leftH) - 1;
    return 1 + countNodes(root.left) + countNodes(root.right);
};`,
    explanation:
      '1. Compute left height (going all left) and right height (going all right).\n' +
      '2. If equal, the tree is perfect: return 2^h - 1.\n' +
      '3. If not equal, recurse on both subtrees plus 1 for root.\n' +
      '4. In each recursion, one subtree will be perfect, so only one path recurses.\n' +
      '5. This gives O(log^2 n) time complexity.',
    timeComplexity: 'O(log^2 n)',
    spaceComplexity: 'O(log n)',
    hints: [
      'A complete binary tree has a special structure you can exploit.',
      'Compare left and right heights to determine if a subtree is perfect.',
      'A perfect binary tree of height h has 2^h - 1 nodes.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 224. Basic Calculator
  // ---------------------------------------------------------------------------
  {
    id: 224,
    description:
      'Given a string s representing a valid expression containing digits, +, -, (, ), and spaces, implement a basic calculator to evaluate it. The expression may contain nested parentheses.',
    examples:
      'Input: s = "(1+(4+5+2)-3)+(6+8)"\nOutput: 23',
    intuition:
      'The stack handles nested parentheses by saving and restoring context. When you see \'(\', push the current result and sign, then reset. When you see \')\', pop and combine. Between parentheses, process numbers and +/- signs linearly.',
    approach:
      'Use a stack to handle parentheses. Track a running result and sign. When encountering "(", push current result and sign onto the stack. When encountering ")", pop and combine with the parenthesized result.',
    code: `class Solution:
    def calculate(self, s: str) -> int:
        stack = []
        result = 0
        num = 0
        sign = 1
        for c in s:
            if c.isdigit():
                num = num * 10 + int(c)
            elif c == '+':
                result += sign * num
                num = 0
                sign = 1
            elif c == '-':
                result += sign * num
                num = 0
                sign = -1
            elif c == '(':
                stack.append(result)
                stack.append(sign)
                result = 0
                sign = 1
            elif c == ')':
                result += sign * num
                num = 0
                result *= stack.pop()
                result += stack.pop()
        result += sign * num
        return result`,
    jsCode: `var calculate = function(s) {
    const stack = [];
    let result = 0, num = 0, sign = 1;
    for (const c of s) {
        if (c >= '0' && c <= '9') {
            num = num * 10 + Number(c);
        } else if (c === '+') {
            result += sign * num;
            num = 0;
            sign = 1;
        } else if (c === '-') {
            result += sign * num;
            num = 0;
            sign = -1;
        } else if (c === '(') {
            stack.push(result);
            stack.push(sign);
            result = 0;
            sign = 1;
        } else if (c === ')') {
            result += sign * num;
            num = 0;
            result *= stack.pop();
            result += stack.pop();
        }
    }
    result += sign * num;
    return result;
};`,
    explanation:
      '1. Track running result, current number, and current sign.\n' +
      '2. On digit: build the multi-digit number.\n' +
      '3. On + or -: apply sign to current number, add to result, update sign.\n' +
      '4. On (: push result and sign, reset for the sub-expression.\n' +
      '5. On ): finalize sub-expression, pop sign and previous result, combine.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a stack to save state before entering parentheses.',
      'Track the current sign (1 or -1) to handle + and -.',
      'When closing parentheses, combine the sub-expression result with the outer.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 225. Implement Stack using Queues
  // ---------------------------------------------------------------------------
  {
    id: 225,
    description:
      'Implement a last-in-first-out (LIFO) stack using only two queues. The implemented stack should support push, top, pop, and empty operations.',
    examples:
      'Input: ["MyStack","push","push","top","pop","empty"]\nOutput: [null,null,null,2,2,false]',
    intuition:
      'A queue is FIFO, but a stack needs LIFO. The trick: after pushing an element, rotate the entire queue so the new element ends up at the front. Now pop and peek just use the queue\'s front. Push is O(n), but pop and peek become O(1).',
    approach:
      'Use a single queue. On push, add the element, then rotate the queue so the new element is at the front. This makes pop and top O(1) while push is O(n).',
    code: `from collections import deque

class MyStack:
    def __init__(self):
        self.q = deque()

    def push(self, x: int) -> None:
        self.q.append(x)
        for _ in range(len(self.q) - 1):
            self.q.append(self.q.popleft())

    def pop(self) -> int:
        return self.q.popleft()

    def top(self) -> int:
        return self.q[0]

    def empty(self) -> bool:
        return len(self.q) == 0`,
    jsCode: `var MyStack = function() {
    this.q = [];
};

MyStack.prototype.push = function(x) {
    this.q.push(x);
    for (let i = 0; i < this.q.length - 1; i++) {
        this.q.push(this.q.shift());
    }
};

MyStack.prototype.pop = function() {
    return this.q.shift();
};

MyStack.prototype.top = function() {
    return this.q[0];
};

MyStack.prototype.empty = function() {
    return this.q.length === 0;
};`,
    explanation:
      '1. Use a single deque (queue).\n' +
      '2. On push: add element, then rotate all previous elements to the back.\n' +
      '3. This puts the newest element at the front (LIFO order).\n' +
      '4. Pop and top simply access the front of the queue.\n' +
      '5. Push is O(n), all other operations are O(1).',
    timeComplexity: 'O(n) for push, O(1) for pop/top',
    spaceComplexity: 'O(n)',
    hints: [
      'After pushing, rotate the queue to put the new element at the front.',
      'This makes pop and top trivial.',
      'One queue is sufficient with this rotation approach.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 227. Basic Calculator II
  // ---------------------------------------------------------------------------
  {
    id: 227,
    description:
      'Given a string s which represents an expression containing digits, +, -, *, and / (no parentheses), evaluate it and return its value. Integer division should truncate toward zero.',
    examples:
      'Input: s = "3+2*2"\nOutput: 7',
    intuition:
      'Process the expression in one pass using a stack. For + and -, push the number (with its sign) onto the stack for later. For * and /, immediately compute with the top of the stack. At the end, sum everything in the stack.',
    approach:
      'Use a stack. Process numbers and operators. For + and -, push the number (with sign) onto the stack. For * and /, pop the top and compute with the current number, push the result. Sum the stack at the end.',
    code: `class Solution:
    def calculate(self, s: str) -> int:
        stack = []
        num = 0
        op = '+'
        for i, c in enumerate(s):
            if c.isdigit():
                num = num * 10 + int(c)
            if c in '+-*/' or i == len(s) - 1:
                if op == '+':
                    stack.append(num)
                elif op == '-':
                    stack.append(-num)
                elif op == '*':
                    stack.append(stack.pop() * num)
                elif op == '/':
                    stack.append(int(stack.pop() / num))
                op = c
                num = 0
        return sum(stack)`,
    jsCode: `var calculate = function(s) {
    const stack = [];
    let num = 0, op = '+';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c >= '0' && c <= '9') num = num * 10 + Number(c);
        if ('+-*/'.includes(c) || i === s.length - 1) {
            if (op === '+') stack.push(num);
            else if (op === '-') stack.push(-num);
            else if (op === '*') stack.push(stack.pop() * num);
            else if (op === '/') stack.push(Math.trunc(stack.pop() / num));
            op = c;
            num = 0;
        }
    }
    return stack.reduce((a, b) => a + b, 0);
};`,
    explanation:
      '1. Track the current number and the previous operator.\n' +
      '2. When an operator or end of string is reached, process the previous operator.\n' +
      '3. For + and -: push number (with sign) onto stack.\n' +
      '4. For * and /: pop top, compute, push result (handles precedence).\n' +
      '5. Sum the stack for the final answer.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a stack to handle operator precedence.',
      'Process * and / immediately; defer + and - by pushing to stack.',
      'Sum the stack at the end to get the result.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 229. Majority Element II
  // ---------------------------------------------------------------------------
  {
    id: 229,
    description:
      'Given an integer array of size n, find all elements that appear more than n/3 times. The algorithm should run in linear time and O(1) space.',
    examples:
      'Input: nums = [3,2,3]\nOutput: [3]',
    intuition:
      'There can be at most two elements appearing more than n/3 times. Boyer-Moore voting with two candidates efficiently finds them: maintain two candidates and their counts, and when neither matches, decrement both counts. A second pass verifies the candidates.',
    approach:
      'Use Boyer-Moore Voting with two candidates. There can be at most two majority elements. Track two candidates and their counts. Verify candidates in a second pass.',
    code: `class Solution:
    def majorityElement(self, nums: list[int]) -> list[int]:
        c1 = c2 = None
        cnt1 = cnt2 = 0
        for num in nums:
            if num == c1:
                cnt1 += 1
            elif num == c2:
                cnt2 += 1
            elif cnt1 == 0:
                c1, cnt1 = num, 1
            elif cnt2 == 0:
                c2, cnt2 = num, 1
            else:
                cnt1 -= 1
                cnt2 -= 1
        return [c for c in (c1, c2) if nums.count(c) > len(nums) // 3]`,
    jsCode: `var majorityElement = function(nums) {
    let c1 = null, c2 = null, cnt1 = 0, cnt2 = 0;
    for (const num of nums) {
        if (num === c1) cnt1++;
        else if (num === c2) cnt2++;
        else if (cnt1 === 0) { c1 = num; cnt1 = 1; }
        else if (cnt2 === 0) { c2 = num; cnt2 = 1; }
        else { cnt1--; cnt2--; }
    }
    const threshold = Math.floor(nums.length / 3);
    return [c1, c2].filter(c => nums.filter(x => x === c).length > threshold);
};`,
    explanation:
      '1. There can be at most 2 elements appearing more than n/3 times.\n' +
      '2. Use Boyer-Moore voting with two candidates.\n' +
      '3. If num matches a candidate, increment its count.\n' +
      '4. If a count is 0, replace that candidate.\n' +
      '5. Verify candidates with a second pass (count occurrences).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'At most 2 elements can appear more than n/3 times.',
      'Extend Boyer-Moore voting to track two candidates.',
      'Always verify candidates in a second pass.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 231. Power of Two
  // ---------------------------------------------------------------------------
  {
    id: 231,
    description:
      'Given an integer n, return true if it is a power of two. Otherwise, return false. An integer n is a power of two if there exists an integer x such that n == 2^x.',
    examples:
      'Input: n = 16\nOutput: true',
    intuition:
      'A power of two in binary has exactly one bit set (like 1, 10, 100, 1000). The bit trick n & (n-1) clears the lowest set bit. If the result is 0 and n is positive, there was only one set bit, confirming it\'s a power of two.',
    approach:
      'A power of two has exactly one bit set in binary. Use the bit trick: n & (n - 1) == 0 removes the lowest set bit. If the result is 0 and n > 0, it is a power of two.',
    code: `class Solution:
    def isPowerOfTwo(self, n: int) -> bool:
        return n > 0 and (n & (n - 1)) == 0`,
    jsCode: `var isPowerOfTwo = function(n) {
    return n > 0 && (n & (n - 1)) === 0;
};`,
    explanation:
      '1. A power of two in binary has exactly one 1-bit (e.g., 1000).\n' +
      '2. n - 1 flips all bits below that 1-bit (e.g., 0111).\n' +
      '3. n & (n - 1) clears the lowest set bit.\n' +
      '4. If the result is 0, there was only one set bit: power of two.\n' +
      '5. Also check n > 0 since 0 and negative numbers are not powers of two.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    hints: [
      'Powers of two have exactly one bit set in binary.',
      'n & (n - 1) clears the lowest set bit.',
      'If the result is 0 and n > 0, it is a power of two.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 237. Delete Node in a Linked List
  // ---------------------------------------------------------------------------
  {
    id: 237,
    description:
      'There is a singly-linked list and you are given a node to delete (not the tail). You do not have access to the head of the list. Delete the given node by modifying the list in-place.',
    examples:
      'Input: head = [4,5,1,9], node = 5\nOutput: [4,1,9]',
    intuition:
      'You can\'t access the previous node to rewire pointers, but you can \'become\' the next node. Copy the next node\'s value into the current node, then skip the next node entirely. It\'s like the current node disguises itself as its successor.',
    approach:
      'Since you cannot access the previous node, copy the value from the next node into the current node, then skip the next node. This effectively deletes the current node by overwriting it.',
    code: `class Solution:
    def deleteNode(self, node):
        node.val = node.next.val
        node.next = node.next.next`,
    jsCode: `var deleteNode = function(node) {
    node.val = node.next.val;
    node.next = node.next.next;
};`,
    explanation:
      '1. Copy the value from the next node into the current node.\n' +
      '2. Set current node\'s next to skip the next node.\n' +
      '3. The next node is effectively removed from the list.\n' +
      '4. This works because we are guaranteed the node is not the tail.\n' +
      '5. The node "deletes" itself by becoming its successor.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    hints: [
      'You cannot access the previous node.',
      'Instead of removing this node, overwrite it with the next node.',
      'Copy the next node value and skip the next node.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 240. Search a 2D Matrix II
  // ---------------------------------------------------------------------------
  {
    id: 240,
    description:
      'Write an efficient algorithm that searches for a value target in an m x n integer matrix. The matrix has the property that integers in each row are sorted in ascending from left to right, and integers in each column are sorted in ascending from top to bottom.',
    examples:
      'Input: matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]], target = 5\nOutput: true',
    intuition:
      'Start from the top-right corner. If the value is too large, move left (eliminating a column). If too small, move down (eliminating a row). Each step eliminates an entire row or column, giving O(m+n) time. This staircase search exploits both the row and column sorting.',
    approach:
      'Start from the top-right corner (or bottom-left). If the current value equals target, return true. If current > target, move left. If current < target, move down. This eliminates one row or column each step.',
    code: `class Solution:
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        if not matrix:
            return False
        m, n = len(matrix), len(matrix[0])
        r, c = 0, n - 1
        while r < m and c >= 0:
            if matrix[r][c] == target:
                return True
            elif matrix[r][c] > target:
                c -= 1
            else:
                r += 1
        return False`,
    jsCode: `var searchMatrix = function(matrix, target) {
    if (!matrix.length) return false;
    const m = matrix.length, n = matrix[0].length;
    let r = 0, c = n - 1;
    while (r < m && c >= 0) {
        if (matrix[r][c] === target) return true;
        else if (matrix[r][c] > target) c--;
        else r++;
    }
    return false;
};`,
    explanation:
      '1. Start at the top-right corner: matrix[0][n-1].\n' +
      '2. If value == target, found it.\n' +
      '3. If value > target, move left (eliminate this column).\n' +
      '4. If value < target, move down (eliminate this row).\n' +
      '5. Each step eliminates a row or column, giving O(m + n) time.',
    timeComplexity: 'O(m + n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Start from a corner where one direction increases and the other decreases.',
      'Top-right or bottom-left corners work well.',
      'Each comparison eliminates either a row or a column.',
    ],
  },
];

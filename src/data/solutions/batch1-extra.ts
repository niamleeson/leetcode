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
    // Edge case: if only one row or string fits in one row, return as-is
    if (numRows === 1 || numRows >= s.length) return s;

    // Create one string bucket per row
    const rows = Array(numRows).fill('');
    let curRow = 0;
    let goingDown = false;

    // Place each character into its corresponding row
    for (const c of s) {
        rows[curRow] += c;

        // Flip direction when we hit the top or bottom row
        if (curRow === 0 || curRow === numRows - 1) {
            goingDown = !goingDown;
        }

        // Move to next row based on current direction
        if (goingDown) {
            curRow = curRow + 1;
        } else {
            curRow = curRow - 1;
        }
    }

    // Concatenate all rows to get the final result
    return rows.join('');
};`,
    jsWalkthrough:
      'Input: s = "PAYPALISHIRING", numRows = 3\n\n' +
      'rows = ["", "", ""], curRow = 0, goingDown = false\n\n' +
      'c="P": rows[0]="P", curRow=0 so goingDown flips to true, curRow -> 1\n' +
      'c="A": rows[1]="A", curRow -> 2\n' +
      'c="Y": rows[2]="Y", curRow=2 so goingDown flips to false, curRow -> 1\n' +
      'c="P": rows[1]="AP", curRow -> 0\n' +
      'c="A": rows[0]="PA", curRow=0 so goingDown flips to true, curRow -> 1\n' +
      'c="L": rows[1]="APL", curRow -> 2\n' +
      'c="I": rows[2]="YI", curRow=2 so goingDown flips to false, curRow -> 1\n' +
      '... (continue through all characters)\n\n' +
      'Final rows: ["PAHN", "APLSIIG", "YIR"]\n' +
      'Result: "PAHN" + "APLSIIG" + "YIR" = "PAHNAPLSIIGYIR"',
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
    // Record the sign and work with the absolute value
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    while (x > 0) {
        // Extract the last digit
        const digit = x % 10;
        // Remove the last digit from x
        x = Math.floor(x / 10);

        // Check for overflow before updating res
        if (res > Math.floor((INT_MAX - digit) / 10)) {
            return 0;
        }

        // Append the digit to the reversed number
        res = res * 10 + digit;
    }

    return res * sign;
};`,
    jsWalkthrough:
      'Input: x = 123\n\n' +
      'sign = 1, x = 123, res = 0\n\n' +
      'Iteration 1: digit = 123 % 10 = 3, x = 12, overflow check passes, res = 0*10+3 = 3\n' +
      'Iteration 2: digit = 12 % 10 = 2, x = 1, overflow check passes, res = 3*10+2 = 32\n' +
      'Iteration 3: digit = 1 % 10 = 1, x = 0, overflow check passes, res = 32*10+1 = 321\n\n' +
      'Loop ends (x = 0)\n' +
      'Return 321 * 1 = 321',
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

    // Phase 1: skip leading whitespace
    while (i < n && s[i] === ' ') {
        i = i + 1;
    }

    // Phase 2: read optional sign
    let sign = 1;
    if (i < n && (s[i] === '+' || s[i] === '-')) {
        if (s[i] === '-') {
            sign = -1;
        } else {
            sign = 1;
        }
        i = i + 1;
    }

    // Phase 3: read digits and build the integer
    let res = 0;
    while (i < n && s[i] >= '0' && s[i] <= '9') {
        const digit = Number(s[i]);
        res = res * 10 + digit;
        i = i + 1;
    }

    // Apply sign and clamp to 32-bit range
    res = res * sign;
    return Math.max(INT_MIN, Math.min(INT_MAX, res));
};`,
    jsWalkthrough:
      'Input: s = "   -42"\n\n' +
      'i=0: s[0]=" " -> skip, i=1\n' +
      'i=1: s[1]=" " -> skip, i=2\n' +
      'i=2: s[2]=" " -> skip, i=3\n' +
      'i=3: s[3]="-" -> sign=-1, i=4\n' +
      'i=4: s[4]="4" -> digit=4, res=0*10+4=4, i=5\n' +
      'i=5: s[5]="2" -> digit=2, res=4*10+2=42, i=6\n' +
      'Loop ends (i=6=n)\n\n' +
      'res = 42 * -1 = -42\n' +
      'clamp(-42, INT_MIN, INT_MAX) = -42\n' +
      'Return -42',
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
    // Negative numbers and numbers ending in 0 (except 0 itself) cannot be palindromes
    if (x < 0 || (x % 10 === 0 && x !== 0)) {
        return false;
    }

    let reversedHalf = 0;

    // Reverse the second half of x by extracting digits one by one
    // Stop when reversedHalf catches up to x (we've processed half the digits)
    while (x > reversedHalf) {
        const lastDigit = x % 10;
        reversedHalf = reversedHalf * 10 + lastDigit;
        x = Math.floor(x / 10);
    }

    // Even-length: x === reversedHalf (e.g., 1221 -> x=12, reversedHalf=12)
    // Odd-length: x === reversedHalf // 10 (e.g., 12321 -> x=12, reversedHalf=123)
    return x === reversedHalf || x === Math.floor(reversedHalf / 10);
};`,
    jsWalkthrough:
      'Input: x = 121\n\n' +
      'x=121, reversedHalf=0\n\n' +
      'Iteration 1: lastDigit=1, reversedHalf=0*10+1=1, x=12\n' +
      '  x(12) > reversedHalf(1) -> continue\n' +
      'Iteration 2: lastDigit=2, reversedHalf=1*10+2=12, x=1\n' +
      '  x(1) > reversedHalf(12)? No -> stop\n\n' +
      'Check: x(1) === reversedHalf(12)? No\n' +
      'Check: x(1) === floor(12/10)=1? Yes -> return true\n\n' +
      '(Odd-length palindrome: middle digit 2 is discarded from reversedHalf)',
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
    const m = s.length;
    const n = p.length;

    // dp[i][j] = true if s[0..i-1] matches p[0..j-1]
    const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(false));

    // Empty string matches empty pattern
    dp[0][0] = true;

    // Patterns like "a*", "a*b*" can match an empty string
    for (let j = 1; j <= n; j++) {
        if (p[j - 1] === '*') {
            dp[0][j] = dp[0][j - 2];
        }
    }

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const patternChar = p[j - 1];
            const stringChar = s[i - 1];

            if (patternChar === '*') {
                // Zero occurrences of the preceding element
                const zeroOccurrences = dp[i][j - 2];

                // One or more occurrences (if preceding element matches current string char)
                const precedingChar = p[j - 2];
                const charMatches = precedingChar === '.' || precedingChar === stringChar;
                const oneOrMoreOccurrences = charMatches ? dp[i - 1][j] : false;

                dp[i][j] = zeroOccurrences || oneOrMoreOccurrences;
            } else if (patternChar === '.' || patternChar === stringChar) {
                // Single character match
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }

    return dp[m][n];
};`,
    jsWalkthrough:
      'Input: s = "aa", p = "a*"\n\n' +
      'dp is 3x3 (m+1=3 rows, n+1=3 cols)\n' +
      'dp[0][0] = true\n' +
      'Init row 0: j=1 p[0]="a" not "*"; j=2 p[1]="*" -> dp[0][2] = dp[0][0] = true\n\n' +
      'i=1 (s[0]="a"), j=1 (p[0]="a"): patternChar="a"=stringChar -> dp[1][1]=dp[0][0]=true\n' +
      'i=1 (s[0]="a"), j=2 (p[1]="*"): zero=dp[1][0]=false; preceding="a"=stringChar -> oneOrMore=dp[0][2]=true\n' +
      '  dp[1][2] = false || true = true\n\n' +
      'i=2 (s[1]="a"), j=1 (p[0]="a"): dp[2][1] = dp[1][0] = false\n' +
      'i=2 (s[1]="a"), j=2 (p[1]="*"): zero=dp[2][0]=false; preceding="a"=stringChar -> oneOrMore=dp[1][2]=true\n' +
      '  dp[2][2] = false || true = true\n\n' +
      'Return dp[2][2] = true',
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
    // Lookup table from largest to smallest, including subtractive forms
    const valSym = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];

    const result = [];

    for (const [val, sym] of valSym) {
        // Keep subtracting this denomination while it fits
        while (num >= val) {
            result.push(sym);
            num = num - val;
        }
    }

    return result.join('');
};`,
    jsWalkthrough:
      'Input: num = 1994\n\n' +
      'val=1000 sym="M": 1994>=1000 -> push "M", num=994\n' +
      '  994<1000 -> stop\n' +
      'val=900 sym="CM": 994>=900 -> push "CM", num=94\n' +
      '  94<900 -> stop\n' +
      'val=500 sym="D": 94<500 -> skip\n' +
      'val=400 sym="CD": 94<400 -> skip\n' +
      'val=100 sym="C": 94<100 -> skip\n' +
      'val=90 sym="XC": 94>=90 -> push "XC", num=4\n' +
      '  4<90 -> stop\n' +
      'val=50,40,10,9,5: all > 4 -> skip\n' +
      'val=4 sym="IV": 4>=4 -> push "IV", num=0\n\n' +
      'result = ["M","CM","XC","IV"]\n' +
      'Return "MCMXCIV"',
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
    const roman = {
        'I': 1, 'V': 5, 'X': 10, 'L': 50,
        'C': 100, 'D': 500, 'M': 1000
    };

    let result = 0;

    for (let i = 0; i < s.length; i++) {
        const currentValue = roman[s[i]];
        const nextValue = i + 1 < s.length ? roman[s[i + 1]] : 0;

        // If current symbol is smaller than the next, it's a subtractive case (e.g., IV = 4)
        if (currentValue < nextValue) {
            result = result - currentValue;
        } else {
            result = result + currentValue;
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Input: s = "MCMXCIV"\n\n' +
      'i=0: current="M"(1000), next="C"(100) -> 1000>100 -> result=0+1000=1000\n' +
      'i=1: current="C"(100), next="M"(1000) -> 100<1000 -> result=1000-100=900\n' +
      'i=2: current="M"(1000), next="X"(10) -> 1000>10 -> result=900+1000=1900\n' +
      'i=3: current="X"(10), next="C"(100) -> 10<100 -> result=1900-10=1890\n' +
      'i=4: current="C"(100), next="I"(1) -> 100>1 -> result=1890+100=1990\n' +
      'i=5: current="I"(1), next="V"(5) -> 1<5 -> result=1990-1=1989\n' +
      'i=6: current="V"(5), next=0 -> 5>0 -> result=1989+5=1994\n\n' +
      'Return 1994',
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

    // Use first string as reference; scan its characters column by column
    for (let i = 0; i < strs[0].length; i++) {
        const referenceChar = strs[0][i];

        // Check if every other string has the same character at position i
        for (let j = 1; j < strs.length; j++) {
            const isBeyondEnd = i >= strs[j].length;
            const isMismatch = strs[j][i] !== referenceChar;

            if (isBeyondEnd || isMismatch) {
                // Return the prefix we've confirmed so far
                return strs[0].substring(0, i);
            }
        }
    }

    // The entire first string is the common prefix
    return strs[0];
};`,
    jsWalkthrough:
      'Input: strs = ["flower","flow","flight"]\n\n' +
      'i=0: referenceChar="f"\n' +
      '  j=1: strs[1][0]="f" matches\n' +
      '  j=2: strs[2][0]="f" matches\n' +
      'i=1: referenceChar="l"\n' +
      '  j=1: strs[1][1]="l" matches\n' +
      '  j=2: strs[2][1]="l" matches\n' +
      'i=2: referenceChar="o"\n' +
      '  j=1: strs[1][2]="o" matches\n' +
      '  j=2: strs[2][2]="i" != "o" -> mismatch!\n' +
      '  Return strs[0].substring(0,2) = "fl"\n\n' +
      'Return "fl"',
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
        let lo = i + 1;
        let hi = nums.length - 1;

        while (lo < hi) {
            const currentSum = nums[i] + nums[lo] + nums[hi];

            // Update closest if this sum is nearer to target
            if (Math.abs(currentSum - target) < Math.abs(closest - target)) {
                closest = currentSum;
            }

            if (currentSum < target) {
                // Sum is too small; move left pointer right to increase sum
                lo = lo + 1;
            } else if (currentSum > target) {
                // Sum is too large; move right pointer left to decrease sum
                hi = hi - 1;
            } else {
                // Exact match found
                return currentSum;
            }
        }
    }

    return closest;
};`,
    jsWalkthrough:
      'Input: nums = [-1,2,1,-4], target = 1\n' +
      'After sort: [-4,-1,1,2]\n\n' +
      'i=0 (nums[0]=-4): lo=1, hi=3\n' +
      '  lo=1,hi=3: sum=-4+(-1)+2=-3, |(-3)-1|=4 < |Inf-1|=Inf -> closest=-3\n' +
      '  sum(-3)<target(1) -> lo=2\n' +
      '  lo=2,hi=3: sum=-4+1+2=-1, |(-1)-1|=2 < |(-3)-1|=4 -> closest=-1\n' +
      '  sum(-1)<target(1) -> lo=3\n' +
      '  lo=3 not < hi=3 -> stop\n\n' +
      'i=1 (nums[1]=-1): lo=2, hi=3\n' +
      '  lo=2,hi=3: sum=-1+1+2=2, |2-1|=1 < |(-1)-1|=2 -> closest=2\n' +
      '  sum(2)>target(1) -> hi=2\n' +
      '  lo=2 not < hi=2 -> stop\n\n' +
      'Return closest = 2',
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
    const result = [];
    const n = nums.length;

    for (let i = 0; i < n - 3; i++) {
        // Skip duplicate values for the first element
        if (i > 0 && nums[i] === nums[i - 1]) {
            continue;
        }

        for (let j = i + 1; j < n - 2; j++) {
            // Skip duplicate values for the second element
            if (j > i + 1 && nums[j] === nums[j - 1]) {
                continue;
            }

            let lo = j + 1;
            let hi = n - 1;

            while (lo < hi) {
                const currentSum = nums[i] + nums[j] + nums[lo] + nums[hi];

                if (currentSum < target) {
                    lo = lo + 1;
                } else if (currentSum > target) {
                    hi = hi - 1;
                } else {
                    // Found a valid quadruplet
                    result.push([nums[i], nums[j], nums[lo], nums[hi]]);

                    // Skip duplicates for lo and hi
                    while (lo < hi && nums[lo] === nums[lo + 1]) {
                        lo = lo + 1;
                    }
                    while (lo < hi && nums[hi] === nums[hi - 1]) {
                        hi = hi - 1;
                    }

                    lo = lo + 1;
                    hi = hi - 1;
                }
            }
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Input: nums = [1,0,-1,0,-2,2], target = 0\n' +
      'After sort: [-2,-1,0,0,1,2]\n\n' +
      'i=0 (nums[0]=-2):\n' +
      '  j=1 (nums[1]=-1): lo=2, hi=5\n' +
      '    sum=-2+(-1)+0+2=-1 < 0 -> lo=3\n' +
      '    sum=-2+(-1)+0+2=-1 < 0 -> lo=4\n' +
      '    sum=-2+(-1)+1+2=0 == 0 -> push [-2,-1,1,2], lo=5, hi=4, stop\n' +
      '  j=2 (nums[2]=0): lo=3, hi=5\n' +
      '    sum=-2+0+0+2=0 == 0 -> push [-2,0,0,2]\n' +
      '    skip dup: nums[3]=0=nums[4]=1? no -> lo=4, hi=4, stop\n' +
      '  j=3 (nums[3]=0): j>i+1 and nums[3]==nums[2]? 0==0 -> skip\n' +
      'i=1 (nums[1]=-1):\n' +
      '  j=2 (nums[2]=0): lo=3, hi=5\n' +
      '    sum=-1+0+0+2=1 > 0 -> hi=4\n' +
      '    sum=-1+0+0+1=0 == 0 -> push [-1,0,0,1], lo=4, hi=3, stop\n' +
      '... (remaining i values produce no new quadruplets)\n\n' +
      'Return [[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]',
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
    // Dummy node before head simplifies edge cases (head itself being swapped)
    const dummy = new ListNode(0);
    dummy.next = head;
    let prev = dummy;

    while (prev.next && prev.next.next) {
        const first = prev.next;
        const second = prev.next.next;

        // Rewire pointers to swap the pair:
        // Before: prev -> first -> second -> rest
        // After:  prev -> second -> first -> rest
        prev.next = second;
        first.next = second.next;
        second.next = first;

        // Advance prev to first (which is now the tail of the swapped pair)
        prev = first;
    }

    return dummy.next;
};`,
    jsWalkthrough:
      'Input: head = [1,2,3,4]\n' +
      'dummy -> 1 -> 2 -> 3 -> 4\n\n' +
      'Iteration 1: prev=dummy, first=1, second=2\n' +
      '  dummy -> 2 -> 1 -> 3 -> 4 (after rewiring)\n' +
      '  prev = node(1)\n\n' +
      'Iteration 2: prev=node(1), first=3, second=4\n' +
      '  dummy -> 2 -> 1 -> 4 -> 3 (after rewiring)\n' +
      '  prev = node(3)\n\n' +
      'prev.next=null -> loop ends\n' +
      'Return dummy.next = node(2)\n' +
      'Result: [2,1,4,3]',
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
    // k is our write pointer: the position for the next element to keep
    let k = 0;

    for (const num of nums) {
        // Only write the element if it's not the value we want to remove
        if (num !== val) {
            nums[k] = num;
            k = k + 1;
        }
    }

    // k is now the count of elements that are not equal to val
    return k;
};`,
    jsWalkthrough:
      'Input: nums = [3,2,2,3], val = 3\n\n' +
      'k=0\n' +
      'num=3: 3===val(3) -> skip, k stays 0\n' +
      'num=2: 2!==val(3) -> nums[0]=2, k=1\n' +
      'num=2: 2!==val(3) -> nums[1]=2, k=2\n' +
      'num=3: 3===val(3) -> skip, k stays 2\n\n' +
      'nums = [2,2,2,3] (first k=2 elements are valid)\n' +
      'Return k=2',
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
    const haystackLen = haystack.length;
    const needleLen = needle.length;

    // Slide a window of size needleLen across haystack
    for (let i = 0; i <= haystackLen - needleLen; i++) {
        const window = haystack.substring(i, i + needleLen);

        if (window === needle) {
            return i;
        }
    }

    return -1;
};`,
    jsWalkthrough:
      'Input: haystack = "sadbutsad", needle = "sad"\n' +
      'haystackLen=9, needleLen=3\n\n' +
      'i=0: window="sad" === "sad" -> return 0\n\n' +
      '(Would continue for other inputs)\n' +
      'For haystack="leetcode", needle="leeto":\n' +
      'i=0: window="leetc" != "leeto"\n' +
      'i=1: window="eetco" != "leeto"\n' +
      '... no match found -> return -1',
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
    const INT_MAX = 2147483647;
    const INT_MIN = -2147483648;

    // Special case: INT_MIN / -1 would overflow INT_MAX
    if (dividend === INT_MIN && divisor === -1) {
        return INT_MAX;
    }

    // Determine sign of the result using XOR
    const isNegative = (dividend < 0) ^ (divisor < 0);
    const sign = isNegative ? -1 : 1;

    // Work with absolute values to simplify logic
    let remaining = Math.abs(dividend);
    const absDivisor = Math.abs(divisor);

    let result = 0;

    while (remaining >= absDivisor) {
        // Find the largest power-of-2 multiple of divisor that fits
        let temp = absDivisor;
        let multiple = 1;

        while (remaining >= temp * 2) {
            temp = temp * 2;
            multiple = multiple * 2;
        }

        // Subtract that multiple and add it to the result
        remaining = remaining - temp;
        result = result + multiple;
    }

    return result * sign;
};`,
    jsWalkthrough:
      'Input: dividend = 10, divisor = 3\n\n' +
      'sign = 1, remaining = 10, absDivisor = 3, result = 0\n\n' +
      'Outer iteration 1: remaining(10) >= absDivisor(3)\n' +
      '  inner: temp=3, multiple=1\n' +
      '  10 >= 6? yes -> temp=6, multiple=2\n' +
      '  10 >= 12? no -> stop inner\n' +
      '  remaining = 10-6 = 4, result = 0+2 = 2\n\n' +
      'Outer iteration 2: remaining(4) >= absDivisor(3)\n' +
      '  inner: temp=3, multiple=1\n' +
      '  4 >= 6? no -> stop inner\n' +
      '  remaining = 4-3 = 1, result = 2+1 = 3\n\n' +
      'Outer: remaining(1) < absDivisor(3) -> stop\n' +
      'Return 3 * 1 = 3',
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

    // Build a frequency map of required words
    const wordCount = {};
    for (const word of words) {
        wordCount[word] = (wordCount[word] || 0) + 1;
    }

    const result = [];

    // Try each possible starting offset (0 to wordLen-1)
    for (let startOffset = 0; startOffset < wordLen; startOffset++) {
        let left = startOffset;
        const currentCount = {};
        let matchedWords = 0;

        // Slide window in steps of wordLen
        for (let j = startOffset; j <= s.length - wordLen; j += wordLen) {
            const word = s.substring(j, j + wordLen);

            if (word in wordCount) {
                // Add word to current window
                currentCount[word] = (currentCount[word] || 0) + 1;
                matchedWords = matchedWords + 1;

                // Shrink window if this word appears too many times
                while (currentCount[word] > wordCount[word]) {
                    const leftWord = s.substring(left, left + wordLen);
                    currentCount[leftWord] = currentCount[leftWord] - 1;
                    matchedWords = matchedWords - 1;
                    left = left + wordLen;
                }

                // Check if window contains exactly all required words
                if (matchedWords === numWords) {
                    result.push(left);
                }
            } else {
                // Invalid word found; reset window entirely
                for (const key in currentCount) {
                    delete currentCount[key];
                }
                matchedWords = 0;
                left = j + wordLen;
            }
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Input: s = "barfoothefoobarman", words = ["foo","bar"]\n' +
      'wordLen=3, numWords=2, wordCount={foo:1, bar:1}\n\n' +
      'startOffset=0: left=0\n' +
      '  j=0: word="bar" in wordCount -> currentCount={bar:1}, matched=1\n' +
      '  j=3: word="foo" in wordCount -> currentCount={bar:1,foo:1}, matched=2\n' +
      '    matched===numWords -> push left=0\n' +
      '  j=6: word="the" not in wordCount -> reset, left=9\n' +
      '  j=9: word="foo" -> currentCount={foo:1}, matched=1\n' +
      '  j=12: word="bar" -> currentCount={foo:1,bar:1}, matched=2\n' +
      '    matched===numWords -> push left=9\n' +
      '  j=15: word="man" not in wordCount -> reset\n\n' +
      'startOffset=1,2: no valid windows found\n\n' +
      'Return [0, 9]',
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

    // Step 1: Find the rightmost "pivot" - the first element from the right
    // that is smaller than the element to its right
    let pivotIndex = n - 2;
    while (pivotIndex >= 0 && nums[pivotIndex] >= nums[pivotIndex + 1]) {
        pivotIndex = pivotIndex - 1;
    }

    if (pivotIndex >= 0) {
        // Step 2: Find the smallest element to the right of pivot that is larger than pivot
        let swapIndex = n - 1;
        while (nums[swapIndex] <= nums[pivotIndex]) {
            swapIndex = swapIndex - 1;
        }

        // Step 3: Swap pivot with that element
        const temp = nums[pivotIndex];
        nums[pivotIndex] = nums[swapIndex];
        nums[swapIndex] = temp;
    }

    // Step 4: Reverse the suffix after the pivot position
    // (it was descending; reversing makes it ascending = smallest arrangement)
    let left = pivotIndex + 1;
    let right = n - 1;
    while (left < right) {
        const temp = nums[left];
        nums[left] = nums[right];
        nums[right] = temp;
        left = left + 1;
        right = right - 1;
    }
};`,
    jsWalkthrough:
      'Input: nums = [1,2,3]\n\n' +
      'Step 1: find pivot from right\n' +
      '  i=1: nums[1]=2 < nums[2]=3 -> pivotIndex=1\n\n' +
      'Step 2: find swap target\n' +
      '  j=2: nums[2]=3 > nums[1]=2 -> swapIndex=2\n\n' +
      'Step 3: swap nums[1] and nums[2]\n' +
      '  nums = [1,3,2]\n\n' +
      'Step 4: reverse suffix after pivot (index 2 to end)\n' +
      '  Only one element after swap, nothing to reverse\n' +
      '  nums = [1,3,2]\n\n' +
      'Return (in-place modified): [1,3,2]',
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
      'Generalized form: Minimize k s.t. nums[k] >= target. Binary search naturally finds the insertion point. The generalized template with condition nums[mid] >= target directly gives the correct insertion index, handling both found and not-found cases identically.',
    approach:
      'Use the generalized binary search template: minimize k s.t. nums[k] >= target. Initialize right = len(nums) to handle insertion at the end. The condition nums[mid] >= target directly gives the insertion point, with no special case needed for found vs. not-found.',
    code: `class Solution:
    def searchInsert(self, nums: list[int], target: int) -> int:
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] >= target:
                hi = mid
            else:
                lo = mid + 1
        return lo`,
    jsCode: `var searchInsert = function(nums, target) {
    // Generalized form: minimize k s.t. nums[k] >= target
    let lo = 0;
    let hi = nums.length; // right = len(nums) to handle insertion at end

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);

        if (nums[mid] >= target) {
            // mid satisfies the condition — could be the answer
            hi = mid;
        } else {
            // mid doesn't satisfy — answer is to the right
            lo = mid + 1;
        }
    }

    // lo is the minimal index where nums[lo] >= target (or len if target > all)
    return lo;
};`,
    jsWalkthrough:
      'Generalized: minimize k s.t. nums[k] >= target\n\n' +
      'Input: nums = [1,3,5,6], target = 5\n' +
      'lo=0, hi=4\n\n' +
      'mid=2: nums[2]=5 >= 5? Yes → hi=2\n' +
      'mid=1: nums[1]=3 >= 5? No → lo=2\n' +
      'lo===hi=2 → return 2\n\n' +
      '---\n' +
      'Input: nums = [1,3,5,6], target = 2 (not found)\n' +
      'lo=0, hi=4\n\n' +
      'mid=2: nums[2]=5 >= 2? Yes → hi=2\n' +
      'mid=1: nums[1]=3 >= 2? Yes → hi=1\n' +
      'mid=0: nums[0]=1 >= 2? No → lo=1\n' +
      'lo===hi=1 → return 1 (insert at index 1)',
    explanation:
      '1. Apply generalized template: minimize k s.t. nums[k] >= target.\n' +
      '2. Initialize lo = 0, hi = len(nums). Right is len(nums) because target could be larger than all elements.\n' +
      '3. If nums[mid] >= target, mid is a candidate — set hi = mid.\n' +
      '4. If nums[mid] < target, mid is not valid — set lo = mid + 1.\n' +
      '5. When lo === hi, we\'ve found the first index where nums[k] >= target, which is the insertion point.',
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
    // Track which digits are used in each row, column, and 3x3 box
    const rows = Array.from({length: 9}, () => new Set());
    const cols = Array.from({length: 9}, () => new Set());
    const boxes = Array.from({length: 9}, () => new Set());

    // Collect empty cells and pre-fill constraint sets with existing digits
    const emptyCells = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === '.') {
                emptyCells.push([i, j]);
            } else {
                const digit = board[i][j];
                const boxId = Math.floor(i / 3) * 3 + Math.floor(j / 3);
                rows[i].add(digit);
                cols[j].add(digit);
                boxes[boxId].add(digit);
            }
        }
    }

    function backtrack(idx) {
        // All empty cells filled successfully
        if (idx === emptyCells.length) {
            return true;
        }

        const [row, col] = emptyCells[idx];
        const boxId = Math.floor(row / 3) * 3 + Math.floor(col / 3);

        // Try each digit 1-9
        for (let d = 1; d <= 9; d++) {
            const digitStr = String(d);
            const isValid = !rows[row].has(digitStr) &&
                            !cols[col].has(digitStr) &&
                            !boxes[boxId].has(digitStr);

            if (isValid) {
                // Place the digit
                board[row][col] = digitStr;
                rows[row].add(digitStr);
                cols[col].add(digitStr);
                boxes[boxId].add(digitStr);

                if (backtrack(idx + 1)) {
                    return true;
                }

                // Backtrack: remove the digit
                board[row][col] = '.';
                rows[row].delete(digitStr);
                cols[col].delete(digitStr);
                boxes[boxId].delete(digitStr);
            }
        }

        return false;
    }

    backtrack(0);
};`,
    jsWalkthrough:
      'Pre-processing: scan board, record filled digits in rows/cols/boxes sets\n' +
      'Collect all "." cells into emptyCells array\n\n' +
      'backtrack(0): try first empty cell, say (0,2)\n' +
      '  Try d=1: check rows[0], cols[2], boxes[0] - if "1" not in any -> place "1"\n' +
      '    backtrack(1): try next empty cell\n' +
      '      ... if eventually leads to contradiction -> return false\n' +
      '    if returned false: remove "1", try d=2, d=3, ...\n' +
      '  Continue until a valid digit is found that leads to a complete solution\n\n' +
      'When backtrack(emptyCells.length) is reached -> all cells filled -> return true',
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
    let current = "1";

    // Generate each term from the previous one, n-1 times
    for (let k = 0; k < n - 1; k++) {
        const nextTerm = [];
        let i = 0;

        while (i < current.length) {
            // Find the end of the current run of identical characters
            let j = i;
            while (j < current.length && current[j] === current[i]) {
                j = j + 1;
            }

            // Encode as "count + digit"
            const runLength = j - i;
            const runDigit = current[i];
            nextTerm.push(String(runLength));
            nextTerm.push(runDigit);

            // Move to the next run
            i = j;
        }

        current = nextTerm.join('');
    }

    return current;
};`,
    jsWalkthrough:
      'Input: n = 4\n\n' +
      'Start: current = "1"\n\n' +
      'k=0: encode "1"\n' +
      '  i=0: run of "1" from j=0 to j=1, count=1 -> push "1","1"\n' +
      '  current = "11"\n\n' +
      'k=1: encode "11"\n' +
      '  i=0: run of "1" from j=0 to j=2, count=2 -> push "2","1"\n' +
      '  current = "21"\n\n' +
      'k=2: encode "21"\n' +
      '  i=0: run of "2" from j=0 to j=1, count=1 -> push "1","2"\n' +
      '  i=1: run of "1" from j=1 to j=2, count=1 -> push "1","1"\n' +
      '  current = "1211"\n\n' +
      'Return "1211"',
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
    const m = num1.length;
    const n = num2.length;

    // Result array: product of m-digit and n-digit numbers has at most m+n digits
    const pos = Array(m + n).fill(0);

    // Multiply each digit pair (like grade-school multiplication)
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            const digit1 = num1.charCodeAt(i) - 48;
            const digit2 = num2.charCodeAt(j) - 48;
            const product = digit1 * digit2;

            // Digit at position i*j contributes to positions p1 and p2
            const p1 = i + j;
            const p2 = i + j + 1;

            const total = product + pos[p2];

            // Store the ones digit at p2, carry the tens digit to p1
            pos[p2] = total % 10;
            pos[p1] = pos[p1] + Math.floor(total / 10);
        }
    }

    // Convert to string and remove leading zeros
    const result = pos.join('').replace(/^0+/, '');
    return result || '0';
};`,
    jsWalkthrough:
      'Input: num1 = "123", num2 = "456"\n' +
      'm=3, n=3, pos = [0,0,0,0,0,0] (length 6)\n\n' +
      'i=2 (digit "3"), j=2 (digit "6"): product=18, p1=4, p2=5\n' +
      '  total=18+0=18, pos[5]=8, pos[4]+=1 -> pos=[0,0,0,0,1,8]\n' +
      'i=2 (digit "3"), j=1 (digit "5"): product=15, p1=3, p2=4\n' +
      '  total=15+1=16, pos[4]=6, pos[3]+=1 -> pos=[0,0,0,1,6,8]\n' +
      'i=2 (digit "3"), j=0 (digit "4"): product=12, p1=2, p2=3\n' +
      '  total=12+1=13, pos[3]=3, pos[2]+=1 -> pos=[0,0,1,3,6,8]\n' +
      '... (continue for i=1 and i=0)\n' +
      'Final pos -> "056088"\n' +
      'Strip leading zero -> "56088"\n' +
      'Return "56088"',
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
    const m = s.length;
    const n = p.length;

    // dp[i][j] = true if s[0..i-1] matches p[0..j-1]
    const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(false));

    // Empty string matches empty pattern
    dp[0][0] = true;

    // Leading '*' characters can match an empty string
    for (let j = 1; j <= n; j++) {
        if (p[j - 1] === '*') {
            dp[0][j] = dp[0][j - 1];
        }
    }

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const patternChar = p[j - 1];
            const stringChar = s[i - 1];

            if (patternChar === '*') {
                // '*' matches zero characters: dp[i][j-1]
                const matchesEmpty = dp[i][j - 1];
                // '*' matches one or more characters: dp[i-1][j]
                const matchesOneOrMore = dp[i - 1][j];
                dp[i][j] = matchesEmpty || matchesOneOrMore;
            } else if (patternChar === '?' || patternChar === stringChar) {
                // '?' matches any single char, or exact char match
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }

    return dp[m][n];
};`,
    jsWalkthrough:
      'Input: s = "adceb", p = "*a*b"\n' +
      'm=5, n=4\n\n' +
      'Init: dp[0][0]=true\n' +
      'j=1: p[0]="*" -> dp[0][1]=dp[0][0]=true\n' +
      'j=2: p[1]="a" not "*" -> dp[0][2]=false\n' +
      'j=3: p[2]="*" -> dp[0][3]=dp[0][2]=false\n' +
      'j=4: p[3]="b" not "*" -> dp[0][4]=false\n\n' +
      'i=1 (s[0]="a"), j=1 (p[0]="*"): matchEmpty=dp[1][0]=false, oneOrMore=dp[0][1]=true -> dp[1][1]=true\n' +
      'i=1 (s[0]="a"), j=2 (p[1]="a"): "a"==="a" -> dp[1][2]=dp[0][1]=true\n' +
      '... (continue filling)\n' +
      'i=5 (s[4]="b"), j=4 (p[3]="b"): "b"==="b" -> dp[5][4]=dp[4][3]\n\n' +
      'Return dp[5][4] = true',
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
    let jumps = 0;
    let currentEnd = 0;  // boundary of the current jump's reach
    let farthest = 0;    // farthest index reachable from any position in the current level

    // We don't need to process the last index (already at destination)
    for (let i = 0; i < nums.length - 1; i++) {
        // Update the farthest we can reach from index i
        const reachFromHere = i + nums[i];
        farthest = Math.max(farthest, reachFromHere);

        // When we reach the end of the current jump's boundary, take a new jump
        if (i === currentEnd) {
            jumps = jumps + 1;
            currentEnd = farthest;
        }
    }

    return jumps;
};`,
    jsWalkthrough:
      'Input: nums = [2,3,1,1,4]\n\n' +
      'jumps=0, currentEnd=0, farthest=0\n\n' +
      'i=0: reachFromHere=0+2=2, farthest=2\n' +
      '  i(0)===currentEnd(0) -> jumps=1, currentEnd=2\n\n' +
      'i=1: reachFromHere=1+3=4, farthest=4\n' +
      '  i(1)!==currentEnd(2)\n\n' +
      'i=2: reachFromHere=2+1=3, farthest=max(4,3)=4\n' +
      '  i(2)===currentEnd(2) -> jumps=2, currentEnd=4\n\n' +
      'i=3: reachFromHere=3+1=4, farthest=max(4,4)=4\n' +
      '  i(3)!==currentEnd(4)\n\n' +
      'Loop ends (stop at nums.length-1=4)\n' +
      'Return jumps=2',
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
    // Handle negative exponents: x^(-n) = (1/x)^n
    if (n < 0) {
        x = 1 / x;
        n = -n;
    }

    let result = 1.0;

    // Binary exponentiation: halve the exponent each iteration
    while (n > 0) {
        // If the current bit of n is set, multiply result by current x
        if (n % 2 === 1) {
            result = result * x;
        }

        // Square x to handle the next bit
        x = x * x;

        // Shift n right by 1 bit
        n = Math.floor(n / 2);
    }

    return result;
};`,
    jsWalkthrough:
      'Input: x = 2.0, n = 10\n\n' +
      'n>=0, result=1.0\n\n' +
      'n=10 (1010 binary): 10%2=0 -> skip multiply; x=2*2=4; n=5\n' +
      'n=5  (101 binary):  5%2=1 -> result=1*4=4; x=4*4=16; n=2\n' +
      'n=2  (10 binary):   2%2=0 -> skip multiply; x=16*16=256; n=1\n' +
      'n=1  (1 binary):    1%2=1 -> result=4*256=1024; x=256*256=...; n=0\n\n' +
      'Loop ends (n=0)\n' +
      'Return 1024.0',
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
    function backtrack(row, usedCols, usedDiag1, usedDiag2) {
        // All rows filled successfully: count this as one solution
        if (row === n) {
            return 1;
        }

        let count = 0;

        for (let col = 0; col < n; col++) {
            const isColTaken = usedCols.has(col);
            const isDiag1Taken = usedDiag1.has(row - col);  // same main diagonal
            const isDiag2Taken = usedDiag2.has(row + col);  // same anti-diagonal

            if (isColTaken || isDiag1Taken || isDiag2Taken) {
                continue;
            }

            // Place queen at (row, col)
            usedCols.add(col);
            usedDiag1.add(row - col);
            usedDiag2.add(row + col);

            count = count + backtrack(row + 1, usedCols, usedDiag1, usedDiag2);

            // Remove queen (backtrack)
            usedCols.delete(col);
            usedDiag1.delete(row - col);
            usedDiag2.delete(row + col);
        }

        return count;
    }

    return backtrack(0, new Set(), new Set(), new Set());
};`,
    jsWalkthrough:
      'Input: n = 4\n\n' +
      'backtrack(row=0): try col=0,1,2,3\n' +
      '  col=0: place queen at (0,0), diag1={0}, diag2={0}\n' +
      '    backtrack(row=1): try col=0,1,2,3\n' +
      '      col=0: col taken -> skip\n' +
      '      col=1: diag2: 1+1=2 not taken; diag1: 1-1=0 taken -> skip\n' +
      '      col=2: place queen at (1,2)\n' +
      '        backtrack(row=2): no valid column -> return 0\n' +
      '      col=3: place queen at (1,3)\n' +
      '        backtrack(row=2): col=1 works -> place at (2,1)\n' +
      '          backtrack(row=3): col=3 -> diag2 4+3=7? no; diag1 3-3=0 taken -> skip; col=2? no...\n' +
      '          ... eventually find (3,1) invalid, try other columns\n' +
      '  col=1: place queen at (0,1) -> eventually finds solutions\n\n' +
      'Total solutions for n=4: 2',
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

    // Skip any trailing spaces
    while (i >= 0 && s[i] === ' ') {
        i = i - 1;
    }

    // Count characters of the last word
    let length = 0;
    while (i >= 0 && s[i] !== ' ') {
        length = length + 1;
        i = i - 1;
    }

    return length;
};`,
    jsWalkthrough:
      'Input: s = "Hello World"\n\n' +
      'i starts at index 10 (last char "d")\n\n' +
      'Skip trailing spaces: s[10]="d" != " " -> no skipping needed\n\n' +
      'Count last word:\n' +
      'i=10: s[10]="d" != " " -> length=1, i=9\n' +
      'i=9: s[9]="l" != " " -> length=2, i=8\n' +
      'i=8: s[8]="r" != " " -> length=3, i=7\n' +
      'i=7: s[7]="o" != " " -> length=4, i=6\n' +
      'i=6: s[6]="W" != " " -> length=5, i=5\n' +
      'i=5: s[5]=" " -> stop\n\n' +
      'Return 5',
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

    let top = 0;
    let bottom = n - 1;
    let left = 0;
    let right = n - 1;
    let num = 1;

    while (top <= bottom && left <= right) {
        // Fill top row: left to right
        for (let j = left; j <= right; j++) {
            matrix[top][j] = num;
            num = num + 1;
        }
        top = top + 1;

        // Fill right column: top to bottom
        for (let i = top; i <= bottom; i++) {
            matrix[i][right] = num;
            num = num + 1;
        }
        right = right - 1;

        // Fill bottom row: right to left
        for (let j = right; j >= left; j--) {
            matrix[bottom][j] = num;
            num = num + 1;
        }
        bottom = bottom - 1;

        // Fill left column: bottom to top
        for (let i = bottom; i >= top; i--) {
            matrix[i][left] = num;
            num = num + 1;
        }
        left = left + 1;
    }

    return matrix;
};`,
    jsWalkthrough:
      'Input: n = 3\n' +
      'matrix = 3x3 of zeros\n\n' +
      'Iteration 1: top=0, bottom=2, left=0, right=2\n' +
      '  Fill top row (row 0): matrix[0][0]=1, [0][1]=2, [0][2]=3; top=1\n' +
      '  Fill right col (col 2): matrix[1][2]=4, [2][2]=5; right=1\n' +
      '  Fill bottom row (row 2): matrix[2][1]=6, [2][0]=7; bottom=1\n' +
      '  Fill left col (col 0): matrix[1][0]=8; left=1\n\n' +
      'Iteration 2: top=1, bottom=1, left=1, right=1\n' +
      '  Fill top row: matrix[1][1]=9; top=2\n' +
      '  top(2)>bottom(1) -> loop ends\n\n' +
      'Result: [[1,2,3],[8,9,4],[7,6,5]]',
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
    // Build list of available digits [1, 2, ..., n]
    const digits = [];
    for (let i = 1; i <= n; i++) {
        digits.push(i);
    }

    // Convert to 0-indexed
    k = k - 1;

    const result = [];

    for (let i = n; i > 0; i--) {
        // Compute (i-1)! = number of permutations of the remaining i-1 digits
        let factorial = 1;
        for (let j = 1; j < i; j++) {
            factorial = factorial * j;
        }

        // Which digit goes at the current position?
        const digitIndex = Math.floor(k / factorial);

        // Update k for the next position
        k = k % factorial;

        // Pick and remove the chosen digit
        result.push(String(digits[digitIndex]));
        digits.splice(digitIndex, 1);
    }

    return result.join('');
};`,
    jsWalkthrough:
      'Input: n = 3, k = 3\n' +
      'digits = [1, 2, 3], k = 3-1 = 2\n\n' +
      'i=3: factorial=(3-1)!=2\n' +
      '  digitIndex = floor(2/2) = 1\n' +
      '  k = 2 % 2 = 0\n' +
      '  pick digits[1]=2, digits=[1,3]\n' +
      '  result=["2"]\n\n' +
      'i=2: factorial=(2-1)!=1\n' +
      '  digitIndex = floor(0/1) = 0\n' +
      '  k = 0 % 1 = 0\n' +
      '  pick digits[0]=1, digits=[3]\n' +
      '  result=["2","1"]\n\n' +
      'i=1: factorial=(1-1)!=1\n' +
      '  digitIndex = floor(0/1) = 0\n' +
      '  pick digits[0]=3, digits=[]\n' +
      '  result=["2","1","3"]\n\n' +
      'Return "213"',
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
    if (!head || !head.next || k === 0) {
        return head;
    }

    // Step 1: Find the length and tail of the list
    let length = 1;
    let tail = head;
    while (tail.next) {
        tail = tail.next;
        length = length + 1;
    }

    // Step 2: Compute effective rotation (rotating by length is a no-op)
    k = k % length;
    if (k === 0) {
        return head;
    }

    // Step 3: Make the list circular
    tail.next = head;

    // Step 4: Walk to the new tail (length - k steps from head)
    const stepsToNewTail = length - k;
    let newTail = head;
    for (let i = 0; i < stepsToNewTail - 1; i++) {
        newTail = newTail.next;
    }

    // Step 5: Break the circle
    const newHead = newTail.next;
    newTail.next = null;

    return newHead;
};`,
    jsWalkthrough:
      'Input: head = [1,2,3,4,5], k = 2\n\n' +
      'Step 1: traverse to find tail and length\n' +
      '  tail=node(5), length=5\n\n' +
      'Step 2: k = 2 % 5 = 2 (nonzero, continue)\n\n' +
      'Step 3: make circular: node(5).next = node(1)\n' +
      '  1 -> 2 -> 3 -> 4 -> 5 -> (back to 1)\n\n' +
      'Step 4: stepsToNewTail = 5-2 = 3\n' +
      '  Walk 2 steps from head: newTail = node(3)\n\n' +
      'Step 5: newHead = node(4), node(3).next = null\n' +
      '  4 -> 5 -> 1 -> 2 -> 3 -> null\n\n' +
      'Return [4,5,1,2,3]',
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
    const m = obstacleGrid.length;
    const n = obstacleGrid[0].length;

    // If the starting cell has an obstacle, no paths exist
    if (obstacleGrid[0][0] === 1) {
        return 0;
    }

    // 1D dp array: dp[j] = number of paths to reach current row, column j
    const dp = Array(n).fill(0);
    dp[0] = 1;  // starting cell

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (obstacleGrid[i][j] === 1) {
                // Obstacle: zero paths through this cell
                dp[j] = 0;
            } else if (j > 0) {
                // Add paths coming from the left (dp[j-1] is already updated this row)
                // dp[j] already holds paths from above (previous row)
                dp[j] = dp[j] + dp[j - 1];
            }
        }
    }

    return dp[n - 1];
};`,
    jsWalkthrough:
      'Input: obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]\n' +
      'm=3, n=3\n\n' +
      'dp = [1, 0, 0] initially\n\n' +
      'Row 0: i=0\n' +
      '  j=0: grid[0][0]=0, j=0 -> dp stays [1,0,0]\n' +
      '  j=1: grid[0][1]=0, dp[1]+=dp[0]=1 -> dp=[1,1,0]\n' +
      '  j=2: grid[0][2]=0, dp[2]+=dp[1]=1 -> dp=[1,1,1]\n\n' +
      'Row 1: i=1\n' +
      '  j=0: grid[1][0]=0, j=0 -> dp stays [1,1,1]\n' +
      '  j=1: grid[1][1]=1 (obstacle) -> dp[1]=0 -> dp=[1,0,1]\n' +
      '  j=2: grid[1][2]=0, dp[2]+=dp[1]=0 -> dp=[1,0,1]\n\n' +
      'Row 2: i=2\n' +
      '  j=0: dp stays [1,0,1]\n' +
      '  j=1: dp[1]+=dp[0]=1 -> dp=[1,1,1]\n' +
      '  j=2: dp[2]+=dp[1]=1 -> dp[2]=2 -> dp=[1,1,2]\n\n' +
      'Return dp[2] = 2',
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
    const m = grid.length;
    const n = grid[0].length;

    // Modify grid in-place to store cumulative minimum path sums
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (i === 0 && j === 0) {
                // Starting cell: no modification needed
                continue;
            } else if (i === 0) {
                // First row: can only come from the left
                grid[i][j] = grid[i][j] + grid[i][j - 1];
            } else if (j === 0) {
                // First column: can only come from above
                grid[i][j] = grid[i][j] + grid[i - 1][j];
            } else {
                // Other cells: take the cheaper of coming from above or from the left
                const fromAbove = grid[i - 1][j];
                const fromLeft = grid[i][j - 1];
                grid[i][j] = grid[i][j] + Math.min(fromAbove, fromLeft);
            }
        }
    }

    return grid[m - 1][n - 1];
};`,
    jsWalkthrough:
      'Input: grid = [[1,3,1],[1,5,1],[4,2,1]]\n\n' +
      'Row 0:\n' +
      '  (0,0): skip (start)\n' +
      '  (0,1): first row -> grid[0][1] = 3+1 = 4\n' +
      '  (0,2): first row -> grid[0][2] = 1+4 = 5\n\n' +
      'Row 1:\n' +
      '  (1,0): first col -> grid[1][0] = 1+1 = 2\n' +
      '  (1,1): min(grid[0][1]=4, grid[1][0]=2)=2 -> grid[1][1] = 5+2 = 7\n' +
      '  (1,2): min(grid[0][2]=5, grid[1][1]=7)=5 -> grid[1][2] = 1+5 = 6\n\n' +
      'Row 2:\n' +
      '  (2,0): first col -> grid[2][0] = 4+2 = 6\n' +
      '  (2,1): min(grid[1][1]=7, grid[2][0]=6)=6 -> grid[2][1] = 2+6 = 8\n' +
      '  (2,2): min(grid[1][2]=6, grid[2][1]=8)=6 -> grid[2][2] = 1+6 = 7\n\n' +
      'Return grid[2][2] = 7',
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
    let seenDigit = false;
    let seenDot = false;
    let seenExp = false;

    for (let i = 0; i < s.length; i++) {
        const c = s[i];

        if (c >= '0' && c <= '9') {
            seenDigit = true;
        } else if (c === '+' || c === '-') {
            // Sign is only valid at the start or right after 'e'/'E'
            const isAtStart = i === 0;
            const isAfterExp = i > 0 && (s[i - 1] === 'e' || s[i - 1] === 'E');
            if (!isAtStart && !isAfterExp) {
                return false;
            }
        } else if (c === '.') {
            // A dot cannot appear after the exponent or twice
            if (seenDot || seenExp) {
                return false;
            }
            seenDot = true;
        } else if (c === 'e' || c === 'E') {
            // Exponent cannot appear twice, and must have digits before it
            if (seenExp || !seenDigit) {
                return false;
            }
            seenExp = true;
            // Reset seenDigit: we need digits after the exponent too
            seenDigit = false;
        } else {
            // Any other character is invalid
            return false;
        }
    }

    // Must have seen at least one digit (handles trailing exponent case)
    return seenDigit;
};`,
    jsWalkthrough:
      'Input: s = "2e10"\n\n' +
      'i=0: c="2" -> seenDigit=true\n' +
      'i=1: c="e" -> seenExp=false, seenDigit=true -> seenExp=true, seenDigit=false\n' +
      'i=2: c="1" -> seenDigit=true\n' +
      'i=3: c="0" -> seenDigit=true\n\n' +
      'Return seenDigit=true -> true\n\n' +
      '---\n' +
      'Input: s = "e"\n\n' +
      'i=0: c="e" -> seenExp=false ok, but seenDigit=false -> return false',
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
    // Start from the least significant digit (rightmost)
    for (let i = digits.length - 1; i >= 0; i--) {
        if (digits[i] < 9) {
            // No carry needed: just increment and return
            digits[i] = digits[i] + 1;
            return digits;
        }
        // This digit was 9: it becomes 0 and carry propagates left
        digits[i] = 0;
    }

    // All digits were 9 (e.g., 999 -> 1000): prepend a 1
    return [1, ...digits];
};`,
    jsWalkthrough:
      'Input: digits = [1,2,3]\n\n' +
      'i=2: digits[2]=3 < 9 -> digits[2]=4, return [1,2,4]\n\n' +
      '---\n' +
      'Input: digits = [9,9,9]\n\n' +
      'i=2: digits[2]=9 -> digits[2]=0\n' +
      'i=1: digits[1]=9 -> digits[1]=0\n' +
      'i=0: digits[0]=9 -> digits[0]=0\n' +
      'Loop ends\n' +
      'Return [1, ...digits] = [1,0,0,0]',
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

    // Process both strings from right to left (least significant bit first)
    let i = a.length - 1;
    let j = b.length - 1;

    while (i >= 0 || j >= 0 || carry > 0) {
        let total = carry;

        // Add bit from string a (treat missing positions as 0)
        if (i >= 0) {
            total = total + Number(a[i]);
            i = i - 1;
        }

        // Add bit from string b
        if (j >= 0) {
            total = total + Number(b[j]);
            j = j - 1;
        }

        // Current bit is total % 2; carry is total / 2
        result.push(String(total % 2));
        carry = Math.floor(total / 2);
    }

    // Result was built in reverse order
    return result.reverse().join('');
};`,
    jsWalkthrough:
      'Input: a = "11", b = "1"\n\n' +
      'i=1, j=0, carry=0\n\n' +
      'Step 1: total=0; i>=0: total+=a[1]="1"=1, i=0; j>=0: total+=b[0]="1"=1, j=-1\n' +
      '  total=2: result.push("0"), carry=1\n\n' +
      'Step 2: total=1; i>=0: total+=a[0]="1"=1, i=-1; j<0: skip\n' +
      '  total=2: result.push("0"), carry=1\n\n' +
      'Step 3: total=1; i<0, j<0; just carry\n' +
      '  total=1: result.push("1"), carry=0\n\n' +
      'result = ["0","0","1"]\n' +
      'reverse -> ["1","0","0"]\n' +
      'Return "100"',
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
    const result = [];
    let currentLine = [];
    let currentLineLength = 0;

    for (const word of words) {
        // Check if adding this word (plus one space per existing word) exceeds maxWidth
        const wouldExceed = currentLineLength + word.length + currentLine.length > maxWidth;

        if (wouldExceed) {
            // Distribute extra spaces across gaps in the current line
            const extraSpaces = maxWidth - currentLineLength;
            for (let i = 0; i < extraSpaces; i++) {
                // Distribute spaces to gaps round-robin (left-biased)
                // For single-word lines, all spaces go to the end (index 0)
                const gapIndex = i % (currentLine.length - 1 || 1);
                currentLine[gapIndex] = currentLine[gapIndex] + ' ';
            }
            result.push(currentLine.join(''));
            currentLine = [];
            currentLineLength = 0;
        }

        currentLine.push(word);
        currentLineLength = currentLineLength + word.length;
    }

    // Last line: left-justify (single spaces between words, pad right with spaces)
    result.push(currentLine.join(' ').padEnd(maxWidth));

    return result;
};`,
    jsWalkthrough:
      'Input: words=["This","is","an","example","of","text","justification."], maxWidth=16\n\n' +
      'word="This": line=["This"], len=4\n' +
      'word="is": 4+2+1=7<=16 -> line=["This","is"], len=6\n' +
      'word="an": 6+2+2=10<=16 -> line=["This","is","an"], len=8\n' +
      'word="example": 8+7+3=18>16 -> flush line\n' +
      '  extraSpaces=16-8=8, 2 gaps\n' +
      '  i=0: gap 0%2=0 -> "This" gets " " -> "This "\n' +
      '  i=1: gap 1%2=1 -> "is" gets " " -> "is "\n' +
      '  i=2: gap 2%2=0 -> "This" gets " " -> "This  "\n' +
      '  ... distribute all 8 spaces\n' +
      '  result.push("This    is    an")\n' +
      '  line=["example"], len=7\n' +
      '... (continue packing)\n\n' +
      'Last line: ["justification."] -> "justification.  " (padded)',
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
      'Generalized form: Minimize k s.t. k*k > x, then return k - 1. Binary search works perfectly here: you\'re looking for the largest integer whose square is at most x. Using the generalized template with condition k² > x, left converges to the first k where k² > x, so left - 1 is the floor of sqrt(x).',
    approach:
      'Use the generalized binary search template: minimize k s.t. k*k > x, then return k - 1. Initialize right = x + 1 to handle edge cases x = 0 and x = 1. The result left - 1 gives the floor of the square root.',
    code: `class Solution:
    def mySqrt(self, x: int) -> int:
        lo, hi = 0, x + 1
        while lo < hi:
            mid = (lo + hi) // 2
            if mid * mid > x:
                hi = mid
            else:
                lo = mid + 1
        return lo - 1`,
    jsCode: `var mySqrt = function(x) {
    // Generalized form: minimize k s.t. k*k > x, return k - 1
    let lo = 0;
    let hi = x + 1; // right = x + 1 to handle x = 0 and x = 1

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);

        if (mid * mid > x) {
            // mid satisfies the condition — could be the answer
            hi = mid;
        } else {
            // mid doesn't satisfy — answer is to the right
            lo = mid + 1;
        }
    }

    // lo is the first k where k² > x, so lo - 1 is floor(sqrt(x))
    return lo - 1;
};`,
    jsWalkthrough:
      'Generalized: minimize k s.t. k*k > x, return k-1\n\n' +
      'Input: x = 8\n' +
      'lo=0, hi=9\n\n' +
      'mid=4: 16 > 8? Yes → hi=4\n' +
      'mid=2: 4 > 8? No → lo=3\n' +
      'mid=3: 9 > 8? Yes → hi=3\n' +
      'lo===hi=3 → return 3-1 = 2\n\n' +
      'floor(sqrt(8)) = 2 ✓',
    explanation:
      '1. Apply generalized template: minimize k s.t. k² > x.\n' +
      '2. Initialize lo = 0, hi = x + 1 to handle x = 0 and x = 1.\n' +
      '3. If mid² > x, mid satisfies the condition — set hi = mid.\n' +
      '4. If mid² ≤ x, mid doesn\'t satisfy — set lo = mid + 1.\n' +
      '5. When lo === hi, lo is the first k where k² > x. Return lo - 1 (floor of sqrt).',
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
            // Go up one directory (pop the last directory name)
            if (stack.length > 0) {
                stack.pop();
            }
        } else if (part !== '' && part !== '.') {
            // Valid directory name: push onto stack
            // Skip empty strings (from consecutive slashes) and '.' (current dir)
            stack.push(part);
        }
    }

    return '/' + stack.join('/');
};`,
    jsWalkthrough:
      'Input: path = "/home//foo/"\n\n' +
      'Split by "/": ["", "home", "", "foo", ""]\n\n' +
      'part="": empty -> skip\n' +
      'part="home": valid -> stack=["home"]\n' +
      'part="": empty -> skip\n' +
      'part="foo": valid -> stack=["home","foo"]\n' +
      'part="": empty -> skip\n\n' +
      'Return "/" + "home/foo" = "/home/foo"\n\n' +
      '---\n' +
      'Input: path = "/../"\n' +
      'Split: ["","..",""]  \n' +
      'part="..": stack empty -> skip pop\n' +
      'Return "/" + "" = "/"',
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
    // Arrays with at most 2 elements are already valid
    if (nums.length <= 2) {
        return nums.length;
    }

    // k is the write pointer, starting at position 2 (first 2 elements always kept)
    let k = 2;

    for (let i = 2; i < nums.length; i++) {
        const currentNum = nums[i];
        // Compare with the element 2 positions back in the output
        // If different, this element won't create a third duplicate
        if (currentNum !== nums[k - 2]) {
            nums[k] = currentNum;
            k = k + 1;
        }
    }

    return k;
};`,
    jsWalkthrough:
      'Input: nums = [1,1,1,2,2,3]\n\n' +
      'k=2 (first 2 elements [1,1] always kept)\n\n' +
      'i=2: currentNum=1, nums[k-2]=nums[0]=1 -> 1===1 -> skip\n' +
      'i=3: currentNum=2, nums[k-2]=nums[0]=1 -> 2!==1 -> nums[2]=2, k=3\n' +
      '  nums=[1,1,2,2,2,3]\n' +
      'i=4: currentNum=2, nums[k-2]=nums[1]=1 -> 2!==1 -> nums[3]=2, k=4\n' +
      '  nums=[1,1,2,2,2,3]\n' +
      'i=5: currentNum=3, nums[k-2]=nums[2]=2 -> 3!==2 -> nums[4]=3, k=5\n' +
      '  nums=[1,1,2,2,3,3]\n\n' +
      'Return k=5 (first 5 elements: [1,1,2,2,3])',
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
    let lo = 0;
    let hi = nums.length - 1;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const midValue = nums[mid];

        if (midValue === target) {
            return true;
        }

        // When nums[lo] === nums[mid], we can't determine which half is sorted
        // Increment lo to skip this duplicate
        if (nums[lo] === midValue) {
            lo = lo + 1;
            continue;
        }

        if (nums[lo] <= midValue) {
            // Left half is sorted
            const targetInLeftHalf = nums[lo] <= target && target < midValue;
            if (targetInLeftHalf) {
                hi = mid - 1;
            } else {
                lo = mid + 1;
            }
        } else {
            // Right half is sorted
            const targetInRightHalf = midValue < target && target <= nums[hi];
            if (targetInRightHalf) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
    }

    return false;
};`,
    jsWalkthrough:
      'Input: nums = [2,5,6,0,0,1,2], target = 0\n\n' +
      'lo=0, hi=6\n' +
      'mid=3: nums[3]=0 === target=0 -> return true\n\n' +
      '---\n' +
      'Input: nums = [2,5,6,0,0,1,2], target = 3\n\n' +
      'lo=0, hi=6\n' +
      'mid=3: nums[3]=0 != 3; nums[0]=2 != nums[3]=0\n' +
      '  nums[0]=2 <= nums[3]=0? No -> right half sorted\n' +
      '  targetInRight: 0<3 and 3<=nums[6]=2? No -> hi=2\n' +
      'lo=0, hi=2: mid=1: nums[1]=5 != 3; nums[0]=2 != 5\n' +
      '  nums[0]=2 <= nums[1]=5? Yes -> left half sorted\n' +
      '  targetInLeft: 2<=3 and 3<5? Yes -> lo=2\n' +
      'lo=2, hi=2: mid=2: nums[2]=6 != 3; nums[2]=6 != 3\n' +
      '  nums[0... wait lo=2 now: nums[2]=6 <= nums[2]=6? Yes\n' +
      '  targetInLeft: 6<=3? No -> lo=3\n' +
      'lo(3) > hi(2) -> return false',
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
    // Dummy node handles the case where the head itself has duplicates
    const dummy = new ListNode(0, head);
    let prev = dummy;

    while (head) {
        const hasDuplicate = head.next && head.val === head.next.val;

        if (hasDuplicate) {
            // Advance head past all nodes with this duplicate value
            const duplicateValue = head.val;
            while (head.next && head.val === head.next.val) {
                head = head.next;
            }
            // Skip all nodes with duplicateValue by pointing prev past them
            prev.next = head.next;
        } else {
            // This node is unique; advance prev
            prev = prev.next;
        }

        head = head.next;
    }

    return dummy.next;
};`,
    jsWalkthrough:
      'Input: head = [1,2,3,3,4,4,5]\n\n' +
      'dummy -> 1 -> 2 -> 3 -> 3 -> 4 -> 4 -> 5\n' +
      'prev=dummy, head=1\n\n' +
      'head=1: next=2, 1!==2 -> no dup -> prev=node(1), head=2\n' +
      'head=2: next=3, 2!==3 -> no dup -> prev=node(2), head=3\n' +
      'head=3: next=3, 3===3 -> has dup!\n' +
      '  inner loop: head.next=3 and 3===3 -> head=node(3)\n' +
      '  head.next now points to node(4)\n' +
      '  prev.next = head.next = node(4) -> skip both 3s\n' +
      '  head = head.next = node(4)\n' +
      'head=4: next=4, 4===4 -> has dup!\n' +
      '  skip both 4s; prev.next = node(5)\n' +
      '  head = node(5)\n' +
      'head=5: next=null -> no dup -> prev=node(5), head=null\n\n' +
      'Return dummy.next = [1,2,5]',
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
    let current = head;

    while (current && current.next) {
        const currentValue = current.val;
        const nextValue = current.next.val;

        if (currentValue === nextValue) {
            // Skip the duplicate next node
            current.next = current.next.next;
        } else {
            // Values differ: advance to next node
            current = current.next;
        }
    }

    return head;
};`,
    jsWalkthrough:
      'Input: head = [1,1,2]\n\n' +
      'current=node(1)\n\n' +
      'Step 1: currentValue=1, nextValue=1 -> equal -> skip next\n' +
      '  current.next = node(2) (skip first duplicate 1)\n\n' +
      'Step 2: currentValue=1, nextValue=2 -> differ -> advance\n' +
      '  current = node(2)\n\n' +
      'Step 3: current.next=null -> loop ends\n\n' +
      'Return head -> [1,2]',
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
    // heights[j] = number of consecutive 1s above (including current row) in column j
    // Add a sentinel 0 at the end to flush remaining stack entries
    const heights = Array(cols + 1).fill(0);
    let maxArea = 0;

    for (const row of matrix) {
        // Update histogram heights for this row
        for (let j = 0; j < cols; j++) {
            if (row[j] === '1') {
                heights[j] = heights[j] + 1;
            } else {
                heights[j] = 0;
            }
        }

        // Apply largest rectangle in histogram algorithm using a monotonic stack
        const stack = [-1];  // sentinel value

        for (let j = 0; j <= cols; j++) {
            const currentHeight = heights[j];

            // Pop bars that are taller than the current bar
            while (stack[stack.length - 1] !== -1 &&
                   heights[stack[stack.length - 1]] >= currentHeight) {
                const barHeight = heights[stack.pop()];
                const leftBoundary = stack[stack.length - 1];
                const barWidth = j - leftBoundary - 1;
                const area = barHeight * barWidth;
                maxArea = Math.max(maxArea, area);
            }

            stack.push(j);
        }
    }

    return maxArea;
};`,
    jsWalkthrough:
      'Input: matrix row = ["1","0","1","1","1"]\n' +
      'Assume heights before this row = [1,0,1,0,0]\n' +
      'After updating: heights = [2,0,2,1,1, 0] (with sentinel)\n\n' +
      'j=0: h=2, stack=[-1,0]\n' +
      'j=1: h=0 < heights[0]=2 -> pop 0: h=2, left=-1, w=1-(-1)-1=1, area=2\n' +
      '  stack=[-1], h=0 >= 0? sentinel -> push 1, stack=[-1,1]\n' +
      'j=2: h=2, stack=[-1,1,2]\n' +
      'j=3: h=1 < heights[2]=2 -> pop 2: h=2, left=1, w=3-1-1=1, area=2\n' +
      '  h=1 >= heights[1]=0 -> push 3, stack=[-1,1,3]\n' +
      'j=4: h=1, heights[3]=1 -> push 4, stack=[-1,1,3,4]\n' +
      'j=5 (sentinel h=0): pop 4: h=1, left=3, w=1, area=1\n' +
      '  pop 3: h=1, left=1, w=5-1-1=3, area=3 -> maxArea=3\n' +
      '  pop 1: h=0, skip...\n' +
      'maxArea = 3 (or 6 from the full matrix)',
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
    // Two dummy heads for two separate chains
    const beforeHead = new ListNode(0);  // chain for nodes < x
    const afterHead = new ListNode(0);   // chain for nodes >= x

    let before = beforeHead;
    let after = afterHead;

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

    // Terminate the after chain to avoid cycles
    after.next = null;

    // Connect the before chain to the after chain
    before.next = afterHead.next;

    return beforeHead.next;
};`,
    jsWalkthrough:
      'Input: head = [1,4,3,2,5,2], x = 3\n\n' +
      'Before chain (val < 3): dummy\n' +
      'After chain (val >= 3): dummy\n\n' +
      'node(1): 1<3 -> before chain: dummy->1; before=node(1)\n' +
      'node(4): 4>=3 -> after chain: dummy->4; after=node(4)\n' +
      'node(3): 3>=3 -> after chain: 4->3; after=node(3)\n' +
      'node(2): 2<3 -> before chain: 1->2; before=node(2)\n' +
      'node(5): 5>=3 -> after chain: 3->5; after=node(5)\n' +
      'node(2): 2<3 -> before chain: 2->2; before=node(2)\n\n' +
      'after.next = null (terminate after chain)\n' +
      'before.next = afterHead.next = node(4)\n\n' +
      'Result: 1->2->2->4->3->5',
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

        // Return cached result if available
        if (memo.has(key)) {
            return memo.get(key);
        }

        // Base case: identical strings are trivially scrambles
        if (a === b) {
            memo.set(key, true);
            return true;
        }

        // Pruning: if sorted characters differ, can never be scrambles
        if ([...a].sort().join('') !== [...b].sort().join('')) {
            memo.set(key, false);
            return false;
        }
        const n = a.length;

        for (let splitLen = 1; splitLen < n; splitLen++) {
            const aLeft = a.slice(0, splitLen);
            const aRight = a.slice(splitLen);
            const bLeft = b.slice(0, splitLen);
            const bRight = b.slice(splitLen);
            const bSuffix = b.slice(n - splitLen);
            const bPrefix = b.slice(0, n - splitLen);

            // No-swap case: left of a matches left of b, right matches right
            const noSwap = dp(aLeft, bLeft) && dp(aRight, bRight);

            // Swap case: left of a matches right part of b, right of a matches left part of b
            const withSwap = dp(aLeft, bSuffix) && dp(aRight, bPrefix);

            if (noSwap || withSwap) {
                memo.set(key, true);
                return true;
            }
        }

        memo.set(key, false);
        return false;
    }

    return dp(s1, s2);
};`,
    jsWalkthrough:
      'Input: s1 = "great", s2 = "rgeat"\n\n' +
      'dp("great","rgeat"):\n' +
      '  sorted("great")="aegrt", sorted("rgeat")="aegrt" -> ok\n' +
      '  splitLen=1: aLeft="g", aRight="reat", bLeft="r", bSuffix="t"\n' +
      '    noSwap: dp("g","r")=false\n' +
      '    withSwap: dp("g","t")=false\n' +
      '  splitLen=2: aLeft="gr", aRight="eat", bLeft="rg", bSuffix="at"\n' +
      '    noSwap: dp("gr","rg")?\n' +
      '      dp("gr","rg"): try splitLen=1: dp("g","r")=false, dp("g","g")=true & dp("r","r")=true -> true!\n' +
      '    noSwap=true, and dp("eat","eat")=true (a===b)\n' +
      '    -> return true\n\n' +
      'Result: true',
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
    const totalCodes = 1 << n;  // 2^n total Gray code values

    for (let i = 0; i < totalCodes; i++) {
        // Formula: Gray code of i = i XOR (i right-shifted by 1)
        const grayValue = i ^ (i >> 1);
        result.push(grayValue);
    }

    return result;
};`,
    jsWalkthrough:
      'Input: n = 2\n' +
      'totalCodes = 1 << 2 = 4\n\n' +
      'i=0 (binary 00): gray = 00 ^ 00 = 0\n' +
      'i=1 (binary 01): gray = 01 ^ 00 = 1\n' +
      'i=2 (binary 10): gray = 10 ^ 01 = 3\n' +
      'i=3 (binary 11): gray = 11 ^ 01 = 2\n\n' +
      'result = [0, 1, 3, 2]\n\n' +
      'Verify consecutive pairs differ by 1 bit:\n' +
      '0(00)->1(01): differ in bit 0\n' +
      '1(01)->3(11): differ in bit 1\n' +
      '3(11)->2(10): differ in bit 0\n' +
      '2(10)->0(00): differ in bit 1 (wrap-around)\n' +
      'Return [0,1,3,2]',
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
    // Dummy node handles the edge case where left = 1 (head gets reversed)
    const dummy = new ListNode(0, head);
    let prev = dummy;

    // Advance prev to the node just before position 'left'
    for (let i = 0; i < left - 1; i++) {
        prev = prev.next;
    }

    // curr starts at position 'left'
    let curr = prev.next;

    // Reverse (right - left) times by moving the next node to the front
    for (let i = 0; i < right - left; i++) {
        const nextNode = curr.next;

        // Remove nextNode from its position and insert it right after prev
        curr.next = nextNode.next;
        nextNode.next = prev.next;
        prev.next = nextNode;
    }

    return dummy.next;
};`,
    jsWalkthrough:
      'Input: head = [1,2,3,4,5], left = 2, right = 4\n\n' +
      'dummy -> 1 -> 2 -> 3 -> 4 -> 5\n' +
      'Advance prev to position 1 (node(1)):\n' +
      '  i=0: prev = node(1)\n\n' +
      'curr = node(2) (position "left")\n\n' +
      'Reverse right-left=2 times:\n\n' +
      'i=0: nextNode=node(3)\n' +
      '  curr.next = node(4)  [remove node(3)]\n' +
      '  nextNode.next = prev.next = node(2)\n' +
      '  prev.next = node(3)\n' +
      '  List: dummy->1->3->2->4->5, curr=node(2)\n\n' +
      'i=1: nextNode=node(4)\n' +
      '  curr.next = node(5)  [remove node(4)]\n' +
      '  nextNode.next = prev.next = node(3)\n' +
      '  prev.next = node(4)\n' +
      '  List: dummy->1->4->3->2->5\n\n' +
      'Return [1,4,3,2,5]',
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
    const result = [];

    function backtrack(startIndex, segments) {
        // Base case: exactly 4 segments and consumed all characters
        if (segments.length === 4) {
            if (startIndex === s.length) {
                result.push(segments.join('.'));
            }
            return;
        }

        // Try taking 1, 2, or 3 characters for the current segment
        for (let length = 1; length <= 3; length++) {
            if (startIndex + length > s.length) {
                break;
            }

            const segment = s.substring(startIndex, startIndex + length);

            // Validate: no leading zeros and value must be <= 255
            const hasLeadingZero = segment[0] === '0' && length > 1;
            const exceedsMax = Number(segment) > 255;

            if (hasLeadingZero || exceedsMax) {
                continue;
            }

            backtrack(startIndex + length, [...segments, segment]);
        }
    }

    backtrack(0, []);
    return result;
};`,
    jsWalkthrough:
      'Input: s = "25525511135"\n\n' +
      'backtrack(0, []):\n' +
      '  len=1: segment="2" -> backtrack(1,["2"])\n' +
      '    len=1: "5" -> backtrack(2,["2","5"])\n' +
      '      ... eventually fails (too many/few chars)\n' +
      '  len=2: segment="25" -> backtrack(2,["25"])\n' +
      '    len=1: "5" -> backtrack(3,["25","5"])\n' +
      '      ... \n' +
      '    len=2: "52" -> backtrack(4,["25","52"])\n' +
      '      len=3: "511" -> backtrack(7,["25","52","511"])... 511>255 skip\n' +
      '  len=3: segment="255" -> backtrack(3,["255"])\n' +
      '    len=3: "255" -> backtrack(6,["255","255"])\n' +
      '      len=2: "11" -> backtrack(8,["255","255","11"])\n' +
      '        len=3: "135" -> backtrack(11,["255","255","11","135"])\n' +
      '          segments.length=4, start=11=s.length -> push "255.255.11.135"\n' +
      '      len=3: "111" -> ... "255.255.111.35"\n\n' +
      'Return ["255.255.11.135","255.255.111.35"]',
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
        // Empty range: return a list containing one null (empty subtree)
        if (lo > hi) {
            return [null];
        }

        const trees = [];

        // Try each value in [lo, hi] as the root
        for (let rootVal = lo; rootVal <= hi; rootVal++) {
            // Build all possible left subtrees using values [lo, rootVal-1]
            const leftSubtrees = build(lo, rootVal - 1);

            // Build all possible right subtrees using values [rootVal+1, hi]
            const rightSubtrees = build(rootVal + 1, hi);

            // Combine each left-right pair with this root
            for (const leftTree of leftSubtrees) {
                for (const rightTree of rightSubtrees) {
                    const root = new TreeNode(rootVal, leftTree, rightTree);
                    trees.push(root);
                }
            }
        }

        return trees;
    }

    return build(1, n);
};`,
    jsWalkthrough:
      'Input: n = 3\n\n' +
      'build(1, 3):\n' +
      '  rootVal=1: left=build(1,0)=[null], right=build(2,3)\n' +
      '    build(2,3): rootVal=2: left=[null], right=build(3,3)\n' +
      '      build(3,3): rootVal=3: left=[null], right=[null] -> [TreeNode(3)]\n' +
      '    root=2, left=null, right=TreeNode(3) -> [TreeNode(2, null, 3)]\n' +
      '    rootVal=3: left=build(2,2)=[TreeNode(2)], right=[null]\n' +
      '    -> [TreeNode(3, TreeNode(2), null)]\n' +
      '    right=build(2,3) = [2->3, 3->2]\n' +
      '  root=1, left=null, right=2->3 -> tree: 1->null,2->null,3\n' +
      '  root=1, left=null, right=3->2 -> tree: 1->null,3->2,null\n' +
      '  rootVal=2: left=build(1,1)=[TreeNode(1)], right=build(3,3)=[TreeNode(3)]\n' +
      '  -> tree: 2->1,3\n' +
      '  rootVal=3: left=build(1,2) = 2 trees, right=[null] -> 2 more trees\n\n' +
      'Total: 5 unique BSTs',
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
    // dp[i] = number of structurally unique BSTs with i nodes
    const dp = Array(n + 1).fill(0);

    // Base cases: empty tree and single node tree each have exactly 1 structure
    dp[0] = 1;
    dp[1] = 1;

    for (let totalNodes = 2; totalNodes <= n; totalNodes++) {
        // Try each value from 1 to totalNodes as the root
        for (let rootVal = 1; rootVal <= totalNodes; rootVal++) {
            const leftCount = dp[rootVal - 1];       // nodes in left subtree
            const rightCount = dp[totalNodes - rootVal];  // nodes in right subtree
            dp[totalNodes] = dp[totalNodes] + leftCount * rightCount;
        }
    }

    return dp[n];
};`,
    jsWalkthrough:
      'Input: n = 3\n\n' +
      'dp = [1, 1, 0, 0]\n\n' +
      'totalNodes=2:\n' +
      '  rootVal=1: left=dp[0]=1, right=dp[1]=1 -> dp[2]+=1\n' +
      '  rootVal=2: left=dp[1]=1, right=dp[0]=1 -> dp[2]+=1\n' +
      '  dp[2] = 2\n\n' +
      'totalNodes=3:\n' +
      '  rootVal=1: left=dp[0]=1, right=dp[2]=2 -> dp[3]+=2\n' +
      '  rootVal=2: left=dp[1]=1, right=dp[1]=1 -> dp[3]+=1\n' +
      '  rootVal=3: left=dp[2]=2, right=dp[0]=1 -> dp[3]+=2\n' +
      '  dp[3] = 5\n\n' +
      'Return dp[3] = 5',
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
    const m = s1.length;
    const n = s2.length;

    // Quick check: lengths must add up
    if (m + n !== s3.length) {
        return false;
    }

    // dp[i][j] = true if s3[0..i+j-1] can be formed by interleaving s1[0..i-1] and s2[0..j-1]
    const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(false));
    dp[0][0] = true;

    for (let i = 0; i <= m; i++) {
        for (let j = 0; j <= n; j++) {
            const s3Index = i + j - 1;

            // Try extending by taking the next char from s1
            if (i > 0 && s1[i - 1] === s3[s3Index]) {
                dp[i][j] = dp[i][j] || dp[i - 1][j];
            }

            // Try extending by taking the next char from s2
            if (j > 0 && s2[j - 1] === s3[s3Index]) {
                dp[i][j] = dp[i][j] || dp[i][j - 1];
            }
        }
    }

    return dp[m][n];
};`,
    jsWalkthrough:
      'Input: s1="aab", s2="axy", s3="aaxaby"\n' +
      'm=3, n=3, len check: 6===6 ok\n\n' +
      'dp[0][0]=true\n' +
      'i=0: j=0 (skip); j=1: s2[0]="a"===s3[0]="a" -> dp[0][1]=dp[0][0]=true\n' +
      '  j=2: s2[1]="x"===s3[1]="a"? No -> dp[0][2]=false\n' +
      '  j=3: s2[2]="y"===s3[2]="x"? No -> dp[0][3]=false\n\n' +
      'i=1: j=0: s1[0]="a"===s3[0]="a" -> dp[1][0]=dp[0][0]=true\n' +
      '  j=1: s1[0]="a"===s3[1]="a" -> dp[1][1]|=dp[0][1]=true; also s2[0]="a"===s3[1]="a" -> dp[1][1]|=dp[1][0]=true\n' +
      '  dp[1][1]=true\n' +
      '... (continue filling table)\n\n' +
      'Return dp[3][3]',
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
    let firstMisplaced = null;
    let secondMisplaced = null;
    let prevNode = new TreeNode(-Infinity);

    function inorder(node) {
        if (!node) return;

        // Visit left subtree
        inorder(node.left);

        // In a valid BST, prevNode.val should always be < node.val
        // An inversion means one of these two nodes is misplaced
        if (prevNode.val > node.val) {
            if (!firstMisplaced) {
                // First inversion: prevNode is the first swapped node
                firstMisplaced = prevNode;
            }
            // Always update second: it may be updated multiple times
            secondMisplaced = node;
        }

        prevNode = node;

        // Visit right subtree
        inorder(node.right);
    }

    inorder(root);

    // Swap the values to fix the BST
    const temp = firstMisplaced.val;
    firstMisplaced.val = secondMisplaced.val;
    secondMisplaced.val = temp;
};`,
    jsWalkthrough:
      'Input: root = [1,3,null,null,2] (3 and 1 are swapped)\n' +
      'In-order traversal should give sorted sequence\n\n' +
      'Traverse: 3 -> 2 -> 1 (the actual in-order)\n\n' +
      'prevNode=-Inf, node=3: -Inf<3, no inversion\n' +
      '  prevNode=3, node=2: 3>2 -> INVERSION!\n' +
      '  firstMisplaced=3 (prevNode), secondMisplaced=2 (node)\n' +
      '  prevNode=2, node=1: 2>1 -> INVERSION!\n' +
      '  firstMisplaced stays 3, secondMisplaced=1 (updated)\n\n' +
      'Swap: firstMisplaced.val=3 and secondMisplaced.val=1\n' +
      '  firstMisplaced.val=1, secondMisplaced.val=3\n\n' +
      'Fixed tree in-order: 1->2->3 (correct BST)',
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
    function isMirror(leftNode, rightNode) {
        // Both null: symmetric base case
        if (!leftNode && !rightNode) {
            return true;
        }

        // One null, one non-null: not symmetric
        if (!leftNode || !rightNode) {
            return false;
        }

        // Values must match, and subtrees must mirror each other
        const valuesMatch = leftNode.val === rightNode.val;
        const outerMirror = isMirror(leftNode.left, rightNode.right);
        const innerMirror = isMirror(leftNode.right, rightNode.left);

        return valuesMatch && outerMirror && innerMirror;
    }

    // Compare root with itself (left subtree mirrors right subtree)
    return isMirror(root, root);
};`,
    jsWalkthrough:
      'Input: root = [1,2,2,3,4,4,3]\n\n' +
      'isMirror(root, root) = isMirror(node(1), node(1))\n' +
      '  values match: 1===1\n' +
      '  outerMirror = isMirror(node(2,left), node(2,right))\n' +
      '    values match: 2===2\n' +
      '    outerMirror = isMirror(node(3), node(3)) -> values match, both leaves -> true\n' +
      '    innerMirror = isMirror(node(4), node(4)) -> values match, both leaves -> true\n' +
      '    -> true\n' +
      '  innerMirror = isMirror(node(2,right), node(2,left)) -> same as above -> true\n' +
      '  -> true\n\n' +
      'Return true',
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
    const result = [];
    let leftToRight = true;

    while (queue.length) {
        const levelValues = [];
        const levelSize = queue.length;

        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();

            if (leftToRight) {
                // Append to end for left-to-right order
                levelValues.push(node.val);
            } else {
                // Prepend to front for right-to-left order
                levelValues.unshift(node.val);
            }

            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }

        result.push(levelValues);
        // Toggle direction for next level
        leftToRight = !leftToRight;
    }

    return result;
};`,
    jsWalkthrough:
      'Input: root = [3,9,20,null,null,15,7]\n\n' +
      'queue=[3], leftToRight=true\n\n' +
      'Level 1 (leftToRight=true): size=1\n' +
      '  node=3: push 3, enqueue 9 and 20\n' +
      '  levelValues=[3], result=[[3]], leftToRight=false\n\n' +
      'Level 2 (leftToRight=false): size=2\n' +
      '  node=9: unshift 9 -> levelValues=[9]\n' +
      '  node=20: unshift 20 -> levelValues=[20,9]\n' +
      '  enqueue 15 and 7\n' +
      '  result=[[3],[20,9]], leftToRight=true\n\n' +
      'Level 3 (leftToRight=true): size=2\n' +
      '  node=15: push 15 -> levelValues=[15]\n' +
      '  node=7: push 7 -> levelValues=[15,7]\n' +
      '  result=[[3],[20,9],[15,7]]\n\n' +
      'Return [[3],[20,9],[15,7]]',
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
    // Map each value in inorder to its index for O(1) lookup
    const inorderMap = new Map();
    inorder.forEach((val, idx) => inorderMap.set(val, idx));

    // We consume postorder from right to left (root is last element)
    let postIdx = postorder.length - 1;

    function build(lo, hi) {
        // No nodes in this range
        if (lo > hi) {
            return null;
        }

        // The current root is the rightmost remaining element in postorder
        const rootVal = postorder[postIdx];
        postIdx = postIdx - 1;

        const root = new TreeNode(rootVal);

        // Find root's position in inorder to split left/right subtrees
        const mid = inorderMap.get(rootVal);

        // Build right subtree first! (postorder processes right before left when going backwards)
        root.right = build(mid + 1, hi);
        root.left = build(lo, mid - 1);

        return root;
    }

    return build(0, inorder.length - 1);
};`,
    jsWalkthrough:
      'Input: inorder = [9,3,15,20,7], postorder = [9,15,7,20,3]\n\n' +
      'inorderMap = {9:0, 3:1, 15:2, 20:3, 7:4}, postIdx = 4\n\n' +
      'build(0, 4):\n' +
      '  rootVal = postorder[4] = 3, postIdx -> 3\n' +
      '  mid = inorderMap[3] = 1\n' +
      '  Build right subtree: build(2, 4)\n' +
      '    rootVal = postorder[3] = 20, postIdx -> 2\n' +
      '    mid = inorderMap[20] = 3\n' +
      '    Build right: build(4, 4)\n' +
      '      rootVal = postorder[2] = 7, postIdx -> 1\n' +
      '      mid = 4, build(5,4) -> null, build(4,3) -> null\n' +
      '      return node(7)\n' +
      '    Build left: build(2, 2)\n' +
      '      rootVal = postorder[1] = 15, postIdx -> 0\n' +
      '      mid = 2, both sides null\n' +
      '      return node(15)\n' +
      '    return node(20, left=15, right=7)\n' +
      '  Build left subtree: build(0, 0)\n' +
      '    rootVal = postorder[0] = 9, postIdx -> -1\n' +
      '    mid = 0, both sides null\n' +
      '    return node(9)\n' +
      '  return node(3, left=9, right=20)\n\n' +
      'Result tree: [3,9,20,null,null,15,7]',
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
    const result = [];

    while (queue.length) {
        const levelValues = [];
        const levelSize = queue.length;

        // Process all nodes at the current level
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            levelValues.push(node.val);

            if (node.left) {
                queue.push(node.left);
            }

            if (node.right) {
                queue.push(node.right);
            }
        }

        result.push(levelValues);
    }

    // Reverse gives bottom-up order
    return result.reverse();
};`,
    jsWalkthrough:
      'Input: root = [3,9,20,null,null,15,7]\n\n' +
      'Initial: queue = [node(3)], result = []\n\n' +
      'Level 1: levelSize=1, process node(3)\n' +
      '  levelValues = [3], queue = [node(9), node(20)]\n' +
      '  result = [[3]]\n\n' +
      'Level 2: levelSize=2, process node(9), node(20)\n' +
      '  node(9): levelValues=[9], no children\n' +
      '  node(20): levelValues=[9,20], children 15,7 added\n' +
      '  queue = [node(15), node(7)], result = [[3],[9,20]]\n\n' +
      'Level 3: levelSize=2, process node(15), node(7)\n' +
      '  levelValues = [15,7], no children\n' +
      '  result = [[3],[9,20],[15,7]]\n\n' +
      'result.reverse() = [[15,7],[9,20],[3]]\n\n' +
      'Output: [[15,7],[9,20],[3]]',
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
    // Base cases
    if (!head) {
        return null;
    }

    if (!head.next) {
        return new TreeNode(head.val);
    }

    // Use slow/fast pointers to find the middle of the list
    let prev = null;
    let slow = head;
    let fast = head;

    while (fast && fast.next) {
        prev = slow;
        slow = slow.next;
        fast = fast.next.next;
    }

    // Cut the list before the middle so the left half is separate
    prev.next = null;

    // The middle node becomes the root of this subtree
    const root = new TreeNode(slow.val);

    // Recursively build the left and right subtrees
    root.left = sortedListToBST(head);
    root.right = sortedListToBST(slow.next);

    return root;
};`,
    jsWalkthrough:
      'Input: head = [-10,-3,0,5,9]\n\n' +
      'List: -10 -> -3 -> 0 -> 5 -> 9\n\n' +
      'sortedListToBST([-10,-3,0,5,9]):\n' +
      '  slow/fast pointers: slow ends at 0, prev = -3\n' +
      '  Cut list: [-10,-3] and [5,9]\n' +
      '  root = node(0)\n' +
      '  root.left = sortedListToBST([-10,-3])\n' +
      '    slow = -3, prev = -10, cut: [-10] and []\n' +
      '    root = node(-3)\n' +
      '    root.left = sortedListToBST([-10]) -> node(-10)\n' +
      '    root.right = sortedListToBST([]) -> null\n' +
      '    return node(-3, left=-10, right=null)\n' +
      '  root.right = sortedListToBST([5,9])\n' +
      '    slow = 9, prev = 5, cut: [5] and []\n' +
      '    root = node(9)\n' +
      '    root.left = sortedListToBST([5]) -> node(5)\n' +
      '    root.right = sortedListToBST([]) -> null\n' +
      '    return node(9, left=5, right=null)\n' +
      '  return node(0, left=node(-3), right=node(9))\n\n' +
      'Output: [0,-3,9,-10,null,5]',
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
    if (!root) {
        return 0;
    }

    // BFS queue stores [node, depth] pairs
    const queue = [[root, 1]];

    while (queue.length) {
        const [node, depth] = queue.shift();

        // A leaf node (no children) is the shallowest so far — return immediately
        const isLeaf = !node.left && !node.right;
        if (isLeaf) {
            return depth;
        }

        // Queue children with incremented depth
        if (node.left) {
            queue.push([node.left, depth + 1]);
        }

        if (node.right) {
            queue.push([node.right, depth + 1]);
        }
    }

    return 0;
};`,
    jsWalkthrough:
      'Input: root = [3,9,20,null,null,15,7]\n\n' +
      'queue = [[node(3), 1]]\n\n' +
      'Step 1: dequeue [node(3), 1]\n' +
      '  node(3) has left=9 and right=20, not a leaf\n' +
      '  queue = [[node(9),2], [node(20),2]]\n\n' +
      'Step 2: dequeue [node(9), 2]\n' +
      '  node(9) has no children -> isLeaf = true\n' +
      '  Return 2 immediately (BFS guarantees this is the minimum depth)\n\n' +
      'Output: 2',
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
    // Empty node contributes nothing
    if (!root) {
        return false;
    }

    // Subtract the current node's value from the remaining target
    const remaining = targetSum - root.val;

    // At a leaf, check if we've exactly hit our target
    const isLeaf = !root.left && !root.right;
    if (isLeaf) {
        return remaining === 0;
    }

    // Check either subtree — return true if either has a valid path
    const foundInLeft = hasPathSum(root.left, remaining);
    const foundInRight = hasPathSum(root.right, remaining);
    return foundInLeft || foundInRight;
};`,
    jsWalkthrough:
      'Input: root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22\n\n' +
      'hasPathSum(node(5), 22):\n' +
      '  remaining = 22 - 5 = 17, not a leaf\n' +
      '  hasPathSum(node(4), 17):\n' +
      '    remaining = 17 - 4 = 13, not a leaf\n' +
      '    hasPathSum(node(11), 13):\n' +
      '      remaining = 13 - 11 = 2, not a leaf\n' +
      '      hasPathSum(node(7), 2):\n' +
      '        remaining = 2 - 7 = -5, isLeaf=true, -5 !== 0 -> false\n' +
      '      hasPathSum(node(2), 2):\n' +
      '        remaining = 2 - 2 = 0, isLeaf=true, 0 === 0 -> TRUE!\n' +
      '      return true\n' +
      '    return true\n' +
      '  return true\n\n' +
      'Output: true (path 5->4->11->2 sums to 22)',
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
    const result = [];

    function dfs(node, remainingSum, currentPath) {
        if (!node) {
            return;
        }

        // Add the current node to the path
        currentPath.push(node.val);

        // Check if this is a leaf and we've hit the target
        const isLeaf = !node.left && !node.right;
        const hitTarget = remainingSum === node.val;

        if (isLeaf && hitTarget) {
            // Save a copy of the path (not a reference)
            result.push([...currentPath]);
        }

        // Continue DFS with reduced remaining sum
        dfs(node.left, remainingSum - node.val, currentPath);
        dfs(node.right, remainingSum - node.val, currentPath);

        // Backtrack: remove current node before returning to parent
        currentPath.pop();
    }

    dfs(root, targetSum, []);
    return result;
};`,
    jsWalkthrough:
      'Input: root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22\n\n' +
      'dfs(node(5), 22, []):\n' +
      '  path=[5]\n' +
      '  dfs(node(4), 17, [5]):\n' +
      '    path=[5,4]\n' +
      '    dfs(node(11), 13, [5,4]):\n' +
      '      path=[5,4,11]\n' +
      '      dfs(node(7), 2, [5,4,11]):\n' +
      '        path=[5,4,11,7], leaf, 2 !== 7, no add\n' +
      '        pop -> path=[5,4,11]\n' +
      '      dfs(node(2), 2, [5,4,11]):\n' +
      '        path=[5,4,11,2], leaf, 2 === 2, ADD [5,4,11,2]\n' +
      '        pop -> path=[5,4,11]\n' +
      '      pop -> path=[5,4]\n' +
      '    pop -> path=[5]\n' +
      '  dfs(node(8), 17, [5]):\n' +
      '    ... eventually finds path [5,8,4,5] which sums to 22\n' +
      '    ADD [5,8,4,5]\n\n' +
      'Output: [[5,4,11,2],[5,8,4,5]]',
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
    // prev tracks the previously processed node in reverse pre-order
    let prev = null;

    // Process in reverse pre-order: right, left, root
    // This builds the flattened list from tail to head
    function dfs(node) {
        if (!node) {
            return;
        }

        // Process right subtree first, then left
        dfs(node.right);
        dfs(node.left);

        // Wire this node's right to the previously processed node
        node.right = prev;

        // Clear left child (linked list uses only right pointers)
        node.left = null;

        // This node is now the "last processed" for the next call
        prev = node;
    }

    dfs(root);
};`,
    jsWalkthrough:
      'Input: root = [1,2,5,3,4,null,6]\n\n' +
      'Tree structure:\n' +
      '    1\n' +
      '   / \\\n' +
      '  2   5\n' +
      ' / \\   \\\n' +
      '3   4   6\n\n' +
      'Reverse pre-order: process right, left, root\n\n' +
      'dfs(6): prev=null -> 6.right=null, 6.left=null, prev=node(6)\n' +
      'dfs(5): right=node(6) done; no left\n' +
      '  5.right=node(6), 5.left=null, prev=node(5)\n' +
      'dfs(4): leaf, 4.right=node(5), prev=node(4)\n' +
      'dfs(3): leaf, 3.right=node(4), prev=node(3)\n' +
      'dfs(2): right=node(4) done, left=node(3) done\n' +
      '  2.right=node(3), 2.left=null, prev=node(2)\n' +
      'dfs(1): right=node(5) done, left=node(2) done\n' +
      '  1.right=node(2), 1.left=null, prev=node(1)\n\n' +
      'Flattened: 1->2->3->4->5->6 (all via right pointers)',
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
    const sLen = s.length;
    const tLen = t.length;

    // dp[i][j] = number of ways to form t[0..j-1] as subsequence of s[0..i-1]
    const dp = Array.from({length: sLen + 1}, () => Array(tLen + 1).fill(0));

    // Base case: empty t can always be formed (one way: choose nothing)
    for (let i = 0; i <= sLen; i++) {
        dp[i][0] = 1;
    }

    for (let i = 1; i <= sLen; i++) {
        for (let j = 1; j <= tLen; j++) {
            // Always carry over the count from skipping s[i-1]
            dp[i][j] = dp[i - 1][j];

            // If characters match, also count using s[i-1]
            if (s[i - 1] === t[j - 1]) {
                dp[i][j] = dp[i][j] + dp[i - 1][j - 1];
            }
        }
    }

    return dp[sLen][tLen];
};`,
    jsWalkthrough:
      'Input: s = "rabbbit", t = "rabbit"\n\n' +
      'sLen=7, tLen=6\n' +
      'Initialize: dp[i][0] = 1 for all i (empty t matched 1 way)\n\n' +
      'Fill DP table row by row (selected key cells):\n\n' +
      'i=1 (s[0]="r"), j=1 (t[0]="r"): match!\n' +
      '  dp[1][1] = dp[0][1] + dp[0][0] = 0 + 1 = 1\n\n' +
      'i=2 (s[1]="a"), j=2 (t[1]="a"): match!\n' +
      '  dp[2][2] = dp[1][2] + dp[1][1] = 0 + 1 = 1\n\n' +
      'i=3 (s[2]="b"), j=3 (t[2]="b"): match!\n' +
      '  dp[3][3] = dp[2][3] + dp[2][2] = 0 + 1 = 1\n\n' +
      'i=4 (s[3]="b"), j=3 (t[2]="b"): match! (second b)\n' +
      '  dp[4][3] = dp[3][3] + dp[3][2] = 1 + 1 = 2\n\n' +
      'i=5 (s[4]="b"), j=3 (t[2]="b"): match! (third b)\n' +
      '  dp[5][3] = dp[4][3] + dp[4][2] = 2 + 1 = 3\n\n' +
      '... continuing fills ...\n\n' +
      'dp[7][6] = 3\n\n' +
      'Output: 3 (three ways to choose which "b" to skip)',
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
    if (!root) {
        return root;
    }

    // leftmost tracks the first node of the current level
    let leftmost = root;

    while (leftmost.left) {
        // Traverse the current level using already-set next pointers
        let head = leftmost;

        while (head) {
            // Connection 1: same parent - left child -> right child
            head.left.next = head.right;

            // Connection 2: cross parent - right child -> left child of next sibling
            if (head.next) {
                head.right.next = head.next.left;
            }

            // Move to the next node at this level
            head = head.next;
        }

        // Move down to the next level
        leftmost = leftmost.left;
    }

    return root;
};`,
    jsWalkthrough:
      'Input: root = [1,2,3,4,5,6,7] (perfect binary tree)\n\n' +
      'Level 0: leftmost = node(1)\n' +
      '  leftmost.left exists (node(2)), so enter outer while\n' +
      '  head = node(1):\n' +
      '    head.left.next = head.right -> node(2).next = node(3) ✓\n' +
      '    head.next is null, skip cross connection\n' +
      '    head = head.next = null, inner while ends\n' +
      '  leftmost = leftmost.left = node(2)\n\n' +
      'Level 1: leftmost = node(2)\n' +
      '  leftmost.left exists (node(4)), enter outer while\n' +
      '  head = node(2):\n' +
      '    2.left.next = 2.right -> node(4).next = node(5) ✓\n' +
      '    head.next = node(3) exists:\n' +
      '      2.right.next = 3.left -> node(5).next = node(6) ✓\n' +
      '    head = node(3)\n' +
      '  head = node(3):\n' +
      '    3.left.next = 3.right -> node(6).next = node(7) ✓\n' +
      '    head.next = null, skip\n' +
      '    head = null, inner while ends\n' +
      '  leftmost = node(4)\n\n' +
      'Level 2: node(4).left is null, outer while ends\n\n' +
      'Result: 4->5->6->7->null all connected',
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
        // Dummy node acts as the head of the next level's linked list
        const dummy = { next: null };
        let curr = dummy;

        // Walk across the current level using next pointers
        while (node) {
            if (node.left) {
                curr.next = node.left;
                curr = curr.next;
            }

            if (node.right) {
                curr.next = node.right;
                curr = curr.next;
            }

            node = node.next;
        }

        // Move to the start of the next level
        node = dummy.next;
    }

    return root;
};`,
    jsWalkthrough:
      'Input: root = [1,2,3,4,5,null,7]\n\n' +
      'Level 0: node = node(1)\n' +
      '  dummy -> null, curr = dummy\n' +
      '  node(1): left=node(2), right=node(3)\n' +
      '    curr.next = node(2), curr = node(2)\n' +
      '    curr.next = node(3), curr = node(3)\n' +
      '    node = node(1).next = null -> inner while ends\n' +
      '  node = dummy.next = node(2)\n\n' +
      'Level 1: node = node(2)\n' +
      '  dummy -> null, curr = dummy\n' +
      '  node(2): left=node(4), right=node(5)\n' +
      '    curr.next = node(4), curr = node(4)\n' +
      '    curr.next = node(5), curr = node(5)\n' +
      '    node = node(2).next = node(3)\n' +
      '  node(3): left=null, right=node(7)\n' +
      '    curr.next = node(7), curr = node(7)\n' +
      '    node = node(3).next = null\n' +
      '  inner while ends\n' +
      '  node = dummy.next = node(4)\n' +
      '  node(4).next -> node(5), node(5).next -> node(7) are set\n\n' +
      'Level 2: node(4), all leaves, no children to link\n' +
      '  node = dummy.next = null -> outer while ends\n\n' +
      'Result: [1,#,2,3,#,4,5,7,#]',
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
        // Each row starts with (i+1) elements, all 1s
        const row = Array(i + 1).fill(1);

        // Interior elements are the sum of the two elements directly above
        for (let j = 1; j < i; j++) {
            const aboveLeft = triangle[i - 1][j - 1];
            const aboveRight = triangle[i - 1][j];
            row[j] = aboveLeft + aboveRight;
        }

        triangle.push(row);
    }

    return triangle;
};`,
    jsWalkthrough:
      'Input: numRows = 5\n\n' +
      'i=0: row = [1], triangle = [[1]]\n\n' +
      'i=1: row = [1,1], no interior (j from 1 to 0 = empty)\n' +
      '  triangle = [[1],[1,1]]\n\n' +
      'i=2: row = [1,1,1], interior: j=1\n' +
      '  aboveLeft = triangle[1][0] = 1, aboveRight = triangle[1][1] = 1\n' +
      '  row[1] = 1+1 = 2 -> row = [1,2,1]\n' +
      '  triangle = [[1],[1,1],[1,2,1]]\n\n' +
      'i=3: row = [1,1,1,1], interior: j=1,2\n' +
      '  j=1: aboveLeft=1, aboveRight=2 -> row[1]=3\n' +
      '  j=2: aboveLeft=2, aboveRight=1 -> row[2]=3\n' +
      '  row = [1,3,3,1], triangle = [[1],[1,1],[1,2,1],[1,3,3,1]]\n\n' +
      'i=4: row = [1,1,1,1,1], interior: j=1,2,3\n' +
      '  j=1: 1+3=4, j=2: 3+3=6, j=3: 3+1=4\n' +
      '  row = [1,4,6,4,1]\n\n' +
      'Output: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]',
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
    // Initialize with all 1s — first and last are always 1
    const row = Array(rowIndex + 1).fill(1);

    // Simulate building each row in-place from row 2 onward
    for (let i = 2; i <= rowIndex; i++) {
        // Update from right to left so we use previous row values
        for (let j = i - 1; j > 0; j = j - 1) {
            // row[j] = row[j] (above right) + row[j-1] (above left)
            row[j] = row[j] + row[j - 1];
        }
    }

    return row;
};`,
    jsWalkthrough:
      'Input: rowIndex = 3\n\n' +
      'Initialize: row = [1, 1, 1, 1]\n\n' +
      'i=2 (simulating row 2 of Pascal\'s triangle):\n' +
      '  j=1 (right to left): row[1] = row[1] + row[0] = 1 + 1 = 2\n' +
      '  row = [1, 2, 1, 1]\n\n' +
      'i=3 (simulating row 3 of Pascal\'s triangle):\n' +
      '  j=2: row[2] = row[2] + row[1] = 1 + 2 = 3\n' +
      '  j=1: row[1] = row[1] + row[0] = 2 + 1 = 3\n' +
      '  row = [1, 3, 3, 1]\n\n' +
      'Output: [1, 3, 3, 1]',
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
    // Start with the bottom row as the initial DP values
    const dp = [...triangle[triangle.length - 1]];

    // Work upward from the second-to-last row
    for (let i = triangle.length - 2; i >= 0; i--) {
        for (let j = 0; j <= i; j++) {
            const currentCellValue = triangle[i][j];
            const bestPathBelow = Math.min(dp[j], dp[j + 1]);

            // This cell's minimum path sum = its value + best of two children below
            dp[j] = currentCellValue + bestPathBelow;
        }
    }

    // dp[0] now holds the minimum path sum from top to bottom
    return dp[0];
};`,
    jsWalkthrough:
      'Input: triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]\n\n' +
      'Start with bottom row: dp = [4, 1, 8, 3]\n\n' +
      'i=2 (row [6,5,7]):\n' +
      '  j=0: currentCell=6, bestBelow=min(dp[0],dp[1])=min(4,1)=1 -> dp[0]=6+1=7\n' +
      '  j=1: currentCell=5, bestBelow=min(dp[1],dp[2])=min(1,8)=1 -> dp[1]=5+1=6\n' +
      '  j=2: currentCell=7, bestBelow=min(dp[2],dp[3])=min(8,3)=3 -> dp[2]=7+3=10\n' +
      '  dp = [7, 6, 10, 3]\n\n' +
      'i=1 (row [3,4]):\n' +
      '  j=0: currentCell=3, bestBelow=min(7,6)=6 -> dp[0]=3+6=9\n' +
      '  j=1: currentCell=4, bestBelow=min(6,10)=6 -> dp[1]=4+6=10\n' +
      '  dp = [9, 10, 10, 3]\n\n' +
      'i=0 (row [2]):\n' +
      '  j=0: currentCell=2, bestBelow=min(9,10)=9 -> dp[0]=2+9=11\n' +
      '  dp = [11, ...]\n\n' +
      'Output: dp[0] = 11 (path: 2->3->5->1)',
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
    let totalProfit = 0;

    for (let i = 1; i < prices.length; i++) {
        const todayPrice = prices[i];
        const yesterdayPrice = prices[i - 1];

        // If price went up, we could have bought yesterday and sold today
        if (todayPrice > yesterdayPrice) {
            const dailyGain = todayPrice - yesterdayPrice;
            totalProfit = totalProfit + dailyGain;
        }
    }

    return totalProfit;
};`,
    jsWalkthrough:
      'Input: prices = [7,1,5,3,6,4]\n\n' +
      'i=1: today=1, yesterday=7, 1 < 7 -> no gain\n' +
      '  totalProfit = 0\n\n' +
      'i=2: today=5, yesterday=1, 5 > 1 -> gain = 5-1 = 4\n' +
      '  totalProfit = 0 + 4 = 4\n\n' +
      'i=3: today=3, yesterday=5, 3 < 5 -> no gain\n' +
      '  totalProfit = 4\n\n' +
      'i=4: today=6, yesterday=3, 6 > 3 -> gain = 6-3 = 3\n' +
      '  totalProfit = 4 + 3 = 7\n\n' +
      'i=5: today=4, yesterday=6, 4 < 6 -> no gain\n' +
      '  totalProfit = 7\n\n' +
      'Output: 7',
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
    // buy1: lowest price seen so far for the first buy
    let buy1 = Infinity;

    // sell1: max profit after the first sell
    let sell1 = 0;

    // buy2: effective cost of the second buy (reduced by first profit)
    let buy2 = Infinity;

    // sell2: max total profit after the second sell
    let sell2 = 0;

    for (const price of prices) {
        // Update each state based on current price
        buy1 = Math.min(buy1, price);
        sell1 = Math.max(sell1, price - buy1);
        buy2 = Math.min(buy2, price - sell1);
        sell2 = Math.max(sell2, price - buy2);
    }

    return sell2;
};`,
    jsWalkthrough:
      'Input: prices = [3,3,5,0,0,3,1,4]\n\n' +
      'Initial: buy1=Inf, sell1=0, buy2=Inf, sell2=0\n\n' +
      'price=3: buy1=3, sell1=max(0,0)=0, buy2=min(Inf,3-0)=3, sell2=max(0,3-3)=0\n' +
      'price=3: buy1=3, sell1=0, buy2=3, sell2=0\n' +
      'price=5: buy1=3, sell1=max(0,5-3)=2, buy2=min(3,5-2)=3, sell2=max(0,5-3)=2\n' +
      'price=0: buy1=0, sell1=max(2,0-0)=2, buy2=min(3,0-2)=-2, sell2=max(2,0-(-2))=2\n' +
      'price=0: buy1=0, sell1=2, buy2=-2, sell2=2\n' +
      'price=3: buy1=0, sell1=max(2,3)=3, buy2=min(-2,3-3)=-2, sell2=max(2,3-(-2))=5\n' +
      'price=1: buy1=0, sell1=3, buy2=min(-2,1-3)=-2, sell2=max(5,1-(-2))=5\n' +
      'price=4: buy1=0, sell1=max(3,4)=4, buy2=min(-2,4-4)=-2, sell2=max(5,4-(-2))=6\n\n' +
      'Output: sell2 = 6',
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
    if (!wordSet.has(endWord)) {
        return [];
    }

    // layer[word] = set of words that can transition to 'word' in one step
    const layer = new Map();
    const queue = [beginWord];
    const visited = new Set([beginWord]);
    let found = false;

    while (queue.length && !found) {
        const nextVisited = new Set();
        const levelSize = queue.length;

        // Process all words at the current BFS level
        for (let q = 0; q < levelSize; q = q + 1) {
            const word = queue.shift();

            // Try changing each character to every letter a-z
            for (let i = 0; i < word.length; i = i + 1) {
                for (let charCode = 97; charCode <= 122; charCode = charCode + 1) {
                    const newWord = word.slice(0, i) + String.fromCharCode(charCode) + word.slice(i + 1);

                    if (wordSet.has(newWord) && !visited.has(newWord)) {
                        nextVisited.add(newWord);

                        // Record that 'word' is a predecessor of 'newWord'
                        if (!layer.has(newWord)) {
                            layer.set(newWord, new Set());
                        }
                        layer.get(newWord).add(word);

                        if (newWord === endWord) {
                            found = true;
                        }
                    }
                }
            }
        }

        // Mark all words found at this level as visited (after the full level)
        for (const w of nextVisited) {
            visited.add(w);
            queue.push(w);
        }
    }

    const result = [];

    // Backtrack from endWord to beginWord using the predecessor map
    function backtrack(word, path) {
        if (word === beginWord) {
            result.push([...path].reverse());
            return;
        }

        if (!layer.has(word)) {
            return;
        }

        for (const predecessor of layer.get(word)) {
            path.push(predecessor);
            backtrack(predecessor, path);
            path.pop();
        }
    }

    if (found) {
        backtrack(endWord, [endWord]);
    }

    return result;
};`,
    jsWalkthrough:
      'Input: beginWord="hit", endWord="cog"\n' +
      'wordList=["hot","dot","dog","lot","log","cog"]\n\n' +
      'BFS Level 1: queue=["hit"]\n' +
      '  "hit" -> try all 1-char changes:\n' +
      '    "hot" in wordSet! layer["hot"]={"hit"}, nextVisited={"hot"}\n' +
      '  visited={"hit","hot"}, queue=["hot"]\n\n' +
      'BFS Level 2: queue=["hot"]\n' +
      '  "hot" -> "dot" in wordSet, layer["dot"]={"hot"}\n' +
      '  "hot" -> "lot" in wordSet, layer["lot"]={"hot"}\n' +
      '  nextVisited={"dot","lot"}, queue=["dot","lot"]\n\n' +
      'BFS Level 3: queue=["dot","lot"]\n' +
      '  "dot" -> "dog" found, layer["dog"]={"dot"}\n' +
      '  "lot" -> "log" found, layer["log"]={"lot"}\n' +
      '  queue=["dog","log"]\n\n' +
      'BFS Level 4: queue=["dog","log"]\n' +
      '  "dog" -> "cog" found! layer["cog"]={"dog"}, found=true\n' +
      '  "log" -> "cog" found! layer["cog"]={"dog","log"}\n\n' +
      'Backtrack from "cog":\n' +
      '  "cog" <- "dog" <- "dot" <- "hot" <- "hit" => ["hit","hot","dot","dog","cog"]\n' +
      '  "cog" <- "log" <- "lot" <- "hot" <- "hit" => ["hit","hot","lot","log","cog"]\n\n' +
      'Output: [["hit","hot","dot","dog","cog"],["hit","hot","lot","log","cog"]]',
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
    function dfs(node, currentNumber) {
        // Empty node contributes 0
        if (!node) {
            return 0;
        }

        // Append the current digit to form the number so far
        const numberSoFar = currentNumber * 10 + node.val;

        // At a leaf, this number is complete — return it
        const isLeaf = !node.left && !node.right;
        if (isLeaf) {
            return numberSoFar;
        }

        // Sum contributions from both subtrees
        const leftSum = dfs(node.left, numberSoFar);
        const rightSum = dfs(node.right, numberSoFar);
        return leftSum + rightSum;
    }

    return dfs(root, 0);
};`,
    jsWalkthrough:
      'Input: root = [1,2,3]\n\n' +
      'Tree:\n' +
      '  1\n' +
      ' / \\\n' +
      '2   3\n\n' +
      'dfs(node(1), 0):\n' +
      '  numberSoFar = 0*10 + 1 = 1\n' +
      '  not a leaf, recurse\n' +
      '  leftSum = dfs(node(2), 1):\n' +
      '    numberSoFar = 1*10 + 2 = 12\n' +
      '    isLeaf=true -> return 12\n' +
      '  rightSum = dfs(node(3), 1):\n' +
      '    numberSoFar = 1*10 + 3 = 13\n' +
      '    isLeaf=true -> return 13\n' +
      '  return 12 + 13 = 25\n\n' +
      'Output: 25',
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

    // Step 1: Precompute palindrome table
    // isPal[i][j] = true if s[i..j] is a palindrome
    const isPal = Array.from({length: n}, () => Array(n).fill(false));

    for (let i = n - 1; i >= 0; i = i - 1) {
        for (let j = i; j < n; j = j + 1) {
            const charsMatch = s[i] === s[j];
            const shortEnough = j - i <= 2;
            const innerIsPal = isPal[i + 1][j - 1];

            if (charsMatch && (shortEnough || innerIsPal)) {
                isPal[i][j] = true;
            }
        }
    }

    // Step 2: DP for minimum cuts
    // dp[i] = minimum cuts for s[0..i], initialized to worst case (all single chars)
    const dp = Array.from({length: n}, (_, i) => i);

    for (let i = 1; i < n; i = i + 1) {
        // If the whole prefix s[0..i] is a palindrome, no cuts needed
        if (isPal[0][i]) {
            dp[i] = 0;
            continue;
        }

        // Try all palindrome substrings ending at i
        for (let j = 1; j <= i; j = j + 1) {
            if (isPal[j][i]) {
                const cutsNeeded = dp[j - 1] + 1;
                dp[i] = Math.min(dp[i], cutsNeeded);
            }
        }
    }

    return dp[n - 1];
};`,
    jsWalkthrough:
      'Input: s = "aab"\n\n' +
      'n=3\n\n' +
      'Step 1: Build isPal table\n' +
      '  isPal[2][2]: "b"=="b" and length 1 -> true\n' +
      '  isPal[1][2]: "a"!="b" -> false\n' +
      '  isPal[1][1]: "a"=="a" -> true\n' +
      '  isPal[0][2]: "a"!="b" -> false\n' +
      '  isPal[0][1]: "a"=="a" and length 2 -> true\n' +
      '  isPal[0][0]: "a"=="a" -> true\n\n' +
      'Step 2: DP\n' +
      '  dp = [0, 1, 2] (initialized to indices)\n\n' +
      '  i=1:\n' +
      '    isPal[0][1] = true -> dp[1] = 0\n\n' +
      '  i=2:\n' +
      '    isPal[0][2] = false, no free cut\n' +
      '    j=1: isPal[1][2]? false\n' +
      '    j=2: isPal[2][2]? true -> cutsNeeded = dp[1]+1 = 0+1 = 1\n' +
      '    dp[2] = min(2, 1) = 1\n\n' +
      'Output: dp[2] = 1 (cut "aab" into ["aa","b"])',
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

    // Everyone starts with at least 1 candy
    const candies = Array(n).fill(1);

    // Left pass: give more candy than left neighbor if rating is higher
    for (let i = 1; i < n; i = i + 1) {
        if (ratings[i] > ratings[i - 1]) {
            candies[i] = candies[i - 1] + 1;
        }
    }

    // Right pass: give more candy than right neighbor if rating is higher
    // Use max so we satisfy both left and right constraints
    for (let i = n - 2; i >= 0; i = i - 1) {
        if (ratings[i] > ratings[i + 1]) {
            candies[i] = Math.max(candies[i], candies[i + 1] + 1);
        }
    }

    // Sum all candies for the minimum total
    return candies.reduce((total, count) => total + count, 0);
};`,
    jsWalkthrough:
      'Input: ratings = [1,0,2]\n\n' +
      'Initialize: candies = [1, 1, 1]\n\n' +
      'Left pass:\n' +
      '  i=1: ratings[1]=0 > ratings[0]=1? No -> candies[1]=1\n' +
      '  i=2: ratings[2]=2 > ratings[1]=0? Yes -> candies[2]=candies[1]+1=2\n' +
      '  candies = [1, 1, 2]\n\n' +
      'Right pass:\n' +
      '  i=1: ratings[1]=0 > ratings[2]=2? No -> candies[1]=1\n' +
      '  i=0: ratings[0]=1 > ratings[1]=0? Yes\n' +
      '    candies[0] = max(candies[0], candies[1]+1) = max(1, 2) = 2\n' +
      '  candies = [2, 1, 2]\n\n' +
      'Sum: 2+1+2 = 5\n\n' +
      'Output: 5',
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
    // ones: bits that have appeared 1 time (mod 3)
    // twos: bits that have appeared 2 times (mod 3)
    let ones = 0;
    let twos = 0;

    for (const num of nums) {
        // Add num's bits to 'ones', but clear any bits already in 'twos'
        ones = (ones ^ num) & ~twos;

        // Add num's bits to 'twos', but clear any bits now in 'ones'
        twos = (twos ^ num) & ~ones;

        // When a bit appears 3 times, it gets cleared from both ones and twos
    }

    // 'ones' contains bits that appeared exactly once (mod 3)
    return ones;
};`,
    jsWalkthrough:
      'Input: nums = [2,2,3,2]\n\n' +
      '2 in binary = 010, 3 in binary = 011\n\n' +
      'Initial: ones=0, twos=0\n\n' +
      'num=2 (010):\n' +
      '  ones = (0 ^ 2) & ~0 = 2 & 0b...11111111 = 2 (010)\n' +
      '  twos = (0 ^ 2) & ~2 = 2 & 0b...11111101 = 0\n' +
      '  ones=010, twos=000\n\n' +
      'num=2 (010):\n' +
      '  ones = (2 ^ 2) & ~0 = 0 & all1s = 0\n' +
      '  twos = (0 ^ 2) & ~0 = 2 & all1s = 2 (010)\n' +
      '  ones=000, twos=010\n\n' +
      'num=3 (011):\n' +
      '  ones = (0 ^ 3) & ~2 = 3 & 101 = 001 (bit 0 of 3, not in twos)\n' +
      '  twos = (2 ^ 3) & ~1 = 1 & 110 = 000... wait let me redo:\n' +
      '  ones = (0 ^ 3) & ~2 = 011 & 101 = 001\n' +
      '  twos = (2 ^ 3) & ~1 = (010^011)&~001 = 001 & 110 = 000\n' +
      '  ones=001, twos=000\n\n' +
      'num=2 (010):\n' +
      '  ones = (1 ^ 2) & ~0 = 011 = 3... wait:\n' +
      '  ones = (001 ^ 010) & ~000 = 011 & 111...1 = 011 = 3\n' +
      '  twos = (000 ^ 010) & ~011 = 010 & 100 = 000\n' +
      '  ones=011=3\n\n' +
      'Output: ones = 3',
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

    // memo[start] = list of sentences that can be formed from s[start..]
    const memo = new Map();

    function dp(startIndex) {
        // Reached the end of the string — one valid "empty" completion
        if (startIndex === s.length) {
            return [''];
        }

        // Return cached result if available
        if (memo.has(startIndex)) {
            return memo.get(startIndex);
        }

        const sentences = [];

        // Try every possible end position for the next word
        for (let endIndex = startIndex + 1; endIndex <= s.length; endIndex = endIndex + 1) {
            const word = s.substring(startIndex, endIndex);

            if (wordSet.has(word)) {
                // For each valid sentence from the rest, prepend this word
                const restSentences = dp(endIndex);

                for (const rest of restSentences) {
                    if (rest) {
                        sentences.push(word + ' ' + rest);
                    } else {
                        sentences.push(word);
                    }
                }
            }
        }

        memo.set(startIndex, sentences);
        return sentences;
    }

    return dp(0);
};`,
    jsWalkthrough:
      'Input: s = "catsanddog", wordDict = ["cat","cats","and","sand","dog"]\n\n' +
      'wordSet = {"cat","cats","and","sand","dog"}\n\n' +
      'dp(0): try words starting at 0\n' +
      '  endIndex=3: word="cat" in wordSet\n' +
      '    dp(3): try words starting at 3\n' +
      '      endIndex=6: word="san" not in wordSet\n' +
      '      endIndex=7: word="sand" in wordSet\n' +
      '        dp(7): word="dog" in wordSet\n' +
      '          dp(10): return [""]\n' +
      '          sentences = ["dog"]\n' +
      '        memo[7] = ["dog"]\n' +
      '        sentences at 3 = ["sand dog"]\n' +
      '      endIndex=6 again: word="and" in wordSet\n' +
      '        dp(6) = ["dog"]\n' +
      '        sentences at 3 += ["and dog"]\n' +
      '      memo[3] = ["sand dog", "and dog"]\n' +
      '    For rest "sand dog": push "cat sand dog"\n' +
      '    For rest "and dog": push "cat and dog"\n' +
      '  endIndex=4: word="cats" in wordSet\n' +
      '    dp(4): endIndex=7: word="and" -> dp(7)=["dog"] -> "and dog"\n' +
      '    memo[4] = ["and dog"]\n' +
      '    push "cats and dog"\n\n' +
      'Output: ["cat sand dog","cat and dog","cats and dog"]',
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
    if (!root) {
        return [];
    }

    const stack = [root];
    const result = [];

    while (stack.length) {
        const node = stack.pop();
        result.push(node.val);

        // Push right first so left gets processed first (LIFO order)
        if (node.right) {
            stack.push(node.right);
        }

        if (node.left) {
            stack.push(node.left);
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Input: root = [1,null,2,3]\n\n' +
      'Tree:\n' +
      '1\n' +
      ' \\\n' +
      '  2\n' +
      ' /\n' +
      '3\n\n' +
      'stack = [node(1)], result = []\n\n' +
      'Step 1: pop node(1)\n' +
      '  result = [1]\n' +
      '  right=node(2) -> push node(2)\n' +
      '  left=null -> skip\n' +
      '  stack = [node(2)]\n\n' +
      'Step 2: pop node(2)\n' +
      '  result = [1, 2]\n' +
      '  right=null -> skip\n' +
      '  left=node(3) -> push node(3)\n' +
      '  stack = [node(3)]\n\n' +
      'Step 3: pop node(3)\n' +
      '  result = [1, 2, 3]\n' +
      '  no children\n' +
      '  stack = []\n\n' +
      'Output: [1, 2, 3]',
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
    if (!root) {
        return [];
    }

    const stack = [root];
    const result = [];

    // Modified preorder: root, right, left
    // Push left first so right gets processed first (LIFO)
    while (stack.length) {
        const node = stack.pop();
        result.push(node.val);

        if (node.left) {
            stack.push(node.left);
        }

        if (node.right) {
            stack.push(node.right);
        }
    }

    // Reverse gives: left, right, root = postorder
    return result.reverse();
};`,
    jsWalkthrough:
      'Input: root = [1,null,2,3]\n\n' +
      'Tree:\n' +
      '1\n' +
      ' \\\n' +
      '  2\n' +
      ' /\n' +
      '3\n\n' +
      'Running modified preorder (root, right, left):\n\n' +
      'stack = [node(1)], result = []\n\n' +
      'Step 1: pop node(1)\n' +
      '  result = [1]\n' +
      '  left=null -> skip\n' +
      '  right=node(2) -> push\n' +
      '  stack = [node(2)]\n\n' +
      'Step 2: pop node(2)\n' +
      '  result = [1, 2]\n' +
      '  left=node(3) -> push\n' +
      '  right=null -> skip\n' +
      '  stack = [node(3)]\n\n' +
      'Step 3: pop node(3)\n' +
      '  result = [1, 2, 3]\n' +
      '  no children, stack = []\n\n' +
      'result = [1, 2, 3]\n' +
      'result.reverse() = [3, 2, 1]\n\n' +
      'Output: [3, 2, 1]',
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
    // Dummy node as the head of the sorted portion
    const dummy = new ListNode(0);
    let curr = head;

    while (curr) {
        // Save next node before we rewire curr's pointer
        const nextNode = curr.next;

        // Find insertion position in sorted list
        let prev = dummy;
        while (prev.next && prev.next.val < curr.val) {
            prev = prev.next;
        }

        // Insert curr between prev and prev.next
        curr.next = prev.next;
        prev.next = curr;

        // Move to the next node in the original list
        curr = nextNode;
    }

    return dummy.next;
};`,
    jsWalkthrough:
      'Input: head = [4,2,1,3]\n\n' +
      'dummy -> null\n\n' +
      'curr=node(4):\n' +
      '  nextNode = node(2)\n' +
      '  Walk sorted list: dummy.next=null, stop immediately\n' +
      '  Insert after dummy: dummy -> 4 -> null\n' +
      '  curr = node(2)\n\n' +
      'curr=node(2):\n' +
      '  nextNode = node(1)\n' +
      '  Walk sorted: prev=dummy, prev.next=node(4), 4 < 2? No -> stop at dummy\n' +
      '  Insert: 2.next = node(4), dummy.next = node(2)\n' +
      '  dummy -> 2 -> 4 -> null\n' +
      '  curr = node(1)\n\n' +
      'curr=node(1):\n' +
      '  nextNode = node(3)\n' +
      '  Walk sorted: prev.next.val=2 < 1? No -> stop at dummy\n' +
      '  Insert: 1.next=node(2), dummy.next=node(1)\n' +
      '  dummy -> 1 -> 2 -> 4 -> null\n' +
      '  curr = node(3)\n\n' +
      'curr=node(3):\n' +
      '  nextNode = null\n' +
      '  Walk: 1<3 -> prev=1, 2<3 -> prev=2, 4<3? No -> stop at node(2)\n' +
      '  Insert: 3.next=node(4), node(2).next=node(3)\n' +
      '  dummy -> 1 -> 2 -> 3 -> 4 -> null\n\n' +
      'Output: [1,2,3,4]',
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

    // With 2 or fewer points, all are on the same line
    if (n <= 2) {
        return n;
    }

    function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
    }

    let maxOnLine = 2;

    for (let i = 0; i < n; i = i + 1) {
        const slopes = new Map();

        for (let j = i + 1; j < n; j = j + 1) {
            let dx = points[j][0] - points[i][0];
            let dy = points[j][1] - points[i][1];

            // Normalize slope by dividing by GCD to avoid floating point issues
            const commonFactor = gcd(Math.abs(dx), Math.abs(dy));
            dx = dx / commonFactor;
            dy = dy / commonFactor;

            // Normalize sign: ensure dx >= 0 for consistent representation
            if (dx < 0) {
                dx = -dx;
                dy = -dy;
            } else if (dx === 0) {
                dy = Math.abs(dy);
            }

            const slopeKey = dx + ',' + dy;
            slopes.set(slopeKey, (slopes.get(slopeKey) || 0) + 1);
        }

        // Max count + 1 (the anchor point i itself)
        for (const count of slopes.values()) {
            maxOnLine = Math.max(maxOnLine, count + 1);
        }
    }

    return maxOnLine;
};`,
    jsWalkthrough:
      'Input: points = [[1,1],[2,2],[3,3]]\n\n' +
      'n=3, maxOnLine=2\n\n' +
      'i=0 (anchor=[1,1]):\n' +
      '  j=1: dx=2-1=1, dy=2-1=1, gcd(1,1)=1 -> dx=1,dy=1\n' +
      '    dx>0 and not 0, key="1,1", slopes={"1,1":1}\n' +
      '  j=2: dx=3-1=2, dy=3-1=2, gcd(2,2)=2 -> dx=1,dy=1\n' +
      '    key="1,1", slopes={"1,1":2}\n' +
      '  max count=2, maxOnLine=max(2,2+1)=3\n\n' +
      'i=1 (anchor=[2,2]):\n' +
      '  j=2: dx=1, dy=1, key="1,1", slopes={"1,1":1}\n' +
      '  max count=1, maxOnLine=max(3,2)=3\n\n' +
      'Output: 3',
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
    // Trim leading/trailing spaces, split by any whitespace runs, reverse, join
    const words = s.trim().split(/\\s+/);
    const reversedWords = words.reverse();
    return reversedWords.join(' ');
};`,
    jsWalkthrough:
      'Input: s = "  the sky is blue  "\n\n' +
      's.trim() = "the sky is blue"\n\n' +
      '.split(/\\s+/) = ["the", "sky", "is", "blue"]\n' +
      '  (regex \\s+ matches one or more whitespace chars)\n\n' +
      '.reverse() = ["blue", "is", "sky", "the"]\n\n' +
      '.join(" ") = "blue is sky the"\n\n' +
      'Output: "blue is sky the"',
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
    let lo = 0;
    let hi = nums.length - 1;

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);

        if (nums[mid] > nums[hi]) {
            // Minimum is in the right half
            lo = mid + 1;
        } else if (nums[mid] < nums[hi]) {
            // Minimum is in the left half (including mid)
            hi = mid;
        } else {
            // nums[mid] === nums[hi]: can't tell which half has minimum
            // Safe to shrink hi by 1 (we know hi is not the unique minimum)
            hi = hi - 1;
        }
    }

    return nums[lo];
};`,
    jsWalkthrough:
      'Input: nums = [2,2,2,0,1]\n\n' +
      'lo=0, hi=4\n\n' +
      'Iteration 1:\n' +
      '  mid = 2, nums[mid]=2, nums[hi]=1\n' +
      '  2 > 1 -> minimum in right half\n' +
      '  lo = mid+1 = 3\n\n' +
      'Iteration 2:\n' +
      '  lo=3, hi=4, mid=3\n' +
      '  nums[mid]=0, nums[hi]=1\n' +
      '  0 < 1 -> minimum in left half (including mid)\n' +
      '  hi = mid = 3\n\n' +
      'lo=3, hi=3 -> loop ends\n' +
      'return nums[3] = 0\n\n' +
      'Output: 0',
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
    // count tracks frequency of each character in the current window
    const count = new Map();
    let left = 0;
    let maxLength = 0;

    for (let right = 0; right < s.length; right = right + 1) {
        const rightChar = s[right];

        // Add right character to window
        count.set(rightChar, (count.get(rightChar) || 0) + 1);

        // Shrink window from the left until we have at most 2 distinct chars
        while (count.size > 2) {
            const leftChar = s[left];
            const newCount = count.get(leftChar) - 1;

            if (newCount === 0) {
                count.delete(leftChar);
            } else {
                count.set(leftChar, newCount);
            }

            left = left + 1;
        }

        // Update max window size
        const windowSize = right - left + 1;
        maxLength = Math.max(maxLength, windowSize);
    }

    return maxLength;
};`,
    jsWalkthrough:
      'Input: s = "eceba"\n\n' +
      'left=0, maxLength=0\n\n' +
      'right=0 (e): count={e:1}, size=1 <= 2, window="e", maxLength=1\n' +
      'right=1 (c): count={e:1,c:1}, size=2 <= 2, window="ec", maxLength=2\n' +
      'right=2 (e): count={e:2,c:1}, size=2 <= 2, window="ece", maxLength=3\n' +
      'right=3 (b): count={e:2,c:1,b:1}, size=3 > 2!\n' +
      '  Shrink: left=0 (e), count[e]=2->1, left=1\n' +
      '  count={e:1,c:1,b:1}, size=3 > 2!\n' +
      '  Shrink: left=1 (c), count[c]=1->0, delete c, left=2\n' +
      '  count={e:1,b:1}, size=2 <= 2\n' +
      '  window="eb", size=right-left+1=3-2+1=2, maxLength=max(3,2)=3\n' +
      'right=4 (a): count={e:1,b:1,a:1}, size=3 > 2!\n' +
      '  Shrink: left=2 (e), count[e]=0, delete e, left=3\n' +
      '  count={b:1,a:1}, size=2 <= 2\n' +
      '  window="ba", size=2, maxLength=max(3,2)=3\n\n' +
      'Output: 3 (substring "ece")',
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
    const sLen = s.length;
    const tLen = t.length;

    // If length difference is more than 1, cannot be one edit
    if (Math.abs(sLen - tLen) > 1) {
        return false;
    }

    // Ensure s is the shorter (or equal) string for simpler logic
    if (sLen > tLen) {
        return isOneEditDistance(t, s);
    }

    // Find first position where characters differ
    for (let i = 0; i < sLen; i = i + 1) {
        if (s[i] !== t[i]) {
            if (sLen === tLen) {
                // Same length: one replace — rest must match exactly
                return s.substring(i + 1) === t.substring(i + 1);
            } else {
                // Different length: skip one char in t (insert/delete) — rest must match
                return s.substring(i) === t.substring(i + 1);
            }
        }
    }

    // No mismatch found: strings are identical except t has one extra char at end
    return sLen + 1 === tLen;
};`,
    jsWalkthrough:
      'Input: s = "ab", t = "acb"\n\n' +
      'sLen=2, tLen=3, |2-3|=1 <= 1, continue\n' +
      'sLen < tLen, no swap needed\n\n' +
      'i=0: s[0]="a", t[0]="a" -> match, continue\n' +
      'i=1: s[1]="b", t[1]="c" -> mismatch!\n' +
      '  sLen(2) !== tLen(3): different length case (insert/delete)\n' +
      '  Check: s.substring(1) = "b"\n' +
      '         t.substring(2) = "b"\n' +
      '  "b" === "b" -> true\n\n' +
      'Output: true (insert "c" at position 1 turns "ab" into "acb")',
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
    const result = [];

    // Sentinel: one below lower, so gaps start from lower itself
    let prev = lower - 1;

    // Append upper+1 as sentinel so we handle the gap after the last number
    const numsWithSentinel = [...nums, upper + 1];

    for (const num of numsWithSentinel) {
        // If gap between prev and num is 2 or more, there are missing numbers
        if (num - prev >= 2) {
            const rangeStart = prev + 1;
            const rangeEnd = num - 1;
            result.push([rangeStart, rangeEnd]);
        }

        prev = num;
    }

    return result;
};`,
    jsWalkthrough:
      'Input: nums = [0,1,3,50,75], lower = 0, upper = 99\n\n' +
      'numsWithSentinel = [0,1,3,50,75,100]\n' +
      'prev = lower - 1 = -1\n\n' +
      'num=0: 0-(-1)=1 < 2 -> no gap; prev=0\n' +
      'num=1: 1-0=1 < 2 -> no gap; prev=1\n' +
      'num=3: 3-1=2 >= 2 -> gap! push [1+1, 3-1]=[2,2]; prev=3\n' +
      'num=50: 50-3=47 >= 2 -> gap! push [4, 49]; prev=50\n' +
      'num=75: 75-50=25 >= 2 -> gap! push [51, 74]; prev=75\n' +
      'num=100 (sentinel): 100-75=25 >= 2 -> gap! push [76, 99]; prev=100\n\n' +
      'Output: [[2,2],[4,49],[51,74],[76,99]]',
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
    if (nums.length < 2) {
        return 0;
    }

    const minVal = Math.min(...nums);
    const maxVal = Math.max(...nums);

    // All elements are the same — gap is 0
    if (minVal === maxVal) {
        return 0;
    }

    const n = nums.length;

    // Bucket size guarantees max gap spans buckets, not within a bucket
    const bucketSize = Math.max(1, Math.floor((maxVal - minVal) / (n - 1)));
    const bucketCount = Math.floor((maxVal - minVal) / bucketSize) + 1;

    // Each bucket tracks [min, max] of values it contains
    const buckets = Array.from({length: bucketCount}, () => [Infinity, -Infinity]);

    // Place each number into its bucket
    for (const num of nums) {
        const bucketIndex = Math.floor((num - minVal) / bucketSize);
        const bucketMin = buckets[bucketIndex][0];
        const bucketMax = buckets[bucketIndex][1];
        buckets[bucketIndex][0] = Math.min(bucketMin, num);
        buckets[bucketIndex][1] = Math.max(bucketMax, num);
    }

    // Find max gap between consecutive non-empty buckets
    let maxGap = 0;
    let prevBucketMax = minVal;

    for (const [bucketMin, bucketMax] of buckets) {
        // Skip empty buckets
        if (bucketMin === Infinity) {
            continue;
        }

        const gapFromPrev = bucketMin - prevBucketMax;
        maxGap = Math.max(maxGap, gapFromPrev);
        prevBucketMax = bucketMax;
    }

    return maxGap;
};`,
    jsWalkthrough:
      'Input: nums = [3,6,9,1]\n\n' +
      'minVal=1, maxVal=9, n=4\n' +
      'bucketSize = max(1, floor((9-1)/(4-1))) = max(1, floor(8/3)) = max(1,2) = 2\n' +
      'bucketCount = floor((9-1)/2) + 1 = 4 + 1 = 5\n\n' +
      'buckets = [[Inf,-Inf], [Inf,-Inf], [Inf,-Inf], [Inf,-Inf], [Inf,-Inf]]\n\n' +
      'num=3: idx = floor((3-1)/2) = 1 -> bucket[1] = [3,3]\n' +
      'num=6: idx = floor((6-1)/2) = 2 -> bucket[2] = [6,6]\n' +
      'num=9: idx = floor((9-1)/2) = 4 -> bucket[4] = [9,9]\n' +
      'num=1: idx = floor((1-1)/2) = 0 -> bucket[0] = [1,1]\n\n' +
      'buckets = [[1,1],[3,3],[6,6],[Inf,-Inf],[9,9]]\n\n' +
      'Scan for max gap, prevBucketMax=1:\n' +
      '  bucket[0]=[1,1]: gap=1-1=0, prevMax=1\n' +
      '  bucket[1]=[3,3]: gap=3-1=2, maxGap=2, prevMax=3\n' +
      '  bucket[2]=[6,6]: gap=6-3=3, maxGap=3, prevMax=6\n' +
      '  bucket[3]=empty: skip\n' +
      '  bucket[4]=[9,9]: gap=9-6=3, maxGap=max(3,3)=3\n\n' +
      'Output: 3',
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
    // Split each version string into integer revision arrays
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    // Compare up to the length of the longer version
    const totalRevisions = Math.max(v1Parts.length, v2Parts.length);

    for (let i = 0; i < totalRevisions; i = i + 1) {
        // Missing revisions are treated as 0
        const rev1 = i < v1Parts.length ? v1Parts[i] : 0;
        const rev2 = i < v2Parts.length ? v2Parts[i] : 0;

        if (rev1 < rev2) {
            return -1;
        }

        if (rev1 > rev2) {
            return 1;
        }

        // Equal at this revision, continue to next
    }

    return 0;
};`,
    jsWalkthrough:
      'Input: version1 = "1.01", version2 = "1.001"\n\n' +
      'v1Parts = [1, 1] (01 -> 1 as integer)\n' +
      'v2Parts = [1, 1] (001 -> 1 as integer)\n' +
      'totalRevisions = max(2, 2) = 2\n\n' +
      'i=0: rev1=1, rev2=1 -> equal, continue\n' +
      'i=1: rev1=1, rev2=1 -> equal, continue\n' +
      'Loop ends\n\n' +
      'return 0\n\n' +
      'Output: 0 (versions are equal)',
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
    if (numerator === 0) {
        return "0";
    }

    const resultParts = [];

    // Handle sign separately (XOR: different signs = negative)
    const isNegative = (numerator < 0) ^ (denominator < 0);
    if (isNegative) {
        resultParts.push('-');
    }

    // Work with absolute values
    let num = Math.abs(numerator);
    let den = Math.abs(denominator);

    // Integer part
    resultParts.push(String(Math.floor(num / den)));
    let remainder = num % den;

    // No fractional part
    if (remainder === 0) {
        return resultParts.join('');
    }

    resultParts.push('.');

    // Track where each remainder first appeared (for cycle detection)
    const remainderPositions = new Map();

    while (remainder !== 0) {
        // If we've seen this remainder before, we've found a repeating cycle
        if (remainderPositions.has(remainder)) {
            const cycleStart = remainderPositions.get(remainder);
            resultParts.splice(cycleStart, 0, '(');
            resultParts.push(')');
            break;
        }

        // Record position of this remainder
        remainderPositions.set(remainder, resultParts.length);

        // Long division: multiply remainder by 10, get next digit
        remainder = remainder * 10;
        resultParts.push(String(Math.floor(remainder / den)));
        remainder = remainder % den;
    }

    return resultParts.join('');
};`,
    jsWalkthrough:
      'Input: numerator = 1, denominator = 3\n\n' +
      'numerator !== 0, isNegative = false\n' +
      'num=1, den=3\n' +
      'Integer part: floor(1/3)=0 -> resultParts=["0"]\n' +
      'remainder = 1 % 3 = 1 (not 0, so we have fractional part)\n' +
      'resultParts = ["0", "."]\n\n' +
      'Loop iteration 1:\n' +
      '  remainder=1, not in map -> map[1]=2 (position of next digit)\n' +
      '  remainder = 1*10 = 10\n' +
      '  digit = floor(10/3) = 3 -> resultParts = ["0",".","3"]\n' +
      '  remainder = 10 % 3 = 1\n\n' +
      'Loop iteration 2:\n' +
      '  remainder=1, IS in map! cycleStart=2\n' +
      '  splice "(" at position 2: ["0",".","(","3"]\n' +
      '  push ")": ["0",".","(","3",")"]\n' +
      '  break\n\n' +
      'join -> "0.(3)"\n\n' +
      'Output: "0.(3)"',
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
    const result = [];

    while (columnNumber > 0) {
        // Subtract 1 to convert 1-indexed to 0-indexed (A=0, B=1, ..., Z=25)
        columnNumber = columnNumber - 1;

        // Get the current digit (0-25) and convert to letter
        const digitIndex = columnNumber % 26;
        const letter = String.fromCharCode(digitIndex + 65); // 65 = 'A'
        result.push(letter);

        // Move to the next digit position
        columnNumber = Math.floor(columnNumber / 26);
    }

    // Built in reverse order, so reverse to get correct title
    return result.reverse().join('');
};`,
    jsWalkthrough:
      'Input: columnNumber = 28 (should be "AB")\n\n' +
      'result = []\n\n' +
      'Iteration 1: columnNumber=28\n' +
      '  columnNumber = 28-1 = 27\n' +
      '  digitIndex = 27 % 26 = 1\n' +
      '  letter = String.fromCharCode(1+65) = "B"\n' +
      '  result = ["B"]\n' +
      '  columnNumber = floor(27/26) = 1\n\n' +
      'Iteration 2: columnNumber=1\n' +
      '  columnNumber = 1-1 = 0\n' +
      '  digitIndex = 0 % 26 = 0\n' +
      '  letter = String.fromCharCode(0+65) = "A"\n' +
      '  result = ["B", "A"]\n' +
      '  columnNumber = floor(0/26) = 0 -> loop ends\n\n' +
      'result.reverse() = ["A","B"]\n' +
      'join -> "AB"\n\n' +
      'Output: "AB"',
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

    for (const char of columnTitle) {
        // A=1, B=2, ..., Z=26 (charCode of 'A' is 65, so subtract 64)
        const charValue = char.charCodeAt(0) - 64;

        // Shift left in base 26 and add current char value
        result = result * 26 + charValue;
    }

    return result;
};`,
    jsWalkthrough:
      'Input: columnTitle = "AB"\n\n' +
      'result = 0\n\n' +
      'char="A": charValue = 65 - 64 = 1\n' +
      '  result = 0 * 26 + 1 = 1\n\n' +
      'char="B": charValue = 66 - 64 = 2\n' +
      '  result = 1 * 26 + 2 = 28\n\n' +
      'Output: 28',
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

    // Each division by 5 counts multiples of 5, then 25, then 125, etc.
    while (n >= 5) {
        n = Math.floor(n / 5);
        count = count + n;
    }

    return count;
};`,
    jsWalkthrough:
      'Input: n = 25\n\n' +
      '25! = 1 * 2 * 3 * ... * 25\n\n' +
      'Counting factors of 5:\n' +
      'Iteration 1: n = floor(25/5) = 5, count = 0+5 = 5\n' +
      '  (multiples of 5 up to 25: 5,10,15,20,25 -> five 5-factors)\n' +
      'Iteration 2: n = floor(5/5) = 1, count = 5+1 = 6\n' +
      '  (25 = 5*5 contributes an extra factor of 5)\n' +
      'n=1 < 5, loop ends\n\n' +
      'Output: 6 (25! ends in 6 zeros)',
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

    // Initialize by pushing all left children from root
    this._pushAllLeft(root);
};

BSTIterator.prototype._pushAllLeft = function(node) {
    // Push nodes until we reach the leftmost (smallest) node
    while (node) {
        this.stack.push(node);
        node = node.left;
    }
};

BSTIterator.prototype.next = function() {
    // Pop the current smallest node
    const node = this.stack.pop();

    // If this node has a right child, its left subtree contains the next smallest values
    this._pushAllLeft(node.right);

    return node.val;
};

BSTIterator.prototype.hasNext = function() {
    return this.stack.length > 0;
};`,
    jsWalkthrough:
      'Input: BST root = [7,3,15,null,null,9,20]\n\n' +
      'Tree:\n' +
      '    7\n' +
      '   / \\\n' +
      '  3   15\n' +
      '     /  \\\n' +
      '    9   20\n\n' +
      'Initialize: _pushAllLeft(root=7)\n' +
      '  push 7, go left to 3\n' +
      '  push 3, no left child\n' +
      '  stack = [7, 3] (top=3)\n\n' +
      'next():\n' +
      '  pop node(3)\n' +
      '  _pushAllLeft(3.right=null) -> nothing pushed\n' +
      '  stack = [7], return 3\n\n' +
      'next():\n' +
      '  pop node(7)\n' +
      '  _pushAllLeft(7.right=15)\n' +
      '    push 15, go left to 9\n' +
      '    push 9, no left\n' +
      '  stack = [15, 9], return 7\n\n' +
      'next():\n' +
      '  pop node(9), pushAllLeft(9.right=null)\n' +
      '  stack = [15], return 9\n\n' +
      'hasNext(): stack=[15] -> true\n' +
      'next(): pop 15, pushAllLeft(15.right=20), stack=[20], return 15\n' +
      'next(): pop 20, pushAllLeft(null), stack=[], return 20',
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
    const rows = dungeon.length;
    const cols = dungeon[0].length;

    // dp[i][j] = minimum health needed when entering cell (i, j)
    // Extra row and column serve as sentinels (infinity except at border)
    const dp = Array.from({length: rows + 1}, () => Array(cols + 1).fill(Infinity));

    // From the princess's cell and beyond, need at least 1 health
    dp[rows][cols - 1] = 1;
    dp[rows - 1][cols] = 1;

    // Fill bottom-up from princess to knight's start
    for (let i = rows - 1; i >= 0; i = i - 1) {
        for (let j = cols - 1; j >= 0; j = j - 1) {
            // Take the better (minimum) of going right or going down
            const healthNeededAfter = Math.min(dp[i + 1][j], dp[i][j + 1]);

            // Subtract current cell's effect; if negative, knight needs at least 1
            const healthNeededBefore = healthNeededAfter - dungeon[i][j];
            dp[i][j] = Math.max(healthNeededBefore, 1);
        }
    }

    return dp[0][0];
};`,
    jsWalkthrough:
      'Input: dungeon = [[-2,-3,3],[-5,-10,1],[10,30,-5]]\n\n' +
      'rows=3, cols=3\n' +
      'Initialize: dp[3][2]=1, dp[2][3]=1, all others=Infinity\n\n' +
      'Fill bottom-up:\n' +
      'i=2, j=2 (cell=dungeon[2][2]=-5):\n' +
      '  healthAfter = min(dp[3][2], dp[2][3]) = min(1, 1) = 1\n' +
      '  healthBefore = 1 - (-5) = 6\n' +
      '  dp[2][2] = max(6, 1) = 6\n\n' +
      'i=2, j=1 (cell=30):\n' +
      '  healthAfter = min(dp[3][1], dp[2][2]) = min(Inf, 6) = 6\n' +
      '  healthBefore = 6 - 30 = -24\n' +
      '  dp[2][1] = max(-24, 1) = 1\n\n' +
      'i=2, j=0 (cell=10):\n' +
      '  healthAfter = min(dp[3][0], dp[2][1]) = min(Inf, 1) = 1\n' +
      '  healthBefore = 1 - 10 = -9\n' +
      '  dp[2][0] = max(-9, 1) = 1\n\n' +
      'i=1, j=2 (cell=1):\n' +
      '  healthAfter = min(dp[2][2], dp[1][3]) = min(6, Inf) = 6\n' +
      '  dp[1][2] = max(6-1, 1) = 5\n\n' +
      'i=1, j=1 (cell=-10):\n' +
      '  healthAfter = min(dp[2][1], dp[1][2]) = min(1, 5) = 1\n' +
      '  dp[1][1] = max(1-(-10), 1) = 11\n\n' +
      'i=1, j=0 (cell=-5):\n' +
      '  healthAfter = min(dp[2][0], dp[1][1]) = min(1, 11) = 1\n' +
      '  dp[1][0] = max(1-(-5), 1) = 6\n\n' +
      'i=0, j=2 (cell=3):\n' +
      '  healthAfter = min(dp[1][2], dp[0][3]) = min(5, Inf) = 5\n' +
      '  dp[0][2] = max(5-3, 1) = 2\n\n' +
      'i=0, j=1 (cell=-3):\n' +
      '  healthAfter = min(dp[1][1], dp[0][2]) = min(11, 2) = 2\n' +
      '  dp[0][1] = max(2-(-3), 1) = 5\n\n' +
      'i=0, j=0 (cell=-2):\n' +
      '  healthAfter = min(dp[1][0], dp[0][1]) = min(6, 5) = 5\n' +
      '  dp[0][0] = max(5-(-2), 1) = 7\n\n' +
      'Output: dp[0][0] = 7',
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
    // Convert all numbers to strings for concatenation comparison
    const strs = nums.map(String);

    // Sort using custom comparator: which ordering produces the larger number?
    strs.sort((a, b) => {
        const orderAB = b + a; // b before a
        const orderBA = a + b; // a before b
        return orderAB.localeCompare(orderBA);
    });

    // Concatenate sorted strings
    const result = strs.join('');

    // Edge case: if result is all zeros (e.g., [0,0]), return "0"
    if (result[0] === '0') {
        return '0';
    }

    return result;
};`,
    jsWalkthrough:
      'Input: nums = [10, 2]\n\n' +
      'strs = ["10", "2"]\n\n' +
      'Sort comparison: a="10", b="2"\n' +
      '  orderAB = "2" + "10" = "210"\n' +
      '  orderBA = "10" + "2" = "102"\n' +
      '  "210".localeCompare("102") > 0 -> "2" comes first\n' +
      'strs sorted = ["2", "10"]\n\n' +
      'result = "2" + "10" = "210"\n' +
      'result[0] = "2" !== "0"\n\n' +
      'Output: "210"\n\n' +
      '---\n\n' +
      'Example 2: nums = [3,30,34,5,9]\n' +
      'strs = ["3","30","34","5","9"]\n' +
      'After sort: ["9","5","34","3","30"]\n' +
      '  (9>5>34>3>30 when comparing concatenations)\n' +
      'result = "9534330"\n\n' +
      'Output: "9534330"',
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
    const seen = new Set();
    const repeated = new Set();

    // Slide a window of exactly 10 characters across the string
    for (let i = 0; i <= s.length - 10; i = i + 1) {
        const sequence = s.substring(i, i + 10);

        if (seen.has(sequence)) {
            // Seen before -> it's repeated
            repeated.add(sequence);
        } else {
            // First time seeing it
            seen.add(sequence);
        }
    }

    return [...repeated];
};`,
    jsWalkthrough:
      'Input: s = "AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT"\n\n' +
      'Window slides from i=0 to i=22 (s.length-10=32-10=22)\n\n' +
      'i=0: seq="AAAAACCCCC" -> add to seen\n' +
      'i=1: seq="AAAACCCCCA" -> add to seen\n' +
      '...\n' +
      'i=5: seq="CCCCCAAAAA" -> add to seen\n' +
      '...\n' +
      'i=10: seq="AAAAACCCCC" -> already in seen! add to repeated\n' +
      'i=11: seq="AAAACCCCCC" -> add to seen\n' +
      '...\n' +
      'i=15: seq="CCCCCAAAAA" -> already in seen! add to repeated\n' +
      '...\n\n' +
      'Output: ["AAAAACCCCC","CCCCCAAAAA"]',
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

    if (n <= 1) {
        return 0;
    }

    // When k >= n/2, we can make unlimited transactions (greedy)
    if (k >= Math.floor(n / 2)) {
        let unlimitedProfit = 0;
        for (let i = 1; i < n; i = i + 1) {
            const dailyGain = prices[i] - prices[i - 1];
            if (dailyGain > 0) {
                unlimitedProfit = unlimitedProfit + dailyGain;
            }
        }
        return unlimitedProfit;
    }

    // buy[j] = min effective cost to buy for the j-th transaction
    const buy = Array(k + 1).fill(Infinity);

    // sell[j] = max profit after completing j transactions
    const sell = Array(k + 1).fill(0);

    for (const price of prices) {
        for (let j = 1; j <= k; j = j + 1) {
            // Best buy cost for j-th transaction = price minus profit from prior transactions
            buy[j] = Math.min(buy[j], price - sell[j - 1]);

            // Best sell price for j-th transaction
            sell[j] = Math.max(sell[j], price - buy[j]);
        }
    }

    return sell[k];
};`,
    jsWalkthrough:
      'Input: k=2, prices=[2,4,1]\n\n' +
      'n=3, k=2 < floor(3/2)=1? No, k=2 >= 1, so use unlimited? Wait:\n' +
      'Actually floor(n/2) = floor(3/2) = 1, and k=2 >= 1, so use greedy:\n' +
      '  i=1: prices[1]-prices[0] = 4-2 = 2 > 0, profit += 2\n' +
      '  i=2: prices[2]-prices[1] = 1-4 = -3, skip\n' +
      '  return 2\n\n' +
      'Output: 2\n\n' +
      '---\n\n' +
      'Example with k=1, prices=[2,4,1]:\n' +
      '  k=1 < floor(3/2)=1? No, 1 >= 1, use greedy -> 2\n\n' +
      'Example with k=1, prices=[3,2,6,5,0,3]:\n' +
      '  k=1, n=6, floor(6/2)=3, 1 < 3 -> use DP\n' +
      '  buy=[Inf,Inf], sell=[0,0]\n' +
      '  price=3: buy[1]=min(Inf,3-0)=3, sell[1]=max(0,3-3)=0\n' +
      '  price=2: buy[1]=min(3,2-0)=2, sell[1]=max(0,2-2)=0\n' +
      '  price=6: buy[1]=min(2,6-0)=2, sell[1]=max(0,6-2)=4\n' +
      '  price=5: buy[1]=min(2,5-0)=2, sell[1]=max(4,5-2)=4\n' +
      '  price=0: buy[1]=min(2,0-0)=0, sell[1]=max(4,0-0)=4\n' +
      '  price=3: buy[1]=min(0,3-0)=0, sell[1]=max(4,3-0)=4\n' +
      '  return sell[1] = 4',
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

    // Handle k larger than array length (full rotations cancel out)
    k = k % n;

    function reverse(left, right) {
        while (left < right) {
            const temp = nums[left];
            nums[left] = nums[right];
            nums[right] = temp;
            left = left + 1;
            right = right - 1;
        }
    }

    // Step 1: Reverse the entire array
    reverse(0, n - 1);

    // Step 2: Reverse the first k elements
    reverse(0, k - 1);

    // Step 3: Reverse the remaining elements
    reverse(k, n - 1);
};`,
    jsWalkthrough:
      'Input: nums = [1,2,3,4,5,6,7], k = 3\n\n' +
      'k = 3 % 7 = 3\n\n' +
      'Step 1: reverse(0, 6) - reverse entire array\n' +
      '  [1,2,3,4,5,6,7] -> [7,6,5,4,3,2,1]\n\n' +
      'Step 2: reverse(0, 2) - reverse first k=3 elements\n' +
      '  [7,6,5,4,3,2,1] -> [5,6,7,4,3,2,1]\n\n' +
      'Step 3: reverse(3, 6) - reverse remaining elements\n' +
      '  [5,6,7,4,3,2,1] -> [5,6,7,1,2,3,4]\n\n' +
      'Output: [5,6,7,1,2,3,4]',
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

    // Process all 32 bits
    for (let i = 0; i < 32; i = i + 1) {
        // Extract the last bit of n
        const lastBit = n & 1;

        // Shift result left to make room, then OR in the extracted bit
        result = (result << 1) | lastBit;

        // Unsigned right shift n (>>> handles JavaScript's signed integers)
        n = n >>> 1;
    }

    // >>> 0 converts to unsigned 32-bit integer (handles negative sign bit)
    return result >>> 0;
};`,
    jsWalkthrough:
      'Input: n = 43261596 (binary: 00000010100101000001111010011100)\n\n' +
      'We process 32 bits, moving last bit of n into result each iteration\n\n' +
      'i=0: lastBit = 43261596 & 1 = 0, result = (0<<1)|0 = 0, n>>>=1\n' +
      'i=1: lastBit = n & 1 = 0, result = (0<<1)|0 = 0, n>>>=1\n' +
      'i=2: lastBit = n & 1 = 1, result = (0<<1)|1 = 1, n>>>=1\n' +
      'i=3: lastBit = n & 1 = 1, result = (1<<1)|1 = 3, n>>>=1\n' +
      '... (continuing for all 32 bits)\n\n' +
      'After 32 iterations, result holds the reversed bits\n' +
      'result >>> 0 ensures unsigned integer\n\n' +
      'Output: 964176192 (binary: 00111001011110000010100101000000)',
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

    // Keep shifting both right until they converge to their common prefix
    while (left !== right) {
        left = left >> 1;
        right = right >> 1;
        shift = shift + 1;
    }

    // Shift the common prefix back to its original position
    // (the trailing bits are all 0 in the AND result)
    return left << shift;
};`,
    jsWalkthrough:
      'Input: left = 5 (101), right = 7 (111)\n\n' +
      'shift=0, left=5 (101), right=7 (111)\n\n' +
      'Iteration 1: left != right\n' +
      '  left = 5 >> 1 = 2 (010)\n' +
      '  right = 7 >> 1 = 3 (011)\n' +
      '  shift = 1\n\n' +
      'Iteration 2: left != right\n' +
      '  left = 2 >> 1 = 1 (01)\n' +
      '  right = 3 >> 1 = 1 (01)\n' +
      '  shift = 2\n\n' +
      'left === right = 1, loop ends\n\n' +
      'Return 1 << 2 = 4 (100)\n\n' +
      'Verification: 5 AND 6 AND 7 = 101 & 110 & 111 = 100 = 4\n\n' +
      'Output: 4',
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
    // Dummy node handles the case where head itself needs to be removed
    const dummy = new ListNode(0, head);
    let prev = dummy;

    while (prev.next) {
        if (prev.next.val === val) {
            // Skip the node with target value
            prev.next = prev.next.next;
        } else {
            // Only advance prev when we don't remove a node
            prev = prev.next;
        }
    }

    return dummy.next;
};`,
    jsWalkthrough:
      'Input: head = [1,2,6,3,4,5,6], val = 6\n\n' +
      'dummy -> 1 -> 2 -> 6 -> 3 -> 4 -> 5 -> 6 -> null\n' +
      'prev = dummy\n\n' +
      'prev.next=node(1), val=1 != 6 -> advance prev to node(1)\n' +
      'prev.next=node(2), val=2 != 6 -> advance prev to node(2)\n' +
      'prev.next=node(6), val=6 === 6 -> remove!\n' +
      '  prev.next = node(6).next = node(3)\n' +
      '  list: dummy->1->2->3->4->5->6->null, prev still at node(2)\n' +
      'prev.next=node(3), val=3 != 6 -> advance\n' +
      'prev.next=node(4), val=4 != 6 -> advance\n' +
      'prev.next=node(5), val=5 != 6 -> advance\n' +
      'prev.next=node(6), val=6 === 6 -> remove!\n' +
      '  prev.next = null\n' +
      '  list: dummy->1->2->3->4->5->null\n' +
      'prev.next=null -> loop ends\n\n' +
      'return dummy.next = node(1)\n\n' +
      'Output: [1,2,3,4,5]',
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
    if (n <= 2) {
        return 0;
    }

    // Initialize: assume all numbers are prime
    const isPrime = Array(n).fill(true);
    isPrime[0] = false; // 0 is not prime
    isPrime[1] = false; // 1 is not prime

    // Sieve: for each prime, mark its multiples as not prime
    for (let i = 2; i * i < n; i = i + 1) {
        if (isPrime[i]) {
            // Start from i*i — smaller multiples already marked by smaller primes
            for (let j = i * i; j < n; j = j + i) {
                isPrime[j] = false;
            }
        }
    }

    // Count all remaining primes
    return isPrime.filter(Boolean).length;
};`,
    jsWalkthrough:
      'Input: n = 10\n\n' +
      'isPrime = [F,F,T,T,T,T,T,T,T,T] (F=false, T=true, indices 0-9)\n\n' +
      'i=2: isPrime[2]=true\n' +
      '  j=4: isPrime[4]=false\n' +
      '  j=6: isPrime[6]=false\n' +
      '  j=8: isPrime[8]=false\n' +
      '  isPrime = [F,F,T,T,F,T,F,T,F,T]\n\n' +
      'i=3: isPrime[3]=true, i*i=9 < 10\n' +
      '  j=9: isPrime[9]=false\n' +
      '  isPrime = [F,F,T,T,F,T,F,T,F,F]\n\n' +
      'i=4: 4*4=16 >= 10, loop ends\n\n' +
      'Count trues: indices 2,3,5,7 -> 4 primes\n\n' +
      'Output: 4',
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
    // Two maps ensure the mapping is bidirectional (bijective)
    const sToT = {};
    const tToS = {};

    for (let i = 0; i < s.length; i = i + 1) {
        const sChar = s[i];
        const tChar = t[i];

        if (sChar in sToT) {
            // sChar already mapped — check if it maps to the correct tChar
            if (sToT[sChar] !== tChar) {
                return false;
            }
        } else {
            // sChar is new — check that tChar is not already mapped to a different sChar
            if (tChar in tToS) {
                return false;
            }

            // Establish the bidirectional mapping
            sToT[sChar] = tChar;
            tToS[tChar] = sChar;
        }
    }

    return true;
};`,
    jsWalkthrough:
      'Input: s = "egg", t = "add"\n\n' +
      'sToT = {}, tToS = {}\n\n' +
      'i=0: sChar="e", tChar="a"\n' +
      '  "e" not in sToT, "a" not in tToS\n' +
      '  sToT = {e:"a"}, tToS = {a:"e"}\n\n' +
      'i=1: sChar="g", tChar="d"\n' +
      '  "g" not in sToT, "d" not in tToS\n' +
      '  sToT = {e:"a", g:"d"}, tToS = {a:"e", d:"g"}\n\n' +
      'i=2: sChar="g", tChar="d"\n' +
      '  "g" in sToT -> sToT["g"]="d", tChar="d" -> match!\n' +
      '  continue\n\n' +
      'return true\n\n' +
      'Output: true\n\n' +
      '---\n\n' +
      'Counter-example: s="foo", t="bar"\n' +
      'i=0: f->b\n' +
      'i=1: o->a\n' +
      'i=2: o is in sToT: sToT[o]="a", but tChar="r" -> false!',
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
    // Build Trie from all words
    const trie = {};
    for (const word of words) {
        let node = trie;
        for (const char of word) {
            if (!node[char]) {
                node[char] = {};
            }
            node = node[char];
        }
        // Mark end of word with '#' storing the full word
        node['#'] = word;
    }

    const rows = board.length;
    const cols = board[0].length;
    const result = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    function dfs(row, col, trieNode) {
        const currentChar = board[row][col];

        // No path in trie for this character
        if (!trieNode[currentChar]) {
            return;
        }

        const nextNode = trieNode[currentChar];

        // Found a complete word
        if (nextNode['#']) {
            result.push(nextNode['#']);
            delete nextNode['#']; // Prevent duplicate results
        }

        // Mark cell as visited by replacing with sentinel
        board[row][col] = '.';

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            const inBounds = newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols;
            const notVisited = board[newRow] && board[newRow][newCol] !== '.';

            if (inBounds && notVisited) {
                dfs(newRow, newCol, nextNode);
            }
        }

        // Restore the cell after backtracking
        board[row][col] = currentChar;

        // Prune empty Trie branches for efficiency
        if (Object.keys(nextNode).length === 0) {
            delete trieNode[currentChar];
        }
    }

    // Start DFS from every cell on the board
    for (let i = 0; i < rows; i = i + 1) {
        for (let j = 0; j < cols; j = j + 1) {
            dfs(i, j, trie);
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Input: board=[["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]]\n' +
      'words=["oath","pea","eat","rain"]\n\n' +
      'Trie built from words:\n' +
      '  "eat": e->a->t->{"#":"eat"}\n' +
      '  "oath": o->a->t->h->{"#":"oath"}\n' +
      '  "pea": p->e->a->{"#":"pea"}\n' +
      '  "rain": r->a->i->n->{"#":"rain"}\n\n' +
      'DFS from cell (0,0)="o":\n' +
      '  trie["o"] exists -> go in\n' +
      '  mark (0,0)="."\n' +
      '  Try (0,1)="a": nextNode["a"] exists\n' +
      '    mark (0,1)="."\n' +
      '    Try (1,1)="t": nextNode["t"] exists\n' +
      '      mark (1,1)="."\n' +
      '      Try (1,2)="a"... eventually (2,1)="h"\n' +
      '        nextNode["h"] exists and has "#"="oath"\n' +
      '        result=["oath"], delete "#"\n' +
      '      ... backtrack\n\n' +
      'DFS from cell (1,0)="e":\n' +
      '  trie["e"] exists\n' +
      '  (1,1)="t" -> nextNode["t"] exists ... eventually finds "eat"\n' +
      '  result=["oath","eat"]\n\n' +
      'Output: ["eat","oath"]',
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
    // Reverse of s
    const rev = s.split('').reverse().join('');

    // Combine s, separator, and reverse
    // The '#' separator prevents false matches spanning the two halves
    const combined = s + '#' + rev;
    const totalLen = combined.length;

    // Build KMP failure function (lps = longest proper prefix that is also a suffix)
    const lps = Array(totalLen).fill(0);

    for (let i = 1; i < totalLen; i = i + 1) {
        let j = lps[i - 1];

        // Fall back until we find a match or reach the beginning
        while (j > 0 && combined[i] !== combined[j]) {
            j = lps[j - 1];
        }

        if (combined[i] === combined[j]) {
            j = j + 1;
        }

        lps[i] = j;
    }

    // lps[totalLen-1] = length of the longest palindromic prefix of s
    const longestPalPrefixLen = lps[totalLen - 1];

    // Prepend the reverse of the non-palindromic suffix
    const suffixToAdd = rev.substring(0, s.length - longestPalPrefixLen);
    return suffixToAdd + s;
};`,
    jsWalkthrough:
      'Input: s = "aacecaaa"\n\n' +
      'rev = "aaacecaa"\n' +
      'combined = "aacecaaa#aaacecaa"\n\n' +
      'Build lps array for combined:\n' +
      '  (computing KMP failure function for "aacecaaa#aaacecaa")\n\n' +
      'Key insight: lps[last] tells us the longest palindromic prefix of s\n\n' +
      'After computing: lps[last] = 7\n' +
      '  (meaning "aacecaa" is the longest palindromic prefix)\n\n' +
      'longestPalPrefixLen = 7\n' +
      'suffixToAdd = rev.substring(0, 8-7) = rev.substring(0,1) = "a"\n\n' +
      'return "a" + "aacecaaa" = "aaacecaaa"\n\n' +
      'Output: "aaacecaaa"',
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
    // Create events: building start (negative height) and end (height 0)
    const events = [];
    for (const [left, right, height] of buildings) {
        events.push([left, -height, right]); // start event: store negHeight for sorting
        events.push([right, 0, 0]);           // end event
    }

    // Sort by x-coordinate; at same x, starts (negative heights) come before ends
    events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    // Result starts with sentinel [0,0]; we'll remove it at the end
    const result = [[0, 0]];

    // Sorted array simulating a max-heap: [negHeight, rightEdge]
    // Stores active buildings sorted by height (most negative first = tallest)
    const activeBuildings = [[0, Infinity]]; // Ground level sentinel

    for (const [x, negHeight, rightEdge] of events) {
        // Remove buildings that have ended at or before current x
        while (activeBuildings[0][1] <= x) {
            activeBuildings.splice(0, 1);
        }

        // If this is a start event, add the building
        if (negHeight !== 0) {
            activeBuildings.push([negHeight, rightEdge]);
            activeBuildings.sort((a, b) => a[0] - b[0]); // Keep sorted by height
        }

        // The current max height is the first element (negated)
        const currentMaxHeight = -activeBuildings[0][0];

        // Record a key point if the skyline height changed
        const lastRecordedHeight = result[result.length - 1][1];
        if (lastRecordedHeight !== currentMaxHeight) {
            result.push([x, currentMaxHeight]);
        }
    }

    // Remove the initial sentinel
    return result.slice(1);
};`,
    jsWalkthrough:
      'Input: buildings = [[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]\n\n' +
      'Events created:\n' +
      '  [2,-10,9], [9,0,0], [3,-15,7], [7,0,0], [5,-12,12]\n' +
      '  [12,0,0], [15,-10,20], [20,0,0], [19,-8,24], [24,0,0]\n\n' +
      'After sorting by x (then by negH):\n' +
      '  [2,-10,9], [3,-15,7], [5,-12,12], [7,0,0], [9,0,0]\n' +
      '  [12,0,0], [15,-10,20], [19,-8,24], [20,0,0], [24,0,0]\n\n' +
      'Processing events:\n' +
      'x=2, start h=10: active=[[0,Inf],[-10,9]] -> sort -> [[-10,9],[0,Inf]]\n' +
      '  maxH=10, last=0 -> push [2,10]\n' +
      'x=3, start h=15: active=[[-15,7],[-10,9],[0,Inf]]\n' +
      '  maxH=15, last=10 -> push [3,15]\n' +
      'x=5, start h=12: active=[[-15,7],[-12,12],[-10,9],[0,Inf]]\n' +
      '  maxH=15, last=15 -> no change\n' +
      'x=7, end: remove [(-15,7)] since 7<=7 -> active=[[-12,12],[-10,9],[0,Inf]]\n' +
      '  maxH=12, last=15 -> push [7,12]\n' +
      '...\n\n' +
      'Output: [[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]]',
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
    // Sliding window of at most k elements
    const window = new Set();

    for (let i = 0; i < nums.length; i = i + 1) {
        const currentNum = nums[i];

        // If current number is already in window, indices are within distance k
        if (window.has(currentNum)) {
            return true;
        }

        // Add current number to window
        window.add(currentNum);

        // Keep window size at most k by removing the element that fell out
        if (window.size > k) {
            const oldestNum = nums[i - k];
            window.delete(oldestNum);
        }
    }

    return false;
};`,
    jsWalkthrough:
      'Input: nums = [1,2,3,1], k = 3\n\n' +
      'window = {}, i iterates through nums\n\n' +
      'i=0, currentNum=1:\n' +
      '  window has 1? No\n' +
      '  window.add(1) -> window={1}\n' +
      '  window.size=1 <= k=3, no removal\n\n' +
      'i=1, currentNum=2:\n' +
      '  window has 2? No\n' +
      '  window={1,2}, size=2 <= 3\n\n' +
      'i=2, currentNum=3:\n' +
      '  window has 3? No\n' +
      '  window={1,2,3}, size=3 <= 3\n\n' +
      'i=3, currentNum=1:\n' +
      '  window has 1? YES! return true\n\n' +
      'Output: true\n' +
      '(nums[0]=1 and nums[3]=1, |0-3|=3 <= k=3)',
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
    if (valueDiff < 0) {
        return false;
    }

    // Bucket width: any two values in the same bucket are within valueDiff
    const bucketWidth = valueDiff + 1;

    // Buckets map: bucketId -> value stored in that bucket
    const buckets = new Map();

    for (let i = 0; i < nums.length; i = i + 1) {
        const currentNum = nums[i];
        const bucketId = Math.floor(currentNum / bucketWidth);

        // Same bucket: values are guaranteed within valueDiff
        if (buckets.has(bucketId)) {
            return true;
        }

        // Check left adjacent bucket: may also be within valueDiff
        if (buckets.has(bucketId - 1)) {
            const leftNeighbor = buckets.get(bucketId - 1);
            if (Math.abs(currentNum - leftNeighbor) < bucketWidth) {
                return true;
            }
        }

        // Check right adjacent bucket: may also be within valueDiff
        if (buckets.has(bucketId + 1)) {
            const rightNeighbor = buckets.get(bucketId + 1);
            if (Math.abs(currentNum - rightNeighbor) < bucketWidth) {
                return true;
            }
        }

        // Place current number in its bucket
        buckets.set(bucketId, currentNum);

        // Remove the element that exited the index window
        if (i >= indexDiff) {
            const exitingNum = nums[i - indexDiff];
            const exitingBucketId = Math.floor(exitingNum / bucketWidth);
            buckets.delete(exitingBucketId);
        }
    }

    return false;
};`,
    jsWalkthrough:
      'Input: nums = [1,5,9,1,5,9], indexDiff = 2, valueDiff = 3\n\n' +
      'bucketWidth = 3+1 = 4\n' +
      'buckets = {}\n\n' +
      'i=0, num=1, bucketId=floor(1/4)=0\n' +
      '  bucket 0 empty, adjacent empty\n' +
      '  buckets = {0:1}\n\n' +
      'i=1, num=5, bucketId=floor(5/4)=1\n' +
      '  bucket 1 empty\n' +
      '  bucket 0 exists: |5-1|=4, 4 < 4? No (must be strictly less)\n' +
      '  bucket 2 empty\n' +
      '  buckets = {0:1, 1:5}\n\n' +
      'i=2, num=9, bucketId=floor(9/4)=2\n' +
      '  bucket 2 empty\n' +
      '  bucket 1 exists: |9-5|=4, 4 < 4? No\n' +
      '  bucket 3 empty\n' +
      '  buckets = {0:1, 1:5, 2:9}\n' +
      '  i=2 >= indexDiff=2: remove nums[0]=1, bucketId=0\n' +
      '  buckets = {1:5, 2:9}\n\n' +
      'i=3, num=1, bucketId=0\n' +
      '  bucket 0 empty, bucket -1 empty\n' +
      '  bucket 1 exists: |1-5|=4, 4 < 4? No\n' +
      '  buckets = {1:5, 2:9, 0:1}\n' +
      '  remove nums[1]=5, bucketId=1\n' +
      '  buckets = {2:9, 0:1}\n\n' +
      '... continues, no match found\n\n' +
      'Output: false',
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
    if (!root) {
        return 0;
    }

    // Measure leftmost height (going all left)
    let leftHeight = 0;
    let leftNode = root;
    while (leftNode) {
        leftHeight = leftHeight + 1;
        leftNode = leftNode.left;
    }

    // Measure rightmost height (going all right)
    let rightHeight = 0;
    let rightNode = root;
    while (rightNode) {
        rightHeight = rightHeight + 1;
        rightNode = rightNode.right;
    }

    // If heights match, this subtree is a perfect binary tree: 2^h - 1 nodes
    if (leftHeight === rightHeight) {
        return (1 << leftHeight) - 1;
    }

    // Otherwise, one subtree is perfect (shorter path), recurse on both
    return 1 + countNodes(root.left) + countNodes(root.right);
};`,
    jsWalkthrough:
      'Input: root = [1,2,3,4,5,6] (complete binary tree)\n\n' +
      'Tree structure:\n' +
      '      1\n' +
      '     / \\\n' +
      '    2   3\n' +
      '   / \\ /\n' +
      '  4  5 6\n\n' +
      'countNodes(root=1):\n' +
      '  leftHeight: 1->2->4 = 3\n' +
      '  rightHeight: 1->3 = 2 (no right child of 3)\n' +
      '  leftHeight(3) != rightHeight(2) -> recurse\n' +
      '  return 1 + countNodes(2) + countNodes(3)\n\n' +
      'countNodes(node=2):\n' +
      '  leftHeight: 2->4 = 2\n' +
      '  rightHeight: 2->5 = 2\n' +
      '  leftHeight === rightHeight = 2 -> perfect tree\n' +
      '  return (1 << 2) - 1 = 4 - 1 = 3\n\n' +
      'countNodes(node=3):\n' +
      '  leftHeight: 3->6 = 2\n' +
      '  rightHeight: 3 (no right) = 1\n' +
      '  heights differ -> recurse\n' +
      '  return 1 + countNodes(6) + countNodes(null)\n' +
      '  countNodes(6): leftH=1, rightH=1 -> (1<<1)-1=1\n' +
      '  countNodes(null): 0\n' +
      '  return 1 + 1 + 0 = 2\n\n' +
      'Total: 1 + 3 + 2 = 6\n\n' +
      'Output: 6',
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
    let result = 0;
    let currentNum = 0;
    let sign = 1; // +1 or -1

    for (const char of s) {
        if (char >= '0' && char <= '9') {
            // Build multi-digit number
            currentNum = currentNum * 10 + Number(char);

        } else if (char === '+') {
            // Apply current number with its sign
            result = result + sign * currentNum;
            currentNum = 0;
            sign = 1;

        } else if (char === '-') {
            result = result + sign * currentNum;
            currentNum = 0;
            sign = -1;

        } else if (char === '(') {
            // Save current state and start fresh inside parentheses
            stack.push(result);
            stack.push(sign);
            result = 0;
            sign = 1;

        } else if (char === ')') {
            // Finalize the sub-expression result
            result = result + sign * currentNum;
            currentNum = 0;

            // Apply the sign before the parenthesis
            const signBeforeParen = stack.pop();
            result = result * signBeforeParen;

            // Add to the result before the parenthesis
            const resultBeforeParen = stack.pop();
            result = result + resultBeforeParen;
        }
        // Spaces are ignored
    }

    // Handle the last number
    result = result + sign * currentNum;
    return result;
};`,
    jsWalkthrough:
      'Input: s = "(1+(4+5+2)-3)+(6+8)"\n\n' +
      'Processing char by char:\n\n' +
      'char="(": push result=0, push sign=1, reset result=0, sign=1\n' +
      '  stack=[0,1]\n\n' +
      'char="1": currentNum=1\n' +
      'char="+": result=0+1*1=1, currentNum=0, sign=1\n' +
      'char="(": push result=1, push sign=1, reset result=0, sign=1\n' +
      '  stack=[0,1,1,1]\n\n' +
      'char="4": currentNum=4\n' +
      'char="+": result=0+1*4=4, currentNum=0, sign=1\n' +
      'char="5": currentNum=5\n' +
      'char="+": result=4+5=9, currentNum=0, sign=1\n' +
      'char="2": currentNum=2\n' +
      'char=")": result=9+1*2=11, currentNum=0\n' +
      '  signBefore=pop=1, result=11*1=11\n' +
      '  resultBefore=pop=1, result=11+1=12\n' +
      '  stack=[0,1]\n\n' +
      'char="-": result=12+1*0=12, sign=-1\n' +
      'char="3": currentNum=3\n' +
      'char=")": result=12+(-1)*3=9, currentNum=0\n' +
      '  signBefore=pop=1, result=9*1=9\n' +
      '  resultBefore=pop=0, result=9+0=9\n' +
      '  stack=[]\n\n' +
      'char="+": result=9, sign=1\n' +
      'char="(": push 9, push 1, reset\n' +
      '  stack=[9,1]\n\n' +
      'char="6": currentNum=6\n' +
      'char="+": result=6, sign=1\n' +
      'char="8": currentNum=8\n' +
      'char=")": result=6+8=14\n' +
      '  signBefore=1, result=14*1=14\n' +
      '  resultBefore=9, result=14+9=23\n\n' +
      'End: result=23+1*0=23\n\n' +
      'Output: 23',
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
    // We use a single array as a queue
    this.queue = [];
};

MyStack.prototype.push = function(value) {
    // Add the new element to the back of the queue
    this.queue.push(value);

    // Rotate all previous elements to the back so the new element is at front
    const rotations = this.queue.length - 1;
    for (let i = 0; i < rotations; i = i + 1) {
        const front = this.queue.shift();
        this.queue.push(front);
    }
};

MyStack.prototype.pop = function() {
    // The front of queue is the top of stack (due to push rotation)
    return this.queue.shift();
};

MyStack.prototype.top = function() {
    return this.queue[0];
};

MyStack.prototype.empty = function() {
    return this.queue.length === 0;
};`,
    jsWalkthrough:
      'Operations: push(1), push(2), top(), pop(), empty()\n\n' +
      'push(1):\n' +
      '  queue = [1]\n' +
      '  rotations = 1-1 = 0 -> no rotations\n' +
      '  queue = [1]\n\n' +
      'push(2):\n' +
      '  queue = [1, 2] after push\n' +
      '  rotations = 2-1 = 1\n' +
      '  Rotation 1: shift front=1, push to back -> queue=[2,1]\n' +
      '  queue = [2, 1] (newest element 2 is at front)\n\n' +
      'top():\n' +
      '  return queue[0] = 2\n\n' +
      'pop():\n' +
      '  return queue.shift() = 2\n' +
      '  queue = [1]\n\n' +
      'empty():\n' +
      '  queue.length = 1 -> return false\n\n' +
      'Output: [null, null, null, 2, 2, false]',
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
    let currentNum = 0;
    let lastOperator = '+'; // Assume '+' before the first number

    for (let i = 0; i < s.length; i = i + 1) {
        const char = s[i];

        if (char >= '0' && char <= '9') {
            // Build multi-digit number
            currentNum = currentNum * 10 + Number(char);
        }

        // Process when we hit an operator or the last character
        const isOperator = '+-*/'.includes(char);
        const isLastChar = i === s.length - 1;

        if (isOperator || isLastChar) {
            if (lastOperator === '+') {
                stack.push(currentNum);
            } else if (lastOperator === '-') {
                stack.push(-currentNum);
            } else if (lastOperator === '*') {
                stack.push(stack.pop() * currentNum);
            } else if (lastOperator === '/') {
                // Truncate toward zero (Math.trunc)
                stack.push(Math.trunc(stack.pop() / currentNum));
            }

            lastOperator = char;
            currentNum = 0;
        }
        // Spaces are skipped implicitly
    }

    // Sum all values in the stack
    return stack.reduce((total, val) => total + val, 0);
};`,
    jsWalkthrough:
      'Input: s = "3+2*2"\n\n' +
      'Initial: stack=[], currentNum=0, lastOperator="+"\n\n' +
      'i=0, char="3": currentNum=3\n' +
      'i=1, char="+": isOperator=true\n' +
      '  lastOperator="+": stack.push(3) -> stack=[3]\n' +
      '  lastOperator="+", currentNum=0\n' +
      'i=2, char="2": currentNum=2\n' +
      'i=3, char="*": isOperator=true\n' +
      '  lastOperator="+": stack.push(2) -> stack=[3,2]\n' +
      '  lastOperator="*", currentNum=0\n' +
      'i=4, char="2": currentNum=2\n' +
      '  isLastChar=true:\n' +
      '  lastOperator="*": stack.pop()=2, 2*2=4, stack.push(4) -> stack=[3,4]\n\n' +
      'reduce: 3+4 = 7\n\n' +
      'Output: 7',
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
    // Phase 1: Find up to 2 candidates using Boyer-Moore voting
    let candidate1 = null;
    let candidate2 = null;
    let count1 = 0;
    let count2 = 0;

    for (const num of nums) {
        if (num === candidate1) {
            count1 = count1 + 1;
        } else if (num === candidate2) {
            count2 = count2 + 1;
        } else if (count1 === 0) {
            candidate1 = num;
            count1 = 1;
        } else if (count2 === 0) {
            candidate2 = num;
            count2 = 1;
        } else {
            // Neither candidate matches: "cancel out" one of each
            count1 = count1 - 1;
            count2 = count2 - 1;
        }
    }

    // Phase 2: Verify that candidates actually appear more than n/3 times
    const threshold = Math.floor(nums.length / 3);

    const candidates = [candidate1, candidate2];
    return candidates.filter(candidate => {
        const actualCount = nums.filter(x => x === candidate).length;
        return actualCount > threshold;
    });
};`,
    jsWalkthrough:
      'Input: nums = [3,2,3]\n\n' +
      'Phase 1: Boyer-Moore voting\n\n' +
      'num=3: count1=0 -> candidate1=3, count1=1\n' +
      'num=2: not c1, count2=0 -> candidate2=2, count2=1\n' +
      'num=3: matches candidate1 -> count1=2\n\n' +
      'Candidates: [3, 2], threshold = floor(3/3) = 1\n\n' +
      'Phase 2: Verify\n' +
      'candidate1=3: count in nums = 2, 2 > 1 -> keep\n' +
      'candidate2=2: count in nums = 1, 1 > 1? No -> discard\n\n' +
      'Output: [3]\n\n' +
      '---\n\n' +
      'Example: nums = [1,1,1,3,3,2,2,2]\n' +
      'After voting: candidate1=1, count1=1, candidate2=2, count2=1\n' +
      'threshold = floor(8/3) = 2\n' +
      '1 appears 3 times > 2 -> keep\n' +
      '2 appears 3 times > 2 -> keep\n' +
      'Output: [1, 2]',
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
    // Must be positive (0 and negatives are not powers of two)
    if (n <= 0) {
        return false;
    }

    // A power of two has exactly one bit set: n = ...0001000...
    // n - 1 flips all trailing zeros and that one bit: n-1 = ...0000111...
    // n & (n-1) clears the lowest set bit
    // If the result is 0, there was exactly one set bit -> power of two
    return (n & (n - 1)) === 0;
};`,
    jsWalkthrough:
      'Input: n = 16\n\n' +
      '16 in binary = 00010000\n' +
      '15 in binary = 00001111\n' +
      '16 & 15 = 00000000 = 0\n' +
      '16 > 0 and 0 === 0 -> true\n\n' +
      'Output: true\n\n' +
      '---\n\n' +
      'Input: n = 6\n' +
      '6 in binary = 00000110\n' +
      '5 in binary = 00000101\n' +
      '6 & 5 = 00000100 = 4 (not 0)\n' +
      '4 !== 0 -> false\n\n' +
      'Output: false',
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
    // We can't access the previous node, so we make this node "become" the next node
    // by copying its value and skipping the next node
    const nextNode = node.next;

    // Overwrite this node's value with the next node's value
    node.val = nextNode.val;

    // Skip the next node (effectively removing it from the list)
    node.next = nextNode.next;
};`,
    jsWalkthrough:
      'Input: list = [4,5,1,9], node = node(5)\n\n' +
      'Before: 4 -> 5 -> 1 -> 9\n' +
      '              ^\n' +
      '        (given node)\n\n' +
      'nextNode = node(5).next = node(1)\n\n' +
      'Step 1: node(5).val = node(1).val = 1\n' +
      '  list becomes: 4 -> 1 -> 1 -> 9\n' +
      '  (two nodes with value 1)\n\n' +
      'Step 2: node.next = node(1).next = node(9)\n' +
      '  list becomes: 4 -> 1 -> 9\n' +
      '  (the extra 1 node is now orphaned)\n\n' +
      'Output: [4,1,9]',
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
    if (!matrix.length) {
        return false;
    }

    const rows = matrix.length;
    const cols = matrix[0].length;

    // Start at top-right corner
    // Moving left eliminates a column (all values in this column are too large)
    // Moving down eliminates a row (all values in this row are too small)
    let row = 0;
    let col = cols - 1;

    while (row < rows && col >= 0) {
        const currentVal = matrix[row][col];

        if (currentVal === target) {
            return true;
        } else if (currentVal > target) {
            // Current value too large: move left
            col = col - 1;
        } else {
            // Current value too small: move down
            row = row + 1;
        }
    }

    return false;
};`,
    jsWalkthrough:
      'Input: matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]]\n' +
      'target = 5\n\n' +
      'Start at top-right: row=0, col=4, val=15\n\n' +
      'Step 1: currentVal=15 > 5 -> move left\n' +
      '  col=3, val=matrix[0][3]=11\n\n' +
      'Step 2: currentVal=11 > 5 -> move left\n' +
      '  col=2, val=matrix[0][2]=7\n\n' +
      'Step 3: currentVal=7 > 5 -> move left\n' +
      '  col=1, val=matrix[0][1]=4\n\n' +
      'Step 4: currentVal=4 < 5 -> move down\n' +
      '  row=1, val=matrix[1][1]=5\n\n' +
      'Step 5: currentVal=5 === 5 -> return true!\n\n' +
      'Output: true',
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

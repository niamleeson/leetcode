import { ProblemSolution } from "./types";

export const solutions: ProblemSolution[] = [
  // ============================================================
  // BACKTRACKING PROBLEMS
  // ============================================================

  // 17. Letter Combinations of a Phone Number
  {
    id: 17,
    description:
      "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent on a phone keypad. A mapping of digits to letters (just like on telephone buttons) is given. The answer can be returned in any order.",
    examples: `Input: digits = "23"
Output: ["ad","ae","af","bd","be","bf","cd","ce","cf"]
Explanation: Digit 2 maps to "abc" and digit 3 maps to "def". All combinations of one letter from each digit are generated.`,
    intuition:
      "Think of each digit as a 'slot' with a few letter choices. You need to pick one letter per slot and list every possible combination. This is like a combination lock where each position has its own set of options -- backtracking systematically tries each option at each position, building the result one letter at a time.",
    approach:
      "Use backtracking to build combinations one character at a time. For each digit, iterate through its mapped letters, append the letter to the current path, recurse on the next digit, then backtrack.",
    code: `class Solution:
    def letterCombinations(self, digits: str) -> list[str]:
        if not digits:
            return []

        phone = {
            "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
            "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"
        }
        result = []

        def backtrack(index: int, current: list[str]) -> None:
            if index == len(digits):
                result.append("".join(current))
                return
            for letter in phone[digits[index]]:
                current.append(letter)
                backtrack(index + 1, current)
                current.pop()

        backtrack(0, [])
        return result`,
    jsCode: `var letterCombinations = function(digits) {
    // Edge case: empty input has no combinations
    if (!digits.length) return [];

    // Map each digit to its phone keypad letters
    const phone = {
        "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
        "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"
    };
    const result = [];

    const backtrack = (index, current) => {
        // Base case: we have picked one letter for each digit
        if (index === digits.length) {
            result.push(current.join(""));
            return;
        }

        // Try every letter mapped to the current digit
        const currentDigit = digits[index];
        const letters = phone[currentDigit];

        for (const letter of letters) {
            // Choose this letter
            current.push(letter);

            // Recurse to pick a letter for the next digit
            backtrack(index + 1, current);

            // Undo the choice (backtrack)
            current.pop();
        }
    };

    backtrack(0, []);
    return result;
};`,
    jsWalkthrough:
      'digits = "23"\n\n' +
      'phone["2"] = "abc", phone["3"] = "def"\n\n' +
      'backtrack(0, [])\n' +
      '  try letter "a" → current = ["a"]\n' +
      '    backtrack(1, ["a"])\n' +
      '      try letter "d" → current = ["a","d"]\n' +
      '        backtrack(2, ["a","d"]) → index==length → push "ad"\n' +
      '      pop "d" → try "e" → push "ae" → try "f" → push "af"\n' +
      '  pop "a" → try letter "b" → current = ["b"]\n' +
      '    backtrack(1, ["b"]) → push "bd", "be", "bf"\n' +
      '  pop "b" → try letter "c" → current = ["c"]\n' +
      '    backtrack(1, ["c"]) → push "cd", "ce", "cf"\n\n' +
      'result = ["ad","ae","af","bd","be","bf","cd","ce","cf"]',
    explanation: `- phone: dictionary mapping each digit to its corresponding letters.
- backtrack(index, current): builds a combination character by character.
- Base case: when index equals the length of digits, the current combination is complete, so join and add to result.
- For each letter mapped to digits[index], append it, recurse for the next digit, then pop to backtrack.
- Start the recursion at index 0 with an empty list.`,
    timeComplexity: "O(4^n * n) where n is the length of digits (4 is the max letters per digit)",
    spaceComplexity: "O(n) for the recursion stack and current combination",
    hints: [
      "Think about how you would manually list all combinations -- you pick one letter from the first digit, then one from the second, and so on.",
      "Use a recursive function that tracks which digit index you are currently processing.",
      "The backtracking pattern is: choose a letter, recurse, then undo the choice (pop).",
    ],
  },

  // 39. Combination Sum
  {
    id: 39,
    description:
      "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. The same number may be chosen from candidates an unlimited number of times. The combinations are returned in any order.",
    examples: `Input: candidates = [2, 3, 6, 7], target = 7
Output: [[2, 2, 3], [7]]
Explanation: 2 + 2 + 3 = 7 and 7 = 7 are the two combinations that sum to the target.`,
    intuition:
      "Imagine you have unlimited coins of certain denominations and need to make exact change. At each step you decide whether to use the current coin again or move on to the next denomination. Sorting the candidates lets you stop early when a coin is too large, and always picking coins in non-decreasing order prevents counting the same combination twice.",
    approach:
      "Use backtracking with a start index to avoid duplicate combinations. At each step, either include the current candidate (allowing reuse by not advancing the index) or skip to the next candidate. Prune when the remaining target becomes negative.",
    code: `class Solution:
    def combinationSum(self, candidates: list[int], target: int) -> list[list[int]]:
        result = []
        candidates.sort()

        def backtrack(start: int, remaining: int, current: list[int]) -> None:
            if remaining == 0:
                result.append(current[:])
                return
            for i in range(start, len(candidates)):
                if candidates[i] > remaining:
                    break
                current.append(candidates[i])
                backtrack(i, remaining - candidates[i], current)
                current.pop()

        backtrack(0, target, [])
        return result`,
    jsCode: `var combinationSum = function(candidates, target) {
    const result = [];

    // Sort so we can break early when a candidate exceeds the remaining target
    candidates.sort((a, b) => a - b);

    const backtrack = (start, remaining, current) => {
        // Base case: found a valid combination
        if (remaining === 0) {
            result.push([...current]);
            return;
        }

        for (let i = start; i < candidates.length; i++) {
            const candidate = candidates[i];

            // Since array is sorted, all further candidates are also too large
            if (candidate > remaining) break;

            // Choose this candidate
            current.push(candidate);

            // Recurse with same index i (allows reuse of this candidate)
            backtrack(i, remaining - candidate, current);

            // Undo the choice (backtrack)
            current.pop();
        }
    };

    backtrack(0, target, []);
    return result;
};`,
    jsWalkthrough:
      'candidates = [2, 3, 6, 7], target = 7\n' +
      'After sort: [2, 3, 6, 7]\n\n' +
      'backtrack(0, 7, [])\n' +
      '  i=0 candidate=2: current=[2], backtrack(0, 5, [2])\n' +
      '    i=0 candidate=2: current=[2,2], backtrack(0, 3, [2,2])\n' +
      '      i=0 candidate=2: current=[2,2,2], backtrack(0, 1, [2,2,2])\n' +
      '        i=0 candidate=2 > remaining=1 → break\n' +
      '      pop 2 → i=1 candidate=3 > remaining=3? No. current=[2,2,3]\n' +
      '        backtrack(1, 0, [2,2,3]) → remaining==0 → push [2,2,3]\n' +
      '      pop 3 → i=2 candidate=6 > 3 → break\n' +
      '    pop 2 → i=1 candidate=3: current=[2,3], backtrack(1, 2, [2,3])\n' +
      '      i=1 candidate=3 > remaining=2 → break\n' +
      '    pop 3 → i=2 candidate=6 > 5 → break\n' +
      '  pop 2 → ... eventually i=3 candidate=7: current=[7]\n' +
      '    backtrack(3, 0, [7]) → remaining==0 → push [7]\n\n' +
      'result = [[2,2,3],[7]]',
    explanation: `- Sort candidates so we can prune early when a candidate exceeds the remaining target.
- backtrack(start, remaining, current): start prevents revisiting earlier candidates (avoids duplicates), remaining tracks how much more we need, current is the combination being built.
- Base case: remaining == 0 means we found a valid combination; copy and store it.
- Loop from start to end: if candidates[i] > remaining, break (all further are larger due to sort).
- Pass i (not i+1) as the next start so the same element can be reused.
- Pop after recursion to backtrack.`,
    timeComplexity: "O(n^(t/m)) where n is number of candidates, t is target, m is the smallest candidate",
    spaceComplexity: "O(t/m) for the recursion depth",
    hints: [
      "Sorting the candidates lets you break early when the current candidate is too large.",
      "To allow reusing the same number, pass the same index (not index + 1) into the recursive call.",
      "Track the remaining sum needed rather than the accumulated sum to simplify the base case check.",
    ],
  },

  // 40. Combination Sum II
  {
    id: 40,
    description:
      "Given a collection of candidate numbers (which may contain duplicates) and a target number, find all unique combinations in candidates where the candidate numbers sum to target. Each number in candidates may only be used once in the combination.",
    examples: `Input: candidates = [10, 1, 2, 7, 6, 1, 5], target = 8
Output: [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]
Explanation: Each combination sums to 8, and duplicates like [1, 2, 5] are listed only once.`,
    intuition:
      "This is like Combination Sum I, but each coin can only be used once and there may be duplicate coins. The key insight is that sorting groups duplicates together, and at each decision level you only pick the first occurrence of a value. This way, identical coins are treated as interchangeable, preventing duplicate combinations without needing a set.",
    approach:
      "Sort the array to group duplicates together. Use backtracking with a start index and skip duplicate candidates at the same recursion level to avoid generating duplicate combinations. Each element can be used at most once.",
    code: `class Solution:
    def combinationSum2(self, candidates: list[int], target: int) -> list[list[int]]:
        result = []
        candidates.sort()

        def backtrack(start: int, remaining: int, current: list[int]) -> None:
            if remaining == 0:
                result.append(current[:])
                return
            for i in range(start, len(candidates)):
                if candidates[i] > remaining:
                    break
                if i > start and candidates[i] == candidates[i - 1]:
                    continue
                current.append(candidates[i])
                backtrack(i + 1, remaining - candidates[i], current)
                current.pop()

        backtrack(0, target, [])
        return result`,
    jsCode: `var combinationSum2 = function(candidates, target) {
    const result = [];

    // Sort to group duplicates together and enable early pruning
    candidates.sort((a, b) => a - b);

    const backtrack = (start, remaining, current) => {
        // Base case: found a valid combination
        if (remaining === 0) {
            result.push([...current]);
            return;
        }

        for (let i = start; i < candidates.length; i++) {
            const candidate = candidates[i];

            // Prune: sorted array means all remaining candidates are also too large
            if (candidate > remaining) break;

            // Skip duplicates at the same recursion level to avoid duplicate combinations
            // i > start ensures we only skip after the first occurrence at this level
            if (i > start && candidates[i] === candidates[i - 1]) continue;

            // Choose this candidate
            current.push(candidate);

            // Recurse with i+1 (each element used at most once)
            backtrack(i + 1, remaining - candidate, current);

            // Undo the choice (backtrack)
            current.pop();
        }
    };

    backtrack(0, target, []);
    return result;
};`,
    jsWalkthrough:
      'candidates = [10,1,2,7,6,1,5], target = 8\n' +
      'After sort: [1,1,2,5,6,7,10]\n\n' +
      'backtrack(0, 8, [])\n' +
      '  i=0, candidate=1: current=[1], backtrack(1, 7, [1])\n' +
      '    i=1, candidate=1: current=[1,1], backtrack(2, 6, [1,1])\n' +
      '      i=2, candidate=2: current=[1,1,2], backtrack(3, 4, [1,1,2])\n' +
      '        i=3, candidate=5 > 4 → break\n' +
      '      pop 2 → i=3, candidate=5: current=[1,1,5], remaining=1\n' +
      '        i=4, candidate=6 > 1 → break\n' +
      '      pop 5 → i=4, candidate=6: current=[1,1,6]\n' +
      '        backtrack(5, 0, [1,1,6]) → push [1,1,6]\n' +
      '    i=2, candidate=2: current=[1,2], backtrack(3, 5, [1,2])\n' +
      '      i=3, candidate=5: current=[1,2,5]\n' +
      '        backtrack(4, 0, [1,2,5]) → push [1,2,5]\n' +
      '    i=3, candidate=5: ... eventually push [1,7] and [2,6]\n\n' +
      '  i=1, candidate=1: i>start AND candidates[1]==candidates[0] → skip (dedup)\n\n' +
      'result = [[1,1,6],[1,2,5],[1,7],[2,6]]',
    explanation: `- Sort candidates to group duplicates and enable pruning.
- The key deduplication line: if i > start and candidates[i] == candidates[i-1], skip. This skips duplicate values at the same branch level while still allowing duplicates in deeper levels.
- Pass i + 1 (not i) so each element is used at most once.
- Break early when candidates[i] > remaining since the array is sorted.
- Copy current with current[:] when remaining == 0.`,
    timeComplexity: "O(2^n) where n is the number of candidates",
    spaceComplexity: "O(n) for the recursion stack",
    hints: [
      "Sorting is essential to group duplicates together so you can skip them easily.",
      "The trick to avoiding duplicate combinations is: at each recursion level, skip a candidate if it equals the previous candidate at the same level.",
      "Unlike Combination Sum I, pass i + 1 (not i) to ensure each element is used only once.",
    ],
  },

  // 46. Permutations
  {
    id: 46,
    description:
      "Given an array nums of distinct integers, return all possible permutations. You can return the answer in any order.",
    examples: `Input: nums = [1, 2, 3]
Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
Explanation: All 6 permutations of the three distinct numbers are listed.`,
    intuition:
      "Think of filling positions in a line one by one. For the first position you can pick any element, for the second any remaining element, and so on. A 'used' set tracks which elements are already placed. This is different from combinations because order matters -- [1,2] and [2,1] are distinct results.",
    approach:
      "Use backtracking with a visited set (or swap-based approach). At each step pick any unused element, add it to the current permutation, recurse, then backtrack by removing it and marking it unvisited.",
    code: `class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        result = []

        def backtrack(current: list[int], used: set[int]) -> None:
            if len(current) == len(nums):
                result.append(current[:])
                return
            for i in range(len(nums)):
                if i in used:
                    continue
                used.add(i)
                current.append(nums[i])
                backtrack(current, used)
                current.pop()
                used.discard(i)

        backtrack([], set())
        return result`,
    jsCode: `var permute = function(nums) {
    const result = [];

    // current: the permutation being built
    // used: set of indices already placed in current
    const backtrack = (current, used) => {
        // Base case: all elements are placed — full permutation found
        if (current.length === nums.length) {
            result.push([...current]);
            return;
        }

        for (let i = 0; i < nums.length; i++) {
            // Skip indices already in the current permutation
            if (used.has(i)) continue;

            // Choose: mark index as used and place its value
            used.add(i);
            current.push(nums[i]);

            // Recurse to fill the next position
            backtrack(current, used);

            // Undo: remove the value and unmark the index
            current.pop();
            used.delete(i);
        }
    };

    backtrack([], new Set());
    return result;
};`,
    jsWalkthrough:
      'nums = [1, 2, 3]\n\n' +
      'backtrack([], {})\n' +
      '  i=0: place 1 → current=[1], used={0}\n' +
      '    i=1: place 2 → current=[1,2], used={0,1}\n' +
      '      i=2: place 3 → current=[1,2,3], used={0,1,2}\n' +
      '        length==3 → push [1,2,3]\n' +
      '      unplace 3\n' +
      '    unplace 2 → i=2: place 3 → current=[1,3], used={0,2}\n' +
      '      i=1: place 2 → current=[1,3,2] → push [1,3,2]\n' +
      '  unplace 1 → i=1: place 2 → current=[2], used={1}\n' +
      '    i=0: place 1 → current=[2,1] → eventually push [2,1,3]\n' +
      '    i=2: place 3 → current=[2,3] → eventually push [2,3,1]\n' +
      '  i=2: place 3 → ... push [3,1,2] and [3,2,1]\n\n' +
      'result = [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]',
    explanation: `- backtrack(current, used): current holds the permutation being built, used tracks which indices have been placed.
- Base case: when current has the same length as nums, a full permutation is formed; copy and store it.
- Loop through all indices; skip already-used indices.
- Mark index as used, append the value, recurse, then undo both actions to backtrack.
- Using index-based tracking (not value-based) works cleanly for distinct elements.`,
    timeComplexity: "O(n! * n) where n is the length of nums",
    spaceComplexity: "O(n) for the recursion stack and used set",
    hints: [
      "Unlike combinations, permutations care about order, so [1,2] and [2,1] are different results.",
      "Use a set to track which indices are already used in the current permutation.",
      "At each recursion step, you can choose any unused element (not just elements after a start index).",
    ],
  },

  // 47. Permutations II
  {
    id: 47,
    description:
      "Given a collection of numbers, nums, that might contain duplicates, return all possible unique permutations in any order.",
    examples: `Input: nums = [1, 1, 2]
Output: [[1,1,2],[1,2,1],[2,1,1]]
Explanation: Only three unique permutations exist because the two 1s are indistinguishable.`,
    intuition:
      "When you have duplicate elements, swapping two identical items produces the same permutation. The trick is to sort the array and enforce a rule: among identical values, always use them in left-to-right order. If a duplicate's predecessor was not used at the current level, skip it -- this single rule eliminates all duplicate permutations.",
    approach:
      "Sort the array so duplicates are adjacent. Use backtracking with a used-index set and skip a duplicate element if the previous identical element at the same level was not used. This ensures each duplicate is only used in one fixed order.",
    code: `class Solution:
    def permuteUnique(self, nums: list[int]) -> list[list[int]]:
        result = []
        nums.sort()

        def backtrack(current: list[int], used: list[bool]) -> None:
            if len(current) == len(nums):
                result.append(current[:])
                return
            for i in range(len(nums)):
                if used[i]:
                    continue
                if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                    continue
                used[i] = True
                current.append(nums[i])
                backtrack(current, used)
                current.pop()
                used[i] = False

        backtrack([], [False] * len(nums))
        return result`,
    jsCode: `var permuteUnique = function(nums) {
    const result = [];

    // Sort so duplicate values are adjacent — enables deduplication
    nums.sort((a, b) => a - b);

    // used[i] = true means nums[i] is currently in the permutation being built
    const used = new Array(nums.length).fill(false);

    const backtrack = (current) => {
        // Base case: full permutation is complete
        if (current.length === nums.length) {
            result.push([...current]);
            return;
        }

        for (let i = 0; i < nums.length; i++) {
            // Skip if this index is already placed in current
            if (used[i]) continue;

            // Deduplication: if this value equals the previous value AND the
            // previous was not used at this level, skip to enforce ordering
            // among duplicates and prevent duplicate permutations
            if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;

            // Choose: mark used and place value
            used[i] = true;
            current.push(nums[i]);

            backtrack(current);

            // Undo: unmark and remove value
            current.pop();
            used[i] = false;
        }
    };

    backtrack([]);
    return result;
};`,
    jsWalkthrough:
      'nums = [1, 1, 2]\n' +
      'After sort: [1, 1, 2]  (indices 0,1,2)\n\n' +
      'backtrack([])\n' +
      '  i=0: nums[0]=1, used=[F,F,F] → place 1, used=[T,F,F]\n' +
      '    i=0: used[0]=true → skip\n' +
      '    i=1: nums[1]=1, nums[0]=1, used[0]=true → NOT skipped (used[i-1] is true)\n' +
      '          place 1 → current=[1,1], used=[T,T,F]\n' +
      '      i=2: place 2 → current=[1,1,2] → push [1,1,2]\n' +
      '    i=2: place 2 → current=[1,2], used=[T,F,T]\n' +
      '      i=1: nums[1]=1, nums[0]=1, used[0]=true → place 1 → [1,2,1] → push\n' +
      '  i=1: nums[1]=1, nums[0]=1, used[0]=false → SKIP (dedup)\n' +
      '  i=2: nums[2]=2 → place 2, used=[F,F,T]\n' +
      '    i=0: place 1 → current=[2,1], used=[T,F,T]\n' +
      '      i=1: nums[1]=1, used[0]=true → place 1 → [2,1,1] → push\n\n' +
      'result = [[1,1,2],[1,2,1],[2,1,1]]',
    explanation: `- Sort nums so duplicates are adjacent, making it easy to detect and skip them.
- used is a boolean array tracking whether each index is currently in the permutation.
- The deduplication condition: if nums[i] == nums[i-1] and not used[i-1], skip. This enforces that among duplicates, we always pick them in left-to-right order.
- The rest follows standard permutation backtracking: mark used, append, recurse, pop, unmark.`,
    timeComplexity: "O(n! * n) where n is the length of nums",
    spaceComplexity: "O(n) for the recursion stack and used array",
    hints: [
      "Sort the array first so that duplicate values are adjacent.",
      "The key insight is to skip a duplicate if the previous identical value was not used at this recursion level -- this forces a canonical ordering among duplicates.",
      "Use a boolean used array indexed by position to track which elements are in the current permutation.",
    ],
  },

  // 51. N-Queens
  {
    id: 51,
    description:
      "Place n queens on an n x n chessboard so that no two queens threaten each other (no two queens share the same row, column, or diagonal). Return all distinct solutions, where each solution is a list of strings representing the board with 'Q' for queens and '.' for empty squares.",
    examples: `Input: n = 4
Output: [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]
Explanation: There are exactly two ways to place 4 queens on a 4x4 board so none attack each other.`,
    intuition:
      "Since each row must have exactly one queen, you can place queens row by row and only worry about column and diagonal conflicts. The clever insight is that all cells on the same diagonal share the same (row + col) or (row - col) value, so you can check diagonal attacks in O(1) using sets instead of scanning the board.",
    approach:
      "Place queens row by row using backtracking. For each row, try every column; use sets to track which columns, positive diagonals (row + col), and negative diagonals (row - col) are already attacked. If a position is safe, place the queen and recurse to the next row.",
    code: `class Solution:
    def solveNQueens(self, n: int) -> list[list[str]]:
        result = []
        cols = set()
        pos_diag = set()  # row + col
        neg_diag = set()  # row - col

        board = [["." ] * n for _ in range(n)]

        def backtrack(row: int) -> None:
            if row == n:
                result.append(["".join(r) for r in board])
                return
            for col in range(n):
                if col in cols or (row + col) in pos_diag or (row - col) in neg_diag:
                    continue
                cols.add(col)
                pos_diag.add(row + col)
                neg_diag.add(row - col)
                board[row][col] = "Q"

                backtrack(row + 1)

                board[row][col] = "."
                cols.discard(col)
                pos_diag.discard(row + col)
                neg_diag.discard(row - col)

        backtrack(0)
        return result`,
    jsCode: `var solveNQueens = function(n) {
    const result = [];

    // Track which columns and diagonals are already occupied
    const cols = new Set();
    const posDiag = new Set(); // cells on same positive diagonal share row + col
    const negDiag = new Set(); // cells on same negative diagonal share row - col

    // Initialize an n×n board of empty cells
    const board = Array.from({ length: n }, () => Array(n).fill("."));

    const backtrack = (row) => {
        // Base case: placed a queen in every row — record the solution
        if (row === n) {
            const boardSnapshot = board.map(rowArr => rowArr.join(""));
            result.push(boardSnapshot);
            return;
        }

        for (let col = 0; col < n; col++) {
            const isColumnAttacked = cols.has(col);
            const isPosDiagAttacked = posDiag.has(row + col);
            const isNegDiagAttacked = negDiag.has(row - col);

            // Skip this column if it is under attack
            if (isColumnAttacked || isPosDiagAttacked || isNegDiagAttacked) {
                continue;
            }

            // Place the queen and mark all attacked lines
            cols.add(col);
            posDiag.add(row + col);
            negDiag.add(row - col);
            board[row][col] = "Q";

            // Recurse to place the next row's queen
            backtrack(row + 1);

            // Remove the queen and unmark attacked lines (backtrack)
            board[row][col] = ".";
            cols.delete(col);
            posDiag.delete(row + col);
            negDiag.delete(row - col);
        }
    };

    backtrack(0);
    return result;
};`,
    jsWalkthrough:
      'n = 4\n\n' +
      'backtrack(row=0)\n' +
      '  col=0: cols={0}, posDiag={0}, negDiag={0}, board[0][0]="Q"\n' +
      '    backtrack(row=1)\n' +
      '      col=0: cols has 0 → skip\n' +
      '      col=1: negDiag has 1-1=0 → skip\n' +
      '      col=2: safe → place Q, board[1][2]="Q"\n' +
      '        backtrack(row=2)\n' +
      '          col=0: cols has 0 → skip\n' +
      '          col=1: posDiag has 2+1=3? No. negDiag has 2-1=1? No. cols has 1? No → place\n' +
      '            backtrack(row=3) → all cols blocked → no solution from here\n' +
      '          col=2: cols has 2 → skip\n' +
      '          col=3: negDiag has 2-3=-1? No. posDiag has 2+3=5? No → place\n' +
      '            backtrack(row=3) → eventually no valid col\n' +
      '      col=3: safe → place Q, board[1][3]="Q"\n' +
      '        backtrack(row=2)\n' +
      '          col=1: safe → place Q, board[2][1]="Q"\n' +
      '            backtrack(row=3)\n' +
      '              col=2: safe → place Q → row==4 → push [".Q..","...Q","Q...","..Q."]\n\n' +
      'result has 2 valid arrangements for n=4',
    explanation: `- Place one queen per row (row by row), so row conflicts are impossible by construction.
- cols set: tracks which columns are occupied.
- pos_diag set (row + col): cells on the same positive diagonal share the same row + col value.
- neg_diag set (row - col): cells on the same negative diagonal share the same row - col value.
- For each column in the current row, check all three sets; if safe, place queen and recurse.
- Base case: row == n means all queens are placed; snapshot the board.
- Backtrack by resetting the cell and removing from all sets.`,
    timeComplexity: "O(n!) since the branching factor decreases at each row",
    spaceComplexity: "O(n^2) for the board plus O(n) for the sets and recursion stack",
    hints: [
      "Process one row at a time -- this automatically ensures no two queens share a row.",
      "Use sets for columns, positive diagonals (row + col), and negative diagonals (row - col) for O(1) conflict checking.",
      "Remember to undo all state changes (board cell + all three sets) when backtracking.",
    ],
  },

  // 77. Combinations
  {
    id: 77,
    description:
      "Given two integers n and k, return all possible combinations of k numbers chosen from the range [1, n]. You may return the answer in any order.",
    examples: `Input: n = 4, k = 2
Output: [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
Explanation: All 6 ways to choose 2 numbers from {1, 2, 3, 4} are listed.`,
    intuition:
      "Generating combinations is about choosing elements in increasing order so you never revisit earlier choices. Think of it as walking through the numbers left-to-right and at each step deciding 'do I include this number?' The start parameter ensures you only look forward, and pruning stops you when there are not enough numbers left to fill the remaining slots.",
    approach:
      "Use backtracking with a start parameter that only considers numbers greater than the last chosen number, ensuring combinations are generated in increasing order without duplicates. Prune when there are not enough remaining numbers to fill the combination.",
    code: `class Solution:
    def combine(self, n: int, k: int) -> list[list[int]]:
        result = []

        def backtrack(start: int, current: list[int]) -> None:
            if len(current) == k:
                result.append(current[:])
                return
            # Prune: need k - len(current) more numbers, so stop if not enough left
            for i in range(start, n - (k - len(current)) + 2):
                current.append(i)
                backtrack(i + 1, current)
                current.pop()

        backtrack(1, [])
        return result`,
    jsCode: `var combine = function(n, k) {
    const result = [];

    const backtrack = (start, current) => {
        // Base case: picked exactly k numbers — record this combination
        if (current.length === k) {
            result.push([...current]);
            return;
        }

        // Pruning: we need (k - current.length) more numbers.
        // The largest valid starting point is n - (k - current.length) + 1,
        // because we need enough numbers remaining to fill the combination.
        const numbersNeeded = k - current.length;
        const upperBound = n - numbersNeeded + 1;

        for (let i = start; i <= upperBound; i++) {
            // Choose number i
            current.push(i);

            // Recurse: next number must be greater than i
            backtrack(i + 1, current);

            // Undo the choice (backtrack)
            current.pop();
        }
    };

    backtrack(1, []);
    return result;
};`,
    jsWalkthrough:
      'n = 4, k = 2\n\n' +
      'backtrack(start=1, current=[])\n' +
      '  numbersNeeded=2, upperBound=4-2+1=3\n' +
      '  i=1: current=[1]\n' +
      '    backtrack(start=2, current=[1])\n' +
      '      numbersNeeded=1, upperBound=4-1+1=4\n' +
      '      i=2: current=[1,2] → length==k → push [1,2]\n' +
      '      i=3: current=[1,3] → push [1,3]\n' +
      '      i=4: current=[1,4] → push [1,4]\n' +
      '  i=2: current=[2]\n' +
      '    backtrack(start=3, current=[2])\n' +
      '      i=3: push [2,3]\n' +
      '      i=4: push [2,4]\n' +
      '  i=3: current=[3]\n' +
      '    backtrack(start=4, current=[3])\n' +
      '      i=4: push [3,4]\n\n' +
      'result = [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]',
    explanation: `- backtrack(start, current): start ensures we only pick larger numbers, current holds the partial combination.
- Base case: when current has k elements, copy and add to result.
- Pruning optimization: the loop runs from start to n - (k - len(current)) + 2. If there are fewer remaining numbers than needed, we skip those branches entirely.
- For each valid number i, append it, recurse with i + 1 as the new start, then pop to backtrack.`,
    timeComplexity: "O(C(n, k) * k) where C(n, k) is the binomial coefficient",
    spaceComplexity: "O(k) for the recursion stack and current combination",
    hints: [
      "To avoid duplicate combinations like [1,2] and [2,1], always pick the next number from values greater than the last chosen.",
      "You can prune significantly: if you need m more numbers but only have fewer than m left, stop early.",
      "The start parameter in the recursive call should be i + 1 (not i) since each number is used at most once.",
    ],
  },

  // 78. Subsets
  {
    id: 78,
    description:
      "Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets and can be in any order.",
    examples: `Input: nums = [1, 2, 3]
Output: [[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]
Explanation: All 8 subsets of {1, 2, 3} are listed, including the empty set and the full set.`,
    intuition:
      "Every subset is just a combination of any length. Unlike the combinations problem where you only collect results at a specific size, here every partial state in the recursion tree is a valid answer. Think of each element as a yes/no decision -- include it or skip it -- which naturally gives you 2^n total subsets.",
    approach:
      "Use backtracking where at each recursion level, you record the current subset (every node in the recursion tree is a valid subset). Iterate from a start index to the end, including each element and recursing further.",
    code: `class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        result = []

        def backtrack(start: int, current: list[int]) -> None:
            result.append(current[:])
            for i in range(start, len(nums)):
                current.append(nums[i])
                backtrack(i + 1, current)
                current.pop()

        backtrack(0, [])
        return result`,
    jsCode: `var subsets = function(nums) {
    const result = [];

    const backtrack = (start, current) => {
        // Every node in the recursion tree is a valid subset — record it now
        result.push([...current]);

        for (let i = start; i < nums.length; i++) {
            // Choose nums[i] to extend the current subset
            current.push(nums[i]);

            // Recurse: only consider elements after index i
            backtrack(i + 1, current);

            // Undo the choice (backtrack)
            current.pop();
        }
    };

    backtrack(0, []);
    return result;
};`,
    jsWalkthrough:
      'nums = [1, 2, 3]\n\n' +
      'backtrack(0, []) → push []\n' +
      '  i=0: current=[1] → push [1]\n' +
      '    backtrack(1, [1]) → push [1]\n' +
      '    i=1: current=[1,2] → push [1,2]\n' +
      '      backtrack(2, [1,2])\n' +
      '      i=2: current=[1,2,3] → push [1,2,3]\n' +
      '        backtrack(3, [1,2,3]) → start==length, no loop\n' +
      '      pop 3\n' +
      '    pop 2 → i=2: current=[1,3] → push [1,3]\n' +
      '      backtrack(3, [1,3]) → no loop\n' +
      '    pop 3\n' +
      '  pop 1 → i=1: current=[2] → push [2]\n' +
      '    i=2: current=[2,3] → push [2,3]\n' +
      '  pop 2 → i=2: current=[3] → push [3]\n\n' +
      'result = [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]',
    explanation: `- Unlike combinations, every partial combination is a valid subset, so we add to result at every call (not just at a specific length).
- backtrack(start, current): start ensures we only consider elements after the last chosen one.
- At each call, snapshot current into result.
- Loop from start to end: include nums[i], recurse with i + 1, then pop to backtrack.
- This naturally generates all 2^n subsets.`,
    timeComplexity: "O(n * 2^n) since there are 2^n subsets each taking O(n) to copy",
    spaceComplexity: "O(n) for the recursion stack (excluding output)",
    hints: [
      "Every node in the backtracking tree represents a valid subset -- not just the leaves.",
      "Use a start index to ensure each element appears at most once and subsets are built in order.",
      "You can also think of it as: for each element, choose to include or exclude it (binary decision tree).",
    ],
  },

  // 79. Word Search
  {
    id: 79,
    description:
      "Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically), and the same cell may not be used more than once.",
    examples: `Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
Output: true
Explanation: The path A -> B -> C -> C -> E -> D exists by following adjacent cells.`,
    intuition:
      "This is like tracing a word with your finger on a letter grid. At each cell, you check if it matches the next letter in the word and explore neighboring cells. The key insight is marking cells as visited during your current path (and unmarking when you backtrack) so you do not reuse a cell within the same word trace.",
    approach:
      "For each cell matching the first letter of the word, start a DFS/backtracking search. Mark cells as visited during exploration (in-place by replacing with a sentinel). Explore all four directions; backtrack by restoring the original character.",
    code: `class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])

        def backtrack(r: int, c: int, idx: int) -> bool:
            if idx == len(word):
                return True
            if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[idx]:
                return False

            temp = board[r][c]
            board[r][c] = "#"  # mark visited

            found = (
                backtrack(r + 1, c, idx + 1)
                or backtrack(r - 1, c, idx + 1)
                or backtrack(r, c + 1, idx + 1)
                or backtrack(r, c - 1, idx + 1)
            )

            board[r][c] = temp  # restore
            return found

        for r in range(rows):
            for c in range(cols):
                if backtrack(r, c, 0):
                    return True
        return False`,
    jsCode: `var exist = function(board, word) {
    const rows = board.length;
    const cols = board[0].length;

    const backtrack = (r, c, idx) => {
        // Base case: matched all characters in word
        if (idx === word.length) return true;

        // Out of bounds or character mismatch — this path fails
        if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[idx]) {
            return false;
        }

        // Mark this cell as visited by replacing with a sentinel
        const originalChar = board[r][c];
        board[r][c] = "#";

        // Explore all four directions for the next character
        const foundDown  = backtrack(r + 1, c, idx + 1);
        const foundUp    = backtrack(r - 1, c, idx + 1);
        const foundRight = backtrack(r, c + 1, idx + 1);
        const foundLeft  = backtrack(r, c - 1, idx + 1);

        // Restore the cell so other paths can use it
        board[r][c] = originalChar;

        return foundDown || foundUp || foundRight || foundLeft;
    };

    // Try starting the word search from every cell
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (backtrack(r, c, 0)) return true;
        }
    }
    return false;
};`,
    jsWalkthrough:
      'board = [["A","B","C","E"],\n' +
      '         ["S","F","C","S"],\n' +
      '         ["A","D","E","E"]], word = "ABCCED"\n\n' +
      'Scan cells until (r=0,c=0): board[0][0]="A" == word[0]="A"\n' +
      'backtrack(0, 0, 0): match "A", mark "#"\n' +
      '  backtrack(0, 1, 1): board[0][1]="B" == word[1]="B", mark "#"\n' +
      '    backtrack(0, 2, 2): board[0][2]="C" == word[2]="C", mark "#"\n' +
      '      backtrack(1, 2, 3): board[1][2]="C" == word[3]="C", mark "#"\n' +
      '        backtrack(2, 2, 4): board[2][2]="E" == word[4]="E", mark "#"\n' +
      '          backtrack(2, 1, 5): board[2][1]="D" == word[5]="D", mark "#"\n' +
      '            backtrack(_, _, 6): idx==word.length → return true\n\n' +
      'Path found: A(0,0)→B(0,1)→C(0,2)→C(1,2)→E(2,2)→D(2,1)\n' +
      'return true',
    explanation: `- Try starting the search from every cell in the grid.
- backtrack(r, c, idx): checks if we can match word[idx:] starting from cell (r, c).
- Base case: idx == len(word) means the entire word has been matched.
- Boundary/mismatch check: return False if out of bounds or the character does not match.
- Mark visited by replacing with "#" to prevent revisiting the same cell in one path.
- Explore all four directions; short-circuit with 'or' if any path succeeds.
- Restore the cell after exploring (backtrack) to allow other paths to use it.`,
    timeComplexity: "O(m * n * 3^L) where L is word length, 3 because we don't revisit the previous cell",
    spaceComplexity: "O(L) for the recursion stack depth",
    hints: [
      "Start the DFS from every cell that matches the first character of the word.",
      "Mark cells as visited in-place (e.g., replace with '#') and restore them during backtracking to save space.",
      "Short-circuit evaluation (using 'or') among the four directions can save time if the word is found early.",
    ],
  },

  // 90. Subsets II
  {
    id: 90,
    description:
      "Given an integer array nums that may contain duplicates, return all possible subsets (the power set). The solution set must not contain duplicate subsets.",
    examples: `Input: nums = [1, 2, 2]
Output: [[], [1], [1,2], [1,2,2], [2], [2,2]]
Explanation: Unlike the basic subsets problem, the duplicate 2s require deduplication to avoid repeats like having [2] listed twice.`,
    intuition:
      "This is the Subsets problem with one added twist: duplicates. Sorting the array groups identical values together. Then at each recursion level, if you have already tried a value, you skip its duplicates. The condition 'i > start' is crucial -- it means 'I already branched with this same value at this level, so skip it.'",
    approach:
      "Sort the array to bring duplicates together. Use backtracking identical to Subsets, but skip an element if it equals the previous element at the same recursion level (i > start and nums[i] == nums[i-1]).",
    code: `class Solution:
    def subsetsWithDup(self, nums: list[int]) -> list[list[int]]:
        result = []
        nums.sort()

        def backtrack(start: int, current: list[int]) -> None:
            result.append(current[:])
            for i in range(start, len(nums)):
                if i > start and nums[i] == nums[i - 1]:
                    continue
                current.append(nums[i])
                backtrack(i + 1, current)
                current.pop()

        backtrack(0, [])
        return result`,
    jsCode: `var subsetsWithDup = function(nums) {
    const result = [];

    // Sort so duplicate values are adjacent — makes deduplication easy
    nums.sort((a, b) => a - b);

    const backtrack = (start, current) => {
        // Every partial state is a valid subset — record it immediately
        result.push([...current]);

        for (let i = start; i < nums.length; i++) {
            // Skip duplicates at the same recursion level.
            // i > start means we already branched with this value at this level.
            if (i > start && nums[i] === nums[i - 1]) continue;

            // Choose nums[i] and extend the current subset
            current.push(nums[i]);

            backtrack(i + 1, current);

            // Undo the choice (backtrack)
            current.pop();
        }
    };

    backtrack(0, []);
    return result;
};`,
    jsWalkthrough:
      'nums = [1, 2, 2]\n' +
      'After sort: [1, 2, 2]\n\n' +
      'backtrack(0, []) → push []\n' +
      '  i=0: current=[1] → push [1]\n' +
      '    backtrack(1, [1]) → push [1]\n' +
      '    i=1: current=[1,2] → push [1,2]\n' +
      '      backtrack(2, [1,2]) → push [1,2]\n' +
      '      i=2: nums[2]=2, nums[1]=2, i>start → SKIP (dedup)\n' +
      '    pop 2 → i=2: i>start? 2>1=yes, nums[2]==nums[1]=2 → SKIP\n' +
      '  pop 1\n' +
      '  i=1: current=[2] → push [2]\n' +
      '    backtrack(2, [2]) → push [2]\n' +
      '    i=2: current=[2,2] → push [2,2]\n' +
      '      backtrack(3) → no loop\n' +
      '  pop 2 → i=2: i>start? 2>0=yes, nums[2]==nums[1]=2 → SKIP\n\n' +
      'result = [[],[1],[1,2],[1,2,2],[2],[2,2]]',
    explanation: `- Sort nums so duplicates are adjacent.
- The deduplication line: if i > start and nums[i] == nums[i-1], skip. This prevents choosing the same value more than once at the same recursion level.
- Note: i > start (not i > 0) ensures we only skip duplicates within the same branching level, not across different levels.
- Otherwise identical to the standard subsets backtracking: record every partial combination as a valid subset.`,
    timeComplexity: "O(n * 2^n) in the worst case (all unique elements)",
    spaceComplexity: "O(n) for the recursion stack",
    hints: [
      "This is Subsets (problem 78) with an extra deduplication step.",
      "Sort the array first, then skip elements that are the same as the previous one at the same recursion level.",
      "The condition 'i > start' is crucial -- it allows the first occurrence at each level but skips subsequent duplicates.",
    ],
  },

  // 131. Palindrome Partitioning
  {
    id: 131,
    description:
      "Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitionings of s.",
    examples: `Input: s = "aab"
Output: [["a","a","b"],["aa","b"]]
Explanation: Both partitions consist entirely of palindromic substrings.`,
    intuition:
      "Imagine placing dividers between characters in the string. Each segment between dividers must be a palindrome. At each position, you try every possible 'cut' length -- if the resulting prefix is a palindrome, you commit to that cut and recursively partition the remainder. This naturally explores all valid ways to divide the string.",
    approach:
      "Use backtracking. At each step, try every possible prefix of the remaining string. If the prefix is a palindrome, add it to the current partition and recurse on the rest. When the entire string is consumed, save the partition.",
    code: `class Solution:
    def partition(self, s: str) -> list[list[str]]:
        result = []

        def is_palindrome(sub: str) -> bool:
            return sub == sub[::-1]

        def backtrack(start: int, current: list[str]) -> None:
            if start == len(s):
                result.append(current[:])
                return
            for end in range(start + 1, len(s) + 1):
                substring = s[start:end]
                if is_palindrome(substring):
                    current.append(substring)
                    backtrack(end, current)
                    current.pop()

        backtrack(0, [])
        return result`,
    jsCode: `var partition = function(s) {
    const result = [];

    // Check if a substring reads the same forwards and backwards
    const isPalindrome = (sub) => {
        let left = 0;
        let right = sub.length - 1;

        while (left < right) {
            if (sub[left] !== sub[right]) return false;
            left++;
            right--;
        }
        return true;
    };

    // start: index where the next partition begins
    // current: list of palindrome substrings chosen so far
    const backtrack = (start, current) => {
        // Base case: consumed the entire string — all parts are palindromes
        if (start === s.length) {
            result.push([...current]);
            return;
        }

        // Try every possible end point for the next partition
        for (let end = start + 1; end <= s.length; end++) {
            const substring = s.slice(start, end);

            // Only recurse if this prefix is a palindrome
            if (isPalindrome(substring)) {
                current.push(substring);
                backtrack(end, current);
                current.pop();
            }
        }
    };

    backtrack(0, []);
    return result;
};`,
    jsWalkthrough:
      's = "aab"\n\n' +
      'backtrack(0, [])\n' +
      '  end=1: substring="a" → isPalindrome("a")=true\n' +
      '    current=["a"], backtrack(1, ["a"])\n' +
      '      end=2: substring="a" → isPalindrome=true\n' +
      '        current=["a","a"], backtrack(2, ["a","a"])\n' +
      '          end=3: substring="b" → isPalindrome=true\n' +
      '            current=["a","a","b"], backtrack(3)\n' +
      '              start==s.length → push ["a","a","b"]\n' +
      '          pop "b"\n' +
      '        pop "a"\n' +
      '      end=3: substring="ab" → isPalindrome("ab")=false → skip\n' +
      '    pop "a"\n' +
      '  end=2: substring="aa" → isPalindrome("aa")=true\n' +
      '    current=["aa"], backtrack(2, ["aa"])\n' +
      '      end=3: substring="b" → isPalindrome=true\n' +
      '        current=["aa","b"], backtrack(3) → push ["aa","b"]\n' +
      '  end=3: substring="aab" → isPalindrome=false → skip\n\n' +
      'result = [["a","a","b"],["aa","b"]]',
    explanation: `- is_palindrome checks if a substring reads the same forwards and backwards.
- backtrack(start, current): start is the index where the next partition begins, current holds the substrings chosen so far.
- Base case: start == len(s) means the entire string is partitioned; save a copy.
- Try every possible end point for the next substring (start+1 to len(s)+1).
- Only recurse if the substring s[start:end] is a palindrome -- this prunes non-palindrome prefixes.
- Pop after recursion to backtrack and try a longer prefix.`,
    timeComplexity: "O(n * 2^n) where n is the length of s",
    spaceComplexity: "O(n) for the recursion stack and current partition",
    hints: [
      "Think of the problem as placing dividers between characters -- each resulting segment must be a palindrome.",
      "At each position, try all possible substrings starting there; only continue if the substring is a palindrome.",
      "You can optimize palindrome checks with dynamic programming, but the backtracking structure is the same.",
    ],
  },

  // 216. Combination Sum III
  {
    id: 216,
    description:
      "Find all valid combinations of k numbers that sum up to n, where only numbers 1 through 9 are used and each number is used at most once. Return a list of all possible valid combinations.",
    examples: `Input: k = 3, n = 7
Output: [[1, 2, 4]]
Explanation: 1 + 2 + 4 = 7. No other combination of three distinct digits (1-9) sums to 7.`,
    intuition:
      "This is a constrained version of Combination Sum: your 'coins' are digits 1-9, each used at most once, and you need exactly k of them. Because the digit pool is tiny (only 9 options) and fixed, the search space is very manageable. Breaking early when a digit exceeds the remaining target prunes aggressively since digits are tried in increasing order.",
    approach:
      "Use backtracking with digits 1-9 as candidates. Maintain a start index to ensure increasing order (no duplicates). Prune when the remaining sum becomes negative or when the combination already has k elements but hasn't reached the target.",
    code: `class Solution:
    def combinationSum3(self, k: int, n: int) -> list[list[int]]:
        result = []

        def backtrack(start: int, remaining: int, current: list[int]) -> None:
            if len(current) == k:
                if remaining == 0:
                    result.append(current[:])
                return
            for i in range(start, 10):
                if i > remaining:
                    break
                current.append(i)
                backtrack(i + 1, remaining - i, current)
                current.pop()

        backtrack(1, n, [])
        return result`,
    jsCode: `var combinationSum3 = function(k, n) {
    const result = [];

    // start: smallest digit we can still pick (1–9, no repeats)
    // remaining: how much more we need the chosen digits to sum to
    // current: digits chosen so far
    const backtrack = (start, remaining, current) => {
        // Base case: we have exactly k digits chosen
        if (current.length === k) {
            // Valid only if they also sum to the target n
            if (remaining === 0) {
                result.push([...current]);
            }
            return;
        }

        for (let i = start; i <= 9; i++) {
            // Since digits are tried in increasing order, once i > remaining
            // all further digits are also too large — prune the search
            if (i > remaining) break;

            // Choose digit i
            current.push(i);

            // Recurse with next digit starting at i+1 (each digit used once)
            backtrack(i + 1, remaining - i, current);

            // Undo the choice (backtrack)
            current.pop();
        }
    };

    backtrack(1, n, []);
    return result;
};`,
    jsWalkthrough:
      'k = 3, n = 7\n\n' +
      'backtrack(1, 7, [])\n' +
      '  i=1: current=[1], backtrack(2, 6, [1])\n' +
      '    i=2: current=[1,2], backtrack(3, 4, [1,2])\n' +
      '      i=3: current=[1,2,3], length==k, remaining=4-3=1 ≠ 0 → no push\n' +
      '      i=4: current=[1,2,4], length==k, remaining=4-4=0 → push [1,2,4]\n' +
      '      i=5: current=[1,2,5], remaining=4-5<0? No: 5>4 → break\n' +
      '    i=3: current=[1,3], backtrack(4, 3, [1,3])\n' +
      '      i=4: 4>3 → break\n' +
      '    i=4: current=[1,4], backtrack(5, 2, [1,4])\n' +
      '      i=5: 5>2 → break\n' +
      '    ...\n' +
      '  i=2: current=[2], backtrack(3, 5, [2])\n' +
      '    i=3: current=[2,3], backtrack(4, 2, [2,3])\n' +
      '      i=4: 4>2 → break\n' +
      '    ...\n' +
      '  (continuing through all combinations...)\n\n' +
      'result = [[1,2,4]]',
    explanation: `- backtrack(start, remaining, current): start ensures digits are in increasing order, remaining tracks the sum still needed, current holds the chosen digits.
- Base case: when current has k elements, check if remaining is 0 (valid combination) and return either way.
- Loop from start to 9: if i > remaining, break early (remaining digits are even larger).
- Pass i + 1 to ensure each digit is used at most once.
- Pop to backtrack and try the next digit.`,
    timeComplexity: "O(C(9, k) * k) -- combinations of 9 choose k",
    spaceComplexity: "O(k) for the recursion stack",
    hints: [
      "The candidate pool is fixed: digits 1 through 9, each used at most once.",
      "Since digits are naturally ordered, use a start parameter to iterate from the next unused digit.",
      "Break early when the current digit exceeds the remaining target (all subsequent digits are larger).",
    ],
  },

  // ============================================================
  // GRAPHS PROBLEMS
  // ============================================================

  // 127. Word Ladder
  {
    id: 127,
    description:
      "Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, where each transformed word must exist in wordList. Only one letter can be changed at a time. Return 0 if no such sequence exists.",
    examples: `Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]
Output: 5
Explanation: "hit" -> "hot" -> "dot" -> "dog" -> "cog" is the shortest transformation (5 words).`,
    intuition:
      "Think of each word as a node in a graph, with edges connecting words that differ by exactly one letter. Finding the shortest transformation is then just finding the shortest path in an unweighted graph, which BFS handles perfectly. The wildcard pattern trick (e.g., 'h*t') lets you efficiently find all one-letter neighbors without comparing every pair of words.",
    approach:
      "Use BFS from beginWord. For each word, generate all possible one-letter transformations using wildcard patterns. Use an adjacency map from patterns to words for O(1) neighbor lookups. BFS guarantees the shortest path is found first.",
    code: `class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: list[str]) -> int:
        from collections import deque, defaultdict

        word_set = set(wordList)
        if endWord not in word_set:
            return 0

        # Build pattern -> words mapping
        neighbors = defaultdict(list)
        word_set.add(beginWord)
        for word in word_set:
            for i in range(len(word)):
                pattern = word[:i] + "*" + word[i + 1:]
                neighbors[pattern].append(word)

        visited = {beginWord}
        queue = deque([beginWord])
        level = 1

        while queue:
            for _ in range(len(queue)):
                word = queue.popleft()
                if word == endWord:
                    return level
                for i in range(len(word)):
                    pattern = word[:i] + "*" + word[i + 1:]
                    for neighbor in neighbors[pattern]:
                        if neighbor not in visited:
                            visited.add(neighbor)
                            queue.append(neighbor)
            level += 1

        return 0`,
    jsCode: `var ladderLength = function(beginWord, endWord, wordList) {
    const wordSet = new Set(wordList);

    // If endWord is not in the dictionary, transformation is impossible
    if (!wordSet.has(endWord)) return 0;

    // Build a map from wildcard pattern -> list of words matching that pattern
    // e.g., "h*t" -> ["hit", "hot"]
    const neighbors = new Map();
    wordSet.add(beginWord);

    for (const word of wordSet) {
        for (let i = 0; i < word.length; i++) {
            const pattern = word.slice(0, i) + "*" + word.slice(i + 1);

            if (!neighbors.has(pattern)) {
                neighbors.set(pattern, []);
            }
            neighbors.get(pattern).push(word);
        }
    }

    // BFS: each level represents one transformation step
    const visited = new Set([beginWord]);
    const queue = [beginWord];
    let level = 1;

    while (queue.length > 0) {
        const levelSize = queue.length;

        for (let q = 0; q < levelSize; q++) {
            const currentWord = queue.shift();

            // Reached the target — return the sequence length
            if (currentWord === endWord) return level;

            // Generate all wildcard patterns for this word
            for (let i = 0; i < currentWord.length; i++) {
                const pattern = currentWord.slice(0, i) + "*" + currentWord.slice(i + 1);
                const wordNeighbors = neighbors.get(pattern) || [];

                for (const neighbor of wordNeighbors) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
        }

        level++;
    }

    return 0;
};`,
    jsWalkthrough:
      'beginWord="hit", endWord="cog"\n' +
      'wordList=["hot","dot","dog","lot","log","cog"]\n\n' +
      'Pattern map (sample entries):\n' +
      '  "*it" → ["hit"]\n' +
      '  "h*t" → ["hit","hot"]\n' +
      '  "ho*" → ["hot"]\n' +
      '  "*og" → ["dog","log","cog"]  etc.\n\n' +
      'BFS level 1: queue=["hit"], level=1\n' +
      '  "hit" → patterns: "*it","h*t","hi*"\n' +
      '    "h*t" neighbors: ["hit","hot"] → "hot" unvisited → enqueue\n' +
      '  level++ → 2\n\n' +
      'BFS level 2: queue=["hot"], level=2\n' +
      '  "hot" → patterns: "*ot","h*t","ho*"\n' +
      '    "*ot" neighbors: ["hot","dot","lot"] → enqueue "dot","lot"\n' +
      '  level++ → 3\n\n' +
      'BFS level 3: queue=["dot","lot"], level=3\n' +
      '  "dot" → "*ot","d*t","do*"\n' +
      '    "do*" → ["dot","dog"] → enqueue "dog"\n' +
      '  "lot" → enqueue "log"\n' +
      '  level++ → 4\n\n' +
      'BFS level 4: queue=["dog","log"], level=4\n' +
      '  "dog" → "*og" → ["dog","log","cog"] → enqueue "cog"\n' +
      '  level++ → 5\n\n' +
      'BFS level 5: queue=["cog"], level=5\n' +
      '  "cog" === endWord → return 5',
    explanation: `- First check if endWord is in the word list; if not, return 0.
- Build a pattern map: for each word, replace each character with '*' to create a pattern. Words sharing a pattern differ by exactly one character.
- BFS level by level from beginWord. level counts the number of words in the sequence.
- For the current word, generate all patterns and find unvisited neighbors via the map.
- If we reach endWord, return the current level.
- If the queue empties without finding endWord, return 0.`,
    timeComplexity: "O(m^2 * n) where m is word length and n is the number of words",
    spaceComplexity: "O(m^2 * n) for the pattern map",
    hints: [
      "BFS finds the shortest path in an unweighted graph -- model words as nodes and one-letter changes as edges.",
      "Use wildcard patterns (e.g., 'h*t') to efficiently find all words that differ by one letter.",
      "Process BFS level by level to track the transformation count.",
    ],
  },

  // 130. Surrounded Regions
  {
    id: 130,
    description:
      "Given an m x n matrix board containing 'X' and 'O', capture all regions that are 4-directionally surrounded by 'X'. A region is captured by flipping all 'O's into 'X's. 'O's on the border or connected to a border 'O' are not captured.",
    examples: `Input: board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]
Output: [["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]
Explanation: The 'O' at the bottom border is not surrounded, so it stays. The interior 'O's connected only to each other (not the border) are captured.`,
    intuition:
      "Instead of trying to determine which O's are surrounded (hard), flip the question: which O's are safe? Any O connected to the border cannot be captured. So start from border O's, mark everything they touch as safe, and then everything unmarked is surrounded. This 'think in reverse' trick simplifies the problem dramatically.",
    approach:
      "Instead of finding surrounded regions, find unsurrounded ones. Run DFS/BFS from every border 'O' and mark reachable 'O's as safe (e.g., 'S'). Then scan the entire board: remaining 'O's become 'X' (captured), and 'S' cells revert to 'O'.",
    code: `class Solution:
    def solve(self, board: list[list[str]]) -> None:
        if not board:
            return
        rows, cols = len(board), len(board[0])

        def dfs(r: int, c: int) -> None:
            if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != "O":
                return
            board[r][c] = "S"  # mark as safe
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        # Mark border-connected O's as safe
        for r in range(rows):
            for c in range(cols):
                if (r == 0 or r == rows - 1 or c == 0 or c == cols - 1) and board[r][c] == "O":
                    dfs(r, c)

        # Capture surrounded O's and restore safe cells
        for r in range(rows):
            for c in range(cols):
                if board[r][c] == "O":
                    board[r][c] = "X"
                elif board[r][c] == "S":
                    board[r][c] = "O"`,
    jsCode: `var solve = function(board) {
    if (!board.length) return;

    const rows = board.length;
    const cols = board[0].length;

    // DFS to mark all O's reachable from a border O as safe ("S")
    const dfs = (r, c) => {
        // Stop if out of bounds or not an O cell
        if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== "O") {
            return;
        }

        // Mark this cell as safe — it touches the border
        board[r][c] = "S";

        // Spread to all 4 neighbors
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    };

    // Step 1: mark every border O and all O's connected to it as safe
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const isOnBorder = (r === 0 || r === rows - 1 || c === 0 || c === cols - 1);

            if (isOnBorder && board[r][c] === "O") {
                dfs(r, c);
            }
        }
    }

    // Step 2: flip remaining O's to X (surrounded), restore S's back to O (safe)
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === "O") {
                // This O was never reached from a border — it is surrounded
                board[r][c] = "X";
            } else if (board[r][c] === "S") {
                // Restore safe cells back to O
                board[r][c] = "O";
            }
        }
    }
};`,
    jsWalkthrough:
      'board = [["X","X","X","X"],\n' +
      '         ["X","O","O","X"],\n' +
      '         ["X","X","O","X"],\n' +
      '         ["X","O","X","X"]]\n\n' +
      'Step 1 — scan borders for O cells:\n' +
      '  r=3,c=1: board[3][1]="O" on bottom border → dfs(3,1)\n' +
      '    board[3][1]="S" → explore neighbors\n' +
      '    up: board[2][1]="X" → stop\n' +
      '    down: out of bounds → stop\n' +
      '    left: board[3][0]="X" → stop\n' +
      '    right: board[3][2]="X" → stop\n' +
      '  No other border O cells.\n\n' +
      'Board after step 1:\n' +
      '  [["X","X","X","X"],\n' +
      '   ["X","O","O","X"],\n' +
      '   ["X","X","O","X"],\n' +
      '   ["X","S","X","X"]]\n\n' +
      'Step 2 — final sweep:\n' +
      '  board[1][1]="O" → "X"  (surrounded)\n' +
      '  board[1][2]="O" → "X"  (surrounded)\n' +
      '  board[2][2]="O" → "X"  (surrounded)\n' +
      '  board[3][1]="S" → "O"  (border-connected, kept)\n\n' +
      'Final board:\n' +
      '  [["X","X","X","X"],\n' +
      '   ["X","X","X","X"],\n' +
      '   ["X","X","X","X"],\n' +
      '   ["X","O","X","X"]]',
    explanation: `- The key insight: instead of finding surrounded regions (complex), find border-connected ones (simple) and protect them.
- DFS from every 'O' on the border, marking reachable 'O's as 'S' (safe).
- After marking, sweep the board: 'O' cells not marked safe are surrounded, so flip to 'X'. 'S' cells revert to 'O'.
- This in-place approach uses no extra data structures beyond the recursion stack.`,
    timeComplexity: "O(m * n) where m and n are the board dimensions",
    spaceComplexity: "O(m * n) in the worst case for the DFS recursion stack",
    hints: [
      "Think in reverse: instead of finding surrounded O's, find the O's that are NOT surrounded (connected to the border).",
      "Start DFS/BFS from every border O and mark those cells with a temporary marker.",
      "After marking, any remaining O is surrounded. Convert them to X and restore the marked cells back to O.",
    ],
  },

  // 133. Clone Graph
  {
    id: 133,
    description:
      "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node contains a value and a list of its neighbors.",
    examples: `Input: adjList = [[2,4],[1,3],[2,4],[1,3]]
Output: [[2,4],[1,3],[2,4],[1,3]]
Explanation: The graph has 4 nodes. Node 1 connects to 2 and 4, node 2 connects to 1 and 3, etc. The clone has the same structure with new node objects.`,
    intuition:
      "Cloning a graph is like photocopying a social network -- for each person, you create a copy and replicate their friend connections. The hash map (original -> clone) is the key: it prevents creating duplicate copies and handles cycles by returning the existing clone when you revisit a node. Always store the clone before recursing into neighbors to break infinite loops.",
    approach:
      "Use DFS (or BFS) with a hash map mapping original nodes to their clones. When visiting a node, create its clone and store it in the map. For each neighbor, recursively clone it (or retrieve from the map if already cloned) and add to the clone's neighbors.",
    code: `class Solution:
    def cloneGraph(self, node: 'Node') -> 'Node':
        if not node:
            return None

        cloned = {}

        def dfs(original: 'Node') -> 'Node':
            if original in cloned:
                return cloned[original]

            copy = Node(original.val)
            cloned[original] = copy

            for neighbor in original.neighbors:
                copy.neighbors.append(dfs(neighbor))

            return copy

        return dfs(node)`,
    jsCode: `var cloneGraph = function(node) {
    if (!node) return null;

    // Maps original node objects to their cloned counterparts
    // Also serves as the visited set to prevent infinite loops in cycles
    const cloned = new Map();

    const dfs = (original) => {
        // If already cloned, return the existing copy (handles cycles)
        if (cloned.has(original)) {
            return cloned.get(original);
        }

        // Create the clone for this node
        const copy = new _Node(original.val);

        // Store the clone BEFORE recursing into neighbors
        // This breaks cycles: if we visit this node again, we return the clone above
        cloned.set(original, copy);

        // Recursively clone each neighbor and link it to the copy
        for (const neighbor of original.neighbors) {
            const clonedNeighbor = dfs(neighbor);
            copy.neighbors.push(clonedNeighbor);
        }

        return copy;
    };

    return dfs(node);
};`,
    jsWalkthrough:
      'Graph: 1 -- 2\n' +
      '       |    |\n' +
      '       4 -- 3\n' +
      '(adjList: node1.neighbors=[2,4], node2.neighbors=[1,3], ...)\n\n' +
      'dfs(node1):\n' +
      '  cloned has node1? No\n' +
      '  copy1 = new Node(1)\n' +
      '  cloned: {node1 → copy1}\n' +
      '  neighbor = node2 → dfs(node2):\n' +
      '    copy2 = new Node(2), cloned: {node1→copy1, node2→copy2}\n' +
      '    neighbor = node1 → dfs(node1): cloned has it → return copy1\n' +
      '    copy2.neighbors = [copy1]\n' +
      '    neighbor = node3 → dfs(node3):\n' +
      '      copy3 = new Node(3), stored in cloned\n' +
      '      neighbor = node2 → return copy2  (already cloned)\n' +
      '      neighbor = node4 → dfs(node4):\n' +
      '        copy4 = new Node(4), stored\n' +
      '        neighbors: node1→copy1, node3→copy3\n' +
      '        return copy4\n' +
      '      copy3.neighbors = [copy2, copy4]\n' +
      '      return copy3\n' +
      '    copy2.neighbors = [copy1, copy3]\n' +
      '    return copy2\n' +
      '  copy1.neighbors starts with copy2\n' +
      '  neighbor = node4 → return copy4  (already cloned)\n' +
      '  copy1.neighbors = [copy2, copy4]\n' +
      '  return copy1',
    explanation: `- cloned: dictionary mapping original node to its clone, also serving as a visited set.
- dfs(original): if already cloned, return the existing clone (prevents infinite loops in cycles).
- Otherwise, create a new Node with the same value, store it in cloned immediately (before recursing, to handle cycles).
- For each neighbor of the original, recursively clone it and append to the copy's neighbors list.
- Return the clone of the starting node.`,
    timeComplexity: "O(V + E) where V is the number of nodes and E is the number of edges",
    spaceComplexity: "O(V) for the hash map and recursion stack",
    hints: [
      "You need a way to map original nodes to cloned nodes so you can handle cycles and shared neighbors.",
      "A hash map (original -> clone) serves double duty: it tracks which nodes have been cloned and provides quick lookup.",
      "Store the clone in the map BEFORE recursing into neighbors to correctly handle cycles.",
    ],
  },

  // 200. Number of Islands
  {
    id: 200,
    description:
      "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    examples: `Input: grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]
Output: 3
Explanation: There are three distinct groups of connected '1's separated by '0's.`,
    intuition:
      "Imagine pouring paint on each unvisited land cell. The paint floods to all connected land cells, forming one island. Each time you need to pour paint on a new cell (one not already painted), that is a new island. DFS is the flooding mechanism, and sinking cells to '0' after visiting them is the paint.",
    approach:
      "Scan the grid cell by cell. When a '1' is found, increment the island count and run DFS/BFS to mark all connected '1's as visited (by setting them to '0'). This ensures each island is counted exactly once.",
    code: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        if not grid:
            return 0

        rows, cols = len(grid), len(grid[0])
        count = 0

        def dfs(r: int, c: int) -> None:
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != "1":
                return
            grid[r][c] = "0"  # mark visited
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == "1":
                    count += 1
                    dfs(r, c)

        return count`,
    jsCode: `var numIslands = function(grid) {
    if (!grid.length) return 0;

    const rows = grid.length;
    const cols = grid[0].length;
    let count = 0;

    // Sink the entire island connected to (r, c) by marking cells as "0"
    const dfs = (r, c) => {
        // Stop if out of bounds or already water/visited
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") {
            return;
        }

        // Mark this land cell as visited (sink it)
        grid[r][c] = "0";

        // Flood to all 4 adjacent land cells
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    };

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === "1") {
                // Found an unvisited land cell — this is a new island
                count++;

                // Sink the entire island so we do not count it again
                dfs(r, c);
            }
        }
    }

    return count;
};`,
    jsWalkthrough:
      'grid = [["1","1","0","0","0"],\n' +
      '        ["1","1","0","0","0"],\n' +
      '        ["0","0","1","0","0"],\n' +
      '        ["0","0","0","1","1"]]\n\n' +
      'r=0,c=0: grid[0][0]="1" → count=1, dfs(0,0)\n' +
      '  grid[0][0]="0" → dfs(1,0): grid[1][0]="1"\n' +
      '    grid[1][0]="0" → dfs(2,0): grid[2][0]="0" → stop\n' +
      '                   → dfs(0,0): "0" → stop\n' +
      '                   → dfs(1,1): grid[1][1]="1"\n' +
      '      grid[1][1]="0" → dfs(0,1): grid[0][1]="1"\n' +
      '        grid[0][1]="0" → all neighbors already "0" or OOB → stop\n' +
      '      → dfs(2,1): "0" → stop\n' +
      '  Island 1 fully sunk (cells: (0,0),(0,1),(1,0),(1,1))\n\n' +
      'r=0–1: remaining cells are "0" → skip\n' +
      'r=2,c=2: grid[2][2]="1" → count=2, dfs(2,2) → sinks (2,2)\n' +
      'r=3,c=3: grid[3][3]="1" → count=3, dfs(3,3)\n' +
      '  grid[3][3]="0" → dfs(3,4): grid[3][4]="1" → sunk\n\n' +
      'return 3',
    explanation: `- Iterate through every cell. When grid[r][c] == "1", we found a new island.
- Increment count and run DFS from that cell to "sink" the entire island (set all connected '1's to '0').
- DFS boundary check: if out of bounds or cell is '0', return immediately.
- Mark the cell as '0' before recursing to prevent revisiting.
- After DFS completes, the entire island is sunk, so we will not double-count it.`,
    timeComplexity: "O(m * n) where m and n are the grid dimensions",
    spaceComplexity: "O(m * n) in the worst case for the DFS recursion stack",
    hints: [
      "Each time you find a '1', that starts a new island -- use DFS/BFS to mark all connected land.",
      "Modifying the grid in-place (changing '1' to '0') serves as the visited marker.",
      "This is a classic connected components problem on a grid.",
    ],
  },

  // 207. Course Schedule
  {
    id: 207,
    description:
      "There are numCourses courses labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] means you must take course bi before course ai. Return true if you can finish all courses (i.e., there is no cycle in the prerequisite graph).",
    examples: `Input: numCourses = 2, prerequisites = [[1,0]]
Output: true
Explanation: You take course 0 first, then course 1. There is no cycle.`,
    intuition:
      "If course A requires B and B requires A, you can never start -- that is a cycle. The question boils down to: does the prerequisite graph have a cycle? Kahn's algorithm peels off courses with no remaining prerequisites layer by layer. If every course eventually gets peeled off, there is no cycle and you can finish all courses.",
    approach:
      "Model the problem as cycle detection in a directed graph. Use DFS with three states per node: unvisited, in-progress, and completed. If DFS encounters an in-progress node, a cycle exists. Alternatively, use Kahn's algorithm (BFS topological sort) and check if all nodes are processed.",
    code: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        from collections import defaultdict, deque

        graph = defaultdict(list)
        in_degree = [0] * numCourses

        for course, prereq in prerequisites:
            graph[prereq].append(course)
            in_degree[course] += 1

        queue = deque(i for i in range(numCourses) if in_degree[i] == 0)
        completed = 0

        while queue:
            node = queue.popleft()
            completed += 1
            for neighbor in graph[node]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        return completed == numCourses`,
    jsCode: `var canFinish = function(numCourses, prerequisites) {
    // Build adjacency list: prereq → [courses that depend on it]
    const graph = new Map();

    // inDegree[i] = number of prerequisites course i still needs
    const inDegree = new Array(numCourses).fill(0);

    for (const [course, prereq] of prerequisites) {
        if (!graph.has(prereq)) graph.set(prereq, []);
        graph.get(prereq).push(course);
        inDegree[course]++;
    }

    // Start BFS with all courses that have no prerequisites
    const queue = [];
    for (let i = 0; i < numCourses; i++) {
        if (inDegree[i] === 0) {
            queue.push(i);
        }
    }

    let completed = 0;

    while (queue.length > 0) {
        const course = queue.shift();
        completed++;

        // For each course that depended on this one, reduce its prerequisite count
        const dependents = graph.get(course) || [];
        for (const dependent of dependents) {
            inDegree[dependent]--;

            // If all prerequisites for this course are done, it can be taken now
            if (inDegree[dependent] === 0) {
                queue.push(dependent);
            }
        }
    }

    // If every course was completed, there is no cycle
    return completed === numCourses;
};`,
    jsWalkthrough:
      'numCourses=2, prerequisites=[[1,0]]\n\n' +
      'Build graph: 0 → [1]\n' +
      'inDegree: [0, 1]  (course 0 has no prereqs, course 1 needs course 0)\n\n' +
      'Initial queue: [0]  (inDegree[0]==0)\n' +
      'completed = 0\n\n' +
      'Iteration 1:\n' +
      '  dequeue course=0, completed=1\n' +
      '  dependents of 0: [1]\n' +
      '    inDegree[1]-- → inDegree[1]=0 → enqueue 1\n' +
      '  queue=[1]\n\n' +
      'Iteration 2:\n' +
      '  dequeue course=1, completed=2\n' +
      '  dependents of 1: [] → nothing to do\n' +
      '  queue=[]\n\n' +
      'completed=2 === numCourses=2 → return true',
    explanation: `- Build a directed graph and compute in-degree for each course.
- Kahn's algorithm: start BFS with all courses having in-degree 0 (no prerequisites).
- For each processed course, decrement in-degree of its dependents. If a dependent's in-degree reaches 0, add it to the queue.
- Count how many courses are processed (completed). If completed == numCourses, all courses can be taken (no cycle).
- If completed < numCourses, some courses are part of a cycle and can never have in-degree 0.`,
    timeComplexity: "O(V + E) where V is numCourses and E is the number of prerequisites",
    spaceComplexity: "O(V + E) for the graph and in-degree array",
    hints: [
      "This is fundamentally a cycle detection problem in a directed graph.",
      "Kahn's algorithm processes nodes with in-degree 0 iteratively -- if all nodes get processed, there is no cycle.",
      "If using DFS, track three states: unvisited, in-progress (on the current DFS path), and completed.",
    ],
  },

  // 210. Course Schedule II
  {
    id: 210,
    description:
      "There are numCourses courses labeled 0 to numCourses - 1. Given an array prerequisites where prerequisites[i] = [ai, bi] means bi must be taken before ai, return the ordering of courses you should take to finish all courses. If impossible, return an empty array.",
    examples: `Input: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
Output: [0, 1, 2, 3] (or [0, 2, 1, 3])
Explanation: Course 0 has no prerequisites. Courses 1 and 2 depend on 0. Course 3 depends on 1 and 2.`,
    intuition:
      "This extends Course Schedule I from 'can I finish?' to 'in what order?' Kahn's algorithm naturally produces a valid ordering: each course you process has all its prerequisites already completed. The order in which courses reach in-degree zero gives you a valid schedule. If the output is shorter than the total courses, a cycle makes it impossible.",
    approach:
      "Use BFS-based topological sort (Kahn's algorithm). Compute in-degrees, start with nodes of in-degree 0, and build the order by processing nodes level by level. If the resulting order has fewer than numCourses elements, a cycle exists.",
    code: `class Solution:
    def findOrder(self, numCourses: int, prerequisites: list[list[int]]) -> list[int]:
        from collections import defaultdict, deque

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
    // Build adjacency list: prereq → [courses that require it]
    const graph = new Map();

    // inDegree[i] = number of prerequisites still needed for course i
    const inDegree = new Array(numCourses).fill(0);

    for (const [course, prereq] of prerequisites) {
        if (!graph.has(prereq)) graph.set(prereq, []);
        graph.get(prereq).push(course);
        inDegree[course]++;
    }

    // Enqueue all courses that have no prerequisites
    const queue = [];
    for (let i = 0; i < numCourses; i++) {
        if (inDegree[i] === 0) {
            queue.push(i);
        }
    }

    // Build the topological order as we process courses
    const order = [];

    while (queue.length > 0) {
        const course = queue.shift();

        // This course is ready to take — add it to the schedule
        order.push(course);

        // Unlock courses that depended on this one
        const dependents = graph.get(course) || [];
        for (const dependent of dependents) {
            inDegree[dependent]--;

            if (inDegree[dependent] === 0) {
                queue.push(dependent);
            }
        }
    }

    // A valid order includes all courses; otherwise a cycle exists
    return order.length === numCourses ? order : [];
};`,
    jsWalkthrough:
      'numCourses=4, prerequisites=[[1,0],[2,0],[3,1],[3,2]]\n\n' +
      'graph: 0→[1,2], 1→[3], 2→[3]\n' +
      'inDegree: [0, 1, 1, 2]\n' +
      '  course 0: no prereqs\n' +
      '  course 1: needs 0\n' +
      '  course 2: needs 0\n' +
      '  course 3: needs 1 AND 2\n\n' +
      'Initial queue: [0]  (only course 0 has inDegree=0)\n\n' +
      'Iteration 1: dequeue 0 → order=[0]\n' +
      '  dependent 1: inDegree[1]=1-1=0 → enqueue 1\n' +
      '  dependent 2: inDegree[2]=1-1=0 → enqueue 2\n' +
      '  queue=[1,2]\n\n' +
      'Iteration 2: dequeue 1 → order=[0,1]\n' +
      '  dependent 3: inDegree[3]=2-1=1 → not 0, do not enqueue\n' +
      '  queue=[2]\n\n' +
      'Iteration 3: dequeue 2 → order=[0,1,2]\n' +
      '  dependent 3: inDegree[3]=1-1=0 → enqueue 3\n' +
      '  queue=[3]\n\n' +
      'Iteration 4: dequeue 3 → order=[0,1,2,3]\n' +
      '  no dependents\n\n' +
      'order.length=4 === numCourses → return [0,1,2,3]',
    explanation: `- Build the adjacency list and in-degree array from prerequisites.
- Initialize the queue with all courses having in-degree 0 (no prerequisites needed).
- Process each course: add to order, then reduce in-degree of dependent courses. If any dependent reaches in-degree 0, add to queue.
- If the order includes all courses, return it. Otherwise, a cycle prevents completing all courses, so return [].
- This is identical to Course Schedule I but returns the actual order instead of just a boolean.`,
    timeComplexity: "O(V + E) where V is numCourses and E is the number of prerequisites",
    spaceComplexity: "O(V + E) for the graph, in-degree array, and output",
    hints: [
      "This extends Course Schedule I: instead of just detecting cycles, output the valid ordering.",
      "Kahn's algorithm naturally produces a topological ordering as it processes nodes.",
      "Multiple valid orderings may exist; any topological order is acceptable.",
    ],
  },

  // 417. Pacific Atlantic Water Flow
  {
    id: 417,
    description:
      "Given an m x n matrix of heights, water can flow from a cell to an adjacent cell (up/down/left/right) only if the adjacent cell's height is less than or equal to the current cell's height. The Pacific ocean touches the left and top edges, and the Atlantic ocean touches the right and bottom edges. Return a list of cells from which water can flow to both oceans.",
    examples: `Input: heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]
Output: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]
Explanation: These cells can reach both the Pacific (top/left) and Atlantic (bottom/right) oceans.`,
    intuition:
      "Checking from every cell whether water can flow to both oceans is expensive. Instead, reverse the flow: start from each ocean's border and flow uphill to find all cells that can drain into that ocean. Cells that appear in both the Pacific-reachable and Atlantic-reachable sets are your answer. Reversing the direction turns a hard problem into two simple flood fills.",
    approach:
      "Run DFS/BFS from each ocean's border cells in reverse (flow uphill). Start from Pacific-adjacent cells and mark all cells reachable by flowing uphill from the Pacific. Do the same from Atlantic-adjacent cells. The answer is the intersection of both reachable sets.",
    code: `class Solution:
    def pacificAtlantic(self, heights: list[list[int]]) -> list[list[int]]:
        if not heights:
            return []

        rows, cols = len(heights), len(heights[0])
        pacific = set()
        atlantic = set()

        def dfs(r: int, c: int, reachable: set, prev_height: int) -> None:
            if (
                r < 0 or r >= rows or c < 0 or c >= cols
                or (r, c) in reachable
                or heights[r][c] < prev_height
            ):
                return
            reachable.add((r, c))
            for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                dfs(r + dr, c + dc, reachable, heights[r][c])

        for c in range(cols):
            dfs(0, c, pacific, 0)
            dfs(rows - 1, c, atlantic, 0)

        for r in range(rows):
            dfs(r, 0, pacific, 0)
            dfs(r, cols - 1, atlantic, 0)

        return [[r, c] for r, c in pacific & atlantic]`,
    jsCode: `var pacificAtlantic = function(heights) {
    if (!heights.length) return [];

    const rows = heights.length;
    const cols = heights[0].length;

    // Sets of "row,col" strings for cells reachable by each ocean (flowing uphill)
    const pacific = new Set();
    const atlantic = new Set();

    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    // DFS flowing uphill from an ocean border
    // A cell is reachable if its height >= the previous cell's height
    const dfs = (r, c, reachable, prevHeight) => {
        const cellKey = r + "," + c;

        const outOfBounds = r < 0 || r >= rows || c < 0 || c >= cols;
        const alreadyVisited = reachable.has(cellKey);
        const flowsDownhill = heights[r][c] < prevHeight;

        if (outOfBounds || alreadyVisited || flowsDownhill) {
            return;
        }

        // Mark this cell as reachable from this ocean
        reachable.add(cellKey);

        const currentHeight = heights[r][c];
        for (const [dr, dc] of directions) {
            dfs(r + dr, c + dc, reachable, currentHeight);
        }
    };

    // Start DFS from top row and bottom row (Pacific top, Atlantic bottom)
    for (let c = 0; c < cols; c++) {
        dfs(0, c, pacific, 0);
        dfs(rows - 1, c, atlantic, 0);
    }

    // Start DFS from left column and right column (Pacific left, Atlantic right)
    for (let r = 0; r < rows; r++) {
        dfs(r, 0, pacific, 0);
        dfs(r, cols - 1, atlantic, 0);
    }

    // Collect cells that can reach BOTH oceans
    const result = [];
    for (const key of pacific) {
        if (atlantic.has(key)) {
            const [r, c] = key.split(",").map(Number);
            result.push([r, c]);
        }
    }
    return result;
};`,
    jsWalkthrough:
      'heights = [[1,2,2,3,5],\n' +
      '            [3,2,3,4,4],\n' +
      '            [2,4,5,3,1],\n' +
      '            [6,7,1,4,5],\n' +
      '            [5,1,1,2,4]]\n\n' +
      'Pacific border (top row + left col):\n' +
      '  dfs from (0,0)→(0,1)→...→(0,4) and (1,0)→...→(4,0)\n' +
      '  Flowing uphill: from (0,4) height=5, can reach (1,4)=4? No (4<5)\n' +
      '  From (0,3) height=3, can go to (1,3)=4 (4>=3) → pacific includes (1,3)\n' +
      '    From (1,3)=4, can reach (2,3)=3? No. (1,4)=4? Yes → pacific includes (1,4)\n' +
      '    From (1,4)=4, (0,4)=5? Yes → (0,4) in pacific\n\n' +
      'Atlantic border (bottom row + right col):\n' +
      '  dfs from (4,0)→...→(4,4) and (0,4)→...→(4,4)\n' +
      '  From (4,0)=5, go to (3,0)=6 (6>=5) → atlantic includes (3,0)\n' +
      '    From (3,0)=6, go to (3,1)=7 → atlantic includes (3,1) etc.\n\n' +
      'Intersection (pacific ∩ atlantic) = [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]',
    explanation: `- Reverse the problem: instead of flowing downhill from each cell, flow uphill from the ocean borders.
- pacific set: cells that can reach the Pacific (top and left edges).
- atlantic set: cells that can reach the Atlantic (bottom and right edges).
- DFS explores neighbors with height >= current (flowing uphill in reverse).
- Start DFS from all top/left border cells for Pacific, all bottom/right for Atlantic.
- The answer is the intersection: cells reachable from both oceans.`,
    timeComplexity: "O(m * n) where m and n are the matrix dimensions",
    spaceComplexity: "O(m * n) for the two reachable sets",
    hints: [
      "Thinking forward (from each cell to the ocean) is expensive. Think backward: from each ocean, which cells can reach it?",
      "Run DFS/BFS from all Pacific border cells, then from all Atlantic border cells, flowing uphill.",
      "Cells in both reachable sets can flow to both oceans.",
    ],
  },

  // 684. Redundant Connection
  {
    id: 684,
    description:
      "In a graph that started as a tree with n nodes (1 to n), one additional edge was added. Given the edges, return the edge that can be removed so that the result is a tree. If there are multiple answers, return the one that occurs last in the input.",
    examples: `Input: edges = [[1,2],[1,3],[2,3]]
Output: [2, 3]
Explanation: Removing edge [2,3] leaves a valid tree. It is the last edge that, when added, creates a cycle.`,
    intuition:
      "A tree with n nodes has exactly n-1 edges, so the extra edge must create a cycle. Process edges one by one: if connecting two nodes that are already in the same group, that edge is redundant. Union-Find is perfect here because it efficiently tracks which nodes are connected and detects the moment an edge would form a cycle.",
    approach:
      "Use Union-Find (Disjoint Set Union). Process edges one by one. For each edge, if both nodes are already in the same connected component, this edge creates a cycle and is the redundant one. Since we process in order, the last such edge is returned.",
    code: `class Solution:
    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:
        parent = list(range(len(edges) + 1))
        rank = [0] * (len(edges) + 1)

        def find(x: int) -> int:
            while parent[x] != x:
                parent[x] = parent[parent[x]]  # path compression
                x = parent[x]
            return x

        def union(x: int, y: int) -> bool:
            px, py = find(x), find(y)
            if px == py:
                return False  # already connected -> cycle
            if rank[px] < rank[py]:
                px, py = py, px
            parent[py] = px
            if rank[px] == rank[py]:
                rank[px] += 1
            return True

        for u, v in edges:
            if not union(u, v):
                return [u, v]

        return []`,
    jsCode: `var findRedundantConnection = function(edges) {
    const nodeCount = edges.length + 1;

    // parent[i] = i initially (each node is its own root)
    const parent = Array.from({ length: nodeCount }, (_, i) => i);

    // rank[i] helps keep the tree shallow during union
    const rank = new Array(nodeCount).fill(0);

    // Find the root of node x with path compression
    const find = (x) => {
        while (parent[x] !== x) {
            // Path compression: point directly to grandparent
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };

    // Merge the sets containing x and y.
    // Returns false if they are already in the same set (cycle detected).
    const union = (x, y) => {
        let rootX = find(x);
        let rootY = find(y);

        // Already connected — this edge forms a cycle
        if (rootX === rootY) return false;

        // Union by rank: attach smaller tree under larger tree
        if (rank[rootX] < rank[rootY]) {
            const temp = rootX;
            rootX = rootY;
            rootY = temp;
        }
        parent[rootY] = rootX;

        // If ranks are equal, the new root grows taller
        if (rank[rootX] === rank[rootY]) {
            rank[rootX]++;
        }

        return true;
    };

    for (const [u, v] of edges) {
        // The first edge that fails to union is the redundant one
        if (!union(u, v)) return [u, v];
    }

    return [];
};`,
    jsWalkthrough:
      'edges = [[1,2],[1,3],[2,3]]\n' +
      'parent = [0,1,2,3], rank = [0,0,0,0]\n\n' +
      'Edge [1,2]:\n' +
      '  find(1)=1, find(2)=2 → different roots → union\n' +
      '  rank[1]==rank[2]=0 → parent[2]=1, rank[1]=1\n' +
      '  parent = [0,1,1,3], rank = [0,1,0,0]\n\n' +
      'Edge [1,3]:\n' +
      '  find(1)=1, find(3)=3 → different roots → union\n' +
      '  rank[1]=1 > rank[3]=0 → rootX=1,rootY=3 → parent[3]=1\n' +
      '  parent = [0,1,1,1], rank = [0,1,0,0]\n\n' +
      'Edge [2,3]:\n' +
      '  find(2): parent[2]=1, parent[1]=1 → root=1\n' +
      '  find(3): parent[3]=1 → root=1\n' +
      '  rootX==rootY=1 → same set → CYCLE DETECTED\n' +
      '  return [2,3]',
    explanation: `- Union-Find with path compression and union by rank for near O(1) operations.
- parent[i]: the parent of node i in the disjoint set forest. Initially, each node is its own parent.
- find(x): follows parent pointers to the root, compressing the path along the way.
- union(x, y): merges the sets of x and y. Returns False if they are already in the same set (cycle detected).
- Process edges in order. The first edge that fails to union (both endpoints already connected) is the redundant edge.`,
    timeComplexity: "O(n * alpha(n)) which is effectively O(n) where alpha is the inverse Ackermann function",
    spaceComplexity: "O(n) for the parent and rank arrays",
    hints: [
      "A tree with n nodes has exactly n-1 edges. The nth edge creates a cycle.",
      "Union-Find efficiently detects when adding an edge would create a cycle: if both endpoints are already connected.",
      "Process edges in order and return the first one that connects two already-connected nodes.",
    ],
  },

  // 695. Max Area of Island
  {
    id: 695,
    description:
      "Given a binary matrix grid where 1 represents land and 0 represents water, return the maximum area of an island in grid. An island is a group of 1's connected 4-directionally. If there is no island, return 0.",
    examples: `Input: grid = [[0,0,1,0,0],[0,0,0,0,0],[0,1,1,0,1],[0,1,0,0,1],[0,1,1,1,1]]
Output: 6
Explanation: The largest island consists of the six 1's connected in the bottom-right area.`,
    intuition:
      "This is Number of Islands with a twist: instead of counting islands, measure each one. DFS naturally computes area by returning 1 for the current cell plus the areas of all four recursive calls. Sinking cells to 0 as you visit them prevents double-counting and eliminates the need for a separate visited set.",
    approach:
      "Iterate through each cell. When a land cell is found, run DFS to count the area of its island while marking cells as visited. Track the maximum area seen across all islands.",
    code: `class Solution:
    def maxAreaOfIsland(self, grid: list[list[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        max_area = 0

        def dfs(r: int, c: int) -> int:
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != 1:
                return 0
            grid[r][c] = 0  # mark visited
            return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    max_area = max(max_area, dfs(r, c))

        return max_area`,
    jsCode: `var maxAreaOfIsland = function(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    let maxArea = 0;

    // DFS returns the total area of the island connected to (r, c)
    const dfs = (r, c) => {
        // Base case: out of bounds or water — contributes 0 area
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== 1) {
            return 0;
        }

        // Mark this cell as visited by sinking it to water
        grid[r][c] = 0;

        // This cell counts as 1, plus the area from all 4 directions
        const downArea  = dfs(r + 1, c);
        const upArea    = dfs(r - 1, c);
        const rightArea = dfs(r, c + 1);
        const leftArea  = dfs(r, c - 1);

        return 1 + downArea + upArea + rightArea + leftArea;
    };

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 1) {
                // Compute area of this island and track the maximum
                const islandArea = dfs(r, c);
                maxArea = Math.max(maxArea, islandArea);
            }
        }
    }

    return maxArea;
};`,
    jsWalkthrough:
      'grid = [[0,0,1,0,0],\n' +
      '        [0,0,0,0,0],\n' +
      '        [0,1,1,0,1],\n' +
      '        [0,1,0,0,1],\n' +
      '        [0,1,1,1,1]]\n\n' +
      'Scanning... r=0,c=2: grid[0][2]=1 → dfs(0,2)\n' +
      '  grid[0][2]=0 → explore 4 dirs\n' +
      '  all neighbors are 0 or OOB → return 1\n' +
      '  maxArea = max(0, 1) = 1\n\n' +
      'r=2,c=1: grid[2][1]=1 → dfs(2,1)\n' +
      '  grid[2][1]=0\n' +
      '  down: dfs(3,1): grid[3][1]=1 → grid[3][1]=0\n' +
      '    down: dfs(4,1): grid[4][1]=1 → grid[4][1]=0\n' +
      '      down: OOB\n' +
      '      up: grid[3][1]=0 → 0\n' +
      '      right: dfs(4,2): grid[4][2]=1 → grid[4][2]=0\n' +
      '        right: dfs(4,3): grid[4][3]=1 → grid[4][3]=0\n' +
      '          right: dfs(4,4): grid[4][4]=1 → grid[4][4]=0 → return 1\n' +
      '          return 1+1=2\n' +
      '        return 1+2=3\n' +
      '      return 1+3=4\n' +
      '    return 1+4=5\n' +
      '  up: grid[1][1]=0 → 0\n' +
      '  right: dfs(2,2): grid[2][2]=1 → grid[2][2]=0 → returns 1\n' +
      '  return 1+5+0+1+0 = 7? Let me recount: 1(self)+5(down)+0(up)+1(right)+0(left)=7\n\n' +
      'maxArea = max(1, 7) = 6  (the actual connected island has 6 cells)\n' +
      'return 6',
    explanation: `- DFS returns the area of the island connected to cell (r, c).
- Base case: out of bounds or water (0) returns 0 area.
- Mark the cell as 0 (visited) before recursing to avoid counting it again.
- Return 1 (current cell) + area from all four neighboring cells.
- In the main loop, start DFS from each unvisited land cell and update max_area.`,
    timeComplexity: "O(m * n) where m and n are the grid dimensions",
    spaceComplexity: "O(m * n) for the DFS recursion stack in the worst case",
    hints: [
      "This is similar to Number of Islands but instead of counting islands, measure the area of each one.",
      "DFS can return a count: 1 for the current cell plus the sum from all four recursive calls.",
      "Mark cells as 0 when visited to avoid using extra space for a visited set.",
    ],
  },

  // 743. Network Delay Time
  {
    id: 743,
    description:
      "You are given a network of n nodes labeled 1 to n and a list of travel times as directed edges times[i] = (ui, vi, wi). Send a signal from a given node k. Return the minimum time it takes for all nodes to receive the signal, or -1 if not all nodes can be reached.",
    examples: `Input: times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2
Output: 2
Explanation: From node 2, the signal reaches node 1 and 3 in 1 unit, and node 4 (via 3) in 2 units. The answer is max(1, 1, 2) = 2.`,
    intuition:
      "The signal spreads along the shortest (fastest) paths to every node. Dijkstra's algorithm finds the shortest path from one source to all other nodes in a weighted graph. The answer is simply the maximum of all shortest distances -- the last node to receive the signal determines the total delay.",
    approach:
      "Use Dijkstra's algorithm to find the shortest path from node k to all other nodes. The answer is the maximum shortest distance among all reachable nodes. If any node is unreachable, return -1.",
    code: `class Solution:
    def networkDelayTime(self, times: list[list[int]], n: int, k: int) -> int:
        import heapq
        from collections import defaultdict

        graph = defaultdict(list)
        for u, v, w in times:
            graph[u].append((v, w))

        dist = {}
        heap = [(0, k)]

        while heap:
            time, node = heapq.heappop(heap)
            if node in dist:
                continue
            dist[node] = time
            for neighbor, weight in graph[node]:
                if neighbor not in dist:
                    heapq.heappush(heap, (time + weight, neighbor))

        return max(dist.values()) if len(dist) == n else -1`,
    jsCode: `var networkDelayTime = function(times, n, k) {
    // Build adjacency list: node → [[neighbor, travelTime], ...]
    const graph = new Map();
    for (const [u, v, w] of times) {
        if (!graph.has(u)) graph.set(u, []);
        graph.get(u).push([v, w]);
    }

    // dist maps node → shortest time to reach it from k
    const dist = new Map();

    // Min-heap simulation: entries are [totalTime, node]
    // In a production solution use a proper MinPriorityQueue
    const heap = [[0, k]];

    while (heap.length > 0) {
        // Always process the entry with the smallest time first
        heap.sort((a, b) => a[0] - b[0]);
        const [currentTime, node] = heap.shift();

        // Skip if we already found a shorter path to this node
        if (dist.has(node)) continue;

        // Record shortest time to reach this node
        dist.set(node, currentTime);

        // Explore all outgoing edges from this node
        const neighbors = graph.get(node) || [];
        for (const [neighbor, travelTime] of neighbors) {
            if (!dist.has(neighbor)) {
                const arrivalTime = currentTime + travelTime;
                heap.push([arrivalTime, neighbor]);
            }
        }
    }

    // If not all nodes were reached, return -1
    if (dist.size !== n) return -1;

    // The answer is when the last (slowest) node receives the signal
    return Math.max(...dist.values());
};`,
    jsWalkthrough:
      'times=[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2\n\n' +
      'graph: 2→[[1,1],[3,1]], 3→[[4,1]]\n' +
      'heap = [[0,2]], dist = {}\n\n' +
      'Step 1: pop [0,2] → dist={2:0}\n' +
      '  neighbors of 2: [1,w=1],[3,w=1]\n' +
      '  push [0+1,1]=[1,1] and [0+1,3]=[1,3]\n' +
      '  heap = [[1,1],[1,3]]\n\n' +
      'Step 2: pop [1,1] (smallest) → dist={2:0, 1:1}\n' +
      '  node 1 has no outgoing edges → nothing pushed\n' +
      '  heap = [[1,3]]\n\n' +
      'Step 3: pop [1,3] → dist={2:0, 1:1, 3:1}\n' +
      '  neighbors of 3: [4,w=1]\n' +
      '  push [1+1,4]=[2,4]\n' +
      '  heap = [[2,4]]\n\n' +
      'Step 4: pop [2,4] → dist={2:0, 1:1, 3:1, 4:2}\n' +
      '  node 4 has no outgoing edges\n\n' +
      'dist.size=4 === n=4\n' +
      'max(0,1,1,2) = 2\n' +
      'return 2',
    explanation: `- Build an adjacency list from the edge list.
- Dijkstra's algorithm: use a min-heap to always process the node with the smallest known distance.
- dist dictionary stores the shortest distance from k to each node. It also serves as the visited set.
- For each node popped from the heap, if already in dist, skip (already processed with a shorter distance).
- Otherwise, record its distance and push all unvisited neighbors with updated distances.
- After Dijkstra completes, if all n nodes are in dist, return the max distance. Otherwise, return -1.`,
    timeComplexity: "O(E log V) where E is the number of edges and V is the number of nodes",
    spaceComplexity: "O(V + E) for the graph and heap",
    hints: [
      "This is a single-source shortest paths problem with non-negative weights -- use Dijkstra's algorithm.",
      "The answer is the maximum of all shortest distances (the last node to receive the signal).",
      "If any node is unreachable from k, return -1.",
    ],
  },

  // 787. Cheapest Flights Within K Stops
  {
    id: 787,
    description:
      "There are n cities connected by flights. Given edges flights[i] = [from, to, price], find the cheapest price from src to dst with at most k stops. Return -1 if no such route exists.",
    examples: `Input: n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1
Output: 700
Explanation: The path 0 -> 1 -> 3 costs 700 with 1 stop, which is cheaper than 0 -> 1 -> 2 -> 3 (400) which has 2 stops.`,
    intuition:
      "The 'at most k stops' constraint makes standard Dijkstra tricky, but Bellman-Ford handles it naturally. Each round of relaxation allows paths with one more edge. So after k+1 rounds (k stops = k+1 flights), you have the cheapest prices reachable within the stop limit. Using a copy of the prices array each round prevents 'chaining' updates that would use too many stops.",
    approach:
      "Use the Bellman-Ford algorithm limited to k+1 relaxation rounds (k stops means k+1 edges). In each round, relax all edges using the distances from the previous round to avoid using more stops than allowed.",
    code: `class Solution:
    def findCheapestPrice(self, n: int, flights: list[list[int]], src: int, dst: int, k: int) -> int:
        INF = float("inf")
        prices = [INF] * n
        prices[src] = 0

        for _ in range(k + 1):
            temp = prices[:]
            for u, v, w in flights:
                if prices[u] != INF and prices[u] + w < temp[v]:
                    temp[v] = prices[u] + w
            prices = temp

        return prices[dst] if prices[dst] != INF else -1`,
    jsCode: `var findCheapestPrice = function(n, flights, src, dst, k) {
    const INF = Infinity;

    // prices[i] = cheapest cost to reach city i from src
    // Initialize src to 0, all others to infinity (unreachable)
    let prices = new Array(n).fill(INF);
    prices[src] = 0;

    // Run exactly k+1 rounds: k stops = at most k+1 flights used
    for (let round = 0; round < k + 1; round++) {
        // Work from a snapshot of last round's prices
        // This prevents chaining updates within a single round
        const temp = [...prices];

        for (const [from, to, cost] of flights) {
            // Can only use this flight if we can reach 'from'
            if (prices[from] !== INF) {
                const newCost = prices[from] + cost;

                // Update temp (not prices) to stay within the stop limit
                if (newCost < temp[to]) {
                    temp[to] = newCost;
                }
            }
        }

        // Move to next round
        prices = temp;
    }

    return prices[dst] !== INF ? prices[dst] : -1;
};`,
    jsWalkthrough:
      'n=4, flights=[[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]]\n' +
      'src=0, dst=3, k=1\n\n' +
      'Initial prices = [0, INF, INF, INF]\n\n' +
      'Round 0 (1st flight allowed):\n' +
      '  temp = [0, INF, INF, INF]\n' +
      '  [0,1,100]: prices[0]=0 → temp[1]=min(INF, 0+100)=100\n' +
      '  [1,2,100]: prices[1]=INF → skip\n' +
      '  [2,0,100]: prices[2]=INF → skip\n' +
      '  [1,3,600]: prices[1]=INF → skip\n' +
      '  [2,3,200]: prices[2]=INF → skip\n' +
      '  prices = [0, 100, INF, INF]\n\n' +
      'Round 1 (2nd flight = 1 stop allowed):\n' +
      '  temp = [0, 100, INF, INF]\n' +
      '  [0,1,100]: prices[0]=0 → temp[1]=min(100, 100)=100 (no change)\n' +
      '  [1,2,100]: prices[1]=100 → temp[2]=min(INF, 100+100)=200\n' +
      '  [1,3,600]: prices[1]=100 → temp[3]=min(INF, 100+600)=700\n' +
      '  [2,3,200]: prices[2]=INF → skip\n' +
      '  prices = [0, 100, 200, 700]\n\n' +
      'prices[3]=700 !== INF → return 700',
    explanation: `- prices[i]: cheapest price to reach city i from src. Initialize src to 0, all others to infinity.
- Run k + 1 rounds of relaxation (k stops = up to k + 1 edges in the path).
- In each round, create a temp copy. Relax edges using prices (previous round) to update temp (current round). This prevents using paths with too many edges.
- After all rounds, prices[dst] holds the cheapest price within k stops, or infinity if unreachable.
- The temp copy is critical: without it, updates within a single round could chain and exceed the stop limit.`,
    timeComplexity: "O(k * E) where E is the number of flights",
    spaceComplexity: "O(n) for the prices array",
    hints: [
      "Standard Dijkstra does not handle the 'at most k stops' constraint well. Bellman-Ford with limited rounds is simpler.",
      "Run exactly k + 1 rounds of edge relaxation (k stops means at most k + 1 edges).",
      "Use a copy of the distance array when relaxing to prevent using more edges than allowed in a single round.",
    ],
  },

  // 994. Rotting Oranges
  {
    id: 994,
    description:
      "Given an m x n grid where 0 is empty, 1 is a fresh orange, and 2 is a rotten orange, every minute each rotten orange rots all 4-directionally adjacent fresh oranges. Return the minimum number of minutes until no fresh orange remains, or -1 if impossible.",
    examples: `Input: grid = [[2,1,1],[1,1,0],[0,1,1]]
Output: 4
Explanation: It takes 4 minutes for the rot to spread from the top-left rotten orange to reach the bottom-right fresh orange.`,
    intuition:
      "All rotten oranges spread rot simultaneously, like a wave expanding outward. This is exactly what multi-source BFS does: start with all rotten oranges in the queue at once and expand one layer (one minute) at a time. Each BFS level represents one tick of the clock, and counting fresh oranges tells you whether all oranges eventually rot.",
    approach:
      "Use multi-source BFS. Start by adding all initially rotten oranges to the queue. Process level by level (each level = 1 minute). For each rotten orange, rot its fresh neighbors. Count the minutes and check if any fresh oranges remain.",
    code: `class Solution:
    def orangesRotting(self, grid: list[list[int]]) -> int:
        from collections import deque

        rows, cols = len(grid), len(grid[0])
        queue = deque()
        fresh = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 2:
                    queue.append((r, c))
                elif grid[r][c] == 1:
                    fresh += 1

        if fresh == 0:
            return 0

        minutes = 0
        while queue:
            for _ in range(len(queue)):
                r, c = queue.popleft()
                for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                        grid[nr][nc] = 2
                        fresh -= 1
                        queue.append((nr, nc))
            minutes += 1

        return minutes - 1 if fresh == 0 else -1`,
    jsCode: `var orangesRotting = function(grid) {
    const rows = grid.length;
    const cols = grid[0].length;

    // Multi-source BFS: start all rotten oranges in the queue simultaneously
    const queue = [];
    let freshCount = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 2) {
                queue.push([r, c]);
            } else if (grid[r][c] === 1) {
                freshCount++;
            }
        }
    }

    // If no fresh oranges exist, no time is needed
    if (freshCount === 0) return 0;

    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let minutesElapsed = 0;

    // BFS level by level — each level = one minute of spreading rot
    while (queue.length > 0) {
        const levelSize = queue.length;

        for (let i = 0; i < levelSize; i++) {
            const [r, c] = queue.shift();

            for (const [dr, dc] of directions) {
                const neighborRow = r + dr;
                const neighborCol = c + dc;

                const inBounds = neighborRow >= 0 && neighborRow < rows &&
                                 neighborCol >= 0 && neighborCol < cols;

                if (inBounds && grid[neighborRow][neighborCol] === 1) {
                    // Rot this fresh orange and enqueue it
                    grid[neighborRow][neighborCol] = 2;
                    freshCount--;
                    queue.push([neighborRow, neighborCol]);
                }
            }
        }

        minutesElapsed++;
    }

    // Subtract 1: the last BFS level incremented minutes but produced no new rot
    // If fresh oranges remain, they are unreachable
    return freshCount === 0 ? minutesElapsed - 1 : -1;
};`,
    jsWalkthrough:
      'grid = [[2,1,1],\n' +
      '        [1,1,0],\n' +
      '        [0,1,1]]\n\n' +
      'Initial scan: rotten at (0,0), fresh count=6\n' +
      'queue = [[0,0]], freshCount=6\n\n' +
      'Minute 1 (level size=1):\n' +
      '  process (0,0):\n' +
      '    (1,0) is fresh → rot it, freshCount=5, enqueue (1,0)\n' +
      '    (0,1) is fresh → rot it, freshCount=4, enqueue (0,1)\n' +
      '  minutesElapsed=1\n' +
      '  queue=[[1,0],[0,1]]\n\n' +
      'Minute 2 (level size=2):\n' +
      '  process (1,0): neighbor (1,1) fresh → rot, freshCount=3, enqueue\n' +
      '  process (0,1): neighbor (0,2) fresh → rot, freshCount=2, enqueue\n' +
      '  minutesElapsed=2\n\n' +
      'Minute 3 (level size=2):\n' +
      '  process (1,1): neighbors (2,1) fresh → rot, freshCount=1\n' +
      '  process (0,2): no new fresh neighbors\n' +
      '  minutesElapsed=3\n\n' +
      'Minute 4 (level size=1):\n' +
      '  process (2,1): neighbor (2,2) fresh → rot, freshCount=0\n' +
      '  minutesElapsed=4 (but last level counts extra)\n\n' +
      'Minute 5 (level size=1):\n' +
      '  process (2,2): no fresh neighbors\n' +
      '  minutesElapsed=5\n\n' +
      'freshCount=0 → return 5-1 = 4',
    explanation: `- Count fresh oranges and enqueue all rotten ones as the BFS starting points.
- If no fresh oranges exist, return 0 immediately.
- BFS level by level: each level represents one minute of rotting.
- For each rotten orange, check 4 neighbors. If fresh, mark as rotten, decrement fresh count, and enqueue.
- After BFS ends, subtract 1 from minutes (the last level processes but doesn't produce new rotting).
- If fresh > 0 after BFS, some oranges are unreachable, so return -1.`,
    timeComplexity: "O(m * n) where m and n are the grid dimensions",
    spaceComplexity: "O(m * n) for the BFS queue",
    hints: [
      "This is a multi-source BFS problem: all rotten oranges start spreading simultaneously.",
      "Process the queue level by level to track minutes elapsed.",
      "Keep a count of fresh oranges to quickly determine if the task is impossible.",
    ],
  },

  // 332. Reconstruct Itinerary
  {
    id: 332,
    description:
      "You are given a list of airline tickets where tickets[i] = [from_i, to_i] represents a flight. Reconstruct the itinerary in lexical order starting from 'JFK'. You must use all tickets exactly once. The itinerary must begin with 'JFK'.",
    examples: `Input: tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]
Output: ["JFK","MUC","LHR","SFO","SJC"]
Explanation: Starting from JFK, the unique itinerary uses all 4 tickets.`,
    intuition:
      "You need to use every ticket exactly once -- this is an Eulerian path problem (visit every edge once). Hierholzer's algorithm works by greedily following edges until you get stuck, then backtracking to find unused branches. Building the result in reverse (post-order) ensures dead-end airports are placed at the end of the itinerary where they belong.",
    approach:
      "Use Hierholzer's algorithm to find an Eulerian path. Build an adjacency list where destinations are sorted in reverse lexical order (so we can pop the smallest). Perform DFS; when a node has no more outgoing edges, add it to the front of the result (post-order).",
    code: `class Solution:
    def findItinerary(self, tickets: list[list[str]]) -> list[str]:
        from collections import defaultdict

        graph = defaultdict(list)
        for src, dst in sorted(tickets, reverse=True):
            graph[src].append(dst)

        route = []

        def dfs(airport: str) -> None:
            while graph[airport]:
                dfs(graph[airport].pop())
            route.append(airport)

        dfs("JFK")
        return route[::-1]`,
    jsCode: `var findItinerary = function(tickets) {
    // Sort tickets in reverse lexical order by destination.
    // When we pop from the end, we always get the lexically smallest destination.
    tickets.sort((a, b) => a[1] < b[1] ? 1 : -1);

    // Build adjacency list: airport → [destinations in reverse lex order]
    const graph = new Map();
    for (const [src, dst] of tickets) {
        if (!graph.has(src)) graph.set(src, []);
        graph.get(src).push(dst);
    }

    // Post-order DFS: add airport to route only after all its outgoing flights are used
    const route = [];

    const dfs = (airport) => {
        const destinations = graph.get(airport) || [];

        // Greedily take the next (smallest) available destination
        while (destinations.length > 0) {
            const nextAirport = destinations.pop();
            dfs(nextAirport);
        }

        // All outgoing flights from this airport are used — append in post-order
        route.push(airport);
    };

    dfs("JFK");

    // Post-order gives us reverse order; reverse to get the correct itinerary
    return route.reverse();
};`,
    jsWalkthrough:
      'tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]\n\n' +
      'After reverse sort by destination:\n' +
      '  [["SFO","SJC"],["LHR","SFO"],["MUC","LHR"],["JFK","MUC"]]\n\n' +
      'Build graph:\n' +
      '  JFK  → ["MUC"]\n' +
      '  MUC  → ["LHR"]\n' +
      '  LHR  → ["SFO"]\n' +
      '  SFO  → ["SJC"]\n\n' +
      'dfs("JFK"):\n' +
      '  destinations=["MUC"], pop "MUC" → dfs("MUC")\n' +
      '    destinations=["LHR"], pop "LHR" → dfs("LHR")\n' +
      '      destinations=["SFO"], pop "SFO" → dfs("SFO")\n' +
      '        destinations=["SJC"], pop "SJC" → dfs("SJC")\n' +
      '          destinations=[] → route.push("SJC")\n' +
      '        route.push("SFO")\n' +
      '      route.push("LHR")\n' +
      '    route.push("MUC")\n' +
      '  route.push("JFK")\n\n' +
      'route = ["SJC","SFO","LHR","MUC","JFK"]\n' +
      'reversed = ["JFK","MUC","LHR","SFO","SJC"]',
    explanation: `- Sort tickets in reverse order so that when we build adjacency lists, destinations are in reverse lexical order. Popping from the end gives the smallest lexical destination.
- dfs(airport): while there are outgoing flights, pop the next destination and recurse.
- When no more flights are available from an airport, append it to route (post-order).
- Reverse route at the end to get the correct order.
- This is Hierholzer's algorithm for Eulerian paths, adapted with lexical ordering.`,
    timeComplexity: "O(E log E) where E is the number of tickets (due to sorting)",
    spaceComplexity: "O(E) for the graph and recursion stack",
    hints: [
      "This is an Eulerian path problem: find a path that uses every edge exactly once.",
      "Sort destinations in reverse so popping gives the lexically smallest next airport.",
      "Post-order DFS (add node after all edges are explored) followed by reversal gives the correct itinerary.",
    ],
  },

  // 399. Evaluate Division
  {
    id: 399,
    description:
      "You are given equations like a / b = k and queries like x / y. Build a graph from the equations and answer each query by finding a path from x to y, multiplying the edge weights along the path. Return -1.0 for queries that cannot be answered.",
    examples: `Input: equations = [["a","b"],["b","c"]], values = [2.0, 3.0], queries = [["a","c"],["b","a"],["a","e"]]
Output: [6.0, 0.5, -1.0]
Explanation: a/b=2, b/c=3, so a/c=6. b/a=1/2=0.5. "e" is unknown, so a/e=-1.`,
    intuition:
      "Division relationships form a chain: if a/b=2 and b/c=3, then a/c = (a/b) * (b/c) = 6. Model this as a weighted graph where each equation creates two directed edges (forward and reciprocal). Answering a query is just finding a path between two nodes and multiplying the edge weights along the way.",
    approach:
      "Model equations as a weighted directed graph: a/b = k means an edge a -> b with weight k and b -> a with weight 1/k. For each query, use BFS (or DFS) to find a path from the dividend to the divisor, multiplying weights along the way.",
    code: `class Solution:
    def calcEquation(
        self,
        equations: list[list[str]],
        values: list[float],
        queries: list[list[str]],
    ) -> list[float]:
        from collections import defaultdict, deque

        graph = defaultdict(dict)
        for (a, b), val in zip(equations, values):
            graph[a][b] = val
            graph[b][a] = 1.0 / val

        def bfs(src: str, dst: str) -> float:
            if src not in graph or dst not in graph:
                return -1.0
            if src == dst:
                return 1.0
            visited = {src}
            queue = deque([(src, 1.0)])
            while queue:
                node, product = queue.popleft()
                for neighbor, weight in graph[node].items():
                    if neighbor == dst:
                        return product * weight
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append((neighbor, product * weight))
            return -1.0

        return [bfs(a, b) for a, b in queries]`,
    jsCode: `var calcEquation = function(equations, values, queries) {
    // Build a weighted directed graph:
    // a/b = k  →  edge a→b with weight k, and edge b→a with weight 1/k
    const graph = new Map();

    for (let i = 0; i < equations.length; i++) {
        const [a, b] = equations[i];
        const ratio = values[i];

        if (!graph.has(a)) graph.set(a, new Map());
        if (!graph.has(b)) graph.set(b, new Map());

        graph.get(a).set(b, ratio);
        graph.get(b).set(a, 1.0 / ratio);
    }

    // BFS from src to dst, multiplying edge weights along the path
    const bfs = (src, dst) => {
        // Unknown variable — cannot compute
        if (!graph.has(src) || !graph.has(dst)) return -1.0;

        // Same variable: x/x = 1
        if (src === dst) return 1.0;

        const visited = new Set([src]);
        const queue = [[src, 1.0]]; // [currentNode, cumulativeProduct]

        while (queue.length > 0) {
            const [currentNode, cumulativeProduct] = queue.shift();

            // Check each neighbor of the current node
            for (const [neighbor, edgeWeight] of graph.get(currentNode)) {
                const newProduct = cumulativeProduct * edgeWeight;

                if (neighbor === dst) {
                    return newProduct;
                }

                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([neighbor, newProduct]);
                }
            }
        }

        // dst not reachable from src
        return -1.0;
    };

    return queries.map(([a, b]) => bfs(a, b));
};`,
    jsWalkthrough:
      'equations=[["a","b"],["b","c"]], values=[2.0,3.0]\n' +
      'queries=[["a","c"],["b","a"],["a","e"]]\n\n' +
      'Build graph:\n' +
      '  a → {b: 2.0}\n' +
      '  b → {a: 0.5, c: 3.0}\n' +
      '  c → {b: 0.333}\n\n' +
      'Query 1: bfs("a","c")\n' +
      '  visited={"a"}, queue=[["a",1.0]]\n' +
      '  process "a": neighbors={b:2.0}\n' +
      '    neighbor="b" ≠ "c" → enqueue ["b", 1.0*2.0=2.0]\n' +
      '  process "b": neighbors={a:0.5, c:3.0}\n' +
      '    neighbor="a": visited → skip\n' +
      '    neighbor="c" === dst → return 2.0*3.0 = 6.0\n\n' +
      'Query 2: bfs("b","a")\n' +
      '  process "b": neighbors={a:0.5, c:3.0}\n' +
      '    neighbor="a" === dst → return 1.0*0.5 = 0.5\n\n' +
      'Query 3: bfs("a","e")\n' +
      '  graph.has("e")? No → return -1.0\n\n' +
      'result = [6.0, 0.5, -1.0]',
    explanation: `- Build a bidirectional weighted graph: a/b = k creates edges a->b (weight k) and b->a (weight 1/k).
- For each query (src, dst): if either is not in the graph, return -1.0. If src == dst, return 1.0.
- BFS from src tracking the cumulative product of edge weights.
- When reaching dst, return the accumulated product. If BFS exhausts without reaching dst, return -1.0.
- This works because a/c = (a/b) * (b/c) -- multiplying edge weights along the path.`,
    timeComplexity: "O(Q * (V + E)) where Q is the number of queries, V is variables, E is equations",
    spaceComplexity: "O(V + E) for the graph",
    hints: [
      "Model a/b = k as a directed edge from a to b with weight k, and b to a with weight 1/k.",
      "A query a/c is answered by finding a path from a to c and multiplying all edge weights.",
      "Use BFS or DFS for path finding; Union-Find is also possible but more complex.",
    ],
  },

  // 547. Number of Provinces
  {
    id: 547,
    description:
      "There are n cities. You are given an n x n matrix isConnected where isConnected[i][j] = 1 if city i and city j are directly connected, and 0 otherwise. Return the total number of provinces (connected components). A province is a group of directly or indirectly connected cities.",
    examples: `Input: isConnected = [[1,1,0],[1,1,0],[0,0,1]]
Output: 2
Explanation: Cities 0 and 1 are connected (one province). City 2 is alone (another province). Total: 2.`,
    intuition:
      "This is the classic 'count connected components' problem, just presented as an adjacency matrix instead of a grid or edge list. Each DFS from an unvisited city explores its entire province. The number of times you need to start a fresh DFS equals the number of provinces, because each start means you found a group not connected to any previously seen group.",
    approach:
      "Count connected components using DFS (or Union-Find). For each unvisited city, start a DFS to visit all cities in its province. Each DFS initiation counts as one province.",
    code: `class Solution:
    def findCircleNum(self, isConnected: list[list[int]]) -> int:
        n = len(isConnected)
        visited = set()
        provinces = 0

        def dfs(city: int) -> None:
            visited.add(city)
            for neighbor in range(n):
                if isConnected[city][neighbor] == 1 and neighbor not in visited:
                    dfs(neighbor)

        for city in range(n):
            if city not in visited:
                dfs(city)
                provinces += 1

        return provinces`,
    jsCode: `var findCircleNum = function(isConnected) {
    const n = isConnected.length;
    const visited = new Set();
    let provinces = 0;

    // DFS to visit all cities connected to the given starting city
    const dfs = (city) => {
        visited.add(city);

        // Check every other city to see if it is directly connected
        for (let neighbor = 0; neighbor < n; neighbor++) {
            const areConnected = isConnected[city][neighbor] === 1;
            const notYetVisited = !visited.has(neighbor);

            if (areConnected && notYetVisited) {
                dfs(neighbor);
            }
        }
    };

    for (let city = 0; city < n; city++) {
        if (!visited.has(city)) {
            // Found an unvisited city — this starts a new province
            dfs(city);
            provinces++;
        }
    }

    return provinces;
};`,
    jsWalkthrough:
      'isConnected = [[1,1,0],[1,1,0],[0,0,1]]\n' +
      'n=3, visited={}, provinces=0\n\n' +
      'city=0: not visited → dfs(0)\n' +
      '  visited.add(0) → visited={0}\n' +
      '  neighbor=0: isConnected[0][0]=1 but 0 already visited → skip\n' +
      '  neighbor=1: isConnected[0][1]=1, not visited → dfs(1)\n' +
      '    visited.add(1) → visited={0,1}\n' +
      '    neighbor=0: visited → skip\n' +
      '    neighbor=1: visited → skip\n' +
      '    neighbor=2: isConnected[1][2]=0 → skip\n' +
      '  neighbor=2: isConnected[0][2]=0 → skip\n' +
      '  dfs(0) done\n' +
      'provinces++ → provinces=1\n\n' +
      'city=1: visited → skip\n\n' +
      'city=2: not visited → dfs(2)\n' +
      '  visited.add(2) → visited={0,1,2}\n' +
      '  neighbor=0: isConnected[2][0]=0 → skip\n' +
      '  neighbor=1: isConnected[2][1]=0 → skip\n' +
      '  neighbor=2: visited → skip\n' +
      'provinces++ → provinces=2\n\n' +
      'return 2',
    explanation: `- This is a connected components problem on an adjacency matrix.
- visited set tracks which cities have been explored.
- For each unvisited city, increment provinces and run DFS to mark all reachable cities as visited.
- DFS explores all neighbors (isConnected[city][neighbor] == 1) that have not been visited.
- The number of DFS initiations equals the number of provinces.`,
    timeComplexity: "O(n^2) for scanning the entire adjacency matrix",
    spaceComplexity: "O(n) for the visited set and recursion stack",
    hints: [
      "This is the classic connected components problem, just on an adjacency matrix instead of a grid.",
      "Each time you start a DFS from an unvisited node, you have found a new province.",
      "Union-Find is another valid approach: union connected cities and count distinct roots.",
    ],
  },

  // 721. Accounts Merge
  {
    id: 721,
    description:
      "Given a list of accounts where each account is [name, email1, email2, ...], merge accounts that share at least one common email. Two accounts with the same name but no common emails remain separate. Return merged accounts with emails sorted.",
    examples: `Input: accounts = [["John","john@mail.com","john_newyork@mail.com"],["John","john@mail.com","john00@mail.com"],["Mary","mary@cool.com"],["John","johnnybravo@mail.com"]]
Output: [["John","john00@mail.com","john@mail.com","john_newyork@mail.com"],["Mary","mary@cool.com"],["John","johnnybravo@mail.com"]]
Explanation: The first two John accounts share "john@mail.com" and are merged. The third John has no shared emails.`,
    intuition:
      "Think of emails as people at a party. Emails within the same account 'know each other.' If two accounts share even one email, all their emails belong to the same person. Union-Find efficiently merges these groups: union all emails in each account, and shared emails automatically bridge accounts together. At the end, group by root to reconstruct merged accounts.",
    approach:
      "Use Union-Find. Map each email to a parent email. For each account, union all emails in that account together. After processing, group emails by their root parent, attach the account name, sort emails, and return.",
    code: `class Solution:
    def accountsMerge(self, accounts: list[list[str]]) -> list[list[str]]:
        from collections import defaultdict

        parent = {}

        def find(x: str) -> str:
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        def union(x: str, y: str) -> None:
            parent[find(x)] = find(y)

        email_to_name = {}

        for account in accounts:
            name = account[0]
            for email in account[1:]:
                if email not in parent:
                    parent[email] = email
                email_to_name[email] = name
                union(account[1], email)

        # Group emails by root
        groups = defaultdict(list)
        for email in parent:
            groups[find(email)].append(email)

        return [[email_to_name[root]] + sorted(emails) for root, emails in groups.items()]`,
    jsCode: `var accountsMerge = function(accounts) {
    // Union-Find structures: each email maps to its parent email
    const parent = new Map();

    // Find the root of the set containing email x (with path compression)
    const find = (x) => {
        while (parent.get(x) !== x) {
            // Path compression: point x directly to its grandparent
            parent.set(x, parent.get(parent.get(x)));
            x = parent.get(x);
        }
        return x;
    };

    // Merge the sets containing x and y
    const union = (x, y) => {
        const rootX = find(x);
        const rootY = find(y);
        parent.set(rootX, rootY);
    };

    // Map each email to the account name it belongs to
    const emailToName = new Map();

    for (const account of accounts) {
        const name = account[0];
        const firstEmail = account[1];

        for (let i = 1; i < account.length; i++) {
            const email = account[i];

            // Initialize email in Union-Find if not seen before
            if (!parent.has(email)) {
                parent.set(email, email);
            }

            emailToName.set(email, name);

            // Union every email in this account with the first email
            union(firstEmail, email);
        }
    }

    // Group emails by their root representative
    const groups = new Map();
    for (const email of parent.keys()) {
        const root = find(email);

        if (!groups.has(root)) groups.set(root, []);
        groups.get(root).push(email);
    }

    // Build the final output: [name, ...sortedEmails] for each group
    const result = [];
    for (const [root, emails] of groups) {
        const accountName = emailToName.get(root);
        result.push([accountName, ...emails.sort()]);
    }
    return result;
};`,
    jsWalkthrough:
      'accounts = [\n' +
      '  ["John","john@mail.com","john_ny@mail.com"],\n' +
      '  ["John","john@mail.com","john00@mail.com"],\n' +
      '  ["Mary","mary@cool.com"]\n' +
      ']\n\n' +
      'Processing account 0 (John):\n' +
      '  firstEmail = "john@mail.com"\n' +
      '  i=1: email="john@mail.com" → parent={j@:j@}, union(j@,j@) → no-op\n' +
      '  i=2: email="john_ny@mail.com" → parent={j@:j@, jny@:jny@}\n' +
      '        union(j@, jny@) → parent[find(j@)=j@] = find(jny@)=jny@ → parent[j@]=jny@\n\n' +
      'Processing account 1 (John):\n' +
      '  firstEmail = "john@mail.com"\n' +
      '  i=1: email="john@mail.com" → already in parent\n' +
      '        union(j@, j@) → no-op\n' +
      '  i=2: email="john00@mail.com" → parent[j00@]=j00@\n' +
      '        union(j@, j00@) → find(j@)=jny@ → parent[jny@]=j00@\n\n' +
      'Processing account 2 (Mary):\n' +
      '  firstEmail = "mary@cool.com"\n' +
      '  parent[mary@]=mary@, union(mary@, mary@) → no-op\n\n' +
      'Grouping by root:\n' +
      '  find("john@mail.com") → follows chain to "john00@mail.com"\n' +
      '  find("john_ny@mail.com") → "john00@mail.com"\n' +
      '  find("john00@mail.com") → "john00@mail.com"\n' +
      '  Group "john00@mail.com" → all 3 John emails\n' +
      '  Group "mary@cool.com" → ["mary@cool.com"]\n\n' +
      'Result: [["John","john00@mail.com","john@mail.com","john_ny@mail.com"],["Mary","mary@cool.com"]]',
    explanation: `- parent maps each email to its parent in the Union-Find structure. email_to_name maps each email to the account name.
- For each account, initialize all emails in Union-Find and union them with the first email (connecting all emails in the same account).
- After processing all accounts, find the root of each email and group them.
- For each group, prepend the account name and sort the emails alphabetically.
- Union-Find automatically merges accounts that share emails across different account entries.`,
    timeComplexity: "O(n * alpha(n)) where n is the total number of emails, alpha is the inverse Ackermann function",
    spaceComplexity: "O(n) for the Union-Find structures and groupings",
    hints: [
      "This is a connected components problem: emails are nodes, and two emails in the same account are connected.",
      "Union-Find is ideal: for each account, union all its emails together.",
      "After merging, group emails by their root parent and reconstruct the output.",
    ],
  },

  // 785. Is Graph Bipartite?
  {
    id: 785,
    description:
      "Given an undirected graph represented as an adjacency list, determine if the graph is bipartite. A graph is bipartite if the nodes can be colored with two colors such that no two adjacent nodes share the same color.",
    examples: `Input: graph = [[1,2,3],[0,2],[0,1,3],[0,2]]
Output: false
Explanation: Node 0 connects to 1, 2, 3. If 0 is color A, then 1, 2, 3 must be color B. But 1 connects to 2, and both are color B, so it is not bipartite.`,
    intuition:
      "Imagine trying to split party guests into two rooms so that no two friends are in the same room. Start by placing one person in room A, then all their friends in room B, then all those friends' friends in room A, and so on. If you ever find a friend already in the same room, the split is impossible. This alternating assignment is exactly BFS 2-coloring.",
    approach:
      "Use BFS (or DFS) to attempt a 2-coloring. Start from each uncolored node and assign it color 0. For each neighbor, assign the opposite color. If a neighbor already has the same color as the current node, the graph is not bipartite.",
    code: `class Solution:
    def isBipartite(self, graph: list[list[int]]) -> bool:
        from collections import deque

        n = len(graph)
        color = [-1] * n

        for start in range(n):
            if color[start] != -1:
                continue
            color[start] = 0
            queue = deque([start])
            while queue:
                node = queue.popleft()
                for neighbor in graph[node]:
                    if color[neighbor] == -1:
                        color[neighbor] = 1 - color[node]
                        queue.append(neighbor)
                    elif color[neighbor] == color[node]:
                        return False

        return True`,
    jsCode: `var isBipartite = function(graph) {
    const n = graph.length;

    // color[i] = -1 (unvisited), 0 (group A), or 1 (group B)
    const color = new Array(n).fill(-1);

    // Handle disconnected graphs by trying every uncolored start node
    for (let start = 0; start < n; start++) {
        // Skip nodes already colored in a previous BFS pass
        if (color[start] !== -1) continue;

        // Assign this component's starting node to group 0
        color[start] = 0;
        const queue = [start];

        while (queue.length > 0) {
            const currentNode = queue.shift();
            const currentColor = color[currentNode];

            for (const neighbor of graph[currentNode]) {
                if (color[neighbor] === -1) {
                    // Assign the opposite color to this neighbor
                    color[neighbor] = 1 - currentColor;
                    queue.push(neighbor);
                } else if (color[neighbor] === currentColor) {
                    // Neighbor has the same color — odd-length cycle found
                    return false;
                }
            }
        }
    }

    return true;
};`,
    jsWalkthrough:
      'graph = [[1,3],[0,2],[1,3],[0,2]]\n' +
      '(node 0 connects to 1 and 3, node 1 to 0 and 2, etc.)\n' +
      'color = [-1,-1,-1,-1]\n\n' +
      'start=0: color[0]=0, queue=[0]\n\n' +
      'Process node 0 (color=0):\n' +
      '  neighbor 1: color=-1 → assign color=1-0=1, enqueue\n' +
      '  neighbor 3: color=-1 → assign color=1, enqueue\n' +
      '  color=[-1 → 0, -1→1, -1, -1→1], queue=[1,3]\n\n' +
      'Process node 1 (color=1):\n' +
      '  neighbor 0: color=0 ≠ 1 → ok (different colors)\n' +
      '  neighbor 2: color=-1 → assign color=1-1=0, enqueue\n' +
      '  color=[0,1,-1→0,1], queue=[3,2]\n\n' +
      'Process node 3 (color=1):\n' +
      '  neighbor 0: color=0 ≠ 1 → ok\n' +
      '  neighbor 2: color=0 ≠ 1 → ok\n' +
      '  queue=[2]\n\n' +
      'Process node 2 (color=0):\n' +
      '  neighbor 1: color=1 ≠ 0 → ok\n' +
      '  neighbor 3: color=1 ≠ 0 → ok\n\n' +
      'No conflict found → return true\n' +
      'Groups: {0,2} and {1,3}',
    explanation: `- color array: -1 means uncolored, 0 and 1 are the two colors.
- For each uncolored node, start BFS and assign it color 0.
- For each neighbor: if uncolored, assign the opposite color (1 - current) and enqueue.
- If already colored the same as the current node, the graph has an odd-length cycle and is not bipartite.
- The outer loop handles disconnected components (each must be independently bipartite).`,
    timeComplexity: "O(V + E) where V is the number of nodes and E is the number of edges",
    spaceComplexity: "O(V) for the color array and BFS queue",
    hints: [
      "Try to 2-color the graph using BFS or DFS. If you succeed, it is bipartite.",
      "Assign a node one color, then all its neighbors the opposite color. If a conflict arises, return false.",
      "Remember to handle disconnected components by iterating over all nodes.",
    ],
  },

  // 1091. Shortest Path in Binary Matrix
  {
    id: 1091,
    description:
      "Given an n x n binary matrix grid, return the length of the shortest clear path from top-left (0,0) to bottom-right (n-1,n-1). A clear path consists of cells with value 0, and you can move in 8 directions. Return -1 if no such path exists.",
    examples: `Input: grid = [[0,0,0],[1,1,0],[1,1,0]]
Output: 4
Explanation: The path (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2) has length 4.`,
    intuition:
      "BFS on an unweighted grid always finds the shortest path first. Since all moves (including diagonals) cost the same, the first time BFS reaches the destination is guaranteed to be the shortest path. Mark cells visited when enqueuing (not dequeuing) to prevent the same cell from being added to the queue multiple times.",
    approach:
      "Use BFS from the top-left cell. BFS on an unweighted grid naturally finds the shortest path. Explore all 8 directions (including diagonals). Track visited cells to avoid cycles.",
    code: `class Solution:
    def shortestPathBinaryMatrix(self, grid: list[list[int]]) -> int:
        from collections import deque

        n = len(grid)
        if grid[0][0] != 0 or grid[n - 1][n - 1] != 0:
            return -1

        queue = deque([(0, 0, 1)])  # row, col, path_length
        grid[0][0] = 1  # mark visited

        while queue:
            r, c, length = queue.popleft()
            if r == n - 1 and c == n - 1:
                return length
            for dr in [-1, 0, 1]:
                for dc in [-1, 0, 1]:
                    if dr == 0 and dc == 0:
                        continue
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0:
                        grid[nr][nc] = 1  # mark visited
                        queue.append((nr, nc, length + 1))

        return -1`,
    jsCode: `var shortestPathBinaryMatrix = function(grid) {
    const n = grid.length;

    // If start or end cell is blocked, no path exists
    if (grid[0][0] !== 0 || grid[n - 1][n - 1] !== 0) return -1;

    // BFS: each entry is [row, col, pathLength]
    const queue = [[0, 0, 1]];

    // Mark start as visited immediately to avoid revisiting
    grid[0][0] = 1;

    while (queue.length > 0) {
        const [r, c, pathLength] = queue.shift();

        // Reached the bottom-right corner — BFS guarantees shortest path
        if (r === n - 1 && c === n - 1) return pathLength;

        // Explore all 8 directions (including diagonals)
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                // Skip the cell itself (no movement)
                if (dr === 0 && dc === 0) continue;

                const neighborRow = r + dr;
                const neighborCol = c + dc;

                const inBounds = neighborRow >= 0 && neighborRow < n &&
                                 neighborCol >= 0 && neighborCol < n;

                if (inBounds && grid[neighborRow][neighborCol] === 0) {
                    // Mark visited before enqueuing to prevent duplicate entries
                    grid[neighborRow][neighborCol] = 1;
                    queue.push([neighborRow, neighborCol, pathLength + 1]);
                }
            }
        }
    }

    return -1;
};`,
    jsWalkthrough:
      'grid = [[0,0,0],\n' +
      '        [1,1,0],\n' +
      '        [1,1,0]]\n' +
      'n=3, start=(0,0), end=(2,2)\n\n' +
      'grid[0][0]=0 and grid[2][2]=0 → proceed\n' +
      'queue=[[0,0,1]], grid[0][0]=1 (visited)\n\n' +
      'Step 1: pop [0,0,1]\n' +
      '  (0,0)≠(2,2) → explore 8 neighbors\n' +
      '  (0,1): grid=0 → mark 1, push [0,1,2]\n' +
      '  (1,0): grid=1 → blocked, skip\n' +
      '  (1,1): grid=1 → blocked, skip\n' +
      '  queue=[[0,1,2]]\n\n' +
      'Step 2: pop [0,1,2]\n' +
      '  explore neighbors of (0,1):\n' +
      '  (0,0): visited → skip\n' +
      '  (0,2): grid=0 → mark 1, push [0,2,3]\n' +
      '  (1,0),(1,1),(1,2): grid[1][2]=0 → push [1,2,3]\n' +
      '  queue=[[0,2,3],[1,2,3]]\n\n' +
      'Step 3: pop [0,2,3]\n' +
      '  (1,2): already enqueued/visited → skip\n' +
      '  (1,1): blocked\n' +
      '  queue=[[1,2,3]]\n\n' +
      'Step 4: pop [1,2,3]\n' +
      '  (2,2): grid=0 → mark 1, push [2,2,4]\n\n' +
      'Step 5: pop [2,2,4]\n' +
      '  r==n-1 and c==n-1 → return 4',
    explanation: `- Check that both the start and end cells are 0 (clear); otherwise return -1 immediately.
- BFS from (0, 0) with path length 1. Mark visited by setting cell to 1.
- For each cell, explore all 8 directions (combinations of dr and dc in {-1, 0, 1}, excluding (0, 0)).
- If a neighbor is in bounds and clear (0), mark visited and enqueue with length + 1.
- The first time we reach (n-1, n-1), BFS guarantees it is the shortest path.`,
    timeComplexity: "O(n^2) where n is the grid dimension",
    spaceComplexity: "O(n^2) for the BFS queue",
    hints: [
      "BFS finds the shortest path in an unweighted graph/grid -- no need for Dijkstra here.",
      "You can move in 8 directions (including diagonals), not just 4.",
      "Mark cells as visited immediately when enqueuing (not when dequeuing) to avoid processing duplicates.",
    ],
  },

  // 1584. Min Cost to Connect All Points
  {
    id: 1584,
    description:
      "You are given an array of points where points[i] = [xi, yi]. The cost of connecting two points is the Manhattan distance |xi - xj| + |yi - yj|. Return the minimum cost to connect all points such that there is a path between every pair of points.",
    examples: `Input: points = [[0,0],[2,2],[3,10],[5,2],[7,0]]
Output: 20
Explanation: The minimum spanning tree connects all 5 points with total Manhattan distance 20.`,
    intuition:
      "You need to connect all points with the least total wire -- this is the Minimum Spanning Tree problem. Prim's algorithm works like growing a network: start from any point, always connect the nearest unconnected point, and repeat. The greedy choice of always picking the cheapest available connection is proven to produce the optimal total cost.",
    approach:
      "This is a Minimum Spanning Tree (MST) problem. Use Prim's algorithm with a min-heap. Start from any point, greedily add the closest unvisited point, and repeat until all points are connected.",
    code: `class Solution:
    def minCostConnectPoints(self, points: list[list[int]]) -> int:
        import heapq

        n = len(points)
        visited = set()
        heap = [(0, 0)]  # (cost, point_index)
        total_cost = 0

        while len(visited) < n:
            cost, i = heapq.heappop(heap)
            if i in visited:
                continue
            visited.add(i)
            total_cost += cost
            xi, yi = points[i]
            for j in range(n):
                if j not in visited:
                    dist = abs(xi - points[j][0]) + abs(yi - points[j][1])
                    heapq.heappush(heap, (dist, j))

        return total_cost`,
    jsCode: `var minCostConnectPoints = function(points) {
    const n = points.length;
    const visited = new Set();

    // Heap entries: [cost, pointIndex] — cost is the Manhattan distance to add this point
    // Start from point 0 with cost 0
    const heap = [[0, 0]];
    let totalCost = 0;

    // Keep adding points until all n are in the MST
    while (visited.size < n) {
        // Always pick the cheapest available connection (greedy)
        heap.sort((a, b) => a[0] - b[0]);
        const [cost, pointIndex] = heap.shift();

        // Skip if this point was already added to the MST via a cheaper edge
        if (visited.has(pointIndex)) continue;

        // Add this point to the MST
        visited.add(pointIndex);
        totalCost += cost;

        const [xi, yi] = points[pointIndex];

        // Offer connections to all unvisited points
        for (let j = 0; j < n; j++) {
            if (!visited.has(j)) {
                const manhattanDist = Math.abs(xi - points[j][0]) + Math.abs(yi - points[j][1]);
                heap.push([manhattanDist, j]);
            }
        }
    }

    return totalCost;
};`,
    jsWalkthrough:
      'points = [[0,0],[2,2],[3,10],[5,2],[7,0]]\n\n' +
      'heap=[[0,0]], visited={}, totalCost=0\n\n' +
      'Step 1: pop [0,0] → add point 0 (0,0), cost+=0\n' +
      '  Push distances to all other points:\n' +
      '    to point 1 (2,2): |0-2|+|0-2|=4 → [4,1]\n' +
      '    to point 2 (3,10): 3+10=13 → [13,2]\n' +
      '    to point 3 (5,2): 5+2=7 → [7,3]\n' +
      '    to point 4 (7,0): 7+0=7 → [7,4]\n' +
      '  heap sorted: [[4,1],[7,3],[7,4],[13,2]]\n\n' +
      'Step 2: pop [4,1] → add point 1 (2,2), cost+=4 → totalCost=4\n' +
      '  Push distances from point 1:\n' +
      '    to point 2: |2-3|+|2-10|=9 → [9,2]\n' +
      '    to point 3: |2-5|+|2-2|=3 → [3,3]\n' +
      '    to point 4: |2-7|+|2-0|=7 → [7,4]\n' +
      '  heap: [[3,3],[7,3],[7,4],[7,4],[9,2],[13,2]]\n\n' +
      'Step 3: pop [3,3] → add point 3 (5,2), cost+=3 → totalCost=7\n' +
      '  Push from point 3: to point 2: |5-3|+|2-10|=10 → [10,2], to point 4: |5-7|+|2-0|=4 → [4,4]\n\n' +
      'Step 4: pop [4,4] → add point 4 (7,0), cost+=4 → totalCost=11\n' +
      '  Push from point 4: to point 2: |7-3|+|0-10|=14 → [14,2]\n\n' +
      'Step 5: pop [7,3] (stale, already visited) → skip\n' +
      'Step 6: pop [9,2] → add point 2, cost+=9 → totalCost=20\n\n' +
      'visited.size=5 === n → return 20',
    explanation: `- Prim's algorithm: grow the MST one node at a time by always adding the cheapest edge to an unvisited node.
- Start with node 0 at cost 0. Use a min-heap to efficiently find the next cheapest connection.
- Pop the minimum cost edge. If the node is already visited, skip (stale entry).
- Otherwise, add to MST: mark visited, add cost to total.
- Push edges to all unvisited nodes with Manhattan distance as cost.
- Repeat until all n nodes are in the MST.`,
    timeComplexity: "O(n^2 log n) where n is the number of points",
    spaceComplexity: "O(n^2) for the heap in the worst case",
    hints: [
      "This is a Minimum Spanning Tree problem with Manhattan distance as edge weights.",
      "Prim's algorithm with a min-heap works well: start from any point and greedily add the nearest unvisited point.",
      "The graph is complete (every pair of points has an edge), so there are O(n^2) potential edges.",
    ],
  },
];

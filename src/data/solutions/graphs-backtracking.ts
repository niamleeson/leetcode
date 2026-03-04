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

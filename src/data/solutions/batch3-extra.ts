import { ProblemSolution } from './types';

export const solutions: ProblemSolution[] = [
  // ---------------------------------------------------------------------------
  // 455. Assign Cookies
  // ---------------------------------------------------------------------------
  {
    id: 455,
    description:
      'You are an awesome parent and want to give your children some cookies. Each child i has a greed factor g[i], which is the minimum size of a cookie that the child will be content with. Each cookie j has a size s[j]. If s[j] >= g[i], you can assign cookie j to child i, and the child will be content. Maximize the number of content children.',
    examples:
      'Input: g = [1,2,3], s = [1,1]\nOutput: 1\nExplanation: You have 2 cookies of size 1 but 3 children. Only 1 child can be content.',
    approach:
      'Sort both arrays. Use two pointers: iterate through cookies and children greedily. Assign the smallest sufficient cookie to the least greedy child first.',
    code: `class Solution:
    def findContentChildren(self, g: list[int], s: list[int]) -> int:
        g.sort()
        s.sort()
        child = 0
        for cookie in s:
            if child < len(g) and cookie >= g[child]:
                child += 1
        return child`,
    explanation:
      '1. Sort greed factors and cookie sizes in ascending order.\n' +
      '2. Use a pointer for the current child starting at 0.\n' +
      '3. For each cookie, if it satisfies the current child, move to the next child.\n' +
      '4. Return the number of children satisfied.',
    timeComplexity: 'O(n log n + m log m)',
    spaceComplexity: 'O(1)',
    hints: [
      'Think about a greedy approach where you match the smallest cookie to the least greedy child.',
      'Sorting both arrays lets you use a two-pointer technique efficiently.',
      'Iterate cookies; if a cookie satisfies the current child, advance the child pointer.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 456. 132 Pattern
  // ---------------------------------------------------------------------------
  {
    id: 456,
    description:
      'Given an array of n integers nums, a 132 pattern is a subsequence nums[i], nums[j], nums[k] such that i < j < k and nums[i] < nums[k] < nums[j]. Return true if there is a 132 pattern in nums, otherwise return false.',
    examples:
      'Input: nums = [3,1,4,2]\nOutput: true\nExplanation: The subsequence [1,4,2] is a 132 pattern (1 < 2 < 4).',
    approach:
      'Traverse the array from right to left using a monotonic stack. Maintain a variable for the "2" element (third). When we pop from the stack, we update the third element. If any element is less than third, we found a 132 pattern.',
    code: `class Solution:
    def find132pattern(self, nums: list[int]) -> bool:
        stack = []
        third = float('-inf')
        for num in reversed(nums):
            if num < third:
                return True
            while stack and stack[-1] < num:
                third = stack.pop()
            stack.append(num)
        return False`,
    explanation:
      '1. Traverse from right to left, maintaining a decreasing stack.\n' +
      '2. "third" tracks the largest value popped (the "2" in 132).\n' +
      '3. When we pop elements smaller than current num, those become candidates for "2".\n' +
      '4. If we find a num < third, then num is "1", the element that caused pops is "3", and third is "2".',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Think about what roles the three numbers play: "1" is smallest, "3" is largest, "2" is in between.',
      'A monotonic stack processed from right to left can track potential "3" and "2" values.',
      'If you ever see a number less than the last popped value, you have found the "1".',
    ],
  },

  // ---------------------------------------------------------------------------
  // 459. Repeated Substring Pattern
  // ---------------------------------------------------------------------------
  {
    id: 459,
    description:
      'Given a string s, check if it can be constructed by taking a substring of it and appending multiple copies of the substring together. Return true if so, otherwise false.',
    examples:
      'Input: s = "abab"\nOutput: true\nExplanation: It is the substring "ab" repeated twice.',
    approach:
      'Concatenate s with itself and remove the first and last characters. If s is found in this modified string, it is a repeated pattern. This works because a repeated string will realign within the doubled version.',
    code: `class Solution:
    def repeatedSubstringPattern(self, s: str) -> bool:
        return s in (s + s)[1:-1]`,
    explanation:
      '1. Create the string (s + s) which doubles the original.\n' +
      '2. Remove the first and last character to break trivial matches.\n' +
      '3. If s still appears in this modified string, it must be composed of repeated substrings.\n' +
      '4. This is because the repeated pattern realigns at a non-trivial offset.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'If you double the string and remove the first and last character, what happens?',
      'A string made of repeated patterns will appear again in the doubled version at a shifted position.',
      'The check s in (s+s)[1:-1] elegantly solves this problem.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 460. LFU Cache
  // ---------------------------------------------------------------------------
  {
    id: 460,
    description:
      'Design and implement a data structure for a Least Frequently Used (LFU) cache. Implement the LFUCache class with get and put methods. When the cache reaches its capacity, it should invalidate and remove the least frequently used key before inserting a new item. When there is a tie, the least recently used key is evicted.',
    examples:
      'Input: ["LFUCache","put","put","get","put","get","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[3],[4,4],[1],[3],[4]]\nOutput: [null,null,null,1,null,-1,3,null,-1,3,4]',
    approach:
      'Use a hash map for key-to-value, a hash map for key-to-frequency, and a hash map from frequency to an OrderedDict (which maintains insertion order for LRU within the same frequency). Track the minimum frequency to find eviction candidates in O(1).',
    code: `from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.key_val = {}
        self.key_freq = {}
        self.freq_keys = defaultdict(OrderedDict)
        self.min_freq = 0

    def get(self, key: int) -> int:
        if key not in self.key_val:
            return -1
        self._update_freq(key)
        return self.key_val[key]

    def put(self, key: int, value: int) -> None:
        if self.cap <= 0:
            return
        if key in self.key_val:
            self.key_val[key] = value
            self._update_freq(key)
            return
        if len(self.key_val) >= self.cap:
            evict_key, _ = self.freq_keys[self.min_freq].popitem(last=False)
            del self.key_val[evict_key]
            del self.key_freq[evict_key]
        self.key_val[key] = value
        self.key_freq[key] = 1
        self.freq_keys[1][key] = None
        self.min_freq = 1

    def _update_freq(self, key: int):
        freq = self.key_freq[key]
        self.key_freq[key] = freq + 1
        del self.freq_keys[freq][key]
        if not self.freq_keys[freq] and self.min_freq == freq:
            self.min_freq += 1
        self.freq_keys[freq + 1][key] = None`,
    explanation:
      '1. key_val stores the actual values; key_freq stores each key\'s access frequency.\n' +
      '2. freq_keys maps each frequency to an OrderedDict maintaining insertion order (LRU).\n' +
      '3. On access, we move the key from freq bucket to freq+1 bucket.\n' +
      '4. On eviction, we pop from the min_freq bucket (oldest item = LRU among LFU).\n' +
      '5. min_freq resets to 1 on each new insertion and increments when a freq bucket empties.',
    timeComplexity: 'O(1) for both get and put',
    spaceComplexity: 'O(capacity)',
    hints: [
      'You need O(1) get and put. Think about what data structures allow O(1) access and ordering.',
      'Use a frequency-to-OrderedDict mapping so that within the same frequency you can evict LRU.',
      'Track the minimum frequency to find eviction candidates in O(1).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 461. Hamming Distance
  // ---------------------------------------------------------------------------
  {
    id: 461,
    description:
      'The Hamming distance between two integers is the number of positions at which the corresponding bits are different. Given two integers x and y, return the Hamming distance between them.',
    examples:
      'Input: x = 1, y = 4\nOutput: 2\nExplanation: 1 (0001) and 4 (0100) differ in 2 bit positions.',
    approach:
      'XOR the two numbers to get a value where set bits represent differences. Then count the number of set bits using bin().count("1") or Brian Kernighan\'s algorithm.',
    code: `class Solution:
    def hammingDistance(self, x: int, y: int) -> int:
        return bin(x ^ y).count('1')`,
    explanation:
      '1. XOR x and y: each bit that differs between x and y becomes 1.\n' +
      '2. Count the number of 1-bits in the XOR result.\n' +
      '3. bin() converts to binary string, and count("1") counts set bits.',
    timeComplexity: 'O(1) (at most 32 bits)',
    spaceComplexity: 'O(1)',
    hints: [
      'XOR highlights the bits that are different between two numbers.',
      'After XOR, count the number of 1-bits in the result.',
      'Python\'s bin(n).count("1") is a quick way to count set bits.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 462. Minimum Moves to Equal Array Elements II
  // ---------------------------------------------------------------------------
  {
    id: 462,
    description:
      'Given an integer array nums of size n, return the minimum number of moves required to make all array elements equal. In one move, you can increment or decrement an element by 1.',
    examples:
      'Input: nums = [1,2,3]\nOutput: 2\nExplanation: [1,2,3] => [2,2,3] => [2,2,2]. Only 2 moves needed.',
    approach:
      'The optimal target is the median of the array. Sort the array, find the median, and sum the absolute differences from each element to the median.',
    code: `class Solution:
    def minMoves2(self, nums: list[int]) -> int:
        nums.sort()
        median = nums[len(nums) // 2]
        return sum(abs(n - median) for n in nums)`,
    explanation:
      '1. Sort the array to find the median element.\n' +
      '2. The median minimizes the sum of absolute deviations.\n' +
      '3. Sum up |nums[i] - median| for all elements.\n' +
      '4. Return the total number of moves.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'What single value minimizes the total distance to all elements?',
      'The median minimizes the sum of absolute differences.',
      'Sort the array and pick the middle element as the target.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 463. Island Perimeter
  // ---------------------------------------------------------------------------
  {
    id: 463,
    description:
      'You are given a 2D grid map of 1s (land) and 0s (water). The grid cells are connected horizontally/vertically (not diagonally). The grid is completely surrounded by water. There is exactly one island. Determine the perimeter of the island.',
    examples:
      'Input: grid = [[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]\nOutput: 16',
    approach:
      'For each land cell, start with 4 edges. For each adjacent land cell, subtract 1 edge (shared boundary). Alternatively, count land cells * 4 minus 2 * number of adjacent land pairs.',
    code: `class Solution:
    def islandPerimeter(self, grid: list[list[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        perimeter = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    perimeter += 4
                    if r > 0 and grid[r - 1][c] == 1:
                        perimeter -= 2
                    if c > 0 and grid[r][c - 1] == 1:
                        perimeter -= 2
        return perimeter`,
    explanation:
      '1. Each land cell contributes 4 edges to the perimeter.\n' +
      '2. For each shared edge with a neighbor above or to the left, subtract 2 (both cells lose one edge).\n' +
      '3. We only check up and left to avoid double counting.\n' +
      '4. Return the total perimeter.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Each land cell has 4 sides. How many sides are shared with neighbors?',
      'Each pair of adjacent land cells shares one edge, removing 2 from the total perimeter.',
      'Only check up and left neighbors to avoid counting shared edges twice.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 464. Can I Win
  // ---------------------------------------------------------------------------
  {
    id: 464,
    description:
      'In the "100 game," two players take turns adding any integer from 1 to maxChoosableInteger to a running total. The player who causes the total to reach or exceed desiredTotal wins. Given maxChoosableInteger and desiredTotal, determine if the first player can always force a win assuming both play optimally. No number can be reused.',
    examples:
      'Input: maxChoosableInteger = 10, desiredTotal = 11\nOutput: false\nExplanation: No matter which number player 1 picks, player 2 can always win.',
    approach:
      'Use bitmask DP with memoization. Each bitmask represents which numbers have been chosen. At each state, try all unchosen numbers and check if any choice leads to a win (reaching the total or forcing the opponent into a losing state).',
    code: `class Solution:
    def canIWin(self, maxChoosableInteger: int, desiredTotal: int) -> bool:
        if desiredTotal <= 0:
            return True
        if maxChoosableInteger * (maxChoosableInteger + 1) // 2 < desiredTotal:
            return False
        memo = {}
        def can_win(used: int, remaining: int) -> bool:
            if used in memo:
                return memo[used]
            for i in range(1, maxChoosableInteger + 1):
                if used & (1 << i):
                    continue
                if i >= remaining or not can_win(used | (1 << i), remaining - i):
                    memo[used] = True
                    return True
            memo[used] = False
            return False
        return can_win(0, desiredTotal)`,
    explanation:
      '1. If the total sum of all numbers < desiredTotal, no one can win.\n' +
      '2. Use a bitmask to represent which numbers are used.\n' +
      '3. For each state, try picking each unused number.\n' +
      '4. If picking a number reaches the target, or the opponent cannot win after, current player wins.\n' +
      '5. Memoize results by bitmask state.',
    timeComplexity: 'O(2^n * n) where n = maxChoosableInteger',
    spaceComplexity: 'O(2^n)',
    hints: [
      'Think about game states: which numbers are used and what total remains.',
      'Use bitmask to represent used numbers and memoize each state.',
      'A player wins if they can pick a number >= remaining or force the opponent to lose.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 468. Validate IP Address
  // ---------------------------------------------------------------------------
  {
    id: 468,
    description:
      'Given a string queryIP, return "IPv4" if it is a valid IPv4 address, "IPv6" if it is a valid IPv6 address, or "Neither" if it is not a correct IP of any type. A valid IPv4 has four decimal numbers (0-255) separated by dots with no leading zeros. A valid IPv6 has eight groups of four hexadecimal digits separated by colons.',
    examples:
      'Input: queryIP = "172.16.254.1"\nOutput: "IPv4"',
    approach:
      'Split by "." for IPv4 or ":" for IPv6 and validate each part. For IPv4, check 4 parts, each numeric, no leading zeros, value 0-255. For IPv6, check 8 parts, each 1-4 hex chars.',
    code: `class Solution:
    def validIPAddress(self, queryIP: str) -> str:
        if '.' in queryIP:
            parts = queryIP.split('.')
            if len(parts) != 4:
                return "Neither"
            for part in parts:
                if not part or not part.isdigit() or (len(part) > 1 and part[0] == '0') or int(part) > 255:
                    return "Neither"
            return "IPv4"
        if ':' in queryIP:
            parts = queryIP.split(':')
            if len(parts) != 8:
                return "Neither"
            hex_chars = set('0123456789abcdefABCDEF')
            for part in parts:
                if not part or len(part) > 4 or not all(c in hex_chars for c in part):
                    return "Neither"
            return "IPv6"
        return "Neither"`,
    explanation:
      '1. Check if the IP contains "." (potential IPv4) or ":" (potential IPv6).\n' +
      '2. For IPv4: split by ".", ensure 4 parts, each numeric with no leading zeros and value 0-255.\n' +
      '3. For IPv6: split by ":", ensure 8 parts, each 1-4 valid hex characters.\n' +
      '4. Return "Neither" if no conditions match.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Split the string by "." or ":" and validate each segment.',
      'For IPv4, watch for leading zeros and values > 255.',
      'For IPv6, each group must be 1-4 hex characters.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 472. Concatenated Words
  // ---------------------------------------------------------------------------
  {
    id: 472,
    description:
      'Given an array of strings words (without duplicates), return all the concatenated words. A concatenated word is a string that is comprised entirely of at least two shorter words from the given array.',
    examples:
      'Input: words = ["cat","cats","catsdogcats","dog","dogcatsdog","hippopotamuses","rat","ratcatdogcat"]\nOutput: ["catsdogcats","dogcatsdog","ratcatdogcat"]',
    approach:
      'Put all words in a set. For each word, use dynamic programming (word break) to check if it can be split into at least two words from the set.',
    code: `class Solution:
    def findAllConcatenatedWordsInADict(self, words: list[str]) -> list[str]:
        word_set = set(words)
        result = []
        def can_form(word: str) -> bool:
            dp = [False] * (len(word) + 1)
            dp[0] = True
            for i in range(1, len(word) + 1):
                for j in range(i):
                    if dp[j] and word[j:i] in word_set and word[j:i] != word:
                        dp[i] = True
                        break
            return dp[len(word)]
        for w in words:
            if w and can_form(w):
                result.append(w)
        return result`,
    explanation:
      '1. Build a set of all words for O(1) lookup.\n' +
      '2. For each word, run a word-break DP check.\n' +
      '3. dp[i] is True if word[:i] can be formed by concatenating words from the set (excluding the word itself).\n' +
      '4. If dp[len(word)] is True, the word is concatenated.',
    timeComplexity: 'O(n * L^3) where n is number of words and L is max word length',
    spaceComplexity: 'O(n * L)',
    hints: [
      'This is similar to the Word Break problem applied to each word.',
      'Use a set for O(1) lookups and DP to check if a word can be split.',
      'Make sure to exclude the word itself when checking substrings.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 474. Ones and Zeroes
  // ---------------------------------------------------------------------------
  {
    id: 474,
    description:
      'You are given an array of binary strings strs, and two integers m and n. Return the size of the largest subset of strs such that there are at most m 0s and n 1s in the subset.',
    examples:
      'Input: strs = ["10","0001","111001","1","0"], m = 5, n = 3\nOutput: 4\nExplanation: The largest subset with at most 5 zeros and 3 ones is {"10","0001","1","0"}, size 4.',
    approach:
      'This is a 0/1 knapsack problem with two constraints (m zeros and n ones). Use a 2D DP array dp[i][j] representing the max subset size with i zeros and j ones available.',
    code: `class Solution:
    def findMaxForm(self, strs: list[str], m: int, n: int) -> int:
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for s in strs:
            zeros = s.count('0')
            ones = s.count('1')
            for i in range(m, zeros - 1, -1):
                for j in range(n, ones - 1, -1):
                    dp[i][j] = max(dp[i][j], dp[i - zeros][j - ones] + 1)
        return dp[m][n]`,
    explanation:
      '1. dp[i][j] = max subset size using at most i zeros and j ones.\n' +
      '2. For each string, count its zeros and ones.\n' +
      '3. Iterate backwards (like 0/1 knapsack) to avoid using the same string twice.\n' +
      '4. Update dp[i][j] = max(dp[i][j], dp[i-zeros][j-ones] + 1).',
    timeComplexity: 'O(l * m * n) where l is the number of strings',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Think of this as a knapsack problem with two weight constraints.',
      'Each string has a cost of (zeros, ones) and a value of 1.',
      'Use a 2D DP table and iterate backwards to handle the 0/1 constraint.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 475. Heaters
  // ---------------------------------------------------------------------------
  {
    id: 475,
    description:
      'You have houses and heaters on a horizontal line. Find the minimum radius such that all houses can be covered by at least one heater. Every heater warms all houses within its radius.',
    examples:
      'Input: houses = [1,2,3], heaters = [2]\nOutput: 1\nExplanation: A heater at position 2 with radius 1 covers all houses.',
    approach:
      'Sort both arrays. For each house, binary search to find the nearest heater. The answer is the maximum of all minimum distances from each house to its nearest heater.',
    code: `import bisect

class Solution:
    def findRadius(self, houses: list[int], heaters: list[int]) -> int:
        heaters.sort()
        result = 0
        for house in houses:
            idx = bisect.bisect_left(heaters, house)
            dist = float('inf')
            if idx < len(heaters):
                dist = min(dist, heaters[idx] - house)
            if idx > 0:
                dist = min(dist, house - heaters[idx - 1])
            result = max(result, dist)
        return result`,
    explanation:
      '1. Sort the heaters array for binary search.\n' +
      '2. For each house, find the insertion point in heaters.\n' +
      '3. Check the distance to the heater at that index and the one before it.\n' +
      '4. The answer is the max of all minimum distances.',
    timeComplexity: 'O((m + n) log n) where m = houses, n = heaters',
    spaceComplexity: 'O(1)',
    hints: [
      'For each house, you need to find the closest heater.',
      'Sort heaters and use binary search for each house.',
      'The answer is the maximum distance any house needs to reach its nearest heater.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 476. Number Complement
  // ---------------------------------------------------------------------------
  {
    id: 476,
    description:
      'The complement of an integer is the integer you get when you flip all the 0s to 1s and all the 1s to 0s in its binary representation. Given a positive integer num, output its complement.',
    examples:
      'Input: num = 5\nOutput: 2\nExplanation: Binary of 5 is 101, complement is 010 which is 2.',
    approach:
      'Find a bitmask with all 1s that has the same number of bits as num. XOR num with this mask to flip all bits.',
    code: `class Solution:
    def findComplement(self, num: int) -> int:
        mask = (1 << num.bit_length()) - 1
        return num ^ mask`,
    explanation:
      '1. num.bit_length() gives the number of bits in the binary representation.\n' +
      '2. Create a mask of all 1s with that many bits: (1 << bit_length) - 1.\n' +
      '3. XOR num with the mask to flip every bit.\n' +
      '4. Return the result.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    hints: [
      'Flipping bits is the same as XOR with all 1s.',
      'You need a mask that has the same number of bits as the number.',
      'Use bit_length() to determine how many bits to flip.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 480. Sliding Window Median
  // ---------------------------------------------------------------------------
  {
    id: 480,
    description:
      'The median is the middle value in an ordered integer list. Given an array nums and an integer k, return the median of each window of size k moving from left to right. Answers within 10^-5 of the actual value are accepted.',
    examples:
      'Input: nums = [1,3,-1,-3,5,3,6,7], k = 3\nOutput: [1.0,-1.0,-1.0,3.0,5.0,6.0]',
    approach:
      'Use a SortedList (from sortedcontainers) to maintain the window in sorted order. For each window position, add the new element, remove the old one, and retrieve the median from the sorted structure.',
    code: `from sortedcontainers import SortedList

class Solution:
    def medianSlidingWindow(self, nums: list[int], k: int) -> list[float]:
        window = SortedList()
        result = []
        for i, num in enumerate(nums):
            window.add(num)
            if len(window) > k:
                window.remove(nums[i - k])
            if len(window) == k:
                if k % 2 == 1:
                    result.append(float(window[k // 2]))
                else:
                    result.append((window[k // 2 - 1] + window[k // 2]) / 2.0)
        return result`,
    explanation:
      '1. Maintain a SortedList of the current window elements.\n' +
      '2. Add each new element; remove the element leaving the window.\n' +
      '3. For odd k, the median is the middle element.\n' +
      '4. For even k, the median is the average of the two middle elements.',
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(k)',
    hints: [
      'You need a data structure that supports efficient insertion, deletion, and median queries.',
      'A balanced BST or SortedList works well for maintaining window order.',
      'For each window, the median is at index k//2 (or average of k//2-1 and k//2).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 485. Max Consecutive Ones
  // ---------------------------------------------------------------------------
  {
    id: 485,
    description:
      'Given a binary array nums, return the maximum number of consecutive 1s in the array.',
    examples:
      'Input: nums = [1,1,0,1,1,1]\nOutput: 3\nExplanation: The last three elements are consecutive 1s.',
    approach:
      'Iterate through the array maintaining a count of consecutive 1s. Reset the count when a 0 is encountered. Track the maximum count seen.',
    code: `class Solution:
    def findMaxConsecutiveOnes(self, nums: list[int]) -> int:
        max_count = 0
        count = 0
        for num in nums:
            if num == 1:
                count += 1
                max_count = max(max_count, count)
            else:
                count = 0
        return max_count`,
    explanation:
      '1. Initialize max_count and current count to 0.\n' +
      '2. For each element, if it is 1, increment count and update max_count.\n' +
      '3. If it is 0, reset count to 0.\n' +
      '4. Return max_count after the loop.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Keep a running count of consecutive 1s.',
      'Reset the count whenever you hit a 0.',
      'Track the maximum count throughout the iteration.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 486. Predict the Winner
  // ---------------------------------------------------------------------------
  {
    id: 486,
    description:
      'You are given an integer array nums. Two players take turns picking a number from either end of the array. Player 1 starts first. Return true if Player 1 can win or tie. Each player plays optimally.',
    examples:
      'Input: nums = [1,5,2]\nOutput: false\nExplanation: Player 1 picks 1 or 2, Player 2 always gets 5 and wins.',
    approach:
      'Use interval DP. dp[i][j] represents the maximum score difference the current player can achieve from nums[i..j]. The current player picks nums[i] or nums[j] and the opponent faces the remaining subarray.',
    code: `class Solution:
    def predictTheWinner(self, nums: list[int]) -> bool:
        n = len(nums)
        dp = [[0] * n for _ in range(n)]
        for i in range(n):
            dp[i][i] = nums[i]
        for length in range(2, n + 1):
            for i in range(n - length + 1):
                j = i + length - 1
                dp[i][j] = max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1])
        return dp[0][n - 1] >= 0`,
    explanation:
      '1. dp[i][j] = max score difference the current player can achieve from subarray i to j.\n' +
      '2. Base case: dp[i][i] = nums[i] (only one element to pick).\n' +
      '3. Transition: pick left (nums[i] - dp[i+1][j]) or right (nums[j] - dp[i][j-1]).\n' +
      '4. Player 1 wins if dp[0][n-1] >= 0.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Think of the game recursively: each player picks optimally from the ends.',
      'dp[i][j] can represent the net score advantage for the current player.',
      'The current player picks either end and subtracts the opponent\'s optimal result.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 490. The Maze
  // ---------------------------------------------------------------------------
  {
    id: 490,
    description:
      'There is a ball in a maze with empty spaces and walls. The ball can go through the empty spaces by rolling up, down, left or right, but it won\'t stop rolling until hitting a wall. Determine whether the ball can stop at the destination.',
    examples:
      'Input: maze = [[0,0,1,0,0],[0,0,0,0,0],[0,0,0,1,0],[1,1,0,1,1],[0,0,0,0,0]], start = [0,4], destination = [4,4]\nOutput: true',
    approach:
      'Use BFS or DFS. From each position, roll the ball in all four directions until it hits a wall. The stopping position is a new node to explore. Track visited stopping positions to avoid cycles.',
    code: `from collections import deque

class Solution:
    def hasPath(self, maze: list[list[int]], start: list[int], destination: list[int]) -> bool:
        rows, cols = len(maze), len(maze[0])
        visited = set()
        visited.add((start[0], start[1]))
        queue = deque([(start[0], start[1])])
        while queue:
            r, c = queue.popleft()
            if [r, c] == destination:
                return True
            for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nr, nc = r, c
                while 0 <= nr + dr < rows and 0 <= nc + dc < cols and maze[nr + dr][nc + dc] == 0:
                    nr += dr
                    nc += dc
                if (nr, nc) not in visited:
                    visited.add((nr, nc))
                    queue.append((nr, nc))
        return False`,
    explanation:
      '1. Start BFS from the start position.\n' +
      '2. For each direction, roll the ball until it hits a wall or boundary.\n' +
      '3. The stopping position is the new position to explore.\n' +
      '4. If we reach the destination, return True. If BFS exhausts, return False.',
    timeComplexity: 'O(m * n * max(m, n))',
    spaceComplexity: 'O(m * n)',
    hints: [
      'The ball rolls until it hits a wall; it cannot stop in the middle.',
      'Use BFS/DFS where each node is a stopping position (against a wall).',
      'Track visited stopping positions to avoid infinite loops.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 493. Reverse Pairs
  // ---------------------------------------------------------------------------
  {
    id: 493,
    description:
      'Given an integer array nums, return the number of reverse pairs in the array. A reverse pair is a pair (i, j) where 0 <= i < j < nums.length and nums[i] > 2 * nums[j].',
    examples:
      'Input: nums = [1,3,2,3,1]\nOutput: 2\nExplanation: The reverse pairs are (1,4) => 3 > 2*1 and (3,4) => 3 > 2*1.',
    approach:
      'Use merge sort. During the merge step, count pairs where nums[i] > 2 * nums[j] before merging the two halves. This allows counting in O(n log n) time.',
    code: `class Solution:
    def reversePairs(self, nums: list[int]) -> int:
        self.count = 0
        def merge_sort(arr):
            if len(arr) <= 1:
                return arr
            mid = len(arr) // 2
            left = merge_sort(arr[:mid])
            right = merge_sort(arr[mid:])
            j = 0
            for i in range(len(left)):
                while j < len(right) and left[i] > 2 * right[j]:
                    j += 1
                self.count += j
            return sorted(left + right)
        merge_sort(nums)
        return self.count`,
    explanation:
      '1. Divide the array using merge sort.\n' +
      '2. Before merging, count cross-half reverse pairs using two pointers.\n' +
      '3. Since both halves are sorted, for each left[i], find how many right[j] satisfy left[i] > 2*right[j].\n' +
      '4. Merge the halves and return the total count.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Brute force is O(n^2). Can you do better with divide and conquer?',
      'Merge sort lets you count cross-half pairs efficiently.',
      'During the merge step, use two pointers since both halves are sorted.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 498. Diagonal Traverse
  // ---------------------------------------------------------------------------
  {
    id: 498,
    description:
      'Given an m x n matrix mat, return an array of all the elements of the array in a diagonal order. You start from the top-left and alternate between going up-right and down-left.',
    examples:
      'Input: mat = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [1,2,4,7,5,3,6,8,9]',
    approach:
      'Group elements by the sum of their indices (i+j). Elements on the same diagonal have the same i+j sum. For even diagonals, reverse the order (go upward). For odd diagonals, keep the order (go downward).',
    code: `class Solution:
    def findDiagonalOrder(self, mat: list[list[int]]) -> list[int]:
        if not mat:
            return []
        m, n = len(mat), len(mat[0])
        diags = [[] for _ in range(m + n - 1)]
        for i in range(m):
            for j in range(n):
                diags[i + j].append(mat[i][j])
        result = []
        for d in range(len(diags)):
            if d % 2 == 0:
                result.extend(diags[d][::-1])
            else:
                result.extend(diags[d])
        return result`,
    explanation:
      '1. Elements on the same diagonal share the same i+j value.\n' +
      '2. Group elements into diagonals by their i+j sum.\n' +
      '3. Even-numbered diagonals go upward (reverse), odd go downward (normal order).\n' +
      '4. Concatenate all diagonals in order.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Elements on the same diagonal have the same row+col sum.',
      'Alternate the traversal direction for each diagonal.',
      'Group by i+j and reverse even-indexed diagonal groups.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 505. The Maze II
  // ---------------------------------------------------------------------------
  {
    id: 505,
    description:
      'There is a ball in a maze with empty spaces and walls. The ball rolls until hitting a wall. Find the shortest distance for the ball to stop at the destination. If impossible, return -1. The distance is the number of empty spaces traveled.',
    examples:
      'Input: maze = [[0,0,1,0,0],[0,0,0,0,0],[0,0,0,1,0],[1,1,0,1,1],[0,0,0,0,0]], start = [0,4], destination = [4,4]\nOutput: 12',
    approach:
      'Use Dijkstra\'s algorithm or BFS with distance tracking. From each stopping position, roll in all four directions and calculate the distance traveled. Update the shortest distance to each stopping position.',
    code: `import heapq

class Solution:
    def shortestDistance(self, maze: list[list[int]], start: list[int], destination: list[int]) -> int:
        rows, cols = len(maze), len(maze[0])
        dist = [[float('inf')] * cols for _ in range(rows)]
        dist[start[0]][start[1]] = 0
        heap = [(0, start[0], start[1])]
        while heap:
            d, r, c = heapq.heappop(heap)
            if d > dist[r][c]:
                continue
            if [r, c] == destination:
                return d
            for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nr, nc, steps = r, c, 0
                while 0 <= nr + dr < rows and 0 <= nc + dc < cols and maze[nr + dr][nc + dc] == 0:
                    nr += dr
                    nc += dc
                    steps += 1
                if d + steps < dist[nr][nc]:
                    dist[nr][nc] = d + steps
                    heapq.heappush(heap, (d + steps, nr, nc))
        return -1`,
    explanation:
      '1. Use Dijkstra with a min-heap, starting at start with distance 0.\n' +
      '2. For each position, roll in all 4 directions counting steps until hitting a wall.\n' +
      '3. If the new distance is shorter, update and push to the heap.\n' +
      '4. Return the distance when destination is popped, or -1 if unreachable.',
    timeComplexity: 'O(m * n * max(m, n) * log(m * n))',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Unlike The Maze I, you need to find the shortest path, not just reachability.',
      'Use Dijkstra\'s algorithm since rolling distances vary.',
      'Track the minimum distance to each stopping position.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 509. Fibonacci Number
  // ---------------------------------------------------------------------------
  {
    id: 509,
    description:
      'The Fibonacci numbers form a sequence where each number is the sum of the two preceding ones, starting from 0 and 1. Given n, calculate F(n).',
    examples:
      'Input: n = 4\nOutput: 3\nExplanation: F(4) = F(3) + F(2) = 2 + 1 = 3.',
    approach:
      'Use iterative bottom-up approach with two variables to track the last two Fibonacci numbers. This avoids recursion overhead and uses O(1) space.',
    code: `class Solution:
    def fib(self, n: int) -> int:
        if n <= 1:
            return n
        a, b = 0, 1
        for _ in range(2, n + 1):
            a, b = b, a + b
        return b`,
    explanation:
      '1. Base cases: F(0) = 0, F(1) = 1.\n' +
      '2. Iterate from 2 to n, updating a and b to track the last two values.\n' +
      '3. At each step, the new value is a + b.\n' +
      '4. Return b which holds F(n).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The recursive approach has exponential time. Can you do it iteratively?',
      'You only need the last two values to compute the next one.',
      'Use two variables and iterate from 2 to n.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 516. Longest Palindromic Subsequence
  // ---------------------------------------------------------------------------
  {
    id: 516,
    description:
      'Given a string s, find the longest palindromic subsequence\'s length in s. A subsequence is derived by deleting some or no elements without changing the order of the remaining elements.',
    examples:
      'Input: s = "bbbab"\nOutput: 4\nExplanation: One possible longest palindromic subsequence is "bbbb".',
    approach:
      'Use 2D DP where dp[i][j] is the length of the longest palindromic subsequence in s[i..j]. If s[i] == s[j], dp[i][j] = dp[i+1][j-1] + 2. Otherwise, dp[i][j] = max(dp[i+1][j], dp[i][j-1]).',
    code: `class Solution:
    def longestPalindromeSubseq(self, s: str) -> int:
        n = len(s)
        dp = [[0] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):
            dp[i][i] = 1
            for j in range(i + 1, n):
                if s[i] == s[j]:
                    dp[i][j] = dp[i + 1][j - 1] + 2
                else:
                    dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
        return dp[0][n - 1]`,
    explanation:
      '1. dp[i][j] = length of longest palindromic subsequence in s[i..j].\n' +
      '2. Base case: single characters are palindromes of length 1.\n' +
      '3. If s[i] == s[j], both characters extend the inner palindrome by 2.\n' +
      '4. Otherwise, take the max by excluding either end.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'This is a classic interval DP problem.',
      'Consider subproblems on substrings s[i..j].',
      'If the endpoints match, they extend the palindrome; otherwise, try excluding each end.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 525. Contiguous Array
  // ---------------------------------------------------------------------------
  {
    id: 525,
    description:
      'Given a binary array nums, return the maximum length of a contiguous subarray with an equal number of 0s and 1s.',
    examples:
      'Input: nums = [0,1,0]\nOutput: 2\nExplanation: [0,1] is the longest contiguous subarray with equal 0s and 1s.',
    approach:
      'Replace 0s with -1s and find the longest subarray with sum 0. Use a hash map to store the first occurrence of each prefix sum. When the same prefix sum appears again, the subarray between those indices has sum 0.',
    code: `class Solution:
    def findMaxLength(self, nums: list[int]) -> int:
        count = 0
        max_len = 0
        first_seen = {0: -1}
        for i, num in enumerate(nums):
            count += 1 if num == 1 else -1
            if count in first_seen:
                max_len = max(max_len, i - first_seen[count])
            else:
                first_seen[count] = i
        return max_len`,
    explanation:
      '1. Treat 0 as -1 and maintain a running sum (count).\n' +
      '2. If count == 0, the subarray from start to current index has equal 0s and 1s.\n' +
      '3. If we see the same count again, the subarray between first occurrence and now has sum 0.\n' +
      '4. Track the first occurrence of each count for maximum length.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Replace 0s with -1s and find the longest subarray with sum 0.',
      'A prefix sum approach with a hash map works well.',
      'Store the first index where each prefix sum appears.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 528. Random Pick with Weight
  // ---------------------------------------------------------------------------
  {
    id: 528,
    description:
      'You are given a 0-indexed array of positive integers w where w[i] describes the weight of the ith index. Implement the function pickIndex() which randomly picks an index in the range [0, w.length - 1] (inclusive) and returns it. The probability of picking index i is w[i] / sum(w).',
    examples:
      'Input: ["Solution","pickIndex","pickIndex"]\n[[[1,3]],[],[]]\nOutput: [null,1,1]\nExplanation: pickIndex returns 1 with probability 3/4 and 0 with probability 1/4.',
    approach:
      'Build a prefix sum array from the weights. To pick an index, generate a random number in [1, total_weight] and binary search for the first prefix sum >= that number.',
    code: `import random
import bisect

class Solution:
    def __init__(self, w: list[int]):
        self.prefix = []
        total = 0
        for weight in w:
            total += weight
            self.prefix.append(total)

    def pickIndex(self) -> int:
        target = random.randint(1, self.prefix[-1])
        return bisect.bisect_left(self.prefix, target)`,
    explanation:
      '1. Build a prefix sum array where prefix[i] = sum of w[0..i].\n' +
      '2. Generate a random integer in [1, total_weight].\n' +
      '3. Use binary search to find the first index where prefix[i] >= target.\n' +
      '4. This index is the weighted random pick.',
    timeComplexity: 'O(n) for init, O(log n) for pickIndex',
    spaceComplexity: 'O(n)',
    hints: [
      'Think of the weights as ranges on a number line.',
      'Build a prefix sum and use binary search with a random number.',
      'The random number falls into a range corresponding to the weighted index.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 529. Minesweeper
  // ---------------------------------------------------------------------------
  {
    id: 529,
    description:
      'Given a 2D minesweeper board and a click position, return the board after revealing according to the rules: if a mine (\'M\') is clicked, mark it as \'X\'. If an empty square with no adjacent mines is clicked, reveal it as \'B\' and recursively reveal all adjacent unrevealed squares. If an empty square with adjacent mines is clicked, show the count.',
    examples:
      'Input: board = [["E","E","E"],["E","E","E"],["E","E","E"]], click = [1,1]\nOutput: [["B","B","B"],["B","B","B"],["B","B","B"]]',
    approach:
      'Use DFS/BFS from the click position. If a mine, mark it. Otherwise, count adjacent mines: if 0, mark as \'B\' and recurse into all 8 neighbors. If > 0, mark with the count digit.',
    code: `class Solution:
    def updateBoard(self, board: list[list[str]], click: list[int]) -> list[list[str]]:
        r, c = click
        if board[r][c] == 'M':
            board[r][c] = 'X'
            return board
        rows, cols = len(board), len(board[0])
        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != 'E':
                return
            mines = 0
            for dr in [-1, 0, 1]:
                for dc in [-1, 0, 1]:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] == 'M':
                        mines += 1
            if mines > 0:
                board[r][c] = str(mines)
            else:
                board[r][c] = 'B'
                for dr in [-1, 0, 1]:
                    for dc in [-1, 0, 1]:
                        dfs(r + dr, c + dc)
        dfs(r, c)
        return board`,
    explanation:
      '1. If the click is on a mine, mark it as \'X\' and return.\n' +
      '2. Otherwise, count adjacent mines in all 8 directions.\n' +
      '3. If mines > 0, mark the cell with the count digit.\n' +
      '4. If mines == 0, mark as \'B\' and recursively reveal all 8 neighbors.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Start from the click and decide what to reveal based on adjacent mines.',
      'Use DFS to recursively reveal empty regions.',
      'Only continue recursion when the current cell has 0 adjacent mines.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 530. Minimum Absolute Difference in BST
  // ---------------------------------------------------------------------------
  {
    id: 530,
    description:
      'Given the root of a Binary Search Tree (BST), return the minimum absolute difference between the values of any two different nodes in the tree.',
    examples:
      'Input: root = [4,2,6,1,3]\nOutput: 1\nExplanation: The minimum absolute difference is between 2 and 3 (or 3 and 4).',
    approach:
      'Perform an in-order traversal of the BST, which visits nodes in sorted order. The minimum difference must be between consecutive nodes in this sorted order. Track the previous node and update the minimum difference.',
    code: `class Solution:
    def getMinimumDifference(self, root) -> int:
        self.prev = None
        self.min_diff = float('inf')
        def inorder(node):
            if not node:
                return
            inorder(node.left)
            if self.prev is not None:
                self.min_diff = min(self.min_diff, node.val - self.prev)
            self.prev = node.val
            inorder(node.right)
        inorder(root)
        return self.min_diff`,
    explanation:
      '1. In-order traversal of a BST visits nodes in ascending order.\n' +
      '2. The minimum difference must occur between two consecutive values.\n' +
      '3. Track the previous node value and compute the difference with each current node.\n' +
      '4. Return the minimum difference found.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is the tree height',
    hints: [
      'In-order traversal of a BST gives sorted values.',
      'The minimum difference is always between adjacent sorted values.',
      'Track the previous value and compare with the current node.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 532. K-diff Pairs in an Array
  // ---------------------------------------------------------------------------
  {
    id: 532,
    description:
      'Given an array of integers nums and an integer k, return the number of unique k-diff pairs in the array. A k-diff pair is (nums[i], nums[j]) where i != j and |nums[i] - nums[j]| == k.',
    examples:
      'Input: nums = [3,1,4,1,5], k = 2\nOutput: 2\nExplanation: The pairs are (1,3) and (3,5).',
    approach:
      'Use a Counter to count occurrences. If k == 0, count numbers that appear more than once. If k > 0, for each unique number, check if num + k also exists in the counter.',
    code: `from collections import Counter

class Solution:
    def findPairs(self, nums: list[int], k: int) -> int:
        count = Counter(nums)
        result = 0
        for num in count:
            if k > 0 and num + k in count:
                result += 1
            elif k == 0 and count[num] > 1:
                result += 1
        return result`,
    explanation:
      '1. Count occurrences of each number using Counter.\n' +
      '2. If k > 0, for each unique num, check if num + k exists (avoids double counting).\n' +
      '3. If k == 0, count numbers that appear at least twice (pair with itself).\n' +
      '4. Return the total count of unique pairs.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a hash map to count occurrences.',
      'For k > 0, check if num + k exists. For k == 0, check if count > 1.',
      'Only check num + k (not num - k) to avoid counting pairs twice.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 535. Encode and Decode TinyURL
  // ---------------------------------------------------------------------------
  {
    id: 535,
    description:
      'TinyURL is a URL shortening service. Design the encode and decode methods. There is no restriction on how your encode/decode algorithm should work. You just need to ensure that a URL can be encoded to a tiny URL and the tiny URL can be decoded back to the original URL.',
    examples:
      'Input: url = "https://leetcode.com/problems/design-tinyurl"\nOutput: "https://leetcode.com/problems/design-tinyurl"',
    approach:
      'Use a hash map to store mappings. Generate a unique short code (e.g., using a counter or hash) and map it to the original URL. Decode by looking up the short code in the map.',
    code: `class Codec:
    def __init__(self):
        self.url_map = {}
        self.counter = 0

    def encode(self, longUrl: str) -> str:
        self.counter += 1
        short = "http://tinyurl.com/" + str(self.counter)
        self.url_map[short] = longUrl
        return short

    def decode(self, shortUrl: str) -> str:
        return self.url_map[shortUrl]`,
    explanation:
      '1. Maintain a dictionary mapping short URLs to long URLs.\n' +
      '2. On encode, increment a counter to create a unique short code.\n' +
      '3. Store the mapping from short URL to long URL.\n' +
      '4. On decode, look up the short URL in the dictionary.',
    timeComplexity: 'O(1) for both encode and decode',
    spaceComplexity: 'O(n) where n is the number of URLs stored',
    hints: [
      'A simple counter-based approach works as a basic solution.',
      'Use a dictionary to map short codes to original URLs.',
      'You could also use hashing or random strings for the short code.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 536. Construct Binary Tree from String
  // ---------------------------------------------------------------------------
  {
    id: 536,
    description:
      'You need to construct a binary tree from a string consisting of parenthesis and integers. The whole input represents a binary tree. It contains an integer followed by zero, one, or two pairs of parenthesis. The first pair represents the left child and the second represents the right child.',
    examples:
      'Input: s = "4(2(3)(1))(6(5))"\nOutput: [4,2,6,3,1,5]',
    approach:
      'Use a recursive parser or a stack. Parse the number, then if there is a \'(\', recursively parse the left child. If there is another \'(\', parse the right child. Match closing parentheses.',
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def str2tree(self, s: str) -> TreeNode:
        if not s:
            return None
        self.i = 0
        def parse():
            if self.i >= len(s):
                return None
            sign = 1
            if s[self.i] == '-':
                sign = -1
                self.i += 1
            num = 0
            while self.i < len(s) and s[self.i].isdigit():
                num = num * 10 + int(s[self.i])
                self.i += 1
            node = TreeNode(sign * num)
            if self.i < len(s) and s[self.i] == '(':
                self.i += 1
                node.left = parse()
                self.i += 1
            if self.i < len(s) and s[self.i] == '(':
                self.i += 1
                node.right = parse()
                self.i += 1
            return node
        return parse()`,
    explanation:
      '1. Use a global index to track position in the string.\n' +
      '2. Parse the number (with possible negative sign) to create the node.\n' +
      '3. If \'(\' follows, recursively parse the left child, then skip \')\'.\n' +
      '4. If another \'(\' follows, recursively parse the right child.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) for recursion stack',
    hints: [
      'Parse the string character by character with a recursive approach.',
      'The first parenthesized group is the left subtree, the second is the right.',
      'Handle negative numbers and multi-digit numbers carefully.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 538. Convert BST to Greater Tree
  // ---------------------------------------------------------------------------
  {
    id: 538,
    description:
      'Given the root of a Binary Search Tree (BST), convert it to a Greater Tree where every key of the original BST is changed to the original key plus the sum of all keys greater than the original key in BST.',
    examples:
      'Input: root = [4,1,6,0,2,5,7,null,null,null,3,null,null,null,8]\nOutput: [30,36,21,36,35,26,15,null,null,null,33,null,null,null,8]',
    approach:
      'Perform a reverse in-order traversal (right, root, left). Maintain a running sum of all visited nodes. Update each node\'s value by adding the running sum.',
    code: `class Solution:
    def convertBST(self, root) -> 'TreeNode':
        self.total = 0
        def reverse_inorder(node):
            if not node:
                return
            reverse_inorder(node.right)
            self.total += node.val
            node.val = self.total
            reverse_inorder(node.left)
        reverse_inorder(root)
        return root`,
    explanation:
      '1. Reverse in-order traversal visits nodes from largest to smallest.\n' +
      '2. Maintain a running total of all visited node values.\n' +
      '3. Each node\'s new value = its original value + sum of all greater values.\n' +
      '4. Update node.val to the running total as we visit each node.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'In a BST, all greater values are in the right subtree or ancestors.',
      'A reverse in-order traversal (right -> root -> left) visits nodes in descending order.',
      'Maintain a running sum and add it to each node as you traverse.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 541. Reverse String II
  // ---------------------------------------------------------------------------
  {
    id: 541,
    description:
      'Given a string s and an integer k, reverse the first k characters for every 2k characters counting from the start of the string. If there are fewer than k characters left, reverse all of them.',
    examples:
      'Input: s = "abcdefg", k = 2\nOutput: "bacdfeg"',
    approach:
      'Process the string in chunks of 2k. For each chunk, reverse the first k characters and keep the rest as is.',
    code: `class Solution:
    def reverseStr(self, s: str, k: int) -> str:
        arr = list(s)
        for i in range(0, len(arr), 2 * k):
            arr[i:i + k] = arr[i:i + k][::-1]
        return ''.join(arr)`,
    explanation:
      '1. Convert string to list for in-place modification.\n' +
      '2. Iterate in steps of 2k.\n' +
      '3. For each step, reverse the first k characters of that chunk.\n' +
      '4. If fewer than k characters remain, reversing the slice handles it correctly.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Process the string in chunks of 2k characters.',
      'Reverse only the first k characters of each chunk.',
      'Python slicing handles the edge case when fewer than k characters remain.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 542. 01 Matrix
  // ---------------------------------------------------------------------------
  {
    id: 542,
    description:
      'Given an m x n binary matrix mat, return the distance of the nearest 0 for each cell. The distance between two adjacent cells is 1.',
    examples:
      'Input: mat = [[0,0,0],[0,1,0],[1,1,1]]\nOutput: [[0,0,0],[0,1,0],[1,2,1]]',
    approach:
      'Use multi-source BFS starting from all cells containing 0 simultaneously. This radiates outward layer by layer, computing the shortest distance to a 0 for all cells.',
    code: `from collections import deque

class Solution:
    def updateMatrix(self, mat: list[list[int]]) -> list[list[int]]:
        m, n = len(mat), len(mat[0])
        dist = [[float('inf')] * n for _ in range(m)]
        queue = deque()
        for i in range(m):
            for j in range(n):
                if mat[i][j] == 0:
                    dist[i][j] = 0
                    queue.append((i, j))
        while queue:
            r, c = queue.popleft()
            for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and dist[nr][nc] > dist[r][c] + 1:
                    dist[nr][nc] = dist[r][c] + 1
                    queue.append((nr, nc))
        return dist`,
    explanation:
      '1. Initialize distance matrix: 0 for cells with 0, infinity for cells with 1.\n' +
      '2. Add all 0-cells to the BFS queue.\n' +
      '3. BFS expands outward: for each neighbor, update distance if a shorter path is found.\n' +
      '4. BFS guarantees shortest distances are computed level by level.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Think of this as a shortest-path problem from every 0 cell.',
      'Multi-source BFS starting from all 0s simultaneously is efficient.',
      'Each cell gets its distance from the nearest 0 in the BFS expansion.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 545. Boundary of Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 545,
    description:
      'The boundary of a binary tree is the concatenation of the root, the left boundary, the leaves, and the right boundary (in reverse), without duplicates. Return the values of the boundary in anti-clockwise order starting from the root.',
    examples:
      'Input: root = [1,null,2,3,4]\nOutput: [1,3,4,2]',
    approach:
      'Collect three parts: left boundary (excluding leaves), all leaves (left to right), and right boundary (excluding leaves, in reverse). Handle edge cases where the tree is skewed.',
    code: `class Solution:
    def boundaryOfBinaryTree(self, root) -> list[int]:
        if not root:
            return []
        boundary = [root.val]
        def left_boundary(node):
            if not node or (not node.left and not node.right):
                return
            boundary.append(node.val)
            if node.left:
                left_boundary(node.left)
            else:
                left_boundary(node.right)
        def right_boundary(node):
            if not node or (not node.left and not node.right):
                return
            if node.right:
                right_boundary(node.right)
            else:
                right_boundary(node.left)
            boundary.append(node.val)
        def leaves(node):
            if not node:
                return
            if not node.left and not node.right:
                boundary.append(node.val)
                return
            leaves(node.left)
            leaves(node.right)
        left_boundary(root.left)
        leaves(root.left)
        leaves(root.right)
        right_boundary(root.right)
        return boundary`,
    explanation:
      '1. Start with the root value.\n' +
      '2. Collect left boundary: go left preferring left children, excluding leaves.\n' +
      '3. Collect all leaves from left to right.\n' +
      '4. Collect right boundary in reverse: go right preferring right children, excluding leaves.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Break the problem into three parts: left boundary, leaves, right boundary.',
      'Left boundary follows the leftmost path excluding leaves.',
      'Right boundary follows the rightmost path excluding leaves, added in reverse.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 554. Brick Wall
  // ---------------------------------------------------------------------------
  {
    id: 554,
    description:
      'There is a rectangular brick wall in front of you. Draw a vertical line from the top to the bottom of the wall, crossing the fewest bricks as possible. Return the minimum number of crossed bricks. You cannot draw a line along the two vertical edges of the wall.',
    examples:
      'Input: wall = [[1,2,2,1],[3,1,2],[1,3,2],[2,4],[3,1,2],[1,3,1,1]]\nOutput: 2',
    approach:
      'For each row, compute the prefix sums (excluding the last) which represent edge positions. Count how many rows have an edge at each position. The answer is total rows minus the maximum edge count.',
    code: `from collections import Counter

class Solution:
    def leastBricks(self, wall: list[list[int]]) -> int:
        edge_count = Counter()
        for row in wall:
            pos = 0
            for brick in row[:-1]:
                pos += brick
                edge_count[pos] += 1
        return len(wall) - (max(edge_count.values()) if edge_count else 0)`,
    explanation:
      '1. For each row, compute prefix sums (excluding the total width) to find edge positions.\n' +
      '2. Count how many rows have an edge at each position using a Counter.\n' +
      '3. A line drawn at the most common edge position crosses the fewest bricks.\n' +
      '4. Answer = total rows - max edge count.',
    timeComplexity: 'O(n) where n is the total number of bricks',
    spaceComplexity: 'O(m) where m is the wall width',
    hints: [
      'A line crossing an edge between bricks doesn\'t count as crossing a brick.',
      'Count edge positions across all rows; the best line passes through the most edges.',
      'The answer is total rows minus the most common edge count.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 556. Next Greater Element III
  // ---------------------------------------------------------------------------
  {
    id: 556,
    description:
      'Given a positive integer n, find the smallest integer which has exactly the same digits as n and is greater in value. If no such positive integer exists, return -1. The result must fit in a 32-bit integer.',
    examples:
      'Input: n = 12\nOutput: 21',
    approach:
      'This is the "next permutation" problem applied to digits. Find the rightmost digit smaller than the digit to its right, swap it with the smallest larger digit to its right, then reverse the suffix.',
    code: `class Solution:
    def nextGreaterElement(self, n: int) -> int:
        digits = list(str(n))
        i = len(digits) - 2
        while i >= 0 and digits[i] >= digits[i + 1]:
            i -= 1
        if i < 0:
            return -1
        j = len(digits) - 1
        while digits[j] <= digits[i]:
            j -= 1
        digits[i], digits[j] = digits[j], digits[i]
        digits[i + 1:] = digits[i + 1:][::-1]
        result = int(''.join(digits))
        return result if result <= 2**31 - 1 else -1`,
    explanation:
      '1. Convert n to a list of digit characters.\n' +
      '2. Find the rightmost index i where digits[i] < digits[i+1] (the pivot).\n' +
      '3. Find the rightmost index j where digits[j] > digits[i] and swap them.\n' +
      '4. Reverse the suffix after index i to get the smallest next permutation.\n' +
      '5. Check if the result fits in a 32-bit integer.',
    timeComplexity: 'O(d) where d is the number of digits',
    spaceComplexity: 'O(d)',
    hints: [
      'This is equivalent to finding the next permutation of digits.',
      'Find the rightmost "ascending" pair and swap with the smallest larger digit on the right.',
      'Reverse the suffix to get the smallest arrangement.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 557. Reverse Words in a String III
  // ---------------------------------------------------------------------------
  {
    id: 557,
    description:
      'Given a string s, reverse the order of characters in each word within a sentence while still preserving whitespace and initial word order.',
    examples:
      'Input: s = "Let\'s take LeetCode contest"\nOutput: "s\'teL ekat edoCteeL tsetnoc"',
    approach:
      'Split the string by spaces, reverse each word individually, then join them back with spaces.',
    code: `class Solution:
    def reverseWords(self, s: str) -> str:
        return ' '.join(word[::-1] for word in s.split(' '))`,
    explanation:
      '1. Split the string by spaces to get individual words.\n' +
      '2. Reverse each word using slicing [::-1].\n' +
      '3. Join the reversed words back with spaces.\n' +
      '4. The word order is preserved; only characters within each word are reversed.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Split the string into words first.',
      'Reverse each word individually.',
      'Join them back with spaces.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 559. Maximum Depth of N-ary Tree
  // ---------------------------------------------------------------------------
  {
    id: 559,
    description:
      'Given an n-ary tree, find its maximum depth. The maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    examples:
      'Input: root = [1,null,3,2,4,null,5,6]\nOutput: 3',
    approach:
      'Use recursive DFS. The depth of a node is 1 + max depth of its children. For a leaf node, the depth is 1.',
    code: `class Solution:
    def maxDepth(self, root: 'Node') -> int:
        if not root:
            return 0
        if not root.children:
            return 1
        return 1 + max(self.maxDepth(child) for child in root.children)`,
    explanation:
      '1. Base case: if root is None, return 0.\n' +
      '2. If root has no children, it is a leaf with depth 1.\n' +
      '3. Otherwise, recursively find the max depth among all children.\n' +
      '4. Return 1 + the maximum child depth.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is the tree height',
    hints: [
      'Apply the same logic as max depth of a binary tree.',
      'For each node, the depth is 1 + max depth of any child.',
      'Handle the base case when the node is null or a leaf.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 561. Array Partition
  // ---------------------------------------------------------------------------
  {
    id: 561,
    description:
      'Given an integer array nums of 2n integers, group these integers into n pairs such that the sum of min(ai, bi) for all pairs is maximized. Return the maximized sum.',
    examples:
      'Input: nums = [1,4,3,2]\nOutput: 4\nExplanation: Pairs (1,2) and (3,4) give min(1,2) + min(3,4) = 1 + 3 = 4.',
    approach:
      'Sort the array and pair consecutive elements. The sum of elements at even indices (0, 2, 4, ...) gives the maximum sum. This works because pairing similar-valued elements minimizes waste.',
    code: `class Solution:
    def arrayPairSum(self, nums: list[int]) -> int:
        nums.sort()
        return sum(nums[i] for i in range(0, len(nums), 2))`,
    explanation:
      '1. Sort the array in ascending order.\n' +
      '2. Pair consecutive elements: (nums[0], nums[1]), (nums[2], nums[3]), etc.\n' +
      '3. The min of each pair is the first element (even index).\n' +
      '4. Sum all even-indexed elements for the maximum result.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Think about how to minimize the "loss" when taking the min of each pair.',
      'Pair similar-valued numbers together to minimize waste.',
      'Sort the array and sum every other element starting from index 0.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 566. Reshape the Matrix
  // ---------------------------------------------------------------------------
  {
    id: 566,
    description:
      'You are given an m x n matrix mat and two integers r and c representing the number of rows and columns of the wanted reshaped matrix. If the reshape operation is not possible or illegal, return the original matrix.',
    examples:
      'Input: mat = [[1,2],[3,4]], r = 1, c = 4\nOutput: [[1,2,3,4]]',
    approach:
      'First check if m*n == r*c. If not, return the original. Flatten the matrix into a 1D list, then fill the new r x c matrix row by row.',
    code: `class Solution:
    def matrixReshape(self, mat: list[list[int]], r: int, c: int) -> list[list[int]]:
        m, n = len(mat), len(mat[0])
        if m * n != r * c:
            return mat
        flat = [mat[i][j] for i in range(m) for j in range(n)]
        return [flat[i * c:(i + 1) * c] for i in range(r)]`,
    explanation:
      '1. Check if total elements match: m*n must equal r*c.\n' +
      '2. Flatten the matrix into a 1D list.\n' +
      '3. Split the flat list into chunks of size c to form r rows.\n' +
      '4. Return the reshaped matrix.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'First check if reshaping is possible: m*n must equal r*c.',
      'Flatten the matrix and redistribute into the new dimensions.',
      'Use integer division and modulo to map 1D index to 2D coordinates.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 582. Kill Process
  // ---------------------------------------------------------------------------
  {
    id: 582,
    description:
      'Given n processes with their IDs in pid and their parent process IDs in ppid, when you kill a process, all its child processes are also killed. Return a list of process IDs that will be killed given the kill target.',
    examples:
      'Input: pid = [1,3,10,5], ppid = [3,0,5,3], kill = 5\nOutput: [5,10]',
    approach:
      'Build an adjacency list (parent -> children) from pid and ppid. Use BFS/DFS starting from the kill target to find all descendant processes.',
    code: `from collections import defaultdict, deque

class Solution:
    def killProcess(self, pid: list[int], ppid: list[int], kill: int) -> list[int]:
        children = defaultdict(list)
        for p, pp in zip(pid, ppid):
            children[pp].append(p)
        result = []
        queue = deque([kill])
        while queue:
            curr = queue.popleft()
            result.append(curr)
            queue.extend(children[curr])
        return result`,
    explanation:
      '1. Build a map from parent ID to list of child IDs.\n' +
      '2. Start BFS from the kill target.\n' +
      '3. For each process, add it to the result and enqueue its children.\n' +
      '4. Return all killed processes.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Build a parent-to-children mapping for easy traversal.',
      'Use BFS or DFS starting from the kill target.',
      'All descendants of the killed process are also killed.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 583. Delete Operation for Two Strings
  // ---------------------------------------------------------------------------
  {
    id: 583,
    description:
      'Given two strings word1 and word2, return the minimum number of steps required to make word1 and word2 the same. In each step, you can delete one character in either string.',
    examples:
      'Input: word1 = "sea", word2 = "eat"\nOutput: 2\nExplanation: Delete "s" from "sea" and "t" from "eat" to get "ea".',
    approach:
      'Find the Longest Common Subsequence (LCS) of the two strings. The minimum deletions = len(word1) + len(word2) - 2 * LCS_length.',
    code: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        return m + n - 2 * dp[m][n]`,
    explanation:
      '1. Compute the LCS length using standard DP.\n' +
      '2. dp[i][j] = LCS length of word1[:i] and word2[:j].\n' +
      '3. Characters to delete = total characters - 2 * LCS characters (keep LCS in both).\n' +
      '4. Return m + n - 2 * dp[m][n].',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'The characters that remain after deletion must be common to both strings.',
      'Find the Longest Common Subsequence (LCS) of the two strings.',
      'Minimum deletions = total length of both strings - 2 * LCS length.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 588. Design In-Memory File System
  // ---------------------------------------------------------------------------
  {
    id: 588,
    description:
      'Design a data structure that simulates an in-memory file system. Implement the FileSystem class with ls, mkdir, addContentToFile, and readContentFromFile methods.',
    examples:
      'Input: ["FileSystem","ls","mkdir","addContentToFile","ls","readContentFromFile"]\n[[],["/"],["/a/b/c"],["/a/b/c/d","hello"],["/"],["/a/b/c/d"]]\nOutput: [null,[],null,null,["a"],"hello"]',
    approach:
      'Use a Trie-like structure where each node represents a directory or file. Each node has a dictionary of children and optional file content. Navigate the path and perform the appropriate operation.',
    code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.content = ""
        self.is_file = False

class FileSystem:
    def __init__(self):
        self.root = TrieNode()

    def ls(self, path: str) -> list[str]:
        node = self._navigate(path)
        if node.is_file:
            return [path.split('/')[-1]]
        return sorted(node.children.keys())

    def mkdir(self, path: str) -> None:
        self._navigate(path, create=True)

    def addContentToFile(self, filePath: str, content: str) -> None:
        node = self._navigate(filePath, create=True)
        node.is_file = True
        node.content += content

    def readContentFromFile(self, filePath: str) -> str:
        return self._navigate(filePath).content

    def _navigate(self, path: str, create: bool = False) -> TrieNode:
        node = self.root
        if path == '/':
            return node
        for part in path.split('/')[1:]:
            if part not in node.children:
                if create:
                    node.children[part] = TrieNode()
                else:
                    return node
            node = node.children[part]
        return node`,
    explanation:
      '1. Use a Trie with each node representing a directory or file.\n' +
      '2. ls: navigate to path, if file return its name, if directory return sorted children.\n' +
      '3. mkdir: navigate creating nodes along the way.\n' +
      '4. addContentToFile: navigate, mark as file, append content.',
    timeComplexity: 'O(m + n + k log k) for ls where m is path length, n is depth, k is entries',
    spaceComplexity: 'O(total content stored)',
    hints: [
      'A Trie-like structure naturally represents the directory hierarchy.',
      'Each node has children (subdirectories/files) and optional content.',
      'Split the path by "/" to navigate the Trie.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 590. N-ary Tree Postorder Traversal
  // ---------------------------------------------------------------------------
  {
    id: 590,
    description:
      'Given the root of an n-ary tree, return the postorder traversal of its nodes\' values. In postorder, children are visited before the root.',
    examples:
      'Input: root = [1,null,3,2,4,null,5,6]\nOutput: [5,6,3,2,4,1]',
    approach:
      'Use recursive DFS: visit all children first, then the root. Alternatively, use an iterative approach with a stack.',
    code: `class Solution:
    def postorder(self, root: 'Node') -> list[int]:
        result = []
        def dfs(node):
            if not node:
                return
            for child in node.children:
                dfs(child)
            result.append(node.val)
        dfs(root)
        return result`,
    explanation:
      '1. If the node is None, return.\n' +
      '2. Recursively visit all children first.\n' +
      '3. After visiting all children, append the current node\'s value.\n' +
      '4. This produces the postorder sequence.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'Postorder means visit all children before the current node.',
      'Use recursion: process children first, then append the root.',
      'An iterative approach can use a stack with reversed children.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 593. Valid Square
  // ---------------------------------------------------------------------------
  {
    id: 593,
    description:
      'Given the coordinates of four points in 2D space p1, p2, p3, p4, return true if the four points construct a valid square. A valid square has four equal sides and two equal diagonals.',
    examples:
      'Input: p1 = [0,0], p2 = [1,1], p3 = [1,0], p4 = [0,1]\nOutput: true',
    approach:
      'Compute all 6 pairwise distances. A valid square has exactly 4 equal sides and 2 equal diagonals (longer). Check that there are exactly 2 distinct distances with correct counts.',
    code: `class Solution:
    def validSquare(self, p1, p2, p3, p4) -> bool:
        def dist(a, b):
            return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
        dists = sorted([dist(p1, p2), dist(p1, p3), dist(p1, p4),
                        dist(p2, p3), dist(p2, p4), dist(p3, p4)])
        return (dists[0] > 0 and
                dists[0] == dists[1] == dists[2] == dists[3] and
                dists[4] == dists[5])`,
    explanation:
      '1. Compute squared distances between all 6 pairs of points.\n' +
      '2. Sort the distances.\n' +
      '3. The 4 smallest should be equal (sides) and the 2 largest should be equal (diagonals).\n' +
      '4. Ensure no side has length 0 (degenerate case).',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    hints: [
      'A square has 4 equal sides and 2 equal diagonals.',
      'Compute all pairwise distances and check the pattern.',
      'Use squared distances to avoid floating-point issues.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 605. Can Place Flowers
  // ---------------------------------------------------------------------------
  {
    id: 605,
    description:
      'You have a long flowerbed where some plots are planted (1) and some are empty (0). Flowers cannot be planted in adjacent plots. Given the flowerbed and n, return if n new flowers can be planted without violating the no-adjacent-flowers rule.',
    examples:
      'Input: flowerbed = [1,0,0,0,1], n = 1\nOutput: true',
    approach:
      'Greedily scan the flowerbed. If a position is 0 and both neighbors (or boundaries) are also 0, plant a flower there and decrement n. Return true if n reaches 0.',
    code: `class Solution:
    def canPlaceFlowers(self, flowerbed: list[int], n: int) -> bool:
        for i in range(len(flowerbed)):
            if flowerbed[i] == 0:
                left_empty = (i == 0 or flowerbed[i - 1] == 0)
                right_empty = (i == len(flowerbed) - 1 or flowerbed[i + 1] == 0)
                if left_empty and right_empty:
                    flowerbed[i] = 1
                    n -= 1
                    if n <= 0:
                        return True
        return n <= 0`,
    explanation:
      '1. Iterate through each plot in the flowerbed.\n' +
      '2. If the current plot and both neighbors are empty, plant a flower.\n' +
      '3. Mark the plot as planted and decrement n.\n' +
      '4. Return True as soon as n flowers are placed, or after scanning all plots.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Use a greedy approach: plant wherever possible from left to right.',
      'A position is valid if it and both its neighbors are empty.',
      'Handle boundary conditions: the first and last positions only have one neighbor.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 609. Find Duplicate File in System
  // ---------------------------------------------------------------------------
  {
    id: 609,
    description:
      'Given a list of directory info strings, each containing a directory path followed by files with their content in parentheses, find all groups of duplicate files (files with the same content). Return a list of groups, where each group contains file paths with the same content.',
    examples:
      'Input: paths = ["root/a 1.txt(abcd) 2.txt(efgh)","root/c 3.txt(abcd)"]\nOutput: [["root/a/1.txt","root/c/3.txt"]]',
    approach:
      'Parse each path string to extract directory, filename, and content. Use a hash map from content to list of file paths. Return only groups with more than one file.',
    code: `from collections import defaultdict

class Solution:
    def findDuplicate(self, paths: list[str]) -> list[list[str]]:
        content_map = defaultdict(list)
        for path in paths:
            parts = path.split(' ')
            directory = parts[0]
            for file_info in parts[1:]:
                name, content = file_info.split('(')
                content = content[:-1]
                content_map[content].append(directory + '/' + name)
        return [files for files in content_map.values() if len(files) > 1]`,
    explanation:
      '1. Parse each path string: first token is directory, rest are "filename(content)".\n' +
      '2. Split filename and content, and map content to full file paths.\n' +
      '3. After processing all paths, return groups with 2+ files (duplicates).\n' +
      '4. Files with the same content are grouped together.',
    timeComplexity: 'O(n * k) where n is paths and k is average files per path',
    spaceComplexity: 'O(n * k)',
    hints: [
      'Parse the directory path and file content from each string.',
      'Use a hash map to group files by content.',
      'Return only groups with more than one file.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 611. Valid Triangle Number
  // ---------------------------------------------------------------------------
  {
    id: 611,
    description:
      'Given an integer array nums, return the number of triplets chosen from the array that can make triangles if we take them as side lengths of a triangle. Three sides form a valid triangle if the sum of any two sides is greater than the third.',
    examples:
      'Input: nums = [2,2,3,4]\nOutput: 3\nExplanation: Valid triplets are (2,3,4), (2,3,4), (2,2,3).',
    approach:
      'Sort the array. Fix the largest side and use two pointers to find pairs where the sum exceeds the largest side. Since the array is sorted, we only need to check a + b > c.',
    code: `class Solution:
    def triangleNumber(self, nums: list[int]) -> int:
        nums.sort()
        count = 0
        for k in range(len(nums) - 1, 1, -1):
            i, j = 0, k - 1
            while i < j:
                if nums[i] + nums[j] > nums[k]:
                    count += j - i
                    j -= 1
                else:
                    i += 1
        return count`,
    explanation:
      '1. Sort the array in ascending order.\n' +
      '2. Fix the largest side (nums[k]) and use two pointers i, j for the other two sides.\n' +
      '3. If nums[i] + nums[j] > nums[k], all pairs (i..j-1, j) are valid, so add j-i.\n' +
      '4. Otherwise, increment i to increase the sum.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sort the array first. For a sorted array, you only need to check a + b > c.',
      'Fix the largest side and use two pointers for the smaller two.',
      'If nums[i] + nums[j] > nums[k], all indices between i and j work with j.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 617. Merge Two Binary Trees
  // ---------------------------------------------------------------------------
  {
    id: 617,
    description:
      'You are given two binary trees root1 and root2. Merge the two trees into a new binary tree. If two nodes overlap, sum their values. If one tree has a node where the other does not, use the existing node.',
    examples:
      'Input: root1 = [1,3,2,5], root2 = [2,1,3,null,4,null,7]\nOutput: [3,4,5,5,4,null,7]',
    approach:
      'Use recursion. If both nodes exist, create a new node with summed values and recurse on children. If only one exists, return it. If neither exists, return None.',
    code: `class Solution:
    def mergeTrees(self, root1, root2):
        if not root1:
            return root2
        if not root2:
            return root1
        root1.val += root2.val
        root1.left = self.mergeTrees(root1.left, root2.left)
        root1.right = self.mergeTrees(root1.right, root2.right)
        return root1`,
    explanation:
      '1. If one tree is None, return the other tree.\n' +
      '2. If both exist, add root2\'s value to root1.\n' +
      '3. Recursively merge left children and right children.\n' +
      '4. Return root1 as the merged tree.',
    timeComplexity: 'O(min(n, m)) where n, m are the sizes of the two trees',
    spaceComplexity: 'O(min(h1, h2))',
    hints: [
      'Recurse on both trees simultaneously.',
      'If one node is null, return the other node directly.',
      'If both nodes exist, sum the values and recurse on children.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 622. Design Circular Queue
  // ---------------------------------------------------------------------------
  {
    id: 622,
    description:
      'Design your implementation of the circular queue. The circular queue is a linear data structure that uses a fixed-size array and connects the end back to the beginning. Implement enQueue, deQueue, Front, Rear, isEmpty, and isFull.',
    examples:
      'Input: ["MyCircularQueue","enQueue","enQueue","deQueue","enQueue","Rear","isFull","Front"]\n[[3],[1],[2],[],[3],[],[],[]]  Output: [null,true,true,true,true,3,false,2]',
    approach:
      'Use a fixed-size array with head and tail pointers and a count. enQueue adds at tail, deQueue removes at head. Use modular arithmetic to wrap around.',
    code: `class MyCircularQueue:
    def __init__(self, k: int):
        self.queue = [0] * k
        self.head = 0
        self.count = 0
        self.capacity = k

    def enQueue(self, value: int) -> bool:
        if self.isFull():
            return False
        idx = (self.head + self.count) % self.capacity
        self.queue[idx] = value
        self.count += 1
        return True

    def deQueue(self) -> bool:
        if self.isEmpty():
            return False
        self.head = (self.head + 1) % self.capacity
        self.count -= 1
        return True

    def Front(self) -> int:
        return -1 if self.isEmpty() else self.queue[self.head]

    def Rear(self) -> int:
        return -1 if self.isEmpty() else self.queue[(self.head + self.count - 1) % self.capacity]

    def isEmpty(self) -> bool:
        return self.count == 0

    def isFull(self) -> bool:
        return self.count == self.capacity`,
    explanation:
      '1. Use a fixed array, head pointer, and count to track state.\n' +
      '2. enQueue: place value at (head + count) % capacity.\n' +
      '3. deQueue: advance head by 1, wrapping with modulo.\n' +
      '4. Front/Rear: return elements at head and (head + count - 1) % capacity.',
    timeComplexity: 'O(1) for all operations',
    spaceComplexity: 'O(k)',
    hints: [
      'Use a fixed-size array with head pointer and count.',
      'Use modular arithmetic to wrap around the array.',
      'Track count to determine empty/full status.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 623. Add One Row to Tree
  // ---------------------------------------------------------------------------
  {
    id: 623,
    description:
      'Given the root of a binary tree, an integer val, and an integer depth, add a row of nodes with value val at the given depth. The root node is at depth 1. For depth d, every node at depth d-1 gets new left and right children with value val, and the original subtrees become children of the new nodes.',
    examples:
      'Input: root = [4,2,6,3,1,5], val = 1, depth = 2\nOutput: [4,1,1,2,null,null,6,3,1,5]',
    approach:
      'Use BFS or DFS to reach depth d-1. At each node at depth d-1, create new nodes with val and attach the original children to the new nodes. Handle the special case when depth is 1.',
    code: `class Solution:
    def addOneRow(self, root, val: int, depth: int):
        if depth == 1:
            new_root = TreeNode(val)
            new_root.left = root
            return new_root
        def dfs(node, d):
            if not node:
                return
            if d == depth - 1:
                old_left, old_right = node.left, node.right
                node.left = TreeNode(val)
                node.right = TreeNode(val)
                node.left.left = old_left
                node.right.right = old_right
                return
            dfs(node.left, d + 1)
            dfs(node.right, d + 1)
        dfs(root, 1)
        return root`,
    explanation:
      '1. If depth is 1, create a new root with val and attach original tree as left child.\n' +
      '2. Otherwise, use DFS to find nodes at depth d-1.\n' +
      '3. At each such node, insert new nodes with val as children.\n' +
      '4. Attach original left subtree to new left node\'s left, right subtree to new right node\'s right.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'Find all nodes at depth d-1 using DFS or BFS.',
      'At each of these nodes, insert new children and reattach original subtrees.',
      'Handle depth == 1 as a special case (new root).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 630. Course Schedule III
  // ---------------------------------------------------------------------------
  {
    id: 630,
    description:
      'There are n courses, each with a duration and a deadline. You can only take one course at a time and must finish it before its deadline. Return the maximum number of courses you can take.',
    examples:
      'Input: courses = [[100,200],[200,1300],[1000,1250],[2000,3200]]\nOutput: 3',
    approach:
      'Sort courses by deadline. Use a max-heap to greedily add courses. If adding a course exceeds its deadline, replace the longest course taken so far if the current course is shorter.',
    code: `import heapq

class Solution:
    def scheduleCourse(self, courses: list[list[int]]) -> int:
        courses.sort(key=lambda x: x[1])
        heap = []
        time = 0
        for duration, deadline in courses:
            time += duration
            heapq.heappush(heap, -duration)
            if time > deadline:
                time += heapq.heappop(heap)
        return len(heap)`,
    explanation:
      '1. Sort courses by deadline (earliest deadline first).\n' +
      '2. Add each course; push its duration to a max-heap (negated for min-heap).\n' +
      '3. If total time exceeds the deadline, remove the longest course (frees most time).\n' +
      '4. The heap size at the end is the maximum number of courses.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Sort by deadline so you consider courses with earlier deadlines first.',
      'Use a greedy approach with a max-heap to track the longest courses taken.',
      'If a new course would exceed its deadline, swap out the longest course if beneficial.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 632. Smallest Range Covering Elements from K Lists
  // ---------------------------------------------------------------------------
  {
    id: 632,
    description:
      'You have k sorted lists of integers. Find the smallest range [a, b] that includes at least one number from each of the k lists.',
    examples:
      'Input: nums = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]\nOutput: [20,24]',
    approach:
      'Use a min-heap with one element from each list. Track the current max. The range is [heap_min, current_max]. Advance the min element\'s list and update until a list is exhausted.',
    code: `import heapq

class Solution:
    def smallestRange(self, nums: list[list[int]]) -> list[int]:
        heap = []
        cur_max = float('-inf')
        for i, lst in enumerate(nums):
            heapq.heappush(heap, (lst[0], i, 0))
            cur_max = max(cur_max, lst[0])
        best = [float('-inf'), float('inf')]
        while heap:
            cur_min, row, idx = heapq.heappop(heap)
            if cur_max - cur_min < best[1] - best[0]:
                best = [cur_min, cur_max]
            if idx + 1 == len(nums[row]):
                break
            nxt = nums[row][idx + 1]
            cur_max = max(cur_max, nxt)
            heapq.heappush(heap, (nxt, row, idx + 1))
        return best`,
    explanation:
      '1. Initialize heap with the first element from each list; track max.\n' +
      '2. The range [heap_min, cur_max] covers all k lists.\n' +
      '3. To shrink the range, pop the min and advance its list.\n' +
      '4. Update best range if smaller. Stop when any list is exhausted.',
    timeComplexity: 'O(n log k) where n is total elements',
    spaceComplexity: 'O(k)',
    hints: [
      'Maintain one element from each list in a min-heap.',
      'The range is always [heap_min, current_max].',
      'Pop the minimum and advance its list to try shrinking the range.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 633. Sum of Square Numbers
  // ---------------------------------------------------------------------------
  {
    id: 633,
    description:
      'Given a non-negative integer c, decide whether there exist two integers a and b such that a^2 + b^2 = c.',
    examples:
      'Input: c = 5\nOutput: true\nExplanation: 1^2 + 2^2 = 5.',
    approach:
      'Use two pointers: start with a = 0 and b = int(sqrt(c)). If a^2 + b^2 == c, return true. If too large, decrease b. If too small, increase a.',
    code: `import math

class Solution:
    def judgeSquareSum(self, c: int) -> bool:
        a = 0
        b = int(math.isqrt(c))
        while a <= b:
            total = a * a + b * b
            if total == c:
                return True
            elif total < c:
                a += 1
            else:
                b -= 1
        return False`,
    explanation:
      '1. Set a = 0 and b = floor(sqrt(c)).\n' +
      '2. Check if a^2 + b^2 == c.\n' +
      '3. If the sum is too small, increment a. If too large, decrement b.\n' +
      '4. Continue until a > b. If no pair found, return False.',
    timeComplexity: 'O(sqrt(c))',
    spaceComplexity: 'O(1)',
    hints: [
      'Use two pointers: one starting at 0, the other at sqrt(c).',
      'Adjust pointers based on whether the sum is too small or too large.',
      'This is similar to the two-sum problem on a sorted array.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 636. Exclusive Time of Functions
  // ---------------------------------------------------------------------------
  {
    id: 636,
    description:
      'On a single-threaded CPU, we execute n functions. Each function has a unique ID, and logs record "start" and "end" events with timestamps. Functions can call other functions (nested). Return the exclusive time of each function (total time not spent in called functions).',
    examples:
      'Input: n = 2, logs = ["0:start:0","1:start:2","1:end:5","0:end:6"]\nOutput: [3,4]',
    approach:
      'Use a stack to track the currently executing function. When a new function starts, pause the current one. When a function ends, calculate its time and resume the previous one.',
    code: `class Solution:
    def exclusiveTime(self, n: int, logs: list[str]) -> list[int]:
        result = [0] * n
        stack = []
        prev_time = 0
        for log in logs:
            parts = log.split(':')
            fid, typ, time = int(parts[0]), parts[1], int(parts[2])
            if typ == 'start':
                if stack:
                    result[stack[-1]] += time - prev_time
                stack.append(fid)
                prev_time = time
            else:
                result[stack.pop()] += time - prev_time + 1
                prev_time = time + 1
        return result`,
    explanation:
      '1. Use a stack to track active function IDs.\n' +
      '2. On start: add elapsed time to the current top function, push new function.\n' +
      '3. On end: add elapsed time (inclusive) to the ending function, pop it.\n' +
      '4. prev_time tracks the last processed timestamp.',
    timeComplexity: 'O(m) where m is the number of logs',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a stack to track nested function calls.',
      'When a function starts, the previous function\'s time is paused.',
      'End timestamps are inclusive, so add 1 when computing elapsed time.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 637. Average of Levels in Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 637,
    description:
      'Given the root of a binary tree, return the average value of the nodes on each level in the form of an array.',
    examples:
      'Input: root = [3,9,20,null,null,15,7]\nOutput: [3.0,14.5,11.0]',
    approach:
      'Use BFS (level-order traversal). For each level, compute the sum and count of nodes, then calculate the average.',
    code: `from collections import deque

class Solution:
    def averageOfLevels(self, root) -> list[float]:
        result = []
        queue = deque([root])
        while queue:
            level_size = len(queue)
            level_sum = 0
            for _ in range(level_size):
                node = queue.popleft()
                level_sum += node.val
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            result.append(level_sum / level_size)
        return result`,
    explanation:
      '1. Use a queue for level-order (BFS) traversal.\n' +
      '2. For each level, process all nodes and sum their values.\n' +
      '3. Divide the sum by the number of nodes in that level.\n' +
      '4. Append the average to the result list.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(w) where w is the maximum width of the tree',
    hints: [
      'Use BFS to process nodes level by level.',
      'Track the sum and count for each level.',
      'The average is sum / count for each level.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 642. Design Search Autocomplete System
  // ---------------------------------------------------------------------------
  {
    id: 642,
    description:
      'Design a search autocomplete system. Users type characters one by one. For each character typed, return the top 3 historical hot sentences that match the prefix typed so far. If two sentences have the same frequency, sort alphabetically. Typing "#" means the sentence is finished and should be recorded.',
    examples:
      'Input: ["AutocompleteSystem","input","input","input","input"]\n[[["i love you","island","iroman","i love leetcode"],[5,3,2,2]],["i"],[" "],["a"],["#"]]\nOutput: [null,["i love you","island","i love leetcode"],["i love you","i love leetcode"],[],[]',
    approach:
      'Use a Trie to store sentences with their frequencies. On each character input, traverse the Trie to find matching sentences. On "#", record the current sentence in the Trie.',
    code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.sentences = {}

class AutocompleteSystem:
    def __init__(self, sentences: list[str], times: list[int]):
        self.root = TrieNode()
        self.cur = self.root
        self.search = ""
        for s, t in zip(sentences, times):
            self._add(s, t)

    def _add(self, sentence, count):
        node = self.root
        for c in sentence:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
            node.sentences[sentence] = node.sentences.get(sentence, 0) + count

    def input(self, c: str) -> list[str]:
        if c == '#':
            self._add(self.search, 1)
            self.search = ""
            self.cur = self.root
            return []
        self.search += c
        if self.cur and c in self.cur.children:
            self.cur = self.cur.children[c]
            pairs = self.cur.sentences.items()
            result = sorted(pairs, key=lambda x: (-x[1], x[0]))
            return [s for s, _ in result[:3]]
        else:
            self.cur = None
            return []`,
    explanation:
      '1. Build a Trie where each node stores all sentences passing through it with frequencies.\n' +
      '2. On character input, traverse the Trie and return top 3 by frequency (then alphabetical).\n' +
      '3. On "#", add the current search to the Trie and reset.\n' +
      '4. If the current path doesn\'t exist in the Trie, return empty list.',
    timeComplexity: 'O(n log n) per input for sorting, O(L) for adding where L is sentence length',
    spaceComplexity: 'O(total characters * sentences)',
    hints: [
      'Use a Trie that stores matching sentences at each node.',
      'On each character, traverse to the next Trie node and return top matches.',
      'On "#", save the typed sentence to the Trie.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 645. Set Mismatch
  // ---------------------------------------------------------------------------
  {
    id: 645,
    description:
      'You have a set of integers from 1 to n. One number got duplicated and one got lost. Given the array nums, find the number that occurs twice and the number that is missing.',
    examples:
      'Input: nums = [1,2,2,4]\nOutput: [2,3]',
    approach:
      'Use a set or counting approach. The sum difference between expected and actual gives the missing - duplicate relationship. Alternatively, use a set to find the duplicate and compute the missing from the sum.',
    code: `class Solution:
    def findErrorNums(self, nums: list[int]) -> list[int]:
        n = len(nums)
        num_set = set()
        duplicate = -1
        for num in nums:
            if num in num_set:
                duplicate = num
            num_set.add(num)
        expected_sum = n * (n + 1) // 2
        actual_sum = sum(nums)
        missing = expected_sum - actual_sum + duplicate
        return [duplicate, missing]`,
    explanation:
      '1. Iterate through nums to find the duplicate using a set.\n' +
      '2. Compute expected sum = n*(n+1)/2 and actual sum of nums.\n' +
      '3. missing = expected_sum - actual_sum + duplicate.\n' +
      '4. Return [duplicate, missing].',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a set to find the number that appears twice.',
      'The expected sum of 1..n minus the actual sum gives (missing - duplicate).',
      'Combine the duplicate from the set with the sum relationship to find the missing number.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 648. Replace Words
  // ---------------------------------------------------------------------------
  {
    id: 648,
    description:
      'Given a dictionary consisting of many roots and a sentence consisting of words separated by spaces, replace each word in the sentence with the shortest root that is a prefix of it. If a word has no matching root, keep it unchanged.',
    examples:
      'Input: dictionary = ["cat","bat","rat"], sentence = "the cattle was rattled by the battery"\nOutput: "the cat was rat by the bat"',
    approach:
      'Build a Trie from the dictionary roots. For each word in the sentence, traverse the Trie to find the shortest matching prefix (root). Replace the word with the root if found.',
    code: `class Solution:
    def replaceWords(self, dictionary: list[str], sentence: str) -> str:
        root_set = set(dictionary)
        def find_root(word):
            for i in range(1, len(word) + 1):
                prefix = word[:i]
                if prefix in root_set:
                    return prefix
            return word
        return ' '.join(find_root(word) for word in sentence.split())`,
    explanation:
      '1. Store all dictionary roots in a set for O(1) lookup.\n' +
      '2. For each word, check prefixes of increasing length.\n' +
      '3. Return the shortest prefix that exists in the dictionary.\n' +
      '4. If no prefix matches, keep the original word.',
    timeComplexity: 'O(n * k) where n is words and k is average word length',
    spaceComplexity: 'O(d) where d is total characters in dictionary',
    hints: [
      'A Trie or hash set of roots allows efficient prefix matching.',
      'For each word, check prefixes from shortest to longest.',
      'Return the first matching prefix (shortest root).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 652. Find Duplicate Subtrees
  // ---------------------------------------------------------------------------
  {
    id: 652,
    description:
      'Given the root of a binary tree, return all duplicate subtrees. Two trees are duplicates if they have the same structure and node values. Return the root node of any one duplicate for each group.',
    examples:
      'Input: root = [1,2,3,4,null,2,4,null,null,4]\nOutput: [[2,4],[4]]',
    approach:
      'Serialize each subtree using postorder traversal. Use a hash map to count serialized forms. When a serialization appears the second time, add the subtree root to the result.',
    code: `from collections import defaultdict

class Solution:
    def findDuplicateSubtrees(self, root):
        count = defaultdict(int)
        result = []
        def serialize(node):
            if not node:
                return '#'
            s = f'{node.val},{serialize(node.left)},{serialize(node.right)}'
            count[s] += 1
            if count[s] == 2:
                result.append(node)
            return s
        serialize(root)
        return result`,
    explanation:
      '1. Serialize each subtree using a postorder string representation.\n' +
      '2. Use a hash map to count occurrences of each serialization.\n' +
      '3. When a serialization appears exactly twice, add the root to the result.\n' +
      '4. This avoids adding duplicates more than once.',
    timeComplexity: 'O(n^2) due to string creation',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Serialize each subtree to a unique string representation.',
      'Use a hash map to track how many times each serialization appears.',
      'Add to the result when a serialization appears the second time.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 653. Two Sum IV - Input is a BST
  // ---------------------------------------------------------------------------
  {
    id: 653,
    description:
      'Given the root of a Binary Search Tree and a target number k, return true if there exist two elements in the BST such that their sum is equal to the given target.',
    examples:
      'Input: root = [5,3,6,2,4,null,7], k = 9\nOutput: true\nExplanation: 2 + 7 = 9.',
    approach:
      'Use in-order traversal to get sorted values, then use two pointers. Alternatively, use DFS with a hash set to check if (k - node.val) has been seen.',
    code: `class Solution:
    def findTarget(self, root, k: int) -> bool:
        seen = set()
        def dfs(node):
            if not node:
                return False
            if k - node.val in seen:
                return True
            seen.add(node.val)
            return dfs(node.left) or dfs(node.right)
        return dfs(root)`,
    explanation:
      '1. Use DFS to traverse the tree.\n' +
      '2. For each node, check if (k - node.val) is in the seen set.\n' +
      '3. If yes, two numbers sum to k.\n' +
      '4. Otherwise, add node.val to seen and continue.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'This is Two Sum applied to a BST.',
      'Use a set to track visited values.',
      'For each node, check if the complement (k - val) has been seen.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 654. Maximum Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 654,
    description:
      'You are given an integer array with no duplicates. A maximum binary tree is built on this array as follows: the root is the maximum element, the left subtree is built from elements to the left of the max, and the right subtree from elements to the right.',
    examples:
      'Input: nums = [3,2,1,6,0,5]\nOutput: [6,3,5,null,2,0,null,null,1]',
    approach:
      'Recursively find the max element, create a node, and build left and right subtrees from the respective subarrays.',
    code: `class Solution:
    def constructMaximumBinaryTree(self, nums: list[int]):
        if not nums:
            return None
        max_idx = nums.index(max(nums))
        node = TreeNode(nums[max_idx])
        node.left = self.constructMaximumBinaryTree(nums[:max_idx])
        node.right = self.constructMaximumBinaryTree(nums[max_idx + 1:])
        return node`,
    explanation:
      '1. Find the index of the maximum element in the array.\n' +
      '2. Create a TreeNode with the maximum value.\n' +
      '3. Recursively build the left subtree from elements before the max.\n' +
      '4. Recursively build the right subtree from elements after the max.',
    timeComplexity: 'O(n^2) worst case, O(n log n) average',
    spaceComplexity: 'O(n)',
    hints: [
      'The root is always the maximum element in the current range.',
      'Recursively apply the same logic to the left and right portions.',
      'A monotonic stack approach can achieve O(n) time.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 655. Print Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 655,
    description:
      'Given the root of a binary tree, construct a matrix to display it. The matrix has height rows and 2^height - 1 columns. Place the root at the middle of the first row, and recursively place children at the midpoints of their respective sections.',
    examples:
      'Input: root = [1,2,3,null,4]\nOutput: [["","","","1","","",""],["","2","","","","3",""],["","","4","","","",""]]',
    approach:
      'First compute the tree height to determine dimensions. Then use DFS to place each node at the correct row and column position based on the formula.',
    code: `class Solution:
    def printTree(self, root) -> list[list[str]]:
        def height(node):
            if not node:
                return 0
            return 1 + max(height(node.left), height(node.right))
        h = height(root)
        cols = (1 << h) - 1
        result = [[''] * cols for _ in range(h)]
        def fill(node, r, left, right):
            if not node:
                return
            mid = (left + right) // 2
            result[r][mid] = str(node.val)
            fill(node.left, r + 1, left, mid - 1)
            fill(node.right, r + 1, mid + 1, right)
        fill(root, 0, 0, cols - 1)
        return result`,
    explanation:
      '1. Compute the height of the tree to determine the matrix dimensions.\n' +
      '2. The matrix has height rows and 2^height - 1 columns.\n' +
      '3. Place each node at the midpoint of its column range.\n' +
      '4. Left child uses the left half, right child uses the right half.',
    timeComplexity: 'O(n + h * 2^h)',
    spaceComplexity: 'O(h * 2^h)',
    hints: [
      'First compute the tree height to know the matrix size.',
      'Each node goes at the midpoint of its available column range.',
      'Recursively divide the column range for left and right children.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 657. Robot Return to Origin
  // ---------------------------------------------------------------------------
  {
    id: 657,
    description:
      'There is a robot starting at the origin (0, 0) on a 2D plane. Given a sequence of its moves (U, D, L, R), judge if the robot returns to the origin after completing all moves.',
    examples:
      'Input: moves = "UD"\nOutput: true',
    approach:
      'Count the occurrences of each move. The robot returns to the origin if the number of U equals D and the number of L equals R.',
    code: `class Solution:
    def judgeCircle(self, moves: str) -> bool:
        return moves.count('U') == moves.count('D') and moves.count('L') == moves.count('R')`,
    explanation:
      '1. Count occurrences of U, D, L, R.\n' +
      '2. U and D cancel out vertically; L and R cancel out horizontally.\n' +
      '3. The robot returns to origin if U == D and L == R.\n' +
      '4. Simple counting solves this in O(n).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Track the net horizontal and vertical displacement.',
      'U and D cancel each other; L and R cancel each other.',
      'The robot returns to origin if both displacements are zero.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 658. Find K Closest Elements
  // ---------------------------------------------------------------------------
  {
    id: 658,
    description:
      'Given a sorted integer array arr, two integers k and x, return the k closest integers to x in the array. The result should also be sorted in ascending order. An integer a is closer to x than b if |a - x| < |b - x|, or |a - x| == |b - x| and a < b.',
    examples:
      'Input: arr = [1,2,3,4,5], k = 4, x = 3\nOutput: [1,2,3,4]',
    approach:
      'Use binary search to find the left boundary of the k-element window. The window starts at some index i and includes arr[i..i+k-1]. Binary search for the optimal starting index.',
    code: `class Solution:
    def findClosestElements(self, arr: list[int], k: int, x: int) -> list[int]:
        lo, hi = 0, len(arr) - k
        while lo < hi:
            mid = (lo + hi) // 2
            if x - arr[mid] > arr[mid + k] - x:
                lo = mid + 1
            else:
                hi = mid
        return arr[lo:lo + k]`,
    explanation:
      '1. Binary search for the starting index of the k-element window.\n' +
      '2. Compare distances: if x is closer to arr[mid+k] than arr[mid], shift right.\n' +
      '3. Otherwise, shift left.\n' +
      '4. Return arr[lo:lo+k] which is the closest k elements.',
    timeComplexity: 'O(log(n - k) + k)',
    spaceComplexity: 'O(1)',
    hints: [
      'The result is a contiguous window of k elements in the sorted array.',
      'Binary search for the starting position of this window.',
      'Compare the distance of the left and right boundaries to x.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 659. Split Array into Consecutive Subsequences
  // ---------------------------------------------------------------------------
  {
    id: 659,
    description:
      'Given an integer array nums sorted in non-decreasing order, return true if you can split it into one or more subsequences such that each subsequence consists of consecutive integers and has a length of at least 3.',
    examples:
      'Input: nums = [1,2,3,3,4,5]\nOutput: true\nExplanation: [1,2,3] and [3,4,5].',
    approach:
      'Use a greedy approach with two maps: one for remaining counts and one for tails (subsequences ending at a value that can be extended). For each number, try to extend an existing subsequence first, then start a new one.',
    code: `from collections import Counter

class Solution:
    def isPossible(self, nums: list[int]) -> bool:
        remain = Counter(nums)
        tails = Counter()
        for num in nums:
            if remain[num] == 0:
                continue
            if tails[num] > 0:
                tails[num] -= 1
                tails[num + 1] += 1
            elif remain[num + 1] > 0 and remain[num + 2] > 0:
                remain[num + 1] -= 1
                remain[num + 2] -= 1
                tails[num + 3] += 1
            else:
                return False
            remain[num] -= 1
        return True`,
    explanation:
      '1. remain counts how many of each number are left to assign.\n' +
      '2. tails counts how many subsequences can be extended with a given number.\n' +
      '3. For each number, prefer extending an existing subsequence.\n' +
      '4. If not possible, try starting a new subsequence of length 3. If neither works, return False.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Greedily extend existing subsequences before starting new ones.',
      'Use a "tails" counter to track subsequences waiting for the next number.',
      'Starting a new subsequence requires num+1 and num+2 to be available.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 662. Maximum Width of Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 662,
    description:
      'Given the root of a binary tree, return the maximum width of the given tree. The maximum width is the maximum among the widths of each level. The width of one level is defined as the length between the end-nodes (the leftmost and rightmost non-null nodes), including null nodes in between.',
    examples:
      'Input: root = [1,3,2,5,3,null,9]\nOutput: 4\nExplanation: Level 3 has width 4 (from node 5 to node 9).',
    approach:
      'Use BFS with position indexing. Assign each node a position (root = 0, left child = 2*pos, right = 2*pos+1). The width at each level is rightmost - leftmost + 1.',
    code: `from collections import deque

class Solution:
    def widthOfBinaryTree(self, root) -> int:
        if not root:
            return 0
        max_width = 0
        queue = deque([(root, 0)])
        while queue:
            level_size = len(queue)
            _, first_pos = queue[0]
            for _ in range(level_size):
                node, pos = queue.popleft()
                if node.left:
                    queue.append((node.left, 2 * pos))
                if node.right:
                    queue.append((node.right, 2 * pos + 1))
            max_width = max(max_width, pos - first_pos + 1)
        return max_width`,
    explanation:
      '1. Assign positions using heap indexing: root=0, left=2*pos, right=2*pos+1.\n' +
      '2. Use BFS to traverse level by level.\n' +
      '3. Width at each level = last position - first position + 1.\n' +
      '4. Track the maximum width across all levels.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use position indices to account for null nodes in width calculation.',
      'Assign positions like a complete binary tree array representation.',
      'Width is the difference between rightmost and leftmost positions + 1.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 670. Maximum Swap
  // ---------------------------------------------------------------------------
  {
    id: 670,
    description:
      'You are given an integer num. You can swap two digits at most once to get the maximum valued number. Return the maximum valued number you can get.',
    examples:
      'Input: num = 2736\nOutput: 7236',
    approach:
      'For each digit, check if there is a larger digit to its right. If so, swap with the rightmost occurrence of the largest such digit to maximize the result.',
    code: `class Solution:
    def maximumSwap(self, num: int) -> int:
        digits = list(str(num))
        last = {int(d): i for i, d in enumerate(digits)}
        for i, d in enumerate(digits):
            for k in range(9, int(d), -1):
                if last.get(k, -1) > i:
                    digits[i], digits[last[k]] = digits[last[k]], digits[i]
                    return int(''.join(digits))
        return num`,
    explanation:
      '1. Record the last occurrence index of each digit (0-9).\n' +
      '2. From left to right, for each digit, check if a larger digit exists to its right.\n' +
      '3. Swap with the rightmost occurrence of the largest available digit.\n' +
      '4. Return the result after at most one swap.',
    timeComplexity: 'O(n) where n is the number of digits',
    spaceComplexity: 'O(n)',
    hints: [
      'Record the last position of each digit (0-9).',
      'Scan from left: for each digit, check if a larger digit appears later.',
      'Swap with the rightmost largest digit for maximum impact.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 673. Number of Longest Increasing Subsequence
  // ---------------------------------------------------------------------------
  {
    id: 673,
    description:
      'Given an integer array nums, return the number of longest increasing subsequences. Note that the sequence must be strictly increasing.',
    examples:
      'Input: nums = [1,3,5,4,7]\nOutput: 2\nExplanation: The two longest increasing subsequences are [1,3,4,7] and [1,3,5,7].',
    approach:
      'Use DP with two arrays: length[i] for the longest increasing subsequence ending at i, and count[i] for the number of such subsequences. Update both arrays as you process each element.',
    code: `class Solution:
    def findNumberOfLIS(self, nums: list[int]) -> int:
        n = len(nums)
        length = [1] * n
        count = [1] * n
        for i in range(1, n):
            for j in range(i):
                if nums[j] < nums[i]:
                    if length[j] + 1 > length[i]:
                        length[i] = length[j] + 1
                        count[i] = count[j]
                    elif length[j] + 1 == length[i]:
                        count[i] += count[j]
        max_len = max(length)
        return sum(c for l, c in zip(length, count) if l == max_len)`,
    explanation:
      '1. length[i] = length of longest increasing subsequence ending at i.\n' +
      '2. count[i] = number of longest increasing subsequences ending at i.\n' +
      '3. For each pair (j, i) where nums[j] < nums[i], update length and count.\n' +
      '4. Sum counts of all positions where length equals the global maximum.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    hints: [
      'Extend the standard LIS DP to also track the count.',
      'When you find a longer subsequence ending at j, reset the count.',
      'When you find an equally long subsequence, add to the count.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 674. Longest Continuous Increasing Subsequence
  // ---------------------------------------------------------------------------
  {
    id: 674,
    description:
      'Given an unsorted array of integers nums, return the length of the longest continuous increasing subsequence (subarray). The subsequence must be strictly increasing and contiguous.',
    examples:
      'Input: nums = [1,3,5,4,7]\nOutput: 3\nExplanation: [1,3,5] is the longest continuous increasing subsequence.',
    approach:
      'Use a single pass with a counter. Increment the counter when the current element is greater than the previous. Reset when it is not. Track the maximum.',
    code: `class Solution:
    def findLengthOfLCIS(self, nums: list[int]) -> int:
        if not nums:
            return 0
        max_len = 1
        cur_len = 1
        for i in range(1, len(nums)):
            if nums[i] > nums[i - 1]:
                cur_len += 1
                max_len = max(max_len, cur_len)
            else:
                cur_len = 1
        return max_len`,
    explanation:
      '1. Track the current length of the increasing run.\n' +
      '2. If nums[i] > nums[i-1], extend the run.\n' +
      '3. Otherwise, reset the run length to 1.\n' +
      '4. Track the maximum run length throughout.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'A contiguous increasing sequence breaks when an element is not greater than the previous.',
      'Keep a running count and reset when the sequence breaks.',
      'Track the maximum count seen.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 676. Implement Magic Dictionary
  // ---------------------------------------------------------------------------
  {
    id: 676,
    description:
      'Design a data structure that is initialized with a list of distinct words. Implement a function that determines if a given string can match any word in the dictionary by changing exactly one character.',
    examples:
      'Input: ["MagicDictionary","buildDict","search","search","search"]\n[[],[[\"hello\",\"leetcode\"]],["hello"],["hhllo"],["hell"]]\nOutput: [null,null,false,true,false]',
    approach:
      'Store the words. For search, compare the query with each word of the same length. Count character differences. Return true if exactly one difference is found.',
    code: `class MagicDictionary:
    def __init__(self):
        self.words = []

    def buildDict(self, dictionary: list[str]) -> None:
        self.words = dictionary

    def search(self, searchWord: str) -> bool:
        for word in self.words:
            if len(word) != len(searchWord):
                continue
            diff = sum(1 for a, b in zip(word, searchWord) if a != b)
            if diff == 1:
                return True
        return False`,
    explanation:
      '1. Store the dictionary words.\n' +
      '2. For each search, compare with every word of the same length.\n' +
      '3. Count character differences between the search word and each dictionary word.\n' +
      '4. If exactly one character differs, return True.',
    timeComplexity: 'O(n * k) per search where n is dict size and k is word length',
    spaceComplexity: 'O(n * k)',
    hints: [
      'For each search, compare against all words of the same length.',
      'Count the number of differing characters.',
      'Return true if exactly one character is different.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 677. Map Sum Pairs
  // ---------------------------------------------------------------------------
  {
    id: 677,
    description:
      'Design a map that receives a list of key-value pairs and returns the sum of all values whose keys start with a given prefix. Implement insert(key, val) and sum(prefix).',
    examples:
      'Input: ["MapSum","insert","sum","insert","sum"]\n[[],["apple",3],["ap"],["app",2],["ap"]]\nOutput: [null,null,3,null,5]',
    approach:
      'Use a Trie where each node stores the sum of values of all keys passing through it. On insert, update the delta (new value - old value) along the path. On sum, return the value at the prefix node.',
    code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.total = 0

class MapSum:
    def __init__(self):
        self.root = TrieNode()
        self.map = {}

    def insert(self, key: str, val: int) -> None:
        delta = val - self.map.get(key, 0)
        self.map[key] = val
        node = self.root
        for c in key:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
            node.total += delta

    def sum(self, prefix: str) -> int:
        node = self.root
        for c in prefix:
            if c not in node.children:
                return 0
            node = node.children[c]
        return node.total`,
    explanation:
      '1. Each Trie node stores the sum of all values passing through it.\n' +
      '2. On insert, compute delta = new_val - old_val and update each node along the path.\n' +
      '3. On sum, traverse to the prefix node and return its total.\n' +
      '4. The map tracks existing key values for computing deltas on updates.',
    timeComplexity: 'O(k) for both insert and sum where k is key/prefix length',
    spaceComplexity: 'O(total characters inserted)',
    hints: [
      'A Trie naturally supports prefix operations.',
      'Store cumulative sums at each node for efficient prefix sum queries.',
      'Handle updates by computing the delta from the old value.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 682. Baseball Game
  // ---------------------------------------------------------------------------
  {
    id: 682,
    description:
      'You are keeping score for a baseball game with strange rules. Given a list of operations, apply them: an integer records a new score, "+" records the sum of the previous two, "D" records double the previous, "C" invalidates the previous score. Return the sum of all scores.',
    examples:
      'Input: ops = ["5","2","C","D","+"]\nOutput: 30\nExplanation: 5, 2, remove 2, 5*2=10, 5+10=15. Sum = 5+10+15 = 30.',
    approach:
      'Use a stack to track valid scores. Process each operation: push numbers, pop for "C", push double or sum for "D" and "+". Return the sum of the stack.',
    code: `class Solution:
    def calPoints(self, operations: list[str]) -> int:
        stack = []
        for op in operations:
            if op == 'C':
                stack.pop()
            elif op == 'D':
                stack.append(stack[-1] * 2)
            elif op == '+':
                stack.append(stack[-1] + stack[-2])
            else:
                stack.append(int(op))
        return sum(stack)`,
    explanation:
      '1. Use a stack to maintain the list of valid scores.\n' +
      '2. For a number, push it to the stack.\n' +
      '3. For "C", pop the last score. For "D", push double the last. For "+", push sum of last two.\n' +
      '4. Return the sum of all elements in the stack.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'A stack is perfect for tracking the current list of valid scores.',
      'Process operations in order, modifying the stack accordingly.',
      'At the end, sum all remaining scores in the stack.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 688. Knight Probability in Chessboard
  // ---------------------------------------------------------------------------
  {
    id: 688,
    description:
      'On an n x n chessboard, a knight starts at the cell (row, column) and makes exactly k moves. Each move is chosen uniformly at random from the 8 possible knight moves. Return the probability that the knight remains on the board after k moves.',
    examples:
      'Input: n = 3, k = 2, row = 0, column = 0\nOutput: 0.0625',
    approach:
      'Use dynamic programming. dp[step][r][c] is the probability of being at (r,c) after step moves. For each step, for each cell, distribute the probability equally to all 8 possible destinations that are on the board.',
    code: `class Solution:
    def knightProbability(self, n: int, k: int, row: int, column: int) -> float:
        dp = [[0.0] * n for _ in range(n)]
        dp[row][column] = 1.0
        moves = [(-2,-1),(-2,1),(-1,-2),(-1,2),(1,-2),(1,2),(2,-1),(2,1)]
        for _ in range(k):
            new_dp = [[0.0] * n for _ in range(n)]
            for r in range(n):
                for c in range(n):
                    if dp[r][c] > 0:
                        for dr, dc in moves:
                            nr, nc = r + dr, c + dc
                            if 0 <= nr < n and 0 <= nc < n:
                                new_dp[nr][nc] += dp[r][c] / 8.0
            dp = new_dp
        return sum(dp[r][c] for r in range(n) for c in range(n))`,
    explanation:
      '1. Start with probability 1.0 at the initial position.\n' +
      '2. For each move, distribute probability from each cell to its 8 knight moves.\n' +
      '3. Only moves that land on the board are counted (off-board moves reduce probability).\n' +
      '4. After k moves, sum all probabilities on the board.',
    timeComplexity: 'O(k * n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Use DP where each state is (step, row, col) with the probability.',
      'From each cell, distribute probability equally to 8 knight moves.',
      'Off-board moves naturally reduce the total probability.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 689. Maximum Sum of 3 Non-Overlapping Subarrays
  // ---------------------------------------------------------------------------
  {
    id: 689,
    description:
      'Given an integer array nums and an integer k, find three non-overlapping subarrays of length k with maximum sum. Return the starting indices. If there are multiple answers, return the lexicographically smallest one.',
    examples:
      'Input: nums = [1,2,1,2,6,7,5,1], k = 2\nOutput: [0,3,5]',
    approach:
      'Compute prefix sums, then for each possible middle subarray position, find the best left and right subarrays using precomputed arrays of best left starting index and best right starting index.',
    code: `class Solution:
    def maxSumOfThreeSubarrays(self, nums: list[int], k: int) -> list[int]:
        n = len(nums)
        sums = [0] * (n - k + 1)
        s = sum(nums[:k])
        sums[0] = s
        for i in range(1, n - k + 1):
            s += nums[i + k - 1] - nums[i - 1]
            sums[i] = s
        left = [0] * len(sums)
        best = 0
        for i in range(len(sums)):
            if sums[i] > sums[best]:
                best = i
            left[i] = best
        right = [0] * len(sums)
        best = len(sums) - 1
        for i in range(len(sums) - 1, -1, -1):
            if sums[i] >= sums[best]:
                best = i
            right[i] = best
        result = [-1, -1, -1]
        max_sum = 0
        for j in range(k, len(sums) - k):
            l, r = left[j - k], right[j + k]
            total = sums[l] + sums[j] + sums[r]
            if total > max_sum:
                max_sum = total
                result = [l, j, r]
        return result`,
    explanation:
      '1. Compute subarray sums of length k for each starting position.\n' +
      '2. Build left[i]: index of best subarray sum in [0..i].\n' +
      '3. Build right[i]: index of best subarray sum in [i..end].\n' +
      '4. For each middle position j, find best left and right and track maximum total.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Precompute all subarray sums of length k.',
      'For each middle subarray, find the best left and right subarrays.',
      'Use prefix arrays to precompute the best left and right indices.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 692. Top K Frequent Words
  // ---------------------------------------------------------------------------
  {
    id: 692,
    description:
      'Given an array of strings words and an integer k, return the k most frequent strings. Return the answer sorted by frequency from highest to lowest. If two words have the same frequency, sort them lexicographically.',
    examples:
      'Input: words = ["i","love","leetcode","i","love","coding"], k = 2\nOutput: ["i","love"]',
    approach:
      'Use a Counter to count frequencies, then sort by (-frequency, word) to handle ties lexicographically. Return the first k results.',
    code: `from collections import Counter

class Solution:
    def topKFrequent(self, words: list[str], k: int) -> list[str]:
        count = Counter(words)
        return sorted(count.keys(), key=lambda w: (-count[w], w))[:k]`,
    explanation:
      '1. Count word frequencies using Counter.\n' +
      '2. Sort words by (-frequency, word) so higher frequency comes first, ties broken alphabetically.\n' +
      '3. Return the first k words from the sorted list.\n' +
      '4. Using negative frequency reverses the sort order for frequency.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Count frequencies with a hash map.',
      'Sort by frequency descending, then alphabetically for ties.',
      'A heap of size k can also solve this efficiently.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 694. Number of Distinct Islands
  // ---------------------------------------------------------------------------
  {
    id: 694,
    description:
      'Given an m x n binary grid, count the number of distinct islands. An island is a group of 1s connected 4-directionally. Two islands are considered the same if one can be translated to match the other.',
    examples:
      'Input: grid = [[1,1,0,0,0],[1,1,0,0,0],[0,0,0,1,1],[0,0,0,1,1]]\nOutput: 1',
    approach:
      'Use DFS to explore each island. Record the shape by storing relative positions (offset from the starting cell). Store shapes in a set to count distinct islands.',
    code: `class Solution:
    def numDistinctIslands(self, grid: list[list[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        visited = set()
        shapes = set()
        def dfs(r, c, r0, c0, shape):
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == 0 or (r, c) in visited:
                return
            visited.add((r, c))
            shape.append((r - r0, c - c0))
            for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                dfs(r + dr, c + dc, r0, c0, shape)
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1 and (r, c) not in visited:
                    shape = []
                    dfs(r, c, r, c, shape)
                    shapes.add(tuple(shape))
        return len(shapes)`,
    explanation:
      '1. DFS from each unvisited land cell to find the island.\n' +
      '2. Record each cell\'s position relative to the starting cell (r0, c0).\n' +
      '3. The tuple of relative positions represents the island\'s shape.\n' +
      '4. Use a set of shape tuples to count distinct islands.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Two islands are the same if they have the same shape (translation invariant).',
      'Record relative positions from the starting cell for each island.',
      'Use a set of shape tuples to track distinct islands.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 698. Partition to K Equal Sum Subsets
  // ---------------------------------------------------------------------------
  {
    id: 698,
    description:
      'Given an integer array nums and an integer k, return true if it is possible to divide this array into k non-empty subsets whose sums are all equal.',
    examples:
      'Input: nums = [4,3,2,3,5,2,1], k = 4\nOutput: true\nExplanation: 4 subsets with equal sum 5: (5), (1,4), (2,3), (2,3).',
    approach:
      'Check if total sum is divisible by k. Use backtracking with a bitmask to try assigning each number to one of k buckets. Sort in descending order and prune early.',
    code: `class Solution:
    def canPartitionKSubsets(self, nums: list[int], k: int) -> bool:
        total = sum(nums)
        if total % k != 0:
            return False
        target = total // k
        nums.sort(reverse=True)
        if nums[0] > target:
            return False
        buckets = [0] * k
        def backtrack(idx):
            if idx == len(nums):
                return all(b == target for b in buckets)
            seen = set()
            for i in range(k):
                if buckets[i] + nums[idx] > target:
                    continue
                if buckets[i] in seen:
                    continue
                seen.add(buckets[i])
                buckets[i] += nums[idx]
                if backtrack(idx + 1):
                    return True
                buckets[i] -= nums[idx]
            return False
        return backtrack(0)`,
    explanation:
      '1. Check if total sum is divisible by k.\n' +
      '2. Sort descending for early pruning (large numbers fail faster).\n' +
      '3. Try placing each number in one of k buckets using backtracking.\n' +
      '4. Skip duplicate bucket values to avoid redundant work.',
    timeComplexity: 'O(k * 2^n) worst case',
    spaceComplexity: 'O(n)',
    hints: [
      'First check if the total sum is divisible by k.',
      'Sort the array in descending order for better pruning.',
      'Use backtracking to try assigning each number to a bucket.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 700. Search in a Binary Search Tree
  // ---------------------------------------------------------------------------
  {
    id: 700,
    description:
      'You are given the root of a binary search tree (BST) and an integer val. Find the node in the BST that the node\'s value equals val and return the subtree rooted with that node. If such a node does not exist, return null.',
    examples:
      'Input: root = [4,2,7,1,3], val = 2\nOutput: [2,1,3]',
    approach:
      'Use BST property to search: if val < node.val, go left; if val > node.val, go right; if equal, return the node.',
    code: `class Solution:
    def searchBST(self, root, val: int):
        while root:
            if val == root.val:
                return root
            elif val < root.val:
                root = root.left
            else:
                root = root.right
        return None`,
    explanation:
      '1. Start at the root.\n' +
      '2. If val matches, return the current node.\n' +
      '3. If val is smaller, search the left subtree.\n' +
      '4. If val is larger, search the right subtree. Return None if not found.',
    timeComplexity: 'O(h) where h is the tree height',
    spaceComplexity: 'O(1)',
    hints: [
      'Use the BST property: left < root < right.',
      'Compare val with the current node to decide which subtree to search.',
      'Iterative approach uses O(1) space.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 701. Insert into a Binary Search Tree
  // ---------------------------------------------------------------------------
  {
    id: 701,
    description:
      'You are given the root node of a BST and a value to insert. Return the root node of the BST after the insertion. It is guaranteed that the new value does not exist in the original BST.',
    examples:
      'Input: root = [4,2,7,1,3], val = 5\nOutput: [4,2,7,1,3,5]',
    approach:
      'Traverse the BST to find the correct position for the new value. When you reach a null position, insert a new node there.',
    code: `class Solution:
    def insertIntoBST(self, root, val: int):
        if not root:
            return TreeNode(val)
        if val < root.val:
            root.left = self.insertIntoBST(root.left, val)
        else:
            root.right = self.insertIntoBST(root.right, val)
        return root`,
    explanation:
      '1. If root is None, create and return a new node with val.\n' +
      '2. If val < root.val, recursively insert into the left subtree.\n' +
      '3. If val > root.val, recursively insert into the right subtree.\n' +
      '4. Return the root after insertion.',
    timeComplexity: 'O(h)',
    spaceComplexity: 'O(h)',
    hints: [
      'A new node is always inserted at a leaf position.',
      'Use BST property to navigate to the correct leaf.',
      'Recursive approach naturally handles the insertion.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 703. Kth Largest Element in a Stream
  // ---------------------------------------------------------------------------
  {
    id: 703,
    description:
      'Design a class to find the kth largest element in a stream. Implement KthLargest with a constructor that accepts k and an initial array, and an add method that returns the kth largest element after adding a value.',
    examples:
      'Input: ["KthLargest","add","add","add","add","add"]\n[[3,[4,5,8,2]],[3],[5],[10],[9],[4]]\nOutput: [null,4,5,5,8,8]',
    approach:
      'Use a min-heap of size k. The kth largest element is always at the top of the heap. When adding, push to heap and pop if size exceeds k.',
    code: `import heapq

class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        self.k = k
        self.heap = nums
        heapq.heapify(self.heap)
        while len(self.heap) > k:
            heapq.heappop(self.heap)

    def add(self, val: int) -> int:
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]`,
    explanation:
      '1. Maintain a min-heap of size k.\n' +
      '2. The smallest element in the heap is the kth largest overall.\n' +
      '3. On add, push the value and pop if heap size exceeds k.\n' +
      '4. Return the heap top (kth largest).',
    timeComplexity: 'O(log k) per add, O(n log k) for initialization',
    spaceComplexity: 'O(k)',
    hints: [
      'A min-heap of size k keeps track of the top k elements.',
      'The root of the min-heap is the kth largest.',
      'Push new elements and maintain heap size at k.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 705. Design HashSet
  // ---------------------------------------------------------------------------
  {
    id: 705,
    description:
      'Design a HashSet without using any built-in hash table libraries. Implement add, remove, and contains operations.',
    examples:
      'Input: ["MyHashSet","add","add","contains","contains","add","contains","remove","contains"]\n[[],[1],[2],[1],[3],[2],[2],[2],[2]]\nOutput: [null,null,null,true,false,null,true,null,false]',
    approach:
      'Use a boolean array of size 10^6+1 since keys range from 0 to 10^6. Alternatively, implement with buckets and chaining for a more realistic hash set.',
    code: `class MyHashSet:
    def __init__(self):
        self.size = 10007
        self.buckets = [[] for _ in range(self.size)]

    def add(self, key: int) -> None:
        idx = key % self.size
        if key not in self.buckets[idx]:
            self.buckets[idx].append(key)

    def remove(self, key: int) -> None:
        idx = key % self.size
        if key in self.buckets[idx]:
            self.buckets[idx].remove(key)

    def contains(self, key: int) -> bool:
        idx = key % self.size
        return key in self.buckets[idx]`,
    explanation:
      '1. Use an array of buckets with separate chaining.\n' +
      '2. Hash function: key % bucket_size maps keys to bucket indices.\n' +
      '3. Add: append to bucket if not present. Remove: delete from bucket.\n' +
      '4. Contains: check if key exists in its bucket.',
    timeComplexity: 'O(n/k) average for all operations where k is bucket count',
    spaceComplexity: 'O(k + n)',
    hints: [
      'Use an array of buckets with a hash function.',
      'Each bucket can be a list (separate chaining).',
      'Choose a prime bucket size for better distribution.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 708. Insert into a Sorted Circular Linked List
  // ---------------------------------------------------------------------------
  {
    id: 708,
    description:
      'Given a circular sorted linked list, insert a new integer value into it such that it remains sorted. The list may have duplicate values. Return any node of the list.',
    examples:
      'Input: head = [3,4,1], insertVal = 2\nOutput: [3,4,1,2]',
    approach:
      'Traverse the list to find the correct insertion point. Handle three cases: normal insertion between two nodes, insertion at the wrap-around point (max to min), and when all values are the same.',
    code: `class Solution:
    def insert(self, head, insertVal: int):
        node = Node(insertVal)
        if not head:
            node.next = node
            return node
        curr = head
        while True:
            if curr.val <= insertVal <= curr.next.val:
                break
            if curr.val > curr.next.val:
                if insertVal >= curr.val or insertVal <= curr.next.val:
                    break
            if curr.next == head:
                break
            curr = curr.next
        node.next = curr.next
        curr.next = node
        return head`,
    explanation:
      '1. Case 1: insertVal fits between curr and curr.next normally.\n' +
      '2. Case 2: At the wrap-around (max -> min), insertVal is >= max or <= min.\n' +
      '3. Case 3: All values are the same; insert anywhere (full loop detected).\n' +
      '4. Insert the new node after curr.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Find where the new value fits in the sorted circular list.',
      'Handle the wrap-around point specially (largest to smallest transition).',
      'Handle the case where all values are the same.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 712. Minimum ASCII Delete Sum for Two Strings
  // ---------------------------------------------------------------------------
  {
    id: 712,
    description:
      'Given two strings s1 and s2, return the lowest ASCII sum of deleted characters to make two strings equal.',
    examples:
      'Input: s1 = "sea", s2 = "eat"\nOutput: 231\nExplanation: Delete "s" from "sea" (115) and "t" from "eat" (116). Total = 231.',
    approach:
      'Use DP similar to edit distance. dp[i][j] is the minimum ASCII delete sum for s1[:i] and s2[:j]. If characters match, no deletion needed. Otherwise, try deleting from either string.',
    code: `class Solution:
    def minimumDeleteSum(self, s1: str, s2: str) -> int:
        m, n = len(s1), len(s2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            dp[i][0] = dp[i - 1][0] + ord(s1[i - 1])
        for j in range(1, n + 1):
            dp[0][j] = dp[0][j - 1] + ord(s2[j - 1])
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s1[i - 1] == s2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = min(dp[i - 1][j] + ord(s1[i - 1]),
                                   dp[i][j - 1] + ord(s2[j - 1]))
        return dp[m][n]`,
    explanation:
      '1. dp[i][j] = min ASCII delete sum to make s1[:i] and s2[:j] equal.\n' +
      '2. Base case: deleting all characters from one string.\n' +
      '3. If characters match, no deletion needed (dp[i-1][j-1]).\n' +
      '4. Otherwise, delete from s1 or s2 and take the minimum cost.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Similar to edit distance but with ASCII values as costs.',
      'If characters match, no cost. Otherwise, try deleting from either string.',
      'Base cases: deleting all of one string has a cost equal to the sum of its ASCII values.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 713. Subarray Product Less Than K
  // ---------------------------------------------------------------------------
  {
    id: 713,
    description:
      'Given an array of positive integers nums and an integer k, return the number of contiguous subarrays where the product of all elements is strictly less than k.',
    examples:
      'Input: nums = [10,5,2,6], k = 100\nOutput: 8',
    approach:
      'Use a sliding window. Expand the right pointer and multiply into the product. If the product >= k, shrink from the left. The number of valid subarrays ending at right is (right - left + 1).',
    code: `class Solution:
    def numSubarrayProductLessThanK(self, nums: list[int], k: int) -> int:
        if k <= 1:
            return 0
        product = 1
        left = 0
        count = 0
        for right in range(len(nums)):
            product *= nums[right]
            while product >= k:
                product //= nums[left]
                left += 1
            count += right - left + 1
        return count`,
    explanation:
      '1. Maintain a sliding window [left, right] with running product.\n' +
      '2. Expand right and multiply into product.\n' +
      '3. Shrink left while product >= k.\n' +
      '4. Add (right - left + 1) valid subarrays ending at right.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Use a sliding window with a running product.',
      'Shrink the window from the left when the product exceeds k.',
      'The number of new subarrays at each step is the window size.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 714. Best Time to Buy and Sell Stock with Transaction Fee
  // ---------------------------------------------------------------------------
  {
    id: 714,
    description:
      'You are given an array prices where prices[i] is the price of a stock on day i, and a transaction fee. Find the maximum profit you can achieve. You may complete as many transactions as you like, but you pay the fee for each transaction.',
    examples:
      'Input: prices = [1,3,2,8,4,9], fee = 2\nOutput: 8\nExplanation: Buy at 1, sell at 8 (profit 5), buy at 4, sell at 9 (profit 3). Total = 8.',
    approach:
      'Use DP with two states: cash (not holding stock) and hold (holding stock). On each day, decide whether to buy, sell, or do nothing.',
    code: `class Solution:
    def maxProfit(self, prices: list[int], fee: int) -> int:
        cash = 0
        hold = -prices[0]
        for i in range(1, len(prices)):
            cash = max(cash, hold + prices[i] - fee)
            hold = max(hold, cash - prices[i])
        return cash`,
    explanation:
      '1. cash: max profit when not holding stock.\n' +
      '2. hold: max profit when holding stock.\n' +
      '3. Each day: cash = max(do nothing, sell), hold = max(do nothing, buy).\n' +
      '4. Transaction fee is paid when selling.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Model two states: holding and not holding stock.',
      'At each step, decide to buy, sell, or hold.',
      'Subtract the transaction fee when selling.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 716. Max Stack
  // ---------------------------------------------------------------------------
  {
    id: 716,
    description:
      'Design a max stack data structure that supports push, pop, top, peekMax, and popMax. popMax retrieves and removes the maximum element. If there are multiple maximum elements, only remove the top-most one.',
    examples:
      'Input: ["MaxStack","push","push","push","top","popMax","top","peekMax","pop","top"]\n[[],[5],[1],[5],[],[],[],[],[],[]]\nOutput: [null,null,null,null,5,5,1,5,5,5]',
    approach:
      'Use a doubly linked list for order and a sorted dictionary (or heap) mapping values to list nodes. This allows O(log n) for all operations including popMax.',
    code: `from sortedcontainers import SortedList

class MaxStack:
    def __init__(self):
        self.stack = []
        self.sorted = SortedList()
        self.id = 0
        self.removed = set()

    def push(self, x: int) -> None:
        self.stack.append((self.id, x))
        self.sorted.add((x, self.id))
        self.id += 1

    def pop(self) -> int:
        while self.stack[-1][0] in self.removed:
            self.stack.pop()
        idx, val = self.stack.pop()
        self.sorted.remove((val, idx))
        return val

    def top(self) -> int:
        while self.stack[-1][0] in self.removed:
            self.stack.pop()
        return self.stack[-1][1]

    def peekMax(self) -> int:
        while self.sorted[-1][1] in self.removed:
            self.sorted.pop()
        return self.sorted[-1][0]

    def popMax(self) -> int:
        while self.sorted[-1][1] in self.removed:
            self.sorted.pop()
        val, idx = self.sorted.pop()
        self.removed.add(idx)
        return val`,
    explanation:
      '1. Use a stack for LIFO operations and a SortedList for max operations.\n' +
      '2. Each element gets a unique ID to handle lazy deletion.\n' +
      '3. popMax removes from SortedList and marks the ID as removed.\n' +
      '4. pop and top skip over removed IDs lazily.',
    timeComplexity: 'O(log n) for all operations (amortized)',
    spaceComplexity: 'O(n)',
    hints: [
      'A simple stack doesn\'t support efficient popMax.',
      'Use a SortedList alongside the stack for O(log n) max operations.',
      'Lazy deletion with unique IDs avoids expensive synchronization.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 720. Longest Word in Dictionary
  // ---------------------------------------------------------------------------
  {
    id: 720,
    description:
      'Given an array of strings words representing an English dictionary, return the longest word in words that can be built one character at a time by other words in words. If there are multiple answers, return the one that is lexicographically smallest.',
    examples:
      'Input: words = ["w","wo","wor","worl","world"]\nOutput: "world"',
    approach:
      'Sort the words. Use a set to track buildable words. A word is buildable if its prefix (word minus last character) is in the set. Track the longest buildable word.',
    code: `class Solution:
    def longestWord(self, words: list[str]) -> str:
        words.sort()
        built = {''}
        result = ''
        for word in words:
            if word[:-1] in built:
                built.add(word)
                if len(word) > len(result):
                    result = word
        return result`,
    explanation:
      '1. Sort words lexicographically (shorter words first, ties broken alphabetically).\n' +
      '2. A word is buildable if its prefix (without last char) is already built.\n' +
      '3. Add buildable words to the set.\n' +
      '4. Track the longest buildable word (lexicographically smallest due to sort order).',
    timeComplexity: 'O(n * k log n) where k is average word length',
    spaceComplexity: 'O(n * k)',
    hints: [
      'Sort the words so shorter words are processed first.',
      'A word is buildable if removing its last character gives a word already in the set.',
      'The first longest word found in sorted order is lexicographically smallest.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 722. Remove Comments
  // ---------------------------------------------------------------------------
  {
    id: 722,
    description:
      'Given a C++ program represented as an array of source code lines, remove all comments. Line comments (//) remove everything after them on the same line. Block comments (/* */) can span multiple lines. Return the resulting source code.',
    examples:
      'Input: source = ["/*Test program */", "int main()", "{ ", "  // variable declaration ", "int a, b, c;", "/* This is a test", "   multiline  ", "   comment for ", "   testing */", "a = b + c;", "}"]\nOutput: ["int main()","{ ","  ","int a, b, c;","a = b + c;","}"]',
    approach:
      'Process character by character, tracking whether we are inside a block comment. Handle line comments by skipping the rest of the line. Handle block comments by skipping until the closing */.',
    code: `class Solution:
    def removeComments(self, source: list[str]) -> list[str]:
        in_block = False
        result = []
        buffer = []
        for line in source:
            i = 0
            while i < len(line):
                if in_block:
                    if i + 1 < len(line) and line[i:i+2] == '*/':
                        in_block = False
                        i += 2
                    else:
                        i += 1
                else:
                    if i + 1 < len(line) and line[i:i+2] == '//':
                        break
                    elif i + 1 < len(line) and line[i:i+2] == '/*':
                        in_block = True
                        i += 2
                    else:
                        buffer.append(line[i])
                        i += 1
            if not in_block and buffer:
                result.append(''.join(buffer))
                buffer = []
        return result`,
    explanation:
      '1. Track whether we are inside a block comment.\n' +
      '2. If inside a block comment, skip characters until */.\n' +
      '3. If we see //, skip the rest of the line.\n' +
      '4. If we see /*, enter block comment mode. Otherwise, keep the character.',
    timeComplexity: 'O(n) where n is total characters',
    spaceComplexity: 'O(n)',
    hints: [
      'Track a boolean state for whether you are inside a block comment.',
      'Process two characters at a time to detect // and /* */.',
      'Buffer non-comment characters and flush at end of line.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 723. Candy Crush
  // ---------------------------------------------------------------------------
  {
    id: 723,
    description:
      'Implement a simplified Candy Crush game on a 2D board. Repeatedly find and crush (set to 0) all groups of 3 or more same-valued candies in a row or column. After crushing, let candies fall down by gravity. Repeat until no more crushing is possible. Return the final board.',
    examples:
      'Input: board = [[110,5,112],[210,5,5],[5,5,112],[5,5,5],[210,12,5]]\nOutput: [[0,0,0],[0,0,0],[0,0,0],[110,0,112],[210,12,5]]',
    approach:
      'Repeat: 1) Find all cells to crush (mark cells part of 3+ consecutive same values horizontally or vertically). 2) Crush them. 3) Apply gravity. Stop when no cells are crushed.',
    code: `class Solution:
    def candyCrush(self, board: list[list[int]]) -> list[list[int]]:
        rows, cols = len(board), len(board[0])
        while True:
            crush = set()
            for r in range(rows):
                for c in range(cols - 2):
                    if board[r][c] and board[r][c] == board[r][c+1] == board[r][c+2]:
                        crush |= {(r,c),(r,c+1),(r,c+2)}
            for r in range(rows - 2):
                for c in range(cols):
                    if board[r][c] and board[r][c] == board[r+1][c] == board[r+2][c]:
                        crush |= {(r,c),(r+1,c),(r+2,c)}
            if not crush:
                break
            for r, c in crush:
                board[r][c] = 0
            for c in range(cols):
                write = rows - 1
                for r in range(rows - 1, -1, -1):
                    if board[r][c] != 0:
                        board[write][c] = board[r][c]
                        write -= 1
                for r in range(write, -1, -1):
                    board[r][c] = 0
        return board`,
    explanation:
      '1. Find all cells to crush: 3+ consecutive same values horizontally or vertically.\n' +
      '2. Set crushed cells to 0.\n' +
      '3. Apply gravity: move non-zero values down in each column.\n' +
      '4. Repeat until no cells are crushed.',
    timeComplexity: 'O((m*n)^2) worst case for repeated passes',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Find all groups of 3+ consecutive same values in rows and columns.',
      'Mark and crush them simultaneously to handle overlapping groups.',
      'Apply gravity by compacting non-zero values to the bottom of each column.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 724. Find Pivot Index
  // ---------------------------------------------------------------------------
  {
    id: 724,
    description:
      'Given an array of integers nums, calculate the pivot index. The pivot index is where the sum of all numbers to the left equals the sum of all numbers to the right. Return the leftmost pivot index. If no such index exists, return -1.',
    examples:
      'Input: nums = [1,7,3,6,5,6]\nOutput: 3\nExplanation: Left sum = 1+7+3 = 11, Right sum = 5+6 = 11.',
    approach:
      'Compute the total sum. Iterate with a running left sum. At each index, right sum = total - left - nums[i]. If left == right, return the index.',
    code: `class Solution:
    def pivotIndex(self, nums: list[int]) -> int:
        total = sum(nums)
        left_sum = 0
        for i, num in enumerate(nums):
            if left_sum == total - left_sum - num:
                return i
            left_sum += num
        return -1`,
    explanation:
      '1. Compute the total sum of the array.\n' +
      '2. Maintain a running left_sum as we iterate.\n' +
      '3. Right sum at index i = total - left_sum - nums[i].\n' +
      '4. If left_sum == right_sum, return i.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The right sum can be computed as total - left_sum - current element.',
      'Iterate once, maintaining a running left sum.',
      'Check at each position if left sum equals right sum.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 725. Split Linked List in Parts
  // ---------------------------------------------------------------------------
  {
    id: 725,
    description:
      'Given the head of a singly linked list and an integer k, split the linked list into k consecutive parts. The parts should be as equal in length as possible, with earlier parts being at most one node longer.',
    examples:
      'Input: head = [1,2,3], k = 5\nOutput: [[1],[2],[3],[],[]]',
    approach:
      'Count the total length. Each part has length // k nodes, and the first (length % k) parts get one extra node. Split the list accordingly.',
    code: `class Solution:
    def splitListToParts(self, head, k: int):
        length = 0
        curr = head
        while curr:
            length += 1
            curr = curr.next
        base_size = length // k
        extra = length % k
        result = []
        curr = head
        for i in range(k):
            result.append(curr)
            part_size = base_size + (1 if i < extra else 0)
            for _ in range(part_size - 1):
                if curr:
                    curr = curr.next
            if curr:
                nxt = curr.next
                curr.next = None
                curr = nxt
        return result`,
    explanation:
      '1. Count the total number of nodes.\n' +
      '2. Each part has base_size nodes; the first "extra" parts get one more.\n' +
      '3. For each part, advance through the correct number of nodes.\n' +
      '4. Sever the link and move to the next part.',
    timeComplexity: 'O(n + k)',
    spaceComplexity: 'O(k)',
    hints: [
      'First count the total length of the list.',
      'Each part has length//k nodes; the first length%k parts get one extra.',
      'Iterate through the list, cutting off each part at the right point.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 726. Number of Atoms
  // ---------------------------------------------------------------------------
  {
    id: 726,
    description:
      'Given a chemical formula as a string, return the count of each atom sorted alphabetically. The formula can contain parentheses with multipliers.',
    examples:
      'Input: formula = "Mg(OH)2"\nOutput: "H2MgO2"',
    approach:
      'Use a stack of dictionaries. On "(", push a new dict. On ")", pop the dict, multiply counts by the following number, and merge into the previous dict. Parse element names and counts normally.',
    code: `from collections import defaultdict

class Solution:
    def countOfAtoms(self, formula: str) -> str:
        stack = [defaultdict(int)]
        i = 0
        n = len(formula)
        while i < n:
            if formula[i] == '(':
                stack.append(defaultdict(int))
                i += 1
            elif formula[i] == ')':
                i += 1
                start = i
                while i < n and formula[i].isdigit():
                    i += 1
                mul = int(formula[start:i] or '1')
                top = stack.pop()
                for elem, cnt in top.items():
                    stack[-1][elem] += cnt * mul
            else:
                start = i
                i += 1
                while i < n and formula[i].islower():
                    i += 1
                elem = formula[start:i]
                start = i
                while i < n and formula[i].isdigit():
                    i += 1
                cnt = int(formula[start:i] or '1')
                stack[-1][elem] += cnt
        result = []
        for elem in sorted(stack[-1].keys()):
            result.append(elem)
            if stack[-1][elem] > 1:
                result.append(str(stack[-1][elem]))
        return ''.join(result)`,
    explanation:
      '1. Use a stack of dictionaries to handle nested parentheses.\n' +
      '2. On "(", push a new empty dictionary.\n' +
      '3. On ")", pop the top, multiply all counts by the following number, merge into current top.\n' +
      '4. Parse element names (uppercase + lowercase) and their counts.',
    timeComplexity: 'O(n + k log k) where k is number of unique atoms',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a stack to handle nested parentheses.',
      'Each level of parentheses gets its own counter dictionary.',
      'On closing parenthesis, multiply and merge with the parent level.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 727. Minimum Window Subsequence
  // ---------------------------------------------------------------------------
  {
    id: 727,
    description:
      'Given strings s1 and s2, return the minimum contiguous substring part of s1, such that s2 is a subsequence of that part. If there is no such window, return an empty string. If there are multiple answers, return the one with the leftmost starting index.',
    examples:
      'Input: s1 = "abcdebdde", s2 = "bde"\nOutput: "bcde"',
    approach:
      'Use a two-pointer approach. Find the end of a window where s2 is a subsequence, then shrink from the right to find the minimum. Track the best window found.',
    code: `class Solution:
    def minWindow(self, s1: str, s2: str) -> str:
        best = ""
        i = 0
        while i < len(s1):
            j = 0
            while i < len(s1) and j < len(s2):
                if s1[i] == s2[j]:
                    j += 1
                i += 1
            if j < len(s2):
                break
            end = i
            j = len(s2) - 1
            i -= 1
            while j >= 0:
                if s1[i] == s2[j]:
                    j -= 1
                i -= 1
            i += 1
            if not best or end - i < len(best):
                best = s1[i:end]
            i += 1
        return best`,
    explanation:
      '1. Forward pass: find the end of a window where s2 is a subsequence of s1.\n' +
      '2. Backward pass: from the end, shrink to find the smallest start.\n' +
      '3. Track the best (shortest) window found.\n' +
      '4. Move start forward by 1 and repeat.',
    timeComplexity: 'O(n * m) where n = len(s1), m = len(s2)',
    spaceComplexity: 'O(1)',
    hints: [
      'First find a window where s2 is a subsequence, then minimize it.',
      'Use forward pass to find the end, backward pass to find the start.',
      'Track the shortest window found across all iterations.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 729. My Calendar I
  // ---------------------------------------------------------------------------
  {
    id: 729,
    description:
      'Implement a MyCalendar class to store events. A new event can be added if it does not cause a double booking. An event is represented as [start, end) (half-open interval). Return true if the event can be booked.',
    examples:
      'Input: ["MyCalendar","book","book","book"]\n[[],[10,20],[15,25],[20,30]]\nOutput: [null,true,false,true]',
    approach:
      'Maintain a sorted list of bookings. For each new event, check if it overlaps with any existing event. Two intervals [s1, e1) and [s2, e2) overlap if s1 < e2 and s2 < e1.',
    code: `class MyCalendar:
    def __init__(self):
        self.bookings = []

    def book(self, start: int, end: int) -> bool:
        for s, e in self.bookings:
            if start < e and s < end:
                return False
        self.bookings.append((start, end))
        return True`,
    explanation:
      '1. Store all booked intervals in a list.\n' +
      '2. For a new event [start, end), check overlap with all existing events.\n' +
      '3. Two events overlap if start < existing_end and existing_start < end.\n' +
      '4. If no overlap, add the event and return True.',
    timeComplexity: 'O(n) per booking',
    spaceComplexity: 'O(n)',
    hints: [
      'Two half-open intervals overlap if and only if start1 < end2 and start2 < end1.',
      'Check each existing booking for overlap before adding.',
      'A balanced BST or SortedList can improve to O(log n) per booking.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 731. My Calendar II
  // ---------------------------------------------------------------------------
  {
    id: 731,
    description:
      'Implement a MyCalendarTwo class. An event can be added if doing so does not cause a triple booking. A triple booking happens when three events have a common time. Return true if the event can be booked without causing a triple booking.',
    examples:
      'Input: ["MyCalendarTwo","book","book","book","book","book","book"]\n[[],[10,20],[50,60],[10,40],[5,15],[5,10],[25,55]]\nOutput: [null,true,true,true,false,true,true]',
    approach:
      'Maintain two lists: one for single bookings and one for overlaps (double bookings). A new event fails if it overlaps with any double booking. Otherwise, compute new double bookings and add the event.',
    code: `class MyCalendarTwo:
    def __init__(self):
        self.bookings = []
        self.overlaps = []

    def book(self, start: int, end: int) -> bool:
        for s, e in self.overlaps:
            if start < e and s < end:
                return False
        for s, e in self.bookings:
            if start < e and s < end:
                self.overlaps.append((max(start, s), min(end, e)))
        self.bookings.append((start, end))
        return True`,
    explanation:
      '1. overlaps stores intervals that are already double-booked.\n' +
      '2. For a new event, if it overlaps with any double booking, it would cause a triple booking.\n' +
      '3. If it passes, compute new overlaps with existing single bookings.\n' +
      '4. Add the event to single bookings.',
    timeComplexity: 'O(n) per booking',
    spaceComplexity: 'O(n)',
    hints: [
      'Track both single bookings and double bookings (overlaps).',
      'A new event fails if it overlaps with any existing double booking.',
      'When adding, compute new double bookings from existing single bookings.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 733. Flood Fill
  // ---------------------------------------------------------------------------
  {
    id: 733,
    description:
      'An image is represented by an m x n grid of integers. Perform a flood fill starting from pixel (sr, sc) with a new color. A flood fill changes the starting pixel and all connected pixels of the same original color to the new color.',
    examples:
      'Input: image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2\nOutput: [[2,2,2],[2,2,0],[2,0,1]]',
    approach:
      'Use DFS or BFS from the starting pixel. Change the color and recurse to all 4-directionally connected pixels with the same original color. Handle the case where the new color equals the original.',
    code: `class Solution:
    def floodFill(self, image: list[list[int]], sr: int, sc: int, color: int) -> list[list[int]]:
        original = image[sr][sc]
        if original == color:
            return image
        def dfs(r, c):
            if r < 0 or r >= len(image) or c < 0 or c >= len(image[0]) or image[r][c] != original:
                return
            image[r][c] = color
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)
        dfs(sr, sc)
        return image`,
    explanation:
      '1. Record the original color at (sr, sc).\n' +
      '2. If original == new color, no change needed (avoids infinite recursion).\n' +
      '3. DFS: change the current pixel color and recurse to 4 neighbors.\n' +
      '4. Only continue to neighbors with the original color.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n) for recursion stack',
    hints: [
      'This is a standard flood fill / connected component problem.',
      'Use DFS or BFS starting from (sr, sc).',
      'Handle the edge case where the new color equals the original.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 740. Delete and Earn
  // ---------------------------------------------------------------------------
  {
    id: 740,
    description:
      'Given an array of integers nums, you can perform the operation: pick nums[i], earn nums[i] points, and delete every element equal to nums[i]-1 and nums[i]+1. Return the maximum points you can earn.',
    examples:
      'Input: nums = [3,4,2]\nOutput: 6\nExplanation: Pick 2 (earn 2), then 4 is deleted, pick 3 (earn 3). Wrong! Actually: delete 3, pick 4 earns 4, then pick 2 earns 2. Total = 6.',
    approach:
      'This reduces to the House Robber problem. Group numbers by value. You cannot take both value v and v+1. Use DP: for each value, decide to take all of them or skip.',
    code: `from collections import Counter

class Solution:
    def deleteAndEarn(self, nums: list[int]) -> int:
        count = Counter(nums)
        max_val = max(nums)
        dp = [0] * (max_val + 1)
        dp[1] = count.get(1, 0) * 1
        for i in range(2, max_val + 1):
            dp[i] = max(dp[i - 1], dp[i - 2] + i * count.get(i, 0))
        return dp[max_val]`,
    explanation:
      '1. Count occurrences of each number.\n' +
      '2. This becomes House Robber: value[i] = i * count[i], and adjacent values cannot both be taken.\n' +
      '3. dp[i] = max(skip i, take i + dp[i-2]).\n' +
      '4. Return dp[max_val].',
    timeComplexity: 'O(n + max_val)',
    spaceComplexity: 'O(max_val)',
    hints: [
      'Picking value v means you get v * count(v) points but lose v-1 and v+1.',
      'This is equivalent to the House Robber problem on values.',
      'Use DP where dp[i] = max points considering values up to i.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 741. Cherry Pickup
  // ---------------------------------------------------------------------------
  {
    id: 741,
    description:
      'You are given an n x n grid representing a field of cherries. Starting from (0,0) to (n-1,n-1) and back, collect the maximum number of cherries. You can only move right/down going forward and left/up going back. Cells with -1 are blocked.',
    examples:
      'Input: grid = [[0,1,-1],[1,0,-1],[1,1,1]]\nOutput: 5',
    approach:
      'Model as two people walking from (0,0) to (n-1,n-1) simultaneously. Use 3D DP where dp[r1][c1][r2] represents the max cherries when person 1 is at (r1,c1) and person 2 is at (r2, r1+c1-r2). If both are at the same cell, count cherries only once.',
    code: `class Solution:
    def cherryPickup(self, grid: list[list[int]]) -> int:
        n = len(grid)
        memo = {}
        def dp(r1, c1, r2):
            c2 = r1 + c1 - r2
            if r1 >= n or c1 >= n or r2 >= n or c2 >= n:
                return float('-inf')
            if grid[r1][c1] == -1 or grid[r2][c2] == -1:
                return float('-inf')
            if r1 == n - 1 and c1 == n - 1:
                return grid[r1][c1]
            if (r1, c1, r2) in memo:
                return memo[(r1, c1, r2)]
            cherries = grid[r1][c1]
            if r1 != r2 or c1 != c2:
                cherries += grid[r2][c2]
            cherries += max(dp(r1+1,c1,r2+1), dp(r1+1,c1,r2),
                           dp(r1,c1+1,r2+1), dp(r1,c1+1,r2))
            memo[(r1, c1, r2)] = cherries
            return cherries
        return max(0, dp(0, 0, 0))`,
    explanation:
      '1. Model as two simultaneous walks from (0,0) to (n-1,n-1).\n' +
      '2. Both take the same number of steps, so c2 = r1 + c1 - r2.\n' +
      '3. If both are at the same cell, count cherries once.\n' +
      '4. Try all 4 combinations of moves (each person goes right or down).',
    timeComplexity: 'O(n^3)',
    spaceComplexity: 'O(n^3)',
    hints: [
      'Going and coming back is equivalent to two people going forward simultaneously.',
      'Use DP with state (r1, c1, r2); c2 is derived from the step count.',
      'If both people are at the same cell, count the cherry only once.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 742. Closest Leaf in a Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 742,
    description:
      'Given the root of a binary tree where every node has a unique value, and a target integer k, return the value of the nearest leaf node to the target k.',
    examples:
      'Input: root = [1,3,2], k = 1\nOutput: 2 (or 3)',
    approach:
      'Build an undirected graph from the tree. Then BFS from the target node to find the closest leaf.',
    code: `from collections import defaultdict, deque

class Solution:
    def findClosestLeaf(self, root, k: int) -> int:
        graph = defaultdict(list)
        leaves = set()
        def build(node, parent=None):
            if not node:
                return
            if not node.left and not node.right:
                leaves.add(node.val)
            if parent:
                graph[node.val].append(parent.val)
                graph[parent.val].append(node.val)
            build(node.left, node)
            build(node.right, node)
        build(root)
        queue = deque([k])
        visited = {k}
        while queue:
            val = queue.popleft()
            if val in leaves:
                return val
            for neighbor in graph[val]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return -1`,
    explanation:
      '1. Convert the tree to an undirected graph.\n' +
      '2. Identify all leaf nodes.\n' +
      '3. BFS from the target k to find the nearest leaf.\n' +
      '4. The first leaf encountered in BFS is the closest.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Convert the tree into an undirected graph for easier traversal.',
      'Identify leaves (nodes with no children).',
      'BFS from the target node to find the nearest leaf.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 745. Prefix and Suffix Search
  // ---------------------------------------------------------------------------
  {
    id: 745,
    description:
      'Design a special dictionary that searches words by prefix and suffix. Implement the WordFilter class with a constructor that takes a list of words and a method f(pref, suff) that returns the index of the word with the given prefix and suffix. If multiple words match, return the largest index.',
    examples:
      'Input: ["WordFilter","f"]\n[[["apple"]],["a","e"]]\nOutput: [null,0]',
    approach:
      'For each word, generate all possible prefix#suffix combinations and store them in a dictionary mapping to the word index. For query f(pref, suff), look up pref#suff.',
    code: `class WordFilter:
    def __init__(self, words: list[str]):
        self.lookup = {}
        for idx, word in enumerate(words):
            for i in range(len(word) + 1):
                for j in range(len(word) + 1):
                    key = word[:i] + '#' + word[j:]
                    self.lookup[key] = idx

    def f(self, pref: str, suff: str) -> int:
        return self.lookup.get(pref + '#' + suff, -1)`,
    explanation:
      '1. Precompute all prefix#suffix keys for each word.\n' +
      '2. Store the word index for each key (later index overwrites earlier).\n' +
      '3. On query, simply look up pref#suff in the dictionary.\n' +
      '4. Since later indices overwrite, we get the largest matching index.',
    timeComplexity: 'O(n * L^2) for init, O(1) for query where L is max word length',
    spaceComplexity: 'O(n * L^2)',
    hints: [
      'Precompute all prefix-suffix combinations for each word.',
      'Use "prefix#suffix" as the dictionary key.',
      'Later words overwrite earlier ones, so you naturally get the largest index.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 752. Open the Lock
  // ---------------------------------------------------------------------------
  {
    id: 752,
    description:
      'You have a lock with 4 circular wheels, each with digits 0-9. The lock starts at "0000". You are given a list of deadends (states that block further moves) and a target string. Each move turns one wheel one slot (up or down). Return the minimum moves to reach the target, or -1 if impossible.',
    examples:
      'Input: deadends = ["0201","0101","0102","1212","2002"], target = "0202"\nOutput: 6',
    approach:
      'Use BFS from "0000". Each state has 8 neighbors (4 wheels x 2 directions). Skip deadends. Return the number of BFS levels to reach the target.',
    code: `from collections import deque

class Solution:
    def openLock(self, deadends: list[str], target: str) -> int:
        dead = set(deadends)
        if "0000" in dead:
            return -1
        queue = deque([("0000", 0)])
        visited = {"0000"}
        while queue:
            state, moves = queue.popleft()
            if state == target:
                return moves
            for i in range(4):
                d = int(state[i])
                for nd in [(d + 1) % 10, (d - 1) % 10]:
                    new_state = state[:i] + str(nd) + state[i+1:]
                    if new_state not in visited and new_state not in dead:
                        visited.add(new_state)
                        queue.append((new_state, moves + 1))
        return -1`,
    explanation:
      '1. BFS from "0000" explores states level by level (minimum moves).\n' +
      '2. Each state has 8 neighbors: each of 4 wheels turned +1 or -1.\n' +
      '3. Skip deadends and already visited states.\n' +
      '4. Return the move count when the target is reached.',
    timeComplexity: 'O(10^4 * 4) = O(40000)',
    spaceComplexity: 'O(10^4)',
    hints: [
      'Model this as a shortest path problem on a graph of states.',
      'Each state is a 4-digit string with 8 possible transitions.',
      'BFS gives the minimum number of moves.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 759. Employee Free Time
  // ---------------------------------------------------------------------------
  {
    id: 759,
    description:
      'We are given a list of schedules for each employee, where each schedule is a list of non-overlapping intervals sorted by start time. Return the list of finite intervals representing the common free time for all employees.',
    examples:
      'Input: schedule = [[[1,2],[5,6]],[[1,3]],[[4,10]]]\nOutput: [[3,4]]',
    approach:
      'Flatten all intervals, sort by start time, and merge overlapping intervals. The gaps between merged intervals are the common free time.',
    code: `class Solution:
    def employeeFreeTime(self, schedule):
        intervals = sorted([iv for emp in schedule for iv in emp], key=lambda x: x.start)
        result = []
        prev_end = intervals[0].end
        for iv in intervals[1:]:
            if iv.start > prev_end:
                result.append(Interval(prev_end, iv.start))
            prev_end = max(prev_end, iv.end)
        return result`,
    explanation:
      '1. Flatten all employees\' intervals into one list.\n' +
      '2. Sort by start time.\n' +
      '3. Merge overlapping intervals by tracking the maximum end.\n' +
      '4. When a gap is found (next start > prev end), it\'s free time.',
    timeComplexity: 'O(n log n) where n is total intervals',
    spaceComplexity: 'O(n)',
    hints: [
      'Flatten all intervals from all employees.',
      'Sort by start time and find gaps between merged intervals.',
      'The gaps represent common free time.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 760. Find Anagram Mappings
  // ---------------------------------------------------------------------------
  {
    id: 760,
    description:
      'Given two integer arrays nums1 and nums2 where nums2 is an anagram of nums1, return a mapping array result where result[i] is the index j such that nums1[i] == nums2[j].',
    examples:
      'Input: nums1 = [12,28,46,32,50], nums2 = [50,12,32,46,28]\nOutput: [1,4,3,2,0]',
    approach:
      'Build a hash map from value to index for nums2. For each element in nums1, look up its index in nums2.',
    code: `class Solution:
    def anagramMappings(self, nums1: list[int], nums2: list[int]) -> list[int]:
        index_map = {}
        for i, num in enumerate(nums2):
            index_map[num] = i
        return [index_map[num] for num in nums1]`,
    explanation:
      '1. Build a dictionary mapping each value in nums2 to its index.\n' +
      '2. For each element in nums1, look up its index in the dictionary.\n' +
      '3. Return the list of indices.\n' +
      '4. If duplicates exist, any valid mapping is acceptable.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Build a value-to-index map for nums2.',
      'Look up each nums1 element in the map.',
      'Any valid mapping is acceptable when duplicates exist.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 765. Couples Holding Hands
  // ---------------------------------------------------------------------------
  {
    id: 765,
    description:
      'There are n couples sitting in 2n seats arranged in a row. You want each couple to sit side by side. A couple is (2i, 2i+1) for each i. Return the minimum number of swaps so that every couple is sitting side by side.',
    examples:
      'Input: row = [0,2,1,3]\nOutput: 1\nExplanation: Swap row[1] and row[2] to get [0,1,2,3].',
    approach:
      'Greedy: for each pair of adjacent seats (0,1), (2,3), ..., if the two people are not a couple, find the partner of the first person and swap them in. Each swap fixes at least one couple.',
    code: `class Solution:
    def minSwapsCouples(self, row: list[int]) -> int:
        pos = {val: i for i, val in enumerate(row)}
        swaps = 0
        for i in range(0, len(row), 2):
            partner = row[i] ^ 1
            if row[i + 1] != partner:
                j = pos[partner]
                row[i + 1], row[j] = row[j], row[i + 1]
                pos[row[j]] = j
                pos[row[i + 1]] = i + 1
                swaps += 1
        return swaps`,
    explanation:
      '1. Build a position map for quick lookup.\n' +
      '2. For each pair of seats, find the partner of the first person (XOR with 1).\n' +
      '3. If the partner is not in the adjacent seat, swap them in.\n' +
      '4. Update the position map after each swap.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Couple IDs are (2i, 2i+1), so the partner of person x is x^1.',
      'Greedy: for each seat pair, ensure a couple sits there by swapping if needed.',
      'Use a position map for O(1) lookups.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 766. Toeplitz Matrix
  // ---------------------------------------------------------------------------
  {
    id: 766,
    description:
      'Given an m x n matrix, return true if the matrix is Toeplitz. A matrix is Toeplitz if every diagonal from top-left to bottom-right has the same elements.',
    examples:
      'Input: matrix = [[1,2,3,4],[5,1,2,3],[9,5,1,2]]\nOutput: true',
    approach:
      'For each cell (i, j) where i > 0 and j > 0, check if it equals the cell diagonally above-left (i-1, j-1). If any mismatch, return false.',
    code: `class Solution:
    def isToeplitzMatrix(self, matrix: list[list[int]]) -> bool:
        for i in range(1, len(matrix)):
            for j in range(1, len(matrix[0])):
                if matrix[i][j] != matrix[i - 1][j - 1]:
                    return False
        return True`,
    explanation:
      '1. A Toeplitz matrix requires all diagonal elements to be the same.\n' +
      '2. Check each cell against its upper-left diagonal neighbor.\n' +
      '3. If any cell differs from its diagonal predecessor, return False.\n' +
      '4. If all pass, return True.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Each cell should equal its upper-left diagonal neighbor.',
      'Check matrix[i][j] == matrix[i-1][j-1] for all valid i, j.',
      'This is a simple one-pass check.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 767. Reorganize String
  // ---------------------------------------------------------------------------
  {
    id: 767,
    description:
      'Given a string s, rearrange the characters so that no two adjacent characters are the same. If not possible, return an empty string.',
    examples:
      'Input: s = "aab"\nOutput: "aba"',
    approach:
      'Use a max-heap of (count, char). Always place the most frequent character, but alternate to avoid adjacent duplicates. After placing a char, push the previously placed char back into the heap.',
    code: `import heapq
from collections import Counter

class Solution:
    def reorganizeString(self, s: str) -> str:
        count = Counter(s)
        max_count = max(count.values())
        if max_count > (len(s) + 1) // 2:
            return ""
        heap = [(-cnt, ch) for ch, cnt in count.items()]
        heapq.heapify(heap)
        result = []
        prev_cnt, prev_ch = 0, ''
        while heap:
            cnt, ch = heapq.heappop(heap)
            result.append(ch)
            if prev_cnt < 0:
                heapq.heappush(heap, (prev_cnt, prev_ch))
            prev_cnt, prev_ch = cnt + 1, ch
        return ''.join(result)`,
    explanation:
      '1. If any character appears more than (n+1)/2 times, it\'s impossible.\n' +
      '2. Use a max-heap to always place the most frequent available character.\n' +
      '3. After placing a character, hold it aside and push back the previous one.\n' +
      '4. This ensures no two adjacent characters are the same.',
    timeComplexity: 'O(n log k) where k is the number of distinct characters',
    spaceComplexity: 'O(n)',
    hints: [
      'If any character count exceeds (n+1)/2, it is impossible.',
      'Use a max-heap to always place the most frequent character.',
      'Hold the last placed character aside to prevent adjacency.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 772. Basic Calculator III
  // ---------------------------------------------------------------------------
  {
    id: 772,
    description:
      'Implement a basic calculator to evaluate a simple expression string. The expression may contain non-negative integers, +, -, *, / operators, and parentheses. Return the result of the evaluation. Integer division truncates toward zero.',
    examples:
      'Input: s = "2*(5+5*2)/3+(6/2+8)"\nOutput: 21',
    approach:
      'Use a recursive descent parser or a stack-based approach. Handle operator precedence: * and / before + and -. Recursively evaluate expressions inside parentheses.',
    code: `class Solution:
    def calculate(self, s: str) -> int:
        self.i = 0
        def parse():
            stack = []
            num = 0
            op = '+'
            while self.i < len(s):
                c = s[self.i]
                if c.isdigit():
                    num = num * 10 + int(c)
                if c == '(':
                    self.i += 1
                    num = parse()
                if c in '+-*/)' or self.i == len(s) - 1:
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
                    if c == ')':
                        break
                self.i += 1
            return sum(stack)
        return parse()`,
    explanation:
      '1. Use a recursive parser with a stack for operator precedence.\n' +
      '2. + and - push to stack; * and / modify the stack top.\n' +
      '3. On "(", recursively evaluate the sub-expression.\n' +
      '4. On ")", return the sum of the current stack.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Handle operator precedence: * and / before + and -.',
      'Use a stack: push for +/-, modify top for */.',
      'Recursively evaluate parenthesized sub-expressions.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 773. Sliding Puzzle
  // ---------------------------------------------------------------------------
  {
    id: 773,
    description:
      'On a 2x3 board, there are five tiles labeled 1-5 and an empty square (0). In one move, you can swap the empty square with an adjacent tile. Return the least number of moves to reach the solved state [[1,2,3],[4,5,0]], or -1 if impossible.',
    examples:
      'Input: board = [[1,2,3],[4,0,5]]\nOutput: 1',
    approach:
      'Use BFS on the board state (represented as a tuple). The target state is (1,2,3,4,5,0). For each state, generate all possible next states by swapping 0 with its neighbors.',
    code: `from collections import deque

class Solution:
    def slidingPuzzle(self, board: list[list[int]]) -> int:
        target = (1, 2, 3, 4, 5, 0)
        start = tuple(board[0] + board[1])
        if start == target:
            return 0
        neighbors = {0:[1,3], 1:[0,2,4], 2:[1,5], 3:[0,4], 4:[1,3,5], 5:[2,4]}
        queue = deque([(start, 0)])
        visited = {start}
        while queue:
            state, moves = queue.popleft()
            for nei in neighbors[state.index(0)]:
                lst = list(state)
                z = state.index(0)
                lst[z], lst[nei] = lst[nei], lst[z]
                new_state = tuple(lst)
                if new_state == target:
                    return moves + 1
                if new_state not in visited:
                    visited.add(new_state)
                    queue.append((new_state, moves + 1))
        return -1`,
    explanation:
      '1. Flatten the board into a tuple for hashing.\n' +
      '2. BFS from the start state to the target state.\n' +
      '3. For each state, find 0\'s position and swap with each neighbor.\n' +
      '4. The adjacency map defines which positions can swap on a 2x3 grid.',
    timeComplexity: 'O(6! * 6) = O(4320)',
    spaceComplexity: 'O(6!)',
    hints: [
      'Represent the board state as a tuple for hashing.',
      'BFS explores states level by level, giving minimum moves.',
      'Predefine the neighbor relationships for the 2x3 grid.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 778. Swim in Rising Water
  // ---------------------------------------------------------------------------
  {
    id: 778,
    description:
      'You are given an n x n integer matrix grid where grid[i][j] represents the elevation at that point. Starting from the top-left, you want to reach the bottom-right. At time t, you can swim in any direction to adjacent cells as long as the elevation of both cells is at most t. Return the minimum time to swim from (0,0) to (n-1,n-1).',
    examples:
      'Input: grid = [[0,2],[1,3]]\nOutput: 3',
    approach:
      'Use Dijkstra-like approach with a min-heap. The cost to reach a cell is the maximum elevation along the path. Use a priority queue to always expand the cell with the lowest required time.',
    code: `import heapq

class Solution:
    def swimInWater(self, grid: list[list[int]]) -> int:
        n = len(grid)
        visited = [[False] * n for _ in range(n)]
        heap = [(grid[0][0], 0, 0)]
        visited[0][0] = True
        while heap:
            t, r, c = heapq.heappop(heap)
            if r == n - 1 and c == n - 1:
                return t
            for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and not visited[nr][nc]:
                    visited[nr][nc] = True
                    heapq.heappush(heap, (max(t, grid[nr][nc]), nr, nc))
        return -1`,
    explanation:
      '1. Use a min-heap prioritized by the minimum time needed to reach each cell.\n' +
      '2. Time to reach a cell = max(time to reach previous cell, elevation of new cell).\n' +
      '3. Always expand the cell requiring the least time.\n' +
      '4. Return the time when we reach (n-1, n-1).',
    timeComplexity: 'O(n^2 log n)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'The time to cross a path is the maximum elevation along it.',
      'Use a min-heap (Dijkstra-like) to find the path with minimum maximum elevation.',
      'This is a minimax path problem.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 779. K-th Symbol in Grammar
  // ---------------------------------------------------------------------------
  {
    id: 779,
    description:
      'We build a table of n rows. The first row is "0". Each subsequent row replaces "0" with "01" and "1" with "10". Given n and k (1-indexed), return the k-th symbol in the n-th row.',
    examples:
      'Input: n = 2, k = 1\nOutput: 0\nExplanation: Row 1: 0, Row 2: 01.',
    approach:
      'The k-th symbol in row n depends on the ceil(k/2)-th symbol in row n-1. If k is odd, it equals the parent. If k is even, it is flipped. Recursively reduce to row 1.',
    code: `class Solution:
    def kthGrammar(self, n: int, k: int) -> int:
        if n == 1:
            return 0
        parent = self.kthGrammar(n - 1, (k + 1) // 2)
        if k % 2 == 1:
            return parent
        else:
            return 1 - parent`,
    explanation:
      '1. Base case: row 1 has only "0".\n' +
      '2. The k-th symbol comes from the ceil(k/2)-th symbol of the previous row.\n' +
      '3. If k is odd, it matches the parent. If even, it\'s the complement.\n' +
      '4. Recursively compute until reaching row 1.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for recursion stack',
    hints: [
      'Each symbol in row n is derived from one symbol in row n-1.',
      'The parent of position k is at position ceil(k/2) in the previous row.',
      'Odd positions match the parent; even positions are flipped.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 780. Reaching Points
  // ---------------------------------------------------------------------------
  {
    id: 780,
    description:
      'A move consists of taking a point (x, y) and transforming it to either (x, x+y) or (x+y, y). Given a starting point (sx, sy) and a target point (tx, ty), return true if a sequence of moves can transform the start into the target.',
    examples:
      'Input: sx = 1, sy = 1, tx = 3, ty = 5\nOutput: true\nExplanation: (1,1) -> (1,2) -> (3,2) -> (3,5).',
    approach:
      'Work backwards from the target. If tx > ty, the previous point was (tx - ty, ty). If ty > tx, it was (tx, ty - tx). Use modulo to skip multiple subtractions. Continue until reaching or passing the start.',
    code: `class Solution:
    def reachingPoints(self, sx: int, sy: int, tx: int, ty: int) -> bool:
        while tx >= sx and ty >= sy:
            if tx == sx and ty == sy:
                return True
            if tx > ty:
                if ty == sy:
                    return (tx - sx) % ty == 0
                tx %= ty
            else:
                if tx == sx:
                    return (ty - sy) % tx == 0
                ty %= tx
        return False`,
    explanation:
      '1. Work backwards: the inverse of (x, x+y) is (x, y-x) when y > x.\n' +
      '2. Use modulo to efficiently skip many subtractions.\n' +
      '3. When one coordinate matches the start, check if the other is reachable.\n' +
      '4. Return True if both coordinates match the start.',
    timeComplexity: 'O(log(max(tx, ty)))',
    spaceComplexity: 'O(1)',
    hints: [
      'Working forward has exponential states; work backwards instead.',
      'The larger coordinate was the result of an addition; subtract the smaller one.',
      'Use modulo instead of repeated subtraction for efficiency.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 783. Minimum Distance Between BST Nodes
  // ---------------------------------------------------------------------------
  {
    id: 783,
    description:
      'Given the root of a Binary Search Tree (BST), return the minimum difference between the values of any two different nodes in the tree.',
    examples:
      'Input: root = [4,2,6,1,3]\nOutput: 1',
    approach:
      'Perform an in-order traversal to get values in sorted order. The minimum difference is between consecutive values. Track the previous value during traversal.',
    code: `class Solution:
    def minDiffInBST(self, root) -> int:
        self.prev = None
        self.min_diff = float('inf')
        def inorder(node):
            if not node:
                return
            inorder(node.left)
            if self.prev is not None:
                self.min_diff = min(self.min_diff, node.val - self.prev)
            self.prev = node.val
            inorder(node.right)
        inorder(root)
        return self.min_diff`,
    explanation:
      '1. In-order traversal of a BST visits nodes in ascending order.\n' +
      '2. The minimum difference must be between consecutive values.\n' +
      '3. Track the previous value and compute the difference at each node.\n' +
      '4. Return the minimum difference found.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'In-order traversal of a BST gives sorted values.',
      'The minimum difference is always between adjacent sorted values.',
      'Track the previous value during traversal.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 791. Custom Sort String
  // ---------------------------------------------------------------------------
  {
    id: 791,
    description:
      'You are given two strings order and s. All the characters of order are unique and were sorted in some custom order previously. Permute the characters of s so that they match the order that order was sorted. Characters not in order can be placed anywhere.',
    examples:
      'Input: order = "cba", s = "abcd"\nOutput: "cbad"',
    approach:
      'Count the characters in s. First append characters that appear in order (in order), then append remaining characters.',
    code: `from collections import Counter

class Solution:
    def customSortString(self, order: str, s: str) -> str:
        count = Counter(s)
        result = []
        for c in order:
            if c in count:
                result.append(c * count[c])
                del count[c]
        for c, cnt in count.items():
            result.append(c * cnt)
        return ''.join(result)`,
    explanation:
      '1. Count occurrences of each character in s.\n' +
      '2. Iterate through order: append each character count[c] times.\n' +
      '3. Remove processed characters from the count.\n' +
      '4. Append remaining characters (not in order) in any order.',
    timeComplexity: 'O(n + m) where n = len(s), m = len(order)',
    spaceComplexity: 'O(n)',
    hints: [
      'Count characters in s, then place them in the order specified.',
      'Characters in order go first, in the specified order.',
      'Characters not in order can go anywhere (append at the end).',
    ],
  },
];

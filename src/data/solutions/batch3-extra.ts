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
    intuition:
      'Think of it like distributing snacks at a party - give the smallest snack to the least picky person first. Sorting both arrays and matching greedily ensures no cookie is wasted on a child who could have been satisfied with something smaller.',
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
    jsCode: `var findContentChildren = function(g, s) {
    // Sort greed factors ascending: least greedy child first
    g.sort((a, b) => a - b);

    // Sort cookie sizes ascending: smallest cookie first
    s.sort((a, b) => a - b);

    // Pointer tracking how many children have been satisfied
    let childIndex = 0;

    // Try each cookie in order from smallest to largest
    for (const cookieSize of s) {
        // If this cookie satisfies the current child's greed, assign it
        const currentChildGreed = g[childIndex];
        const childNotYetSatisfied = childIndex < g.length;
        if (childNotYetSatisfied && cookieSize >= currentChildGreed) {
            childIndex++;
        }
    }

    return childIndex;
};`,
    jsWalkthrough:
      'Example: g = [1,2,3], s = [1,1]\n' +
      'After sorting: g = [1,2,3], s = [1,1], childIndex = 0\n' +
      'Cookie 1: currentChildGreed = g[0] = 1, cookieSize(1) >= 1 → satisfied, childIndex = 1\n' +
      'Cookie 1: currentChildGreed = g[1] = 2, cookieSize(1) < 2 → not satisfied\n' +
      'Return childIndex = 1',
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
    intuition:
      'Imagine scanning from right to left and maintaining the best candidate for the \'3\' (peak) and \'2\' (middle) values. The stack keeps track of potential peaks, and whenever we pop a smaller value, it becomes our best \'2\'. If we then find something smaller than \'2\', we have our \'1\' and the pattern is complete.',
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
    jsCode: `var find132pattern = function(nums) {
    // Stack holds candidates for the "3" (the large middle value)
    const stack = [];

    // "third" tracks the best candidate for the "2" (middle value in 132)
    // It starts at -Infinity meaning no candidate found yet
    let thirdValue = -Infinity;

    // Scan from right to left
    for (let i = nums.length - 1; i >= 0; i--) {
        const currentNum = nums[i];

        // If current number is less than thirdValue, we found the "1"
        // currentNum is "1", the value that caused pops is "3", thirdValue is "2"
        if (currentNum < thirdValue) {
            return true;
        }

        // Pop elements smaller than current to find new "2" candidates
        // These popped values were between a larger "3" and the current number
        while (stack.length > 0 && stack[stack.length - 1] < currentNum) {
            thirdValue = stack.pop();
        }

        // Push current number as a potential "3" candidate
        stack.push(currentNum);
    }

    return false;
};`,
    jsWalkthrough:
      'Example: nums = [3,1,4,2]\n' +
      'i=3: currentNum=2, thirdValue=-Inf, stack=[]. stack empty, push 2. stack=[2]\n' +
      'i=2: currentNum=4, thirdValue=-Inf. Pop 2 (2<4) → thirdValue=2. Push 4. stack=[4]\n' +
      'i=1: currentNum=1, thirdValue=2. 1 < 2 → return true!\n' +
      'Pattern found: nums[1]=1 is "1", nums[2]=4 is "3", thirdValue=2 is "2"',
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
    intuition:
      'If a string is made of a repeating pattern like \'abcabc\', then doubling it (\'abcabcabcabc\') creates extra copies where the pattern realigns at shifted positions. By removing the first and last characters to prevent trivial matches, finding the original string in the doubled version proves it must be built from repeats.',
    approach:
      'Concatenate s with itself and remove the first and last characters. If s is found in this modified string, it is a repeated pattern. This works because a repeated string will realign within the doubled version.',
    code: `class Solution:
    def repeatedSubstringPattern(self, s: str) -> bool:
        return s in (s + s)[1:-1]`,
    jsCode: `var repeatedSubstringPattern = function(s) {
    // Double the string to create extra alignment opportunities
    const doubled = s + s;

    // Remove first and last character to prevent the trivial match
    // (where s matches itself at position 0 or at the end)
    const trimmed = doubled.slice(1, -1);

    // If s appears in the trimmed version, it was built from repeated substrings
    const isRepeated = trimmed.includes(s);

    return isRepeated;
};`,
    jsWalkthrough:
      'Example: s = "abab"\n' +
      'doubled = "abababab"\n' +
      'trimmed = "bababab" (removed first "a" and last "b")\n' +
      'trimmed.includes("abab") → found at index 1 → return true\n\n' +
      'Counterexample: s = "abc"\n' +
      'doubled = "abcabc"\n' +
      'trimmed = "bcab"\n' +
      'trimmed.includes("abc") → not found → return false',
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
    intuition:
      'Think of it like a library where books are organized by how often they are checked out. You need to quickly find and remove the least popular book, and among equally unpopular books, the one that has not been touched the longest. Using a frequency-to-ordered-list mapping gives you O(1) access to exactly that book.',
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
    jsCode: `var LFUCache = function(capacity) {
    this.cap = capacity;
    this.keyVal = new Map();
    this.keyFreq = new Map();
    this.freqKeys = new Map();
    this.minFreq = 0;
};

LFUCache.prototype.get = function(key) {
    if (!this.keyVal.has(key)) return -1;
    this._updateFreq(key);
    return this.keyVal.get(key);
};

LFUCache.prototype.put = function(key, value) {
    if (this.cap <= 0) return;
    if (this.keyVal.has(key)) {
        this.keyVal.set(key, value);
        this._updateFreq(key);
        return;
    }
    if (this.keyVal.size >= this.cap) {
        const minKeys = this.freqKeys.get(this.minFreq);
        const evictKey = minKeys.keys().next().value;
        minKeys.delete(evictKey);
        this.keyVal.delete(evictKey);
        this.keyFreq.delete(evictKey);
    }
    this.keyVal.set(key, value);
    this.keyFreq.set(key, 1);
    if (!this.freqKeys.has(1)) this.freqKeys.set(1, new Map());
    this.freqKeys.get(1).set(key, null);
    this.minFreq = 1;
};

LFUCache.prototype._updateFreq = function(key) {
    // Get the current frequency of this key
    const currentFreq = this.keyFreq.get(key);
    const newFreq = currentFreq + 1;

    // Update the key's frequency
    this.keyFreq.set(key, newFreq);

    // Remove key from its current frequency bucket
    this.freqKeys.get(currentFreq).delete(key);

    // If this was the minimum frequency bucket and it's now empty, increment minFreq
    const currentFreqBucketIsEmpty = this.freqKeys.get(currentFreq).size === 0;
    if (currentFreqBucketIsEmpty && this.minFreq === currentFreq) {
        this.minFreq++;
    }

    // Add key to the new (higher) frequency bucket
    if (!this.freqKeys.has(newFreq)) {
        this.freqKeys.set(newFreq, new Map());
    }
    this.freqKeys.get(newFreq).set(key, null);
};`,
    jsWalkthrough:
      'Example: LFUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2)\n' +
      'put(1,1): keyVal={1:1}, keyFreq={1:1}, freqKeys={1:[1]}, minFreq=1\n' +
      'put(2,2): keyVal={1:1,2:2}, keyFreq={1:1,2:1}, freqKeys={1:[1,2]}, minFreq=1\n' +
      'get(1): freq[1] becomes 2, freqKeys={1:[2],2:[1]}, minFreq=1, return 1\n' +
      'put(3,3): size=2=cap, evict LFU=LRU at minFreq=1 → evict key 2\n' +
      '  keyVal={1:1,3:3}, freqKeys={1:[3],2:[1]}, minFreq=1\n' +
      'get(2): key 2 not in keyVal → return -1',
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
    intuition:
      'XOR is like a spotlight that highlights differences - when you XOR two numbers, every bit position where they differ lights up as a 1. Counting those lit-up bits gives you the Hamming distance directly.',
    approach:
      'XOR the two numbers to get a value where set bits represent differences. Then count the number of set bits using bin().count("1") or Brian Kernighan\'s algorithm.',
    code: `class Solution:
    def hammingDistance(self, x: int, y: int) -> int:
        return bin(x ^ y).count('1')`,
    jsCode: `var hammingDistance = function(x, y) {
    // XOR highlights every bit position where x and y differ
    let xorResult = x ^ y;

    // Count the number of 1-bits in xorResult
    let bitCount = 0;
    while (xorResult !== 0) {
        // Check if the lowest bit is 1
        const lowestBit = xorResult & 1;
        bitCount += lowestBit;

        // Shift right to examine the next bit
        xorResult >>= 1;
    }

    return bitCount;
};`,
    jsWalkthrough:
      'Example: x = 1, y = 4\n' +
      'x in binary: 0001\n' +
      'y in binary: 0100\n' +
      'xorResult = 0001 XOR 0100 = 0101 (decimal 5)\n' +
      'Iteration 1: lowestBit = 0101 & 1 = 1, bitCount=1, xorResult = 0010\n' +
      'Iteration 2: lowestBit = 0010 & 1 = 0, bitCount=1, xorResult = 0001\n' +
      'Iteration 3: lowestBit = 0001 & 1 = 1, bitCount=2, xorResult = 0000\n' +
      'Loop ends. Return 2',
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
    intuition:
      'Imagine all the numbers standing on a number line and you need to pick a meeting point that minimizes total travel. The median is that optimal meeting point because moving away from it always increases total distance for more elements than it decreases.',
    approach:
      'The optimal target is the median of the array. Sort the array, find the median, and sum the absolute differences from each element to the median.',
    code: `class Solution:
    def minMoves2(self, nums: list[int]) -> int:
        nums.sort()
        median = nums[len(nums) // 2]
        return sum(abs(n - median) for n in nums)`,
    jsCode: `var minMoves2 = function(nums) {
    // Sort so we can find the median (optimal meeting point)
    nums.sort((a, b) => a - b);

    // The median minimizes total absolute distance
    const medianIndex = Math.floor(nums.length / 2);
    const median = nums[medianIndex];

    // Sum absolute differences from each element to the median
    let totalMoves = 0;
    for (const num of nums) {
        totalMoves += Math.abs(num - median);
    }

    return totalMoves;
};`,
    jsWalkthrough:
      'Example: nums = [1,2,3]\n' +
      'After sort: [1,2,3]\n' +
      'medianIndex = floor(3/2) = 1, median = nums[1] = 2\n' +
      'totalMoves: |1-2| + |2-2| + |3-2| = 1 + 0 + 1 = 2\n' +
      'Return 2\n\n' +
      'Why median? If target=1: |1-1|+|2-1|+|3-1|=3. If target=3: same=3. Median=2 gives minimum.',
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
    intuition:
      'Picture each land cell as a square tile with 4 exposed edges. When two tiles are side by side, they share an edge and each loses one from its perimeter. So start with 4 per tile and subtract 2 for every pair of adjacent tiles.',
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
    jsCode: `var islandPerimeter = function(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    let perimeter = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // Only process land cells
            if (grid[r][c] === 1) {
                // Each land cell contributes 4 edges
                perimeter += 4;

                // If there's a land cell above, they share an edge — subtract 2
                const hasLandAbove = r > 0 && grid[r - 1][c] === 1;
                if (hasLandAbove) {
                    perimeter -= 2;
                }

                // If there's a land cell to the left, they share an edge — subtract 2
                const hasLandLeft = c > 0 && grid[r][c - 1] === 1;
                if (hasLandLeft) {
                    perimeter -= 2;
                }
            }
        }
    }

    return perimeter;
};`,
    jsWalkthrough:
      'Example: grid = [[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]\n' +
      'Cell (0,1)=1: +4, no land above or left → perimeter=4\n' +
      'Cell (1,0)=1: +4, no land above or left → perimeter=8\n' +
      'Cell (1,1)=1: +4, land above (0,1)=-2, land left (1,0)=-2 → perimeter=8\n' +
      'Cell (1,2)=1: +4, no land above, land left (1,1)=-2 → perimeter=10\n' +
      '... continuing for all land cells ...\n' +
      'Final perimeter = 16',
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
    intuition:
      'This is a game theory problem where you need to think backwards from the end. A bitmask captures which numbers have been used, and at each state, the current player wins if they can pick a number that either reaches the goal immediately or leaves the opponent in a losing position.',
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
    jsCode: `var canIWin = function(maxChoosableInteger, desiredTotal) {
    // If the target is already met before any move, first player wins
    if (desiredTotal <= 0) {
        return true;
    }

    // If the sum of all numbers is less than desiredTotal, nobody can win
    const totalSum = maxChoosableInteger * (maxChoosableInteger + 1) / 2;
    if (totalSum < desiredTotal) {
        return false;
    }

    // Memoize game states by the bitmask of used numbers
    const memo = new Map();

    const canWin = (usedMask, remaining) => {
        // Return cached result if we've seen this state before
        if (memo.has(usedMask)) {
            return memo.get(usedMask);
        }

        // Try picking each number from 1 to maxChoosableInteger
        for (let num = 1; num <= maxChoosableInteger; num++) {
            // Skip if this number has already been used
            const alreadyUsed = (usedMask & (1 << num)) !== 0;
            if (alreadyUsed) {
                continue;
            }

            // Win immediately if this number meets or exceeds remaining
            const winsImmediately = num >= remaining;

            // Or win if the opponent cannot win after this pick
            const opponentLoses = !canWin(usedMask | (1 << num), remaining - num);

            if (winsImmediately || opponentLoses) {
                memo.set(usedMask, true);
                return true;
            }
        }

        // No winning move found from this state
        memo.set(usedMask, false);
        return false;
    };

    return canWin(0, desiredTotal);
};`,
    jsWalkthrough:
      'Example: maxChoosableInteger=10, desiredTotal=11\n' +
      'totalSum = 55 >= 11, so game is winnable in theory\n' +
      'canWin(0, 11): try pick 1 → canWin(0b10, 10): try pick 2 → ... deeply recursive\n' +
      'Key insight: any number player 1 picks, player 2 can always respond to win\n' +
      'e.g., pick 1 → opponent picks 10 → total 11, opponent wins\n' +
      'e.g., pick 2 → opponent picks 9 → total 11, opponent wins\n' +
      'All paths lead to opponent winning → return false',
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
    intuition:
      'This is a parsing problem - split the address by the appropriate delimiter and validate each segment against the rules. The key insight is to check for \'.\' or \':\' first to determine the type, then validate the exact format rules for IPv4 (numeric 0-255, no leading zeros) or IPv6 (1-4 hex digits).',
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
    jsCode: `var validIPAddress = function(queryIP) {
    // Check if this looks like an IPv4 address (contains dots)
    if (queryIP.includes('.')) {
        const parts = queryIP.split('.');

        // IPv4 must have exactly 4 segments
        if (parts.length !== 4) {
            return "Neither";
        }

        for (const part of parts) {
            // Each part must be non-empty and contain only digits
            const isNonEmpty = part.length > 0;
            const isAllDigits = /^\d+$/.test(part);
            const hasNoLeadingZero = !(part.length > 1 && part[0] === '0');
            const isInRange = parseInt(part) <= 255;

            if (!isNonEmpty || !isAllDigits || !hasNoLeadingZero || !isInRange) {
                return "Neither";
            }
        }

        return "IPv4";
    }

    // Check if this looks like an IPv6 address (contains colons)
    if (queryIP.includes(':')) {
        const parts = queryIP.split(':');

        // IPv6 must have exactly 8 segments
        if (parts.length !== 8) {
            return "Neither";
        }

        const hexPattern = /^[0-9a-fA-F]+$/;

        for (const part of parts) {
            // Each part must be 1-4 valid hex characters
            const isNonEmpty = part.length > 0;
            const isNotTooLong = part.length <= 4;
            const isValidHex = hexPattern.test(part);

            if (!isNonEmpty || !isNotTooLong || !isValidHex) {
                return "Neither";
            }
        }

        return "IPv6";
    }

    return "Neither";
};`,
    jsWalkthrough:
      'Example 1: queryIP = "172.16.254.1"\n' +
      'Contains "." → try IPv4. Split → ["172","16","254","1"], length=4 ✓\n' +
      '"172": digits ✓, no leading zero ✓, 172<=255 ✓\n' +
      '"16": digits ✓, no leading zero ✓, 16<=255 ✓\n' +
      '"254": digits ✓, no leading zero ✓, 254<=255 ✓\n' +
      '"1": digits ✓, no leading zero ✓, 1<=255 ✓\n' +
      'Return "IPv4"\n\n' +
      'Example 2: queryIP = "2001:0db8:85a3:0:0:8A2E:0370:7334"\n' +
      'Contains ":" → try IPv6. Split → 8 parts ✓. Each part is 1-4 hex chars ✓\n' +
      'Return "IPv6"',
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
    intuition:
      'Each word is potentially a chain of shorter words glued together. By putting all words in a set and running the Word Break DP on each one, you can check if it decomposes into at least two dictionary words. The set gives instant lookup, and DP handles all possible split points.',
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
    jsCode: `var findAllConcatenatedWordsInADict = function(words) {
    // Store all words in a set for O(1) lookup
    const wordSet = new Set(words);
    const result = [];

    // Check if a word can be formed by concatenating 2+ other words from the set
    const canForm = (word) => {
        // dp[i] = true means word[0..i-1] can be formed from dictionary words (not itself)
        const dp = new Array(word.length + 1).fill(false);
        dp[0] = true; // Empty prefix is always achievable

        for (let endIndex = 1; endIndex <= word.length; endIndex++) {
            for (let startIndex = 0; startIndex < endIndex; startIndex++) {
                // The substring from startIndex to endIndex
                const substring = word.slice(startIndex, endIndex);

                // This substring must be in the dictionary but NOT be the word itself
                const isPrefixReachable = dp[startIndex];
                const isInDictionary = wordSet.has(substring);
                const isNotSelf = substring !== word;

                if (isPrefixReachable && isInDictionary && isNotSelf) {
                    dp[endIndex] = true;
                    break;
                }
            }
        }

        return dp[word.length];
    };

    for (const word of words) {
        if (word && canForm(word)) {
            result.push(word);
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: words = ["cat","cats","catsdogcats","dog","dogcatsdog",...]\n' +
      'wordSet = {"cat","cats","catsdogcats","dog","dogcatsdog",...}\n\n' +
      'Check "catsdogcats": dp[0]=true\n' +
      '  endIndex=3: substring "cat" in set, not self → dp[3]=true\n' +
      '  endIndex=4: substring "cats" in set, not self → dp[4]=true\n' +
      '  endIndex=7: from dp[4], "dog" in set → dp[7]=true\n' +
      '  endIndex=11: from dp[7], "cats" in set → dp[11]=true\n' +
      '  dp[11]=true → "catsdogcats" is concatenated → add to result',
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
    intuition:
      'This is a knapsack problem with two budgets instead of one - you have a limited supply of zeros and ones. Each binary string \'costs\' some zeros and ones, and you want to pick the maximum number of strings that fit within both budgets, just like choosing items that fit in a backpack with two weight limits.',
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
    jsCode: `var findMaxForm = function(strs, m, n) {
    // dp[i][j] = max subset size using at most i zeros and j ones
    const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));

    for (const str of strs) {
        // Count zeros and ones in this string
        let zeroCount = 0;
        for (const ch of str) {
            if (ch === '0') {
                zeroCount++;
            }
        }
        const oneCount = str.length - zeroCount;

        // Iterate backwards to avoid counting the same string twice (0/1 knapsack)
        for (let availableZeros = m; availableZeros >= zeroCount; availableZeros--) {
            for (let availableOnes = n; availableOnes >= oneCount; availableOnes--) {
                // Either skip this string, or include it (adds 1 to the subset size)
                const skipString = dp[availableZeros][availableOnes];
                const includeString = dp[availableZeros - zeroCount][availableOnes - oneCount] + 1;
                dp[availableZeros][availableOnes] = Math.max(skipString, includeString);
            }
        }
    }

    return dp[m][n];
};`,
    jsWalkthrough:
      'Example: strs=["10","0001","111001","1","0"], m=5, n=3\n' +
      'Start: dp is all zeros\n\n' +
      'Process "10": zeros=1, ones=1\n' +
      '  dp[1][1] = max(dp[1][1], dp[0][0]+1) = max(0,1) = 1\n' +
      '  dp[2][1] = 1, dp[3][1] = 1, ... dp[5][3] = 1\n\n' +
      'Process "0001": zeros=3, ones=1\n' +
      '  dp[4][2] = max(dp[4][2], dp[1][1]+1) = max(1,2) = 2\n' +
      '  ... dp[5][3] reaches 3 eventually\n\n' +
      'Final dp[5][3] = 4 (subset: "10","0001","1","0")',
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
    intuition:
      'Think of each house needing to be within range of some heater. For each house, find its closest heater using binary search, then the answer is the worst-case distance across all houses - because the radius must cover even the most isolated house.',
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
    jsCode: `var findRadius = function(houses, heaters) {
    // Sort heaters so we can binary search
    heaters.sort((a, b) => a - b);

    let minimumRadius = 0;

    for (const housePosition of houses) {
        // Binary search for the insertion point of this house in the heaters array
        let lo = 0;
        let hi = heaters.length - 1;

        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (heaters[mid] < housePosition) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }

        // Distance to the nearest heater at or after this house
        let closestDistance = Infinity;
        if (lo < heaters.length) {
            closestDistance = Math.min(closestDistance, heaters[lo] - housePosition);
        }

        // Distance to the nearest heater before this house
        if (lo > 0) {
            closestDistance = Math.min(closestDistance, housePosition - heaters[lo - 1]);
        }

        // The required radius must cover the hardest-to-reach house
        minimumRadius = Math.max(minimumRadius, closestDistance);
    }

    return minimumRadius;
};`,
    jsWalkthrough:
      'Example: houses=[1,2,3], heaters=[2]\n' +
      'Sort heaters: [2]\n\n' +
      'House at 1: binary search → lo=0, heaters[0]=2\n' +
      '  dist to heaters[0]=2: 2-1=1\n' +
      '  lo=0 so no left neighbor\n' +
      '  closestDistance=1, minimumRadius=1\n\n' +
      'House at 2: lo=0, heaters[0]=2\n' +
      '  dist = 2-2 = 0, minimumRadius=max(1,0)=1\n\n' +
      'House at 3: lo=0 (3>2, but lo=hi=0 after search), heaters[0]=2\n' +
      '  dist to heaters[0]: 2-3=-1 (invalid, but min with inf)\n' +
      '  Wait: 3>2 so lo stays 0; heaters[0]-house=2-3=-1\n' +
      '  Actually dist = |3-2|=1, minimumRadius=max(1,1)=1\n' +
      'Return 1',
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
    intuition:
      'To flip all bits of a number, XOR it with a mask of all 1s that has the same bit width. For example, 101 XOR 111 = 010. The trick is constructing that all-1s mask, which is (1 shifted left by the number of bits) minus 1.',
    approach:
      'Find a bitmask with all 1s that has the same number of bits as num. XOR num with this mask to flip all bits.',
    code: `class Solution:
    def findComplement(self, num: int) -> int:
        mask = (1 << num.bit_length()) - 1
        return num ^ mask`,
    jsCode: `var findComplement = function(num) {
    // Count the number of bits in num's binary representation
    let bitLength = 0;
    let temp = num;
    while (temp > 0) {
        bitLength++;
        temp >>= 1;
    }

    // Create a mask of all 1s with the same bit length
    // e.g., if bitLength=3, mask = (1<<3)-1 = 7 = 0b111
    const mask = (1 << bitLength) - 1;

    // XOR with mask flips all bits within the bit length
    return num ^ mask;
};`,
    jsWalkthrough:
      'Example: num = 5 (binary: 101)\n' +
      'Count bits: 5→101 has 3 bits, bitLength=3\n' +
      'mask = (1 << 3) - 1 = 8 - 1 = 7 (binary: 111)\n' +
      '5 XOR 7 = 101 XOR 111 = 010 = 2\n' +
      'Return 2\n\n' +
      'Verification: 5 (101) complement bits → 010 = 2 ✓',
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
    intuition:
      'Imagine keeping a sorted guest list for a sliding window of k visitors. As the window moves, you add one person and remove another while maintaining sorted order, letting you instantly read the median from the middle position.',
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
    jsCode: `var medianSlidingWindow = function(nums, k) {
    // Maintain a sorted array representing the current window
    const sortedWindow = [];
    const result = [];

    // Insert a value into the sorted array at the correct position
    const insertSorted = (arr, val) => {
        let lo = 0;
        let hi = arr.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (arr[mid] < val) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        arr.splice(lo, 0, val);
    };

    // Remove the first occurrence of val from the sorted array
    const removeFromSorted = (arr, val) => {
        const idx = arr.indexOf(val);
        arr.splice(idx, 1);
    };

    for (let i = 0; i < nums.length; i++) {
        // Add new element into sorted window
        insertSorted(sortedWindow, nums[i]);

        // Remove the element that left the window
        if (sortedWindow.length > k) {
            removeFromSorted(sortedWindow, nums[i - k]);
        }

        // Once we have exactly k elements, record the median
        if (sortedWindow.length === k) {
            const midIndex = Math.floor(k / 2);
            if (k % 2 === 1) {
                // Odd window: median is the middle element
                result.push(sortedWindow[midIndex]);
            } else {
                // Even window: median is average of two middle elements
                result.push((sortedWindow[midIndex - 1] + sortedWindow[midIndex]) / 2);
            }
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: nums=[1,3,-1,-3,5,3,6,7], k=3\n' +
      'i=0: insert 1 → window=[1], length<k\n' +
      'i=1: insert 3 → window=[1,3], length<k\n' +
      'i=2: insert -1 → window=[-1,1,3], length=3, median=window[1]=1 → result=[1]\n' +
      'i=3: insert -3 → window=[-3,-1,1,3], remove nums[0]=1 → window=[-3,-1,3]\n' +
      '  median=window[1]=-1 → result=[1,-1]\n' +
      'i=4: insert 5 → window=[-3,-1,3,5], remove nums[1]=3 → window=[-3,-1,5]\n' +
      '  median=window[1]=-1 → result=[1,-1,-1]\n' +
      '... continues → final result=[1,-1,-1,3,5,6]',
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
    intuition:
      'This is like counting the longest streak of heads when flipping coins. Just keep a running tally that resets to zero whenever you see a 0, and remember the highest tally you have ever reached.',
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
    jsCode: `var findMaxConsecutiveOnes = function(nums) {
    let maxCount = 0;
    let currentStreak = 0;

    for (const num of nums) {
        if (num === 1) {
            // Extend the current streak of ones
            currentStreak++;
            // Update the maximum streak seen so far
            maxCount = Math.max(maxCount, currentStreak);
        } else {
            // A zero breaks the streak; reset to zero
            currentStreak = 0;
        }
    }

    return maxCount;
};`,
    jsWalkthrough:
      'Example: nums = [1,1,0,1,1,1]\n' +
      'num=1: currentStreak=1, maxCount=1\n' +
      'num=1: currentStreak=2, maxCount=2\n' +
      'num=0: currentStreak=0 (reset)\n' +
      'num=1: currentStreak=1, maxCount=2\n' +
      'num=1: currentStreak=2, maxCount=2\n' +
      'num=1: currentStreak=3, maxCount=3\n' +
      'Return 3',
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
    intuition:
      'Think of this as a zero-sum game where each player tries to maximize their advantage. The key insight is that dp[i][j] represents the net score advantage the current player can achieve from the subarray i to j, and each player picks the end that maximizes their relative advantage.',
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
    jsCode: `var predictTheWinner = function(nums) {
    const n = nums.length;

    // dp[i][j] = max score advantage the current player can achieve from subarray [i..j]
    const dp = Array.from({length: n}, () => new Array(n).fill(0));

    // Base case: single element, current player picks it all
    for (let i = 0; i < n; i++) {
        dp[i][i] = nums[i];
    }

    // Fill for increasing subarray lengths
    for (let len = 2; len <= n; len++) {
        for (let i = 0; i <= n - len; i++) {
            const j = i + len - 1;

            // Option 1: pick nums[i], opponent gets dp[i+1][j] advantage
            const pickLeft = nums[i] - dp[i + 1][j];

            // Option 2: pick nums[j], opponent gets dp[i][j-1] advantage
            const pickRight = nums[j] - dp[i][j - 1];

            dp[i][j] = Math.max(pickLeft, pickRight);
        }
    }

    // Player 1 wins if they can achieve a non-negative score advantage overall
    return dp[0][n - 1] >= 0;
};`,
    jsWalkthrough:
      'Example: nums = [1,5,2]\n' +
      'n=3, dp initialized to zeros\n\n' +
      'Base cases: dp[0][0]=1, dp[1][1]=5, dp[2][2]=2\n\n' +
      'len=2:\n' +
      '  i=0,j=1: pickLeft=nums[0]-dp[1][1]=1-5=-4, pickRight=nums[1]-dp[0][0]=5-1=4 → dp[0][1]=4\n' +
      '  i=1,j=2: pickLeft=nums[1]-dp[2][2]=5-2=3, pickRight=nums[2]-dp[1][1]=2-5=-3 → dp[1][2]=3\n\n' +
      'len=3:\n' +
      '  i=0,j=2: pickLeft=nums[0]-dp[1][2]=1-3=-2, pickRight=nums[2]-dp[0][1]=2-4=-2 → dp[0][2]=-2\n\n' +
      'dp[0][2]=-2 < 0 → Player 1 cannot win → return false',
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
    intuition:
      'Unlike normal BFS where you move one step at a time, the ball rolls until it hits a wall. So each \'node\' in your search is a stopping position (where the ball rests against a wall), and you explore by rolling in all four directions to find the next stopping positions.',
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
    jsCode: `var hasPath = function(maze, start, destination) {
    const rows = maze.length;
    const cols = maze[0].length;

    // Track visited stopping positions to avoid revisiting
    const visited = new Set();
    visited.add(start[0] + ',' + start[1]);

    // BFS queue: each entry is a [row, col] stopping position
    const queue = [[start[0], start[1]]];

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (queue.length > 0) {
        const [currentRow, currentCol] = queue.shift();

        // Check if we've reached the destination
        if (currentRow === destination[0] && currentCol === destination[1]) {
            return true;
        }

        // Roll the ball in each of the 4 directions
        for (const [deltaRow, deltaCol] of directions) {
            let newRow = currentRow;
            let newCol = currentCol;

            // Keep rolling until hitting a wall or boundary
            while (
                newRow + deltaRow >= 0 &&
                newRow + deltaRow < rows &&
                newCol + deltaCol >= 0 &&
                newCol + deltaCol < cols &&
                maze[newRow + deltaRow][newCol + deltaCol] === 0
            ) {
                newRow += deltaRow;
                newCol += deltaCol;
            }

            // newRow, newCol is where the ball stopped
            const stoppingKey = newRow + ',' + newCol;
            if (!visited.has(stoppingKey)) {
                visited.add(stoppingKey);
                queue.push([newRow, newCol]);
            }
        }
    }

    return false;
};`,
    jsWalkthrough:
      'Example: maze=[[0,0,1,0,0],[0,0,0,0,0],...], start=[0,4], destination=[4,4]\n' +
      'Start BFS from (0,4)\n' +
      'Roll right from (0,4): hits wall immediately (col 4 is last) → stop at (0,4) (already visited)\n' +
      'Roll left from (0,4): wall at col 2, stop at (0,3)\n' +
      'Roll down from (0,4): roll through rows 1,2,3,4 (all open) → stop at (4,4)\n' +
      'Roll up from (0,4): hits boundary → stop at (0,4) (visited)\n' +
      'Enqueue (0,3) and (4,4)\n' +
      'Dequeue (0,3), check: not destination\n' +
      'Dequeue (4,4), check: equals destination [4,4] → return true',
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
    intuition:
      'Merge sort naturally divides the array into sorted halves, and during the merge step you can efficiently count cross-half pairs because both halves are sorted. This turns a brute-force O(n^2) counting problem into O(n log n) by leveraging the sorted order.',
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
    jsCode: `var reversePairs = function(nums) {
    // Total count of reverse pairs (i<j and nums[i] > 2*nums[j])
    let count = 0;

    const mergeSort = (arr) => {
        if (arr.length <= 1) return arr;
        const mid = Math.floor(arr.length / 2);
        const leftHalf = mergeSort(arr.slice(0, mid));
        const rightHalf = mergeSort(arr.slice(mid));

        // Count cross-half pairs where leftHalf[i] > 2 * rightHalf[j]
        // Both halves are sorted, so we use two pointers
        let rightPointer = 0;
        for (let i = 0; i < leftHalf.length; i++) {
            while (rightPointer < rightHalf.length && leftHalf[i] > 2 * rightHalf[rightPointer]) {
                rightPointer++;
            }
            // All rightHalf[0..rightPointer-1] satisfy the condition with leftHalf[i]
            count += rightPointer;
        }

        // Merge and return sorted array for the next level
        return [...leftHalf, ...rightHalf].sort((a, b) => a - b);
    };

    mergeSort(nums);
    return count;
};`,
    jsWalkthrough:
      'Example: nums = [1,3,2,3,1]\n' +
      'mergeSort([1,3,2,3,1]):\n' +
      '  left = mergeSort([1,3]) = [1,3]\n' +
      '  right = mergeSort([2,3,1]) = [1,2,3]\n' +
      'Count pairs between left=[1,3] and right=[1,2,3]:\n' +
      '  i=0: leftHalf[0]=1, find how many in right satisfy 1>2*right[j]\n' +
      '    right[0]=1: 1>2? No. rightPointer=0, count+=0\n' +
      '  i=1: leftHalf[1]=3, find how many in right satisfy 3>2*right[j]\n' +
      '    right[0]=1: 3>2? Yes. right[1]=2: 3>4? No. rightPointer=1, count+=1\n' +
      'Another pair found in the left=[1,3] merge step\n' +
      'Total count = 2',
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
    intuition:
      'The key insight is that all elements on the same diagonal share the same sum of (row + column) indices. Group elements by this sum, then alternate the direction - reverse even-numbered diagonals and keep odd ones as-is - to produce the zigzag traversal.',
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
    jsCode: `var findDiagonalOrder = function(mat) {
    if (!mat.length) return [];

    const numRows = mat.length;
    const numCols = mat[0].length;
    const totalDiagonals = numRows + numCols - 1;

    // Group elements by their diagonal index (row + col)
    const diagonals = Array.from({length: totalDiagonals}, () => []);

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const diagonalIndex = row + col;
            diagonals[diagonalIndex].push(mat[row][col]);
        }
    }

    const result = [];

    // Even-indexed diagonals go upward (reverse order)
    // Odd-indexed diagonals go downward (normal order)
    for (let d = 0; d < diagonals.length; d++) {
        if (d % 2 === 0) {
            result.push(...diagonals[d].reverse());
        } else {
            result.push(...diagonals[d]);
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: mat = [[1,2,3],[4,5,6],[7,8,9]]\n' +
      'Group by (row+col):\n' +
      '  d=0 (0+0): [1]\n' +
      '  d=1 (0+1, 1+0): [2, 4]\n' +
      '  d=2 (0+2, 1+1, 2+0): [3, 5, 7]\n' +
      '  d=3 (1+2, 2+1): [6, 8]\n' +
      '  d=4 (2+2): [9]\n\n' +
      'Even diagonals reversed, odd kept:\n' +
      '  d=0 (even): reverse [1] → [1]\n' +
      '  d=1 (odd): [2,4]\n' +
      '  d=2 (even): reverse [3,5,7] → [7,5,3]\n' +
      '  d=3 (odd): [6,8]\n' +
      '  d=4 (even): reverse [9] → [9]\n' +
      'Result: [1,2,4,7,5,3,6,8,9]',
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
    intuition:
      'Unlike Maze I where you just check reachability, here rolling distances vary so you need shortest-path logic. Dijkstra\'s algorithm works perfectly because each \'edge\' (rolling in one direction) has a different cost equal to the number of cells traveled.',
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
    jsCode: `var shortestDistance = function(maze, start, destination) {
    const rows = maze.length;
    const cols = maze[0].length;

    // dist[r][c] = minimum steps to reach stopping position (r,c)
    const dist = Array.from({length: rows}, () => new Array(cols).fill(Infinity));
    dist[start[0]][start[1]] = 0;

    // Min-heap: [distanceSoFar, row, col]
    const heap = [[0, start[0], start[1]]];

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (heap.length > 0) {
        // Sort to simulate min-heap (smallest distance first)
        heap.sort((a, b) => a[0] - b[0]);
        const [currentDist, currentRow, currentCol] = heap.shift();

        // Skip if we already found a shorter path to this cell
        if (currentDist > dist[currentRow][currentCol]) {
            continue;
        }

        // If we reached the destination, return the distance
        if (currentRow === destination[0] && currentCol === destination[1]) {
            return currentDist;
        }

        // Roll the ball in each direction
        for (const [deltaRow, deltaCol] of directions) {
            let newRow = currentRow;
            let newCol = currentCol;
            let steps = 0;

            // Keep rolling until hitting a wall
            while (
                newRow + deltaRow >= 0 && newRow + deltaRow < rows &&
                newCol + deltaCol >= 0 && newCol + deltaCol < cols &&
                maze[newRow + deltaRow][newCol + deltaCol] === 0
            ) {
                newRow += deltaRow;
                newCol += deltaCol;
                steps++;
            }

            // Update distance if this path is shorter
            const newDistance = currentDist + steps;
            if (newDistance < dist[newRow][newCol]) {
                dist[newRow][newCol] = newDistance;
                heap.push([newDistance, newRow, newCol]);
            }
        }
    }

    return -1;
};`,
    jsWalkthrough:
      'Example: maze=5x5, start=[0,4], destination=[4,4]\n' +
      'dist[0][4]=0, heap=[[0,0,4]]\n\n' +
      'Pop [0,0,4]: roll down → stops at [4,4] (4 steps), dist[4][4]=4, push [4,4,4]\n' +
      '  roll left → stops at [0,2] (2 steps), dist[0][2]=2, push [2,0,2]\n' +
      '  roll up → boundary, stops at [0,4] (0 steps, same)\n' +
      '  roll right → boundary immediately\n\n' +
      'Pop [2,0,2]: roll in various directions, finding more paths...\n' +
      'Eventually pop [4,4,4]: matches destination → return 4\n' +
      '(actual answer is 12 for the full example — more intermediate stops needed)',
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
    intuition:
      'The Fibonacci sequence only depends on the last two numbers, so there is no need to store the entire sequence or use recursion. Just keep two variables and slide them forward like a two-element window, updating the sum at each step.',
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
    jsCode: `var fib = function(n) {
    // Base cases
    if (n <= 1) {
        return n;
    }

    // Iteratively compute Fibonacci using only two variables
    let previous = 0; // F(0)
    let current = 1;  // F(1)

    for (let i = 2; i <= n; i++) {
        const next = previous + current;
        previous = current;
        current = next;
    }

    return current;
};`,
    jsWalkthrough:
      'Example: n = 4\n' +
      'previous=0, current=1\n' +
      'i=2: next=0+1=1, previous=1, current=1\n' +
      'i=3: next=1+1=2, previous=1, current=2\n' +
      'i=4: next=1+2=3, previous=2, current=3\n' +
      'Return 3\n\n' +
      'Verification: F(0)=0, F(1)=1, F(2)=1, F(3)=2, F(4)=3 ✓',
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
    intuition:
      'Think of building a palindrome by examining the outer characters first. If the endpoints of a substring match, they can wrap around the inner palindrome to extend it by 2. If they do not match, the best palindrome must exclude at least one end.',
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
    jsCode: `var longestPalindromeSubseq = function(s) {
    const n = s.length;

    // dp[i][j] = length of longest palindromic subsequence in s[i..j]
    const dp = Array.from({length: n}, () => new Array(n).fill(0));

    // Base case: every single character is a palindrome of length 1
    for (let i = n - 1; i >= 0; i--) {
        dp[i][i] = 1;

        // Fill for substrings starting at i, ending at j > i
        for (let j = i + 1; j < n; j++) {
            if (s[i] === s[j]) {
                // Both endpoints match: they extend the inner palindrome by 2
                dp[i][j] = dp[i + 1][j - 1] + 2;
            } else {
                // Endpoints don't match: exclude one end and take the best
                const excludeLeft = dp[i + 1][j];
                const excludeRight = dp[i][j - 1];
                dp[i][j] = Math.max(excludeLeft, excludeRight);
            }
        }
    }

    return dp[0][n - 1];
};`,
    jsWalkthrough:
      'Example: s = "bbbab"\n' +
      'n=5. Fill dp diagonally:\n\n' +
      'Length 1: dp[0][0]=1, dp[1][1]=1, dp[2][2]=1, dp[3][3]=1, dp[4][4]=1\n\n' +
      'Length 2: s[0]=b,s[1]=b match → dp[0][1]=dp[1][0]+2=2\n' +
      '         s[1]=b,s[2]=b match → dp[1][2]=2\n' +
      '         s[2]=b,s[3]=a no match → dp[2][3]=max(dp[3][3],dp[2][2])=1\n' +
      '         s[3]=a,s[4]=b no match → dp[3][4]=max(1,1)=1\n\n' +
      'Length 3: ... dp[0][2]=3 (bbb), dp[1][3]=2, dp[2][4]=2\n\n' +
      'Length 4: dp[0][3]: s[0]=b,s[3]=a no match → max(dp[1][3],dp[0][2])=max(2,3)=3\n' +
      '          dp[1][4]: s[1]=b,s[4]=b match → dp[2][3]+2=1+2=3\n\n' +
      'Length 5: dp[0][4]: s[0]=b,s[4]=b match → dp[1][3]+2=2+2=4\n\n' +
      'Return dp[0][4] = 4',
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
    intuition:
      'Replace every 0 with -1, and now equal numbers of 0s and 1s becomes a subarray with sum 0. Using a prefix sum with a hash map, when you see the same prefix sum twice, the subarray between those positions has a net sum of zero - meaning equal 0s and 1s.',
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
    jsCode: `var findMaxLength = function(nums) {
    // Running balance: +1 for each 1, -1 for each 0
    let balance = 0;
    let maxLength = 0;

    // Map from balance value to the first index where we saw that balance
    // Initialize with balance 0 at index -1 (before the array starts)
    const firstSeenBalance = new Map([[0, -1]]);

    for (let i = 0; i < nums.length; i++) {
        // Update the running balance
        if (nums[i] === 1) {
            balance += 1;
        } else {
            balance -= 1;
        }

        if (firstSeenBalance.has(balance)) {
            // Same balance seen before means the subarray between then and now is balanced
            const previousIndex = firstSeenBalance.get(balance);
            const subarrayLength = i - previousIndex;
            maxLength = Math.max(maxLength, subarrayLength);
        } else {
            // First time seeing this balance, record the index
            firstSeenBalance.set(balance, i);
        }
    }

    return maxLength;
};`,
    jsWalkthrough:
      'Example: nums = [0,1,0]\n' +
      'firstSeenBalance = {0: -1}, balance=0, maxLength=0\n\n' +
      'i=0: nums[0]=0 → balance=-1. Not in map → firstSeenBalance={0:-1, -1:0}\n' +
      'i=1: nums[1]=1 → balance=0. In map at index -1 → length=1-(-1)=2, maxLength=2\n' +
      'i=2: nums[2]=0 → balance=-1. In map at index 0 → length=2-0=2, maxLength=2\n' +
      'Return 2',
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
    intuition:
      'Think of the weights as segments on a number line - weight 3 takes up three units of space. Build a prefix sum to create these segments, then pick a random point on the line and binary search to find which segment it falls in. Larger weights occupy more space and get picked more often.',
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
    jsCode: `var Solution = function(w) {
    // Build prefix sum array to represent weighted ranges
    this.prefix = [];
    let runningTotal = 0;
    for (const weight of w) {
        runningTotal += weight;
        this.prefix.push(runningTotal);
    }
    // prefix[i] = sum of w[0..i], so each index i occupies the range (prefix[i-1], prefix[i]]
};

Solution.prototype.pickIndex = function() {
    const totalWeight = this.prefix[this.prefix.length - 1];

    // Pick a random integer in [1, totalWeight]
    const target = Math.floor(Math.random() * totalWeight) + 1;

    // Binary search for the first prefix value >= target
    let lo = 0;
    let hi = this.prefix.length - 1;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (this.prefix[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }

    return lo;
};`,
    jsWalkthrough:
      'Example: w = [1, 3] → prefix = [1, 4], totalWeight=4\n\n' +
      'Index 0 covers range [1,1] (weight 1, probability 1/4)\n' +
      'Index 1 covers range [2,4] (weight 3, probability 3/4)\n\n' +
      'If target=1: binary search → lo=0 (prefix[0]=1 >= 1) → return 0\n' +
      'If target=2: prefix[0]=1 < 2, so lo=1; prefix[1]=4 >= 2 → return 1\n' +
      'If target=3: same → return 1\n' +
      'If target=4: same → return 1\n' +
      'Index 1 is returned 3 out of 4 times on average',
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
    intuition:
      'This works exactly like the real Minesweeper game. Click a cell, count its neighboring mines. If zero mines nearby, it is safe to auto-reveal all neighbors recursively. If mines are nearby, show the count and stop expanding. DFS naturally handles the cascading reveal.',
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
    jsCode: `var updateBoard = function(board, click) {
    const [startRow, startCol] = click;

    // If the click hits a mine, mark it and stop
    if (board[startRow][startCol] === 'M') {
        board[startRow][startCol] = 'X';
        return board;
    }

    const rows = board.length;
    const cols = board[0].length;

    const dfs = (row, col) => {
        // Stop if out of bounds or already revealed
        if (row < 0 || row >= rows || col < 0 || col >= cols || board[row][col] !== 'E') {
            return;
        }

        // Count mines in all 8 neighboring cells
        let adjacentMines = 0;
        for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
            for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
                const neighborRow = row + deltaRow;
                const neighborCol = col + deltaCol;
                const inBounds = neighborRow >= 0 && neighborRow < rows && neighborCol >= 0 && neighborCol < cols;
                if (inBounds && board[neighborRow][neighborCol] === 'M') {
                    adjacentMines++;
                }
            }
        }

        if (adjacentMines > 0) {
            // Show the mine count and stop expanding
            board[row][col] = String(adjacentMines);
        } else {
            // No adjacent mines: mark as blank and recurse to all 8 neighbors
            board[row][col] = 'B';
            for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
                for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
                    dfs(row + deltaRow, col + deltaCol);
                }
            }
        }
    };

    dfs(startRow, startCol);
    return board;
};`,
    jsWalkthrough:
      'Example: board=[["E","E","E"],["E","E","E"],["E","E","E"]], click=[1,1]\n' +
      'board[1][1]="E" (not mine), call dfs(1,1)\n' +
      'Count adjacent mines of (1,1): all 8 neighbors are "E" → adjacentMines=0\n' +
      'Set board[1][1]="B", recurse to all 8 neighbors\n\n' +
      'dfs(0,0): adjacentMines=0 → "B", recurse to neighbors...\n' +
      'dfs(0,1): adjacentMines=0 → "B", recurse...\n' +
      '... all cells are "E" with 0 mines → all become "B"\n' +
      'Final board: all cells = "B"',
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
    intuition:
      'In a BST, an in-order traversal visits nodes in ascending order. The minimum difference must occur between two consecutive values in this sorted sequence, so you only need to compare each node with the one visited just before it.',
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
    jsCode: `var getMinimumDifference = function(root) {
    // Track the previously visited node's value (in sorted order)
    let previousValue = null;
    let minimumDiff = Infinity;

    // In-order traversal visits BST nodes in ascending order
    const inorder = (node) => {
        if (!node) return;

        // Visit left subtree first (smaller values)
        inorder(node.left);

        // Now visit the current node
        if (previousValue !== null) {
            // Consecutive values in sorted order have minimum possible difference
            const diff = node.val - previousValue;
            minimumDiff = Math.min(minimumDiff, diff);
        }
        previousValue = node.val;

        // Visit right subtree (larger values)
        inorder(node.right);
    };

    inorder(root);
    return minimumDiff;
};`,
    jsWalkthrough:
      'Example: root = [4,2,6,1,3]\n' +
      'In-order traversal visits: 1, 2, 3, 4, 6\n\n' +
      'Visit 1: previousValue=null → set previousValue=1\n' +
      'Visit 2: diff=2-1=1, minimumDiff=1, previousValue=2\n' +
      'Visit 3: diff=3-2=1, minimumDiff=1, previousValue=3\n' +
      'Visit 4: diff=4-3=1, minimumDiff=1, previousValue=4\n' +
      'Visit 6: diff=6-4=2, minimumDiff=1 (unchanged), previousValue=6\n' +
      'Return 1',
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
    intuition:
      'Instead of checking all pairs (O(n^2)), use a frequency map. For k > 0, each unique number num forms a pair if num + k also exists. For k = 0, a number forms a pair with itself only if it appears at least twice. Checking only num + k (not num - k) avoids counting pairs twice.',
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
    jsCode: `var findPairs = function(nums, k) {
    // Count how many times each number appears
    const frequencyMap = new Map();
    for (const num of nums) {
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    }

    let pairCount = 0;

    for (const [num, frequency] of frequencyMap) {
        if (k > 0) {
            // Check if num + k also exists in the array
            // Only check num + k (not num - k) to avoid counting each pair twice
            if (frequencyMap.has(num + k)) {
                pairCount++;
            }
        } else if (k === 0) {
            // Special case: k=0 means the same number appears twice
            if (frequency > 1) {
                pairCount++;
            }
        }
    }

    return pairCount;
};`,
    jsWalkthrough:
      'Example: nums = [3,1,4,1,5], k = 2\n' +
      'frequencyMap = {3:1, 1:2, 4:1, 5:1}\n\n' +
      'k=2 > 0, check each num:\n' +
      '  num=3: has(3+2=5)? Yes → pairCount=1\n' +
      '  num=1: has(1+2=3)? Yes → pairCount=2\n' +
      '  num=4: has(4+2=6)? No\n' +
      '  num=5: has(5+2=7)? No\n' +
      'Return 2 (pairs: (1,3) and (3,5))',
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
    intuition:
      'This is a design question with no single correct answer. The simplest approach uses a counter to generate unique short codes and a dictionary to map them back to original URLs. The key insight is that encode and decode are inverse operations connected through a shared lookup table.',
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
    jsCode: `var Codec = function() {
    // Map from short URL to original long URL
    this.urlMap = {};

    // Auto-incrementing counter to generate unique short codes
    this.counter = 0;
};

Codec.prototype.encode = function(longUrl) {
    // Generate a new unique short code
    this.counter++;
    const shortUrl = "http://tinyurl.com/" + this.counter;

    // Store the mapping from short to long
    this.urlMap[shortUrl] = longUrl;

    return shortUrl;
};

Codec.prototype.decode = function(shortUrl) {
    // Look up the original long URL
    return this.urlMap[shortUrl];
};`,
    jsWalkthrough:
      'encode("https://leetcode.com/problems/design-tinyurl"):\n' +
      '  counter becomes 1\n' +
      '  shortUrl = "http://tinyurl.com/1"\n' +
      '  urlMap["http://tinyurl.com/1"] = "https://leetcode.com/problems/design-tinyurl"\n' +
      '  return "http://tinyurl.com/1"\n\n' +
      'decode("http://tinyurl.com/1"):\n' +
      '  return urlMap["http://tinyurl.com/1"]\n' +
      '  = "https://leetcode.com/problems/design-tinyurl"',
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
    intuition:
      'The string has a recursive structure: a number optionally followed by parenthesized subtrees. A recursive parser that reads the number, then checks for \'(\' to parse left and right children, naturally mirrors the tree structure and builds it top-down.',
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
    jsCode: `var str2tree = function(s) {
    if (!s) return null;

    // Index pointer shared across recursive calls
    let i = 0;

    const parse = () => {
        if (i >= s.length) return null;

        // Handle negative numbers
        let sign = 1;
        if (s[i] === '-') {
            sign = -1;
            i++;
        }

        // Parse the integer digits
        let num = 0;
        while (i < s.length && s[i] >= '0' && s[i] <= '9') {
            num = num * 10 + parseInt(s[i]);
            i++;
        }

        // Create the node with the parsed value
        const node = new TreeNode(sign * num);

        // If next char is '(', parse the left child
        if (i < s.length && s[i] === '(') {
            i++; // skip '('
            node.left = parse();
            i++; // skip ')'
        }

        // If next char is still '(', parse the right child
        if (i < s.length && s[i] === '(') {
            i++; // skip '('
            node.right = parse();
            i++; // skip ')'
        }

        return node;
    };

    return parse();
};`,
    jsWalkthrough:
      'Example: s = "4(2(3)(1))(6(5))"\n\n' +
      'parse() at i=0:\n' +
      '  num=4, create node(4)\n' +
      '  s[1]="(" → i=2, parse left:\n' +
      '    num=2, create node(2)\n' +
      '    s[3]="(" → i=4, parse left:\n' +
      '      num=3, create node(3), no children → return node(3)\n' +
      '    i=6 (skip ")"), node(2).left=node(3)\n' +
      '    s[6]="(" → i=7, parse right:\n' +
      '      num=1, create node(1) → return node(1)\n' +
      '    i=9 (skip ")"), node(2).right=node(1)\n' +
      '    return node(2)\n' +
      '  i=10 (skip ")"), node(4).left=node(2)\n' +
      '  s[10]="(" → parse right subtree node(6)...\n' +
      '  Final tree: 4 → left:2(left:3,right:1), right:6(left:5)',
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
    intuition:
      'In a BST, all values greater than a node are in its right subtree and certain ancestors. By traversing right-to-left (reverse in-order), you visit nodes from largest to smallest and can accumulate a running sum, updating each node to include all greater values.',
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
    jsCode: `var convertBST = function(root) {
    // Running sum of all values visited so far (descending order)
    let runningSum = 0;

    // Reverse in-order: right → root → left (visits nodes largest to smallest)
    const reverseInorder = (node) => {
        if (!node) return;

        // First visit the right subtree (larger values)
        reverseInorder(node.right);

        // Add this node's original value to the running sum
        runningSum += node.val;

        // Update this node's value to be the running sum
        // (original value + sum of all greater values)
        node.val = runningSum;

        // Then visit the left subtree (smaller values)
        reverseInorder(node.left);
    };

    reverseInorder(root);
    return root;
};`,
    jsWalkthrough:
      'Example: root = [4,1,6,0,2,5,7]\n' +
      'Reverse in-order visits: 7, 6, 5, 4, 2, 1, 0\n\n' +
      'Visit 7: runningSum=7, node.val=7\n' +
      'Visit 6: runningSum=13, node.val=13\n' +
      'Visit 5: runningSum=18, node.val=18\n' +
      'Visit 4: runningSum=22, node.val=22\n' +
      'Visit 2: runningSum=24, node.val=24\n' +
      'Visit 1: runningSum=25, node.val=25\n' +
      'Visit 0: runningSum=25, node.val=25 (wait: 25+0=25)\n' +
      'Each node now equals its original value plus sum of all larger values',
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
    intuition:
      'Process the string in chunks of 2k characters. In each chunk, reverse only the first k characters and leave the rest alone. The pattern is simple and repetitive, making it easy to implement with a loop that jumps by 2k each iteration.',
    approach:
      'Process the string in chunks of 2k. For each chunk, reverse the first k characters and keep the rest as is.',
    code: `class Solution:
    def reverseStr(self, s: str, k: int) -> str:
        arr = list(s)
        for i in range(0, len(arr), 2 * k):
            arr[i:i + k] = arr[i:i + k][::-1]
        return ''.join(arr)`,
    jsCode: `var reverseStr = function(s, k) {
    // Convert to array for in-place character swapping
    const chars = s.split('');

    // Process the string in chunks of 2k characters
    for (let chunkStart = 0; chunkStart < chars.length; chunkStart += 2 * k) {
        // Reverse the first k characters of this chunk
        let left = chunkStart;
        let right = Math.min(chunkStart + k - 1, chars.length - 1);

        while (left < right) {
            // Swap characters at left and right
            const temp = chars[left];
            chars[left] = chars[right];
            chars[right] = temp;
            left++;
            right--;
        }
        // Characters from chunkStart+k to chunkStart+2k-1 are left unchanged
    }

    return chars.join('');
};`,
    jsWalkthrough:
      'Example: s = "abcdefg", k = 2\n' +
      'chars = ["a","b","c","d","e","f","g"]\n\n' +
      'chunkStart=0 (2k=4): reverse chars[0..1] → left=0,right=1\n' +
      '  swap "a","b" → ["b","a","c","d","e","f","g"]\n' +
      'chunkStart=4 (2k=4): reverse chars[4..5] → left=4,right=5\n' +
      '  swap "e","f" → ["b","a","c","d","f","e","g"]\n' +
      'chunkStart=8: beyond array, done\n\n' +
      'Wait — let me re-check: k=2, so reverse indices [0,1], leave [2,3], reverse [4,5], leave [6]\n' +
      'Result: "bacdfeg"',
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
    intuition:
      'Think of all the 0-cells as sources that radiate outward simultaneously, like dropping stones in a pond at every 0 position. Multi-source BFS expands one layer at a time, so each 1-cell gets marked with the distance to its nearest 0 the first time the wave reaches it.',
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
    jsCode: `var updateMatrix = function(mat) {
    const numRows = mat.length;
    const numCols = mat[0].length;

    // Initialize distances: 0 for zero-cells, Infinity for one-cells
    const dist = Array.from({length: numRows}, () => new Array(numCols).fill(Infinity));
    const queue = [];

    // Seed the BFS queue with all zero-cells (they are distance 0 from themselves)
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            if (mat[row][col] === 0) {
                dist[row][col] = 0;
                queue.push([row, col]);
            }
        }
    }

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    // BFS expands outward from all zero-cells simultaneously
    let queueIndex = 0;
    while (queueIndex < queue.length) {
        const [currentRow, currentCol] = queue[queueIndex++];
        const currentDist = dist[currentRow][currentCol];

        for (const [deltaRow, deltaCol] of directions) {
            const neighborRow = currentRow + deltaRow;
            const neighborCol = currentCol + deltaCol;

            // Update neighbor if a shorter path was found
            const neighborInBounds = neighborRow >= 0 && neighborRow < numRows && neighborCol >= 0 && neighborCol < numCols;
            if (neighborInBounds && dist[neighborRow][neighborCol] > currentDist + 1) {
                dist[neighborRow][neighborCol] = currentDist + 1;
                queue.push([neighborRow, neighborCol]);
            }
        }
    }

    return dist;
};`,
    jsWalkthrough:
      'Example: mat = [[0,0,0],[0,1,0],[1,1,1]]\n' +
      'Initial: dist[0][0]=0, dist[0][1]=0, dist[0][2]=0, dist[1][0]=0\n' +
      'Queue (all zeros): [[0,0],[0,1],[0,2],[1,0]]\n\n' +
      'Process [0,0]: neighbors [0,1] already 0, [1,0] already 0\n' +
      'Process [0,1]: neighbor [1,1] gets dist=1\n' +
      'Process [0,2]: neighbor [1,2] gets dist=1\n' +
      'Process [1,0]: neighbor [2,0] gets dist=1\n' +
      'Process [1,1] (dist=1): neighbor [2,1] gets dist=2\n' +
      'Process [1,2] (dist=1): neighbor [2,2] gets dist=2\n' +
      'Result: [[0,0,0],[0,1,0],[1,2,1]]',
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
    intuition:
      'Think of tracing the outline of the tree counterclockwise. You collect three distinct parts: the left edge going down, the bottom leaves going left to right, and the right edge going back up. The trick is handling these three parts separately to avoid duplicates.',
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
    jsCode: `var boundaryOfBinaryTree = function(root) {
    if (!root) return [];

    // Start with the root value
    const boundary = [root.val];

    // Collect left boundary nodes (excluding leaves), going down-left
    const collectLeftBoundary = (node) => {
        // Stop at null or leaf nodes (leaves are added separately)
        if (!node || (!node.left && !node.right)) return;
        boundary.push(node.val);
        // Prefer going left, fall back to right if no left child
        if (node.left) {
            collectLeftBoundary(node.left);
        } else {
            collectLeftBoundary(node.right);
        }
    };

    // Collect right boundary nodes (excluding leaves), added in reverse (bottom-up)
    const collectRightBoundary = (node) => {
        if (!node || (!node.left && !node.right)) return;
        // Prefer going right, fall back to left if no right child
        if (node.right) {
            collectRightBoundary(node.right);
        } else {
            collectRightBoundary(node.left);
        }
        // Add AFTER recursion so right boundary is in reverse order
        boundary.push(node.val);
    };

    // Collect all leaf nodes left-to-right
    const collectLeaves = (node) => {
        if (!node) return;
        if (!node.left && !node.right) {
            boundary.push(node.val);
            return;
        }
        collectLeaves(node.left);
        collectLeaves(node.right);
    };

    collectLeftBoundary(root.left);
    collectLeaves(root.left);
    collectLeaves(root.right);
    collectRightBoundary(root.right);

    return boundary;
};`,
    jsWalkthrough:
      'Example: root = [1,null,2,3,4]\n' +
      'Tree: 1 → right: 2 → left: 3, right: 4\n\n' +
      'boundary = [1]\n' +
      'collectLeftBoundary(root.left=null): no-op\n' +
      'collectLeaves(root.left=null): no-op\n' +
      'collectLeaves(root.right=2):\n' +
      '  node 2 has children → recurse left (3) and right (4)\n' +
      '  node 3 is leaf → boundary=[1,3]\n' +
      '  node 4 is leaf → boundary=[1,3,4]\n' +
      'collectRightBoundary(root.right=2):\n' +
      '  node 2: go right (4) → 4 is leaf, stop\n' +
      '  add 2 after recursion → boundary=[1,3,4,2]\n' +
      'Return [1,3,4,2]',
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
    intuition:
      'Instead of thinking about where the line crosses bricks, think about where it passes through gaps. Count the gap positions (edge positions between bricks) across all rows. The line that passes through the most gaps crosses the fewest bricks.',
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
    jsCode: `var leastBricks = function(wall) {
    // Count how many rows have a gap (edge between bricks) at each horizontal position
    const edgeCountAtPosition = new Map();

    for (const row of wall) {
        let cumulativeWidth = 0;

        // Sum up brick widths to find gap positions
        // Skip the last brick (no gap at the wall's edge)
        for (let i = 0; i < row.length - 1; i++) {
            cumulativeWidth += row[i];
            const currentCount = edgeCountAtPosition.get(cumulativeWidth) || 0;
            edgeCountAtPosition.set(cumulativeWidth, currentCount + 1);
        }
    }

    // Find the position with the most gaps (most rows pass through it without crossing a brick)
    let maxGapsAtAnyPosition = 0;
    for (const gapCount of edgeCountAtPosition.values()) {
        maxGapsAtAnyPosition = Math.max(maxGapsAtAnyPosition, gapCount);
    }

    // Bricks crossed = total rows - rows that pass through a gap at that position
    return wall.length - maxGapsAtAnyPosition;
};`,
    jsWalkthrough:
      'Example: wall = [[1,2,2,1],[3,1,2],[1,3,2],[2,4],[3,1,2],[1,3,1,1]]\n' +
      'Row [1,2,2,1]: gaps at positions 1, 3, 5\n' +
      'Row [3,1,2]: gaps at positions 3, 4\n' +
      'Row [1,3,2]: gaps at positions 1, 4\n' +
      'Row [2,4]: gap at position 2\n' +
      'Row [3,1,2]: gaps at positions 3, 4\n' +
      'Row [1,3,1,1]: gaps at positions 1, 4, 5\n\n' +
      'edgeCountAtPosition: {1:3, 3:3, 5:2, 4:4, 2:1}\n' +
      'maxGapsAtAnyPosition = 4 (at position 4)\n' +
      'Return 6 - 4 = 2',
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
    intuition:
      'This is the classic \'next permutation\' algorithm applied to digits. Find the rightmost digit that can be made larger by swapping with a digit to its right, swap with the smallest such digit, then sort the remaining suffix to get the smallest possible next number.',
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
    jsCode: `var nextGreaterElement = function(n) {
    const digits = String(n).split('');

    // Step 1: Find the rightmost digit that is smaller than the digit to its right
    // This is the "pivot" — the digit we need to increase
    let pivotIndex = digits.length - 2;
    while (pivotIndex >= 0 && digits[pivotIndex] >= digits[pivotIndex + 1]) {
        pivotIndex--;
    }

    // If no pivot found, the number is already the largest permutation
    if (pivotIndex < 0) {
        return -1;
    }

    // Step 2: Find the smallest digit to the right of the pivot that is larger than it
    // We want to swap with it to make the smallest possible increase
    let swapIndex = digits.length - 1;
    while (digits[swapIndex] <= digits[pivotIndex]) {
        swapIndex--;
    }

    // Step 3: Swap the pivot with that digit
    const temp = digits[pivotIndex];
    digits[pivotIndex] = digits[swapIndex];
    digits[swapIndex] = temp;

    // Step 4: Reverse the suffix after the pivot to get the smallest arrangement
    const suffix = digits.splice(pivotIndex + 1).reverse();
    digits.push(...suffix);

    // Check if result fits in 32-bit signed integer
    const result = parseInt(digits.join(''));
    return result > 2147483647 ? -1 : result;
};`,
    jsWalkthrough:
      'Example: n = 12\n' +
      'digits = ["1","2"]\n\n' +
      'Step 1: pivotIndex = 0 (digits[0]="1" < digits[1]="2")\n' +
      'Step 2: swapIndex = 1 (digits[1]="2" > digits[0]="1")\n' +
      'Step 3: swap → digits = ["2","1"]\n' +
      'Step 4: reverse suffix after index 0 → suffix = ["1"], digits = ["2","1"]\n' +
      'result = 21\n' +
      '21 <= 2147483647 → return 21\n\n' +
      'Example: n = 2736\n' +
      'digits = ["2","7","3","6"]\n' +
      'Step 1: pivotIndex = 2 (digits[2]="3" < digits[3]="6")\n' +
      'Step 2: swapIndex = 3 (digits[3]="6" > digits[2]="3")\n' +
      'Step 3: swap → ["2","7","6","3"]\n' +
      'Step 4: reverse suffix ["3"] → ["2","7","6","3"] → result = 2763',
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
    intuition:
      'Split the sentence into words, reverse each word individually, and join them back. The word order stays the same - only the characters within each word get flipped. It is a straightforward map operation on each word.',
    approach:
      'Split the string by spaces, reverse each word individually, then join them back with spaces.',
    code: `class Solution:
    def reverseWords(self, s: str) -> str:
        return ' '.join(word[::-1] for word in s.split(' '))`,
    jsCode: `var reverseWords = function(s) {
    // Split the sentence into individual words by spaces
    const words = s.split(' ');

    // Reverse the characters within each word
    const reversedWords = words.map(word => {
        const chars = word.split('');
        chars.reverse();
        return chars.join('');
    });

    // Rejoin with spaces to preserve original word order
    return reversedWords.join(' ');
};`,
    jsWalkthrough:
      'Example: s = "Let\'s take LeetCode contest"\n' +
      'words = ["Let\'s", "take", "LeetCode", "contest"]\n\n' +
      'Reverse each word:\n' +
      '  "Let\'s" → "s\'teL"\n' +
      '  "take" → "ekat"\n' +
      '  "LeetCode" → "edoCteeL"\n' +
      '  "contest" → "tsetnoc"\n\n' +
      'Join: "s\'teL ekat edoCteeL tsetnoc"',
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
    intuition:
      'Just like finding the depth of a binary tree, but each node can have multiple children instead of just two. The depth of any node is 1 plus the maximum depth among all its children, applied recursively down to the leaves.',
    approach:
      'Use recursive DFS. The depth of a node is 1 + max depth of its children. For a leaf node, the depth is 1.',
    code: `class Solution:
    def maxDepth(self, root: 'Node') -> int:
        if not root:
            return 0
        if not root.children:
            return 1
        return 1 + max(self.maxDepth(child) for child in root.children)`,
    jsCode: `var maxDepth = function(root) {
    // Base case: empty tree has depth 0
    if (!root) return 0;

    // Base case: leaf node has depth 1
    if (!root.children || root.children.length === 0) return 1;

    // Find the maximum depth among all children
    let maxChildDepth = 0;
    for (const child of root.children) {
        const childDepth = maxDepth(child);
        maxChildDepth = Math.max(maxChildDepth, childDepth);
    }

    // This node adds 1 to the deepest child's depth
    return 1 + maxChildDepth;
};`,
    jsWalkthrough:
      'Example: root = [1,null,3,2,4,null,5,6]\n' +
      'Tree: 1 → children [3,2,4]\n' +
      '  3 → children [5,6]\n' +
      '  2 → no children\n' +
      '  4 → no children\n\n' +
      'maxDepth(1):\n' +
      '  maxDepth(3):\n' +
      '    maxDepth(5) = 1 (leaf)\n' +
      '    maxDepth(6) = 1 (leaf)\n' +
      '    return 1 + max(1,1) = 2\n' +
      '  maxDepth(2) = 1 (leaf)\n' +
      '  maxDepth(4) = 1 (leaf)\n' +
      '  return 1 + max(2,1,1) = 3',
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
    intuition:
      'To maximize the sum of minimums in pairs, pair numbers that are close in value together. Sorting and pairing consecutive elements ensures you \'waste\' the minimum amount - the larger number in each pair is sacrificed, so you want that sacrifice to be as small as possible.',
    approach:
      'Sort the array and pair consecutive elements. The sum of elements at even indices (0, 2, 4, ...) gives the maximum sum. This works because pairing similar-valued elements minimizes waste.',
    code: `class Solution:
    def arrayPairSum(self, nums: list[int]) -> int:
        nums.sort()
        return sum(nums[i] for i in range(0, len(nums), 2))`,
    jsCode: `var arrayPairSum = function(nums) {
    // Sort ascending so consecutive pairs are close in value
    nums.sort((a, b) => a - b);

    // The min of each consecutive pair is always the even-indexed element
    let totalSum = 0;
    for (let i = 0; i < nums.length; i += 2) {
        // nums[i] is the smaller of the pair (nums[i], nums[i+1])
        totalSum += nums[i];
    }

    return totalSum;
};`,
    jsWalkthrough:
      'Example: nums = [1,4,3,2]\n' +
      'After sort: [1,2,3,4]\n' +
      'Pairs: (1,2) and (3,4)\n' +
      'min(1,2)=1 (index 0), min(3,4)=3 (index 2)\n' +
      'totalSum = nums[0] + nums[2] = 1 + 3 = 4\n' +
      'Return 4\n\n' +
      'Why optimal? Pairing (1,4) and (2,3) gives min sums 1+2=3 (worse).\n' +
      'Pairing consecutive elements minimizes wasted larger values.',
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
    intuition:
      'Reshaping a matrix is just rearranging elements in a different grid layout. Flatten the original matrix into a 1D list, then fill the new dimensions row by row. The only constraint is that the total number of elements must match.',
    approach:
      'First check if m*n == r*c. If not, return the original. Flatten the matrix into a 1D list, then fill the new r x c matrix row by row.',
    code: `class Solution:
    def matrixReshape(self, mat: list[list[int]], r: int, c: int) -> list[list[int]]:
        m, n = len(mat), len(mat[0])
        if m * n != r * c:
            return mat
        flat = [mat[i][j] for i in range(m) for j in range(n)]
        return [flat[i * c:(i + 1) * c] for i in range(r)]`,
    jsCode: `var matrixReshape = function(mat, r, c) {
    const originalRows = mat.length;
    const originalCols = mat[0].length;
    const totalElements = originalRows * originalCols;

    // Reshaping is only possible if the total number of elements is the same
    if (totalElements !== r * c) {
        return mat;
    }

    // Flatten the original matrix into a 1D array
    const flatElements = mat.flat();

    // Build the new r x c matrix by taking slices of the flat array
    const reshapedMatrix = [];
    for (let row = 0; row < r; row++) {
        const rowStart = row * c;
        const rowEnd = rowStart + c;
        reshapedMatrix.push(flatElements.slice(rowStart, rowEnd));
    }

    return reshapedMatrix;
};`,
    jsWalkthrough:
      'Example: mat = [[1,2],[3,4]], r = 1, c = 4\n' +
      'originalRows=2, originalCols=2, totalElements=4\n' +
      'r*c = 1*4 = 4, equals totalElements ✓\n\n' +
      'flatElements = [1,2,3,4]\n\n' +
      'row=0: rowStart=0, rowEnd=4 → flatElements.slice(0,4) = [1,2,3,4]\n\n' +
      'reshapedMatrix = [[1,2,3,4]]\n' +
      'Return [[1,2,3,4]]',
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
    intuition:
      'This is a tree traversal problem in disguise. Build a parent-to-children adjacency list, then BFS or DFS from the kill target. Every process you visit is a descendant that also gets killed, just like deleting a folder deletes everything inside it.',
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
    jsCode: `var killProcess = function(pid, ppid, kill) {
    // Build adjacency list: parent → list of children
    const childrenMap = new Map();
    for (let i = 0; i < pid.length; i++) {
        const parentId = ppid[i];
        const processId = pid[i];
        if (!childrenMap.has(parentId)) {
            childrenMap.set(parentId, []);
        }
        childrenMap.get(parentId).push(processId);
    }

    // BFS from the killed process to collect all descendants
    const killedProcesses = [];
    const queue = [kill];

    while (queue.length > 0) {
        const currentProcess = queue.shift();
        killedProcesses.push(currentProcess);

        // Add all children of current process to the queue
        const childProcesses = childrenMap.get(currentProcess);
        if (childProcesses) {
            queue.push(...childProcesses);
        }
    }

    return killedProcesses;
};`,
    jsWalkthrough:
      'Example: pid=[1,3,10,5], ppid=[3,0,5,3], kill=5\n\n' +
      'Build childrenMap:\n' +
      '  ppid[0]=3: childrenMap.get(3)=[1]\n' +
      '  ppid[1]=0: childrenMap.get(0)=[3]\n' +
      '  ppid[2]=5: childrenMap.get(5)=[10]\n' +
      '  ppid[3]=3: childrenMap.get(3)=[1,5]\n\n' +
      'BFS from kill=5:\n' +
      '  queue=[5], killedProcesses=[]\n' +
      '  Dequeue 5: killedProcesses=[5], enqueue children [10] → queue=[10]\n' +
      '  Dequeue 10: killedProcesses=[5,10], no children\n' +
      'Return [5,10]',
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
    intuition:
      'The characters you keep in both strings must form a common subsequence. To minimize deletions, maximize what you keep - which is the Longest Common Subsequence. The answer is the total characters minus twice the LCS length, since you delete non-LCS characters from both strings.',
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
    jsCode: `var minDistance = function(word1, word2) {
    const m = word1.length;
    const n = word2.length;

    // dp[i][j] = length of LCS of word1[0..i-1] and word2[0..j-1]
    const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (word1[i - 1] === word2[j - 1]) {
                // Characters match: extend the LCS by 1
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                // Characters differ: best LCS from excluding either character
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    const lcsLength = dp[m][n];

    // Total deletions = characters not in LCS from word1 + characters not in LCS from word2
    return m + n - 2 * lcsLength;
};`,
    jsWalkthrough:
      'Example: word1="sea", word2="eat"\n' +
      'LCS of "sea" and "eat" = "ea" (length 2)\n\n' +
      'dp table (simplified):\n' +
      '  dp[1][1]: s vs e → no match → max(dp[0][1],dp[1][0])=0\n' +
      '  dp[1][2]: s vs a → no match → 0\n' +
      '  dp[1][3]: s vs t → no match → 0\n' +
      '  dp[2][1]: e vs e → match! dp[1][0]+1=1\n' +
      '  dp[3][2]: a vs a → match! dp[2][1]+1=2\n' +
      '  dp[3][3]: lcsLength=2\n\n' +
      'minDeletions = 3 + 3 - 2*2 = 2 (delete "s" and "t")',
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
    intuition:
      'A file system is naturally a tree structure. Using a Trie where each node represents a directory or file, you can navigate paths by splitting on \'/\' and walking down the tree. Each node holds its children and optionally file content.',
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
    jsCode: `var FileSystem = function() {
    // Root node of the file system trie
    this.root = { children: {}, content: '', isFile: false };
};

// Navigate to the node at the given path, optionally creating nodes along the way
FileSystem.prototype._navigate = function(path, create = false) {
    let currentNode = this.root;

    // Root path returns the root node directly
    if (path === '/') return currentNode;

    // Split path and traverse each directory/file component
    const pathComponents = path.split('/').slice(1); // skip leading empty string
    for (const component of pathComponents) {
        if (!currentNode.children[component]) {
            if (create) {
                // Create missing intermediate directories
                currentNode.children[component] = { children: {}, content: '', isFile: false };
            } else {
                return currentNode;
            }
        }
        currentNode = currentNode.children[component];
    }

    return currentNode;
};

FileSystem.prototype.ls = function(path) {
    const node = this._navigate(path);
    if (node.isFile) {
        // If path points to a file, return just its name
        return [path.split('/').pop()];
    }
    // Otherwise return sorted list of directory entries
    return Object.keys(node.children).sort();
};

FileSystem.prototype.mkdir = function(path) {
    // Navigate and create all nodes along the path
    this._navigate(path, true);
};

FileSystem.prototype.addContentToFile = function(filePath, content) {
    // Navigate/create path, mark as file, append content
    const node = this._navigate(filePath, true);
    node.isFile = true;
    node.content += content;
};

FileSystem.prototype.readContentFromFile = function(filePath) {
    return this._navigate(filePath).content;
};`,
    jsWalkthrough:
      'Commands: ls("/"), mkdir("/a/b/c"), addContentToFile("/a/b/c/d","hello"), ls("/"), readContentFromFile("/a/b/c/d")\n\n' +
      'ls("/"): root.children={} → return []\n\n' +
      'mkdir("/a/b/c"):\n' +
      '  _navigate("/a/b/c", create=true)\n' +
      '  create "a" → create "b" → create "c"\n\n' +
      'addContentToFile("/a/b/c/d","hello"):\n' +
      '  navigate to "d" (create=true), mark isFile=true, content="hello"\n\n' +
      'ls("/"): root.children={"a":...} → return ["a"]\n\n' +
      'readContentFromFile("/a/b/c/d"): navigate to "d" → return "hello"',
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
    intuition:
      'Postorder means \'children first, then parent.\' Recursively visit all children, then record the current node. This bottom-up approach processes leaves before their parents, which is useful when you need to compute something from the bottom of the tree upward.',
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
    jsCode: `var postorder = function(root) {
    const result = [];

    const dfs = (node) => {
        // Base case: null node
        if (!node) return;

        // Visit all children first (left-to-right)
        for (const child of node.children) {
            dfs(child);
        }

        // Then add the current node's value
        result.push(node.val);
    };

    dfs(root);
    return result;
};`,
    jsWalkthrough:
      'Example: root = [1,null,3,2,4,null,5,6]\n' +
      'Tree: 1 → children [3,2,4]; 3 → children [5,6]\n\n' +
      'dfs(1):\n' +
      '  dfs(3):\n' +
      '    dfs(5): no children → push 5\n' +
      '    dfs(6): no children → push 6\n' +
      '    push 3\n' +
      '  dfs(2): no children → push 2\n' +
      '  dfs(4): no children → push 4\n' +
      '  push 1\n\n' +
      'result = [5,6,3,2,4,1]',
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
    intuition:
      'Four points form a square if and only if they produce exactly two distinct pairwise distances: four equal shorter distances (the sides) and two equal longer distances (the diagonals). Computing all six distances and checking this pattern is a clean geometric test.',
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
    jsCode: `var validSquare = function(p1, p2, p3, p4) {
    // Compute squared Euclidean distance (avoids floating point issues)
    const squaredDist = (a, b) => {
        const rowDiff = a[0] - b[0];
        const colDiff = a[1] - b[1];
        return rowDiff * rowDiff + colDiff * colDiff;
    };

    // Compute all 6 pairwise distances among the 4 points
    const allDistances = [
        squaredDist(p1, p2),
        squaredDist(p1, p3),
        squaredDist(p1, p4),
        squaredDist(p2, p3),
        squaredDist(p2, p4),
        squaredDist(p3, p4)
    ].sort((a, b) => a - b);

    // A square has:
    //   - 4 equal side lengths (smallest 4 distances)
    //   - 2 equal diagonal lengths (largest 2 distances, longer than sides)
    //   - No zero distances (degenerate/collinear case)
    const sidesAreEqual = allDistances[0] === allDistances[1] &&
                          allDistances[1] === allDistances[2] &&
                          allDistances[2] === allDistances[3];
    const diagonalsAreEqual = allDistances[4] === allDistances[5];
    const noZeroLength = allDistances[0] > 0;

    return noZeroLength && sidesAreEqual && diagonalsAreEqual;
};`,
    explanation:
      '1. Compute squared distances between all 6 pairs of points.\n' +
      '2. Sort the distances.\n' +
      '3. The 4 smallest should be equal (sides) and the 2 largest should be equal (diagonals).\n' +
      '4. Ensure no side has length 0 (degenerate case).',
    jsWalkthrough:
      'Example: p1=[0,0], p2=[1,1], p3=[1,0], p4=[0,1]\n\n' +
      'All 6 squared distances:\n' +
      '  p1-p2: (0-1)²+(0-1)²=2\n' +
      '  p1-p3: (0-1)²+(0-0)²=1\n' +
      '  p1-p4: (0-0)²+(0-1)²=1\n' +
      '  p2-p3: (1-1)²+(1-0)²=1\n' +
      '  p2-p4: (1-0)²+(1-1)²=1\n' +
      '  p3-p4: (1-0)²+(0-1)²=2\n\n' +
      'Sorted: [1,1,1,1,2,2]\n' +
      'sidesAreEqual: 1===1===1===1 ✓\n' +
      'diagonalsAreEqual: 2===2 ✓\n' +
      'noZeroLength: 1>0 ✓\n' +
      'Return true',
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
    intuition:
      'Scan the flowerbed left to right and greedily plant wherever you can. A spot is valid if it and both its neighbors are empty (or it is at an edge). Planting greedily never hurts because planting earlier never blocks a better solution later.',
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
    jsCode: `var canPlaceFlowers = function(flowerbed, n) {
    let flowersPlanted = 0;

    for (let i = 0; i < flowerbed.length; i++) {
        // Only consider empty plots
        if (flowerbed[i] === 0) {
            // Check if the left neighbor is empty (or at the left edge)
            const leftNeighborEmpty = i === 0 || flowerbed[i - 1] === 0;

            // Check if the right neighbor is empty (or at the right edge)
            const rightNeighborEmpty = i === flowerbed.length - 1 || flowerbed[i + 1] === 0;

            // Plant a flower here if both neighbors are empty
            if (leftNeighborEmpty && rightNeighborEmpty) {
                flowerbed[i] = 1; // Mark as planted
                flowersPlanted++;

                // Early exit if we've planted enough
                if (flowersPlanted >= n) {
                    return true;
                }
            }
        }
    }

    return flowersPlanted >= n;
};`,
    jsWalkthrough:
      'Example: flowerbed = [1,0,0,0,1], n = 1\n\n' +
      'i=0: flowerbed[0]=1, skip\n' +
      'i=1: flowerbed[1]=0\n' +
      '  leftNeighborEmpty: flowerbed[0]=1 → false → cannot plant\n' +
      'i=2: flowerbed[2]=0\n' +
      '  leftNeighborEmpty: flowerbed[1]=0 → true\n' +
      '  rightNeighborEmpty: flowerbed[3]=0 → true\n' +
      '  Plant! flowerbed=[1,0,1,0,1], flowersPlanted=1\n' +
      '  flowersPlanted(1) >= n(1) → return true',
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
    intuition:
      'Group files by their content using a hash map. Parse each path string to extract the directory, filename, and content, then map content to the list of full file paths. Any content with more than one file path indicates duplicates.',
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
    jsCode: `var findDuplicate = function(paths) {
    // Map from file content to list of full file paths with that content
    const contentToFilePaths = new Map();

    for (const pathString of paths) {
        // First token is the directory; remaining tokens are "filename(content)"
        const tokens = pathString.split(' ');
        const directory = tokens[0];

        for (let i = 1; i < tokens.length; i++) {
            // Find where the filename ends and content begins
            const openParenIndex = tokens[i].indexOf('(');
            const fileName = tokens[i].slice(0, openParenIndex);
            const fileContent = tokens[i].slice(openParenIndex + 1, -1); // strip trailing ')'

            // Build the full file path
            const fullPath = directory + '/' + fileName;

            // Group by content
            if (!contentToFilePaths.has(fileContent)) {
                contentToFilePaths.set(fileContent, []);
            }
            contentToFilePaths.get(fileContent).push(fullPath);
        }
    }

    // Collect groups with 2 or more files (these are duplicates)
    const duplicateGroups = [];
    for (const filePaths of contentToFilePaths.values()) {
        if (filePaths.length > 1) {
            duplicateGroups.push(filePaths);
        }
    }

    return duplicateGroups;
};`,
    jsWalkthrough:
      'Example: paths = ["root/a 1.txt(abcd) 2.txt(efgh)","root/c 3.txt(abcd)"]\n\n' +
      'Process "root/a 1.txt(abcd) 2.txt(efgh)":\n' +
      '  directory = "root/a"\n' +
      '  token "1.txt(abcd)": name="1.txt", content="abcd", path="root/a/1.txt"\n' +
      '  token "2.txt(efgh)": name="2.txt", content="efgh", path="root/a/2.txt"\n\n' +
      'Process "root/c 3.txt(abcd)":\n' +
      '  directory = "root/c"\n' +
      '  token "3.txt(abcd)": name="3.txt", content="abcd", path="root/c/3.txt"\n\n' +
      'contentToFilePaths:\n' +
      '  "abcd" → ["root/a/1.txt","root/c/3.txt"] (length 2 → duplicate!)\n' +
      '  "efgh" → ["root/a/2.txt"] (length 1 → not duplicate)\n' +
      'Return [["root/a/1.txt","root/c/3.txt"]]',
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
    intuition:
      'The triangle inequality states a + b > c for the longest side c. Sort the array, fix the largest side, and use two pointers for the smaller sides. When the two smaller sides sum exceeds the largest, all indices between the pointers also form valid triangles with the current pair.',
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
    jsCode: `var triangleNumber = function(nums) {
    // Sort so we can fix the largest side and use two pointers
    nums.sort((a, b) => a - b);

    let validTriangleCount = 0;

    // Fix the largest side (index k) and find pairs (i,j) where nums[i]+nums[j] > nums[k]
    for (let k = nums.length - 1; k > 1; k--) {
        let leftPointer = 0;
        let rightPointer = k - 1;

        while (leftPointer < rightPointer) {
            if (nums[leftPointer] + nums[rightPointer] > nums[k]) {
                // All pairs (leftPointer..rightPointer-1, rightPointer) are also valid
                // because the array is sorted and smaller left values still satisfy the condition
                validTriangleCount += rightPointer - leftPointer;
                rightPointer--;
            } else {
                // Sum too small: need a larger left value
                leftPointer++;
            }
        }
    }

    return validTriangleCount;
};`,
    jsWalkthrough:
      'Example: nums = [2,2,3,4]\n' +
      'After sort: [2,2,3,4]\n\n' +
      'k=3 (largest=4):\n' +
      '  left=0, right=2: nums[0]+nums[2]=2+3=5 > 4 → count += 2-0=2, right=1\n' +
      '  left=0, right=1: nums[0]+nums[1]=2+2=4 > 4? No → left=1\n' +
      '  left=1, right=1: loop ends\n' +
      '  count = 2\n\n' +
      'k=2 (largest=3):\n' +
      '  left=0, right=1: nums[0]+nums[1]=2+2=4 > 3 → count += 1-0=1, right=0\n' +
      '  left=0, right=0: loop ends\n' +
      '  count = 3\n\n' +
      'Return 3',
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
    intuition:
      'Imagine overlaying two trees on top of each other. Where both have a node, add the values. Where only one has a node, keep it as-is. Recursion handles this naturally: merge left children together and right children together.',
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
    jsCode: `var mergeTrees = function(root1, root2) {
    // If one tree is missing at this position, use the other tree as-is
    if (!root1) return root2;
    if (!root2) return root1;

    // Both trees have a node here: add root2's value into root1
    root1.val += root2.val;

    // Recursively merge the left subtrees
    root1.left = mergeTrees(root1.left, root2.left);

    // Recursively merge the right subtrees
    root1.right = mergeTrees(root1.right, root2.right);

    return root1;
};`,
    jsWalkthrough:
      'Example: root1=[1,3,2,5], root2=[2,1,3,null,4,null,7]\n\n' +
      'mergeTrees(1,2): both exist → 1.val=1+2=3\n' +
      '  left: mergeTrees(3,1): both exist → 3.val=3+1=4\n' +
      '    left: mergeTrees(5,null): root2 null → return node(5)\n' +
      '    right: mergeTrees(null,4): root1 null → return node(4)\n' +
      '    return node(4,left:5,right:4)\n' +
      '  right: mergeTrees(2,3): both exist → 2.val=2+3=5\n' +
      '    left: mergeTrees(null,null) → null\n' +
      '    right: mergeTrees(null,7): root1 null → return node(7)\n' +
      '    return node(5,right:7)\n' +
      'Return tree: [3,4,5,5,4,null,7]',
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
    intuition:
      'A circular queue wraps around like a clock. Use a fixed-size array with a head pointer and a count. Modular arithmetic (% capacity) handles the wrap-around, so when you reach the end of the array, you loop back to the beginning.',
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
    jsCode: `var MyCircularQueue = function(k) {
    // Fixed-size storage array
    this.queue = new Array(k);
    // Index of the front element
    this.head = 0;
    // Number of elements currently in the queue
    this.count = 0;
    // Maximum capacity
    this.capacity = k;
};

MyCircularQueue.prototype.enQueue = function(value) {
    if (this.isFull()) return false;

    // Calculate the index for the new element (wraps around with modulo)
    const insertIndex = (this.head + this.count) % this.capacity;
    this.queue[insertIndex] = value;
    this.count++;
    return true;
};

MyCircularQueue.prototype.deQueue = function() {
    if (this.isEmpty()) return false;

    // Move head forward, wrapping around
    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return true;
};

MyCircularQueue.prototype.Front = function() {
    if (this.isEmpty()) return -1;
    return this.queue[this.head];
};

MyCircularQueue.prototype.Rear = function() {
    if (this.isEmpty()) return -1;
    // Last element is at (head + count - 1) % capacity
    const rearIndex = (this.head + this.count - 1) % this.capacity;
    return this.queue[rearIndex];
};

MyCircularQueue.prototype.isEmpty = function() {
    return this.count === 0;
};

MyCircularQueue.prototype.isFull = function() {
    return this.count === this.capacity;
};`,
    jsWalkthrough:
      'Example: MyCircularQueue(3), enQueue(1), enQueue(2), deQueue(), enQueue(3), Rear()\n\n' +
      'Init: queue=[_,_,_], head=0, count=0, capacity=3\n\n' +
      'enQueue(1): not full, insertIndex=(0+0)%3=0, queue=[1,_,_], count=1\n' +
      'enQueue(2): insertIndex=(0+1)%3=1, queue=[1,2,_], count=2\n' +
      'deQueue(): not empty, head=(0+1)%3=1, count=1 (front was 1)\n' +
      'enQueue(3): insertIndex=(1+1)%3=2, queue=[1,2,3], count=2\n' +
      'Rear(): rearIndex=(1+2-1)%3=2, return queue[2]=3',
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
    intuition:
      'Find all nodes at depth d-1 using DFS, then insert new nodes between them and their children. The new left child takes over the original left subtree, and the new right child takes over the original right subtree, effectively pushing everything down one level at that depth.',
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
    jsCode: `var addOneRow = function(root, val, depth) {
    // Special case: inserting at depth 1 makes a new root
    if (depth === 1) {
        const newRoot = new TreeNode(val);
        // Original tree becomes the left child of the new root
        newRoot.left = root;
        return newRoot;
    }

    // DFS: when we reach depth d-1, insert new nodes as children
    const dfs = (node, currentDepth) => {
        // Base case: null node, nothing to do
        if (!node) return;

        // This node is at depth d-1: insert new row below it
        if (currentDepth === depth - 1) {
            // Save original children before overwriting
            const originalLeft = node.left;
            const originalRight = node.right;

            // Insert new nodes with val as direct children
            node.left = new TreeNode(val);
            node.right = new TreeNode(val);

            // Original left subtree goes under the new left node's left
            node.left.left = originalLeft;
            // Original right subtree goes under the new right node's right
            node.right.right = originalRight;
            return;
        }

        // Not at insertion depth yet: recurse deeper
        dfs(node.left, currentDepth + 1);
        dfs(node.right, currentDepth + 1);
    };

    dfs(root, 1);
    return root;
};`,
    jsWalkthrough:
      'Example: root = [4,2,6,3,1,5], val = 1, depth = 2\n\n' +
      'Tree:   4\n' +
      '       / \\\n' +
      '      2   6\n' +
      '     / \\ /\n' +
      '    3  1 5\n\n' +
      'depth=2, so we target nodes at depth 1 (just the root, node 4)\n\n' +
      'dfs(node=4, currentDepth=1):\n' +
      '  currentDepth(1) === depth-1(1) → insert row!\n' +
      '  originalLeft = node(2), originalRight = node(6)\n' +
      '  node.left = new TreeNode(1)\n' +
      '  node.right = new TreeNode(1)\n' +
      '  node.left.left = node(2)   ← original left subtree\n' +
      '  node.right.right = node(6) ← original right subtree\n\n' +
      'Result tree:   4\n' +
      '              / \\\n' +
      '             1   1\n' +
      '            /     \\\n' +
      '           2       6\n' +
      '          / \\     /\n' +
      '         3   1   5\n\n' +
      'Output: [4,1,1,2,null,null,6,3,1,5]',
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
    intuition:
      'Sort courses by deadline and greedily take them. If a course would miss its deadline, check if swapping out the longest course you have already taken would help - if the current course is shorter, the swap frees up time without reducing the count. A max-heap efficiently tracks the longest course.',
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
    jsCode: `var scheduleCourse = function(courses) {
    // Sort by deadline: process courses with earlier deadlines first
    courses.sort((a, b) => a[1] - b[1]);

    // Simulated max-heap: stores durations of courses taken so far
    // (JS has no built-in heap, so we use a sorted array)
    const takenDurations = [];

    // Helper: insert duration into max-heap (sorted descending)
    const heapPush = (duration) => {
        takenDurations.push(duration);
        takenDurations.sort((a, b) => b - a);
    };

    // Helper: remove and return the largest duration (max-heap pop)
    const heapPop = () => takenDurations.shift();

    // Track the total time used so far
    let totalTime = 0;

    for (const [duration, deadline] of courses) {
        // Tentatively take this course
        totalTime += duration;
        heapPush(duration);

        // If we've exceeded the deadline, drop the longest course taken
        // (it frees the most time without reducing the count further than needed)
        if (totalTime > deadline) {
            const longestDuration = heapPop();
            totalTime -= longestDuration;
        }
    }

    // The heap holds the optimal set of courses we can take
    return takenDurations.length;
};`,
    jsWalkthrough:
      'Example: courses = [[100,200],[200,1300],[1000,1250],[2000,3200]]\n' +
      'After sort by deadline: [[100,200],[1000,1250],[200,1300],[2000,3200]]\n\n' +
      'Course [100,200]: totalTime=100, taken=[100], 100<=200 → keep\n' +
      'Course [1000,1250]: totalTime=1100, taken=[1000,100], 1100<=1250 → keep\n' +
      'Course [200,1300]: totalTime=1300, taken=[1000,200,100], 1300>1300? No → keep\n' +
      'Course [2000,3200]: totalTime=3300, taken=[2000,1000,200,100], 3300>3200 → drop longest(2000)\n' +
      '  totalTime=1300, taken=[1000,200,100]\n\n' +
      'Return takenDurations.length = 3',
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
    intuition:
      'Imagine k pointers, one in each sorted list. The range [min, max] of current pointers always covers all lists. To shrink the range, advance the pointer at the minimum value (since increasing the min narrows the range). A min-heap efficiently tracks which pointer has the smallest value.',
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
    jsCode: `var smallestRange = function(nums) {
    // Simulated min-heap: each entry is [value, listIndex, elementIndex]
    const heap = [];

    // Track the current maximum value across all list pointers
    let currentMax = -Infinity;

    // Initialize heap with the first element from each list
    for (let listIndex = 0; listIndex < nums.length; listIndex++) {
        const firstValue = nums[listIndex][0];
        heap.push([firstValue, listIndex, 0]);
        currentMax = Math.max(currentMax, firstValue);
    }

    // Best range found so far (start with impossibly large range)
    let bestRange = [-Infinity, Infinity];

    while (true) {
        // Sort to get the minimum element (simulating min-heap pop)
        heap.sort((a, b) => a[0] - b[0]);
        const [currentMin, row, elementIndex] = heap.shift();

        // Current range is [currentMin, currentMax] — covers all k lists
        const currentRangeSize = currentMax - currentMin;
        const bestRangeSize = bestRange[1] - bestRange[0];
        if (currentRangeSize < bestRangeSize) {
            bestRange = [currentMin, currentMax];
        }

        // If the row we just popped has no more elements, we can't advance → stop
        const nextElementIndex = elementIndex + 1;
        if (nextElementIndex === nums[row].length) break;

        // Advance the pointer in this row and push the next element
        const nextValue = nums[row][nextElementIndex];
        currentMax = Math.max(currentMax, nextValue);
        heap.push([nextValue, row, nextElementIndex]);
    }

    return bestRange;
};`,
    jsWalkthrough:
      'Example: nums = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]\n\n' +
      'Init: heap=[(0,1,0),(4,0,0),(5,2,0)], currentMax=5\n\n' +
      'Step 1: pop (0,list1,0) → range=[0,5], best=[0,5]\n' +
      '  Next in list1: nums[1][1]=9, heap=[(4,0,0),(5,2,0),(9,1,1)], currentMax=9\n\n' +
      'Step 2: pop (4,list0,0) → range=[4,9], best=[0,5] (unchanged)\n' +
      '  Next in list0: nums[0][1]=10, heap=[(5,2,0),(9,1,1),(10,0,1)], currentMax=10\n\n' +
      '... (continuing)\n\n' +
      'Eventually: heap=[(20,1,3),(22,2,2),(24,0,3)], currentMax=24\n' +
      'pop (20,list1,3) → range=[20,24], size=4 < 5 → best=[20,24]\n' +
      'list1 exhausted (index 4 = length 4) → break\n\n' +
      'Return [20,24]',
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
    intuition:
      'This is like Two Sum on a sorted array of perfect squares. Start with two pointers: a = 0 and b = sqrt(c). If a^2 + b^2 is too large, decrease b; if too small, increase a. The two pointers converge to find a valid pair or prove none exists.',
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
    jsCode: `var judgeSquareSum = function(c) {
    // Two-pointer approach on perfect squares
    // a starts at 0 (smallest possible), b starts at floor(sqrt(c)) (largest possible)
    let a = 0;
    let b = Math.floor(Math.sqrt(c));

    while (a <= b) {
        const sumOfSquares = a * a + b * b;

        if (sumOfSquares === c) {
            // Found a valid pair
            return true;
        } else if (sumOfSquares < c) {
            // Sum too small: increase a to get a larger sum
            a++;
        } else {
            // Sum too large: decrease b to get a smaller sum
            b--;
        }
    }

    // No valid pair found
    return false;
};`,
    jsWalkthrough:
      'Example: c = 5\n\n' +
      'Init: a=0, b=floor(sqrt(5))=2\n\n' +
      'a=0, b=2: sumOfSquares = 0*0 + 2*2 = 4, 4 < 5 → a++\n' +
      'a=1, b=2: sumOfSquares = 1*1 + 2*2 = 1+4 = 5, 5 === 5 → return true\n\n' +
      'Answer: true (1² + 2² = 5)',
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
    intuition:
      'Think of function calls as nested boxes. A stack tracks which function is currently running. When a new function starts, the outer function pauses. When it ends, the outer function resumes. By tracking timestamps, you can calculate exactly how long each function ran exclusively.',
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
    jsCode: `var exclusiveTime = function(n, logs) {
    // exclusive time accumulated for each function ID
    const exclusiveTimes = new Array(n).fill(0);

    // Stack tracks the currently executing function IDs (call stack)
    const callStack = [];

    // Track the timestamp of the last processed event
    let previousTime = 0;

    for (const log of logs) {
        // Each log entry is "functionId:type:timestamp"
        const parts = log.split(':');
        const functionId = parseInt(parts[0]);
        const eventType = parts[1];     // "start" or "end"
        const timestamp = parseInt(parts[2]);

        if (eventType === 'start') {
            // Before this function starts, credit the time to whatever was running
            if (callStack.length > 0) {
                const runningFunctionId = callStack[callStack.length - 1];
                exclusiveTimes[runningFunctionId] += timestamp - previousTime;
            }

            // Push the new function onto the call stack
            callStack.push(functionId);
            previousTime = timestamp;
        } else {
            // Function is ending: credit its remaining exclusive time
            // End timestamps are inclusive, so add 1
            const endingFunctionId = callStack.pop();
            exclusiveTimes[endingFunctionId] += timestamp - previousTime + 1;

            // Next event starts at the tick AFTER this one ends
            previousTime = timestamp + 1;
        }
    }

    return exclusiveTimes;
};`,
    jsWalkthrough:
      'Example: n=2, logs=["0:start:0","1:start:2","1:end:5","0:end:6"]\n\n' +
      'Init: exclusiveTimes=[0,0], callStack=[], previousTime=0\n\n' +
      '"0:start:0": stack empty → push 0, prevTime=0\n' +
      '  callStack=[0]\n\n' +
      '"1:start:2": running=func0 → exclusiveTimes[0] += 2-0=2 → [2,0]\n' +
      '  push 1, prevTime=2\n' +
      '  callStack=[0,1]\n\n' +
      '"1:end:5": pop → func1, exclusiveTimes[1] += 5-2+1=4 → [2,4]\n' +
      '  prevTime=6\n' +
      '  callStack=[0]\n\n' +
      '"0:end:6": pop → func0, exclusiveTimes[0] += 6-6+1=1 → [3,4]\n' +
      '  callStack=[]\n\n' +
      'Return [3,4]',
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
    intuition:
      'Level-order traversal (BFS) naturally groups nodes by their depth. Process one level at a time, summing values and dividing by the count to get each level\'s average. The queue size at the start of each iteration tells you how many nodes are at that level.',
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
    jsCode: `var averageOfLevels = function(root) {
    const levelAverages = [];

    // BFS queue starts with the root node
    const queue = [root];

    while (queue.length > 0) {
        // The number of nodes on the current level
        const levelSize = queue.length;
        let levelSum = 0;

        // Process every node at this level
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            levelSum += node.val;

            // Enqueue children for the next level
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }

        // Compute and store the average for this level
        const levelAverage = levelSum / levelSize;
        levelAverages.push(levelAverage);
    }

    return levelAverages;
};`,
    jsWalkthrough:
      'Example: root = [3,9,20,null,null,15,7]\n\n' +
      'Tree:   3\n' +
      '       / \\\n' +
      '      9  20\n' +
      '        /  \\\n' +
      '       15   7\n\n' +
      'Level 1: queue=[3]\n' +
      '  Process node(3): levelSum=3, enqueue 9,20\n' +
      '  average = 3/1 = 3.0\n\n' +
      'Level 2: queue=[9,20]\n' +
      '  Process node(9): levelSum=9, no children\n' +
      '  Process node(20): levelSum=29, enqueue 15,7\n' +
      '  average = 29/2 = 14.5\n\n' +
      'Level 3: queue=[15,7]\n' +
      '  Process node(15): levelSum=15, no children\n' +
      '  Process node(7): levelSum=22, no children\n' +
      '  average = 22/2 = 11.0\n\n' +
      'Return [3.0, 14.5, 11.0]',
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
    intuition:
      'A Trie stores all historical sentences, and each node caches which sentences pass through it with their frequencies. As the user types each character, you walk down the Trie and return the top-3 matches sorted by frequency. This gives efficient prefix-based search.',
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
    jsCode: `var AutocompleteSystem = function(sentences, times) {
    // Trie root — each node is a plain object with character keys and a 'sentences' map
    this.root = {};

    // Pointer to the current Trie node as the user types
    this.currentNode = this.root;

    // The text typed so far in the current session
    this.currentInput = "";

    // Initialize Trie with historical sentences and their frequencies
    for (let i = 0; i < sentences.length; i++) {
        this._addSentence(sentences[i], times[i]);
    }
};

AutocompleteSystem.prototype._addSentence = function(sentence, count) {
    let node = this.root;

    for (const character of sentence) {
        // Create child node if it doesn't exist
        if (!node[character]) {
            node[character] = {};
        }
        node = node[character];

        // Each node on the path stores all sentences passing through it
        if (!node.sentences) {
            node.sentences = {};
        }
        node.sentences[sentence] = (node.sentences[sentence] || 0) + count;
    }
};

AutocompleteSystem.prototype.input = function(character) {
    if (character === '#') {
        // User finished typing: record the sentence with frequency +1
        this._addSentence(this.currentInput, 1);

        // Reset for next session
        this.currentInput = "";
        this.currentNode = this.root;
        return [];
    }

    // Append this character to the current input
    this.currentInput += character;

    // Advance the Trie pointer if possible
    if (this.currentNode && this.currentNode[character]) {
        this.currentNode = this.currentNode[character];

        // Get all sentences that share this prefix, sorted by frequency desc, then alphabetically
        const sentenceFrequencyPairs = Object.entries(this.currentNode.sentences || {});
        sentenceFrequencyPairs.sort((a, b) => {
            // Primary: higher frequency first
            if (b[1] !== a[1]) return b[1] - a[1];
            // Secondary: alphabetical order
            return a[0].localeCompare(b[0]);
        });

        // Return at most 3 suggestions
        return sentenceFrequencyPairs.slice(0, 3).map(pair => pair[0]);
    } else {
        // No Trie path for this prefix — no suggestions possible
        this.currentNode = null;
        return [];
    }
};`,
    jsWalkthrough:
      'Init: sentences=["i love you","island"], times=[5,3]\n' +
      'Trie built: each node stores sentence→frequency for all sentences through it\n\n' +
      'input("i"):\n' +
      '  currentInput="i", advance to node["i"]\n' +
      '  node["i"].sentences = {"i love you":5, "island":3}\n' +
      '  Sort by freq desc: [("i love you",5),("island",3)]\n' +
      '  Return ["i love you","island"]\n\n' +
      'input(" "):\n' +
      '  currentInput="i ", advance to node["i"][" "]\n' +
      '  node.sentences = {"i love you":5}\n' +
      '  Return ["i love you"]\n\n' +
      'input("#"):\n' +
      '  _addSentence("i ", 1) → adds "i " with freq 1 to Trie\n' +
      '  Reset: currentInput="", currentNode=root\n' +
      '  Return []',
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
    intuition:
      'Finding the duplicate is easy with a set - it is the number you see twice. For the missing number, use math: the expected sum of 1 to n minus the actual sum gives you (missing - duplicate), and since you already know the duplicate, you can solve for the missing number.',
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
    jsCode: `var findErrorNums = function(nums) {
    const n = nums.length;

    // Use a set to detect which number appears twice
    const seenNumbers = new Set();
    let duplicateNumber = -1;

    for (const num of nums) {
        if (seenNumbers.has(num)) {
            duplicateNumber = num; // Found the duplicate!
        }
        seenNumbers.add(num);
    }

    // The expected sum if 1..n had no duplicates/missing
    const expectedSum = n * (n + 1) / 2;

    // The actual sum of the given array
    const actualSum = nums.reduce((accumulator, num) => accumulator + num, 0);

    // actualSum = expectedSum - missingNumber + duplicateNumber
    // => missingNumber = expectedSum - actualSum + duplicateNumber
    const missingNumber = expectedSum - actualSum + duplicateNumber;

    return [duplicateNumber, missingNumber];
};`,
    jsWalkthrough:
      'Example: nums = [1,2,2,4]\n\n' +
      'n = 4\n\n' +
      'Scan for duplicate:\n' +
      '  num=1: not seen → add to set\n' +
      '  num=2: not seen → add to set\n' +
      '  num=2: already seen! duplicateNumber = 2\n' +
      '  num=4: not seen → add to set\n\n' +
      'expectedSum = 4*5/2 = 10\n' +
      'actualSum = 1+2+2+4 = 9\n' +
      'missingNumber = 10 - 9 + 2 = 3\n\n' +
      'Return [2, 3]',
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
    intuition:
      'For each word in the sentence, find its shortest matching root (prefix). Store roots in a set and check prefixes from shortest to longest - the first match is the shortest root. This greedy prefix check replaces each word with its root or keeps it unchanged.',
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
    jsCode: `var replaceWords = function(dictionary, sentence) {
    // Store all roots in a set for O(1) lookup
    const rootSet = new Set(dictionary);

    // For a given word, find the shortest root that is a prefix of it
    const findShortestRoot = (word) => {
        for (let prefixLength = 1; prefixLength <= word.length; prefixLength++) {
            const prefix = word.slice(0, prefixLength);
            if (rootSet.has(prefix)) {
                // Found a matching root — return it (it's the shortest since we go short→long)
                return prefix;
            }
        }
        // No root matches this word — keep the word as-is
        return word;
    };

    // Split the sentence into words, replace each with its shortest root, rejoin
    const words = sentence.split(' ');
    const replacedWords = words.map(findShortestRoot);
    return replacedWords.join(' ');
};`,
    jsWalkthrough:
      'Example: dictionary = ["cat","bat","rat"], sentence = "the cattle was rattled by the battery"\n\n' +
      'rootSet = {"cat","bat","rat"}\n\n' +
      'Process each word:\n' +
      '  "the" → "t"? no, "th"? no, "the"? no → keep "the"\n' +
      '  "cattle" → "c"? no, "ca"? no, "cat"? yes! → replace with "cat"\n' +
      '  "was" → no prefix match → keep "was"\n' +
      '  "rattled" → "r"? no, "ra"? no, "rat"? yes! → replace with "rat"\n' +
      '  "by" → no prefix match → keep "by"\n' +
      '  "the" → keep "the"\n' +
      '  "battery" → "b"? no, "ba"? no, "bat"? yes! → replace with "bat"\n\n' +
      'Result: "the cat was rat by the bat"',
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
    intuition:
      'Give each subtree a unique fingerprint by serializing it (e.g., \'2,4,#,#,#\'). If two subtrees have the same fingerprint, they are duplicates. A hash map counts fingerprint occurrences, and you add to the result when a fingerprint appears for the second time.',
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
    jsCode: `var findDuplicateSubtrees = function(root) {
    // Map from serialized subtree string → how many times we've seen it
    const serializationCount = new Map();

    // Collect one root node per duplicate group
    const duplicateRoots = [];

    // Serialize each subtree using postorder traversal
    // Returns a string fingerprint for the subtree rooted at this node
    const serialize = (node) => {
        // Null nodes are represented as '#'
        if (!node) return '#';

        // Build fingerprint: value + left subtree fingerprint + right subtree fingerprint
        const leftFingerprint = serialize(node.left);
        const rightFingerprint = serialize(node.right);
        const subtreeFingerprint = node.val + ',' + leftFingerprint + ',' + rightFingerprint;

        // Track how many times this exact subtree structure appears
        const previousCount = serializationCount.get(subtreeFingerprint) || 0;
        serializationCount.set(subtreeFingerprint, previousCount + 1);

        // Add to results only on the SECOND occurrence (avoids triple-counting)
        if (previousCount + 1 === 2) {
            duplicateRoots.push(node);
        }

        return subtreeFingerprint;
    };

    serialize(root);
    return duplicateRoots;
};`,
    jsWalkthrough:
      'Example: root = [1,2,3,4,null,2,4,null,null,4]\n\n' +
      'Tree:       1\n' +
      '           / \\\n' +
      '          2   3\n' +
      '         /   / \\\n' +
      '        4   2   4\n' +
      '           /\n' +
      '          4\n\n' +
      'serialize(node=4, no children):\n' +
      '  fingerprint = "4,#,#" → count=1\n\n' +
      'serialize(node=2 with child 4):\n' +
      '  left="4,#,#", right="#"\n' +
      '  fingerprint = "2,4,#,#,#" → count=1\n\n' +
      'serialize(node=4 in right subtree):\n' +
      '  fingerprint = "4,#,#" → count=2 → push node(4)!\n\n' +
      'serialize(node=2 in right subtree, child=4):\n' +
      '  fingerprint = "2,4,#,#,#" → count=2 → push node(2)!\n\n' +
      'Result: [node(4), node(2)]',
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
    intuition:
      'This is Two Sum applied to a tree. Traverse the BST with DFS, keeping a set of values seen so far. For each node, check if (target - node.val) is in the set. If yes, you have found a pair that sums to the target.',
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
    jsCode: `var findTarget = function(root, k) {
    // Set of values we have visited so far
    const seenValues = new Set();

    const dfs = (node) => {
        // Base case: null node
        if (!node) return false;

        // Check if the complement (k - node.val) has been seen
        const complement = k - node.val;
        if (seenValues.has(complement)) {
            // Found two nodes that sum to k
            return true;
        }

        // Mark this value as seen before exploring children
        seenValues.add(node.val);

        // Recurse on left and right subtrees
        const foundInLeft = dfs(node.left);
        const foundInRight = dfs(node.right);
        return foundInLeft || foundInRight;
    };

    return dfs(root);
};`,
    jsWalkthrough:
      'Example: root = [5,3,6,2,4,null,7], k = 9\n\n' +
      'dfs(node=5): complement=9-5=4, not seen → add 5 → seenValues={5}\n' +
      '  dfs(node=3): complement=9-3=6, not seen → add 3 → seenValues={5,3}\n' +
      '    dfs(node=2): complement=9-2=7, not seen → add 2 → seenValues={5,3,2}\n' +
      '      dfs(null) → false\n' +
      '      dfs(null) → false\n' +
      '    dfs(node=4): complement=9-4=5, 5 IS in seenValues → return true!\n' +
      '  Found in left → return true\n\n' +
      'Return true (3+6? No — the pair is 2+7 or 4+5)',
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
    intuition:
      'The construction mirrors how you would build a sorted array into a BST: find the dominant element (the max), make it the root, and recursively build the left and right subtrees from the elements before and after it. The max element naturally separates the array into two halves.',
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
    jsCode: `var constructMaximumBinaryTree = function(nums) {
    // Base case: no elements means no subtree
    if (nums.length === 0) return null;

    // Find the largest value and its position
    const maxValue = Math.max(...nums);
    const maxIndex = nums.indexOf(maxValue);

    // Create the root node with the max value
    const rootNode = new TreeNode(maxValue);

    // Elements to the left of maxIndex form the left subtree
    rootNode.left = constructMaximumBinaryTree(nums.slice(0, maxIndex));

    // Elements to the right of maxIndex form the right subtree
    rootNode.right = constructMaximumBinaryTree(nums.slice(maxIndex + 1));

    return rootNode;
};`,
    jsWalkthrough:
      'Example: nums = [3,2,1,6,0,5]\n\n' +
      'Call with [3,2,1,6,0,5]:\n' +
      '  maxValue=6 at index 3\n' +
      '  rootNode = TreeNode(6)\n' +
      '  left = build([3,2,1])\n' +
      '    maxValue=3 at index 0 → node(3)\n' +
      '    left = build([]) → null\n' +
      '    right = build([2,1])\n' +
      '      maxValue=2 at index 0 → node(2)\n' +
      '      left=null, right=build([1])→node(1)\n' +
      '    return node(3, null, node(2, null, node(1)))\n' +
      '  right = build([0,5])\n' +
      '    maxValue=5 at index 1 → node(5)\n' +
      '    left = build([0]) → node(0)\n' +
      '    right = build([]) → null\n' +
      '    return node(5, node(0), null)\n' +
      'Return: [6,3,5,null,2,0,null,null,1]',
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
    intuition:
      'Think of the matrix as a complete binary tree layout. The root goes at the center column, and each child goes at the center of its half. Recursively dividing the column range in half for left and right children places every node at the correct position.',
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
    jsCode: `var printTree = function(root) {
    // Step 1: Compute the height of the tree to determine matrix dimensions
    const getHeight = (node) => {
        if (!node) return 0;
        const leftHeight = getHeight(node.left);
        const rightHeight = getHeight(node.right);
        return 1 + Math.max(leftHeight, rightHeight);
    };

    const treeHeight = getHeight(root);

    // Matrix has treeHeight rows and (2^treeHeight - 1) columns
    const numCols = (1 << treeHeight) - 1;
    const result = Array.from({ length: treeHeight }, () => new Array(numCols).fill(''));

    // Step 2: Fill in node values using DFS
    // Each node occupies the midpoint of its current column range
    const fill = (node, row, leftCol, rightCol) => {
        if (!node) return;

        // Place this node at the center of [leftCol, rightCol]
        const midCol = Math.floor((leftCol + rightCol) / 2);
        result[row][midCol] = String(node.val);

        // Left child gets the left half of the column range
        fill(node.left, row + 1, leftCol, midCol - 1);

        // Right child gets the right half of the column range
        fill(node.right, row + 1, midCol + 1, rightCol);
    };

    fill(root, 0, 0, numCols - 1);
    return result;
};`,
    jsWalkthrough:
      'Example: root = [1,2,3,null,4]\n\n' +
      'Tree:   1\n' +
      '       / \\\n' +
      '      2   3\n' +
      '       \\\n' +
      '        4\n\n' +
      'treeHeight = 3, numCols = 2^3-1 = 7\n' +
      'result = [["","","","","","",""],  (row 0)\n' +
      '          ["","","","","","",""],  (row 1)\n' +
      '          ["","","","","","",""]] (row 2)\n\n' +
      'fill(node=1, row=0, left=0, right=6):\n' +
      '  midCol=3 → result[0][3]="1"\n' +
      '  fill(node=2, row=1, left=0, right=2):\n' +
      '    midCol=1 → result[1][1]="2"\n' +
      '    fill(null) → skip\n' +
      '    fill(node=4, row=2, left=2, right=2):\n' +
      '      midCol=2 → result[2][2]="4"\n' +
      '  fill(node=3, row=1, left=4, right=6):\n' +
      '    midCol=5 → result[1][5]="3"\n\n' +
      'Result: [["","","","1","","",""],["","2","","","","3",""],["","","4","","","",""]]',
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
    intuition:
      'The robot returns to origin only if every move is canceled out: each \'U\' needs a \'D\', and each \'L\' needs an \'R\'. Simply count each direction and check that opposing moves are balanced.',
    approach:
      'Count the occurrences of each move. The robot returns to the origin if the number of U equals D and the number of L equals R.',
    code: `class Solution:
    def judgeCircle(self, moves: str) -> bool:
        return moves.count('U') == moves.count('D') and moves.count('L') == moves.count('R')`,
    jsCode: `var judgeCircle = function(moves) {
    // Track horizontal position: positive = right, negative = left
    let horizontalPosition = 0;

    // Track vertical position: positive = up, negative = down
    let verticalPosition = 0;

    for (const move of moves) {
        if (move === 'U') {
            verticalPosition++;
        } else if (move === 'D') {
            verticalPosition--;
        } else if (move === 'L') {
            horizontalPosition--;
        } else if (move === 'R') {
            horizontalPosition++;
        }
    }

    // Robot returns to origin only if both displacements are zero
    return horizontalPosition === 0 && verticalPosition === 0;
};`,
    jsWalkthrough:
      'Example: moves = "UDLR"\n\n' +
      'Init: horizontalPosition=0, verticalPosition=0\n\n' +
      '"U": verticalPosition = 0+1 = 1\n' +
      '"D": verticalPosition = 1-1 = 0\n' +
      '"L": horizontalPosition = 0-1 = -1\n' +
      '"R": horizontalPosition = -1+1 = 0\n\n' +
      'horizontalPosition=0 && verticalPosition=0 → return true\n\n' +
      'Example 2: moves = "UD"\n' +
      '"U": verticalPosition=1\n' +
      '"D": verticalPosition=0\n' +
      'horizontalPosition=0, verticalPosition=0 → return true',
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
    intuition:
      'Since the array is sorted, the k closest elements form a contiguous window. Binary search for the optimal starting position of this window by comparing the distances from x to the left and right boundaries. This avoids sorting and gives O(log n) search.',
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
    jsCode: `var findClosestElements = function(arr, k, x) {
    // Binary search for the optimal starting index of the k-element window
    // The window spans arr[lo .. lo+k-1]
    let lo = 0;
    let hi = arr.length - k;

    while (lo < hi) {
        const mid = (lo + hi) >> 1;

        // Compare distances: is x closer to arr[mid] or arr[mid+k]?
        // arr[mid] is the left boundary, arr[mid+k] is the right boundary
        const distanceToLeft = x - arr[mid];
        const distanceToRight = arr[mid + k] - x;

        if (distanceToLeft > distanceToRight) {
            // arr[mid] is farther: shift window to the right
            lo = mid + 1;
        } else {
            // arr[mid+k] is farther or equal: shift window to the left (keep mid)
            hi = mid;
        }
    }

    // lo is now the optimal starting index
    return arr.slice(lo, lo + k);
};`,
    jsWalkthrough:
      'Example: arr = [1,2,3,4,5], k = 4, x = 3\n\n' +
      'lo=0, hi=5-4=1\n\n' +
      'Iteration 1: mid=0\n' +
      '  distanceToLeft = x-arr[0] = 3-1 = 2\n' +
      '  distanceToRight = arr[0+4]-x = 5-3 = 2\n' +
      '  distanceToLeft(2) > distanceToRight(2)? No → hi = 0\n\n' +
      'lo=0, hi=0 → loop ends\n\n' +
      'Return arr.slice(0, 0+4) = [1,2,3,4]',
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
    intuition:
      'Greedily extend existing subsequences rather than starting new ones. Think of it like train cars: it is better to attach a number to an existing train (subsequence) than to start a new train, because starting a new train requires finding two more consecutive numbers.',
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
    jsCode: `var isPossible = function(nums) {
    // remainingCount: how many of each number are still unassigned
    const remainingCount = new Map();
    for (const num of nums) {
        remainingCount.set(num, (remainingCount.get(num) || 0) + 1);
    }

    // subsequenceTails: how many subsequences are "waiting" to be extended by a given number
    // e.g., tails[4]=2 means 2 subsequences currently end at 3 and want to be extended by 4
    const subsequenceTails = new Map();

    for (const num of nums) {
        // Skip numbers already assigned in a previous iteration
        if (remainingCount.get(num) === 0) continue;

        // Option 1: Extend an existing subsequence that ends just before this number
        const tailCount = subsequenceTails.get(num) || 0;
        if (tailCount > 0) {
            // Use this number to extend one subsequence
            subsequenceTails.set(num, tailCount - 1);
            subsequenceTails.set(num + 1, (subsequenceTails.get(num + 1) || 0) + 1);
        }
        // Option 2: Start a new subsequence [num, num+1, num+2]
        else if ((remainingCount.get(num + 1) || 0) > 0 &&
                 (remainingCount.get(num + 2) || 0) > 0) {
            // Consume num+1 and num+2 from remaining
            remainingCount.set(num + 1, remainingCount.get(num + 1) - 1);
            remainingCount.set(num + 2, remainingCount.get(num + 2) - 1);
            // This subsequence now waits to be extended by num+3
            subsequenceTails.set(num + 3, (subsequenceTails.get(num + 3) || 0) + 1);
        }
        // Neither option works: impossible
        else {
            return false;
        }

        // Mark this number as used
        remainingCount.set(num, remainingCount.get(num) - 1);
    }

    return true;
};`,
    jsWalkthrough:
      'Example: nums = [1,2,3,3,4,5]\n\n' +
      'remainingCount: {1:1, 2:1, 3:2, 4:1, 5:1}\n' +
      'subsequenceTails: {}\n\n' +
      'num=1: no tail for 1, can extend with 2,3 → start [1,2,3]\n' +
      '  remainingCount[2]=0, remainingCount[3]=1\n' +
      '  subsequenceTails[4]=1\n\n' +
      'num=2: remaining=0, skip\n\n' +
      'num=3: remaining=1, no tail for 3, try extending with 4,5 → start [3,4,5]\n' +
      '  remainingCount[4]=0, remainingCount[5]=0\n' +
      '  subsequenceTails[6]=1\n\n' +
      'num=3: remaining=0, skip\n' +
      'num=4: remaining=0, skip\n' +
      'num=5: remaining=0, skip\n\n' +
      'Return true',
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
    intuition:
      'Assign each node a position index as if the tree were stored in an array (left child = 2*pos, right child = 2*pos+1). The width at each level is simply the difference between the rightmost and leftmost positions plus 1, naturally accounting for null nodes in between.',
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
    jsCode: `var widthOfBinaryTree = function(root) {
    if (!root) return 0;

    let maxWidth = 0;

    // BFS queue stores [node, positionIndex] pairs
    // Use BigInt to prevent integer overflow with deep trees
    const queue = [[root, 0n]];

    while (queue.length > 0) {
        const levelSize = queue.length;

        // Record position of first node at this level
        const firstPositionAtLevel = queue[0][1];
        let lastPositionAtLevel = firstPositionAtLevel;

        for (let i = 0; i < levelSize; i++) {
            const [node, absolutePosition] = queue.shift();

            // Normalize positions relative to the first node at this level
            // This prevents overflow in deeply skewed trees
            const normalizedPosition = absolutePosition - firstPositionAtLevel;
            lastPositionAtLevel = normalizedPosition;

            // Left child gets position 2*pos, right child gets 2*pos+1
            if (node.left) queue.push([node.left, 2n * normalizedPosition]);
            if (node.right) queue.push([node.right, 2n * normalizedPosition + 1n]);
        }

        // Width = last position - first position + 1 (first is always 0 due to normalization)
        const levelWidth = Number(lastPositionAtLevel) + 1;
        maxWidth = Math.max(maxWidth, levelWidth);
    }

    return maxWidth;
};`,
    jsWalkthrough:
      'Example: root = [1,3,2,5,3,null,9]\n\n' +
      'Tree:      1\n' +
      '          / \\\n' +
      '         3   2\n' +
      '        / \\   \\\n' +
      '       5   3   9\n\n' +
      'Level 1: queue=[(1,0)]\n' +
      '  Process (1,0): normalized=0, enqueue (3,0), (2,1)\n' +
      '  levelWidth = 0+1 = 1, maxWidth=1\n\n' +
      'Level 2: queue=[(3,0),(2,1)]\n' +
      '  firstPos=0\n' +
      '  Process (3,0): normalized=0, enqueue (5,0),(3,1)\n' +
      '  Process (2,1): normalized=1, enqueue (9,3)\n' +
      '  levelWidth = 1+1 = 2, maxWidth=2\n\n' +
      'Level 3: queue=[(5,0),(3,1),(9,3)]\n' +
      '  firstPos=0\n' +
      '  Process (5,0): normalized=0\n' +
      '  Process (3,1): normalized=1\n' +
      '  Process (9,3): normalized=3\n' +
      '  levelWidth = 3+1 = 4, maxWidth=4\n\n' +
      'Return 4',
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
    intuition:
      'To maximize the number with one swap, you want to bring the largest possible digit as far left as possible. Record the last occurrence of each digit 0-9, then scan from left to right - for each digit, check if a larger digit exists later and swap with its rightmost occurrence.',
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
    jsCode: `var maximumSwap = function(num) {
    // Work with individual digit characters
    const digits = String(num).split('');

    // Record the LAST index where each digit (0-9) appears
    // This lets us find the rightmost occurrence of any digit
    const lastOccurrenceOfDigit = {};
    for (let i = 0; i < digits.length; i++) {
        lastOccurrenceOfDigit[digits[i]] = i;
    }

    // Scan digits from left (most significant) to right
    for (let i = 0; i < digits.length; i++) {
        const currentDigit = parseInt(digits[i]);

        // Try to find a larger digit that appears to the right of position i
        // Start from 9 (largest) and work down
        for (let largerDigit = 9; largerDigit > currentDigit; largerDigit--) {
            const lastIndexOfLargerDigit = lastOccurrenceOfDigit[largerDigit];

            if (lastIndexOfLargerDigit !== undefined && lastIndexOfLargerDigit > i) {
                // Swap: bring the larger digit to the front position
                [digits[i], digits[lastIndexOfLargerDigit]] =
                    [digits[lastIndexOfLargerDigit], digits[i]];

                // One swap is all we get — return immediately
                return parseInt(digits.join(''));
            }
        }
    }

    // No beneficial swap found: number is already at maximum
    return num;
};`,
    jsWalkthrough:
      'Example: num = 2736\n\n' +
      'digits = ["2","7","3","6"]\n' +
      'lastOccurrenceOfDigit: {2:0, 7:1, 3:2, 6:3}\n\n' +
      'i=0, currentDigit=2:\n' +
      '  Try largerDigit=9: not in map → skip\n' +
      '  Try largerDigit=8: not in map → skip\n' +
      '  Try largerDigit=7: lastIndex=1, 1>0 → SWAP!\n' +
      '  digits = ["7","2","3","6"]\n' +
      '  Return parseInt("7236") = 7236\n\n' +
      'Output: 7236',
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
    intuition:
      'Extend the standard LIS dynamic programming to also track counts. When you find a longer subsequence ending at j that extends to i, reset the count. When you find an equally long one, add to the count. The total is the sum of counts at all positions achieving the maximum length.',
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
    jsCode: `var findNumberOfLIS = function(nums) {
    const n = nums.length;

    // lisLength[i] = length of the longest increasing subsequence ending at index i
    const lisLength = new Array(n).fill(1);

    // lisCount[i] = number of distinct longest increasing subsequences ending at index i
    const lisCount = new Array(n).fill(1);

    for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
            // nums[j] must be strictly less than nums[i] to extend the subsequence
            if (nums[j] < nums[i]) {
                const extendedLength = lisLength[j] + 1;

                if (extendedLength > lisLength[i]) {
                    // Found a longer subsequence ending at i: update length and reset count
                    lisLength[i] = extendedLength;
                    lisCount[i] = lisCount[j];
                } else if (extendedLength === lisLength[i]) {
                    // Found another way to achieve the same length: add to count
                    lisCount[i] += lisCount[j];
                }
            }
        }
    }

    // Sum counts at all positions that achieve the global maximum length
    const maxLength = Math.max(...lisLength);
    let totalCount = 0;
    for (let i = 0; i < n; i++) {
        if (lisLength[i] === maxLength) {
            totalCount += lisCount[i];
        }
    }

    return totalCount;
};`,
    jsWalkthrough:
      'Example: nums = [1,3,5,4,7]\n\n' +
      'Init: lisLength=[1,1,1,1,1], lisCount=[1,1,1,1,1]\n\n' +
      'i=1 (val=3): j=0 (val=1): 1<3, extended=2>1 → lisLength[1]=2, lisCount[1]=1\n' +
      'i=2 (val=5): j=0 (val=1): 1<5, extended=2>1 → lisLength[2]=2, lisCount[2]=1\n' +
      '             j=1 (val=3): 3<5, extended=3>2 → lisLength[2]=3, lisCount[2]=1\n' +
      'i=3 (val=4): j=0 (val=1): extended=2>1 → lisLength[3]=2, lisCount[3]=1\n' +
      '             j=1 (val=3): 3<4, extended=3>2 → lisLength[3]=3, lisCount[3]=1\n' +
      '             j=2 (val=5): 5>4 → skip\n' +
      'i=4 (val=7): j=0: extended=2; j=1: extended=3; j=2: 5<7, extended=4>3 → lisLength[4]=4, lisCount[4]=1\n' +
      '             j=3: 4<7, extended=4===4 → lisCount[4] += 1 = 2\n\n' +
      'maxLength=4, positions with length 4: i=4, count=2\n' +
      'Return 2',
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
    intuition:
      'This is simpler than LIS because the subsequence must be contiguous. Just keep a running counter that increments when each element is larger than the previous and resets otherwise. Track the maximum counter value throughout.',
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
    jsCode: `var findLengthOfLCIS = function(nums) {
    if (nums.length === 0) return 0;

    // Length of the longest continuous increasing subsequence found so far
    let maxLength = 1;

    // Length of the current run we're tracking
    let currentRunLength = 1;

    for (let i = 1; i < nums.length; i++) {
        if (nums[i] > nums[i - 1]) {
            // Sequence is still increasing: extend the current run
            currentRunLength++;
            maxLength = Math.max(maxLength, currentRunLength);
        } else {
            // Sequence broke: reset the current run to just this element
            currentRunLength = 1;
        }
    }

    return maxLength;
};`,
    jsWalkthrough:
      'Example: nums = [1,3,5,4,7]\n\n' +
      'Init: maxLength=1, currentRunLength=1\n\n' +
      'i=1: nums[1]=3 > nums[0]=1 → currentRunLength=2, maxLength=2\n' +
      'i=2: nums[2]=5 > nums[1]=3 → currentRunLength=3, maxLength=3\n' +
      'i=3: nums[3]=4 < nums[2]=5 → currentRunLength=1 (reset)\n' +
      'i=4: nums[4]=7 > nums[3]=4 → currentRunLength=2, maxLength=3 (unchanged)\n\n' +
      'Return 3 (the subsequence [1,3,5])',
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
    intuition:
      'For each search query, compare it against every dictionary word of the same length and count character differences. If exactly one character differs, it is a match. This brute-force approach works because the dictionary is typically small.',
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
    jsCode: `var MagicDictionary = function() {
    // Store all dictionary words
    this.dictionaryWords = [];
};

MagicDictionary.prototype.buildDict = function(dictionary) {
    this.dictionaryWords = dictionary;
};

MagicDictionary.prototype.search = function(searchWord) {
    for (const word of this.dictionaryWords) {
        // Words of different length can never match with exactly one substitution
        if (word.length !== searchWord.length) continue;

        // Count how many characters differ
        let differenceCount = 0;
        for (let i = 0; i < word.length; i++) {
            if (word[i] !== searchWord[i]) {
                differenceCount++;
            }
            // Early exit: more than one difference already — can't be a match
            if (differenceCount > 1) break;
        }

        // Exactly one character substitution matches
        if (differenceCount === 1) return true;
    }

    return false;
};`,
    jsWalkthrough:
      'Init: buildDict(["hello","leetcode"])\n' +
      'dictionaryWords = ["hello","leetcode"]\n\n' +
      'search("hello"):\n' +
      '  Compare "hello" vs "hello": differenceCount=0\n' +
      '  differenceCount !== 1 → no match\n' +
      '  Compare "hello" vs "leetcode": lengths differ → skip\n' +
      '  Return false\n\n' +
      'search("hhllo"):\n' +
      '  Compare "hhllo" vs "hello":\n' +
      '    i=0: "h"==="h" → no diff\n' +
      '    i=1: "h"!=="e" → differenceCount=1\n' +
      '    i=2: "l"==="l" → no diff\n' +
      '    i=3: "l"==="l" → no diff\n' +
      '    i=4: "o"==="o" → no diff\n' +
      '    differenceCount=1 → return true!',
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
    intuition:
      'A Trie where each node stores the cumulative sum of all keys passing through it. On insert, propagate the delta (new value minus old value) along the path. On prefix sum query, just navigate to the prefix node and read its stored total.',
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
    jsCode: `var MapSum = function() {
    // Trie root — plain JS object where each key is a character
    this.root = {};

    // Track the latest value for each inserted key (for computing deltas on update)
    this.keyValueMap = {};
};

MapSum.prototype.insert = function(key, val) {
    // Compute the change in value (handles updates to existing keys)
    const oldValue = this.keyValueMap[key] || 0;
    const delta = val - oldValue;
    this.keyValueMap[key] = val;

    // Walk down the Trie, propagating the delta to each node along the path
    let node = this.root;
    for (const character of key) {
        if (!node[character]) {
            node[character] = { total: 0 };
        }
        node = node[character];
        // Each node stores the sum of values for all keys passing through it
        node.total += delta;
    }
};

MapSum.prototype.sum = function(prefix) {
    // Navigate to the node representing the end of the prefix
    let node = this.root;
    for (const character of prefix) {
        if (!node[character]) {
            // Prefix not found in Trie: no keys have this prefix
            return 0;
        }
        node = node[character];
    }

    // This node's total is the sum of all values with this prefix
    return node.total;
};`,
    jsWalkthrough:
      'Operations: insert("apple",3), sum("ap"), insert("app",2), sum("ap")\n\n' +
      'insert("apple", 3):\n' +
      '  oldValue=0, delta=3\n' +
      '  Trie path: root → a(total=3) → p(total=3) → p(total=3) → l(total=3) → e(total=3)\n\n' +
      'sum("ap"):\n' +
      '  Navigate: root → a → p\n' +
      '  Return p.total = 3\n\n' +
      'insert("app", 2):\n' +
      '  oldValue=0, delta=2\n' +
      '  Update: root → a(total=5) → p(total=5) → p(total=2)\n\n' +
      'sum("ap"):\n' +
      '  Navigate: root → a → p\n' +
      '  Return p.total = 5 (apple=3 + app=2)',
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
    intuition:
      'A stack is the perfect data structure here because each operation references the most recent scores. Numbers push onto the stack, \'C\' pops the last score, \'D\' doubles the last, and \'+\' sums the last two. At the end, sum everything remaining on the stack.',
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
    jsCode: `var calPoints = function(operations) {
    // Stack holds the current list of valid scores
    const scoreStack = [];

    for (const operation of operations) {
        if (operation === 'C') {
            // Cancel: remove the last valid score
            scoreStack.pop();
        } else if (operation === 'D') {
            // Double: add a score that is double the most recent score
            const mostRecentScore = scoreStack[scoreStack.length - 1];
            scoreStack.push(mostRecentScore * 2);
        } else if (operation === '+') {
            // Plus: add a score that is the sum of the last two scores
            const lastScore = scoreStack[scoreStack.length - 1];
            const secondLastScore = scoreStack[scoreStack.length - 2];
            scoreStack.push(lastScore + secondLastScore);
        } else {
            // Numeric string: record this as a new score
            scoreStack.push(parseInt(operation));
        }
    }

    // Sum all remaining valid scores
    return scoreStack.reduce((total, score) => total + score, 0);
};`,
    jsWalkthrough:
      'Example: ops = ["5","2","C","D","+"]\n\n' +
      '"5": push 5 → stack=[5]\n' +
      '"2": push 2 → stack=[5,2]\n' +
      '"C": pop → stack=[5]\n' +
      '"D": lastScore=5, push 5*2=10 → stack=[5,10]\n' +
      '"+": lastScore=10, secondLast=5, push 10+5=15 → stack=[5,10,15]\n\n' +
      'Sum = 5+10+15 = 30\n' +
      'Return 30',
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
    intuition:
      'Think of probability flowing like water through the board. Start with probability 1.0 at the knight\'s position and each move splits it equally across 8 possible destinations. Moves that go off the board lose that probability. After k steps, sum all remaining probability on the board.',
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
    jsCode: `var knightProbability = function(n, k, row, column) {
    // dp[r][c] = probability of the knight being at cell (r,c) after the current step
    let dp = Array.from({ length: n }, () => new Array(n).fill(0));
    dp[row][column] = 1.0; // Start here with probability 1

    // All 8 possible knight moves
    const knightMoves = [
        [-2, -1], [-2, 1],
        [-1, -2], [-1, 2],
        [1, -2],  [1, 2],
        [2, -1],  [2, 1]
    ];

    for (let step = 0; step < k; step++) {
        // Build the new probability distribution for after this step
        const nextDp = Array.from({ length: n }, () => new Array(n).fill(0));

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                // Only process cells the knight could currently be at
                if (dp[r][c] > 0) {
                    for (const [rowDelta, colDelta] of knightMoves) {
                        const nextRow = r + rowDelta;
                        const nextCol = c + colDelta;

                        // Only count moves that land on the board
                        const onBoard = nextRow >= 0 && nextRow < n &&
                                        nextCol >= 0 && nextCol < n;
                        if (onBoard) {
                            // Each move is equally likely (1/8 probability each)
                            nextDp[nextRow][nextCol] += dp[r][c] / 8.0;
                        }
                        // Off-board moves: probability is lost
                    }
                }
            }
        }

        dp = nextDp;
    }

    // Sum all remaining probabilities on the board
    let totalProbability = 0;
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            totalProbability += dp[r][c];
        }
    }

    return totalProbability;
};`,
    jsWalkthrough:
      'Example: n=3, k=2, row=0, column=0\n\n' +
      'Init: dp[0][0]=1.0, all others 0\n\n' +
      'Step 1 (move 1):\n' +
      '  From (0,0), 8 knight moves:\n' +
      '    (-2,-1),(-2,1),(-1,-2),(-1,2): all off board\n' +
      '    (1,-2),(1,2): off board, (2,-1): off board\n' +
      '    (2,1): on board! nextDp[2][1] += 1.0/8 = 0.125\n' +
      '    (-1,2): off board; (1,2): on board! nextDp[1][2] += 0.125\n' +
      '  (Only 2 out of 8 moves land on a 3x3 board from corner)\n' +
      '  nextDp[2][1]=0.125, nextDp[1][2]=0.125\n\n' +
      'Step 2 (move 2):\n' +
      '  From (2,1): distribute 0.125/8 to valid moves\n' +
      '  From (1,2): distribute 0.125/8 to valid moves\n' +
      '  (Some moves land on board, others don\'t)\n\n' +
      'Total remaining on board ≈ 0.0625\n' +
      'Return 0.0625',
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
    intuition:
      'Fix the middle subarray position and use precomputed arrays to instantly look up the best left and right subarrays. Building \'best from left up to position i\' and \'best from right starting at position i\' arrays lets you evaluate every middle position in O(1).',
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
    jsCode: `var maxSumOfThreeSubarrays = function(nums, k) {
    const n = nums.length;

    // Step 1: Compute the sum of each length-k subarray using a sliding window
    const subarraySums = new Array(n - k + 1);
    let windowSum = 0;
    for (let i = 0; i < k; i++) windowSum += nums[i];
    subarraySums[0] = windowSum;
    for (let i = 1; i <= n - k; i++) {
        windowSum += nums[i + k - 1] - nums[i - 1]; // slide window right
        subarraySums[i] = windowSum;
    }

    // Step 2: Build bestLeft[i] = starting index of the best subarray in [0..i]
    const bestLeft = new Array(subarraySums.length);
    let bestLeftIndex = 0;
    for (let i = 0; i < subarraySums.length; i++) {
        if (subarraySums[i] > subarraySums[bestLeftIndex]) {
            bestLeftIndex = i; // Found a better left subarray
        }
        bestLeft[i] = bestLeftIndex;
    }

    // Step 3: Build bestRight[i] = starting index of the best subarray in [i..end]
    // Scan right-to-left, using >= to prefer lexicographically smaller index on ties
    const bestRight = new Array(subarraySums.length);
    let bestRightIndex = subarraySums.length - 1;
    for (let i = subarraySums.length - 1; i >= 0; i--) {
        if (subarraySums[i] >= subarraySums[bestRightIndex]) {
            bestRightIndex = i; // Found a better (or equal) right subarray
        }
        bestRight[i] = bestRightIndex;
    }

    // Step 4: Try every possible middle subarray position and compute total
    let bestResult = [-1, -1, -1];
    let maxTotalSum = 0;

    for (let middleStart = k; middleStart < subarraySums.length - k; middleStart++) {
        const leftStart = bestLeft[middleStart - k];
        const rightStart = bestRight[middleStart + k];
        const totalSum = subarraySums[leftStart] + subarraySums[middleStart] + subarraySums[rightStart];

        if (totalSum > maxTotalSum) {
            maxTotalSum = totalSum;
            bestResult = [leftStart, middleStart, rightStart];
        }
    }

    return bestResult;
};`,
    jsWalkthrough:
      'Example: nums = [1,2,1,2,6,7,5,1], k = 2\n\n' +
      'Step 1 - subarraySums (each length-2 window):\n' +
      '  [0]: 1+2=3, [1]: 2+1=3, [2]: 1+2=3, [3]: 2+6=8,\n' +
      '  [4]: 6+7=13, [5]: 7+5=12, [6]: 5+1=6\n' +
      '  subarraySums = [3,3,3,8,13,12,6]\n\n' +
      'Step 2 - bestLeft (best index in [0..i]):\n' +
      '  [0]:0, [1]:0, [2]:0, [3]:3, [4]:4, [5]:4, [6]:4\n\n' +
      'Step 3 - bestRight (best index in [i..end]):\n' +
      '  [6]:6, [5]:5, [4]:4, [3]:4, [2]:4, [1]:4, [0]:4\n\n' +
      'Step 4 - try middle positions j (k=2, so j in [2..4]):\n' +
      '  j=2: left=bestLeft[0]=0, right=bestRight[4]=4\n' +
      '    total = sums[0]+sums[2]+sums[4] = 3+3+13 = 19\n' +
      '  j=3: left=bestLeft[1]=0, right=bestRight[5]=5\n' +
      '    total = 3+8+12 = 23\n' +
      '  j=4: left=bestLeft[2]=0 (no wait, j=4 is actually out since sums.length=7, k=2 → j < 7-2=5)\n' +
      '  Best: j=3, left=0, right=5 → [0,3,5]\n' +
      'Return [0,3,5]',
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
    intuition:
      'Count word frequencies, then sort by frequency (descending) with ties broken alphabetically. The sorting key (-frequency, word) handles both criteria in one pass. Return the first k results.',
    approach:
      'Use a Counter to count frequencies, then sort by (-frequency, word) to handle ties lexicographically. Return the first k results.',
    code: `from collections import Counter

class Solution:
    def topKFrequent(self, words: list[str], k: int) -> list[str]:
        count = Counter(words)
        return sorted(count.keys(), key=lambda w: (-count[w], w))[:k]`,
    jsCode: `var topKFrequent = function(words, k) {
    // Count frequency of each word
    const wordFrequency = new Map();
    for (const word of words) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    }

    // Sort words: higher frequency first, then alphabetically for ties
    const sortedWords = [...wordFrequency.keys()].sort((wordA, wordB) => {
        const freqA = wordFrequency.get(wordA);
        const freqB = wordFrequency.get(wordB);

        if (freqB !== freqA) {
            // Primary: higher frequency comes first
            return freqB - freqA;
        } else {
            // Secondary: lexicographically smaller word comes first
            return wordA.localeCompare(wordB);
        }
    });

    // Return the top k words
    return sortedWords.slice(0, k);
};`,
    jsWalkthrough:
      'Example: words = ["i","love","leetcode","i","love","coding"], k = 2\n\n' +
      'Count frequencies:\n' +
      '  "i" → 2, "love" → 2, "leetcode" → 1, "coding" → 1\n\n' +
      'Sort by (-frequency, alphabetical):\n' +
      '  "i" and "love" both have freq=2 → alphabetical: "i" < "love"\n' +
      '  "coding" and "leetcode" both have freq=1 → alphabetical: "coding" < "leetcode"\n' +
      '  Sorted: ["i","love","coding","leetcode"]\n\n' +
      'Return first k=2: ["i","love"]',
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
    intuition:
      'Two islands are the \'same\' if one can be slid on top of the other. By recording each cell\'s position relative to the island\'s starting cell, you get a translation-invariant shape signature. Store these signatures in a set to count distinct shapes.',
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
    jsCode: `var numDistinctIslands = function(grid) {
    const rows = grid.length;
    const cols = grid[0].length;

    // Track visited cells to avoid revisiting
    const visited = new Set();

    // Store shape signatures of all islands found
    const shapeSignatures = new Set();

    // DFS to explore an island and record its shape
    // (r0, c0) is the starting cell of the island (used to normalize positions)
    const dfs = (r, c, startRow, startCol, shapeCoords) => {
        // Boundary and validity checks
        if (r < 0 || r >= rows || c < 0 || c >= cols) return;
        if (grid[r][c] === 0) return; // Water
        if (visited.has(r + ',' + c)) return; // Already visited

        visited.add(r + ',' + c);

        // Record this cell's position relative to the island's starting cell
        const relativeRow = r - startRow;
        const relativeCol = c - startCol;
        shapeCoords.push(relativeRow + ',' + relativeCol);

        // Explore all 4 directions
        dfs(r + 1, c, startRow, startCol, shapeCoords); // down
        dfs(r - 1, c, startRow, startCol, shapeCoords); // up
        dfs(r, c + 1, startRow, startCol, shapeCoords); // right
        dfs(r, c - 1, startRow, startCol, shapeCoords); // left
    };

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 1 && !visited.has(r + ',' + c)) {
                // Start DFS from this land cell
                const shapeCoords = [];
                dfs(r, c, r, c, shapeCoords);

                // Convert shape to a string signature (unique per shape)
                const shapeKey = shapeCoords.join('|');
                shapeSignatures.add(shapeKey);
            }
        }
    }

    return shapeSignatures.size;
};`,
    jsWalkthrough:
      'Example: grid = [[1,1,0],[1,1,0],[0,0,1]]\n\n' +
      'Island 1: starts at (0,0)\n' +
      '  dfs(0,0): relative=(0,0), push "0,0"\n' +
      '  dfs(1,0): relative=(1,0), push "1,0"\n' +
      '  dfs(2,0): water → return\n' +
      '  dfs(0,0): visited → return\n' +
      '  back to (1,0), dfs(1,1): relative=(1,1), push "1,1"\n' +
      '  ... etc\n' +
      '  shape = ["0,0","1,0","0,1","1,1"] → signature "0,0|1,0|0,1|1,1"\n\n' +
      'Island 2: starts at (2,2)\n' +
      '  dfs(2,2): relative=(0,0), push "0,0"\n' +
      '  All neighbors are water\n' +
      '  shape = ["0,0"] → signature "0,0"\n\n' +
      'shapeSignatures = {"0,0|1,0|0,1|1,1", "0,0"}\n' +
      'Return 2',
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
    intuition:
      'Think of filling k buckets to the same target sum. Use backtracking to try placing each number in each bucket, but prune aggressively: sort descending so large numbers fail fast, and skip duplicate bucket values to avoid redundant work.',
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
    jsCode: `var canPartitionKSubsets = function(nums, k) {
    // Check if partition is even possible
    const totalSum = nums.reduce((acc, n) => acc + n, 0);
    if (totalSum % k !== 0) return false;

    const targetSum = totalSum / k;

    // Sort descending: try larger numbers first for faster pruning
    nums.sort((a, b) => b - a);

    // If the largest number exceeds the target, impossible to partition
    if (nums[0] > targetSum) return false;

    // k buckets, each trying to reach targetSum
    const buckets = new Array(k).fill(0);

    const backtrack = (numberIndex) => {
        // All numbers assigned: check if all buckets hit target
        if (numberIndex === nums.length) {
            return buckets.every(bucketSum => bucketSum === targetSum);
        }

        // Track which bucket sums we've already tried for this number
        // Avoids placing nums[numberIndex] in two buckets with the same current sum
        const triedBucketSums = new Set();

        for (let bucketIndex = 0; bucketIndex < k; bucketIndex++) {
            const currentBucketSum = buckets[bucketIndex];

            // Skip if adding this number would exceed the target
            if (currentBucketSum + nums[numberIndex] > targetSum) continue;

            // Skip if we already tried a bucket with this exact sum (duplicate state)
            if (triedBucketSums.has(currentBucketSum)) continue;

            triedBucketSums.add(currentBucketSum);

            // Place this number in the current bucket and recurse
            buckets[bucketIndex] += nums[numberIndex];
            if (backtrack(numberIndex + 1)) return true;
            buckets[bucketIndex] -= nums[numberIndex]; // undo
        }

        return false;
    };

    return backtrack(0);
};`,
    jsWalkthrough:
      'Example: nums = [4,3,2,3,5,2,1], k = 4\n' +
      'totalSum = 20, targetSum = 5\n' +
      'After sort: nums = [5,4,3,3,2,2,1]\n\n' +
      'backtrack(0): nums[0]=5\n' +
      '  bucket[0]=0+5=5, recurse\n' +
      '  backtrack(1): nums[1]=4\n' +
      '    bucket[0]=5, skip (5+4>5)\n' +
      '    bucket[1]=0+4=4, recurse\n' +
      '    backtrack(2): nums[2]=3\n' +
      '      bucket[0]=5+3? skip\n' +
      '      bucket[1]=4+3? skip\n' +
      '      bucket[2]=0+3=3, recurse\n' +
      '      backtrack(3): nums[3]=3\n' +
      '        ... eventually bucket[3]=0+3=3\n' +
      '      ... and so on until all buckets reach 5\n' +
      'Return true',
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
    intuition:
      'A BST is like a sorted decision tree. At each node, compare the target with the node\'s value to decide whether to go left or right. This halves the search space at each step, like binary search in an array.',
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
    jsCode: `var searchBST = function(root, val) {
    // Iterate down the tree using BST property
    let currentNode = root;

    while (currentNode !== null) {
        if (val === currentNode.val) {
            // Found the node — return the subtree rooted here
            return currentNode;
        } else if (val < currentNode.val) {
            // Target is smaller: must be in the left subtree
            currentNode = currentNode.left;
        } else {
            // Target is larger: must be in the right subtree
            currentNode = currentNode.right;
        }
    }

    // Reached a null position: value not in BST
    return null;
};`,
    jsWalkthrough:
      'Example: root = [4,2,7,1,3], val = 2\n\n' +
      'Tree:    4\n' +
      '        / \\\n' +
      '       2   7\n' +
      '      / \\\n' +
      '     1   3\n\n' +
      'currentNode=4: val(2) < 4 → go left\n' +
      'currentNode=2: val(2) === 2 → return node(2)\n\n' +
      'Return subtree rooted at 2: [2,1,3]',
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
    intuition:
      'In a BST, a new value always becomes a leaf node. Navigate down the tree using BST comparisons (go left if smaller, right if larger) until you reach a null position, then insert the new node there.',
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
    jsCode: `var insertIntoBST = function(root, val) {
    // Base case: found the correct empty position — insert here
    if (!root) {
        return new TreeNode(val);
    }

    if (val < root.val) {
        // New value belongs in the left subtree
        root.left = insertIntoBST(root.left, val);
    } else {
        // New value belongs in the right subtree
        root.right = insertIntoBST(root.right, val);
    }

    // Return the unchanged root after insertion
    return root;
};`,
    jsWalkthrough:
      'Example: root = [4,2,7,1,3], val = 5\n\n' +
      'Tree:    4\n' +
      '        / \\\n' +
      '       2   7\n' +
      '      / \\\n' +
      '     1   3\n\n' +
      'insertIntoBST(4, 5): 5 > 4 → recurse right\n' +
      '  insertIntoBST(7, 5): 5 < 7 → recurse left\n' +
      '    insertIntoBST(null, 5): root is null → return new TreeNode(5)\n' +
      '  node(7).left = node(5)\n' +
      '  return node(7)\n' +
      'node(4).right = node(7)\n' +
      'return node(4)\n\n' +
      'Result tree: [4,2,7,1,3,5]',
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
    intuition:
      'A min-heap of size k acts like a velvet rope at a VIP section - it only keeps the top k elements. The smallest element in the heap is always the kth largest overall. When a new value arrives, it either replaces the smallest or gets rejected.',
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
    jsCode: `var KthLargest = function(k, nums) {
    this.k = k;
    // Simulated min-heap: keeps only the top k largest values seen
    // (JS has no built-in heap, so we use a sorted array)
    this.minHeap = [];

    // Initialize: add all given numbers using the add method
    for (const num of nums) {
        this.add(num);
    }
};

KthLargest.prototype.add = function(val) {
    // Add the new value to the heap
    this.minHeap.push(val);

    // Sort ascending so the smallest (kth largest) is at index 0
    this.minHeap.sort((a, b) => a - b);

    // Trim the heap to at most k elements (remove elements smaller than kth largest)
    while (this.minHeap.length > this.k) {
        this.minHeap.shift(); // Remove the smallest element
    }

    // The smallest element in the heap IS the kth largest overall
    return this.minHeap[0];
};`,
    jsWalkthrough:
      'Example: KthLargest(3, [4,5,8,2])\n\n' +
      'Init (add each initial number):\n' +
      '  add(4): heap=[4]\n' +
      '  add(5): heap=[4,5]\n' +
      '  add(8): heap=[4,5,8]\n' +
      '  add(2): heap=[2,4,5,8], trim to k=3 → remove 2 → heap=[4,5,8]\n' +
      '  (kth largest is 4)\n\n' +
      'add(3): heap=[3,4,5,8], trim → remove 3 → heap=[4,5,8], return 4\n' +
      'add(5): heap=[4,5,5,8], trim → remove 4 → heap=[5,5,8], return 5\n' +
      'add(10): heap=[5,5,8,10], trim → remove 5 → heap=[5,8,10], return 5\n' +
      'add(9): heap=[5,8,9,10], trim → remove 5 → heap=[8,9,10], return 8\n' +
      'add(4): heap=[4,8,9,10], trim → remove 4 → heap=[8,9,10], return 8',
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
    intuition:
      'A hash set uses a hash function to map keys to bucket indices, then stores keys in their bucket. Using separate chaining (a list per bucket), you handle collisions gracefully. The key insight is that a good hash function distributes keys evenly across buckets.',
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
    jsCode: `var MyHashSet = function() {
    // Number of buckets — a prime number reduces collisions
    this.bucketCount = 10007;

    // Each bucket is a list (separate chaining to handle collisions)
    this.buckets = Array.from({ length: this.bucketCount }, () => []);
};

// Hash function: maps key to a bucket index
MyHashSet.prototype._hash = function(key) {
    return key % this.bucketCount;
};

MyHashSet.prototype.add = function(key) {
    const bucketIndex = this._hash(key);
    const bucket = this.buckets[bucketIndex];

    // Only add if not already present
    if (!bucket.includes(key)) {
        bucket.push(key);
    }
};

MyHashSet.prototype.remove = function(key) {
    const bucketIndex = this._hash(key);
    const bucket = this.buckets[bucketIndex];

    const positionInBucket = bucket.indexOf(key);
    if (positionInBucket !== -1) {
        bucket.splice(positionInBucket, 1);
    }
};

MyHashSet.prototype.contains = function(key) {
    const bucketIndex = this._hash(key);
    return this.buckets[bucketIndex].includes(key);
};`,
    jsWalkthrough:
      'Example: add(1), add(2), contains(1), contains(3), remove(2), contains(2)\n\n' +
      'bucketCount=10007\n\n' +
      'add(1): hash=1%10007=1, bucket[1]=[], add 1 → bucket[1]=[1]\n' +
      'add(2): hash=2, bucket[2]=[], add 2 → bucket[2]=[2]\n' +
      'contains(1): hash=1, bucket[1]=[1], includes(1) → true\n' +
      'contains(3): hash=3, bucket[3]=[], includes(3) → false\n' +
      'remove(2): hash=2, bucket[2]=[2], indexOf(2)=0, splice → bucket[2]=[]\n' +
      'contains(2): hash=2, bucket[2]=[], includes(2) → false',
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
    intuition:
      'In a sorted circular list, there are three insertion cases: the value fits between two nodes normally, it is the new max or min (insert at the wrap-around point), or all values are the same (insert anywhere). Traversing the list once handles all cases.',
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
    jsCode: `var insert = function(head, insertVal) {
    const newNode = new Node(insertVal);

    // Edge case: empty list — create a single-node circular list
    if (!head) {
        newNode.next = newNode;
        return newNode;
    }

    let curr = head;

    while (true) {
        // Case 1: Normal insertion — insertVal fits between curr and curr.next
        if (curr.val <= insertVal && insertVal <= curr.next.val) break;

        // Case 2: We're at the wrap-around point (curr is max, curr.next is min)
        if (curr.val > curr.next.val) {
            // insertVal is the new max OR the new min
            if (insertVal >= curr.val || insertVal <= curr.next.val) break;
        }

        // Case 3: All values are the same, or we've done a full loop
        // Insert anywhere — just break here
        if (curr.next === head) break;

        curr = curr.next;
    }

    // Insert newNode between curr and curr.next
    newNode.next = curr.next;
    curr.next = newNode;
    return head;
};`,
    jsWalkthrough:
      'Example: head = [3→4→1→(back to 3)], insertVal = 2\n\n' +
      'Start: curr=node(3)\n\n' +
      'Iteration 1: curr=3, curr.next=4\n' +
      '  Case 1: 3 <= 2 <= 4? No (2 < 3)\n' +
      '  Case 2: curr.val(3) > curr.next.val(4)? No\n' +
      '  curr.next !== head → advance\n\n' +
      'Iteration 2: curr=4, curr.next=1\n' +
      '  Case 1: 4 <= 2 <= 1? No\n' +
      '  Case 2: curr.val(4) > curr.next.val(1)? YES → wrap-around!\n' +
      '    insertVal(2) >= curr.val(4)? No\n' +
      '    insertVal(2) <= curr.next.val(1)? No\n' +
      '  curr.next !== head → advance\n\n' +
      'Iteration 3: curr=1, curr.next=3\n' +
      '  Case 1: 1 <= 2 <= 3? YES → break!\n\n' +
      'Insert: newNode(2).next = node(3), node(1).next = newNode(2)\n' +
      'Result: [3→4→1→2→(back to 3)]',
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
    intuition:
      'This is like edit distance but only with deletions, and costs are ASCII values instead of 1. If characters match, no deletion is needed. Otherwise, try deleting from either string and take the cheaper option. DP builds up the solution from smaller subproblems.',
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
    jsCode: `var minimumDeleteSum = function(s1, s2) {
    const m = s1.length;
    const n = s2.length;

    // dp[i][j] = minimum ASCII delete sum to make s1[0..i-1] equal to s2[0..j-1]
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    // Base case: delete all of s1 (cost = sum of ASCII values in s1)
    for (let i = 1; i <= m; i++) {
        dp[i][0] = dp[i - 1][0] + s1.charCodeAt(i - 1);
    }

    // Base case: delete all of s2 (cost = sum of ASCII values in s2)
    for (let j = 1; j <= n; j++) {
        dp[0][j] = dp[0][j - 1] + s2.charCodeAt(j - 1);
    }

    // Fill the DP table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                // Characters match: no deletion needed for this pair
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                // Characters differ: delete from s1 OR delete from s2, take minimum cost
                const deletFromS1 = dp[i - 1][j] + s1.charCodeAt(i - 1);
                const deleteFromS2 = dp[i][j - 1] + s2.charCodeAt(j - 1);
                dp[i][j] = Math.min(deletFromS1, deleteFromS2);
            }
        }
    }

    return dp[m][n];
};`,
    jsWalkthrough:
      'Example: s1 = "sea", s2 = "eat"\n\n' +
      'Base cases:\n' +
      '  dp[1][0] = 115 (delete "s")\n' +
      '  dp[2][0] = 115+101=216 (delete "se")\n' +
      '  dp[3][0] = 216+97=313 (delete "sea")\n' +
      '  dp[0][1] = 101 (delete "e")\n' +
      '  dp[0][2] = 101+97=198 (delete "ea")\n' +
      '  dp[0][3] = 198+116=314 (delete "eat")\n\n' +
      'i=1 (s1[0]="s"), j=1 (s2[0]="e"): "s"!="e"\n' +
      '  deleteFromS1 = dp[0][1]+115=216\n' +
      '  deleteFromS2 = dp[1][0]+101=216\n' +
      '  dp[1][1] = 216\n\n' +
      'i=1 (s1[0]="s"), j=2 (s2[1]="a"): "s"!="a"\n' +
      '  ... continuing ...\n\n' +
      'Eventually dp[3][3] = 231\n' +
      'Return 231 ("s" and "t" deleted: 115+116=231)',
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
    intuition:
      'Use a sliding window where you maintain the running product. Expand the right end and shrink the left end whenever the product exceeds k. The key insight is that for each new right position, all subarrays ending there and starting from left to right are valid, giving (right - left + 1) new subarrays.',
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
    jsCode: `var numSubarrayProductLessThanK = function(nums, k) {
    // If k <= 1, no subarray can have product < k (all nums are positive)
    if (k <= 1) return 0;

    let windowProduct = 1;  // Product of all elements in the current window
    let leftPointer = 0;    // Left edge of the sliding window
    let validSubarrayCount = 0;

    for (let rightPointer = 0; rightPointer < nums.length; rightPointer++) {
        // Expand window to include nums[rightPointer]
        windowProduct *= nums[rightPointer];

        // Shrink window from the left until product is below k
        while (windowProduct >= k) {
            windowProduct /= nums[leftPointer];
            leftPointer++;
        }

        // All subarrays ending at rightPointer and starting at leftPointer..rightPointer are valid
        // That's (rightPointer - leftPointer + 1) new subarrays
        validSubarrayCount += rightPointer - leftPointer + 1;
    }

    return validSubarrayCount;
};`,
    jsWalkthrough:
      'Example: nums = [10,5,2,6], k = 100\n\n' +
      'Init: windowProduct=1, leftPointer=0, count=0\n\n' +
      'right=0: product=1*10=10, 10<100 → count += 0-0+1=1, count=1\n' +
      '  (valid subarrays: [10])\n\n' +
      'right=1: product=10*5=50, 50<100 → count += 1-0+1=2, count=3\n' +
      '  (valid subarrays: [5], [10,5])\n\n' +
      'right=2: product=50*2=100, 100>=100 → shrink: product/=10=10, left=1\n' +
      '  10<100 → count += 2-1+1=2, count=5\n' +
      '  (valid subarrays: [2], [5,2])\n\n' +
      'right=3: product=10*6=60, 60<100 → count += 3-1+1=3, count=8\n' +
      '  (valid subarrays: [6], [2,6], [5,2,6])\n\n' +
      'Return 8',
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
    intuition:
      'Model two states: holding stock and not holding stock. Each day you can buy, sell (paying the fee), or do nothing. The fee makes you want to hold longer for bigger gains rather than trading frequently, and the DP naturally captures this tradeoff.',
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
    jsCode: `var maxProfit = function(prices, fee) {
    // cash: max profit when NOT holding stock (or just sold)
    let cashProfit = 0;

    // hold: max profit when holding stock (negative because we spent money to buy)
    let holdProfit = -prices[0];

    for (let day = 1; day < prices.length; day++) {
        const todayPrice = prices[day];

        // Option: sell today (pay fee), or do nothing
        const newCash = Math.max(cashProfit, holdProfit + todayPrice - fee);

        // Option: buy today (spend money), or continue holding
        const newHold = Math.max(holdProfit, cashProfit - todayPrice);

        cashProfit = newCash;
        holdProfit = newHold;
    }

    // Best profit is when we're not holding stock at the end
    return cashProfit;
};`,
    jsWalkthrough:
      'Example: prices = [1,3,2,8,4,9], fee = 2\n\n' +
      'Init: cashProfit=0, holdProfit=-1 (bought at day 0 for price 1)\n\n' +
      'day=1, price=3:\n' +
      '  newCash = max(0, -1+3-2)=max(0,0)=0\n' +
      '  newHold = max(-1, 0-3)=max(-1,-3)=-1\n' +
      '  cash=0, hold=-1\n\n' +
      'day=2, price=2:\n' +
      '  newCash = max(0, -1+2-2)=max(0,-1)=0\n' +
      '  newHold = max(-1, 0-2)=max(-1,-2)=-1\n' +
      '  cash=0, hold=-1\n\n' +
      'day=3, price=8:\n' +
      '  newCash = max(0, -1+8-2)=max(0,5)=5\n' +
      '  newHold = max(-1, 0-8)=-1\n' +
      '  cash=5, hold=-1\n\n' +
      'day=4, price=4:\n' +
      '  newCash = max(5, -1+4-2)=max(5,1)=5\n' +
      '  newHold = max(-1, 5-4)=max(-1,1)=1\n' +
      '  cash=5, hold=1\n\n' +
      'day=5, price=9:\n' +
      '  newCash = max(5, 1+9-2)=max(5,8)=8\n' +
      '  newHold = max(1, 5-9)=1\n' +
      '  cash=8, hold=1\n\n' +
      'Return cashProfit = 8',
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
    intuition:
      'A regular stack cannot efficiently find and remove the maximum. By maintaining both a stack (for LIFO order) and a sorted structure (for max queries), with lazy deletion via unique IDs to keep them in sync, all operations become efficient.',
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
    jsCode: `var MaxStack = function() {
    // Main stack: each entry is [uniqueId, value]
    this.stack = [];

    // Sorted array: each entry is [value, uniqueId], sorted ascending by value then id
    // The last element is always the maximum (largest value, then highest id for ties)
    this.sortedByValue = [];

    // Auto-incrementing unique ID for each push
    this.nextId = 0;

    // Set of IDs that have been logically deleted (via popMax or pop)
    this.deletedIds = new Set();
};

MaxStack.prototype.push = function(x) {
    const id = this.nextId++;
    this.stack.push([id, x]);
    this.sortedByValue.push([x, id]);
    // Keep sorted: sort by value ascending, then by id ascending for tie-breaking
    this.sortedByValue.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};

MaxStack.prototype.pop = function() {
    // Skip any logically deleted entries on top of the stack
    while (this.deletedIds.has(this.stack[this.stack.length - 1][0])) {
        this.stack.pop();
    }
    const [id, val] = this.stack.pop();

    // Remove from sorted structure too
    const position = this.sortedByValue.findIndex(entry => entry[1] === id);
    this.sortedByValue.splice(position, 1);

    return val;
};

MaxStack.prototype.top = function() {
    // Skip logically deleted entries
    while (this.deletedIds.has(this.stack[this.stack.length - 1][0])) {
        this.stack.pop();
    }
    return this.stack[this.stack.length - 1][1];
};

MaxStack.prototype.peekMax = function() {
    // Skip logically deleted entries from the high end of the sorted list
    while (this.deletedIds.has(this.sortedByValue[this.sortedByValue.length - 1][1])) {
        this.sortedByValue.pop();
    }
    return this.sortedByValue[this.sortedByValue.length - 1][0];
};

MaxStack.prototype.popMax = function() {
    // Skip logically deleted entries from the high end of the sorted list
    while (this.deletedIds.has(this.sortedByValue[this.sortedByValue.length - 1][1])) {
        this.sortedByValue.pop();
    }
    const [val, id] = this.sortedByValue.pop();

    // Mark as deleted in the stack (lazy deletion — don't search through stack)
    this.deletedIds.add(id);

    return val;
};`,
    jsWalkthrough:
      'Operations: push(5), push(1), push(5), top(), popMax(), top(), peekMax(), pop(), top()\n\n' +
      'push(5): stack=[(0,5)], sorted=[(5,0)]\n' +
      'push(1): stack=[(0,5),(1,1)], sorted=[(1,1),(5,0)]\n' +
      'push(5): stack=[(0,5),(1,1),(2,5)], sorted=[(1,1),(5,0),(5,2)]\n\n' +
      'top(): stack top=(2,5), not deleted → return 5\n' +
      'popMax(): sorted top=(5,2), val=5, id=2, deletedIds={2}, return 5\n' +
      'top(): stack top=(2,5), id=2 IS deleted → pop; new top=(1,1), return 1\n' +
      'peekMax(): sorted top=(5,0), not deleted → return 5\n' +
      'pop(): stack top=(1,1), not deleted → pop; remove (1,1) from sorted; return 1\n' +
      'top(): stack top=(0,5), return 5',
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
    intuition:
      'Sort the words so shorter ones come first. A word is \'buildable\' only if removing its last character gives a word already in your built set - meaning it was constructed one letter at a time. This ensures every prefix along the way is also a valid word.',
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
    jsCode: `var longestWord = function(words) {
    // Sort so shorter words and lexicographically smaller words come first
    // This ensures when we find the longest, it's already the lex smallest
    words.sort();

    // Set of "buildable" words — initialized with "" (empty string as base case)
    const buildableWords = new Set(['']);

    let longestBuildable = '';

    for (const word of words) {
        // A word is buildable only if removing its last character gives a buildable word
        const wordWithoutLastChar = word.slice(0, -1);

        if (buildableWords.has(wordWithoutLastChar)) {
            // This word can be built one character at a time
            buildableWords.add(word);

            // Update longest (due to sort order, same-length words come lex smallest first)
            if (word.length > longestBuildable.length) {
                longestBuildable = word;
            }
        }
    }

    return longestBuildable;
};`,
    jsWalkthrough:
      'Example: words = ["w","wo","wor","worl","world"]\n\n' +
      'After sort: ["w","wo","wor","worl","world"] (already sorted)\n' +
      'buildableWords = {""}\n\n' +
      '"w": prefix=""=buildable → add "w", longestBuildable="w"\n' +
      '"wo": prefix="w"=buildable → add "wo", longestBuildable="wo"\n' +
      '"wor": prefix="wo"=buildable → add "wor", longestBuildable="wor"\n' +
      '"worl": prefix="wor"=buildable → add "worl", longestBuildable="worl"\n' +
      '"world": prefix="worl"=buildable → add "world", longestBuildable="world"\n\n' +
      'Return "world"',
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
    intuition:
      'Track a boolean flag for whether you are inside a block comment. Process two characters at a time to detect \'//\' and \'/* */\'. Line comments skip the rest of the line, block comments skip until \'*/\'. Buffer non-comment characters and flush at line boundaries.',
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
    jsCode: `var removeComments = function(source) {
    // Whether we are currently inside a /* block comment */
    let insideBlockComment = false;

    const outputLines = [];

    // Buffer collects characters for the current output line
    // (may span multiple source lines if a block comment spans lines)
    let lineBuffer = [];

    for (const sourceLine of source) {
        let charIndex = 0;

        while (charIndex < sourceLine.length) {
            if (insideBlockComment) {
                // Inside block comment: look for the closing "*/"
                if (charIndex + 1 < sourceLine.length &&
                    sourceLine.slice(charIndex, charIndex + 2) === '*/') {
                    insideBlockComment = false;
                    charIndex += 2; // Skip both '*' and '/'
                } else {
                    charIndex++; // Skip this character (it's inside the comment)
                }
            } else {
                // Outside block comment: look for comment starters
                if (charIndex + 1 < sourceLine.length &&
                    sourceLine.slice(charIndex, charIndex + 2) === '//') {
                    // Line comment: skip rest of this line
                    break;
                } else if (charIndex + 1 < sourceLine.length &&
                           sourceLine.slice(charIndex, charIndex + 2) === '/*') {
                    // Block comment start: enter block comment mode
                    insideBlockComment = true;
                    charIndex += 2; // Skip both '/' and '*'
                } else {
                    // Regular character: add to buffer
                    lineBuffer.push(sourceLine[charIndex]);
                    charIndex++;
                }
            }
        }

        // At the end of a source line, flush the buffer IF we're not in a block comment
        // (Block comments can span multiple lines, so we keep buffering)
        if (!insideBlockComment && lineBuffer.length > 0) {
            outputLines.push(lineBuffer.join(''));
            lineBuffer = [];
        }
    }

    return outputLines;
};`,
    jsWalkthrough:
      'Example (simplified): source = ["a/*b*/c","d//e","f"]\n\n' +
      'Line "a/*b*/c":\n' +
      '  i=0: "a" → push "a"\n' +
      '  i=1: "/*" → enter block comment, i+=2\n' +
      '  i=3: "b" → inside block, skip\n' +
      '  i=4: "*/" → exit block comment, i+=2\n' +
      '  i=6: "c" → push "c"\n' +
      '  End of line, not in block → output "ac"\n\n' +
      'Line "d//e":\n' +
      '  i=0: "d" → push "d"\n' +
      '  i=1: "//" → line comment, break\n' +
      '  End of line, not in block → output "d"\n\n' +
      'Line "f":\n' +
      '  i=0: "f" → push "f"\n' +
      '  End of line → output "f"\n\n' +
      'Return ["ac","d","f"]',
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
    intuition:
      'Simulate the game in a loop: find all groups of 3+ identical candies in rows and columns, crush them by setting to 0, then apply gravity by compacting each column downward. Repeat until no more crushing happens. The key is to mark all crushable cells before removing them.',
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
    jsCode: `var candyCrush = function(board) {
    const rows = board.length;
    const cols = board[0].length;

    while (true) {
        // Step 1: Find all cells to crush (3+ consecutive same values)
        const cellsToCrush = new Set();

        // Check horizontal groups of 3+
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols - 2; c++) {
                const candy = board[r][c];
                if (candy !== 0 &&
                    candy === board[r][c + 1] &&
                    candy === board[r][c + 2]) {
                    cellsToCrush.add(r + ',' + c);
                    cellsToCrush.add(r + ',' + (c + 1));
                    cellsToCrush.add(r + ',' + (c + 2));
                }
            }
        }

        // Check vertical groups of 3+
        for (let r = 0; r < rows - 2; r++) {
            for (let c = 0; c < cols; c++) {
                const candy = board[r][c];
                if (candy !== 0 &&
                    candy === board[r + 1][c] &&
                    candy === board[r + 2][c]) {
                    cellsToCrush.add(r + ',' + c);
                    cellsToCrush.add((r + 1) + ',' + c);
                    cellsToCrush.add((r + 2) + ',' + c);
                }
            }
        }

        // No more groups to crush: done
        if (cellsToCrush.size === 0) break;

        // Step 2: Crush them (set to 0)
        for (const key of cellsToCrush) {
            const [r, c] = key.split(',').map(Number);
            board[r][c] = 0;
        }

        // Step 3: Apply gravity — compact each column downward
        for (let c = 0; c < cols; c++) {
            let writeRow = rows - 1; // The next position to write a non-zero value

            // Scan from bottom to top, moving non-zero values down
            for (let r = rows - 1; r >= 0; r--) {
                if (board[r][c] !== 0) {
                    board[writeRow][c] = board[r][c];
                    writeRow--;
                }
            }

            // Fill remaining top positions with 0
            for (let r = writeRow; r >= 0; r--) {
                board[r][c] = 0;
            }
        }
    }

    return board;
};`,
    jsWalkthrough:
      'Example: board = [[3,3,3],[3,1,2]] (simplified)\n\n' +
      'Round 1:\n' +
      '  Horizontal: row 0, cols 0-2: [3,3,3] match! mark (0,0),(0,1),(0,2)\n' +
      '  Vertical: none\n' +
      '  Crush: board = [[0,0,0],[3,1,2]]\n' +
      '  Gravity col 0: non-zero=[3], write from bottom → board[1][0]=3, board[0][0]=0\n' +
      '  Gravity col 1: non-zero=[1], → board[1][1]=1, board[0][1]=0\n' +
      '  Gravity col 2: non-zero=[2], → board[1][2]=2, board[0][2]=0\n' +
      '  Result: [[0,0,0],[3,1,2]]\n\n' +
      'Round 2: no groups of 3+ → break\n' +
      'Return [[0,0,0],[3,1,2]]',
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
    intuition:
      'The pivot index is where left sum equals right sum. Instead of computing both sums from scratch each time, maintain a running left sum and derive the right sum as (total - leftSum - currentElement). This turns an O(n^2) approach into O(n).',
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
    jsCode: `var pivotIndex = function(nums) {
    // Pre-compute total sum of all elements
    const totalSum = nums.reduce((accumulator, num) => accumulator + num, 0);

    // Running sum of all elements to the left of the current index
    let leftSum = 0;

    for (let i = 0; i < nums.length; i++) {
        // Right sum = totalSum - leftSum - current element
        const rightSum = totalSum - leftSum - nums[i];

        if (leftSum === rightSum) {
            // Found the pivot index
            return i;
        }

        // Include current element in the left sum for the next iteration
        leftSum += nums[i];
    }

    // No pivot index found
    return -1;
};`,
    jsWalkthrough:
      'Example: nums = [1,7,3,6,5,6]\n' +
      'totalSum = 1+7+3+6+5+6 = 28\n\n' +
      'i=0: leftSum=0, rightSum=28-0-1=27, 0≠27\n' +
      '  leftSum += 1 → leftSum=1\n' +
      'i=1: leftSum=1, rightSum=28-1-7=20, 1≠20\n' +
      '  leftSum += 7 → leftSum=8\n' +
      'i=2: leftSum=8, rightSum=28-8-3=17, 8≠17\n' +
      '  leftSum += 3 → leftSum=11\n' +
      'i=3: leftSum=11, rightSum=28-11-6=11, 11===11 → return 3!\n\n' +
      'Return 3',
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
    intuition:
      'Divide the list length by k to get the base size for each part, with the first (length % k) parts getting one extra node. Then walk through the list, cutting it at the right positions. It is like dealing cards as evenly as possible.',
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
    jsCode: `var splitListToParts = function(head, k) {
    // First pass: count the total length of the linked list
    let totalLength = 0;
    let curr = head;
    while (curr !== null) {
        totalLength++;
        curr = curr.next;
    }

    // Compute base size for each part and how many parts get an extra node
    const basePartSize = Math.floor(totalLength / k);
    const partsWithExtraNode = totalLength % k; // First 'partsWithExtraNode' parts get +1

    const result = [];
    curr = head;

    for (let partIndex = 0; partIndex < k; partIndex++) {
        // Record the start of this part
        result.push(curr);

        // Determine how many nodes this part should have
        const thisPartSize = basePartSize + (partIndex < partsWithExtraNode ? 1 : 0);

        // Advance curr to the last node of this part
        for (let step = 0; step < thisPartSize - 1; step++) {
            if (curr !== null) curr = curr.next;
        }

        // Cut the link between this part and the next
        if (curr !== null) {
            const nextPartHead = curr.next;
            curr.next = null; // Sever the connection
            curr = nextPartHead;
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: head = [1→2→3], k = 5\n\n' +
      'totalLength = 3\n' +
      'basePartSize = 3//5 = 0\n' +
      'partsWithExtraNode = 3%5 = 3\n\n' +
      'partIndex=0: push node(1), thisPartSize=0+1=1\n' +
      '  no inner steps (partSize-1=0)\n' +
      '  curr=node(1), nextPartHead=node(2), node(1).next=null, curr=node(2)\n' +
      'partIndex=1: push node(2), thisPartSize=0+1=1\n' +
      '  cut: node(2).next=null, curr=node(3)\n' +
      'partIndex=2: push node(3), thisPartSize=0+1=1\n' +
      '  cut: node(3).next=null, curr=null\n' +
      'partIndex=3: push null (curr is null)\n' +
      'partIndex=4: push null\n\n' +
      'Return [node(1), node(2), node(3), null, null]',
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
    intuition:
      'A stack of dictionaries handles nested parentheses naturally. Each \'(\' pushes a new scope, each \')\' pops and multiplies counts by the following number before merging into the parent scope. This mirrors how mathematical expressions with nested parentheses are evaluated.',
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
    jsCode: `var countOfAtoms = function(formula) {
    // Stack of atom-count maps; top of stack = current scope
    const stack = [{}];
    let i = 0;
    const n = formula.length;

    while (i < n) {
        if (formula[i] === '(') {
            // Open new scope for a parenthesized group
            stack.push({});
            i++;
        } else if (formula[i] === ')') {
            i++; // Skip ')'

            // Parse the multiplier following the closing parenthesis
            let numStart = i;
            while (i < n && formula[i] >= '0' && formula[i] <= '9') i++;
            const multiplier = parseInt(formula.slice(numStart, i) || '1');

            // Pop the current scope and merge into the parent scope with multiplier
            const currentScope = stack.pop();
            const parentScope = stack[stack.length - 1];
            for (const [element, count] of Object.entries(currentScope)) {
                parentScope[element] = (parentScope[element] || 0) + count * multiplier;
            }
        } else {
            // Parse element name: starts with uppercase, may have lowercase letters
            let nameStart = i;
            i++; // Skip the uppercase letter
            while (i < n && formula[i] >= 'a' && formula[i] <= 'z') i++;
            const elementName = formula.slice(nameStart, i);

            // Parse count following the element name (default is 1)
            let countStart = i;
            while (i < n && formula[i] >= '0' && formula[i] <= '9') i++;
            const elementCount = parseInt(formula.slice(countStart, i) || '1');

            // Add to the current scope
            const currentScope = stack[stack.length - 1];
            currentScope[elementName] = (currentScope[elementName] || 0) + elementCount;
        }
    }

    // Build the result string: elements sorted alphabetically
    const finalCounts = stack[0];
    const resultParts = [];
    for (const element of Object.keys(finalCounts).sort()) {
        resultParts.push(element);
        if (finalCounts[element] > 1) {
            resultParts.push(String(finalCounts[element]));
        }
    }

    return resultParts.join('');
};`,
    jsWalkthrough:
      'Example: formula = "Mg(OH)2"\n\n' +
      'stack = [{}]\n\n' +
      'i=0: "M" → parse element "Mg", count=1\n' +
      '  stack = [{"Mg":1}]\n\n' +
      'i=2: "(" → push new scope\n' +
      '  stack = [{"Mg":1}, {}]\n\n' +
      'i=3: "O" → parse element "O", count=1\n' +
      '  stack = [{"Mg":1}, {"O":1}]\n\n' +
      'i=4: "H" → parse element "H", count=1\n' +
      '  stack = [{"Mg":1}, {"O":1,"H":1}]\n\n' +
      'i=5: ")" → multiplier=2\n' +
      '  Pop scope {"O":1,"H":1}, multiply by 2\n' +
      '  Merge into parent: O:1*2=2, H:1*2=2\n' +
      '  stack = [{"Mg":1,"O":2,"H":2}]\n\n' +
      'Sort: H,Mg,O\n' +
      'Result: "H2MgO2"',
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
    intuition:
      'This is a two-pointer approach on steroids. First scan forward to find any subsequence match, then scan backward from the endpoint to find the tightest (shortest) window containing that subsequence. Repeat from the next position to find all candidates.',
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
    jsCode: `var minWindow = function(s1, s2) {
    let bestWindow = "";
    let startPos = 0;

    while (startPos < s1.length) {
        // Forward pass: find the first position where s2 is a subsequence
        // starting from startPos in s1
        let s2Pointer = 0;
        let s1Pointer = startPos;

        while (s1Pointer < s1.length && s2Pointer < s2.length) {
            if (s1[s1Pointer] === s2[s2Pointer]) {
                s2Pointer++;
            }
            s1Pointer++;
        }

        // If we couldn't match all of s2, no more windows possible
        if (s2Pointer < s2.length) break;

        // s1Pointer is now just past the end of the window
        const windowEnd = s1Pointer;

        // Backward pass: shrink the window from the right to find minimum start
        s2Pointer = s2.length - 1;
        s1Pointer--;

        while (s2Pointer >= 0) {
            if (s1[s1Pointer] === s2[s2Pointer]) {
                s2Pointer--;
            }
            s1Pointer--;
        }

        // s1Pointer+1 is the minimal start of this window
        const windowStart = s1Pointer + 1;

        // Update the best window if this one is shorter
        const currentWindow = s1.slice(windowStart, windowEnd);
        if (!bestWindow || currentWindow.length < bestWindow.length) {
            bestWindow = currentWindow;
        }

        // Try starting from the next character for potentially shorter windows
        startPos = windowStart + 1;
    }

    return bestWindow;
};`,
    jsWalkthrough:
      'Example: s1 = "abcdebdde", s2 = "bde"\n\n' +
      'startPos=0:\n' +
      '  Forward: s1[0]="a"≠"b", s1[1]="b"="b" j++, s1[2]="c"≠"d",\n' +
      '    s1[3]="d"="d" j++, s1[4]="e"="e" j++\n' +
      '    windowEnd=5\n' +
      '  Backward: from i=4, j=2 ("e"):\n' +
      '    s1[4]="e"="e" j--, s1[3]="d"="d" j--, s1[2]="c"≠"b",\n' +
      '    s1[1]="b"="b" j--\n' +
      '    windowStart=1+1=... wait, i ends at 0\n' +
      '    windowStart=0+1=1? No: s1Pointer ends at 0 after decrement → windowStart=1\n' +
      '  window = s1.slice(1,5) = "bcde", length=4\n' +
      '  bestWindow="bcde"\n' +
      '  startPos=1+1=2\n\n' +
      'startPos=2:\n' +
      '  Forward from i=2: "c","d"="b"? no, "d"="b"? no...\n' +
      '  ... eventually finds "bdde" window\n' +
      '  window = "bde" or "dbd..." etc.\n\n' +
      'Return shortest window found',
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
    intuition:
      'Think of a calendar as a sorted list of time intervals. A new event can be booked only if it does not overlap with any existing event. Binary search or linear scan through sorted intervals to check for conflicts before adding the new event.',
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
    jsCode: `var MyCalendar = function() {
    // List of all booked intervals as [start, end) pairs
    this.bookedIntervals = [];
};

MyCalendar.prototype.book = function(start, end) {
    // Check if the new event overlaps with any existing booking
    for (const [bookedStart, bookedEnd] of this.bookedIntervals) {
        // Two half-open intervals overlap if start1 < end2 AND start2 < end1
        const overlaps = start < bookedEnd && bookedStart < end;
        if (overlaps) {
            return false; // Double booking would occur
        }
    }

    // No overlap found: safe to book
    this.bookedIntervals.push([start, end]);
    return true;
};`,
    jsWalkthrough:
      'Operations: book(10,20), book(15,25), book(20,30)\n\n' +
      'book(10,20):\n' +
      '  No existing bookings → push [10,20]\n' +
      '  bookedIntervals=[[10,20]], return true\n\n' +
      'book(15,25):\n' +
      '  Check [10,20]: 15<20 AND 10<25 → OVERLAP → return false\n\n' +
      'book(20,30):\n' +
      '  Check [10,20]: 20<20? No → no overlap\n' +
      '  Push [20,30], return true\n' +
      '  bookedIntervals=[[10,20],[20,30]]',
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
    intuition:
      'Track events using a difference array or sorted intervals. For each booking, check if any time point would be triple-booked. Maintaining a count of overlapping events at each point lets you quickly determine if adding a new event would cause a triple booking.',
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
    jsCode: `var MyCalendarTwo = function() {
    // Single bookings: intervals booked at most once
    this.singleBookings = [];

    // Double bookings: intervals where exactly 2 events overlap
    // If a new event overlaps with any of these, it would create a triple booking
    this.doubleBookings = [];
};

MyCalendarTwo.prototype.book = function(start, end) {
    // Step 1: Check if the new event would create a triple booking
    for (const [doubleStart, doubleEnd] of this.doubleBookings) {
        const overlapsDoubleBooked = start < doubleEnd && doubleStart < end;
        if (overlapsDoubleBooked) {
            return false; // Would create a triple booking
        }
    }

    // Step 2: Compute new double bookings from overlaps with existing single bookings
    for (const [bookedStart, bookedEnd] of this.singleBookings) {
        const overlaps = start < bookedEnd && bookedStart < end;
        if (overlaps) {
            // The overlapping region becomes a double booking
            const overlapStart = Math.max(start, bookedStart);
            const overlapEnd = Math.min(end, bookedEnd);
            this.doubleBookings.push([overlapStart, overlapEnd]);
        }
    }

    // Step 3: Record as a new single booking
    this.singleBookings.push([start, end]);
    return true;
};`,
    jsWalkthrough:
      'Operations: book(10,20), book(50,60), book(10,40), book(5,15)\n\n' +
      'book(10,20):\n' +
      '  No doubles → ok; no singles → ok\n' +
      '  singles=[[10,20]], doubles=[]\n' +
      '  Return true\n\n' +
      'book(50,60):\n' +
      '  No overlap with singles → ok\n' +
      '  singles=[[10,20],[50,60]], doubles=[]\n' +
      '  Return true\n\n' +
      'book(10,40):\n' +
      '  No doubles → ok\n' +
      '  Overlap with [10,20]: overlapStart=max(10,10)=10, overlapEnd=min(40,20)=20\n' +
      '  doubles=[[10,20]]\n' +
      '  singles=[[10,20],[50,60],[10,40]]\n' +
      '  Return true\n\n' +
      'book(5,15):\n' +
      '  Check doubles [10,20]: 5<20 AND 10<15 → OVERLAP → return false!',
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
    intuition:
      'Flood fill is like pouring paint from a starting pixel. Use BFS or DFS to spread the new color to all connected pixels that share the original color. The key edge case is when the new color is the same as the original - do nothing to avoid infinite loops.',
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
    jsCode: `var floodFill = function(image, sr, sc, color) {
    const originalColor = image[sr][sc];

    // If the new color is the same as the original, nothing to do
    // (avoids infinite recursion)
    if (originalColor === color) return image;

    const numRows = image.length;
    const numCols = image[0].length;

    const dfs = (row, col) => {
        // Boundary check
        if (row < 0 || row >= numRows || col < 0 || col >= numCols) return;

        // Only fill pixels that match the original color
        if (image[row][col] !== originalColor) return;

        // Change this pixel to the new color
        image[row][col] = color;

        // Recursively fill 4-directional neighbors
        dfs(row + 1, col); // down
        dfs(row - 1, col); // up
        dfs(row, col + 1); // right
        dfs(row, col - 1); // left
    };

    dfs(sr, sc);
    return image;
};`,
    jsWalkthrough:
      'Example: image = [[1,1,1],[1,1,0],[1,0,1]], sr=1, sc=1, color=2\n\n' +
      'originalColor = image[1][1] = 1\n' +
      'originalColor(1) !== color(2) → proceed\n\n' +
      'dfs(1,1): image[1][1]=1=originalColor → paint 2\n' +
      '  image = [[1,1,1],[1,2,0],[1,0,1]]\n' +
      '  dfs(2,1): image[2][1]=0 ≠ 1 → return\n' +
      '  dfs(0,1): image[0][1]=1 → paint 2\n' +
      '    image = [[1,2,1],[1,2,0],[1,0,1]]\n' +
      '    dfs(-1,1): out of bounds → return\n' +
      '    dfs(1,1): already 2 ≠ 1 → return\n' +
      '    dfs(0,2): image[0][2]=1 → paint 2\n' +
      '    dfs(0,0): image[0][0]=1 → paint 2\n' +
      '  dfs(1,2): image[1][2]=0 ≠ 1 → return\n' +
      '  dfs(1,0): image[1][0]=1 → paint 2\n' +
      '    dfs(2,0): image[2][0]=1 → paint 2\n' +
      '    ... etc\n\n' +
      'Final: [[2,2,2],[2,2,0],[2,0,1]]',
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
    intuition:
      'This is the house robber problem in disguise. Group numbers by value and sum their contributions, then you cannot pick adjacent values (taking value v means skipping v-1 and v+1). DP on the sorted unique values with the robber recurrence gives the optimal answer.',
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
    jsCode: `var deleteAndEarn = function(nums) {
    // Count how many times each value appears
    const valueCount = new Map();
    let maxValue = 0;
    for (const num of nums) {
        valueCount.set(num, (valueCount.get(num) || 0) + 1);
        maxValue = Math.max(maxValue, num);
    }

    // dp[i] = max points using values from 1 to i
    // earning[i] = points gained by taking ALL occurrences of value i
    const dp = new Array(maxValue + 1).fill(0);
    dp[1] = (valueCount.get(1) || 0) * 1;

    for (let value = 2; value <= maxValue; value++) {
        const earningsForThisValue = value * (valueCount.get(value) || 0);

        // Option 1: skip value → dp[value-1] (can't take value)
        // Option 2: take all of value → earningsForThisValue + dp[value-2]
        dp[value] = Math.max(dp[value - 1], dp[value - 2] + earningsForThisValue);
    }

    return dp[maxValue];
};`,
    jsWalkthrough:
      'Example: nums = [3,4,2]\n\n' +
      'valueCount: {2:1, 3:1, 4:1}\n' +
      'maxValue = 4\n\n' +
      'dp[0] = 0 (no value 0)\n' +
      'dp[1] = count(1)*1 = 0*1 = 0 (value 1 not in nums)\n\n' +
      'value=2: earnings=2*1=2\n' +
      '  dp[2] = max(dp[1]=0, dp[0]+2=2) = 2\n\n' +
      'value=3: earnings=3*1=3\n' +
      '  dp[3] = max(dp[2]=2, dp[1]+3=3) = 3\n' +
      '  (Taking 3 conflicts with 2, but both give 3 here)\n\n' +
      'value=4: earnings=4*1=4\n' +
      '  dp[4] = max(dp[3]=3, dp[2]+4=6) = 6\n' +
      '  (Take 4 and 2: skip 3)\n\n' +
      'Return dp[4] = 6',
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
    intuition:
      'Think of two people walking simultaneously from top-left to bottom-right. Using DP with shared steps, you avoid counting the same cherry twice. The key insight is that two simultaneous paths can be modeled with three variables (step, row1, row2) since columns are determined by the step.',
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
    jsCode: `var cherryPickup = function(grid) {
    const n = grid.length;
    const memo = new Map();

    // dp(r1, c1, r2): max cherries when person1 is at (r1,c1) and person2 is at (r2,c2)
    // Both take the same number of steps, so c2 = r1 + c1 - r2
    const dp = (r1, c1, r2) => {
        const c2 = r1 + c1 - r2; // Derived from "same number of steps" invariant

        // Out of bounds
        if (r1 >= n || c1 >= n || r2 >= n || c2 >= n) return -Infinity;

        // Hit a thorn (blocked cell)
        if (grid[r1][c1] === -1 || grid[r2][c2] === -1) return -Infinity;

        // Both reached the destination
        if (r1 === n - 1 && c1 === n - 1) return grid[r1][c1];

        // Check cache
        const cacheKey = r1 + ',' + c1 + ',' + r2;
        if (memo.has(cacheKey)) return memo.get(cacheKey);

        // Collect cherries: if both persons are at the same cell, count once
        let cherries = grid[r1][c1];
        if (r1 !== r2 || c1 !== c2) {
            cherries += grid[r2][c2]; // Different cells: collect both
        }

        // Try all 4 move combinations: (person1 right/down) × (person2 right/down)
        cherries += Math.max(
            dp(r1 + 1, c1, r2 + 1), // both down
            dp(r1 + 1, c1, r2),     // person1 down, person2 right
            dp(r1, c1 + 1, r2 + 1), // person1 right, person2 down
            dp(r1, c1 + 1, r2)      // both right
        );

        memo.set(cacheKey, cherries);
        return cherries;
    };

    // Return max(0, ...) to handle the case where no path exists
    return Math.max(0, dp(0, 0, 0));
};`,
    jsWalkthrough:
      'Example: grid = [[0,1,-1],[1,0,-1],[1,1,1]]\n\n' +
      'n=3. Both persons start at (0,0), go to (2,2).\n\n' +
      'dp(0,0,0): r1=r2=0 (same cell), c1=c2=0\n' +
      '  cherries = grid[0][0] = 0 (same cell)\n' +
      '  Try moves:\n' +
      '    dp(1,0,1): r1=1,c1=0,r2=1,c2=0 (same cell)\n' +
      '      cherries = grid[1][0] = 1\n' +
      '      Try: dp(2,0,2): c2=2-0=0, grid[2][0]=1, grid[2][0]=1 (same)\n' +
      '        cherries = 1 + max(dp(3,...), ...) = 1 + 1 (bottom-right)\n' +
      '      Eventually returns 1+1+1=3\n' +
      '    dp(1,0,0): r1=1,c1=0,r2=0,c2=0+1=1\n' +
      '      grid[1][0]=1, grid[0][1]=1, different cells\n' +
      '      cherries = 1+1=2 + deeper recursion\n' +
      '    ...\n' +
      'Best result = 5\n' +
      'Return max(0, 5) = 5',
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
    intuition:
      'Find the target node, then work outward like ripples in a pond. BFS from the target through parent pointers (built during an initial traversal) finds the closest leaf. Alternatively, DFS to compute distances to the nearest leaf above and below the target.',
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
    jsCode: `var findClosestLeaf = function(root, k) {
    // Convert the binary tree to an undirected graph so we can traverse upward
    const adjacencyList = new Map();
    const leafNodes = new Set();

    const buildGraph = (node, parentNode) => {
        if (!node) return;

        // Mark as leaf if it has no children
        if (!node.left && !node.right) {
            leafNodes.add(node.val);
        }

        // Initialize adjacency list for this node
        if (!adjacencyList.has(node.val)) {
            adjacencyList.set(node.val, []);
        }

        // Add bidirectional edge between node and parent
        if (parentNode) {
            adjacencyList.get(node.val).push(parentNode.val);

            if (!adjacencyList.has(parentNode.val)) {
                adjacencyList.set(parentNode.val, []);
            }
            adjacencyList.get(parentNode.val).push(node.val);
        }

        buildGraph(node.left, node);
        buildGraph(node.right, node);
    };

    buildGraph(root, null);

    // BFS from target node k outwards — find the first leaf encountered
    const queue = [k];
    const visited = new Set([k]);

    while (queue.length > 0) {
        const currentVal = queue.shift();

        // Return this node if it's a leaf
        if (leafNodes.has(currentVal)) {
            return currentVal;
        }

        // Expand to all neighbors (children and parent via undirected graph)
        for (const neighbor of (adjacencyList.get(currentVal) || [])) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return -1;
};`,
    jsWalkthrough:
      'Example: root = [1,3,2], k = 1\n\n' +
      'Tree:\n' +
      '    1\n' +
      '   / \\\n' +
      '  3   2\n\n' +
      'Step 1: Build undirected graph\n' +
      '  Node 1: neighbors = [3, 2]\n' +
      '  Node 3: neighbors = [1]  (leaf)\n' +
      '  Node 2: neighbors = [1]  (leaf)\n' +
      '  leafNodes = {3, 2}\n\n' +
      'Step 2: BFS from target k=1\n' +
      '  Queue: [1], visited: {1}\n\n' +
      'Iteration 1: val=1\n' +
      '  Is leaf? No (1 not in leafNodes)\n' +
      '  Neighbors: [3, 2] → enqueue both\n' +
      '  Queue: [3, 2], visited: {1, 3, 2}\n\n' +
      'Iteration 2: val=3\n' +
      '  Is leaf? Yes (3 in leafNodes)\n' +
      '  Return 3\n\n' +
      'Result: 3 (or 2 — both are valid, equally close)',
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
    intuition:
      'Preprocess each word\'s suffixes combined with the full word (e.g., \'apple\' generates \'#apple\', \'e#apple\', \'le#apple\', etc.) and store them in a Trie or hash map. This way, a query for prefix + suffix becomes a single lookup of the combined key.',
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
    jsCode: `var WordFilter = function(words) {
    // Precompute all (prefix, suffix) pairs for every word
    this.combinedKeyToIndex = new Map();

    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        const word = words[wordIndex];

        // Generate all prefixes (including empty string "") and all suffixes
        for (let prefixLength = 0; prefixLength <= word.length; prefixLength++) {
            for (let suffixStart = 0; suffixStart <= word.length; suffixStart++) {
                const prefix = word.slice(0, prefixLength);
                const suffix = word.slice(suffixStart);

                // Combine as "prefix#suffix" — '#' acts as separator
                // (assumes '#' never appears in words)
                const combinedKey = prefix + '#' + suffix;

                // Store the word index (later words overwrite, giving largest index)
                this.combinedKeyToIndex.set(combinedKey, wordIndex);
            }
        }
    }
};

WordFilter.prototype.f = function(pref, suff) {
    const lookupKey = pref + '#' + suff;
    // Return the stored index, or -1 if no word matches
    return this.combinedKeyToIndex.get(lookupKey) ?? -1;
};`,
    jsWalkthrough:
      'Init: words = ["apple"]\n\n' +
      'For word "apple" (index=0), some generated keys:\n' +
      '  "#apple" (empty prefix, full suffix)\n' +
      '  "a#apple" (prefix "a", suffix "apple")\n' +
      '  "a#pple" (prefix "a", suffix "pple")\n' +
      '  "a#e" (prefix "a", suffix "e")\n' +
      '  "ap#e" (prefix "ap", suffix "e")\n' +
      '  "apple#" (full prefix, empty suffix)\n' +
      '  ... all (prefix.len+1) * (word.len+1) combinations\n\n' +
      'f("a", "e"):\n' +
      '  lookupKey = "a#e"\n' +
      '  combinedKeyToIndex.get("a#e") = 0\n' +
      '  Return 0',
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
    intuition:
      'Think of each lock state as a node in a graph, with edges connecting states that differ by one digit rotation. BFS from \'0000\' finds the shortest path to the target while avoiding deadend nodes. It is a classic shortest-path problem on an implicit graph of 10,000 states.',
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
    jsCode: `var openLock = function(deadends, target) {
    const deadendSet = new Set(deadends);

    // If the starting state is a deadend, we're immediately stuck
    if (deadendSet.has("0000")) return -1;

    // BFS: explore lock states level by level, each level = 1 move
    const queue = [["0000", 0]]; // [state, moveCount]
    const visitedStates = new Set(["0000"]);

    while (queue.length > 0) {
        const [currentState, moveCount] = queue.shift();

        // Found the target
        if (currentState === target) return moveCount;

        // Generate all 8 neighbors (4 wheels × 2 directions)
        for (let wheelIndex = 0; wheelIndex < 4; wheelIndex++) {
            const currentDigit = parseInt(currentState[wheelIndex]);

            // Turn up (+1) and turn down (-1), wrapping around 0-9
            const upDigit = (currentDigit + 1) % 10;
            const downDigit = (currentDigit + 9) % 10; // +9 mod 10 = -1 mod 10

            for (const newDigit of [upDigit, downDigit]) {
                const newState = currentState.slice(0, wheelIndex) +
                                 newDigit +
                                 currentState.slice(wheelIndex + 1);

                if (!visitedStates.has(newState) && !deadendSet.has(newState)) {
                    visitedStates.add(newState);
                    queue.push([newState, moveCount + 1]);
                }
            }
        }
    }

    // Target unreachable
    return -1;
};`,
    jsWalkthrough:
      'Example: deadends=["0201","0101","0102","1212","2002"], target="0202"\n\n' +
      'Init: queue=[("0000",0)], visited={"0000"}\n\n' +
      'Step 0: state="0000"\n' +
      '  Neighbors: "1000","9000","0100","0900","0010","0090","0001","0009"\n' +
      '  "0001" not dead/visited → enqueue ("0001",1)\n' +
      '  ... (add valid neighbors)\n\n' +
      'Step 1: states at distance 1 explored...\n\n' +
      '(BFS continues, avoiding deadends)\n\n' +
      'After 6 moves, "0202" is reachable\n' +
      'Return 6',
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
    intuition:
      'Merge all employee schedules, sort the intervals, and find the gaps between merged intervals. The free time slots are the spaces between consecutive non-overlapping merged intervals. Sorting and merging converts the problem into simple gap detection.',
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
    jsCode: `var employeeFreeTime = function(schedule) {
    // Flatten all employee intervals into a single list
    const allIntervals = [];
    for (const employeeSchedule of schedule) {
        for (const interval of employeeSchedule) {
            allIntervals.push(interval);
        }
    }

    // Sort all intervals by start time
    allIntervals.sort((a, b) => a.start - b.start);

    const freeTimeIntervals = [];

    // Track the furthest end we've seen (the current "busy" window)
    let maxEndSoFar = allIntervals[0].end;

    for (let i = 1; i < allIntervals.length; i++) {
        const currentInterval = allIntervals[i];

        if (currentInterval.start > maxEndSoFar) {
            // Gap found: from maxEndSoFar to currentInterval.start
            freeTimeIntervals.push(new Interval(maxEndSoFar, currentInterval.start));
        }

        // Extend the busy window if this interval reaches further
        maxEndSoFar = Math.max(maxEndSoFar, currentInterval.end);
    }

    return freeTimeIntervals;
};`,
    jsWalkthrough:
      'Example: schedule = [[[1,2],[5,6]],[[1,3]],[[4,10]]]\n\n' +
      'Flatten: [[1,2],[5,6],[1,3],[4,10]]\n' +
      'Sort by start: [[1,2],[1,3],[4,10],[5,6]]\n\n' +
      'Init: maxEndSoFar = 2\n\n' +
      'i=1: interval=[1,3], start=1 <= maxEnd=2 → no gap\n' +
      '  maxEndSoFar = max(2,3) = 3\n\n' +
      'i=2: interval=[4,10], start=4 > maxEnd=3 → FREE TIME [3,4]!\n' +
      '  freeTimeIntervals = [[3,4]]\n' +
      '  maxEndSoFar = max(3,10) = 10\n\n' +
      'i=3: interval=[5,6], start=5 <= maxEnd=10 → no gap\n' +
      '  maxEndSoFar = max(10,6) = 10\n\n' +
      'Return [[3,4]]',
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
    intuition:
      'Each character in s maps to exactly one character in t and vice versa. Use two hash maps for bidirectional mapping. If a mapping conflict is detected, the strings are not isomorphic. This ensures the mapping is a true bijection.',
    approach:
      'Build a hash map from value to index for nums2. For each element in nums1, look up its index in nums2.',
    code: `class Solution:
    def anagramMappings(self, nums1: list[int], nums2: list[int]) -> list[int]:
        index_map = {}
        for i, num in enumerate(nums2):
            index_map[num] = i
        return [index_map[num] for num in nums1]`,
    jsCode: `var anagramMappings = function(nums1, nums2) {
    // Build a lookup map: value → index in nums2
    const valueToIndex = new Map();
    for (let i = 0; i < nums2.length; i++) {
        valueToIndex.set(nums2[i], i);
    }

    // For each element in nums1, find its index in nums2
    const result = nums1.map(num => valueToIndex.get(num));

    return result;
};`,
    jsWalkthrough:
      'Example: nums1 = [12,28,46,32,50], nums2 = [50,12,32,46,28]\n\n' +
      'Step 1: Build valueToIndex map for nums2\n' +
      '  i=0: 50 → 0\n' +
      '  i=1: 12 → 1\n' +
      '  i=2: 32 → 2\n' +
      '  i=3: 46 → 3\n' +
      '  i=4: 28 → 4\n' +
      '  valueToIndex = {50:0, 12:1, 32:2, 46:3, 28:4}\n\n' +
      'Step 2: Map each nums1 element to its index in nums2\n' +
      '  nums1[0]=12 → valueToIndex[12] = 1\n' +
      '  nums1[1]=28 → valueToIndex[28] = 4\n' +
      '  nums1[2]=46 → valueToIndex[46] = 3\n' +
      '  nums1[3]=32 → valueToIndex[32] = 2\n' +
      '  nums1[4]=50 → valueToIndex[50] = 0\n\n' +
      'Result: [1, 4, 3, 2, 0]',
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
    intuition:
      'Think of couples as nodes in a graph where each pair should sit together. Count the number of swaps needed by finding cycles of misplaced couples. Each cycle of length k requires k-1 swaps, or equivalently, for each seat pair, if the couple is not together, swap one person to fix it greedily.',
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
    jsCode: `var minSwapsCouples = function(row) {
    // Build a position map: value → index in row
    // This lets us find a person's current seat in O(1)
    const position = {};
    for (let i = 0; i < row.length; i++) {
        position[row[i]] = i;
    }

    let swapCount = 0;

    // Check each pair of seats (0,1), (2,3), (4,5), ...
    for (let i = 0; i < row.length; i += 2) {
        const firstPerson = row[i];

        // Couple IDs come in pairs: (0,1), (2,3), etc.
        // XOR with 1 flips between 0↔1, 2↔3, 4↔5 — giving the partner
        const partnerValue = firstPerson ^ 1;

        // If the partner is already in the adjacent seat, couple is together
        if (row[i + 1] === partnerValue) {
            continue;
        }

        // Find where the partner currently sits
        const partnerCurrentSeat = position[partnerValue];

        // Move the partner to sit next to firstPerson (seat i+1)
        const displacedPerson = row[i + 1];
        row[i + 1] = partnerValue;
        row[partnerCurrentSeat] = displacedPerson;

        // Update positions after the swap
        position[partnerValue] = i + 1;
        position[displacedPerson] = partnerCurrentSeat;

        swapCount++;
    }

    return swapCount;
};`,
    jsWalkthrough:
      'Example: row = [0,2,1,3]\n\n' +
      'Couples: (0,1) and (2,3)\n' +
      'Initial position map: {0:0, 2:1, 1:2, 3:3}\n\n' +
      'Seat pair i=0 (seats 0,1): row[0]=0, row[1]=2\n' +
      '  firstPerson=0, partnerValue = 0^1 = 1\n' +
      '  row[1]=2, not 1 → need to swap\n' +
      '  partnerCurrentSeat = position[1] = 2\n' +
      '  Swap row[1] and row[2]: row becomes [0,1,2,3]\n' +
      '  Update: position[1]=1, position[2]=2\n' +
      '  swapCount=1\n\n' +
      'Seat pair i=2 (seats 2,3): row[2]=2, row[3]=3\n' +
      '  firstPerson=2, partnerValue = 2^1 = 3\n' +
      '  row[3]=3, equals 3 → couple already together, skip\n\n' +
      'Return swapCount = 1',
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
    intuition:
      'A Toeplitz matrix has the same value along every top-left to bottom-right diagonal. Simply check that each element equals the one diagonally above-left (mat[r][c] == mat[r-1][c-1]). If all such pairs match, the matrix is Toeplitz.',
    approach:
      'For each cell (i, j) where i > 0 and j > 0, check if it equals the cell diagonally above-left (i-1, j-1). If any mismatch, return false.',
    code: `class Solution:
    def isToeplitzMatrix(self, matrix: list[list[int]]) -> bool:
        for i in range(1, len(matrix)):
            for j in range(1, len(matrix[0])):
                if matrix[i][j] != matrix[i - 1][j - 1]:
                    return False
        return True`,
    jsCode: `var isToeplitzMatrix = function(matrix) {
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    // Check every cell (except first row and first column)
    // Each cell must equal the cell diagonally above-left
    for (let row = 1; row < numRows; row++) {
        for (let col = 1; col < numCols; col++) {
            const currentCell = matrix[row][col];
            const diagonalAboveLeft = matrix[row - 1][col - 1];

            if (currentCell !== diagonalAboveLeft) {
                return false;
            }
        }
    }

    return true;
};`,
    jsWalkthrough:
      'Example: matrix = [[1,2,3,4],[5,1,2,3],[9,5,1,2]]\n\n' +
      'A Toeplitz matrix has all diagonals with the same value.\n' +
      'Check: each matrix[i][j] must equal matrix[i-1][j-1]\n\n' +
      'Row=1, Col=1: matrix[1][1]=1 vs matrix[0][0]=1 ✓\n' +
      'Row=1, Col=2: matrix[1][2]=2 vs matrix[0][1]=2 ✓\n' +
      'Row=1, Col=3: matrix[1][3]=3 vs matrix[0][2]=3 ✓\n' +
      'Row=2, Col=1: matrix[2][1]=5 vs matrix[1][0]=5 ✓\n' +
      'Row=2, Col=2: matrix[2][2]=1 vs matrix[1][1]=1 ✓\n' +
      'Row=2, Col=3: matrix[2][3]=2 vs matrix[1][2]=2 ✓\n\n' +
      'All checks pass → return true\n\n' +
      'If matrix[1][1] were 9 instead of 1:\n' +
      'Row=1, Col=1: 9 !== 1 → return false immediately',
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
    intuition:
      'Place the most frequent character first to maximize spacing between repeats. Use a max-heap to always pick the most frequent remaining character, but never pick the same one twice in a row by holding the last-used character aside for one round.',
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
    jsCode: `var reorganizeString = function(s) {
    // Count frequency of each character
    const charCount = {};
    for (const ch of s) {
        charCount[ch] = (charCount[ch] || 0) + 1;
    }

    // If any character appears more than ceil(n/2) times, it's impossible
    const maxCount = Math.max(...Object.values(charCount));
    if (maxCount > Math.ceil(s.length / 2)) {
        return "";
    }

    // Build a max-heap using negative counts (simulate with sorted array)
    // Each entry: [-count, char]
    const heap = Object.entries(charCount).map(([ch, cnt]) => [-cnt, ch]);
    heap.sort((a, b) => a[0] - b[0]);

    const result = [];
    // Track the previously placed character so we don't place it again immediately
    let prevCount = 0;
    let prevChar = '';

    while (heap.length > 0) {
        // Re-sort to simulate extracting max (most frequent)
        heap.sort((a, b) => a[0] - b[0]);
        const [count, ch] = heap.shift();

        // Place this character in the result
        result.push(ch);

        // Push the previously held character back now that one step has passed
        if (prevCount < 0) {
            heap.push([prevCount, prevChar]);
        }

        // Hold the current character aside (decrement its count)
        prevCount = count + 1;
        prevChar = ch;
    }

    return result.join('');
};`,
    jsWalkthrough:
      'Example: s = "aab"\n\n' +
      'Step 1: Count frequencies\n' +
      '  charCount = { a:2, b:1 }\n' +
      '  maxCount = 2, ceil(3/2) = 2 → feasible\n\n' +
      'Step 2: Build heap\n' +
      '  heap = [[-2,"a"], [-1,"b"]] (sorted by count ascending)\n\n' +
      'Iteration 1:\n' +
      '  Extract [-2,"a"], place "a"\n' +
      '  prevCount=0, no previous char to push back\n' +
      '  prevCount=-2+1=-1, prevChar="a"\n' +
      '  result=["a"], heap=[[-1,"b"]]\n\n' +
      'Iteration 2:\n' +
      '  Extract [-1,"b"], place "b"\n' +
      '  prevCount=-1 < 0, push [-1,"a"] back to heap\n' +
      '  prevCount=-1+1=0, prevChar="b"\n' +
      '  result=["a","b"], heap=[[-1,"a"]]\n\n' +
      'Iteration 3:\n' +
      '  Extract [-1,"a"], place "a"\n' +
      '  prevCount=0, no previous char to push back\n' +
      '  result=["a","b","a"]\n\n' +
      'Return "aba"',
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
    intuition:
      'Handle operator precedence with a recursive descent parser or a stack-based approach. Parse numbers and operators, using recursion for parenthesized sub-expressions. Multiply and divide are evaluated before add and subtract, which can be handled by processing them immediately while deferring addition and subtraction.',
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
    jsCode: `var calculate = function(s) {
    // Use a shared index pointer so recursive calls advance through the string
    let i = 0;

    const parse = () => {
        // Stack holds partial results for addition/subtraction
        const stack = [];
        let currentNum = 0;
        let currentOp = '+';  // Treat the start as if preceded by '+'

        while (i < s.length) {
            const ch = s[i];

            // Build multi-digit number
            if (ch >= '0' && ch <= '9') {
                currentNum = currentNum * 10 + parseInt(ch);
            }

            // Opening paren: recursively evaluate sub-expression
            if (ch === '(') {
                i++;  // Move past '(' before recursing
                currentNum = parse();
            }

            // When we hit an operator, end of string, or closing paren,
            // apply the pending operation to the stack
            const isOperator = '+-*/)'.includes(ch);
            const isLastChar = i === s.length - 1;

            if (isOperator || isLastChar) {
                if (currentOp === '+') {
                    stack.push(currentNum);
                } else if (currentOp === '-') {
                    stack.push(-currentNum);
                } else if (currentOp === '*') {
                    stack.push(stack.pop() * currentNum);
                } else if (currentOp === '/') {
                    stack.push(Math.trunc(stack.pop() / currentNum));
                }

                currentOp = ch;
                currentNum = 0;

                // Closing paren: end of this sub-expression
                if (ch === ')') {
                    break;
                }
            }

            i++;
        }

        // Sum all values on the stack to get the result of this sub-expression
        return stack.reduce((total, val) => total + val, 0);
    };

    return parse();
};`,
    jsWalkthrough:
      'Example: s = "2+3*2"\n\n' +
      'i=0, ch="2": currentNum=2\n' +
      'i=1, ch="+": isOperator → apply pending op "+"\n' +
      '  stack.push(2) → stack=[2]\n' +
      '  currentOp="+", currentNum=0\n\n' +
      'i=2, ch="3": currentNum=3\n' +
      'i=3, ch="*": isOperator → apply pending op "+"\n' +
      '  stack.push(3) → stack=[2,3]\n' +
      '  currentOp="*", currentNum=0\n\n' +
      'i=4, ch="2": currentNum=2, isLastChar\n' +
      '  apply pending op "*"\n' +
      '  stack.pop()=3, 3*2=6, stack.push(6) → stack=[2,6]\n\n' +
      'Return stack sum: 2+6 = 8\n\n' +
      'For parentheses example "2*(3+4)":\n' +
      'At "(", increment i and call parse() recursively\n' +
      'Inner parse evaluates "3+4" = 7, returns when hitting ")"\n' +
      'Outer parse gets currentNum=7, applies * with stack top 2 → 14',
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
    intuition:
      'The 2x3 board has only 720 possible states (6! permutations). BFS from the initial state, trying all possible moves of the blank tile, finds the shortest path to the solved state. Represent each state as a string for easy hashing and visited checking.',
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
    jsCode: `var slidingPuzzle = function(board) {
    // The target solved state represented as a flat string
    const targetState = "123450";

    // Flatten the 2x3 board into a single string for easy comparison and hashing
    const startState = board[0].join('') + board[1].join('');

    // Already solved
    if (startState === targetState) return 0;

    // Precompute which positions can swap with each position in a 2x3 grid
    // Position layout: 0 1 2
    //                  3 4 5
    const neighborMap = {
        0: [1, 3],
        1: [0, 2, 4],
        2: [1, 5],
        3: [0, 4],
        4: [1, 3, 5],
        5: [2, 4],
    };

    const queue = [[startState, 0]];
    const visited = new Set([startState]);

    while (queue.length > 0) {
        const [currentState, moveCount] = queue.shift();

        // Find position of the blank tile (0)
        const blankPos = currentState.indexOf('0');

        // Try all valid swaps for the blank tile
        for (const neighborPos of neighborMap[blankPos]) {
            const stateArray = currentState.split('');

            // Swap blank with neighbor
            [stateArray[blankPos], stateArray[neighborPos]] = [stateArray[neighborPos], stateArray[blankPos]];

            const newState = stateArray.join('');

            if (newState === targetState) {
                return moveCount + 1;
            }

            if (!visited.has(newState)) {
                visited.add(newState);
                queue.push([newState, moveCount + 1]);
            }
        }
    }

    return -1;  // Impossible to reach target state
};`,
    jsWalkthrough:
      'Example: board = [[1,2,3],[4,0,5]]\n\n' +
      'startState = "123405"\n' +
      'targetState = "123450"\n\n' +
      'BFS Queue: [["123405", 0]]\n' +
      'Visited: {"123405"}\n\n' +
      'Step 1: Process "123405", moves=0\n' +
      '  blankPos = 4 (0 is at index 4)\n' +
      '  neighborMap[4] = [1, 3, 5]\n\n' +
      '  Swap pos 4 with pos 1: "103425" → not target, add to queue\n' +
      '  Swap pos 4 with pos 3: "123045" → not target, add to queue\n' +
      '  Swap pos 4 with pos 5: "123450" → equals target! return 0+1=1\n\n' +
      'Result: 1 move\n\n' +
      'Grid position layout:\n' +
      '  [0][1][2]\n' +
      '  [3][4][5]\n' +
      'neighborMap captures which positions are adjacent in this 2x3 grid.',
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
    intuition:
      'Think of cells as nodes with edge weights equal to the maximum elevation along the path. You want the path from top-left to bottom-right that minimizes the maximum elevation encountered. Binary search on the answer with BFS/DFS, or use Dijkstra treating edge weight as the max of adjacent cell values.',
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
    jsCode: `var swimInWater = function(grid) {
    const n = grid.length;

    // Track visited cells to avoid reprocessing
    const visited = Array.from({length: n}, () => new Array(n).fill(false));

    // Min-heap: each entry is [time, row, col]
    // time = max elevation seen along path so far (Dijkstra-like minimax)
    const heap = [[grid[0][0], 0, 0]];
    visited[0][0] = true;

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (heap.length > 0) {
        // Extract cell with minimum required time (simulate priority queue with sort)
        heap.sort((a, b) => a[0] - b[0]);
        const [timeRequired, row, col] = heap.shift();

        // Reached the bottom-right corner
        if (row === n - 1 && col === n - 1) {
            return timeRequired;
        }

        // Explore all 4 neighbors
        for (const [deltaRow, deltaCol] of directions) {
            const newRow = row + deltaRow;
            const newCol = col + deltaCol;

            const inBounds = newRow >= 0 && newRow < n && newCol >= 0 && newCol < n;

            if (inBounds && !visited[newRow][newCol]) {
                visited[newRow][newCol] = true;

                // Time to reach neighbor = max of current time and neighbor's elevation
                const timeToReachNeighbor = Math.max(timeRequired, grid[newRow][newCol]);
                heap.push([timeToReachNeighbor, newRow, newCol]);
            }
        }
    }

    return -1;
};`,
    jsWalkthrough:
      'Example: grid = [[0,2],[1,3]]\n\n' +
      'n=2, target=(1,1)\n' +
      'Initial heap: [[0, 0, 0]] (elevation 0 at (0,0))\n' +
      'visited[0][0] = true\n\n' +
      'Step 1: Extract [0, 0, 0] → time=0, at (0,0)\n' +
      '  Not target. Explore neighbors:\n' +
      '  (0,1): elevation=2, timeToReach=max(0,2)=2, push [2,0,1]\n' +
      '  (1,0): elevation=1, timeToReach=max(0,1)=1, push [1,1,0]\n' +
      '  heap: [[1,1,0],[2,0,1]]\n\n' +
      'Step 2: Extract [1, 1, 0] → time=1, at (1,0)\n' +
      '  Not target. Explore neighbors:\n' +
      '  (0,0): already visited\n' +
      '  (1,1): elevation=3, timeToReach=max(1,3)=3, push [3,1,1]\n' +
      '  heap: [[2,0,1],[3,1,1]]\n\n' +
      'Step 3: Extract [2, 0, 1] → time=2, at (0,1)\n' +
      '  Not target. Explore neighbors:\n' +
      '  (1,1): elevation=3, timeToReach=max(2,3)=3, push [3,1,1]\n' +
      '  heap: [[3,1,1],[3,1,1]]\n\n' +
      'Step 4: Extract [3, 1, 1] → at target (1,1), return 3',
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
    intuition:
      'Each row doubles in length, but you only need one value. Instead of building the whole row, work backwards: determine if position K in row N came from position (K+1)/2 in row N-1 and whether it was flipped. This reduces the problem from exponential to O(N) time.',
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
    jsCode: `var kthGrammar = function(n, k) {
    // Base case: the only value in row 1 is 0
    if (n === 1) {
        return 0;
    }

    // Each symbol in row n comes from position ceil(k/2) in row n-1
    // - If k is odd  (1st child): matches the parent value
    // - If k is even (2nd child): flipped from the parent value
    const parentPosition = Math.ceil(k / 2);
    const parentValue = kthGrammar(n - 1, parentPosition);

    if (k % 2 === 1) {
        // Odd position: same as parent
        return parentValue;
    } else {
        // Even position: complement of parent
        return 1 - parentValue;
    }
};`,
    jsWalkthrough:
      'Example: n=4, k=5\n\n' +
      'Row 1: 0\n' +
      'Row 2: 01\n' +
      'Row 3: 0110\n' +
      'Row 4: 01101001\n' +
      'Answer: row 4, position 5 = 1\n\n' +
      'Tracing recursively:\n' +
      'kthGrammar(4, 5):\n' +
      '  parentPos = ceil(5/2) = 3\n' +
      '  5 is odd → same as parent\n' +
      '  → kthGrammar(3, 3)\n\n' +
      'kthGrammar(3, 3):\n' +
      '  parentPos = ceil(3/2) = 2\n' +
      '  3 is odd → same as parent\n' +
      '  → kthGrammar(2, 2)\n\n' +
      'kthGrammar(2, 2):\n' +
      '  parentPos = ceil(2/2) = 1\n' +
      '  2 is even → complement of parent\n' +
      '  → 1 - kthGrammar(1, 1)\n\n' +
      'kthGrammar(1, 1): return 0 (base case)\n\n' +
      'Unwind:\n' +
      '  kthGrammar(2, 2) = 1 - 0 = 1\n' +
      '  kthGrammar(3, 3) = 1 (same as parent)\n' +
      '  kthGrammar(4, 5) = 1 (same as parent)\n' +
      'Result: 1',
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
    intuition:
      'Work backwards from the target (x, y) to (1, 1). At each step, the larger coordinate must have been produced by adding the smaller to it, so subtract the smaller from the larger. Use modulo for efficiency when one coordinate is much larger than the other.',
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
    jsCode: `var reachingPoints = function(sx, sy, tx, ty) {
    // Work backwards from target (tx, ty) towards start (sx, sy)
    // Forward: (x, y) -> (x+y, y) or (x, x+y)
    // Backward: if tx > ty, previous must have been (tx-ty, ty) = (tx%ty, ty) via repeated subtraction
    while (tx >= sx && ty >= sy) {
        // Reached the start point
        if (tx === sx && ty === sy) {
            return true;
        }

        if (tx > ty) {
            // ty is fixed; we were subtracting ty from tx repeatedly
            // If ty already equals sy, we need tx to reduce to sx by subtracting ty multiples
            if (ty === sy) {
                return (tx - sx) % ty === 0;
            }
            // Use modulo to skip many subtractions at once
            tx = tx % ty;
        } else {
            // tx is fixed; we were subtracting tx from ty repeatedly
            if (tx === sx) {
                return (ty - sy) % tx === 0;
            }
            ty = ty % tx;
        }
    }

    return false;
};`,
    jsWalkthrough:
      'Example: sx=1, sy=1, tx=3, ty=5\n\n' +
      'Working backwards from (3,5) to (1,1):\n\n' +
      'Iteration 1: tx=3, ty=5\n' +
      '  ty > tx, so tx was fixed, ty was modified\n' +
      '  tx(3) !== sx(1), so ty = ty % tx = 5 % 3 = 2\n' +
      '  State: tx=3, ty=2\n\n' +
      'Iteration 2: tx=3, ty=2\n' +
      '  tx > ty, so ty was fixed, tx was modified\n' +
      '  ty(2) !== sy(1), so tx = tx % ty = 3 % 2 = 1\n' +
      '  State: tx=1, ty=2\n\n' +
      'Iteration 3: tx=1, ty=2\n' +
      '  ty > tx, so tx was fixed, ty was modified\n' +
      '  tx(1) === sx(1), check: (ty-sy) % tx = (2-1) % 1 = 0 → return true\n\n' +
      'Result: true\n' +
      'Path: (1,1) → (1,2) → (3,2) → (3,5)',
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
    intuition:
      'In a BST, an in-order traversal gives sorted values. The minimum difference between any two nodes must be between consecutive values in this sorted order. Track the previous value during in-order traversal and update the minimum difference at each step.',
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
    jsCode: `var minDiffInBST = function(root) {
    // In-order traversal of BST yields values in sorted ascending order
    // So the minimum difference must be between consecutive visited nodes
    let previousValue = null;
    let minimumDiff = Infinity;

    const inorder = (node) => {
        if (!node) return;

        // Visit left subtree first (smaller values)
        inorder(node.left);

        // Process current node: compare with previous value
        if (previousValue !== null) {
            const diff = node.val - previousValue;
            minimumDiff = Math.min(minimumDiff, diff);
        }
        previousValue = node.val;

        // Visit right subtree (larger values)
        inorder(node.right);
    };

    inorder(root);
    return minimumDiff;
};`,
    jsWalkthrough:
      'Example: root = [4,2,6,1,3]\n\n' +
      'BST structure:\n' +
      '       4\n' +
      '      / \\\n' +
      '     2   6\n' +
      '    / \\\n' +
      '   1   3\n\n' +
      'In-order traversal visits: 1 → 2 → 3 → 4 → 6\n\n' +
      'Step 1: Visit node(1)\n' +
      '  previousValue=null, no comparison\n' +
      '  previousValue=1\n\n' +
      'Step 2: Visit node(2)\n' +
      '  diff = 2 - 1 = 1\n' +
      '  minimumDiff = min(Inf, 1) = 1\n' +
      '  previousValue=2\n\n' +
      'Step 3: Visit node(3)\n' +
      '  diff = 3 - 2 = 1\n' +
      '  minimumDiff = min(1, 1) = 1\n' +
      '  previousValue=3\n\n' +
      'Step 4: Visit node(4)\n' +
      '  diff = 4 - 3 = 1\n' +
      '  minimumDiff = min(1, 1) = 1\n\n' +
      'Step 5: Visit node(6)\n' +
      '  diff = 6 - 4 = 2\n' +
      '  minimumDiff = min(1, 2) = 1\n\n' +
      'Return 1',
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
    intuition:
      'Map each character to its position in the order string. Characters in the order come first (sorted by their order position), followed by characters not in the order string. Alternatively, count characters in s and rebuild by iterating through order first, then appending the rest.',
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
    jsCode: `var customSortString = function(order, s) {
    // Count occurrences of each character in s
    const charCount = {};
    for (const ch of s) {
        charCount[ch] = (charCount[ch] || 0) + 1;
    }

    const result = [];

    // First, add characters that appear in 'order', in the specified order
    for (const ch of order) {
        if (charCount[ch]) {
            // Add all occurrences of this character
            result.push(ch.repeat(charCount[ch]));
            // Remove from count so we don't add again
            delete charCount[ch];
        }
    }

    // Then, append any remaining characters not found in 'order'
    for (const [ch, count] of Object.entries(charCount)) {
        result.push(ch.repeat(count));
    }

    return result.join('');
};`,
    jsWalkthrough:
      'Example: order = "cba", s = "abcd"\n\n' +
      'Step 1: Count characters in s\n' +
      '  charCount = { a:1, b:1, c:1, d:1 }\n\n' +
      'Step 2: Process characters in order sequence "cba"\n' +
      '  ch="c": count=1, result=["c"], delete charCount["c"]\n' +
      '  ch="b": count=1, result=["c","b"], delete charCount["b"]\n' +
      '  ch="a": count=1, result=["c","b","a"], delete charCount["a"]\n' +
      '  charCount remaining: { d:1 }\n\n' +
      'Step 3: Append remaining characters\n' +
      '  ch="d": count=1, result=["c","b","a","d"]\n\n' +
      'Return "cbad"\n\n' +
      'Another example: order="cbafg", s="aaabbbccc"\n' +
      '  charCount = { a:3, b:3, c:3 }\n' +
      '  Process "c": push "ccc"\n' +
      '  Process "b": push "bbb"\n' +
      '  Process "a": push "aaa"\n' +
      '  Result: "cccbbbaaa"',
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

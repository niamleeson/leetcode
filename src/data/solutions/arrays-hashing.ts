import { ProblemSolution } from './types';

export const solutions: ProblemSolution[] = [
  // ---------------------------------------------------------------------------
  // 1. Two Sum
  // ---------------------------------------------------------------------------
  {
    id: 1,
    description:
      'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. Each input has exactly one solution, and you may not use the same element twice.',
    examples:
      'Input: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9',
    intuition:
      'Think of it like looking up a word in a dictionary - instead of scanning every page (brute force), you can jump directly to the right page. For each number, you already know exactly what partner it needs (target minus itself). A hash map lets you instantly check if that partner has already appeared, turning a quadratic search into a linear one.',
    approach:
      'Use a hash map to store each number and its index as you iterate. For every number, check if (target - num) already exists in the map. This gives an O(n) single-pass solution.',
    code: `def twoSum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}  # value -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    jsCode: `var twoSum = function(nums, target) {
    // Map to remember each number and where we saw it
    const seen = new Map();

    for (let i = 0; i < nums.length; i++) {
        const currentNum = nums[i];
        const complement = target - currentNum;

        // Check if the partner number was already seen
        if (seen.has(complement)) {
            const partnerIndex = seen.get(complement);
            return [partnerIndex, i];
        }

        // Remember this number and its index for later
        seen.set(currentNum, i);
    }

    return [];
};`,
    jsWalkthrough:
      'nums = [2, 7, 11, 15], target = 9\n\n' +
      'i=0: currentNum=2, complement=9-2=7\n' +
      '     seen has 7? No\n' +
      '     seen: {2 → 0}\n\n' +
      'i=1: currentNum=7, complement=9-7=2\n' +
      '     seen has 2? Yes! at index 0\n' +
      '     return [0, 1]',
    explanation:
      '1. We maintain a dictionary "seen" that maps each number to its index.\n' +
      '2. For each number, we compute complement = target - num.\n' +
      '3. If complement is already in the dictionary, we found our pair and return both indices.\n' +
      '4. Otherwise, we record the current number and its index for future lookups.\n' +
      '5. The hash map lookup is O(1), so the entire traversal is O(n).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'A brute-force approach checks every pair in O(n^2). Can you do better with extra space?',
      'Think about what value you need to find for each element. Can a hash map help you look it up instantly?',
      'Store each number as you go; when you reach a new number, check if its complement is already stored.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 49. Group Anagrams
  // ---------------------------------------------------------------------------
  {
    id: 49,
    description:
      'Given an array of strings, group the anagrams together. An anagram is a word formed by rearranging the letters of another word using all original letters exactly once. You can return the answer in any order.',
    examples:
      'Input: strs = ["eat","tea","tan","ate","nat","bat"]\nOutput: [["bat"],["nat","tan"],["ate","eat","tea"]]',
    intuition:
      'Anagrams are words with the same letters jumbled up. If you sort the letters of any anagram, they all become the same string - for example, "eat", "tea", and "ate" all become "aet". This sorted form acts like a fingerprint: words with the same fingerprint belong in the same group, and a hash map lets you collect them efficiently.',
    approach:
      'Two strings are anagrams if and only if their sorted characters are identical. Use the sorted string as a hash map key to group all anagrams together.',
    code: `from collections import defaultdict

def groupAnagrams(strs: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = defaultdict(list)
    for s in strs:
        key = "".join(sorted(s))
        groups[key].append(s)
    return list(groups.values())`,
    jsCode: `var groupAnagrams = function(strs) {
    const groups = new Map();

    for (const word of strs) {
        // Sort the letters to create a key that all anagrams share
        const letters = word.split('');
        letters.sort();
        const key = letters.join('');

        // Add this word to its anagram group
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(word);
    }

    // Collect all the groups into an array
    const result = Array.from(groups.values());
    return result;
};`,
    jsWalkthrough:
      'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]\n\n' +
      'word="eat": sorted="aet"  → groups: {"aet": ["eat"]}\n' +
      'word="tea": sorted="aet"  → groups: {"aet": ["eat","tea"]}\n' +
      'word="tan": sorted="ant"  → groups: {"aet": ["eat","tea"], "ant": ["tan"]}\n' +
      'word="ate": sorted="aet"  → groups: {"aet": ["eat","tea","ate"], "ant": ["tan"]}\n' +
      'word="nat": sorted="ant"  → groups: {..., "ant": ["tan","nat"]}\n' +
      'word="bat": sorted="abt"  → groups: {..., "abt": ["bat"]}\n\n' +
      'result: [["eat","tea","ate"], ["tan","nat"], ["bat"]]',
    explanation:
      '1. We create a defaultdict of lists so that missing keys auto-initialize to an empty list.\n' +
      '2. For each string, we sort its characters and join them back into a canonical key.\n' +
      '3. Strings that are anagrams produce the same sorted key, so they land in the same bucket.\n' +
      '4. Finally, we return all the grouped lists.',
    timeComplexity: 'O(n * k log k) where n is the number of strings and k is the maximum string length',
    spaceComplexity: 'O(n * k)',
    hints: [
      'What property do all anagrams share? Think about letter frequencies or sorted order.',
      'If you sort each string, anagrams become identical. Use that sorted form as a dictionary key.',
      'Alternatively, use a tuple of 26 character counts as the key to avoid sorting.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 128. Longest Consecutive Sequence
  // ---------------------------------------------------------------------------
  {
    id: 128,
    description:
      'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. The algorithm must run in O(n) time.',
    examples:
      'Input: nums = [100, 4, 200, 1, 3, 2]\nOutput: 4\nExplanation: The longest consecutive sequence is [1, 2, 3, 4].',
    intuition:
      'Imagine laying out all numbers on a number line. You want to find the longest unbroken chain. The key insight is: only start counting from the beginning of a chain. A number is the start of a chain if the number right before it (num - 1) does not exist. By using a set for O(1) lookups, you avoid redundant work and keep the solution linear.',
    approach:
      'Put all numbers in a set. For each number, only start counting a sequence if num-1 is NOT in the set (meaning this number is the start of a sequence). Then count upward while consecutive numbers exist.',
    code: `def longestConsecutive(nums: list[int]) -> int:
    num_set = set(nums)
    longest = 0

    for num in num_set:
        if num - 1 not in num_set:  # start of a sequence
            length = 1
            while num + length in num_set:
                length += 1
            longest = max(longest, length)

    return longest`,
    jsCode: `var longestConsecutive = function(nums) {
    const numSet = new Set(nums);
    let longest = 0;

    for (const num of numSet) {
        // Only start counting if this is the beginning of a sequence
        const hasPrevious = numSet.has(num - 1);
        if (hasPrevious) continue;

        // Count how long this sequence goes
        let length = 1;
        let next = num + 1;
        while (numSet.has(next)) {
            length++;
            next++;
        }

        // Update the longest sequence found
        if (length > longest) {
            longest = length;
        }
    }

    return longest;
};`,
    jsWalkthrough:
      'nums = [100, 4, 200, 1, 3, 2]\n' +
      'numSet = {100, 4, 200, 1, 3, 2}\n\n' +
      'num=100: has 99? No → start of sequence\n' +
      '         has 101? No → length=1\n\n' +
      'num=4:   has 3? Yes → skip (not start of sequence)\n\n' +
      'num=200: has 199? No → start of sequence\n' +
      '         has 201? No → length=1\n\n' +
      'num=1:   has 0? No → start of sequence\n' +
      '         has 2? Yes → length=2\n' +
      '         has 3? Yes → length=3\n' +
      '         has 4? Yes → length=4\n' +
      '         has 5? No  → length=4 ← new longest!\n\n' +
      'num=3:   has 2? Yes → skip\n' +
      'num=2:   has 1? Yes → skip\n\n' +
      'return 4',
    explanation:
      '1. Convert nums to a set for O(1) lookups.\n' +
      '2. For each number, check if (num - 1) exists. If it does, this number is not the start of a sequence -- skip it.\n' +
      '3. If (num - 1) does NOT exist, this is the beginning of a new sequence. Count upward (num+1, num+2, ...) while the next value is in the set.\n' +
      '4. Track the maximum sequence length found.\n' +
      '5. Each number is visited at most twice (once in the outer loop, once in the while loop), so total work is O(n).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Sorting would give O(n log n). To achieve O(n), think about using a set.',
      'You only want to start counting from the beginning of a sequence. How can you tell if a number is the start?',
      'A number is the start of a sequence if (num - 1) is not in the set.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 217. Contains Duplicate
  // ---------------------------------------------------------------------------
  {
    id: 217,
    description:
      'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    examples:
      'Input: nums = [1, 2, 3, 1]\nOutput: true\nExplanation: The element 1 appears twice.',
    intuition:
      'This is the most basic use of a set as a "memory." As you walk through the array, you ask one question for each number: "Have I seen you before?" A set answers that question in O(1) time. The moment you find a repeat, you are done.',
    approach:
      'Use a set to track numbers you have seen. As you iterate, if a number is already in the set, return true immediately. If you finish without finding a duplicate, return false.',
    code: `def containsDuplicate(nums: list[int]) -> bool:
    seen: set[int] = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False`,
    jsCode: `var containsDuplicate = function(nums) {
    const seen = new Set();

    for (const num of nums) {
        // If we already saw this number, it's a duplicate
        if (seen.has(num)) {
            return true;
        }

        // Remember this number
        seen.add(num);
    }

    // No duplicates found
    return false;
};`,
    jsWalkthrough:
      'nums = [1, 2, 3, 1]\n\n' +
      'num=1: seen has 1? No  → seen: {1}\n' +
      'num=2: seen has 2? No  → seen: {1, 2}\n' +
      'num=3: seen has 3? No  → seen: {1, 2, 3}\n' +
      'num=1: seen has 1? Yes → return true',
    explanation:
      '1. Initialize an empty set "seen".\n' +
      '2. For each number, check if it already exists in the set.\n' +
      '3. If yes, we found a duplicate -- return True immediately.\n' +
      '4. Otherwise, add the number to the set and continue.\n' +
      '5. If the loop completes, all elements are unique -- return False.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'A brute-force approach compares every pair in O(n^2). Can you do better?',
      'Think about a data structure that supports O(1) membership checks.',
      'A set lets you check "have I seen this before?" in constant time.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 242. Valid Anagram
  // ---------------------------------------------------------------------------
  {
    id: 242,
    description:
      'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram uses all the original letters exactly once.',
    examples:
      'Input: s = "anagram", t = "nagaram"\nOutput: true',
    intuition:
      'Two words are anagrams if they use the exact same letters the exact same number of times - like two bags of Scrabble tiles with identical contents. Instead of sorting and comparing, you can simply count how many of each letter each word has. If the tallies match, they are anagrams.',
    approach:
      'Count the frequency of each character in both strings and compare the counts. If they match, the strings are anagrams. Use a hash map or Counter for O(n) comparison.',
    code: `from collections import Counter

def isAnagram(s: str, t: str) -> bool:
    return Counter(s) == Counter(t)`,
    jsCode: `var isAnagram = function(s, t) {
    if (s.length !== t.length) {
        return false;
    }

    // Count frequency of each character in s
    const count = {};
    for (const ch of s) {
        const current = count[ch] || 0;
        count[ch] = current + 1;
    }

    // Subtract frequency for each character in t
    for (const ch of t) {
        if (!count[ch]) {
            return false;
        }
        count[ch] = count[ch] - 1;
    }

    return true;
};`,
    jsWalkthrough:
      's = "anagram", t = "nagaram"\n\n' +
      'Count characters in s:\n' +
      '  a:1 → a:2 → a:3 (for 3 a\'s)\n' +
      '  n:1, g:1, r:1, m:1\n' +
      '  count = {a:3, n:1, g:1, r:1, m:1}\n\n' +
      'Subtract characters in t:\n' +
      '  "n" → count[n]=0\n' +
      '  "a" → count[a]=2\n' +
      '  "g" → count[g]=0\n' +
      '  "a" → count[a]=1\n' +
      '  "r" → count[r]=0\n' +
      '  "a" → count[a]=0\n' +
      '  "m" → count[m]=0\n\n' +
      'All counts decremented without hitting 0 early → return true',
    explanation:
      '1. Counter(s) creates a dictionary of character frequencies for s.\n' +
      '2. Counter(t) does the same for t.\n' +
      '3. Comparing the two Counters checks that every character appears the same number of times in both strings.\n' +
      '4. If the lengths differ, the Counters will differ, so no separate length check is needed.',
    timeComplexity: 'O(n) where n is the length of the strings',
    spaceComplexity: 'O(1) since the character set is bounded (26 lowercase letters)',
    hints: [
      'What must be true about the character frequencies of two anagrams?',
      'You could sort both strings and compare, but that is O(n log n). Can you do O(n)?',
      'Count occurrences of each character in both strings and compare the counts.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 347. Top K Frequent Elements
  // ---------------------------------------------------------------------------
  {
    id: 347,
    description:
      'Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order. It is guaranteed that the answer is unique.',
    examples:
      'Input: nums = [1,1,1,2,2,3], k = 2\nOutput: [1, 2]\nExplanation: 1 appears 3 times and 2 appears 2 times.',
    intuition:
      'After counting frequencies, you need the top k. Sorting frequencies costs O(n log n), but notice that frequencies range from 1 to n. You can create an array of "buckets" where bucket i holds all numbers that appeared exactly i times. Then just walk backwards from the highest bucket to grab the most frequent elements. This is bucket sort applied to frequencies.',
    approach:
      'Use bucket sort: count frequencies, then create an array of buckets where index i holds all elements that appear i times. Iterate from the highest bucket downward to collect the top k elements. This runs in O(n) time.',
    code: `from collections import Counter

def topKFrequent(nums: list[int], k: int) -> list[int]:
    count = Counter(nums)
    # Bucket sort: index = frequency, value = list of nums with that frequency
    buckets: list[list[int]] = [[] for _ in range(len(nums) + 1)]
    for num, freq in count.items():
        buckets[freq].append(num)

    result: list[int] = []
    for freq in range(len(buckets) - 1, 0, -1):
        for num in buckets[freq]:
            result.append(num)
            if len(result) == k:
                return result
    return result`,
    jsCode: `var topKFrequent = function(nums, k) {
    // Step 1: Count how often each number appears
    const count = new Map();
    for (const num of nums) {
        const current = count.get(num) || 0;
        count.set(num, current + 1);
    }

    // Step 2: Create buckets where index = frequency
    // buckets[3] will hold all numbers that appeared 3 times
    const buckets = Array.from({ length: nums.length + 1 }, () => []);
    for (const [num, freq] of count) {
        buckets[freq].push(num);
    }

    // Step 3: Walk backwards from highest frequency bucket
    const result = [];
    for (let freq = buckets.length - 1; freq > 0; freq--) {
        for (const num of buckets[freq]) {
            result.push(num);
            if (result.length === k) {
                return result;
            }
        }
    }

    return result;
};`,
    jsWalkthrough:
      'nums = [1,1,1,2,2,3], k = 2\n\n' +
      'Step 1 — count frequencies:\n' +
      '  count = {1:3, 2:2, 3:1}\n\n' +
      'Step 2 — fill buckets (index = frequency):\n' +
      '  buckets[1] = [3]     (3 appeared 1 time)\n' +
      '  buckets[2] = [2]     (2 appeared 2 times)\n' +
      '  buckets[3] = [1]     (1 appeared 3 times)\n\n' +
      'Step 3 — walk backwards from highest:\n' +
      '  freq=6: empty\n' +
      '  freq=5: empty\n' +
      '  freq=4: empty\n' +
      '  freq=3: push 1 → result=[1]\n' +
      '  freq=2: push 2 → result=[1,2] → length===k, return!\n\n' +
      'return [1, 2]',
    explanation:
      '1. Count the frequency of each element using Counter.\n' +
      '2. Create buckets of size (n+1). Index i of this array stores all numbers whose frequency is exactly i.\n' +
      '3. The maximum possible frequency is n (all elements the same), so the array is big enough.\n' +
      '4. Walk backwards from the highest frequency bucket, collecting elements until we have k results.\n' +
      '5. This avoids sorting and runs in O(n) time.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'First, count the frequency of each number. Then you need the top k by frequency.',
      'A heap gives O(n log k). Can you do O(n)?',
      'Bucket sort by frequency: the maximum frequency is n, so create n+1 buckets and iterate from the top.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 238. Product of Array Except Self
  // ---------------------------------------------------------------------------
  {
    id: 238,
    description:
      'Given an integer array nums, return an array answer where answer[i] is equal to the product of all elements of nums except nums[i]. You must solve it without using division and in O(n) time.',
    examples:
      'Input: nums = [1, 2, 3, 4]\nOutput: [24, 12, 8, 6]\nExplanation: For index 1, the product of all elements except 2 is 1*3*4 = 12.',
    intuition:
      'For each position, the "product of everything except me" is really just (product of everything to my left) times (product of everything to my right). You can compute all left-products in one sweep and all right-products in another sweep. This decomposes a seemingly hard problem into two simple running-product passes.',
    approach:
      'Build the result in two passes. First pass (left to right) stores the running product of all elements to the left. Second pass (right to left) multiplies in the running product of all elements to the right.',
    code: `def productExceptSelf(nums: list[int]) -> list[int]:
    n = len(nums)
    answer = [1] * n

    # Left pass: answer[i] = product of nums[0..i-1]
    prefix = 1
    for i in range(n):
        answer[i] = prefix
        prefix *= nums[i]

    # Right pass: multiply by product of nums[i+1..n-1]
    suffix = 1
    for i in range(n - 1, -1, -1):
        answer[i] *= suffix
        suffix *= nums[i]

    return answer`,
    jsCode: `var productExceptSelf = function(nums) {
    const n = nums.length;
    const answer = new Array(n).fill(1);

    // Left pass: store the running product of everything to the left
    let prefix = 1;
    for (let i = 0; i < n; i++) {
        answer[i] = prefix;
        prefix = prefix * nums[i];
    }

    // Right pass: multiply in the running product of everything to the right
    let suffix = 1;
    for (let i = n - 1; i >= 0; i--) {
        answer[i] = answer[i] * suffix;
        suffix = suffix * nums[i];
    }

    return answer;
};`,
    jsWalkthrough:
      'nums = [1, 2, 3, 4]\n\n' +
      'Left pass (prefix products):\n' +
      '  i=0: answer[0]=1,       prefix=1*1=1\n' +
      '  i=1: answer[1]=1,       prefix=1*2=2\n' +
      '  i=2: answer[2]=2,       prefix=2*3=6\n' +
      '  i=3: answer[3]=6,       prefix=6*4=24\n' +
      '  answer = [1, 1, 2, 6]\n\n' +
      'Right pass (multiply in suffix products):\n' +
      '  i=3: answer[3]=6*1=6,   suffix=1*4=4\n' +
      '  i=2: answer[2]=2*4=8,   suffix=4*3=12\n' +
      '  i=1: answer[1]=1*12=12, suffix=12*2=24\n' +
      '  i=0: answer[0]=1*24=24, suffix=24*1=24\n\n' +
      'answer = [24, 12, 8, 6]',
    explanation:
      '1. Initialize answer array with all 1s.\n' +
      '2. Left pass: for each index i, answer[i] stores the product of all elements before i. We maintain a running "prefix" product.\n' +
      '3. Right pass: for each index i (going right to left), we multiply answer[i] by the product of all elements after i, maintained as a running "suffix" product.\n' +
      '4. After both passes, answer[i] = (product of left side) * (product of right side), which is the product of everything except nums[i].\n' +
      '5. No division is used, and the output array does not count as extra space per the problem statement.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) (the output array does not count as extra space)',
    hints: [
      'The product except self at index i = (product of everything to the left) * (product of everything to the right).',
      'Can you compute left products in one pass and right products in another?',
      'Use the output array itself to store prefix products, then multiply in suffix products in a second pass.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 36. Valid Sudoku
  // ---------------------------------------------------------------------------
  {
    id: 36,
    description:
      'Determine if a 9x9 Sudoku board is valid. Only the filled cells need to be validated: each row, each column, and each of the nine 3x3 sub-boxes must contain the digits 1-9 without repetition.',
    examples:
      'Input: board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]\nOutput: true',
    intuition:
      'Sudoku validation boils down to one rule: no duplicates in any row, column, or 3x3 box. Think of it as keeping three attendance sheets - one per row, one per column, and one per box. As you scan each cell, you check all three sheets. The only trick is mapping a cell to its box, which the formula (row/3)*3 + (col/3) handles neatly.',
    approach:
      'Use three collections of sets -- one for rows, one for columns, and one for 3x3 boxes. Iterate through every cell; if a digit is already in the corresponding row, column, or box set, the board is invalid.',
    code: `def isValidSudoku(board: list[list[str]]) -> bool:
    rows: list[set[str]] = [set() for _ in range(9)]
    cols: list[set[str]] = [set() for _ in range(9)]
    boxes: list[set[str]] = [set() for _ in range(9)]

    for r in range(9):
        for c in range(9):
            val = board[r][c]
            if val == ".":
                continue

            box_idx = (r // 3) * 3 + (c // 3)

            if val in rows[r] or val in cols[c] or val in boxes[box_idx]:
                return False

            rows[r].add(val)
            cols[c].add(val)
            boxes[box_idx].add(val)

    return True`,
    jsCode: `var isValidSudoku = function(board) {
    // One set per row, column, and 3x3 box to track seen digits
    const rows = Array.from({ length: 9 }, () => new Set());
    const cols = Array.from({ length: 9 }, () => new Set());
    const boxes = Array.from({ length: 9 }, () => new Set());

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = board[r][c];

            // Skip empty cells
            if (val === '.') {
                continue;
            }

            // Figure out which 3x3 box this cell belongs to
            const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);

            // Check if we already saw this digit in same row, col, or box
            const alreadySeen = rows[r].has(val) || cols[c].has(val) || boxes[boxIdx].has(val);
            if (alreadySeen) {
                return false;
            }

            // Record the digit in all three sets
            rows[r].add(val);
            cols[c].add(val);
            boxes[boxIdx].add(val);
        }
    }

    return true;
};`,
    jsWalkthrough:
      'Checking first few cells of a valid board:\n\n' +
      'r=0,c=0: val="5", boxIdx=0\n' +
      '  rows[0]={}, cols[0]={}, boxes[0]={}\n' +
      '  No duplicates → add "5" to all three\n\n' +
      'r=0,c=1: val="3", boxIdx=0\n' +
      '  rows[0]={"5"}, cols[1]={}, boxes[0]={"5"}\n' +
      '  No duplicates → add "3" to all three\n\n' +
      'r=0,c=2: val=".", skip\n\n' +
      'r=0,c=4: val="7", boxIdx=1\n' +
      '  rows[0]={"5","3"}, cols[4]={}, boxes[1]={}\n' +
      '  No duplicates → add "7" to all three\n\n' +
      'Box index formula: (r/3)*3 + (c/3)\n' +
      '  (0,0)→box 0  (0,4)→box 1  (0,7)→box 2\n' +
      '  (3,0)→box 3  (4,4)→box 4  (5,7)→box 5\n' +
      '  (6,0)→box 6  (7,4)→box 7  (8,8)→box 8',
    explanation:
      '1. Create 9 sets each for rows, columns, and 3x3 boxes.\n' +
      '2. For each cell, skip if it is "." (empty).\n' +
      '3. Compute the box index using (r // 3) * 3 + (c // 3). This maps each cell to one of 9 boxes numbered 0-8.\n' +
      '4. If the digit already exists in the corresponding row set, column set, or box set, return False.\n' +
      '5. Otherwise, add the digit to all three sets and continue.',
    timeComplexity: 'O(1) (the board is always 9x9, so 81 cells)',
    spaceComplexity: 'O(1) (at most 81 entries across all sets)',
    hints: [
      'You need to check three constraints: rows, columns, and 3x3 boxes.',
      'Use sets to track which digits have been seen in each row, column, and box.',
      'The tricky part is mapping (row, col) to the correct 3x3 box. Use (row // 3) * 3 + (col // 3).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 560. Subarray Sum Equals K
  // ---------------------------------------------------------------------------
  {
    id: 560,
    description:
      'Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals k. A subarray is a contiguous non-empty sequence of elements.',
    examples:
      'Input: nums = [1, 1, 1], k = 2\nOutput: 2\nExplanation: The subarrays [1,1] starting at index 0 and [1,1] starting at index 1 both sum to 2.',
    intuition:
      'The sum of any subarray can be expressed as the difference of two prefix sums. If prefix[j] - prefix[i] = k, then the subarray between i and j sums to k. So the question becomes: for each prefix sum, how many earlier prefix sums equal (current - k)? A hash map counting prefix sums seen so far answers this instantly.',
    approach:
      'Use a prefix sum with a hash map. The sum of subarray [i+1..j] equals prefix[j] - prefix[i]. So for each prefix sum, count how many previous prefix sums equal (current_prefix - k).',
    code: `from collections import defaultdict

def subarraySum(nums: list[int], k: int) -> int:
    prefix_counts: dict[int, int] = defaultdict(int)
    prefix_counts[0] = 1  # empty prefix
    current_sum = 0
    count = 0

    for num in nums:
        current_sum += num
        count += prefix_counts[current_sum - k]
        prefix_counts[current_sum] += 1

    return count`,
    jsCode: `var subarraySum = function(nums, k) {
    // Map: prefix sum → how many times we've seen it
    const prefixCounts = new Map();
    prefixCounts.set(0, 1);  // empty prefix has sum 0

    let currentSum = 0;
    let count = 0;

    for (const num of nums) {
        // Add current number to running sum
        currentSum = currentSum + num;

        // How many earlier prefix sums equal (currentSum - k)?
        // Each one marks the start of a subarray that sums to k
        const target = currentSum - k;
        const matches = prefixCounts.get(target) || 0;
        count = count + matches;

        // Record this prefix sum
        const existing = prefixCounts.get(currentSum) || 0;
        prefixCounts.set(currentSum, existing + 1);
    }

    return count;
};`,
    jsWalkthrough:
      'nums = [1, 1, 1], k = 2\n' +
      'prefixCounts = {0: 1}\n\n' +
      'num=1: currentSum=1, target=1-2=-1\n' +
      '       prefixCounts has -1? No → matches=0\n' +
      '       count=0, prefixCounts={0:1, 1:1}\n\n' +
      'num=1: currentSum=2, target=2-2=0\n' +
      '       prefixCounts has 0? Yes, 1 time → matches=1\n' +
      '       count=1, prefixCounts={0:1, 1:1, 2:1}\n' +
      '       (subarray [1,1] from index 0-1)\n\n' +
      'num=1: currentSum=3, target=3-2=1\n' +
      '       prefixCounts has 1? Yes, 1 time → matches=1\n' +
      '       count=2, prefixCounts={0:1, 1:1, 2:1, 3:1}\n' +
      '       (subarray [1,1] from index 1-2)\n\n' +
      'return 2',
    explanation:
      '1. prefix_counts maps each prefix sum to how many times it has occurred.\n' +
      '2. We initialize prefix_counts[0] = 1 because an empty prefix has sum 0 (this handles subarrays starting at index 0).\n' +
      '3. For each element, add it to current_sum (the running prefix sum).\n' +
      '4. If current_sum - k was seen before as a prefix sum, then the subarray between that earlier prefix and now sums to k. Add that count.\n' +
      '5. Record the current prefix sum in the map for future lookups.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'A brute-force approach checks all subarrays in O(n^2). Can prefix sums help?',
      'The sum of subarray [i..j] = prefix[j] - prefix[i-1]. If that equals k, then prefix[i-1] = prefix[j] - k.',
      'Use a hash map to count occurrences of each prefix sum so you can instantly look up how many valid starting points exist.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 380. Insert Delete GetRandom O(1)
  // ---------------------------------------------------------------------------
  {
    id: 380,
    description:
      'Implement the RandomizedSet class that supports insert, remove, and getRandom, each in average O(1) time. insert(val) inserts val if not present. remove(val) removes val if present. getRandom() returns a random element with equal probability.',
    examples:
      'Input: ["RandomizedSet","insert","insert","getRandom","remove","insert","getRandom"]\n[[], [1], [2], [], [1], [2], []]\nOutput: [null, true, true, 1 or 2, true, false, 2]',
    intuition:
      'No single data structure gives you O(1) insert, delete, and random access. But you can combine two: a list gives O(1) random access by index, and a hash map gives O(1) lookup by value. The clever trick for O(1) deletion is to swap the element to remove with the last element, then pop the end of the list - avoiding the costly shift of elements.',
    approach:
      'Combine a list (for O(1) random access by index) with a hash map (value -> index for O(1) lookup). On removal, swap the target with the last element so you can pop from the end in O(1).',
    code: `import random

class RandomizedSet:
    def __init__(self) -> None:
        self.vals: list[int] = []
        self.val_to_idx: dict[int, int] = {}

    def insert(self, val: int) -> bool:
        if val in self.val_to_idx:
            return False
        self.val_to_idx[val] = len(self.vals)
        self.vals.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.val_to_idx:
            return False
        idx = self.val_to_idx[val]
        last = self.vals[-1]
        # Move the last element into the removed slot
        self.vals[idx] = last
        self.val_to_idx[last] = idx
        # Remove the last element
        self.vals.pop()
        del self.val_to_idx[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.vals)`,
    jsCode: `var RandomizedSet = function() {
    this.vals = [];           // stores the actual values
    this.valToIdx = new Map(); // maps value → its index in vals
};

RandomizedSet.prototype.insert = function(val) {
    // Already exists, don't insert
    if (this.valToIdx.has(val)) {
        return false;
    }

    // Add to end of array, record its index
    const newIndex = this.vals.length;
    this.valToIdx.set(val, newIndex);
    this.vals.push(val);
    return true;
};

RandomizedSet.prototype.remove = function(val) {
    // Doesn't exist, can't remove
    if (!this.valToIdx.has(val)) {
        return false;
    }

    // Swap the value with the last element, then pop
    const idx = this.valToIdx.get(val);
    const lastVal = this.vals[this.vals.length - 1];

    // Move last element into the gap
    this.vals[idx] = lastVal;
    this.valToIdx.set(lastVal, idx);

    // Remove the last element (which is now the old val)
    this.vals.pop();
    this.valToIdx.delete(val);
    return true;
};

RandomizedSet.prototype.getRandom = function() {
    const randomIdx = Math.floor(Math.random() * this.vals.length);
    return this.vals[randomIdx];
};`,
    jsWalkthrough:
      'insert(1): vals=[1],     map={1→0}\n' +
      'insert(2): vals=[1,2],   map={1→0, 2→1}\n' +
      'insert(3): vals=[1,2,3], map={1→0, 2→1, 3→2}\n\n' +
      'remove(2):\n' +
      '  idx of 2 = 1, lastVal = 3\n' +
      '  swap: vals[1] = 3  → vals=[1,3,3]\n' +
      '  update map: 3→1\n' +
      '  pop last:          → vals=[1,3]\n' +
      '  delete 2 from map  → map={1→0, 3→1}\n\n' +
      'getRandom(): pick random index 0 or 1 → returns 1 or 3',
    explanation:
      '1. self.vals stores elements in a list; self.val_to_idx maps each value to its index in the list.\n' +
      '2. insert: if the value is new, append it to the list and record its index in the map.\n' +
      '3. remove: to avoid shifting elements, swap the target with the last element in the list. Update the swapped element\'s index in the map, then pop the last element and delete the target from the map.\n' +
      '4. getRandom: use random.choice on the list, which picks a uniformly random element in O(1).\n' +
      '5. All three operations are O(1) average time.',
    timeComplexity: 'O(1) average for all operations',
    spaceComplexity: 'O(n)',
    hints: [
      'A hash set supports O(1) insert and remove, but how do you get a random element in O(1)?',
      'A list supports O(1) random access, but removal from the middle is O(n). How can you make removal O(1)?',
      'Swap the element to remove with the last element, then pop the last. Use a hash map to track indices.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 41. First Missing Positive
  // ---------------------------------------------------------------------------
  {
    id: 41,
    description:
      'Given an unsorted integer array nums, return the smallest missing positive integer. You must implement an algorithm that runs in O(n) time and uses O(1) extra space.',
    examples:
      'Input: nums = [3, 4, -1, 1]\nOutput: 2\nExplanation: 1 is present, 2 is missing.',
    intuition:
      'The answer must be between 1 and n+1. The key insight is that the array itself has n slots, so you can use it as its own hash map: put value v at index v-1. After this "cyclic sort," just scan for the first slot where the value does not match its index. This avoids using extra space by repurposing the input array.',
    approach:
      'Use the array itself as a hash map by placing each value v at index v-1 (cyclic sort). After rearranging, the first index i where nums[i] != i+1 gives the answer i+1.',
    code: `def firstMissingPositive(nums: list[int]) -> int:
    n = len(nums)

    # Place each number in its "correct" position: value v goes to index v-1
    for i in range(n):
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            correct = nums[i] - 1
            nums[i], nums[correct] = nums[correct], nums[i]

    # Find the first position where nums[i] != i + 1
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1

    return n + 1`,
    jsCode: `var firstMissingPositive = function(nums) {
    const n = nums.length;

    // Cyclic sort: put each value v at index v-1
    for (let i = 0; i < n; i++) {
        // Keep swapping until nums[i] is in the right place or out of range
        while (nums[i] >= 1 && nums[i] <= n) {
            const correctIndex = nums[i] - 1;

            // Already in the right spot (also handles duplicates)
            if (nums[correctIndex] === nums[i]) {
                break;
            }

            // Swap nums[i] to its correct position
            const temp = nums[i];
            nums[i] = nums[correctIndex];
            nums[correctIndex] = temp;
        }
    }

    // Scan for the first slot where the value doesn't match
    for (let i = 0; i < n; i++) {
        if (nums[i] !== i + 1) {
            return i + 1;
        }
    }

    // All 1..n are present
    return n + 1;
};`,
    jsWalkthrough:
      'nums = [3, 4, -1, 1]\n\n' +
      'Cyclic sort:\n' +
      '  i=0: nums[0]=3, correct index=2\n' +
      '       swap nums[0]↔nums[2] → [−1, 4, 3, 1]\n' +
      '       nums[0]=−1, out of range → stop\n\n' +
      '  i=1: nums[1]=4, correct index=3\n' +
      '       swap nums[1]↔nums[3] → [−1, 1, 3, 4]\n' +
      '       nums[1]=1, correct index=0\n' +
      '       swap nums[1]↔nums[0] → [1, −1, 3, 4]\n' +
      '       nums[1]=−1, out of range → stop\n\n' +
      '  i=2: nums[2]=3, correct index=2 → already there\n' +
      '  i=3: nums[3]=4, correct index=3 → already there\n\n' +
      'After sort: [1, −1, 3, 4]\n\n' +
      'Scan: i=0: nums[0]=1 ✓\n' +
      '      i=1: nums[1]=−1 ≠ 2 → return 2',
    explanation:
      '1. The answer must be in the range [1, n+1] where n is the array length. If all 1..n are present, the answer is n+1.\n' +
      '2. We rearrange the array in-place: value v should sit at index v-1. We swap nums[i] with nums[nums[i]-1] repeatedly until nums[i] is in the right spot or out of range.\n' +
      '3. The condition nums[nums[i]-1] != nums[i] prevents infinite loops when duplicates exist.\n' +
      '4. After rearranging, we scan left to right. The first index i where nums[i] != i+1 means (i+1) is missing.\n' +
      '5. If all positions are correct, return n+1.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The answer is at most n+1. Negative numbers and numbers > n can be ignored.',
      'Can you use the array itself as a hash table by placing each number at its "correct" index?',
      'Use cyclic sort: swap nums[i] to position nums[i]-1 until each number is in place or out of range.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 169. Majority Element
  // ---------------------------------------------------------------------------
  {
    id: 169,
    description:
      'Given an array nums of size n, return the majority element. The majority element is the element that appears more than n/2 times. You may assume that the majority element always exists.',
    examples:
      'Input: nums = [2, 2, 1, 1, 1, 2, 2]\nOutput: 2\nExplanation: 2 appears 4 times out of 7 elements (4 > 7/2).',
    intuition:
      'Imagine a crowd where more than half the people support the same candidate. If supporters and opponents pair off and cancel each other out, the majority candidate will always have people left standing. That is the Boyer-Moore Voting Algorithm: maintain a candidate and cancel opposing votes. Since the majority has more than half the votes, it can never be fully cancelled.',
    approach:
      'Use Boyer-Moore Voting Algorithm: maintain a candidate and a count. Increment count when you see the candidate, decrement otherwise. When count hits 0, switch the candidate. The majority element will always survive.',
    code: `def majorityElement(nums: list[int]) -> int:
    candidate = 0
    count = 0

    for num in nums:
        if count == 0:
            candidate = num
        count += 1 if num == candidate else -1

    return candidate`,
    jsCode: `var majorityElement = function(nums) {
    let candidate = 0;
    let count = 0;

    for (const num of nums) {
        // When count drops to 0, pick a new candidate
        if (count === 0) {
            candidate = num;
        }

        // Vote: same as candidate → +1, different → -1
        if (num === candidate) {
            count = count + 1;
        } else {
            count = count - 1;
        }
    }

    return candidate;
};`,
    jsWalkthrough:
      'nums = [2, 2, 1, 1, 1, 2, 2]\n\n' +
      'num=2: count=0 → candidate=2, count=1\n' +
      'num=2: matches → count=2\n' +
      'num=1: different → count=1\n' +
      'num=1: different → count=0\n' +
      'num=1: count=0 → candidate=1, count=1\n' +
      'num=2: different → count=0\n' +
      'num=2: count=0 → candidate=2, count=1\n\n' +
      'return 2 (candidate survived)',
    explanation:
      '1. Start with count = 0 and no candidate.\n' +
      '2. When count reaches 0, pick the current number as the new candidate.\n' +
      '3. If the current number matches the candidate, increment count; otherwise decrement.\n' +
      '4. The intuition: every "vote" for the majority element can cancel at most one non-majority vote, and since it has > n/2 votes, it will always be the last candidate standing.\n' +
      '5. No extra space is needed beyond two variables.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'A hash map solution uses O(n) space. Can you do O(1)?',
      'The majority element appears more than n/2 times. What if you "cancel out" pairs of different elements?',
      'Look up Boyer-Moore Voting Algorithm -- it finds the majority in one pass with O(1) space.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 448. Find All Numbers Disappeared in an Array
  // ---------------------------------------------------------------------------
  {
    id: 448,
    description:
      'Given an array nums of n integers where nums[i] is in the range [1, n], return an array of all integers in [1, n] that do not appear in nums. Solve it without extra space (output array does not count) and in O(n) time.',
    examples:
      'Input: nums = [4, 3, 2, 7, 8, 2, 3, 1]\nOutput: [5, 6]\nExplanation: 5 and 6 are missing from the range [1, 8].',
    intuition:
      'Since every value is between 1 and n and the array has n slots, each value naturally maps to an index (value - 1). You can "check off" a number by negating the element at its corresponding index. After one pass, any index still holding a positive number was never checked off, meaning that index+1 is missing from the array.',
    approach:
      'Use the array itself as a marker: for each value, mark the element at the corresponding index as negative. After marking, any index with a positive value indicates a missing number.',
    code: `def findDisappearedNumbers(nums: list[int]) -> list[int]:
    for num in nums:
        idx = abs(num) - 1
        if nums[idx] > 0:
            nums[idx] = -nums[idx]

    return [i + 1 for i in range(len(nums)) if nums[i] > 0]`,
    jsCode: `var findDisappearedNumbers = function(nums) {
    // Mark each number's corresponding index as negative
    for (const num of nums) {
        const idx = Math.abs(num) - 1;  // use abs because num might already be negated
        if (nums[idx] > 0) {
            nums[idx] = -nums[idx];
        }
    }

    // Any index still positive means (index + 1) is missing
    const result = [];
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] > 0) {
            result.push(i + 1);
        }
    }

    return result;
};`,
    jsWalkthrough:
      'nums = [4, 3, 2, 7, 8, 2, 3, 1]\n\n' +
      'Marking pass:\n' +
      '  num=4: idx=3, negate → [4,3,2,−7,8,2,3,1]\n' +
      '  num=3: idx=2, negate → [4,3,−2,−7,8,2,3,1]\n' +
      '  num=2: idx=1, negate → [4,−3,−2,−7,8,2,3,1]\n' +
      '  num=−7: |−7|=7, idx=6, negate → [4,−3,−2,−7,8,2,−3,1]\n' +
      '  num=8: idx=7, negate → [4,−3,−2,−7,8,2,−3,−1]\n' +
      '  num=2: idx=1, already negative → skip\n' +
      '  num=−3: |−3|=3, idx=2, already negative → skip\n' +
      '  num=−1: |−1|=1, idx=0, negate → [−4,−3,−2,−7,8,2,−3,−1]\n\n' +
      'Scan for positives:\n' +
      '  i=4: nums[4]=8 > 0 → missing: 5\n' +
      '  i=5: nums[5]=2 > 0 → missing: 6\n\n' +
      'return [5, 6]',
    explanation:
      '1. For each number num, compute index = |num| - 1 (use absolute value because the number might already be negated).\n' +
      '2. If nums[index] is positive, negate it to mark that the value (index+1) exists in the array.\n' +
      '3. After processing all elements, any index i where nums[i] is still positive means (i+1) never appeared.\n' +
      '4. Collect and return all such missing numbers.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) (output array does not count)',
    hints: [
      'The values are in range [1, n] and the array has n slots. Can you use the array as a marker?',
      'For each value v, mark index v-1 as "seen". What kind of marking avoids destroying data?',
      'Negate the value at index v-1. After one pass, positive values indicate missing numbers.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 523. Continuous Subarray Sum
  // ---------------------------------------------------------------------------
  {
    id: 523,
    description:
      'Given an integer array nums and an integer k, return true if nums has a good subarray. A good subarray has a length of at least two and its sum is a multiple of k.',
    examples:
      'Input: nums = [23, 2, 4, 6, 7], k = 6\nOutput: true\nExplanation: [2, 4] is a subarray of size 2 whose sum 6 is a multiple of 6.',
    intuition:
      'This builds on the prefix sum idea with a modular arithmetic twist. If two prefix sums have the same remainder when divided by k, their difference is a multiple of k. So you only need to track remainders, not full sums. Store the first index where each remainder appears, and if you see the same remainder again at least two positions later, you have found a valid subarray.',
    approach:
      'Use prefix sums modulo k. If two prefix sums have the same remainder mod k and their indices differ by at least 2, the subarray between them sums to a multiple of k. Store the first occurrence of each remainder.',
    code: `def checkSubarraySum(nums: list[int], k: int) -> bool:
    remainder_idx: dict[int, int] = {0: -1}  # remainder -> earliest index
    prefix_sum = 0

    for i, num in enumerate(nums):
        prefix_sum += num
        remainder = prefix_sum % k

        if remainder in remainder_idx:
            if i - remainder_idx[remainder] >= 2:
                return True
        else:
            remainder_idx[remainder] = i

    return False`,
    jsCode: `var checkSubarraySum = function(nums, k) {
    // Map: remainder → first index where this remainder was seen
    const remainderIdx = new Map();
    remainderIdx.set(0, -1);  // empty prefix at "index -1"

    let prefixSum = 0;

    for (let i = 0; i < nums.length; i++) {
        prefixSum = prefixSum + nums[i];
        const remainder = prefixSum % k;

        if (remainderIdx.has(remainder)) {
            // Same remainder seen before — check if gap is at least 2
            const earlierIndex = remainderIdx.get(remainder);
            if (i - earlierIndex >= 2) {
                return true;
            }
            // Don't update — we want the earliest index for max gap
        } else {
            remainderIdx.set(remainder, i);
        }
    }

    return false;
};`,
    jsWalkthrough:
      'nums = [23, 2, 4, 6, 7], k = 6\n' +
      'remainderIdx = {0: -1}\n\n' +
      'i=0: prefixSum=23, remainder=23%6=5\n' +
      '     5 not in map → store {5: 0}\n\n' +
      'i=1: prefixSum=25, remainder=25%6=1\n' +
      '     1 not in map → store {1: 1}\n\n' +
      'i=2: prefixSum=29, remainder=29%6=5\n' +
      '     5 in map at index 0, gap=2-0=2 ≥ 2\n' +
      '     return true!\n\n' +
      'Why it works: prefix[2]-prefix[0] = 29-23 = 6\n' +
      'Subarray [2, 4] sums to 6, which is a multiple of 6',
    explanation:
      '1. If prefix[j] % k == prefix[i] % k, then (prefix[j] - prefix[i]) % k == 0, meaning the subarray (i, j] sums to a multiple of k.\n' +
      '2. We store the earliest index where each remainder was first seen.\n' +
      '3. We initialize {0: -1} to handle the case where the subarray starts at index 0.\n' +
      '4. For each index, compute the running prefix sum mod k. If this remainder was seen before and the gap is >= 2, return True.\n' +
      '5. Only store the first occurrence of each remainder (we want maximum gap to satisfy the length-2 constraint).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(n, k))',
    hints: [
      'Think about prefix sums. When is the difference of two prefix sums a multiple of k?',
      'If prefix[j] % k == prefix[i] % k, then the subarray between i and j sums to a multiple of k.',
      'Use a hash map to store the first index where each prefix sum remainder was seen. Check the gap is at least 2.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 706. Design HashMap
  // ---------------------------------------------------------------------------
  {
    id: 706,
    description:
      'Design a HashMap without using any built-in hash table libraries. Implement put(key, value), get(key), and remove(key). Keys and values are integers in range [0, 10^6].',
    examples:
      'Input: ["MyHashMap","put","put","get","get","put","get","remove","get"]\n[[], [1,1], [2,2], [1], [3], [2,1], [2], [2], [2]]\nOutput: [null, null, null, 1, -1, null, 1, null, -1]',
    intuition:
      'Think of a hash map like a set of numbered mailboxes. A hash function tells you which mailbox a key belongs to (key % number_of_boxes). Sometimes two keys land in the same mailbox (a collision), so each mailbox holds a small list of (key, value) pairs. With enough mailboxes, each list stays short and lookups remain fast.',
    approach:
      'Use an array of buckets with chaining (linked list or list of pairs) to handle collisions. A simple hash function like key % bucket_count distributes keys across buckets.',
    code: `class MyHashMap:
    def __init__(self) -> None:
        self.size = 1009  # prime number for better distribution
        self.buckets: list[list[list[int]]] = [[] for _ in range(self.size)]

    def _hash(self, key: int) -> int:
        return key % self.size

    def put(self, key: int, value: int) -> None:
        bucket = self.buckets[self._hash(key)]
        for pair in bucket:
            if pair[0] == key:
                pair[1] = value
                return
        bucket.append([key, value])

    def get(self, key: int) -> int:
        bucket = self.buckets[self._hash(key)]
        for pair in bucket:
            if pair[0] == key:
                return pair[1]
        return -1

    def remove(self, key: int) -> None:
        bucket = self.buckets[self._hash(key)]
        for i, pair in enumerate(bucket):
            if pair[0] == key:
                bucket.pop(i)
                return`,
    jsCode: `var MyHashMap = function() {
    this.size = 1009;  // prime number reduces collision clustering
    this.buckets = Array.from({ length: this.size }, () => []);
};

MyHashMap.prototype._hash = function(key) {
    return key % this.size;
};

MyHashMap.prototype.put = function(key, value) {
    const bucketIndex = this._hash(key);
    const bucket = this.buckets[bucketIndex];

    // Check if key already exists — update it
    for (const pair of bucket) {
        if (pair[0] === key) {
            pair[1] = value;
            return;
        }
    }

    // Key is new — add it
    bucket.push([key, value]);
};

MyHashMap.prototype.get = function(key) {
    const bucketIndex = this._hash(key);
    const bucket = this.buckets[bucketIndex];

    // Search for the key in this bucket
    for (const pair of bucket) {
        if (pair[0] === key) {
            return pair[1];
        }
    }

    // Not found
    return -1;
};

MyHashMap.prototype.remove = function(key) {
    const bucketIndex = this._hash(key);
    const bucket = this.buckets[bucketIndex];

    // Find and remove the key
    for (let i = 0; i < bucket.length; i++) {
        if (bucket[i][0] === key) {
            bucket.splice(i, 1);
            return;
        }
    }
};`,
    jsWalkthrough:
      'size = 1009, all buckets start empty\n\n' +
      'put(1, 10):  hash=1%1009=1\n' +
      '  buckets[1] = [] → push [1,10]\n' +
      '  buckets[1] = [[1,10]]\n\n' +
      'put(1010, 20): hash=1010%1009=1 (collision!)\n' +
      '  buckets[1] = [[1,10]] → key 1010 not found\n' +
      '  push [1010,20]\n' +
      '  buckets[1] = [[1,10], [1010,20]]\n\n' +
      'get(1):  hash=1 → scan buckets[1]\n' +
      '  pair [1,10]: key matches → return 10\n\n' +
      'get(1010): hash=1 → scan buckets[1]\n' +
      '  pair [1,10]: no match\n' +
      '  pair [1010,20]: key matches → return 20\n\n' +
      'remove(1): hash=1 → scan buckets[1]\n' +
      '  pair [1,10]: key matches → splice\n' +
      '  buckets[1] = [[1010,20]]',
    explanation:
      '1. We create 1009 buckets (a prime number reduces collision clustering).\n' +
      '2. _hash maps a key to a bucket index using key % size.\n' +
      '3. put: find the bucket, scan for the key. If found, update the value. Otherwise, append a new [key, value] pair.\n' +
      '4. get: find the bucket, scan for the key, return the value or -1 if not found.\n' +
      '5. remove: find the bucket, scan for the key, and pop it from the list.\n' +
      '6. With a good bucket count, each operation is O(1) on average due to short chains.',
    timeComplexity: 'O(n / k) average per operation where k is the number of buckets',
    spaceComplexity: 'O(n + k) where n is the number of entries',
    hints: [
      'A hash map maps keys to buckets using a hash function. What is the simplest hash function you can use?',
      'key % bucket_count is simple and effective. Use a prime number of buckets to reduce collisions.',
      'Handle collisions by storing a list of (key, value) pairs in each bucket (chaining).',
    ],
  },
];

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
    approach:
      'Two strings are anagrams if and only if their sorted characters are identical. Use the sorted string as a hash map key to group all anagrams together.',
    code: `from collections import defaultdict

def groupAnagrams(strs: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = defaultdict(list)
    for s in strs:
        key = "".join(sorted(s))
        groups[key].append(s)
    return list(groups.values())`,
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
    approach:
      'Use a set to track numbers you have seen. As you iterate, if a number is already in the set, return true immediately. If you finish without finding a duplicate, return false.',
    code: `def containsDuplicate(nums: list[int]) -> bool:
    seen: set[int] = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False`,
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
    approach:
      'Count the frequency of each character in both strings and compare the counts. If they match, the strings are anagrams. Use a hash map or Counter for O(n) comparison.',
    code: `from collections import Counter

def isAnagram(s: str, t: str) -> bool:
    return Counter(s) == Counter(t)`,
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
    approach:
      'Use the array itself as a marker: for each value, mark the element at the corresponding index as negative. After marking, any index with a positive value indicates a missing number.',
    code: `def findDisappearedNumbers(nums: list[int]) -> list[int]:
    for num in nums:
        idx = abs(num) - 1
        if nums[idx] > 0:
            nums[idx] = -nums[idx]

    return [i + 1 for i in range(len(nums)) if nums[i] > 0]`,
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

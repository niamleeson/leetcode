import { ProblemSolution } from "./types";

export const solutions: ProblemSolution[] = [
  // ============================================================
  // TWO POINTERS
  // ============================================================
  {
    id: 11,
    description:
      "Given an integer array 'height' of length n, find two lines that together with the x-axis form a container that holds the most water. Return the maximum amount of water the container can store. You may not slant the container.",
    examples:
      "Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49\nExplanation: Lines at indices 1 and 8 (heights 8 and 7) form a container of width 7, so area = min(8,7) * 7 = 49.",
    approach:
      "Use two pointers starting at both ends of the array. Calculate the area between the two pointers, then move the pointer with the smaller height inward. The shorter line limits the water, so moving it gives the only chance of finding a taller line that could increase the area.",
    code: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        left, right = 0, len(height) - 1
        max_water = 0
        while left < right:
            width = right - left
            h = min(height[left], height[right])
            max_water = max(max_water, width * h)
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return max_water`,
    explanation:
      "Initialize two pointers at both ends. At each step compute the area as min(height[left], height[right]) * (right - left). Update max_water if the current area is larger. Move the pointer pointing to the shorter line inward because keeping the shorter line can never improve the area -- the width shrinks and the height is still capped by the shorter line.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    hints: [
      "Think about starting with the widest possible container and narrowing it.",
      "If one side is shorter than the other, moving the shorter side inward is the only way to potentially find a taller line.",
      "Use two pointers at opposite ends and greedily move the shorter one.",
    ],
  },
  {
    id: 15,
    description:
      "Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that i != j != k and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
    examples:
      "Input: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]\nExplanation: The distinct triplets that sum to zero are [-1,-1,2] and [-1,0,1].",
    approach:
      "Sort the array first. For each element, use two pointers on the remaining subarray to find pairs that sum to the negative of the current element. Skip duplicates at every level to avoid duplicate triplets.",
    code: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        result = []
        for i in range(len(nums) - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            left, right = i + 1, len(nums) - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if total < 0:
                    left += 1
                elif total > 0:
                    right -= 1
                else:
                    result.append([nums[i], nums[left], nums[right]])
                    while left < right and nums[left] == nums[left + 1]:
                        left += 1
                    while left < right and nums[right] == nums[right - 1]:
                        right -= 1
                    left += 1
                    right -= 1
        return result`,
    explanation:
      "Sort the array so duplicates are adjacent. Fix one number nums[i] and use two pointers (left, right) on the rest. If the sum is too small, advance left; if too large, retreat right. On a match, record the triplet and skip duplicate values for both left and right to ensure uniqueness. Also skip duplicate values for i at the outer loop.",
    timeComplexity: "O(n^2)",
    spaceComplexity: "O(1) excluding the output array (O(n) for sorting in some implementations)",
    hints: [
      "Sorting the array makes it easy to skip duplicates and use two pointers.",
      "Fix one element, then the problem reduces to Two Sum II on the remaining sorted subarray.",
      "After finding a valid triplet, skip all duplicate values for both the left and right pointers.",
    ],
  },
  {
    id: 42,
    description:
      "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    examples:
      "Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\nExplanation: The elevation map traps 6 units of rain water between the bars.",
    approach:
      "Use two pointers from both ends while tracking the maximum height seen from the left and right. Water at each position is determined by the minimum of the two max heights minus the current height. Always process the side with the smaller max height.",
    code: `class Solution:
    def trap(self, height: list[int]) -> int:
        if not height:
            return 0
        left, right = 0, len(height) - 1
        left_max, right_max = height[left], height[right]
        water = 0
        while left < right:
            if left_max < right_max:
                left += 1
                left_max = max(left_max, height[left])
                water += left_max - height[left]
            else:
                right -= 1
                right_max = max(right_max, height[right])
                water += right_max - height[right]
        return water`,
    explanation:
      "Maintain left and right pointers and their respective running maximums. If left_max < right_max, the water level at the left pointer is bounded by left_max (because there is a taller bar on the right), so advance left and add (left_max - height[left]) to water. Otherwise, do the same from the right side. This works because we always process the bottleneck side.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    hints: [
      "The water trapped above any bar depends on the minimum of the tallest bar to its left and the tallest bar to its right.",
      "You can track these maximums incrementally from both ends using two pointers.",
      "Always advance the pointer on the side with the smaller max height -- that side is the bottleneck.",
    ],
  },
  {
    id: 125,
    description:
      "A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome.",
    examples:
      'Input: s = "A man, a plan, a canal: Panama"\nOutput: true\nExplanation: After cleaning, the string becomes "amanaplanacanalpanama", which is a palindrome.',
    approach:
      "Use two pointers starting from both ends of the string. Skip non-alphanumeric characters and compare lowercase versions of the characters at both pointers.",
    code: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        left, right = 0, len(s) - 1
        while left < right:
            while left < right and not s[left].isalnum():
                left += 1
            while left < right and not s[right].isalnum():
                right -= 1
            if s[left].lower() != s[right].lower():
                return False
            left += 1
            right -= 1
        return True`,
    explanation:
      "Two pointers start at opposite ends. Inner while-loops skip non-alphanumeric characters. Compare lowercased characters at both pointers. If they mismatch, return False. Otherwise, move both pointers inward. If the pointers cross without mismatch, the string is a palindrome.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    hints: [
      "You only care about alphanumeric characters -- skip everything else.",
      "Compare characters case-insensitively using .lower().",
      "Two pointers from both ends avoid the need to create a cleaned copy of the string.",
    ],
  },
  {
    id: 167,
    description:
      "Given a 1-indexed array of integers 'numbers' that is already sorted in non-decreasing order, find two numbers that add up to a specific target. Return the indices of the two numbers (1-indexed) as [index1, index2].",
    examples:
      "Input: numbers = [2,7,11,15], target = 9\nOutput: [1,2]\nExplanation: 2 + 7 = 9, so index1 = 1 and index2 = 2.",
    approach:
      "Use two pointers at the start and end. If the sum is too small, move the left pointer right; if too large, move the right pointer left. The sorted order guarantees convergence to the answer.",
    code: `class Solution:
    def twoSum(self, numbers: list[int], target: int) -> list[int]:
        left, right = 0, len(numbers) - 1
        while left < right:
            current_sum = numbers[left] + numbers[right]
            if current_sum == target:
                return [left + 1, right + 1]
            elif current_sum < target:
                left += 1
            else:
                right -= 1
        return []`,
    explanation:
      "Start with pointers at both ends. Compute their sum. If it matches the target, return 1-indexed positions. If the sum is too small, incrementing left increases it (array is sorted). If the sum is too large, decrementing right decreases it. Exactly one solution is guaranteed.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    hints: [
      "The array is sorted -- this is the key property to exploit.",
      "If the sum of the two extreme elements is too small, only increasing the smaller element can help.",
      "Use two pointers from opposite ends and adjust based on whether the sum is too small or too large.",
    ],
  },
  {
    id: 26,
    description:
      "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. Return the number of unique elements k, with the first k elements of nums holding the unique values.",
    examples:
      "Input: nums = [1,1,2]\nOutput: 2, nums = [1,2,...]\nExplanation: The function returns k = 2 with the first two elements of nums being 1 and 2.",
    approach:
      "Use a slow pointer to track the position for the next unique element and a fast pointer to scan through the array. When a new unique element is found, place it at the slow pointer position and advance slow.",
    code: `class Solution:
    def removeDuplicates(self, nums: list[int]) -> int:
        if not nums:
            return 0
        slow = 0
        for fast in range(1, len(nums)):
            if nums[fast] != nums[slow]:
                slow += 1
                nums[slow] = nums[fast]
        return slow + 1`,
    explanation:
      "slow marks the last position of unique elements. fast scans forward. When nums[fast] differs from nums[slow], we found a new unique value, so increment slow and copy nums[fast] there. After the loop, slow + 1 is the count of unique elements.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    hints: [
      "Since the array is sorted, duplicates are always adjacent.",
      "Use a slow pointer to build the result in-place and a fast pointer to scan ahead.",
      "Only copy a value when it differs from the value at the slow pointer.",
    ],
  },
  {
    id: 75,
    description:
      "Given an array nums with n objects colored red (0), white (1), or blue (2), sort them in-place so that objects of the same color are adjacent in the order red, white, blue. Do not use the library sort function.",
    examples:
      "Input: nums = [2,0,2,1,1,0]\nOutput: [0,0,1,1,2,2]\nExplanation: The array is sorted in-place with all 0s first, then 1s, then 2s.",
    approach:
      "Use the Dutch National Flag algorithm with three pointers: low for the boundary of 0s, mid for the current element, and high for the boundary of 2s. Swap elements to their correct regions as mid advances.",
    code: `class Solution:
    def sortColors(self, nums: list[int]) -> None:
        low, mid, high = 0, 0, len(nums) - 1
        while mid <= high:
            if nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]
                low += 1
                mid += 1
            elif nums[mid] == 1:
                mid += 1
            else:
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= 1`,
    explanation:
      "Three pointers partition the array: [0..low-1] contains 0s, [low..mid-1] contains 1s, [high+1..end] contains 2s. If nums[mid] is 0, swap it to the low region and advance both. If 1, it is already in the right place, advance mid. If 2, swap it to the high region and shrink high (do not advance mid because the swapped-in value needs inspection).",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    hints: [
      "Think of partitioning the array into three regions: 0s, 1s, and 2s.",
      "Use three pointers: one for the next 0 position, one for the current scan position, and one for the next 2 position.",
      "When you swap a 2 to the end, do not advance the scan pointer because the swapped-in element has not been examined yet.",
    ],
  },
  {
    id: 283,
    description:
      "Given an integer array nums, move all 0s to the end of it while maintaining the relative order of the non-zero elements. You must do this in-place without making a copy of the array.",
    examples:
      "Input: nums = [0,1,0,3,12]\nOutput: [1,3,12,0,0]\nExplanation: All non-zero elements are moved to the front in their original order, and zeros fill the rest.",
    approach:
      "Use a slow pointer to track the position for the next non-zero element. Iterate with a fast pointer; when a non-zero element is found, swap it to the slow pointer position. This preserves order and pushes zeros to the end.",
    code: `class Solution:
    def moveZeroes(self, nums: list[int]) -> None:
        slow = 0
        for fast in range(len(nums)):
            if nums[fast] != 0:
                nums[slow], nums[fast] = nums[fast], nums[slow]
                slow += 1`,
    explanation:
      "slow tracks where the next non-zero should go. fast scans the entire array. When nums[fast] is non-zero, swap it into position slow and advance slow. All elements before slow are non-zero in original order. All zeros naturally accumulate after slow.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    hints: [
      "Think of it as partitioning: non-zeros on the left, zeros on the right.",
      "A slow pointer marks where the next non-zero value should be placed.",
      "Swapping (instead of overwriting) handles the case where slow and fast point to the same element.",
    ],
  },
  {
    id: 344,
    description:
      "Write a function that reverses a string given as an array of characters. You must do this by modifying the input array in-place with O(1) extra memory.",
    examples:
      'Input: s = ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]\nExplanation: The array is reversed in-place.',
    approach:
      "Use two pointers at both ends of the array. Swap the characters at the two pointers and move them toward the center until they meet.",
    code: `class Solution:
    def reverseString(self, s: list[str]) -> None:
        left, right = 0, len(s) - 1
        while left < right:
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1`,
    explanation:
      "Place left at index 0 and right at the last index. Swap s[left] and s[right], then move both pointers inward. Repeat until left >= right. Each element is visited at most once, and the swap is done in constant space.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    hints: [
      "The simplest two-pointer problem: swap from both ends.",
      "Move left forward and right backward after each swap.",
      "Stop when the pointers cross -- the array is fully reversed.",
    ],
  },
  {
    id: 392,
    description:
      "Given two strings s and t, return true if s is a subsequence of t. A subsequence is formed by deleting some (or no) characters from t without changing the relative order of the remaining characters.",
    examples:
      'Input: s = "abc", t = "ahbgdc"\nOutput: true\nExplanation: "abc" is a subsequence of "ahbgdc" (a_h_b_g_d_c).',
    approach:
      "Use two pointers, one for each string. Advance the pointer for s only when the characters match. Advance the pointer for t at every step. If the s-pointer reaches the end, s is a subsequence.",
    code: `class Solution:
    def isSubsequence(self, s: str, t: str) -> bool:
        i, j = 0, 0
        while i < len(s) and j < len(t):
            if s[i] == t[j]:
                i += 1
            j += 1
        return i == len(s)`,
    explanation:
      "Pointer i scans s, pointer j scans t. When characters match, advance i (we matched one more character of s). Always advance j (move through t). If i reaches len(s), every character of s was matched in order within t.",
    timeComplexity: "O(n) where n = len(t)",
    spaceComplexity: "O(1)",
    hints: [
      "You need to match characters of s in order within t.",
      "Use one pointer per string; advance the s-pointer only on a match.",
      "If the s-pointer reaches the end, all characters were found in order.",
    ],
  },
  {
    id: 680,
    description:
      "Given a string s, return true if the string can be made a palindrome after deleting at most one character from it.",
    examples:
      'Input: s = "abca"\nOutput: true\nExplanation: Deleting \'c\' gives "aba", which is a palindrome.',
    approach:
      "Use two pointers from both ends. When a mismatch is found, try skipping either the left or the right character and check if the remaining substring is a palindrome. If either works, return true.",
    code: `class Solution:
    def validPalindrome(self, s: str) -> bool:
        def is_palindrome(lo: int, hi: int) -> bool:
            while lo < hi:
                if s[lo] != s[hi]:
                    return False
                lo += 1
                hi -= 1
            return True

        left, right = 0, len(s) - 1
        while left < right:
            if s[left] != s[right]:
                return is_palindrome(left + 1, right) or is_palindrome(left, right - 1)
            left += 1
            right -= 1
        return True`,
    explanation:
      "Compare from both ends. If characters match, move inward. On the first mismatch, we use our one allowed deletion: either skip the left character or the right character. Check if the resulting substring is a palindrome. If neither works, return False.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    hints: [
      "Start with the standard palindrome check using two pointers.",
      "When you hit a mismatch, you have one deletion -- try skipping the left character or the right character.",
      "Only one mismatch is allowed, so the helper function does a strict palindrome check on the remaining range.",
    ],
  },
  {
    id: 881,
    description:
      "You are given an array people where people[i] is the weight of the i-th person, and an integer limit representing the weight limit of each boat. Each boat carries at most two people, provided their combined weight does not exceed limit. Return the minimum number of boats.",
    examples:
      "Input: people = [3,2,2,1], limit = 3\nOutput: 3\nExplanation: Boats carry (1,2), (2), (3). Three boats are needed.",
    approach:
      "Sort the array. Use two pointers: pair the lightest with the heaviest person. If they fit together, move both pointers inward. Otherwise, the heaviest person rides alone. Count boats accordingly.",
    code: `class Solution:
    def numRescueBoats(self, people: list[int], limit: int) -> int:
        people.sort()
        left, right = 0, len(people) - 1
        boats = 0
        while left <= right:
            if people[left] + people[right] <= limit:
                left += 1
            right -= 1
            boats += 1
        return boats`,
    explanation:
      "Sort so the lightest and heaviest are at opposite ends. Try pairing them: if their combined weight fits within the limit, both board (advance left). The heaviest always boards (decrement right). Increment boats each iteration. This greedy pairing minimizes boats because pairing the lightest with the heaviest is optimal.",
    timeComplexity: "O(n log n) due to sorting",
    spaceComplexity: "O(1) ignoring sort space",
    hints: [
      "Sorting lets you efficiently pair the lightest and heaviest people.",
      "If the lightest and heaviest cannot share a boat, the heaviest must ride alone.",
      "Each iteration always seats the heaviest remaining person; the lightest only joins if there is room.",
    ],
  },
  {
    id: 88,
    description:
      "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n representing the number of elements in nums1 and nums2. Merge nums2 into nums1 as one sorted array in-place. nums1 has enough space (length m + n) to hold the result.",
    examples:
      "Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3\nOutput: [1,2,2,3,5,6]\nExplanation: Merging [1,2,3] and [2,5,6] produces [1,2,2,3,5,6].",
    approach:
      "Merge from the back to avoid overwriting elements in nums1 that have not been processed yet. Use three pointers: one at the end of nums1's valid elements, one at the end of nums2, and one at the very end of nums1.",
    code: `class Solution:
    def merge(self, nums1: list[int], m: int, nums2: list[int], n: int) -> None:
        p1, p2, p = m - 1, n - 1, m + n - 1
        while p2 >= 0:
            if p1 >= 0 and nums1[p1] > nums2[p2]:
                nums1[p] = nums1[p1]
                p1 -= 1
            else:
                nums1[p] = nums2[p2]
                p2 -= 1
            p -= 1`,
    explanation:
      "Start filling nums1 from the end (index m+n-1). Compare the largest unmerged elements from both arrays. Place the larger one at position p and decrement the corresponding pointer. The loop only needs to run while p2 >= 0 because if nums2 is exhausted, the remaining nums1 elements are already in place.",
    timeComplexity: "O(m + n)",
    spaceComplexity: "O(1)",
    hints: [
      "Merging from the front would require shifting elements. Merge from the back instead.",
      "The extra space at the end of nums1 is exactly where you should place the merged result.",
      "Once all elements of nums2 are placed, the remaining elements of nums1 are already correctly positioned.",
    ],
  },

  // ============================================================
  // SLIDING WINDOW
  // ============================================================
  {
    id: 3,
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    examples:
      'Input: s = "abcabcbb"\nOutput: 3\nExplanation: The longest substring without repeating characters is "abc" with length 3.',
    approach:
      "Use a sliding window with a set (or dictionary) to track characters in the current window. Expand the right end; when a duplicate is found, shrink from the left until the duplicate is removed.",
    code: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_set = set()
        left = 0
        max_len = 0
        for right in range(len(s)):
            while s[right] in char_set:
                char_set.remove(s[left])
                left += 1
            char_set.add(s[right])
            max_len = max(max_len, right - left + 1)
        return max_len`,
    explanation:
      "Maintain a set of characters in the current window [left, right]. For each new character at right, if it already exists in the set, remove characters from the left until the duplicate is gone. Then add the new character and update the max length. Each character is added and removed at most once, giving linear time.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(min(m, n)) where m is the character set size",
    hints: [
      "A sliding window can efficiently track a contiguous substring.",
      "Use a set to detect duplicates in O(1) time.",
      "When you find a duplicate, shrink the window from the left until the duplicate is removed.",
    ],
  },
  {
    id: 76,
    description:
      "Given two strings s and t, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If no such substring exists, return the empty string.",
    examples:
      'Input: s = "ADOBECODEBANC", t = "ABC"\nOutput: "BANC"\nExplanation: "BANC" is the smallest window in s that contains A, B, and C.',
    approach:
      "Use a sliding window with two frequency maps. Expand the right end to include characters; when all required characters are covered, shrink from the left to minimize the window. Track the number of satisfied character requirements to avoid repeatedly comparing maps.",
    code: `class Solution:
    def minWindow(self, s: str, t: str) -> str:
        from collections import Counter

        if not t or not s:
            return ""

        t_count = Counter(t)
        required = len(t_count)
        formed = 0
        window_counts = {}

        left = 0
        min_len = float("inf")
        min_left = 0

        for right in range(len(s)):
            char = s[right]
            window_counts[char] = window_counts.get(char, 0) + 1

            if char in t_count and window_counts[char] == t_count[char]:
                formed += 1

            while formed == required:
                if right - left + 1 < min_len:
                    min_len = right - left + 1
                    min_left = left

                left_char = s[left]
                window_counts[left_char] -= 1
                if left_char in t_count and window_counts[left_char] < t_count[left_char]:
                    formed -= 1
                left += 1

        return "" if min_len == float("inf") else s[min_left : min_left + min_len]`,
    explanation:
      "Count character frequencies in t. Expand the window rightward, updating window_counts. Track 'formed' -- the number of unique characters whose window count meets the required count. When formed == required, the window is valid: try to shrink from the left while staying valid, updating the minimum window. When shrinking causes a character to drop below its requirement, decrement formed and resume expanding.",
    timeComplexity: "O(|s| + |t|)",
    spaceComplexity: "O(|s| + |t|)",
    hints: [
      "Use a frequency map for t and one for the current window.",
      "Track how many distinct characters have been fully satisfied to avoid comparing maps each time.",
      "Once the window is valid, shrink from the left to find the minimum; expand again when it becomes invalid.",
    ],
  },
  {
    id: 121,
    description:
      "You are given an array prices where prices[i] is the price of a given stock on the i-th day. You want to maximize profit by choosing a single day to buy and a single later day to sell. Return the maximum profit, or 0 if no profit is possible.",
    examples:
      "Input: prices = [7,1,5,3,6,4]\nOutput: 5\nExplanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 5.",
    approach:
      "Track the minimum price seen so far as you scan left to right. At each position, the maximum profit achievable by selling today is today's price minus the minimum so far. Keep a running maximum of this profit.",
    code: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        min_price = float("inf")
        max_profit = 0
        for price in prices:
            min_price = min(min_price, price)
            max_profit = max(max_profit, price - min_price)
        return max_profit`,
    explanation:
      "Initialize min_price to infinity and max_profit to 0. For each price, update min_price if the current price is lower. Then compute the profit of selling today (price - min_price) and update max_profit if it is higher. This single pass finds the optimal buy/sell pair.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    hints: [
      "You want to buy low and sell high, with the buy happening before the sell.",
      "As you scan prices, keep track of the minimum price you have seen so far.",
      "At each day, the best profit from selling today is today's price minus the running minimum.",
    ],
  },
  {
    id: 424,
    description:
      "You are given a string s and an integer k. You can choose any character in the string and change it to any other uppercase English letter at most k times. Return the length of the longest substring containing the same letter after performing at most k replacements.",
    examples:
      'Input: s = "AABABBA", k = 1\nOutput: 4\nExplanation: Replace one B in "ABAB" to get "AAAA" (or replace one A to get "BBBB"), giving length 4.',
    approach:
      "Use a sliding window tracking the frequency of each character. The key insight: if window_length - max_frequency > k, the window is invalid (too many replacements needed). Shrink from the left in that case. We do not need to decrease max_frequency when shrinking because a smaller max_frequency cannot produce a longer valid window.",
    code: `class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = {}
        left = 0
        max_freq = 0
        max_len = 0
        for right in range(len(s)):
            count[s[right]] = count.get(s[right], 0) + 1
            max_freq = max(max_freq, count[s[right]])
            if (right - left + 1) - max_freq > k:
                count[s[left]] -= 1
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len`,
    explanation:
      "Expand the window rightward, updating character counts and max_freq (the highest frequency of any single character in the window). If the number of characters to replace (window_size - max_freq) exceeds k, shrink by one from the left. max_freq is never decremented -- this is safe because we only care about finding a longer valid window, which requires a higher max_freq.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1) (at most 26 entries in the map)",
    hints: [
      "In any valid window, you keep the most frequent character and replace the rest.",
      "The number of replacements needed is window_length - max_frequency_in_window.",
      "You do not need to decrease max_freq when shrinking -- a smaller max_freq cannot improve the answer.",
    ],
  },
  {
    id: 567,
    description:
      "Given two strings s1 and s2, return true if s2 contains a permutation of s1. In other words, return true if one of s1's permutations is a substring of s2.",
    examples:
      'Input: s1 = "ab", s2 = "eidbaooo"\nOutput: true\nExplanation: s2 contains "ba", which is a permutation of "ab".',
    approach:
      "Use a fixed-size sliding window of length len(s1) over s2. Maintain a frequency count of the window and compare it with the frequency count of s1. Use a 'matches' counter to track how many of the 26 characters have equal frequencies.",
    code: `class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        if len(s1) > len(s2):
            return False

        s1_count = [0] * 26
        s2_count = [0] * 26

        for i in range(len(s1)):
            s1_count[ord(s1[i]) - ord('a')] += 1
            s2_count[ord(s2[i]) - ord('a')] += 1

        matches = sum(1 for i in range(26) if s1_count[i] == s2_count[i])

        for i in range(len(s1), len(s2)):
            if matches == 26:
                return True

            # Add s2[i] to window
            idx = ord(s2[i]) - ord('a')
            s2_count[idx] += 1
            if s2_count[idx] == s1_count[idx]:
                matches += 1
            elif s2_count[idx] == s1_count[idx] + 1:
                matches -= 1

            # Remove s2[i - len(s1)] from window
            idx = ord(s2[i - len(s1)]) - ord('a')
            s2_count[idx] -= 1
            if s2_count[idx] == s1_count[idx]:
                matches += 1
            elif s2_count[idx] == s1_count[idx] - 1:
                matches -= 1

        return matches == 26`,
    explanation:
      "Build frequency arrays for s1 and the first window of s2. Count how many of the 26 characters already match. Slide the window: when adding a character, check if it just became a match or just lost a match. Do the same when removing a character from the left. If matches reaches 26, all character frequencies are equal, meaning the window is a permutation of s1.",
    timeComplexity: "O(n) where n = len(s2)",
    spaceComplexity: "O(1) (fixed-size arrays of 26)",
    hints: [
      "A permutation has the same character frequencies as the original string.",
      "Use a fixed-size sliding window equal to the length of s1.",
      "Track a 'matches' counter for how many characters have equal frequency -- this avoids comparing all 26 each time.",
    ],
  },
  {
    id: 239,
    description:
      "You are given an array of integers nums and a sliding window of size k that moves from left to right. Return an array of the maximum value in each window position.",
    examples:
      "Input: nums = [1,3,-1,-3,5,3,6,7], k = 3\nOutput: [3,3,5,5,6,7]\nExplanation: Window positions and their maxima: [1,3,-1]->3, [3,-1,-3]->3, [-1,-3,5]->5, [-3,5,3]->5, [5,3,6]->6, [3,6,7]->7.",
    approach:
      "Use a monotonic decreasing deque that stores indices. The front of the deque is always the index of the maximum in the current window. Remove indices from the front if they are out of the window, and from the back if the new element is greater (they can never be the maximum).",
    code: `class Solution:
    def maxSlidingWindow(self, nums: list[int], k: int) -> list[int]:
        from collections import deque

        dq = deque()
        result = []
        for i in range(len(nums)):
            # Remove indices outside the window
            while dq and dq[0] < i - k + 1:
                dq.popleft()
            # Remove smaller elements from the back
            while dq and nums[dq[-1]] < nums[i]:
                dq.pop()
            dq.append(i)
            if i >= k - 1:
                result.append(nums[dq[0]])
        return result`,
    explanation:
      "The deque stores indices in decreasing order of their values. For each new index i: (1) remove front elements outside the window [i-k+1, i]; (2) remove back elements smaller than nums[i] since they cannot be the max of any future window; (3) append i. The front of the deque is always the max of the current window. Start recording results once the first full window is formed (i >= k-1).",
    timeComplexity: "O(n) -- each element is pushed and popped at most once",
    spaceComplexity: "O(k) for the deque",
    hints: [
      "A brute-force approach checks all k elements per window. Can you do better with a deque?",
      "Maintain a monotonic decreasing deque of indices -- smaller elements at the back will never be useful once a larger element enters.",
      "Always check if the front of the deque is still within the current window before using it as the maximum.",
    ],
  },
  {
    id: 209,
    description:
      "Given an array of positive integers nums and a positive integer target, return the minimal length of a contiguous subarray whose sum is greater than or equal to target. If there is no such subarray, return 0.",
    examples:
      "Input: target = 7, nums = [2,3,1,2,4,3]\nOutput: 2\nExplanation: The subarray [4,3] has sum 7 and is the shortest subarray with sum >= target.",
    approach:
      "Use a sliding window. Expand the window by adding elements from the right. When the window sum meets or exceeds the target, try to shrink from the left while updating the minimum length.",
    code: `class Solution:
    def minSubArrayLen(self, target: int, nums: list[int]) -> int:
        left = 0
        current_sum = 0
        min_len = float("inf")
        for right in range(len(nums)):
            current_sum += nums[right]
            while current_sum >= target:
                min_len = min(min_len, right - left + 1)
                current_sum -= nums[left]
                left += 1
        return min_len if min_len != float("inf") else 0`,
    explanation:
      "Expand the window by adding nums[right]. Once current_sum >= target, the window is valid: record its length and shrink from the left by subtracting nums[left] and advancing left. Keep shrinking as long as the sum remains valid. This finds the shortest valid window ending at each right position.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    hints: [
      "All numbers are positive, so expanding the window increases the sum and shrinking decreases it.",
      "Once the sum exceeds the target, try shrinking from the left to find the minimal window.",
      "Each element is added and removed at most once, giving O(n) time.",
    ],
  },
  {
    id: 438,
    description:
      "Given two strings s and p, return an array of all the start indices of p's anagrams in s. An anagram is a rearrangement of all the characters of a string.",
    examples:
      'Input: s = "cbaebabacd", p = "abc"\nOutput: [0,6]\nExplanation: Substrings starting at index 0 ("cba") and index 6 ("bac") are anagrams of "abc".',
    approach:
      "Use a fixed-size sliding window of length len(p). Maintain frequency counts for the window and for p, with a 'matches' counter tracking how many of the 26 characters have equal frequencies. When matches equals 26, record the start index.",
    code: `class Solution:
    def findAnagrams(self, s: str, p: str) -> list[int]:
        if len(p) > len(s):
            return []

        p_count = [0] * 26
        s_count = [0] * 26
        for i in range(len(p)):
            p_count[ord(p[i]) - ord('a')] += 1
            s_count[ord(s[i]) - ord('a')] += 1

        matches = sum(1 for i in range(26) if p_count[i] == s_count[i])
        result = []

        for i in range(len(p), len(s)):
            if matches == 26:
                result.append(i - len(p))

            # Add s[i]
            idx = ord(s[i]) - ord('a')
            s_count[idx] += 1
            if s_count[idx] == p_count[idx]:
                matches += 1
            elif s_count[idx] == p_count[idx] + 1:
                matches -= 1

            # Remove s[i - len(p)]
            idx = ord(s[i - len(p)]) - ord('a')
            s_count[idx] -= 1
            if s_count[idx] == p_count[idx]:
                matches += 1
            elif s_count[idx] == p_count[idx] - 1:
                matches -= 1

        if matches == 26:
            result.append(len(s) - len(p))

        return result`,
    explanation:
      "Initialize frequency arrays for p and the first window of s. Count initial matches (characters with equal frequency). Slide the window: adding a character may create or break a match; removing a character does the same. Check both transitions. When matches == 26, all frequencies are equal and the window is an anagram. Record its start index.",
    timeComplexity: "O(n) where n = len(s)",
    spaceComplexity: "O(1) (fixed-size arrays of 26)",
    hints: [
      "An anagram has the same character frequencies -- compare frequency arrays instead of sorting.",
      "Use a fixed-size sliding window of length len(p) over s.",
      "Track a 'matches' counter so you do not need to compare all 26 characters each step.",
    ],
  },
  {
    id: 904,
    description:
      "You are visiting a farm with a row of fruit trees. Each tree produces one type of fruit (given as an integer). You have two baskets, each of which can hold only one type of fruit. Starting from any tree, pick fruits from each consecutive tree, stopping when you would need a third type. Return the maximum number of fruits you can collect.",
    examples:
      "Input: fruits = [1,2,1]\nOutput: 3\nExplanation: Pick all three trees: types 1 and 2 fit in two baskets.",
    approach:
      "This is equivalent to finding the longest subarray with at most 2 distinct elements. Use a sliding window with a hash map tracking fruit counts. When more than 2 types exist, shrink from the left.",
    code: `class Solution:
    def totalFruit(self, fruits: list[int]) -> int:
        count = {}
        left = 0
        max_len = 0
        for right in range(len(fruits)):
            count[fruits[right]] = count.get(fruits[right], 0) + 1
            while len(count) > 2:
                count[fruits[left]] -= 1
                if count[fruits[left]] == 0:
                    del count[fruits[left]]
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len`,
    explanation:
      "Expand the window rightward, adding fruit types to the map. If the map has more than 2 keys (fruit types), shrink from the left: decrement the count and remove the key if it reaches zero. After restoring the invariant (at most 2 types), update the maximum window length.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1) (the map has at most 3 entries)",
    hints: [
      "Reframe the problem: find the longest subarray with at most 2 distinct values.",
      "Use a sliding window with a hash map to count occurrences of each fruit type.",
      "Shrink the window from the left when you have more than 2 types until the constraint is restored.",
    ],
  },
  {
    id: 1004,
    description:
      "Given a binary array nums and an integer k, return the maximum number of consecutive 1s in the array if you can flip at most k 0s to 1s.",
    examples:
      "Input: nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2\nOutput: 6\nExplanation: Flip the two 0s at indices 5 and 10 (0-indexed) to get [1,1,1,0,0,1,1,1,1,1,1], giving 6 consecutive 1s.",
    approach:
      "Use a sliding window that allows at most k zeros inside it. Expand the right end; when the count of zeros exceeds k, shrink from the left. The maximum window size is the answer.",
    code: `class Solution:
    def longestOnes(self, nums: list[int], k: int) -> int:
        left = 0
        zeros = 0
        max_len = 0
        for right in range(len(nums)):
            if nums[right] == 0:
                zeros += 1
            while zeros > k:
                if nums[left] == 0:
                    zeros -= 1
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len`,
    explanation:
      "Maintain a window [left, right] and count the zeros in it. Expanding right may add a zero. If zeros exceed k, shrink from left until zeros <= k. The window always contains at most k zeros, meaning we can flip them all to 1s. Track the maximum window size.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    hints: [
      "Instead of actually flipping zeros, think of finding the longest window with at most k zeros.",
      "Use a sliding window and count the zeros inside it.",
      "When the zero count exceeds k, shrink from the left until it is k or fewer.",
    ],
  },
];

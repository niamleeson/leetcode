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
    intuition:
      "Start with the widest possible container (pointers at both ends) and work inward. The key insight is that the shorter line is always the bottleneck -- moving the taller line inward can only make things worse (less width, same height limit), so you always move the shorter one hoping to find something taller.",
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
    jsCode: `var maxArea = function(height) {
    let left = 0;
    let right = height.length - 1;
    let maxWater = 0;

    while (left < right) {
        const leftHeight = height[left];
        const rightHeight = height[right];

        // Width is the distance between the two lines
        const width = right - left;

        // Water level is limited by the shorter line
        const shorterHeight = Math.min(leftHeight, rightHeight);
        const currentArea = width * shorterHeight;

        // Update the best area found so far
        if (currentArea > maxWater) {
            maxWater = currentArea;
        }

        // Move the pointer pointing to the shorter line inward
        // (moving the taller one can only decrease the area)
        if (leftHeight < rightHeight) {
            left = left + 1;
        } else {
            right = right - 1;
        }
    }

    return maxWater;
};`,
    jsWalkthrough:
      'height = [1,8,6,2,5,4,8,3,7]\n\n' +
      'Start: left=0 (height=1), right=8 (height=7)\n\n' +
      'Step 1: leftHeight=1, rightHeight=7, width=8, area=min(1,7)*8=8\n' +
      '        maxWater=8, left side shorter → left=1\n\n' +
      'Step 2: leftHeight=8, rightHeight=7, width=7, area=min(8,7)*7=49\n' +
      '        maxWater=49, right side shorter → right=7\n\n' +
      'Step 3: leftHeight=8, rightHeight=3, width=6, area=min(8,3)*6=18\n' +
      '        maxWater=49, right side shorter → right=6\n\n' +
      'Step 4: leftHeight=8, rightHeight=8, width=5, area=min(8,8)*5=40\n' +
      '        maxWater=49, equal → right=5\n\n' +
      '... (continuing, no area exceeds 49)\n\n' +
      'return 49',
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
    intuition:
      "Three Sum reduces to Two Sum once you fix one number. By sorting the array first, you can fix each number and then use two pointers on the rest to find pairs that complement it to zero. Sorting also makes it trivial to skip duplicates -- identical values are adjacent, so you just check if the current value equals the previous one.",
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
    jsCode: `var threeSum = function(nums) {
    // Sort so duplicates are adjacent and two-pointer works correctly
    nums.sort((a, b) => a - b);
    const result = [];

    for (let i = 0; i < nums.length - 2; i++) {
        const fixedNum = nums[i];

        // Skip duplicate values for the fixed number
        if (i > 0 && fixedNum === nums[i - 1]) {
            continue;
        }

        let left = i + 1;
        let right = nums.length - 1;

        while (left < right) {
            const total = fixedNum + nums[left] + nums[right];

            if (total < 0) {
                // Sum too small, move left pointer right to increase it
                left = left + 1;
            } else if (total > 0) {
                // Sum too large, move right pointer left to decrease it
                right = right - 1;
            } else {
                // Found a valid triplet
                result.push([fixedNum, nums[left], nums[right]]);

                // Skip duplicates for the left pointer
                while (left < right && nums[left] === nums[left + 1]) {
                    left = left + 1;
                }

                // Skip duplicates for the right pointer
                while (left < right && nums[right] === nums[right - 1]) {
                    right = right - 1;
                }

                left = left + 1;
                right = right - 1;
            }
        }
    }

    return result;
};`,
    jsWalkthrough:
      'nums = [-1,0,1,2,-1,-4]\n\n' +
      'After sort: [-4,-1,-1,0,1,2]\n\n' +
      'i=0: fixedNum=-4, left=1, right=5\n' +
      '     total=-4+(-1)+2=-3 < 0 → left=2\n' +
      '     total=-4+(-1)+2=-3 < 0 → left=3\n' +
      '     total=-4+0+2=-2 < 0 → left=4\n' +
      '     total=-4+1+2=-1 < 0 → left=5\n' +
      '     left >= right, stop\n\n' +
      'i=1: fixedNum=-1, left=2, right=5\n' +
      '     total=-1+(-1)+2=0 → push [-1,-1,2]\n' +
      '     skip duplicates: left=3, right=4\n' +
      '     total=-1+0+1=0 → push [-1,0,1]\n' +
      '     skip duplicates: left=4, right=3\n' +
      '     left >= right, stop\n\n' +
      'i=2: fixedNum=-1, same as nums[1]=-1 → skip\n\n' +
      'i=3: fixedNum=0, left=4, right=5\n' +
      '     total=0+1+2=3 > 0 → right=4\n' +
      '     left >= right, stop\n\n' +
      'return [[-1,-1,2],[-1,0,1]]',
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
    intuition:
      "Water above any bar is trapped by whichever side is shorter -- the tallest bar on the left or the tallest bar on the right. Think of it like two walls: water can only rise to the height of the shorter wall. By processing from the side with the smaller known max, you can guarantee the water level at that position without needing to know the exact max on the other side (you already know it is at least as tall).",
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
    jsCode: `var trap = function(height) {
    if (!height.length) {
        return 0;
    }

    let left = 0;
    let right = height.length - 1;

    // Track the tallest bar seen so far from each side
    let leftMax = height[left];
    let rightMax = height[right];

    let water = 0;

    while (left < right) {
        if (leftMax < rightMax) {
            // Process from the left side (it is the bottleneck)
            left = left + 1;
            const currentHeight = height[left];

            // Update the left maximum if current bar is taller
            if (currentHeight > leftMax) {
                leftMax = currentHeight;
            }

            // Water trapped here = leftMax minus current bar height
            water = water + (leftMax - currentHeight);
        } else {
            // Process from the right side (it is the bottleneck)
            right = right - 1;
            const currentHeight = height[right];

            // Update the right maximum if current bar is taller
            if (currentHeight > rightMax) {
                rightMax = currentHeight;
            }

            // Water trapped here = rightMax minus current bar height
            water = water + (rightMax - currentHeight);
        }
    }

    return water;
};`,
    jsWalkthrough:
      'height = [0,1,0,2,1,0,1,3,2,1,2,1]\n\n' +
      'Start: left=0, right=11, leftMax=0, rightMax=1, water=0\n\n' +
      'leftMax(0) < rightMax(1) → process left side\n' +
      '  left=1, currentHeight=1, leftMax=max(0,1)=1, water+=1-1=0\n\n' +
      'leftMax(1) >= rightMax(1) → process right side\n' +
      '  right=10, currentHeight=2, rightMax=max(1,2)=2, water+=2-2=0\n\n' +
      'leftMax(1) < rightMax(2) → process left side\n' +
      '  left=2, currentHeight=0, leftMax=max(1,0)=1, water+=1-0=1  [total=1]\n\n' +
      'leftMax(1) < rightMax(2) → process left side\n' +
      '  left=3, currentHeight=2, leftMax=max(1,2)=2, water+=2-2=0\n\n' +
      '... (continuing through all positions)\n\n' +
      'Final water = 6',
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
    intuition:
      "A palindrome reads the same forwards and backwards, so you just need to check that characters match from both ends moving inward. The twist here is ignoring non-letter/number characters and case -- just skip over punctuation and spaces, and compare everything in lowercase. No need to actually build a cleaned string.",
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
    jsCode: `var isPalindrome = function(s) {
    let left = 0;
    let right = s.length - 1;

    while (left < right) {
        // Skip non-alphanumeric characters from the left
        while (left < right && !isAlphanumeric(s[left])) {
            left = left + 1;
        }

        // Skip non-alphanumeric characters from the right
        while (left < right && !isAlphanumeric(s[right])) {
            right = right - 1;
        }

        // Compare characters case-insensitively
        const leftChar = s[left].toLowerCase();
        const rightChar = s[right].toLowerCase();

        if (leftChar !== rightChar) {
            return false;
        }

        left = left + 1;
        right = right - 1;
    }

    return true;
};

function isAlphanumeric(c) {
    return /[a-zA-Z0-9]/.test(c);
}`,
    jsWalkthrough:
      's = "A man, a plan, a canal: Panama"\n\n' +
      'left=0, right=29\n\n' +
      'Step 1: s[0]="A" (alnum), s[29]="a" (alnum)\n' +
      '        leftChar="a", rightChar="a" → match\n' +
      '        left=1, right=28\n\n' +
      'Step 2: s[1]=" " → skip left, left=2 ("m")\n' +
      '        s[28]="m" (alnum)\n' +
      '        leftChar="m", rightChar="m" → match\n' +
      '        left=3, right=27\n\n' +
      'Step 3: s[3]="a", s[27]="a" → match\n' +
      '        left=4, right=26\n\n' +
      '... (continuing, all characters match)\n\n' +
      'return true',
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
    intuition:
      "Because the array is sorted, the sum of the smallest and largest elements gives you a starting point. If the sum is too small, the only way to increase it is to move the left pointer right (to a bigger number). If too large, move the right pointer left. This binary-search-like narrowing guarantees you find the pair in one pass.",
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
    jsCode: `var twoSum = function(numbers, target) {
    let left = 0;
    let right = numbers.length - 1;

    while (left < right) {
        const leftNum = numbers[left];
        const rightNum = numbers[right];
        const currentSum = leftNum + rightNum;

        if (currentSum === target) {
            // Return 1-indexed positions
            return [left + 1, right + 1];
        } else if (currentSum < target) {
            // Sum too small, move left pointer right to increase it
            left = left + 1;
        } else {
            // Sum too large, move right pointer left to decrease it
            right = right - 1;
        }
    }

    return [];
};`,
    jsWalkthrough:
      'numbers = [2,7,11,15], target = 9\n\n' +
      'Start: left=0, right=3\n\n' +
      'Step 1: leftNum=2, rightNum=15, currentSum=17\n' +
      '        17 > 9 → right=2\n\n' +
      'Step 2: leftNum=2, rightNum=11, currentSum=13\n' +
      '        13 > 9 → right=1\n\n' +
      'Step 3: leftNum=2, rightNum=7, currentSum=9\n' +
      '        9 === 9 → return [0+1, 1+1] = [1, 2]',
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
    intuition:
      "Since the array is sorted, all duplicates are grouped together. Think of a slow pointer as a 'writer' that only moves forward when it sees a new value, and a fast pointer as a 'reader' scanning every element. Whenever the reader finds something different from what the writer last wrote, it hands it over. This naturally compacts all unique values to the front.",
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
    jsCode: `var removeDuplicates = function(nums) {
    if (!nums.length) {
        return 0;
    }

    // slow points to the last position that holds a unique element
    let slow = 0;

    for (let fast = 1; fast < nums.length; fast++) {
        const currentNum = nums[fast];
        const lastUniqueNum = nums[slow];

        // When fast finds a new value, write it to the next unique slot
        if (currentNum !== lastUniqueNum) {
            slow = slow + 1;
            nums[slow] = currentNum;
        }
    }

    // slow is 0-indexed, so the count of unique elements is slow + 1
    return slow + 1;
};`,
    jsWalkthrough:
      'nums = [1,1,2,2,3]\n\n' +
      'Start: slow=0 (nums[0]=1)\n\n' +
      'fast=1: currentNum=1, lastUniqueNum=1 → same, skip\n\n' +
      'fast=2: currentNum=2, lastUniqueNum=1 → different!\n' +
      '        slow=1, nums[1]=2\n' +
      '        nums: [1,2,2,2,3]\n\n' +
      'fast=3: currentNum=2, lastUniqueNum=2 → same, skip\n\n' +
      'fast=4: currentNum=3, lastUniqueNum=2 → different!\n' +
      '        slow=2, nums[2]=3\n' +
      '        nums: [1,2,3,2,3]\n\n' +
      'return slow+1 = 3',
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
    intuition:
      "With only three possible values, you can partition the array into three zones in one pass. Imagine three regions growing from both ends and the middle: 0s accumulate on the left, 2s on the right, and 1s stay in the middle. The mid pointer scans through undecided elements and swaps each one into its correct zone.",
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
    jsCode: `var sortColors = function(nums) {
    // low: boundary of the 0s region (everything before low is 0)
    // mid: current element being examined
    // high: boundary of the 2s region (everything after high is 2)
    let low = 0;
    let mid = 0;
    let high = nums.length - 1;

    while (mid <= high) {
        const currentColor = nums[mid];

        if (currentColor === 0) {
            // Swap current element into the 0s region
            const temp = nums[low];
            nums[low] = nums[mid];
            nums[mid] = temp;

            low = low + 1;
            mid = mid + 1;
        } else if (currentColor === 1) {
            // 1 is already in the correct middle region, just advance
            mid = mid + 1;
        } else {
            // Swap current element into the 2s region
            const temp = nums[mid];
            nums[mid] = nums[high];
            nums[high] = temp;

            // Do not advance mid because the swapped-in value needs inspection
            high = high - 1;
        }
    }
};`,
    jsWalkthrough:
      'nums = [2,0,2,1,1,0]\n' +
      'low=0, mid=0, high=5\n\n' +
      'mid=0: currentColor=2 → swap nums[0] and nums[5]\n' +
      '       nums=[0,0,2,1,1,2], high=4  (mid stays at 0)\n\n' +
      'mid=0: currentColor=0 → swap nums[0] and nums[0] (no-op)\n' +
      '       low=1, mid=1\n\n' +
      'mid=1: currentColor=0 → swap nums[1] and nums[1] (no-op)\n' +
      '       low=2, mid=2\n\n' +
      'mid=2: currentColor=2 → swap nums[2] and nums[4]\n' +
      '       nums=[0,0,1,1,2,2], high=3  (mid stays at 2)\n\n' +
      'mid=2: currentColor=1 → mid=3\n\n' +
      'mid=3: currentColor=1 → mid=4\n\n' +
      'mid=4 > high=3 → stop\n' +
      'nums = [0,0,1,1,2,2]',
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
    intuition:
      "Think of the slow pointer as a 'placement position' for the next non-zero value. Every time the fast pointer finds a non-zero, it gets swapped into the next available slot at slow. This is like removing all zeros and compacting the non-zero elements to the front, with zeros naturally filling the vacated spots at the end.",
    approach:
      "Use a slow pointer to track the position for the next non-zero element. Iterate with a fast pointer; when a non-zero element is found, swap it to the slow pointer position. This preserves order and pushes zeros to the end.",
    code: `class Solution:
    def moveZeroes(self, nums: list[int]) -> None:
        slow = 0
        for fast in range(len(nums)):
            if nums[fast] != 0:
                nums[slow], nums[fast] = nums[fast], nums[slow]
                slow += 1`,
    jsCode: `var moveZeroes = function(nums) {
    // slow points to where the next non-zero element should be placed
    let slow = 0;

    for (let fast = 0; fast < nums.length; fast++) {
        const currentNum = nums[fast];

        if (currentNum !== 0) {
            // Swap the non-zero element into the next available slot
            const temp = nums[slow];
            nums[slow] = currentNum;
            nums[fast] = temp;

            slow = slow + 1;
        }
    }
};`,
    jsWalkthrough:
      'nums = [0,1,0,3,12]\n' +
      'slow=0\n\n' +
      'fast=0: currentNum=0 → skip\n\n' +
      'fast=1: currentNum=1 → swap nums[0] and nums[1]\n' +
      '        nums=[1,0,0,3,12], slow=1\n\n' +
      'fast=2: currentNum=0 → skip\n\n' +
      'fast=3: currentNum=3 → swap nums[1] and nums[3]\n' +
      '        nums=[1,3,0,0,12], slow=2\n\n' +
      'fast=4: currentNum=12 → swap nums[2] and nums[4]\n' +
      '        nums=[1,3,12,0,0], slow=3\n\n' +
      'return (in-place): [1,3,12,0,0]',
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
    intuition:
      "Reversing is just swapping mirror-image positions: the first element goes to the last, the second to the second-to-last, and so on. Two pointers from opposite ends, swapping and moving inward, handle this perfectly. It is the simplest possible two-pointer pattern.",
    approach:
      "Use two pointers at both ends of the array. Swap the characters at the two pointers and move them toward the center until they meet.",
    code: `class Solution:
    def reverseString(self, s: list[str]) -> None:
        left, right = 0, len(s) - 1
        while left < right:
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1`,
    jsCode: `var reverseString = function(s) {
    let left = 0;
    let right = s.length - 1;

    while (left < right) {
        // Swap the characters at both ends
        const temp = s[left];
        s[left] = s[right];
        s[right] = temp;

        // Move both pointers toward the center
        left = left + 1;
        right = right - 1;
    }
};`,
    jsWalkthrough:
      's = ["h","e","l","l","o"]\n' +
      'left=0, right=4\n\n' +
      'Step 1: swap s[0]="h" and s[4]="o"\n' +
      '        s=["o","e","l","l","h"], left=1, right=3\n\n' +
      'Step 2: swap s[1]="e" and s[3]="l"\n' +
      '        s=["o","l","l","e","h"], left=2, right=2\n\n' +
      'left >= right → stop\n\n' +
      's = ["o","l","l","e","h"]',
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
    intuition:
      "A subsequence just means the characters appear in order, not necessarily consecutively. Walk through t one character at a time -- whenever you see the next character you need from s, check it off and move on to the next one. If you check off all characters of s before running out of t, it is a subsequence. The greedy approach of matching as early as possible always works.",
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
    jsCode: `var isSubsequence = function(s, t) {
    // sIndex tracks how much of s we have matched so far
    let sIndex = 0;
    // tIndex scans through every character of t
    let tIndex = 0;

    while (sIndex < s.length && tIndex < t.length) {
        const sChar = s[sIndex];
        const tChar = t[tIndex];

        if (sChar === tChar) {
            // Found the next character of s, advance the s pointer
            sIndex = sIndex + 1;
        }

        // Always advance through t
        tIndex = tIndex + 1;
    }

    // If sIndex reached the end, all characters of s were matched in order
    return sIndex === s.length;
};`,
    jsWalkthrough:
      's = "abc", t = "ahbgdc"\n\n' +
      'sIndex=0, tIndex=0\n\n' +
      'tIndex=0: sChar="a", tChar="a" → match! sIndex=1, tIndex=1\n\n' +
      'tIndex=1: sChar="b", tChar="h" → no match, tIndex=2\n\n' +
      'tIndex=2: sChar="b", tChar="b" → match! sIndex=2, tIndex=3\n\n' +
      'tIndex=3: sChar="c", tChar="g" → no match, tIndex=4\n\n' +
      'tIndex=4: sChar="c", tChar="d" → no match, tIndex=5\n\n' +
      'tIndex=5: sChar="c", tChar="c" → match! sIndex=3, tIndex=6\n\n' +
      'sIndex=3 === s.length=3 → return true',
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
    intuition:
      "Start with a normal palindrome check from both ends. If the characters match, great -- keep going. The moment you hit a mismatch, you get to use your one deletion: either skip the left character or the right character. Whichever skip leads to a valid palindrome in the remaining substring means the answer is true. This branching only happens once, so it stays efficient.",
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
    jsCode: `var validPalindrome = function(s) {
    // Helper: check if s[lo..hi] is a strict palindrome (no deletions allowed)
    const isPalindrome = (lo, hi) => {
        while (lo < hi) {
            if (s[lo] !== s[hi]) {
                return false;
            }
            lo = lo + 1;
            hi = hi - 1;
        }
        return true;
    };

    let left = 0;
    let right = s.length - 1;

    while (left < right) {
        if (s[left] !== s[right]) {
            // Use our one allowed deletion: try skipping left or skipping right
            const skipLeft = isPalindrome(left + 1, right);
            const skipRight = isPalindrome(left, right - 1);
            return skipLeft || skipRight;
        }

        left = left + 1;
        right = right - 1;
    }

    return true;
};`,
    jsWalkthrough:
      's = "abca"\n' +
      'left=0, right=3\n\n' +
      'Step 1: s[0]="a", s[3]="a" → match, left=1, right=2\n\n' +
      'Step 2: s[1]="b", s[2]="c" → MISMATCH\n' +
      '        Try skipLeft: isPalindrome(2, 2) → "c" alone → true!\n' +
      '        return true\n\n' +
      '(Even if skipLeft were false, skipRight would check isPalindrome(1,1) = "b" → true)',
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
    intuition:
      "Each boat fits at most two people. The heaviest person must go on a boat regardless, so the best you can do is pair them with the lightest person. If even the lightest person cannot share with them, nobody can, so the heavy person rides alone. Sorting and using two pointers from both ends implements this greedy pairing optimally.",
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
    jsCode: `var numRescueBoats = function(people, limit) {
    // Sort so we can pair the lightest with the heaviest
    people.sort((a, b) => a - b);

    let left = 0;
    let right = people.length - 1;
    let boats = 0;

    while (left <= right) {
        const lightestWeight = people[left];
        const heaviestWeight = people[right];
        const combinedWeight = lightestWeight + heaviestWeight;

        if (combinedWeight <= limit) {
            // Lightest and heaviest can share a boat
            left = left + 1;
        }

        // The heaviest person always takes a boat (alone or shared)
        right = right - 1;
        boats = boats + 1;
    }

    return boats;
};`,
    jsWalkthrough:
      'people = [3,2,2,1], limit = 3\n\n' +
      'After sort: [1,2,2,3]\n' +
      'left=0, right=3, boats=0\n\n' +
      'Step 1: lightestWeight=1, heaviestWeight=3, combined=4 > 3\n' +
      '        Heaviest rides alone: right=2, boats=1\n\n' +
      'Step 2: lightestWeight=1, heaviestWeight=2, combined=3 <= 3\n' +
      '        They share: left=1, right=1, boats=2\n\n' +
      'Step 3: left=1 <= right=1, lightestWeight=2, heaviestWeight=2, combined=4 > 3\n' +
      '        Heaviest rides alone: right=0, boats=3\n\n' +
      'left=1 > right=0 → stop\n' +
      'return 3',
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
    intuition:
      "If you merge from the front, you would overwrite elements in nums1 that you still need. The trick is to merge from the back -- the empty space at the end of nums1 is exactly where the largest elements should go. By placing the largest remaining element at the end and working backwards, you never overwrite anything you have not already processed.",
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
    jsCode: `var merge = function(nums1, m, nums2, n) {
    // Start from the end of valid elements in each array
    let p1 = m - 1;
    let p2 = n - 1;

    // Start filling from the very end of nums1 (the merged position)
    let mergePos = m + n - 1;

    while (p2 >= 0) {
        const num1 = nums1[p1];
        const num2 = nums2[p2];

        if (p1 >= 0 && num1 > num2) {
            // nums1's current element is larger, place it at mergePos
            nums1[mergePos] = num1;
            p1 = p1 - 1;
        } else {
            // nums2's current element is larger (or nums1 is exhausted)
            nums1[mergePos] = num2;
            p2 = p2 - 1;
        }

        mergePos = mergePos - 1;
    }
};`,
    jsWalkthrough:
      'nums1 = [1,2,3,0,0,0], m=3, nums2 = [2,5,6], n=3\n' +
      'p1=2, p2=2, mergePos=5\n\n' +
      'Step 1: num1=nums1[2]=3, num2=nums2[2]=6\n' +
      '        3 < 6 → place 6 at mergePos=5\n' +
      '        nums1=[1,2,3,0,0,6], p2=1, mergePos=4\n\n' +
      'Step 2: num1=nums1[2]=3, num2=nums2[1]=5\n' +
      '        3 < 5 → place 5 at mergePos=4\n' +
      '        nums1=[1,2,3,0,5,6], p2=0, mergePos=3\n\n' +
      'Step 3: num1=nums1[2]=3, num2=nums2[0]=2\n' +
      '        3 > 2 → place 3 at mergePos=3\n' +
      '        nums1=[1,2,3,3,5,6], p1=1, mergePos=2\n\n' +
      'Step 4: num1=nums1[1]=2, num2=nums2[0]=2\n' +
      '        2 === 2, else branch → place 2 from nums2 at mergePos=2\n' +
      '        nums1=[1,2,2,3,5,6], p2=-1, mergePos=1\n\n' +
      'p2 < 0 → stop\n' +
      'nums1 = [1,2,2,3,5,6]',
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
    intuition:
      "Imagine a window sliding over the string that grows as long as all characters inside it are unique. The moment a duplicate appears, you shrink the window from the left until the duplicate is gone. A set tracks what is currently in the window, making duplicate detection instant. This is the classic sliding window pattern: expand to explore, shrink to restore a constraint.",
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
    jsCode: `var lengthOfLongestSubstring = function(s) {
    // Set holds all characters currently in the window
    const charSet = new Set();
    let left = 0;
    let maxLen = 0;

    for (let right = 0; right < s.length; right++) {
        const newChar = s[right];

        // If the new character is already in the window, shrink from the left
        // until we remove the duplicate
        while (charSet.has(newChar)) {
            const leftChar = s[left];
            charSet.delete(leftChar);
            left = left + 1;
        }

        // Now the new character is safe to add
        charSet.add(newChar);

        // Check if this window is the longest seen so far
        const currentWindowLen = right - left + 1;
        if (currentWindowLen > maxLen) {
            maxLen = currentWindowLen;
        }
    }

    return maxLen;
};`,
    jsWalkthrough:
      's = "abcabcbb"\n\n' +
      'right=0: newChar="a", set={}, no dup → add "a", set={"a"}, window="a", maxLen=1\n\n' +
      'right=1: newChar="b", set={"a"}, no dup → add "b", set={"a","b"}, window="ab", maxLen=2\n\n' +
      'right=2: newChar="c", set={"a","b"}, no dup → add "c", set={"a","b","c"}, window="abc", maxLen=3\n\n' +
      'right=3: newChar="a", set has "a"!\n' +
      '         remove s[left=0]="a", set={"b","c"}, left=1\n' +
      '         "a" gone → add "a", set={"b","c","a"}, window="bca", maxLen=3\n\n' +
      'right=4: newChar="b", set has "b"!\n' +
      '         remove s[left=1]="b", set={"c","a"}, left=2\n' +
      '         "b" gone → add "b", set={"c","a","b"}, window="cab", maxLen=3\n\n' +
      '... (window never exceeds length 3)\n\n' +
      'return 3',
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
    intuition:
      "First grow the window until it contains all required characters, then shrink it from the left to find the smallest valid window. The 'formed' counter is the key optimization -- instead of comparing entire frequency maps each time, you just track how many distinct characters have met their required count. When formed equals the number of distinct characters in t, the window is valid.",
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
    jsCode: `var minWindow = function(s, t) {
    if (!t || !s) {
        return "";
    }

    // Build frequency map for characters required by t
    const tCount = {};
    for (const c of t) {
        const currentCount = tCount[c] || 0;
        tCount[c] = currentCount + 1;
    }

    // required = how many distinct characters we need to satisfy
    const required = Object.keys(tCount).length;

    // formed = how many distinct characters currently meet their required count
    let formed = 0;

    // windowCounts tracks character frequencies in the current window
    const windowCounts = {};

    let left = 0;
    let minLen = Infinity;
    let minLeft = 0;

    for (let right = 0; right < s.length; right++) {
        const char = s[right];

        // Add the new character to the window
        const prevCount = windowCounts[char] || 0;
        windowCounts[char] = prevCount + 1;

        // Check if this character now fully satisfies its requirement
        if (char in tCount && windowCounts[char] === tCount[char]) {
            formed = formed + 1;
        }

        // Try to shrink the window while it is still valid
        while (formed === required) {
            const currentWindowLen = right - left + 1;

            // Update the best (smallest) window found so far
            if (currentWindowLen < minLen) {
                minLen = currentWindowLen;
                minLeft = left;
            }

            // Remove the leftmost character from the window
            const leftChar = s[left];
            windowCounts[leftChar] = windowCounts[leftChar] - 1;

            // Check if removing it breaks a requirement
            if (leftChar in tCount && windowCounts[leftChar] < tCount[leftChar]) {
                formed = formed - 1;
            }

            left = left + 1;
        }
    }

    return minLen === Infinity ? "" : s.substring(minLeft, minLeft + minLen);
};`,
    jsWalkthrough:
      's = "ADOBECODEBANC", t = "ABC"\n' +
      'tCount = {A:1, B:1, C:1}, required=3\n\n' +
      'Expand right until we have A, B, and C:\n' +
      '  right=0 "A": windowCounts={A:1}, formed=1 (A satisfied)\n' +
      '  right=1 "D": windowCounts={A:1,D:1}, formed=1\n' +
      '  right=2 "O": formed=1\n' +
      '  right=3 "B": windowCounts={...,B:1}, formed=2 (B satisfied)\n' +
      '  right=4 "E": formed=2\n' +
      '  right=5 "C": windowCounts={...,C:1}, formed=3 (all satisfied!)\n\n' +
      'Shrink from left:\n' +
      '  window="ADOBEC" (len=6), minLen=6, minLeft=0\n' +
      '  remove "A": windowCounts={A:0}, A drops below requirement, formed=2\n' +
      '  stop shrinking\n\n' +
      'Continue expanding...\n' +
      '  right=9 "A": formed=3 again\n' +
      '  Shrink: window="BANC" (len=4), minLen=4, minLeft=9\n\n' +
      'return s.substring(9, 13) = "BANC"',
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
    intuition:
      "You want to buy at the lowest point before selling at the highest point after it. As you walk through prices day by day, just remember the cheapest price you have seen so far. At each day, the best you could do is sell at today's price having bought at that cheapest point. This one-pass approach naturally finds the optimal buy-sell pair.",
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
    jsCode: `var maxProfit = function(prices) {
    // Track the cheapest buy price seen so far
    let minPrice = Infinity;

    // Track the best profit achievable so far
    let maxProfit = 0;

    for (const price of prices) {
        // Update the cheapest price we could have bought at
        if (price < minPrice) {
            minPrice = price;
        }

        // If we sold today, what would our profit be?
        const profitIfSoldToday = price - minPrice;

        // Update best profit if today's potential profit is better
        if (profitIfSoldToday > maxProfit) {
            maxProfit = profitIfSoldToday;
        }
    }

    return maxProfit;
};`,
    jsWalkthrough:
      'prices = [7,1,5,3,6,4]\n\n' +
      'price=7: minPrice=7, profitIfSoldToday=0, maxProfit=0\n\n' +
      'price=1: minPrice=1, profitIfSoldToday=0, maxProfit=0\n\n' +
      'price=5: minPrice=1, profitIfSoldToday=5-1=4, maxProfit=4\n\n' +
      'price=3: minPrice=1, profitIfSoldToday=3-1=2, maxProfit=4\n\n' +
      'price=6: minPrice=1, profitIfSoldToday=6-1=5, maxProfit=5\n\n' +
      'price=4: minPrice=1, profitIfSoldToday=4-1=3, maxProfit=5\n\n' +
      'return 5',
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
    intuition:
      "In any window, the optimal strategy is to keep the most frequent character and replace all others. So the number of replacements needed is window_size minus the count of the most frequent character. If that exceeds k, the window is too big. The clever trick is that you never need to decrease the max frequency when shrinking -- a smaller max frequency could never produce a longer answer than what you already found.",
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
    jsCode: `var characterReplacement = function(s, k) {
    // count tracks how often each character appears in the current window
    const count = {};
    let left = 0;

    // maxFreq is the highest frequency of any single character in the window
    // We never decrease it -- only a higher maxFreq can beat our current best
    let maxFreq = 0;
    let maxLen = 0;

    for (let right = 0; right < s.length; right++) {
        const rightChar = s[right];

        // Add the new character to the window counts
        const prevCount = count[rightChar] || 0;
        count[rightChar] = prevCount + 1;

        // Update the max frequency seen in this window
        if (count[rightChar] > maxFreq) {
            maxFreq = count[rightChar];
        }

        // Replacements needed = window size minus the most frequent character
        const windowSize = right - left + 1;
        const replacementsNeeded = windowSize - maxFreq;

        if (replacementsNeeded > k) {
            // Window is invalid, shrink by one from the left
            const leftChar = s[left];
            count[leftChar] = count[leftChar] - 1;
            left = left + 1;
        }

        // Window is now valid (or was already valid), record its length
        const currentLen = right - left + 1;
        if (currentLen > maxLen) {
            maxLen = currentLen;
        }
    }

    return maxLen;
};`,
    jsWalkthrough:
      's = "AABABBA", k = 1\n\n' +
      'right=0 "A": count={A:1}, maxFreq=1, windowSize=1, replacements=0 <= 1 → maxLen=1\n\n' +
      'right=1 "A": count={A:2}, maxFreq=2, windowSize=2, replacements=0 <= 1 → maxLen=2\n\n' +
      'right=2 "B": count={A:2,B:1}, maxFreq=2, windowSize=3, replacements=1 <= 1 → maxLen=3\n\n' +
      'right=3 "A": count={A:3,B:1}, maxFreq=3, windowSize=4, replacements=1 <= 1 → maxLen=4\n\n' +
      'right=4 "B": count={A:3,B:2}, maxFreq=3, windowSize=5, replacements=2 > 1\n' +
      '            shrink: remove s[left=0]="A", count={A:2,B:2}, left=1\n' +
      '            currentLen=4, maxLen=4\n\n' +
      'right=5 "B": count={A:2,B:3}, maxFreq=3, windowSize=5, replacements=2 > 1\n' +
      '            shrink: remove s[left=1]="A", count={A:1,B:3}, left=2\n' +
      '            currentLen=4, maxLen=4\n\n' +
      'right=6 "A": count={A:2,B:3}, maxFreq=3, windowSize=5, replacements=2 > 1\n' +
      '            shrink: remove s[left=2]="B", count={A:2,B:2}, left=3\n' +
      '            currentLen=4, maxLen=4\n\n' +
      'return 4',
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
    intuition:
      "A permutation of s1 is just a rearrangement -- it has exactly the same character frequencies. So the question becomes: is there any substring of s2 with length equal to s1 that has the same character frequencies? Slide a fixed-size window across s2, updating character counts as you add/remove one character at a time. The 'matches' counter avoids comparing all 26 frequencies every step.",
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
    jsCode: `var checkInclusion = function(s1, s2) {
    if (s1.length > s2.length) {
        return false;
    }

    const s1Count = new Array(26).fill(0);
    const s2Count = new Array(26).fill(0);
    const aCode = 'a'.charCodeAt(0);

    // Initialize counts for the first window of size s1.length
    for (let i = 0; i < s1.length; i++) {
        s1Count[s1.charCodeAt(i) - aCode] = s1Count[s1.charCodeAt(i) - aCode] + 1;
        s2Count[s2.charCodeAt(i) - aCode] = s2Count[s2.charCodeAt(i) - aCode] + 1;
    }

    // Count how many of the 26 characters already have matching frequencies
    let matches = 0;
    for (let i = 0; i < 26; i++) {
        if (s1Count[i] === s2Count[i]) {
            matches = matches + 1;
        }
    }

    // Slide the window across s2
    for (let i = s1.length; i < s2.length; i++) {
        // All 26 frequencies match -- found a permutation
        if (matches === 26) {
            return true;
        }

        // Add the new character entering the window (right side)
        const addIdx = s2.charCodeAt(i) - aCode;
        s2Count[addIdx] = s2Count[addIdx] + 1;
        if (s2Count[addIdx] === s1Count[addIdx]) {
            // This character just became satisfied
            matches = matches + 1;
        } else if (s2Count[addIdx] === s1Count[addIdx] + 1) {
            // This character just became over-satisfied (broke a match)
            matches = matches - 1;
        }

        // Remove the character leaving the window (left side)
        const removeIdx = s2.charCodeAt(i - s1.length) - aCode;
        s2Count[removeIdx] = s2Count[removeIdx] - 1;
        if (s2Count[removeIdx] === s1Count[removeIdx]) {
            // This character just became satisfied again
            matches = matches + 1;
        } else if (s2Count[removeIdx] === s1Count[removeIdx] - 1) {
            // This character just dropped below requirement
            matches = matches - 1;
        }
    }

    return matches === 26;
};`,
    jsWalkthrough:
      's1 = "ab", s2 = "eidbaooo"\n\n' +
      'Initial window "ei": s1Count=[1,1,0,...], s2Count=[0,0,...,1(e),0,...,1(i),...]\n' +
      'matches: only positions where both are 0 match (24 of them) → matches=24\n\n' +
      'Slide i=2 (add "d", remove "e"):\n' +
      '  add "d": s2Count[d] goes 0→1, s1Count[d]=0, so 1≠0, no match change → matches=24\n' +
      '  remove "e": s2Count[e] goes 1→0, s1Count[e]=0, now equal → matches=25\n\n' +
      'Slide i=3 (add "b", remove "i"):\n' +
      '  add "b": s2Count[b] goes 0→1, s1Count[b]=1, now equal → matches=26\n' +
      '  (we check matches===26 at the top of next iteration)\n\n' +
      'i=4: matches===26 → return true',
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
    intuition:
      "A monotonic decreasing deque keeps potential maximums in order. When a new element enters, remove all smaller elements from the back -- they can never be the maximum again because the new element is both larger and newer (will stay in the window longer). The front of the deque is always the current maximum. This gives O(1) amortized max lookups as the window slides.",
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
    jsCode: `var maxSlidingWindow = function(nums, k) {
    // dq stores indices in decreasing order of their nums values
    // Front of dq is always the index of the window's maximum
    const dq = [];
    const result = [];

    for (let i = 0; i < nums.length; i++) {
        const windowStart = i - k + 1;

        // Remove indices that have fallen outside the window from the front
        while (dq.length > 0 && dq[0] < windowStart) {
            dq.shift();
        }

        // Remove indices from the back whose values are smaller than nums[i]
        // Those elements can never be the maximum while nums[i] is in the window
        while (dq.length > 0 && nums[dq[dq.length - 1]] < nums[i]) {
            dq.pop();
        }

        // Add the current index to the back of the deque
        dq.push(i);

        // Once the first full window is formed, record the maximum (front of dq)
        if (i >= k - 1) {
            result.push(nums[dq[0]]);
        }
    }

    return result;
};`,
    jsWalkthrough:
      'nums = [1,3,-1,-3,5,3,6,7], k = 3\n\n' +
      'i=0: nums[0]=1, dq=[], push 0 → dq=[0]. i<k-1, no output\n\n' +
      'i=1: nums[1]=3, nums[dq.back=0]=1 < 3 → pop 0, dq=[]\n' +
      '     push 1 → dq=[1]. i<k-1, no output\n\n' +
      'i=2: nums[2]=-1, nums[dq.back=1]=3 >= -1 → keep\n' +
      '     push 2 → dq=[1,2]. i>=k-1, output nums[dq[0]]=nums[1]=3\n\n' +
      'i=3: nums[3]=-3, dq[0]=1, windowStart=1, 1>=1 → keep\n' +
      '     nums[dq.back=2]=-1 >= -3 → keep, push 3 → dq=[1,2,3]\n' +
      '     output nums[dq[0]]=nums[1]=3\n\n' +
      'i=4: nums[4]=5, dq[0]=1, windowStart=2, 1<2 → remove 1, dq=[2,3]\n' +
      '     nums[3]=-3 < 5 → pop, nums[2]=-1 < 5 → pop, dq=[]\n' +
      '     push 4 → dq=[4]. output nums[4]=5\n\n' +
      'i=5: nums[5]=3, nums[4]=5 >= 3 → keep, push 5 → dq=[4,5]\n' +
      '     output nums[dq[0]]=nums[4]=5\n\n' +
      'i=6: nums[6]=6, nums[5]=3 < 6 → pop, nums[4]=5 < 6 → pop, dq=[]\n' +
      '     push 6 → dq=[6]. output nums[6]=6\n\n' +
      'i=7: nums[7]=7, nums[6]=6 < 7 → pop, dq=[]\n' +
      '     push 7 → dq=[7]. output nums[7]=7\n\n' +
      'result = [3,3,5,5,6,7]',
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
    intuition:
      "Since all numbers are positive, growing the window always increases the sum and shrinking always decreases it. This monotonic property makes sliding window perfect: expand until the sum is big enough, then shrink as much as possible to find the shortest valid subarray. Every element is added and removed at most once, so it is O(n) despite the nested loops.",
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
    jsCode: `var minSubArrayLen = function(target, nums) {
    let left = 0;
    let currentSum = 0;
    let minLen = Infinity;

    for (let right = 0; right < nums.length; right++) {
        // Expand the window by adding the element at right
        currentSum = currentSum + nums[right];

        // While the window sum meets the target, try to shrink it
        while (currentSum >= target) {
            const currentWindowLen = right - left + 1;

            // Update the minimum length if this window is shorter
            if (currentWindowLen < minLen) {
                minLen = currentWindowLen;
            }

            // Shrink from the left
            currentSum = currentSum - nums[left];
            left = left + 1;
        }
    }

    return minLen === Infinity ? 0 : minLen;
};`,
    jsWalkthrough:
      'target = 7, nums = [2,3,1,2,4,3]\n\n' +
      'right=0: currentSum=2, 2<7 → no shrink\n\n' +
      'right=1: currentSum=5, 5<7 → no shrink\n\n' +
      'right=2: currentSum=6, 6<7 → no shrink\n\n' +
      'right=3: currentSum=8, 8>=7 → shrink!\n' +
      '         windowLen=4, minLen=4\n' +
      '         remove nums[0]=2, currentSum=6, left=1\n' +
      '         6<7, stop shrinking\n\n' +
      'right=4: currentSum=10, 10>=7 → shrink!\n' +
      '         windowLen=4, minLen=4 (no change)\n' +
      '         remove nums[1]=3, currentSum=7, left=2\n' +
      '         7>=7 → shrink again!\n' +
      '         windowLen=3, minLen=3\n' +
      '         remove nums[2]=1, currentSum=6, left=3\n' +
      '         6<7, stop\n\n' +
      'right=5: currentSum=9, 9>=7 → shrink!\n' +
      '         windowLen=3, minLen=3 (no change)\n' +
      '         remove nums[3]=2, currentSum=7, left=4\n' +
      '         7>=7 → shrink again!\n' +
      '         windowLen=2, minLen=2\n' +
      '         remove nums[4]=4, currentSum=3, left=5\n' +
      '         3<7, stop\n\n' +
      'return 2',
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
    intuition:
      "This is the same core idea as Permutation in String (567) -- an anagram is just a permutation, meaning identical character frequencies. Slide a window of size len(p) across s, and at each position check if the character frequencies match. The 'matches' counter incrementally tracks agreement across all 26 letters, so each slide costs O(1) instead of O(26).",
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
    jsCode: `var findAnagrams = function(s, p) {
    if (p.length > s.length) {
        return [];
    }

    const pCount = new Array(26).fill(0);
    const sCount = new Array(26).fill(0);
    const aCode = 'a'.charCodeAt(0);

    // Initialize counts for p and the first window in s
    for (let i = 0; i < p.length; i++) {
        pCount[p.charCodeAt(i) - aCode] = pCount[p.charCodeAt(i) - aCode] + 1;
        sCount[s.charCodeAt(i) - aCode] = sCount[s.charCodeAt(i) - aCode] + 1;
    }

    // Count initial matches across all 26 characters
    let matches = 0;
    for (let i = 0; i < 26; i++) {
        if (pCount[i] === sCount[i]) {
            matches = matches + 1;
        }
    }

    const result = [];

    for (let i = p.length; i < s.length; i++) {
        // If all 26 characters match, the current window is an anagram
        if (matches === 26) {
            result.push(i - p.length);
        }

        // Add the character entering the window (right side)
        const addIdx = s.charCodeAt(i) - aCode;
        sCount[addIdx] = sCount[addIdx] + 1;
        if (sCount[addIdx] === pCount[addIdx]) {
            // This character just became satisfied
            matches = matches + 1;
        } else if (sCount[addIdx] === pCount[addIdx] + 1) {
            // This character just became over-satisfied (broke a match)
            matches = matches - 1;
        }

        // Remove the character leaving the window (left side)
        const removeIdx = s.charCodeAt(i - p.length) - aCode;
        sCount[removeIdx] = sCount[removeIdx] - 1;
        if (sCount[removeIdx] === pCount[removeIdx]) {
            // This character just became satisfied again
            matches = matches + 1;
        } else if (sCount[removeIdx] === pCount[removeIdx] - 1) {
            // This character dropped below requirement
            matches = matches - 1;
        }
    }

    // Check the last window position
    if (matches === 26) {
        result.push(s.length - p.length);
    }

    return result;
};`,
    jsWalkthrough:
      's = "cbaebabacd", p = "abc"\n\n' +
      'pCount: a=1, b=1, c=1, rest=0\n' +
      'Initial window "cba": sCount: a=1, b=1, c=1, rest=0\n' +
      'matches = 26 (all 26 positions match)\n\n' +
      'i=3 (slide to "bae"):\n' +
      '  matches===26 → push 3-3=0 into result. result=[0]\n' +
      '  add "e": sCount[e] 0→1, pCount[e]=0, now 1≠0, matches=25\n' +
      '  remove "c": sCount[c] 1→0, pCount[c]=1, now 0≠1, matches=24\n\n' +
      'i=4 (slide to "aeb"): matches=24, no push\n' +
      '  add "b": sCount[b] 1→2, pCount[b]=1, now 2≠1, matches=23\n' +
      '  remove "b": sCount[b] 2→1, pCount[b]=1, now equal, matches=24\n\n' +
      '... (continue sliding)\n\n' +
      'i=9 (slide to "bac"):\n' +
      '  matches reaches 26 → push 9-3=6 into result. result=[0,6]\n\n' +
      'return [0, 6]',
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
    intuition:
      "Strip away the fruit basket story and the problem is: find the longest contiguous subarray with at most 2 distinct values. A sliding window with a hash map counting each type does the job. Grow the window freely, and whenever a third type appears, shrink from the left until you are back to 2 types. The map size directly tells you how many distinct types are in the window.",
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
    jsCode: `var totalFruit = function(fruits) {
    // count maps each fruit type to how many times it appears in the window
    const count = new Map();
    let left = 0;
    let maxLen = 0;

    for (let right = 0; right < fruits.length; right++) {
        const fruitType = fruits[right];

        // Add the new fruit to the window
        const prevCount = count.get(fruitType) || 0;
        count.set(fruitType, prevCount + 1);

        // If we now have more than 2 distinct types, shrink from the left
        while (count.size > 2) {
            const leftFruitType = fruits[left];
            const leftFruitCount = count.get(leftFruitType);

            count.set(leftFruitType, leftFruitCount - 1);

            // Remove the type entirely if its count drops to zero
            if (count.get(leftFruitType) === 0) {
                count.delete(leftFruitType);
            }

            left = left + 1;
        }

        // Window now has at most 2 distinct types; check if it is the longest
        const currentWindowLen = right - left + 1;
        if (currentWindowLen > maxLen) {
            maxLen = currentWindowLen;
        }
    }

    return maxLen;
};`,
    jsWalkthrough:
      'fruits = [1,2,3,2,2]\n\n' +
      'right=0: fruitType=1, count={1:1}, size=1 <= 2, maxLen=1\n\n' +
      'right=1: fruitType=2, count={1:1,2:1}, size=2 <= 2, maxLen=2\n\n' +
      'right=2: fruitType=3, count={1:1,2:1,3:1}, size=3 > 2!\n' +
      '         remove fruits[0]=1: count={1:0,2:1,3:1} → delete 1\n' +
      '         count={2:1,3:1}, size=2, left=1\n' +
      '         currentWindowLen=2, maxLen=2\n\n' +
      'right=3: fruitType=2, count={2:2,3:1}, size=2 <= 2\n' +
      '         currentWindowLen=3, maxLen=3\n\n' +
      'right=4: fruitType=2, count={2:3,3:1}, size=2 <= 2\n' +
      '         currentWindowLen=4, maxLen=4\n\n' +
      'return 4',
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
    intuition:
      "Instead of thinking about flipping zeros, reframe the problem: find the longest window that contains at most k zeros. Any such window can become all 1s by flipping those zeros. This reframing turns it into a standard sliding window problem -- grow the window, count zeros, and shrink when you have too many.",
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
    jsCode: `var longestOnes = function(nums, k) {
    let left = 0;

    // zeros tracks how many 0s are currently in the window
    let zeros = 0;
    let maxLen = 0;

    for (let right = 0; right < nums.length; right++) {
        const currentNum = nums[right];

        // If we added a 0, increment the zero count
        if (currentNum === 0) {
            zeros = zeros + 1;
        }

        // If we have too many zeros, shrink from the left until we are within budget
        while (zeros > k) {
            const leftNum = nums[left];
            if (leftNum === 0) {
                zeros = zeros - 1;
            }
            left = left + 1;
        }

        // Window now has at most k zeros, record its length
        const currentWindowLen = right - left + 1;
        if (currentWindowLen > maxLen) {
            maxLen = currentWindowLen;
        }
    }

    return maxLen;
};`,
    jsWalkthrough:
      'nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2\n\n' +
      'right=0: currentNum=1, zeros=0, window=[1], maxLen=1\n' +
      'right=1: currentNum=1, zeros=0, window=[1,1], maxLen=2\n' +
      'right=2: currentNum=1, zeros=0, window=[1,1,1], maxLen=3\n' +
      'right=3: currentNum=0, zeros=1 <= 2, window=[1,1,1,0], maxLen=4\n' +
      'right=4: currentNum=0, zeros=2 <= 2, window=[1,1,1,0,0], maxLen=5\n' +
      'right=5: currentNum=0, zeros=3 > 2 → shrink!\n' +
      '         nums[left=0]=1 (not 0), left=1\n' +
      '         nums[left=1]=1 (not 0), left=2\n' +
      '         nums[left=2]=1 (not 0), left=3\n' +
      '         nums[left=3]=0 → zeros=2, left=4\n' +
      '         zeros=2 <= 2, stop. window=[0,0,0], maxLen=5\n\n' +
      'right=6..9: window grows to length 6 (indices 4..9)\n' +
      '            maxLen=6\n\n' +
      'right=10: currentNum=0, zeros=3 > 2 → shrink\n' +
      '          remove nums[4]=0, zeros=2, left=5\n' +
      '          window=[0,1,1,1,1,0], maxLen=6\n\n' +
      'return 6',
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

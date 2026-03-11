export interface TopicLesson {
  topic: string;
  overview: string;
  keyPatterns: string[];
  template: string;       // Python code template
  jsTemplate?: string;    // JavaScript code template
  jsTemplateWalkthrough?: string;  // Step-by-step walkthrough for JS template
  complexity: string;
  commonMistakes: string[];
  tips: string[];
  memorization?: string;  // Mnemonics and techniques for memorizing templates
}

export const lessons: Record<string, TopicLesson> = {
  'Arrays & Hashing': {
    topic: 'Arrays & Hashing',
    overview: `Arrays and hash maps are the most fundamental data structures. The core idea is using a hash map (dictionary) to achieve O(1) lookups, turning brute-force O(n²) solutions into O(n).

Key techniques:
• Hash map for frequency counting
• Hash map for complement/target lookups (Two Sum pattern)
• Hash set for O(1) existence checks
• Prefix sums for subarray sum queries
• In-place array manipulation using indices as hash keys`,
    keyPatterns: [
      'Frequency count: Use Counter or defaultdict to count occurrences',
      'Complement lookup: For each element, check if target - element exists in map',
      'Prefix sum: presum[i] = sum(nums[0..i]), subarray sum = presum[j] - presum[i]',
      'Index as hash: For arrays with values in [1, n], use nums[i]-1 as index',
      'Grouping: Use tuple/frozenset as hash key to group anagrams, etc.',
      'Prefix/Suffix products: result[i] = product of all elements except nums[i], no division',
    ],
    template: `# Two Sum pattern - complement lookup
def two_sum(nums, target):
    seen = {}  # value -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i

# Frequency count pattern
from collections import Counter
def top_k_frequent(nums, k):
    count = Counter(nums)
    return [x for x, _ in count.most_common(k)]

# Prefix sum pattern
def subarray_sum(nums, k):
    prefix = {0: 1}  # prefix_sum -> count
    curr_sum = count = 0
    for num in nums:
        curr_sum += num
        count += prefix.get(curr_sum - k, 0)
        prefix[curr_sum] = prefix.get(curr_sum, 0) + 1
    return count`,
    jsTemplate: `// Two Sum pattern - complement lookup
function twoSum(nums, target) {
    const seen = new Map(); // value -> index

    for (let i = 0; i < nums.length; i++) {
        const currentNum = nums[i];
        const complement = target - currentNum;

        // Check if the partner number was already seen
        if (seen.has(complement)) {
            const partnerIndex = seen.get(complement);
            return [partnerIndex, i];
        }

        // Remember this number and its index
        seen.set(currentNum, i);
    }
}

// Frequency count pattern (bucket sort)
function topKFrequent(nums, k) {
    // Step 1: Count how often each number appears
    const count = new Map();
    for (const num of nums) {
        const current = count.get(num) || 0;
        count.set(num, current + 1);
    }

    // Step 2: Create buckets where index = frequency
    const buckets = Array.from({ length: nums.length + 1 }, () => []);
    for (const [num, freq] of count) {
        buckets[freq].push(num);
    }

    // Step 3: Walk backwards from highest frequency
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
}

// Prefix sum pattern
function subarraySum(nums, k) {
    // Map: prefix sum -> how many times we've seen it
    const prefix = new Map();
    prefix.set(0, 1);  // empty prefix has sum 0

    let currSum = 0;
    let count = 0;

    for (const num of nums) {
        currSum = currSum + num;

        // How many earlier prefix sums equal (currSum - k)?
        const target = currSum - k;
        const matches = prefix.get(target) || 0;
        count = count + matches;

        // Record this prefix sum
        const existing = prefix.get(currSum) || 0;
        prefix.set(currSum, existing + 1);
    }
    return count;
}

// Prefix/Suffix Products (Product of Array Except Self)
function productExceptSelf(nums) {
    const n = nums.length;
    const result = new Array(n).fill(1);

    // Build prefix products (left to right)
    let prefixProduct = 1;
    for (let i = 0; i < n; i++) {
        result[i] = prefixProduct;
        prefixProduct = prefixProduct * nums[i];
    }

    // Multiply by suffix products (right to left)
    let suffixProduct = 1;
    for (let i = n - 1; i >= 0; i--) {
        result[i] = result[i] * suffixProduct;
        suffixProduct = suffixProduct * nums[i];
    }

    return result;
}`,
    jsTemplateWalkthrough:
      '── Two Sum ──\n' +
      'nums = [2, 7, 11, 15], target = 9\n\n' +
      'i=0: currentNum=2, complement=9-2=7\n' +
      '     seen has 7? No → seen: {2→0}\n\n' +
      'i=1: currentNum=7, complement=9-7=2\n' +
      '     seen has 2? Yes, at index 0\n' +
      '     return [0, 1]\n\n' +
      '── Top K Frequent (Bucket Sort) ──\n' +
      'nums = [1,1,1,2,2,3], k = 2\n\n' +
      'Step 1 — count: {1:3, 2:2, 3:1}\n\n' +
      'Step 2 — buckets (index = frequency):\n' +
      '  buckets[1] = [3]\n' +
      '  buckets[2] = [2]\n' +
      '  buckets[3] = [1]\n\n' +
      'Step 3 — walk backwards:\n' +
      '  freq=3: push 1 → result=[1]\n' +
      '  freq=2: push 2 → result=[1,2], length===k → return!\n\n' +
      '── Prefix Sum ──\n' +
      'nums = [1, 1, 1], k = 2\n' +
      'prefix = {0: 1}\n\n' +
      'num=1: currSum=1, target=1-2=-1\n' +
      '       prefix has -1? No → matches=0\n' +
      '       count=0, prefix={0:1, 1:1}\n\n' +
      'num=1: currSum=2, target=2-2=0\n' +
      '       prefix has 0? Yes (1 time) → matches=1\n' +
      '       count=1, prefix={0:1, 1:1, 2:1}\n\n' +
      'num=1: currSum=3, target=3-2=1\n' +
      '       prefix has 1? Yes (1 time) → matches=1\n' +
      '       count=2, prefix={0:1, 1:1, 2:1, 3:1}\n\n' +
      'return 2  (subarrays [1,1] at idx 0-1 and idx 1-2)\n\n' +
      '── Prefix/Suffix Products ──\n' +
      'nums = [1, 2, 3, 4]\n\n' +
      'Prefix pass (left to right):\n' +
      '  i=0: result[0]=1, prefixProduct=1*1=1\n' +
      '  i=1: result[1]=1, prefixProduct=1*2=2\n' +
      '  i=2: result[2]=2, prefixProduct=2*3=6\n' +
      '  i=3: result[3]=6, prefixProduct=6*4=24\n' +
      'result after prefix: [1, 1, 2, 6]\n\n' +
      'Suffix pass (right to left):\n' +
      '  i=3: result[3]=6*1=6,  suffixProduct=1*4=4\n' +
      '  i=2: result[2]=2*4=8,  suffixProduct=4*3=12\n' +
      '  i=1: result[1]=1*12=12, suffixProduct=12*2=24\n' +
      '  i=0: result[0]=1*24=24, suffixProduct=24*1=24\n\n' +
      'return [24, 12, 8, 6]  (each = product of all other elements)',
    complexity: 'Most hash map solutions: O(n) time, O(n) space. Prefix sum: O(n) time, O(n) space.',
    commonMistakes: [
      'Forgetting to handle duplicate keys in hash map',
      'Not considering negative numbers in prefix sum problems',
      'Using list as dict key (use tuple instead)',
      'Off-by-one in prefix sum indexing',
    ],
    tips: [
      'When you see "find pair/subarray with sum = target", think hash map',
      'Counter().most_common(k) is your friend for top-k problems',
      'For "group by" problems, define a canonical key (sorted tuple, char count tuple)',
      'Prefix sum + hash map solves most subarray sum problems in O(n)',
    ],
    memorization: `HOW TO MEMORIZE THE HASH MAP TEMPLATE:
The "Two Sum" pattern is the mother of all hash map problems. Memorize it as 3 steps:
  1. CREATE the map (seen = {})
  2. COMPUTE what you need (complement = target - num)
  3. CHECK if it exists, else STORE current

Mnemonic: "CCC" - Create, Compute, Check

For Prefix Sum, remember the equation:
  subarray_sum(i, j) = prefix[j] - prefix[i]
Initialize with {0: 1} because an empty prefix sums to 0.

VISUAL ANCHOR: Picture a dictionary/phonebook. Instead of scanning every entry (O(n^2)), you flip directly to the right page (O(1) lookup). That's what hash maps do.`,
  },

  'Two Pointers': {
    topic: 'Two Pointers',
    overview: `Two pointers technique uses two indices that move through the array to solve problems in O(n) time without extra space. Works best on sorted arrays or when searching for pairs/triplets.

Three main patterns:
• Opposite direction: left=0, right=n-1, move inward
• Same direction: slow/fast pointers
• Partition: separate elements by condition`,
    keyPatterns: [
      'Opposite ends: Start from both ends, shrink based on comparison (sorted arrays)',
      'Fast & slow: Fast moves 2x, slow moves 1x (cycle detection, middle finding)',
      'Partition: One pointer tracks position, other scans (Dutch flag, remove duplicates)',
      'Three pointers: Extension for 3Sum - fix one, two-pointer on rest',
      'Trapping rain water: Track leftMax and rightMax; bottleneck side determines water level',
    ],
    template: `# Opposite direction - pair with target sum (sorted)
def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        curr = nums[left] + nums[right]
        if curr == target:
            return [left, right]
        elif curr < target:
            left += 1
        else:
            right -= 1

# 3Sum pattern - fix one, two-pointer on rest
def three_sum(nums):
    nums.sort()
    result = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i-1]:
            continue  # skip duplicates
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left+1]:
                    left += 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    return result

# Partition - remove duplicates in-place
def remove_duplicates(nums):
    if not nums:
        return 0
    slow = 0
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    return slow + 1`,
    jsTemplate: `// Opposite direction - pair with target sum (sorted)
function twoSumSorted(nums, target) {
    let left = 0;
    let right = nums.length - 1;

    while (left < right) {
        const curr = nums[left] + nums[right];

        if (curr === target) {
            return [left, right];
        } else if (curr < target) {
            // Sum too small — move left pointer right to increase it
            left++;
        } else {
            // Sum too big — move right pointer left to decrease it
            right--;
        }
    }
}

// 3Sum pattern - fix one, two-pointer on rest
function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const result = [];

    for (let i = 0; i < nums.length - 2; i++) {
        // Skip duplicate values for the fixed element
        if (i > 0 && nums[i] === nums[i - 1]) {
            continue;
        }

        let left = i + 1;
        let right = nums.length - 1;

        while (left < right) {
            const total = nums[i] + nums[left] + nums[right];

            if (total === 0) {
                result.push([nums[i], nums[left], nums[right]]);

                // Skip duplicate values for left pointer
                while (left < right && nums[left] === nums[left + 1]) {
                    left++;
                }
                left++;
                right--;
            } else if (total < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return result;
}

// Partition - remove duplicates in-place
function removeDuplicates(nums) {
    if (!nums.length) {
        return 0;
    }

    // slow tracks the last position of the unique-element section
    let slow = 0;

    for (let fast = 1; fast < nums.length; fast++) {
        if (nums[fast] !== nums[slow]) {
            // Found a new unique element — extend the unique section
            slow++;
            nums[slow] = nums[fast];
        }
    }

    return slow + 1;
}

// Trapping Rain Water (two-pointer approach)
function trap(height) {
    let left = 0;
    let right = height.length - 1;
    let leftMax = 0;
    let rightMax = 0;
    let totalWater = 0;

    while (left < right) {
        if (height[left] < height[right]) {
            // Left side is the bottleneck
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                // Water trapped = leftMax - current height
                totalWater = totalWater + (leftMax - height[left]);
            }
            left = left + 1;
        } else {
            // Right side is the bottleneck
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                totalWater = totalWater + (rightMax - height[right]);
            }
            right = right - 1;
        }
    }

    return totalWater;
}`,
    jsTemplateWalkthrough:
      '── Two Sum Sorted ──\n' +
      'nums = [1, 3, 5, 7, 9], target = 10\n\n' +
      'left=0, right=4: curr = 1+9 = 10 → found!\n' +
      'return [0, 4]\n\n' +
      'Another example: target = 8\n' +
      'left=0, right=4: curr = 1+9 = 10 > 8 → right--\n' +
      'left=0, right=3: curr = 1+7 = 8 → found!\n' +
      'return [0, 3]\n\n' +
      '── 3Sum ──\n' +
      'nums = [-4, -1, -1, 0, 1, 2] (already sorted)\n\n' +
      'i=0: fixed=-4, left=1, right=5\n' +
      '  total = -4 + (-1) + 2 = -3 < 0 → left++\n' +
      '  total = -4 + (-1) + 2 = -3 < 0 → left++\n' +
      '  total = -4 + 0 + 2 = -2 < 0 → left++\n' +
      '  total = -4 + 1 + 2 = -1 < 0 → left++ → left=right, stop\n\n' +
      'i=1: fixed=-1, left=2, right=5\n' +
      '  total = -1 + (-1) + 2 = 0 → push [-1,-1,2]\n' +
      '  left++ → 3, right-- → 4\n' +
      '  total = -1 + 0 + 1 = 0 → push [-1,0,1]\n' +
      '  left++ → 4 = right, stop\n\n' +
      'i=2: nums[2]=-1 === nums[1]=-1, i>0 → skip\n\n' +
      'result = [[-1,-1,2], [-1,0,1]]\n\n' +
      '── Remove Duplicates ──\n' +
      'nums = [1, 1, 2, 3, 3], slow=0\n\n' +
      'fast=1: nums[1]=1 === nums[0]=1 → skip\n' +
      'fast=2: nums[2]=2 !== nums[0]=1\n' +
      '        slow=1, nums[1]=2 → [1, 2, 2, 3, 3]\n' +
      'fast=3: nums[3]=3 !== nums[1]=2\n' +
      '        slow=2, nums[2]=3 → [1, 2, 3, 3, 3]\n' +
      'fast=4: nums[4]=3 === nums[2]=3 → skip\n\n' +
      'return slow+1 = 3  (unique elements: [1, 2, 3])\n\n' +
      '── Trapping Rain Water ──\n' +
      'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]\n\n' +
      'left=0, right=11, leftMax=0, rightMax=0, totalWater=0\n\n' +
      'h[0]=0 < h[11]=1 → left side bottleneck\n' +
      '  h[0]=0 >= leftMax=0 → leftMax=0, left=1\n' +
      'h[1]=1 < h[11]=1? No, equal → right side\n' +
      '  h[11]=1 >= rightMax=0 → rightMax=1, right=10\n' +
      'h[1]=1 >= h[10]=2? No → left side\n' +
      '  h[1]=1 >= leftMax=0 → leftMax=1, left=2\n' +
      'h[2]=0 < h[10]=2 → left side\n' +
      '  h[2]=0 < leftMax=1 → totalWater += 1-0 = 1, left=3\n' +
      'h[3]=2 >= h[10]=2? equal → right side\n' +
      '  h[10]=2 >= rightMax=1 → rightMax=2, right=9\n' +
      '... (continues accumulating)\n\n' +
      'return totalWater = 6',
    complexity: 'O(n) for two pointers on sorted array. O(n²) for 3Sum. O(1) extra space.',
    commonMistakes: [
      'Forgetting to sort the array first',
      'Not handling duplicate skipping in 3Sum',
      'Moving wrong pointer (move the one that gets you closer to target)',
      'Off-by-one when initializing pointers',
    ],
    tips: [
      'If array is sorted and you need pairs → opposite-direction two pointers',
      'For "container" problems, always move the shorter side',
      'To skip duplicates: while left < right and nums[left] == nums[left+1]: left += 1',
      'Trapping rain water: track left_max and right_max with two pointers',
    ],
    memorization: `HOW TO MEMORIZE TWO POINTERS:
Three shapes to visualize:
  1. PINCH (opposite ends): left=0, right=n-1, squeeze inward like a vise
  2. RACE (same direction): fast runs ahead, slow follows - like a tortoise and hare
  3. ANCHOR + SCAN: fix one pointer, scan with another (3Sum)

Mnemonic for sorted pair problems: "Too small? Move left. Too big? Move right."
This one sentence IS the algorithm. If sum < target, you need bigger (left++). If sum > target, you need smaller (right--).

For 3Sum: "Fix one, two-pointer the rest, skip duplicates."
  - Outer loop: fix nums[i]
  - Inner: two-pointer on [i+1 ... n-1]
  - Skip: if nums[i] == nums[i-1], continue`,
  },

  'Sliding Window': {
    topic: 'Sliding Window',
    overview: `Sliding window maintains a "window" (subarray/substring) that expands and contracts to find optimal subarrays. Converts brute-force O(n²) or O(n³) into O(n).

Two types:
• Fixed size: Window size is given, slide it across
• Variable size: Expand right, shrink left when condition breaks`,
    keyPatterns: [
      'Fixed window: Add right element, remove left element as window slides',
      'Variable window (shrinkable): Expand right, shrink left while invalid',
      'Variable window (non-shrinkable): Expand right, shift left by 1 if invalid (window never shrinks)',
      'Frequency map window: Track char counts, compare with target counts',
    ],
    template: `# Variable window - longest substring without repeating chars
def length_of_longest_substring(s):
    seen = {}  # char -> last index
    left = result = 0
    for right in range(len(s)):
        if s[right] in seen and seen[s[right]] >= left:
            left = seen[s[right]] + 1
        seen[s[right]] = right
        result = max(result, right - left + 1)
    return result

# Variable window - minimum window substring
def min_window(s, t):
    from collections import Counter
    need = Counter(t)
    missing = len(t)
    left = start = 0
    min_len = float('inf')

    for right, char in enumerate(s):
        if need[char] > 0:
            missing -= 1
        need[char] -= 1

        while missing == 0:  # valid window, try to shrink
            if right - left + 1 < min_len:
                min_len = right - left + 1
                start = left
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1
            left += 1

    return s[start:start + min_len] if min_len != float('inf') else ""

# Fixed window - max sum of subarray of size k
def max_sum_subarray(nums, k):
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum`,
    jsTemplate: `// Variable window - longest substring without repeating chars
function lengthOfLongestSubstring(s) {
    const seen = new Map(); // char -> last index seen
    let left = 0;
    let result = 0;

    for (let right = 0; right < s.length; right++) {
        const char = s[right];

        // If char was seen and is still inside the current window
        if (seen.has(char) && seen.get(char) >= left) {
            // Shrink window: move left past the previous occurrence
            left = seen.get(char) + 1;
        }

        seen.set(char, right);

        // Update the longest window found so far
        const windowLength = right - left + 1;
        result = Math.max(result, windowLength);
    }
    return result;
}

// Variable window - minimum window substring
function minWindow(s, t) {
    // Build frequency map of what we need
    const need = new Map();
    for (const c of t) {
        need.set(c, (need.get(c) || 0) + 1);
    }

    let missing = t.length; // how many chars still needed
    let left = 0;
    let start = 0;
    let minLen = Infinity;

    for (let right = 0; right < s.length; right++) {
        const rightChar = s[right];

        // If this char is needed (count > 0), one fewer missing
        if ((need.get(rightChar) || 0) > 0) {
            missing--;
        }
        need.set(rightChar, (need.get(rightChar) || 0) - 1);

        // When window satisfies all requirements, try to shrink from left
        while (missing === 0) {
            const windowLen = right - left + 1;
            if (windowLen < minLen) {
                minLen = windowLen;
                start = left;
            }

            // Remove leftmost char from window
            const leftChar = s[left];
            need.set(leftChar, (need.get(leftChar) || 0) + 1);
            if (need.get(leftChar) > 0) {
                missing++; // window is now missing a required char
            }
            left++;
        }
    }
    return minLen === Infinity ? '' : s.slice(start, start + minLen);
}

// Fixed window - max sum of subarray of size k
function maxSumSubarray(nums, k) {
    // Build the initial window of size k
    let windowSum = 0;
    for (let i = 0; i < k; i++) {
        windowSum += nums[i];
    }
    let maxSum = windowSum;

    // Slide the window: add the new right element, remove the old left element
    for (let i = k; i < nums.length; i++) {
        windowSum = windowSum + nums[i] - nums[i - k];
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}`,
    jsTemplateWalkthrough:
      '── Longest Substring Without Repeating Chars ──\n' +
      's = "abcab"\n\n' +
      'left=0, result=0\n' +
      'right=0: char=a, not in seen\n' +
      '         seen:{a:0}, windowLen=1, result=1\n' +
      'right=1: char=b, not in seen\n' +
      '         seen:{a:0,b:1}, windowLen=2, result=2\n' +
      'right=2: char=c, not in seen\n' +
      '         seen:{a:0,b:1,c:2}, windowLen=3, result=3\n' +
      'right=3: char=a, seen[a]=0 >= left=0 → left=1\n' +
      '         seen:{a:3,b:1,c:2}, windowLen=3, result=3\n' +
      'right=4: char=b, seen[b]=1 >= left=1 → left=2\n' +
      '         seen:{a:3,b:4,c:2}, windowLen=3, result=3\n\n' +
      'return 3\n\n' +
      '── Minimum Window Substring ──\n' +
      's = "ADOBECODEBANC", t = "ABC"\n' +
      'need = {A:1, B:1, C:1}, missing=3\n\n' +
      'right=0: A, need[A]=1>0 → missing=2, need[A]=0\n' +
      'right=1: D → need[D]=-1\n' +
      'right=2: O → need[O]=-1\n' +
      'right=3: B, need[B]=1>0 → missing=1, need[B]=0\n' +
      'right=4: E → need[E]=-1\n' +
      'right=5: C, need[C]=1>0 → missing=0 ← valid window!\n' +
      '  window="ADOBEC", len=6, minLen=6, start=0\n' +
      '  shrink: remove A, need[A]=1>0 → missing=1, left=1 → exit while\n' +
      '...(sliding continues)...\n' +
      'right=9: A, need[A]=1>0 → missing=0 ← valid!\n' +
      '  window="ODEBA" … shrinks to "BANC" len=4\n\n' +
      'return "BANC"\n\n' +
      '── Max Sum Subarray (Fixed k=3) ──\n' +
      'nums = [2, 1, 5, 1, 3, 2], k=3\n\n' +
      'Initial window: 2+1+5=8, maxSum=8\n' +
      'i=3: windowSum = 8 + 1 - 2 = 7, maxSum=8\n' +
      'i=4: windowSum = 7 + 3 - 1 = 9, maxSum=9\n' +
      'i=5: windowSum = 9 + 2 - 5 = 6, maxSum=9\n\n' +
      'return 9',
    complexity: 'O(n) time (each element enters and leaves window once). O(k) space for frequency maps.',
    commonMistakes: [
      'Not correctly shrinking the window (infinite loop)',
      'Confusing "longest valid" vs "shortest valid" window logic',
      'Off-by-one in window size calculation (right - left + 1)',
      'Not handling empty string edge cases',
    ],
    tips: [
      'Longest/largest → expand right, shrink left only when invalid',
      'Shortest/smallest → expand right, shrink left while still valid',
      'Use Counter for character frequency matching problems',
      'The "missing" counter pattern avoids comparing entire frequency maps',
    ],
    memorization: `HOW TO MEMORIZE SLIDING WINDOW:
Think of it as an inchworm crawling across the array:
  - RIGHT side expands (the worm stretches forward)
  - LEFT side contracts (the tail catches up)

The template is always the same skeleton:
  left = 0
  for right in range(n):
      ADD nums[right] to window
      while WINDOW IS INVALID:
          REMOVE nums[left] from window
          left += 1
      UPDATE answer

Mnemonic: "ARRU" - Add Right, Remove Until valid, Update answer

LONGEST vs SHORTEST:
  - Longest valid window: shrink only when INVALID, update answer AFTER shrinking
  - Shortest valid window: shrink while VALID, update answer BEFORE shrinking`,
  },

  'Stack': {
    topic: 'Stack',
    overview: `Stacks follow LIFO (Last In, First Out). They excel at problems involving nested structures, matching pairs, and maintaining a history of elements.

Core use cases:
• Parentheses matching and validation
• Expression evaluation (postfix, calculator)
• Monotonic stack for next greater/smaller element
• Undo/history tracking`,
    keyPatterns: [
      'Matching pairs: Push opening, pop on closing, validate match',
      'Monotonic stack: Maintain increasing/decreasing stack for next greater/smaller',
      'Calculator: Two stacks (numbers + operators) or single stack with sign tracking',
      'Decode/flatten: Stack to track nested context (decode string, nested lists)',
    ],
    template: `# Valid parentheses
def is_valid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in pairs:
            if not stack or stack[-1] != pairs[c]:
                return False
            stack.pop()
        else:
            stack.append(c)
    return not stack

# Monotonic stack - daily temperatures (next warmer day)
def daily_temperatures(temps):
    n = len(temps)
    result = [0] * n
    stack = []  # indices of temps waiting for warmer day
    for i in range(n):
        while stack and temps[i] > temps[stack[-1]]:
            j = stack.pop()
            result[j] = i - j
        stack.append(i)
    return result

# Evaluate reverse polish notation
def eval_rpn(tokens):
    stack = []
    ops = {'+': lambda a,b: a+b, '-': lambda a,b: a-b,
           '*': lambda a,b: a*b, '/': lambda a,b: int(a/b)}
    for t in tokens:
        if t in ops:
            b, a = stack.pop(), stack.pop()
            stack.append(ops[t](a, b))
        else:
            stack.append(int(t))
    return stack[0]`,
    jsTemplate: `// Valid parentheses
function isValid(s) {
    const stack = [];
    const pairs = { ')': '(', ']': '[', '}': '{' };

    for (const c of s) {
        if (pairs[c]) {
            // Closing bracket: check that it matches the top of stack
            const expectedOpen = pairs[c];
            const top = stack[stack.length - 1];
            if (!stack.length || top !== expectedOpen) {
                return false;
            }
            stack.pop();
        } else {
            // Opening bracket: push onto stack
            stack.push(c);
        }
    }

    // If stack is empty, all brackets were matched
    return stack.length === 0;
}

// Monotonic stack - daily temperatures (next warmer day)
function dailyTemperatures(temps) {
    const n = temps.length;
    const result = new Array(n).fill(0);
    const stack = []; // stores indices waiting for a warmer day

    for (let i = 0; i < n; i++) {
        // Pop all indices whose temperature is less than today's temp
        while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
            const j = stack.pop();
            result[j] = i - j; // days waited = current index - past index
        }
        stack.push(i);
    }
    return result;
}

// Evaluate reverse polish notation
function evalRPN(tokens) {
    const stack = [];
    const ops = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => Math.trunc(a / b),
    };

    for (const t of tokens) {
        if (ops[t]) {
            // Pop operands in reverse order (b was pushed last)
            const b = stack.pop();
            const a = stack.pop();
            const resultVal = ops[t](a, b);
            stack.push(resultVal);
        } else {
            stack.push(Number(t));
        }
    }
    return stack[0];
}`,
    jsTemplateWalkthrough:
      '── Valid Parentheses ──\n' +
      's = "({[]})"  (valid)\n\n' +
      'c=(: opening → stack: ["("]\n' +
      'c={: opening → stack: ["(", "{"]\n' +
      'c=[: opening → stack: ["(", "{", "["]\n' +
      'c=]: closing, pairs[]=[ → top="[" matches → pop\n' +
      '    stack: ["(", "{"]\n' +
      'c=}: closing, pairs[}={ → top="{" matches → pop\n' +
      '    stack: ["("]\n' +
      'c=): closing, pairs[)=( → top="(" matches → pop\n' +
      '    stack: []\n\n' +
      'return stack.length===0 → true\n\n' +
      's = "([)]"  (invalid)\n' +
      'c=(: stack: ["("]\n' +
      'c=[: stack: ["(", "["]\n' +
      'c=): pairs[)=( → top="[" !== "(" → return false\n\n' +
      '── Daily Temperatures (Monotonic Stack) ──\n' +
      'temps = [73, 74, 75, 71, 72]\n\n' +
      'i=0: stack=[], push 0 → stack:[0]\n' +
      'i=1: temps[1]=74 > temps[0]=73 → pop j=0, result[0]=1-0=1\n' +
      '     push 1 → stack:[1]\n' +
      'i=2: temps[2]=75 > temps[1]=74 → pop j=1, result[1]=2-1=1\n' +
      '     push 2 → stack:[2]\n' +
      'i=3: temps[3]=71 < temps[2]=75 → push 3 → stack:[2,3]\n' +
      'i=4: temps[4]=72 > temps[3]=71 → pop j=3, result[3]=4-3=1\n' +
      '     temps[4]=72 < temps[2]=75 → stop. push 4 → stack:[2,4]\n\n' +
      'result = [1, 1, 0, 1, 0]\n' +
      '(indices 2 and 4 never got warmer → stay 0)\n\n' +
      '── Evaluate Reverse Polish Notation ──\n' +
      'tokens = ["2", "1", "+", "3", "*"]\n' +
      'meaning: (2 + 1) * 3 = 9\n\n' +
      't="2": push 2 → stack:[2]\n' +
      't="1": push 1 → stack:[2,1]\n' +
      't="+": b=pop()=1, a=pop()=2, ops["+"](2,1)=3\n' +
      '       push 3 → stack:[3]\n' +
      't="3": push 3 → stack:[3,3]\n' +
      't="*": b=pop()=3, a=pop()=3, ops["*"](3,3)=9\n' +
      '       push 9 → stack:[9]\n\n' +
      'return stack[0] = 9',
    complexity: 'O(n) time and O(n) space for most stack problems.',
    commonMistakes: [
      'Not checking if stack is empty before popping',
      'Monotonic stack: confusing when to use increasing vs decreasing',
      'Integer division in Python: use int(a/b) not a//b for negative numbers',
      'Forgetting to check stack is empty at the end (unmatched parentheses)',
    ],
    tips: [
      'If you need "next greater element" → decreasing monotonic stack',
      'If you need "next smaller element" → increasing monotonic stack',
      'For calculator problems: process digits into numbers, handle signs with stack',
      'Largest rectangle in histogram is the classic monotonic stack problem',
    ],
    memorization: `HOW TO MEMORIZE STACK PATTERNS:
Mnemonic: "LIFO = Last In First Out" - like a stack of plates.

PARENTHESES (the easiest stack problem - memorize this first):
  for char in s:
      if OPENING: push
      if CLOSING: pop and check match
  return stack is empty

MONOTONIC STACK (the most important pattern):
  Visualize a mountain range. You scan left to right. When you see a taller peak, all shorter peaks to its left now know their "next greater element."

  for i in range(n):
      while stack and nums[i] > nums[stack[-1]]:
          j = stack.pop()        # j found its next greater: i
          result[j] = i - j      # or nums[i], depending on problem
      stack.append(i)

Memory trick: "Pop the losers, push the current."
  - Next GREATER element = DECREASING stack (pop when current is bigger)
  - Next SMALLER element = INCREASING stack (pop when current is smaller)`,
  },

  'Binary Search': {
    topic: 'Binary Search',
    overview: `Binary search halves the search space each step, achieving O(log n). Beyond sorted arrays, it applies to any problem where you can define a monotonic condition to binary search on.

Key insight: Binary search works whenever you can answer "is this value feasible?" and the answer changes from False to True (or vice versa) at some threshold.`,
    keyPatterns: [
      'Classic: Find target in sorted array',
      'Boundary: Find first/last position where condition is true',
      'Search on answer: Binary search on the answer value itself (min/max optimization)',
      'Rotated array: Modified binary search with pivot detection',
    ],
    template: `# Classic binary search
def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Find first position where condition is true (left boundary)
def first_true(lo, hi, condition):
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if condition(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

# Search on answer - Koko eating bananas
def min_eating_speed(piles, h):
    import math
    def can_finish(speed):
        return sum(math.ceil(p / speed) for p in piles) <= h

    left, right = 1, max(piles)
    while left < right:
        mid = left + (right - left) // 2
        if can_finish(mid):
            right = mid
        else:
            left = mid + 1
    return left

# Search in rotated sorted array
def search_rotated(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[left] <= nums[mid]:  # left half sorted
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:  # right half sorted
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1`,
    jsTemplate: `// Classic binary search
function binarySearch(nums, target) {
    let left = 0;
    let right = nums.length - 1;

    while (left <= right) {
        // Avoid integer overflow: use left + floor((right - left) / 2)
        const mid = left + Math.floor((right - left) / 2);

        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            // Target is in the right half
            left = mid + 1;
        } else {
            // Target is in the left half
            right = mid - 1;
        }
    }
    return -1;
}

// Find first position where condition is true (left boundary)
function firstTrue(lo, hi, condition) {
    // Invariant: answer is in [lo, hi]
    while (lo < hi) {
        const mid = lo + Math.floor((hi - lo) / 2);

        if (condition(mid)) {
            // mid could be the answer, don't exclude it
            hi = mid;
        } else {
            // mid is definitely not the answer
            lo = mid + 1;
        }
    }
    return lo;
}

// Search on answer - Koko eating bananas
function minEatingSpeed(piles, h) {
    // Check: can Koko finish all piles in h hours eating at this speed?
    function canFinish(speed) {
        let totalHours = 0;
        for (const pile of piles) {
            totalHours += Math.ceil(pile / speed);
        }
        return totalHours <= h;
    }

    // Binary search on the answer: minimum feasible speed
    let left = 1;
    let right = Math.max(...piles);

    while (left < right) {
        const mid = left + Math.floor((right - left) / 2);
        if (canFinish(mid)) {
            right = mid; // mid works, try slower
        } else {
            left = mid + 1; // too slow, must go faster
        }
    }
    return left;
}

// Search in rotated sorted array
function searchRotated(nums, target) {
    let left = 0;
    let right = nums.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (nums[mid] === target) {
            return mid;
        }

        // Determine which half is sorted
        if (nums[left] <= nums[mid]) {
            // Left half [left..mid] is sorted
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1; // target is in the sorted left half
            } else {
                left = mid + 1; // target is in the right half
            }
        } else {
            // Right half [mid..right] is sorted
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1; // target is in the sorted right half
            } else {
                right = mid - 1; // target is in the left half
            }
        }
    }
    return -1;
}`,
    jsTemplateWalkthrough:
      '── Classic Binary Search ──\n' +
      'nums = [1, 3, 5, 7, 9, 11], target = 7\n\n' +
      'left=0, right=5\n' +
      'mid=2: nums[2]=5 < 7 → left=3\n' +
      'left=3, right=5\n' +
      'mid=4: nums[4]=9 > 7 → right=3\n' +
      'left=3, right=3\n' +
      'mid=3: nums[3]=7 === 7 → return 3\n\n' +
      '── First True (Left Boundary) ──\n' +
      'Find first index where nums[i] >= 5\n' +
      'nums = [1, 2, 3, 5, 7, 9], lo=0, hi=5\n\n' +
      'mid=2: condition(2)=nums[2]=3 >= 5? No → lo=3\n' +
      'mid=4: condition(4)=nums[4]=7 >= 5? Yes → hi=4\n' +
      'mid=3: condition(3)=nums[3]=5 >= 5? Yes → hi=3\n' +
      'lo===hi=3 → return 3\n\n' +
      '── Koko Bananas (Search on Answer) ──\n' +
      'piles = [3, 6, 7, 11], h = 8\n' +
      'Binary search speed in [1, 11]\n\n' +
      'mid=6: hours = ceil(3/6)+ceil(6/6)+ceil(7/6)+ceil(11/6)\n' +
      '            = 1+1+2+2 = 6 <= 8 → canFinish! right=6\n' +
      'mid=3: hours = 1+2+3+4 = 10 > 8 → too slow, left=4\n' +
      'mid=5: hours = 1+2+2+3 = 8 <= 8 → canFinish! right=5\n' +
      'mid=4: hours = 1+2+2+3 = 8 <= 8 → canFinish! right=4\n' +
      'left===right=4 → return 4\n\n' +
      '── Search in Rotated Array ──\n' +
      'nums = [4, 5, 6, 7, 0, 1, 2], target = 0\n\n' +
      'left=0, right=6\n' +
      'mid=3: nums[3]=7, nums[0]=4 <= 7 → left half [4,5,6,7] sorted\n' +
      '       4 <= 0? No → target not in left half → left=4\n' +
      'left=4, right=6\n' +
      'mid=5: nums[5]=1, nums[4]=0 <= 1 → left half [0,1] sorted\n' +
      '       0 <= 0 < 1? Yes → target in left half → right=4\n' +
      'left=4, right=4\n' +
      'mid=4: nums[4]=0 === 0 → return 4',
    complexity: 'O(log n) time, O(1) space.',
    commonMistakes: [
      'Off-by-one: left <= right vs left < right (depends on variant)',
      'Integer overflow: use left + (right - left) // 2',
      'Wrong half elimination in rotated array search',
      'Not identifying when binary search on answer applies',
    ],
    tips: [
      'Use left < right (exclusive) for boundary-finding; left <= right for exact match',
      '"Minimum value that satisfies X" → binary search on answer',
      'Koko bananas, ship packages, split array → all "search on answer" pattern',
      'For rotated arrays: determine which half is sorted, then check if target is in that half',
    ],
    memorization: `HOW TO MEMORIZE BINARY SEARCH:
There are only 2 templates you need. Memorize the DIFFERENCE:

TEMPLATE 1 - Exact match (find target):
  while left <= right:        # NOTE: <=
      mid = left + (right - left) // 2
      if nums[mid] == target: return mid
      elif nums[mid] < target: left = mid + 1
      else: right = mid - 1

TEMPLATE 2 - Boundary/minimum feasible (find first true):
  while left < right:         # NOTE: <
      mid = left + (right - left) // 2
      if condition(mid): right = mid
      else: left = mid + 1
  return left

Mnemonic: "Exact = <=, Boundary = <"

SEARCH ON ANSWER pattern recognition:
When a problem says "find the MINIMUM X such that..." or "find the MAXIMUM X such that..." and you can write a function can_do(x) -> bool, it's binary search on answer.

Memory trick: "Can I do it with X? Yes/No → Binary search the boundary."`,
  },

  'Linked List': {
    topic: 'Linked List',
    overview: `Linked lists test pointer manipulation skills. Most problems use these core techniques:
• Dummy head node to simplify edge cases
• Fast & slow pointers for cycle detection and middle finding
• Reverse a linked list (iterative and recursive)
• Merge sorted lists`,
    keyPatterns: [
      'Dummy head: Create a dummy node to avoid null checks for head changes',
      'Fast/slow pointers: Fast moves 2 steps, slow moves 1 step',
      'Reversal: Track prev, curr, next; reverse one node at a time',
      'Merge: Compare heads of two lists, link smaller one',
    ],
    template: `# Reverse a linked list (iterative)
def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev

# Detect cycle (Floyd's algorithm)
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False

# Find middle of linked list
def find_middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow

# Merge two sorted lists
def merge_two_lists(l1, l2):
    dummy = curr = ListNode(0)
    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next
    curr.next = l1 or l2
    return dummy.next

# Remove nth node from end (two-pointer gap)
def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next`,
    jsTemplate: `// Reverse a linked list (iterative)
function reverseList(head) {
    let prev = null;
    let curr = head;

    while (curr) {
        // Save the next node before we overwrite curr.next
        const nxt = curr.next;

        // Reverse the link: point current node back to prev
        curr.next = prev;

        // Advance both pointers forward
        prev = curr;
        curr = nxt;
    }
    // prev is now the new head of the reversed list
    return prev;
}

// Detect cycle (Floyd's algorithm)
function hasCycle(head) {
    let slow = head;
    let fast = head;

    // fast moves 2 steps, slow moves 1 step
    // If there's a cycle, they'll eventually meet
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;

        if (slow === fast) {
            return true;
        }
    }
    return false;
}

// Find middle of linked list
function findMiddle(head) {
    let slow = head;
    let fast = head;

    // When fast reaches the end, slow is at the middle
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}

// Merge two sorted lists
function mergeTwoLists(l1, l2) {
    // Dummy head simplifies the edge case of inserting before the first node
    const dummy = new ListNode(0);
    let curr = dummy;

    while (l1 && l2) {
        if (l1.val <= l2.val) {
            curr.next = l1;
            l1 = l1.next;
        } else {
            curr.next = l2;
            l2 = l2.next;
        }
        curr = curr.next;
    }

    // Attach remaining nodes from whichever list is non-empty
    curr.next = l1 || l2;
    return dummy.next;
}

// Remove nth node from end (two-pointer gap)
function removeNthFromEnd(head, n) {
    const dummy = new ListNode(0, head);
    let fast = dummy;
    let slow = dummy;

    // Advance fast n+1 steps ahead so the gap between fast and slow is n+1
    for (let i = 0; i <= n; i++) {
        fast = fast.next;
    }

    // Move both until fast reaches the end
    while (fast) {
        fast = fast.next;
        slow = slow.next;
    }

    // slow is now just before the node to remove
    slow.next = slow.next.next;
    return dummy.next;
}`,
    jsTemplateWalkthrough:
      '── Reverse Linked List ──\n' +
      '1 → 2 → 3 → null\n\n' +
      'prev=null, curr=1\n' +
      'iter1: nxt=2, 1.next=null, prev=1, curr=2\n' +
      '       null ← 1   2 → 3\n' +
      'iter2: nxt=3, 2.next=1, prev=2, curr=3\n' +
      '       null ← 1 ← 2   3\n' +
      'iter3: nxt=null, 3.next=2, prev=3, curr=null\n' +
      '       null ← 1 ← 2 ← 3\n\n' +
      'return prev=3  (new head)\n\n' +
      '── Detect Cycle ──\n' +
      'List: 1 → 2 → 3 → 4 → 2 (cycle at node 2)\n\n' +
      'slow=1, fast=1\n' +
      'step1: slow=2, fast=3\n' +
      'step2: slow=3, fast=2  (fast wrapped around cycle)\n' +
      'step3: slow=4, fast=4  → slow===fast → return true\n\n' +
      '── Find Middle ──\n' +
      '1 → 2 → 3 → 4 → 5\n\n' +
      'slow=1, fast=1\n' +
      'step1: slow=2, fast=3\n' +
      'step2: slow=3, fast=5\n' +
      'fast.next=null → stop\n\n' +
      'return slow=3  (middle node)\n\n' +
      '── Merge Two Sorted Lists ──\n' +
      'l1: 1 → 3 → 5\n' +
      'l2: 2 → 4 → 6\n\n' +
      'dummy → ?\n' +
      'l1.val=1 <= l2.val=2 → curr.next=l1(1), l1=3, curr=1\n' +
      'l1.val=3 > l2.val=2  → curr.next=l2(2), l2=4, curr=2\n' +
      'l1.val=3 <= l2.val=4 → curr.next=l1(3), l1=5, curr=3\n' +
      'l1.val=5 > l2.val=4  → curr.next=l2(4), l2=6, curr=4\n' +
      'l1.val=5 <= l2.val=6 → curr.next=l1(5), l1=null, curr=5\n' +
      'l1=null → curr.next=l2(6)\n\n' +
      'result: 1 → 2 → 3 → 4 → 5 → 6\n\n' +
      '── Remove Nth From End ──\n' +
      '1 → 2 → 3 → 4 → 5, n=2\n\n' +
      'dummy → 1 → 2 → 3 → 4 → 5\n' +
      'Advance fast n+1=3 steps: fast=node(3)\n' +
      'Move both until fast=null:\n' +
      '  fast=4, slow=1\n' +
      '  fast=5, slow=2\n' +
      '  fast=null, slow=3\n' +
      'slow=3, slow.next=4 (the one to remove)\n' +
      'slow.next = slow.next.next = 5\n\n' +
      'result: 1 → 2 → 3 → 5',
    complexity: 'O(n) time, O(1) space for most linked list operations.',
    commonMistakes: [
      'Losing reference to next node during reversal',
      'Not using dummy head (leads to complex null checks)',
      'Not handling single-node or empty list edge cases',
      'Cycle detection: forgetting to check fast.next before fast.next.next',
    ],
    tips: [
      'Always consider using a dummy head node',
      'Draw the pointer changes on paper before coding',
      'For "reorder/rearrange" problems: find middle → reverse second half → merge',
      'Merge K sorted lists: use heap or divide-and-conquer',
    ],
    memorization: `HOW TO MEMORIZE LINKED LIST:
There are really only 4 operations to memorize. Use the mnemonic "RDMF":
  R - Reverse: prev/curr/nxt dance
  D - Dummy head: always create one for edge cases
  M - Middle: fast/slow pointers
  F - Fast/slow: cycle detection

REVERSAL (the hardest to memorize - practice this one most):
  prev = None; curr = head
  while curr:
      nxt = curr.next     # Save next
      curr.next = prev    # Reverse link
      prev = curr         # Advance prev
      curr = nxt          # Advance curr
  return prev

Memory trick: "Save, Reverse, Advance, Advance" (SRAA)
Or think of it as: "Look ahead, point back, step forward (x2)"

FAST/SLOW for cycle detection:
  Tortoise and Hare - hare moves 2x. If there's a cycle, they MUST meet.
  If hare reaches null, no cycle.`,
  },

  'Trees': {
    topic: 'Trees',
    overview: `Trees are recursive structures. Most tree problems follow one of these traversal patterns:
• DFS (preorder, inorder, postorder) - usually recursive
• BFS (level-order) - usually iterative with queue
• BST properties: left < root < right

The key insight: at each node, combine results from left and right subtrees.`,
    keyPatterns: [
      'DFS recursive: Base case (null node) + recursive calls on children',
      'BFS level-order: Queue-based, process level by level',
      'BST search: Go left if target < node, right if target > node',
      'Path problems: Track running sum/path from root, use DFS',
      'Build tree: Use preorder/inorder arrays to reconstruct',
    ],
    template: `# DFS - maximum depth
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

# BFS - level order traversal
from collections import deque
def level_order(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result

# Validate BST
def is_valid_bst(root, lo=float('-inf'), hi=float('inf')):
    if not root:
        return True
    if root.val <= lo or root.val >= hi:
        return False
    return (is_valid_bst(root.left, lo, root.val) and
            is_valid_bst(root.right, root.val, hi))

# Lowest common ancestor
def lca(root, p, q):
    if not root or root == p or root == q:
        return root
    left = lca(root.left, p, q)
    right = lca(root.right, p, q)
    if left and right:
        return root
    return left or right

# Diameter of binary tree
def diameter(root):
    result = [0]
    def height(node):
        if not node:
            return 0
        left = height(node.left)
        right = height(node.right)
        result[0] = max(result[0], left + right)
        return 1 + max(left, right)
    height(root)
    return result[0]`,
    jsTemplate: `// DFS - maximum depth
function maxDepth(root) {
    if (!root) {
        return 0;
    }

    const leftDepth = maxDepth(root.left);
    const rightDepth = maxDepth(root.right);

    return 1 + Math.max(leftDepth, rightDepth);
}

// BFS - level order traversal
function levelOrder(root) {
    if (!root) {
        return [];
    }

    const result = [];
    const queue = [root];

    while (queue.length) {
        const levelSize = queue.length;
        const level = [];

        // Process all nodes at the current level
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            level.push(node.val);

            if (node.left) {
                queue.push(node.left);
            }
            if (node.right) {
                queue.push(node.right);
            }
        }
        result.push(level);
    }
    return result;
}

// Validate BST
// Pass down valid range: node value must be in (lo, hi)
function isValidBST(root, lo = -Infinity, hi = Infinity) {
    if (!root) {
        return true;
    }
    if (root.val <= lo || root.val >= hi) {
        return false;
    }

    const leftValid = isValidBST(root.left, lo, root.val);
    const rightValid = isValidBST(root.right, root.val, hi);
    return leftValid && rightValid;
}

// Lowest common ancestor
function lowestCommonAncestor(root, p, q) {
    // Base case: found one of the targets (or null)
    if (!root || root === p || root === q) {
        return root;
    }

    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);

    // If both sides found something, this node is the LCA
    if (left && right) {
        return root;
    }

    // Otherwise, return whichever side found a target
    return left || right;
}

// Diameter of binary tree
function diameterOfBinaryTree(root) {
    let maxDiameter = 0;

    function height(node) {
        if (!node) {
            return 0;
        }

        const leftHeight = height(node.left);
        const rightHeight = height(node.right);

        // Diameter through this node = leftHeight + rightHeight
        maxDiameter = Math.max(maxDiameter, leftHeight + rightHeight);

        return 1 + Math.max(leftHeight, rightHeight);
    }

    height(root);
    return maxDiameter;
}`,
    jsTemplateWalkthrough:
      '── Max Depth (DFS) ──\n' +
      '    3\n' +
      '   / \\\n' +
      '  9  20\n' +
      '     / \\\n' +
      '    15   7\n\n' +
      'maxDepth(3):\n' +
      '  leftDepth = maxDepth(9):\n' +
      '    maxDepth(null)=0, maxDepth(null)=0\n' +
      '    return 1 + max(0,0) = 1\n' +
      '  rightDepth = maxDepth(20):\n' +
      '    maxDepth(15)=1, maxDepth(7)=1\n' +
      '    return 1 + max(1,1) = 2\n' +
      '  return 1 + max(1,2) = 3\n\n' +
      '── Level Order (BFS) ──\n' +
      'Same tree above\n\n' +
      'queue=[3], result=[]\n' +
      'Level 1: levelSize=1, node=3, enqueue 9,20\n' +
      '  result=[[3]], queue=[9,20]\n' +
      'Level 2: levelSize=2, nodes=9(no children),20(enqueue 15,7)\n' +
      '  result=[[3],[9,20]], queue=[15,7]\n' +
      'Level 3: levelSize=2, nodes=15,7 (no children)\n' +
      '  result=[[3],[9,20],[15,7]]\n\n' +
      '── Validate BST ──\n' +
      'Tree: 5 with left=3, right=7\n\n' +
      'isValidBST(5, -Inf, +Inf): 5 in range → valid\n' +
      '  isValidBST(3, -Inf, 5): 3 < 5 → valid\n' +
      '  isValidBST(7, 5, +Inf): 7 > 5 → valid\n' +
      'return true\n\n' +
      'Invalid: BST with 5 as root but right child=4\n' +
      'isValidBST(4, 5, +Inf): 4 <= lo=5 → return false\n\n' +
      '── Lowest Common Ancestor ──\n' +
      'Tree: 6→(2,8), p=2, q=8\n\n' +
      'lca(6,2,8):\n' +
      '  left=lca(2,2,8) → root===p → return node(2)\n' +
      '  right=lca(8,2,8) → root===q → return node(8)\n' +
      '  left && right → return root=6\n\n' +
      '── Diameter ──\n' +
      '    1\n' +
      '   / \\\n' +
      '  2   3\n' +
      ' / \\\n' +
      '4   5\n\n' +
      'height(4)=1, height(5)=1\n' +
      'height(2): leftH=1,rightH=1, maxDiameter=max(0,2)=2, return 2\n' +
      'height(3)=1\n' +
      'height(1): leftH=2,rightH=1, maxDiameter=max(2,3)=3, return 3\n\n' +
      'return 3  (path 4→2→1→3 or 5→2→1→3)',
    complexity: 'O(n) time for traversals (visit each node once). O(h) space for recursion stack where h = tree height.',
    commonMistakes: [
      'Forgetting base case: if not root: return ...',
      'BST validation: using local min/max instead of passing bounds down',
      'Confusing preorder/inorder/postorder for tree construction',
      'Not considering skewed trees (O(n) height)',
    ],
    tips: [
      'Most tree problems: think recursively from a single node\'s perspective',
      'For "path" problems: track global max with nonlocal or list trick',
      'BST inorder traversal gives sorted order',
      'Serialize/deserialize: use preorder + null markers',
    ],
    memorization: `HOW TO MEMORIZE TREE PATTERNS:
Every tree problem is one of 3 things:
  1. TRAVERSAL (DFS or BFS) - just visit nodes in order
  2. RECURSIVE PROPERTY - "is this tree X?" (balanced, symmetric, BST)
  3. PATH/AGGREGATION - combine info from subtrees

THE UNIVERSAL DFS SKELETON (memorize this one thing):
  def dfs(node):
      if not node: return BASE_CASE
      left = dfs(node.left)
      right = dfs(node.right)
      return COMBINE(left, right)

Examples of COMBINE:
  - Max depth: return 1 + max(left, right)
  - Is balanced: return -1 if abs(left-right) > 1 else 1 + max(left, right)
  - Diameter: update global with left+right, return 1 + max(left, right)

BFS SKELETON:
  queue = deque([root])
  while queue:
      for _ in range(len(queue)):  # process one LEVEL
          node = queue.popleft()
          # process node
          if node.left: queue.append(node.left)
          if node.right: queue.append(node.right)

Memory trick: "BFS = Queue + Level loop. DFS = Recursion + Base case."`,
  },

  'Tries': {
    topic: 'Tries',
    overview: `A Trie (prefix tree) stores strings character by character. Each node represents a character, paths represent prefixes. Efficient for prefix-based lookups, autocomplete, and word search.`,
    keyPatterns: [
      'Insert: Walk down creating nodes for each character',
      'Search: Walk down checking each character exists',
      'StartsWith: Same as search but don\'t require end-of-word marker',
      'Word search: Combine trie with DFS/backtracking on grid',
    ],
    template: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.is_end = True

    def search(self, word):
        node = self._find(word)
        return node is not None and node.is_end

    def starts_with(self, prefix):
        return self._find(prefix) is not None

    def _find(self, prefix):
        node = self.root
        for c in prefix:
            if c not in node.children:
                return None
            node = node.children[c]
        return node`,
    jsTemplate: `class TrieNode {
    constructor() {
        this.children = {}; // char -> TrieNode
        this.isEnd = false; // true if a word ends at this node
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;

        for (const c of word) {
            // Create a new node if this character path doesn't exist yet
            if (!node.children[c]) {
                node.children[c] = new TrieNode();
            }
            node = node.children[c];
        }

        // Mark the end of this word
        node.isEnd = true;
    }

    search(word) {
        // Word exists only if we can walk all chars AND end node is marked
        const node = this._find(word);
        return node !== null && node.isEnd;
    }

    startsWith(prefix) {
        // Prefix exists if we can walk all chars (no isEnd check needed)
        return this._find(prefix) !== null;
    }

    _find(prefix) {
        let node = this.root;

        for (const c of prefix) {
            if (!node.children[c]) {
                return null; // path doesn't exist
            }
            node = node.children[c];
        }

        return node; // return the node at the end of the prefix
    }
}`,
    jsTemplateWalkthrough:
      '── Trie: Insert and Search ──\n' +
      'Operations: insert("app"), insert("apple"), search("app"), search("apple"), startsWith("ap")\n\n' +
      'After insert("app"):\n' +
      '  root → [a] → [p] → [p*]   (* = isEnd)\n\n' +
      'After insert("apple"):\n' +
      '  root → [a] → [p] → [p*] → [l] → [e*]\n\n' +
      'search("app"):\n' +
      '  _find("app"): root→a→p→p, returns node[p]\n' +
      '  node.isEnd = true → return true\n\n' +
      'search("apple"):\n' +
      '  _find("apple"): root→a→p→p→l→e, returns node[e]\n' +
      '  node.isEnd = true → return true\n\n' +
      'search("ap"):\n' +
      '  _find("ap"): root→a→p, returns node[p]\n' +
      '  node.isEnd = false → return false\n' +
      '  (the prefix "ap" exists but is not a complete word)\n\n' +
      'startsWith("ap"):\n' +
      '  _find("ap"): root→a→p, returns node[p] (not null)\n' +
      '  return true\n\n' +
      'startsWith("xyz"):\n' +
      '  _find: root has no child "x" → return null\n' +
      '  return false\n\n' +
      '── Key Difference ──\n' +
      'search("app") = true   (word exists, isEnd=true)\n' +
      'search("ap")  = false  (only prefix, isEnd=false)\n' +
      'startsWith("ap") = true  (prefix exists, isEnd irrelevant)',
    complexity: 'Insert/Search/Prefix: O(m) where m = word length. Space: O(n * m) for n words.',
    commonMistakes: [
      'Forgetting is_end flag (prefix exists != word exists)',
      'Not handling the root node separately',
      'Memory: tries can use lots of memory for large alphabets',
    ],
    tips: [
      'Use dict for children (flexible) or list of size 26 (faster for lowercase)',
      'Word Search II: build trie from words, DFS from each grid cell',
      'Can store additional data at nodes (count, word reference, etc.)',
    ],
    memorization: `HOW TO MEMORIZE TRIE:
A Trie is just a tree where each edge is a character. Memorize the node:
  class TrieNode:
      children = {}    # char -> TrieNode
      is_end = False   # marks end of a complete word

All three operations (insert, search, startsWith) share the SAME walk:
  node = root
  for char in word:
      if char not in node.children: [create or return False]
      node = node.children[char]

The only difference:
  - insert: create missing nodes, set is_end = True at the end
  - search: return False if missing, check is_end at the end
  - startsWith: return False if missing, return True at the end (no is_end check)

Mnemonic: "Trie = Tree of Characters. Walk char by char."`,
  },

  'Heap / Priority Queue': {
    topic: 'Heap / Priority Queue',
    overview: `A heap provides O(log n) insert and O(1) access to min (or max) element. Python's heapq is a min-heap. Use it when you repeatedly need the smallest/largest element.

Key use cases: top-K problems, merge K sorted things, scheduling, median finding.`,
    keyPatterns: [
      'Top K: Use min-heap of size K (or max-heap for smallest K)',
      'Merge K sorted: Push first element of each list, pop smallest, push next',
      'Two heaps: Max-heap for lower half + min-heap for upper half (median)',
      'Lazy deletion: Mark elements as deleted, skip them when popping',
    ],
    template: `import heapq

# Top K frequent elements
def top_k_frequent(nums, k):
    from collections import Counter
    count = Counter(nums)
    return heapq.nlargest(k, count.keys(), key=count.get)

# Merge K sorted lists
def merge_k_lists(lists):
    heap = []
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst.val, i, lst))

    dummy = curr = ListNode(0)
    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next

# Find median from data stream (two heaps)
class MedianFinder:
    def __init__(self):
        self.lo = []   # max-heap (negate values)
        self.hi = []   # min-heap

    def add_num(self, num):
        heapq.heappush(self.lo, -num)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def find_median(self):
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2`,
    jsTemplate: `// JavaScript doesn't have a built-in heap.
// Here's a minimal MinHeap implementation:

class MinHeap {
    constructor() {
        this.heap = [];
    }

    push(val) {
        this.heap.push(val);
        this._bubbleUp(this.heap.length - 1);
    }

    pop() {
        const top = this.heap[0];
        const last = this.heap.pop();

        // Move last element to top and sink it down to restore heap property
        if (this.heap.length) {
            this.heap[0] = last;
            this._sinkDown(0);
        }
        return top;
    }

    peek() {
        return this.heap[0];
    }

    get size() {
        return this.heap.length;
    }

    _bubbleUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);

            if (this.heap[parent] <= this.heap[i]) {
                break; // heap property satisfied
            }

            // Swap child with parent
            [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
            i = parent;
        }
    }

    _sinkDown(i) {
        const n = this.heap.length;

        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < n && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < n && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }

            if (smallest === i) {
                break; // heap property satisfied
            }

            [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
            i = smallest;
        }
    }
}

// Top K frequent elements (using sort)
function topKFrequent(nums, k) {
    // Step 1: count frequencies
    const count = new Map();
    for (const num of nums) {
        count.set(num, (count.get(num) || 0) + 1);
    }

    // Step 2: sort entries by frequency descending, take first k
    const sortedEntries = [...count.entries()].sort((a, b) => b[1] - a[1]);
    return sortedEntries.slice(0, k).map(([num]) => num);
}`,
    jsTemplateWalkthrough:
      '── MinHeap Push/Pop ──\n' +
      'Push 5, 3, 8, 1 one by one:\n\n' +
      'push(5): heap=[5]\n' +
      'push(3): heap=[5,3], bubbleUp idx=1\n' +
      '  parent=0: heap[0]=5 > heap[1]=3 → swap\n' +
      '  heap=[3,5]\n' +
      'push(8): heap=[3,5,8], bubbleUp idx=2\n' +
      '  parent=0: heap[0]=3 <= heap[2]=8 → stop\n' +
      '  heap=[3,5,8]\n' +
      'push(1): heap=[3,5,8,1], bubbleUp idx=3\n' +
      '  parent=1: heap[1]=5 > heap[3]=1 → swap → heap=[3,1,8,5]\n' +
      '  parent=0: heap[0]=3 > heap[1]=1 → swap → heap=[1,3,8,5]\n\n' +
      'pop(): top=1, last=5, heap[0]=5\n' +
      '  sinkDown(0): heap=[5,3,8]\n' +
      '  smallest: left=3,right=8 → smallest=left(idx=1)\n' +
      '  swap heap[0] and heap[1] → heap=[3,5,8]\n' +
      '  no more children smaller → stop\n' +
      '  return 1\n\n' +
      '── Top K Frequent ──\n' +
      'nums = [1,1,1,2,2,3], k=2\n\n' +
      'count: {1:3, 2:2, 3:1}\n' +
      'sorted entries: [[1,3],[2,2],[3,1]]\n' +
      'slice(0,2): [[1,3],[2,2]]\n' +
      'map to nums: [1, 2]\n\n' +
      'return [1, 2]',
    complexity: 'Push/pop: O(log n). Peek: O(1). Building heap from array: O(n). Top-K: O(n log k).',
    commonMistakes: [
      'Python heapq is min-heap only — negate values for max-heap',
      'Comparing tuples: if first elements are equal, Python compares second element (must be comparable)',
      'Not handling empty heap edge cases',
    ],
    tips: [
      'For max-heap in Python: push -value, pop gives -value (negate back)',
      'Use (priority, tie_breaker, item) tuples to avoid comparison issues',
      'heapq.nlargest(k, ...) and heapq.nsmallest(k, ...) are convenient',
      'Task scheduler: greedily pick the most frequent task',
    ],
    memorization: `HOW TO MEMORIZE HEAP:
Python heapq cheat sheet (memorize these 4 operations):
  heapq.heappush(heap, item)    # add item
  heapq.heappop(heap)           # remove & return smallest
  heap[0]                        # peek at smallest (don't pop)
  heapq.heapify(list)           # convert list to heap in O(n)

MAX-HEAP TRICK: Python only has min-heap. Negate values!
  heapq.heappush(heap, -val)    # push negated
  -heapq.heappop(heap)          # pop and negate back

TWO HEAPS FOR MEDIAN (the trickiest pattern):
  Picture a see-saw: left side (max-heap) and right side (min-heap).
  Keep them balanced (left can have 1 extra).
  Median = top of left (if odd) or average of both tops (if even).

  Steps: push to left → balance by moving left-top to right → rebalance sizes

Mnemonic: "Heap = always know the extreme. Min-heap = smallest on top. Negate for max."`,
  },

  'Backtracking': {
    topic: 'Backtracking',
    overview: `Backtracking explores all possible solutions by building candidates incrementally and abandoning ("backtracking") as soon as a candidate cannot lead to a valid solution.

Template: choose → explore → unchoose. Think of it as DFS on a decision tree.`,
    keyPatterns: [
      'Subsets: Include or exclude each element',
      'Permutations: Choose from remaining elements for each position',
      'Combinations: Choose k elements from n (maintain start index to avoid duplicates)',
      'Constraint satisfaction: Prune branches that violate constraints early (N-Queens, Sudoku)',
    ],
    template: `# Subsets
def subsets(nums):
    result = []
    def backtrack(start, path):
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()
    backtrack(0, [])
    return result

# Permutations
def permutations(nums):
    result = []
    def backtrack(path, remaining):
        if not remaining:
            result.append(path[:])
            return
        for i in range(len(remaining)):
            path.append(remaining[i])
            backtrack(path, remaining[:i] + remaining[i+1:])
            path.pop()
    backtrack([], nums)
    return result

# Combination Sum (can reuse elements)
def combination_sum(candidates, target):
    result = []
    def backtrack(start, path, remaining):
        if remaining == 0:
            result.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                break
            path.append(candidates[i])
            backtrack(i, path, remaining - candidates[i])  # i, not i+1 (reuse)
            path.pop()
    candidates.sort()
    backtrack(0, [], target)
    return result

# N-Queens
def solve_n_queens(n):
    result = []
    cols = set()
    diag1 = set()  # row - col
    diag2 = set()  # row + col

    def backtrack(row, board):
        if row == n:
            result.append(["".join(r) for r in board])
            return
        for col in range(n):
            if col in cols or row-col in diag1 or row+col in diag2:
                continue
            cols.add(col); diag1.add(row-col); diag2.add(row+col)
            board[row][col] = 'Q'
            backtrack(row + 1, board)
            board[row][col] = '.'
            cols.remove(col); diag1.remove(row-col); diag2.remove(row+col)

    board = [['.' for _ in range(n)] for _ in range(n)]
    backtrack(0, board)
    return result`,
    jsTemplate: `// Subsets
function subsets(nums) {
    const result = [];

    function backtrack(start, path) {
        // Add a snapshot of current path as a valid subset (including empty)
        result.push([...path]);

        for (let i = start; i < nums.length; i++) {
            path.push(nums[i]);       // CHOOSE
            backtrack(i + 1, path);  // EXPLORE (i+1 prevents reuse)
            path.pop();               // UNCHOOSE
        }
    }

    backtrack(0, []);
    return result;
}

// Permutations
function permute(nums) {
    const result = [];
    const used = new Array(nums.length).fill(false);

    function backtrack(path) {
        if (path.length === nums.length) {
            result.push([...path]); // Found a complete permutation
            return;
        }

        for (let i = 0; i < nums.length; i++) {
            if (used[i]) {
                continue; // Skip already-used elements
            }

            used[i] = true;
            path.push(nums[i]);  // CHOOSE
            backtrack(path);      // EXPLORE
            path.pop();           // UNCHOOSE
            used[i] = false;
        }
    }

    backtrack([]);
    return result;
}

// Combination Sum (can reuse elements)
function combinationSum(candidates, target) {
    const result = [];

    function backtrack(start, path, remaining) {
        if (remaining === 0) {
            result.push([...path]); // Found a valid combination
            return;
        }
        if (remaining < 0) {
            return; // Overshot — prune this branch
        }

        for (let i = start; i < candidates.length; i++) {
            path.push(candidates[i]);

            // Pass i (not i+1) to allow reusing the same element
            backtrack(i, path, remaining - candidates[i]);

            path.pop(); // UNCHOOSE
        }
    }

    backtrack(0, [], target);
    return result;
}

// N-Queens
function solveNQueens(n) {
    const result = [];
    const cols = new Set();
    const diag1 = new Set(); // row - col (top-left to bottom-right diagonals)
    const diag2 = new Set(); // row + col (top-right to bottom-left diagonals)

    function backtrack(row, board) {
        if (row === n) {
            // Convert board to string format and save
            result.push(board.map(r => r.join('')));
            return;
        }

        for (let col = 0; col < n; col++) {
            // Check if this position is under attack
            if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
                continue;
            }

            // Place queen
            cols.add(col);
            diag1.add(row - col);
            diag2.add(row + col);
            board[row][col] = 'Q';

            backtrack(row + 1, board); // Move to next row

            // Remove queen (backtrack)
            board[row][col] = '.';
            cols.delete(col);
            diag1.delete(row - col);
            diag2.delete(row + col);
        }
    }

    const board = Array.from({ length: n }, () => new Array(n).fill('.'));
    backtrack(0, board);
    return result;
}`,
    jsTemplateWalkthrough:
      '── Subsets ──\n' +
      'nums = [1, 2, 3]\n\n' +
      'backtrack(0, []) → push []\n' +
      '  i=0: choose 1, backtrack(1, [1]) → push [1]\n' +
      '    i=1: choose 2, backtrack(2, [1,2]) → push [1,2]\n' +
      '      i=2: choose 3, backtrack(3, [1,2,3]) → push [1,2,3]\n' +
      '           unchoose 3\n' +
      '    unchoose 2\n' +
      '    i=2: choose 3, backtrack(3, [1,3]) → push [1,3]\n' +
      '         unchoose 3\n' +
      '  unchoose 1\n' +
      '  ... (i=1 → [2],[2,3]; i=2 → [3])\n\n' +
      'result: [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]\n\n' +
      '── Permutations ──\n' +
      'nums = [1, 2, 3]\n\n' +
      'backtrack([]):\n' +
      '  i=0: used[0]=true, path=[1]\n' +
      '    i=1: used[1]=true, path=[1,2]\n' +
      '      i=2: path=[1,2,3] → push [1,2,3]\n' +
      '    unchoose 2\n' +
      '    i=2: path=[1,3]\n' +
      '      i=1: path=[1,3,2] → push [1,3,2]\n' +
      '  unchoose 1\n' +
      '  ... (starting with 2: [2,1,3],[2,3,1]; starting with 3: [3,1,2],[3,2,1])\n\n' +
      'result: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]\n\n' +
      '── Combination Sum ──\n' +
      'candidates=[2,3,6,7], target=7\n\n' +
      'backtrack(0,[],7):\n' +
      '  i=0: push 2, backtrack(0,[2],5)\n' +
      '    i=0: push 2, backtrack(0,[2,2],3)\n' +
      '      i=0: push 2, backtrack(0,[2,2,2],1)\n' +
      '        i=0: push 2, remaining=-1 → prune, pop\n' +
      '        i=1: push 3, remaining=-2 → prune, pop\n' +
      '      pop 2\n' +
      '      i=1: push 3, backtrack(1,[2,2,3],0) → push [2,2,3]\n' +
      '  ...\n' +
      '  i=3: push 7, backtrack(3,[7],0) → push [7]\n\n' +
      'result: [[2,2,3],[7]]',
    complexity: 'Subsets: O(2^n). Permutations: O(n!). Pruning helps in practice.',
    commonMistakes: [
      'Forgetting to undo the choice (path.pop(), set.remove())',
      'Not handling duplicate elements (sort + skip if nums[i] == nums[i-1])',
      'Subsets II: must sort and skip duplicates at same recursion level',
      'Passing mutable objects: append path[:] (copy), not path itself',
    ],
    tips: [
      'Always think: What are my choices at each step? When do I stop?',
      'Sort input to enable duplicate skipping and early termination',
      'For "can reuse elements": recurse with same index. For "use once": index + 1',
      'Draw the decision tree to visualize the recursion',
    ],
    memorization: `HOW TO MEMORIZE BACKTRACKING:
The template is ALWAYS this skeleton - memorize it as "Choose, Explore, Unchoose":

  def backtrack(start, path):
      if GOAL_REACHED:
          result.append(path[:])   # NOTE: copy!
          return
      for i in range(start, len(nums)):
          if SKIP_CONDITION: continue    # pruning
          path.append(nums[i])           # CHOOSE
          backtrack(i + 1, path)          # EXPLORE (i+1 for no reuse, i for reuse)
          path.pop()                      # UNCHOOSE

THREE VARIATIONS (only the loop changes):
  Subsets/Combinations: for i in range(start, n) → no duplicates via start index
  Permutations: for i in range(n) if not used[i] → try all positions
  Reuse allowed: backtrack(i, path) instead of backtrack(i+1, path)

DUPLICATE HANDLING: Sort first, then:
  if i > start and nums[i] == nums[i-1]: continue

Mnemonic: "CEO" - Choose, Explore, unchoOse`,
  },

  'Graphs': {
    topic: 'Graphs',
    overview: `Graphs model relationships between entities. Core algorithms:
• BFS: Shortest path in unweighted graphs, level-by-level exploration
• DFS: Explore as deep as possible, backtrack (cycle detection, connected components)
• Topological sort: Order nodes in DAG (course schedule)
• Union-Find: Efficiently track connected components
• Dijkstra: Shortest path in weighted graphs`,
    keyPatterns: [
      'BFS (shortest path): Queue-based, visit level by level',
      'DFS (connectivity): Stack/recursion, mark visited',
      'Grid as graph: 4-directional neighbors, BFS/DFS from each cell',
      'Topological sort: Kahn\'s (BFS with in-degree) or DFS post-order',
      'Dijkstra: Min-heap of (distance, node), relax edges',
      'Multi-source BFS: Add ALL starting nodes to queue initially (rotting oranges, walls and gates)',
      'Clone graph: DFS + HashMap mapping original node to its clone',
    ],
    template: `from collections import deque, defaultdict

# BFS - number of islands (grid)
def num_islands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0

    def bfs(r, c):
        queue = deque([(r, c)])
        grid[r][c] = '0'
        while queue:
            r, c = queue.popleft()
            for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                nr, nc = r+dr, c+dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1':
                    grid[nr][nc] = '0'
                    queue.append((nr, nc))

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                bfs(r, c)
                count += 1
    return count

# Topological sort (Kahn's algorithm)
def course_order(n, prerequisites):
    graph = defaultdict(list)
    in_degree = [0] * n
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1

    queue = deque(i for i in range(n) if in_degree[i] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    return order if len(order) == n else []

# Dijkstra's shortest path
import heapq
def network_delay(times, n, k):
    graph = defaultdict(list)
    for u, v, w in times:
        graph[u].append((v, w))

    dist = {k: 0}
    heap = [(0, k)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist.get(node, float('inf')):
            continue
        for neighbor, weight in graph[node]:
            new_dist = d + weight
            if new_dist < dist.get(neighbor, float('inf')):
                dist[neighbor] = new_dist
                heapq.heappush(heap, (new_dist, neighbor))

    return max(dist.values()) if len(dist) == n else -1`,
    jsTemplate: `// BFS - number of islands (grid)
function numIslands(grid) {
    if (!grid.length) {
        return 0;
    }

    const rows = grid.length;
    const cols = grid[0].length;
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    let count = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1') {
                count++;

                // BFS to mark all connected land cells as visited
                const queue = [[r, c]];
                grid[r][c] = '0'; // Mark visited by overwriting

                while (queue.length) {
                    const [row, col] = queue.shift();

                    for (const [dr, dc] of directions) {
                        const nr = row + dr;
                        const nc = col + dc;

                        const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
                        if (inBounds && grid[nr][nc] === '1') {
                            grid[nr][nc] = '0'; // Mark before enqueuing
                            queue.push([nr, nc]);
                        }
                    }
                }
            }
        }
    }
    return count;
}

// Topological sort (Kahn's algorithm)
function topologicalSort(numCourses, prerequisites) {
    // Build adjacency list and in-degree array
    const graph = Array.from({ length: numCourses }, () => []);
    const inDegree = new Array(numCourses).fill(0);

    for (const [course, prereq] of prerequisites) {
        graph[prereq].push(course);
        inDegree[course]++;
    }

    // Start with all nodes that have no prerequisites
    const queue = [];
    for (let i = 0; i < numCourses; i++) {
        if (inDegree[i] === 0) {
            queue.push(i);
        }
    }

    const order = [];
    while (queue.length) {
        const node = queue.shift();
        order.push(node);

        // Reduce in-degree of neighbors; enqueue if they become free
        for (const neighbor of graph[node]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                queue.push(neighbor);
            }
        }
    }

    // If we processed all courses, no cycle exists
    return order.length === numCourses ? order : [];
}

// Dijkstra's shortest path
function networkDelay(times, n, k) {
    // Build adjacency list: node -> [[neighbor, weight], ...]
    const graph = new Map();
    for (const [u, v, w] of times) {
        if (!graph.has(u)) {
            graph.set(u, []);
        }
        graph.get(u).push([v, w]);
    }

    const dist = new Map([[k, 0]]);

    // Simple priority queue: sorted array of [distance, node]
    // (In production, use a proper MinHeap for O(log n) pop)
    const heap = [[0, k]];

    while (heap.length) {
        heap.sort((a, b) => a[0] - b[0]);
        const [d, node] = heap.shift();

        // Stale entry — we already found a shorter path
        if (d > (dist.get(node) ?? Infinity)) {
            continue;
        }

        for (const [neighbor, weight] of (graph.get(node) || [])) {
            const newDist = d + weight;
            if (newDist < (dist.get(neighbor) ?? Infinity)) {
                dist.set(neighbor, newDist);
                heap.push([newDist, neighbor]);
            }
        }
    }

    if (dist.size !== n) {
        return -1; // Not all nodes reachable
    }
    return Math.max(...dist.values());
}

// Multi-source BFS (Rotting Oranges pattern)
function orangesRotting(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    const queue = [];
    let freshCount = 0;

    // Collect all initial rotten oranges and count fresh ones
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 2) {
                queue.push([r, c]);
            } else if (grid[r][c] === 1) {
                freshCount = freshCount + 1;
            }
        }
    }

    let minutes = 0;
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    // BFS level by level (each level = 1 minute)
    while (queue.length > 0 && freshCount > 0) {
        const levelSize = queue.length;

        for (let i = 0; i < levelSize; i++) {
            const [row, col] = queue.shift();

            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                const inBounds = newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols;

                if (inBounds && grid[newRow][newCol] === 1) {
                    grid[newRow][newCol] = 2;
                    freshCount = freshCount - 1;
                    queue.push([newRow, newCol]);
                }
            }
        }

        minutes = minutes + 1;
    }

    return freshCount === 0 ? minutes : -1;
}

// Clone Graph (DFS + HashMap)
function cloneGraph(node) {
    if (!node) {
        return null;
    }

    // Map from original node to its clone
    const visited = new Map();

    function dfs(original) {
        // If already cloned, return the clone
        if (visited.has(original)) {
            return visited.get(original);
        }

        // Create a clone of this node
        const clone = new Node(original.val);
        visited.set(original, clone);

        // Clone all neighbors recursively
        for (const neighbor of original.neighbors) {
            const clonedNeighbor = dfs(neighbor);
            clone.neighbors.push(clonedNeighbor);
        }

        return clone;
    }

    return dfs(node);
}`,
    jsTemplateWalkthrough:
      '── Number of Islands (BFS) ──\n' +
      'grid = [["1","1","0"],\n' +
      '        ["1","0","0"],\n' +
      '        ["0","0","1"]]\n\n' +
      'r=0,c=0: "1" → count=1, BFS from (0,0)\n' +
      '  mark (0,0)="0", queue=[(0,0)]\n' +
      '  pop (0,0): right(0,1)="1" → mark,enqueue; down(1,0)="1" → mark,enqueue\n' +
      '  queue=[(0,1),(1,0)]\n' +
      '  pop (0,1): all neighbors "0" or OOB\n' +
      '  pop (1,0): all neighbors "0" or OOB\n' +
      '  Island 1 covers cells: (0,0),(0,1),(1,0)\n\n' +
      'r=2,c=2: "1" → count=2, BFS from (2,2)\n' +
      '  No "1" neighbors → done immediately\n\n' +
      'return 2\n\n' +
      '── Topological Sort (Kahn\'s) ──\n' +
      'numCourses=4, prerequisites=[[1,0],[2,0],[3,1],[3,2]]\n' +
      '(edges: 0→1, 0→2, 1→3, 2→3)\n\n' +
      'inDegree: [0, 1, 1, 2]\n' +
      'Initial queue (inDegree=0): [0]\n\n' +
      'pop 0: order=[0], neighbors=1,2\n' +
      '  inDegree[1]=0 → enqueue; inDegree[2]=0 → enqueue\n' +
      'pop 1: order=[0,1], neighbor=3, inDegree[3]=1\n' +
      'pop 2: order=[0,1,2], neighbor=3, inDegree[3]=0 → enqueue\n' +
      'pop 3: order=[0,1,2,3]\n\n' +
      'length=4===numCourses → return [0,1,2,3]\n\n' +
      '── Dijkstra ──\n' +
      'times=[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2\n' +
      'graph: {2:[[1,1],[3,1]], 3:[[4,1]]}\n\n' +
      'dist={2:0}, heap=[[0,2]]\n' +
      'pop [0,2]: neighbor 1→dist=1, neighbor 3→dist=1\n' +
      '  heap=[[1,1],[1,3]], dist={2:0,1:1,3:1}\n' +
      'pop [1,1]: no neighbors in graph\n' +
      'pop [1,3]: neighbor 4→dist=1+1=2\n' +
      '  dist={2:0,1:1,3:1,4:2}\n' +
      'pop [2,4]: no neighbors\n\n' +
      'dist.size=4===n=4 → return max(0,1,1,2) = 2\n\n' +
      '── Rotting Oranges (Multi-source BFS) ──\n' +
      'grid = [[2,1,1],[1,1,0],[0,1,1]]\n\n' +
      'Initial: queue=[(0,0)], freshCount=6\n\n' +
      'Minute 1 (levelSize=1):\n' +
      '  pop (0,0): spread to (0,1) and (1,0) → freshCount=4\n' +
      '  queue=[(0,1),(1,0)], minutes=1\n' +
      'Minute 2 (levelSize=2):\n' +
      '  pop (0,1): spread to (0,2) and (1,1) → freshCount=2\n' +
      '  pop (1,0): (1,1) already rotten → no spread\n' +
      '  queue=[(0,2),(1,1)], minutes=2\n' +
      'Minute 3 (levelSize=2):\n' +
      '  pop (0,2): no fresh neighbors\n' +
      '  pop (1,1): spread to (2,1) → freshCount=1\n' +
      '  queue=[(2,1)], minutes=3\n' +
      'Minute 4 (levelSize=1):\n' +
      '  pop (2,1): spread to (2,2) → freshCount=0\n' +
      '  minutes=4, freshCount=0 → exit loop\n\n' +
      'return 4\n\n' +
      '── Clone Graph (DFS + HashMap) ──\n' +
      'Graph: 1--2\n' +
      '       |  |\n' +
      '       4--3\n\n' +
      'cloneGraph(node1):\n' +
      '  dfs(1): not in visited. clone1=Node(1). visited={1→clone1}\n' +
      '    dfs(2): not in visited. clone2=Node(2). visited={1→c1,2→c2}\n' +
      '      dfs(1): already in visited → return clone1\n' +
      '      dfs(3): not in visited. clone3=Node(3). visited+={3→c3}\n' +
      '        dfs(2): already visited → return clone2\n' +
      '        dfs(4): not in visited. clone4=Node(4). visited+={4→c4}\n' +
      '          dfs(1) → clone1, dfs(3) → clone3\n' +
      '          clone4.neighbors=[clone1,clone3]\n' +
      '        clone3.neighbors=[clone2,clone4]\n' +
      '      clone2.neighbors=[clone1,clone3]\n' +
      '    clone1.neighbors=[clone2,clone4]\n' +
      '  return clone1  (deep copy of original graph) ✓',
    complexity: 'BFS/DFS: O(V + E). Dijkstra: O((V + E) log V) with heap. Topological sort: O(V + E).',
    commonMistakes: [
      'Forgetting visited set (infinite loops in cycles)',
      'BFS on weighted graph (use Dijkstra instead)',
      'Not building adjacency list correctly (directed vs undirected)',
      'Topological sort: not detecting cycles (check if all nodes are in result)',
    ],
    tips: [
      'Grid BFS/DFS: directions = [(0,1),(0,-1),(1,0),(-1,0)]',
      'Shortest path unweighted → BFS. Weighted → Dijkstra. Negative weights → Bellman-Ford',
      'Cycle detection: DFS with 3 states (unvisited, in-progress, done)',
      'Multi-source BFS: add all sources to queue initially (rotting oranges)',
    ],
    memorization: `HOW TO MEMORIZE GRAPH ALGORITHMS:
Mnemonic: "BFS = Queue = Shortest. DFS = Stack/Recursion = Explore all."

BFS SKELETON (memorize for shortest path / level-order):
  queue = deque([start])
  visited = {start}
  while queue:
      node = queue.popleft()
      for neighbor in graph[node]:
          if neighbor not in visited:
              visited.add(neighbor)
              queue.append(neighbor)

DFS SKELETON:
  def dfs(node):
      visited.add(node)
      for neighbor in graph[node]:
          if neighbor not in visited:
              dfs(neighbor)

TOPOLOGICAL SORT (Kahn's - memorize as "peel the onion"):
  1. Count in-degrees
  2. Start with all 0-in-degree nodes
  3. Pop node, reduce neighbors' in-degrees
  4. Add new 0-in-degree nodes to queue
  Mnemonic: "Remove nodes with no dependencies, ripple through"

DIJKSTRA (memorize as "greedy BFS with a heap"):
  heap = [(0, start)]
  while heap: pop smallest, relax neighbors
  Key: skip if already found shorter (lazy deletion)

GRID PROBLEMS: "It's just a graph where neighbors are up/down/left/right"
  dirs = [(0,1),(0,-1),(1,0),(-1,0)]`,
  },

  'Dynamic Programming': {
    topic: 'Dynamic Programming',
    overview: `DP solves problems by breaking them into overlapping subproblems and storing results. Two approaches:
• Top-down (memoization): Recursive with cache
• Bottom-up (tabulation): Iterative, fill table from base cases

Key: define the state (what info you need to solve a subproblem) and the recurrence (how subproblems relate).`,
    keyPatterns: [
      '1D DP: dp[i] depends on previous elements (climbing stairs, house robber)',
      '2D DP: dp[i][j] for two sequences/dimensions (LCS, edit distance, grid paths)',
      'Knapsack: Include or exclude items, track capacity (subset sum, coin change)',
      'Interval DP: dp[i][j] for subarray/substring i..j (burst balloons, palindrome)',
      'State machine DP: States represent conditions (buy/sell stock with cooldown)',
      'Kadane\'s: Max subarray — reset running sum when negative, track global max',
      'Edit distance: dp[i][j] = min insertions/deletions/replacements to convert word1[0..i] to word2[0..j]',
      'LIS (O(n log n)): Binary search on tails array — tails[i] = smallest tail for LIS of length i+1',
    ],
    template: `# 1D DP - House Robber
def rob(nums):
    if len(nums) <= 2:
        return max(nums) if nums else 0
    dp = [0] * len(nums)
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])
    for i in range(2, len(nums)):
        dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    return dp[-1]

# 2D DP - Longest Common Subsequence
def lcs(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]

# Knapsack - Coin Change (unbounded)
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

# Top-down with memoization
from functools import lru_cache
def longest_increasing_subsequence(nums):
    @lru_cache(maxsize=None)
    def dp(i):
        result = 1
        for j in range(i):
            if nums[j] < nums[i]:
                result = max(result, dp(j) + 1)
        return result
    return max(dp(i) for i in range(len(nums))) if nums else 0

# 0/1 Knapsack - Partition Equal Subset Sum
def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for num in nums:
        for j in range(target, num - 1, -1):  # reverse to avoid reuse
            dp[j] = dp[j] or dp[j - num]
    return dp[target]`,
    jsTemplate: `// 1D DP - House Robber
// dp[i] = max money we can rob from houses 0..i
function rob(nums) {
    if (nums.length === 0) {
        return 0;
    }
    if (nums.length <= 2) {
        return Math.max(...nums);
    }
    const dp = new Array(nums.length);
    dp[0] = nums[0];                        // Only one house available
    dp[1] = Math.max(nums[0], nums[1]);     // Best of first two houses

    for (let i = 2; i < nums.length; i++) {
        // Either skip house i (take dp[i-1]) or rob it (take dp[i-2] + nums[i])
        const skipHouse = dp[i - 1];
        const robHouse = dp[i - 2] + nums[i];
        dp[i] = Math.max(skipHouse, robHouse);
    }
    return dp[nums.length - 1];
}

// 2D DP - Longest Common Subsequence
// dp[i][j] = LCS length of text1[0..i-1] and text2[0..j-1]
function longestCommonSubsequence(text1, text2) {
    const m = text1.length;
    const n = text2.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                // Characters match: extend from diagonal
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                // Take best by skipping one char
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}

// Knapsack - Coin Change (unbounded: coins can be reused)
// dp[i] = minimum coins to make amount i
function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0; // 0 coins needed for amount 0

    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
}

// 0/1 Knapsack - Partition Equal Subset Sum
// dp[j] = true if we can form sum j using some subset of nums
function canPartition(nums) {
    const total = nums.reduce((a, b) => a + b, 0);

    if (total % 2 !== 0) {
        return false;
    }

    const target = total / 2;
    const dp = new Array(target + 1).fill(false);
    dp[0] = true; // Empty subset sums to 0

    for (const num of nums) {
        // Iterate BACKWARDS to prevent reusing the same num in one pass
        for (let j = target; j >= num; j--) {
            dp[j] = dp[j] || dp[j - num];
        }
    }
    return dp[target];
}

// Kadane's Algorithm - Maximum Subarray Sum
function maxSubArray(nums) {
    let currentSum = 0;
    let maxSum = nums[0];

    for (const num of nums) {
        // If running sum is negative, start fresh
        if (currentSum < 0) {
            currentSum = 0;
        }

        currentSum = currentSum + num;

        // Track the best sum found so far
        if (currentSum > maxSum) {
            maxSum = currentSum;
        }
    }

    return maxSum;
}

// Edit Distance (2D DP)
function minDistance(word1, word2) {
    const m = word1.length;
    const n = word2.length;

    // dp[i][j] = min edits to convert word1[0..i-1] to word2[0..j-1]
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    // Base cases: converting to/from empty string
    for (let i = 0; i <= m; i++) {
        dp[i][0] = i;
    }
    for (let j = 0; j <= n; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (word1[i - 1] === word2[j - 1]) {
                // Characters match, no edit needed
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                // Take minimum of insert, delete, replace
                const insertOp = dp[i][j - 1] + 1;
                const deleteOp = dp[i - 1][j] + 1;
                const replaceOp = dp[i - 1][j - 1] + 1;
                dp[i][j] = Math.min(insertOp, deleteOp, replaceOp);
            }
        }
    }

    return dp[m][n];
}

// Longest Increasing Subsequence (Binary Search O(n log n))
function lengthOfLIS(nums) {
    // tails[i] = smallest tail element for increasing subsequence of length i+1
    const tails = [];

    for (const num of nums) {
        // Binary search for where num should go
        let lo = 0;
        let hi = tails.length;
        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            if (tails[mid] < num) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }

        // Replace or extend
        tails[lo] = num;
    }

    // Length of tails = length of LIS
    return tails.length;
}

// Buy/Sell Stock with State Machine (Cooldown)
function maxProfit(prices) {
    // Three states: hold (own stock), sold (just sold), rest (cooldown/no stock)
    let hold = -Infinity;   // max profit while holding stock
    let sold = 0;           // max profit on day we just sold
    let rest = 0;           // max profit while resting (no stock, not just sold)

    for (const price of prices) {
        const prevHold = hold;
        const prevSold = sold;
        const prevRest = rest;

        // Today I hold: either I held before, or I bought today (from rest)
        hold = Math.max(prevHold, prevRest - price);
        // Today I sold: I must have held before
        sold = prevHold + price;
        // Today I rest: I either rested before, or I was in cooldown (just sold)
        rest = Math.max(prevRest, prevSold);
    }

    return Math.max(sold, rest);
}`,
    jsTemplateWalkthrough:
      '── House Robber (1D DP) ──\n' +
      'nums = [2, 7, 9, 3, 1]\n\n' +
      'dp[0] = 2\n' +
      'dp[1] = max(2,7) = 7\n' +
      'i=2: skipHouse=dp[1]=7, robHouse=dp[0]+9=11 → dp[2]=11\n' +
      'i=3: skipHouse=dp[2]=11, robHouse=dp[1]+3=10 → dp[3]=11\n' +
      'i=4: skipHouse=dp[3]=11, robHouse=dp[2]+1=12 → dp[4]=12\n\n' +
      'return dp[4] = 12  (rob houses 0,2,4: 2+9+1=12)\n\n' +
      '── Longest Common Subsequence (2D DP) ──\n' +
      'text1="ace", text2="abcde"\n\n' +
      '     ""  a  b  c  d  e\n' +
      '"" [  0  0  0  0  0  0 ]\n' +
      'a  [  0  1  1  1  1  1 ]\n' +
      'c  [  0  1  1  2  2  2 ]\n' +
      'e  [  0  1  1  2  2  3 ]\n\n' +
      'dp[1][1]: a===a → dp[0][0]+1=1\n' +
      'dp[2][3]: c===c → dp[1][2]+1=2\n' +
      'dp[3][5]: e===e → dp[2][4]+1=3\n\n' +
      'return dp[3][5] = 3\n\n' +
      '── Coin Change (Unbounded Knapsack) ──\n' +
      'coins=[1,5,6,9], amount=11\n' +
      'dp=[0,∞,∞,∞,∞,∞,∞,∞,∞,∞,∞,∞]\n\n' +
      'i=1: coin=1 → dp[1]=1\n' +
      'i=5: coin=5 → dp[5]=1\n' +
      'i=6: coin=6 → dp[6]=1; coin=1 → min(1,dp[5]+1)=1\n' +
      'i=9: coin=9 → dp[9]=1\n' +
      'i=10: coin=5 → dp[10]=dp[5]+1=2\n' +
      'i=11: coin=5 → dp[11]=dp[6]+1=2; coin=6 → min(2,dp[5]+1)=2\n\n' +
      'return dp[11] = 2  (coins 5+6=11)\n\n' +
      '── Partition Equal Subset (0/1 Knapsack) ──\n' +
      'nums=[1,5,11,5], total=22, target=11\n' +
      'dp=[T,F,F,F,F,F,F,F,F,F,F,F]\n\n' +
      'num=1: j=1: dp[1]|=dp[0]=T → dp[1]=T\n' +
      'num=5: j=6: dp[6]|=dp[1]=T; j=5: dp[5]|=dp[0]=T\n' +
      'num=11: j=11: dp[11]|=dp[0]=T → dp[11]=T!\n\n' +
      'return true  (subset [11] sums to 11)\n\n' +
      '── Kadane\'s Algorithm (Max Subarray) ──\n' +
      'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\n\n' +
      'currentSum=0, maxSum=-2\n' +
      'num=-2: currentSum=0<0? No(0>=0) → currentSum=-2, maxSum=max(-2,-2)=-2\n' +
      'num=1:  currentSum=-2<0 → reset to 0, currentSum=1, maxSum=1\n' +
      'num=-3: currentSum=1>=0 → currentSum=-2, maxSum=1\n' +
      'num=4:  currentSum=-2<0 → reset to 0, currentSum=4, maxSum=4\n' +
      'num=-1: currentSum=3, maxSum=4\n' +
      'num=2:  currentSum=5, maxSum=5\n' +
      'num=1:  currentSum=6, maxSum=6\n' +
      'num=-5: currentSum=1, maxSum=6\n' +
      'num=4:  currentSum=5, maxSum=6\n\n' +
      'return 6  (subarray [4,-1,2,1])\n\n' +
      '── Edit Distance ──\n' +
      'word1="horse", word2="ros"\n\n' +
      '     ""  r  o  s\n' +
      '"" [  0  1  2  3 ]\n' +
      'h  [  1  1  2  3 ]\n' +
      'o  [  2  2  1  2 ]\n' +
      'r  [  3  2  2  2 ]\n' +
      's  [  4  3  3  2 ]\n' +
      'e  [  5  4  4  3 ]\n\n' +
      'dp[5][3] = 3  (delete h, replace r→r, delete e: horse→rorse→orse→rse→...)\n\n' +
      '── LIS (Binary Search) ──\n' +
      'nums = [10, 9, 2, 5, 3, 7, 101, 18]\n\n' +
      'num=10: tails=[10]\n' +
      'num=9:  lo=0,hi=1,mid=0: tails[0]=10>=9 → hi=0. tails[0]=9 → tails=[9]\n' +
      'num=2:  tails=[2]\n' +
      'num=5:  lo=0,hi=1,mid=0: tails[0]=2<5 → lo=1. tails[1]=5 → tails=[2,5]\n' +
      'num=3:  lo=0,hi=2,mid=1: tails[1]=5>=3 → hi=1. mid=0: tails[0]=2<3 → lo=1. tails[1]=3 → tails=[2,3]\n' +
      'num=7:  lo=2. tails=[2,3,7]\n' +
      'num=101: tails=[2,3,7,101]\n' +
      'num=18: replace 101. tails=[2,3,7,18]\n\n' +
      'return tails.length = 4\n\n' +
      '── Stock with Cooldown (State Machine) ──\n' +
      'prices = [1, 2, 3, 0, 2]\n\n' +
      'hold=-∞, sold=0, rest=0\n' +
      'price=1: hold=max(-∞,0-1)=-1, sold=-∞+1=-∞, rest=max(0,0)=0\n' +
      'price=2: hold=max(-1,0-2)=-1, sold=-1+2=1, rest=max(0,-∞)=0\n' +
      'price=3: hold=max(-1,0-3)=-1, sold=-1+3=2, rest=max(0,1)=1\n' +
      'price=0: hold=max(-1,1-0)=1, sold=-1+0=-1, rest=max(1,2)=2\n' +
      'price=2: hold=max(1,2-2)=1, sold=1+2=3, rest=max(2,-1)=2\n\n' +
      'return max(sold=3, rest=2) = 3',
    complexity: 'Depends on state space. 1D: O(n). 2D: O(n*m). Knapsack: O(n*W).',
    commonMistakes: [
      'Wrong recurrence: missing base cases or wrong state transitions',
      '0/1 knapsack: iterating forward instead of backward (causes item reuse)',
      'Unbounded knapsack: iterating backward instead of forward',
      'Not considering all possible previous states in transition',
      'Space optimization: be careful about order of filling',
    ],
    tips: [
      'Start with brute-force recursion, add memoization, then convert to bottom-up',
      'Draw the DP table on paper to understand transitions',
      'Common states: index, remaining capacity, previous choice, boolean flags',
      'Space optimization: if dp[i] only depends on dp[i-1], use two rows or rolling array',
      'LIS has O(n log n) solution using patience sorting (binary search)',
    ],
    memorization: `HOW TO MEMORIZE DP:
DP is intimidating, but every problem follows the same 4 steps:
  1. DEFINE STATE: What does dp[i] (or dp[i][j]) represent?
  2. RECURRENCE: How does dp[i] relate to previous states?
  3. BASE CASE: What is dp[0] (or dp[0][0])?
  4. ANSWER: Where is the final answer? (dp[n], dp[n][m], max(dp))

Mnemonic: "DRBA" - Define, Recurrence, Base, Answer

THE 5 DP PATTERNS (covers 90% of problems):
  1. Linear: dp[i] = f(dp[i-1], dp[i-2]) → House Robber, Climbing Stairs
  2. Knapsack: dp[i] = min/max over dp[i-coin] → Coin Change, Partition
  3. Two-string: dp[i][j] = f(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) → LCS, Edit Distance
  4. Interval: dp[i][j] = f(dp[i][k], dp[k][j]) for k in range → Matrix Chain, Burst Balloons
  5. State machine: states = {hold, not_hold, cooldown} → Buy/Sell Stock

STARTING STRATEGY: Can't figure out the DP? Write brute-force recursion first, then add @lru_cache. That IS top-down DP.

0/1 vs UNBOUNDED KNAPSACK:
  0/1 (each item once): inner loop goes BACKWARD
  Unbounded (reuse items): inner loop goes FORWARD`,
  },

  'Greedy': {
    topic: 'Greedy',
    overview: `Greedy algorithms make locally optimal choices at each step, hoping to reach a globally optimal solution. They work when the problem has "greedy choice property" — a local optimum leads to global optimum.

Key insight: If you can prove that choosing the best option at each step never hurts the final answer, use greedy.`,
    keyPatterns: [
      'Interval scheduling: Sort by end time, pick non-overlapping',
      'Activity selection: Sort and greedily pick compatible activities',
      'Jump game: Track farthest reachable position',
      'Partition: Track last occurrence, extend partition boundary',
    ],
    template: `# Jump Game - can reach end?
def can_jump(nums):
    farthest = 0
    for i in range(len(nums)):
        if i > farthest:
            return False
        farthest = max(farthest, i + nums[i])
    return True

# Non-overlapping intervals (min removals)
def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda x: x[1])  # sort by end
    count = 0
    end = float('-inf')
    for s, e in intervals:
        if s >= end:
            end = e
        else:
            count += 1
    return count

# Partition Labels
def partition_labels(s):
    last = {c: i for i, c in enumerate(s)}
    start = end = 0
    result = []
    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            result.append(end - start + 1)
            start = end + 1
    return result

# Gas Station
def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    start = tank = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1
            tank = 0
    return start`,
    jsTemplate: `// Jump Game - can reach end?
function canJump(nums) {
    let farthest = 0; // farthest index we can reach so far

    for (let i = 0; i < nums.length; i++) {
        // If current index exceeds farthest reachable, we're stuck
        if (i > farthest) {
            return false;
        }

        // Update farthest reachable position
        farthest = Math.max(farthest, i + nums[i]);
    }
    return true;
}

// Non-overlapping intervals (min removals)
function eraseOverlapIntervals(intervals) {
    // Sort by end time: greedily keep intervals that end earliest
    intervals.sort((a, b) => a[1] - b[1]);

    let count = 0;
    let end = -Infinity; // end time of the last kept interval

    for (const [s, e] of intervals) {
        if (s >= end) {
            // No overlap: keep this interval, update end
            end = e;
        } else {
            // Overlap: remove this interval (count the removal)
            count++;
        }
    }
    return count;
}

// Partition Labels
function partitionLabels(s) {
    // Build map of each char's last occurrence
    const last = {};
    for (let i = 0; i < s.length; i++) {
        last[s[i]] = i;
    }

    let start = 0;
    let end = 0;
    const result = [];

    for (let i = 0; i < s.length; i++) {
        // Extend partition boundary to include last occurrence of current char
        end = Math.max(end, last[s[i]]);

        if (i === end) {
            // Reached end of current partition
            result.push(end - start + 1);
            start = end + 1;
        }
    }
    return result;
}

// Gas Station
function canCompleteCircuit(gas, cost) {
    // If total gas < total cost, no solution exists
    const totalGas = gas.reduce((a, b) => a + b, 0);
    const totalCost = cost.reduce((a, b) => a + b, 0);

    if (totalGas < totalCost) {
        return -1;
    }

    let start = 0;
    let tank = 0;

    for (let i = 0; i < gas.length; i++) {
        tank += gas[i] - cost[i];

        if (tank < 0) {
            // Can't start from current start — try starting from next station
            start = i + 1;
            tank = 0;
        }
    }
    return start;
}`,
    jsTemplateWalkthrough:
      '── Jump Game ──\n' +
      'nums = [2, 3, 1, 1, 4]\n\n' +
      'farthest=0\n' +
      'i=0: 0 <= 0 ok, farthest=max(0,0+2)=2\n' +
      'i=1: 1 <= 2 ok, farthest=max(2,1+3)=4\n' +
      'i=2: 2 <= 4 ok, farthest=max(4,2+1)=4\n' +
      'i=3: 3 <= 4 ok, farthest=max(4,3+1)=4\n' +
      'i=4: 4 <= 4 ok, farthest=max(4,4+4)=8\n' +
      'return true\n\n' +
      'nums = [3, 2, 1, 0, 4] (cannot reach end)\n' +
      'i=0: farthest=3\n' +
      'i=1: farthest=3\n' +
      'i=2: farthest=3\n' +
      'i=3: farthest=3\n' +
      'i=4: 4 > farthest=3 → return false\n\n' +
      '── Non-overlapping Intervals ──\n' +
      'intervals = [[1,2],[2,3],[3,4],[1,3]]\n' +
      'After sort by end: [[1,2],[2,3],[1,3],[3,4]]\n\n' +
      'end=-∞\n' +
      '[1,2]: s=1 >= end=-∞ → keep, end=2\n' +
      '[2,3]: s=2 >= end=2 → keep, end=3\n' +
      '[1,3]: s=1 < end=3 → overlap, count=1\n' +
      '[3,4]: s=3 >= end=3 → keep, end=4\n\n' +
      'return count=1\n\n' +
      '── Partition Labels ──\n' +
      's = "ababcbacadefegdehijhklij"\n' +
      'last: {a:8,b:5,c:7,d:14,e:15,f:11,g:13,h:19,i:22,j:23,k:20,l:21}\n\n' +
      'i=0: char=a, end=max(0,8)=8\n' +
      'i=1: char=b, end=max(8,5)=8\n' +
      '...\n' +
      'i=8: char=a, end=8, i===end → push 8-0+1=9, start=9\n' +
      'i=9: char=d, end=max(9,14)=14 ...\n' +
      'i=15: char=e, end=15, i===end → push 15-9+1=7, start=16\n' +
      'i=16..23: end grows to 23 → push 23-16+1=8\n\n' +
      'result = [9, 7, 8]\n\n' +
      '── Gas Station ──\n' +
      'gas=[1,2,3,4,5], cost=[3,4,5,1,2]\n' +
      'totalGas=15, totalCost=15 → solution exists\n\n' +
      'start=0, tank=0\n' +
      'i=0: tank=1-3=-2 < 0 → start=1, tank=0\n' +
      'i=1: tank=2-4=-2 < 0 → start=2, tank=0\n' +
      'i=2: tank=3-5=-2 < 0 → start=3, tank=0\n' +
      'i=3: tank=4-1=3 >= 0\n' +
      'i=4: tank=3+5-2=6 >= 0\n\n' +
      'return start=3',
    complexity: 'Usually O(n log n) due to sorting, or O(n) if no sorting needed.',
    commonMistakes: [
      'Applying greedy when it doesn\'t work (need to prove greedy choice property)',
      'Sorting by wrong criterion (start vs end time matters!)',
      'Not considering edge cases (empty input, single element)',
    ],
    tips: [
      'Interval problems: almost always sort by end time',
      'If greedy doesn\'t work, try DP',
      'Prove correctness by contradiction: "if greedy choice is wrong, we can swap for better"',
      'Jump Game: just track the farthest you can reach',
    ],
    memorization: `HOW TO MEMORIZE GREEDY:
Greedy is the simplest concept but hardest to prove correct. The trick: memorize the PATTERNS, not the proofs.

PATTERN 1 - "Farthest reach" (Jump Game):
  farthest = 0
  for each i: farthest = max(farthest, i + nums[i])
  if i > farthest: stuck!

PATTERN 2 - "Sort by end, pick non-overlapping" (Interval Scheduling):
  Sort by end time. If current start >= last end, take it.

PATTERN 3 - "Deficit reset" (Gas Station):
  Track running tank. If tank < 0, restart from next station.

HOW TO KNOW IF GREEDY WORKS:
Ask yourself: "If I make the locally best choice, can it ever hurt me later?"
  - Yes → Use DP instead
  - No → Greedy works!

Mnemonic: "Greedy = sort + scan + local best choice"`,
  },

  'Intervals': {
    topic: 'Intervals',
    overview: `Interval problems involve ranges [start, end]. Core operations: merge overlapping, find intersections, insert, and schedule.

Almost all interval problems start with sorting (usually by start time).`,
    keyPatterns: [
      'Merge: Sort by start, extend end if overlapping',
      'Insert: Find position, merge with overlapping intervals',
      'Intersection: Two pointers on sorted interval lists',
      'Meeting rooms: Sort by start, check for overlaps / count concurrent',
    ],
    template: `# Merge Intervals
def merge(intervals):
    intervals.sort()
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged

# Insert Interval
def insert(intervals, new):
    result = []
    i = 0
    # Add all before
    while i < len(intervals) and intervals[i][1] < new[0]:
        result.append(intervals[i])
        i += 1
    # Merge overlapping
    while i < len(intervals) and intervals[i][0] <= new[1]:
        new = [min(new[0], intervals[i][0]),
               max(new[1], intervals[i][1])]
        i += 1
    result.append(new)
    # Add all after
    result.extend(intervals[i:])
    return result

# Meeting Rooms II (min rooms needed)
def min_meeting_rooms(intervals):
    import heapq
    intervals.sort()
    heap = []  # end times of ongoing meetings
    for start, end in intervals:
        if heap and heap[0] <= start:
            heapq.heappop(heap)
        heapq.heappush(heap, end)
    return len(heap)`,
    jsTemplate: `// Merge Intervals
function merge(intervals) {
    // Step 1: sort by start time so overlapping intervals are adjacent
    intervals.sort((a, b) => a[0] - b[0]);

    // Step 2: seed merged list with the first interval
    const merged = [intervals[0]];

    for (let i = 1; i < intervals.length; i++) {
        const [start, end] = intervals[i];
        const lastMerged = merged[merged.length - 1];

        if (start <= lastMerged[1]) {
            // Overlaps: extend the last merged interval's end if needed
            lastMerged[1] = Math.max(lastMerged[1], end);
        } else {
            // No overlap: start a new interval
            merged.push([start, end]);
        }
    }

    return merged;
}

// Insert Interval
function insert(intervals, newInterval) {
    const result = [];
    let i = 0;

    // Phase 1: add all intervals that end before newInterval starts
    while (i < intervals.length && intervals[i][1] < newInterval[0]) {
        result.push(intervals[i]);
        i++;
    }

    // Phase 2: merge all intervals that overlap with newInterval
    while (i < intervals.length && intervals[i][0] <= newInterval[1]) {
        newInterval = [
            Math.min(newInterval[0], intervals[i][0]),
            Math.max(newInterval[1], intervals[i][1])
        ];
        i++;
    }

    // Add the merged interval
    result.push(newInterval);

    // Phase 3: add all intervals that start after newInterval ends
    while (i < intervals.length) {
        result.push(intervals[i]);
        i++;
    }

    return result;
}

// Meeting Rooms II (min rooms needed)
function minMeetingRooms(intervals) {
    // Separate and sort start times and end times independently
    const starts = intervals.map(interval => interval[0]).sort((a, b) => a - b);
    const ends = intervals.map(interval => interval[1]).sort((a, b) => a - b);

    let rooms = 0;
    let endPtr = 0;

    for (let i = 0; i < starts.length; i++) {
        if (starts[i] < ends[endPtr]) {
            // New meeting starts before earliest ongoing meeting ends → need extra room
            rooms++;
        } else {
            // A meeting has ended — reuse that room
            endPtr++;
        }
    }

    return rooms;
}`,
    jsTemplateWalkthrough: "── Merge Intervals ──\n" +
"Input: [[1,3],[2,6],[8,10],[15,18]]\n" +
"After sort: [[1,3],[2,6],[8,10],[15,18]]\n" +
"\n" +
"i=1: [2,6], lastMerged=[1,3]. start(2) <= end(3) → overlap → extend to [1,6]\n" +
"i=2: [8,10], lastMerged=[1,6]. start(8) > end(6) → no overlap → push [8,10]\n" +
"i=3: [15,18], lastMerged=[8,10]. start(15) > end(10) → no overlap → push [15,18]\n" +
"Result: [[1,6],[8,10],[15,18]]\n" +
"\n" +
"── Insert Interval ──\n" +
"Input: intervals=[[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval=[4,8]\n" +
"\n" +
"Phase 1 (end < 4): [1,2] ends at 2 < 4 → add to result. [3,5] ends at 5 >= 4 → stop\n" +
"Phase 2 (start <= 8): [3,5] start 3<=8 → merge → newInterval=[3,8]\n" +
"                      [6,7] start 6<=8 → merge → newInterval=[3,8]\n" +
"                      [8,10] start 8<=8 → merge → newInterval=[3,10]\n" +
"                      [12,16] start 12>8 → stop\n" +
"Add merged: [3,10]\n" +
"Phase 3: add [12,16]\n" +
"Result: [[1,2],[3,10],[12,16]]\n" +
"\n" +
"── Meeting Rooms II ──\n" +
"Input: [[0,30],[5,10],[15,20]]\n" +
"starts: [0, 5, 15]\n" +
"ends:   [10, 20, 30]\n" +
"\n" +
"i=0: start=0  < ends[0]=10  → rooms++ → rooms=1\n" +
"i=1: start=5  < ends[0]=10  → rooms++ → rooms=2\n" +
"i=2: start=15 >= ends[0]=10 → endPtr++ → endPtr=1 (reuse room)\n" +
"Result: 2 rooms needed",
    complexity: 'O(n log n) due to sorting. O(n) for the merge/scan pass.',
    commonMistakes: [
      'Not sorting intervals first',
      'Off-by-one with inclusive/exclusive endpoints',
      'Meeting rooms: using start times to pop from heap instead of comparing with end times',
    ],
    tips: [
      'Always sort first. By start for merge/insert. By end for scheduling.',
      'Meeting rooms II: think of it as "how many meetings overlap at peak?"',
      'Alternative for meeting rooms: sweep line with +1 at start, -1 at end',
    ],
    memorization: `HOW TO MEMORIZE INTERVAL PROBLEMS:
Rule #1: ALWAYS SORT FIRST. The only question is: by start or by end?
  - Merge intervals → sort by start
  - Scheduling / non-overlapping → sort by end

MERGE TEMPLATE (memorize this, it covers most interval problems):
  intervals.sort()
  merged = [intervals[0]]
  for s, e in intervals[1:]:
      if s <= merged[-1][1]:          # overlaps!
          merged[-1][1] = max(merged[-1][1], e)   # extend
      else:
          merged.append([s, e])       # new interval

MEETING ROOMS II (how many concurrent?):
Two approaches, memorize whichever clicks:
  1. Heap: sort by start, use min-heap of end times. If earliest end <= current start, pop it. Heap size = rooms needed.
  2. Sweep line: events = [(start, +1), (end, -1)], sort, running sum, track max.

Mnemonic: "Overlap = start of next <= end of current"`,
  },

  'Math & Geometry': {
    topic: 'Math & Geometry',
    overview: `Math problems test number theory, modular arithmetic, and geometric reasoning. Common patterns: digit manipulation, matrix rotation/spiral, GCD/LCM, and modular exponentiation.`,
    keyPatterns: [
      'Digit manipulation: mod 10 for last digit, divide by 10 to remove last digit',
      'Matrix rotation: transpose + reverse rows (90° clockwise)',
      'Spiral order: Use boundaries (top, bottom, left, right) and shrink',
      'Power/GCD: Fast exponentiation, Euclidean algorithm',
    ],
    template: `# Rotate image 90° clockwise (in-place)
def rotate(matrix):
    n = len(matrix)
    # Transpose
    for i in range(n):
        for j in range(i, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # Reverse each row
    for row in matrix:
        row.reverse()

# Spiral order
def spiral_order(matrix):
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for col in range(left, right + 1):
            result.append(matrix[top][col])
        top += 1
        for row in range(top, bottom + 1):
            result.append(matrix[row][right])
        right -= 1
        if top <= bottom:
            for col in range(right, left - 1, -1):
                result.append(matrix[bottom][col])
            bottom -= 1
        if left <= right:
            for row in range(bottom, top - 1, -1):
                result.append(matrix[row][left])
            left += 1
    return result

# Fast power
def my_pow(x, n):
    if n < 0:
        x, n = 1/x, -n
    result = 1
    while n:
        if n % 2:
            result *= x
        x *= x
        n //= 2
    return result`,
    jsTemplate: `// Rotate image 90° clockwise (in-place)
function rotate(matrix) {
    const n = matrix.length;

    // Step 1: Transpose — swap matrix[i][j] with matrix[j][i]
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        }
    }

    // Step 2: Reverse each row to complete the 90° CW rotation
    for (const row of matrix) {
        row.reverse();
    }
}

// Spiral order
function spiralOrder(matrix) {
    const result = [];
    let top = 0;
    let bottom = matrix.length - 1;
    let left = 0;
    let right = matrix[0].length - 1;

    while (top <= bottom && left <= right) {
        // Traverse right along the top row
        for (let col = left; col <= right; col++) {
            result.push(matrix[top][col]);
        }
        top++;

        // Traverse down along the right column
        for (let row = top; row <= bottom; row++) {
            result.push(matrix[row][right]);
        }
        right--;

        // Traverse left along the bottom row (only if rows remain)
        if (top <= bottom) {
            for (let col = right; col >= left; col--) {
                result.push(matrix[bottom][col]);
            }
            bottom--;
        }

        // Traverse up along the left column (only if columns remain)
        if (left <= right) {
            for (let row = bottom; row >= top; row--) {
                result.push(matrix[row][left]);
            }
            left++;
        }
    }

    return result;
}

// Fast power (x^n in O(log n))
function myPow(x, n) {
    // Handle negative exponents
    if (n < 0) {
        x = 1 / x;
        n = -n;
    }

    let result = 1;

    while (n > 0) {
        // If current bit of n is set, multiply result by current x
        if (n % 2 === 1) {
            result *= x;
        }

        // Square x for the next bit position
        x *= x;

        // Shift to the next bit
        n = Math.floor(n / 2);
    }

    return result;
}`,
    jsTemplateWalkthrough: "── Rotate 90° CW ──\n" +
"Input: [[1,2,3],[4,5,6],[7,8,9]]\n" +
"\n" +
"After transpose (swap [i][j] with [j][i]):\n" +
"  [[1,4,7],[2,5,8],[3,6,9]]\n" +
"\n" +
"After reversing each row:\n" +
"  [[7,4,1],[8,5,2],[9,6,3]]\n" +
"\n" +
"Mnemonic: top-left corner 1 → goes to top-right. Transpose puts it at [0][0]→[0][0]. Reverse puts it at [0][2].\n" +
"\n" +
"── Spiral Order ──\n" +
"Input: [[1,2,3],[4,5,6],[7,8,9]]\n" +
"Initial: top=0, bottom=2, left=0, right=2\n" +
"\n" +
"Round 1:\n" +
"  Right (row 0, cols 0→2): push 1,2,3 → top=1\n" +
"  Down  (col 2, rows 1→2): push 6,9   → right=1\n" +
"  Left  (row 2, cols 1→0): push 8,7   → bottom=1\n" +
"  Up    (col 0, rows 1→1): push 4     → left=1\n" +
"Round 2:\n" +
"  Right (row 1, col 1):    push 5     → top=2\n" +
"  top(2) > bottom(1): loop ends\n" +
"Result: [1,2,3,6,9,8,7,4,5]\n" +
"\n" +
"── Fast Power ──\n" +
"myPow(2, 10): n=10=1010 in binary\n" +
"\n" +
"n=10 (even): result=1, x=4,  n=5\n" +
"n=5  (odd):  result=4, x=16, n=2\n" +
"n=2  (even): result=4, x=256,n=1\n" +
"n=1  (odd):  result=1024, x=65536, n=0\n" +
"Return 1024 ✓",
    complexity: 'Varies. Matrix operations: O(n²). Power: O(log n). GCD: O(log(min(a,b))).',
    commonMistakes: [
      'Integer overflow (less of an issue in Python, but watch for other languages)',
      'Spiral matrix: not checking bounds after each direction change',
      'Negative exponents in pow',
      'Division: Python int division truncates toward negative infinity (use int(a/b) for truncation toward zero)',
    ],
    tips: [
      'Rotate 90° CW = transpose + reverse rows. CCW = transpose + reverse columns.',
      'For digit problems: while n > 0: digit = n % 10; n //= 10',
      'Sieve of Eratosthenes for counting primes',
      'Happy number: use cycle detection (set or fast/slow pointer)',
    ],
    memorization: `HOW TO MEMORIZE MATH & GEOMETRY:
MATRIX ROTATION 90° CW (most common):
  Step 1: Transpose (swap matrix[i][j] with matrix[j][i])
  Step 2: Reverse each row
  Mnemonic: "Transpose then Reverse = Rotate Right"

SPIRAL ORDER (memorize the 4-wall shrink):
  top, bottom, left, right = boundaries
  Go: right → down → left → up
  After each direction: shrink that boundary
  Mnemonic: "Clockwise = RDLU (Right Down Left Up), shrink after each"

DIGIT EXTRACTION:
  while n > 0:
      last_digit = n % 10
      n = n // 10
  Mnemonic: "Mod 10 peels, Div 10 shifts"

FAST POWER (x^n in O(log n)):
  result = 1
  while n > 0:
      if n is odd: result *= x
      x *= x; n //= 2
  Mnemonic: "Square x each time, multiply into result when bit is set"`,
  },

  'Bit Manipulation': {
    topic: 'Bit Manipulation',
    overview: `Bit manipulation uses bitwise operators (&, |, ^, ~, <<, >>) to solve problems efficiently. Key property: XOR (^) cancels out duplicates — a ^ a = 0, a ^ 0 = a.`,
    keyPatterns: [
      'XOR for finding unique: XOR all elements, duplicates cancel out',
      'Bit masking: Use bits as boolean flags for subsets',
      'Count bits: n & (n-1) removes lowest set bit',
      'Check power of 2: n & (n-1) == 0',
    ],
    template: `# Single Number (find unique in array of pairs)
def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result

# Number of 1 bits
def hamming_weight(n):
    count = 0
    while n:
        count += 1
        n &= n - 1  # remove lowest set bit
    return count

# Counting bits for 0..n
def count_bits(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)
    return dp

# Reverse bits
def reverse_bits(n):
    result = 0
    for _ in range(32):
        result = (result << 1) | (n & 1)
        n >>= 1
    return result`,
    jsTemplate: `// Single Number (find unique in array of pairs)
// XOR property: a ^ a = 0, a ^ 0 = a → duplicates cancel out
function singleNumber(nums) {
    let result = 0;

    for (const num of nums) {
        result ^= num;  // pairs cancel, unique survives
    }

    return result;
}

// Number of 1 bits (Hamming weight)
// Trick: n & (n-1) clears the lowest set bit each iteration
function hammingWeight(n) {
    let count = 0;

    while (n !== 0) {
        count++;
        n = n & (n - 1);  // remove lowest set bit
    }

    return count;
}

// Counting bits for 0..n
// DP trick: dp[i] = dp[i >> 1] + (i & 1)
// The bit count of i = bit count of i/2, plus 1 if i is odd
function countBits(n) {
    const dp = new Array(n + 1).fill(0);

    for (let i = 1; i <= n; i++) {
        const halfBits = dp[i >> 1];   // bit count of i with last bit removed
        const lastBit = i & 1;          // 1 if i is odd, else 0
        dp[i] = halfBits + lastBit;
    }

    return dp;
}

// Reverse bits (32-bit unsigned integer)
function reverseBits(n) {
    let result = 0;

    for (let i = 0; i < 32; i++) {
        const lastBit = n & 1;               // extract the lowest bit of n
        result = (result << 1) | lastBit;    // shift result left, then add the bit
        n >>>= 1;                            // unsigned right shift n
    }

    return result >>> 0;  // ensure unsigned 32-bit output
}`,
    jsTemplateWalkthrough: "── Single Number ──\n" +
"Input: [4, 1, 2, 1, 2]\n" +
"\n" +
"result = 0\n" +
"  ^ 4 = 4   (0100)\n" +
"  ^ 1 = 5   (0101)\n" +
"  ^ 2 = 7   (0111)\n" +
"  ^ 1 = 6   (0110)  ← 1 cancels\n" +
"  ^ 2 = 4   (0100)  ← 2 cancels\n" +
"Return 4 ✓\n" +
"\n" +
"── Hamming Weight ──\n" +
"Input: n = 11 (binary: 1011)\n" +
"\n" +
"n=1011: n&(n-1)=1011&1010=1010, count=1\n" +
"n=1010: n&(n-1)=1010&1001=1000, count=2\n" +
"n=1000: n&(n-1)=1000&0111=0000, count=3\n" +
"n=0: stop. Return 3 ✓\n" +
"\n" +
"── Count Bits ──\n" +
"n=5: dp = [0, 0, 0, 0, 0, 0]\n" +
"\n" +
"i=1: dp[0] + (1&1) = 0+1 = 1\n" +
"i=2: dp[1] + (2&1) = 1+0 = 1\n" +
"i=3: dp[1] + (3&1) = 1+1 = 2\n" +
"i=4: dp[2] + (4&1) = 1+0 = 1\n" +
"i=5: dp[2] + (5&1) = 1+1 = 2\n" +
"Return [0,1,1,2,1,2] ✓",
    complexity: 'O(1) or O(log n) for bit operations. O(n) for array-based bit problems.',
    commonMistakes: [
      'Confusing & (AND) with && (logical AND)',
      'Not handling negative numbers with bit operations',
      'Operator precedence: & has lower precedence than ==',
    ],
    tips: [
      'XOR is your best friend for "find the unique element" problems',
      'n & (n-1) clears the lowest set bit — useful for counting bits',
      'Use bit mask as set: if (mask >> i) & 1 checks if bit i is set',
      'For "single number" variants with 3 occurrences, count bits modulo 3',
    ],
    memorization: `HOW TO MEMORIZE BIT MANIPULATION:
THE 6 OPERATORS (memorize what each does to bits):
  &  AND:  1 & 1 = 1, else 0  → "Both must be 1"
  |  OR:   0 | 0 = 0, else 1  → "Either can be 1"
  ^  XOR:  same = 0, diff = 1 → "Toggle / cancel duplicates"
  ~  NOT:  flip all bits
  << LEFT SHIFT:  multiply by 2
  >> RIGHT SHIFT: divide by 2

THE 3 TRICKS YOU NEED (covers 90% of bit problems):
  1. XOR all elements: duplicates cancel → find the unique one
     result = 0; for num: result ^= num

  2. n & (n-1): removes the LOWEST set bit
     Use for: counting bits, checking power of 2
     Power of 2 check: n > 0 and n & (n-1) == 0

  3. n & 1: checks if last bit is set (odd/even)
     Extract bit i: (n >> i) & 1
     Set bit i: n | (1 << i)

Mnemonic: "XOR cancels twins. AND(n, n-1) kills the lowest bit."`,
  },

  'Union Find': {
    topic: 'Union Find',
    overview: `Union-Find (Disjoint Set Union) tracks a collection of non-overlapping sets. It supports two operations efficiently:
• Find(x): Which set does x belong to? (returns the set representative/root)
• Union(x, y): Merge the sets containing x and y

Two optimizations make it nearly O(1) per operation:
• Path compression: During find, point every node directly to the root
• Union by rank: Attach the shorter tree under the taller tree

Use cases: connected components, cycle detection, Kruskal's MST, grouping/merging.`,
    keyPatterns: [
      'Connected components: Union all edges, count distinct roots',
      'Cycle detection: If find(u) == find(v) before union, adding edge (u,v) creates a cycle',
      'Kruskal\'s MST: Sort edges by weight, union greedily, skip cycles',
      'Accounts merge / grouping: Union items sharing a common key',
    ],
    template: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.components = n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]  # path compression
            x = self.parent[x]
        return x

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False  # already connected
        # Union by rank
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        self.components -= 1
        return True

    def connected(self, x, y):
        return self.find(x) == self.find(y)

# Usage: connected components
def count_components(n, edges):
    uf = UnionFind(n)
    for u, v in edges:
        uf.union(u, v)
    return uf.components

# Usage: cycle detection
def has_cycle(n, edges):
    uf = UnionFind(n)
    for u, v in edges:
        if not uf.union(u, v):
            return True  # u and v already connected = cycle
    return False`,
    jsTemplate: `class UnionFind {
    constructor(n) {
        // Each node starts as its own parent (its own component)
        this.parent = Array.from({ length: n }, (_, i) => i);
        // Rank tracks approximate tree height for union-by-rank
        this.rank = new Array(n).fill(0);
        // Track number of distinct components
        this.components = n;
    }

    find(x) {
        // Walk up to the root, compressing path along the way
        while (this.parent[x] !== x) {
            // Path compression: point directly to grandparent
            this.parent[x] = this.parent[this.parent[x]];
            x = this.parent[x];
        }
        return x;
    }

    union(x, y) {
        let px = this.find(x);
        let py = this.find(y);

        // Already in the same component — no union needed
        if (px === py) {
            return false;
        }

        // Union by rank: attach the shorter tree under the taller one
        if (this.rank[px] < this.rank[py]) {
            const temp = px;
            px = py;
            py = temp;
        }

        this.parent[py] = px;

        // Only increase rank when two equal-height trees merge
        if (this.rank[px] === this.rank[py]) {
            this.rank[px]++;
        }

        this.components--;
        return true;
    }

    connected(x, y) {
        return this.find(x) === this.find(y);
    }
}

// Count connected components in a graph
function countComponents(n, edges) {
    const uf = new UnionFind(n);

    for (const [u, v] of edges) {
        uf.union(u, v);
    }

    return uf.components;
}

// Detect a cycle in an undirected graph
function hasCycle(n, edges) {
    const uf = new UnionFind(n);

    for (const [u, v] of edges) {
        // If u and v are already connected, adding this edge creates a cycle
        if (!uf.union(u, v)) {
            return true;
        }
    }

    return false;
}`,
    jsTemplateWalkthrough: "── Union-Find: countComponents ──\n" +
"Input: n=5, edges=[[0,1],[1,2],[3,4]]\n" +
"Initial parent: [0,1,2,3,4], components=5\n" +
"\n" +
"union(0,1): find(0)=0, find(1)=1 → parent[1]=0, components=4\n" +
"  parent: [0,0,2,3,4]\n" +
"\n" +
"union(1,2): find(1)→parent[1]=0→root=0, find(2)=2 → parent[2]=0, components=3\n" +
"  parent: [0,0,0,3,4]\n" +
"\n" +
"union(3,4): find(3)=3, find(4)=4 → parent[4]=3, components=2\n" +
"  parent: [0,0,0,3,3]\n" +
"\n" +
"Return 2 ✓\n" +
"\n" +
"── Union-Find: hasCycle ──\n" +
"Input: n=3, edges=[[0,1],[1,2],[0,2]]\n" +
"Initial parent: [0,1,2]\n" +
"\n" +
"union(0,1): find(0)=0, find(1)=1 → different → merge OK\n" +
"union(1,2): find(1)=0, find(2)=2 → different → merge OK\n" +
"union(0,2): find(0)=0, find(2)=0 → SAME root! → return false from union\n" +
"hasCycle returns true ✓\n" +
"\n" +
"── Path Compression ──\n" +
"Before find(3): 3→2→1→0 (root)\n" +
"Step 1: parent[3]=parent[parent[3]]=parent[2]=1, x=1\n" +
"Step 2: parent[1]=parent[parent[1]]=parent[0]=0, x=0 (root)\n" +
"After:  3→1→0, 1→0 (flatter tree, faster future lookups)",
    complexity: 'O(alpha(n)) per operation where alpha is inverse Ackermann (effectively O(1)). Build: O(n).',
    commonMistakes: [
      'Forgetting path compression (degrades to O(n) per find)',
      'Union without checking if already connected (incorrect component count)',
      'Using 0-indexed vs 1-indexed parent array (off-by-one)',
      'Not tracking component count separately (re-counting roots is O(n))',
    ],
    tips: [
      'Union-Find is better than BFS/DFS when edges arrive incrementally (online)',
      'For "are X and Y connected?" after batch operations, UF is simpler than graph traversal',
      'Path compression alone gives O(log n). Adding union by rank gives O(alpha(n)).',
      'Common interview signal: "connected", "grouped", "merge", "same component"',
    ],
    memorization: `HOW TO MEMORIZE UNION-FIND:
The entire data structure is just 3 functions. Memorize them:

FIND (with path compression):
  def find(x):
      while parent[x] != x:
          parent[x] = parent[parent[x]]  # point to grandparent
          x = parent[x]
      return x

UNION (by rank):
  def union(x, y):
      px, py = find(x), find(y)
      if px == py: return False  # already together
      if rank[px] < rank[py]: swap
      parent[py] = px           # attach smaller under larger
      if rank[px] == rank[py]: rank[px] += 1
      return True

INIT:
  parent = [0, 1, 2, ..., n-1]  # everyone is their own boss
  rank = [0, 0, ..., 0]

Mnemonic: "Find your boss, merge the smaller team under the bigger one."

PATH COMPRESSION visual: Instead of A -> B -> C -> Root,
make it A -> Root, B -> Root, C -> Root (flat tree = fast lookup).

WHEN TO USE: If you see "connected components" or "are X and Y in the same group?" → Union-Find.`,
  },

  'Monotonic Queue': {
    topic: 'Monotonic Queue',
    overview: `A monotonic queue (usually implemented with a deque) maintains elements in sorted order within a sliding window. It solves "sliding window min/max" in O(n) instead of O(nk).

Two types:
• Monotonic decreasing deque: front is always the MAX (for sliding window maximum)
• Monotonic increasing deque: front is always the MIN (for sliding window minimum)

Key insight: when a new element arrives that is larger than existing elements, those existing elements can NEVER be the answer for any future window (the new element is both newer and larger). So we remove them.`,
    keyPatterns: [
      'Sliding window maximum: Decreasing deque, front = max, remove smaller from back',
      'Sliding window minimum: Increasing deque, front = min, remove larger from back',
      'Window with max-min constraint: Use TWO deques (one for max, one for min)',
      'Deque stores indices (not values) so we can check if front is outside the window',
    ],
    template: `from collections import deque

# Sliding Window Maximum
def max_sliding_window(nums, k):
    dq = deque()  # indices, values decreasing
    result = []
    for i in range(len(nums)):
        # Remove elements outside window
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        # Remove smaller elements from back (they lose to nums[i])
        while dq and nums[dq[-1]] <= nums[i]:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(nums[dq[0]])  # front is the max
    return result

# Sliding Window Minimum (just flip the comparison)
def min_sliding_window(nums, k):
    dq = deque()  # indices, values increasing
    result = []
    for i in range(len(nums)):
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        while dq and nums[dq[-1]] >= nums[i]:  # >= instead of <=
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result

# Longest subarray where max - min <= limit
def longest_subarray(nums, limit):
    max_dq = deque()  # decreasing
    min_dq = deque()  # increasing
    left = result = 0
    for right in range(len(nums)):
        while max_dq and nums[max_dq[-1]] <= nums[right]: max_dq.pop()
        while min_dq and nums[min_dq[-1]] >= nums[right]: min_dq.pop()
        max_dq.append(right)
        min_dq.append(right)
        while nums[max_dq[0]] - nums[min_dq[0]] > limit:
            left += 1
            if max_dq[0] < left: max_dq.popleft()
            if min_dq[0] < left: min_dq.popleft()
        result = max(result, right - left + 1)
    return result`,
    jsTemplate: `// Sliding Window Maximum
// Deque stores indices; nums values in deque are DECREASING (front = max)
function maxSlidingWindow(nums, k) {
    const dq = [];     // stores indices; nums[dq[0]] is always the max
    const result = [];
    for (let i = 0; i < nums.length; i++) {
        // Expire: remove front if it has slid out of the window
        while (dq.length > 0 && dq[0] < i - k + 1) {
            dq.shift();
        }
        // Clean: remove back indices whose values are <= current
        while (dq.length > 0 && nums[dq[dq.length - 1]] <= nums[i]) {
            dq.pop();
        }
        dq.push(i);
        // Record answer once the first full window is reached
        if (i >= k - 1) {
            result.push(nums[dq[0]]);
        }
    }
    return result;
}

// Sliding Window Minimum
// Same loop structure, but remove from back when back >= current
function minSlidingWindow(nums, k) {
    const dq = [];     // stores indices; nums[dq[0]] is always the min
    const result = [];
    for (let i = 0; i < nums.length; i++) {
        while (dq.length > 0 && dq[0] < i - k + 1) {
            dq.shift();
        }
        while (dq.length > 0 && nums[dq[dq.length - 1]] >= nums[i]) {
            dq.pop();
        }
        dq.push(i);
        if (i >= k - 1) {
            result.push(nums[dq[0]]);
        }
    }
    return result;
}

// Longest subarray where max - min <= limit
// Uses TWO deques: one tracks the running max, one tracks the running min
function longestSubarray(nums, limit) {
    const maxDq = [];  // decreasing — front is the current window max
    const minDq = [];  // increasing — front is the current window min
    let left = 0;
    let result = 0;
    for (let right = 0; right < nums.length; right++) {
        // Maintain the max deque
        while (maxDq.length > 0 && nums[maxDq[maxDq.length - 1]] <= nums[right]) {
            maxDq.pop();
        }
        maxDq.push(right);
        // Maintain the min deque
        while (minDq.length > 0 && nums[minDq[minDq.length - 1]] >= nums[right]) {
            minDq.pop();
        }
        minDq.push(right);
        // Shrink from the left while constraint is violated
        while (nums[maxDq[0]] - nums[minDq[0]] > limit) {
            left++;
            if (maxDq[0] < left) {
                maxDq.shift();
            }
            if (minDq[0] < left) {
                minDq.shift();
            }
        }
        result = Math.max(result, right - left + 1);
    }
    return result;
}`,
    jsTemplateWalkthrough: "── Sliding Window Maximum ──\n" +
"Input: nums=[1,3,-1,-3,5,3,6,7], k=3\n" +
"\n" +
"i=0: val=1.  clean: nothing. push 0. dq=[0]\n" +
"i=1: val=3.  clean: nums[0]=1<=3 → pop 0. push 1. dq=[1]\n" +
"i=2: val=-1. nums[1]=3>-1 → stop. push 2. dq=[1,2]. i>=2 → result=[3]\n" +
"i=3: val=-3. push 3. dq=[1,2,3]. dq[0]=1>=1, no expire. result=[3,3]\n" +
"i=4: val=5.  clean: pop 3(-3),2(-1),1(3). push 4. dq=[4]. result=[3,3,5]\n" +
"i=5: val=3.  nums[4]=5>3 → stop. push 5. dq=[4,5]. result=[3,3,5,5]\n" +
"i=6: val=6.  clean: pop 5(3),4(5). push 6. dq=[6]. result=[3,3,5,5,6]\n" +
"i=7: val=7.  clean: pop 6(6). push 7. dq=[7]. result=[3,3,5,5,6,7] ✓\n" +
"\n" +
"── Longest Subarray (max - min <= limit) ──\n" +
"Input: nums=[8,2,4,7], limit=4\n" +
"\n" +
"right=0: maxDq=[0](8), minDq=[0](8). 8-8=0<=4. len=1\n" +
"right=1: maxDq=[0](8), minDq=[1](2). 8-2=6>4 → left=1\n" +
"  maxDq[0]=0<1 → shift. maxDq=[1](2). 2-2=0<=4. len=1\n" +
"right=2: maxDq=[2](4), minDq=[1,2](2,4). 4-2=2<=4. len=2\n" +
"right=3: maxDq=[3](7), minDq=[1,3](2,7). 7-2=5>4 → left=2\n" +
"  minDq[0]=1<2 → shift. minDq=[3](7). 7-7=0<=4. len=2\n" +
"Result: 2",
    complexity: 'O(n) time (each element enters and leaves deque once). O(k) space for the deque.',
    commonMistakes: [
      'Storing values instead of indices (can\'t check if element left the window)',
      'Forgetting to remove expired front elements (stale max/min)',
      'Wrong comparison direction: <= for max deque, >= for min deque',
      'Using a regular queue instead of deque (can\'t pop from back)',
    ],
    tips: [
      'Monotonic deque = monotonic stack + ability to pop from front (for window expiry)',
      'Always store INDICES, look up values via nums[idx]',
      'Front = answer (max or min). Back = where new elements enter.',
      'The deque never has more than k elements, so space is O(k).',
    ],
    memorization: `HOW TO MEMORIZE MONOTONIC QUEUE:
It's a deque with 3 operations per element. Memorize this loop:

  for i in range(n):
      EXPIRE: remove front if outside window
      CLEAN:  remove back elements that lose to nums[i]
      ADD:    append i to back
      RECORD: if window full, front is the answer

Mnemonic: "ECA-R" - Expire, Clean, Add, Record

FOR MAX: decreasing deque. Remove back if <= current.
FOR MIN: increasing deque. Remove back if >= current.

Think of it as a "hall of fame" that only keeps potential winners:
  - New champion arrives → old losers are kicked out (back removal)
  - Champion retires → removed from front (window expiry)
  - Current champion → always at the front

WHEN TO USE: "sliding window" + "max/min" in the same sentence → monotonic deque.`,
  },

  'Divide & Conquer': {
    topic: 'Divide & Conquer',
    overview: `Divide and Conquer splits a problem into smaller subproblems, solves each recursively, then combines the results. The three steps:
1. DIVIDE: Split the problem (usually in half)
2. CONQUER: Recursively solve subproblems (base case: trivially small)
3. COMBINE: Merge subproblem solutions into final answer

Classic algorithms:
• Merge Sort: split, sort halves, merge - O(n log n)
• Quick Sort/Select: partition around pivot - O(n log n) avg / O(n) for select
• Binary Search: eliminate half each step - O(log n)
• Count inversions: modified merge sort - O(n log n)`,
    keyPatterns: [
      'Merge sort: Split in half, sort each, merge two sorted arrays',
      'Quick select: Partition, recurse into ONE side containing target',
      'Count inversions: During merge, count how many left elements are greater than right',
      'Closest pair: Split by x-coordinate, recursively solve halves, check strip',
    ],
    template: `# Merge Sort
def merge_sort(nums):
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = merge_sort(nums[:mid])
    right = merge_sort(nums[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Quick Select (kth smallest)
import random
def quick_select(nums, k):
    pivot = random.choice(nums)
    less = [x for x in nums if x < pivot]
    equal = [x for x in nums if x == pivot]
    greater = [x for x in nums if x > pivot]

    if k <= len(less):
        return quick_select(less, k)
    elif k <= len(less) + len(equal):
        return pivot
    else:
        return quick_select(greater, k - len(less) - len(equal))

# Count inversions (modified merge sort)
def count_inversions(nums):
    if len(nums) <= 1:
        return nums, 0
    mid = len(nums) // 2
    left, left_inv = count_inversions(nums[:mid])
    right, right_inv = count_inversions(nums[mid:])
    merged = []
    inversions = left_inv + right_inv
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
            inversions += len(left) - i  # all remaining left > right[j]
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged, inversions`,
    jsTemplate: `// Merge Sort — Divide, Conquer, Combine
function mergeSort(nums) {
    if (nums.length <= 1) {
        return nums;  // base case: already sorted
    }
    const mid = Math.floor(nums.length / 2);
    const left = mergeSort(nums.slice(0, mid));
    const right = mergeSort(nums.slice(mid));
    return merge(left, right);
}

// Merge two already-sorted arrays into one sorted array
function merge(left, right) {
    const result = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }

    // Drain any remaining elements from the left side
    while (i < left.length) {
        result.push(left[i]);
        i++;
    }

    // Drain any remaining elements from the right side
    while (j < right.length) {
        result.push(right[j]);
        j++;
    }

    return result;
}

// Quick Select — find the kth smallest element (0-indexed) in O(n) average
function quickSelect(nums, k) {
    // Randomize pivot to avoid O(n^2) on sorted inputs
    const pivotIndex = Math.floor(Math.random() * nums.length);
    const pivot = nums[pivotIndex];

    const less = nums.filter(x => x < pivot);
    const equal = nums.filter(x => x === pivot);
    const greater = nums.filter(x => x > pivot);

    if (k < less.length) {
        // kth smallest is in the less partition
        return quickSelect(less, k);
    } else if (k < less.length + equal.length) {
        // kth smallest is the pivot itself
        return pivot;
    } else {
        // kth smallest is in the greater partition; adjust k
        return quickSelect(greater, k - less.length - equal.length);
    }
}

// Count inversions using modified merge sort
// An inversion is a pair where nums[i] > nums[j] with i < j
function countInversions(nums) {
    if (nums.length <= 1) {
        return [nums, 0];
    }

    const mid = Math.floor(nums.length / 2);
    const [left, leftInv] = countInversions(nums.slice(0, mid));
    const [right, rightInv] = countInversions(nums.slice(mid));

    const merged = [];
    let inv = leftInv + rightInv;
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            merged.push(left[i]);
            i++;
        } else {
            // All remaining left elements are > right[j] → count them all
            merged.push(right[j]);
            j++;
            inv += left.length - i;
        }
    }

    while (i < left.length) {
        merged.push(left[i]);
        i++;
    }
    while (j < right.length) {
        merged.push(right[j]);
        j++;
    }

    return [merged, inv];
}`,
    jsTemplateWalkthrough: "── Merge Sort ──\n" +
"Input: [3,1,4,1,5]\n" +
"\n" +
"mergeSort([3,1,4,1,5]):\n" +
"  left  = mergeSort([3,1])   → merge([3],[1]) = [1,3]\n" +
"  right = mergeSort([4,1,5]):\n" +
"    left=mergeSort([4])=[4], right=mergeSort([1,5])=merge([1],[5])=[1,5]\n" +
"    merge([4],[1,5]) = [1,4,5]\n" +
"  merge([1,3],[1,4,5]):\n" +
"    1<=1 → push 1, i++\n" +
"    3>1  → push 1, j++\n" +
"    3<=4 → push 3, i++ (i=2, exhausted)\n" +
"    append [4,5]\n" +
"  Result: [1,1,3,4,5] ✓\n" +
"\n" +
"── Quick Select ──\n" +
"Find 2nd smallest (k=1) in [3,1,4,1,5]\n" +
"\n" +
"pivot=3: less=[1,1], equal=[3], greater=[4,5]\n" +
"  k=1 < len(less)=2 → recurse quickSelect([1,1], 1)\n" +
"pivot=1: less=[], equal=[1,1], greater=[]\n" +
"  k=1 < 0+2 → return pivot=1 ✓\n" +
"\n" +
"── Count Inversions ──\n" +
"Input: [3,1,2] → expected 2: (3,1) and (3,2)\n" +
"\n" +
"Split: left=[3], right=[1,2]\n" +
"countInversions([3]) = ([3], 0)\n" +
"countInversions([1,2]) = ([1,2], 0)\n" +
"merge [3] and [1,2]:\n" +
"  3>1: push 1, j++, inv += left.length-i = 1-0=1. inv=1\n" +
"  3>2: push 2, j++, inv += 1. inv=2\n" +
"  push 3\n" +
"Return ([1,2,3], 2) ✓",
    complexity: 'Merge sort: O(n log n). Quick select: O(n) avg, O(n^2) worst. Binary search: O(log n).',
    commonMistakes: [
      'Quick select: not randomizing pivot (worst case O(n^2) on sorted input)',
      'Merge: forgetting to append remaining elements after one side is exhausted',
      'Count inversions: counting inversions in wrong direction',
      'Not handling base case (length 0 or 1)',
    ],
    tips: [
      'Merge sort is stable, quicksort is not (but quicksort is in-place)',
      'Quick select is O(n) on average vs O(n log n) for sorting - use it for kth element',
      'If a problem says "count pairs where left > right", think merge sort + count inversions',
      'Master theorem: T(n) = aT(n/b) + O(n^d) determines the complexity',
    ],
    memorization: `HOW TO MEMORIZE DIVIDE & CONQUER:
The pattern is always 3 steps: SPLIT, SOLVE, COMBINE

MERGE SORT (memorize the merge function, it's the core):
  i, j = 0, 0  (two pointers on two sorted arrays)
  while both have elements:
      take the smaller one
  append remaining from whichever side isn't empty

QUICK SELECT (memorize as "partition + recurse ONE side"):
  1. Pick random pivot
  2. Split into less, equal, greater
  3. If k is in less → recurse left
     If k is in equal → return pivot
     If k is in greater → recurse right (adjust k)

  Why O(n)? Each step does O(n) work but halves the problem:
  n + n/2 + n/4 + ... = 2n = O(n)

WHEN TO USE D&C:
  - Sorting → merge sort
  - kth element → quick select
  - "Count X across all pairs" → modified merge sort
  - Any problem that naturally splits in half

Mnemonic: "Split in half, solve each half, stitch together."`,
  },

  'Segment Tree': {
    topic: 'Segment Tree',
    overview: `A Segment Tree is a binary tree where each node stores aggregate information (sum, min, max, etc.) about a range of the array. It supports:
• Range query: Get aggregate over [l, r] in O(log n)
• Point update: Update a single element in O(log n)
• (Advanced) Range update with lazy propagation

Structure: Array of size 4n. Node i covers a range, children are 2i and 2i+1.
Leaves are individual elements. Each parent = combine(left_child, right_child).`,
    keyPatterns: [
      'Range sum query + update: Most common use case',
      'Range min/max query: Change combine function to min/max',
      'Count in range: Each node stores count of elements satisfying condition',
      'Lazy propagation: Batch updates to ranges (advanced)',
    ],
    template: `class SegmentTree:
    def __init__(self, nums):
        self.n = len(nums)
        self.tree = [0] * (4 * self.n)
        if self.n > 0:
            self._build(nums, 1, 0, self.n - 1)

    def _build(self, nums, node, start, end):
        if start == end:
            self.tree[node] = nums[start]
            return
        mid = (start + end) // 2
        self._build(nums, 2 * node, start, mid)
        self._build(nums, 2 * node + 1, mid + 1, end)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def update(self, idx, val):
        self._update(1, 0, self.n - 1, idx, val)

    def _update(self, node, start, end, idx, val):
        if start == end:
            self.tree[node] = val
            return
        mid = (start + end) // 2
        if idx <= mid:
            self._update(2 * node, start, mid, idx, val)
        else:
            self._update(2 * node + 1, mid + 1, end, idx, val)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def query(self, l, r):
        return self._query(1, 0, self.n - 1, l, r)

    def _query(self, node, start, end, l, r):
        if r < start or end < l:
            return 0  # no overlap
        if l <= start and end <= r:
            return self.tree[node]  # full overlap
        mid = (start + end) // 2
        return (self._query(2 * node, start, mid, l, r) +
                self._query(2 * node + 1, mid + 1, end, l, r))`,
    jsTemplate: `class SegmentTree {
    constructor(nums) {
        this.n = nums.length;
        // 4*n slots is always sufficient to store the entire segment tree
        this.tree = new Array(4 * this.n).fill(0);

        if (this.n > 0) {
            this._build(nums, 1, 0, this.n - 1);
        }
    }
    // Build the tree recursively; node 1 is the root covering [0, n-1]
    _build(nums, node, start, end) {
        if (start === end) {
            // Leaf node: store the actual value
            this.tree[node] = nums[start];
            return;
        }

        const mid = Math.floor((start + end) / 2);

        // Build left child (2*node) and right child (2*node+1)
        this._build(nums, 2 * node, start, mid);
        this._build(nums, 2 * node + 1, mid + 1, end);

        // Parent stores combined value of both children
        this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
    }

    // Point update: set nums[idx] = val
    update(idx, val) {
        this._update(1, 0, this.n - 1, idx, val);
    }

    _update(node, start, end, idx, val) {
        if (start === end) {
            // Reached the leaf — set the new value
            this.tree[node] = val;
            return;
        }

        const mid = Math.floor((start + end) / 2);

        if (idx <= mid) {
            this._update(2 * node, start, mid, idx, val);
        } else {
            this._update(2 * node + 1, mid + 1, end, idx, val);
        }

        // Recalculate parent from updated children
        this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
    }

    // Range sum query over [l, r] (0-indexed, inclusive)
    query(l, r) {
        return this._query(1, 0, this.n - 1, l, r);
    }

    _query(node, start, end, l, r) {
        // Case 1: No overlap — node range is completely outside query range
        if (r < start || end < l) {
            return 0;
        }

        // Case 2: Full overlap — node range is completely inside query range
        if (l <= start && end <= r) {
            return this.tree[node];
        }

        // Case 3: Partial overlap — query both children and combine
        const mid = Math.floor((start + end) / 2);
        const leftSum = this._query(2 * node, start, mid, l, r);
        const rightSum = this._query(2 * node + 1, mid + 1, end, l, r);
        return leftSum + rightSum;
    }
}`,
    jsTemplateWalkthrough: "── Segment Tree Build ──\n" +
"Input: nums=[1,3,5,7]\n" +
"Node 1 = root, covers [0,3]. Children: 2*node and 2*node+1\n" +
"\n" +
"_build(1,[0,3]): mid=1\n" +
"  _build(2,[0,1]): mid=0\n" +
"    _build(4,[0,0]): leaf → tree[4]=1\n" +
"    _build(5,[1,1]): leaf → tree[5]=3\n" +
"    tree[2] = 1+3 = 4\n" +
"  _build(3,[2,3]): mid=2\n" +
"    _build(6,[2,2]): leaf → tree[6]=5\n" +
"    _build(7,[3,3]): leaf → tree[7]=7\n" +
"    tree[3] = 5+7 = 12\n" +
"  tree[1] = 4+12 = 16\n" +
"\n" +
"── Range Query ──\n" +
"query(1,2) → sum of indices 1,2 = 3+5 = 8\n" +
"\n" +
"_query(1,[0,3],l=1,r=2): partial → split\n" +
"  _query(2,[0,1],l=1,r=2): partial → split\n" +
"    _query(4,[0,0],l=1,r=2): 2<1? no. 0>2? no. partial → but 0<l → NO OVERLAP → 0\n" +
"      Actually: r=2>=start=0, end=0>=l=1? No (0<1) → NO OVERLAP → 0\n" +
"    _query(5,[1,1],l=1,r=2): 1<=1 and 1<=2 → FULL → tree[5]=3\n" +
"    left result: 0+3=3\n" +
"  _query(3,[2,3],l=1,r=2): partial → split\n" +
"    _query(6,[2,2],l=1,r=2): FULL → tree[6]=5\n" +
"    _query(7,[3,3],l=1,r=2): 3>r=2 → NO OVERLAP → 0\n" +
"    right result: 5+0=5\n" +
"  Total: 3+5=8 ✓\n" +
"\n" +
"── Point Update ──\n" +
"update(1, 10): change index 1 from 3 to 10\n" +
"Path down: node1→node2→node5(leaf) → tree[5]=10\n" +
"Path back up: tree[2]=tree[4]+tree[5]=1+10=11\n" +
"             tree[1]=tree[2]+tree[3]=11+12=23",
    complexity: 'Build: O(n). Query: O(log n). Update: O(log n). Space: O(n).',
    commonMistakes: [
      'Allocating too little space (use 4n, not 2n)',
      'Wrong merge function (sum vs min vs max)',
      'Off-by-one in range checks (use inclusive ranges consistently)',
      'Forgetting to update parent after modifying child in update',
    ],
    tips: [
      'For range sum + point update: segment tree is the go-to',
      'For range min/max: change + to min/max in build/update/query',
      'BIT (Fenwick tree) is simpler for range sum, but segment tree is more versatile',
      'If you need range UPDATE (not point update): add lazy propagation',
    ],
    memorization: `HOW TO MEMORIZE SEGMENT TREE:
The tree has 3 functions: BUILD, UPDATE, QUERY. All recursive with same structure.

Node indexing: node i has children 2i and 2i+1.
Each node covers a range [start, end].

BUILD:
  if leaf (start == end): tree[node] = nums[start]
  else: build left, build right, tree[node] = left + right

UPDATE (point):
  if leaf: set value
  else: recurse into correct child, recalculate parent

QUERY (range):
  3 cases:
  1. NO OVERLAP (query range outside node range): return 0
  2. FULL OVERLAP (node range inside query range): return tree[node]
  3. PARTIAL: split and recurse into both children

Mnemonic for query: "None? Zero. All? Return. Partial? Split."

WHEN TO USE: "range query + update" in the same problem → Segment Tree.
If only queries (no updates): prefix sum is simpler.`,
  },

  'String Algorithms': {
    topic: 'String Algorithms',
    overview: `String matching algorithms find patterns within text efficiently. The key algorithms:

• KMP (Knuth-Morris-Pratt): O(n+m) pattern matching using failure function (LPS array)
• Rabin-Karp: O(n+m) average using rolling hash, simpler to code
• Z-Algorithm: O(n+m) using Z-array (length of longest substring starting at i that matches prefix)

The core idea: preprocess the pattern to avoid redundant comparisons. When a mismatch occurs, use preprocessed info to skip ahead instead of restarting from scratch.`,
    keyPatterns: [
      'KMP: Build LPS array, use it to skip ahead on mismatch',
      'Rabin-Karp: Rolling hash comparison, only verify on hash match',
      'Repeated pattern detection: Use LPS - if n % (n - lps[n-1]) == 0, it repeats',
      'Multiple pattern search: Aho-Corasick (trie of patterns + KMP failure links)',
    ],
    template: `# KMP - pattern matching
def kmp_search(text, pattern):
    # Build LPS (Longest Proper Prefix which is also Suffix)
    m = len(pattern)
    lps = [0] * m
    length = 0
    i = 1
    while i < m:
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length > 0:
            length = lps[length - 1]  # key: don't reset, jump back
        else:
            lps[i] = 0
            i += 1

    # Search
    i = j = 0  # i for text, j for pattern
    results = []
    while i < len(text):
        if text[i] == pattern[j]:
            i += 1; j += 1
            if j == m:
                results.append(i - j)
                j = lps[j - 1]
        elif j > 0:
            j = lps[j - 1]  # skip ahead using LPS
        else:
            i += 1
    return results

# Rabin-Karp - rolling hash
def rabin_karp(text, pattern):
    n, m = len(text), len(pattern)
    if m > n: return -1
    base, mod = 26, 10**9 + 7
    power = pow(base, m - 1, mod)

    # Hash the pattern and first window
    p_hash = t_hash = 0
    for i in range(m):
        p_hash = (p_hash * base + ord(pattern[i])) % mod
        t_hash = (t_hash * base + ord(text[i])) % mod

    for i in range(n - m + 1):
        if p_hash == t_hash and text[i:i+m] == pattern:
            return i  # match found
        if i + m < n:
            t_hash = (t_hash - ord(text[i]) * power) % mod
            t_hash = (t_hash * base + ord(text[i + m])) % mod
    return -1`,
    jsTemplate: `// KMP - pattern matching in O(n+m)
// Phase 1: build LPS (Longest Proper Prefix which is also Suffix)
// Phase 2: search text using LPS to skip on mismatches
function kmpSearch(text, pattern) {
    const m = pattern.length;
    const lps = new Array(m).fill(0);

    // Build LPS array
    let len = 0;   // length of current matching prefix-suffix
    let i = 1;     // lps[0] is always 0; start from index 1
    while (i < m) {
        if (pattern[i] === pattern[len]) {
            // Extended the matching prefix-suffix
            len++;
            lps[i] = len;
            i++;
        } else if (len > 0) {
            // Mismatch after some match: fall back without advancing i
            len = lps[len - 1];
        } else {
            // No match at all
            lps[i] = 0;
            i++;
        }
    }

    // Search phase: use lps to skip redundant comparisons
    i = 0;           // pointer into text
    let j = 0;       // pointer into pattern
    const results = [];

    while (i < text.length) {
        if (text[i] === pattern[j]) {
            i++;
            j++;

            if (j === m) {
                // Found a full match at index (i - j)
                results.push(i - j);
                // Use LPS to find the next possible overlap
                j = lps[j - 1];
            }
        } else if (j > 0) {
            // Mismatch: use LPS to skip (keep i in place)
            j = lps[j - 1];
        } else {
            // No partial match: just advance text
            i++;
        }
    }

    return results;
}

// Rabin-Karp - rolling hash for O(n+m) average pattern matching
function rabinKarp(text, pattern) {
    const n = text.length;
    const m = pattern.length;

    if (m > n) {
        return -1;
    }

    const base = 26;
    const mod = 1e9 + 7;

    // Precompute base^(m-1) — used to remove the leftmost character from hash
    let power = 1;
    for (let i = 0; i < m - 1; i++) {
        power = (power * base) % mod;
    }

    // Hash the pattern and the initial text window
    let pHash = 0;
    let tHash = 0;
    for (let i = 0; i < m; i++) {
        pHash = (pHash * base + pattern.charCodeAt(i)) % mod;
        tHash = (tHash * base + text.charCodeAt(i)) % mod;
    }

    for (let i = 0; i <= n - m; i++) {
        if (pHash === tHash && text.slice(i, i + m) === pattern) {
            return i;  // hash matched and string verified
        }

        // Roll the hash: remove leftmost char, add next char
        if (i + m < n) {
            const leftCharHash = (text.charCodeAt(i) * power) % mod;
            tHash = ((tHash - leftCharHash) % mod + mod) % mod;  // +mod prevents negatives
            tHash = (tHash * base + text.charCodeAt(i + m)) % mod;
        }
    }

    return -1;
}`,
    jsTemplateWalkthrough: "── KMP: Build LPS ──\n" +
"Pattern: \"aabaab\"\n" +
"lps[0]=0 always.\n" +
"\n" +
"i=1, len=0: p[1]=a == p[0]=a → len=1, lps[1]=1, i=2\n" +
"i=2, len=1: p[2]=b != p[1]=a → len=lps[0]=0\n" +
"i=2, len=0: p[2]=b != p[0]=a → lps[2]=0, i=3\n" +
"i=3, len=0: p[3]=a == p[0]=a → len=1, lps[3]=1, i=4\n" +
"i=4, len=1: p[4]=a == p[1]=a → len=2, lps[4]=2, i=5\n" +
"i=5, len=2: p[5]=b == p[2]=b → len=3, lps[5]=3, i=6\n" +
"LPS = [0,1,0,1,2,3]\n" +
"\n" +
"── KMP: Search ──\n" +
"text=\"aabaabaab\", pattern=\"aabaab\"\n" +
"\n" +
"i=0..5: all match. j=6==m → found at index 0! j=lps[5]=3\n" +
"i=6, j=3: t[6]=a == p[3]=a → i=7, j=4\n" +
"i=7, j=4: t[7]=a == p[4]=a → i=8, j=5\n" +
"i=8, j=5: t[8]=b == p[5]=b → j=6==m → found at index 3!\n" +
"Results: [0, 3] ✓\n" +
"\n" +
"── Rabin-Karp ──\n" +
"text=\"abcdef\", pattern=\"cde\", base=26, m=3, power=676\n" +
"\n" +
"pHash = hash(\"cde\")\n" +
"tHash[i=0] = hash(\"abc\") ≠ pHash → slide\n" +
"  remove 'a': tHash = (tHash - a*676 + mod) % mod\n" +
"  add 'd':    tHash = tHash*26 + d\n" +
"tHash[i=1] = hash(\"bcd\") ≠ pHash → slide\n" +
"tHash[i=2] = hash(\"cde\") == pHash → verify → return 2 ✓",
    complexity: 'KMP: O(n+m) guaranteed. Rabin-Karp: O(n+m) average, O(nm) worst (hash collisions).',
    commonMistakes: [
      'KMP: Wrong LPS construction (using length = 0 reset instead of length = lps[length-1])',
      'Rabin-Karp: Not handling negative modular arithmetic (add mod before taking mod)',
      'Rabin-Karp: Not verifying on hash match (hash collisions exist)',
      'Off-by-one in the power computation for Rabin-Karp',
    ],
    tips: [
      'KMP is deterministic O(n+m). Rabin-Karp is simpler but has worst-case O(nm).',
      'For single pattern search: KMP. For multiple pattern search: Aho-Corasick.',
      'Rabin-Karp shines for multi-pattern matching (check hash against a set of pattern hashes).',
      'LPS array also solves "repeated substring pattern" and "shortest palindrome".',
    ],
    memorization: `HOW TO MEMORIZE KMP:
KMP has exactly 2 parts: BUILD LPS, then SEARCH. Both have the same structure.

LPS BUILD (the hard part - memorize this):
  lps = [0] * m
  length = 0, i = 1
  while i < m:
      if match: length++, lps[i] = length, i++
      elif length > 0: length = lps[length - 1]  ← THE KEY LINE
      else: lps[i] = 0, i++

The key line says: "I can't extend the current prefix-suffix match, but maybe a shorter one works."

SEARCH:
  i = j = 0
  while i < n:
      if match: i++, j++ (if j == m: found it!)
      elif j > 0: j = lps[j - 1]  ← same key idea
      else: i++

RABIN-KARP is easier to memorize:
  Hash the pattern. Slide a window across text.
  Rolling hash: remove leftmost char, add rightmost char.
  If hashes match, verify with string comparison.

Mnemonic: "KMP = never re-check matched characters. LPS tells you where to jump."`,
  },

  'Minimum Spanning Tree': {
    topic: 'Minimum Spanning Tree',
    overview: `A Minimum Spanning Tree (MST) connects all nodes in a weighted graph with minimum total edge weight, using exactly n-1 edges and no cycles.

Two classic algorithms:
• Kruskal's: Sort edges by weight, greedily add cheapest non-cycle edge (uses Union-Find)
• Prim's: Start from any node, always add cheapest edge to an unvisited node (uses min-heap)

Kruskal's is simpler to code and better for sparse graphs. Prim's is better for dense graphs.`,
    keyPatterns: [
      'Kruskal\'s: Sort edges + Union-Find to avoid cycles',
      'Prim\'s: Min-heap + visited set, BFS-like expansion',
      'MST has exactly n-1 edges for n nodes',
      'If all edge weights are distinct, the MST is unique',
    ],
    template: `# Kruskal's Algorithm
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x
    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py: return False
        if self.rank[px] < self.rank[py]: px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]: self.rank[px] += 1
        return True

def kruskal(n, edges):
    # edges = [(weight, u, v), ...]
    edges.sort()
    uf = UnionFind(n)
    mst_cost = 0
    mst_edges = 0
    for weight, u, v in edges:
        if uf.union(u, v):
            mst_cost += weight
            mst_edges += 1
            if mst_edges == n - 1:
                break
    return mst_cost if mst_edges == n - 1 else -1  # -1 if not connected

# Prim's Algorithm
import heapq
def prim(n, adj):
    # adj[u] = [(weight, v), ...]
    visited = set()
    heap = [(0, 0)]  # (cost, start_node)
    total = 0
    while heap and len(visited) < n:
        cost, u = heapq.heappop(heap)
        if u in visited:
            continue
        visited.add(u)
        total += cost
        for weight, v in adj[u]:
            if v not in visited:
                heapq.heappush(heap, (weight, v))
    return total if len(visited) == n else -1`,
    jsTemplate: `// Kruskal's Algorithm
// Uses Union-Find to detect cycles; greedily picks cheapest edges
class UnionFind {
    constructor(n) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = new Array(n).fill(0);
    }

    find(x) {
        while (this.parent[x] !== x) {
            this.parent[x] = this.parent[this.parent[x]];  // path compression
            x = this.parent[x];
        }
        return x;
    }

    union(x, y) {
        let px = this.find(x);
        let py = this.find(y);

        if (px === py) {
            return false;  // already in the same component — would create a cycle
        }

        // Union by rank: attach shorter tree under taller tree
        if (this.rank[px] < this.rank[py]) {
            const temp = px;
            px = py;
            py = temp;
        }

        this.parent[py] = px;

        if (this.rank[px] === this.rank[py]) {
            this.rank[px]++;
        }

        return true;
    }
}

function kruskal(n, edges) {
    // edges = [[weight, u, v], ...]
    // Step 1: sort all edges by weight (cheapest first)
    edges.sort((a, b) => a[0] - b[0]);

    const uf = new UnionFind(n);
    let mstCost = 0;
    let mstEdges = 0;

    for (const [weight, u, v] of edges) {
        // Add edge only if it doesn't create a cycle
        if (uf.union(u, v)) {
            mstCost += weight;
            mstEdges++;

            // MST has exactly n-1 edges — we're done
            if (mstEdges === n - 1) {
                break;
            }
        }
    }

    // If we couldn't collect n-1 edges, graph is disconnected
    return mstEdges === n - 1 ? mstCost : -1;
}

// Prim's Algorithm (using sorted array as a simple priority queue)
// Grow the MST one node at a time: always pick the cheapest edge to an unvisited node
function prim(n, adj) {
    const visited = new Set();
    // Heap entries: [cost, node]. Start from node 0 with cost 0.
    const heap = [[0, 0]];
    let total = 0;

    while (heap.length > 0 && visited.size < n) {
        // Extract minimum cost edge (sort simulates a min-heap)
        heap.sort((a, b) => a[0] - b[0]);
        const [cost, u] = heap.shift();

        // Skip if this node was already added to the MST
        if (visited.has(u)) {
            continue;
        }

        visited.add(u);
        total += cost;

        // Add all edges from u to unvisited neighbors
        for (const [weight, v] of (adj[u] || [])) {
            if (!visited.has(v)) {
                heap.push([weight, v]);
            }
        }
    }

    // If not all nodes were visited, graph is disconnected
    return visited.size === n ? total : -1;
}`,
    jsTemplateWalkthrough: "── Kruskal's Algorithm ──\n" +
"n=4, edges=[[1,0,1],[2,0,2],[3,1,2],[4,1,3],[5,2,3]]\n" +
"After sort: [[1,0,1],[2,0,2],[3,1,2],[4,1,3],[5,2,3]]\n" +
"\n" +
"[1,0,1]: find(0)=0, find(1)=1 → different → union! mstCost=1, mstEdges=1\n" +
"[2,0,2]: find(0)=0, find(2)=2 → different → union! mstCost=3, mstEdges=2\n" +
"[3,1,2]: find(1)=0, find(2)=0 → SAME → skip (would create cycle)\n" +
"[4,1,3]: find(1)=0, find(3)=3 → different → union! mstCost=7, mstEdges=3\n" +
"mstEdges=3=n-1 → done!\n" +
"Return 7 ✓\n" +
"\n" +
"── Prim's Algorithm ──\n" +
"n=4, adj: 0→[(1,1),(2,2)], 1→[(1,0),(3,2),(4,3)], 2→[(2,0),(3,1),(5,3)], 3→[(4,1),(5,2)]\n" +
"\n" +
"heap=[[0,0]], visited={}\n" +
"Pop [0,0]: add node 0. Push [1,1],[2,2]. total=0\n" +
"  visited={0}, heap=[[1,1],[2,2]]\n" +
"Pop [1,1]: add node 1. Push [3,2],[4,3]. total=1\n" +
"  visited={0,1}, heap=[[2,2],[3,2],[4,3]]\n" +
"Pop [2,2]: add node 2. Push [5,3] (0,1 visited). total=3\n" +
"  visited={0,1,2}, heap=[[3,2],[4,3],[5,3]]\n" +
"Pop [3,2]: node 2 visited → skip\n" +
"Pop [4,3]: add node 3. total=7\n" +
"  visited={0,1,2,3} = n nodes → done!\n" +
"Return 7 ✓",
    complexity: 'Kruskal: O(E log E) for sorting. Prim: O(E log V) with heap.',
    commonMistakes: [
      'Kruskal: Not checking if graph is connected (MST needs n-1 edges)',
      'Prim: Forgetting to skip already-visited nodes popped from heap',
      'Not handling disconnected graphs (return -1 or error)',
      'Generating duplicate edges in undirected graph',
    ],
    tips: [
      'Kruskal = sort edges + Union-Find. Prim = min-heap + visited.',
      'Kruskal is easier to code and think about. Use it by default.',
      'Prim is better when the graph is very dense (E close to V^2).',
      'MST problems often disguise themselves: "minimum cost to connect all X".',
    ],
    memorization: `HOW TO MEMORIZE MST:
KRUSKAL'S (memorize this one, it's simpler):
  1. Sort all edges by weight
  2. For each edge (cheapest first):
     - If union(u, v) succeeds: add edge to MST
     - If union fails: skip (would create cycle)
  3. Stop when you have n-1 edges

Mnemonic: "Sort, Union, Skip cycles, Stop at n-1"

PRIM'S:
  1. Start from any node, add to visited
  2. Push all its edges to min-heap
  3. Pop cheapest edge to unvisited node, add that node
  4. Repeat until all nodes visited

Mnemonic: "Start anywhere, always grab the cheapest bridge to new land"

KRUSKAL vs PRIM:
  Kruskal = global view (sort ALL edges, pick cheapest)
  Prim = local view (grow from one node, pick cheapest neighbor)
  Both give the same MST.

WHEN TO USE: "connect all nodes with minimum cost" = MST.`,
  },

  'Monotonic Stack': {
    topic: 'Monotonic Stack',
    overview: `A monotonic stack maintains elements in sorted (increasing or decreasing) order. When a new element breaks the monotonic property, we pop elements until the property is restored. Each pop reveals a relationship (like "next greater element").

Two types:
• Monotonic decreasing stack: Pop when current > top → finds NEXT GREATER element
• Monotonic increasing stack: Pop when current < top → finds NEXT SMALLER element

Key insight: Every element is pushed and popped at most once → O(n) total.

Classic problems: Next Greater Element, Daily Temperatures, Largest Rectangle in Histogram, Trapping Rain Water.`,
    keyPatterns: [
      'Next greater element: Decreasing stack, pop when current is larger',
      'Next smaller element: Increasing stack, pop when current is smaller',
      'Largest rectangle in histogram: Find left and right boundaries using monotonic stack',
      'Trapping rain water: Track left/right max heights (or use stack for valleys)',
      'Stock span: How many consecutive days with price <= today',
    ],
    template: `# Next Greater Element (for each element, find the next one that is larger)
def next_greater(nums):
    n = len(nums)
    result = [-1] * n
    stack = []  # indices, values decreasing
    for i in range(n):
        while stack and nums[i] > nums[stack[-1]]:
            j = stack.pop()
            result[j] = nums[i]  # nums[i] is the next greater for nums[j]
        stack.append(i)
    return result

# Daily Temperatures (days until warmer day)
def daily_temperatures(temps):
    n = len(temps)
    result = [0] * n
    stack = []  # indices
    for i in range(n):
        while stack and temps[i] > temps[stack[-1]]:
            j = stack.pop()
            result[j] = i - j
        stack.append(i)
    return result

# Largest Rectangle in Histogram
def largest_rectangle(heights):
    stack = []  # indices, heights increasing
    max_area = 0
    heights.append(0)  # sentinel to flush remaining
    for i, h in enumerate(heights):
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            width = i if not stack else i - stack[-1] - 1
            max_area = max(max_area, height * width)
        stack.append(i)
    heights.pop()
    return max_area

# Trapping Rain Water (stack approach)
def trap(height):
    stack = []
    water = 0
    for i, h in enumerate(height):
        while stack and h > height[stack[-1]]:
            bottom = height[stack.pop()]
            if not stack:
                break
            width = i - stack[-1] - 1
            bounded_height = min(h, height[stack[-1]]) - bottom
            water += width * bounded_height
        stack.append(i)
    return water`,
    jsTemplate: `// Next Greater Element
// Decreasing stack: pop when current > top; current is the "next greater" for popped items
function nextGreater(nums) {
    const n = nums.length;
    const result = new Array(n).fill(-1);  // default: no next greater element
    const stack = [];  // stores indices; values in decreasing order

    for (let i = 0; i < n; i++) {
        // Pop all indices whose values are smaller than current
        while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {
            const j = stack.pop();
            result[j] = nums[i];  // nums[i] is the next greater element for index j
        }
        stack.push(i);
    }

    return result;
}

// Daily Temperatures
// Same structure: pop when current temp is warmer; answer is the number of days waited
function dailyTemperatures(temps) {
    const n = temps.length;
    const result = new Array(n).fill(0);  // 0 means no warmer day ahead
    const stack = [];  // stores indices

    for (let i = 0; i < n; i++) {
        while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]]) {
            const j = stack.pop();
            result[j] = i - j;  // days until a warmer temperature
        }
        stack.push(i);
    }

    return result;
}

// Largest Rectangle in Histogram
// For each bar popped: it's the shortest bar in its maximal rectangle.
// Width = distance between new stack top and current i.
function largestRectangleArea(heights) {
    const stack = [];  // stores indices in increasing height order
    let maxArea = 0;

    // Sentinel 0 at end forces all remaining bars to be popped and processed
    heights.push(0);

    for (let i = 0; i < heights.length; i++) {
        while (stack.length > 0 && heights[stack[stack.length - 1]] > heights[i]) {
            const poppedIndex = stack.pop();
            const barHeight = heights[poppedIndex];

            // Left boundary is the new stack top; if empty, extends to the start
            const leftBoundary = stack.length > 0 ? stack[stack.length - 1] : -1;
            const barWidth = i - leftBoundary - 1;

            maxArea = Math.max(maxArea, barHeight * barWidth);
        }
        stack.push(i);
    }

    heights.pop();  // restore original array
    return maxArea;
}

// Trapping Rain Water
// Water collects in valleys between two walls
function trap(height) {
    const stack = [];
    let water = 0;

    for (let i = 0; i < height.length; i++) {
        while (stack.length > 0 && height[i] > height[stack[stack.length - 1]]) {
            const bottomIndex = stack.pop();
            const bottomHeight = height[bottomIndex];

            // Need a left wall; if stack is empty, no container possible
            if (stack.length === 0) {
                break;
            }

            const leftWallIndex = stack[stack.length - 1];
            const width = i - leftWallIndex - 1;
            const boundedHeight = Math.min(height[i], height[leftWallIndex]) - bottomHeight;
            water += width * boundedHeight;
        }
        stack.push(i);
    }

    return water;
}`,
    jsTemplateWalkthrough: "── Next Greater Element ──\n" +
"Input: [2,1,2,4,3]\n" +
"\n" +
"i=0: val=2. stack=[]. push 0. stack=[0]\n" +
"i=1: val=1. 1<nums[0]=2 → stop. push 1. stack=[0,1]\n" +
"i=2: val=2. 2>nums[1]=1 → pop 1, result[1]=2. 2=nums[0]=2 → stop. push 2. stack=[0,2]\n" +
"i=3: val=4. 4>nums[2]=2 → pop 2, result[2]=4. 4>nums[0]=2 → pop 0, result[0]=4. push 3.\n" +
"i=4: val=3. 3<nums[3]=4 → stop. push 4. stack=[3,4]\n" +
"Remaining [3,4] have no next greater → result stays -1\n" +
"Result: [4,2,4,-1,-1] ✓\n" +
"\n" +
"── Largest Rectangle in Histogram ──\n" +
"Input: [2,1,5,6,2,3] + sentinel 0\n" +
"\n" +
"i=0(h=2): push 0. stack=[0]\n" +
"i=1(h=1): 1<2 → pop 0: h=2, left=-1, w=1-(-1)-1=1. area=2. push 1.\n" +
"i=2(h=5): push 2. stack=[1,2]\n" +
"i=3(h=6): push 3. stack=[1,2,3]\n" +
"i=4(h=2): pop 3: h=6, left=2, w=4-2-1=1. area=6. maxArea=6\n" +
"          pop 2: h=5, left=1, w=4-1-1=2. area=10. maxArea=10\n" +
"          2>1 → stop. push 4. stack=[1,4]\n" +
"i=5(h=3): push 5. stack=[1,4,5]\n" +
"i=6(h=0): pop 5: h=3, left=4, w=6-4-1=1. area=3\n" +
"          pop 4: h=2, left=1, w=6-1-1=4. area=8\n" +
"          pop 1: h=1, left=-1, w=6. area=6\n" +
"maxArea=10 ✓",
    complexity: 'O(n) time (each element pushed/popped once). O(n) space for the stack.',
    commonMistakes: [
      'Confusing increasing vs decreasing: next GREATER = decreasing stack, next SMALLER = increasing',
      'Storing values instead of indices (need indices for distance/width calculations)',
      'Largest rectangle: forgetting the sentinel value at the end to flush the stack',
      'Trapping rain water: not checking if stack is empty after popping',
    ],
    tips: [
      '"Next greater element" → monotonic DECREASING stack',
      '"Next smaller element" → monotonic INCREASING stack',
      'Always store INDICES, not values (you can always look up the value)',
      'Largest rectangle in histogram is the hardest monotonic stack problem — master it and the rest are easy',
      'For circular arrays (Next Greater Element II), iterate 2*n with index % n',
    ],
    memorization: `HOW TO MEMORIZE MONOTONIC STACK:
The core loop is always the same:

  for i in range(n):
      while stack and CONDITION(nums[i], nums[stack[-1]]):
          j = stack.pop()
          # j just found its answer: i (or nums[i])
      stack.append(i)

The ONLY thing that changes is the CONDITION:
  Next GREATER: nums[i] > nums[stack[-1]]  (decreasing stack)
  Next SMALLER: nums[i] < nums[stack[-1]]  (increasing stack)

Mnemonic: "Pop the losers, push the current"
  - A "loser" is any element that just found something greater/smaller than itself
  - The current element is the winner that caused the pop

LARGEST RECTANGLE (the king of monotonic stack):
  Think of it as "for each bar, what's the widest rectangle using this bar's height?"
  - Pop when current bar is shorter → popped bar found its right boundary
  - Left boundary = new stack top (or 0 if empty)
  - Width = right - left - 1

  Trick: append 0 at the end to force all remaining bars to pop.

QUICK REFERENCE:
  Next Greater Element → pop when bigger → result[j] = nums[i]
  Daily Temperatures → pop when warmer → result[j] = i - j
  Largest Rectangle → pop when shorter → area = height * width
  Trapping Rain Water → pop when taller → water += width * bounded_height`,
  },

  'Binary Indexed Tree': {
    topic: 'Binary Indexed Tree',
    overview: `A Binary Indexed Tree (BIT), also called Fenwick Tree, is a data structure for efficient prefix sum queries and point updates in O(log n). It's simpler and faster than a Segment Tree for these specific operations.

Key idea: Each index i is responsible for a range of elements determined by its lowest set bit (LSB). The LSB of i = i & (-i).
• Update: Add delta to index i, propagate upward (i += i & (-i))
• Query: Sum from 1 to i, accumulate downward (i -= i & (-i))

Use 1-indexed arrays. Range sum [l, r] = query(r) - query(l-1).`,
    keyPatterns: [
      'Prefix sum + point update: The core BIT use case',
      'Range sum query: query(r) - query(l-1)',
      'Count inversions: Use BIT as a frequency array, query "how many smaller seen so far"',
      'Count of smaller numbers after self: Process right to left, BIT tracks seen values',
    ],
    template: `class BIT:
    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)  # 1-indexed

    def update(self, i, delta):
        """Add delta to index i (1-indexed)"""
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)  # move to parent

    def query(self, i):
        """Sum from index 1 to i (inclusive)"""
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & (-i)  # move to predecessor
        return total

    def range_query(self, l, r):
        """Sum from index l to r (inclusive, 1-indexed)"""
        return self.query(r) - self.query(l - 1)

# Build from array
def build_bit(nums):
    bit = BIT(len(nums))
    for i, val in enumerate(nums):
        bit.update(i + 1, val)  # 1-indexed
    return bit

# Range Sum Query - Mutable
class NumArray:
    def __init__(self, nums):
        self.nums = nums[:]
        self.bit = BIT(len(nums))
        for i, val in enumerate(nums):
            self.bit.update(i + 1, val)

    def update(self, index, val):
        delta = val - self.nums[index]
        self.nums[index] = val
        self.bit.update(index + 1, delta)

    def sumRange(self, left, right):
        return self.bit.range_query(left + 1, right + 1)

# Count inversions using BIT
def count_inversions(nums):
    # Coordinate compress
    sorted_unique = sorted(set(nums))
    rank = {v: i + 1 for i, v in enumerate(sorted_unique)}
    bit = BIT(len(sorted_unique))
    inversions = 0
    for num in reversed(nums):
        inversions += bit.query(rank[num] - 1)  # count smaller seen so far
        bit.update(rank[num], 1)
    return inversions`,
    jsTemplate: `// BIT (Fenwick Tree): efficient prefix sums with O(log n) point update
// Magic: i & (-i) = lowest set bit. Update goes UP (+lsb), query goes DOWN (-lsb)
class BIT {
    constructor(n) {
        this.n = n;
        // MUST be 1-indexed — index 0 is never used
        this.tree = new Array(n + 1).fill(0);
    }
    // Add delta to 1-indexed position i; propagates up using +lsb
    update(i, delta) {
        while (i <= this.n) {
            this.tree[i] += delta;
            i += i & (-i);  // add lowest set bit to reach next responsible node
        }
    }

    // Prefix sum from 1 to i (inclusive); accumulates down using -lsb
    query(i) {
        let total = 0;
        while (i > 0) {
            total += this.tree[i];
            i -= i & (-i);  // remove lowest set bit to reach next contributing node
        }
        return total;
    }

    // Range sum from l to r (both 1-indexed, inclusive)
    rangeQuery(l, r) {
        return this.query(r) - this.query(l - 1);
    }
}

// Range Sum Query - Mutable
// Stores original values to compute delta on update (never store full value directly)
class NumArray {
    constructor(nums) {
        this.nums = [...nums];  // keep a copy for delta computation
        this.bit = new BIT(nums.length);

        for (let i = 0; i < nums.length; i++) {
            this.bit.update(i + 1, nums[i]);  // convert 0-indexed to 1-indexed
        }
    }

    update(index, val) {
        const delta = val - this.nums[index];  // only add the difference
        this.nums[index] = val;
        this.bit.update(index + 1, delta);     // convert to 1-indexed
    }

    sumRange(left, right) {
        return this.bit.rangeQuery(left + 1, right + 1);  // convert to 1-indexed
    }
}

// Count inversions using BIT as a frequency table
// Process right to left: for each element, query how many smaller elements appear to its right
function countInversions(nums) {
    // Coordinate compress values to range [1..k] so BIT stays small
    const sorted = [...new Set(nums)].sort((a, b) => a - b);
    const rank = new Map();
    sorted.forEach((v, i) => rank.set(v, i + 1));

    const bit = new BIT(sorted.length);
    let inversions = 0;

    for (let i = nums.length - 1; i >= 0; i--) {
        const r = rank.get(nums[i]);
        // Count elements already seen (to the right of i) that are smaller than nums[i]
        inversions += bit.query(r - 1);
        // Mark nums[i] as seen
        bit.update(r, 1);
    }

    return inversions;
}`,
    jsTemplateWalkthrough: "── BIT Update ──\n" +
"n=8. update(3, 5) — add 5 at 1-indexed position 3\n" +
"\n" +
"i=3 (011): tree[3]+=5. lsb=0b001=1. i=3+1=4\n" +
"i=4 (100): tree[4]+=5. lsb=0b100=4. i=4+4=8\n" +
"i=8 (1000): tree[8]+=5. i=8+8=16>8 → stop\n" +
"\n" +
"── BIT Query ──\n" +
"query(6): prefix sum from 1 to 6\n" +
"\n" +
"i=6 (110): total+=tree[6]. lsb=0b010=2. i=6-2=4\n" +
"i=4 (100): total+=tree[4]. lsb=0b100=4. i=4-4=0 → stop\n" +
"total = tree[6]+tree[4]\n" +
"  tree[6] covers indices [5,6]\n" +
"  tree[4] covers indices [1,4]\n" +
"  Combined: sum of indices [1,6] ✓\n" +
"\n" +
"── Count Inversions ──\n" +
"Input: [3,1,2] → expected 2 inversions: (3,1) and (3,2)\n" +
"rank: {1→1, 2→2, 3→3}\n" +
"\n" +
"i=2: val=2, r=2. query(1)=0. update(2,1). inv=0\n" +
"i=1: val=1, r=1. query(0)=0. update(1,1). inv=0\n" +
"i=0: val=3, r=3. query(2)=tree[2]+tree[...]=2 (saw 1 and 2). inv=2\n" +
"Return 2 ✓",
    complexity: 'Build: O(n log n). Update: O(log n). Query: O(log n). Space: O(n).',
    commonMistakes: [
      'Using 0-indexed instead of 1-indexed (BIT MUST be 1-indexed)',
      'Wrong direction: update goes UP (i += lsb), query goes DOWN (i -= lsb)',
      'Forgetting to compute delta for update (new_val - old_val, not new_val)',
      'Not coordinate-compressing when values are large or negative',
    ],
    tips: [
      'BIT is simpler than Segment Tree but ONLY supports prefix-type queries (sum, count)',
      'For range min/max queries, you need Segment Tree instead',
      'i & (-i) gives the lowest set bit — this is the magic that makes BIT work',
      'BIT is 1-indexed. Always add 1 when converting from 0-indexed arrays.',
      'For "count of smaller numbers" problems: BIT as a frequency array is the classic technique',
    ],
    memorization: `HOW TO MEMORIZE BIT (Fenwick Tree):
Only 2 functions to memorize. They're mirror images:

UPDATE (propagate UP):
  while i <= n:
      tree[i] += delta
      i += i & (-i)       # add lowest set bit

QUERY (accumulate DOWN):
  while i > 0:
      total += tree[i]
      i -= i & (-i)       # remove lowest set bit

Mnemonic: "Update goes UP (+), Query comes DOWN (-)"

The magic operation: i & (-i) = lowest set bit
  Example: 12 = 1100 → i & (-i) = 0100 = 4
  So index 12 covers 4 elements (indices 9-12)

RANGE SUM: query(r) - query(l-1)  (same as prefix sum idea)

BIT vs SEGMENT TREE:
  BIT: simpler, faster constant, but only prefix sums/counts
  Segment Tree: more complex, but handles range min/max/any operation

WHEN TO USE: "prefix sum + updates" or "count smaller/larger elements"`,
  },

  'Topological Sort': {
    topic: 'Topological Sort',
    overview: `Topological sort orders nodes in a Directed Acyclic Graph (DAG) such that for every edge u → v, u comes before v. It answers: "in what order should I process these items given their dependencies?"

Two algorithms:
• Kahn's (BFS): Start with nodes that have no dependencies (in-degree 0), peel them off layer by layer
• DFS post-order: Run DFS, add node to result AFTER visiting all descendants, then reverse

If the graph has a cycle, topological sort is impossible (detect by checking if all nodes are in the result).`,
    keyPatterns: [
      'Course schedule: Can you finish all courses? (cycle detection via topo sort)',
      'Build order: What order to build packages given dependencies?',
      'Alien dictionary: Derive character ordering from sorted alien words',
      'Longest path in DAG: Process in topological order, relax edges',
    ],
    template: `from collections import deque, defaultdict

# Kahn's Algorithm (BFS-based topological sort)
def topological_sort_kahn(num_nodes, edges):
    graph = defaultdict(list)
    in_degree = [0] * num_nodes
    for u, v in edges:
        graph[u].append(v)
        in_degree[v] += 1

    queue = deque()
    for i in range(num_nodes):
        if in_degree[i] == 0:
            queue.append(i)

    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != num_nodes:
        return []  # cycle detected!
    return order

# Course Schedule (can finish all courses?)
def can_finish(numCourses, prerequisites):
    return len(topological_sort_kahn(numCourses, prerequisites)) == numCourses

# Course Schedule II (return the order)
def find_order(numCourses, prerequisites):
    return topological_sort_kahn(numCourses, prerequisites)

# DFS-based topological sort
def topological_sort_dfs(num_nodes, edges):
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)

    UNVISITED, IN_PROGRESS, DONE = 0, 1, 2
    state = [UNVISITED] * num_nodes
    order = []

    def dfs(node):
        if state[node] == IN_PROGRESS:
            return False  # cycle!
        if state[node] == DONE:
            return True
        state[node] = IN_PROGRESS
        for neighbor in graph[node]:
            if not dfs(neighbor):
                return False
        state[node] = DONE
        order.append(node)
        return True

    for i in range(num_nodes):
        if state[i] == UNVISITED:
            if not dfs(i):
                return []  # cycle
    order.reverse()
    return order`,
    jsTemplate: `// Kahn's Algorithm — BFS-based topological sort
// Key idea: repeatedly remove nodes with no remaining dependencies
function topologicalSortKahn(numNodes, edges) {
    // Build adjacency list and count prerequisites for each node
    const graph = Array.from({ length: numNodes }, () => []);
    const inDegree = new Array(numNodes).fill(0);

    for (const [u, v] of edges) {
        graph[u].push(v);    // u must come before v
        inDegree[v]++;       // v gains one more prerequisite
    }

    // Seed the queue with nodes that have no prerequisites
    const queue = [];
    for (let i = 0; i < numNodes; i++) {
        if (inDegree[i] === 0) {
            queue.push(i);
        }
    }

    const order = [];

    while (queue.length > 0) {
        const node = queue.shift();
        order.push(node);

        for (const neighbor of graph[node]) {
            inDegree[neighbor]--;

            if (inDegree[neighbor] === 0) {
                queue.push(neighbor);
            }
        }
    }

    // Cycle check: if not all nodes processed, a cycle exists
    return order.length === numNodes ? order : [];
}

// Course Schedule: are all courses completable?
function canFinish(numCourses, prerequisites) {
    const order = topologicalSortKahn(numCourses, prerequisites);
    return order.length === numCourses;
}

// DFS-based topological sort
// Post-order: add self AFTER all descendants, then reverse the result
function topologicalSortDFS(numNodes, edges) {
    const graph = Array.from({ length: numNodes }, () => []);

    for (const [u, v] of edges) {
        graph[u].push(v);
    }

    const UNVISITED = 0;
    const IN_PROGRESS = 1;  // on the current DFS path — back edge here = cycle
    const DONE = 2;

    const state = new Array(numNodes).fill(UNVISITED);
    const order = [];

    function dfs(node) {
        if (state[node] === IN_PROGRESS) {
            return false;  // cycle detected (back edge)
        }
        if (state[node] === DONE) {
            return true;   // already fully processed
        }

        state[node] = IN_PROGRESS;

        for (const neighbor of graph[node]) {
            if (!dfs(neighbor)) {
                return false;
            }
        }

        state[node] = DONE;
        order.push(node);  // post-order: add after all children
        return true;
    }

    for (let i = 0; i < numNodes; i++) {
        if (state[i] === UNVISITED) {
            if (!dfs(i)) {
                return [];
            }
        }
    }

    return order.reverse();
}`,
    jsTemplateWalkthrough: "── Kahn's Algorithm ──\n" +
"numNodes=4, edges=[[0,1],[0,2],[1,3],[2,3]]\n" +
"\n" +
"graph: 0→[1,2], 1→[3], 2→[3]\n" +
"inDegree: [0, 1, 1, 2]\n" +
"\n" +
"Initial queue (inDegree=0): [0]\n" +
"\n" +
"Pop 0: order=[0]. dec inDeg[1]→0, inDeg[2]→0. queue=[1,2]\n" +
"Pop 1: order=[0,1]. dec inDeg[3]→1. queue=[2]\n" +
"Pop 2: order=[0,1,2]. dec inDeg[3]→0. queue=[3]\n" +
"Pop 3: order=[0,1,2,3].\n" +
"Return [0,1,2,3] ✓\n" +
"\n" +
"── Cycle Detection ──\n" +
"edges=[[0,1],[1,2],[2,0]] (0→1→2→0)\n" +
"inDegree: [1,1,1] — no node starts at 0!\n" +
"queue: [] empty → order=[] → 0!=3 → return [] (cycle) ✓\n" +
"\n" +
"── DFS Topological Sort ──\n" +
"Graph: 0→[1,2], 1→[3], 2→[3]\n" +
"\n" +
"dfs(0): IN_PROGRESS\n" +
"  dfs(1): IN_PROGRESS\n" +
"    dfs(3): IN_PROGRESS, no children → DONE. order=[3]\n" +
"  (1) DONE. order=[3,1]\n" +
"  dfs(2): IN_PROGRESS\n" +
"    dfs(3): DONE → skip\n" +
"  (2) DONE. order=[3,1,2]\n" +
"(0) DONE. order=[3,1,2,0]\n" +
"Reverse → [0,2,1,3] ✓",
    complexity: 'O(V + E) for both Kahn\'s and DFS approaches.',
    commonMistakes: [
      'Forgetting cycle detection (check if all nodes are in the result)',
      'DFS: not using 3 states (UNVISITED/IN_PROGRESS/DONE) — 2 states miss cycles',
      'DFS: forgetting to reverse the post-order result',
      'Building the graph in wrong direction (u→v means u must come before v)',
    ],
    tips: [
      'Kahn\'s is more intuitive: "remove nodes with no dependencies, repeat"',
      'DFS approach is useful when you also need cycle detection with detailed path',
      '"Course schedule" = topological sort. "Can finish?" = is the graph a DAG?',
      'Alien dictionary: compare adjacent words to extract character ordering edges, then topo sort',
    ],
    memorization: `HOW TO MEMORIZE TOPOLOGICAL SORT:
KAHN'S ALGORITHM (BFS - memorize this one):
  1. Count in-degrees for all nodes
  2. Start queue with all 0-in-degree nodes (no dependencies)
  3. Pop node, add to result
  4. For each neighbor: decrement in-degree, if 0 → add to queue
  5. If result.length != num_nodes → CYCLE exists

Mnemonic: "Peel the onion layer by layer"
  - Each layer = nodes with no remaining dependencies
  - Peel = remove from graph (decrement neighbors' in-degrees)
  - If onion has no more layers but nodes remain = cycle

DFS APPROACH:
  - 3 states: UNVISITED, IN_PROGRESS, DONE
  - IN_PROGRESS → IN_PROGRESS = CYCLE (back edge)
  - Add to result in POST-ORDER (after all children), then REVERSE

Mnemonic: "Visit all children first, then add yourself. Reverse at the end."

WHEN TO USE:
  - "Order of operations with dependencies" → topo sort
  - "Can all tasks be completed?" → is it a DAG? (topo sort, check length)
  - "Alien/custom ordering" → extract edges from constraints, topo sort`,
  },

  'Concurrency': {
    topic: 'Concurrency',
    overview: `Concurrency problems test your understanding of thread synchronization - making multiple threads cooperate safely. The core challenge: threads run in unpredictable order (the OS schedules them), so you need primitives to enforce ordering, mutual exclusion, and coordination.

CORE PRIMITIVES (memorize these 5):
1. Lock (Mutex) - Only one thread can hold it. Use for protecting shared data.
2. Semaphore(n) - Allows up to n threads to pass. Like a bouncer allowing n people in.
3. Event/Condition - One thread signals, others wait. Like a starting gun.
4. Barrier(n) - Blocks until n threads arrive, then releases all. Like "ready, set, go!"
5. Queue - Thread-safe FIFO. The backbone of producer-consumer patterns.

THE 4 KEY PATTERNS:
1. Sequential ordering: Use Events to chain thread execution (A -> B -> C)
2. Alternating/turn-taking: Use paired Semaphores as ping-pong signals
3. Producer-Consumer: Use Semaphores for capacity + Lock for data protection
4. Resource allocation: Use Semaphores to limit concurrency + Locks for resources

DEADLOCK - THE ENEMY:
Deadlock requires ALL 4 conditions (break any one to prevent it):
1. Mutual exclusion - resource held exclusively
2. Hold and wait - hold one resource while waiting for another
3. No preemption - can't forcibly take a resource
4. Circular wait - A waits for B, B waits for A

MEMORIZATION TECHNIQUE - "The Semaphore Mental Model":
Think of a Semaphore(n) as a jar with n tokens:
- acquire() = take a token out (blocks if jar is empty)
- release() = put a token back in
- Semaphore(0) = starts empty = "wait for a signal"
- Semaphore(1) = acts like a Lock/Mutex
- Semaphore(n) = allows n concurrent threads`,
    keyPatterns: [
      'Sequential ordering: Event chain - each step sets the next Event (Print in Order)',
      'Alternating execution: Two Semaphores as ping-pong - release the other after your turn (FooBar)',
      'Producer-Consumer: Semaphore(capacity) for empty slots + Semaphore(0) for full slots + Lock (Blocking Queue)',
      'Resource grouping: Semaphore for ratio + Barrier for grouping (H2O)',
      'Deadlock prevention: Limit concurrency with Semaphore(n-1) to break circular wait (Dining Philosophers)',
      'Dispatcher pattern: One master thread decides who acts next via targeted semaphore release (FizzBuzz)',
      'Print in Order (#1114): Two promise gates (firstDone, secondDone) chain execution order',
      'FooBar (#1115): Single boolean flag + spin-wait alternates two async loops',
      'H2O (#1117): Queue both atoms; tryFormWater flushes when 2H + 1O are ready',
      'Dining Philosophers (#1226): Cap seated count at n-1 to prevent circular-wait deadlock',
    ],
    template: `# ============================================================
# TEMPLATE 1: Sequential Ordering (Print in Order pattern)
# Mnemonic: "Chain of Events" - each step lights the next fuse
# ============================================================
import threading

class Sequential:
    def __init__(self):
        self.event1 = threading.Event()  # gate between step 1 and 2
        self.event2 = threading.Event()  # gate between step 2 and 3

    def step1(self, action):
        action()              # do work
        self.event1.set()     # open gate for step 2

    def step2(self, action):
        self.event1.wait()    # wait for step 1
        action()              # do work
        self.event2.set()     # open gate for step 3

    def step3(self, action):
        self.event2.wait()    # wait for step 2
        action()

# ============================================================
# TEMPLATE 2: Alternating / Turn-taking (FooBar pattern)
# Mnemonic: "Ping-Pong Semaphores" - pass the ball back and forth
# ============================================================
class Alternating:
    def __init__(self, n):
        self.n = n
        self.sem_a = threading.Semaphore(1)  # A goes first
        self.sem_b = threading.Semaphore(0)  # B waits

    def thread_a(self, action):
        for _ in range(self.n):
            self.sem_a.acquire()   # wait for my turn
            action()               # do work
            self.sem_b.release()   # signal B's turn

    def thread_b(self, action):
        for _ in range(self.n):
            self.sem_b.acquire()   # wait for my turn
            action()               # do work
            self.sem_a.release()   # signal A's turn

# ============================================================
# TEMPLATE 3: Producer-Consumer (Bounded Blocking Queue)
# Mnemonic: "Two Jars" - empty_slots jar + full_slots jar
# ============================================================
from collections import deque

class ProducerConsumer:
    def __init__(self, capacity):
        self.queue = deque()
        self.lock = threading.Lock()
        self.empty = threading.Semaphore(capacity)  # counts empty slots
        self.full = threading.Semaphore(0)           # counts items

    def produce(self, item):
        self.empty.acquire()     # wait for empty slot
        with self.lock:
            self.queue.append(item)
        self.full.release()      # signal: item available

    def consume(self):
        self.full.acquire()      # wait for item
        with self.lock:
            item = self.queue.popleft()
        self.empty.release()     # signal: slot freed
        return item

# ============================================================
# TEMPLATE 4: Deadlock Prevention (Dining Philosophers)
# Mnemonic: "One Less Chair" - limit diners to n-1
# ============================================================
class DeadlockFree:
    def __init__(self, n_resources):
        self.resources = [threading.Lock() for _ in range(n_resources)]
        self.limit = threading.Semaphore(n_resources - 1)  # one less!

    def use_resources(self, left, right, action):
        self.limit.acquire()
        self.resources[left].acquire()
        self.resources[right].acquire()
        action()
        self.resources[right].release()
        self.resources[left].release()
        self.limit.release()

# ============================================================
# TEMPLATE 5: Barrier Grouping (H2O pattern)
# Mnemonic: "Bouncer + Barrier" - control ratio then group
# ============================================================
class GroupBarrier:
    def __init__(self):
        self.sem_type_a = threading.Semaphore(2)  # allow 2 of type A
        self.sem_type_b = threading.Semaphore(1)  # allow 1 of type B
        self.barrier = threading.Barrier(3)        # group of 3

    def type_a(self, action):
        self.sem_type_a.acquire()
        self.barrier.wait()      # wait for full group
        action()
        self.sem_type_a.release()

    def type_b(self, action):
        self.sem_type_b.acquire()
        self.barrier.wait()      # wait for full group
        action()
        self.sem_type_b.release()`,
    jsTemplate: `// JavaScript concurrency uses Promises and async/await.
// In interviews, these patterns map to Python's threading primitives.
// The key concepts are the same: ordering, mutual exclusion, coordination.

// ============================================================
// TEMPLATE 1: Sequential Ordering (Promise chain)
// Equivalent to Python's threading.Event chain
// ============================================================
class Sequential {
    constructor() {
        // Create two "gates": each is a Promise whose resolve function is stored
        this.p1 = new Promise(resolve => {
            this.r1 = resolve;  // calling r1() opens the gate for step2
        });
        this.p2 = new Promise(resolve => {
            this.r2 = resolve;  // calling r2() opens the gate for step3
        });
    }

    // step1 runs freely; it opens the gate for step2 when done
    step1(action) {
        action();
        this.r1();  // signal: step1 is done
    }

    // step2 waits for step1 to finish before running
    async step2(action) {
        await this.p1;  // block until r1() is called
        action();
        this.r2();      // signal: step2 is done
    }

    // step3 waits for step2 to finish before running
    async step3(action) {
        await this.p2;  // block until r2() is called
        action();
    }
}

// ============================================================
// TEMPLATE 2: Alternating execution (ping-pong)
// Equivalent to Python's two-semaphore pattern
// ============================================================
class Alternating {
    constructor(n) {
        this.n = n;
        this.turn = 'a';  // tracks whose turn it is
    }

    async threadA(action) {
        for (let i = 0; i < this.n; i++) {
            // Spin-wait until it's A's turn (yields control each iteration)
            while (this.turn !== 'a') {
                await new Promise(r => setTimeout(r, 0));
            }
            action();
            this.turn = 'b';  // pass the turn to B
        }
    }

    async threadB(action) {
        for (let i = 0; i < this.n; i++) {
            while (this.turn !== 'b') {
                await new Promise(r => setTimeout(r, 0));
            }
            action();
            this.turn = 'a';  // pass the turn back to A
        }
    }
}

// ============================================================
// TEMPLATE 3: Producer-Consumer (bounded async queue)
// Equivalent to Python's two-semaphore + lock pattern
// ============================================================
class AsyncQueue {
    constructor(capacity) {
        this.capacity = capacity;
        this.queue = [];
        // Waiting lists act as semaphore queues
        this.waitingProducers = [];
        this.waitingConsumers = [];
    }

    async enqueue(item) {
        // Block if queue is full (like semaphore.empty_slots.acquire())
        while (this.queue.length >= this.capacity) {
            await new Promise(resolve => this.waitingProducers.push(resolve));
        }

        this.queue.push(item);

        // Wake up a waiting consumer if any
        if (this.waitingConsumers.length > 0) {
            this.waitingConsumers.shift()();
        }
    }

    async dequeue() {
        // Block if queue is empty (like semaphore.full_slots.acquire())
        while (this.queue.length === 0) {
            await new Promise(resolve => this.waitingConsumers.push(resolve));
        }

        const item = this.queue.shift();

        // Wake up a waiting producer if any
        if (this.waitingProducers.length > 0) {
            this.waitingProducers.shift()();
        }

        return item;
    }
}

// ============================================================
// TEMPLATE 4: Web Workers (true parallelism in JS)
// ============================================================
// Main thread:
//   const worker = new Worker('worker.js');
//   worker.postMessage({ task: 'compute', data: [1, 2, 3] });
//   worker.onmessage = (e) => {
//       console.log('Result:', e.data.result);
//   };
//
// worker.js (runs in separate thread):
//   self.onmessage = (e) => {
//       const result = heavyComputation(e.data);
//       self.postMessage({ result });
//   };

// Print in Order (#1114)
// Two promise gates enforce first → second → third
class PrintInOrder {
    constructor() {
        this.firstDone = new Promise(resolve => { this.resolveFirst = resolve; });
        this.secondDone = new Promise(resolve => { this.resolveSecond = resolve; });
    }
    first(printFirst) {
        printFirst();
        this.resolveFirst();
    }
    async second(printSecond) {
        await this.firstDone;
        printSecond();
        this.resolveSecond();
    }
    async third(printThird) {
        await this.secondDone;
        printThird();
    }
}

// FooBar Alternately (#1115)
// Two flags alternate who runs next
class FooBar {
    constructor(n) {
        this.n = n;
        this.fooTurn = true;
    }
    async foo(printFoo) {
        for (let i = 0; i < this.n; i++) {
            while (!this.fooTurn) {
                await new Promise(r => setTimeout(r, 0));
            }
            printFoo();
            this.fooTurn = false;
        }
    }
    async bar(printBar) {
        for (let i = 0; i < this.n; i++) {
            while (this.fooTurn) {
                await new Promise(r => setTimeout(r, 0));
            }
            printBar();
            this.fooTurn = true;
        }
    }
}

// Building H2O (#1117)
// Queue hydrogen and oxygen; flush when 2H + 1O available
class H2O {
    constructor() {
        this.hydrogenQueue = [];
        this.oxygenQueue = [];
    }
    hydrogen(releaseHydrogen) {
        this.hydrogenQueue.push(releaseHydrogen);
        this.tryFormWater();
    }
    oxygen(releaseOxygen) {
        this.oxygenQueue.push(releaseOxygen);
        this.tryFormWater();
    }
    tryFormWater() {
        while (this.hydrogenQueue.length >= 2 && this.oxygenQueue.length >= 1) {
            this.hydrogenQueue.shift()();
            this.hydrogenQueue.shift()();
            this.oxygenQueue.shift()();
        }
    }
}

// Dining Philosophers (#1226)
// Limit concurrency to 4 to prevent deadlock with 5 forks
class DiningPhilosophers {
    constructor() {
        this.forks = Array.from({ length: 5 }, () => ({ locked: false, waiters: [] }));
        this.seats = 4;
        this.seatedCount = 0;
        this.seatWaiters = [];
    }
    async acquireFork(index) {
        while (this.forks[index].locked) {
            await new Promise(r => this.forks[index].waiters.push(r));
        }
        this.forks[index].locked = true;
    }
    releaseFork(index) {
        this.forks[index].locked = false;
        if (this.forks[index].waiters.length > 0) {
            this.forks[index].waiters.shift()();
        }
    }
    async wantsToEat(philosopher, pickLeftFork, pickRightFork, eat, putLeftFork, putRightFork) {
        // Limit to 4 seated to prevent deadlock
        while (this.seatedCount >= this.seats) {
            await new Promise(r => this.seatWaiters.push(r));
        }
        this.seatedCount++;

        const left = philosopher;
        const right = (philosopher + 1) % 5;

        await this.acquireFork(left);
        pickLeftFork();
        await this.acquireFork(right);
        pickRightFork();

        eat();

        putLeftFork();
        this.releaseFork(left);
        putRightFork();
        this.releaseFork(right);

        this.seatedCount--;
        if (this.seatWaiters.length > 0) {
            this.seatWaiters.shift()();
        }
    }
}`,
    jsTemplateWalkthrough: "── Sequential Ordering ──\n" +
"Pattern: step1 → step2 → step3, regardless of which thread runs first\n" +
"\n" +
"Threads start in arbitrary order. Say thread3 runs first:\n" +
"  thread3 calls step3() → awaits p2 → BLOCKED (r2 not called yet)\n" +
"  thread2 calls step2() → awaits p1 → BLOCKED (r1 not called yet)\n" +
"  thread1 calls step1() → runs action(), calls r1() → unblocks p1!\n" +
"  thread2 resumes → runs action(), calls r2() → unblocks p2!\n" +
"  thread3 resumes → runs action()\n" +
"Output always in order: step1, step2, step3 ✓\n" +
"\n" +
"── Alternating (n=2) ──\n" +
"threadA and threadB alternate: A, B, A, B\n" +
"\n" +
"Initial: turn='a'\n" +
"threadA i=0: turn='a' → action(). turn='b'\n" +
"threadB i=0: turn='b' → action(). turn='a'\n" +
"threadA i=1: turn='a' → action(). turn='b'\n" +
"threadB i=1: turn='b' → action(). turn='a'\n" +
"\n" +
"If threadB tries to run while turn='a': spin-waits (yields with setTimeout(0))\n" +
"\n" +
"── Producer-Consumer ──\n" +
"capacity=2. Producer enqueues 3 items, consumer dequeues them.\n" +
"\n" +
"enqueue('a'): queue=['a']. no consumers waiting.\n" +
"enqueue('b'): queue=['a','b']. no consumers waiting.\n" +
"enqueue('c'): queue.length=2 >= capacity=2 → BLOCK (push resolve to waitingProducers)\n" +
"\n" +
"dequeue(): queue=['a','b'] → item='a', queue=['b'].\n" +
"  waitingProducers.length=1 → wake producer!\n" +
"Producer resumes: queue=['b','c']. no consumers.\n" +
"\n" +
"dequeue(): item='b', queue=['c'].\n" +
"dequeue(): item='c', queue=[].\n" +
"\n" +
"Key insight: waitingProducers/waitingConsumers act as semaphore queues\n" +
"  empty_slots semaphore = capacity - queue.length\n" +
"  full_slots semaphore = queue.length\n\n" +
      '── Print in Order (#1114) ──\n' +
      'Three threads call first(), second(), third() in random order.\n\n' +
      'Promises act as one-time gates (like threading.Event):\n' +
      '  firstDone starts unresolved (gate closed)\n' +
      '  secondDone starts unresolved (gate closed)\n\n' +
      'If thread3 runs first:\n' +
      '  third() → await secondDone → BLOCKED\n' +
      'If thread2 runs next:\n' +
      '  second() → await firstDone → BLOCKED\n' +
      'Thread1 runs:\n' +
      '  first(): printFirst(), resolveFirst() → unblocks second()\n' +
      '  second(): printSecond(), resolveSecond() → unblocks third()\n' +
      '  third(): printThird()\n' +
      'Output always: first, second, third ✓\n\n' +
      '── FooBar Alternately (#1115) ──\n' +
      'n=2, fooTurn=true. Two async threads run concurrently.\n\n' +
      'foo iteration 0: fooTurn=true → printFoo(), fooTurn=false\n' +
      'bar iteration 0: fooTurn=false → printBar(), fooTurn=true\n' +
      'foo iteration 1: fooTurn=true → printFoo(), fooTurn=false\n' +
      'bar iteration 1: fooTurn=false → printBar(), fooTurn=true\n' +
      'Output: foobarfoobar ✓\n\n' +
      'If bar checks while fooTurn=true:\n' +
      '  await new Promise(r => setTimeout(r, 0)) → yield to event loop\n' +
      '  re-check on next tick → eventually fooTurn=false\n\n' +
      '── Building H2O (#1117) ──\n' +
      'Calls arrive: H, H, O, H, H, O\n\n' +
      'hydrogen("H1"): hydrogenQueue=[H1], tryFormWater: H<2 → wait\n' +
      'hydrogen("H2"): hydrogenQueue=[H1,H2], tryFormWater: H>=2,O<1 → wait\n' +
      'oxygen("O1"):   oxygenQueue=[O1], tryFormWater:\n' +
      '  H>=2 && O>=1 → H1(), H2(), O1() → queues empty → water formed!\n' +
      'hydrogen("H3"): hydrogenQueue=[H3]\n' +
      'hydrogen("H4"): hydrogenQueue=[H3,H4]\n' +
      'oxygen("O2"):   tryFormWater → H3(), H4(), O2() ✓\n\n' +
      '── Dining Philosophers (#1226) ──\n' +
      '5 philosophers, 5 forks. Without limit: all grab left fork → deadlock.\n\n' +
      'Solution: allow at most 4 seated simultaneously.\n' +
      'Philosopher 0: seatedCount=1<=4, acquire fork0, acquire fork1, eat,\n' +
      '               release fork1, release fork0, seatedCount=0\n\n' +
      'Deadlock prevention: with only 4 seated, at least one philosopher\n' +
      'can always pick up BOTH forks (circular wait is broken) ✓',
    complexity: 'Concurrency primitives are O(1) for acquire/release. Total work is O(n) where n is the number of operations. The key cost is blocking/waiting time, not CPU time.',
    commonMistakes: [
      'Deadlock: acquiring locks in inconsistent order across threads',
      'Forgetting to release a lock/semaphore in error paths (use "with" statement)',
      'Using Semaphore(1) when you actually need a Lock (Lock is re-entrant aware)',
      'Race condition: reading shared state without holding a lock',
      'Starvation: one thread always wins the lock while others wait forever',
      'Not signaling termination: worker threads loop forever after main is done',
    ],
    tips: [
      'MEMORIZE THIS: Semaphore(0) = "wait for signal", Semaphore(1) = "mutex", Semaphore(n) = "allow n threads"',
      'For ordering problems, draw the dependency graph first, then add one Event per edge',
      'For alternating patterns, always use TWO semaphores with initial values (1, 0)',
      'For deadlock prevention, the simplest fix is Semaphore(n-1) to break circular wait',
      'Producer-Consumer = two semaphores counting opposite things (empty + full = capacity)',
      'When in doubt, use a Lock to protect shared data and Semaphores to coordinate timing',
      'Python tip: "with lock:" is safer than lock.acquire()/release() because it handles exceptions',
    ],
    memorization: `HOW TO MEMORIZE CONCURRENCY:
Think of concurrency primitives as PHYSICAL OBJECTS:

  Lock/Mutex = A bathroom door lock. Only one person at a time.
  Semaphore(n) = A parking lot with n spots. Full? Wait in line.
  Event = A starting pistol. Everyone waits, one person fires.
  Barrier(n) = A restaurant that only seats groups of n.
  Condition = A waiting room with an announcement speaker.

THE 5 TEMPLATES MAP TO 5 REAL-WORLD SCENARIOS:
  1. Sequential (Events): Relay race - pass the baton
  2. Alternating (2 Semaphores): Tennis - your turn, my turn
  3. Producer-Consumer (2 Semaphores + Lock): Assembly line with limited conveyor belt
  4. Deadlock prevention (Semaphore(n-1)): Musical chairs - fewer chairs than people guarantees someone always sits
  5. Grouping (Semaphore + Barrier): Elevator - waits for exact capacity

SEMAPHORE CHEAT SHEET:
  Semaphore(0)  →  gate starts CLOSED  →  "wait for a signal"
  Semaphore(1)  →  gate starts OPEN    →  acts like a Lock/Mutex
  Semaphore(n)  →  allows n through    →  rate limiter

DEADLOCK PREVENTION (memorize the 4 conditions, break ANY one):
  1. Mutual exclusion    → can't usually avoid
  2. Hold and wait       → request all resources at once
  3. No preemption       → allow timeouts / try-lock
  4. Circular wait       → order resources OR limit concurrency (Semaphore(n-1))

Mnemonic: "MHNC" - Mutual exclusion, Hold-and-wait, No preemption, Circular wait`,
  },
};

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
  jsTemplateReadable?: string; // Readable version using iteration helpers
  verification?: string; // Verify-your-understanding exercises for each template
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
    const sumFrequency = new Map();
    sumFrequency.set(0, 1);  // empty prefix has sum 0

    let runningSumSoFar = 0;
    let count = 0;

    for (const num of nums) {
        runningSumSoFar = runningSumSoFar + num;

        // How many earlier prefix sums equal (runningSumSoFar - k)?
        const neededPrefixSum = runningSumSoFar - k;
        const matchCount = sumFrequency.get(neededPrefixSum) || 0;
        count = count + matchCount;

        // Record this prefix sum
        const currentFreq = sumFrequency.get(runningSumSoFar) || 0;
        sumFrequency.set(runningSumSoFar, currentFreq + 1);
    }
    return count;
}

// Prefix/Suffix Products (Product of Array Except Self)
function productExceptSelf(nums) {
    const n = nums.length;
    const result = new Array(n).fill(1);

    // Build prefix products (left to right)
    let productOfAllToMyLeft = 1;
    for (let i = 0; i < n; i++) {
        result[i] = productOfAllToMyLeft;
        productOfAllToMyLeft = productOfAllToMyLeft * nums[i];
    }

    // Multiply by suffix products (right to left)
    let productOfAllToMyRight = 1;
    for (let i = n - 1; i >= 0; i--) {
        result[i] = result[i] * productOfAllToMyRight;
        productOfAllToMyRight = productOfAllToMyRight * nums[i];
    }

    return result;
}`,
    jsTemplateReadable: `// ── Iteration Helpers (used across all templates) ──

function forEach(arr, callback) {
    for (let i = 0; i < arr.length; i++) callback(arr[i], i);
}

function forEachFromRight(arr, callback) {
    for (let i = arr.length - 1; i >= 0; i--) callback(arr[i], i);
}

function forEachStartingAt(startIndex, arr, callback) {
    for (let i = startIndex; i < arr.length; i++) callback(arr[i], i);
}

function forEachBetween(start, endExclusive, callback) {
    for (let i = start; i < endExclusive; i++) callback(i);
}

function advancePast(arr, index, shouldSkip) {
    while (index < arr.length && shouldSkip(arr[index], index)) {
        index = index + 1;
    }
    return index;
}

function advancePastFromRight(arr, index, shouldSkip) {
    while (index >= 0 && shouldSkip(arr[index], index)) {
        index = index - 1;
    }
    return index;
}

function repeatWhile(condition, action) {
    while (condition()) action();
}

// Two Sum pattern - complement lookup
function twoSum(nums, target) {
    const seen = new Map(); // value -> index
    let result = null;

    forEach(nums, (currentNum, i) => {
        if (result) return; // already found
        const complement = target - currentNum;

        // Check if the partner number was already seen
        if (seen.has(complement)) {
            const partnerIndex = seen.get(complement);
            result = [partnerIndex, i];
            return;
        }

        // Remember this number and its index
        seen.set(currentNum, i);
    });
    return result;
}

// Frequency count pattern (bucket sort)
function topKFrequent(nums, k) {
    // Step 1: Count how often each number appears
    const count = new Map();
    forEach(nums, (num) => {
        const current = count.get(num) || 0;
        count.set(num, current + 1);
    });

    // Step 2: Create buckets where index = frequency
    const buckets = Array.from({ length: nums.length + 1 }, () => []);
    for (const [num, freq] of count) {
        buckets[freq].push(num);
    }

    // Step 3: Walk backwards from highest frequency
    const result = [];
    forEachFromRight(buckets, (bucket, freq) => {
        if (freq === 0) return;
        if (result.length >= k) return; // already collected enough
        forEach(bucket, (num) => {
            if (result.length >= k) return; // already collected enough
            result.push(num);
        });
    });
    return result;
}

// Prefix sum pattern
function subarraySum(nums, k) {
    // Map: prefix sum -> how many times we've seen it
    const sumFrequency = new Map();
    sumFrequency.set(0, 1);  // empty prefix has sum 0

    let runningSumSoFar = 0;
    let count = 0;

    forEach(nums, (num) => {
        runningSumSoFar = runningSumSoFar + num;

        // How many earlier prefix sums equal (runningSumSoFar - k)?
        const neededPrefixSum = runningSumSoFar - k;
        const matchCount = sumFrequency.get(neededPrefixSum) || 0;
        count = count + matchCount;

        // Record this prefix sum
        const currentFreq = sumFrequency.get(runningSumSoFar) || 0;
        sumFrequency.set(runningSumSoFar, currentFreq + 1);
    });
    return count;
}

// Prefix/Suffix Products (Product of Array Except Self)
function productExceptSelf(nums) {
    const n = nums.length;
    const result = new Array(n).fill(1);

    // Build prefix products (left to right)
    let productOfAllToMyLeft = 1;
    forEachBetween(0, n, (i) => {
        result[i] = productOfAllToMyLeft;
        productOfAllToMyLeft = productOfAllToMyLeft * nums[i];
    });

    // Multiply by suffix products (right to left)
    let productOfAllToMyRight = 1;
    forEachFromRight(nums, (_, i) => {
        result[i] = result[i] * productOfAllToMyRight;
        productOfAllToMyRight = productOfAllToMyRight * nums[i];
    });

    return result;
}`,
    verification: `twoSum:
  Promise: "seen contains every number we have visited so far, mapped to its index"
  Init: before the loop, seen is empty — trivially true ✓
  Maintain:
    What changes? We check for the complement, then add the current number to seen.
    Could it break the promise? No — we only ever add, never remove.
    Flip test: what would break it? Adding the current number BEFORE checking the complement.
      Does the code prevent it? Yes — the check happens first, then we store. ✓
  Terminate: every element is stored in seen; if any complement pair exists it was found ✓

topKFrequent:
  Promise: "count maps each number to its exact frequency; buckets[f] holds all numbers with frequency f"
  Init: count is empty, buckets is all-empty arrays — trivially true ✓
  Maintain:
    What changes? We increment count for each num, then place each num into its frequency bucket.
    Could it break the promise? No — each pass is a full sweep of count entries.
    Flip test: what would break it? Placing into the wrong bucket index.
      Does the code prevent it? Yes — we use the value from count directly as the bucket index. ✓
  Terminate: walking buckets from high to low, we collect the k numbers with the highest frequencies ✓

subarraySum:
  Promise: "sumFrequency[s] = number of indices j <= i where prefix sum equals s"
  Init: sumFrequency = {0: 1} — the empty prefix has sum 0, one occurrence ✓
  Maintain:
    What changes? We add the current num to runningSumSoFar, look up neededPrefixSum, then store runningSumSoFar.
    Could it break the promise? No — we record the current prefix sum after counting, keeping counts accurate for future iterations.
    Flip test: what would break it? Recording runningSumSoFar BEFORE the lookup.
      Does the code prevent it? Yes — lookup happens first, then we store. ✓
  Terminate: every prefix sum is counted; count holds the number of (i, j) pairs where prefix[j] - prefix[i] = k ✓

productExceptSelf:
  Promise after left pass: "result[i] = product of all elements strictly to the left of i"
  Promise after right pass: "result[i] = product of all elements except nums[i]"
  Init (left pass): productOfAllToMyLeft = 1 — nothing is to the left of index 0 ✓
  Maintain (left pass):
    What changes? result[i] is set to the running left product, then left product is multiplied by nums[i].
    Could it break the promise? No — we record before updating the running product.
    Flip test: what would break it? Multiplying first, then storing.
      Does the code prevent it? Yes — store then multiply. ✓
  Init (right pass): productOfAllToMyRight = 1 — nothing is to the right of the last index ✓
  Maintain (right pass):
    What changes? result[i] is multiplied by the running right product (completing the answer), then right product is multiplied by nums[i].
    Flip test: multiplying right product by nums[i] before updating result[i].
      Does the code prevent it? Yes — result[i] updated first, then running product advances. ✓
  Terminate: each result[i] = (left product) x (right product) = product of all others ✓`,
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
      'sumFrequency = {0: 1}\n\n' +
      'num=1: runningSumSoFar=1, neededPrefixSum=1-2=-1\n' +
      '       sumFrequency has -1? No → matchCount=0\n' +
      '       count=0, sumFrequency={0:1, 1:1}\n\n' +
      'num=1: runningSumSoFar=2, neededPrefixSum=2-2=0\n' +
      '       sumFrequency has 0? Yes (1 time) → matchCount=1\n' +
      '       count=1, sumFrequency={0:1, 1:1, 2:1}\n\n' +
      'num=1: runningSumSoFar=3, neededPrefixSum=3-2=1\n' +
      '       sumFrequency has 1? Yes (1 time) → matchCount=1\n' +
      '       count=2, sumFrequency={0:1, 1:1, 2:1, 3:1}\n\n' +
      'return 2  (subarrays [1,1] at idx 0-1 and idx 1-2)\n\n' +
      '── Prefix/Suffix Products ──\n' +
      'nums = [1, 2, 3, 4]\n\n' +
      'Prefix pass (left to right):\n' +
      '  i=0: result[0]=1, productOfAllToMyLeft=1*1=1\n' +
      '  i=1: result[1]=1, productOfAllToMyLeft=1*2=2\n' +
      '  i=2: result[2]=2, productOfAllToMyLeft=2*3=6\n' +
      '  i=3: result[3]=6, productOfAllToMyLeft=6*4=24\n' +
      'result after prefix: [1, 1, 2, 6]\n\n' +
      'Suffix pass (right to left):\n' +
      '  i=3: result[3]=6*1=6,  productOfAllToMyRight=1*4=4\n' +
      '  i=2: result[2]=2*4=8,  productOfAllToMyRight=4*3=12\n' +
      '  i=1: result[1]=1*12=12, productOfAllToMyRight=12*2=24\n' +
      '  i=0: result[0]=1*24=24, productOfAllToMyRight=24*1=24\n\n' +
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

VISUAL ANCHOR: Picture a dictionary/phonebook. Instead of scanning every entry (O(n^2)), you flip directly to the right page (O(1) lookup). That's what hash maps do.

PREFIX/SUFFIX PRODUCTS (Product of Array Except Self):
  Two passes: left-to-right builds prefix, right-to-left multiplies suffix.
  result[i] = (product of everything left of i) × (product of everything right of i)
  Mnemonic: "Sweep left, sweep right, multiply"
  Key trick: No division needed! Two O(n) passes = O(n) total.

TEMPLATE-BY-TEMPLATE MEMORIZATION:

twoSum — O(n) time, O(n) space
  Problem: Given an array of integers and a target, return the indices of the two numbers that add up to the target.
  Use when: "two sum", "pair that adds to target", "complement lookup"
  Example:
    nums = [2, 7, 11, 15], target = 9
    i=0: need 9-2=7, seen={}       -> not found, store {2:0}
    i=1: need 9-7=2, seen={2:0}    -> found! return [0, 1]
    "For each number, check if its partner (target - num) was already seen."
  Steps:
    1. Create Map: seen (number -> index)
    2. For each num: complement = target - num
    3. seen.has(complement)? -> return [seen.get(complement), i]
    4. Otherwise: seen.set(num, i)
  Mnemonic: "Seen the partner? Return. Haven't? Remember yourself."

topKFrequent — O(n) time, O(n) space
  Problem: Given an array of integers and a number k, return the k most frequently occurring elements.
  Use when: "top k frequent", "k most common", "highest frequency elements"
  Example:
    nums = [1,1,1,2,2,3], k = 2
    Count:   {1:3, 2:2, 3:1}
    Buckets: [_, [3], [2], [1], _, _, _]
              0   1    2    3   4  5  6   <- index = frequency
    Walk backwards: bucket[3]=[1], bucket[2]=[2] -> result = [1, 2]
    "Frequency is small (1 to n). Use it as the index, read from the back."
  Steps:
    1. Build count map (num -> frequency)
    2. Create buckets array of size n+1 (index = frequency)
    3. Fill buckets: buckets[freq].push(num)
    4. Walk buckets backwards, collect until result.length === k
  Mnemonic: "Count, bucket by frequency, harvest from the top."

subarraySum — O(n) time, O(n) space
  Problem: Given an array of integers and a target k, count the number of contiguous subarrays whose elements sum to k.
  Use when: "subarray sum equals k", "number of subarrays summing to target"
  Example:
    nums = [1, 2, 3], k = 3
    prefix: [0,  1,  3,  6]
             ^       ^
             0       3    →  3 - 0 = 3 = k (subarray [1,2])
                     ^   ^
                     3   6  →  6 - 3 = 3 = k (subarray [3])
    "Any two prefix sums that differ by k = a valid subarray between them."
  Steps:
    1. prefix.set(0, 1) — empty prefix sums to 0
    2. For each num: currSum += num
    3. count += prefix.get(currSum - k) || 0
    4. prefix.set(currSum, (prefix.get(currSum) || 0) + 1)
  Mnemonic: "Running sum minus k seen before? That's a valid subarray."

productExceptSelf — O(n) time, O(1) extra space
  Problem: Given an array of integers, return an array where each element is the product of all other elements, without using division.
  Use when: "product except self", "product of all other elements", "no division allowed"
  Example:
    Input:      [a,  b,  c ]
    Left pass:  [1,  a,  ab]  <- product of everything to my left
    Right pass: [bc, c,  1 ]  <- product of everything to my right
    Multiply:   [bc, ac, ab]  <- left x right = answer!
    "Two sweeps: left builds prefix, right builds suffix, multiply gives answer."
  Steps:
    1. Left pass: result[i] = prefixProduct before i; then prefixProduct *= nums[i]
    2. Right pass: result[i] *= suffixProduct; then suffixProduct *= nums[i]
  Mnemonic: "Left pass fills prefix, right pass multiplies in suffix."`,
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
        const pairSum = nums[left] + nums[right];

        if (pairSum === target) {
            return [left, right];
        } else if (pairSum < target) {
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Opposite direction - pair with target sum (sorted)
function twoSumSorted(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    let result = null;

    repeatWhile(
        () => left < right && result === null,
        () => {
            const pairSum = nums[left] + nums[right];

            if (pairSum === target) {
                result = [left, right];
            } else if (pairSum < target) {
                // Sum too small — move left pointer right to increase it
                left++;
            } else {
                // Sum too big — move right pointer left to decrease it
                right--;
            }
        }
    );
    return result;
}

// 3Sum pattern - fix one, two-pointer on rest
function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const result = [];

    forEach(nums, (_, i) => {
        if (i >= nums.length - 2) return;
        // Skip duplicate values for the fixed element
        if (i > 0 && nums[i] === nums[i - 1]) {
            return;
        }

        let left = i + 1;
        let right = nums.length - 1;

        repeatWhile(
            () => left < right,
            () => {
                const total = nums[i] + nums[left] + nums[right];

                if (total === 0) {
                    result.push([nums[i], nums[left], nums[right]]);

                    // Skip duplicate values for left pointer
                    left = advancePast(nums, left, (val) => val === nums[left + 1] && left < right);
                    left++;
                    right--;
                } else if (total < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        );
    });
    return result;
}

// Partition - remove duplicates in-place
function removeDuplicates(nums) {
    if (!nums.length) {
        return 0;
    }

    // slow tracks the last position of the unique-element section
    let slow = 0;

    forEachStartingAt(1, nums, (_, fast) => {
        if (nums[fast] !== nums[slow]) {
            // Found a new unique element — extend the unique section
            slow++;
            nums[slow] = nums[fast];
        }
    });

    return slow + 1;
}

// Trapping Rain Water (two-pointer approach)
function trap(height) {
    let left = 0;
    let right = height.length - 1;
    let leftMax = 0;
    let rightMax = 0;
    let totalWater = 0;

    repeatWhile(
        () => left < right,
        () => {
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
    );

    return totalWater;
}`,
    verification: `twoSumSorted:
  Promise: "the pair that sums to target, if it exists, lies within nums[left..right]"
  Init: left = 0, right = n-1 — the full array is the search space ✓
  Maintain:
    What changes? We compute pairSum and move one pointer inward.
    Could it break the promise? No — if pairSum < target the answer cannot involve nums[left] (too small to pair with anything smaller), so left++ is safe; symmetrically for right--.
    Flip test: what would break it? Moving the pointer in the wrong direction.
      Does the code prevent it? Yes — too small means left must grow; too large means right must shrink. ✓
  Terminate: left === right (window collapses) means no pair exists; any earlier exit returns the found pair ✓

threeSum:
  Promise: "for fixed nums[i], the inner two-pointer search covers all pairs in nums[i+1..right] that sum to -nums[i]"
  Init: same invariant as twoSumSorted applied to the suffix ✓
  Maintain:
    What changes? Same shrink logic as twoSumSorted; duplicate skipping keeps results unique.
    Could it break the promise? No — duplicates are skipped only after recording a match, so no valid triplet is lost.
    Flip test: what would break it? Skipping the outer loop duplicate without the i > 0 guard.
      Does the code prevent it? Yes — the guard 'i > 0 && nums[i] === nums[i-1]' preserves the first occurrence. ✓
  Terminate: outer loop exhausts all anchor positions; inner loop correctly covers each suffix ✓

removeDuplicates:
  Promise: "nums[0..slow] is the sorted unique prefix of the original array"
  Init: slow = 0, nums[0] is itself — single-element prefix is trivially unique ✓
  Maintain:
    What changes? fast scans ahead; when it finds a value different from nums[slow], slow advances and nums[slow] = nums[fast].
    Could it break the promise? No — the unique prefix only extends when a genuinely new value is found.
    Flip test: what would break it? Advancing slow without copying nums[fast].
      Does the code prevent it? Yes — slow++ and the assignment happen together. ✓
  Terminate: fast has scanned the whole array; slow + 1 is the count of unique elements ✓

trap:
  Promise: "totalWater is the exact trapped water for all positions already processed; the remaining water is bounded by min(leftMax, rightMax) for each unprocessed position"
  Init: all variables are 0, no positions processed — trivially true ✓
  Maintain:
    What changes? We process the side with the smaller max (the bottleneck), compute water at that position, and advance that pointer.
    Could it break the promise? No — the bottleneck side's water level is certain (the other wall is at least as tall, so no overflow).
    Flip test: what would break it? Processing the taller side first — its water level would be unknown.
      Does the code prevent it? Yes — we always pick the shorter side. ✓
  Terminate: left === right, every position processed, totalWater is the answer ✓`,
    jsTemplateWalkthrough:
      '── Two Sum Sorted ──\n' +
      'nums = [1, 3, 5, 7, 9], target = 10\n\n' +
      'left=0, right=4: pairSum = 1+9 = 10 → found!\n' +
      'return [0, 4]\n\n' +
      'Another example: target = 8\n' +
      'left=0, right=4: pairSum = 1+9 = 10 > 8 → right--\n' +
      'left=0, right=3: pairSum = 1+7 = 8 → found!\n' +
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
  - Skip: if nums[i] == nums[i-1], continue

TRAPPING RAIN WATER (two-pointer approach):
  Water at position i = min(leftMax, rightMax) - height[i]
  Move the SHORTER side inward (same logic as Container With Most Water).
  Mnemonic: "Water is limited by the shorter wall. Move the short side."

  Template:
    left=0, right=n-1, leftMax=0, rightMax=0
    while left < right:
        if height[left] < height[right]: process left side
        else: process right side

TEMPLATE-BY-TEMPLATE MEMORIZATION:

twoSumSorted — O(n) time, O(1) space
  Problem: Given a sorted array and a target, return the indices of two numbers that add up to the target.
  Use when: "sorted array", "pair with given sum", "two pointers on sorted input"
  Example:
    nums = [1, 3, 5, 8], target = 9
    L=0, R=3: 1+8=9 -> found! return [0,3]
    Another: target=6
    L=0, R=3: 1+8=9 > 6 -> R--
    L=0, R=2: 1+5=6 -> found! return [0,2]
    "Sum too big? Shrink right. Sum too small? Grow left. Sorted order guides every move."
  Steps:
    1. left = 0, right = n-1
    2. curr = nums[left] + nums[right]
    3. curr === target -> return; curr < target -> left++; curr > target -> right--
  Mnemonic: "Too small? Grow left. Too big? Shrink right."

threeSum — O(n²) time, O(1) space
  Problem: Given an array of integers, return all unique triplets that sum to zero.
  Use when: "three numbers summing to zero", "unique triplets", "3-way sum"
  Example:
    sorted: [-4, -1, -1, 0, 1, 2]
    i=0: fix -4, L=1, R=5: -4+(-1)+2=-3 < 0 -> L++ ... no triplet
    i=1: fix -1, L=2, R=5: -1+(-1)+2=0  -> push [-1,-1,2], L++ R--
                            L=3, R=4: -1+0+1=0  -> push [-1,0,1]
    i=2: -1 == nums[1] -> skip (duplicate)
    "Fix one, two-pointer the rest. Sort puts duplicates adjacent for easy skip."
  Steps:
    1. Sort the array
    2. Outer loop fixes nums[i]; skip if duplicate (nums[i] === nums[i-1] and i > 0)
    3. Inner two-pointer on [i+1 .. n-1]: sum < 0 -> left++; sum > 0 -> right--
    4. On match: push triplet, skip duplicate lefts, left++, right--
  Mnemonic: "Fix one, squeeze the rest, skip duplicates."

removeDuplicates — O(n) time, O(1) space
  Problem: Given a sorted array, remove duplicates in-place and return the count of unique elements.
  Use when: "remove duplicates in-place", "sorted array dedup", "two-pointer partition"
  Example:
    nums = [1, 1, 2, 3, 3], slow=0
    fast=1: nums[1]=1 == nums[0]=1   -> skip
    fast=2: nums[2]=2 != nums[0]=1   -> slow=1, nums[1]=2  -> [1,2,2,3,3]
    fast=3: nums[3]=3 != nums[1]=2   -> slow=2, nums[2]=3  -> [1,2,3,3,3]
    fast=4: nums[4]=3 == nums[2]=3   -> skip
    "Slow = last unique. Fast scouts ahead. New value? Extend unique section."
  Steps:
    1. slow = 0, fast starts at 1
    2. If nums[fast] !== nums[slow]: slow++, nums[slow] = nums[fast]
    3. Return slow + 1
  Mnemonic: "Slow = last unique. Fast scouts ahead. New value? Extend unique section."

trap — O(n) time, O(1) space
  Problem: Given an elevation map as an array, compute the total amount of water that can be trapped after rain.
  Use when: "trapping rain water", "water between bars", "elevation map"
  Example:
    height =  [0, 1, 0, 2, 0, 1]
    leftMax:  [0, 1, 1, 2, 2, 2]
    rightMax: [2, 2, 2, 2, 1, 1]
    water:    [0, 0, 1, 0, 1, 0]  <- min(leftMax,rightMax) - height
    Two-pointer: process the shorter-max side. That side's water level is certain.
    "Move the shorter side inward. It's always the bottleneck."
  Steps:
    1. left=0, right=n-1, leftMax=0, rightMax=0
    2. If height[left] < height[right]: process left side (bottleneck)
       - If height[left] >= leftMax: update leftMax; else add leftMax - height[left] to water
       - left++
    3. Else: mirror logic on right side; right--
  Mnemonic: "Water limited by shorter wall. Move the short side inward."`,
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
    const charDeficit = new Map();
    for (const c of t) {
        charDeficit.set(c, (charDeficit.get(c) || 0) + 1);
    }

    let charsStillNeeded = t.length; // how many chars still needed
    let left = 0;
    let bestWindowStart = 0;
    let shortestWindowSoFar = Infinity;

    for (let right = 0; right < s.length; right++) {
        const rightChar = s[right];

        // If this char is needed (count > 0), one fewer missing
        if ((charDeficit.get(rightChar) || 0) > 0) {
            charsStillNeeded--;
        }
        charDeficit.set(rightChar, (charDeficit.get(rightChar) || 0) - 1);

        // When window satisfies all requirements, try to shrink from left
        while (charsStillNeeded === 0) {
            const windowLen = right - left + 1;
            if (windowLen < shortestWindowSoFar) {
                shortestWindowSoFar = windowLen;
                bestWindowStart = left;
            }

            // Remove leftmost char from window
            const leftChar = s[left];
            charDeficit.set(leftChar, (charDeficit.get(leftChar) || 0) + 1);
            if (charDeficit.get(leftChar) > 0) {
                charsStillNeeded++; // window is now missing a required char
            }
            left++;
        }
    }
    return shortestWindowSoFar === Infinity ? '' : s.slice(bestWindowStart, bestWindowStart + shortestWindowSoFar);
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Variable window - longest substring without repeating chars
function lengthOfLongestSubstring(s) {
    const seen = new Map(); // char -> last index seen
    let left = 0;
    let result = 0;

    forEach(s, (char, right) => {
        // If char was seen and is still inside the current window
        if (seen.has(char) && seen.get(char) >= left) {
            // Shrink window: move left past the previous occurrence
            left = seen.get(char) + 1;
        }

        seen.set(char, right);

        // Update the longest window found so far
        const windowLength = right - left + 1;
        result = Math.max(result, windowLength);
    });
    return result;
}

// Variable window - minimum window substring
function minWindow(s, t) {
    // Build frequency map of what we need
    const charDeficit = new Map();
    forEach(t, (c) => {
        charDeficit.set(c, (charDeficit.get(c) || 0) + 1);
    });

    let charsStillNeeded = t.length; // how many chars still needed
    let left = 0;
    let bestWindowStart = 0;
    let shortestWindowSoFar = Infinity;

    forEach(s, (rightChar, right) => {
        // If this char is needed (count > 0), one fewer missing
        if ((charDeficit.get(rightChar) || 0) > 0) {
            charsStillNeeded--;
        }
        charDeficit.set(rightChar, (charDeficit.get(rightChar) || 0) - 1);

        // When window satisfies all requirements, try to shrink from left
        repeatWhile(
            () => charsStillNeeded === 0,
            () => {
                const windowLen = right - left + 1;
                if (windowLen < shortestWindowSoFar) {
                    shortestWindowSoFar = windowLen;
                    bestWindowStart = left;
                }

                // Remove leftmost char from window
                const leftChar = s[left];
                charDeficit.set(leftChar, (charDeficit.get(leftChar) || 0) + 1);
                if (charDeficit.get(leftChar) > 0) {
                    charsStillNeeded++; // window is now missing a required char
                }
                left++;
            }
        );
    });
    return shortestWindowSoFar === Infinity ? '' : s.slice(bestWindowStart, bestWindowStart + shortestWindowSoFar);
}

// Fixed window - max sum of subarray of size k
function maxSumSubarray(nums, k) {
    // Build the initial window of size k
    let windowSum = 0;
    forEachBetween(0, k, (i) => {
        windowSum += nums[i];
    });
    let maxSum = windowSum;

    // Slide the window: add the new right element, remove the old left element
    forEachStartingAt(k, nums, (_, i) => {
        windowSum = windowSum + nums[i] - nums[i - k];
        maxSum = Math.max(maxSum, windowSum);
    });
    return maxSum;
}`,
    verification: `lengthOfLongestSubstring:
  Promise: "s[left..right] contains no repeated characters; result holds the length of the longest valid window seen"
  Init: left = 0, seen is empty, result = 0 — the empty window is trivially duplicate-free ✓
  Maintain:
    What changes? We advance right; if the new char is already inside the window we jump left past its previous occurrence.
    Could it break the promise? No — jumping left past the old position removes the duplicate before recording it.
    Flip test: what would break it? Updating seen[char] = right before jumping left.
      Does the code prevent it? Yes — we jump left first, then update seen. ✓
  Terminate: right has visited every character; result is the maximum valid window length ✓

minWindow:
  Promise: "charsStillNeeded === 0 exactly when s[left..right] contains all required characters of t with sufficient counts"
  Init: charsStillNeeded = t.length, charDeficit mirrors t's frequency — correct before any character is consumed ✓
  Maintain:
    What changes? Expanding right decrements charsStillNeeded when a truly needed char is added; shrinking left increments it when a required char falls below quota.
    Could it break the promise? No — we only change charsStillNeeded when charDeficit crosses the zero boundary.
    Flip test: what would break it? Decrementing charsStillNeeded for surplus (already covered) characters.
      Does the code prevent it? Yes — we check 'charDeficit[rightChar] > 0' before decrementing. ✓
  Terminate: every valid window has been compared to shortestWindowSoFar; the shortest is returned ✓

maxSumSubarray:
  Promise: "windowSum is the exact sum of the k elements ending at the current index; maxSum is the largest such sum seen"
  Init: windowSum = sum of first k elements, the window covers indices [0, k-1] ✓
  Maintain:
    What changes? We add nums[i] (new right element) and subtract nums[i-k] (oldest element leaving the window).
    Could it break the promise? No — exactly one element enters and one leaves, keeping window size k.
    Flip test: what would break it? Subtracting nums[i-k+1] instead of nums[i-k].
      Does the code prevent it? Yes — nums[i - k] is precisely the element that entered k steps earlier. ✓
  Terminate: every window of size k is evaluated; maxSum is the answer ✓`,
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
      'charDeficit = {A:1, B:1, C:1}, charsStillNeeded=3\n\n' +
      'right=0: A, charDeficit[A]=1>0 → charsStillNeeded=2, charDeficit[A]=0\n' +
      'right=1: D → charDeficit[D]=-1\n' +
      'right=2: O → charDeficit[O]=-1\n' +
      'right=3: B, charDeficit[B]=1>0 → charsStillNeeded=1, charDeficit[B]=0\n' +
      'right=4: E → charDeficit[E]=-1\n' +
      'right=5: C, charDeficit[C]=1>0 → charsStillNeeded=0 ← valid window!\n' +
      '  window="ADOBEC", len=6, shortestWindowSoFar=6, bestWindowStart=0\n' +
      '  shrink: remove A, charDeficit[A]=1>0 → charsStillNeeded=1, left=1 → exit while\n' +
      '...(sliding continues)...\n' +
      'right=9: A, charDeficit[A]=1>0 → charsStillNeeded=0 ← valid!\n' +
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
  - Shortest valid window: shrink while VALID, update answer BEFORE shrinking

TEMPLATE-BY-TEMPLATE MEMORIZATION:

lengthOfLongestSubstring — O(n) time, O(min(n,charset)) space
  Problem: Given a string, return the length of the longest substring that contains no repeating characters.
  Use when: "longest substring without repeating", "no duplicate characters", "unique character window"
  Example:
    s = "abcab"
    right=0: a, seen={},    window=[a],   len=1
    right=1: b, seen={a:0}, window=[ab],  len=2
    right=2: c, seen={a,b}, window=[abc], len=3
    right=3: a, seen[a]=0 >= left=0 -> jump left=1, window=[bca], len=3
    right=4: b, seen[b]=1 >= left=1 -> jump left=2, window=[cab], len=3
    "On duplicate inside window: jump left past it. Never shrink by one step at a time."
  Steps:
    1. Map + left pointer + result
    2. For each right char: if seen AND inside window (seen.get(char) >= left) → jump left past it
    3. Update seen with current position
    4. Window size = right - left + 1, track max
  Mnemonic: "Seen it inside the window? Jump past it. Otherwise, grow."

minWindow — O(n) time, O(charset) space
  Problem: Given strings s and t, return the minimum window substring of s that contains all characters of t.
  Use when: "minimum window substring", "smallest window containing all chars", "find substring with all required characters"
  Example:
    s="ADOBEC", t="ABC", need={A:1,B:1,C:1}, missing=3
    right=0: A -> missing=2
    right=3: B -> missing=1
    right=5: C -> missing=0 (valid!) window="ADOBEC", len=6
      shrink: remove A -> missing=1 -> stop. best=6
    "Grow right until all needed chars present; then shrink left while still valid."
  Steps:
    1. Build need map from t, set missing = t.length
    2. Expand right: if need[char] > 0, decrement missing; always decrement need[char]
    3. When missing === 0: record shortest window, then shrink from left
    4. Shrink: increment need[leftChar], if need[leftChar] > 0 then missing++; left++
  Mnemonic: "Expand until valid, shrink while valid, track the shortest."

maxSumSubarray — O(n) time, O(1) space
  Problem: Given an array and integer k, return the maximum sum of any contiguous subarray of exactly k elements.
  Use when: "fixed window size", "maximum sum of k elements", "sliding window of size k"
  Example:
    nums = [2, 1, 5, 1, 3, 2], k=3
    initial window:  2+1+5 = 8       <- sum first k elements
    slide to [1,5,1]: 8 + 1 - 2 = 7  <- add right, drop left
    slide to [5,1,3]: 7 + 3 - 1 = 9  <- maxSum=9
    slide to [1,3,2]: 9 + 2 - 5 = 6
    "Fixed window: each step = add new right, drop old left. No recompute."
  Steps:
    1. Sum first k elements as initial windowSum
    2. Slide: windowSum += nums[i] - nums[i - k]
    3. Track maxSum after each slide
  Mnemonic: "Add the new right, drop the old left, keep the best."`,
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

    for (let todayIndex = 0; todayIndex < n; todayIndex++) {
        const todayTemp = temps[todayIndex];
        // Pop all indices whose temperature is less than today's temp
        while (stack.length > 0) {
            const waitingIndex = stack[stack.length - 1];
            const waitingTemp = temps[waitingIndex];
            if (todayTemp <= waitingTemp) {
                break;
            }
            stack.pop();
            const daysWaited = todayIndex - waitingIndex;
            result[waitingIndex] = daysWaited;
        }
        stack.push(todayIndex);
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Valid parentheses
function isValid(s) {
    const stack = [];
    const pairs = { ')': '(', ']': '[', '}': '{' };
    let invalid = false;

    forEach(s, (c) => {
        if (invalid) return; // already found mismatch
        if (pairs[c]) {
            // Closing bracket: check that it matches the top of stack
            const expectedOpen = pairs[c];
            const top = stack[stack.length - 1];
            if (!stack.length || top !== expectedOpen) {
                invalid = true;
                return;
            }
            stack.pop();
        } else {
            // Opening bracket: push onto stack
            stack.push(c);
        }
    });

    // If stack is empty and no mismatches, all brackets were matched
    return !invalid && stack.length === 0;
}

// Monotonic stack - daily temperatures (next warmer day)
function dailyTemperatures(temps) {
    const n = temps.length;
    const result = new Array(n).fill(0);
    const stack = []; // stores indices waiting for a warmer day

    forEachBetween(0, n, (todayIndex) => {
        const todayTemp = temps[todayIndex];
        // Pop all indices whose temperature is less than today's temp
        repeatWhile(
            () => {
                if (stack.length === 0) return false;
                const waitingIndex = stack[stack.length - 1];
                const waitingTemp = temps[waitingIndex];
                return todayTemp > waitingTemp;
            },
            () => {
                const waitingIndex = stack.pop();
                const daysWaited = todayIndex - waitingIndex;
                result[waitingIndex] = daysWaited;
            }
        );
        stack.push(todayIndex);
    });
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

    forEach(tokens, (t) => {
        if (ops[t]) {
            // Pop operands in reverse order (b was pushed last)
            const b = stack.pop();
            const a = stack.pop();
            const resultVal = ops[t](a, b);
            stack.push(resultVal);
        } else {
            stack.push(Number(t));
        }
    });
    return stack[0];
}`,
    verification: `isValid:
  Promise: "stack holds the opening brackets opened but not yet matched, in order"
  Init: stack is empty — no brackets opened yet ✓
  Maintain:
    What changes? Opening brackets are pushed; closing brackets pop and check a match.
    Could it break the promise? No — we return false immediately if the top does not match; otherwise we pop only a valid opener.
    Flip test: what would break it? Popping without verifying the match.
      Does the code prevent it? Yes — 'top !== expectedOpen' is checked before the pop. ✓
  Terminate: stack empty at the end means every opener was matched; any remainder means unmatched openers ✓

dailyTemperatures:
  Promise: "stack contains indices of past days whose next-warmer-day has not been found yet, maintained in decreasing temperature order"
  Init: stack is empty — no unresolved days yet ✓
  Maintain:
    What changes? While the current day is warmer than the day at the top, we pop that index and set result[j] = i - j; then push i.
    Could it break the promise? No — we pop only when a warmer day is definitively found.
    Flip test: what would break it? Pushing i before popping resolved indices.
      Does the code prevent it? Yes — the while loop clears all resolved indices before the push. ✓
  Terminate: indices remaining in the stack never found a warmer day; their result stays 0 ✓

evalRPN:
  Promise: "stack holds the evaluated values of completed sub-expressions, in order"
  Init: stack is empty — no tokens consumed yet ✓
  Maintain:
    What changes? Numbers push onto the stack; operators pop two values (b last, a second-to-last), compute, and push the result.
    Could it break the promise? No — each operator reduces two operands to one result, maintaining valid RPN semantics.
    Flip test: what would break it? Popping in the wrong order (a before b).
      Does the code prevent it? Yes — b = stack.pop() first, then a = stack.pop(), so ops[t](a, b) computes correctly. ✓
  Terminate: exactly one value remains — the result of the whole expression ✓`,
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
  - Next SMALLER element = INCREASING stack (pop when current is smaller)

TEMPLATE-BY-TEMPLATE MEMORIZATION:

isValid — O(n) time, O(n) space
  Problem: Given a string of bracket characters, determine if every opening bracket is closed in the correct order.
  Use when: "valid parentheses", "balanced brackets", "matching pairs"
  Example:
    s = "({[]})"
    ( -> push:   stack=[(
    { -> push:   stack=({  
    [ -> push:   stack=({[
    ] -> matches [ -> pop: stack=({  
    } -> matches { -> pop: stack=(
    ) -> matches ( -> pop: stack=[]
    stack empty -> true
    "Stack = memory of unclosed brackets. Closing must match the most recent open."
  Steps:
    1. Build pairs map: closing → opening
    2. If char is closing: check stack top matches expected open; if not → false; pop
    3. If char is opening: push
    4. Return stack.length === 0
  Mnemonic: "Closing bracket? Match the top or fail. Opening? Stack it."

dailyTemperatures — O(n) time, O(n) space
  Problem: Given a list of daily temperatures, return an array where each entry is the number of days until a warmer temperature, or 0 if none.
  Use when: "days until warmer", "next greater temperature", "waiting days"
  Example:
    temps: [73, 74, 75, 71, 69, 72, 76, 73]
    stack: [73]
           74 arrives -> 73 < 74 -> pop! waited 1 day
    stack: [74]
           75 arrives -> 74 < 75 -> pop! waited 1 day
    stack: [75, 71, 69]
           72 arrives -> 69 < 72 -> pop (3 days), 71 < 72 -> pop (2 days)
    "Hot day arrives -> everyone cooler on the stack gets resolved."
  Steps:
    1. result array filled with 0s
    2. For each i: while stack not empty AND temps[i] > temps[stack top]: pop j, result[j] = i - j
    3. Push i
  Mnemonic: "Warmer day found? Tell all the colder waiting days how long they waited."

evalRPN — O(n) time, O(n) space
  Problem: Given an array of tokens representing a postfix (Reverse Polish Notation) expression, evaluate and return the result.
  Use when: "reverse polish notation", "postfix expression", "stack-based calculator"
  Example:
    tokens = ["2","1","+","3","*"]  meaning: (2+1)*3
    "2"  -> push: stack=[2]
    "1"  -> push: stack=[2,1]
    "+"  -> pop b=1, a=2, push 2+1=3:  stack=[3]
    "3"  -> push: stack=[3,3]
    "*"  -> pop b=3, a=3, push 3*3=9:  stack=[9]
    return 9
    "Number? Push. Operator? Pop two, compute, push result."
  Steps:
    1. If token is operator: pop b then pop a, compute ops[token](a, b), push result
    2. If token is number: push Number(token)
    3. Return stack[0]
  Mnemonic: "Number? Push. Operator? Pop two, compute, push result."`,
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
function firstTrue(low, high, condition) {
    // Invariant: answer is in [low, high]
    while (low < high) {
        const mid = low + Math.floor((high - low) / 2);

        if (condition(mid)) {
            // mid could be the answer, don't exclude it
            high = mid;
        } else {
            // mid is definitely not the answer
            low = mid + 1;
        }
    }
    return low;
}

// Search on answer - Koko eating bananas
function minEatingSpeed(piles, h) {
    // Check: can Koko finish all piles in h hours eating at this speed?
    function canFinish(speed) {
        let hoursNeeded = 0;
        for (const pile of piles) {
            hoursNeeded += Math.ceil(pile / speed);
        }
        return hoursNeeded <= h;
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Classic binary search
function binarySearch(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    let result = -1;

    repeatWhile(
        () => left <= right && result === -1,
        () => {
            // Avoid integer overflow: use left + floor((right - left) / 2)
            const mid = left + Math.floor((right - left) / 2);

            if (nums[mid] === target) {
                result = mid;
            } else if (nums[mid] < target) {
                // Target is in the right half
                left = mid + 1;
            } else {
                // Target is in the left half
                right = mid - 1;
            }
        }
    );
    return result;
}

// Find first position where condition is true (left boundary)
function firstTrue(low, high, condition) {
    // Invariant: answer is in [low, high]
    repeatWhile(
        () => low < high,
        () => {
            const mid = low + Math.floor((high - low) / 2);

            if (condition(mid)) {
                // mid could be the answer, don't exclude it
                high = mid;
            } else {
                // mid is definitely not the answer
                low = mid + 1;
            }
        }
    );
    return low;
}

// Search on answer - Koko eating bananas
function minEatingSpeed(piles, h) {
    // Check: can Koko finish all piles in h hours eating at this speed?
    function canFinish(speed) {
        let hoursNeeded = 0;
        forEach(piles, (pile) => {
            hoursNeeded += Math.ceil(pile / speed);
        });
        return hoursNeeded <= h;
    }

    // Binary search on the answer: minimum feasible speed
    let left = 1;
    let right = Math.max(...piles);

    repeatWhile(
        () => left < right,
        () => {
            const mid = left + Math.floor((right - left) / 2);
            if (canFinish(mid)) {
                right = mid; // mid works, try slower
            } else {
                left = mid + 1; // too slow, must go faster
            }
        }
    );
    return left;
}

// Search in rotated sorted array
function searchRotated(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    let result = -1;

    repeatWhile(
        () => left <= right && result === -1,
        () => {
            const mid = Math.floor((left + right) / 2);

            if (nums[mid] === target) {
                result = mid;
                return;
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
    );
    return result;
}`,
    verification: `binarySearch:
  Promise: "if target exists, it lies within nums[left..right]"
  Init: left = 0, right = n-1 — the entire array is the search space ✓
  Maintain:
    What changes? We compute mid and eliminate the half that cannot contain the target.
    Could it break the promise? No — nums[mid] < target means target is to the right (sorted), so left = mid+1 is safe; symmetrically right = mid-1.
    Flip test: what would break it? Setting left = mid instead of mid+1 (infinite loop possible).
      Does the code prevent it? Yes — we use mid+1 and mid-1, strictly shrinking the window each step. ✓
  Terminate: left > right means the window is empty and target does not exist; any match returns the index immediately ✓

firstTrue:
  Promise: "the first index where condition is true lies within [low, high]"
  Init: [low, high] is the full given range ✓
  Maintain:
    What changes? condition(mid) true sets high = mid (mid stays a candidate); false sets low = mid+1 (mid cannot be the answer).
    Could it break the promise? No — we never eliminate a position where the condition holds.
    Flip test: what would break it? Setting high = mid-1 when condition(mid) is true (would skip the actual first true).
      Does the code prevent it? Yes — we set high = mid, not mid-1. ✓
  Terminate: low === high converges to the first true index ✓

minEatingSpeed:
  Promise: "the minimum valid speed lies within [left, right]"
  Init: left = 1, right = max(piles) — the answer is guaranteed in this range ✓
  Maintain:
    What changes? canFinish(mid) true sets right = mid (keep mid as candidate); false sets left = mid+1 (mid too slow).
    Could it break the promise? No — same firstTrue pattern applied to a monotonic predicate.
    Flip test: what would break it? Setting right = mid-1 when canFinish is true (skips the optimal speed).
      Does the code prevent it? Yes — right = mid preserves the candidate. ✓
  Terminate: left === right is the minimum speed where canFinish is true ✓

searchRotated:
  Promise: "if target exists, it lies within nums[left..right]"
  Init: full array is the search space ✓
  Maintain:
    What changes? We identify the sorted half, check if target is inside it, and eliminate the other half.
    Could it break the promise? No — one half is always sorted; we can safely compare target against its endpoints.
    Flip test: what would break it? Misidentifying which half is sorted.
      Does the code prevent it? Yes — 'nums[left] <= nums[mid]' reliably identifies the sorted left half. ✓
  Terminate: target found and index returned, or window empty and -1 returned ✓`,
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
      'nums = [1, 2, 3, 5, 7, 9], low=0, high=5\n\n' +
      'mid=2: condition(2)=nums[2]=3 >= 5? No → low=3\n' +
      'mid=4: condition(4)=nums[4]=7 >= 5? Yes → high=4\n' +
      'mid=3: condition(3)=nums[3]=5 >= 5? Yes → high=3\n' +
      'low===high=3 → return 3\n\n' +
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

Memory trick: "Can I do it with X? Yes/No → Binary search the boundary."

TEMPLATE-BY-TEMPLATE MEMORIZATION:

binarySearch — O(log n) time, O(1) space
  Problem: Given a sorted array and a target value, return the index of the target, or -1 if it doesn't exist.
  Use when: "sorted array", "find target", "O(log n) lookup"
  Example:
    nums = [1, 3, 5, 7, 9, 11], target = 7
    left=0, right=5: mid=2, nums[2]=5 < 7  -> left=3
    left=3, right=5: mid=4, nums[4]=9 > 7  -> right=3
    left=3, right=3: mid=3, nums[3]=7 == 7 -> return 3
    "Each step halves candidates. Eliminate the half that can't contain target."
  Steps:
    1. left = 0, right = n-1; loop while left <= right
    2. mid = left + Math.floor((right - left) / 2)
    3. nums[mid] === target → return mid; < target → left = mid+1; > target → right = mid-1
    4. Return -1 if loop ends
  Mnemonic: "Equal? Done. Too small? Go right. Too big? Go left."

firstTrue — O(log n) time, O(1) space
  Problem: Given a range [lo, hi] and a monotonic boolean condition, find the first position where the condition is true.
  Use when: "find first position where condition holds", "left boundary", "minimum valid value"
  Example:
    [F, F, F, T, T, T]  find first T (index 3)
    lo=0, hi=5: mid=2, F -> lo=3
    lo=3, hi=5: mid=4, T -> hi=4
    lo=3, hi=4: mid=3, T -> hi=3
    lo=3 == hi=3 -> return 3
    "False? Skip past mid (lo=mid+1). True? It might be the answer (hi=mid)."
  Steps:
    1. Loop while lo < hi (not <=)
    2. mid = lo + Math.floor((hi - lo) / 2)
    3. condition(mid) is true → hi = mid (keep mid as candidate); else → lo = mid + 1
    4. Return lo
  Mnemonic: "Condition true? Narrow right (hi=mid). False? Skip left (lo=mid+1)."

minEatingSpeed — O(n log m) time, O(1) space
  Problem: Koko has piles of bananas and h hours. Find the minimum eating speed (bananas/hour) so she finishes all piles in time.
  Use when: "minimum speed/capacity/rate to finish in time", "binary search on the answer", "minimize X such that..."
  Example:
    piles=[3,6,7,11], h=8. Answer range: [1..11]
    mid=6: ceil(3/6)+ceil(6/6)+ceil(7/6)+ceil(11/6) = 1+1+2+2=6 <=8 -> ok, right=6
    mid=3: 1+2+3+4=10 > 8 -> too slow, left=4
    mid=5: 1+2+2+3=8 <=8 -> ok, right=5
    mid=4: 1+2+2+3=8 <=8 -> ok, right=4
    left==right=4 -> return 4
    "Binary search the answer itself. canFinish(speed) is monotonic."
  Steps:
    1. Define canFinish(speed): sum of ceil(pile/speed) <= h
    2. Binary search in [1, max(piles)] for smallest speed where canFinish is true
    3. Use left < right template; canFinish → right=mid; else → left=mid+1
    4. Return left
  Mnemonic: "Search on the answer. Can I do it? Shrink right. Can't? Push left."

searchRotated — O(log n) time, O(1) space
  Problem: Given a sorted array that was rotated at an unknown pivot, find the index of a target value, or -1 if not found.
  Use when: "rotated sorted array", "search with unknown pivot", "shifted sorted array"
  Example:
    [4, 5, 6, 7, 0, 1, 2], target=0
    left=0, right=6: mid=3, nums[3]=7
      nums[0]=4 <= nums[3]=7 -> left half [4..7] sorted
      0 in [4..7]? No -> go right: left=4
    left=4, right=6: mid=5, nums[5]=1
      nums[4]=0 <= nums[5]=1 -> left half [0,1] sorted
      0 in [0..1)? Yes -> go left: right=4
    left=4: nums[4]=0 == 0 -> return 4
    "One half is always sorted. Is target in that range? Go there. Else go other side."
  Steps:
    1. Find mid; if nums[mid] === target → return mid
    2. Check which half is sorted: nums[left] <= nums[mid] → left half is sorted
    3. If target is in the sorted half → search there; else search the other half
    4. Return -1 if not found
  Mnemonic: "One half is always sorted. Is target there? Go there. Else go other side."`,
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
    let previousNode = null;
    let currentNode = head;

    while (currentNode) {
        // Save the next node before we overwrite currentNode.next
        const nextNode = currentNode.next;

        // Reverse the link: point current node back to previousNode
        currentNode.next = previousNode;

        // Advance both pointers forward
        previousNode = currentNode;
        currentNode = nextNode;
    }
    // previousNode is now the new head of the reversed list
    return previousNode;
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
    let tail = dummy;

    while (l1 && l2) {
        if (l1.val <= l2.val) {
            tail.next = l1;
            l1 = l1.next;
        } else {
            tail.next = l2;
            l2 = l2.next;
        }
        tail = tail.next;
    }

    // Attach remaining nodes from whichever list is non-empty
    tail.next = l1 || l2;
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Reverse a linked list (iterative)
function reverseList(head) {
    let previousNode = null;
    let currentNode = head;

    repeatWhile(
        () => currentNode !== null,
        () => {
            // Save the next node before we overwrite currentNode.next
            const nextNode = currentNode.next;

            // Reverse the link: point current node back to previousNode
            currentNode.next = previousNode;

            // Advance both pointers forward
            previousNode = currentNode;
            currentNode = nextNode;
        }
    );
    // previousNode is now the new head of the reversed list
    return previousNode;
}

// Detect cycle (Floyd's algorithm)
function hasCycle(head) {
    let slow = head;
    let fast = head;
    let found = false;

    // fast moves 2 steps, slow moves 1 step
    // If there's a cycle, they'll eventually meet
    repeatWhile(
        () => !found && fast !== null && fast.next !== null,
        () => {
            slow = slow.next;
            fast = fast.next.next;

            if (slow === fast) {
                found = true;
            }
        }
    );
    return found;
}

// Find middle of linked list
function findMiddle(head) {
    let slow = head;
    let fast = head;

    // When fast reaches the end, slow is at the middle
    repeatWhile(
        () => fast !== null && fast.next !== null,
        () => {
            slow = slow.next;
            fast = fast.next.next;
        }
    );
    return slow;
}

// Merge two sorted lists
function mergeTwoLists(l1, l2) {
    // Dummy head simplifies the edge case of inserting before the first node
    const dummy = new ListNode(0);
    let tail = dummy;

    repeatWhile(
        () => l1 !== null && l2 !== null,
        () => {
            if (l1.val <= l2.val) {
                tail.next = l1;
                l1 = l1.next;
            } else {
                tail.next = l2;
                l2 = l2.next;
            }
            tail = tail.next;
        }
    );

    // Attach remaining nodes from whichever list is non-empty
    tail.next = l1 || l2;
    return dummy.next;
}

// Remove nth node from end (two-pointer gap)
function removeNthFromEnd(head, n) {
    const dummy = new ListNode(0, head);
    let fast = dummy;
    let slow = dummy;

    // Advance fast n+1 steps ahead so the gap between fast and slow is n+1
    forEachBetween(0, n + 1, () => {
        fast = fast.next;
    });

    // Move both until fast reaches the end
    repeatWhile(
        () => fast !== null,
        () => {
            fast = fast.next;
            slow = slow.next;
        }
    );

    // slow is now just before the node to remove
    slow.next = slow.next.next;
    return dummy.next;
}`,
    verification: `reverseList:
  Promise: "previousNode heads the already-reversed segment; currentNode heads the not-yet-reversed segment"
  Init: previousNode = null, currentNode = head — reversed segment is empty, unreversed is the full list ✓
  Maintain:
    What changes? We save nextNode, flip currentNode.next to previousNode, then advance both pointers.
    Could it break the promise? No — saving nextNode before the flip preserves the unreversed tail.
    Flip test: what would break it? Flipping currentNode.next before saving nextNode (loses the tail).
      Does the code prevent it? Yes — 'const nextNode = currentNode.next' executes first. ✓
  Terminate: currentNode is null; previousNode is the new head of the fully reversed list ✓

hasCycle:
  Promise: "if a cycle exists, slow and fast will eventually meet inside it"
  Init: both start at head ✓
  Maintain:
    What changes? slow advances 1, fast advances 2; fast gains 1 step per iteration relative to slow inside a cycle.
    Could it break the promise? No — the gap closes by 1 each round; collision is guaranteed within cycle-length rounds.
    Flip test: what would break it? Moving fast 3 steps (could jump over slow indefinitely).
      Does the code prevent it? Yes — fast = fast.next.next is exactly 2 steps. ✓
  Terminate: fast (or fast.next) is null means no cycle; slow === fast means cycle detected ✓

findMiddle:
  Promise: "slow is at the position floor(fast-steps / 2) from head"
  Init: both at head, position 0 ✓
  Maintain:
    What changes? slow advances 1, fast advances 2 — the 2x ratio is preserved every iteration.
    Could it break the promise? No — the ratio holds unconditionally each step.
    Flip test: what would break it? Advancing fast by 3 (slow would be at 1/3, not 1/2).
      Does the code prevent it? Yes — fast = fast.next.next. ✓
  Terminate: fast cannot take 2 more steps; slow is at the middle node ✓

mergeTwoLists:
  Promise: "dummy.next through tail is a sorted merged prefix; l1 and l2 point to unprocessed remaining nodes"
  Init: tail = dummy, l1 and l2 are untouched — merged prefix is empty ✓
  Maintain:
    What changes? We attach the smaller head to tail, advance that list's pointer, advance tail.
    Could it break the promise? No — always picking the smaller value preserves sorted order.
    Flip test: what would break it? Forgetting to advance l1/l2 after attaching (infinite loop).
      Does the code prevent it? Yes — l1 = l1.next (or l2 = l2.next) follows every attachment. ✓
  Terminate: one list is exhausted; remaining nodes attached in one step; dummy.next is the sorted merged head ✓

removeNthFromEnd:
  Promise: "fast is exactly n+1 positions ahead of slow"
  Init: fast advanced n+1 steps from dummy, slow still at dummy ✓
  Maintain:
    What changes? Both fast and slow advance one step — the gap remains n+1.
    Could it break the promise? No — both pointers move together symmetrically.
    Flip test: what would break it? Advancing only fast in the walk loop.
      Does the code prevent it? Yes — both pointers advance in every iteration. ✓
  Terminate: fast is null; slow is n+1 behind, pointing just before the target node; slow.next = slow.next.next removes it ✓`,
    jsTemplateWalkthrough:
      '── Reverse Linked List ──\n' +
      '1 → 2 → 3 → null\n\n' +
      'previousNode=null, currentNode=1\n' +
      'iter1: nextNode=2, 1.next=null, previousNode=1, currentNode=2\n' +
      '       null ← 1   2 → 3\n' +
      'iter2: nextNode=3, 2.next=1, previousNode=2, currentNode=3\n' +
      '       null ← 1 ← 2   3\n' +
      'iter3: nextNode=null, 3.next=2, previousNode=3, currentNode=null\n' +
      '       null ← 1 ← 2 ← 3\n\n' +
      'return previousNode=3  (new head)\n\n' +
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
      'l1.val=1 <= l2.val=2 → tail.next=l1(1), l1=3, tail=1\n' +
      'l1.val=3 > l2.val=2  → tail.next=l2(2), l2=4, tail=2\n' +
      'l1.val=3 <= l2.val=4 → tail.next=l1(3), l1=5, tail=3\n' +
      'l1.val=5 > l2.val=4  → tail.next=l2(4), l2=6, tail=4\n' +
      'l1.val=5 <= l2.val=6 → tail.next=l1(5), l1=null, tail=5\n' +
      'l1=null → tail.next=l2(6)\n\n' +
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
  If hare reaches null, no cycle.

TEMPLATE-BY-TEMPLATE MEMORIZATION:

reverseList — O(n) time, O(1) space
  Problem: Given the head of a singly linked list, reverse the list in-place and return the new head.
  Use when: "reverse linked list", "reverse a list", "flip the list"
  Example:
    1 -> 2 -> 3 -> null
    step1: nxt=2, 1.next=null, prev=1, curr=2
           null <- 1  2->3
    step2: nxt=3, 2.next=1,    prev=2, curr=3
           null <- 1 <- 2  3
    step3: nxt=null, 3.next=2, prev=3, curr=null
           null <- 1 <- 2 <- 3  (return 3)
    "Save next, reverse link, advance both. Three pointers carry the state."
  Steps:
    1. prev = null, curr = head
    2. While curr: nxt = curr.next; curr.next = prev; prev = curr; curr = nxt
    3. Return prev (new head)
  Mnemonic: "Save next, reverse link, advance both. SRAA: Save, Reverse, Advance, Advance."

hasCycle — O(n) time, O(1) space
  Problem: Given the head of a linked list, determine if the list contains a cycle.
  Use when: "detect cycle", "loop in linked list", "Floyd's algorithm"
  Example:
    1 -> 2 -> 3 -> 4 -> 2 (cycle at node 2)
    slow=1, fast=1
    step1: slow=2, fast=3
    step2: slow=3, fast=2  (fast looped back)
    step3: slow=4, fast=4  -> slow===fast -> return true
    "Fast gains 1 step per round inside a cycle. Collision guaranteed."
  Steps:
    1. slow = fast = head
    2. While fast && fast.next: slow = slow.next; fast = fast.next.next
    3. If slow === fast → return true
    4. Return false
  Mnemonic: "Tortoise and hare. If there's a loop, they must meet."

findMiddle — O(n) time, O(1) space
  Problem: Given the head of a linked list, return the middle node. If two middles exist, return the second one.
  Use when: "find middle node", "split linked list in half", "median of list"
  Example:
    1 -> 2 -> 3 -> 4 -> 5
    slow=1, fast=1
    step1: slow=2, fast=3
    step2: slow=3, fast=5
    fast.next=null -> stop. return slow=3
    For even-length [1,2,3,4]: stops at slow=3 (second middle).
    "Fast moves 2x. When fast hits end, slow is halfway."
  Steps:
    1. slow = fast = head
    2. While fast && fast.next: slow = slow.next; fast = fast.next.next
    3. Return slow (at middle when fast hits the end)
  Mnemonic: "Fast runs twice as far. When fast stops, slow is at the middle."

mergeTwoLists — O(n+m) time, O(1) space
  Problem: Given the heads of two sorted linked lists, merge them into one sorted linked list and return the head.
  Use when: "merge two sorted lists", "combine sorted linked lists"
  Example:
    l1: 1->3->5,  l2: 2->4->6
    dummy->
    1<=2: attach l1(1), l1=3
    3>2:  attach l2(2), l2=4
    3<=4: attach l1(3), l1=5
    5>4:  attach l2(4), l2=6
    5<=6: attach l1(5), l1=null
    l1 null: attach remaining l2(6)
    result: 1->2->3->4->5->6
    "Dummy head removes first-node edge case. Pick smaller, advance that pointer."
  Steps:
    1. dummy = new ListNode(0); tail = dummy
    2. While l1 && l2: attach the smaller; advance that pointer; tail = tail.next
    3. tail.next = l1 || l2
    4. Return dummy.next
  Mnemonic: "Dummy head, pick the smaller, attach, advance. Drain the leftovers."

removeNthFromEnd — O(n) time, O(1) space
  Problem: Given the head of a linked list and n, remove the nth node from the end of the list and return the head.
  Use when: "remove nth from end", "delete kth from last"
  Example:
    1->2->3->4->5, n=2 (remove 4th node = 4)
    dummy->1->2->3->4->5
    Advance fast n+1=3 steps: fast=node(3)
    Move both until fast=null:
      fast=4, slow=1
      fast=5, slow=2
      fast=null, slow=3
    slow=3, slow.next=4 -> slow.next=5
    result: 1->2->3->5
    "Gap of n+1: when fast hits null, slow is just before the target."
  Steps:
    1. dummy.next = head; fast = slow = dummy
    2. Advance fast n+1 steps ahead
    3. Move both until fast === null
    4. slow.next = slow.next.next; return dummy.next
  Mnemonic: "Create a gap of n+1. When fast hits the end, slow is just before the target."`,
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// DFS - maximum depth
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

    repeatWhile(
        () => queue.length > 0,
        () => {
            const levelSize = queue.length;
            const level = [];

            // Process all nodes at the current level
            forEachBetween(0, levelSize, () => {
                const node = queue.shift();
                level.push(node.val);

                if (node.left) {
                    queue.push(node.left);
                }
                if (node.right) {
                    queue.push(node.right);
                }
            });
            result.push(level);
        }
    );
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
    verification: `maxDepth:
  Promise: "maxDepth(node) = the height of the subtree rooted at node"
  Base case: !node returns 0 — an empty subtree has height 0 ✓
  Inductive step: assume maxDepth(node.left) and maxDepth(node.right) are correct.
    For the current node: height = 1 + max(leftDepth, rightDepth) — 1 for this level plus the taller child.
    We take the taller side, so the result is optimal for this subtree ✓
  Why nothing is missed: both children are always visited before returning ✓

levelOrder:
  Promise: "queue holds exactly all nodes at the current level; result accumulates one sub-array per completed level"
  Init: queue = [root] — level 0 is exactly one node ✓
  Maintain:
    What changes? We snapshot levelSize, drain exactly that many nodes into a level array, enqueue their children.
    Could it break the promise? No — snapshotting queue.length before enqueuing children cleanly separates levels.
    Flip test: what would break it? Reading queue.length after enqueuing children (would mix levels).
      Does the code prevent it? Yes — levelSize is captured before any children are added to the queue. ✓
  Terminate: queue is empty; every level is collected in order ✓

isValidBST:
  Promise: "every node in the subtree rooted at root has a value strictly in (lo, hi)"
  Base case: !root returns true — empty subtree satisfies any range ✓
  Inductive step: assume isValidBST(left, lo, root.val) and isValidBST(right, root.val, hi) are correct.
    For root: check lo < root.val < hi; recurse with tightened bounds on each child.
    Both checks must pass — necessary and sufficient for the whole subtree ✓
  Why nothing is missed: every ancestor's constraint is propagated down; a local comparison alone would miss violations like a right-subtree node being less than the root's grandparent ✓

lowestCommonAncestor:
  Promise: "lowestCommonAncestor(root, p, q) returns the LCA if both p and q are in the subtree, or the found node if only one is"
  Base case: !root returns null; root === p or root === q returns root ✓
  Inductive step: assume recursive calls on left and right are correct.
    Both sides return non-null: p is in one subtree, q in the other — current root is the LCA.
    One side returns non-null: both targets are in that subtree (or we already surfaced one) — bubble it up.
    We return the correct value in all cases ✓
  Why nothing is missed: every subtree is searched; the LCA is the deepest node where the two paths first diverge ✓

diameterOfBinaryTree:
  Promise: "height(node) = height of the subtree; maxDiameter is updated with the longest path through node"
  Base case: !node returns 0 — no path through null ✓
  Inductive step: assume height(left) and height(right) are correct.
    Path through this node = leftH + rightH; update maxDiameter; return 1 + max(leftH, rightH).
    The diameter candidate and height are both computed correctly bottom-up ✓
  Why nothing is missed: every node is considered as a potential path midpoint; the global variable captures the best across all nodes ✓`,
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

Memory trick: "BFS = Queue + Level loop. DFS = Recursion + Base case."

TEMPLATE-BY-TEMPLATE MEMORIZATION:

maxDepth — O(n) time, O(h) space
  Problem: Given the root of a binary tree, return its maximum depth (number of nodes along the longest root-to-leaf path).
  Use when: "max depth", "height of tree", "deepest level"
  Example:
        3
       / \
      9  20
         / \
        15   7
    maxDepth(9)=1, maxDepth(15)=1, maxDepth(7)=1
    maxDepth(20) = 1 + max(1,1) = 2
    maxDepth(3)  = 1 + max(1,2) = 3
    "Each node: 1 + max(left depth, right depth). Null returns 0."
  Steps:
    1. Base case: if !root return 0
    2. Recurse left and right
    3. Return 1 + Math.max(leftDepth, rightDepth)
  Mnemonic: "Leaf returns 0. Each level adds 1. Take the taller side."

levelOrder — O(n) time, O(w) space
  Problem: Given the root of a binary tree, return the values of its nodes level by level, as a list of lists.
  Use when: "level order traversal", "BFS on tree", "nodes by depth"
  Example:
    tree: 3 with children 9, 20 (20 has children 15, 7)
    queue=[3], level=[]
    Level 1: size=1, pop 3, enqueue 9,20 -> level=[3]
    Level 2: size=2, pop 9(no kids), pop 20(enqueue 15,7) -> level=[9,20]
    Level 3: size=2, pop 15, pop 7 -> level=[15,7]
    "Snapshot the level size, drain exactly that many, move to next level."
  Steps:
    1. queue = [root]
    2. While queue has items: snapshot levelSize = queue.length
    3. Loop levelSize times: shift node, push val to level, enqueue children
    4. Push level to result
  Mnemonic: "Snapshot the level size, drain exactly that many, collect the level."

isValidBST — O(n) time, O(h) space
  Problem: Given the root of a binary tree, determine if it is a valid binary search tree.
  Use when: "validate BST", "check if tree is BST", "BST property verification"
  Example:
    Invalid BST:     5
                    / \
                   1   4
                      / \
                     3   6
    isValidBST(4, lo=5, hi=inf): 4 <= lo=5 -> false!
    (4 is in right subtree of 5, must be > 5, but it's not)
    "Pass inherited (lo, hi) bounds down. Tighten: left gets hi=node, right gets lo=node."
  Steps:
    1. Base: if !root return true
    2. If root.val <= lo OR root.val >= hi → return false
    3. Recurse left with (lo, root.val) and right with (root.val, hi)
  Mnemonic: "Every node must fit in its inherited range. Tighten the range as you go down."

lowestCommonAncestor — O(n) time, O(h) space
  Problem: Given a binary tree and two nodes p and q, find their lowest common ancestor.
  Use when: "lowest common ancestor", "LCA", "deepest shared ancestor"
  Example:
    tree: 6->2->4, 6->8, find LCA(2,8)
    lca(6,2,8):
      left  = lca(2,2,8) -> root===p -> return node(2)
      right = lca(8,2,8) -> root===q -> return node(8)
      both non-null -> return root=6 (the LCA!)
    find LCA(2,4): left finds 4 inside subtree of 2, right=null -> bubble up 4
    "Both sides found something? Current node is the LCA. Else bubble the find up."
  Steps:
    1. Base: if !root or root === p or root === q → return root
    2. left = recurse left; right = recurse right
    3. If both left and right are non-null → return root (LCA is here)
    4. Return left || right
  Mnemonic: "Both sides found something? You're the LCA. Else bubble up whoever was found."

diameterOfBinaryTree — O(n) time, O(h) space
  Problem: Given the root of a binary tree, return the length of the diameter (the longest path between any two nodes, measured in edges).
  Use when: "diameter of binary tree", "longest path", "maximum path length"
  Example:
        1
       / \
      2   3
     / \
    4   5
    height(4)=1, height(5)=1
    height(2): leftH=1, rightH=1, diameter=max(0, 1+1)=2, return 2
    height(3)=1
    height(1): leftH=2, rightH=1, diameter=max(2, 2+1)=3, return 3
    "Diameter at each node = leftH + rightH. Update global max bottom-up."
  Steps:
    1. Inner function height(node): returns height, updates maxDiameter as side effect
    2. Base: if !node return 0
    3. leftH = height(left); rightH = height(right)
    4. maxDiameter = Math.max(maxDiameter, leftH + rightH)
    5. Return 1 + Math.max(leftH, rightH)
  Mnemonic: "Diameter at each node = left height + right height. Track the global max."`,
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

class TrieNode {
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

        forEach(word, (c) => {
            // Create a new node if this character path doesn't exist yet
            if (!node.children[c]) {
                node.children[c] = new TrieNode();
            }
            node = node.children[c];
        });

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
        let missing = false;

        forEach(prefix, (c) => {
            if (missing) return; // already hit a dead end
            if (!node.children[c]) {
                missing = true; // path doesn't exist
                return;
            }
            node = node.children[c];
        });

        return missing ? null : node; // return the node at the end of the prefix
    }
}`,
    verification: `Trie.insert:
  Promise: "every character of word is reachable from root along the children map; the final node has isEnd = true"
  Init: node = root, no characters consumed yet — trivially correct ✓
  Maintain:
    What changes? For each character we create the child node if missing, then descend into it.
    Could it break the promise? No — we never skip a character and we always create missing nodes.
    Flip test: what would break it? Moving to node.children[c] before creating it.
      Does the code prevent it? Yes — the creation check 'if (!node.children[c])' happens before descending. ✓
  Terminate: we have consumed every character; node.isEnd = true marks the word boundary ✓

Trie.search:
  Promise: "_find returns the node at the end of the path, or null if any character is missing; search additionally requires isEnd"
  Base case: empty string — _find returns root; search returns root.isEnd ✓
  Inductive step (inside _find): assume _find is correct for prefixes of length k.
    For length k+1: walk one more character; return null if missing.
    The result is correct for the full word ✓
  Why nothing is missed: the distinction between 'prefix exists' and 'word exists' is captured by the isEnd flag ✓

Trie.startsWith:
  Promise: "_find returns non-null if and only if the prefix path exists in the trie"
  Same walk as search, but no isEnd check — a reachable node is sufficient ✓
  Greedy choice: any non-null node returned by _find confirms the prefix.
    Assume wrong: suppose the prefix exists but _find returns null.
    But _find returns null only when a character is missing — contradiction.
    So _find correctly returns a node whenever the prefix was inserted. ✓`,
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

Mnemonic: "Trie = Tree of Characters. Walk char by char."

TEMPLATE-BY-TEMPLATE MEMORIZATION:

TrieNode (constructor) — O(1) per node creation
  Problem: Design a node for a prefix tree (Trie) that stores character-by-character string data.
  Use when: Building a trie to store and search strings.
  Example:
    After insert("app"), insert("apple"):
    root -> a -> p -> p* -> l -> e*   (* = isEnd)
    Each node = one char. Path from root = prefix.
    children tells you where to go; isEnd marks a complete word.
    "Two fields: children (where to go) and isEnd (word stops here)."
  Steps:
    1. children: plain object (char → TrieNode) or Map
    2. isEnd: boolean, false by default
  Mnemonic: "Node = two fields: a door map and a finish flag."

Trie.insert — O(m) time per operation
  Problem: Insert a word into the trie so it can later be searched.
  Use when: "add word to trie", "build trie from words"
  Example:
    insert("cat") into empty trie:
    root: no "c" -> create c-node
    c:    no "a" -> create a-node
    a:    no "t" -> create t-node
    t: set isEnd=true
    path: root -> c -> a -> t*
    "Walk char by char. Missing node? Create it. Mark isEnd at the last char."
  Steps:
    1. node = root
    2. For each char: if !node.children[c] create new TrieNode; node = node.children[c]
    3. node.isEnd = true
  Mnemonic: "Walk and build. Mark the destination."

Trie.search — O(m) time per operation
  Problem: Return true if the given word was previously inserted into the trie.
  Use when: "exact word lookup in trie", "does this word exist?"
  Example:
    Trie has "app" and "apple".
    search("app"):   _find("app") = node* with isEnd=true  -> true
    search("ap"):    _find("ap")  = node  with isEnd=false -> false
    search("apply"): _find hits missing "l" node           -> false
    "Path + isEnd = word. Path alone = just a prefix."
  Steps:
    1. node = _find(word)
    2. Return node !== null && node.isEnd
  Mnemonic: "Find the end node. Word exists only if isEnd is true."

Trie.startsWith — O(m) time per operation
  Problem: Return true if any word in the trie starts with the given prefix.
  Use when: "prefix exists in trie", "autocomplete check"
  Example:
    Trie has "apple".
    startsWith("app"):  _find("app") = non-null -> true
    startsWith("ap"):   _find("ap")  = non-null -> true
    startsWith("xyz"):  _find hits missing "x"  -> null -> false
    "Any non-null return from _find = prefix exists. No isEnd check needed."
  Steps:
    1. node = _find(prefix)
    2. Return node !== null (no isEnd check needed)
  Mnemonic: "Find the end node. Prefix exists if the path exists at all."

Trie._find — O(m) time per operation
  Problem: Walk the trie along the characters of a string; return the final node or null if any character is missing.
  Use when: Internal helper shared by search and startsWith.
  Example:
    Trie has "apple". _find("app"):
    root -> children[a] -> children[p] -> children[p] -> return that node
    _find("apt"):
    root -> a -> p -> children[t]? missing -> return null
    "_find walks and returns the landing node. Caller checks isEnd. Missing link? null."
  Steps:
    1. node = root
    2. For each char: if !node.children[c] return null; node = node.children[c]
    3. Return node
  Mnemonic: "Path broken? Return null. Path complete? Return the node you landed on."`,
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
    const frequency = new Map();
    for (const num of nums) {
        frequency.set(num, (frequency.get(num) || 0) + 1);
    }

    // Step 2: sort entries by frequency descending, take first k
    const sortedEntries = [...frequency.entries()].sort((a, b) => b[1] - a[1]);
    return sortedEntries.slice(0, k).map(([num]) => num);
}`,
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// JavaScript doesn't have a built-in heap.
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
        repeatWhile(
            () => i > 0,
            () => {
                const parent = Math.floor((i - 1) / 2);

                if (this.heap[parent] <= this.heap[i]) {
                    i = 0; // break out of loop
                    return;
                }

                // Swap child with parent
                [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
                i = parent;
            }
        );
    }

    _sinkDown(i) {
        const n = this.heap.length;

        repeatWhile(
            () => i >= 0,
            () => {
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
                    i = -1; // break signal
                    return;
                }

                [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
                i = smallest;
            }
        );
    }
}

// Top K frequent elements (using sort)
function topKFrequent(nums, k) {
    // Step 1: count frequencies
    const frequency = new Map();
    forEach(nums, (num) => {
        frequency.set(num, (frequency.get(num) || 0) + 1);
    });

    // Step 2: sort entries by frequency descending, take first k
    const sortedEntries = [...frequency.entries()].sort((a, b) => b[1] - a[1]);
    return sortedEntries.slice(0, k).map(([num]) => num);
}`,
    verification: `MinHeap (_bubbleUp / push):
  Promise: "heap[0..i-1] satisfies the min-heap property; heap[i] is the newly inserted element being moved up"
  Init: the new element is appended to the end — the rest of the heap is still valid ✓
  Maintain:
    What changes? We compare the element at i with its parent; if the parent is larger we swap and move up.
    Could it break the promise? No — swapping only restores order between a child and its parent; siblings are unaffected.
    Flip test: what would break it? Swapping when the parent is already smaller.
      Does the code prevent it? Yes — we break immediately when 'heap[parent] <= heap[i]'. ✓
  Terminate: i reaches 0 (root) or the parent is already smaller; the heap property holds everywhere ✓

MinHeap (_sinkDown / pop):
  Promise: "heap[0..i-1] and heap[i+1..n-1] satisfy the min-heap property; heap[i] is the element being moved down"
  Init: the last element is placed at index 0 — the rest of the heap is still valid ✓
  Maintain:
    What changes? We find the smallest among the node and its two children; if a child is smaller we swap and descend.
    Could it break the promise? No — swapping with the smallest child restores the local order without violating sibling subtrees.
    Flip test: what would break it? Swapping with a child that is not the smallest (the other child might still be smaller).
      Does the code prevent it? Yes — we find 'smallest' by comparing both children before swapping. ✓
  Terminate: smallest === i means no child is smaller; the heap property holds everywhere ✓

topKFrequent (heap/sort):
  Promise: "frequency correctly maps each number to its count; sortedEntries is ordered by frequency descending"
  Init: frequency is empty before the count loop ✓
  Maintain (count loop): each number's count is incremented atomically; no other entry is touched ✓
  Terminate: sorting by frequency descending and slicing the first k gives exactly the k most frequent elements ✓`,
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
      'frequency: {1:3, 2:2, 3:1}\n' +
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

Mnemonic: "Heap = always know the extreme. Min-heap = smallest on top. Negate for max."

TEMPLATE-BY-TEMPLATE MEMORIZATION:

MinHeap (push) — O(log n) time
  Problem: Insert a value into a min-heap while maintaining the heap property.
  Use when: "insert into heap", "add to priority queue"
  Example:
    heap=[1,3,8], push(2):
    append: [1,3,8,2], i=3, parent=1
    heap[1]=3 > heap[3]=2 -> swap: [1,2,8,3], i=1, parent=0
    heap[0]=1 <= heap[1]=2 -> stop
    result: [1,2,8,3]  (valid min-heap)
    "Append preserves shape. Bubble up restores order. Log n levels max."
  Steps:
    1. heap.push(val)
    2. _bubbleUp(heap.length - 1): while i > 0, compare with parent
    3. If parent > child: swap; i = parent
  Mnemonic: "Push to end, then float up past any bigger parents."

MinHeap (pop) — O(log n) time
  Problem: Remove and return the minimum element from a min-heap while restoring the heap property.
  Use when: "extract minimum", "pop from priority queue"
  Example:
    heap=[1,3,8,5], pop():
    save top=1. move last: heap=[5,3,8], sinkDown(0)
    children: left=3, right=8. smallest=left(3)
    5>3 -> swap: heap=[3,5,8]
    no smaller children -> done
    return 1
    "Root=min. Swap with last, shrink, sink the new root to restore order."
  Steps:
    1. Save top = heap[0]
    2. Move last element to heap[0], _sinkDown(0)
    3. Sink: find smallest among node and its two children; swap if needed; repeat
    4. Return top
  Mnemonic: "Swap root with last, shrink, then sink the new root down."

topKFrequent (heap) — O(n log n) time
  Problem: Given an array of integers and k, return the k most frequently occurring elements.
  Use when: "k most frequent", "top k by frequency" (heap/sort variant)
  Example:
    nums=[1,1,1,2,2,3], k=2
    frequency: {1:3, 2:2, 3:1}
    entries sorted desc: [[1,3],[2,2],[3,1]]
    slice(0,2): [[1,3],[2,2]]
    map to nums: [1, 2]
    "Count frequencies, sort by freq descending, take first k."
  Steps:
    1. Build count map
    2. [...count.entries()].sort((a, b) => b[1] - a[1])
    3. slice(0, k).map(([num]) => num)
  Mnemonic: "Count, sort by frequency descending, slice the top k."`,
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Subsets
function subsets(nums) {
    const result = [];

    function backtrack(start, path) {
        // Add a snapshot of current path as a valid subset (including empty)
        result.push([...path]);

        forEachStartingAt(start, nums, (_, i) => {
            path.push(nums[i]);       // CHOOSE
            backtrack(i + 1, path);  // EXPLORE (i+1 prevents reuse)
            path.pop();               // UNCHOOSE
        });
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

        forEach(nums, (_, i) => {
            if (used[i]) {
                return; // Skip already-used elements
            }

            used[i] = true;
            path.push(nums[i]);  // CHOOSE
            backtrack(path);      // EXPLORE
            path.pop();           // UNCHOOSE
            used[i] = false;
        });
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

        forEachStartingAt(start, candidates, (_, i) => {
            path.push(candidates[i]);

            // Pass i (not i+1) to allow reusing the same element
            backtrack(i, path, remaining - candidates[i]);

            path.pop(); // UNCHOOSE
        });
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

        forEachBetween(0, n, (col) => {
            // Check if this position is under attack
            if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
                return;
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
        });
    }

    const board = Array.from({ length: n }, () => new Array(n).fill('.'));
    backtrack(0, board);
    return result;
}`,
    verification: `subsets:
  Promise: "result contains exactly all subsets of nums[0..start-1] extended by the current path"
  Base case: backtrack(0, []) — the only subset of the empty prefix is [], which is pushed immediately ✓
  Inductive step: assume all subsets for indices 0..start-1 with path already chosen are in result.
    For each i from start: push nums[i], recurse to record all subsets containing this choice, then pop.
    We cover every include/exclude decision at each position ✓
  Why nothing is missed: every subset corresponds to a unique path in the decision tree; i+1 prevents duplicate indices ✓

permute:
  Promise: "result contains exactly all permutations of nums using elements not yet marked in used[]"
  Base case: path.length === nums.length — a complete permutation is pushed ✓
  Inductive step: assume all permutations for path of length k are correct.
    For length k+1: try every unused element, mark it used, recurse, then unmark.
    We explore every possible next element ✓
  Why nothing is missed: used[] ensures each element appears exactly once per permutation; iterating all indices covers all choices ✓

combinationSum:
  Promise: "result contains all combinations from candidates[start..] that sum to remaining"
  Base case: remaining === 0 — a valid combination is found and pushed ✓
  Inductive step: assume the recursive call is correct for smaller remaining.
    For each candidate from start: add it (reducing remaining), recurse (allowing reuse via same i), pop.
    We check both using and not using each candidate ✓
  Why nothing is missed: passing i (not i+1) allows unlimited reuse; pruning remaining < 0 eliminates overshoots ✓

solveNQueens:
  Promise: "for the current row, all valid column placements are tried; cols/diag1/diag2 track attacked positions exactly"
  Base case: row === n — all n rows have a queen; the configuration is valid and stored ✓
  Inductive step: assume previous rows are placed validly.
    For each column not attacked: place queen (update sets and board), recurse to next row, then remove queen.
    We try all valid columns and undo every placement ✓
  Why nothing is missed: the three sets together cover all attack directions; the loop tries every column in each row ✓`,
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

Mnemonic: "CEO" - Choose, Explore, unchoOse

TEMPLATE-BY-TEMPLATE MEMORIZATION:

subsets — O(2^n) time
  Problem: Given an integer array with unique elements, return all possible subsets (the power set).
  Use when: "all subsets", "power set", "every possible combination"
  Example:
    nums=[1,2,3]
    backtrack(0,[])  -> push []
      choose 1: backtrack(1,[1]) -> push [1]
        choose 2: backtrack(2,[1,2]) -> push [1,2]
          choose 3: push [1,2,3]
        choose 3: push [1,3]
      choose 2: push [2], push [2,3]
      choose 3: push [3]
    result: [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]
    "Record at every node, not just leaves. i+1 prevents reuse."
  Steps:
    1. backtrack(start, path): immediately push [...path]
    2. Loop i from start to end: push nums[i], recurse(i+1), pop
  Mnemonic: "Record before choosing. i+1 prevents reuse."

permute — O(n!) time
  Problem: Given an array of distinct integers, return all possible permutations.
  Use when: "all permutations", "every ordering", "arrange elements"
  Example:
    nums=[1,2,3]
    pos 0: try 1 -> pos 1: try 2 -> pos 2: try 3 -> [1,2,3] done
                           try 3 -> pos 2: try 2 -> [1,3,2] done
           try 2 -> ...   gives [2,1,3], [2,3,1]
           try 3 -> ...   gives [3,1,2], [3,2,1]
    "Try every unused element at each slot. used[] prevents repeats."
  Steps:
    1. Base: if path.length === nums.length → push copy
    2. Loop all i: skip if used[i]; set used[i]=true, push, recurse, pop, used[i]=false
  Mnemonic: "Try every unused element at each position. Undo when done."

combinationSum — O(n^(t/m)) time where t=target, m=min candidate
  Problem: Given an array of distinct candidates and a target, return all unique combinations that sum to the target (candidates may be reused).
  Use when: "combination sum", "sum to target with reuse allowed", "unlimited use of candidates"
  Example:
    candidates=[2,3,6,7], target=7
    choose 2 -> remaining=5
      choose 2 -> remaining=3
        choose 2 -> remaining=1  (all candidates > 1, prune)
        choose 3 -> remaining=0 -> push [2,2,3]
    choose 7 -> remaining=0 -> push [7]
    result: [[2,2,3],[7]]
    "Pass i (not i+1) to allow reuse. Prune when remaining goes negative."
  Steps:
    1. Base: remaining === 0 → push copy
    2. Loop i from start: push candidate, recurse(i, remaining - candidate), pop
    3. Pass i (not i+1) to allow reuse; prune if remaining < 0
  Mnemonic: "Reuse allowed: pass same i. Prune when overshot."

solveNQueens — O(n!) time
  Problem: Place n queens on an n×n chessboard so that no two queens attack each other. Return all valid arrangements.
  Use when: "n-queens", "place queens", "no two queens attack"
  Example:
    n=4: valid placement at cols [1,3,0,2]
    row=0, col=1: cols={1}, diag1={-1}, diag2={1}
    row=1, col=3: cols={1,3}, diag1={-2}, diag2={4}
    row=2, col=0: col 0 free, diag1=2-0=2 free, diag2=2+0=2 free -> place
    row=3, col=2: all sets clear -> final row -> push board
    "One queen per row. Three O(1) sets guard columns and both diagonals."
  Steps:
    1. For each row, try each col: skip if col/diag1/diag2 is taken
    2. Place queen: add to all three sets, board[row][col]='Q'
    3. Recurse(row+1); if row===n → push board snapshot
    4. Remove queen: board[row][col]='.', delete from all three sets
  Mnemonic: "Three sets guard columns and both diagonals. Place, recurse, undo."`,
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
    const inDegree = new Array(numCourses).fill(0); // inDegree[i] = number of prerequisites for node i

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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// BFS - number of islands (grid)
function numIslands(grid) {
    if (!grid.length) {
        return 0;
    }

    const rows = grid.length;
    const cols = grid[0].length;
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    let count = 0;

    forEachBetween(0, rows, (r) => {
        forEachBetween(0, cols, (c) => {
            if (grid[r][c] === '1') {
                count++;

                // BFS to mark all connected land cells as visited
                const queue = [[r, c]];
                grid[r][c] = '0'; // Mark visited by overwriting

                repeatWhile(
                    () => queue.length > 0,
                    () => {
                        const [row, col] = queue.shift();

                        forEach(directions, ([dr, dc]) => {
                            const nr = row + dr;
                            const nc = col + dc;

                            const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
                            if (inBounds && grid[nr][nc] === '1') {
                                grid[nr][nc] = '0'; // Mark before enqueuing
                                queue.push([nr, nc]);
                            }
                        });
                    }
                );
            }
        });
    });
    return count;
}

// Topological sort (Kahn's algorithm)
function topologicalSort(numCourses, prerequisites) {
    // Build adjacency list and in-degree array
    const graph = Array.from({ length: numCourses }, () => []);
    const inDegree = new Array(numCourses).fill(0); // inDegree[i] = number of prerequisites for node i

    forEach(prerequisites, ([course, prereq]) => {
        graph[prereq].push(course);
        inDegree[course]++;
    });

    // Start with all nodes that have no prerequisites
    const queue = [];
    forEachBetween(0, numCourses, (i) => {
        if (inDegree[i] === 0) {
            queue.push(i);
        }
    });

    const order = [];
    repeatWhile(
        () => queue.length > 0,
        () => {
            const node = queue.shift();
            order.push(node);

            // Reduce in-degree of neighbors; enqueue if they become free
            forEach(graph[node], (neighbor) => {
                inDegree[neighbor]--;
                if (inDegree[neighbor] === 0) {
                    queue.push(neighbor);
                }
            });
        }
    );

    // If we processed all courses, no cycle exists
    return order.length === numCourses ? order : [];
}

// Dijkstra's shortest path
function networkDelay(times, n, k) {
    // Build adjacency list: node -> [[neighbor, weight], ...]
    const graph = new Map();
    forEach(times, ([u, v, w]) => {
        if (!graph.has(u)) {
            graph.set(u, []);
        }
        graph.get(u).push([v, w]);
    });

    const dist = new Map([[k, 0]]);

    // Simple priority queue: sorted array of [distance, node]
    // (In production, use a proper MinHeap for O(log n) pop)
    const heap = [[0, k]];

    repeatWhile(
        () => heap.length > 0,
        () => {
            heap.sort((a, b) => a[0] - b[0]);
            const [d, node] = heap.shift();

            // Stale entry — we already found a shorter path
            if (d > (dist.get(node) ?? Infinity)) {
                return;
            }

            forEach(graph.get(node) || [], ([neighbor, weight]) => {
                const newDist = d + weight;
                if (newDist < (dist.get(neighbor) ?? Infinity)) {
                    dist.set(neighbor, newDist);
                    heap.push([newDist, neighbor]);
                }
            });
        }
    );

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
    forEachBetween(0, rows, (r) => {
        forEachBetween(0, cols, (c) => {
            if (grid[r][c] === 2) {
                queue.push([r, c]);
            } else if (grid[r][c] === 1) {
                freshCount = freshCount + 1;
            }
        });
    });

    let minutes = 0;
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    // BFS level by level (each level = 1 minute)
    repeatWhile(
        () => queue.length > 0 && freshCount > 0,
        () => {
            const levelSize = queue.length;

            forEachBetween(0, levelSize, () => {
                const [row, col] = queue.shift();

                forEach(directions, ([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    const inBounds = newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols;

                    if (inBounds && grid[newRow][newCol] === 1) {
                        grid[newRow][newCol] = 2;
                        freshCount = freshCount - 1;
                        queue.push([newRow, newCol]);
                    }
                });
            });

            minutes = minutes + 1;
        }
    );

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
        forEach(original.neighbors, (neighbor) => {
            const clonedNeighbor = dfs(neighbor);
            clone.neighbors.push(clonedNeighbor);
        });

        return clone;
    }

    return dfs(node);
}`,
    verification: `numIslands:
  Promise: "every '1' reachable from any previously found island is overwritten to '0'; count = islands found so far"
  Init: count = 0, grid unchanged ✓
  Maintain:
    What changes? When a '1' is found, count++ then BFS marks all connected '1' cells as '0'.
    Could it break the promise? No — cells are marked before enqueuing, so no cell enters the queue twice.
    Flip test: what would break it? Marking after dequeuing (same cell pushed multiple times from different directions).
      Does the code prevent it? Yes — grid[nr][nc] = '0' before queue.push. ✓
  Terminate: all cells scanned; count is the number of islands ✓

topologicalSort:
  Promise: "order holds all nodes whose prerequisites are satisfied; inDegree reflects remaining prerequisites"
  Init: all zero-in-degree nodes seeded ✓
  Maintain:
    What changes? Dequeue node, append to order, decrement each neighbor; enqueue if in-degree hits 0.
    Could it break the promise? No — each edge decrements in-degree exactly once.
    Flip test: what would break it? Enqueueing before decrementing.
      Does the code prevent it? Yes — the '=== 0' check follows the decrement. ✓
  Terminate: queue empty; length check detects cycles ✓

networkDelay (Dijkstra):
  Promise: "dist[v] = shortest known distance from k to v; stale entries identified by d > dist[node]"
  Init: dist = {k: 0}, heap = [[0, k]] ✓
  Maintain:
    What changes? Pop minimum; skip if stale; relax outgoing edges.
    Could it break the promise? No — dist[neighbor] updates only when strictly shorter.
    Flip test: what would break it? Not skipping stale entries.
      Does the code prevent it? Yes — d > dist.get(node) triggers a skip. ✓
  Terminate: heap empty; max(dist.values()) is the answer ✓

orangesRotting:
  Promise: "each BFS level = one minute; freshCount tracks remaining fresh oranges"
  Init: all rotten oranges seeded; freshCount correct ✓
  Maintain:
    What changes? Process one full level then increment minutes.
    Could it break the promise? No — snapshotting levelSize separates minute boundaries.
    Flip test: what would break it? Not snapshotting (newly rotted oranges processed in current minute).
      Does the code prevent it? Yes — levelSize captured before any processing. ✓
  Terminate: freshCount === 0 returns minutes; else -1 ✓

cloneGraph:
  Promise: "visited maps every seen original node to its unique clone; all neighbor edges replicated"
  Init: visited empty ✓
  Maintain:
    What changes? First visit: create clone, store in visited immediately, then recurse neighbors.
    Could it break the promise? No — storing before recursing prevents infinite loops on cycles.
    Flip test: what would break it? Recursing before storing.
      Does the code prevent it? Yes — visited.set(original, clone) before the neighbor loop. ✓
  Terminate: all reachable nodes cloned with all edges; root's clone returned ✓`,
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
  dirs = [(0,1),(0,-1),(1,0),(-1,0)]

MULTI-SOURCE BFS (Rotting Oranges):
  "Start BFS from ALL sources at once, not just one."
  1. Collect all starting points into the queue
  2. BFS level by level (each level = 1 time unit)
  3. Count remaining unvisited targets
  Mnemonic: "Fire spreads from ALL flames simultaneously."

CLONE GRAPH:
  "HashMap = translation table from old → new."
  DFS/BFS: visit each node, create its clone, store in map.
  When wiring neighbors, look up the clone in the map.
  Mnemonic: "Copy the person, then copy their contacts."

TEMPLATE-BY-TEMPLATE MEMORIZATION:

numIslands — O(m×n) time
  Problem: Given a 2D grid of '1's (land) and '0's (water), count the number of islands.
  Use when: "number of islands", "count connected components in grid", "flood fill"
  Example:
    grid: [[1,1,0],
           [1,0,0],
           [0,0,1]]
    r=0,c=0: "1" -> count=1, BFS floods (0,0),(0,1),(1,0) to "0"
    r=2,c=2: "1" -> count=2, BFS floods (2,2) to "0"
    return 2
    "Found land? count++, BFS flood-fills the island to 0."
  Steps:
    1. Scan grid; when '1' found: count++, BFS from that cell
    2. BFS: queue = [[r,c]], mark cell '0'; pop cell, check 4 neighbors, mark & enqueue '1' neighbors
  Mnemonic: "Found land? Count it and flood-fill it to '0'."

topologicalSort (Kahn's) — O(V+E) time
  Problem: Given n courses and a list of prerequisites, return a valid course order, or empty if a cycle makes it impossible.
  Use when: "course schedule", "build order", "dependency resolution", "topological order"
  Example:
    4 courses: 0->1, 0->2, 1->3, 2->3
    inDegree: [0,1,1,2]  queue=[0]
    pop 0: order=[0], reduce 1,2: inDegree=[0,0,0,2] -> enqueue 1,2
    pop 1: order=[0,1], reduce 3: inDegree[3]=1
    pop 2: order=[0,1,2], reduce 3: inDegree[3]=0 -> enqueue 3
    pop 3: order=[0,1,2,3]. length=4=numCourses -> valid!
    "Remove 0-in-degree nodes first. Each removal may free more."
  Steps:
    1. Build graph and inDegree from edges
    2. Seed queue with all nodes where inDegree === 0
    3. Pop node → add to order → for each neighbor: inDegree[neighbor]--; if 0 → enqueue
    4. If order.length !== numNodes → cycle exists
  Mnemonic: "Peel nodes with no dependencies, ripple the reduction through their neighbors."

networkDelay (Dijkstra) — O((V+E) log V) time
  Problem: Given n network nodes, directed weighted edges, and a source node k, return the minimum time for all nodes to receive a signal, or -1 if unreachable.
  Use when: "shortest path weighted graph", "Dijkstra", "minimum cost to reach all nodes"
  Example:
    nodes=4, edges: 2->1(1), 2->3(1), 3->4(1), source=2
    dist={2:0}, heap=[[0,2]]
    pop [0,2]: neighbors 1(d=1),3(d=1) -> heap=[[1,1],[1,3]]
    pop [1,1]: no neighbors
    pop [1,3]: neighbor 4(d=2)         -> heap=[[2,4]]
    pop [2,4]: done. dist={2:0,1:1,3:1,4:2}
    return max=2 (time for signal to reach all nodes)
    "Always extend cheapest known path. Stale entries skipped."
  Steps:
    1. dist = {k: 0}; heap = [[0, k]]
    2. Pop [d, node]; if d > dist[node] → stale, skip
    3. For each [neighbor, weight]: newDist = d + weight; if newDist < dist[neighbor] → update and push
    4. Return max(dist.values()) if all nodes reached, else -1
  Mnemonic: "Greedy BFS with a heap. Always extend the shortest known path."

orangesRotting (multi-source BFS) — O(m×n) time
  Problem: Given a grid of fresh (1) and rotten (2) oranges, find the minimum minutes until all oranges are rotten, or -1 if impossible.
  Use when: "rotting oranges", "multi-source BFS", "spread from multiple starting points"
  Example:
    grid: [[2,1,1],[1,1,0],[0,1,1]], freshCount=6
    queue=[(0,0)]
    min 1: spread to (0,1),(1,0) -> freshCount=4, queue=[(0,1),(1,0)]
    min 2: spread to (0,2),(1,1) -> freshCount=2
    min 3: spread to (2,1)       -> freshCount=1
    min 4: spread to (2,2)       -> freshCount=0
    "Seed ALL rotten oranges at once. Each BFS wave = 1 minute."
  Steps:
    1. Collect all rotten cells into queue; count fresh cells
    2. BFS level by level (each level = 1 minute): spread rot to fresh neighbors
    3. Return minutes if freshCount === 0, else -1
  Mnemonic: "All fires burn simultaneously. Count waves until nothing fresh remains."

cloneGraph — O(V+E) time
  Problem: Given a reference to a node in a connected undirected graph, return a deep copy of the entire graph.
  Use when: "clone graph", "deep copy graph", "duplicate node structure"
  Example:
    graph: 1--2--3--4--1 (cycle)
    dfs(1): not seen -> clone1, visited={1:c1}
      dfs(2): not seen -> clone2, visited+={2:c2}
        dfs(1): already seen -> return clone1
        dfs(3): clone3, recurse...
    visited map doubles as cycle guard AND clone registry.
    "Check map first (prevents cycles). Clone node, recurse neighbors, wire them up."
  Steps:
    1. DFS(node): if in visited → return clone; else create clone, store in visited
    2. For each neighbor: cloneNeighbor = dfs(neighbor); clone.neighbors.push(cloneNeighbor)
    3. Return clone
  Mnemonic: "Check visited first. Clone node, then clone its connections via recursion."`,
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
// dp with two variables: best from 2-back and 1-back
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
                const usingThisCoin = dp[i - coin] + 1;
                dp[i] = Math.min(dp[i], usingThisCoin);
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// 1D DP - House Robber
// dp[i] = max money we can rob from houses 0..i
// dp with two variables: best from 2-back and 1-back
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

    forEachStartingAt(2, nums, (_, i) => {
        // Either skip house i (take dp[i-1]) or rob it (take dp[i-2] + nums[i])
        const skipHouse = dp[i - 1];
        const robHouse = dp[i - 2] + nums[i];
        dp[i] = Math.max(skipHouse, robHouse);
    });
    return dp[nums.length - 1];
}

// 2D DP - Longest Common Subsequence
// dp[i][j] = LCS length of text1[0..i-1] and text2[0..j-1]
function longestCommonSubsequence(text1, text2) {
    const m = text1.length;
    const n = text2.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    forEachBetween(1, m + 1, (i) => {
        forEachBetween(1, n + 1, (j) => {
            if (text1[i - 1] === text2[j - 1]) {
                // Characters match: extend from diagonal
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                // Take best by skipping one char
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        });
    });
    return dp[m][n];
}

// Knapsack - Coin Change (unbounded: coins can be reused)
// dp[i] = minimum coins to make amount i
function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0; // 0 coins needed for amount 0

    forEachBetween(1, amount + 1, (i) => {
        forEach(coins, (coin) => {
            if (coin <= i) {
                const usingThisCoin = dp[i - coin] + 1;
                dp[i] = Math.min(dp[i], usingThisCoin);
            }
        });
    });
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

    forEach(nums, (num) => {
        // Iterate BACKWARDS to prevent reusing the same num in one pass
        forEachFromRight(dp, (_, j) => {
            if (j >= num) {
                dp[j] = dp[j] || dp[j - num];
            }
        });
    });
    return dp[target];
}

// Kadane's Algorithm - Maximum Subarray Sum
function maxSubArray(nums) {
    let currentSum = 0;
    let maxSum = nums[0];

    forEach(nums, (num) => {
        // If running sum is negative, start fresh
        if (currentSum < 0) {
            currentSum = 0;
        }

        currentSum = currentSum + num;

        // Track the best sum found so far
        if (currentSum > maxSum) {
            maxSum = currentSum;
        }
    });

    return maxSum;
}

// Edit Distance (2D DP)
function minDistance(word1, word2) {
    const m = word1.length;
    const n = word2.length;

    // dp[i][j] = min edits to convert word1[0..i-1] to word2[0..j-1]
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    // Base cases: converting to/from empty string
    forEachBetween(0, m + 1, (i) => { dp[i][0] = i; });
    forEachBetween(0, n + 1, (j) => { dp[0][j] = j; });

    forEachBetween(1, m + 1, (i) => {
        forEachBetween(1, n + 1, (j) => {
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
        });
    });

    return dp[m][n];
}

// Longest Increasing Subsequence (Binary Search O(n log n))
function lengthOfLIS(nums) {
    // tails[i] = smallest tail element for increasing subsequence of length i+1
    const tails = [];

    forEach(nums, (num) => {
        // Binary search for where num should go
        let lo = 0;
        let hi = tails.length;
        repeatWhile(
            () => lo < hi,
            () => {
                const mid = Math.floor((lo + hi) / 2);
                if (tails[mid] < num) {
                    lo = mid + 1;
                } else {
                    hi = mid;
                }
            }
        );

        // Replace or extend
        tails[lo] = num;
    });

    // Length of tails = length of LIS
    return tails.length;
}

// Buy/Sell Stock with State Machine (Cooldown)
function maxProfit(prices) {
    // Three states: hold (own stock), sold (just sold), rest (cooldown/no stock)
    let hold = -Infinity;   // max profit while holding stock
    let sold = 0;           // max profit on day we just sold
    let rest = 0;           // max profit while resting (no stock, not just sold)

    forEach(prices, (price) => {
        const prevHold = hold;
        const prevSold = sold;
        const prevRest = rest;

        // Today I hold: either I held before, or I bought today (from rest)
        hold = Math.max(prevHold, prevRest - price);
        // Today I sold: I must have held before
        sold = prevHold + price;
        // Today I rest: I either rested before, or I was in cooldown (just sold)
        rest = Math.max(prevRest, prevSold);
    });

    return Math.max(sold, rest);
}`,
    verification: `rob:
  Promise: "dp[i] = maximum money robbable from houses 0..i"
  Base case: dp[0] = nums[0]; dp[1] = max(nums[0], nums[1]) ✓
  Inductive step: assume dp[0..i-1] correct. Skip house i (dp[i-1]) or rob it (dp[i-2] + nums[i]). Take max ✓
  Why nothing is missed: every valid plan either includes or excludes house i ✓

longestCommonSubsequence:
  Promise: "dp[i][j] = LCS length of text1[0..i-1] and text2[0..j-1]"
  Base case: dp[0][j] = dp[i][0] = 0 ✓
  Inductive step: chars match: dp[i-1][j-1] + 1; mismatch: max(dp[i-1][j], dp[i][j-1]) ✓
  Why nothing is missed: every LCS ends with a match or skips a char from one side ✓

coinChange:
  Promise: "dp[i] = minimum coins for amount i"
  Base case: dp[0] = 0 ✓
  Inductive step: for each coin c <= i: dp[i] = min(dp[i], dp[i-c] + 1) ✓
  Why nothing is missed: every valid combination uses some last coin ✓

canPartition:
  Promise: "dp[j] = true if some subset of processed nums sums to j"
  Base case: dp[0] = true ✓
  Inductive step: iterate j backwards; dp[j] |= dp[j - num]. Backwards prevents reusing num (0/1 knapsack) ✓
  Why nothing is missed: each num is either included or excluded ✓

maxSubArray (Kadane's):
  Promise: "currentSum = max subarray sum ending at current position; maxSum = global best"
  Init: currentSum = 0, maxSum = nums[0] ✓
  Maintain:
    What changes? Reset currentSum to 0 if negative, add current num, update maxSum.
    Flip test: not resetting allows a negative prefix to drag down subsequent sums.
      Does the code prevent it? Yes — explicit reset when currentSum < 0. ✓
  Terminate: maxSum is the answer ✓

minDistance (edit distance):
  Promise: "dp[i][j] = minimum edits to convert word1[0..i-1] to word2[0..j-1]"
  Base case: dp[i][0] = i; dp[0][j] = j ✓
  Inductive step: match: dp[i-1][j-1]; mismatch: 1 + min(dp[i][j-1], dp[i-1][j], dp[i-1][j-1]) ✓
  Why nothing is missed: every edit sequence ends with insert, delete, or replace ✓

lengthOfLIS:
  Promise: "tails[k] = smallest tail of any IS of length k+1 seen so far"
  Base case: tails empty ✓
  Inductive step: binary search places num at leftmost position where tails[lo] >= num; replace (or extend). tails.length = LIS length ✓
  Why nothing is missed: every num either extends the longest IS or improves an existing tail ✓

maxProfit (state machine):
  Promise: "hold/sold/rest = max profit in each state after prices processed so far"
  Init: hold = -Infinity, sold = rest = 0 ✓
  Maintain:
    What changes? All three states computed from previous-day values (snapshotted).
    Flip test: updating hold before computing sold would use today's hold instead of yesterday's.
      Does the code prevent it? Yes — prevHold/prevSold/prevRest captured before any update. ✓
  Terminate: max(sold, rest) after all prices ✓`,
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
  Unbounded (reuse items): inner loop goes FORWARD

KADANE'S ALGORITHM (Maximum Subarray):
  "Negative sum? Start fresh. Always track the best."
  if curSum < 0: curSum = 0
  curSum += num
  maxSum = max(maxSum, curSum)

EDIT DISTANCE:
  "Match? Diagonal free. Mismatch? 1 + min(insert, delete, replace)"
  insert = dp[i][j-1], delete = dp[i-1][j], replace = dp[i-1][j-1]
  Base cases: dp[i][0] = i (delete all), dp[0][j] = j (insert all)

LONGEST INCREASING SUBSEQUENCE (O(n log n)):
  "Patience sorting: maintain smallest possible tails."
  tails[i] = smallest ending value for IS of length i+1
  Binary search where each num goes. Length of tails = LIS length.
  Mnemonic: "Card game — place on leftmost valid pile, or start new pile."

BUY/SELL STOCK STATE MACHINE:
  Three states: hold, sold, rest
  hold = max(prevHold, prevRest - price)  — keep holding or buy from rest
  sold = prevHold + price                  — sell what we hold
  rest = max(prevRest, prevSold)           — stay resting or cooldown from sold
  Mnemonic: "Hold/Sold/Rest — each day pick the best transition."

TEMPLATE-BY-TEMPLATE MEMORIZATION:

rob — O(n) time, O(1) space
  Problem: Given an array of non-negative integers representing house values, find the maximum amount you can rob without robbing two adjacent houses.
  Use when: "house robber", "no adjacent elements", "maximum sum no two adjacent"
  Example:
    nums = [2, 7, 9, 3, 1]
    dp[0]=2, dp[1]=max(2,7)=7
    i=2: max(skip=7, rob=2+9=11) = 11
    i=3: max(skip=11, rob=7+3=10) = 11
    i=4: max(skip=11, rob=11+1=12) = 12
    return 12  (rob houses 0,2,4: 2+9+1=12)
    "At each house: skip (carry prev) or rob (prev-prev + value)."
  Steps:
    1. dp[0] = nums[0]; dp[1] = max(nums[0], nums[1])
    2. dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    3. Return dp[n-1]
  Mnemonic: "Skip or rob. Take the better of skipping this house or robbing it plus two-back."

longestCommonSubsequence — O(m×n) time
  Problem: Given two strings, return the length of their longest common subsequence.
  Use when: "longest common subsequence", "LCS", "common subsequence of two strings"
  Example:
    text1="ace", text2="abcde"
         ""  a  b  c  d  e
    ""  [  0  0  0  0  0  0 ]
    a   [  0  1  1  1  1  1 ]
    c   [  0  1  1  2  2  2 ]
    e   [  0  1  1  2  2  3 ]
    dp[1][1]: a==a -> dp[0][0]+1=1  (diagonal)
    dp[3][5]: e==e -> dp[2][4]+1=3
    "Match? Diagonal+1. Miss? max of left or above."
  Steps:
    1. dp[i][j] = 0 for all base cases
    2. If text1[i-1] === text2[j-1]: dp[i][j] = dp[i-1][j-1] + 1
    3. Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    4. Return dp[m][n]
  Mnemonic: "Match? Diagonal + 1. Miss? Best of skipping either character."

coinChange — O(n×amount) time
  Problem: Given coin denominations and a target amount, return the minimum number of coins needed to make the amount, or -1 if impossible.
  Use when: "minimum coins", "fewest coins to make change", "unbounded knapsack"
  Example:
    coins=[1,5,6,9], amount=11
    dp=[0,inf,inf,...,inf] (size 12)
    i=5: coin=5 -> dp[5]=dp[0]+1=1
    i=6: coin=6 -> dp[6]=1; coin=1 -> dp[6]=min(1,dp[5]+1)=1
    i=10: coin=5 -> dp[10]=dp[5]+1=2
    i=11: coin=5 -> dp[11]=dp[6]+1=2; coin=6 -> min(2,dp[5]+1)=2
    return 2  (coins: 5+6=11)
    "dp[i] = cheapest way to reach amount i, built from smaller amounts."
  Steps:
    1. dp[0] = 0
    2. For each amount i: for each coin: if coin <= i → dp[i] = min(dp[i], dp[i-coin] + 1)
    3. Return dp[amount] === Infinity ? -1 : dp[amount]
  Mnemonic: "Build up from 0. Each amount = cheapest way to reach it using any coin."

canPartition — O(n×sum) time
  Problem: Given an integer array, determine if it can be partitioned into two subsets with equal sums.
  Use when: "partition equal subset sum", "split array into two equal halves", "0/1 knapsack"
  Example:
    nums=[1,5,11,5], total=22, target=11
    dp=[T,F,F,...,F] (size 12)
    num=1:  j=1: dp[1] = dp[0]=T
    num=5:  j=6: dp[6]=dp[1]=T; j=5: dp[5]=dp[0]=T
    num=11: j=11: dp[11]=dp[0]=T -> found!
    return true (subset [11] sums to 11)
    "Backward loop = each num used at most once (0/1). Forward = reuse (unbounded)."
  Steps:
    1. If total is odd → false; target = total / 2
    2. dp[0] = true; for each num: iterate j backwards from target to num
    3. dp[j] = dp[j] || dp[j - num]
    4. Return dp[target]
  Mnemonic: "0/1 knapsack goes BACKWARD to prevent reuse. Can I reach the target?"

maxSubArray (Kadane's) — O(n) time, O(1) space
  Problem: Given an integer array, find the contiguous subarray with the largest sum and return its sum.
  Use when: "maximum subarray sum", "Kadane's algorithm", "max contiguous sum"
  Example:
    nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
    curr: 0  1  -2  4   3   5  6   1  5
    max:  0  1   1  4   4   5  6   6  6
    When curr goes negative after -2: reset to 0, fresh start at 4.
    "Negative running sum? Restart. The positive portion after is always better alone."
  Steps:
    1. If currentSum < 0: reset to 0
    2. currentSum += num
    3. maxSum = max(maxSum, currentSum)
  Mnemonic: "Negative running sum? Restart. Always track the best seen so far."

minDistance (edit distance) — O(m×n) time
  Problem: Given two strings, return the minimum number of operations (insert, delete, replace) to convert word1 to word2.
  Use when: "edit distance", "minimum operations to convert strings", "Levenshtein distance"
  Example:
    word1="cat", word2="cut"
         ""  c  u  t
    ""  [  0  1  2  3 ]
    c   [  1  0  1  2 ]
    a   [  2  1  1  2 ]
    t   [  3  2  2  1 ]
    dp[2][2]: a!=u -> 1+min(dp[1][2]=1, dp[2][1]=1, dp[1][1]=0) = 1 (replace)
    return dp[3][3]=1 (replace a->u)
    "Match=diagonal free. Mismatch=1+min(insert,delete,replace)."
  Steps:
    1. dp[i][0] = i (delete all of word1); dp[0][j] = j (insert all of word2)
    2. If chars match: dp[i][j] = dp[i-1][j-1]
    3. Else: dp[i][j] = 1 + min(dp[i][j-1], dp[i-1][j], dp[i-1][j-1]) — insert, delete, replace
    4. Return dp[m][n]
  Mnemonic: "Match = diagonal free. Mismatch = 1 + min of three neighbors."

lengthOfLIS — O(n log n) time
  Problem: Given an integer array, return the length of the longest strictly increasing subsequence.
  Use when: "longest increasing subsequence", "LIS", "longest non-decreasing subsequence"
  Example:
    nums = [3, 1, 4, 2, 5]
    3:  tails=[3]
    1:  binary search: 3>=1, replace tails[0]=1: tails=[1]
    4:  binary search: no tail>=4, extend:        tails=[1,4]
    2:  binary search: 4>=2, replace tails[1]=2: tails=[1,2]
    5:  binary search: no tail>=5, extend:        tails=[1,2,5]
    "tails = smallest possible tail per length. Length of tails = LIS length."
  Steps:
    1. For each num: binary search in tails for first element >= num (lo < hi template)
    2. tails[lo] = num (replace or extend)
    3. Return tails.length
  Mnemonic: "Patience sort — place on leftmost valid pile, or start a new pile."

maxProfit (state machine with cooldown) — O(n) time, O(1) space
  Problem: Given stock prices with a mandatory 1-day cooldown after selling, find the maximum profit.
  Use when: "stock with cooldown", "state machine DP", "buy sell with rest period"
  Example:
    prices=[1,2,3,0,2]
    hold=-inf, sold=0, rest=0
    p=1: hold=max(-inf,0-1)=-1, sold=-inf+1=-inf, rest=max(0,0)=0
    p=2: hold=max(-1,0-2)=-1,   sold=-1+2=1,      rest=max(0,-inf)=0
    p=3: hold=max(-1,0-3)=-1,   sold=-1+3=2,      rest=max(0,1)=1
    p=0: hold=max(-1,1-0)=1,    sold=-1+0=-1,     rest=max(1,2)=2
    p=2: hold=max(1,2-2)=1,     sold=1+2=3,       rest=max(2,-1)=2
    return max(sold=3, rest=2) = 3
    "Three states. Each day pick: hold/buy, sell, or rest."
  Steps:
    1. hold = -Infinity, sold = 0, rest = 0
    2. Each day: newHold = max(hold, rest - price); newSold = hold + price; newRest = max(rest, sold)
    3. Assign all three new values simultaneously
    4. Return max(sold, rest)
  Mnemonic: "Three buckets. Each day: can I buy (from rest), sell (from hold), or just rest?"`,
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Jump Game - can reach end?
function canJump(nums) {
    let farthest = 0; // farthest index we can reach so far
    let stuck = false;

    forEach(nums, (_, i) => {
        if (stuck) return; // already determined unreachable
        // If current index exceeds farthest reachable, we're stuck
        if (i > farthest) {
            stuck = true;
            return;
        }

        // Update farthest reachable position
        farthest = Math.max(farthest, i + nums[i]);
    });
    return !stuck;
}

// Non-overlapping intervals (min removals)
function eraseOverlapIntervals(intervals) {
    // Sort by end time: greedily keep intervals that end earliest
    intervals.sort((a, b) => a[1] - b[1]);

    let count = 0;
    let end = -Infinity; // end time of the last kept interval

    forEach(intervals, ([s, e]) => {
        if (s >= end) {
            // No overlap: keep this interval, update end
            end = e;
        } else {
            // Overlap: remove this interval (count the removal)
            count++;
        }
    });
    return count;
}

// Partition Labels
function partitionLabels(s) {
    // Build map of each char's last occurrence
    const last = {};
    forEach(s, (c, i) => {
        last[c] = i;
    });

    let start = 0;
    let end = 0;
    const result = [];

    forEach(s, (c, i) => {
        // Extend partition boundary to include last occurrence of current char
        end = Math.max(end, last[c]);

        if (i === end) {
            // Reached end of current partition
            result.push(end - start + 1);
            start = end + 1;
        }
    });
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

    forEach(gas, (_, i) => {
        tank += gas[i] - cost[i];

        if (tank < 0) {
            // Can't start from current start — try starting from next station
            start = i + 1;
            tank = 0;
        }
    });
    return start;
}`,
    verification: `canJump:
  Greedy choice: track farthest = max reachable index; if i > farthest, return false.
  Assume wrong: ignoring farthest still gives correct answers.
    Any position beyond farthest is unreachable by definition — returning true for it is wrong. Contradiction. ✓

eraseOverlapIntervals:
  Greedy choice: sort by end time; keep earliest-ending interval when intervals overlap.
  Assume wrong: keeping the later-ending interval minimizes removals.
    The later-ending interval overlaps with at least as many future intervals as the earlier-ending one.
    Swapping to earlier-ending cannot increase conflicts. Contradiction. ✓

partitionLabels:
  Greedy choice: grow boundary to include last occurrence of every char seen; close only when i reaches boundary.
  Assume wrong: closing before the boundary satisfies the constraint.
    A char with last occurrence beyond the close appears in both parts. Constraint violated. Contradiction. ✓

canCompleteCircuit:
  Greedy choice: when tank < 0 at station i, reset start to i+1.
  Assume wrong: valid start exists at some j <= i.
    From j, the route passes through the same negative segment ending at i — tank goes negative again. Contradiction.
    Total gas >= total cost guarantees exactly one valid start, which must be i+1. ✓`,
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

Mnemonic: "Greedy = sort + scan + local best choice"

TEMPLATE-BY-TEMPLATE MEMORIZATION:

canJump — O(n) time, O(1) space
  Problem: Given an array where each element is the max jump length from that position, determine if you can reach the last index.
  Use when: "jump game", "can reach end", "greedy reachability"
  Example:
    nums = [2, 3, 1, 1, 4], farthest=0
    i=0: 0<=0, farthest=max(0,0+2)=2
    i=1: 1<=2, farthest=max(2,1+3)=4
    i=2: 2<=4, farthest=max(4,2+1)=4
    i=4: 4<=4 -> true!
    nums = [3,2,1,0,4]: i=4 > farthest=3 -> false
    "Track farthest reachable. Fell behind it? Stuck."
  Steps:
    1. farthest = 0
    2. For each i: if i > farthest → return false
    3. farthest = max(farthest, i + nums[i])
    4. Return true
  Mnemonic: "If you can't reach position i, you're stuck. Otherwise keep extending."

eraseOverlapIntervals — O(n log n) time
  Problem: Given an array of intervals, return the minimum number of intervals to remove to make the rest non-overlapping.
  Use when: "non-overlapping intervals", "minimum removals", "interval scheduling"
  Example:
    [[1,2],[2,3],[3,4],[1,3]] sorted by end:
    [[1,2],[2,3],[1,3],[3,4]]
    end=-inf
    [1,2]: 1>=end -> keep, end=2
    [2,3]: 2>=2   -> keep, end=3
    [1,3]: 1<3    -> OVERLAP, remove! count=1
    [3,4]: 3>=3   -> keep, end=4
    return 1
    "Sort by end. Overlap? Remove the newcomer. Keep the earliest-ending one."
  Steps:
    1. Sort intervals by end time
    2. end = -Infinity, count = 0
    3. For each [s, e]: if s >= end → keep (end = e); else → remove (count++)
    4. Return count
  Mnemonic: "Sort by end. Overlap? Remove. No overlap? Keep and update end."

partitionLabels — O(n) time
  Problem: Given a string, partition it into as many parts as possible so each letter appears in at most one part. Return the sizes of the parts.
  Use when: "partition labels", "split string so each char in one part"
  Example:
    s = "ababc", last={a:2, b:3, c:4}
    i=0: a, end=max(0,2)=2
    i=1: b, end=max(2,3)=3
    i=2: a, end=max(3,2)=3
    i=3: b, end=max(3,3)=3, i===end -> push 3-0+1=4, start=4
    i=4: c, end=max(4,4)=4, i===end -> push 4-4+1=1
    result=[4,1]
    "Grow boundary to last-occurrence of each char. Close when you reach it."
  Steps:
    1. Build last = {char: last occurrence index}
    2. start = 0, end = 0
    3. For each i: end = max(end, last[s[i]]); if i === end → push end-start+1, start = end+1
  Mnemonic: "Grow partition boundary to include every char's last occurrence. Close when you reach it."

canCompleteCircuit — O(n) time
  Problem: Given gas amounts and travel costs for gas stations in a circle, find the starting station index to complete the circuit, or -1.
  Use when: "gas station", "can complete circuit", "circular route"
  Example:
    gas=[1,2,3,4,5], cost=[3,4,5,1,2]
    totalGas=15, totalCost=15 -> solution exists
    i=0: tank=1-3=-2 < 0 -> start=1, tank=0
    i=1: tank=2-4=-2 < 0 -> start=2, tank=0
    i=2: tank=3-5=-2 < 0 -> start=3, tank=0
    i=3: tank=4-1=3  >= 0
    i=4: tank=3+5-2=6 >= 0
    return start=3
    "Tank goes negative? Restart. Total surplus guarantees one valid start."
  Steps:
    1. If sum(gas) < sum(cost) → return -1
    2. start = 0, tank = 0
    3. For each i: tank += gas[i] - cost[i]; if tank < 0 → start = i+1, tank = 0
    4. Return start
  Mnemonic: "Tank goes negative? Restart from the next station. Total surplus guarantees one solution."`,
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Merge Intervals
function merge(intervals) {
    // Step 1: sort by start time so overlapping intervals are adjacent
    intervals.sort((a, b) => a[0] - b[0]);

    // Step 2: seed merged list with the first interval
    const merged = [intervals[0]];

    forEachStartingAt(1, intervals, ([start, end]) => {
        const lastMerged = merged[merged.length - 1];

        if (start <= lastMerged[1]) {
            // Overlaps: extend the last merged interval's end if needed
            lastMerged[1] = Math.max(lastMerged[1], end);
        } else {
            // No overlap: start a new interval
            merged.push([start, end]);
        }
    });

    return merged;
}

// Insert Interval
function insert(intervals, newInterval) {
    const result = [];
    let i = 0;

    // Phase 1: add all intervals that end before newInterval starts
    repeatWhile(
        () => i < intervals.length && intervals[i][1] < newInterval[0],
        () => {
            result.push(intervals[i]);
            i++;
        }
    );

    // Phase 2: merge all intervals that overlap with newInterval
    repeatWhile(
        () => i < intervals.length && intervals[i][0] <= newInterval[1],
        () => {
            newInterval = [
                Math.min(newInterval[0], intervals[i][0]),
                Math.max(newInterval[1], intervals[i][1])
            ];
            i++;
        }
    );

    // Add the merged interval
    result.push(newInterval);

    // Phase 3: add all intervals that start after newInterval ends
    repeatWhile(
        () => i < intervals.length,
        () => {
            result.push(intervals[i]);
            i++;
        }
    );

    return result;
}

// Meeting Rooms II (min rooms needed)
function minMeetingRooms(intervals) {
    // Separate and sort start times and end times independently
    const starts = intervals.map(interval => interval[0]).sort((a, b) => a - b);
    const ends = intervals.map(interval => interval[1]).sort((a, b) => a - b);

    let rooms = 0;
    let endPtr = 0;

    forEachBetween(0, starts.length, (i) => {
        if (starts[i] < ends[endPtr]) {
            // New meeting starts before earliest ongoing meeting ends → need extra room
            rooms++;
        } else {
            // A meeting has ended — reuse that room
            endPtr++;
        }
    });

    return rooms;
}`,
    verification: `merge:
  Promise: 'merged always contains the current set of non-overlapping intervals covering all input seen so far'
  Init: merged = [intervals[0]], one interval, trivially non-overlapping ✓
  Maintain:
    What changes? each iteration examines intervals[i] and either extends merged.last or appends
    Could it break the promise? only if we fail to merge an overlap
    Flip test: what if intervals[i].start <= merged.last.end but we do NOT extend?
      Does the code prevent it? yes — the if-branch always extends when start <= last.end ✓
  Terminate: i === intervals.length, all intervals processed, promise holds → merged is correct ✓

insert:
  Promise: 'after each phase, result contains the correct sorted merged list up to the intervals processed'
  Phase 1 invariant: every interval added ends before newInterval starts (no overlap) ✓
  Phase 2 invariant: newInterval is the running merge of all overlapping intervals seen ✓
  Phase 3: remaining intervals all start after the merged interval ends, appended directly ✓
  Why nothing missed: the three phases cover all positions (before / overlap / after) with no gaps ✓

minMeetingRooms:
  Promise: 'rooms = number of meetings that have started but not yet ended at the current start time'
  Init: rooms=0, endPtr=0 before any starts processed ✓
  Maintain:
    What changes? for each starts[i]: if starts[i] < ends[endPtr] rooms++, else endPtr++
    Could it break the promise? only if we fail to recycle a room that actually freed
    Flip test: what if starts[i] >= ends[endPtr] but we do NOT advance endPtr?
      Does the code prevent it? yes — the else branch always advances endPtr ✓
  Terminate: all starts processed; rooms = peak overlap = minimum rooms needed ✓`,
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

Mnemonic: "Overlap = start of next <= end of current"

TEMPLATE-BY-TEMPLATE MEMORIZATION:

merge — O(n log n) time
  Problem: Given an array of intervals, merge all overlapping intervals and return the resulting list.
  Use when: "merge intervals", "combine overlapping intervals"
  Example:
    Input:  [[1,3],[2,6],[8,10],[15,18]]
    Sorted: [[1,3],[2,6],[8,10],[15,18]]
    [1,3] + [2,6]:   2 <= 3 → overlap! extend to [1,6]
    [1,6] + [8,10]:  8 > 6  → no overlap, push [1,6], start new
    [8,10] + [15,18]: 15 > 10 → no overlap, push [8,10]
    Push [15,18]. Result: [[1,6],[8,10],[15,18]]
    'Sort by start. If next.start <= last.end, extend. Otherwise, start fresh.'
  Steps:
    1. Sort by start time
    2. merged = [intervals[0]]
    3. For each next [s, e]: if s <= lastMerged[1] → extend end; else push new interval
  Mnemonic: "Sort, seed, then extend or append."

insert — O(n) time
  Problem: Given a sorted list of non-overlapping intervals and a new interval, insert the new interval and merge any overlaps. Return the result.
  Use when: "insert interval", "add interval and merge"
  Example:
    intervals=[[1,3],[6,9]], new=[2,5]
    Phase 1 (end before new starts): [1,3].end=3 >= new.start=2 → stop. nothing copied.
    Phase 2 (overlap): [1,3] overlaps [2,5] → new=[1,5]. [6,9].start=6 > 5 → stop.
    Push merged [1,5].
    Phase 3 (copy rest): push [6,9].
    Result: [[1,5],[6,9]]
    'Three phases: copy-before, merge-overlap, copy-after. Already sorted = no sort needed.'
  Steps:
    1. Phase 1: copy all intervals ending before newInterval starts
    2. Phase 2: merge all overlapping intervals into newInterval
    3. Phase 3: push newInterval, then copy remaining
  Mnemonic: "Before, merge, after — three phases."

minMeetingRooms — O(n log n) time
  Problem: Given an array of meeting time intervals, find the minimum number of conference rooms required.
  Use when: "meeting rooms", "minimum rooms", "peak concurrent meetings"
  Example:
    meetings=[[0,30],[5,10],[15,20]]
    starts=[0,5,15]   ends=[10,20,30]  (sorted independently)
    endPtr=0, rooms=0
    start=0:  0 < ends[0]=10 → rooms=1
    start=5:  5 < ends[0]=10 → rooms=2
    start=15: 15 >= ends[0]=10 → reuse room, endPtr=1; 15 < ends[1]=20 → rooms stays 2
    Answer: 2
    'Start before earliest end? Need a room. Otherwise recycle one.'
  Steps:
    1. Sort starts and ends independently
    2. endPtr = 0, rooms = 0
    3. For each start: if start < ends[endPtr] → rooms++ (new room); else → endPtr++ (reuse)
    4. Return rooms
  Mnemonic: "New meeting starts before earliest end? Need a room. Otherwise reuse one."`,
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Rotate image 90° clockwise (in-place)
function rotate(matrix) {
    const n = matrix.length;

    // Step 1: Transpose — swap matrix[i][j] with matrix[j][i]
    forEachBetween(0, n, (i) => {
        forEachStartingAt(i + 1, matrix[i], (_, j) => {
            const temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        });
    });

    // Step 2: Reverse each row to complete the 90° CW rotation
    forEach(matrix, (row) => {
        row.reverse();
    });
}

// Spiral order
function spiralOrder(matrix) {
    const result = [];
    let top = 0;
    let bottom = matrix.length - 1;
    let left = 0;
    let right = matrix[0].length - 1;

    repeatWhile(
        () => top <= bottom && left <= right,
        () => {
            // Traverse right along the top row
            forEachBetween(left, right + 1, (col) => {
                result.push(matrix[top][col]);
            });
            top++;

            // Traverse down along the right column
            forEachBetween(top, bottom + 1, (row) => {
                result.push(matrix[row][right]);
            });
            right--;

            // Traverse left along the bottom row (only if rows remain)
            if (top <= bottom) {
                forEachFromRight(matrix[bottom].slice(left, right + 1), (_, idx) => {
                    result.push(matrix[bottom][left + idx]);
                });
                bottom--;
            }

            // Traverse up along the left column (only if columns remain)
            if (left <= right) {
                forEachFromRight(matrix.slice(top, bottom + 1), (_, idx) => {
                    result.push(matrix[top + idx][left]);
                });
                left++;
            }
        }
    );

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

    repeatWhile(
        () => n > 0,
        () => {
            // If current bit of n is set, multiply result by current x
            if (n % 2 === 1) {
                result *= x;
            }

            // Square x for the next bit position
            x *= x;

            // Shift to the next bit
            n = Math.floor(n / 2);
        }
    );

    return result;
}`,
    verification: `rotate:
  Promise: 'after the two-step transform, matrix[i][j] holds the value that was at matrix[n-1-j][i] — the 90° CW rotation'
  Why two steps work: transpose maps [i][j] → [j][i]; reversing each row maps [j][i] → [j][n-1-i]; combined [i][j] → [j][n-1-i] which is exactly 90° CW ✓
  Why not X: a single in-place swap cycle is harder to remember; transpose+reverse is two O(n²) passes with trivial code ✓

spiralOrder:
  Promise: 'result contains all elements visited so far in spiral order; boundaries (top,bottom,left,right) enclose only unvisited elements'
  Init: boundaries cover the whole matrix, result is empty ✓
  Maintain:
    What changes? each direction traverses one wall and shrinks that boundary inward
    Could it break the promise? only if we process a cell outside the current boundary
    Flip test: what if we skip the guard 'if top <= bottom' before going left?
      Does the code prevent it? yes — both guards check remaining rows/cols before the left and up passes ✓
  Terminate: top > bottom or left > right; all cells are inside result ✓

myPow:
  Promise: 'result * x^n = original x^originalN at every loop iteration'
  Init: result=1, so 1 * x^n = x^n ✓
  Maintain:
    What changes? if n is odd: result *= x (absorbs one factor); always x *= x, n = floor(n/2)
    Could it break the promise? only if we skip multiplying result on an odd bit
    Flip test: what if n is odd and we do NOT multiply result?
      Does the code prevent it? yes — the if(n%2===1) branch always fires for odd n ✓
  Terminate: n=0; x^0=1; result holds all absorbed factors = x^originalN ✓`,
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
  Mnemonic: "Square x each time, multiply into result when bit is set"

TEMPLATE-BY-TEMPLATE MEMORIZATION:

rotate — O(n²) time, O(1) space
  Problem: Rotate an n×n matrix 90° clockwise in-place without using extra space.
  Use when: "rotate matrix", "rotate image 90 degrees", "in-place matrix rotation"
  Example:
    Input:  [[1,2,3],[4,5,6],[7,8,9]]
    Transpose (swap [i][j] with [j][i]):
            [[1,4,7],[2,5,8],[3,6,9]]
    Reverse each row:
            [[7,4,1],[8,5,2],[9,6,3]]
    Corner check: 1 (top-left) moved to top-right → correct 90° CW!
    'Transpose + reverse rows = rotate right. Two O(n^2) passes, no extra space.'
  Steps:
    1. Transpose: swap matrix[i][j] with matrix[j][i] for all j > i
    2. Reverse each row
  Mnemonic: "Transpose then reverse rows = rotate right. (For CCW: reverse columns instead.)"

spiralOrder — O(m×n) time
  Problem: Given an m×n matrix, return all elements in spiral order.
  Use when: "spiral order", "matrix in spiral", "clockwise traversal"
  Example:
    [[1,2,3],[4,5,6],[7,8,9]]   top=0,bot=2,left=0,right=2
    Right (row 0): 1,2,3  → top=1
    Down  (col 2): 6,9    → right=1
    Left  (row 2): 8,7    → bot=1
    Up    (col 0): 4      → left=1
    Right (row 1): 5      → top=2 > bot=1, stop
    Result: [1,2,3,6,9,8,7,4,5]
    'RDLU: each direction consumes one wall, shrinks that boundary inward.'
  Steps:
    1. While top <= bottom && left <= right:
    2. Right along top row → top++
    3. Down along right col → right--
    4. Left along bottom row (if top <= bottom) → bottom--
    5. Up along left col (if left <= right) → left++
  Mnemonic: "RDLU + shrink each boundary after traversing it."

myPow — O(log n) time
  Problem: Implement pow(x, n) — compute x raised to the power n, handling negative exponents.
  Use when: "fast power", "x to the power n", "exponentiation"
  Example:
    myPow(2, 10):  n=10 in binary = 1010
    n=10 (even): x=4,    result=1
    n=5  (odd):  result*=4=4,   x=16
    n=2  (even): x=256,  result=4
    n=1  (odd):  result*=256=1024, x=65536, n=0 → done
    Return 1024 = 2^10 ✓
    'Odd bit? Multiply result by x. Always square x and halve n.'
  Steps:
    1. If n < 0: x = 1/x, n = -n
    2. result = 1; while n > 0:
    3. If n is odd (n % 2 === 1): result *= x
    4. x *= x; n = Math.floor(n / 2)
    5. Return result
  Mnemonic: "Odd bit? Multiply into result. Always square x and shift n right."`,
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Single Number (find unique in array of pairs)
// XOR property: a ^ a = 0, a ^ 0 = a → duplicates cancel out
function singleNumber(nums) {
    let result = 0;

    forEach(nums, (num) => {
        result ^= num;  // pairs cancel, unique survives
    });

    return result;
}

// Number of 1 bits (Hamming weight)
// Trick: n & (n-1) clears the lowest set bit each iteration
function hammingWeight(n) {
    let count = 0;

    repeatWhile(
        () => n !== 0,
        () => {
            count++;
            n = n & (n - 1);  // remove lowest set bit
        }
    );

    return count;
}

// Counting bits for 0..n
// DP trick: dp[i] = dp[i >> 1] + (i & 1)
// The bit count of i = bit count of i/2, plus 1 if i is odd
function countBits(n) {
    const dp = new Array(n + 1).fill(0);

    forEachStartingAt(1, dp, (_, i) => {
        const halfBits = dp[i >> 1];   // bit count of i with last bit removed
        const lastBit = i & 1;          // 1 if i is odd, else 0
        dp[i] = halfBits + lastBit;
    });

    return dp;
}

// Reverse bits (32-bit unsigned integer)
function reverseBits(n) {
    let result = 0;

    forEachBetween(0, 32, () => {
        const lastBit = n & 1;               // extract the lowest bit of n
        result = (result << 1) | lastBit;    // shift result left, then add the bit
        n >>>= 1;                            // unsigned right shift n
    });

    return result >>> 0;  // ensure unsigned 32-bit output
}`,
    verification: `singleNumber:
  Promise: 'result = XOR of all elements seen so far'
  Init: result=0; XOR identity: 0 ^ a = a ✓
  Maintain:
    What changes? result ^= num each iteration
    Could it break the promise? only if XOR is not associative/commutative — it is ✓
    Why pairs cancel: a ^ a = 0 for any duplicate pair; 0 ^ unique = unique ✓
  Terminate: all elements processed; pairs have cancelled; result = the lone value ✓

hammingWeight:
  Promise: 'count = number of set bits removed so far; n = remaining bits yet to be counted'
  Init: count=0, n=original input; no bits counted yet ✓
  Maintain:
    What changes? count++ and n = n & (n-1) removes the lowest set bit each iteration
    Could it break the promise? only if n & (n-1) removes more than one bit at a time
    Flip test: does n & (n-1) ever remove zero or two bits?
      No — it always clears exactly the lowest set bit ✓
  Terminate: n=0 (no bits left); count = total set bits in original n ✓

countBits:
  Promise: 'dp[i] = number of 1-bits in i for all 0 <= i processed so far'
  Base case: dp[0] = 0 (zero has no set bits) ✓
  Inductive step: assume dp[0..i-1] correct.
    For i: i >> 1 drops the last bit; dp[i>>1] is correct by induction.
    Adding (i & 1) accounts for the last bit. So dp[i] = correct bit count ✓
  Why nothing missed: every i from 1..n is processed in order ✓

reverseBits:
  Promise: 'result holds the first i bits of n in reversed order after i iterations'
  Init: result=0, i=0; zero bits reversed ✓
  Maintain:
    What changes? extract last bit of n, shift result left and OR in the bit, shift n right
    Could it break the promise? only if we shift n in the wrong direction
    The code uses >>>= 1 (unsigned shift) ensuring we always process the true next bit ✓
  Terminate: i=32; all 32 bits processed; result = n with all bits reversed ✓`,
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

Mnemonic: "XOR cancels twins. AND(n, n-1) kills the lowest bit."

TEMPLATE-BY-TEMPLATE MEMORIZATION:

singleNumber — O(n) time, O(1) space
  Problem: Given a non-empty array where every element appears twice except one, find the element that appears only once.
  Use when: "single number", "find unique", "all appear twice except one"
  Example:
    Input: [4,1,2,1,2]
    result=0 ^ 4=4 ^ 1=5 ^ 2=7 ^ 1=6 ^ 2=4
    Pairs cancel: 1^1=0, 2^2=0. Only 4 remains.
    Return 4 ✓
    'XOR: a^a=0 (pairs cancel), a^0=a (zero is identity). One pass, no extra space.'
  Steps:
    1. result = 0
    2. For each num: result ^= num
    3. Return result
  Mnemonic: "XOR all. Pairs cancel to 0. The lone value survives."

hammingWeight — O(k) time where k = number of set bits
  Problem: Given a 32-bit unsigned integer, return the number of 1-bits (Hamming weight / popcount).
  Use when: "number of 1 bits", "hamming weight", "popcount"
  Example:
    n=11 (binary: 1011), count=0
    1011 & 1010 = 1010, count=1  (cleared bit 0)
    1010 & 1001 = 1000, count=2  (cleared bit 1)
    1000 & 0111 = 0000, count=3  (cleared bit 3)
    n=0 → stop. Return 3 ✓
    'n & (n-1) destroys the lowest set bit each time. Count kills until zero.'
  Steps:
    1. count = 0
    2. While n !== 0: count++; n = n & (n - 1)
    3. Return count
  Mnemonic: "n & (n-1) kills the lowest set bit. Count how many kills until zero."

countBits — O(n) time
  Problem: Given an integer n, return an array of length n+1 where answer[i] is the number of 1-bits in i.
  Use when: "count bits 0 to n", "number of 1s for all values up to n"
  Example:
    n=5, dp=[0,0,0,0,0,0]
    i=1: dp[0]+(1&1) = 0+1 = 1
    i=2: dp[1]+(2&1) = 1+0 = 1  (2=10b, shift gives 1=1b)
    i=3: dp[1]+(3&1) = 1+1 = 2  (3=11b)
    i=4: dp[2]+(4&1) = 1+0 = 1  (4=100b)
    i=5: dp[2]+(5&1) = 1+1 = 2  (5=101b)
    Return [0,1,1,2,1,2] ✓
    'dp[i] = dp[i>>1] + last bit. Shift drops last bit; reuse cached value.'
  Steps:
    1. dp[0] = 0
    2. For i from 1 to n: dp[i] = dp[i >> 1] + (i & 1)
    3. Return dp
  Mnemonic: "Bit count of i = bit count of i/2 plus the last bit. Shift and add."

reverseBits — O(32) time
  Problem: Reverse the bits of a 32-bit unsigned integer.
  Use when: "reverse bits", "bit reversal"
  Example:
    n = 0b1011 (11), 4-bit demo:
    iter 1: lastBit = 1011&1 = 1, result=0b1,   n>>=1 → 0b101
    iter 2: lastBit = 101&1  = 1, result=0b11,  n>>=1 → 0b10
    iter 3: lastBit = 10&1   = 0, result=0b110, n>>=1 → 0b1
    iter 4: lastBit = 1&1    = 1, result=0b1101 (13)
    1011 reversed = 1101 ✓
    'Peel from right of n, paste to left of result, 32 times.'
  Steps:
    1. result = 0
    2. For 32 iterations: lastBit = n & 1; result = (result << 1) | lastBit; n >>>= 1
    3. Return result >>> 0 (ensure unsigned)
  Mnemonic: "Peel the last bit of n, stick it onto the left of result, 32 times."`,
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
        let rootX = this.find(x);
        let rootY = this.find(y);

        // Already in the same component — no union needed
        if (rootX === rootY) {
            return false;
        }

        // Union by rank: attach the shorter tree under the taller one
        if (this.rank[rootX] < this.rank[rootY]) {
            const temp = rootX;
            rootX = rootY;
            rootY = temp;
        }

        this.parent[rootY] = rootX;

        // Only increase rank when two equal-height trees merge
        if (this.rank[rootX] === this.rank[rootY]) {
            this.rank[rootX]++;
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

class UnionFind {
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
        repeatWhile(
            () => this.parent[x] !== x,
            () => {
                // Path compression: point directly to grandparent
                this.parent[x] = this.parent[this.parent[x]];
                x = this.parent[x];
            }
        );
        return x;
    }

    union(x, y) {
        let rootX = this.find(x);
        let rootY = this.find(y);

        // Already in the same component — no union needed
        if (rootX === rootY) {
            return false;
        }

        // Union by rank: attach the shorter tree under the taller one
        if (this.rank[rootX] < this.rank[rootY]) {
            const temp = rootX;
            rootX = rootY;
            rootY = temp;
        }

        this.parent[rootY] = rootX;

        // Only increase rank when two equal-height trees merge
        if (this.rank[rootX] === this.rank[rootY]) {
            this.rank[rootX]++;
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

    forEach(edges, ([u, v]) => {
        uf.union(u, v);
    });

    return uf.components;
}

// Detect a cycle in an undirected graph
function hasCycle(n, edges) {
    const uf = new UnionFind(n);
    let found = false;

    forEach(edges, ([u, v]) => {
        if (found) return; // already detected a cycle
        // If u and v are already connected, adding this edge creates a cycle
        if (!uf.union(u, v)) {
            found = true;
        }
    });

    return found;
}`,
    verification: `UnionFind.find:
  Promise: 'returns the root of x; every node on the path from x to root now points at most one hop from root (path compression)'
  Init: each node is its own parent; find(x) returns x immediately ✓
  Maintain:
    What changes? parent[x] is set to grandparent, then x moves to parent[x]
    Could this skip the true root? no — we always end at the node where parent[node]===node ✓
    Flip test: what if path compression pointed to the wrong node?
      It always points to parent[parent[x]], which is strictly closer to the root ✓
  Terminate: parent[x]===x (x is its own root); returns x ✓

UnionFind.union:
  Greedy choice: attach the shorter tree (lower rank) under the taller tree
  Assume wrong: suppose we attached the taller under the shorter.
    Then the resulting tree height could grow, making future find() calls slower. Contradiction ✓
  Same-root short-circuit: if rootX===rootY, merging would create a self-loop; we return false ✓

countComponents:
  Promise: 'uf.components = number of distinct components among all nodes processed so far'
  Init: uf.components = n; each node is its own component ✓
  Maintain:
    What changes? uf.union(u,v) returns true and decrements components when two distinct roots merge
    Could it over-decrement? no — union returns false (and does not decrement) when already connected ✓
  Terminate: all edges processed; uf.components = final component count ✓

hasCycle:
  Promise: 'returns true immediately upon finding the first edge that connects two already-connected nodes'
  Why union() returning false implies a cycle: if find(u)===find(v) before adding edge (u,v), a path u→v already exists; adding this edge creates a second path = cycle ✓
  Why false negative impossible: every cycle contains at least one edge (u,v) where u and v were already connected ✓`,
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

WHEN TO USE: If you see "connected components" or "are X and Y in the same group?" → Union-Find.

TEMPLATE-BY-TEMPLATE MEMORIZATION:

UnionFind (constructor) — O(n) initialization
  Problem: Initialize a Union-Find data structure for n nodes to track connected components.
  Use when: Setting up Union-Find for connected components or cycle detection.
  Example:
    n=4: parent=[0,1,2,3], rank=[0,0,0,0], components=4
    Each node points to itself (its own root).
    After union(0,1): parent=[0,0,2,3], components=3
    After union(2,3): parent=[0,0,2,2], components=2
    find(1) → parent[1]=0 → parent[0]=0 → root=0
    'Each node starts as its own boss. Unions flatten the tree bottom-up.'
  Steps:
    1. parent = [0, 1, 2, ..., n-1]
    2. rank = [0, 0, ..., 0]
    3. components = n
  Mnemonic: "Everyone is their own boss at the start."

UnionFind.find — O(α(n)) ≈ O(1)
  Problem: Find the root representative of the component containing x.
  Use when: "find representative", "find component root"
  Example:
    Chain before: 3 → 2 → 1 → 0 (root)
    find(3):
      step 1: parent[3]=2, grandparent=parent[2]=1, set parent[3]=1, x=1
      step 2: parent[1]=0, grandparent=parent[0]=0, set parent[1]=0, x=0
      parent[0]=0 → x is root, return 0
    Chain after: 3→1→0, 1→0 (flatter)
    'Skip to grandparent each step. Future finds on same path are faster.'
  Steps:
    1. While parent[x] !== x: parent[x] = parent[parent[x]] (skip to grandparent); x = parent[x]
    2. Return x
  Mnemonic: "Walk up, shortcut to grandparent each step. Stop when you're your own boss."

UnionFind.union — O(α(n)) ≈ O(1)
  Problem: Merge the components containing x and y into one.
  Use when: "connect two nodes", "merge two components"
  Example:
    parent=[0,1,2,3], rank=[0,0,0,0]
    union(0,1): find(0)=0, find(1)=1, roots differ
      rank[0]=rank[1]=0 → attach 1 under 0, rank[0]++
      parent=[0,0,2,3], rank=[1,0,0,0], components=3
    union(0,2): find(0)=0, find(2)=2
      rank[0]=1 > rank[2]=0 → attach 2 under 0
      parent=[0,0,0,3], rank=[1,0,0,0], components=2
    'Attach shorter tree under taller. Prevents chains. Same root? Skip.'
  Steps:
    1. px = find(x); py = find(y); if px === py → return false (same component)
    2. Attach shorter tree under taller (union by rank): if rank[px] < rank[py] → swap
    3. parent[py] = px; if ranks equal → rank[px]++; components--
    4. Return true
  Mnemonic: "Find both roots. Same? Skip. Different? Attach smaller under bigger."

countComponents — O(n + e)
  Problem: Given n nodes and a list of undirected edges, count the number of connected components.
  Use when: "count connected components", "how many groups"
  Example:
    n=5, edges=[[0,1],[1,2],[3,4]]
    Start: components=5
    union(0,1): success → components=4
    union(1,2): find(1)=0, find(2)=2, different → components=3
    union(3,4): success → components=2
    Return 2 ✓
    'n nodes = n components. Every successful union reduces count by 1.'
  Steps:
    1. Create UnionFind(n)
    2. For each edge [u, v]: uf.union(u, v)
    3. Return uf.components
  Mnemonic: "Union all edges. Remaining component count = answer."

hasCycle (UF version) — O(n + e)
  Problem: Given n nodes and a list of edges, detect whether the undirected graph contains a cycle.
  Use when: "cycle detection undirected graph", "does adding this edge create a cycle?"
  Example:
    n=3, edges=[[0,1],[1,2],[0,2]]
    union(0,1): find(0)=0, find(1)=1, different → merge OK
    union(1,2): find(1)=0, find(2)=2, different → merge OK
    union(0,2): find(0)=0, find(2)=0, SAME root!
      → union returns false → CYCLE DETECTED!
    'If find(u)===find(v) before union, adding (u,v) creates a second path = cycle.'
  Steps:
    1. For each edge [u, v]: if uf.union(u, v) returns false → cycle detected
    2. Return true if any union fails, else false
  Mnemonic: "Already connected before we add this edge? That edge creates a cycle."`,
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
    for (let currentIndex = 0; currentIndex < nums.length; currentIndex++) {
        const currentVal = nums[currentIndex];
        // Expire: remove front if it has slid out of the window
        while (dq.length > 0 && dq[0] < currentIndex - k + 1) {
            dq.shift();
        }
        // Clean: remove back indices whose values are <= current
        while (dq.length > 0) {
            const backIndex = dq[dq.length - 1];
            if (nums[backIndex] <= currentVal) {
                dq.pop();
            } else {
                break;
            }
        }
        dq.push(currentIndex);
        // Record answer once the first full window is reached
        if (currentIndex >= k - 1) {
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
    for (let currentIndex = 0; currentIndex < nums.length; currentIndex++) {
        const currentVal = nums[currentIndex];
        while (dq.length > 0 && dq[0] < currentIndex - k + 1) {
            dq.shift();
        }
        while (dq.length > 0) {
            const backIndex = dq[dq.length - 1];
            if (nums[backIndex] >= currentVal) {
                dq.pop();
            } else {
                break;
            }
        }
        dq.push(currentIndex);
        if (currentIndex >= k - 1) {
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
        const rightVal = nums[right];
        // Maintain the max deque
        while (maxDq.length > 0) {
            const backIndex = maxDq[maxDq.length - 1];
            if (nums[backIndex] <= rightVal) {
                maxDq.pop();
            } else {
                break;
            }
        }
        maxDq.push(right);
        // Maintain the min deque
        while (minDq.length > 0) {
            const backIndex = minDq[minDq.length - 1];
            if (nums[backIndex] >= rightVal) {
                minDq.pop();
            } else {
                break;
            }
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Sliding Window Maximum
// Deque stores indices; nums values in deque are DECREASING (front = max)
function maxSlidingWindow(nums, k) {
    const dq = [];     // stores indices; nums[dq[0]] is always the max
    const result = [];
    forEach(nums, (currentVal, currentIndex) => {
        // Expire: remove front if it has slid out of the window
        repeatWhile(
            () => dq.length > 0 && dq[0] < currentIndex - k + 1,
            () => {
                dq.shift();
            }
        );
        // Clean: remove back indices whose values are <= current
        repeatWhile(
            () => {
                if (dq.length === 0) return false;
                const backIndex = dq[dq.length - 1];
                return nums[backIndex] <= currentVal;
            },
            () => {
                dq.pop();
            }
        );
        dq.push(currentIndex);
        // Record answer once the first full window is reached
        if (currentIndex >= k - 1) {
            result.push(nums[dq[0]]);
        }
    });
    return result;
}

// Sliding Window Minimum
// Same loop structure, but remove from back when back >= current
function minSlidingWindow(nums, k) {
    const dq = [];     // stores indices; nums[dq[0]] is always the min
    const result = [];
    forEach(nums, (currentVal, currentIndex) => {
        repeatWhile(
            () => dq.length > 0 && dq[0] < currentIndex - k + 1,
            () => {
                dq.shift();
            }
        );
        repeatWhile(
            () => {
                if (dq.length === 0) return false;
                const backIndex = dq[dq.length - 1];
                return nums[backIndex] >= currentVal;
            },
            () => {
                dq.pop();
            }
        );
        dq.push(currentIndex);
        if (currentIndex >= k - 1) {
            result.push(nums[dq[0]]);
        }
    });
    return result;
}

// Longest subarray where max - min <= limit
// Uses TWO deques: one tracks the running max, one tracks the running min
function longestSubarray(nums, limit) {
    const maxDq = [];  // decreasing — front is the current window max
    const minDq = [];  // increasing — front is the current window min
    let left = 0;
    let result = 0;
    forEach(nums, (rightVal, right) => {
        // Maintain the max deque
        repeatWhile(
            () => {
                if (maxDq.length === 0) return false;
                const backIndex = maxDq[maxDq.length - 1];
                return nums[backIndex] <= rightVal;
            },
            () => {
                maxDq.pop();
            }
        );
        maxDq.push(right);
        // Maintain the min deque
        repeatWhile(
            () => {
                if (minDq.length === 0) return false;
                const backIndex = minDq[minDq.length - 1];
                return nums[backIndex] >= rightVal;
            },
            () => {
                minDq.pop();
            }
        );
        minDq.push(right);
        // Shrink from the left while constraint is violated
        repeatWhile(
            () => nums[maxDq[0]] - nums[minDq[0]] > limit,
            () => {
                left++;
                if (maxDq[0] < left) {
                    maxDq.shift();
                }
                if (minDq[0] < left) {
                    minDq.shift();
                }
            }
        );
        result = Math.max(result, right - left + 1);
    });
    return result;
}`,
    verification: `maxSlidingWindow:
  Promise: 'dq contains indices of a non-increasing subsequence of nums within the current window [i-k+1 .. i]; nums[dq[0]] is the window maximum'
  Init: dq=[]; empty deque satisfies non-increasing trivially ✓
  Maintain:
    What changes? expire stale front; pop back indices whose values <= nums[i]; push i
    Could it break the promise? only if we keep a smaller element behind a larger one
    Flip test: what if we skip the clean step and push i without popping smaller backs?
      Then dq would have a smaller value before nums[i], violating non-increasing. The while-pop prevents this ✓
  Terminate: i === nums.length; every window's max was recorded at i === k-1, k, ... ✓

minSlidingWindow:
  Promise: 'same structure as maxSlidingWindow but dq is non-decreasing; nums[dq[0]] is the window minimum'
  The only difference: pop back when nums[back] >= nums[i] (keeps non-decreasing order)
  Flip test: what if >= were changed to <=?
    Then equal values would be popped, potentially losing the minimum unnecessarily. The >= catches equals to maintain non-decreasing ✓

longestSubarray:
  Promise: '[left..right] is the longest valid window ending at right where max-min <= limit'
  Init: left=0, both deques empty; window of size 0 is trivially valid ✓
  Maintain:
    What changes? right advances; both deques updated; if max-min > limit, left advances and deque fronts expire
    Could left advance too far? no — we stop as soon as the constraint is satisfied ✓
    Flip test: what if we only maintained one deque?
      We could not compute both max and min in O(1), so the constraint check would be wrong ✓
  Terminate: right === nums.length; result = length of longest valid window seen ✓`,
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
"right=3: maxDq=[3](7), minDq=[1,2,3](2,4,7). 7-2=5>4 → left=2\n" +
"  minDq[0]=1<2 → shift. minDq=[2,3](4,7). 7-4=3<=4. len=2\n" +
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

WHEN TO USE: "sliding window" + "max/min" in the same sentence → monotonic deque.

TEMPLATE-BY-TEMPLATE MEMORIZATION:

maxSlidingWindow — O(n) time, O(k) space
  Problem: Given an integer array and window size k, return the maximum value in each sliding window of size k.
  Use when: "sliding window maximum", "max of every k-length subarray"
  Example:
    nums=[1,3,-1,-3,5], k=3
    i=0: push 0.       dq=[0(1)]
    i=1: 3>1→pop 0, push 1. dq=[1(3)]
    i=2: -1<3→push 2.  dq=[1(3),2(-1)] → result=[3]
    i=3: -3<-1→push 3. dq=[1(3),2(-1),3(-3)] → result=[3,3]
    i=4: 5>all→pop 3,2,1. push 4. dq=[4(5)] → result=[3,3,5]
    'Deque = hall of fame. New champ evicts old losers. Stale front expires.'
  Steps:
    1. For each i: expire front if dq[0] < i - k + 1
    2. Pop from back while nums[back] <= nums[i]
    3. Push i; if i >= k-1 → record nums[dq[0]] as answer
  Mnemonic: "ECA-R: Expire, Clean, Add, Record."

minSlidingWindow — O(n) time, O(k) space
  Problem: Given an integer array and window size k, return the minimum value in each sliding window of size k.
  Use when: "sliding window minimum", "min of every k-length subarray"
  Example:
    nums=[3,1,2,4], k=2
    i=0: push 0.         dq=[0(3)]
    i=1: 1<3 → pop 0, push 1. dq=[1(1)] → result=[1]
    i=2: 2>1 → push 2.   dq=[1(1),2(2)] → result=[1,1]
    i=3: 4>2 → push 3. expire: dq[0]=1 >= i-k+1=2? 1<2 → expire front.
         dq=[2(2),3(4)] → result=[1,1,2]
    'Min deque: remove >= from back (flip from max). Front is always min.'
  Steps:
    1. Same as maxSlidingWindow but pop back when nums[back] >= nums[i]
  Mnemonic: "Same as max, just flip the comparison: >= instead of <=."

longestSubarray — O(n) time
  Problem: Given an integer array and a limit, return the length of the longest subarray where the difference between max and min is at most limit.
  Use when: "longest subarray with bounded range", "max minus min constraint"
  Example:
    nums=[8,2,4,7], limit=4
    right=0: maxDq=[0(8)], minDq=[0(8)]. 8-8=0 <= 4. len=1
    right=1: maxDq=[0(8)], minDq=[1(2)]. 8-2=6 > 4 → shrink!
      left=1, expire front 0 from maxDq. maxDq=[1(2)]. 2-2=0. len=1
    right=2: maxDq=[2(4)], minDq=[1(2),2(4)]. 4-2=2 <= 4. len=2
    right=3: maxDq=[3(7)], minDq=[1(2),2,3(7)]. 7-2=5 > 4 → shrink!
      left=2, expire idx 1. 7-4=3 <= 4. len=2
    'Two deques = O(1) max and min. Shrink left when max-min > limit.'
  Steps:
    1. Maintain both deques as new elements arrive
    2. While nums[maxDq[0]] - nums[minDq[0]] > limit: left++; expire fronts if outside window
    3. result = max(result, right - left + 1)
  Mnemonic: "Two deques track window max and min. Shrink left whenever constraint breaks."`,
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
    const [left, leftInversions] = countInversions(nums.slice(0, mid));
    const [right, rightInversions] = countInversions(nums.slice(mid));

    const merged = [];
    let totalInversions = leftInversions + rightInversions;
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
            totalInversions += left.length - i;
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

    return [merged, totalInversions];
}`,
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Merge Sort — Divide, Conquer, Combine
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

    repeatWhile(
        () => i < left.length && j < right.length,
        () => {
            if (left[i] <= right[j]) {
                result.push(left[i]);
                i++;
            } else {
                result.push(right[j]);
                j++;
            }
        }
    );

    // Drain any remaining elements from the left side
    repeatWhile(
        () => i < left.length,
        () => {
            result.push(left[i]);
            i++;
        }
    );

    // Drain any remaining elements from the right side
    repeatWhile(
        () => j < right.length,
        () => {
            result.push(right[j]);
            j++;
        }
    );

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
    const [left, leftInversions] = countInversions(nums.slice(0, mid));
    const [right, rightInversions] = countInversions(nums.slice(mid));

    const merged = [];
    let totalInversions = leftInversions + rightInversions;
    let i = 0;
    let j = 0;

    repeatWhile(
        () => i < left.length && j < right.length,
        () => {
            if (left[i] <= right[j]) {
                merged.push(left[i]);
                i++;
            } else {
                // All remaining left elements are > right[j] → count them all
                merged.push(right[j]);
                j++;
                totalInversions += left.length - i;
            }
        }
    );

    repeatWhile(
        () => i < left.length,
        () => {
            merged.push(left[i]);
            i++;
        }
    );
    repeatWhile(
        () => j < right.length,
        () => {
            merged.push(right[j]);
            j++;
        }
    );

    return [merged, totalInversions];
}`,
    verification: `mergeSort:
  Promise: 'mergeSort(nums) returns a sorted copy of nums'
  Base case: nums.length <= 1; a single element is already sorted ✓
  Inductive step: assume mergeSort correctly sorts any array shorter than nums.
    left = mergeSort(first half) sorted by induction ✓
    right = mergeSort(second half) sorted by induction ✓
    merge(left, right) combines two sorted arrays into one sorted array ✓
  Why nothing missed: every element is in exactly one of left or right ✓

merge:
  Promise: 'result contains the merged sorted elements from left[0..i-1] and right[0..j-1]'
  Init: result=[], i=j=0; trivially sorted ✓
  Maintain:
    What changes? always append the smaller of left[i] and right[j]
    Could result become unsorted? only if we append something smaller than the last element
    Flip test: what if left[i] > right[j] but we pick left[i]?
      The if-condition (left[i] <= right[j]) prevents this ✓
  Terminate: one side exhausted; drain the other; all elements in sorted order ✓

quickSelect:
  Promise: 'quickSelect(nums, k) returns the kth smallest element (0-indexed)'
  Base case: when less.length or equal covers k, return immediately ✓
  Inductive step: assume quickSelect works on any array smaller than nums.
    After partition: k lands in exactly one of less / equal / greater.
    In less: recurse with same k (smaller sub-problem) correct by induction ✓
    In greater: recurse with adjusted k correct by induction ✓
  Why O(n) average: random pivot splits roughly in half; T(n)=T(n/2)+O(n)=O(n) ✓

countInversions:
  Promise: 'countInversions(nums) returns [sorted copy of nums, count of inversions]'
  Base case: length <= 1; 0 inversions ✓
  Inductive step: left and right sub-array inversions counted recursively ✓
    Cross inversions: when right[j] is chosen during merge, all remaining left elements are larger — counted as left.length - i ✓
  Why nothing missed: every inversion is within left, within right, or crosses the boundary ✓`,
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
"  3>1: push 1, j++, totalInversions += left.length-i = 1-0=1. totalInversions=1\n" +
"  3>2: push 2, j++, totalInversions += 1. totalInversions=2\n" +
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

Mnemonic: "Split in half, solve each half, stitch together."

TEMPLATE-BY-TEMPLATE MEMORIZATION:

mergeSort — O(n log n) time
  Problem: Sort an array in ascending order using merge sort.
  Use when: "sort stably", "count inversions", "divide and conquer sort"
  Example:
    [3,1,2]
    split: [3] and [1,2]
      split [1,2]: [1] and [2] → merge → [1,2]
    merge [3] and [1,2]:
      1<3 → take 1. 2<3 → take 2. drain [3].
      result: [1,2,3] ✓
    'Work happens in merge, not split. log n levels × O(n) merge = O(n log n).'
  Steps:
    1. Base: if length <= 1, return as-is
    2. Split at mid; mergeSort(left); mergeSort(right)
    3. Merge: two-pointer, pick smaller each step, drain leftovers
  Mnemonic: "Split to atoms, sort while merging back up."

merge (helper) — O(n) time
  Problem: Given two sorted arrays, merge them into a single sorted array.
  Use when: Internal helper for merge sort and count inversions.
  Example:
    left=[1,3], right=[2,4]
    1<2 → take 1, i=1. result=[1]
    3>2 → take 2, j=1. result=[1,2]
    3<4 → take 3, i=2. result=[1,2,3]
    i exhausted → drain right: append 4
    result=[1,2,3,4] ✓
    'Two sorted heads compete. Take smaller. Drain whichever has leftovers.'
  Steps:
    1. i = 0, j = 0; while both have elements: push the smaller, advance that pointer
    2. Drain any remaining elements from left or right
  Mnemonic: "Pick the smaller from each head. Drain the leftovers."

quickSelect — O(n) average time
  Problem: Given an unsorted array and k (0-indexed), return the kth smallest element.
  Use when: "kth smallest", "kth largest element", "find Nth order statistic"
  Example:
    Find k=1 (2nd smallest) in [3,1,4,1,5], pivot=3
    less=[1,1], equal=[3], greater=[4,5]
    k=1 < len(less)=2 → recurse into less=[1,1], k=1
      pivot=1: less=[], equal=[1,1], greater=[]
      k=1 < 0+2=2 → return pivot=1 ✓
    'Partition, check which bucket k lands in, recurse ONE side only.'
  Steps:
    1. Random pivot; partition into less / equal / greater
    2. k < less.length → recurse left; k < less + equal → return pivot
    3. Else recurse right with k adjusted by len(less) + len(equal)
  Mnemonic: "Partition, then recurse into exactly ONE side."

countInversions — O(n log n) time
  Problem: Given an array, count the number of inversions — pairs (i, j) where i < j but nums[i] > nums[j].
  Use when: "count inversions", "count out-of-order pairs"
  Example:
    [3,1,2]: inversions=(3,1) and (3,2) → expected 2
    split: left=[3], right=[1,2]
    merge [3] and [1,2]:
      3>1 → take 1, inv += left.length-i = 1-0 = 1. inv=1
      3>2 → take 2, inv += 1. inv=2
      drain [3]
    Return 2 ✓
    'When right beats left during merge, ALL remaining left elements are inversions.'
  Steps:
    1. Split and recurse as merge sort
    2. During merge: when right element is chosen over left: inv += left.length - i
    3. Return [merged, total inversions]
  Mnemonic: "When right beats left during merge, all remaining left elements are inversions."`,
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

class SegmentTree {
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
    verification: `SegmentTree._build:
  Promise: 'tree[node] = sum of nums[start..end] after _build(node, start, end)'
  Base case: start===end (leaf); tree[node] = nums[start] — trivially correct ✓
  Inductive step: assume _build correct for all smaller ranges.
    Left child built over [start,mid] correct by induction ✓
    Right child built over [mid+1,end] correct by induction ✓
    tree[node] = left child + right child = sum of entire [start,end] ✓
  Why nothing missed: every index is covered by exactly one leaf ✓

SegmentTree.update:
  Promise: 'tree[node] = sum of the updated array over [start,end] after _update'
  Base case: start===end (leaf); tree[node] set to new val ✓
  Inductive step: recurse into exactly the child containing idx; on the way back, tree[node] recalculated as left + right ✓
  Why only the path is updated: tree nodes not on the path from root to idx are unaffected, and their ranges do not include idx ✓

SegmentTree.query:
  Promise: '_query returns the sum of nums[max(l,start)..min(r,end)]'
  Case 1 (no overlap): query range [l,r] and node range [start,end] are disjoint → contributes 0 ✓
  Case 2 (full overlap): node range completely inside [l,r] → return stored sum ✓
  Case 3 (partial overlap): split and sum both children; the ranges together cover exactly [start,end] ∩ [l,r] with no double-counting ✓
  Why O(log n): at each level at most 4 nodes are in partial-overlap; the rest are full or none ✓`,
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
If only queries (no updates): prefix sum is simpler.

TEMPLATE-BY-TEMPLATE MEMORIZATION:

SegmentTree (constructor / _build) — O(n) build
  Problem: Build a segment tree from an array to support range sum queries and point updates.
  Use when: Setting up segment tree for range queries with point updates.
  Example:
    nums=[1,3,5,7], tree size=4*4=16
    _build(1,[0,3]): mid=1
      _build(2,[0,1]): mid=0
        _build(4,[0,0]): leaf → tree[4]=1
        _build(5,[1,1]): leaf → tree[5]=3
        tree[2] = 1+3 = 4
      _build(3,[2,3]): tree[6]=5, tree[7]=7, tree[3]=12
      tree[1] = 4+12 = 16
    'Node i → children 2i, 2i+1. Leaf=value. Parent=sum of children.'
  Steps:
    1. Allocate tree = new Array(4 * n).fill(0)
    2. _build(nums, node=1, start=0, end=n-1)
    3. Base (leaf): tree[node] = nums[start]
    4. Else: build left child (2*node), build right child (2*node+1), tree[node] = left + right
  Mnemonic: "Leaf stores value. Parent stores sum of children."

SegmentTree.update — O(log n) time
  Problem: Update the value at a single index in the array and maintain all range query answers.
  Use when: "point update", "change one element and maintain range queries"
  Example:
    tree=[16,4,12,1,3,5,7] for nums=[1,3,5,7]
    update(idx=1, val=10): change nums[1]=3 to 10
    path: node1[0,3] → node2[0,1] → node5[1,1] (leaf)
    tree[5] = 10
    back up: tree[2] = tree[4]+tree[5] = 1+10 = 11
             tree[1] = tree[2]+tree[3] = 11+12 = 23 ✓
    'Find leaf, set it, bubble sums back up. O(log n) ancestors updated.'
  Steps:
    1. Walk down to the leaf matching idx (go left if idx <= mid, else right)
    2. At leaf: set new value
    3. On the way back up: recalculate tree[node] = left child + right child
  Mnemonic: "Find the leaf, set it, bubble the sum back up."

SegmentTree.query — O(log n) time
  Problem: Return the sum of all elements in the range [l, r].
  Use when: "range sum query", "sum over a range with updates"
  Example:
    nums=[1,3,5,7], query(1,2) → sum=3+5=8
    node1[0,3]: partial → split
      node2[0,1]: partial → split
        node4[0,0]: 0 < l=1 → NO OVERLAP → 0
        node5[1,1]: fully inside [1,2] → return tree[5]=3
      node3[2,3]: partial → split
        node6[2,2]: fully inside [1,2] → return tree[6]=5
        node7[3,3]: 3 > r=2 → NO OVERLAP → 0
    Total: 0+3+5+0 = 8 ✓
    'None→0. Full→stored. Partial→split both. At most O(log n) nodes.'
  Steps:
    1. No overlap (r < start or end < l): return 0
    2. Full overlap (l <= start and end <= r): return tree[node]
    3. Partial: recurse both children, sum results
  Mnemonic: "None? Zero. All? Return. Partial? Split and sum."`,
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
    const lps = new Array(m).fill(0); // Longest Prefix-Suffix match lengths

    // Build LPS array
    let matchLength = 0;   // length of current matching prefix-suffix
    let i = 1;     // lps[0] is always 0; start from index 1
    while (i < m) {
        if (pattern[i] === pattern[matchLength]) {
            // Extended the matching prefix-suffix
            matchLength++;
            lps[i] = matchLength;
            i++;
        } else if (matchLength > 0) {
            // Mismatch after some match: fall back without advancing i
            matchLength = lps[matchLength - 1];
        } else {
            // No match at all
            lps[i] = 0;
            i++;
        }
    }

    // Search phase: use lps to skip redundant comparisons
    let textPos = 0;       // pointer into text
    let patternPos = 0;    // pointer into pattern
    const results = [];

    while (textPos < text.length) {
        if (text[textPos] === pattern[patternPos]) {
            textPos++;
            patternPos++;

            if (patternPos === m) {
                // Found a full match at index (textPos - patternPos)
                results.push(textPos - patternPos);
                // Use LPS to find the next possible overlap
                patternPos = lps[patternPos - 1];
            }
        } else if (patternPos > 0) {
            // Mismatch: use LPS to skip (keep textPos in place)
            patternPos = lps[patternPos - 1];
        } else {
            // No partial match: just advance text
            textPos++;
        }
    }

    return results;
}

// Rabin-Karp - rolling hash for O(n+m) average pattern matching
function rabinKarp(text, pattern) {
    const textLen = text.length;
    const patternLen = pattern.length;

    if (patternLen > textLen) {
        return -1;
    }

    const base = 26;
    const mod = 1e9 + 7;

    // Precompute base^(patternLen-1) — used to remove the leftmost character from hash
    let power = 1;
    for (let i = 0; i < patternLen - 1; i++) {
        power = (power * base) % mod;
    }

    // Hash the pattern and the initial text window
    let patternHash = 0;
    let textWindowHash = 0;
    for (let i = 0; i < patternLen; i++) {
        patternHash = (patternHash * base + pattern.charCodeAt(i)) % mod;
        textWindowHash = (textWindowHash * base + text.charCodeAt(i)) % mod;
    }

    for (let i = 0; i <= textLen - patternLen; i++) {
        if (patternHash === textWindowHash && text.slice(i, i + patternLen) === pattern) {
            return i;  // hash matched and string verified
        }

        // Roll the hash: remove leftmost char, add next char
        if (i + patternLen < textLen) {
            const leftCharHash = (text.charCodeAt(i) * power) % mod;
            textWindowHash = ((textWindowHash - leftCharHash) % mod + mod) % mod;  // +mod prevents negatives
            textWindowHash = (textWindowHash * base + text.charCodeAt(i + patternLen)) % mod;
        }
    }

    return -1;
}`,
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// KMP - pattern matching in O(n+m)
// Phase 1: build LPS (Longest Proper Prefix which is also Suffix)
// Phase 2: search text using LPS to skip on mismatches
function kmpSearch(text, pattern) {
    const m = pattern.length;
    const lps = new Array(m).fill(0); // Longest Prefix-Suffix match lengths

    // Build LPS array
    let matchLength = 0;   // length of current matching prefix-suffix
    let i = 1;     // lps[0] is always 0; start from index 1
    repeatWhile(
        () => i < m,
        () => {
            if (pattern[i] === pattern[matchLength]) {
                // Extended the matching prefix-suffix
                matchLength++;
                lps[i] = matchLength;
                i++;
            } else if (matchLength > 0) {
                // Mismatch after some match: fall back without advancing i
                matchLength = lps[matchLength - 1];
            } else {
                // No match at all
                lps[i] = 0;
                i++;
            }
        }
    );

    // Search phase: use lps to skip redundant comparisons
    let textPos = 0;       // pointer into text
    let patternPos = 0;    // pointer into pattern
    const results = [];

    repeatWhile(
        () => textPos < text.length,
        () => {
            if (text[textPos] === pattern[patternPos]) {
                textPos++;
                patternPos++;

                if (patternPos === m) {
                    // Found a full match at index (textPos - patternPos)
                    results.push(textPos - patternPos);
                    // Use LPS to find the next possible overlap
                    patternPos = lps[patternPos - 1];
                }
            } else if (patternPos > 0) {
                // Mismatch: use LPS to skip (keep textPos in place)
                patternPos = lps[patternPos - 1];
            } else {
                // No partial match: just advance text
                textPos++;
            }
        }
    );

    return results;
}

// Rabin-Karp - rolling hash for O(n+m) average pattern matching
function rabinKarp(text, pattern) {
    const textLen = text.length;
    const patternLen = pattern.length;

    if (patternLen > textLen) {
        return -1;
    }

    const base = 26;
    const mod = 1e9 + 7;

    // Precompute base^(patternLen-1) — used to remove the leftmost character from hash
    let power = 1;
    forEachBetween(0, patternLen - 1, () => {
        power = (power * base) % mod;
    });

    // Hash the pattern and the initial text window
    let patternHash = 0;
    let textWindowHash = 0;
    forEachBetween(0, patternLen, (i) => {
        patternHash = (patternHash * base + pattern.charCodeAt(i)) % mod;
        textWindowHash = (textWindowHash * base + text.charCodeAt(i)) % mod;
    });

    forEachBetween(0, textLen - patternLen + 1, (i) => {
        if (patternHash === textWindowHash && text.slice(i, i + patternLen) === pattern) {
            return i;  // hash matched and string verified
        }

        // Roll the hash: remove leftmost char, add next char
        if (i + patternLen < textLen) {
            const leftCharHash = (text.charCodeAt(i) * power) % mod;
            textWindowHash = ((textWindowHash - leftCharHash) % mod + mod) % mod;  // +mod prevents negatives
            textWindowHash = (textWindowHash * base + text.charCodeAt(i + patternLen)) % mod;
        }
    });

    return -1;
}`,
    verification: `kmpSearch:
  Promise (LPS build): 'lps[i] = length of the longest proper prefix of pattern[0..i] that is also a suffix'
  Init: lps[0]=0 (no proper prefix for a single character) ✓
  Maintain:
    What changes? matchLength extends when chars match; falls back via lps[matchLength-1] on mismatch
    Flip test: what if on mismatch we reset matchLength to 0 instead of lps[matchLength-1]?
      We would miss shorter valid prefix-suffix overlaps, producing a wrong (smaller) lps value ✓
  Terminate: i===m; lps array complete ✓

  Promise (search): 'result contains all starting indices where pattern appears in text'
  Init: textPos=patternPos=0 ✓
  Maintain:
    On match: both advance; when patternPos===m record hit, reset via lps[m-1]
    On mismatch patternPos>0: use lps to skip without moving textPos
    On mismatch patternPos===0: advance textPos only
    Flip test: what if we reset patternPos to 0 instead of lps[patternPos-1]?
      We would re-compare already-matched characters, degrading to O(nm) ✓
  Terminate: textPos===text.length ✓

rabinKarp:
  Promise: 'textWindowHash is always the polynomial hash of text[i..i+patternLen-1]'
  Init: textWindowHash computed over first patternLen characters ✓
  Maintain:
    Roll: remove leftmost char (leftChar * power), shift left (* base), add new right char
    Negative wrap prevented by (+mod)%mod ✓
    Flip test: what if we skip string verification on hash match?
      Hash collisions cause false positives; the text.slice check is mandatory ✓
  Terminate: all windows checked; -1 returned if no match ✓`,
    jsTemplateWalkthrough: "── KMP: Build LPS ──\n" +
"Pattern: \"aabaab\"\n" +
"lps[0]=0 always.\n" +
"\n" +
"i=1, matchLength=0: p[1]=a == p[0]=a → matchLength=1, lps[1]=1, i=2\n" +
"i=2, matchLength=1: p[2]=b != p[1]=a → matchLength=lps[0]=0\n" +
"i=2, matchLength=0: p[2]=b != p[0]=a → lps[2]=0, i=3\n" +
"i=3, matchLength=0: p[3]=a == p[0]=a → matchLength=1, lps[3]=1, i=4\n" +
"i=4, matchLength=1: p[4]=a == p[1]=a → matchLength=2, lps[4]=2, i=5\n" +
"i=5, matchLength=2: p[5]=b == p[2]=b → matchLength=3, lps[5]=3, i=6\n" +
"LPS = [0,1,0,1,2,3]\n" +
"\n" +
"── KMP: Search ──\n" +
"text=\"aabaabaab\", pattern=\"aabaab\"\n" +
"\n" +
"textPos=0..5: all match. patternPos=6==m → found at index 0! patternPos=lps[5]=3\n" +
"textPos=6, patternPos=3: t[6]=a == p[3]=a → textPos=7, patternPos=4\n" +
"textPos=7, patternPos=4: t[7]=a == p[4]=a → textPos=8, patternPos=5\n" +
"textPos=8, patternPos=5: t[8]=b == p[5]=b → patternPos=6==m → found at index 3!\n" +
"Results: [0, 3] ✓\n" +
"\n" +
"── Rabin-Karp ──\n" +
"text=\"abcdef\", pattern=\"cde\", base=26, patternLen=3, power=676\n" +
"\n" +
"patternHash = hash(\"cde\")\n" +
"textWindowHash[i=0] = hash(\"abc\") ≠ patternHash → slide\n" +
"  remove 'a': textWindowHash = (textWindowHash - a*676 + mod) % mod\n" +
"  add 'd':    textWindowHash = textWindowHash*26 + d\n" +
"textWindowHash[i=1] = hash(\"bcd\") ≠ patternHash → slide\n" +
"textWindowHash[i=2] = hash(\"cde\") == patternHash → verify → return 2 ✓",
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

Mnemonic: "KMP = never re-check matched characters. LPS tells you where to jump."

TEMPLATE-BY-TEMPLATE MEMORIZATION:

kmpSearch — O(n+m) time
  Problem: Given a text and pattern, find all starting indices in text where pattern occurs.
  Use when: "pattern matching", "find all occurrences of substring", "efficient string search"
  Example:
    pattern="aba", build LPS:
      lps[0]=0; i=1: b!=a → lps[1]=0; i=2: a==a → lps[2]=1
      LPS=[0,0,1]
    Search text="aababa":
      i=0,j=0: a==a → i=1,j=1
      i=1,j=1: a!=b → j=lps[0]=0 (restart without moving i)
      i=1,j=0: a==a → i=2,j=1
      i=2,j=1: b==b → i=3,j=2
      i=3,j=2: a==a → j=3==m → found at 3-3=1! j=lps[2]=1
      ...found at index 1 and 3
    'Mismatch? Jump j to lps[j-1], not 0. Never re-check matched chars.'
  Steps to memorize (Phase 1 — build LPS):
    1. lps[0] = 0; len = 0, i = 1
    2. If pattern[i] === pattern[len]: len++, lps[i] = len, i++
    3. Else if len > 0: len = lps[len-1] (key fallback); else: lps[i] = 0, i++
  Steps to memorize (Phase 2 — search):
    1. i = 0 (text), j = 0 (pattern)
    2. Match: i++, j++; if j === m → found at i-j, j = lps[j-1]
    3. Mismatch: if j > 0 → j = lps[j-1]; else i++
  Mnemonic: "LPS tells you: 'don't restart from zero, restart from this shorter match.'"

rabinKarp — O(n+m) average time
  Problem: Find the first occurrence of pattern in text using a rolling hash.
  Use when: "rolling hash", "multi-pattern search", "hash-based string matching"
  Example:
    text="abcde", pattern="bcd", base=26, power=26^2=676
    pHash = hash("bcd")
    tHash = hash("abc") != pHash → slide window:
      remove 'a': tHash = (tHash - ord('a')*676 + mod) % mod
      add 'd':    tHash = (tHash*26 + ord('d')) % mod
    tHash now = hash("bcd") == pHash → verify "bcd"=="bcd" → return 1 ✓
    'Roll: subtract left*power, multiply by base, add right. O(1) per slide.'
  Steps:
    1. Compute pHash and initial tHash over first m chars
    2. For each window: if hashes match AND string matches → return i
    3. Roll hash: remove left char (tHash - leftChar * power), add right char (tHash * base + rightChar)
    4. Always take mod; add mod before mod to avoid negatives
  Mnemonic: "Hash match? Verify. Then slide: drop left, add right."`,
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
        let rootX = this.find(x);
        let rootY = this.find(y);

        if (rootX === rootY) {
            return false;  // already in the same component — would create a cycle
        }

        // Union by rank: attach shorter tree under taller tree
        if (this.rank[rootX] < this.rank[rootY]) {
            const temp = rootX;
            rootX = rootY;
            rootY = temp;
        }

        this.parent[rootY] = rootX;

        if (this.rank[rootX] === this.rank[rootY]) {
            this.rank[rootX]++;
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Kruskal's Algorithm
// Uses Union-Find to detect cycles; greedily picks cheapest edges
class UnionFind {
    constructor(n) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = new Array(n).fill(0);
    }

    find(x) {
        repeatWhile(
            () => this.parent[x] !== x,
            () => {
                this.parent[x] = this.parent[this.parent[x]];  // path compression
                x = this.parent[x];
            }
        );
        return x;
    }

    union(x, y) {
        let rootX = this.find(x);
        let rootY = this.find(y);

        if (rootX === rootY) {
            return false;  // already in the same component — would create a cycle
        }

        // Union by rank: attach shorter tree under taller tree
        if (this.rank[rootX] < this.rank[rootY]) {
            const temp = rootX;
            rootX = rootY;
            rootY = temp;
        }

        this.parent[rootY] = rootX;

        if (this.rank[rootX] === this.rank[rootY]) {
            this.rank[rootX]++;
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

    forEach(edges, ([weight, u, v]) => {
        // Add edge only if it doesn't create a cycle
        if (uf.union(u, v)) {
            mstCost += weight;
            mstEdges++;

            // MST has exactly n-1 edges — we're done
            if (mstEdges === n - 1) {
                return mstCost;
            }
        }
    });

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

    repeatWhile(
        () => heap.length > 0 && visited.size < n,
        () => {
            // Extract minimum cost edge (sort simulates a min-heap)
            heap.sort((a, b) => a[0] - b[0]);
            const [cost, u] = heap.shift();

            // Skip if this node was already added to the MST
            if (visited.has(u)) {
                return;
            }

            visited.add(u);
            total += cost;

            // Add all edges from u to unvisited neighbors
            forEach(adj[u] || [], ([weight, v]) => {
                if (!visited.has(v)) {
                    heap.push([weight, v]);
                }
            });
        }
    );

    // If not all nodes were visited, graph is disconnected
    return visited.size === n ? total : -1;
}`,
    verification: `kruskal:
  Greedy choice: always add the cheapest edge that does not create a cycle
  Assume wrong: suppose a cheaper MST skips edge e (chosen by Kruskal) and uses heavier edge f instead.
    Replacing f with e still connects the same components and has lower or equal cost. Contradiction ✓
  Cycle check: uf.union returns false when u and v share a root — that edge would create a second path ✓
  Termination: mstEdges===n-1 connects all n nodes with exactly n-1 edges; disconnected graph returns -1 ✓

prim:
  Greedy choice: always add the cheapest edge crossing into unvisited territory
  Why this is safe: the MST cut property — the minimum weight edge crossing any cut is in some MST ✓
  Why skipping visited nodes is correct: re-adding a visited node would create a cycle ✓
  Termination: visited.size===n means all nodes are in the MST ✓`,
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

WHEN TO USE: "connect all nodes with minimum cost" = MST.

TEMPLATE-BY-TEMPLATE MEMORIZATION:

UnionFind (for MST — same as Union Find topic) — O(α(n)) per operation
  Problem: Use Union-Find to detect cycles while building a minimum spanning tree with Kruskal's.
  Use when: Building MST with Kruskal's algorithm.
  Example:
    Edges sorted by weight: (A-B,1) (B-C,2) (A-C,3) (C-D,4)
    union(A,B): different → merge. cost=1
    union(B,C): find(B)=A, find(C)=C → merge. cost=3
    union(A,C): find(A)=A, find(C)=A → SAME! skip (cycle)
    union(C,D): different → merge. cost=7, edges=3=n-1 → done!
    'union() returns false = would create cycle = skip this edge.'
  Steps:
    1. Reuse constructor, find (path compression), union (by rank)
  Mnemonic: "Already memorized. Just copy it here."

kruskal — O(E log E) time
  Problem: Given a weighted undirected graph, find the minimum cost to connect all n nodes (minimum spanning tree).
  Use when: "minimum spanning tree", "connect all nodes with minimum cost", "Kruskal's"
  Example:
    n=4, edges sorted: [[1,0,1],[2,0,2],[3,1,2],[4,1,3],[5,2,3]]
    [1,0,1]: union(0,1) ✓  mstCost=1,  mstEdges=1
    [2,0,2]: union(0,2) ✓  mstCost=3,  mstEdges=2
    [3,1,2]: find(1)=0, find(2)=0 → SKIP (cycle)
    [4,1,3]: union ✓  mstCost=7,  mstEdges=3=n-1 → done!
    Return 7 ✓
    'Sort cheapest first. Union greedily. Skip if same component.'
  Steps:
    1. Sort edges by weight ascending
    2. For each [weight, u, v]: if uf.union(u, v) succeeds → add to MST (mstCost += weight, mstEdges++)
    3. Stop early when mstEdges === n-1
    4. Return mstCost if mstEdges === n-1, else -1
  Mnemonic: "Sort, union, skip cycles, stop at n-1 edges."

prim — O(E log V) time
  Problem: Given a weighted undirected graph, find the minimum cost to connect all n nodes using Prim's algorithm.
  Use when: "minimum spanning tree", "Prim's algorithm", "grow MST from one node"
  Example:
    n=4, adj: 0→[(1,1),(2,2)], 1→[(3,2),(4,3)], ...
    heap=[[0,0]], visited={}
    Pop [0,0]: add 0, push [1,1],[2,2]. total=0
    Pop [1,1]: add 1, push [3,2],[4,3]. total=1
    Pop [2,2]: add 2, push [5,3]. total=3
    Pop [3,2]: node 2 visited → skip
    Pop [4,3]: add 3. total=7, visited=4=n → done!
    Return 7 ✓
    'Greedy BFS: always grab cheapest bridge to unvisited territory.'
  Steps:
    1. heap = [[0, startNode]]; visited = new Set()
    2. Pop min [cost, u]; if visited → skip; add to visited, total += cost
    3. Push all [weight, v] for unvisited neighbors
    4. Return total if all nodes visited, else -1
  Mnemonic: "BFS with a heap. Always grab the cheapest edge to new territory."`,
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

    for (let currentIndex = 0; currentIndex < n; currentIndex++) {
        const currentVal = nums[currentIndex];
        // Pop all indices whose values are smaller than current
        while (stack.length > 0) {
            const topIndex = stack[stack.length - 1];
            const topVal = nums[topIndex];
            if (currentVal <= topVal) {
                break;
            }
            stack.pop();
            result[topIndex] = currentVal;  // currentVal is the next greater element for topIndex
        }
        stack.push(currentIndex);
    }

    return result;
}

// Daily Temperatures
// Same structure: pop when current temp is warmer; answer is the number of days waited
function dailyTemperatures(temps) {
    const n = temps.length;
    const result = new Array(n).fill(0);  // 0 means no warmer day ahead
    const stack = [];  // stores indices

    for (let todayIndex = 0; todayIndex < n; todayIndex++) {
        const todayTemp = temps[todayIndex];
        while (stack.length > 0) {
            const waitingIndex = stack[stack.length - 1];
            const waitingTemp = temps[waitingIndex];
            if (todayTemp <= waitingTemp) {
                break;
            }
            stack.pop();
            const daysWaited = todayIndex - waitingIndex;
            result[waitingIndex] = daysWaited;  // days until a warmer temperature
        }
        stack.push(todayIndex);
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

    for (let currentIndex = 0; currentIndex < heights.length; currentIndex++) {
        const currentHeight = heights[currentIndex];
        while (stack.length > 0) {
            const topIndex = stack[stack.length - 1];
            const topHeight = heights[topIndex];
            if (topHeight <= currentHeight) {
                break;
            }
            const poppedIndex = stack.pop();
            const barHeight = heights[poppedIndex];

            // Left boundary is the new stack top; if empty, extends to the start
            const leftBoundary = stack.length > 0 ? stack[stack.length - 1] : -1;
            const barWidth = currentIndex - leftBoundary - 1;

            maxArea = Math.max(maxArea, barHeight * barWidth);
        }
        stack.push(currentIndex);
    }

    heights.pop();  // restore original array
    return maxArea;
}

// Trapping Rain Water
// Water collects in valleys between two walls
function trap(height) {
    const stack = [];
    let water = 0;

    for (let currentIndex = 0; currentIndex < height.length; currentIndex++) {
        const currentHeight = height[currentIndex];
        while (stack.length > 0) {
            const topIndex = stack[stack.length - 1];
            const topHeight = height[topIndex];
            if (currentHeight <= topHeight) {
                break;
            }
            const bottomIndex = stack.pop();
            const bottomHeight = height[bottomIndex];

            // Need a left wall; if stack is empty, no container possible
            if (stack.length === 0) {
                break;
            }

            const leftWallIndex = stack[stack.length - 1];
            const width = currentIndex - leftWallIndex - 1;
            const boundedHeight = Math.min(currentHeight, height[leftWallIndex]) - bottomHeight;
            water += width * boundedHeight;
        }
        stack.push(currentIndex);
    }

    return water;
}`,
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Next Greater Element
// Decreasing stack: pop when current > top; current is the "next greater" for popped items
function nextGreater(nums) {
    const n = nums.length;
    const result = new Array(n).fill(-1);  // default: no next greater element
    const stack = [];  // stores indices; values in decreasing order

    forEachBetween(0, n, (currentIndex) => {
        const currentVal = nums[currentIndex];
        // Pop all indices whose values are smaller than current
        repeatWhile(
            () => {
                if (stack.length === 0) return false;
                const topIndex = stack[stack.length - 1];
                const topVal = nums[topIndex];
                return currentVal > topVal;
            },
            () => {
                const topIndex = stack.pop();
                result[topIndex] = currentVal;  // currentVal is the next greater element for topIndex
            }
        );
        stack.push(currentIndex);
    });

    return result;
}

// Daily Temperatures
// Same structure: pop when current temp is warmer; answer is the number of days waited
function dailyTemperatures(temps) {
    const n = temps.length;
    const result = new Array(n).fill(0);  // 0 means no warmer day ahead
    const stack = [];  // stores indices

    forEachBetween(0, n, (todayIndex) => {
        const todayTemp = temps[todayIndex];
        repeatWhile(
            () => {
                if (stack.length === 0) return false;
                const waitingIndex = stack[stack.length - 1];
                const waitingTemp = temps[waitingIndex];
                return todayTemp > waitingTemp;
            },
            () => {
                const waitingIndex = stack.pop();
                const daysWaited = todayIndex - waitingIndex;
                result[waitingIndex] = daysWaited;  // days until a warmer temperature
            }
        );
        stack.push(todayIndex);
    });

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

    forEachBetween(0, heights.length, (currentIndex) => {
        const currentHeight = heights[currentIndex];
        repeatWhile(
            () => {
                if (stack.length === 0) return false;
                const topIndex = stack[stack.length - 1];
                const topHeight = heights[topIndex];
                return topHeight > currentHeight;
            },
            () => {
                const poppedIndex = stack.pop();
                const barHeight = heights[poppedIndex];

                // Left boundary is the new stack top; if empty, extends to the start
                const leftBoundary = stack.length > 0 ? stack[stack.length - 1] : -1;
                const barWidth = currentIndex - leftBoundary - 1;

                maxArea = Math.max(maxArea, barHeight * barWidth);
            }
        );
        stack.push(currentIndex);
    });

    heights.pop();  // restore original array
    return maxArea;
}

// Trapping Rain Water
// Water collects in valleys between two walls
function trap(height) {
    const stack = [];
    let water = 0;

    forEachBetween(0, height.length, (currentIndex) => {
        const currentHeight = height[currentIndex];
        repeatWhile(
            () => {
                if (stack.length === 0) return false;
                const topIndex = stack[stack.length - 1];
                const topHeight = height[topIndex];
                return currentHeight > topHeight;
            },
            () => {
                const bottomIndex = stack.pop();
                const bottomHeight = height[bottomIndex];

                // Need a left wall; if stack is empty, no container possible
                if (stack.length === 0) {
                    return;
                }

                const leftWallIndex = stack[stack.length - 1];
                const width = currentIndex - leftWallIndex - 1;
                const boundedHeight = Math.min(currentHeight, height[leftWallIndex]) - bottomHeight;
                water += width * boundedHeight;
            }
        );
        stack.push(currentIndex);
    });

    return water;
}`,
    verification: `nextGreater:
  Promise: 'result[j] = first element to the right of j greater than nums[j]; stack holds unresolved indices in decreasing value order'
  Init: result filled with -1; stack=[]; trivially holds ✓
  Maintain:
    What changes? when nums[i] > nums[stack.top], pop j and set result[j]=nums[i]
    Could we miss a next-greater? only if we push i before popping all smaller elements
    The while-loop resolves all smaller elements before pushing i ✓
  Terminate: i===n; remaining stack indices have no next-greater (stay -1) ✓

dailyTemperatures:
  Promise: 'same as nextGreater but result[j] records the distance i-j instead of the value'
  Flip test: what if we recorded nums[i] instead of i-j?
    We would answer "what is the warmer temperature" not "how many days" — wrong ✓

largestRectangleArea:
  Promise: 'stack holds indices in strictly increasing height order; every popped bar yields its maximal rectangle'
  Init: stack=[]; trivially increasing ✓
  Maintain:
    When heights[i] < heights[stack.top]: pop poppedIdx; height = heights[poppedIdx]
    leftBoundary = new stack.top (or -1 if empty); width = i - leftBoundary - 1 ✓
    Flip test: what if we skipped the sentinel 0?
      Bars remaining in the stack at the end would never be popped, missing their rectangles ✓
  Terminate: all bars processed including sentinel; maxArea is correct ✓

trap:
  Promise: 'water = total trapped water between all processed valleys'
  When a taller bar arrives: pop valley bottom; compute water = (min(rightWall, leftWall) - valleyFloor) * width ✓
  Empty-stack break: no left wall means no container — water drains, correctly adds 0 ✓`,
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
  Trapping Rain Water → pop when taller → water += width * bounded_height

TEMPLATE-BY-TEMPLATE MEMORIZATION:

nextGreater — O(n) time
  Problem: Given an array, return an array where result[i] is the next element to the right greater than nums[i], or -1 if none.
  Use when: "next greater element", "find next larger value"
  Example:
    Input: [2,1,2,4,3]
    i=0(2): push 0. stack=[0(2)]
    i=1(1): 1<2 → push 1. stack=[0(2),1(1)]
    i=2(2): 2>1 → pop 1, result[1]=2. 2=2 → stop. push 2. stack=[0(2),2(2)]
    i=3(4): 4>2 → pop 2,result[2]=4. 4>2 → pop 0,result[0]=4. push 3.
    i=4(3): 3<4 → push 4. stack=[3,4] → result[3]=result[4]=-1
    Result: [4,2,4,-1,-1] ✓
    'Stack holds unresolved indices. Larger arrival resolves all smaller above it.'
  Steps:
    1. result filled with -1; stack = []
    2. For each i: while stack not empty AND nums[i] > nums[stack top]: pop j, result[j] = nums[i]
    3. Push i
  Mnemonic: "Current is bigger than stack top? That top just found its next greater."

dailyTemperatures — O(n) time
  Problem: Given daily temperatures, return an array where result[i] is the number of days to wait for a warmer day (0 if none).
  Use when: "daily temperatures", "days until next warmer", "next greater with distance"
  Example:
    Input: [73,74,75,71,69,72]
    i=0(73): push 0
    i=1(74): 74>73 → pop 0, result[0]=1-0=1. push 1.
    i=2(75): 75>74 → pop 1, result[1]=2-1=1. push 2.
    i=3(71): push 3. i=4(69): push 4.
    i=5(72): 72>69 → pop 4, result[4]=5-4=1. 72>71 → pop 3, result[3]=5-3=2. push 5.
    Result: [1,1,4,2,1,0] ✓ (result[2]=4 resolved later)
    'Same as nextGreater, but record distance (i-j) instead of value.'
  Steps:
    1. result filled with 0; stack = []
    2. For each i: while stack not empty AND temps[i] > temps[stack top]: pop j, result[j] = i - j
    3. Push i
  Mnemonic: "Identical to nextGreater, but record i - j instead of nums[i]."

largestRectangleArea — O(n) time
  Problem: Given an array of bar heights, find the largest rectangle that can be formed within the histogram.
  Use when: "largest rectangle in histogram", "maximal rectangle"
  Example:
    heights=[2,1,5,6,2,3] + sentinel 0
    i=1(h=1): 1<2 → pop idx0(h=2): left=-1, w=1, area=2
    i=4(h=2): 2<6 → pop idx3(h=6): left=2, w=1, area=6
               2<5 → pop idx2(h=5): left=1, w=2, area=10 (max!)
    sentinel 0 flushes remaining...
    maxArea=10 ✓
    'Shorter bar = right boundary for all taller bars above it in stack.'
  Steps:
    1. Append 0 sentinel to heights
    2. For each i: while stack not empty AND heights[stack top] > heights[i]:
       pop poppedIdx; height = heights[poppedIdx]; leftBoundary = stack top (or -1 if empty)
       width = i - leftBoundary - 1; maxArea = max(maxArea, height * width)
    3. Push i; remove sentinel
  Mnemonic: "Pop shorter bars. Width = gap between new top and current i. Append 0 to flush all."

trap (stack version) — O(n) time
  Problem: Given an array representing an elevation map, compute the total water that can be trapped after rain.
  Use when: "trapping rain water" (stack approach), "water between bars"
  Example:
    height=[0,1,0,2], stack builds decreasingly
    i=2(h=0): 0<1 → push. stack=[0(0),1(1),2(0)]
    i=3(h=2): 2>0 → pop idx2(floor=0):
      leftWall=idx1(h=1), rightWall=idx3(h=2)
      width=3-1-1=1, bounded=min(2,1)-0=1, water=1
    2>1 → pop idx1(floor=1):
      stack empty → break (no left wall)
    Final water=1 (trapped between walls) ✓
    'Pop floor, left=new top, right=current. water=(min walls-floor)*width.'
  Steps:
    1. For each i: while stack not empty AND height[i] > height[stack top]:
       pop bottom; if stack empty → break (no left wall)
       leftWall = stack top; width = i - leftWall - 1
       boundedHeight = min(height[i], height[leftWall]) - height[bottom]
       water += width * boundedHeight
    2. Push i
  Mnemonic: "Pop the valley floor. Left wall = new top. Water = (min of two walls - floor) * width."`,
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// BIT (Fenwick Tree): efficient prefix sums with O(log n) point update
// Magic: i & (-i) = lowest set bit. Update goes UP (+lsb), query goes DOWN (-lsb)
class BIT {
    constructor(n) {
        this.n = n;
        // MUST be 1-indexed — index 0 is never used
        this.tree = new Array(n + 1).fill(0);
    }
    // Add delta to 1-indexed position i; propagates up using +lsb
    update(i, delta) {
        repeatWhile(
            () => i <= this.n,
            () => {
                this.tree[i] += delta;
                i += i & (-i);  // add lowest set bit to reach next responsible node
            }
        );
    }

    // Prefix sum from 1 to i (inclusive); accumulates down using -lsb
    query(i) {
        let total = 0;
        repeatWhile(
            () => i > 0,
            () => {
                total += this.tree[i];
                i -= i & (-i);  // remove lowest set bit to reach next contributing node
            }
        );
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

        forEach(nums, (val, i) => {
            this.bit.update(i + 1, val);  // convert 0-indexed to 1-indexed
        });
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

    forEachFromRight(nums, (val, i) => {
        const r = rank.get(val);
        // Count elements already seen (to the right of i) that are smaller than nums[i]
        inversions += bit.query(r - 1);
        // Mark nums[i] as seen
        bit.update(r, 1);
    });

    return inversions;
}`,
    verification: `BIT.update:
  Promise: 'tree[j] updated for every j that is a responsible ancestor of i; all prefix sums remain correct after the delta'
  Why this works: any prefix query for [1..k] with k>=i passes through exactly the nodes updated here ✓
  Flip test: what if we forgot to update tree[i] itself?
    The current range would not reflect the delta, corrupting all prefix sums containing i ✓
  Terminate: i > n; all responsible ancestors updated ✓

BIT.query:
  Promise: 'total accumulates exactly the tree nodes whose ranges together cover [1..i] without gaps or overlap'
  Why ranges tile perfectly: subtracting the lowest set bit from i jumps to the predecessor whose range ends just before i; these ranges partition [1..i] ✓
  Flip test: what if we subtracted a different bit?
    Ranges would overlap or leave gaps, giving a wrong sum ✓
  Terminate: i=0; complete ✓

countInversions (BIT version):
  Promise: 'after processing index i right-to-left, bit holds frequencies of nums[i+1..n-1]; inversions counts pairs with left element larger than right'
  Init: bit empty; no elements to the right of the last index ✓
  Maintain:
    bit.query(r-1) counts elements already registered with rank < r (smaller than nums[i]) ✓
    bit.update(r, 1) registers nums[i] ✓
  Terminate: i=0; all inversions counted ✓`,
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

WHEN TO USE: "prefix sum + updates" or "count smaller/larger elements"

TEMPLATE-BY-TEMPLATE MEMORIZATION:

BIT (constructor) — O(n) initialization
  Problem: Initialize a Binary Indexed Tree (Fenwick Tree) for n elements to support prefix sum queries and point updates.
  Use when: Setting up a BIT for prefix sums with point updates.
  Example:
    n=4, build from [1,3,5,7]:
    update(1,1): tree[1]+=1, tree[2]+=1, tree[4]+=1
    update(2,3): tree[2]+=3, tree[4]+=3
    update(3,5): tree[3]+=5, tree[4]+=5
    update(4,7): tree[4]+=7
    tree=[0,1,4,5,16]  (1-indexed, index 0 unused)
    '1-indexed. Each index i covers a range determined by its lowest set bit.'
  Steps:
    1. this.n = n; this.tree = new Array(n + 1).fill(0)
  Mnemonic: "1-indexed array. Leave index 0 empty."

BIT.update — O(log n) time
  Problem: Add a delta value to the element at 1-indexed position i, maintaining correct prefix sums.
  Use when: "point update on BIT", "add value at index"
  Example:
    n=8. update(3, +5) — add 5 at index 3:
    i=3 (0011): tree[3]+=5. lsb=1. i=3+1=4
    i=4 (0100): tree[4]+=5. lsb=4. i=4+4=8
    i=8 (1000): tree[8]+=5. lsb=8. i=8+8=16>8 → stop
    3 nodes updated: covers indices containing 3
    'Add lowest set bit to climb UP. Every ancestor covering index 3 is updated.'
  Steps:
    1. While i <= n: tree[i] += delta; i += i & (-i)
  Mnemonic: "Add lowest set bit to climb up the tree."

BIT.query — O(log n) time
  Problem: Return the prefix sum from index 1 to i (inclusive).
  Use when: "prefix sum query on BIT", "sum from 1 to i"
  Example:
    query(6): prefix sum from 1 to 6
    i=6 (0110): total+=tree[6] (covers [5,6]). lsb=2. i=6-2=4
    i=4 (0100): total+=tree[4] (covers [1,4]). lsb=4. i=4-4=0 → stop
    total = tree[6]+tree[4] = sum[5,6] + sum[1,4] = sum[1,6] ✓
    'Remove lowest set bit to descend. Ranges tile perfectly: no gaps, no overlaps.'
  Steps:
    1. total = 0; while i > 0: total += tree[i]; i -= i & (-i)
    2. Return total
  Mnemonic: "Remove lowest set bit to descend. Accumulate as you go."

BIT.rangeQuery — O(log n) time
  Problem: Return the sum of elements from 1-indexed position l to r (inclusive).
  Use when: "range sum query on BIT"
  Example:
    nums=[1,3,5,7], rangeQuery(2,3) = 3+5 = 8
    query(3) = prefix[1..3] = 9
    query(1) = prefix[1..1] = 1
    rangeQuery = 9 - 1 = 8 ✓
    'Range [l,r] = query(r) - query(l-1). Identical to prefix sum subtraction trick.'
  Steps:
    1. Return query(r) - query(l - 1)
  Mnemonic: "Prefix sum trick: query right minus query just before left."

NumArray — O(n log n) build, O(log n) per query/update
  Problem: Design a class that supports range sum queries and point updates on a mutable array.
  Use when: "range sum mutable", "point update + range query"
  Example:
    nums=[1,3,5,7]. update(1, 10): change nums[1]=3 to 10
    delta = 10 - 3 = 7
    bit.update(2, 7): propagates +7 to tree[2], tree[4], ...
    sumRange(0,2): bit.rangeQuery(1,3) = query(3)-query(0) = 21
    Old sum[0,2]=9, new sum[0,2]=16 (1+10+5) ✓
    'Store delta not absolute. Keep copy of nums to compute delta=new-old.'
  Steps:
    1. Build BIT by calling update(i+1, nums[i]) for each element
    2. update(index, val): delta = val - nums[index]; nums[index] = val; bit.update(index+1, delta)
    3. sumRange(l, r): bit.rangeQuery(l+1, r+1)
  Mnemonic: "Only pass the delta (diff), not the absolute value. Convert 0-indexed to 1-indexed."

countInversions (BIT version) — O(n log n) time
  Problem: Count the number of inversions in an array — pairs (i, j) where i < j but nums[i] > nums[j].
  Use when: "count inversions with BIT", "count smaller to the right"
  Example:
    [3,1,2], compress: {1→1, 2→2, 3→3}
    Process right to left:
    i=2: val=2, r=2. query(1)=0 (nothing seen). update(2,1). inv=0
    i=1: val=1, r=1. query(0)=0. update(1,1). inv=0
    i=0: val=3, r=3. query(2)=2 (saw ranks 1,2). inv=2 ✓
    '(3,1) and (3,2) are inversions. Seen-to-right with smaller rank = inversion.'
  Steps:
    1. Coordinate compress: assign ranks 1..k to sorted unique values
    2. Process right to left: inversions += bit.query(rank[num] - 1); bit.update(rank[num], 1)
    3. Return inversions
  Mnemonic: "Going right to left: how many smaller values have I already seen to my right?"`,
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
    const inDegree = new Array(numNodes).fill(0); // inDegree[i] = number of prerequisites for node i

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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// Kahn's Algorithm — BFS-based topological sort
// Key idea: repeatedly remove nodes with no remaining dependencies
function topologicalSortKahn(numNodes, edges) {
    // Build adjacency list and count prerequisites for each node
    const graph = Array.from({ length: numNodes }, () => []);
    const inDegree = new Array(numNodes).fill(0); // inDegree[i] = number of prerequisites for node i

    forEach(edges, ([u, v]) => {
        graph[u].push(v);    // u must come before v
        inDegree[v]++;       // v gains one more prerequisite
    });

    // Seed the queue with nodes that have no prerequisites
    const queue = [];
    forEachBetween(0, numNodes, (i) => {
        if (inDegree[i] === 0) {
            queue.push(i);
        }
    });

    const order = [];

    repeatWhile(
        () => queue.length > 0,
        () => {
            const node = queue.shift();
            order.push(node);

            for (const neighbor of graph[node]) {
                inDegree[neighbor]--;

                if (inDegree[neighbor] === 0) {
                    queue.push(neighbor);
                }
            }
        }
    );

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

    forEach(edges, ([u, v]) => {
        graph[u].push(v);
    });

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

    let hasCycle = false;
    forEachBetween(0, numNodes, (i) => {
        if (hasCycle) return; // cycle already detected
        if (state[i] === UNVISITED) {
            if (!dfs(i)) {
                hasCycle = true;
            }
        }
    });

    return hasCycle ? [] : order.reverse();
}`,
    verification: `topologicalSortKahn:
  Promise: 'order contains nodes in topological order; every node in order has all its prerequisites already in order before it'
  Init: queue contains all nodes with inDegree=0 (no prerequisites) ✓
  Maintain:
    What changes? pop node, add to order, decrement inDegree of all neighbors; enqueue neighbors that reach 0
    Could a node be added before its prerequisites? only if some prerequisite edge points to a node already in order
    Flip test: what if we enqueued a node with inDegree>0?
      A prerequisite would not yet be in order, violating topo order. The if(inDegree===0) guard prevents this ✓
  Terminate: queue empty; if order.length < numNodes → cycle (some nodes never reached inDegree=0) ✓

canFinish:
  Greedy choice: run Kahn's and check if all courses are processed
  Why cycle detection works: in a cycle every node has at least one incoming edge that never gets decremented to 0 (its predecessor is blocked too); so cyclic nodes are never enqueued ✓
  Correctness: all courses finishable iff the prerequisite graph is a DAG iff Kahn's processes all n nodes ✓

topologicalSortDFS:
  Promise: 'order (before reverse) = post-order of the DFS; after reverse, all edges point from earlier to later in the list'
  Three states ensure: UNVISITED nodes are visited once; IN_PROGRESS → IN_PROGRESS is a back edge = cycle ✓
  Post-order guarantee: a node is pushed only after ALL its reachable descendants are pushed; so it ends up before them after reverse ✓
  Flip test: what if we used only two states (visited/not)?
    We could not distinguish a cross edge from a back edge, missing cycle detection ✓`,
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
  - "Alien/custom ordering" → extract edges from constraints, topo sort

TEMPLATE-BY-TEMPLATE MEMORIZATION:

topologicalSortKahn — O(V+E) time
  Problem: Given a DAG with n nodes and directed edges, return a valid topological ordering, or empty if a cycle exists.
  Use when: "topological sort", "course order", "dependency ordering"
  Example:
    n=4, edges=[[0,1],[0,2],[1,3],[2,3]]
    inDegree=[0,1,1,2], queue=[0]
    Pop 0: dec inDeg[1]→0, inDeg[2]→0. queue=[1,2]. order=[0]
    Pop 1: dec inDeg[3]→1. order=[0,1]
    Pop 2: dec inDeg[3]→0. queue=[3]. order=[0,1,2]
    Pop 3: order=[0,1,2,3] → length=4=n → return ✓
    'In-degree 0 = ready. Process, decrement neighbors, enqueue newly freed.'
  Steps:
    1. Build graph and inDegree from edges
    2. Queue all nodes where inDegree === 0
    3. Pop node → push to order → for each neighbor: inDegree[neighbor]--; if 0 → enqueue
    4. order.length === numNodes ? return order : return [] (cycle)
  Mnemonic: "Peel nodes with no dependencies. Cycle = not all nodes peeled."

canFinish — O(V+E) time
  Problem: Given n courses and a list of prerequisite pairs, return true if it's possible to finish all courses.
  Use when: "can finish all courses", "is there a cycle in prerequisites", "course schedule"
  Example:
    n=4, prerequisites=[[1,0],[2,1],[3,2],[1,3]]  (course 1 requires 0, etc.)
    Build graph: 0→1, 1→2, 2→3, 3→1  (cycle: 1→2→3→1)
    inDegree=[0,1,1,1], queue=[0]
    Pop 0: dec inDeg[1]→0. queue=[1]. order=[0]
    Pop 1: dec inDeg[2]→0. queue=[2]. order=[0,1]
    Pop 2: dec inDeg[3]→0. queue=[3]. order=[0,1,2]
    Pop 3: dec inDeg[1]→-1 (already 0). order=[0,1,2,3]. length=4=n → return true
    Cycle example: [[0,1],[1,0]] → inDeg=[1,1], queue=[] → order.length=0 ≠ 2 → false
    'Kahn finishes all nodes iff no cycle. Stuck queue means a cycle exists.'
  Steps:
    1. Run topologicalSortKahn(numCourses, prerequisites)
    2. Return order.length === numCourses
  Mnemonic: "Topo sort succeeds on DAGs. Cycle means impossible."

topologicalSortDFS — O(V+E) time
  Problem: Topologically sort a DAG using DFS with three-state cycle detection.
  Use when: "topological sort via DFS", "cycle detection in directed graph"
  Example:
    nodes=0..4, edges: 0→2, 0→3, 1→3, 1→4, 2→4  (all states start UNVISITED)
    dfs(0): mark IN_PROGRESS → dfs(2): mark IN_PROGRESS → dfs(4): no children → push 4, mark DONE
      back in dfs(2): push 2, mark DONE
      dfs(3): no children → push 3, mark DONE
      back in dfs(0): push 0, mark DONE. order=[4,2,3,0]
    dfs(1): dfs(3) DONE skip; dfs(4) DONE skip → push 1, mark DONE. order=[4,2,3,0,1]
    reverse: [1,0,3,2,4]  (valid: all edges point forward)
    Cycle detection: if dfs reaches an IN_PROGRESS node → cycle → return false
    'Post-order: pushed after all descendants. Reverse = topological order.'
  Steps:
    1. dfs(node): if IN_PROGRESS → cycle (return false); if DONE → return true
    2. Mark IN_PROGRESS; recurse all neighbors; mark DONE; order.push(node)
    3. Run dfs on all UNVISITED nodes; return order.reverse()
  Mnemonic: "Post-order = add yourself after all children. Reverse gives topo order."`,
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
    jsTemplateReadable: `// (Uses shared helpers defined in Arrays & Hashing)

// JavaScript concurrency uses Promises and async/await.
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
        await forEachBetween(0, this.n, async (i) => {
            // Spin-wait until it's A's turn (yields control each iteration)
            while (this.turn !== 'a') {
                await new Promise(r => setTimeout(r, 0));
            }
            action();
            this.turn = 'b';  // pass the turn to B
        });
    }

    async threadB(action) {
        await forEachBetween(0, this.n, async (i) => {
            while (this.turn !== 'b') {
                await new Promise(r => setTimeout(r, 0));
            }
            action();
            this.turn = 'a';  // pass the turn back to A
        });
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
        await forEachBetween(0, this.n, async (i) => {
            while (!this.fooTurn) {
                await new Promise(r => setTimeout(r, 0));
            }
            printFoo();
            this.fooTurn = false;
        });
    }
    async bar(printBar) {
        await forEachBetween(0, this.n, async (i) => {
            while (this.fooTurn) {
                await new Promise(r => setTimeout(r, 0));
            }
            printBar();
            this.fooTurn = true;
        });
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
        repeatWhile(
            () => this.hydrogenQueue.length >= 2 && this.oxygenQueue.length >= 1,
            () => {
                this.hydrogenQueue.shift()();
                this.hydrogenQueue.shift()();
                this.oxygenQueue.shift()();
            }
        );
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
    verification: `Sequential / PrintInOrder:
  Safety: without gates, step2 or step3 could run before their predecessors
  Prevention: each step awaits a Promise resolved only when its predecessor finishes; a Promise resolves at most once, so each gate opens exactly once ✓
  Deadlock check: no circular wait — step1 resolves gate1, step2 awaits gate1 and resolves gate2, step3 awaits gate2 only; the dependency chain is strictly linear ✓

FooBar / Alternating:
  Safety: both threads could execute the same turn simultaneously
  Prevention: JavaScript is single-threaded; the flag check and flip are uninterruptible within one microtask; setTimeout(0) yields control so the other coroutine can advance ✓
  Deadlock check: after n iterations both loops complete; no thread ever waits forever because the other will always eventually flip the flag ✓

AsyncQueue:
  Safety: producer could enqueue into a full queue, or consumer could dequeue from an empty queue
  Prevention: each is suspended by pushing a resolve into a waiting list; the other side calls shift()() to wake exactly one waiter after each state change ✓
  Deadlock check: a producer is always woken by a consumer and vice versa; the queue state changes before the wake, so no circular-wait scenario can arise ✓

H2O:
  Safety: molecules could form with the wrong atom ratio
  Prevention: tryFormWater fires only when hydrogenQueue.length >= 2 AND oxygenQueue.length >= 1; atoms are dequeued atomically as a group of exactly 2H + 1O ✓
  Deadlock check: no locks are held; all execution is synchronous within a single event-loop tick; no thread waits on another thread ✓

DiningPhilosophers:
  Safety: all 5 philosophers grab their left fork simultaneously, then each waits for the right fork forever
  Prevention: seatedCount is capped at 4; with 4 seated and 5 forks, by pigeonhole at least one philosopher holds no fork, so its neighbor can always acquire both ✓
  Deadlock check: circular wait requires all 5 to be seated at once; the cap of 4 breaks this condition ✓`,
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

Mnemonic: "MHNC" - Mutual exclusion, Hold-and-wait, No preemption, Circular wait

PER-PROBLEM MEMORY TRICKS:

PRINT IN ORDER (#1114):
  "Chain of promises: each step resolves the next gate."
  2 promises, 2 resolvers. first() fires resolver1, second() awaits promise1 then fires resolver2.
  Mnemonic: "Relay race — pass the baton."

FOOBAR ALTERNATELY (#1115):
  "Boolean flag ping-pong: fooTurn=true/false."
  Each loop iteration: spin-wait until it's your turn, do work, flip the flag.
  Mnemonic: "Tennis — hit the ball, wait for return."

BUILDING H2O (#1117):
  "Queue atoms, flush when recipe is ready (2H + 1O)."
  Two queues (hydrogen, oxygen). After each enqueue, tryFormWater checks if 2H+1O available.
  Mnemonic: "Buffet line — serve when enough ingredients."

DINING PHILOSOPHERS (#1226):
  "One less chair than people prevents deadlock."
  Semaphore(4) with 5 forks: pigeonhole guarantees someone always gets both forks.
  Mnemonic: "Musical chairs — 4 seats, 5 players, no deadlock."

TEMPLATE-BY-TEMPLATE MEMORIZATION:

Sequential (Print in Order pattern) — O(1) per call
  Problem: Three functions must execute in order (step1 → step2 → step3) even when called concurrently in arbitrary order.
  Use when: "print in order", "enforce ordering across threads", "step1 must precede step2"
  Example:
    Threads arrive: step3 first, step1 second, step2 third
    p1=unresolved, p2=unresolved (both gates closed)
    step3 arrives: awaits p2 → BLOCKS
    step1 arrives: runs action → calls r1() → p1 resolves (gate 1 opens)
    step2 wakes: runs action → calls r2() → p2 resolves (gate 2 opens)
    step3 wakes: runs action
    Output: step1 → step2 → step3 regardless of arrival order
    'Promise gates force order. Earlier steps hand the baton by resolving.'
  Steps:
    1. step1: run action, call r1() (opens gate 1)
    2. step2: await p1, run action, call r2() (opens gate 2)
    3. step3: await p2, run action
  Mnemonic: "Relay race. Pass the baton (resolve the promise) when your leg is done."

PrintInOrder (#1114) — O(1) per call
  Problem: Implement a class where three methods (first, second, third) can be called concurrently in any order but always execute in sequence first → second → third.
  Use when: "#1114", "print in order", "ordered execution across threads"
  Example:
    Constructor: firstDone=Promise(rf1), secondDone=Promise(rf2). Both unresolved.
    Calls arrive simultaneously: third(), second(), first()
    third():  awaits secondDone  → BLOCKS on gate 2
    second(): awaits firstDone   → BLOCKS on gate 1
    first():  runs printFirst()  → calls rf1() → firstDone resolves (gate 1 opens)
    second(): wakes → runs printSecond() → calls rf2() → secondDone resolves (gate 2 opens)
    third():  wakes → runs printThird()
    Output: first → second → third ✓
    'N methods need N-1 gates. Each method holds the key to the next door.'
  Steps:
    1. Constructor: create firstDone and secondDone promises; store resolve functions
    2. first(): run printFirst(), call resolveFirst()
    3. second(): await firstDone, run printSecond(), call resolveSecond()
    4. third(): await secondDone, run printThird()
  Mnemonic: "Each method holds a key to unlock the next."

FooBar (#1115) — O(n) total
  Problem: Two threads must alternate printing "foo" and "bar" exactly n times each, in order: foobarfoobar...
  Use when: "#1115", "alternating threads", "foo bar alternately", "two threads take turns"
  Example:
    n=3, fooTurn=true (foo goes first)
    foo iteration 1: fooTurn=true  → print "foo" → fooTurn=false
    bar iteration 1: fooTurn=false → print "bar" → fooTurn=true
    foo iteration 2: fooTurn=true  → print "foo" → fooTurn=false
    bar iteration 2: fooTurn=false → print "bar" → fooTurn=true
    foo iteration 3: print "foo" → fooTurn=false
    bar iteration 3: print "bar" → done
    Output: "foobarfoobarfoobar" ✓
    'One boolean, two threads. Check → yield if wrong turn → work → flip.'
  Steps:
    1. foo loop: while !fooTurn → spin-wait (yield with setTimeout(r,0)); run printFoo(); fooTurn = false
    2. bar loop: while fooTurn → spin-wait; run printBar(); fooTurn = true
  Mnemonic: "Spin until your flag. Do work. Flip the flag."

AsyncQueue / ProducerConsumer (#1188) — O(1) per operation
  Problem: Implement a bounded async queue where producers block when full and consumers block when empty.
  Use when: "#1188", "producer consumer", "bounded buffer", "blocking queue"
  Example:
    capacity=2, queue=[], waitingProducers=[], waitingConsumers=[]
    enqueue(A): queue not full → push A. queue=[A]
    enqueue(B): queue not full → push B. queue=[A,B]
    enqueue(C): queue full! → push resolve(C) to waitingProducers → await (C BLOCKS)
    dequeue():  shift A → queue=[B] → wake waitingProducers[0] (C resumes)
    C resumes:  push C. queue=[B,C]
    dequeue():  shift B → queue=[C] → no waiting producers
    'Resolve arrays = suspended coroutines. Dequeue wakes producers, enqueue wakes consumers.'
  Steps:
    1. enqueue: if full → await (push resolve to waitingProducers); push item; wake waiting consumer
    2. dequeue: if empty → await (push resolve to waitingConsumers); shift item; wake waiting producer
  Mnemonic: "Two waiting lists act as semaphores. Wake the opposite side after each operation."

H2O (#1117) — O(1) per call
  Problem: Implement a class where hydrogen and oxygen threads must be released in groups of exactly 2H + 1O to form water molecules.
  Use when: "#1117", "building H2O", "group atoms into molecules", "release in fixed ratio"
  Example:
    Arrivals (async, any order): H1, H2, O1, H3, H4, O2
    H1: push fn1 to Hq=[fn1] → tryFormWater: 1H,0O → not enough, stop
    H2: push fn2 to Hq=[fn1,fn2] → tryFormWater: 2H,0O → not enough, stop
    O1: push fo1 to Oq=[fo1] → tryFormWater: 2H,1O → FIRE! call fn1,fn2,fo1. Hq=[], Oq=[]
        loop: 0H,0O → stop
    H3: Hq=[fn3], tryFormWater: 1H,0O → stop
    H4: Hq=[fn3,fn4], O2: Oq=[fo2] → tryFormWater: 2H,1O → FIRE! call fn3,fn4,fo2
    'Buffer arrivals. tryFormWater loops greedily: call 2H+1O until recipe fails.'
  Steps:
    1. hydrogen(fn): push fn to hydrogenQueue; tryFormWater()
    2. oxygen(fn): push fn to oxygenQueue; tryFormWater()
    3. tryFormWater: while hydrogenQueue.length >= 2 && oxygenQueue.length >= 1: call 2 H + 1 O
  Mnemonic: "Buffer atoms. Flush when 2H + 1O are ready."

DiningPhilosophers (#1226) — O(1) per eat
  Problem: 5 philosophers sit at a round table with 5 forks. Each needs both adjacent forks to eat. Prevent deadlock.
  Use when: "#1226", "dining philosophers", "deadlock with circular resources"
  Example:
    5 philosophers, 5 forks. Deadlock scenario (no limit):
      P0 grabs fork0, P1 grabs fork1, ..., P4 grabs fork4. All wait for right fork → DEADLOCK.
    Fix: semaphore seating(4). Only 4 can proceed at once.
      P0..P3 seated (seatedCount=4). P4 waits.
      P0 has fork0,fork1 (neighbors free). P0 eats → releases forks → seatedCount=3.
      P4 can now enter. With 5 forks and ≤4 seated, pigeonhole: ≥1 fork is always free.
    Guarantee: 4 diners need 8 fork-acquisitions but only 5 forks → at least one pair is available.
    'Seat n-1. Pigeonhole: more forks than seated means someone always eats.'
  Steps:
    1. wantsToEat: spin-wait if seatedCount >= 4; seatedCount++
    2. Acquire left fork, then right fork; eat(); release both forks; seatedCount--
    3. Wake a waiting philosopher if any
  Mnemonic: "Only 4 can sit at once. Pigeonhole guarantees someone always gets both forks."`,
  },
};

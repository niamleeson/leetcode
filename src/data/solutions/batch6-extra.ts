import { ProblemSolution } from './types';

export const solutions: ProblemSolution[] = [
  // ---------------------------------------------------------------------------
  // 1668. Maximum Repeating Substring
  // ---------------------------------------------------------------------------
  {
    id: 1668,
    description:
      'Given a string sequence and a string word, return the maximum k such that word concatenated k times is a substring of sequence. If word is not a substring of sequence, return 0.',
    examples:
      'Input: sequence = "ababc", word = "ab"\nOutput: 2\nExplanation: "abab" is a substring of "ababc", so k=2.',
    intuition:
      'Think of it like stacking copies of a word on top of each other - you keep adding one more copy and checking if the stack still fits inside the sequence. The moment it doesn\'t fit, you know the previous count was your answer.',
    approach:
      'Incrementally build the repeated word string (word, word*2, word*3, ...) and check if it is a substring of sequence. Return the largest k for which it is still found.',
    code: `class Solution:
    def maxRepeating(self, sequence: str, word: str) -> int:
        k = 0
        while word * (k + 1) in sequence:
            k += 1
        return k`,
    jsCode: `var maxRepeating = function(sequence, word) {
    let k = 0;
    while (sequence.includes(word.repeat(k + 1))) {
        k++;
    }
    return k;
};`,
    explanation:
      '1. Start with k = 0.\n' +
      '2. Check if word repeated (k+1) times is a substring of sequence.\n' +
      '3. If yes, increment k and repeat.\n' +
      '4. When the check fails, return the current k.',
    timeComplexity: 'O(n * m) where n = len(sequence) and m = len(word)',
    spaceComplexity: 'O(n)',
    hints: [
      'Try checking word*1, word*2, word*3... as substrings.',
      'The maximum possible k is len(sequence) // len(word).',
      'Python\'s `in` operator makes substring checks easy.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1669. Merge In Between Linked Lists
  // ---------------------------------------------------------------------------
  {
    id: 1669,
    description:
      'You are given two linked lists list1 and list2 of sizes n and m. Remove nodes from the a-th to the b-th node in list1 and put list2 in their place. Return the head of the modified list.',
    examples:
      'Input: list1 = [0,1,2,3,4,5], a = 3, b = 4, list2 = [1000000,1000001,1000002]\nOutput: [0,1,2,1000000,1000001,1000002,5]',
    intuition:
      'Imagine cutting a section out of a chain and replacing it with a different chain. You just need to find where to make the two cuts (before position a and after position b), then link the new chain in between.',
    approach:
      'Traverse list1 to find the node just before position a and the node just after position b. Connect the node before a to the head of list2, and connect the tail of list2 to the node after b.',
    code: `class Solution:
    def mergeInBetween(self, list1: ListNode, a: int, b: int, list2: ListNode) -> ListNode:
        prev = list1
        for _ in range(a - 1):
            prev = prev.next
        tail = prev
        for _ in range(b - a + 2):
            tail = tail.next
        prev.next = list2
        cur = list2
        while cur.next:
            cur = cur.next
        cur.next = tail
        return list1`,
    jsCode: `var mergeInBetween = function(list1, a, b, list2) {
    let prev = list1;
    for (let i = 0; i < a - 1; i++) {
        prev = prev.next;
    }
    let tail = prev;
    for (let i = 0; i < b - a + 2; i++) {
        tail = tail.next;
    }
    prev.next = list2;
    let cur = list2;
    while (cur.next) {
        cur = cur.next;
    }
    cur.next = tail;
    return list1;
};`,
    explanation:
      '1. Traverse to the node at position a-1 (prev).\n' +
      '2. From prev, traverse (b - a + 2) steps to reach the node after position b (tail).\n' +
      '3. Set prev.next = list2 head to splice in list2.\n' +
      '4. Traverse list2 to its last node and set its next to tail.\n' +
      '5. Return the original list1 head.',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(1)',
    hints: [
      'You need to find two key nodes in list1: the one before position a and the one after position b.',
      'After finding those nodes, splice in list2 by adjusting next pointers.',
      'Don\'t forget to find the tail of list2 to connect it back.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1670. Design Front Middle Back Queue
  // ---------------------------------------------------------------------------
  {
    id: 1670,
    description:
      'Design a queue that supports push and pop operations at the front, middle, and back. Implement the FrontMiddleBackQueue class with pushFront, pushMiddle, pushBack, popFront, popMiddle, and popBack methods. Pop operations return -1 if the queue is empty.',
    examples:
      'Input: ["FrontMiddleBackQueue","pushFront","pushBack","pushMiddle","pushMiddle","popFront","popMiddle","popMiddle","popBack","popFront"]\n[[],[1],[2],[3],[4],[],[],[],[],[]]\nOutput: [null,null,null,null,null,1,3,4,2,-1]',
    intuition:
      'By splitting the data into two halves and keeping them balanced, the middle is always at the boundary between the two halves. This is like keeping two stacks back-to-back where the tops meet in the middle.',
    approach:
      'Use two deques to maintain the front and back halves. After each operation, rebalance so the front deque has either equal size or one fewer element than the back deque. This ensures the middle is always at a known position.',
    code: `from collections import deque

class FrontMiddleBackQueue:
    def __init__(self):
        self.front = deque()
        self.back = deque()

    def _balance(self):
        if len(self.front) > len(self.back):
            self.back.appendleft(self.front.pop())
        elif len(self.back) > len(self.front) + 1:
            self.front.append(self.back.popleft())

    def pushFront(self, val: int) -> None:
        self.front.appendleft(val)
        self._balance()

    def pushMiddle(self, val: int) -> None:
        if len(self.front) < len(self.back):
            self.front.append(val)
        else:
            self.back.appendleft(val)
        self._balance()

    def pushBack(self, val: int) -> None:
        self.back.append(val)
        self._balance()

    def popFront(self) -> int:
        if not self.front and not self.back:
            return -1
        if self.front:
            val = self.front.popleft()
        else:
            val = self.back.popleft()
        self._balance()
        return val

    def popMiddle(self) -> int:
        if not self.front and not self.back:
            return -1
        if len(self.front) == len(self.back):
            val = self.front.pop()
        else:
            val = self.back.popleft()
        self._balance()
        return val

    def popBack(self) -> int:
        if not self.back:
            return -1
        val = self.back.pop()
        self._balance()
        return val`,
    jsCode: `var FrontMiddleBackQueue = function() {
    this.front = [];
    this.back = [];
};

FrontMiddleBackQueue.prototype._balance = function() {
    if (this.front.length > this.back.length) {
        this.back.unshift(this.front.pop());
    } else if (this.back.length > this.front.length + 1) {
        this.front.push(this.back.shift());
    }
};

FrontMiddleBackQueue.prototype.pushFront = function(val) {
    this.front.unshift(val);
    this._balance();
};

FrontMiddleBackQueue.prototype.pushMiddle = function(val) {
    if (this.front.length < this.back.length) {
        this.front.push(val);
    } else {
        this.back.unshift(val);
    }
    this._balance();
};

FrontMiddleBackQueue.prototype.pushBack = function(val) {
    this.back.push(val);
    this._balance();
};

FrontMiddleBackQueue.prototype.popFront = function() {
    if (this.front.length === 0 && this.back.length === 0) return -1;
    let val;
    if (this.front.length > 0) {
        val = this.front.shift();
    } else {
        val = this.back.shift();
    }
    this._balance();
    return val;
};

FrontMiddleBackQueue.prototype.popMiddle = function() {
    if (this.front.length === 0 && this.back.length === 0) return -1;
    let val;
    if (this.front.length === this.back.length) {
        val = this.front.pop();
    } else {
        val = this.back.shift();
    }
    this._balance();
    return val;
};

FrontMiddleBackQueue.prototype.popBack = function() {
    if (this.back.length === 0) return -1;
    const val = this.back.pop();
    this._balance();
    return val;
};`,
    explanation:
      '1. Maintain two deques: front and back halves.\n' +
      '2. Invariant: len(front) == len(back) or len(front) == len(back) - 1.\n' +
      '3. After each push/pop, rebalance by moving elements between deques.\n' +
      '4. The middle element is at front[-1] (even total) or back[0] (odd total).\n' +
      '5. All operations are O(1) amortized due to deque operations.',
    timeComplexity: 'O(1) per operation',
    spaceComplexity: 'O(n)',
    hints: [
      'A single list gives O(n) middle operations. Can you split into two halves?',
      'Use two deques and keep them balanced so the middle is always accessible.',
      'After every operation, rebalance so front has same or one fewer element than back.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1675. Minimize Deviation in Array
  // ---------------------------------------------------------------------------
  {
    id: 1675,
    description:
      'You are given an array nums of n positive integers. You can perform two operations any number of times: multiply an odd number by 2, or divide an even number by 2. The deviation is max(nums) - min(nums). Return the minimum deviation after performing any number of operations.',
    examples:
      'Input: nums = [1,2,3,4]\nOutput: 1\nExplanation: Transform to [1,2,3,2] then to [2,2,3,2]. Deviation is 3-2=1.',
    intuition:
      'The trick is to first make all numbers as large as possible (multiply odds by 2), then only shrink the largest number. This way you are always reducing the range from one direction, guaranteeing you find the minimum deviation.',
    approach:
      'First, maximize all odd numbers by multiplying by 2 (they can only go up once). Then use a max-heap and repeatedly divide the maximum element by 2 while tracking the minimum. The deviation is minimized when the max can no longer be reduced.',
    code: `import heapq

class Solution:
    def minimumDeviation(self, nums: list[int]) -> int:
        heap = []
        min_val = float('inf')
        for n in nums:
            if n % 2 == 1:
                n *= 2
            heapq.heappush(heap, -n)
            min_val = min(min_val, n)
        result = -heap[0] - min_val
        while heap[0] % 2 == 0:
            top = -heapq.heappop(heap)
            top //= 2
            min_val = min(min_val, top)
            heapq.heappush(heap, -top)
            result = min(result, -heap[0] - min_val)
        return result`,
    jsCode: `var minimumDeviation = function(nums) {
    // Using a sorted set approach (MaxPriorityQueue)
    const pq = new MaxPriorityQueue();
    let minVal = Infinity;
    for (let n of nums) {
        if (n % 2 === 1) n *= 2;
        pq.enqueue(n);
        minVal = Math.min(minVal, n);
    }
    let result = pq.front().element - minVal;
    while (pq.front().element % 2 === 0) {
        let top = pq.dequeue().element;
        top = Math.floor(top / 2);
        minVal = Math.min(minVal, top);
        pq.enqueue(top);
        result = Math.min(result, pq.front().element - minVal);
    }
    return result;
};`,
    explanation:
      '1. Multiply all odd numbers by 2 so every element is even (odd numbers can only increase once).\n' +
      '2. Push all values into a max-heap (negate for Python min-heap), track global minimum.\n' +
      '3. Repeatedly pop the max: if even, divide by 2, update min, push back, update result.\n' +
      '4. Stop when the max is odd (cannot be reduced further).\n' +
      '5. The answer is the minimum deviation seen across all iterations.',
    timeComplexity: 'O(n * log(n) * log(max_val))',
    spaceComplexity: 'O(n)',
    hints: [
      'Odd numbers can only be multiplied by 2 (once). Even numbers can be halved multiple times.',
      'Normalize by making all numbers as large as possible first, then only shrink.',
      'Use a max-heap and greedily reduce the maximum element.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1679. Max Number of K-Sum Pairs
  // ---------------------------------------------------------------------------
  {
    id: 1679,
    description:
      'Given an integer array nums and an integer k, return the maximum number of operations where you pick two numbers from the array whose sum equals k and remove them.',
    examples:
      'Input: nums = [1,2,3,4], k = 5\nOutput: 2\nExplanation: Remove (1,4) and (2,3).',
    intuition:
      'This is like a matching game - for each number, you need to find its partner that sums to k. A frequency map lets you instantly check if a partner exists, just like Two Sum but counting all valid pairs instead of just one.',
    approach:
      'Use a hash map to count occurrences. For each number, check if its complement (k - num) exists in the map. If so, form a pair and decrement both counts.',
    code: `from collections import Counter

class Solution:
    def maxOperations(self, nums: list[int], k: int) -> int:
        count = Counter(nums)
        result = 0
        for num in count:
            comp = k - num
            if comp == num:
                result += count[num] // 2
            elif comp in count and comp > num:
                result += min(count[num], count[comp])
        return result`,
    jsCode: `var maxOperations = function(nums, k) {
    const count = new Map();
    for (const num of nums) {
        count.set(num, (count.get(num) || 0) + 1);
    }
    let result = 0;
    for (const [num, freq] of count) {
        const comp = k - num;
        if (comp === num) {
            result += Math.floor(freq / 2);
        } else if (count.has(comp) && comp > num) {
            result += Math.min(freq, count.get(comp));
        }
    }
    return result;
};`,
    explanation:
      '1. Count frequency of each number using Counter.\n' +
      '2. For each unique number, find complement = k - num.\n' +
      '3. If complement == num, we can form count[num] // 2 pairs.\n' +
      '4. If complement != num and exists, pairs = min of the two counts (only count when comp > num to avoid double-counting).\n' +
      '5. Sum all pairs for the result.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'This is similar to Two Sum but you need to count all valid pairs.',
      'A hash map of frequencies lets you pair numbers efficiently.',
      'Be careful not to double-count pairs.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1685. Sum of Absolute Differences in a Sorted Array
  // ---------------------------------------------------------------------------
  {
    id: 1685,
    description:
      'Given a sorted integer array nums, return an array result where result[i] equals the sum of |nums[i] - nums[j]| for all j != i.',
    examples:
      'Input: nums = [2,3,5]\nOutput: [4,3,5]\nExplanation: result[0] = |2-3|+|2-5| = 4, result[1] = |3-2|+|3-5| = 3, result[2] = |5-2|+|5-3| = 5.',
    intuition:
      'Since the array is sorted, every element to the left of index i is smaller and every element to the right is larger. This means you can split the absolute difference sum into two simple formulas using prefix sums, avoiding the need to compare every pair.',
    approach:
      'Since the array is sorted, for index i, all elements to the left are <= nums[i] and all to the right are >= nums[i]. Use prefix sums to compute left and right contributions in O(1) per element.',
    code: `class Solution:
    def getSumAbsoluteDifferences(self, nums: list[int]) -> list[int]:
        n = len(nums)
        total = sum(nums)
        prefix = 0
        result = []
        for i in range(n):
            left_sum = prefix
            right_sum = total - prefix - nums[i]
            left_count = i
            right_count = n - i - 1
            val = (nums[i] * left_count - left_sum) + (right_sum - nums[i] * right_count)
            result.append(val)
            prefix += nums[i]
        return result`,
    jsCode: `var getSumAbsoluteDifferences = function(nums) {
    const n = nums.length;
    const total = nums.reduce((a, b) => a + b, 0);
    let prefix = 0;
    const result = [];
    for (let i = 0; i < n; i++) {
        const leftSum = prefix;
        const rightSum = total - prefix - nums[i];
        const leftCount = i;
        const rightCount = n - i - 1;
        const val = (nums[i] * leftCount - leftSum) + (rightSum - nums[i] * rightCount);
        result.push(val);
        prefix += nums[i];
    }
    return result;
};`,
    explanation:
      '1. Compute total sum of the array.\n' +
      '2. Maintain a running prefix sum as we iterate.\n' +
      '3. For index i, left contribution = nums[i]*i - prefix_sum (elements to the left are smaller).\n' +
      '4. Right contribution = (total - prefix - nums[i]) - nums[i]*(n-i-1).\n' +
      '5. Result[i] = left contribution + right contribution.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Brute force is O(n^2). Use the sorted property to avoid recomputing sums.',
      'For a sorted array, elements left of i are all <= nums[i].',
      'Use prefix sums to get the sum of elements on each side in O(1).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1688. Count of Matches in Tournament
  // ---------------------------------------------------------------------------
  {
    id: 1688,
    description:
      'In a tournament with n teams, teams are paired: if even, n/2 matches with n/2 teams advancing; if odd, (n-1)/2 matches with (n-1)/2+1 teams advancing. Return the total number of matches played until one winner remains.',
    examples:
      'Input: n = 7\nOutput: 6\nExplanation: 3 matches (4 advance) -> 2 matches (2 advance) -> 1 match. Total = 6.',
    intuition:
      'Every match eliminates exactly one team. To go from n teams down to 1 winner, you must eliminate n-1 teams. So regardless of how the bracket works, the answer is always n-1.',
    approach:
      'Each match eliminates exactly one team. To go from n teams to 1 winner, exactly n-1 teams must be eliminated, so exactly n-1 matches are played.',
    code: `class Solution:
    def numberOfMatches(self, n: int) -> int:
        return n - 1`,
    jsCode: `var numberOfMatches = function(n) {
    return n - 1;
};`,
    explanation:
      '1. Each match eliminates exactly one team.\n' +
      '2. We need to eliminate n-1 teams to have one winner.\n' +
      '3. Therefore the answer is always n-1.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    hints: [
      'Simulate the process round by round.',
      'Each match eliminates exactly one team.',
      'How many teams need to be eliminated total?',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1695. Maximum Erasure Value
  // ---------------------------------------------------------------------------
  {
    id: 1695,
    description:
      'Given an array of positive integers nums, return the maximum sum of a subarray with all unique elements. You can erase (select) any contiguous subarray as long as it contains no duplicates.',
    examples:
      'Input: nums = [4,2,4,5,6]\nOutput: 17\nExplanation: The subarray [2,4,5,6] has all unique elements and sum 17.',
    intuition:
      'This is the classic sliding window pattern: expand the window to include new elements, and when you hit a duplicate, shrink from the left until the duplicate is removed. The set acts as your window\'s membership tracker.',
    approach:
      'Use a sliding window with a set to track elements in the current window. Expand the right pointer; if a duplicate is found, shrink from the left until it is removed. Track the maximum window sum.',
    code: `class Solution:
    def maximumUniqueSubarray(self, nums: list[int]) -> int:
        seen = set()
        left = 0
        cur_sum = 0
        max_sum = 0
        for right in range(len(nums)):
            while nums[right] in seen:
                seen.remove(nums[left])
                cur_sum -= nums[left]
                left += 1
            seen.add(nums[right])
            cur_sum += nums[right]
            max_sum = max(max_sum, cur_sum)
        return max_sum`,
    jsCode: `var maximumUniqueSubarray = function(nums) {
    const seen = new Set();
    let left = 0, curSum = 0, maxSum = 0;
    for (let right = 0; right < nums.length; right++) {
        while (seen.has(nums[right])) {
            seen.delete(nums[left]);
            curSum -= nums[left];
            left++;
        }
        seen.add(nums[right]);
        curSum += nums[right];
        maxSum = Math.max(maxSum, curSum);
    }
    return maxSum;
};`,
    explanation:
      '1. Maintain a sliding window [left, right] with a set of elements in the window.\n' +
      '2. Expand right: if nums[right] is already in the set, shrink from left until removed.\n' +
      '3. Add nums[right] to the set and update current sum.\n' +
      '4. Track the maximum sum across all valid windows.\n' +
      '5. Each element is added and removed at most once, so it is O(n).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'This is a sliding window problem where the constraint is "all unique elements."',
      'Use a set to detect duplicates and shrink the window when one is found.',
      'Maintain a running sum to avoid recomputing the window sum each time.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1700. Number of Students Unable to Eat Lunch
  // ---------------------------------------------------------------------------
  {
    id: 1700,
    description:
      'Students stand in a queue. Each student prefers circular (0) or square (1) sandwiches. Sandwiches are in a stack. The front student takes the top sandwich if it matches their preference, otherwise they move to the back of the queue. The process stops when no student in the queue wants the top sandwich. Return the number of students who cannot eat.',
    examples:
      'Input: students = [1,1,0,0], sandwiches = [0,1,0,1]\nOutput: 0',
    intuition:
      'The order students stand in doesn\'t matter - what matters is whether anyone in the entire queue wants the sandwich on top. Once no one wants the top sandwich, everyone remaining is stuck forever.',
    approach:
      'Count how many students want each type. Iterate through sandwiches: if a student wants the current sandwich, decrement that count. If no student wants the current top sandwich, the remaining students cannot eat.',
    code: `from collections import Counter

class Solution:
    def countStudents(self, students: list[int], sandwiches: list[int]) -> int:
        count = Counter(students)
        for i, s in enumerate(sandwiches):
            if count[s] > 0:
                count[s] -= 1
            else:
                return len(sandwiches) - i
        return 0`,
    jsCode: `var countStudents = function(students, sandwiches) {
    const count = [0, 0];
    for (const s of students) count[s]++;
    for (let i = 0; i < sandwiches.length; i++) {
        if (count[sandwiches[i]] > 0) {
            count[sandwiches[i]]--;
        } else {
            return sandwiches.length - i;
        }
    }
    return 0;
};`,
    explanation:
      '1. Count students preferring 0 and 1.\n' +
      '2. Iterate through sandwiches in stack order.\n' +
      '3. If a student wants this sandwich type, decrement the count (they eat).\n' +
      '4. If nobody wants the current top sandwich, all remaining students are stuck.\n' +
      '5. Return the number of remaining sandwiches (= stuck students).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The queue order does not matter — what matters is whether any student wants the top sandwich.',
      'Count how many students want each type of sandwich.',
      'Simulation stops when the top sandwich is unwanted by all remaining students.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1704. Determine if String Halves Are Alike
  // ---------------------------------------------------------------------------
  {
    id: 1704,
    description:
      'Given a string s of even length, split it into two halves. Two halves are alike if they have the same number of vowels (a, e, i, o, u, case-insensitive). Return true if they are alike.',
    examples:
      'Input: s = "book"\nOutput: true\nExplanation: "bo" has 1 vowel, "ok" has 1 vowel.',
    intuition:
      'Split the string in half and count vowels in each half. It\'s a straightforward counting problem - just remember to check both uppercase and lowercase vowels.',
    approach:
      'Count the vowels in the first half and the second half of the string, then compare. A single pass tracking a balance counter also works.',
    code: `class Solution:
    def halvesAreAlike(self, s: str) -> bool:
        vowels = set('aeiouAEIOU')
        mid = len(s) // 2
        return sum(c in vowels for c in s[:mid]) == sum(c in vowels for c in s[mid:])`,
    jsCode: `var halvesAreAlike = function(s) {
    const vowels = new Set('aeiouAEIOU');
    const mid = Math.floor(s.length / 2);
    let count1 = 0, count2 = 0;
    for (let i = 0; i < mid; i++) {
        if (vowels.has(s[i])) count1++;
    }
    for (let i = mid; i < s.length; i++) {
        if (vowels.has(s[i])) count2++;
    }
    return count1 === count2;
};`,
    explanation:
      '1. Define the set of vowels (both cases).\n' +
      '2. Split the string at the midpoint.\n' +
      '3. Count vowels in the first half and the second half.\n' +
      '4. Return whether the counts are equal.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Split the string in half and count vowels in each half.',
      'Remember vowels include both uppercase and lowercase.',
      'You can use a set for O(1) vowel lookups.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1706. Where Will the Ball Fall
  // ---------------------------------------------------------------------------
  {
    id: 1706,
    description:
      'A ball is dropped from the top of each column in an m x n grid. Each cell has a diagonal board: 1 redirects right, -1 redirects left. A ball gets stuck if it hits a wall or forms a V-shape. Return an array where answer[i] is the column the ball exits at the bottom, or -1 if it gets stuck.',
    examples:
      'Input: grid = [[1,1,1,-1,-1],[1,1,1,-1,-1],[-1,-1,-1,1,1],[1,1,1,1,-1],[-1,-1,-1,-1,-1]]\nOutput: [1,-1,-1,-1,-1]',
    intuition:
      'Simulate each ball falling through the grid row by row. A ball gets stuck when it hits a wall or when two adjacent boards form a V-shape that traps it. The key check is whether the current cell and its neighbor point in the same direction.',
    approach:
      'For each ball, simulate its path row by row. At each cell, check the direction and the adjacent cell. If they form a V or hit a wall, the ball is stuck. Otherwise move to the next row in the redirected column.',
    code: `class Solution:
    def findBall(self, grid: list[list[int]]) -> list[int]:
        m, n = len(grid), len(grid[0])
        result = []
        for col in range(n):
            c = col
            for row in range(m):
                nc = c + grid[row][c]
                if nc < 0 or nc >= n or grid[row][nc] != grid[row][c]:
                    c = -1
                    break
                c = nc
            result.append(c)
        return result`,
    jsCode: `var findBall = function(grid) {
    const m = grid.length, n = grid[0].length;
    const result = [];
    for (let col = 0; col < n; col++) {
        let c = col;
        for (let row = 0; row < m; row++) {
            const nc = c + grid[row][c];
            if (nc < 0 || nc >= n || grid[row][nc] !== grid[row][c]) {
                c = -1;
                break;
            }
            c = nc;
        }
        result.push(c);
    }
    return result;
};`,
    explanation:
      '1. For each starting column, simulate the ball falling row by row.\n' +
      '2. At cell (row, c), the ball moves to column nc = c + grid[row][c].\n' +
      '3. If nc is out of bounds or grid[row][nc] != grid[row][c] (V-shape), ball is stuck.\n' +
      '4. Otherwise move to (row+1, nc).\n' +
      '5. After all rows, record the final column (or -1 if stuck).',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Simulate each ball independently as it falls row by row.',
      'A ball gets stuck when it hits a wall or the adjacent cell redirects it back (V-shape).',
      'Check if the current cell and the adjacent cell in the redirect direction have the same value.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1718. Construct the Lexicographically Largest Valid Sequence
  // ---------------------------------------------------------------------------
  {
    id: 1718,
    description:
      'Given an integer n, construct a sequence of length 2n-1 such that: 1 appears once, every integer from 2 to n appears exactly twice with exactly that many indices apart, and the sequence is lexicographically largest possible.',
    examples:
      'Input: n = 3\nOutput: [3,1,2,3,2]\nExplanation: 3 appears at indices 0 and 3 (distance 3), 2 at indices 2 and 4 (distance 2), 1 once.',
    intuition:
      'This is a constraint satisfaction problem best solved by backtracking. The greedy insight is to try placing larger numbers first - this naturally produces the lexicographically largest valid sequence since bigger numbers go into earlier positions.',
    approach:
      'Use backtracking. Try to place numbers from n down to 1 at the first empty position. For number i > 1, place it at positions j and j+i; for i = 1, place at j only. The greedy order (largest first) ensures lexicographic maximality.',
    code: `class Solution:
    def constructDistancedSequence(self, n: int) -> list[int]:
        size = 2 * n - 1
        result = [0] * size
        used = [False] * (n + 1)

        def backtrack(idx: int) -> bool:
            if idx == size:
                return True
            if result[idx] != 0:
                return backtrack(idx + 1)
            for num in range(n, 0, -1):
                if used[num]:
                    continue
                if num == 1:
                    result[idx] = 1
                    used[1] = True
                    if backtrack(idx + 1):
                        return True
                    result[idx] = 0
                    used[1] = False
                else:
                    if idx + num < size and result[idx + num] == 0:
                        result[idx] = num
                        result[idx + num] = num
                        used[num] = True
                        if backtrack(idx + 1):
                            return True
                        result[idx] = 0
                        result[idx + num] = 0
                        used[num] = False
            return False

        backtrack(0)
        return result`,
    jsCode: `var constructDistancedSequence = function(n) {
    const size = 2 * n - 1;
    const result = new Array(size).fill(0);
    const used = new Array(n + 1).fill(false);

    function backtrack(idx) {
        if (idx === size) return true;
        if (result[idx] !== 0) return backtrack(idx + 1);
        for (let num = n; num >= 1; num--) {
            if (used[num]) continue;
            if (num === 1) {
                result[idx] = 1;
                used[1] = true;
                if (backtrack(idx + 1)) return true;
                result[idx] = 0;
                used[1] = false;
            } else {
                if (idx + num < size && result[idx + num] === 0) {
                    result[idx] = num;
                    result[idx + num] = num;
                    used[num] = true;
                    if (backtrack(idx + 1)) return true;
                    result[idx] = 0;
                    result[idx + num] = 0;
                    used[num] = false;
                }
            }
        }
        return false;
    }

    backtrack(0);
    return result;
};`,
    explanation:
      '1. Create a result array of size 2n-1 initialized to 0.\n' +
      '2. At each unfilled position, try placing numbers from n down to 1.\n' +
      '3. For num > 1, place at positions idx and idx + num (if both empty).\n' +
      '4. For num == 1, place at idx only.\n' +
      '5. Backtrack if no valid placement is found; return the first valid sequence.',
    timeComplexity: 'O(n!) in worst case, but pruning makes it fast in practice',
    spaceComplexity: 'O(n)',
    hints: [
      'Use backtracking to place numbers greedily from largest to smallest.',
      'For each number i, it must appear at positions j and j+i.',
      'Skip already-filled positions and already-used numbers.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1721. Swapping Nodes in a Linked List
  // ---------------------------------------------------------------------------
  {
    id: 1721,
    description:
      'Given the head of a linked list and an integer k, return the list after swapping the values of the k-th node from the beginning and the k-th node from the end (1-indexed).',
    examples:
      'Input: head = [1,2,3,4,5], k = 2\nOutput: [1,4,3,2,5]',
    intuition:
      'The two-pointer technique for finding the k-th node from the end is elegant: advance one pointer k steps ahead, then move both together until the first reaches the end. The gap between them is always k, so the second pointer lands exactly where you need it.',
    approach:
      'Use two pointers. Move one pointer k steps from the head to find the k-th node. Then use a second pointer starting from head; advance both until the first reaches the end. The second pointer is at the k-th from end. Swap their values.',
    code: `class Solution:
    def swapNodes(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        cur = head
        for _ in range(k - 1):
            cur = cur.next
        first = cur
        second = head
        while cur.next:
            cur = cur.next
            second = second.next
        first.val, second.val = second.val, first.val
        return head`,
    jsCode: `var swapNodes = function(head, k) {
    let cur = head;
    for (let i = 0; i < k - 1; i++) {
        cur = cur.next;
    }
    const first = cur;
    let second = head;
    while (cur.next) {
        cur = cur.next;
        second = second.next;
    }
    const temp = first.val;
    first.val = second.val;
    second.val = temp;
    return head;
};`,
    explanation:
      '1. Advance cur pointer k-1 steps to reach the k-th node from the start (first).\n' +
      '2. Set second = head. Advance both cur and second until cur reaches the last node.\n' +
      '3. Now second is at the k-th node from the end.\n' +
      '4. Swap the values of first and second.\n' +
      '5. Return the head.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Finding the k-th from the end is a classic two-pointer technique.',
      'Move one pointer k steps ahead, then move both until the first reaches the end.',
      'Swapping values is simpler than swapping nodes.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1749. Maximum Absolute Sum of Any Subarray
  // ---------------------------------------------------------------------------
  {
    id: 1749,
    description:
      'Given an integer array nums, find the maximum absolute value of the sum of any subarray. A subarray is a contiguous non-empty sequence of elements.',
    examples:
      'Input: nums = [1,-3,2,3,-4]\nOutput: 5\nExplanation: Subarray [2,3] has sum 5.',
    intuition:
      'The maximum absolute sum is either the most positive subarray sum or the most negative subarray sum (in absolute value). Running Kadane\'s algorithm for both max and min simultaneously captures both extremes in a single pass.',
    approach:
      'Track both the maximum subarray sum and the minimum subarray sum using Kadane\'s algorithm. The answer is the maximum of the absolute values of these two extremes.',
    code: `class Solution:
    def maxAbsoluteSum(self, nums: list[int]) -> int:
        max_sum = min_sum = 0
        cur_max = cur_min = 0
        for num in nums:
            cur_max = max(cur_max + num, num)
            cur_min = min(cur_min + num, num)
            max_sum = max(max_sum, cur_max)
            min_sum = min(min_sum, cur_min)
        return max(max_sum, -min_sum)`,
    jsCode: `var maxAbsoluteSum = function(nums) {
    let maxSum = 0, minSum = 0;
    let curMax = 0, curMin = 0;
    for (const num of nums) {
        curMax = Math.max(curMax + num, num);
        curMin = Math.min(curMin + num, num);
        maxSum = Math.max(maxSum, curMax);
        minSum = Math.min(minSum, curMin);
    }
    return Math.max(maxSum, -minSum);
};`,
    explanation:
      '1. Use Kadane\'s algorithm to find the maximum subarray sum.\n' +
      '2. Simultaneously run Kadane\'s to find the minimum subarray sum.\n' +
      '3. The maximum absolute sum is max(max_sum, |min_sum|).\n' +
      '4. This works because the most negative subarray could have the largest absolute value.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The maximum absolute sum is either the max subarray sum or the absolute value of the min subarray sum.',
      'Run Kadane\'s algorithm for both maximum and minimum simultaneously.',
      'You only need one pass through the array.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1759. Count Number of Homogenous Substrings
  // ---------------------------------------------------------------------------
  {
    id: 1759,
    description:
      'A homogenous string consists of a single repeated character. Given string s, return the number of homogenous substrings modulo 10^9 + 7.',
    examples:
      'Input: s = "abbcccaa"\nOutput: 13\nExplanation: "a" x3, "b" x3, "c" x6, "aa" x1 = 13 homogenous substrings.',
    intuition:
      'A run of k identical characters contains exactly k*(k+1)/2 homogenous substrings. This is because you can start a substring at any position in the run and extend it to any later position, giving you 1 + 2 + ... + k choices.',
    approach:
      'Group consecutive identical characters. For a group of length k, the number of homogenous substrings is k*(k+1)/2. Sum across all groups.',
    code: `class Solution:
    def countHomogenous(self, s: str) -> int:
        MOD = 10**9 + 7
        result = 0
        count = 1
        for i in range(1, len(s)):
            if s[i] == s[i - 1]:
                count += 1
            else:
                result += count * (count + 1) // 2
                count = 1
        result += count * (count + 1) // 2
        return result % MOD`,
    jsCode: `var countHomogenous = function(s) {
    const MOD = 1e9 + 7;
    let result = 0;
    let count = 1;
    for (let i = 1; i < s.length; i++) {
        if (s[i] === s[i - 1]) {
            count++;
        } else {
            result += count * (count + 1) / 2;
            count = 1;
        }
    }
    result += count * (count + 1) / 2;
    return result % MOD;
};`,
    explanation:
      '1. Iterate through the string tracking runs of identical characters.\n' +
      '2. When the character changes, a run of length k contributes k*(k+1)/2 substrings.\n' +
      '3. Add the contribution and reset the counter.\n' +
      '4. Don\'t forget to add the last run after the loop.\n' +
      '5. Return the result modulo 10^9 + 7.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Group consecutive identical characters together.',
      'A run of length k has k*(k+1)/2 substrings.',
      'Don\'t forget the modulo operation.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1763. Longest Nice Substring
  // ---------------------------------------------------------------------------
  {
    id: 1763,
    description:
      'A nice string has every letter appearing in both lowercase and uppercase. Given a string s, return the longest nice substring. If there are multiple, return the one at the earliest index. If none, return an empty string.',
    examples:
      'Input: s = "YazaAay"\nOutput: "aAa"',
    intuition:
      'If any character appears in only one case (e.g., uppercase but no lowercase), no nice substring can include it. This character acts as a natural split point - the answer must lie entirely on one side.',
    approach:
      'Use divide and conquer. Find a character that appears in only one case — split the string at that character. Recursively find the longest nice substring in each part. Return the longer result.',
    code: `class Solution:
    def longestNiceSubstring(self, s: str) -> str:
        if len(s) < 2:
            return ""
        chars = set(s)
        for i, c in enumerate(s):
            if c.swapcase() not in chars:
                left = self.longestNiceSubstring(s[:i])
                right = self.longestNiceSubstring(s[i + 1:])
                return left if len(left) >= len(right) else right
        return s`,
    jsCode: `var longestNiceSubstring = function(s) {
    if (s.length < 2) return "";
    const chars = new Set(s);
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        const swapped = c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase();
        if (!chars.has(swapped)) {
            const left = longestNiceSubstring(s.substring(0, i));
            const right = longestNiceSubstring(s.substring(i + 1));
            return left.length >= right.length ? left : right;
        }
    }
    return s;
};`,
    explanation:
      '1. Base case: strings shorter than 2 cannot be nice.\n' +
      '2. Build a set of characters in s.\n' +
      '3. Find the first character whose opposite case is missing — the string cannot be nice through this character.\n' +
      '4. Split at that character and recursively solve left and right halves.\n' +
      '5. If no such character exists, the entire string is nice.',
    timeComplexity: 'O(n^2) worst case, O(n log n) average',
    spaceComplexity: 'O(n) for recursion stack',
    hints: [
      'If a character appears only in one case, no nice substring can contain it.',
      'Use that character as a split point and solve recursively.',
      'If all characters have both cases, the whole string is nice.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1765. Map of Highest Peak
  // ---------------------------------------------------------------------------
  {
    id: 1765,
    description:
      'Given an m x n integer matrix isWater where isWater[i][j] == 1 is water and 0 is land, assign heights such that water cells have height 0, adjacent cells differ by at most 1, and the maximum height is maximized. Return the height matrix.',
    examples:
      'Input: isWater = [[0,1],[0,0]]\nOutput: [[1,0],[2,1]]',
    intuition:
      'This is a classic multi-source BFS problem, like water rippling outward from multiple sources simultaneously. Starting BFS from all water cells at once naturally assigns each land cell the maximum possible height while respecting the adjacency constraint.',
    approach:
      'Use multi-source BFS starting from all water cells (height 0). Expand outward layer by layer, assigning increasing heights. This naturally maximizes heights while satisfying the constraint.',
    code: `from collections import deque

class Solution:
    def highestPeak(self, isWater: list[list[int]]) -> list[list[int]]:
        m, n = len(isWater), len(isWater[0])
        height = [[-1] * n for _ in range(m)]
        queue = deque()
        for i in range(m):
            for j in range(n):
                if isWater[i][j] == 1:
                    height[i][j] = 0
                    queue.append((i, j))
        while queue:
            x, y = queue.popleft()
            for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < m and 0 <= ny < n and height[nx][ny] == -1:
                    height[nx][ny] = height[x][y] + 1
                    queue.append((nx, ny))
        return height`,
    jsCode: `var highestPeak = function(isWater) {
    const m = isWater.length, n = isWater[0].length;
    const height = Array.from({length: m}, () => new Array(n).fill(-1));
    const queue = [];
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (isWater[i][j] === 1) {
                height[i][j] = 0;
                queue.push([i, j]);
            }
        }
    }
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    let idx = 0;
    while (idx < queue.length) {
        const [x, y] = queue[idx++];
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < m && ny >= 0 && ny < n && height[nx][ny] === -1) {
                height[nx][ny] = height[x][y] + 1;
                queue.push([nx, ny]);
            }
        }
    }
    return height;
};`,
    explanation:
      '1. Initialize all water cells with height 0 and add them to the BFS queue.\n' +
      '2. For each cell dequeued, check all 4 neighbors.\n' +
      '3. If a neighbor has not been visited (height == -1), set its height to current + 1.\n' +
      '4. BFS ensures the shortest distance from any water cell, which maximizes heights.\n' +
      '5. Return the completed height matrix.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Water cells must have height 0. Land cells should be as high as possible.',
      'Use BFS from all water cells simultaneously (multi-source BFS).',
      'BFS naturally gives the shortest distance from any water cell.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1768. Merge Strings Alternately
  // ---------------------------------------------------------------------------
  {
    id: 1768,
    description:
      'Given two strings word1 and word2, merge them by adding letters in alternating order starting with word1. If one string is longer, append the remaining letters at the end.',
    examples:
      'Input: word1 = "abc", word2 = "pqr"\nOutput: "apbqcr"',
    intuition:
      'Think of it like shuffling two decks of cards together - take one card from each deck alternately. When one deck runs out, just add the remaining cards from the other deck.',
    approach:
      'Use two pointers to iterate through both strings simultaneously, appending one character from each. After the loop, append whatever remains from the longer string.',
    code: `class Solution:
    def mergeAlternately(self, word1: str, word2: str) -> str:
        result = []
        i = 0
        while i < len(word1) or i < len(word2):
            if i < len(word1):
                result.append(word1[i])
            if i < len(word2):
                result.append(word2[i])
            i += 1
        return ''.join(result)`,
    jsCode: `var mergeAlternately = function(word1, word2) {
    const result = [];
    let i = 0;
    while (i < word1.length || i < word2.length) {
        if (i < word1.length) result.push(word1[i]);
        if (i < word2.length) result.push(word2[i]);
        i++;
    }
    return result.join('');
};`,
    explanation:
      '1. Use a single index i to traverse both strings.\n' +
      '2. At each step, append word1[i] if it exists, then word2[i] if it exists.\n' +
      '3. Continue until both strings are exhausted.\n' +
      '4. Join the result list into a string.',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(n + m)',
    hints: [
      'Iterate through both strings simultaneously.',
      'Handle the case where strings have different lengths.',
      'Use a list and join for efficient string building.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1774. Closest Dessert Cost
  // ---------------------------------------------------------------------------
  {
    id: 1774,
    description:
      'You have n base flavors (costs baseCosts) and m topping types (costs toppingCosts). Each topping can be used 0, 1, or 2 times. Find the combination closest to target cost. If there is a tie, return the lower cost.',
    examples:
      'Input: baseCosts = [1,7], toppingCosts = [3,4], target = 10\nOutput: 10\nExplanation: Base 7 + topping 3 = 10.',
    intuition:
      'With at most 10 toppings and 3 choices each (0, 1, or 2), there are only about 59,000 combinations per base flavor. This is small enough for brute-force enumeration with backtracking, pruning branches that exceed the target.',
    approach:
      'For each base, enumerate all possible topping combinations using backtracking or bitmask. Track the cost closest to target, preferring the lower cost on ties.',
    code: `class Solution:
    def closestCost(self, baseCosts: list[int], toppingCosts: list[int], target: int) -> int:
        self.best = baseCosts[0]
        def dfs(idx: int, cur: int):
            if abs(cur - target) < abs(self.best - target) or \\
               (abs(cur - target) == abs(self.best - target) and cur < self.best):
                self.best = cur
            if idx == len(toppingCosts) or cur > target:
                return
            for count in range(3):
                dfs(idx + 1, cur + toppingCosts[idx] * count)
        for base in baseCosts:
            dfs(0, base)
        return self.best`,
    jsCode: `var closestCost = function(baseCosts, toppingCosts, target) {
    let best = baseCosts[0];
    function dfs(idx, cur) {
        if (Math.abs(cur - target) < Math.abs(best - target) ||
            (Math.abs(cur - target) === Math.abs(best - target) && cur < best)) {
            best = cur;
        }
        if (idx === toppingCosts.length || cur > target) return;
        for (let count = 0; count < 3; count++) {
            dfs(idx + 1, cur + toppingCosts[idx] * count);
        }
    }
    for (const base of baseCosts) {
        dfs(0, base);
    }
    return best;
};`,
    explanation:
      '1. Initialize best with the first base cost.\n' +
      '2. For each base cost, run DFS over topping choices.\n' +
      '3. Each topping can be used 0, 1, or 2 times.\n' +
      '4. At each state, update best if current cost is closer to target (or equal but lower).\n' +
      '5. Prune when current cost exceeds target (adding more only increases cost).',
    timeComplexity: 'O(n * 3^m) where n is bases and m is toppings',
    spaceComplexity: 'O(m) for recursion stack',
    hints: [
      'The number of toppings is at most 10, so 3^10 = ~59000 combinations per base.',
      'Use DFS/backtracking to enumerate topping choices.',
      'Prune early when cost exceeds target since toppings only add cost.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1813. Sentence Similarity III
  // ---------------------------------------------------------------------------
  {
    id: 1813,
    description:
      'Two sentences are similar if one can be made equal to the other by inserting a sentence (possibly empty) somewhere. Given two sentences sentence1 and sentence2, return true if they are similar.',
    examples:
      'Input: sentence1 = "My name is Haley", sentence2 = "My Haley"\nOutput: true\nExplanation: Insert "name is" between "My" and "Haley".',
    intuition:
      'If you can insert a sentence in the middle of the shorter one to make it equal to the longer one, then the shorter sentence must be a prefix plus suffix of the longer one. Matching words from both ends reveals whether the gap in the middle is the only difference.',
    approach:
      'Split both sentences into words. Match words from the front (prefix) and from the back (suffix). If the total matched words cover the shorter sentence, they are similar.',
    code: `class Solution:
    def areSentencesSimilar(self, sentence1: str, sentence2: str) -> bool:
        words1 = sentence1.split()
        words2 = sentence2.split()
        if len(words1) < len(words2):
            words1, words2 = words2, words1
        i = 0
        while i < len(words2) and words1[i] == words2[i]:
            i += 1
        j = 0
        while j < len(words2) - i and words1[-(j + 1)] == words2[-(j + 1)]:
            j += 1
        return i + j >= len(words2)`,
    jsCode: `var areSentencesSimilar = function(sentence1, sentence2) {
    let words1 = sentence1.split(' ');
    let words2 = sentence2.split(' ');
    if (words1.length < words2.length) {
        [words1, words2] = [words2, words1];
    }
    let i = 0;
    while (i < words2.length && words1[i] === words2[i]) i++;
    let j = 0;
    while (j < words2.length - i && words1[words1.length - 1 - j] === words2[words2.length - 1 - j]) j++;
    return i + j >= words2.length;
};`,
    explanation:
      '1. Split sentences into word arrays. Ensure words1 is the longer one.\n' +
      '2. Match words from the beginning (prefix match), counting i matches.\n' +
      '3. Match words from the end (suffix match), counting j matches.\n' +
      '4. If i + j >= len(shorter sentence), the shorter is a prefix+suffix of the longer.\n' +
      '5. The gap in the middle is the "inserted" sentence.',
    timeComplexity: 'O(n) where n is total words',
    spaceComplexity: 'O(n)',
    hints: [
      'Split into words and compare from both ends.',
      'The inserted sentence goes in the middle, so the prefix and suffix must match.',
      'Make sure to handle sentences of different lengths.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1823. Find the Winner of the Circular Game
  // ---------------------------------------------------------------------------
  {
    id: 1823,
    description:
      'There are n friends in a circle numbered 1 to n. Starting from friend 1, count k friends clockwise and eliminate the k-th friend. Repeat until one friend remains. Return the winner. This is the Josephus problem.',
    examples:
      'Input: n = 5, k = 2\nOutput: 3',
    intuition:
      'This is the classic Josephus problem with a clean mathematical recurrence. Instead of simulating the elimination process, the formula J(n) = (J(n-1) + k) % n builds the answer bottom-up from the base case of 1 person.',
    approach:
      'Use the Josephus recurrence: J(1) = 0, J(n) = (J(n-1) + k) % n. The final answer is J(n) + 1 for 1-indexed result.',
    code: `class Solution:
    def findTheWinner(self, n: int, k: int) -> int:
        winner = 0
        for i in range(2, n + 1):
            winner = (winner + k) % i
        return winner + 1`,
    jsCode: `var findTheWinner = function(n, k) {
    let winner = 0;
    for (let i = 2; i <= n; i++) {
        winner = (winner + k) % i;
    }
    return winner + 1;
};`,
    explanation:
      '1. Use the Josephus problem recurrence relation.\n' +
      '2. Start with J(1) = 0 (0-indexed position of survivor among 1 person).\n' +
      '3. Build up: J(i) = (J(i-1) + k) % i for i from 2 to n.\n' +
      '4. Convert from 0-indexed to 1-indexed by adding 1.\n' +
      '5. This iterative approach is O(n) time and O(1) space.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'This is the classic Josephus problem.',
      'Simulation takes O(n*k). Can you use the mathematical recurrence?',
      'J(n, k) = (J(n-1, k) + k) % n, with J(1, k) = 0.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1834. Single-Threaded CPU
  // ---------------------------------------------------------------------------
  {
    id: 1834,
    description:
      'Given n tasks with enqueue times and processing times, a single-threaded CPU processes the shortest task available (ties broken by index). Return the order in which tasks are processed.',
    examples:
      'Input: tasks = [[1,2],[2,4],[3,2],[4,1]]\nOutput: [0,2,3,1]',
    intuition:
      'Think of this like a task scheduler: sort tasks by when they arrive, and always process the shortest available task first. A min-heap lets you efficiently pick the shortest task from all tasks that have arrived by the current time.',
    approach:
      'Sort tasks by enqueue time. Use a min-heap keyed by (processing time, index). At each step, add all tasks that have arrived, then process the one with shortest processing time.',
    code: `import heapq

class Solution:
    def getOrder(self, tasks: list[list[int]]) -> list[int]:
        indexed = sorted(enumerate(tasks), key=lambda x: x[1][0])
        heap = []
        result = []
        time = 0
        i = 0
        n = len(tasks)
        while i < n or heap:
            if not heap and i < n and indexed[i][1][0] > time:
                time = indexed[i][1][0]
            while i < n and indexed[i][1][0] <= time:
                idx, (enq, proc) = indexed[i]
                heapq.heappush(heap, (proc, idx))
                i += 1
            proc_time, idx = heapq.heappop(heap)
            time += proc_time
            result.append(idx)
        return result`,
    jsCode: `var getOrder = function(tasks) {
    const indexed = tasks.map((t, i) => [i, t[0], t[1]]).sort((a, b) => a[1] - b[1]);
    const pq = new MinPriorityQueue({compare: (a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]});
    const result = [];
    let time = 0, i = 0, n = tasks.length;
    while (i < n || !pq.isEmpty()) {
        if (pq.isEmpty() && i < n && indexed[i][1] > time) {
            time = indexed[i][1];
        }
        while (i < n && indexed[i][1] <= time) {
            pq.enqueue([indexed[i][2], indexed[i][0]]);
            i++;
        }
        const [procTime, idx] = pq.dequeue();
        time += procTime;
        result.push(idx);
    }
    return result;
};`,
    explanation:
      '1. Sort tasks by enqueue time, preserving original indices.\n' +
      '2. Use a min-heap sorted by (processing_time, index).\n' +
      '3. If the heap is empty and no tasks are available, jump time to the next task\'s enqueue time.\n' +
      '4. Add all tasks with enqueue_time <= current_time to the heap.\n' +
      '5. Pop the shortest task, advance time by its processing time, and record it.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Sort tasks by enqueue time but remember original indices.',
      'Use a min-heap to always pick the shortest available task.',
      'Handle idle time when no tasks are available.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1836. Remove Duplicates From an Unsorted Linked List
  // ---------------------------------------------------------------------------
  {
    id: 1836,
    description:
      'Given the head of a linked list, delete all nodes that have duplicate numbers, leaving only distinct numbers from the original list. Return the linked list sorted as well. (Remove all occurrences of duplicated values.)',
    examples:
      'Input: head = [1,2,3,2]\nOutput: [1,3]\nExplanation: 2 appears twice so all occurrences are removed.',
    intuition:
      'Two passes solve this elegantly: first count how many times each value appears, then keep only nodes that appear exactly once. The dummy head pattern simplifies building the filtered list.',
    approach:
      'First pass: count the frequency of each value using a hash map. Second pass: rebuild the list keeping only nodes with frequency 1 using a dummy head.',
    code: `from collections import Counter

class Solution:
    def deleteDuplicatesUnsorted(self, head: ListNode) -> ListNode:
        count = Counter()
        cur = head
        while cur:
            count[cur.val] += 1
            cur = cur.next
        dummy = ListNode(0)
        prev = dummy
        cur = head
        while cur:
            if count[cur.val] == 1:
                prev.next = cur
                prev = cur
            cur = cur.next
        prev.next = None
        return dummy.next`,
    jsCode: `var deleteDuplicatesUnsorted = function(head) {
    const count = new Map();
    let cur = head;
    while (cur) {
        count.set(cur.val, (count.get(cur.val) || 0) + 1);
        cur = cur.next;
    }
    const dummy = new ListNode(0);
    let prev = dummy;
    cur = head;
    while (cur) {
        if (count.get(cur.val) === 1) {
            prev.next = cur;
            prev = cur;
        }
        cur = cur.next;
    }
    prev.next = null;
    return dummy.next;
};`,
    explanation:
      '1. First pass: count occurrences of each value.\n' +
      '2. Create a dummy node to simplify list construction.\n' +
      '3. Second pass: only keep nodes whose value appears exactly once.\n' +
      '4. Set prev.next = None at the end to terminate the list.\n' +
      '5. Return dummy.next as the new head.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'First count how many times each value appears.',
      'Then rebuild the list keeping only unique values.',
      'A dummy head simplifies edge cases.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1838. Frequency of the Most Frequent Element
  // ---------------------------------------------------------------------------
  {
    id: 1838,
    description:
      'Given an integer array nums and an integer k, you can increment any element by 1 in one operation (at most k operations total). Return the maximum possible frequency of any element after performing at most k operations.',
    examples:
      'Input: nums = [1,2,4], k = 5\nOutput: 3\nExplanation: Increment 1 twice and 2 twice to get [4,4,4]. Frequency of 4 is 3.',
    intuition:
      'After sorting, all elements in a window can be raised to match the rightmost (largest) element. The cost is simply target * window_size - sum_of_window. A sliding window efficiently finds the largest window where this cost stays within budget k.',
    approach:
      'Sort the array and use a sliding window. For the window to have all elements equal to nums[right], the cost is nums[right]*window_size - window_sum. Shrink the window when cost exceeds k.',
    code: `class Solution:
    def maxFrequency(self, nums: list[int], k: int) -> int:
        nums.sort()
        left = 0
        total = 0
        result = 0
        for right in range(len(nums)):
            total += nums[right]
            while nums[right] * (right - left + 1) - total > k:
                total -= nums[left]
                left += 1
            result = max(result, right - left + 1)
        return result`,
    jsCode: `var maxFrequency = function(nums, k) {
    nums.sort((a, b) => a - b);
    let left = 0, total = 0, result = 0;
    for (let right = 0; right < nums.length; right++) {
        total += nums[right];
        while (nums[right] * (right - left + 1) - total > k) {
            total -= nums[left];
            left++;
        }
        result = Math.max(result, right - left + 1);
    }
    return result;
};`,
    explanation:
      '1. Sort the array so we only need to increment smaller elements.\n' +
      '2. Maintain a sliding window [left, right] and its sum.\n' +
      '3. Cost to make all elements equal to nums[right] = nums[right] * window_size - total.\n' +
      '4. If cost > k, shrink the window from the left.\n' +
      '5. Track the maximum window size.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sort the array first. You only need to increment elements, not decrement.',
      'Use a sliding window where all elements are raised to match the rightmost.',
      'The cost is target * window_size - sum of elements in window.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1845. Seat Reservation Manager
  // ---------------------------------------------------------------------------
  {
    id: 1845,
    description:
      'Implement SeatManager that manages n seats numbered 1 to n. Support reserve() which returns the smallest unreserved seat and reserves it, and unreserve(seatNumber) which unreserves the given seat.',
    examples:
      'Input: ["SeatManager","reserve","reserve","unreserve","reserve"]\n[[5],[],[],[2],[]]\nOutput: [null,1,2,null,2]',
    intuition:
      'A min-heap is the perfect data structure for \'always give me the smallest available item.\' Initialize it with all seats, pop for reserve, push back for unreserve - each operation is O(log n).',
    approach:
      'Use a min-heap to track available seats. Initially push all seats 1 to n. reserve() pops the minimum. unreserve() pushes the seat back.',
    code: `import heapq

class SeatManager:
    def __init__(self, n: int):
        self.heap = list(range(1, n + 1))

    def reserve(self) -> int:
        return heapq.heappop(self.heap)

    def unreserve(self, seatNumber: int) -> None:
        heapq.heappush(self.heap, seatNumber)`,
    jsCode: `var SeatManager = function(n) {
    this.pq = new MinPriorityQueue();
    for (let i = 1; i <= n; i++) {
        this.pq.enqueue(i);
    }
};

SeatManager.prototype.reserve = function() {
    return this.pq.dequeue().element;
};

SeatManager.prototype.unreserve = function(seatNumber) {
    this.pq.enqueue(seatNumber);
};`,
    explanation:
      '1. Initialize a min-heap with seats 1 through n (already a valid heap since sorted).\n' +
      '2. reserve() pops and returns the smallest seat from the heap.\n' +
      '3. unreserve() pushes the seat number back into the heap.\n' +
      '4. The heap always gives the smallest available seat in O(log n).',
    timeComplexity: 'O(log n) per operation',
    spaceComplexity: 'O(n)',
    hints: [
      'You need to always find the smallest unreserved seat.',
      'A min-heap is perfect for this — O(log n) push and pop.',
      'Initialize the heap with all seat numbers.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1846. Maximum Element After Decreasing and Rearranging
  // ---------------------------------------------------------------------------
  {
    id: 1846,
    description:
      'Given an array of positive integers arr, rearrange it and perform decreases so that arr[0] == 1 and the absolute difference between adjacent elements is at most 1. Return the maximum possible value of any element.',
    examples:
      'Input: arr = [2,2,1,2,1]\nOutput: 2\nExplanation: After sorting [1,1,2,2,2], we can have [1,2,2,2,2] -> max element is 2.',
    intuition:
      'Sorting puts the smallest values first where they can grow gradually. After sorting, each position can be at most 1 more than the previous, so you greedily assign the highest legal value at each step.',
    approach:
      'Sort the array and greedily assign values. Start with 1, and for each subsequent element, the value is at most previous + 1 (but cannot exceed the original value). The last element is the maximum.',
    code: `class Solution:
    def maximumElementAfterDecrementingAndRearranging(self, arr: list[int]) -> int:
        arr.sort()
        prev = 0
        for num in arr:
            prev = min(prev + 1, num)
        return prev`,
    jsCode: `var maximumElementAfterDecrementingAndRearranging = function(arr) {
    arr.sort((a, b) => a - b);
    let prev = 0;
    for (const num of arr) {
        prev = Math.min(prev + 1, num);
    }
    return prev;
};`,
    explanation:
      '1. Sort the array in ascending order.\n' +
      '2. Start with prev = 0 (element before the array).\n' +
      '3. For each element, set it to min(prev + 1, num) — can increase by at most 1, but not exceed original.\n' +
      '4. The final prev value is the maximum achievable element.\n' +
      '5. Sorting is optimal because larger values should come later.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sorting puts large values at the end where they can be maximized.',
      'After sorting, greedily assign the highest possible value to each position.',
      'Each position can be at most 1 more than the previous.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1851. Minimum Interval to Include Each Query
  // ---------------------------------------------------------------------------
  {
    id: 1851,
    description:
      'Given a 2D array intervals where intervals[i] = [left_i, right_i] and an array queries, for each query return the size of the smallest interval containing it, or -1 if no interval contains it.',
    examples:
      'Input: intervals = [[1,4],[2,4],[3,6],[4,4]], queries = [2,3,4,5]\nOutput: [3,3,1,4]',
    intuition:
      'Process queries offline by sorting them alongside intervals. A min-heap keyed by interval size lets you always access the smallest covering interval, while lazy deletion removes intervals that no longer cover the current query point.',
    approach:
      'Sort intervals by left endpoint and queries by value. Use a min-heap keyed by interval size. For each query, add all intervals whose left <= query, remove those whose right < query, and return the top of the heap.',
    code: `import heapq

class Solution:
    def minInterval(self, intervals: list[list[int]], queries: list[int]) -> list[int]:
        intervals.sort()
        sorted_q = sorted(enumerate(queries), key=lambda x: x[1])
        heap = []
        result = [-1] * len(queries)
        i = 0
        for qi, q in sorted_q:
            while i < len(intervals) and intervals[i][0] <= q:
                l, r = intervals[i]
                heapq.heappush(heap, (r - l + 1, r))
                i += 1
            while heap and heap[0][1] < q:
                heapq.heappop(heap)
            if heap:
                result[qi] = heap[0][0]
        return result`,
    jsCode: `var minInterval = function(intervals, queries) {
    intervals.sort((a, b) => a[0] - b[0]);
    const sortedQ = queries.map((q, i) => [i, q]).sort((a, b) => a[1] - b[1]);
    const pq = new MinPriorityQueue({compare: (a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]});
    const result = new Array(queries.length).fill(-1);
    let i = 0;
    for (const [qi, q] of sortedQ) {
        while (i < intervals.length && intervals[i][0] <= q) {
            const [l, r] = intervals[i];
            pq.enqueue([r - l + 1, r]);
            i++;
        }
        while (!pq.isEmpty() && pq.front()[1] < q) {
            pq.dequeue();
        }
        if (!pq.isEmpty()) {
            result[qi] = pq.front()[0];
        }
    }
    return result;
};`,
    explanation:
      '1. Sort intervals by left endpoint. Sort queries by value (keeping original indices).\n' +
      '2. For each query, push all intervals with left <= query onto a min-heap (keyed by size).\n' +
      '3. Remove intervals from the heap whose right endpoint < query (no longer valid).\n' +
      '4. The top of the heap is the smallest interval containing the query.\n' +
      '5. Store the result at the original query index.',
    timeComplexity: 'O((n + q) log n) where n = intervals, q = queries',
    spaceComplexity: 'O(n + q)',
    hints: [
      'Sort both intervals and queries to process them together.',
      'Use a min-heap to track the smallest interval covering the current query.',
      'Lazily remove expired intervals from the heap.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1856. Maximum Subarray Min-Product
  // ---------------------------------------------------------------------------
  {
    id: 1856,
    description:
      'The min-product of an array is the minimum value multiplied by the sum. Given an array nums, return the maximum min-product of any non-empty subarray, modulo 10^9 + 7.',
    examples:
      'Input: nums = [1,2,3,2]\nOutput: 14\nExplanation: Subarray [2,3,2] has min 2 and sum 7, min-product = 14.',
    intuition:
      'For each element, find the widest subarray where it is the minimum using a monotonic stack. The min-product for that element is then its value times the sum of that subarray (computed via prefix sums). The key insight is that the monotonic stack efficiently finds the \'dominance range\' of each element.',
    approach:
      'For each element, find the widest subarray where it is the minimum (using monotonic stack for previous/next smaller element). The min-product is nums[i] * sum(subarray), computed using prefix sums.',
    code: `class Solution:
    def maxSumMinProduct(self, nums: list[int]) -> int:
        MOD = 10**9 + 7
        n = len(nums)
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + nums[i]
        left = [-1] * n
        right = [n] * n
        stack = []
        for i in range(n):
            while stack and nums[stack[-1]] >= nums[i]:
                stack.pop()
            left[i] = stack[-1] if stack else -1
            stack.append(i)
        stack = []
        for i in range(n - 1, -1, -1):
            while stack and nums[stack[-1]] >= nums[i]:
                stack.pop()
            right[i] = stack[-1] if stack else n
            stack.append(i)
        result = 0
        for i in range(n):
            total = prefix[right[i]] - prefix[left[i] + 1]
            result = max(result, nums[i] * total)
        return result % MOD`,
    jsCode: `var maxSumMinProduct = function(nums) {
    const MOD = 1000000007n;
    const n = nums.length;
    const prefix = new Array(n + 1).fill(0n);
    for (let i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + BigInt(nums[i]);
    }
    const left = new Array(n).fill(-1);
    const right = new Array(n).fill(n);
    let stack = [];
    for (let i = 0; i < n; i++) {
        while (stack.length && nums[stack[stack.length - 1]] >= nums[i]) stack.pop();
        left[i] = stack.length ? stack[stack.length - 1] : -1;
        stack.push(i);
    }
    stack = [];
    for (let i = n - 1; i >= 0; i--) {
        while (stack.length && nums[stack[stack.length - 1]] >= nums[i]) stack.pop();
        right[i] = stack.length ? stack[stack.length - 1] : n;
        stack.push(i);
    }
    let result = 0n;
    for (let i = 0; i < n; i++) {
        const total = prefix[right[i]] - prefix[left[i] + 1];
        const product = BigInt(nums[i]) * total;
        if (product > result) result = product;
    }
    return Number(result % MOD);
};`,
    explanation:
      '1. Build prefix sums for O(1) range sum queries.\n' +
      '2. Use a monotonic stack to find left[i] = nearest smaller element to the left.\n' +
      '3. Similarly find right[i] = nearest smaller element to the right.\n' +
      '4. For each i, the subarray where nums[i] is minimum spans (left[i], right[i]).\n' +
      '5. Compute min-product = nums[i] * sum of that range. Return the maximum mod 10^9+7.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'For each element, find the largest subarray where it is the minimum.',
      'Use a monotonic stack to find previous and next smaller elements.',
      'Use prefix sums for fast range sum computation.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1858. Longest Word With All Prefixes
  // ---------------------------------------------------------------------------
  {
    id: 1858,
    description:
      'Given an array of strings words, find the longest string such that every prefix of it is also in words. If there are multiple, return the lexicographically smallest. If no such string exists, return "".',
    examples:
      'Input: words = ["k","ki","kir","kira","kiran"]\nOutput: "kiran"\nExplanation: Every prefix of "kiran" ("k","ki","kir","kira") is in the array.',
    intuition:
      'Put all words in a set for instant lookup, then check each word by verifying that every prefix (from length 1 up) exists in the set. Sorting by length descending lets you return the first valid word immediately.',
    approach:
      'Put all words into a set. Sort words by length (then lexicographically). For each word, check if all its prefixes exist in the set. Track the longest valid word.',
    code: `class Solution:
    def longestWord(self, words: list[str]) -> str:
        word_set = set(words)
        words.sort(key=lambda w: (-len(w), w))
        for word in words:
            if all(word[:i] in word_set for i in range(1, len(word) + 1)):
                return word
        return ""`,
    jsCode: `var longestWord = function(words) {
    const wordSet = new Set(words);
    words.sort((a, b) => b.length - a.length || a.localeCompare(b));
    for (const word of words) {
        let valid = true;
        for (let i = 1; i <= word.length; i++) {
            if (!wordSet.has(word.substring(0, i))) {
                valid = false;
                break;
            }
        }
        if (valid) return word;
    }
    return "";
};`,
    explanation:
      '1. Add all words to a set for O(1) lookup.\n' +
      '2. Sort words by length descending, then lexicographically ascending.\n' +
      '3. For each word, check if every prefix (length 1 to full length) is in the set.\n' +
      '4. Return the first valid word found (longest, then lexicographically smallest).\n' +
      '5. If none found, return empty string.',
    timeComplexity: 'O(n * L) where L is maximum word length',
    spaceComplexity: 'O(n * L)',
    hints: [
      'Use a set for fast prefix lookup.',
      'Sort to process longest words first.',
      'Check every prefix of each candidate word.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1864. Minimum Number of Swaps to Make the Binary String Alternating
  // ---------------------------------------------------------------------------
  {
    id: 1864,
    description:
      'Given a binary string s, return the minimum number of swaps to make s alternating (no two adjacent characters are the same), or -1 if impossible.',
    examples:
      'Input: s = "111000"\nOutput: 1\nExplanation: Swap s[1] and s[4] to get "101010".',
    intuition:
      'An alternating string can only start with \'0\' or \'1\', giving just two possible patterns. Count how many positions mismatch each pattern - each swap fixes two mismatches, so the answer is mismatches / 2.',
    approach:
      'Count 0s and 1s. For an alternating string to exist, the counts must differ by at most 1. Compare with the two possible alternating patterns and count mismatches. Swaps needed = mismatches / 2.',
    code: `class Solution:
    def minSwaps(self, s: str) -> int:
        ones = s.count('1')
        zeros = len(s) - ones
        if abs(ones - zeros) > 1:
            return -1
        def count_mismatches(start_with: str) -> int:
            mismatches = 0
            for i, c in enumerate(s):
                expected = start_with if i % 2 == 0 else ('0' if start_with == '1' else '1')
                if c != expected:
                    mismatches += 1
            return mismatches // 2
        if ones > zeros:
            return count_mismatches('1')
        elif zeros > ones:
            return count_mismatches('0')
        else:
            return min(count_mismatches('0'), count_mismatches('1'))`,
    jsCode: `var minSwaps = function(s) {
    let ones = 0;
    for (const c of s) if (c === '1') ones++;
    const zeros = s.length - ones;
    if (Math.abs(ones - zeros) > 1) return -1;
    function countMismatches(startWith) {
        let mismatches = 0;
        for (let i = 0; i < s.length; i++) {
            const expected = i % 2 === 0 ? startWith : (startWith === '1' ? '0' : '1');
            if (s[i] !== expected) mismatches++;
        }
        return Math.floor(mismatches / 2);
    }
    if (ones > zeros) return countMismatches('1');
    if (zeros > ones) return countMismatches('0');
    return Math.min(countMismatches('0'), countMismatches('1'));
};`,
    explanation:
      '1. Count 1s and 0s. If difference > 1, impossible.\n' +
      '2. If more 1s, the pattern must start with 1. If more 0s, start with 0.\n' +
      '3. If equal, try both patterns and take the minimum.\n' +
      '4. Count positions that don\'t match the expected pattern.\n' +
      '5. Each swap fixes two mismatches, so answer = mismatches / 2.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'An alternating string has at most one more of one character than the other.',
      'There are only two possible alternating patterns for a given length.',
      'Count mismatches and divide by 2 to get swaps.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1870. Minimum Speed to Arrive on Time
  // ---------------------------------------------------------------------------
  {
    id: 1870,
    description:
      'Given an array dist where dist[i] is the distance of the i-th train ride and a float hour representing the time limit, return the minimum integer speed such that you arrive on time. Each ride except the last must be rounded up to the next integer hour. Return -1 if impossible.',
    examples:
      'Input: dist = [1,3,2], hour = 6\nOutput: 1\nExplanation: At speed 1: ceil(1/1) + ceil(3/1) + 2/1 = 1+3+2 = 6 <= 6.',
    intuition:
      'Binary search on the answer is the key pattern here. For a given speed, you can calculate the exact travel time. Since higher speed means less time, the feasibility function is monotonic, making binary search perfect.',
    approach:
      'Binary search on the speed. For a given speed, compute total time (ceiling division for all rides except the last). Check if total time <= hour.',
    code: `import math

class Solution:
    def minSpeedOnTime(self, dist: list[int], hour: float) -> int:
        n = len(dist)
        if hour <= n - 1:
            return -1
        def can_arrive(speed: int) -> bool:
            time = 0.0
            for i in range(n - 1):
                time += math.ceil(dist[i] / speed)
            time += dist[-1] / speed
            return time <= hour
        lo, hi = 1, 10**7
        while lo < hi:
            mid = (lo + hi) // 2
            if can_arrive(mid):
                hi = mid
            else:
                lo = mid + 1
        return lo`,
    jsCode: `var minSpeedOnTime = function(dist, hour) {
    const n = dist.length;
    if (hour <= n - 1) return -1;
    function canArrive(speed) {
        let time = 0;
        for (let i = 0; i < n - 1; i++) {
            time += Math.ceil(dist[i] / speed);
        }
        time += dist[n - 1] / speed;
        return time <= hour;
    }
    let lo = 1, hi = 1e7;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (canArrive(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
};`,
    explanation:
      '1. If hour <= n-1, it is impossible (each of the first n-1 rides takes at least 1 hour).\n' +
      '2. Binary search on speed from 1 to 10^7.\n' +
      '3. For a given speed, compute time: ceil(dist[i]/speed) for first n-1 rides, exact for last.\n' +
      '4. If total time <= hour, try a lower speed; otherwise try higher.\n' +
      '5. Return the minimum valid speed.',
    timeComplexity: 'O(n * log(max_speed))',
    spaceComplexity: 'O(1)',
    hints: [
      'Binary search on the answer (speed).',
      'For each speed, compute the total travel time.',
      'Round up all rides except the last one.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1871. Jump Game VII
  // ---------------------------------------------------------------------------
  {
    id: 1871,
    description:
      'Given a binary string s and integers minJump and maxJump, starting at index 0, you can jump to index i+x where minJump <= x <= maxJump, but only if s[i+x] == "0". Return true if you can reach the last index.',
    examples:
      'Input: s = "011010", minJump = 2, maxJump = 3\nOutput: true\nExplanation: Jump from 0 -> 2 -> 5.',
    intuition:
      'Instead of BFS which could be slow, use a sliding window count of reachable positions. For each position i, it is reachable if any position in [i-maxJump, i-minJump] is reachable and s[i] is \'0\'. A running count avoids re-scanning the window each time.',
    approach:
      'Use BFS or a sliding window with a prefix sum of reachable positions. For each position, check if any position in [i - maxJump, i - minJump] is reachable.',
    code: `class Solution:
    def canReach(self, s: str, minJump: int, maxJump: int) -> bool:
        n = len(s)
        if s[-1] == '1':
            return False
        reachable = [False] * n
        reachable[0] = True
        count = 0
        for i in range(1, n):
            if i >= minJump:
                count += reachable[i - minJump]
            if i > maxJump:
                count -= reachable[i - maxJump - 1]
            reachable[i] = count > 0 and s[i] == '0'
        return reachable[-1]`,
    jsCode: `var canReach = function(s, minJump, maxJump) {
    const n = s.length;
    if (s[n - 1] === '1') return false;
    const reachable = new Array(n).fill(false);
    reachable[0] = true;
    let count = 0;
    for (let i = 1; i < n; i++) {
        if (i >= minJump) count += reachable[i - minJump] ? 1 : 0;
        if (i > maxJump) count -= reachable[i - maxJump - 1] ? 1 : 0;
        reachable[i] = count > 0 && s[i] === '0';
    }
    return reachable[n - 1];
};`,
    explanation:
      '1. reachable[i] indicates if position i can be reached.\n' +
      '2. Position i is reachable if s[i] == "0" and any position in [i-maxJump, i-minJump] is reachable.\n' +
      '3. Use a running count of reachable positions in the valid window.\n' +
      '4. Add reachable[i - minJump] when entering the window, subtract when leaving.\n' +
      '5. If count > 0 and s[i] == "0", mark i as reachable.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'BFS from index 0 would work but might be slow. Can you use DP?',
      'For each position, you need to know if any position in a range is reachable.',
      'Use a sliding window count of reachable positions in the valid jump range.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1877. Minimize Maximum Pair Sum in Array
  // ---------------------------------------------------------------------------
  {
    id: 1877,
    description:
      'Given an array nums of even length n, pair all elements into n/2 pairs. The pair sum is the sum of elements in a pair. Minimize the maximum pair sum across all pairs.',
    examples:
      'Input: nums = [3,5,2,3]\nOutput: 7\nExplanation: Pairs (2,5) and (3,3) give max pair sum = 7.',
    intuition:
      'Pairing the smallest with the largest balances all pair sums, like distributing weight evenly across teams. Sorting and pairing from both ends is the greedy strategy that minimizes the maximum pair sum.',
    approach:
      'Sort the array and pair the smallest with the largest, second smallest with second largest, etc. This minimizes the maximum pair sum.',
    code: `class Solution:
    def minPairSum(self, nums: list[int]) -> int:
        nums.sort()
        n = len(nums)
        return max(nums[i] + nums[n - 1 - i] for i in range(n // 2))`,
    jsCode: `var minPairSum = function(nums) {
    nums.sort((a, b) => a - b);
    const n = nums.length;
    let result = 0;
    for (let i = 0; i < Math.floor(n / 2); i++) {
        result = Math.max(result, nums[i] + nums[n - 1 - i]);
    }
    return result;
};`,
    explanation:
      '1. Sort the array in ascending order.\n' +
      '2. Pair the smallest with the largest: (nums[0], nums[n-1]), (nums[1], nums[n-2]), etc.\n' +
      '3. This strategy balances pair sums, minimizing the maximum.\n' +
      '4. Return the maximum pair sum among all pairs.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sort the array first.',
      'Pair the smallest with the largest to balance sums.',
      'The answer is the maximum of all such paired sums.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1886. Determine Whether Matrix Can Be Obtained By Rotation
  // ---------------------------------------------------------------------------
  {
    id: 1886,
    description:
      'Given two n x n binary matrices mat and target, return true if it is possible to rotate mat by 0, 90, 180, or 270 degrees to equal target.',
    examples:
      'Input: mat = [[0,1],[1,0]], target = [[1,0],[0,1]]\nOutput: true\nExplanation: Rotating mat 90 degrees clockwise gives target.',
    intuition:
      'There are only 4 possible rotations (0, 90, 180, 270 degrees). Simply rotate the matrix and compare with the target at each step. The rotation formula maps (i,j) to (j, n-1-i) for a 90-degree clockwise turn.',
    approach:
      'Rotate the matrix 90 degrees at a time (up to 4 times) and check if it matches target at each step. A 90-degree clockwise rotation maps (i,j) to (j, n-1-i).',
    code: `class Solution:
    def findRotation(self, mat: list[list[int]], target: list[list[int]]) -> bool:
        n = len(mat)
        for _ in range(4):
            if mat == target:
                return True
            mat = [[mat[n - 1 - j][i] for j in range(n)] for i in range(n)]
        return False`,
    jsCode: `var findRotation = function(mat, target) {
    const n = mat.length;
    for (let r = 0; r < 4; r++) {
        if (JSON.stringify(mat) === JSON.stringify(target)) return true;
        mat = Array.from({length: n}, (_, i) =>
            Array.from({length: n}, (_, j) => mat[n - 1 - j][i])
        );
    }
    return false;
};`,
    explanation:
      '1. Check if the current matrix equals target.\n' +
      '2. Rotate 90 degrees clockwise: new[i][j] = old[n-1-j][i].\n' +
      '3. Repeat up to 4 times (0, 90, 180, 270 degrees).\n' +
      '4. If any rotation matches, return True.\n' +
      '5. After 4 rotations we are back to the original, so return False.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'There are only 4 possible rotations to check.',
      'A 90-degree clockwise rotation: new[i][j] = old[n-1-j][i].',
      'Apply the rotation and compare with target each time.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1899. Merge Triplets to Form Target Triplet
  // ---------------------------------------------------------------------------
  {
    id: 1899,
    description:
      'Given a 2D array triplets where each element is [a, b, c] and a target triplet [x, y, z], you can repeatedly pick two triplets and replace each value with the max of the two. Return true if the target can be obtained.',
    examples:
      'Input: triplets = [[2,5,3],[1,8,4],[1,7,5]], target = [2,7,5]\nOutput: true\nExplanation: Take max of triplets[0] and triplets[2] to get [2,7,5].',
    intuition:
      'A triplet is only useful if none of its values exceed the target - otherwise taking the max would overshoot. Among usable triplets, you just need to verify that each of the three target coordinates is achievable by at least one triplet.',
    approach:
      'A triplet is usable if none of its values exceed the corresponding target value. Among usable triplets, check if we can match each target coordinate.',
    code: `class Solution:
    def mergeTriplets(self, triplets: list[list[int]], target: list[int]) -> bool:
        good = set()
        for t in triplets:
            if t[0] <= target[0] and t[1] <= target[1] and t[2] <= target[2]:
                for i in range(3):
                    if t[i] == target[i]:
                        good.add(i)
        return len(good) == 3`,
    jsCode: `var mergeTriplets = function(triplets, target) {
    const good = new Set();
    for (const t of triplets) {
        if (t[0] <= target[0] && t[1] <= target[1] && t[2] <= target[2]) {
            for (let i = 0; i < 3; i++) {
                if (t[i] === target[i]) good.add(i);
            }
        }
    }
    return good.size === 3;
};`,
    explanation:
      '1. A triplet is "usable" only if all its values are <= the corresponding target values.\n' +
      '2. If any value exceeds target, taking max with it would overshoot.\n' +
      '3. Among usable triplets, check if each target coordinate is matched exactly.\n' +
      '4. If all 3 coordinates are covered by usable triplets, return True.\n' +
      '5. The max operation can combine multiple usable triplets.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Skip any triplet where any value exceeds the corresponding target value.',
      'Among remaining triplets, check if each target position can be exactly matched.',
      'You only need to find one triplet per position that matches the target value.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1903. Largest Odd Number in String
  // ---------------------------------------------------------------------------
  {
    id: 1903,
    description:
      'Given a string num representing a large integer, return the largest-valued odd number that is a non-empty substring of num, or an empty string if none exists.',
    examples:
      'Input: num = "52"\nOutput: "5"\nExplanation: The odd substrings are "5" and "25" (wait, 25 is odd? No. 5 is odd.) Actually "5" with value 5.',
    intuition:
      'A number is odd if and only if its last digit is odd. To get the largest odd substring, find the rightmost odd digit and take everything from the start up to that position.',
    approach:
      'A number is odd if its last digit is odd. Scan from the right to find the rightmost odd digit. The substring from the start to that digit is the largest odd number.',
    code: `class Solution:
    def largestOddNumber(self, num: str) -> str:
        for i in range(len(num) - 1, -1, -1):
            if int(num[i]) % 2 == 1:
                return num[:i + 1]
        return ""`,
    jsCode: `var largestOddNumber = function(num) {
    for (let i = num.length - 1; i >= 0; i--) {
        if (parseInt(num[i]) % 2 === 1) {
            return num.substring(0, i + 1);
        }
    }
    return "";
};`,
    explanation:
      '1. Scan from right to left looking for the first odd digit.\n' +
      '2. A number ending with an odd digit is odd.\n' +
      '3. Taking the substring from the start to this position gives the largest value.\n' +
      '4. If no odd digit is found, return empty string.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'A number is odd if and only if its last digit is odd.',
      'Find the rightmost odd digit and take everything up to it.',
      'The largest substring starting from index 0 gives the largest value.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1922. Count Good Numbers
  // ---------------------------------------------------------------------------
  {
    id: 1922,
    description:
      'A digit string of length n is "good" if digits at even indices (0-indexed) are even (0,2,4,6,8) and digits at odd indices are prime (2,3,5,7). Return the count of good strings of length n modulo 10^9+7.',
    examples:
      'Input: n = 1\nOutput: 5\nExplanation: Good strings are "0","2","4","6","8".',
    intuition:
      'This is pure combinatorics: even-indexed positions have 5 choices (0,2,4,6,8) and odd-indexed positions have 4 choices (2,3,5,7). The total is simply 5^(even positions) * 4^(odd positions), computed with fast modular exponentiation.',
    approach:
      'Even positions have 5 choices (0,2,4,6,8), odd positions have 4 choices (2,3,5,7). If n has ceil(n/2) even positions and floor(n/2) odd positions, the answer is 5^ceil(n/2) * 4^floor(n/2) mod 10^9+7.',
    code: `class Solution:
    def countGoodNumbers(self, n: int) -> int:
        MOD = 10**9 + 7
        even_count = (n + 1) // 2
        odd_count = n // 2
        return pow(5, even_count, MOD) * pow(4, odd_count, MOD) % MOD`,
    jsCode: `var countGoodNumbers = function(n) {
    const MOD = 1000000007n;
    const evenCount = BigInt(Math.ceil(n / 2));
    const oddCount = BigInt(Math.floor(n / 2));
    function power(base, exp, mod) {
        let result = 1n;
        base = base % mod;
        while (exp > 0n) {
            if (exp % 2n === 1n) result = result * base % mod;
            exp = exp / 2n;
            base = base * base % mod;
        }
        return result;
    }
    return Number(power(5n, evenCount, MOD) * power(4n, oddCount, MOD) % MOD);
};`,
    explanation:
      '1. Even-indexed positions: indices 0, 2, 4, ... -> ceil(n/2) positions, 5 choices each.\n' +
      '2. Odd-indexed positions: indices 1, 3, 5, ... -> floor(n/2) positions, 4 choices each.\n' +
      '3. Total = 5^ceil(n/2) * 4^floor(n/2).\n' +
      '4. Use modular exponentiation (Python pow with 3 args) for efficiency.\n' +
      '5. Return result modulo 10^9 + 7.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Count even-indexed positions and odd-indexed positions separately.',
      'Even positions have 5 choices, odd positions have 4 choices.',
      'Use fast modular exponentiation for large n.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1926. Nearest Exit from Entrance in Maze
  // ---------------------------------------------------------------------------
  {
    id: 1926,
    description:
      'Given an m x n matrix maze with "." (empty) and "+" (wall), and an entrance coordinate, find the shortest path to any exit (border cell that is not the entrance). Return the number of steps, or -1 if impossible.',
    examples:
      'Input: maze = [["+","+",".","+"],[".",".",".","+"],["+","+","+","."]], entrance = [1,2]\nOutput: 1\nExplanation: (1,2) -> (0,2) which is a border cell.',
    intuition:
      'BFS from the entrance guarantees you find the shortest path. The first time you reach any border cell (that isn\'t the entrance), that\'s the nearest exit. Mark cells as walls to track visited positions.',
    approach:
      'BFS from the entrance. Mark visited cells. The first time we reach a border cell (that is not the entrance), return the distance.',
    code: `from collections import deque

class Solution:
    def nearestExit(self, maze: list[list[str]], entrance: list[int]) -> int:
        m, n = len(maze), len(maze[0])
        queue = deque([(entrance[0], entrance[1], 0)])
        maze[entrance[0]][entrance[1]] = '+'
        while queue:
            x, y, dist = queue.popleft()
            for dx, dy in [(0,1),(0,-1),(1,0),(-1,0)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < m and 0 <= ny < n and maze[nx][ny] == '.':
                    if nx == 0 or nx == m-1 or ny == 0 or ny == n-1:
                        return dist + 1
                    maze[nx][ny] = '+'
                    queue.append((nx, ny, dist + 1))
        return -1`,
    jsCode: `var nearestExit = function(maze, entrance) {
    const m = maze.length, n = maze[0].length;
    const queue = [[entrance[0], entrance[1], 0]];
    maze[entrance[0]][entrance[1]] = '+';
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    let idx = 0;
    while (idx < queue.length) {
        const [x, y, dist] = queue[idx++];
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < m && ny >= 0 && ny < n && maze[nx][ny] === '.') {
                if (nx === 0 || nx === m - 1 || ny === 0 || ny === n - 1) {
                    return dist + 1;
                }
                maze[nx][ny] = '+';
                queue.push([nx, ny, dist + 1]);
            }
        }
    }
    return -1;
};`,
    explanation:
      '1. Start BFS from the entrance, marking it as visited (wall).\n' +
      '2. For each cell, explore 4 neighbors.\n' +
      '3. If a neighbor is empty and on the border, it is an exit — return distance + 1.\n' +
      '4. Otherwise mark it visited and add to queue.\n' +
      '5. If the queue is exhausted, return -1.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'BFS from the entrance gives shortest paths.',
      'An exit is any border cell that is not the entrance.',
      'Mark cells as visited by changing them to walls.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1971. Find if Path Exists in Graph
  // ---------------------------------------------------------------------------
  {
    id: 1971,
    description:
      'Given a bi-directional graph with n vertices labeled 0 to n-1 and edges, determine if there is a valid path from source to destination.',
    examples:
      'Input: n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2\nOutput: true',
    intuition:
      'This is the most fundamental graph problem: can you get from A to B? Build an adjacency list and run BFS or DFS from the source. If you reach the destination, the path exists.',
    approach:
      'Build an adjacency list and use BFS or DFS from source. If destination is visited, return true. Union-Find also works.',
    code: `from collections import deque, defaultdict

class Solution:
    def validPath(self, n: int, edges: list[list[int]], source: int, destination: int) -> bool:
        if source == destination:
            return True
        graph = defaultdict(list)
        for u, v in edges:
            graph[u].append(v)
            graph[v].append(u)
        visited = set([source])
        queue = deque([source])
        while queue:
            node = queue.popleft()
            for neighbor in graph[node]:
                if neighbor == destination:
                    return True
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return False`,
    jsCode: `var validPath = function(n, edges, source, destination) {
    if (source === destination) return true;
    const graph = Array.from({length: n}, () => []);
    for (const [u, v] of edges) {
        graph[u].push(v);
        graph[v].push(u);
    }
    const visited = new Set([source]);
    const queue = [source];
    let idx = 0;
    while (idx < queue.length) {
        const node = queue[idx++];
        for (const neighbor of graph[node]) {
            if (neighbor === destination) return true;
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    return false;
};`,
    explanation:
      '1. Handle the trivial case: source == destination.\n' +
      '2. Build an adjacency list from the edge list.\n' +
      '3. BFS from source, marking visited nodes.\n' +
      '4. If we reach destination, return True.\n' +
      '5. If the queue is exhausted without finding destination, return False.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    hints: [
      'Use BFS or DFS from the source node.',
      'Build an adjacency list for efficient traversal.',
      'Union-Find is another approach for connectivity queries.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1976. Number of Ways to Arrive at Destination
  // ---------------------------------------------------------------------------
  {
    id: 1976,
    description:
      'Given n intersections and roads with travel times, find the number of ways to travel from intersection 0 to n-1 in the shortest time possible. Return the count modulo 10^9+7.',
    examples:
      'Input: n = 7, roads = [[0,6,7],[0,1,2],[1,2,3],[1,3,3],[6,3,3],[3,5,1],[6,5,1],[2,5,1],[0,4,5],[4,6,2]]\nOutput: 4',
    intuition:
      'Extend Dijkstra\'s algorithm with a count array. When you discover a shorter path, reset the count. When you find an equal-length path, add the counts together. This naturally accumulates all shortest path counts.',
    approach:
      'Use Dijkstra\'s algorithm with a count array. When you find a shorter path, update distance and reset count. When you find an equal-length path, add the counts.',
    code: `import heapq

class Solution:
    def countPaths(self, n: int, roads: list[list[int]]) -> int:
        MOD = 10**9 + 7
        graph = [[] for _ in range(n)]
        for u, v, t in roads:
            graph[u].append((v, t))
            graph[v].append((u, t))
        dist = [float('inf')] * n
        ways = [0] * n
        dist[0] = 0
        ways[0] = 1
        heap = [(0, 0)]
        while heap:
            d, u = heapq.heappop(heap)
            if d > dist[u]:
                continue
            for v, t in graph[u]:
                if d + t < dist[v]:
                    dist[v] = d + t
                    ways[v] = ways[u]
                    heapq.heappush(heap, (dist[v], v))
                elif d + t == dist[v]:
                    ways[v] = (ways[v] + ways[u]) % MOD
        return ways[n - 1]`,
    jsCode: `var countPaths = function(n, roads) {
    const MOD = 1e9 + 7;
    const graph = Array.from({length: n}, () => []);
    for (const [u, v, t] of roads) {
        graph[u].push([v, t]);
        graph[v].push([u, t]);
    }
    const dist = new Array(n).fill(Infinity);
    const ways = new Array(n).fill(0);
    dist[0] = 0;
    ways[0] = 1;
    const pq = new MinPriorityQueue({compare: (a, b) => a[0] - b[0]});
    pq.enqueue([0, 0]);
    while (!pq.isEmpty()) {
        const [d, u] = pq.dequeue();
        if (d > dist[u]) continue;
        for (const [v, t] of graph[u]) {
            if (d + t < dist[v]) {
                dist[v] = d + t;
                ways[v] = ways[u];
                pq.enqueue([dist[v], v]);
            } else if (d + t === dist[v]) {
                ways[v] = (ways[v] + ways[u]) % MOD;
            }
        }
    }
    return ways[n - 1];
};`,
    explanation:
      '1. Build an adjacency list with edge weights.\n' +
      '2. Run Dijkstra from node 0 with a ways[] array.\n' +
      '3. If a shorter path is found to v, update dist[v] and set ways[v] = ways[u].\n' +
      '4. If an equal-length path is found, add ways[u] to ways[v].\n' +
      '5. Return ways[n-1] modulo 10^9+7.',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V + E)',
    hints: [
      'Dijkstra finds shortest paths. Extend it to count them.',
      'When finding an equal-distance path, accumulate the count.',
      'Skip nodes that have already been processed with a shorter distance.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1997. First Day Where You Have Been in All the Rooms
  // ---------------------------------------------------------------------------
  {
    id: 1997,
    description:
      'There are n rooms labeled 0 to n-1. On day 0, you visit room 0. On each subsequent day, if you have visited room i an odd number of times, go to nextVisit[i]; otherwise go to (i+1) % n. Return the first day you visit all rooms, modulo 10^9+7.',
    examples:
      'Input: nextVisit = [0,0]\nOutput: 2\nExplanation: Day 0: room 0, Day 1: room 0 (odd visits, go to 0), Day 2: room 1 (even visits, go to 1).',
    intuition:
      'The key insight is that to advance from room i to room i+1, you must visit room i an even number of times. The DP recurrence captures the round-trip cost: going back to nextVisit[i] and returning to room i before finally moving forward.',
    approach:
      'Use DP. dp[i] = first day you visit room i. To reach room i+1, you must visit room i an even number of times. The recurrence involves going back to nextVisit[i] and returning.',
    code: `class Solution:
    def firstDayBeenInAllRooms(self, nextVisit: list[int]) -> int:
        MOD = 10**9 + 7
        n = len(nextVisit)
        dp = [0] * n
        for i in range(1, n):
            dp[i] = (2 * dp[i - 1] - dp[nextVisit[i - 1]] + 2) % MOD
        return dp[n - 1]`,
    jsCode: `var firstDayBeenInAllRooms = function(nextVisit) {
    const MOD = 1e9 + 7;
    const n = nextVisit.length;
    const dp = new Array(n).fill(0);
    for (let i = 1; i < n; i++) {
        dp[i] = ((2 * dp[i - 1] - dp[nextVisit[i - 1]] + 2) % MOD + MOD) % MOD;
    }
    return dp[n - 1];
};`,
    explanation:
      '1. dp[i] = first day you visit room i for the first time.\n' +
      '2. After first visiting room i-1 on day dp[i-1], you go to nextVisit[i-1] (odd visit count).\n' +
      '3. You need to get back from nextVisit[i-1] to i-1 again, then move to i.\n' +
      '4. The recurrence: dp[i] = 2*dp[i-1] - dp[nextVisit[i-1]] + 2.\n' +
      '5. Return dp[n-1] mod 10^9+7.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Think about when you first visit each room.',
      'After first visiting room i, you go back to nextVisit[i] (since visit count is odd).',
      'The DP recurrence captures the cost of the round trip.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2013. Detect Squares
  // ---------------------------------------------------------------------------
  {
    id: 2013,
    description:
      'Design a data structure that supports adding points on a 2D plane and counting the number of axis-aligned squares that can be formed with a given query point as one corner.',
    examples:
      'Input: ["DetectSquares","add","add","add","count"]\n[[],[[3,10]],[[11,1]],[[3,1]],[[11,10]]]\nOutput: [null,null,null,null,1]',
    intuition:
      'For each query point, fix one side of the square along the same row. The side length determines exactly where to look for the other two corners. Multiplying point counts handles duplicates correctly.',
    approach:
      'Store point counts in a hash map. For a query point (qx, qy), iterate over all points (px, qy) on the same y-coordinate. For each, the side length is |px - qx|, then check if (qx, qy +/- side) and (px, qy +/- side) exist.',
    code: `from collections import defaultdict

class DetectSquares:
    def __init__(self):
        self.points = defaultdict(int)
        self.y_map = defaultdict(list)

    def add(self, point: list[int]) -> None:
        x, y = point
        if self.points[(x, y)] == 0:
            self.y_map[y].append(x)
        self.points[(x, y)] += 1

    def count(self, point: list[int]) -> int:
        qx, qy = point
        result = 0
        for px in self.y_map[qy]:
            if px == qx:
                continue
            side = abs(px - qx)
            for dy in [side, -side]:
                result += self.points[(px, qy)] * self.points[(qx, qy + dy)] * self.points[(px, qy + dy)]
        return result`,
    jsCode: `var DetectSquares = function() {
    this.points = new Map();
    this.yMap = new Map();
};

DetectSquares.prototype.add = function(point) {
    const [x, y] = point;
    const key = x + ',' + y;
    if (!this.points.has(key)) {
        if (!this.yMap.has(y)) this.yMap.set(y, []);
        this.yMap.get(y).push(x);
    }
    this.points.set(key, (this.points.get(key) || 0) + 1);
};

DetectSquares.prototype.count = function(point) {
    const [qx, qy] = point;
    let result = 0;
    const xList = this.yMap.get(qy) || [];
    for (const px of xList) {
        if (px === qx) continue;
        const side = Math.abs(px - qx);
        for (const dy of [side, -side]) {
            const c1 = this.points.get(px + ',' + qy) || 0;
            const c2 = this.points.get(qx + ',' + (qy + dy)) || 0;
            const c3 = this.points.get(px + ',' + (qy + dy)) || 0;
            result += c1 * c2 * c3;
        }
    }
    return result;
};`,
    explanation:
      '1. Store count of each point and a map from y-coordinate to list of x-coordinates.\n' +
      '2. For query (qx, qy), find all points (px, qy) on the same row.\n' +
      '3. The side length is |px - qx|. Check above and below for the other two corners.\n' +
      '4. Multiply counts of the three other corners (handling duplicates).\n' +
      '5. Sum all valid squares.',
    timeComplexity: 'O(n) per count query where n is number of unique x-values on the same row',
    spaceComplexity: 'O(n) total points stored',
    hints: [
      'Fix one side of the square along the same y-coordinate as the query point.',
      'The side length determines where to look for the other two corners.',
      'Use point counts to handle duplicate points correctly.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2024. Maximize the Confusion of an Exam
  // ---------------------------------------------------------------------------
  {
    id: 2024,
    description:
      'A teacher gives a True/False exam represented by string answerKey. You can change at most k answers. Return the maximum number of consecutive identical answers after making at most k changes.',
    examples:
      'Input: answerKey = "TTFF", k = 2\nOutput: 4\nExplanation: Change both F\'s to T\'s to get "TTTT".',
    intuition:
      'This is the \'longest substring with at most k replacements\' pattern. Run the sliding window twice - once treating T\'s as the characters to replace, once treating F\'s. The longer of the two windows is the answer.',
    approach:
      'Use a sliding window. Find the longest substring with at most k T\'s (all converted to F) and the longest with at most k F\'s (all converted to T). Return the maximum.',
    code: `class Solution:
    def maxConsecutiveAnswers(self, answerKey: str, k: int) -> int:
        def maxLen(char: str) -> int:
            left = count = result = 0
            for right in range(len(answerKey)):
                if answerKey[right] == char:
                    count += 1
                while count > k:
                    if answerKey[left] == char:
                        count -= 1
                    left += 1
                result = max(result, right - left + 1)
            return result
        return max(maxLen('T'), maxLen('F'))`,
    jsCode: `var maxConsecutiveAnswers = function(answerKey, k) {
    function maxLen(char) {
        let left = 0, count = 0, result = 0;
        for (let right = 0; right < answerKey.length; right++) {
            if (answerKey[right] === char) count++;
            while (count > k) {
                if (answerKey[left] === char) count--;
                left++;
            }
            result = Math.max(result, right - left + 1);
        }
        return result;
    }
    return Math.max(maxLen('T'), maxLen('F'));
};`,
    explanation:
      '1. Run sliding window twice: once counting T\'s to convert, once counting F\'s.\n' +
      '2. For each window, count how many of the target character are in [left, right].\n' +
      '3. If count exceeds k, shrink window from the left.\n' +
      '4. Track the maximum valid window size.\n' +
      '5. Return the maximum of both runs.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'This is equivalent to "longest substring with at most k replacements."',
      'Run the sliding window for converting T->F and F->T separately.',
      'Shrink the window when the number of characters to change exceeds k.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2028. Find Missing Observations
  // ---------------------------------------------------------------------------
  {
    id: 2028,
    description:
      'You have n + m dice rolls. The m rolls are given with mean of all n+m rolls. Find n missing observations such that the mean is exactly the given value. Return an empty array if impossible.',
    examples:
      'Input: rolls = [3,2,4,3], mean = 4, n = 2\nOutput: [6,6]\nExplanation: Total needed = 4*6 = 24. Given sum = 12. Missing sum = 12 -> [6,6].',
    intuition:
      'Calculate the total sum the missing dice must add up to, then distribute it as evenly as possible among n dice. If the required sum falls outside [n, 6n], it\'s impossible since each die shows 1 to 6.',
    approach:
      'Calculate the required sum of missing rolls = mean * (n + m) - sum(rolls). Distribute this sum among n dice (each 1-6). If the sum is out of range [n, 6n], return empty.',
    code: `class Solution:
    def missingRolls(self, rolls: list[int], mean: int, n: int) -> list[int]:
        total = mean * (n + len(rolls))
        missing_sum = total - sum(rolls)
        if missing_sum < n or missing_sum > 6 * n:
            return []
        base, extra = divmod(missing_sum, n)
        return [base + 1] * extra + [base] * (n - extra)`,
    jsCode: `var missingRolls = function(rolls, mean, n) {
    const total = mean * (n + rolls.length);
    const missingSum = total - rolls.reduce((a, b) => a + b, 0);
    if (missingSum < n || missingSum > 6 * n) return [];
    const base = Math.floor(missingSum / n);
    const extra = missingSum % n;
    const result = new Array(n).fill(base);
    for (let i = 0; i < extra; i++) result[i]++;
    return result;
};`,
    explanation:
      '1. Compute total sum needed = mean * (n + m).\n' +
      '2. Missing sum = total - sum of given rolls.\n' +
      '3. If missing_sum < n or > 6*n, impossible (dice values are 1-6).\n' +
      '4. Distribute evenly: base = missing_sum // n, extra = missing_sum % n.\n' +
      '5. Give extra dice base+1, rest get base.',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(n)',
    hints: [
      'Calculate the sum the missing dice must total.',
      'Check if the sum is achievable with n dice (each 1-6).',
      'Distribute the sum as evenly as possible among n dice.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2034. Stock Price Fluctuation
  // ---------------------------------------------------------------------------
  {
    id: 2034,
    description:
      'Design a stock price tracker. Support update(timestamp, price) which corrects or adds a record, current() returns the latest price, maximum() returns the highest, and minimum() returns the lowest among all current records.',
    examples:
      'Input: ["StockPrice","update","update","current","maximum","update","maximum"]\n[[],[1,10],[2,5],[],[],[1,3],[]]\nOutput: [null,null,null,5,10,null,5]',
    intuition:
      'The challenge is handling price corrections efficiently. Two heaps (max and min) with lazy deletion solve this: when the top of a heap doesn\'t match the current price for that timestamp, it\'s stale and can be discarded.',
    approach:
      'Use a hash map for timestamp -> price, a variable for latest timestamp, and two heaps (max and min) with lazy deletion for stale entries.',
    code: `import heapq

class StockPrice:
    def __init__(self):
        self.prices = {}
        self.latest = 0
        self.max_heap = []
        self.min_heap = []

    def update(self, timestamp: int, price: int) -> None:
        self.prices[timestamp] = price
        self.latest = max(self.latest, timestamp)
        heapq.heappush(self.max_heap, (-price, timestamp))
        heapq.heappush(self.min_heap, (price, timestamp))

    def current(self) -> int:
        return self.prices[self.latest]

    def maximum(self) -> int:
        while self.prices[self.max_heap[0][1]] != -self.max_heap[0][0]:
            heapq.heappop(self.max_heap)
        return -self.max_heap[0][0]

    def minimum(self) -> int:
        while self.prices[self.min_heap[0][1]] != self.min_heap[0][0]:
            heapq.heappop(self.min_heap)
        return self.min_heap[0][0]`,
    jsCode: `var StockPrice = function() {
    this.prices = new Map();
    this.latest = 0;
    this.maxHeap = new MaxPriorityQueue({compare: (a, b) => b[0] - a[0] || a[1] - b[1]});
    this.minHeap = new MinPriorityQueue({compare: (a, b) => a[0] - b[0] || a[1] - b[1]});
};

StockPrice.prototype.update = function(timestamp, price) {
    this.prices.set(timestamp, price);
    this.latest = Math.max(this.latest, timestamp);
    this.maxHeap.enqueue([price, timestamp]);
    this.minHeap.enqueue([price, timestamp]);
};

StockPrice.prototype.current = function() {
    return this.prices.get(this.latest);
};

StockPrice.prototype.maximum = function() {
    while (this.prices.get(this.maxHeap.front()[1]) !== this.maxHeap.front()[0]) {
        this.maxHeap.dequeue();
    }
    return this.maxHeap.front()[0];
};

StockPrice.prototype.minimum = function() {
    while (this.prices.get(this.minHeap.front()[1]) !== this.minHeap.front()[0]) {
        this.minHeap.dequeue();
    }
    return this.minHeap.front()[0];
};`,
    explanation:
      '1. Store prices in a dict mapping timestamp -> current price.\n' +
      '2. On update, push to both heaps and update the hash map.\n' +
      '3. For current(), return price at the latest timestamp.\n' +
      '4. For max/min, pop stale entries (price doesn\'t match current record) lazily.\n' +
      '5. Lazy deletion avoids the need to remove old entries eagerly.',
    timeComplexity: 'O(log n) amortized per operation',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a hash map to track the current price for each timestamp.',
      'Heaps give O(log n) max/min, but updates invalidate old entries.',
      'Use lazy deletion: check if the heap top matches the current record.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2038. Remove Colored Pieces if Both Neighbors are the Same Color
  // ---------------------------------------------------------------------------
  {
    id: 2038,
    description:
      'Alice and Bob play a game on a string of "A"s and "B"s. Alice removes an "A" that has both neighbors "A"; Bob removes a "B" with both neighbors "B". They alternate (Alice first). The player who cannot move loses. Return true if Alice wins.',
    examples:
      'Input: colors = "AAABABB"\nOutput: true\nExplanation: Alice can remove the middle A from "AAA" but Bob has no valid move.',
    intuition:
      'Each player\'s moves are independent - removing an A surrounded by A\'s doesn\'t affect Bob\'s B moves at all. So just count how many removable pieces each player has. Alice wins if she has strictly more moves than Bob.',
    approach:
      'Count the number of moves available to each player. For a run of k consecutive same characters, there are max(0, k-2) removable pieces. Alice wins if her count > Bob\'s count.',
    code: `class Solution:
    def winnerOfGame(self, colors: str) -> bool:
        alice = bob = 0
        for i in range(1, len(colors) - 1):
            if colors[i - 1] == colors[i] == colors[i + 1]:
                if colors[i] == 'A':
                    alice += 1
                else:
                    bob += 1
        return alice > bob`,
    jsCode: `var winnerOfGame = function(colors) {
    let alice = 0, bob = 0;
    for (let i = 1; i < colors.length - 1; i++) {
        if (colors[i - 1] === colors[i] && colors[i] === colors[i + 1]) {
            if (colors[i] === 'A') alice++;
            else bob++;
        }
    }
    return alice > bob;
};`,
    explanation:
      '1. For each position (not first or last), check if it and both neighbors are the same.\n' +
      '2. If all three are "A", Alice has a move. If all "B", Bob has a move.\n' +
      '3. Count total moves for each player.\n' +
      '4. Alice goes first, so she wins if alice_moves > bob_moves.\n' +
      '5. Removing a piece doesn\'t affect the other player\'s moves (independent).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Count the number of removable pieces for each player independently.',
      'A piece is removable if both neighbors are the same color.',
      'Alice wins if she has strictly more moves than Bob.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2055. Plates Between Candles
  // ---------------------------------------------------------------------------
  {
    id: 2055,
    description:
      'Given a string s of "*" (plates) and "|" (candles), and queries [left, right], for each query return the number of plates between candles in the substring s[left..right].',
    examples:
      'Input: s = "**|**|***|", queries = [[2,5],[5,9]]\nOutput: [2,3]',
    intuition:
      'Precompute three arrays: prefix sums of plates, nearest candle to the left, and nearest candle to the right. For each query, find the innermost candle pair and count plates between them using prefix sums - all in O(1) per query.',
    approach:
      'Precompute prefix sums of plates, and for each index the nearest candle to the left and right. For each query, find the first candle from left and last candle from right, then count plates between them.',
    code: `class Solution:
    def platesBetweenCandles(self, s: str, queries: list[list[int]]) -> list[int]:
        n = len(s)
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + (1 if s[i] == '*' else 0)
        left_candle = [-1] * n
        right_candle = [-1] * n
        candle = -1
        for i in range(n):
            if s[i] == '|':
                candle = i
            left_candle[i] = candle
        candle = -1
        for i in range(n - 1, -1, -1):
            if s[i] == '|':
                candle = i
            right_candle[i] = candle
        result = []
        for l, r in queries:
            lc = right_candle[l]
            rc = left_candle[r]
            if lc != -1 and rc != -1 and lc < rc:
                result.append(prefix[rc] - prefix[lc + 1])
            else:
                result.append(0)
        return result`,
    jsCode: `var platesBetweenCandles = function(s, queries) {
    const n = s.length;
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + (s[i] === '*' ? 1 : 0);
    }
    const leftCandle = new Array(n).fill(-1);
    const rightCandle = new Array(n).fill(-1);
    let candle = -1;
    for (let i = 0; i < n; i++) {
        if (s[i] === '|') candle = i;
        leftCandle[i] = candle;
    }
    candle = -1;
    for (let i = n - 1; i >= 0; i--) {
        if (s[i] === '|') candle = i;
        rightCandle[i] = candle;
    }
    const result = [];
    for (const [l, r] of queries) {
        const lc = rightCandle[l];
        const rc = leftCandle[r];
        if (lc !== -1 && rc !== -1 && lc < rc) {
            result.push(prefix[rc] - prefix[lc + 1]);
        } else {
            result.push(0);
        }
    }
    return result;
};`,
    explanation:
      '1. Build prefix sum of plates for O(1) range counting.\n' +
      '2. Precompute left_candle[i] = nearest candle at or before i.\n' +
      '3. Precompute right_candle[i] = nearest candle at or after i.\n' +
      '4. For query [l, r], find lc = first candle >= l and rc = last candle <= r.\n' +
      '5. Plates between candles = prefix[rc] - prefix[lc + 1].',
    timeComplexity: 'O(n + q)',
    spaceComplexity: 'O(n)',
    hints: [
      'Precompute prefix sums and nearest candle positions.',
      'For each query, find the innermost pair of candles.',
      'Count plates between those two candle positions using prefix sums.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2058. Find the Minimum and Maximum Number of Nodes Between Critical Points
  // ---------------------------------------------------------------------------
  {
    id: 2058,
    description:
      'A critical point in a linked list is a local minimum or local maximum. Given the head, return [minDistance, maxDistance] between any two critical points, or [-1, -1] if fewer than 2 critical points exist.',
    examples:
      'Input: head = [5,3,1,2,5,1,2]\nOutput: [1,3]\nExplanation: Critical points at positions 2 (min), 4 (max), 5 (min). Min dist=1, max dist=3.',
    intuition:
      'A critical point is a local min or max in the linked list. Collect all their positions, then the minimum distance is between consecutive critical points and the maximum distance is between the first and last.',
    approach:
      'Traverse the list and record positions of all critical points. The minimum distance is the minimum gap between consecutive critical points. The maximum distance is last - first.',
    code: `class Solution:
    def nodesBetweenCriticalPoints(self, head: Optional[ListNode]) -> list[int]:
        critical = []
        prev = head
        cur = head.next
        idx = 1
        while cur and cur.next:
            nxt = cur.next
            if (cur.val > prev.val and cur.val > nxt.val) or \\
               (cur.val < prev.val and cur.val < nxt.val):
                critical.append(idx)
            prev = cur
            cur = nxt
            idx += 1
        if len(critical) < 2:
            return [-1, -1]
        min_dist = float('inf')
        for i in range(1, len(critical)):
            min_dist = min(min_dist, critical[i] - critical[i - 1])
        max_dist = critical[-1] - critical[0]
        return [min_dist, max_dist]`,
    jsCode: `var nodesBetweenCriticalPoints = function(head) {
    const critical = [];
    let prev = head, cur = head.next, idx = 1;
    while (cur && cur.next) {
        const nxt = cur.next;
        if ((cur.val > prev.val && cur.val > nxt.val) ||
            (cur.val < prev.val && cur.val < nxt.val)) {
            critical.push(idx);
        }
        prev = cur;
        cur = nxt;
        idx++;
    }
    if (critical.length < 2) return [-1, -1];
    let minDist = Infinity;
    for (let i = 1; i < critical.length; i++) {
        minDist = Math.min(minDist, critical[i] - critical[i - 1]);
    }
    const maxDist = critical[critical.length - 1] - critical[0];
    return [minDist, maxDist];
};`,
    explanation:
      '1. Traverse the linked list, checking each node against its neighbors.\n' +
      '2. A node is critical if it is a local min or local max.\n' +
      '3. Record the positions (indices) of all critical points.\n' +
      '4. Minimum distance = min gap between consecutive critical points.\n' +
      '5. Maximum distance = last critical position - first critical position.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k) where k is the number of critical points',
    hints: [
      'Identify critical points by comparing each node with its neighbors.',
      'The max distance is always between the first and last critical points.',
      'The min distance must be between two adjacent critical points.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2064. Minimized Maximum of Products Distributed to Any Store
  // ---------------------------------------------------------------------------
  {
    id: 2064,
    description:
      'Given n specialty retail stores and an array quantities where quantities[i] is the number of products of type i, distribute all products to stores such that each store gets at most one type. Minimize the maximum number of products given to any store.',
    examples:
      'Input: n = 6, quantities = [11,6]\nOutput: 3\nExplanation: Distribute 11 products across 4 stores (3,3,3,2) and 6 across 2 stores (3,3). Max is 3.',
    intuition:
      'Binary search on the answer: if each store can hold at most x products, how many stores do you need? For each product type, you need ceil(quantity/x) stores. Find the smallest x where the total stores needed is at most n.',
    approach:
      'Binary search on the answer (maximum products per store). For a given max x, check if ceil(q/x) for each quantity sums to <= n stores.',
    code: `import math

class Solution:
    def minimizedMaximum(self, n: int, quantities: list[int]) -> int:
        lo, hi = 1, max(quantities)
        while lo < hi:
            mid = (lo + hi) // 2
            stores_needed = sum(math.ceil(q / mid) for q in quantities)
            if stores_needed <= n:
                hi = mid
            else:
                lo = mid + 1
        return lo`,
    jsCode: `var minimizedMaximum = function(n, quantities) {
    let lo = 1, hi = Math.max(...quantities);
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        let storesNeeded = 0;
        for (const q of quantities) {
            storesNeeded += Math.ceil(q / mid);
        }
        if (storesNeeded <= n) hi = mid;
        else lo = mid + 1;
    }
    return lo;
};`,
    explanation:
      '1. Binary search on x = maximum products per store.\n' +
      '2. For each x, compute total stores needed: sum(ceil(q / x)) for all quantities.\n' +
      '3. If stores_needed <= n, x is feasible — try smaller.\n' +
      '4. Otherwise, try larger.\n' +
      '5. Return the minimum feasible x.',
    timeComplexity: 'O(m * log(max_q)) where m = len(quantities)',
    spaceComplexity: 'O(1)',
    hints: [
      'Binary search on the maximum number of products per store.',
      'For a given limit, each product type needs ceil(quantity / limit) stores.',
      'The answer is the smallest limit where total stores needed <= n.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2076. Process Restricted Friend Requests
  // ---------------------------------------------------------------------------
  {
    id: 2076,
    description:
      'There are n persons. Given a list of restrictions (pairs who cannot be friends, even indirectly through the same group) and friend requests, process each request: accept if adding the friendship doesn\'t violate any restriction, otherwise reject. Return a boolean array.',
    examples:
      'Input: n = 3, restrictions = [[0,1]], requests = [[0,2],[2,1]]\nOutput: [true,false]',
    intuition:
      'Union-Find manages friend groups, but before merging two groups, you must check every restriction. A restriction is violated if the two restricted people would end up in the same group after the merge.',
    approach:
      'Use Union-Find. For each request (u, v), tentatively merge their sets. Check if any restriction pair would end up in the same set. If so, reject; otherwise, accept and keep the merge.',
    code: `class Solution:
    def friendRequests(self, n: int, restrictions: list[list[int]], requests: list[list[int]]) -> list[bool]:
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        result = []
        for u, v in requests:
            pu, pv = find(u), find(v)
            if pu == pv:
                result.append(True)
                continue
            ok = True
            for a, b in restrictions:
                pa, pb = find(a), find(b)
                if (pa == pu and pb == pv) or (pa == pv and pb == pu):
                    ok = False
                    break
            if ok:
                parent[pu] = pv
            result.append(ok)
        return result`,
    jsCode: `var friendRequests = function(n, restrictions, requests) {
    const parent = Array.from({length: n}, (_, i) => i);
    function find(x) {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    const result = [];
    for (const [u, v] of requests) {
        const pu = find(u), pv = find(v);
        if (pu === pv) { result.push(true); continue; }
        let ok = true;
        for (const [a, b] of restrictions) {
            const pa = find(a), pb = find(b);
            if ((pa === pu && pb === pv) || (pa === pv && pb === pu)) {
                ok = false;
                break;
            }
        }
        if (ok) parent[pu] = pv;
        result.push(ok);
    }
    return result;
};`,
    explanation:
      '1. Initialize Union-Find with each person as their own parent.\n' +
      '2. For each request (u, v), find their roots.\n' +
      '3. If already in the same set, accept automatically.\n' +
      '4. Otherwise, check if merging would violate any restriction.\n' +
      '5. A restriction (a, b) is violated if find(a) and find(b) would be in the same merged set.',
    timeComplexity: 'O(q * r * alpha(n)) where q = requests, r = restrictions',
    spaceComplexity: 'O(n)',
    hints: [
      'Use Union-Find to manage friend groups.',
      'Before merging, check all restrictions against the tentative merge.',
      'A restriction is violated if both restricted people would share a root.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2095. Delete the Middle Node of a Linked List
  // ---------------------------------------------------------------------------
  {
    id: 2095,
    description:
      'Given the head of a linked list, delete the middle node (floor(n/2)-th node, 0-indexed) and return the modified head.',
    examples:
      'Input: head = [1,3,4,7,1,2,6]\nOutput: [1,3,4,1,2,6]\nExplanation: The middle node (index 3, value 7) is removed.',
    intuition:
      'The slow/fast pointer technique finds the middle of a linked list in one pass. By starting fast slightly ahead, slow ends up right before the middle node, making deletion a simple pointer reassignment.',
    approach:
      'Use slow and fast pointers. Fast moves 2 steps, slow moves 1 step. When fast reaches the end, slow is at the middle. Use a prev pointer to delete the middle node.',
    code: `class Solution:
    def deleteMiddle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:
            return None
        slow = head
        fast = head.next.next
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        slow.next = slow.next.next
        return head`,
    jsCode: `var deleteMiddle = function(head) {
    if (!head || !head.next) return null;
    let slow = head;
    let fast = head.next.next;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    slow.next = slow.next.next;
    return head;
};`,
    explanation:
      '1. If the list has 0 or 1 node, return None.\n' +
      '2. Initialize slow at head, fast at head.next.next.\n' +
      '3. Move slow 1 step and fast 2 steps until fast reaches the end.\n' +
      '4. Now slow is the node before the middle.\n' +
      '5. Delete the middle by setting slow.next = slow.next.next.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Use the classic slow/fast pointer technique.',
      'Start fast one step ahead so slow ends up before the middle.',
      'Handle edge cases: single node or two nodes.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2101. Detonate the Maximum Bombs
  // ---------------------------------------------------------------------------
  {
    id: 2101,
    description:
      'Given an array of bombs [x, y, r], detonating a bomb triggers all bombs within its blast radius. Those bombs trigger others in a chain reaction. Return the maximum number of bombs that can be detonated by choosing one bomb to start.',
    examples:
      'Input: bombs = [[2,1,3],[6,1,4]]\nOutput: 2\nExplanation: Detonating bomb 0 triggers bomb 1 (distance 4 <= radius 3? No, 4 > 3). Detonating bomb 1 triggers bomb 0 (distance 4 <= 4). Output: 2.',
    intuition:
      'Model this as a directed graph where bomb i has an edge to bomb j if j is within i\'s blast radius. Then the problem becomes finding the starting node that reaches the most nodes via BFS/DFS. Note the graph is directed - bomb i reaching j doesn\'t mean j reaches i.',
    approach:
      'Build a directed graph: edge from i to j if bomb i\'s radius covers bomb j. For each bomb, run BFS/DFS to count how many bombs are reachable. Return the maximum.',
    code: `from collections import deque

class Solution:
    def maximumDetonation(self, bombs: list[list[int]]) -> int:
        n = len(bombs)
        graph = [[] for _ in range(n)]
        for i in range(n):
            for j in range(n):
                if i == j:
                    continue
                dx = bombs[i][0] - bombs[j][0]
                dy = bombs[i][1] - bombs[j][1]
                if dx * dx + dy * dy <= bombs[i][2] * bombs[i][2]:
                    graph[i].append(j)
        result = 0
        for i in range(n):
            visited = set([i])
            queue = deque([i])
            while queue:
                node = queue.popleft()
                for neighbor in graph[node]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
            result = max(result, len(visited))
        return result`,
    jsCode: `var maximumDetonation = function(bombs) {
    const n = bombs.length;
    const graph = Array.from({length: n}, () => []);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) continue;
            const dx = bombs[i][0] - bombs[j][0];
            const dy = bombs[i][1] - bombs[j][1];
            if (dx * dx + dy * dy <= bombs[i][2] * bombs[i][2]) {
                graph[i].push(j);
            }
        }
    }
    let result = 0;
    for (let i = 0; i < n; i++) {
        const visited = new Set([i]);
        const queue = [i];
        let idx = 0;
        while (idx < queue.length) {
            const node = queue[idx++];
            for (const neighbor of graph[node]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        result = Math.max(result, visited.size);
    }
    return result;
};`,
    explanation:
      '1. Build a directed graph: edge i->j if distance(i,j) <= radius of bomb i.\n' +
      '2. Use squared distances to avoid floating point issues.\n' +
      '3. For each starting bomb, BFS to find all reachable bombs.\n' +
      '4. Track the maximum number of reachable bombs.\n' +
      '5. Note: the graph is directed (i can reach j but not vice versa).',
    timeComplexity: 'O(n^3) in worst case (n starts, n BFS each)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Build a directed graph based on blast radii.',
      'Use squared distances to avoid floating point.',
      'BFS/DFS from each bomb to count chain reactions.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2104. Sum of Subarray Ranges
  // ---------------------------------------------------------------------------
  {
    id: 2104,
    description:
      'Given an integer array nums, return the sum of all subarray ranges. The range of a subarray is max - min.',
    examples:
      'Input: nums = [1,2,3]\nOutput: 4\nExplanation: Subarrays: [1]=0, [2]=0, [3]=0, [1,2]=1, [2,3]=1, [1,2,3]=2. Total=4.',
    intuition:
      'Instead of computing max-min for every subarray (O(n^2)), decompose it: the answer equals the sum of all subarray maximums minus the sum of all subarray minimums. Monotonic stacks efficiently compute each element\'s contribution as a max or min.',
    approach:
      'For each element, compute how many subarrays it is the max of and the min of using monotonic stacks. The answer is sum(nums[i] * max_count[i]) - sum(nums[i] * min_count[i]).',
    code: `class Solution:
    def subArrayRanges(self, nums: list[int]) -> int:
        n = len(nums)
        result = 0
        # Sum of subarray maximums
        stack = []
        for i in range(n + 1):
            while stack and (i == n or nums[stack[-1]] <= nums[i]):
                j = stack.pop()
                left = stack[-1] if stack else -1
                result += nums[j] * (j - left) * (i - j)
            stack.append(i)
        # Sum of subarray minimums
        stack = []
        for i in range(n + 1):
            while stack and (i == n or nums[stack[-1]] >= nums[i]):
                j = stack.pop()
                left = stack[-1] if stack else -1
                result -= nums[j] * (j - left) * (i - j)
            stack.append(i)
        return result`,
    jsCode: `var subArrayRanges = function(nums) {
    const n = nums.length;
    let result = 0;
    // Sum of subarray maximums
    let stack = [];
    for (let i = 0; i <= n; i++) {
        while (stack.length && (i === n || nums[stack[stack.length - 1]] <= nums[i])) {
            const j = stack.pop();
            const left = stack.length ? stack[stack.length - 1] : -1;
            result += nums[j] * (j - left) * (i - j);
        }
        stack.push(i);
    }
    // Sum of subarray minimums
    stack = [];
    for (let i = 0; i <= n; i++) {
        while (stack.length && (i === n || nums[stack[stack.length - 1]] >= nums[i])) {
            const j = stack.pop();
            const left = stack.length ? stack[stack.length - 1] : -1;
            result -= nums[j] * (j - left) * (i - j);
        }
        stack.push(i);
    }
    return result;
};`,
    explanation:
      '1. Range sum = sum of subarray maximums - sum of subarray minimums.\n' +
      '2. Use monotonic stack to find for each element how many subarrays it\'s the max.\n' +
      '3. Similarly find how many subarrays each element is the min.\n' +
      '4. For element j, count = (j - left_boundary) * (right_boundary - j).\n' +
      '5. Combine: result = sum(max contributions) - sum(min contributions).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Range sum = sum of maximums - sum of minimums across all subarrays.',
      'Use monotonic stacks to efficiently compute each element\'s contribution.',
      'For each element, count how many subarrays it is the max/min of.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2108. Find First Palindromic String in the Array
  // ---------------------------------------------------------------------------
  {
    id: 2108,
    description:
      'Given an array of strings words, return the first palindromic string. If none exists, return an empty string.',
    examples:
      'Input: words = ["abc","car","ada","racecar","cool"]\nOutput: "ada"',
    intuition:
      'Simply iterate through the array and check if each string reads the same forwards and backwards. Return the first palindrome you find - no need for complex algorithms.',
    approach:
      'Iterate through the array and check if each string equals its reverse. Return the first one found.',
    code: `class Solution:
    def firstPalindrome(self, words: list[str]) -> str:
        for word in words:
            if word == word[::-1]:
                return word
        return ""`,
    jsCode: `var firstPalindrome = function(words) {
    for (const word of words) {
        if (word === word.split('').reverse().join('')) {
            return word;
        }
    }
    return "";
};`,
    explanation:
      '1. Iterate through each word in the array.\n' +
      '2. Check if the word is a palindrome (equals its reverse).\n' +
      '3. Return the first palindrome found.\n' +
      '4. If no palindrome exists, return empty string.',
    timeComplexity: 'O(n * m) where n = words count, m = max word length',
    spaceComplexity: 'O(m) for the reversed string',
    hints: [
      'A palindrome reads the same forwards and backwards.',
      'Python slicing s[::-1] reverses a string easily.',
      'Return the first match found.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2114. Maximum Number of Words Found in Sentences
  // ---------------------------------------------------------------------------
  {
    id: 2114,
    description:
      'Given an array of sentences, return the maximum number of words in a single sentence. Words are separated by single spaces.',
    examples:
      'Input: sentences = ["alice and bob love leetcode", "i think so too", "this is great thanks very much"]\nOutput: 6',
    intuition:
      'The number of words in a sentence equals the number of spaces plus one. Count spaces in each sentence and return the maximum count plus one.',
    approach:
      'For each sentence, count the number of words by splitting on spaces (or counting spaces + 1). Return the maximum count.',
    code: `class Solution:
    def mostWordsFound(self, sentences: list[str]) -> int:
        return max(s.count(' ') + 1 for s in sentences)`,
    jsCode: `var mostWordsFound = function(sentences) {
    let max = 0;
    for (const s of sentences) {
        const count = s.split(' ').length;
        if (count > max) max = count;
    }
    return max;
};`,
    explanation:
      '1. The number of words in a sentence = number of spaces + 1.\n' +
      '2. Count spaces in each sentence using str.count.\n' +
      '3. Return the maximum word count across all sentences.',
    timeComplexity: 'O(n * m) where n = sentences, m = max sentence length',
    spaceComplexity: 'O(1)',
    hints: [
      'Words are separated by single spaces.',
      'Number of words = number of spaces + 1.',
      'Use Python\'s count method for efficiency.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2125. Number of Laser Beams in a Bank
  // ---------------------------------------------------------------------------
  {
    id: 2125,
    description:
      'Given a binary matrix bank representing a floor plan where "1" is a security device, laser beams go between every pair of devices on consecutive rows containing devices (skipping empty rows). Return the total number of laser beams.',
    examples:
      'Input: bank = ["011001","000000","010100","001000"]\nOutput: 8',
    intuition:
      'Laser beams connect every device on one row to every device on the next non-empty row, giving a product of their counts. Skip empty rows and multiply consecutive non-empty row counts.',
    approach:
      'Count devices in each row. For consecutive non-empty rows, the number of beams is the product of their device counts. Sum all such products.',
    code: `class Solution:
    def numberOfBeams(self, bank: list[str]) -> int:
        prev = 0
        total = 0
        for row in bank:
            count = row.count('1')
            if count > 0:
                total += prev * count
                prev = count
        return total`,
    jsCode: `var numberOfBeams = function(bank) {
    let prev = 0, total = 0;
    for (const row of bank) {
        let count = 0;
        for (const c of row) if (c === '1') count++;
        if (count > 0) {
            total += prev * count;
            prev = count;
        }
    }
    return total;
};`,
    explanation:
      '1. Track the device count of the previous non-empty row (prev).\n' +
      '2. For each row, count the number of "1"s.\n' +
      '3. If the row has devices, add prev * count beams and update prev.\n' +
      '4. Skip rows with no devices (they don\'t affect beams).\n' +
      '5. Return the total beam count.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Empty rows are skipped — beams connect adjacent non-empty rows.',
      'Beams between two rows = product of their device counts.',
      'Track the previous non-empty row\'s device count.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2130. Maximum Twin Sum of a Linked List
  // ---------------------------------------------------------------------------
  {
    id: 2130,
    description:
      'In a linked list of even length n, the twin of node i is node (n-1-i). Return the maximum twin sum (node i value + its twin value).',
    examples:
      'Input: head = [5,4,2,1]\nOutput: 6\nExplanation: Twins are (5,1) and (4,2). Max twin sum = 6.',
    intuition:
      'Reverse the second half of the linked list so that twin pairs (i and n-1-i) are aligned for easy comparison. Then walk both halves simultaneously, tracking the maximum twin sum.',
    approach:
      'Use slow/fast pointers to find the middle. Reverse the second half. Then iterate both halves simultaneously, computing twin sums and tracking the maximum.',
    code: `class Solution:
    def pairSum(self, head: Optional[ListNode]) -> int:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        prev = None
        while slow:
            nxt = slow.next
            slow.next = prev
            prev = slow
            slow = nxt
        max_sum = 0
        first, second = head, prev
        while second:
            max_sum = max(max_sum, first.val + second.val)
            first = first.next
            second = second.next
        return max_sum`,
    jsCode: `var pairSum = function(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    let prev = null;
    while (slow) {
        const nxt = slow.next;
        slow.next = prev;
        prev = slow;
        slow = nxt;
    }
    let maxSum = 0;
    let first = head, second = prev;
    while (second) {
        maxSum = Math.max(maxSum, first.val + second.val);
        first = first.next;
        second = second.next;
    }
    return maxSum;
};`,
    explanation:
      '1. Use slow/fast pointers to find the start of the second half.\n' +
      '2. Reverse the second half of the linked list.\n' +
      '3. Iterate from both ends: first from head, second from reversed tail.\n' +
      '4. Compute twin sums and track the maximum.\n' +
      '5. This approach uses O(1) extra space.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Find the middle of the list using slow/fast pointers.',
      'Reverse the second half to pair twins easily.',
      'Iterate both halves simultaneously to compute twin sums.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2140. Solving Questions With Brainpower
  // ---------------------------------------------------------------------------
  {
    id: 2140,
    description:
      'Given a 0-indexed 2D array questions where questions[i] = [points, brainpower], if you solve question i you earn points but must skip the next brainpower questions. Return the maximum points you can earn.',
    examples:
      'Input: questions = [[3,2],[4,3],[4,4],[2,5]]\nOutput: 5\nExplanation: Solve question 0 (3 pts, skip 2), then question 3 (2 pts). Total = 5.',
    intuition:
      'This is a classic take-or-skip DP problem. Working from right to left, at each question you either skip it (keeping the best from the next question) or solve it (earning points but jumping ahead by brainpower). The DP naturally captures the optimal choice at each step.',
    approach:
      'Use DP from right to left. dp[i] = max points starting from question i. Either skip i (dp[i] = dp[i+1]) or solve i (points[i] + dp[i + brainpower[i] + 1]).',
    code: `class Solution:
    def mostPoints(self, questions: list[list[int]]) -> int:
        n = len(questions)
        dp = [0] * (n + 1)
        for i in range(n - 1, -1, -1):
            points, bp = questions[i]
            nxt = i + bp + 1
            solve = points + (dp[nxt] if nxt < n else 0)
            dp[i] = max(dp[i + 1], solve)
        return dp[0]`,
    jsCode: `var mostPoints = function(questions) {
    const n = questions.length;
    const dp = new Array(n + 1).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        const [points, bp] = questions[i];
        const nxt = i + bp + 1;
        const solve = points + (nxt < n ? dp[nxt] : 0);
        dp[i] = Math.max(dp[i + 1], solve);
    }
    return dp[0];
};`,
    explanation:
      '1. dp[i] represents the maximum points achievable from question i onward.\n' +
      '2. Base case: dp[n] = 0 (no more questions).\n' +
      '3. For each i (right to left): skip (dp[i+1]) or solve (points + dp[i+bp+1]).\n' +
      '4. dp[i] = max of skip and solve.\n' +
      '5. Answer is dp[0].',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Think of this as a scheduling problem: solve or skip each question.',
      'DP from right to left avoids forward dependencies.',
      'If you solve question i, the next available question is i + brainpower + 1.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2149. Rearrange Array Elements by Sign
  // ---------------------------------------------------------------------------
  {
    id: 2149,
    description:
      'Given an array nums of equal number of positive and negative integers, rearrange so that every consecutive pair of integers have opposite signs. The first element must be positive. Preserve relative order within positives and negatives.',
    examples:
      'Input: nums = [3,1,-2,-5,2,-4]\nOutput: [3,-2,1,-5,2,-4]',
    intuition:
      'Separate positive and negative numbers while preserving their relative order, then interleave them: positives at even indices, negatives at odd indices. The problem guarantees equal counts, so this always works.',
    approach:
      'Separate into positives and negatives (preserving order), then interleave them: positive at even indices, negative at odd indices.',
    code: `class Solution:
    def rearrangeArray(self, nums: list[int]) -> list[int]:
        pos = [x for x in nums if x > 0]
        neg = [x for x in nums if x < 0]
        result = [0] * len(nums)
        for i in range(len(pos)):
            result[2 * i] = pos[i]
            result[2 * i + 1] = neg[i]
        return result`,
    jsCode: `var rearrangeArray = function(nums) {
    const pos = nums.filter(x => x > 0);
    const neg = nums.filter(x => x < 0);
    const result = new Array(nums.length);
    for (let i = 0; i < pos.length; i++) {
        result[2 * i] = pos[i];
        result[2 * i + 1] = neg[i];
    }
    return result;
};`,
    explanation:
      '1. Separate positive and negative numbers, preserving their relative order.\n' +
      '2. Place positives at even indices (0, 2, 4, ...) and negatives at odd indices (1, 3, 5, ...).\n' +
      '3. Since counts are equal, both lists have the same length.\n' +
      '4. Return the interleaved result.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Separate positives and negatives first.',
      'Interleave them: positive at even indices, negative at odd indices.',
      'The problem guarantees equal counts of positives and negatives.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2179. Count Good Triplets in an Array
  // ---------------------------------------------------------------------------
  {
    id: 2179,
    description:
      'Given two permutations nums1 and nums2 of [0, n-1], count the number of good triplets. A triplet (x, y, z) is good if the relative order of x, y, z is the same in both arrays (pos in nums1 and nums2 are both increasing).',
    examples:
      'Input: nums1 = [2,0,1,3], nums2 = [0,1,2,3]\nOutput: 1\nExplanation: The good triplet is (0, 1, 3) at positions (1,2,3) in nums1 and (0,1,3) in nums2.',
    intuition:
      'Map each value to its position in nums2, then iterate through nums1. For each element as the potential middle of a triplet, use a Fenwick tree to efficiently count how many valid elements exist on the left and right.',
    approach:
      'Map positions: for each value, record its position in nums2. Then for each position in nums1, count how many elements before it have smaller nums2-positions (left count) and how many after have larger nums2-positions. Use a BIT/Fenwick tree.',
    code: `class Solution:
    def goodTriplets(self, nums1: list[int], nums2: list[int]) -> int:
        n = len(nums1)
        pos2 = [0] * n
        for i, v in enumerate(nums2):
            pos2[v] = i
        tree = [0] * (n + 1)
        def update(i):
            i += 1
            while i <= n:
                tree[i] += 1
                i += i & (-i)
        def query(i):
            s = 0
            i += 1
            while i > 0:
                s += tree[i]
                i -= i & (-i)
            return s
        result = 0
        for i in range(n):
            p = pos2[nums1[i]]
            left = query(p)
            right = (n - 1 - p) - (i - left)
            result += left * right
            update(p)
        return result`,
    jsCode: `var goodTriplets = function(nums1, nums2) {
    const n = nums1.length;
    const pos2 = new Array(n);
    for (let i = 0; i < n; i++) pos2[nums2[i]] = i;
    const tree = new Array(n + 1).fill(0);
    function update(i) {
        i++;
        while (i <= n) { tree[i]++; i += i & (-i); }
    }
    function query(i) {
        let s = 0;
        i++;
        while (i > 0) { s += tree[i]; i -= i & (-i); }
        return s;
    }
    let result = 0;
    for (let i = 0; i < n; i++) {
        const p = pos2[nums1[i]];
        const left = query(p);
        const right = (n - 1 - p) - (i - left);
        result += left * right;
        update(p);
    }
    return result;
};`,
    explanation:
      '1. Create pos2 mapping: value -> position in nums2.\n' +
      '2. Iterate through nums1. For each element, find its position in nums2.\n' +
      '3. Use a Fenwick tree to count elements already processed with smaller nums2-positions (left).\n' +
      '4. Elements not yet processed with larger nums2-positions = (n-1-p) - (i - left) (right).\n' +
      '5. This element contributes left * right good triplets as the middle element.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Map each value to its position in nums2.',
      'For each element as the middle of a triplet, count valid left and right elements.',
      'Use a Fenwick tree for efficient prefix counting.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2181. Merge Nodes in Between Zeros
  // ---------------------------------------------------------------------------
  {
    id: 2181,
    description:
      'Given a linked list where the first and last nodes are 0, and 0s separate groups of non-zero nodes, merge each group into a single node whose value is the sum of the group. Return the modified list without the 0 nodes.',
    examples:
      'Input: head = [0,3,1,0,4,5,2,0]\nOutput: [4,11]\nExplanation: 3+1=4, 4+5+2=11.',
    intuition:
      'Zeros act as delimiters separating groups of numbers. Walk through the list summing values between consecutive zeros, and create a new node for each group sum. It\'s essentially a grouping and aggregation problem.',
    approach:
      'Traverse the list. Accumulate sums between consecutive zeros. When a zero is encountered (after the first), create a node with the accumulated sum.',
    code: `class Solution:
    def mergeNodes(self, head: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0)
        tail = dummy
        cur = head.next
        total = 0
        while cur:
            if cur.val == 0:
                tail.next = ListNode(total)
                tail = tail.next
                total = 0
            else:
                total += cur.val
            cur = cur.next
        return dummy.next`,
    jsCode: `var mergeNodes = function(head) {
    const dummy = new ListNode(0);
    let tail = dummy;
    let cur = head.next;
    let total = 0;
    while (cur) {
        if (cur.val === 0) {
            tail.next = new ListNode(total);
            tail = tail.next;
            total = 0;
        } else {
            total += cur.val;
        }
        cur = cur.next;
    }
    return dummy.next;
};`,
    explanation:
      '1. Skip the first zero node. Start accumulating from head.next.\n' +
      '2. Add non-zero values to a running total.\n' +
      '3. When a zero is hit, create a new node with the total and reset.\n' +
      '4. Link new nodes together using a dummy head.\n' +
      '5. Return dummy.next.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) extra (reusing nodes possible)',
    hints: [
      'Zeros act as delimiters between groups.',
      'Accumulate the sum between consecutive zeros.',
      'Create a new node for each group sum.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2187. Minimum Time to Complete Trips
  // ---------------------------------------------------------------------------
  {
    id: 2187,
    description:
      'Given an array time where time[i] is the time for bus i to complete one trip, return the minimum time needed for all buses together to complete at least totalTrips trips.',
    examples:
      'Input: time = [1,2,3], totalTrips = 5\nOutput: 3\nExplanation: At t=3, bus 0 does 3 trips, bus 1 does 1, bus 2 does 1. Total = 5.',
    intuition:
      'Binary search on time is the key insight. For a given time t, each bus completes floor(t/time[i]) trips. If the total trips are enough, try less time; otherwise try more. The monotonic relationship makes binary search work perfectly.',
    approach:
      'Binary search on the answer (time t). For a given t, the total trips = sum(t // time[i]). Find the minimum t where total >= totalTrips.',
    code: `class Solution:
    def minimumTime(self, time: list[int], totalTrips: int) -> int:
        lo, hi = 1, min(time) * totalTrips
        while lo < hi:
            mid = (lo + hi) // 2
            trips = sum(mid // t for t in time)
            if trips >= totalTrips:
                hi = mid
            else:
                lo = mid + 1
        return lo`,
    jsCode: `var minimumTime = function(time, totalTrips) {
    let lo = 1n, hi = BigInt(Math.min(...time)) * BigInt(totalTrips);
    while (lo < hi) {
        const mid = (lo + hi) / 2n;
        let trips = 0n;
        for (const t of time) trips += mid / BigInt(t);
        if (trips >= BigInt(totalTrips)) hi = mid;
        else lo = mid + 1n;
    }
    return Number(lo);
};`,
    explanation:
      '1. Binary search on time t from 1 to min(time) * totalTrips.\n' +
      '2. For a given t, each bus i completes t // time[i] trips.\n' +
      '3. Sum all trips. If >= totalTrips, try smaller t.\n' +
      '4. Otherwise try larger t.\n' +
      '5. Return the minimum valid t.',
    timeComplexity: 'O(n * log(min_time * totalTrips))',
    spaceComplexity: 'O(1)',
    hints: [
      'Binary search on the total time.',
      'For a given time t, each bus completes floor(t / time[i]) trips.',
      'The upper bound is min(time) * totalTrips.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2191. Sort the Jumbled Numbers
  // ---------------------------------------------------------------------------
  {
    id: 2191,
    description:
      'Given a mapping of digits 0-9 and an array nums, sort nums by their mapped values. The mapping replaces each digit. Preserve relative order for equal mapped values.',
    examples:
      'Input: mapping = [8,9,4,0,2,1,3,5,7,6], nums = [991,338,38]\nOutput: [338,38,991]',
    intuition:
      'Map each digit through the mapping to get the \'mapped value\' of each number, then sort by these mapped values. Use a stable sort to preserve relative order when mapped values are equal.',
    approach:
      'For each number, compute its mapped value by replacing each digit. Sort nums by their mapped values using a stable sort.',
    code: `class Solution:
    def sortJumbled(self, mapping: list[int], nums: list[int]) -> list[int]:
        def mapped_value(n: int) -> int:
            if n == 0:
                return mapping[0]
            result = 0
            place = 1
            while n > 0:
                result += mapping[n % 10] * place
                n //= 10
                place *= 10
            return result
        return sorted(nums, key=mapped_value)`,
    jsCode: `var sortJumbled = function(mapping, nums) {
    function mappedValue(n) {
        if (n === 0) return mapping[0];
        let result = 0, place = 1;
        while (n > 0) {
            result += mapping[n % 10] * place;
            n = Math.floor(n / 10);
            place *= 10;
        }
        return result;
    }
    return nums.map((num, i) => [mappedValue(num), i, num])
        .sort((a, b) => a[0] - b[0] || a[1] - b[1])
        .map(x => x[2]);
};`,
    explanation:
      '1. For each number, convert each digit using the mapping.\n' +
      '2. Build the mapped value digit by digit from right to left.\n' +
      '3. Handle the special case of 0.\n' +
      '4. Sort nums using the mapped values as the sort key.\n' +
      '5. Python\'s sort is stable, preserving relative order for equal keys.',
    timeComplexity: 'O(n * d * log n) where d is max digits per number',
    spaceComplexity: 'O(n)',
    hints: [
      'Compute the mapped value by replacing each digit.',
      'Use the mapped value as the sort key.',
      'Python sort is stable, which handles ties correctly.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2196. Create Binary Tree From Descriptions
  // ---------------------------------------------------------------------------
  {
    id: 2196,
    description:
      'Given descriptions where each element is [parent, child, isLeft], construct the binary tree and return its root. isLeft=1 means child is the left child of parent.',
    examples:
      'Input: descriptions = [[20,15,1],[20,17,0],[50,20,1],[50,80,0],[80,19,1]]\nOutput: [50,20,80,15,17,19]',
    intuition:
      'Build tree nodes in a hash map so you can connect parents to children in any order. The root is identified as the only node that never appears as a child in any description.',
    approach:
      'Create tree nodes in a hash map. Track all children. The root is the node that is never a child.',
    code: `class Solution:
    def createBinaryTree(self, descriptions: list[list[int]]) -> Optional[TreeNode]:
        nodes = {}
        children = set()
        for parent, child, isLeft in descriptions:
            if parent not in nodes:
                nodes[parent] = TreeNode(parent)
            if child not in nodes:
                nodes[child] = TreeNode(child)
            if isLeft:
                nodes[parent].left = nodes[child]
            else:
                nodes[parent].right = nodes[child]
            children.add(child)
        for val in nodes:
            if val not in children:
                return nodes[val]`,
    jsCode: `var createBinaryTree = function(descriptions) {
    const nodes = new Map();
    const children = new Set();
    for (const [parent, child, isLeft] of descriptions) {
        if (!nodes.has(parent)) nodes.set(parent, new TreeNode(parent));
        if (!nodes.has(child)) nodes.set(child, new TreeNode(child));
        if (isLeft) nodes.get(parent).left = nodes.get(child);
        else nodes.get(parent).right = nodes.get(child);
        children.add(child);
    }
    for (const [val, node] of nodes) {
        if (!children.has(val)) return node;
    }
};`,
    explanation:
      '1. Create TreeNode objects in a hash map keyed by value.\n' +
      '2. For each description, set the parent-child relationship.\n' +
      '3. Track all values that appear as children.\n' +
      '4. The root is the only value that is a parent but never a child.\n' +
      '5. Return that node.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a dictionary to create and look up nodes by value.',
      'Track which nodes are children.',
      'The root is the node that never appears as a child.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2215. Find the Difference of Two Arrays
  // ---------------------------------------------------------------------------
  {
    id: 2215,
    description:
      'Given two integer arrays nums1 and nums2, return a list of two lists: elements in nums1 not in nums2, and elements in nums2 not in nums1.',
    examples:
      'Input: nums1 = [1,2,3], nums2 = [2,4,6]\nOutput: [[1,3],[4,6]]',
    intuition:
      'Convert both arrays to sets and compute the set difference in each direction. Set subtraction gives you elements in one set but not the other, which is exactly what the problem asks for.',
    approach:
      'Convert both arrays to sets. The differences are set1 - set2 and set2 - set1.',
    code: `class Solution:
    def findDifference(self, nums1: list[int], nums2: list[int]) -> list[list[int]]:
        s1, s2 = set(nums1), set(nums2)
        return [list(s1 - s2), list(s2 - s1)]`,
    jsCode: `var findDifference = function(nums1, nums2) {
    const s1 = new Set(nums1), s2 = new Set(nums2);
    return [
        [...s1].filter(x => !s2.has(x)),
        [...s2].filter(x => !s1.has(x))
    ];
};`,
    explanation:
      '1. Convert both arrays to sets to remove duplicates.\n' +
      '2. s1 - s2 gives elements in nums1 but not nums2.\n' +
      '3. s2 - s1 gives elements in nums2 but not nums1.\n' +
      '4. Convert results to lists and return.',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(n + m)',
    hints: [
      'Use sets for efficient difference operations.',
      'Set difference gives elements in one set but not the other.',
      'Convert the results to lists.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2218. Maximum Value of K Coins From Piles
  // ---------------------------------------------------------------------------
  {
    id: 2218,
    description:
      'There are n piles of coins. From each pile, you can only take coins from the top. Choose exactly k coins in total to maximize the sum.',
    examples:
      'Input: piles = [[1,100,3],[7,8,9]], k = 2\nOutput: 101\nExplanation: Take 1 from pile 0, then 100 from pile 0. Total = 101.',
    intuition:
      'This is a knapsack problem where each pile offers multiple items (top 1, top 2, ... coins). Precompute prefix sums for each pile, then use DP to find the optimal allocation of k coins across all piles.',
    approach:
      'Use 2D DP. dp[i][j] = max value using first i piles and j coins. For each pile, try taking 0 to min(pile_size, j) coins from the top.',
    code: `class Solution:
    def maxValueOfCoins(self, piles: list[list[int]], k: int) -> int:
        n = len(piles)
        dp = [0] * (k + 1)
        for pile in piles:
            prefix = [0]
            for coin in pile:
                prefix.append(prefix[-1] + coin)
            new_dp = [0] * (k + 1)
            for j in range(k + 1):
                for t in range(min(len(pile), j) + 1):
                    new_dp[j] = max(new_dp[j], dp[j - t] + prefix[t])
            dp = new_dp
        return dp[k]`,
    jsCode: `var maxValueOfCoins = function(piles, k) {
    let dp = new Array(k + 1).fill(0);
    for (const pile of piles) {
        const prefix = [0];
        for (const coin of pile) prefix.push(prefix[prefix.length - 1] + coin);
        const newDp = new Array(k + 1).fill(0);
        for (let j = 0; j <= k; j++) {
            for (let t = 0; t <= Math.min(pile.length, j); t++) {
                newDp[j] = Math.max(newDp[j], dp[j - t] + prefix[t]);
            }
        }
        dp = newDp;
    }
    return dp[k];
};`,
    explanation:
      '1. Use 1D DP with rolling array: dp[j] = max value using j coins from piles processed so far.\n' +
      '2. For each pile, compute prefix sums of top-t coins.\n' +
      '3. For each budget j, try taking t coins (0 to min(pile_size, j)) from this pile.\n' +
      '4. new_dp[j] = max(dp[j - t] + prefix[t]) over all valid t.\n' +
      '5. Return dp[k] after processing all piles.',
    timeComplexity: 'O(n * k * max_pile_size)',
    spaceComplexity: 'O(k)',
    hints: [
      'This is a knapsack-like problem where each pile offers multiple "items."',
      'Precompute prefix sums for each pile.',
      'DP over piles, trying 0 to min(pile_size, remaining budget) coins per pile.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2226. Maximum Candies Allocated to K Children
  // ---------------------------------------------------------------------------
  {
    id: 2226,
    description:
      'Given an array candies where candies[i] is the number of candies in pile i and an integer k children, distribute candies such that each child gets the same number. Each pile can be split but not merged. Maximize the number of candies each child gets.',
    examples:
      'Input: candies = [5,8,6], k = 3\nOutput: 5\nExplanation: Split into piles of 5, [5,3], [5,1]. Each of 3 children gets 5.',
    intuition:
      'Binary search on the answer: if each child gets x candies, each pile of size c can serve floor(c/x) children. Find the largest x where the total children served is at least k.',
    approach:
      'Binary search on the answer (candies per child). For a given amount x, check if sum(pile // x) >= k.',
    code: `class Solution:
    def maximumCandies(self, candies: list[int], k: int) -> int:
        lo, hi = 0, max(candies)
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if sum(c // mid for c in candies) >= k:
                lo = mid
            else:
                hi = mid - 1
        return lo`,
    jsCode: `var maximumCandies = function(candies, k) {
    let lo = 0, hi = Math.max(...candies);
    while (lo < hi) {
        const mid = Math.floor((lo + hi + 1) / 2);
        let total = 0;
        for (const c of candies) total += Math.floor(c / mid);
        if (total >= k) lo = mid;
        else hi = mid - 1;
    }
    return lo;
};`,
    explanation:
      '1. Binary search on x = candies per child, from 0 to max(candies).\n' +
      '2. For a given x, each pile contributes floor(pile / x) children.\n' +
      '3. If the total >= k, x is feasible — try larger.\n' +
      '4. Otherwise try smaller.\n' +
      '5. Return the maximum feasible x.',
    timeComplexity: 'O(n * log(max_candies))',
    spaceComplexity: 'O(1)',
    hints: [
      'Binary search on the number of candies per child.',
      'For each candidate, count how many children can be served.',
      'Use upper binary search to find the maximum feasible value.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2235. Add Two Integers
  // ---------------------------------------------------------------------------
  {
    id: 2235,
    description:
      'Given two integers num1 and num2, return the sum of the two integers.',
    examples:
      'Input: num1 = 12, num2 = 5\nOutput: 17',
    intuition:
      'Return num1 + num2. This is the simplest possible problem - just use the addition operator.',
    approach:
      'Simply return num1 + num2.',
    code: `class Solution:
    def sum(self, num1: int, num2: int) -> int:
        return num1 + num2`,
    jsCode: `var sum = function(num1, num2) {
    return num1 + num2;
};`,
    explanation:
      '1. Return the sum of num1 and num2.\n' +
      '2. This is a straightforward addition operation.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    hints: [
      'Use the + operator.',
      'No edge cases to handle.',
      'This is as simple as it gets.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2244. Minimum Rounds to Complete All Tasks
  // ---------------------------------------------------------------------------
  {
    id: 2244,
    description:
      'Given an array of task difficulty levels, each round you complete 2 or 3 tasks of the same difficulty. Return the minimum number of rounds to complete all tasks, or -1 if impossible.',
    examples:
      'Input: tasks = [2,2,3,3,2,4,4,4,4,4]\nOutput: 4\nExplanation: 3 tasks of 2 (1 round), 2 tasks of 3 (1 round), 5 tasks of 4 (2 rounds: 3+2). Total = 4.',
    intuition:
      'Group tasks by difficulty and count frequencies. A frequency of 1 is impossible (you need at least 2 per round). For any frequency f >= 2, ceil(f/3) rounds is optimal because you prefer groups of 3 to minimize rounds.',
    approach:
      'Count frequency of each difficulty. If any frequency is 1, return -1. For frequency f: minimum rounds = ceil(f / 3).',
    code: `from collections import Counter
import math

class Solution:
    def minimumRounds(self, tasks: list[int]) -> int:
        count = Counter(tasks)
        rounds = 0
        for freq in count.values():
            if freq == 1:
                return -1
            rounds += math.ceil(freq / 3)
        return rounds`,
    jsCode: `var minimumRounds = function(tasks) {
    const count = new Map();
    for (const t of tasks) count.set(t, (count.get(t) || 0) + 1);
    let rounds = 0;
    for (const freq of count.values()) {
        if (freq === 1) return -1;
        rounds += Math.ceil(freq / 3);
    }
    return rounds;
};`,
    explanation:
      '1. Count the frequency of each task difficulty.\n' +
      '2. If any frequency is 1, it cannot be completed (need at least 2).\n' +
      '3. For each frequency f, the minimum rounds is ceil(f / 3).\n' +
      '4. This works because: f=2 -> 1 round, f=3 -> 1, f=4 -> 2 (2+2), f=5 -> 2 (3+2), etc.\n' +
      '5. Sum up all rounds.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Group tasks by difficulty and count frequencies.',
      'A frequency of 1 is impossible.',
      'For any frequency >= 2, ceil(f/3) rounds suffice.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2257. Count Unguarded Cells in the Grid
  // ---------------------------------------------------------------------------
  {
    id: 2257,
    description:
      'Given an m x n grid, some cells have guards and some have walls. Guards can see in 4 directions until blocked by a wall or another guard. Return the number of unguarded, unoccupied cells.',
    examples:
      'Input: m = 4, n = 6, guards = [[0,0],[1,1],[2,3]], walls = [[0,1],[2,2],[1,4]]\nOutput: 7',
    intuition:
      'Simulate guard vision by casting rays in 4 directions from each guard. A ray stops when it hits a wall or another guard. After marking all guarded cells, count the cells that remain unguarded.',
    approach:
      'Mark guard and wall positions. For each guard, expand in 4 directions marking cells as guarded until hitting a wall, guard, or boundary. Count unmarked cells.',
    code: `class Solution:
    def countUnguarded(self, m: int, n: int, guards: list[list[int]], walls: list[list[int]]) -> int:
        grid = [[0] * n for _ in range(m)]
        for r, c in guards:
            grid[r][c] = 1  # guard
        for r, c in walls:
            grid[r][c] = 2  # wall
        for r, c in guards:
            for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                nr, nc = r + dr, c + dc
                while 0 <= nr < m and 0 <= nc < n and grid[nr][nc] not in (1, 2):
                    grid[nr][nc] = 3  # guarded
                    nr += dr
                    nc += dc
        return sum(1 for r in range(m) for c in range(n) if grid[r][c] == 0)`,
    jsCode: `var countUnguarded = function(m, n, guards, walls) {
    const grid = Array.from({length: m}, () => new Array(n).fill(0));
    for (const [r, c] of guards) grid[r][c] = 1;
    for (const [r, c] of walls) grid[r][c] = 2;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    for (const [r, c] of guards) {
        for (const [dr, dc] of dirs) {
            let nr = r + dr, nc = c + dc;
            while (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] !== 1 && grid[nr][nc] !== 2) {
                grid[nr][nc] = 3;
                nr += dr;
                nc += dc;
            }
        }
    }
    let count = 0;
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++)
            if (grid[r][c] === 0) count++;
    return count;
};`,
    explanation:
      '1. Mark guards (1) and walls (2) on the grid.\n' +
      '2. For each guard, cast rays in 4 directions.\n' +
      '3. Mark cells as guarded (3) until hitting a wall, guard, or boundary.\n' +
      '4. Count cells still marked 0 (unguarded and unoccupied).\n' +
      '5. Each cell is visited at most 4 times (once per direction).',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n)',
    hints: [
      'Simulate guard vision by expanding in 4 directions.',
      'Stop when hitting a wall or another guard.',
      'Count cells that are neither guarded, guard, nor wall.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2275. Largest Combination With Bitwise AND Greater Than Zero
  // ---------------------------------------------------------------------------
  {
    id: 2275,
    description:
      'Given an array of positive integers candidates, find the largest combination (subset) such that the bitwise AND of all elements is greater than 0. Return the size of that largest combination.',
    examples:
      'Input: candidates = [16,17,71,62,12,24,14]\nOutput: 4',
    intuition:
      'For a bitwise AND to be greater than zero, all selected numbers must share at least one common \'1\' bit. Check each bit position independently - the largest group sharing any single bit is the answer.',
    approach:
      'For the AND to be > 0, all elements must share at least one common bit. For each bit position, count how many numbers have that bit set. The answer is the maximum count across all bit positions.',
    code: `class Solution:
    def largestCombination(self, candidates: list[int]) -> int:
        result = 0
        for bit in range(24):
            count = sum(1 for c in candidates if c & (1 << bit))
            result = max(result, count)
        return result`,
    jsCode: `var largestCombination = function(candidates) {
    let result = 0;
    for (let bit = 0; bit < 24; bit++) {
        let count = 0;
        for (const c of candidates) {
            if (c & (1 << bit)) count++;
        }
        result = Math.max(result, count);
    }
    return result;
};`,
    explanation:
      '1. For the AND to be non-zero, all elements must share at least one "1" bit.\n' +
      '2. Check each bit position (0 to 23, since max value is ~10^7 < 2^24).\n' +
      '3. Count how many candidates have a 1 at that bit position.\n' +
      '4. The answer is the maximum count across all bit positions.\n' +
      '5. Each such group has AND > 0 (they all share that bit).',
    timeComplexity: 'O(n * 24) = O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'If all numbers share a common bit, their AND is non-zero.',
      'Check each bit position independently.',
      'The answer is the maximum count of numbers sharing any single bit.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2300. Successful Pairs of Spells and Potions
  // ---------------------------------------------------------------------------
  {
    id: 2300,
    description:
      'Given arrays spells and potions and a threshold success, a pair (i, j) is successful if spells[i] * potions[j] >= success. For each spell, return the number of successful pairs.',
    examples:
      'Input: spells = [5,1,3], potions = [1,2,3,4,5], success = 7\nOutput: [4,0,3]',
    intuition:
      'Sort potions once, then for each spell, binary search for the minimum potion strength needed. Since spell * potion >= success means potion >= success/spell, all potions from that threshold onward are valid.',
    approach:
      'Sort potions. For each spell, binary search for the minimum potion value needed: ceil(success / spell). Count potions >= that value.',
    code: `import bisect
import math

class Solution:
    def successfulPairs(self, spells: list[int], potions: list[int], success: int) -> list[int]:
        potions.sort()
        n = len(potions)
        result = []
        for spell in spells:
            min_potion = math.ceil(success / spell)
            idx = bisect.bisect_left(potions, min_potion)
            result.append(n - idx)
        return result`,
    jsCode: `var successfulPairs = function(spells, potions, success) {
    potions.sort((a, b) => a - b);
    const n = potions.length;
    function bisectLeft(arr, target) {
        let lo = 0, hi = arr.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (arr[mid] < target) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
    return spells.map(spell => {
        const minPotion = Math.ceil(success / spell);
        return n - bisectLeft(potions, minPotion);
    });
};`,
    explanation:
      '1. Sort potions in ascending order.\n' +
      '2. For each spell, compute minimum potion needed = ceil(success / spell).\n' +
      '3. Binary search for the leftmost potion >= min_potion.\n' +
      '4. All potions from that index to the end are valid.\n' +
      '5. Count = n - index.',
    timeComplexity: 'O((m + n) log m) where m = potions, n = spells',
    spaceComplexity: 'O(n)',
    hints: [
      'Sort potions and binary search for each spell.',
      'For spell s, minimum potion = ceil(success / s).',
      'Count how many potions meet or exceed the minimum.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2305. Fair Distribution of Cookies
  // ---------------------------------------------------------------------------
  {
    id: 2305,
    description:
      'Distribute n bags of cookies among k children. Each bag goes to exactly one child. Minimize the maximum total cookies any single child receives (unfairness). Return that minimum unfairness.',
    examples:
      'Input: cookies = [8,15,10,20,8], k = 2\nOutput: 31\nExplanation: Give [8,15,8] to one child (31) and [10,20] to another (30). Max = 31.',
    intuition:
      'With at most 8 cookie bags, backtracking with pruning is efficient enough. Sort bags descending for better pruning, and skip children with identical current loads to avoid redundant search branches.',
    approach:
      'Use backtracking. Try assigning each cookie bag to each child, tracking the maximum load. Prune when the current maximum already exceeds the best answer found so far.',
    code: `class Solution:
    def distributeCookies(self, cookies: list[int], k: int) -> int:
        cookies.sort(reverse=True)
        children = [0] * k
        self.result = float('inf')

        def backtrack(idx: int):
            if idx == len(cookies):
                self.result = min(self.result, max(children))
                return
            if max(children) >= self.result:
                return
            seen = set()
            for i in range(k):
                if children[i] in seen:
                    continue
                seen.add(children[i])
                children[i] += cookies[idx]
                backtrack(idx + 1)
                children[i] -= cookies[idx]

        backtrack(0)
        return self.result`,
    jsCode: `var distributeCookies = function(cookies, k) {
    cookies.sort((a, b) => b - a);
    const children = new Array(k).fill(0);
    let result = Infinity;
    function backtrack(idx) {
        if (idx === cookies.length) {
            result = Math.min(result, Math.max(...children));
            return;
        }
        if (Math.max(...children) >= result) return;
        const seen = new Set();
        for (let i = 0; i < k; i++) {
            if (seen.has(children[i])) continue;
            seen.add(children[i]);
            children[i] += cookies[idx];
            backtrack(idx + 1);
            children[i] -= cookies[idx];
        }
    }
    backtrack(0);
    return result;
};`,
    explanation:
      '1. Sort cookies in descending order for better pruning.\n' +
      '2. Try assigning each cookie bag to each child via backtracking.\n' +
      '3. Prune if current max already exceeds best known result.\n' +
      '4. Skip duplicate states (children with same current load).\n' +
      '5. Track the minimum of all maximum child loads.',
    timeComplexity: 'O(k^n) worst case, much better with pruning',
    spaceComplexity: 'O(n + k)',
    hints: [
      'With n <= 8, backtracking with pruning is feasible.',
      'Sort cookies descending for better early pruning.',
      'Skip children with the same current load to avoid duplicate work.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2316. Count Unreachable Pairs of Nodes in an Undirected Graph
  // ---------------------------------------------------------------------------
  {
    id: 2316,
    description:
      'Given n nodes and undirected edges, count the number of pairs (i, j) where i < j and there is no path between them.',
    examples:
      'Input: n = 3, edges = [[0,1],[0,2],[1,2]]\nOutput: 0',
    intuition:
      'Find connected components using Union-Find, then count pairs between different components. For components of sizes s1, s2, ..., the unreachable pairs are all cross-component pairs, computed by accumulating s * remaining.',
    approach:
      'Find all connected components and their sizes. For each component of size s, it contributes s * (n - s) / 2 unreachable pairs (when accumulated properly).',
    code: `class Solution:
    def countPairs(self, n: int, edges: list[list[int]]) -> int:
        parent = list(range(n))
        size = [1] * n
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        def union(a, b):
            a, b = find(a), find(b)
            if a == b:
                return
            if size[a] < size[b]:
                a, b = b, a
            parent[b] = a
            size[a] += size[b]
        for u, v in edges:
            union(u, v)
        components = {}
        for i in range(n):
            r = find(i)
            components[r] = size[r]
        result = 0
        remaining = n
        for s in components.values():
            remaining -= s
            result += s * remaining
        return result`,
    jsCode: `var countPairs = function(n, edges) {
    const parent = Array.from({length: n}, (_, i) => i);
    const size = new Array(n).fill(1);
    function find(x) {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    for (const [u, v] of edges) {
        let a = find(u), b = find(v);
        if (a === b) continue;
        if (size[a] < size[b]) [a, b] = [b, a];
        parent[b] = a;
        size[a] += size[b];
    }
    const components = new Map();
    for (let i = 0; i < n; i++) {
        const r = find(i);
        components.set(r, size[r]);
    }
    let result = 0, remaining = n;
    for (const s of components.values()) {
        remaining -= s;
        result += s * remaining;
    }
    return result;
};`,
    explanation:
      '1. Use Union-Find to identify connected components.\n' +
      '2. Collect the size of each component.\n' +
      '3. For each component of size s, it can pair with (n - accumulated) nodes from other components.\n' +
      '4. Accumulate: result += s * remaining, then remaining -= s.\n' +
      '5. This counts each unreachable pair exactly once.',
    timeComplexity: 'O(n + E * alpha(n))',
    spaceComplexity: 'O(n)',
    hints: [
      'Find connected components using Union-Find or BFS.',
      'Unreachable pairs are between different components.',
      'For components of sizes s1, s2, ..., pairs = sum(si * sj) for i < j.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2336. Smallest Number in Infinite Set
  // ---------------------------------------------------------------------------
  {
    id: 2336,
    description:
      'Design a class SmallestInfiniteSet that contains all positive integers. Support popSmallest() to remove and return the smallest, and addBack(num) to add a number back if not present.',
    examples:
      'Input: ["SmallestInfiniteSet","addBack","popSmallest","popSmallest","popSmallest","addBack","popSmallest","popSmallest","popSmallest"]\n[[],[2],[],[],[],[1],[],[],[],[]]\nOutput: [null,null,1,2,3,null,1,4,5]',
    intuition:
      'Track a \'frontier\' - the smallest number that was never popped. Numbers added back below the frontier go into a min-heap. Pop from the heap first (if non-empty), otherwise advance the frontier.',
    approach:
      'Track the current smallest integer not yet popped (threshold). Use a sorted set (heap) for numbers added back that are below the threshold.',
    code: `import heapq

class SmallestInfiniteSet:
    def __init__(self):
        self.current = 1
        self.added_back = []
        self.added_set = set()

    def popSmallest(self) -> int:
        if self.added_back:
            val = heapq.heappop(self.added_back)
            self.added_set.remove(val)
            return val
        val = self.current
        self.current += 1
        return val

    def addBack(self, num: int) -> None:
        if num < self.current and num not in self.added_set:
            heapq.heappush(self.added_back, num)
            self.added_set.add(num)`,
    jsCode: `var SmallestInfiniteSet = function() {
    this.current = 1;
    this.addedBack = new MinPriorityQueue();
    this.addedSet = new Set();
};

SmallestInfiniteSet.prototype.popSmallest = function() {
    if (!this.addedBack.isEmpty()) {
        const val = this.addedBack.dequeue().element;
        this.addedSet.delete(val);
        return val;
    }
    return this.current++;
};

SmallestInfiniteSet.prototype.addBack = function(num) {
    if (num < this.current && !this.addedSet.has(num)) {
        this.addedBack.enqueue(num);
        this.addedSet.add(num);
    }
};`,
    explanation:
      '1. current tracks the smallest integer that was never popped.\n' +
      '2. added_back is a min-heap of numbers added back below current.\n' +
      '3. popSmallest: if added_back is non-empty, pop from it; otherwise return current++.\n' +
      '4. addBack: only add if num < current and not already in the set.\n' +
      '5. Use a set alongside the heap for O(1) membership checking.',
    timeComplexity: 'O(log n) per operation',
    spaceComplexity: 'O(n)',
    hints: [
      'Track the frontier of the infinite set with a counter.',
      'Use a min-heap for numbers added back below the frontier.',
      'A set prevents duplicate additions.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2348. Number of Zero-Filled Subarrays
  // ---------------------------------------------------------------------------
  {
    id: 2348,
    description:
      'Given an integer array nums, return the number of subarrays filled with 0.',
    examples:
      'Input: nums = [1,3,0,0,2,0,0,4]\nOutput: 6\nExplanation: [0] x4, [0,0] x2. Total = 6.',
    intuition:
      'Each new zero in a consecutive run adds exactly \'run_length\' new zero-filled subarrays. This is because it extends every existing subarray in the run by one position, plus creates one new single-zero subarray.',
    approach:
      'Count consecutive zeros. A run of k zeros contributes k*(k+1)/2 subarrays.',
    code: `class Solution:
    def zeroFilledSubarray(self, nums: list[int]) -> int:
        result = 0
        count = 0
        for num in nums:
            if num == 0:
                count += 1
                result += count
            else:
                count = 0
        return result`,
    jsCode: `var zeroFilledSubarray = function(nums) {
    let result = 0, count = 0;
    for (const num of nums) {
        if (num === 0) {
            count++;
            result += count;
        } else {
            count = 0;
        }
    }
    return result;
};`,
    explanation:
      '1. Track the current streak of consecutive zeros.\n' +
      '2. Each new zero extends all existing subarrays and adds one new single-zero subarray.\n' +
      '3. So each zero in a streak of length k adds k to the result.\n' +
      '4. Reset the counter when a non-zero is encountered.\n' +
      '5. This is equivalent to summing k*(k+1)/2 for each run of k zeros.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'A run of k zeros contains k*(k+1)/2 zero-filled subarrays.',
      'Incrementally add the current streak length at each zero.',
      'Reset the streak on non-zero elements.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2349. Design a Number Container System
  // ---------------------------------------------------------------------------
  {
    id: 2349,
    description:
      'Design a number container system. Support change(index, number) to set the number at index, and find(number) to return the smallest index with that number (or -1 if not found).',
    examples:
      'Input: ["NumberContainers","find","change","change","change","change","find","change","find"]\n[[],[10],[2,10],[1,10],[3,10],[5,10],[10],[1,20],[10]]\nOutput: [null,-1,null,null,null,null,1,null,2]',
    intuition:
      'Maintain two mappings: index-to-number and number-to-sorted-indices. On change, remove the index from the old number\'s set and add it to the new number\'s set. Finding the smallest index is just accessing the front of the sorted set.',
    approach:
      'Use a dict mapping index -> number and a dict mapping number -> sorted set of indices. Use a SortedList or heap with lazy deletion.',
    code: `from collections import defaultdict
from sortedcontainers import SortedList

class NumberContainers:
    def __init__(self):
        self.idx_to_num = {}
        self.num_to_idx = defaultdict(SortedList)

    def change(self, index: int, number: int) -> None:
        if index in self.idx_to_num:
            old = self.idx_to_num[index]
            self.num_to_idx[old].remove(index)
        self.idx_to_num[index] = number
        self.num_to_idx[number].add(index)

    def find(self, number: int) -> int:
        if number in self.num_to_idx and self.num_to_idx[number]:
            return self.num_to_idx[number][0]
        return -1`,
    jsCode: `var NumberContainers = function() {
    this.idxToNum = new Map();
    this.numToIdx = new Map();
};

NumberContainers.prototype.change = function(index, number) {
    if (this.idxToNum.has(index)) {
        const old = this.idxToNum.get(index);
        const set = this.numToIdx.get(old);
        set.delete(index);
    }
    this.idxToNum.set(index, number);
    if (!this.numToIdx.has(number)) this.numToIdx.set(number, new MinPriorityQueue());
    this.numToIdx.get(number).enqueue(index);
};

NumberContainers.prototype.find = function(number) {
    if (!this.numToIdx.has(number)) return -1;
    const pq = this.numToIdx.get(number);
    while (!pq.isEmpty() && this.idxToNum.get(pq.front().element) !== number) {
        pq.dequeue();
    }
    return pq.isEmpty() ? -1 : pq.front().element;
};`,
    explanation:
      '1. idx_to_num maps each index to its current number.\n' +
      '2. num_to_idx maps each number to a sorted set of indices.\n' +
      '3. On change: remove index from old number\'s set, add to new number\'s set.\n' +
      '4. On find: return the smallest index in the number\'s sorted set.\n' +
      '5. SortedList provides O(log n) add, remove, and min access.',
    timeComplexity: 'O(log n) per operation',
    spaceComplexity: 'O(n)',
    hints: [
      'Maintain a mapping from number to sorted set of indices.',
      'On change, remove the old mapping and add the new one.',
      'The smallest index is always at the front of the sorted set.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2352. Equal Row and Column Pairs
  // ---------------------------------------------------------------------------
  {
    id: 2352,
    description:
      'Given an n x n matrix grid, return the number of pairs (r, c) where row r and column c are equal (same sequence of elements).',
    examples:
      'Input: grid = [[3,2,1],[1,7,6],[2,7,7]]\nOutput: 1\nExplanation: Row 2 = [2,7,7] equals Column 1 = [2,7,7].',
    intuition:
      'Convert each row to a hashable key (tuple or string) and count how many times each row pattern appears. Then for each column, convert it to the same format and look up how many matching rows exist.',
    approach:
      'Convert each row to a tuple and count frequencies. For each column (also as tuple), add the row frequency of that tuple.',
    code: `from collections import Counter

class Solution:
    def equalPairs(self, grid: list[list[int]]) -> int:
        row_counts = Counter(tuple(row) for row in grid)
        result = 0
        n = len(grid)
        for c in range(n):
            col = tuple(grid[r][c] for r in range(n))
            result += row_counts[col]
        return result`,
    jsCode: `var equalPairs = function(grid) {
    const n = grid.length;
    const rowCounts = new Map();
    for (const row of grid) {
        const key = row.join(',');
        rowCounts.set(key, (rowCounts.get(key) || 0) + 1);
    }
    let result = 0;
    for (let c = 0; c < n; c++) {
        const col = [];
        for (let r = 0; r < n; r++) col.push(grid[r][c]);
        const key = col.join(',');
        result += rowCounts.get(key) || 0;
    }
    return result;
};`,
    explanation:
      '1. Convert each row to a tuple and count occurrences.\n' +
      '2. For each column, convert to a tuple.\n' +
      '3. Look up how many rows match this column tuple.\n' +
      '4. Sum all matches for the result.\n' +
      '5. Tuples allow hashing for O(1) lookup.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Convert rows and columns to tuples for easy comparison.',
      'Use a Counter for row frequencies.',
      'For each column, look up the matching row count.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2359. Find Closest Node to Given Two Nodes
  // ---------------------------------------------------------------------------
  {
    id: 2359,
    description:
      'Given a directed graph where each node has at most one outgoing edge (given as edges[i]), and two nodes node1 and node2, find the node that minimizes max(dist(node1, node), dist(node2, node)). If there are ties, return the smallest index.',
    examples:
      'Input: edges = [2,2,3,-1], node1 = 0, node2 = 1\nOutput: 2',
    intuition:
      'Since each node has at most one outgoing edge, just follow the path from each start node recording distances. Then for each node reachable from both, find the one that minimizes the maximum of the two distances.',
    approach:
      'BFS/DFS from node1 and node2 to compute distances to all reachable nodes. For each node reachable from both, compute max(dist1, dist2) and find the minimum.',
    code: `class Solution:
    def closestMeetingNode(self, edges: list[int], node1: int, node2: int) -> int:
        def get_dists(start):
            dist = {}
            d = 0
            while start != -1 and start not in dist:
                dist[start] = d
                d += 1
                start = edges[start]
            return dist
        dist1 = get_dists(node1)
        dist2 = get_dists(node2)
        result = -1
        best = float('inf')
        for node in range(len(edges)):
            if node in dist1 and node in dist2:
                cost = max(dist1[node], dist2[node])
                if cost < best:
                    best = cost
                    result = node
        return result`,
    jsCode: `var closestMeetingNode = function(edges, node1, node2) {
    function getDists(start) {
        const dist = new Map();
        let d = 0;
        while (start !== -1 && !dist.has(start)) {
            dist.set(start, d);
            d++;
            start = edges[start];
        }
        return dist;
    }
    const dist1 = getDists(node1);
    const dist2 = getDists(node2);
    let result = -1, best = Infinity;
    for (let node = 0; node < edges.length; node++) {
        if (dist1.has(node) && dist2.has(node)) {
            const cost = Math.max(dist1.get(node), dist2.get(node));
            if (cost < best) {
                best = cost;
                result = node;
            }
        }
    }
    return result;
};`,
    explanation:
      '1. From each start node, follow edges computing distances until a cycle or dead end.\n' +
      '2. Store distances in a dictionary.\n' +
      '3. For each node reachable from both node1 and node2, compute max(dist1, dist2).\n' +
      '4. Track the node with the smallest such maximum distance.\n' +
      '5. Iterating in order ensures we pick the smallest index on ties.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Each node has at most one outgoing edge, so paths are simple or end in a cycle.',
      'Compute distances from both start nodes independently.',
      'Find the node minimizing the maximum of the two distances.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2370. Longest Ideal Subsequence
  // ---------------------------------------------------------------------------
  {
    id: 2370,
    description:
      'Given a string s and integer k, return the length of the longest ideal subsequence where the absolute difference between consecutive characters is at most k.',
    examples:
      'Input: s = "acfgbd", k = 2\nOutput: 4\nExplanation: "acbd" — differences are 2, 1, 2, all <= 2.',
    intuition:
      'Maintain a DP array of 26 entries (one per letter). For each character in the string, look at all letters within distance k and take the best subsequence length among them. This works because the alphabet is small and fixed.',
    approach:
      'Use DP with an array of 26 entries (one per letter). For each character, the longest subsequence ending with it is 1 + max(dp[c-k..c+k]). Update dp[c].',
    code: `class Solution:
    def longestIdealString(self, s: str, k: int) -> int:
        dp = [0] * 26
        for ch in s:
            c = ord(ch) - ord('a')
            lo = max(0, c - k)
            hi = min(25, c + k)
            best = max(dp[lo:hi + 1])
            dp[c] = best + 1
        return max(dp)`,
    jsCode: `var longestIdealString = function(s, k) {
    const dp = new Array(26).fill(0);
    for (const ch of s) {
        const c = ch.charCodeAt(0) - 97;
        const lo = Math.max(0, c - k);
        const hi = Math.min(25, c + k);
        let best = 0;
        for (let j = lo; j <= hi; j++) best = Math.max(best, dp[j]);
        dp[c] = best + 1;
    }
    return Math.max(...dp);
};`,
    explanation:
      '1. dp[c] = length of longest ideal subsequence ending with character c.\n' +
      '2. For each character in s, find the best among characters within distance k.\n' +
      '3. Update dp[c] = best + 1.\n' +
      '4. The range [c-k, c+k] is clamped to [0, 25].\n' +
      '5. Return the maximum value in dp.',
    timeComplexity: 'O(n * k) but k <= 25 so effectively O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'DP with 26 entries, one per letter.',
      'For each character, look at nearby letters (within distance k).',
      'Update the DP for the current character.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2390. Removing Stars From a String
  // ---------------------------------------------------------------------------
  {
    id: 2390,
    description:
      'Given a string s with stars (*), for each star, remove the closest non-star character to its left and the star itself. Return the resulting string.',
    examples:
      'Input: s = "leet**cod*e"\nOutput: "lecoe"',
    intuition:
      'A stack perfectly models this: push regular characters, and when you see a star, pop the top character. The star removes the closest character to its left, which is exactly what a stack\'s top represents.',
    approach:
      'Use a stack. Push non-star characters. On a star, pop the top (removing the nearest left character). Join the remaining stack.',
    code: `class Solution:
    def removeStars(self, s: str) -> str:
        stack = []
        for c in s:
            if c == '*':
                stack.pop()
            else:
                stack.append(c)
        return ''.join(stack)`,
    jsCode: `var removeStars = function(s) {
    const stack = [];
    for (const c of s) {
        if (c === '*') stack.pop();
        else stack.push(c);
    }
    return stack.join('');
};`,
    explanation:
      '1. Iterate through each character.\n' +
      '2. If it is not a star, push it onto the stack.\n' +
      '3. If it is a star, pop the top element (closest non-star to the left).\n' +
      '4. The problem guarantees there is always a character to remove.\n' +
      '5. Join the stack into a string for the result.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'A star removes the nearest non-star character to its left.',
      'A stack naturally tracks the "nearest left" element.',
      'Push characters, pop on stars.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2402. Meeting Rooms III
  // ---------------------------------------------------------------------------
  {
    id: 2402,
    description:
      'Given n meeting rooms (0 to n-1) and meetings with [start, end] times, assign each meeting to the lowest-numbered available room. If no room is free, wait for the earliest one. Return the room that held the most meetings.',
    examples:
      'Input: n = 2, meetings = [[0,10],[1,5],[2,7],[3,4]]\nOutput: 0',
    intuition:
      'Use two heaps: one for available rooms (sorted by number) and one for busy rooms (sorted by end time). For each meeting, free up finished rooms, then assign the lowest-numbered available room. If none are free, wait for the earliest one to finish.',
    approach:
      'Use two heaps: one for available rooms (by room number), one for busy rooms (by end time, then room number). For each meeting (sorted by start), free up rooms that have finished, then assign.',
    code: `import heapq

class Solution:
    def mostBooked(self, n: int, meetings: list[list[int]]) -> int:
        meetings.sort()
        available = list(range(n))
        busy = []  # (end_time, room)
        count = [0] * n
        for start, end in meetings:
            while busy and busy[0][0] <= start:
                _, room = heapq.heappop(busy)
                heapq.heappush(available, room)
            if available:
                room = heapq.heappop(available)
                heapq.heappush(busy, (end, room))
            else:
                earliest_end, room = heapq.heappop(busy)
                heapq.heappush(busy, (earliest_end + end - start, room))
            count[room] += 1
        return count.index(max(count))`,
    jsCode: `var mostBooked = function(n, meetings) {
    meetings.sort((a, b) => a[0] - b[0]);
    const available = new MinPriorityQueue();
    for (let i = 0; i < n; i++) available.enqueue(i);
    const busy = new MinPriorityQueue({compare: (a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]});
    const count = new Array(n).fill(0);
    for (const [start, end] of meetings) {
        while (!busy.isEmpty() && busy.front()[0] <= start) {
            available.enqueue(busy.dequeue()[1]);
        }
        let room;
        if (!available.isEmpty()) {
            room = available.dequeue().element;
            busy.enqueue([end, room]);
        } else {
            const [earliestEnd, r] = busy.dequeue();
            room = r;
            busy.enqueue([earliestEnd + end - start, room]);
        }
        count[room]++;
    }
    let maxCount = 0, result = 0;
    for (let i = 0; i < n; i++) {
        if (count[i] > maxCount) { maxCount = count[i]; result = i; }
    }
    return result;
};`,
    explanation:
      '1. Sort meetings by start time.\n' +
      '2. Maintain heaps for available rooms (min by number) and busy rooms (min by end time).\n' +
      '3. For each meeting, free rooms whose meetings have ended.\n' +
      '4. If a room is available, assign the lowest-numbered one.\n' +
      '5. If not, wait for the earliest-ending room and extend its busy time.',
    timeComplexity: 'O(m * log n) where m = meetings',
    spaceComplexity: 'O(n + m)',
    hints: [
      'Sort meetings by start time.',
      'Use two heaps: available rooms and busy rooms.',
      'When no room is free, wait for the earliest one to finish.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2406. Divide Intervals Into Minimum Number of Groups
  // ---------------------------------------------------------------------------
  {
    id: 2406,
    description:
      'Given a 2D array intervals where intervals[i] = [left, right], divide them into groups such that no two intervals in the same group overlap. Return the minimum number of groups.',
    examples:
      'Input: intervals = [[5,10],[6,8],[1,5],[2,3],[1,10]]\nOutput: 3',
    intuition:
      'The minimum number of non-overlapping groups equals the maximum number of intervals overlapping at any single point. A sweep line with +1 at each start and -1 at each end+1 finds this peak efficiently.',
    approach:
      'This is equivalent to finding the maximum number of overlapping intervals at any point. Use a sweep line: +1 at each start, -1 at each end+1. The peak is the answer.',
    code: `class Solution:
    def minGroups(self, intervals: list[list[int]]) -> int:
        events = []
        for left, right in intervals:
            events.append((left, 1))
            events.append((right + 1, -1))
        events.sort()
        current = result = 0
        for _, delta in events:
            current += delta
            result = max(result, current)
        return result`,
    jsCode: `var minGroups = function(intervals) {
    const events = [];
    for (const [left, right] of intervals) {
        events.push([left, 1]);
        events.push([right + 1, -1]);
    }
    events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    let current = 0, result = 0;
    for (const [, delta] of events) {
        current += delta;
        result = Math.max(result, current);
    }
    return result;
};`,
    explanation:
      '1. Create events: +1 at interval start, -1 at interval end + 1.\n' +
      '2. Sort events by position (ties broken by delta for correctness).\n' +
      '3. Sweep through events, maintaining a running count of active intervals.\n' +
      '4. The maximum concurrent count is the minimum number of groups needed.\n' +
      '5. This is the classic interval scheduling / sweep line approach.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Minimum groups = maximum number of overlapping intervals.',
      'Use a sweep line with +1 at start and -1 at end+1.',
      'The peak of the sweep is the answer.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2416. Sum of Prefix Scores of Strings
  // ---------------------------------------------------------------------------
  {
    id: 2416,
    description:
      'Given an array of strings words, for each word compute its "score" = sum over all prefixes p of word of (number of words in the array that have p as a prefix). Return the scores array.',
    examples:
      'Input: words = ["abc","ab","bc","b"]\nOutput: [5,4,3,2]',
    intuition:
      'A trie naturally counts prefix matches. As you insert each word, increment a counter at every node along the path. To score a word, simply sum the counters along its trie path - each counter tells you how many words share that prefix.',
    approach:
      'Build a trie. For each node, store how many words pass through it. For each word, sum the counts along its path from root to its last character.',
    code: `class Solution:
    def sumPrefixScores(self, words: list[str]) -> list[int]:
        trie = {}
        for word in words:
            node = trie
            for c in word:
                if c not in node:
                    node[c] = {'#': 0}
                node = node[c]
                node['#'] += 1
        result = []
        for word in words:
            node = trie
            score = 0
            for c in word:
                node = node[c]
                score += node['#']
            result.append(score)
        return result`,
    jsCode: `var sumPrefixScores = function(words) {
    const trie = {};
    for (const word of words) {
        let node = trie;
        for (const c of word) {
            if (!node[c]) node[c] = {'#': 0};
            node = node[c];
            node['#']++;
        }
    }
    const result = [];
    for (const word of words) {
        let node = trie, score = 0;
        for (const c of word) {
            node = node[c];
            score += node['#'];
        }
        result.push(score);
    }
    return result;
};`,
    explanation:
      '1. Build a trie, counting words passing through each node.\n' +
      '2. For each word, traverse the trie following its characters.\n' +
      '3. At each node, add the count (number of words with this prefix).\n' +
      '4. The sum is the word\'s prefix score.\n' +
      '5. Return all scores.',
    timeComplexity: 'O(n * L) where L is average word length',
    spaceComplexity: 'O(n * L)',
    hints: [
      'A trie efficiently counts words sharing a prefix.',
      'Store a count at each trie node for words passing through it.',
      'For each word, sum counts along its path.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2421. Number of Good Paths
  // ---------------------------------------------------------------------------
  {
    id: 2421,
    description:
      'Given a tree with n nodes and values, a good path starts and ends at nodes with the same value, and no node on the path has a value greater than the start/end. Return the number of good paths (including single-node paths).',
    examples:
      'Input: vals = [1,3,2,1,3], edges = [[0,1],[0,2],[2,3],[2,4]]\nOutput: 6',
    intuition:
      'Process nodes by value in ascending order using Union-Find. For each value level, connect nodes to neighbors with smaller or equal values. Then count same-value nodes within each component - k such nodes contribute k*(k-1)/2 good paths.',
    approach:
      'Process nodes in order of their values using Union-Find. For each value group, connect edges where both endpoints have values <= current value. Count pairs within same component with the current value.',
    code: `from collections import defaultdict

class Solution:
    def numberOfGoodPaths(self, vals: list[int], edges: list[list[int]]) -> int:
        n = len(vals)
        parent = list(range(n))
        rank = [0] * n
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        def union(a, b):
            a, b = find(a), find(b)
            if a == b:
                return
            if rank[a] < rank[b]:
                a, b = b, a
            parent[b] = a
            if rank[a] == rank[b]:
                rank[a] += 1
        adj = defaultdict(list)
        for u, v in edges:
            adj[u].append(v)
            adj[v].append(u)
        val_to_nodes = defaultdict(list)
        for i in range(n):
            val_to_nodes[vals[i]].append(i)
        result = n  # single-node paths
        for val in sorted(val_to_nodes):
            for node in val_to_nodes[val]:
                for neighbor in adj[node]:
                    if vals[neighbor] <= val:
                        union(node, neighbor)
            groups = defaultdict(int)
            for node in val_to_nodes[val]:
                groups[find(node)] += 1
            for count in groups.values():
                result += count * (count - 1) // 2
        return result`,
    jsCode: `var numberOfGoodPaths = function(vals, edges) {
    const n = vals.length;
    const parent = Array.from({length: n}, (_, i) => i);
    const rank = new Array(n).fill(0);
    function find(x) {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    function union(a, b) {
        a = find(a); b = find(b);
        if (a === b) return;
        if (rank[a] < rank[b]) [a, b] = [b, a];
        parent[b] = a;
        if (rank[a] === rank[b]) rank[a]++;
    }
    const adj = Array.from({length: n}, () => []);
    for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
    const valToNodes = new Map();
    for (let i = 0; i < n; i++) {
        if (!valToNodes.has(vals[i])) valToNodes.set(vals[i], []);
        valToNodes.get(vals[i]).push(i);
    }
    let result = n;
    const sortedVals = [...valToNodes.keys()].sort((a, b) => a - b);
    for (const val of sortedVals) {
        for (const node of valToNodes.get(val)) {
            for (const neighbor of adj[node]) {
                if (vals[neighbor] <= val) union(node, neighbor);
            }
        }
        const groups = new Map();
        for (const node of valToNodes.get(val)) {
            const r = find(node);
            groups.set(r, (groups.get(r) || 0) + 1);
        }
        for (const count of groups.values()) {
            result += count * (count - 1) / 2;
        }
    }
    return result;
};`,
    explanation:
      '1. Group nodes by value. Process values in ascending order.\n' +
      '2. For each value, union nodes with neighbors that have value <= current.\n' +
      '3. Count nodes of the current value in each component.\n' +
      '4. For k such nodes in a component, there are k*(k-1)/2 good paths.\n' +
      '5. Add n for single-node paths. Return total.',
    timeComplexity: 'O(n * alpha(n) + n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Process nodes by value in ascending order.',
      'Use Union-Find to merge components incrementally.',
      'Count pairs of same-value nodes in each component.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2441. Largest Positive Integer That Exists With Its Negative
  // ---------------------------------------------------------------------------
  {
    id: 2441,
    description:
      'Given an integer array nums that does not contain 0, find the largest positive integer k such that -k also exists in the array. Return k, or -1 if no such integer exists.',
    examples:
      'Input: nums = [-1,2,-3,3]\nOutput: 3',
    intuition:
      'Put all numbers in a set for O(1) lookup. For each positive number, check if its negation exists in the set. Track the maximum such positive number.',
    approach:
      'Use a set for O(1) lookup. Iterate through positive numbers in the array and check if the negation exists. Track the maximum.',
    code: `class Solution:
    def findMaxK(self, nums: list[int]) -> int:
        s = set(nums)
        result = -1
        for num in nums:
            if num > 0 and -num in s:
                result = max(result, num)
        return result`,
    jsCode: `var findMaxK = function(nums) {
    const s = new Set(nums);
    let result = -1;
    for (const num of nums) {
        if (num > 0 && s.has(-num)) {
            result = Math.max(result, num);
        }
    }
    return result;
};`,
    explanation:
      '1. Put all numbers in a set.\n' +
      '2. For each positive number, check if its negation is in the set.\n' +
      '3. Track the maximum such positive number.\n' +
      '4. Return -1 if no such pair exists.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a set for fast lookups.',
      'For each positive number, check if its negation exists.',
      'Track the maximum valid positive number.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2461. Maximum Sum of Distinct Subarrays With Length K
  // ---------------------------------------------------------------------------
  {
    id: 2461,
    description:
      'Given an integer array nums and an integer k, find the maximum sum of a subarray of length k with all distinct elements. Return 0 if no such subarray exists.',
    examples:
      'Input: nums = [1,5,4,2,9,9,9], k = 3\nOutput: 15\nExplanation: Subarray [5,4,2] or [4,2,9] both have sum 15 (wait, [1,5,4]=10, [5,4,2]=11, [4,2,9]=15). Output: 15.',
    intuition:
      'Use a fixed-size sliding window of length k with a frequency map. The window is valid (all distinct) when the number of unique elements equals k. Track the maximum sum across all valid windows.',
    approach:
      'Use a sliding window of size k with a hash map counting element frequencies. Track the number of distinct elements. When distinct count equals k, compute and track the sum.',
    code: `from collections import defaultdict

class Solution:
    def maximumSubarraySum(self, nums: list[int], k: int) -> int:
        count = defaultdict(int)
        window_sum = 0
        result = 0
        for i in range(len(nums)):
            count[nums[i]] += 1
            window_sum += nums[i]
            if i >= k:
                count[nums[i - k]] -= 1
                if count[nums[i - k]] == 0:
                    del count[nums[i - k]]
                window_sum -= nums[i - k]
            if i >= k - 1 and len(count) == k:
                result = max(result, window_sum)
        return result`,
    jsCode: `var maximumSubarraySum = function(nums, k) {
    const count = new Map();
    let windowSum = 0, result = 0;
    for (let i = 0; i < nums.length; i++) {
        count.set(nums[i], (count.get(nums[i]) || 0) + 1);
        windowSum += nums[i];
        if (i >= k) {
            const old = nums[i - k];
            count.set(old, count.get(old) - 1);
            if (count.get(old) === 0) count.delete(old);
            windowSum -= old;
        }
        if (i >= k - 1 && count.size === k) {
            result = Math.max(result, windowSum);
        }
    }
    return result;
};`,
    explanation:
      '1. Maintain a sliding window of size k.\n' +
      '2. Track element counts in a dictionary and running sum.\n' +
      '3. When the window reaches size k, check if all elements are distinct (len(count) == k).\n' +
      '4. If distinct, update result with the window sum.\n' +
      '5. Slide the window by removing the leftmost element.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k)',
    hints: [
      'Fixed-size sliding window of length k.',
      'Track frequencies to check for all distinct elements.',
      'All distinct means the number of unique elements equals k.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2462. Total Cost to Hire K Workers
  // ---------------------------------------------------------------------------
  {
    id: 2462,
    description:
      'Given an array costs of worker costs, hire k workers. In each round, pick the cheapest among the first candidates or last candidates workers. Ties are broken by smaller index. Return the total cost.',
    examples:
      'Input: costs = [17,12,10,2,7,2,11,20,8], k = 3, candidates = 4\nOutput: 11',
    intuition:
      'Two min-heaps represent the candidate pools from the front and back of the array. Each round, hire the cheaper worker from either pool and refill from the unprocessed middle. The two-pointer approach ensures pools don\'t overlap.',
    approach:
      'Use two min-heaps: one for the first `candidates` workers and one for the last `candidates` workers. In each hiring round, pick the minimum from both heaps and refill from the unprocessed middle.',
    code: `import heapq

class Solution:
    def totalCost(self, costs: list[int], k: int, candidates: int) -> int:
        n = len(costs)
        left_heap = []
        right_heap = []
        left = 0
        right = n - 1
        for _ in range(candidates):
            if left <= right:
                heapq.heappush(left_heap, (costs[left], left))
                left += 1
        for _ in range(candidates):
            if left <= right:
                heapq.heappush(right_heap, (costs[right], right))
                right -= 1
        total = 0
        for _ in range(k):
            if not right_heap or (left_heap and left_heap[0] <= right_heap[0]):
                cost, idx = heapq.heappop(left_heap)
                total += cost
                if left <= right:
                    heapq.heappush(left_heap, (costs[left], left))
                    left += 1
            else:
                cost, idx = heapq.heappop(right_heap)
                total += cost
                if left <= right:
                    heapq.heappush(right_heap, (costs[right], right))
                    right -= 1
        return total`,
    jsCode: `var totalCost = function(costs, k, candidates) {
    const n = costs.length;
    const leftHeap = new MinPriorityQueue({compare: (a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]});
    const rightHeap = new MinPriorityQueue({compare: (a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]});
    let left = 0, right = n - 1;
    for (let i = 0; i < candidates; i++) {
        if (left <= right) { leftHeap.enqueue([costs[left], left]); left++; }
    }
    for (let i = 0; i < candidates; i++) {
        if (left <= right) { rightHeap.enqueue([costs[right], right]); right--; }
    }
    let total = 0;
    for (let i = 0; i < k; i++) {
        const lf = leftHeap.isEmpty() ? null : leftHeap.front();
        const rf = rightHeap.isEmpty() ? null : rightHeap.front();
        if (!rf || (lf && (lf[0] < rf[0] || (lf[0] === rf[0] && lf[1] <= rf[1])))) {
            const [cost] = leftHeap.dequeue();
            total += cost;
            if (left <= right) { leftHeap.enqueue([costs[left], left]); left++; }
        } else {
            const [cost] = rightHeap.dequeue();
            total += cost;
            if (left <= right) { rightHeap.enqueue([costs[right], right]); right--; }
        }
    }
    return total;
};`,
    explanation:
      '1. Initialize two heaps from the first and last `candidates` workers.\n' +
      '2. Use left and right pointers to track the unprocessed range.\n' +
      '3. Each round, pick the cheaper worker from either heap.\n' +
      '4. Refill the chosen heap from the middle if workers remain.\n' +
      '5. Repeat k times and return the total cost.',
    timeComplexity: 'O((k + candidates) * log(candidates))',
    spaceComplexity: 'O(candidates)',
    hints: [
      'Use two heaps for the front and back candidate pools.',
      'After hiring from one pool, refill from the unprocessed middle.',
      'Handle the case where pools overlap (small array).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2466. Count Ways To Build Good Strings
  // ---------------------------------------------------------------------------
  {
    id: 2466,
    description:
      'Given low, high, zero (append "0" zero times) and one (append "1" one times), count the number of good strings with length between low and high, modulo 10^9+7.',
    examples:
      'Input: low = 3, high = 3, zero = 1, one = 1\nOutput: 8\nExplanation: All binary strings of length 3: "000","001","010","011","100","101","110","111".',
    intuition:
      'This is like a coin change problem where you can add \'zero\' zeros or \'one\' ones at each step. The DP recurrence dp[i] = dp[i-zero] + dp[i-one] counts the number of ways to build strings of each length.',
    approach:
      'Use DP. dp[i] = number of ways to build a string of length i. dp[i] = dp[i - zero] + dp[i - one]. Sum dp[low] through dp[high].',
    code: `class Solution:
    def countGoodStrings(self, low: int, high: int, zero: int, one: int) -> int:
        MOD = 10**9 + 7
        dp = [0] * (high + 1)
        dp[0] = 1
        result = 0
        for i in range(1, high + 1):
            if i >= zero:
                dp[i] += dp[i - zero]
            if i >= one:
                dp[i] += dp[i - one]
            dp[i] %= MOD
            if i >= low:
                result = (result + dp[i]) % MOD
        return result`,
    jsCode: `var countGoodStrings = function(low, high, zero, one) {
    const MOD = 1e9 + 7;
    const dp = new Array(high + 1).fill(0);
    dp[0] = 1;
    let result = 0;
    for (let i = 1; i <= high; i++) {
        if (i >= zero) dp[i] += dp[i - zero];
        if (i >= one) dp[i] += dp[i - one];
        dp[i] %= MOD;
        if (i >= low) result = (result + dp[i]) % MOD;
    }
    return result;
};`,
    explanation:
      '1. dp[0] = 1 (empty string is the base).\n' +
      '2. dp[i] = dp[i - zero] + dp[i - one] (append zero 0s or one 1s).\n' +
      '3. Sum dp[i] for all i in [low, high].\n' +
      '4. Apply modulo at each step to prevent overflow.\n' +
      '5. Return the total count.',
    timeComplexity: 'O(high)',
    spaceComplexity: 'O(high)',
    hints: [
      'This is a coin-change-like DP problem.',
      'dp[i] depends on dp[i - zero] and dp[i - one].',
      'Sum the DP values in the valid range [low, high].',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2467. Most Profitable Path in a Tree
  // ---------------------------------------------------------------------------
  {
    id: 2467,
    description:
      'Alice starts at node 0 and Bob starts at node bob in a tree. They move simultaneously toward leaves (Alice) and node 0 (Bob). Each node has a reward collected once. If they arrive at a node at the same time, they split. Alice wants to maximize profit on any root-to-leaf path. Return Alice\'s max profit.',
    examples:
      'Input: edges = [[0,1],[1,2],[1,3],[3,4]], bob = 3, amount = [-2,4,2,-4,6]\nOutput: 6',
    intuition:
      'First trace Bob\'s unique path to node 0 to know when he arrives at each node. Then DFS as Alice, adjusting each node\'s reward based on who arrives first. Alice\'s answer is the maximum profit among all root-to-leaf paths.',
    approach:
      'First find Bob\'s unique path to node 0 using DFS. Record when Bob arrives at each node. Then DFS from node 0 for Alice, adjusting node values based on relative arrival times. Track the maximum leaf profit.',
    code: `from collections import defaultdict

class Solution:
    def mostProfitablePath(self, edges: list[list[int]], bob: int, amount: list[int]) -> int:
        n = len(amount)
        graph = defaultdict(list)
        for u, v in edges:
            graph[u].append(v)
            graph[v].append(u)
        bob_time = [n] * n
        # Find Bob's path to 0
        def find_bob(node, parent, time):
            if node == 0:
                bob_time[node] = time
                return True
            for neighbor in graph[node]:
                if neighbor != parent:
                    if find_bob(neighbor, node, time + 1):
                        bob_time[node] = time
                        return True
            return False
        find_bob(bob, -1, 0)
        # DFS for Alice
        result = float('-inf')
        def dfs(node, parent, time, profit):
            nonlocal result
            if time < bob_time[node]:
                profit += amount[node]
            elif time == bob_time[node]:
                profit += amount[node] // 2
            is_leaf = True
            for neighbor in graph[node]:
                if neighbor != parent:
                    is_leaf = False
                    dfs(neighbor, node, time + 1, profit)
            if is_leaf:
                result = max(result, profit)
        dfs(0, -1, 0, 0)
        return result`,
    jsCode: `var mostProfitablePath = function(edges, bob, amount) {
    const n = amount.length;
    const graph = Array.from({length: n}, () => []);
    for (const [u, v] of edges) { graph[u].push(v); graph[v].push(u); }
    const bobTime = new Array(n).fill(n);
    function findBob(node, parent, time) {
        if (node === 0) { bobTime[node] = time; return true; }
        for (const neighbor of graph[node]) {
            if (neighbor !== parent && findBob(neighbor, node, time + 1)) {
                bobTime[node] = time;
                return true;
            }
        }
        return false;
    }
    findBob(bob, -1, 0);
    let result = -Infinity;
    function dfs(node, parent, time, profit) {
        if (time < bobTime[node]) profit += amount[node];
        else if (time === bobTime[node]) profit += Math.floor(amount[node] / 2);
        let isLeaf = true;
        for (const neighbor of graph[node]) {
            if (neighbor !== parent) {
                isLeaf = false;
                dfs(neighbor, node, time + 1, profit);
            }
        }
        if (isLeaf) result = Math.max(result, profit);
    }
    dfs(0, -1, 0, 0);
    return result;
};`,
    explanation:
      '1. Build adjacency list. Find Bob\'s path to node 0 and record arrival times.\n' +
      '2. DFS from node 0 as Alice, tracking her arrival time.\n' +
      '3. At each node, compare Alice\'s and Bob\'s arrival times.\n' +
      '4. If Alice arrives first, she gets full amount. If same time, half. If later, nothing.\n' +
      '5. Track the maximum profit at leaf nodes.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'First find Bob\'s path from bob to node 0.',
      'Then simulate Alice\'s DFS, adjusting rewards based on who arrives first.',
      'Alice\'s profit is maximized over all root-to-leaf paths.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2482. Difference Between Ones and Zeros in Row and Column
  // ---------------------------------------------------------------------------
  {
    id: 2482,
    description:
      'Given an m x n binary matrix grid, create a difference matrix where diff[i][j] = onesRow_i + onesCol_j - zerosRow_i - zerosCol_j.',
    examples:
      'Input: grid = [[0,1,1],[1,0,1],[0,0,1]]\nOutput: [[0,0,4],[0,0,4],[-2,-2,2]]',
    intuition:
      'Precompute row and column sums of ones, then the formula simplifies algebraically to diff[i][j] = 2*rowOnes[i] + 2*colOnes[j] - m - n. No need to count zeros separately since zeros = total - ones.',
    approach:
      'Precompute the count of ones in each row and column. Then diff[i][j] = onesRow[i] + onesCol[j] - (n - onesRow[i]) - (m - onesCol[j]) = 2*onesRow[i] + 2*onesCol[j] - n - m.',
    code: `class Solution:
    def onesMinusZeros(self, grid: list[list[int]]) -> list[list[int]]:
        m, n = len(grid), len(grid[0])
        row_ones = [sum(row) for row in grid]
        col_ones = [sum(grid[i][j] for i in range(m)) for j in range(n)]
        return [[2 * row_ones[i] + 2 * col_ones[j] - m - n for j in range(n)] for i in range(m)]`,
    jsCode: `var onesMinusZeros = function(grid) {
    const m = grid.length, n = grid[0].length;
    const rowOnes = grid.map(row => row.reduce((a, b) => a + b, 0));
    const colOnes = new Array(n).fill(0);
    for (let j = 0; j < n; j++)
        for (let i = 0; i < m; i++) colOnes[j] += grid[i][j];
    return Array.from({length: m}, (_, i) =>
        Array.from({length: n}, (_, j) => 2 * rowOnes[i] + 2 * colOnes[j] - m - n)
    );
};`,
    explanation:
      '1. Count ones in each row (row_ones) and column (col_ones).\n' +
      '2. Zeros in row i = n - row_ones[i]. Zeros in col j = m - col_ones[j].\n' +
      '3. diff[i][j] = row_ones[i] + col_ones[j] - (n - row_ones[i]) - (m - col_ones[j]).\n' +
      '4. Simplify: diff[i][j] = 2*row_ones[i] + 2*col_ones[j] - n - m.\n' +
      '5. Compute for all (i, j).',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m + n) extra',
    hints: [
      'Precompute row and column sums of ones.',
      'Zeros = total - ones for each row and column.',
      'Simplify the formula algebraically.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2485. Find the Pivot Integer
  // ---------------------------------------------------------------------------
  {
    id: 2485,
    description:
      'Given a positive integer n, find the pivot integer x such that the sum 1 + 2 + ... + x equals x + (x+1) + ... + n. Return -1 if no such integer exists.',
    examples:
      'Input: n = 8\nOutput: 6\nExplanation: 1+2+3+4+5+6 = 21 and 6+7+8 = 21.',
    intuition:
      'Setting sum(1..x) = sum(x..n) and simplifying gives x^2 = n*(n+1)/2. So the pivot exists only when the total sum is a perfect square, and the pivot is its square root.',
    approach:
      'Sum(1..x) = x*(x+1)/2. Sum(x..n) = n*(n+1)/2 - x*(x-1)/2. Set equal and solve: x^2 = n*(n+1)/2. Check if n*(n+1)/2 is a perfect square.',
    code: `import math

class Solution:
    def pivotInteger(self, n: int) -> int:
        total = n * (n + 1) // 2
        x = int(math.isqrt(total))
        if x * x == total:
            return x
        return -1`,
    jsCode: `var pivotInteger = function(n) {
    const total = n * (n + 1) / 2;
    const x = Math.floor(Math.sqrt(total));
    if (x * x === total) return x;
    return -1;
};`,
    explanation:
      '1. Total sum = n*(n+1)/2.\n' +
      '2. For pivot x: x*(x+1)/2 = total - x*(x-1)/2, which simplifies to x^2 = total.\n' +
      '3. Check if total is a perfect square.\n' +
      '4. If yes, x = sqrt(total) is the pivot.\n' +
      '5. Otherwise, return -1.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    hints: [
      'Set up the equation: sum(1..x) = sum(x..n).',
      'This simplifies to x^2 = n*(n+1)/2.',
      'Check if the result is a perfect square.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2542. Maximum Subsequence Score
  // ---------------------------------------------------------------------------
  {
    id: 2542,
    description:
      'Given arrays nums1 and nums2 of length n and integer k, choose k indices. The score is sum(nums1[chosen]) * min(nums2[chosen]). Return the maximum score.',
    examples:
      'Input: nums1 = [1,3,3,2], nums2 = [2,1,3,4], k = 3\nOutput: 12\nExplanation: Choose indices 0,2,3. Score = (1+3+2) * min(2,3,4) = 6*2 = 12.',
    intuition:
      'Sort by nums2 descending so each new element is the new minimum. Maintain a min-heap of size k for the top nums1 values. At each step, score = heap_sum * current_nums2_value. This elegantly handles both the sum maximization and minimum tracking.',
    approach:
      'Sort indices by nums2 descending. Use a min-heap of size k for nums1 values. For each new index (which has the smallest nums2 so far), add nums1[i] to the heap and compute score = sum * nums2[i].',
    code: `import heapq

class Solution:
    def maxScore(self, nums1: list[int], nums2: list[int], k: int) -> int:
        pairs = sorted(zip(nums2, nums1), reverse=True)
        heap = []
        cur_sum = 0
        result = 0
        for min_val, val in pairs:
            heapq.heappush(heap, val)
            cur_sum += val
            if len(heap) > k:
                cur_sum -= heapq.heappop(heap)
            if len(heap) == k:
                result = max(result, cur_sum * min_val)
        return result`,
    jsCode: `var maxScore = function(nums1, nums2, k) {
    const pairs = nums2.map((v, i) => [v, nums1[i]]).sort((a, b) => b[0] - a[0]);
    const pq = new MinPriorityQueue();
    let curSum = 0, result = 0;
    for (const [minVal, val] of pairs) {
        pq.enqueue(val);
        curSum += val;
        if (pq.size() > k) curSum -= pq.dequeue().element;
        if (pq.size() === k) result = Math.max(result, curSum * minVal);
    }
    return result;
};`,
    explanation:
      '1. Pair nums1 and nums2, sort by nums2 descending.\n' +
      '2. Process elements: the current element has the smallest nums2 so far.\n' +
      '3. Maintain a min-heap of size k for nums1 values to maximize their sum.\n' +
      '4. When heap has k elements, score = sum * current nums2 value (the minimum).\n' +
      '5. Track the maximum score.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Sort by nums2 descending so the current element is always the minimum.',
      'Maintain the top k nums1 values using a min-heap.',
      'Score = heap_sum * current_min.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2551. Put Marbles in Bags
  // ---------------------------------------------------------------------------
  {
    id: 2551,
    description:
      'Given an array weights and k bags, split weights into k contiguous groups. The cost of a split is the sum of (first + last element) of each group. Return the difference between max and min possible costs.',
    examples:
      'Input: weights = [1,3,5,1], k = 2\nOutput: 4',
    intuition:
      'The total cost depends only on where you place the k-1 split points. Each split between indices i and i+1 contributes weights[i]+weights[i+1] to the cost. Sort these pair sums to find the best and worst k-1 splits, and the answer is their difference.',
    approach:
      'The cost depends on the k-1 split points. Each split between indices i and i+1 adds weights[i] + weights[i+1] to the cost (plus the fixed weights[0] + weights[n-1]). Sort the pair sums and pick the largest/smallest k-1.',
    code: `class Solution:
    def putMarbles(self, weights: list[int], k: int) -> int:
        if k == 1:
            return 0
        pair_sums = sorted(weights[i] + weights[i + 1] for i in range(len(weights) - 1))
        return sum(pair_sums[-(k-1):]) - sum(pair_sums[:k-1])`,
    jsCode: `var putMarbles = function(weights, k) {
    if (k === 1) return 0;
    const pairSums = [];
    for (let i = 0; i < weights.length - 1; i++) {
        pairSums.push(weights[i] + weights[i + 1]);
    }
    pairSums.sort((a, b) => a - b);
    let diff = 0;
    for (let i = 0; i < k - 1; i++) {
        diff += pairSums[pairSums.length - 1 - i] - pairSums[i];
    }
    return diff;
};`,
    explanation:
      '1. The total cost = weights[0] + weights[n-1] + sum of pair_sums at split points.\n' +
      '2. pair_sum[i] = weights[i] + weights[i+1] for each possible split.\n' +
      '3. Max cost uses the k-1 largest pair sums; min cost uses the k-1 smallest.\n' +
      '4. The fixed part (weights[0] + weights[n-1]) cancels out in the difference.\n' +
      '5. Answer = sum of top k-1 pair sums - sum of bottom k-1.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Focus on what changes at split points.',
      'Each split adds the sum of adjacent elements at the boundary.',
      'Sort pair sums to find max and min cost splits.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2558. Take Gifts From the Richest Pile
  // ---------------------------------------------------------------------------
  {
    id: 2558,
    description:
      'Given an array gifts and an integer k, for k seconds: pick the pile with the most gifts, leave floor(sqrt(gifts)) in that pile. Return the total gifts remaining after k seconds.',
    examples:
      'Input: gifts = [25,64,9,4,100], k = 4\nOutput: 29',
    intuition:
      'A max-heap lets you always grab the richest pile. Replace the top with floor(sqrt(top)) each round - the pile shrinks dramatically due to the square root. After k rounds, sum everything remaining.',
    approach:
      'Use a max-heap. For k iterations, pop the maximum, replace it with floor(sqrt(value)), and push back. Sum the remaining heap.',
    code: `import heapq
import math

class Solution:
    def pickGifts(self, gifts: list[int], k: int) -> int:
        heap = [-g for g in gifts]
        heapq.heapify(heap)
        for _ in range(k):
            top = -heapq.heappop(heap)
            heapq.heappush(heap, -int(math.isqrt(top)))
        return -sum(heap)`,
    jsCode: `var pickGifts = function(gifts, k) {
    const pq = new MaxPriorityQueue();
    for (const g of gifts) pq.enqueue(g);
    for (let i = 0; i < k; i++) {
        const top = pq.dequeue().element;
        pq.enqueue(Math.floor(Math.sqrt(top)));
    }
    let total = 0;
    while (!pq.isEmpty()) total += pq.dequeue().element;
    return total;
};`,
    explanation:
      '1. Create a max-heap (negate values for Python min-heap).\n' +
      '2. For k iterations, pop the largest pile.\n' +
      '3. Replace with floor(sqrt(pile)) and push back.\n' +
      '4. After k operations, sum all remaining values.\n' +
      '5. Return the total.',
    timeComplexity: 'O(n + k * log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a max-heap to always access the richest pile.',
      'Replace the max with floor(sqrt(max)) each round.',
      'Sum the heap after k operations.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2610. Convert an Array Into a 2D Array With Conditions
  // ---------------------------------------------------------------------------
  {
    id: 2610,
    description:
      'Given an integer array nums, create a 2D array where: each row contains distinct elements, every element of nums is in exactly one row, and the number of rows is minimized.',
    examples:
      'Input: nums = [1,3,4,1,2,3,1]\nOutput: [[1,3,4,2],[1,3],[1]]',
    intuition:
      'The number of rows needed equals the maximum frequency of any element. Distribute each element across as many rows as its frequency demands, ensuring each row gets at most one copy of each element.',
    approach:
      'Count frequencies. The number of rows = max frequency. Distribute elements row by row: for each element with frequency f, place it in the first f rows.',
    code: `from collections import Counter

class Solution:
    def findMatrix(self, nums: list[int]) -> list[list[int]]:
        count = Counter(nums)
        result = []
        for num, freq in count.items():
            for i in range(freq):
                if i >= len(result):
                    result.append([])
                result[i].append(num)
        return result`,
    jsCode: `var findMatrix = function(nums) {
    const count = new Map();
    for (const num of nums) count.set(num, (count.get(num) || 0) + 1);
    const result = [];
    for (const [num, freq] of count) {
        for (let i = 0; i < freq; i++) {
            if (i >= result.length) result.push([]);
            result[i].push(num);
        }
    }
    return result;
};`,
    explanation:
      '1. Count frequency of each element.\n' +
      '2. For an element with frequency f, it must appear in f different rows.\n' +
      '3. Place it in rows 0, 1, ..., f-1.\n' +
      '4. Create new rows as needed.\n' +
      '5. This ensures each row has distinct elements and minimizes rows.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The number of rows needed = maximum frequency of any element.',
      'Distribute each element across rows based on its frequency.',
      'Each row gets at most one copy of each element.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2620. Counter (JavaScript) — Python equivalent
  // ---------------------------------------------------------------------------
  {
    id: 2620,
    description:
      'Given an integer n, return a counter function that initially returns n and then returns 1 more than the previous value every subsequent time it is called.',
    examples:
      'Input: n = 10, calls = ["call","call","call"]\nOutput: [10,11,12]',
    intuition:
      'A closure captures and remembers the variable n from its enclosing scope. Each call returns the current value and increments it, maintaining state between calls without any external storage.',
    approach:
      'Use a closure that captures n. Each call returns the current value and increments it.',
    code: `class Solution:
    def createCounter(self, n: int):
        count = [n]
        def counter():
            val = count[0]
            count[0] += 1
            return val
        return counter`,
    jsCode: `var createCounter = function(n) {
    let count = n;
    return function() {
        return count++;
    };
};`,
    explanation:
      '1. Use a closure to capture the initial value n.\n' +
      '2. Store the current value in a mutable container (list) to allow modification.\n' +
      '3. Each call returns the current value and increments it.\n' +
      '4. The closure maintains state between calls.',
    timeComplexity: 'O(1) per call',
    spaceComplexity: 'O(1)',
    hints: [
      'Use a closure to maintain state.',
      'Store the counter value in a mutable container.',
      'Increment after returning the current value.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2622. Cache With Time Limit (JavaScript) — Python equivalent
  // ---------------------------------------------------------------------------
  {
    id: 2622,
    description:
      'Design a key-value cache where each entry expires after a given duration (in milliseconds). Support set(key, value, duration), get(key), and count() methods.',
    examples:
      'Input: ["TimeLimitedCache","set","get","count","get"]\n[[],[1,42,100],[1],[],[1]]\nAt t=0: set(1,42,100), t=50: get(1)->42, t=50: count()->1, t=150: get(1)->-1',
    intuition:
      'Store each cache entry with its expiry timestamp. On every access, check if the current time exceeds the expiry. This lazy expiration approach is simpler than using timers and works perfectly for this use case.',
    approach:
      'Store entries as (value, expiry_time) pairs in a dictionary. On get/count, check if the entry has expired.',
    code: `import time

class TimeLimitedCache:
    def __init__(self):
        self.cache = {}

    def set(self, key: int, value: int, duration: int) -> bool:
        now = time.time() * 1000
        existed = key in self.cache and self.cache[key][1] > now
        self.cache[key] = (value, now + duration)
        return existed

    def get(self, key: int) -> int:
        now = time.time() * 1000
        if key in self.cache and self.cache[key][1] > now:
            return self.cache[key][0]
        return -1

    def count(self) -> int:
        now = time.time() * 1000
        return sum(1 for _, exp in self.cache.values() if exp > now)`,
    jsCode: `var TimeLimitedCache = function() {
    this.cache = new Map();
};

TimeLimitedCache.prototype.set = function(key, value, duration) {
    const now = Date.now();
    const existed = this.cache.has(key) && this.cache.get(key)[1] > now;
    this.cache.set(key, [value, now + duration]);
    return existed;
};

TimeLimitedCache.prototype.get = function(key) {
    const now = Date.now();
    if (this.cache.has(key) && this.cache.get(key)[1] > now) {
        return this.cache.get(key)[0];
    }
    return -1;
};

TimeLimitedCache.prototype.count = function() {
    const now = Date.now();
    let count = 0;
    for (const [, [, exp]] of this.cache) {
        if (exp > now) count++;
    }
    return count;
};`,
    explanation:
      '1. Store each key as (value, expiry_timestamp) in a dictionary.\n' +
      '2. set: check if key exists and is not expired, store new entry, return whether it existed.\n' +
      '3. get: return value if key exists and is not expired, else -1.\n' +
      '4. count: count all non-expired entries.\n' +
      '5. Expiry is checked lazily on access.',
    timeComplexity: 'O(1) for set/get, O(n) for count',
    spaceComplexity: 'O(n)',
    hints: [
      'Store expiry time alongside each value.',
      'Check expiry on every access.',
      'Use the current time to determine if an entry is valid.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2642. Design Graph With Shortest Path Calculator
  // ---------------------------------------------------------------------------
  {
    id: 2642,
    description:
      'Design a graph class that supports addEdge(u, v, cost) and shortestPath(node1, node2) using Dijkstra\'s algorithm.',
    examples:
      'Input: ["Graph","shortestPath","shortestPath","addEdge","shortestPath"]\n[[4,[[0,2,5],[0,1,2],[1,2,1],[3,0,3]]],[3,2],[0,3],[1,3,4],[0,3]]\nOutput: [null,6,-1,null,6]',
    intuition:
      'Store the graph as an adjacency list and run Dijkstra\'s algorithm for each shortest path query. Adding an edge just appends to the adjacency list. Early termination when the target node is popped from the heap speeds up queries.',
    approach:
      'Store edges in an adjacency list. For shortestPath, run Dijkstra\'s algorithm from node1 to node2. addEdge simply appends to the adjacency list.',
    code: `import heapq

class Graph:
    def __init__(self, n: int, edges: list[list[int]]):
        self.graph = [[] for _ in range(n)]
        for u, v, cost in edges:
            self.graph[u].append((v, cost))

    def addEdge(self, edge: list[int]) -> None:
        u, v, cost = edge
        self.graph[u].append((v, cost))

    def shortestPath(self, node1: int, node2: int) -> int:
        dist = [float('inf')] * len(self.graph)
        dist[node1] = 0
        heap = [(0, node1)]
        while heap:
            d, u = heapq.heappop(heap)
            if u == node2:
                return d
            if d > dist[u]:
                continue
            for v, w in self.graph[u]:
                if d + w < dist[v]:
                    dist[v] = d + w
                    heapq.heappush(heap, (dist[v], v))
        return -1`,
    jsCode: `var Graph = function(n, edges) {
    this.graph = Array.from({length: n}, () => []);
    for (const [u, v, cost] of edges) {
        this.graph[u].push([v, cost]);
    }
};

Graph.prototype.addEdge = function(edge) {
    const [u, v, cost] = edge;
    this.graph[u].push([v, cost]);
};

Graph.prototype.shortestPath = function(node1, node2) {
    const dist = new Array(this.graph.length).fill(Infinity);
    dist[node1] = 0;
    const pq = new MinPriorityQueue({compare: (a, b) => a[0] - b[0]});
    pq.enqueue([0, node1]);
    while (!pq.isEmpty()) {
        const [d, u] = pq.dequeue();
        if (u === node2) return d;
        if (d > dist[u]) continue;
        for (const [v, w] of this.graph[u]) {
            if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.enqueue([dist[v], v]);
            }
        }
    }
    return -1;
};`,
    explanation:
      '1. Store the directed graph as an adjacency list.\n' +
      '2. addEdge appends a new edge to the adjacency list.\n' +
      '3. shortestPath runs Dijkstra from node1.\n' +
      '4. Return the distance to node2, or -1 if unreachable.\n' +
      '5. Early termination when node2 is popped from the heap.',
    timeComplexity: 'O((V + E) log V) per query',
    spaceComplexity: 'O(V + E)',
    hints: [
      'Use an adjacency list for the graph.',
      'Dijkstra\'s algorithm finds shortest paths in weighted graphs.',
      'Early termination when the target node is reached.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2709. Greatest Common Divisor Traversal
  // ---------------------------------------------------------------------------
  {
    id: 2709,
    description:
      'Given an array of positive integers nums, you can traverse from index i to j if gcd(nums[i], nums[j]) > 1. Return true if all pairs of indices can reach each other through such traversals.',
    examples:
      'Input: nums = [2,3,6]\nOutput: true\nExplanation: gcd(2,6)=2>1, gcd(3,6)=3>1. All connected via index 2.',
    intuition:
      'Two numbers are connected if they share a prime factor. Use Union-Find with prime factors as intermediaries: factorize each number and union its index with the first index that shared each prime. If all indices end up in one component, the answer is true.',
    approach:
      'Factorize each number. Use Union-Find: for each number, union the index with a representative index for each of its prime factors. Check if all indices are in the same component.',
    code: `class Solution:
    def canTraverseAllPairs(self, nums: list[int]) -> bool:
        n = len(nums)
        if n == 1:
            return True
        if 1 in nums:
            return False
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        def union(a, b):
            a, b = find(a), find(b)
            if a != b:
                parent[a] = b
        prime_to_idx = {}
        for i in range(n):
            num = nums[i]
            d = 2
            while d * d <= num:
                if num % d == 0:
                    if d in prime_to_idx:
                        union(i, prime_to_idx[d])
                    else:
                        prime_to_idx[d] = i
                    while num % d == 0:
                        num //= d
                d += 1
            if num > 1:
                if num in prime_to_idx:
                    union(i, prime_to_idx[num])
                else:
                    prime_to_idx[num] = i
        root = find(0)
        return all(find(i) == root for i in range(n))`,
    jsCode: `var canTraverseAllPairs = function(nums) {
    const n = nums.length;
    if (n === 1) return true;
    if (nums.includes(1)) return false;
    const parent = Array.from({length: n}, (_, i) => i);
    function find(x) {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    function union(a, b) {
        a = find(a); b = find(b);
        if (a !== b) parent[a] = b;
    }
    const primeToIdx = new Map();
    for (let i = 0; i < n; i++) {
        let num = nums[i], d = 2;
        while (d * d <= num) {
            if (num % d === 0) {
                if (primeToIdx.has(d)) union(i, primeToIdx.get(d));
                else primeToIdx.set(d, i);
                while (num % d === 0) num = Math.floor(num / d);
            }
            d++;
        }
        if (num > 1) {
            if (primeToIdx.has(num)) union(i, primeToIdx.get(num));
            else primeToIdx.set(num, i);
        }
    }
    const root = find(0);
    for (let i = 1; i < n; i++) if (find(i) !== root) return false;
    return true;
};`,
    explanation:
      '1. For each number, factorize it into prime factors.\n' +
      '2. For each prime factor, union the current index with the first index sharing that prime.\n' +
      '3. This connects all indices that share a common prime factor (directly or transitively).\n' +
      '4. After processing all numbers, check if all indices share one root.\n' +
      '5. Handle edge cases: single element (true), contains 1 (false, since gcd(1,x)=1).',
    timeComplexity: 'O(n * sqrt(max_val) * alpha(n))',
    spaceComplexity: 'O(n + number of distinct primes)',
    hints: [
      'Two indices are connected if their values share a prime factor.',
      'Use Union-Find with prime factors as intermediaries.',
      'Factorize each number and union indices sharing primes.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2816. Double a Number Represented as a Linked List
  // ---------------------------------------------------------------------------
  {
    id: 2816,
    description:
      'Given a linked list representing a non-negative integer (head is the most significant digit), return the linked list after doubling the number.',
    examples:
      'Input: head = [1,8,9]\nOutput: [3,7,8]\nExplanation: 189 * 2 = 378.',
    intuition:
      'Doubling a number represented as a linked list requires processing from the least significant digit for carry propagation. Recursion naturally traverses right-to-left, handling carries as it unwinds. Don\'t forget to prepend a new node if there\'s a final carry.',
    approach:
      'Reverse the list, double each digit with carry propagation, then reverse back. Alternatively, use recursion to handle the carry from right to left.',
    code: `class Solution:
    def doubleIt(self, head: Optional[ListNode]) -> Optional[ListNode]:
        def helper(node):
            if not node:
                return 0
            carry = helper(node.next)
            total = node.val * 2 + carry
            node.val = total % 10
            return total // 10
        carry = helper(head)
        if carry:
            new_head = ListNode(carry)
            new_head.next = head
            return new_head
        return head`,
    jsCode: `var doubleIt = function(head) {
    function helper(node) {
        if (!node) return 0;
        const carry = helper(node.next);
        const total = node.val * 2 + carry;
        node.val = total % 10;
        return Math.floor(total / 10);
    }
    const carry = helper(head);
    if (carry) {
        const newHead = new ListNode(carry);
        newHead.next = head;
        return newHead;
    }
    return head;
};`,
    explanation:
      '1. Use recursion to process from the tail (least significant digit).\n' +
      '2. Double each digit and add carry from the right.\n' +
      '3. Store the digit (total % 10) and return carry (total // 10).\n' +
      '4. If there is a final carry, prepend a new node.\n' +
      '5. Return the (possibly new) head.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for recursion stack',
    hints: [
      'Process from least significant to most significant for carry propagation.',
      'Use recursion to naturally traverse right-to-left.',
      'Handle a final carry that extends the number\'s length.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2849. Determine if a Cell Is Reachable at a Given Time
  // ---------------------------------------------------------------------------
  {
    id: 2849,
    description:
      'Given two cells (sx, sy) and (fx, fy) on an infinite 2D grid, determine if you can reach (fx, fy) in exactly t seconds. Each second you move to any of the 8 adjacent cells (or stay is not allowed — you must move).',
    examples:
      'Input: sx = 2, sy = 4, fx = 7, fy = 7, t = 6\nOutput: true',
    intuition:
      'With 8-directional movement, the minimum time to reach any cell is max(|dx|, |dy|) because diagonal moves cover both dimensions simultaneously. Any extra time can be wasted by zigzagging back and forth.',
    approach:
      'The minimum time to reach (fx, fy) is max(|fx-sx|, |fy-sy|) due to diagonal moves. If t >= min_time, we can waste extra time by zigzagging. Special case: if start == end, t must not be 1.',
    code: `class Solution:
    def isReachableAtTime(self, sx: int, sy: int, fx: int, fy: int, t: int) -> bool:
        dx = abs(fx - sx)
        dy = abs(fy - sy)
        if dx == 0 and dy == 0:
            return t != 1
        return t >= max(dx, dy)`,
    jsCode: `var isReachableAtTime = function(sx, sy, fx, fy, t) {
    const dx = Math.abs(fx - sx);
    const dy = Math.abs(fy - sy);
    if (dx === 0 && dy === 0) return t !== 1;
    return t >= Math.max(dx, dy);
};`,
    explanation:
      '1. Compute dx = |fx - sx| and dy = |fy - sy|.\n' +
      '2. Minimum time = max(dx, dy) using diagonal moves.\n' +
      '3. If t >= min_time, extra time can be spent zigzagging.\n' +
      '4. Special case: if start == end and t == 1, impossible (must move but return in 1 step).\n' +
      '5. If start == end and t != 1, always possible (move away and come back).',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    hints: [
      'Diagonal moves mean min time = max(|dx|, |dy|).',
      'Extra time can always be wasted by zigzagging.',
      'Watch for the edge case: same start and end with t=1.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2870. Minimum Number of Operations to Make Array Empty
  // ---------------------------------------------------------------------------
  {
    id: 2870,
    description:
      'Given an array nums, in each operation you can remove 2 or 3 elements with the same value. Return the minimum number of operations to make the array empty, or -1 if impossible.',
    examples:
      'Input: nums = [2,3,3,2,2,4,2,3,4]\nOutput: 4',
    intuition:
      'This is identical to problem 2244: count frequencies, reject frequency 1, and use ceil(f/3) operations for each frequency. Removing 3 at a time is most efficient, with pairs of 2 handling the remainder.',
    approach:
      'Count frequencies. If any frequency is 1, return -1. For each frequency f, minimum operations = ceil(f / 3).',
    code: `from collections import Counter
import math

class Solution:
    def minOperations(self, nums: list[int]) -> int:
        count = Counter(nums)
        ops = 0
        for freq in count.values():
            if freq == 1:
                return -1
            ops += math.ceil(freq / 3)
        return ops`,
    jsCode: `var minOperations = function(nums) {
    const count = new Map();
    for (const num of nums) count.set(num, (count.get(num) || 0) + 1);
    let ops = 0;
    for (const freq of count.values()) {
        if (freq === 1) return -1;
        ops += Math.ceil(freq / 3);
    }
    return ops;
};`,
    explanation:
      '1. Count frequency of each element.\n' +
      '2. If any frequency is 1, impossible to remove (need at least 2).\n' +
      '3. For frequency f, minimum operations = ceil(f / 3).\n' +
      '4. This works: f=2->1, f=3->1, f=4->2(2+2), f=5->2(3+2), f=6->2(3+3), etc.\n' +
      '5. Sum operations for all frequencies.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Group elements by value and count frequencies.',
      'Frequency 1 is impossible.',
      'For f >= 2, ceil(f/3) operations always work.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2962. Count Subarrays Where Max Element Appears at Least K Times
  // ---------------------------------------------------------------------------
  {
    id: 2962,
    description:
      'Given an integer array nums and integer k, return the number of subarrays where the maximum element of the whole array appears at least k times.',
    examples:
      'Input: nums = [1,3,2,3,3], k = 2\nOutput: 6',
    intuition:
      'Only the global maximum element matters. Use a sliding window to count its occurrences. When the count reaches k, all subarrays extending to the left from the current window are valid. The count of valid left endpoints gives the contribution for each right endpoint.',
    approach:
      'Find the maximum element. Use a sliding window. For each right, when the count of max reaches k, all subarrays starting from 0 to left are valid. Move left to shrink.',
    code: `class Solution:
    def countSubarrays(self, nums: list[int], k: int) -> int:
        max_val = max(nums)
        count = 0
        left = 0
        result = 0
        for right in range(len(nums)):
            if nums[right] == max_val:
                count += 1
            while count >= k:
                if nums[left] == max_val:
                    count -= 1
                left += 1
            result += left
        return result`,
    jsCode: `var countSubarrays = function(nums, k) {
    const maxVal = Math.max(...nums);
    let count = 0, left = 0, result = 0;
    for (let right = 0; right < nums.length; right++) {
        if (nums[right] === maxVal) count++;
        while (count >= k) {
            if (nums[left] === maxVal) count--;
            left++;
        }
        result += left;
    }
    return result;
};`,
    explanation:
      '1. Find the global maximum of the array.\n' +
      '2. Use a sliding window tracking the count of max in [left, right].\n' +
      '3. When count >= k, shrink from the left to find the tightest valid window.\n' +
      '4. After shrinking, left is the first position where count < k.\n' +
      '5. All subarrays starting from indices 0 to left-1 with right end are valid: add left.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'We only care about the frequency of the global maximum.',
      'Use a sliding window to count subarrays.',
      'For each right end, count how many left positions give >= k occurrences.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2971. Find Polygon With the Largest Perimeter
  // ---------------------------------------------------------------------------
  {
    id: 2971,
    description:
      'Given an array of positive integers nums, find the largest perimeter of a polygon whose sides are elements of nums. A valid polygon requires each side to be strictly less than the sum of all other sides. Return -1 if impossible.',
    examples:
      'Input: nums = [5,5,5]\nOutput: 15',
    intuition:
      'Sort the array and work backwards. For the largest element to be a valid polygon side, it must be strictly less than the sum of all smaller elements. Using more sides increases the sum of the rest, making validity more likely and the perimeter larger.',
    approach:
      'Sort the array. Iterate from the largest element down: if nums[i] < prefix_sum of all smaller elements, then using all elements up to i forms a valid polygon with maximum perimeter.',
    code: `class Solution:
    def largestPerimeter(self, nums: list[int]) -> int:
        nums.sort()
        prefix = sum(nums)
        for i in range(len(nums) - 1, 1, -1):
            prefix -= nums[i]
            if nums[i] < prefix:
                return prefix + nums[i]
        return -1`,
    jsCode: `var largestPerimeter = function(nums) {
    nums.sort((a, b) => a - b);
    let prefix = nums.reduce((a, b) => a + b, 0);
    for (let i = nums.length - 1; i >= 2; i--) {
        prefix -= nums[i];
        if (nums[i] < prefix) return prefix + nums[i];
    }
    return -1;
};`,
    explanation:
      '1. Sort the array ascending.\n' +
      '2. Start from the largest element. Check if it is less than the sum of all smaller ones.\n' +
      '3. If yes, all elements from 0 to i form a valid polygon (the largest side < sum of rest).\n' +
      '4. The perimeter is the sum of all these elements.\n' +
      '5. If no valid polygon is found, return -1.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sort the array. The largest side must be less than the sum of all others.',
      'Start from the largest and check the polygon condition.',
      'Using more sides increases the sum of the rest, making it more likely to be valid.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 3005. Count Elements With Maximum Frequency
  // ---------------------------------------------------------------------------
  {
    id: 3005,
    description:
      'Given an array nums, return the total frequency of elements that have the maximum frequency.',
    examples:
      'Input: nums = [1,2,2,3,1,4]\nOutput: 4\nExplanation: Elements 1 and 2 each appear 2 times (max frequency). Total = 2 + 2 = 4.',
    intuition:
      'Count frequencies, find the maximum frequency, then sum the frequencies of all elements that achieve this maximum. It\'s a two-step aggregation problem.',
    approach:
      'Count frequencies, find the max frequency, then sum all frequencies that equal the max.',
    code: `from collections import Counter

class Solution:
    def maxFrequencyElements(self, nums: list[int]) -> int:
        count = Counter(nums)
        max_freq = max(count.values())
        return sum(f for f in count.values() if f == max_freq)`,
    jsCode: `var maxFrequencyElements = function(nums) {
    const count = new Map();
    for (const num of nums) count.set(num, (count.get(num) || 0) + 1);
    const maxFreq = Math.max(...count.values());
    let result = 0;
    for (const f of count.values()) if (f === maxFreq) result += f;
    return result;
};`,
    explanation:
      '1. Count frequency of each element.\n' +
      '2. Find the maximum frequency.\n' +
      '3. Sum all frequencies that equal the maximum.\n' +
      '4. Return the total.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Count frequencies using a Counter.',
      'Find the maximum frequency.',
      'Sum the frequencies of all elements with that max frequency.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 3075. Maximize Happiness of Selected Children
  // ---------------------------------------------------------------------------
  {
    id: 3075,
    description:
      'Given an array happiness and integer k, select k children. When you select a child, all unselected children lose 1 happiness (but not below 0). You select one at a time. Maximize the total happiness collected.',
    examples:
      'Input: happiness = [1,2,3], k = 2\nOutput: 4\nExplanation: Pick 3 first (others become [0,1]), then pick 1. Total = 3 + 1 = 4.',
    intuition:
      'Sort happiness descending and greedily pick the happiest children first. Each subsequent selection reduces all remaining happiness by 1, so the i-th child selected effectively loses i happiness from the decay.',
    approach:
      'Sort descending. When selecting the i-th child (0-indexed), their happiness is reduced by i (due to i prior selections). Greedily pick the highest values: max(0, happiness[i] - i).',
    code: `class Solution:
    def maximumHappinessSum(self, happiness: list[int], k: int) -> int:
        happiness.sort(reverse=True)
        result = 0
        for i in range(k):
            val = happiness[i] - i
            if val <= 0:
                break
            result += val
        return result`,
    jsCode: `var maximumHappinessSum = function(happiness, k) {
    happiness.sort((a, b) => b - a);
    let result = 0;
    for (let i = 0; i < k; i++) {
        const val = happiness[i] - i;
        if (val <= 0) break;
        result += val;
    }
    return result;
};`,
    explanation:
      '1. Sort happiness in descending order.\n' +
      '2. The i-th child selected (0-indexed) has happiness reduced by i.\n' +
      '3. Greedily pick children with the highest base happiness.\n' +
      '4. Add max(0, happiness[i] - i) for each selection.\n' +
      '5. Stop early if the adjusted happiness becomes 0 or negative.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Sort descending to pick the happiest children first.',
      'The i-th selection reduces happiness by i due to prior rounds.',
      'Stop when adjusted happiness drops to 0.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 3110. Score of a String
  // ---------------------------------------------------------------------------
  {
    id: 3110,
    description:
      'Given a string s, return the score defined as the sum of the absolute differences between ASCII values of adjacent characters.',
    examples:
      'Input: s = "hello"\nOutput: 13\nExplanation: |h-e| + |e-l| + |l-l| + |l-o| = 3+7+0+3 = 13.',
    intuition:
      'Iterate through adjacent character pairs and sum the absolute differences of their ASCII values. It\'s a straightforward linear scan with a simple computation at each step.',
    approach:
      'Iterate through adjacent pairs, summing the absolute differences of their ASCII values.',
    code: `class Solution:
    def scoreOfString(self, s: str) -> int:
        return sum(abs(ord(s[i]) - ord(s[i + 1])) for i in range(len(s) - 1))`,
    jsCode: `var scoreOfString = function(s) {
    let result = 0;
    for (let i = 0; i < s.length - 1; i++) {
        result += Math.abs(s.charCodeAt(i) - s.charCodeAt(i + 1));
    }
    return result;
};`,
    explanation:
      '1. For each consecutive pair of characters, compute the absolute difference of ASCII values.\n' +
      '2. Sum all such differences.\n' +
      '3. Use ord() to get the ASCII value of each character.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Iterate through adjacent character pairs.',
      'Use ord() to get ASCII values.',
      'Sum the absolute differences.',
    ],
  },
];

const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/NeetCodeSolution-C12HLJxL.js","assets/index-bzwKmNmT.js","assets/index-osRJRhbk.css","assets/ComplexityVariables-DGiNTgAv.js","assets/lazy-Bzly5yiz.js","assets/CodeBlock-Chara8pD.js","assets/CodeBlock-BdMPWBA3.css","assets/FollowUpSolution-CtMiAVXK.js","assets/FollowUpSolution-BDUG-eyP.css"])))=>i.map(i=>d[i]);
import{c as g,r as h,u as x,j as e,L as f,_ as v}from"./index-bzwKmNmT.js";import{u as w,P as M}from"./ProgrammingLanguageToggle-hpIW7CEH.js";import{u as b}from"./usePersistedOpenSet-Bpab3NSH.js";import{h as k}from"./lazy-Bzly5yiz.js";import{h as S}from"./index-IbZx-HIx.js";import{C as p}from"./CodeBlock-Chara8pD.js";const I=`class MinHeap {
  constructor() {
    this.heap = [];
  }

  get size() {
    return this.heap.length;
  }

  push(value) {
    const heap = this.heap;
    heap.push(value);

    let i = heap.length - 1;

    // Move up until the parent has a smaller or equal distance.
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);

      if (heap[parent][0] <= heap[i][0]) break;

      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  }

  pop() {
    const heap = this.heap;
    if (heap.length === 0) return undefined;

    const min = heap[0];
    const last = heap.pop();

    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;

      // Move down, swapping with the smaller child.
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;

        if (left < heap.length && heap[left][0] < heap[smallest][0]) {
          smallest = left;
        }

        if (right < heap.length && heap[right][0] < heap[smallest][0]) {
          smallest = right;
        }

        if (smallest === i) break;

        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      }
    }

    return min;
  }
}`,j={name:"Arrays & Hashing",templates:[{id:"hashmap-counter",name:"HashMap Frequency / Lookup",mnemonic:"See it, store it, ask if you've seen it.",pseudocode:`count = {}
for x in arr:
    if f(x) seen in count: answer = combine(answer, count[f(x)])
    count[x] = count.get(x, 0) + 1`,python:`def solve(arr):
    count = {}
    for x in arr:
        # check condition using prior seen counts
        count[x] = count.get(x, 0) + 1
    return count`,javascript:`function solve(arr) {
  const count = new Map();
  for (const x of arr) {
    count.set(x, (count.get(x) || 0) + 1);
  }
  return count;
}`,problemIds:[1929,217,242,1,14,49,27,169,705,706,912,75,347,271,304,238,36,128,122,229,560,41]}],problems:[{id:1929,title:"Concatenation of Array",difficulty:"Easy",url:"https://leetcode.com/problems/concatenation-of-array/"},{id:217,title:"Contains Duplicate",difficulty:"Easy",url:"https://leetcode.com/problems/contains-duplicate/"},{id:242,title:"Valid Anagram",difficulty:"Easy",url:"https://leetcode.com/problems/valid-anagram/"},{id:1,title:"Two Sum",difficulty:"Easy",url:"https://leetcode.com/problems/two-sum/"},{id:14,title:"Longest Common Prefix",difficulty:"Easy",url:"https://leetcode.com/problems/longest-common-prefix/"},{id:49,title:"Group Anagrams",difficulty:"Medium",url:"https://leetcode.com/problems/group-anagrams/"},{id:27,title:"Remove Element",difficulty:"Easy",url:"https://leetcode.com/problems/remove-element/"},{id:169,title:"Majority Element",difficulty:"Easy",url:"https://leetcode.com/problems/majority-element/"},{id:705,title:"Design HashSet",difficulty:"Easy",url:"https://leetcode.com/problems/design-hashset/"},{id:706,title:"Design HashMap",difficulty:"Easy",url:"https://leetcode.com/problems/design-hashmap/"},{id:912,title:"Sort an Array",difficulty:"Medium",url:"https://leetcode.com/problems/sort-an-array/"},{id:75,title:"Sort Colors",difficulty:"Medium",url:"https://leetcode.com/problems/sort-colors/"},{id:347,title:"Top K Frequent Elements",difficulty:"Medium",url:"https://leetcode.com/problems/top-k-frequent-elements/"},{id:271,title:"Encode and Decode Strings",difficulty:"Medium",url:"https://leetcode.com/problems/encode-and-decode-strings/"},{id:304,title:"Range Sum Query 2D Immutable",difficulty:"Medium",url:"https://leetcode.com/problems/range-sum-query-2d-immutable/"},{id:238,title:"Product of Array Except Self",difficulty:"Medium",url:"https://leetcode.com/problems/product-of-array-except-self/"},{id:36,title:"Valid Sudoku",difficulty:"Medium",url:"https://leetcode.com/problems/valid-sudoku/"},{id:128,title:"Longest Consecutive Sequence",difficulty:"Medium",url:"https://leetcode.com/problems/longest-consecutive-sequence/"},{id:122,title:"Best Time to Buy And Sell Stock II",difficulty:"Medium",url:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/"},{id:229,title:"Majority Element II",difficulty:"Medium",url:"https://leetcode.com/problems/majority-element-ii/"},{id:560,title:"Subarray Sum Equals K",difficulty:"Medium",url:"https://leetcode.com/problems/subarray-sum-equals-k/"},{id:41,title:"First Missing Positive",difficulty:"Hard",url:"https://leetcode.com/problems/first-missing-positive/"}]},E={name:"Two Pointers",templates:[{id:"converging-pointers",name:"Converging Two Pointers",mnemonic:"Two ends walk inward based on the sum/condition.",pseudocode:`left, right = 0, n-1
while left < right:
    if condition(arr[left], arr[right]) is good: record; move both
    elif too small: left += 1
    else: right -= 1`,python:`def solve(arr):
    arr.sort()
    left, right = 0, len(arr) - 1
    while left < right:
        total = arr[left] + arr[right]
        if total == target:
            return [left, right]
        elif total < target:
            left += 1
        else:
            right -= 1
    return []`,javascript:`function solve(arr, target) {
  arr.sort((a, b) => a - b);
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const total = arr[left] + arr[right];
    if (total === target) return [left, right];
    else if (total < target) left++;
    else right--;
  }
  return [];
}`,problemIds:[344,125,680,1768,88,26,167,15,18,189,11,881,42]}],problems:[{id:344,title:"Reverse String",difficulty:"Easy",url:"https://leetcode.com/problems/reverse-string/"},{id:125,title:"Valid Palindrome",difficulty:"Easy",url:"https://leetcode.com/problems/valid-palindrome/"},{id:680,title:"Valid Palindrome II",difficulty:"Easy",url:"https://leetcode.com/problems/valid-palindrome-ii/"},{id:1768,title:"Merge Strings Alternately",difficulty:"Easy",url:"https://leetcode.com/problems/merge-strings-alternately/"},{id:88,title:"Merge Sorted Array",difficulty:"Easy",url:"https://leetcode.com/problems/merge-sorted-array/"},{id:26,title:"Remove Duplicates From Sorted Array",difficulty:"Easy",url:"https://leetcode.com/problems/remove-duplicates-from-sorted-array/"},{id:167,title:"Two Sum II Input Array Is Sorted",difficulty:"Medium",url:"https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/"},{id:15,title:"3Sum",difficulty:"Medium",url:"https://leetcode.com/problems/3sum/"},{id:18,title:"4Sum",difficulty:"Medium",url:"https://leetcode.com/problems/4sum/"},{id:189,title:"Rotate Array",difficulty:"Medium",url:"https://leetcode.com/problems/rotate-array/"},{id:11,title:"Container With Most Water",difficulty:"Medium",url:"https://leetcode.com/problems/container-with-most-water/"},{id:881,title:"Boats to Save People",difficulty:"Medium",url:"https://leetcode.com/problems/boats-to-save-people/"},{id:42,title:"Trapping Rain Water",difficulty:"Hard",url:"https://leetcode.com/problems/trapping-rain-water/"}]},T={name:"Sliding Window",templates:[{id:"variable-window",name:"Variable-Size Sliding Window",mnemonic:"Expand right → shrink left while invalid → record.",pseudocode:`left = 0; state = empty
for right in 0..n-1:
    add arr[right] to state
    while state INVALID:
        remove arr[left] from state; left += 1
    update answer with window [left..right]`,python:`def sliding_window(arr):
    state = {}
    left = 0
    best = 0
    for right, x in enumerate(arr):
        state[x] = state.get(x, 0) + 1
        while invalid(state):
            state[arr[left]] -= 1
            if state[arr[left]] == 0:
                del state[arr[left]]
            left += 1
        best = max(best, right - left + 1)
    return best`,javascript:`function slidingWindow(arr) {
  const state = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < arr.length; right++) {
    state.set(arr[right], (state.get(arr[right]) || 0) + 1);
    while (invalid(state)) {
      state.set(arr[left], state.get(arr[left]) - 1);
      if (state.get(arr[left]) === 0) state.delete(arr[left]);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,problemIds:[219,121,3,424,567,209,658,76,239]}],problems:[{id:219,title:"Contains Duplicate II",difficulty:"Easy",url:"https://leetcode.com/problems/contains-duplicate-ii/"},{id:121,title:"Best Time to Buy And Sell Stock",difficulty:"Easy",url:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"},{id:3,title:"Longest Substring Without Repeating Characters",difficulty:"Medium",url:"https://leetcode.com/problems/longest-substring-without-repeating-characters/",solution:{explanation:"Invalid = any char count > 1. Expand right, shrink left while the incoming char repeats.",python:`def lengthOfLongestSubstring(s: str) -> int:
    seen = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        seen[ch] = seen.get(ch, 0) + 1
        while seen[ch] > 1:
            seen[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,javascript:`function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    seen.set(ch, (seen.get(ch) || 0) + 1);
    while (seen.get(ch) > 1) {
      seen.set(s[left], seen.get(s[left]) - 1);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`}},{id:424,title:"Longest Repeating Character Replacement",difficulty:"Medium",url:"https://leetcode.com/problems/longest-repeating-character-replacement/"},{id:567,title:"Permutation In String",difficulty:"Medium",url:"https://leetcode.com/problems/permutation-in-string/"},{id:209,title:"Minimum Size Subarray Sum",difficulty:"Medium",url:"https://leetcode.com/problems/minimum-size-subarray-sum/"},{id:658,title:"Find K Closest Elements",difficulty:"Medium",url:"https://leetcode.com/problems/find-k-closest-elements/"},{id:76,title:"Minimum Window Substring",difficulty:"Hard",url:"https://leetcode.com/problems/minimum-window-substring/"},{id:239,title:"Sliding Window Maximum",difficulty:"Hard",url:"https://leetcode.com/problems/sliding-window-maximum/"}]},C={name:"Stack",templates:[{id:"monotonic-stack",name:"Monotonic Stack",mnemonic:"Push small, pop when the newcomer breaks the trend.",pseudocode:`stack = []
for i, x in enumerate(arr):
    while stack and stack.top is worse than x:
        prev = stack.pop()
        answer[prev] = x  # x is the 'next greater' for prev
    stack.push(i)`,python:`def solve(arr):
    stack = []
    answer = [-1] * len(arr)
    for i, x in enumerate(arr):
        while stack and arr[stack[-1]] < x:
            answer[stack.pop()] = x
        stack.append(i)
    return answer`,javascript:`function solve(arr) {
  const stack = [];
  const answer = Array(arr.length).fill(-1);
  for (let i = 0; i < arr.length; i++) {
    while (stack.length && arr[stack[stack.length - 1]] < arr[i]) {
      answer[stack.pop()] = arr[i];
    }
    stack.push(i);
  }
  return answer;
}`,problemIds:[682,20,225,232,155,150,735,739,901,853,71,394,895,84]}],problems:[{id:682,title:"Baseball Game",difficulty:"Easy",url:"https://leetcode.com/problems/baseball-game/"},{id:20,title:"Valid Parentheses",difficulty:"Easy",url:"https://leetcode.com/problems/valid-parentheses/"},{id:225,title:"Implement Stack Using Queues",difficulty:"Easy",url:"https://leetcode.com/problems/implement-stack-using-queues/"},{id:232,title:"Implement Queue using Stacks",difficulty:"Easy",url:"https://leetcode.com/problems/implement-queue-using-stacks/"},{id:155,title:"Min Stack",difficulty:"Medium",url:"https://leetcode.com/problems/min-stack/"},{id:150,title:"Evaluate Reverse Polish Notation",difficulty:"Medium",url:"https://leetcode.com/problems/evaluate-reverse-polish-notation/"},{id:735,title:"Asteroid Collision",difficulty:"Medium",url:"https://leetcode.com/problems/asteroid-collision/"},{id:739,title:"Daily Temperatures",difficulty:"Medium",url:"https://leetcode.com/problems/daily-temperatures/"},{id:901,title:"Online Stock Span",difficulty:"Medium",url:"https://leetcode.com/problems/online-stock-span/"},{id:853,title:"Car Fleet",difficulty:"Medium",url:"https://leetcode.com/problems/car-fleet/"},{id:71,title:"Simplify Path",difficulty:"Medium",url:"https://leetcode.com/problems/simplify-path/"},{id:394,title:"Decode String",difficulty:"Medium",url:"https://leetcode.com/problems/decode-string/"},{id:895,title:"Maximum Frequency Stack",difficulty:"Hard",url:"https://leetcode.com/problems/maximum-frequency-stack/"},{id:84,title:"Largest Rectangle In Histogram",difficulty:"Hard",url:"https://leetcode.com/problems/largest-rectangle-in-histogram/"}]},P={name:"Binary Search",templates:[{id:"binary-search-answer",name:"Binary Search (on index or answer)",mnemonic:"Halve the space until the condition flips.",pseudocode:`lo, hi = bounds
while lo < hi:
    mid = (lo + hi) // 2
    if feasible(mid):
        hi = mid    # shrink toward smaller valid answer
    else:
        lo = mid + 1
return lo`,python:`def solve(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,javascript:`function solve(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,problemIds:[704,35,374,69,74,875,1011,153,33,81,981,410,4,1095]}],problems:[{id:704,title:"Binary Search",difficulty:"Easy",url:"https://leetcode.com/problems/binary-search/"},{id:35,title:"Search Insert Position",difficulty:"Easy",url:"https://leetcode.com/problems/search-insert-position/"},{id:374,title:"Guess Number Higher Or Lower",difficulty:"Easy",url:"https://leetcode.com/problems/guess-number-higher-or-lower/"},{id:69,title:"Sqrt(x)",difficulty:"Easy",url:"https://leetcode.com/problems/sqrtx/"},{id:74,title:"Search a 2D Matrix",difficulty:"Medium",url:"https://leetcode.com/problems/search-a-2d-matrix/"},{id:875,title:"Koko Eating Bananas",difficulty:"Medium",url:"https://leetcode.com/problems/koko-eating-bananas/"},{id:1011,title:"Capacity to Ship Packages Within D Days",difficulty:"Medium",url:"https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/"},{id:153,title:"Find Minimum In Rotated Sorted Array",difficulty:"Medium",url:"https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/"},{id:33,title:"Search In Rotated Sorted Array",difficulty:"Medium",url:"https://leetcode.com/problems/search-in-rotated-sorted-array/"},{id:81,title:"Search In Rotated Sorted Array II",difficulty:"Medium",url:"https://leetcode.com/problems/search-in-rotated-sorted-array-ii/"},{id:981,title:"Time Based Key Value Store",difficulty:"Medium",url:"https://leetcode.com/problems/time-based-key-value-store/"},{id:410,title:"Split Array Largest Sum",difficulty:"Hard",url:"https://leetcode.com/problems/split-array-largest-sum/"},{id:4,title:"Median of Two Sorted Arrays",difficulty:"Hard",url:"https://leetcode.com/problems/median-of-two-sorted-arrays/"},{id:1095,title:"Find in Mountain Array",difficulty:"Hard",url:"https://leetcode.com/problems/find-in-mountain-array/"}]},N={name:"Linked List",templates:[{id:"dummy-two-pointer",name:"Dummy Head + Prev/Curr Pointers",mnemonic:"Dummy head, walk with prev and curr, rewire.",pseudocode:`dummy -> head
prev, curr = dummy, head
while curr:
    # decide to keep, skip, or reverse
    prev.next = curr (or new node)
    prev, curr = prev.next, curr.next
return dummy.next`,python:`def reverse_list(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev, curr = curr, nxt
    return prev`,javascript:`function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  return prev;
}`,problemIds:[206,21,141,143,19,138,2,287,92,622,146,460,23,25]}],problems:[{id:206,title:"Reverse Linked List",difficulty:"Easy",url:"https://leetcode.com/problems/reverse-linked-list/"},{id:21,title:"Merge Two Sorted Lists",difficulty:"Easy",url:"https://leetcode.com/problems/merge-two-sorted-lists/"},{id:141,title:"Linked List Cycle",difficulty:"Easy",url:"https://leetcode.com/problems/linked-list-cycle/"},{id:143,title:"Reorder List",difficulty:"Medium",url:"https://leetcode.com/problems/reorder-list/"},{id:19,title:"Remove Nth Node From End of List",difficulty:"Medium",url:"https://leetcode.com/problems/remove-nth-node-from-end-of-list/"},{id:138,title:"Copy List With Random Pointer",difficulty:"Medium",url:"https://leetcode.com/problems/copy-list-with-random-pointer/"},{id:2,title:"Add Two Numbers",difficulty:"Medium",url:"https://leetcode.com/problems/add-two-numbers/"},{id:287,title:"Find The Duplicate Number",difficulty:"Medium",url:"https://leetcode.com/problems/find-the-duplicate-number/"},{id:92,title:"Reverse Linked List II",difficulty:"Medium",url:"https://leetcode.com/problems/reverse-linked-list-ii/"},{id:622,title:"Design Circular Queue",difficulty:"Medium",url:"https://leetcode.com/problems/design-circular-queue/"},{id:146,title:"LRU Cache",difficulty:"Medium",url:"https://leetcode.com/problems/lru-cache/"},{id:460,title:"LFU Cache",difficulty:"Hard",url:"https://leetcode.com/problems/lfu-cache/"},{id:23,title:"Merge K Sorted Lists",difficulty:"Hard",url:"https://leetcode.com/problems/merge-k-sorted-lists/"},{id:25,title:"Reverse Nodes In K Group",difficulty:"Hard",url:"https://leetcode.com/problems/reverse-nodes-in-k-group/"}]},_={name:"Trees",templates:[{id:"dfs-recurse",name:"DFS Recursion (solve left, solve right, combine)",mnemonic:"Solve left, solve right, combine at the root.",pseudocode:`def dfs(node):
    if not node: return base
    left = dfs(node.left)
    right = dfs(node.right)
    return combine(node.val, left, right)`,python:`def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,javascript:`function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,problemIds:[94,144,145,226,104,543,110,100,572,235,701,450,102,199,427,1448,98,230,105,337,1325,124,297]}],problems:[{id:94,title:"Binary Tree Inorder Traversal",difficulty:"Easy",url:"https://leetcode.com/problems/binary-tree-inorder-traversal/"},{id:144,title:"Binary Tree Preorder Traversal",difficulty:"Easy",url:"https://leetcode.com/problems/binary-tree-preorder-traversal/"},{id:145,title:"Binary Tree Postorder Traversal",difficulty:"Easy",url:"https://leetcode.com/problems/binary-tree-postorder-traversal/"},{id:226,title:"Invert Binary Tree",difficulty:"Easy",url:"https://leetcode.com/problems/invert-binary-tree/"},{id:104,title:"Maximum Depth of Binary Tree",difficulty:"Easy",url:"https://leetcode.com/problems/maximum-depth-of-binary-tree/"},{id:543,title:"Diameter of Binary Tree",difficulty:"Easy",url:"https://leetcode.com/problems/diameter-of-binary-tree/"},{id:110,title:"Balanced Binary Tree",difficulty:"Easy",url:"https://leetcode.com/problems/balanced-binary-tree/"},{id:100,title:"Same Tree",difficulty:"Easy",url:"https://leetcode.com/problems/same-tree/"},{id:572,title:"Subtree of Another Tree",difficulty:"Easy",url:"https://leetcode.com/problems/subtree-of-another-tree/"},{id:235,title:"Lowest Common Ancestor of a Binary Search Tree",difficulty:"Medium",url:"https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/"},{id:701,title:"Insert into a Binary Search Tree",difficulty:"Medium",url:"https://leetcode.com/problems/insert-into-a-binary-search-tree/"},{id:450,title:"Delete Node in a BST",difficulty:"Medium",url:"https://leetcode.com/problems/delete-node-in-a-bst/"},{id:102,title:"Binary Tree Level Order Traversal",difficulty:"Medium",url:"https://leetcode.com/problems/binary-tree-level-order-traversal/"},{id:199,title:"Binary Tree Right Side View",difficulty:"Medium",url:"https://leetcode.com/problems/binary-tree-right-side-view/"},{id:427,title:"Construct Quad Tree",difficulty:"Medium",url:"https://leetcode.com/problems/construct-quad-tree/"},{id:1448,title:"Count Good Nodes In Binary Tree",difficulty:"Medium",url:"https://leetcode.com/problems/count-good-nodes-in-binary-tree/"},{id:98,title:"Validate Binary Search Tree",difficulty:"Medium",url:"https://leetcode.com/problems/validate-binary-search-tree/"},{id:230,title:"Kth Smallest Element In a Bst",difficulty:"Medium",url:"https://leetcode.com/problems/kth-smallest-element-in-a-bst/"},{id:105,title:"Construct Binary Tree From Preorder And Inorder Traversal",difficulty:"Medium",url:"https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/"},{id:337,title:"House Robber III",difficulty:"Medium",url:"https://leetcode.com/problems/house-robber-iii/"},{id:1325,title:"Delete Leaves With a Given Value",difficulty:"Medium",url:"https://leetcode.com/problems/delete-leaves-with-a-given-value/"},{id:124,title:"Binary Tree Maximum Path Sum",difficulty:"Hard",url:"https://leetcode.com/problems/binary-tree-maximum-path-sum/"},{id:297,title:"Serialize And Deserialize Binary Tree",difficulty:"Hard",url:"https://leetcode.com/problems/serialize-and-deserialize-binary-tree/"}]},q={name:"Heap / Priority Queue",reference:{title:"JavaScript Min-Heap",description:`Store numbers in an array. Each parent is smaller than or equal to its children, so the minimum stays at index 0.
Push: add at the end, then move upward.
Pop: remove the minimum, put the last value at the top, then move it downward.`,javascript:`class MinHeap {
    constructor() {
        this.values = [];
    }

    size() {
        return this.values.length;
    }

    peek() {
        return this.values[0];
    }

    swap(a, b) {
        const temp = this.values[a];
        this.values[a] = this.values[b];
        this.values[b] = temp;
    }

    push(value) {
        this.values.push(value);

        let index = this.values.length - 1;

        // Move the new value up.
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);

            if (this.values[parent] <= this.values[index]) break;

            this.swap(parent, index);
            index = parent;
        }
    }

    pop() {
        if (this.values.length === 0) return undefined;

        const smallest = this.values[0];
        const last = this.values.pop();

        if (this.values.length === 0) return smallest;

        this.values[0] = last;

        let index = 0;

        // Move the replacement down.
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;

            let smallestIndex = index;

            if (
                left < this.values.length &&
                this.values[left] < this.values[smallestIndex]
            ) {
                smallestIndex = left;
            }

            if (
                right < this.values.length &&
                this.values[right] < this.values[smallestIndex]
            ) {
                smallestIndex = right;
            }

            if (smallestIndex === index) break;

            this.swap(index, smallestIndex);
            index = smallestIndex;
        }

        return smallest;
    }
}`,usage:`const heap = new MinHeap();

heap.push(5);
heap.push(1);
heap.push(3);

heap.peek(); // 1 — stays in the heap

heap.pop();  // 1
heap.pop();  // 3
heap.pop();  // 5
heap.pop();  // undefined — empty
heap.size(); // 0`,complexity:"push / pop: O(log n) · peek / size: O(1) · space: O(n)"},templates:[{id:"top-k-heap",name:"Top-K with Min-Heap",mnemonic:"Keep the best K on the heap, evict the worst.",pseudocode:`heap = []
for x in arr:
    heappush(heap, x)
    if len(heap) > k:
        heappop(heap)   # drop worst, keep K best
return heap`,python:`import heapq
def top_k(arr, k):
    heap = []
    for x in arr:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap`,javascript:`// Use a MinHeap class or simulate with sorted insertion.
function topK(arr, k) {
  const heap = []; // behaves like min-heap via manual sift
  for (const x of arr) {
    heap.push(x);
    heap.sort((a, b) => a - b);
    if (heap.length > k) heap.shift();
  }
  return heap;
}`,problemIds:[703,1046,973,215,621,355,1834,767,1405,1094,295,502]}],problems:[{id:703,title:"Kth Largest Element In a Stream",difficulty:"Easy",url:"https://leetcode.com/problems/kth-largest-element-in-a-stream/"},{id:1046,title:"Last Stone Weight",difficulty:"Easy",url:"https://leetcode.com/problems/last-stone-weight/"},{id:973,title:"K Closest Points to Origin",difficulty:"Medium",url:"https://leetcode.com/problems/k-closest-points-to-origin/"},{id:215,title:"Kth Largest Element In An Array",difficulty:"Medium",url:"https://leetcode.com/problems/kth-largest-element-in-an-array/"},{id:621,title:"Task Scheduler",difficulty:"Medium",url:"https://leetcode.com/problems/task-scheduler/"},{id:355,title:"Design Twitter",difficulty:"Medium",url:"https://leetcode.com/problems/design-twitter/"},{id:1834,title:"Single Threaded CPU",difficulty:"Medium",url:"https://leetcode.com/problems/single-threaded-cpu/"},{id:767,title:"Reorganize String",difficulty:"Medium",url:"https://leetcode.com/problems/reorganize-string/"},{id:1405,title:"Longest Happy String",difficulty:"Medium",url:"https://leetcode.com/problems/longest-happy-string/"},{id:1094,title:"Car Pooling",difficulty:"Medium",url:"https://leetcode.com/problems/car-pooling/"},{id:295,title:"Find Median From Data Stream",difficulty:"Hard",url:"https://leetcode.com/problems/find-median-from-data-stream/"},{id:502,title:"IPO",difficulty:"Hard",url:"https://leetcode.com/problems/ipo/"}]},H={name:"Backtracking",templates:[{id:"choose-recurse-unchoose",name:"Choose / Recurse / Unchoose",mnemonic:"Pick it, go deeper, undo before the next pick.",pseudocode:`def backtrack(path, choices):
    if base_case(path):
        record(path); return
    for choice in choices:
        if valid(choice, path):
            path.append(choice)         # choose
            backtrack(path, next_choices)   # recurse
            path.pop()                  # unchoose`,python:`def subsets(nums):
    result = []
    path = []
    def backtrack(start):
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1)
            path.pop()
    backtrack(0)
    return result`,javascript:`function subsets(nums) {
  const result = [];
  const path = [];
  function backtrack(start) {
    result.push([...path]);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1);
      path.pop();
    }
  }
  backtrack(0);
  return result;
}`,problemIds:[1863,78,39,40,77,46,90,47,22,79,131,17,473,698,51,52,140]}],problems:[{id:1863,title:"Sum of All Subsets XOR Total",difficulty:"Easy",url:"https://leetcode.com/problems/sum-of-all-subset-xor-totals/"},{id:78,title:"Subsets",difficulty:"Medium",url:"https://leetcode.com/problems/subsets/"},{id:39,title:"Combination Sum",difficulty:"Medium",url:"https://leetcode.com/problems/combination-sum/"},{id:40,title:"Combination Sum II",difficulty:"Medium",url:"https://leetcode.com/problems/combination-sum-ii/"},{id:77,title:"Combinations",difficulty:"Medium",url:"https://leetcode.com/problems/combinations/"},{id:46,title:"Permutations",difficulty:"Medium",url:"https://leetcode.com/problems/permutations/"},{id:90,title:"Subsets II",difficulty:"Medium",url:"https://leetcode.com/problems/subsets-ii/"},{id:47,title:"Permutations II",difficulty:"Medium",url:"https://leetcode.com/problems/permutations-ii/"},{id:22,title:"Generate Parentheses",difficulty:"Medium",url:"https://leetcode.com/problems/generate-parentheses/"},{id:79,title:"Word Search",difficulty:"Medium",url:"https://leetcode.com/problems/word-search/"},{id:131,title:"Palindrome Partitioning",difficulty:"Medium",url:"https://leetcode.com/problems/palindrome-partitioning/"},{id:17,title:"Letter Combinations of a Phone Number",difficulty:"Medium",url:"https://leetcode.com/problems/letter-combinations-of-a-phone-number/"},{id:473,title:"Matchsticks to Square",difficulty:"Medium",url:"https://leetcode.com/problems/matchsticks-to-square/"},{id:698,title:"Partition to K Equal Sum Subsets",difficulty:"Medium",url:"https://leetcode.com/problems/partition-to-k-equal-sum-subsets/"},{id:51,title:"N Queens",difficulty:"Hard",url:"https://leetcode.com/problems/n-queens/"},{id:52,title:"N Queens II",difficulty:"Hard",url:"https://leetcode.com/problems/n-queens-ii/"},{id:140,title:"Word Break II",difficulty:"Hard",url:"https://leetcode.com/problems/word-break-ii/"}]},L={name:"Tries",templates:[{id:"trie-insert-search",name:"Trie Insert / Search",mnemonic:"Walk character by character, branch on need.",pseudocode:`class Trie:
    root = {'end': False, 'kids': {}}
    def insert(word):
        node = root
        for c in word:
            node = node.kids.setdefault(c, new_node)
        node.end = True`,python:`class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, word):
        node = self.root
        for c in word:
            node = node.setdefault(c, {})
        node['$'] = True
    def search(self, word):
        node = self.root
        for c in word:
            if c not in node:
                return False
            node = node[c]
        return '$' in node`,javascript:`class Trie {
  constructor() { this.root = {}; }
  insert(word) {
    let node = this.root;
    for (const c of word) {
      if (!node[c]) node[c] = {};
      node = node[c];
    }
    node.$ = true;
  }
  search(word) {
    let node = this.root;
    for (const c of word) {
      if (!node[c]) return false;
      node = node[c];
    }
    return !!node.$;
  }
}`,problemIds:[208,211,2707,212]}],problems:[{id:208,title:"Implement Trie Prefix Tree",difficulty:"Medium",url:"https://leetcode.com/problems/implement-trie-prefix-tree/"},{id:211,title:"Design Add And Search Words Data Structure",difficulty:"Medium",url:"https://leetcode.com/problems/design-add-and-search-words-data-structure/"},{id:2707,title:"Extra Characters in a String",difficulty:"Medium",url:"https://leetcode.com/problems/extra-characters-in-a-string/"},{id:212,title:"Word Search II",difficulty:"Hard",url:"https://leetcode.com/problems/word-search-ii/"}]},D={name:"Graphs",templates:[{id:"bfs-grid",name:"BFS on Grid / Graph",mnemonic:"Queue, mark visited, expand neighbors.",pseudocode:`queue = [start]
seen = {start}
while queue:
    node = queue.popleft()
    for nb in neighbors(node):
        if nb not in seen:
            seen.add(nb); queue.append(nb)`,python:`from collections import deque
def bfs(grid, start):
    q = deque([start])
    seen = {start}
    while q:
        r, c = q.popleft()
        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            nr, nc = r+dr, c+dc
            if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and (nr,nc) not in seen:
                seen.add((nr,nc))
                q.append((nr,nc))
    return seen`,javascript:`function bfs(grid, start) {
  const q = [start];
  const seen = new Set([start.join(',')]);
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while (q.length) {
    const [r, c] = q.shift();
    for (const [dr, dc] of dirs) {
      const nr = r+dr, nc = c+dc;
      const key = nr+','+nc;
      if (nr>=0 && nr<grid.length && nc>=0 && nc<grid[0].length && !seen.has(key)) {
        seen.add(key);
        q.push([nr, nc]);
      }
    }
  }
  return seen;
}`,problemIds:[463,953,997,200,695,133,286,994,417,130,752,207,210,261,1462,323,684,721,399,310,127]}],problems:[{id:463,title:"Island Perimeter",difficulty:"Easy",url:"https://leetcode.com/problems/island-perimeter/"},{id:953,title:"Verifying An Alien Dictionary",difficulty:"Easy",url:"https://leetcode.com/problems/verifying-an-alien-dictionary/"},{id:997,title:"Find the Town Judge",difficulty:"Easy",url:"https://leetcode.com/problems/find-the-town-judge/"},{id:200,title:"Number of Islands",difficulty:"Medium",url:"https://leetcode.com/problems/number-of-islands/"},{id:695,title:"Max Area of Island",difficulty:"Medium",url:"https://leetcode.com/problems/max-area-of-island/"},{id:133,title:"Clone Graph",difficulty:"Medium",url:"https://leetcode.com/problems/clone-graph/"},{id:286,title:"Walls And Gates",difficulty:"Medium",url:"https://leetcode.com/problems/walls-and-gates/"},{id:994,title:"Rotting Oranges",difficulty:"Medium",url:"https://leetcode.com/problems/rotting-oranges/"},{id:417,title:"Pacific Atlantic Water Flow",difficulty:"Medium",url:"https://leetcode.com/problems/pacific-atlantic-water-flow/"},{id:130,title:"Surrounded Regions",difficulty:"Medium",url:"https://leetcode.com/problems/surrounded-regions/"},{id:752,title:"Open The Lock",difficulty:"Medium",url:"https://leetcode.com/problems/open-the-lock/"},{id:207,title:"Course Schedule",difficulty:"Medium",url:"https://leetcode.com/problems/course-schedule/"},{id:210,title:"Course Schedule II",difficulty:"Medium",url:"https://leetcode.com/problems/course-schedule-ii/"},{id:261,title:"Graph Valid Tree",difficulty:"Medium",url:"https://leetcode.com/problems/graph-valid-tree/"},{id:1462,title:"Course Schedule IV",difficulty:"Medium",url:"https://leetcode.com/problems/course-schedule-iv/"},{id:323,title:"Number of Connected Components In An Undirected Graph",difficulty:"Medium",url:"https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/"},{id:684,title:"Redundant Connection",difficulty:"Medium",url:"https://leetcode.com/problems/redundant-connection/"},{id:721,title:"Accounts Merge",difficulty:"Medium",url:"https://leetcode.com/problems/accounts-merge/"},{id:399,title:"Evaluate Division",difficulty:"Medium",url:"https://leetcode.com/problems/evaluate-division/"},{id:310,title:"Minimum Height Trees",difficulty:"Medium",url:"https://leetcode.com/problems/minimum-height-trees/"},{id:127,title:"Word Ladder",difficulty:"Hard",url:"https://leetcode.com/problems/word-ladder/"}]},A={name:"Advanced Graphs",templates:[{id:"dijkstra",name:"Dijkstra (shortest path, non-negative)",mnemonic:"Always expand the closest unvisited node.",pseudocode:`dist = {start: 0}; heap = [(0, start)]
while heap:
    d, node = heappop(heap)
    if d > dist[node]: continue
    for nb, w in edges(node):
        if d + w < dist.get(nb, inf):
            dist[nb] = d + w
            heappush(heap, (d + w, nb))`,python:`import heapq
def dijkstra(graph, start):
    dist = {start: 0}
    heap = [(0, start)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        for nb, w in graph[node]:
            nd = d + w
            if nd < dist.get(nb, float('inf')):
                dist[nb] = nd
                heapq.heappush(heap, (nd, nb))
    return dist`,javascript:`${I}

// graph[node] = [[neighbor, weight], ...]
// All edge weights must be nonnegative.
function dijkstra(graph, start) {
  const distances = Array(graph.length).fill(Infinity);
  const heap = new MinHeap();

  distances[start] = 0;
  heap.push([0, start]);

  while (heap.size > 0) {
    const [distance, node] = heap.pop();

    // Skip outdated entries with a worse distance than the best known.
    if (distance > distances[node]) continue;

    for (const [neighbor, weight] of graph[node]) {
      const newDistance = distance + weight;

      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        heap.push([newDistance, neighbor]);
      }
    }
  }

  return distances;
}`,reference:{title:"JavaScript Dijkstra with Min-Heap",description:`Find the shortest distance from the starting node to every node. The heap stores [distance, node] pairs and compares their distances directly.
Use node IDs from 0 to graph.length - 1. Each graph[node] contains [neighbor, weight] pairs, and all weights must be nonnegative. Unreachable nodes keep distance Infinity.`,usage:`// Each connection is [neighbor, weight].
const graph = [
  [[1, 4], [2, 1]], // Node 0
  [[3, 1]],        // Node 1
  [[1, 2], [3, 5]], // Node 2
  [],              // Node 3
];

dijkstra(graph, 0);
// [0, 3, 1, 4]
// Shortest distance from node 0 to each node.`,complexity:"Time: O(V + E log(E + 1)) · Extra space: O(V + E). V = nodes, E = edges; the heap can hold older distance entries."},problemIds:[1631,743,332,1584,778,269,787,1489,2392,2709]}],problems:[{id:1631,title:"Path with Minimum Effort",difficulty:"Medium",url:"https://leetcode.com/problems/path-with-minimum-effort/"},{id:743,title:"Network Delay Time",difficulty:"Medium",url:"https://leetcode.com/problems/network-delay-time/"},{id:332,title:"Reconstruct Itinerary",difficulty:"Hard",url:"https://leetcode.com/problems/reconstruct-itinerary/"},{id:1584,title:"Min Cost to Connect All Points",difficulty:"Medium",url:"https://leetcode.com/problems/min-cost-to-connect-all-points/"},{id:778,title:"Swim In Rising Water",difficulty:"Hard",url:"https://leetcode.com/problems/swim-in-rising-water/"},{id:269,title:"Alien Dictionary",difficulty:"Hard",url:"https://leetcode.com/problems/alien-dictionary/"},{id:787,title:"Cheapest Flights Within K Stops",difficulty:"Medium",url:"https://leetcode.com/problems/cheapest-flights-within-k-stops/"},{id:1489,title:"Find Critical and Pseudo Critical Edges in Minimum Spanning Tree",difficulty:"Hard",url:"https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/"},{id:2392,title:"Build a Matrix With Conditions",difficulty:"Hard",url:"https://leetcode.com/problems/build-a-matrix-with-conditions/"},{id:2709,title:"Greatest Common Divisor Traversal",difficulty:"Hard",url:"https://leetcode.com/problems/greatest-common-divisor-traversal/"}]},B={name:"1-D Dynamic Programming",templates:[{id:"1d-dp",name:"Bottom-Up 1D DP",mnemonic:"Today = rule applied to yesterday(s).",pseudocode:`dp = array(n)
dp[0] = base
for i in 1..n-1:
    dp[i] = f(dp[i-1], dp[i-2], ...)
return dp[n-1]`,python:`def climb_stairs(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2
    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]`,javascript:`function climbStairs(n) {
  if (n <= 2) return n;
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  dp[2] = 2;
  for (let i = 3; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
  return dp[n];
}`,problemIds:[70,746,1137,198,213,5,647,91,322,152,139,300,416,377,279,343,1406]}],problems:[{id:70,title:"Climbing Stairs",difficulty:"Easy",url:"https://leetcode.com/problems/climbing-stairs/"},{id:746,title:"Min Cost Climbing Stairs",difficulty:"Easy",url:"https://leetcode.com/problems/min-cost-climbing-stairs/"},{id:1137,title:"N-th Tribonacci Number",difficulty:"Easy",url:"https://leetcode.com/problems/n-th-tribonacci-number/"},{id:198,title:"House Robber",difficulty:"Medium",url:"https://leetcode.com/problems/house-robber/"},{id:213,title:"House Robber II",difficulty:"Medium",url:"https://leetcode.com/problems/house-robber-ii/"},{id:5,title:"Longest Palindromic Substring",difficulty:"Medium",url:"https://leetcode.com/problems/longest-palindromic-substring/"},{id:647,title:"Palindromic Substrings",difficulty:"Medium",url:"https://leetcode.com/problems/palindromic-substrings/"},{id:91,title:"Decode Ways",difficulty:"Medium",url:"https://leetcode.com/problems/decode-ways/"},{id:322,title:"Coin Change",difficulty:"Medium",url:"https://leetcode.com/problems/coin-change/"},{id:152,title:"Maximum Product Subarray",difficulty:"Medium",url:"https://leetcode.com/problems/maximum-product-subarray/"},{id:139,title:"Word Break",difficulty:"Medium",url:"https://leetcode.com/problems/word-break/"},{id:300,title:"Longest Increasing Subsequence",difficulty:"Medium",url:"https://leetcode.com/problems/longest-increasing-subsequence/"},{id:416,title:"Partition Equal Subset Sum",difficulty:"Medium",url:"https://leetcode.com/problems/partition-equal-subset-sum/"},{id:377,title:"Combination Sum IV",difficulty:"Medium",url:"https://leetcode.com/problems/combination-sum-iv/"},{id:279,title:"Perfect Squares",difficulty:"Medium",url:"https://leetcode.com/problems/perfect-squares/"},{id:343,title:"Integer Break",difficulty:"Medium",url:"https://leetcode.com/problems/integer-break/"},{id:1406,title:"Stone Game III",difficulty:"Hard",url:"https://leetcode.com/problems/stone-game-iii/"}]},R={name:"2-D Dynamic Programming",templates:[{id:"2d-dp",name:"Bottom-Up 2D DP",mnemonic:"Cell = rule applied to neighbors above and left.",pseudocode:`dp[i][j] = f(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
fill row by row, column by column
return dp[m-1][n-1]`,python:`def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[-1][-1]`,javascript:`function uniquePaths(m, n) {
  const dp = Array(m)
    .fill(null)
    .map(() => new Array(n).fill(1));
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      dp[i][j] = dp[i-1][j] + dp[i][j-1];
  return dp[m-1][n-1];
}`,problemIds:[62,63,64,1143,1049,309,518,494,97,877,1140,329,115,72,312,10]}],problems:[{id:62,title:"Unique Paths",difficulty:"Medium",url:"https://leetcode.com/problems/unique-paths/"},{id:63,title:"Unique Paths II",difficulty:"Medium",url:"https://leetcode.com/problems/unique-paths-ii/"},{id:64,title:"Minimum Path Sum",difficulty:"Medium",url:"https://leetcode.com/problems/minimum-path-sum/"},{id:1143,title:"Longest Common Subsequence",difficulty:"Medium",url:"https://leetcode.com/problems/longest-common-subsequence/"},{id:1049,title:"Last Stone Weight II",difficulty:"Medium",url:"https://leetcode.com/problems/last-stone-weight-ii/"},{id:309,title:"Best Time to Buy And Sell Stock With Cooldown",difficulty:"Medium",url:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/"},{id:518,title:"Coin Change II",difficulty:"Medium",url:"https://leetcode.com/problems/coin-change-ii/"},{id:494,title:"Target Sum",difficulty:"Medium",url:"https://leetcode.com/problems/target-sum/"},{id:97,title:"Interleaving String",difficulty:"Medium",url:"https://leetcode.com/problems/interleaving-string/"},{id:877,title:"Stone Game",difficulty:"Medium",url:"https://leetcode.com/problems/stone-game/"},{id:1140,title:"Stone Game II",difficulty:"Medium",url:"https://leetcode.com/problems/stone-game-ii/"},{id:329,title:"Longest Increasing Path In a Matrix",difficulty:"Hard",url:"https://leetcode.com/problems/longest-increasing-path-in-a-matrix/"},{id:115,title:"Distinct Subsequences",difficulty:"Hard",url:"https://leetcode.com/problems/distinct-subsequences/"},{id:72,title:"Edit Distance",difficulty:"Medium",url:"https://leetcode.com/problems/edit-distance/"},{id:312,title:"Burst Balloons",difficulty:"Hard",url:"https://leetcode.com/problems/burst-balloons/"},{id:10,title:"Regular Expression Matching",difficulty:"Hard",url:"https://leetcode.com/problems/regular-expression-matching/"}]},O={name:"Greedy",templates:[{id:"sort-and-scan",name:"Sort + Single Pass",mnemonic:"Sort by the right key, then take what fits.",pseudocode:`sort arr by key
for x in arr:
    if x fits with current state:
        take(x)
    else:
        skip or reset`,python:`def jump_game(nums):
    reach = 0
    for i, x in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + x)
    return True`,javascript:`function jumpGame(nums) {
  let reach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}`,problemIds:[860,53,918,978,55,45,1871,134,846,649,1899,763,678,135]}],problems:[{id:860,title:"Lemonade Change",difficulty:"Easy",url:"https://leetcode.com/problems/lemonade-change/"},{id:53,title:"Maximum Subarray",difficulty:"Medium",url:"https://leetcode.com/problems/maximum-subarray/"},{id:918,title:"Maximum Sum Circular Subarray",difficulty:"Medium",url:"https://leetcode.com/problems/maximum-sum-circular-subarray/"},{id:978,title:"Longest Turbulent Subarray",difficulty:"Medium",url:"https://leetcode.com/problems/longest-turbulent-subarray/"},{id:55,title:"Jump Game",difficulty:"Medium",url:"https://leetcode.com/problems/jump-game/"},{id:45,title:"Jump Game II",difficulty:"Medium",url:"https://leetcode.com/problems/jump-game-ii/"},{id:1871,title:"Jump Game VII",difficulty:"Medium",url:"https://leetcode.com/problems/jump-game-vii/"},{id:134,title:"Gas Station",difficulty:"Medium",url:"https://leetcode.com/problems/gas-station/"},{id:846,title:"Hand of Straights",difficulty:"Medium",url:"https://leetcode.com/problems/hand-of-straights/"},{id:649,title:"Dota2 Senate",difficulty:"Medium",url:"https://leetcode.com/problems/dota2-senate/"},{id:1899,title:"Merge Triplets to Form Target Triplet",difficulty:"Medium",url:"https://leetcode.com/problems/merge-triplets-to-form-target-triplet/"},{id:763,title:"Partition Labels",difficulty:"Medium",url:"https://leetcode.com/problems/partition-labels/"},{id:678,title:"Valid Parenthesis String",difficulty:"Medium",url:"https://leetcode.com/problems/valid-parenthesis-string/"},{id:135,title:"Candy",difficulty:"Hard",url:"https://leetcode.com/problems/candy/"}]},W={name:"Intervals",templates:[{id:"sort-and-merge",name:"Sort by Start → Merge Overlaps",mnemonic:"Sort, then merge if next.start <= current.end.",pseudocode:`sort intervals by start
merged = [intervals[0]]
for iv in intervals[1:]:
    if iv.start <= merged[-1].end:
        merged[-1].end = max(merged[-1].end, iv.end)
    else:
        merged.append(iv)`,python:`def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,javascript:`function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const [s, e] = intervals[i];
    if (s <= merged[merged.length-1][1]) {
      merged[merged.length-1][1] = Math.max(merged[merged.length-1][1], e);
    } else {
      merged.push([s, e]);
    }
  }
  return merged;
}`,problemIds:[57,56,435,252,253,2402,1851]}],problems:[{id:57,title:"Insert Interval",difficulty:"Medium",url:"https://leetcode.com/problems/insert-interval/"},{id:56,title:"Merge Intervals",difficulty:"Medium",url:"https://leetcode.com/problems/merge-intervals/"},{id:435,title:"Non Overlapping Intervals",difficulty:"Medium",url:"https://leetcode.com/problems/non-overlapping-intervals/"},{id:252,title:"Meeting Rooms",difficulty:"Easy",url:"https://leetcode.com/problems/meeting-rooms/"},{id:253,title:"Meeting Rooms II",difficulty:"Medium",url:"https://leetcode.com/problems/meeting-rooms-ii/"},{id:2402,title:"Meeting Rooms III",difficulty:"Hard",url:"https://leetcode.com/problems/meeting-rooms-iii/"},{id:1851,title:"Minimum Interval to Include Each Query",difficulty:"Hard",url:"https://leetcode.com/problems/minimum-interval-to-include-each-query/"}]},F={name:"Math & Geometry",templates:[{id:"matrix-inplace",name:"Matrix In-Place Transformation",mnemonic:"Transpose, then reverse — or walk in layers.",pseudocode:`# rotate 90 clockwise
transpose(matrix)
reverse each row`,python:`def rotate(matrix):
    n = len(matrix)
    # transpose
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # reverse each row
    for row in matrix:
        row.reverse()`,javascript:`function rotate(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
  for (const row of matrix) row.reverse();
}`,problemIds:[168,1071,2807,867,48,54,73,202,66,13,50,43,2013]}],problems:[{id:168,title:"Excel Sheet Column Title",difficulty:"Easy",url:"https://leetcode.com/problems/excel-sheet-column-title/"},{id:1071,title:"Greatest Common Divisor of Strings",difficulty:"Easy",url:"https://leetcode.com/problems/greatest-common-divisor-of-strings/"},{id:2807,title:"Insert Greatest Common Divisors in Linked List",difficulty:"Medium",url:"https://leetcode.com/problems/insert-greatest-common-divisors-in-linked-list/"},{id:867,title:"Transpose Matrix",difficulty:"Easy",url:"https://leetcode.com/problems/transpose-matrix/"},{id:48,title:"Rotate Image",difficulty:"Medium",url:"https://leetcode.com/problems/rotate-image/"},{id:54,title:"Spiral Matrix",difficulty:"Medium",url:"https://leetcode.com/problems/spiral-matrix/"},{id:73,title:"Set Matrix Zeroes",difficulty:"Medium",url:"https://leetcode.com/problems/set-matrix-zeroes/"},{id:202,title:"Happy Number",difficulty:"Easy",url:"https://leetcode.com/problems/happy-number/"},{id:66,title:"Plus One",difficulty:"Easy",url:"https://leetcode.com/problems/plus-one/"},{id:13,title:"Roman to Integer",difficulty:"Easy",url:"https://leetcode.com/problems/roman-to-integer/"},{id:50,title:"Pow(x, n)",difficulty:"Medium",url:"https://leetcode.com/problems/powx-n/"},{id:43,title:"Multiply Strings",difficulty:"Medium",url:"https://leetcode.com/problems/multiply-strings/"},{id:2013,title:"Detect Squares",difficulty:"Medium",url:"https://leetcode.com/problems/detect-squares/"}]},G={name:"Bit Manipulation",templates:[{id:"xor-tricks",name:"XOR Pairs / Bit Counting",mnemonic:"XOR kills pairs. n & (n-1) drops the lowest 1.",pseudocode:`# single number
result = 0
for x in arr: result ^= x
return result

# count bits
while n: count += 1; n &= n - 1`,python:`def single_number(nums):
    result = 0
    for x in nums:
        result ^= x
    return result

def hamming_weight(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count`,javascript:`function singleNumber(nums) {
  let result = 0;
  for (const x of nums) result ^= x;
  return result;
}

function hammingWeight(n) {
  let count = 0;
  while (n) {
    n &= n - 1;
    count++;
  }
  return count;
}`,problemIds:[136,191,338,67,190,268,371,7,201,3133]}],problems:[{id:136,title:"Single Number",difficulty:"Easy",url:"https://leetcode.com/problems/single-number/"},{id:191,title:"Number of 1 Bits",difficulty:"Easy",url:"https://leetcode.com/problems/number-of-1-bits/"},{id:338,title:"Counting Bits",difficulty:"Easy",url:"https://leetcode.com/problems/counting-bits/"},{id:67,title:"Add Binary",difficulty:"Easy",url:"https://leetcode.com/problems/add-binary/"},{id:190,title:"Reverse Bits",difficulty:"Easy",url:"https://leetcode.com/problems/reverse-bits/"},{id:268,title:"Missing Number",difficulty:"Easy",url:"https://leetcode.com/problems/missing-number/"},{id:371,title:"Sum of Two Integers",difficulty:"Medium",url:"https://leetcode.com/problems/sum-of-two-integers/"},{id:7,title:"Reverse Integer",difficulty:"Medium",url:"https://leetcode.com/problems/reverse-integer/"},{id:201,title:"Bitwise AND of Numbers Range",difficulty:"Medium",url:"https://leetcode.com/problems/bitwise-and-of-numbers-range/"},{id:3133,title:"Minimum Array End",difficulty:"Medium",url:"https://leetcode.com/problems/minimum-array-end/"}]},te=[j,E,T,C,P,N,_,q,H,L,D,A,B,R,O,W,F,G],V=h.lazy(()=>v(()=>import("./NeetCodeSolution-C12HLJxL.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8])));function z(t){return t==="Easy"?"text-emerald-400 light:text-emerald-700":t==="Medium"?"text-amber-400 light:text-amber-700":"text-red-400 light:text-red-700"}function K({problem:t,language:r,inApp:s,open:o,onToggle:n}){const d=k(t.id),l=t.solution,a=!!d||!!l;return e.jsxs("div",{className:"neetcode-problem min-w-0 border-b border-gray-800 light:border-gray-200",children:[e.jsxs("div",{className:"w-full flex items-center gap-2 py-3",children:[e.jsxs("span",{className:"text-xs text-gray-500 light:text-gray-500 font-mono w-10 shrink-0",children:["#",t.id]}),e.jsx("button",{type:"button",onClick:a?n:void 0,disabled:!a,"aria-expanded":o,"aria-label":a?o?"Collapse solution":"Expand solution":void 0,className:`flex-1 min-w-0 truncate text-left text-sm transition-colors ${a?"text-gray-200 light:text-gray-800 hover:text-blue-300 light:hover:text-blue-700 cursor-pointer":"text-gray-200 light:text-gray-800 cursor-default"}`,children:t.title}),e.jsx("span",{className:`text-xs font-medium ${z(t.difficulty)}`,children:t.difficulty}),S(t.id)&&e.jsx(f,{to:`/practice/${t.id}`,className:"py-2 text-xs font-medium text-cyan-400 light:text-cyan-700","aria-label":`Practice ${t.title} in ${r==="python"?"Python":"JavaScript"}`,children:"Practice"}),e.jsx("a",{href:t.url,target:"_blank",rel:"noreferrer",className:"text-xs text-blue-400 light:text-blue-700 hover:text-blue-300 light:hover:text-blue-600 underline",title:"Open on LeetCode",children:"LC"}),s?e.jsx(f,{to:`/problem/${t.id}`,className:"text-gray-500 light:text-gray-500 hover:text-gray-200 light:hover:text-gray-800 text-xs w-4 text-right",title:"Open problem page","aria-label":"Open problem page",children:"▸"}):e.jsx("span",{className:"text-[10px] text-gray-600 light:text-gray-500 italic w-4 text-right",children:"—"})]}),o&&a&&e.jsx("div",{className:"neetcode-solution min-w-0 border-t border-gray-800 light:border-gray-200 py-4",children:d?e.jsx(h.Suspense,{fallback:e.jsx("p",{role:"status",className:"text-xs text-gray-400 light:text-gray-600",children:"Loading solution…"}),children:e.jsx(V,{id:t.id,language:r})}):l&&e.jsxs("div",{className:"space-y-3",children:[l.explanation&&e.jsx("p",{className:"text-xs text-gray-400 light:text-gray-600 leading-relaxed",children:l.explanation}),e.jsx(p,{code:r==="python"?l.python:l.javascript,language:r})]})})]})}function y({reference:t,code:r}){return e.jsxs("section",{"aria-label":t.title,className:"min-w-0 space-y-3 pt-3",children:[e.jsx("h3",{className:"text-base font-semibold text-white light:text-gray-900",children:t.title}),e.jsx("p",{className:"text-xs text-gray-300 light:text-gray-700 leading-relaxed whitespace-pre-line",children:t.description}),e.jsx(p,{code:r,language:"javascript"}),e.jsx("h4",{className:"text-sm font-semibold text-white light:text-gray-900",children:"Usage"}),e.jsx(p,{code:t.usage,language:"javascript"}),e.jsx("p",{className:"text-xs text-gray-500 light:text-gray-500",children:t.complexity})]})}function $({template:t,problems:r,language:s,tab:o,setTab:n,inAppIds:d,isProblemOpen:l,onToggleProblem:a}){const c=t.problemIds.map(i=>r.find(u=>u.id===i)).filter(i=>!!i);return e.jsxs("div",{className:"neetcode-template min-w-0",children:[e.jsxs("div",{className:"py-3",children:[e.jsx("h3",{className:"text-base font-semibold text-white light:text-gray-900",children:t.name}),e.jsxs("p",{className:"text-xs text-sky-300 light:text-sky-700 italic mt-1",children:["“",t.mnemonic,"”"]})]}),e.jsx("div",{className:"flex border-b border-gray-800 light:border-gray-200",children:["pseudocode","code"].map(i=>e.jsx("button",{onClick:()=>n(i),"aria-pressed":o===i,className:`flex-1 px-4 py-2 text-xs font-medium capitalize transition-colors ${o===i?"text-blue-400 light:text-blue-700 border-b-2 border-blue-400 bg-blue-950/20 light:bg-blue-50":"text-gray-500 light:text-gray-500 hover:text-gray-300 light:hover:text-gray-700"}`,children:i==="pseudocode"?"Pseudocode (memorize)":s==="python"?"Python":"JavaScript"},i))}),e.jsx("div",{className:"min-w-0 py-3",children:o==="pseudocode"?e.jsx("pre",{tabIndex:0,"aria-label":"Template pseudocode",className:"text-xs text-gray-300 light:text-gray-700 leading-relaxed whitespace-pre overflow-x-auto font-mono bg-gray-950 light:bg-gray-50 border border-gray-800 light:border-gray-200 rounded-md p-2 sm:p-3",children:t.pseudocode}):s==="javascript"&&t.reference?e.jsx(y,{reference:t.reference,code:t.javascript}):e.jsx(p,{code:s==="python"?t.python:t.javascript,language:s})}),e.jsxs("div",{className:"min-w-0 border-t border-gray-800 light:border-gray-200 pt-4",children:[e.jsxs("h4",{className:"text-xs font-semibold text-blue-300 light:text-blue-700 uppercase tracking-wider mb-3",children:["Questions solved by this template (",c.length,")"]}),e.jsx("div",{className:"min-w-0",children:c.map(i=>e.jsx(K,{problem:i,language:s,inApp:d.has(i.id),open:l(i.id),onToggle:()=>a(i.id)},i.id))})]})]})}function U({topic:t,language:r,tab:s,setTab:o,inAppIds:n,expanded:d,onToggle:l,isProblemOpen:a,onToggleProblem:c}){return e.jsxs("div",{className:"neetcode-topic min-w-0",children:[e.jsxs("button",{onClick:l,className:"w-full flex items-center justify-between gap-3 py-3 border-b border-gray-800 light:border-gray-200 hover:bg-gray-800/50 light:hover:bg-gray-100 transition-colors text-left",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-lg font-bold text-white light:text-gray-900",children:t.name}),e.jsxs("p",{className:"text-xs text-gray-500 light:text-gray-500 mt-1",children:[t.templates.length," template",t.templates.length===1?"":"s"," ·"," ",t.problems.length," problem",t.problems.length===1?"":"s"]})]}),e.jsx("svg",{className:`w-4 h-4 text-gray-500 light:text-gray-500 transition-transform ${d?"rotate-180":""}`,fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 9l-7 7-7-7"})})]}),d&&e.jsxs("div",{className:"min-w-0 space-y-6",children:[t.reference&&e.jsx(y,{reference:t.reference,code:t.reference.javascript}),t.templates.map(i=>e.jsx($,{template:i,problems:t.problems,language:r,tab:s,setTab:o,inAppIds:n,isProblemOpen:a,onToggleProblem:c},i.id))]})]})}function ie({topics:t,storagePrefix:r,title:s,description:o}){const[n,d]=w(),[l,a]=g(`${r}-template-tab`,"pseudocode"),c=h.useMemo(()=>new Set(x.map(m=>m.id)),[]),i=b(`${r}-open-topics`),u=b(`${r}-open-problems`);return e.jsxs("div",{className:"neetcode-page min-w-0 space-y-6",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold text-white light:text-gray-900",children:s}),e.jsx("p",{className:"text-gray-400 light:text-gray-600 mt-1 text-sm",children:o}),e.jsx("p",{className:"text-gray-500 light:text-gray-500 mt-1 text-xs",children:"Complexities assume O(1) arithmetic and FIFO queue operations, expected O(1) hash lookups, and amortized O(1) array append."})]}),e.jsx(M,{language:n,setLanguage:d})]}),e.jsx("div",{className:"space-y-3",children:t.map(m=>e.jsx(U,{topic:m,language:n,tab:l==="code"?"code":"pseudocode",setTab:a,inAppIds:c,expanded:i.isOpen(m.name),onToggle:()=>i.toggle(m.name),isProblemOpen:u.isOpen,onToggleProblem:u.toggle},m.name))})]})}export{ie as N,te as n};

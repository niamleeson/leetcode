import { ProblemSolution } from './types';

export const solutions: ProblemSolution[] = [
  // ============================================================
  // LINKED LIST PROBLEMS
  // ============================================================

  // --------------------------------------------------
  // 2. Add Two Numbers
  // --------------------------------------------------
  {
    id: 2,
    description:
      'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each node contains a single digit. Add the two numbers and return the sum as a linked list.',
    examples: `Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
Explanation: 342 + 465 = 807`,
    intuition:
      'Since the digits are already stored in reverse order, we can add them just like we do by hand -- starting from the ones place and carrying over to the next. Walk both lists together, summing digits plus any carry, and build the result node by node.',
    approach:
      'Traverse both lists simultaneously, summing corresponding digits along with a carry. Create new nodes for each digit of the result. Continue until both lists are exhausted and there is no remaining carry.',
    code: `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0)
        current = dummy
        carry = 0

        while l1 or l2 or carry:
            val1 = l1.val if l1 else 0
            val2 = l2.val if l2 else 0
            total = val1 + val2 + carry
            carry = total // 10
            current.next = ListNode(total % 10)
            current = current.next
            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None

        return dummy.next`,
    jsCode: `var addTwoNumbers = function(l1, l2) {
    const dummy = new ListNode(0);
    let current = dummy;
    let carry = 0;

    while (l1 || l2 || carry) {
        const val1 = l1 ? l1.val : 0;
        const val2 = l2 ? l2.val : 0;
        const total = val1 + val2 + carry;
        carry = Math.floor(total / 10);
        current.next = new ListNode(total % 10);
        current = current.next;
        l1 = l1 ? l1.next : null;
        l2 = l2 ? l2.next : null;
    }

    return dummy.next;
};`,
    explanation: `- A dummy head simplifies list construction so we don't special-case the first node.
- Each iteration extracts the values from l1 and l2 (or 0 if that list is exhausted).
- 'total' is the sum of both digits plus the carry from the previous position.
- 'carry' is the tens digit (total // 10), and the new node stores the ones digit (total % 10).
- The loop continues as long as there are digits left in either list or a remaining carry.`,
    timeComplexity: 'O(max(m, n)) where m and n are the lengths of the two lists',
    spaceComplexity: 'O(max(m, n)) for the output list',
    hints: [
      'Think of how you add numbers digit by digit from right to left -- the lists are already in reverse order.',
      'Use a carry variable to handle sums >= 10.',
      'Don\'t forget the final carry -- e.g. 999 + 1 = 1000 produces an extra node.',
    ],
  },

  // --------------------------------------------------
  // 19. Remove Nth Node From End of List
  // --------------------------------------------------
  {
    id: 19,
    description:
      'Given the head of a linked list, remove the nth node from the end of the list and return its head. You must do this in one pass.',
    examples: `Input: head = [1,2,3,4,5], n = 2
Output: [1,2,3,5]
Explanation: The 2nd node from the end is 4, which is removed.`,
    intuition:
      'Imagine two people walking along the list, but one starts n steps ahead. When the leader reaches the end, the follower is exactly at the node before the one to remove. This "fixed gap" trick lets you find the nth-from-end position in a single pass without knowing the list length.',
    approach:
      'Use two pointers separated by n nodes. Advance the fast pointer n steps ahead, then move both pointers together until fast reaches the end. The slow pointer will be just before the node to remove.',
    code: `class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        fast = dummy
        slow = dummy

        for _ in range(n + 1):
            fast = fast.next

        while fast:
            fast = fast.next
            slow = slow.next

        slow.next = slow.next.next
        return dummy.next`,
    jsCode: `var removeNthFromEnd = function(head, n) {
    const dummy = new ListNode(0, head);
    let fast = dummy;
    let slow = dummy;

    for (let i = 0; i < n + 1; i++) {
        fast = fast.next;
    }

    while (fast) {
        fast = fast.next;
        slow = slow.next;
    }

    slow.next = slow.next.next;
    return dummy.next;
};`,
    explanation: `- A dummy node before head handles the edge case of removing the first node.
- Fast is advanced n+1 steps so that when fast reaches None, slow is one node before the target.
- Both pointers advance together maintaining the gap of n+1.
- slow.next = slow.next.next skips over the target node, effectively removing it.`,
    timeComplexity: 'O(n) where n is the length of the list -- single pass',
    spaceComplexity: 'O(1)',
    hints: [
      'Can you solve it in one pass using two pointers?',
      'If the fast pointer is n nodes ahead, when it reaches the end, where is the slow pointer?',
      'Use a dummy node to handle edge cases like removing the head.',
    ],
  },

  // --------------------------------------------------
  // 21. Merge Two Sorted Lists
  // --------------------------------------------------
  {
    id: 21,
    description:
      'You are given the heads of two sorted linked lists. Merge the two lists into one sorted list by splicing together the nodes of the first two lists. Return the head of the merged linked list.',
    examples: `Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]`,
    intuition:
      'Think of it like merging two sorted piles of cards into one. You always pick the smaller card from the top of either pile and place it next in the result. Since both piles are already sorted, the merged result will also be sorted.',
    approach:
      'Use a dummy node and a current pointer. Compare the heads of both lists, attach the smaller node, and advance that list. After one list is exhausted, attach the remainder of the other.',
    code: `class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0)
        current = dummy

        while list1 and list2:
            if list1.val <= list2.val:
                current.next = list1
                list1 = list1.next
            else:
                current.next = list2
                list2 = list2.next
            current = current.next

        current.next = list1 if list1 else list2
        return dummy.next`,
    jsCode: `var mergeTwoLists = function(list1, list2) {
    const dummy = new ListNode(0);
    let current = dummy;

    while (list1 && list2) {
        if (list1.val <= list2.val) {
            current.next = list1;
            list1 = list1.next;
        } else {
            current.next = list2;
            list2 = list2.next;
        }
        current = current.next;
    }

    current.next = list1 ? list1 : list2;
    return dummy.next;
};`,
    explanation: `- A dummy node lets us build the merged list without special-casing the first element.
- At each step, compare the front of both lists and attach the smaller value.
- When one list runs out, append the remaining list directly (it's already sorted).
- Return dummy.next which is the real head of the merged list.`,
    timeComplexity: 'O(m + n) where m and n are the lengths of the two lists',
    spaceComplexity: 'O(1) -- we reuse existing nodes',
    hints: [
      'Use a dummy/sentinel node to simplify list construction.',
      'At each step, pick the smaller of the two current heads.',
      'When one list is exhausted, just link the rest of the other list.',
    ],
  },

  // --------------------------------------------------
  // 23. Merge k Sorted Lists
  // --------------------------------------------------
  {
    id: 23,
    description:
      'You are given an array of k linked lists, each sorted in ascending order. Merge all the linked lists into one sorted linked list and return it.',
    examples: `Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]`,
    intuition:
      'With k sorted lists, you need to repeatedly find the smallest element across all list heads. A min-heap acts like a "tournament" that always gives you the current winner (smallest value) in O(log k) time, which is much faster than scanning all k heads each time.',
    approach:
      'Use a min-heap (priority queue) to efficiently pick the smallest element across all k lists. Push the head of each list into the heap, then repeatedly extract the minimum and push its next node.',
    code: `import heapq

class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        dummy = ListNode(0)
        current = dummy
        heap = []

        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))

        while heap:
            val, i, node = heapq.heappop(heap)
            current.next = node
            current = current.next
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))

        return dummy.next`,
    jsCode: `var mergeKLists = function(lists) {
    const dummy = new ListNode(0);
    let current = dummy;

    // MinPriorityQueue from datastructures-js (available on LeetCode)
    const pq = new MinPriorityQueue({ priority: (node) => node.val });

    for (const node of lists) {
        if (node) {
            pq.enqueue(node);
        }
    }

    while (!pq.isEmpty()) {
        const node = pq.dequeue().element;
        current.next = node;
        current = current.next;
        if (node.next) {
            pq.enqueue(node.next);
        }
    }

    return dummy.next;
};`,
    explanation: `- Initialize the heap with the head of each non-empty list. The index 'i' breaks ties for equal values.
- Each heappop gives us the globally smallest node; we attach it to the result list.
- If the popped node has a next node, push it into the heap to continue processing that list.
- The heap always has at most k elements, making each push/pop O(log k).`,
    timeComplexity: 'O(N log k) where N is the total number of nodes and k is the number of lists',
    spaceComplexity: 'O(k) for the heap',
    hints: [
      'Merging two lists at a time works, but can you do better with a heap?',
      'A min-heap of size k lets you pick the next smallest element in O(log k).',
      'Use an index as a tiebreaker in the heap to avoid comparing ListNode objects.',
    ],
  },

  // --------------------------------------------------
  // 25. Reverse Nodes in k-Group
  // --------------------------------------------------
  {
    id: 25,
    description:
      'Given the head of a linked list, reverse the nodes of the list k at a time and return the modified list. If the number of remaining nodes is less than k, leave them as-is.',
    examples: `Input: head = [1,2,3,4,5], k = 2
Output: [2,1,4,3,5]
Explanation: Nodes are reversed in groups of 2. The last node (5) stays in place.`,
    intuition:
      'Break the problem into small pieces: for each chunk of k nodes, reverse them as if they were a tiny linked list on their own, then stitch the reversed chunk back into the main list. If fewer than k nodes remain at the end, just leave them alone.',
    approach:
      'For each group, first check if there are k nodes remaining. If so, reverse those k nodes in-place, then connect the reversed group to the previous part and recurse/iterate for the next group.',
    code: `class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        # Check if there are at least k nodes
        count = 0
        node = head
        while node and count < k:
            node = node.next
            count += 1

        if count < k:
            return head

        # Reverse k nodes
        prev = None
        current = head
        for _ in range(k):
            nxt = current.next
            current.next = prev
            prev = current
            current = nxt

        # head is now the tail of the reversed group
        head.next = self.reverseKGroup(current, k)
        return prev`,
    jsCode: `var reverseKGroup = function(head, k) {
    // Check if there are at least k nodes
    let count = 0;
    let node = head;
    while (node && count < k) {
        node = node.next;
        count++;
    }

    if (count < k) {
        return head;
    }

    // Reverse k nodes
    let prev = null;
    let current = head;
    for (let i = 0; i < k; i++) {
        const nxt = current.next;
        current.next = prev;
        prev = current;
        current = nxt;
    }

    // head is now the tail of the reversed group
    head.next = reverseKGroup(current, k);
    return prev;
};`,
    explanation: `- First, count k nodes ahead. If fewer than k remain, return head unchanged.
- Reverse exactly k nodes using the standard iterative reversal (prev/current/next).
- After reversal, 'prev' is the new head and the original 'head' is now the tail of this group.
- Recursively process the rest of the list starting from 'current' and attach it to head.next.`,
    timeComplexity: 'O(n) where n is the number of nodes',
    spaceComplexity: 'O(n/k) for the recursion stack',
    hints: [
      'First, figure out how to reverse k nodes in a linked list.',
      'Before reversing, check that k nodes actually exist.',
      'After reversing a group, the original head becomes the tail -- connect it to the next group.',
    ],
  },

  // --------------------------------------------------
  // 138. Copy List with Random Pointer
  // --------------------------------------------------
  {
    id: 138,
    description:
      'A linked list of length n is given where each node has an additional random pointer that could point to any node in the list or null. Construct a deep copy of the list.',
    examples: `Input: head = [[7,null],[13,0],[11,4],[10,2],[1,0]]
Output: [[7,null],[13,0],[11,4],[10,2],[1,0]]
Explanation: Each pair is [val, random_index]. The deep copy has the same structure.`,
    intuition:
      'The tricky part is that random pointers can point to nodes you haven\'t copied yet. The key insight is to first create all the copy nodes (pass 1), then wire up the pointers (pass 2). A hash map from original-to-copy lets you instantly look up which copy node any pointer should reference.',
    approach:
      'Use a hash map that maps each original node to its copy. In the first pass, create all copied nodes. In the second pass, set the next and random pointers using the map.',
    code: `class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        if not head:
            return None

        old_to_new = {}

        # First pass: create all new nodes
        current = head
        while current:
            old_to_new[current] = Node(current.val)
            current = current.next

        # Second pass: set next and random pointers
        current = head
        while current:
            old_to_new[current].next = old_to_new.get(current.next)
            old_to_new[current].random = old_to_new.get(current.random)
            current = current.next

        return old_to_new[head]`,
    jsCode: `var copyRandomList = function(head) {
    if (!head) return null;

    const oldToNew = new Map();

    // First pass: create all new nodes
    let current = head;
    while (current) {
        oldToNew.set(current, new Node(current.val));
        current = current.next;
    }

    // Second pass: set next and random pointers
    current = head;
    while (current) {
        oldToNew.get(current).next = oldToNew.get(current.next) || null;
        oldToNew.get(current).random = oldToNew.get(current.random) || null;
        current = current.next;
    }

    return oldToNew.get(head);
};`,
    explanation: `- The hash map old_to_new maps each original node to its corresponding copy.
- First pass: iterate through the list and create a copy of each node (value only).
- Second pass: for each original node, set the copy's next and random pointers by looking up the map.
- old_to_new.get() returns None for None keys, handling null pointers gracefully.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the hash map',
    hints: [
      'The challenge is mapping random pointers from old nodes to new nodes.',
      'A hash map from original node to its copy lets you resolve random pointers in O(1).',
      'Two passes: first create all copies, then wire up next and random pointers.',
    ],
  },

  // --------------------------------------------------
  // 141. Linked List Cycle
  // --------------------------------------------------
  {
    id: 141,
    description:
      'Given head, the head of a linked list, determine if the linked list has a cycle in it. A cycle exists if some node can be reached again by continuously following the next pointer.',
    examples: `Input: head = [3,2,0,-4], pos = 1
Output: true
Explanation: There is a cycle where the tail connects to the 1st node (0-indexed).`,
    intuition:
      'Picture two runners on a track -- one fast, one slow. If the track is a straight line, the fast runner reaches the end first. But if the track loops back on itself, the fast runner will eventually lap the slow runner and they will meet. That meeting proves a loop exists.',
    approach:
      'Use Floyd\'s cycle detection (tortoise and hare). The slow pointer moves one step at a time, the fast pointer moves two. If they meet, there is a cycle; if fast reaches null, there is no cycle.',
    code: `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = head
        fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                return True

        return False`,
    jsCode: `var hasCycle = function(head) {
    let slow = head;
    let fast = head;

    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) {
            return true;
        }
    }

    return false;
};`,
    explanation: `- slow advances 1 step, fast advances 2 steps each iteration.
- If there is no cycle, fast will reach None and the loop exits returning False.
- If there is a cycle, fast will eventually lap slow and they will meet, returning True.
- The condition 'fast and fast.next' ensures we don't dereference None.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'A set of visited nodes works but uses O(n) space. Can you do O(1)?',
      'Think of two runners on a circular track -- the faster one will catch the slower one.',
      'Use two pointers moving at different speeds (1 step vs 2 steps).',
    ],
  },

  // --------------------------------------------------
  // 142. Linked List Cycle II
  // --------------------------------------------------
  {
    id: 142,
    description:
      'Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return null.',
    examples: `Input: head = [3,2,0,-4], pos = 1
Output: Node with value 2
Explanation: The tail connects to the node at index 1, so the cycle starts at node 2.`,
    intuition:
      'After the two runners meet inside the cycle, there is a neat mathematical property: the distance from the list head to the cycle start equals the distance from the meeting point to the cycle start (going forward). So resetting one pointer to the head and advancing both at the same speed guarantees they collide exactly at the cycle entrance.',
    approach:
      'First detect the cycle using Floyd\'s algorithm. Once slow and fast meet, reset one pointer to head. Then advance both one step at a time -- they will meet at the cycle\'s start.',
    code: `class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = head
        fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                # Cycle detected; find the entry point
                slow = head
                while slow != fast:
                    slow = slow.next
                    fast = fast.next
                return slow

        return None`,
    jsCode: `var detectCycle = function(head) {
    let slow = head;
    let fast = head;

    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) {
            // Cycle detected; find the entry point
            slow = head;
            while (slow !== fast) {
                slow = slow.next;
                fast = fast.next;
            }
            return slow;
        }
    }

    return null;
};`,
    explanation: `- Phase 1: slow moves 1 step, fast moves 2 steps. If they meet, a cycle exists.
- Phase 2: reset slow to head. Now both move 1 step at a time.
- Mathematically, the distance from head to cycle start equals the distance from the meeting point to cycle start (going around the cycle).
- The node where they meet in phase 2 is the cycle's entry point.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Start with Floyd\'s cycle detection to find the meeting point.',
      'After detection, the distance from head to cycle start equals the distance from the meeting point to cycle start.',
      'Reset one pointer to head and advance both at the same speed -- they meet at the cycle start.',
    ],
  },

  // --------------------------------------------------
  // 143. Reorder List
  // --------------------------------------------------
  {
    id: 143,
    description:
      'Given the head of a singly linked list L0 -> L1 -> ... -> Ln, reorder it to L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> ... You may not modify the values; only nodes themselves may be changed.',
    examples: `Input: head = [1,2,3,4,5]
Output: [1,5,2,4,3]`,
    intuition:
      'The reordered list alternates between taking from the front and the back. You can simulate this by splitting the list in half, reversing the second half (so its front is the original back), and then interleaving the two halves like shuffling a deck of cards.',
    approach:
      'Split the list into two halves using slow/fast pointers. Reverse the second half. Then merge the two halves by alternating nodes.',
    code: `class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        if not head or not head.next:
            return

        # Find the middle
        slow, fast = head, head
        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next

        # Reverse the second half
        prev = None
        current = slow.next
        slow.next = None
        while current:
            nxt = current.next
            current.next = prev
            prev = current
            current = nxt

        # Merge the two halves
        first, second = head, prev
        while second:
            tmp1 = first.next
            tmp2 = second.next
            first.next = second
            second.next = tmp1
            first = tmp1
            second = tmp2`,
    jsCode: `var reorderList = function(head) {
    if (!head || !head.next) return;

    // Find the middle
    let slow = head, fast = head;
    while (fast.next && fast.next.next) {
        slow = slow.next;
        fast = fast.next.next;
    }

    // Reverse the second half
    let prev = null;
    let current = slow.next;
    slow.next = null;
    while (current) {
        const nxt = current.next;
        current.next = prev;
        prev = current;
        current = nxt;
    }

    // Merge the two halves
    let first = head, second = prev;
    while (second) {
        const tmp1 = first.next;
        const tmp2 = second.next;
        first.next = second;
        second.next = tmp1;
        first = tmp1;
        second = tmp2;
    }
};`,
    explanation: `- Step 1: Use slow/fast pointers to find the midpoint. slow ends at the last node of the first half.
- Step 2: Reverse the second half starting from slow.next, then disconnect the two halves.
- Step 3: Interleave nodes from the first and second halves: first -> second -> first.next -> ...
- This rearranges the list in-place without using extra space.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The result interleaves from the front and back. Think: split, reverse, merge.',
      'Use slow/fast pointers to find the middle, then reverse the second half.',
      'Merge the two halves by alternating nodes from each.',
    ],
  },

  // --------------------------------------------------
  // 146. LRU Cache
  // --------------------------------------------------
  {
    id: 146,
    description:
      'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement get(key) and put(key, value) each in O(1) time.',
    examples: `LRUCache cache = new LRUCache(2);
cache.put(1, 1); cache.put(2, 2);
cache.get(1);       // returns 1
cache.put(3, 3);    // evicts key 2
cache.get(2);       // returns -1 (not found)`,
    intuition:
      'No single data structure gives you both O(1) lookup and O(1) eviction of the least-recently-used item. The trick is combining two: a hash map for instant key lookup and a doubly linked list to maintain usage order. Every access moves a node to the front, so the back is always the least-recently-used item ready to evict.',
    approach:
      'Combine a hash map (for O(1) lookup) with a doubly linked list (for O(1) insertion/removal). The list maintains usage order: most recently used at front, least recently used at back.',
    code: `class Node:
    def __init__(self, key: int = 0, val: int = 0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}  # key -> Node
        self.head = Node()  # dummy head
        self.tail = Node()  # dummy tail
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_front(self, node: Node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add_to_front(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self.cache[key] = node
        self._add_to_front(node)
        if len(self.cache) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]`,
    jsCode: `class DLLNode {
    constructor(key = 0, val = 0) {
        this.key = key;
        this.val = val;
        this.prev = null;
        this.next = null;
    }
}

var LRUCache = function(capacity) {
    this.cap = capacity;
    this.cache = new Map();
    this.head = new DLLNode();
    this.tail = new DLLNode();
    this.head.next = this.tail;
    this.tail.prev = this.head;
};

LRUCache.prototype._remove = function(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
};

LRUCache.prototype._addToFront = function(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
};

LRUCache.prototype.get = function(key) {
    if (!this.cache.has(key)) return -1;
    const node = this.cache.get(key);
    this._remove(node);
    this._addToFront(node);
    return node.val;
};

LRUCache.prototype.put = function(key, value) {
    if (this.cache.has(key)) {
        this._remove(this.cache.get(key));
    }
    const node = new DLLNode(key, value);
    this.cache.set(key, node);
    this._addToFront(node);
    if (this.cache.size > this.cap) {
        const lru = this.tail.prev;
        this._remove(lru);
        this.cache.delete(lru.key);
    }
};`,
    explanation: `- The hash map gives O(1) access to any node by key.
- The doubly linked list maintains recency order (most recent at head, least recent at tail).
- On get: move the accessed node to the front (mark it as most recently used).
- On put: insert/update the node at front. If over capacity, evict the node at tail (LRU).
- Dummy head/tail sentinels eliminate null-check edge cases in remove/add operations.`,
    timeComplexity: 'O(1) for both get and put',
    spaceComplexity: 'O(capacity)',
    hints: [
      'You need O(1) lookup AND O(1) eviction. One data structure alone can\'t do both.',
      'A hash map gives O(1) lookup; a doubly linked list gives O(1) insertion and removal.',
      'Combine them: the map stores key -> node, the list maintains usage order.',
    ],
  },

  // --------------------------------------------------
  // 206. Reverse Linked List
  // --------------------------------------------------
  {
    id: 206,
    description:
      'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    examples: `Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]`,
    intuition:
      'Think of each node as an arrow pointing forward. To reverse the list, you just need to flip each arrow to point backward. Walk through the list one node at a time, redirecting each node\'s pointer from "next" to "previous." Three variables (prev, current, next) are all you need to avoid losing your place.',
    approach:
      'Iterate through the list, reversing each node\'s pointer to point to the previous node. Use three pointers: prev, current, and next to avoid losing references.',
    code: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        current = head

        while current:
            nxt = current.next
            current.next = prev
            prev = current
            current = nxt

        return prev`,
    jsCode: `var reverseList = function(head) {
    let prev = null;
    let current = head;

    while (current) {
        const nxt = current.next;
        current.next = prev;
        prev = current;
        current = nxt;
    }

    return prev;
};`,
    explanation: `- prev starts as None (the new tail will point to None).
- For each node: save the next node, reverse the pointer to point to prev, then advance both pointers.
- When current becomes None, prev is the new head of the reversed list.
- Each node is visited exactly once.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'You need to change each node\'s next pointer to point backward.',
      'Keep track of the previous node, current node, and next node.',
      'After the loop, prev will be the new head.',
    ],
  },

  // --------------------------------------------------
  // 234. Palindrome Linked List
  // --------------------------------------------------
  {
    id: 234,
    description:
      'Given the head of a singly linked list, return true if it is a palindrome and false otherwise. Can you do it in O(1) space?',
    examples: `Input: head = [1,2,2,1]
Output: true`,
    intuition:
      'A palindrome reads the same forwards and backwards. Since we can\'t easily go backwards in a linked list, the trick is to reverse the second half so both halves now read "forwards." Then just compare them element by element -- if they match, it\'s a palindrome.',
    approach:
      'Find the middle of the list using slow/fast pointers. Reverse the second half. Compare both halves node by node.',
    code: `class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        # Find the middle
        slow, fast = head, head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        # Reverse the second half
        prev = None
        while slow:
            nxt = slow.next
            slow.next = prev
            prev = slow
            slow = nxt

        # Compare both halves
        left, right = head, prev
        while right:
            if left.val != right.val:
                return False
            left = left.next
            right = right.next

        return True`,
    jsCode: `var isPalindrome = function(head) {
    // Find the middle
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }

    // Reverse the second half
    let prev = null;
    while (slow) {
        const nxt = slow.next;
        slow.next = prev;
        prev = slow;
        slow = nxt;
    }

    // Compare both halves
    let left = head, right = prev;
    while (right) {
        if (left.val !== right.val) {
            return false;
        }
        left = left.next;
        right = right.next;
    }

    return true;
};`,
    explanation: `- slow/fast pointers find the middle: when fast reaches end, slow is at the midpoint.
- Reverse the second half starting from slow, so prev becomes the head of the reversed half.
- Compare nodes from the start and from the reversed second half. If all match, it's a palindrome.
- For odd-length lists, the middle element is shared and comparison still works correctly.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'An array approach copies all values and checks if it reads the same forward and backward.',
      'For O(1) space: find the middle, reverse the second half, then compare.',
      'Use slow/fast pointers to find the midpoint without knowing the length.',
    ],
  },

  // --------------------------------------------------
  // 287. Find the Duplicate Number
  // --------------------------------------------------
  {
    id: 287,
    description:
      'Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive, there is exactly one repeated number. Find it without modifying the array and using only O(1) extra space.',
    examples: `Input: nums = [1,3,4,2,2]
Output: 2`,
    intuition:
      'The brilliant insight is to see the array as a linked list: index i points to index nums[i]. A duplicate value means two indices point to the same place, which creates a cycle. Once you see it as a cycle detection problem, you can apply Floyd\'s tortoise-and-hare algorithm -- the cycle entrance is the duplicate number.',
    approach:
      'Treat the array as a linked list where nums[i] points to index nums[i]. Since there is a duplicate, there must be a cycle. Use Floyd\'s algorithm to find the cycle entry point, which is the duplicate number.',
    code: `class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        # Phase 1: Find the meeting point
        slow = nums[0]
        fast = nums[0]
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break

        # Phase 2: Find the cycle entrance
        slow = nums[0]
        while slow != fast:
            slow = nums[slow]
            fast = nums[fast]

        return slow`,
    jsCode: `var findDuplicate = function(nums) {
    // Phase 1: Find the meeting point
    let slow = nums[0];
    let fast = nums[0];
    do {
        slow = nums[slow];
        fast = nums[nums[fast]];
    } while (slow !== fast);

    // Phase 2: Find the cycle entrance
    slow = nums[0];
    while (slow !== fast) {
        slow = nums[slow];
        fast = nums[fast];
    }

    return slow;
};`,
    explanation: `- Treat index -> nums[index] as a linked list. A duplicate means two indices point to the same value, creating a cycle.
- Phase 1: slow moves one step (nums[slow]), fast moves two steps (nums[nums[fast]]). They will meet inside the cycle.
- Phase 2: reset slow to nums[0]. Both move one step at a time. They meet at the cycle entrance = the duplicate value.
- This is the same logic as Linked List Cycle II (problem 142).`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Think of the array as a function f(i) = nums[i] mapping indices to values.',
      'A duplicate means two indices map to the same value, creating a cycle in the "linked list."',
      'Apply Floyd\'s cycle detection to find where the cycle begins.',
    ],
  },

  // --------------------------------------------------
  // 160. Intersection of Two Linked Lists
  // --------------------------------------------------
  {
    id: 160,
    description:
      'Given the heads of two singly linked lists, return the node at which the two lists intersect. If the two linked lists have no intersection, return null.',
    examples: `Input: listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], intersect at node 8
Output: Node with value 8
Explanation: The two lists merge at the node with value 8.`,
    intuition:
      'If the two lists have different lengths, the pointers will be "out of sync." The elegant trick: when a pointer finishes one list, redirect it to the head of the other. Both pointers now travel the same total distance (lenA + lenB), so they naturally align and meet at the intersection node -- or both reach null if there is none.',
    approach:
      'Use two pointers starting at each list head. When a pointer reaches the end, redirect it to the other list\'s head. Both pointers will meet at the intersection after traversing equal distances.',
    code: `class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:
        a, b = headA, headB

        while a != b:
            a = a.next if a else headB
            b = b.next if b else headA

        return a`,
    jsCode: `var getIntersectionNode = function(headA, headB) {
    let a = headA, b = headB;

    while (a !== b) {
        a = a ? a.next : headB;
        b = b ? b.next : headA;
    }

    return a;
};`,
    explanation: `- Pointer 'a' traverses list A then list B; pointer 'b' traverses list B then list A.
- Both pointers traverse exactly len(A) + len(B) nodes total.
- If there is an intersection, they align and meet at the intersection node.
- If there is no intersection, both reach None at the same time and the loop exits.`,
    timeComplexity: 'O(m + n) where m and n are the lengths of the two lists',
    spaceComplexity: 'O(1)',
    hints: [
      'The lists may have different lengths. How can you align the pointers?',
      'If pointer A finishes list A, redirect it to the head of list B (and vice versa).',
      'After at most m + n steps, both pointers will either meet at the intersection or both be null.',
    ],
  },

  // --------------------------------------------------
  // 148. Sort List
  // --------------------------------------------------
  {
    id: 148,
    description:
      'Given the head of a linked list, return the list after sorting it in ascending order. Can you do it in O(n log n) time and O(1) space?',
    examples: `Input: head = [4,2,1,3]
Output: [1,2,3,4]`,
    intuition:
      'Merge sort is a natural fit for linked lists because splitting at the midpoint and merging two sorted lists are both cheap operations with pointers. Repeatedly halve the list, sort each half, and merge them back -- the same divide-and-conquer strategy that gives O(n log n) performance.',
    approach:
      'Use merge sort on the linked list. Split the list in half using slow/fast pointers, recursively sort both halves, and merge them together.',
    code: `class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:
            return head

        # Split the list into two halves
        slow, fast = head, head.next
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        mid = slow.next
        slow.next = None

        # Recursively sort both halves
        left = self.sortList(head)
        right = self.sortList(mid)

        # Merge the sorted halves
        dummy = ListNode(0)
        current = dummy
        while left and right:
            if left.val <= right.val:
                current.next = left
                left = left.next
            else:
                current.next = right
                right = right.next
            current = current.next
        current.next = left if left else right

        return dummy.next`,
    jsCode: `var sortList = function(head) {
    if (!head || !head.next) return head;

    // Split the list into two halves
    let slow = head, fast = head.next;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }

    const mid = slow.next;
    slow.next = null;

    // Recursively sort both halves
    const left = sortList(head);
    const right = sortList(mid);

    // Merge the sorted halves
    const dummy = new ListNode(0);
    let current = dummy;
    let l = left, r = right;
    while (l && r) {
        if (l.val <= r.val) {
            current.next = l;
            l = l.next;
        } else {
            current.next = r;
            r = r.next;
        }
        current = current.next;
    }
    current.next = l ? l : r;

    return dummy.next;
};`,
    explanation: `- Base case: a list of 0 or 1 nodes is already sorted.
- Find the middle using slow/fast pointers, then split the list by setting slow.next = None.
- Recursively sort the left and right halves.
- Merge the two sorted halves by comparing front nodes, just like merging two sorted lists.`,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n) for the recursion stack',
    hints: [
      'Merge sort is ideal for linked lists since splitting and merging are efficient.',
      'Use slow/fast pointers to find the midpoint without knowing the length.',
      'The merge step is the same as problem 21 (Merge Two Sorted Lists).',
    ],
  },

  // ============================================================
  // TREE PROBLEMS
  // ============================================================

  // --------------------------------------------------
  // 94. Binary Tree Inorder Traversal
  // --------------------------------------------------
  {
    id: 94,
    description:
      'Given the root of a binary tree, return the inorder traversal of its nodes\' values. Inorder means left subtree, then root, then right subtree.',
    examples: `Input: root = [1,null,2,3]
Output: [1,3,2]
Explanation: Inorder: left -> root -> right. Visit 1 (no left), then 3 (left of 2), then 2.`,
    intuition:
      'Inorder traversal visits left, then root, then right. The stack simulates the recursion: keep going left as deep as possible (pushing nodes), then when you can\'t go further left, pop a node (that\'s your "visit"), and explore its right subtree. This left-root-right pattern naturally produces sorted order for BSTs.',
    approach:
      'Use an iterative approach with an explicit stack. Push all left children, then pop and process, then move to the right child.',
    code: `class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        result = []
        stack = []
        current = root

        while current or stack:
            while current:
                stack.append(current)
                current = current.left
            current = stack.pop()
            result.append(current.val)
            current = current.right

        return result`,
    jsCode: `var inorderTraversal = function(root) {
    const result = [];
    const stack = [];
    let current = root;

    while (current || stack.length) {
        while (current) {
            stack.push(current);
            current = current.left;
        }
        current = stack.pop();
        result.push(current.val);
        current = current.right;
    }

    return result;
};`,
    explanation: `- The outer loop runs as long as there are nodes to process (either current exists or the stack is non-empty).
- The inner while loop pushes all left children onto the stack, going as far left as possible.
- Pop from the stack to visit the node (inorder), then move to the right subtree.
- This simulates the recursive call stack for left -> root -> right traversal.`,
    timeComplexity: 'O(n) where n is the number of nodes',
    spaceComplexity: 'O(n) for the stack',
    hints: [
      'Inorder = left, root, right. Can you simulate recursion with a stack?',
      'Push all left nodes onto the stack first. When you pop, that\'s your "visit."',
      'After visiting a node, move to its right child and repeat.',
    ],
  },

  // --------------------------------------------------
  // 98. Validate Binary Search Tree
  // --------------------------------------------------
  {
    id: 98,
    description:
      'Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST has all left subtree values less than the node, and all right subtree values greater.',
    examples: `Input: root = [5,1,4,null,null,3,6]
Output: false
Explanation: The root's right child is 4, which is less than 5, violating the BST property.`,
    intuition:
      'It is not enough to check that each node is greater than its left child and less than its right child -- a node deep in the left subtree must also be less than its grandparent. The key insight is that every node has an allowed range (min, max) inherited from its ancestors. Pass this range down and verify each node falls within it.',
    approach:
      'Use recursive validation passing down the valid range (min, max) for each node. A node\'s value must fall within the range set by its ancestors.',
    code: `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def validate(node, low=float('-inf'), high=float('inf')):
            if not node:
                return True
            if node.val <= low or node.val >= high:
                return False
            return validate(node.left, low, node.val) and validate(node.right, node.val, high)

        return validate(root)`,
    jsCode: `var isValidBST = function(root) {
    const validate = (node, low = -Infinity, high = Infinity) => {
        if (!node) return true;
        if (node.val <= low || node.val >= high) return false;
        return validate(node.left, low, node.val) && validate(node.right, node.val, high);
    };

    return validate(root);
};`,
    explanation: `- Each node must be within the range (low, high) established by its ancestors.
- The root has the range (-inf, inf). Going left, the upper bound tightens to the parent's value. Going right, the lower bound tightens.
- If a node's value is outside its valid range, return False immediately.
- Both subtrees must be valid for the tree to be a valid BST.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the recursion stack in the worst case',
    hints: [
      'Just checking left.val < root.val < right.val is not enough. Think about the entire subtree.',
      'Each node has a valid range. What determines the range?',
      'Pass down the min and max allowed values as you recurse.',
    ],
  },

  // --------------------------------------------------
  // 100. Same Tree
  // --------------------------------------------------
  {
    id: 100,
    description:
      'Given the roots of two binary trees p and q, check if they are the same. Two binary trees are the same if they are structurally identical and the nodes have the same values.',
    examples: `Input: p = [1,2,3], q = [1,2,3]
Output: true`,
    intuition:
      'Two trees are the same if their roots match and their subtrees match. This naturally leads to recursion: check the current nodes, then ask the same question about the left children and the right children. The base cases are simple -- two nulls are equal, one null and one non-null are not.',
    approach:
      'Recursively compare both trees. At each step, check if both nodes are null (same), one is null (different), or their values differ. Then recurse on left and right subtrees.',
    code: `class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if not p and not q:
            return True
        if not p or not q:
            return False
        if p.val != q.val:
            return False
        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)`,
    jsCode: `var isSameTree = function(p, q) {
    if (!p && !q) return true;
    if (!p || !q) return false;
    if (p.val !== q.val) return false;
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
};`,
    explanation: `- Base case 1: both nodes are None -- this subtree is the same, return True.
- Base case 2: exactly one node is None -- trees differ in structure, return False.
- If values differ, return False.
- Recursively check that both left subtrees match AND both right subtrees match.`,
    timeComplexity: 'O(n) where n is the number of nodes in the smaller tree',
    spaceComplexity: 'O(n) for the recursion stack in the worst case',
    hints: [
      'Compare node by node. What are the base cases?',
      'Two null nodes are "the same." One null and one non-null means different.',
      'If values match, check left children together and right children together.',
    ],
  },

  // --------------------------------------------------
  // 102. Binary Tree Level Order Traversal
  // --------------------------------------------------
  {
    id: 102,
    description:
      'Given the root of a binary tree, return the level order traversal of its nodes\' values (i.e., from left to right, level by level).',
    examples: `Input: root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]`,
    intuition:
      'BFS (breadth-first search) naturally visits nodes level by level, like ripples spreading from a stone dropped in water. The key trick for grouping by level is to snapshot the queue size at the start of each level -- that tells you exactly how many nodes belong to the current level before their children get added.',
    approach:
      'Use BFS with a queue. Process all nodes at the current level before moving to the next. Track the level size to group nodes by level.',
    code: `from collections import deque

class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return []

        result = []
        queue = deque([root])

        while queue:
            level_size = len(queue)
            level = []
            for _ in range(level_size):
                node = queue.popleft()
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            result.append(level)

        return result`,
    jsCode: `var levelOrder = function(root) {
    if (!root) return [];

    const result = [];
    const queue = [root];

    while (queue.length) {
        const levelSize = queue.length;
        const level = [];
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(level);
    }

    return result;
};`,
    explanation: `- Start with the root in the queue.
- For each level, record the current queue size (number of nodes at this level).
- Process exactly that many nodes: add their values to the current level list and enqueue their children.
- After processing all nodes at a level, append the level list to the result.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the queue',
    hints: [
      'BFS naturally visits nodes level by level.',
      'How do you know when one level ends and the next begins?',
      'Snapshot the queue size at the start of each level and process exactly that many nodes.',
    ],
  },

  // --------------------------------------------------
  // 104. Maximum Depth of Binary Tree
  // --------------------------------------------------
  {
    id: 104,
    description:
      'Given the root of a binary tree, return its maximum depth. The maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    examples: `Input: root = [3,9,20,null,null,15,7]
Output: 3`,
    intuition:
      'The depth of a tree is like asking "how many floors does this building have?" Each node adds one floor, and you take the taller of the two subtrees. An empty tree has zero floors. This recursive thinking -- "my depth is 1 plus the deeper of my children" -- solves it in one line.',
    approach:
      'Use recursion. The maximum depth of a tree is 1 + the maximum of the depths of its left and right subtrees. A null node has depth 0.',
    code: `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))`,
    jsCode: `var maxDepth = function(root) {
    if (!root) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
};`,
    explanation: `- Base case: a null node has depth 0.
- For any node, its depth is 1 (for itself) plus the deeper of its two subtrees.
- max() picks the longer path between left and right subtrees.
- The recursion naturally visits every node once.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the recursion stack in the worst case (skewed tree)',
    hints: [
      'What is the depth of an empty tree? What about a single node?',
      'The depth of a node is 1 + the maximum depth of its children.',
      'This is a classic DFS problem that can be solved in one line recursively.',
    ],
  },

  // --------------------------------------------------
  // 105. Construct Binary Tree from Preorder and Inorder Traversal
  // --------------------------------------------------
  {
    id: 105,
    description:
      'Given two integer arrays preorder and inorder where preorder is the preorder traversal and inorder is the inorder traversal of the same binary tree, construct and return the binary tree.',
    examples: `Input: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
Output: [3,9,20,null,null,15,7]`,
    intuition:
      'Preorder tells you "who is the root" (always the first element), and inorder tells you "what belongs to the left vs. right subtree" (everything left of the root in inorder is the left subtree). Combining these two pieces of information, you can reconstruct the tree by recursively identifying each root and splitting the remaining elements.',
    approach:
      'The first element of preorder is the root. Find it in inorder to split into left and right subtrees. Recursively build each subtree. Use a hash map for O(1) lookup of inorder indices.',
    code: `class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        inorder_map = {val: idx for idx, val in enumerate(inorder)}
        self.pre_idx = 0

        def build(left, right):
            if left > right:
                return None
            root_val = preorder[self.pre_idx]
            self.pre_idx += 1
            root = TreeNode(root_val)
            mid = inorder_map[root_val]
            root.left = build(left, mid - 1)
            root.right = build(mid + 1, right)
            return root

        return build(0, len(inorder) - 1)`,
    jsCode: `var buildTree = function(preorder, inorder) {
    const inorderMap = new Map();
    inorder.forEach((val, idx) => inorderMap.set(val, idx));
    let preIdx = 0;

    const build = (left, right) => {
        if (left > right) return null;
        const rootVal = preorder[preIdx];
        preIdx++;
        const root = new TreeNode(rootVal);
        const mid = inorderMap.get(rootVal);
        root.left = build(left, mid - 1);
        root.right = build(mid + 1, right);
        return root;
    };

    return build(0, inorder.length - 1);
};`,
    explanation: `- preorder[0] is always the root of the current subtree.
- Finding the root in inorder tells us how many nodes are in the left vs right subtree.
- We maintain a global preorder index (pre_idx) that increments each time we create a node.
- The inorder_map gives O(1) lookup of the root's position in the inorder array.
- Recursion builds the left subtree first (matching preorder's left-root-right order).`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the hash map and recursion stack',
    hints: [
      'The first element of preorder is the root. Where does it appear in inorder?',
      'Everything to the left of root in inorder is the left subtree; everything to the right is the right subtree.',
      'Use a hash map for O(1) lookup of indices in the inorder array.',
    ],
  },

  // --------------------------------------------------
  // 110. Balanced Binary Tree
  // --------------------------------------------------
  {
    id: 110,
    description:
      'Given a binary tree, determine if it is height-balanced. A height-balanced tree is one where the depths of the two subtrees of every node never differ by more than one.',
    examples: `Input: root = [3,9,20,null,null,15,7]
Output: true`,
    intuition:
      'Instead of checking balance at each node from the top down (which recalculates heights repeatedly), work from the bottom up. As you compute each subtree\'s height, check if the left and right heights differ by more than 1. If any subtree fails, propagate a "broken" signal (-1) upward to stop early.',
    approach:
      'Use a bottom-up DFS that returns the height of each subtree. If any subtree is unbalanced, propagate -1 upward to short-circuit. This avoids recalculating heights repeatedly.',
    code: `class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        def height(node):
            if not node:
                return 0
            left = height(node.left)
            if left == -1:
                return -1
            right = height(node.right)
            if right == -1:
                return -1
            if abs(left - right) > 1:
                return -1
            return 1 + max(left, right)

        return height(root) != -1`,
    jsCode: `var isBalanced = function(root) {
    const height = (node) => {
        if (!node) return 0;
        const left = height(node.left);
        if (left === -1) return -1;
        const right = height(node.right);
        if (right === -1) return -1;
        if (Math.abs(left - right) > 1) return -1;
        return 1 + Math.max(left, right);
    };

    return height(root) !== -1;
};`,
    explanation: `- height() returns the actual height of a balanced subtree, or -1 if it's unbalanced.
- For each node, compute left and right heights. If either is -1, propagate -1 (unbalanced).
- If the difference between left and right heights exceeds 1, return -1.
- Otherwise, return the true height: 1 + max(left, right).
- The top-level call just checks if the result is -1 (unbalanced) or not.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the recursion stack',
    hints: [
      'A naive approach computes height at each node, leading to O(n^2). Can you do it in O(n)?',
      'Compute height bottom-up. If any subtree is unbalanced, return a sentinel value.',
      'Use -1 as a sentinel meaning "unbalanced" to short-circuit early.',
    ],
  },

  // --------------------------------------------------
  // 124. Binary Tree Maximum Path Sum
  // --------------------------------------------------
  {
    id: 124,
    description:
      'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge. The path sum is the sum of the node values. Return the maximum path sum. The path does not need to pass through the root.',
    examples: `Input: root = [-10,9,20,null,null,15,7]
Output: 42
Explanation: The optimal path is 15 -> 20 -> 7 with sum 42.`,
    intuition:
      'Any path must have a "highest point" -- a node where the path bends. At each node, consider it as that bend point: the best path through it is left-branch + node + right-branch. Track the global maximum of all such bend paths. But when reporting upward to a parent, you can only offer one branch (paths can\'t fork), so return the better side.',
    approach:
      'Use DFS. At each node, calculate the maximum "one-sided" path sum (node + best child). Update a global max considering the "through" path (left + node + right). Return only the one-sided sum upward.',
    code: `class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        self.max_sum = float('-inf')

        def dfs(node):
            if not node:
                return 0
            left = max(dfs(node.left), 0)
            right = max(dfs(node.right), 0)
            # Path through this node as the "bend"
            self.max_sum = max(self.max_sum, left + node.val + right)
            # Return best one-sided path sum
            return node.val + max(left, right)

        dfs(root)
        return self.max_sum`,
    jsCode: `var maxPathSum = function(root) {
    let maxSum = -Infinity;

    const dfs = (node) => {
        if (!node) return 0;
        const left = Math.max(dfs(node.left), 0);
        const right = Math.max(dfs(node.right), 0);
        // Path through this node as the "bend"
        maxSum = Math.max(maxSum, left + node.val + right);
        // Return best one-sided path sum
        return node.val + Math.max(left, right);
    };

    dfs(root);
    return maxSum;
};`,
    explanation: `- At each node, compute the best sum from the left and right subtrees (clamped to 0 to discard negative paths).
- left + node.val + right is the path that "bends" at this node (uses both children). Update global max.
- Return node.val + max(left, right): the best one-sided path to pass up to the parent.
- We can only pass one side upward because a path cannot fork at two different nodes.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the recursion stack',
    hints: [
      'At each node, you have two choices: include the left child path, the right, both, or neither.',
      'A path that bends at a node can\'t be extended further up. Track it as a candidate for the answer.',
      'Return only the best one-sided sum to the parent.',
    ],
  },

  // --------------------------------------------------
  // 199. Binary Tree Right Side View
  // --------------------------------------------------
  {
    id: 199,
    description:
      'Given the root of a binary tree, imagine yourself standing on the right side of it. Return the values of the nodes you can see ordered from top to bottom.',
    examples: `Input: root = [1,2,3,null,5,null,4]
Output: [1,3,4]
Explanation: From the right side, you see nodes 1, 3, and 4.`,
    intuition:
      'If you stand on the right side of the tree, you see the rightmost node at each level. BFS processes nodes level by level, so the last node you encounter at each level is exactly the one visible from the right. Just grab the last node from each level during a standard level-order traversal.',
    approach:
      'Use BFS (level order traversal). The last node in each level is visible from the right side. Alternatively, use DFS visiting right child first and recording the first node at each depth.',
    code: `from collections import deque

class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        if not root:
            return []

        result = []
        queue = deque([root])

        while queue:
            level_size = len(queue)
            for i in range(level_size):
                node = queue.popleft()
                if i == level_size - 1:
                    result.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)

        return result`,
    jsCode: `var rightSideView = function(root) {
    if (!root) return [];

    const result = [];
    const queue = [root];

    while (queue.length) {
        const levelSize = queue.length;
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            if (i === levelSize - 1) {
                result.push(node.val);
            }
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }

    return result;
};`,
    explanation: `- Standard BFS processes nodes level by level.
- For each level, we only care about the last node (the rightmost visible node).
- When i == level_size - 1, this is the last node in the current level, so we add it to the result.
- Children are added left-to-right so the queue maintains left-to-right order at each level.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the queue',
    hints: [
      'Think about which node is visible from the right at each level.',
      'BFS gives you all nodes at each level. Which one is rightmost?',
      'The last node you process at each level is the one visible from the right side.',
    ],
  },

  // --------------------------------------------------
  // 226. Invert Binary Tree
  // --------------------------------------------------
  {
    id: 226,
    description:
      'Given the root of a binary tree, invert the tree (mirror it) and return its root.',
    examples: `Input: root = [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]
Explanation: Every left child is swapped with its right child at every level.`,
    intuition:
      'Inverting a tree is like looking at it in a mirror -- every left child becomes the right child and vice versa. The recursive insight is simple: swap the two children of the current node, then invert each subtree. That\'s it -- the recursion handles every level automatically.',
    approach:
      'Recursively swap the left and right children of every node. Process the current node by swapping its children, then recurse on both subtrees.',
    code: `class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return None
        root.left, root.right = root.right, root.left
        self.invertTree(root.left)
        self.invertTree(root.right)
        return root`,
    jsCode: `var invertTree = function(root) {
    if (!root) return null;
    [root.left, root.right] = [root.right, root.left];
    invertTree(root.left);
    invertTree(root.right);
    return root;
};`,
    explanation: `- Base case: if the node is None, return None.
- Swap the left and right children of the current node.
- Recursively invert both subtrees (which are now swapped).
- Return the root so the caller can connect it properly.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the recursion stack in the worst case',
    hints: [
      'What does "invert" mean? Every left child becomes right and vice versa.',
      'At each node, just swap left and right, then recurse.',
      'This is one of the simplest tree problems -- the recursive solution is ~4 lines.',
    ],
  },

  // --------------------------------------------------
  // 230. Kth Smallest Element in a BST
  // --------------------------------------------------
  {
    id: 230,
    description:
      'Given the root of a binary search tree and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.',
    examples: `Input: root = [3,1,4,null,2], k = 1
Output: 1
Explanation: The inorder traversal is [1,2,3,4], so the 1st smallest is 1.`,
    intuition:
      'A BST has a hidden superpower: its inorder traversal (left, root, right) visits nodes in sorted order. So finding the kth smallest is just doing an inorder traversal and counting to k. You can stop early once you hit the kth node -- no need to visit the whole tree.',
    approach:
      'Perform an inorder traversal of the BST. Inorder traversal of a BST visits nodes in sorted order. Stop at the kth node visited.',
    code: `class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        stack = []
        current = root

        while current or stack:
            while current:
                stack.append(current)
                current = current.left
            current = stack.pop()
            k -= 1
            if k == 0:
                return current.val
            current = current.right

        return -1  # Should not reach here if k is valid`,
    jsCode: `var kthSmallest = function(root, k) {
    const stack = [];
    let current = root;

    while (current || stack.length) {
        while (current) {
            stack.push(current);
            current = current.left;
        }
        current = stack.pop();
        k--;
        if (k === 0) return current.val;
        current = current.right;
    }

    return -1; // Should not reach here if k is valid
};`,
    explanation: `- Inorder traversal of a BST yields values in ascending order.
- Use an iterative approach with a stack: go as far left as possible, then pop and process.
- Each time we pop a node (visit it), decrement k. When k reaches 0, that node is the kth smallest.
- We stop early once we find the answer, avoiding traversal of the entire tree.`,
    timeComplexity: 'O(H + k) where H is the height of the tree',
    spaceComplexity: 'O(H) for the stack',
    hints: [
      'Inorder traversal of a BST gives sorted order.',
      'You don\'t need to traverse the entire tree -- stop at the kth element.',
      'Use an iterative inorder traversal to avoid building a full sorted list.',
    ],
  },

  // --------------------------------------------------
  // 235. Lowest Common Ancestor of a BST
  // --------------------------------------------------
  {
    id: 235,
    description:
      'Given a binary search tree (BST), find the lowest common ancestor (LCA) of two given nodes. The LCA is the lowest node that has both p and q as descendants (a node can be a descendant of itself).',
    examples: `Input: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8
Output: 6
Explanation: The LCA of nodes 2 and 8 is 6.`,
    intuition:
      'In a BST, the ordering property guides you like a compass. If both nodes are smaller than the current node, the LCA must be to the left. If both are larger, it must be to the right. The moment p and q "split" to different sides (or one equals the current node), you have found the lowest common ancestor.',
    approach:
      'Exploit the BST property. If both p and q are less than root, LCA is in the left subtree. If both are greater, LCA is in the right subtree. Otherwise, root is the LCA (the split point).',
    code: `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        while root:
            if p.val < root.val and q.val < root.val:
                root = root.left
            elif p.val > root.val and q.val > root.val:
                root = root.right
            else:
                return root`,
    jsCode: `var lowestCommonAncestor = function(root, p, q) {
    while (root) {
        if (p.val < root.val && q.val < root.val) {
            root = root.left;
        } else if (p.val > root.val && q.val > root.val) {
            root = root.right;
        } else {
            return root;
        }
    }
};`,
    explanation: `- In a BST, left subtree values < root < right subtree values.
- If both p and q are smaller than root, the LCA must be in the left subtree.
- If both are larger, the LCA must be in the right subtree.
- Otherwise, p and q are on different sides (or one equals root), making the current root the LCA.`,
    timeComplexity: 'O(H) where H is the height of the tree',
    spaceComplexity: 'O(1) iterative, no extra space',
    hints: [
      'Use the BST property: left < root < right.',
      'If both nodes are smaller than root, go left. If both are larger, go right.',
      'The first node where p and q split to different sides is the LCA.',
    ],
  },

  // --------------------------------------------------
  // 236. Lowest Common Ancestor of a Binary Tree
  // --------------------------------------------------
  {
    id: 236,
    description:
      'Given a binary tree (not necessarily a BST), find the lowest common ancestor (LCA) of two given nodes p and q. A node can be a descendant of itself.',
    examples: `Input: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
Output: 3
Explanation: The LCA of nodes 5 and 1 is 3.`,
    intuition:
      'Search both subtrees for p and q. If p is found on the left side and q on the right side, the current node must be where their paths diverge -- making it the LCA. If both are found on the same side, the LCA is deeper on that side. The recursion naturally bubbles up the answer.',
    approach:
      'Recursively search both subtrees. If the current node is p or q, return it. If p and q are found in different subtrees, the current node is the LCA. If both are in the same subtree, propagate that result up.',
    code: `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root or root == p or root == q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right:
            return root
        return left if left else right`,
    jsCode: `var lowestCommonAncestor = function(root, p, q) {
    if (!root || root === p || root === q) return root;
    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);
    if (left && right) return root;
    return left ? left : right;
};`,
    explanation: `- Base cases: if root is None, p, or q, return root.
- Recurse on left and right subtrees to search for p and q.
- If both left and right return non-None, p and q are in different subtrees, so root is the LCA.
- If only one side returns non-None, both nodes are in that subtree, so propagate the result up.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the recursion stack',
    hints: [
      'If a node is p or q, it could itself be the LCA.',
      'If p is found in the left subtree and q in the right, the current node is the LCA.',
      'If both are found on the same side, the LCA is deeper on that side.',
    ],
  },

  // --------------------------------------------------
  // 297. Serialize and Deserialize Binary Tree
  // --------------------------------------------------
  {
    id: 297,
    description:
      'Design an algorithm to serialize a binary tree to a string and deserialize the string back to the original tree structure. There is no restriction on how your serialization/deserialization algorithm should work.',
    examples: `Input: root = [1,2,3,null,null,4,5]
Serialized: "1,2,null,null,3,4,null,null,5,null,null"
Output: [1,2,3,null,null,4,5]`,
    intuition:
      'The challenge is that a binary tree is not uniquely defined by its values alone -- you need to know the structure. By recording "null" for every missing child during a preorder traversal, you capture both the values and the exact shape. Deserialization then just replays the same preorder sequence, using "null" tokens to know when a subtree is empty.',
    approach:
      'Use preorder traversal for serialization, recording "null" for missing children. For deserialization, consume tokens in the same preorder sequence, recursively building the tree.',
    code: `class Codec:
    def serialize(self, root):
        result = []

        def dfs(node):
            if not node:
                result.append("null")
                return
            result.append(str(node.val))
            dfs(node.left)
            dfs(node.right)

        dfs(root)
        return ",".join(result)

    def deserialize(self, data):
        tokens = iter(data.split(","))

        def dfs():
            val = next(tokens)
            if val == "null":
                return None
            node = TreeNode(int(val))
            node.left = dfs()
            node.right = dfs()
            return node

        return dfs()`,
    jsCode: `var serialize = function(root) {
    const result = [];

    const dfs = (node) => {
        if (!node) {
            result.push("null");
            return;
        }
        result.push(String(node.val));
        dfs(node.left);
        dfs(node.right);
    };

    dfs(root);
    return result.join(",");
};

var deserialize = function(data) {
    const tokens = data.split(",");
    let idx = 0;

    const dfs = () => {
        const val = tokens[idx];
        idx++;
        if (val === "null") return null;
        const node = new TreeNode(Number(val));
        node.left = dfs();
        node.right = dfs();
        return node;
    };

    return dfs();
};`,
    explanation: `- Serialize: preorder DFS records each node's value, using "null" for absent children. Join with commas.
- Deserialize: split by commas and use an iterator. Each call to dfs() consumes the next token.
- If the token is "null", return None. Otherwise, create a node and recursively build left and right children.
- The preorder sequence uniquely defines the tree when null markers are included.`,
    timeComplexity: 'O(n) for both serialize and deserialize',
    spaceComplexity: 'O(n) for the serialized string and recursion',
    hints: [
      'Preorder traversal with null markers uniquely represents a binary tree.',
      'During serialization, mark every null child explicitly.',
      'During deserialization, consume tokens one at a time in preorder.',
    ],
  },

  // --------------------------------------------------
  // 543. Diameter of Binary Tree
  // --------------------------------------------------
  {
    id: 543,
    description:
      'Given the root of a binary tree, return the length of the diameter of the tree. The diameter is the length of the longest path between any two nodes, measured in number of edges.',
    examples: `Input: root = [1,2,3,4,5]
Output: 3
Explanation: The longest path is [4,2,1,3] or [5,2,1,3], which has 3 edges.`,
    intuition:
      'The diameter passes through some node where it "bends." At that node, the diameter equals the left subtree height plus the right subtree height. By computing heights bottom-up and checking left_height + right_height at every node, you find the longest path without any extra traversals.',
    approach:
      'Use DFS to compute the height of each subtree. At each node, the diameter through that node is left_height + right_height. Track the maximum diameter seen.',
    code: `class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        self.diameter = 0

        def height(node):
            if not node:
                return 0
            left = height(node.left)
            right = height(node.right)
            self.diameter = max(self.diameter, left + right)
            return 1 + max(left, right)

        height(root)
        return self.diameter`,
    jsCode: `var diameterOfBinaryTree = function(root) {
    let diameter = 0;

    const height = (node) => {
        if (!node) return 0;
        const left = height(node.left);
        const right = height(node.right);
        diameter = Math.max(diameter, left + right);
        return 1 + Math.max(left, right);
    };

    height(root);
    return diameter;
};`,
    explanation: `- height() returns the height (number of edges to deepest leaf) of a subtree.
- At each node, the path through that node has length left_height + right_height.
- Update self.diameter with the maximum such path seen.
- Return 1 + max(left, right) as the height to the parent.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the recursion stack',
    hints: [
      'The diameter passes through some node. At that node, it uses the left height + right height.',
      'Compute height bottom-up and update a global max at each node.',
      'The diameter is measured in edges, not nodes.',
    ],
  },

  // --------------------------------------------------
  // 572. Subtree of Another Tree
  // --------------------------------------------------
  {
    id: 572,
    description:
      'Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values as subRoot.',
    examples: `Input: root = [3,4,5,1,2], subRoot = [4,1,2]
Output: true
Explanation: The left subtree of root (rooted at 4) matches subRoot exactly.`,
    intuition:
      'Try every node in the main tree as a potential "match point" for subRoot. At each node, ask: "Is the tree rooted here identical to subRoot?" This reuses the Same Tree comparison (problem 100) as a building block. If any node matches, you have found the subtree.',
    approach:
      'For each node in the main tree, check if the subtree rooted there is identical to subRoot. Use a helper function (same as problem 100) to compare two trees for exact equality.',
    code: `class Solution:
    def isSubtree(self, root: Optional[TreeNode], subRoot: Optional[TreeNode]) -> bool:
        if not root:
            return False
        if self.isSameTree(root, subRoot):
            return True
        return self.isSubtree(root.left, subRoot) or self.isSubtree(root.right, subRoot)

    def isSameTree(self, p, q):
        if not p and not q:
            return True
        if not p or not q:
            return False
        return p.val == q.val and self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)`,
    jsCode: `var isSubtree = function(root, subRoot) {
    if (!root) return false;
    if (isSame(root, subRoot)) return true;
    return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
};

var isSame = function(p, q) {
    if (!p && !q) return true;
    if (!p || !q) return false;
    return p.val === q.val && isSame(p.left, q.left) && isSame(p.right, q.right);
};`,
    explanation: `- For each node in root, check if the tree rooted at that node is identical to subRoot.
- isSameTree checks structural and value equality recursively.
- If the current node doesn't match, try the left and right subtrees.
- As soon as any match is found, return True.`,
    timeComplexity: 'O(m * n) where m and n are the sizes of the two trees',
    spaceComplexity: 'O(m + n) for the recursion stack',
    hints: [
      'At each node of root, check if the subtree there matches subRoot exactly.',
      'Reuse the "Same Tree" comparison (problem 100) as a helper.',
      'If neither the current node nor its children match, return False.',
    ],
  },

  // --------------------------------------------------
  // 1448. Count Good Nodes in Binary Tree
  // --------------------------------------------------
  {
    id: 1448,
    description:
      'Given a binary tree root, a node X is "good" if in the path from root to X there are no nodes with a value greater than X. Return the number of good nodes.',
    examples: `Input: root = [3,1,4,3,null,1,5]
Output: 4
Explanation: The good nodes are 3 (root), 3 (left-left), 4 (right), and 5 (right-right).`,
    intuition:
      'A node is "good" if it is the biggest (or tied for biggest) on the path from root to itself. As you DFS down the tree, carry the maximum value seen so far. If the current node\'s value meets or exceeds that running max, it is a good node. The root is always good since no ancestor can beat it.',
    approach:
      'Use DFS, passing the maximum value seen on the path from root to the current node. A node is "good" if its value is >= the current path maximum.',
    code: `class Solution:
    def goodNodes(self, root: TreeNode) -> int:
        def dfs(node, max_so_far):
            if not node:
                return 0
            good = 1 if node.val >= max_so_far else 0
            max_so_far = max(max_so_far, node.val)
            good += dfs(node.left, max_so_far)
            good += dfs(node.right, max_so_far)
            return good

        return dfs(root, root.val)`,
    jsCode: `var goodNodes = function(root) {
    const dfs = (node, maxSoFar) => {
        if (!node) return 0;
        let good = node.val >= maxSoFar ? 1 : 0;
        maxSoFar = Math.max(maxSoFar, node.val);
        good += dfs(node.left, maxSoFar);
        good += dfs(node.right, maxSoFar);
        return good;
    };

    return dfs(root, root.val);
};`,
    explanation: `- max_so_far tracks the maximum value from root to the current node.
- If the current node's value >= max_so_far, it's a "good" node (no ancestor is larger).
- Update max_so_far and recurse on both children, accumulating the count.
- Start with root.val as the initial max (root is always a good node).`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the recursion stack',
    hints: [
      'A node is "good" if no ancestor has a larger value.',
      'Pass the maximum value seen so far along the path from root.',
      'Compare each node\'s value to the running max to decide if it\'s good.',
    ],
  },

  // --------------------------------------------------
  // 108. Convert Sorted Array to Binary Search Tree
  // --------------------------------------------------
  {
    id: 108,
    description:
      'Given an integer array nums sorted in ascending order, convert it to a height-balanced binary search tree. A height-balanced BST has the depth of the two subtrees of every node differing by no more than 1.',
    examples: `Input: nums = [-10,-3,0,5,9]
Output: [0,-3,9,-10,null,5] (one valid answer)
Explanation: Choosing the middle element as root ensures balance.`,
    intuition:
      'For a balanced BST, you want roughly equal nodes on each side. Since the array is sorted, the middle element is the perfect root -- it splits the array into two equal halves. Apply the same logic recursively to each half, like binary search in reverse: instead of searching a sorted array, you are building a tree from one.',
    approach:
      'Use the middle element as the root to ensure balance. Recursively build the left subtree from the left half and the right subtree from the right half.',
    code: `class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:
        def build(left, right):
            if left > right:
                return None
            mid = (left + right) // 2
            node = TreeNode(nums[mid])
            node.left = build(left, mid - 1)
            node.right = build(mid + 1, right)
            return node

        return build(0, len(nums) - 1)`,
    jsCode: `var sortedArrayToBST = function(nums) {
    const build = (left, right) => {
        if (left > right) return null;
        const mid = Math.floor((left + right) / 2);
        const node = new TreeNode(nums[mid]);
        node.left = build(left, mid - 1);
        node.right = build(mid + 1, right);
        return node;
    };

    return build(0, nums.length - 1);
};`,
    explanation: `- Choosing the middle element ensures both halves have roughly equal size, giving a balanced tree.
- build(left, right) constructs a BST from nums[left..right].
- Base case: left > right means the subarray is empty, return None.
- The middle element becomes the root; left half forms the left subtree, right half forms the right.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(log n) for the recursion stack (the tree itself is O(n))',
    hints: [
      'For a balanced BST, the root should be the middle element of the sorted array.',
      'Recursively apply the same logic to the left and right halves.',
      'This is essentially binary search in reverse -- building a tree from a sorted array.',
    ],
  },

  // --------------------------------------------------
  // 437. Path Sum III
  // --------------------------------------------------
  {
    id: 437,
    description:
      'Given the root of a binary tree and an integer targetSum, return the number of paths where the sum of the values along the path equals targetSum. The path does not need to start or end at the root or a leaf, but must go downwards.',
    examples: `Input: root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8
Output: 3
Explanation: Paths summing to 8: [5,3], [5,2,1], [-3,11].`,
    intuition:
      'This is the subarray sum problem disguised as a tree problem. Keep a running sum from root to the current node. If (currentSum - target) was seen as a prefix sum earlier on this path, then the subpath between those two points sums to target. A hash map of prefix sums makes this lookup instant.',
    approach:
      'Use prefix sums with a hash map. Track the cumulative sum from root to the current node. If current_sum - targetSum exists in the prefix map, there is a valid path. This is similar to the subarray sum problem.',
    code: `class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        prefix_counts = {0: 1}
        self.count = 0

        def dfs(node, current_sum):
            if not node:
                return
            current_sum += node.val
            self.count += prefix_counts.get(current_sum - targetSum, 0)
            prefix_counts[current_sum] = prefix_counts.get(current_sum, 0) + 1

            dfs(node.left, current_sum)
            dfs(node.right, current_sum)

            prefix_counts[current_sum] -= 1

        dfs(root, 0)
        return self.count`,
    jsCode: `var pathSum = function(root, targetSum) {
    const prefixCounts = new Map([[0, 1]]);
    let count = 0;

    const dfs = (node, currentSum) => {
        if (!node) return;
        currentSum += node.val;
        count += prefixCounts.get(currentSum - targetSum) || 0;
        prefixCounts.set(currentSum, (prefixCounts.get(currentSum) || 0) + 1);

        dfs(node.left, currentSum);
        dfs(node.right, currentSum);

        prefixCounts.set(currentSum, prefixCounts.get(currentSum) - 1);
    };

    dfs(root, 0);
    return count;
};`,
    explanation: `- current_sum is the cumulative sum from root to the current node.
- If current_sum - targetSum exists in prefix_counts, then there's a subpath ending here with sum targetSum.
- prefix_counts maps each prefix sum to how many times it has occurred on the current root-to-node path.
- After processing both children, backtrack by decrementing the current prefix sum (remove it from the path).
- Initialize {0: 1} so paths starting from root are counted.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the hash map and recursion stack',
    hints: [
      'Brute force checks all paths from each node -- O(n^2). Can you do better?',
      'Think of the path sum as a subarray sum problem on root-to-node paths.',
      'Use a prefix sum hash map: if current_sum - targetSum was seen before, a valid path exists.',
    ],
  },

  // --------------------------------------------------
  // 450. Delete Node in a BST
  // --------------------------------------------------
  {
    id: 450,
    description:
      'Given a root node reference of a BST and a key, delete the node with the given key in the BST. Return the root node reference of the (possibly updated) BST.',
    examples: `Input: root = [5,3,6,2,4,null,7], key = 3
Output: [5,4,6,2,null,null,7]
Explanation: Node 3 is removed. Its inorder successor (4) replaces it.`,
    intuition:
      'Deleting a leaf or a node with one child is straightforward -- just remove it or replace it with its child. The tricky case is a node with two children: you need a replacement that keeps the BST valid. The inorder successor (smallest node in the right subtree) is the perfect candidate because it is greater than everything on the left and smaller than everything else on the right.',
    approach:
      'Search for the node to delete. If it has no children, remove it. If it has one child, replace it with that child. If it has two children, replace its value with its inorder successor (smallest in right subtree), then delete the successor.',
    code: `class Solution:
    def deleteNode(self, root: Optional[TreeNode], key: int) -> Optional[TreeNode]:
        if not root:
            return None

        if key < root.val:
            root.left = self.deleteNode(root.left, key)
        elif key > root.val:
            root.right = self.deleteNode(root.right, key)
        else:
            # Node to delete found
            if not root.left:
                return root.right
            if not root.right:
                return root.left
            # Node has two children: find inorder successor
            successor = root.right
            while successor.left:
                successor = successor.left
            root.val = successor.val
            root.right = self.deleteNode(root.right, successor.val)

        return root`,
    jsCode: `var deleteNode = function(root, key) {
    if (!root) return null;

    if (key < root.val) {
        root.left = deleteNode(root.left, key);
    } else if (key > root.val) {
        root.right = deleteNode(root.right, key);
    } else {
        // Node to delete found
        if (!root.left) return root.right;
        if (!root.right) return root.left;
        // Node has two children: find inorder successor
        let successor = root.right;
        while (successor.left) {
            successor = successor.left;
        }
        root.val = successor.val;
        root.right = deleteNode(root.right, successor.val);
    }

    return root;
};`,
    explanation: `- Search for the key using BST property: go left if key < root, right if key > root.
- When found, handle three cases:
  1. No left child: replace with right child.
  2. No right child: replace with left child.
  3. Two children: find the inorder successor (leftmost node in right subtree), copy its value, then recursively delete the successor from the right subtree.
- The inorder successor is the smallest value greater than the deleted node, preserving BST order.`,
    timeComplexity: 'O(H) where H is the height of the tree',
    spaceComplexity: 'O(H) for the recursion stack',
    hints: [
      'First, find the node using BST search. Then handle deletion by cases.',
      'A node with 0 or 1 children is easy to delete. What about 2 children?',
      'Replace the node\'s value with its inorder successor, then delete the successor.',
    ],
  },
];

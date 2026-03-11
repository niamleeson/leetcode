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
    // Dummy head makes it easy to build the result list without special-casing the first node
    const dummy = new ListNode(0);
    let current = dummy;
    let carry = 0;

    while (l1 || l2 || carry) {
        // Use 0 if a list is exhausted
        const val1 = l1 ? l1.val : 0;
        const val2 = l2 ? l2.val : 0;

        // Sum the two digits plus any carry from the previous position
        const total = val1 + val2 + carry;

        // The carry is the tens digit; the new node stores the ones digit
        carry = Math.floor(total / 10);
        const digit = total % 10;

        current.next = new ListNode(digit);
        current = current.next;

        // Advance each list pointer (or stay null if already exhausted)
        l1 = l1 ? l1.next : null;
        l2 = l2 ? l2.next : null;
    }

    return dummy.next;
};`,
    jsWalkthrough:
      'l1 = 2->4->3, l2 = 5->6->4  (represents 342 + 465 = 807)\n\n' +
      'Iteration 1: val1=2, val2=5, carry=0\n' +
      '  total = 2+5+0 = 7, carry=0, digit=7\n' +
      '  result so far: 7\n\n' +
      'Iteration 2: val1=4, val2=6, carry=0\n' +
      '  total = 4+6+0 = 10, carry=1, digit=0\n' +
      '  result so far: 7->0\n\n' +
      'Iteration 3: val1=3, val2=4, carry=1\n' +
      '  total = 3+4+1 = 8, carry=0, digit=8\n' +
      '  result so far: 7->0->8\n\n' +
      'Both lists exhausted and carry=0, loop ends\n' +
      'Return dummy.next = 7->0->8  (represents 807)',
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
    // Dummy node before head handles removing the first node gracefully
    const dummy = new ListNode(0, head);
    let fast = dummy;
    let slow = dummy;

    // Advance fast by n+1 steps so that the gap between slow and fast is n+1
    for (let i = 0; i < n + 1; i++) {
        fast = fast.next;
    }

    // Move both pointers together until fast falls off the end
    while (fast) {
        fast = fast.next;
        slow = slow.next;
    }

    // slow is now just before the node to remove; skip over it
    slow.next = slow.next.next;

    return dummy.next;
};`,
    jsWalkthrough:
      'head = [1,2,3,4,5], n = 2  (remove 2nd from end, which is node 4)\n\n' +
      'Setup: dummy -> 1 -> 2 -> 3 -> 4 -> 5\n' +
      '       fast = dummy, slow = dummy\n\n' +
      'Advance fast n+1 = 3 steps:\n' +
      '  step 1: fast -> 1\n' +
      '  step 2: fast -> 2\n' +
      '  step 3: fast -> 3\n\n' +
      'Move both until fast is null:\n' +
      '  fast=3, slow=dummy  ->  fast=4, slow=1\n' +
      '  fast=4, slow=1      ->  fast=5, slow=2\n' +
      '  fast=5, slow=2      ->  fast=null, slow=3\n\n' +
      'slow is at node 3 (just before node 4)\n' +
      'slow.next = slow.next.next  (skip node 4)\n' +
      'Result: 1 -> 2 -> 3 -> 5',
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
    // Dummy node lets us build the result without special-casing the first element
    const dummy = new ListNode(0);
    let current = dummy;

    // Keep picking the smaller of the two front nodes
    while (list1 && list2) {
        if (list1.val <= list2.val) {
            // list1's front is smaller; attach it and advance list1
            current.next = list1;
            list1 = list1.next;
        } else {
            // list2's front is smaller; attach it and advance list2
            current.next = list2;
            list2 = list2.next;
        }
        current = current.next;
    }

    // One list is exhausted; attach the remainder of the other (already sorted)
    current.next = list1 ? list1 : list2;

    return dummy.next;
};`,
    jsWalkthrough:
      'list1 = 1->2->4, list2 = 1->3->4\n\n' +
      'Step 1: list1.val=1, list2.val=1 -> pick list1 (<=)\n' +
      '  result: 1,  list1=2->4, list2=1->3->4\n\n' +
      'Step 2: list1.val=2, list2.val=1 -> pick list2\n' +
      '  result: 1->1,  list1=2->4, list2=3->4\n\n' +
      'Step 3: list1.val=2, list2.val=3 -> pick list1\n' +
      '  result: 1->1->2,  list1=4, list2=3->4\n\n' +
      'Step 4: list1.val=4, list2.val=3 -> pick list2\n' +
      '  result: 1->1->2->3,  list1=4, list2=4\n\n' +
      'Step 5: list1.val=4, list2.val=4 -> pick list1 (<=)\n' +
      '  result: 1->1->2->3->4,  list1=null, list2=4\n\n' +
      'list1 exhausted; attach list2 remainder\n' +
      'Final: 1->1->2->3->4->4',
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
    // It always gives us the node with the smallest val in O(log k)
    const pq = new MinPriorityQueue({ priority: (node) => node.val });

    // Seed the heap with the head of each non-empty list
    for (const headNode of lists) {
        if (headNode) {
            pq.enqueue(headNode);
        }
    }

    while (!pq.isEmpty()) {
        // Extract the globally smallest node across all list heads
        const smallestNode = pq.dequeue().element;

        // Attach it to the result list
        current.next = smallestNode;
        current = current.next;

        // If this node has a successor, push it into the heap to keep that list active
        if (smallestNode.next) {
            pq.enqueue(smallestNode.next);
        }
    }

    return dummy.next;
};`,
    jsWalkthrough:
      'lists = [1->4->5, 1->3->4, 2->6]\n\n' +
      'Initial heap: {1(list0), 1(list1), 2(list2)}\n\n' +
      'Pop 1 (list0): result=1, push 4 -> heap: {1,2,4}\n' +
      'Pop 1 (list1): result=1->1, push 3 -> heap: {2,3,4}\n' +
      'Pop 2 (list2): result=1->1->2, push 6 -> heap: {3,4,6}\n' +
      'Pop 3 (list1): result=1->1->2->3, push 4 -> heap: {4,4,6}\n' +
      'Pop 4 (list0): result=1->1->2->3->4, push 5 -> heap: {4,5,6}\n' +
      'Pop 4 (list1): result=1->1->2->3->4->4, no next -> heap: {5,6}\n' +
      'Pop 5 (list0): result=...->5, no next -> heap: {6}\n' +
      'Pop 6 (list2): result=...->6, no next -> heap empty\n\n' +
      'Final: 1->1->2->3->4->4->5->6',
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
    // First, verify there are at least k nodes remaining
    let count = 0;
    let node = head;
    while (node && count < k) {
        node = node.next;
        count++;
    }

    // Fewer than k nodes remain — leave them as-is
    if (count < k) {
        return head;
    }

    // Reverse exactly k nodes using standard iterative reversal
    let prev = null;
    let current = head;
    for (let i = 0; i < k; i++) {
        const nextNode = current.next;
        current.next = prev;
        prev = current;
        current = nextNode;
    }

    // After reversal: prev = new head of group, head = tail of group
    // Recursively process the rest of the list and attach it to the tail
    head.next = reverseKGroup(current, k);

    return prev;
};`,
    jsWalkthrough:
      'head = [1,2,3,4,5], k = 2\n\n' +
      'Call 1: head=1, count k=2 nodes -> enough to reverse\n' +
      '  Reverse [1,2]: prev=null\n' +
      '    i=0: nextNode=2, 1.next=null, prev=1, current=2\n' +
      '    i=1: nextNode=3, 2.next=1,   prev=2, current=3\n' +
      '  Group reversed: 2->1, current=3 (start of remaining list)\n' +
      '  Attach: 1.next = reverseKGroup(3, 2)\n\n' +
      'Call 2: head=3, count k=2 nodes -> enough to reverse\n' +
      '  Reverse [3,4]: 4->3, current=5\n' +
      '  Attach: 3.next = reverseKGroup(5, 2)\n\n' +
      'Call 3: head=5, count=1 < k=2 -> return 5 unchanged\n\n' +
      'Stitching back:\n' +
      '  3.next = 5  =>  4->3->5\n' +
      '  1.next = 4  =>  2->1->4->3->5\n' +
      'Final: [2,1,4,3,5]',
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
    if (!head) {
        return null;
    }

    // Map from each original node to its corresponding copy node
    const oldToNew = new Map();

    // First pass: create all copy nodes (values only, no pointers yet)
    let current = head;
    while (current) {
        const copyNode = new Node(current.val);
        oldToNew.set(current, copyNode);
        current = current.next;
    }

    // Second pass: wire up next and random pointers using the map
    current = head;
    while (current) {
        const copyNode = oldToNew.get(current);

        // Look up the copy of the next node (or null if next is null)
        copyNode.next = oldToNew.get(current.next) || null;

        // Look up the copy of the random node (or null if random is null)
        copyNode.random = oldToNew.get(current.random) || null;

        current = current.next;
    }

    return oldToNew.get(head);
};`,
    jsWalkthrough:
      'Input: [7,null]->[13,0]->[11,4]->[10,2]->[1,0]\n' +
      '(each pair is [val, random_index])\n\n' +
      'Pass 1 — create copies (values only):\n' +
      '  original node7  -> copy node7\n' +
      '  original node13 -> copy node13\n' +
      '  original node11 -> copy node11\n' +
      '  original node10 -> copy node10\n' +
      '  original node1  -> copy node1\n\n' +
      'Pass 2 — wire pointers:\n' +
      '  node7:  copy.next = copy(node13), copy.random = null\n' +
      '  node13: copy.next = copy(node11), copy.random = copy(node7)   [index 0]\n' +
      '  node11: copy.next = copy(node10), copy.random = copy(node1)   [index 4]\n' +
      '  node10: copy.next = copy(node1),  copy.random = copy(node11)  [index 2]\n' +
      '  node1:  copy.next = null,          copy.random = copy(node7)   [index 0]\n\n' +
      'Return oldToNew.get(head) = copy of node7',
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
    // Tortoise (slow) moves 1 step, hare (fast) moves 2 steps
    let slow = head;
    let fast = head;

    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;

        // If they meet, a cycle exists
        if (slow === fast) {
            return true;
        }
    }

    // fast reached the end — no cycle
    return false;
};`,
    jsWalkthrough:
      'head = [3,2,0,-4], tail connects back to index 1 (node with val=2)\n\n' +
      'Start: slow=3, fast=3\n\n' +
      'Iteration 1: slow=2, fast=0\n' +
      '  slow !== fast\n\n' +
      'Iteration 2: slow=0, fast=2  (fast jumped -4 then back to 2 via cycle)\n' +
      '  slow !== fast\n\n' +
      'Iteration 3: slow=-4, fast=-4  (both land on -4)\n' +
      '  slow === fast -> return true\n\n' +
      'No-cycle example: [1,2,3]\n' +
      '  fast eventually reaches null -> return false',
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

    // Phase 1: detect whether a cycle exists
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;

        if (slow === fast) {
            // Cycle found — now locate the entry point
            // Phase 2: reset slow to head; move both one step at a time
            slow = head;
            while (slow !== fast) {
                slow = slow.next;
                fast = fast.next;
            }

            // They meet exactly at the cycle's start node
            return slow;
        }
    }

    // fast reached null — no cycle
    return null;
};`,
    jsWalkthrough:
      'head = [3,2,0,-4], tail connects back to node at index 1 (val=2)\n' +
      'Nodes: 3(idx0) -> 2(idx1) -> 0(idx2) -> -4(idx3) -> back to 2(idx1)\n\n' +
      'Phase 1 — find meeting point:\n' +
      '  Start: slow=3, fast=3\n' +
      '  Step 1: slow=2, fast=0\n' +
      '  Step 2: slow=0, fast=2\n' +
      '  Step 3: slow=-4, fast=-4  -> MEET\n\n' +
      'Phase 2 — find cycle start:\n' +
      '  Reset slow=3 (head), fast stays at -4\n' +
      '  Step 1: slow=2, fast=2  -> MEET\n\n' +
      'Both pointers are now at node with val=2 (the cycle entry)\n' +
      'Return that node',
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
    if (!head || !head.next) {
        return;
    }

    // Step 1: Find the middle of the list using slow/fast pointers
    let slow = head;
    let fast = head;
    while (fast.next && fast.next.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    // slow is now at the last node of the first half

    // Step 2: Reverse the second half
    let prev = null;
    let current = slow.next;
    slow.next = null; // Disconnect the two halves
    while (current) {
        const nextNode = current.next;
        current.next = prev;
        prev = current;
        current = nextNode;
    }
    // prev is now the head of the reversed second half

    // Step 3: Interleave the two halves
    let first = head;
    let second = prev;
    while (second) {
        const firstNext = first.next;
        const secondNext = second.next;
        first.next = second;
        second.next = firstNext;
        first = firstNext;
        second = secondNext;
    }
};`,
    jsWalkthrough:
      'head = [1,2,3,4,5]\n\n' +
      'Step 1 — find middle:\n' +
      '  slow/fast both start at 1\n' +
      '  Iteration 1: slow=2, fast=3\n' +
      '  Iteration 2: slow=3, fast=5 (fast.next.next would be null -> stop)\n' +
      '  slow=3 is the midpoint\n\n' +
      'Step 2 — reverse second half (4->5):\n' +
      '  Disconnect: 3.next = null\n' +
      '  Reverse 4->5: prev=null, 5->4->null\n' +
      '  second half (reversed): 5->4\n\n' +
      'Step 3 — interleave [1,2,3] and [5,4]:\n' +
      '  first=1, second=5:\n' +
      '    1.next=5, 5.next=2  => 1->5->2...\n' +
      '    first=2, second=4\n' +
      '  first=2, second=4:\n' +
      '    2.next=4, 4.next=3  => ...->2->4->3\n' +
      '    first=3, second=null -> stop\n\n' +
      'Final: 1->5->2->4->3',
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
    this.cache = new Map(); // key -> DLLNode

    // Dummy sentinels eliminate null-check edge cases in remove/add
    this.head = new DLLNode(); // most-recently-used end
    this.tail = new DLLNode(); // least-recently-used end
    this.head.next = this.tail;
    this.tail.prev = this.head;
};

// Remove a node from its current position in the doubly linked list
LRUCache.prototype._remove = function(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
};

// Insert a node right after the head (marking it most recently used)
LRUCache.prototype._addToFront = function(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
};

LRUCache.prototype.get = function(key) {
    if (!this.cache.has(key)) {
        return -1;
    }

    // Move the accessed node to the front (most recently used)
    const node = this.cache.get(key);
    this._remove(node);
    this._addToFront(node);

    return node.val;
};

LRUCache.prototype.put = function(key, value) {
    // If key already exists, remove the old node first
    if (this.cache.has(key)) {
        this._remove(this.cache.get(key));
    }

    // Create new node and insert at the front
    const node = new DLLNode(key, value);
    this.cache.set(key, node);
    this._addToFront(node);

    // If over capacity, evict the least recently used (node just before tail)
    if (this.cache.size > this.cap) {
        const lruNode = this.tail.prev;
        this._remove(lruNode);
        this.cache.delete(lruNode.key);
    }
};`,
    jsWalkthrough:
      'LRUCache(capacity=2)\n' +
      'List state: HEAD <-> TAIL\n\n' +
      'put(1, 1):\n' +
      '  Insert node(1,1) at front\n' +
      '  List: HEAD <-> [1,1] <-> TAIL,  cache: {1->node}\n\n' +
      'put(2, 2):\n' +
      '  Insert node(2,2) at front\n' +
      '  List: HEAD <-> [2,2] <-> [1,1] <-> TAIL,  cache: {1,2}\n\n' +
      'get(1):\n' +
      '  Found key=1, move its node to front\n' +
      '  List: HEAD <-> [1,1] <-> [2,2] <-> TAIL\n' +
      '  Return 1\n\n' +
      'put(3, 3):  (capacity exceeded)\n' +
      '  Insert node(3,3) at front\n' +
      '  List: HEAD <-> [3,3] <-> [1,1] <-> [2,2] <-> TAIL\n' +
      '  Evict LRU (tail.prev = node(2,2))\n' +
      '  List: HEAD <-> [3,3] <-> [1,1] <-> TAIL,  cache: {1,3}\n\n' +
      'get(2): key not in cache -> return -1',
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
    // prev starts as null because the new tail will point to null
    let prev = null;
    let current = head;

    while (current) {
        // Save the next node before we overwrite current.next
        const nextNode = current.next;

        // Reverse this node's pointer to point backward
        current.next = prev;

        // Advance both pointers one step forward
        prev = current;
        current = nextNode;
    }

    // When current is null, prev is the new head of the reversed list
    return prev;
};`,
    jsWalkthrough:
      'head = [1,2,3,4,5]\n\n' +
      'Start: prev=null, current=1\n\n' +
      'Step 1: nextNode=2, 1.next=null, prev=1, current=2\n' +
      '  List so far (reversed): 1->null\n\n' +
      'Step 2: nextNode=3, 2.next=1, prev=2, current=3\n' +
      '  List so far (reversed): 2->1->null\n\n' +
      'Step 3: nextNode=4, 3.next=2, prev=3, current=4\n' +
      '  List so far (reversed): 3->2->1->null\n\n' +
      'Step 4: nextNode=5, 4.next=3, prev=4, current=5\n' +
      '  List so far (reversed): 4->3->2->1->null\n\n' +
      'Step 5: nextNode=null, 5.next=4, prev=5, current=null\n' +
      '  List so far (reversed): 5->4->3->2->1->null\n\n' +
      'current is null -> loop ends\n' +
      'Return prev = 5 (new head)\n' +
      'Final: [5,4,3,2,1]',
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
    // Step 1: Find the middle using slow/fast pointers
    let slow = head;
    let fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    // slow is now at the midpoint (start of second half)

    // Step 2: Reverse the second half in-place
    let prev = null;
    while (slow) {
        const nextNode = slow.next;
        slow.next = prev;
        prev = slow;
        slow = nextNode;
    }
    // prev is now the head of the reversed second half

    // Step 3: Compare both halves node by node
    let leftPointer = head;
    let rightPointer = prev;
    while (rightPointer) {
        if (leftPointer.val !== rightPointer.val) {
            return false;
        }
        leftPointer = leftPointer.next;
        rightPointer = rightPointer.next;
    }

    return true;
};`,
    jsWalkthrough:
      'head = [1,2,2,1]\n\n' +
      'Step 1 — find middle:\n' +
      '  slow=1, fast=1\n' +
      '  Iter 1: slow=2(idx1), fast=2(idx2)\n' +
      '  Iter 2: slow=2(idx2), fast=null (fast.next=1 but fast.next.next=null -> stop)\n' +
      '  Actually: fast=1(idx3) after iter 2, fast.next=null -> loop stops\n' +
      '  slow=2(idx2) — start of second half\n\n' +
      'Step 2 — reverse second half [2,1]:\n' +
      '  Result: 1->2->null  (prev = node with val=1)\n\n' +
      'Step 3 — compare:\n' +
      '  left=1(idx0), right=1(reversed end) -> match\n' +
      '  left=2(idx1), right=2(reversed)     -> match\n' +
      '  right=null -> loop ends\n\n' +
      'Return true\n\n' +
      'Counter-example: [1,2,3,1]\n' +
      '  Reversed second half: [1,3]\n' +
      '  Compare: 1==1 ok, 2!=3 -> return false',
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
    // Treat the array as a linked list: index i points to nums[i]
    // A duplicate value means two indices point to the same index -> cycle

    // Phase 1: Find the meeting point inside the cycle
    let slow = nums[0];
    let fast = nums[0];
    do {
        slow = nums[slow];           // move 1 step
        fast = nums[nums[fast]];     // move 2 steps
    } while (slow !== fast);

    // Phase 2: Find the cycle entrance (= the duplicate number)
    // Reset slow to the start; advance both one step at a time
    slow = nums[0];
    while (slow !== fast) {
        slow = nums[slow];
        fast = nums[fast];
    }

    // They meet at the cycle entrance, which is the duplicate value
    return slow;
};`,
    jsWalkthrough:
      'nums = [1,3,4,2,2]\n' +
      'Implicit linked list: 0->1, 1->3, 2->4, 3->2, 4->2\n' +
      'Cycle: 2->4->2->4->... (node 2 and 4 loop)\n\n' +
      'Phase 1 — find meeting point:\n' +
      '  slow=nums[0]=1, fast=nums[0]=1\n' +
      '  Iter 1: slow=nums[1]=3, fast=nums[nums[1]]=nums[3]=2\n' +
      '  Iter 2: slow=nums[3]=2, fast=nums[nums[2]]=nums[4]=2\n' +
      '  slow===fast===2 -> meeting point found\n\n' +
      'Phase 2 — find cycle entrance:\n' +
      '  Reset slow=nums[0]=1, fast stays at 2\n' +
      '  Iter 1: slow=nums[1]=3, fast=nums[2]=4\n' +
      '  Iter 2: slow=nums[3]=2, fast=nums[4]=2\n' +
      '  slow===fast===2 -> cycle entrance = 2\n\n' +
      'Return 2 (the duplicate)',
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
    // Each pointer traverses list A then list B (or B then A)
    // Both travel the same total distance: lenA + lenB
    // If there's an intersection, they meet there; otherwise both reach null together
    let pointerA = headA;
    let pointerB = headB;

    while (pointerA !== pointerB) {
        // When pointerA exhausts list A, redirect it to the head of list B
        pointerA = pointerA ? pointerA.next : headB;

        // When pointerB exhausts list B, redirect it to the head of list A
        pointerB = pointerB ? pointerB.next : headA;
    }

    // Either both point to the intersection node, or both are null (no intersection)
    return pointerA;
};`,
    jsWalkthrough:
      'listA = [4,1,8,4,5], listB = [5,6,1,8,4,5]\n' +
      'Intersection at node with val=8\n' +
      'lenA = 5, lenB = 6\n\n' +
      'Both pointers travel 5+6=11 steps total\n\n' +
      'pointerA path: 4->1->8->4->5->null, then redirected to 5->6->1->8\n' +
      'pointerB path: 5->6->1->8->4->5->null, then redirected to 4->1->8\n\n' +
      'After 5 steps: pointerA=null, pointerB=4(listA head after redirect)\n' +
      'After 6 steps: pointerA=5(listB head after redirect), pointerB=1\n' +
      '...\n' +
      'At step 9: pointerA=8(intersection), pointerB=8(intersection)\n' +
      'pointerA === pointerB -> return node(8)\n\n' +
      'No intersection case: both eventually reach null simultaneously -> return null',
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
    // Base case: a list of 0 or 1 nodes is already sorted
    if (!head || !head.next) {
        return head;
    }

    // Step 1: Split the list into two halves
    // fast starts one ahead so slow lands at the end of the first half
    let slow = head;
    let fast = head.next;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }

    const secondHalfHead = slow.next;
    slow.next = null; // Disconnect the two halves

    // Step 2: Recursively sort both halves
    const sortedLeft = sortList(head);
    const sortedRight = sortList(secondHalfHead);

    // Step 3: Merge the two sorted halves
    const dummy = new ListNode(0);
    let current = dummy;
    let leftPointer = sortedLeft;
    let rightPointer = sortedRight;

    while (leftPointer && rightPointer) {
        if (leftPointer.val <= rightPointer.val) {
            current.next = leftPointer;
            leftPointer = leftPointer.next;
        } else {
            current.next = rightPointer;
            rightPointer = rightPointer.next;
        }
        current = current.next;
    }

    // Attach any remaining nodes
    current.next = leftPointer ? leftPointer : rightPointer;

    return dummy.next;
};`,
    jsWalkthrough:
      'head = [4,2,1,3]\n\n' +
      'Split: slow stops at 2 (end of first half)\n' +
      '  First half:  4->2\n' +
      '  Second half: 1->3\n\n' +
      'Recurse left on [4,2]:\n' +
      '  Split: [4] and [2]\n' +
      '  Merge: [4] + [2] -> [2,4]\n\n' +
      'Recurse right on [1,3]:\n' +
      '  Split: [1] and [3]\n' +
      '  Merge: [1] + [3] -> [1,3]\n\n' +
      'Merge [2,4] and [1,3]:\n' +
      '  Compare 2 vs 1 -> pick 1,  left=2->4, right=3\n' +
      '  Compare 2 vs 3 -> pick 2,  left=4,    right=3\n' +
      '  Compare 4 vs 3 -> pick 3,  left=4,    right=null\n' +
      '  Attach remaining left: 4\n' +
      '  Result: 1->2->3->4',
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
        // Go as far left as possible, pushing every node onto the stack
        while (current) {
            stack.push(current);
            current = current.left;
        }

        // Pop the deepest left node — this is the next node in inorder
        current = stack.pop();
        result.push(current.val);

        // Now explore the right subtree of the just-visited node
        current = current.right;
    }

    return result;
};`,
    jsWalkthrough:
      'root = [1,null,2,3]  (1 has no left, right=2; 2 has left=3)\n' +
      'Tree:  1\n' +
      '        \\\n' +
      '         2\n' +
      '        /\n' +
      '       3\n\n' +
      'Start: current=1, stack=[]\n\n' +
      'Inner while: push 1, go left -> current=null\n' +
      'Pop 1: result=[1], current=1.right=2\n\n' +
      'Inner while: push 2, go left -> push 3, go left -> current=null\n' +
      'Pop 3: result=[1,3], current=3.right=null\n\n' +
      'Inner while: current=null, skip\n' +
      'Pop 2: result=[1,3,2], current=2.right=null\n\n' +
      'current=null, stack=[] -> loop ends\n' +
      'Return [1,3,2]',
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
    const validate = (node, low, high) => {
        // An empty node is trivially valid
        if (!node) {
            return true;
        }

        // The node's value must be strictly within the allowed range
        if (node.val <= low || node.val >= high) {
            return false;
        }

        // Going left: the current node's value becomes the new upper bound
        // Going right: the current node's value becomes the new lower bound
        const leftIsValid = validate(node.left, low, node.val);
        const rightIsValid = validate(node.right, node.val, high);

        return leftIsValid && rightIsValid;
    };

    return validate(root, -Infinity, Infinity);
};`,
    jsWalkthrough:
      'root = [5,1,4,null,null,3,6]\n' +
      'Tree:     5\n' +
      '         / \\\n' +
      '        1   4\n' +
      '           / \\\n' +
      '          3   6\n\n' +
      'validate(5, -Inf, +Inf):\n' +
      '  5 in (-Inf, +Inf)? Yes\n' +
      '  validate(1, -Inf, 5):   1 in (-Inf,5)? Yes -> both children null -> true\n' +
      '  validate(4, 5, +Inf):   4 in (5, +Inf)? NO! 4 <= 5 -> return false\n\n' +
      'leftIsValid=true, rightIsValid=false\n' +
      'Return false\n\n' +
      'Valid BST example: [2,1,3]\n' +
      '  validate(2,-Inf,+Inf): ok\n' +
      '  validate(1,-Inf,2): 1 in (-Inf,2) ok, leaves null -> true\n' +
      '  validate(3,2,+Inf): 3 in (2,+Inf) ok, leaves null -> true\n' +
      '  Return true',
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
    // Both null means this subtree matches
    if (!p && !q) {
        return true;
    }

    // Exactly one is null — structural mismatch
    if (!p || !q) {
        return false;
    }

    // Values must match
    if (p.val !== q.val) {
        return false;
    }

    // Recursively check left subtrees match AND right subtrees match
    const leftMatch = isSameTree(p.left, q.left);
    const rightMatch = isSameTree(p.right, q.right);

    return leftMatch && rightMatch;
};`,
    jsWalkthrough:
      'p = [1,2,3], q = [1,2,3]\n' +
      'Trees:\n' +
      '  p:  1       q:  1\n' +
      '     / \\         / \\\n' +
      '    2   3       2   3\n\n' +
      'isSameTree(1,1): vals match\n' +
      '  isSameTree(2,2): vals match\n' +
      '    isSameTree(null,null): return true\n' +
      '    isSameTree(null,null): return true\n' +
      '  -> return true\n' +
      '  isSameTree(3,3): vals match\n' +
      '    isSameTree(null,null): return true\n' +
      '    isSameTree(null,null): return true\n' +
      '  -> return true\n' +
      '-> return true\n\n' +
      'Mismatch example: p=[1,2], q=[1,null,2]\n' +
      '  isSameTree(p.left=2, q.left=null): one is null -> return false',
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
    if (!root) {
        return [];
    }

    const result = [];
    const queue = [root];

    while (queue.length) {
        // Snapshot the number of nodes at the current level before adding children
        const levelSize = queue.length;
        const currentLevel = [];

        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            currentLevel.push(node.val);

            // Enqueue children for the next level
            if (node.left) {
                queue.push(node.left);
            }
            if (node.right) {
                queue.push(node.right);
            }
        }

        result.push(currentLevel);
    }

    return result;
};`,
    jsWalkthrough:
      'root = [3,9,20,null,null,15,7]\n' +
      'Tree:     3\n' +
      '         / \\\n' +
      '        9  20\n' +
      '           / \\\n' +
      '          15   7\n\n' +
      'Initial queue: [3]\n\n' +
      'Level 1: levelSize=1\n' +
      '  Process 3: currentLevel=[3], enqueue 9,20\n' +
      '  queue: [9,20]\n' +
      '  result: [[3]]\n\n' +
      'Level 2: levelSize=2\n' +
      '  Process 9:  currentLevel=[9],    no children\n' +
      '  Process 20: currentLevel=[9,20], enqueue 15,7\n' +
      '  queue: [15,7]\n' +
      '  result: [[3],[9,20]]\n\n' +
      'Level 3: levelSize=2\n' +
      '  Process 15: currentLevel=[15], no children\n' +
      '  Process 7:  currentLevel=[15,7], no children\n' +
      '  queue: []\n' +
      '  result: [[3],[9,20],[15,7]]\n\n' +
      'Queue empty -> return [[3],[9,20],[15,7]]',
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
    // Base case: an empty node contributes 0 depth
    if (!root) {
        return 0;
    }

    // Recursively find the depth of each subtree
    const leftDepth = maxDepth(root.left);
    const rightDepth = maxDepth(root.right);

    // This node adds 1 to the deeper of the two subtrees
    return 1 + Math.max(leftDepth, rightDepth);
};`,
    jsWalkthrough:
      'root = [3,9,20,null,null,15,7]\n' +
      'Tree:     3\n' +
      '         / \\\n' +
      '        9  20\n' +
      '           / \\\n' +
      '          15   7\n\n' +
      'maxDepth(3):\n' +
      '  leftDepth  = maxDepth(9):\n' +
      '    leftDepth  = maxDepth(null) = 0\n' +
      '    rightDepth = maxDepth(null) = 0\n' +
      '    return 1 + max(0,0) = 1\n' +
      '  rightDepth = maxDepth(20):\n' +
      '    leftDepth  = maxDepth(15) = 1\n' +
      '    rightDepth = maxDepth(7)  = 1\n' +
      '    return 1 + max(1,1) = 2\n' +
      '  return 1 + max(1,2) = 3\n\n' +
      'Answer: 3',
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
    // Build a map for O(1) lookup of any value's position in inorder
    const inorderIndexMap = new Map();
    inorder.forEach((val, idx) => inorderIndexMap.set(val, idx));

    // Tracks which preorder element to consume next
    let preorderIndex = 0;

    const build = (leftBound, rightBound) => {
        // No elements remain in this subarray
        if (leftBound > rightBound) {
            return null;
        }

        // The next preorder value is always the root of the current subtree
        const rootVal = preorder[preorderIndex];
        preorderIndex++;

        const rootNode = new TreeNode(rootVal);

        // Find where this root sits in inorder to split left/right subtrees
        const inorderMid = inorderIndexMap.get(rootVal);

        // Build left subtree first (matches preorder's left-before-right order)
        rootNode.left = build(leftBound, inorderMid - 1);
        rootNode.right = build(inorderMid + 1, rightBound);

        return rootNode;
    };

    return build(0, inorder.length - 1);
};`,
    jsWalkthrough:
      'preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]\n' +
      'inorderIndexMap: {9:0, 3:1, 15:2, 20:3, 7:4}\n\n' +
      'build(0,4): rootVal=3 (preIdx=0->1), inorderMid=1\n' +
      '  Left subtree: build(0,0)\n' +
      '    rootVal=9 (preIdx=1->2), inorderMid=0\n' +
      '    build(0,-1) -> null (left)\n' +
      '    build(1,0)  -> null (right)\n' +
      '    return node(9)\n' +
      '  Right subtree: build(2,4)\n' +
      '    rootVal=20 (preIdx=2->3), inorderMid=3\n' +
      '    Left: build(2,2)\n' +
      '      rootVal=15 (preIdx=3->4), inorderMid=2\n' +
      '      Both children null -> return node(15)\n' +
      '    Right: build(4,4)\n' +
      '      rootVal=7 (preIdx=4->5), inorderMid=4\n' +
      '      Both children null -> return node(7)\n' +
      '    return node(20) with left=15, right=7\n' +
      '  return node(3) with left=9, right=20\n\n' +
      'Result tree: [3,9,20,null,null,15,7]',
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
    // Returns the height of the subtree, or -1 if it is unbalanced
    const height = (node) => {
        // An empty node has height 0 and is trivially balanced
        if (!node) {
            return 0;
        }

        // Check left subtree
        const leftHeight = height(node.left);
        if (leftHeight === -1) {
            return -1; // Propagate unbalanced signal upward
        }

        // Check right subtree
        const rightHeight = height(node.right);
        if (rightHeight === -1) {
            return -1; // Propagate unbalanced signal upward
        }

        // If heights differ by more than 1, this subtree is unbalanced
        if (Math.abs(leftHeight - rightHeight) > 1) {
            return -1;
        }

        // Return the true height of this subtree
        return 1 + Math.max(leftHeight, rightHeight);
    };

    return height(root) !== -1;
};`,
    jsWalkthrough:
      'root = [3,9,20,null,null,15,7]\n' +
      'Tree:     3\n' +
      '         / \\\n' +
      '        9  20\n' +
      '           / \\\n' +
      '          15   7\n\n' +
      'height(3):\n' +
      '  leftHeight  = height(9) = 1  (balanced)\n' +
      '  rightHeight = height(20):\n' +
      '    leftHeight  = height(15) = 1\n' +
      '    rightHeight = height(7)  = 1\n' +
      '    |1-1| = 0 <= 1 -> return 2\n' +
      '  |1-2| = 1 <= 1 -> return 3\n' +
      'height(root) = 3, not -1 -> return true\n\n' +
      'Unbalanced example: [1,2,null,3]\n' +
      '  height(1): left=height(2): left=height(3)=1, right=0, |1-0|=1 ok -> 2\n' +
      '  right=height(null)=0, |2-0|=2 > 1 -> return -1\n' +
      'height(root) = -1 -> return false',
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
        // A null node contributes 0 to the path sum
        if (!node) {
            return 0;
        }

        // Clamp child contributions to 0: don't extend into a subtree if it only hurts
        const leftGain = Math.max(dfs(node.left), 0);
        const rightGain = Math.max(dfs(node.right), 0);

        // Consider this node as the "bend" point of the path
        // The path goes: left branch -> this node -> right branch
        const pathThroughThisNode = leftGain + node.val + rightGain;
        maxSum = Math.max(maxSum, pathThroughThisNode);

        // Report the best one-sided path to the parent (can only pick one branch)
        return node.val + Math.max(leftGain, rightGain);
    };

    dfs(root);
    return maxSum;
};`,
    jsWalkthrough:
      'root = [-10,9,20,null,null,15,7]\n' +
      'Tree:    -10\n' +
      '         /  \\\n' +
      '        9   20\n' +
      '           /  \\\n' +
      '          15    7\n\n' +
      'dfs(9):  leftGain=0, rightGain=0\n' +
      '  pathThrough=9, maxSum=9\n' +
      '  return 9\n\n' +
      'dfs(15): leftGain=0, rightGain=0\n' +
      '  pathThrough=15, maxSum=15\n' +
      '  return 15\n\n' +
      'dfs(7):  leftGain=0, rightGain=0\n' +
      '  pathThrough=7, maxSum=15\n' +
      '  return 7\n\n' +
      'dfs(20): leftGain=15, rightGain=7\n' +
      '  pathThrough=15+20+7=42, maxSum=42\n' +
      '  return 20+max(15,7)=35\n\n' +
      'dfs(-10): leftGain=max(9,0)=9, rightGain=max(35,0)=35\n' +
      '  pathThrough=9+(-10)+35=34, maxSum still 42\n' +
      '  return -10+max(9,35)=25\n\n' +
      'Return maxSum = 42',
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
    if (!root) {
        return [];
    }

    const result = [];
    const queue = [root];

    while (queue.length) {
        const levelSize = queue.length;

        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();

            // The last node processed at each level is the rightmost visible node
            if (i === levelSize - 1) {
                result.push(node.val);
            }

            // Enqueue children left-to-right for the next level
            if (node.left) {
                queue.push(node.left);
            }
            if (node.right) {
                queue.push(node.right);
            }
        }
    }

    return result;
};`,
    jsWalkthrough:
      'root = [1,2,3,null,5,null,4]\n' +
      'Tree:     1\n' +
      '         / \\\n' +
      '        2   3\n' +
      '         \\    \\\n' +
      '          5    4\n\n' +
      'Level 1: queue=[1], levelSize=1\n' +
      '  i=0 (last): record 1 -> result=[1]\n' +
      '  Enqueue children: 2, 3  ->  queue=[2,3]\n\n' +
      'Level 2: queue=[2,3], levelSize=2\n' +
      '  i=0: process 2, not last, enqueue 5 -> queue=[3,5]\n' +
      '  i=1 (last): record 3 -> result=[1,3], enqueue 4 -> queue=[5,4]\n\n' +
      'Level 3: queue=[5,4], levelSize=2\n' +
      '  i=0: process 5, not last, no children\n' +
      '  i=1 (last): record 4 -> result=[1,3,4], no children\n\n' +
      'Queue empty -> return [1,3,4]',
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
    // Base case: nothing to invert
    if (!root) {
        return null;
    }

    // Swap the left and right children at this node
    const temp = root.left;
    root.left = root.right;
    root.right = temp;

    // Recursively invert both subtrees (which are now swapped)
    invertTree(root.left);
    invertTree(root.right);

    return root;
};`,
    jsWalkthrough:
      'root = [4,2,7,1,3,6,9]\n' +
      'Tree:      4\n' +
      '          / \\\n' +
      '         2   7\n' +
      '        /\\ /\\\n' +
      '       1 3 6 9\n\n' +
      'invertTree(4): swap 2<->7\n' +
      '  Tree:    4\n' +
      '          / \\\n' +
      '         7   2\n' +
      '        /\\ /\\\n' +
      '       6 9 1 3  (children still un-inverted)\n\n' +
      '  invertTree(7): swap 6<->9\n' +
      '    node 7 now has left=9, right=6\n' +
      '    invertTree(9): leaf, return\n' +
      '    invertTree(6): leaf, return\n\n' +
      '  invertTree(2): swap 1<->3\n' +
      '    node 2 now has left=3, right=1\n' +
      '    invertTree(3): leaf, return\n' +
      '    invertTree(1): leaf, return\n\n' +
      'Final tree: [4,7,2,9,6,3,1]',
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
    // Inorder traversal of a BST visits nodes in ascending order
    const stack = [];
    let current = root;
    let visitCount = 0;

    while (current || stack.length) {
        // Descend to the leftmost node
        while (current) {
            stack.push(current);
            current = current.left;
        }

        // Visit the node (pop from stack = inorder visit)
        current = stack.pop();
        visitCount++;

        // The kth node visited is the kth smallest
        if (visitCount === k) {
            return current.val;
        }

        // Move to the right subtree
        current = current.right;
    }

    return -1; // Should not reach here if k is valid
};`,
    jsWalkthrough:
      'root = [3,1,4,null,2], k = 1\n' +
      'BST:     3\n' +
      '        / \\\n' +
      '       1   4\n' +
      '        \\\n' +
      '         2\n\n' +
      'Inorder traversal visits nodes in sorted order: [1, 2, 3, 4]\n\n' +
      'Start: current=3, stack=[]\n\n' +
      'Descend left: push 3, push 1, current=null (1 has no left)\n' +
      'stack=[3,1]\n\n' +
      'Pop 1: visitCount=1, k=1 -> visitCount===k -> return 1\n\n' +
      'Answer: 1 (the 1st smallest element)',
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
    let current = root;

    while (current) {
        if (p.val < current.val && q.val < current.val) {
            // Both targets are smaller — LCA must be in the left subtree
            current = current.left;
        } else if (p.val > current.val && q.val > current.val) {
            // Both targets are larger — LCA must be in the right subtree
            current = current.right;
        } else {
            // p and q split to different sides, or one equals current
            // This node is the lowest common ancestor
            return current;
        }
    }

    return null;
};`,
    jsWalkthrough:
      'root = [6,2,8,0,4,7,9], p=2, q=8\n' +
      'BST:        6\n' +
      '           / \\\n' +
      '          2   8\n' +
      '         /\\ /\\\n' +
      '        0 4 7 9\n\n' +
      'current=6:\n' +
      '  p.val=2 < 6, q.val=8 > 6 -> they split here!\n' +
      '  Return node(6)\n\n' +
      'Answer: 6\n\n' +
      'Another example: p=2, q=4\n' +
      'current=6: both 2 and 4 < 6 -> go left\n' +
      'current=2: p.val=2 === 2 (not both smaller, not both larger) -> return 2\n' +
      'Answer: 2 (p itself is the LCA since q=4 is in p\'s subtree)',
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
    // Base cases: empty node, or we found one of the targets
    if (!root || root === p || root === q) {
        return root;
    }

    // Search both subtrees for p and q
    const leftResult = lowestCommonAncestor(root.left, p, q);
    const rightResult = lowestCommonAncestor(root.right, p, q);

    // If p and q were found in different subtrees, this node is the LCA
    if (leftResult && rightResult) {
        return root;
    }

    // Otherwise, both are in the same subtree — propagate the found result up
    return leftResult ? leftResult : rightResult;
};`,
    jsWalkthrough:
      'root = [3,5,1,6,2,0,8], p=5, q=1\n' +
      'Tree:          3\n' +
      '              / \\\n' +
      '             5   1\n' +
      '            /\\ /\\\n' +
      '           6 2 0 8\n\n' +
      'LCA(3, 5, 1):\n' +
      '  leftResult  = LCA(5, 5, 1): root===p -> return node(5)\n' +
      '  rightResult = LCA(1, 5, 1): root===q -> return node(1)\n' +
      '  leftResult=node(5) AND rightResult=node(1) -> return root=node(3)\n\n' +
      'Answer: 3\n\n' +
      'Another example: p=5, q=2 (both under node 5)\n' +
      'LCA(3,5,2):\n' +
      '  left = LCA(5,5,2): root===p -> return node(5)\n' +
      '  right = LCA(1,5,2): neither found -> return null\n' +
      '  Only left found -> return node(5)\n' +
      'Answer: 5',
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
    const tokens = [];

    // Preorder DFS: record each node's value, and "null" for absent children
    const dfs = (node) => {
        if (!node) {
            tokens.push("null");
            return;
        }

        // Record current node's value first (preorder)
        tokens.push(String(node.val));

        // Then recurse on left and right children
        dfs(node.left);
        dfs(node.right);
    };

    dfs(root);

    return tokens.join(",");
};

var deserialize = function(data) {
    const tokens = data.split(",");
    let tokenIndex = 0;

    // Consume tokens in the same preorder sequence to rebuild the tree
    const dfs = () => {
        const currentToken = tokens[tokenIndex];
        tokenIndex++;

        // "null" means this is an absent child
        if (currentToken === "null") {
            return null;
        }

        // Create this node, then recursively build its children
        const node = new TreeNode(Number(currentToken));
        node.left = dfs();
        node.right = dfs();

        return node;
    };

    return dfs();
};`,
    jsWalkthrough:
      'root = [1,2,3,null,null,4,5]\n' +
      'Tree:    1\n' +
      '        / \\\n' +
      '       2   3\n' +
      '          / \\\n' +
      '         4   5\n\n' +
      'Serialize (preorder DFS):\n' +
      '  Visit 1    -> tokens: ["1"]\n' +
      '  Visit 2    -> tokens: ["1","2"]\n' +
      '  2.left=null -> tokens: ["1","2","null"]\n' +
      '  2.right=null-> tokens: ["1","2","null","null"]\n' +
      '  Visit 3    -> tokens: ["1","2","null","null","3"]\n' +
      '  Visit 4    -> tokens: [...,"4","null","null"]\n' +
      '  Visit 5    -> tokens: [...,"5","null","null"]\n' +
      '  Result: "1,2,null,null,3,4,null,null,5,null,null"\n\n' +
      'Deserialize:\n' +
      '  token[0]="1"    -> create node(1)\n' +
      '  token[1]="2"    -> create node(2), node(1).left=node(2)\n' +
      '  token[2]="null" -> node(2).left=null\n' +
      '  token[3]="null" -> node(2).right=null\n' +
      '  token[4]="3"    -> create node(3), node(1).right=node(3)\n' +
      '  ...and so on\n' +
      '  Reconstructs original tree',
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
    let maxDiameter = 0;

    // Returns the height (number of edges to deepest leaf) of a subtree
    const height = (node) => {
        if (!node) {
            return 0;
        }

        const leftHeight = height(node.left);
        const rightHeight = height(node.right);

        // The longest path through this node uses both its left and right heights
        const pathThroughThisNode = leftHeight + rightHeight;
        maxDiameter = Math.max(maxDiameter, pathThroughThisNode);

        // Report height (edges) to the parent node
        return 1 + Math.max(leftHeight, rightHeight);
    };

    height(root);
    return maxDiameter;
};`,
    jsWalkthrough:
      'root = [1,2,3,4,5]\n' +
      'Tree:      1\n' +
      '          / \\\n' +
      '         2   3\n' +
      '        / \\\n' +
      '       4   5\n\n' +
      'height(4): left=0, right=0, path=0, maxDiameter=0, return 1\n' +
      'height(5): left=0, right=0, path=0, maxDiameter=0, return 1\n' +
      'height(2): leftH=1, rightH=1, path=1+1=2, maxDiameter=2, return 2\n' +
      'height(3): left=0, right=0, path=0, maxDiameter=2, return 1\n' +
      'height(1): leftH=2, rightH=1, path=2+1=3, maxDiameter=3, return 3\n\n' +
      'Return maxDiameter = 3\n' +
      '(Longest path: 4->2->1->3 or 5->2->1->3, both have 3 edges)',
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
    // No more nodes to search in the main tree
    if (!root) {
        return false;
    }

    // Check if the subtree rooted at this node matches subRoot exactly
    if (isSame(root, subRoot)) {
        return true;
    }

    // Try the left and right subtrees
    const foundInLeft = isSubtree(root.left, subRoot);
    const foundInRight = isSubtree(root.right, subRoot);

    return foundInLeft || foundInRight;
};

var isSame = function(p, q) {
    // Both null means this subtree matches
    if (!p && !q) {
        return true;
    }

    // One is null, the other is not — structural mismatch
    if (!p || !q) {
        return false;
    }

    // Values must match, and both subtrees must match
    return p.val === q.val && isSame(p.left, q.left) && isSame(p.right, q.right);
};`,
    jsWalkthrough:
      'root = [3,4,5,1,2], subRoot = [4,1,2]\n' +
      'Main tree:     3          subRoot:  4\n' +
      '              / \\                  / \\\n' +
      '             4   5                1   2\n' +
      '            / \\\n' +
      '           1   2\n\n' +
      'isSubtree(3, subRoot=[4,1,2]):\n' +
      '  isSame(3, 4): 3 !== 4 -> false\n' +
      '  isSubtree(4, subRoot):\n' +
      '    isSame(4, 4):\n' +
      '      4===4 ok\n' +
      '      isSame(1,1): 1===1, both children null -> true\n' +
      '      isSame(2,2): 2===2, both children null -> true\n' +
      '      -> return true\n' +
      '  -> found in left subtree!\n' +
      'Return true',
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
        // No node contributes 0 good nodes
        if (!node) {
            return 0;
        }

        // A node is "good" if no ancestor on the path from root has a larger value
        const isGood = node.val >= maxSoFar ? 1 : 0;

        // Update the running maximum for the path going deeper
        const newMax = Math.max(maxSoFar, node.val);

        // Count good nodes in both subtrees, passing down the updated max
        const goodInLeft = dfs(node.left, newMax);
        const goodInRight = dfs(node.right, newMax);

        return isGood + goodInLeft + goodInRight;
    };

    // Root is always good (no ancestors), so start maxSoFar at root's value
    return dfs(root, root.val);
};`,
    jsWalkthrough:
      'root = [3,1,4,3,null,1,5], target good nodes: 3(root),3(left-left),4(right),5(right-right)\n' +
      'Tree:        3\n' +
      '            / \\\n' +
      '           1   4\n' +
      '          /   / \\\n' +
      '         3   1   5\n\n' +
      'dfs(3, maxSoFar=3): 3>=3 -> good=1, newMax=3\n' +
      '  dfs(1, max=3): 1<3 -> good=0, newMax=3\n' +
      '    dfs(3, max=3): 3>=3 -> good=1, newMax=3\n' +
      '      both children null -> return 1\n' +
      '    no right child -> return 0\n' +
      '    return 0+1+0 = 1\n' +
      '  dfs(4, max=3): 4>=3 -> good=1, newMax=4\n' +
      '    dfs(1, max=4): 1<4 -> good=0, return 0\n' +
      '    dfs(5, max=4): 5>=4 -> good=1, return 1\n' +
      '    return 1+0+1 = 2\n' +
      '  return 1+1+2 = 4\n\n' +
      'Answer: 4',
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
    // build constructs a balanced BST from nums[left..right]
    const build = (left, right) => {
        // Empty subarray — no node to create
        if (left > right) {
            return null;
        }

        // Choose the middle element as the root to keep the tree balanced
        const mid = Math.floor((left + right) / 2);
        const rootNode = new TreeNode(nums[mid]);

        // Recursively build left subtree from the left half
        rootNode.left = build(left, mid - 1);

        // Recursively build right subtree from the right half
        rootNode.right = build(mid + 1, right);

        return rootNode;
    };

    return build(0, nums.length - 1);
};`,
    jsWalkthrough:
      'nums = [-10,-3,0,5,9]\n' +
      'Indices:  0   1  2 3  4\n\n' +
      'build(0,4): mid=2, root=nums[2]=0\n' +
      '  Left:  build(0,1): mid=0, root=nums[0]=-10\n' +
      '    Left:  build(0,-1) -> null\n' +
      '    Right: build(1,1): mid=1, root=nums[1]=-3\n' +
      '      Left:  build(1,0) -> null\n' +
      '      Right: build(2,1) -> null\n' +
      '      return node(-3)\n' +
      '    return node(-10) with right=node(-3)\n' +
      '  Right: build(3,4): mid=3, root=nums[3]=5\n' +
      '    Left:  build(3,2) -> null\n' +
      '    Right: build(4,4): mid=4, root=nums[4]=9\n' +
      '      Both children null -> return node(9)\n' +
      '    return node(5) with right=node(9)\n' +
      '  return node(0) with left=node(-10), right=node(5)\n\n' +
      'Result tree: [0,-10,5,null,-3,null,9]',
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
    // prefixCounts maps a running sum to how many times it has appeared on
    // the current root-to-node path. Initialize with {0:1} to count paths from root.
    const prefixCounts = new Map([[0, 1]]);
    let count = 0;

    const dfs = (node, currentSum) => {
        if (!node) {
            return;
        }

        // Add this node's value to the running sum from root
        currentSum += node.val;

        // If (currentSum - targetSum) appeared earlier on this path,
        // the subpath between those two points sums to targetSum
        const needed = currentSum - targetSum;
        count += prefixCounts.get(needed) || 0;

        // Record this running sum on the current path
        prefixCounts.set(currentSum, (prefixCounts.get(currentSum) || 0) + 1);

        // Recurse into both children
        dfs(node.left, currentSum);
        dfs(node.right, currentSum);

        // Backtrack: remove currentSum from the path (we're leaving this node)
        prefixCounts.set(currentSum, prefixCounts.get(currentSum) - 1);
    };

    dfs(root, 0);
    return count;
};`,
    jsWalkthrough:
      'root = [10,5,-3,3,2,null,11], targetSum = 8\n' +
      'Tree:        10\n' +
      '            /  \\\n' +
      '           5   -3\n' +
      '          / \\    \\\n' +
      '         3   2   11\n\n' +
      'prefixCounts = {0:1}, count=0\n\n' +
      'dfs(10, 0): currentSum=10, needed=10-8=2, map has 2? No\n' +
      '  prefixCounts={0:1, 10:1}\n' +
      '  dfs(5, 10): currentSum=15, needed=15-8=7, map has 7? No\n' +
      '    prefixCounts={0:1,10:1,15:1}\n' +
      '    dfs(3, 15): currentSum=18, needed=18-8=10, map has 10? YES (count=1)\n' +
      '      count=1  [path 5->3 sums to 8]\n' +
      '      dfs(2, 15): currentSum=17, needed=9, No\n' +
      '        ...eventually finds path 2->1 = 3... not relevant here\n' +
      '  dfs(-3, 10): currentSum=7, needed=-1, No\n' +
      '    dfs(11, 7): currentSum=18, needed=10, map has 10? YES (count+=1)\n' +
      '      count=2  [path -3->11 sums to 8]\n\n' +
      'Final count = 3 (also includes path [5,2,1])\n' +
      'Return 3',
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
    // Base case: key not found in the tree
    if (!root) {
        return null;
    }

    if (key < root.val) {
        // Key is smaller — search in the left subtree
        root.left = deleteNode(root.left, key);
    } else if (key > root.val) {
        // Key is larger — search in the right subtree
        root.right = deleteNode(root.right, key);
    } else {
        // Found the node to delete

        // Case 1: No left child — replace with right child
        if (!root.left) {
            return root.right;
        }

        // Case 2: No right child — replace with left child
        if (!root.right) {
            return root.left;
        }

        // Case 3: Two children — find the inorder successor
        // (smallest node in the right subtree)
        let successor = root.right;
        while (successor.left) {
            successor = successor.left;
        }

        // Replace this node's value with the successor's value,
        // then delete the successor from the right subtree
        root.val = successor.val;
        root.right = deleteNode(root.right, successor.val);
    }

    return root;
};`,
    jsWalkthrough:
      'root = [5,3,6,2,4,null,7], key = 3\n' +
      'BST:       5\n' +
      '          / \\\n' +
      '         3   6\n' +
      '        /\\    \\\n' +
      '       2  4    7\n\n' +
      'deleteNode(5, 3): 3 < 5 -> go left\n' +
      '  deleteNode(3, 3): found!\n' +
      '    root.left=2 exists, root.right=4 exists -> Case 3 (two children)\n' +
      '    Find inorder successor: start at 4 (root.right)\n' +
      '      4.left=null -> successor=4\n' +
      '    Replace 3\'s value with 4: root.val=4\n' +
      '    Delete 4 from right subtree: deleteNode(4, 4)\n' +
      '      deleteNode(4, 4): found! No left child -> return 4.right=null\n' +
      '    root.right = null\n' +
      '    Node now: val=4, left=2, right=null\n' +
      '  return node(4)\n' +
      '5.left = node(4)\n\n' +
      'Result tree: [5,4,6,2,null,null,7]',
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

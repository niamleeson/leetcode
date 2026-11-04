/**
 * Delivery Control — the complete master solution.
 * 96 study units, 180 problems, 193 implementations.
 * Run: node delivery-control.mjs
 * Import: import { operation, createOperation, makeList, makeTree } from './delivery-control.mjs';
 * Example: operation('B02', 1011).shipWithinDays([1,2,3,4,5], 3) // 6
 * Alternate: operation('S04', 225, 'one-queue').MyStack
 * Original function names make the connection to the NeetCode page explicit.
 * Inputs follow the corresponding operation's problem constraints. Some operations
 * mutate their input; the daily example copies its input before calling them.
 * Generated from the displayed implementations. Edit their sources and regenerate.
 */

export class ListNode {
  constructor(val = 0, next = null) { this.val = val; this.next = next; }
}
export class TreeNode {
  constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
export class RandomNode {
  constructor(val = 0, next = null, random = null) { this.val = val; this.next = next; this.random = random; }
}
export class GraphNode {
  constructor(val = 0, neighbors = []) { this.val = val; this.neighbors = neighbors; }
}
export class QuadNode {
  constructor(val, isLeaf, topLeft = null, topRight = null, bottomLeft = null, bottomRight = null) {
    Object.assign(this, {val, isLeaf, topLeft, topRight, bottomLeft, bottomRight});
  }
}
export function makeList(values) {
  return values.reduceRight((next, value) => new ListNode(value, next), null);
}
export function listValues(head) {
  const result = [];
  const seen = new Set();
  for (let node = head; node && !seen.has(node); node = node.next) {
    seen.add(node);
    result.push(node.val);
  }
  return result;
}
export function makeTree(values) {
  if (!values.length || values[0] === null) return null;
  const root = new TreeNode(values[0]);
  const queue = [root];
  let index = 1;
  while (queue.length && index < values.length) {
    const node = queue.shift();
    for (const side of ['left', 'right']) {
      const value = values[index++];
      if (value != null) {
        node[side] = new TreeNode(value);
        queue.push(node[side]);
      }
    }
  }
  return root;
}

// Shared libraries. Implementations with their own specialized heap keep it local.
export class BinaryHeap {
    constructor(compare = (left, right) => left - right) {
        this.items = [];
        this.compare = compare;
    }

    size() { return this.items.length; }
    isEmpty() { return this.items.length === 0; }
    front() { return this.items[0]; }

    enqueue(value) {
        this.items.push(value);
        let index = this.items.length - 1;
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.compare(this.items[parent], this.items[index]) <= 0) break;
            [this.items[parent], this.items[index]] = [this.items[index], this.items[parent]];
            index = parent;
        }
    }

    dequeue() {
        if (this.isEmpty()) return undefined;
        const first = this.items[0];
        const last = this.items.pop();
        if (!this.isEmpty()) {
            this.items[0] = last;
            let index = 0;
            while (true) {
                const left = index * 2 + 1;
                const right = left + 1;
                let smallest = index;
                if (left < this.size() && this.compare(this.items[left], this.items[smallest]) < 0) smallest = left;
                if (right < this.size() && this.compare(this.items[right], this.items[smallest]) < 0) smallest = right;
                if (smallest === index) break;
                [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
                index = smallest;
            }
        }
        return first;
    }
}


export class GraphMinHeap {
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
}

export const studyUnits = [
  {
    "id": "A01",
    "chapter": "Arrays & Hashing",
    "name": "Sequential scanning and compaction",
    "task": "Copy package records, compare shared prefixes, and compact retained records.",
    "remember": "Keep a clear boundary between input already read and output already written.",
    "watchFor": "A logical output length is different from allocating a new array; never overwrite unread input.",
    "problemIds": [
      1929,
      14,
      27,
      26
    ],
    "variantKeys": [
      "1929",
      "14",
      "27",
      "26"
    ]
  },
  {
    "id": "A02",
    "chapter": "Arrays & Hashing",
    "name": "Set membership and structural constraints",
    "task": "Detect duplicates, validate row/column/box constraints, and start runs only at their first value.",
    "remember": "A set answers whether a fact is already known; the meaning of that fact determines when to insert.",
    "watchFor": "A visited value, a row constraint, and the beginning of a consecutive run need different membership checks.",
    "problemIds": [
      217,
      36,
      128,
      219,
      3
    ],
    "variantKeys": [
      "217",
      "36",
      "128",
      "219",
      "3"
    ]
  },
  {
    "id": "A03",
    "chapter": "Arrays & Hashing",
    "name": "Counts and grouped records",
    "task": "Count inventory, group records by key, and derive canonical signatures when equality needs normalization.",
    "remember": "Choose a key that represents exactly what makes records belong together.",
    "watchFor": "A character set loses multiplicity. Grouped timestamp histories must preserve order within each key.",
    "problemIds": [
      242,
      49,
      347,
      424,
      567,
      76,
      981,
      621,
      355,
      767
    ],
    "variantKeys": [
      "242",
      "49",
      "347",
      "424",
      "567",
      "76",
      "981",
      "621",
      "355",
      "767"
    ]
  },
  {
    "id": "A04",
    "chapter": "Arrays & Hashing",
    "name": "Complement lookup",
    "task": "Find an earlier package whose weight completes a target.",
    "remember": "Look for the missing partner among earlier records before recording the current one.",
    "watchFor": "Inserting first can accidentally reuse the same item. Store indices when the answer needs positions.",
    "problemIds": [
      1,
      560
    ],
    "variantKeys": [
      "1",
      "560"
    ]
  },
  {
    "id": "A05",
    "chapter": "Arrays & Hashing",
    "name": "Hash table implementation",
    "task": "Implement buckets and collision handling without a built-in set or map.",
    "remember": "Hash to a bucket, then resolve collisions inside that bucket.",
    "watchFor": "Hashing does not guarantee unique positions. Updates must replace an existing key rather than duplicate it.",
    "problemIds": [
      705,
      706
    ],
    "variantKeys": [
      "705",
      "706"
    ]
  },
  {
    "id": "A06",
    "chapter": "Arrays & Hashing",
    "name": "Boyer Moore candidate cancellation",
    "task": "Find majority labels, with candidate verification when existence is not guaranteed.",
    "remember": "Cancel competing votes; a sufficiently frequent candidate survives cancellation.",
    "watchFor": "The more-than-half problem guarantees a winner. The more-than-one-third version requires two candidates and a verification pass.",
    "problemIds": [
      169,
      229
    ],
    "variantKeys": [
      "169",
      "229"
    ]
  },
  {
    "id": "A07",
    "chapter": "Arrays & Hashing",
    "name": "Heap construction and heapsort",
    "task": "Sort records in place with a shrinking heap boundary.",
    "remember": "The heap prefix exposes its maximum while the sorted suffix grows from the right.",
    "watchFor": "Bottom-up heap construction and repeated extraction are separate phases; shrink the sift-down boundary after each extraction.",
    "problemIds": [
      912
    ],
    "variantKeys": [
      "912"
    ]
  },
  {
    "id": "A08",
    "chapter": "Arrays & Hashing",
    "name": "Three way partition and quickselect",
    "task": "Partition package classes and select a rank without fully sorting.",
    "remember": "Maintain smaller, equal, unknown, and larger regions while inspecting one unknown item.",
    "watchFor": "After swapping from the far end, inspect the incoming item. Quickselect searches only the partition containing the desired rank.",
    "problemIds": [
      75,
      215
    ],
    "variantKeys": [
      "75",
      "215"
    ]
  },
  {
    "id": "A09",
    "chapter": "Arrays & Hashing",
    "name": "Frequency bucket ranking",
    "task": "Select frequent destinations by scanning count-indexed buckets.",
    "remember": "Use frequency itself as a bucket index, then visit buckets from largest to smallest.",
    "watchFor": "This is a count-bucket scan, not a heap. Stop after collecting k distinct values.",
    "problemIds": [
      347
    ],
    "variantKeys": [
      "347"
    ]
  },
  {
    "id": "A10",
    "chapter": "Arrays & Hashing",
    "name": "Length prefixed encoding",
    "task": "Transmit arbitrary string fields without delimiter ambiguity.",
    "remember": "A length tells the decoder exactly how many following characters belong to one field.",
    "watchFor": "Splitting on a delimiter fails when that delimiter appears inside data. Empty fields still need a length.",
    "problemIds": [
      271
    ],
    "variantKeys": [
      "271"
    ]
  },
  {
    "id": "A11",
    "chapter": "Arrays & Hashing",
    "name": "Rectangle prefix sums",
    "task": "Answer warehouse rectangle totals using inclusion-exclusion.",
    "remember": "A prefix rectangle lets you remove the unwanted top and left areas and add their overlap back.",
    "watchFor": "Padding removes boundary special cases. Coordinates in the input and prefix matrix differ by one.",
    "problemIds": [
      304
    ],
    "variantKeys": [
      "304"
    ]
  },
  {
    "id": "A12",
    "chapter": "Arrays & Hashing",
    "name": "Prefix and suffix products",
    "task": "Compute a product excluding each package without division.",
    "remember": "At each index, combine everything strictly before it with everything strictly after it.",
    "watchFor": "Including the current value or dividing by it breaks the requirement, especially when zeros occur.",
    "problemIds": [
      238
    ],
    "variantKeys": [
      "238"
    ]
  },
  {
    "id": "A13",
    "chapter": "Arrays & Hashing",
    "name": "Prefix sum frequency lookup",
    "task": "Count contiguous weight totals, including negative values.",
    "remember": "A subarray sum equals the difference between two prefix sums.",
    "watchFor": "Count earlier equal prefixes, including the empty prefix. Negative values invalidate the usual positive-sum sliding window.",
    "problemIds": [
      560
    ],
    "variantKeys": [
      "560"
    ]
  },
  {
    "id": "A14",
    "chapter": "Arrays & Hashing",
    "name": "Value to index placement",
    "task": "Find the first missing positive package slot in place.",
    "remember": "Put each valid positive value in its own index slot, then find the first incorrect slot.",
    "watchFor": "Ignore out-of-range values and stop when the destination already contains the same value.",
    "problemIds": [
      41
    ],
    "variantKeys": [
      "41"
    ]
  },
  {
    "id": "A15",
    "chapter": "Arrays & Hashing",
    "name": "Positive adjacent gain aggregation",
    "task": "Aggregate independently realizable price gains; explicit greedy overlap.",
    "remember": "Unlimited transactions allow every positive adjacent increase to contribute.",
    "watchFor": "The same rule is invalid when only one transaction or an extra transaction cost is allowed.",
    "problemIds": [
      122
    ],
    "variantKeys": [
      "122"
    ]
  },
  {
    "id": "P01",
    "chapter": "Two Pointers",
    "name": "Symmetric comparison and reversal",
    "task": "Reverse or validate a route string, including one permitted deletion.",
    "remember": "Compare or exchange symmetric endpoints and move toward the center.",
    "watchFor": "Skipping nonletters, allowing one deletion, and rotating by three reversals are separate variations.",
    "problemIds": [
      344,
      125,
      680,
      189,
      131
    ],
    "variantKeys": [
      "344",
      "125",
      "680",
      "189",
      "131"
    ]
  },
  {
    "id": "P02",
    "chapter": "Two Pointers",
    "name": "Merging and interleaving sequences",
    "task": "Combine sorted or alternating records without losing unread input.",
    "remember": "Choose the next output item without losing either input's unread remainder.",
    "watchFor": "Merging into spare array capacity must run backward; a linked-list merge reconnects nodes instead of copying values.",
    "problemIds": [
      1768,
      88,
      21,
      143,
      23
    ],
    "variantKeys": [
      "1768",
      "88",
      "21",
      "143",
      "23"
    ]
  },
  {
    "id": "P03",
    "chapter": "Two Pointers",
    "name": "Sorted target elimination and k sum",
    "task": "Find pairs, triples, and quadruples with duplicate suppression.",
    "remember": "Sorted order proves which endpoint cannot participate in a solution.",
    "watchFor": "When fixing extra values for triples or quadruples, skip duplicates at every relevant level.",
    "problemIds": [
      167,
      15,
      18
    ],
    "variantKeys": [
      "167",
      "15",
      "18"
    ]
  },
  {
    "id": "P04",
    "chapter": "Two Pointers",
    "name": "Limiting boundary reasoning",
    "task": "Move the limiting boundary when computing capacity or trapped volume.",
    "remember": "The limiting boundary determines which side can be processed or discarded.",
    "watchFor": "Container area and trapped volume have different formulas. Trapped water needs running boundary maxima.",
    "problemIds": [
      11,
      42
    ],
    "variantKeys": [
      "11",
      "42"
    ]
  },
  {
    "id": "P05",
    "chapter": "Two Pointers",
    "name": "Pairing extremes under a limit",
    "task": "Pair the heaviest load with the lightest feasible partner.",
    "remember": "The heaviest remaining item must be assigned now; pair it with the lightest if possible.",
    "watchFor": "Both successful pairs and unpaired heavy items consume one resource. Equality with the limit is allowed.",
    "problemIds": [
      881
    ],
    "variantKeys": [
      "881"
    ]
  },
  {
    "id": "W01",
    "chapter": "Sliding Window",
    "name": "Fixed windows and bounded history",
    "task": "Expire old events and maintain exact character counts.",
    "remember": "Every arriving item has a corresponding departure once it leaves the allowed history.",
    "watchFor": "A fixed-length character window needs exact counts; nearby duplicates use an index-distance bound.",
    "problemIds": [
      219,
      567
    ],
    "variantKeys": [
      "219",
      "567"
    ]
  },
  {
    "id": "W02",
    "chapter": "Sliding Window",
    "name": "Longest window with a validity bound",
    "task": "Expand and repair duplicate or replacement-budget violations.",
    "remember": "Expand the right end and repair the condition that prevents a longer answer.",
    "watchFor": "The replacement variant uses a historical maximum and a length-only invariant; its retained window need not always be valid.",
    "problemIds": [
      3,
      424
    ],
    "variantKeys": [
      "3",
      "424"
    ]
  },
  {
    "id": "W03",
    "chapter": "Sliding Window",
    "name": "Shortest window satisfying requirements",
    "task": "Record a valid window before shrinking it to seek a smaller one.",
    "remember": "Once requirements are satisfied, record the answer before removing from the left.",
    "watchFor": "Minimum cover preserves required multiplicities. A sum-based version relies on positive input values.",
    "problemIds": [
      209,
      76
    ],
    "variantKeys": [
      "209",
      "76"
    ]
  },
  {
    "id": "W04",
    "chapter": "Sliding Window",
    "name": "Monotonic deque",
    "task": "Keep only unexpired, undominated candidates for recent maxima.",
    "remember": "Keep unexpired candidates in decreasing value order; the front is the maximum.",
    "watchFor": "Indices determine expiration. Remove dominated candidates from the back, not from the front.",
    "problemIds": [
      239
    ],
    "variantKeys": [
      "239"
    ]
  },
  {
    "id": "W05",
    "chapter": "Sliding Window",
    "name": "Running minimum and best gain",
    "task": "Evaluate a sale against the cheapest earlier purchase.",
    "remember": "Compare today's sale with the cheapest purchase seen so far.",
    "watchFor": "This allows one transaction, unlike summing every profitable rise.",
    "problemIds": [
      121
    ],
    "variantKeys": [
      "121"
    ]
  },
  {
    "id": "S01",
    "chapter": "Stack",
    "name": "Operand and history stacks",
    "task": "Evaluate postfix costs or undo and derive recent score entries.",
    "remember": "The stack holds the history or operands needed by the next instruction.",
    "watchFor": "Postfix evaluation consumes right then left; score-history addition reads earlier scores without consuming them.",
    "problemIds": [
      682,
      150
    ],
    "variantKeys": [
      "682",
      "150"
    ]
  },
  {
    "id": "S02",
    "chapter": "Stack",
    "name": "Nested syntax and saved contexts",
    "task": "Validate brackets and decode repeated nested commands.",
    "remember": "Save the outer context before entering nested syntax and restore it when that syntax closes.",
    "watchFor": "Matching bracket types, multi-digit repeat counts, and resetting the inner context all matter.",
    "problemIds": [
      20,
      394
    ],
    "variantKeys": [
      "20",
      "394"
    ]
  },
  {
    "id": "S03",
    "chapter": "Stack",
    "name": "Local cancellation and normalization",
    "task": "Resolve collisions or normalize parent-directory navigation.",
    "remember": "Resolve a conflict against the latest unresolved item until no conflict remains.",
    "watchFor": "Only opposite-facing asteroids collide. Parent-directory navigation cannot pop past the root.",
    "problemIds": [
      735,
      71
    ],
    "variantKeys": [
      "735",
      "71"
    ]
  },
  {
    "id": "S04",
    "chapter": "Stack",
    "name": "Queue and stack adapters",
    "task": "Implement LIFO using FIFO and FIFO using LIFO, respecting allowed operations.",
    "remember": "Reordering with the permitted operations makes one access discipline behave like another.",
    "watchFor": "Queue-only stacks cannot secretly pop the back. A two-stack queue transfers only when its output stack is empty.",
    "problemIds": [
      225,
      232
    ],
    "variantKeys": [
      "225",
      "225-one-queue",
      "232"
    ]
  },
  {
    "id": "S05",
    "chapter": "Stack",
    "name": "Augmented stack state",
    "task": "Store a minimum for each stack depth.",
    "remember": "Each stack depth stores the aggregate needed if that depth becomes the top again.",
    "watchFor": "Duplicate minima need their own saved state; pop the aggregate and value together.",
    "problemIds": [
      155
    ],
    "variantKeys": [
      "155"
    ]
  },
  {
    "id": "S06",
    "chapter": "Stack",
    "name": "Monotonic unresolved items",
    "task": "Resolve next-greater distances, aggregate spans, and close rectangle widths.",
    "remember": "An arriving item resolves earlier candidates whose ordering condition no longer holds.",
    "watchFor": "Strictness differs between warmer temperatures and spans. Histogram bars need a left boundary and a final flush.",
    "problemIds": [
      739,
      901,
      84
    ],
    "variantKeys": [
      "739",
      "901",
      "84"
    ]
  },
  {
    "id": "S07",
    "chapter": "Stack",
    "name": "Frequency buckets with ordering",
    "task": "Manage most-frequent pops and least-frequent cache eviction with tie rules.",
    "remember": "Frequency chooses a bucket; order inside that bucket resolves ties.",
    "watchFor": "Most-frequent stack pops use latest arrival, while LFU eviction uses oldest access within the minimum frequency.",
    "problemIds": [
      895,
      460
    ],
    "variantKeys": [
      "895",
      "460"
    ]
  },
  {
    "id": "S08",
    "chapter": "Stack",
    "name": "Arrival time fleet aggregation",
    "task": "Scan vehicles from nearest to farthest and merge catching-up arrivals.",
    "remember": "Process the nearest vehicle first so the fleet directly ahead is already known.",
    "watchFor": "A following vehicle that arrives no later joins that fleet; it cannot pass through it.",
    "problemIds": [
      853
    ],
    "variantKeys": [
      "853"
    ]
  },
  {
    "id": "B01",
    "chapter": "Binary Search",
    "name": "Ordered search and boundaries",
    "task": "Find exact values, insertion points, predecessors, and optimal window boundaries.",
    "remember": "Define the boundary being searched before choosing the comparison and interval convention.",
    "watchFor": "Exact match, first greater-or-equal, last less-or-equal, and the best length-k window are different predicates.",
    "problemIds": [
      658,
      704,
      35,
      374,
      69,
      74,
      981,
      1095
    ],
    "variantKeys": [
      "658",
      "704",
      "35",
      "374",
      "69",
      "74",
      "981",
      "1095"
    ]
  },
  {
    "id": "B02",
    "chapter": "Binary Search",
    "name": "Binary search on a feasible answer",
    "task": "Find the first capacity or speed satisfying a monotone feasibility check.",
    "remember": "A monotone feasibility check lets you search for the first working answer.",
    "watchFor": "Choose valid lower and upper bounds. Loading and partitioning checks must preserve input order.",
    "problemIds": [
      875,
      1011,
      410
    ],
    "variantKeys": [
      "875",
      "1011",
      "410"
    ]
  },
  {
    "id": "B03",
    "chapter": "Binary Search",
    "name": "Rotated order search",
    "task": "Identify the sorted half, handling duplicate ambiguity separately.",
    "remember": "Use the ordered half to prove where the target can lie.",
    "watchFor": "Duplicates may hide which half is ordered; skipping an ambiguous endpoint can make worst-case work linear.",
    "problemIds": [
      153,
      33,
      81
    ],
    "variantKeys": [
      "153",
      "33",
      "81"
    ]
  },
  {
    "id": "B04",
    "chapter": "Binary Search",
    "name": "Coupled partitions of two sorted arrays",
    "task": "Choose two balanced partitions and verify the cross-boundary ordering.",
    "remember": "Balance the partition sizes, then make every left-side value no greater than every right-side value.",
    "watchFor": "Search the shorter array and use sentinel bounds for empty partitions. Both cross-boundary comparisons are required.",
    "problemIds": [
      4
    ],
    "variantKeys": [
      "4"
    ]
  },
  {
    "id": "B05",
    "chapter": "Binary Search",
    "name": "Peak search and opposite directions",
    "task": "Find a mountain peak, then search its increasing and decreasing sides.",
    "remember": "Find the peak by comparing neighbors, then search each side with its own ordering.",
    "watchFor": "Search the increasing side first when the smallest matching index is required; account for the restricted get API.",
    "problemIds": [
      1095
    ],
    "variantKeys": [
      "1095"
    ]
  },
  {
    "id": "L01",
    "chapter": "Linked List",
    "name": "Pointer rewiring and reconnection",
    "task": "Reverse whole routes, subranges, or complete groups without losing the suffix.",
    "remember": "Save the next pointer before rewiring, then reconnect the reversed section to both neighbors.",
    "watchFor": "Check that a full group exists before changing its links. Head changes are easier with a dummy node.",
    "problemIds": [
      206,
      143,
      92,
      25
    ],
    "variantKeys": [
      "206",
      "143",
      "92",
      "25"
    ]
  },
  {
    "id": "L02",
    "chapter": "Linked List",
    "name": "Fast slow and fixed gap pointers",
    "task": "Find middles, remove from the end, detect cycles, and locate cycle entry.",
    "remember": "The distance or relative speed between pointers encodes the position you need.",
    "watchFor": "A cycle meeting is not necessarily its entrance. Finding a middle and maintaining an n-node gap use different stopping rules.",
    "problemIds": [
      141,
      143,
      19,
      287
    ],
    "variantKeys": [
      "141",
      "143",
      "19",
      "287"
    ]
  },
  {
    "id": "L03",
    "chapter": "Linked List",
    "name": "Identity preserving cloning",
    "task": "Register each original-to-copy mapping before connecting arbitrary references.",
    "remember": "Each original object gets exactly one copied object, registered before wiring recursive references.",
    "watchFor": "Equal values do not imply the same object. A visited set alone cannot provide the clone needed for an edge.",
    "problemIds": [
      138,
      133
    ],
    "variantKeys": [
      "138",
      "133",
      "133-iterative"
    ]
  },
  {
    "id": "L04",
    "chapter": "Linked List",
    "name": "Digit streams and carry",
    "task": "Add numbers represented as lists with unequal lengths and a final carry.",
    "remember": "Process corresponding digits with a carry and keep going until every input and the carry are exhausted.",
    "watchFor": "Different input lengths and a final carry must not truncate the result.",
    "problemIds": [
      2
    ],
    "variantKeys": [
      "2"
    ]
  },
  {
    "id": "L05",
    "chapter": "Linked List",
    "name": "Circular storage",
    "task": "Wrap queue/deque positions while distinguishing empty and full states.",
    "remember": "A head index and an explicit size distinguish empty from full in circular storage.",
    "watchFor": "Modulo wraps positions; do not infer fullness from equal head and tail positions alone.",
    "problemIds": [
      239,
      622
    ],
    "variantKeys": [
      "239",
      "622"
    ]
  },
  {
    "id": "L06",
    "chapter": "Linked List",
    "name": "Recency ordering for caches",
    "task": "Combine key lookup with usage order, using a doubly linked list or ordered frequency buckets.",
    "remember": "Key lookup finds an item, and a separate ordering structure makes recency updates cheap.",
    "watchFor": "A read changes recency too. LFU has a recency order inside each frequency bucket rather than one global LRU list.",
    "problemIds": [
      146,
      460
    ],
    "variantKeys": [
      "146",
      "460"
    ]
  },
  {
    "id": "T01",
    "chapter": "Trees",
    "name": "Depth first traversal order",
    "task": "Visit before, between, or after children and reproduce that order iteratively.",
    "remember": "When you visit relative to the children determines preorder, inorder, or postorder.",
    "watchFor": "A stack reverses push order. Reversing a collected traversal works for output order but not arbitrary bottom-up computations.",
    "problemIds": [
      94,
      144,
      145,
      226,
      572,
      230
    ],
    "variantKeys": [
      "94",
      "144",
      "145",
      "226",
      "572",
      "230"
    ]
  },
  {
    "id": "T02",
    "chapter": "Trees",
    "name": "Bottom up aggregation and pruning",
    "task": "Return a child summary, update a separate global answer, or remove newly exposed leaves.",
    "remember": "Return the summary a parent needs, and keep a separate answer for paths or changes completed at this node.",
    "watchFor": "A path passed upward can use only one branch. Check leaf removal after processing children, not before.",
    "problemIds": [
      104,
      543,
      110,
      427,
      1325,
      124
    ],
    "variantKeys": [
      "104",
      "543",
      "110",
      "427",
      "1325",
      "124"
    ]
  },
  {
    "id": "T03",
    "chapter": "Trees",
    "name": "Paired structure comparison",
    "task": "Compare matching nodes and search for an equal subtree.",
    "remember": "Compare both value and shape at corresponding positions.",
    "watchFor": "Matching root values is insufficient. Subtree search must try possible roots before applying full equality.",
    "problemIds": [
      100,
      572
    ],
    "variantKeys": [
      "100",
      "572"
    ]
  },
  {
    "id": "T04",
    "chapter": "Trees",
    "name": "Ancestor state and valid ranges",
    "task": "Pass path maxima or strict value bounds down the tree.",
    "remember": "Pass information about this ancestor path down to each child.",
    "watchFor": "A global maximum mixes unrelated branches. BST bounds must include all ancestors and remain strict.",
    "problemIds": [
      1448,
      98
    ],
    "variantKeys": [
      "1448",
      "98"
    ]
  },
  {
    "id": "T05",
    "chapter": "Trees",
    "name": "Binary search tree navigation and mutation",
    "task": "Use sorted structure for LCA, insertion, deletion, and rank traversal.",
    "remember": "Use the BST ordering to select a branch or find a successor.",
    "watchFor": "Deletion with two children needs successor replacement and removal. Sorted inorder rank is different from tree depth.",
    "problemIds": [
      235,
      701,
      450,
      98,
      230
    ],
    "variantKeys": [
      "235",
      "701",
      "450",
      "98",
      "230"
    ]
  },
  {
    "id": "T06",
    "chapter": "Trees",
    "name": "Level traversal",
    "task": "Process a fixed level size and choose all or the last item in that level.",
    "remember": "Capture the queue size before a level so newly enqueued children belong to the next level.",
    "watchFor": "The rightmost result is the last node only when children are enqueued left to right.",
    "problemIds": [
      102,
      199
    ],
    "variantKeys": [
      "102",
      "199"
    ]
  },
  {
    "id": "T07",
    "chapter": "Trees",
    "name": "Reconstruction from traversals",
    "task": "Consume preorder roots and split inorder ranges without copying them.",
    "remember": "Preorder supplies the next root; its inorder position splits that root's two subtrees.",
    "watchFor": "Preorder is root-left-right. Unique values permit the index map, and bounds avoid slicing subarrays.",
    "problemIds": [
      105
    ],
    "variantKeys": [
      "105"
    ]
  },
  {
    "id": "T08",
    "chapter": "Trees",
    "name": "Tree encoding with null markers",
    "task": "Serialize shape and values, then consume the same token grammar to rebuild it.",
    "remember": "Encode missing children as well as values so the serialized shape is unambiguous.",
    "watchFor": "The decoder must consume the same traversal grammar; null children are real tokens.",
    "problemIds": [
      297
    ],
    "variantKeys": [
      "297"
    ]
  },
  {
    "id": "T09",
    "chapter": "Trees",
    "name": "Tree dynamic programming",
    "task": "Return take/skip choices for each subtree; explicit DP overlap.",
    "remember": "Each subtree returns the best answer for taking its root and for skipping its root.",
    "watchFor": "Taking a parent forces both children to be skipped. This remains DP even though the problem appears under Trees.",
    "problemIds": [
      337
    ],
    "variantKeys": [
      "337"
    ]
  },
  {
    "id": "T10",
    "chapter": "Trees",
    "name": "Spatial subdivision and compression",
    "task": "Build four quadrants and collapse equal leaf children.",
    "remember": "Build four smaller regions and merge them only when their leaf values agree.",
    "watchFor": "All four children must be leaves; equal values on internal nodes do not prove a uniform region.",
    "problemIds": [
      427
    ],
    "variantKeys": [
      "427"
    ]
  },
  {
    "id": "H01",
    "chapter": "Heap / Priority Queue",
    "name": "Bounded heap selection",
    "task": "Retain only the best k items and inspect the worst retained candidate.",
    "remember": "Retain k candidates, with the worst retained candidate at the heap root.",
    "watchFor": "For the k largest values use a min-heap; for the k closest points evict the farthest retained point.",
    "problemIds": [
      703,
      973
    ],
    "variantKeys": [
      "703",
      "973"
    ]
  },
  {
    "id": "H02",
    "chapter": "Heap / Priority Queue",
    "name": "Repeated priority choice with constraints",
    "task": "Reinsert changed priorities and temporarily hold ineligible choices aside.",
    "remember": "Take the best eligible priority, update its remaining quantity, and reinsert when appropriate.",
    "watchFor": "A temporarily blocked choice must be held out or replaced by the next choice; otherwise forbidden repetitions occur.",
    "problemIds": [
      1046,
      767,
      1405
    ],
    "variantKeys": [
      "1046",
      "767",
      "1405"
    ]
  },
  {
    "id": "H03",
    "chapter": "Heap / Priority Queue",
    "name": "Merging multiple sorted streams",
    "task": "Keep one candidate per nonempty stream and advance only the selected stream.",
    "remember": "Only the next item of each sorted stream can be the next global result.",
    "watchFor": "After selecting a stream, advance just that stream. A heap and repeated candidate sorting have different costs.",
    "problemIds": [
      23,
      355
    ],
    "variantKeys": [
      "23",
      "355"
    ]
  },
  {
    "id": "H04",
    "chapter": "Heap / Priority Queue",
    "name": "Eligibility sweep and priority scheduling",
    "task": "Move newly eligible work into a priority queue and handle idle periods and ties.",
    "remember": "Sort eligibility events, move newly available work into a priority queue, and select by the required tie rules.",
    "watchFor": "Jump time when nothing is available. Choosing a project can change which later projects are affordable.",
    "problemIds": [
      1834,
      502,
      2402
    ],
    "variantKeys": [
      "1834",
      "502",
      "2402"
    ]
  },
  {
    "id": "H05",
    "chapter": "Heap / Priority Queue",
    "name": "Two heaps for an ordered split",
    "task": "Maintain lower and upper halves with both order and size invariants.",
    "remember": "Keep an ordered lower half and upper half whose sizes differ by at most one.",
    "watchFor": "Size balance alone is insufficient: every lower-half value must also be no greater than every upper-half value.",
    "problemIds": [
      295
    ],
    "variantKeys": [
      "295"
    ]
  },
  {
    "id": "H06",
    "chapter": "Heap / Priority Queue",
    "name": "Difference arrays and event sweeps",
    "task": "Apply endpoint changes and reconstruct simultaneous resource use.",
    "remember": "Record changes at boundaries and reconstruct the active total with a running sum.",
    "watchFor": "An ending event releases capacity at its endpoint. The displayed solution does not need a heap.",
    "problemIds": [
      1094
    ],
    "variantKeys": [
      "1094"
    ]
  },
  {
    "id": "H07",
    "chapter": "Heap / Priority Queue",
    "name": "Cooldown frame counting",
    "task": "Derive idle slots from maximum frequency; explicit formula/greedy overlap.",
    "remember": "The most frequent task determines repeated cooldown frames; tied maximum frequencies occupy the last frame.",
    "watchFor": "Take the maximum of the frame bound and the number of tasks. This is a counting formula, not heap execution.",
    "problemIds": [
      621
    ],
    "variantKeys": [
      "621"
    ]
  },
  {
    "id": "R01",
    "chapter": "Backtracking",
    "name": "Subset and combination enumeration",
    "task": "Control reuse and duplicates with the next start index and copy completed paths.",
    "remember": "A start index controls which choices remain and whether order matters.",
    "watchFor": "Reuse the same index only when repetition is allowed; skip equal candidates at the same depth and copy saved paths.",
    "problemIds": [
      1863,
      78,
      39,
      40,
      77,
      90
    ],
    "variantKeys": [
      "1863",
      "78",
      "39",
      "40",
      "77",
      "90"
    ]
  },
  {
    "id": "R02",
    "chapter": "Backtracking",
    "name": "Permutation enumeration",
    "task": "Choose unused positions and undo both the path and usage state.",
    "remember": "Track used positions while constructing an ordered arrangement, then undo both changes.",
    "watchFor": "Duplicate values need a consistent order among equal positions; a value-only set loses distinct copies.",
    "problemIds": [
      46,
      47
    ],
    "variantKeys": [
      "46",
      "47"
    ]
  },
  {
    "id": "R03",
    "chapter": "Backtracking",
    "name": "Constrained sequence construction",
    "task": "Expand legal next symbols using counters or position-specific choices.",
    "remember": "Extend only prefixes whose counters or next-position choices remain legal.",
    "watchFor": "Closing brackets cannot outnumber opening brackets. Position-specific alphabets are different from arbitrary permutations.",
    "problemIds": [
      22,
      17
    ],
    "variantKeys": [
      "22",
      "17"
    ]
  },
  {
    "id": "R04",
    "chapter": "Backtracking",
    "name": "Path scoped grid visits",
    "task": "Mark a cell for one candidate path and restore it when returning.",
    "remember": "Visited cells belong to the current candidate path, so restore them when that path returns.",
    "watchFor": "Permanent marks would prevent another candidate from using the same cell later.",
    "problemIds": [
      79,
      212
    ],
    "variantKeys": [
      "79",
      "212"
    ]
  },
  {
    "id": "R05",
    "chapter": "Backtracking",
    "name": "Partitioning by valid cuts",
    "task": "Choose a valid prefix and recurse on the remaining suffix.",
    "remember": "Choose a valid next segment and recurse from its ending position.",
    "watchFor": "The segment's own validity check is part of the work; do not partition first and assume every segment is valid.",
    "problemIds": [
      131,
      140
    ],
    "variantKeys": [
      "131",
      "140"
    ]
  },
  {
    "id": "R06",
    "chapter": "Backtracking",
    "name": "Bucket assignment and symmetry pruning",
    "task": "Assign each item once, respect capacity, and skip equivalent bucket states.",
    "remember": "Place each item in one compatible bucket and undo unsuccessful placements.",
    "watchFor": "Buckets with equal current sums are interchangeable at that depth; avoid exploring those equivalent placements twice.",
    "problemIds": [
      473,
      698
    ],
    "variantKeys": [
      "473",
      "698"
    ]
  },
  {
    "id": "R07",
    "chapter": "Backtracking",
    "name": "Constraint occupancy sets",
    "task": "Track occupied columns and both diagonal directions while placing choices.",
    "remember": "Keep occupancy sets that let you reject an attacked position immediately.",
    "watchFor": "Restore columns and both diagonal identifiers after every attempted placement; counting solutions differs from saving boards.",
    "problemIds": [
      51,
      52
    ],
    "variantKeys": [
      "51",
      "52"
    ]
  },
  {
    "id": "R08",
    "chapter": "Backtracking",
    "name": "Memoized suffix enumeration",
    "task": "Cache all completions of a suffix, preserving output construction costs.",
    "remember": "All ways to finish a suffix depend on its start position, so cache those completions.",
    "watchFor": "Memoization does not eliminate the cost of constructing every output sentence. An empty completion is a valid base result.",
    "problemIds": [
      140
    ],
    "variantKeys": [
      "140"
    ]
  },
  {
    "id": "TR01",
    "chapter": "Tries",
    "name": "Trie insertion and prefix lookup",
    "task": "Distinguish an existing path from a complete stored address.",
    "remember": "A trie path represents a prefix; a separate terminal marker represents a stored word.",
    "watchFor": "A successful prefix lookup must not make a shorter, unstored word appear present.",
    "problemIds": [
      208,
      211,
      212
    ],
    "variantKeys": [
      "208",
      "211",
      "212"
    ]
  },
  {
    "id": "TR02",
    "chapter": "Tries",
    "name": "Wildcard branching in a trie",
    "task": "Follow one child for a literal or all children for a wildcard.",
    "remember": "A literal follows one branch while a wildcard tries every character child.",
    "watchFor": "Do not treat the terminal marker as another character, and require a terminal at the end of the query.",
    "problemIds": [
      211
    ],
    "variantKeys": [
      "211"
    ]
  },
  {
    "id": "TR03",
    "chapter": "Tries",
    "name": "Trie guided grid search",
    "task": "Combine dictionary prefix pruning, path restoration, and result deduplication.",
    "remember": "Carry a trie position through grid backtracking so impossible prefixes stop immediately.",
    "watchFor": "Restore the board path, remove found terminals to avoid duplicates, and prune only exhausted trie branches.",
    "problemIds": [
      212
    ],
    "variantKeys": [
      "212"
    ]
  },
  {
    "id": "TR04",
    "chapter": "Tries",
    "name": "Dictionary segmentation dynamic programming",
    "task": "Choose skipping a character or completing a dictionary word; explicit DP overlap.",
    "remember": "For each prefix, choose between leaving its last character unused and finishing with a dictionary word.",
    "watchFor": "The displayed implementation uses DP and a set, despite being listed in the Tries chapter.",
    "problemIds": [
      2707
    ],
    "variantKeys": [
      "2707"
    ]
  },
  {
    "id": "G01",
    "chapter": "Graphs",
    "name": "Local edge accounting and degrees",
    "task": "Count boundary contributions or inbound/outbound balance without traversal.",
    "remember": "Sometimes local edge contributions or degrees answer the question without visiting paths.",
    "watchFor": "Shared boundaries must not be double-counted; trust balance relies on the problem's distinct directed relationships.",
    "problemIds": [
      463,
      997
    ],
    "variantKeys": [
      "463",
      "997"
    ]
  },
  {
    "id": "G02",
    "chapter": "Graphs",
    "name": "Custom alphabet comparisons",
    "task": "Use the first differing character and reject longer-before-shorter prefixes.",
    "remember": "Lexicographic order is decided by the first differing character, or by length when one word is a prefix.",
    "watchFor": "A longer word cannot precede its own prefix. Inferred constraints must not add edges for later differences.",
    "problemIds": [
      953,
      269
    ],
    "variantKeys": [
      "953",
      "269"
    ]
  },
  {
    "id": "G03",
    "chapter": "Graphs",
    "name": "Reachability and connected components",
    "task": "Visit each reachable state once and restart from unvisited components.",
    "remember": "Mark a discovered state before scheduling it, then visit its reachable component once.",
    "watchFor": "Count components by traversal starts, not by visited nodes; isolated vertices are components too.",
    "problemIds": [
      200,
      695,
      133,
      130,
      261,
      1462,
      323,
      684,
      721,
      2709
    ],
    "variantKeys": [
      "200",
      "200-iterative",
      "695",
      "695-iterative",
      "133",
      "133-iterative",
      "130",
      "130-iterative",
      "261",
      "1462",
      "323",
      "684",
      "721",
      "2709"
    ]
  },
  {
    "id": "G04",
    "chapter": "Graphs",
    "name": "Multisource breadth first search",
    "task": "Seed every source before expanding shortest-distance layers.",
    "remember": "Put all sources in the initial queue before expanding equal-distance layers.",
    "watchFor": "Starting a separate complete BFS from each source repeats work and can obscure simultaneous arrival times.",
    "problemIds": [
      286,
      994
    ],
    "variantKeys": [
      "286",
      "994"
    ]
  },
  {
    "id": "G05",
    "chapter": "Graphs",
    "name": "Implicit state graphs",
    "task": "Generate valid next states or use feature buckets to find neighbors.",
    "remember": "The graph may be defined by allowed transformations rather than a stored edge list.",
    "watchFor": "Generate only legal states, reject blocked states, and distinguish a distance in moves from a count of words.",
    "problemIds": [
      752,
      127
    ],
    "variantKeys": [
      "752",
      "127"
    ]
  },
  {
    "id": "G06",
    "chapter": "Graphs",
    "name": "Border reachability and reverse traversal",
    "task": "Search from exits or safe boundaries, then intersect or complement the visited sets.",
    "remember": "Search from the safe boundary or destination, reversing movement when necessary.",
    "watchFor": "Pacific/Atlantic climbs in reverse and intersects two visited sets; surrounded regions preserves border-connected cells.",
    "problemIds": [
      417,
      130
    ],
    "variantKeys": [
      "417",
      "130",
      "130-iterative"
    ]
  },
  {
    "id": "G07",
    "chapter": "Graphs",
    "name": "Topological ordering",
    "task": "Release a node only when its remaining prerequisite count reaches zero.",
    "remember": "A node becomes available only when all of its incoming prerequisites have been removed.",
    "watchFor": "An ordinary visited set cannot replace indegrees. Include isolated nodes and detect cycles by unfinished nodes.",
    "problemIds": [
      207,
      210,
      269,
      2392
    ],
    "variantKeys": [
      "207",
      "210",
      "269",
      "2392"
    ]
  },
  {
    "id": "G08",
    "chapter": "Graphs",
    "name": "Undirected cycle checks and edge removal",
    "task": "Distinguish a parent edge from a cycle, or test connectivity with a candidate excluded.",
    "remember": "In an undirected traversal, the edge back to the parent is expected; another discovered neighbor indicates a cycle.",
    "watchFor": "Connectivity is a separate requirement. Testing removal of a candidate edge needs the correct exclusion and input-order tie rule.",
    "problemIds": [
      261,
      684,
      1584,
      1489
    ],
    "variantKeys": [
      "261",
      "684",
      "1584",
      "1489"
    ]
  },
  {
    "id": "G09",
    "chapter": "Graphs",
    "name": "Repeated searches and transitive closure",
    "task": "Precompute all-source reachability or expand allowed intermediate vertices.",
    "remember": "Reachability from one source is one row; all-pairs answers need all rows or an intermediate-vertex recurrence.",
    "watchFor": "Do not reuse one global visited set across source searches. Floyd-Warshall keeps the intermediate vertex in the outer loop.",
    "problemIds": [
      1462
    ],
    "variantKeys": [
      "1462",
      "1462-floyd-warshall"
    ]
  },
  {
    "id": "G10",
    "chapter": "Graphs",
    "name": "Multiplicative path queries",
    "task": "Store reciprocal edges and accumulate products along a path.",
    "remember": "Accumulate a product along equation edges and store the reciprocal relation too.",
    "watchFor": "An unknown variable divided by itself is still unknown. These path weights multiply rather than add.",
    "problemIds": [
      399
    ],
    "variantKeys": [
      "399"
    ]
  },
  {
    "id": "G11",
    "chapter": "Graphs",
    "name": "Leaf layer removal",
    "task": "Peel current leaves together until the tree centers remain.",
    "remember": "Remove the current outer layer of leaves together to expose the next layer.",
    "watchFor": "New leaves belong to the next round. Handle a single-node tree before applying the one-or-two-center stop rule.",
    "problemIds": [
      310
    ],
    "variantKeys": [
      "310"
    ]
  },
  {
    "id": "G12",
    "chapter": "Graphs",
    "name": "Disjoint sets",
    "task": "Find representatives, merge components, and compress parent paths.",
    "remember": "A representative identifies a component; union changes connectivity and path compression shortens future finds.",
    "watchFor": "Only a successful merge reduces component count. Rank balancing and path compression are separate operations.",
    "problemIds": [
      323,
      684,
      721,
      1584,
      1489,
      2709
    ],
    "variantKeys": [
      "323-union-find",
      "684-union-find",
      "721-union-find",
      "1584-union-find",
      "1489-union-find",
      "2709-union-find"
    ]
  },
  {
    "id": "G13",
    "chapter": "Graphs",
    "name": "Shared feature graph construction",
    "task": "Connect items through emails or prime-factor representatives instead of every pair.",
    "remember": "Shared features can connect a whole group through one representative instead of every pair.",
    "watchFor": "Emails are identities; prime factors require factorization. Duplicate input values can still be different graph vertices.",
    "problemIds": [
      721,
      2709
    ],
    "variantKeys": [
      "721",
      "721-union-find",
      "2709",
      "2709-union-find"
    ]
  },
  {
    "id": "D01",
    "chapter": "Advanced Graphs",
    "name": "Additive Dijkstra",
    "task": "Finalize the smallest reachable nonnegative path distance and skip outdated entries.",
    "remember": "With nonnegative edges, the smallest unsettled distance can be finalized next.",
    "watchFor": "The heap can contain outdated entries. Marking an arbitrary weighted neighbor final when first enqueued is unsafe.",
    "problemIds": [
      743
    ],
    "variantKeys": [
      "743"
    ]
  },
  {
    "id": "D02",
    "chapter": "Advanced Graphs",
    "name": "Bottleneck path search",
    "task": "Replace path addition with a maximum while minimizing the resulting bottleneck.",
    "remember": "A bottleneck path combines steps with max instead of addition, while competing paths are compared by min.",
    "watchFor": "Edge-effort relaxation and the specialized vertex-elevation model have different discovery rules; do not interchange them blindly.",
    "problemIds": [
      1631,
      778
    ],
    "variantKeys": [
      "1631",
      "778"
    ]
  },
  {
    "id": "D03",
    "chapter": "Advanced Graphs",
    "name": "Bounded edge relaxation",
    "task": "Use the previous round to limit a path to a fixed number of edges.",
    "remember": "One relaxation round may use only distances from the previous round.",
    "watchFor": "Writing and reading the same array can chain several edges in one round and violate the stop limit.",
    "problemIds": [
      787
    ],
    "variantKeys": [
      "787"
    ]
  },
  {
    "id": "D04",
    "chapter": "Advanced Graphs",
    "name": "Kruskal minimum spanning tree",
    "task": "Accept edges in cost order only when they join separate components.",
    "remember": "Consider edges by increasing cost and accept only connections between separate components.",
    "watchFor": "BFS can test connectivity, but cost ordering is what makes this Kruskal. A shortest-path tree is a different objective.",
    "problemIds": [
      1584,
      1489
    ],
    "variantKeys": [
      "1584",
      "1584-union-find",
      "1489",
      "1489-union-find"
    ]
  },
  {
    "id": "D05",
    "chapter": "Advanced Graphs",
    "name": "Spanning tree edge sensitivity",
    "task": "Recompute cost with an edge excluded or forced and retain original edge indices.",
    "remember": "Compare the best spanning-tree cost with an edge excluded and with it forced.",
    "watchFor": "Disconnected candidates have infinite cost, and answers must preserve original edge indices after sorting.",
    "problemIds": [
      1489
    ],
    "variantKeys": [
      "1489",
      "1489-union-find"
    ]
  },
  {
    "id": "D06",
    "chapter": "Advanced Graphs",
    "name": "Eulerian traversal",
    "task": "Consume every edge once and append vertices when their outgoing edges are exhausted.",
    "remember": "Consume edges during exploration and append a vertex only after its outgoing edges are exhausted.",
    "watchFor": "A visited-vertex set would lose repeated airports and duplicate tickets. Reverse the completed postorder route.",
    "problemIds": [
      332
    ],
    "variantKeys": [
      "332",
      "332-iterative"
    ]
  },
  {
    "id": "I01",
    "chapter": "Intervals",
    "name": "Merging and inserting intervals",
    "task": "Extend an overlapping interval or preserve the completed prefix and suffix.",
    "remember": "Keep completed intervals separate from the current merged interval and extend overlap with the larger end.",
    "watchFor": "Insertion starts with sorted disjoint intervals; general merging must sort first. Shared endpoints merge here.",
    "problemIds": [
      57,
      56
    ],
    "variantKeys": [
      "57",
      "56"
    ]
  },
  {
    "id": "I02",
    "chapter": "Intervals",
    "name": "Overlap detection and conflict removal",
    "task": "Treat touching endpoints correctly and keep the earlier end when removing conflicts.",
    "remember": "Sort by start, then either detect an overlap or remove one conflicting interval and retain the smaller end.",
    "watchFor": "Touching endpoints are allowed. Keeping the larger end belongs to merging, not minimizing removals.",
    "problemIds": [
      435,
      252
    ],
    "variantKeys": [
      "435",
      "252"
    ]
  },
  {
    "id": "I03",
    "chapter": "Intervals",
    "name": "Resource reuse and delayed allocation",
    "task": "Track earliest release, available resource IDs, and tie-breaking rules.",
    "remember": "The earliest release tells you whether an existing resource can be reused.",
    "watchFor": "Delayed assignments preserve duration; available IDs and busy release times have different ordering and tie rules.",
    "problemIds": [
      253,
      2402
    ],
    "variantKeys": [
      "253",
      "2402"
    ]
  },
  {
    "id": "I04",
    "chapter": "Intervals",
    "name": "Offline interval queries",
    "task": "Sort queries, add eligible intervals, discard expired candidates, and restore query order.",
    "remember": "Process queries in sorted order, adding eligible intervals and lazily discarding expired candidates.",
    "watchFor": "Heap priority is interval size, while expiration uses the right endpoint. Restore the queries' original order.",
    "problemIds": [
      1851
    ],
    "variantKeys": [
      "1851"
    ]
  }
];
export const implementations = [
  {
    "key": "1929",
    "problemId": 1929,
    "title": "Concatenation of Array",
    "name": "Primary",
    "units": [
      "A01"
    ],
    "rule": "Write each item to i and i+n; preserve input order and return a separate output array.",
    "entryPoints": [
      "getConcatenation"
    ],
    "exampleCount": 2,
    "sourceHash": "b112973216d82c8ad49279aa718e66b113af4c144d5502d97732afcf251c4a81"
  },
  {
    "key": "217",
    "problemId": 217,
    "title": "Contains Duplicate",
    "name": "Primary",
    "units": [
      "A02"
    ],
    "rule": "Check membership before insertion; return on the first repeated value.",
    "entryPoints": [
      "containsDuplicate"
    ],
    "exampleCount": 2,
    "sourceHash": "3c6054161fc1320adcbb5b3ac1f1e4871648ae32be1c8f663da8b8080cf42029"
  },
  {
    "key": "242",
    "problemId": 242,
    "title": "Valid Anagram",
    "name": "Primary",
    "units": [
      "A03"
    ],
    "rule": "Compare character multiplicities, not just the set of characters; reject unequal lengths.",
    "entryPoints": [
      "isAnagram"
    ],
    "exampleCount": 2,
    "sourceHash": "a45ab690df1de7850c6a9a8ed9a2f5ea390e97fce086de81d86cf89dd01ed93b"
  },
  {
    "key": "1",
    "problemId": 1,
    "title": "Two Sum",
    "name": "Primary",
    "units": [
      "A04"
    ],
    "rule": "Look up target-current before storing the current index so an item cannot pair with itself.",
    "entryPoints": [
      "twoSum"
    ],
    "exampleCount": 2,
    "sourceHash": "e98e9e921f37be501eff961dd1fbc9b383763f0169f26b78b807787c60866a76"
  },
  {
    "key": "14",
    "problemId": 14,
    "title": "Longest Common Prefix",
    "name": "Primary",
    "units": [
      "A01"
    ],
    "rule": "Compare the same character position across strings; stop at mismatch or the shortest string's end.",
    "entryPoints": [
      "longestCommonPrefix"
    ],
    "exampleCount": 2,
    "sourceHash": "0be3fad1d5c7743c6489d6d70807c73a276fe581788d905df66beb74735f152e"
  },
  {
    "key": "49",
    "problemId": 49,
    "title": "Group Anagrams",
    "name": "Primary",
    "units": [
      "A03"
    ],
    "rule": "Sort each word to form a canonical grouping key; preserve all original words in each bucket.",
    "entryPoints": [
      "groupAnagrams"
    ],
    "exampleCount": 2,
    "sourceHash": "9af808e77d1aa936cbdac258198511500c12960637cb2d9dfda4b8b7d9b90cd9"
  },
  {
    "key": "27",
    "problemId": 27,
    "title": "Remove Element",
    "name": "Primary",
    "units": [
      "A01"
    ],
    "rule": "The prefix before the write pointer contains only retained values; return its logical length.",
    "entryPoints": [
      "removeElement"
    ],
    "exampleCount": 2,
    "sourceHash": "e08259ba330ba499d5487048eb47f9b37185927811224305f891495c974c3dc4"
  },
  {
    "key": "169",
    "problemId": 169,
    "title": "Majority Element",
    "name": "Primary",
    "units": [
      "A06"
    ],
    "rule": "Cancel unequal votes; the guaranteed more-than-half majority makes a final verification unnecessary.",
    "entryPoints": [
      "majorityElement"
    ],
    "exampleCount": 2,
    "sourceHash": "0477eaacc18f1ca8bd1fa719d69666b786e3d1aa4d70fb614655a07fc15e610c"
  },
  {
    "key": "705",
    "problemId": 705,
    "title": "Design HashSet",
    "name": "Primary",
    "units": [
      "A05"
    ],
    "rule": "Separate chaining must check duplicates and delete within a collision bucket; current code is not direct addressing.",
    "entryPoints": [
      "MyHashSet"
    ],
    "exampleCount": 2,
    "sourceHash": "8034438696cebd88e5f4fdbaa67ce2b4ef919846ff642863cd5b177e548b62db"
  },
  {
    "key": "706",
    "problemId": 706,
    "title": "Design HashMap",
    "name": "Primary",
    "units": [
      "A05"
    ],
    "rule": "Store key/value pairs in collision buckets; updating a key must not create another entry.",
    "entryPoints": [
      "MyHashMap"
    ],
    "exampleCount": 2,
    "sourceHash": "75208162cd3818d80a5efbed4872c218f48eaed59b2c97455bc34928aa010e48"
  },
  {
    "key": "912",
    "problemId": 912,
    "title": "Sort an Array",
    "name": "Primary",
    "units": [
      "A07"
    ],
    "rule": "Build the heap bottom-up, then move maxima into a sorted suffix; no built-in sort or copied subarrays.",
    "entryPoints": [
      "sortArray"
    ],
    "exampleCount": 2,
    "sourceHash": "75347d2bfb195e0e3fb39e1b969bd741a2c52ccb04d442bcf1412ff8ae313458"
  },
  {
    "key": "75",
    "problemId": 75,
    "title": "Sort Colors",
    "name": "Primary",
    "units": [
      "A08"
    ],
    "rule": "Maintain low/mid/high regions; do not advance mid after swapping in an unclassified value from high.",
    "entryPoints": [
      "sortColors"
    ],
    "exampleCount": 2,
    "sourceHash": "fa4cc2b6cea3d98d0f11c301f50b2b011df7cedfc18eded63863240216d687a7"
  },
  {
    "key": "347",
    "problemId": 347,
    "title": "Top K Frequent Elements",
    "name": "Primary",
    "units": [
      "A03",
      "A09"
    ],
    "rule": "Bucket by frequency and scan downward; this displayed solution is not a top-k heap.",
    "entryPoints": [
      "topKFrequent"
    ],
    "exampleCount": 2,
    "sourceHash": "d8f9d8bbc9c43e58cdd217f6e17683e90f792cd87f3b4bccf5124649445cca37"
  },
  {
    "key": "271",
    "problemId": 271,
    "title": "Encode and Decode Strings",
    "name": "Primary",
    "units": [
      "A10"
    ],
    "rule": "Read a decimal length and then exactly that many characters; empty strings and embedded delimiters must round-trip.",
    "entryPoints": [
      "encode",
      "decode"
    ],
    "exampleCount": 2,
    "sourceHash": "1ff9af187c17d99c570f23d020130145a627aa1f9e45b4201af00f6f4612a1f5"
  },
  {
    "key": "304",
    "problemId": 304,
    "title": "Range Sum Query 2D Immutable",
    "name": "Primary",
    "units": [
      "A11"
    ],
    "rule": "Use a padded prefix matrix and subtract top/left overlap once; a 2D array alone does not make this excluded DP.",
    "entryPoints": [
      "NumMatrix"
    ],
    "exampleCount": 2,
    "sourceHash": "052935783e7c321dd1033a5533b3145264b38b3a3513430708fd25788e94fb50"
  },
  {
    "key": "238",
    "problemId": 238,
    "title": "Product of Array Except Self",
    "name": "Primary",
    "units": [
      "A12"
    ],
    "rule": "Combine products strictly before and after each index; handle zeros without division and use output as workspace.",
    "entryPoints": [
      "productExceptSelf"
    ],
    "exampleCount": 2,
    "sourceHash": "8e1b15736174b8b43c5806a50d9d77625c09336127c552bb13cb7bca714b406b"
  },
  {
    "key": "36",
    "problemId": 36,
    "title": "Valid Sudoku",
    "name": "Primary",
    "units": [
      "A02"
    ],
    "rule": "Maintain separate row, column, and box sets; ignore empty cells and check all three constraints before insertion.",
    "entryPoints": [
      "isValidSudoku"
    ],
    "exampleCount": 2,
    "sourceHash": "766ab4c40d5e54026a7de83d6fed1007378a46267ff2d997760d761fd5993a86"
  },
  {
    "key": "128",
    "problemId": 128,
    "title": "Longest Consecutive Sequence",
    "name": "Primary",
    "units": [
      "A02"
    ],
    "rule": "Only start a consecutive run if its predecessor is absent; iterate distinct values to avoid repeated starts.",
    "entryPoints": [
      "longestConsecutive"
    ],
    "exampleCount": 2,
    "sourceHash": "86f0d87d1576be27f39f45740b9c52215e8f726f40580dfe50749ebb962fabeb"
  },
  {
    "key": "122",
    "problemId": 122,
    "title": "Best Time to Buy And Sell Stock II",
    "name": "Primary",
    "units": [
      "A15"
    ],
    "rule": "Add every positive adjacent price difference; unlimited transactions justify realizing every rising segment.",
    "entryPoints": [
      "maxProfit"
    ],
    "exampleCount": 2,
    "sourceHash": "f710d995b105d9cc074d10fcdb7a2dab5d4f807791fcbca06a5b295530518ae0"
  },
  {
    "key": "229",
    "problemId": 229,
    "title": "Majority Element II",
    "name": "Primary",
    "units": [
      "A06"
    ],
    "rule": "At most two values exceed n/3; candidate cancellation must be followed by actual-frequency verification.",
    "entryPoints": [
      "majorityElement"
    ],
    "exampleCount": 2,
    "sourceHash": "7db1956312b4f1071b90525881b2ff533d00a556f73bc0b0f2e3c5e7183b9841"
  },
  {
    "key": "560",
    "problemId": 560,
    "title": "Subarray Sum Equals K",
    "name": "Primary",
    "units": [
      "A13",
      "A04"
    ],
    "rule": "Seed prefix frequency zero with one, query currentSum-k before incrementing, and count repeated prefixes; negatives prevent a generic sum window.",
    "entryPoints": [
      "subarraySum"
    ],
    "exampleCount": 2,
    "sourceHash": "30ec7016a4a82316fd1cab6f2a4fd1abce7208133558bd24ee2082e6bafef374"
  },
  {
    "key": "41",
    "problemId": 41,
    "title": "First Missing Positive",
    "name": "Primary",
    "units": [
      "A14"
    ],
    "rule": "Put v at v-1 only when 1<=v<=n; stop on duplicate occupants to prevent an infinite swap loop.",
    "entryPoints": [
      "firstMissingPositive"
    ],
    "exampleCount": 2,
    "sourceHash": "743d44859f1dfa9babf25f2c798c6e8c6217ab35342e0d8ec7cc271b88b3d210"
  },
  {
    "key": "344",
    "problemId": 344,
    "title": "Reverse String",
    "name": "Primary",
    "units": [
      "P01"
    ],
    "rule": "Swap endpoints in place until pointers meet; no returned copy is required.",
    "entryPoints": [
      "reverseString"
    ],
    "exampleCount": 2,
    "sourceHash": "6a7ce7ccbd76ad880d509ca5fb9b1f0f64611394bd23b7f7d76988567d642018"
  },
  {
    "key": "125",
    "problemId": 125,
    "title": "Valid Palindrome",
    "name": "Primary",
    "units": [
      "P01"
    ],
    "rule": "Skip non-alphanumeric characters and compare normalized case before moving both pointers.",
    "entryPoints": [
      "isPalindrome"
    ],
    "exampleCount": 2,
    "sourceHash": "dc1a61762e3b733f18773c25d593a98f55a71c5b84a92a6ca6f5648a12de59f0"
  },
  {
    "key": "680",
    "problemId": 680,
    "title": "Valid Palindrome II",
    "name": "Primary",
    "units": [
      "P01"
    ],
    "rule": "At the first mismatch, test either one-character deletion; do not allow another deletion inside the helper.",
    "entryPoints": [
      "validPalindrome"
    ],
    "exampleCount": 2,
    "sourceHash": "a19b3d262e7c363c3eeb488bb17846debf3ae184ecec252914492d3e1f3bc3ec"
  },
  {
    "key": "1768",
    "problemId": 1768,
    "title": "Merge Strings Alternately",
    "name": "Primary",
    "units": [
      "P02"
    ],
    "rule": "Alternate elements from independent sequences and then append any remainder; sorted order is not required.",
    "entryPoints": [
      "mergeAlternately"
    ],
    "exampleCount": 2,
    "sourceHash": "40c23e110325ec2d1ee7cbdcd4b420520e4439af8b827889758ba05f764e642d"
  },
  {
    "key": "88",
    "problemId": 88,
    "title": "Merge Sorted Array",
    "name": "Primary",
    "units": [
      "P02"
    ],
    "rule": "Merge backward into spare capacity so unread values in the first array are not overwritten.",
    "entryPoints": [
      "merge"
    ],
    "exampleCount": 2,
    "sourceHash": "f340b6cc232dcc65437f2640cc8ac313e6a56d1fa7d5770b4b66855f232b532c"
  },
  {
    "key": "26",
    "problemId": 26,
    "title": "Remove Duplicates From Sorted Array",
    "name": "Primary",
    "units": [
      "A01"
    ],
    "rule": "Sorted duplicates are adjacent; compare against the last retained value and return the compacted prefix length.",
    "entryPoints": [
      "removeDuplicates"
    ],
    "exampleCount": 2,
    "sourceHash": "6e63a47167433c008b02fff0c2b4ff3f384e874b6cc87464c23573c923862a24"
  },
  {
    "key": "167",
    "problemId": 167,
    "title": "Two Sum II Input Array Is Sorted",
    "name": "Primary",
    "units": [
      "P03"
    ],
    "rule": "Sorted order proves which endpoint can be discarded; return one-based indices.",
    "entryPoints": [
      "twoSum"
    ],
    "exampleCount": 2,
    "sourceHash": "a716a041d6ee61fb1fffccd987e834f4d0d16a96c706f91b406aca857cf782be"
  },
  {
    "key": "15",
    "problemId": 15,
    "title": "3Sum",
    "name": "Primary",
    "units": [
      "P03"
    ],
    "rule": "Fix one value, solve the remaining pair, and skip duplicate fixed values and duplicate endpoint values.",
    "entryPoints": [
      "threeSum"
    ],
    "exampleCount": 2,
    "sourceHash": "8889f556767020a8b22cc4908b84d7d537aa9b617ba3ff509c273ffb481a3574"
  },
  {
    "key": "18",
    "problemId": 18,
    "title": "4Sum",
    "name": "Primary",
    "units": [
      "P03"
    ],
    "rule": "Fix two values before the pair search; suppress duplicates at both outer levels and both endpoints.",
    "entryPoints": [
      "fourSum"
    ],
    "exampleCount": 2,
    "sourceHash": "7c9b8e2f657fd59bdd95b132be0382536fb38f1594104bc83943860a5c588efc"
  },
  {
    "key": "189",
    "problemId": 189,
    "title": "Rotate Array",
    "name": "Primary",
    "units": [
      "P01"
    ],
    "rule": "Reduce k modulo n, reverse the whole array, then reverse the first k and remaining elements.",
    "entryPoints": [
      "rotate"
    ],
    "exampleCount": 2,
    "sourceHash": "9a6b393d5c5c3076146a373e841fe96d8a3b2ba2fae7b52296bb93587a9278df"
  },
  {
    "key": "11",
    "problemId": 11,
    "title": "Container With Most Water",
    "name": "Primary",
    "units": [
      "P04"
    ],
    "rule": "Area uses the shorter endpoint times width; only moving a limiting endpoint can improve the answer.",
    "entryPoints": [
      "maxArea"
    ],
    "exampleCount": 2,
    "sourceHash": "391469445510f906fccfd14515975ed6ee36efce868fdd86d64d157d84ee30ca"
  },
  {
    "key": "881",
    "problemId": 881,
    "title": "Boats to Save People",
    "name": "Primary",
    "units": [
      "P05"
    ],
    "rule": "The heaviest person always leaves this iteration; pair with the lightest only if the limit permits.",
    "entryPoints": [
      "numRescueBoats"
    ],
    "exampleCount": 2,
    "sourceHash": "071fbe43d01508b97c6a67f23b5129cbd0cafbe21da50e6813dad124a76fe172"
  },
  {
    "key": "42",
    "problemId": 42,
    "title": "Trapping Rain Water",
    "name": "Primary",
    "units": [
      "P04"
    ],
    "rule": "Track maxima from both ends and process the side with the smaller known boundary; this is not the container-area formula.",
    "entryPoints": [
      "trap"
    ],
    "exampleCount": 2,
    "sourceHash": "acbe57b2d12fc4439f25b1b607ccafdc243f381cdaa5229d5ef2a779713e3d97"
  },
  {
    "key": "219",
    "problemId": 219,
    "title": "Contains Duplicate II",
    "name": "Primary",
    "units": [
      "W01",
      "A02"
    ],
    "rule": "Compare against at most the preceding k items; expire the item at i-k after inserting the current item.",
    "entryPoints": [
      "containsNearbyDuplicate"
    ],
    "exampleCount": 2,
    "sourceHash": "927e9a28f1676aae9880f7a08bad7b8fa32e4b05f1ffd6905a18b533a896fb9d"
  },
  {
    "key": "121",
    "problemId": 121,
    "title": "Best Time to Buy And Sell Stock",
    "name": "Primary",
    "units": [
      "W05"
    ],
    "rule": "Track the minimum price seen before or at today and the best sale gain; only one buy/sell transaction is allowed.",
    "entryPoints": [
      "maxProfit"
    ],
    "exampleCount": 2,
    "sourceHash": "030608f5ff6b5b351d5e0bb29d4a6e16e53271a0ee117e47413a23cda5e63994"
  },
  {
    "key": "3",
    "problemId": 3,
    "title": "Longest Substring Without Repeating Characters",
    "name": "Primary",
    "units": [
      "W02",
      "A02"
    ],
    "rule": "While the incoming character is already present, remove from the left; record the longest repaired window.",
    "entryPoints": [
      "lengthOfLongestSubstring"
    ],
    "exampleCount": 2,
    "sourceHash": "e592ba38bc111f2aae1e81482caddc24901b82392195598b227e4d98d29a26ca"
  },
  {
    "key": "424",
    "problemId": 424,
    "title": "Longest Repeating Character Replacement",
    "name": "Primary",
    "units": [
      "W02",
      "A03"
    ],
    "rule": "Use window length minus historical maximum frequency; the nondecreasing max and single shrink seek maximum length, not an always-valid materialized window.",
    "entryPoints": [
      "characterReplacement"
    ],
    "exampleCount": 2,
    "sourceHash": "cdb395b6401301decc27da1eb85d8996dfee91ca137772855a2ca95cbfbcef49"
  },
  {
    "key": "567",
    "problemId": 567,
    "title": "Permutation In String",
    "name": "Primary",
    "units": [
      "W01",
      "A03"
    ],
    "rule": "Keep exact counts for a fixed-length window and update equality matches on both entry and exit, including the final window.",
    "entryPoints": [
      "checkInclusion"
    ],
    "exampleCount": 2,
    "sourceHash": "57d0114a85f8000038c319cafe5bd9ba53b1c2e7cc363b1c895cb6321ea479fd"
  },
  {
    "key": "209",
    "problemId": 209,
    "title": "Minimum Size Subarray Sum",
    "name": "Primary",
    "units": [
      "W03"
    ],
    "rule": "Positive numbers make shrinking a sum-valid window monotone; update minimum length before removing from the left.",
    "entryPoints": [
      "minSubArrayLen"
    ],
    "exampleCount": 2,
    "sourceHash": "a2faebe780f911f8ed189717defe1697ee3a31cd086b7735fbde89e0d18f7f44"
  },
  {
    "key": "658",
    "problemId": 658,
    "title": "Find K Closest Elements",
    "name": "Primary",
    "units": [
      "B01"
    ],
    "rule": "Binary-search the start of a length-k sorted window using boundary distances; equal distances favor the left window.",
    "entryPoints": [
      "findClosestElements"
    ],
    "exampleCount": 2,
    "sourceHash": "d3479aa9d2bcb7f5d62dd574f5cc1d32ade3221fff28821dc0affb4d40e13864"
  },
  {
    "key": "76",
    "problemId": 76,
    "title": "Minimum Window Substring",
    "name": "Primary",
    "units": [
      "W03",
      "A03"
    ],
    "rule": "Track satisfied distinct requirements while respecting duplicate character counts; shrink while all requirements remain satisfied.",
    "entryPoints": [
      "minWindow"
    ],
    "exampleCount": 2,
    "sourceHash": "d19e0ef44f7204c3dcc8cb18bd7c727fe9356469efc038d0535794ffde0fa43f"
  },
  {
    "key": "239",
    "problemId": 239,
    "title": "Sliding Window Maximum",
    "name": "Primary",
    "units": [
      "W04",
      "L05"
    ],
    "rule": "Expire indices at the front, remove dominated values from the back, then emit the front after k arrivals; JS uses a circular deque.",
    "entryPoints": [
      "maxSlidingWindow"
    ],
    "exampleCount": 2,
    "sourceHash": "362ff6c752029c9fb818eea6e30c6aecd7618e56aeda4643369cf33216a1c23d"
  },
  {
    "key": "682",
    "problemId": 682,
    "title": "Baseball Game",
    "name": "Primary",
    "units": [
      "S01"
    ],
    "rule": "C removes the latest score; D and + derive a new score from existing history without consuming those operands.",
    "entryPoints": [
      "calPoints"
    ],
    "exampleCount": 2,
    "sourceHash": "2a9a6c4c76494ed843b0f8fa23e07e6273fe85e58f78766dd6875a100ec42bd5"
  },
  {
    "key": "20",
    "problemId": 20,
    "title": "Valid Parentheses",
    "name": "Primary",
    "units": [
      "S02"
    ],
    "rule": "A closing bracket must match the latest opener; reject premature closers and unmatched openers at the end.",
    "entryPoints": [
      "isValid"
    ],
    "exampleCount": 3,
    "sourceHash": "329fa3132b99128d6488d78868cc1a4166c30e78bdcc7f5c0184d7b327134e89"
  },
  {
    "key": "225",
    "problemId": 225,
    "title": "Implement Stack Using Queues",
    "name": "Two queues",
    "units": [
      "S04"
    ],
    "rule": "Primary uses active/helper queues and transfers on push; all operations must stay FIFO, including top from the front.",
    "entryPoints": [
      "MyStack"
    ],
    "exampleCount": 2,
    "sourceHash": "5c173392995557ea65309c133386517cba528639406ef92038ed2e40cd816d84"
  },
  {
    "key": "225-one-queue",
    "problemId": 225,
    "title": "Implement Stack Using Queues",
    "name": "One queue",
    "variant": "one-queue",
    "units": [
      "S04"
    ],
    "rule": "Rotate the previous size elements after enqueueing; only queue-front removal and queue-back insertion are used.",
    "entryPoints": [
      "MyStack"
    ],
    "exampleCount": 2,
    "sourceHash": "b3052b747d398e28caa3d2e491ac25b4b09baa8966d97358fd253b37e836d0d9"
  },
  {
    "key": "232",
    "problemId": 232,
    "title": "Implement Queue using Stacks",
    "name": "Primary",
    "units": [
      "S04"
    ],
    "rule": "Transfer the input stack only when the output stack is empty; each item transfers at most once, giving amortized constant operations.",
    "entryPoints": [
      "MyQueue"
    ],
    "exampleCount": 2,
    "sourceHash": "a57b26a346f37336cc9f34ad6cd4f7e2f3f0ee478a927ff0cfefc6a104d4e348"
  },
  {
    "key": "155",
    "problemId": 155,
    "title": "Min Stack",
    "name": "Primary",
    "units": [
      "S05"
    ],
    "rule": "Store a minimum at each depth, including duplicate minima, and pop values and minima together.",
    "entryPoints": [
      "MinStack"
    ],
    "exampleCount": 2,
    "sourceHash": "f09709389b7d1a6a385423ad44d9bb92dfb539ab41aafac3beeeb4271cdc1024"
  },
  {
    "key": "150",
    "problemId": 150,
    "title": "Evaluate Reverse Polish Notation",
    "name": "Primary",
    "units": [
      "S01"
    ],
    "rule": "Pop the right operand before the left; subtraction/division preserve that order and division truncates toward zero.",
    "entryPoints": [
      "evalRPN"
    ],
    "exampleCount": 2,
    "sourceHash": "89e4eb1325f19c922a0584e555dba5a584923650113f5422ce00f42d7e921398"
  },
  {
    "key": "735",
    "problemId": 735,
    "title": "Asteroid Collision",
    "name": "Primary",
    "units": [
      "S03"
    ],
    "rule": "Only a right-moving stack top and left-moving incoming item collide; distinguish smaller, equal, and larger sizes and repeat while alive.",
    "entryPoints": [
      "asteroidCollision"
    ],
    "exampleCount": 2,
    "sourceHash": "1270585a27ffcf6ab5b926e0f1a0b18968c0801869ee99a8bf9864acb2165e77"
  },
  {
    "key": "739",
    "problemId": 739,
    "title": "Daily Temperatures",
    "name": "Primary",
    "units": [
      "S06"
    ],
    "rule": "Store unresolved indices; pop only on a strictly warmer temperature and record the index difference.",
    "entryPoints": [
      "dailyTemperatures"
    ],
    "exampleCount": 2,
    "sourceHash": "a39eefb2b9e77a71d0c662f3412c7cd7871f89cee761acd04bb0fab6b00fe000"
  },
  {
    "key": "901",
    "problemId": 901,
    "title": "Online Stock Span",
    "name": "Primary",
    "units": [
      "S06"
    ],
    "rule": "Store price/span pairs; absorb spans while previous price<=current price, including equal prices.",
    "entryPoints": [
      "StockSpanner"
    ],
    "exampleCount": 2,
    "sourceHash": "a4c160fb5f2f673d64440a7e4661d5564299cf2f23886474280ef51080be7d3f"
  },
  {
    "key": "853",
    "problemId": 853,
    "title": "Car Fleet",
    "name": "Primary",
    "units": [
      "S08"
    ],
    "rule": "Sort positions nearest-to-target first; a following arrival time no greater than the fleet ahead joins it, including equality.",
    "entryPoints": [
      "carFleet"
    ],
    "exampleCount": 2,
    "sourceHash": "bc7df561e5fb0a9f70d7abb9952b6977477c1b1264ec2b51801b256366ad2fc4"
  },
  {
    "key": "71",
    "problemId": 71,
    "title": "Simplify Path",
    "name": "Primary",
    "units": [
      "S03"
    ],
    "rule": "Ignore empty components and '.', pop for '..' only when possible, and treat other dot strings as ordinary names.",
    "entryPoints": [
      "simplifyPath"
    ],
    "exampleCount": 2,
    "sourceHash": "87deca93747d52c240bfc5966067e0ae7a4ec960e9a021f1faeb5289b5638cec"
  },
  {
    "key": "394",
    "problemId": 394,
    "title": "Decode String",
    "name": "Primary",
    "units": [
      "S02"
    ],
    "rule": "Save repeat count and outer text at '['; support multi-digit counts and restore the outer context at ']'.",
    "entryPoints": [
      "decodeString"
    ],
    "exampleCount": 2,
    "sourceHash": "ae0d65385b048355ec6c578d13eae6f9e43c08b41ae48c6306d1ff0048d022d6"
  },
  {
    "key": "895",
    "problemId": 895,
    "title": "Maximum Frequency Stack",
    "name": "Primary",
    "units": [
      "S07"
    ],
    "rule": "Keep a stack for each attained frequency; pop the highest-frequency most-recent item and lower maxFreq only when its bucket empties.",
    "entryPoints": [
      "FreqStack"
    ],
    "exampleCount": 2,
    "sourceHash": "29ce4be6a74a92077a582037a41207c6be03c691e2a30f3d1b080dcadce509a1"
  },
  {
    "key": "84",
    "problemId": 84,
    "title": "Largest Rectangle In Histogram",
    "name": "Primary",
    "units": [
      "S06"
    ],
    "rule": "Increasing stack closes rectangles at a smaller height; JS carries the earliest left edge, Python uses indices; a temporary zero flushes remaining bars.",
    "entryPoints": [
      "largestRectangleArea"
    ],
    "exampleCount": 2,
    "sourceHash": "85fe6af1c96e0276f1e49a8415718f32c81953aff757c7406bb9c9c87d4037ee"
  },
  {
    "key": "704",
    "problemId": 704,
    "title": "Binary Search",
    "name": "Primary",
    "units": [
      "B01"
    ],
    "rule": "Use an exact-match closed interval; discarding mid requires lo=mid+1 or hi=mid-1.",
    "entryPoints": [
      "search"
    ],
    "exampleCount": 2,
    "sourceHash": "bc0803e389b54d5b738c8be93e072b98ffc21c7dd3398b9b28179c7bb6408fe3"
  },
  {
    "key": "35",
    "problemId": 35,
    "title": "Search Insert Position",
    "name": "Primary",
    "units": [
      "B01"
    ],
    "rule": "Find the first value>=target in a half-open range; n is a valid insertion result.",
    "entryPoints": [
      "searchInsert"
    ],
    "exampleCount": 2,
    "sourceHash": "16495016bd288ad46cf625009925520ca046abf83f6b8b8e1b28d8837daa0f34"
  },
  {
    "key": "374",
    "problemId": 374,
    "title": "Guess Number Higher Or Lower",
    "name": "Primary",
    "units": [
      "B01"
    ],
    "rule": "The comparison comes from guess(mid), not array access; map the oracle's sign to the correct half.",
    "entryPoints": [
      "guessNumber"
    ],
    "exampleCount": 2,
    "sourceHash": "949df3bd0cf412fa21359d709df5a3321273cc2fd383004968f72546506c9706"
  },
  {
    "key": "69",
    "problemId": 69,
    "title": "Sqrt(x)",
    "name": "Primary",
    "units": [
      "B01"
    ],
    "rule": "Find the first integer with square>x and subtract one; zero and one require correct exclusive bounds.",
    "entryPoints": [
      "mySqrt"
    ],
    "exampleCount": 2,
    "sourceHash": "7be9899d1da6e025ab72351cb57751aed732e516d604de95738f082f429bb133"
  },
  {
    "key": "74",
    "problemId": 74,
    "title": "Search a 2D Matrix",
    "name": "Primary",
    "units": [
      "B01"
    ],
    "rule": "The whole matrix must be globally ordered across row boundaries; current code maps a flat index to row/column.",
    "entryPoints": [
      "searchMatrix"
    ],
    "exampleCount": 2,
    "sourceHash": "99151015affbe35d2ec37504a024f8d32497bbc411d76ec7b8823b66d4fbb0b3"
  },
  {
    "key": "875",
    "problemId": 875,
    "title": "Koko Eating Bananas",
    "name": "Primary",
    "units": [
      "B02"
    ],
    "rule": "Search speed from 1 to max pile; feasibility sums ceil(pile/speed), with each pile costing separate hours.",
    "entryPoints": [
      "minEatingSpeed"
    ],
    "exampleCount": 2,
    "sourceHash": "44df98f56ebe5d163c68f42a1b336008edf4c8e247e8694a860a6540d9d8ada5"
  },
  {
    "key": "1011",
    "problemId": 1011,
    "title": "Capacity to Ship Packages Within D Days",
    "name": "Primary",
    "units": [
      "B02"
    ],
    "rule": "Search max weight through total weight; preserve package order and start a new day only when the next weight would overflow.",
    "entryPoints": [
      "shipWithinDays"
    ],
    "exampleCount": 2,
    "sourceHash": "169a6cd568e28316fba96525ecceb5dbd27ab24e8da162bca4fdeefe5ab221e0"
  },
  {
    "key": "153",
    "problemId": 153,
    "title": "Find Minimum In Rotated Sorted Array",
    "name": "Primary",
    "units": [
      "B03"
    ],
    "rule": "Compare mid with the right endpoint; retain mid when it may be the minimum.",
    "entryPoints": [
      "findMin"
    ],
    "exampleCount": 2,
    "sourceHash": "4fae30570e620eaa1e0f75f9017fe4be7131c3c6ffe0fbf95c2ef1ac91eafd17"
  },
  {
    "key": "33",
    "problemId": 33,
    "title": "Search In Rotated Sorted Array",
    "name": "Primary",
    "units": [
      "B03"
    ],
    "rule": "Identify a sorted half and test whether the target lies in its bounds before discarding a half.",
    "entryPoints": [
      "search"
    ],
    "exampleCount": 2,
    "sourceHash": "7e4d835df441ea553e9b59f14e8d968ac941d497a5230184f21e0bb33feabd43"
  },
  {
    "key": "81",
    "problemId": 81,
    "title": "Search In Rotated Sorted Array II",
    "name": "Primary",
    "units": [
      "B03"
    ],
    "rule": "Equal left and middle values can hide the sorted half; skip an ambiguous endpoint, accepting worst-case linear work.",
    "entryPoints": [
      "search"
    ],
    "exampleCount": 2,
    "sourceHash": "115cba212eb7f82624cc0396dc973e60dd40ef8780243dc561833395776e0480"
  },
  {
    "key": "981",
    "problemId": 981,
    "title": "Time Based Key Value Store",
    "name": "Primary",
    "units": [
      "B01",
      "A03"
    ],
    "rule": "Append timestamped values per key; get finds the latest timestamp<=query, not an exact match, and may return no value.",
    "entryPoints": [
      "TimeMap"
    ],
    "exampleCount": 2,
    "sourceHash": "7e88c9a6dddfa9c3c8bac908db3870417e0b8bbd213bafcf11d04ac508968376"
  },
  {
    "key": "410",
    "problemId": 410,
    "title": "Split Array Largest Sum",
    "name": "Primary",
    "units": [
      "B02"
    ],
    "rule": "For nonnegative values, feasibility counts contiguous groups under a bound; at most k groups can be subdivided to exactly k.",
    "entryPoints": [
      "splitArray"
    ],
    "exampleCount": 2,
    "sourceHash": "0861289f48952b78e162c592a71903ea73d0deb968627c5d5b3b0ca54bdf5896"
  },
  {
    "key": "4",
    "problemId": 4,
    "title": "Median of Two Sorted Arrays",
    "name": "Primary",
    "units": [
      "B04"
    ],
    "rule": "Search the shorter array; complementary cuts must balance sizes and satisfy both cross-boundary inequalities, including empty partitions.",
    "entryPoints": [
      "findMedianSortedArrays"
    ],
    "exampleCount": 2,
    "sourceHash": "14e825bf5db855d9c8145dbf767cd6a7b8a1601b42f82a738073d41727df9e90"
  },
  {
    "key": "1095",
    "problemId": 1095,
    "title": "Find in Mountain Array",
    "name": "Primary",
    "units": [
      "B05",
      "B01"
    ],
    "rule": "Find peak using neighboring values, search ascending side first for the smallest index, then reverse comparisons on the descending side; preserve API-call efficiency.",
    "entryPoints": [
      "findInMountainArray"
    ],
    "exampleCount": 2,
    "sourceHash": "0119ead0bcc5aeaa064ee9aeb4f79c9c2bcbfe4edf850c32308f6d75b294f85c"
  },
  {
    "key": "206",
    "problemId": 206,
    "title": "Reverse Linked List",
    "name": "Primary",
    "units": [
      "L01"
    ],
    "rule": "Save the next node before reversing a pointer; return the final previous node as the new head.",
    "entryPoints": [
      "reverseList"
    ],
    "exampleCount": 2,
    "sourceHash": "ee1c724a9576f7f2776ec3df2a0ca0a3d4560926d475a79d221ac32423065736"
  },
  {
    "key": "21",
    "problemId": 21,
    "title": "Merge Two Sorted Lists",
    "name": "Primary",
    "units": [
      "P02"
    ],
    "rule": "Use a dummy/tail and attach the smaller list head; connect the remaining suffix once one list ends.",
    "entryPoints": [
      "mergeTwoLists"
    ],
    "exampleCount": 2,
    "sourceHash": "7aab8943a5e326a96f5f9db0a0441cf4d2366d9f81ef5cf486818c5cb26b50aa"
  },
  {
    "key": "141",
    "problemId": 141,
    "title": "Linked List Cycle",
    "name": "Primary",
    "units": [
      "L02"
    ],
    "rule": "Fast moves twice and slow once; compare node identities, and check fast and fast.next before advancing.",
    "entryPoints": [
      "hasCycle"
    ],
    "exampleCount": 2,
    "sourceHash": "4c2982c734e69a37a5dcf67b898731f1ce69d969605794031615823f08c48f87"
  },
  {
    "key": "143",
    "problemId": 143,
    "title": "Reorder List",
    "name": "Primary",
    "units": [
      "L02",
      "L01",
      "P02"
    ],
    "rule": "Find the midpoint, disconnect halves, reverse the second, then interleave without leaving a cycle.",
    "entryPoints": [
      "reorderList"
    ],
    "exampleCount": 2,
    "sourceHash": "1e217069095c07306061768abe72ea2d573a43a3ef5cfcda3bf1e48eca0bc69d"
  },
  {
    "key": "19",
    "problemId": 19,
    "title": "Remove Nth Node From End of List",
    "name": "Primary",
    "units": [
      "L02"
    ],
    "rule": "Use a dummy and an n+1-node gap to stop before the removed node, including when it is the head.",
    "entryPoints": [
      "removeNthFromEnd"
    ],
    "exampleCount": 2,
    "sourceHash": "3aee3f5108719c74539018973738e71c9e8497096300a1e3baa0e9000a1db4a4"
  },
  {
    "key": "138",
    "problemId": 138,
    "title": "Copy List With Random Pointer",
    "name": "Primary",
    "units": [
      "L03"
    ],
    "rule": "Create all identity-mapped nodes first, then connect next/random references; equal values are not shared identities.",
    "entryPoints": [
      "copyRandomList"
    ],
    "exampleCount": 2,
    "sourceHash": "1083af01d97f88791bb3e50f772cc7d56581c4b9c7321a7c9bf663f0a6ffe79c"
  },
  {
    "key": "2",
    "problemId": 2,
    "title": "Add Two Numbers",
    "name": "Primary",
    "units": [
      "L04"
    ],
    "rule": "Continue while either list or carry remains; zero-pad exhausted lists and allocate one node per output digit.",
    "entryPoints": [
      "addTwoNumbers"
    ],
    "exampleCount": 2,
    "sourceHash": "91651f928b496aef9465355ec2821f043ee6de91e21225c6da52074f387971f3"
  },
  {
    "key": "287",
    "problemId": 287,
    "title": "Find The Duplicate Number",
    "name": "Primary",
    "units": [
      "L02"
    ],
    "rule": "Treat values as successor indices without mutating the array; after a meeting, reset one pointer and locate the cycle entrance.",
    "entryPoints": [
      "findDuplicate"
    ],
    "exampleCount": 2,
    "sourceHash": "defd21266adeae9c41537875b83b6672d86282377888fe83e99f6e3dcd7d0dfb"
  },
  {
    "key": "92",
    "problemId": 92,
    "title": "Reverse Linked List II",
    "name": "Primary",
    "units": [
      "L01"
    ],
    "rule": "Keep the node before the segment and its original first node; repeatedly insert the next node at the segment front.",
    "entryPoints": [
      "reverseBetween"
    ],
    "exampleCount": 2,
    "sourceHash": "f712b9ad09b2702d77ed474d724754d55a50fc334726be1ea0450ad8f4aa3759"
  },
  {
    "key": "622",
    "problemId": 622,
    "title": "Design Circular Queue",
    "name": "Primary",
    "units": [
      "L05"
    ],
    "rule": "Use head and count to distinguish empty/full; wrap insertion and rear indices within fixed capacity.",
    "entryPoints": [
      "MyCircularQueue"
    ],
    "exampleCount": 2,
    "sourceHash": "c0faacdb05447eb3d10cc817fb945cc98fb173eca6d8cb2ffe3a73ef8e80a121"
  },
  {
    "key": "146",
    "problemId": 146,
    "title": "LRU Cache",
    "name": "Primary",
    "units": [
      "L06"
    ],
    "rule": "Hash lookup plus doubly linked sentinels; reads and writes update recency, and eviction removes both map and list entries.",
    "entryPoints": [
      "LRUCache"
    ],
    "exampleCount": 2,
    "sourceHash": "2971768cf6193d73c1093c11a790f81dfff5f368e3aacddcd8c5b4e296caaea5"
  },
  {
    "key": "460",
    "problemId": 460,
    "title": "LFU Cache",
    "name": "Primary",
    "units": [
      "S07",
      "L06"
    ],
    "rule": "Track key frequency, ordered keys per frequency, and minimum frequency; evict the oldest key in the minimum bucket and update frequency even on reads.",
    "entryPoints": [
      "LFUCache"
    ],
    "exampleCount": 2,
    "sourceHash": "555e4abe07409ad382b7986fe7af191ad5b3c6e1014c017601d9a94e9dd568f6"
  },
  {
    "key": "23",
    "problemId": 23,
    "title": "Merge K Sorted Lists",
    "name": "Primary",
    "units": [
      "H03",
      "P02"
    ],
    "rule": "Keep one node per list in the heap; after appending the smallest node, enqueue only its successor.",
    "entryPoints": [
      "mergeKLists"
    ],
    "exampleCount": 2,
    "sourceHash": "e386b6110b6d18efc898b743ab066510d83e1737645d17bde1bbc6ec944e8bd3"
  },
  {
    "key": "25",
    "problemId": 25,
    "title": "Reverse Nodes In K Group",
    "name": "Primary",
    "units": [
      "L01"
    ],
    "rule": "Verify k nodes exist before rewiring; reverse exactly k and reconnect the untouched or recursively processed suffix.",
    "entryPoints": [
      "reverseKGroup"
    ],
    "exampleCount": 2,
    "sourceHash": "d08cf332a7001d82403f6f223ad76aedb1ff373c0157fd6afd37205a2801489b"
  },
  {
    "key": "94",
    "problemId": 94,
    "title": "Binary Tree Inorder Traversal",
    "name": "Primary",
    "units": [
      "T01"
    ],
    "rule": "Push the full left path, visit the popped node, then enter its right subtree.",
    "entryPoints": [
      "inorderTraversal"
    ],
    "exampleCount": 2,
    "sourceHash": "a80f37c110bcce0f30ce2302c54d4cd5659f096b7e857917dacdd8d00692b82d"
  },
  {
    "key": "144",
    "problemId": 144,
    "title": "Binary Tree Preorder Traversal",
    "name": "Primary",
    "units": [
      "T01"
    ],
    "rule": "Visit before children; push right before left so the stack visits left first.",
    "entryPoints": [
      "preorderTraversal"
    ],
    "exampleCount": 2,
    "sourceHash": "26015554af13733e9390977998ae04f7f4b00104cbb09f2a70bd2e170d5d58c6"
  },
  {
    "key": "145",
    "problemId": 145,
    "title": "Binary Tree Postorder Traversal",
    "name": "Primary",
    "units": [
      "T01"
    ],
    "rule": "Current implementation records root/right/left then reverses output; postorder consumers need child results before processing the parent.",
    "entryPoints": [
      "postorderTraversal"
    ],
    "exampleCount": 2,
    "sourceHash": "f7297bf2460921cd819b9aef5efad8968a7d5f18004fa1867cc9c8e2d6b26566"
  },
  {
    "key": "226",
    "problemId": 226,
    "title": "Invert Binary Tree",
    "name": "Primary",
    "units": [
      "T01"
    ],
    "rule": "Swap both child references at every node and visit the swapped subtrees.",
    "entryPoints": [
      "invertTree"
    ],
    "exampleCount": 2,
    "sourceHash": "a7f65e7e3428e6b27467a2b6dc043817616d23c8adcbd39b87c6512be9626798"
  },
  {
    "key": "104",
    "problemId": 104,
    "title": "Maximum Depth of Binary Tree",
    "name": "Primary",
    "units": [
      "T02"
    ],
    "rule": "Return zero for null and one plus the greater child depth; height is the returned summary.",
    "entryPoints": [
      "maxDepth"
    ],
    "exampleCount": 2,
    "sourceHash": "2a398809da3995989d4b6a6418e12f67bda9d06012fbdb1ab373c9d29c318191"
  },
  {
    "key": "543",
    "problemId": 543,
    "title": "Diameter of Binary Tree",
    "name": "Primary",
    "units": [
      "T02"
    ],
    "rule": "Return a one-branch height but update the best path with both child heights; measure diameter in edges.",
    "entryPoints": [
      "diameterOfBinaryTree"
    ],
    "exampleCount": 2,
    "sourceHash": "6e31783cec98dc54b04ce5592e15c55adfe07ea23271bc85155043b7ce3e915b"
  },
  {
    "key": "110",
    "problemId": 110,
    "title": "Balanced Binary Tree",
    "name": "Primary",
    "units": [
      "T02"
    ],
    "rule": "Use -1 to propagate an unbalanced subtree instead of repeatedly recomputing heights.",
    "entryPoints": [
      "isBalanced"
    ],
    "exampleCount": 2,
    "sourceHash": "6affa40a1b55a44652ff8f15949d195a136195365af6b11be2b054cb7dcb1854"
  },
  {
    "key": "100",
    "problemId": 100,
    "title": "Same Tree",
    "name": "Primary",
    "units": [
      "T03"
    ],
    "rule": "Compare null structure as well as values, then both corresponding child pairs.",
    "entryPoints": [
      "isSameTree"
    ],
    "exampleCount": 2,
    "sourceHash": "13ccc14416c6a9939f55b26ffe0784e529dd4b1c4dc432c3fe8731f50cc8b80c"
  },
  {
    "key": "572",
    "problemId": 572,
    "title": "Subtree of Another Tree",
    "name": "Primary",
    "units": [
      "T03",
      "T01"
    ],
    "rule": "Try structural equality at every candidate root; equality of just the root value is insufficient.",
    "entryPoints": [
      "isSubtree"
    ],
    "exampleCount": 2,
    "sourceHash": "6cc65a361a1749dcd0d3f6111f68632ccef3119193a0c51dd1d1f767566e11de"
  },
  {
    "key": "235",
    "problemId": 235,
    "title": "Lowest Common Ancestor of a Binary Search Tree",
    "name": "Primary",
    "units": [
      "T05"
    ],
    "rule": "Move toward both targets while they lie on one side; the first split or matching ancestor is the answer.",
    "entryPoints": [
      "lowestCommonAncestor"
    ],
    "exampleCount": 2,
    "sourceHash": "38f1eabccb9a46d12618d57cd50813135f4db92118ac0455cafc50362199f8d6"
  },
  {
    "key": "701",
    "problemId": 701,
    "title": "Insert into a Binary Search Tree",
    "name": "Primary",
    "units": [
      "T05"
    ],
    "rule": "Navigate by key comparisons and reconnect the recursive subtree result at the insertion point.",
    "entryPoints": [
      "insertIntoBST"
    ],
    "exampleCount": 2,
    "sourceHash": "be22d4936108430d436375f36eb5d3f03c63a44bc2ea65e00b1695fb3b7caa87"
  },
  {
    "key": "450",
    "problemId": 450,
    "title": "Delete Node in a BST",
    "name": "Primary",
    "units": [
      "T05"
    ],
    "rule": "Handle zero/one child replacement and two-child successor substitution followed by deletion of that successor.",
    "entryPoints": [
      "deleteNode"
    ],
    "exampleCount": 2,
    "sourceHash": "4082d91b8d87dd5ddfdc8db8da4df2cbeacd215815bde8ec57e4dc37f1253ff3"
  },
  {
    "key": "102",
    "problemId": 102,
    "title": "Binary Tree Level Order Traversal",
    "name": "Primary",
    "units": [
      "T06"
    ],
    "rule": "Capture queue length before a level so children belong to the next level.",
    "entryPoints": [
      "levelOrder"
    ],
    "exampleCount": 2,
    "sourceHash": "7124d4cc51af0b339eb8fd45a804f715a2aa7093f0a68036edf73a6e5ff5f506"
  },
  {
    "key": "199",
    "problemId": 199,
    "title": "Binary Tree Right Side View",
    "name": "Primary",
    "units": [
      "T06"
    ],
    "rule": "With left-to-right queue order, keep the last item of each fixed-size level.",
    "entryPoints": [
      "rightSideView"
    ],
    "exampleCount": 2,
    "sourceHash": "6ec158798b8b8245ad07a6d68265a4d8e20195a0586596df6eb008552a948e3b"
  },
  {
    "key": "427",
    "problemId": 427,
    "title": "Construct Quad Tree",
    "name": "Primary",
    "units": [
      "T10",
      "T02"
    ],
    "rule": "Split a square into four quadrants; collapse only when all four children are leaves with the same value.",
    "entryPoints": [
      "construct"
    ],
    "exampleCount": 2,
    "sourceHash": "2acb80fe56fa44ef2d0650b32c41a8d90f0bbeb5f95c77d365e4b0ad1f699eae"
  },
  {
    "key": "1448",
    "problemId": 1448,
    "title": "Count Good Nodes In Binary Tree",
    "name": "Primary",
    "units": [
      "T04"
    ],
    "rule": "Carry the maximum from the current root-to-node path, not a global maximum from unrelated branches.",
    "entryPoints": [
      "goodNodes"
    ],
    "exampleCount": 2,
    "sourceHash": "a896ebec683b161350c90d38918fa58b40b37c2892de363d7e7807f1d9f385fb"
  },
  {
    "key": "98",
    "problemId": 98,
    "title": "Validate Binary Search Tree",
    "name": "Primary",
    "units": [
      "T04",
      "T05"
    ],
    "rule": "Pass strict ancestor bounds; checking each node only against its immediate children is insufficient.",
    "entryPoints": [
      "isValidBST"
    ],
    "exampleCount": 2,
    "sourceHash": "12951c4c721218cfa7641ec6f562a62d74ee3401ad5ba01abc42eef6e4b028e4"
  },
  {
    "key": "230",
    "problemId": 230,
    "title": "Kth Smallest Element In a Bst",
    "name": "Primary",
    "units": [
      "T01",
      "T05"
    ],
    "rule": "Inorder traversal of a BST produces sorted values; stop at the kth visited node.",
    "entryPoints": [
      "kthSmallest"
    ],
    "exampleCount": 2,
    "sourceHash": "6b67086752d5d021e7500d055403983e14f8ec1e9d6fefb948437b97e607a24f"
  },
  {
    "key": "105",
    "problemId": 105,
    "title": "Construct Binary Tree From Preorder And Inorder Traversal",
    "name": "Primary",
    "units": [
      "T07"
    ],
    "rule": "Consume preorder root/left/right while a value-to-inorder-index map identifies subtree bounds; unique values are assumed.",
    "entryPoints": [
      "buildTree"
    ],
    "exampleCount": 2,
    "sourceHash": "e232d61e2ba01058eb8593bcd805b9378add2c653bf472d67e0bf24b10c7a7b9"
  },
  {
    "key": "337",
    "problemId": 337,
    "title": "House Robber III",
    "name": "Primary",
    "units": [
      "T09"
    ],
    "rule": "Return take/skip states: taking a parent forces skipping children; skipping permits each child's better state.",
    "entryPoints": [
      "rob"
    ],
    "exampleCount": 2,
    "sourceHash": "49afd7110067218e2b2a6ecaa1b8b1f4080fe651a1c913da97e49caf4c6f871b"
  },
  {
    "key": "1325",
    "problemId": 1325,
    "title": "Delete Leaves With a Given Value",
    "name": "Primary",
    "units": [
      "T02"
    ],
    "rule": "Process and reconnect children before deciding whether the current node has become a removable leaf.",
    "entryPoints": [
      "removeLeafNodes"
    ],
    "exampleCount": 2,
    "sourceHash": "54aa47c063efb44544a145e88f26ef9ee0ce4c043f6e7977f3ff0c13d0fd0c69"
  },
  {
    "key": "124",
    "problemId": 124,
    "title": "Binary Tree Maximum Path Sum",
    "name": "Primary",
    "units": [
      "T02"
    ],
    "rule": "Clamp negative child gains to zero; update a through-node best but return only one branch, and handle all-negative trees.",
    "entryPoints": [
      "maxPathSum"
    ],
    "exampleCount": 2,
    "sourceHash": "d01566369131570f553f84b621f0ffce63d1fd80a49523a64d90d23b5bd317a9"
  },
  {
    "key": "297",
    "problemId": 297,
    "title": "Serialize And Deserialize Binary Tree",
    "name": "Primary",
    "units": [
      "T08"
    ],
    "rule": "Include null tokens to preserve shape; decoding must consume tokens in the same preorder grammar.",
    "entryPoints": [
      "serialize",
      "deserialize"
    ],
    "exampleCount": 2,
    "sourceHash": "a500d4ab2d7f4df837c4ae8f12012095f01a1b64117b207561fb55cad4460377"
  },
  {
    "key": "703",
    "problemId": 703,
    "title": "Kth Largest Element In a Stream",
    "name": "Primary",
    "units": [
      "H01"
    ],
    "rule": "Keep at most k largest arrivals in a min-heap; repeated add calls maintain the invariant across time.",
    "entryPoints": [
      "KthLargest"
    ],
    "exampleCount": 2,
    "sourceHash": "df8ce868d7797a363cb5b64518b05e18a4596bab42f8086e91533b5e094770b8"
  },
  {
    "key": "1046",
    "problemId": 1046,
    "title": "Last Stone Weight",
    "name": "Primary",
    "units": [
      "H02"
    ],
    "rule": "Extract the two maximum weights, reinsert a positive difference, and handle zero or one survivor.",
    "entryPoints": [
      "lastStoneWeight"
    ],
    "exampleCount": 2,
    "sourceHash": "921bd3018a3b90641a7e87ec429d46c2de54a0f175c7b66b81a4e7637ff0e42c"
  },
  {
    "key": "973",
    "problemId": 973,
    "title": "K Closest Points to Origin",
    "name": "Primary",
    "units": [
      "H01"
    ],
    "rule": "Rank by squared distance; a max-heap of k retained points evicts the farthest without computing square roots.",
    "entryPoints": [
      "kClosest"
    ],
    "exampleCount": 3,
    "sourceHash": "7e88564d6ede9cf5e6df0023ac378da68bb313603f7bf71ef99badae4dc98b49"
  },
  {
    "key": "215",
    "problemId": 215,
    "title": "Kth Largest Element In An Array",
    "name": "Primary",
    "units": [
      "A08"
    ],
    "rule": "Randomized three-way quickselect narrows around sorted index n-k; the equal band prevents duplicate-heavy degeneration.",
    "entryPoints": [
      "findKthLargest"
    ],
    "exampleCount": 3,
    "sourceHash": "89688f82942dc28e362301edb8ed3e994e1ad6daabc7f6b48dd2a6b8158bb566"
  },
  {
    "key": "621",
    "problemId": 621,
    "title": "Task Scheduler",
    "name": "Primary",
    "units": [
      "H07",
      "A03"
    ],
    "rule": "Maximum frequency, number tied for it, and cooldown determine a frame lower bound; take max with total task count.",
    "entryPoints": [
      "leastInterval"
    ],
    "exampleCount": 2,
    "sourceHash": "ba8b14d64e24cf302f27f6bff25958e4fd9aef46c25e242db6722e81bb3892f9"
  },
  {
    "key": "355",
    "problemId": 355,
    "title": "Design Twitter",
    "name": "Primary",
    "units": [
      "H03",
      "A03"
    ],
    "rule": "Merge each followed user's newest-first stream, include self, and cap output at ten; JS repeatedly sorts candidates, Python uses a heap.",
    "entryPoints": [
      "Twitter"
    ],
    "exampleCount": 2,
    "sourceHash": "9de98c73c15e09d1fbb28bcabbc4d223d57c01ae9bb61abecbc64aa5c5017419"
  },
  {
    "key": "1834",
    "problemId": 1834,
    "title": "Single Threaded CPU",
    "name": "Primary",
    "units": [
      "H04"
    ],
    "rule": "Sort arrivals, enqueue all tasks available at current time, select by duration then original index, and jump time when idle.",
    "entryPoints": [
      "getOrder"
    ],
    "exampleCount": 2,
    "sourceHash": "5d98c422805445140d14d490bf2ecb49f20284cb2d9a4622fcaf16f617541f67"
  },
  {
    "key": "767",
    "problemId": 767,
    "title": "Reorganize String",
    "name": "Primary",
    "units": [
      "H02",
      "A03"
    ],
    "rule": "Hold the last character out for one choice, reinsert its remaining count afterward; JS sorts candidates, Python uses a heap.",
    "entryPoints": [
      "reorganizeString"
    ],
    "exampleCount": 2,
    "sourceHash": "1a41f48d4aee6eb9cb14dccc234f7673779e6a023df30484979ce8ce88739e29"
  },
  {
    "key": "1405",
    "problemId": 1405,
    "title": "Longest Happy String",
    "name": "Primary",
    "units": [
      "H02"
    ],
    "rule": "If the highest-count character would make three equal characters, use the next candidate or stop; reinsert unconsumed counts.",
    "entryPoints": [
      "longestDiverseString"
    ],
    "exampleCount": 2,
    "sourceHash": "50d73fd65250293b5250be7cfe049a08bc80c8cbe75e089b8b0034e5d6a73b85"
  },
  {
    "key": "1094",
    "problemId": 1094,
    "title": "Car Pooling",
    "name": "Primary",
    "units": [
      "H06"
    ],
    "rule": "Add at pickup and subtract at dropoff, then prefix-scan load; dropoff frees capacity at that same coordinate.",
    "entryPoints": [
      "carPooling"
    ],
    "exampleCount": 2,
    "sourceHash": "a76fef629c4a66c04c7f583b8ac94b5504c6bd1cccf99f7dc8cf3b6aee2b8783"
  },
  {
    "key": "295",
    "problemId": 295,
    "title": "Find Median From Data Stream",
    "name": "Primary",
    "units": [
      "H05"
    ],
    "rule": "Enforce both ordering between halves and size difference<=1; median comes from one root or the two roots.",
    "entryPoints": [
      "MedianFinder"
    ],
    "exampleCount": 2,
    "sourceHash": "f57d224b4c5cdacf8066eaa8718a9f04757346df143651181cda3647dc491ed5"
  },
  {
    "key": "502",
    "problemId": 502,
    "title": "IPO",
    "name": "Primary",
    "units": [
      "H04"
    ],
    "rule": "Move newly affordable projects into a profit max-heap and choose at most k; increased capital changes later eligibility.",
    "entryPoints": [
      "findMaximizedCapital"
    ],
    "exampleCount": 2,
    "sourceHash": "c1615c9901b5a53bad8ddb7409744283f5934a20c3d0cf4909be09016778afdb"
  },
  {
    "key": "1863",
    "problemId": 1863,
    "title": "Sum of All Subsets XOR Total",
    "name": "Primary",
    "units": [
      "R01"
    ],
    "rule": "Include/exclude each value while carrying a running XOR and sum leaf results; the aggregation itself requires XOR.",
    "entryPoints": [
      "subsetXORSum"
    ],
    "exampleCount": 2,
    "sourceHash": "335b1816762883179b40a8311dd4032b44ca426788d1fd43b9a1bc4a0c6227af"
  },
  {
    "key": "78",
    "problemId": 78,
    "title": "Subsets",
    "name": "Primary",
    "units": [
      "R01"
    ],
    "rule": "Record every recursion node as a subset; advance start past a chosen position and copy the path.",
    "entryPoints": [
      "subsets"
    ],
    "exampleCount": 2,
    "sourceHash": "632622ff7335eeebf1fb1415d816166a3746d72dde53518cdf995bfb5e9ff159"
  },
  {
    "key": "39",
    "problemId": 39,
    "title": "Combination Sum",
    "name": "Primary",
    "units": [
      "R01"
    ],
    "rule": "Candidates are reusable, so recurse with the same index; positive sorted values permit remaining-target pruning.",
    "entryPoints": [
      "combinationSum"
    ],
    "exampleCount": 2,
    "sourceHash": "94dd511c2fa937ffe82da94b9ace0ee7499b300c53f3d4ab1c5667399264bd8e"
  },
  {
    "key": "40",
    "problemId": 40,
    "title": "Combination Sum II",
    "name": "Primary",
    "units": [
      "R01"
    ],
    "rule": "Use each position once, recurse at i+1, and skip equal values only at the same recursion depth.",
    "entryPoints": [
      "combinationSum2"
    ],
    "exampleCount": 2,
    "sourceHash": "6c9d9602af7a3e9ceb010e5ba31e3af1da23b3ea53f4a104ab4da4a189072559"
  },
  {
    "key": "77",
    "problemId": 77,
    "title": "Combinations",
    "name": "Primary",
    "units": [
      "R01"
    ],
    "rule": "Record only paths of length k; stop choices early when too few remaining values can complete the path.",
    "entryPoints": [
      "combine"
    ],
    "exampleCount": 2,
    "sourceHash": "dd2a1bcd274dc994f8b7a69b95571fe762b1bbde5cf995780abb1da9f0d877c9"
  },
  {
    "key": "46",
    "problemId": 46,
    "title": "Permutations",
    "name": "Primary",
    "units": [
      "R02"
    ],
    "rule": "Choose any unused index; undo both the chosen value and its used marker.",
    "entryPoints": [
      "permute"
    ],
    "exampleCount": 2,
    "sourceHash": "8fff23afcf166310f9aff5111da7aa88a49584ccdd9d0126e67c07f1659b2fa6"
  },
  {
    "key": "90",
    "problemId": 90,
    "title": "Subsets II",
    "name": "Primary",
    "units": [
      "R01"
    ],
    "rule": "Sort and skip duplicates only when i>start; duplicates may still appear together deeper in a subset.",
    "entryPoints": [
      "subsetsWithDup"
    ],
    "exampleCount": 2,
    "sourceHash": "37f86a1e699d0b5af20154fc38e4db101e24c593cef1a55a27c473266d449327"
  },
  {
    "key": "47",
    "problemId": 47,
    "title": "Permutations II",
    "name": "Primary",
    "units": [
      "R02"
    ],
    "rule": "For equal values, require the previous equal index to have been used on this path before using the next one.",
    "entryPoints": [
      "permuteUnique"
    ],
    "exampleCount": 2,
    "sourceHash": "8c21a568429713c102bd749b775a33f42165f72f4da858e7ecaf960ffee83c27"
  },
  {
    "key": "22",
    "problemId": 22,
    "title": "Generate Parentheses",
    "name": "Primary",
    "units": [
      "R03"
    ],
    "rule": "Open count cannot exceed n; close count cannot exceed open count, so invalid prefixes are never generated.",
    "entryPoints": [
      "generateParenthesis"
    ],
    "exampleCount": 2,
    "sourceHash": "e01b992a258b86675ddd2c6c87268b12ada7d5e8c329b9d2c5224440d31ff943"
  },
  {
    "key": "79",
    "problemId": 79,
    "title": "Word Search",
    "name": "Primary",
    "units": [
      "R04"
    ],
    "rule": "Marks belong to one candidate word path and must be restored even after finding a matching continuation.",
    "entryPoints": [
      "exist"
    ],
    "exampleCount": 2,
    "sourceHash": "cb6fcb3204bf5b40b6fdd41da518225c066773cd237a63988d06313c42bb41af"
  },
  {
    "key": "131",
    "problemId": 131,
    "title": "Palindrome Partitioning",
    "name": "Primary",
    "units": [
      "R05",
      "P01"
    ],
    "rule": "Try each next cut, validate the chosen substring as a palindrome, then recurse on the remaining suffix.",
    "entryPoints": [
      "partition"
    ],
    "exampleCount": 2,
    "sourceHash": "122b545548fbe956ac7166249221b9943a7b604c5e07d6bab29aabb2eb8a3298"
  },
  {
    "key": "17",
    "problemId": 17,
    "title": "Letter Combinations of a Phone Number",
    "name": "Primary",
    "units": [
      "R03"
    ],
    "rule": "Each input position has its own allowed character set; this is a Cartesian product, with empty input returning no combinations.",
    "entryPoints": [
      "letterCombinations"
    ],
    "exampleCount": 2,
    "sourceHash": "35aa8f16f05d24c22aba5e3c11e1b90c07f5208e0c40db78284104252c481d5d"
  },
  {
    "key": "473",
    "problemId": 473,
    "title": "Matchsticks to Square",
    "name": "Primary",
    "units": [
      "R06"
    ],
    "rule": "Require a divisible total, place large sticks first, and skip sides with equal current sums; undo unsuccessful placements.",
    "entryPoints": [
      "makesquare"
    ],
    "exampleCount": 2,
    "sourceHash": "e644ef99ffd0b462541941fb2affe89271eb12f513d2f9e71c1d3774bcbf5e26"
  },
  {
    "key": "698",
    "problemId": 698,
    "title": "Partition to K Equal Sum Subsets",
    "name": "Primary",
    "units": [
      "R06"
    ],
    "rule": "Generalize to k target-sum buckets; reject oversized items and try each distinct current bucket sum only once per level.",
    "entryPoints": [
      "canPartitionKSubsets"
    ],
    "exampleCount": 2,
    "sourceHash": "a855aa2b5f039ce3173aafd99ad8203633edcdee4f31a8c6431cadb672d091a5"
  },
  {
    "key": "51",
    "problemId": 51,
    "title": "N Queens",
    "name": "Primary",
    "units": [
      "R07"
    ],
    "rule": "Place one queen per row; track column, row+column, and row-column attacks and restore all three after recursion.",
    "entryPoints": [
      "solveNQueens"
    ],
    "exampleCount": 2,
    "sourceHash": "1448cfd58da2b2a52f0feb311181e227fa4cd20af0e34da34bfb73e274eaf14f"
  },
  {
    "key": "52",
    "problemId": 52,
    "title": "N Queens II",
    "name": "Primary",
    "units": [
      "R07"
    ],
    "rule": "Use the same attack-state search but count completions instead of materializing boards.",
    "entryPoints": [
      "totalNQueens"
    ],
    "exampleCount": 2,
    "sourceHash": "075ebee70ca25066b71cf1d0ae3afee0e10217f105075e926acccbd89bce736b"
  },
  {
    "key": "140",
    "problemId": 140,
    "title": "Word Break II",
    "name": "Primary",
    "units": [
      "R08",
      "R05"
    ],
    "rule": "Memoize all valid sentences for each suffix; combine each valid word with every completion and retain the empty completion base case.",
    "entryPoints": [
      "wordBreak"
    ],
    "exampleCount": 2,
    "sourceHash": "5b51999d11076a18b97e20ee24528823ab3a0a6182858df0126feef1f192ff45"
  },
  {
    "key": "208",
    "problemId": 208,
    "title": "Implement Trie Prefix Tree",
    "name": "Primary",
    "units": [
      "TR01"
    ],
    "rule": "Distinguish end-of-word from an existing prefix; insertion creates missing children without overwriting existing branches.",
    "entryPoints": [
      "Trie"
    ],
    "exampleCount": 2,
    "sourceHash": "528e96caa32fe99b8d9fd0f5d27d6e2ab64f513e514862b6b70d7a9b5af60dbd"
  },
  {
    "key": "211",
    "problemId": 211,
    "title": "Design Add And Search Words Data Structure",
    "name": "Primary",
    "units": [
      "TR02",
      "TR01"
    ],
    "rule": "A dot branches over real character children; an exhausted query succeeds only at an end marker.",
    "entryPoints": [
      "WordDictionary"
    ],
    "exampleCount": 2,
    "sourceHash": "db33b82941c9a71616929fbb23d2fbeef8875c7278c20ce17176c0d6a7a99e37"
  },
  {
    "key": "2707",
    "problemId": 2707,
    "title": "Extra Characters in a String",
    "name": "Primary",
    "units": [
      "TR04"
    ],
    "rule": "Current solution is prefix DP with a dictionary set, not a trie; compare skipping one character with completing every matching word.",
    "entryPoints": [
      "minExtraChar"
    ],
    "exampleCount": 2,
    "sourceHash": "9aac4f4877af128309a088afc49b5d1b3a913a7551cd3f1c91f845d15d43db4d"
  },
  {
    "key": "212",
    "problemId": 212,
    "title": "Word Search II",
    "name": "Primary",
    "units": [
      "TR03",
      "TR01",
      "R04"
    ],
    "rule": "Follow trie prefixes while marking the current board path; remove a found terminal to avoid duplicates and delete exhausted branches.",
    "entryPoints": [
      "findWords"
    ],
    "exampleCount": 2,
    "sourceHash": "a9ae69f7c9356d2b0d089b081974816a46148cbba1bb34648530aa3b9794cf28"
  },
  {
    "key": "463",
    "problemId": 463,
    "title": "Island Perimeter",
    "name": "Primary",
    "units": [
      "G01"
    ],
    "rule": "Count four edges per land cell and subtract two per already-counted shared boundary; traversal is unnecessary.",
    "entryPoints": [
      "islandPerimeter"
    ],
    "exampleCount": 2,
    "sourceHash": "70df0a58b575c98b2117aeb5ecf0e06b7da3cd8d1caac5902156ce86dd893a7f"
  },
  {
    "key": "953",
    "problemId": 953,
    "title": "Verifying An Alien Dictionary",
    "name": "Primary",
    "units": [
      "G02"
    ],
    "rule": "Use supplied character ranks, stop at the first mismatch, and reject a longer word before its own prefix.",
    "entryPoints": [
      "isAlienSorted"
    ],
    "exampleCount": 2,
    "sourceHash": "efb6130473421d2df746c2edc726c675c270b5ca6f5cc1714b813bf6387e4925"
  },
  {
    "key": "997",
    "problemId": 997,
    "title": "Find the Town Judge",
    "name": "Primary",
    "units": [
      "G01"
    ],
    "rule": "Increment inbound and decrement outbound trust balance; the judge must reach n-1 under the distinct-edge constraints.",
    "entryPoints": [
      "findJudge"
    ],
    "exampleCount": 2,
    "sourceHash": "d34efb2d8b7f93b4735c276847e71d11312fcf57d65fde716f72916989e81bf8"
  },
  {
    "key": "200",
    "problemId": 200,
    "title": "Number of Islands",
    "name": "Recursive DFS",
    "units": [
      "G03"
    ],
    "rule": "Restart traversal on each unvisited land cell; recursive and iterative versions mark land permanently for component discovery.",
    "entryPoints": [
      "numIslands"
    ],
    "exampleCount": 6,
    "sourceHash": "9338e5addff3cda6887458fe621f5af0081980a46a790560eedd221c7424a40c"
  },
  {
    "key": "200-iterative",
    "problemId": 200,
    "title": "Number of Islands",
    "name": "Iterative DFS (explicit stack)",
    "variant": "iterative",
    "units": [
      "G03"
    ],
    "rule": "Use an explicit stack and mark before pushing; each land cell is scheduled once.",
    "entryPoints": [
      "numIslands"
    ],
    "exampleCount": 6,
    "sourceHash": "98c1ae3904b5a947eb7622d54c8f721d50165a78727735fc273b62f6c944ee75"
  },
  {
    "key": "695",
    "problemId": 695,
    "title": "Max Area of Island",
    "name": "Recursive DFS",
    "units": [
      "G03"
    ],
    "rule": "Count cells within each component and track the largest area; iterative version counts on pop and marks on push.",
    "entryPoints": [
      "maxAreaOfIsland"
    ],
    "exampleCount": 6,
    "sourceHash": "a4fb8336fe980925401a2e5af9de0ed6f5274bf4592f0ddffed2cf3bef7f8328"
  },
  {
    "key": "695-iterative",
    "problemId": 695,
    "title": "Max Area of Island",
    "name": "Iterative DFS (explicit stack)",
    "variant": "iterative",
    "units": [
      "G03"
    ],
    "rule": "Use an explicit stack, mark before pushing, and maintain a component area counter.",
    "entryPoints": [
      "maxAreaOfIsland"
    ],
    "exampleCount": 6,
    "sourceHash": "d8b1cfd4efda1a43cd1e6f369acf8fc4f59b97678f69ac196ad88bea58a84985"
  },
  {
    "key": "133",
    "problemId": 133,
    "title": "Clone Graph",
    "name": "Recursive DFS",
    "units": [
      "L03",
      "G03"
    ],
    "rule": "Register a clone before exploring neighbors to preserve cycles and shared identities; recursive and iterative versions differ only in traversal control.",
    "entryPoints": [
      "cloneGraph"
    ],
    "exampleCount": 5,
    "sourceHash": "4604515b166841d56427ba571ef7ff0323e2f8dc6d0fb99e3b1fc4de2667de31"
  },
  {
    "key": "133-iterative",
    "problemId": 133,
    "title": "Clone Graph",
    "name": "Iterative DFS (explicit stack)",
    "variant": "iterative",
    "units": [
      "L03",
      "G03"
    ],
    "rule": "Create/map clones when discovered and wire all neighbor references while processing an explicit stack.",
    "entryPoints": [
      "cloneGraph"
    ],
    "exampleCount": 5,
    "sourceHash": "b86568ffd01022637c5db32929d0b7be7982a036e0446bfb9409e020bb654a3b"
  },
  {
    "key": "286",
    "problemId": 286,
    "title": "Walls And Gates",
    "name": "Primary",
    "units": [
      "G04"
    ],
    "rule": "Seed all gates, write distance at discovery, and expand only unfilled rooms so walls and previous discoveries are preserved.",
    "entryPoints": [
      "wallsAndGates"
    ],
    "exampleCount": 2,
    "sourceHash": "d2e3cd3ca21a6bfec345f9f9d5d3e6baddc3a383e988d9c74bfa217f8972d0a4"
  },
  {
    "key": "994",
    "problemId": 994,
    "title": "Rotting Oranges",
    "name": "Primary",
    "units": [
      "G04"
    ],
    "rule": "Seed all rotten cells, count fresh cells, and advance in fixed layers; distinguish no fresh cells from unreachable fresh cells.",
    "entryPoints": [
      "orangesRotting"
    ],
    "exampleCount": 2,
    "sourceHash": "a97170c6318a026506e94f76699298ec89c3e0db836dacfb45d3328fbef6fa47"
  },
  {
    "key": "417",
    "problemId": 417,
    "title": "Pacific Atlantic Water Flow",
    "name": "Iterative DFS (coordinate pairs)",
    "units": [
      "G06"
    ],
    "rule": "Reverse water edges: climb from each ocean's border to equal/higher cells, maintain two visited grids, and intersect them.",
    "entryPoints": [
      "pacificAtlantic"
    ],
    "exampleCount": 6,
    "sourceHash": "5dc0911efacfe537bfee26d2f8b823ef1a085235c69659c7933a179824d74fe3"
  },
  {
    "key": "130",
    "problemId": 130,
    "title": "Surrounded Regions",
    "name": "Recursive DFS",
    "units": [
      "G06",
      "G03"
    ],
    "rule": "Mark border-connected O cells safe, capture the remaining O cells, then restore the safe marker.",
    "entryPoints": [
      "solve"
    ],
    "exampleCount": 6,
    "sourceHash": "8bca7ef27ffddb047bdf5b69ceee79726db49e3aab519df87e4ddf213e5b13d9"
  },
  {
    "key": "130-iterative",
    "problemId": 130,
    "title": "Surrounded Regions",
    "name": "Iterative DFS (explicit stack)",
    "variant": "iterative",
    "units": [
      "G06",
      "G03"
    ],
    "rule": "Use an explicit stack for border safety marking, then capture and restore in a second pass.",
    "entryPoints": [
      "solve"
    ],
    "exampleCount": 6,
    "sourceHash": "3f5d5131c5024c78da7f91b2e4c8fad02513c93257226868d5b73f222c22eeb4"
  },
  {
    "key": "752",
    "problemId": 752,
    "title": "Open The Lock",
    "name": "Primary",
    "units": [
      "G05"
    ],
    "rule": "Generate digit-wheel neighbors, reject dead ends before enqueueing, mark discovered states, and count shortest moves.",
    "entryPoints": [
      "openLock"
    ],
    "exampleCount": 2,
    "sourceHash": "7f25e124ca8690a9e7fd55eeb6e5aed223b79cb457fdc35aff5f8c94d2f5a8c5"
  },
  {
    "key": "207",
    "problemId": 207,
    "title": "Course Schedule",
    "name": "Primary",
    "units": [
      "G07"
    ],
    "rule": "Edges run prerequisite to dependent course; process zero-indegree nodes and require every course to be processed.",
    "entryPoints": [
      "canFinish"
    ],
    "exampleCount": 3,
    "sourceHash": "f4e062b80c6e2f435370d0f5a148b43d840aa92280ea781707a12c19a108c08f"
  },
  {
    "key": "210",
    "problemId": 210,
    "title": "Course Schedule II",
    "name": "Primary",
    "units": [
      "G07"
    ],
    "rule": "Collect the same topological processing order; return no order if a cycle prevents processing all courses.",
    "entryPoints": [
      "findOrder"
    ],
    "exampleCount": 2,
    "sourceHash": "03335de8d001f276e989078d5a9658ea86f27d33d21bcd00527502aa87aea3fe"
  },
  {
    "key": "261",
    "problemId": 261,
    "title": "Graph Valid Tree",
    "name": "Primary",
    "units": [
      "G08",
      "G03"
    ],
    "rule": "Skip the parent edge in undirected DFS, reject any other discovered neighbor, and require full connectivity.",
    "entryPoints": [
      "validTree"
    ],
    "exampleCount": 6,
    "sourceHash": "4524810fbf962dde0110dec416ff6075aa6a0a2b6c7b5bb1a0517621ff87dee5"
  },
  {
    "key": "1462",
    "problemId": 1462,
    "title": "Course Schedule IV",
    "name": "BFS from each course",
    "units": [
      "G09",
      "G03"
    ],
    "rule": "Run BFS separately from every start and retain each reachability row; prerequisite/course edge orientation differs from Course Schedule input pairs.",
    "entryPoints": [
      "checkIfPrerequisite"
    ],
    "exampleCount": 6,
    "sourceHash": "d765f2c8a88705664a9d694d8b27ac0577ff2c67d3c316ee086f2e72b62e01a1"
  },
  {
    "key": "1462-floyd-warshall",
    "problemId": 1462,
    "title": "Course Schedule IV",
    "name": "Floyd-Warshall (reachability table)",
    "variant": "floyd-warshall",
    "units": [
      "G09"
    ],
    "rule": "Floyd-Warshall transitive closure: allow intermediate vertices in the outermost loop and combine reach[i][k] with reach[k][j].",
    "entryPoints": [
      "checkIfPrerequisite"
    ],
    "exampleCount": 6,
    "sourceHash": "5a144f8a18d5014e672a939ae42a84d7b319cc68b338d5428d302c2403c1e994"
  },
  {
    "key": "323",
    "problemId": 323,
    "title": "Number of Connected Components In An Undirected Graph",
    "name": "BFS (queue)",
    "units": [
      "G03"
    ],
    "rule": "Count one BFS start per unvisited component, including isolated vertices.",
    "entryPoints": [
      "countComponents"
    ],
    "exampleCount": 6,
    "sourceHash": "72b3e22be4d2f48cd85b488eacbbe6a17b56cfe8b28100a381d065a27655e2e8"
  },
  {
    "key": "323-union-find",
    "problemId": 323,
    "title": "Number of Connected Components In An Undirected Graph",
    "name": "Union-find with path compression",
    "variant": "union-find",
    "units": [
      "G12"
    ],
    "rule": "Decrement component count only when different representatives merge; compress parent paths.",
    "entryPoints": [
      "countComponents"
    ],
    "exampleCount": 6,
    "sourceHash": "a8422dc4188c58b97f49ffcb713a7a0ed06de776247ff256bb9247fec8757250"
  },
  {
    "key": "684",
    "problemId": 684,
    "title": "Redundant Connection",
    "name": "BFS (build graph first)",
    "units": [
      "G08",
      "G03"
    ],
    "rule": "Build the full graph, try edges in reverse input order, skip the candidate direct move, and test whether another route still connects its endpoints.",
    "entryPoints": [
      "findRedundantConnection"
    ],
    "exampleCount": 5,
    "sourceHash": "67cbd424b6b8d297a0cb02baf97db0d2b1bfab0cf7c58218a076e939fdd26bfd"
  },
  {
    "key": "684-union-find",
    "problemId": 684,
    "title": "Redundant Connection",
    "name": "Union-find with path compression",
    "variant": "union-find",
    "units": [
      "G12"
    ],
    "rule": "Process edges in input order; the first failed union identifies the redundant edge for the given tree-plus-one-edge input.",
    "entryPoints": [
      "findRedundantConnection"
    ],
    "exampleCount": 5,
    "sourceHash": "568ee95ef59693d8ae519c333f44cfad3cfbfac829c813b5195d706818b316eb"
  },
  {
    "key": "721",
    "problemId": 721,
    "title": "Accounts Merge",
    "name": "BFS over email connections",
    "units": [
      "G13",
      "G03"
    ],
    "rule": "Connect emails within each account through one representative, merge transitively by email identity, then sort each component's emails.",
    "entryPoints": [
      "accountsMerge"
    ],
    "exampleCount": 5,
    "sourceHash": "310186de69e027adf10ea671807167e5d4eea4ee559de8ee660a0ab7e5150f33"
  },
  {
    "key": "721-union-find",
    "problemId": 721,
    "title": "Accounts Merge",
    "name": "Union-find with path compression",
    "variant": "union-find",
    "units": [
      "G12",
      "G13"
    ],
    "rule": "Union each account email with its representative; group by root and sort emails after all unions.",
    "entryPoints": [
      "accountsMerge"
    ],
    "exampleCount": 5,
    "sourceHash": "01409a3cb66ed3b5bcd0c723ebcf8a8dfe7ab618912ac55b98d4971314dab54f"
  },
  {
    "key": "399",
    "problemId": 399,
    "title": "Evaluate Division",
    "name": "Primary",
    "units": [
      "G10"
    ],
    "rule": "Add reciprocal weighted edges; path values multiply rather than add, and unknown variables remain invalid even for x/x.",
    "entryPoints": [
      "calcEquation"
    ],
    "exampleCount": 2,
    "sourceHash": "4452a73a5b2ab6a95e567dfb7bc2a8d7dea752caedaf281a6549c2c5d9d195f1"
  },
  {
    "key": "310",
    "problemId": 310,
    "title": "Minimum Height Trees",
    "name": "Primary",
    "units": [
      "G11"
    ],
    "rule": "Remove all leaves in a layer together; a valid tree has one or two final centers, with a separate single-node case.",
    "entryPoints": [
      "findMinHeightTrees"
    ],
    "exampleCount": 2,
    "sourceHash": "30659c3b4927e5ed549b2f3605f219bea2b0ae302d54db37534af0770ef5764d"
  },
  {
    "key": "127",
    "problemId": 127,
    "title": "Word Ladder",
    "name": "Primary",
    "units": [
      "G05"
    ],
    "rule": "Index wildcard patterns to find one-letter neighbors; BFS distance counts words, and endWord must be in the dictionary.",
    "entryPoints": [
      "ladderLength"
    ],
    "exampleCount": 2,
    "sourceHash": "e94600673c3a40aeb9de7c39ecab3af94096527e3348e6ea0fb61443b2a6b7ae"
  },
  {
    "key": "1631",
    "problemId": 1631,
    "title": "Path with Minimum Effort",
    "name": "Primary",
    "units": [
      "D02"
    ],
    "rule": "Relax with max(path effort, absolute edge difference); compare best-known efforts and finalize the target on minimum extraction.",
    "entryPoints": [
      "minimumEffortPath"
    ],
    "exampleCount": 2,
    "sourceHash": "c61e5fed21fbdc07f7ff746c54f0bbd880672f4bb5cdcbf3a03e3a0203d55ba1"
  },
  {
    "key": "743",
    "problemId": 743,
    "title": "Network Delay Time",
    "name": "Primary",
    "units": [
      "D01"
    ],
    "rule": "Nonnegative edges allow first minimum extraction to finalize a node; skip equal/worse duplicate entries and return the maximum reached distance or -1.",
    "entryPoints": [
      "networkDelayTime"
    ],
    "exampleCount": 4,
    "sourceHash": "4b3725a1e506d44a37bb56a1bc4a2e285f1e817b34eb6bf31c1b723e75e2a1fc"
  },
  {
    "key": "332",
    "problemId": 332,
    "title": "Reconstruct Itinerary",
    "name": "Recursive Hierholzer's algorithm",
    "units": [
      "D06"
    ],
    "rule": "Consume ticket edges rather than marking airports visited; use lexical destination order and reverse the postorder route, retaining duplicate tickets.",
    "entryPoints": [
      "findItinerary"
    ],
    "exampleCount": 5,
    "sourceHash": "728f469bc6c7a0ccc397d3e2de16d774ef51f9846e19c967c63d62ecd48a4455"
  },
  {
    "key": "332-iterative",
    "problemId": 332,
    "title": "Reconstruct Itinerary",
    "name": "Iterative Hierholzer's algorithm (explicit stack)",
    "variant": "iterative",
    "units": [
      "D06"
    ],
    "rule": "Explicit path stack consumes tickets; append an airport only when its outgoing tickets are exhausted, then reverse.",
    "entryPoints": [
      "findItinerary"
    ],
    "exampleCount": 5,
    "sourceHash": "affd096b5be50bc9ad0cee1c10f612050d7d9499770a3a2d7442af021d1af775"
  },
  {
    "key": "1584",
    "problemId": 1584,
    "title": "Min Cost to Connect All Points",
    "name": "Kruskal with BFS connectivity",
    "units": [
      "D04",
      "G08"
    ],
    "rule": "Generate Manhattan-weighted edges and apply Kruskal's cost order; primary uses BFS for cycle checks, not BFS as a minimum-cost algorithm.",
    "entryPoints": [
      "minCostConnectPoints"
    ],
    "exampleCount": 5,
    "sourceHash": "cea0c7832f8aa517a780ed1ce0e9750da426285b70d4f96e1f07d72294cacd84"
  },
  {
    "key": "1584-union-find",
    "problemId": 1584,
    "title": "Min Cost to Connect All Points",
    "name": "Kruskal with union-find and path compression",
    "variant": "union-find",
    "units": [
      "D04",
      "G12"
    ],
    "rule": "Keep Kruskal ordering and replace repeated BFS connectivity checks with disjoint sets.",
    "entryPoints": [
      "minCostConnectPoints"
    ],
    "exampleCount": 5,
    "sourceHash": "f2e9ec2a259474447792f323ed8aca640f40d710dd32b7a49f64f96797536c6f"
  },
  {
    "key": "778",
    "problemId": 778,
    "title": "Swim In Rising Water",
    "name": "Primary",
    "units": [
      "D02"
    ],
    "rule": "Cost is the maximum cell elevation on the path; this specialized vertex-cost model marks on insertion, unlike a general Dijkstra relaxation template.",
    "entryPoints": [
      "swimInWater"
    ],
    "exampleCount": 2,
    "sourceHash": "faffb65748ca899606d1d257c1c3caa8d1c970320c8626c70539efc7b62f9146"
  },
  {
    "key": "269",
    "problemId": 269,
    "title": "Alien Dictionary",
    "name": "Primary",
    "units": [
      "G02",
      "G07"
    ],
    "rule": "Infer only the first differing-character edge, deduplicate edges, include isolated characters, reject invalid prefixes, and detect cycles.",
    "entryPoints": [
      "alienOrder"
    ],
    "exampleCount": 2,
    "sourceHash": "a80e49b4ef22647cee52e30bd81c72e73f3380c1734d70e9db1d9c52510f600c"
  },
  {
    "key": "787",
    "problemId": 787,
    "title": "Cheapest Flights Within K Stops",
    "name": "Primary",
    "units": [
      "D03"
    ],
    "rule": "k stops allow k+1 edges; relax from the previous prices array into a copy so one round cannot chain multiple new edges.",
    "entryPoints": [
      "findCheapestPrice"
    ],
    "exampleCount": 2,
    "sourceHash": "4061ed6f922a7aa4af898fbb88f7c201c5abb7464402b51b43a15016a1e1d876"
  },
  {
    "key": "1489",
    "problemId": 1489,
    "title": "Find Critical and Pseudo Critical Edges in Minimum Spanning Tree",
    "name": "Kruskal with BFS connectivity",
    "units": [
      "D05",
      "D04",
      "G08"
    ],
    "rule": "Compare baseline MST cost with edge exclusion and forced inclusion; disconnection means infinite cost and answers use original indices.",
    "entryPoints": [
      "findCriticalAndPseudoCriticalEdges"
    ],
    "exampleCount": 5,
    "sourceHash": "3293240a37028f352003bfdbb0c8358feb2ad1a70ff9f78237f1f1ae3d8c4b42"
  },
  {
    "key": "1489-union-find",
    "problemId": 1489,
    "title": "Find Critical and Pseudo Critical Edges in Minimum Spanning Tree",
    "name": "Kruskal with union-find and path compression",
    "variant": "union-find",
    "units": [
      "D05",
      "D04",
      "G12"
    ],
    "rule": "Retain exclusion/forced-inclusion MST recomputation while using union-find to test each candidate connection.",
    "entryPoints": [
      "findCriticalAndPseudoCriticalEdges"
    ],
    "exampleCount": 5,
    "sourceHash": "c027012c87c49cf9b8196e2242746820494688bef15744780daf20af7d7ed36b"
  },
  {
    "key": "2392",
    "problemId": 2392,
    "title": "Build a Matrix With Conditions",
    "name": "Primary",
    "units": [
      "G07"
    ],
    "rule": "Topologically order row and column constraints independently; either cycle fails the result, otherwise combine both positions for every value.",
    "entryPoints": [
      "buildMatrix"
    ],
    "exampleCount": 2,
    "sourceHash": "f24132006afbd9ed9f9eb9ef0a434c45575ddf4f9170a56e023995d8c23e13a6"
  },
  {
    "key": "2709",
    "problemId": 2709,
    "title": "Greatest Common Divisor Traversal",
    "name": "BFS over shared-prime connections",
    "units": [
      "G13",
      "G03"
    ],
    "rule": "Factor values and connect each prime's indices through one representative; duplicate values remain distinct indices and 1 connects to nothing.",
    "entryPoints": [
      "canTraverseAllPairs"
    ],
    "exampleCount": 6,
    "sourceHash": "42afa684daeeb0d4d019378dbb64b0dbc6908aee913467c74bfd4005644aace0"
  },
  {
    "key": "2709-union-find",
    "problemId": 2709,
    "title": "Greatest Common Divisor Traversal",
    "name": "Union-find with path compression",
    "variant": "union-find",
    "units": [
      "G13",
      "G12"
    ],
    "rule": "Union indices sharing prime factors; handle a single item and any isolated value 1 before checking representatives.",
    "entryPoints": [
      "canTraverseAllPairs"
    ],
    "exampleCount": 6,
    "sourceHash": "82ba041e814cdaf0563f687ca1483ba012a84a28b866fef152b9bf10f575185b"
  },
  {
    "key": "57",
    "problemId": 57,
    "title": "Insert Interval",
    "name": "Primary",
    "units": [
      "I01"
    ],
    "rule": "Input is already sorted and disjoint; preserve the before region, merge overlaps, then append the after region without sorting.",
    "entryPoints": [
      "insert"
    ],
    "exampleCount": 3,
    "sourceHash": "7e2b9d3f880790ee2549d319b10a370f961bd6e815b10a4174539c58b43265c5"
  },
  {
    "key": "56",
    "problemId": 56,
    "title": "Merge Intervals",
    "name": "Primary",
    "units": [
      "I01"
    ],
    "rule": "Sort by start and extend the last end by max on overlap; shared endpoints are merged.",
    "entryPoints": [
      "merge"
    ],
    "exampleCount": 3,
    "sourceHash": "5f77b9be09dfafed7b096ecd2ca7f1c25419b1e0173ddcbdd8de5158b987c279"
  },
  {
    "key": "435",
    "problemId": 435,
    "title": "Non Overlapping Intervals",
    "name": "Primary",
    "units": [
      "I02"
    ],
    "rule": "Sort by start; on strict overlap increment removals and keep the smaller end; touching endpoints are allowed.",
    "entryPoints": [
      "eraseOverlapIntervals"
    ],
    "exampleCount": 4,
    "sourceHash": "53bee5c665a0bc0a23bbe50eec1ede5c36428b9748ba32965d1c2fdc4df7531d"
  },
  {
    "key": "252",
    "problemId": 252,
    "title": "Meeting Rooms",
    "name": "Primary",
    "units": [
      "I02"
    ],
    "rule": "After sorting by start, only consecutive meetings need comparison; equality at an endpoint is allowed.",
    "entryPoints": [
      "canAttendMeetings"
    ],
    "exampleCount": 2,
    "sourceHash": "59300a961c886eeecacb53dedb531a4c26665ec6b66a28da108bdce144324d4d"
  },
  {
    "key": "253",
    "problemId": 253,
    "title": "Meeting Rooms II",
    "name": "Primary",
    "units": [
      "I03"
    ],
    "rule": "Store one end time per allocated room; reuse the earliest room if it has ended, otherwise grow the allocation count.",
    "entryPoints": [
      "minMeetingRooms"
    ],
    "exampleCount": 2,
    "sourceHash": "fa2f4fc526064716d749e3095eaccb0271a240100823ae6922597d315d6b4612"
  },
  {
    "key": "2402",
    "problemId": 2402,
    "title": "Meeting Rooms III",
    "name": "Primary",
    "units": [
      "I03",
      "H04"
    ],
    "rule": "Separate available room IDs from busy end times; release all finished rooms, preserve duration when delayed, and tie-break by smallest room ID.",
    "entryPoints": [
      "mostBooked"
    ],
    "exampleCount": 2,
    "sourceHash": "3e05128d0796c83ada297d98fe0bc9eb0a0d6c63d1304afff8ec319ebbd820f9"
  },
  {
    "key": "1851",
    "problemId": 1851,
    "title": "Minimum Interval to Include Each Query",
    "name": "Primary",
    "units": [
      "I04"
    ],
    "rule": "Sort queries with original indices, insert intervals with left<=query, discard right<query, and minimize inclusive length right-left+1.",
    "entryPoints": [
      "minInterval"
    ],
    "exampleCount": 2,
    "sourceHash": "b1eed1c1809a371ce3370c736286deba0735f816ff876582939d05d09fa899cd"
  }
];

const factories = {
  // #1929 Concatenation of Array · Primary
  // Write each item to i and i+n; preserve input order and return a separate output array.
  "1929": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var getConcatenation = function(nums) {
        const n = nums.length;
        const answer = new Array(2 * n);
        for (let i = 0; i < n; i++) {
            answer[i] = nums[i];
            answer[i + n] = nums[i];
        }
        return answer;
    };
    return { getConcatenation };
  },

  // #217 Contains Duplicate · Primary
  // Check membership before insertion; return on the first repeated value.
  "217": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var containsDuplicate = function(nums) {
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
    };
    return { containsDuplicate };
  },

  // #242 Valid Anagram · Primary
  // Compare character multiplicities, not just the set of characters; reject unequal lengths.
  "242": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var isAnagram = function(s, t) {
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
    };
    return { isAnagram };
  },

  // #1 Two Sum · Primary
  // Look up target-current before storing the current index so an item cannot pair with itself.
  "1": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var twoSum = function(nums, target) {
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
    };
    return { twoSum };
  },

  // #14 Longest Common Prefix · Primary
  // Compare the same character position across strings; stop at mismatch or the shortest string's end.
  "14": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var longestCommonPrefix = function(strs) {
        if (!strs.length) return "";

        // Use first string as reference; scan its characters column by column
        for (let i = 0; i < strs[0].length; i++) {
            const referenceChar = strs[0][i];

            // Check if every other string has the same character at position i
            for (let j = 1; j < strs.length; j++) {
                const isBeyondEnd = i >= strs[j].length;
                const isMismatch = strs[j][i] !== referenceChar;

                if (isBeyondEnd || isMismatch) {
                    // Return the prefix we've confirmed so far
                    return strs[0].substring(0, i);
                }
            }
        }

        // The entire first string is the common prefix
        return strs[0];
    };
    return { longestCommonPrefix };
  },

  // #49 Group Anagrams · Primary
  // Sort each word to form a canonical grouping key; preserve all original words in each bucket.
  "49": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var groupAnagrams = function(strs) {
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
    };
    return { groupAnagrams };
  },

  // #27 Remove Element · Primary
  // The prefix before the write pointer contains only retained values; return its logical length.
  "27": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var removeElement = function(nums, val) {
        // k is our write pointer: the position for the next element to keep
        let k = 0;

        for (const num of nums) {
            // Only write the element if it's not the value we want to remove
            if (num !== val) {
                nums[k] = num;
                k = k + 1;
            }
        }

        // k is now the count of elements that are not equal to val
        return k;
    };
    return { removeElement };
  },

  // #169 Majority Element · Primary
  // Cancel unequal votes; the guaranteed more-than-half majority makes a final verification unnecessary.
  "169": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var majorityElement = function(nums) {
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
    };
    return { majorityElement };
  },

  // #705 Design HashSet · Primary
  // Separate chaining must check duplicates and delete within a collision bucket; current code is not direct addressing.
  "705": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var MyHashSet = function() {
        // Number of buckets — a prime number reduces collisions
        this.bucketCount = 10007;

        // Each bucket is a list (separate chaining to handle collisions)
        this.buckets = Array(this.bucketCount)
            .fill(null)
            .map(() => []);
    };

    // Hash function: maps key to a bucket index
    MyHashSet.prototype._hash = function(key) {
        return key % this.bucketCount;
    };

    MyHashSet.prototype.add = function(key) {
        const bucketIndex = this._hash(key);
        const bucket = this.buckets[bucketIndex];

        // Only add if not already present
        if (!bucket.includes(key)) {
            bucket.push(key);
        }
    };

    MyHashSet.prototype.remove = function(key) {
        const bucketIndex = this._hash(key);
        const bucket = this.buckets[bucketIndex];

        const positionInBucket = bucket.indexOf(key);
        if (positionInBucket !== -1) {
            bucket.splice(positionInBucket, 1);
        }
    };

    MyHashSet.prototype.contains = function(key) {
        const bucketIndex = this._hash(key);
        return this.buckets[bucketIndex].includes(key);
    };
    return { MyHashSet };
  },

  // #706 Design HashMap · Primary
  // Store key/value pairs in collision buckets; updating a key must not create another entry.
  "706": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var MyHashMap = function() {
        this.size = 1009;  // prime number reduces collision clustering
        this.buckets = Array(this.size)
            .fill(null)
            .map(() => []);
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
    };
    return { MyHashMap };
  },

  // #912 Sort an Array · Primary
  // Build the heap bottom-up, then move maxima into a sorted suffix; no built-in sort or copied subarrays.
  "912": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var sortArray = function(nums) {
        function siftDown(root, end) {
            while (root * 2 + 1 < end) {
                let child = root * 2 + 1;
                if (child + 1 < end && nums[child + 1] > nums[child]) child++;
                if (nums[root] >= nums[child]) return;
                [nums[root], nums[child]] = [nums[child], nums[root]];
                root = child;
            }
        }
        for (let root = Math.floor(nums.length / 2) - 1; root >= 0; root--) {
            siftDown(root, nums.length);
        }
        for (let end = nums.length - 1; end > 0; end--) {
            [nums[0], nums[end]] = [nums[end], nums[0]];
            siftDown(0, end);
        }
        return nums;
    };
    return { sortArray };
  },

  // #75 Sort Colors · Primary
  // Maintain low/mid/high regions; do not advance mid after swapping in an unclassified value from high.
  "75": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var sortColors = function(nums) {
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
    };
    return { sortColors };
  },

  // #347 Top K Frequent Elements · Primary
  // Bucket by frequency and scan downward; this displayed solution is not a top-k heap.
  "347": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var topKFrequent = function(nums, k) {
        // Step 1: Count how often each number appears
        const count = new Map();
        for (const num of nums) {
            const current = count.get(num) || 0;
            count.set(num, current + 1);
        }

        // Step 2: Create buckets where index = frequency
        // buckets[3] will hold all numbers that appeared 3 times
        const buckets = Array(nums.length + 1)
            .fill(null)
            .map(() => []);
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
    };
    return { topKFrequent };
  },

  // #271 Encode and Decode Strings · Primary
  // Read a decimal length and then exactly that many characters; empty strings and embedded delimiters must round-trip.
  "271": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var encode = function(strs) {
        // Prefix each string with its length and a '#' delimiter
        // e.g. ["Hello","World"] → "5#Hello5#World"
        return strs.map(s => s.length + '#' + s).join('');
    };

    var decode = function(s) {
        const result = [];
        let readPos = 0;

        while (readPos < s.length) {
            // Find the '#' delimiter to read the length prefix
            const delimPos = s.indexOf('#', readPos);
            const strLength = parseInt(s.substring(readPos, delimPos));

            // Extract exactly strLength characters after the '#'
            const strStart = delimPos + 1;
            const strEnd = strStart + strLength;
            result.push(s.substring(strStart, strEnd));

            // Advance past the delimiter and the string content
            readPos = strEnd;
        }

        return result;
    };
    return { encode, decode };
  },

  // #304 Range Sum Query 2D Immutable · Primary
  // Use a padded prefix matrix and subtract top/left overlap once; a 2D array alone does not make this excluded DP.
  "304": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var NumMatrix = function(matrix) {
        const numRows = matrix.length;
        const numCols = matrix[0].length;

        // prefix[i][j] = sum of all elements in matrix[0..i-1][0..j-1]
        // Extra row and column of zeros simplify boundary conditions
        this.prefix = Array(numRows + 1)
            .fill(null)
            .map(() => new Array(numCols + 1).fill(0));

        for (let row = 1; row <= numRows; row++) {
            for (let col = 1; col <= numCols; col++) {
                const cellValue = matrix[row - 1][col - 1];
                const topSum = this.prefix[row - 1][col];
                const leftSum = this.prefix[row][col - 1];
                const overlap = this.prefix[row - 1][col - 1]; // counted twice, subtract once

                this.prefix[row][col] = cellValue + topSum + leftSum - overlap;
            }
        }
    };

    NumMatrix.prototype.sumRegion = function(row1, col1, row2, col2) {
        // Inclusion-exclusion on the four corners of the prefix sum grid
        const bottomRight = this.prefix[row2 + 1][col2 + 1];
        const topPart     = this.prefix[row1][col2 + 1];
        const leftPart    = this.prefix[row2 + 1][col1];
        const topLeft     = this.prefix[row1][col1]; // subtracted twice, add back once

        return bottomRight - topPart - leftPart + topLeft;
    };
    return { NumMatrix };
  },

  // #238 Product of Array Except Self · Primary
  // Combine products strictly before and after each index; handle zeros without division and use output as workspace.
  "238": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var productExceptSelf = function(nums) {
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
    };
    return { productExceptSelf };
  },

  // #36 Valid Sudoku · Primary
  // Maintain separate row, column, and box sets; ignore empty cells and check all three constraints before insertion.
  "36": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var isValidSudoku = function(board) {
        // One set per row, column, and 3x3 box to track seen digits
        const rows = Array(9)
            .fill(null)
            .map(() => new Set());
        const cols = Array(9)
            .fill(null)
            .map(() => new Set());
        const boxes = Array(9)
            .fill(null)
            .map(() => new Set());

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
    };
    return { isValidSudoku };
  },

  // #128 Longest Consecutive Sequence · Primary
  // Only start a consecutive run if its predecessor is absent; iterate distinct values to avoid repeated starts.
  "128": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var longestConsecutive = function(nums) {
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
    };
    return { longestConsecutive };
  },

  // #122 Best Time to Buy And Sell Stock II · Primary
  // Add every positive adjacent price difference; unlimited transactions justify realizing every rising segment.
  "122": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var maxProfit = function(prices) {
        let totalProfit = 0;

        for (let i = 1; i < prices.length; i++) {
            const todayPrice = prices[i];
            const yesterdayPrice = prices[i - 1];

            // If price went up, we could have bought yesterday and sold today
            if (todayPrice > yesterdayPrice) {
                const dailyGain = todayPrice - yesterdayPrice;
                totalProfit = totalProfit + dailyGain;
            }
        }

        return totalProfit;
    };
    return { maxProfit };
  },

  // #229 Majority Element II · Primary
  // At most two values exceed n/3; candidate cancellation must be followed by actual-frequency verification.
  "229": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var majorityElement = function(nums) {
        // Phase 1: Find up to 2 candidates using Boyer-Moore voting
        let candidate1 = null;
        let candidate2 = null;
        let count1 = 0;
        let count2 = 0;

        for (const num of nums) {
            if (num === candidate1) {
                count1 = count1 + 1;
            } else if (num === candidate2) {
                count2 = count2 + 1;
            } else if (count1 === 0) {
                candidate1 = num;
                count1 = 1;
            } else if (count2 === 0) {
                candidate2 = num;
                count2 = 1;
            } else {
                // Neither candidate matches: "cancel out" one of each
                count1 = count1 - 1;
                count2 = count2 - 1;
            }
        }

        // Phase 2: Verify that candidates actually appear more than n/3 times
        const threshold = Math.floor(nums.length / 3);

        const candidates = [candidate1, candidate2];
        return candidates.filter(candidate => {
            const actualCount = nums.filter(x => x === candidate).length;
            return actualCount > threshold;
        });
    };
    return { majorityElement };
  },

  // #560 Subarray Sum Equals K · Primary
  // Seed prefix frequency zero with one, query currentSum-k before incrementing, and count repeated prefixes; negatives prevent a generic sum window.
  "560": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var subarraySum = function(nums, k) {
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
    };
    return { subarraySum };
  },

  // #41 First Missing Positive · Primary
  // Put v at v-1 only when 1<=v<=n; stop on duplicate occupants to prevent an infinite swap loop.
  "41": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var firstMissingPositive = function(nums) {
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
    };
    return { firstMissingPositive };
  },

  // #344 Reverse String · Primary
  // Swap endpoints in place until pointers meet; no returned copy is required.
  "344": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var reverseString = function(s) {
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
    };
    return { reverseString };
  },

  // #125 Valid Palindrome · Primary
  // Skip non-alphanumeric characters and compare normalized case before moving both pointers.
  "125": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var isPalindrome = function(s) {
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
    }
    return { isPalindrome };
  },

  // #680 Valid Palindrome II · Primary
  // At the first mismatch, test either one-character deletion; do not allow another deletion inside the helper.
  "680": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var validPalindrome = function(s) {
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
    };
    return { validPalindrome };
  },

  // #1768 Merge Strings Alternately · Primary
  // Alternate elements from independent sequences and then append any remainder; sorted order is not required.
  "1768": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var mergeAlternately = function(word1, word2) {
        const result = [];
        let i = 0;

        // Continue as long as either word has characters remaining
        while (i < word1.length || i < word2.length) {
            // Append from word1 first if it still has characters at position i
            if (i < word1.length) {
                result.push(word1[i]);
            }

            // Then append from word2 if it still has characters at position i
            if (i < word2.length) {
                result.push(word2[i]);
            }

            i++;
        }

        return result.join('');
    };
    return { mergeAlternately };
  },

  // #88 Merge Sorted Array · Primary
  // Merge backward into spare capacity so unread values in the first array are not overwritten.
  "88": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var merge = function(nums1, m, nums2, n) {
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
    };
    return { merge };
  },

  // #26 Remove Duplicates From Sorted Array · Primary
  // Sorted duplicates are adjacent; compare against the last retained value and return the compacted prefix length.
  "26": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var removeDuplicates = function(nums) {
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
    };
    return { removeDuplicates };
  },

  // #167 Two Sum II Input Array Is Sorted · Primary
  // Sorted order proves which endpoint can be discarded; return one-based indices.
  "167": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var twoSum = function(numbers, target) {
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
    };
    return { twoSum };
  },

  // #15 3Sum · Primary
  // Fix one value, solve the remaining pair, and skip duplicate fixed values and duplicate endpoint values.
  "15": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var threeSum = function(nums) {
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
    };
    return { threeSum };
  },

  // #18 4Sum · Primary
  // Fix two values before the pair search; suppress duplicates at both outer levels and both endpoints.
  "18": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var fourSum = function(nums, target) {
        nums.sort((a, b) => a - b);
        const result = [];
        const n = nums.length;

        for (let i = 0; i < n - 3; i++) {
            // Skip duplicate values for the first element
            if (i > 0 && nums[i] === nums[i - 1]) {
                continue;
            }

            for (let j = i + 1; j < n - 2; j++) {
                // Skip duplicate values for the second element
                if (j > i + 1 && nums[j] === nums[j - 1]) {
                    continue;
                }

                let lo = j + 1;
                let hi = n - 1;

                while (lo < hi) {
                    const currentSum = nums[i] + nums[j] + nums[lo] + nums[hi];

                    if (currentSum < target) {
                        lo = lo + 1;
                    } else if (currentSum > target) {
                        hi = hi - 1;
                    } else {
                        // Found a valid quadruplet
                        result.push([nums[i], nums[j], nums[lo], nums[hi]]);

                        // Skip duplicates for lo and hi
                        while (lo < hi && nums[lo] === nums[lo + 1]) {
                            lo = lo + 1;
                        }
                        while (lo < hi && nums[hi] === nums[hi - 1]) {
                            hi = hi - 1;
                        }

                        lo = lo + 1;
                        hi = hi - 1;
                    }
                }
            }
        }

        return result;
    };
    return { fourSum };
  },

  // #189 Rotate Array · Primary
  // Reduce k modulo n, reverse the whole array, then reverse the first k and remaining elements.
  "189": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var rotate = function(nums, k) {
        const n = nums.length;

        // Handle k larger than array length (full rotations cancel out)
        k = k % n;

        function reverse(left, right) {
            while (left < right) {
                const temp = nums[left];
                nums[left] = nums[right];
                nums[right] = temp;
                left = left + 1;
                right = right - 1;
            }
        }

        // Step 1: Reverse the entire array
        reverse(0, n - 1);

        // Step 2: Reverse the first k elements
        reverse(0, k - 1);

        // Step 3: Reverse the remaining elements
        reverse(k, n - 1);
    };
    return { rotate };
  },

  // #11 Container With Most Water · Primary
  // Area uses the shorter endpoint times width; only moving a limiting endpoint can improve the answer.
  "11": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var maxArea = function(height) {
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
    };
    return { maxArea };
  },

  // #881 Boats to Save People · Primary
  // The heaviest person always leaves this iteration; pair with the lightest only if the limit permits.
  "881": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var numRescueBoats = function(people, limit) {
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
    };
    return { numRescueBoats };
  },

  // #42 Trapping Rain Water · Primary
  // Track maxima from both ends and process the side with the smaller known boundary; this is not the container-area formula.
  "42": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var trap = function(height) {
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
    };
    return { trap };
  },

  // #219 Contains Duplicate II · Primary
  // Compare against at most the preceding k items; expire the item at i-k after inserting the current item.
  "219": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var containsNearbyDuplicate = function(nums, k) {
        // Sliding window of at most k elements
        const window = new Set();

        for (let i = 0; i < nums.length; i = i + 1) {
            const currentNum = nums[i];

            // If current number is already in window, indices are within distance k
            if (window.has(currentNum)) {
                return true;
            }

            // Add current number to window
            window.add(currentNum);

            // Keep window size at most k by removing the element that fell out
            if (window.size > k) {
                const oldestNum = nums[i - k];
                window.delete(oldestNum);
            }
        }

        return false;
    };
    return { containsNearbyDuplicate };
  },

  // #121 Best Time to Buy And Sell Stock · Primary
  // Track the minimum price seen before or at today and the best sale gain; only one buy/sell transaction is allowed.
  "121": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var maxProfit = function(prices) {
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
    };
    return { maxProfit };
  },

  // #3 Longest Substring Without Repeating Characters · Primary
  // While the incoming character is already present, remove from the left; record the longest repaired window.
  "3": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var lengthOfLongestSubstring = function(s) {
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
    };
    return { lengthOfLongestSubstring };
  },

  // #424 Longest Repeating Character Replacement · Primary
  // Use window length minus historical maximum frequency; the nondecreasing max and single shrink seek maximum length, not an always-valid materialized window.
  "424": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var characterReplacement = function(s, k) {
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
    };
    return { characterReplacement };
  },

  // #567 Permutation In String · Primary
  // Keep exact counts for a fixed-length window and update equality matches on both entry and exit, including the final window.
  "567": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var checkInclusion = function(s1, s2) {
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
    };
    return { checkInclusion };
  },

  // #209 Minimum Size Subarray Sum · Primary
  // Positive numbers make shrinking a sum-valid window monotone; update minimum length before removing from the left.
  "209": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var minSubArrayLen = function(target, nums) {
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
    };
    return { minSubArrayLen };
  },

  // #658 Find K Closest Elements · Primary
  // Binary-search the start of a length-k sorted window using boundary distances; equal distances favor the left window.
  "658": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findClosestElements = function(arr, k, x) {
        // Binary search for the optimal starting index of the k-element window
        // The window spans arr[lo .. lo+k-1]
        let lo = 0;
        let hi = arr.length - k;

        while (lo < hi) {
            const mid = (lo + hi) >> 1;

            // Compare distances: is x closer to arr[mid] or arr[mid+k]?
            // arr[mid] is the left boundary, arr[mid+k] is the right boundary
            const distanceToLeft = x - arr[mid];
            const distanceToRight = arr[mid + k] - x;

            if (distanceToLeft > distanceToRight) {
                // arr[mid] is farther: shift window to the right
                lo = mid + 1;
            } else {
                // arr[mid+k] is farther or equal: shift window to the left (keep mid)
                hi = mid;
            }
        }

        // lo is now the optimal starting index
        return arr.slice(lo, lo + k);
    };
    return { findClosestElements };
  },

  // #76 Minimum Window Substring · Primary
  // Track satisfied distinct requirements while respecting duplicate character counts; shrink while all requirements remain satisfied.
  "76": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var minWindow = function(s, t) {
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
    };
    return { minWindow };
  },

  // #239 Sliding Window Maximum · Primary
  // Expire indices at the front, remove dominated values from the back, then emit the front after k arrivals; JS uses a circular deque.
  "239": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var maxSlidingWindow = function(nums, k) {
        const deque = new Array(k);
        const result = [];
        let head = 0;
        let size = 0;
        for (let index = 0; index < nums.length; index++) {
            if (size > 0 && deque[head] <= index - k) {
                head = (head + 1) % k;
                size--;
            }
            while (size > 0 && nums[deque[(head + size - 1) % k]] <= nums[index]) {
                size--;
            }
            deque[(head + size) % k] = index;
            size++;
            if (index >= k - 1) result.push(nums[deque[head]]);
        }
        return result;
    };
    return { maxSlidingWindow };
  },

  // #682 Baseball Game · Primary
  // C removes the latest score; D and + derive a new score from existing history without consuming those operands.
  "682": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var calPoints = function(operations) {
        // Stack holds the current list of valid scores
        const scoreStack = [];

        for (const operation of operations) {
            if (operation === 'C') {
                // Cancel: remove the last valid score
                scoreStack.pop();
            } else if (operation === 'D') {
                // Double: add a score that is double the most recent score
                const mostRecentScore = scoreStack[scoreStack.length - 1];
                scoreStack.push(mostRecentScore * 2);
            } else if (operation === '+') {
                // Plus: add a score that is the sum of the last two scores
                const lastScore = scoreStack[scoreStack.length - 1];
                const secondLastScore = scoreStack[scoreStack.length - 2];
                scoreStack.push(lastScore + secondLastScore);
            } else {
                // Numeric string: record this as a new score
                scoreStack.push(parseInt(operation));
            }
        }

        // Sum all remaining valid scores
        return scoreStack.reduce((total, score) => total + score, 0);
    };
    return { calPoints };
  },

  // #20 Valid Parentheses · Primary
  // A closing bracket must match the latest opener; reject premature closers and unmatched openers at the end.
  "20": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var isValid = function(s) {
        const stack = [];

        // Maps each closing bracket to its expected opening bracket
        const mapping = {
            ')': '(',
            '}': '{',
            ']': '['
        };

        for (const char of s) {
            const isClosingBracket = char in mapping;

            if (isClosingBracket) {
                // The top of the stack must be the matching opening bracket
                const topOfStack = stack[stack.length - 1];
                const expectedOpen = mapping[char];

                if (!stack.length || topOfStack !== expectedOpen) {
                    return false;
                }

                stack.pop();
            } else {
                // It's an opening bracket — push it for later matching
                stack.push(char);
            }
        }

        // Valid only if every opening bracket was matched
        return stack.length === 0;
    };
    return { isValid };
  },

  // #225 Implement Stack Using Queues · Two queues
  // Primary uses active/helper queues and transfers on push; all operations must stay FIFO, including top from the front.
  "225": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var MyStack = function() {
        this.active = [];
        this.helper = [];
    };

    MyStack.prototype.push = function(value) {
        this.helper.push(value);
        while (this.active.length > 0) {
            this.helper.push(this.active.shift());
        }
        [this.active, this.helper] = [this.helper, this.active];
    };

    MyStack.prototype.pop = function() {
        return this.active.shift();
    };

    MyStack.prototype.top = function() {
        return this.active[0];
    };

    MyStack.prototype.empty = function() {
        return this.active.length === 0;
    };
    return { MyStack };
  },

  // #225 Implement Stack Using Queues · One queue
  // Rotate the previous size elements after enqueueing; only queue-front removal and queue-back insertion are used.
  "225-one-queue": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var MyStack = function() {
        // We use a single array as a queue
        this.queue = [];
    };

    MyStack.prototype.push = function(value) {
        // Add the new element to the back of the queue
        this.queue.push(value);

        // Rotate all previous elements to the back so the new element is at front
        const rotations = this.queue.length - 1;
        for (let i = 0; i < rotations; i = i + 1) {
            const front = this.queue.shift();
            this.queue.push(front);
        }
    };

    MyStack.prototype.pop = function() {
        // The front of queue is the top of stack (due to push rotation)
        return this.queue.shift();
    };

    MyStack.prototype.top = function() {
        return this.queue[0];
    };

    MyStack.prototype.empty = function() {
        return this.queue.length === 0;
    };
    return { MyStack };
  },

  // #232 Implement Queue using Stacks · Primary
  // Transfer the input stack only when the output stack is empty; each item transfers at most once, giving amortized constant operations.
  "232": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var MyQueue = function() {
        // New elements always arrive here
        this.inputStack = [];
        // Elements in FIFO order (oldest on top) for dequeue
        this.outputStack = [];
    };

    MyQueue.prototype.push = function(x) {
        // Always push to input stack — O(1)
        this.inputStack.push(x);
    };

    MyQueue.prototype.pop = function() {
        // Ensure outputStack has elements, then remove the oldest
        this._transfer();
        return this.outputStack.pop();
    };

    MyQueue.prototype.peek = function() {
        // Ensure outputStack has elements, then read the oldest
        this._transfer();
        return this.outputStack[this.outputStack.length - 1];
    };

    MyQueue.prototype.empty = function() {
        const inputIsEmpty = this.inputStack.length === 0;
        const outputIsEmpty = this.outputStack.length === 0;
        return inputIsEmpty && outputIsEmpty;
    };

    MyQueue.prototype._transfer = function() {
        // Only transfer when outputStack is empty — each element moves at most once
        if (this.outputStack.length === 0) {
            while (this.inputStack.length > 0) {
                const topOfInput = this.inputStack.pop();
                this.outputStack.push(topOfInput);
            }
        }
    };
    return { MyQueue };
  },

  // #155 Min Stack · Primary
  // Store a minimum at each depth, including duplicate minima, and pop values and minima together.
  "155": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var MinStack = function() {
        // Main stack holds the actual values
        this.stack = [];
        // Parallel stack where each entry is the running minimum at that level
        this.minStack = [];
    };

    MinStack.prototype.push = function(val) {
        this.stack.push(val);

        // The new minimum is the smaller of val and the current minimum
        const currentMin = this.minStack.length === 0
            ? val
            : this.minStack[this.minStack.length - 1];
        const newMin = Math.min(val, currentMin);

        this.minStack.push(newMin);
    };

    MinStack.prototype.pop = function() {
        // Keep both stacks in sync by popping from each
        this.stack.pop();
        this.minStack.pop();
    };

    MinStack.prototype.top = function() {
        return this.stack[this.stack.length - 1];
    };

    MinStack.prototype.getMin = function() {
        // The top of minStack always holds the current minimum
        return this.minStack[this.minStack.length - 1];
    };
    return { MinStack };
  },

  // #150 Evaluate Reverse Polish Notation · Primary
  // Pop the right operand before the left; subtraction/division preserve that order and division truncates toward zero.
  "150": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var evalRPN = function(tokens) {
        const stack = [];
        const operators = new Set(['+', '-', '*', '/']);

        for (const token of tokens) {
            const isOperator = operators.has(token);

            if (isOperator) {
                // Pop in reverse order: b is the right operand, a is the left
                const rightOperand = stack.pop();
                const leftOperand = stack.pop();

                let result;
                if (token === '+') {
                    result = leftOperand + rightOperand;
                } else if (token === '-') {
                    result = leftOperand - rightOperand;
                } else if (token === '*') {
                    result = leftOperand * rightOperand;
                } else if (token === '/') {
                    // Truncate toward zero (not floor)
                    result = Math.trunc(leftOperand / rightOperand);
                }

                stack.push(result);
            } else {
                // It's a number — push it onto the stack
                stack.push(parseInt(token));
            }
        }

        // The final remaining value is the answer
        return stack[0];
    };
    return { evalRPN };
  },

  // #735 Asteroid Collision · Primary
  // Only a right-moving stack top and left-moving incoming item collide; distinguish smaller, equal, and larger sizes and repeat while alive.
  "735": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var asteroidCollision = function(asteroids) {
        const stack = [];

        for (const asteroid of asteroids) {
            let alive = true;

            // Collision only possible: current goes left (negative) AND stack top goes right (positive)
            while (alive && asteroid < 0 && stack.length > 0 && stack[stack.length - 1] > 0) {
                const topAsteroid = stack[stack.length - 1];
                const incomingSize = -asteroid; // absolute size of the left-moving asteroid

                if (topAsteroid < incomingSize) {
                    // Stack top is smaller — it gets destroyed, keep fighting
                    stack.pop();
                } else if (topAsteroid === incomingSize) {
                    // Equal size — both are destroyed
                    stack.pop();
                    alive = false;
                } else {
                    // Stack top is larger — incoming asteroid is destroyed
                    alive = false;
                }
            }

            if (alive) {
                stack.push(asteroid);
            }
        }

        return stack;
    };
    return { asteroidCollision };
  },

  // #739 Daily Temperatures · Primary
  // Store unresolved indices; pop only on a strictly warmer temperature and record the index difference.
  "739": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var dailyTemperatures = function(temperatures) {
        const n = temperatures.length;
        const result = new Array(n).fill(0);

        // Stack stores indices; temperatures at those indices are in decreasing order
        // (front to back). Whenever a warmer day arrives, it resolves all cooler days.
        const stack = [];

        for (let i = 0; i < n; i++) {
            const currentTemp = temperatures[i];

            // Pop all days that are cooler than today — today is their next warmer day
            while (stack.length > 0 && currentTemp > temperatures[stack[stack.length - 1]]) {
                const prevDayIndex = stack.pop();
                const daysWaited = i - prevDayIndex;
                result[prevDayIndex] = daysWaited;
            }

            // Push today's index; we haven't found its next warmer day yet
            stack.push(i);
        }

        // Any indices still on the stack have no future warmer day → result stays 0
        return result;
    };
    return { dailyTemperatures };
  },

  // #901 Online Stock Span · Primary
  // Store price/span pairs; absorb spans while previous price<=current price, including equal prices.
  "901": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var StockSpanner = function() {
        // Stack stores [price, span] pairs in decreasing order of price
        this.stack = [];
    };

    StockSpanner.prototype.next = function(price) {
        // Start with span of 1 for today itself
        let span = 1;

        // Absorb all previous days with prices <= today's price
        while (this.stack.length > 0 && this.stack[this.stack.length - 1][0] <= price) {
            const [prevPrice, prevSpan] = this.stack.pop();
            span += prevSpan;
        }

        // Push today's price and its accumulated span
        this.stack.push([price, span]);

        return span;
    };
    return { StockSpanner };
  },

  // #853 Car Fleet · Primary
  // Sort positions nearest-to-target first; a following arrival time no greater than the fleet ahead joins it, including equality.
  "853": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var carFleet = function(target, position, speed) {
        // Pair each car's position with its speed, then sort closest-to-target first
        const cars = position
            .map((pos, i) => [pos, speed[i]])
            .sort((a, b) => b[0] - a[0]);

        // Stack holds arrival times of each distinct fleet
        const stack = [];

        for (const [pos, spd] of cars) {
            // Time for this car to reach the target on its own
            const timeToTarget = (target - pos) / spd;

            const stackTop = stack[stack.length - 1];
            const formsNewFleet = !stack.length || timeToTarget > stackTop;

            if (formsNewFleet) {
                // This car is slower than the fleet ahead — it leads its own fleet
                stack.push(timeToTarget);
            }
            // Otherwise this car catches up to the fleet ahead and merges — do nothing
        }

        return stack.length;
    };
    return { carFleet };
  },

  // #71 Simplify Path · Primary
  // Ignore empty components and '.', pop for '..' only when possible, and treat other dot strings as ordinary names.
  "71": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var simplifyPath = function(path) {
        const stack = [];

        for (const part of path.split('/')) {
            if (part === '..') {
                // Go up one directory (pop the last directory name)
                if (stack.length > 0) {
                    stack.pop();
                }
            } else if (part !== '' && part !== '.') {
                // Valid directory name: push onto stack
                // Skip empty strings (from consecutive slashes) and '.' (current dir)
                stack.push(part);
            }
        }

        return '/' + stack.join('/');
    };
    return { simplifyPath };
  },

  // #394 Decode String · Primary
  // Save repeat count and outer text at '['; support multi-digit counts and restore the outer context at ']'.
  "394": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var decodeString = function(s) {
        const countStack = [];  // saves repeat counts at each nesting level
        const stringStack = []; // saves the string built before each '['
        let currentString = '';
        let currentNum = 0;

        for (const char of s) {
            const isDigit = char >= '0' && char <= '9';

            if (isDigit) {
                // Build up multi-digit numbers (e.g., "12[" reads 1 then 2)
                currentNum = currentNum * 10 + parseInt(char);

            } else if (char === '[') {
                // Save current context and reset for the inner expression
                countStack.push(currentNum);
                stringStack.push(currentString);
                currentNum = 0;
                currentString = '';

            } else if (char === ']') {
                // Restore context and append the repeated inner string
                const repeatCount = countStack.pop();
                const previousString = stringStack.pop();
                currentString = previousString + currentString.repeat(repeatCount);

            } else {
                // Regular letter — just append it
                currentString += char;
            }
        }

        return currentString;
    };
    return { decodeString };
  },

  // #895 Maximum Frequency Stack · Primary
  // Keep a stack for each attained frequency; pop the highest-frequency most-recent item and lower maxFreq only when its bucket empties.
  "895": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var FreqStack = function() {
        this.freq = new Map();    // val -> current frequency
        this.group = new Map();   // frequency -> stack of values with that frequency
        this.maxFreq = 0;         // current maximum frequency
    };

    FreqStack.prototype.push = function(val) {
        // Increment this value's frequency
        const newFreq = (this.freq.get(val) || 0) + 1;
        this.freq.set(val, newFreq);

        // Update max frequency
        if (newFreq > this.maxFreq) {
            this.maxFreq = newFreq;
        }

        // Push val onto the stack for its new frequency level
        if (!this.group.has(newFreq)) this.group.set(newFreq, []);
        this.group.get(newFreq).push(val);
    };

    FreqStack.prototype.pop = function() {
        // Pop from the highest frequency stack (LIFO breaks ties)
        const val = this.group.get(this.maxFreq).pop();

        // Decrease this value's frequency
        this.freq.set(val, this.freq.get(val) - 1);

        // If the top frequency stack is now empty, decrease maxFreq
        if (this.group.get(this.maxFreq).length === 0) {
            this.maxFreq--;
        }

        return val;
    };
    return { FreqStack };
  },

  // #84 Largest Rectangle In Histogram · Primary
  // Increasing stack closes rectangles at a smaller height; JS carries the earliest left edge, Python uses indices; a temporary zero flushes remaining bars.
  "84": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var largestRectangleArea = function(heights) {
        const stack = [];  // stores [leftEdge, height] pairs
        let maxArea = 0;

        // Sentinel 0 at end forces all remaining bars to be popped
        heights.push(0);

        for (let i = 0; i < heights.length; i++) {
            let leftEdge = i;

            while (stack.length > 0) {
                const [topLeft, topHeight] = stack[stack.length - 1];
                if (topHeight <= heights[i]) {
                    break;
                }

                const width = i - topLeft;
                maxArea = Math.max(maxArea, topHeight * width);
                leftEdge = topLeft;
                stack.pop();
            }

            stack.push([leftEdge, heights[i]]);
        }

        // Remove the sentinel we added
        heights.pop();

        return maxArea;
    };
    return { largestRectangleArea };
  },

  // #704 Binary Search · Primary
  // Use an exact-match closed interval; discarding mid requires lo=mid+1 or hi=mid-1.
  "704": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var search = function(nums, target) {
        let lo = 0;
        let hi = nums.length - 1;

        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            const midValue = nums[mid];

            if (midValue === target) {
                return mid;
            } else if (midValue < target) {
                // Target must be in the right half
                lo = mid + 1;
            } else {
                // Target must be in the left half
                hi = mid - 1;
            }
        }

        // Search space exhausted — target not found
        return -1;
    };
    return { search };
  },

  // #35 Search Insert Position · Primary
  // Find the first value>=target in a half-open range; n is a valid insertion result.
  "35": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var searchInsert = function(nums, target) {
        // Generalized form: minimize k s.t. nums[k] >= target
        let lo = 0;
        let hi = nums.length; // right = len(nums) to handle insertion at end

        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);

            if (nums[mid] >= target) {
                // mid satisfies the condition — could be the answer
                hi = mid;
            } else {
                // mid doesn't satisfy — answer is to the right
                lo = mid + 1;
            }
        }

        // lo is the minimal index where nums[lo] >= target (or len if target > all)
        return lo;
    };
    return { searchInsert };
  },

  // #374 Guess Number Higher Or Lower · Primary
  // The comparison comes from guess(mid), not array access; map the oracle's sign to the correct half.
  "374": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    const guess = dependencies.guess || (() => { throw new Error("Provide dependencies.guess for Guess Number."); });
    var guessNumber = function(n) {
        let lo = 1;
        let hi = n;

        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);

            // API: guess(n) returns 0 if correct, -1 if picked < n, 1 if picked > n
            const feedback = guess(mid);

            if (feedback === 0) {
                // Correct guess
                return mid;
            } else if (feedback === -1) {
                // Picked number is lower than mid — search the left half
                hi = mid - 1;
            } else {
                // Picked number is higher than mid — search the right half
                lo = mid + 1;
            }
        }

        return lo; // should always be found before here
    };
    return { guessNumber };
  },

  // #69 Sqrt(x) · Primary
  // Find the first integer with square>x and subtract one; zero and one require correct exclusive bounds.
  "69": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var mySqrt = function(x) {
        // Generalized form: minimize k s.t. k*k > x, return k - 1
        let lo = 0;
        let hi = x + 1; // right = x + 1 to handle x = 0 and x = 1

        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);

            if (mid * mid > x) {
                // mid satisfies the condition — could be the answer
                hi = mid;
            } else {
                // mid doesn't satisfy — answer is to the right
                lo = mid + 1;
            }
        }

        // lo is the first k where k² > x, so lo - 1 is floor(sqrt(x))
        return lo - 1;
    };
    return { mySqrt };
  },

  // #74 Search a 2D Matrix · Primary
  // The whole matrix must be globally ordered across row boundaries; current code maps a flat index to row/column.
  "74": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var searchMatrix = function(matrix, target) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const totalElements = rows * cols;

        let lo = 0;
        let hi = totalElements - 1;

        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);

            // Convert flat index to 2D coordinates
            const row = Math.floor(mid / cols);
            const col = mid % cols;
            const value = matrix[row][col];

            if (value === target) {
                return true;
            } else if (value < target) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }

        return false;
    };
    return { searchMatrix };
  },

  // #875 Koko Eating Bananas · Primary
  // Search speed from 1 to max pile; feasibility sums ceil(pile/speed), with each pile costing separate hours.
  "875": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var minEatingSpeed = function(piles, h) {
        let lo = 1;
        let hi = Math.max(...piles); // fastest we'd ever need is the biggest pile

        while (lo < hi) {
            const candidateSpeed = Math.floor((lo + hi) / 2);

            // Calculate total hours needed at this speed
            let totalHours = 0;
            for (const pile of piles) {
                totalHours = totalHours + Math.ceil(pile / candidateSpeed);
            }

            const fastEnough = totalHours <= h;

            if (fastEnough) {
                // This speed works — try a slower speed to find the minimum
                hi = candidateSpeed;
            } else {
                // Too slow — need a faster speed
                lo = candidateSpeed + 1;
            }
        }

        // lo === hi: the minimum valid speed
        return lo;
    };
    return { minEatingSpeed };
  },

  // #1011 Capacity to Ship Packages Within D Days · Primary
  // Search max weight through total weight; preserve package order and start a new day only when the next weight would overflow.
  "1011": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var shipWithinDays = function(weights, days) {
        // Greedy check: can all packages be shipped within 'days' days at this capacity?
        const canShip = (capacity) => {
            let daysNeeded = 1;
            let currentLoad = 0;

            for (const weight of weights) {
                const wouldExceedCapacity = currentLoad + weight > capacity;

                if (wouldExceedCapacity) {
                    // Start a new day with this package
                    daysNeeded = daysNeeded + 1;
                    currentLoad = weight;

                    if (daysNeeded > days) {
                        return false; // exceeded allowed days
                    }
                } else {
                    currentLoad = currentLoad + weight;
                }
            }

            return true;
        };

        // Minimum capacity: must fit the heaviest package
        let lo = Math.max(...weights);
        // Maximum capacity: ship everything in one day
        let hi = weights.reduce((total, weight) => total + weight, 0);

        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            if (canShip(mid)) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }

        return lo;
    };
    return { shipWithinDays };
  },

  // #153 Find Minimum In Rotated Sorted Array · Primary
  // Compare mid with the right endpoint; retain mid when it may be the minimum.
  "153": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findMin = function(nums) {
        let lo = 0;
        let hi = nums.length - 1;

        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            const midValue = nums[mid];
            const rightValue = nums[hi];

            if (midValue > rightValue) {
                // The right half contains the dip — minimum is to the right of mid
                lo = mid + 1;
            } else {
                // Right half is sorted normally — minimum is at mid or to the left
                hi = mid;
            }
        }

        // lo === hi: converged on the minimum element
        return nums[lo];
    };
    return { findMin };
  },

  // #33 Search In Rotated Sorted Array · Primary
  // Identify a sorted half and test whether the target lies in its bounds before discarding a half.
  "33": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var search = function(nums, target) {
        let lo = 0;
        let hi = nums.length - 1;

        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            const midValue = nums[mid];

            if (midValue === target) {
                return mid;
            }

            const leftHalfIsSorted = nums[lo] <= midValue;

            if (leftHalfIsSorted) {
                // Check if target falls within the sorted left half
                const targetInLeftHalf = nums[lo] <= target && target < midValue;
                if (targetInLeftHalf) {
                    hi = mid - 1;
                } else {
                    lo = mid + 1;
                }
            } else {
                // Right half must be sorted — check if target falls there
                const targetInRightHalf = midValue < target && target <= nums[hi];
                if (targetInRightHalf) {
                    lo = mid + 1;
                } else {
                    hi = mid - 1;
                }
            }
        }

        return -1;
    };
    return { search };
  },

  // #81 Search In Rotated Sorted Array II · Primary
  // Equal left and middle values can hide the sorted half; skip an ambiguous endpoint, accepting worst-case linear work.
  "81": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var search = function(nums, target) {
        let lo = 0;
        let hi = nums.length - 1;

        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            const midValue = nums[mid];

            if (midValue === target) {
                return true;
            }

            // When nums[lo] === nums[mid], we can't determine which half is sorted
            // Increment lo to skip this duplicate
            if (nums[lo] === midValue) {
                lo = lo + 1;
                continue;
            }

            if (nums[lo] <= midValue) {
                // Left half is sorted
                const targetInLeftHalf = nums[lo] <= target && target < midValue;
                if (targetInLeftHalf) {
                    hi = mid - 1;
                } else {
                    lo = mid + 1;
                }
            } else {
                // Right half is sorted
                const targetInRightHalf = midValue < target && target <= nums[hi];
                if (targetInRightHalf) {
                    lo = mid + 1;
                } else {
                    hi = mid - 1;
                }
            }
        }

        return false;
    };
    return { search };
  },

  // #981 Time Based Key Value Store · Primary
  // Append timestamped values per key; get finds the latest timestamp<=query, not an exact match, and may return no value.
  "981": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var TimeMap = function() {
        // Maps each key to a sorted list of [timestamp, value] pairs
        this.store = {};
    };

    TimeMap.prototype.set = function(key, value, timestamp) {
        // Timestamps are strictly increasing so we just append
        if (!this.store[key]) {
            this.store[key] = [];
        }
        this.store[key].push([timestamp, value]);
    };

    TimeMap.prototype.get = function(key, timestamp) {
        if (!this.store[key]) return "";

        const arr = this.store[key];
        let lo = 0;
        let hi = arr.length - 1;
        let bestValue = ""; // Default: no value at or before this timestamp

        // Binary search for the largest timestamp <= the query timestamp
        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            const midTimestamp = arr[mid][0];

            if (midTimestamp <= timestamp) {
                // This timestamp is valid — record the value and try to find a later one
                bestValue = arr[mid][1];
                lo = mid + 1;
            } else {
                // This timestamp is too late — search earlier
                hi = mid - 1;
            }
        }

        return bestValue;
    };
    return { TimeMap };
  },

  // #410 Split Array Largest Sum · Primary
  // For nonnegative values, feasibility counts contiguous groups under a bound; at most k groups can be subdivided to exactly k.
  "410": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var splitArray = function(nums, k) {
        // Greedy check: can we split nums into <= k subarrays each with sum <= maxSum?
        const canSplit = (maxSum) => {
            let subarrayCount = 1;
            let currentSum = 0;

            for (const num of nums) {
                const wouldExceed = currentSum + num > maxSum;

                if (wouldExceed) {
                    // Start a new subarray with this number
                    subarrayCount = subarrayCount + 1;
                    currentSum = num;

                    if (subarrayCount > k) {
                        return false; // need too many splits
                    }
                } else {
                    currentSum = currentSum + num;
                }
            }

            return true;
        };

        // Minimum possible answer: largest single element (every element must fit)
        let lo = Math.max(...nums);
        // Maximum possible answer: put everything in one subarray
        let hi = nums.reduce((total, num) => total + num, 0);

        while (lo < hi) {
            const candidateMax = Math.floor((lo + hi) / 2);

            if (canSplit(candidateMax)) {
                // Works — try smaller
                hi = candidateMax;
            } else {
                // Too small — increase the allowed maximum
                lo = candidateMax + 1;
            }
        }

        return lo;
    };
    return { splitArray };
  },

  // #4 Median of Two Sorted Arrays · Primary
  // Search the shorter array; complementary cuts must balance sizes and satisfy both cross-boundary inequalities, including empty partitions.
  "4": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findMedianSortedArrays = function(nums1, nums2) {
        // Always binary search on the shorter array
        if (nums1.length > nums2.length) {
            [nums1, nums2] = [nums2, nums1];
        }

        const m = nums1.length;
        const n = nums2.length;
        let lo = 0;
        let hi = m;

        // Total elements in the left half (ceiling for odd total)
        const half = Math.floor((m + n + 1) / 2);

        while (lo <= hi) {
            // i = how many elements from nums1 are in the left half
            const i = Math.floor((lo + hi) / 2);
            // j = how many elements from nums2 are in the left half
            const j = half - i;

            // Boundary values at the partition (use -/+Infinity for edges)
            const left1  = i > 0 ? nums1[i - 1] : -Infinity;
            const right1 = i < m ? nums1[i]     :  Infinity;
            const left2  = j > 0 ? nums2[j - 1] : -Infinity;
            const right2 = j < n ? nums2[j]     :  Infinity;

            const validPartition = left1 <= right2 && left2 <= right1;

            if (validPartition) {
                // All left elements <= all right elements — correct split found
                const maxLeft = Math.max(left1, left2);
                if ((m + n) % 2 === 1) {
                    // Odd total: median is the max of the left half
                    return maxLeft;
                }
                const minRight = Math.min(right1, right2);
                return (maxLeft + minRight) / 2;

            } else if (left1 > right2) {
                // nums1's left portion is too large — move partition left
                hi = i - 1;
            } else {
                // nums2's left portion is too large — move partition right
                lo = i + 1;
            }
        }

        return 0.0;
    };
    return { findMedianSortedArrays };
  },

  // #1095 Find in Mountain Array · Primary
  // Find peak using neighboring values, search ascending side first for the smallest index, then reverse comparisons on the descending side; preserve API-call efficiency.
  "1095": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findInMountainArray = function(target, mountainArr) {
        const n = mountainArr.length();

        // Step 1: Find the peak index using binary search
        let lo = 0;
        let hi = n - 1;
        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            // If arr[mid] < arr[mid+1], we're on the ascending side — peak is to the right
            if (mountainArr.get(mid) < mountainArr.get(mid + 1)) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        const peak = lo;

        // Step 2: Binary search the ascending side (left of peak, inclusive)
        // Search left side first to guarantee minimum index if target appears on both sides
        lo = 0;
        hi = peak;
        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            const val = mountainArr.get(mid);
            if (val === target) return mid;
            else if (val < target) lo = mid + 1; // Ascending: target is to the right
            else hi = mid - 1;
        }

        // Step 3: Binary search the descending side (right of peak)
        lo = peak + 1;
        hi = n - 1;
        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            const val = mountainArr.get(mid);
            if (val === target) return mid;
            else if (val < target) hi = mid - 1; // Descending: target is to the left (larger values)
            else lo = mid + 1;
        }

        return -1; // Target not found
    };
    return { findInMountainArray };
  },

  // #206 Reverse Linked List · Primary
  // Save the next node before reversing a pointer; return the final previous node as the new head.
  "206": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var reverseList = function(head) {
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
    };
    return { reverseList };
  },

  // #21 Merge Two Sorted Lists · Primary
  // Use a dummy/tail and attach the smaller list head; connect the remaining suffix once one list ends.
  "21": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var mergeTwoLists = function(list1, list2) {
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
    };
    return { mergeTwoLists };
  },

  // #141 Linked List Cycle · Primary
  // Fast moves twice and slow once; compare node identities, and check fast and fast.next before advancing.
  "141": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var hasCycle = function(head) {
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
    };
    return { hasCycle };
  },

  // #143 Reorder List · Primary
  // Find the midpoint, disconnect halves, reverse the second, then interleave without leaving a cycle.
  "143": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var reorderList = function(head) {
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
    };
    return { reorderList };
  },

  // #19 Remove Nth Node From End of List · Primary
  // Use a dummy and an n+1-node gap to stop before the removed node, including when it is the head.
  "19": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var removeNthFromEnd = function(head, n) {
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
    };
    return { removeNthFromEnd };
  },

  // #138 Copy List With Random Pointer · Primary
  // Create all identity-mapped nodes first, then connect next/random references; equal values are not shared identities.
  "138": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var copyRandomList = function(head) {
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
    };
    return { copyRandomList };
  },

  // #2 Add Two Numbers · Primary
  // Continue while either list or carry remains; zero-pad exhausted lists and allocate one node per output digit.
  "2": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var addTwoNumbers = function(l1, l2) {
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
    };
    return { addTwoNumbers };
  },

  // #287 Find The Duplicate Number · Primary
  // Treat values as successor indices without mutating the array; after a meeting, reset one pointer and locate the cycle entrance.
  "287": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findDuplicate = function(nums) {
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
    };
    return { findDuplicate };
  },

  // #92 Reverse Linked List II · Primary
  // Keep the node before the segment and its original first node; repeatedly insert the next node at the segment front.
  "92": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var reverseBetween = function(head, left, right) {
        // Dummy node handles the edge case where left = 1 (head gets reversed)
        const dummy = new ListNode(0, head);
        let prev = dummy;

        // Advance prev to the node just before position 'left'
        for (let i = 0; i < left - 1; i++) {
            prev = prev.next;
        }

        // curr starts at position 'left'
        let curr = prev.next;

        // Reverse (right - left) times by moving the next node to the front
        for (let i = 0; i < right - left; i++) {
            const nextNode = curr.next;

            // Remove nextNode from its position and insert it right after prev
            curr.next = nextNode.next;
            nextNode.next = prev.next;
            prev.next = nextNode;
        }

        return dummy.next;
    };
    return { reverseBetween };
  },

  // #622 Design Circular Queue · Primary
  // Use head and count to distinguish empty/full; wrap insertion and rear indices within fixed capacity.
  "622": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var MyCircularQueue = function(k) {
        // Fixed-size storage array
        this.queue = new Array(k);
        // Index of the front element
        this.head = 0;
        // Number of elements currently in the queue
        this.count = 0;
        // Maximum capacity
        this.capacity = k;
    };

    MyCircularQueue.prototype.enQueue = function(value) {
        if (this.isFull()) return false;

        // Calculate the index for the new element (wraps around with modulo)
        const insertIndex = (this.head + this.count) % this.capacity;
        this.queue[insertIndex] = value;
        this.count++;
        return true;
    };

    MyCircularQueue.prototype.deQueue = function() {
        if (this.isEmpty()) return false;

        // Move head forward, wrapping around
        this.head = (this.head + 1) % this.capacity;
        this.count--;
        return true;
    };

    MyCircularQueue.prototype.Front = function() {
        if (this.isEmpty()) return -1;
        return this.queue[this.head];
    };

    MyCircularQueue.prototype.Rear = function() {
        if (this.isEmpty()) return -1;
        // Last element is at (head + count - 1) % capacity
        const rearIndex = (this.head + this.count - 1) % this.capacity;
        return this.queue[rearIndex];
    };

    MyCircularQueue.prototype.isEmpty = function() {
        return this.count === 0;
    };

    MyCircularQueue.prototype.isFull = function() {
        return this.count === this.capacity;
    };
    return { MyCircularQueue };
  },

  // #146 LRU Cache · Primary
  // Hash lookup plus doubly linked sentinels; reads and writes update recency, and eviction removes both map and list entries.
  "146": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    class DLLNode {
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
    };
    return { LRUCache };
  },

  // #460 LFU Cache · Primary
  // Track key frequency, ordered keys per frequency, and minimum frequency; evict the oldest key in the minimum bucket and update frequency even on reads.
  "460": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var LFUCache = function(capacity) {
        this.cap = capacity;
        this.keyVal = new Map();
        this.keyFreq = new Map();
        this.freqKeys = new Map();
        this.minFreq = 0;
    };

    LFUCache.prototype.get = function(key) {
        if (!this.keyVal.has(key)) return -1;
        this._updateFreq(key);
        return this.keyVal.get(key);
    };

    LFUCache.prototype.put = function(key, value) {
        if (this.cap <= 0) return;
        if (this.keyVal.has(key)) {
            this.keyVal.set(key, value);
            this._updateFreq(key);
            return;
        }
        if (this.keyVal.size >= this.cap) {
            const minKeys = this.freqKeys.get(this.minFreq);
            const evictKey = minKeys.keys().next().value;
            minKeys.delete(evictKey);
            this.keyVal.delete(evictKey);
            this.keyFreq.delete(evictKey);
        }
        this.keyVal.set(key, value);
        this.keyFreq.set(key, 1);
        if (!this.freqKeys.has(1)) this.freqKeys.set(1, new Map());
        this.freqKeys.get(1).set(key, null);
        this.minFreq = 1;
    };

    LFUCache.prototype._updateFreq = function(key) {
        // Get the current frequency of this key
        const currentFreq = this.keyFreq.get(key);
        const newFreq = currentFreq + 1;

        // Update the key's frequency
        this.keyFreq.set(key, newFreq);

        // Remove key from its current frequency bucket
        this.freqKeys.get(currentFreq).delete(key);

        // If this was the minimum frequency bucket and it's now empty, increment minFreq
        const currentFreqBucketIsEmpty = this.freqKeys.get(currentFreq).size === 0;
        if (currentFreqBucketIsEmpty && this.minFreq === currentFreq) {
            this.minFreq++;
        }

        // Add key to the new (higher) frequency bucket
        if (!this.freqKeys.has(newFreq)) {
            this.freqKeys.set(newFreq, new Map());
        }
        this.freqKeys.get(newFreq).set(key, null);
    };
    return { LFUCache };
  },

  // #23 Merge K Sorted Lists · Primary
  // Keep one node per list in the heap; after appending the smallest node, enqueue only its successor.
  "23": function(dependencies = {}) {
    const MinHeap = BinaryHeap;
    const Node = RandomNode;
    const _Node = GraphNode;
    var mergeKLists = function(lists) {
        const dummy = new ListNode(0);
        let current = dummy;

        // It always gives us the node with the smallest val in O(log k)
        const pq = new MinHeap((left, right) => left.val - right.val);

        // Seed the heap with the head of each non-empty list
        for (const headNode of lists) {
            if (headNode) {
                pq.enqueue(headNode);
            }
        }

        while (!pq.isEmpty()) {
            // Extract the globally smallest node across all list heads
            const smallestNode = pq.dequeue();

            // Attach it to the result list
            current.next = smallestNode;
            current = current.next;

            // If this node has a successor, push it into the heap to keep that list active
            if (smallestNode.next) {
                pq.enqueue(smallestNode.next);
            }
        }

        return dummy.next;
    };
    return { mergeKLists };
  },

  // #25 Reverse Nodes In K Group · Primary
  // Verify k nodes exist before rewiring; reverse exactly k and reconnect the untouched or recursively processed suffix.
  "25": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var reverseKGroup = function(head, k) {
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
    };
    return { reverseKGroup };
  },

  // #94 Binary Tree Inorder Traversal · Primary
  // Push the full left path, visit the popped node, then enter its right subtree.
  "94": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var inorderTraversal = function(root) {
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
    };
    return { inorderTraversal };
  },

  // #144 Binary Tree Preorder Traversal · Primary
  // Visit before children; push right before left so the stack visits left first.
  "144": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var preorderTraversal = function(root) {
        if (!root) {
            return [];
        }

        const stack = [root];
        const result = [];

        while (stack.length) {
            const node = stack.pop();
            result.push(node.val);

            // Push right first so left gets processed first (LIFO order)
            if (node.right) {
                stack.push(node.right);
            }

            if (node.left) {
                stack.push(node.left);
            }
        }

        return result;
    };
    return { preorderTraversal };
  },

  // #145 Binary Tree Postorder Traversal · Primary
  // Current implementation records root/right/left then reverses output; postorder consumers need child results before processing the parent.
  "145": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var postorderTraversal = function(root) {
        if (!root) {
            return [];
        }

        const stack = [root];
        const result = [];

        // Modified preorder: root, right, left
        // Push left first so right gets processed first (LIFO)
        while (stack.length) {
            const node = stack.pop();
            result.push(node.val);

            if (node.left) {
                stack.push(node.left);
            }

            if (node.right) {
                stack.push(node.right);
            }
        }

        // Reverse gives: left, right, root = postorder
        return result.reverse();
    };
    return { postorderTraversal };
  },

  // #226 Invert Binary Tree · Primary
  // Swap both child references at every node and visit the swapped subtrees.
  "226": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var invertTree = function(root) {
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
    };
    return { invertTree };
  },

  // #104 Maximum Depth of Binary Tree · Primary
  // Return zero for null and one plus the greater child depth; height is the returned summary.
  "104": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var maxDepth = function(root) {
        // Base case: an empty node contributes 0 depth
        if (!root) {
            return 0;
        }

        // Recursively find the depth of each subtree
        const leftDepth = maxDepth(root.left);
        const rightDepth = maxDepth(root.right);

        // This node adds 1 to the deeper of the two subtrees
        return 1 + Math.max(leftDepth, rightDepth);
    };
    return { maxDepth };
  },

  // #543 Diameter of Binary Tree · Primary
  // Return a one-branch height but update the best path with both child heights; measure diameter in edges.
  "543": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var diameterOfBinaryTree = function(root) {
        let maxDiameter = 0;

        // Returns subtree height in nodes: empty = 0, leaf = 1
        const height = (node) => {
            if (!node) {
                return 0;
            }

            const leftHeight = height(node.left);
            const rightHeight = height(node.right);

            // The longest path through this node uses both its left and right heights
            const pathThroughThisNode = leftHeight + rightHeight;
            maxDiameter = Math.max(maxDiameter, pathThroughThisNode);

            // Report height in nodes to the parent
            return 1 + Math.max(leftHeight, rightHeight);
        };

        height(root);
        return maxDiameter;
    };
    return { diameterOfBinaryTree };
  },

  // #110 Balanced Binary Tree · Primary
  // Use -1 to propagate an unbalanced subtree instead of repeatedly recomputing heights.
  "110": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var isBalanced = function(root) {
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
    };
    return { isBalanced };
  },

  // #100 Same Tree · Primary
  // Compare null structure as well as values, then both corresponding child pairs.
  "100": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var isSameTree = function(p, q) {
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
    };
    return { isSameTree };
  },

  // #572 Subtree of Another Tree · Primary
  // Try structural equality at every candidate root; equality of just the root value is insufficient.
  "572": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var isSubtree = function(root, subRoot) {
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
    };
    return { isSubtree };
  },

  // #235 Lowest Common Ancestor of a Binary Search Tree · Primary
  // Move toward both targets while they lie on one side; the first split or matching ancestor is the answer.
  "235": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var lowestCommonAncestor = function(root, p, q) {
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
    };
    return { lowestCommonAncestor };
  },

  // #701 Insert into a Binary Search Tree · Primary
  // Navigate by key comparisons and reconnect the recursive subtree result at the insertion point.
  "701": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var insertIntoBST = function(root, val) {
        // Base case: found the correct empty position — insert here
        if (!root) {
            return new TreeNode(val);
        }

        if (val < root.val) {
            // New value belongs in the left subtree
            root.left = insertIntoBST(root.left, val);
        } else {
            // New value belongs in the right subtree
            root.right = insertIntoBST(root.right, val);
        }

        // Return the unchanged root after insertion
        return root;
    };
    return { insertIntoBST };
  },

  // #450 Delete Node in a BST · Primary
  // Handle zero/one child replacement and two-child successor substitution followed by deletion of that successor.
  "450": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var deleteNode = function(root, key) {
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
    };
    return { deleteNode };
  },

  // #102 Binary Tree Level Order Traversal · Primary
  // Capture queue length before a level so children belong to the next level.
  "102": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var levelOrder = function(root) {
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
    };
    return { levelOrder };
  },

  // #199 Binary Tree Right Side View · Primary
  // With left-to-right queue order, keep the last item of each fixed-size level.
  "199": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var rightSideView = function(root) {
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
    };
    return { rightSideView };
  },

  // #427 Construct Quad Tree · Primary
  // Split a square into four quadrants; collapse only when all four children are leaves with the same value.
  "427": function(dependencies = {}) {
    const Node = QuadNode;
    const _Node = GraphNode;
    var construct = function(grid) {
        // Recursively build the quad-tree for the region starting at (row, col) with given size
        const build = (row, col, size) => {
            // Base case: single cell — always a leaf
            if (size === 1) {
                const cellValue = grid[row][col] === 1;
                return new Node(cellValue, true);
            }

            const halfSize = Math.floor(size / 2);

            // Recursively build four quadrants
            const topLeft     = build(row,           col,           halfSize);
            const topRight    = build(row,           col + halfSize, halfSize);
            const bottomLeft  = build(row + halfSize, col,           halfSize);
            const bottomRight = build(row + halfSize, col + halfSize, halfSize);

            // If all four quadrants are leaves with the same value, merge into one leaf
            const allLeaves = topLeft.isLeaf && topRight.isLeaf &&
                              bottomLeft.isLeaf && bottomRight.isLeaf;
            const allSameValue = topLeft.val === topRight.val &&
                                 topRight.val === bottomLeft.val &&
                                 bottomLeft.val === bottomRight.val;

            if (allLeaves && allSameValue) {
                return new Node(topLeft.val, true); // collapsed leaf
            }

            // Mixed region — create an internal node with four children
            return new Node(true, false, topLeft, topRight, bottomLeft, bottomRight);
        };

        return build(0, 0, grid.length);
    };
    return { construct };
  },

  // #1448 Count Good Nodes In Binary Tree · Primary
  // Carry the maximum from the current root-to-node path, not a global maximum from unrelated branches.
  "1448": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var goodNodes = function(root) {
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
    };
    return { goodNodes };
  },

  // #98 Validate Binary Search Tree · Primary
  // Pass strict ancestor bounds; checking each node only against its immediate children is insufficient.
  "98": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var isValidBST = function(root) {
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
    };
    return { isValidBST };
  },

  // #230 Kth Smallest Element In a Bst · Primary
  // Inorder traversal of a BST produces sorted values; stop at the kth visited node.
  "230": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var kthSmallest = function(root, k) {
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
    };
    return { kthSmallest };
  },

  // #105 Construct Binary Tree From Preorder And Inorder Traversal · Primary
  // Consume preorder root/left/right while a value-to-inorder-index map identifies subtree bounds; unique values are assumed.
  "105": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var buildTree = function(preorder, inorder) {
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
    };
    return { buildTree };
  },

  // #337 House Robber III · Primary
  // Return take/skip states: taking a parent forces skipping children; skipping permits each child's better state.
  "337": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var rob = function(root) {
        // DFS returns [gainIfRob, gainIfSkip] for each subtree
        const dfs = (node) => {
            if (!node) return [0, 0];

            const [leftRobGain, leftSkipGain] = dfs(node.left);
            const [rightRobGain, rightSkipGain] = dfs(node.right);

            // Rob this node: cannot rob direct children
            const gainIfRobThis = node.val + leftSkipGain + rightSkipGain;

            // Skip this node: take the best from each child independently
            const gainIfSkipThis = Math.max(leftRobGain, leftSkipGain) +
                                   Math.max(rightRobGain, rightSkipGain);

            return [gainIfRobThis, gainIfSkipThis];
        };

        const [robRoot, skipRoot] = dfs(root);
        return Math.max(robRoot, skipRoot);
    };
    return { rob };
  },

  // #1325 Delete Leaves With a Given Value · Primary
  // Process and reconnect children before deciding whether the current node has become a removable leaf.
  "1325": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var removeLeafNodes = function(root, target) {
        if (!root) return null;
        root.left = removeLeafNodes(root.left, target);
        root.right = removeLeafNodes(root.right, target);
        if (!root.left && !root.right && root.val === target) {
            return null;
        }
        return root;
    };
    return { removeLeafNodes };
  },

  // #124 Binary Tree Maximum Path Sum · Primary
  // Clamp negative child gains to zero; update a through-node best but return only one branch, and handle all-negative trees.
  "124": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var maxPathSum = function(root) {
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
    };
    return { maxPathSum };
  },

  // #297 Serialize And Deserialize Binary Tree · Primary
  // Include null tokens to preserve shape; decoding must consume tokens in the same preorder grammar.
  "297": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var serialize = function(root) {
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
    };
    return { serialize, deserialize };
  },

  // #703 Kth Largest Element In a Stream · Primary
  // Keep at most k largest arrivals in a min-heap; repeated add calls maintain the invariant across time.
  "703": function(dependencies = {}) {
    const MinHeap = BinaryHeap;
    const Node = RandomNode;
    const _Node = GraphNode;
    var KthLargest = function(k, nums) {
        this.k = k;
        this.heap = new MinHeap();
        for (const value of nums) this.add(value);
    };

    KthLargest.prototype.add = function(value) {
        this.heap.enqueue(value);
        if (this.heap.size() > this.k) this.heap.dequeue();
        return this.heap.front();
    };
    return { KthLargest };
  },

  // #1046 Last Stone Weight · Primary
  // Extract the two maximum weights, reinsert a positive difference, and handle zero or one survivor.
  "1046": function(dependencies = {}) {
    const MinHeap = BinaryHeap;
    const Node = RandomNode;
    const _Node = GraphNode;
    var lastStoneWeight = function(stones) {
        const heap = new MinHeap((left, right) => right - left);
        for (const weight of stones) heap.enqueue(weight);
        while (heap.size() > 1) {
            const heaviest = heap.dequeue();
            const second = heap.dequeue();
            if (heaviest !== second) heap.enqueue(heaviest - second);
        }
        return heap.isEmpty() ? 0 : heap.front();
    };
    return { lastStoneWeight };
  },

  // #973 K Closest Points to Origin · Primary
  // Rank by squared distance; a max-heap of k retained points evicts the farthest without computing square roots.
  "973": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var kClosest = function(points, k) {
        // We simulate a max-heap by storing NEGATED squared distances.
        // This way, the "smallest" item in our min-heap structure is actually
        // the FARTHEST point — so popping it keeps only the k closest.
        const heap = [];

        // --- Heap helper: push a new item and bubble it up ---
        const push = (val) => {
            heap.push(val);
            let i = heap.length - 1;

            while (i > 0) {
                const parent = (i - 1) >> 1; // integer division by 2

                // heap[*][0] is the negated distance; smaller value = farther point
                if (heap[parent][0] <= heap[i][0]) break; // parent is already "smaller" (farther), stop

                // Swap child and parent to restore heap order
                const temp = heap[parent];
                heap[parent] = heap[i];
                heap[i] = temp;

                i = parent; // move up
            }
        };

        // --- Heap helper: remove and return the top item (farthest point), then sift down ---
        const pop = () => {
            const top = heap[0]; // save the farthest point to return

            const last = heap.pop(); // remove the last element

            if (heap.length > 0) {
                heap[0] = last; // place last element at root

                let i = 0;
                while (true) {
                    let smallest = i;
                    const leftChild = 2 * i + 1;
                    const rightChild = 2 * i + 2;

                    // Check if left child is "smaller" (farther) than current smallest
                    if (leftChild < heap.length && heap[leftChild][0] < heap[smallest][0]) {
                        smallest = leftChild;
                    }

                    // Check if right child is "smaller" (farther) than current smallest
                    if (rightChild < heap.length && heap[rightChild][0] < heap[smallest][0]) {
                        smallest = rightChild;
                    }

                    if (smallest === i) break; // heap property restored, stop

                    // Swap to move the smaller (farther) child up
                    const temp = heap[smallest];
                    heap[smallest] = heap[i];
                    heap[i] = temp;

                    i = smallest; // continue sifting down
                }
            }

            return top;
        };

        // Process each point: push it, then evict the farthest if heap exceeds size k
        for (const [x, y] of points) {
            const negatedDist = -(x * x + y * y); // negate so farthest point sits at heap root
            push([negatedDist, x, y]);

            if (heap.length > k) {
                pop(); // remove the farthest point, keeping only k closest
            }
        }

        // Extract just the [x, y] coordinates (discard the negated distance)
        return heap.map(([_negDist, x, y]) => [x, y]);
    };
    return { kClosest };
  },

  // #215 Kth Largest Element In An Array · Primary
  // Randomized three-way quickselect narrows around sorted index n-k; the equal band prevents duplicate-heavy degeneration.
  "215": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findKthLargest = function(nums, k) {
        const target = nums.length - k;
        let left = 0;
        let right = nums.length - 1;
        while (left <= right) {
            const pivot = nums[left + Math.floor(Math.random() * (right - left + 1))];
            let smaller = left;
            let current = left;
            let larger = right;
            while (current <= larger) {
                if (nums[current] < pivot) {
                    [nums[smaller], nums[current]] = [nums[current], nums[smaller]];
                    smaller++;
                    current++;
                } else if (nums[current] > pivot) {
                    [nums[current], nums[larger]] = [nums[larger], nums[current]];
                    larger--;
                } else {
                    current++;
                }
            }
            if (target < smaller) right = smaller - 1;
            else if (target > larger) left = larger + 1;
            else return pivot;
        }
    };
    return { findKthLargest };
  },

  // #621 Task Scheduler · Primary
  // Maximum frequency, number tied for it, and cooldown determine a frame lower bound; take max with total task count.
  "621": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var leastInterval = function(tasks, n) {
        // Step 1: Count how many times each task type appears
        const freq = {};
        for (const t of tasks) {
            freq[t] = (freq[t] || 0) + 1;
        }

        // Step 2: Find the highest frequency among all task types
        const values = Object.values(freq);
        const maxFreq = Math.max(...values);

        // Step 3: Count how many task types share that maximum frequency
        // (they all appear in the last "frame" together)
        const maxCount = values.filter(v => v === maxFreq).length;

        // Step 4: The formula for minimum time:
        // (maxFreq - 1) frames of size (n+1), plus a final frame with maxCount tasks
        const formulaResult = (maxFreq - 1) * (n + 1) + maxCount;

        // If there are enough distinct tasks to fill all idle slots, no idle time is needed
        return Math.max(tasks.length, formulaResult);
    };
    return { leastInterval };
  },

  // #355 Design Twitter · Primary
  // Merge each followed user's newest-first stream, include self, and cap output at ten; JS repeatedly sorts candidates, Python uses a heap.
  "355": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var Twitter = function() {
        // Global decreasing timestamp: each new tweet gets a lower value
        // so the most recent tweet always has the smallest (most negative) count
        this.count = 0;

        // tweetMap: userId → array of [timestamp, tweetId] (oldest first, newest last)
        this.tweetMap = new Map();

        // followMap: userId → Set of followeeIds they follow
        this.followMap = new Map();
    };

    Twitter.prototype.postTweet = function(userId, tweetId) {
        // Ensure the user has a tweet list
        if (!this.tweetMap.has(userId)) {
            this.tweetMap.set(userId, []);
        }

        // Append [timestamp, tweetId] and decrement timestamp for next tweet
        this.tweetMap.get(userId).push([this.count, tweetId]);
        this.count--;
    };

    Twitter.prototype.getNewsFeed = function(userId) {
        const result = [];

        // A user always sees their own tweets
        if (!this.followMap.has(userId)) {
            this.followMap.set(userId, new Set());
        }
        this.followMap.get(userId).add(userId);

        // Build a list of "candidates" — one entry per followee's most recent tweet
        // Each candidate: { count (timestamp), tweetId, followeeId, idx (position in tweet list) }
        const candidates = [];
        for (const followeeId of this.followMap.get(userId)) {
            const tweets = this.tweetMap.get(followeeId);
            if (tweets && tweets.length > 0) {
                const idx = tweets.length - 1; // index of the most recent tweet
                candidates.push({
                    count:      tweets[idx][0],
                    tweetId:    tweets[idx][1],
                    followeeId: followeeId,
                    idx:        idx
                });
            }
        }

        // Merge-sort the streams: repeatedly pick the most recent tweet across all candidates
        while (candidates.length > 0 && result.length < 10) {
            // Sort to find the candidate with the smallest (most recent) timestamp
            candidates.sort((a, b) => a.count - b.count);
            const best = candidates.shift();

            result.push(best.tweetId);

            // If this followee has more tweets, add the next one to candidates
            if (best.idx > 0) {
                const tweets  = this.tweetMap.get(best.followeeId);
                const newIdx  = best.idx - 1;
                candidates.push({
                    count:      tweets[newIdx][0],
                    tweetId:    tweets[newIdx][1],
                    followeeId: best.followeeId,
                    idx:        newIdx
                });
            }
        }

        return result;
    };

    Twitter.prototype.follow = function(followerId, followeeId) {
        if (!this.followMap.has(followerId)) {
            this.followMap.set(followerId, new Set());
        }
        this.followMap.get(followerId).add(followeeId);
    };

    Twitter.prototype.unfollow = function(followerId, followeeId) {
        if (this.followMap.has(followerId)) {
            this.followMap.get(followerId).delete(followeeId);
        }
    };
    return { Twitter };
  },

  // #1834 Single Threaded CPU · Primary
  // Sort arrivals, enqueue all tasks available at current time, select by duration then original index, and jump time when idle.
  "1834": function(dependencies = {}) {
    const MinHeap = BinaryHeap;
    const Node = RandomNode;
    const _Node = GraphNode;
    var getOrder = function(tasks) {
        // Attach original indices before sorting, then sort by enqueue time
        const indexed = tasks.map((t, i) => [i, t[0], t[1]]).sort((a, b) => a[1] - b[1]);

        // Min-heap sorted by (processingTime, originalIndex) to pick the shortest available task
        const pq = new MinHeap((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);

        const result = [];
        let time = 0;
        let i = 0;
        const n = tasks.length;

        while (i < n || !pq.isEmpty()) {
            // If no tasks are available yet, jump time to when the next task arrives
            if (pq.isEmpty() && i < n && indexed[i][1] > time) {
                time = indexed[i][1];
            }

            // Enqueue all tasks that have arrived by current time
            while (i < n && indexed[i][1] <= time) {
                const processingTime = indexed[i][2];
                const originalIndex = indexed[i][0];
                pq.enqueue([processingTime, originalIndex]);
                i++;
            }

            // Process the shortest available task
            const [procTime, idx] = pq.dequeue();
            time += procTime;
            result.push(idx);
        }

        return result;
    };
    return { getOrder };
  },

  // #767 Reorganize String · Primary
  // Hold the last character out for one choice, reinsert its remaining count afterward; JS sorts candidates, Python uses a heap.
  "767": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var reorganizeString = function(s) {
        // Count frequency of each character
        const charCount = {};
        for (const ch of s) {
            charCount[ch] = (charCount[ch] || 0) + 1;
        }

        // If any character appears more than ceil(n/2) times, it's impossible
        const maxCount = Math.max(...Object.values(charCount));
        if (maxCount > Math.ceil(s.length / 2)) {
            return "";
        }

        // Build a max-heap using negative counts (simulate with sorted array)
        // Each entry: [-count, char]
        const heap = Object.entries(charCount).map(([ch, cnt]) => [-cnt, ch]);
        heap.sort((a, b) => a[0] - b[0]);

        const result = [];
        // Track the previously placed character so we don't place it again immediately
        let prevCount = 0;
        let prevChar = '';

        while (heap.length > 0) {
            // Re-sort to simulate extracting max (most frequent)
            heap.sort((a, b) => a[0] - b[0]);
            const [count, ch] = heap.shift();

            // Place this character in the result
            result.push(ch);

            // Push the previously held character back now that one step has passed
            if (prevCount < 0) {
                heap.push([prevCount, prevChar]);
            }

            // Hold the current character aside (decrement its count)
            prevCount = count + 1;
            prevChar = ch;
        }

        return result.join('');
    };
    return { reorganizeString };
  },

  // #1405 Longest Happy String · Primary
  // If the highest-count character would make three equal characters, use the next candidate or stop; reinsert unconsumed counts.
  "1405": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var longestDiverseString = function(a, b, c) {
        const heap = [];

        // Max-heap push: sift up after appending
        const push = (item) => {
            heap.push(item);
            let i = heap.length - 1;
            while (i > 0) {
                const parent = Math.floor((i - 1) / 2);
                if (heap[parent][0] >= heap[i][0]) break;
                [heap[parent], heap[i]] = [heap[i], heap[parent]];
                i = parent;
            }
        };

        // Max-heap pop: swap root with last, then sift down
        const pop = () => {
            if (heap.length <= 1) return heap.pop();
            const val = heap[0];
            heap[0] = heap.pop();
            let i = 0;
            while (true) {
                let largest = i;
                const left  = 2 * i + 1;
                const right = 2 * i + 2;
                if (left  < heap.length && heap[left][0]  > heap[largest][0]) largest = left;
                if (right < heap.length && heap[right][0] > heap[largest][0]) largest = right;
                if (largest === i) break;
                [heap[largest], heap[i]] = [heap[i], heap[largest]];
                i = largest;
            }
            return val;
        };

        // Seed the heap with each available character
        if (a > 0) push([a, 'a']);
        if (b > 0) push([b, 'b']);
        if (c > 0) push([c, 'c']);

        const result = [];
        while (heap.length) {
            let [cnt1, ch1] = pop();
            const lastTwo = result.length >= 2 &&
                            result[result.length - 1] === ch1 &&
                            result[result.length - 2] === ch1;

            if (lastTwo) {
                // Can't use ch1 again — it would make three in a row
                if (!heap.length) break;
                let [cnt2, ch2] = pop();
                result.push(ch2);
                cnt2--;
                if (cnt2 > 0) push([cnt2, ch2]);
                push([cnt1, ch1]); // push ch1 back to try next iteration
            } else {
                result.push(ch1);
                cnt1--;
                if (cnt1 > 0) push([cnt1, ch1]);
            }
        }
        return result.join('');
    };
    return { longestDiverseString };
  },

  // #1094 Car Pooling · Primary
  // Add at pickup and subtract at dropoff, then prefix-scan load; dropoff frees capacity at that same coordinate.
  "1094": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var carPooling = function(trips, capacity) {
        // Difference array: record +num at pickup, -num at dropoff
        const diff = new Array(1001).fill(0);

        for (const [numPassengers, pickupLoc, dropoffLoc] of trips) {
            diff[pickupLoc] += numPassengers;    // Passengers board here
            diff[dropoffLoc] -= numPassengers;   // Passengers exit here
        }

        // Sweep through all locations to find the running passenger count
        let currentPassengers = 0;
        for (const change of diff) {
            currentPassengers += change;
            if (currentPassengers > capacity) {
                return false; // Exceeded capacity at this location
            }
        }

        return true;
    };
    return { carPooling };
  },

  // #295 Find Median From Data Stream · Primary
  // Enforce both ordering between halves and size difference<=1; median comes from one root or the two roots.
  "295": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    // JavaScript has no built-in heap, so we implement a min-heap with helper functions.
    // We use the min-heap to simulate a max-heap by storing negated values.

    var MedianFinder = function() {
        // small = max-heap of the lower half (stored as negated values in a min-heap)
        this.small = [];
        // large = min-heap of the upper half
        this.large = [];
    };

    MedianFinder.prototype.addNum = function(num) {
        // Step 1: Push num into the lower half (negate to use min-heap as max-heap)
        heapPush(this.small, -num);

        // Step 2: Enforce the ordering invariant: max(small) <= min(large)
        // If the top of small is greater than the top of large, move it over
        if (this.small.length && this.large.length && -this.small[0] > this.large[0]) {
            const topOfSmall = -heapPop(this.small);
            heapPush(this.large, topOfSmall);
        }

        // Step 3: Balance sizes so they differ by at most 1
        if (this.small.length > this.large.length + 1) {
            // small is too big — move its max to large
            const topOfSmall = -heapPop(this.small);
            heapPush(this.large, topOfSmall);
        } else if (this.large.length > this.small.length + 1) {
            // large is too big — move its min to small
            const topOfLarge = heapPop(this.large);
            heapPush(this.small, -topOfLarge);
        }
    };

    MedianFinder.prototype.findMedian = function() {
        if (this.small.length > this.large.length) {
            // Lower half has one more element — its max is the median
            return -this.small[0];
        } else if (this.large.length > this.small.length) {
            // Upper half has one more element — its min is the median
            return this.large[0];
        } else {
            // Both halves are equal size — median is the average of both tops
            return (-this.small[0] + this.large[0]) / 2;
        }
    };

    // Min-heap push: bubble up the newly added element
    function heapPush(heap, val) {
        heap.push(val);
        let i = heap.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (heap[parent] <= heap[i]) break;
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        }
    }

    // Min-heap pop: remove and return the minimum, then restore heap order
    function heapPop(heap) {
        const top = heap[0];
        const last = heap.pop();
        if (heap.length > 0) {
            heap[0] = last;
            let i = 0;
            while (true) {
                let smallest = i;
                const left  = 2 * i + 1;
                const right = 2 * i + 2;
                if (left  < heap.length && heap[left]  < heap[smallest]) smallest = left;
                if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
                if (smallest === i) break;
                [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
                i = smallest;
            }
        }
        return top;
    }
    return { MedianFinder };
  },

  // #502 IPO · Primary
  // Move newly affordable projects into a profit max-heap and choose at most k; increased capital changes later eligibility.
  "502": function(dependencies = {}) {
    const MinHeap = BinaryHeap;
    const Node = RandomNode;
    const _Node = GraphNode;
    var findMaximizedCapital = function(k, w, profits, capital) {
        const projects = capital.map((required, index) => [required, profits[index]]);
        projects.sort((a, b) => a[0] - b[0]);
        const available = new MinHeap((a, b) => b - a);
        let next = 0;
        for (let chosen = 0; chosen < k; chosen++) {
            while (next < projects.length && projects[next][0] <= w) {
                available.enqueue(projects[next][1]);
                next++;
            }
            if (available.isEmpty()) break;
            w += available.dequeue();
        }
        return w;
    };
    return { findMaximizedCapital };
  },

  // #1863 Sum of All Subsets XOR Total · Primary
  // Include/exclude each value while carrying a running XOR and sum leaf results; the aggregation itself requires XOR.
  "1863": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var subsetXORSum = function(nums) {
        function visit(index, xor) {
            if (index === nums.length) return xor;
            const without = visit(index + 1, xor);
            const withValue = visit(index + 1, xor ^ nums[index]);
            return without + withValue;
        }
        return visit(0, 0);
    };
    return { subsetXORSum };
  },

  // #78 Subsets · Primary
  // Record every recursion node as a subset; advance start past a chosen position and copy the path.
  "78": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var subsets = function(nums) {
        const result = [];

        const backtrack = (start, current) => {
            // Every node in the recursion tree is a valid subset — record it now
            result.push([...current]);

            for (let i = start; i < nums.length; i++) {
                // Choose nums[i] to extend the current subset
                current.push(nums[i]);

                // Recurse: only consider elements after index i
                backtrack(i + 1, current);

                // Undo the choice (backtrack)
                current.pop();
            }
        };

        backtrack(0, []);
        return result;
    };
    return { subsets };
  },

  // #39 Combination Sum · Primary
  // Candidates are reusable, so recurse with the same index; positive sorted values permit remaining-target pruning.
  "39": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var combinationSum = function(candidates, target) {
        const result = [];

        // Sort so we can break early when a candidate exceeds the remaining target
        candidates.sort((a, b) => a - b);

        const backtrack = (start, remaining, current) => {
            // Base case: found a valid combination
            if (remaining === 0) {
                result.push([...current]);
                return;
            }

            for (let i = start; i < candidates.length; i++) {
                const candidate = candidates[i];

                // Since array is sorted, all further candidates are also too large
                if (candidate > remaining) break;

                // Choose this candidate
                current.push(candidate);

                // Recurse with same index i (allows reuse of this candidate)
                backtrack(i, remaining - candidate, current);

                // Undo the choice (backtrack)
                current.pop();
            }
        };

        backtrack(0, target, []);
        return result;
    };
    return { combinationSum };
  },

  // #40 Combination Sum II · Primary
  // Use each position once, recurse at i+1, and skip equal values only at the same recursion depth.
  "40": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var combinationSum2 = function(candidates, target) {
        const result = [];

        // Sort to group duplicates together and enable early pruning
        candidates.sort((a, b) => a - b);

        const backtrack = (start, remaining, current) => {
            // Base case: found a valid combination
            if (remaining === 0) {
                result.push([...current]);
                return;
            }

            for (let i = start; i < candidates.length; i++) {
                const candidate = candidates[i];

                // Prune: sorted array means all remaining candidates are also too large
                if (candidate > remaining) break;

                // Skip duplicates at the same recursion level to avoid duplicate combinations
                // i > start ensures we only skip after the first occurrence at this level
                if (i > start && candidates[i] === candidates[i - 1]) continue;

                // Choose this candidate
                current.push(candidate);

                // Recurse with i+1 (each element used at most once)
                backtrack(i + 1, remaining - candidate, current);

                // Undo the choice (backtrack)
                current.pop();
            }
        };

        backtrack(0, target, []);
        return result;
    };
    return { combinationSum2 };
  },

  // #77 Combinations · Primary
  // Record only paths of length k; stop choices early when too few remaining values can complete the path.
  "77": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var combine = function(n, k) {
        const result = [];

        const backtrack = (start, current) => {
            // Base case: picked exactly k numbers — record this combination
            if (current.length === k) {
                result.push([...current]);
                return;
            }

            // Pruning: we need (k - current.length) more numbers.
            // The largest valid starting point is n - (k - current.length) + 1,
            // because we need enough numbers remaining to fill the combination.
            const numbersNeeded = k - current.length;
            const upperBound = n - numbersNeeded + 1;

            for (let i = start; i <= upperBound; i++) {
                // Choose number i
                current.push(i);

                // Recurse: next number must be greater than i
                backtrack(i + 1, current);

                // Undo the choice (backtrack)
                current.pop();
            }
        };

        backtrack(1, []);
        return result;
    };
    return { combine };
  },

  // #46 Permutations · Primary
  // Choose any unused index; undo both the chosen value and its used marker.
  "46": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var permute = function(nums) {
        const result = [];

        // current: the permutation being built
        // used: set of indices already placed in current
        const backtrack = (current, used) => {
            // Base case: all elements are placed — full permutation found
            if (current.length === nums.length) {
                result.push([...current]);
                return;
            }

            for (let i = 0; i < nums.length; i++) {
                // Skip indices already in the current permutation
                if (used.has(i)) continue;

                // Choose: mark index as used and place its value
                used.add(i);
                current.push(nums[i]);

                // Recurse to fill the next position
                backtrack(current, used);

                // Undo: remove the value and unmark the index
                current.pop();
                used.delete(i);
            }
        };

        backtrack([], new Set());
        return result;
    };
    return { permute };
  },

  // #90 Subsets II · Primary
  // Sort and skip duplicates only when i>start; duplicates may still appear together deeper in a subset.
  "90": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var subsetsWithDup = function(nums) {
        const result = [];

        // Sort so duplicate values are adjacent — makes deduplication easy
        nums.sort((a, b) => a - b);

        const backtrack = (start, current) => {
            // Every partial state is a valid subset — record it immediately
            result.push([...current]);

            for (let i = start; i < nums.length; i++) {
                // Skip duplicates at the same recursion level.
                // i > start means we already branched with this value at this level.
                if (i > start && nums[i] === nums[i - 1]) continue;

                // Choose nums[i] and extend the current subset
                current.push(nums[i]);

                backtrack(i + 1, current);

                // Undo the choice (backtrack)
                current.pop();
            }
        };

        backtrack(0, []);
        return result;
    };
    return { subsetsWithDup };
  },

  // #47 Permutations II · Primary
  // For equal values, require the previous equal index to have been used on this path before using the next one.
  "47": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var permuteUnique = function(nums) {
        const result = [];

        // Sort so duplicate values are adjacent — enables deduplication
        nums.sort((a, b) => a - b);

        // used[i] = true means nums[i] is currently in the permutation being built
        const used = new Array(nums.length).fill(false);

        const backtrack = (current) => {
            // Base case: full permutation is complete
            if (current.length === nums.length) {
                result.push([...current]);
                return;
            }

            for (let i = 0; i < nums.length; i++) {
                // Skip if this index is already placed in current
                if (used[i]) continue;

                // Deduplication: if this value equals the previous value AND the
                // previous was not used at this level, skip to enforce ordering
                // among duplicates and prevent duplicate permutations
                if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;

                // Choose: mark used and place value
                used[i] = true;
                current.push(nums[i]);

                backtrack(current);

                // Undo: unmark and remove value
                current.pop();
                used[i] = false;
            }
        };

        backtrack([]);
        return result;
    };
    return { permuteUnique };
  },

  // #22 Generate Parentheses · Primary
  // Open count cannot exceed n; close count cannot exceed open count, so invalid prefixes are never generated.
  "22": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var generateParenthesis = function(n) {
        const result = [];
        const targetLength = 2 * n;

        const backtrack = (current, openCount, closeCount) => {
            // Base case: string is complete
            if (current.length === targetLength) {
                result.push(current);
                return;
            }

            // We can add '(' if we haven't used all n opening brackets
            const canAddOpen = openCount < n;
            if (canAddOpen) {
                backtrack(current + '(', openCount + 1, closeCount);
            }

            // We can add ')' only if there are unmatched '(' to close
            const canAddClose = closeCount < openCount;
            if (canAddClose) {
                backtrack(current + ')', openCount, closeCount + 1);
            }
        };

        backtrack('', 0, 0);
        return result;
    };
    return { generateParenthesis };
  },

  // #79 Word Search · Primary
  // Marks belong to one candidate word path and must be restored even after finding a matching continuation.
  "79": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var exist = function(board, word) {
        const rows = board.length;
        const cols = board[0].length;

        const backtrack = (r, c, idx) => {
            // Base case: matched all characters in word
            if (idx === word.length) return true;

            // Out of bounds or character mismatch — this path fails
            if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[idx]) {
                return false;
            }

            // Mark this cell as visited by replacing with a sentinel
            const originalChar = board[r][c];
            board[r][c] = "#";

            // Explore all four directions for the next character
            const foundDown  = backtrack(r + 1, c, idx + 1);
            const foundUp    = backtrack(r - 1, c, idx + 1);
            const foundRight = backtrack(r, c + 1, idx + 1);
            const foundLeft  = backtrack(r, c - 1, idx + 1);

            // Restore the cell so other paths can use it
            board[r][c] = originalChar;

            return foundDown || foundUp || foundRight || foundLeft;
        };

        // Try starting the word search from every cell
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (backtrack(r, c, 0)) return true;
            }
        }
        return false;
    };
    return { exist };
  },

  // #131 Palindrome Partitioning · Primary
  // Try each next cut, validate the chosen substring as a palindrome, then recurse on the remaining suffix.
  "131": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var partition = function(s) {
        const result = [];

        // Check if a substring reads the same forwards and backwards
        const isPalindrome = (sub) => {
            let left = 0;
            let right = sub.length - 1;

            while (left < right) {
                if (sub[left] !== sub[right]) return false;
                left++;
                right--;
            }
            return true;
        };

        // start: index where the next partition begins
        // current: list of palindrome substrings chosen so far
        const backtrack = (start, current) => {
            // Base case: consumed the entire string — all parts are palindromes
            if (start === s.length) {
                result.push([...current]);
                return;
            }

            // Try every possible end point for the next partition
            for (let end = start + 1; end <= s.length; end++) {
                const substring = s.slice(start, end);

                // Only recurse if this prefix is a palindrome
                if (isPalindrome(substring)) {
                    current.push(substring);
                    backtrack(end, current);
                    current.pop();
                }
            }
        };

        backtrack(0, []);
        return result;
    };
    return { partition };
  },

  // #17 Letter Combinations of a Phone Number · Primary
  // Each input position has its own allowed character set; this is a Cartesian product, with empty input returning no combinations.
  "17": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var letterCombinations = function(digits) {
        // Edge case: empty input has no combinations
        if (!digits.length) return [];

        // Map each digit to its phone keypad letters
        const phone = {
            "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
            "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"
        };
        const result = [];

        const backtrack = (index, current) => {
            // Base case: we have picked one letter for each digit
            if (index === digits.length) {
                result.push(current.join(""));
                return;
            }

            // Try every letter mapped to the current digit
            const currentDigit = digits[index];
            const letters = phone[currentDigit];

            for (const letter of letters) {
                // Choose this letter
                current.push(letter);

                // Recurse to pick a letter for the next digit
                backtrack(index + 1, current);

                // Undo the choice (backtrack)
                current.pop();
            }
        };

        backtrack(0, []);
        return result;
    };
    return { letterCombinations };
  },

  // #473 Matchsticks to Square · Primary
  // Require a divisible total, place large sticks first, and skip sides with equal current sums; undo unsuccessful placements.
  "473": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var makesquare = function(matchsticks) {
        const total = matchsticks.reduce((sum, value) => sum + value, 0);
        if (total % 4 !== 0) return false;
        const target = total / 4;
        matchsticks.sort((a, b) => b - a);
        const sides = [0, 0, 0, 0];
        function place(index) {
            if (index === matchsticks.length) return true;
            const tried = new Set();
            for (let side = 0; side < 4; side++) {
                if (tried.has(sides[side])) continue;
                tried.add(sides[side]);
                if (sides[side] + matchsticks[index] > target) continue;
                sides[side] += matchsticks[index];
                if (place(index + 1)) return true;
                sides[side] -= matchsticks[index];
            }
            return false;
        }
        return place(0);
    };
    return { makesquare };
  },

  // #698 Partition to K Equal Sum Subsets · Primary
  // Generalize to k target-sum buckets; reject oversized items and try each distinct current bucket sum only once per level.
  "698": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var canPartitionKSubsets = function(nums, k) {
        // Check if partition is even possible
        const totalSum = nums.reduce((acc, n) => acc + n, 0);
        if (totalSum % k !== 0) return false;

        const targetSum = totalSum / k;

        // Sort descending: try larger numbers first for faster pruning
        nums.sort((a, b) => b - a);

        // If the largest number exceeds the target, impossible to partition
        if (nums[0] > targetSum) return false;

        // k buckets, each trying to reach targetSum
        const buckets = new Array(k).fill(0);

        const backtrack = (numberIndex) => {
            // All numbers assigned: check if all buckets hit target
            if (numberIndex === nums.length) {
                return buckets.every(bucketSum => bucketSum === targetSum);
            }

            // Track which bucket sums we've already tried for this number
            // Avoids placing nums[numberIndex] in two buckets with the same current sum
            const triedBucketSums = new Set();

            for (let bucketIndex = 0; bucketIndex < k; bucketIndex++) {
                const currentBucketSum = buckets[bucketIndex];

                // Skip if adding this number would exceed the target
                if (currentBucketSum + nums[numberIndex] > targetSum) continue;

                // Skip if we already tried a bucket with this exact sum (duplicate state)
                if (triedBucketSums.has(currentBucketSum)) continue;

                triedBucketSums.add(currentBucketSum);

                // Place this number in the current bucket and recurse
                buckets[bucketIndex] += nums[numberIndex];
                if (backtrack(numberIndex + 1)) return true;
                buckets[bucketIndex] -= nums[numberIndex]; // undo
            }

            return false;
        };

        return backtrack(0);
    };
    return { canPartitionKSubsets };
  },

  // #51 N Queens · Primary
  // Place one queen per row; track column, row+column, and row-column attacks and restore all three after recursion.
  "51": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var solveNQueens = function(n) {
        const result = [];

        // Track which columns and diagonals are already occupied
        const cols = new Set();
        const posDiag = new Set(); // cells on same positive diagonal share row + col
        const negDiag = new Set(); // cells on same negative diagonal share row - col

        // Initialize an n×n board of empty cells
        const board = Array(n)
            .fill(null)
            .map(() => Array(n).fill("."));

        const backtrack = (row) => {
            // Base case: placed a queen in every row — record the solution
            if (row === n) {
                const boardSnapshot = board.map(rowArr => rowArr.join(""));
                result.push(boardSnapshot);
                return;
            }

            for (let col = 0; col < n; col++) {
                const isColumnAttacked = cols.has(col);
                const isPosDiagAttacked = posDiag.has(row + col);
                const isNegDiagAttacked = negDiag.has(row - col);

                // Skip this column if it is under attack
                if (isColumnAttacked || isPosDiagAttacked || isNegDiagAttacked) {
                    continue;
                }

                // Place the queen and mark all attacked lines
                cols.add(col);
                posDiag.add(row + col);
                negDiag.add(row - col);
                board[row][col] = "Q";

                // Recurse to place the next row's queen
                backtrack(row + 1);

                // Remove the queen and unmark attacked lines (backtrack)
                board[row][col] = ".";
                cols.delete(col);
                posDiag.delete(row + col);
                negDiag.delete(row - col);
            }
        };

        backtrack(0);
        return result;
    };
    return { solveNQueens };
  },

  // #52 N Queens II · Primary
  // Use the same attack-state search but count completions instead of materializing boards.
  "52": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var totalNQueens = function(n) {
        function backtrack(row, usedCols, usedDiag1, usedDiag2) {
            // All rows filled successfully: count this as one solution
            if (row === n) {
                return 1;
            }

            let count = 0;

            for (let col = 0; col < n; col++) {
                const isColTaken = usedCols.has(col);
                const isDiag1Taken = usedDiag1.has(row - col);  // same main diagonal
                const isDiag2Taken = usedDiag2.has(row + col);  // same anti-diagonal

                if (isColTaken || isDiag1Taken || isDiag2Taken) {
                    continue;
                }

                // Place queen at (row, col)
                usedCols.add(col);
                usedDiag1.add(row - col);
                usedDiag2.add(row + col);

                count = count + backtrack(row + 1, usedCols, usedDiag1, usedDiag2);

                // Remove queen (backtrack)
                usedCols.delete(col);
                usedDiag1.delete(row - col);
                usedDiag2.delete(row + col);
            }

            return count;
        }

        return backtrack(0, new Set(), new Set(), new Set());
    };
    return { totalNQueens };
  },

  // #140 Word Break II · Primary
  // Memoize all valid sentences for each suffix; combine each valid word with every completion and retain the empty completion base case.
  "140": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var wordBreak = function(s, wordDict) {
        const wordSet = new Set(wordDict);

        // memo[start] = list of sentences that can be formed from s[start..]
        const memo = new Map();

        function dp(startIndex) {
            // Reached the end of the string — one valid "empty" completion
            if (startIndex === s.length) {
                return [''];
            }

            // Return cached result if available
            if (memo.has(startIndex)) {
                return memo.get(startIndex);
            }

            const sentences = [];

            // Try every possible end position for the next word
            for (let endIndex = startIndex + 1; endIndex <= s.length; endIndex = endIndex + 1) {
                const word = s.substring(startIndex, endIndex);

                if (wordSet.has(word)) {
                    // For each valid sentence from the rest, prepend this word
                    const restSentences = dp(endIndex);

                    for (const rest of restSentences) {
                        if (rest) {
                            sentences.push(word + ' ' + rest);
                        } else {
                            sentences.push(word);
                        }
                    }
                }
            }

            memo.set(startIndex, sentences);
            return sentences;
        }

        return dp(0);
    };
    return { wordBreak };
  },

  // #208 Implement Trie Prefix Tree · Primary
  // Distinguish end-of-word from an existing prefix; insertion creates missing children without overwriting existing branches.
  "208": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var Trie = function() {
        // The root is an empty node; each key is a character, each value is a child node
        this.root = {};
    };

    Trie.prototype.insert = function(word) {
        // Walk down the trie, creating nodes as needed for each character
        let node = this.root;

        for (const c of word) {
            if (!node[c]) {
                // This character does not exist at this level — create a new child node
                node[c] = {};
            }
            // Move to the child node for this character
            node = node[c];
        }

        // Mark the end of a complete word with a special sentinel key
        node['#'] = true;
    };

    Trie.prototype.search = function(word) {
        // Walk down the trie following each character of the word
        let node = this.root;

        for (const c of word) {
            if (!node[c]) {
                // Character not found — the word is not in the trie
                return false;
            }
            node = node[c];
        }

        // Check that we landed on a node that marks a complete word
        return '#' in node;
    };

    Trie.prototype.startsWith = function(prefix) {
        // Same as search, but we do NOT require the end-of-word marker
        let node = this.root;

        for (const c of prefix) {
            if (!node[c]) {
                return false;
            }
            node = node[c];
        }

        // If we traversed the full prefix without missing any node, it exists
        return true;
    };
    return { Trie };
  },

  // #211 Design Add And Search Words Data Structure · Primary
  // A dot branches over real character children; an exhausted query succeeds only at an end marker.
  "211": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var WordDictionary = function() {
        // Standard trie root node
        this.root = {};
    };

    WordDictionary.prototype.addWord = function(word) {
        // Standard trie insertion: create nodes for each character, mark end of word
        let node = this.root;

        for (const c of word) {
            if (!node[c]) {
                node[c] = {};
            }
            node = node[c];
        }

        node['#'] = true; // end-of-word sentinel
    };

    WordDictionary.prototype.search = function(word) {
        // DFS helper: node = current trie node, i = current index in word
        const dfs = (node, i) => {
            // Base case: we have processed all characters
            if (i === word.length) {
                return '#' in node; // valid only if this is a complete word
            }

            const currentChar = word[i];

            if (currentChar === '.') {
                // Wildcard: try every child node (except the end-of-word marker)
                for (const key in node) {
                    if (key !== '#') {
                        const matched = dfs(node[key], i + 1);
                        if (matched) {
                            return true; // found a match through this branch
                        }
                    }
                }
                return false; // no child matched the wildcard
            } else {
                // Specific character: follow only that child if it exists
                if (!node[currentChar]) {
                    return false; // character not in trie
                }
                return dfs(node[currentChar], i + 1);
            }
        };

        return dfs(this.root, 0);
    };
    return { WordDictionary };
  },

  // #2707 Extra Characters in a String · Primary
  // Current solution is prefix DP with a dictionary set, not a trie; compare skipping one character with completing every matching word.
  "2707": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var minExtraChar = function(s, dictionary) {
        const words = new Set(dictionary);
        const dp = new Array(s.length + 1).fill(0);
        for (let end = 1; end <= s.length; end++) {
            dp[end] = dp[end - 1] + 1;
            for (let start = 0; start < end; start++) {
                if (words.has(s.slice(start, end))) {
                    dp[end] = Math.min(dp[end], dp[start]);
                }
            }
        }
        return dp[s.length];
    };
    return { minExtraChar };
  },

  // #212 Word Search II · Primary
  // Follow trie prefixes while marking the current board path; remove a found terminal to avoid duplicates and delete exhausted branches.
  "212": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findWords = function(board, words) {
        // Build Trie from all words
        const trie = {};
        for (const word of words) {
            let node = trie;
            for (const char of word) {
                if (!node[char]) {
                    node[char] = {};
                }
                node = node[char];
            }
            // Mark end of word with '#' storing the full word
            node['#'] = word;
        }

        const rows = board.length;
        const cols = board[0].length;
        const result = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        function dfs(row, col, trieNode) {
            const currentChar = board[row][col];

            // No path in trie for this character
            if (!trieNode[currentChar]) {
                return;
            }

            const nextNode = trieNode[currentChar];

            // Found a complete word
            if (nextNode['#']) {
                result.push(nextNode['#']);
                delete nextNode['#']; // Prevent duplicate results
            }

            // Mark cell as visited by replacing with sentinel
            board[row][col] = '.';

            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;

                const inBounds = newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols;
                const notVisited = board[newRow] && board[newRow][newCol] !== '.';

                if (inBounds && notVisited) {
                    dfs(newRow, newCol, nextNode);
                }
            }

            // Restore the cell after backtracking
            board[row][col] = currentChar;

            // Prune empty Trie branches for efficiency
            if (Object.keys(nextNode).length === 0) {
                delete trieNode[currentChar];
            }
        }

        // Start DFS from every cell on the board
        for (let i = 0; i < rows; i = i + 1) {
            for (let j = 0; j < cols; j = j + 1) {
                dfs(i, j, trie);
            }
        }

        return result;
    };
    return { findWords };
  },

  // #463 Island Perimeter · Primary
  // Count four edges per land cell and subtract two per already-counted shared boundary; traversal is unnecessary.
  "463": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var islandPerimeter = function(grid) {
        const rows = grid.length;
        const cols = grid[0].length;
        let perimeter = 0;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Only process land cells
                if (grid[r][c] === 1) {
                    // Each land cell contributes 4 edges
                    perimeter += 4;

                    // If there's a land cell above, they share an edge — subtract 2
                    const hasLandAbove = r > 0 && grid[r - 1][c] === 1;
                    if (hasLandAbove) {
                        perimeter -= 2;
                    }

                    // If there's a land cell to the left, they share an edge — subtract 2
                    const hasLandLeft = c > 0 && grid[r][c - 1] === 1;
                    if (hasLandLeft) {
                        perimeter -= 2;
                    }
                }
            }
        }

        return perimeter;
    };
    return { islandPerimeter };
  },

  // #953 Verifying An Alien Dictionary · Primary
  // Use supplied character ranks, stop at the first mismatch, and reject a longer word before its own prefix.
  "953": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var isAlienSorted = function(words, order) {
        // Map each character to its rank in the alien alphabet
        const rank = {};
        for (let i = 0; i < order.length; i++) {
            rank[order[i]] = i;
        }

        // Check each adjacent pair of words
        for (let i = 0; i < words.length - 1; i++) {
            const word1 = words[i];
            const word2 = words[i + 1];

            // Compare character by character
            for (let j = 0; j < word1.length; j++) {
                // word1 is longer than word2 and word2 is a prefix — out of order
                if (j >= word2.length) return false;

                const rank1 = rank[word1[j]];
                const rank2 = rank[word2[j]];

                if (rank1 < rank2) {
                    // word1 comes before word2 at this character — this pair is in order
                    break;
                }
                if (rank1 > rank2) {
                    // word1 comes after word2 at this character — out of order
                    return false;
                }
                // Characters are equal — continue to next position
            }
        }

        return true;
    };
    return { isAlienSorted };
  },

  // #997 Find the Town Judge · Primary
  // Increment inbound and decrement outbound trust balance; the judge must reach n-1 under the distinct-edge constraints.
  "997": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findJudge = function(n, trust) {
        // balance[i] = (number of people who trust i) - (number of people i trusts)
        const balance = new Array(n + 1).fill(0);

        for (const [truster, trusted] of trust) {
            balance[truster]--;  // truster loses trust points (they trust someone)
            balance[trusted]++;  // trusted gains trust points (being trusted)
        }

        // The judge is trusted by all n-1 others and trusts nobody
        // So their balance must be exactly n-1
        for (let person = 1; person <= n; person++) {
            if (balance[person] === n - 1) return person;
        }

        return -1; // No judge found
    };
    return { findJudge };
  },

  // #200 Number of Islands · Recursive DFS
  // Restart traversal on each unvisited land cell; recursive and iterative versions mark land permanently for component discovery.
  "200": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var numIslands = function(grid) {
        if (!grid.length) return 0;

        const rows = grid.length;
        const cols = grid[0].length;
        let count = 0;

        // Sink the entire island connected to (r, c) by marking cells as "0"
        const dfs = (r, c) => {
            // Stop if out of bounds or already water/visited
            if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") {
                return;
            }

            // Mark this land cell as visited (sink it)
            grid[r][c] = "0";

            // Flood to all 4 adjacent land cells
            dfs(r + 1, c);
            dfs(r - 1, c);
            dfs(r, c + 1);
            dfs(r, c - 1);
        };

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === "1") {
                    // Found an unvisited land cell — this is a new island
                    count++;

                    // Sink the entire island so we do not count it again
                    dfs(r, c);
                }
            }
        }

        return count;
    };
    return { numIslands };
  },

  // #200 Number of Islands · Iterative DFS (explicit stack)
  // Use an explicit stack and mark before pushing; each land cell is scheduled once.
  "200-iterative": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var numIslands = function(grid) {
        if (!grid.length) return 0;

        const rows = grid.length;
        const cols = grid[0].length;
        let count = 0;
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        const dfs = (r, c) => {
            const stack = [];
            grid[r][c] = "0";
            stack.push([r, c]);

            while (stack.length) {
                [r, c] = stack.pop();
                for (const [dr, dc] of directions) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "1") {
                        grid[nr][nc] = "0";
                        stack.push([nr, nc]);
                    }
                }
            }
        };

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === "1") {
                    count++;
                    dfs(r, c);
                }
            }
        }

        return count;
    };
    return { numIslands };
  },

  // #695 Max Area of Island · Recursive DFS
  // Count cells within each component and track the largest area; iterative version counts on pop and marks on push.
  "695": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var maxAreaOfIsland = function(grid) {
        const rows = grid.length;
        const cols = grid[0].length;
        let maxArea = 0;

        // DFS returns the total area of the island connected to (r, c)
        const dfs = (r, c) => {
            // Base case: out of bounds or water — contributes 0 area
            if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== 1) {
                return 0;
            }

            // Mark this cell as visited by sinking it to water
            grid[r][c] = 0;

            // This cell counts as 1, plus the area from all 4 directions
            const downArea  = dfs(r + 1, c);
            const upArea    = dfs(r - 1, c);
            const rightArea = dfs(r, c + 1);
            const leftArea  = dfs(r, c - 1);

            return 1 + downArea + upArea + rightArea + leftArea;
        };

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 1) {
                    // Compute area of this island and track the maximum
                    const islandArea = dfs(r, c);
                    maxArea = Math.max(maxArea, islandArea);
                }
            }
        }

        return maxArea;
    };
    return { maxAreaOfIsland };
  },

  // #695 Max Area of Island · Iterative DFS (explicit stack)
  // Use an explicit stack, mark before pushing, and maintain a component area counter.
  "695-iterative": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var maxAreaOfIsland = function(grid) {
        const rows = grid.length;
        const cols = grid[0].length;
        let maxArea = 0;
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        const islandArea = (r, c) => {
            const stack = [];
            let area = 0;
            grid[r][c] = 0;
            stack.push([r, c]);
            while (stack.length) {
                [r, c] = stack.pop();
                area++;
                for (const [dr, dc] of directions) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
                        grid[nr][nc] = 0;
                        stack.push([nr, nc]);
                    }
                }
            }
            return area;
        };

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 1) {
                    const area = islandArea(r, c);
                    maxArea = Math.max(maxArea, area);
                }
            }
        }
        return maxArea;
    };
    return { maxAreaOfIsland };
  },

  // #133 Clone Graph · Recursive DFS
  // Register a clone before exploring neighbors to preserve cycles and shared identities; recursive and iterative versions differ only in traversal control.
  "133": function(dependencies = {}) {
    const Node = GraphNode;
    const _Node = GraphNode;
    var cloneGraph = function(node) {
        if (!node) return null;

        // Maps original node objects to their cloned counterparts
        // Also serves as the visited set to prevent infinite loops in cycles
        const cloned = new Map();

        const dfs = (original) => {
            // If already cloned, return the existing copy (handles cycles)
            if (cloned.has(original)) {
                return cloned.get(original);
            }

            // Create the clone for this node
            const copy = new _Node(original.val);

            // Store the clone BEFORE recursing into neighbors
            // This breaks cycles: if we visit this node again, we return the clone above
            cloned.set(original, copy);

            // Recursively clone each neighbor and link it to the copy
            for (const neighbor of original.neighbors) {
                const clonedNeighbor = dfs(neighbor);
                copy.neighbors.push(clonedNeighbor);
            }

            return copy;
        };

        return dfs(node);
    };
    return { cloneGraph };
  },

  // #133 Clone Graph · Iterative DFS (explicit stack)
  // Create/map clones when discovered and wire all neighbor references while processing an explicit stack.
  "133-iterative": function(dependencies = {}) {
    const Node = GraphNode;
    const _Node = GraphNode;
    var cloneGraph = function(node) {
        if (!node) return null;

        const cloned = new Map();
        cloned.set(node, new _Node(node.val));
        const stack = [node];
        while (stack.length) {
            const original = stack.pop();
            const copy = cloned.get(original);
            for (const neighbor of original.neighbors) {
                if (!cloned.has(neighbor)) {
                    cloned.set(neighbor, new _Node(neighbor.val));
                    stack.push(neighbor);
                }
                copy.neighbors.push(cloned.get(neighbor));
            }
        }
        return cloned.get(node);
    };
    return { cloneGraph };
  },

  // #286 Walls And Gates · Primary
  // Seed all gates, write distance at discovery, and expand only unfilled rooms so walls and previous discoveries are preserved.
  "286": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var wallsAndGates = function(rooms) {
        if (!rooms.length) return;

        const numRows = rooms.length;
        const numCols = rooms[0].length;
        const INF = 2147483647;
        const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

        // Multi-source BFS: start from all gates simultaneously
        const queue = [];
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                if (rooms[row][col] === 0) {
                    queue.push([row, col]);
                }
            }
        }

        // BFS expands outward from all gates at once
        let readIdx = 0;
        while (readIdx < queue.length) {
            const [row, col] = queue[readIdx++];

            for (const [deltaRow, deltaCol] of dirs) {
                const neighborRow = row + deltaRow;
                const neighborCol = col + deltaCol;

                // Only update empty rooms (INF means unvisited empty room)
                const inBounds = neighborRow >= 0 && neighborRow < numRows &&
                                 neighborCol >= 0 && neighborCol < numCols;
                if (inBounds && rooms[neighborRow][neighborCol] === INF) {
                    // Distance to this room = distance to current cell + 1
                    rooms[neighborRow][neighborCol] = rooms[row][col] + 1;
                    queue.push([neighborRow, neighborCol]);
                }
            }
        }
    };
    return { wallsAndGates };
  },

  // #994 Rotting Oranges · Primary
  // Seed all rotten cells, count fresh cells, and advance in fixed layers; distinguish no fresh cells from unreachable fresh cells.
  "994": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var orangesRotting = function(grid) {
        const rows = grid.length;
        const cols = grid[0].length;

        // Multi-source BFS: start all rotten oranges in the queue simultaneously
        const queue = [];
        let freshCount = 0;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 2) {
                    queue.push([r, c]);
                } else if (grid[r][c] === 1) {
                    freshCount++;
                }
            }
        }

        // If no fresh oranges exist, no time is needed
        if (freshCount === 0) return 0;

        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        let minutesElapsed = 0;

        // BFS level by level — each level = one minute of spreading rot
        while (queue.length > 0) {
            const levelSize = queue.length;

            for (let i = 0; i < levelSize; i++) {
                const [r, c] = queue.shift();

                for (const [dr, dc] of directions) {
                    const neighborRow = r + dr;
                    const neighborCol = c + dc;

                    const inBounds = neighborRow >= 0 && neighborRow < rows &&
                                     neighborCol >= 0 && neighborCol < cols;

                    if (inBounds && grid[neighborRow][neighborCol] === 1) {
                        // Rot this fresh orange and enqueue it
                        grid[neighborRow][neighborCol] = 2;
                        freshCount--;
                        queue.push([neighborRow, neighborCol]);
                    }
                }
            }

            minutesElapsed++;
        }

        // Subtract 1: the last BFS level incremented minutes but produced no new rot
        // If fresh oranges remain, they are unreachable
        return freshCount === 0 ? minutesElapsed - 1 : -1;
    };
    return { orangesRotting };
  },

  // #417 Pacific Atlantic Water Flow · Iterative DFS (coordinate pairs)
  // Reverse water edges: climb from each ocean's border to equal/higher cells, maintain two visited grids, and intersect them.
  "417": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var pacificAtlantic = function(heights) {
        const rows = heights.length;
        const cols = heights[0].length;

        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        function explore(startRow, startCol, visited) {
            if (visited[startRow][startCol]) return;

            visited[startRow][startCol] = true;
            const stack = [[startRow, startCol]];

            while (stack.length) {
                const [r, c] = stack.pop();

                for (const [dr, dc] of directions) {
                    const nr = r + dr;
                    const nc = c + dc;

                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
                        continue;
                    }

                    if (visited[nr][nc]) continue;

                    // Search backward: move uphill or stay at equal height.
                    if (heights[nr][nc] < heights[r][c]) continue;

                    visited[nr][nc] = true;
                    stack.push([nr, nc]);
                }
            }
        }

        const pacific = Array(rows)
            .fill(null)
            .map(() => Array(cols).fill(false));
        const atlantic = Array(rows)
            .fill(null)
            .map(() => Array(cols).fill(false));

        // Left edge → Pacific; right edge → Atlantic.
        for (let r = 0; r < rows; r++) {
            explore(r, 0, pacific);
            explore(r, cols - 1, atlantic);
        }

        // Top edge → Pacific; bottom edge → Atlantic.
        for (let c = 0; c < cols; c++) {
            explore(0, c, pacific);
            explore(rows - 1, c, atlantic);
        }

        const result = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (pacific[r][c] && atlantic[r][c]) {
                    result.push([r, c]);
                }
            }
        }

        return result;
    };
    return { pacificAtlantic };
  },

  // #130 Surrounded Regions · Recursive DFS
  // Mark border-connected O cells safe, capture the remaining O cells, then restore the safe marker.
  "130": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var solve = function(board) {
        if (!board.length) return;

        const rows = board.length;
        const cols = board[0].length;

        // DFS to mark all O's reachable from a border O as safe ("S")
        const dfs = (r, c) => {
            // Stop if out of bounds or not an O cell
            if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== "O") {
                return;
            }

            // Mark this cell as safe — it touches the border
            board[r][c] = "S";

            // Spread to all 4 neighbors
            dfs(r + 1, c);
            dfs(r - 1, c);
            dfs(r, c + 1);
            dfs(r, c - 1);
        };

        // Step 1: mark every border O and all O's connected to it as safe
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const isOnBorder = (r === 0 || r === rows - 1 || c === 0 || c === cols - 1);

                if (isOnBorder && board[r][c] === "O") {
                    dfs(r, c);
                }
            }
        }

        // Step 2: flip remaining O's to X (surrounded), restore S's back to O (safe)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c] === "O") {
                    // This O was never reached from a border — it is surrounded
                    board[r][c] = "X";
                } else if (board[r][c] === "S") {
                    // Restore safe cells back to O
                    board[r][c] = "O";
                }
            }
        }
    };
    return { solve };
  },

  // #130 Surrounded Regions · Iterative DFS (explicit stack)
  // Use an explicit stack for border safety marking, then capture and restore in a second pass.
  "130-iterative": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var solve = function(board) {
        if (!board.length) return;
        const rows = board.length;
        const cols = board[0].length;
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        const markSafe = (r, c) => {
            const stack = [];
            board[r][c] = "S";
            stack.push([r, c]);
            while (stack.length) {
                [r, c] = stack.pop();
                for (const [dr, dc] of directions) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === "O") {
                        board[nr][nc] = "S";
                        stack.push([nr, nc]);
                    }
                }
            }
        };

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const onBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
                if (onBorder && board[r][c] === "O") {
                    markSafe(r, c);
                }
            }
        }

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c] === "O") {
                    board[r][c] = "X";
                } else if (board[r][c] === "S") {
                    board[r][c] = "O";
                }
            }
        }
    };
    return { solve };
  },

  // #752 Open The Lock · Primary
  // Generate digit-wheel neighbors, reject dead ends before enqueueing, mark discovered states, and count shortest moves.
  "752": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var openLock = function(deadends, target) {
        const deadendSet = new Set(deadends);

        // If the starting state is a deadend, we're immediately stuck
        if (deadendSet.has("0000")) return -1;

        // BFS: explore lock states level by level, each level = 1 move
        const queue = [["0000", 0]]; // [state, moveCount]
        const visitedStates = new Set(["0000"]);

        while (queue.length > 0) {
            const [currentState, moveCount] = queue.shift();

            // Found the target
            if (currentState === target) return moveCount;

            // Generate all 8 neighbors (4 wheels × 2 directions)
            for (let wheelIndex = 0; wheelIndex < 4; wheelIndex++) {
                const currentDigit = parseInt(currentState[wheelIndex]);

                // Turn up (+1) and turn down (-1), wrapping around 0-9
                const upDigit = (currentDigit + 1) % 10;
                const downDigit = (currentDigit + 9) % 10; // +9 mod 10 = -1 mod 10

                for (const newDigit of [upDigit, downDigit]) {
                    const newState = currentState.slice(0, wheelIndex) +
                                     newDigit +
                                     currentState.slice(wheelIndex + 1);

                    if (!visitedStates.has(newState) && !deadendSet.has(newState)) {
                        visitedStates.add(newState);
                        queue.push([newState, moveCount + 1]);
                    }
                }
            }
        }

        // Target unreachable
        return -1;
    };
    return { openLock };
  },

  // #207 Course Schedule · Primary
  // Edges run prerequisite to dependent course; process zero-indegree nodes and require every course to be processed.
  "207": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var canFinish = function(numCourses, prerequisites) {
        // Build adjacency list: graph[prereq] = list of courses that depend on prereq
        const graph = Array(numCourses)
            .fill(null)
            .map(() => []);
        const inDegree = new Array(numCourses).fill(0);

        for (const [course, prereq] of prerequisites) {
            graph[prereq].push(course);
            inDegree[course]++;
        }

        // Start BFS from all courses that have no prerequisites
        const queue = [];
        for (let i = 0; i < numCourses; i++) {
            if (inDegree[i] === 0) {
                queue.push(i);
            }
        }

        // Process courses layer by layer (Kahn's algorithm)
        let processedCount = 0;

        while (queue.length > 0) {
            const course = queue.shift();
            processedCount++;

            // "Taking" this course reduces the prerequisite count for dependent courses
            for (const dependentCourse of graph[course]) {
                inDegree[dependentCourse]--;

                // If all prerequisites are now satisfied, add to queue
                if (inDegree[dependentCourse] === 0) {
                    queue.push(dependentCourse);
                }
            }
        }

        // If we processed every course, there was no cycle → can finish
        return processedCount === numCourses;
    };
    return { canFinish };
  },

  // #210 Course Schedule II · Primary
  // Collect the same topological processing order; return no order if a cycle prevents processing all courses.
  "210": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findOrder = function(numCourses, prerequisites) {
        // Build adjacency list: graph[prereq] = list of courses unlocked by taking prereq
        const graph = Array(numCourses)
            .fill(null)
            .map(() => []);
        const inDegree = new Array(numCourses).fill(0);

        for (const [course, prereq] of prerequisites) {
            graph[prereq].push(course);
            inDegree[course]++;
        }

        // Seed the queue with all courses that have no prerequisites
        const queue = [];
        for (let i = 0; i < numCourses; i++) {
            if (inDegree[i] === 0) {
                queue.push(i);
            }
        }

        // Process courses in topological order, recording each one taken
        const order = [];

        while (queue.length > 0) {
            const course = queue.shift();
            order.push(course);

            for (const dependentCourse of graph[course]) {
                inDegree[dependentCourse]--;

                // Unlock this course once all its prerequisites have been taken
                if (inDegree[dependentCourse] === 0) {
                    queue.push(dependentCourse);
                }
            }
        }

        // If order contains all courses, we found a valid schedule; otherwise there's a cycle
        if (order.length === numCourses) {
            return order;
        } else {
            return [];
        }
    };
    return { findOrder };
  },

  // #261 Graph Valid Tree · Primary
  // Skip the parent edge in undirected DFS, reject any other discovered neighbor, and require full connectivity.
  "261": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var validTree = function(n, edges) {
        const graph = Array(n)
            .fill(null)
            .map(() => []);

        for (const [a, b] of edges) {
            graph[a].push(b);
            graph[b].push(a);
        }

        const visited = new Set([0]);
        const stack = [[0, -1]]; // [node, parent]

        while (stack.length) {
            const [node, parent] = stack.pop();

            for (const neighbor of graph[node]) {
                // Going back to the parent is normal in an undirected graph.
                if (neighbor === parent) continue;

                // Another connection to a visited node means a cycle.
                if (visited.has(neighbor)) return false;

                visited.add(neighbor);
                stack.push([neighbor, node]);
            }
        }

        // Every node must be reachable from node 0.
        return visited.size === n;
    };
    return { validTree };
  },

  // #1462 Course Schedule IV · BFS from each course
  // Run BFS separately from every start and retain each reachability row; prerequisite/course edge orientation differs from Course Schedule input pairs.
  "1462": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var checkIfPrerequisite = function(numCourses, prerequisites, queries) {
        const graph = Array(numCourses)
            .fill(null)
            .map(() => []);

        for (const [prerequisite, course] of prerequisites) {
            graph[prerequisite].push(course);
        }

        const reachable = Array(numCourses)
            .fill(null)
            .map(() => Array(numCourses).fill(false));

        for (let start = 0; start < numCourses; start++) {
            const queue = [start];

            while (queue.length) {
                const course = queue.shift();

                for (const next of graph[course]) {
                    if (reachable[start][next]) continue;

                    reachable[start][next] = true;
                    queue.push(next);
                }
            }
        }

        return queries.map(([prerequisite, course]) => reachable[prerequisite][course]);
    };
    return { checkIfPrerequisite };
  },

  // #1462 Course Schedule IV · Floyd-Warshall (reachability table)
  // Floyd-Warshall transitive closure: allow intermediate vertices in the outermost loop and combine reach[i][k] with reach[k][j].
  "1462-floyd-warshall": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var checkIfPrerequisite = function(numCourses, prerequisites, queries) {
        // reach[i][j] = true means course i is a prerequisite (direct or indirect) of course j
        const reach = Array(numCourses)
            .fill(null)
            .map(() => new Array(numCourses).fill(false));

        // Seed direct prerequisites
        for (const [u, v] of prerequisites) {
            reach[u][v] = true;
        }

        // Floyd-Warshall transitive closure:
        // If course i can reach k, and k can reach j, then i can reach j
        for (let k = 0; k < numCourses; k++) {
            for (let i = 0; i < numCourses; i++) {
                for (let j = 0; j < numCourses; j++) {
                    if (reach[i][k] && reach[k][j]) {
                        reach[i][j] = true;
                    }
                }
            }
        }

        // Answer each query in O(1) by looking up the precomputed table
        return queries.map(([u, v]) => reach[u][v]);
    };
    return { checkIfPrerequisite };
  },

  // #323 Number of Connected Components In An Undirected Graph · BFS (queue)
  // Count one BFS start per unvisited component, including isolated vertices.
  "323": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var countComponents = function(n, edges) {
        const graph = Array(n)
            .fill(null)
            .map(() => []);

        for (const [a, b] of edges) {
            graph[a].push(b);
            graph[b].push(a);
        }

        const visited = new Set();
        let componentCount = 0;

        for (let start = 0; start < n; start++) {
            if (visited.has(start)) continue;

            componentCount++;
            visited.add(start);
            const queue = [start];

            while (queue.length) {
                const node = queue.shift();

                for (const neighbor of graph[node]) {
                    if (visited.has(neighbor)) continue;

                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }

        return componentCount;
    };
    return { countComponents };
  },

  // #323 Number of Connected Components In An Undirected Graph · Union-find with path compression
  // Decrement component count only when different representatives merge; compress parent paths.
  "323-union-find": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var countComponents = function(n, edges) {
        // Initialize Union-Find: each node is its own root
        const parent = Array(n)
            .fill(null)
            .map((_, i) => i);

        // Find root with path compression (flattens tree for speed)
        const find = (x) => {
            while (parent[x] !== x) {
                parent[x] = parent[parent[x]]; // path compression: skip to grandparent
                x = parent[x];
            }
            return x;
        };

        // Start with n separate components
        let componentCount = n;

        for (const [u, v] of edges) {
            const rootU = find(u);
            const rootV = find(v);

            // Only merge if they belong to different components
            if (rootU !== rootV) {
                parent[rootU] = rootV;
                componentCount--;
            }
        }

        return componentCount;
    };
    return { countComponents };
  },

  // #684 Redundant Connection · BFS (build graph first)
  // Build the full graph, try edges in reverse input order, skip the candidate direct move, and test whether another route still connects its endpoints.
  "684": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findRedundantConnection = function(edges) {
        const graph = Array(edges.length + 1)
            .fill(null)
            .map(() => []);

        for (const [a, b] of edges) {
            graph[a].push(b);
            graph[b].push(a);
        }

        for (let i = edges.length - 1; i >= 0; i--) {
            const [a, b] = edges[i];
            const queue = [a];
            const visited = new Set([a]);

            while (queue.length) {
                const node = queue.shift();

                if (node === b) return [a, b];

                for (const neighbor of graph[node]) {
                    // Skip the direct connection being tested.
                    if (node === a && neighbor === b) continue;

                    if (visited.has(neighbor)) continue;

                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }

        return [];
    };
    return { findRedundantConnection };
  },

  // #684 Redundant Connection · Union-find with path compression
  // Process edges in input order; the first failed union identifies the redundant edge for the given tree-plus-one-edge input.
  "684-union-find": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findRedundantConnection = function(edges) {
        const n = edges.length;

        // 1-indexed nodes: parent[i] = i means i is its own root
        const parent = Array(n + 1)
            .fill(null)
            .map((_, i) => i);
        const rank = new Array(n + 1).fill(0);

        // Follow parent pointers up to the root, compressing the path
        function find(x) {
            while (parent[x] !== x) {
                // Skip one level to flatten the tree over time
                parent[x] = parent[parent[x]];
                x = parent[x];
            }
            return x;
        }

        // Attempt to merge x and y's components
        // Returns false if they are already in the same component (cycle detected)
        function union(x, y) {
            const rootX = find(x);
            const rootY = find(y);

            if (rootX === rootY) {
                // Same root means adding this edge would create a cycle
                return false;
            }

            // Attach the shallower tree under the deeper tree
            if (rank[rootX] < rank[rootY]) {
                parent[rootX] = rootY;
            } else if (rank[rootX] > rank[rootY]) {
                parent[rootY] = rootX;
            } else {
                parent[rootY] = rootX;
                rank[rootX]++;
            }

            return true;
        }

        // Process edges in order; the first one that fails union is the redundant edge
        for (const [u, v] of edges) {
            const mergeSucceeded = union(u, v);
            if (!mergeSucceeded) {
                return [u, v];
            }
        }
    };
    return { findRedundantConnection };
  },

  // #721 Accounts Merge · BFS over email connections
  // Connect emails within each account through one representative, merge transitively by email identity, then sort each component's emails.
  "721": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var accountsMerge = function(accounts) {
        const graph = new Map();
        const emailToName = new Map();

        for (const account of accounts) {
            const name = account[0];
            const firstEmail = account[1];
            for (const email of account.slice(1)) {
                if (!graph.has(email)) graph.set(email, new Set());
                emailToName.set(email, name);
                if (email !== firstEmail) {
                    graph.get(firstEmail).add(email);
                    graph.get(email).add(firstEmail);
                }
            }
        }

        const visited = new Set();
        const result = [];
        for (const start of graph.keys()) {
            if (visited.has(start)) continue;

            visited.add(start);
            let frontier = [start];
            const emails = [];
            while (frontier.length) {
                const nextFrontier = [];
                for (const email of frontier) {
                    emails.push(email);
                    for (const neighbor of graph.get(email)) {
                        if (visited.has(neighbor)) continue;
                        visited.add(neighbor);
                        nextFrontier.push(neighbor);
                    }
                }
                frontier = nextFrontier;
            }

            emails.sort();
            result.push([emailToName.get(start), ...emails]);
        }
        return result;
    };
    return { accountsMerge };
  },

  // #721 Accounts Merge · Union-find with path compression
  // Union each account email with its representative; group by root and sort emails after all unions.
  "721-union-find": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var accountsMerge = function(accounts) {
        // Union-Find structures: each email maps to its parent email
        const parent = new Map();

        // Find the root of the set containing email x (with path compression)
        const find = (x) => {
            while (parent.get(x) !== x) {
                // Path compression: point x directly to its grandparent
                parent.set(x, parent.get(parent.get(x)));
                x = parent.get(x);
            }
            return x;
        };

        // Merge the sets containing x and y
        const union = (x, y) => {
            const rootX = find(x);
            const rootY = find(y);
            parent.set(rootX, rootY);
        };

        // Map each email to the account name it belongs to
        const emailToName = new Map();

        for (const account of accounts) {
            const name = account[0];
            const firstEmail = account[1];

            for (let i = 1; i < account.length; i++) {
                const email = account[i];

                // Initialize email in Union-Find if not seen before
                if (!parent.has(email)) {
                    parent.set(email, email);
                }

                emailToName.set(email, name);

                // Union every email in this account with the first email
                union(firstEmail, email);
            }
        }

        // Group emails by their root representative
        const groups = new Map();
        for (const email of parent.keys()) {
            const root = find(email);

            if (!groups.has(root)) groups.set(root, []);
            groups.get(root).push(email);
        }

        // Build the final output: [name, ...sortedEmails] for each group
        const result = [];
        for (const [root, emails] of groups) {
            const accountName = emailToName.get(root);
            result.push([accountName, ...emails.sort()]);
        }
        return result;
    };
    return { accountsMerge };
  },

  // #399 Evaluate Division · Primary
  // Add reciprocal weighted edges; path values multiply rather than add, and unknown variables remain invalid even for x/x.
  "399": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var calcEquation = function(equations, values, queries) {
        // Build a weighted directed graph:
        // a/b = k  →  edge a→b with weight k, and edge b→a with weight 1/k
        const graph = new Map();

        for (let i = 0; i < equations.length; i++) {
            const [a, b] = equations[i];
            const ratio = values[i];

            if (!graph.has(a)) graph.set(a, new Map());
            if (!graph.has(b)) graph.set(b, new Map());

            graph.get(a).set(b, ratio);
            graph.get(b).set(a, 1.0 / ratio);
        }

        // BFS from src to dst, multiplying edge weights along the path
        const bfs = (src, dst) => {
            // Unknown variable — cannot compute
            if (!graph.has(src) || !graph.has(dst)) return -1.0;

            // Same variable: x/x = 1
            if (src === dst) return 1.0;

            const visited = new Set([src]);
            const queue = [[src, 1.0]]; // [currentNode, cumulativeProduct]

            while (queue.length > 0) {
                const [currentNode, cumulativeProduct] = queue.shift();

                // Check each neighbor of the current node
                for (const [neighbor, edgeWeight] of graph.get(currentNode)) {
                    const newProduct = cumulativeProduct * edgeWeight;

                    if (neighbor === dst) {
                        return newProduct;
                    }

                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push([neighbor, newProduct]);
                    }
                }
            }

            // dst not reachable from src
            return -1.0;
        };

        return queries.map(([a, b]) => bfs(a, b));
    };
    return { calcEquation };
  },

  // #310 Minimum Height Trees · Primary
  // Remove all leaves in a layer together; a valid tree has one or two final centers, with a separate single-node case.
  "310": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findMinHeightTrees = function(n, edges) {
        if (n === 1) return [0];

        // Build adjacency list
        const adj = Array(n)
            .fill(null)
            .map(() => new Set());
        for (const [u, v] of edges) {
            adj[u].add(v);
            adj[v].add(u);
        }

        // Find all initial leaves (nodes with only one connection)
        let currentLeaves = [];
        for (let node = 0; node < n; node++) {
            if (adj[node].size === 1) {
                currentLeaves.push(node);
            }
        }

        // Peel leaves layer by layer until 1 or 2 nodes remain
        let nodesRemaining = n;
        while (nodesRemaining !== 1 && nodesRemaining !== 2) {
            nodesRemaining -= currentLeaves.length;

            const nextLeaves = [];
            for (const leaf of currentLeaves) {
                // Take the leaf's only neighbor from its Set.
                const [neighbor] = adj[leaf];

                // Remove the leaf from its neighbor's connections
                adj[neighbor].delete(leaf);

                // If neighbor becomes a leaf after removal, add it to next round
                if (adj[neighbor].size === 1) {
                    nextLeaves.push(neighbor);
                }
            }

            currentLeaves = nextLeaves;
        }

        // The remaining nodes are the centers (roots of min height trees)
        return currentLeaves;
    };
    return { findMinHeightTrees };
  },

  // #127 Word Ladder · Primary
  // Index wildcard patterns to find one-letter neighbors; BFS distance counts words, and endWord must be in the dictionary.
  "127": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var ladderLength = function(beginWord, endWord, wordList) {
        const wordSet = new Set(wordList);

        // If endWord is not in the dictionary, transformation is impossible
        if (!wordSet.has(endWord)) return 0;

        // Build a map from wildcard pattern -> list of words matching that pattern
        // e.g., "h*t" -> ["hit", "hot"]
        const neighbors = new Map();
        wordSet.add(beginWord);

        for (const word of wordSet) {
            for (let i = 0; i < word.length; i++) {
                const pattern = word.slice(0, i) + "*" + word.slice(i + 1);

                if (!neighbors.has(pattern)) {
                    neighbors.set(pattern, []);
                }
                neighbors.get(pattern).push(word);
            }
        }

        // BFS: each level represents one transformation step
        const visited = new Set([beginWord]);
        const queue = [beginWord];
        let level = 1;

        while (queue.length > 0) {
            const levelSize = queue.length;

            for (let q = 0; q < levelSize; q++) {
                const currentWord = queue.shift();

                // Reached the target — return the sequence length
                if (currentWord === endWord) return level;

                // Generate all wildcard patterns for this word
                for (let i = 0; i < currentWord.length; i++) {
                    const pattern = currentWord.slice(0, i) + "*" + currentWord.slice(i + 1);
                    const wordNeighbors = neighbors.get(pattern) || [];

                    for (const neighbor of wordNeighbors) {
                        if (!visited.has(neighbor)) {
                            visited.add(neighbor);
                            queue.push(neighbor);
                        }
                    }
                }
            }

            level++;
        }

        return 0;
    };
    return { ladderLength };
  },

  // #1631 Path with Minimum Effort · Primary
  // Relax with max(path effort, absolute edge difference); compare best-known efforts and finalize the target on minimum extraction.
  "1631": function(dependencies = {}) {
    const MinHeap = GraphMinHeap;
    const Node = RandomNode;
    const _Node = GraphNode;
    var minimumEffortPath = function(heights) {
        const m = heights.length;
        const n = heights[0].length;

        // effort[r][c] = minimum max-height-diff effort to reach (r,c) from (0,0)
        const effort = Array(m)
            .fill(null)
            .map(() => new Array(n).fill(Infinity));
        effort[0][0] = 0;

        const heap = new MinHeap();
        heap.push([0, 0, 0]);

        const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

        while (heap.size > 0) {
            const [e, r, c] = heap.pop();

            // Reached destination
            if (r === m - 1 && c === n - 1) return e;

            // Skip stale entries
            if (e > effort[r][c]) continue;

            for (const [dr, dc] of dirs) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
                    // New effort = max of current path effort and this edge's diff
                    const newEffort = Math.max(e, Math.abs(heights[nr][nc] - heights[r][c]));
                    if (newEffort < effort[nr][nc]) {
                        effort[nr][nc] = newEffort;
                        heap.push([newEffort, nr, nc]);
                    }
                }
            }
        }
        return 0;
    };
    return { minimumEffortPath };
  },

  // #743 Network Delay Time · Primary
  // Nonnegative edges allow first minimum extraction to finalize a node; skip equal/worse duplicate entries and return the maximum reached distance or -1.
  "743": function(dependencies = {}) {
    const MinHeap = GraphMinHeap;
    const Node = RandomNode;
    const _Node = GraphNode;
    var networkDelayTime = function(times, n, k) {
        // Build adjacency list: node → [[neighbor, travelTime], ...]
        const graph = new Map();
        for (const [u, v, w] of times) {
            if (!graph.has(u)) graph.set(u, []);
            graph.get(u).push([v, w]);
        }

        // dist maps node → shortest time to reach it from k
        const dist = new Map();

        const heap = new MinHeap();
        heap.push([0, k]);

        while (heap.size > 0) {
            // Always process the entry with the smallest time first
            const [currentTime, node] = heap.pop();

            // Skip entries with an equal or worse distance than the recorded distance.
            if (dist.has(node) && currentTime >= dist.get(node)) {
                continue;
            }

            // Record shortest time to reach this node
            dist.set(node, currentTime);

            // Explore all outgoing edges from this node
            const neighbors = graph.get(node) || [];
            for (const [neighbor, travelTime] of neighbors) {
                if (!dist.has(neighbor)) {
                    const arrivalTime = currentTime + travelTime;
                    heap.push([arrivalTime, neighbor]);
                }
            }
        }

        // If not all nodes were reached, return -1
        if (dist.size !== n) return -1;

        // The answer is when the last (slowest) node receives the signal
        return Math.max(...dist.values());
    };
    return { networkDelayTime };
  },

  // #332 Reconstruct Itinerary · Recursive Hierholzer's algorithm
  // Consume ticket edges rather than marking airports visited; use lexical destination order and reverse the postorder route, retaining duplicate tickets.
  "332": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findItinerary = function(tickets) {
        // Sort tickets in reverse lexical order by destination.
        // When we pop from the end, we always get the lexically smallest destination.
        tickets.sort((a, b) => a[1] < b[1] ? 1 : -1);

        // Build adjacency list: airport → [destinations in reverse lex order]
        const graph = new Map();
        for (const [src, dst] of tickets) {
            if (!graph.has(src)) graph.set(src, []);
            graph.get(src).push(dst);
        }

        // Post-order DFS: add airport to route only after all its outgoing flights are used
        const route = [];

        const dfs = (airport) => {
            const destinations = graph.get(airport) || [];

            // Greedily take the next (smallest) available destination
            while (destinations.length > 0) {
                const nextAirport = destinations.pop();
                dfs(nextAirport);
            }

            // All outgoing flights from this airport are used — append in post-order
            route.push(airport);
        };

        dfs("JFK");

        // Post-order gives us reverse order; reverse to get the correct itinerary
        return route.reverse();
    };
    return { findItinerary };
  },

  // #332 Reconstruct Itinerary · Iterative Hierholzer's algorithm (explicit stack)
  // Explicit path stack consumes tickets; append an airport only when its outgoing tickets are exhausted, then reverse.
  "332-iterative": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findItinerary = function(tickets) {
        const sortedTickets = [...tickets].sort((a, b) => a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0);
        const graph = new Map();
        for (const [src, dst] of sortedTickets) {
            if (!graph.has(src)) graph.set(src, []);
            graph.get(src).push(dst);
        }

        const stack = ["JFK"];
        const route = [];
        while (stack.length) {
            const airport = stack[stack.length - 1];
            const destinations = graph.get(airport) || [];
            if (destinations.length) {
                const nextAirport = destinations.pop();
                stack.push(nextAirport);
            } else {
                const finishedAirport = stack.pop();
                route.push(finishedAirport);
            }
        }
        return route.reverse();
    };
    return { findItinerary };
  },

  // #1584 Min Cost to Connect All Points · Kruskal with BFS connectivity
  // Generate Manhattan-weighted edges and apply Kruskal's cost order; primary uses BFS for cycle checks, not BFS as a minimum-cost algorithm.
  "1584": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var minCostConnectPoints = function(points) {
        const n = points.length;
        const graph = Array(n)
            .fill(null)
            .map(() => []);

        const connected = (graph, start, target) => {
            const visited = new Set([start]);
            let frontier = [start];

            while (frontier.length) {
                const nextFrontier = [];
                for (const node of frontier) {
                    if (node === target) return true;

                    for (const neighbor of graph[node]) {
                        if (visited.has(neighbor)) continue;
                        visited.add(neighbor);
                        nextFrontier.push(neighbor);
                    }
                }
                frontier = nextFrontier;
            }
            return false;
        };

        const edges = [];
        for (let a = 0; a < n; a++) {
            for (let b = a + 1; b < n; b++) {
                const distance = Math.abs(points[a][0] - points[b][0]) +
                                 Math.abs(points[a][1] - points[b][1]);
                edges.push([distance, a, b]);
            }
        }
        edges.sort((a, b) => a[0] - b[0]);

        let totalCost = 0;
        let edgesUsed = 0;
        for (const [distance, a, b] of edges) {
            if (connected(graph, a, b)) continue;
            graph[a].push(b);
            graph[b].push(a);
            totalCost += distance;
            edgesUsed++;
            if (edgesUsed === n - 1) break;
        }
        return totalCost;
    };
    return { minCostConnectPoints };
  },

  // #1584 Min Cost to Connect All Points · Kruskal with union-find and path compression
  // Keep Kruskal ordering and replace repeated BFS connectivity checks with disjoint sets.
  "1584-union-find": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var minCostConnectPoints = function(points) {
        const n = points.length;

        // Union-Find setup: each point starts as its own component
        const parent = Array(n)
            .fill(null)
            .map((_, i) => i);
        const rank = new Array(n).fill(0);

        function find(x) {
            while (parent[x] !== x) {
                // Path compression: skip one generation up
                parent[x] = parent[parent[x]];
                x = parent[x];
            }
            return x;
        }

        function union(x, y) {
            const rootX = find(x);
            const rootY = find(y);

            if (rootX === rootY) {
                // Already connected — adding this edge would create a cycle
                return false;
            }

            // Attach smaller tree under larger tree by rank
            if (rank[rootX] < rank[rootY]) {
                parent[rootX] = rootY;
            } else if (rank[rootX] > rank[rootY]) {
                parent[rootY] = rootX;
            } else {
                parent[rootY] = rootX;
                rank[rootX]++;
            }

            return true;
        }

        // Generate all pairs and compute their Manhattan distances
        const edges = [];
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const xDiff = Math.abs(points[i][0] - points[j][0]);
                const yDiff = Math.abs(points[i][1] - points[j][1]);
                const distance = xDiff + yDiff;
                edges.push([distance, i, j]);
            }
        }

        // Sort edges by distance ascending (Kruskal's greedy order)
        edges.sort((a, b) => a[0] - b[0]);

        // Greedily add the cheapest edges that don't form cycles
        let totalCost = 0;
        let edgesUsed = 0;

        for (const [distance, u, v] of edges) {
            const merged = union(u, v);

            if (merged) {
                totalCost += distance;
                edgesUsed++;

                // A spanning tree for n nodes needs exactly n-1 edges
                if (edgesUsed === n - 1) {
                    break;
                }
            }
        }

        return totalCost;
    };
    return { minCostConnectPoints };
  },

  // #778 Swim In Rising Water · Primary
  // Cost is the maximum cell elevation on the path; this specialized vertex-cost model marks on insertion, unlike a general Dijkstra relaxation template.
  "778": function(dependencies = {}) {
    const MinHeap = GraphMinHeap;
    const Node = RandomNode;
    const _Node = GraphNode;
    var swimInWater = function(grid) {
        const n = grid.length;

        // Track visited cells to avoid reprocessing
        const visited = Array(n)
            .fill(null)
            .map(() => new Array(n).fill(false));

        const heap = new MinHeap();
        heap.push([grid[0][0], 0, 0]);
        visited[0][0] = true;

        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        while (heap.size > 0) {
            const [timeRequired, row, col] = heap.pop();

            // Reached the bottom-right corner
            if (row === n - 1 && col === n - 1) {
                return timeRequired;
            }

            // Explore all 4 neighbors
            for (const [deltaRow, deltaCol] of directions) {
                const newRow = row + deltaRow;
                const newCol = col + deltaCol;

                const inBounds = newRow >= 0 && newRow < n && newCol >= 0 && newCol < n;

                if (inBounds && !visited[newRow][newCol]) {
                    visited[newRow][newCol] = true;

                    // Time to reach neighbor = max of current time and neighbor's elevation
                    const timeToReachNeighbor = Math.max(timeRequired, grid[newRow][newCol]);
                    heap.push([timeToReachNeighbor, newRow, newCol]);
                }
            }
        }

        return -1;
    };
    return { swimInWater };
  },

  // #269 Alien Dictionary · Primary
  // Infer only the first differing-character edge, deduplicate edges, include isolated characters, reject invalid prefixes, and detect cycles.
  "269": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var alienOrder = function(words) {
        // Initialize adjacency list and in-degree map for every character seen
        const adj = new Map();
        const inDeg = new Map();
        for (const word of words) {
            for (const char of word) {
                if (!inDeg.has(char)) inDeg.set(char, 0);
                if (!adj.has(char)) adj.set(char, new Set());
            }
        }

        // Compare adjacent words to extract ordering rules
        for (let i = 0; i < words.length - 1; i++) {
            const word1 = words[i];
            const word2 = words[i + 1];
            const compareLength = Math.min(word1.length, word2.length);

            // Invalid: longer word is prefix of shorter next word (e.g. "abc" before "ab")
            const word1IsLongerPrefix = word1.length > word2.length &&
                word1.substring(0, compareLength) === word2.substring(0, compareLength);
            if (word1IsLongerPrefix) return "";

            // Find first differing character — this gives an ordering constraint
            for (let j = 0; j < compareLength; j++) {
                if (word1[j] !== word2[j]) {
                    const from = word1[j];
                    const to = word2[j];
                    // Avoid duplicate edges
                    if (!adj.get(from).has(to)) {
                        adj.get(from).add(to);
                        inDeg.set(to, inDeg.get(to) + 1);
                    }
                    break; // Only the first differing position matters
                }
            }
        }

        // Topological sort (Kahn's BFS): start from zero in-degree characters
        const queue = [];
        for (const [char, degree] of inDeg) {
            if (degree === 0) queue.push(char);
        }

        const result = [];
        while (queue.length) {
            const char = queue.shift();
            result.push(char);

            for (const neighbor of adj.get(char)) {
                const newDegree = inDeg.get(neighbor) - 1;
                inDeg.set(neighbor, newDegree);
                if (newDegree === 0) queue.push(neighbor);
            }
        }

        // If result has all characters, no cycle exists
        return result.length === inDeg.size ? result.join('') : '';
    };
    return { alienOrder };
  },

  // #787 Cheapest Flights Within K Stops · Primary
  // k stops allow k+1 edges; relax from the previous prices array into a copy so one round cannot chain multiple new edges.
  "787": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findCheapestPrice = function(n, flights, src, dst, k) {
        const INF = Infinity;

        // prices[i] = cheapest cost to reach city i from src
        // Initialize src to 0, all others to infinity (unreachable)
        let prices = new Array(n).fill(INF);
        prices[src] = 0;

        // Run exactly k+1 rounds: k stops = at most k+1 flights used
        for (let round = 0; round < k + 1; round++) {
            // Work from a snapshot of last round's prices
            // This prevents chaining updates within a single round
            const temp = [...prices];

            for (const [from, to, cost] of flights) {
                // Can only use this flight if we can reach 'from'
                if (prices[from] !== INF) {
                    const newCost = prices[from] + cost;

                    // Update temp (not prices) to stay within the stop limit
                    if (newCost < temp[to]) {
                        temp[to] = newCost;
                    }
                }
            }

            // Move to next round
            prices = temp;
        }

        return prices[dst] !== INF ? prices[dst] : -1;
    };
    return { findCheapestPrice };
  },

  // #1489 Find Critical and Pseudo Critical Edges in Minimum Spanning Tree · Kruskal with BFS connectivity
  // Compare baseline MST cost with edge exclusion and forced inclusion; disconnection means infinite cost and answers use original indices.
  "1489": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findCriticalAndPseudoCriticalEdges = function(n, edges) {
        const indexedEdges = edges.map(([a, b, cost], index) => [cost, a, b, index]);
        indexedEdges.sort((a, b) => a[0] - b[0]);

        const connected = (graph, start, target) => {
            const visited = new Set([start]);
            let frontier = [start];

            while (frontier.length) {
                const nextFrontier = [];
                for (const node of frontier) {
                    if (node === target) return true;

                    for (const neighbor of graph[node]) {
                        if (visited.has(neighbor)) continue;
                        visited.add(neighbor);
                        nextFrontier.push(neighbor);
                    }
                }
                frontier = nextFrontier;
            }
            return false;
        };

        const mstWeight = (include = null, exclude = null) => {
            const graph = Array(n)
                .fill(null)
                .map(() => []);
            let weight = 0;
            let count = 0;

            if (include !== null) {
                const [cost, a, b] = include;
                graph[a].push(b);
                graph[b].push(a);
                weight += cost;
                count++;
            }

            for (const [cost, a, b, index] of indexedEdges) {
                if (index === exclude) continue;
                if (connected(graph, a, b)) continue;
                graph[a].push(b);
                graph[b].push(a);
                weight += cost;
                count++;
            }
            return count === n - 1 ? weight : Infinity;
        };

        const base = mstWeight();
        const critical = [];
        const pseudo = [];
        for (const edge of indexedEdges) {
            const index = edge[3];
            if (mstWeight(null, index) > base) {
                critical.push(index);
            } else if (mstWeight(edge, null) === base) {
                pseudo.push(index);
            }
        }
        return [critical, pseudo];
    };
    return { findCriticalAndPseudoCriticalEdges };
  },

  // #1489 Find Critical and Pseudo Critical Edges in Minimum Spanning Tree · Kruskal with union-find and path compression
  // Retain exclusion/forced-inclusion MST recomputation while using union-find to test each candidate connection.
  "1489-union-find": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var findCriticalAndPseudoCriticalEdges = function(n, edges) {
        // Attach original index to each edge, then sort by weight for Kruskal's
        const indexedEdges = edges.map(([u, v, w], i) => [w, u, v, i]);
        indexedEdges.sort((a, b) => a[0] - b[0]);

        // Union-Find with path compression (no union by rank for simplicity)
        const find = (parent, x) => {
            while (parent[x] !== x) {
                parent[x] = parent[parent[x]]; // path halving
                x = parent[x];
            }
            return x;
        };

        // Compute MST weight using Kruskal's; optionally force-include or exclude one edge
        const mstWeight = (n, edges, include, exclude) => {
            const parent = Array(n)
                .fill(null)
                .map((_, i) => i);
            let weight = 0;
            let count  = 0; // edges added to MST

            // Force-include this edge first (for pseudo-critical testing)
            if (include !== null) {
                const [w, u, v] = include;
                const pu = find(parent, u);
                const pv = find(parent, v);
                parent[pu] = pv;
                weight += w;
                count++;
            }

            for (const [w, u, v, i] of edges) {
                if (exclude !== null && i === exclude) continue; // skip excluded edge

                const pu = find(parent, u);
                const pv = find(parent, v);
                if (pu !== pv) {
                    parent[pu] = pv;
                    weight += w;
                    count++;
                }
            }

            // If graph is not connected (not n-1 edges added), return infinity
            return count < n - 1 ? Infinity : weight;
        };

        const base = mstWeight(n, indexedEdges, null, null);
        const critical = [];
        const pseudo   = [];

        for (const [w, u, v, i] of indexedEdges) {
            // Critical: removing this edge increases MST weight (or disconnects)
            if (mstWeight(n, indexedEdges, null, i) > base) {
                critical.push(i);
            }
            // Pseudo-critical: forcing it in still produces an optimal MST
            else if (mstWeight(n, indexedEdges, [w, u, v], null) === base) {
                pseudo.push(i);
            }
        }
        return [critical, pseudo];
    };
    return { findCriticalAndPseudoCriticalEdges };
  },

  // #2392 Build a Matrix With Conditions · Primary
  // Topologically order row and column constraints independently; either cycle fails the result, otherwise combine both positions for every value.
  "2392": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var buildMatrix = function(k, rowConditions, colConditions) {
        function order(conditions) {
            const graph = Array(k + 1)
                .fill(null)
                .map(() => []);
            const indegree = new Array(k + 1).fill(0);
            for (const [before, after] of conditions) {
                graph[before].push(after);
                indegree[after]++;
            }
            const queue = [];
            for (let value = 1; value <= k; value++) {
                if (indegree[value] === 0) queue.push(value);
            }
            const result = [];
            for (let head = 0; head < queue.length; head++) {
                const value = queue[head];
                result.push(value);
                for (const neighbor of graph[value]) {
                    indegree[neighbor]--;
                    if (indegree[neighbor] === 0) queue.push(neighbor);
                }
            }
            return result;
        }
        const rows = order(rowConditions);
        const columns = order(colConditions);
        if (rows.length !== k || columns.length !== k) return [];
        const columnIndex = new Array(k + 1);
        for (let i = 0; i < k; i++) columnIndex[columns[i]] = i;
        const matrix = Array(k)
            .fill(null)
            .map(() => new Array(k).fill(0));
        for (let row = 0; row < k; row++) matrix[row][columnIndex[rows[row]]] = rows[row];
        return matrix;
    };
    return { buildMatrix };
  },

  // #2709 Greatest Common Divisor Traversal · BFS over shared-prime connections
  // Factor values and connect each prime's indices through one representative; duplicate values remain distinct indices and 1 connects to nothing.
  "2709": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var canTraverseAllPairs = function(nums) {
        const n = nums.length;
        const graph = Array(n)
            .fill(null)
            .map(() => new Set());
        const firstIndex = new Map();

        const connectFactor = (index, prime) => {
            if (!firstIndex.has(prime)) {
                firstIndex.set(prime, index);
                return;
            }
            const other = firstIndex.get(prime);
            graph[index].add(other);
            graph[other].add(index);
        };

        for (let index = 0; index < n; index++) {
            let remaining = nums[index];
            for (let divisor = 2; divisor * divisor <= remaining; divisor++) {
                if (remaining % divisor === 0) {
                    connectFactor(index, divisor);
                    while (remaining % divisor === 0) remaining /= divisor;
                }
            }
            if (remaining > 1) connectFactor(index, remaining);
        }

        const visited = new Set([0]);
        let frontier = [0];
        while (frontier.length) {
            const nextFrontier = [];
            for (const node of frontier) {
                for (const neighbor of graph[node]) {
                    if (visited.has(neighbor)) continue;
                    visited.add(neighbor);
                    nextFrontier.push(neighbor);
                }
            }
            frontier = nextFrontier;
        }
        return visited.size === n;
    };
    return { canTraverseAllPairs };
  },

  // #2709 Greatest Common Divisor Traversal · Union-find with path compression
  // Union indices sharing prime factors; handle a single item and any isolated value 1 before checking representatives.
  "2709-union-find": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var canTraverseAllPairs = function(nums) {
        const n = nums.length;

        // Edge cases
        if (n === 1) return true;             // single element, trivially connected
        if (nums.includes(1)) return false;   // 1 has no common prime with anyone (gcd=1 always)

        // Union-Find
        const parent = Array(n)
            .fill(null)
            .map((_, i) => i);

        function find(x) {
            while (parent[x] !== x) {
                parent[x] = parent[parent[x]]; // path halving
                x = parent[x];
            }
            return x;
        }

        function union(a, b) {
            a = find(a);
            b = find(b);
            if (a !== b) parent[a] = b;
        }

        // primeToIdx: prime factor -> index of first element with this factor
        const primeToIdx = new Map();

        for (let i = 0; i < n; i++) {
            let num = nums[i];
            let d = 2;

            // Factorize num into prime factors
            while (d * d <= num) {
                if (num % d === 0) {
                    if (primeToIdx.has(d)) {
                        // Another element already has this prime factor — connect them
                        union(i, primeToIdx.get(d));
                    } else {
                        // First element with this prime factor
                        primeToIdx.set(d, i);
                    }
                    // Divide out all occurrences of d
                    while (num % d === 0) {
                        num = Math.floor(num / d);
                    }
                }
                d++;
            }

            // If num > 1, it's a prime factor greater than sqrt(original num)
            if (num > 1) {
                if (primeToIdx.has(num)) {
                    union(i, primeToIdx.get(num));
                } else {
                    primeToIdx.set(num, i);
                }
            }
        }

        // Check if all indices share the same root
        const root = find(0);
        for (let i = 1; i < n; i++) {
            if (find(i) !== root) return false;
        }
        return true;
    };
    return { canTraverseAllPairs };
  },

  // #57 Insert Interval · Primary
  // Input is already sorted and disjoint; preserve the before region, merge overlaps, then append the after region without sorting.
  "57": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var insert = function(intervals, newInterval) {
        const result = [];

        for (let i = 0; i < intervals.length; i++) {
            const [start, end] = intervals[i];

            if (end < newInterval[0]) {
                // This interval ends before the new interval starts — no overlap, keep it
                result.push([start, end]);

            } else if (start > newInterval[1]) {
                // This interval starts after the new interval ends — no overlap
                // The new interval is now fully placed; add it, then append all remaining intervals
                result.push(newInterval);
                return result.concat(intervals.slice(i));

            } else {
                // Overlap: merge by expanding the new interval to cover both
                newInterval[0] = Math.min(newInterval[0], start);
                newInterval[1] = Math.max(newInterval[1], end);
            }
        }

        // The new interval extends to or past the last interval
        result.push(newInterval);
        return result;
    };
    return { insert };
  },

  // #56 Merge Intervals · Primary
  // Sort by start and extend the last end by max on overlap; shared endpoints are merged.
  "56": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var merge = function(intervals) {
        // Sort by start time so overlapping intervals are adjacent
        intervals.sort((a, b) => a[0] - b[0]);

        // Start with the first interval in the output list
        const merged = [intervals[0]];

        for (let i = 1; i < intervals.length; i++) {
            const [start, end] = intervals[i];

            // The last interval in merged is the one we may extend
            const lastMerged = merged[merged.length - 1];
            const lastEnd = lastMerged[1];

            if (start <= lastEnd) {
                // Overlap: extend the end of the last merged interval if needed
                lastMerged[1] = Math.max(lastEnd, end);
            } else {
                // No overlap: add this interval as a new entry
                merged.push([start, end]);
            }
        }

        return merged;
    };
    return { merge };
  },

  // #435 Non Overlapping Intervals · Primary
  // Sort by start; on strict overlap increment removals and keep the smaller end; touching endpoints are allowed.
  "435": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var eraseOverlapIntervals = function(intervals) {
        intervals.sort((a, b) => a[0] - b[0]);

        let removed = 0;
        let previousEnd = intervals[0][1];

        for (let i = 1; i < intervals.length; i++) {
            const [start, end] = intervals[i];

            if (start < previousEnd) {
                // They overlap: remove the interval that ends later.
                removed++;
                previousEnd = Math.min(previousEnd, end);
            } else {
                // No overlap: keep this interval.
                previousEnd = end;
            }
        }

        return removed;
    };
    return { eraseOverlapIntervals };
  },

  // #252 Meeting Rooms · Primary
  // After sorting by start, only consecutive meetings need comparison; equality at an endpoint is allowed.
  "252": function(dependencies = {}) {
    const Node = RandomNode;
    const _Node = GraphNode;
    var canAttendMeetings = function(intervals) {
        // Sort meetings by start time so overlaps appear as adjacent pairs
        intervals.sort((a, b) => a[0] - b[0]);

        // Check each consecutive pair for overlap
        for (let i = 1; i < intervals.length; i++) {
            const currentStart = intervals[i][0];
            const previousEnd = intervals[i - 1][1];

            // If this meeting starts before the previous one ends, there is a conflict
            if (currentStart < previousEnd) {
                return false;
            }
        }

        return true;
    };
    return { canAttendMeetings };
  },

  // #253 Meeting Rooms II · Primary
  // Store one end time per allocated room; reuse the earliest room if it has ended, otherwise grow the allocation count.
  "253": function(dependencies = {}) {
    const MinHeap = BinaryHeap;
    const Node = RandomNode;
    const _Node = GraphNode;
    var minMeetingRooms = function(intervals) {
        intervals.sort((left, right) => left[0] - right[0]);
        const roomEndTimes = new MinHeap();
        for (const [start, end] of intervals) {
            if (!roomEndTimes.isEmpty() && roomEndTimes.front() <= start) {
                roomEndTimes.dequeue();
            }
            roomEndTimes.enqueue(end);
        }
        return roomEndTimes.size();
    };
    return { minMeetingRooms };
  },

  // #2402 Meeting Rooms III · Primary
  // Separate available room IDs from busy end times; release all finished rooms, preserve duration when delayed, and tie-break by smallest room ID.
  "2402": function(dependencies = {}) {
    const MinHeap = BinaryHeap;
    const Node = RandomNode;
    const _Node = GraphNode;
    var mostBooked = function(n, meetings) {
        // Sort meetings by start time
        meetings.sort((a, b) => a[0] - b[0]);

        // available: min-heap of free room numbers (sorted by room number)
        const available = new MinHeap();
        for (let i = 0; i < n; i++) available.enqueue(i);

        // busy: min-heap of [endTime, roomNumber] for currently occupied rooms
        // Primary sort: end time, secondary sort: room number (for ties)
        const busy = new MinHeap((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);

        // count[i] = number of meetings held in room i
        const count = new Array(n).fill(0);

        for (const [start, end] of meetings) {
            // Free up rooms whose meetings have ended before this meeting starts
            while (!busy.isEmpty() && busy.front()[0] <= start) {
                available.enqueue(busy.dequeue()[1]); // room number goes back to available
            }

            let room;
            if (!available.isEmpty()) {
                // Assign the lowest-numbered available room
                room = available.dequeue();
                busy.enqueue([end, room]);
            } else {
                // No room available: wait for the earliest-ending room
                const [earliestEnd, r] = busy.dequeue();
                room = r;
                // Meeting duration is preserved: it starts when room frees
                const newEnd = earliestEnd + (end - start);
                busy.enqueue([newEnd, room]);
            }

            count[room]++;
        }

        // Find the room with the most meetings (lowest index on tie)
        let maxCount = 0;
        let result = 0;
        for (let i = 0; i < n; i++) {
            if (count[i] > maxCount) {
                maxCount = count[i];
                result = i;
            }
        }

        return result;
    };
    return { mostBooked };
  },

  // #1851 Minimum Interval to Include Each Query · Primary
  // Sort queries with original indices, insert intervals with left<=query, discard right<query, and minimize inclusive length right-left+1.
  "1851": function(dependencies = {}) {
    const MinHeap = BinaryHeap;
    const Node = RandomNode;
    const _Node = GraphNode;
    var minInterval = function(intervals, queries) {
        // Sort intervals by left endpoint so we can add them as the query increases
        intervals.sort((a, b) => a[0] - b[0]);

        // Sort queries by value, keeping original indices for output reconstruction
        const sortedQ = queries.map((q, i) => [i, q]).sort((a, b) => a[1] - b[1]);

        // Min-heap: stores [intervalSize, rightEndpoint]
        // Sorted by size first (we want smallest covering interval)
        const pq = new MinHeap((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);

        const result = new Array(queries.length).fill(-1);
        let i = 0;

        for (const [qi, q] of sortedQ) {
            // Add all intervals whose left endpoint is <= query value
            while (i < intervals.length && intervals[i][0] <= q) {
                const [l, r] = intervals[i];
                const size = r - l + 1;
                pq.enqueue([size, r]);
                i++;
            }

            // Remove stale intervals whose right endpoint is < query (they don't contain q)
            while (!pq.isEmpty() && pq.front()[1] < q) {
                pq.dequeue();
            }

            // The top of the heap is the smallest valid interval
            if (!pq.isEmpty()) {
                result[qi] = pq.front()[0];
            }
        }

        return result;
    };
    return { minInterval };
  }
};

export function createOperation(key, dependencies = {}) {
  const factory = factories[String(key)];
  if (!Object.hasOwn(factories, String(key))) throw new Error('Unknown implementation: ' + key);
  return factory(dependencies);
}
export function operation(unitId, problemId, variant = 'primary', dependencies = {}) {
  const unit = studyUnits.find(item => item.id === unitId);
  if (!unit) throw new Error('Unknown study unit: ' + unitId);
  const key = problemId == null && variant === 'primary' ? unit.variantKeys[0]
    : variant === 'primary' ? String(problemId) : String(problemId ?? unit.problemIds[0]) + '-' + variant;
  if (!unit.variantKeys.includes(key)) throw new Error('Implementation ' + key + ' does not belong to ' + unitId);
  return createOperation(key, dependencies);
}
export const deliveryDayInput = {
  "ledger": [
    2,
    -1,
    2,
    1
  ],
  "targetTotal": 3,
  "sortedWeights": [
    1,
    2,
    3,
    4
  ],
  "pairTarget": 5,
  "events": "ADOBECODEBANC",
  "requiredEvents": "ABC",
  "costExpression": [
    "2",
    "1",
    "+",
    "3",
    "*"
  ],
  "shipmentWeights": [
    1,
    2,
    3,
    4,
    5
  ],
  "days": 3,
  "route": [
    1,
    2,
    3
  ],
  "management": [
    1,
    2,
    3,
    4
  ],
  "priorities": [
    4,
    1,
    7
  ],
  "rank": 2,
  "newPriority": 5,
  "boxSizes": [
    2,
    3
  ],
  "packedWeight": 7,
  "addresses": [
    "harbor",
    "hill"
  ],
  "addressPrefix": "ha",
  "jobCount": 4,
  "prerequisites": [
    [
      1,
      0
    ],
    [
      2,
      0
    ],
    [
      3,
      1
    ],
    [
      3,
      2
    ]
  ],
  "cityCount": 3,
  "startCity": 1,
  "roads": [
    [
      1,
      2,
      2
    ],
    [
      1,
      3,
      7
    ],
    [
      2,
      3,
      1
    ]
  ],
  "windows": [
    [
      1,
      3
    ],
    [
      2,
      4
    ],
    [
      6,
      8
    ]
  ]
};

// A delivery day exercises one operation from each chapter. Every other audited
// variation remains available through operation(unitId, problemId, variant).
export function runDeliveryDay(input = deliveryDayInput) {
  const day = structuredClone(input);
  const { subarraySum } = operation('A13', 560);
  const { twoSum } = operation('P03', 167);
  const { minWindow } = operation('W03', 76);
  const { evalRPN } = operation('S01', 150);
  const { shipWithinDays } = operation('B02', 1011);
  const { reverseList } = operation('L01', 206);
  const { levelOrder } = operation('T06', 102);
  const { KthLargest } = operation('H01', 703);
  const { combinationSum } = operation('R01', 39);
  const { Trie } = operation('TR01', 208);
  const { findOrder } = operation('G07', 210);
  const { networkDelayTime } = operation('D01', 743);
  const { merge } = operation('I01', 56);

  const priorities = new KthLargest(day.rank, day.priorities);
  const addressBook = new Trie();
  for (const address of day.addresses) addressBook.insert(address);

  return {
    matchingLedgerSegments: subarraySum(day.ledger, day.targetTotal),
    pairedWeightIndices: twoSum(day.sortedWeights, day.pairTarget),
    shortestCompleteEventSegment: minWindow(day.events, day.requiredEvents),
    deliveryCost: evalRPN(day.costExpression),
    truckCapacity: shipWithinDays(day.shipmentWeights, day.days),
    reversedRoute: listValues(reverseList(makeList(day.route))),
    managementLevels: levelOrder(makeTree(day.management)),
    secondHighestPriority: priorities.add(day.newPriority),
    boxPlans: combinationSum(day.boxSizes, day.packedWeight),
    addressPrefixExists: addressBook.startsWith(day.addressPrefix),
    jobOrder: findOrder(day.jobCount, day.prerequisites),
    alertArrivalTime: networkDelayTime(day.roads, day.cityCount, day.startCity),
    combinedWindows: merge(day.windows),
  };
}


// Importing this module never runs the example. Executing it directly does.
if (typeof process !== 'undefined' && process.versions?.node && process.argv[1]) {
  const { realpathSync } = await import('node:fs');
  const { pathToFileURL } = await import('node:url');
  let entryUrl;
  try { entryUrl = pathToFileURL(realpathSync(process.argv[1])).href; } catch {}
  if (entryUrl === import.meta.url) console.log(JSON.stringify(runDeliveryDay(), null, 2));
}

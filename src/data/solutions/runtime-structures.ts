import { Runtime, runtime as r, operations as ops, calculation as c } from './runtime-breakdown';

const n = 'n = input length.';
const binary = (variables: string, work: string, note: string) => r(variables, [['Initialize search bounds', 'O(1)'], [work, 'O(log n × 1)']], ['O(1) + O(log n)', 'O(log n)'], note);
const queueStack = (oneQueue: boolean) => ops('n = stack size before push.', [
  c('Constructor', [[oneQueue ? 'Create an empty queue' : 'Create two empty queues', 'O(1)']], ['O(1)'], 'Creating empty queues does not depend on the number of future elements.'),
  c('push', [['Enqueue the new value', 'O(1)'], [oneQueue ? 'Rotate the n previous values' : 'Move the n previous values to the helper queue', 'O(n × 2)'], [oneQueue ? 'Finish with the new value at the front' : 'Swap the queue references', 'O(1)']], ['O(1) + O(n) + O(1)', 'O(n + 1)'], 'Each previous value is dequeued and enqueued once. As requested, FIFO queue operations count as O(1).'),
  c('pop / top / empty', [['Read the front, remove it, or check queue length', 'O(1)']], ['O(1)'], 'These operations do not rotate or traverse the queue.'),
]);
const answerSearch = (item: string, predicate: string) => r(`n = ${item}; R = sum(input) − max(input) + 1 candidate answers.`, [
  ['Find the maximum and total', 'O(n) + O(n)'],
  [`Try O(log R) answers; ${predicate} scans up to n items each time`, 'O(log R × n)'],
], ['O(n + n log R)', 'O(n × (1 + log R))'], 'Every feasibility check starts a new input scan, so these costs multiply. The initial scans still cost O(n) when R = 1 and no search iterations are needed.');

export const structureRuntimes: Record<string, Runtime> = {
  682: r('n = operations; numerical tokens have bounded length.', [['Process operations with stack pushes and pops', 'O(n)'], ['Sum remaining scores', 'O(n)']], ['O(2n)', 'O(n)'], 'At most n scores remain. Each input operation reads or changes only a constant number of scores.'),
  20: r(n, [['Initialize the three bracket mappings', 'O(1)'], ['Read each bracket and push or pop', 'O(n)']], ['O(1 + n)', 'O(n)'], 'Each bracket is processed once; a mismatch can stop earlier.'),
  225: queueStack(false),
  '225-one-queue': queueStack(true),
  232: ops('n = elements waiting in inputStack; q = total calls.', [
    c('Constructor / push / empty', [['Create empty stacks, append one value, or inspect two lengths', 'O(1)']], ['O(1)'], 'Stack append uses amortized O(1) time.'),
    c('pop / peek (one call, worst case)', [['Transfer up to n waiting elements', 'O(2n)'], ['Pop or read outputStack', 'O(1)']], ['O(n) + O(1)', 'O(n + 1)'], 'A transfer happens only when outputStack is empty.'),
    c('pop / peek (amortized)', [['Charge each element for its one-time transfer', 'O(1)'], ['Read or remove the oldest value', 'O(1)']], ['O(2)', 'O(1)'], 'Each element is pushed once, transferred once, and popped at most once. Over q calls, total work is O(q), or O(q)/q = O(1) per call on average.'),
  ]),
  155: ops('Each operation touches a fixed number of stack entries.', [
    c('Constructor', [['Create the value and minimum stacks', 'O(2)']], ['O(1)'], 'Both start empty.'),
    c('push / pop', [['Update the value stack', 'O(1)'], ['Update the minimum stack', 'O(1)']], ['O(2)', 'O(1)'], 'push computes one running minimum; it does not scan earlier values. Appends use amortized O(1).'),
    c('top / getMin', [['Read the last entry of the appropriate stack', 'O(1)']], ['O(1)'], 'The minimum for every stack depth has already been saved.'),
  ]),
  150: r('n = tokens; numeric tokens and arithmetic use the problem’s bounded integer sizes.', [['Initialize the operator lookup', 'O(1)'], ['Process n tokens with at most two pops and one push each', 'O(n × 1)']], ['O(1 + n)', 'O(n)'], 'An operator consumes two operands immediately; it does not rescan earlier tokens.'),
  735: r(n, [['Read and potentially push each asteroid', 'O(n)'], ['Resolve collisions across all inner loops', 'O(n)']], ['O(2n)', 'O(n)'], 'Every collision destroys at least one asteroid. There can be at most n destructions in the entire run.'),
  739: r(n, [['Initialize result', 'O(n)'], ['Push every day’s index', 'O(n)'], ['Pop and resolve each earlier day at most once', 'O(n)']], ['O(3n)', 'O(n)'], 'A day removed by a warmer day never returns to the stack, so all inner-loop work is linear.'),
  901: ops('p = entries popped by one next call; q = calls made so far.', [
    c('Constructor', [['Create the empty stack', 'O(1)']], ['O(1)'], 'No earlier prices are processed.'),
    c('next (one call)', [['Pop p entries and add their spans', 'O(p)'], ['Push the new price/span pair', 'O(1)']], ['O(p + 1)'], 'One call can pop all earlier entries, giving O(q) worst-case time.'),
    c('next (amortized)', [['Charge one push per price', 'O(1)'], ['Charge at most one eventual pop per price', 'O(1)']], ['O(2)', 'O(1)'], 'Across q calls there are q pushes and at most q pops: O(q) total, hence O(1) amortized per call.'),
  ]),
  853: r(n, [['Pair positions and speeds', 'O(n)'], ['Sort cars by position', 'O(n log n)'], ['Compute arrival times and count fleets', 'O(n)']], ['O(n + n log n + n)', 'O(n log n)'], 'Each car is compared with the current fleet once. Sorting is the dominant phase.'),
  71: r('n = path characters.', [['Split the path into components', 'O(n)'], ['Process the components with a stack', 'O(n)'], ['Join the surviving names', 'O(n)']], ['O(3n)', 'O(n)'], 'The lengths of all components sum to at most n; directory names are not each length n.'),
  394: r('n = encoded input length; L = decoded output length.', [['Read input and manage the context stacks', 'O(n)'], ['Build intermediate strings with repetition and concatenation', 'O(n × L)']], ['O(n + n × L)', 'O(n × (L + 1))'], 'This is a conservative copying-cost bound: up to n string-building operations can each copy up to L characters. Nested expressions can rebuild the same characters, so output length alone does not describe all copying. Runtime string optimizations can reduce that work.'),
  895: ops('Hash-map access and stack append use expected/amortized constant time.', [
    c('Constructor', [['Create the empty maps and maximum-frequency counter', 'O(1)']], ['O(1)'], 'No values are visited.'),
    c('push', [['Update the value frequency and maximum', 'O(1)'], ['Append to the frequency’s stack', 'O(1)']], ['O(2)', 'O(1)'], 'The frequency directly identifies the destination stack.'),
    c('pop', [['Pop from the highest-frequency stack', 'O(1)'], ['Update the value frequency and maximum', 'O(1)']], ['O(2)', 'O(1)'], 'No search through other values or frequency levels is required.'),
  ]),
  84: r(n, [['Append and later remove the sentinel', 'O(1)'], ['Read and push each bar', 'O(n)'], ['Pop bars and compute their areas', 'O(n)']], ['O(1 + 2n)', 'O(n)'], 'Every bar enters the stack once and is popped at most once. All while-loop iterations together cost O(n).'),

  704: binary(n, 'Halve the range after each comparison', 'Each iteration reads one middle value and discards about half the remaining indices.'),
  35: binary(n, 'Halve the possible insertion positions', 'The function returns an index; it does not insert an element or shift the array.'),
  374: binary('n = maximum candidate number.', 'Make one guess and halve the candidate range', 'Assumes one guess API call takes O(1). There are O(log n) calls.'),
  69: r('x = input number.', [['Initialize bounds', 'O(1)'], ['Halve the range with constant work per iteration', 'O(log(x + 2))']], ['O(1 + log(x + 2))', 'O(log(x + 2))'], 'Adding 2 keeps the expression valid for x = 0 or 1. Arithmetic on the problem’s fixed-width integers is constant time.'),
  74: r('m = rows; n = columns.', [['Read dimensions and set virtual index bounds', 'O(1)'], ['Binary-search m × n virtual positions', 'O(log(m × n))']], ['O(1 + log(m × n))', 'O(log(m × n))'], 'Converting a middle index to row and column is O(1). The matrix is not copied or flattened.'),
  875: r('n = piles; M = largest pile.', [['Find M', 'O(n)'], ['Try O(log M) speeds and scan n piles each time', 'O(log M × n)']], ['O(n + n log M)', 'O(n × (1 + log M))'], 'Each trial recomputes totalHours over all piles. The initial maximum scan remains necessary when M = 1.'),
  1011: answerSearch('package weights', 'canShip'),
  153: binary(n, 'Compare the middle and right values and halve the range', 'Distinct values let the code discard half of the remaining range each time.'),
  33: binary(n, 'Identify the sorted half and discard one half', 'All endpoint comparisons within an iteration take constant time.'),
  81: r(n, [['Initialize search bounds', 'O(1)'], ['Compare boundaries and discard at least one index per iteration', 'O(n × 1)']], ['O(1 + n)', 'O(n)'], 'Duplicates can force lo to advance by only one. When each comparison halves the range it is O(log n), but the guaranteed worst-case bound is O(n).'),
  981: ops('t = timestamps stored for the requested key. Key hashing is treated as constant time.', [
    c('Constructor / set', [['Create or look up a key’s list', 'O(1)'], ['For set, append the new timestamp/value pair', 'O(1)']], ['O(2)', 'O(1)'], 'Timestamps arrive in increasing order, so insertion needs no sorting. Append is amortized O(1).'),
    c('get', [['Look up the key', 'O(1)'], ['Binary-search its timestamps', 'O(log(t + 1))']], ['O(1 + log(t + 1))'], 'Only this key’s history is searched. The saved value is returned directly, without copying its characters.'),
  ]),
  410: answerSearch('array values', 'canSplit'),
  4: r('m and n = array lengths; S = min(m, n).', [['Select the shorter array and set bounds', 'O(1)'], ['Binary-search its S + 1 partition positions', 'O(log(S + 1))'], ['Read at most four boundary values and calculate the median', 'O(1)']], ['O(1 + log(S + 1))'], 'Each partition determines the other array’s partition directly. No merge occurs; an empty shorter array is handled in constant time.'),
  1095: r(n, [['Find the peak', 'O(log n)'], ['Search the ascending side', 'O(log n)'], ['Search the descending side if necessary', 'O(log n)']], ['O(3 log n)', 'O(log n)'], 'These are three sequential binary searches. MountainArray length/get calls are assumed O(1).'),

  206: r('n = list nodes.', [['Initialize prev and current', 'O(1)'], ['Visit and reverse each next pointer', 'O(n)']], ['O(1 + n)', 'O(n)'], 'current advances to the next original node after each constant-time pointer update.'),
  21: r('m and n = list lengths.', [['Choose nodes from the two lists', 'O(m + n)'], ['Attach the unconsumed suffix', 'O(1)']], ['O(m + n + 1)', 'O(m + n)'], 'Each comparison consumes one node. Attaching the remaining list uses one pointer assignment, not another traversal.'),
  141: r('n = distinct nodes reachable from head.', [['Move pointers to the end or into a cycle', 'O(n)'], ['If cyclic, let fast catch slow', 'O(n)']], ['O(2n)', 'O(n)'], 'Within a cycle, fast gains one position per iteration and catches slow within one cycle length.'),
  143: r('n = list nodes.', [['Find the midpoint', 'O(n)'], ['Reverse the second half', 'O(n / 2)'], ['Weave the halves', 'O(n / 2)']], ['O(n + n/2 + n/2)', 'O(n)'], 'The three phases are sequential; each changes only a fixed number of pointers per visited node.'),
  19: r('L = list length; n = distance from the end, with 1 ≤ n ≤ L.', [['Advance fast by n + 1 links from the dummy', 'O(n + 1)'], ['Advance both pointers through the remaining links', 'O(L − n)'], ['Unlink the target', 'O(1)']], ['O(n + 1 + L − n + 1)', 'O(L)'], 'The two traversal segments add up to the list length, rather than multiplying.'),
  138: r('n = list nodes.', [['Create all copies and fill oldToNew', 'O(n)'], ['Assign copied next and random pointers', 'O(n)']], ['O(2n)', 'O(n)'], 'Each random pointer is resolved by a map lookup; it does not trigger a search through the list.'),
  2: r('m and n = input list lengths.', [['Add one pair of digits per position', 'O(max(m, n))'], ['Write a possible final carry node', 'O(1)']], ['O(max(m, n) + 1)', 'O(max(m, n))'], 'Digits are processed together in one loop. A new output node takes constant time to construct.'),
  287: r(n, [['Find a meeting point in the index cycle', 'O(n)'], ['Find the cycle entrance', 'O(n)']], ['O(2n)', 'O(n)'], 'Both phases follow pointers through at most O(n) distinct indices before meeting.'),
  92: r('n = list length; left and right = reversal endpoints.', [['Reach the node before left', 'O(left − 1)'], ['Move each node in the reversed interval', 'O(right − left)'], ['Create the dummy and return its next pointer', 'O(1)']], ['O(right)', 'O(n)'], 'Each move rewires a constant number of pointers. The suffix after right is never traversed.'),
  622: ops('k = queue capacity.', [
    c('Constructor', [['Reserve queue storage', 'O(k)'], ['Set head, count, and capacity', 'O(1)']], ['O(k + 1)', 'O(k)'], 'Python initializes k slots. O(k) is also a storage-allocation upper bound for the JavaScript array.'),
    c('enQueue / deQueue / Front / Rear / isEmpty / isFull', [['Check counters and calculate an index if needed', 'O(1)'], ['Read or update one slot and counters', 'O(1)']], ['O(2)', 'O(1)'], 'The circular index avoids shifting existing elements.'),
  ]),
  146: ops('n = cached entries; hash lookups use expected O(1) time.', [
    c('Constructor', [['Create an empty map and two sentinel nodes', 'O(1)']], ['O(1)'], 'Capacity is saved; no array of that size is filled.'),
    c('get', [['Look up the key', 'O(1)'], ['Move its node to the front', 'O(1)']], ['O(2)', 'O(1)'], 'The map supplies the node directly; a fixed number of links are updated.'),
    c('put', [['Find or create the node and move it to the front', 'O(1)'], ['Evict at most one tail node', 'O(1)']], ['O(2)', 'O(1)'], 'Eviction follows the tail pointer and does not scan n entries.'),
  ]),
  460: ops('Hash maps and ordered frequency buckets use expected O(1) lookup, insertion, removal, and oldest-entry access.', [
    c('Constructor', [['Create the empty maps and counters', 'O(1)']], ['O(1)'], 'The cache starts empty.'),
    c('get', [['Look up the value and frequency', 'O(1)'], ['Move the key between two frequency buckets', 'O(1)']], ['O(2)', 'O(1)'], 'minFreq is updated directly when the old minimum bucket becomes empty.'),
    c('put', [['Insert or update the key and its bucket', 'O(1)'], ['Evict at most one least-recent key in the minimum bucket', 'O(1)']], ['O(2)', 'O(1)'], 'The ordered bucket supplies the eviction candidate without a scan of all cached keys.'),
  ]),
  23: r('N = total nodes; k = input lists; H = nonempty lists, with H ≤ min(N, k).', [['Inspect all list heads', 'O(k)'], ['Push each node into a heap of at most H nodes', 'O(N × log(H + 1))'], ['Pop each node and link it into the answer', 'O(N × log(H + 1))']], ['O(k + 2N × log(H + 1))', 'O(k + N × log(H + 1))'], 'Only one pending node per nonempty list is in the heap. The O(k) scan remains even if every list is empty. This is commonly written O(N log k) when initialization is dominated.'),
  25: r('n = list nodes; k = group size.', [['Check group lengths across recursive calls', 'O(n)'], ['Reverse all complete groups', 'O((n / k) × k)'], ['Reconnect the groups', 'O(n / k)']], ['O(n) + O(n) + O(n / k)', 'O(n)'], 'Each node is checked once and reversed at most once. Calls handle disjoint groups, so recursion does not restart from the head.'),
};

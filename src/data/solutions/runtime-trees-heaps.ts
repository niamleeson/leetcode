import { Runtime, runtime as r, operations as ops, calculation as c, withPython } from './runtime-breakdown';

const tree = 'n = tree nodes; h = tree height.';
const visit = (work: string, note: string) => r(tree, [['Visit nodes and follow child links', 'O(n)'], [work, 'O(n × 1)']], ['O(n) + O(n)', 'O(n)'], note);
const kthAdd = c('add', [['Insert the new value', 'O(log(k + 1))'], ['Remove the smallest if size exceeds k', 'O(log(k + 1))'], ['Read the heap root', 'O(1)']], ['O(2 log(k + 1) + 1)', 'O(log(k + 1))'], 'The heap contains at most k + 1 values during an insertion. The +1 also covers k = 1.');
const twitterOther = c('Constructor / postTweet / follow / unfollow', [['Access or initialize the relevant maps', 'O(1)'], ['Append a tweet or update a follow set', 'O(1)']], ['O(2)', 'O(1)'], 'These operations use expected O(1) map/set operations and amortized O(1) append.');

export const treeHeapRuntimes: Record<string, Runtime> = {
  94: r(tree, [['Push nodes while descending left', 'O(n)'], ['Pop nodes and append their values', 'O(n)']], ['O(2n)', 'O(n)'], 'Every node is pushed once and popped once. The nested while loop does not restart a full tree traversal.'),
  144: r(tree, [['Push and pop every node', 'O(n)'], ['Append every visited value', 'O(n)']], ['O(2n)', 'O(n)'], 'Each child is added once; the traversal processes n nodes in total.'),
  145: r(tree, [['Traverse and collect node values', 'O(n)'], ['Reverse the collected values', 'O(n)']], ['O(2n)', 'O(n)'], 'JavaScript reverses in place; Python creates a reversed slice. Both add a linear pass.'),
  226: visit('Swap each node’s two child pointers', 'The two recursive calls work on disjoint subtrees. Every node is swapped once.'),
  104: visit('Combine the two child depths at each node', 'A depth result is returned once per subtree; the same subtree is not recomputed for every ancestor.'),
  543: visit('Compute height and update maxDiameter once per node', 'The helper returns heights while updating the diameter in the same traversal, avoiding a new height search at each node.'),
  110: visit('Compare child heights and return a height or −1', 'Each subtree’s height is computed at most once. An unbalanced result may stop recursion earlier.'),
  100: r('m and n = node counts of the two trees.', [['Compare corresponding non-null nodes', 'O(min(m, n))'], ['Check null child positions', 'O(min(m, n) + 1)']], ['O(2 × min(m, n) + 1)', 'O(min(m, n) + 1)'], 'The comparison stops along a branch as soon as one tree ends or values differ. Even two empty trees require a constant-time check.'),
  572: r('m = nodes in root; n = nodes in subRoot.', [['Try candidate subtree roots', 'O(m)'], ['Compare up to n nodes for each candidate', 'O(m × n)']], ['O(m + m × n)', 'O(m × n)'], 'This code can start a new equality check at every root node. subRoot is nonempty, so the comparisons cover the O(m) candidate scan.'),
  235: r(tree, [['Initialize current', 'O(1)'], ['Follow one root-to-descendant path', 'O(h)']], ['O(h + 1)'], 'Only one child is chosen per step. A balanced tree has h = O(log n); a skewed tree can have h = O(n).'),
  701: r(tree, [['Follow the insertion path', 'O(h)'], ['Create and attach one new node', 'O(1)']], ['O(h + 1)'], 'The recursive calls follow one branch. In an unbalanced BST, h can equal n.'),
  450: r(tree, [['Search for the key', 'O(h)'], ['Find its inorder successor if necessary', 'O(h)'], ['Delete that successor and reconnect pointers', 'O(h)']], ['O(3h)', 'O(h)'], 'The successor search and deletion each follow a single path. There is no full traversal of the right subtree.'),
  102: r(tree, [['Enqueue and dequeue each node', 'O(n)'], ['Collect all values into levels', 'O(n)']], ['O(2n)', 'O(n)'], 'The level sizes sum to n. As requested, FIFO queue operations count as O(1).'),
  199: r(tree, [['Process all nodes with BFS', 'O(n)'], ['Record one value per level', 'O(h)']], ['O(n + h)', 'O(n)'], 'h ≤ n. Nodes from all levels total n, and FIFO operations are treated as O(1).'),
  427: r('n = grid side length; there are n² cells.', [['Create leaves for the individual cells', 'O(n²)'], ['Combine groups of four on all higher levels', 'O(n²/4 + n²/16 + … + 1)']], ['O(n²) + O(n²)', 'O(n²)'], 'This code builds children first and compares four child results. It does not rescan each square at every level. The higher-level work is a geometric series, not n² work on every level.'),
  1448: visit('Compare the node with maxSoFar and combine child counts', 'The path maximum is passed down as one value, so ancestors are not rescanned for each node.'),
  98: visit('Check and update the allowed bounds', 'A node checks two bounds in constant time. The code does not search its subtrees again for minima or maxima.'),
  230: r(tree + ' k = requested inorder position.', [['Push nodes encountered before the kth visit', 'O(h + k)'], ['Pop and count the first k nodes', 'O(k)']], ['O(h + 2k)', 'O(h + k)'], 'At the stopping point, at most h pushed nodes remain pending. Every other pushed node has been popped and counted among the k visits.'),
  105: r(tree, [['Build the inorder value-to-index map', 'O(n)'], ['Create each tree node with one map lookup', 'O(n)']], ['O(2n)', 'O(n)'], 'Subtrees are represented by index bounds. There are no repeated array slices or linear inorder searches.'),
  337: visit('Compute rob and skip values once per node', 'Returning both choices together prevents recomputing grandchildren for different robbery decisions.'),
  1325: visit('Reconnect children and test whether the node is now a target leaf', 'Postorder traversal handles newly exposed leaves on the way back up. It does not repeat whole-tree passes.'),
  124: visit('Calculate the through-node path and the returned one-sided gain', 'Each subtree returns its best usable gain once. The two recursive calls do not enumerate every possible path.'),
  297: ops('n = nodes; C = serialized characters. With bounded-size node values, C = O(n + 1).', [
    c('serialize', [['Visit n nodes and n + 1 null positions', 'O(2n + 1)'], ['Convert values and join tokens', 'O(C)']], ['O(n + C + 1)', 'O(n + 1)'], 'Null markers preserve tree shape. Bounded integer values make each value token constant length.'),
    c('deserialize', [['Split and parse the serialized tokens', 'O(C)'], ['Consume each token and create the nodes', 'O(n + 1)']], ['O(C + n + 1)', 'O(n + 1)'], 'The token index or iterator only moves forward; it never shifts or rescans the remaining tokens.'),
  ]),

  703: withPython(
    ops('n = initial values; k = retained heap size.', [
      c('Constructor', [['Create the empty heap', 'O(1)'], ['Call add for every initial value', 'O(n × log(k + 1))']], ['O(1 + n × log(k + 1))'], 'JavaScript inserts initial values one at a time into a heap capped at k + 1.'), kthAdd,
    ]),
    ops('n = initial values; k = retained heap size; d = max(0, n − k).', [
      c('Constructor', [['Heapify all initial values', 'O(n)'], ['Remove d excess values', 'O(d × log(n + 1))']], ['O(n + d × log(n + 1))'], 'Python first heapifies the full input, then shrinks it. When n ≤ k, construction is O(n); it does not call add n times.'), kthAdd,
    ])),
  1046: withPython(
    r('n = stones.', [['Insert the initial stones', 'O(n log n)'], ['Perform at most n − 1 smashes, each with up to three heap operations', 'O(n × 3 log n)']], ['O(n log n) + O(n log n)', 'O(n log n)'], 'Each smash reduces the number of stones by at least one.'),
    r('n = stones.', [['Negate the weights and heapify', 'O(n)'], ['Perform at most n − 1 smashes', 'O(n × 3 log n)']], ['O(n) + O(n log n)', 'O(n log n)'], 'Python builds the initial heap in linear time. Each later smash still costs O(log n).')),
  973: r('n = points; k = returned points, with k ≤ n.', [['Compute squared distances', 'O(n)'], ['Insert every point and discard excess entries', 'O(n × log(k + 1))'], ['Copy the retained coordinates', 'O(k)']], ['O(n + n × log(k + 1) + k)', 'O(n × log(k + 1))'], 'The heap has at most k + 1 entries. Computing a two-dimensional squared distance is constant time.'),
  215: ops('n = numbers; each partition scans the current candidate range.', [
    c('Expected time', [['Initialize bounds', 'O(1)'], ['Partition successively smaller ranges', 'O(n + n/2 + n/4 + …)']], ['O(1) + O(n)', 'O(n)'], 'Random pivots give a constant-factor reduction in expectation. The geometric series illustrates the expected total; individual partitions need not halve the range.'),
    c('Worst case', [['Repeatedly partition with badly placed pivots', 'O(n + (n − 1) + … + 1)']], ['O(n × (n + 1) / 2)', 'O(n²)'], 'Randomization makes this unlikely but does not remove the worst case. Three-way partitioning handles equal values together.'),
  ]),
  621: r('T = tasks; A = distinct task letters, at most 26. n in the code is the cooldown.', [['Count task frequencies', 'O(T)'], ['Find maximum frequency and its multiplicity', 'O(2A)'], ['Evaluate the scheduling formula', 'O(1)']], ['O(T + A)', 'O(T)'], 'The formula does not simulate idle time. A ≤ 26 is fixed, so even a large cooldown does not increase the loop count.'),
  355: withPython(
    ops('F = followed users including self; the feed contains at most 10 tweets.', [twitterOther,
      c('getNewsFeed', [['Collect the latest candidate from each followed user', 'O(F)'], ['Sort candidates before each of at most 10 selections', 'O(10 × F log(F + 1))'], ['Write up to 10 results', 'O(10)']], ['O(F + F log(F + 1) + 1)', 'O(F log(F + 1))'], 'This JavaScript version sorts its candidate array repeatedly. Ten is a fixed result limit, so those repeated sorts still have the same asymptotic bound.'),
    ]),
    ops('F = followed users including self; the feed contains at most 10 tweets.', [twitterOther,
      c('getNewsFeed', [['Inspect followed users', 'O(F)'], ['Insert their latest tweets into the heap', 'O(F × log(F + 1))'], ['Pop and replace candidates for up to 10 results', 'O(10 × log(F + 1))']], ['O(F + F log(F + 1) + 10 log(F + 1))', 'O(F log(F + 1))'], 'Python uses individual heap pushes during initialization, followed by at most ten heap-based selections.'),
    ])),
  1834: r('n = tasks.', [['Attach indices and sort by enqueue time', 'O(n) + O(n log n)'], ['Push each task when it becomes available', 'O(n log n)'], ['Pop each task and record its index', 'O(n log n)']], ['O(n + 3n log n)', 'O(n log n)'], 'The availability pointer only moves forward. When idle, time jumps directly to the next task; the code does not iterate through elapsed time units.'),
  767: withPython(
    r('n = characters; A = distinct lowercase letters, at most 26.', [['Count letters and build candidates', 'O(n + A)'], ['Sort initially and before each selection', 'O((n + 1) × A log(A + 1))'], ['Join the answer', 'O(n)']], ['O(n + (n + 1) × A log(A + 1))', 'O(n)'], 'The JavaScript candidates are re-sorted, not maintained by heap operations. Because A ≤ 26, each such sort has a fixed upper bound.'),
    r('n = characters; A = distinct lowercase letters, at most 26.', [['Count letters and heapify candidates', 'O(n + A)'], ['Pop and reinsert candidates for each character', 'O(n × log(A + 1))'], ['Join the answer', 'O(n)']], ['O(n + A + n log(A + 1))', 'O(n)'], 'Python uses heap operations. The alphabet is fixed at 26 letters, so log(A + 1) is constant.')),
  1405: r('N = a + b + c = available characters.', [['Initialize at most three heap entries', 'O(3 log 3)'], ['Choose up to N characters with constant-many heap operations', 'O(N × log 3)'], ['Join the chosen characters', 'O(N)']], ['O(1) + O(N) + O(N)', 'O(N)'], 'The heap never contains more than three character types. Large counts increase output length, not heap height.'),
  1094: r('n = trips; L = location slots (1001 in this code).', [['Initialize diff', 'O(L)'], ['Record two endpoint changes per trip', 'O(2n)'], ['Scan all locations', 'O(L)']], ['O(n + L)', 'O(n)'], 'L is fixed at 1001 by the location constraints. If location range were variable, the bound would remain O(n + L).'),
  295: ops('n = numbers stored before the call.', [
    c('Constructor', [['Create two empty heaps', 'O(1)']], ['O(1)'], 'No values are copied.'),
    c('addNum', [['Insert into the lower heap', 'O(log(n + 2))'], ['Restore value ordering and balance with at most two transfers', 'O(4 × log(n + 2))']], ['O(5 log(n + 2))', 'O(log(n + 2))'], 'There is a constant number of heap pushes and pops. Each traverses at most O(log n) levels.'),
    c('findMedian', [['Read heap sizes and one or two roots', 'O(1)'], ['Return the middle value or average', 'O(1)']], ['O(2)', 'O(1)'], 'The heaps are already balanced; querying the median does not sort or traverse them.'),
  ]),
  502: r('n = projects; K = min(k, n) = maximum projects that can be selected.', [['Pair capital with profits', 'O(n)'], ['Sort projects by required capital', 'O(n log n)'], ['Push each affordable project at most once', 'O(n log n)'], ['Select up to K projects', 'O(K log n)']], ['O(n + n log n + n log n + K log n)', 'O(n log n)'], 'K ≤ n, so all selections fit within O(n log n). The next pointer prevents scanning all projects again on every selection.'),
};

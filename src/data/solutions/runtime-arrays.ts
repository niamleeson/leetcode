import { Runtime, runtime as r, operations as ops, calculation as c, withPython } from './runtime-breakdown';

const n = 'n = input length.';
const linear = (work: string, note: string) => r(n, [['Initialize counters or pointers', 'O(1)'], [work, 'O(n)']], ['O(n)'], note);
const hashTable = (buckets: number, methods: string) => ops(`n = stored keys; B = bucket count (${buckets} in this code).`, [
  c('Constructor', [['Allocate bucket slots', 'O(B)'], ['Create empty buckets', 'O(B)']], ['O(B)'], 'The fixed bucket count is constant with respect to n, but construction still creates B lists.'),
  c(`${methods} (average)`, [['Hash the key', 'O(1)'], ['Search its bucket', 'O(n / B)'], ['Update, append, or shift entries on removal', 'O(1 + n / B)']], ['O(1 + n / B)'], 'Assumes keys are distributed evenly across buckets. With all keys colliding, an operation is O(1 + n). The +1 accounts for an empty bucket.'),
]);

export const arrayRuntimes: Record<string, Runtime> = {
  1929: r(n, [['Create space for 2n output values', 'O(n)'], ['Copy each input into both halves', 'O(2n)']], ['O(n) + O(n)', 'O(n)'], 'JavaScript writes two positions per iteration; Python concatenation copies both copies of the input. Both produce 2n values.'),
  217: linear('Check and insert each value in seen', 'A duplicate can return early. Hash-set operations take expected O(1), so n checks and insertions take expected O(n).'),
  242: withPython(
    r('n = string length after the equal-length check.', [['Check lengths', 'O(1)'], ['Count characters in s', 'O(n)'], ['Subtract characters in t', 'O(n)']], ['O(1 + 2n)', 'O(n)'], 'Different lengths return immediately. Each character causes a constant number of frequency-map operations.'),
    r('n = length of s; m = length of t; A = distinct letters, at most 26.', [['Build Counter(s)', 'O(n)'], ['Build Counter(t)', 'O(m)'], ['Compare counters', 'O(A)']], ['O(n + m + A)', 'O(n + m)'], 'This Python version builds both counters without an initial length check. The alphabet is fixed.')),
  1: linear('Look up each complement and remember the current value', 'The map avoids scanning earlier values. Each of n iterations performs expected O(1) map work.'),
  14: r('N = strings; L = shortest string length.', [['Compare character columns until a mismatch or end', 'O(N × (L + 1))'], ['Copy the returned prefix if needed', 'O(L)']], ['O(N × (L + 1) + L)', 'O(N × (L + 1))'], 'At most L matching columns and one failing column are examined. The +1 also covers checking empty strings. Python’s strs[1:] slice costs O(N) per column and fits this same bound.'),
  49: r('N = words; K = maximum word length.', [['Split, join, and hash each word’s key', 'O(N × K)'], ['Sort the letters in each word', 'O(N × K log(K + 1))'], ['Append words and collect groups', 'O(N)']], ['O(N × K + N × K log(K + 1) + N)', 'O(N × (1 + K log(K + 1)))'], 'Sorting is repeated for every word. The +1 keeps the bound meaningful when words are empty; for K ≥ 2 this is the usual O(N × K log K).'),
  27: linear('Read each value and write it if it is kept', 'The write pointer never creates an additional scan; at most n writes occur.'),
  169: linear('Update the candidate and vote count once per value', 'Only two scalar variables change per iteration. The problem guarantees that a majority exists, so there is no verification pass.'),
  705: hashTable(10007, 'add / remove / contains'),
  706: hashTable(1009, 'put / get / remove'),
  912: r(n, [['Build the heap from the bottom up', 'O(n)'], ['Swap out each maximum and sift down', 'O(n × log n)']], ['O(n + n log n)', 'O(n log n)'], 'Heap construction is linear: most nodes are near the leaves and move only a few levels. Each of the n removals can descend O(log n) levels.'),
  75: linear('Shrink the unclassified region by one element per iteration', 'Either mid moves right or high moves left. Even when mid stays put after a swap, high moves, so there are at most n iterations.'),
  347: r('n = numbers; U = distinct values; k = requested results. k ≤ U ≤ n.', [['Count frequencies', 'O(n)'], ['Initialize n + 1 buckets', 'O(n)'], ['Place U values into buckets', 'O(U)'], ['Scan buckets and collect k results', 'O(n + k)']], ['O(n) + O(n) + O(n) + O(n)', 'O(n)'], 'Each distinct value belongs to one bucket. The inner bucket loop does not scan all U values for every frequency.'),
  271: ops('S = total payload characters; H = total length-prefix and delimiter characters; C = S + H = encoded length.', [
    c('encode', [['Build length-prefixed pieces', 'O(S + H)'], ['Join the pieces', 'O(C)']], ['O(C) + O(C)', 'O(C)'], 'Prefix overhead matters even when every input string is empty.'),
    c('decode', [['Read and parse all length prefixes', 'O(H)'], ['Copy all payload strings', 'O(S)']], ['O(S + H)', 'O(C)'], 'The read position advances past each decoded string. Characters are not rescanned from the beginning.'),
  ]),
  304: ops('m = rows; n = columns.', [
    c('Constructor', [['Initialize the prefix-sum grid', 'O((m + 1) × (n + 1))'], ['Fill one prefix sum per input cell', 'O(m × n)']], ['O(m × n) + O(m × n)', 'O(m × n)'], 'Each cell reads a fixed number of neighboring prefix sums.'),
    c('sumRegion', [['Read four prefix sums', 'O(4)'], ['Add and subtract them', 'O(1)']], ['O(1) + O(1)', 'O(1)'], 'The query does not visit the cells inside the requested rectangle.'),
  ]),
  238: r(n, [['Initialize answer', 'O(n)'], ['Compute prefix products', 'O(n)'], ['Multiply suffix products', 'O(n)']], ['O(3n)', 'O(n)'], 'The passes run one after another, so their costs add rather than multiply.'),
  36: r('The board is fixed at 9 rows and 9 columns.', [['Create 27 sets', 'O(27)'], ['Check 81 cells with constant set work', 'O(9 × 9)']], ['O(27 + 81)', 'O(1)'], 'The dimensions are fixed by this problem; they do not grow with the input.'),
  128: r('n = numbers; U = distinct values, with U ≤ n.', [['Build numSet', 'O(n)'], ['Check which values start a sequence', 'O(U)'], ['Walk all sequences together', 'O(U)']], ['O(n) + O(n) + O(n)', 'O(n)'], 'Only sequence starts enter the counting loop. Each distinct value belongs to exactly one sequence, so nested loops do not make this quadratic.'),
  122: linear('Check consecutive prices and add positive gains', 'There are n − 1 adjacent pairs, with constant arithmetic per pair.'),
  229: r(n, [['Find up to two candidates', 'O(n)'], ['Count occurrences of each candidate', 'O(2 × n)'], ['Return at most two values', 'O(1)']], ['O(n) + O(n) + O(1)', 'O(n)'], 'The verification loop runs twice, not n times. JavaScript filter also creates temporary arrays, but each filter is still one linear pass.'),
  560: linear('Update the prefix sum, look up its complement, and record its count', 'One map lookup counts all matching earlier prefixes at once; the code does not iterate over those matches.'),
  41: r(n, [['Scan candidate positions', 'O(n)'], ['Perform all placement swaps', 'O(n)'], ['Find the first missing position', 'O(n)']], ['O(3n)', 'O(n)'], 'Every successful swap fixes a previously incorrect destination. Fixed destinations are not disturbed, so there are at most n successful swaps across all inner loops.'),

  344: r(n, [['Initialize the two pointers', 'O(1)'], ['Swap pairs until they meet', 'O(n / 2)']], ['O(1) + O(n)', 'O(n)'], 'Both pointers move each time, so the loop performs about n/2 constant-time swaps.'),
  125: r(n, [['Skip non-alphanumeric characters across both pointers', 'O(n)'], ['Compare the remaining character pairs', 'O(n)']], ['O(2n)', 'O(n)'], 'Pointers only move inward. A character cannot be skipped or compared repeatedly in different full scans.'),
  680: r(n, [['Scan to the first mismatch', 'O(n)'], ['Test skipping the left character', 'O(n)'], ['Test skipping the right character', 'O(n)']], ['O(3n)', 'O(n)'], 'Only the first mismatch triggers these two checks. The helper does not branch recursively into further deletion choices.'),
  1768: r('n = word1 length; m = word2 length.', [['Append characters from both words', 'O(n + m)'], ['Join the result', 'O(n + m)']], ['O(2 × (n + m))', 'O(n + m)'], 'Each input character is appended once and copied once into the final string.'),
  88: r('m and n = valid input lengths.', [['Move elements from nums1', 'O(m)'], ['Move elements from nums2', 'O(n)']], ['O(m + n)'], 'Each iteration consumes one input element; it never processes all m elements for each of the n elements.'),
  26: linear('Advance fast and write newly encountered distinct values', 'fast crosses the input once; slow only advances when a unique value is written.'),
  167: linear('Check a sum and move one pointer inward', 'The gap between the pointers shrinks on every unsuccessful check, for at most n − 1 checks.'),
  15: r(n, [['Sort nums', 'O(n log n)'], ['Fix each first value and run a two-pointer scan', 'O(n × n)']], ['O(n log n) + O(n²)', 'O(n²)'], 'One fixed value allows O(n) total pointer moves, including duplicate skips. Appending each three-value answer is constant time and is included in the scan.'),
  18: r(n, [['Sort nums', 'O(n log n)'], ['Fix two values and scan the remaining pair', 'O(n × n × n)']], ['O(n log n) + O(n³)', 'O(n³)'], 'The two outer loops select O(n²) pairs. Each pair starts a new O(n) two-pointer scan.'),
  189: r('n = array length; k = rotation reduced modulo n.', [['Reverse the whole array', 'O(n)'], ['Reverse the first k elements', 'O(k)'], ['Reverse the remaining elements', 'O(n − k)']], ['O(n + k + n − k)', 'O(n)'], 'The last two reversals cover disjoint portions totaling n elements.'),
  11: linear('Compute area, update maxWater, and move the shorter side', 'One pointer moves inward per iteration, so only O(n) pairs are examined.'),
  881: r(n, [['Sort people by weight', 'O(n log n)'], ['Assign boats with two pointers', 'O(n)']], ['O(n log n + n)', 'O(n log n)'], 'Each boat removes the heaviest remaining person and possibly the lightest. The scan is linear; sorting dominates.'),
  42: linear('Process one bar and update the side maximum and water total', 'Each iteration moves exactly one boundary inward. Computing trapped water at that boundary is constant time.'),

  219: r(n, [['Check and insert each value', 'O(n)'], ['Remove expired values', 'O(n)']], ['O(2n)', 'O(n)'], 'Each value enters and leaves the window at most once. Set operations use expected O(1) time.'),
  121: linear('Update minPrice and maxProfit for each price', 'The cheapest earlier price is stored, so no inner scan of earlier days is needed.'),
  3: r(n, [['Advance right and add characters', 'O(n)'], ['Advance left and remove duplicates', 'O(n)']], ['O(2n)', 'O(n)'], 'left never moves backward. All executions of the inner while loop together remove at most n characters.'),
  424: r(n, [['Extend the window and update counts and maxFreq', 'O(n)'], ['Shrink and update the best length', 'O(n)']], ['O(2n)', 'O(n)'], 'maxFreq is maintained incrementally; the code does not rescan the frequency map each time.'),
  567: r('m = s1 length; n = s2 length. The search runs only when m ≤ n.', [['Initialize two 26-entry counters and matches', 'O(26)'], ['Count the first window and s1', 'O(2m)'], ['Slide across the remaining positions', 'O(n − m)']], ['O(1 + m + n)', 'O(n)'], 'Updating matches checks only the entering and leaving letters. If m > n, the initial length check returns in O(1).'),
  209: r(n, [['Extend right and add values', 'O(n)'], ['Shrink left and subtract values', 'O(n)']], ['O(2n)', 'O(n)'], 'The inner loop runs at most n times in total because left never moves backward.'),
  658: r('n = array length; k = result length.', [['Binary-search the n − k + 1 window starts', 'O(log(n − k + 1))'], ['Copy the selected window', 'O(k)']], ['O(log(n − k + 1) + k)'], 'Each search comparison is constant time. Returning a slice copies k values; it is not an O(1) return.'),
  76: r('n = s length; m = t length.', [['Count required characters and distinct requirements', 'O(m)'], ['Extend the right boundary', 'O(n)'], ['Shrink the left boundary across all windows', 'O(n)'], ['Copy the best substring', 'O(n)']], ['O(m + 3n)', 'O(n + m)'], 'Each boundary crosses s once. Only the final best substring is copied; intermediate windows are tracked by their indices.'),
  239: r('n = numbers; k = window size, with k ≤ n.', [['Initialize deque storage', 'O(k)'], ['Insert each index', 'O(n)'], ['Remove expired or smaller indices', 'O(n)'], ['Write window maxima', 'O(n − k + 1)']], ['O(n) + O(n) + O(n) + O(n)', 'O(n)'], 'An index is inserted once and removed at most once. The inner removal loop therefore contributes O(n) over the entire run. Python’s empty deque initialization is O(1), within the same bound.'),
};

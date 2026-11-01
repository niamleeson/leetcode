import { ProblemSolution, TimeComplexityBreakdown } from './types';

// Applied after BFS/iterative variants are assigned, so each derivation describes
// the code actually displayed. Costs use the page's O(1) FIFO queue convention.
type Runtime = Pick<ProblemSolution, 'timeComplexity' | 'timeComplexityBreakdown'>;

function runtime(
  variables: string,
  phases: [label: string, cost: string][],
  simplifications: [string, ...string[]],
  note: string,
): Runtime {
  const timeComplexityBreakdown: TimeComplexityBreakdown = {
    variables,
    phases: phases.map(([label, cost]) => ({ label, cost })),
    simplifications,
    note,
  };
  return { timeComplexity: simplifications[simplifications.length - 1], timeComplexityBreakdown };
}

const grid = 'm = rows; n = columns.';
const graph = 'V = vertices; E = edges.';
const courses = 'V = courses; E = prerequisite pairs.';
const emails = 'T = total email occurrences in the input; U = unique emails. U ≤ T.';
const islands = runtime(grid, [
  ['Scan the grid for unvisited land', 'O(m × n)'],
  ['Visit land cells across all DFS calls', 'O(m × n)'],
  ['Check four neighbors per visited cell', 'O(4 × m × n)'],
], ['O(m × n) + O(m × n) + O(m × n)', 'O(m × n)'],
'Marking land as water prevents a second visit. All island searches together visit at most m × n cells; a new search does not rescan previously visited land.');

const clone = runtime(graph, [
  ['Create and remember each node copy', 'O(V)'],
  ['Read and copy every neighbor entry', 'O(2E)'],
], ['O(V) + O(E)', 'O(V + E)'],
'The clone map prevents repeated node creation. An undirected edge has two neighbor entries; the constant 2 drops out. V and E count the component reachable from the input node.');

const surrounded = runtime(grid, [
  ['Scan the whole board to find border O cells', 'O(m × n)'],
  ['Mark all safe cells and check their four neighbors', 'O(m × n + 4 × m × n)'],
  ['Scan again to capture or restore cells', 'O(m × n)'],
], ['O(m × n) + O(m × n) + O(m × n)', 'O(m × n)'],
'The displayed code checks the border condition inside a full grid scan. Safe cells are marked once, so all searches share one O(m × n) traversal cost.');

const itinerary = runtime('E = tickets.', [
  ['Sort the tickets', 'O(E log E)'],
  ['Build the adjacency lists', 'O(E)'],
  ['Consume each ticket once', 'O(E)'],
  ['Append the E + 1 route stops', 'O(E + 1)'],
  ['Reverse the route', 'O(E + 1)'],
], ['O(E log E) + O(E) + O(E) + O(E) + O(E)', 'O(E log E)'],
'Traversal removes each ticket from its adjacency list once. Sorting dominates the linear passes. Airport codes have a fixed length of three characters.');

const topological = runtime(courses, [
  ['Initialize graph and inDegree', 'O(2V)'],
  ['Add prerequisite edges', 'O(E)'],
  ['Find courses with zero indegree', 'O(V)'],
  ['Remove each course from the queue at most once', 'O(V)'],
  ['Update indegrees across all adjacency lists', 'O(E)'],
], ['O(V) + O(E) + O(V) + O(V) + O(E)', 'O(V + E)'],
'The neighbor loops collectively scan E edges, because each course processes only its own adjacency list. Recording a course in the answer also takes constant time per course.');

const derivations: Record<string, Runtime> = {
  463: runtime(grid, [
    ['Initialize the perimeter counter', 'O(1)'],
    ['Scan every cell, with at most two adjacent-land checks', 'O(m × n × (1 + 2))'],
  ], ['O(1) + O(m × n)', 'O(m × n)'],
  'The checks above and to the left take constant time for each land cell.'),

  953: runtime('C = total characters across all input words.', [
    ['Build the alphabet rank map', 'O(26)'],
    ['Compare adjacent words', 'O(C)'],
  ], ['O(1) + O(C)', 'O(C)'],
  'The alphabet has 26 letters. Each word participates in at most two adjacent comparisons, so character comparisons add up to O(C).'),

  997: runtime('V = people (n in the code); E = trust pairs.', [
    ['Initialize balance', 'O(V)'],
    ['Update two balances for each trust pair', 'O(2E)'],
    ['Scan for the judge', 'O(V)'],
  ], ['O(V) + O(E) + O(V)', 'O(V + E)'],
  'These are separate passes, so their costs add.'),

  200: islands,
  '200-iterative': islands,
  695: islands,
  '695-iterative': islands,
  133: clone,
  '133-iterative': clone,

  286: runtime(grid, [
    ['Scan rooms and enqueue gates', 'O(m × n)'],
    ['Process each reachable room once', 'O(m × n)'],
    ['Check four neighbors per processed room', 'O(4 × m × n)'],
  ], ['O(m × n) + O(m × n) + O(m × n)', 'O(m × n)'],
  'All gates share one queue. Setting a room’s distance before enqueueing prevents repeated visits.'),

  994: runtime(grid, [
    ['Scan the grid to count fresh and enqueue rotten oranges', 'O(m × n)'],
    ['Process all oranges across all minute layers', 'O(m × n)'],
    ['Check four neighbors per processed orange', 'O(4 × m × n)'],
  ], ['O(m × n) + O(m × n) + O(m × n)', 'O(m × n)'],
  'An orange becomes rotten before it enters the queue, so it is enqueued once. Minute layers divide up the oranges; they do not each process the entire grid.'),

  417: runtime(grid, [
    ['Initialize the two visited grids', 'O(2 × m × n)'],
    ['Start searches along the four borders', 'O(2m + 2n)'],
    ['Visit cells and neighbors for both oceans', 'O(2 × (m × n + 4 × m × n))'],
    ['Scan both grids to collect the intersection', 'O(m × n)'],
  ], ['O(m × n) + O(m + n) + O(m × n) + O(m × n)', 'O(m × n)'],
  'Each ocean has one shared visited grid, so each cell is visited at most once per ocean. For positive grid dimensions, m + n is O(m × n).'),

  130: surrounded,
  '130-iterative': surrounded,

  752: runtime('D = deadends; S = explored lock states, at most 10,000.', [
    ['Build deadendSet', 'O(D)'],
    ['Process explored states', 'O(S)'],
    ['Generate eight four-character neighbors per state', 'O(S × 8 × 4)'],
  ], ['O(D) + O(S) + O(S)', 'O(D + S)'],
  'Four wheels, two turns per wheel, and four-character strings are fixed constants. Visited states are not enqueued again.'),

  207: topological,
  210: topological,

  261: runtime(graph, [
    ['Initialize graph', 'O(V)'],
    ['Add both directions of each edge', 'O(2E)'],
    ['Pop visited nodes from the stack', 'O(V)'],
    ['Check their adjacency entries', 'O(2E)'],
  ], ['O(V) + O(E) + O(V) + O(E)', 'O(V + E)'],
  'Nodes are marked before being pushed. Each undirected edge contributes two adjacency entries. Detecting a cycle can stop the traversal earlier.'),

  1462: runtime(`${courses} Q = queries.`, [
    ['Build graph', 'O(V + E)'],
    ['Initialize reachable', 'O(V²)'],
    ['Run a separate BFS from each course', 'O(V × (V + E))'],
    ['Look up the answers to queries', 'O(Q)'],
  ], ['O(V + E + V² + V² + V × E + Q)', 'O(V² + V × E + Q)', 'O(V × (V + E) + Q)'],
  'One BFS processes at most V courses and E adjacency entries in total. The outer start loop repeats that work V times. The resulting V² term already covers initializing reachable.'),

  '1462-floyd-warshall': runtime(`${courses} Q = queries.`, [
    ['Initialize reach', 'O(V²)'],
    ['Mark direct prerequisites', 'O(E)'],
    ['Run the three nested course loops', 'O(V × V × V)'],
    ['Look up query answers', 'O(Q)'],
  ], ['O(V² + E + V³ + Q)', 'O(V³ + Q)'],
  'Every k, i, j combination is checked. There are at most V² prerequisite pairs, so V³ covers both initialization terms.'),

  323: runtime(graph, [
    ['Build the undirected graph', 'O(V + 2E)'],
    ['Try each node as a component start', 'O(V)'],
    ['Run all component BFS traversals together', 'O(V + 2E)'],
  ], ['O(V + E) + O(V) + O(V + E)', 'O(V + E)'],
  'All components share visited. Previously visited starts are skipped, so the outer loop does not repeat a full BFS V times.'),

  '323-union-find': runtime(graph, [
    ['Initialize parent', 'O(V)'],
    ['Find and merge roots for E edges', 'O(E × log V)'],
  ], ['O(V) + O(E log V)', 'O(V + E log V)'],
  'This is an amortized upper bound across all operations. The code uses path compression without union by rank or size, so this analysis uses log V per operation.'),

  684: runtime(`${graph} Here E = V (a tree plus one extra edge).`, [
    ['Build the complete undirected graph', 'O(V + 2E)'],
    ['Try up to E candidate edges, with a fresh BFS each time', 'O(E × (V + 2E))'],
  ], ['O(V + E) + O(E × (V + E))', 'O(V) + O(V × (V + V))', 'O(V²)'],
  'Each candidate creates a new visited set. Substituting E = V makes each BFS O(V), repeated at most V times.'),

  '684-union-find': runtime(`${graph} Here E = V.`, [
    ['Initialize parent and rank', 'O(2V)'],
    ['Find and union endpoints for each edge', 'O(E × α(V))'],
  ], ['O(V) + O(V × α(V))', 'O(V × α(V))'],
  'With both rank and path compression, α(V), the inverse Ackermann function, bounds the amortized cost per operation. It grows extremely slowly.'),

  721: runtime(emails, [
    ['Build the email graph and name map', 'O(T)'],
    ['Traverse all email components with BFS', 'O(U + T)'],
    ['Sort emails within the merged accounts', 'O(U log U)'],
    ['Assemble the result arrays', 'O(U)'],
  ], ['O(T) + O(T) + O(U log U) + O(U)', 'O(T + U log U)'],
  'U ≤ T, so O(U + T) becomes O(T). All BFS traversals share visited. Sorting the separate groups costs at most O(U log U) in total. Email hashing and comparison are treated as constant time.'),

  '721-union-find': runtime(emails, [
    ['Read email occurrences and initialize maps', 'O(T)'],
    ['Union each occurrence with its account’s first email', 'O(T log U)'],
    ['Find roots and group unique emails', 'O(U log U)'],
    ['Sort the groups', 'O(U log U)'],
    ['Assemble result arrays', 'O(U)'],
  ], ['O(T + T log U + 2U log U + U)', 'O(T log U + U log U)', 'O(T log U)'],
  'This conservative amortized bound uses log U for path compression without rank or size. Since U ≤ T, T log U also covers sorting. Email hashing and comparison are treated as constant time.'),

  399: runtime('V = distinct variables; E = equations; Q = queries.', [
    ['Build both directed ratios for each equation', 'O(2E)'],
    ['Run a fresh BFS for each query', 'O(Q × (V + 2E))'],
    ['Write the query answers', 'O(Q)'],
  ], ['O(E) + O(Q × (V + E)) + O(Q)', 'O(E + Q × (V + E))'],
  'One BFS visits at most V variables and scans at most 2E adjacency entries. Each query starts over, so multiply that search cost by Q. An early answer can use less work.'),

  310: runtime(`${graph} The input is a tree, so E = V − 1.`, [
    ['Build adjacency sets', 'O(V + 2E)'],
    ['Find initial leaves', 'O(V)'],
    ['Peel all leaf layers', 'O(V + E)'],
  ], ['O(V + E) + O(V) + O(V + E)', 'O(V + E)', 'O(V)'],
  'A node becomes a leaf and is removed at most once. Across all layers, each removed leaf deletes one connection. Substitute E = V − 1 to get O(V).'),

  127: runtime('W = words including beginWord; L = word length.', [
    ['Build the word set, including string hashing', 'O(W × L)'],
    ['Build L length-L wildcard patterns per word', 'O(W × L × L)'],
    ['BFS: regenerate patterns and inspect their word buckets', 'O(W × L × (L + 26))'],
  ], ['O(W × L) + O(W × L²) + O(W × L² + 26 × W × L)', 'O(W × L²)'],
  'Creating a pattern copies up to L characters. A wildcard bucket holds at most 26 distinct words because only one lowercase letter varies. Each word enters the queue once.'),

  1631: runtime(grid, [
    ['Initialize effort', 'O(m × n)'],
    ['Check at most four outgoing edges per cell', 'O(4 × m × n)'],
    ['Push improved distances into the heap', 'O(4 × m × n × log(4 × m × n))'],
    ['Pop heap entries, including outdated ones', 'O(4 × m × n × log(4 × m × n))'],
  ], ['O(m × n) + O(m × n) + O(m × n × log(m × n)) + O(m × n × log(m × n))', 'O(m × n × log(m × n))'],
  'There are m × n cells and O(m × n) edges. Each successful edge relaxation adds one heap entry, so there are O(m × n) pushes and pops, each costing O(log(m × n)).'),

  743: runtime(graph, [
    ['Build graph', 'O(E)'],
    ['Finalize nodes and scan their outgoing edges', 'O(V + E)'],
    ['Push candidate routes into the heap', 'O(E × log(E + 1))'],
    ['Pop candidate routes, including outdated ones', 'O(E × log(E + 1))'],
    ['Find the maximum finalized distance', 'O(V)'],
  ], ['O(V + E + E × log(E + 1))', 'O(V + E × log(E + 1))', 'O(V + E log V)'],
  'Each edge can add one candidate, so the heap can hold O(E) entries. This problem has no parallel edges: E ≤ V × (V − 1), making log(E + 1) O(log V). Queue assumptions do not change heap costs.'),

  332: itinerary,
  '332-iterative': itinerary,

  1584: runtime('V = points; E = V × (V − 1) / 2 candidate edges.', [
    ['Initialize graph', 'O(V)'],
    ['Generate all point pairs', 'O(V²)'],
    ['Sort candidate edges', 'O(E log E)'],
    ['Check up to E candidates using BFS on the accepted forest', 'O(E × (V + V − 1))'],
  ], ['O(V) + O(V²) + O(V² log(V²)) + O(V³)', 'O(V³)'],
  'The accepted graph is a forest with at most V − 1 edges, so each BFS costs O(V). Up to O(V²) candidate checks give O(V³), which dominates sorting.'),

  '1584-union-find': runtime('V = points; E = V × (V − 1) / 2 candidate edges.', [
    ['Initialize parent and rank', 'O(V)'],
    ['Generate all point pairs', 'O(V²)'],
    ['Sort candidate edges', 'O(E log E)'],
    ['Check and merge components for candidate edges', 'O(E × α(V))'],
  ], ['O(V) + O(V²) + O(V² log(V²)) + O(V² × α(V))', 'O(V² log V)'],
  'Rank and path compression give amortized α(V) per union-find operation. Sorting O(V²) edges dominates; log(V²) = 2 log V.'),

  778: runtime('n = side length; the grid has n² cells.', [
    ['Initialize visited', 'O(n²)'],
    ['Check four neighbors per visited cell', 'O(4n²)'],
    ['Push cells into the heap', 'O(n² × log(n²))'],
    ['Pop cells from the heap', 'O(n² × log(n²))'],
  ], ['O(n²) + O(n²) + O(n² × log(n²)) + O(n² × log(n²))', 'O(n² × log(n²))', 'O(n² log n)'],
  'A cell is marked before it is pushed, so it enters the heap once. There are at most n² heap entries, and log(n²) = 2 log n.'),

  269: runtime('C = input characters; V = distinct letters; E = distinct ordering constraints.', [
    ['Create a graph entry for every input letter', 'O(C)'],
    ['Compare adjacent words, including prefix checks', 'O(C)'],
    ['Find zero-indegree letters', 'O(V)'],
    ['Process letters and constraints with topological BFS', 'O(V + E)'],
    ['Join the result letters', 'O(V)'],
  ], ['O(C + V + E)', 'O(C)'],
  'Each word participates in at most two adjacent comparisons. The alphabet is fixed at 26 lowercase letters, so V ≤ 26 and E ≤ 26².'),

  787: runtime('V = cities (n in the code); E = flights; k = maximum stops.', [
    ['Initialize prices', 'O(V)'],
    ['For each of k + 1 rounds, copy prices and scan flights', 'O((k + 1) × (V + E))'],
  ], ['O(V) + O((k + 1) × V) + O((k + 1) × E)', 'O((k + 1) × (V + E))'],
  'The [...prices] copy costs O(V) every round; scanning flights costs O(E). The code runs k + 1 rounds even when few flights are reachable.'),

  1489: runtime(graph, [
    ['Attach original edge indices', 'O(E)'],
    ['Sort edges once', 'O(E log E)'],
    ['Run the baseline and up to two MST trials per edge', 'O((1 + 2E) × (V + E × V))'],
  ], ['O(E) + O(E log E) + O(E × V + E² × V)', 'O(E log E + E² × V)', 'O(E² × V)'],
  'One MST trial initializes V adjacency lists and runs up to E BFS checks. Each check searches an accepted forest with at most V − 1 edges, costing O(V). The repeated trials dominate the initial sort.'),

  '1489-union-find': runtime(graph, [
    ['Attach original edge indices', 'O(E)'],
    ['Sort edges once', 'O(E log E)'],
    ['Run the baseline and up to two MST trials per edge', 'O((1 + 2E) × (V + E log V))'],
  ], ['O(E) + O(E log E) + O(E × V + E² log V)', 'O(E log E + E² log V)', 'O(E² log V)'],
  'Each trial initializes V parents and scans E edges. Path compression without rank gives an amortized log V bound per operation. The connected input has E ≥ V − 1, so E² log V covers initialization and sorting.'),

  2392: runtime('k = labels; R = row conditions; C = column conditions.', [
    ['Build and topologically sort the row graph', 'O(k + R)'],
    ['Build and topologically sort the column graph', 'O(k + C)'],
    ['Build columnIndex', 'O(k)'],
    ['Initialize the k by k matrix', 'O(k²)'],
    ['Place the k labels', 'O(k)'],
  ], ['O(k² + 4k + R + C)', 'O(k² + R + C)'],
  'The two graph passes add their costs. Creating the output fills k² cells even though only k cells receive nonzero values. A cycle can return before matrix creation.'),

  2709: runtime('n = numbers; M = largest number; F = total distinct-prime occurrences, counted separately for each number.', [
    ['Initialize graph', 'O(n)'],
    ['Trial-divide each number up to its square root', 'O(n × √M)'],
    ['Connect indices for prime occurrences', 'O(F)'],
    ['BFS across the resulting sparse graph', 'O(n + 2F)'],
  ], ['O(n + n × √M + F + n + F)', 'O(n × √M + F)', 'O(n × √M)'],
  'Each prime occurrence adds at most one undirected edge. A number has at most log₂ M distinct prime factors, so F ≤ n log₂ M, which is O(n × √M).'),

  '2709-union-find': runtime('n = numbers; M = largest number; F = total distinct-prime occurrences, counted separately for each number.', [
    ['Check for 1 and initialize parent', 'O(n)'],
    ['Trial-divide every number', 'O(n × √M)'],
    ['Union indices sharing prime factors', 'O(F log n)'],
    ['Check every index’s root', 'O(n log n)'],
  ], ['O(n + n × √M + (F + n) log n)', 'O(n × √M + F log n)'],
  'Path compression without rank gives an amortized log n bound per operation. After the early return for 1, every number has at least one prime factor, so F ≥ n and F log n covers the final root checks.'),
};

export function withGraphRuntimeBreakdown(solution: ProblemSolution): ProblemSolution {
  const primary = derivations[String(solution.id)];
  if (!primary) return solution;
  const followUp = solution.followUp;
  const alternative = followUp?.walkthroughVariant
    ? derivations[`${solution.id}-${followUp.walkthroughVariant}`]
    : undefined;
  return {
    ...solution,
    ...primary,
    ...(followUp && alternative ? { followUp: { ...followUp, ...alternative } } : {}),
  };
}

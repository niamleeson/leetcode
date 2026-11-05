import type { ReactChallenge } from './types';

export const sunoReferralChallenge: ReactChallenge = {
  collection: 'Suno',
  kind: 'coding',
  slug: 'suno-referral-credits',
  title: 'Referral Credits',
  difficulty: 'Medium',
  topics: ['Maps', 'Sets', 'Deduplication', 'Data transformation'],
  sourceUrl: 'https://interviewexperiences.in/experience/suno/suno-software-engineer-tech-screen',
  sourceLabel: 'Software Engineer candidate report — July 21, 2025',
  report: 'A Suno Software Engineer candidate reports a technical-screen exercise calculating referral rewards from referral pairs and song-creation events. The account supplies the reward amounts, cap, sample input, and expected output. It does not identify a frontend-specific role or explain how competing referrers receive attribution.',
  summary: 'Deduplicate song creators, attribute referrals, and keep capped inviter rewards separate from total credits.',
  prompt: 'Given referral pairs [referrer, referee] and a list of users who created songs, return an object containing every user with a positive credit balance. A referred user’s first song awards 100 credits to that user and 100 to their referrer. Credits earned by referring other users are capped at 300 per user; the separate bonus for having been referred is not part of that cap.',
  assumptions: [
    'If multiple records name the same referred user, the first listed referrer receives attribution. This is inferred from the published example, not an explicit rule in the reported prompt.',
    'Referral pairs are valid and do not refer a user to themselves. User IDs are consistently represented as numbers, as in the example.',
    'Repeated song events for one user represent additional songs, not additional first-song rewards. This batch calculation has no preexisting balances.',
    'A user may earn 300 by inviting others plus 100 for having been referred, for a total of 400.',
  ],
  requirements: [
    'Assign at most one referrer to each referred user using the stated first-listed policy.',
    'Process each song creator once and ignore creators who have no attributed referrer.',
    'Award the referred user their bonus even when the referrer has already earned the maximum inviter reward.',
    'Cap only the inviter portion and return only users who actually earned credits.',
  ],
  example: {
    actions: 'calculateCredits([[1, 2], [1, 3], [2, 3], [2, 5], [3, 9]], [2, 2, 4, 2, 3, 5, 8])',
    result: '{ 1: 200, 2: 200, 3: 100, 5: 100 }. User 3 is attributed to user 1. Users 4 and 8 have no referrer, and user 9 has not created a song.',
  },
  solutionTitle: 'JavaScript solution',
  codeLanguage: 'javascript',
  steps: [
    'Build referrerByUser by walking the referral records once. Only set a referred user’s entry if it is not already present.',
    'Create a Set from songCreators so repeated events for one person are processed once.',
    'For each referred creator, add 100 to their total credits. Then separately check the referrer’s inviterRewards before awarding another 100.',
    'In the example, the accepted pairs are 1 → 2, 1 → 3, 2 → 5, and 3 → 9. The later 2 → 3 pair loses attribution.',
    'Creators 2, 3, and 5 trigger rewards. The three events for creator 2 count once; creator 9 is absent, so 3 → 9 earns nothing.',
    'Convert the credits Map to an object. Entries exist only after a reward was awarded, so there are no zero-credit users to filter out.',
  ],
  pitfalls: [
    'Ask who gets attribution when one person appears under multiple referrers. The first-listed policy is an explicit assumption in this answer.',
    'Do not award a bonus for every song event or every duplicate referral record.',
    'Do not cap the total balance at 300: the referred-user bonus is separate from inviter rewards.',
    'Reaching the inviter cap does not prevent a newly referred creator from receiving their own 100-credit bonus.',
  ],
  complexity: 'For R referral records and S song events, expected time is O(R + S) using Map and Set lookups. Worst-case space is O(R + S) for attribution, distinct creators, reward tracking, and output.',
  integrationNotes: [
    'This is standalone JavaScript; it does not require React or a server. Copy the complete function and examples into a JavaScript console or file.',
    'The output object uses string property keys, as JavaScript objects do; numeric user IDs such as 1 appear as the property "1".',
  ],
  testCases: [
    { action: 'Run the published example.', expected: '{ 1: 200, 2: 200, 3: 100, 5: 100 } with the stated first-listed attribution.' },
    { action: 'Repeat a referral record and repeat the same creator in song events.', expected: 'The qualifying first-song rewards are still awarded once.' },
    { action: 'User 1 is referred by user 9 and refers four people who all create songs.', expected: 'User 1 earns 400 total; all four referred creators still earn 100 each.' },
    { action: 'Supply no qualifying referred creators.', expected: 'Return an empty object.' },
  ],
  code: String.raw`function calculateCredits(referrals, songCreators) {
  // Assumption inferred from the published example:
  // the first listed referrer wins for each referred user.
  const referrerByUser = new Map();

  for (const [referrer, referee] of referrals) {
    if (!referrerByUser.has(referee)) {
      referrerByUser.set(referee, referrer);
    }
  }

  const credits = new Map();
  const inviterRewards = new Map();

  // Creating multiple songs must not trigger repeated rewards.
  for (const referee of new Set(songCreators)) {
    if (!referrerByUser.has(referee)) {
      continue;
    }

    const referrer = referrerByUser.get(referee);

    // The referred user receives their bonus even if the
    // referring user has already reached the referral cap.
    credits.set(referee, (credits.get(referee) ?? 0) + 100);

    // Only the rewards earned by inviting others are capped.
    const earned = inviterRewards.get(referrer) ?? 0;

    if (earned < 300) {
      inviterRewards.set(referrer, earned + 100);
      credits.set(referrer, (credits.get(referrer) ?? 0) + 100);
    }
  }

  return Object.fromEntries(credits);
}

// Reported example:
console.log(
  calculateCredits(
    [[1, 2], [1, 3], [2, 3], [2, 5], [3, 9]],
    [2, 2, 4, 2, 3, 5, 8]
  )
);
// { 1: 200, 2: 200, 3: 100, 5: 100 }

// User 1 earns 100 for being referred, plus at most 300 for inviting others.
console.log(
  calculateCredits(
    [[9, 1], [1, 2], [1, 3], [1, 4], [1, 5]],
    [1, 2, 3, 4, 5]
  )
);
// { 1: 400, 2: 100, 3: 100, 4: 100, 5: 100, 9: 100 }`,
};

export const sunoDagChallenge: ReactChallenge = {
  collection: 'Suno',
  kind: 'coding',
  slug: 'suno-longest-path-dag',
  title: 'Longest Path in a DAG',
  difficulty: 'Medium',
  topics: ['Graphs', 'Topological sorting', 'Dynamic programming', 'Queues'],
  sourceUrl: 'https://www.aced.io/experiences/suno-senior-software-engineer-interview-729c99',
  sourceLabel: 'Senior Software Engineer candidate report on Aced / Exponent',
  report: 'A Suno Senior / L5 Software Engineer candidate lists a phone-interview problem asking for the longest-path length in a directed acyclic graph. This is a general software-engineering report, not a confirmed frontend-specific question. The public account does not define the graph input format or how path length is counted.',
  summary: 'Process a DAG in topological order and track the longest path ending at each vertex.',
  prompt: 'Given n vertices and a list of directed edges [from, to], return the length of the longest path anywhere in the graph. For this implementation, vertices are numbered 0 through n − 1 and length is the number of edges. Include disconnected components. Return 0 for an empty graph or isolated vertices, and throw if the graph contains a cycle.',
  assumptions: [
    'Path length counts edges, not vertices. This convention and the numbered-vertex input format are practice choices because the report does not specify them.',
    'n is a nonnegative integer, and edge endpoints are valid vertex numbers. The input is unweighted.',
    'A DAG is promised by the problem; the final visited-count check also detects a cycle if that promise is violated.',
  ],
  requirements: [
    'Build an adjacency list and count each vertex’s incoming edges.',
    'Begin from every zero-indegree vertex so disconnected components are included.',
    'For each edge from → to, update distance[to] with max(distance[to], distance[from] + 1).',
    'Process a vertex only after all of its incoming edges have been accounted for, and return the largest distance.',
  ],
  example: {
    actions: 'longestPathDAG(5, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]])',
    result: '3. Both 0 → 1 → 3 → 4 and 0 → 2 → 3 → 4 have three edges. The final distance array is [0, 1, 1, 2, 3].',
  },
  solutionTitle: 'JavaScript solution',
  codeLanguage: 'javascript',
  steps: [
    'Allocate a separate neighbor array for each vertex and fill indegree with incoming-edge counts.',
    'Add every zero-indegree vertex to the queue. Its longest incoming path has length 0.',
    'Read the queue using a head index. For each outgoing edge, consider extending the current vertex’s longest path by one edge.',
    'Decrease the neighbor’s indegree. Once it reaches 0, all predecessors have contributed and that neighbor’s distance is final, so enqueue it.',
    'For the example, processing 0 sets distances for 1 and 2 to 1. They both offer distance 2 to vertex 3; processing 3 sets vertex 4 to 3.',
    'After traversal, check that all n vertices were processed; otherwise a cycle prevented a valid topological order. Then scan the completed distance array to find the largest value.',
  ],
  pitfalls: [
    'Clarify whether length counts edges or vertices. For vertex counts, add 1 to a nonempty graph’s edge-count result; keep the empty graph at 0.',
    'Start with every zero-indegree vertex, not only vertex 0, or a longer disconnected component can be missed.',
    'Take the maximum distance offered by all predecessors. The first predecessor to arrive need not supply the longest path.',
    'Use a queue head index instead of shift(), which can require moving the remaining array entries repeatedly.',
    'The acyclic condition is what allows predecessor distances to become final before successors are processed.',
  ],
  complexity: 'For V vertices and E directed edges, time is O(V + E): each vertex enters the queue once and each edge is examined once. The final scan of distance adds O(V) work, so the overall bound stays O(V + E). Space is O(V + E), including the adjacency list, indegree and distance arrays, and queue.',
  integrationNotes: [
    'This is a standalone JavaScript graph function. The examples use edge lists, including an empty graph and disconnected components.',
    'The cycle check is a useful safeguard, not a solution for longest simple paths in arbitrary cyclic graphs.',
  ],
  testCases: [
    { action: 'Run the five-vertex example.', expected: 'Return 3, counting edges.' },
    { action: 'Provide no vertices or several isolated vertices.', expected: 'Return 0.' },
    { action: 'Put a longer path in a disconnected component.', expected: 'Return the length from that component.' },
    { action: 'Give a vertex both a short incoming route and a longer incoming route.', expected: 'Keep the maximum and propagate it to successors.' },
    { action: 'Include a directed cycle.', expected: 'Throw Graph must be acyclic.' },
  ],
  code: String.raw`function longestPathDAG(n, edges) {
  // Vertices are numbered from 0 through n - 1.
  const graph = Array.from({ length: n }, () => []);
  const indegree = Array(n).fill(0);

  for (const [from, to] of edges) {
    graph[from].push(to);
    indegree[to]++;
  }

  const distance = Array(n).fill(0);
  const queue = [];

  // Start from every source, including disconnected components.
  for (let vertex = 0; vertex < n; vertex++) {
    if (indegree[vertex] === 0) {
      queue.push(vertex);
    }
  }

  let head = 0;
  let visited = 0;

  while (head < queue.length) {
    const from = queue[head++];
    visited++;

    for (const to of graph[from]) {
      distance[to] = Math.max(distance[to], distance[from] + 1);
      indegree[to]--;

      // All predecessors of "to" have now been processed.
      if (indegree[to] === 0) {
        queue.push(to);
      }
    }
  }

  if (visited !== n) {
    throw new Error('Graph must be acyclic');
  }

  let answer = 0;

  for (const length of distance) {
    answer = Math.max(answer, length);
  }

  return answer;
}

console.log(
  longestPathDAG(5, [
    [0, 1], [0, 2], [1, 3], [2, 3], [3, 4],
  ])
);
// 3

console.log(longestPathDAG(0, []));
// 0: empty graph

console.log(longestPathDAG(3, []));
// 0: isolated vertices have no edges

console.log(
  longestPathDAG(6, [
    [0, 1], [2, 3], [3, 4], [4, 5],
  ])
);
// 3: longest path is in the second component`,
};

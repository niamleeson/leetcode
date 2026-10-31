import { ProblemSolution, SolutionFollowUp } from './types';

// These are fully self-contained snippets after interpolation. Layer arrays keep
// BFS readable without a queue index or repeated array-front removals.
const jsConnected = `    const connected = (graph, start, target) => {
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
    };`;

const pythonConnected = `        def connected(graph, start, target):
            visited = {start}
            frontier = [start]

            while frontier:
                next_frontier = []
                for node in frontier:
                    if node == target:
                        return True
                    for neighbor in graph[node]:
                        if neighbor in visited:
                            continue
                        visited.add(neighbor)
                        next_frontier.append(neighbor)
                frontier = next_frontier
            return False`;

const bfsSolutions: Record<number, SolutionFollowUp> = {
  684: {
    title: 'BFS (build graph first)',
    approach: 'Build the complete undirected graph first. Check edges from last to first. For each candidate [a, b], run BFS from a while ignoring that edge in both directions. If BFS still reaches b, another path connects the endpoints, so the candidate can be removed. Reverse order gives the last valid edge in the input.',
    code: `class Solution:
    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:
        from collections import deque

        graph = [[] for _ in range(len(edges) + 1)]

        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        for i in range(len(edges) - 1, -1, -1):
            a, b = edges[i]
            queue = deque([a])
            visited = {a}

            while queue:
                node = queue.popleft()

                if node == b:
                    return [a, b]

                for neighbor in graph[node]:
                    # Ignore the candidate edge in both directions.
                    if ((node == a and neighbor == b) or
                            (node == b and neighbor == a)):
                        continue

                    if neighbor in visited:
                        continue

                    visited.add(neighbor)
                    queue.append(neighbor)

        return []`,
    jsCode: `var findRedundantConnection = function(edges) {
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
                // Ignore the candidate edge in both directions.
                if (
                    (node === a && neighbor === b) ||
                    (node === b && neighbor === a)
                ) continue;

                if (visited.has(neighbor)) continue;

                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return [];
};`,
    explanation: '1. Add every input edge to both adjacency lists before starting any BFS.\n2. Try candidates from the last input edge to the first, using a fresh queue and visited set for each search.\n3. Skip the candidate edge in both directions without changing the stored graph. Otherwise BFS could take that edge directly and incorrectly accept it.\n4. Mark neighbors before enqueueing. If BFS reaches b through other edges, [a, b] belongs to the cycle and can be removed.\n5. If the queue empties first, removing that candidate would disconnect the graph, so try the previous edge. Reverse order ensures the first success is the last removable edge in the input. For [[1,2], [1,3], [2,3]], ignoring [2,3] still allows 2 → 1 → 3.',
    timeComplexity: 'Python: O(V^2) with deque. JavaScript: O(V^3) worst case counting array shift() costs. This problem has E = V.',
    spaceComplexity: 'O(V + E) for the graph and BFS state; O(V) here because E = V',
  },
  721: {
    title: 'BFS over email connections',
    approach: 'Treat emails as nodes. Connect every email in an account to that account’s first email. Accounts sharing an email become one connected component. Run BFS to collect each component, sort its emails, and attach the owner’s name.',
    code: `class Solution:
    def accountsMerge(self, accounts: list[list[str]]) -> list[list[str]]:
        graph = {}
        email_to_name = {}

        for account in accounts:
            name = account[0]
            first_email = account[1]
            for email in account[1:]:
                if email not in graph:
                    graph[email] = set()
                email_to_name[email] = name
                if email != first_email:
                    graph[first_email].add(email)
                    graph[email].add(first_email)

        visited = set()
        result = []
        for start in graph:
            if start in visited:
                continue

            visited.add(start)
            frontier = [start]
            emails = []
            while frontier:
                next_frontier = []
                for email in frontier:
                    emails.append(email)
                    for neighbor in graph[email]:
                        if neighbor in visited:
                            continue
                        visited.add(neighbor)
                        next_frontier.append(neighbor)
                frontier = next_frontier

            emails.sort()
            result.append([email_to_name[start]] + emails)
        return result`,
    jsCode: `var accountsMerge = function(accounts) {
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
};`,
    explanation: '1. Connect emails within each account in both directions. Using the first email as a hub is enough to connect the account.\n2. Shared names alone do not connect accounts; shared emails do.\n3. Each unvisited email starts a BFS for one merged account. Process one frontier at a time and mark neighbors before scheduling them.\n4. Collect each distinct email once, sort the component, and prefix the owner’s name.\n5. Keep accounts without shared email connections separate.',
    timeComplexity: 'O(T + U log U), for T email occurrences and U unique emails (excluding string-comparison cost)',
    spaceComplexity: 'O(T + U) for the graph and traversal state',
  },
  1584: {
    title: 'Kruskal with BFS connectivity',
    approach: 'Generate and sort candidate edges by Manhattan distance. Use BFS on the accepted connections to check whether a candidate would create a cycle. Accept the cheapest edges that join separate components. BFS checks connectivity; Kruskal’s cost ordering is what makes the total minimum.',
    code: `class Solution:
    def minCostConnectPoints(self, points: list[list[int]]) -> int:
        n = len(points)
        graph = [[] for _ in range(n)]

${pythonConnected}

        edges = []
        for a in range(n):
            for b in range(a + 1, n):
                distance = abs(points[a][0] - points[b][0]) + abs(points[a][1] - points[b][1])
                edges.append((distance, a, b))
        edges.sort()

        total_cost = 0
        edges_used = 0
        for distance, a, b in edges:
            if connected(graph, a, b):
                continue
            graph[a].append(b)
            graph[b].append(a)
            total_cost += distance
            edges_used += 1
            if edges_used == n - 1:
                break
        return total_cost`,
    jsCode: `var minCostConnectPoints = function(points) {
    const n = points.length;
    const graph = Array(n)
        .fill(null)
        .map(() => []);

${jsConnected}

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
};`,
    explanation: '1. Start with isolated points and compute candidate edge costs.\n2. Sort candidates from cheapest to most expensive. Plain BFS alone does not solve a weighted minimum spanning tree problem.\n3. Before accepting an edge, BFS searches the current forest. Skip the edge if its endpoints are already connected.\n4. Otherwise, connect its endpoints and add its cost.\n5. Stop after n - 1 accepted edges. The union-find version below speeds up repeated connectivity checks.',
    timeComplexity: 'O(n^3) worst case: O(n^2 log n) sorting plus O(n) BFS for each candidate edge',
    spaceComplexity: 'O(n^2) for candidate edges',
  },
  1489: {
    title: 'Kruskal with BFS connectivity',
    approach: 'Compute a minimum spanning tree using sorted edges and BFS cycle checks. Repeat after excluding each edge, then after forcing it into the tree. An edge is critical if excluding it raises the minimum cost or disconnects the graph; otherwise it is pseudo-critical if forcing it preserves the minimum cost.',
    code: `class Solution:
    def findCriticalAndPseudoCriticalEdges(self, n: int, edges: list[list[int]]) -> list[list[int]]:
        indexed_edges = sorted((w, a, b, i) for i, (a, b, w) in enumerate(edges))

${pythonConnected}

        def mst_weight(include=None, exclude=None):
            graph = [[] for _ in range(n)]
            weight = 0
            count = 0
            if include is not None:
                cost, a, b, _ = include
                graph[a].append(b)
                graph[b].append(a)
                weight += cost
                count += 1

            for cost, a, b, index in indexed_edges:
                if index == exclude:
                    continue
                if connected(graph, a, b):
                    continue
                graph[a].append(b)
                graph[b].append(a)
                weight += cost
                count += 1

            return weight if count == n - 1 else float('inf')

        base = mst_weight()
        critical = []
        pseudo = []
        for edge in indexed_edges:
            index = edge[3]
            if mst_weight(exclude=index) > base:
                critical.append(index)
            elif mst_weight(include=edge) == base:
                pseudo.append(index)
        return [critical, pseudo]`,
    jsCode: `var findCriticalAndPseudoCriticalEdges = function(n, edges) {
    const indexedEdges = edges.map(([a, b, cost], index) => [cost, a, b, index]);
    indexedEdges.sort((a, b) => a[0] - b[0]);

${jsConnected}

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
};`,
    explanation: '1. Keep each edge’s original index before sorting by weight.\n2. Each MST trial starts with a fresh empty graph. Accept an edge only if BFS cannot already connect its endpoints.\n3. Excluding an edge makes it critical when the best remaining tree costs more, including Infinity for a disconnected graph.\n4. For a noncritical edge, insert it before the sorted scan and test whether an equally cheap tree remains possible.\n5. The included edge is naturally skipped when encountered again because its endpoints are already connected. BFS handles connectivity; sorted Kruskal choices handle minimum weight.',
    timeComplexity: 'O(E^2 * V + E log E): O(E) MST trials, each with O(E) BFS checks on a forest',
    spaceComplexity: 'O(V + E)',
  },
  2709: {
    title: 'BFS over shared-prime connections',
    approach: 'Connect indices that share a prime factor, then BFS from index 0. For each prime, connect later indices to the first index with that factor; this connects the whole group without comparing every pair. Use BFS layers so large inputs do not require repeated array-front removals.',
    code: `class Solution:
    def canTraverseAllPairs(self, nums: list[int]) -> bool:
        n = len(nums)
        graph = [set() for _ in range(n)]
        first_index = {}

        def connect_factor(index, prime):
            if prime not in first_index:
                first_index[prime] = index
                return
            other = first_index[prime]
            graph[index].add(other)
            graph[other].add(index)

        for index, value in enumerate(nums):
            remaining = value
            divisor = 2
            while divisor * divisor <= remaining:
                if remaining % divisor == 0:
                    connect_factor(index, divisor)
                    while remaining % divisor == 0:
                        remaining //= divisor
                divisor += 1
            if remaining > 1:
                connect_factor(index, remaining)

        visited = {0}
        frontier = [0]
        while frontier:
            next_frontier = []
            for node in frontier:
                for neighbor in graph[node]:
                    if neighbor in visited:
                        continue
                    visited.add(neighbor)
                    next_frontier.append(neighbor)
            frontier = next_frontier
        return len(visited) == n`,
    jsCode: `var canTraverseAllPairs = function(nums) {
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
};`,
    explanation: '1. Two values have gcd greater than 1 exactly when they share a prime factor.\n2. For each prime, keep the first index containing it. Connect every later index containing that prime to the first one. A star connects the group without constructing every possible pair.\n3. Remove all copies of a factor before continuing; a remaining value greater than 1 is also a prime factor.\n4. BFS visits the resulting sparse graph one frontier at a time, marking neighbors before scheduling them.\n5. Return whether all indices were visited. A single value (even 1) returns true; a 1 among several values remains isolated.',
    timeComplexity: 'O(n * sqrt(M) + F), for M = max(nums) and F total distinct-prime occurrences',
    spaceComplexity: 'O(n + F) for the sparse graph, factor map, and BFS state',
  },
};

export function withBfsFirst(solution: ProblemSolution): ProblemSolution {
  const previousBfs = [323,1462].includes(solution.id) ? solution.followUp : undefined;
  const bfs = previousBfs || bfsSolutions[solution.id];
  if (!bfs) return solution;
  const floyd = solution.id === 1462;
  const optimized: SolutionFollowUp = {
    title: floyd ? 'Floyd-Warshall (reachability table)' : [1489,1584].includes(solution.id) ? 'Kruskal with union-find and path compression' : 'Union-find with path compression',
    label: floyd ? 'Alternative' : 'Optimized',
    walkthroughVariant: floyd ? 'floyd-warshall' : 'union-find',
    approach: floyd ? 'Build a reachability table with Floyd-Warshall, then answer each query with a table lookup.' : solution.approach,
    code: solution.code,
    jsCode: solution.jsCode,
    jsWalkthrough: solution.jsWalkthrough,
    explanation: solution.explanation,
    timeComplexity: solution.timeComplexity,
    spaceComplexity: solution.spaceComplexity,
  };
  // These originals use path compression without rank/size balancing. Use
  // conservative bounds and include Accounts Merge's required sorting work.
  if(solution.id===323)optimized.timeComplexity='O(n + E log n) amortized with path compression';
  if(solution.id===721)optimized.timeComplexity='O(T log U + U log U), including sorting, for T email occurrences and U unique emails';
  if(solution.id===1489)optimized.timeComplexity='O(E^2 log V + E log E) amortized with path compression';
  if(solution.id===2709)optimized.timeComplexity='O(n * sqrt(M) + F log n), for M = max(nums) and F total distinct-prime occurrences';
  return {
    ...solution,
    solutionTitle: bfs.title,
    intuition: bfs.approach,
    approach: bfs.approach,
    code: bfs.code,
    jsCode: bfs.jsCode,
    jsWalkthrough: bfs.jsWalkthrough,
    explanation: bfs.explanation,
    timeComplexity: bfs.timeComplexity,
    spaceComplexity: bfs.spaceComplexity,
    hints: solution.id===684 ? ['Build the full graph, then check candidate edges from last to first.', 'During BFS, ignore the candidate edge in both directions without removing it from the graph.', 'If its endpoints remain connected through another path, that edge can be removed.'] : [bfs.approach, 'Mark a node when scheduling it so repeated paths cannot schedule it again.', floyd ? 'Each start course needs its own reachability row.' : 'Union-find with path compression speeds up repeated connectivity checks in the version below.'],
    followUp: optimized,
  };
}

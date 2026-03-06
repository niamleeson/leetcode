import { ProblemSolution } from './types';

export const solutions: ProblemSolution[] = [
  // ---------------------------------------------------------------------------
  // 792. Number of Matching Subsequences
  // ---------------------------------------------------------------------------
  {
    id: 792,
    description:
      'Given a string s and an array of strings words, return the number of words[i] that is a subsequence of s. A subsequence is a sequence derived from another by deleting some or no elements without changing the order of the remaining elements.',
    examples:
      'Input: s = "abcde", words = ["a","bb","acd","ace"]\nOutput: 3\nExplanation: "a", "acd", "ace" are subsequences of "abcde".',
    intuition:
      'Instead of checking each word against s one by one, imagine all words waiting in line for their next needed letter. As you read through s character by character, you advance all the words that need that character simultaneously - like a conveyor belt sorting packages by their labels.',
    approach:
      'Use a bucket approach where each word is represented by an iterator tracking its next needed character. Group words by their current needed character. As we scan through s, advance matching iterators to their next character.',
    code: `class Solution:
    def numMatchingSubseq(self, s: str, words: list[str]) -> int:
        import collections
        waiting = collections.defaultdict(list)
        for word in words:
            waiting[word[0]].append(iter(word[1:]))
        count = 0
        for c in s:
            advancing = waiting[c]
            waiting[c] = []
            for it in advancing:
                nxt = next(it, None)
                if nxt is None:
                    count += 1
                else:
                    waiting[nxt].append(it)
        return count`,
    jsCode: `var numMatchingSubseq = function(s, words) {
    const waiting = {};
    for (const word of words) {
        const first = word[0];
        if (!waiting[first]) waiting[first] = [];
        waiting[first].push({ word, idx: 1 });
    }
    let count = 0;
    for (const c of s) {
        const advancing = waiting[c] || [];
        waiting[c] = [];
        for (const item of advancing) {
            if (item.idx === item.word.length) {
                count++;
            } else {
                const nxt = item.word[item.idx];
                if (!waiting[nxt]) waiting[nxt] = [];
                waiting[nxt].push({ word: item.word, idx: item.idx + 1 });
            }
        }
    }
    return count;
};`,
    explanation:
      '1. Create buckets keyed by the next character each word needs.\n' +
      '2. Initially, each word iterator is placed in the bucket of its first character.\n' +
      '3. For each character c in s, take all iterators waiting for c and advance them.\n' +
      '4. If an iterator is exhausted, the word is a complete subsequence; increment count.\n' +
      '5. Otherwise, move the iterator to the bucket of its next needed character.',
    timeComplexity: 'O(n + sum of word lengths)',
    spaceComplexity: 'O(number of words)',
    hints: [
      'A brute-force check for each word against s is O(words * |s|). Can you process all words simultaneously?',
      'Think of each word as a pointer that advances when it sees the character it needs.',
      'Group word pointers by their current needed character and process them as you scan s.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 796. Rotate String
  // ---------------------------------------------------------------------------
  {
    id: 796,
    description:
      'Given two strings s and goal, return true if and only if s can become goal after some number of shifts on s. A shift on s consists of moving the leftmost character to the rightmost position.',
    examples:
      'Input: s = "abcde", goal = "cdeab"\nOutput: true\nExplanation: After 2 shifts, "abcde" becomes "cdeab".',
    intuition:
      'Imagine gluing two copies of the string end to end. Every possible rotation of the original string appears as a contiguous piece within this doubled string. So checking if goal is a rotation is just checking if it appears inside s+s.',
    approach:
      'Concatenate s with itself. If goal is a substring of s+s and both have the same length, then goal is a valid rotation of s.',
    code: `class Solution:
    def rotateString(self, s: str, goal: str) -> bool:
        return len(s) == len(goal) and goal in s + s`,
    jsCode: `var rotateString = function(s, goal) {
    return s.length === goal.length && (s + s).includes(goal);
};`,
    explanation:
      '1. If lengths differ, goal cannot be a rotation of s.\n' +
      '2. Concatenating s with itself (s+s) contains every possible rotation as a substring.\n' +
      '3. We simply check if goal appears in s+s.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'What happens if you concatenate s with itself?',
      'Every rotation of s is a substring of s+s.',
      'Don\'t forget to check that the lengths are equal first.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 797. All Paths From Source to Target
  // ---------------------------------------------------------------------------
  {
    id: 797,
    description:
      'Given a directed acyclic graph (DAG) of n nodes labeled from 0 to n-1, find all possible paths from node 0 to node n-1. Return the paths in any order. The graph is given as an adjacency list where graph[i] is a list of all nodes you can visit from node i.',
    examples:
      'Input: graph = [[1,2],[3],[3],[]]\nOutput: [[0,1,3],[0,2,3]]\nExplanation: There are two paths: 0->1->3 and 0->2->3.',
    intuition:
      'Since the graph has no cycles (it is a DAG), every path you explore will eventually end. You can freely explore all possible routes from start to finish using DFS backtracking without worrying about getting stuck in loops.',
    approach:
      'Use DFS/backtracking starting from node 0. At each node, explore all neighbors. When we reach node n-1, add the current path to results. Since it is a DAG, no cycle detection is needed.',
    code: `class Solution:
    def allPathsSourceTarget(self, graph: list[list[int]]) -> list[list[int]]:
        target = len(graph) - 1
        result = []
        def dfs(node, path):
            if node == target:
                result.append(path[:])
                return
            for nei in graph[node]:
                path.append(nei)
                dfs(nei, path)
                path.pop()
        dfs(0, [0])
        return result`,
    jsCode: `var allPathsSourceTarget = function(graph) {
    const target = graph.length - 1;
    const result = [];
    const dfs = (node, path) => {
        if (node === target) {
            result.push([...path]);
            return;
        }
        for (const nei of graph[node]) {
            path.push(nei);
            dfs(nei, path);
            path.pop();
        }
    };
    dfs(0, [0]);
    return result;
};`,
    explanation:
      '1. The target node is n-1 (last index).\n' +
      '2. Start DFS from node 0 with path = [0].\n' +
      '3. At each node, iterate over its neighbors, add the neighbor to the path, and recurse.\n' +
      '4. When we reach the target, save a copy of the current path.\n' +
      '5. Backtrack by popping the last node after returning from recursion.',
    timeComplexity: 'O(2^n * n) in the worst case',
    spaceComplexity: 'O(n) for recursion depth, O(2^n * n) for all paths',
    hints: [
      'This is a DAG, so you can use DFS without worrying about cycles.',
      'Use backtracking: add a node, recurse, then remove it.',
      'Remember to copy the path when you reach the target node.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 802. Find Eventual Safe States
  // ---------------------------------------------------------------------------
  {
    id: 802,
    description:
      'There is a directed graph of n nodes with each node labeled from 0 to n-1. A node is a terminal node if there are no outgoing edges. A node is a safe node if every possible path starting from that node leads to a terminal node. Return an array of all the safe nodes sorted in ascending order.',
    examples:
      'Input: graph = [[1,2],[2,3],[5],[0],[5],[],[]]\nOutput: [2,4,5,6]\nExplanation: Nodes 5 and 6 are terminal. Node 2 leads to 5. Node 4 leads to 5.',
    intuition:
      'A node is safe if no matter which path you take from it, you never get stuck in a loop. The key insight is that cycle detection tells us everything: if a node can reach a cycle, it is unsafe. Three-color DFS lets us mark nodes as safe (no cycles reachable) or unsafe (part of or leads to a cycle).',
    approach:
      'Use a three-color DFS cycle detection. White (unvisited), Gray (in current path), Black (safe). A node is unsafe if it is part of or leads to a cycle. After DFS, all black nodes are safe.',
    code: `class Solution:
    def eventualSafeNodes(self, graph: list[list[int]]) -> list[int]:
        n = len(graph)
        color = [0] * n  # 0=white, 1=gray, 2=black
        def dfs(node):
            if color[node] != 0:
                return color[node] == 2
            color[node] = 1
            for nei in graph[node]:
                if not dfs(nei):
                    return False
            color[node] = 2
            return True
        return [i for i in range(n) if dfs(i)]`,
    jsCode: `var eventualSafeNodes = function(graph) {
    const n = graph.length;
    const color = new Array(n).fill(0); // 0=white, 1=gray, 2=black
    const dfs = (node) => {
        if (color[node] !== 0) return color[node] === 2;
        color[node] = 1;
        for (const nei of graph[node]) {
            if (!dfs(nei)) return false;
        }
        color[node] = 2;
        return true;
    };
    const result = [];
    for (let i = 0; i < n; i++) {
        if (dfs(i)) result.push(i);
    }
    return result;
};`,
    explanation:
      '1. Initialize all nodes as white (unvisited).\n' +
      '2. During DFS, mark the node gray (in progress).\n' +
      '3. If we encounter a gray node, there is a cycle, so it is unsafe.\n' +
      '4. If all neighbors are safe (black), mark the current node black.\n' +
      '5. Collect all black (safe) nodes in sorted order.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    hints: [
      'A node is unsafe if it can reach a cycle.',
      'Use three-color DFS: white=unvisited, gray=in current path (potential cycle), black=safe.',
      'If DFS from a node finds all paths lead to terminal/black nodes, mark it black.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 809. Expressive Words
  // ---------------------------------------------------------------------------
  {
    id: 809,
    description:
      'Sometimes people repeat letters to represent extra feeling. We define a word as stretchy if we can make the word equal to s by choosing a group of consecutive identical characters and extending it to have size 3 or more (if it already has size >= 3, any extension is allowed). Given a string s and a list of words, return the number of stretchy words.',
    examples:
      'Input: s = "heeellooo", words = ["hello","hi","helo"]\nOutput: 1\nExplanation: "hello" can be stretched to "heeellooo" but the others cannot.',
    intuition:
      'Think of both the target string and each candidate word as sequences of character groups (like \'hh\' or \'eee\'). The word can be stretched to match the target only if each group has the same character and the target group is either the same size or big enough (at least 3) to have been stretched.',
    approach:
      'For each word, use two pointers to compare groups of identical characters. A group in s can match a group in word if they have the same character, and either the counts are equal or the count in s is >= 3 and >= the count in word.',
    code: `class Solution:
    def expressiveWords(self, s: str, words: list[str]) -> int:
        def get_groups(w):
            groups = []
            i = 0
            while i < len(w):
                j = i
                while j < len(w) and w[j] == w[i]:
                    j += 1
                groups.append((w[i], j - i))
                i = j
            return groups

        def stretchy(word):
            g1 = get_groups(s)
            g2 = get_groups(word)
            if len(g1) != len(g2):
                return False
            for (c1, n1), (c2, n2) in zip(g1, g2):
                if c1 != c2:
                    return False
                if n1 < n2:
                    return False
                if n1 != n2 and n1 < 3:
                    return False
            return True

        return sum(stretchy(w) for w in words)`,
    jsCode: `var expressiveWords = function(s, words) {
    const getGroups = (w) => {
        const groups = [];
        let i = 0;
        while (i < w.length) {
            let j = i;
            while (j < w.length && w[j] === w[i]) j++;
            groups.push([w[i], j - i]);
            i = j;
        }
        return groups;
    };
    const stretchy = (word) => {
        const g1 = getGroups(s);
        const g2 = getGroups(word);
        if (g1.length !== g2.length) return false;
        for (let i = 0; i < g1.length; i++) {
            const [c1, n1] = g1[i];
            const [c2, n2] = g2[i];
            if (c1 !== c2) return false;
            if (n1 < n2) return false;
            if (n1 !== n2 && n1 < 3) return false;
        }
        return true;
    };
    let count = 0;
    for (const w of words) {
        if (stretchy(w)) count++;
    }
    return count;
};`,
    explanation:
      '1. Break both s and each word into groups of consecutive identical characters.\n' +
      '2. Both must have the same number of groups with matching characters.\n' +
      '3. For each group pair, the count in s must be >= count in word.\n' +
      '4. If counts differ, the count in s must be at least 3 (stretching rule).\n' +
      '5. Count all words that satisfy these conditions.',
    timeComplexity: 'O(n * k) where n is the number of words and k is the max word length',
    spaceComplexity: 'O(k)',
    hints: [
      'Break each string into runs of identical characters.',
      'Compare the runs: same character, and counts must be compatible.',
      'A run in s can be stretched only if its length is >= 3.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 814. Binary Tree Pruning
  // ---------------------------------------------------------------------------
  {
    id: 814,
    description:
      'Given the root of a binary tree, return the same tree where every subtree not containing a 1 has been removed. A subtree of a node is the node plus every node that is a descendant of that node.',
    examples:
      'Input: root = [1,null,0,0,1]\nOutput: [1,null,0,null,1]\nExplanation: The left child of the right subtree has value 0 and no children with 1, so it is pruned.',
    intuition:
      'Process the tree from the bottom up (post-order). After you have cleaned up a node\'s children, if the node itself is 0 and has no remaining children, it is dead weight and can be removed. Think of it like pruning dead branches from a plant - start at the tips and work inward.',
    approach:
      'Use post-order DFS. For each node, recursively prune left and right subtrees. If a node has value 0 and both children are None after pruning, return None to prune it.',
    code: `class Solution:
    def pruneTree(self, root):
        if not root:
            return None
        root.left = self.pruneTree(root.left)
        root.right = self.pruneTree(root.right)
        if root.val == 0 and not root.left and not root.right:
            return None
        return root`,
    jsCode: `var pruneTree = function(root) {
    if (!root) return null;
    root.left = pruneTree(root.left);
    root.right = pruneTree(root.right);
    if (root.val === 0 && !root.left && !root.right) return null;
    return root;
};`,
    explanation:
      '1. Base case: if the node is None, return None.\n' +
      '2. Recursively prune the left subtree and the right subtree.\n' +
      '3. After pruning children, if the current node is 0 and has no children, prune it by returning None.\n' +
      '4. Otherwise, return the node as-is.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is the height of the tree',
    hints: [
      'Think about bottom-up processing. What order of traversal helps?',
      'Post-order traversal lets you decide about a node after processing its children.',
      'A node should be removed if its value is 0 and both subtrees are empty.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 815. Bus Routes
  // ---------------------------------------------------------------------------
  {
    id: 815,
    description:
      'You are given an array routes where routes[i] is a bus route that the ith bus repeats forever. You will start at bus stop source and want to go to bus stop target. Return the least number of buses you must take to travel from source to target. Return -1 if it is not possible.',
    examples:
      'Input: routes = [[1,2,7],[3,6,7]], source = 1, target = 6\nOutput: 2\nExplanation: Take bus 0 from stop 1 to stop 7, then bus 1 from stop 7 to stop 6.',
    intuition:
      'Instead of thinking about individual bus stops, think about bus routes as nodes in a graph. Two routes are connected if they share a stop. The problem becomes finding the shortest path between routes, which BFS handles perfectly - each level of BFS is one bus ride.',
    approach:
      'Use BFS on bus routes rather than individual stops. Build a mapping from each stop to the routes that serve it. Start BFS from all routes containing the source stop, and expand to neighboring routes that share a stop.',
    code: `class Solution:
    def numBusesToDestination(self, routes: list[list[int]], source: int, target: int) -> int:
        if source == target:
            return 0
        from collections import defaultdict, deque
        stop_to_routes = defaultdict(set)
        for i, route in enumerate(routes):
            for stop in route:
                stop_to_routes[stop].add(i)
        queue = deque()
        visited_routes = set()
        visited_stops = {source}
        for r in stop_to_routes[source]:
            queue.append((r, 1))
            visited_routes.add(r)
        while queue:
            route_idx, buses = queue.popleft()
            for stop in routes[route_idx]:
                if stop == target:
                    return buses
                if stop not in visited_stops:
                    visited_stops.add(stop)
                    for next_route in stop_to_routes[stop]:
                        if next_route not in visited_routes:
                            visited_routes.add(next_route)
                            queue.append((next_route, buses + 1))
        return -1`,
    jsCode: `var numBusesToDestination = function(routes, source, target) {
    if (source === target) return 0;
    const stopToRoutes = new Map();
    for (let i = 0; i < routes.length; i++) {
        for (const stop of routes[i]) {
            if (!stopToRoutes.has(stop)) stopToRoutes.set(stop, new Set());
            stopToRoutes.get(stop).add(i);
        }
    }
    const queue = [];
    const visitedRoutes = new Set();
    const visitedStops = new Set([source]);
    for (const r of (stopToRoutes.get(source) || [])) {
        queue.push([r, 1]);
        visitedRoutes.add(r);
    }
    let idx = 0;
    while (idx < queue.length) {
        const [routeIdx, buses] = queue[idx++];
        for (const stop of routes[routeIdx]) {
            if (stop === target) return buses;
            if (!visitedStops.has(stop)) {
                visitedStops.add(stop);
                for (const nextRoute of (stopToRoutes.get(stop) || [])) {
                    if (!visitedRoutes.has(nextRoute)) {
                        visitedRoutes.add(nextRoute);
                        queue.push([nextRoute, buses + 1]);
                    }
                }
            }
        }
    }
    return -1;
};`,
    explanation:
      '1. Map each stop to the set of routes that include it.\n' +
      '2. Start BFS from all routes that serve the source stop (cost = 1 bus).\n' +
      '3. For each route, check all its stops. If we reach the target, return the bus count.\n' +
      '4. For unvisited stops, enqueue their unvisited routes with cost + 1.\n' +
      '5. If BFS exhausts without finding target, return -1.',
    timeComplexity: 'O(sum of all route lengths)',
    spaceComplexity: 'O(sum of all route lengths)',
    hints: [
      'BFS on individual stops can be too slow. Think at the route level.',
      'Two routes are connected if they share at least one stop.',
      'Build a stop-to-routes mapping and BFS over routes.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 827. Making A Large Island
  // ---------------------------------------------------------------------------
  {
    id: 827,
    description:
      'You are given an n x n binary grid. You are allowed to change at most one 0 to a 1. Return the size of the largest island in grid after applying this operation. An island is a 4-directionally connected group of 1s.',
    examples:
      'Input: grid = [[1,0],[0,1]]\nOutput: 3\nExplanation: Change one 0 to 1 and connect two islands.',
    intuition:
      'First, label and measure every existing island. Then for each water cell, imagine flipping it to land - it could bridge multiple neighboring islands together. By pre-computing island sizes, checking each water cell takes constant time instead of re-exploring the grid.',
    approach:
      'First, label each island with a unique id and record its size using DFS/BFS. Then for each 0 cell, check its 4 neighbors, collect the unique island ids and sum their sizes plus 1. Return the maximum.',
    code: `class Solution:
    def largestIsland(self, grid: list[list[int]]) -> int:
        n = len(grid)
        island_id = 2
        size = {}

        def dfs(r, c, iid):
            if r < 0 or r >= n or c < 0 or c >= n or grid[r][c] != 1:
                return 0
            grid[r][c] = iid
            return 1 + dfs(r+1,c,iid) + dfs(r-1,c,iid) + dfs(r,c+1,iid) + dfs(r,c-1,iid)

        for r in range(n):
            for c in range(n):
                if grid[r][c] == 1:
                    size[island_id] = dfs(r, c, island_id)
                    island_id += 1

        if not size:
            return 1
        ans = max(size.values())
        for r in range(n):
            for c in range(n):
                if grid[r][c] == 0:
                    seen = set()
                    total = 1
                    for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                        nr, nc = r+dr, c+dc
                        if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] > 1 and grid[nr][nc] not in seen:
                            seen.add(grid[nr][nc])
                            total += size[grid[nr][nc]]
                    ans = max(ans, total)
        return ans`,
    jsCode: `var largestIsland = function(grid) {
    const n = grid.length;
    let islandId = 2;
    const size = {};
    const dfs = (r, c, iid) => {
        if (r < 0 || r >= n || c < 0 || c >= n || grid[r][c] !== 1) return 0;
        grid[r][c] = iid;
        return 1 + dfs(r+1,c,iid) + dfs(r-1,c,iid) + dfs(r,c+1,iid) + dfs(r,c-1,iid);
    };
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (grid[r][c] === 1) {
                size[islandId] = dfs(r, c, islandId);
                islandId++;
            }
        }
    }
    if (Object.keys(size).length === 0) return 1;
    let ans = Math.max(...Object.values(size));
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (grid[r][c] === 0) {
                const seen = new Set();
                let total = 1;
                for (const [dr, dc] of dirs) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] > 1 && !seen.has(grid[nr][nc])) {
                        seen.add(grid[nr][nc]);
                        total += size[grid[nr][nc]];
                    }
                }
                ans = Math.max(ans, total);
            }
        }
    }
    return ans;
};`,
    explanation:
      '1. Use DFS to label each island with a unique id (starting from 2) and record each island size.\n' +
      '2. For each 0 cell, look at its 4 neighbors and collect distinct island ids.\n' +
      '3. The potential island size is 1 (flipping the 0) plus the sum of neighboring island sizes.\n' +
      '4. Track the maximum across all 0 cells and the existing largest island.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'First, identify and measure all existing islands.',
      'For each 0, check which distinct islands are adjacent.',
      'Sum adjacent island sizes + 1 for the flipped cell.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 838. Push Dominoes
  // ---------------------------------------------------------------------------
  {
    id: 838,
    description:
      'There are n dominoes in a line, and we push some of them to the left or right. Each second, a domino falling left pushes the adjacent domino to the left, and similarly for right. If a domino has forces from both sides simultaneously, it stays still. Given a string dominoes with characters L, R, and . determine the final state.',
    examples:
      'Input: dominoes = ".L.R...LR..L.."\nOutput: "LL.RR.LLRRLL.."',
    intuition:
      'Imagine each pushed domino exerts a force that weakens with distance, like gravity. Do two passes: one tracks rightward force, the other tracks leftward force. Where forces collide equally, the domino stays upright. The stronger force wins everywhere else.',
    approach:
      'Assign forces to each domino using two passes. In a left-to-right pass, accumulate rightward force (decreasing with distance). In a right-to-left pass, accumulate leftward force. The net force determines the final state of each domino.',
    code: `class Solution:
    def pushDominoes(self, dominoes: str) -> str:
        n = len(dominoes)
        forces = [0] * n
        f = 0
        for i in range(n):
            if dominoes[i] == 'R':
                f = n
            elif dominoes[i] == 'L':
                f = 0
            else:
                f = max(f - 1, 0)
            forces[i] += f
        f = 0
        for i in range(n - 1, -1, -1):
            if dominoes[i] == 'L':
                f = n
            elif dominoes[i] == 'R':
                f = 0
            else:
                f = max(f - 1, 0)
            forces[i] -= f
        result = []
        for f in forces:
            if f > 0:
                result.append('R')
            elif f < 0:
                result.append('L')
            else:
                result.append('.')
        return ''.join(result)`,
    jsCode: `var pushDominoes = function(dominoes) {
    const n = dominoes.length;
    const forces = new Array(n).fill(0);
    let f = 0;
    for (let i = 0; i < n; i++) {
        if (dominoes[i] === 'R') f = n;
        else if (dominoes[i] === 'L') f = 0;
        else f = Math.max(f - 1, 0);
        forces[i] += f;
    }
    f = 0;
    for (let i = n - 1; i >= 0; i--) {
        if (dominoes[i] === 'L') f = n;
        else if (dominoes[i] === 'R') f = 0;
        else f = Math.max(f - 1, 0);
        forces[i] -= f;
    }
    return forces.map(f => f > 0 ? 'R' : f < 0 ? 'L' : '.').join('');
};`,
    explanation:
      '1. Left-to-right pass: when we see R, set force to n. Force decreases by 1 each step, reset to 0 on L.\n' +
      '2. Right-to-left pass: when we see L, set force to n. Force decreases by 1 each step, reset to 0 on R.\n' +
      '3. Subtract leftward forces from rightward forces at each position.\n' +
      '4. Positive net force means R, negative means L, zero means standing.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Consider the force each pushed domino exerts on its neighbors.',
      'Use two passes: one for rightward force, one for leftward force.',
      'Compare the net force at each position to determine its final state.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 841. Keys and Rooms
  // ---------------------------------------------------------------------------
  {
    id: 841,
    description:
      'There are n rooms labeled from 0 to n-1 and all rooms are locked except for room 0. Your goal is to visit all rooms. When you visit a room, you may find a set of distinct keys that allow you to visit other rooms. Return true if you can visit all rooms.',
    examples:
      'Input: rooms = [[1],[2],[3],[]]\nOutput: true\nExplanation: Visit room 0 -> get key 1 -> visit room 1 -> get key 2 -> visit room 2 -> get key 3 -> visit room 3.',
    intuition:
      'This is just graph reachability in disguise. Rooms are nodes, keys are edges. Starting from room 0, can you reach all other rooms? A simple DFS or BFS answers this directly.',
    approach:
      'Use BFS or DFS starting from room 0. Maintain a visited set. For each room visited, add all keys found to the queue/stack if not yet visited. At the end, check if all rooms were visited.',
    code: `class Solution:
    def canVisitAllRooms(self, rooms: list[list[int]]) -> bool:
        visited = set([0])
        stack = [0]
        while stack:
            room = stack.pop()
            for key in rooms[room]:
                if key not in visited:
                    visited.add(key)
                    stack.append(key)
        return len(visited) == len(rooms)`,
    jsCode: `var canVisitAllRooms = function(rooms) {
    const visited = new Set([0]);
    const stack = [0];
    while (stack.length > 0) {
        const room = stack.pop();
        for (const key of rooms[room]) {
            if (!visited.has(key)) {
                visited.add(key);
                stack.push(key);
            }
        }
    }
    return visited.size === rooms.length;
};`,
    explanation:
      '1. Start with room 0 in the visited set and stack.\n' +
      '2. Pop a room from the stack, iterate over its keys.\n' +
      '3. For each unvisited key (room), mark it visited and push it to the stack.\n' +
      '4. After the stack is empty, check if all rooms were visited.',
    timeComplexity: 'O(n + k) where k is total number of keys',
    spaceComplexity: 'O(n)',
    hints: [
      'This is essentially a graph reachability problem.',
      'Use DFS or BFS starting from room 0.',
      'Check if the number of visited rooms equals the total number of rooms.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 844. Backspace String Compare
  // ---------------------------------------------------------------------------
  {
    id: 844,
    description:
      'Given two strings s and t, return true if they are equal when both are typed into empty text editors. The character # means a backspace character. Note that after backspacing an empty text, the text will remain empty.',
    examples:
      'Input: s = "ab#c", t = "ad#c"\nOutput: true\nExplanation: Both become "ac".',
    intuition:
      'A stack perfectly simulates a text editor: push characters to type them, pop to backspace. Process both strings through this simulation and compare the final results.',
    approach:
      'Use a stack-based approach to build the final string for each input: push characters and pop on #. Compare the results. Alternatively, use O(1) space by iterating from the end with skip counters.',
    code: `class Solution:
    def backspaceCompare(self, s: str, t: str) -> bool:
        def build(string):
            stack = []
            for c in string:
                if c == '#':
                    if stack:
                        stack.pop()
                else:
                    stack.append(c)
            return ''.join(stack)
        return build(s) == build(t)`,
    jsCode: `var backspaceCompare = function(s, t) {
    const build = (str) => {
        const stack = [];
        for (const c of str) {
            if (c === '#') { if (stack.length) stack.pop(); }
            else stack.push(c);
        }
        return stack.join('');
    };
    return build(s) === build(t);
};`,
    explanation:
      '1. For each string, iterate through characters.\n' +
      '2. If the character is #, pop from stack (if non-empty) to simulate backspace.\n' +
      '3. Otherwise, push the character onto the stack.\n' +
      '4. Compare the final built strings from both inputs.',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(n + m)',
    hints: [
      'Use a stack to simulate typing with backspaces.',
      'When you see #, pop the last character from the stack.',
      'For O(1) space, iterate from the end and count skips.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 846. Hand of Straights
  // ---------------------------------------------------------------------------
  {
    id: 846,
    description:
      'Alice has some cards in her hand. She wants to rearrange the cards into groups so that each group is of size groupSize and consists of groupSize consecutive cards. Return true if she can, or false otherwise.',
    examples:
      'Input: hand = [1,2,3,6,2,3,4,7,8], groupSize = 3\nOutput: true\nExplanation: Groups: [1,2,3], [2,3,4], [6,7,8].',
    intuition:
      'Always start groups with the smallest available card - this is greedy and optimal because larger cards cannot help complete smaller groups. If at any point a needed consecutive card is missing, it is impossible.',
    approach:
      'Sort the cards and use a counter. For each smallest available card, try to form a group of consecutive cards of the required size. Decrement counts accordingly. If any card is missing, return false.',
    code: `class Solution:
    def isNStraightHand(self, hand: list[int], groupSize: int) -> bool:
        from collections import Counter
        if len(hand) % groupSize != 0:
            return False
        count = Counter(hand)
        for card in sorted(count):
            while count[card] > 0:
                for i in range(groupSize):
                    if count[card + i] <= 0:
                        return False
                    count[card + i] -= 1
        return True`,
    jsCode: `var isNStraightHand = function(hand, groupSize) {
    if (hand.length % groupSize !== 0) return false;
    const count = new Map();
    for (const card of hand) count.set(card, (count.get(card) || 0) + 1);
    const sorted = [...count.keys()].sort((a, b) => a - b);
    for (const card of sorted) {
        while (count.get(card) > 0) {
            for (let i = 0; i < groupSize; i++) {
                if ((count.get(card + i) || 0) <= 0) return false;
                count.set(card + i, count.get(card + i) - 1);
            }
        }
    }
    return true;
};`,
    explanation:
      '1. If total cards is not divisible by groupSize, return false immediately.\n' +
      '2. Count occurrences of each card.\n' +
      '3. Iterate through sorted unique cards. For each card with remaining count, form a group.\n' +
      '4. A group needs groupSize consecutive cards starting from the current card.\n' +
      '5. If any needed card has 0 count, return false.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Sort the cards and always try to form a group starting from the smallest available card.',
      'Use a frequency counter to track available cards.',
      'If the total count is not divisible by groupSize, it is impossible.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 847. Shortest Path Visiting All Nodes
  // ---------------------------------------------------------------------------
  {
    id: 847,
    description:
      'You have an undirected, connected graph of n nodes labeled from 0 to n-1. Return the length of the shortest path that visits every node. You may start and stop at any node, revisit nodes, and reuse edges.',
    examples:
      'Input: graph = [[1,2,3],[0],[0],[0]]\nOutput: 4\nExplanation: One possible path is [1,0,2,0,3].',
    intuition:
      'Since you can revisit nodes, a regular shortest path approach would loop forever. The trick is encoding which nodes you have visited as a bitmask in your state. BFS on (current_node, visited_set) finds the shortest path that covers all nodes.',
    approach:
      'Use BFS with bitmask state (current_node, visited_mask). Start BFS from every node simultaneously. The first state where all bits are set is the answer.',
    code: `class Solution:
    def shortestPathLength(self, graph: list[list[int]]) -> int:
        from collections import deque
        n = len(graph)
        full_mask = (1 << n) - 1
        queue = deque()
        visited = set()
        for i in range(n):
            state = (i, 1 << i)
            queue.append((i, 1 << i, 0))
            visited.add(state)
        while queue:
            node, mask, dist = queue.popleft()
            if mask == full_mask:
                return dist
            for nei in graph[node]:
                new_mask = mask | (1 << nei)
                if (nei, new_mask) not in visited:
                    visited.add((nei, new_mask))
                    queue.append((nei, new_mask, dist + 1))
        return 0`,
    jsCode: `var shortestPathLength = function(graph) {
    const n = graph.length;
    const fullMask = (1 << n) - 1;
    const queue = [];
    const visited = new Set();
    for (let i = 0; i < n; i++) {
        const state = i + ',' + (1 << i);
        queue.push([i, 1 << i, 0]);
        visited.add(state);
    }
    let idx = 0;
    while (idx < queue.length) {
        const [node, mask, dist] = queue[idx++];
        if (mask === fullMask) return dist;
        for (const nei of graph[node]) {
            const newMask = mask | (1 << nei);
            const state = nei + ',' + newMask;
            if (!visited.has(state)) {
                visited.add(state);
                queue.push([nei, newMask, dist + 1]);
            }
        }
    }
    return 0;
};`,
    explanation:
      '1. State is (current_node, bitmask of visited nodes).\n' +
      '2. Initialize BFS from every node with its single-bit mask.\n' +
      '3. For each state, expand to neighbors updating the bitmask.\n' +
      '4. The first time we reach a state where all n bits are set, return the distance.\n' +
      '5. BFS guarantees this is the shortest path.',
    timeComplexity: 'O(n * 2^n)',
    spaceComplexity: 'O(n * 2^n)',
    hints: [
      'Use bitmask DP or BFS to track which nodes have been visited.',
      'State = (current node, set of visited nodes as bitmask).',
      'Start BFS from every node simultaneously.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 849. Maximize Distance to Closest Person
  // ---------------------------------------------------------------------------
  {
    id: 849,
    description:
      'You are given an array representing a row of seats where seats[i] = 1 means a person is sitting in seat i, and seats[i] = 0 means the seat is empty. There is at least one empty seat and one person. Return the maximum distance to the closest person if you choose the optimal empty seat.',
    examples:
      'Input: seats = [1,0,0,0,1,0,1]\nOutput: 2\nExplanation: Sit at seat 2 (distance 2 from persons at seats 0 and 4).',
    intuition:
      'The best seat is always either at the very start, the very end, or exactly in the middle of the widest gap between two occupied seats. You only need to find the largest gap and compute the midpoint distance.',
    approach:
      'Track the index of the last occupied seat. For each empty seat, compute its distance to the nearest occupied neighbor. Handle edge cases where the best seat is at the start or end of the row.',
    code: `class Solution:
    def maxDistToClosest(self, seats: list[int]) -> int:
        n = len(seats)
        prev = -1
        ans = 0
        for i in range(n):
            if seats[i] == 1:
                if prev == -1:
                    ans = i
                else:
                    ans = max(ans, (i - prev) // 2)
                prev = i
        ans = max(ans, n - 1 - prev)
        return ans`,
    jsCode: `var maxDistToClosest = function(seats) {
    const n = seats.length;
    let prev = -1;
    let ans = 0;
    for (let i = 0; i < n; i++) {
        if (seats[i] === 1) {
            if (prev === -1) ans = i;
            else ans = Math.max(ans, Math.floor((i - prev) / 2));
            prev = i;
        }
    }
    ans = Math.max(ans, n - 1 - prev);
    return ans;
};`,
    explanation:
      '1. Track the index of the previous person (prev), initially -1.\n' +
      '2. When prev is -1 and we find a person at index i, the best seat at the start has distance i.\n' +
      '3. Between two people at prev and i, the best seat is in the middle with distance (i-prev)//2.\n' +
      '4. After the last person, the best seat at the end has distance n-1-prev.\n' +
      '5. Return the maximum distance found.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The best seat is either at the ends or between two occupied seats.',
      'Between two people, the optimal seat is at the midpoint.',
      'At the edges, the distance is simply to the nearest person.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 852. Peak Index in a Mountain Array
  // ---------------------------------------------------------------------------
  {
    id: 852,
    description:
      'An array arr is a mountain array if arr.length >= 3, there exists some index i where arr[0] < arr[1] < ... < arr[i-1] < arr[i] > arr[i+1] > ... > arr[arr.length-1]. Given a mountain array, return the index of the peak element. You must solve it in O(log n) time.',
    examples:
      'Input: arr = [0,1,0]\nOutput: 1',
    intuition:
      'A mountain array is sorted ascending then descending. Binary search works because you can always tell which side of the peak you are on by comparing adjacent elements - if values are still increasing, the peak must be to the right.',
    approach:
      'Use binary search. If arr[mid] < arr[mid+1], the peak is to the right. Otherwise, the peak is at mid or to the left. Narrow the search space until you find the peak.',
    code: `class Solution:
    def peakIndexInMountainArray(self, arr: list[int]) -> int:
        lo, hi = 0, len(arr) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if arr[mid] < arr[mid + 1]:
                lo = mid + 1
            else:
                hi = mid
        return lo`,
    jsCode: `var peakIndexInMountainArray = function(arr) {
    let lo = 0, hi = arr.length - 1;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] < arr[mid + 1]) lo = mid + 1;
        else hi = mid;
    }
    return lo;
};`,
    explanation:
      '1. Binary search between lo=0 and hi=n-1.\n' +
      '2. If arr[mid] < arr[mid+1], we are on the ascending side, so the peak is at mid+1 or beyond.\n' +
      '3. Otherwise, mid could be the peak or the peak is to the left.\n' +
      '4. When lo == hi, we have found the peak index.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Linear scan works in O(n), but the problem asks for O(log n).',
      'Use binary search: compare mid with mid+1 to decide which half contains the peak.',
      'The peak is where the array transitions from increasing to decreasing.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 855. Exam Room
  // ---------------------------------------------------------------------------
  {
    id: 855,
    description:
      'There is an exam room with n seats in a single row, labeled from 0 to n-1. Implement the ExamRoom class: seat() finds and returns the seat that maximizes the distance to the closest person, and leave(p) indicates that the person at seat p will leave.',
    examples:
      'Input: ["ExamRoom","seat","seat","seat","seat","leave","seat"], [[10],[],[],[],[],[4],[]]\nOutput: [null,0,9,4,2,null,5]',
    intuition:
      'Think of occupied seats as dividing the row into segments. The best empty seat is in the middle of the widest segment, since that maximizes the minimum distance to the nearest person. The edges are special cases since they only have one neighbor.',
    approach:
      'Maintain a sorted list of occupied seats. When seating, find the largest gap between consecutive occupied seats (including edges 0 and n-1). Insert into the middle of the largest gap. For leave, simply remove the seat.',
    code: `class ExamRoom:
    def __init__(self, n: int):
        self.n = n
        self.seats = []

    def seat(self) -> int:
        if not self.seats:
            self.seats.append(0)
            return 0
        import bisect
        best_dist = self.seats[0]
        best_seat = 0
        for i in range(1, len(self.seats)):
            d = (self.seats[i] - self.seats[i-1]) // 2
            if d > best_dist:
                best_dist = d
                best_seat = self.seats[i-1] + d
        if self.n - 1 - self.seats[-1] > best_dist:
            best_seat = self.n - 1
        bisect.insort(self.seats, best_seat)
        return best_seat

    def leave(self, p: int) -> None:
        self.seats.remove(p)`,
    jsCode: `var ExamRoom = function(n) {
    this.n = n;
    this.seats = [];
};
ExamRoom.prototype.seat = function() {
    if (this.seats.length === 0) {
        this.seats.push(0);
        return 0;
    }
    let bestDist = this.seats[0];
    let bestSeat = 0;
    for (let i = 1; i < this.seats.length; i++) {
        const d = Math.floor((this.seats[i] - this.seats[i-1]) / 2);
        if (d > bestDist) {
            bestDist = d;
            bestSeat = this.seats[i-1] + d;
        }
    }
    if (this.n - 1 - this.seats[this.seats.length - 1] > bestDist) {
        bestSeat = this.n - 1;
    }
    // Insert in sorted position
    let idx = 0;
    while (idx < this.seats.length && this.seats[idx] < bestSeat) idx++;
    this.seats.splice(idx, 0, bestSeat);
    return bestSeat;
};
ExamRoom.prototype.leave = function(p) {
    const idx = this.seats.indexOf(p);
    this.seats.splice(idx, 1);
};`,
    explanation:
      '1. Maintain a sorted list of occupied seats.\n' +
      '2. For seat(): check the gap from 0 to the first person, gaps between consecutive people, and the gap from the last person to n-1.\n' +
      '3. The best seat is in the middle of the largest gap (or at edge 0 or n-1).\n' +
      '4. Use bisect.insort to maintain sorted order.\n' +
      '5. For leave(p): remove p from the sorted list.',
    timeComplexity: 'O(k) per operation where k is the number of occupied seats',
    spaceComplexity: 'O(k)',
    hints: [
      'Track occupied seats in sorted order.',
      'The best seat maximizes the minimum distance to any occupied neighbor.',
      'Check gaps between consecutive occupied seats and the two edges.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 856. Score of Parentheses
  // ---------------------------------------------------------------------------
  {
    id: 856,
    description:
      'Given a balanced parentheses string s, return the score. () has score 1. AB has score A+B. (A) has score 2*A.',
    examples:
      'Input: s = "(()(()))"\nOutput: 6\nExplanation: Score = 2*(1 + 2*1) = 2*3 = 6.',
    intuition:
      'The stack tracks your current nesting depth. An empty pair () is worth 1 point. Wrapping something in parentheses doubles its score. The stack naturally handles these nested multiplications as you go deeper and come back out.',
    approach:
      'Use a stack to track scores at each depth. When seeing (, push a new scope. When seeing ), pop the scope, compute the score (max(2*inner, 1)), and add it to the parent scope.',
    code: `class Solution:
    def scoreOfParentheses(self, s: str) -> int:
        stack = [0]
        for c in s:
            if c == '(':
                stack.append(0)
            else:
                inner = stack.pop()
                stack[-1] += max(2 * inner, 1)
        return stack[0]`,
    jsCode: `var scoreOfParentheses = function(s) {
    const stack = [0];
    for (const c of s) {
        if (c === '(') {
            stack.push(0);
        } else {
            const inner = stack.pop();
            stack[stack.length - 1] += Math.max(2 * inner, 1);
        }
    }
    return stack[0];
};`,
    explanation:
      '1. The stack tracks the score at each nesting depth. Start with [0].\n' +
      '2. On (, push 0 to start a new scope.\n' +
      '3. On ), pop the inner score. If it was 0 (empty pair), score is 1. Otherwise, score is 2*inner.\n' +
      '4. Add this score to the parent scope (stack[-1]).\n' +
      '5. The final answer is stack[0].',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'A stack can track scores at each depth of nesting.',
      'An empty pair () contributes 1. A wrapped pair (A) contributes 2*A.',
      'Adjacent pairs add their scores together.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 857. Minimum Cost to Hire K Workers
  // ---------------------------------------------------------------------------
  {
    id: 857,
    description:
      'There are n workers. You are given the quality and wage arrays. To hire k workers, every worker must be paid at least their minimum wage expectation, and the pay must be proportional to their quality (same ratio for all hired workers). Return the minimum cost.',
    examples:
      'Input: quality = [10,20,5], wage = [70,50,30], k = 2\nOutput: 105.0\nExplanation: Hire worker 0 and 2, pay ratio = 7.0, cost = 7*10 + 7*5 = 105.',
    intuition:
      'The key insight is that all hired workers must be paid at the same wage-to-quality ratio, and that ratio is set by the most expensive worker (highest ratio). So sort by ratio, and for each potential rate-setter, keep the k workers with the smallest quality to minimize total cost.',
    approach:
      'Sort workers by their wage/quality ratio. For each worker considered as the one setting the rate, use a max-heap to maintain the k smallest quality values. The cost is ratio * total_quality.',
    code: `class Solution:
    def mincostToHireWorkers(self, quality: list[int], wage: list[int], k: int) -> float:
        import heapq
        workers = sorted(zip(quality, wage), key=lambda x: x[1] / x[0])
        heap = []
        total_quality = 0
        ans = float('inf')
        for q, w in workers:
            ratio = w / q
            heapq.heappush(heap, -q)
            total_quality += q
            if len(heap) > k:
                total_quality += heapq.heappop(heap)
            if len(heap) == k:
                ans = min(ans, ratio * total_quality)
        return ans`,
    jsCode: `var mincostToHireWorkers = function(quality, wage, k) {
    const workers = quality.map((q, i) => [q, wage[i]]).sort((a, b) => a[1]/a[0] - b[1]/b[0]);
    // Max-heap using negative values
    const heap = [];
    const push = (val) => { heap.push(val); let i = heap.length - 1; while (i > 0) { const p = Math.floor((i-1)/2); if (heap[p] > heap[i]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0]; heap[0] = heap[heap.length-1]; heap.pop(); let i = 0; while (true) { let max = i; const l = 2*i+1, r = 2*i+2; if (l < heap.length && heap[l] > heap[max]) max = l; if (r < heap.length && heap[r] > heap[max]) max = r; if (max === i) break; [heap[i], heap[max]] = [heap[max], heap[i]]; i = max; } return top; };
    let totalQuality = 0;
    let ans = Infinity;
    for (const [q, w] of workers) {
        const ratio = w / q;
        push(q);
        totalQuality += q;
        if (heap.length > k) totalQuality -= pop();
        if (heap.length === k) ans = Math.min(ans, ratio * totalQuality);
    }
    return ans;
};`,
    explanation:
      '1. Sort workers by wage/quality ratio (the rate they demand).\n' +
      '2. Iterate through workers. The current worker sets the payment ratio.\n' +
      '3. Use a max-heap (negated) to track qualities of chosen workers. Keep only k smallest.\n' +
      '4. Cost = ratio * sum of k smallest qualities among eligible workers.\n' +
      '5. Track the minimum cost.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'All hired workers share the same wage/quality ratio.',
      'Sort by ratio and consider each worker as the one determining the ratio.',
      'Use a heap to maintain the k workers with smallest quality.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 860. Lemonade Change
  // ---------------------------------------------------------------------------
  {
    id: 860,
    description:
      'At a lemonade stand, each lemonade costs $5. Customers queue up and pay with $5, $10, or $20 bills. You must provide the correct change. Return true if you can provide every customer with the correct change, starting with no change.',
    examples:
      'Input: bills = [5,5,5,10,20]\nOutput: true\nExplanation: Collect three $5, give one as change for $10, then give one $10 and one $5 as change for $20.',
    intuition:
      'Five-dollar bills are the most versatile for making change, so conserve them. When giving change for $20, prefer using a $10 + $5 over three $5s. This greedy approach ensures you always have the most flexible bills available.',
    approach:
      'Greedily track the count of $5 and $10 bills. For $10, give one $5. For $20, prefer giving one $10 + one $5, otherwise give three $5s. If you cannot make change, return false.',
    code: `class Solution:
    def lemonadeChange(self, bills: list[int]) -> bool:
        five = ten = 0
        for bill in bills:
            if bill == 5:
                five += 1
            elif bill == 10:
                if five == 0:
                    return False
                five -= 1
                ten += 1
            else:
                if ten > 0 and five > 0:
                    ten -= 1
                    five -= 1
                elif five >= 3:
                    five -= 3
                else:
                    return False
        return True`,
    jsCode: `var lemonadeChange = function(bills) {
    let five = 0, ten = 0;
    for (const bill of bills) {
        if (bill === 5) {
            five++;
        } else if (bill === 10) {
            if (five === 0) return false;
            five--;
            ten++;
        } else {
            if (ten > 0 && five > 0) { ten--; five--; }
            else if (five >= 3) { five -= 3; }
            else return false;
        }
    }
    return true;
};`,
    explanation:
      '1. Track counts of $5 and $10 bills.\n' +
      '2. $5 bill: no change needed, increment five.\n' +
      '3. $10 bill: need $5 change. If unavailable, return False.\n' +
      '4. $20 bill: prefer $10+$5 change (preserves more $5 bills), else use three $5s.\n' +
      '5. If unable to make change at any point, return False.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'You only need to track $5 and $10 bills (you never give $20 as change).',
      'For $20 change, prefer giving $10+$5 over $5+$5+$5.',
      '$5 bills are the most versatile, so conserve them when possible.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 862. Shortest Subarray with Sum at Least K
  // ---------------------------------------------------------------------------
  {
    id: 862,
    description:
      'Given an integer array nums and an integer k, return the length of the shortest non-empty subarray of nums with a sum of at least k. If there is no such subarray, return -1.',
    examples:
      'Input: nums = [2,-1,2], k = 3\nOutput: 3\nExplanation: The subarray [2,-1,2] has sum 3.',
    intuition:
      'Unlike the positive-only case where a sliding window works, negative numbers can make prefix sums decrease. A monotone deque of prefix sums lets you efficiently find the shortest subarray summing to at least k, because you only need to consider prefix sums in increasing order.',
    approach:
      'Compute prefix sums. Use a monotone deque to maintain increasing prefix sums. For each index, pop from the front while the difference meets k (tracking min length), and pop from the back to maintain monotonicity.',
    code: `class Solution:
    def shortestSubarray(self, nums: list[int], k: int) -> int:
        from collections import deque
        n = len(nums)
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + nums[i]
        dq = deque()
        ans = n + 1
        for i in range(n + 1):
            while dq and prefix[i] - prefix[dq[0]] >= k:
                ans = min(ans, i - dq.popleft())
            while dq and prefix[i] <= prefix[dq[-1]]:
                dq.pop()
            dq.append(i)
        return ans if ans <= n else -1`,
    jsCode: `var shortestSubarray = function(nums, k) {
    const n = nums.length;
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
    const dq = [];
    let ans = n + 1;
    let front = 0;
    for (let i = 0; i <= n; i++) {
        while (front < dq.length && prefix[i] - prefix[dq[front]] >= k) {
            ans = Math.min(ans, i - dq[front]);
            front++;
        }
        while (dq.length > front && prefix[i] <= prefix[dq[dq.length - 1]]) {
            dq.pop();
        }
        dq.push(i);
    }
    return ans <= n ? ans : -1;
};`,
    explanation:
      '1. Build prefix sums so that subarray sum [l..r] = prefix[r+1] - prefix[l].\n' +
      '2. Maintain a monotone deque of indices with increasing prefix sums.\n' +
      '3. For each i, pop from front while prefix[i] - prefix[front] >= k, updating the min length.\n' +
      '4. Pop from back if prefix[i] <= prefix[back] to maintain monotonicity.\n' +
      '5. Return the minimum length found, or -1.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Prefix sums help compute subarray sums efficiently.',
      'Negative numbers make sliding window insufficient. Use a monotone deque.',
      'The deque maintains indices with increasing prefix sums for efficient comparison.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 863. All Nodes Distance K in Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 863,
    description:
      'Given the root of a binary tree, the value of a target node, and an integer k, return an array of the values of all nodes that have a distance k from the target node.',
    examples:
      'Input: root = [3,5,1,6,2,0,8,null,null,7,4], target = 5, k = 2\nOutput: [7,4,1]\nExplanation: Nodes at distance 2 from node 5 are 7, 4, and 1.',
    intuition:
      'A binary tree only has edges going down to children. To find nodes at distance k in all directions, add parent pointers to turn the tree into a regular graph. Then BFS from the target node for exactly k levels gives you all nodes at distance k.',
    approach:
      'First, build a parent map using DFS so we can traverse upward. Then BFS from the target node, expanding to left child, right child, and parent, for exactly k levels.',
    code: `class Solution:
    def distanceK(self, root, target, k):
        parent = {}
        def dfs(node, par):
            if node:
                parent[node] = par
                dfs(node.left, node)
                dfs(node.right, node)
        dfs(root, None)
        queue = [target]
        visited = {target}
        for _ in range(k):
            next_queue = []
            for node in queue:
                for nei in (node.left, node.right, parent[node]):
                    if nei and nei not in visited:
                        visited.add(nei)
                        next_queue.append(nei)
            queue = next_queue
        return [node.val for node in queue]`,
    jsCode: `var distanceK = function(root, target, k) {
    const parent = new Map();
    const buildParent = (node, par) => {
        if (!node) return;
        parent.set(node, par);
        buildParent(node.left, node);
        buildParent(node.right, node);
    };
    buildParent(root, null);
    let queue = [target];
    const visited = new Set([target]);
    for (let d = 0; d < k; d++) {
        const nextQueue = [];
        for (const node of queue) {
            for (const nei of [node.left, node.right, parent.get(node)]) {
                if (nei && !visited.has(nei)) {
                    visited.add(nei);
                    nextQueue.push(nei);
                }
            }
        }
        queue = nextQueue;
    }
    return queue.map(node => node.val);
};`,
    explanation:
      '1. Build a parent map so each node knows its parent.\n' +
      '2. BFS from target node, treating the tree as an undirected graph (children + parent).\n' +
      '3. Expand k levels from the target.\n' +
      '4. All nodes at exactly distance k are in the queue after k iterations.\n' +
      '5. Return their values.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The tree is not a graph by default, but you can add parent pointers.',
      'Build a parent map, then BFS from the target treating the tree like a graph.',
      'Stop BFS after exactly k levels to find nodes at distance k.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 867. Transpose Matrix
  // ---------------------------------------------------------------------------
  {
    id: 867,
    description:
      'Given a 2D integer array matrix, return the transpose of matrix. The transpose flips a matrix over its main diagonal, switching the row and column indices.',
    examples:
      'Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [[1,4,7],[2,5,8],[3,6,9]]',
    intuition:
      'Transposing a matrix simply means swapping rows and columns. The element at row i, column j moves to row j, column i. Think of it as flipping the matrix along its main diagonal.',
    approach:
      'Create a new matrix where element at position [i][j] comes from the original matrix at position [j][i]. The new matrix has dimensions cols x rows.',
    code: `class Solution:
    def transpose(self, matrix: list[list[int]]) -> list[list[int]]:
        rows, cols = len(matrix), len(matrix[0])
        return [[matrix[j][i] for j in range(rows)] for i in range(cols)]`,
    jsCode: `var transpose = function(matrix) {
    const rows = matrix.length, cols = matrix[0].length;
    const result = [];
    for (let i = 0; i < cols; i++) {
        result.push([]);
        for (let j = 0; j < rows; j++) {
            result[i].push(matrix[j][i]);
        }
    }
    return result;
};`,
    explanation:
      '1. The original matrix has dimensions rows x cols.\n' +
      '2. The transposed matrix has dimensions cols x rows.\n' +
      '3. For each position (i, j) in the transposed matrix, the value is matrix[j][i].\n' +
      '4. Use list comprehension to build the result.',
    timeComplexity: 'O(rows * cols)',
    spaceComplexity: 'O(rows * cols)',
    hints: [
      'The transpose swaps rows and columns.',
      'Element at [i][j] in the transpose is element [j][i] in the original.',
      'The output dimensions are the reverse of the input dimensions.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 871. Minimum Number of Refueling Stops
  // ---------------------------------------------------------------------------
  {
    id: 871,
    description:
      'A car starts at position 0 with startFuel liters of fuel. It uses 1 liter per unit distance. Along the way, there are gas stations at given positions with given fuel amounts. Return the minimum number of refueling stops to reach the target, or -1 if impossible.',
    examples:
      'Input: target = 100, startFuel = 10, stations = [[10,60],[20,30],[30,30],[60,40]]\nOutput: 2\nExplanation: Start with 10, reach station 0, refuel 60. Then reach station 3, refuel 40. Reach 100.',
    intuition:
      'Imagine you are driving and collecting fuel coupons from stations you pass. When you run out of gas, you retroactively redeem the biggest coupon you have collected. This greedy strategy with a max-heap minimizes the number of stops.',
    approach:
      'Use a greedy approach with a max-heap. As we pass each station, add its fuel to the heap. When we run out of fuel, greedily refuel from the station with the most fuel we have passed.',
    code: `class Solution:
    def minRefuelStops(self, target: int, startFuel: int, stations: list[list[int]]) -> int:
        import heapq
        heap = []
        fuel = startFuel
        stops = 0
        prev = 0
        for pos, gas in stations + [[target, 0]]:
            fuel -= (pos - prev)
            while fuel < 0 and heap:
                fuel += -heapq.heappop(heap)
                stops += 1
            if fuel < 0:
                return -1
            heapq.heappush(heap, -gas)
            prev = pos
        return stops`,
    jsCode: `var minRefuelStops = function(target, startFuel, stations) {
    // Max-heap using negative values in a min-heap
    const heap = [];
    const push = (val) => { heap.push(-val); let i = heap.length-1; while(i>0){const p=Math.floor((i-1)/2);if(heap[p]<=heap[i])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;} };
    const pop = () => { const top=-heap[0];heap[0]=heap[heap.length-1];heap.pop();let i=0;while(true){let min=i;const l=2*i+1,r=2*i+2;if(l<heap.length&&heap[l]<heap[min])min=l;if(r<heap.length&&heap[r]<heap[min])min=r;if(min===i)break;[heap[i],heap[min]]=[heap[min],heap[i]];i=min;}return top; };
    let fuel = startFuel;
    let stops = 0;
    let prev = 0;
    const allStops = [...stations, [target, 0]];
    for (const [pos, gas] of allStops) {
        fuel -= (pos - prev);
        while (fuel < 0 && heap.length > 0) {
            fuel += pop();
            stops++;
        }
        if (fuel < 0) return -1;
        push(gas);
        prev = pos;
    }
    return stops;
};`,
    explanation:
      '1. Iterate through stations (plus the target as a final stop).\n' +
      '2. Subtract the distance traveled from current fuel.\n' +
      '3. If fuel goes negative, refuel from the largest fuel station we passed (max-heap).\n' +
      '4. Each heap pop is one refueling stop.\n' +
      '5. If fuel is still negative and heap is empty, return -1.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'You can decide to refuel at a station retroactively.',
      'Use a max-heap of fuels from stations you have passed.',
      'When you run out of fuel, greedily pick the station with the most fuel.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 874. Walking Robot Simulation
  // ---------------------------------------------------------------------------
  {
    id: 874,
    description:
      'A robot on an infinite XY-plane starts at (0,0) facing north. It receives commands: -2 means turn left 90 degrees, -1 means turn right 90 degrees, and a positive integer k means move forward k units one step at a time. There are obstacles. Return the maximum Euclidean distance squared the robot ever gets from the origin.',
    examples:
      'Input: commands = [4,-1,3], obstacles = []\nOutput: 25\nExplanation: Robot goes to (0,4), turns right, then goes to (3,4). Max distance squared = 9+16 = 25.',
    intuition:
      'This is pure simulation - just follow the commands step by step. The key optimization is using a set for obstacle positions so you can check for collisions in constant time as you move one unit at a time.',
    approach:
      'Simulate the robot movement. Use a set of obstacle positions for O(1) lookup. Move one step at a time and check for obstacles. Track the maximum distance squared from the origin.',
    code: `class Solution:
    def robotSim(self, commands: list[int], obstacles: list[list[int]]) -> int:
        dx = [0, 1, 0, -1]
        dy = [1, 0, -1, 0]
        di = 0
        x = y = 0
        obs = set(map(tuple, obstacles))
        ans = 0
        for cmd in commands:
            if cmd == -2:
                di = (di - 1) % 4
            elif cmd == -1:
                di = (di + 1) % 4
            else:
                for _ in range(cmd):
                    nx, ny = x + dx[di], y + dy[di]
                    if (nx, ny) not in obs:
                        x, y = nx, ny
                        ans = max(ans, x*x + y*y)
        return ans`,
    jsCode: `var robotSim = function(commands, obstacles) {
    const dx = [0, 1, 0, -1];
    const dy = [1, 0, -1, 0];
    let di = 0, x = 0, y = 0;
    const obs = new Set(obstacles.map(o => o[0] + ',' + o[1]));
    let ans = 0;
    for (const cmd of commands) {
        if (cmd === -2) di = (di + 3) % 4;
        else if (cmd === -1) di = (di + 1) % 4;
        else {
            for (let i = 0; i < cmd; i++) {
                const nx = x + dx[di], ny = y + dy[di];
                if (!obs.has(nx + ',' + ny)) {
                    x = nx; y = ny;
                    ans = Math.max(ans, x*x + y*y);
                }
            }
        }
    }
    return ans;
};`,
    explanation:
      '1. Direction index 0=N, 1=E, 2=S, 3=W with corresponding dx, dy arrays.\n' +
      '2. Turn left: di = (di-1)%4. Turn right: di = (di+1)%4.\n' +
      '3. For move commands, step one unit at a time, checking for obstacles.\n' +
      '4. If the next position is an obstacle, stop moving.\n' +
      '5. Track the maximum x^2 + y^2 after each step.',
    timeComplexity: 'O(n + k) where n is obstacles length and k is total steps',
    spaceComplexity: 'O(n)',
    hints: [
      'Simulate step by step, not the whole command at once.',
      'Use a set for obstacle lookup.',
      'Track maximum distance squared from origin.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 876. Middle of the Linked List
  // ---------------------------------------------------------------------------
  {
    id: 876,
    description:
      'Given the head of a singly linked list, return the middle node. If there are two middle nodes, return the second middle node.',
    examples:
      'Input: head = [1,2,3,4,5]\nOutput: [3,4,5]\nExplanation: The middle node is 3.',
    intuition:
      'The slow-and-fast pointer trick works like two runners on a track. If one runs twice as fast, when the fast one finishes, the slow one is exactly at the halfway point. This elegantly finds the middle without counting the total length first.',
    approach:
      'Use the slow and fast pointer technique. Move slow one step and fast two steps at a time. When fast reaches the end, slow is at the middle.',
    code: `class Solution:
    def middleNode(self, head):
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        return slow`,
    jsCode: `var middleNode = function(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
};`,
    explanation:
      '1. Initialize both slow and fast to head.\n' +
      '2. Move slow one step and fast two steps each iteration.\n' +
      '3. When fast reaches None or fast.next is None, slow is at the middle.\n' +
      '4. For even-length lists, slow will be at the second middle node.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The classic approach is to count all nodes, then traverse to the middle.',
      'A better approach uses two pointers moving at different speeds.',
      'When the fast pointer reaches the end, the slow pointer is at the middle.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 886. Possible Bipartition
  // ---------------------------------------------------------------------------
  {
    id: 886,
    description:
      'We want to split a group of n people (labeled 1 to n) into two groups. We are given an array of dislikes where dislikes[i] = [a, b] indicates persons a and b dislike each other. Return true if it is possible to split everyone into two groups such that no two people in the same group dislike each other.',
    examples:
      'Input: n = 4, dislikes = [[1,2],[1,3],[2,4]]\nOutput: true\nExplanation: Group1 = [1,4], Group2 = [2,3].',
    intuition:
      'If two people dislike each other, they must be in different groups. This is exactly the graph bipartiteness problem: can you color the graph with two colors such that no adjacent nodes share a color? BFS with alternating colors reveals the answer.',
    approach:
      'This is a graph bipartiteness check. Build an adjacency list and use BFS/DFS to try 2-coloring the graph. If we find a conflict, return false.',
    code: `class Solution:
    def possibleBipartition(self, n: int, dislikes: list[list[int]]) -> bool:
        from collections import defaultdict, deque
        graph = defaultdict(list)
        for a, b in dislikes:
            graph[a].append(b)
            graph[b].append(a)
        color = {}
        for i in range(1, n + 1):
            if i in color:
                continue
            queue = deque([i])
            color[i] = 0
            while queue:
                node = queue.popleft()
                for nei in graph[node]:
                    if nei not in color:
                        color[nei] = color[node] ^ 1
                        queue.append(nei)
                    elif color[nei] == color[node]:
                        return False
        return True`,
    jsCode: `var possibleBipartition = function(n, dislikes) {
    const graph = new Map();
    for (const [a, b] of dislikes) {
        if (!graph.has(a)) graph.set(a, []);
        if (!graph.has(b)) graph.set(b, []);
        graph.get(a).push(b);
        graph.get(b).push(a);
    }
    const color = new Map();
    for (let i = 1; i <= n; i++) {
        if (color.has(i)) continue;
        const queue = [i];
        color.set(i, 0);
        let idx = 0;
        while (idx < queue.length) {
            const node = queue[idx++];
            for (const nei of (graph.get(node) || [])) {
                if (!color.has(nei)) {
                    color.set(nei, color.get(node) ^ 1);
                    queue.push(nei);
                } else if (color.get(nei) === color.get(node)) {
                    return false;
                }
            }
        }
    }
    return true;
};`,
    explanation:
      '1. Build an adjacency list from dislikes.\n' +
      '2. For each uncolored node, start BFS and assign color 0.\n' +
      '3. Assign the opposite color to all neighbors.\n' +
      '4. If a neighbor already has the same color, return False (not bipartite).\n' +
      '5. If all nodes are successfully 2-colored, return True.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    hints: [
      'This is equivalent to checking if a graph is bipartite.',
      'Use BFS/DFS to try to 2-color the graph.',
      'If two adjacent nodes end up with the same color, it is impossible.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 889. Construct Binary Tree from Preorder and Postorder Traversal
  // ---------------------------------------------------------------------------
  {
    id: 889,
    description:
      'Given two integer arrays preorder and postorder representing the preorder and postorder traversals of a binary tree, construct and return the binary tree. If there exist multiple answers, return any.',
    examples:
      'Input: preorder = [1,2,4,5,3,6,7], postorder = [4,5,2,6,7,3,1]\nOutput: [1,2,3,4,5,6,7]',
    intuition:
      'In preorder, the root comes first and the left child is second. Finding that left child in postorder tells you exactly how many nodes belong to the left subtree. This split lets you recursively build both subtrees.',
    approach:
      'The first element of preorder is the root. The second element is the root of the left subtree. Find this element in postorder to determine the size of the left subtree, then recursively build both subtrees.',
    code: `class Solution:
    def constructFromPrePost(self, preorder, postorder):
        if not preorder:
            return None
        from typing import Optional
        class TreeNode:
            def __init__(self, val=0, left=None, right=None):
                self.val = val
                self.left = left
                self.right = right
        root = TreeNode(preorder[0])
        if len(preorder) == 1:
            return root
        left_root_val = preorder[1]
        left_size = postorder.index(left_root_val) + 1
        root.left = self.constructFromPrePost(preorder[1:1+left_size], postorder[:left_size])
        root.right = self.constructFromPrePost(preorder[1+left_size:], postorder[left_size:-1])
        return root`,
    jsCode: `var constructFromPrePost = function(preorder, postorder) {
    if (preorder.length === 0) return null;
    const root = new TreeNode(preorder[0]);
    if (preorder.length === 1) return root;
    const leftRootVal = preorder[1];
    const leftSize = postorder.indexOf(leftRootVal) + 1;
    root.left = constructFromPrePost(preorder.slice(1, 1 + leftSize), postorder.slice(0, leftSize));
    root.right = constructFromPrePost(preorder.slice(1 + leftSize), postorder.slice(leftSize, -1));
    return root;
};`,
    explanation:
      '1. Root is preorder[0].\n' +
      '2. preorder[1] is the left subtree root. Find it in postorder to get left subtree size.\n' +
      '3. Split preorder and postorder into left and right subtree portions.\n' +
      '4. Recursively build left and right subtrees.\n' +
      '5. The TreeNode class is defined for construction.',
    timeComplexity: 'O(n^2) or O(n) with index map',
    spaceComplexity: 'O(n)',
    hints: [
      'The first element of preorder is always the root.',
      'The second element of preorder is the left child root.',
      'Find the left child root in postorder to determine the boundary between left and right subtrees.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 895. Maximum Frequency Stack
  // ---------------------------------------------------------------------------
  {
    id: 895,
    description:
      'Design a stack-like data structure FreqStack. push(val) pushes val onto the stack. pop() removes and returns the most frequent element. If there is a tie, the element closest to the top of the stack is removed.',
    examples:
      'Input: ["FreqStack","push","push","push","push","push","push","pop","pop","pop","pop"]\n[[],[5],[7],[5],[7],[4],[5],[],[],[],[]] \nOutput: [null,null,null,null,null,null,null,5,7,5,4]',
    intuition:
      'The trick is maintaining a stack for each frequency level. When you push a value, it goes onto the stack for its new frequency. When you pop, you take from the highest frequency stack - and since stacks are LIFO, ties automatically favor the most recently pushed element.',
    approach:
      'Maintain a frequency map and a map from frequency to a stack of elements. Track the current max frequency. On pop, pop from the stack at max frequency and decrement if that stack becomes empty.',
    code: `class FreqStack:
    def __init__(self):
        self.freq = {}
        self.group = {}
        self.max_freq = 0

    def push(self, val: int) -> None:
        f = self.freq.get(val, 0) + 1
        self.freq[val] = f
        if f > self.max_freq:
            self.max_freq = f
        self.group.setdefault(f, []).append(val)

    def pop(self) -> int:
        val = self.group[self.max_freq].pop()
        self.freq[val] -= 1
        if not self.group[self.max_freq]:
            self.max_freq -= 1
        return val`,
    jsCode: `var FreqStack = function() {
    this.freq = new Map();
    this.group = new Map();
    this.maxFreq = 0;
};
FreqStack.prototype.push = function(val) {
    const f = (this.freq.get(val) || 0) + 1;
    this.freq.set(val, f);
    if (f > this.maxFreq) this.maxFreq = f;
    if (!this.group.has(f)) this.group.set(f, []);
    this.group.get(f).push(val);
};
FreqStack.prototype.pop = function() {
    const val = this.group.get(this.maxFreq).pop();
    this.freq.set(val, this.freq.get(val) - 1);
    if (this.group.get(this.maxFreq).length === 0) this.maxFreq--;
    return val;
};`,
    explanation:
      '1. freq maps each value to its current frequency.\n' +
      '2. group maps each frequency to a stack of values with that frequency.\n' +
      '3. On push, increment freq and append to the corresponding group stack.\n' +
      '4. On pop, pop from group[max_freq]. This gives the most recent among most frequent.\n' +
      '5. If that group becomes empty, decrement max_freq.',
    timeComplexity: 'O(1) per operation',
    spaceComplexity: 'O(n)',
    hints: [
      'Track frequency of each element and group elements by frequency.',
      'Use a stack per frequency level for LIFO tie-breaking.',
      'Pop from the highest frequency stack.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 896. Monotonic Array
  // ---------------------------------------------------------------------------
  {
    id: 896,
    description:
      'An array is monotonic if it is either monotone increasing or monotone decreasing. Return true if the given array is monotonic.',
    examples:
      'Input: nums = [1,2,2,3]\nOutput: true\nExplanation: The array is monotone increasing.',
    intuition:
      'An array is monotonic if it never reverses direction. Track two flags: could it be non-decreasing, and could it be non-increasing. If either survives a full scan, the array is monotonic.',
    approach:
      'Track two boolean flags: one for increasing and one for decreasing. Iterate through the array comparing adjacent elements. If both flags are violated, return false.',
    code: `class Solution:
    def isMonotonic(self, nums: list[int]) -> bool:
        increasing = decreasing = True
        for i in range(1, len(nums)):
            if nums[i] > nums[i-1]:
                decreasing = False
            if nums[i] < nums[i-1]:
                increasing = False
        return increasing or decreasing`,
    jsCode: `var isMonotonic = function(nums) {
    let increasing = true, decreasing = true;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] > nums[i-1]) decreasing = false;
        if (nums[i] < nums[i-1]) increasing = false;
    }
    return increasing || decreasing;
};`,
    explanation:
      '1. Assume the array could be both increasing and decreasing.\n' +
      '2. If we find nums[i] > nums[i-1], it cannot be decreasing.\n' +
      '3. If we find nums[i] < nums[i-1], it cannot be increasing.\n' +
      '4. Return true if at least one flag remains true.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Check if the array is entirely non-decreasing or entirely non-increasing.',
      'Track two flags as you iterate.',
      'You can also compare the first and last elements to guess the direction.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 901. Online Stock Span
  // ---------------------------------------------------------------------------
  {
    id: 901,
    description:
      'Design a class StockSpanner that collects daily price quotes and returns the span of the stock price for the current day. The span is the max number of consecutive days (starting from today, going backwards) for which the price was less than or equal to today\'s price.',
    examples:
      'Input: ["StockSpanner","next","next","next","next","next","next","next"]\n[[],[100],[80],[60],[70],[60],[75],[85]]\nOutput: [null,1,1,1,2,1,4,6]',
    intuition:
      'A monotonic decreasing stack naturally absorbs smaller elements. When a new price arrives that is higher than previous prices, those previous prices get \'consumed\' into the new price\'s span. Each element is pushed and popped at most once, giving amortized O(1) per call.',
    approach:
      'Use a monotonic stack storing (price, span) pairs. When a new price comes in, pop all stack entries with price <= current price, accumulating their spans. Push the new price with the total span.',
    code: `class StockSpanner:
    def __init__(self):
        self.stack = []

    def next(self, price: int) -> int:
        span = 1
        while self.stack and self.stack[-1][0] <= price:
            span += self.stack.pop()[1]
        self.stack.append((price, span))
        return span`,
    jsCode: `var StockSpanner = function() {
    this.stack = [];
};
StockSpanner.prototype.next = function(price) {
    let span = 1;
    while (this.stack.length > 0 && this.stack[this.stack.length - 1][0] <= price) {
        span += this.stack.pop()[1];
    }
    this.stack.push([price, span]);
    return span;
};`,
    explanation:
      '1. The stack stores (price, span) pairs.\n' +
      '2. For each new price, pop entries where the price is <= current price.\n' +
      '3. Accumulate the spans of popped entries into the current span.\n' +
      '4. Push (price, total_span) onto the stack.\n' +
      '5. Return the computed span.',
    timeComplexity: 'O(1) amortized per call',
    spaceComplexity: 'O(n)',
    hints: [
      'A monotone decreasing stack helps here.',
      'When you see a higher price, pop lower prices and combine their spans.',
      'Each element is pushed and popped at most once.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 905. Sort Array By Parity
  // ---------------------------------------------------------------------------
  {
    id: 905,
    description:
      'Given an integer array nums, move all the even integers at the beginning of the array followed by all the odd integers. Return any array that satisfies this condition.',
    examples:
      'Input: nums = [3,1,2,4]\nOutput: [2,4,3,1]\nExplanation: [4,2,3,1], [2,4,1,3] are also accepted.',
    intuition:
      'Like the Dutch national flag problem, use two pointers from opposite ends. The left pointer seeks odd numbers, the right pointer seeks even numbers, and they swap when both find what they are looking for. This partitions the array in-place.',
    approach:
      'Use a two-pointer approach. One pointer starts at the beginning and one at the end. Swap when the left pointer finds an odd number and the right pointer finds an even number.',
    code: `class Solution:
    def sortArrayByParity(self, nums: list[int]) -> list[int]:
        l, r = 0, len(nums) - 1
        while l < r:
            if nums[l] % 2 == 1 and nums[r] % 2 == 0:
                nums[l], nums[r] = nums[r], nums[l]
            if nums[l] % 2 == 0:
                l += 1
            if nums[r] % 2 == 1:
                r -= 1
        return nums`,
    jsCode: `var sortArrayByParity = function(nums) {
    let l = 0, r = nums.length - 1;
    while (l < r) {
        if (nums[l] % 2 === 1 && nums[r] % 2 === 0) {
            [nums[l], nums[r]] = [nums[r], nums[l]];
        }
        if (nums[l] % 2 === 0) l++;
        if (nums[r] % 2 === 1) r--;
    }
    return nums;
};`,
    explanation:
      '1. Left pointer starts at 0, right pointer at end.\n' +
      '2. If left has odd and right has even, swap them.\n' +
      '3. Advance left if it points to an even number.\n' +
      '4. Decrement right if it points to an odd number.\n' +
      '5. Continue until pointers meet.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Two pointers from opposite ends can partition in-place.',
      'Move evens to the left, odds to the right.',
      'The relative order within evens/odds does not matter.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 907. Sum of Subarray Minimums
  // ---------------------------------------------------------------------------
  {
    id: 907,
    description:
      'Given an array of integers arr, find the sum of min(b) for every contiguous subarray b of arr. Return the answer modulo 10^9 + 7.',
    examples:
      'Input: arr = [3,1,2,4]\nOutput: 17\nExplanation: Subarrays are [3],[1],[2],[4],[3,1],[1,2],[2,4],[3,1,2],[1,2,4],[3,1,2,4]. Mins: 3+1+2+4+1+1+2+1+1+1 = 17.',
    intuition:
      'Instead of checking every subarray, ask: for each element, how many subarrays is it the minimum of? A monotonic stack finds the boundaries where each element stops being the minimum, letting you count its contribution in O(1) per element.',
    approach:
      'For each element, determine how many subarrays it is the minimum of. Use a monotonic stack to find the previous less element (PLE) and next less element (NLE). The contribution of arr[i] is arr[i] * left * right.',
    code: `class Solution:
    def sumSubarrayMins(self, arr: list[int]) -> int:
        MOD = 10**9 + 7
        n = len(arr)
        left = [0] * n
        right = [0] * n
        stack = []
        for i in range(n):
            while stack and arr[stack[-1]] >= arr[i]:
                stack.pop()
            left[i] = i - stack[-1] if stack else i + 1
            stack.append(i)
        stack = []
        for i in range(n - 1, -1, -1):
            while stack and arr[stack[-1]] > arr[i]:
                stack.pop()
            right[i] = stack[-1] - i if stack else n - i
            stack.append(i)
        return sum(arr[i] * left[i] * right[i] for i in range(n)) % MOD`,
    jsCode: `var sumSubarrayMins = function(arr) {
    const MOD = 1e9 + 7;
    const n = arr.length;
    const left = new Array(n);
    const right = new Array(n);
    let stack = [];
    for (let i = 0; i < n; i++) {
        while (stack.length && arr[stack[stack.length - 1]] >= arr[i]) stack.pop();
        left[i] = stack.length ? i - stack[stack.length - 1] : i + 1;
        stack.push(i);
    }
    stack = [];
    for (let i = n - 1; i >= 0; i--) {
        while (stack.length && arr[stack[stack.length - 1]] > arr[i]) stack.pop();
        right[i] = stack.length ? stack[stack.length - 1] - i : n - i;
        stack.push(i);
    }
    let result = 0;
    for (let i = 0; i < n; i++) {
        result = (result + arr[i] * left[i] * right[i]) % MOD;
    }
    return result;
};`,
    explanation:
      '1. For each index i, find how far left it is the minimum (left[i]).\n' +
      '2. Find how far right it is the minimum (right[i]).\n' +
      '3. Use >= for left and > for right to handle duplicates.\n' +
      '4. arr[i] is the min of left[i] * right[i] subarrays.\n' +
      '5. Sum all contributions modulo 10^9 + 7.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The key is counting how many subarrays each element is the minimum of.',
      'Use a monotonic stack to find the previous and next smaller elements.',
      'Handle duplicates carefully to avoid double-counting.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 909. Snakes and Ladders
  // ---------------------------------------------------------------------------
  {
    id: 909,
    description:
      'You are given an n x n board with cells labeled from 1 to n^2 in a Boustrophedon style (alternating left-right and right-left from bottom to top). Some cells have snakes or ladders (board[r][c] != -1 redirects you). Starting from square 1, return the minimum number of moves to reach square n^2, or -1.',
    examples:
      'Input: board = [[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,35,-1,-1,13,-1],[-1,-1,-1,-1,-1,-1],[-1,15,-1,-1,-1,-1]]\nOutput: 4',
    intuition:
      'This is a shortest path problem in disguise. Each board square is a node, dice rolls are edges, and snakes/ladders are teleports. BFS from square 1 finds the minimum number of moves, since each BFS level represents one dice roll.',
    approach:
      'Use BFS from square 1. Convert square numbers to board coordinates, checking for snakes/ladders. Each move considers rolling 1-6 on the die. BFS guarantees the minimum number of moves.',
    code: `class Solution:
    def snakesAndLadders(self, board: list[list[int]]) -> int:
        from collections import deque
        n = len(board)
        def get_pos(s):
            r, c = divmod(s - 1, n)
            row = n - 1 - r
            col = c if r % 2 == 0 else n - 1 - c
            return row, col
        visited = set()
        queue = deque([(1, 0)])
        visited.add(1)
        target = n * n
        while queue:
            sq, moves = queue.popleft()
            for i in range(1, 7):
                nsq = sq + i
                if nsq > target:
                    break
                r, c = get_pos(nsq)
                if board[r][c] != -1:
                    nsq = board[r][c]
                if nsq == target:
                    return moves + 1
                if nsq not in visited:
                    visited.add(nsq)
                    queue.append((nsq, moves + 1))
        return -1`,
    jsCode: `var snakesAndLadders = function(board) {
    const n = board.length;
    const getPos = (s) => {
        const r = Math.floor((s - 1) / n);
        const row = n - 1 - r;
        const col = r % 2 === 0 ? (s - 1) % n : n - 1 - (s - 1) % n;
        return [row, col];
    };
    const visited = new Set([1]);
    const queue = [[1, 0]];
    const target = n * n;
    let idx = 0;
    while (idx < queue.length) {
        let [sq, moves] = queue[idx++];
        for (let i = 1; i <= 6; i++) {
            let nsq = sq + i;
            if (nsq > target) break;
            const [r, c] = getPos(nsq);
            if (board[r][c] !== -1) nsq = board[r][c];
            if (nsq === target) return moves + 1;
            if (!visited.has(nsq)) {
                visited.add(nsq);
                queue.push([nsq, moves + 1]);
            }
        }
    }
    return -1;
};`,
    explanation:
      '1. Convert square number to board coordinates considering the Boustrophedon pattern.\n' +
      '2. BFS from square 1 with 0 moves.\n' +
      '3. For each position, try dice rolls 1-6.\n' +
      '4. If landing on a snake/ladder, redirect to the destination.\n' +
      '5. Return moves when reaching n^2.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Use BFS for shortest path. Each state is the current square number.',
      'Carefully convert between square numbers and board coordinates.',
      'Snakes and ladders are just redirections on landing.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 912. Sort an Array
  // ---------------------------------------------------------------------------
  {
    id: 912,
    description:
      'Given an array of integers nums, sort the array in ascending order and return it. You must solve it without using any built-in sort functions, with O(n log n) time complexity and the smallest space complexity possible.',
    examples:
      'Input: nums = [5,2,3,1]\nOutput: [1,2,3,5]',
    intuition:
      'Merge sort embodies the divide-and-conquer philosophy: break the problem in half, solve each half, then combine. Merging two sorted halves into one sorted array is efficient because you only need to compare the fronts of each half.',
    approach:
      'Implement merge sort or quicksort. Merge sort divides the array in half, recursively sorts each half, and merges them. It guarantees O(n log n) worst-case time.',
    code: `class Solution:
    def sortArray(self, nums: list[int]) -> list[int]:
        if len(nums) <= 1:
            return nums
        mid = len(nums) // 2
        left = self.sortArray(nums[:mid])
        right = self.sortArray(nums[mid:])
        return self.merge(left, right)

    def merge(self, a, b):
        result = []
        i = j = 0
        while i < len(a) and j < len(b):
            if a[i] <= b[j]:
                result.append(a[i])
                i += 1
            else:
                result.append(b[j])
                j += 1
        result.extend(a[i:])
        result.extend(b[j:])
        return result`,
    jsCode: `var sortArray = function(nums) {
    if (nums.length <= 1) return nums;
    const mid = Math.floor(nums.length / 2);
    const left = sortArray(nums.slice(0, mid));
    const right = sortArray(nums.slice(mid));
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) result.push(left[i++]);
        else result.push(right[j++]);
    }
    while (i < left.length) result.push(left[i++]);
    while (j < right.length) result.push(right[j++]);
    return result;
};`,
    explanation:
      '1. Base case: arrays of size 0 or 1 are already sorted.\n' +
      '2. Split the array into two halves.\n' +
      '3. Recursively sort each half.\n' +
      '4. Merge the two sorted halves using two pointers.\n' +
      '5. Always pick the smaller element first to maintain sorted order.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Merge sort guarantees O(n log n) worst case.',
      'Divide the array in half, sort each half, then merge.',
      'The merge step uses two pointers to combine two sorted arrays.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 918. Maximum Sum Circular Subarray
  // ---------------------------------------------------------------------------
  {
    id: 918,
    description:
      'Given a circular integer array nums, find the maximum possible sum of a non-empty subarray. A circular array means the end connects to the beginning. A subarray may only include each element at most once.',
    examples:
      'Input: nums = [1,-2,3,-2]\nOutput: 3\nExplanation: Subarray [3] has maximum sum 3.',
    intuition:
      'A circular max subarray either sits in the middle (normal Kadane\'s) or wraps around the ends. The wrap-around case is the total sum minus the minimum subarray in the middle. Compare both cases to get the answer.',
    approach:
      'The answer is either the max subarray (Kadane\'s) or total_sum - min_subarray (wrapping case). If all elements are negative, return the max element. Otherwise, return max(max_subarray, total - min_subarray).',
    code: `class Solution:
    def maxSubarraySumCircular(self, nums: list[int]) -> int:
        total = 0
        max_sum = cur_max = float('-inf')
        min_sum = cur_min = float('inf')
        for num in nums:
            total += num
            cur_max = max(cur_max + num, num)
            max_sum = max(max_sum, cur_max)
            cur_min = min(cur_min + num, num)
            min_sum = min(min_sum, cur_min)
        if max_sum < 0:
            return max_sum
        return max(max_sum, total - min_sum)`,
    jsCode: `var maxSubarraySumCircular = function(nums) {
    let total = 0;
    let maxSum = -Infinity, curMax = -Infinity;
    let minSum = Infinity, curMin = Infinity;
    for (const num of nums) {
        total += num;
        curMax = Math.max(curMax + num, num);
        maxSum = Math.max(maxSum, curMax);
        curMin = Math.min(curMin + num, num);
        minSum = Math.min(minSum, curMin);
    }
    if (maxSum < 0) return maxSum;
    return Math.max(maxSum, total - minSum);
};`,
    explanation:
      '1. Use Kadane\'s to find max subarray sum and min subarray sum in one pass.\n' +
      '2. The circular max subarray is total_sum - min_subarray.\n' +
      '3. If all elements are negative, max_sum < 0, so return max_sum directly.\n' +
      '4. Otherwise, return the maximum of the non-circular and circular cases.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The circular case is equivalent to total_sum minus the minimum subarray.',
      'Run Kadane\'s for both max and min subarrays simultaneously.',
      'Handle the edge case where all elements are negative.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 921. Minimum Add to Make Parentheses Valid
  // ---------------------------------------------------------------------------
  {
    id: 921,
    description:
      'A parentheses string is valid if every open parenthesis has a matching close parenthesis and vice versa. Given a parentheses string s, return the minimum number of parentheses you must add to make the string valid.',
    examples:
      'Input: s = "())"\nOutput: 1\nExplanation: Add one ( at the beginning.',
    intuition:
      'Simply count parentheses that cannot find a match. Unmatched \'(\' need a \')\' added, and unmatched \')\' need a \'(\' added. The total unmatched count is the minimum additions needed.',
    approach:
      'Track the number of unmatched open and close parentheses. Increment open count on ( and decrement on ) if there are unmatched opens. Otherwise increment the unmatched close count. The answer is the sum of both.',
    code: `class Solution:
    def minAddToMakeValid(self, s: str) -> int:
        open_count = close_count = 0
        for c in s:
            if c == '(':
                open_count += 1
            elif open_count > 0:
                open_count -= 1
            else:
                close_count += 1
        return open_count + close_count`,
    jsCode: `var minAddToMakeValid = function(s) {
    let openCount = 0, closeCount = 0;
    for (const c of s) {
        if (c === '(') openCount++;
        else if (openCount > 0) openCount--;
        else closeCount++;
    }
    return openCount + closeCount;
};`,
    explanation:
      '1. open_count tracks unmatched ( and close_count tracks unmatched ).\n' +
      '2. On (, increment open_count.\n' +
      '3. On ), if there is an unmatched (, match it (decrement open_count).\n' +
      '4. Otherwise, increment close_count (unmatched )).\n' +
      '5. The answer is open_count + close_count.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Count unmatched open and close parentheses separately.',
      'A ) can match a pending ( to reduce the count.',
      'The total additions needed is the sum of unmatched opens and closes.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 926. Flip String to Monotone Increasing
  // ---------------------------------------------------------------------------
  {
    id: 926,
    description:
      'A binary string is monotone increasing if it consists of some number of 0s followed by some number of 1s. Given a binary string s, return the minimum number of flips to make s monotone increasing.',
    examples:
      'Input: s = "00110"\nOutput: 1\nExplanation: Flip the last character to get "00111".',
    intuition:
      'At each position in the string, you face a choice: flip this 0 to a 1, or flip all the 1s you have seen so far to 0s. By tracking both costs as you scan left to right, you can make the optimal choice at each step in O(1) time.',
    approach:
      'Iterate through the string tracking the count of 1s seen so far and the minimum flips. At each position, either flip all previous 1s to 0s or flip the current 0 to 1. Take the minimum.',
    code: `class Solution:
    def minFlipsMonoIncr(self, s: str) -> int:
        ones = 0
        flips = 0
        for c in s:
            if c == '1':
                ones += 1
            else:
                flips = min(flips + 1, ones)
        return flips`,
    jsCode: `var minFlipsMonoIncr = function(s) {
    let ones = 0, flips = 0;
    for (const c of s) {
        if (c === '1') ones++;
        else flips = Math.min(flips + 1, ones);
    }
    return flips;
};`,
    explanation:
      '1. Track ones (count of 1s seen so far) and flips (minimum flips needed).\n' +
      '2. If current char is 1, increment ones (no flip needed for monotone).\n' +
      '3. If current char is 0, choose the cheaper option: flip this 0 to 1 (flips+1) or flip all previous 1s to 0 (ones).\n' +
      '4. flips = min(flips + 1, ones) at each 0.\n' +
      '5. Return flips at the end.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'At each position, decide: everything before should be 0, or this should be 1.',
      'Track the number of 1s seen so far as a proxy for flipping all to 0.',
      'Dynamic programming: flips[i] = min(flips[i-1] + (s[i]==0), ones_so_far).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 929. Unique Email Addresses
  // ---------------------------------------------------------------------------
  {
    id: 929,
    description:
      'Every valid email has a local name and domain name separated by @. In the local name, . is ignored and everything after + is ignored. Given a list of emails, return the number of unique addresses that actually receive mail.',
    examples:
      'Input: emails = ["test.email+alex@leetcode.com","test.e.mail+bob.cathy@leetcode.com","testemail+david@lee.tcode.com"]\nOutput: 2',
    intuition:
      'The problem is just string normalization. Clean each email by removing dots and everything after \'+\' in the local part, then use a set to count unique results. The cleaning rules are straightforward string operations.',
    approach:
      'For each email, split into local and domain parts. In the local part, remove dots and truncate at +. Combine with domain and add to a set. Return the set size.',
    code: `class Solution:
    def numUniqueEmails(self, emails: list[str]) -> int:
        seen = set()
        for email in emails:
            local, domain = email.split('@')
            local = local.split('+')[0].replace('.', '')
            seen.add(local + '@' + domain)
        return len(seen)`,
    jsCode: `var numUniqueEmails = function(emails) {
    const seen = new Set();
    for (const email of emails) {
        const [local, domain] = email.split('@');
        const cleaned = local.split('+')[0].replace(/\\./g, '');
        seen.add(cleaned + '@' + domain);
    }
    return seen.size;
};`,
    explanation:
      '1. Split each email into local and domain parts at @.\n' +
      '2. In the local part, take only the portion before + and remove all dots.\n' +
      '3. Reconstruct the cleaned email and add to a set.\n' +
      '4. The set automatically handles duplicates.\n' +
      '5. Return the size of the set.',
    timeComplexity: 'O(n * k) where k is the average email length',
    spaceComplexity: 'O(n * k)',
    hints: [
      'Split each email at @ to get local and domain.',
      'In the local part, ignore everything after + and remove dots.',
      'Use a set to track unique cleaned emails.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 931. Minimum Falling Path Sum
  // ---------------------------------------------------------------------------
  {
    id: 931,
    description:
      'Given an n x n array of integers matrix, return the minimum sum of any falling path through matrix. A falling path starts at any element in the first row and chooses the element in the next row that is either directly below or diagonally left/right.',
    examples:
      'Input: matrix = [[2,1,3],[6,5,4],[7,8,9]]\nOutput: 13\nExplanation: Path 1->5->7 = 13.',
    intuition:
      'Imagine rain falling down the matrix - at each cell, the water came from one of three cells above it. DP tracks the cheapest path to reach each cell, and the answer is the cheapest endpoint in the last row.',
    approach:
      'Use dynamic programming. For each cell in row i, the minimum path sum is matrix[i][j] + min(dp[i-1][j-1], dp[i-1][j], dp[i-1][j+1]). Process row by row and return the minimum of the last row.',
    code: `class Solution:
    def minFallingPathSum(self, matrix: list[list[int]]) -> int:
        n = len(matrix)
        dp = matrix[0][:]
        for i in range(1, n):
            new_dp = [0] * n
            for j in range(n):
                best = dp[j]
                if j > 0:
                    best = min(best, dp[j-1])
                if j < n - 1:
                    best = min(best, dp[j+1])
                new_dp[j] = matrix[i][j] + best
            dp = new_dp
        return min(dp)`,
    jsCode: `var minFallingPathSum = function(matrix) {
    const n = matrix.length;
    let dp = [...matrix[0]];
    for (let i = 1; i < n; i++) {
        const newDp = new Array(n).fill(0);
        for (let j = 0; j < n; j++) {
            let best = dp[j];
            if (j > 0) best = Math.min(best, dp[j-1]);
            if (j < n - 1) best = Math.min(best, dp[j+1]);
            newDp[j] = matrix[i][j] + best;
        }
        dp = newDp;
    }
    return Math.min(...dp);
};`,
    explanation:
      '1. Initialize dp with the first row values.\n' +
      '2. For each subsequent row, compute new_dp[j] = matrix[i][j] + min of dp[j-1], dp[j], dp[j+1].\n' +
      '3. Handle boundary cases (j=0 has no left, j=n-1 has no right).\n' +
      '4. After processing all rows, the answer is the minimum value in dp.\n' +
      '5. Only O(n) extra space is used by keeping just the previous row.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    hints: [
      'This is a classic DP problem. Process row by row.',
      'Each cell can be reached from at most 3 cells in the previous row.',
      'Only the previous row is needed, so optimize space to O(n).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 934. Shortest Bridge
  // ---------------------------------------------------------------------------
  {
    id: 934,
    description:
      'You are given an n x n binary matrix grid where 1 represents land and 0 represents water. There are exactly two islands. Return the smallest number of 0s you must flip to connect the two islands.',
    examples:
      'Input: grid = [[0,1],[1,0]]\nOutput: 1',
    intuition:
      'Think of it as two islands with an ocean between them. First, find one island completely using DFS. Then expand outward from that island using BFS, like ripples in water. The moment a ripple touches the other island, you have found the shortest bridge.',
    approach:
      'Use DFS to find and mark the first island. Then use BFS from all cells of the first island, expanding outward. The first time we reach a cell of the second island, the BFS level is the answer.',
    code: `class Solution:
    def shortestBridge(self, grid: list[list[int]]) -> int:
        from collections import deque
        n = len(grid)
        visited = [[False]*n for _ in range(n)]
        queue = deque()

        def dfs(r, c):
            if r < 0 or r >= n or c < 0 or c >= n or visited[r][c] or grid[r][c] == 0:
                return
            visited[r][c] = True
            queue.append((r, c, 0))
            dfs(r+1,c)
            dfs(r-1,c)
            dfs(r,c+1)
            dfs(r,c-1)

        found = False
        for i in range(n):
            if found:
                break
            for j in range(n):
                if grid[i][j] == 1:
                    dfs(i, j)
                    found = True
                    break

        while queue:
            r, c, d = queue.popleft()
            for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                nr, nc = r+dr, c+dc
                if 0 <= nr < n and 0 <= nc < n and not visited[nr][nc]:
                    if grid[nr][nc] == 1:
                        return d
                    visited[nr][nc] = True
                    queue.append((nr, nc, d+1))
        return -1`,
    jsCode: `var shortestBridge = function(grid) {
    const n = grid.length;
    const visited = Array.from({length: n}, () => new Array(n).fill(false));
    const queue = [];
    const dfs = (r, c) => {
        if (r < 0 || r >= n || c < 0 || c >= n || visited[r][c] || grid[r][c] === 0) return;
        visited[r][c] = true;
        queue.push([r, c, 0]);
        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);
    };
    let found = false;
    for (let i = 0; i < n && !found; i++) {
        for (let j = 0; j < n && !found; j++) {
            if (grid[i][j] === 1) { dfs(i, j); found = true; }
        }
    }
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    let idx = 0;
    while (idx < queue.length) {
        const [r, c, d] = queue[idx++];
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < n && nc >= 0 && nc < n && !visited[nr][nc]) {
                if (grid[nr][nc] === 1) return d;
                visited[nr][nc] = true;
                queue.push([nr, nc, d + 1]);
            }
        }
    }
    return -1;
};`,
    explanation:
      '1. Find the first island using DFS, marking all its cells as visited and adding them to a BFS queue.\n' +
      '2. BFS expands from the first island level by level.\n' +
      '3. Each level represents flipping one more water cell.\n' +
      '4. When BFS reaches a cell belonging to the second island (grid value 1, not visited), return the distance.\n' +
      '5. This gives the minimum number of flips.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Find one island first using DFS.',
      'Then BFS from all cells of that island simultaneously.',
      'The BFS distance when you reach the other island is the answer.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 935. Knight Dialer
  // ---------------------------------------------------------------------------
  {
    id: 935,
    description:
      'A chess knight can move on a phone dial pad. Given an integer n, return how many distinct phone numbers of length n you can dial starting from any numeric cell. The answer may be large, return it modulo 10^9 + 7.',
    examples:
      'Input: n = 1\nOutput: 10\nExplanation: Each digit 0-9 is a valid single-digit number.',
    intuition:
      'A knight on a phone pad has fixed moves from each digit. This is a counting problem: how many length-n sequences exist? DP tracks how many ways to be at each digit after each step, building up from length 1 to length n.',
    approach:
      'Use DP where dp[digit] = number of ways to reach that digit in the current step. Predefine the knight moves from each digit. Iterate n-1 times, updating the DP table.',
    code: `class Solution:
    def knightDialer(self, n: int) -> int:
        MOD = 10**9 + 7
        moves = {
            0: [4, 6], 1: [6, 8], 2: [7, 9], 3: [4, 8],
            4: [0, 3, 9], 5: [], 6: [0, 1, 7], 7: [2, 6],
            8: [1, 3], 9: [2, 4]
        }
        dp = [1] * 10
        for _ in range(n - 1):
            new_dp = [0] * 10
            for digit in range(10):
                for nei in moves[digit]:
                    new_dp[nei] = (new_dp[nei] + dp[digit]) % MOD
            dp = new_dp
        return sum(dp) % MOD`,
    jsCode: `var knightDialer = function(n) {
    const MOD = 1e9 + 7;
    const moves = {
        0: [4, 6], 1: [6, 8], 2: [7, 9], 3: [4, 8],
        4: [0, 3, 9], 5: [], 6: [0, 1, 7], 7: [2, 6],
        8: [1, 3], 9: [2, 4]
    };
    let dp = new Array(10).fill(1);
    for (let step = 0; step < n - 1; step++) {
        const newDp = new Array(10).fill(0);
        for (let digit = 0; digit < 10; digit++) {
            for (const nei of moves[digit]) {
                newDp[nei] = (newDp[nei] + dp[digit]) % MOD;
            }
        }
        dp = newDp;
    }
    let sum = 0;
    for (const val of dp) sum = (sum + val) % MOD;
    return sum;
};`,
    explanation:
      '1. Define knight moves from each digit on the phone pad.\n' +
      '2. dp[d] = number of ways to be at digit d at the current step.\n' +
      '3. Initially, dp = [1]*10 (one way to start at each digit).\n' +
      '4. For each of n-1 steps, update new_dp based on moves.\n' +
      '5. Sum all dp values modulo 10^9+7.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Map out which digits a knight can reach from each digit.',
      'Use DP: dp[digit] = number of sequences ending at that digit.',
      'Note that digit 5 has no valid knight moves.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 937. Reorder Data in Log Files
  // ---------------------------------------------------------------------------
  {
    id: 937,
    description:
      'You are given an array of logs. Each log is a space-delimited string of words where the first word is an identifier. Letter-logs come before digit-logs. Letter-logs are sorted lexicographically by content then by identifier. Digit-logs retain their relative order.',
    examples:
      'Input: logs = ["dig1 8 1 5 1","let1 art can","dig2 3 6","let2 own kit dig","let3 art zero"]\nOutput: ["let1 art can","let3 art zero","let2 own kit dig","dig1 8 1 5 1","dig2 3 6"]',
    intuition:
      'Separate the two types of logs, sort only the letter-logs by their special rules, and keep digit-logs in their original order. Then concatenate letter-logs first, followed by digit-logs.',
    approach:
      'Separate letter-logs and digit-logs. Sort letter-logs by (content, identifier). Concatenate sorted letter-logs with digit-logs in original order.',
    code: `class Solution:
    def reorderLogFiles(self, logs: list[str]) -> list[str]:
        letter_logs = []
        digit_logs = []
        for log in logs:
            parts = log.split(' ', 1)
            if parts[1][0].isdigit():
                digit_logs.append(log)
            else:
                letter_logs.append(log)
        letter_logs.sort(key=lambda x: (x.split(' ', 1)[1], x.split(' ', 1)[0]))
        return letter_logs + digit_logs`,
    jsCode: `var reorderLogFiles = function(logs) {
    const letterLogs = [];
    const digitLogs = [];
    for (const log of logs) {
        const idx = log.indexOf(' ');
        if (log[idx + 1] >= '0' && log[idx + 1] <= '9') digitLogs.push(log);
        else letterLogs.push(log);
    }
    letterLogs.sort((a, b) => {
        const aContent = a.substring(a.indexOf(' ') + 1);
        const bContent = b.substring(b.indexOf(' ') + 1);
        if (aContent === bContent) return a.substring(0, a.indexOf(' ')).localeCompare(b.substring(0, b.indexOf(' ')));
        return aContent.localeCompare(bContent);
    });
    return [...letterLogs, ...digitLogs];
};`,
    explanation:
      '1. Separate logs into letter-logs and digit-logs based on the first character after the identifier.\n' +
      '2. Sort letter-logs by content first, then by identifier as tiebreaker.\n' +
      '3. Digit-logs maintain their original relative order.\n' +
      '4. Concatenate sorted letter-logs followed by digit-logs.',
    timeComplexity: 'O(n * k * log n) where k is max log length',
    spaceComplexity: 'O(n * k)',
    hints: [
      'Classify each log as letter-log or digit-log.',
      'Only letter-logs need sorting.',
      'Sort letter-logs by content first, identifier second.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 938. Range Sum of BST
  // ---------------------------------------------------------------------------
  {
    id: 938,
    description:
      'Given the root of a binary search tree and two integers low and high, return the sum of values of all nodes with a value in the inclusive range [low, high].',
    examples:
      'Input: root = [10,5,15,3,7,null,18], low = 7, high = 15\nOutput: 32\nExplanation: Nodes 7, 10, and 15 are in range. 7+10+15 = 32.',
    intuition:
      'The BST property gives you free pruning. If a node\'s value is below the range, everything in its left subtree is also below the range - skip it entirely. Similarly for values above the range. This cuts the search space dramatically.',
    approach:
      'Use DFS exploiting BST properties. If the current node value is less than low, only search the right subtree. If greater than high, only search the left subtree. Otherwise, include the value and search both.',
    code: `class Solution:
    def rangeSumBST(self, root, low: int, high: int) -> int:
        if not root:
            return 0
        if root.val < low:
            return self.rangeSumBST(root.right, low, high)
        if root.val > high:
            return self.rangeSumBST(root.left, low, high)
        return root.val + self.rangeSumBST(root.left, low, high) + self.rangeSumBST(root.right, low, high)`,
    jsCode: `var rangeSumBST = function(root, low, high) {
    if (!root) return 0;
    if (root.val < low) return rangeSumBST(root.right, low, high);
    if (root.val > high) return rangeSumBST(root.left, low, high);
    return root.val + rangeSumBST(root.left, low, high) + rangeSumBST(root.right, low, high);
};`,
    explanation:
      '1. If node is None, return 0.\n' +
      '2. If node value < low, all valid nodes are in the right subtree.\n' +
      '3. If node value > high, all valid nodes are in the left subtree.\n' +
      '4. Otherwise, include this node value and recurse on both subtrees.\n' +
      '5. BST property allows pruning, avoiding unnecessary traversal.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is tree height',
    hints: [
      'Use the BST property to prune branches.',
      'If current value < low, only the right subtree can contain values in range.',
      'If current value > high, only the left subtree can contain values in range.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 939. Minimum Area Rectangle
  // ---------------------------------------------------------------------------
  {
    id: 939,
    description:
      'You are given an array of points where points[i] = [xi, yi]. Return the minimum area of a rectangle formed from these points, with sides parallel to the X and Y axes. If there is no such rectangle, return 0.',
    examples:
      'Input: points = [[1,1],[1,3],[3,1],[3,3],[2,2]]\nOutput: 4\nExplanation: Rectangle from (1,1), (1,3), (3,1), (3,3) has area 4.',
    intuition:
      'Sorting by x-coordinate first ensures you process points left to right. For each new point, it can pair with points that have a lower y-coordinate. Maintaining a set of candidate y-values lets you efficiently find the closest legal pair.',
    approach:
      'Store all points in a set. For each pair of points that could be diagonal corners (different x and y), check if the other two corners exist. Track the minimum area.',
    code: `class Solution:
    def minAreaRect(self, points: list[list[int]]) -> int:
        point_set = set(map(tuple, points))
        ans = float('inf')
        pts = list(point_set)
        for i in range(len(pts)):
            for j in range(i + 1, len(pts)):
                x1, y1 = pts[i]
                x2, y2 = pts[j]
                if x1 != x2 and y1 != y2:
                    if (x1, y2) in point_set and (x2, y1) in point_set:
                        area = abs(x2 - x1) * abs(y2 - y1)
                        ans = min(ans, area)
        return ans if ans != float('inf') else 0`,
    jsCode: `var minAreaRect = function(points) {
    const pointSet = new Set(points.map(p => p[0] + ',' + p[1]));
    let ans = Infinity;
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const [x1, y1] = points[i];
            const [x2, y2] = points[j];
            if (x1 !== x2 && y1 !== y2) {
                if (pointSet.has(x1 + ',' + y2) && pointSet.has(x2 + ',' + y1)) {
                    ans = Math.min(ans, Math.abs(x2 - x1) * Math.abs(y2 - y1));
                }
            }
        }
    }
    return ans === Infinity ? 0 : ans;
};`,
    explanation:
      '1. Store all points in a set for O(1) lookup.\n' +
      '2. For each pair of points with different x and y coordinates (potential diagonal).\n' +
      '3. Check if the other two corners of the rectangle exist in the set.\n' +
      '4. Compute the area and track the minimum.\n' +
      '5. Return 0 if no rectangle was found.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    hints: [
      'Two points define a diagonal if they have different x and y coordinates.',
      'For each diagonal pair, check if the other two corners exist.',
      'Use a set for O(1) point lookup.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 945. Minimum Increment to Make Array Unique
  // ---------------------------------------------------------------------------
  {
    id: 945,
    description:
      'You are given an integer array nums. In one move, you can pick an index i and increment nums[i] by 1. Return the minimum number of moves to make every value in nums unique.',
    examples:
      'Input: nums = [1,2,2]\nOutput: 1\nExplanation: Increment one of the 2s to 3.',
    intuition:
      'Sort the array and greedily ensure each element is at least one more than the previous. When you need to bump a value up, the difference is the number of moves. Sorting makes it clear what the minimum unique values should be.',
    approach:
      'Sort the array. Iterate through and ensure each element is at least prev + 1. If it is not, increment it to prev + 1 and count the difference as moves.',
    code: `class Solution:
    def minIncrementForUnique(self, nums: list[int]) -> int:
        nums.sort()
        moves = 0
        for i in range(1, len(nums)):
            if nums[i] <= nums[i-1]:
                target = nums[i-1] + 1
                moves += target - nums[i]
                nums[i] = target
        return moves`,
    jsCode: `var minIncrementForUnique = function(nums) {
    nums.sort((a, b) => a - b);
    let moves = 0;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] <= nums[i-1]) {
            const target = nums[i-1] + 1;
            moves += target - nums[i];
            nums[i] = target;
        }
    }
    return moves;
};`,
    explanation:
      '1. Sort the array so duplicates are adjacent.\n' +
      '2. For each element, if it is <= the previous element, it must be incremented.\n' +
      '3. Set it to previous + 1 and add the difference to moves.\n' +
      '4. This greedy approach ensures each element is strictly greater than the previous.\n' +
      '5. The total moves is minimized because we increment by the smallest amount necessary.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1) if sorting in place',
    hints: [
      'Sort the array first so duplicates are adjacent.',
      'Greedily increment duplicates to be one more than the previous element.',
      'Count the total increments needed.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 946. Validate Stack Sequences
  // ---------------------------------------------------------------------------
  {
    id: 946,
    description:
      'Given two integer arrays pushed and popped, each with distinct values, return true if this could have been the result of a sequence of push and pop operations on an initially empty stack.',
    examples:
      'Input: pushed = [1,2,3,4,5], popped = [4,5,3,2,1]\nOutput: true\nExplanation: Push 1,2,3,4; pop 4; push 5; pop 5,3,2,1.',
    intuition:
      'Simulate the push/pop process. Push elements in order. After each push, keep popping if the stack top matches the next expected pop value. If the stack is empty at the end, the sequence is valid.',
    approach:
      'Simulate the process using a stack. Push elements from the pushed array. After each push, pop from the stack while the top matches the next expected popped element. If the stack is empty at the end, return true.',
    code: `class Solution:
    def validateStackSequences(self, pushed: list[int], popped: list[int]) -> bool:
        stack = []
        j = 0
        for val in pushed:
            stack.append(val)
            while stack and stack[-1] == popped[j]:
                stack.pop()
                j += 1
        return j == len(popped)`,
    jsCode: `var validateStackSequences = function(pushed, popped) {
    const stack = [];
    let j = 0;
    for (const val of pushed) {
        stack.push(val);
        while (stack.length > 0 && stack[stack.length - 1] === popped[j]) {
            stack.pop();
            j++;
        }
    }
    return j === popped.length;
};`,
    explanation:
      '1. Iterate through pushed array, pushing each element onto the stack.\n' +
      '2. After each push, check if the stack top matches popped[j].\n' +
      '3. If it matches, pop and advance j.\n' +
      '4. Continue popping while the top matches.\n' +
      '5. If j reaches the end of popped, all elements were correctly popped.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Simulate the stack operations.',
      'Push elements and pop whenever the top matches the expected popped value.',
      'At the end, check if all elements have been popped.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 947. Most Stones Removed with Same Row or Column
  // ---------------------------------------------------------------------------
  {
    id: 947,
    description:
      'On a 2D plane, we place n stones at integer coordinates. A stone can be removed if it shares the same row or column as another stone that has not been removed. Return the largest possible number of stones that can be removed.',
    examples:
      'Input: stones = [[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]]\nOutput: 5',
    intuition:
      'Stones in the same row or column are connected. This forms groups (connected components via Union-Find). Within each group of size k, you can remove k-1 stones by always leaving one behind. So the answer is total stones minus the number of groups.',
    approach:
      'Stones in the same row or column form connected components. Within each connected component of size k, we can remove k-1 stones. Use Union-Find to group stones by shared rows/columns. Answer = total stones - number of components.',
    code: `class Solution:
    def removeStones(self, stones: list[list[int]]) -> int:
        parent = {}
        def find(x):
            if x != parent.setdefault(x, x):
                parent[x] = find(parent[x])
            return parent[x]
        def union(a, b):
            parent[find(a)] = find(b)
        for r, c in stones:
            union(r, ~c)
        return len(stones) - len({find(r) for r, c in stones})`,
    jsCode: `var removeStones = function(stones) {
    const parent = new Map();
    const find = (x) => {
        if (!parent.has(x)) parent.set(x, x);
        if (parent.get(x) !== x) parent.set(x, find(parent.get(x)));
        return parent.get(x);
    };
    const union = (a, b) => { parent.set(find(a), find(b)); };
    for (const [r, c] of stones) {
        union(r, ~c);
    }
    const roots = new Set();
    for (const [r] of stones) {
        roots.add(find(r));
    }
    return stones.length - roots.size;
};`,
    explanation:
      '1. Use Union-Find where rows and columns are nodes.\n' +
      '2. For each stone at (r, c), union row r with column ~c (using complement to avoid collision).\n' +
      '3. Count the number of connected components among the stones.\n' +
      '4. Answer = total stones - number of connected components.\n' +
      '5. Each component of size k allows removing k-1 stones.',
    timeComplexity: 'O(n * alpha(n)) which is nearly O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Stones sharing a row or column are connected.',
      'Use Union-Find to group connected stones.',
      'In each connected component of size k, you can remove k-1 stones.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 951. Flip Equivalent Binary Trees
  // ---------------------------------------------------------------------------
  {
    id: 951,
    description:
      'For a binary tree T, we can define a flip operation as choosing any node and swapping the left and right child subtrees. Two binary trees are flip equivalent if we can make one equal to the other after some number of flips. Return true if root1 and root2 are flip equivalent.',
    examples:
      'Input: root1 = [1,2,3,4,5,6,null,null,null,7,8], root2 = [1,3,2,null,6,4,5,null,null,null,null,8,7]\nOutput: true',
    intuition:
      'For each internal node in a full binary tree, it must match either (pre=left first) or (pre=right first). Count the nodes where both children have different structures. Each such node doubles the possible arrangements, giving 2^(count of ambiguous nodes).',
    approach:
      'Recursively compare two trees. At each node, either the children match directly or they match after flipping. Check both possibilities.',
    code: `class Solution:
    def flipEquiv(self, root1, root2) -> bool:
        if not root1 and not root2:
            return True
        if not root1 or not root2 or root1.val != root2.val:
            return False
        return (self.flipEquiv(root1.left, root2.left) and self.flipEquiv(root1.right, root2.right)) or \
               (self.flipEquiv(root1.left, root2.right) and self.flipEquiv(root1.right, root2.left))`,
    jsCode: `var flipEquiv = function(root1, root2) {
    if (!root1 && !root2) return true;
    if (!root1 || !root2 || root1.val !== root2.val) return false;
    return (flipEquiv(root1.left, root2.left) && flipEquiv(root1.right, root2.right)) ||
           (flipEquiv(root1.left, root2.right) && flipEquiv(root1.right, root2.left));
};`,
    explanation:
      '1. If both nodes are None, they are equivalent.\n' +
      '2. If one is None or values differ, they are not equivalent.\n' +
      '3. Check if children match without flipping: left-left and right-right.\n' +
      '4. Or check if children match with flipping: left-right and right-left.\n' +
      '5. If either option works, the trees are flip equivalent.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is tree height',
    hints: [
      'Two trees are flip equivalent if their roots match and children are flip equivalent (possibly swapped).',
      'Check both the non-flipped and flipped configurations.',
      'Base cases: both null (true), one null or different values (false).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 953. Verifying an Alien Dictionary
  // ---------------------------------------------------------------------------
  {
    id: 953,
    description:
      'In an alien language, they use the English lowercase letters but in a different order. Given a sequence of words and the order of the alien alphabet, return true if the words are sorted lexicographically in this alien language.',
    examples:
      'Input: words = ["hello","leetcode"], order = "hlabcdefgijkmnopqrstuvwxyz"\nOutput: true\nExplanation: h comes before l in this alien language.',
    intuition:
      'Build a mapping from the alien alphabet to standard order (0, 1, 2, ...). Then check if the words are sorted according to this custom mapping - just like checking if words are alphabetically sorted, but with a different alphabet.',
    approach:
      'Build a mapping from each character to its rank in the alien order. Compare each adjacent pair of words character by character using the alien order. If all pairs are in order, return true.',
    code: `class Solution:
    def isAlienSorted(self, words: list[str], order: str) -> bool:
        rank = {c: i for i, c in enumerate(order)}
        for i in range(len(words) - 1):
            w1, w2 = words[i], words[i+1]
            for j in range(len(w1)):
                if j >= len(w2):
                    return False
                if rank[w1[j]] < rank[w2[j]]:
                    break
                if rank[w1[j]] > rank[w2[j]]:
                    return False
        return True`,
    jsCode: `var isAlienSorted = function(words, order) {
    const rank = {};
    for (let i = 0; i < order.length; i++) rank[order[i]] = i;
    for (let i = 0; i < words.length - 1; i++) {
        const w1 = words[i], w2 = words[i+1];
        let found = false;
        for (let j = 0; j < w1.length; j++) {
            if (j >= w2.length) return false;
            if (rank[w1[j]] < rank[w2[j]]) { found = true; break; }
            if (rank[w1[j]] > rank[w2[j]]) return false;
        }
    }
    return true;
};`,
    explanation:
      '1. Create a rank map from alien order.\n' +
      '2. Compare each adjacent pair of words.\n' +
      '3. Find the first position where characters differ.\n' +
      '4. If word1 is a prefix of word2 but longer, return False.\n' +
      '5. If the differing character in word1 has higher rank, return False.',
    timeComplexity: 'O(total characters across all words)',
    spaceComplexity: 'O(1) (26 characters)',
    hints: [
      'Map each character to its position in the alien order.',
      'Compare adjacent words like string comparison, but using the alien ranking.',
      'A longer word that is a prefix of a shorter word is not in order.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 958. Check Completeness of a Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 958,
    description:
      'Given the root of a binary tree, determine if it is a complete binary tree. A complete binary tree is one where every level except the last is completely filled, and all nodes in the last level are as far left as possible.',
    examples:
      'Input: root = [1,2,3,4,5,6]\nOutput: true',
    intuition:
      'In a complete binary tree, if you number nodes by BFS order, every null should come after all non-null nodes. BFS the tree and once you see a null, every subsequent node must also be null. Any non-null after a null means it is not complete.',
    approach:
      'Use BFS level by level. Once we encounter a None node, all subsequent nodes must also be None. If we see a non-None node after a None, the tree is not complete.',
    code: `class Solution:
    def isCompleteTree(self, root) -> bool:
        from collections import deque
        queue = deque([root])
        seen_null = False
        while queue:
            node = queue.popleft()
            if node is None:
                seen_null = True
            else:
                if seen_null:
                    return False
                queue.append(node.left)
                queue.append(node.right)
        return True`,
    jsCode: `var isCompleteTree = function(root) {
    const queue = [root];
    let seenNull = false;
    let idx = 0;
    while (idx < queue.length) {
        const node = queue[idx++];
        if (node === null) {
            seenNull = true;
        } else {
            if (seenNull) return false;
            queue.push(node.left);
            queue.push(node.right);
        }
    }
    return true;
};`,
    explanation:
      '1. BFS through the tree, including None children.\n' +
      '2. Track if we have seen a None node (seen_null flag).\n' +
      '3. If we encounter a non-None node after seeing a None, the tree is not complete.\n' +
      '4. If BFS completes without this violation, the tree is complete.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'In a complete binary tree, BFS should produce all non-null nodes before any null.',
      'Use BFS and check that no non-null node appears after a null.',
      'Include null children in the BFS queue.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 968. Binary Tree Cameras
  // ---------------------------------------------------------------------------
  {
    id: 968,
    description:
      'You are installing cameras on tree nodes. Each camera at a node can monitor its parent, itself, and its immediate children. Return the minimum number of cameras needed to monitor all nodes.',
    examples:
      'Input: root = [0,0,null,0,0]\nOutput: 1\nExplanation: One camera at the root monitors all 3 nodes.',
    intuition:
      'Work from the bottom up. Leaf nodes should NOT have cameras (wasteful). Instead, their parents should have cameras. This greedy strategy of placing cameras at every other level from the bottom minimizes the total number needed.',
    approach:
      'Use a greedy DFS approach. Each node returns one of three states: 0 (needs coverage), 1 (has camera), 2 (covered). Place cameras at parents of uncovered nodes, working bottom-up.',
    code: `class Solution:
    def minCameraCover(self, root) -> int:
        self.cameras = 0
        def dfs(node):
            if not node:
                return 2
            left = dfs(node.left)
            right = dfs(node.right)
            if left == 0 or right == 0:
                self.cameras += 1
                return 1
            if left == 1 or right == 1:
                return 2
            return 0
        if dfs(root) == 0:
            self.cameras += 1
        return self.cameras`,
    jsCode: `var minCameraCover = function(root) {
    let cameras = 0;
    const dfs = (node) => {
        if (!node) return 2;
        const left = dfs(node.left);
        const right = dfs(node.right);
        if (left === 0 || right === 0) { cameras++; return 1; }
        if (left === 1 || right === 1) return 2;
        return 0;
    };
    if (dfs(root) === 0) cameras++;
    return cameras;
};`,
    explanation:
      '1. State 0: node needs coverage. State 1: node has a camera. State 2: node is covered.\n' +
      '2. Null nodes return 2 (covered) so leaf parents can decide freely.\n' +
      '3. If any child needs coverage (state 0), place a camera here (return 1).\n' +
      '4. If any child has a camera (state 1), this node is covered (return 2).\n' +
      '5. Otherwise, this node needs coverage (return 0). Check root specially.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is tree height',
    hints: [
      'Place cameras as high as possible (at parents of leaves) to cover more nodes.',
      'Use post-order traversal with three states.',
      'Null nodes should be considered "covered" to avoid unnecessary leaf cameras.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 974. Subarray Sums Divisible by K
  // ---------------------------------------------------------------------------
  {
    id: 974,
    description:
      'Given an integer array nums and an integer k, return the number of non-empty subarrays that have a sum divisible by k.',
    examples:
      'Input: nums = [4,5,0,-2,-3,1], k = 5\nOutput: 7\nExplanation: Subarrays with sum divisible by 5: [4,5,0,-2,-3,1], [5], [5,0], [5,0,-2,-3], [0], [0,-2,-3], [-2,-3].',
    intuition:
      'If two prefix sums have the same remainder when divided by k, their difference (the subarray between them) is divisible by k. Count prefix sums by remainder using a hash map, and the number of pairs with each remainder gives the answer.',
    approach:
      'Use prefix sums modulo k. Two prefix sums with the same remainder mod k define a subarray divisible by k. Count remainders using a hash map.',
    code: `class Solution:
    def subarraysDivByK(self, nums: list[int], k: int) -> int:
        count = {0: 1}
        prefix = 0
        result = 0
        for num in nums:
            prefix = (prefix + num) % k
            result += count.get(prefix, 0)
            count[prefix] = count.get(prefix, 0) + 1
        return result`,
    jsCode: `var subarraysDivByK = function(nums, k) {
    const count = {0: 1};
    let prefix = 0, result = 0;
    for (const num of nums) {
        prefix = ((prefix + num) % k + k) % k;
        result += (count[prefix] || 0);
        count[prefix] = (count[prefix] || 0) + 1;
    }
    return result;
};`,
    explanation:
      '1. Maintain a running prefix sum modulo k.\n' +
      '2. If two prefix sums have the same remainder, the subarray between them is divisible by k.\n' +
      '3. Use a hash map to count occurrences of each remainder.\n' +
      '4. For each new remainder, add the count of previous occurrences to the result.\n' +
      '5. Initialize count with {0: 1} for subarrays starting from index 0.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k)',
    hints: [
      'Prefix sum modulo k groups subarrays by their remainder.',
      'Two equal remainders mean the subarray between them is divisible by k.',
      'Handle negative remainders by using Python\'s modulo (always non-negative).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 975. Odd Even Jump
  // ---------------------------------------------------------------------------
  {
    id: 975,
    description:
      'You are given an integer array arr. From each index, you perform jumps alternating between odd and even jumps. In an odd jump, jump to the smallest value >= arr[i] among indices > i (pick leftmost if tied). In an even jump, jump to the largest value <= arr[i]. Return how many starting indices can reach the end.',
    examples:
      'Input: arr = [10,13,12,14,15]\nOutput: 2\nExplanation: From index 3 and 4 you can reach the end.',
    intuition:
      'After transforming the array to +1/-1, you need to find when the running sum first reaches certain values. Use a map to record when each running sum is first achieved, and for each query jump, binary search or directly look up the answer.',
    approach:
      'Work backwards from the end. Use a sorted structure (SortedList or monotonic stack) to find the next higher and next lower elements. Use DP with two states: odd[i] (can reach end with odd jump from i) and even[i].',
    code: `class Solution:
    def oddEvenJumps(self, arr: list[int]) -> int:
        from sortedcontainers import SortedDict
        n = len(arr)
        odd = [False] * n
        even = [False] * n
        odd[-1] = even[-1] = True
        sd = SortedDict()
        sd[arr[-1]] = n - 1
        for i in range(n - 2, -1, -1):
            val = arr[i]
            idx = sd.bisect_left(val)
            if idx < len(sd):
                odd[i] = even[sd.values()[idx]]
            idx2 = sd.bisect_right(val) - 1
            if idx2 >= 0:
                even[i] = odd[sd.values()[idx2]]
            sd[val] = i
        return sum(odd)`,
    jsCode: `var oddEvenJumps = function(arr) {
    const n = arr.length;
    const odd = new Array(n).fill(false);
    const even = new Array(n).fill(false);
    odd[n-1] = even[n-1] = true;
    // Use a sorted map (TreeMap equivalent)
    const sorted = new Map(); // value -> index (rightmost)
    const keys = [];
    const insertKey = (val) => {
        let lo = 0, hi = keys.length;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (keys[mid] < val) lo = mid + 1; else hi = mid; }
        if (lo < keys.length && keys[lo] === val) return;
        keys.splice(lo, 0, val);
    };
    const bisectLeft = (val) => { let lo = 0, hi = keys.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (keys[mid] < val) lo = mid + 1; else hi = mid; } return lo; };
    const bisectRight = (val) => { let lo = 0, hi = keys.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (keys[mid] <= val) lo = mid + 1; else hi = mid; } return lo; };
    insertKey(arr[n-1]);
    sorted.set(arr[n-1], n-1);
    for (let i = n - 2; i >= 0; i--) {
        const val = arr[i];
        // Odd jump: smallest value >= val
        const idx = bisectLeft(val);
        if (idx < keys.length) {
            odd[i] = even[sorted.get(keys[idx])];
        }
        // Even jump: largest value <= val
        const idx2 = bisectRight(val) - 1;
        if (idx2 >= 0) {
            even[i] = odd[sorted.get(keys[idx2])];
        }
        insertKey(val);
        sorted.set(val, i);
    }
    return odd.filter(x => x).length;
};`,
    explanation:
      '1. odd[i] = can we reach the end starting with an odd jump from i.\n' +
      '2. even[i] = can we reach the end starting with an even jump from i.\n' +
      '3. Odd jump goes to the next >= value, which becomes an even jump target.\n' +
      '4. Even jump goes to the next <= value, which becomes an odd jump target.\n' +
      '5. Use a SortedDict to efficiently find next higher/lower elements.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Work backwards from the end of the array.',
      'An odd jump from i needs the smallest value >= arr[i] among indices > i.',
      'Use a sorted data structure to find these targets efficiently.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 977. Squares of a Sorted Array
  // ---------------------------------------------------------------------------
  {
    id: 977,
    description:
      'Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.',
    examples:
      'Input: nums = [-4,-1,0,3,10]\nOutput: [0,1,9,16,100]',
    intuition:
      'Since the input is sorted, the largest squares come from either end (large negative or large positive numbers). Use two pointers from both ends, comparing absolute values and filling the result array from the largest position backward.',
    approach:
      'Use two pointers at the start and end. The largest square is either from the most negative or most positive value. Build the result array from right to left.',
    code: `class Solution:
    def sortedSquares(self, nums: list[int]) -> list[int]:
        n = len(nums)
        result = [0] * n
        l, r = 0, n - 1
        for i in range(n - 1, -1, -1):
            if abs(nums[l]) > abs(nums[r]):
                result[i] = nums[l] ** 2
                l += 1
            else:
                result[i] = nums[r] ** 2
                r -= 1
        return result`,
    jsCode: `var sortedSquares = function(nums) {
    const n = nums.length;
    const result = new Array(n);
    let l = 0, r = n - 1;
    for (let i = n - 1; i >= 0; i--) {
        if (Math.abs(nums[l]) > Math.abs(nums[r])) {
            result[i] = nums[l] * nums[l];
            l++;
        } else {
            result[i] = nums[r] * nums[r];
            r--;
        }
    }
    return result;
};`,
    explanation:
      '1. Two pointers: l at the start, r at the end.\n' +
      '2. Compare absolute values at both pointers.\n' +
      '3. Place the larger square at the current position (filling right to left).\n' +
      '4. Move the pointer that was used.\n' +
      '5. This gives a sorted result in O(n) time.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'The largest squared values come from the extremes of the array.',
      'Use two pointers from both ends, filling the result from the back.',
      'Compare absolute values to decide which pointer to use.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 978. Longest Turbulent Subarray
  // ---------------------------------------------------------------------------
  {
    id: 978,
    description:
      'Given an integer array arr, return the length of a maximum size turbulent subarray. A subarray is turbulent if the comparison sign flips between each pair of adjacent elements (alternating > and < or < and >).',
    examples:
      'Input: arr = [9,4,2,10,7,8,8,1,9]\nOutput: 5\nExplanation: arr[1..4] = [4,2,10,7,8] is turbulent.',
    intuition:
      'A turbulent subarray alternates between increasing and decreasing. Scan the array once, extending the current turbulent window when the alternating pattern continues, and resetting when it breaks.',
    approach:
      'Track two counters: inc (length of turbulent subarray ending with an increase) and dec (length ending with a decrease). At each step, update based on comparison with the previous element.',
    code: `class Solution:
    def maxTurbulenceSize(self, arr: list[int]) -> int:
        n = len(arr)
        if n == 1:
            return 1
        inc = dec = 1
        ans = 1
        for i in range(1, n):
            if arr[i] > arr[i-1]:
                inc = dec + 1
                dec = 1
            elif arr[i] < arr[i-1]:
                dec = inc + 1
                inc = 1
            else:
                inc = dec = 1
            ans = max(ans, inc, dec)
        return ans`,
    jsCode: `var maxTurbulenceSize = function(arr) {
    const n = arr.length;
    if (n === 1) return 1;
    let inc = 1, dec = 1, ans = 1;
    for (let i = 1; i < n; i++) {
        if (arr[i] > arr[i-1]) { inc = dec + 1; dec = 1; }
        else if (arr[i] < arr[i-1]) { dec = inc + 1; inc = 1; }
        else { inc = 1; dec = 1; }
        ans = Math.max(ans, inc, dec);
    }
    return ans;
};`,
    explanation:
      '1. inc = length of turbulent subarray ending at i with arr[i] > arr[i-1].\n' +
      '2. dec = length of turbulent subarray ending at i with arr[i] < arr[i-1].\n' +
      '3. If arr[i] > arr[i-1], extend the dec chain (inc = dec + 1), reset dec.\n' +
      '4. If arr[i] < arr[i-1], extend the inc chain (dec = inc + 1), reset inc.\n' +
      '5. If equal, reset both to 1.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'A turbulent subarray alternates between increases and decreases.',
      'Track the current turbulent length ending in an increase vs a decrease.',
      'An increase extends a previous decrease, and vice versa.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 979. Distribute Coins in Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 979,
    description:
      'You are given the root of a binary tree with n nodes where each node has node.val coins. There are n coins in total. In one move, you can move a coin from one node to an adjacent node. Return the minimum number of moves needed so that every node has exactly one coin.',
    examples:
      'Input: root = [3,0,0]\nOutput: 2\nExplanation: Move 2 coins from root to its children.',
    intuition:
      'Think of each node as needing exactly 1 coin. If it has excess, it must send coins out. If it has deficit, it must receive coins. The total moves equals the sum of absolute flows across all edges, which you can compute bottom-up with DFS.',
    approach:
      'Use post-order DFS. Each node returns its excess coins (positive = surplus, negative = deficit). The number of moves through each edge equals the absolute value of the excess. Sum all these.',
    code: `class Solution:
    def distributeCoins(self, root) -> int:
        self.moves = 0
        def dfs(node):
            if not node:
                return 0
            left = dfs(node.left)
            right = dfs(node.right)
            self.moves += abs(left) + abs(right)
            return node.val - 1 + left + right
        dfs(root)
        return self.moves`,
    jsCode: `var distributeCoins = function(root) {
    let moves = 0;
    const dfs = (node) => {
        if (!node) return 0;
        const left = dfs(node.left);
        const right = dfs(node.right);
        moves += Math.abs(left) + Math.abs(right);
        return node.val - 1 + left + right;
    };
    dfs(root);
    return moves;
};`,
    explanation:
      '1. DFS returns the excess coins for each subtree (coins - nodes).\n' +
      '2. Each node needs 1 coin, so excess = node.val - 1 + left_excess + right_excess.\n' +
      '3. The moves through each edge equals |excess| of the child subtree.\n' +
      '4. Accumulate |left| + |right| at each node.\n' +
      '5. Total moves is the sum across all edges.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is tree height',
    hints: [
      'Think about the flow of coins through each edge.',
      'The number of coins passing through an edge is the absolute excess of the subtree.',
      'Use post-order DFS to compute excess from leaves to root.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 980. Unique Paths III
  // ---------------------------------------------------------------------------
  {
    id: 980,
    description:
      'On a 2D grid, there are 4 types of squares: 1 is the starting square, 2 is the ending square, 0 is an empty square to walk over, -1 is an obstacle. Return the number of 4-directional paths from start to end that walk over every non-obstacle square exactly once.',
    examples:
      'Input: grid = [[1,0,0,0],[0,0,0,0],[0,0,2,-1]]\nOutput: 2',
    intuition:
      'With a grid this small (at most 20 cells), you can try every possible path that visits all non-obstacle cells exactly once. Backtracking with cell marking handles this exhaustive search efficiently.',
    approach:
      'Count the number of empty squares (plus start). Use backtracking DFS from the start square. When reaching the end, check if all empty squares have been visited. Count valid paths.',
    code: `class Solution:
    def uniquePathsIII(self, grid: list[list[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        empty = 1
        sr = sc = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 0:
                    empty += 1
                elif grid[r][c] == 1:
                    sr, sc = r, c
        self.result = 0
        def dfs(r, c, remaining):
            if grid[r][c] == 2:
                if remaining == 0:
                    self.result += 1
                return
            temp = grid[r][c]
            grid[r][c] = -1
            for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                nr, nc = r+dr, c+dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != -1:
                    dfs(nr, nc, remaining - 1)
            grid[r][c] = temp
        dfs(sr, sc, empty)
        return self.result`,
    jsCode: `var uniquePathsIII = function(grid) {
    const rows = grid.length, cols = grid[0].length;
    let empty = 1, sr = 0, sc = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 0) empty++;
            else if (grid[r][c] === 1) { sr = r; sc = c; }
        }
    }
    let result = 0;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    const dfs = (r, c, remaining) => {
        if (grid[r][c] === 2) { if (remaining === 0) result++; return; }
        const temp = grid[r][c];
        grid[r][c] = -1;
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] !== -1) {
                dfs(nr, nc, remaining - 1);
            }
        }
        grid[r][c] = temp;
    };
    dfs(sr, sc, empty);
    return result;
};`,
    explanation:
      '1. Count empty squares (including start) to know how many must be visited.\n' +
      '2. DFS from start, marking visited cells as -1 (obstacle) temporarily.\n' +
      '3. When reaching the end (value 2), check if all empty squares were visited (remaining == 0).\n' +
      '4. Backtrack by restoring the cell value after DFS.\n' +
      '5. Count all valid paths.',
    timeComplexity: 'O(3^(r*c)) worst case, but pruned significantly',
    spaceComplexity: 'O(r*c)',
    hints: [
      'Count the total non-obstacle squares to know when a path is complete.',
      'Use backtracking DFS, marking cells as visited.',
      'A valid path visits every empty cell exactly once and ends at the target.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 981. Time Based Key-Value Store
  // ---------------------------------------------------------------------------
  {
    id: 981,
    description:
      'Design a time-based key-value data structure that can store multiple values for the same key at different timestamps and retrieve the value at a certain timestamp. set(key, value, timestamp) stores the key-value pair with the given timestamp. get(key, timestamp) returns the value with the largest timestamp <= the given timestamp.',
    examples:
      'Input: ["TimeMap","set","get","get","set","get","get"]\n[[],["foo","bar",1],["foo",1],["foo",3],["foo","bar2",4],["foo",4],["foo",5]]\nOutput: [null,null,"bar","bar",null,"bar2","bar2"]',
    intuition:
      'Instead of copying the entire map on each timestamp, store a list of (timestamp, value) pairs for each key. When retrieving, binary search for the latest timestamp that does not exceed the query timestamp. This is both space and time efficient.',
    approach:
      'Use a dictionary mapping keys to a list of (timestamp, value) pairs. Since timestamps are strictly increasing, the list is sorted. Use binary search for get() to find the largest timestamp <= the query.',
    code: `class TimeMap:
    def __init__(self):
        self.store = {}

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.store.setdefault(key, []).append((timestamp, value))

    def get(self, key: str, timestamp: int) -> str:
        if key not in self.store:
            return ""
        arr = self.store[key]
        lo, hi = 0, len(arr) - 1
        result = ""
        while lo <= hi:
            mid = (lo + hi) // 2
            if arr[mid][0] <= timestamp:
                result = arr[mid][1]
                lo = mid + 1
            else:
                hi = mid - 1
        return result`,
    jsCode: `var TimeMap = function() {
    this.store = {};
};
TimeMap.prototype.set = function(key, value, timestamp) {
    if (!this.store[key]) this.store[key] = [];
    this.store[key].push([timestamp, value]);
};
TimeMap.prototype.get = function(key, timestamp) {
    if (!this.store[key]) return "";
    const arr = this.store[key];
    let lo = 0, hi = arr.length - 1, result = "";
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid][0] <= timestamp) {
            result = arr[mid][1];
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return result;
};`,
    explanation:
      '1. Store maps each key to a list of (timestamp, value) pairs.\n' +
      '2. set() appends to the list (timestamps are already increasing).\n' +
      '3. get() uses binary search to find the latest timestamp <= query.\n' +
      '4. If arr[mid] timestamp <= query, update result and search right.\n' +
      '5. Otherwise, search left. Return the best result found.',
    timeComplexity: 'O(1) for set, O(log n) for get',
    spaceComplexity: 'O(n)',
    hints: [
      'Timestamps are strictly increasing, so the list is naturally sorted.',
      'Binary search efficiently finds the right timestamp.',
      'Use bisect_right or manual binary search for the upper bound.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 983. Minimum Cost For Tickets
  // ---------------------------------------------------------------------------
  {
    id: 983,
    description:
      'You plan to travel on some days given in an array days. You can buy 1-day, 7-day, or 30-day passes at given costs. Return the minimum cost to cover all travel days.',
    examples:
      'Input: days = [1,4,6,7,8,20], costs = [2,7,15]\nOutput: 11\nExplanation: Buy a 7-day pass on day 1 (covers days 1-7) and a 1-day pass on days 8 and 20.',
    intuition:
      'At each travel day, decide whether to buy a 1-day, 7-day, or 30-day pass. DP forward through the days: the cost on day i is the minimum of (cost[i-1] + 1-day price) vs (cost[i-7] + 7-day price) vs (cost[i-30] + 30-day price).',
    approach:
      'Use DP where dp[i] is the min cost to cover travel from days[i] onward. For each travel day, try buying a 1-day, 7-day, or 30-day pass and take the minimum cost.',
    code: `class Solution:
    def mincostTickets(self, days: list[int], costs: list[int]) -> int:
        day_set = set(days)
        last_day = days[-1]
        dp = [0] * (last_day + 1)
        for d in range(1, last_day + 1):
            if d not in day_set:
                dp[d] = dp[d - 1]
            else:
                dp[d] = min(
                    dp[d - 1] + costs[0],
                    dp[max(0, d - 7)] + costs[1],
                    dp[max(0, d - 30)] + costs[2]
                )
        return dp[last_day]`,
    jsCode: `var mincostTickets = function(days, costs) {
    const daySet = new Set(days);
    const lastDay = days[days.length - 1];
    const dp = new Array(lastDay + 1).fill(0);
    for (let d = 1; d <= lastDay; d++) {
        if (!daySet.has(d)) {
            dp[d] = dp[d - 1];
        } else {
            dp[d] = Math.min(
                dp[d - 1] + costs[0],
                dp[Math.max(0, d - 7)] + costs[1],
                dp[Math.max(0, d - 30)] + costs[2]
            );
        }
    }
    return dp[lastDay];
};`,
    explanation:
      '1. dp[d] = minimum cost to cover all travel days up to day d.\n' +
      '2. If day d is not a travel day, dp[d] = dp[d-1] (no cost added).\n' +
      '3. If day d is a travel day, consider buying a 1-day, 7-day, or 30-day pass.\n' +
      '4. Each pass covers days back to d-1, d-7, or d-30 respectively.\n' +
      '5. Take the minimum of the three options.',
    timeComplexity: 'O(max(days))',
    spaceComplexity: 'O(max(days))',
    hints: [
      'DP on day numbers, not on the index of the days array.',
      'On non-travel days, the cost is the same as the previous day.',
      'On travel days, compare costs of 1-day, 7-day, and 30-day passes.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 986. Interval List Intersections
  // ---------------------------------------------------------------------------
  {
    id: 986,
    description:
      'You are given two lists of closed intervals firstList and secondList, each sorted by start time and pairwise disjoint. Return the intersection of these two interval lists.',
    examples:
      'Input: firstList = [[0,2],[5,10],[13,23],[24,25]], secondList = [[1,5],[8,12],[15,24],[25,26]]\nOutput: [[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]',
    intuition:
      'Two sorted interval lists can be intersected with a two-pointer merge. The intersection of any two overlapping intervals is [max of starts, min of ends]. Advance whichever pointer has the earlier-ending interval.',
    approach:
      'Use two pointers, one for each list. At each step, compute the intersection of the current intervals. If they overlap, add the intersection. Advance the pointer with the smaller end.',
    code: `class Solution:
    def intervalIntersection(self, firstList: list[list[int]], secondList: list[list[int]]) -> list[list[int]]:
        i = j = 0
        result = []
        while i < len(firstList) and j < len(secondList):
            lo = max(firstList[i][0], secondList[j][0])
            hi = min(firstList[i][1], secondList[j][1])
            if lo <= hi:
                result.append([lo, hi])
            if firstList[i][1] < secondList[j][1]:
                i += 1
            else:
                j += 1
        return result`,
    jsCode: `var intervalIntersection = function(firstList, secondList) {
    let i = 0, j = 0;
    const result = [];
    while (i < firstList.length && j < secondList.length) {
        const lo = Math.max(firstList[i][0], secondList[j][0]);
        const hi = Math.min(firstList[i][1], secondList[j][1]);
        if (lo <= hi) result.push([lo, hi]);
        if (firstList[i][1] < secondList[j][1]) i++;
        else j++;
    }
    return result;
};`,
    explanation:
      '1. Two pointers i, j start at the beginning of each list.\n' +
      '2. The intersection of current intervals is [max(starts), min(ends)].\n' +
      '3. If lo <= hi, the intervals overlap, add the intersection.\n' +
      '4. Advance the pointer whose interval ends first.\n' +
      '5. Continue until one list is exhausted.',
    timeComplexity: 'O(m + n)',
    spaceComplexity: 'O(m + n) for the result',
    hints: [
      'Two sorted interval lists can be merged with two pointers.',
      'The intersection of two intervals is [max of starts, min of ends].',
      'Advance the pointer with the earlier ending interval.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 987. Vertical Order Traversal of a Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 987,
    description:
      'Given the root of a binary tree, calculate the vertical order traversal. For each column (left to right), report nodes from top to bottom. Nodes in the same row and column are sorted by value.',
    examples:
      'Input: root = [3,9,20,null,null,15,7]\nOutput: [[9],[3,15],[20],[7]]',
    intuition:
      'Assign (column, row) coordinates to each node during DFS. Sorting all nodes by column, then row, then value gives you the vertical order traversal. Grouping by column produces the final result.',
    approach:
      'DFS to collect (col, row, val) for each node. Sort by column, then row, then value. Group by column to build the result.',
    code: `class Solution:
    def verticalTraversal(self, root) -> list[list[int]]:
        nodes = []
        def dfs(node, row, col):
            if not node:
                return
            nodes.append((col, row, node.val))
            dfs(node.left, row + 1, col - 1)
            dfs(node.right, row + 1, col + 1)
        dfs(root, 0, 0)
        nodes.sort()
        result = []
        prev_col = float('-inf')
        for col, row, val in nodes:
            if col != prev_col:
                result.append([])
                prev_col = col
            result[-1].append(val)
        return result`,
    jsCode: `var verticalTraversal = function(root) {
    const nodes = [];
    const dfs = (node, row, col) => {
        if (!node) return;
        nodes.push([col, row, node.val]);
        dfs(node.left, row + 1, col - 1);
        dfs(node.right, row + 1, col + 1);
    };
    dfs(root, 0, 0);
    nodes.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    const result = [];
    let prevCol = -Infinity;
    for (const [col, row, val] of nodes) {
        if (col !== prevCol) {
            result.push([]);
            prevCol = col;
        }
        result[result.length - 1].push(val);
    }
    return result;
};`,
    explanation:
      '1. DFS collects (column, row, value) for each node.\n' +
      '2. Sort by column first, then row, then value.\n' +
      '3. Group nodes by column into the result.\n' +
      '4. Within the same column and row, nodes are sorted by value.\n' +
      '5. Return the grouped result.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Assign (column, row) coordinates to each node.',
      'Sort by column, then row, then value.',
      'Group sorted nodes by column.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 990. Satisfiability of Equality Equations
  // ---------------------------------------------------------------------------
  {
    id: 990,
    description:
      'You are given an array of strings equations where each is of the form "xi==xj" or "xi!=xj". Return true if it is possible to assign integers to variable names to satisfy all the given equations.',
    examples:
      'Input: equations = ["a==b","b!=a"]\nOutput: false\nExplanation: a==b and b!=a are contradictory.',
    intuition:
      'If a==b and b==c, then a==c. This is transitivity, which Union-Find handles perfectly. Group all equal variables together, then check that no inequality constraint connects two variables in the same group.',
    approach:
      'Use Union-Find. First process all == equations to union the variables. Then check all != equations. If two variables in a != equation are in the same component, return false.',
    code: `class Solution:
    def equationsPossible(self, equations: list[str]) -> bool:
        parent = list(range(26))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        def union(a, b):
            parent[find(a)] = find(b)
        for eq in equations:
            if eq[1] == '=':
                union(ord(eq[0]) - ord('a'), ord(eq[3]) - ord('a'))
        for eq in equations:
            if eq[1] == '!':
                if find(ord(eq[0]) - ord('a')) == find(ord(eq[3]) - ord('a')):
                    return False
        return True`,
    jsCode: `var equationsPossible = function(equations) {
    const parent = Array.from({length: 26}, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    const union = (a, b) => { parent[find(a)] = find(b); };
    for (const eq of equations) {
        if (eq[1] === '=') {
            union(eq.charCodeAt(0) - 97, eq.charCodeAt(3) - 97);
        }
    }
    for (const eq of equations) {
        if (eq[1] === '!') {
            if (find(eq.charCodeAt(0) - 97) === find(eq.charCodeAt(3) - 97)) return false;
        }
    }
    return true;
};`,
    explanation:
      '1. Initialize Union-Find with 26 variables (a-z).\n' +
      '2. First pass: union all variables connected by ==.\n' +
      '3. Second pass: check all != equations.\n' +
      '4. If two variables in a != are in the same set, return False.\n' +
      '5. If no contradiction is found, return True.',
    timeComplexity: 'O(n * alpha(26)) which is effectively O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Use Union-Find to group equal variables.',
      'Process equality first, then check inequalities.',
      'If an inequality involves two variables in the same group, it is unsatisfiable.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 992. Subarrays with K Different Integers
  // ---------------------------------------------------------------------------
  {
    id: 992,
    description:
      'Given an integer array nums and an integer k, return the number of good subarrays. A good subarray has exactly k different integers.',
    examples:
      'Input: nums = [1,2,1,2,3], k = 2\nOutput: 7\nExplanation: [1,2], [2,1], [1,2], [2,3], [1,2,1], [2,1,2], [1,2,1,2] are good subarrays.',
    intuition:
      'Counting subarrays with exactly k distinct values is hard directly, but \'at most k\' minus \'at most k-1\' gives you \'exactly k\'. The sliding window easily solves the \'at most k\' variant by shrinking the window when distinct count exceeds k.',
    approach:
      'Use the technique: exactly(k) = atMost(k) - atMost(k-1). Implement atMost(k) using a sliding window with a frequency map.',
    code: `class Solution:
    def subarraysWithKDistinct(self, nums: list[int], k: int) -> int:
        def atMost(k):
            count = {}
            left = result = 0
            for right in range(len(nums)):
                count[nums[right]] = count.get(nums[right], 0) + 1
                while len(count) > k:
                    count[nums[left]] -= 1
                    if count[nums[left]] == 0:
                        del count[nums[left]]
                    left += 1
                result += right - left + 1
            return result
        return atMost(k) - atMost(k - 1)`,
    jsCode: `var subarraysWithKDistinct = function(nums, k) {
    const atMost = (k) => {
        const count = new Map();
        let left = 0, result = 0;
        for (let right = 0; right < nums.length; right++) {
            count.set(nums[right], (count.get(nums[right]) || 0) + 1);
            while (count.size > k) {
                count.set(nums[left], count.get(nums[left]) - 1);
                if (count.get(nums[left]) === 0) count.delete(nums[left]);
                left++;
            }
            result += right - left + 1;
        }
        return result;
    };
    return atMost(k) - atMost(k - 1);
};`,
    explanation:
      '1. atMost(k) counts subarrays with at most k distinct integers.\n' +
      '2. exactly(k) = atMost(k) - atMost(k-1).\n' +
      '3. atMost uses a sliding window: expand right, shrink left when distinct count > k.\n' +
      '4. For each right, the number of valid subarrays ending at right is (right - left + 1).\n' +
      '5. Subtract the two atMost results to get the exact count.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Exactly k distinct = at most k distinct minus at most (k-1) distinct.',
      'Implement atMost(k) with a sliding window.',
      'The window shrinks when the number of distinct integers exceeds k.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 997. Find the Town Judge
  // ---------------------------------------------------------------------------
  {
    id: 997,
    description:
      'In a town with n people labeled 1 to n, there might be a town judge. The judge trusts nobody but everybody else trusts the judge. Given trust[i] = [a, b] meaning person a trusts person b, return the judge\'s label or -1.',
    examples:
      'Input: n = 2, trust = [[1,2]]\nOutput: 2\nExplanation: Person 1 trusts person 2, and person 2 trusts nobody. Person 2 is the judge.',
    intuition:
      'The town judge trusts nobody (out-degree 0) and is trusted by everyone else (in-degree n-1). Track trust scores: +1 for being trusted, -1 for trusting someone. The person with score n-1 is the judge.',
    approach:
      'Track the trust balance for each person: +1 for being trusted, -1 for trusting someone. The judge has a trust balance of n-1 (trusted by everyone, trusts nobody).',
    code: `class Solution:
    def findJudge(self, n: int, trust: list[list[int]]) -> int:
        balance = [0] * (n + 1)
        for a, b in trust:
            balance[a] -= 1
            balance[b] += 1
        for i in range(1, n + 1):
            if balance[i] == n - 1:
                return i
        return -1`,
    jsCode: `var findJudge = function(n, trust) {
    const balance = new Array(n + 1).fill(0);
    for (const [a, b] of trust) {
        balance[a]--;
        balance[b]++;
    }
    for (let i = 1; i <= n; i++) {
        if (balance[i] === n - 1) return i;
    }
    return -1;
};`,
    explanation:
      '1. Create a balance array for each person.\n' +
      '2. For each trust relation [a, b], a loses 1 trust and b gains 1.\n' +
      '3. The judge trusts nobody (no outgoing) and is trusted by n-1 people (n-1 incoming).\n' +
      '4. The judge has balance = n-1.\n' +
      '5. Return the person with balance n-1, or -1 if not found.',
    timeComplexity: 'O(n + E) where E is the number of trust relations',
    spaceComplexity: 'O(n)',
    hints: [
      'Think about the in-degree and out-degree of each person.',
      'The judge has in-degree n-1 and out-degree 0.',
      'Use a single balance array: in-degree minus out-degree.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1002. Find Common Characters
  // ---------------------------------------------------------------------------
  {
    id: 1002,
    description:
      'Given a string array words, return an array of all characters that show up in all strings within the list, including duplicates. You may return the answer in any order.',
    examples:
      'Input: words = ["bella","label","roller"]\nOutput: ["e","l","l"]\nExplanation: e appears in all words; l appears at least twice in all words.',
    intuition:
      'For a character to appear in every string, it must be present in all of them. The minimum count across all strings determines how many times it appears in the common result. Intersect character frequency maps across all strings.',
    approach:
      'For each character, track the minimum frequency across all words. The common characters are those with minimum frequency > 0, repeated that many times.',
    code: `class Solution:
    def commonChars(self, words: list[str]) -> list[str]:
        from collections import Counter
        common = Counter(words[0])
        for word in words[1:]:
            common &= Counter(word)
        result = []
        for char, count in common.items():
            result.extend([char] * count)
        return result`,
    jsCode: `var commonChars = function(words) {
    let common = {};
    for (const c of words[0]) common[c] = (common[c] || 0) + 1;
    for (let i = 1; i < words.length; i++) {
        const count = {};
        for (const c of words[i]) count[c] = (count[c] || 0) + 1;
        for (const c in common) {
            if (count[c]) common[c] = Math.min(common[c], count[c]);
            else delete common[c];
        }
    }
    const result = [];
    for (const c in common) {
        for (let i = 0; i < common[c]; i++) result.push(c);
    }
    return result;
};`,
    explanation:
      '1. Start with the character count of the first word.\n' +
      '2. For each subsequent word, take the intersection of counts (minimum of each character).\n' +
      '3. Counter & Counter gives the minimum count for each shared character.\n' +
      '4. Expand each character by its final count into the result.\n' +
      '5. Return the result list.',
    timeComplexity: 'O(n * k) where k is average word length',
    spaceComplexity: 'O(1) (at most 26 characters)',
    hints: [
      'Count character frequencies in each word.',
      'Take the minimum frequency for each character across all words.',
      'Counter intersection (&) gives the minimum counts.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1005. Maximize Sum Of Array After K Negations
  // ---------------------------------------------------------------------------
  {
    id: 1005,
    description:
      'Given an integer array nums and an integer k, modify the array by choosing an index i and replacing nums[i] with -nums[i], exactly k times. You may choose the same index multiple times. Return the largest possible sum of the array.',
    examples:
      'Input: nums = [4,2,3], k = 1\nOutput: 5\nExplanation: Negate 2 to get [4,-2,3], but better to negate the smallest: not applicable here. Actually negate index 0 is not optimal. Negate 2: sum = 4 + (-2) + 3 = 5.',
    intuition:
      'Sort the array and greedily negate the smallest values first. If all values are positive and you still have negations left, repeatedly negate the smallest element (toggling it). This maximizes the total sum.',
    approach:
      'Sort the array. Negate the most negative numbers first. If k remains odd after all negatives are flipped, negate the smallest absolute value element.',
    code: `class Solution:
    def largestSumAfterKNegations(self, nums: list[int], k: int) -> int:
        nums.sort()
        i = 0
        while k > 0 and i < len(nums) and nums[i] < 0:
            nums[i] = -nums[i]
            i += 1
            k -= 1
        if k % 2 == 1:
            nums.sort()
            nums[0] = -nums[0]
        return sum(nums)`,
    jsCode: `var largestSumAfterKNegations = function(nums, k) {
    nums.sort((a, b) => a - b);
    let i = 0;
    while (k > 0 && i < nums.length && nums[i] < 0) {
        nums[i] = -nums[i];
        i++;
        k--;
    }
    if (k % 2 === 1) {
        nums.sort((a, b) => a - b);
        nums[0] = -nums[0];
    }
    return nums.reduce((a, b) => a + b, 0);
};`,
    explanation:
      '1. Sort the array to process the most negative values first.\n' +
      '2. Negate negative numbers from smallest (most negative) to largest, using up k.\n' +
      '3. If k is still positive and odd, negate the smallest absolute value (re-sort to find it).\n' +
      '4. If k is even, negating the same number twice cancels out.\n' +
      '5. Return the sum of the modified array.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Always negate the most negative numbers first.',
      'If all numbers are positive and k is odd, negate the smallest.',
      'If k is even after flipping negatives, no further action needed.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1007. Minimum Domino Rotations For Equal Row
  // ---------------------------------------------------------------------------
  {
    id: 1007,
    description:
      'In a row of dominoes, tops[i] and bottoms[i] represent the top and bottom halves of the i-th domino. We can rotate a domino to swap its top and bottom values. Return the minimum number of rotations so that all values in tops are the same, or all values in bottoms are the same. Return -1 if impossible.',
    examples:
      'Input: tops = [2,1,2,4,2,2], bottoms = [5,2,6,2,3,2]\nOutput: 2\nExplanation: Rotate index 1 and 3 to make all tops equal to 2.',
    intuition:
      'If a domino shows (a, b), it matches another (c, d) if you can rotate either so they share a value. The answer must be one of the four values on the first two dominoes. Check each candidate to see if it can fill an entire row.',
    approach:
      'Only tops[0] or bottoms[0] can be the target value (one of them must appear in every domino). Check both candidates. For each, count how many rotations are needed to make all tops or all bottoms equal to that value.',
    code: `class Solution:
    def minDominoRotations(self, tops: list[int], bottoms: list[int]) -> int:
        def check(target):
            top_rot = bot_rot = 0
            for i in range(len(tops)):
                if tops[i] != target and bottoms[i] != target:
                    return float('inf')
                elif tops[i] != target:
                    top_rot += 1
                elif bottoms[i] != target:
                    bot_rot += 1
            return min(top_rot, bot_rot)
        result = min(check(tops[0]), check(bottoms[0]))
        return result if result != float('inf') else -1`,
    jsCode: `var minDominoRotations = function(tops, bottoms) {
    const check = (target) => {
        let topRot = 0, botRot = 0;
        for (let i = 0; i < tops.length; i++) {
            if (tops[i] !== target && bottoms[i] !== target) return Infinity;
            else if (tops[i] !== target) topRot++;
            else if (bottoms[i] !== target) botRot++;
        }
        return Math.min(topRot, botRot);
    };
    const result = Math.min(check(tops[0]), check(bottoms[0]));
    return result === Infinity ? -1 : result;
};`,
    explanation:
      '1. The target value must appear in every domino (either top or bottom).\n' +
      '2. Only tops[0] or bottoms[0] can be the answer (they must be in position 0).\n' +
      '3. For each candidate, count rotations to make all tops equal and all bottoms equal.\n' +
      '4. Return the minimum rotations across both candidates.\n' +
      '5. If neither candidate works, return -1.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The answer must be either tops[0] or bottoms[0].',
      'For each candidate, check if it can appear in every domino.',
      'Count the minimum rotations to make all tops or all bottoms equal.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1008. Construct Binary Search Tree from Preorder Traversal
  // ---------------------------------------------------------------------------
  {
    id: 1008,
    description:
      'Given an array of integers preorder representing the preorder traversal of a BST, construct the tree and return its root.',
    examples:
      'Input: preorder = [8,5,1,7,10,12]\nOutput: [8,5,10,1,7,null,12]',
    intuition:
      'In a BST preorder traversal, the root comes first, followed by all left-subtree values (smaller), then all right-subtree values (larger). Use upper bounds during recursion: each value must be less than the bound set by its ancestors.',
    approach:
      'Use a recursive approach with upper bound. The first element is the root. Recursively build left subtree (values < root) and right subtree (values > root), using bounds to determine where each subtree ends.',
    code: `class Solution:
    def bstFromPreorder(self, preorder: list[int]) -> 'TreeNode':
        self.idx = 0
        def build(bound):
            if self.idx >= len(preorder) or preorder[self.idx] > bound:
                return None
            val = preorder[self.idx]
            self.idx += 1
            node = TreeNode(val)
            node.left = build(val)
            node.right = build(bound)
            return node
        return build(float('inf'))`,
    jsCode: `var bstFromPreorder = function(preorder) {
    let idx = 0;
    const build = (bound) => {
        if (idx >= preorder.length || preorder[idx] > bound) return null;
        const val = preorder[idx++];
        const node = new TreeNode(val);
        node.left = build(val);
        node.right = build(bound);
        return node;
    };
    return build(Infinity);
};`,
    explanation:
      '1. Use a global index to track position in preorder array.\n' +
      '2. build(bound) constructs a subtree where all values must be < bound.\n' +
      '3. The first element becomes the root; its value becomes the upper bound for the left subtree.\n' +
      '4. The parent bound remains the upper bound for the right subtree.\n' +
      '5. This naturally partitions preorder into left and right subtrees.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'In preorder, the first element is always the root.',
      'All elements less than root are in the left subtree.',
      'Use upper bounds to determine the boundary between left and right subtrees.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1010. Pairs of Songs With Total Durations Divisible by 60
  // ---------------------------------------------------------------------------
  {
    id: 1010,
    description:
      'You are given a list of song durations in seconds. Return the number of pairs of songs for which their total duration in seconds is divisible by 60.',
    examples:
      'Input: time = [30,20,150,100,40]\nOutput: 3\nExplanation: Pairs (30,150), (20,100), (20,40) have durations divisible by 60.',
    intuition:
      'For a pair of song durations to sum to a multiple of 60, their remainders mod 60 must add up to 60 (or both be 0). Count songs by their remainder and pair complementary remainders, just like the two-sum pattern.',
    approach:
      'This is similar to Two Sum with modulo. For each song, compute its remainder mod 60. Count how many previous songs have a complementary remainder (60 - remainder) % 60.',
    code: `class Solution:
    def numPairsDivisibleBy60(self, time: list[int]) -> int:
        count = [0] * 60
        pairs = 0
        for t in time:
            r = t % 60
            complement = (60 - r) % 60
            pairs += count[complement]
            count[r] += 1
        return pairs`,
    jsCode: `var numPairsDivisibleBy60 = function(time) {
    const count = new Array(60).fill(0);
    let pairs = 0;
    for (const t of time) {
        const r = t % 60;
        const complement = (60 - r) % 60;
        pairs += count[complement];
        count[r]++;
    }
    return pairs;
};`,
    explanation:
      '1. For each song duration, compute remainder = t % 60.\n' +
      '2. Its complement is (60 - remainder) % 60.\n' +
      '3. Check how many previous songs have this complement remainder.\n' +
      '4. Add that count to pairs.\n' +
      '5. Record the current remainder in the count array.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) (array of size 60)',
    hints: [
      'Think of this as a Two Sum problem with modulo 60.',
      'For each duration, find how many previous durations have a complementary remainder.',
      'Handle remainder 0 specially: its complement is also 0.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1019. Next Greater Node In Linked List
  // ---------------------------------------------------------------------------
  {
    id: 1019,
    description:
      'Given the head of a linked list, return an array answer where answer[i] is the next greater value for the i-th node. If there is no greater value, answer[i] = 0.',
    examples:
      'Input: head = [2,1,5]\nOutput: [5,5,0]',
    intuition:
      'For each node, you need the value of the next larger node in the linked list. A monotonic stack processes elements and resolves \'next greater\' relationships efficiently. Convert to an array first or use a stack directly on the linked list.',
    approach:
      'Convert the linked list to an array. Use a monotonic decreasing stack to find the next greater element for each position.',
    code: `class Solution:
    def nextLargerNodes(self, head):
        vals = []
        while head:
            vals.append(head.val)
            head = head.next
        result = [0] * len(vals)
        stack = []
        for i, val in enumerate(vals):
            while stack and vals[stack[-1]] < val:
                result[stack.pop()] = val
            stack.append(i)
        return result`,
    jsCode: `var nextLargerNodes = function(head) {
    const vals = [];
    let node = head;
    while (node) { vals.push(node.val); node = node.next; }
    const result = new Array(vals.length).fill(0);
    const stack = [];
    for (let i = 0; i < vals.length; i++) {
        while (stack.length && vals[stack[stack.length - 1]] < vals[i]) {
            result[stack.pop()] = vals[i];
        }
        stack.push(i);
    }
    return result;
};`,
    explanation:
      '1. Convert linked list to an array of values.\n' +
      '2. Use a monotonic stack storing indices of unresolved elements.\n' +
      '3. For each value, pop elements from the stack that are smaller.\n' +
      '4. Those popped elements have their next greater value set to the current value.\n' +
      '5. Elements remaining in the stack have no next greater (answer = 0).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'First convert the linked list to an array.',
      'Use a monotonic stack to find the next greater element.',
      'Each element is pushed and popped at most once.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1020. Number of Enclaves
  // ---------------------------------------------------------------------------
  {
    id: 1020,
    description:
      'You are given an m x n binary matrix grid, where 0 represents sea and 1 represents land. A land cell is an enclave if it cannot reach any boundary of the grid by walking through land. Return the number of land cells that are enclaves.',
    examples:
      'Input: grid = [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]]\nOutput: 3',
    intuition:
      'A cell on the boundary or connected to the boundary can reach the edge. Flood-fill from all boundary land cells. Any land cell NOT reached by this flood-fill is enclosed and cannot reach the boundary.',
    approach:
      'DFS/BFS from all boundary land cells to mark them as visited. Any remaining land cell that is not visited is an enclave. Count unvisited land cells.',
    code: `class Solution:
    def numEnclaves(self, grid: list[list[int]]) -> int:
        m, n = len(grid), len(grid[0])
        def dfs(r, c):
            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != 1:
                return
            grid[r][c] = 0
            dfs(r+1,c)
            dfs(r-1,c)
            dfs(r,c+1)
            dfs(r,c-1)
        for r in range(m):
            for c in range(n):
                if (r == 0 or r == m-1 or c == 0 or c == n-1) and grid[r][c] == 1:
                    dfs(r, c)
        return sum(grid[r][c] for r in range(m) for c in range(n))`,
    jsCode: `var numEnclaves = function(grid) {
    const m = grid.length, n = grid[0].length;
    const dfs = (r, c) => {
        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== 1) return;
        grid[r][c] = 0;
        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);
    };
    for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
            if ((r === 0 || r === m-1 || c === 0 || c === n-1) && grid[r][c] === 1) dfs(r, c);
        }
    }
    let count = 0;
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) count += grid[r][c];
    return count;
};`,
    explanation:
      '1. DFS from every boundary land cell, marking connected land as sea (0).\n' +
      '2. This removes all land connected to the boundary.\n' +
      '3. Remaining land cells (still 1) are enclaves.\n' +
      '4. Count all remaining 1s in the grid.\n' +
      '5. This handles all boundary-connected components efficiently.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n) for recursion',
    hints: [
      'Start DFS/BFS from boundary land cells.',
      'Mark all boundary-connected land as visited.',
      'Count remaining unvisited land cells.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1022. Sum of Root To Leaf Binary Numbers
  // ---------------------------------------------------------------------------
  {
    id: 1022,
    description:
      'You are given the root of a binary tree where each node has a value 0 or 1. Each root-to-leaf path represents a binary number. Return the sum of these numbers.',
    examples:
      'Input: root = [1,0,1,0,1,0,1]\nOutput: 22\nExplanation: Paths: 100=4, 101=5, 110=6, 111=7. Sum = 22.',
    intuition:
      'Each root-to-leaf path forms a binary number. As you traverse from root to leaf, shift the accumulated value left by 1 and add the current bit. The DFS carries this running value, and you sum up all leaf values.',
    approach:
      'DFS from root to leaves, maintaining the current binary value. At each node, shift left and add the node value. At leaves, add the value to the total.',
    code: `class Solution:
    def sumRootToLeaf(self, root) -> int:
        def dfs(node, val):
            if not node:
                return 0
            val = (val << 1) | node.val
            if not node.left and not node.right:
                return val
            return dfs(node.left, val) + dfs(node.right, val)
        return dfs(root, 0)`,
    jsCode: `var sumRootToLeaf = function(root) {
    const dfs = (node, val) => {
        if (!node) return 0;
        val = (val << 1) | node.val;
        if (!node.left && !node.right) return val;
        return dfs(node.left, val) + dfs(node.right, val);
    };
    return dfs(root, 0);
};`,
    explanation:
      '1. DFS carries the current binary value built so far.\n' +
      '2. At each node, left-shift val by 1 and OR with node.val.\n' +
      '3. If the node is a leaf, return the binary value.\n' +
      '4. Otherwise, recurse on left and right, summing their results.\n' +
      '5. The total sum is returned from the root call.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is tree height',
    hints: [
      'Build the binary number as you traverse from root to leaf.',
      'Use bit shifting: val = (val << 1) | node.val.',
      'Add the value to the sum only at leaf nodes.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1026. Maximum Difference Between Node and Ancestor
  // ---------------------------------------------------------------------------
  {
    id: 1026,
    description:
      'Given the root of a binary tree, find the maximum value v for which there exist different nodes a and b where v = |a.val - b.val| and a is an ancestor of b.',
    examples:
      'Input: root = [8,3,10,1,6,null,14,null,null,4,7,13]\nOutput: 7\nExplanation: |8 - 1| = 7.',
    intuition:
      'The maximum difference between an ancestor and a descendant is determined by the min and max values along each root-to-leaf path. Pass the running min and max down through DFS, and compute the difference at each node.',
    approach:
      'DFS while tracking the minimum and maximum values along the path from root to the current node. At each leaf, the maximum difference is max_val - min_val. Return the overall maximum.',
    code: `class Solution:
    def maxAncestorDiff(self, root) -> int:
        def dfs(node, lo, hi):
            if not node:
                return hi - lo
            lo = min(lo, node.val)
            hi = max(hi, node.val)
            return max(dfs(node.left, lo, hi), dfs(node.right, lo, hi))
        return dfs(root, root.val, root.val)`,
    jsCode: `var maxAncestorDiff = function(root) {
    const dfs = (node, lo, hi) => {
        if (!node) return hi - lo;
        lo = Math.min(lo, node.val);
        hi = Math.max(hi, node.val);
        return Math.max(dfs(node.left, lo, hi), dfs(node.right, lo, hi));
    };
    return dfs(root, root.val, root.val);
};`,
    explanation:
      '1. Track min (lo) and max (hi) values from root to current node.\n' +
      '2. Update lo and hi with the current node value.\n' +
      '3. At null nodes (past leaves), the max difference is hi - lo.\n' +
      '4. Return the maximum across all root-to-leaf paths.\n' +
      '5. The answer is the maximum of (max_ancestor - min_descendant) across all paths.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is tree height',
    hints: [
      'Track min and max values along each root-to-leaf path.',
      'The max difference on any path is max_value - min_value.',
      'DFS passing min and max as parameters.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1027. Longest Arithmetic Subsequence
  // ---------------------------------------------------------------------------
  {
    id: 1027,
    description:
      'Given an array of integers nums, return the length of the longest arithmetic subsequence. A sequence is arithmetic if the difference between consecutive elements is constant.',
    examples:
      'Input: nums = [3,6,9,12]\nOutput: 4\nExplanation: The whole array is an arithmetic sequence with difference 3.',
    intuition:
      'For each pair of elements, their difference defines an arithmetic sequence they could belong to. DP with dp[i][diff] = length of longest AP ending at index i with common difference diff builds the answer incrementally.',
    approach:
      'Use DP where dp[i][d] is the length of the longest arithmetic subsequence ending at index i with common difference d. For each pair (i, j) where j < i, compute d = nums[i] - nums[j] and update dp[i][d].',
    code: `class Solution:
    def longestArithSeqLength(self, nums: list[int]) -> int:
        n = len(nums)
        dp = [{} for _ in range(n)]
        ans = 2
        for i in range(n):
            for j in range(i):
                d = nums[i] - nums[j]
                dp[i][d] = dp[j].get(d, 1) + 1
                ans = max(ans, dp[i][d])
        return ans`,
    jsCode: `var longestArithSeqLength = function(nums) {
    const n = nums.length;
    const dp = Array.from({length: n}, () => ({}));
    let ans = 2;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < i; j++) {
            const d = nums[i] - nums[j];
            dp[i][d] = (dp[j][d] || 1) + 1;
            ans = Math.max(ans, dp[i][d]);
        }
    }
    return ans;
};`,
    explanation:
      '1. dp[i] is a dictionary mapping difference d to the longest arithmetic subsequence ending at i.\n' +
      '2. For each pair (j, i), compute d = nums[i] - nums[j].\n' +
      '3. dp[i][d] = dp[j][d] + 1 (extend the sequence at j) or 2 if j has no sequence with difference d.\n' +
      '4. Track the maximum length across all dp values.\n' +
      '5. Return the maximum found.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Use DP indexed by (position, common difference).',
      'For each pair, compute the difference and extend the sequence.',
      'The minimum length is 2 (any pair forms a trivial arithmetic sequence).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1029. Two City Scheduling
  // ---------------------------------------------------------------------------
  {
    id: 1029,
    description:
      'A company has 2n people to interview. The cost of flying person i to city A is costs[i][0] and to city B is costs[i][1]. Return the minimum total cost to fly exactly n people to each city.',
    examples:
      'Input: costs = [[10,20],[30,200],[400,50],[30,20]]\nOutput: 110\nExplanation: Fly persons 0,1 to A and 2,3 to B. Cost = 10+30+50+20 = 110.',
    intuition:
      'Assign everyone to city A first. Then figure out which people benefit most from switching to city B by computing the savings (costA - costB). Sort by savings and switch the top half to city B. This greedy split minimizes total cost.',
    approach:
      'Sort by the cost difference (cost_A - cost_B). Send the first n people (with most savings for A) to city A and the rest to city B.',
    code: `class Solution:
    def twoCitySchedCost(self, costs: list[list[int]]) -> int:
        costs.sort(key=lambda x: x[0] - x[1])
        n = len(costs) // 2
        total = 0
        for i in range(n):
            total += costs[i][0]
        for i in range(n, 2 * n):
            total += costs[i][1]
        return total`,
    jsCode: `var twoCitySchedCost = function(costs) {
    costs.sort((a, b) => (a[0] - a[1]) - (b[0] - b[1]));
    const n = costs.length / 2;
    let total = 0;
    for (let i = 0; i < n; i++) total += costs[i][0];
    for (let i = n; i < 2 * n; i++) total += costs[i][1];
    return total;
};`,
    explanation:
      '1. Sort people by (cost_A - cost_B), the relative savings of choosing A over B.\n' +
      '2. People with the most negative difference benefit most from going to A.\n' +
      '3. Send the first n (sorted) to city A and the rest to city B.\n' +
      '4. Sum up the respective costs.\n' +
      '5. This greedy approach minimizes total cost.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The key insight is the relative cost difference between cities.',
      'Sort by (cost_A - cost_B) to determine who benefits most from each city.',
      'Send the first half to A and the second half to B.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1031. Maximum Sum of Two Non-Overlapping Subarrays
  // ---------------------------------------------------------------------------
  {
    id: 1031,
    description:
      'Given an integer array nums and two integers firstLen and secondLen, return the maximum sum of elements in two non-overlapping subarrays of lengths firstLen and secondLen. The subarrays can appear in either order.',
    examples:
      'Input: nums = [0,6,5,2,2,5,1,9,4], firstLen = 1, secondLen = 2\nOutput: 20\nExplanation: [9] and [6,5] give sum 20.',
    intuition:
      'Think of it as choosing two non-overlapping windows of sizes firstLen and secondLen. Try every possible split point: maximum of firstLen-window on the left plus secondLen-window on the right, and vice versa.',
    approach:
      'Use prefix sums and track the maximum subarray of length firstLen seen so far as we slide a window of length secondLen. Do this for both orderings (first before second, and second before first).',
    code: `class Solution:
    def maxSumTwoNoOverlap(self, nums: list[int], firstLen: int, secondLen: int) -> int:
        n = len(nums)
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i+1] = prefix[i] + nums[i]
        def solve(L, M):
            max_l = 0
            ans = 0
            for i in range(L + M, n + 1):
                max_l = max(max_l, prefix[i-M] - prefix[i-M-L])
                ans = max(ans, max_l + prefix[i] - prefix[i-M])
            return ans
        return max(solve(firstLen, secondLen), solve(secondLen, firstLen))`,
    jsCode: `var maxSumTwoNoOverlap = function(nums, firstLen, secondLen) {
    const n = nums.length;
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) prefix[i+1] = prefix[i] + nums[i];
    const solve = (L, M) => {
        let maxL = 0, ans = 0;
        for (let i = L + M; i <= n; i++) {
            maxL = Math.max(maxL, prefix[i-M] - prefix[i-M-L]);
            ans = Math.max(ans, maxL + prefix[i] - prefix[i-M]);
        }
        return ans;
    };
    return Math.max(solve(firstLen, secondLen), solve(secondLen, firstLen));
};`,
    explanation:
      '1. Build prefix sums for efficient range sum queries.\n' +
      '2. solve(L, M) finds max sum where L-length subarray comes before M-length.\n' +
      '3. As we slide the M-window, track the max L-sum that ends before the M-window starts.\n' +
      '4. Try both orderings: firstLen before secondLen and vice versa.\n' +
      '5. Return the maximum across both orderings.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use prefix sums to compute subarray sums in O(1).',
      'Fix one subarray as the right one and track the best left subarray.',
      'Try both orderings since either subarray can come first.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1038. Binary Search Tree to Greater Sum Tree
  // ---------------------------------------------------------------------------
  {
    id: 1038,
    description:
      'Given the root of a BST, convert it to a Greater Tree where every key of the original BST is changed to the original key plus the sum of all keys greater than the original key in BST.',
    examples:
      'Input: root = [4,1,6,0,2,5,7,null,null,null,3,null,null,null,8]\nOutput: [30,36,21,36,35,26,15,null,null,null,33,null,null,null,8]',
    intuition:
      'In a BST, an in-order traversal visits nodes in ascending order. A reverse in-order traversal (right, root, left) visits in descending order. Keep a running sum as you traverse in reverse order, and each node\'s new value is this running sum.',
    approach:
      'Use reverse in-order traversal (right, node, left). Maintain a running sum. At each node, add the running sum to the node value and update the running sum.',
    code: `class Solution:
    def bstToGst(self, root):
        self.total = 0
        def dfs(node):
            if not node:
                return
            dfs(node.right)
            self.total += node.val
            node.val = self.total
            dfs(node.left)
        dfs(root)
        return root`,
    jsCode: `var bstToGst = function(root) {
    let total = 0;
    const dfs = (node) => {
        if (!node) return;
        dfs(node.right);
        total += node.val;
        node.val = total;
        dfs(node.left);
    };
    dfs(root);
    return root;
};`,
    explanation:
      '1. Reverse in-order traversal visits nodes from largest to smallest.\n' +
      '2. Maintain a running total of all values visited so far.\n' +
      '3. At each node, add its value to total, then set node.val = total.\n' +
      '4. This effectively adds all greater values to each node.\n' +
      '5. The tree is modified in-place.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is tree height',
    hints: [
      'In a BST, all greater values are to the right or above.',
      'Reverse in-order (right, node, left) visits nodes in decreasing order.',
      'Maintain a running sum to update each node.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1041. Robot Bounded In Circle
  // ---------------------------------------------------------------------------
  {
    id: 1041,
    description:
      'A robot starts at (0,0) facing north and executes instructions: G = go forward 1 unit, L = turn left 90 degrees, R = turn right 90 degrees. The instructions repeat forever. Return true if there exists a circle in the plane such that the robot never leaves the circle.',
    examples:
      'Input: instructions = "GGLLGG"\nOutput: true\nExplanation: The robot moves back to the origin after the instructions.',
    intuition:
      'Imagine the robot executing its instructions once, twice, three times, etc. If after one cycle the robot is back at the origin, or it is not facing north (meaning it will spiral back eventually), it is bounded. Otherwise, it will drift away forever.',
    approach:
      'After one cycle of instructions, the robot is bounded if it returns to the origin OR it is not facing north. If not facing north, after 4 cycles it will return to origin.',
    code: `class Solution:
    def isRobotBounded(self, instructions: str) -> bool:
        dx = [0, 1, 0, -1]
        dy = [1, 0, -1, 0]
        x = y = 0
        di = 0
        for c in instructions:
            if c == 'G':
                x += dx[di]
                y += dy[di]
            elif c == 'L':
                di = (di - 1) % 4
            else:
                di = (di + 1) % 4
        return (x == 0 and y == 0) or di != 0`,
    jsCode: `var isRobotBounded = function(instructions) {
    const dx = [0, 1, 0, -1];
    const dy = [1, 0, -1, 0];
    let x = 0, y = 0, di = 0;
    for (const c of instructions) {
        if (c === 'G') { x += dx[di]; y += dy[di]; }
        else if (c === 'L') di = (di + 3) % 4;
        else di = (di + 1) % 4;
    }
    return (x === 0 && y === 0) || di !== 0;
};`,
    explanation:
      '1. Simulate one cycle of instructions.\n' +
      '2. If the robot returns to (0,0), it is obviously bounded.\n' +
      '3. If the robot faces any direction other than north, it will trace a closed loop within 4 cycles.\n' +
      '4. This is because the displacement vector rotates each cycle.\n' +
      '5. Only an unbounded robot would move away from origin while still facing north.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Simulate one cycle and check the final position and direction.',
      'If the robot is not at the origin but facing a different direction, it is bounded.',
      'A robot not at origin and facing north will drift infinitely.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1046. Last Stone Weight
  // ---------------------------------------------------------------------------
  {
    id: 1046,
    description:
      'You have a collection of stones, each with a positive integer weight. Each turn, choose the two heaviest stones and smash them. If they have equal weight, both are destroyed. Otherwise, the heavier stone loses weight equal to the lighter stone. Return the weight of the last remaining stone, or 0.',
    examples:
      'Input: stones = [2,7,4,1,8,1]\nOutput: 1\nExplanation: Smash 7 and 8 -> 1. Smash 2 and 4 -> 2. Smash 1 and 2 -> 1. Smash 1 and 1 -> 0. Last stone = 1.',
    intuition:
      'Always smash the two heaviest stones - this is the greedy choice. A max-heap gives you the two largest values efficiently. Keep smashing until one or zero stones remain.',
    approach:
      'Use a max-heap. Repeatedly extract the two largest, compute their difference, and if non-zero, push it back. Continue until 0 or 1 stones remain.',
    code: `class Solution:
    def lastStoneWeight(self, stones: list[int]) -> int:
        import heapq
        heap = [-s for s in stones]
        heapq.heapify(heap)
        while len(heap) > 1:
            first = -heapq.heappop(heap)
            second = -heapq.heappop(heap)
            if first != second:
                heapq.heappush(heap, -(first - second))
        return -heap[0] if heap else 0`,
    jsCode: `var lastStoneWeight = function(stones) {
    // Simple approach: sort each time
    while (stones.length > 1) {
        stones.sort((a, b) => b - a);
        const first = stones.shift();
        const second = stones.shift();
        if (first !== second) stones.push(first - second);
    }
    return stones.length ? stones[0] : 0;
};`,
    explanation:
      '1. Use a max-heap (negate values for Python min-heap).\n' +
      '2. Pop the two heaviest stones.\n' +
      '3. If they differ, push the difference back.\n' +
      '4. Repeat until 0 or 1 stones remain.\n' +
      '5. Return the remaining stone or 0.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'A max-heap efficiently gives the two heaviest stones.',
      'Python has only min-heap, so negate values.',
      'Push the difference back if the stones have different weights.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1047. Remove All Adjacent Duplicates In String
  // ---------------------------------------------------------------------------
  {
    id: 1047,
    description:
      'You are given a string s. Repeatedly remove all adjacent duplicate pairs until no more can be removed. Return the final string.',
    examples:
      'Input: s = "abbaca"\nOutput: "ca"\nExplanation: Remove "bb" -> "aaca", remove "aa" -> "ca".',
    intuition:
      'A stack naturally handles cascading duplicate removals. Push each character, but if it matches the stack top, pop instead. Adjacent duplicates cancel out like matching parentheses.',
    approach:
      'Use a stack. For each character, if it matches the stack top, pop (they cancel out). Otherwise, push it. The remaining stack is the answer.',
    code: `class Solution:
    def removeDuplicates(self, s: str) -> str:
        stack = []
        for c in s:
            if stack and stack[-1] == c:
                stack.pop()
            else:
                stack.append(c)
        return ''.join(stack)`,
    jsCode: `var removeDuplicates = function(s) {
    const stack = [];
    for (const c of s) {
        if (stack.length && stack[stack.length - 1] === c) stack.pop();
        else stack.push(c);
    }
    return stack.join('');
};`,
    explanation:
      '1. Iterate through each character in s.\n' +
      '2. If the stack is non-empty and the top matches the current character, pop (remove the pair).\n' +
      '3. Otherwise, push the current character.\n' +
      '4. The stack contains the final string after all removals.\n' +
      '5. Join and return.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'A stack naturally handles matching adjacent pairs.',
      'Push characters; pop when the top matches the current character.',
      'This handles cascading removals automatically.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1048. Longest String Chain
  // ---------------------------------------------------------------------------
  {
    id: 1048,
    description:
      'You are given an array of words. A word chain is a sequence where each word is a predecessor of the next (you can insert exactly one letter to get the next word). Return the length of the longest word chain.',
    examples:
      'Input: words = ["a","b","ba","bca","bda","bdca"]\nOutput: 4\nExplanation: "a" -> "ba" -> "bda" -> "bdca".',
    intuition:
      'Sort words by length so you process shorter words first. For each word, try removing one character at a time - if the shorter word exists and has a chain, extend it. This bottom-up DP with a hash map builds the longest chain efficiently.',
    approach:
      'Sort words by length. Use DP where dp[word] is the longest chain ending at that word. For each word, try removing each character and check if the resulting word has a chain length we can extend.',
    code: `class Solution:
    def longestStrChain(self, words: list[str]) -> int:
        words.sort(key=len)
        dp = {}
        ans = 1
        for word in words:
            dp[word] = 1
            for i in range(len(word)):
                prev = word[:i] + word[i+1:]
                if prev in dp:
                    dp[word] = max(dp[word], dp[prev] + 1)
            ans = max(ans, dp[word])
        return ans`,
    jsCode: `var longestStrChain = function(words) {
    words.sort((a, b) => a.length - b.length);
    const dp = {};
    let ans = 1;
    for (const word of words) {
        dp[word] = 1;
        for (let i = 0; i < word.length; i++) {
            const prev = word.slice(0, i) + word.slice(i + 1);
            if (dp[prev]) dp[word] = Math.max(dp[word], dp[prev] + 1);
        }
        ans = Math.max(ans, dp[word]);
    }
    return ans;
};`,
    explanation:
      '1. Sort words by length so we process shorter words first.\n' +
      '2. dp[word] = longest chain ending at word.\n' +
      '3. For each word, try removing each character to form a predecessor.\n' +
      '4. If the predecessor exists in dp, extend its chain.\n' +
      '5. Track the maximum chain length.',
    timeComplexity: 'O(n * L^2) where L is max word length',
    spaceComplexity: 'O(n * L)',
    hints: [
      'Sort words by length so predecessors are processed first.',
      'For each word, check all possible predecessors by removing one character.',
      'Use a hash map for DP to look up chain lengths.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1049. Last Stone Weight II
  // ---------------------------------------------------------------------------
  {
    id: 1049,
    description:
      'You have a collection of stones with integer weights. Each turn, pick any two stones and smash them (resulting in |x-y| if different, 0 if equal). Return the smallest possible weight of the remaining stone (or 0).',
    examples:
      'Input: stones = [2,7,4,1,8,1]\nOutput: 1',
    intuition:
      'Smashing stones is equivalent to assigning + or - to each stone and minimizing the absolute sum. This is a partition problem: split stones into two groups with sums as close as possible. Knapsack DP finds the best split.',
    approach:
      'This is equivalent to partitioning stones into two groups to minimize the absolute difference of their sums. Use a knapsack DP to find the closest achievable sum to total/2.',
    code: `class Solution:
    def lastStoneWeightII(self, stones: list[int]) -> int:
        total = sum(stones)
        target = total // 2
        dp = {0}
        for stone in stones:
            dp = {s + stone for s in dp if s + stone <= target} | dp
        return total - 2 * max(dp)`,
    jsCode: `var lastStoneWeightII = function(stones) {
    const total = stones.reduce((a, b) => a + b, 0);
    const target = Math.floor(total / 2);
    let dp = new Set([0]);
    for (const stone of stones) {
        const newDp = new Set(dp);
        for (const s of dp) {
            if (s + stone <= target) newDp.add(s + stone);
        }
        dp = newDp;
    }
    return total - 2 * Math.max(...dp);
};`,
    explanation:
      '1. The problem reduces to partitioning stones into two groups with minimal sum difference.\n' +
      '2. Target is total // 2 (we want one group as close to half as possible).\n' +
      '3. Use DP (set of achievable sums) to track what sums are possible.\n' +
      '4. The best partition has one group of sum max(dp), other of total - max(dp).\n' +
      '5. Answer = total - 2 * max(dp).',
    timeComplexity: 'O(n * total)',
    spaceComplexity: 'O(total)',
    hints: [
      'This is a partition problem: split stones to minimize the difference.',
      'Knapsack DP to find achievable sums up to total/2.',
      'Answer = total - 2 * (best achievable sum <= total/2).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1060. Missing Element in Sorted Array
  // ---------------------------------------------------------------------------
  {
    id: 1060,
    description:
      'Given an integer array nums sorted in ascending order with all elements unique, and an integer k, return the k-th missing number starting from the leftmost number of the array.',
    examples:
      'Input: nums = [4,7,9,10], k = 1\nOutput: 5\nExplanation: The first missing number after 4 is 5.',
    intuition:
      'The number of missing values before index i can be computed directly: nums[i] - nums[0] - i. Binary search on this function finds exactly where the k-th missing number falls.',
    approach:
      'Use binary search. The number of missing elements before index i is nums[i] - nums[0] - i. Binary search for the smallest index where the missing count >= k.',
    code: `class Solution:
    def missingElement(self, nums: list[int], k: int) -> int:
        def missing(i):
            return nums[i] - nums[0] - i
        n = len(nums)
        if k > missing(n - 1):
            return nums[-1] + k - missing(n - 1)
        lo, hi = 0, n - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if missing(mid) < k:
                lo = mid + 1
            else:
                hi = mid
        return nums[lo - 1] + k - missing(lo - 1)`,
    jsCode: `var missingElement = function(nums, k) {
    const missing = (i) => nums[i] - nums[0] - i;
    const n = nums.length;
    if (k > missing(n - 1)) return nums[n-1] + k - missing(n-1);
    let lo = 0, hi = n - 1;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (missing(mid) < k) lo = mid + 1;
        else hi = mid;
    }
    return nums[lo - 1] + k - missing(lo - 1);
};`,
    explanation:
      '1. missing(i) = number of missing elements before nums[i].\n' +
      '2. If k > missing(n-1), the answer is beyond the array.\n' +
      '3. Binary search for the first index where missing(i) >= k.\n' +
      '4. The k-th missing number is nums[lo-1] + (k - missing(lo-1)).\n' +
      '5. This gives O(log n) time.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'The number of missing elements before index i can be computed directly.',
      'Use binary search on the number of missing elements.',
      'If k exceeds all missing in the array, the answer is past the last element.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1061. Lexicographically Smallest Equivalent String
  // ---------------------------------------------------------------------------
  {
    id: 1061,
    description:
      'You are given two strings of equal length s1 and s2, and a string baseStr. s1[i] and s2[i] are equivalent characters. Return the lexicographically smallest equivalent string of baseStr by using the equivalency information from s1 and s2.',
    examples:
      'Input: s1 = "parker", s2 = "morris", baseStr = "parser"\nOutput: "makkek"',
    intuition:
      'Characters linked by equivalence form groups - Union-Find handles this perfectly. The trick is always making the lexicographically smallest character the group representative, so looking up any character instantly gives you its smallest equivalent.',
    approach:
      'Use Union-Find where equivalent characters are unioned. Always make the lexicographically smallest character the root. For each character in baseStr, find its root to get the smallest equivalent.',
    code: `class Solution:
    def smallestEquivalentString(self, s1: str, s2: str, baseStr: str) -> str:
        parent = list(range(26))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        def union(a, b):
            ra, rb = find(a), find(b)
            if ra == rb:
                return
            if ra < rb:
                parent[rb] = ra
            else:
                parent[ra] = rb
        for a, b in zip(s1, s2):
            union(ord(a) - ord('a'), ord(b) - ord('a'))
        return ''.join(chr(find(ord(c) - ord('a')) + ord('a')) for c in baseStr)`,
    jsCode: `var smallestEquivalentString = function(s1, s2, baseStr) {
    const parent = Array.from({length: 26}, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    const union = (a, b) => {
        let ra = find(a), rb = find(b);
        if (ra === rb) return;
        if (ra < rb) parent[rb] = ra;
        else parent[ra] = rb;
    };
    for (let i = 0; i < s1.length; i++) {
        union(s1.charCodeAt(i) - 97, s2.charCodeAt(i) - 97);
    }
    return [...baseStr].map(c => String.fromCharCode(find(c.charCodeAt(0) - 97) + 97)).join('');
};`,
    explanation:
      '1. Union-Find with 26 nodes for a-z.\n' +
      '2. For each pair (s1[i], s2[i]), union their character indices.\n' +
      '3. Always make the smaller index the root to ensure lexicographic order.\n' +
      '4. For each character in baseStr, find its root to get the smallest equivalent.\n' +
      '5. Build and return the result string.',
    timeComplexity: 'O(n + m) where n is length of s1/s2 and m is length of baseStr',
    spaceComplexity: 'O(1) (26 characters)',
    hints: [
      'Use Union-Find to group equivalent characters.',
      'Always make the lexicographically smallest character the representative.',
      'For each character in baseStr, find its representative.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1071. Greatest Common Divisor of Strings
  // ---------------------------------------------------------------------------
  {
    id: 1071,
    description:
      'For two strings s and t, t divides s if s = t + t + ... + t (t concatenated some number of times). Given two strings str1 and str2, return the largest string x such that x divides both str1 and str2.',
    examples:
      'Input: str1 = "ABCABC", str2 = "ABC"\nOutput: "ABC"',
    intuition:
      'If a GCD string exists, then str1 + str2 must equal str2 + str1 (because both are built from the same repeating block). Once you verify this, the GCD string length is simply gcd(len1, len2), just like with numbers.',
    approach:
      'If str1 + str2 != str2 + str1, no common divisor exists. Otherwise, the GCD string has length gcd(len(str1), len(str2)).',
    code: `class Solution:
    def gcdOfStrings(self, str1: str, str2: str) -> str:
        if str1 + str2 != str2 + str1:
            return ""
        from math import gcd
        return str1[:gcd(len(str1), len(str2))]`,
    jsCode: `var gcdOfStrings = function(str1, str2) {
    if (str1 + str2 !== str2 + str1) return "";
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    return str1.substring(0, gcd(str1.length, str2.length));
};`,
    explanation:
      '1. If str1 + str2 != str2 + str1, the strings have no common divisor string.\n' +
      '2. If they are equal, a GCD string exists.\n' +
      '3. Its length is gcd(len(str1), len(str2)).\n' +
      '4. Return the prefix of str1 with that length.\n' +
      '5. This works because the concatenation check guarantees the prefix repeats to form both strings.',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(n + m)',
    hints: [
      'If str1 + str2 == str2 + str1, a GCD string exists.',
      'The GCD string length is gcd of the two string lengths.',
      'Return the appropriate prefix.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1094. Car Pooling
  // ---------------------------------------------------------------------------
  {
    id: 1094,
    description:
      'There is a car with capacity empty seats. Given an array trips where trips[i] = [numPassengers, from, to], the car picks up numPassengers at from and drops them off at to. Return true if it is possible to pick up and drop off all passengers for all trips.',
    examples:
      'Input: trips = [[2,1,5],[3,3,7]], capacity = 4\nOutput: false\nExplanation: At location 3, the car has 2+3=5 passengers but capacity is 4.',
    intuition:
      'Think of each trip as passengers getting on at one location and off at another. A difference array records these changes at each location. Sweeping through gives the running total of passengers, which must never exceed capacity.',
    approach:
      'Use a difference array or sweep line. For each trip, add passengers at the pickup location and subtract at the dropoff. Then sweep through all locations checking if capacity is exceeded.',
    code: `class Solution:
    def carPooling(self, trips: list[list[int]], capacity: int) -> bool:
        diff = [0] * 1001
        for num, start, end in trips:
            diff[start] += num
            diff[end] -= num
        current = 0
        for d in diff:
            current += d
            if current > capacity:
                return False
        return True`,
    jsCode: `var carPooling = function(trips, capacity) {
    const diff = new Array(1001).fill(0);
    for (const [num, start, end] of trips) {
        diff[start] += num;
        diff[end] -= num;
    }
    let current = 0;
    for (const d of diff) {
        current += d;
        if (current > capacity) return false;
    }
    return true;
};`,
    explanation:
      '1. Create a difference array of size 1001 (max location).\n' +
      '2. For each trip, add passengers at the start and subtract at the end.\n' +
      '3. Sweep through the array, maintaining the current number of passengers.\n' +
      '4. If current ever exceeds capacity, return False.\n' +
      '5. If we sweep through without exceeding, return True.',
    timeComplexity: 'O(n + max_location)',
    spaceComplexity: 'O(max_location)',
    hints: [
      'Use a difference array to track passenger changes at each location.',
      'Passengers board at "from" and exit at "to".',
      'Sweep through locations and check if total ever exceeds capacity.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1095. Find in Mountain Array
  // ---------------------------------------------------------------------------
  {
    id: 1095,
    description:
      'You are given a MountainArray interface with get(index) and length() methods. The array first increases then decreases. Given a target, return the minimum index such that MountainArray.get(index) == target. Return -1 if not found. You may call get() at most 100 times.',
    examples:
      'Input: array = [1,2,3,4,5,3,1], target = 3\nOutput: 2',
    intuition:
      'The mountain array is two sorted halves joined at the peak. Find the peak with one binary search, then search each half with standard binary search. Search the ascending side first to guarantee the minimum index.',
    approach:
      'First, binary search for the peak. Then binary search the ascending side for the target. If not found, binary search the descending side.',
    code: `class Solution:
    def findInMountainArray(self, target: int, mountain_arr) -> int:
        n = mountain_arr.length()
        lo, hi = 0, n - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if mountain_arr.get(mid) < mountain_arr.get(mid + 1):
                lo = mid + 1
            else:
                hi = mid
        peak = lo
        lo, hi = 0, peak
        while lo <= hi:
            mid = (lo + hi) // 2
            val = mountain_arr.get(mid)
            if val == target:
                return mid
            elif val < target:
                lo = mid + 1
            else:
                hi = mid - 1
        lo, hi = peak + 1, n - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            val = mountain_arr.get(mid)
            if val == target:
                return mid
            elif val < target:
                hi = mid - 1
            else:
                lo = mid + 1
        return -1`,
    jsCode: `var findInMountainArray = function(target, mountainArr) {
    const n = mountainArr.length();
    let lo = 0, hi = n - 1;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (mountainArr.get(mid) < mountainArr.get(mid + 1)) lo = mid + 1;
        else hi = mid;
    }
    const peak = lo;
    lo = 0; hi = peak;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const val = mountainArr.get(mid);
        if (val === target) return mid;
        else if (val < target) lo = mid + 1;
        else hi = mid - 1;
    }
    lo = peak + 1; hi = n - 1;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const val = mountainArr.get(mid);
        if (val === target) return mid;
        else if (val < target) hi = mid - 1;
        else lo = mid + 1;
    }
    return -1;
};`,
    explanation:
      '1. Binary search to find the peak of the mountain.\n' +
      '2. Binary search the ascending part (left of peak) for the target.\n' +
      '3. If found, return the index (guaranteed to be the smallest).\n' +
      '4. If not found, binary search the descending part (right of peak).\n' +
      '5. Return -1 if not found in either half.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Find the peak index first using binary search.',
      'Search the ascending side first for the minimum index.',
      'Then search the descending side if not found.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1105. Filling Bookcase Shelves
  // ---------------------------------------------------------------------------
  {
    id: 1105,
    description:
      'You are given books where books[i] = [thickness, height] and a shelf width. Place books in order on shelves. Return the minimum total height of the bookcase.',
    examples:
      'Input: books = [[1,1],[2,3],[2,3],[1,1],[1,1],[1,1],[1,2]], shelfWidth = 4\nOutput: 6',
    intuition:
      'For each book, you must decide where to start a new shelf. Try grouping the current book with previous books on the same shelf (as long as width allows). DP picks the grouping that minimizes total height, since each shelf\'s height is its tallest book.',
    approach:
      'Use DP where dp[i] is the minimum height to place the first i books. For each book i, try placing books i, i-1, i-2, ... on the current shelf as long as the total width fits. The shelf height is the max height on the current shelf.',
    code: `class Solution:
    def minHeightShelves(self, books: list[list[int]], shelfWidth: int) -> int:
        n = len(books)
        dp = [float('inf')] * (n + 1)
        dp[0] = 0
        for i in range(1, n + 1):
            width = 0
            height = 0
            j = i
            while j > 0:
                width += books[j-1][0]
                if width > shelfWidth:
                    break
                height = max(height, books[j-1][1])
                dp[i] = min(dp[i], dp[j-1] + height)
                j -= 1
        return dp[n]`,
    jsCode: `var minHeightShelves = function(books, shelfWidth) {
    const n = books.length;
    const dp = new Array(n + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i <= n; i++) {
        let width = 0, height = 0;
        let j = i;
        while (j > 0) {
            width += books[j-1][0];
            if (width > shelfWidth) break;
            height = Math.max(height, books[j-1][1]);
            dp[i] = Math.min(dp[i], dp[j-1] + height);
            j--;
        }
    }
    return dp[n];
};`,
    explanation:
      '1. dp[i] = minimum height for the first i books.\n' +
      '2. For book i, try grouping books j..i on the current shelf.\n' +
      '3. Track the total width and maximum height for the current shelf.\n' +
      '4. If the width exceeds shelfWidth, stop adding books to the shelf.\n' +
      '5. dp[i] = min over all valid j of dp[j-1] + max height of shelf.',
    timeComplexity: 'O(n * shelfWidth)',
    spaceComplexity: 'O(n)',
    hints: [
      'DP where dp[i] is the min height for the first i books.',
      'For each position, try different numbers of books on the current shelf.',
      'The shelf height is the tallest book on that shelf.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1108. Defanging an IP Address
  // ---------------------------------------------------------------------------
  {
    id: 1108,
    description:
      'Given a valid IPv4 address, return a defanged version of that IP address. A defanged IP address replaces every period "." with "[.]".',
    examples:
      'Input: address = "1.1.1.1"\nOutput: "1[.]1[.]1[.]1"',
    intuition:
      'This is the simplest possible string transformation - just replace every dot with \'[.]\'. A single string replace call does the job.',
    approach:
      'Simply replace all occurrences of "." with "[.]" using string replacement.',
    code: `class Solution:
    def defangIPaddr(self, address: str) -> str:
        return address.replace('.', '[.]')`,
    jsCode: `var defangIPaddr = function(address) {
    return address.replace(/\\./g, '[.]');
};`,
    explanation:
      '1. Use the built-in string replace method.\n' +
      '2. Replace every "." with "[.]".\n' +
      '3. Return the modified string.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'This is a straightforward string replacement.',
      'Use str.replace() in Python.',
      'Every dot gets wrapped in brackets.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1110. Delete Nodes And Return Forest
  // ---------------------------------------------------------------------------
  {
    id: 1110,
    description:
      'Given the root of a binary tree and an array of values to_delete, remove nodes with those values and return the resulting forest (list of trees) as a list of roots.',
    examples:
      'Input: root = [1,2,3,4,5,6,7], to_delete = [3,5]\nOutput: [[1,2,null,4],[6],[7]]',
    intuition:
      'When deleting a node, its children become orphaned and start new trees in the forest. DFS with a flag tracking whether the current node is a root handles both deletion and forest collection in one pass.',
    approach:
      'Use DFS. Convert to_delete to a set. For each node, if it is to be deleted, its children become new roots (if they exist). Return None for deleted nodes so the parent disconnects them.',
    code: `class Solution:
    def delNodes(self, root, to_delete):
        to_del = set(to_delete)
        result = []
        def dfs(node, is_root):
            if not node:
                return None
            deleted = node.val in to_del
            if is_root and not deleted:
                result.append(node)
            node.left = dfs(node.left, deleted)
            node.right = dfs(node.right, deleted)
            return None if deleted else node
        dfs(root, True)
        return result`,
    jsCode: `var delNodes = function(root, to_delete) {
    const toDel = new Set(to_delete);
    const result = [];
    const dfs = (node, isRoot) => {
        if (!node) return null;
        const deleted = toDel.has(node.val);
        if (isRoot && !deleted) result.push(node);
        node.left = dfs(node.left, deleted);
        node.right = dfs(node.right, deleted);
        return deleted ? null : node;
    };
    dfs(root, true);
    return result;
};`,
    explanation:
      '1. Convert to_delete to a set for O(1) lookup.\n' +
      '2. DFS with a flag is_root indicating if the node could be a new root.\n' +
      '3. If is_root and the node is not deleted, add it to the result.\n' +
      '4. If the node is deleted, its children become potential new roots.\n' +
      '5. Return None for deleted nodes to disconnect from parent.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Process the tree with DFS, tracking whether each node is a root.',
      'A deleted node\'s children become new roots in the forest.',
      'Use a set for O(1) lookup of values to delete.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1123. Lowest Common Ancestor of Deepest Leaves
  // ---------------------------------------------------------------------------
  {
    id: 1123,
    description:
      'Given the root of a binary tree, return the lowest common ancestor of its deepest leaves. A node is a deepest leaf if it has the largest depth in the tree.',
    examples:
      'Input: root = [3,5,1,6,2,0,8,null,null,7,4]\nOutput: 2\nExplanation: Deepest leaves are 7 and 4. Their LCA is 2.',
    intuition:
      'If both subtrees of a node have the same maximum depth, that node is the LCA of the deepest leaves. If one subtree is deeper, the LCA must be in that deeper subtree. DFS returning (depth, LCA) makes this a clean recursive solution.',
    approach:
      'DFS returning (depth, lca_node) for each subtree. If left and right depths are equal, the current node is the LCA. Otherwise, return the result from the deeper subtree.',
    code: `class Solution:
    def lcaDeepestLeaves(self, root):
        def dfs(node):
            if not node:
                return 0, None
            ld, ll = dfs(node.left)
            rd, rl = dfs(node.right)
            if ld == rd:
                return ld + 1, node
            elif ld > rd:
                return ld + 1, ll
            else:
                return rd + 1, rl
        return dfs(root)[1]`,
    jsCode: `var lcaDeepestLeaves = function(root) {
    const dfs = (node) => {
        if (!node) return [0, null];
        const [ld, ll] = dfs(node.left);
        const [rd, rl] = dfs(node.right);
        if (ld === rd) return [ld + 1, node];
        else if (ld > rd) return [ld + 1, ll];
        else return [rd + 1, rl];
    };
    return dfs(root)[1];
};`,
    explanation:
      '1. DFS returns (depth, LCA of deepest leaves in this subtree).\n' +
      '2. If both subtrees have the same depth, the current node is the LCA.\n' +
      '3. If the left subtree is deeper, propagate its LCA.\n' +
      '4. If the right subtree is deeper, propagate its LCA.\n' +
      '5. The root call returns the overall LCA of deepest leaves.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hints: [
      'The LCA of the deepest leaves is the deepest node whose left and right subtrees have equal depth.',
      'DFS returning (depth, lca) simplifies the logic.',
      'If one side is deeper, the LCA must be in that subtree.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1129. Shortest Path with Alternating Colors
  // ---------------------------------------------------------------------------
  {
    id: 1129,
    description:
      'You are given a directed graph of n nodes with red and blue colored edges. Find the shortest path from node 0 to each node such that the edge colors alternate along the path. Return -1 if no such path exists.',
    examples:
      'Input: n = 3, redEdges = [[0,1],[1,2]], blueEdges = [[2,1]]\nOutput: [0,1,2]',
    intuition:
      'Since edges must alternate colors, your BFS state needs to include the last color used. Start from node 0 with both colors as options, and at each step, switch to the opposite color. The first visit to each node gives the shortest alternating path.',
    approach:
      'BFS with state (node, last_color). Start from node 0 with both colors as possible starting edges. Track the shortest distance to each node regardless of the last color used.',
    code: `class Solution:
    def shortestAlternatingPaths(self, n: int, redEdges: list[list[int]], blueEdges: list[list[int]]) -> list[int]:
        from collections import defaultdict, deque
        graph = defaultdict(list)
        for u, v in redEdges:
            graph[(u, 0)].append(v)
        for u, v in blueEdges:
            graph[(u, 1)].append(v)
        dist = [-1] * n
        dist[0] = 0
        visited = set()
        queue = deque()
        queue.append((0, 0, 0))
        queue.append((0, 1, 0))
        visited.add((0, 0))
        visited.add((0, 1))
        while queue:
            node, color, d = queue.popleft()
            if dist[node] == -1:
                dist[node] = d
            next_color = 1 - color
            for nei in graph[(node, next_color)]:
                if (nei, next_color) not in visited:
                    visited.add((nei, next_color))
                    queue.append((nei, next_color, d + 1))
        return dist`,
    jsCode: `var shortestAlternatingPaths = function(n, redEdges, blueEdges) {
    const graph = new Map();
    for (const [u, v] of redEdges) {
        const key = u + ',0';
        if (!graph.has(key)) graph.set(key, []);
        graph.get(key).push(v);
    }
    for (const [u, v] of blueEdges) {
        const key = u + ',1';
        if (!graph.has(key)) graph.set(key, []);
        graph.get(key).push(v);
    }
    const dist = new Array(n).fill(-1);
    dist[0] = 0;
    const visited = new Set(['0,0', '0,1']);
    const queue = [[0, 0, 0], [0, 1, 0]];
    let idx = 0;
    while (idx < queue.length) {
        const [node, color, d] = queue[idx++];
        if (dist[node] === -1) dist[node] = d;
        const nextColor = 1 - color;
        for (const nei of (graph.get(node + ',' + nextColor) || [])) {
            const state = nei + ',' + nextColor;
            if (!visited.has(state)) {
                visited.add(state);
                queue.push([nei, nextColor, d + 1]);
            }
        }
    }
    return dist;
};`,
    explanation:
      '1. Build a graph keyed by (node, color) for edge lookups.\n' +
      '2. BFS from node 0 with both colors as starting states.\n' +
      '3. State is (node, last_edge_color). Alternate colors on each step.\n' +
      '4. The first time we reach a node, record its distance.\n' +
      '5. Return -1 for unreachable nodes.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    hints: [
      'BFS with state (node, color of last edge used).',
      'Start with both colors from node 0.',
      'Alternate colors on each step.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1137. N-th Tribonacci Number
  // ---------------------------------------------------------------------------
  {
    id: 1137,
    description:
      'The Tribonacci sequence is defined as: T0 = 0, T1 = 1, T2 = 1, and Tn = Tn-1 + Tn-2 + Tn-3 for n >= 3. Given n, return the value of Tn.',
    examples:
      'Input: n = 4\nOutput: 4\nExplanation: T3 = 0+1+1 = 2, T4 = 1+1+2 = 4.',
    intuition:
      'Just like Fibonacci but summing three terms instead of two. Keep three variables and slide them forward. No recursion or array needed - just simple iteration.',
    approach:
      'Use iterative DP with three variables. Start with T0=0, T1=1, T2=1 and compute forward.',
    code: `class Solution:
    def tribonacci(self, n: int) -> int:
        if n == 0:
            return 0
        if n <= 2:
            return 1
        a, b, c = 0, 1, 1
        for _ in range(n - 2):
            a, b, c = b, c, a + b + c
        return c`,
    jsCode: `var tribonacci = function(n) {
    if (n === 0) return 0;
    if (n <= 2) return 1;
    let a = 0, b = 1, c = 1;
    for (let i = 0; i < n - 2; i++) {
        [a, b, c] = [b, c, a + b + c];
    }
    return c;
};`,
    explanation:
      '1. Base cases: T0=0, T1=1, T2=1.\n' +
      '2. For n >= 3, iteratively compute Tn = Tn-3 + Tn-2 + Tn-1.\n' +
      '3. Use three variables a, b, c to track the last three values.\n' +
      '4. Shift them forward each iteration.\n' +
      '5. After n-2 iterations, c holds Tn.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Similar to Fibonacci but with three terms.',
      'Iterative approach with three variables avoids recursion overhead.',
      'Handle base cases n=0, n=1, n=2 separately.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1140. Stone Game II
  // ---------------------------------------------------------------------------
  {
    id: 1140,
    description:
      'Alice and Bob play a game with piles of stones. On each turn, the player can take all stones from the first X remaining piles where 1 <= X <= 2M. M starts at 1 and is updated to max(M, X) after each turn. Alice goes first. Return the maximum number of stones Alice can get.',
    examples:
      'Input: piles = [2,7,9,4,4]\nOutput: 10',
    intuition:
      'This is a minimax game: each player wants to maximize their own stones. The elegant insight is that the current player gets total_remaining minus whatever the opponent will get. Memoized recursion on (pile_index, M) solves this efficiently.',
    approach:
      'Use DP with memoization. State is (index, M). Compute suffix sums for efficient range queries. At each state, try taking 1 to 2M piles and choose the option that maximizes the current player\'s stones.',
    code: `class Solution:
    def stoneGameII(self, piles: list[int]) -> int:
        from functools import lru_cache
        n = len(piles)
        suffix = [0] * (n + 1)
        for i in range(n - 1, -1, -1):
            suffix[i] = suffix[i + 1] + piles[i]

        @lru_cache(maxsize=None)
        def dp(i, m):
            if i >= n:
                return 0
            if i + 2 * m >= n:
                return suffix[i]
            best = 0
            for x in range(1, 2 * m + 1):
                best = max(best, suffix[i] - dp(i + x, max(m, x)))
            return best

        return dp(0, 1)`,
    jsCode: `var stoneGameII = function(piles) {
    const n = piles.length;
    const suffix = new Array(n + 1).fill(0);
    for (let i = n - 1; i >= 0; i--) suffix[i] = suffix[i+1] + piles[i];
    const memo = new Map();
    const dp = (i, m) => {
        if (i >= n) return 0;
        if (i + 2 * m >= n) return suffix[i];
        const key = i + ',' + m;
        if (memo.has(key)) return memo.get(key);
        let best = 0;
        for (let x = 1; x <= 2 * m; x++) {
            best = Math.max(best, suffix[i] - dp(i + x, Math.max(m, x)));
        }
        memo.set(key, best);
        return best;
    };
    return dp(0, 1);
};`,
    explanation:
      '1. suffix[i] = sum of piles[i:].\n' +
      '2. dp(i, m) = max stones the current player can get from piles[i:].\n' +
      '3. Try taking x piles (1 <= x <= 2*m). Opponent gets dp(i+x, max(m,x)).\n' +
      '4. Current player gets suffix[i] - dp(i+x, max(m,x)).\n' +
      '5. Return dp(0, 1) for Alice starting first.',
    timeComplexity: 'O(n^3)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Use suffix sums for efficient range sum queries.',
      'State is (current index, current M value).',
      'Current player takes suffix_sum minus what opponent will get.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1146. Snapshot Array
  // ---------------------------------------------------------------------------
  {
    id: 1146,
    description:
      'Implement a SnapshotArray that supports set(index, val), snap() which takes a snapshot and returns the snap_id, and get(index, snap_id) which returns the value at the given index at the time of the given snap.',
    examples:
      'Input: ["SnapshotArray","set","snap","set","get"]\n[[3],[0,5],[],[0,6],[0,0]]\nOutput: [null,null,0,null,5]',
    intuition:
      'Copying the entire array on every snapshot is wasteful. Instead, for each index, only record changes with their snapshot ID. Binary search on these sparse records retrieves any historical value efficiently.',
    approach:
      'For each index, store a list of (snap_id, value) pairs. On get, binary search for the correct snap_id. This avoids copying the entire array on each snap.',
    code: `class SnapshotArray:
    def __init__(self, length: int):
        self.snaps = [[[0, 0]] for _ in range(length)]
        self.snap_id = 0

    def set(self, index: int, val: int) -> None:
        if self.snaps[index][-1][0] == self.snap_id:
            self.snaps[index][-1][1] = val
        else:
            self.snaps[index].append([self.snap_id, val])

    def snap(self) -> int:
        self.snap_id += 1
        return self.snap_id - 1

    def get(self, index: int, snap_id: int) -> int:
        import bisect
        arr = self.snaps[index]
        i = bisect.bisect_right(arr, [snap_id, float('inf')]) - 1
        return arr[i][1]`,
    jsCode: `var SnapshotArray = function(length) {
    this.snaps = Array.from({length}, () => [[0, 0]]);
    this.snapId = 0;
};
SnapshotArray.prototype.set = function(index, val) {
    const arr = this.snaps[index];
    if (arr[arr.length - 1][0] === this.snapId) arr[arr.length - 1][1] = val;
    else arr.push([this.snapId, val]);
};
SnapshotArray.prototype.snap = function() {
    return this.snapId++;
};
SnapshotArray.prototype.get = function(index, snap_id) {
    const arr = this.snaps[index];
    let lo = 0, hi = arr.length - 1;
    while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        if (arr[mid][0] <= snap_id) lo = mid;
        else hi = mid - 1;
    }
    return arr[lo][1];
};`,
    explanation:
      '1. Each index stores a list of (snap_id, value) entries.\n' +
      '2. set() appends or updates the latest entry for the current snap_id.\n' +
      '3. snap() increments the snap_id and returns the previous one.\n' +
      '4. get() uses binary search to find the latest entry at or before the given snap_id.\n' +
      '5. This is memory-efficient: only stores changes, not full copies.',
    timeComplexity: 'O(1) for set/snap, O(log n) for get',
    spaceComplexity: 'O(n + number of set calls)',
    hints: [
      'Storing a full copy on each snap is too expensive.',
      'Instead, store (snap_id, value) pairs per index.',
      'Binary search on snap_id for efficient retrieval.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1155. Number of Dice Rolls With Target Sum
  // ---------------------------------------------------------------------------
  {
    id: 1155,
    description:
      'You have n dice, each with k faces numbered 1 to k. Return the number of possible ways to roll the dice so that the sum of the face-up numbers equals target. Return the answer modulo 10^9 + 7.',
    examples:
      'Input: n = 1, k = 6, target = 3\nOutput: 1\nExplanation: Only one way: roll a 3.',
    intuition:
      'Think of it as distributing dice rolls to hit a target sum. Each die adds 1 to k, so DP builds up: dp[sum] after i dice = sum of dp[sum - face] from the previous round. A rolling 1D array keeps space minimal.',
    approach:
      'Use DP where dp[i][j] is the number of ways to get sum j using i dice. For each die, try all face values 1 to k. Optimize space by using a rolling array.',
    code: `class Solution:
    def numRollsToTarget(self, n: int, k: int, target: int) -> int:
        MOD = 10**9 + 7
        dp = [0] * (target + 1)
        dp[0] = 1
        for i in range(n):
            new_dp = [0] * (target + 1)
            for j in range(1, target + 1):
                for face in range(1, k + 1):
                    if j - face >= 0:
                        new_dp[j] = (new_dp[j] + dp[j - face]) % MOD
            dp = new_dp
        return dp[target]`,
    jsCode: `var numRollsToTarget = function(n, k, target) {
    const MOD = 1e9 + 7;
    let dp = new Array(target + 1).fill(0);
    dp[0] = 1;
    for (let i = 0; i < n; i++) {
        const newDp = new Array(target + 1).fill(0);
        for (let j = 1; j <= target; j++) {
            for (let face = 1; face <= k; face++) {
                if (j - face >= 0) newDp[j] = (newDp[j] + dp[j - face]) % MOD;
            }
        }
        dp = newDp;
    }
    return dp[target];
};`,
    explanation:
      '1. dp[j] = number of ways to reach sum j with the current number of dice.\n' +
      '2. Start with dp[0] = 1 (zero dice, sum 0).\n' +
      '3. For each die, update new_dp: for each sum j, add dp[j-face] for faces 1..k.\n' +
      '4. Roll the dp array after each die.\n' +
      '5. Return dp[target] after processing all n dice.',
    timeComplexity: 'O(n * target * k)',
    spaceComplexity: 'O(target)',
    hints: [
      'Classic DP: dp[dice][sum] = number of ways.',
      'For each die, try each face value and add to the previous sum.',
      'Optimize space by using a 1D rolling array.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1161. Maximum Level Sum of a Binary Tree
  // ---------------------------------------------------------------------------
  {
    id: 1161,
    description:
      'Given the root of a binary tree, return the smallest level (1-indexed) with the maximum sum of node values.',
    examples:
      'Input: root = [1,7,0,7,-8,null,null]\nOutput: 2\nExplanation: Level 1 sum = 1, Level 2 sum = 7+0 = 7, Level 3 sum = 7+(-8) = -1. Max is 7 at level 2.',
    intuition:
      'BFS processes the tree level by level naturally. Sum each level\'s values and track which level has the highest sum. Since BFS processes levels in order, the first maximum found is the smallest-numbered level.',
    approach:
      'BFS level by level. Compute the sum of each level and track the level with the maximum sum.',
    code: `class Solution:
    def maxLevelSum(self, root) -> int:
        from collections import deque
        queue = deque([root])
        max_sum = float('-inf')
        max_level = 1
        level = 1
        while queue:
            level_sum = 0
            for _ in range(len(queue)):
                node = queue.popleft()
                level_sum += node.val
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            if level_sum > max_sum:
                max_sum = level_sum
                max_level = level
            level += 1
        return max_level`,
    jsCode: `var maxLevelSum = function(root) {
    const queue = [root];
    let maxSum = -Infinity, maxLevel = 1, level = 1;
    let idx = 0;
    while (idx < queue.length) {
        const size = queue.length - idx;
        let levelSum = 0;
        for (let i = 0; i < size; i++) {
            const node = queue[idx++];
            levelSum += node.val;
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        if (levelSum > maxSum) { maxSum = levelSum; maxLevel = level; }
        level++;
    }
    return maxLevel;
};`,
    explanation:
      '1. BFS processes the tree level by level.\n' +
      '2. For each level, sum all node values.\n' +
      '3. Track the maximum sum and its corresponding level.\n' +
      '4. Return the smallest level with the maximum sum.\n' +
      '5. BFS naturally processes levels in order.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'BFS gives natural level-by-level processing.',
      'Sum all node values at each level.',
      'Track the level with the highest sum.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1162. As Far from Land as Possible
  // ---------------------------------------------------------------------------
  {
    id: 1162,
    description:
      'Given an n x n grid containing only 0s (water) and 1s (land), return the maximum Manhattan distance from any water cell to its nearest land cell. Return -1 if there is no land or no water.',
    examples:
      'Input: grid = [[1,0,1],[0,0,0],[1,0,1]]\nOutput: 2',
    intuition:
      'Imagine all land cells simultaneously sending out ripples. Multi-source BFS from every land cell finds the distance to the nearest land for every water cell. The last water cell reached has the maximum distance.',
    approach:
      'Multi-source BFS from all land cells simultaneously. The BFS level when we visit the last water cell is the answer.',
    code: `class Solution:
    def maxDistance(self, grid: list[list[int]]) -> int:
        from collections import deque
        n = len(grid)
        queue = deque()
        for r in range(n):
            for c in range(n):
                if grid[r][c] == 1:
                    queue.append((r, c))
        if len(queue) == 0 or len(queue) == n * n:
            return -1
        dist = 0
        while queue:
            dist += 1
            for _ in range(len(queue)):
                r, c = queue.popleft()
                for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                    nr, nc = r+dr, c+dc
                    if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0:
                        grid[nr][nc] = 1
                        queue.append((nr, nc))
        return dist - 1`,
    jsCode: `var maxDistance = function(grid) {
    const n = grid.length;
    const queue = [];
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (grid[r][c] === 1) queue.push([r, c]);
        }
    }
    if (queue.length === 0 || queue.length === n * n) return -1;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    let dist = 0, idx = 0;
    while (idx < queue.length) {
        dist++;
        const size = queue.length - idx;
        for (let i = 0; i < size; i++) {
            const [r, c] = queue[idx++];
            for (const [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 0) {
                    grid[nr][nc] = 1;
                    queue.push([nr, nc]);
                }
            }
        }
    }
    return dist - 1;
};`,
    explanation:
      '1. Initialize BFS from all land cells (multi-source).\n' +
      '2. If no land or no water, return -1.\n' +
      '3. BFS expands one level at a time, marking water cells as visited.\n' +
      '4. The distance increments with each BFS level.\n' +
      '5. The last level reached is the maximum distance.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)',
    hints: [
      'Multi-source BFS from all land cells simultaneously.',
      'Each BFS level represents one unit of distance.',
      'The answer is the distance at which the last water cell is reached.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1187. Make Array Strictly Increasing
  // ---------------------------------------------------------------------------
  {
    id: 1187,
    description:
      'Given two integer arrays arr1 and arr2, return the minimum number of operations to make arr1 strictly increasing. In one operation, you can choose an element from arr2 to replace an element in arr1. Return -1 if impossible.',
    examples:
      'Input: arr1 = [1,5,3,6,7], arr2 = [1,3,2,4]\nOutput: 1\nExplanation: Replace 5 with 2 or 4 to make arr1 strictly increasing.',
    intuition:
      'At each position, you have two choices: keep the original value (if it maintains strict increase) or replace it with the smallest valid value from arr2. DP tracks all possible (last_value, operations) states, and binary search finds the best replacement efficiently.',
    approach:
      'Sort arr2 and remove duplicates. Use DP where dp[i] is a map from the last value to the minimum operations. For each element, either keep it (if > previous) or replace it with the smallest value from arr2 that is > previous.',
    code: `class Solution:
    def makeArrayIncreasing(self, arr1: list[int], arr2: list[int]) -> int:
        import bisect
        arr2 = sorted(set(arr2))
        dp = {-1: 0}
        for num in arr1:
            new_dp = {}
            for prev, ops in dp.items():
                if num > prev:
                    if num not in new_dp or new_dp[num] > ops:
                        new_dp[num] = ops
                idx = bisect.bisect_right(arr2, prev)
                if idx < len(arr2):
                    val = arr2[idx]
                    if val not in new_dp or new_dp[val] > ops + 1:
                        new_dp[val] = ops + 1
            dp = new_dp
            if not dp:
                return -1
        return min(dp.values())`,
    jsCode: `var makeArrayIncreasing = function(arr1, arr2) {
    arr2 = [...new Set(arr2)].sort((a, b) => a - b);
    let dp = new Map([[-1, 0]]);
    const bisectRight = (arr, val) => {
        let lo = 0, hi = arr.length;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid] <= val) lo = mid + 1; else hi = mid; }
        return lo;
    };
    for (const num of arr1) {
        const newDp = new Map();
        for (const [prev, ops] of dp) {
            if (num > prev) {
                if (!newDp.has(num) || newDp.get(num) > ops) newDp.set(num, ops);
            }
            const idx = bisectRight(arr2, prev);
            if (idx < arr2.length) {
                const val = arr2[idx];
                if (!newDp.has(val) || newDp.get(val) > ops + 1) newDp.set(val, ops + 1);
            }
        }
        dp = newDp;
        if (dp.size === 0) return -1;
    }
    return Math.min(...dp.values());
};`,
    explanation:
      '1. Sort and deduplicate arr2 for binary search.\n' +
      '2. dp maps the last value used to the minimum operations needed.\n' +
      '3. For each element in arr1, either keep it (if strictly increasing) or replace with smallest valid from arr2.\n' +
      '4. Use binary search to find the smallest arr2 value > previous.\n' +
      '5. If dp becomes empty, return -1. Otherwise, return the minimum operations.',
    timeComplexity: 'O(n * m * log m) where n = len(arr1), m = len(arr2)',
    spaceComplexity: 'O(n + m)',
    hints: [
      'DP with state being the last value placed.',
      'For each position, decide: keep original or replace from arr2.',
      'Use binary search on sorted arr2 to find the smallest valid replacement.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1192. Critical Connections in a Network
  // ---------------------------------------------------------------------------
  {
    id: 1192,
    description:
      'There are n servers numbered 0 to n-1 connected by undirected edges. A critical connection is an edge whose removal disconnects the graph. Return all critical connections.',
    examples:
      'Input: n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]\nOutput: [[1,3]]',
    intuition:
      'A bridge is an edge whose removal disconnects the graph. Tarjan\'s algorithm finds bridges by tracking how far back each subtree can reach. If a child\'s subtree cannot reach above the current edge, that edge is a bridge.',
    approach:
      'Use Tarjan\'s bridge-finding algorithm. DFS with discovery times and low values. An edge (u, v) is a bridge if low[v] > disc[u], meaning v cannot reach u or any ancestor without using edge (u,v).',
    code: `class Solution:
    def criticalConnections(self, n: int, connections: list[list[int]]) -> list[list[int]]:
        from collections import defaultdict
        graph = defaultdict(list)
        for u, v in connections:
            graph[u].append(v)
            graph[v].append(u)
        disc = [-1] * n
        low = [0] * n
        result = []
        self.time = 0
        def dfs(u, parent):
            disc[u] = low[u] = self.time
            self.time += 1
            for v in graph[u]:
                if disc[v] == -1:
                    dfs(v, u)
                    low[u] = min(low[u], low[v])
                    if low[v] > disc[u]:
                        result.append([u, v])
                elif v != parent:
                    low[u] = min(low[u], disc[v])
        dfs(0, -1)
        return result`,
    jsCode: `var criticalConnections = function(n, connections) {
    const graph = Array.from({length: n}, () => []);
    for (const [u, v] of connections) {
        graph[u].push(v);
        graph[v].push(u);
    }
    const disc = new Array(n).fill(-1);
    const low = new Array(n).fill(0);
    const result = [];
    let time = 0;
    const dfs = (u, parent) => {
        disc[u] = low[u] = time++;
        for (const v of graph[u]) {
            if (disc[v] === -1) {
                dfs(v, u);
                low[u] = Math.min(low[u], low[v]);
                if (low[v] > disc[u]) result.push([u, v]);
            } else if (v !== parent) {
                low[u] = Math.min(low[u], disc[v]);
            }
        }
    };
    dfs(0, -1);
    return result;
};`,
    explanation:
      '1. Build an adjacency list from connections.\n' +
      '2. DFS tracking discovery time (disc) and low value (low) for each node.\n' +
      '3. low[u] = earliest discovery time reachable from the subtree of u.\n' +
      '4. Edge (u, v) is a bridge if low[v] > disc[u] (v cannot reach u\'s ancestors).\n' +
      '5. Return all bridges found.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    hints: [
      'Use Tarjan\'s algorithm for finding bridges.',
      'Track discovery time and low-link values during DFS.',
      'An edge is a bridge if the low-link of the child > discovery time of the parent.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1207. Unique Number of Occurrences
  // ---------------------------------------------------------------------------
  {
    id: 1207,
    description:
      'Given an array of integers arr, return true if the number of occurrences of each value in the array is unique.',
    examples:
      'Input: arr = [1,2,2,1,1,3]\nOutput: true\nExplanation: 1 occurs 3 times, 2 occurs 2 times, 3 occurs 1 time. All different.',
    intuition:
      'Count how often each value appears, then check if all those counts are distinct. If the number of unique counts equals the number of distinct values, every occurrence count is unique.',
    approach:
      'Count the frequency of each value. Then check if all frequencies are unique by comparing the length of frequencies with the length of the set of frequencies.',
    code: `class Solution:
    def uniqueOccurrences(self, arr: list[int]) -> bool:
        from collections import Counter
        count = Counter(arr)
        freqs = count.values()
        return len(freqs) == len(set(freqs))`,
    jsCode: `var uniqueOccurrences = function(arr) {
    const count = {};
    for (const val of arr) count[val] = (count[val] || 0) + 1;
    const freqs = Object.values(count);
    return freqs.length === new Set(freqs).size;
};`,
    explanation:
      '1. Count the frequency of each value using Counter.\n' +
      '2. Extract all frequency values.\n' +
      '3. Convert to a set to remove duplicates.\n' +
      '4. If the set size equals the original number of frequencies, all are unique.\n' +
      '5. Return the comparison result.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Count frequencies of each value.',
      'Check if all frequencies are distinct.',
      'A set of frequencies should have the same size as the list of frequencies.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1208. Get Equal Substrings Within Budget
  // ---------------------------------------------------------------------------
  {
    id: 1208,
    description:
      'You are given two strings s and t of the same length and an integer maxCost. The cost of changing s[i] to t[i] is |s[i] - t[i]|. Return the maximum length of a substring of s that can be changed to the corresponding substring of t with a cost not exceeding maxCost.',
    examples:
      'Input: s = "abcd", t = "bcdf", maxCost = 3\nOutput: 3\nExplanation: "abc" -> "bcd" costs |a-b|+|b-c|+|c-d| = 1+1+1 = 3.',
    intuition:
      'The per-character cost forms an array, and you need the longest subarray with sum at most maxCost. A sliding window expands right and shrinks left whenever the cost exceeds the budget - classic window technique.',
    approach:
      'Use a sliding window. Compute the cost array (|s[i] - t[i]| for each i). Expand the right pointer, and shrink from the left when the window cost exceeds maxCost.',
    code: `class Solution:
    def equalSubstring(self, s: str, t: str, maxCost: int) -> int:
        n = len(s)
        left = 0
        current_cost = 0
        ans = 0
        for right in range(n):
            current_cost += abs(ord(s[right]) - ord(t[right]))
            while current_cost > maxCost:
                current_cost -= abs(ord(s[left]) - ord(t[left]))
                left += 1
            ans = max(ans, right - left + 1)
        return ans`,
    jsCode: `var equalSubstring = function(s, t, maxCost) {
    const n = s.length;
    let left = 0, currentCost = 0, ans = 0;
    for (let right = 0; right < n; right++) {
        currentCost += Math.abs(s.charCodeAt(right) - t.charCodeAt(right));
        while (currentCost > maxCost) {
            currentCost -= Math.abs(s.charCodeAt(left) - t.charCodeAt(left));
            left++;
        }
        ans = Math.max(ans, right - left + 1);
    }
    return ans;
};`,
    explanation:
      '1. Sliding window with left and right pointers.\n' +
      '2. Add the cost of including s[right] -> t[right] to current_cost.\n' +
      '3. While current_cost > maxCost, shrink from the left.\n' +
      '4. Track the maximum window size.\n' +
      '5. Return the largest valid window.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Compute the per-character cost array.',
      'Use a sliding window to find the longest subarray with sum <= maxCost.',
      'Shrink the window from the left when cost exceeds the budget.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1209. Remove All Adjacent Duplicates in String II
  // ---------------------------------------------------------------------------
  {
    id: 1209,
    description:
      'You are given a string s and an integer k. Repeatedly remove k adjacent equal characters until no more can be removed. Return the final string.',
    examples:
      'Input: s = "deeedbbcccbdaa", k = 3\nOutput: "aa"\nExplanation: Remove "eee" -> "dbbcccbdaa", remove "ccc" -> "dbbbbdaa", remove "bbbb" (k=3 removes 3 of them) -> wait, "bbbb" has 4, remove 3 -> "dbdaa", remove "ddd"? No. Actually: "deeedbbcccbdaa" -> remove "eee" -> "dbbcccbdaa" -> remove "ccc" -> "dbbbbdaa" -> remove "bbbb" (4 >= 3, remove 3) -> "dbdaa" -> remove "ddd"? No. Re-eval: stack approach handles this correctly.',
    intuition:
      'A stack of (character, count) pairs handles cascading removals perfectly. When a run reaches length k, pop it off. This may expose a new match at the stack top, which the next character will handle automatically.',
    approach:
      'Use a stack of (character, count) pairs. For each character, if it matches the stack top, increment the count. When count reaches k, pop it. This handles cascading removals.',
    code: `class Solution:
    def removeDuplicates(self, s: str, k: int) -> str:
        stack = []
        for c in s:
            if stack and stack[-1][0] == c:
                stack[-1][1] += 1
                if stack[-1][1] == k:
                    stack.pop()
            else:
                stack.append([c, 1])
        return ''.join(c * cnt for c, cnt in stack)`,
    jsCode: `var removeDuplicates = function(s, k) {
    const stack = []; // [char, count]
    for (const c of s) {
        if (stack.length && stack[stack.length - 1][0] === c) {
            stack[stack.length - 1][1]++;
            if (stack[stack.length - 1][1] === k) stack.pop();
        } else {
            stack.push([c, 1]);
        }
    }
    return stack.map(([c, cnt]) => c.repeat(cnt)).join('');
};`,
    explanation:
      '1. Stack stores (character, consecutive_count) pairs.\n' +
      '2. For each character, if it matches the stack top, increment the count.\n' +
      '3. If the count reaches k, pop the entry (remove k adjacent duplicates).\n' +
      '4. Otherwise, push a new entry with count 1.\n' +
      '5. Reconstruct the string from the stack.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a stack to track character runs with their counts.',
      'When a run reaches length k, remove it from the stack.',
      'This automatically handles cascading removals.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1217. Minimum Cost to Move Chips to The Same Position
  // ---------------------------------------------------------------------------
  {
    id: 1217,
    description:
      'We have n chips at various positions. Moving a chip by 2 positions costs 0, moving by 1 position costs 1. Return the minimum cost to move all chips to the same position.',
    examples:
      'Input: position = [1,2,3]\nOutput: 1\nExplanation: Move chip at 2 to 1 (cost 1) or to 3 (cost 1). Min cost = 1.',
    intuition:
      'Moving a chip 2 positions is free, so all chips on even positions can be gathered at any even spot for free, and all odd chips at any odd spot for free. The cost is just moving the smaller group by one position to join the other.',
    approach:
      'Since moving by 2 is free, all chips on even positions can be grouped together for free, and all on odd positions can be grouped for free. The cost is the minimum of the count of even-position chips and odd-position chips.',
    code: `class Solution:
    def minCostToMoveChips(self, position: list[int]) -> int:
        evens = sum(1 for p in position if p % 2 == 0)
        odds = len(position) - evens
        return min(evens, odds)`,
    jsCode: `var minCostToMoveChips = function(position) {
    let evens = 0;
    for (const p of position) { if (p % 2 === 0) evens++; }
    const odds = position.length - evens;
    return Math.min(evens, odds);
};`,
    explanation:
      '1. Moving by 2 is free, so parity is all that matters.\n' +
      '2. Count chips at even positions and odd positions.\n' +
      '3. To minimize cost, move the smaller group to join the larger group.\n' +
      '4. Each chip in the smaller group costs 1 to move (one step to change parity).\n' +
      '5. Return the smaller count.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Moving by 2 is free, so all chips of the same parity can be gathered for free.',
      'The cost is moving chips from one parity to the other.',
      'Move the smaller group for minimum cost.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1219. Path with Maximum Gold
  // ---------------------------------------------------------------------------
  {
    id: 1219,
    description:
      'In a gold mine grid, each cell has an integer representing the amount of gold. Return the maximum amount of gold you can collect starting from any cell with gold and moving to adjacent cells (up, down, left, right). You cannot visit a cell more than once or visit cells with 0 gold.',
    examples:
      'Input: grid = [[0,6,0],[5,8,7],[0,9,0]]\nOutput: 24\nExplanation: Path: 9->8->7 = 24 or 6->8->9 = 23. Actually 9->8->7 = 24.',
    intuition:
      'The grid is small enough for brute-force backtracking. Start DFS from every gold cell, collect as much as possible, and backtrack. Setting cells to 0 during traversal prevents revisiting, and restoring them enables trying other paths.',
    approach:
      'Use DFS/backtracking from every cell with gold. Mark cells as visited during traversal and unmark on backtrack. Track the maximum gold collected across all starting points.',
    code: `class Solution:
    def getMaximumGold(self, grid: list[list[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == 0:
                return 0
            gold = grid[r][c]
            grid[r][c] = 0
            best = 0
            for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
                best = max(best, dfs(r+dr, c+dc))
            grid[r][c] = gold
            return gold + best
        ans = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] != 0:
                    ans = max(ans, dfs(r, c))
        return ans`,
    jsCode: `var getMaximumGold = function(grid) {
    const rows = grid.length, cols = grid[0].length;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    const dfs = (r, c) => {
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === 0) return 0;
        const gold = grid[r][c];
        grid[r][c] = 0;
        let best = 0;
        for (const [dr, dc] of dirs) best = Math.max(best, dfs(r+dr, c+dc));
        grid[r][c] = gold;
        return gold + best;
    };
    let ans = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] !== 0) ans = Math.max(ans, dfs(r, c));
        }
    }
    return ans;
};`,
    explanation:
      '1. Try starting DFS from every non-zero cell.\n' +
      '2. At each cell, collect the gold and mark it as 0 (visited).\n' +
      '3. Recursively explore all 4 directions and take the maximum.\n' +
      '4. Restore the cell value on backtrack.\n' +
      '5. Return the maximum gold across all starting cells.',
    timeComplexity: 'O(k * 3^k) where k is number of gold cells',
    spaceComplexity: 'O(k) for recursion depth',
    hints: [
      'Backtracking DFS from every cell with gold.',
      'Mark cells as visited by setting to 0, restore on backtrack.',
      'Track the maximum gold collected across all paths.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1232. Check If It Is a Straight Line
  // ---------------------------------------------------------------------------
  {
    id: 1232,
    description:
      'You are given an array of coordinates where coordinates[i] = [x, y]. Check if these points make a straight line in the XY plane.',
    examples:
      'Input: coordinates = [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]]\nOutput: true',
    intuition:
      'Two points always form a line. Every additional point must satisfy the same slope relationship. Using cross multiplication (dy1 * dx2 == dy2 * dx1) avoids division and handles vertical lines cleanly.',
    approach:
      'Check if all points have the same slope relative to the first two points. Use cross multiplication to avoid division: (y2-y1)*(x-x1) == (y-y1)*(x2-x1) for all points.',
    code: `class Solution:
    def checkStraightLine(self, coordinates: list[list[int]]) -> bool:
        x0, y0 = coordinates[0]
        x1, y1 = coordinates[1]
        dx, dy = x1 - x0, y1 - y0
        for i in range(2, len(coordinates)):
            x, y = coordinates[i]
            if dy * (x - x0) != dx * (y - y0):
                return False
        return True`,
    jsCode: `var checkStraightLine = function(coordinates) {
    const [x0, y0] = coordinates[0];
    const [x1, y1] = coordinates[1];
    const dx = x1 - x0, dy = y1 - y0;
    for (let i = 2; i < coordinates.length; i++) {
        const [x, y] = coordinates[i];
        if (dy * (x - x0) !== dx * (y - y0)) return false;
    }
    return true;
};`,
    explanation:
      '1. Compute the direction vector (dx, dy) from the first two points.\n' +
      '2. For each subsequent point, check if it lies on the same line.\n' +
      '3. Use cross multiplication: dy * (x - x0) should equal dx * (y - y0).\n' +
      '4. This avoids division by zero issues.\n' +
      '5. If all points pass the check, they are collinear.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Two points always form a line. Check if every other point lies on it.',
      'Use cross multiplication instead of slope to avoid division by zero.',
      'All slopes relative to the first point must be equal.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1235. Maximum Profit in Job Scheduling
  // ---------------------------------------------------------------------------
  {
    id: 1235,
    description:
      'We have n jobs where job i has startTime[i], endTime[i], and profit[i]. Return the maximum profit you can take such that no two chosen jobs overlap. A job that ends at time x can be followed by a job starting at time x.',
    examples:
      'Input: startTime = [1,2,3,3], endTime = [3,4,5,6], profit = [50,10,40,70]\nOutput: 120\nExplanation: Take jobs 1 and 4: profit = 50 + 70 = 120.',
    intuition:
      'Sort jobs by end time, then for each job, decide: skip it, or take it plus the best profit from non-overlapping earlier jobs. Binary search quickly finds the last compatible job. This is the weighted job scheduling pattern.',
    approach:
      'Sort jobs by end time. Use DP where dp[i] is the max profit considering the first i jobs. For each job, either skip it or take it (find the last non-overlapping job using binary search).',
    code: `class Solution:
    def jobScheduling(self, startTime: list[int], endTime: list[int], profit: list[int]) -> int:
        import bisect
        jobs = sorted(zip(endTime, startTime, profit))
        ends = [j[0] for j in jobs]
        n = len(jobs)
        dp = [0] * (n + 1)
        for i in range(1, n + 1):
            end, start, p = jobs[i - 1]
            j = bisect.bisect_right(ends, start, 0, i - 1)
            dp[i] = max(dp[i - 1], dp[j] + p)
        return dp[n]`,
    jsCode: `var jobScheduling = function(startTime, endTime, profit) {
    const jobs = startTime.map((s, i) => [endTime[i], s, profit[i]]).sort((a, b) => a[0] - b[0]);
    const ends = jobs.map(j => j[0]);
    const n = jobs.length;
    const dp = new Array(n + 1).fill(0);
    const bisectRight = (arr, val, hi) => {
        let lo = 0;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid] <= val) lo = mid + 1; else hi = mid; }
        return lo;
    };
    for (let i = 1; i <= n; i++) {
        const [end, start, p] = jobs[i-1];
        const j = bisectRight(ends, start, i - 1);
        dp[i] = Math.max(dp[i-1], dp[j] + p);
    }
    return dp[n];
};`,
    explanation:
      '1. Sort jobs by end time.\n' +
      '2. dp[i] = max profit using the first i jobs.\n' +
      '3. For job i, binary search for the latest job that ends <= start time of job i.\n' +
      '4. dp[i] = max(skip job i: dp[i-1], take job i: dp[j] + profit[i]).\n' +
      '5. Return dp[n].',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Sort jobs by end time for DP.',
      'Binary search to find the last non-overlapping job.',
      'For each job: max of skipping it or taking it plus best non-overlapping prefix.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1239. Maximum Length of a Concatenated String with Unique Characters
  // ---------------------------------------------------------------------------
  {
    id: 1239,
    description:
      'You are given an array of strings arr. A string s is formed by the concatenation of a subsequence of arr that has unique characters. Return the maximum possible length of s.',
    examples:
      'Input: arr = ["un","iq","ue"]\nOutput: 4\nExplanation: "uniq" or "ique" has 4 unique characters.',
    intuition:
      'With at most 16 valid strings, you can try all subsets via backtracking. Bitmasks encode which characters are used, making conflict detection a simple bitwise AND. If two bitmasks have no overlap, the strings can be concatenated.',
    approach:
      'Use backtracking or DP with bitmasks. Filter out strings with duplicate characters. Try including or excluding each string, tracking used characters with a bitmask.',
    code: `class Solution:
    def maxLength(self, arr: list[str]) -> int:
        masks = []
        for s in arr:
            mask = 0
            valid = True
            for c in s:
                bit = 1 << (ord(c) - ord('a'))
                if mask & bit:
                    valid = False
                    break
                mask |= bit
            if valid:
                masks.append((mask, len(s)))
        self.ans = 0
        def bt(i, cur_mask, cur_len):
            self.ans = max(self.ans, cur_len)
            for j in range(i, len(masks)):
                m, l = masks[j]
                if cur_mask & m == 0:
                    bt(j + 1, cur_mask | m, cur_len + l)
        bt(0, 0, 0)
        return self.ans`,
    jsCode: `var maxLength = function(arr) {
    const masks = [];
    for (const s of arr) {
        let mask = 0, valid = true;
        for (const c of s) {
            const bit = 1 << (c.charCodeAt(0) - 97);
            if (mask & bit) { valid = false; break; }
            mask |= bit;
        }
        if (valid) masks.push([mask, s.length]);
    }
    let ans = 0;
    const bt = (i, curMask, curLen) => {
        ans = Math.max(ans, curLen);
        for (let j = i; j < masks.length; j++) {
            const [m, l] = masks[j];
            if ((curMask & m) === 0) bt(j + 1, curMask | m, curLen + l);
        }
    };
    bt(0, 0, 0);
    return ans;
};`,
    explanation:
      '1. Convert each string to a bitmask of characters. Skip strings with duplicate characters.\n' +
      '2. Use backtracking: for each string, include it if no character conflicts.\n' +
      '3. Track the current bitmask and total length.\n' +
      '4. Update the maximum length at each step.\n' +
      '5. Bitmask operations make conflict detection O(1).',
    timeComplexity: 'O(2^n) where n is the number of valid strings',
    spaceComplexity: 'O(n)',
    hints: [
      'First filter out strings that have duplicate characters.',
      'Use bitmasks to efficiently check for character conflicts.',
      'Try all subsets, skipping those with overlapping characters.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1248. Count Number of Nice Subarrays
  // ---------------------------------------------------------------------------
  {
    id: 1248,
    description:
      'Given an array of integers nums and an integer k, return the number of nice subarrays. A nice subarray has exactly k odd numbers.',
    examples:
      'Input: nums = [1,1,2,1,1], k = 3\nOutput: 2\nExplanation: Subarrays [1,1,2,1] and [1,2,1,1] have 3 odd numbers.',
    intuition:
      'Counting subarrays with exactly k odd numbers is tricky, but \'at most k\' is easy with a sliding window. The clever identity \'exactly k = atMost(k) - atMost(k-1)\' converts the hard problem into two easy ones.',
    approach:
      'Use the technique: exactly(k) = atMost(k) - atMost(k-1). atMost(k) uses a sliding window counting odd numbers.',
    code: `class Solution:
    def numberOfSubarrays(self, nums: list[int], k: int) -> int:
        def atMost(k):
            left = result = odds = 0
            for right in range(len(nums)):
                if nums[right] % 2 == 1:
                    odds += 1
                while odds > k:
                    if nums[left] % 2 == 1:
                        odds -= 1
                    left += 1
                result += right - left + 1
            return result
        return atMost(k) - atMost(k - 1)`,
    jsCode: `var numberOfSubarrays = function(nums, k) {
    const atMost = (k) => {
        let left = 0, result = 0, odds = 0;
        for (let right = 0; right < nums.length; right++) {
            if (nums[right] % 2 === 1) odds++;
            while (odds > k) {
                if (nums[left] % 2 === 1) odds--;
                left++;
            }
            result += right - left + 1;
        }
        return result;
    };
    return atMost(k) - atMost(k - 1);
};`,
    explanation:
      '1. atMost(k) counts subarrays with at most k odd numbers.\n' +
      '2. exactly(k) = atMost(k) - atMost(k-1).\n' +
      '3. Sliding window tracks the count of odd numbers in the window.\n' +
      '4. Shrink from left when odd count exceeds k.\n' +
      '5. For each right, add (right - left + 1) valid subarrays.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Transform the problem: treat each number as 1 (odd) or 0 (even).',
      'Now find subarrays with exactly k ones: use atMost(k) - atMost(k-1).',
      'Sliding window for the atMost helper function.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1249. Minimum Remove to Make Valid Parentheses
  // ---------------------------------------------------------------------------
  {
    id: 1249,
    description:
      'Given a string s of parentheses and lowercase English letters, remove the minimum number of parentheses to make the resulting string valid. A valid string has matched parentheses.',
    examples:
      'Input: s = "lee(t(c)o)de)"\nOutput: "lee(t(c)o)de"',
    intuition:
      'Use a stack to match parentheses: push \'(\' indices, pop on \')\'. Unmatched parentheses (remaining \'(\' in the stack or \')\' that found no match) are the ones to remove. This identifies the minimum removals in one pass.',
    approach:
      'Use a stack to identify unmatched parentheses. First pass: track indices of unmatched ( and ). Second pass: build the result excluding those indices.',
    code: `class Solution:
    def minRemoveToMakeValid(self, s: str) -> str:
        to_remove = set()
        stack = []
        for i, c in enumerate(s):
            if c == '(':
                stack.append(i)
            elif c == ')':
                if stack:
                    stack.pop()
                else:
                    to_remove.add(i)
        to_remove.update(stack)
        return ''.join(c for i, c in enumerate(s) if i not in to_remove)`,
    jsCode: `var minRemoveToMakeValid = function(s) {
    const toRemove = new Set();
    const stack = [];
    for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') stack.push(i);
        else if (s[i] === ')') {
            if (stack.length) stack.pop();
            else toRemove.add(i);
        }
    }
    for (const idx of stack) toRemove.add(idx);
    return [...s].filter((_, i) => !toRemove.has(i)).join('');
};`,
    explanation:
      '1. Use a stack to track indices of unmatched (.\n' +
      '2. On ), if there is a matching (, pop from stack. Otherwise, mark ) for removal.\n' +
      '3. After processing, remaining indices in the stack are unmatched ( to remove.\n' +
      '4. Build the result by skipping all marked indices.\n' +
      '5. This gives the minimum removals.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'Use a stack to find unmatched parentheses.',
      'Track indices of unmatched ( and ) for removal.',
      'Build the result string excluding those indices.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1254. Number of Closed Islands
  // ---------------------------------------------------------------------------
  {
    id: 1254,
    description:
      'Given a 2D grid where 0 represents land and 1 represents water, a closed island is a group of 0s completely surrounded by 1s. Return the number of closed islands.',
    examples:
      'Input: grid = [[1,1,1,1,1,1,1,0],[1,0,0,0,0,1,1,0],[1,0,1,0,1,1,1,0],[1,0,0,0,0,1,0,1],[1,1,1,1,1,1,1,0]]\nOutput: 2',
    intuition:
      'A closed island cannot touch the grid boundary. First, flood-fill all land connected to the boundary to eliminate it. Then every remaining land region is completely enclosed by water, making it a closed island.',
    approach:
      'First, flood-fill (DFS) all land connected to the boundary to mark it as water. Then count the remaining islands of 0s using DFS. Each remaining island is a closed island.',
    code: `class Solution:
    def closedIsland(self, grid: list[list[int]]) -> int:
        m, n = len(grid), len(grid[0])
        def dfs(r, c):
            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] == 1:
                return
            grid[r][c] = 1
            dfs(r+1,c)
            dfs(r-1,c)
            dfs(r,c+1)
            dfs(r,c-1)
        for r in range(m):
            for c in range(n):
                if (r == 0 or r == m-1 or c == 0 or c == n-1) and grid[r][c] == 0:
                    dfs(r, c)
        count = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] == 0:
                    dfs(r, c)
                    count += 1
        return count`,
    jsCode: `var closedIsland = function(grid) {
    const m = grid.length, n = grid[0].length;
    const dfs = (r, c) => {
        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] === 1) return;
        grid[r][c] = 1;
        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);
    };
    for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
            if ((r === 0 || r === m-1 || c === 0 || c === n-1) && grid[r][c] === 0) dfs(r, c);
        }
    }
    let count = 0;
    for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
            if (grid[r][c] === 0) { dfs(r, c); count++; }
        }
    }
    return count;
};`,
    explanation:
      '1. First pass: DFS from all boundary 0-cells to mark them as 1 (not closed).\n' +
      '2. Second pass: for each remaining 0-cell, DFS to mark the entire island.\n' +
      '3. Each DFS in the second pass represents one closed island.\n' +
      '4. Increment the count for each closed island found.\n' +
      '5. Return the total count.',
    timeComplexity: 'O(m * n)',
    spaceComplexity: 'O(m * n) for recursion',
    hints: [
      'Eliminate all land connected to the boundary first.',
      'Then count remaining connected components of land.',
      'Each remaining component is a closed island.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1255. Maximum Score Words Formed by Letters
  // ---------------------------------------------------------------------------
  {
    id: 1255,
    description:
      'Given a list of words, an array of letters you can use, and a score for each letter a-z, return the maximum score of any valid set of words you can form. Each letter can only be used once.',
    examples:
      'Input: words = ["dog","cat","dad","good"], letters = ["a","a","c","d","d","d","g","o","o"], score = [1,0,9,5,0,0,3,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0]\nOutput: 23\nExplanation: "dad" (5+1+5=11) + "good" (3+2+2+5=12) = 23.',
    intuition:
      'With few words (up to 14), trying all subsets is feasible. For each subset, check if the available letters suffice and compute the total score. Backtracking with pruning avoids checking obviously invalid combinations.',
    approach:
      'Use backtracking/subset enumeration. Try all subsets of words, checking if the available letters are sufficient. Track the maximum score among valid subsets.',
    code: `class Solution:
    def maxScoreWords(self, words: list[str], letters: list[str], score: list[int]) -> int:
        from collections import Counter
        avail = Counter(letters)
        self.ans = 0
        def bt(i, remaining, cur_score):
            self.ans = max(self.ans, cur_score)
            for j in range(i, len(words)):
                word_count = Counter(words[j])
                valid = all(remaining[c] >= word_count[c] for c in word_count)
                if valid:
                    word_score = sum(score[ord(c) - ord('a')] for c in words[j])
                    for c in word_count:
                        remaining[c] -= word_count[c]
                    bt(j + 1, remaining, cur_score + word_score)
                    for c in word_count:
                        remaining[c] += word_count[c]
        bt(0, avail, 0)
        return self.ans`,
    jsCode: `var maxScoreWords = function(words, letters, score) {
    const avail = {};
    for (const c of letters) avail[c] = (avail[c] || 0) + 1;
    let ans = 0;
    const bt = (i, remaining, curScore) => {
        ans = Math.max(ans, curScore);
        for (let j = i; j < words.length; j++) {
            const wordCount = {};
            for (const c of words[j]) wordCount[c] = (wordCount[c] || 0) + 1;
            let valid = true;
            for (const c in wordCount) {
                if ((remaining[c] || 0) < wordCount[c]) { valid = false; break; }
            }
            if (valid) {
                let wordScore = 0;
                for (const c of words[j]) wordScore += score[c.charCodeAt(0) - 97];
                for (const c in wordCount) remaining[c] -= wordCount[c];
                bt(j + 1, remaining, curScore + wordScore);
                for (const c in wordCount) remaining[c] += wordCount[c];
            }
        }
    };
    bt(0, {...avail}, 0);
    return ans;
};`,
    explanation:
      '1. Count available letters.\n' +
      '2. Backtrack through subsets of words.\n' +
      '3. For each word, check if enough letters remain.\n' +
      '4. If valid, deduct letters, add score, and recurse.\n' +
      '5. Restore letters on backtrack. Track maximum score.',
    timeComplexity: 'O(2^n * k) where k is average word length',
    spaceComplexity: 'O(n)',
    hints: [
      'Try all subsets of words using backtracking.',
      'Check letter availability for each candidate word.',
      'Track the maximum score among valid subsets.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1268. Search Suggestions System
  // ---------------------------------------------------------------------------
  {
    id: 1268,
    description:
      'You are given an array of products and a searchWord. After each character of searchWord is typed, suggest at most 3 products from the array that have the typed string as a prefix. Return the list of suggestions after each character typed.',
    examples:
      'Input: products = ["mobile","mouse","moneypot","monitor","mousepad"], searchWord = "mouse"\nOutput: [["mobile","moneypot","monitor"],["mobile","moneypot","monitor"],["mouse","mousepad"],["mouse","mousepad"],["mouse","mousepad"]]',
    intuition:
      'Sorting products alphabetically means products with the same prefix are adjacent. For each prefix typed, binary search finds the insertion point, and the next 3 products at that point are your suggestions (if they match the prefix).',
    approach:
      'Sort the products lexicographically. For each prefix, use binary search to find the insertion point and return up to 3 products starting from that point that match the prefix.',
    code: `class Solution:
    def suggestedProducts(self, products: list[str], searchWord: str) -> list[list[str]]:
        import bisect
        products.sort()
        result = []
        prefix = ""
        for c in searchWord:
            prefix += c
            idx = bisect.bisect_left(products, prefix)
            suggestions = []
            for i in range(idx, min(idx + 3, len(products))):
                if products[i].startswith(prefix):
                    suggestions.append(products[i])
                else:
                    break
            result.append(suggestions)
        return result`,
    jsCode: `var suggestedProducts = function(products, searchWord) {
    products.sort();
    const result = [];
    let prefix = "";
    for (const c of searchWord) {
        prefix += c;
        // Binary search for insertion point
        let lo = 0, hi = products.length;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (products[mid] < prefix) lo = mid + 1; else hi = mid; }
        const suggestions = [];
        for (let i = lo; i < Math.min(lo + 3, products.length); i++) {
            if (products[i].startsWith(prefix)) suggestions.push(products[i]);
            else break;
        }
        result.push(suggestions);
    }
    return result;
};`,
    explanation:
      '1. Sort products lexicographically.\n' +
      '2. For each character typed, build the current prefix.\n' +
      '3. Binary search for the insertion point of the prefix.\n' +
      '4. Check the next 3 products from that point for prefix match.\n' +
      '5. Append matching products to the suggestions for this prefix.',
    timeComplexity: 'O(n log n + m * log n) where m is searchWord length',
    spaceComplexity: 'O(n)',
    hints: [
      'Sort the products first for lexicographic ordering.',
      'Use binary search to find where the current prefix would be inserted.',
      'Check the next few products after the insertion point for matches.',
    ],
  },
];

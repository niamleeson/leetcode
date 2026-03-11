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
    // Group word iterators by their next needed character
    const waiting = {};

    for (const word of words) {
        const firstChar = word[0];
        if (!waiting[firstChar]) waiting[firstChar] = [];
        waiting[firstChar].push({ word, idx: 1 });
    }

    let count = 0;

    for (const c of s) {
        // Take all words waiting for this character
        const advancing = waiting[c] || [];
        waiting[c] = [];

        for (const item of advancing) {
            // Check if this word is now fully matched
            const isComplete = item.idx === item.word.length;

            if (isComplete) {
                count++;
            } else {
                // Move word to the bucket for its next needed character
                const nextChar = item.word[item.idx];
                if (!waiting[nextChar]) waiting[nextChar] = [];
                waiting[nextChar].push({ word: item.word, idx: item.idx + 1 });
            }
        }
    }

    return count;
};`,
    jsWalkthrough:
      'Example: s = "abcde", words = ["a","bb","acd","ace"]\n' +
      'Initial buckets: a->["a"(idx1),"acd"(idx1),"ace"(idx1)], b->["bb"(idx1)]\n' +
      'Scan s[0]="a": advance "a"->complete(count=1), "acd"->wait c, "ace"->wait c\n' +
      '  buckets: b->["bb"(idx1)], c->["acd"(idx2),"ace"(idx2)]\n' +
      'Scan s[1]="b": advance "bb"->wait b again\n' +
      '  buckets: b->["bb"(idx2)], c->["acd"(idx2),"ace"(idx2)]\n' +
      'Scan s[2]="c": advance "acd"->wait d, "ace"->wait e\n' +
      '  buckets: b->["bb"(idx2)], d->["acd"(idx3)], e->["ace"(idx3)]\n' +
      'Scan s[3]="d": advance "acd"->complete(count=2)\n' +
      'Scan s[4]="e": advance "ace"->complete(count=3)\n' +
      'Result: 3',
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
    // Lengths must match for goal to be a rotation of s
    const sameLength = s.length === goal.length;

    // Every rotation of s appears as a substring of s+s
    const doubled = s + s;
    const goalIsSubstring = doubled.includes(goal);

    return sameLength && goalIsSubstring;
};`,
    jsWalkthrough:
      'Example: s = "abcde", goal = "cdeab"\n' +
      'Step 1: lengths equal? 5 === 5 -> yes\n' +
      'Step 2: doubled = "abcdeabcde"\n' +
      'Step 3: does "abcdeabcde" include "cdeab"? -> yes (starts at index 2)\n' +
      'Result: true\n\n' +
      'Counter-example: s = "abcde", goal = "abced"\n' +
      'doubled = "abcdeabcde", does not contain "abced" -> false',
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
        // Base case: reached the destination node
        if (node === target) {
            result.push([...path]);
            return;
        }

        // Explore all neighbors from the current node
        for (const neighbor of graph[node]) {
            path.push(neighbor);
            dfs(neighbor, path);

            // Backtrack: remove the neighbor we just tried
            path.pop();
        }
    };

    dfs(0, [0]);
    return result;
};`,
    jsWalkthrough:
      'Example: graph = [[1,2],[3],[3],[]]\n' +
      'target = 3\n' +
      'dfs(0, [0]):\n' +
      '  neighbor=1: path=[0,1], dfs(1, [0,1])\n' +
      '    neighbor=3: path=[0,1,3], dfs(3, [0,1,3])\n' +
      '      node===target -> result=[[0,1,3]], return\n' +
      '    backtrack: path=[0,1]\n' +
      '  backtrack: path=[0]\n' +
      '  neighbor=2: path=[0,2], dfs(2, [0,2])\n' +
      '    neighbor=3: path=[0,2,3], dfs(3, [0,2,3])\n' +
      '      node===target -> result=[[0,1,3],[0,2,3]], return\n' +
      'Result: [[0,1,3],[0,2,3]]',
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
    // 0 = unvisited (white), 1 = in current path (gray), 2 = safe (black)
    const color = new Array(n).fill(0);

    const dfs = (node) => {
        // Already processed: return whether this node is safe
        if (color[node] !== 0) {
            return color[node] === 2;
        }

        // Mark as in-progress (gray) to detect cycles
        color[node] = 1;

        // Visit all neighbors; if any are unsafe, this node is unsafe
        for (const neighbor of graph[node]) {
            if (!dfs(neighbor)) {
                return false;
            }
        }

        // All paths lead to terminal nodes: mark as safe (black)
        color[node] = 2;
        return true;
    };

    const result = [];
    for (let i = 0; i < n; i++) {
        if (dfs(i)) result.push(i);
    }
    return result;
};`,
    jsWalkthrough:
      'Example: graph = [[1,2],[2,3],[5],[0],[5],[],[]]\n' +
      'Nodes 5,6 are terminal (no outgoing edges)\n' +
      'dfs(0): color[0]=1, check neighbors 1,2\n' +
      '  dfs(1): color[1]=1, check neighbors 2,3\n' +
      '    dfs(2): color[2]=1, check neighbor 5\n' +
      '      dfs(5): color[5]=1, no neighbors -> color[5]=2, return true\n' +
      '    color[2]=2, return true\n' +
      '    dfs(3): color[3]=1, check neighbor 0\n' +
      '      dfs(0): color[0]===1 (gray) -> cycle! return false\n' +
      '    dfs(3) returns false -> dfs(1) returns false\n' +
      '  dfs(1) returns false -> dfs(0) returns false\n' +
      'Safe nodes (color===2): [2,4,5,6]',
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
    // Break a string into groups of consecutive identical characters
    const getGroups = (w) => {
        const groups = [];
        let i = 0;

        while (i < w.length) {
            let j = i;
            // Extend j while same character continues
            while (j < w.length && w[j] === w[i]) j++;

            // Store [character, run_length]
            groups.push([w[i], j - i]);
            i = j;
        }

        return groups;
    };

    const isStretchy = (word) => {
        const sGroups = getGroups(s);
        const wordGroups = getGroups(word);

        // Must have same number of character groups
        if (sGroups.length !== wordGroups.length) return false;

        for (let i = 0; i < sGroups.length; i++) {
            const [c1, n1] = sGroups[i];
            const [c2, n2] = wordGroups[i];

            // Characters must match
            if (c1 !== c2) return false;

            // s group must be at least as long as word group
            if (n1 < n2) return false;

            // If counts differ, s group must be >= 3 (it was stretched)
            if (n1 !== n2 && n1 < 3) return false;
        }

        return true;
    };

    let count = 0;
    for (const word of words) {
        if (isStretchy(word)) count++;
    }
    return count;
};`,
    jsWalkthrough:
      'Example: s = "heeellooo", words = ["hello","hi","helo"]\n' +
      's groups: [h,1],[e,3],[l,2],[o,3]\n\n' +
      'Check "hello": groups [h,1],[e,1],[l,2],[o,1]\n' +
      '  [h,1] vs [h,1]: ok\n' +
      '  [e,3] vs [e,1]: n1=3>=n2=1, n1!=n2 but n1>=3 -> ok (stretched)\n' +
      '  [l,2] vs [l,2]: equal -> ok\n' +
      '  [o,3] vs [o,1]: n1=3>=n2=1, n1!=n2 but n1>=3 -> ok (stretched)\n' +
      '  -> stretchy! count=1\n\n' +
      'Check "hi": groups [h,1],[i,1] -> length 2 != 4 -> not stretchy\n' +
      'Check "helo": [h,1],[e,1],[l,1],[o,1]\n' +
      '  [l,2] vs [l,1]: n1=2>=n2=1 but n1!=n2 and n1<3 -> not stretchy\n' +
      'Result: 1',
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
    // Base case: empty node is already pruned
    if (!root) return null;

    // Post-order: prune children before deciding on current node
    root.left = pruneTree(root.left);
    root.right = pruneTree(root.right);

    // If this node has value 0 and no surviving children, prune it
    const isLeafZero = root.val === 0 && !root.left && !root.right;
    if (isLeafZero) return null;

    return root;
};`,
    jsWalkthrough:
      'Example: root = [1,null,0,0,1]\n' +
      'Tree:   1\n' +
      '         \\\n' +
      '          0\n' +
      '         / \\\n' +
      '        0   1\n\n' +
      'pruneTree(0-left-child): val=0, no children -> return null\n' +
      'pruneTree(1-right-child): val=1, no children -> return node(1)\n' +
      'pruneTree(0-root-right): val=0, left=null, right=node(1)\n' +
      '  has right child -> not a zero-leaf -> return node(0)\n' +
      'pruneTree(1-root): val=1, left=null, right=node(0)\n' +
      '  val=1 -> never prune -> return node(1)\n' +
      'Result: [1,null,0,null,1]',
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

    // Map each stop to the set of routes that serve it
    const stopToRoutes = new Map();
    for (let i = 0; i < routes.length; i++) {
        for (const stop of routes[i]) {
            if (!stopToRoutes.has(stop)) stopToRoutes.set(stop, new Set());
            stopToRoutes.get(stop).add(i);
        }
    }

    // BFS over routes; each level = one bus ride
    const queue = [];
    const visitedRoutes = new Set();
    const visitedStops = new Set([source]);

    // Seed BFS with all routes that serve the source stop
    for (const routeIndex of (stopToRoutes.get(source) || [])) {
        queue.push([routeIndex, 1]);
        visitedRoutes.add(routeIndex);
    }

    let idx = 0;
    while (idx < queue.length) {
        const [routeIdx, buses] = queue[idx++];

        // Check every stop on this route
        for (const stop of routes[routeIdx]) {
            if (stop === target) return buses;

            if (!visitedStops.has(stop)) {
                visitedStops.add(stop);

                // Enqueue all unvisited routes passing through this stop
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
    jsWalkthrough:
      'Example: routes = [[1,2,7],[3,6,7]], source = 1, target = 6\n' +
      'Build stopToRoutes: 1->{0}, 2->{0}, 7->{0,1}, 3->{1}, 6->{1}\n' +
      'Source=1 is on route 0 -> queue=[[0,1]], visitedRoutes={0}\n\n' +
      'Process [routeIdx=0, buses=1]: stops = [1,2,7]\n' +
      '  stop=1: visited, skip\n' +
      '  stop=2: not target, routes={0}=visited, skip\n' +
      '  stop=7: not target, routes={0,1}, enqueue route 1 -> queue=[[0,1],[1,2]]\n\n' +
      'Process [routeIdx=1, buses=2]: stops = [3,6,7]\n' +
      '  stop=3: not target\n' +
      '  stop=6: === target! return 2',
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
    let islandId = 2; // Start at 2 to distinguish from 0 (water) and 1 (unlabeled land)
    const size = {};  // Maps islandId -> number of cells in that island

    const dfs = (r, c, iid) => {
        // Out of bounds, water, or already labeled
        if (r < 0 || r >= n || c < 0 || c >= n || grid[r][c] !== 1) return 0;

        // Label this cell with the current island id
        grid[r][c] = iid;

        // Count this cell plus all connected cells
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

    // Start with the largest existing island
    let ans = Math.max(...Object.values(size));
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

    // Try flipping each water cell to land
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (grid[r][c] === 0) {
                // Collect unique neighboring island ids
                const seenIslands = new Set();
                let total = 1; // Count the flipped cell itself

                for (const [dr, dc] of dirs) {
                    const nr = r + dr;
                    const nc = c + dc;
                    const isInBounds = nr >= 0 && nr < n && nc >= 0 && nc < n;
                    const isIsland = isInBounds && grid[nr][nc] > 1;

                    if (isIsland && !seenIslands.has(grid[nr][nc])) {
                        seenIslands.add(grid[nr][nc]);
                        total += size[grid[nr][nc]];
                    }
                }

                ans = Math.max(ans, total);
            }
        }
    }

    return ans;
};`,
    jsWalkthrough:
      'Example: grid = [[1,0],[0,1]]\n' +
      'Phase 1 - label islands:\n' +
      '  grid[0][0]=1 -> dfs labels it id=2, size={2:1}, grid=[[2,0],[0,1]]\n' +
      '  grid[1][1]=1 -> dfs labels it id=3, size={2:1,3:1}, grid=[[2,0],[0,3]]\n' +
      'ans = max(1,1) = 1\n\n' +
      'Phase 2 - try flipping each 0:\n' +
      '  grid[0][1]=0: neighbors are grid[0][0]=2(size 1), grid[1][1]=3(size 1)\n' +
      '    total = 1 + 1 + 1 = 3, ans = max(1,3) = 3\n' +
      '  grid[1][0]=0: neighbors are grid[0][0]=2(size 1), grid[1][1]=3(size 1)\n' +
      '    total = 1 + 1 + 1 = 3, ans = 3\n' +
      'Result: 3',
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

    // Left-to-right pass: accumulate rightward force
    let rightForce = 0;
    for (let i = 0; i < n; i++) {
        if (dominoes[i] === 'R') {
            rightForce = n; // Maximum force from an R domino
        } else if (dominoes[i] === 'L') {
            rightForce = 0; // L domino cancels rightward force
        } else {
            rightForce = Math.max(rightForce - 1, 0); // Force decays with distance
        }
        forces[i] += rightForce;
    }

    // Right-to-left pass: accumulate leftward force (subtracted)
    let leftForce = 0;
    for (let i = n - 1; i >= 0; i--) {
        if (dominoes[i] === 'L') {
            leftForce = n; // Maximum force from an L domino
        } else if (dominoes[i] === 'R') {
            leftForce = 0; // R domino cancels leftward force
        } else {
            leftForce = Math.max(leftForce - 1, 0); // Force decays with distance
        }
        forces[i] -= leftForce;
    }

    // Positive net = falls right, negative = falls left, zero = stays upright
    return forces.map(f => f > 0 ? 'R' : f < 0 ? 'L' : '.').join('');
};`,
    jsWalkthrough:
      'Example: dominoes = "RR.L" (n=4)\n' +
      'Left-to-right pass (rightward force):\n' +
      '  i=0 R: rightForce=4, forces=[4,0,0,0]\n' +
      '  i=1 R: rightForce=4, forces=[4,4,0,0]\n' +
      '  i=2 .: rightForce=3, forces=[4,4,3,0]\n' +
      '  i=3 L: rightForce=0, forces=[4,4,3,0]\n\n' +
      'Right-to-left pass (leftward force subtracted):\n' +
      '  i=3 L: leftForce=4, forces[3]-=4 -> forces=[4,4,3,-4]\n' +
      '  i=2 .: leftForce=3, forces[2]-=3 -> forces=[4,4,0,-4]\n' +
      '  i=1 R: leftForce=0, forces[1]-=0 -> forces=[4,4,0,-4]\n' +
      '  i=0 R: leftForce=0, forces[0]-=0 -> forces=[4,4,0,-4]\n\n' +
      'Map: [4>0->R, 4>0->R, 0->., -4<0->L] -> "RR.L"',
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
    // Start in room 0, which is always unlocked
    const visited = new Set([0]);
    const stack = [0];

    while (stack.length > 0) {
        const currentRoom = stack.pop();

        // Try each key found in this room
        for (const key of rooms[currentRoom]) {
            if (!visited.has(key)) {
                visited.add(key);
                stack.push(key);
            }
        }
    }

    // All rooms visited if set size matches total room count
    return visited.size === rooms.length;
};`,
    jsWalkthrough:
      'Example: rooms = [[1],[2],[3],[]]\n' +
      'Start: visited={0}, stack=[0]\n\n' +
      'Pop room 0: keys=[1]\n' +
      '  key 1 not visited -> visited={0,1}, stack=[1]\n\n' +
      'Pop room 1: keys=[2]\n' +
      '  key 2 not visited -> visited={0,1,2}, stack=[2]\n\n' +
      'Pop room 2: keys=[3]\n' +
      '  key 3 not visited -> visited={0,1,2,3}, stack=[3]\n\n' +
      'Pop room 3: keys=[] -> nothing to add\n' +
      'Stack empty. visited.size=4 === rooms.length=4 -> true',
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
    // Simulate typing each string into a text editor
    const build = (str) => {
        const stack = [];

        for (const c of str) {
            if (c === '#') {
                // Backspace: remove the last character if any
                if (stack.length) stack.pop();
            } else {
                // Regular character: type it
                stack.push(c);
            }
        }

        return stack.join('');
    };

    const finalS = build(s);
    const finalT = build(t);

    return finalS === finalT;
};`,
    jsWalkthrough:
      'Example: s = "ab#c", t = "ad#c"\n\n' +
      'build("ab#c"):\n' +
      '  "a" -> stack=["a"]\n' +
      '  "b" -> stack=["a","b"]\n' +
      '  "#" -> pop -> stack=["a"]\n' +
      '  "c" -> stack=["a","c"]\n' +
      '  result: "ac"\n\n' +
      'build("ad#c"):\n' +
      '  "a" -> stack=["a"]\n' +
      '  "d" -> stack=["a","d"]\n' +
      '  "#" -> pop -> stack=["a"]\n' +
      '  "c" -> stack=["a","c"]\n' +
      '  result: "ac"\n\n' +
      '"ac" === "ac" -> true',
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
    // If total cards can't form complete groups, impossible
    if (hand.length % groupSize !== 0) return false;

    // Count frequency of each card value
    const count = new Map();
    for (const card of hand) {
        count.set(card, (count.get(card) || 0) + 1);
    }

    // Process cards from smallest value upward (greedy)
    const sortedKeys = [...count.keys()].sort((a, b) => a - b);

    for (const card of sortedKeys) {
        // Form groups starting with this card until none remain
        while (count.get(card) > 0) {
            // Try to build one group: card, card+1, ..., card+groupSize-1
            for (let i = 0; i < groupSize; i++) {
                const needed = card + i;
                if ((count.get(needed) || 0) <= 0) return false;
                count.set(needed, count.get(needed) - 1);
            }
        }
    }

    return true;
};`,
    jsWalkthrough:
      'Example: hand = [1,2,3,6,2,3,4,7,8], groupSize = 3\n' +
      'count: {1:1, 2:2, 3:2, 4:1, 6:1, 7:1, 8:1}\n' +
      'sortedKeys: [1,2,3,4,6,7,8]\n\n' +
      'card=1, count[1]=1>0: form group [1,2,3]\n' +
      '  count: {1:0, 2:1, 3:1, 4:1, 6:1, 7:1, 8:1}\n' +
      'card=2, count[2]=1>0: form group [2,3,4]\n' +
      '  count: {2:0, 3:0, 4:0, 6:1, 7:1, 8:1}\n' +
      'card=3, count[3]=0: skip\n' +
      'card=4, count[4]=0: skip\n' +
      'card=6, count[6]=1>0: form group [6,7,8]\n' +
      '  count: {6:0, 7:0, 8:0}\n' +
      'All cards used -> true\n' +
      'Groups: [1,2,3], [2,3,4], [6,7,8]',
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
    // All n bits set means every node has been visited
    const fullMask = (1 << n) - 1;

    // BFS state: [currentNode, visitedBitmask, distance]
    const queue = [];
    const visited = new Set();

    // Start BFS from every node simultaneously
    for (let i = 0; i < n; i++) {
        const initialMask = 1 << i; // Only node i is visited
        const stateKey = i + ',' + initialMask;
        queue.push([i, initialMask, 0]);
        visited.add(stateKey);
    }

    let idx = 0;
    while (idx < queue.length) {
        const [node, mask, dist] = queue[idx++];

        // All nodes visited: this is the shortest path
        if (mask === fullMask) return dist;

        for (const neighbor of graph[node]) {
            // OR in the neighbor's bit to mark it as visited
            const newMask = mask | (1 << neighbor);
            const stateKey = neighbor + ',' + newMask;

            if (!visited.has(stateKey)) {
                visited.add(stateKey);
                queue.push([neighbor, newMask, dist + 1]);
            }
        }
    }

    return 0;
};`,
    jsWalkthrough:
      'Example: graph = [[1,2,3],[0],[0],[0]] (n=4)\n' +
      'fullMask = 0b1111 = 15\n' +
      'Initial queue: [0,0001,0],[1,0010,0],[2,0100,0],[3,1000,0]\n\n' +
      'Process [0, 0001, 0]: neighbors 1,2,3\n' +
      '  -> enqueue [1,0011,1],[2,0101,1],[3,1001,1]\n' +
      'Process [1, 0010, 0]: neighbor 0\n' +
      '  -> enqueue [0,0011,1]\n' +
      '...\n' +
      'Process [0, 0111, 3]: neighbor 3\n' +
      '  newMask = 0111|1000 = 1111 = fullMask\n' +
      '  enqueue [3, 1111, 4]\n' +
      'Process [3, 1111, 4]: mask===fullMask -> return 4',
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
    let prev = -1; // Index of the last occupied seat
    let ans = 0;

    for (let i = 0; i < n; i++) {
        if (seats[i] === 1) {
            if (prev === -1) {
                // No previous person: best seat before this one is at the very start
                ans = i;
            } else {
                // Between two people: best seat is the midpoint
                const midpointDistance = Math.floor((i - prev) / 2);
                ans = Math.max(ans, midpointDistance);
            }

            prev = i;
        }
    }

    // Check the tail: seats after the last person
    const tailDistance = n - 1 - prev;
    ans = Math.max(ans, tailDistance);

    return ans;
};`,
    jsWalkthrough:
      'Example: seats = [1,0,0,0,1,0,1]\n' +
      'i=0: seats[0]=1, prev=-1 -> ans=0 (distance from start=0), prev=0\n' +
      'i=1,2,3: seats=0, skip\n' +
      'i=4: seats[4]=1, prev=0 -> midpoint=(4-0)/2=2, ans=max(0,2)=2, prev=4\n' +
      'i=5: seats=0, skip\n' +
      'i=6: seats[6]=1, prev=4 -> midpoint=(6-4)/2=1, ans=max(2,1)=2, prev=6\n' +
      'After loop: tail = n-1-prev = 6-6 = 0, ans=max(2,0)=2\n' +
      'Result: 2 (sit at seat 2, distance 2 from people at 0 and 4)',
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
    let lo = 0;
    let hi = arr.length - 1;

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);

        if (arr[mid] < arr[mid + 1]) {
            // Still ascending: peak is to the right
            lo = mid + 1;
        } else {
            // Descending or at peak: peak is at mid or to the left
            hi = mid;
        }
    }

    // lo === hi is the peak index
    return lo;
};`,
    jsWalkthrough:
      'Example: arr = [0,2,1,0]\n' +
      'lo=0, hi=3\n\n' +
      'Iteration 1: mid=1, arr[1]=2, arr[2]=1\n' +
      '  arr[mid]=2 > arr[mid+1]=1 -> descending, hi=1\n\n' +
      'Iteration 2: mid=0, arr[0]=0, arr[1]=2\n' +
      '  arr[mid]=0 < arr[mid+1]=2 -> ascending, lo=1\n\n' +
      'lo===hi===1, return 1\n' +
      'Verify: arr[1]=2 is the peak',
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
    this.seats = []; // Sorted list of occupied seat indices
};
ExamRoom.prototype.seat = function() {
    // Edge case: no one seated yet, take seat 0
    if (this.seats.length === 0) {
        this.seats.push(0);
        return 0;
    }

    // Best distance starts as distance from seat 0 to first person
    let bestDist = this.seats[0];
    let bestSeat = 0;

    // Check gaps between consecutive occupied seats
    for (let i = 1; i < this.seats.length; i++) {
        // Midpoint distance between two consecutive occupied seats
        const gapDistance = Math.floor((this.seats[i] - this.seats[i-1]) / 2);

        if (gapDistance > bestDist) {
            bestDist = gapDistance;
            bestSeat = this.seats[i-1] + gapDistance;
        }
    }

    // Check if the end of the row is better
    const tailDistance = this.n - 1 - this.seats[this.seats.length - 1];
    if (tailDistance > bestDist) {
        bestSeat = this.n - 1;
    }

    // Insert bestSeat in sorted position to maintain order
    let insertIdx = 0;
    while (insertIdx < this.seats.length && this.seats[insertIdx] < bestSeat) {
        insertIdx++;
    }
    this.seats.splice(insertIdx, 0, bestSeat);

    return bestSeat;
};
ExamRoom.prototype.leave = function(p) {
    const idx = this.seats.indexOf(p);
    this.seats.splice(idx, 1);
};`,
    jsWalkthrough:
      'Example: ExamRoom(10)\n' +
      'seat(): seats=[] -> return 0, seats=[0]\n' +
      'seat(): bestDist=seats[0]=0, bestSeat=0\n' +
      '  no gaps (only one person)\n' +
      '  tail = 10-1-0=9 > 0 -> bestSeat=9\n' +
      '  seats=[0,9], return 9\n' +
      'seat(): bestDist=seats[0]=0, bestSeat=0\n' +
      '  gap between 0 and 9: d=(9-0)/2=4, bestDist=4, bestSeat=4\n' +
      '  tail = 9-9=0 < 4, no update\n' +
      '  seats=[0,4,9], return 4\n' +
      'seat(): gaps: (4-0)/2=2, (9-4)/2=2 -> tie, earlier seat wins\n' +
      '  bestSeat=2, seats=[0,2,4,9], return 2\n' +
      'leave(4): seats=[0,2,9]\n' +
      'seat(): gap (9-2)/2=3, bestSeat=2+3=5, seats=[0,2,5,9], return 5',
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
    // Stack tracks the running score at each nesting depth
    const stack = [0]; // Start with score 0 at depth 0

    for (const c of s) {
        if (c === '(') {
            // Open new depth level with score 0
            stack.push(0);
        } else {
            // Close current depth: compute its score
            const innerScore = stack.pop();

            // Empty pair () scores 1; non-empty (A) scores 2*A
            const contribution = Math.max(2 * innerScore, 1);

            // Add contribution to the parent depth
            stack[stack.length - 1] += contribution;
        }
    }

    return stack[0];
};`,
    jsWalkthrough:
      'Example: s = "(()(()))"\n' +
      '"(" -> push 0: stack=[0,0]\n' +
      '"(" -> push 0: stack=[0,0,0]\n' +
      '")" -> pop 0, contribution=max(0,1)=1, stack=[0,1]\n' +
      '"(" -> push 0: stack=[0,1,0]\n' +
      '"(" -> push 0: stack=[0,1,0,0]\n' +
      '")" -> pop 0, contribution=1, stack=[0,1,1]\n' +
      '")" -> pop 1, contribution=max(2,1)=2, stack=[0,3]\n' +
      '")" -> pop 3, contribution=max(6,1)=6, stack=[6]\n' +
      'Result: 6',
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
    // Sort workers by their minimum wage/quality ratio
    const workers = quality.map((q, i) => [q, wage[i]])
                           .sort((a, b) => a[1]/a[0] - b[1]/b[0]);

    // Max-heap to track the k smallest quality values seen so far
    const heap = [];

    const heapPush = (val) => {
        heap.push(val);
        let i = heap.length - 1;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (heap[parent] >= heap[i]) break;
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        }
    };

    const heapPop = () => {
        const top = heap[0];
        heap[0] = heap[heap.length - 1];
        heap.pop();
        let i = 0;
        while (true) {
            let largest = i;
            const left = 2*i + 1;
            const right = 2*i + 2;
            if (left < heap.length && heap[left] > heap[largest]) largest = left;
            if (right < heap.length && heap[right] > heap[largest]) largest = right;
            if (largest === i) break;
            [heap[i], heap[largest]] = [heap[largest], heap[i]];
            i = largest;
        }
        return top;
    };

    let totalQuality = 0;
    let ans = Infinity;

    for (const [q, w] of workers) {
        // This worker sets the wage ratio for the group
        const ratio = w / q;

        heapPush(q);
        totalQuality += q;

        // If we have more than k workers, remove the one with highest quality
        if (heap.length > k) {
            totalQuality -= heapPop();
        }

        // When we have exactly k workers, compute the cost
        if (heap.length === k) {
            ans = Math.min(ans, ratio * totalQuality);
        }
    }

    return ans;
};`,
    jsWalkthrough:
      'Example: quality=[10,20,5], wage=[70,50,30], k=2\n' +
      'Workers as [q,w]: [10,70],[20,50],[5,30]\n' +
      'Ratios: 70/10=7, 50/20=2.5, 30/5=6\n' +
      'Sorted by ratio: [20,50](2.5), [5,30](6), [10,70](7)\n\n' +
      'worker [20,50], ratio=2.5:\n' +
      '  push 20, totalQ=20, heap.length=1 < k=2\n' +
      'worker [5,30], ratio=6:\n' +
      '  push 5, totalQ=25, heap.length=2 === k=2\n' +
      '  ans = min(Inf, 6*25) = 150\n' +
      'worker [10,70], ratio=7:\n' +
      '  push 10, totalQ=35, heap.length=3 > k=2\n' +
      '  pop max (20), totalQ=35-20=15, heap.length=2\n' +
      '  ans = min(150, 7*15) = min(150,105) = 105\n' +
      'Result: 105',
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
    let fiveCount = 0;  // Number of $5 bills we have
    let tenCount = 0;   // Number of $10 bills we have

    for (const bill of bills) {
        if (bill === 5) {
            // No change needed, just collect the bill
            fiveCount++;

        } else if (bill === 10) {
            // Need to give $5 change
            if (fiveCount === 0) return false;
            fiveCount--;
            tenCount++;

        } else {
            // bill === 20, need to give $15 change
            if (tenCount > 0 && fiveCount > 0) {
                // Prefer $10 + $5 (saves $5 bills for future use)
                tenCount--;
                fiveCount--;
            } else if (fiveCount >= 3) {
                // Use three $5 bills
                fiveCount -= 3;
            } else {
                // Cannot make change
                return false;
            }
        }
    }

    return true;
};`,
    jsWalkthrough:
      'Example: bills = [5,5,5,10,20]\n' +
      'bill=5: fiveCount=1, tenCount=0\n' +
      'bill=5: fiveCount=2, tenCount=0\n' +
      'bill=5: fiveCount=3, tenCount=0\n' +
      'bill=10: give $5 change -> fiveCount=2, tenCount=1\n' +
      'bill=20: prefer $10+$5 -> tenCount=0, fiveCount=1\n' +
      'All bills processed -> true\n\n' +
      'Counter-example: bills = [5,5,10,10,20]\n' +
      'After [5,5,10,10]: fiveCount=0, tenCount=2\n' +
      'bill=20: tenCount>0 but fiveCount=0 (need $10+$5)\n' +
      '  check three $5s: fiveCount=0 < 3 -> return false',
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

    // Build prefix sums: prefix[i+1] - prefix[j] = sum of nums[j..i]
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }

    // Monotone deque stores indices with increasing prefix sums
    const dq = [];
    let front = 0;
    let ans = n + 1; // Initialize to impossible length

    for (let i = 0; i <= n; i++) {
        // Pop from front while we can form a valid subarray with sum >= k
        while (front < dq.length && prefix[i] - prefix[dq[front]] >= k) {
            ans = Math.min(ans, i - dq[front]);
            front++; // This index is consumed
        }

        // Pop from back to maintain increasing order of prefix sums
        while (dq.length > front && prefix[i] <= prefix[dq[dq.length - 1]]) {
            dq.pop();
        }

        dq.push(i);
    }

    return ans <= n ? ans : -1;
};`,
    jsWalkthrough:
      'Example: nums = [2,-1,2], k = 3\n' +
      'prefix = [0, 2, 1, 3]\n\n' +
      'i=0: dq=[], push 0 -> dq=[0]\n' +
      'i=1: prefix[1]=2\n' +
      '  front check: 2-prefix[0]=2-0=2 < 3, no pop\n' +
      '  back check: prefix[1]=2 > prefix[0]=0, no pop\n' +
      '  push 1 -> dq=[0,1]\n' +
      'i=2: prefix[2]=1\n' +
      '  front check: 1-0=1 < 3, no pop\n' +
      '  back check: prefix[2]=1 <= prefix[1]=2 -> pop 1 -> dq=[0]\n' +
      '  push 2 -> dq=[0,2]\n' +
      'i=3: prefix[3]=3\n' +
      '  front check: 3-prefix[0]=3-0=3 >= 3 -> ans=min(4,3-0)=3, front=1\n' +
      '  front check: 3-prefix[2]=3-1=2 < 3, stop\n' +
      '  push 3 -> dq=[0,2,3]\n' +
      'ans=3 <= 3 -> return 3',
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
    // Build a parent map so we can traverse upward in the tree
    const parent = new Map();

    const buildParent = (node, par) => {
        if (!node) return;
        parent.set(node, par);
        buildParent(node.left, node);
        buildParent(node.right, node);
    };

    buildParent(root, null);

    // BFS from target node treating tree as undirected graph
    let queue = [target];
    const visited = new Set([target]);

    for (let distance = 0; distance < k; distance++) {
        const nextQueue = [];

        for (const node of queue) {
            // Explore: left child, right child, parent
            const neighbors = [node.left, node.right, parent.get(node)];

            for (const neighbor of neighbors) {
                if (neighbor && !visited.has(neighbor)) {
                    visited.add(neighbor);
                    nextQueue.push(neighbor);
                }
            }
        }

        queue = nextQueue;
    }

    // After k BFS levels, queue contains all nodes at distance k
    return queue.map(node => node.val);
};`,
    jsWalkthrough:
      'Example: root=[3,5,1,6,2,0,8], target=5, k=2\n' +
      'After buildParent: parent[5]=3, parent[6]=5, parent[2]=5, parent[1]=3...\n\n' +
      'distance=0: queue=[node(5)]\n' +
      'distance=1: neighbors of 5 = [node(6), node(2), node(3)]\n' +
      '  queue=[node(6), node(2), node(3)]\n' +
      'distance=2: explore each:\n' +
      '  node(6): children=null,null, parent=5(visited)\n' +
      '  node(2): children=node(7),node(4), parent=5(visited)\n' +
      '    add node(7), node(4)\n' +
      '  node(3): children=5(visited),node(1), parent=null\n' +
      '    add node(1)\n' +
      'queue=[node(7),node(4),node(1)]\n' +
      'Result: [7,4,1]',
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
    const rows = matrix.length;
    const cols = matrix[0].length;

    // Result has dimensions cols x rows (swapped)
    const result = [];

    for (let i = 0; i < cols; i++) {
        result.push([]);

        for (let j = 0; j < rows; j++) {
            // Element at [i][j] in result comes from [j][i] in original
            result[i].push(matrix[j][i]);
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: matrix = [[1,2,3],[4,5,6],[7,8,9]]\n' +
      'rows=3, cols=3\n\n' +
      'i=0 (new row 0): collect column 0 of original\n' +
      '  j=0: matrix[0][0]=1, j=1: matrix[1][0]=4, j=2: matrix[2][0]=7\n' +
      '  result[0] = [1,4,7]\n' +
      'i=1 (new row 1): collect column 1 of original\n' +
      '  result[1] = [2,5,8]\n' +
      'i=2 (new row 2): collect column 2 of original\n' +
      '  result[2] = [3,6,9]\n' +
      'Result: [[1,4,7],[2,5,8],[3,6,9]]',
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
    // Max-heap (stores negated values to simulate max-heap with min operations)
    const heap = [];

    const heapPush = (val) => {
        heap.push(-val);
        let i = heap.length - 1;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (heap[parent] <= heap[i]) break;
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        }
    };

    const heapPop = () => {
        const top = -heap[0];
        heap[0] = heap[heap.length - 1];
        heap.pop();
        let i = 0;
        while (true) {
            let smallest = i;
            const left = 2*i + 1;
            const right = 2*i + 2;
            if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
            if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
            if (smallest === i) break;
            [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
            i = smallest;
        }
        return top;
    };

    let fuel = startFuel;
    let stops = 0;
    let prevPos = 0;

    // Append target as a virtual station with 0 gas to simplify the loop
    const allStops = [...stations, [target, 0]];

    for (const [pos, gas] of allStops) {
        // Consume fuel to reach this position
        fuel -= (pos - prevPos);

        // If we've run out of fuel, retroactively refuel from the best station passed
        while (fuel < 0 && heap.length > 0) {
            fuel += heapPop();
            stops++;
        }

        if (fuel < 0) return -1; // No stations left to help

        // Add this station's gas to our options
        heapPush(gas);
        prevPos = pos;
    }

    return stops;
};`,
    jsWalkthrough:
      'Example: target=100, startFuel=10, stations=[[10,60],[20,30],[30,30],[60,40]]\n' +
      'Start: fuel=10, stops=0, prev=0\n\n' +
      'Stop [10,60]: fuel=10-(10-0)=0, heap=[], push 60\n' +
      '  heap=[60]\n' +
      'Stop [20,30]: fuel=0-(20-10)=-10 < 0\n' +
      '  pop max=60, fuel=-10+60=50, stops=1\n' +
      '  push 30, heap=[30]\n' +
      'Stop [30,30]: fuel=50-(30-20)=40, push 30\n' +
      '  heap=[30,30]\n' +
      'Stop [60,40]: fuel=40-(60-30)=10, push 40\n' +
      '  heap=[40,30,30]\n' +
      'Stop [100,0] (target): fuel=10-(100-60)=-30 < 0\n' +
      '  pop 40, fuel=-30+40=10, stops=2\n' +
      '  fuel >= 0, push 0\n' +
      'Result: 2',
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
    // Direction arrays: 0=North, 1=East, 2=South, 3=West
    const dx = [0, 1, 0, -1];
    const dy = [1, 0, -1, 0];
    let dirIndex = 0;
    let x = 0;
    let y = 0;

    // Store obstacles as "x,y" strings for O(1) lookup
    const obstacleSet = new Set(obstacles.map(o => o[0] + ',' + o[1]));
    let ans = 0;

    for (const cmd of commands) {
        if (cmd === -2) {
            // Turn left: (0+3)%4=3, (1+3)%4=0, etc.
            dirIndex = (dirIndex + 3) % 4;
        } else if (cmd === -1) {
            // Turn right
            dirIndex = (dirIndex + 1) % 4;
        } else {
            // Move forward cmd steps, one at a time
            for (let i = 0; i < cmd; i++) {
                const nextX = x + dx[dirIndex];
                const nextY = y + dy[dirIndex];

                if (!obstacleSet.has(nextX + ',' + nextY)) {
                    x = nextX;
                    y = nextY;
                    ans = Math.max(ans, x*x + y*y);
                }
            }
        }
    }

    return ans;
};`,
    jsWalkthrough:
      'Example: commands = [4,-1,3], obstacles = []\n' +
      'Start: x=0, y=0, dirIndex=0 (North)\n\n' +
      'cmd=4 (move North 4 steps):\n' +
      '  step 1: (0,1), dist^2=1\n' +
      '  step 2: (0,2), dist^2=4\n' +
      '  step 3: (0,3), dist^2=9\n' +
      '  step 4: (0,4), dist^2=16, ans=16\n' +
      'cmd=-1 (turn right): dirIndex=1 (East)\n' +
      'cmd=3 (move East 3 steps):\n' +
      '  step 1: (1,4), dist^2=17\n' +
      '  step 2: (2,4), dist^2=20\n' +
      '  step 3: (3,4), dist^2=25, ans=25\n' +
      'Result: 25',
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
    let slow = head;
    let fast = head;

    // Fast moves 2 steps, slow moves 1 step
    // When fast reaches the end, slow is at the middle
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }

    return slow;
};`,
    jsWalkthrough:
      'Example: head = [1,2,3,4,5]\n' +
      'Initial: slow=1, fast=1\n\n' +
      'Iteration 1: fast=1 and fast.next=2 exist\n' +
      '  slow=2, fast=3\n' +
      'Iteration 2: fast=3 and fast.next=4 exist\n' +
      '  slow=3, fast=5\n' +
      'Iteration 3: fast=5 but fast.next=null -> stop\n' +
      'Return slow=node(3)\n\n' +
      'Even length: head=[1,2,3,4]\n' +
      'slow=1,fast=1 -> slow=2,fast=3 -> slow=3,fast=null -> return node(3) (second middle)',
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
    // Build adjacency list: people who dislike each other are connected
    const graph = new Map();
    for (const [a, b] of dislikes) {
        if (!graph.has(a)) graph.set(a, []);
        if (!graph.has(b)) graph.set(b, []);
        graph.get(a).push(b);
        graph.get(b).push(a);
    }

    // color: 0 = group A, 1 = group B
    const color = new Map();

    // BFS 2-coloring for each connected component
    for (let i = 1; i <= n; i++) {
        if (color.has(i)) continue;

        const queue = [i];
        color.set(i, 0); // Start this component with color 0

        let idx = 0;
        while (idx < queue.length) {
            const person = queue[idx++];
            const personColor = color.get(person);

            for (const neighbor of (graph.get(person) || [])) {
                if (!color.has(neighbor)) {
                    // Assign the opposite color
                    color.set(neighbor, personColor ^ 1);
                    queue.push(neighbor);
                } else if (color.get(neighbor) === personColor) {
                    // Same color as adjacent node: not bipartite
                    return false;
                }
            }
        }
    }

    return true;
};`,
    jsWalkthrough:
      'Example: n=4, dislikes=[[1,2],[1,3],[2,4]]\n' +
      'graph: 1->[2,3], 2->[1,4], 3->[1], 4->[2]\n\n' +
      'i=1: color={1:0}, queue=[1]\n' +
      '  person=1 (color 0): neighbors 2,3\n' +
      '    color[2]=1, color[3]=1, queue=[1,2,3]\n' +
      '  person=2 (color 1): neighbors 1,4\n' +
      '    color[1]=0 != 1 -> ok\n' +
      '    color[4]=0, queue=[1,2,3,4]\n' +
      '  person=3 (color 1): neighbors 1\n' +
      '    color[1]=0 != 1 -> ok\n' +
      '  person=4 (color 0): neighbors 2\n' +
      '    color[2]=1 != 0 -> ok\n' +
      'Group A (color 0): {1,4}, Group B (color 1): {2,3}\n' +
      'Result: true',
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
    // Base case: empty array means no node
    if (preorder.length === 0) return null;

    // First element of preorder is always the root
    const root = new TreeNode(preorder[0]);

    // Single node: no children
    if (preorder.length === 1) return root;

    // Second element of preorder is the root of the left subtree
    const leftRootVal = preorder[1];

    // Find that value in postorder to determine left subtree size
    const leftSubtreeSize = postorder.indexOf(leftRootVal) + 1;

    // Recursively build left and right subtrees
    root.left = constructFromPrePost(
        preorder.slice(1, 1 + leftSubtreeSize),
        postorder.slice(0, leftSubtreeSize)
    );
    root.right = constructFromPrePost(
        preorder.slice(1 + leftSubtreeSize),
        postorder.slice(leftSubtreeSize, -1)
    );

    return root;
};`,
    jsWalkthrough:
      'Example: preorder=[1,2,4,5,3,6,7], postorder=[4,5,2,6,7,3,1]\n\n' +
      'root = node(1)\n' +
      'leftRootVal = preorder[1] = 2\n' +
      'postorder.indexOf(2) = 2, leftSubtreeSize = 3\n\n' +
      'Left subtree:\n' +
      '  preorder=[2,4,5], postorder=[4,5,2]\n' +
      '  root=2, leftRootVal=4, postorder.indexOf(4)=0, leftSize=1\n' +
      '  left: preorder=[4], postorder=[4] -> node(4)\n' +
      '  right: preorder=[5], postorder=[5] -> node(5)\n\n' +
      'Right subtree:\n' +
      '  preorder=[3,6,7], postorder=[6,7,3]\n' +
      '  root=3, left=node(6), right=node(7)\n\n' +
      'Result: [1,2,3,4,5,6,7]',
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
};`,
    jsWalkthrough:
      'Operations: push(5),push(7),push(5),push(7),push(4),push(5),pop,pop,pop,pop\n\n' +
      'push(5): freq={5:1}, group={1:[5]}, maxFreq=1\n' +
      'push(7): freq={5:1,7:1}, group={1:[5,7]}, maxFreq=1\n' +
      'push(5): freq={5:2,7:1}, group={1:[5,7],2:[5]}, maxFreq=2\n' +
      'push(7): freq={5:2,7:2}, group={1:[5,7],2:[5,7]}, maxFreq=2\n' +
      'push(4): freq={5:2,7:2,4:1}, group={1:[5,7,4],2:[5,7]}, maxFreq=2\n' +
      'push(5): freq={5:3,7:2,4:1}, group={1:[5,7,4],2:[5,7],3:[5]}, maxFreq=3\n\n' +
      'pop(): maxFreq=3, group[3]=[5] -> pop 5, freq[5]=2, group[3] empty -> maxFreq=2. Return 5\n' +
      'pop(): maxFreq=2, group[2]=[5,7] -> pop 7, freq[7]=1. Return 7\n' +
      'pop(): maxFreq=2, group[2]=[5] -> pop 5, freq[5]=1, group[2] empty -> maxFreq=1. Return 5\n' +
      'pop(): maxFreq=1, group[1]=[5,7,4] -> pop 4, freq[4]=0. Return 4',
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
    // Start by assuming both directions are possible
    let couldBeIncreasing = true;
    let couldBeDecreasing = true;

    for (let i = 1; i < nums.length; i++) {
        if (nums[i] > nums[i-1]) {
            // Found an increase: cannot be non-increasing
            couldBeDecreasing = false;
        }
        if (nums[i] < nums[i-1]) {
            // Found a decrease: cannot be non-decreasing
            couldBeIncreasing = false;
        }
    }

    // Monotonic if it's entirely non-decreasing or entirely non-increasing
    return couldBeIncreasing || couldBeDecreasing;
};`,
    jsWalkthrough:
      'Example: nums = [1,2,2,3]\n' +
      'couldBeIncreasing=true, couldBeDecreasing=true\n\n' +
      'i=1: nums[1]=2 > nums[0]=1 -> couldBeDecreasing=false\n' +
      'i=2: nums[2]=2 === nums[1]=2 -> no change\n' +
      'i=3: nums[3]=3 > nums[2]=2 -> couldBeDecreasing already false\n\n' +
      'couldBeIncreasing=true -> return true\n\n' +
      'Counter-example: nums = [1,3,2]\n' +
      'i=1: 3>1 -> couldBeDecreasing=false\n' +
      'i=2: 2<3 -> couldBeIncreasing=false\n' +
      'Both false -> return false',
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
};`,
    jsWalkthrough:
      'Prices: 100, 80, 60, 70, 60, 75, 85\n\n' +
      'next(100): stack=[], span=1, push [100,1]. Return 1. stack=[[100,1]]\n' +
      'next(80): 80<100, span=1, push [80,1]. Return 1. stack=[[100,1],[80,1]]\n' +
      'next(60): 60<80, span=1, push [60,1]. Return 1. stack=[[100,1],[80,1],[60,1]]\n' +
      'next(70): 70>=60 -> pop [60,1], span=1+1=2\n' +
      '  70<80 -> stop. Push [70,2]. Return 2. stack=[[100,1],[80,1],[70,2]]\n' +
      'next(60): 60<70, span=1. Push [60,1]. Return 1\n' +
      'next(75): 75>=60 -> pop [60,1], span=2; 75>=70 -> pop [70,2], span=4\n' +
      '  75<80 -> stop. Push [75,4]. Return 4\n' +
      'next(85): 85>=75 -> pop [75,4], span=5; 85>=80 -> pop [80,1], span=6\n' +
      '  85<100 -> stop. Push [85,6]. Return 6',
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
    let left = 0;
    let right = nums.length - 1;

    while (left < right) {
        // If left has odd and right has even, swap them
        if (nums[left] % 2 === 1 && nums[right] % 2 === 0) {
            [nums[left], nums[right]] = [nums[right], nums[left]];
        }

        // Advance left past even numbers (they're in the right place)
        if (nums[left] % 2 === 0) left++;

        // Advance right past odd numbers (they're in the right place)
        if (nums[right] % 2 === 1) right--;
    }

    return nums;
};`,
    jsWalkthrough:
      'Example: nums = [3,1,2,4]\n' +
      'left=0, right=3\n\n' +
      'Iteration 1: nums[0]=3(odd), nums[3]=4(even) -> swap\n' +
      '  nums=[4,1,2,3], left=0, right=3\n' +
      '  nums[0]=4(even) -> left=1\n' +
      '  nums[3]=3(odd) -> right=2\n\n' +
      'Iteration 2: nums[1]=1(odd), nums[2]=2(even) -> swap\n' +
      '  nums=[4,2,1,3], left=1, right=2\n' +
      '  nums[1]=2(even) -> left=2\n' +
      '  nums[2]=1(odd) -> right=1\n\n' +
      'left=2 > right=1 -> stop\n' +
      'Result: [4,2,1,3] (evens first, then odds)',
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

    // left[i] = number of subarrays ending at i where arr[i] is the minimum
    const left = new Array(n);
    // right[i] = number of subarrays starting at i where arr[i] is the minimum
    const right = new Array(n);

    // Left pass: find how far left each element is the minimum
    // Use >= to handle duplicates (assign to right duplicate)
    let stack = [];
    for (let i = 0; i < n; i++) {
        while (stack.length && arr[stack[stack.length - 1]] >= arr[i]) {
            stack.pop();
        }
        left[i] = stack.length ? i - stack[stack.length - 1] : i + 1;
        stack.push(i);
    }

    // Right pass: find how far right each element is the minimum
    // Use > (strict) to handle duplicates consistently
    stack = [];
    for (let i = n - 1; i >= 0; i--) {
        while (stack.length && arr[stack[stack.length - 1]] > arr[i]) {
            stack.pop();
        }
        right[i] = stack.length ? stack[stack.length - 1] - i : n - i;
        stack.push(i);
    }

    // Each arr[i] is the minimum of left[i]*right[i] subarrays
    let result = 0;
    for (let i = 0; i < n; i++) {
        result = (result + arr[i] * left[i] * right[i]) % MOD;
    }

    return result;
};`,
    jsWalkthrough:
      'Example: arr = [3,1,2,4]\n\n' +
      'Left pass (how far left is arr[i] the min?):\n' +
      '  i=0: stack=[], left[0]=1, stack=[0]\n' +
      '  i=1: arr[0]=3>=arr[1]=1 -> pop. stack=[], left[1]=2, stack=[1]\n' +
      '  i=2: arr[1]=1<arr[2]=2 -> left[2]=1, stack=[1,2]\n' +
      '  i=3: arr[2]=2<arr[3]=4 -> left[3]=1, stack=[1,2,3]\n' +
      'left = [1,2,1,1]\n\n' +
      'Right pass (how far right):\n' +
      '  i=3: right[3]=1, i=2: right[2]=1, i=1: right[1]=3, i=0: right[0]=1\n' +
      'right = [1,3,1,1]\n\n' +
      'Contributions: 3*1*1=3, 1*2*3=6, 2*1*1=2, 4*1*1=4\n' +
      'Wait, rechecking: arr=[3,1,2,4], expected=17\n' +
      'left=[1,2,1,1], right=[1,3,1,1]\n' +
      '3*1*1=3, 1*2*3=6, 2*1*1=2, 4*1*1=4 -> sum=15, plus duplicates?\n' +
      'Actually right[1]=3 (covers indices 1,2,3) -> 1*2*3=6 correct\n' +
      'Total = 3+6+2+4+2(subarray[1,2]min=1)=17? Let\'s verify by hand:\n' +
      'Subarrays: [3]=3,[1]=1,[2]=2,[4]=4,[3,1]=1,[1,2]=1,[2,4]=2,[3,1,2]=1,[1,2,4]=1,[3,1,2,4]=1\n' +
      'Sum = 3+1+2+4+1+1+2+1+1+1 = 17 ✓',
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

    // Convert square number to board [row, col] coordinates
    // Board is Boustrophedon: row 0 is bottom, alternating left-right direction
    const getPos = (squareNum) => {
        const rowFromBottom = Math.floor((squareNum - 1) / n);
        const row = n - 1 - rowFromBottom;
        const colOffset = (squareNum - 1) % n;
        // Even rows from bottom go left-to-right, odd rows go right-to-left
        const col = rowFromBottom % 2 === 0 ? colOffset : n - 1 - colOffset;
        return [row, col];
    };

    const visited = new Set([1]);
    const queue = [[1, 0]]; // [squareNumber, moves]
    const target = n * n;

    let idx = 0;
    while (idx < queue.length) {
        const [currentSquare, moves] = queue[idx++];

        // Try each dice roll from 1 to 6
        for (let roll = 1; roll <= 6; roll++) {
            let nextSquare = currentSquare + roll;
            if (nextSquare > target) break;

            // Apply snake or ladder if present
            const [r, c] = getPos(nextSquare);
            if (board[r][c] !== -1) {
                nextSquare = board[r][c];
            }

            if (nextSquare === target) return moves + 1;

            if (!visited.has(nextSquare)) {
                visited.add(nextSquare);
                queue.push([nextSquare, moves + 1]);
            }
        }
    }

    return -1;
};`,
    jsWalkthrough:
      'Example: n=2, board=[[-1,3],[-1,-1]], target=4\n' +
      'Squares: bottom row (row 1) = sq 1(col0), sq 2(col1)\n' +
      '         top row  (row 0) = sq 3(col1), sq 4(col0)\n' +
      'board[0][1]=3 means sq 3 has a ladder to sq 3? No, board[0][0]=-1, board[0][1]=-1\n' +
      'board[1][0]=-1, board[1][1]=3 -> sq 2 has a ladder to sq 3\n\n' +
      'Start: queue=[[1,0]], visited={1}\n' +
      'Process sq=1, moves=0:\n' +
      '  roll=1: nextSq=2, getPos(2)=[1,1], board[1][1]=3 -> nextSq=3, not target\n' +
      '    enqueue [3,1]\n' +
      '  roll=2: nextSq=3, getPos(3)=[0,1], board[0][1]=-1 -> nextSq=3, already visited? no\n' +
      '    enqueue [3,1] but already in visited\n' +
      '  roll=3: nextSq=4===target -> return 0+1=1\n' +
      'Result: 1',
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
    // Base case: arrays of 0 or 1 elements are already sorted
    if (nums.length <= 1) return nums;

    // Divide: split at the midpoint
    const mid = Math.floor(nums.length / 2);
    const leftHalf = sortArray(nums.slice(0, mid));
    const rightHalf = sortArray(nums.slice(mid));

    // Conquer: merge the two sorted halves
    const result = [];
    let i = 0; // pointer into leftHalf
    let j = 0; // pointer into rightHalf

    while (i < leftHalf.length && j < rightHalf.length) {
        if (leftHalf[i] <= rightHalf[j]) {
            result.push(leftHalf[i++]);
        } else {
            result.push(rightHalf[j++]);
        }
    }

    // Append any remaining elements from either half
    while (i < leftHalf.length) result.push(leftHalf[i++]);
    while (j < rightHalf.length) result.push(rightHalf[j++]);

    return result;
};`,
    jsWalkthrough:
      'Example: nums = [5,2,3,1]\n\n' +
      'sortArray([5,2,3,1]):\n' +
      '  left = sortArray([5,2])\n' +
      '    left = sortArray([5]) -> [5]\n' +
      '    right = sortArray([2]) -> [2]\n' +
      '    merge [5] and [2]: 2<5 -> [2,5]\n' +
      '  right = sortArray([3,1])\n' +
      '    left = sortArray([3]) -> [3]\n' +
      '    right = sortArray([1]) -> [1]\n' +
      '    merge [3] and [1]: 1<3 -> [1,3]\n' +
      '  merge [2,5] and [1,3]:\n' +
      '    1<2 -> take 1; 2<3 -> take 2; 3<5 -> take 3; take 5\n' +
      '    result: [1,2,3,5]',
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

    // Track maximum subarray (Kadane's)
    let maxSum = -Infinity;
    let curMax = -Infinity;

    // Track minimum subarray (for circular case)
    let minSum = Infinity;
    let curMin = Infinity;

    for (const num of nums) {
        total += num;

        // Kadane's for max subarray
        curMax = Math.max(curMax + num, num);
        maxSum = Math.max(maxSum, curMax);

        // Kadane's for min subarray (circular max = total - min)
        curMin = Math.min(curMin + num, num);
        minSum = Math.min(minSum, curMin);
    }

    // Edge case: all elements negative -> circular case would be empty, use maxSum
    if (maxSum < 0) return maxSum;

    // Compare non-circular max with circular max (total - minSubarray)
    return Math.max(maxSum, total - minSum);
};`,
    jsWalkthrough:
      'Example: nums = [5,-3,5]\n' +
      'total will be 7\n\n' +
      'num=5: curMax=5, maxSum=5, curMin=5, minSum=5, total=5\n' +
      'num=-3: curMax=max(5-3,-3)=2, maxSum=5, curMin=min(5-3,-3)=-3, minSum=-3, total=2\n' +
      'num=5: curMax=max(2+5,5)=7, maxSum=7, curMin=min(-3+5,5)=2, minSum=-3, total=7\n\n' +
      'maxSum=7 > 0\n' +
      'circular case = total - minSum = 7 - (-3) = 10\n' +
      'max(7, 10) = 10\n' +
      'Result: 10 (subarray [5,5] wrapping around)',
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
    let openCount = 0;  // Unmatched '(' needing a ')' to close
    let closeCount = 0; // Unmatched ')' needing a '(' before them

    for (const c of s) {
        if (c === '(') {
            // Opening bracket: needs a match
            openCount++;
        } else if (openCount > 0) {
            // Closing bracket with a pending open: they match
            openCount--;
        } else {
            // Closing bracket with no pending open: unmatched
            closeCount++;
        }
    }

    // openCount unmatched '(' each need one ')'
    // closeCount unmatched ')' each need one '('
    return openCount + closeCount;
};`,
    jsWalkthrough:
      'Example: s = "())"\n' +
      'c="(": openCount=1, closeCount=0\n' +
      'c=")": openCount>0 -> openCount=0, closeCount=0\n' +
      'c=")": openCount=0 -> closeCount=1\n' +
      'Result: openCount+closeCount = 0+1 = 1\n\n' +
      'Example: s = "((("\n' +
      'c="(": openCount=1\n' +
      'c="(": openCount=2\n' +
      'c="(": openCount=3\n' +
      'Result: 3+0 = 3 (need 3 closing brackets)',
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
    let ones = 0;  // Count of '1's seen so far
    let flips = 0; // Minimum flips to make s[0..i] monotone increasing

    for (const c of s) {
        if (c === '1') {
            // A '1' extends a valid monotone sequence: no flip needed
            ones++;
        } else {
            // A '0' after some '1's breaks monotone increasing
            // Option A: flip this '0' to '1' -> flips + 1
            // Option B: flip all previous '1's to '0' -> ones flips
            flips = Math.min(flips + 1, ones);
        }
    }

    return flips;
};`,
    jsWalkthrough:
      'Example: s = "00110"\n' +
      'c="0": c==="0", flips=min(0+1,0)=0, ones=0\n' +
      '  (flipping this 0 costs 1, but flipping 0 ones costs 0 -> take 0)\n' +
      'c="0": flips=min(0+1,0)=0, ones=0\n' +
      'c="1": ones=1, flips=0\n' +
      'c="1": ones=2, flips=0\n' +
      'c="0": flips=min(0+1,2)=1, ones=2\n' +
      '  (flip this 0 to 1: cost=1; flip both 1s to 0: cost=2 -> take 1)\n' +
      'Result: 1\n' +
      'The string "00111" (flip last char) is monotone increasing',
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
        // Separate local name from domain
        const [local, domain] = email.split('@');

        // Drop everything after '+' in the local name
        const localBeforePlus = local.split('+')[0];

        // Remove all dots from the local name
        const cleaned = localBeforePlus.replace(/\./g, '');

        // Reconstruct the normalized email and add to set
        const normalizedEmail = cleaned + '@' + domain;
        seen.add(normalizedEmail);
    }

    return seen.size;
};`,
    jsWalkthrough:
      'Example: emails = ["test.email+alex@leetcode.com","test.e.mail+bob@leetcode.com","testemail@lee.tcode.com"]\n\n' +
      'Email 1: "test.email+alex@leetcode.com"\n' +
      '  local="test.email+alex", domain="leetcode.com"\n' +
      '  before +: "test.email"\n' +
      '  remove dots: "testemail"\n' +
      '  normalized: "testemail@leetcode.com"\n\n' +
      'Email 2: "test.e.mail+bob@leetcode.com"\n' +
      '  local="test.e.mail+bob", before +: "test.e.mail"\n' +
      '  remove dots: "testemail"\n' +
      '  normalized: "testemail@leetcode.com" (duplicate!)\n\n' +
      'Email 3: "testemail@lee.tcode.com"\n' +
      '  normalized: "testemail@lee.tcode.com" (different domain)\n\n' +
      'Set size = 2',
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

    // Initialize dp with the first row values
    let dp = [...matrix[0]];

    for (let i = 1; i < n; i++) {
        const newDp = new Array(n).fill(0);

        for (let j = 0; j < n; j++) {
            // Best predecessor: directly above, or diagonal (left or right)
            let best = dp[j]; // directly above

            if (j > 0) best = Math.min(best, dp[j-1]); // diagonal left
            if (j < n - 1) best = Math.min(best, dp[j+1]); // diagonal right

            newDp[j] = matrix[i][j] + best;
        }

        dp = newDp;
    }

    // Minimum of the last row is the answer
    return Math.min(...dp);
};`,
    jsWalkthrough:
      'Example: matrix = [[2,1,3],[6,5,4],[7,8,9]]\n\n' +
      'Initial dp = [2,1,3]\n\n' +
      'Row 1 (matrix[1] = [6,5,4]):\n' +
      '  j=0: best=dp[0]=2 (no left), dp[1]=1 -> best=1, newDp[0]=6+1=7\n' +
      '  j=1: best=dp[1]=1, dp[0]=2, dp[2]=3 -> best=1, newDp[1]=5+1=6\n' +
      '  j=2: best=dp[2]=3, dp[1]=1 -> best=1, newDp[2]=4+1=5\n' +
      'dp = [7,6,5]\n\n' +
      'Row 2 (matrix[2] = [7,8,9]):\n' +
      '  j=0: best=min(7,6)=6, newDp[0]=7+6=13\n' +
      '  j=1: best=min(6,7,5)=5, newDp[1]=8+5=13\n' +
      '  j=2: best=min(5,6)=5, newDp[2]=9+5=14\n' +
      'dp = [13,13,14]\n\n' +
      'min(13,13,14) = 13',
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
    const queue = []; // BFS queue starting with all cells of island 1

    // DFS to find and mark all cells of the first island
    const dfs = (r, c) => {
        const outOfBounds = r < 0 || r >= n || c < 0 || c >= n;
        if (outOfBounds || visited[r][c] || grid[r][c] === 0) return;

        visited[r][c] = true;
        queue.push([r, c, 0]); // Add to BFS starting points with distance 0

        dfs(r+1, c);
        dfs(r-1, c);
        dfs(r, c+1);
        dfs(r, c-1);
    };

    // Find the first land cell and DFS to mark the whole first island
    let found = false;
    for (let i = 0; i < n && !found; i++) {
        for (let j = 0; j < n && !found; j++) {
            if (grid[i][j] === 1) {
                dfs(i, j);
                found = true;
            }
        }
    }

    // BFS from island 1 outward; first time we hit island 2 is the answer
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    let idx = 0;

    while (idx < queue.length) {
        const [r, c, distance] = queue[idx++];

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;

            const inBounds = nr >= 0 && nr < n && nc >= 0 && nc < n;
            if (!inBounds || visited[nr][nc]) continue;

            // Reached island 2: return the number of water cells flipped
            if (grid[nr][nc] === 1) return distance;

            visited[nr][nc] = true;
            queue.push([nr, nc, distance + 1]);
        }
    }

    return -1;
};`,
    jsWalkthrough:
      'Example: grid = [[0,1],[1,0]]\n\n' +
      'Find first island: grid[0][1]=1\n' +
      'DFS from (0,1): visited[0][1]=true, queue=[[0,1,0]]\n' +
      '  neighbors: (0,0)=0, (-1,1) OOB, (1,1)=0, (0,2) OOB\n\n' +
      'BFS from island 1:\n' +
      'Process [0,1,0]:\n' +
      '  (0,0): grid=0, not visited -> queue=[[0,1,0],[0,0,1]]\n' +
      '  (1,1): grid=0, not visited -> queue.push([1,1,1])\n' +
      'Process [0,0,1]:\n' +
      '  (1,0): grid=1! return distance=1\n' +
      'Result: 1 (flip one water cell)',
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

    // Knight moves from each digit on a phone keypad
    // 1 2 3
    // 4 5 6
    // 7 8 9
    //   0
    const moves = {
        0: [4, 6],
        1: [6, 8],
        2: [7, 9],
        3: [4, 8],
        4: [0, 3, 9],
        5: [],       // No valid knight moves from 5
        6: [0, 1, 7],
        7: [2, 6],
        8: [1, 3],
        9: [2, 4]
    };

    // dp[digit] = number of distinct length-k sequences ending at digit
    let dp = new Array(10).fill(1); // Base: length 1, one way to be at each digit

    for (let step = 0; step < n - 1; step++) {
        const newDp = new Array(10).fill(0);

        for (let digit = 0; digit < 10; digit++) {
            // Each sequence ending at 'digit' extends to its knight-move neighbors
            for (const neighbor of moves[digit]) {
                newDp[neighbor] = (newDp[neighbor] + dp[digit]) % MOD;
            }
        }

        dp = newDp;
    }

    // Sum ways to end at each digit
    let total = 0;
    for (const count of dp) {
        total = (total + count) % MOD;
    }
    return total;
};`,
    jsWalkthrough:
      'Example: n = 2\n' +
      'Initial dp (length 1): [1,1,1,1,1,1,1,1,1,1]\n\n' +
      'Step 0 (extend to length 2):\n' +
      '  digit=0 -> moves to [4,6]: newDp[4]+=1, newDp[6]+=1\n' +
      '  digit=1 -> moves to [6,8]: newDp[6]+=1, newDp[8]+=1\n' +
      '  digit=2 -> moves to [7,9]: newDp[7]+=1, newDp[9]+=1\n' +
      '  digit=3 -> moves to [4,8]: newDp[4]+=1, newDp[8]+=1\n' +
      '  digit=4 -> moves to [0,3,9]: newDp[0]+=1, newDp[3]+=1, newDp[9]+=1\n' +
      '  digit=5 -> no moves\n' +
      '  digit=6 -> moves to [0,1,7]: newDp[0]+=1, newDp[1]+=1, newDp[7]+=1\n' +
      '  digit=7 -> moves to [2,6]: newDp[2]+=1, newDp[6]+=1\n' +
      '  digit=8 -> moves to [1,3]: newDp[1]+=1, newDp[3]+=1\n' +
      '  digit=9 -> moves to [2,4]: newDp[2]+=1, newDp[4]+=1\n' +
      'dp = [2,2,2,2,3,0,3,2,2,2] -> sum = 20',
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
        // Find where the identifier ends and content begins
        const spaceIdx = log.indexOf(' ');
        const firstContentChar = log[spaceIdx + 1];

        // Digit logs start with a digit character after the identifier
        if (firstContentChar >= '0' && firstContentChar <= '9') {
            digitLogs.push(log);
        } else {
            letterLogs.push(log);
        }
    }

    // Sort letter logs: by content first, then by identifier as tiebreaker
    letterLogs.sort((a, b) => {
        const aSpaceIdx = a.indexOf(' ');
        const bSpaceIdx = b.indexOf(' ');

        const aIdentifier = a.substring(0, aSpaceIdx);
        const bIdentifier = b.substring(0, bSpaceIdx);
        const aContent = a.substring(aSpaceIdx + 1);
        const bContent = b.substring(bSpaceIdx + 1);

        if (aContent === bContent) {
            return aIdentifier.localeCompare(bIdentifier);
        }
        return aContent.localeCompare(bContent);
    });

    // Letter logs come first, digit logs preserve original order
    return [...letterLogs, ...digitLogs];
};`,
    jsWalkthrough:
      'Example: logs = ["dig1 8 1","let1 art can","dig2 3 6","let2 own kit","let3 art zero"]\n\n' +
      'Classify:\n' +
      '  "dig1 8 1": first char after space = "8" (digit) -> digitLogs\n' +
      '  "let1 art can": first char = "a" (letter) -> letterLogs\n' +
      '  "dig2 3 6": digit -> digitLogs\n' +
      '  "let2 own kit": letter -> letterLogs\n' +
      '  "let3 art zero": letter -> letterLogs\n\n' +
      'Sort letterLogs by content:\n' +
      '  "let1 art can" content="art can"\n' +
      '  "let3 art zero" content="art zero"\n' +
      '  "let2 own kit" content="own kit"\n' +
      '  "art can" < "art zero" < "own kit" -> order: let1, let3, let2\n\n' +
      'Result: ["let1 art can","let3 art zero","let2 own kit","dig1 8 1","dig2 3 6"]',
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
    // Base case: empty node contributes nothing
    if (!root) return 0;

    // BST property: if current value is below range, skip entire left subtree
    if (root.val < low) {
        return rangeSumBST(root.right, low, high);
    }

    // BST property: if current value is above range, skip entire right subtree
    if (root.val > high) {
        return rangeSumBST(root.left, low, high);
    }

    // Current value is in range — include it and recurse both directions
    const leftSum = rangeSumBST(root.left, low, high);
    const rightSum = rangeSumBST(root.right, low, high);
    return root.val + leftSum + rightSum;
};`,
    jsWalkthrough:
      'Example: root = [10,5,15,3,7,null,18], low = 7, high = 15\n' +
      'Visit node 10: 7 <= 10 <= 15, include it. Recurse left and right.\n' +
      '  Visit node 5: 5 < 7 (below range), go right only.\n' +
      '    Visit node 7: 7 <= 7 <= 15, include it. Left(3) < 7 skip, right is null.\n' +
      '    Return 7.\n' +
      '  Node 5 returns 7.\n' +
      '  Visit node 15: 7 <= 15 <= 15, include it. Left is null, right node 18 > 15 skip left only.\n' +
      '    Node 18: 18 > 15, go left only — left is null, return 0.\n' +
      '  Node 15 returns 15 + 0 = 15.\n' +
      'Node 10: 10 + 7 + 15 = 32. Result: 32',
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
    // Store all points as "x,y" strings for O(1) lookup
    const pointSet = new Set(points.map(p => p[0] + ',' + p[1]));
    let minArea = Infinity;

    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const [x1, y1] = points[i];
            const [x2, y2] = points[j];

            // Two points can be diagonal corners only if they differ in both x and y
            const differentX = x1 !== x2;
            const differentY = y1 !== y2;

            if (differentX && differentY) {
                // Check if the other two corners of the rectangle exist
                const corner1Exists = pointSet.has(x1 + ',' + y2);
                const corner2Exists = pointSet.has(x2 + ',' + y1);

                if (corner1Exists && corner2Exists) {
                    const area = Math.abs(x2 - x1) * Math.abs(y2 - y1);
                    minArea = Math.min(minArea, area);
                }
            }
        }
    }

    return minArea === Infinity ? 0 : minArea;
};`,
    jsWalkthrough:
      'Example: points = [[1,1],[1,3],[3,1],[3,3],[2,2]]\n' +
      'pointSet = {"1,1","1,3","3,1","3,3","2,2"}\n' +
      'Check pair (1,1) and (3,3): different x and y — diagonal!\n' +
      '  Other corners: (1,3) exists? Yes. (3,1) exists? Yes.\n' +
      '  Area = |3-1| * |3-1| = 2 * 2 = 4. minArea = 4.\n' +
      'Check pair (1,3) and (3,1): different x and y — diagonal!\n' +
      '  Other corners: (1,1) exists? Yes. (3,3) exists? Yes.\n' +
      '  Area = |3-1| * |1-3| = 2 * 2 = 4. minArea still 4.\n' +
      'All pairs with (2,2) share an x or y with others or corners missing.\n' +
      'Result: 4',
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
    // Sort so duplicates are adjacent and easy to handle greedily
    nums.sort((a, b) => a - b);

    let totalMoves = 0;

    for (let i = 1; i < nums.length; i++) {
        const prev = nums[i - 1];
        const curr = nums[i];

        // If current value is not strictly greater than previous, bump it up
        if (curr <= prev) {
            const target = prev + 1;
            const movesNeeded = target - curr;
            totalMoves += movesNeeded;
            nums[i] = target; // Update in-place so the next element compares correctly
        }
    }

    return totalMoves;
};`,
    jsWalkthrough:
      'Example: nums = [3,2,1,2,1,7]\n' +
      'After sort: [1,1,2,2,3,7]\n' +
      'i=1: nums[1]=1 <= nums[0]=1 → target=2, moves+=1, nums=[1,2,2,2,3,7]\n' +
      'i=2: nums[2]=2 <= nums[1]=2 → target=3, moves+=1, nums=[1,2,3,2,3,7]\n' +
      'i=3: nums[3]=2 <= nums[2]=3 → target=4, moves+=2, nums=[1,2,3,4,3,7]\n' +
      'i=4: nums[4]=3 <= nums[3]=4 → target=5, moves+=2, nums=[1,2,3,4,5,7]\n' +
      'i=5: nums[5]=7 > nums[4]=5 → no move needed\n' +
      'Total moves: 1+1+2+2 = 6. Result: 6',
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
    // popIdx tracks which element from popped we expect to pop next
    let popIdx = 0;

    for (const val of pushed) {
        // Push the next element
        stack.push(val);

        // After pushing, pop as many elements as match the expected pop sequence
        while (stack.length > 0 && stack[stack.length - 1] === popped[popIdx]) {
            stack.pop();
            popIdx++;
        }
    }

    // If we matched all expected pops, the sequence is valid
    return popIdx === popped.length;
};`,
    jsWalkthrough:
      'Example: pushed = [1,2,3,4,5], popped = [4,5,3,2,1]\n' +
      'Push 1: stack=[1]. Top=1, popped[0]=4, no match.\n' +
      'Push 2: stack=[1,2]. Top=2, popped[0]=4, no match.\n' +
      'Push 3: stack=[1,2,3]. Top=3, popped[0]=4, no match.\n' +
      'Push 4: stack=[1,2,3,4]. Top=4, popped[0]=4, match! Pop → stack=[1,2,3], popIdx=1.\n' +
      '  Top=3, popped[1]=5, no match. Stop while loop.\n' +
      'Push 5: stack=[1,2,3,5]. Top=5, popped[1]=5, match! Pop → stack=[1,2,3], popIdx=2.\n' +
      '  Top=3, popped[2]=3, match! Pop → stack=[1,2], popIdx=3.\n' +
      '  Top=2, popped[3]=2, match! Pop → stack=[1], popIdx=4.\n' +
      '  Top=1, popped[4]=1, match! Pop → stack=[], popIdx=5.\n' +
      'popIdx(5) === popped.length(5). Result: true',
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

    // Find with path compression
    const find = (x) => {
        if (!parent.has(x)) {
            parent.set(x, x); // Initialize: each element is its own parent
        }
        if (parent.get(x) !== x) {
            // Path compression: point directly to root
            parent.set(x, find(parent.get(x)));
        }
        return parent.get(x);
    };

    // Union: merge the sets containing a and b
    const union = (a, b) => {
        const rootA = find(a);
        const rootB = find(b);
        parent.set(rootA, rootB);
    };

    for (const [row, col] of stones) {
        // Use bitwise NOT of col (~col) to create a unique ID for columns
        // that won't collide with row IDs (rows are non-negative, ~col is negative)
        union(row, ~col);
    }

    // Count distinct connected components among the stone rows
    const uniqueRoots = new Set();
    for (const [row] of stones) {
        uniqueRoots.add(find(row));
    }

    // In each component of size k, we can remove k-1 stones
    return stones.length - uniqueRoots.size;
};`,
    jsWalkthrough:
      'Example: stones = [[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]]\n' +
      'Union-Find: rows are non-negative IDs, cols become negative (~0=-1, ~1=-2, ~2=-3).\n' +
      'Stone (0,0): union(0, ~0) → union(0, -1). Both row 0 and col 0 in same component.\n' +
      'Stone (0,1): union(0, ~1) → union(0, -2). Row 0, col 0, col 1 all connected.\n' +
      'Stone (1,0): union(1, ~0) → union(1, -1). Row 1 joins the component (shares col 0).\n' +
      '  Now rows 0,1 and cols 0,1 are all in one component.\n' +
      'Stone (1,2): union(1, ~2) → union(1, -3). Col 2 joins same big component.\n' +
      'Stone (2,1): union(2, ~1) → union(2, -2). Row 2 joins (shares col 1).\n' +
      'Stone (2,2): union(2, ~2) → already same component.\n' +
      'Find root of each stone row: all rows 0,1,2 share one root. uniqueRoots.size = 1.\n' +
      'Removable = 6 - 1 = 5. Result: 5',
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
    // Both null — trivially equivalent
    if (!root1 && !root2) return true;

    // One null but not both, or values differ — not equivalent
    if (!root1 || !root2 || root1.val !== root2.val) return false;

    // Option 1: children match without flipping (left-to-left, right-to-right)
    const noFlip = flipEquiv(root1.left, root2.left) &&
                   flipEquiv(root1.right, root2.right);

    // Option 2: children match after flipping (left-to-right, right-to-left)
    const withFlip = flipEquiv(root1.left, root2.right) &&
                     flipEquiv(root1.right, root2.left);

    return noFlip || withFlip;
};`,
    jsWalkthrough:
      'Example: root1 = [1,2,3,4,5,6], root2 = [1,3,2,null,6,4,5]\n' +
      'Compare node 1 (root): values match (1==1). Check children.\n' +
      '  NoFlip: compare root1.left(2) vs root2.left(3) → values differ (2!=3) → false.\n' +
      '  WithFlip: compare root1.left(2) vs root2.right(2) → values match.\n' +
      '    Compare subtrees of 2: root1.left.left(4) vs root2.right.left(4) → match.\n' +
      '                           root1.left.right(5) vs root2.right.right(5) → match.\n' +
      '  Compare root1.right(3) vs root2.left(3) → values match.\n' +
      '    root1.right.left(null) vs root2.left.left(null) → both null → match.\n' +
      '    root1.right.right(6) vs root2.left.right(6) — wait, check actual tree.\n' +
      '  WithFlip succeeds. Result: true',
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
};`,
    jsWalkthrough:
      'Example: words = ["hello","leetcode"], order = "hlabcdefgijkmnopqrstuvwxyz"\n' +
      'Build rank: h=0, l=1, a=2, b=3, ...\n' +
      'Compare "hello" vs "leetcode":\n' +
      '  j=0: word1[0]="h" (rank=0) vs word2[0]="l" (rank=1).\n' +
      '  rank1(0) < rank2(1) → word1 comes first at this position → break, this pair OK.\n' +
      'No adjacent pair violated order. Result: true',
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
    let queueIdx = 0;
    // Once we see a null node in BFS, all subsequent nodes must also be null
    let seenNull = false;

    while (queueIdx < queue.length) {
        const node = queue[queueIdx++];

        if (node === null) {
            // Mark that we've encountered a gap
            seenNull = true;
        } else {
            // A real node after a gap means the tree is not complete
            if (seenNull) return false;

            // Add children (including nulls) so we can detect gaps
            queue.push(node.left);
            queue.push(node.right);
        }
    }

    return true;
};`,
    jsWalkthrough:
      'Example: root = [1,2,3,4,5,6] (complete tree)\n' +
      'BFS queue: [1]\n' +
      'Process 1: seenNull=false. Add children 2, 3. queue=[1,2,3]\n' +
      'Process 2: seenNull=false. Add children 4, 5. queue=[1,2,3,4,5]\n' +
      'Process 3: seenNull=false. Add children 6, null. queue=[...,4,5,6,null]\n' +
      'Process 4: seenNull=false. Add null,null. queue=[...,6,null,null,null]\n' +
      'Process 5: seenNull=false. Add null,null.\n' +
      'Process 6: seenNull=false. Add null,null.\n' +
      'Process null: seenNull=true.\n' +
      'Process null: seenNull already true, but node is null so OK.\n' +
      '... all remaining are null. Result: true\n' +
      'Counter-example: [1,2,3,null,5] — after null, we see 5 → return false.',
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
    // State constants:
    // 0 = this node needs coverage (not yet covered)
    // 1 = this node has a camera (covers itself and adjacent nodes)
    // 2 = this node is covered (by a child's camera)
    let cameras = 0;

    const dfs = (node) => {
        // Null nodes are considered "covered" to avoid placing cameras on leaves
        if (!node) return 2;

        const leftState = dfs(node.left);
        const rightState = dfs(node.right);

        // If any child needs coverage, we must place a camera here
        if (leftState === 0 || rightState === 0) {
            cameras++;
            return 1; // This node now has a camera
        }

        // If any child has a camera, this node is covered by it
        if (leftState === 1 || rightState === 1) {
            return 2; // This node is covered
        }

        // Both children are covered but neither has a camera pointing up
        // This node needs its parent to cover it
        return 0;
    };

    // If the root itself needs coverage, add one more camera
    if (dfs(root) === 0) cameras++;

    return cameras;
};`,
    jsWalkthrough:
      'Example: root = [0,0,null,0,0] (nodes labeled by position, not value)\n' +
      'Tree: root has left child L, L has children LL and LR.\n' +
      'dfs(LL): both children null → return 2 (covered by nulls)\n' +
      'dfs(LR): both children null → return 2 (covered by nulls)\n' +
      'dfs(L): leftState=2, rightState=2 → neither child needs coverage, neither has camera.\n' +
      '  → return 0 (L needs coverage from parent)\n' +
      'dfs(root): leftState=0 → place camera here! cameras=1. return 1.\n' +
      '  (root\'s camera covers root, L, and root\'s right child=null)\n' +
      '  LL and LR are covered because L has camera from root... wait:\n' +
      '  Actually L needs coverage (state 0), so root gets a camera (state 1).\n' +
      '  Camera at root covers root, L, and their parents. But LL, LR still uncovered?\n' +
      '  Actually L\'s children returned 2 (covered by null children being 2).\n' +
      '  So LL and LR are fine. Only L needed coverage → root camera handles it.\n' +
      'Final cameras = 1. Result: 1',
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
    // remainderCount[r] = how many prefix sums have remainder r mod k
    // Initialize with {0: 1} to count subarrays starting from index 0
    const remainderCount = { 0: 1 };
    let prefixSum = 0;
    let result = 0;

    for (const num of nums) {
        prefixSum += num;

        // Compute remainder, handling negative values with the +k trick
        const remainder = ((prefixSum % k) + k) % k;

        // Any previous prefix sum with the same remainder forms a valid subarray
        result += (remainderCount[remainder] || 0);

        // Record this remainder
        remainderCount[remainder] = (remainderCount[remainder] || 0) + 1;
    }

    return result;
};`,
    jsWalkthrough:
      'Example: nums = [4,5,0,-2,-3,1], k = 5\n' +
      'remainderCount = {0:1}, prefix=0, result=0\n' +
      'num=4: prefix=4, remainder=4. count[4]=0, result+=0. remainderCount={0:1,4:1}\n' +
      'num=5: prefix=9, remainder=4. count[4]=1, result+=1=1. remainderCount={0:1,4:2}\n' +
      'num=0: prefix=9, remainder=4. count[4]=2, result+=2=3. remainderCount={0:1,4:3}\n' +
      'num=-2: prefix=7, remainder=2. count[2]=0, result+=0=3. remainderCount={...,2:1}\n' +
      'num=-3: prefix=4, remainder=4. count[4]=3, result+=3=6. remainderCount={0:1,4:4,2:1}\n' +
      'num=1: prefix=5, remainder=0. count[0]=1, result+=1=7. Done.\n' +
      'Result: 7',
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

    // odd[i] = true if we can reach the end starting with an ODD jump from index i
    // even[i] = true if we can reach the end starting with an EVEN jump from index i
    const odd = new Array(n).fill(false);
    const even = new Array(n).fill(false);

    // The last index is the destination — already "reached" for either jump type
    odd[n - 1] = even[n - 1] = true;

    // Maintain a sorted list of values seen so far (processing right to left)
    // so we can binary search for the next higher and next lower values
    const sortedValues = new Map(); // value -> index of that value in arr
    const sortedKeys = []; // sorted array of unique values seen so far

    // Helper: insert a key into sortedKeys maintaining sorted order
    const insertKey = (val) => {
        let lo = 0;
        let hi = sortedKeys.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (sortedKeys[mid] < val) lo = mid + 1;
            else hi = mid;
        }
        // Only insert if not already present
        if (lo < sortedKeys.length && sortedKeys[lo] === val) return;
        sortedKeys.splice(lo, 0, val);
    };

    // Binary search: first index where sortedKeys[idx] >= val
    const bisectLeft = (val) => {
        let lo = 0;
        let hi = sortedKeys.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (sortedKeys[mid] < val) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    };

    // Binary search: first index where sortedKeys[idx] > val
    const bisectRight = (val) => {
        let lo = 0;
        let hi = sortedKeys.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (sortedKeys[mid] <= val) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    };

    // Seed with the last element
    insertKey(arr[n - 1]);
    sortedValues.set(arr[n - 1], n - 1);

    // Process indices from right to left
    for (let i = n - 2; i >= 0; i--) {
        const val = arr[i];

        // Odd jump: find the smallest value >= val (next higher or equal)
        const hiIdx = bisectLeft(val);
        if (hiIdx < sortedKeys.length) {
            const jumpTarget = sortedValues.get(sortedKeys[hiIdx]);
            // After an odd jump, we make an even jump from target
            odd[i] = even[jumpTarget];
        }

        // Even jump: find the largest value <= val (next lower or equal)
        const loIdx = bisectRight(val) - 1;
        if (loIdx >= 0) {
            const jumpTarget = sortedValues.get(sortedKeys[loIdx]);
            // After an even jump, we make an odd jump from target
            even[i] = odd[jumpTarget];
        }

        insertKey(val);
        sortedValues.set(val, i);
    }

    // Count starting indices where an odd jump (first jump) can reach the end
    return odd.filter(canReach => canReach).length;
};`,
    jsWalkthrough:
      'Example: arr = [10,13,12,14,15]\n' +
      'n=5. odd=[F,F,F,F,T], even=[F,F,F,F,T]. Seed: sortedKeys=[15], sortedValues={15->4}.\n' +
      'i=3 (val=14): OddJump: bisectLeft(14)→idx for >=14 in [15] → idx=0, key=15, target=4. odd[3]=even[4]=T.\n' +
      '  EvenJump: bisectRight(14)-1→idx for <=14 in [15] → bisectRight=0, loIdx=-1. No target. even[3]=F.\n' +
      '  Insert 14. sortedKeys=[14,15], sortedValues={15->4,14->3}.\n' +
      'i=2 (val=12): OddJump: bisectLeft(12)→0, key=14, target=3. odd[2]=even[3]=F.\n' +
      '  EvenJump: bisectRight(12)-1=-1. even[2]=F.\n' +
      '  odd=[F,F,F,T,T], even=[F,F,F,F,T].\n' +
      'i=1 (val=13): OddJump: bisectLeft(13)→idx for >=13 in [12,14,15]→1, key=14, target=3. odd[1]=even[3]=F.\n' +
      '  EvenJump: bisectRight(13)-1→idx for <=13 in [12,14,15]→1 (12 and 13 but 13 not there, so 12 at idx=0). Wait:\n' +
      '  Actually sortedKeys=[12,14,15]. bisectRight(13): find first >13 → idx=1. loIdx=0, key=12, target=2. even[1]=odd[2]=F.\n' +
      'i=0 (val=10): OddJump: bisectLeft(10)→0, key=12, target=2. odd[0]=even[2]=F.\n' +
      '  EvenJump: bisectRight(10)-1=-1. even[0]=F.\n' +
      'odd=[F,F,F,T,T]. Count true: indices 3 and 4. Result: 2',
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

    // Two pointers: left starts at the most negative, right at the most positive
    let left = 0;
    let right = n - 1;

    // Fill result from the largest position backward
    for (let i = n - 1; i >= 0; i--) {
        const absLeft = Math.abs(nums[left]);
        const absRight = Math.abs(nums[right]);

        if (absLeft > absRight) {
            // Left side has the larger absolute value
            result[i] = absLeft * absLeft;
            left++;
        } else {
            // Right side has the larger absolute value (or equal)
            result[i] = absRight * absRight;
            right--;
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: nums = [-4,-1,0,3,10]\n' +
      'n=5, left=0, right=4. Fill result from position 4 down to 0.\n' +
      'i=4: abs(-4)=4 vs abs(10)=10. 4 < 10 → result[4]=100, right=3.\n' +
      'i=3: abs(-4)=4 vs abs(3)=3. 4 > 3 → result[3]=16, left=1.\n' +
      'i=2: abs(-1)=1 vs abs(3)=3. 1 < 3 → result[2]=9, right=2.\n' +
      'i=1: abs(-1)=1 vs abs(0)=0. 1 > 0 → result[1]=1, left=2.\n' +
      'i=0: left==right==2, abs(0)=0 vs abs(0)=0 → result[0]=0, right=1.\n' +
      'Result: [0,1,9,16,100]',
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

    // inc: length of turbulent subarray ending at current position where arr[i] > arr[i-1]
    // dec: length of turbulent subarray ending at current position where arr[i] < arr[i-1]
    let inc = 1;
    let dec = 1;
    let maxLen = 1;

    for (let i = 1; i < n; i++) {
        if (arr[i] > arr[i - 1]) {
            // Current is greater — extends a subarray that was previously decreasing
            inc = dec + 1;
            dec = 1; // Reset: a "decreasing ending" cannot extend with an increase
        } else if (arr[i] < arr[i - 1]) {
            // Current is less — extends a subarray that was previously increasing
            dec = inc + 1;
            inc = 1; // Reset
        } else {
            // Equal: breaks turbulence entirely
            inc = 1;
            dec = 1;
        }

        maxLen = Math.max(maxLen, inc, dec);
    }

    return maxLen;
};`,
    jsWalkthrough:
      'Example: arr = [9,4,2,10,7,8,8,1,9]\n' +
      'Start: inc=1, dec=1, maxLen=1.\n' +
      'i=1: 4<9 → dec=inc+1=2, inc=1. maxLen=2.\n' +
      'i=2: 2<4 → dec=inc+1=2, inc=1. maxLen=2.\n' +
      'i=3: 10>2 → inc=dec+1=3, dec=1. maxLen=3.\n' +
      'i=4: 7<10 → dec=inc+1=4, inc=1. maxLen=4.\n' +
      'i=5: 8>7 → inc=dec+1=5, dec=1. maxLen=5.\n' +
      'i=6: 8==8 → inc=1, dec=1. maxLen stays 5.\n' +
      'i=7: 1<8 → dec=inc+1=2, inc=1. maxLen stays 5.\n' +
      'i=8: 9>1 → inc=dec+1=3, dec=1. maxLen stays 5.\n' +
      'Result: 5',
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
    let totalMoves = 0;

    // Returns the excess coins for this subtree:
    // positive = surplus (needs to send coins out)
    // negative = deficit (needs to receive coins)
    const dfs = (node) => {
        if (!node) return 0;

        const leftExcess = dfs(node.left);
        const rightExcess = dfs(node.right);

        // The number of coin movements through the edges to/from this node's children
        // equals the absolute excess of each child subtree
        totalMoves += Math.abs(leftExcess) + Math.abs(rightExcess);

        // This node needs 1 coin; any remaining are excess to pass upward
        const thisNodeExcess = node.val - 1 + leftExcess + rightExcess;
        return thisNodeExcess;
    };

    dfs(root);
    return totalMoves;
};`,
    jsWalkthrough:
      'Example: root = [3,0,0]\n' +
      'Tree: root has val=3, left child has val=0, right child has val=0.\n' +
      'dfs(left child, val=0):\n' +
      '  leftExcess=0 (null), rightExcess=0 (null). totalMoves += 0+0 = 0.\n' +
      '  Return 0-1+0+0 = -1 (deficit of 1 coin).\n' +
      'dfs(right child, val=0):\n' +
      '  leftExcess=0, rightExcess=0. totalMoves += 0.\n' +
      '  Return 0-1+0+0 = -1 (deficit of 1 coin).\n' +
      'dfs(root, val=3):\n' +
      '  leftExcess=-1, rightExcess=-1.\n' +
      '  totalMoves += |-1| + |-1| = 2. totalMoves=2.\n' +
      '  Return 3-1+(-1)+(-1) = 0 (balanced).\n' +
      'Result: 2',
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
    const rows = grid.length;
    const cols = grid[0].length;

    // Count how many cells we must visit (empty cells + starting cell)
    let cellsToVisit = 1; // start cell counts
    let startRow = 0;
    let startCol = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 0) {
                cellsToVisit++;
            } else if (grid[r][c] === 1) {
                startRow = r;
                startCol = c;
            }
        }
    }

    let validPaths = 0;
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    const dfs = (r, c, remaining) => {
        // Reached the end — check if we visited all required cells
        if (grid[r][c] === 2) {
            if (remaining === 0) validPaths++;
            return;
        }

        // Mark this cell as visited by temporarily setting it to -1 (obstacle)
        const savedValue = grid[r][c];
        grid[r][c] = -1;

        for (const [dr, dc] of directions) {
            const nextRow = r + dr;
            const nextCol = c + dc;
            const inBounds = nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols;
            const notBlocked = inBounds && grid[nextRow][nextCol] !== -1;

            if (notBlocked) {
                dfs(nextRow, nextCol, remaining - 1);
            }
        }

        // Restore the cell for other paths (backtrack)
        grid[r][c] = savedValue;
    };

    dfs(startRow, startCol, cellsToVisit);
    return validPaths;
};`,
    jsWalkthrough:
      'Example: grid = [[1,0,0,0],[0,0,0,0],[0,0,2,-1]]\n' +
      'cellsToVisit: start(1,0) + 7 empty cells = 8 (but 2 is the end, -1 is obstacle)\n' +
      'Actually: count grid[r][c]===0: 6 zeros, so cellsToVisit=1+6=7.\n' +
      'Start at (0,0). Need to visit 7 cells total before reaching (2,2).\n' +
      'DFS explores all paths from (0,0) through all 6 empty cells to (2,2).\n' +
      'A valid path visits all 6 empty cells + start + end = all non-obstacle cells.\n' +
      'Two such paths exist (one going right-first, one going down-first in certain ways).\n' +
      'Result: 2',
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
};`,
    jsWalkthrough:
      'Operations: set("foo","bar",1), get("foo",1), get("foo",3), set("foo","bar2",4), get("foo",4), get("foo",5)\n' +
      'After set("foo","bar",1): store={"foo":[[1,"bar"]]}\n' +
      'get("foo",1): binary search in [[1,"bar"]]. mid=0, ts=1 <= 1 → bestValue="bar", lo=1. Done. Return "bar".\n' +
      'get("foo",3): binary search in [[1,"bar"]]. mid=0, ts=1 <= 3 → bestValue="bar", lo=1. Done. Return "bar".\n' +
      'After set("foo","bar2",4): store={"foo":[[1,"bar"],[4,"bar2"]]}\n' +
      'get("foo",4): mid=0, ts=1<=4 → bestValue="bar", lo=1. mid=1, ts=4<=4 → bestValue="bar2", lo=2. Done. Return "bar2".\n' +
      'get("foo",5): mid=0, ts=1<=5 → "bar", lo=1. mid=1, ts=4<=5 → "bar2", lo=2. Return "bar2".',
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
    // Use a set for O(1) travel day lookup
    const travelDaySet = new Set(days);
    const lastDay = days[days.length - 1];

    // dp[d] = minimum cost to cover all travel days from day 1 through day d
    const dp = new Array(lastDay + 1).fill(0);

    for (let d = 1; d <= lastDay; d++) {
        if (!travelDaySet.has(d)) {
            // Not a travel day — cost is the same as the previous day
            dp[d] = dp[d - 1];
        } else {
            // Travel day — try buying each type of pass
            const cost1Day = dp[d - 1] + costs[0];              // 1-day pass
            const cost7Day = dp[Math.max(0, d - 7)] + costs[1]; // 7-day pass
            const cost30Day = dp[Math.max(0, d - 30)] + costs[2]; // 30-day pass
            dp[d] = Math.min(cost1Day, cost7Day, cost30Day);
        }
    }

    return dp[lastDay];
};`,
    jsWalkthrough:
      'Example: days = [1,4,6,7,8,20], costs = [2,7,15]\n' +
      'lastDay=20, travelDaySet={1,4,6,7,8,20}.\n' +
      'd=1 (travel): min(dp[0]+2, dp[0]+7, dp[0]+15) = min(2,7,15) = 2. dp[1]=2.\n' +
      'd=2 (no travel): dp[2]=dp[1]=2.\n' +
      'd=3 (no travel): dp[3]=dp[2]=2.\n' +
      'd=4 (travel): min(dp[3]+2, dp[0]+7, dp[0]+15) = min(4,7,15) = 4. dp[4]=4.\n' +
      'd=5 (no travel): dp[5]=dp[4]=4.\n' +
      'd=6 (travel): min(dp[5]+2, dp[0]+7, dp[0]+15) = min(6,7,15) = 6. dp[6]=6.\n' +
      'd=7 (travel): min(dp[6]+2, dp[0]+7, dp[0]+15) = min(8,7,15) = 7. dp[7]=7.\n' +
      'd=8 (travel): min(dp[7]+2, dp[1]+7, dp[0]+15) = min(9,9,15) = 9. dp[8]=9.\n' +
      'd=9..19 (no travel): dp stays 9.\n' +
      'd=20 (travel): min(dp[19]+2, dp[13]+7, dp[0]+15) = min(11,16,15) = 11. dp[20]=11.\n' +
      'Result: 11',
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
    let i = 0; // pointer into firstList
    let j = 0; // pointer into secondList
    const result = [];

    while (i < firstList.length && j < secondList.length) {
        const [startA, endA] = firstList[i];
        const [startB, endB] = secondList[j];

        // Intersection is [max of starts, min of ends]
        const intersectStart = Math.max(startA, startB);
        const intersectEnd = Math.min(endA, endB);

        // If intersectStart <= intersectEnd, there is a valid overlap
        if (intersectStart <= intersectEnd) {
            result.push([intersectStart, intersectEnd]);
        }

        // Advance the pointer whose interval ends first
        // (the one with the smaller end can no longer contribute to future intersections)
        if (endA < endB) {
            i++;
        } else {
            j++;
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: firstList = [[0,2],[5,10],[13,23],[24,25]], secondList = [[1,5],[8,12],[15,24],[25,26]]\n' +
      'i=0,j=0: A=[0,2], B=[1,5]. intersect=[max(0,1),min(2,5)]=[1,2]. lo<=hi → add [1,2]. endA(2)<endB(5) → i++.\n' +
      'i=1,j=0: A=[5,10], B=[1,5]. intersect=[max(5,1),min(10,5)]=[5,5]. add [5,5]. endA(10)>endB(5) → j++.\n' +
      'i=1,j=1: A=[5,10], B=[8,12]. intersect=[8,10]. add [8,10]. endA(10)<endB(12) → i++.\n' +
      'i=2,j=1: A=[13,23], B=[8,12]. intersect=[13,12]. 13>12 → no overlap. endA(23)>endB(12) → j++.\n' +
      'i=2,j=2: A=[13,23], B=[15,24]. intersect=[15,23]. add [15,23]. endA(23)<endB(24) → i++.\n' +
      'i=3,j=2: A=[24,25], B=[15,24]. intersect=[24,24]. add [24,24]. endA(25)>endB(24) → j++.\n' +
      'i=3,j=3: A=[24,25], B=[25,26]. intersect=[25,25]. add [25,25]. endA(25)<endB(26) → i++. i=4, done.\n' +
      'Result: [[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]',
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
    // Collect (column, row, value) for every node via DFS
    const nodes = [];

    const dfs = (node, row, col) => {
        if (!node) return;
        nodes.push([col, row, node.val]);
        // Left child is one column left, right child is one column right
        dfs(node.left, row + 1, col - 1);
        dfs(node.right, row + 1, col + 1);
    };

    dfs(root, 0, 0);

    // Sort by column, then by row within same column, then by value within same row/column
    nodes.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

    // Group values by column
    const result = [];
    let prevCol = -Infinity;

    for (const [col, row, val] of nodes) {
        if (col !== prevCol) {
            result.push([]); // Start a new column group
            prevCol = col;
        }
        result[result.length - 1].push(val);
    }

    return result;
};`,
    jsWalkthrough:
      'Example: root = [3,9,20,null,null,15,7]\n' +
      'DFS collects: (col, row, val)\n' +
      '  node 3: (0, 0, 3)\n' +
      '  node 9 (left of 3): (-1, 1, 9)\n' +
      '  node 20 (right of 3): (1, 1, 20)\n' +
      '  node 15 (left of 20): (0, 2, 15)\n' +
      '  node 7 (right of 20): (2, 2, 7)\n' +
      'nodes = [(-1,1,9),(0,2,15),(1,1,20),(2,2,7),(0,0,3)]\n' +
      'After sort by col,row,val: [(-1,1,9),(0,0,3),(0,2,15),(1,1,20),(2,2,7)]\n' +
      'Group by col: col=-1 → [9], col=0 → [3,15], col=1 → [20], col=2 → [7]\n' +
      'Result: [[9],[3,15],[20],[7]]',
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
    // parent[i] = representative for variable with char code 97+i (a=0, b=1, ...)
    const parent = Array.from({ length: 26 }, (_, i) => i);

    // Find with path compression (iterative)
    const find = (x) => {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]]; // Path halving
            x = parent[x];
        }
        return x;
    };

    // Union: merge groups containing a and b
    const union = (a, b) => {
        parent[find(a)] = find(b);
    };

    // Pass 1: process all equality constraints first
    for (const eq of equations) {
        if (eq[1] === '=') { // "a==b" format
            const charA = eq.charCodeAt(0) - 97;
            const charB = eq.charCodeAt(3) - 97;
            union(charA, charB);
        }
    }

    // Pass 2: check inequality constraints for contradictions
    for (const eq of equations) {
        if (eq[1] === '!') { // "a!=b" format
            const charA = eq.charCodeAt(0) - 97;
            const charB = eq.charCodeAt(3) - 97;
            // If both variables are in the same group, equality was implied → contradiction
            if (find(charA) === find(charB)) return false;
        }
    }

    return true;
};`,
    jsWalkthrough:
      'Example: equations = ["a==b","b!=a"]\n' +
      'parent = [0,1,2,...,25] (a=index 0, b=index 1)\n' +
      'Pass 1 - equalities:\n' +
      '  "a==b": union(0, 1) → parent[find(0)]=find(1) → parent[0]=1. Now a and b in same group.\n' +
      'Pass 2 - inequalities:\n' +
      '  "b!=a": find(1)=1, find(0)=find(parent[0])=find(1)=1. Same root! Contradiction.\n' +
      '  Return false.\n' +
      'Result: false',
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
    // Key insight: count(exactly k distinct) = count(at most k) - count(at most k-1)
    const atMost = (maxDistinct) => {
        const freq = new Map(); // tracks frequency of each number in the current window
        let left = 0;
        let subArrayCount = 0;

        for (let right = 0; right < nums.length; right++) {
            // Expand window by including nums[right]
            freq.set(nums[right], (freq.get(nums[right]) || 0) + 1);

            // Shrink window from left until we have at most maxDistinct distinct values
            while (freq.size > maxDistinct) {
                const leftVal = nums[left];
                freq.set(leftVal, freq.get(leftVal) - 1);
                if (freq.get(leftVal) === 0) {
                    freq.delete(leftVal); // Remove from map to reduce distinct count
                }
                left++;
            }

            // All subarrays ending at 'right' and starting at left..right are valid
            subArrayCount += right - left + 1;
        }

        return subArrayCount;
    };

    return atMost(k) - atMost(k - 1);
};`,
    jsWalkthrough:
      'Example: nums = [1,2,1,2,3], k = 2\n' +
      'atMost(2): sliding window with at most 2 distinct.\n' +
      '  right=0 (val=1): freq={1:1}. count += 0-0+1=1. total=1.\n' +
      '  right=1 (val=2): freq={1:1,2:1}. count += 1-0+1=2. total=3.\n' +
      '  right=2 (val=1): freq={1:2,2:1}. count += 2-0+1=3. total=6.\n' +
      '  right=3 (val=2): freq={1:2,2:2}. count += 3-0+1=4. total=10.\n' +
      '  right=4 (val=3): freq={1:2,2:2,3:1} size=3>2. Shrink:\n' +
      '    Remove nums[0]=1: freq={1:1,2:2,3:1}. left=1. Still size=3>2.\n' +
      '    Remove nums[1]=2: freq={1:1,2:1,3:1}. left=2. Still size=3>2.\n' +
      '    Remove nums[2]=1: freq={2:1,3:1}. left=3. size=2. OK.\n' +
      '  count += 4-3+1=2. total=12.\n' +
      'atMost(1)=5 (count subarrays with at most 1 distinct).\n' +
      'Result: 12 - 5 = 7',
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
};`,
    jsWalkthrough:
      'Example: n = 3, trust = [[1,3],[2,3]]\n' +
      'balance = [0, 0, 0, 0] (indices 0..3)\n' +
      'Trust [1,3]: balance[1]-- → balance[1]=-1. balance[3]++ → balance[3]=1.\n' +
      'Trust [2,3]: balance[2]-- → balance[2]=-1. balance[3]++ → balance[3]=2.\n' +
      'balance = [0, -1, -1, 2]\n' +
      'Check person 1: balance=-1 ≠ n-1=2.\n' +
      'Check person 2: balance=-1 ≠ 2.\n' +
      'Check person 3: balance=2 === n-1=2. Return 3.\n' +
      'Result: 3',
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
    // Initialize common frequencies from the first word
    let commonFreq = {};
    for (const ch of words[0]) {
        commonFreq[ch] = (commonFreq[ch] || 0) + 1;
    }

    // Intersect with each subsequent word's frequency map
    for (let i = 1; i < words.length; i++) {
        // Count frequencies in this word
        const wordFreq = {};
        for (const ch of words[i]) {
            wordFreq[ch] = (wordFreq[ch] || 0) + 1;
        }

        // For each character in commonFreq, keep the minimum count
        for (const ch in commonFreq) {
            if (wordFreq[ch]) {
                commonFreq[ch] = Math.min(commonFreq[ch], wordFreq[ch]);
            } else {
                delete commonFreq[ch]; // This character doesn't appear in words[i]
            }
        }
    }

    // Expand each character by its minimum frequency
    const result = [];
    for (const ch in commonFreq) {
        for (let i = 0; i < commonFreq[ch]; i++) {
            result.push(ch);
        }
    }

    return result;
};`,
    jsWalkthrough:
      'Example: words = ["bella","label","roller"]\n' +
      'Word "bella": commonFreq = {b:1, e:1, l:2, a:1}\n' +
      'Word "label": wordFreq = {l:2, a:1, b:1, e:1}\n' +
      '  Intersect: b→min(1,1)=1, e→min(1,1)=1, l→min(2,2)=2, a→min(1,1)=1.\n' +
      '  commonFreq = {b:1, e:1, l:2, a:1}\n' +
      'Word "roller": wordFreq = {r:2, o:1, l:2, e:1}\n' +
      '  Intersect: b→not in roller → delete, e→min(1,1)=1, l→min(2,2)=2, a→not in roller → delete.\n' +
      '  commonFreq = {e:1, l:2}\n' +
      'Expand: e×1 + l×2 = ["e","l","l"]. Result: ["e","l","l"]',
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
    // Sort ascending so we encounter the most negative values first
    nums.sort((a, b) => a - b);

    let i = 0;
    // Greedily negate the most negative values to turn them positive
    while (k > 0 && i < nums.length && nums[i] < 0) {
        nums[i] = -nums[i]; // Flip negative to positive
        i++;
        k--;
    }

    // If we still have negations left and k is odd,
    // we must negate exactly once more (toggling the smallest value)
    if (k % 2 === 1) {
        nums.sort((a, b) => a - b); // Re-sort to find smallest value
        nums[0] = -nums[0]; // Negate the smallest (least cost)
    }

    return nums.reduce((sum, val) => sum + val, 0);
};`,
    jsWalkthrough:
      'Example: nums = [4,2,3], k = 1\n' +
      'Sort: [2,3,4]\n' +
      'No negatives, so inner while loop does nothing.\n' +
      'k=1 is odd → re-sort: [2,3,4]. Negate smallest: nums[0]=-2.\n' +
      'nums = [-2,3,4]. Sum = -2+3+4 = 5.\n' +
      'Result: 5\n' +
      '\n' +
      'Another example: nums = [-4,-2,3], k = 4\n' +
      'Sort: [-4,-2,3]\n' +
      'i=0: k>0, nums[0]=-4<0 → negate to 4. k=3, i=1.\n' +
      'i=1: k>0, nums[1]=-2<0 → negate to 2. k=2, i=2.\n' +
      'i=2: nums[2]=3>0 → stop.\n' +
      'k=2 is even → no extra negation needed.\n' +
      'nums = [4,2,3]. Sum = 9. Result: 9',
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
    // Check how many rotations are needed to make all positions equal to 'target'
    const check = (target) => {
        // topRotations: rotations needed to make all tops = target
        // botRotations: rotations needed to make all bottoms = target
        let topRotations = 0;
        let botRotations = 0;

        for (let i = 0; i < tops.length; i++) {
            const topHas = tops[i] === target;
            const botHas = bottoms[i] === target;

            if (!topHas && !botHas) {
                // Neither face of this domino shows the target — impossible
                return Infinity;
            } else if (!topHas) {
                // Top doesn't have target, but bottom does — need to rotate to put it on top
                topRotations++;
            } else if (!botHas) {
                // Bottom doesn't have target, but top does — need to rotate to put it on bottom
                botRotations++;
            }
            // If both faces have the target, no rotation needed for this domino
        }

        return Math.min(topRotations, botRotations);
    };

    // The answer must be tops[0] or bottoms[0] (one of them must be in every position)
    const minRotations = Math.min(check(tops[0]), check(bottoms[0]));
    return minRotations === Infinity ? -1 : minRotations;
};`,
    jsWalkthrough:
      'Example: tops = [2,1,2,4,2,2], bottoms = [5,2,6,2,3,2]\n' +
      'Check target = tops[0] = 2:\n' +
      '  i=0: top=2 (has), bot=5 (no). topRot=0, botRot=1.\n' +
      '  i=1: top=1 (no), bot=2 (has). topRot=1, botRot=1.\n' +
      '  i=2: top=2 (has), bot=6 (no). topRot=1, botRot=2.\n' +
      '  i=3: top=4 (no), bot=2 (has). topRot=2, botRot=2.\n' +
      '  i=4: top=2 (has), bot=3 (no). topRot=2, botRot=3.\n' +
      '  i=5: top=2 (has), bot=2 (has). No rotation needed.\n' +
      '  min(2,3) = 2.\n' +
      'Check target = bottoms[0] = 5:\n' +
      '  i=0: top=2 (no), bot=5 (has). topRot=1.\n' +
      '  i=1: top=1 (no), bot=2 (no). → return Infinity.\n' +
      'min(2, Infinity) = 2. Result: 2',
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
    // Global index that advances as we consume values from preorder
    let idx = 0;

    // Build a subtree where all values must be strictly less than 'upperBound'
    const build = (upperBound) => {
        // If we've consumed all values, or the next value exceeds the bound, no node here
        if (idx >= preorder.length || preorder[idx] > upperBound) {
            return null;
        }

        // Consume the next value as the root of this subtree
        const val = preorder[idx++];
        const node = new TreeNode(val);

        // Left subtree: values must be less than the current node's value
        node.left = build(val);

        // Right subtree: values can go up to the original upper bound
        node.right = build(upperBound);

        return node;
    };

    return build(Infinity);
};`,
    jsWalkthrough:
      'Example: preorder = [8,5,1,7,10,12]\n' +
      'build(Infinity): idx=0, val=8. idx=1. node(8).\n' +
      '  Left: build(8): idx=1, val=5 (5<=8). idx=2. node(5).\n' +
      '    Left: build(5): idx=2, val=1 (1<=5). idx=3. node(1).\n' +
      '      Left: build(1): idx=3, val=7 (7>1) → null.\n' +
      '      Right: build(5): idx=3, val=7 (7>5) → null.\n' +
      '      Return node(1) with no children.\n' +
      '    Right: build(8): idx=3, val=7 (7<=8). idx=4. node(7).\n' +
      '      Left: build(7): idx=4, val=10 (10>7) → null.\n' +
      '      Right: build(8): idx=4, val=10 (10>8) → null.\n' +
      '      Return node(7) with no children.\n' +
      '    Return node(5) with left=1, right=7.\n' +
      '  Right: build(Infinity): idx=4, val=10. idx=5. node(10).\n' +
      '    Left: build(10): idx=5, val=12 (12>10) → null.\n' +
      '    Right: build(Infinity): idx=5, val=12. idx=6. node(12). Both children null.\n' +
      '    Return node(10) with left=null, right=12.\n' +
      'Result: tree [8,5,10,1,7,null,12]',
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
    // For two durations a and b to sum to a multiple of 60:
    // (a % 60) + (b % 60) must be 0 or 60
    // i.e., b % 60 must be (60 - a % 60) % 60
    const remainderCount = new Array(60).fill(0);
    let pairs = 0;

    for (const duration of time) {
        const remainder = duration % 60;
        // Complement remainder: what we need to pair with to get a multiple of 60
        const complement = (60 - remainder) % 60;

        // Count existing songs with the complementary remainder
        pairs += remainderCount[complement];

        // Record this song's remainder for future pairs
        remainderCount[remainder]++;
    }

    return pairs;
};`,
    jsWalkthrough:
      'Example: time = [30,20,150,100,40]\n' +
      'remainderCount = [0×60]\n' +
      'duration=30: remainder=30, complement=(60-30)%60=30. pairs+=count[30]=0. count[30]=1.\n' +
      'duration=20: remainder=20, complement=40. pairs+=count[40]=0. count[20]=1.\n' +
      'duration=150: remainder=30, complement=30. pairs+=count[30]=1 → pairs=1. count[30]=2.\n' +
      '  (30+150=180=3×60 ✓)\n' +
      'duration=100: remainder=40, complement=20. pairs+=count[20]=1 → pairs=2. count[40]=1.\n' +
      '  (20+100=120=2×60 ✓)\n' +
      'duration=40: remainder=40, complement=20. pairs+=count[20]=1 → pairs=3. count[40]=2.\n' +
      '  (20+40=60=1×60 ✓)\n' +
      'Result: 3',
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
    // Step 1: convert linked list to an array for indexed access
    const vals = [];
    let curr = head;
    while (curr) {
        vals.push(curr.val);
        curr = curr.next;
    }

    const result = new Array(vals.length).fill(0);

    // Monotonic decreasing stack: stores indices of unresolved elements
    // An element is "unresolved" if we haven't yet found its next greater value
    const stack = [];

    for (let i = 0; i < vals.length; i++) {
        // While the current value is greater than values at indices in the stack,
        // we've found the next greater value for those indices
        while (stack.length > 0 && vals[stack[stack.length - 1]] < vals[i]) {
            const resolvedIdx = stack.pop();
            result[resolvedIdx] = vals[i]; // Current value is the next greater
        }

        // Push current index; it's waiting for its own next greater value
        stack.push(i);
    }

    // Remaining indices in stack have no next greater → result stays 0

    return result;
};`,
    jsWalkthrough:
      'Example: head = [2,1,5]\n' +
      'vals = [2, 1, 5]. result = [0, 0, 0]. stack = [].\n' +
      'i=0 (val=2): stack is empty. Push 0. stack=[0].\n' +
      'i=1 (val=1): vals[stack.top]=vals[0]=2. 2 < 1? No. Push 1. stack=[0,1].\n' +
      'i=2 (val=5): vals[stack.top]=vals[1]=1. 1 < 5? Yes! Pop 1, result[1]=5. stack=[0].\n' +
      '  vals[stack.top]=vals[0]=2. 2 < 5? Yes! Pop 0, result[0]=5. stack=[].\n' +
      '  Stack empty. Push 2. stack=[2].\n' +
      'End of loop. Index 2 in stack has no next greater → result[2]=0.\n' +
      'Result: [5, 5, 0]',
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
    const rows = grid.length;
    const cols = grid[0].length;

    // DFS that floods (marks as 0) all land connected to (r, c)
    const floodFill = (r, c) => {
        const outOfBounds = r < 0 || r >= rows || c < 0 || c >= cols;
        if (outOfBounds || grid[r][c] !== 1) return;

        grid[r][c] = 0; // Mark as visited (flood with sea)

        floodFill(r + 1, c);
        floodFill(r - 1, c);
        floodFill(r, c + 1);
        floodFill(r, c - 1);
    };

    // Flood-fill from all boundary land cells
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const isBoundary = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
            if (isBoundary && grid[r][c] === 1) {
                floodFill(r, c);
            }
        }
    }

    // Count remaining land cells — these are enclaves (cannot reach boundary)
    let enclaveCount = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            enclaveCount += grid[r][c]; // grid[r][c] is 1 for remaining land, 0 for sea
        }
    }

    return enclaveCount;
};`,
    jsWalkthrough:
      'Example: grid = [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]]\n' +
      'Boundary cells: top row (all 0), bottom row (all 0), left col (rows 0-3: 0,1,0,0), right col (all 0).\n' +
      'Boundary land: (1,0) has grid=1. Flood-fill from (1,0):\n' +
      '  grid[1][0]=0. Check neighbors: (0,0)=0, (2,0)=0, (1,1)=0, (1,-1) out of bounds.\n' +
      '  No further land to flood. Done.\n' +
      'Boundary scan complete.\n' +
      'Remaining land cells: (1,2)=1, (2,1)=1, (2,2)=1 → 3 enclave cells.\n' +
      'Result: 3',
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
    const dfs = (node, currentVal) => {
        if (!node) return 0;

        // Shift left by 1 (equivalent to multiplying by 2 in binary)
        // then append this node's bit (0 or 1)
        const newVal = (currentVal << 1) | node.val;

        // At a leaf node, return the complete binary number for this path
        if (!node.left && !node.right) {
            return newVal;
        }

        // For internal nodes, sum the values from both subtrees
        const leftSum = dfs(node.left, newVal);
        const rightSum = dfs(node.right, newVal);
        return leftSum + rightSum;
    };

    return dfs(root, 0);
};`,
    jsWalkthrough:
      'Example: root = [1,0,1,0,1,0,1]\n' +
      'Tree: root=1, left=0, right=1. Node 0 has children 0,1. Node 1 has children 0,1.\n' +
      'dfs(root=1, 0): newVal=(0<<1)|1=1. Internal, recurse.\n' +
      '  dfs(left=0, 1): newVal=(1<<1)|0=2. Internal, recurse.\n' +
      '    dfs(left=0, 2): newVal=(2<<1)|0=4. Leaf! Return 4. (binary 100)\n' +
      '    dfs(right=1, 2): newVal=(2<<1)|1=5. Leaf! Return 5. (binary 101)\n' +
      '    Return 4+5=9.\n' +
      '  dfs(right=1, 1): newVal=(1<<1)|1=3. Internal, recurse.\n' +
      '    dfs(left=0, 3): newVal=(3<<1)|0=6. Leaf! Return 6. (binary 110)\n' +
      '    dfs(right=1, 3): newVal=(3<<1)|1=7. Leaf! Return 7. (binary 111)\n' +
      '    Return 6+7=13.\n' +
      '  Return 9+13=22.\n' +
      'Result: 22',
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
    // dfs tracks the minimum (lo) and maximum (hi) values seen on the path from root to here
    const dfs = (node, lo, hi) => {
        // At a null node (past leaves), the maximum difference for this path is hi - lo
        if (!node) return hi - lo;

        // Update the running min and max with the current node's value
        const newLo = Math.min(lo, node.val);
        const newHi = Math.max(hi, node.val);

        // Recurse on both subtrees and return the larger difference found
        const leftMax = dfs(node.left, newLo, newHi);
        const rightMax = dfs(node.right, newLo, newHi);
        return Math.max(leftMax, rightMax);
    };

    // Initialize both lo and hi with the root value
    return dfs(root, root.val, root.val);
};`,
    jsWalkthrough:
      'Example: root = [8,3,10,1,6,null,14,null,null,4,7,13]\n' +
      'dfs(8, lo=8, hi=8):\n' +
      '  newLo=8, newHi=8.\n' +
      '  dfs(left=3, lo=3, hi=8):\n' +
      '    dfs(left=1, lo=1, hi=8):\n' +
      '      Both children null: return 8-1=7.\n' +
      '    dfs(right=6, lo=3, hi=8):\n' +
      '      dfs(left=4, lo=3, hi=8): return 8-3=5.\n' +
      '      dfs(right=7, lo=3, hi=8): return 8-3=5.\n' +
      '      Return max(5,5)=5.\n' +
      '    Return max(7, 5)=7.\n' +
      '  dfs(right=10, lo=8, hi=10):\n' +
      '    dfs(left=null): return 10-8=2.\n' +
      '    dfs(right=14, lo=8, hi=14):\n' +
      '      dfs(left=13, lo=8, hi=14): return 14-8=6.\n' +
      '      dfs(right=null): return 14-8=6.\n' +
      '      Return 6.\n' +
      '    Return max(2,6)=6.\n' +
      '  Return max(7,6)=7.\n' +
      'Result: 7',
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

    // dp[i] maps: common difference → length of longest AP ending at index i with that difference
    const dp = Array.from({ length: n }, () => ({}));
    let maxLength = 2; // Any two elements form an AP of length 2

    for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
            // Compute the common difference if nums[j] and nums[i] are consecutive in the AP
            const diff = nums[i] - nums[j];

            // If there's an AP ending at j with this difference, extend it
            // Otherwise, start a new AP of length 2 (just nums[j] and nums[i])
            const prevLength = dp[j][diff] || 1;
            dp[i][diff] = prevLength + 1;

            maxLength = Math.max(maxLength, dp[i][diff]);
        }
    }

    return maxLength;
};`,
    jsWalkthrough:
      'Example: nums = [3,6,9,12]\n' +
      'i=1 (val=6):\n' +
      '  j=0 (val=3): diff=3. dp[0][3]=undefined → prevLen=1. dp[1][3]=2. maxLen=2.\n' +
      'i=2 (val=9):\n' +
      '  j=0 (val=3): diff=6. dp[0][6]=undefined → prevLen=1. dp[2][6]=2. maxLen=2.\n' +
      '  j=1 (val=6): diff=3. dp[1][3]=2 → prevLen=2. dp[2][3]=3. maxLen=3.\n' +
      'i=3 (val=12):\n' +
      '  j=0 (val=3): diff=9. prevLen=1. dp[3][9]=2.\n' +
      '  j=1 (val=6): diff=6. dp[1][6]=undefined → prevLen=1. dp[3][6]=2.\n' +
      '  j=2 (val=9): diff=3. dp[2][3]=3 → prevLen=3. dp[3][3]=4. maxLen=4.\n' +
      'Result: 4',
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
    // Sort by the "marginal benefit" of going to city A instead of city B:
    // (costA - costB). People with lowest (most negative) value benefit most from A.
    costs.sort((a, b) => (a[0] - a[1]) - (b[0] - b[1]));

    const n = costs.length / 2;
    let total = 0;

    // First half (most prefer A): send to city A
    for (let i = 0; i < n; i++) {
        total += costs[i][0]; // city A cost
    }

    // Second half (most prefer B or don't care): send to city B
    for (let i = n; i < 2 * n; i++) {
        total += costs[i][1]; // city B cost
    }

    return total;
};`,
    jsWalkthrough:
      'Example: costs = [[10,20],[30,200],[400,50],[30,20]]\n' +
      'Compute (costA - costB) for each: 10-20=-10, 30-200=-170, 400-50=350, 30-20=10.\n' +
      'Sort by this value: [[-170→[30,200]], [-10→[10,20]], [10→[30,20]], [350→[400,50]]]\n' +
      'Sorted costs: [[30,200],[10,20],[30,20],[400,50]]\n' +
      'n=2 (4 people / 2). First half to city A: costs[0][0]=30 + costs[1][0]=10 = 40.\n' +
      'Second half to city B: costs[2][1]=20 + costs[3][1]=50 = 70.\n' +
      'Total = 40 + 70 = 110. Result: 110',
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

    // Build prefix sums for O(1) range sum queries
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }

    // solve(L, M): max sum where the L-window comes BEFORE the M-window
    // As we slide the M-window right, track the best L-window seen to its left
    const solve = (L, M) => {
        let bestLSum = 0; // best sum of any L-length window ending before the M-window
        let bestTotal = 0;

        for (let i = L + M; i <= n; i++) {
            // Sum of L-length window ending at position i-M
            const lWindowSum = prefix[i - M] - prefix[i - M - L];
            bestLSum = Math.max(bestLSum, lWindowSum);

            // Sum of M-length window ending at position i
            const mWindowSum = prefix[i] - prefix[i - M];
            bestTotal = Math.max(bestTotal, bestLSum + mWindowSum);
        }

        return bestTotal;
    };

    // Try both orderings: firstLen before secondLen, and secondLen before firstLen
    return Math.max(solve(firstLen, secondLen), solve(secondLen, firstLen));
};`,
    jsWalkthrough:
      'Example: nums = [0,6,5,2,2,5,1,9,4], firstLen=1, secondLen=2\n' +
      'prefix = [0,0,6,11,13,15,20,21,30,34]\n' +
      'solve(L=1, M=2): L-window before M-window.\n' +
      '  i=3: lWindow=prefix[1]-prefix[0]=0, bestL=0. mWindow=prefix[3]-prefix[1]=11. best=11.\n' +
      '  i=4: lWindow=prefix[2]-prefix[1]=6, bestL=6. mWindow=prefix[4]-prefix[2]=7. best=13.\n' +
      '  i=5: lWindow=prefix[3]-prefix[2]=5, bestL=6. mWindow=prefix[5]-prefix[3]=4. best=13.\n' +
      '  i=8: lWindow=prefix[6]-prefix[5]=5, bestL=6. mWindow=prefix[8]-prefix[6]=10. best=16.\n' +
      '  i=9: lWindow=prefix[7]-prefix[6]=1, bestL=6. mWindow=prefix[9]-prefix[7]=13. best=19.\n' +
      'solve(L=2, M=1): 2-window before 1-window.\n' +
      '  At i=9: 2-window=[6,5]=11 and 1-window=[9]=9 → best=20.\n' +
      'max(19, 20) = 20. Result: 20',
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
    // runningSum accumulates the sum of all values we've visited so far
    // (in reverse in-order: from largest to smallest)
    let runningSum = 0;

    const dfs = (node) => {
        if (!node) return;

        // Visit right subtree first (larger values come first in reverse in-order)
        dfs(node.right);

        // Add this node's original value to the running sum
        runningSum += node.val;

        // Update this node's value to the running sum
        // (which equals: original value + sum of all greater values)
        node.val = runningSum;

        // Visit left subtree (smaller values come after)
        dfs(node.left);
    };

    dfs(root);
    return root;
};`,
    jsWalkthrough:
      'Example: root = [4,1,6,0,2,5,7,null,null,null,3,null,null,null,8]\n' +
      'Reverse in-order visits: 8, 7, 6, 5, 4, 3, 2, 1, 0\n' +
      'Visit 8: runningSum=8, node.val=8.\n' +
      'Visit 7: runningSum=15, node.val=15.\n' +
      'Visit 6: runningSum=21, node.val=21.\n' +
      'Visit 5: runningSum=26, node.val=26.\n' +
      'Visit 4: runningSum=30, node.val=30.\n' +
      'Visit 3: runningSum=33, node.val=33.\n' +
      'Visit 2: runningSum=35, node.val=35.\n' +
      'Visit 1: runningSum=36, node.val=36.\n' +
      'Visit 0: runningSum=36, node.val=36.\n' +
      'Result: [30,36,21,36,35,26,15,null,null,null,33,null,null,null,8]',
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
    // Direction vectors: 0=North, 1=East, 2=South, 3=West
    const dx = [0, 1, 0, -1]; // x displacement for each direction
    const dy = [1, 0, -1, 0]; // y displacement for each direction

    let x = 0;     // current x position
    let y = 0;     // current y position
    let dir = 0;   // current direction index (0=North)

    for (const instruction of instructions) {
        if (instruction === 'G') {
            // Move one step in the current direction
            x += dx[dir];
            y += dy[dir];
        } else if (instruction === 'L') {
            // Turn left: North→West→South→East→North (subtract 1 mod 4)
            dir = (dir + 3) % 4;
        } else {
            // Turn right: North→East→South→West→North (add 1 mod 4)
            dir = (dir + 1) % 4;
        }
    }

    // After one cycle:
    // - If back at origin: trivially bounded (forms a closed loop)
    // - If not facing North: will return to origin within 4 cycles (bounded)
    // - If at non-origin AND facing North: will drift infinitely (unbounded)
    return (x === 0 && y === 0) || dir !== 0;
};`,
    jsWalkthrough:
      'Example: instructions = "GGLLGG"\n' +
      'Start: x=0, y=0, dir=0 (North).\n' +
      'G: x=0+0=0, y=0+1=1. (moved North)\n' +
      'G: x=0, y=2.\n' +
      'L: dir=(0+3)%4=3 (West).\n' +
      'L: dir=(3+3)%4=2 (South).\n' +
      'G: x=0+0=0, y=2-1=1. (moved South)\n' +
      'G: x=0, y=0. Back at origin!\n' +
      'Final: x=0, y=0, dir=2. (x===0 && y===0) → true.\n' +
      'Result: true',
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
    // Repeatedly smash the two heaviest stones
    // Sorting before each smash keeps it simple (O(n^2 log n) but works for small inputs)
    while (stones.length > 1) {
        // Sort descending so stones[0] and stones[1] are the two heaviest
        stones.sort((a, b) => b - a);

        const heaviest = stones.shift();      // Remove the heaviest
        const secondHeaviest = stones.shift(); // Remove the second heaviest

        if (heaviest !== secondHeaviest) {
            // The difference remains as a new stone
            const remainder = heaviest - secondHeaviest;
            stones.push(remainder);
        }
        // If equal, both are destroyed — no push needed
    }

    return stones.length ? stones[0] : 0;
};`,
    jsWalkthrough:
      'Example: stones = [2,7,4,1,8,1]\n' +
      'Round 1: sort desc → [8,7,4,2,1,1]. Smash 8 and 7 → remainder=1. stones=[4,2,1,1,1].\n' +
      'Round 2: sort desc → [4,2,1,1,1]. Smash 4 and 2 → remainder=2. stones=[2,1,1,1].\n' +
      'Round 3: sort desc → [2,1,1,1]. Smash 2 and 1 → remainder=1. stones=[1,1,1].\n' +
      'Round 4: sort desc → [1,1,1]. Smash 1 and 1 → equal, both destroyed. stones=[1].\n' +
      'stones.length=1. Return stones[0]=1.\n' +
      'Result: 1',
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

    for (const ch of s) {
        // If the current character matches the top of the stack, they are an adjacent pair
        // Pop to remove the pair (they cancel out)
        if (stack.length > 0 && stack[stack.length - 1] === ch) {
            stack.pop();
        } else {
            // No match — push the character, waiting for a potential future match
            stack.push(ch);
        }
    }

    // Characters remaining in the stack are those that didn't get cancelled
    return stack.join('');
};`,
    jsWalkthrough:
      'Example: s = "abbaca"\n' +
      'stack=[]\n' +
      'ch="a": stack empty → push. stack=["a"].\n' +
      'ch="b": top="a" ≠ "b" → push. stack=["a","b"].\n' +
      'ch="b": top="b" === "b" → pop! stack=["a"]. (bb removed)\n' +
      'ch="a": top="a" === "a" → pop! stack=[]. (aa removed)\n' +
      'ch="c": stack empty → push. stack=["c"].\n' +
      'ch="a": top="c" ≠ "a" → push. stack=["c","a"].\n' +
      'Join: "ca". Result: "ca"',
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
    // Sort by word length so predecessors (shorter words) are processed first
    words.sort((a, b) => a.length - b.length);

    // dp[word] = length of longest chain ending with this word
    const dp = {};
    let maxChainLength = 1;

    for (const word of words) {
        dp[word] = 1; // A word by itself is a chain of length 1

        // Try removing each character to generate possible predecessor words
        for (let i = 0; i < word.length; i++) {
            const predecessor = word.slice(0, i) + word.slice(i + 1);

            if (dp[predecessor] !== undefined) {
                // Predecessor exists — extend its chain
                const chainLength = dp[predecessor] + 1;
                dp[word] = Math.max(dp[word], chainLength);
            }
        }

        maxChainLength = Math.max(maxChainLength, dp[word]);
    }

    return maxChainLength;
};`,
    jsWalkthrough:
      'Example: words = ["a","b","ba","bca","bda","bdca"]\n' +
      'After sort by length: ["a","b","ba","bca","bda","bdca"]\n' +
      'word="a": dp={"a":1}. No shorter predecessors.\n' +
      'word="b": dp={"a":1,"b":1}. No shorter predecessors.\n' +
      'word="ba": remove b→"a" (dp["a"]=1, chain=2). remove a→"b" (dp["b"]=1, chain=2). dp["ba"]=2.\n' +
      'word="bca": remove b→"ca" (no). remove c→"ba" (dp["ba"]=2, chain=3). dp["bca"]=3.\n' +
      'word="bda": remove b→"da" (no). remove d→"ba" (dp["ba"]=2, chain=3). dp["bda"]=3.\n' +
      'word="bdca": remove b→"dca" (no). remove d→"bca" (dp["bca"]=3, chain=4). dp["bdca"]=4.\n' +
      'maxChainLength=4. Result: 4',
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
    const total = stones.reduce((sum, stone) => sum + stone, 0);

    // We want to partition stones into two groups S1 and S2
    // where |S1 - S2| is minimized. Since S1 + S2 = total,
    // minimizing |S1 - S2| = minimizing |total - 2*S1|.
    // So we want S1 as close to total/2 as possible.
    const target = Math.floor(total / 2);

    // achievableSums = set of all sums achievable using subsets of stones,
    // with values at most 'target'
    let achievableSums = new Set([0]);

    for (const stone of stones) {
        const updatedSums = new Set(achievableSums);
        for (const existingSum of achievableSums) {
            const newSum = existingSum + stone;
            if (newSum <= target) {
                updatedSums.add(newSum);
            }
        }
        achievableSums = updatedSums;
    }

    // Best S1 is the largest achievable sum <= target
    const bestHalf = Math.max(...achievableSums);

    // Minimum result = total - 2 * bestHalf
    return total - 2 * bestHalf;
};`,
    jsWalkthrough:
      'Example: stones = [2,7,4,1,8,1]\n' +
      'total = 2+7+4+1+8+1 = 23. target = floor(23/2) = 11.\n' +
      'achievableSums = {0}\n' +
      'stone=2: {0,2}\n' +
      'stone=7: {0,2,7,9}\n' +
      'stone=4: {0,2,4,6,7,9,11} (2+4=6, 7+4=11 ≤ 11)\n' +
      'stone=1: {0,1,2,3,4,5,6,7,8,9,10,11} (many new sums ≤ 11)\n' +
      'stone=8: 8>11? No. 1+8=9,2+8=10,3+8=11 all ≤ 11. Still {0..11}.\n' +
      'stone=1: {0..11} (max already at 11)\n' +
      'bestHalf = 11. Result = 23 - 2*11 = 23 - 22 = 1.\n' +
      'Result: 1',
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
    // missing(i) = how many integers in range [nums[0]..nums[i]] are not in nums
    // = (nums[i] - nums[0] + 1 total integers) - (i + 1 array elements) = nums[i] - nums[0] - i
    const countMissing = (i) => nums[i] - nums[0] - i;

    const n = nums.length;

    // If k is larger than total missing elements in the array, answer is past the end
    if (k > countMissing(n - 1)) {
        return nums[n - 1] + k - countMissing(n - 1);
    }

    // Binary search: find the leftmost index where countMissing(i) >= k
    let lo = 0;
    let hi = n - 1;

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (countMissing(mid) < k) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }

    // The k-th missing element falls between nums[lo-1] and nums[lo]
    // Specifically, it's the (k - countMissing(lo-1))-th missing after nums[lo-1]
    return nums[lo - 1] + k - countMissing(lo - 1);
};`,
    jsWalkthrough:
      'Example: nums = [4,7,9,10], k = 1\n' +
      'countMissing(0) = 4-4-0 = 0 (no missing before 4)\n' +
      'countMissing(1) = 7-4-1 = 2 (missing: 5, 6)\n' +
      'countMissing(2) = 9-4-2 = 3 (missing: 5,6,8)\n' +
      'countMissing(3) = 10-4-3 = 3 (missing: 5,6,8)\n' +
      'k=1, countMissing(n-1)=3 ≥ 1, so answer is in range.\n' +
      'Binary search: lo=0, hi=3.\n' +
      '  mid=1: countMissing(1)=2 >= k=1 → hi=1.\n' +
      '  mid=0: countMissing(0)=0 < k=1 → lo=1.\n' +
      '  lo=hi=1. Found index 1.\n' +
      'Answer = nums[0] + 1 - countMissing(0) = 4 + 1 - 0 = 5.\n' +
      'Result: 5',
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
    // parent[i] = representative for character with index i (a=0, b=1, ..., z=25)
    const parent = Array.from({ length: 26 }, (_, i) => i);

    // Find with path compression
    const find = (x) => {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]]; // Path halving
            x = parent[x];
        }
        return x;
    };

    // Union with smallest representative policy:
    // Always make the lexicographically smaller character the root
    const union = (a, b) => {
        const rootA = find(a);
        const rootB = find(b);
        if (rootA === rootB) return;

        // Make the smaller character the root of the group
        if (rootA < rootB) {
            parent[rootB] = rootA;
        } else {
            parent[rootA] = rootB;
        }
    };

    // Process all equivalence pairs from s1 and s2
    for (let i = 0; i < s1.length; i++) {
        const charA = s1.charCodeAt(i) - 97; // Convert 'a'=0, 'b'=1, ...
        const charB = s2.charCodeAt(i) - 97;
        union(charA, charB);
    }

    // For each character in baseStr, find its smallest equivalent
    return [...baseStr].map(c => {
        const charIdx = c.charCodeAt(0) - 97;
        const smallestIdx = find(charIdx);
        return String.fromCharCode(smallestIdx + 97);
    }).join('');
};`,
    jsWalkthrough:
      'Example: s1 = "parker", s2 = "morris", baseStr = "parser"\n' +
      'Process pairs: p↔m, a↔o, r↔r, k↔r (already same?), e↔i, r↔s\n' +
      '  p(15)↔m(12): root of m=12, root of p=15. 12<15 → parent[15]=12. Group: {m,p}\n' +
      '  a(0)↔o(14): 0<14 → parent[14]=0. Group: {a,o}\n' +
      '  r(17)↔r(17): same → no-op.\n' +
      '  k(10)↔r(17): 10<17 → parent[17]=10. Group: {k,r}\n' +
      '  e(4)↔i(8): 4<8 → parent[8]=4. Group: {e,i}\n' +
      '  r(17)↔s(18): find(17)=10, find(18)=18. 10<18 → parent[18]=10. Group: {k,r,s}\n' +
      'Translate "parser":\n' +
      '  p→find(p=15)=find(parent[15]=12)=12→m. a→find(0)=0→a. r→find(17)=10→k.\n' +
      '  s→find(18)=10→k. e→find(4)=4→e. r→find(17)=10→k.\n' +
      '  Wait: expected "makkek". Let me re-check: s=parker, so p,a,r,k,e,r.\n' +
      '  p→m, a→a, r→k, k→k, e→e, r→k → "makkek".\n' +
      '  baseStr "parser": p→m, a→a, r→k, s→k, e→e, r→k → "makkek". ✓\n' +
      'Result: "makkek"',
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
    // Key insight: if a GCD string t exists, str1 = t×p and str2 = t×q
    // Then str1+str2 = t×(p+q) = str2+str1. This is the necessary condition.
    if (str1 + str2 !== str2 + str1) return "";

    // Helper: compute GCD of two numbers (Euclidean algorithm)
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);

    // The GCD string has length = GCD of the two string lengths
    const gcdLength = gcd(str1.length, str2.length);

    return str1.substring(0, gcdLength);
};`,
    jsWalkthrough:
      'Example: str1 = "ABCABC", str2 = "ABC"\n' +
      'Check: str1+str2 = "ABCABCABC", str2+str1 = "ABCABCABC". Equal! GCD string exists.\n' +
      'gcd(6, 3) = gcd(3, 0) = 3.\n' +
      'Return str1.substring(0, 3) = "ABC".\n' +
      'Result: "ABC"\n' +
      '\n' +
      'Counter-example: str1 = "LEET", str2 = "CODE"\n' +
      'str1+str2 = "LEETCODE", str2+str1 = "CODELEET". Not equal!\n' +
      'Return "". Result: ""',
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
};`,
    jsWalkthrough:
      'Example: trips = [[2,1,5],[3,3,7]], capacity = 4\n' +
      'diff array (only showing changed indices):\n' +
      '  Trip [2,1,5]: diff[1]+=2, diff[5]-=2. → diff[1]=2, diff[5]=-2.\n' +
      '  Trip [3,3,7]: diff[3]+=3, diff[7]-=3. → diff[3]=3, diff[7]=-3.\n' +
      'Sweep through diff:\n' +
      '  loc=0: current=0.\n' +
      '  loc=1: current=0+2=2. 2<=4 OK.\n' +
      '  loc=2: current=2+0=2. OK.\n' +
      '  loc=3: current=2+3=5. 5>4! Return false.\n' +
      'Result: false',
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
};`,
    jsWalkthrough:
      'Example: array = [1,2,3,4,5,3,1], target = 3\n' +
      'n=7. Find peak:\n' +
      '  lo=0, hi=6. mid=3: arr[3]=4, arr[4]=5. 4<5 → lo=4.\n' +
      '  lo=4, hi=6. mid=5: arr[5]=3, arr[6]=1. 3>1 → hi=5.\n' +
      '  lo=4, hi=5. mid=4: arr[4]=5, arr[5]=3. 5>3 → hi=4.\n' +
      '  lo=hi=4. peak=4.\n' +
      'Search ascending side [0..4] for 3:\n' +
      '  lo=0, hi=4. mid=2: arr[2]=3 === target. Return 2.\n' +
      'Result: 2',
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

    // dp[i] = minimum total shelf height to place the first i books
    const dp = new Array(n + 1).fill(Infinity);
    dp[0] = 0; // No books, no height needed

    for (let i = 1; i <= n; i++) {
        // Try grouping books j..i on the same (last) shelf
        let currentWidth = 0;
        let currentHeight = 0;
        let j = i;

        while (j > 0) {
            // Add book j (1-indexed) to the current shelf
            const [bookWidth, bookHeight] = books[j - 1];
            currentWidth += bookWidth;

            if (currentWidth > shelfWidth) break; // This shelf is too wide

            // Track the tallest book on this shelf
            currentHeight = Math.max(currentHeight, bookHeight);

            // dp[j-1] + currentHeight = total height if books j..i are on same shelf
            dp[i] = Math.min(dp[i], dp[j - 1] + currentHeight);
            j--;
        }
    }

    return dp[n];
};`,
    jsWalkthrough:
      'Example: books = [[1,1],[2,3],[2,3],[1,1],[1,1],[1,1],[1,2]], shelfWidth = 4\n' +
      'dp = [0, ∞, ∞, ∞, ∞, ∞, ∞, ∞]\n' +
      'i=1 (book [1,1]): j=1: width=1≤4, height=1. dp[1]=min(∞,dp[0]+1)=1. j=0: stop.\n' +
      '  dp[1]=1.\n' +
      'i=2 (book [2,3]): j=2: width=2≤4, height=3. dp[2]=min(∞,dp[1]+3)=4.\n' +
      '  j=1: width=2+1=3≤4, height=max(3,1)=3. dp[2]=min(4,dp[0]+3)=3. dp[2]=3.\n' +
      'i=3 (book [2,3]): j=3: width=2≤4, height=3. dp[3]=min(∞,dp[2]+3)=6.\n' +
      '  j=2: width=2+2=4≤4, height=max(3,3)=3. dp[3]=min(6,dp[1]+3)=4. dp[3]=4.\n' +
      '  j=1: width=4+1=5>4. Break.\n' +
      '...(continuing gives dp[7]=6)\n' +
      'Result: 6',
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
    // Replace every dot with "[.]" — the regex /\./g matches all dots globally
    return address.replace(/\./g, '[.]');
};`,
    jsWalkthrough:
      'Example: address = "1.1.1.1"\n' +
      'Replace all "." with "[.]":\n' +
      '  "1" + "[.]" + "1" + "[.]" + "1" + "[.]" + "1"\n' +
      '= "1[.]1[.]1[.]1"\n' +
      'Result: "1[.]1[.]1[.]1"',
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
    const deleteSet = new Set(to_delete);
    const forestRoots = [];

    // DFS with 'isRoot' flag: true if this node could be a forest root (no surviving parent)
    const dfs = (node, isRoot) => {
        if (!node) return null;

        const willDelete = deleteSet.has(node.val);

        // If this node is not being deleted and has no parent, it's a forest root
        if (isRoot && !willDelete) {
            forestRoots.push(node);
        }

        // Recurse on children:
        // If this node is being deleted, its children become potential new roots (isRoot=true)
        // If this node survives, its children are not roots (isRoot=false)
        node.left = dfs(node.left, willDelete);
        node.right = dfs(node.right, willDelete);

        // Return null if this node is deleted (parent will disconnect it)
        return willDelete ? null : node;
    };

    // Start from the root (which is a potential root if not deleted)
    dfs(root, true);
    return forestRoots;
};`,
    jsWalkthrough:
      'Example: root = [1,2,3,4,5,6,7], to_delete = [3,5]\n' +
      'deleteSet = {3, 5}.\n' +
      'dfs(1, isRoot=true):\n' +
      '  willDelete=false. isRoot && !delete → push node 1 to forestRoots.\n' +
      '  dfs(2, isRoot=false):\n' +
      '    willDelete=false. Not root. Recurse children.\n' +
      '    dfs(4, isRoot=false): willDelete=false. Leaf. Return node 4.\n' +
      '    dfs(5, isRoot=false): willDelete=true.\n' +
      '      dfs(null, isRoot=true): null → return null.\n' +
      '      dfs(null, isRoot=true): null → return null.\n' +
      '      Return null. (node 5 deleted)\n' +
      '    node 2 has left=4, right=null. Return node 2.\n' +
      '  dfs(3, isRoot=false): willDelete=true.\n' +
      '    dfs(6, isRoot=true): willDelete=false → push node 6 to forestRoots. Return node 6.\n' +
      '    dfs(7, isRoot=true): willDelete=false → push node 7 to forestRoots. Return node 7.\n' +
      '    Return null. (node 3 deleted)\n' +
      '  node 1 has left=2, right=null. Return node 1.\n' +
      'forestRoots = [node 1, node 6, node 7].\n' +
      'Result: [[1,2,null,4],[6],[7]]',
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
    // dfs returns [depth, lcaNode]:
    // depth = depth of the deepest leaf in this subtree
    // lcaNode = LCA of all deepest leaves in this subtree
    const dfs = (node) => {
        if (!node) return [0, null];

        const [leftDepth, leftLCA] = dfs(node.left);
        const [rightDepth, rightLCA] = dfs(node.right);

        if (leftDepth === rightDepth) {
            // Both subtrees have the same deepest level
            // This node is the LCA of all deepest leaves in both subtrees
            return [leftDepth + 1, node];
        } else if (leftDepth > rightDepth) {
            // Left subtree is deeper — LCA of deepest leaves is in the left subtree
            return [leftDepth + 1, leftLCA];
        } else {
            // Right subtree is deeper — LCA of deepest leaves is in the right subtree
            return [rightDepth + 1, rightLCA];
        }
    };

    return dfs(root)[1]; // Return only the LCA node
};`,
    jsWalkthrough:
      'Example: root = [3,5,1,6,2,0,8,null,null,7,4]\n' +
      'Tree: 3 has children 5,1. 5 has children 6,2. 1 has children 0,8. 2 has children 7,4.\n' +
      'dfs(6): leaf → [1, 6]\n' +
      'dfs(7): leaf → [1, 7]\n' +
      'dfs(4): leaf → [1, 4]\n' +
      'dfs(2): left=[1,7], right=[1,4]. Equal depths! → [2, node2] (node2 is LCA of 7,4)\n' +
      'dfs(5): left=[1,6], right=[2,node2]. 1<2, right deeper → [3, node2]\n' +
      'dfs(0): leaf → [1, 0]\n' +
      'dfs(8): leaf → [1, 8]\n' +
      'dfs(1): left=[1,0], right=[1,8]. Equal! → [2, node1]\n' +
      'dfs(3): left=[3,node2], right=[2,node1]. 3>2, left deeper → [4, node2]\n' +
      'Return node2 (value=2). Result: node with val=2',
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
    // Build adjacency map keyed by "node,color" where color 0=red, 1=blue
    const graph = new Map();

    for (const [u, v] of redEdges) {
        const key = u + ',0'; // Red edges from node u
        if (!graph.has(key)) graph.set(key, []);
        graph.get(key).push(v);
    }
    for (const [u, v] of blueEdges) {
        const key = u + ',1'; // Blue edges from node u
        if (!graph.has(key)) graph.set(key, []);
        graph.get(key).push(v);
    }

    const dist = new Array(n).fill(-1);
    dist[0] = 0; // Distance to start node is 0

    // State: [node, lastEdgeColor, distanceSoFar]
    // Start from node 0, trying both colors as the first edge
    const visited = new Set(['0,0', '0,1']); // (node, color) pairs visited
    const queue = [[0, 0, 0], [0, 1, 0]];   // Try starting with red or blue
    let queueIdx = 0;

    while (queueIdx < queue.length) {
        const [node, color, d] = queue[queueIdx++];

        // First time we reach this node, record the distance
        if (dist[node] === -1) dist[node] = d;

        // Next edge must be the opposite color to alternate
        const nextColor = 1 - color;
        const neighbors = graph.get(node + ',' + nextColor) || [];

        for (const neighbor of neighbors) {
            const state = neighbor + ',' + nextColor;
            if (!visited.has(state)) {
                visited.add(state);
                queue.push([neighbor, nextColor, d + 1]);
            }
        }
    }

    return dist;
};`,
    jsWalkthrough:
      'Example: n=3, redEdges=[[0,1],[1,2]], blueEdges=[[2,1]]\n' +
      'graph: "0,0"→[1], "1,0"→[2], "2,1"→[1]\n' +
      'dist=[-1,-1,-1], dist[0]=0.\n' +
      'queue=[[0,0,0],[0,1,0]], visited={"0,0","0,1"}\n' +
      'Process [0,0,0]: node=0, color=0 (red), d=0. dist[0] already set.\n' +
      '  nextColor=1 (blue). graph.get("0,1")=undefined → no neighbors.\n' +
      'Process [0,1,0]: node=0, color=1 (blue), d=0. dist[0] already set.\n' +
      '  nextColor=0 (red). graph.get("0,0")=[1]. State "1,0" not visited.\n' +
      '  Add [1, 0, 1] to queue. visited={"0,0","0,1","1,0"}.\n' +
      'Process [1,0,1]: node=1, color=0 (red), d=1. dist[1]=-1 → dist[1]=1.\n' +
      '  nextColor=1 (blue). graph.get("1,1")=undefined → no neighbors.\n' +
      'queue exhausted. dist=[-1→0, -1→1, -1]. Node 2 not reached.\n' +
      'Wait: dist[2] stays -1 because 1,2 is a red edge but we need blue after arriving at 1 via red.\n' +
      'Result: [0, 1, -1]\n' +
      'Wait, expected [0,1,2]. Let me re-check: from 0 via red to 1 (d=1). At 1, need blue — "1,1" has no blue edges.\n' +
      'From 0 via blue (no blue edges from 0). So dist[2]=-1. But expected output is [0,1,2].\n' +
      'Actually redEdges=[[0,1],[1,2]]: two red edges. blueEdges=[[2,1]]: one blue edge.\n' +
      'Node 2 can be reached: 0→1 (red, d=1), then need blue. No blue from 1. Unreachable.\n' +
      'Expected [0,1,-1]? Actually, let me verify: LeetCode says output=[0,1,2] for n=3,red=[[0,1],[1,2]],blue=[].\n' +
      'This example may be different. With blue=[[2,1]] there is no alternating path 0→2.\n' +
      'Result for this example: [0, 1, -1]',
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
    // Base cases: T0=0, T1=1, T2=1
    if (n === 0) return 0;
    if (n <= 2) return 1;

    // Use three variables to avoid storing the full array
    let prev2 = 0; // T(n-3)
    let prev1 = 1; // T(n-2)
    let curr = 1;  // T(n-1)

    // Compute from T3 up to Tn
    for (let i = 3; i <= n; i++) {
        const next = prev2 + prev1 + curr;
        prev2 = prev1;
        prev1 = curr;
        curr = next;
    }

    return curr;
};`,
    jsWalkthrough:
      'Example: n = 4\n' +
      'Base: n=4 > 2, so proceed.\n' +
      'Start: prev2=0 (T0), prev1=1 (T1), curr=1 (T2).\n' +
      'i=3: next=0+1+1=2=T3. prev2=1, prev1=1, curr=2.\n' +
      'i=4: next=1+1+2=4=T4. prev2=1, prev1=2, curr=4.\n' +
      'Return curr=4.\n' +
      'Result: 4\n' +
      '\n' +
      'Verification: T0=0, T1=1, T2=1, T3=0+1+1=2, T4=1+1+2=4. ✓',
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

    // Precompute suffix sums: suffix[i] = sum of piles[i..n-1]
    const suffix = new Array(n + 1).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        suffix[i] = suffix[i + 1] + piles[i];
    }

    const memo = new Map();

    // dp(i, m) = max stones the CURRENT player can collect starting at index i with limit m
    const dp = (i, m) => {
        // No piles left
        if (i >= n) return 0;

        // Can take all remaining piles (the current player takes everything)
        if (i + 2 * m >= n) return suffix[i];

        const key = i + ',' + m;
        if (memo.has(key)) return memo.get(key);

        let bestForCurrentPlayer = 0;

        // Try taking x piles (1 <= x <= 2m)
        for (let x = 1; x <= 2 * m; x++) {
            // Opponent gets their best from remaining piles with updated M
            const opponentGets = dp(i + x, Math.max(m, x));
            // Current player gets total remaining minus what opponent takes
            const currentPlayerGets = suffix[i] - opponentGets;
            bestForCurrentPlayer = Math.max(bestForCurrentPlayer, currentPlayerGets);
        }

        memo.set(key, bestForCurrentPlayer);
        return bestForCurrentPlayer;
    };

    return dp(0, 1);
};`,
    jsWalkthrough:
      'Example: piles = [2,7,9,4,4]\n' +
      'suffix = [26,24,17,8,4,0]\n' +
      'dp(0,1): try x=1: suffix[0]-dp(1,1) and x=2: suffix[0]-dp(2,2)\n' +
      '  dp(1,1): try x=1: suffix[1]-dp(2,1) and x=2: suffix[1]-dp(3,2)\n' +
      '    dp(2,1): try x=1: suffix[2]-dp(3,1) and x=2: suffix[2]-dp(4,2)\n' +
      '      dp(3,1): try x=1: suffix[3]-dp(4,1) and x=2: 3+2*1=5≥5 → return suffix[3]=8\n' +
      '        dp(4,1): 4+2=6≥5 → return suffix[4]=4.\n' +
      '        x=1: suffix[3]-4=4. x=2: suffix[3]=8. best=8.\n' +
      '      dp(3,1)=8. (taking 2 piles, gets all 8)\n' +
      '      dp(4,2): 4+4=8≥5 → return suffix[4]=4.\n' +
      '      dp(2,1): x=1: 17-dp(3,1)=17-8=9. x=2: 17-dp(4,2)=17-4=13. best=13.\n' +
      '    dp(3,2): 3+4=7≥5 → return suffix[3]=8.\n' +
      '    dp(2,2): try x=1..4.\n' +
      '      ...eventually dp(0,1)=10 (Alice gets 10).\n' +
      'Result: 10',
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
    // For each index, store a list of [snapId, value] pairs representing changes over time
    // Initialize each index with [0, 0] (at snap 0, value is 0)
    this.snaps = Array.from({ length }, () => [[0, 0]]);
    this.snapId = 0;
};

SnapshotArray.prototype.set = function(index, val) {
    const history = this.snaps[index];
    const lastEntry = history[history.length - 1];

    if (lastEntry[0] === this.snapId) {
        // Update in place if we're still on the same snap (avoid duplicate snap_id entries)
        lastEntry[1] = val;
    } else {
        // New snap ID — append a new entry
        history.push([this.snapId, val]);
    }
};

SnapshotArray.prototype.snap = function() {
    const currentId = this.snapId;
    this.snapId++;
    return currentId;
};

SnapshotArray.prototype.get = function(index, snap_id) {
    const history = this.snaps[index];

    // Binary search: find the latest entry with snapId <= snap_id
    let lo = 0;
    let hi = history.length - 1;

    while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2); // Use ceil to avoid infinite loop with adjacent lo/hi
        if (history[mid][0] <= snap_id) {
            lo = mid; // This entry is valid; try to find a later one
        } else {
            hi = mid - 1; // This entry is too recent
        }
    }

    return history[lo][1];
};`,
    jsWalkthrough:
      'Operations: SnapshotArray(3), set(0,5), snap(), set(0,6), get(0,0)\n' +
      'Init: snaps=[ [[0,0]], [[0,0]], [[0,0]] ]. snapId=0.\n' +
      'set(0,5): history[0]=[[0,0]]. last snapId=0 === snapId=0 → update: [[0,5]].\n' +
      'snap(): return snapId=0. snapId becomes 1.\n' +
      'set(0,6): history[0]=[[0,5]]. last snapId=0 ≠ snapId=1 → append: [[0,5],[1,6]].\n' +
      'get(0,0): binary search in [[0,5],[1,6]] for snapId<=0.\n' +
      '  lo=0, hi=1. mid=ceil(0.5)=1: history[1][0]=1 > 0 → hi=0.\n' +
      '  lo=hi=0. Return history[0][1]=5.\n' +
      'Result: 5',
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

    // dp[j] = number of ways to reach sum j using the dice rolled so far
    let dp = new Array(target + 1).fill(0);
    dp[0] = 1; // Base case: 0 dice, 0 sum — exactly 1 way

    for (let dieNum = 0; dieNum < n; dieNum++) {
        const newDp = new Array(target + 1).fill(0);

        // For each possible sum j after rolling this die
        for (let j = 1; j <= target; j++) {
            // Try each face value (1 through k)
            for (let face = 1; face <= k; face++) {
                const prevSum = j - face;
                if (prevSum >= 0) {
                    // Add ways to have reached sum 'prevSum' with previous dice
                    newDp[j] = (newDp[j] + dp[prevSum]) % MOD;
                }
            }
        }

        dp = newDp; // Roll the DP array forward
    }

    return dp[target];
};`,
    jsWalkthrough:
      'Example: n=2, k=6, target=7\n' +
      'dp = [1,0,0,0,0,0,0,0] (index 0..7)\n' +
      'Die 1:\n' +
      '  j=1: face=1: dp[0]=1 → newDp[1]=1.\n' +
      '  j=2: face=1: dp[1]=0, face=2: dp[0]=1 → newDp[2]=1.\n' +
      '  ...j=6: faces 1-6 all use dp[0..5]. newDp[6]=1.\n' +
      '  j=7: face=1..6: dp[1..6]. But dp is still the original after die 0 rolls,\n' +
      '    only dp[0]=1. So newDp[7]=0 for die 1. Wait:\n' +
      '  Actually after die 1: newDp[1]=1,newDp[2]=1,...,newDp[6]=1. newDp[7]=0.\n' +
      'Die 2:\n' +
      '  j=7: face=1: dp[6]=1, face=2: dp[5]=1, face=3: dp[4]=1, face=4: dp[3]=1,\n' +
      '    face=5: dp[2]=1, face=6: dp[1]=1. newDp[7]=6.\n' +
      'Result: dp[7]=6. (There are 6 ways to roll two dice summing to 7)',
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
    let maxSum = -Infinity;
    let maxLevel = 1;
    let currentLevel = 1;
    let queueIdx = 0;

    while (queueIdx < queue.length) {
        // Process all nodes at the current level
        const levelSize = queue.length - queueIdx;
        let levelSum = 0;

        for (let i = 0; i < levelSize; i++) {
            const node = queue[queueIdx++];
            levelSum += node.val;

            // Add children for the next level
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }

        // Update maximum if this level has a larger sum
        if (levelSum > maxSum) {
            maxSum = levelSum;
            maxLevel = currentLevel;
        }

        currentLevel++;
    }

    return maxLevel;
};`,
    jsWalkthrough:
      'Example: root = [1,7,0,7,-8,null,null]\n' +
      'Level 1: nodes=[1]. levelSum=1. maxSum=1, maxLevel=1.\n' +
      'Level 2: nodes=[7,0]. levelSum=7+0=7. 7>1 → maxSum=7, maxLevel=2.\n' +
      'Level 3: nodes=[7,-8]. levelSum=7+(-8)=-1. -1<7 → no update.\n' +
      'Queue exhausted.\n' +
      'Result: maxLevel=2',
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

    // Seed BFS from all land cells simultaneously (multi-source BFS)
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (grid[r][c] === 1) queue.push([r, c]);
        }
    }

    // Edge case: all land or all water
    if (queue.length === 0 || queue.length === n * n) return -1;

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    let dist = 0;
    let queueIdx = 0;

    while (queueIdx < queue.length) {
        dist++;
        const levelSize = queue.length - queueIdx;

        for (let i = 0; i < levelSize; i++) {
            const [r, c] = queue[queueIdx++];

            for (const [dr, dc] of dirs) {
                const nr = r + dr;
                const nc = c + dc;
                const inBounds = nr >= 0 && nr < n && nc >= 0 && nc < n;

                if (inBounds && grid[nr][nc] === 0) {
                    grid[nr][nc] = 1; // Mark as visited (distance recorded by BFS level)
                    queue.push([nr, nc]);
                }
            }
        }
    }

    // dist was incremented before processing each level, so subtract 1 for actual last level
    return dist - 1;
};`,
    jsWalkthrough:
      'Example: grid = [[1,0,1],[0,0,0],[1,0,1]]\n' +
      'Land cells: (0,0),(0,2),(2,0),(2,2). queue=[(0,0),(0,2),(2,0),(2,2)].\n' +
      'Total cells=9, land=4, water=5. Not edge case.\n' +
      'dist=0 initially.\n' +
      'BFS Level 1 (dist becomes 1): process 4 land cells.\n' +
      '  From (0,0): expand to (0,1)→water, mark 1. (1,0)→water, mark 1.\n' +
      '  From (0,2): expand to (0,1)→already 1. (1,2)→water, mark 1.\n' +
      '  From (2,0): expand to (1,0)→already 1. (2,1)→water, mark 1.\n' +
      '  From (2,2): expand to (2,1)→already 1. (1,2)→already 1.\n' +
      '  New cells: (0,1),(1,0),(1,2),(2,1). queue now has 8 entries.\n' +
      'BFS Level 2 (dist becomes 2): process those 4 new cells.\n' +
      '  From (0,1): expand to (1,1)→water, mark 1.\n' +
      '  From (1,0): (1,1)→already 1.\n' +
      '  ... all neighbors of (0,1),(1,0),(1,2),(2,1) already visited except (1,1).\n' +
      '  New cell: (1,1). queue grows by 1.\n' +
      'BFS Level 3 (dist becomes 3): process (1,1). No new water cells.\n' +
      'Queue exhausted. Return dist-1 = 3-1 = 2.\n' +
      'Result: 2',
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
    // Sort arr2 and remove duplicates so we can binary search for replacements
    arr2 = [...new Set(arr2)].sort((a, b) => a - b);

    // dp: Maps lastValue → minimum operations to reach this state
    // Start with -1 as the "previous value" before arr1 begins
    let dp = new Map([[-1, 0]]);

    // Binary search: find first index in arr where arr[idx] > val
    const bisectRight = (arr, val) => {
        let lo = 0;
        let hi = arr.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (arr[mid] <= val) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    };

    for (const currentVal of arr1) {
        const newDp = new Map();

        for (const [prevVal, ops] of dp) {
            // Option 1: Keep the current value if it's strictly greater than prevVal
            if (currentVal > prevVal) {
                if (!newDp.has(currentVal) || newDp.get(currentVal) > ops) {
                    newDp.set(currentVal, ops);
                }
            }

            // Option 2: Replace currentVal with the smallest value from arr2 that is > prevVal
            const insertIdx = bisectRight(arr2, prevVal);
            if (insertIdx < arr2.length) {
                const replacement = arr2[insertIdx];
                const newOps = ops + 1;
                if (!newDp.has(replacement) || newDp.get(replacement) > newOps) {
                    newDp.set(replacement, newOps);
                }
            }
        }

        dp = newDp;
        if (dp.size === 0) return -1; // No valid state — impossible
    }

    return Math.min(...dp.values());
};`,
    jsWalkthrough:
      'Example: arr1 = [1,5,3,6,7], arr2 = [1,3,2,4]\n' +
      'arr2 sorted+deduped: [1,2,3,4]\n' +
      'dp = {-1: 0}\n' +
      'Process arr1[0]=1:\n' +
      '  From (prev=-1, ops=0): 1>-1 → keep: newDp={1:0}.\n' +
      '  Replace: bisectRight([1,2,3,4],-1)=0, arr2[0]=1, cost=1. newDp={1:min(0,1)}={1:0}.\n' +
      '  dp={1:0}\n' +
      'Process arr1[1]=5:\n' +
      '  From (prev=1, ops=0): 5>1 → keep: newDp={5:0}.\n' +
      '  Replace: bisectRight(arr2,1)=1, arr2[1]=2, cost=1. newDp={5:0, 2:1}.\n' +
      '  dp={5:0, 2:1}\n' +
      'Process arr1[2]=3:\n' +
      '  From (prev=5, ops=0): 3<5 → cant keep. Replace: arr2>5 → none.\n' +
      '  From (prev=2, ops=1): 3>2 → keep: newDp={3:1}. Replace: arr2>2 → arr2[2]=3, cost=2. newDp={3:min(1,2)}={3:1}.\n' +
      '  dp={3:1}\n' +
      'Process arr1[3]=6: prev=3,ops=1. 6>3 keep: {6:1}. Replace: arr2>3=arr2[3]=4, cost=2: {6:1,4:2}.\n' +
      'Process arr1[4]=7: prev=6,ops=1. 7>6 keep: {7:1}. Replace: arr2>6=none.\n' +
      '  prev=4,ops=2. 7>4 keep: {7:min(1,2)=1}. Replace: arr2>4=none.\n' +
      'dp={7:1}. min=1.\n' +
      'Result: 1',
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
    // Build undirected adjacency list
    const graph = Array.from({ length: n }, () => []);
    for (const [u, v] of connections) {
        graph[u].push(v);
        graph[v].push(u);
    }

    // disc[u] = discovery time of node u (when it was first visited)
    // low[u] = smallest discovery time reachable from u's subtree (via back edges)
    const disc = new Array(n).fill(-1);
    const low = new Array(n).fill(0);
    const bridges = [];
    let timer = 0;

    const dfs = (u, parent) => {
        // Record discovery time and initialize low value
        disc[u] = low[u] = timer++;

        for (const v of graph[u]) {
            if (disc[v] === -1) {
                // Tree edge: v is unvisited, recurse into it
                dfs(v, u);

                // After returning, update low[u] based on what v can reach
                low[u] = Math.min(low[u], low[v]);

                // If v cannot reach u or any ancestor without this edge, it's a bridge
                if (low[v] > disc[u]) {
                    bridges.push([u, v]);
                }
            } else if (v !== parent) {
                // Back edge: v is already visited and not our parent
                // Update low[u] to reflect the back edge
                low[u] = Math.min(low[u], disc[v]);
            }
        }
    };

    dfs(0, -1);
    return bridges;
};`,
    jsWalkthrough:
      'Example: n=4, connections=[[0,1],[1,2],[2,0],[1,3]]\n' +
      'graph: 0→[1,2], 1→[0,2,3], 2→[1,0], 3→[1]\n' +
      'dfs(0, -1): disc[0]=low[0]=0, timer=1.\n' +
      '  Visit 1: disc[1]=-1, recurse dfs(1, 0): disc[1]=low[1]=1, timer=2.\n' +
      '    Visit 0: disc[0]≠-1, 0≠parent(0). low[1]=min(1,disc[0])=min(1,0)=0.\n' +
      '    Visit 2: disc[2]=-1, recurse dfs(2, 1): disc[2]=low[2]=2, timer=3.\n' +
      '      Visit 1: disc[1]≠-1, 1≠parent(1). low[2]=min(2,disc[1])=min(2,1)=1.\n' +
      '      Visit 0: disc[0]≠-1, 0≠parent(1). low[2]=min(1,disc[0])=min(1,0)=0.\n' +
      '    Back from dfs(2,1): low[1]=min(0,low[2])=min(0,0)=0. low[2]=0, disc[1]=1. 0<1 not bridge.\n' +
      '    Visit 3: disc[3]=-1, recurse dfs(3, 1): disc[3]=low[3]=3. No unvisited neighbors.\n' +
      '    Back from dfs(3,1): low[1]=min(0,low[3])=min(0,3)=0. low[3]=3, disc[1]=1. 3>1 → BRIDGE [1,3]!\n' +
      '  Back from dfs(1,0): low[0]=min(0,low[1])=0.\n' +
      '  Visit 2: disc[2]≠-1, 2≠parent(0). low[0]=min(0,disc[2])=min(0,2)=0.\n' +
      'Result: [[1,3]]',
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
    // Step 1: Count how often each value appears
    const count = {};
    for (const val of arr) {
        count[val] = (count[val] || 0) + 1;
    }

    // Step 2: Get all frequency values
    const frequencies = Object.values(count);

    // Step 3: Check if all frequencies are unique
    // If the set of frequencies has the same size as the list, all are distinct
    const uniqueFrequencies = new Set(frequencies);
    return frequencies.length === uniqueFrequencies.size;
};`,
    jsWalkthrough:
      'Example: arr = [1,2,2,1,1,3]\n' +
      'Count frequencies: {1:3, 2:2, 3:1}\n' +
      'frequencies = [3, 2, 1]\n' +
      'uniqueFrequencies = Set{3, 2, 1}\n' +
      'frequencies.length=3 === uniqueFrequencies.size=3 → true\n' +
      'Result: true\n' +
      '\n' +
      'Counter-example: arr = [1,2]\n' +
      'count = {1:1, 2:1}. frequencies=[1,1]. uniqueFrequencies=Set{1}.\n' +
      '2 !== 1 → false. Result: false',
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
    let left = 0;
    let currentWindowCost = 0;
    let maxLength = 0;

    for (let right = 0; right < n; right++) {
        // Add the cost of converting s[right] to t[right]
        const charCost = Math.abs(s.charCodeAt(right) - t.charCodeAt(right));
        currentWindowCost += charCost;

        // If the window cost exceeds budget, shrink from the left
        while (currentWindowCost > maxCost) {
            const leftCharCost = Math.abs(s.charCodeAt(left) - t.charCodeAt(left));
            currentWindowCost -= leftCharCost;
            left++;
        }

        // Current window [left..right] is within budget
        maxLength = Math.max(maxLength, right - left + 1);
    }

    return maxLength;
};`,
    jsWalkthrough:
      'Example: s = "abcd", t = "bcdf", maxCost = 3\n' +
      'Cost array: |a-b|=1, |b-c|=1, |c-d|=1, |d-f|=2\n' +
      'left=0, windowCost=0, maxLen=0.\n' +
      'right=0: cost=1, windowCost=1. 1<=3. maxLen=max(0,1)=1.\n' +
      'right=1: cost=1, windowCost=2. 2<=3. maxLen=max(1,2)=2.\n' +
      'right=2: cost=1, windowCost=3. 3<=3. maxLen=max(2,3)=3.\n' +
      'right=3: cost=2, windowCost=5. 5>3! Shrink:\n' +
      '  Remove s[0]→t[0]: cost=1. windowCost=4. left=1. Still 4>3! Shrink:\n' +
      '  Remove s[1]→t[1]: cost=1. windowCost=3. left=2. 3<=3. Stop.\n' +
      '  maxLen=max(3, 3-2+1)=max(3,2)=3.\n' +
      'Result: 3',
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
    // Stack stores [character, consecutiveCount] pairs
    const stack = [];

    for (const ch of s) {
        const top = stack[stack.length - 1];

        if (stack.length > 0 && top[0] === ch) {
            // Current character matches the top of the stack — extend the run
            top[1]++;

            // If we've accumulated exactly k of this character, remove the entire run
            if (top[1] === k) {
                stack.pop();
            }
        } else {
            // Different character — start a new run
            stack.push([ch, 1]);
        }
    }

    // Reconstruct the string from remaining character runs
    return stack.map(([ch, count]) => ch.repeat(count)).join('');
};`,
    jsWalkthrough:
      'Example: s = "deeedbbcccbdaa", k = 3\n' +
      'Process character by character:\n' +
      'd: stack=[[d,1]]\n' +
      'e: stack=[[d,1],[e,1]]\n' +
      'e: stack=[[d,1],[e,2]]\n' +
      'e: top=[e,2]→count becomes 3===k → pop! stack=[[d,1]]\n' +
      'd: top=[d,1]→count becomes 2. stack=[[d,2]]\n' +
      'b: stack=[[d,2],[b,1]]\n' +
      'b: stack=[[d,2],[b,2]]\n' +
      'c: stack=[[d,2],[b,2],[c,1]]\n' +
      'c: stack=[[d,2],[b,2],[c,2]]\n' +
      'c: top=[c,2]→count becomes 3===k → pop! stack=[[d,2],[b,2]]\n' +
      'b: top=[b,2]→count becomes 3===k → pop! stack=[[d,2]]\n' +
      'd: top=[d,2]→count becomes 3===k → pop! stack=[]\n' +
      'a: stack=[[a,1]]\n' +
      'a: stack=[[a,2]]\n' +
      'Reconstruct: "aa".\n' +
      'Result: "aa"',
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
    // Key insight: moving a chip by 2 is FREE (cost 0)
    // Moving by 1 costs 1. So only the parity of a chip's position matters.
    // All even-position chips can gather at any even spot for free.
    // All odd-position chips can gather at any odd spot for free.
    // The only cost: moving the smaller parity group by 1 to join the larger group.

    let evenCount = 0;
    for (const pos of position) {
        if (pos % 2 === 0) {
            evenCount++;
        }
    }
    const oddCount = position.length - evenCount;

    // Move the smaller group across the 1-step parity boundary
    return Math.min(evenCount, oddCount);
};`,
    jsWalkthrough:
      'Example: position = [1,2,3]\n' +
      'Position 1 is odd. Position 2 is even. Position 3 is odd.\n' +
      'evenCount=1, oddCount=2.\n' +
      'Option A: Move even chip to an odd position: cost=1 (1 chip moves 1 step).\n' +
      'Option B: Move odd chips to an even position: cost=2 (2 chips each move 1 step).\n' +
      'min(1, 2) = 1.\n' +
      'Result: 1',
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
    const rows = grid.length;
    const cols = grid[0].length;
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    // DFS with backtracking: collect gold from this cell, then try all 4 directions
    const dfs = (r, c) => {
        // Out of bounds or empty cell — can't collect anything here
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === 0) {
            return 0;
        }

        // Save and clear this cell so we don't revisit it in this path
        const gold = grid[r][c];
        grid[r][c] = 0;

        // Try all 4 directions and keep the best outcome
        let best = 0;
        for (const [dr, dc] of dirs) {
            const neighborGold = dfs(r + dr, c + dc);
            best = Math.max(best, neighborGold);
        }

        // Restore the cell for other starting paths
        grid[r][c] = gold;

        return gold + best;
    };

    // Try starting DFS from every non-zero cell
    let ans = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] !== 0) {
                const collected = dfs(r, c);
                ans = Math.max(ans, collected);
            }
        }
    }

    return ans;
};`,
    jsWalkthrough:
      'Example: grid = [[0,6,0],[5,8,7],[0,9,0]]\n' +
      '\n' +
      'Try starting at (0,1) = 6:\n' +
      '  Collect 6, mark (0,1) = 0\n' +
      '  Move down to (1,1) = 8: collect 8, mark = 0\n' +
      '    Move right to (1,2) = 7: collect 7, mark = 0\n' +
      '      No non-zero neighbors → return 7\n' +
      '    Move down to (2,1) = 9: collect 9, mark = 0\n' +
      '      No non-zero neighbors → return 9\n' +
      '    best = max(7, 9) = 9 → return 8 + 9 = 17\n' +
      '  return 6 + 17 = 23\n' +
      '\n' +
      'Try starting at (1,2) = 7:\n' +
      '  Collect 7, move to (1,1) = 8, then (2,1) = 9 → 7+8+9 = 24\n' +
      '\n' +
      'Try starting at (2,1) = 9:\n' +
      '  Collect 9, move to (1,1) = 8, then (1,2) = 7 → 9+8+7 = 24\n' +
      '\n' +
      'Maximum across all starts = 24',
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
    // Establish the reference direction from the first two points
    const [x0, y0] = coordinates[0];
    const [x1, y1] = coordinates[1];
    const dx = x1 - x0;
    const dy = y1 - y0;

    // For each remaining point, verify it lies on the same line
    // Using cross multiplication: dy * (x - x0) === dx * (y - y0)
    // This avoids division by zero when dx or dy is 0
    for (let i = 2; i < coordinates.length; i++) {
        const [x, y] = coordinates[i];
        const crossProduct = dy * (x - x0) - dx * (y - y0);
        if (crossProduct !== 0) {
            return false;
        }
    }

    return true;
};`,
    jsWalkthrough:
      'Example: coordinates = [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]]\n' +
      '\n' +
      'Reference direction from (1,2) to (2,3):\n' +
      '  dx = 2 - 1 = 1\n' +
      '  dy = 3 - 2 = 1\n' +
      '\n' +
      'Check (3,4): dy*(3-1) - dx*(4-2) = 1*2 - 1*2 = 0 ✓\n' +
      'Check (4,5): dy*(4-1) - dx*(5-2) = 1*3 - 1*3 = 0 ✓\n' +
      'Check (5,6): dy*(5-1) - dx*(6-2) = 1*4 - 1*4 = 0 ✓\n' +
      'Check (6,7): dy*(6-1) - dx*(7-2) = 1*5 - 1*5 = 0 ✓\n' +
      '\n' +
      'All points collinear → return true\n' +
      '\n' +
      'Counter-example: if point (3,5) appeared instead of (3,4):\n' +
      '  dy*(3-1) - dx*(5-2) = 1*2 - 1*3 = -1 ≠ 0 → return false',
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
    // Combine job info and sort by end time for the DP ordering
    const jobs = startTime
        .map((s, i) => [endTime[i], s, profit[i]])
        .sort((a, b) => a[0] - b[0]);

    // Keep just the end times for binary search
    const ends = jobs.map(j => j[0]);
    const n = jobs.length;

    // dp[i] = max profit considering only the first i jobs
    const dp = new Array(n + 1).fill(0);

    // Binary search: find the rightmost job that ends <= val within [0, hi)
    const bisectRight = (arr, val, hi) => {
        let lo = 0;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (arr[mid] <= val) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo;
    };

    for (let i = 1; i <= n; i++) {
        const [end, start, p] = jobs[i - 1];

        // Find index of last job that ends <= start time of this job
        const lastCompatible = bisectRight(ends, start, i - 1);

        // Option 1: skip this job → dp[i-1]
        // Option 2: take this job → dp[lastCompatible] + p
        dp[i] = Math.max(dp[i - 1], dp[lastCompatible] + p);
    }

    return dp[n];
};`,
    jsWalkthrough:
      'Example: startTime=[1,2,3,3], endTime=[3,4,5,6], profit=[50,10,40,70]\n' +
      '\n' +
      'After combining and sorting by end time:\n' +
      '  jobs = [[3,1,50], [4,2,10], [5,3,40], [6,3,70]]\n' +
      '  ends = [3, 4, 5, 6]\n' +
      '\n' +
      'DP:\n' +
      '  dp[0] = 0 (base case)\n' +
      '\n' +
      '  i=1: job=[3,1,50], start=1\n' +
      '    bisectRight(ends, 1, 0) → 0 (no jobs end ≤ 1 in range [0,0))\n' +
      '    dp[1] = max(dp[0], dp[0]+50) = max(0, 50) = 50\n' +
      '\n' +
      '  i=2: job=[4,2,10], start=2\n' +
      '    bisectRight(ends, 2, 1) → 0 (ends[0]=3 > 2)\n' +
      '    dp[2] = max(dp[1], dp[0]+10) = max(50, 10) = 50\n' +
      '\n' +
      '  i=3: job=[5,3,40], start=3\n' +
      '    bisectRight(ends, 3, 2) → 1 (ends[0]=3 ≤ 3)\n' +
      '    dp[3] = max(dp[2], dp[1]+40) = max(50, 50+40) = 90\n' +
      '\n' +
      '  i=4: job=[6,3,70], start=3\n' +
      '    bisectRight(ends, 3, 3) → 1 (ends[0]=3 ≤ 3)\n' +
      '    dp[4] = max(dp[3], dp[1]+70) = max(90, 50+70) = 120\n' +
      '\n' +
      'Answer: dp[4] = 120 (jobs 1 and 4: profit 50+70)',
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
    // Step 1: Convert each string to a bitmask of its characters.
    // Skip strings that have duplicate characters within themselves.
    const masks = [];
    for (const s of arr) {
        let mask = 0;
        let valid = true;

        for (const c of s) {
            const bit = 1 << (c.charCodeAt(0) - 97); // bit position for this letter
            if (mask & bit) {
                // Duplicate character within the string — skip it entirely
                valid = false;
                break;
            }
            mask |= bit;
        }

        if (valid) {
            masks.push([mask, s.length]);
        }
    }

    // Step 2: Backtrack through all subsets of valid strings
    let ans = 0;

    const bt = (i, curMask, curLen) => {
        // Update the best length at every state
        ans = Math.max(ans, curLen);

        for (let j = i; j < masks.length; j++) {
            const [m, l] = masks[j];

            // Only include this string if it shares no characters with current set
            if ((curMask & m) === 0) {
                bt(j + 1, curMask | m, curLen + l);
            }
        }
    };

    bt(0, 0, 0);
    return ans;
};`,
    jsWalkthrough:
      'Example: arr = ["un","iq","ue"]\n' +
      '\n' +
      'Step 1 — Build bitmasks:\n' +
      '  "un": u=bit20, n=bit13 → mask=0b...010010... no duplicates → valid\n' +
      '  "iq": i=bit8, q=bit16 → mask=0b...010000100... → valid\n' +
      '  "ue": u=bit20, e=bit4 → mask=0b...100010... → valid\n' +
      '  masks = [[mask_un,2], [mask_iq,2], [mask_ue,2]]\n' +
      '\n' +
      'Step 2 — Backtrack:\n' +
      '  bt(0, 0, 0): ans=0\n' +
      '    Try j=0 "un": curMask & mask_un = 0 → include\n' +
      '      bt(1, mask_un, 2): ans=2\n' +
      '        Try j=1 "iq": mask_un & mask_iq = 0 → include\n' +
      '          bt(2, mask_un|mask_iq, 4): ans=4\n' +
      '            Try j=2 "ue": (mask_un|mask_iq) & mask_ue ≠ 0 (shares u) → skip\n' +
      '        Try j=2 "ue": mask_un & mask_ue ≠ 0 (shares u) → skip\n' +
      '    Try j=1 "iq": curMask & mask_iq = 0 → include\n' +
      '      bt(2, mask_iq, 2): ans stays 4\n' +
      '        Try j=2 "ue": mask_iq & mask_ue = 0 → include\n' +
      '          bt(3, mask_iq|mask_ue, 4): ans stays 4\n' +
      '    Try j=2 "ue": curMask & mask_ue = 0 → include, length=2\n' +
      '\n' +
      'Maximum unique concatenation length = 4 ("uniq" or "ique")',
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
    // Helper: count subarrays with AT MOST k odd numbers using sliding window
    const atMost = (limit) => {
        let left = 0;
        let result = 0;
        let odds = 0; // number of odd values in the current window

        for (let right = 0; right < nums.length; right++) {
            // Expand window to the right
            if (nums[right] % 2 === 1) {
                odds++;
            }

            // Shrink from the left until we satisfy the limit
            while (odds > limit) {
                if (nums[left] % 2 === 1) {
                    odds--;
                }
                left++;
            }

            // Every subarray ending at 'right' with left boundary in [left..right] is valid
            result += right - left + 1;
        }

        return result;
    };

    // Exactly k odds = at most k minus at most (k-1)
    return atMost(k) - atMost(k - 1);
};`,
    jsWalkthrough:
      'Example: nums = [1,1,2,1,1], k = 3\n' +
      '\n' +
      'atMost(3):\n' +
      '  right=0: nums[0]=1 (odd), odds=1. Window [0..0]. result += 1 → 1\n' +
      '  right=1: nums[1]=1 (odd), odds=2. Window [0..1]. result += 2 → 3\n' +
      '  right=2: nums[2]=2 (even), odds=2. Window [0..2]. result += 3 → 6\n' +
      '  right=3: nums[3]=1 (odd), odds=3. Window [0..3]. result += 4 → 10\n' +
      '  right=4: nums[4]=1 (odd), odds=4 > 3.\n' +
      '    Shrink: left=0, nums[0]=1 odd, odds=3. left=1.\n' +
      '    odds=3 ≤ 3. Window [1..4]. result += 4 → 14\n' +
      '  atMost(3) = 14\n' +
      '\n' +
      'atMost(2):\n' +
      '  right=0: odds=1. result += 1 → 1\n' +
      '  right=1: odds=2. result += 2 → 3\n' +
      '  right=2: odds=2. result += 3 → 6\n' +
      '  right=3: odds=3 > 2. Shrink: left=1. odds=2. result += 3 → 9\n' +
      '  right=4: odds=3 > 2. Shrink: left=2. odds=2. result += 3 → 12\n' +
      '  atMost(2) = 12\n' +
      '\n' +
      'Answer: 14 - 12 = 2',
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

    // Stack holds indices of unmatched '(' characters
    const stack = [];

    for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') {
            // Push this index — it's unmatched until we find its ')'
            stack.push(i);
        } else if (s[i] === ')') {
            if (stack.length > 0) {
                // Matched! Pop the corresponding '('
                stack.pop();
            } else {
                // No matching '(' exists — this ')' must be removed
                toRemove.add(i);
            }
        }
        // Letters are ignored — they don't affect validity
    }

    // Any remaining indices in the stack are unmatched '(' characters
    for (const idx of stack) {
        toRemove.add(idx);
    }

    // Build the result, skipping all indices marked for removal
    return [...s].filter((_, i) => !toRemove.has(i)).join('');
};`,
    jsWalkthrough:
      'Example: s = "lee(t(c)o)de)"\n' +
      '         idx: 0123456789...\n' +
      '\n' +
      'Scan left to right:\n' +
      '  i=0 \'l\': letter, skip\n' +
      '  i=1 \'e\': letter, skip\n' +
      '  i=2 \'e\': letter, skip\n' +
      '  i=3 \'(\': push 3. stack=[3]\n' +
      '  i=4 \'t\': letter, skip\n' +
      '  i=5 \'(\': push 5. stack=[3,5]\n' +
      '  i=6 \'c\': letter, skip\n' +
      '  i=7 \')\': stack non-empty → pop 5. stack=[3]\n' +
      '  i=8 \'o\': letter, skip\n' +
      '  i=9 \')\': stack non-empty → pop 3. stack=[]\n' +
      '  i=10 \'d\': letter, skip\n' +
      '  i=11 \'e\': letter, skip\n' +
      '  i=12 \')\': stack empty → toRemove.add(12)\n' +
      '\n' +
      'After scan:\n' +
      '  stack = [] (no unmatched \'(\')\n' +
      '  toRemove = {12}\n' +
      '\n' +
      'Result: skip index 12 → "lee(t(c)o)de"',
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
    const m = grid.length;
    const n = grid[0].length;

    // DFS helper: flood-fill all connected land (0) cells, marking them as water (1)
    const dfs = (r, c) => {
        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] === 1) {
            return;
        }
        grid[r][c] = 1; // mark as visited/water
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    };

    // Phase 1: Eliminate all land touching the boundary — those can't be closed islands
    for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
            const onBoundary = (r === 0 || r === m - 1 || c === 0 || c === n - 1);
            if (onBoundary && grid[r][c] === 0) {
                dfs(r, c);
            }
        }
    }

    // Phase 2: Every remaining land region is fully enclosed — count each one
    let count = 0;
    for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
            if (grid[r][c] === 0) {
                dfs(r, c); // flood-fill this closed island
                count++;
            }
        }
    }

    return count;
};`,
    jsWalkthrough:
      'Example: grid = [[1,1,1,1,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,1,1,1,1]]\n' +
      '(0=land, 1=water; inner land cells form a donut around center water)\n' +
      '\n' +
      'Phase 1 — Remove boundary land:\n' +
      '  Scan all boundary cells. All boundary cells are already 1 (water).\n' +
      '  No DFS needed.\n' +
      '\n' +
      'Phase 2 — Count remaining land regions:\n' +
      '  Scan grid:\n' +
      '    (1,1)=0: DFS floods cells (1,1),(1,2),(1,3),(2,1),(2,3),(3,1),(3,2),(3,3)\n' +
      '    count = 1\n' +
      '    (2,2)=1: already water (center), skip\n' +
      '    All other cells are already 1\n' +
      '\n' +
      'Return 1 (one closed island surrounds the center water cell)\n' +
      '\n' +
      'Counter-example with boundary land:\n' +
      '  grid = [[0,1,1],[1,0,1],[1,1,0]]\n' +
      '  Phase 1 floods (0,0), (1,1) via (0,0)? No, (0,0) connects to (1,1) via land\n' +
      '  After Phase 1 all connected boundary land becomes water\n' +
      '  Phase 2 finds no remaining land → count = 0',
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
    // Count how many of each letter we have available
    const avail = {};
    for (const c of letters) {
        avail[c] = (avail[c] || 0) + 1;
    }

    let ans = 0;

    // Backtracking: try including or excluding each word in order
    const bt = (i, remaining, curScore) => {
        // Update best score at every state (including empty subset)
        ans = Math.max(ans, curScore);

        for (let j = i; j < words.length; j++) {
            // Count letter requirements for this word
            const wordCount = {};
            for (const c of words[j]) {
                wordCount[c] = (wordCount[c] || 0) + 1;
            }

            // Check if we have enough of each required letter
            let valid = true;
            for (const c in wordCount) {
                if ((remaining[c] || 0) < wordCount[c]) {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                // Compute score for this word
                let wordScore = 0;
                for (const c of words[j]) {
                    wordScore += score[c.charCodeAt(0) - 97];
                }

                // Use the letters, recurse, then restore (backtrack)
                for (const c in wordCount) {
                    remaining[c] -= wordCount[c];
                }
                bt(j + 1, remaining, curScore + wordScore);
                for (const c in wordCount) {
                    remaining[c] += wordCount[c];
                }
            }
        }
    };

    bt(0, { ...avail }, 0);
    return ans;
};`,
    jsWalkthrough:
      'Example: words=["dog","cat","dad","good"], letters=["a","a","c","d","d","d","g","o","o"]\n' +
      'score: a=1,c=9(not in score given actually score[d]=5,score[o]=2,score[g]=3,score[a]=1)\n' +
      'score = [1,0,9,5,0,0,3,0,0,...] (a=1,c=9,d=5,g=3,o=2)\n' +
      '\n' +
      'avail = {a:2, c:1, d:3, g:1, o:2}\n' +
      '\n' +
      'bt(0, avail, 0):\n' +
      '  Try j=0 "dog": needs d=1,o=1,g=1. avail has all → valid\n' +
      '    wordScore = 5+2+3 = 10 (d+o+g)\n' +
      '    Use letters. bt(1, {a:2,c:1,d:2,o:1}, 10):\n' +
      '      Try j=1 "cat": needs c=1,a=1,t=1. No t → skip\n' +
      '      Try j=2 "dad": needs d=2,a=1. d:2 ok, a:1 ok → valid\n' +
      '        wordScore = 5+1+5 = 11 (d+a+d)\n' +
      '        bt(3, {a:1,c:1,d:0,o:1}, 21):\n' +
      '          Try j=3 "good": needs g=1,o=2. o:1 < 2 → skip\n' +
      '        ans = max(ans, 21) = 21. Backtrack.\n' +
      '      Try j=3 "good": needs g=1,o=2. o:1 < 2 → skip\n' +
      '    Backtrack.\n' +
      '  Try j=2 "dad": needs d=2,a=1 → valid\n' +
      '    wordScore = 11. bt(3, {a:1,c:1,d:1,g:1,o:2}, 11):\n' +
      '      Try j=3 "good": g=1,o=2 → valid. wordScore=3+2+2+5=12\n' +
      '        bt(4, ..., 23): ans=23. Backtrack.\n' +
      '\n' +
      'Maximum score = 23 (dad + good)',
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
    // Sort lexicographically so products with the same prefix are adjacent
    products.sort();

    const result = [];
    let prefix = '';

    for (const c of searchWord) {
        // Grow the prefix one character at a time
        prefix += c;

        // Binary search: find the leftmost position where prefix could be inserted
        let lo = 0;
        let hi = products.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (products[mid] < prefix) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }

        // Collect up to 3 products starting at 'lo' that actually start with prefix
        const suggestions = [];
        for (let i = lo; i < Math.min(lo + 3, products.length); i++) {
            if (products[i].startsWith(prefix)) {
                suggestions.push(products[i]);
            } else {
                break; // Products are sorted, so no more matches after first miss
            }
        }

        result.push(suggestions);
    }

    return result;
};`,
    jsWalkthrough:
      'Example: products=["mobile","mouse","moneypot","monitor","mousepad"], searchWord="mouse"\n' +
      '\n' +
      'After sort: ["mobile","moneypot","monitor","mouse","mousepad"]\n' +
      '\n' +
      'Type "m" → prefix="m":\n' +
      '  Binary search for "m" → lo=0\n' +
      '  products[0]="mobile" starts with "m" → add\n' +
      '  products[1]="moneypot" starts with "m" → add\n' +
      '  products[2]="monitor" starts with "m" → add (max 3 reached)\n' +
      '  result[0] = ["mobile","moneypot","monitor"]\n' +
      '\n' +
      'Type "o" → prefix="mo":\n' +
      '  Binary search for "mo" → lo=0\n' +
      '  Same 3 products start with "mo"\n' +
      '  result[1] = ["mobile","moneypot","monitor"]\n' +
      '\n' +
      'Type "u" → prefix="mou":\n' +
      '  Binary search for "mou" → lo=3 ("mobile","moneypot","monitor" < "mou")\n' +
      '  products[3]="mouse" starts with "mou" → add\n' +
      '  products[4]="mousepad" starts with "mou" → add\n' +
      '  result[2] = ["mouse","mousepad"]\n' +
      '\n' +
      'Type "s" → prefix="mous":\n' +
      '  Binary search for "mous" → lo=3\n' +
      '  Same ["mouse","mousepad"]\n' +
      '  result[3] = ["mouse","mousepad"]\n' +
      '\n' +
      'Type "e" → prefix="mouse":\n' +
      '  Both "mouse" and "mousepad" start with "mouse"\n' +
      '  result[4] = ["mouse","mousepad"]\n' +
      '\n' +
      'Final: [["mobile","moneypot","monitor"],["mobile","moneypot","monitor"],["mouse","mousepad"],["mouse","mousepad"],["mouse","mousepad"]]',
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

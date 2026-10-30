import { ProblemSolution } from './types';
import { minHeapJavascript } from './heap-code';

function solution(id: number, description: string, examples: string, approach: string, jsCode: string, code: string, timeComplexity: string, spaceComplexity: string): ProblemSolution {
  return { id, description, examples, intuition: approach, approach, jsCode, code, explanation: approach, timeComplexity, spaceComplexity, hints: [] };
}

export const solutions: ProblemSolution[] = [
  solution(1929, 'Return an array containing two consecutive copies of nums.', 'Input: nums = [1,2,1]\nOutput: [1,2,1,1,2,1]',
    'Write each input value at its original index and again n positions later.',
`var getConcatenation = function(nums) {
    const n = nums.length;
    const answer = new Array(2 * n);
    for (let i = 0; i < n; i++) {
        answer[i] = nums[i];
        answer[i + n] = nums[i];
    }
    return answer;
};`,
`class Solution:
    def getConcatenation(self, nums):
        return nums + nums`, 'O(n)', 'O(n) output'),
  solution(1325, 'Delete every leaf whose value is target. Continue removing newly formed matching leaves.', 'Input: root = [1,2,3,2,null,2,4], target = 2\nOutput: [1,null,3,null,4]',
    'Process both children before checking the parent. A parent that becomes a matching leaf is removed during the same traversal.',
`var removeLeafNodes = function(root, target) {
    if (!root) return null;
    root.left = removeLeafNodes(root.left, target);
    root.right = removeLeafNodes(root.right, target);
    if (!root.left && !root.right && root.val === target) {
        return null;
    }
    return root;
};`,
`class Solution:
    def removeLeafNodes(self, root, target):
        if not root:
            return None
        root.left = self.removeLeafNodes(root.left, target)
        root.right = self.removeLeafNodes(root.right, target)
        if not root.left and not root.right and root.val == target:
            return None
        return root`, 'O(n)', 'O(h) call stack'),
  solution(502, 'Choose at most k distinct projects. A project requires its capital threshold and adds its profit to your current capital. Maximize final capital.', 'Input: k = 2, w = 0, profits = [1,2,3], capital = [0,1,1]\nOutput: 4',
    'Sort projects by required capital. Put affordable profits in a max-heap and take the largest profit, then add any projects made affordable by it.',
minHeapJavascript + `var findMaximizedCapital = function(k, w, profits, capital) {
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
};`,
`import heapq
class Solution:
    def findMaximizedCapital(self, k, w, profits, capital):
        projects = sorted(zip(capital, profits))
        available, next_project = [], 0
        for _ in range(k):
            while next_project < len(projects) and projects[next_project][0] <= w:
                heapq.heappush(available, -projects[next_project][1])
                next_project += 1
            if not available:
                break
            w -= heapq.heappop(available)
        return w`, 'O(n log n + k log n)', 'O(n)'),
  solution(1863, 'Sum the XOR of each subset, including the empty subset whose XOR is zero. Equal-valued subsets formed from different indices count separately.', 'Input: nums = [1,3]\nOutput: 6',
    'At each index, recurse once without the value and once with it XORed into the running total. Sum the leaf totals.',
`var subsetXORSum = function(nums) {
    function visit(index, xor) {
        if (index === nums.length) return xor;
        const without = visit(index + 1, xor);
        const withValue = visit(index + 1, xor ^ nums[index]);
        return without + withValue;
    }
    return visit(0, 0);
};`,
`class Solution:
    def subsetXORSum(self, nums):
        def visit(index, xor):
            if index == len(nums):
                return xor
            return visit(index + 1, xor) + visit(index + 1, xor ^ nums[index])
        return visit(0, 0)`, 'O(2^n)', 'O(n) call stack'),
  solution(473, 'Use every matchstick exactly once, without breaking any, to form four equal sides of a square.', 'Input: matchsticks = [1,1,2,2,2]\nOutput: true',
    'Reject totals not divisible by four. Place longer sticks first, try each side that has room, and undo placements when they fail. Equal side lengths are interchangeable.',
`var makesquare = function(matchsticks) {
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
};`,
`class Solution:
    def makesquare(self, matchsticks):
        total = sum(matchsticks)
        if total % 4:
            return False
        target = total // 4
        matchsticks.sort(reverse=True)
        sides = [0] * 4
        def place(index):
            if index == len(matchsticks):
                return True
            tried = set()
            for side in range(4):
                if sides[side] in tried:
                    continue
                tried.add(sides[side])
                if sides[side] + matchsticks[index] > target:
                    continue
                sides[side] += matchsticks[index]
                if place(index + 1):
                    return True
                sides[side] -= matchsticks[index]
            return False
        return place(0)`, 'O(4^n + n log n) worst case', 'O(n)'),
  solution(2707, 'Choose non-overlapping dictionary substrings so that as few characters as possible remain unused.', 'Input: s = "leetscode", dictionary = ["leet","code","leetcode"]\nOutput: 1',
    'dp[end] is the fewest unused characters in the prefix ending at end. Either leave the last character unused or finish with a dictionary word.',
`var minExtraChar = function(s, dictionary) {
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
};`,
`class Solution:
    def minExtraChar(self, s, dictionary):
        words = set(dictionary)
        dp = [0] * (len(s) + 1)
        for end in range(1, len(s) + 1):
            dp[end] = dp[end - 1] + 1
            for start in range(end):
                if s[start:end] in words:
                    dp[end] = min(dp[end], dp[start])
        return dp[-1]`, 'O(n³ + dictionary characters), including substring creation and hashing', 'O(n + dictionary characters)'),
  solution(2392, 'Place 1 through k exactly once in a k-by-k matrix, filling other cells with zero. Row and column conditions require strictly earlier rows or columns. Return [] if impossible.', 'Input: k = 3, rowConditions = [[1,2],[3,2]], colConditions = [[2,1],[3,2]]\nOutput: [[0,0,1],[3,0,0],[0,2,0]]',
    'Topologically sort row conditions and column conditions separately. A cycle in either makes the task impossible. Otherwise place each number at its position in the two orders.',
`var buildMatrix = function(k, rowConditions, colConditions) {
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
};`,
`from collections import deque
class Solution:
    def buildMatrix(self, k, rowConditions, colConditions):
        def order(conditions):
            graph = [[] for _ in range(k + 1)]
            indegree = [0] * (k + 1)
            for before, after in conditions:
                graph[before].append(after)
                indegree[after] += 1
            queue = deque(v for v in range(1, k + 1) if indegree[v] == 0)
            result = []
            while queue:
                value = queue.popleft()
                result.append(value)
                for neighbor in graph[value]:
                    indegree[neighbor] -= 1
                    if indegree[neighbor] == 0:
                        queue.append(neighbor)
            return result
        rows, columns = order(rowConditions), order(colConditions)
        if len(rows) != k or len(columns) != k:
            return []
        column_index = {v: i for i, v in enumerate(columns)}
        matrix = [[0] * k for _ in range(k)]
        for row, value in enumerate(rows):
            matrix[row][column_index[value]] = value
        return matrix`, 'O(k² + row conditions + column conditions)', 'O(k² + row conditions + column conditions)'),
  solution(877, 'Two players alternately take the leftmost or rightmost pile. The number of piles is even and their total is odd. Return whether the first player wins with optimal play.', 'Input: piles = [5,3,4,5]\nOutput: true',
    'Store the best score advantage for each interval. Taking either end gains that pile but subtracts the opponent’s best advantage on the remaining interval.',
`var stoneGame = function(piles) {
    const n = piles.length;
    const dp = piles.slice();
    for (let length = 2; length <= n; length++) {
        for (let left = 0; left + length <= n; left++) {
            const right = left + length - 1;
            dp[left] = Math.max(piles[left] - dp[left + 1], piles[right] - dp[left]);
        }
    }
    return dp[0] > 0;
};`,
`class Solution:
    def stoneGame(self, piles):
        dp = piles[:]
        for length in range(2, len(piles) + 1):
            for left in range(len(piles) - length + 1):
                right = left + length - 1
                dp[left] = max(piles[left] - dp[left + 1], piles[right] - dp[left])
        return dp[0] > 0`, 'O(n²)', 'O(n)'),
  solution(649, 'Senators act in circular order and ban an opponent. Both parties play optimally. Return the winning party, Radiant or Dire.', 'Input: senate = "RDD"\nOutput: "Dire"',
    'Keep each party’s upcoming turns in a queue. The earlier senator bans the other, then rejoins their queue one round later. Queue head indices avoid shifting arrays.',
`var predictPartyVictory = function(senate) {
    const radiant = [];
    const dire = [];
    const n = senate.length;
    for (let i = 0; i < n; i++) {
        if (senate[i] === 'R') radiant.push(i);
        else dire.push(i);
    }
    let r = 0;
    let d = 0;
    while (r < radiant.length && d < dire.length) {
        const radiantTurn = radiant[r++];
        const direTurn = dire[d++];
        if (radiantTurn < direTurn) radiant.push(radiantTurn + n);
        else dire.push(direTurn + n);
    }
    return r < radiant.length ? 'Radiant' : 'Dire';
};`,
`from collections import deque
class Solution:
    def predictPartyVictory(self, senate):
        radiant = deque(i for i, party in enumerate(senate) if party == 'R')
        dire = deque(i for i, party in enumerate(senate) if party == 'D')
        while radiant and dire:
            r, d = radiant.popleft(), dire.popleft()
            if r < d:
                radiant.append(r + len(senate))
            else:
                dire.append(d + len(senate))
        return 'Radiant' if radiant else 'Dire'`, 'O(n)', 'O(n)'),
  solution(2807, 'Insert a new node between every original pair of adjacent list nodes. Its value is the greatest common divisor of that pair.', 'Input: head = [18,6,10,3]\nOutput: [18,6,6,2,10,1,3]',
    'Use Euclid’s remainder algorithm for each original adjacent pair, splice in its GCD, then advance to the next original node.',
`var insertGreatestCommonDivisors = function(head) {
    function gcd(a, b) {
        while (b !== 0) {
            const remainder = a % b;
            a = b;
            b = remainder;
        }
        return a;
    }
    let current = head;
    while (current && current.next) {
        const next = current.next;
        const value = gcd(current.val, next.val);
        current.next = new ListNode(value, next);
        current = next;
    }
    return head;
};`,
`from math import gcd
class Solution:
    def insertGreatestCommonDivisors(self, head):
        current = head
        while current and current.next:
            following = current.next
            current.next = ListNode(gcd(current.val, following.val), following)
            current = following
        return head`, 'O(n log M), M = largest node value', 'O(1) auxiliary, O(n) new nodes'),
  solution(3133, 'Find the smallest possible last value of a strictly increasing positive array of length n whose bitwise AND is x.', 'Input: n = 3, x = 4\nOutput: 6',
    'Every value must contain all set bits of x. Put the bits of n − 1 into the zero-bit positions of x. BigInt avoids JavaScript’s 32-bit bitwise truncation.',
`var minEnd = function(n, x) {
    let answer = BigInt(x);
    let remaining = BigInt(n - 1);
    let bit = 1n;
    while (remaining > 0n) {
        if ((answer & bit) === 0n) {
            if ((remaining & 1n) !== 0n) answer |= bit;
            remaining >>= 1n;
        }
        bit <<= 1n;
    }
    return Number(answer);
};`,
`class Solution:
    def minEnd(self, n, x):
        answer, remaining, bit = x, n - 1, 1
        while remaining:
            if answer & bit == 0:
                if remaining & 1:
                    answer |= bit
                remaining >>= 1
            bit <<= 1
        return answer`, 'O(log n + log x)', 'O(1) fixed constraint-sized integers'),
];

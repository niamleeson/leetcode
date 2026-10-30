import { SolutionFollowUp } from './types';

export const iterativeGraphSolutions: Record<number, SolutionFollowUp> = {
  695: {
    title: 'Iterative DFS (explicit stack)',
    label: 'Alternative',
    walkthroughVariant: 'iterative',
    approach: 'Scan for land. For each new island, use a stack to visit its cells and count its area. Mark cells as water before pushing them so each land cell enters the stack once. After finishing the island, update maxArea. This modifies the input grid.',
    code: `class Solution:
    def maxAreaOfIsland(self, grid: list[list[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        max_area = 0
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        def island_area(r: int, c: int) -> int:
            stack = []
            area = 0
            grid[r][c] = 0
            stack.append((r, c))
            while stack:
                r, c = stack.pop()
                area += 1
                for dr, dc in directions:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                        grid[nr][nc] = 0
                        stack.append((nr, nc))
            return area

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    area = island_area(r, c)
                    max_area = max(max_area, area)
        return max_area`,
    jsCode: `var maxAreaOfIsland = function(grid) {
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
};`,
    explanation: `- The helper has its own r and c, separate from the outer grid scan.
- Mark the starting cell and each discovered neighbor as 0 before pushing.
- Each pop processes one distinct land cell, so increment area once per pop.
- Check only horizontal and vertical neighbors; diagonal land is separate.
- When the stack empties, return the island's area and update maxArea.
- The explicit stack replaces recursive calls and avoids recursion-depth limits.`,
    timeComplexity: 'O(m * n): each cell is scanned and each land cell is pushed once',
    spaceComplexity: 'O(m * n) in the worst case for the explicit stack',
  },
  133: {
    title: 'Iterative DFS (explicit stack)',
    label: 'Alternative',
    walkthroughVariant: 'iterative',
    approach: 'Map each original node to its clone as soon as it is discovered. Use a stack of original nodes whose neighbor lists still need copying. Create and schedule unseen neighbors, then connect their existing clones. The map handles cycles and shared neighbors without modifying the original graph.',
    code: `class Solution:
    def cloneGraph(self, node: 'Node') -> 'Node':
        if not node:
            return None

        cloned = {node: Node(node.val)}
        stack = [node]
        while stack:
            original = stack.pop()
            copy = cloned[original]
            for neighbor in original.neighbors:
                if neighbor not in cloned:
                    cloned[neighbor] = Node(neighbor.val)
                    stack.append(neighbor)
                copy.neighbors.append(cloned[neighbor])
        return cloned[node]`,
    jsCode: `var cloneGraph = function(node) {
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
};`,
    explanation: `- cloned uses original node identity as the key, not its value.
- Store each clone before pushing its original node, so cycles cannot schedule it twice.
- Popping an original node selects the clone whose neighbor list is being filled.
- Append a clone for every original neighbor, even when that neighbor was already discovered.
- Every returned node is new; the cloned graph preserves the original connections and neighbor order.
- An empty input returns null (None in Python).`,
    timeComplexity: 'O(V + E): visit each reachable node and copy each neighbor entry once',
    spaceComplexity: 'O(V) auxiliary space for the map and stack; O(V + E) for the cloned output',
  },
  130: {
    title: 'Iterative DFS (explicit stack)',
    label: 'Alternative',
    walkthroughVariant: 'iterative',
    approach: 'Start from border O cells and use an explicit stack to mark all connected O cells as safe (S). Mark before pushing to prevent duplicate work. Then capture the remaining O cells and restore safe cells. The board is modified in place.',
    code: `class Solution:
    def solve(self, board: list[list[str]]) -> None:
        if not board:
            return
        rows, cols = len(board), len(board[0])
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        def mark_safe(r: int, c: int) -> None:
            stack = []
            board[r][c] = "S"
            stack.append((r, c))
            while stack:
                r, c = stack.pop()
                for dr, dc in directions:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] == "O":
                        board[nr][nc] = "S"
                        stack.append((nr, nc))

        for r in range(rows):
            for c in range(cols):
                on_border = r == 0 or r == rows - 1 or c == 0 or c == cols - 1
                if on_border and board[r][c] == "O":
                    mark_safe(r, c)

        for r in range(rows):
            for c in range(cols):
                if board[r][c] == "O":
                    board[r][c] = "X"
                elif board[r][c] == "S":
                    board[r][c] = "O"`,
    jsCode: `var solve = function(board) {
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
};`,
    explanation: `- Only O cells connected horizontally or vertically to the border are safe.
- Mark a discovered safe cell as S before pushing it; each safe cell enters the stack once.
- The helper's r and c track the popped cell; nr and nc identify the neighbor being checked.
- After all border searches finish, remaining O cells are surrounded and become X.
- Restore S cells to O only after all searches finish, so they cannot be discovered again.
- The function updates the original board and returns no value.`,
    timeComplexity: 'O(m * n): each cell is scanned and each safe cell is pushed once',
    spaceComplexity: 'O(m * n) in the worst case for the explicit stack',
  },
  332: {
    title: "Iterative Hierholzer's algorithm (explicit stack)",
    label: 'Alternative',
    walkthroughVariant: 'iterative',
    approach: 'Keep the current airport path in a stack. Consume the smallest available destination from the top airport. When that airport has no unused outgoing tickets, pop it into the route. Reverse the completed route to recover the itinerary. Every ticket is consumed exactly once, including duplicate tickets.',
    code: `class Solution:
    def findItinerary(self, tickets: list[list[str]]) -> list[str]:
        graph = {}
        for src, dst in sorted(tickets, reverse=True):
            graph.setdefault(src, []).append(dst)

        stack = ["JFK"]
        route = []
        while stack:
            airport = stack[-1]
            destinations = graph.get(airport, [])
            if destinations:
                next_airport = destinations.pop()
                stack.append(next_airport)
            else:
                finished_airport = stack.pop()
                route.append(finished_airport)
        return route[::-1]`,
    jsCode: `var findItinerary = function(tickets) {
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
};`,
    explanation: `- Store destinations in reverse lexical order so pop removes the smallest.
- The stack replaces active recursive calls, starting at JFK.
- A destination pop consumes one ticket; pushing that destination extends the current path.
- Move an airport from the stack to route only when it has no outgoing tickets left.
- Reverse route because airports were finalized in reverse itinerary order.
- Airports may appear more than once. Track used tickets, not visited airports; a visited set would incorrectly discard valid flights.`,
    timeComplexity: 'O(E log E) for sorting; O(E) for consuming tickets and building the route',
    spaceComplexity: 'O(E) for adjacency lists, the explicit stack, and route',
  },
};

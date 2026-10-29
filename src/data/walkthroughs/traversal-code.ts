import { OrangeStep, TreeStep } from './traversals';

function sourceLines(code: string, statements: string[]): number[] {
  const lines = code.split('\n').map(line => line.trim());
  const selected = statements.map(statement => lines.indexOf(statement) + 1);
  return selected.includes(0) ? [] : [...new Set(selected)].sort((first, second) => first - second);
}

export function treeCodeLines(step: TreeStep, code: string): number[] {
  switch (step.action) {
    case 'start': return sourceLines(code, ['if (!root) {']);
    case 'enqueue': return sourceLines(code, ['const result = [];', 'const queue = [root];']);
    case 'level-start': return sourceLines(code, ['while (queue.length) {', 'const levelSize = queue.length;', 'const currentLevel = [];']);
    case 'dequeue': return sourceLines(code, ['const node = queue.shift();']);
    case 'record': return sourceLines(code, ['currentLevel.push(node.val);']);
    case 'child': {
      const side = step.checked!.side;
      return sourceLines(code, [`if (node.${side}) {`, ...(step.noop ? [] : [`queue.push(node.${side});`])]);
    }
    case 'level-end': return sourceLines(code, ['result.push(currentLevel);']);
    case 'return': return sourceLines(code, step.result.length ? ['return result;'] : ['if (!root) {', 'return [];']);
  }
}

export function orangeCodeLines(step: OrangeStep, code: string): number[] {
  switch (step.action) {
    case 'start': return sourceLines(code, ['const rows = grid.length;', 'const cols = grid[0].length;', 'const queue = [];', 'let freshCount = 0;']);
    case 'scan': {
      const [row, column] = step.checked!;
      if (step.grid[row][column] === 2) return sourceLines(code, ['if (grid[r][c] === 2) {', 'queue.push([r, c]);']);
      if (step.grid[row][column] === 1) return sourceLines(code, ['} else if (grid[r][c] === 1) {', 'freshCount++;']);
      return sourceLines(code, ['if (grid[r][c] === 2) {', '} else if (grid[r][c] === 1) {']);
    }
    case 'bfs-start': return sourceLines(code, ['if (freshCount === 0) return 0;', 'const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];', 'let minutesElapsed = 0;']);
    case 'round-start': return sourceLines(code, ['while (queue.length > 0) {', 'const levelSize = queue.length;']);
    case 'dequeue': return sourceLines(code, ['const [r, c] = queue.shift();']);
    case 'neighbor': {
      const [row, column] = step.checked!;
      const outside = row < 0 || row >= step.grid.length || column < 0 || column >= step.grid[0].length;
      const condition = 'if (inBounds && grid[neighborRow][neighborCol] === 1) {';
      if (outside) return sourceLines(code, ['const inBounds = neighborRow >= 0 && neighborRow < rows &&', 'neighborCol >= 0 && neighborCol < cols;', condition]);
      return sourceLines(code, [condition, ...(step.noop ? [] : ['grid[neighborRow][neighborCol] = 2;', 'freshCount--;'])]);
    }
    case 'enqueue': return sourceLines(code, ['queue.push([neighborRow, neighborCol]);']);
    case 'round-end': return sourceLines(code, ['minutesElapsed++;']);
    case 'return': return sourceLines(code, step.answer === 0 && step.elapsed === 0
      ? ['if (freshCount === 0) return 0;']
      : ['return freshCount === 0 ? minutesElapsed - 1 : -1;']);
  }
}

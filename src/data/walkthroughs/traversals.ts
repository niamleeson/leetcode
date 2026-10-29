export interface TraversalStep {
  title: string;
  detail: string;
  noop?: boolean;
}

export interface TreeTraceNode {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  depth: number;
  position: number;
}

export interface TreeStep extends TraversalStep {
  action: 'start' | 'enqueue' | 'level-start' | 'dequeue' | 'record' | 'child' | 'level-end' | 'return';
  queue: number[];
  current: number | null;
  checked?: { side: 'left' | 'right'; child: number | null };
  level: number[];
  result: number[][];
  recorded: number[];
  levelIndex: number;
  remaining: number;
  changed?: number;
}

export function buildTreeTrace(values: Array<number | null>) {
  const nodes: TreeTraceNode[] = [];
  if (values.length && values[0] !== null) {
    nodes.push({ id: 0, value: values[0], left: null, right: null, depth: 0, position: 0.5 });
    let nextValue = 1;
    for (let parentIndex = 0; parentIndex < nodes.length && nextValue < values.length; parentIndex++) {
      const parent = nodes[parentIndex];
      for (const side of ['left', 'right'] as const) {
        const value = values[nextValue++];
        if (value === undefined || value === null) continue;
        const child = {
          id: nodes.length, value, left: null, right: null, depth: parent.depth + 1,
          position: parent.position + (side === 'left' ? -1 : 1) / 2 ** (parent.depth + 2),
        };
        parent[side] = child.id;
        nodes.push(child);
      }
    }
  }

  const steps: TreeStep[] = [];
  const queue: number[] = [];
  const result: number[][] = [];
  const recorded: number[] = [];
  let current: number | null = null;
  let level: number[] = [];
  let levelIndex = -1;
  let remaining = 0;
  function emit(action: TreeStep['action'], title: string, detail: string, extra: Partial<TreeStep> = {}) {
    steps.push({
      action, title, detail, queue: [...queue], current, level: [...level],
      result: result.map(row => [...row]), recorded: [...recorded], levelIndex, remaining, ...extra,
    });
  }

  emit('start', 'Start with the root', 'Queue front is on the left.');
  if (!nodes.length) {
    emit('return', 'Root is null → return []', 'There are no nodes to enqueue.');
    return { nodes, steps };
  }

  queue.push(0);
  emit('enqueue', `Enqueue ${nodes[0].value}`, 'The root starts the queue.', { changed: 0 });
  while (queue.length) {
    const levelSize = queue.length;
    remaining = levelSize;
    current = null;
    level = [];
    levelIndex++;
    emit('level-start', `Start level ${levelIndex}`, `Take ${levelSize} ${levelSize === 1 ? 'node' : 'nodes'} from the queue this round.`);
    for (let nodeIndex = 0; nodeIndex < levelSize; nodeIndex++) {
      current = queue.shift()!;
      remaining--;
      const node = nodes[current];
      emit('dequeue', `Dequeue → ${node.value}`, 'This node is now current.');
      level.push(node.value);
      recorded.push(current);
      emit('record', `Append ${node.value} to this level`, `Level: [${level.join(', ')}]`, { changed: current });
      for (const side of ['left', 'right'] as const) {
        const child = node[side];
        if (child === null) {
          emit('child', `${node.value}.${side} = null`, 'No enqueue. Queue and output stay unchanged.', { noop: true, checked: { side, child } });
        } else {
          queue.push(child);
          emit('child', `${node.value}.${side} → enqueue ${nodes[child].value}`, 'The child joins the back of the queue.', { checked: { side, child }, changed: child });
        }
      }
    }
    result.push([...level]);
    emit('level-end', `Save level ${levelIndex}`, `Append [${level.join(', ')}] to the result.`);
  }
  current = null;
  emit('return', `Return ${JSON.stringify(result)}`, 'Queue is empty. Every level is complete.');
  return { nodes, steps };
}

export const treeTraceExamples = [
  { name: 'Three nodes', values: [1, 2, 3] },
  { name: 'Uneven tree', values: [3, 9, 20, null, null, 15, 7] },
  { name: 'Empty tree', values: [] },
].map(example => ({ ...example, ...buildTreeTrace(example.values) }));

export type CellPosition = [number, number];

export interface OrangeStep extends TraversalStep {
  action: 'start' | 'scan' | 'bfs-start' | 'round-start' | 'dequeue' | 'neighbor' | 'enqueue' | 'round-end' | 'return';
  grid: number[][];
  queue: CellPosition[];
  fresh: number;
  elapsed: number;
  current?: CellPosition;
  checked?: CellPosition;
  direction?: string;
  remaining: number;
  changed?: CellPosition;
  answer?: number;
}

export function cellLabel(cell: CellPosition) {
  return `(${cell[0]},${cell[1]})`;
}

export function buildOrangeSteps(input: number[][]): OrangeStep[] {
  const grid = input.map(row => [...row]);
  const queue: CellPosition[] = [];
  const steps: OrangeStep[] = [];
  let fresh = 0;
  let elapsed = 0;
  let remaining = 0;
  let current: CellPosition | undefined;
  function emit(action: OrangeStep['action'], title: string, detail: string, extra: Partial<OrangeStep> = {}) {
    steps.push({
      action, title, detail, grid: grid.map(row => [...row]), queue: queue.map(cell => [...cell]),
      fresh, elapsed, remaining, current: current ? [...current] : undefined, ...extra,
    });
  }

  emit('start', 'Scan the grid', '1 = fresh · 2 = rotten · 0 = empty');
  for (let row = 0; row < grid.length; row++) {
    for (let column = 0; column < grid[row].length; column++) {
      const cell: CellPosition = [row, column];
      if (grid[row][column] === 2) {
        queue.push(cell);
        emit('scan', `Scan ${cellLabel(cell)} → enqueue`, 'This orange is already rotten.', { checked: cell, changed: cell });
      } else if (grid[row][column] === 1) {
        fresh++;
        emit('scan', `Scan ${cellLabel(cell)} → fresh: ${fresh - 1} → ${fresh}`, 'Count this fresh orange.', { checked: cell });
      } else {
        emit('scan', `Scan ${cellLabel(cell)} → empty`, 'Queue and fresh count stay unchanged.', { checked: cell, noop: true });
      }
    }
  }
  if (fresh === 0) {
    emit('return', 'No fresh oranges → return 0', 'No spreading is needed.', { answer: 0 });
    return steps;
  }
  emit('bfs-start', `Fresh = ${fresh} → start BFS`, 'Only the oranges already in the queue spread this round.');

  const directions = [
    { row: 1, column: 0, label: '↓ Down' },
    { row: -1, column: 0, label: '↑ Up' },
    { row: 0, column: 1, label: '→ Right' },
    { row: 0, column: -1, label: '← Left' },
  ];
  while (queue.length) {
    const levelSize = queue.length;
    remaining = levelSize;
    current = undefined;
    emit('round-start', `Start round ${elapsed + 1}`, `Dequeue ${levelSize} ${levelSize === 1 ? 'orange' : 'oranges'} this round.`);
    for (let queueIndex = 0; queueIndex < levelSize; queueIndex++) {
      current = queue.shift()!;
      remaining--;
      emit('dequeue', `Dequeue → ${cellLabel(current)}`, 'Check down, up, right, then left.');
      for (const direction of directions) {
        const checked: CellPosition = [current[0] + direction.row, current[1] + direction.column];
        const [row, column] = checked;
        const extra = { checked, direction: direction.label };
        if (row < 0 || row >= grid.length || column < 0 || column >= grid[0].length) {
          emit('neighbor', `${direction.label}: ${cellLabel(checked)} → outside grid`, 'Grid, queue, and fresh count stay unchanged.', { ...extra, noop: true });
        } else if (grid[row][column] !== 1) {
          emit('neighbor', `${direction.label}: ${cellLabel(checked)} → ${grid[row][column] === 2 ? 'already rotten' : 'empty'}`, 'Grid, queue, and fresh count stay unchanged.', { ...extra, noop: true });
        } else {
          grid[row][column] = 2;
          fresh--;
          emit('neighbor', `${direction.label}: ${cellLabel(checked)} · 1 → 2`, `Fresh: ${fresh + 1} → ${fresh}`, { ...extra, changed: checked });
          queue.push(checked);
          emit('enqueue', `Enqueue ${cellLabel(checked)}`, 'This orange will spread in the next round.', { ...extra, changed: checked });
        }
      }
    }
    elapsed++;
    emit('round-end', `Counter: ${elapsed - 1} → ${elapsed}`, 'Every orange from the start of this round has been checked.');
  }
  current = undefined;
  emit('return', fresh === 0 ? `Return ${elapsed} − 1 = ${elapsed - 1}` : 'Return −1',
    fresh === 0 ? 'The final round changed no cells. Subtract that extra round.' : `${fresh} fresh ${fresh === 1 ? 'orange is' : 'oranges are'} unreachable.`,
    { answer: fresh === 0 ? elapsed - 1 : -1 });
  return steps;
}

export const orangeTraceExamples = [
  { name: 'Small grid', grid: [[2, 1], [1, 1]] },
  { name: 'Two starting points', grid: [[2, 1, 2], [1, 1, 1]] },
  { name: 'Unreachable orange', grid: [[2, 1, 1], [0, 1, 1], [1, 0, 1]] },
  { name: 'No fresh oranges', grid: [[0, 2]] },
].map(example => ({ ...example, steps: buildOrangeSteps(example.grid) }));

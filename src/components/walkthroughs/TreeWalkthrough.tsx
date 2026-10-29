import { TreeStep, TreeTraceNode, treeTraceExamples } from '../../data/walkthroughs/traversals';
import { treeCodeLines } from '../../data/walkthroughs/traversal-code';
import { solutionMap } from '../../data/solutions';
import WalkthroughPlayer, { TraceQueue } from './WalkthroughPlayer';

function TreePicture({ nodes, step }: { nodes: TreeTraceNode[]; step: TreeStep }) {
  const width = 440;
  const depth = Math.max(0, ...nodes.map(node => node.depth));
  const height = (depth + 2) * 80 + 30;
  const position = (node: TreeTraceNode) => ({ x: node.position * width, y: node.depth * 80 + 45 });
  const current = step.current === null ? undefined : nodes[step.current];
  const checked = step.checked;
  const missingPosition = current && checked?.child === null ? {
    x: (current.position + (checked.side === 'left' ? -1 : 1) / 2 ** (current.depth + 2)) * width,
    y: (current.depth + 1) * 80 + 45,
  } : undefined;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Tree. ${nodes.map(node => `Node ${node.value}: left ${node.left === null ? 'null' : nodes[node.left].value}, right ${node.right === null ? 'null' : nodes[node.right].value}`).join('. ')}. ${current ? `Current node ${current.value}.` : ''} ${checked ? `Checking ${checked.side} child: ${checked.child === null ? 'null' : nodes[checked.child].value}.` : ''}`} className="traversal-tree">
      {nodes.flatMap(node => (['left', 'right'] as const).map(side => {
        const childId = node[side];
        if (childId === null) return null;
        const start = position(node);
        const end = position(nodes[childId]);
        const active = node.id === step.current && checked?.side === side;
        return <g key={`${node.id}-${side}`}>
          <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} className={`traversal-edge ${active ? 'is-active' : ''}`} />
          {active && <text x={(start.x + end.x) / 2 + (side === 'left' ? -12 : 12)} y={(start.y + end.y) / 2} className="traversal-edge-label" textAnchor={side === 'left' ? 'end' : 'start'}>{side}</text>}
        </g>;
      }))}
      {missingPosition && current && <g>
        <line x1={position(current).x} y1={position(current).y} x2={missingPosition.x} y2={missingPosition.y} className="traversal-edge is-noop" />
        <circle cx={missingPosition.x} cy={missingPosition.y} r={18} className="traversal-null" />
        <text x={missingPosition.x} y={missingPosition.y + 5} className="traversal-null-label" textAnchor="middle">∅</text>
        <text x={missingPosition.x} y={missingPosition.y + 36} className="traversal-edge-label" textAnchor="middle">{checked?.side} = null</text>
      </g>}
      {nodes.map(node => {
        const point = position(node);
        const isCurrent = node.id === step.current;
        const isChecked = checked?.child === node.id;
        return <g key={node.id} className={`traversal-node ${isCurrent ? 'is-current' : ''} ${isChecked ? 'is-checked' : ''} ${step.recorded.includes(node.id) ? 'is-recorded' : ''}`}>
          <circle cx={point.x} cy={point.y} r={22} />
          <text x={point.x} y={point.y + 6} textAnchor="middle">{node.value}</text>
          {isCurrent && <text x={point.x} y={point.y - 29} textAnchor="middle" className="traversal-node-caption">current</text>}
        </g>;
      })}
      {!nodes.length && <text x={width / 2} y={height / 2} textAnchor="middle" className="traversal-null-label">root = null</text>}
    </svg>
  );
}

export default function TreeWalkthrough() {
  return <WalkthroughPlayer name="Level order traversal" examples={treeTraceExamples} code={solutionMap[102].jsCode!} codeLines={treeCodeLines}>
    {(step, exampleIndex) => {
      const nodes = treeTraceExamples[exampleIndex].nodes;
      return <div className="traversal-layout">
        <div className="traversal-picture-panel">
          <span className="traversal-picture-label">Tree</span>
          <TreePicture nodes={nodes} step={step} />
        </div>
        <div className="traversal-state">
          <TraceQueue entries={step.queue.map(nodeId => ({ id: String(nodeId), label: String(nodes[nodeId].value) }))} changed={step.changed === undefined ? undefined : String(step.changed)} remaining={step.levelIndex < 0 ? undefined : step.remaining} />
          <div className="traversal-panel">
            <h5>{step.levelIndex < 0 ? 'Current level' : `Level ${step.levelIndex}`}</h5>
            <div className="traversal-chips" aria-label={`Current level: [${step.level.join(', ')}]`}>
              {step.level.length ? step.level.map((value, index) => <span key={index} className={`traversal-chip ${step.action === 'record' && index === step.level.length - 1 ? 'is-changed' : ''}`}>{value}</span>) : <span className="traversal-empty">[]</span>}
            </div>
          </div>
          <div className={`traversal-panel ${step.action === 'return' ? 'traversal-answer' : ''}`}>
            <h5>{step.action === 'return' ? 'Answer' : 'Result'}</h5>
            <div className="traversal-result" aria-label={`Result: ${JSON.stringify(step.result)}`}>
              {step.result.length ? step.result.map((row, index) => <div key={index} className={step.action === 'level-end' && index === step.result.length - 1 ? 'is-changed' : ''}>[{row.join(', ')}]</div>) : '[]'}
            </div>
          </div>
        </div>
      </div>;
    }}
  </WalkthroughPlayer>;
}

import { useId } from 'react';
import { CellPosition, OrangeStep, cellLabel, orangeTraceExamples } from '../../data/walkthroughs/traversals';
import WalkthroughPlayer, { TraceQueue } from './WalkthroughPlayer';

function sameCell(first: CellPosition | undefined, second: CellPosition | undefined) {
  return !!first && !!second && first[0] === second[0] && first[1] === second[1];
}

function OrangeGrid({ step }: { step: OrangeStep }) {
  const arrowId = useId();
  const rows = step.grid.length;
  const columns = step.grid[0].length;
  const cellSize = 70;
  const center = (cell: CellPosition) => ({ x: (cell[1] + 1.5) * cellSize, y: (cell[0] + 1.5) * cellSize });
  const outside = step.checked && (step.checked[0] < 0 || step.checked[0] >= rows || step.checked[1] < 0 || step.checked[1] >= columns);
  const source = step.current && center(step.current);
  const target = step.checked && center(step.checked);
  const deltaRow = step.current && step.checked ? step.checked[0] - step.current[0] : 0;
  const deltaColumn = step.current && step.checked ? step.checked[1] - step.current[1] : 0;

  return <svg viewBox={`0 0 ${(columns + 2) * cellSize} ${(rows + 2) * cellSize}`} role="img" className="traversal-grid" aria-label={`Orange grid: ${step.grid.map(row => row.join(', ')).join('; ')}. ${step.current ? `Current ${cellLabel(step.current)}.` : ''} ${step.checked ? `Checking ${cellLabel(step.checked)}${outside ? ', outside grid' : ''}.` : ''}`}>
    <defs><marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className={step.noop ? 'traversal-arrow-noop' : 'traversal-arrow'} /></marker></defs>
    {step.grid.flatMap((row, rowIndex) => row.map((value, columnIndex) => {
      const cell: CellPosition = [rowIndex, columnIndex];
      const point = center(cell);
      return <g key={`${rowIndex}-${columnIndex}`} className={`traversal-cell cell-${value} ${sameCell(step.current, cell) ? 'is-current' : ''} ${sameCell(step.checked, cell) ? step.noop ? 'is-noop' : 'is-checked' : ''}`}>
        <rect x={point.x - 27} y={point.y - 27} width={54} height={54} rx={8} />
        <text x={point.x} y={point.y + 2} className="traversal-cell-value" textAnchor="middle">{value}</text>
        <text x={point.x} y={point.y + 18} className="traversal-cell-coordinate" textAnchor="middle">{cellLabel(cell)}</text>
        {sameCell(step.current, cell) && <circle cx={point.x - 18} cy={point.y - 18} r={3} className="traversal-current-dot" />}
      </g>;
    }))}
    {outside && target && <g className="traversal-outside">
      <rect x={target.x - 27} y={target.y - 27} width={54} height={54} rx={8} />
      <text x={target.x} y={target.y - 2} textAnchor="middle">×</text>
      <text x={target.x} y={target.y + 14} textAnchor="middle" className="traversal-outside-label">outside</text>
    </g>}
    {source && target && step.direction && <line x1={source.x + deltaColumn * 29} y1={source.y + deltaRow * 29} x2={target.x - deltaColumn * 29} y2={target.y - deltaRow * 29} markerEnd={`url(#${arrowId})`} className={`traversal-check-arrow ${step.noop ? 'is-noop' : ''}`} />}
  </svg>;
}

export default function OrangesWalkthrough() {
  return <WalkthroughPlayer name="Rotting oranges" examples={orangeTraceExamples}>
    {step => <div className="traversal-layout">
      <div className="traversal-picture-panel">
        <span className="traversal-picture-label">Grid · (row, column)</span>
        <OrangeGrid step={step} />
        <div className="traversal-legend"><span>1 Fresh</span><span className="traversal-rotten-key">2 Rotten</span><span>0 Empty</span><span className="traversal-current-key">● Current</span></div>
      </div>
      <div className="traversal-state">
        <TraceQueue entries={step.queue.map(cell => ({ id: cellLabel(cell), label: cellLabel(cell) }))} changed={step.changed ? cellLabel(step.changed) : undefined} remaining={['start', 'scan', 'bfs-start'].includes(step.action) ? undefined : step.remaining} />
        <div className="traversal-metrics">
          <div className="traversal-panel"><h5>Fresh oranges</h5><p className="traversal-metric" aria-label={`Fresh oranges: ${step.fresh}`}>{step.fresh}</p></div>
          <div className="traversal-panel"><h5>Minutes counter</h5><p className="traversal-metric" aria-label={`Minutes counter: ${step.elapsed}`}>{step.elapsed}</p></div>
        </div>
        {step.answer !== undefined && <div className="traversal-panel traversal-answer"><h5>Answer</h5><p className="traversal-metric" aria-label={`Answer: ${step.answer}`}>{step.answer === -1 ? '−1 · unreachable' : `${step.answer} ${step.answer === 1 ? 'minute' : 'minutes'}`}</p></div>}
      </div>
    </div>}
  </WalkthroughPlayer>;
}

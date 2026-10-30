import { useId } from 'react';
import { TraceHeap, TraceValue } from '../../data/walkthroughs/execution';
import { GraphModel, graphModels, graphNodeState, layoutGraph } from '../../data/walkthroughs/graphs';

function GraphPicture({graph,state,heap}:{graph:GraphModel;state:Record<string,TraceValue>;heap:TraceHeap}) {
  const arrowId=useId().replace(/:/g,'');
  const {positions,width,height}=layoutGraph(graph);
  const statuses=new Map(graph.nodes.map(node=>[node.key,graphNodeState(node,graph,state,heap)]));
  return <section className="traversal-panel execution-structure"><h5>{graph.title}</h5>
    <div className="execution-diagram-canvas" tabIndex={0} aria-label={`${graph.title} diagram, scroll horizontally if needed`}>
    <svg viewBox={`0 0 ${width} ${height}`} style={{width:`${width}px`}} role="img" aria-label={`${graph.directed?'Directed graph':'Graph'} from ${graph.title}`}>
      <defs><marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker></defs>
      {graph.edges.map((edge,i)=>{
        const a=positions.get(edge.from)!,b=positions.get(edge.to)!;
        const distance=Math.hypot(b.x-a.x,b.y-a.y)||1,dx=(b.x-a.x)/distance,dy=(b.y-a.y)/distance;
        const reverse=graph.directed&&graph.edges.some(other=>other.from===edge.to&&other.to===edge.from);
        const parallel=graph.edges.filter(other=>other.from===edge.from&&other.to===edge.to);
        const bend=reverse?30+parallel.indexOf(edge)*20:parallel.length>1?(parallel.indexOf(edge)-(parallel.length-1)/2)*36:0;
        const cx=(a.x+b.x)/2-dy*bend,cy=(a.y+b.y)/2+dx*bend;
        const loop=edge.from===edge.to;
        const path=loop?`M ${a.x-15} ${a.y-17} C ${a.x-60} ${a.y-80}, ${a.x+60} ${a.y-80}, ${a.x+15} ${a.y-17}`:
          `M ${a.x+dx*23} ${a.y+dy*23} Q ${cx} ${cy}, ${b.x-dx*25} ${b.y-dy*25}`;
        return <g className="execution-link" key={i} data-from={edge.from} data-to={edge.to}>
          <path d={path} markerEnd={graph.directed?`url(#${arrowId})`:undefined}/>
          {edge.weight!==undefined&&<text className="execution-edge-weight" x={loop?a.x:(a.x+2*cx+b.x)/4} y={loop?a.y-65:(a.y+2*cy+b.y)/4-5}><title>{`Weight: ${edge.weight}`}</title>{edge.weight.length>10&&Number.isFinite(Number(edge.weight))?`≈${Number(edge.weight).toPrecision(4)}`:edge.weight}</text>}
        </g>;
      })}
      {graph.nodes.map(node=>{
        const p=positions.get(node.key)!,status=statuses.get(node.key)!;
        return <g key={node.key} data-node-key={node.key} transform={`translate(${p.x},${p.y})`} className={`execution-node ${status.labels.length?'is-current':''} ${status.visited?'is-visited':''} ${status.queued?'is-queued':''} ${node.blocked?'is-blocked':''}`}>
          <title>{`${node.caption?`${node.label}: ${node.caption}`:node.label}${status.labels.length?` (${status.labels.join(', ')})`:''}`}</title>
          <circle r="22"/><text textAnchor="middle" dy="5" className={node.label.length>4?'execution-long-label':undefined}>{node.label}</text>
          {node.caption&&<text className="execution-node-id" textAnchor="middle" y="38">{node.caption}</text>}
          <text className="execution-node-pointer" textAnchor="middle" y="-30">{status.labels.join(', ')}</text>
        </g>;
      })}
    </svg></div>
    {[...statuses.values()].some(status=>status.queued||status.visited)&&<p className="execution-graph-legend"><span className="is-queued">Dashed: queued</span><span className="is-visited">Blue fill: visited</span></p>}
    {graph.nodes.some(node=>node.blocked)&&<p className="execution-empty">Amber nodes are deadends.</p>}
  </section>;
}

export default function ExecutionGraph({id,input,state,heap}:{id:number;input:Record<string,TraceValue>;state:Record<string,TraceValue>;heap:TraceHeap}) {
  return <>{graphModels(id,input,state,heap).map(graph=><GraphPicture key={graph.title} graph={graph} state={state} heap={heap}/>)}</>;
}

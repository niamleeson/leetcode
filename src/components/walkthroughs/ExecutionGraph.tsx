import { useId } from 'react';
import { TraceHeap, TraceValue, objectFor, formatValue } from '../../data/walkthroughs/execution';

export default function ExecutionGraph({id,input,state,heap}:{id:number;input:Record<string,TraceValue>;state:Record<string,TraceValue>;heap:TraceHeap}) {
  const arrowId=useId().replace(/:/g,'');
  const edgeName=['prerequisites','edges','times','flights','tickets','equations','rowConditions','trust'].find(name=>input[name]);
  if(!edgeName)return null;
  const rows=objectFor(input[edgeName],heap)?.items || [];
  const edges=rows.map(row=>objectFor(row,heap)?.items || []).filter(row=>row.length>=2).map(row=>{
    const reverse=edgeName==='prerequisites'&&id!==1462;
    return {from:formatValue(row[reverse?1:0],heap),to:formatValue(row[reverse?0:1],heap),weight:row.length>2?formatValue(row[2],heap):''};
  });
  const nodes=[...new Set(edges.flatMap(e=>[e.from,e.to]))];
  const count=input.numCourses??input.n;
  if(typeof count==='number'&&count<=15)for(let i=edgeName==='times'||edgeName==='trust'?1:0;i<(edgeName==='times'||edgeName==='trust'?count+1:count);i++)if(!nodes.includes(String(i)))nodes.push(String(i));
  if(!nodes.length||nodes.length>20)return null;
  const directed=edgeName!=='edges'&&edgeName!=='equations';
  const positions=new Map(nodes.map((node,i)=>{const angle=2*Math.PI*i/nodes.length-Math.PI/2;return[node,{x:250+180*Math.cos(angle),y:145+100*Math.sin(angle)}];}));
  return <div className="traversal-panel execution-structure"><h5>{edgeName}</h5><svg viewBox="0 0 500 290" role="img" aria-label={`${directed?'Directed graph':'Graph'} from ${edgeName}`}>
    <defs><marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker></defs>
    {edges.map((edge,i)=>{const a=positions.get(edge.from)!,b=positions.get(edge.to)!;const distance=Math.hypot(b.x-a.x,b.y-a.y)||1;return <g className="execution-link" key={i}><line x1={a.x+(b.x-a.x)/distance*22} y1={a.y+(b.y-a.y)/distance*22} x2={b.x-(b.x-a.x)/distance*24} y2={b.y-(b.y-a.y)/distance*24} markerEnd={directed?`url(#${arrowId})`:undefined}/>{edge.weight&&<text x={(a.x+b.x)/2} y={(a.y+b.y)/2-7}>{edge.weight}</text>}</g>;})}
    {nodes.map(node=>{const p=positions.get(node)!;const labels=Object.entries(state).filter(([name,value])=>/^(node|current|course|u|v|neighbor|before|after|src|dst|airport)$/.test(name)&&formatValue(value,heap)===node).map(([name])=>name);return <g key={node} transform={`translate(${p.x},${p.y})`} className={`execution-node ${labels.length?'is-current':''}`}><circle r="22"/><text textAnchor="middle" dy="5">{node.replace(/^"|"$/g,'')}</text><text className="execution-node-pointer" textAnchor="middle" y="-30">{labels.join(', ')}</text></g>;})}
  </svg></div>;
}

import { useId } from 'react';
import { TraceHeap, TraceValue, formatValue, isReference, objectFor } from '../../data/walkthroughs/execution';
import { collectStructure, layoutTree, nodeChanged, TreeOccurrence } from '../../data/walkthroughs/structure';

export default function ExecutionDiagram({ roots, state, heap, previousHeap, callers=[], result, resultOnly=false, isReturn=false }: {
  roots:Record<string,TraceValue>;state:Record<string,TraceValue>;heap:TraceHeap;previousHeap:TraceHeap;
  callers?:TraceValue[];result?:TraceValue;resultOnly?:boolean;isReturn?:boolean;
}) {
  const arrowId=useId().replace(/:/g,'');
  const originalIds=new Set(collectStructure(Object.values(roots),heap).keys());
  const values=resultOnly?[]:[...Object.values(roots),...callers,...Object.values(state)];
  if(result!==undefined)values.push(result);
  const nodes=collectStructure(values,heap);
  if(!nodes.size)return resultOnly?<div className="execution-empty" role="img" aria-label="Empty returned tree">Returned tree = null</div>:null;
  const entries=[...nodes];
  const tree=entries.every(([,node])=>['tree','quad'].includes(node.kind));
  const quad=entries.every(([,node])=>node.kind==='quad');
  const list=entries.every(([,node])=>node.kind==='list');
  let width=640,height=380,occurrences:TreeOccurrence[]=[],edges:{from:string;to:string;label:string}[]=[];
  if(tree) {
    const layout=layoutTree(nodes);({width,height,occurrences,edges}=layout);
  } else {
    if(list) {
      occurrences=entries.map(([id],i)=>({id,key:id,x:55+(i%5)*110,y:60+Math.floor(i/5)*120}));
      width=550;height=Math.max(150,Math.ceil(entries.length/5)*120+30);
    } else {
      const originals=entries.filter(([id])=>originalIds.has(id));
      const copies=entries.filter(([id])=>!originalIds.has(id));
      const copiedFrom=new Map<string,string>();
      for(const [from,to] of objectFor(state.cloned,heap)?.entries||[])if(isReference(from)&&isReference(to))copiedFrom.set(to.$ref,from.$ref);
      if(isReference(state.original)&&isReference(state.copy))copiedFrom.set(state.copy.$ref,state.original.$ref);
      for(const [group,center] of [[originals,160],[copies,480]] as const)group.forEach(([id],index)=>{
        const originalId=copiedFrom.get(id)||id;
        const slot=originals.findIndex(([key])=>key===originalId);
        const angle=(slot<0?index:slot)*2*Math.PI/Math.max(1,originals.length||group.length)-Math.PI/2;
        occurrences.push({id,key:id,x:center+110*Math.cos(angle),y:180+110*Math.sin(angle)});
      });
    }
    edges=entries.flatMap(([id,node])=>node.edges.map(edge=>({from:id,to:edge.to,label:edge.label})));
  }
  const positions=new Map(occurrences.map(node=>[node.key,node]));
  return <div className="execution-structure"><div className="execution-diagram-canvas" tabIndex={0} aria-label="Structure diagram, scroll horizontally if needed">
    <svg role="img" aria-label={`${quad?'Quad tree':tree?'Tree':list?'Linked list':'Graph'} with current code pointers`} viewBox={`0 0 ${width} ${height}`} style={{width:`${width}px`}}>
      <defs><marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker></defs>
      {!tree&&!list&&originalIds.size>0&&<g className="execution-link"><text x="160" y="20">Input nodes</text>{entries.some(([id])=>!originalIds.has(id))&&<text x="480" y="20">New nodes</text>}</g>}
      {edges.map((edge,index)=>{
        const from=positions.get(edge.from),to=positions.get(edge.to);if(!from||!to)return null;
        const distance=Math.hypot(to.x-from.x,to.y-from.y)||1;
        const dx=(to.x-from.x)/distance,dy=(to.y-from.y)/distance;
        return <g key={index} className={`execution-link ${to.id?'':'is-missing'}`} data-from={from.id} data-to={to.id||'null'} data-side={edge.label}>
          {from.key===to.key?<path d={`M ${from.x-15} ${from.y-16} C ${from.x-55} ${from.y-65}, ${from.x+55} ${from.y-65}, ${from.x+15} ${from.y-16}`} markerEnd={`url(#${arrowId})`}/>:<line x1={from.x+dx*23} y1={from.y+dy*23} x2={to.x-dx*(to.id?24:16)} y2={to.y-dy*(to.id?24:16)} markerEnd={to.id?`url(#${arrowId})`:undefined}/>}
          {edge.label&&<text x={from.x+(to.x-from.x)*0.62} y={from.y+(to.y-from.y)*0.62-4}>{({topLeft:'TL',topRight:'TR',bottomLeft:'BL',bottomRight:'BR'} as Record<string,string>)[edge.label]||edge.label}</text>}
        </g>;
      })}
      {occurrences.map(position=>{
        if(!position.id)return <g key={position.key} transform={`translate(${position.x},${position.y})`} className="execution-null"><rect x="-22" y="-12" width="44" height="24" rx="5"/><text textAnchor="middle" dy="4">null</text></g>;
        const id=position.id,node=nodes.get(id)!;
        const pointers=Object.entries(state).filter(([,value])=>isReference(value)&&value.$ref===id).map(([name])=>name);
        if(isReturn&&isReference(result)&&result.$ref===id)pointers.push('return');
        const value=node.kind==='quad'?(heap[id].fields?.isLeaf?Number(node.value):'branch'):formatValue(node.value,heap);
        return <g key={position.key} data-node-id={id} transform={`translate(${position.x},${position.y})`} className={`execution-node ${pointers.length?'is-current':''} ${nodeChanged(id,previousHeap,heap)?'is-changed':''}`}>
          <circle r="22"/><text textAnchor="middle" dy="5" className={node.kind==='quad'?'execution-quad-value':undefined}>{value}</text>
          <text className="execution-node-id" textAnchor="middle" y="38">{id}{position.referenceOnly?' ↩':''}</text>
          {pointers.length>0&&<text className="execution-node-pointer" textAnchor="middle" y="-30">{pointers.join(', ')}</text>}
        </g>;
      })}
    </svg>
  </div><p className="execution-empty">Labels are code variables. Repeated IDs refer to the same node.</p></div>;
}

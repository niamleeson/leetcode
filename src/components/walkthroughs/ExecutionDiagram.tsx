import { useId } from 'react';
import { TraceHeap, TraceValue, formatValue, isReference, objectFor, valueChanged } from '../../data/walkthroughs/execution';

export default function ExecutionDiagram({ roots, state, heap, previousHeap }: { roots: Record<string,TraceValue>; state: Record<string,TraceValue>; heap:TraceHeap; previousHeap:TraceHeap }) {
  const arrowId = useId().replace(/:/g,'');
  const nodes = new Map<string,{value:TraceValue;kind:string;edges:Array<{to:string;label:string}>}>();
  const containers = new Set<string>();
  function visit(value: TraceValue) {
    if (!isReference(value) || nodes.has(value.$ref) || containers.has(value.$ref)) return;
    const object = objectFor(value,heap);
    if (!object) return;
    if (!['tree','graph','list','quad'].includes(object.kind)) {
      containers.add(value.$ref);
      (object.items || object.entries?.flat() || Object.values(object.fields || {})).forEach(visit);
      return;
    }
    const node = {value:object.fields!.val,kind:object.kind,edges:[] as Array<{to:string;label:string}>};
    nodes.set(value.$ref,node);
    const links = object.kind === 'quad' ? ['topLeft','topRight','bottomLeft','bottomRight'] : object.kind === 'tree' ? ['left','right'] : object.kind === 'list' ? ['next','random'] : [];
    for(const label of links) {
      const child=object.fields?.[label];
      if(isReference(child)){node.edges.push({to:child.$ref,label});visit(child);}
    }
    if(object.kind==='graph')for(const child of objectFor(object.fields?.neighbors,heap)?.items || [])if(isReference(child)){node.edges.push({to:child.$ref,label:''});visit(child);}
  }
  Object.values(roots).forEach(visit);
  const originalIds = new Set(nodes.keys());
  Object.values(state).forEach(visit);
  if(!nodes.size)return null;
  const entries=[...nodes];
  const positions=new Map<string,{x:number;y:number}>();
  const tree=entries.every(([,n])=>n.kind==='tree'||n.kind==='quad');
  const list=entries.every(([,n])=>n.kind==='list');
  let height=280;
  if(tree) {
    const childIds=new Set(entries.flatMap(([,node])=>node.edges.map(e=>e.to)));
    const rootIds=entries.filter(([id])=>!childIds.has(id)).map(([id])=>id);
    const placed=new Set<string>();let leaf=0,maxDepth=0;
    function place(id:string,depth:number):number {
      if(placed.has(id))return positions.get(id)?.x || 0;
      placed.add(id);maxDepth=Math.max(maxDepth,depth);
      const children=nodes.get(id)?.edges || [];
      const xs=children.map(e=>place(e.to,depth+1));
      const x=xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:leaf++;
      positions.set(id,{x,y:50+depth*82});return x;
    }
    rootIds.forEach(id=>{place(id,0);leaf++;});
    for(const position of positions.values())position.x=45+position.x*430/Math.max(1,leaf-1);
    height=100+maxDepth*82;
  } else if(list) {
    entries.forEach(([id],i)=>positions.set(id,{x:55+(i%5)*100,y:55+Math.floor(i/5)*110}));
    height=Math.max(140,Math.ceil(entries.length/5)*110+30);
  } else {
    const originals=entries.filter(([id])=>originalIds.has(id));
    const copies=entries.filter(([id])=>!originalIds.has(id));
    if(originals.length) {
      for(const [group,center] of [[originals,125],[copies,395]] as const) group.forEach(([id,node],i)=>{
        const slot=originals.findIndex(([,original])=>JSON.stringify(original.value)===JSON.stringify(node.value));
        const angle=(slot<0?i:slot)*2*Math.PI/originals.length-Math.PI/2;
        positions.set(id,{x:center+85*Math.cos(angle),y:170+100*Math.sin(angle)});
      });
    } else entries.forEach(([id],i)=>{const angle=i*2*Math.PI/entries.length-Math.PI/2;positions.set(id,{x:260+190*Math.cos(angle),y:160+115*Math.sin(angle)});});
    height=320;
  }
  return <div className="execution-structure"><svg role="img" aria-label={`${tree?'Tree':list?'Linked list':'Graph'} with current code pointers`} viewBox={`0 0 520 ${height}`}>
    <defs><marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker></defs>
    {!tree&&!list&&originalIds.size>0&&<g className="execution-link"><text x="125" y="20">Input nodes</text><text x="395" y="20">New nodes</text></g>}
    {entries.flatMap(([id,node])=>node.edges.map((edge,index)=>{
      const from=positions.get(id),to=positions.get(edge.to);if(!from||!to)return null;
      const distance=Math.hypot(to.x-from.x,to.y-from.y)||1;
      const dx=(to.x-from.x)/distance*23,dy=(to.y-from.y)/distance*23;
      return <g key={`${id}-${index}`} className="execution-link">{id===edge.to?<path d={`M ${from.x-15} ${from.y-16} C ${from.x-55} ${from.y-65}, ${from.x+55} ${from.y-65}, ${from.x+15} ${from.y-16}`} markerEnd={`url(#${arrowId})`}/>:<line x1={from.x+dx} y1={from.y+dy} x2={to.x-dx} y2={to.y-dy} markerEnd={`url(#${arrowId})`}/>} {edge.label&&<text x={(from.x+to.x)/2} y={id===edge.to?from.y-52:(from.y+to.y)/2-7}>{edge.label}</text>}</g>;
    }))}
    {entries.map(([id,node])=>{
      const position=positions.get(id);if(!position)return null;
      const pointers=Object.entries(state).filter(([,v])=>isReference(v)&&v.$ref===id).map(([name])=>name);
      const changed=valueChanged({$ref:id},{$ref:id},previousHeap,heap);
      return <g key={id} transform={`translate(${position.x},${position.y})`} className={`execution-node ${pointers.length?'is-current':''} ${changed?'is-changed':''}`}><circle r="22"/><text textAnchor="middle" dy="5">{formatValue(node.value,heap)}</text><text className="execution-node-id" textAnchor="middle" y="38">{id}</text>{pointers.length>0&&<text className="execution-node-pointer" textAnchor="middle" y="-30">{pointers.join(', ')}</text>}</g>;
    })}
  </svg><p className="execution-empty">Node IDs distinguish equal values. Labels show code variables.</p></div>;
}

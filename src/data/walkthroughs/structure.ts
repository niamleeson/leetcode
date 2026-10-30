import { ExecutionStep, TraceHeap, TraceValue, isReference, objectFor } from './execution';

export interface StructureNode {
  id: string;
  value: TraceValue;
  kind: string;
  edges: {to:string;label:string}[];
}
export function collectStructure(values: TraceValue[], heap: TraceHeap) {
  const nodes=new Map<string,StructureNode>(),seen=new Set<string>();
  function visit(value:TraceValue) {
    if(!isReference(value)||seen.has(value.$ref))return;
    seen.add(value.$ref);
    const object=objectFor(value,heap);if(!object)return;
    if(!['tree','quad','graph','list'].includes(object.kind)) {
      (object.items||object.entries?.flat()||Object.values(object.fields||{})).forEach(visit);return;
    }
    const node:StructureNode={id:value.$ref,value:object.fields!.val,kind:object.kind,edges:[]};
    nodes.set(node.id,node);
    const links=object.kind==='quad'?['topLeft','topRight','bottomLeft','bottomRight']:object.kind==='tree'?['left','right']:object.kind==='list'?['next','random']:[];
    for(const label of links) {
      const child=object.fields?.[label];
      if(isReference(child)){node.edges.push({to:child.$ref,label});visit(child);}
    }
    if(object.kind==='graph')for(const child of objectFor(object.fields?.neighbors,heap)?.items||[])if(isReference(child)) {
      node.edges.push({to:child.$ref,label:''});visit(child);
    }
  }
  values.forEach(visit);
  return nodes;
}

// Suspended recursive calls still own their partially constructed nodes.
// Keep these visible until that call returns, without retaining dead locals.
export function suspendedValuesFor(steps: ExecutionStep[]) {
  const frames:Record<string,TraceValue>[]=[];
  return steps.map(step=>{
    frames.length=step.stack.length;
    if(frames.length)frames[frames.length-1]=step.state;
    return frames.slice(0,-1).flatMap(frame=>Object.values(frame||{}));
  });
}

export function nodeChanged(id:string, previous:TraceHeap, heap:TraceHeap) {
  if(JSON.stringify(previous[id])!==JSON.stringify(heap[id]))return true;
  // Mutating a neighbor list changes this node; mutating a descendant does not.
  if(heap[id]?.kind==='graph') {
    const before=objectFor(previous[id]?.fields?.neighbors,previous)?.items;
    const after=objectFor(heap[id]?.fields?.neighbors,heap)?.items;
    return JSON.stringify(before)!==JSON.stringify(after);
  }
  return false;
}

export interface TreeOccurrence {
  key:string; id?:string; x:number; y:number; label?:string; referenceOnly?:boolean;
}
export function layoutTree(nodes: Map<string,StructureNode>) {
  const childIds=new Set([...nodes.values()].flatMap(node=>node.edges.map(edge=>edge.to)));
  const ids=[...nodes.keys()].sort((a,b)=>Number(a.slice(1))-Number(b.slice(1)));
  const roots=ids.filter(id=>!childIds.has(id));
  const occurrences:TreeOccurrence[]=[],edges:{from:string;to:string;label:string}[]=[];
  const represented=new Set<string>();let right=32,maxDepth=0;
  type Branch={id?:string;key:string;label?:string;width:number;children:Branch[];referenceOnly?:boolean};
  function branch(id:string|undefined,key:string,label:string|undefined,ancestors:Set<string>):Branch {
    if(!id||!nodes.has(id))return {key,label,width:72,children:[]};
    represented.add(id);
    const node=nodes.get(id)!;
    if(ancestors.has(id))return {id,key,label,width:72,children:[],referenceOnly:true};
    if(!node.edges.length)return {id,key,label,width:72,children:[]};
    const slots=node.kind==='quad'?['topLeft','topRight','bottomLeft','bottomRight']:['left','right'];
    const next=new Set(ancestors).add(id);
    const children=slots.map(slot=>branch(node.edges.find(edge=>edge.label===slot)?.to,`${key}/${slot}`,slot,next));
    return {id,key,label,children,width:children.reduce((sum,child)=>sum+child.width,0)};
  }
  function place(item:Branch,left:number,depth:number) {
    // The boundary between the left and right subtrees is the parent position.
    // Missing children retain a slot instead of centering the sole child below it.
    const x=left+(item.children.length===2?item.children[0].width:item.width/2);
    occurrences.push({key:item.key,id:item.id,x,y:60+depth*104,label:item.label,referenceOnly:item.referenceOnly});
    maxDepth=Math.max(maxDepth,depth);
    let offset=left;
    for(const child of item.children){place(child,offset,depth+1);edges.push({from:item.key,to:child.key,label:child.label!});offset+=child.width;}
  }
  for(const id of [...roots,...ids])if(!represented.has(id)) {
    const item=branch(id,id,undefined,new Set());place(item,right,0);right+=item.width+56;
  }
  const width=Math.max(320,right-24),offset=(width-(right-24))/2;
  occurrences.forEach(node=>node.x+=offset);
  return {occurrences,edges,width,height:120+maxDepth*104};
}

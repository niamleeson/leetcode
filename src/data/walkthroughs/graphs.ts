import { ExecutionStep, TraceHeap, TraceValue, formatValue, isReference, objectFor } from './execution';

export interface GraphNode { key:string;value:TraceValue;label:string;caption?:string;x?:number;y?:number;blocked?:boolean }
export interface GraphEdge { from:string;to:string;weight?:string;directed?:boolean;ignored?:boolean }
export interface GraphModel { title:string;directed:boolean;nodes:GraphNode[];edges:GraphEdge[];active?:boolean;width?:number;height?:number;pointerNames?:string[] }
export interface GraphContext { variant?:string;conditionGraphs?:Record<string,TraceValue>;lockCurrent?:string;lockNeighbors?:string[] }
export const graphKey=(value:TraceValue)=>JSON.stringify(value);
const labelFor=(value:TraceValue,heap:TraceHeap)=>typeof value==='string'?value:formatValue(value,heap);

// Preserve each helper's graph reference after it returns, without looking ahead
// in the trace. Earlier contexts stay immutable so Back and Reset cannot leak edges.
export function graphContextsFor(id:number,steps:ExecutionStep[]):GraphContext[] {
  if(id!==2392&&id!==752)return [];
  let conditionGraphs:Record<string,TraceValue>={},lockCurrent:string|undefined,lockNeighbors:string[]=[];
  const heap:TraceHeap={};
  return steps.map(step=>{
    const {state}=step;
    if(id===2392&&isReference(state.conditions)&&isReference(state.graph)) {
      conditionGraphs={...conditionGraphs,[state.conditions.$ref]:state.graph};
    }
    if(id===752) {
      Object.assign(heap,step.heap);
      const removed=step.kind==='operation'&&step.label==='queue.shift()'?objectFor(step.value,heap)?.items?.[0]:undefined;
      const queued=objectFor(objectFor(state.queue,heap)?.items?.[0],heap)?.items?.[0];
      const current=typeof removed==='string'?removed:typeof state.currentState==='string'?state.currentState:lockCurrent??queued;
      if(typeof current==='string'&&current!==lockCurrent){lockCurrent=current;lockNeighbors=[];}
      if(typeof lockCurrent==='string'&&typeof state.newState==='string'&&!lockNeighbors.includes(state.newState)) {
        lockNeighbors=[...lockNeighbors,state.newState];
      }
    }
    return {conditionGraphs,lockCurrent,lockNeighbors};
  });
}

export function graphModels(id:number,input:Record<string,TraceValue>,state:Record<string,TraceValue>,heap:TraceHeap,context:GraphContext={}):GraphModel[] {
  const items=(value:TraceValue|undefined)=>objectFor(value,heap)?.items||[];
  const rows=(value:TraceValue|undefined)=>items(value).map(items);
  function model(title:string,directed:boolean,values:TraceValue[],edges:GraphEdge[],active=true):GraphModel {
    const unique=[...new Map(values.map(value=>[graphKey(value),value])).values()].sort((a,b)=>typeof a==='number'&&typeof b==='number'?a-b:String(a).localeCompare(String(b)));
    return {title,directed,edges,active,nodes:unique.map(value=>({key:graphKey(value),value,label:labelFor(value,heap)}))};
  }
  const edge=(from:TraceValue,to:TraceValue,weight?:TraceValue):GraphEdge=>({from:graphKey(from),to:graphKey(to),weight:weight===undefined?undefined:labelFor(weight,heap)});
  const entries=(value:TraceValue|undefined):[TraceValue,TraceValue][]=>{
    const object=objectFor(value,heap);
    return object?.entries||object?.items?.map((item,index)=>[index,item])||[];
  };
  function adjacency(value:TraceValue|undefined,weighted=false):GraphEdge[] {
    return entries(value).flatMap(([from,neighbors])=>{
      const object=objectFor(neighbors,heap);
      if(object?.kind==='map')return (object.entries||[]).map(([to,weight])=>edge(from,to,weight));
      return items(neighbors).map(neighbor=>{
        const pair=weighted?items(neighbor):[];
        return pair.length?edge(from,pair[0],pair[1]):edge(from,neighbor);
      });
    });
  }
  function undirected(edges:GraphEdge[]):GraphEdge[] {
    const links=new Map(edges.map(link=>[JSON.stringify([link.from,link.to]),link]));
    const seen=new Set<string>(),result:GraphEdge[]=[];
    for(const link of edges) {
      const pair=JSON.stringify([link.from,link.to].sort());
      if(seen.has(pair))continue;
      seen.add(pair);
      const reciprocal=links.has(JSON.stringify([link.to,link.from]));
      result.push({...link,directed:!reciprocal});
    }
    return result;
  }
  const parents=()=>entries(state.parent).filter(([child,parent])=>graphKey(child)!==graphKey(parent)).map(([child,parent])=>edge(child,parent));
  if(id===269) {
    const values=items(input.words).flatMap(word=>typeof word==='string'?word.split(''):[]);
    const edges=(objectFor(state.adj,heap)?.entries||[]).flatMap(([from,neighbors])=>items(neighbors).map(to=>edge(from,to)));
    return [model('Character constraints',true,values,edges)];
  }
  if(id===127) {
    const values=[...new Set([input.beginWord,...items(input.wordList)])].filter((value):value is string=>typeof value==='string');
    const edges:GraphEdge[]=[],seen=new Set<string>();
    for(const [,bucket] of entries(state.neighbors)) {
      const words=items(bucket);
      words.forEach((a,i)=>words.slice(i+1).forEach(b=>{
        const key=JSON.stringify([graphKey(a),graphKey(b)].sort());
        if(graphKey(a)!==graphKey(b)&&!seen.has(key)){seen.add(key);edges.push(edge(a,b));}
      }));
    }
    return [model('One-letter transformations',false,values,edges)];
  }
  if(id===752) {
    const queued=rows(state.queue)[0]?.[0];
    const current=context.lockCurrent??(typeof state.currentState==='string'?state.currentState:queued);
    if(typeof current!=='string')return [];
    const blocked=new Set(items(input.deadends).map(graphKey));
    const generated=context.lockNeighbors??(typeof state.newState==='string'?[state.newState]:[]);
    const graph=model('Current lock state and generated neighbors',false,[current,...generated],generated.map(value=>edge(current,value)));
    // Reserve space, not future nodes. A generated neighbor keeps the slot for
    // its wheel and direction, so revealing another state never moves it.
    graph.width=510;graph.height=510;
    graph.nodes.forEach(node=>{
      node.blocked=blocked.has(node.key);
      if(node.value===current){node.x=250;node.y=250;return;}
      const value=node.value as string;
      const wheel=[...current].findIndex((digit,index)=>digit!==value[index]);
      const up=Number(value[wheel])===(Number(current[wheel])+1)%10;
      const angle=(wheel*2+(up?0:1))*Math.PI/4-Math.PI/2;
      node.x=250+175*Math.cos(angle);node.y=250+175*Math.sin(angle);
    });
    return [graph];
  }
  if(id===1584) {
    const points=rows(input.points),values=points.map((_,i)=>i);
    const unionFind=context.variant==='union-find';
    const graph=model(unionFind?'Points · union-find parents':'Accepted point connections',unionFind,values,unionFind?parents():undirected(adjacency(state.graph)));
    const xs=points.map(point=>Number(point[0])),ys=points.map(point=>Number(point[1]));
    const scale=Math.min(72,480/Math.max(1,Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)));
    graph.nodes.forEach(node=>{const i=Number(node.value);node.x=70+(xs[i]-Math.min(...xs))*scale;node.y=70+(Math.max(...ys)-ys[i])*scale;node.caption=`(${xs[i]}, ${ys[i]})`;});
    return [graph];
  }
  if(id===721) {
    const emails=rows(input.accounts).flatMap(account=>account.slice(1));
    const unionFind=context.variant==='union-find';
    const graph=model(unionFind?'Email parents (union-find)':'Email connections',unionFind,emails,unionFind?parents():undirected(adjacency(state.graph)));
    graph.nodes.forEach((node,i)=>{node.caption=node.label;node.label=`email ${i+1}`;});
    return [graph];
  }
  if(id===2709) {
    const nums=items(input.nums);
    const unionFind=context.variant==='union-find';
    const graph=model(unionFind?'Union-find parents':'Shared-prime connections',unionFind,nums.map((_,i)=>i),unionFind?parents():undirected(adjacency(state.graph)));
    graph.pointerNames=['i','index','other','node','neighbor','x','a','b','root'];
    graph.nodes.forEach(node=>{node.caption=`nums[${node.value}] = ${nums[Number(node.value)]}`;});
    return [graph];
  }
  const names=['prerequisites','edges','times','flights','tickets','equations','rowConditions','colConditions','trust'].filter(name=>name in input);
  return names.map(name=>{
    const source=rows(input[name]).filter(row=>row.length>=2),values=source.flatMap(row=>row.slice(0,2));
    let edges:GraphEdge[]=[],title=name,directed=name!=='edges';
    const count=input.numCourses??input.n??(id===2392?input.k:undefined);
    const start=['times','trust','rowConditions','colConditions'].includes(name)?1:0;
    if(typeof count==='number'&&Number.isInteger(count)&&count>=0)for(let i=start;i<start+count;i++)values.push(i);
    const active=id!==2392||(isReference(state.conditions)&&isReference(input[name])&&state.conditions.$ref===input[name].$ref);
    if([207,210,261,399,743,332].includes(id)||([323,684,1489].includes(id)&&context.variant!=='union-find'))edges=adjacency(state.graph,id===743);
    else if(id===310)edges=adjacency(state.adj);
    else if(id===1462) {
      edges=isReference(state.graph)?adjacency(state.graph):rows(state.reach).flatMap((row,from)=>row.flatMap((connected,to)=>connected===true?[edge(from,to)]:[]));
    } else if(id===2392) {
      const condition=input[name];
      const graph=active?state.graph:isReference(condition)?context.conditionGraphs?.[condition.$ref]:undefined;
      edges=adjacency(graph);
    } else if([323,684,1489].includes(id)) {
      title='Union-find parents';directed=true;
      const allowed=new Set(values.map(graphKey));
      edges=parents().filter(link=>allowed.has(link.from)&&allowed.has(link.to));
    } else {
      // These algorithms read an already-existing edge list directly; there is
      // no constructed adjacency structure to animate (e.g. Bellman-Ford).
      title=`Input ${name}`;
      edges=source.map(row=>edge(row[0],row[1],row[2]));
    }
    if(!directed)edges=undirected(edges);
    if(id===684&&context.variant!=='union-find'&&typeof state.i==='number'&&typeof state.a==='number'&&typeof state.b==='number') {
      const a=graphKey(state.a),b=graphKey(state.b);
      edges=edges.map(link=>({...link,ignored:(link.from===a&&link.to===b)||(link.from===b&&link.to===a)}));
    }
    return model(title,directed,values,edges,active);
  }).filter(graph=>graph.nodes.length>0);
}

export function layoutGraph(graph:GraphModel) {
  const widest=Math.max(72,...graph.nodes.map(node=>(node.caption?.length||node.label.length)*6+24));
  const radius=Math.max(105,graph.nodes.length*widest/(2*Math.PI));
  const padding=Math.max(80,widest/2+20);
  const positions=new Map(graph.nodes.map((node,i)=>{
    const angle=2*Math.PI*i/graph.nodes.length-Math.PI/2;
    return [node.key,{x:node.x??(radius+padding+(graph.nodes.length===1?0:radius*Math.cos(angle))),y:node.y??(radius+80+(graph.nodes.length===1?0:radius*Math.sin(angle)))}];
  }));
  return {positions,width:graph.width??Math.max(320,...[...positions.values()].map(p=>p.x+widest/2+35)),height:graph.height??Math.max(250,...[...positions.values()].map(p=>p.y+80))};
}

export function graphNodeState(node:GraphNode,graph:GraphModel,state:Record<string,TraceValue>,heap:TraceHeap) {
  if(graph.active===false)return {labels:[],visited:false,queued:false};
  const pointerNames=new Set(['node','parent','start','target','next','current','currentNode','course','dependentCourse','prereq','prerequisite','u','v','neighbor','before','after','src','dst','airport','from','to','char','currentWord','currentState','newState','leaf','rootX','rootY','pu','pv','x','y','a','b','value','email','firstEmail','other']);
  const labels=Object.entries(state).filter(([name,value])=>(graph.pointerNames?graph.pointerNames.includes(name):pointerNames.has(name))&&graphKey(value)===node.key).map(([name])=>name);
  const visited=(objectFor(state.visited,heap)?.items||objectFor(state.visitedStates,heap)?.items||[]).some(value=>graphKey(value)===node.key);
  const pending=objectFor(state.queue??state.stack,heap)?.items||[];
  const head=state.queue!==undefined&&typeof state.head==='number'?state.head:0;
  const queued=pending.slice(head).some(value=>graphKey(objectFor(value,heap)?.items?.[0]??value)===node.key);
  return {labels,visited,queued};
}

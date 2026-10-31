import { TraceHeap, TraceValue, formatValue, isReference, objectFor } from './execution';

export interface GraphNode { key:string;value:TraceValue;label:string;caption?:string;x?:number;y?:number;blocked?:boolean }
export interface GraphEdge { from:string;to:string;weight?:string }
export interface GraphModel { title:string;directed:boolean;nodes:GraphNode[];edges:GraphEdge[];active?:boolean }
export const graphKey=(value:TraceValue)=>JSON.stringify(value);
const labelFor=(value:TraceValue,heap:TraceHeap)=>typeof value==='string'?value:formatValue(value,heap);
export function graphModels(id:number,input:Record<string,TraceValue>,state:Record<string,TraceValue>,heap:TraceHeap):GraphModel[] {
  const items=(value:TraceValue|undefined)=>objectFor(value,heap)?.items||[];
  const rows=(value:TraceValue|undefined)=>items(value).map(items);
  function model(title:string,directed:boolean,values:TraceValue[],edges:GraphEdge[],active=true):GraphModel {
    const unique=[...new Map(values.map(value=>[graphKey(value),value])).values()].sort((a,b)=>typeof a==='number'&&typeof b==='number'?a-b:String(a).localeCompare(String(b)));
    return {title,directed,edges,active,nodes:unique.map(value=>({key:graphKey(value),value,label:labelFor(value,heap)}))};
  }
  const edge=(from:TraceValue,to:TraceValue,weight?:TraceValue):GraphEdge=>({from:graphKey(from),to:graphKey(to),weight:weight===undefined?undefined:labelFor(weight,heap)});
  if(id===269) {
    const values=items(input.words).flatMap(word=>typeof word==='string'?word.split(''):[]);
    const edges=(objectFor(state.adj,heap)?.entries||[]).flatMap(([from,neighbors])=>items(neighbors).map(to=>edge(from,to)));
    return [model('Character constraints',true,values,edges)];
  }
  if(id===127) {
    const values=[...new Set([input.beginWord,...items(input.wordList)])].filter((value):value is string=>typeof value==='string');
    const edges:GraphEdge[]=[];
    values.forEach((a,i)=>values.slice(i+1).forEach(b=>{if(a.length===b.length&&a.split('').filter((char,j)=>char!==b[j]).length===1)edges.push(edge(a,b));}));
    return [model('One-letter transformations',false,values,edges)];
  }
  if(id===752) {
    const current=typeof state.currentState==='string'?state.currentState:'0000';
    const blocked=new Set(items(input.deadends).map(graphKey));
    const neighbors=Array.from({length:8},(_,i)=>{
      const wheel=Math.floor(i/2),delta=i%2===0?1:-1;
      return current.slice(0,wheel)+(Number(current[wheel])+delta+10)%10+current.slice(wheel+1);
    });
    const graph=model('Current lock state and one-move neighbors',false,[current,...neighbors],neighbors.map(value=>edge(current,value)));
    graph.nodes.forEach(node=>{
      node.blocked=blocked.has(node.key);
      const index=neighbors.indexOf(node.value as string),angle=index*Math.PI/4-Math.PI/2;
      node.x=index<0?250:250+175*Math.cos(angle);node.y=index<0?250:250+175*Math.sin(angle);
    });
    return [graph];
  }
  if(id===1584) {
    const points=rows(input.points),values=points.map((_,i)=>i);
    const edges=rows(state.edges).filter(row=>row.length>=3).map(([weight,from,to])=>edge(from,to,weight));
    const graph=model('Points and generated Manhattan distances',false,values,edges);
    const xs=points.map(point=>Number(point[0])),ys=points.map(point=>Number(point[1]));
    const scale=Math.min(72,480/Math.max(1,Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)));
    graph.nodes.forEach(node=>{const i=Number(node.value);node.x=70+(xs[i]-Math.min(...xs))*scale;node.y=70+(Math.max(...ys)-ys[i])*scale;node.caption=`(${xs[i]}, ${ys[i]})`;});
    return [graph];
  }
  if(id===721) {
    const emails=rows(input.accounts).flatMap(account=>account.slice(1));
    const edges=(objectFor(state.parent,heap)?.entries||[]).filter(([a,b])=>graphKey(a)!==graphKey(b)).map(([a,b])=>edge(a,b));
    const graph=model('Email parents (union-find)',true,emails,edges);
    graph.nodes.forEach((node,i)=>{node.caption=node.label;node.label=`email ${i+1}`;});
    return [graph];
  }
  if(id===2709) {
    const nums=items(input.nums),edges:GraphEdge[]=[];
    const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a;
    nums.forEach((a,i)=>nums.slice(i+1).forEach((b,j)=>{if(gcd(Number(a),Number(b))>1)edges.push(edge(i,i+j+1));}));
    const graph=model('Connections with a common factor',false,nums.map((_,i)=>i),edges);
    graph.nodes.forEach(node=>{node.caption=`nums[${node.value}] = ${nums[Number(node.value)]}`;});
    return [graph];
  }
  const names=['prerequisites','edges','times','flights','tickets','equations','rowConditions','colConditions','trust'].filter(name=>name in input);
  return names.map(name=>{
    const source=rows(input[name]).filter(row=>row.length>=2),values=source.flatMap(row=>row.slice(0,2));
    let edges=source.map(row=>name==='prerequisites'&&id!==1462?edge(row[1],row[0],row[2]):edge(row[0],row[1],row[2]));
    if(name==='equations') {
      const ratios=items(input.values);
      edges=source.flatMap(([a,b],i)=>[edge(a,b,ratios[i]),edge(b,a,1/Number(ratios[i]))]);
    }
    const count=input.numCourses??input.n??(id===2392?input.k:undefined);
    const start=['times','trust','rowConditions','colConditions'].includes(name)?1:0;
    if(typeof count==='number'&&Number.isInteger(count)&&count>=0)for(let i=start;i<start+count;i++)values.push(i);
    const active=id!==2392||(isReference(state.conditions)&&isReference(input[name])&&state.conditions.$ref===input[name].$ref);
    return model(name,name!=='edges',values,edges,active);
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
  return {positions,width:Math.max(320,...[...positions.values()].map(p=>p.x+widest/2+35)),height:Math.max(250,...[...positions.values()].map(p=>p.y+80))};
}

export function graphNodeState(node:GraphNode,graph:GraphModel,state:Record<string,TraceValue>,heap:TraceHeap) {
  if(graph.active===false)return {labels:[],visited:false,queued:false};
  const pointerNames=new Set(['node','parent','start','next','current','currentNode','course','dependentCourse','prereq','prerequisite','u','v','neighbor','before','after','src','dst','airport','from','to','char','currentWord','currentState','newState','leaf','rootX','rootY','pu','pv','x','y','a','b','value']);
  const labels=Object.entries(state).filter(([name,value])=>pointerNames.has(name)&&graphKey(value)===node.key).map(([name])=>name);
  const visited=(objectFor(state.visited,heap)?.items||objectFor(state.visitedStates,heap)?.items||[]).some(value=>graphKey(value)===node.key);
  const pending=objectFor(state.queue??state.stack,heap)?.items||[];
  const head=state.queue!==undefined&&typeof state.head==='number'?state.head:0;
  const queued=pending.slice(head).some(value=>graphKey(objectFor(value,heap)?.items?.[0]??value)===node.key);
  return {labels,visited,queued};
}

import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { ExecutionTrace, TraceHeap, TraceValue, materialize, objectFor } from './execution';
import { graphContextsFor, graphModels, layoutGraph } from './graphs';

const trace=(key:string)=>JSON.parse(readFileSync(`src/data/walkthroughs/generated/${key}.json`,'utf8')) as ExecutionTrace;
const sorted=(values:unknown[])=>values.map(value=>JSON.stringify(value)).sort();

it.each(['207','210','261','1462-bfs','323-bfs','399','743','332','332-iterative','310','269'])('%s draws exactly the stored adjacency entries, including weights, duplicates, and removals',key=>{
  const data=trace(key);
  for(const example of data.examples) {
    const heap:TraceHeap={};
    let initialPositions:Map<string,{x:number;y:number}>|undefined;
    for(const [index,step] of example.steps.entries()) {
      Object.assign(heap,step.heap);
      const graph=graphModels(data.id,step.input,step.state,heap,{variant:data.variant})[0];
      const positions=layoutGraph(graph).positions;
      initialPositions??=positions;
      expect(positions).toEqual(initialPositions);
      if(index===0)expect(graph.edges).toEqual([]);

      const stored=objectFor(step.state.graph??step.state.adj,heap);
      const buckets:[TraceValue,TraceValue][]=stored?.entries||stored?.items?.map((value,i)=>[i,value])||[];
      const expected:unknown[]=[];
      for(const [from,reference] of buckets) {
        const bucket=objectFor(reference,heap)!;
        if(bucket.kind==='map') {
          for(const [to,weight] of bucket.entries||[])expected.push([JSON.stringify(from),JSON.stringify(to),String(weight)]);
        } else {
          for(const value of bucket.items||[]) {
            if(data.id===743) {
              const [to,weight]=objectFor(value,heap)!.items!;
              expected.push([JSON.stringify(from),JSON.stringify(to),String(weight)]);
            } else expected.push([JSON.stringify(from),JSON.stringify(value),null]);
          }
        }
      }
      const actual=graph.edges.flatMap(edge=>{
        const link=[edge.from,edge.to,edge.weight??null];
        return !(edge.directed??graph.directed)&&edge.from!==edge.to?[link,[edge.to,edge.from,edge.weight??null]]:[link];
      });
      expect(sorted(actual),`${key}: ${step.label}`).toEqual(sorted(expected));
    }
  }
});

it('adds direct and indirect Course Schedule IV links only when reach becomes true',()=>{
  const data=trace('1462');
  for(const example of data.examples) {
    const heap:TraceHeap={};
    for(const step of example.steps) {
      Object.assign(heap,step.heap);
      const rows=objectFor(step.state.reach,heap)?.items||[];
      const expected=rows.flatMap((row,from)=>(objectFor(row,heap)?.items||[]).flatMap((connected,to)=>connected===true?[[String(from),String(to)]]:[]));
      const graph=graphModels(data.id,step.input,step.state,heap)[0];
      expect(sorted(graph.edges.map(edge=>[edge.from,edge.to]))).toEqual(sorted(expected));
    }
  }
});

it.each(['323','684','721','1584','1489','2709'])('%s shows live union-find parents, never predicted connections',key=>{
  const data=trace(key);
  for(const example of data.examples) {
    const heap:TraceHeap={};
    for(const [index,step] of example.steps.entries()) {
      Object.assign(heap,step.heap);
      const graph=graphModels(data.id,step.input,step.state,heap)[0];
      const parent=objectFor(step.state.parent,heap);
      const entries:[TraceValue,TraceValue][]=parent?.entries||parent?.items?.map((value,i)=>[i,value])||[];
      const keys=new Set(graph.nodes.map(node=>node.key));
      const expected=entries.map(([a,b])=>[JSON.stringify(a),JSON.stringify(b)]).filter(([a,b])=>a!==b&&keys.has(a)&&keys.has(b));
      expect(sorted(graph.edges.map(edge=>[edge.from,edge.to]))).toEqual(sorted(expected));
      if(index===0)expect(graph.edges).toEqual([]);
    }
  }
});

it('keeps row and column graphs separate, and preserves completed helpers without leaking future edges',()=>{
  const data=trace('2392');
  for(const example of data.examples) {
    const contexts=graphContextsFor(data.id,example.steps),heap:TraceHeap={};
    const expected:Record<string,string[][]>={rowConditions:[],colConditions:[]};
    for(const [index,step] of example.steps.entries()) {
      Object.assign(heap,step.heap);
      for(const name of Object.keys(expected)) {
        if(JSON.stringify(step.state.conditions)===JSON.stringify(step.input[name])&&step.kind==='operation'&&step.label==='graph[before].push(after)') {
          expected[name].push([String(step.state.before),String(step.state.after)]);
        }
      }
      const models=graphModels(data.id,step.input,step.state,heap,contexts[index]);
      for(const graph of models)expect(sorted(graph.edges.map(edge=>[edge.from,edge.to]))).toEqual(sorted(expected[graph.title]));
    }
    const first=example.steps[0];
    expect(graphModels(data.id,first.input,first.state,first.heap,contexts[0]).every(graph=>graph.edges.length===0)).toBe(true);
  }
});

it('creates Word Ladder connections only after words share an inserted wildcard bucket',()=>{
  const data=trace('127');
  for(const example of data.examples) {
    const heap:TraceHeap={};
    for(const step of example.steps) {
      Object.assign(heap,step.heap);
      const buckets=(objectFor(step.state.neighbors,heap)?.entries||[]).map(([,ref])=>objectFor(ref,heap)!.items!);
      const graph=graphModels(data.id,step.input,step.state,heap)[0];
      for(const edge of graph.edges) {
        const a=JSON.parse(edge.from),b=JSON.parse(edge.to);
        expect(buckets.some(bucket=>bucket.includes(a)&&bucket.includes(b))).toBe(true);
      }
      if(!buckets.length)expect(graph.edges).toEqual([]);
    }
  }
});

it('reveals lock nodes and transitions only when recorded, with stable positions as neighbors appear',()=>{
  const data=trace('752');
  for(const example of data.examples) {
    const contexts=graphContextsFor(data.id,example.steps),heap:TraceHeap={};
    let current:TraceValue|undefined;let generated=new Set<string>();
    const positions=new Map<string,{x:number;y:number}>();
    for(const [index,step] of example.steps.entries()) {
      Object.assign(heap,step.heap);
      const popped=step.kind==='operation'&&step.label==='queue.shift()'?objectFor(step.value,heap)?.items?.[0]:undefined;
      const queued=objectFor(objectFor(step.state.queue,heap)?.items?.[0],heap)?.items?.[0];
      const nextCurrent=popped??step.state.currentState??current??queued;
      if(current!==nextCurrent){current=nextCurrent;generated=new Set();}
      if(step.kind==='statement'&&step.label.startsWith('const newState ='))generated.add(String(step.state.newState));
      const models=graphModels(data.id,step.input,step.state,heap,contexts[index]);
      if(current===undefined){expect(models).toEqual([]);continue;}
      const graph=models[0];
      expect(sorted(graph.nodes.map(node=>node.value))).toEqual(sorted([current,...generated]));
      expect(sorted(graph.edges.map(edge=>JSON.parse(edge.to)))).toEqual(sorted([...generated]));
      const layout=layoutGraph(graph);
      expect([layout.width,layout.height]).toEqual([510,510]);
      for(const [key,point] of layout.positions) {
        const slot=`${current}/${key}`;
        if(positions.has(slot))expect(point).toEqual(positions.get(slot));
        positions.set(slot,point);
      }
    }
    const first=example.steps[0];
    expect(graphModels(data.id,first.input,first.state,first.heap,contexts[0])).toEqual([]);
  }
});

it.each(['787','997'])('%s labels already-existing input connections explicitly',key=>{
  const data=trace(key),steps=data.examples[0].steps,step=steps[0];
  const graph=graphModels(data.id,step.input,step.state,materialize(steps,0).heap)[0];
  expect(graph.title).toMatch(/^Input /);
  expect(graph.edges.length).toBeGreaterThan(0);
});

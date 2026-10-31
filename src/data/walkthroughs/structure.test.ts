import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { neetcodeTopics } from '../neetcode250';
import { ExecutionTrace, TraceHeap, materialize } from './execution';
import { collectStructure, layoutTree, nodeChanged, suspendedValuesFor } from './structure';
import { graphContextsFor, graphKey, graphModels, layoutGraph } from './graphs';

const trace=(id:number)=>JSON.parse(readFileSync(`src/data/walkthroughs/generated/${id}.json`,'utf8')) as ExecutionTrace;
const treeIds=neetcodeTopics.find(topic=>topic.name==='Trees')!.problems.map(problem=>problem.id);

describe('tree geometry and snapshots',()=>{
  it.each(treeIds)('preserves child direction, spacing, identities and source links at every step of #%i',(id)=>{
    for(const example of trace(id).examples) {
      const heap:TraceHeap={},callers=suspendedValuesFor(example.steps);
      for(const [index,step] of example.steps.entries()) {
        Object.assign(heap,step.heap);
        const nodes=collectStructure([...Object.values(step.input),...callers[index],...Object.values(step.state),step.value],heap);
        if(!nodes.size)continue;
        const layout=layoutTree(nodes),positions=new Map(layout.occurrences.map(node=>[node.key,node]));
        expect(new Set(layout.occurrences.flatMap(node=>node.id?[node.id]:[]))).toEqual(new Set(nodes.keys()));
        for(const edge of layout.edges) {
          const parent=positions.get(edge.from)!,child=positions.get(edge.to)!;
          expect(child.y).toBeGreaterThan(parent.y);
          if(edge.label==='left')expect(child.x).toBeLessThan(parent.x);
          if(edge.label==='right')expect(child.x).toBeGreaterThan(parent.x);
          expect(heap[parent.id!].fields?.[edge.label]).toEqual(child.id?{$ref:child.id}:null);
        }
        for(const [i,node] of layout.occurrences.entries()) {
          expect(node.x).toBeGreaterThanOrEqual(22);expect(node.x).toBeLessThanOrEqual(layout.width-22);
          expect(node.y).toBeGreaterThanOrEqual(22);expect(node.y+38).toBeLessThanOrEqual(layout.height);
          for(const other of layout.occurrences.slice(i+1))expect(Math.hypot(node.x-other.x,node.y-other.y)).toBeGreaterThanOrEqual(60);
        }
      }
    }
  });
  it('reserves the missing side of a one-child branch, independent of traversal focus',()=>{
    const heap:TraceHeap={o1:{kind:'tree',fields:{val:2,left:{$ref:'o2'},right:null}},o2:{kind:'tree',fields:{val:1,left:null,right:null}}};
    const first=layoutTree(collectStructure([{$ref:'o1'}],heap));
    const focused=layoutTree(collectStructure([{$ref:'o2'},{$ref:'o1'}],heap));
    expect(focused).toEqual(first);
    expect(first.occurrences.find(node=>node.label==='left')!.x).toBeLessThan(first.occurrences.find(node=>node.id==='o1')!.x);
    expect(first.occurrences.find(node=>node.label==='right')!.id).toBeUndefined();
  });
  it('highlights only the node whose own value or link changed',()=>{
    const before:TraceHeap={o1:{kind:'tree',fields:{val:1,left:{$ref:'o2'},right:null}},o2:{kind:'tree',fields:{val:2,left:null,right:null}}};
    const after:TraceHeap={...before,o2:{kind:'tree',fields:{val:3,left:null,right:null}}};
    expect(nodeChanged('o2',before,after)).toBe(true);
    expect(nodeChanged('o1',before,after)).toBe(false);
  });
});

describe('graph semantics and geometry',()=>{
  it('shows equation ratios in both directions',()=>{
    const steps=trace(399).examples[0].steps;
    const index=steps.findIndex(step=>step.kind==='operation'&&step.label.startsWith('graph.get(b).set'));
    const step=steps[index],models=graphModels(399,step.input,step.state,materialize(steps,index).heap);
    expect(models[0].directed).toBe(true);
    expect(models[0].edges).toContainEqual({from:graphKey('a'),to:graphKey('b'),weight:'2'});
    expect(models[0].edges).toContainEqual({from:graphKey('b'),to:graphKey('a'),weight:'0.5'});
  });
  it('shows both constraint graphs and all nodes, including isolates',()=>{
    const step=trace(2392).examples[0].steps[0],models=graphModels(2392,step.input,step.state,step.heap);
    expect(models.map(model=>model.title)).toEqual(['rowConditions','colConditions']);
    for(const model of models)expect(model.nodes.map(node=>node.value)).toEqual([1,2,3]);
    expect(models[0].edges).toEqual([]);
    expect(models[1].edges).toEqual([]);
  });
  it('keeps course prerequisite directions specific to each problem statement',()=>{
    for(const id of [207,210,1462]) {
      const steps=trace(id).examples[0].steps;
      const index=steps.findIndex((step,index)=>graphModels(id,step.input,step.state,materialize(steps,index).heap)[0].edges.length>0);
      const step=steps[index],heap=materialize(steps,index).heap;
      const row=heap[(heap[(step.input.prerequisites as {$ref:string}).$ref].items![0] as {$ref:string}).$ref].items!;
      const model=graphModels(id,step.input,step.state,heap)[0];
      expect(model.edges[0].from).toBe(graphKey(row[id===1462?0:1]));
      expect(model.edges[0].to).toBe(graphKey(row[id===1462?1:0]));
    }
  });
  it('preserves Cartesian point positions instead of replacing them with a circle',()=>{
    const step=trace(1584).examples[0].steps[0],graph=graphModels(1584,step.input,step.state,step.heap)[0];
    const {positions}=layoutGraph(graph);
    expect(positions.get('0')!.x).toBeLessThan(positions.get('1')!.x);
    expect(positions.get('0')!.y).toBeGreaterThan(positions.get('1')!.y);
    expect(positions.get('0')!.y).toBe(positions.get('4')!.y);
  });
  it('creates connected representations for implicit graph problems',()=>{
    for(const id of [127,752,1584,269,721,2709]) {
      const data=trace(id),steps=data.examples[0].steps,heap:TraceHeap={},contexts=graphContextsFor(id,steps);
      let connected=false;
      steps.forEach((step,index)=>{
        Object.assign(heap,step.heap);
        const models=graphModels(id,step.input,step.state,heap,contexts[index]);
        if(id===752&&!models.length)return;
        expect(models.length).toBeGreaterThan(0);
        expect(models[0].nodes.length).toBeGreaterThan(0);
        if(index===0)expect(models[0].edges).toEqual([]);
        connected ||= models[0].edges.length>0;
      });
      expect(connected).toBe(true);
    }
  });
  it.each(neetcodeTopics.filter(topic=>topic.name.includes('Graphs')).flatMap(topic=>topic.problems.map(problem=>problem.id)))('keeps graph endpoints and node positions valid for every recorded step of #%i',(id)=>{
    for(const example of trace(id).examples) {
      const heap:TraceHeap={};
      for(const step of example.steps) {
        Object.assign(heap,step.heap);
        for(const graph of graphModels(id,step.input,step.state,heap)) {
          const {positions,width,height}=layoutGraph(graph);
          for(const edge of graph.edges){expect(positions.has(edge.from)).toBe(true);expect(positions.has(edge.to)).toBe(true);}
          const values=[...positions.values()];
          for(const [index,point] of values.entries()) {
            expect(point.x).toBeGreaterThanOrEqual(22);expect(point.x+22).toBeLessThanOrEqual(width);
            expect(point.y).toBeGreaterThanOrEqual(22);expect(point.y+22).toBeLessThanOrEqual(height);
            for(const other of values.slice(index+1))expect(Math.hypot(point.x-other.x,point.y-other.y)).toBeGreaterThanOrEqual(44);
          }
        }
      }
    }
  });
});

import { useEffect, useMemo, useState } from 'react';
import { ExecutionTrace, ExecutionStep, formatValue, hasNodes, materialize, objectFor, truthy, valueChanged } from '../../data/walkthroughs/execution';
import { useWalkthroughHighlight } from '../../hooks/useWalkthroughHighlight';
import WalkthroughCode from './WalkthroughCode';
import ExecutionValues from './ExecutionValues';
import ExecutionDiagram from './ExecutionDiagram';
import ExecutionGraph from './ExecutionGraph';
import './traversalWalkthrough.css';
import './executionWalkthrough.css';

const loaders = import.meta.glob<{default: ExecutionTrace}>('../../data/walkthroughs/generated/*.json');
const cache = new Map<number, Promise<ExecutionTrace>>();
export const hasExecutionWalkthrough = (id: number) => !!loaders[`../../data/walkthroughs/generated/${id}.json`];
function loadTrace(id: number) {
  if (!cache.has(id)) cache.set(id, loaders[`../../data/walkthroughs/generated/${id}.json`]().then(module => module.default).catch(error => {cache.delete(id);throw error;}));
  return cache.get(id)!;
}

export default function ExecutionWalkthrough({ id, code }: { id: number; code: string }) {
  const [trace, setTrace] = useState<ExecutionTrace>();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let mounted = true; setError(false); setTrace(undefined);
    loadTrace(id).then(data => { if(mounted) {if(data.code!==code)setError(true);else setTrace(data);} }).catch(()=>{if(mounted)setError(true);});
    return () => {mounted=false;};
  }, [id,code,attempt]);
  if (!trace) return <section className="traversal-walkthrough">
    <WalkthroughCode code={code} lines={[]} enabled={false}/>
    <p className="execution-loading" role="status">{error ? 'The walkthrough could not load.' : 'Loading walkthrough…'}</p>
    {error && <button type="button" className="execution-expand" onClick={()=>setAttempt(value=>value+1)}>Retry</button>}
  </section>;
  return <ExecutionPlayer key={id} trace={trace}/>;
}

function stepTitle(step: ExecutionStep, heap: ReturnType<typeof materialize>['heap']) {
  if(step.kind==='call') return `Call ${step.label}`;
  if(step.kind==='return') return `Return → ${formatValue(step.value,heap)}`;
  if(step.kind==='check') return `${step.label} → ${truthy(step.value) ? 'true' : 'false'}`;
  if(step.kind==='operation') return `${step.label} → ${formatValue(step.value,heap)}`;
  return step.label;
}

export function ExecutionPlayer({ trace }: { trace: ExecutionTrace }) {
  const [exampleIndex,setExampleIndex]=useState(0);
  const [index,setIndex]=useState(0);
  const [highlight,setHighlight]=useWalkthroughHighlight();
  const example=trace.examples[exampleIndex];
  const step=example.steps[index];
  const previous=example.steps[index-1];
  const {heap,previousHeap}=useMemo(()=>materialize(example.steps,index),[example,index]);
  const changed=Object.keys(step.state).filter(name=>valueChanged(previous?.state[name],step.state[name],previousHeap,heap));
  const noop=index>0 && changed.length===0 && !Object.keys(step.heap).length && !['call','return'].includes(step.kind);
  const nodeInput=hasNodes(Object.values(step.input),heap);
  const nodeState=hasNodes(Object.values(step.state),heap);
  const mainInputs=Object.entries(step.input).filter(([name,value])=>name!=='instance'&&!['tree','graph','list','quad'].includes(objectFor(value,heap)?.kind || ''));
  const collections=Object.entries(step.state).filter(([name,value])=>/^(stack|queue|deque|result|answer|path|currentLevel|dp|visited|cloned|sides|this|heap|window)$/.test(name) && objectFor(value,heap));
  const changedNames=changed.filter(name=>!collections.some(([n])=>n===name));
  const done=index===example.steps.length-1;
  const count=example.steps.length;
  return <section className="traversal-walkthrough execution-walkthrough" aria-label={`${trace.title} walkthrough`}>
    <div className="traversal-header">
      <h4>Step-by-Step Walkthrough</h4>
      <select aria-label={`${trace.title} example`} value={exampleIndex} onChange={event=>{setExampleIndex(Number(event.target.value));setIndex(0);}}>
        {trace.examples.map((item,i)=><option value={i} key={i}>{item.name}{trace.examples.filter(e=>e.name===item.name).length>1?` ${i+1}`:''}</option>)}
      </select>
    </div>
    <label className="traversal-highlight-toggle"><input type="checkbox" checked={highlight} onChange={event=>setHighlight(event.target.checked)}/>Highlight code</label>
    <div className="traversal-columns">
      <WalkthroughCode code={trace.code} lines={step.lines || [step.line]} enabled={highlight} noop={noop}/>
      <div className="traversal-live">
        <div className="execution-navigation traversal-controls">
          <input type="range" min={0} max={count-1} value={index} aria-label={`${trace.title} step`} aria-valuetext={`Step ${index+1} of ${count}`} onChange={event=>setIndex(Number(event.target.value))}/>
          <div className="traversal-control-row">
            <div className="traversal-control-group"><button type="button" className="traversal-reset" disabled={index===0} onClick={()=>setIndex(0)}>Reset</button><span className="traversal-step-count">Step {index+1} of {count}</span></div>
            <div className="traversal-control-group"><button type="button" disabled={index===0} onClick={()=>setIndex(i=>i-1)}>Back</button><button type="button" className="traversal-next" disabled={done} onClick={()=>setIndex(i=>i+1)}>Next →</button></div>
          </div>
        </div>
        <div className={`traversal-status ${noop?'is-noop':''}`} role="status" aria-live="polite" aria-atomic="true">
          <div className="traversal-action"><span className="traversal-badge">{noop?'NOOP':step.kind==='check'?'CHECK':step.kind==='return'?'RETURN':'STEP'}</span><strong>{stepTitle(step,heap)}</strong></div>
          <p>{noop?'No data changed.':step.kind==='check'?'Condition evaluated; the next step follows its result.':'State after this step.'}</p>
        </div>
        {step.stack.length>1 && <div className="execution-call-stack" aria-label="Call stack">{step.stack.map((name,i)=><span key={i} className={i===step.stack.length-1?'is-current':''}>{name}</span>)}</div>}
        <div className="execution-data">
          {(nodeInput||nodeState)&&<div className="traversal-panel"><h5>Structure & pointers</h5><ExecutionDiagram roots={step.input} state={step.state} heap={heap} previousHeap={previousHeap}/></div>}
          <ExecutionGraph id={trace.id} input={step.input} state={step.state} heap={heap}/>
          {mainInputs.length>0&&<details className="execution-input" open={!nodeInput&&!nodeState}><summary>Input</summary>{mainInputs.map(([name,value])=><div className="execution-value-block" key={name}><h5>{name}</h5><ExecutionValues value={value} before={previous?.input[name]} heap={heap} previousHeap={previousHeap} pointers={step.state} path={name} indexing={trace.indexing} variant={name==='grid'?(trace.id===994?'oranges':[200,695].includes(trace.id)?'islands':undefined):undefined}/></div>)}</details>}
          {changedNames.length>0&&<div className="traversal-panel execution-changes"><h5>Changes</h5>{changedNames.map(name=><div className="execution-change" key={name}>
            <span className="execution-variable-name">{name}</span>
            <span className="execution-before">{formatValue(previous?.state[name],previousHeap)}</span><span aria-hidden="true">→</span>
            <strong>{formatValue(step.state[name],heap)}</strong>
          </div>)}</div>}
          {collections.map(([name,value])=><div className="traversal-panel" key={name}><h5>{name}</h5><ExecutionValues value={value} before={previous?.state[name]} heap={heap} previousHeap={previousHeap} pointers={step.state} path={name} indexing={trace.indexing}/></div>)}
          <details className="execution-variables"><summary>All variables ({Object.keys(step.state).length})</summary>{Object.entries(step.state).map(([name,value])=><div className="execution-value-block" key={name}><h5>{name}</h5><ExecutionValues value={value} before={previous?.state[name]} heap={heap} previousHeap={previousHeap} pointers={step.state} path={name} indexing={trace.indexing}/></div>)}</details>
          {done&&<div className="traversal-panel traversal-answer" aria-label="Final result"><h5>Result</h5><pre className="execution-result">{JSON.stringify(example.result)}</pre></div>}
        </div>
      </div>
    </div>
  </section>;
}

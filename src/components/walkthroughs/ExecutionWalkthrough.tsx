import { useEffect, useMemo, useState } from 'react';
import { ExecutionTrace, ExecutionStep, VariableGroup, dataStepIndex, formatValue, groupVariables, hasNodes, isReference, materialize, truthy, valueChanged } from '../../data/walkthroughs/execution';
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
  // Show what was removed; a push's return value is the new length, which can
  // otherwise look like the value that was pushed.
  if(step.kind==='operation' && /\.\s*(pop|shift)\(\s*\)$/.test(step.label)) return `${step.label} → ${formatValue(step.value,heap)}`;
  return step.label;
}

export function ExecutionPlayer({ trace }: { trace: ExecutionTrace }) {
  const [exampleIndex,setExampleIndex]=useState(0);
  const [index,setIndex]=useState(0);
  const [highlight,setHighlight]=useWalkthroughHighlight();
  const example=trace.examples[exampleIndex];
  const step=example.steps[index];
  const dataIndex=dataStepIndex(example.steps,index);
  const previous=example.steps[dataIndex-1];
  const {heap,previousHeap}=useMemo(()=>materialize(example.steps,dataIndex),[example,dataIndex]);
  const variableOrder=useMemo(()=>[...new Set(example.steps.flatMap(frame=>Object.keys(frame.state)))],[example]);
  const {variables,inputs,collections}=groupVariables(step,heap,variableOrder);
  const nodeInput=hasNodes(Object.values(step.input),heap);
  const nodeState=hasNodes(Object.values(step.state),heap);
  const done=index===example.steps.length-1;
  const count=example.steps.length;
  function collectionValues(group: VariableGroup, input = false) {
    const {names,value}=group, name=names[0];
    const accesses=names.flatMap(alias=>trace.indexing?.[alias]?[trace.indexing[alias]]:[]);
    const indexing={...trace.indexing,[name]:{
      indices:[...new Set(accesses.flatMap(access=>access.indices))],
      cells:accesses.flatMap(access=>access.cells).filter((pair,i,all)=>all.findIndex(other=>other[0]===pair[0]&&other[1]===pair[1])===i),
    }};
    const before=input&&previous&&!Object.prototype.hasOwnProperty.call(previous.state,name)?previous.input[name]:previous?.state[name];
    return <ExecutionValues value={value} before={before} heap={heap} previousHeap={previousHeap} pointers={step.state} path={name} indexing={indexing} variant={names.includes('grid')?(trace.id===994?'oranges':[200,695].includes(trace.id)?'islands':undefined):undefined}/>;
  }
  return <section className="traversal-walkthrough execution-walkthrough" aria-label={`${trace.title} walkthrough`}>
    <div className="traversal-header">
      <h4>Step-by-Step Walkthrough</h4>
      <select aria-label={`${trace.title} example`} value={exampleIndex} onChange={event=>{setExampleIndex(Number(event.target.value));setIndex(0);}}>
        {trace.examples.map((item,i)=><option value={i} key={i}>{item.name}{trace.examples.filter(e=>e.name===item.name).length>1?` ${i+1}`:''}</option>)}
      </select>
    </div>
    <label className="traversal-highlight-toggle"><input type="checkbox" checked={highlight} onChange={event=>setHighlight(event.target.checked)}/>Highlight code</label>
    <div className="traversal-columns">
      <WalkthroughCode code={trace.code} lines={step.lines || [step.line]} enabled={highlight}/>
      <div className="traversal-live">
        <div className="execution-navigation traversal-controls">
          <input type="range" min={0} max={count-1} value={index} aria-label={`${trace.title} step`} aria-valuetext={`Step ${index+1} of ${count}`} onChange={event=>setIndex(Number(event.target.value))}/>
          <div className="traversal-control-row">
            <div className="traversal-control-group"><button type="button" className="traversal-reset" disabled={index===0} onClick={()=>setIndex(0)}>Reset</button><span className="traversal-step-count">Step {index+1} of {count}</span></div>
            <div className="traversal-control-group"><button type="button" disabled={index===0} onClick={()=>setIndex(i=>i-1)}>Back</button><button type="button" className="traversal-next" disabled={done} onClick={()=>setIndex(i=>i+1)}>Next →</button></div>
          </div>
        </div>
        <div className="traversal-status" role="status" aria-live="polite" aria-atomic="true">
          <div className="traversal-action"><span className="traversal-badge">{step.kind==='check'?'CHECK':step.kind==='return'?'RETURN':step.kind==='call'?'CALL':['iterate','loop-end'].includes(step.kind)?'LOOP':step.kind==='break'?'BREAK':step.kind==='continue'?'CONTINUE':'STEP'}</span><strong>{stepTitle(step,heap)}</strong></div>
        </div>
        {step.stack.length>1 && <div className="execution-call-stack" aria-label="Call stack">{step.stack.map((name,i)=><span key={i} className={i===step.stack.length-1?'is-current':''}>{name}</span>)}</div>}
        <div className="execution-data">
          {variables.length>0&&<section className="traversal-panel execution-state" aria-label="Current variables"><h5>Variables</h5><div className="execution-variable-grid">{variables.map(([name,value])=>{
            const changed=valueChanged(previous?.state[name],value,previousHeap,heap);
            const before=formatValue(previous?.state[name],previousHeap),after=formatValue(value,heap);
            const showBefore=changed&&previous&&Object.prototype.hasOwnProperty.call(previous.state,name)&&before!==after;
            return <div className={`execution-change ${changed?'is-changed':''}`} role="group" aria-label={name} data-variable-names={JSON.stringify([name])} key={name}>
              <span className="execution-variable-name">{name}</span>
              {showBefore?<><span className="execution-before">{before}</span><span>→</span></>:<span>=</span>}
              <strong>{after}</strong>
            </div>;
          })}</div></section>}
          {(nodeInput||nodeState)&&<div className="traversal-panel"><h5>Structure & pointers</h5><ExecutionDiagram roots={step.input} state={step.state} heap={heap} previousHeap={previousHeap}/></div>}
          <ExecutionGraph id={trace.id} input={step.input} state={step.state} heap={heap}/>
          {inputs.length>0&&<section className="traversal-panel execution-input" aria-label="Input values"><h5>Input</h5>{inputs.map(group=><div className="execution-value-block" role="group" aria-label={group.names.join(', ')} data-variable-names={JSON.stringify(group.names)} key={isReference(group.value)?group.value.$ref:group.names[0]}><h5>{group.names.join(' · ')}</h5>{collectionValues(group,true)}</div>)}</section>}
          {collections.map(group=><section className="traversal-panel" role="group" aria-label={group.names.join(', ')} data-variable-names={JSON.stringify(group.names)} key={isReference(group.value)?group.value.$ref:group.names[0]}><h5>{group.names.join(' · ')}</h5>{collectionValues(group)}</section>)}
          {done&&<div className="traversal-panel traversal-answer" aria-label="Final result"><h5>Result</h5><pre className="execution-result">{JSON.stringify(example.result)}</pre></div>}
        </div>
      </div>
    </div>
  </section>;
}

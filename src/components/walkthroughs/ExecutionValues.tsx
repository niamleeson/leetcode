import { useState } from 'react';
import { ExecutionTrace, TraceHeap, TraceValue, formatValue, isReference, objectFor, valueChanged } from '../../data/walkthroughs/execution';

interface ValueProps {
  value: TraceValue | undefined;
  before?: TraceValue;
  heap: TraceHeap;
  previousHeap: TraceHeap;
  pointers?: Record<string, TraceValue>;
  depth?: number;
  variant?: 'oranges' | 'islands';
  path?: string;
  indexing?: ExecutionTrace['indexing'];
}

export default function ExecutionValues({ value, before, heap, previousHeap, pointers = {}, depth = 0, variant, path='', indexing={} }: ValueProps) {
  const [expanded, setExpanded] = useState(false);
  // JavaScript string indices address UTF-16 units, not Unicode code points.
  const object = typeof value === 'string' && value.length > 1 ? { kind:'array' as const, items:value.split('') } : objectFor(value, heap);
  const old = typeof before === 'string' && before.length > 1 ? { kind:'array' as const, items:before.split('') } : objectFor(before, previousHeap);
  const changed = (first: TraceValue | undefined, second: TraceValue | undefined) => valueChanged(first, second, previousHeap, heap);
  const access=indexing[path];
  if (object?.items && depth < 2) {
    const items = object.items;
    const matrixLayout=!!variant||!!access?.cells.length||['grid','matrix','board','rooms','obstacleGrid'].includes(path);
    const isGrid = matrixLayout && items.length > 0 && items.length <= 20 && items.every(item => objectFor(item, heap)?.kind === 'array') && items.every(item => (objectFor(item, heap)?.items?.length ?? 0) <= 20);
    const cells=(access?.cells||[]).filter(([row,col])=>typeof pointers[row]==='number'&&typeof pointers[col]==='number');
    if (isGrid) return <div>
      {variant&&<p className="execution-grid-legend">{variant==='oranges'?'0 empty · 1 fresh · 2 rotten':'0 water · 1 land'}</p>}
      {cells.map(([row,col])=>{
        const r=pointers[row] as number,c=pointers[col] as number;
        const outside=r<0||r>=items.length||c<0||c>=(objectFor(items[0],heap)?.items?.length??0);
        return <p key={`${row},${col}`} className={`execution-grid-legend ${outside?'is-outside':''}`}>{row}, {col} = ({r}, {c}){outside?' · outside grid':''}</p>;
      })}
      <div className="execution-matrix" role="table" aria-label="Grid values">
      {items.map((row, r) => <div role="row" className="execution-matrix-row" key={r}><span className="execution-index">{r}</span>{objectFor(row, heap)!.items!.map((cell, c) => {
        const oldRow = old?.items?.[r];
        const oldCell = objectFor(oldRow, previousHeap)?.items?.[c];
        const marked = changed(oldCell, cell);
        const pointed=cells.findIndex(([row,col])=>pointers[row]===r&&pointers[col]===c);
        return <span role="cell" key={c} className={`execution-cell ${variant?`${variant}-value-${cell}`:''} ${marked ? 'is-changed' : ''} ${pointed===0?'is-pointed':pointed>0?'is-checked':''}`} title={`[${r}][${c}]${marked ? `: ${formatValue(oldCell, previousHeap)} → ${formatValue(cell, heap)}` : ''}`}>
          <small>{c}</small>{formatValue(cell, heap)}
        </span>;
      })}</div>)}
    </div></div>;
    const indices = items.map((_,index)=>index);
    const pointerNames = object.kind==='set'?[]:Object.entries(pointers).filter(([name,v]) => typeof v === 'number' && Number.isInteger(v) && access?.indices.includes(name));
    // Keep every changed item visible even in large fixed-size tables.
    const interesting = indices.filter(index => changed(old?.items?.[index], items[index]) && old?.items !== undefined);
    const pointed=pointerNames.map(([,value])=>value as number).filter(index=>index>=0&&index<items.length);
    const visible = expanded || items.length <= 24 ? indices : [...new Set([...indices.slice(0,8), ...interesting,...pointed])].sort((a,b)=>a-b);
    return <div>
      <div className="execution-array" role="list" aria-label={object.kind==='set'?'Set members':'Values by index'}>
        {!items.length && <span className="execution-empty">{object.kind === 'set' ? '∅' : '[]'}</span>}
        {visible.map(index => <div role="listitem" className={`execution-cell ${changed(old?.items?.[index], items[index]) ? 'is-changed' : ''}`} key={index}>
          {object.kind!=='set'&&<small>{index}</small>}
          <span>{formatValue(items[index], heap)}</span>
          <span className="execution-pointer">{pointerNames.filter(([,v])=>v===index).map(([name])=>name).join(' · ')}</span>
        </div>)}
      </div>
      {pointerNames.filter(([,v])=>(v as number)<0||(v as number)>=items.length).map(([name,v])=><p className="execution-grid-legend is-outside" key={name}>{name} = {String(v)} · outside array</p>)}
      {items.length>24 && <button type="button" className="execution-expand" onClick={()=>setExpanded(!expanded)}>{expanded ? 'Show fewer' : `Show all ${items.length} items`} {!expanded && `(${visible.length} shown; all changes included)`}</button>}
    </div>;
  }
  if (object?.entries && depth < 2) return <div className="execution-map">
    {!object.entries.length && <span className="execution-empty">∅</span>}
    {object.entries.map(([key, v], index) => {
      const oldValue = old?.entries?.find(([k])=>JSON.stringify(k)===JSON.stringify(key))?.[1];
      return <div key={index} className={`execution-map-entry ${changed(oldValue,v)?'is-changed':''}`}><span>{formatValue(key,heap)}</span><span>→</span><span>{formatValue(v,heap)}</span></div>;
    })}
  </div>;
  if (object?.fields && object.kind === 'object' && depth < 2) return <div className="execution-fields">
    {Object.entries(object.fields).map(([name,v])=><div key={name}><span className="execution-variable-name">{name}</span><ExecutionValues value={v} before={old?.fields?.[name]} heap={heap} previousHeap={previousHeap} depth={depth+1} pointers={pointers} path={`${path}.${name}`} indexing={indexing}/></div>)}
  </div>;
  return <span className="execution-scalar">{formatValue(value,heap)}{isReference(value) && object?.kind === 'list' && <span className="execution-empty"> → {formatValue(object.fields?.next, heap)}</span>}</span>;
}

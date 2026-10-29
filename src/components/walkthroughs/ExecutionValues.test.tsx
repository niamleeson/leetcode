import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ExecutionValues from './ExecutionValues';
import { TraceHeap } from '../../data/walkthroughs/execution';

afterEach(cleanup);
describe('data markers follow source indexing',()=>{
  it('does not mark a rank or window size as an array position',()=>{
    const heap:TraceHeap={array:{kind:'array',items:[1,2,3,4]}};
    render(<ExecutionValues value={{$ref:'array'}} heap={heap} previousHeap={heap} path="nums" pointers={{left:0,right:3,k:2}} indexing={{nums:{indices:['left','right'],cells:[]}}}/>);
    expect([...document.querySelectorAll('.execution-pointer')].map(e=>e.textContent).filter(Boolean)).toEqual(['left','right']);
    expect(screen.queryByText('k')).toBeNull();
  });
  it('keeps a queue of coordinates separate from the grid being traversed',()=>{
    const heap:TraceHeap={queue:{kind:'array',items:[{$ref:'a'},{$ref:'b'}]},a:{kind:'array',items:[0,1]},b:{kind:'array',items:[1,0]}};
    render(<ExecutionValues value={{$ref:'queue'}} heap={heap} previousHeap={heap} path="queue" pointers={{r:0,c:1,neighborRow:-1,neighborCol:1}} indexing={{grid:{indices:['r'],cells:[['r','c'],['neighborRow','neighborCol']]}}}/>);
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByText(/outside grid/)).toBeNull();
  });
  it('marks only actual matrix accesses and reports an out-of-bounds neighbor',()=>{
    const heap:TraceHeap={grid:{kind:'array',items:[{$ref:'row'}]},row:{kind:'array',items:[1,2]}};
    render(<ExecutionValues value={{$ref:'grid'}} heap={heap} previousHeap={heap} path="grid" pointers={{r:0,c:1,neighborRow:-1,neighborCol:1}} indexing={{grid:{indices:['r'],cells:[['r','c'],['neighborRow','neighborCol']]}}}/>);
    expect(screen.getByText(/neighborRow, neighborCol = \(-1, 1\) · outside grid/)).toBeTruthy();
    expect(document.querySelectorAll('.is-pointed')).toHaveLength(1);
  });
  it('keeps indexed positions visible beyond the first eight cells',()=>{
    const heap:TraceHeap={array:{kind:'array',items:Array.from({length:30},(_,i)=>i)}};
    render(<ExecutionValues value={{$ref:'array'}} before={{$ref:'array'}} heap={heap} previousHeap={heap} path="nums" pointers={{left:28}} indexing={{nums:{indices:['left'],cells:[]}}}/>);
    expect(screen.getByText('left')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(9);
  });
  it('uses JavaScript UTF-16 string indices',()=>{
    render(<ExecutionValues value="a😀b" heap={{}} previousHeap={{}} path="s" pointers={{right:3}} indexing={{s:{indices:['right'],cells:[]}}}/>);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('right').parentElement?.textContent).toContain('"b"');
  });
  it('labels initial grid values without a missing-value dash or transition arrow',()=>{
    const heap:TraceHeap={grid:{kind:'array',items:[{$ref:'row'}]},row:{kind:'array',items:[1,2]}};
    render(<ExecutionValues value={{$ref:'grid'}} heap={heap} previousHeap={{}} path="grid"/>);
    expect(screen.getAllByRole('cell').map(e=>e.title)).toEqual(['[0][0] = 1','[0][1] = 2']);
  });
  it('uses before/after values only for existing grid cells',()=>{
    const heap:TraceHeap={grid:{kind:'array',items:[{$ref:'row'}]},row:{kind:'array',items:[2,1]}};
    const previousHeap:TraceHeap={...heap,row:{kind:'array',items:[1,1]}};
    render(<ExecutionValues value={{$ref:'grid'}} before={{$ref:'grid'}} heap={heap} previousHeap={previousHeap} path="grid"/>);
    expect(screen.getAllByRole('cell').map(e=>e.title)).toEqual(['[0][0]: 1 → 2','[0][1]']);
  });
  it('shows an empty object explicitly instead of a blank data panel',()=>{
    render(<ExecutionValues value={{$ref:'graph'}} heap={{graph:{kind:'object',fields:{}}}} previousHeap={{}}/>);
    expect(screen.getByText('{}')).toBeTruthy();
  });
});

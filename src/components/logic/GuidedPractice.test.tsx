import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GuidedPractice from './GuidedPractice';
import type { GuidedLesson } from '../../data/logic/guided-types';
import type { LogicProblem } from '../../data/logic/types';
const mocks = vi.hoisted(() => ({ load: vi.fn(), runner: vi.fn() }));
vi.mock('../../data/logic/guided', () => ({ loadGuidedLesson: mocks.load }));
vi.mock('./GuidedCodeRunner', () => ({ default: (props: {code:string,language:string}) => { mocks.runner(props); return <section aria-label="Completed test code">{props.language}: {props.code}</section>; } }));
vi.mock('./SolutionReveal', () => ({ default: () => <button>Reveal solution</button> }));
const problem: LogicProblem={id:1,title:'Two Sum',difficulty:'Easy',topic:'Arrays',description:'Find two different indices.',examples:[],starter:'def twoSum(nums, target):\n    pass',parameters:[],interfaces:[],fixtures:[{entry:'twoSum',name:'Example',args:[[2,7],9],expected:[0,1]}],validation:{kind:'practice-cases',count:1,adversarialCount:0}};
function lesson(language:'python'|'javascript'='python'):GuidedLesson{return {id:1,title:'Two Sum',language,revision:'v1',source:language==='python'?'def twoSum(nums, target):\n    return [0, 1]':'function twoSum(nums,target) { return [0,1]; }',sourceHash:'hash',patternId:'hash',validation:{correctCases:1,wrongChoices:2,testedWitnesses:2},questions:[
{id:'pattern',stage:'pattern',prompt:'Which approach fits this lesson?',choices:Array.from({length:8},(_,i)=>({id:`pattern-${i}`,label:i===3?'Hash lookup':`Pattern ${i}`,correct:i===3,feedback:i===3?'Remember earlier values for lookup.':'This is a different approach from the one practiced here.'}))},
{id:'structure',stage:'structure',prompt:'How should we organize the solution?',choices:Array.from({length:4},(_,i)=>({id:`structure-${i}`,label:i===1?'Scan and remember':'Plan '+i,correct:i===1,feedback:i===1?'Check before storing.':'That structure misses the goal.'}))},
{id:`implementation-${language}`,stage:'implementation',prompt:'Which result should we return?',context:language==='python'?'def twoSum(nums, target):\n    # Choose the missing statement.':'function twoSum(nums,target) {\n // Choose the missing statement.',line:2,endLine:2,choices:[{id:'right',label:'Right',code:language==='python'?'return [0, 1]':'return [0, 1];',correct:true,feedback:'These are different indices.'},{id:'wrong',label:'Wrong',code:language==='python'?'return [0, 0]':'return [0, 0];',correct:false,feedback:'This reuses one index.',witness:{fixtureIndex:0,name:'Example',input:[[2,7],9],expected:[0,1],actual:[0,0]}},{id:'empty',label:'Empty',code:language==='python'?'return []':'return [];',correct:false,feedback:'An empty answer misses the pair.',witness:{fixtureIndex:0,name:'Example',input:[[2,7],9],expected:[0,1],actual:[]}}]}
]};}
function show(language:'python'|'javascript'='python'){return render(<MemoryRouter><GuidedPractice problem={problem} language={language} onLanguageChange={()=>{}}/></MemoryRouter>);}
async function correctPattern(){fireEvent.click(await screen.findByRole('button',{name:/Hash lookup/}));}
async function correctStructure(){fireEvent.click(await screen.findByRole('button',{name:/Scan and remember/}));}
beforeEach(()=>{localStorage.clear();vi.clearAllMocks();mocks.load.mockImplementation((_id,lang)=>Promise.resolve(lesson(lang)));Element.prototype.scrollIntoView=vi.fn();});afterEach(cleanup);
describe('guided approach-to-code workflow',()=>{
 it('starts with eight patterns and no direct code, keeps wrong choices on the same question, and advances correct ones',async()=>{
  show();const pattern=await screen.findByRole('region',{name:'Approach question'});
  expect(within(pattern).getAllByRole('button')).toHaveLength(8);expect(screen.queryByLabelText('Implementation context')).toBeNull();expect(mocks.runner).not.toHaveBeenCalled();
  fireEvent.click(within(pattern).getByRole('button',{name:/Pattern 0/}));await screen.findByRole('alert');expect(screen.getByText('Question 1 of 3')).toBeTruthy();
  await correctPattern();expect(await screen.findByRole('region',{name:'Structure question'})).toBeTruthy();expect(screen.getByText('Correct')).toBeTruthy();expect(screen.getByText('Question 2 of 3')).toBeTruthy();
  await correctStructure();const implementation=await screen.findByRole('region',{name:'Implementation question'});expect(within(implementation).getAllByRole('button')).toHaveLength(3);
  fireEvent.click(within(implementation).getByRole('button',{name:/return \[0, 0\]/}));expect(screen.getByText('Question 3 of 3')).toBeTruthy();expect(screen.getByText('This reuses one index.')).toBeTruthy();expect(screen.getByText('See the counterexample')).toBeTruthy();expect(mocks.runner).not.toHaveBeenCalled();
  fireEvent.click(within(implementation).getByRole('button',{name:/return \[0, 1\]/}));await screen.findByRole('region',{name:'Completed test code'});expect(mocks.runner.mock.calls[0][0].code).toBe(lesson().source);
 });
 it('persists progress independently for each language and hides stale-language questions while loading',async()=>{
  const first=show();await correctPattern();await correctStructure();first.unmount();
  const js=show('javascript');await screen.findByText('Question 1 of 3');expect(screen.queryByLabelText('Implementation context')).toBeNull();await correctPattern();js.unmount();
  const py=show();await screen.findByText('Question 3 of 3');expect(screen.getByLabelText('Implementation context').textContent).toContain('def twoSum');
  let resolveJS!:(value:GuidedLesson)=>void;mocks.load.mockImplementation(()=>new Promise(resolve=>{resolveJS=resolve;}));
  py.rerender(<MemoryRouter><GuidedPractice problem={problem} language="javascript" onLanguageChange={()=>{}}/></MemoryRouter>);
  expect(screen.queryByLabelText('Implementation context')).toBeNull();expect(screen.getByText('Loading guided questions…')).toBeTruthy();
  resolveJS(lesson('javascript'));await screen.findByText('Question 2 of 3');expect(JSON.parse(localStorage.getItem('lc-guided-progress-1-python')!).answered).toHaveLength(2);
 });
 it('starts fresh for corrupted or obsolete progress, and supports restarting after completion',async()=>{
  localStorage.setItem('lc-guided-progress-1-python',JSON.stringify({revision:'old',answered:['pattern','structure'],attempts:2}));show();await correctPattern();await correctStructure();fireEvent.click(await screen.findByRole('button',{name:/return \[0, 1\]/}));await screen.findByRole('region',{name:'Completed test code'});
  const restart=screen.getByRole('button',{name:'Start again'});restart.focus();fireEvent.click(restart);expect(screen.queryByRole('region',{name:'Completed test code'})).toBeNull();expect(screen.getByText('Question 1 of 3')).toBeTruthy();expect(screen.queryByText('Correct')).toBeNull();expect(document.activeElement).toBe(screen.getByRole('heading',{name:'Which approach fits this lesson?'}));
 });
 it('uses the matching JavaScript implementation and retries a failed lesson download',async()=>{
  mocks.load.mockRejectedValueOnce(new Error('offline'));show('javascript');await screen.findByRole('alert');fireEvent.click(screen.getByRole('button',{name:'Retry questions'}));await correctPattern();await correctStructure();expect(screen.getByLabelText('Implementation context').textContent).toContain('function twoSum');fireEvent.click(await screen.findByRole('button',{name:/return \[0, 1\];/}));await screen.findByRole('region',{name:'Completed test code'});await waitFor(()=>expect(mocks.runner.mock.calls[0][0].language).toBe('javascript'));
 });
});
